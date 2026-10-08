# josand/MLX-Reason-CT

## Resumen

MLX-Reason-CT es un port nativo a MLX del modelo NVIDIA NV-Reason-CT, un modelo de vision-lenguaje 3D disenado para interpretar tomografias computarizadas (TC) de torax y abdomen. Lo desarrolla Joseph Sandoval (repositorio MedMLX) y su proposito es permitir la inferencia local de razonamiento sobre volumetricos 3D y generacion de informes radiologicos en equipos Apple Silicon, sin necesidad de GPUs NVIDIA ni de CUDA. El modelo original, publicado por NVIDIA, combina un transformer de vision 3D nativo (Primus, inicializado con pesos COLIPRI) con un modelo de lenguaje Qwen3.5-4B, y genera cadenas de razonamiento que imitan la revision sistematica por regiones anatomicas que hace un radiologo.

La relevancia de este port concreto esta en la accesibilidad: el checkpoint original esta pensado para inferencia en CUDA, mientras que esta version redistribuye los pesos en FP32 (17,4 GB) para ejecutarse sobre Metal en macOS arm64, con un runtime propio denominado `mlx-reason-ct`. El autor documenta verificacion de paridad frente a la ejecucion CUDA de referencia (`real-ct-cuda-parity.json`, `standalone-verification.json`) y perfiles aritmeticos BF16 explicitos sobre Metal, manteniendo FP32 como valor por defecto.

Se trata de un modelo de nicho y de uso exclusivamente investigador: acumula 34 descargas y 0 likes en HuggingFace, la model card declara explicitamente que no esta destinado a diagnostico clinico ni a decisiones terapeuticas, y su licencia de pesos es OpenMDW-1.1, con los terminos subyacentes de Qwen3.5 bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje 3D: transformer de vision nativo 3D (Primus, inicializado con pesos COLIPRI) + modelo de lenguaje Qwen3.5-4B, con paso de todos los tokens visuales y sus coordenadas 3D al decodificador de lenguaje sin fusion espacial adicional |
| Parametros totales | No disponible de forma agregada; el componente de lenguaje es Qwen3.5-4B y el tamano del codificador de vision no se detalla en la informacion disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se ofrecen pesos cuantizados; inferencia en FP32 por defecto, con perfiles aritmeticos BF16 explicitos sobre Metal |
| Idiomas soportados | Ingles (en) |
| Licencia | Pesos: OpenMDW-1.1 (Copyright (c) 2026 NVIDIA Corporation & Affiliates). Terminos subyacentes de Qwen3.5: Apache-2.0. Codigo del port: Apache-2.0 (Copyright (c) 2026 Joseph Sandoval) |
| Formato de pesos | Pesos MLX en FP32 (17,4 GB); el contenedor no se especifica de forma explicita en la informacion disponible. El repositorio incluye `tokenizer.json` y ficheros de verificacion de paridad |

## Arquitectura y entrenamiento

La arquitectura del modelo subyacente es un VLM de volumetricos 3D: un codificador de vision transformer 3D nativo procesa el volumen de TC completo y transfiere todos los tokens visuales, junto con sus coordenadas 3D explicitas, al decodificador de lenguaje, sin aplicar una fusion espacial posterior. Esa decision de diseno busca preservar la informacion espacial volumetrica, algo critico en TC de torax y abdomen donde la localizacion de una lesion respecto a estructuras anatomicas es parte del hallazgo. El decodificador es Qwen3.5-4B, y el modelo esta entrenado para generar razonamiento guiado por radiologo (chain-of-thought) que recorre regiones anatomicas de forma sistematica antes de emitir el informe estructurado.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO. El port a MLX no implica reentrenamiento: los pesos FP32 se convierten directamente desde el checkpoint BF16 original, segun declara el autor. La innovacion tecnica destacable de esta ficha es el propio port: implementacion nativa en MLX con aceleracion Metal, soporte de entrada NIfTI 3D local, perfiles aritmeticos BF16 sobre Metal y una verificacion de paridad documentada frente a la ejecucion CUDA de referencia. El modelo hereda del trabajo original NV-Reason-CXR la metodologia de razonamiento por cadena de pensamiento aplicada a imagen volumetrica.

## Capacidades

- Generacion de informes estructurados de TC de torax y abdomen a partir de un volumen NIfTI.
- Razonamiento por cadena de pensamiento con `--enable-thinking`, orientado a replicar la revision sistematica de regiones anatomicas por parte de un radiologo.
- Respuesta a preguntas sobre el volumen de TC mediante el parametro `--prompt` (CT question answering).
- Analisis de imagen volumetrica 3D nativa, no limitado a cortes 2D.
- Clasificacion de anomalias segun la descripcion del modelo original de NVIDIA.
- Capacidad multimodal imagen-texto a texto (pipeline `image-text-to-text`).
- Salida estructurada en ficheros: `report.txt` con la respuesta generada, `model_response.json` con la respuesta, el razonamiento y metadatos de generacion, y `run.json` con metadatos de ejecucion.
- Soporte de entrada local en formato NIfTI (`.nii` o `.nii.gz`) con valores en unidades Hounsfield y geometria espacial valida.
- No se documenta soporte de tool calling, function calling ni de comportamiento agentico multi-paso.
- Modelo unicamente en ingles.

## Casos de uso

- Investigacion en radiologia asistida por IA: el modelo genera informes estructurados de TC de torax y abdomen sobre volumetricos 3D completos, lo que permite estudiar la calidad de la generacion automatica de hallazgos frente a informes de referencia en un entorno de laboratorio.
- Educacion medica y formacion de residentes: el modo de razonamiento (`--enable-thinking`) expone una cadena de pensamiento que recorre regiones anatomicas, util como material didactico para ilustrar el metodo de lectura sistematica de un TC.
- Preguntas y respuestas sobre casos concretos: usando `--prompt`, un investigador puede interrogar al modelo sobre hallazgos especificos del volumen (por ejemplo, presencia de alteraciones en un territorio concreto) sin necesidad de escribir un pipeline de clasificacion propio.
- Prototipado en equipos Apple Silicon: al ejecutarse sobre Metal en macOS arm64 con un runtime de linea de comandos, permite iterar sobre pipelines de investigacion en un Mac sin acceso a GPU NVIDIA ni a CUDA, reduciendo la dependencia de infraestructura de centro de datos.
- Reproduccion y contraste de resultados: los ficheros de paridad frente a CUDA incluidos en el repositorio permiten a un equipo verificar que su ejecucion local en MLX reproduce el comportamiento de la implementacion de referencia antes de usar el modelo en un estudio.
- Desarrollo de herramientas de revision asistida: los metadatos de generacion (`model_response.json`, `run.json`) facilitan la integracion del modelo en visores o estaciones de investigacion que necesiten trazar que se genero, cuando y con que configuracion.
- Analisis retrospectivo de cohortes: el procesamiento por lotes de volumenes NIfTI con el comando `report` permite generar descripciones estructuradas sobre colecciones de estudios con fines de minado de datos, siempre en contexto de investigacion y con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El repositorio incluye ficheros de verificacion (`real-ct-cuda-parity.json`, `standalone-verification.json`) que documentan la paridad frente a la ejecucion CUDA de referencia, pero no se proporcionan cifras de rendimiento en la informacion suministrada.

## Requisitos de hardware

- Plataforma soportada: exclusivamente macOS arm64 sobre un Mac Apple Silicon con acceso a GPU Metal. La inferencia falla de forma explicita cuando Metal no esta disponible.
- Memoria: los pesos ocupan 17,4 GB y el pico de memoria MLX medido es de aproximadamente 22,7 GB. Hay que anadir memoria unificada adicional para preprocesamiento, macOS y otras aplicaciones en ejecucion.
- No hay soporte para GPU NVIDIA/CUDA ni para GPU de consumo del ecosistema PC: el modelo no se puede ejecutar en una RTX 4090 ni en una A100 o H100 con este runtime.
- GPU Apple Silicon recomendadas: no disponibles en la informacion proporcionada. Por el pico de 22,7 GB, se requiere un Mac con memoria unificada holgada por encima de esa cifra.
- Cuantizacion: no se ofrecen pesos cuantizados (no hay GGUF ni perfiles de 4 u 8 bits), por lo que no cabe esperar reducciones de memoria por esta via.
- Despliegue: runtime propietario `mlx-reason-ct`, instalado desde el wheel publicado en GitHub Releases (`mlx_reason_ct-0.2.1-py3-none-any.whl`) con `uv tool install` o `pip install` sobre Python 3.12. No es compatible con `mlx-vlm`, ni con cargadores genericos de `mlx-lm`, ni con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Desarrollador | Parametros | Contexto | Entrada | Plataforma | Licencia |
|---|---|---|---|---|---|---|
| MLX-Reason-CT | Joseph Sandoval (port), sobre NVIDIA NV-Reason-CT | Qwen3.5-4B + ViT 3D (total no disponible) | No disponible | NIfTI 3D (TC torax/abdomen), solo ingles | macOS arm64 + Metal (MLX) | Pesos OpenMDW-1.1; codigo del port Apache-2.0 |
| NV-Reason-CT | NVIDIA | Qwen3.5-4B + ViT 3D Primus (total no disponible) | No disponible | NIfTI/volumetrico 3D, solo ingles | CUDA (GPU NVIDIA) | OpenMDW-1.1 |
| NV-Reason-CXR | NVIDIA | No disponible | No disponible | Radiografia de torax (2D), solo ingles | CUDA (GPU NVIDIA) | No disponible |

No se dispone de datos de benchmarks ni de especificaciones completas del resto de alternativas en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Uso previsto exclusivamente investigador y educativo. La model card indica de forma explicita que no esta destinado a diagnostico clinico ni a decisiones de tratamiento, y que las salidas requieren revision humana.
- Riesgo de alucinacion: al ser un modelo generativo de lenguaje sobre imagen medica, puede producir hallazgos o descripciones no sustentados por el volumen de entrada. No se documentan tasas de error ni evaluaciones de fiabilidad.
- Sesgos: no se documentan analisis de sesgo por origen de datos, demografia del paciente, equipo de adquisicion o protocolo de exploracion.
- Entrada restringida: solo admite un volumen 3D en NIfTI (`.nii` o `.nii.gz`) con valores en unidades Hounsfield y geometria espacial valida. No soporta DICOM ni imagenes 2D.
- Problema conocido en el recorte (`crop`): el recorte heredado del modelo original localiza el torax a partir del aire encerrado y, en exploraciones de cuerpo entero, especialmente con los brazos elevados, puede seleccionar cabeza y cuello en lugar del torax. Se recomienda recortar el volumen a torax o abdomen antes de ejecutar.
- Idioma: el modelo solo trabaja en ingles.
- Hardware: dependencia exclusiva de macOS arm64 con Metal y del runtime `mlx-reason-ct`. No funciona con `mlx-vlm`, `mlx-lm`, vLLM, llama.cpp, Ollama ni TGI, lo que limita el despliegue en infraestructura de servidor convencional.
- Memoria: el pico de 22,7 GB de MLX obliga a Macs con memoria unificada alta y deja poco margen para otros procesos.
- Sin cuantizacion disponible, no hay via sencilla para reducir el consumo de memoria del modelo.
- Licencia: los pesos se distribuyen bajo OpenMDW-1.1 (Copyright (c) 2026 NVIDIA Corporation & Affiliates), con los terminos subyacentes de Qwen3.5 bajo Apache-2.0. Es imprescindible revisar el texto completo de OpenMDW-1.1 antes de cualquier uso comercial, ya que la informacion disponible no detalla sus condiciones de explotacion.
- Madurez: con 34 descargas y 0 likes, la validacion por parte de la comunidad es practicamente nula, y el modelo depende de un runtime externo con referencias a componentes `darwin-arm64` cuyos limites se documentan en el repositorio complementario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/josand/MLX-Reason-CT
- Arbol de ficheros del repositorio: https://huggingface.co/josand/MLX-Reason-CT/tree/main
- Modelo original de NVIDIA: https://huggingface.co/nvidia/NV-Reason-CT
- Model card y limitaciones del modelo original: https://huggingface.co/nvidia/NV-Reason-CT
- Repositorio del port MLX: https://github.com/MedMLX/MLX-Reason-CT
- Documentacion de uso del port: https://github.com/MedMLX/MLX-Reason-CT/blob/main/docs/usage.md
- Releases del runtime `mlx-reason-ct`: https://github.com/MedMLX/MLX-Reason-CT/releases
- Avisos de terceros: https://github.com/MedMLX/MLX-Reason-CT/blob/main/THIRD_PARTY_NOTICES.md
- Repositorio del modelo original: https://github.com/NVIDIA-Medtech/NV-Reason-CT
- Paper de NV-Reason-CT (arXiv 2609.27511): https://arxiv.org/abs/2609.27511
- Blog de NVIDIA sobre NV-Reason-CT: https://developer.nvidia.com/blog/introducing-nv-reason-ct-open-3d-ct-vlm-for-radiologist-chain-of-thought-reasoning/
- Ficha en free2aitools: https://free2aitools.com/model/josand/mlx-reason-ct
- Licencia de los pesos (OpenMDW-1.1): https://huggingface.co/josand/MLX-Reason-CT/blob/main/LICENSE
- Terminos Apache-2.0 de Qwen3.5: https://huggingface.co/josand/MLX-Reason-CT/blob/main/APACHE-2.0.txt
