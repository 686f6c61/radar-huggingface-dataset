# NGARiAI/ngari-ft-distilled-v3-dpo

## Resumen

NGARi ngari-ft-distilled-v3-dpo es un ajuste fino del modelo Qwen2.5-1.5B-Instruct publicado por NGARiAI como parte de su iniciativa "Open Source Friday". Se trata de la version v3 de una linea de destilacion que en este caso concreto ha sido sometida a un paso de optimizacion directa de preferencias (DPO) en lugar de recibir mas datos supervisados. El modelo se distribuye unicamente en formato GGUF cuantizado Q4_K_M, con un tamano de fichero de 0,99 GB, y esta pensado para inferencia en el borde (edge AI) y despliegue local via Ollama.

La relevancia de esta publicacion no reside en una mejora de capacidades, sino en su caracter de resultado metodologico: el propio autor documenta que el DPO incremento la deteccion de tool calling de 0,35 a 0,55, pero degradó la calidad conversacional media de 0,4188 a 0,3679. Es decir, el objetivo de preferencia desplazo al modelo hacia formatos correctos en detrimento de la calidad de las respuestas. El autor lo publica explicitamente como artefacto de investigacion, no como checkpoint recomendado para chat.

Arquitectonicamente hereda la estructura transformer decoder-only de Qwen2.5-1.5B-Instruct, con 1.543.714.304 parametros totales y licencia Apache-2.0. La model card advierte de que no es una mejora sobre v3 para conversacion y de que los datos de preferencia empleados en el DPO no se han publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parametros aproximadamente, y se ha ajustado mediante un proceso de destilacion (v3) seguido de una fase de optimizacion directa de preferencias (DPO). Segun la model card, esta es la unica checkpoint de la linea entrenada con un objetivo de preferencia en lugar de con mas datos supervisados. El ajuste se aplico sobre el modelo base "sin modificar excepto por el adaptador o ajuste fino completo descrito", segun el texto del autor.

Los datos de entrenamiento supervisado se publican en el repositorio de datasets del autor (NGARiAI/ngari-datasets) y la receta de entrenamiento en la carpeta `training/` del mismo repositorio. Sin embargo, los datos de preferencia utilizados en la fase DPO no se han publicado, lo que limita la reproducibilidad de esa parte del proceso. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni los detalles del algoritmo DPO (beta, emparejamiento de preferencias, etc.).

La innovacion tecnica destacable no es arquitectonica sino metodologica: el autor publica el checkpoint junto con sus resultados negativos, incluyendo los ficheros de evaluacion por ejemplo (`ngari-ft-distilled-v3-dpo_chat_eval.json` y `ngari-ft-distilled-v3-dpo_tool_eval.json`), lo que permite auditar la degradacion introducida por el DPO.

## Capacidades

- Generacion de texto conversacional en ingles, con calidad degradada respecto a la version v3 previa al DPO (chat avg_score de 0,3679 frente a 0,4188).
- Deteccion de tool calling / function calling mejorada respecto a v3 (0,55 frente a 0,35), presumiblemente por el sesgo del DPO hacia formatos estructurados.
- Razonamiento basico y respuesta a instrucciones heredados de Qwen2.5-1.5B-Instruct.
- Capacidad multilingue limitada: la model card declara unicamente ingles, aunque el modelo base soporta mas idiomas.
- No se documentan capacidades de vision, audio, modo thinking explicito ni agentes multi-paso en la informacion proporcionada.
- No se documenta soporte de contexto largo especifico para este checkpoint.

## Casos de uso

- Investigacion sobre DPO y sus efectos secundarios: el checkpoint sirve como caso de estudio reproducible de como un objetivo de preferencia puede mejorar el cumplimiento de formato (tool calling) a costa de la calidad conversacional. Util para quienes estudian alineamiento y trade-offs entre formatos y respuestas.
- Evaluacion de pipelines de function calling en el borde: dado que la deteccion de tool calling sube a 0,55, puede emplearse para probar integraciones de herramientas en dispositivos con recursos limitados, asumiendo la perdida de calidad conversacional.
- Despliegue local con Ollama en hardware modesto: el fichero GGUF Q4_K_M de 0,99 GB cabe en equipos con poca VRAM o incluso en CPU, lo que permite experimentar con un modelo de 1,5B en portatiles y dispositivos edge.
- Pruebas de regresion de evaluadores: los ficheros de evaluacion por ejemplo permiten validar harness de evaluacion de chat y tool calling contra resultados publicados.
- Educacion y divulgacion: util para explicar en talleres la diferencia entre ajuste supervisado y DPO, y por que un checkpoint con mejores metricas de formato no es necesariamente mejor en conversacion.
- Baseline para comparativas de destilacion: sirve como referencia en experimentos que comparen lineas de destilacion con y sin DPO sobre modelos pequenos.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas internas del autor (no benchmarks estandar como MMLU, HumanEval o GSM8K):

| Metrica | v3 (sin DPO) | v3-dpo | Variacion |
|---|---|---|---|
| Deteccion de tool calling | 0,35 | 0,55 | +0,20 |
| Chat avg_score | 0,4188 | 0,3679 | -0,0509 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para el fichero Q4_K_M, mas overhead de contexto y runtime; en la practica, entre 1,5 y 2,5 GB segun longitud de contexto y backend.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); tambien ejecutable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna y en muchas integradas, dado el tamano del modelo.
- Opciones de despliegue: Ollama (etiqueta explicita en el repo), llama.cpp, y cualquier runtime compatible con GGUF. No se documenta soporte de vLLM o TGI para este checkpoint.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ngari-ft-distilled-v3-dpo | 1,54B | no disponible | Apache-2.0 | GGUF Q4_K_M | DPO sobre v3; tool calling 0,55, chat 0,3679 |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (segun modelo base) | Apache-2.0 | safetensors, GGUF | Modelo base sin destilar; referencia de calidad general |
| ngari-ft-distilled-v3 | no disponible | no disponible | Apache-2.0 (presumible) | no disponible | Version previa sin DPO; chat 0,4188, tool 0,35 |

No se dispone de datos de rendimiento comparables en benchmarks estandar entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion conversacional documentada: el chat avg_score cae de 0,4188 a 0,3679 respecto a v3; el propio autor advierte de que no es una mejora para chat.
- Datos de preferencia no publicados: la fase DPO no es reproducible, a diferencia del entrenamiento supervisado.
- Idiomas: la model card declara solo ingles; el uso en castellano no esta validado y puede degradar la calidad.
- Riesgo de alucinacion: inherente a un modelo de 1,5B; no se documentan mitigaciones especificas.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Contexto: no se confirma la longitud de contexto efectiva de este checkpoint; no asumir los 32.768 tokens del modelo base sin verificacion.
- Unico formato publicado (Q4_K_M): no hay safetensors ni otras cuantizaciones en el repo, lo que limita el reentrenamiento o el ajuste fino posterior.
- Uso comercial: permitido por Apache-2.0, pero el autor desaconseja implicitamente su uso en produccion conversacional por la degradacion medida.
- Madurez: 0 descargas y 0 likes en el momento de la ficha; sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NGARiAI/ngari-ft-distilled-v3-dpo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Datasets de entrenamiento: https://huggingface.co/datasets/NGARiAI/ngari-datasets
- Coleccion Open Source Friday: https://huggingface.co/collections/NGARiAI/open-source-friday-6b0a5e2732568212b40439a4
- Programa y reglas: https://ngari.ai/open-source-friday
