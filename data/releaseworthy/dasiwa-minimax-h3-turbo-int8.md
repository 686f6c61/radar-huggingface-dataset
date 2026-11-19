# releaseworthy/dasiwa-minimax-h3-turbo-int8

## Resumen

DaSiWa MiniMax H3 GXS v5 Turbo int8 mirror es un checkpoint de generacion de video a partir de imagen (image-to-video) derivado del modelo MiniMax H3, publicado originalmente en Civitai por el autor DaSiWa bajo el identificador de modelo 2877206 (version `DaSiWa GXS v5 Turbo`, id 3457969). Este repositorio de Hugging Face no es un modelo nuevo: es un espejo (mirror) de uso privado que rehospeda el fichero int8 original para que instancias de GPU alquiladas puedan descargarlo a velocidad completa, ya que la CDN de Civitai limita un unico host y devuelve HTTP 429 tras muchas gigas de descarga.

El checkpoint se distribuye como un unico fichero `DasiwaMinimaxH3_dasiwaGXSV5Turbo_int8.safetensors` de 20.967.669.120 bytes (unas 19,5 GiB), con cuantizacion int8 y variante "turbo" que permite generar video en tan solo 4 pasos (previsualizacion rapida con audio degradado), 6 pasos (calidad basica) o 8 pasos (calidad alta). Esta pensado para ejecutarse dentro de ComfyUI con los workflows oficiales de DaSiWa MiniMax H3 (T2VA, FL2VA y REF2VA) y su node pack asociado.

Su relevancia es practica: el repositorio completo ocupa 41,9 GB (incluye tambien la version anterior Hybrid v4 Turbo int8 en el historial de commits), pero el modelo en si son unos 20 GB, lo que permite desplegarlo en GPUs de consumo con suficiente VRAM. El text encoder, los VAE y el upscaler latente no estan incluidos y deben obtenerse de repositorios separados (Comfy-Org/MiniMax-H3, Kijai/MiniMax-H3-experimental y LBH-123-AI/Minimax_h3_latent_Upscaler).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion para video, empaquetado para ComfyUI) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (fichero unico cuantizado, variante "row-wise convrot runtime mixed") |
| Idiomas soportados | no disponible |
| Licencia | civitai-model-license (licencia "other", enlace a civitai.com/models/2877206) |
| Formato de pesos | safetensors (un unico fichero de 20.967.669.120 bytes) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en la documentacion proporcionada. Por el pipeline asignado (`image-to-video`) y el ecosistema (ComfyUI, MiniMax H3), se trata de un modelo de difusion generativa de video condicionada por imagen, pero no se detalla si emplea transformer de difusion, arquitectura hibrida u otra variante. El fichero es un checkpoint cuantizado a int8 con esquema `row-wise convrot runtime mixed`, un formato de cuantizacion orientado a reducir el peso y permitir inferencia en GPUs con VRAM limitada.

Respecto al entrenamiento, no hay datos sobre numero de tokens, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas. La model card unicamente indica que el checkpoint es una variante "turbo" afinada para pocos pasos de inferencia (4, 6 u 8 pasos) y que el autor original es DaSiWa en Civitai; este repositorio se limita a rehospedar el fichero. El text encoder asociado es `qwen3vl_32b_minimax_h3_int8_convrot`, alojado en Comfy-Org/MiniMax-H3, lo que sugiere un backbone de texto basado en Qwen3-VL de 32B, aunque no se confirma en la informacion disponible.

## Capacidades

- Generacion de video a partir de imagen (image-to-video) en ComfyUI mediante los workflows T2VA, FL2VA y REF2VA.
- Generacion de audio asociado al video: la variante de 4 pasos produce previsualizacion rapida con audio degradado, mientras que 6 y 8 pasos mejoran la calidad.
- Control de calidad mediante el numero de pasos de inferencia (4, 6 u 8), lo que permite equilibrar velocidad y fidelidad.
- Integracion con el node pack de DaSiWa MiniMax H3 para ComfyUI.
- Uso de upscaler latente externo (LBH-123-AI/Minimax_h3_latent_Upscaler) para aumentar resolucion.
- Compatibilidad con text encoder Qwen3-VL 32B int8 (Comfy-Org/MiniMax-H3) para condicionamiento textual.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni soporte multilingue explicito.

## Casos de uso

- Previsualizacion rapida de video en produccion: con 4 pasos de inferencia se obtiene un borrador con audio degradado que permite validar composicion y movimiento antes de lanzar la generacion final a 8 pasos.
- Animacion de imagenes fijas para redes sociales: el pipeline image-to-video toma una imagen de referencia y genera un clip animado, adecuado para contenido promocional de formato corto.
- Iteracion creativa en estudio: los workflows FL2VA y REF2VA permiten usar frames de referencia y condicionamiento visual para mantener coherencia entre tomas.
- Generacion de video con audio sincronizado: la variante turbo produce audio junto al video, util para borradores de anuncios o demos sin postproduccion de sonido.
- Prototipado de anuncios y storyboards: el modelo permite pasar de una imagen clave a un clip animado en pocos pasos, acelerando la revision de conceptos por parte de clientes.
- Despliegue en instancias de GPU alquiladas: al ser un espejo con descarga sin throttling, encaja en pipelines automatizados que aprovisionan GPUs bajo demanda y necesitan el checkpoint de forma fiable.
- Restauracion o ampliacion de video mediante upscaler latente: combinado con LBH-123-AI/Minimax_h3_latent_Upscaler se puede escalar la resolucion de los clips generados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el fichero int8 ocupa unos 19,5 GiB, por lo que se necesita al menos esa cantidad de VRAM solo para los pesos, mas memoria para activaciones, VAE y text encoder.
- El text encoder Qwen3-VL 32B int8 es un componente aparte y anade requisitos adicionales de VRAM; no se especifica su tamano exacto.
- GPU recomendadas: no disponible. Por tamano del checkpoint, encaja en GPUs profesionales (A100 40/80 GB, H100) y potencialmente en consumer de gama alta con 24 GB o mas, pero el autor no confirma modelos concretos.
- Cabe en consumer GPU: probable en tarjetas con 24 GB o mas si se usa el checkpoint int8 junto con VAE y encoder en modos optimizados; no confirmado por el autor.
- Opciones de despliegue: ComfyUI con los workflows y node pack de DaSiWa MiniMax H3. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. La unica referencia es el numero de pasos (4 rapido, 6 basico, 8 calidad), sin tiempos absolutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DaSiWa MiniMax H3 GXS v5 Turbo int8 (este) | no disponible | no disponible | no disponible | civitai-model-license | Hugging Face (mirror) y Civitai |
| DaSiWa Hybrid v4 Turbo int8 | no disponible | no disponible | no disponible | civitai-model-license | Historial de commits de este repo |
| MiniMax H3 base (Comfy-Org/MiniMax-H3) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Kijai/MiniMax-H3-experimental | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de parametros comparables para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia `civitai-model-license`: restringe el uso, especialmente el comercial; es imprescindible revisar los terminos en civitai.com/models/2877206 antes de cualquier despliegue productivo.
- El repositorio es un espejo de uso privado, no el modelo original; el autor del checkpoint es DaSiWa y este repositorio no ofrece soporte ni garantias.
- La variante de 4 pasos produce audio degradado; solo las variantes de 6 y 8 pasos alcanzan calidad aceptable.
- No incluye text encoder, VAE ni upscaler latente: hay que descargarlos de repositorios externos, lo que anade dependencias y posibles incompatibilidades de version.
- Riesgo de alucinacion visual y artefactos propios de los modelos de difusion de video, especialmente en movimientos complejos o escenas con muchos objetos.
- Sesgos conocidos: no disponibles; al no haber documentacion sobre el dataset de entrenamiento, no se pueden evaluar sesgos de genero, etnia o culturales.
- Idiomas soportados: no disponibles; no se confirma el comportamiento multilingue del condicionamiento textual.
- Requisitos de VRAM elevados (pesos int8 de ~19,5 GiB mas encoder de 32B), lo que limita el despliegue en GPUs de consumo.
- Ausencia de benchmarks publicos impide validar calidad frente a alternativas.
- El repositorio completo ocupa 41,9 GB por el historial de commits; hay que seleccionar el fichero correcto al descargar.

## Enlaces

- Hugging Face: https://huggingface.co/releaseworthy/dasiwa-minimax-h3-turbo-int8
- Modelo original en Civitai: https://civitai.com/models/2877206
- Workflows DaSiWa MiniMax H3 en Civitai: https://civitai.com/models/2831978
- Text encoder y componentes base: https://huggingface.co/Comfy-Org/MiniMax-H3
- Componentes experimentales: https://huggingface.co/Kijai/MiniMax-H3-experimental
- Upscaler latente: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler
