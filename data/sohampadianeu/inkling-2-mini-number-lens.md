# sohampadianeu/inkling-2-mini-number-lens

## Resumen

Inkling 2 Mini Number Lens es un artefacto de interpretabilidad mecánica, no un modelo de lenguaje generativo. Lo publica el usuario sohampadianeu (Soham Padia) como su entrada al NDIF Looped Lens Challenge, un certamen centrado en construir "lentes" que lean información interna de modelos con arquitecturas de bucles. El objeto contiene únicamente los pesos de una sonda lineal que se aplica sobre los estados ocultos de un modelo base llamado Inkling 2 Mini, del que la model card no ofrece especificaciones públicas.

El hallazgo técnico que documenta es concreto: en la visita de capa 20 (capa 8, segunda pasada del bucle) y en la posición del signo de interrogación, el modelo base representa el resultado de una suma o resta pequeña como una magnitud y un bit de paridad, no como un token numérico. Por eso el unembedding nunca muestra el dígito. La lente recupera esa información con dos regresiones ridge sobre el vector que lee la propia cabeza del modelo: una para el tamaño (`wm`, `bm`) y otra para la paridad (`wp`, `bp`).

El paquete pesa 103 KB en float32 y se ajustó exclusivamente con 373 preguntas aritméticas generadas ad hoc, sin usar los conjuntos de práctica ni de evaluación del reto. Es relevante para quien investigue representaciones internas de operaciones aritméticas en transformers con bucles, y como ejemplo de sonda interpretativa ligera y reproducible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sonda lineal (dos regresiones ridge) sobre estados ocultos de un transformer con bucles; no es un modelo generativo |
| Parámetros totales | No disponible (la lente contiene `wm`, `bm`, `wp`, `bp`, `mu`, `pcs`, `gate` y `num_ids`; el recuento exacto no se especifica) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Inkling 2 Mini, no documentado) |
| Tipos de cuantización | No aplica; pesos en float32 |
| Idiomas soportados | No disponible (las preguntas de ajuste están en inglés) |
| Licencia | MIT |
| Formato de pesos | Pesos propios del formato de la lente (no safetensors ni GGUF); 103 KB en float32 |

## Arquitectura y entrenamiento

La lente no es una red neuronal entrenada de extremo a extremo, sino un conjunto de read-outs lineales ajustados por regresión ridge sobre `x = final_input(block_states, h)`, es decir, el vector que la cabeza del modelo base consume. El componente `m(x) = x @ wm + bm` estima la magnitud del resultado; `s(x) = x @ wp + bp` se ajusta contra etiquetas ±1 para la paridad, de modo que valores positivos indican impar. Además, la lente incorpora un mecanismo de compuerta: solo emite un número cuando `x` cae dentro de `gate` respecto a la subespacio principal de 8 dimensiones (`pcs`, centrado en `mu`) de los estados con los que se ajustaron los read-outs. `num_ids` mapea los identificadores de token de "0" a "99".

El ajuste se realizó con 373 preguntas aritméticas generadas específicamente para la tarea, con la forma "What is a + b?" y "What is (a - b) * c?", con `a` y `b` entre 1 y 9. Según la model card, ninguna de ellas proviene de los conjuntos de práctica ni de evaluación del NDIF Looped Lens Challenge. No se documentan hiperparámetros de la ridge, semillas, ni detalles del modelo base (número de capas, dimensión oculta, esquema de bucle).

## Capacidades

- Lectura de la magnitud de un resultado aritmético pequeño en la visita de capa 20 del modelo base.
- Lectura de la paridad (impar/par) del mismo resultado mediante un clasificador lineal.
- Detección de cuándo la representación es fiable, mediante la compuerta sobre el subespacio principal de 8 dimensiones.
- Mapeo del resultado a identificadores de token numéricos del 0 al 99 (`num_ids`).
- No genera texto, no razona por sí misma ni soporta tool calling, agentes o multimodalidad: es una sonda de diagnóstico.
- No se documentan capacidades multilingües propias.

## Casos de uso

- Auditoría de representaciones aritméticas: aplicar la lente sobre los estados de Inkling 2 Mini para verificar si el modelo codifica sumas y restas como magnitud y paridad en lugar de como tokens, replicando el hallazgo de la model card.
- Investigación en interpretabilidad de arquitecturas con bucles: usar la visita de capa 20 (capa 8, segunda pasada) como punto de sondeo para estudiar cómo se transforma la información entre pasadas del bucle.
- Validación de sondas lineales: servir como referencia metodológica para ajustar read-outs ridge sobre `final_input(block_states, h)` y comparar con sondas propias.
- Detección de fallos de razonamiento aritmético: la compuerta permite identificar estados en los que la representación interna no cae en el subespacio esperado, lo que puede correlacionar con errores del modelo base.
- Reproducibilidad de retos de interpretabilidad: al haberse ajustado con datos generados ad hoc y no con los conjuntos del NDIF Looped Lens Challenge, permite reproducir el experimento sin contaminación de los datos de evaluación.
- Docencia en mecánica interna de transformers: ejemplo mínimo (103 KB, float32) para explicar cómo se extrae información de estados ocultos con regresiones lineales y compuertas de fiabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para la lente: despreciable (103 KB en float32); el coste real depende del modelo base Inkling 2 Mini, cuyas especificaciones no se documentan.
- GPU recomendadas: no disponibles para el modelo base; la lente en sí puede ejecutarse en CPU.
- Cabe en cualquier GPU de consumo, incluida una RTX 4090 o inferior, siempre que el modelo base quepa en memoria.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI para la lente; se usa como script de análisis sobre los estados ocultos extraídos del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini Number Lens | Sonda lineal de interpretabilidad | 103 KB (float32) | No aplica | MIT | Hugging Face |
| Sondas lineales estándar (logistic/ridge probes) | Clasificador/regresor sobre activaciones | Depende de la dimensión oculta | No aplica | Variable | Implementaciones en literatura y librerías |
| SAE (sparse autoencoders) para interpretabilidad | Diccionario disperso sobre activaciones | Típicamente MB a GB | No aplica | Variable | Repositorios públicos |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo es válida para el modelo base Inkling 2 Mini y, específicamente, para la visita de capa 20 (capa 8, segunda pasada) en la posición del signo de interrogación; no se garantiza su transferencia a otras capas, posiciones o modelos.
- El ajuste se limita a sumas y restas con operandos de 1 a 9 y a la forma "(a - b) * c"; el comportamiento fuera de ese dominio no está documentado.
- La compuerta reduce falsos positivos, pero no se reportan métricas de precisión, recall ni calibración.
- Riesgo de sobreajuste: 373 ejemplos y una sonda de pocos parámetros pueden producir lecturas espurias si los estados de prueba difieren de la distribución de ajuste.
- No se documentan sesgos, idiomas soportados ni comportamiento multilingüe del modelo base.
- La licencia MIT permite uso comercial de la lente, pero no aclara las condiciones del modelo base Inkling 2 Mini, que pueden ser distintas.
- No debe interpretarse como un modelo generativo ni usarse en producción para responder preguntas aritméticas.

## Enlaces

- Hugging Face: https://huggingface.co/sohampadianeu/inkling-2-mini-number-lens
- NDIF Looped Lens Challenge: no disponible en la información proporcionada (referenciado en la model card sin URL).
