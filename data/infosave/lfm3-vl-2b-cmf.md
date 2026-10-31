# infosave/LFM3-VL-2B-cmf

## Resumen

LFM3-VL-2B — CMF es una versión cuantizada y empaquetada en formato CMF del modelo vision-language LFM3-VL-2B de Liquid AI, un modelo multimodal de aproximadamente 2 mil millones de parámetros que combina un codificador de visión propio (14 capas de convolución y atención, con procesado a resolución nativa) sobre el modelo de texto LFM3-1.7B, que utiliza convoluciones cortas y atención completa y deslizante. El modelo base piensa antes de responder (thinking activado por defecto) y soporta entrada de imágenes, vídeo y texto.

Esta ficha cubre el empaquetado publicado por el usuario infosave, que distribuye el modelo como archivos CMF únicos cuantizados (8 bits y 4 bits para el modelo de lenguaje, 16 bits para el codificador de visión). Su valor diferencial es el runtime: funciona con `cortiq`, un motor de inferencia en Rust sin Python ni frameworks de ML, que opera sobre NVIDIA, AMD e Intel mediante Vulkan/DX12, Apple silicon mediante Metal y CPU pura. Esto lo hace especialmente atractivo para despliegues en el borde (edge) y entornos sin stack de Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de visión convolución+atención (14 capas, parches 16×16, bloques 2×2 por token de lenguaje) sobre LFM3-1.7B (convoluciones cortas, atención completa y sliding-window) |
| Parametros totales | ~2B (no desglosado en la ficha) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_2f (8 bits lenguaje, 16 bits visión) y q4tp (4 bits lenguaje, 16 bits visión); visión ejecutada en float32 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (other) |
| Formato de pesos | CMF (safetensors no disponible en este repo) |

## Arquitectura y entrenamiento

La arquitectura consta de dos componentes. El codificador de visión de Liquid AI procesa imágenes a resolución nativa con 14 capas que combinan convolución y atención, usando parches de 16×16 píxeles donde cada bloque de 2×2 parches se convierte en un token de lenguaje: una imagen de 640×480 genera 300 tokens y una de 1296×864 genera 1080. El modelo de lenguaje es LFM3-1.7B, basado en convoluciones cortas combinadas con atención completa y de ventana deslizante, con modo de razonamiento (thinking) activado por defecto.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no se han publicado datos en la información disponible. En cuanto al empaquetado CMF, el codificador de visión y el proyector se mantienen en 16 bits y se ejecutan en float32, lo que permite reproducir exactamente el preprocesado de Transformers sobre imágenes PNG (similitud coseno superior a 0,9999 en todas las filas frente al checkpoint bf16 en float32); los archivos JPEG decodifican ligeramente distinto respecto a PIL, lo que desplaza algunas filas. La validación de equivalencia se hizo comparando 48 tokens greedy de descripciones en cuatro imágenes de prueba.

## Capacidades

- Comprensión de imagen-texto (image-text-to-text): descripción de imágenes, lectura de gráficos y valores en charts, comparación de diferencias entre varias imágenes (hasta múltiples `--image` repetibles).
- Comprensión de vídeo: acepta archivos Y4M locales o directorios de fotogramas con `--video-fps`; muestreo a 2 fps (entre 4 y 768 fotogramas), dos fotogramas consecutivos por paso de visión, cada paso precedido de su marca temporal.
- Generación de texto pura (sin imagen), heredada de LFM3-1.7B.
- Modo de razonamiento (thinking) activado por defecto, con opción `--no-think` para respuestas directas; el razonamiento consume el presupuesto de `--max-tokens`.
- Tool calling en peticiones solo-texto, según la ficha del modelo LFM3-1.7B de referencia.
- Multilingüe: 16 idiomas, incluido el castellano.
- Servidor compatible con la API de OpenAI (`cortiq serve`), con soporte de partes de imagen (URL HTTP, data URL o ruta local) y vídeo.

## Casos de uso

- Despliegue en el borde sin Python: al no requerir Python ni frameworks de ML, es idóneo para dispositivos industriales, kioscos o sistemas embebidos con GPU AMD/Intel donde instalar PyTorch es inviable.
- Descripción automática de imágenes en aplicaciones de escritorio: con 2 GB de VRAM basta para ejecutar cualquier variante, por lo que cabe en prácticamente cualquier GPU moderna o incluso en CPU.
- Análisis de vídeo de vigilancia o control de acceso: el muestreo a 2 fps con marcas temporales permite tareas como contar personas que entran en un plano (`--video frames/ --video-fps 30`).
- Extracción de datos de gráficos y capturas: la opción `--no-think` ofrece respuestas directas al leer valores de charts, útil en pipelines de digitalización documental.
- Backend multimodal local compatible con OpenAI: `cortiq serve` expone `/v1/chat/completions`, lo que permite integrarlo en aplicaciones existentes que ya hablan con la API de OpenAI sin cambiar código cliente.
- Comparación visual de imágenes: soporte nativo de múltiples imágenes en un mismo prompt para detectar cambios entre versiones de un diseño, capturas de pantalla o fotogramas.
- Asistentes locales multilingües: soporte de 16 idiomas y razonamiento por defecto para tareas de consulta general en entornos sin conexión.
- Verificación de integridad en despliegues regulados: hashes SHA-256 publicados y comando `cortiq verify` para validar el archivo antes de ejecutarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, etc.) en la informacion disponible. Sí hay mediciones de rendimiento de inferencia con cortiq 0.8.49 en NVIDIA A40 (48 GB, Vulkan):

| Archivo | Decodificacion (tok/s) | Decodificacion a 4k (tok/s) | Prompt de 4k tokens (tok/s) | Vision 640×480 / 1296×864 |
|---|---:|---:|---:|---|
| `q8_2f` | 167 | 127 | 670 | 3,0 s / 7,0 s |
| `q4tp` | 213 | 162 | 598 | 3,2 s / 6,6 s |

En Apple M4 (Metal, cortiq 0.8.50), `q4tp` decodifica a 82 tok/s; el codificador de visión tarda 0,46 s en una imagen de 640×480 y 1,6 s en una de 1296×864 (GEMMs con Accelerate, atención en Metal).

## Requisitos de hardware

- Ambos archivos caben en cualquier GPU con 2 GB de memoria libre; el repo completo ocupa 3,4 GB.
- GPU recomendadas: cualquier GPU NVIDIA, AMD o Intel compatible con Vulkan o DX12; probado sobre NVIDIA A40 (Vulkan) y Apple M4 (Metal).
- Consumer GPUs: dado el requisito de 2 GB, cabe en prácticamente cualquier GPU moderna de consumo (GTX 1650 en adelante, Radeon integradas, Arc).
- CPU puro: posible con `CMF_GPU=0`; el codificador de visión se ejecuta en CPU en float32 por diseño (la atención en GPU), lo que garantiza exactitud.
- Despliegue: exclusivamente mediante `cortiq` (CLI `cortiq-cli` vía cargo o binarios precompilados para Linux, macOS y Windows); no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia/throughput: 167-213 tok/s de decodificación en A40, 82 tok/s en M4; codificación de visión entre 0,46 s y 7 s según resolución y plataforma.
- En Linux headless: instalar `libvulkan1 libglvnd0 libegl1 libgl1 libglx0` y definir `XDG_RUNTIME_DIR=/tmp`.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Cuantizacion | Runtime | Licencia |
|---|---|---|---|---|---|
| LFM3-VL-2B-cmf (este) | ~2B | imagen, vídeo, texto | 8 y 4 bits (CMF) | cortiq (Rust, Vulkan/Metal/CPU) | lfm1.0 |
| LiquidAI/LFM3-VL-2B (base) | ~2B | imagen, vídeo, texto | bf16 (safetensors) | Transformers / vLLM | lfm1.0 |
| Qwen2.5-VL-3B-Instruct | ~3B | imagen, vídeo, texto | bf16 y GGUF comunitarios | Transformers, vLLM, llama.cpp | Qwen (uso comercial con condiciones) |

La ventaja de esta variante frente a la base es el despliegue ligero sin Python y el consumo de memoria (1,31 GB en 4 bits); frente a alternativas como Qwen2.5-VL, la diferencia principal es el ecosistema de runtime, mucho más reducido.

## Limitaciones y advertencias

- La licencia lfm1.0 es de tipo "other": hay que revisar el texto de LICENSE antes de cualquier uso comercial.
- La cuantización q4tp no reproduce exactamente la salida del original (0 de 4 imágenes con texto greedy idéntico, aunque con el mismo contenido); q8_2f coincide en 3 de 4.
- Los archivos JPEG decodifican ligeramente distinto que con PIL, lo que introduce pequeñas desviaciones en las filas de visión.
- El codificador de visión se ejecuta en CPU en float32, lo que limita el throughput de la parte visual en imágenes de alta resolución (hasta 7 s por imagen en A40).
- El modo thinking consume el presupuesto de `--max-tokens` (por defecto 256), lo que puede truncar respuestas si no se ajusta.
- No se han publicado benchmarks de calidad estandarizados, por lo que la evaluación de precisión en tareas concretas queda en manos del desarrollador.
- Repositorio con muy poca tracción (5 descargas, 1 like) y publicado por un tercero, no por Liquid AI: conviene verificar los hashes SHA-256 publicados antes de usarlo.
- Tool calling solo está confirmado para peticiones solo-texto, no multimodales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/infosave/LFM3-VL-2B-cmf
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio CMF/cortiq: https://github.com/infosave2007/cmf
- Releases de cortiq: https://github.com/infosave2007/cmf/releases
- Variante solo-texto relacionada: https://huggingface.co/infosave/LFM3-1.7B-cmf
