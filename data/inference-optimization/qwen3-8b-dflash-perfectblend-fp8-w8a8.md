# inference-optimization/Qwen3-8B-DFlash-PerfectBlend-FP8-W8A8

## Resumen

Este repositorio contiene un *drafter* de decodificación especulativa, no un modelo de chat autónomo. Se trata de una versión cuantizada en FP8 estático (W8A8) del drafter DFlash de Red Hat para el modelo objetivo Qwen3-8B (`RedHatAI/Qwen3-8B-speculator.dflash`). Su función es proponer borradores de tokens que el modelo objetivo de 8.000 millones de parámetros valida en paralelo, de forma que se reduzca el número de pasos de decodificación y, con ello, la latencia de generación. El drafter tiene 1.179.882.368 parámetros (aproximadamente 1,18 B) y ocupa 1,3 GB de repositorio, coherente con un almacenamiento en 8 bits.

La relevancia de esta publicación es de tipo operativo: cuantizar el drafter a FP8 reduce su huella de memoria y el coste de cada paso especulativo, manteniendo el objetivo en su precisión original. La calibración se ha hecho con PerfectBlend sobre estados ocultos, entradas de tokens y máscaras de pérdida del propio Qwen3-8B (2.027 ejemplos preparados, longitud de secuencia 2.048, semilla 0), lo que alinea la distribución del drafter cuantizado con la del objetivo real.

Se distribuye bajo licencia Apache-2.0, con pesos en `safetensors` y formato `compressed-tensors`, y requiere una compilación de vLLM con soporte para DFlash y la librería `speculators`. Conviene subrayar que, sin el modelo objetivo Qwen3-8B y sin ese *runtime* específico, el artefacto no es utilizable de forma directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter DFlash para decodificacion especulativa; arquitectura interna no detallada en la informacion disponible (el autor remite a `config.py` del repositorio) |
| Parametros totales | 1.179.882.368 (aproximadamente 1,18 B) |
| Parametros activos | No aplica: no se describe una arquitectura MoE |
| Longitud de contexto | No disponible para el drafter; la calibracion se realizo con longitud de secuencia 2.048. La ventana util depende del modelo objetivo Qwen3-8B |
| Tipos de cuantizacion | FP8 estatico W8A8 (pesos y activaciones en FP8) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato compressed-tensors) |
| Modelo objetivo | Qwen/Qwen3-8B |
| Modelo base del drafter | RedHatAI/Qwen3-8B-speculator.dflash |
| Libreria | speculators (requiere build de vLLM con soporte DFlash) |
| Tamano del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

El artefacto es un componente de decodificacion especulativa. El esquema DFlash consiste en un modelo borrador ligero que genera varios tokens candidatos por paso; el modelo objetivo los verifica en una sola pasada de atencion, aceptando el prefijo correcto y descartando el resto. Esto mantiene la distribucion de salida del modelo grande (la verificacion es exacta respecto a sus logits) mientras reduce el numero de llamadas al objetivo por token generado. En esta publicacion el drafter es una version derivada del speculator de Red Hat para Qwen3-8B, no un modelo entrenado desde cero.

Sobre el entrenamiento del drafter original no se aportan detalles en la informacion disponible: el repositorio incluye un `train_command.txt` capturado del modelo fuente dentro de `provenance/`, pero no se especifican tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO. Lo que si esta documentado es el proceso de cuantizacion posterior: cuantizacion estatica FP8 W8A8 con calibracion PerfectBlend real, ejecutada sobre estados ocultos alineados de Qwen3-8B, entradas de tokens y mascaras de perdida, con 2.027 ejemplos preparados, longitud de secuencia 2.048 y semilla 0. El manifiesto `quant_run_manifest.json` recoge los ajustes de cuantizacion y las revisiones de origen; `calibration_manifest.json` registra recuentos e hashes de contenido de la cache. Ni los prompts ni los tensores de estados ocultos se distribuyen, porque los prompts preparados no son redistribuibles, lo que limita la reproducibilidad exacta de la calibracion.

## Capacidades

- Generacion de borradores de tokens para decodificacion especulativa sobre Qwen3-8B: es su unica funcion descrita por el autor.
- Aceleracion de inferencia: reduce el numero de pasos de decodificacion del modelo objetivo manteniendo su distribucion de salida.
- Integracion con vLLM mediante `--spec-model`, `--spec-tokens 7` y `--spec-method dflash`.
- Configuracion propia del drafter mediante `config.py` y codigo personalizado (`custom_code`).
- No es un modelo de chat autonomo: no genera respuestas por si mismo ni debe desplegarse sin el objetivo.
- Tool calling, function calling, agentes, vision, audio y modo de razonamiento: no descritos para este artefacto.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Servicio de chat de baja latencia: emparejado con Qwen3-8B en vLLM, el drafter propone 7 tokens por paso (valor configurado en el ejemplo del autor) y el objetivo los verifica en paralelo, lo que reduce el tiempo hasta el primer token util en flujos conversacionales multi-turno.
- Reduccion de coste por token en produccion: al disminuir el numero de pasos de decodificacion del modelo de 8 B, baja el tiempo de GPU facturado por peticion en cargas de generacion larga.
- Backend de asistentes con contexto largo: el ahorro por paso especulativo es mas relevante cuanto mayor es el numero de tokens generados, tipico en resumenes de documentos y analisis de informes extensos servidos sobre Qwen3-8B.
- Pipelines RAG: en respuestas ancladas a fragmentos recuperados, donde la salida suele ser larga y el coste dominante es la decodificacion, el drafter acelera la fase de generacion sin alterar el modelo que produce el contenido.
- Despliegue on-premise con VRAM ajustada: al estar el drafter en FP8 (1,18 B de parametros, aproximadamente 1,2 GB de pesos), la memoria adicional que consume sobre el objetivo es pequena en comparacion con un drafter en BF16.
- Generacion por lotes y procesos nocturnos: informes, clasificacion con justificacion, sintesis de datos o traduccion por volumen, donde el throughput agregado importa mas que la latencia individual.
- Evaluacion de tecnicas de decodificacion especulativa: el repositorio incluye manifiestos, hashes de checkpoints, el comando de servido con su parche de runtime y nueve comandos de evaluacion por subconjunto, lo que lo hace util como caso de estudio reproducible de cuantizacion de drafters.
- Ajuste de memoria en nodos con varias replicas: al liberar VRAM del drafter, es posible aumentar el numero de replicas por GPU o ampliar el tamano de lote del objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio menciona una evaluacion "all-subset" del 24 de septiembre de 2026 y nueve comandos de evaluacion por subconjunto dentro de `provenance/evaluation/`, pero no se incluyen cifras de tasa de aceptacion de tokens, *speedup* frente a decodificacion estandar, MMLU, GSM8K ni ningun otro resultado numerico.

## Requisitos de hardware

- VRAM del drafter: aproximadamente 1,2 GB de pesos en FP8, mas activaciones y sobrecarga de runtime; una reserva practica de 2 a 3 GB es razonable (estimacion derivada del recuento de parametros, no una medicion publicada).
- VRAM total del sistema: hay que sumar el modelo objetivo Qwen3-8B (del orden de 8,5 GB en FP8 y 17 GB en BF16, segun cuantizacion) mas la cache KV de las secuencias servidas.
- GPU recomendadas: no especificadas por el autor. El despliegue esta pensado para vLLM, lo que en la practica apunta a A100, H100, L40S, H200 o equivalentes; no se documentan requisitos de arquitectura minima.
- GPU de consumo: el drafter por si solo cabria en cualquier GPU con mas de 4 GB, pero el conjunto drafter mas objetivo Qwen3-8B en FP8 necesita del orden de 11-13 GB de VRAM, alcanzable en RTX 4090 (24 GB), RTX 4080 (16 GB) o RTX 3090 (24 GB) con contexto moderado. No hay confirmacion oficial de funcionamiento en estas tarjetas.
- Opciones de despliegue: vLLM con soporte DFlash (requiere el parche incluido en `provenance/evaluation/`) y la libreria `speculators`. No se documenta compatibilidad con llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput: no disponibles. El unico parametro publicado es la configuracion de servido con 7 tokens especulativos por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| inference-optimization/Qwen3-8B-DFlash-PerfectBlend-FP8-W8A8 | Drafter DFlash para Qwen3-8B | 1,18 B | FP8 estatico W8A8 | no disponible | Apache-2.0 | Hugging Face, requiere vLLM con DFlash |
| RedHatAI/Qwen3-8B-speculator.dflash | Drafter DFlash para Qwen3-8B (origen) | no disponible en la informacion proporcionada | no especificada | no disponible | Apache-2.0 | Hugging Face |
| Otros drafters (EAGLE-3, Medusa, n-gram) | Decodificacion especulativa | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre estas opciones en la informacion proporcionada, por lo que la comparacion se limita a tipo de artefacto, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el objetivo Qwen3-8B y sin una build de vLLM con soporte DFlash no produce respuestas utilizables. No debe presentarse como modelo de chat.
- Dependencia de codigo personalizado: el repositorio incluye `custom_code` y una configuracion propia (`config.py`), lo que complica la portabilidad a otros motores de inferencia.
- Divergencia de nombres: el identificador del repositorio menciona `PerfectBlend-FP8-W8A8`, mientras que la model card usa `Blend8-FP8-W8A8` y el comando de ejemplo apunta a `Qwen3-8B-DFlash-Blend8-FP8-W8A8`. Conviene verificar el nombre exacto antes de lanzar el servido.
- Reproducibilidad parcial de la calibracion: los prompts y la cache de estados ocultos no se distribuyen por no ser redistribuibles, asi que el proceso de calibracion no puede replicarse byte a byte, solo auditarse a traves de los manifiestos.
- Riesgo de alucinacion: el artefacto no genera contenido semantico por si mismo; la verificacion del objetivo preserva la distribucion de Qwen3-8B, por lo que los sesgos y alucinaciones del sistema son los del modelo objetivo, no los del drafter.
- Idiomas soportados: no declarados. La cobertura linguistica dependera de Qwen3-8B.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se heredan las condiciones del drafter de origen y del modelo objetivo; conviene revisar ambas fichas antes de un despliegue en produccion.
- Adopcion nula: cero descargas y cero "me gusta" en el momento de la consulta, sin evaluaciones independientes publicadas que respalden el comportamiento del artefacto cuantizado frente al original.
- Rendimiento no verificado: no hay cifras publicas de tasa de aceptacion ni de ganancia de velocidad, y la cuantizacion del drafter puede alterar su tasa de acierto respecto al modelo fuente en BF16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inference-optimization/Qwen3-8B-DFlash-PerfectBlend-FP8-W8A8
- Modelo objetivo Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Drafter de origen (Red Hat): https://huggingface.co/RedHatAI/Qwen3-8B-speculator.dflash
- Los resultados de busqueda web obtenidos no contienen informacion tecnica relevante: se limitan a definiciones genericas del termino "inferencia" en diccionarios y enciclopedias, sin relacion con decodificacion especulativa ni con este artefacto, por lo que no se incluyen mas enlaces.
