# inference-optimization/Qwen3-8B-DFlash-Gauss-NVFP4-W4A4

## Resumen

El modelo `inference-optimization/Qwen3-8B-DFlash-Gauss-NVFP4-W4A4` es un *drafter* de decodificacion especulativa derivado de `RedHatAI/Qwen3-8B-speculator.dflash`, disenado para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-8B`. No se trata de un modelo de chat autonomo: es un componente auxiliar que propone tokens candidatos que el modelo objetivo verifica, reduciendo el numero de pasos de decodificacion necesarios.

La innovacion principal de este artefacto es su esquema de cuantizacion NVFP4 W4A4 (pesos y activaciones a 4 bits, con grupo de pesos de tamano 16 y activaciones *local-dynamic*), combinado con una calibracion sintetica de ruido gaussiano aleatorio (2.027 muestras, longitud de secuencia 2.048, semilla 0) en lugar de datos reales. El autor declara explicitamente que se trata de una calibracion de control, no de una calibracion con datos reales.

El repositorio contiene unicamente el componente drafter, con 1.179.882.368 parametros segun los safetensors y un tamano de repositorio de 0,9 GB. Se distribuye bajo licencia Apache-2.0 y requiere una compilacion de vLLM con soporte DFlash y la libreria `speculators` para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificacion especulativa (variante DFlash); arquitectura interna detallada no disponible |
| Parametros totales | 1.179.882.368 (aproximadamente 1,18 mil millones, segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la calibracion uso secuencias de 2.048 tokens, dato no equivalente a la ventana de inferencia) |
| Tipos de cuantizacion | NVFP4 W4A4, grupo de pesos de tamano 16, activaciones local-dynamic; etiquetado tambien como 8-bit / compressed-tensors |
| Idiomas soportados | No disponibles para este artefacto (heredados del objetivo Qwen3-8B, no documentados en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), con codigo personalizado (`custom_code`) |
| Modelo objetivo | Qwen/Qwen3-8B |
| Modelo base (drafter origen) | RedHatAI/Qwen3-8B-speculator.dflash |
| Libreria | speculators |
| Tamano del repositorio | 0,9 GB |
| Tipo de artefacto | Componente drafter; no es un modelo de chat autonomo |

## Arquitectura y entrenamiento

El artefacto es un drafter de decodificacion especulativa basado en la variante DFlash, heredado del speculator `RedHatAI/Qwen3-8B-speculator.dflash`. En la decodificacion especulativa, el drafter genera de forma barata varios tokens candidatos que el modelo objetivo (Qwen3-8B) valida en un unico paso hacia delante, lo que reduce el coste por token generado. La informacion disponible no detalla la arquitectura interna del drafter (numero de capas, dimensiones ocultas ni mecanismo de atencion); estos datos figuran como no disponibles.

La innovacion tecnica documentada es el pipeline de cuantizacion: NVFP4 W4A4 con grupo de pesos de 16 y activaciones local-dynamic, usando el observador de pesos `nvfp4_expanded_mse`. La calibracion se realizo con ruido gaussiano aleatorio sintetico (2.027 muestras, secuencia de 2.048, semilla 0), marcada por el autor como control de calibracion y no como calibracion con datos reales (el dataset PerfectBlend permanece local por no ser redistribuible). El repositorio incluye manifiestos de reproducibilidad, hashes de checkpoints, el comando de vLLM, un parche de runtime y nueve comandos de evaluacion por subconjunto en `provenance/`.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa: propone tokens candidatos para el objetivo Qwen3-8B, con `--spec-tokens 7` como valor de referencia en el ejemplo de despliegue.
- Integracion con vLLM: se sirve junto al modelo objetivo usando `--spec-method dflash`.
- Verificacion de propuestas: trabaja en tandem con el modelo objetivo, que valida las secuencias propuestas.
- No genera texto de forma autonoma ni mantiene conversaciones por si mismo; no es un modelo de chat.
- Soporte de tool calling, agentes, vision, audio o modo *thinking*: no aplica a este artefacto (los heredaria, en su caso, del objetivo, pero no estan documentados aqui).
- Capacidades multilingues: no documentadas para este artefacto.

## Casos de uso

- Servicio de Qwen3-8B con latencia reducida: desplegar el drafter junto al objetivo en vLLM para disminuir el tiempo por token en produccion, aprovechando la verificacion en un solo paso hacia delante.
- Reduccion de coste por token en infraestructura GPU: al aumentar el numero de tokens aceptados por paso, se reduce el uso efectivo de GPU por token generado.
- Investigacion en decodificacion especulativa: usar este artefacto como referencia reproducible de un drafter cuantizado a NVFP4, con comandos y manifiestos incluidos.
- Estudio de cuantizacion NVFP4 W4A4: comparar el efecto de la calibracion con ruido gaussiano sintetico frente a calibraciones con datos reales.
- Evaluacion en H100 con emulacion W4A4: emplear el artefacto para medir el impacto de la cuantizacion a 4 bits cuando no se dispone de hardware Blackwell con NVFP4 nativo.
- Pipelines de generacion de codigo con Qwen3-8B: acelerar la generacion en herramientas de asistencia al desarrollo que ya usen Qwen3-8B como backend, siempre que el backend soporte DFlash.
- Validacion de infraestructura de servidores de chat multi-turno: medir el impacto del drafter en cargas conversacionales reales sirviendo Qwen3-8B con decodificacion especulativa.
- Reproduccion de experimentos: reutilizar los comandos de evaluacion por subconjunto y los hashes de checkpoints para replicar resultados de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la evaluacion NVFP4 en H100 utilizo emulacion W4A4 y que el artefacto no reclama rendimiento de servicio NVFP4 nativo en Blackwell, pero no incluye cifras concretas de latencia, throughput ni tasa de aceptacion.

## Requisitos de hardware

- El drafter tiene aproximadamente 1,18 mil millones de parametros y el repositorio ocupa 0,9 GB; en NVFP4 (4 bits) sus pesos rondan los 0,6 GB.
- El coste real de memoria viene dominado por el modelo objetivo Qwen3-8B, que debe cargarse en paralelo: en FP16 ocupa aproximadamente 16 GB y en NVFP4 en torno a 4-5 GB.
- En hardware Blackwell con soporte NVFP4 nativo, el conjunto objetivo mas drafter podria caber holgadamente en GPUs consumer con 12-16 GB. En GPUs basadas en Hopper (H100) la evaluacion NVFP4 se realizo por emulacion W4A4, no de forma nativa.
- GPUs de referencia citadas: H100 (emulacion W4A4). Para Blackwell no se aportan cifras concretas.
- Opciones de despliegue: vLLM con soporte DFlash y la libreria `speculators`. No se documentan despliegues con llama.cpp, Ollama ni TGI, que no soportan este formato de drafter.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-8B-DFlash-Gauss-NVFP4-W4A4 | Drafter DFlash | 1,18 mil millones (drafter) | NVFP4 W4A4 | Apache-2.0 | Calibracion gaussiana sintetica; requiere vLLM con DFlash |
| RedHatAI/Qwen3-8B-speculator.dflash | Drafter DFlash (origen) | No disponible | Sin cuantizar (origen) | Apache-2.0 | Modelo base del que deriva este artefacto |
| Drafters estilo EAGLE-3 / Medusa | Drafter de decodificacion especulativa | No disponible | Variable | Variable | No se dispone de datos comparativos en la informacion proporcionada |
| Qwen3-0.6B usado como draft | Modelo pequeno como drafter | 0,6 mil millones | Variable | Apache-2.0 | Alternativa generica; sin datos comparativos disponibles |

No se dispone de resultados de rendimiento que permitan una comparacion cuantitativa fiable entre estas alternativas.

## Limitaciones y advertencias

- No es un modelo autonomo: el repositorio contiene solo el drafter, no un modelo de chat utilizable por si solo.
- La calibracion se realizo con ruido gaussiano aleatorio sintetico, marcada explicitamente por el autor como control de calibracion y no como calibracion con datos reales; el comportamiento frente a datos reales puede diferir.
- La evaluacion NVFP4 en H100 utilizo emulacion W4A4; no se reclama rendimiento de servicio NVFP4 nativo en Blackwell.
- El artefacto requiere una compilacion de vLLM con soporte DFlash y la libreria `speculators`, ademas de codigo personalizado (`custom_code`), lo que complica su integracion en despliegues estandar.
- El dataset de calibracion (PerfectBlend) y la cache de estados ocultos no se redistribuyen, lo que limita la reproducibilidad completa de la calibracion.
- La eficacia del drafter depende de la tasa de aceptacion frente al objetivo Qwen3-8B; no se aportan cifras de dicha tasa.
- Sin descargas ni valoraciones en el momento de la consulta, no existe validacion de la comunidad.
- Riesgo de deriva si se empareja con una revision distinta del objetivo: es necesario usar los hashes de checkpoint documentados.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar tambien la licencia y los terminos del modelo objetivo Qwen3-8B antes de un despliegue en produccion.
- No se documentan idiomas soportados ni sesgos especificos de este artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference-optimization/Qwen3-8B-DFlash-Gauss-NVFP4-W4A4
- Modelo objetivo Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Drafter origen: https://huggingface.co/RedHatAI/Qwen3-8B-speculator.dflash

Nota: la busqueda web realizada no devolvio enlaces tecnicos relevantes sobre DFlash, NVFP4 ni este artefacto; los resultados obtenidos correspondian a definiciones genericas del termino "inferencia".
