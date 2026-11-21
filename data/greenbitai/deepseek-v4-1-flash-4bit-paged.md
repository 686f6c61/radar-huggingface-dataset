# GreenBitAI/DeepSeek-V4.1-Flash-4bit-paged

## Resumen

DeepSeek-V4.1-Flash-4bit-paged es una build cuantizada a 4 bits del modelo DeepSeek-V4.1-Flash de DeepSeek, publicada por GreenBitAI. Se trata de una arquitectura de mezcla de expertos (MoE) con capacidad multimodal imagen-texto, distribuida en un formato de "expert paging" que separa los pesos residentes de los expertos enrutados en contenedores independientes, de modo que la maquina carga solo lo que necesita en cada momento en lugar de todo el modelo. El repositorio ocupa 436 GB, con 8.784 millones de parametros totales reportados en safetensors.

La relevancia de esta publicacion radica en que hace viable ejecutar un modelo de gran tamano en hardware de consumo profesional (Apple Silicon de gama alta y NVIDIA DGX Spark) mediante paginacion desde SSD, en lugar de exigir un cluster con VRAM agregada. El modelo no funciona con `mlx-lm` estandar: requiere el binario propietario `gbx_lm`, firmado y notarizado para macOS, que expone una API compatible con OpenAI en el puerto 11688.

La licencia es MIT, lo que facilita su uso comercial, aunque el binario de ejecucion y el formato de contenedores son especificos del ecosistema GreenBitAI. La build conserva la cuantizacion mixta 4/8 bits, el tokenizador, la plantilla de chat y la licencia del checkpoint intermedio `pipenetwork/DeepSeek-V4.1-Flash-MLX-mixed-4_8bit`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (imagen-texto), familia deepseek_v41 |
| Parametros totales | 8.784.305.264 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit mixta (4/8 bits, heredada de `pipenetwork/DeepSeek-V4.1-Flash-MLX-mixed-4_8bit`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (residentes) + `.bin` (expertos enrutados) + contenedores `engram-layer-*` y `mtp/`; no compatible con `mlx-lm` |
| Tamano del repositorio | 436 GB (406,10 GiB efectivos) |
| Desglose de contenedores | `model.safetensors` 10,48 GiB; `experts.bin` 284,77 GiB; `engram-layer-1/` 51,50 GiB; `engram-layer-14/` 51,50 GiB; `mtp/` 7,85 GiB |
| Libreria de ejecucion | `gbx_lm` (binario unico, no instalable via pip) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos (MoE) con capacidad multimodal, identificado en los tags como `deepseek_v41` y `mixture-of-experts`. El modelo base es DeepSeek-V4.1-Flash de DeepSeek; esta build no reentrena ni modifica la arquitectura, sino que reorganiza los pesos cuantizados en contenedores paginables. Los pesos residentes (10,48 GiB) se mantienen en memoria, mientras que los expertos enrutados (284,77 GiB) y las tablas "engram" de las capas 1 y 14 (51,50 GiB cada una) se leen desde disco bajo demanda.

La innovacion tecnica principal es el "expert paging": cada token enruta a unos pocos expertos, y los que ya estan en memoria no cuestan nada de leer, mientras que los ausentes deben cargarse desde SSD antes de completar el token. El sistema incluye ademas un cabezal draft DSpark de DeepSeek (`mtp/`, 7,85 GiB) para decodificacion especulativa, desactivado por defecto y activable con `GBX_DEEPSEEK_MTP=on`. Segun la model card, la build fue verificada en tiempo de compilacion contra el checkpoint fuente: logits identicos bit a bit en 5 prompts hasta 160 tokens (uno mas largo difiere en como maximo 15, mismo token greedy) y comparacion capa por capa contra la version residente (40 capas x 2 muestras exactas, pico de 377,86 GiB). No se detallan volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO, ya que esta build hereda el entrenamiento del modelo base sin modificarlo.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagenes: acepta entradas `image_url` (URL http(s) o base64 `data:`) en formato OpenAI, y ficheros via `--images` en CLI.
- API compatible con OpenAI (`/v1/chat/completions`) servida en el puerto 11688.
- Decodificacion especulativa opcional mediante el cabezal draft DSpark (`GBX_DEEPSEEK_MTP=on`), compatible tambien con entradas de imagen.
- Ejecucion en Apple Silicon (macOS 15.0+) y en NVIDIA DGX Spark (GB10, arm64, glibc 2.39+, driver CUDA 13).
- Control de paginacion mediante variables de entorno: `GBX_PAGING=off` mantiene los expertos residentes y `GBX_ENGRAM=off` mantiene las tablas engram residentes.
- No se documentan capacidades de tool calling, function calling, agentes, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Inferencia local de un modelo MoE grande en un Mac Studio de 512 GB: con aproximadamente 306 GB residentes y el resto paginado desde SSD, permite servir el modelo sin cluster ni VRAM agregada.
- Prototipado multimodal en estacion de trabajo Apple Silicon: analisis de imagenes junto a texto conversacional mediante la API OpenAI-compatible, util para validacion de pipelines de vision-lenguaje antes de escalar a produccion.
- Despliegue en NVIDIA DGX Spark (128 GB): el modelo no cabe completo, pero la paginacion de expertos desde SSD permite ejecutarlo en un equipo compacto para demos y pruebas de integracion.
- Experimentacion con decodificacion especulativa: activar `GBX_DEEPSEEK_MTP=on` para medir el impacto del cabezal DSpark en latencia sobre cargas reales, algo que ninguna build MLX publicada incluye segun la model card.
- Evaluacion de cuantizacion 4-bit mixta en tareas de razonamiento: comparar la salida de esta build contra el checkpoint original usando las pruebas de equivalencia de logits documentadas.
- Servicio de chat interno con contexto de imagen: montar un endpoint local compatible con OpenAI para herramientas internas que ya consumen ese formato, sin dependencia de proveedores cloud.
- Investigacion sobre estrategias de paginacion de expertos: el repositorio separa residentes, expertos y tablas engram en contenedores distintos, lo que facilita estudiar el efecto del tamano de cache en el throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta pruebas de equivalencia funcional: logits identicos bit a bit en 5 prompts hasta 160 tokens (el mas largo difiere en como maximo 15, con el mismo token greedy en todo momento) y verificacion capa por capa contra la version residente (40 capas x 2 muestras exactas, pico de 377,86 GiB). No se ofrecen cifras de latencia ni throughput, y el autor indica explicitamente que no ha medido el rendimiento de paginacion en distintas configuraciones de maquina.

## Requisitos de hardware

- VRAM/RAM residente: aproximadamente 306 GB en un Mac Studio de 512 GB con espacio de sobra; en maquinas menores se retiene menos y se lee mas desde SSD.
- Almacenamiento: el repositorio ocupa 436 GB; se recomienda SSD rapido, ya que la latencia de paginacion depende de la velocidad de disco.
- Apple Silicon: macOS 15.0 o superior, arm64, sin build para Intel; binario `gbx_lm-darwin-arm64.tar.gz` firmado con Developer ID y notarizado.
- Linux: exclusivamente NVIDIA DGX Spark (GB10), arm64 con glibc 2.39 o superior (DGX OS / Ubuntu 24.04) y driver NVIDIA con soporte CUDA 13; no se requiere toolkit CUDA porque el binario incluye las librerias.
- GPU de consumo: no se documenta soporte para RTX 4090 ni otras GPU consumer; el soporte Linux esta limitado a DGX Spark.
- Despliegue: unicamente mediante el binario `gbx_lm` (v0.8.1 o superior en Linux); no hay soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato de contenedores no lo lee `mlx-lm`.
- Latencia y throughput: no disponibles; el autor no publica cifras y senala que la espera depende de cuantos expertos quepan en memoria y de la velocidad del SSD.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Ejecucion |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-4bit-paged (esta build) | 8.784 M totales | no disponible | 4-bit mixta con paginacion | MIT | `gbx_lm` en Apple Silicon y DGX Spark |
| `pipenetwork/DeepSeek-V4.1-Flash-MLX-mixed-4_8bit` | no disponible | no disponible | 4/8-bit mixta | no disponible | MLX (sin paginacion) |
| `deepseek-ai/DeepSeek-V4.1-Flash` (base) | no disponible | no disponible | fp8 (segun tags) | no disponible | requiere infraestructura completa |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de un binario propietario: `gbx_lm` es un ejecutable unico firmado, sin instalacion via pip y sin codigo fuente publicado en la informacion disponible; esto limita la auditabilidad y la portabilidad.
- Compatibilidad restringida: solo Apple Silicon (macOS 15.0+) y NVIDIA DGX Spark; no hay soporte para GPU consumer, Intel ni otros servidores Linux.
- Rendimiento dependiente del disco: la latencia por token crece cuando los expertos enrutados no estan en memoria; el autor no cuantifica esta penalizacion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad en la informacion disponible.
- Sesgos: no se documentan evaluaciones de sesgo ni composicion del dataset de entrenamiento.
- Idiomas: no se especifican los idiomas soportados.
- Contexto: no se publica la longitud maxima de contexto.
- Licencia MIT sobre los pesos, pero el cabezal draft `mtp/` se convierte desde `deepseek-ai/DeepSeek-V4.1-Flash` y mantiene la licencia de ese modelo, que puede diferir de MIT.
- Instalacion fragil: actualizar requiere borrar `~/.libra/cache/onefile/gbx_lm`; en caso contrario macOS puede matar el proceso con `Killed: 9`.
- Verificacion funcional limitada: las pruebas de equivalencia cubren 5 prompts y 40 capas, no una evaluacion exhaustiva de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/GreenBitAI/DeepSeek-V4.1-Flash-4bit-paged
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Checkpoint intermedio: https://huggingface.co/pipenetwork/DeepSeek-V4.1-Flash-MLX-mixed-4_8bit
- Repositorio del runtime: https://github.com/GreenBitAI/gbx-lm
- Releases del binario: https://github.com/GreenBitAI/gbx-lm/releases/latest
