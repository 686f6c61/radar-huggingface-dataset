# GreenBitAI/GLM-5.3-Flash-4bit-paged

## Resumen

GLM-5.3-Flash-4bit-paged es una distribucion cuantizada a 4 bits del modelo multimodal GLM-5.3-Flash, publicada por GreenBitAI sobre el checkpoint de pipenetwork. Se trata de un modelo de mezcla de expertos (MoE) con capacidad de entrada imagen-texto, disenado para ejecutarse en Apple Silicon mediante un binario propietario llamado `gbx_lm`. Su rasgo diferencial es el "expert paging": los pesos de los expertos enrutados viven en un contenedor separado (`experts.bin`, 159,47 GiB) que se lee del disco bajo demanda, de modo que la maquina solo carga en memoria lo que necesita en cada momento.

El modelo suma unos 9.480 millones de parametros segun los safetensors publicados, aunque el repositorio ocupa 181,8 GB, lo que refleja el gran numero de expertos almacenados en formato de 4 bits. La longitud de contexto no se especifica en la informacion disponible.

Es relevante ahora porque propone una via distinta para ejecutar modelos MoE grandes en hardware de consumo: en lugar de exigir que todos los pesos quepan en memoria unificada, el sistema pagina los expertos desde el SSD. En un Mac Studio de 512 GB el modelo se asienta en unos 172 GB residentes; en un DGX Spark de 128 GB no cabe y los expertos se transmiten desde disco, con la penalizacion de latencia que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal, transformer; tag `glm5_next` |
| Parametros totales | 9.484.631.870 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (unica variante publicada en este repo) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, 5,89 GiB) + `experts.bin` (159,47 GiB) + `mtp/` (3,90 GiB); no compatible con `mlx-lm` |

## Arquitectura y entrenamiento

La model card describe un transformer de mezcla de expertos con enrutamiento por token: cada token se dirige a unos pocos expertos, y los que no estan en memoria deben leerse del disco antes de completar ese token. El checkpoint base es `pipenetwork/GLM-5.3-Flash-MLX-4bit`, del que esta build hereda cuantizacion, tokenizer, plantilla de chat y licencia sin cambios. El repositorio incluye ademas una cabeza de borrador (`mtp/`, 3,90 GiB) para decodificacion especulativa, desactivada por defecto y activable con `GBX_GLM53_MTP=on`.

La innovacion tecnica principal es el empaquetado por paginas: los pesos residentes (5,89 GiB) se separan de los expertos enrutados (159,47 GiB) en contenedores propios, lo que permite que una maquina cargue solo la fraccion que necesita. El autor verifico en tiempo de compilacion una comprobacion de equivalencia capa por capa frente al checkpoint residente: 42 capas x 2 extracciones exactas, con un pico de 60,93 GiB durante esa prueba. No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Entrada multimodal imagen-texto: acepta imagenes como partes `image_url` (URL http(s) o `data:` en base64) en la API compatible con OpenAI.
- Razonamiento multi-paso: la model card advierte que el modelo razona antes de responder y que ese razonamiento consume tokens del limite `--max-tokens`.
- Decodificacion especulativa opcional mediante cabeza de borrador (`GBX_GLM53_MTP=on`).
- Servidor con API compatible con OpenAI en el puerto 11688, que segun la model card habla tres protocolos de cable en el mismo puerto (la descripcion se corta en el texto disponible).
- Ejecucion en modo servidor, generacion de un solo prompt (`gbx_lm generate`) y chat interactivo (`gbx_lm chat`).
- Soporte de agentes de codificacion a traves de los protocolos del servidor.

## Casos de uso

- Asistente conversacional multimodal en local: con un Mac Studio de memoria amplia, el modelo atiende peticiones de texto e imagen por API compatible con OpenAI sin salir del equipo, lo que resulta adecuado para entornos con requisitos de privacidad.
- Agente de codificacion en estacion de trabajo Apple Silicon: el servidor expone protocolos de agente en el puerto 11688, de modo que herramientas tipo IDE o CLI pueden conectarse y aprovechar el razonamiento multi-paso del modelo.
- Analisis de imagenes en lote desde linea de comandos: `gbx_lm generate --images foto.jpg --prompt ...` permite procesar capturas, diagramas o documentos escaneados en scripts sin montar un servidor.
- Prototipado de aplicaciones bilingues en y zh: el modelo cubre ambos idiomas de forma nativa, util para productos dirigidos a mercados chino y angloparlante.
- Experimentacion con paginacion de expertos: investigadores pueden medir el impacto del ancho de banda de SSD en la latencia por token variando la memoria disponible de la maquina, ya que el propio autor senala que no ha medido esta relacion entre tamanos.
- Despliegue en DGX Spark para pruebas de inferencia MoE en ARM64: con 128 GB el modelo no cabe y pagina desde SSD, lo que sirve para validar flujos Linux arm64 con CUDA 13 antes de mover cargas a hardware mayor.
- Chat interactivo de uso personal: `gbx_lm chat` con `--max-tokens` generoso permite sesiones multi-turno con razonamiento previo a la respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de validacion aportada es la comprobacion de equivalencia capa por capa frente al checkpoint residente (42 capas x 2 extracciones exactas, pico de 60,93 GiB), que verifica correccion numerica pero no calidad. El autor indica explicitamente que no ha medido la degradacion de latencia segun el tamano de maquina y que no dara una cifra estimada.

## Requisitos de hardware

- VRAM/memoria unificada: variable por diseno. En un Mac Studio de 512 GB el modelo se asienta en unos 172 GB residentes; en maquinas menores parte de los expertos se lee del SSD.
- Mac: macOS 15.0 o superior, chip Apple Silicon (arm64) exclusivamente; no hay build para Intel.
- Linux: solo NVIDIA DGX Spark (GB10), arm64, glibc 2.39 o superior (DGX OS / Ubuntu 24.04), driver con soporte CUDA 13. No requiere toolkit CUDA ni Python.
- No cabe en GPU de consumo tipo RTX 4090: el repositorio ocupa 181,8 GB y el contenedor de expertos solo ya son 159,47 GiB.
- Despliegue: exclusivamente mediante el binario firmado `gbx_lm` (descarga desde GitHub Releases); no hay `pip install` y los contenedores no los lee `mlx-lm`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Variables de entorno relevantes: `GBX_PAGING=off` fuerza los expertos residentes; `GBX_GLM53_MTP=on` activa la cabeza de borrador; `HF_HOME` y `HF_TOKEN` controlan cache y acceso al Hub.
- Latencia y throughput: no disponibles; dependen de la proporcion de expertos en memoria y de la velocidad del SSD, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-4bit-paged (este) | 9.484.631.870 | no disponible | MIT | Hugging Face + binario `gbx_lm` | Paginacion de expertos, solo Apple Silicon y DGX Spark |
| pipenetwork/GLM-5.3-Flash-MLX-4bit | no disponible | no disponible | no disponible | Hugging Face | Checkpoint base; requiere que los pesos quepan en memoria |
| Otros modelos MoE de ~9B comparables | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

No se dispone de informacion sobre alternativas adicionales de la misma categoria en el material consultado.

## Limitaciones y advertencias

- Solo dos idiomas declarados (en, zh); el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion inherente a los modelos generativos; no se aportan evaluaciones de fidelidad.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Longitud de contexto no especificada, lo que impide planificar cargas con ventanas largas.
- El rendimiento depende criticamente del subsistema de disco: cada token puede requerir lecturas de SSD si los expertos no estan residentes, y el autor no cuantifica la penalizacion.
- Plataformas soportadas muy restringidas: Apple Silicon con macOS 15+ o DGX Spark con CUDA 13; no hay soporte para GPUs NVIDIA convencionales ni para Linux x86.
- Dependencia de un binario propietario y firmado (`gbx_lm`) en lugar de un stack estandar de Python; no es compatible con `mlx-lm`.
- La actualizacion del binario exige borrar el directorio de desempaquetado previo (`~/.libra/cache/onefile/gbx_lm`); en Mac, no hacerlo provoca `Killed: 9`.
- Licencia MIT, por lo que el uso comercial esta permitido, pero la licencia del checkpoint base se hereda y no se detalla en la informacion disponible.
- El razonamiento previo a la respuesta consume tokens del limite configurado; con los valores por defecto (100 en `generate`, 256 en `chat`) las respuestas pueden truncarse.
- La model card esta incompleta en el apartado de agentes de codificacion (el texto se corta), por lo que el detalle de los tres protocolos no esta disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GreenBitAI/GLM-5.3-Flash-4bit-paged
- Checkpoint base: https://huggingface.co/pipenetwork/GLM-5.3-Flash-MLX-4bit
- Binario `gbx_lm` (releases): https://github.com/GreenBitAI/gbx-lm/releases/latest
- Organizacion GreenBitAI en GitHub: https://github.com/GreenBitAI
