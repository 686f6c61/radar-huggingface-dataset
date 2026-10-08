# atomtanstudio/Prism-Q6

## Resumen

Prism-Q6 (`blocks-q6-v1`) es una cuantizacion a 6 bits del modelo image-to-video-and-audio Prism de Tencent Hunyuan, publicada por el usuario atomtanstudio (Atom Tan Studio). No se trata de un modelo entrenado desde cero, sino de un artefacto derivado del checkpoint `FrancisRing/Prism` en BF16: reduce su tamano de 65,3 GB a 27,1 GB empaquetando los pesos de las capas `Linear` en bloques de 6 bits con grupo de 64 y escalas en FP32.

El proposito declarado por el autor es puramente experimental: servir como comparativa de hardware y como punto de partida para investigacion en cuantizacion. La propia model card lo describe como un "primer intento con cero optimizaciones" y advierte de artefactos visibles en boca y dientes, articulacion restringida y audio potencialmente distorsionado. No es, por tanto, un preset de calidad para produccion.

La relevancia de esta publicacion esta en que demuestra que un modelo conjunto de video y audio de gran tamano puede ejecutarse en una unica GPU de consumo (RTX 5090) dentro de 16 GB de VRAM mediante offload a CPU, generando clips de 121 frames a 480p en unos 30 minutos. El repositorio tiene 0 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado del modelo base Prism de Tencent Hunyuan; la model card no detalla la arquitectura interna) |
| Parametros totales | no disponible de forma explicita; el checkpoint BF16 de origen ocupa 65,3 GB, lo que equivale aproximadamente a 32 000 millones de parametros (estimacion a partir del tamano en disco) |
| Parametros activos | no aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6 personalizado (`blocks-q6-v1`): pesos de capas `Linear` empaquetados a 6 bits, tamano de grupo 64, escalas FP32; el resto de pesos se conservan en su precision original |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del release base de Prism, sin restricciones adicionales) |
| Formato de pesos | Safetensors (52 shards) con formato de cuantizacion propio `prism-custom-q6`; no es GGUF |

## Arquitectura y entrenamiento

No hay informacion en la model card sobre la arquitectura del modelo original Prism (transformer de difusion, MoE, SSM u otra variante), ni sobre el dataset de entrenamiento, el numero de tokens o si hubo fases de RLHF o DPO. Lo unico documentado es el proceso de cuantizacion de este derivado.

Lo que si se describe es el mecanismo de compresion: las capas `Linear` del checkpoint BF16 se empaquetan en bloques de 6 bits con tamano de grupo 64 y escalas de cuantizacion en FP32, manteniendo el resto de tensores sin tocar. El resultado son 52 shards que suman 27,1 GB frente a los 65,3 GB del BF16 original (una reduccion de aproximadamente el 58 %). El repositorio incluye un `manifest.json` con los SHA-256 de cada shard, un mapa de tensores, registros de cuantizacion por modulo y trazabilidad de procedencia, ademas de un paquete `loader/prism_quant/` con `quant_loader.py` (verifica el hash de cada shard antes de cargar), `quant.py` (implementa el formato Q6 y `Q6Linear`) y `runtime.py`. La carga se hace por bloques con offload a CPU. El manifiesto global tiene SHA-256 `74eb0f622587458b4eb7c4f18d9de4ea95ee56af85141cd3824cc778602963e1`.

## Capacidades

- Generacion de video a partir de imagen (image-to-video), con pipeline declarado `image-to-video`.
- Generacion conjunta de video y audio (tag `joint-video-audio`).
- Produccion de clips cortos: el autor reporta pruebas con 121 frames a 480p y 24 fps (~5 segundos) y con 61 frames a 720p nativo.
- Transcripcion ASR exacta de los prompts verificada por el autor (es decir, el audio generado se corresponde con el texto solicitado), aunque esto no se presenta como validacion de calidad.
- Cuantizacion y carga verificable mediante hashes SHA-256 por shard.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision general, ni capacidades multilingues.

## Casos de uso

- Investigacion en cuantizacion: el repositorio sirve como caso de estudio reproducible de un esquema de 6 bits por bloques (grupo 64, escalas FP32) aplicado a un modelo de video y audio, con manifiesto de hashes y script de conversion resumible (`loader/convert.py`) para regenerar los shards desde el checkpoint BF16 oficial.
- Comparativas de hardware en una sola GPU: permite medir VRAM pico, RAM de sistema y tiempos de generacion en tarjetas de consumo, algo util para dimensionar equipos antes de adquirir hardware profesional.
- Previsualizacion de storyboards: generar clips de ~5 segundos a 480p en unos 30 minutos sirve para validar encuadres y ritmo de una secuencia antes de un render final en BF16 de mayor calidad.
- Prototipado rapido de efectos imagen-a-video en local: al caber en 16 GB de VRAM, se puede montar un entorno de pruebas ofline sin depender de servicios en la nube.
- Pruebas de sincronizacion labial y animacion de personajes: el modelo esta pensado para generar video con audio asociado, por lo que es un banco de pruebas para pipelines de talking-head, asumiendo las limitaciones conocidas de boca y dientes.
- Demos tecnicas y divulgacion: util para ilustrar en articulos o charlas las diferencias de calidad entre BF16 y 6 bits en un modelo multimodal.
- Evaluacion de estrategias de offload: el runtime carga shards por bloques con offload a CPU, lo que permite estudiar el equilibrio entre RAM de host y memoria de GPU en inferencia de modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas tipo MMLU, HumanEval o GSM8K (no aplicables a un modelo de generacion de video) ni comparativas objetivas de calidad visual o de audio con el checkpoint BF16 de origen. Los unicos datos medidos son de rendimiento en hardware, recogidos en la seccion siguiente.

| Medicion | Valor reportado |
|---|---|
| Clip 480p, 24 fps, 121 frames, 50 pasos | ~30 minutos |
| Clip 720p nativo, 61 frames, 50 pasos | ~31-34 minutos |
| VRAM pico (asignacion CUDA) | 11,7 GB |
| VRAM reservada | 13,3 GB |
| RAM de sistema pico (RSS del proceso) | ~44 GB |

## Requisitos de hardware

- VRAM estimada: 16 GB es suficiente en las pruebas del autor; se requiere un minimo de 24 GiB de memoria de GPU libre antes de arrancar el runtime, con asignacion CUDA pico de 11,7 GB y reserva de 13,3 GB.
- RAM de host: el launcher exige al menos 45 GiB libres antes de iniciar una ejecucion; el pico de RSS observado fue de ~44 GB, coherente con la carga por bloques con offload a CPU.
- GPU recomendadas: RTX 5090 (unica tarjeta sobre la que el autor ha medido). Cualquier GPU con 16 GB o mas de VRAM podria ser viable, pero no hay datos publicados para otros modelos.
- Cabe en GPU de consumo: si, segun las pruebas en RTX 5090.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `prism-custom-q6` no es GGUF y los cargadores estandar de Prism no lo leen. Es necesario usar el paquete `prism_quant` junto con el codigo de inferencia de Prism y las dependencias PyTorch y `safetensors`.
- Latencia y throughput: aproximadamente 30 minutos por clip de 121 frames a 480p (unos 4 frames por segundo efectivos) y 31-34 minutos para 61 frames a 720p, ambos con 50 pasos de muestreo.
- Almacenamiento: 27,1 GB para los pesos cuantizados, mas el espacio adicional que ocupe el checkpoint BF16 si se conserva.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| atomtanstudio/Prism-Q6 | no disponible (ver estimacion en especificaciones) | Safetensors con Q6 personalizado | 27,1 GB | MIT | Publico en HuggingFace |
| FrancisRing/Prism (modelo base) | no disponible | BF16 | 65,3 GB | MIT | Publico en HuggingFace |
| Tencent-Hunyuan/Prism (codigo oficial) | no disponible | BF16 (checkpoint oficial) | no disponible | MIT | Codigo en GitHub |

No se dispone de informacion sobre otros modelos comparables de generacion conjunta de video y audio cuantizados en la informacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto alfa (`blocks-q6-v1`): el propio autor lo describe como un primer intento con cero optimizaciones. No debe tratarse como un preset terminado.
- Calidad experimental: en los clips completados se observan articulacion restringida, artefactos en boca y dientes, y sincronizacion labial sin verificar.
- Audio potencialmente distorsionado. La verificacion de transcripcion ASR de los prompts no equivale a una validacion de calidad sonora.
- Sesgos conocidos: no disponibles. La model card no documenta sesgos demograficos, culturales ni de otro tipo.
- Riesgo de alucinacion: no evaluado en este derivado. Los artefactos visuales y sonoros reportados son el principal riesgo de calidad observado.
- Limitaciones de contexto e idioma: no disponibles; no hay datos sobre ventana de contexto ni sobre idiomas soportados.
- Restricciones de licencia: licencia MIT heredada del release base de Prism, sin restricciones adicionales anadidas por este repositorio, por lo que no se anaden clausulas de uso comercial.
- Compatibilidad: el formato Q6 es propietario y no es legible por cargadores estandar de Prism ni por herramientas habituales de cuantizacion (GGUF, GPTQ, AWQ). Requiere usar `prism_quant` con el codigo de inferencia de Prism.
- Requisitos de memoria del host elevados: 45 GiB de RAM libre y 24 GiB de VRAM libre antes de arrancar, lo que limita el despliegue a equipos con bastante memoria de sistema.
- Para produccion, se recomienda usar el checkpoint BF16 original y reservar este artefacto para experimentacion y comparativas de hardware.

## Enlaces

- Repositorio HuggingFace de Prism-Q6: https://huggingface.co/atomtanstudio/Prism-Q6
- Modelo base FrancisRing/Prism: https://huggingface.co/FrancisRing/Prism
- Codigo oficial de Prism (Tencent Hunyuan): https://github.com/Tencent-Hunyuan/Prism
- Anuncio del autor en X: https://x.com/atomtanstudio/status/2107415066299809977
- Perfil del autor en HuggingFace: https://huggingface.co/atomtanstudio
- Perfil del autor en GitHub: https://github.com/atomtanstudio
