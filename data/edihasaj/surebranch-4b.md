# edihasaj/surebranch-4b

## Resumen

Surebranch 4B es un modelo de decisión de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) publicado por el usuario edihasaj en HuggingFace. Su particularidad es que no genera texto: puntúa opciones tipadas a partir de un estado de entrada y devuelve probabilidades sobre las alternativas que se le proporcionan, todo ello en una única pasada hacia delante (one-pass). Está etiquetado como `decision-model`, `structured-output` y `text-classification`, y se apoya en el paquete `decider-ai` para exponer la interfaz de petición tipada y de slots de respuesta.

El modelo es un fine-tune de `Mapika/decider-4b`, que a su vez se apoya en la familia Qwen3.5 text (tag `qwen3_5_text`). Se trata de una release de investigación: incluye pesos fusionados, tokenizador y configuración, pero no el código de entrenamiento ni los conjuntos de datos. El contexto de evaluación confirmado es de como máximo 8.192 tokens de entrada, y únicamente se declara soporte para inglés.

Su relevancia actual reside en el nicho de las decisiones estructuradas dentro de pipelines de agentes y de automatización: en lugar de pedir al modelo una cadena de texto que luego hay que parsear, Surebranch devuelve directamente una distribución de probabilidad sobre opciones predefinidas. Los resultados publicados son resultados de desarrollo abiertos usados para selección de checkpoint, no una evaluación final independiente, y el propio autor advierte de que no ha superado una prueba de paridad fresca frente a Jev.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Qwen3.5 text (según el tag `qwen3_5_text`); no se detallan número de capas, cabezas ni configuración interna |
| Parámetros totales | 4.205.751.296 (aproximadamente 4,2 mil millones) |
| Parámetros activos | no disponible (no se declara que sea una arquitectura MoE) |
| Longitud de contexto | 8.192 tokens de entrada como máximo confirmado en evaluación; contextos más largos no han sido cualificados |
| Tipos de cuantización | no disponible; el repositorio publica pesos en safetensors (tamaño de repo 8,4 GB) |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC BY-SA 4.0 para las contribuciones del fine-tune; los pesos base conservan sus términos Apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Pipeline declarado | text-classification / decision-model |
| Modelo base | Mapika/decider-4b (fine-tune) |
| Compatibilidad de endpoints | `endpoints_compatible` (según tags de HuggingFace) |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como un derivado de la familia Qwen3.5 text mediante el tag `qwen3_5_text`, lo que sitúa la arquitectura en la familia de transformers decoder. No se publican detalles sobre número de capas, dimensión oculta, tipo de atención, ni sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas de alineación como RLHF o DPO. Tampoco se especifica si hubo decodificación especulativa, atención lineal u otras innovaciones de eficiencia.

La innovación funcional declarada no está en la arquitectura, sino en el modo de inferencia: el modelo devuelve probabilidades sobre las opciones proporcionadas en lugar de generar una cadena de respuesta, y lo hace en una sola pasada. Existe una configuración de temperatura por tipo de respuesta, y no se aplica calibración adicional de probabilidades más allá de esa configuración. La interfaz de uso se articula a través del paquete `decider-ai` (versión >= 1.4.0) junto con `transformers >= 5` y `huggingface_hub`, cargando el modelo con `use_graphs=False`. El autor indica que el código de entrenamiento y los datasets no están incluidos, y que el modelo es independiente de TypeSafe AI y no utiliza datos de entrenamiento destilados de Jev.

## Capacidades

- Puntuación de opciones tipadas: recibe preguntas con listas de opciones (por ejemplo, "Which team should handle this?" con `["billing", "support", "sales"]`) y devuelve probabilidades sobre cada alternativa.
- Decisiones compuestas en una sola pasada: puede resolver varias preguntas relacionadas simultáneamente ("packed mode"), con la advertencia de que el orden de las preguntas puede alterar las respuestas.
- Clasificación estructurada: alineado con el pipeline `text-classification` y con el tag `structured-output`, orientado a decisiones discretas y no a texto libre.
- Evaluación de resultados de pruebas de software: en el conjunto de desarrollo (250 programas Python ejecutados dos veces) responde preguntas sobre recuento exacto de tests que pasan, si pasa la suite completa y aserciones individuales.
- Decisión generalista multicategoría: 250 decisiones separadas de siete familias evaluadas con una precisión macro de 88,9 % ajustada por familia.
- Tool calling / function calling: no disponible (no se menciona soporte explícito).
- Capacidades de agente y razonamiento multi-paso: no disponible como capacidad declarada; el modelo no ejecuta código ni genera cadenas de razonamiento.
- Capacidades multilingües: limitadas al inglés; no se declaran otros idiomas.
- Capacidades especiales: modo one-pass, salida de probabilidades en lugar de texto, ausencia de generación de cadenas de respuesta. No se declara visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Enrutado de tickets de soporte: el modelo puede clasificar una incidencia en categorías como facturación, soporte o ventas a partir de una descripción breve, devolviendo una probabilidad por categoría que permite aplicar umbrales de derivación automática; es adecuado porque la decisión es discreta y no requiere texto generado.
- Triaje de resultados de integración continua: a partir del resultado de una suite de pruebas, el modelo responde si la suite pasa y cuántos tests pasan exactamente, lo que permite decidir si se bloquea un merge; conviene tener en cuenta que el recuento exacto es la tarea con peor rendimiento medido (46,8 %).
- Decisión de escalado en pipelines de agentes: ante un estado intermedio, responde a preguntas binarias del tipo "does this need a refund review?" con `["no", "yes"]`, lo que permite encadenar ramas condicionales sin parsear lenguaje natural.
- Verificación de salidas estructuradas en pipelines RAG: se puede usar para decidir si una respuesta recuperada satisface o no un criterio tipado antes de mostrarla al usuario, aprovechando que la salida es una probabilidad y no una cadena.
- Evaluación automática de aserciones en agentes de código: con 82,00 % de acierto en aserciones individuales en modo packed (2.500 casos), sirve como señal de validación rápida de un programa generado antes de ejecutarlo.
- Moderación y clasificación de contenido por categorías: dado un texto y un conjunto cerrado de etiquetas, devuelve la distribución sobre ellas, lo que encaja en sistemas de moderación donde se exige una etiqueta y una confianza asociada.
- Enrutado de intenciones en asistentes conversacionales en inglés: para elegir entre un conjunto fijo de acciones disponibles sin coste de decodificación de texto, en escenarios donde el contexto se mantiene por debajo de los 8.192 tokens.
- Clasificación de formularios y solicitudes (por ejemplo, seguros o reclamaciones): decisiones multicategoría tipadas sobre datos textuales cortos, con la ventaja de una única pasada por pregunta.

## Benchmarks y rendimiento

Resultados de desarrollo medidos y publicados por el autor. El conjunto de código contiene 250 programas Python ejecutados dos veces, con una pregunta de recuento, una pregunta de suite completa y diez aserciones individuales por programa. El modo ordinario pregunta una aserción seleccionada por hash por programa; el modo packed pregunta las doce preguntas juntas. Son resultados de desarrollo usados para selección de modelo, no una evaluación final independiente.

| Tarea | Casos | Precisión |
|---|---:|---:|
| Recuento exacto de tests que pasan (modo ordinario) | 250 | 46,8 % |
| Suite completa pasa (modo ordinario) | 250 | 76,8 % |
| Aserción individual pasa (modo ordinario) | 250 | 84,4 % |
| Recuento exacto de tests que pasan (modo packed) | 250 | 46,8 % |
| Suite completa pasa (modo packed) | 250 | 74,4 % |
| Aserción individual pasa (modo packed) | 2.500 | 82,00 % |

Datos adicionales reportados: el modo packed detectó 203 de 555 aserciones fallidas. En 250 decisiones generales separadas, pertenecientes a siete familias, la precisión macro con igual peso por familia fue del 88,9 %. No se aplica calibración de probabilidad adicional más allá de la configuración de temperatura por tipo de respuesta incluida. No hay comparación con MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16/fp16, alrededor de 8,4 GB solo para los pesos, más memoria para el contexto y el runtime (del orden de 10-11 GB con 8.192 tokens de entrada); en int8, aproximadamente 4,2 GB de pesos; en int4, aproximadamente 2,1 GB de pesos, siempre con overhead adicional. Estas cifras son estimaciones a partir del número de parámetros y del tamaño del repositorio, no valores publicados por el autor.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar funcionamiento en GPUs de 12-16 GB o superiores (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4090, A100, H100), pero el autor no publica requisitos oficiales ni latencias.
- GPU de consumo: no confirmado oficialmente; según el tamaño de pesos, un modelo de 4,2 mil millones de parámetros puede caber en GPUs de consumo con 12 GB o más en bf16, y en 8 GB con cuantización de 8 bits, aunque esto no ha sido cualificado por el autor.
- Opciones de despliegue: `transformers >= 5` junto con `huggingface_hub` y el paquete `decider-ai >= 1.4.0` (carga mediante `Decider(snapshot_download(...), use_graphs=False)`). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Precio de producción en CPU: no cualificado según el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada. El único punto de referencia declarado es el modelo base del que deriva el fine-tune.

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| edihasaj/surebranch-4b | 4.205.751.296 | 8.192 tokens confirmados | CC BY-SA 4.0 (fine-tune); Apache-2.0 en pesos base | Salida de probabilidades sobre opciones, one-pass |
| Mapika/decider-4b (modelo base) | no disponible | no disponible | no disponible | Referenciado como `base_model`; sin datos públicos en la información proporcionada |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | No se identifican modelos comparables en la información disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada, pero el modelo solo se ha evaluado en inglés y sobre dominios concretos (decisión general y pruebas de software en Python), por lo que su comportamiento fuera de esos dominios es incierto.
- Riesgo de alucinación: el modelo no genera texto, por lo que la alucinación clásica no aplica; el riesgo equivalente es la sobreconfianza en las probabilidades. El autor advierte explícitamente de que las probabilidades no deben tratarse como prueba de corrección.
- Calibración: no se aplica calibración de probabilidad adicional más allá de la temperatura por tipo de respuesta incluida, lo que limita el uso de los valores como confianza calibrada.
- Sensibilidad al orden: en modo packed, el orden de las preguntas puede cambiar las respuestas.
- Tareas difíciles: el recuento exacto de tests que pasan es el punto débil medido (46,8 % de precisión en ambos modos), y solo se detectaron 203 de 555 aserciones fallidas.
- Limitación de contexto: máximo confirmado de 8.192 tokens de entrada; contextos más largos no han sido cualificados.
- Limitación de idioma: únicamente inglés.
- Nulo soporte de ejecución: el modelo no ejecuta código; solo emite decisiones sobre estados descritos.
- Estado de la release: release de investigación sin código de entrenamiento ni datasets, y sin recibos de evaluación distribuidos en el repositorio.
- Validación independiente: el checkpoint no ha superado una prueba de paridad fresca frente a Jev, y los resultados publicados son resultados de desarrollo internos, no una evaluación final.
- Restricciones de licencia: las contribuciones del fine-tune están bajo CC BY-SA 4.0, una licencia con cláusula de compartir igual, lo que impone obligaciones de atribución y de licenciamiento derivado para uso comercial; los pesos base conservan términos Apache-2.0, y la procedencia y licencias de los datos públicos se detallan en NOTICE.md.
- Adopción: el repositorio muestra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación de la comunidad.
- Dependencia de herramienta: el uso requiere el paquete `decider-ai` (versión >= 1.4.0), cuyo mantenimiento y disponibilidad no se detallan en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/edihasaj/surebranch-4b
- Aviso de procedencia y licencias (NOTICE.md): https://huggingface.co/edihasaj/surebranch-4b/blob/main/NOTICE.md
- Modelo base: https://huggingface.co/Mapika/decider-4b
- Paquete `decider-ai` (dependencia declarada, sin URL proporcionada en la información disponible)
- Papers, blogs, repositorios o demos adicionales: no disponible en la información proporcionada.
