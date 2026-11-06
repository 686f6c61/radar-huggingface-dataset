# Remek/basal-2.0-mini-GGUF

## Resumen

basal-2.0-mini-GGUF es la distribucion en formato GGUF del modelo basal-2.0-mini, un modelo de decision tipada de 1.596.507.648 parametros (~1,5B) construido sobre el modelo base speakleash/Bielik-1.5B-v3.0-Instruct. Lo desarrolla Remek y resuelve un problema concreto: en lugar de generar texto libre, el modelo emite decisiones estructuradas (eleccion entre opciones, si/no y puntuaciones) leyendo las log-probabilidades de los codigos de opcion, con calibracion explicita para que las probabilidades sean interpretables en produccion.

El repositorio incluye dos cuantizaciones, Q8_0 (1,6 GB) y Q5_K_M (1,1 GB), junto con ficheros de calibracion especificos por motor y variantes con metadatos de decision para LM Studio. La API de decision tipada no la proporciona Ollama ni llama.cpp por si solos: requiere el servidor `basal-serve` del proyecto basal, que renderiza el prompt propio del modelo y lee las log-probabilidades de los tokens de opcion. Un `ollama run` directo solo devuelve texto libre.

Es relevante ahora porque cubre el nicho de clasificacion y decision calibrada en local: un modelo de 1,5B que cabe en portatiles, con licencia Apache 2.0, soporte para polaco e ingles, y una puerta de calidad medida contra la version bf16 (acuerdo de 0,9769 en Q8_0 y 0,9339 en Q5_K_M para decisiones de 2 a 10 opciones). No es un modelo generativo de proposito general, sino una capa de decision de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Bielik-1.5B-v3.0-Instruct); no se detalla mas en la informacion disponible |
| Parametros totales | 1.596.507.648 (~1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens en modo Ollama (basal-serve fija `num_ctx 4096`); configurable hasta lo que permita `llama-server -c` en modo llama.cpp (p. ej. 8.192); los estados mas largos se truncan por el medio con `usage.truncated` |
| Tipos de cuantizacion | Q8_0 (recomendada) y Q5_K_M; existen tambien FP8 y MLX 8-bit en otros repositorios de la misma coleccion |
| Idiomas soportados | pl (polaco), en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF; ficheros `basal-2.0-mini-Q8_0.gguf`, `basal-2.0-mini-Q5_K_M.gguf`, `Modelfile.Q8_0`, `Modelfile.Q5_K_M`, `basal.json`, ficheros de calibracion y variantes `-decision.gguf` con metadatos |

## Arquitectura y entrenamiento

La informacion disponible no detalla el proceso de entrenamiento de basal-2.0-mini. Se sabe que parte de speakleash/Bielik-1.5B-v3.0-Instruct, un modelo instructivo polaco de 1,5B, y que la contribucion propia es una capa de decision tipada: el modelo se usa para leer las log-probabilidades de los tokens que codifican opciones, de modo que la salida no es texto generado sino una distribucion sobre opciones con calibracion asociada. El repositorio GGUF no toca los tensores del modelo base; la conversion solo cambia el formato y anade metadatos de decision en las variantes para LM Studio.

La innovacion tecnica destacable no esta en la arquitectura del transformer sino en el pipeline de inferencia. El servidor `basal-serve` (proyecto basal, version 2.5.0) renderiza el prompt propio del modelo, extrae las log-probabilidades de los codigos de opcion y aplica ficheros de calibracion (`CALIBRATION.json` para bf16, `CALIBRATION.<engine>.json` para Ollama y llama.cpp). El mismo motor sirve tambien los modelos experimentales basal-omni-1.0 con imagen y audio. La calibracion ajustada sobre lecturas bf16 no se transfiere exactamente a un puerto cuantizado: un test externo de basal-1.5 en Ollama observo un 2,3% de error real en el umbral del 1% usando el fichero bf16, de ahi la existencia de ajustes especificos por motor.

## Capacidades

- Decision tipada entre opciones: eleccion unica entre 2 y 26 opciones segun el motor (Ollama limita a 20 log-probabilidades por posicion; llama.cpp y LM Studio admiten hasta 26).
- Decisiones si/no y puntuaciones (score) con calibracion de probabilidades.
- Clasificacion con calibracion explicita (ECE controlado frente a bf16).
- Generacion de texto libre heredada del modelo base Bielik-1.5B-v3.0-Instruct, aunque el valor del modelo esta en la capa de decision.
- Soporte multilingue limitado a polaco e ingles.
- Integracion como modelo de decision en LM Studio 0.4.26 o superior (canal beta, motor llama.cpp 2.65.1+, no el motor MLX) mediante los endpoints `/v1/systemone` y `/v1/decisions`.
- Servicio concurrente de clientes con `--http-parallel N` combinado con `OLLAMA_NUM_PARALLEL` o `llama-server -np`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en este modelo (el audio y la imagen corresponden a la linea experimental basal-omni-1.0).

## Casos de uso

- Clasificacion de tickets de soporte en local: el modelo elige entre un conjunto cerrado de categorias (facturacion, incidencia tecnica, cancelacion, etc.) leyendo log-probabilidades calibradas, de modo que el umbral de derivacion a un humano se puede fijar con una tasa de error conocida en lugar de con una heuristica sobre texto generado.
- Moderacion binaria de contenido: decisiones si/no con puntuacion calibrada permiten fijar umbrales operativos (por ejemplo, derivar a revision manual todo lo que supere 0,7) y auditar la tasa de falsos positivos con las metricas ECE del puerto cuantizado.
- Enrutado de consultas en un pipeline RAG: dado un conjunto de indices o herramientas, el modelo decide a cual dirigir la consulta; su tamano de 1,1-1,6 GB permite ejecutarlo en la misma maquina que el resto del pipeline sin GPU dedicada.
- Triaje en aplicaciones de escritorio: con la variante Q5_K_M (1,1 GB) y LM Studio, se puede desplegar un modelo de decision en un portatil sin conexion, usando los endpoints `/v1/decisions` para eleccion, si/no y score.
- Encuestas y anotacion asistida: asignar una etiqueta entre varias opciones a respuestas abiertas en polaco o ingles, con la calibracion como senal de confianza para marcar los casos ambiguos.
- Control de calidad en generacion: usar el modelo como verificador si/no de si una respuesta cumple un criterio (por ejemplo, si cita una fuente), aprovechando la calibracion para agregar veredictos con probabilidades sumables.
- Evaluacion de politicas de decision en investigacion: al estar calibrado y medido contra bf16 con metricas de acuerdo y ECE, sirve como referencia reproducible para comparar estrategias de umbral en tareas de eleccion cerrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks genericos (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos medidos son las pruebas de puerta de los puertos cuantizados contra el modelo bf16 sobre el conjunto de desarrollo dev v2 (filas MLX: cada segunda decision de dev v2, 1.700 decisiones). Los umbrales de esta categoria son: acuerdo en opciones 2-10 >= 0,9161, acuerdo con margen de referencia >= 0,2 >= 0,9858, precision a menos de 1 punto de bf16 y ECE como maximo +0,01.

| Paquete | Acuerdo con bf16 (opciones 2-10) | Acuerdo con margen >= 0,2 | Diferencia de precision | Diferencia de ECE | Tamano | Velocidad | Puerta |
|---|---|---|---|---|---|---|---|
| FP8 | 0,9333 | 0,9937 | -0,0077 | -0,0032 | 1,8 GB | 103,5 dec/s c16, c1 p50 14 ms (H100) | PASS |
| GGUF Q8_0 | 0,9769 | 1,0000 | -0,0004 | -0,0019 | 1,6 GB | no medida en esta release | PASS |
| GGUF Q5_K_M | 0,9339 | 0,9931 | -0,0006 | -0,0016 | 1,1 GB | no medida en esta release | PASS |
| MLX 8-bit | 0,9792 | 1,0000 | -0,0025 | +0,0024 | 1,7 GB | 93 ms c1 p50, 223 ms para 5 preguntas (Mac) | PASS |

Estos datos son comprobaciones de la capa de decision frente a bf16, no benchmarks nuevos del modelo; los resultados propios del modelo estan en el repositorio basal-2.0-mini.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,6 GB para Q8_0 y 1,1 GB para Q5_K_M, mas el overhead del contexto y del servidor `basal-serve`.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para Q5_K_M; no se requieren A100 ni H100. La medicion de 103,5 decisiones/s con concurrencia 16 en H100 corresponde al paquete FP8, no a estos GGUF.
- Cabe en GPU consumer: si, en tarjetas de gama media y baja (por ejemplo, RTX 3060 de 12 GB o inferiores) y tambien en CPU, dado el tamano de 1,1-1,6 GB.
- Opciones de despliegue: Ollama 0.12.11 o superior con `basal-serve --mode ollama`; llama.cpp con `llama-server` y `basal-serve --mode llamacpp`; carga en proceso con `basal-serve --mode gguf` (extra `basal[gguf]`, llama-cpp-python); LM Studio 0.4.26 o superior (beta, motor llama.cpp 2.65.1+) con los ficheros `-decision.gguf`.
- Latencia y throughput: no medidos en esta release para los GGUF. El autor advierte que GGUF es la ruta lenta para lotes y esta pensada para escritorio y portatiles, no para servidores. Como referencia de otra ruta, MLX 8-bit da 93 ms en c1 p50 y 223 ms para 5 preguntas en Mac, y FP8 da 14 ms en c1 p50 en H100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-2.0-mini-GGUF (este) | ~1,5B | 4.096 en Ollama; configurable en llama.cpp | Decision tipada calibrada, pl/en | Apache 2.0 | GGUF Q8_0 y Q5_K_M en Hugging Face |
| basal-2.0-mini (bf16) | ~1,5B | no disponible | Modelo de referencia del que derivan los puertos | Apache 2.0 | Hugging Face (bf16) |
| basal-2.0-mini-FP8 | ~1,5B | no disponible | Misma capa de decision en FP8 | Apache 2.0 | Hugging Face; 103,5 dec/s c16 en H100 |
| basal-2.0-mini-MLX-8bit | ~1,5B | no disponible | Misma capa de decision en MLX para Apple Silicon | Apache 2.0 | Hugging Face; 93 ms c1 p50 en Mac |

No se dispone en la informacion proporcionada de comparaciones con modelos de decision de otros autores ni con clasificadores dedicados; ese dato figura como no disponible.

## Limitaciones y advertencias

- No es un modelo de proposito general: `ollama run` directo devuelve solo texto libre; las respuestas tipadas requieren `basal-serve` delante del motor.
- Ollama devuelve como maximo 20 log-probabilidades por posicion, por lo que las preguntas con mas de 20 opciones exigen llama.cpp.
- El contexto en modo Ollama esta fijado en 4.096 tokens por `basal-serve` (sobreescribe el Modelfile); los estados mas largos se truncan por el centro y se senalan con `usage.truncated`. Para documentos largos hay que usar `llama-server -c 8192` o `--mode gguf`.
- La calibracion ajustada en bf16 no se transfiere exactamente a un puerto cuantizado: un test externo de basal-1.5 en Ollama registro un 2,3% de error real en el umbral del 1% con el fichero bf16. Hay que usar el fichero de calibracion especifico del motor cuando exista.
- LM Studio corta las peticiones a los 30 s, por lo que los documentos muy largos deben dividirse.
- Idiomas limitados a polaco e ingles; el rendimiento en castellano no esta documentado y no deberia asumirse.
- No se documentan sesgos conocidos ni tasas de alucinacion para este modelo en la informacion disponible; al heredar el modelo base Bielik, los sesgos de este pueden persistir.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base speakleash/Bielik-1.5B-v3.0-Instruct.
- Las variantes `-decision.gguf` para LM Studio dependen del canal beta y del motor llama.cpp 2.65.1 o superior; no funcionan con el motor MLX.
- El rendimiento en lotes con GGUF es bajo por diseno; para servidores conviene evaluar FP8 u otras rutas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Remek/basal-2.0-mini-GGUF
- Modelo bf16 de referencia: https://huggingface.co/Remek/basal-2.0-mini
- Version FP8: https://huggingface.co/Remek/basal-2.0-mini-FP8
- Version MLX 8-bit: https://huggingface.co/Remek/basal-2.0-mini-MLX-8bit
- Coleccion basal-2.0: https://huggingface.co/collections/Remek/basal-20-6acd1712a8e443c86cd576fc
- Modelo base: https://huggingface.co/speakleash/Bielik-1.5B-v3.0-Instruct
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Documentacion de imagen y audio (basal-omni): https://github.com/rkinas/basal#images-and-audio-basal-omni-experimental
- Sitio web del proyecto: https://basal.si5.pl/
- Paquete Python basal v2.5.0: https://github.com/rkinas/basal/archive/refs/tags/v2.5.0.tar.gz
