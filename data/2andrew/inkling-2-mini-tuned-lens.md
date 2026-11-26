# 2andrew/inkling-2-mini-tuned-lens

## Resumen

Inkling-2-mini-tuned-lens es un artefacto de interpretabilidad publicado por el usuario 2andrew sobre el modelo base thinkingmachines/Inkling-2-Mini. No es un modelo generativo autónomo, sino un conjunto de pesos de una "tuned lens" (lente ajustada) presentada al Looped Lens Challenge de NDIF. Su función es leer los estados internos del modelo base en visitas concretas de capa y proyectarlos hacia el espacio de logits del vocabulario, de modo que un investigador pueda inspeccionar qué "piensa" el modelo en un punto intermedio de su cómputo.

La relevancia de esta ficha es metodológica: Inkling 2 Mini es un transformer con capas reutilizadas (las capas 6–17 se ejecutan tres veces), de forma que un token atraviesa 48 visitas de capa. Esta lente proporciona mapas de bajo rango para cinco de esas visitas (40, 43, 44, 45 y 46), lo que permite estudiar la evolución de la representación en la parte final del cómputo recurrente. El repositorio ocupa 0.0 GB y no contiene pesos del modelo base, solo los tensores de la lente.

El interés práctico es acotado pero real para el campo de la interpretabilidad mecanicista: ofrece una herramienta entrenada con datos propios y evaluada en un conjunto retenido, con una mejora medible frente a la logit lens clásica en preguntas de dos saltos. No debe confundirse con un checkpoint afinado para tareas de usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lente ajustada (tuned lens) de bajo rango sobre un transformer con capas reutilizadas (modelo base Inkling-2-Mini) |
| Parametros totales | No disponible (el repositorio contiene solo los mapas de la lente: 5 visitas x 2 matrices A/B de 2304x16 y 16x2304 en bfloat16) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Inkling-2-Mini) |
| Tipos de cuantizacion | No disponible; los tensores de la lente se publican en bfloat16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No especificado en la informacion disponible (tensores con claves `v{visit}.A`, `v{visit}.B` y `v{visit}.mix`) |

## Arquitectura y entrenamiento

El modelo base, Inkling-2-Mini, es un transformer con reutilización de capas: las capas 6 a 17 se ejecutan tres veces, de modo que cada token pasa por 48 visitas de capa. La lente publicada contiene un mapa lineal de bajo rango por visita, aplicado al bloque activo que entra en esa visita en la posición de lectura. La operación es `x = rmsnorm(bloque activo)`, seguida de `y = x + (x @ A_v) @ B_v`, con `A_v` de forma [2304, 16] y `B_v` de [16, 2304] en bfloat16; los logits se obtienen con el `lm_head` del propio modelo tras su `final_norm`. Las claves de los tensores son `v{visit}.A` y `v{visit}.B`; `v{visit}.mix` no se usa en esta variante.

El entrenamiento se realizó con aproximadamente 1.460 prompts propios, distribuidos en 41 tipos de pregunta (un tercio de ellos de dos saltos, cuyo intermedio nunca es la respuesta), en el formato de chat del modelo y también como prompts crudos "Q: … A:". Los estados se recogieron en NDIF y los mapas se ajustaron localmente con entropía cruzada hacia el token intermedio, a través de copias congeladas de la `final_norm` y el `unembedding` del modelo. No se empleó ninguna pregunta de los conjuntos de práctica ni de evaluación del reto. En retención, entrenada sin 7 tipos completos de pregunta, la lente acierta 232 de 254 preguntas bajo la regla de votación del reto, frente a 209 de la logit lens sin entrenar; la mejora proviene de las preguntas de dos saltos. Aplicada a estados de otras preguntas, acierta 1 de 25, frente a 16 en las suyas, lo que indica que lee las activaciones y no memoriza la salida.

## Capacidades

- Lectura de estados internos: proyecta activaciones de visitas concretas (40, 43, 44, 45, 46) al espacio de logits del vocabulario del modelo base.
- Interpretabilidad comparativa: permite contrastar la tuned lens con la logit lens clásica en las mismas posiciones de lectura.
- Análisis de cómputo recurrente: al cubrir visitas de la parte final del ciclo de capas reutilizadas, facilita estudiar cómo se refina la predicción a lo largo de las repeticiones.
- Soporte para preguntas de dos saltos: el ajuste se diseñó específicamente para recuperar el token intermedio en razonamiento multi-paso.
- No ofrece generación de texto, tool calling, agentes, visión ni audio por sí misma; todas esas capacidades pertenecen al modelo base.
- Idiomas: no disponible en la información del repositorio.

## Casos de uso

- Investigación en interpretabilidad mecanicista: cargar los mapas y aplicarlos a las activaciones de las visitas 40–46 para trazar la evolución de la predicción capa a capa en la fase final del cómputo recurrente.
- Auditoría de razonamiento multi-paso: usar la lente para inspeccionar si el modelo representa el resultado intermedio de una pregunta de dos saltos antes de emitir la respuesta final.
- Comparación de métodos de lectura: ejecutar en paralelo la logit lens y esta tuned lens sobre los mismos estados para cuantificar la ganancia en acierto (232/254 frente a 209/254 en el conjunto retenido del autor).
- Docencia y divulgación: ilustrar con un caso real cómo una lente ajustada de bajo rango aproxima el unembedding del modelo sin modificarlo.
- Validación de experimentos de recurrencia: comprobar si las sucesivas visitas a las mismas capas convergen hacia la misma distribución de salida o si aportan información nueva.
- Reproducción de resultados del Looped Lens Challenge: reutilizar los pesos como referencia para comparar con otras lentes presentadas al reto de NDIF.

## Benchmarks y rendimiento

| Conjunto | Metrica | Tuned lens | Logit lens |
|---|---|---|---|
| Retenido, 7 tipos de pregunta no vistos (254 preguntas) | Acierto bajo la regla de votación del reto | 232 | 209 |
| Preguntas de evaluación sobre estados ajenos (25 preguntas) | Acierto | 1 | No disponible |
| Preguntas de evaluación sobre sus propios estados | Acierto | 16 | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el artefacto no es un modelo generativo evaluable con esas métricas.

## Requisitos de hardware

- VRAM para la lente: despreciable; los cinco pares de matrices de 2304x16 y 16x2304 en bfloat16 suman del orden de decenas de megabytes, aunque el repositorio figura con 0.0 GB.
- VRAM para el modelo base: no disponible en la información proporcionada; depende del tamaño de Inkling-2-Mini y de la cuantización elegida.
- GPU recomendadas: cualquiera capaz de ejecutar el modelo base; para la lente basta con CPU, aunque la recogida de activaciones requiere ejecutar el modelo completo.
- Cabe en GPU de consumo: la lente sí; el modelo base, no disponible.
- Opciones de despliegue: no disponible para el modelo base; la lente se carga como tensores y se aplica con código propio sobre las activaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 2andrew/inkling-2-mini-tuned-lens | Tuned lens sobre Inkling-2-Mini | Mapas de bajo rango (5 visitas) | No disponible | MIT | Hugging Face |
| Logit lens (línea base del reto) | Proyección directa con el unembedding | 0 (sin entrenamiento) | No aplica | No aplica | Método publicado |
| thinkingmachines/Inkling-2-Mini | Modelo base generativo | No disponible | No disponible | No disponible | Hugging Face |

No se dispone de información sobre otras lentes comparables del mismo reto ni sobre sus resultados, por lo que la comparativa se limita a la línea base reportada por el autor.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para chat, código, matemáticas ni ninguna tarea de usuario final.
- Cobertura parcial: solo cubre cinco visitas (40, 43, 44, 45, 46) de las 48 del modelo base.
- Generalización limitada: sobre estados de preguntas ajenas a su distribución de entrenamiento acierta 1 de 25, frente a 16 sobre las suyas.
- Dependencia del modelo base: los resultados solo son válidos para la versión exacta de thinkingmachines/Inkling-2-Mini con la que se recogieron los estados.
- Sesgos: no documentados en la información disponible; al derivarse de datos propios del autor, pueden reflejar sesgos de ese conjunto.
- Riesgo de alucinación: no aplica a la lente en sí, pero las lecturas pueden inducir interpretaciones erróneas si se confunden con la salida real del modelo.
- Licencia MIT: permisiva para uso comercial, sin garantías explícitas en la información disponible.
- Repositorio sin descargas ni likes y con tamaño de 0.0 GB: conviene verificar la integridad de los ficheros antes de usarlo en producción o investigación.

## Enlaces

- Hugging Face: https://huggingface.co/2andrew/inkling-2-mini-tuned-lens
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- NDIF (National Deep Inference Fabric): no disponible en la información proporcionada
- Looped Lens Challenge: no disponible en la información proporcionada
