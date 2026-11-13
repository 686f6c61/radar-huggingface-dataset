# appmana/MAGI-2-preview-ComfyUI

## Resumen

MAGI-2 Preview es un modelo generativo multimodal desarrollado por SandAI (sand-ai) que produce vídeo con audio a partir de texto, imágenes o una combinación de ambos. Este repositorio concreto (appmana/MAGI-2-preview-ComfyUI) no es el modelo original, sino un reempaquetado de los pesos de SandAI para su carga nativa en ComfyUI, incluyendo una cuantización int8 propia denominada ConvRot que reduce el peso del transformer de preview de 228,1 GB en bf16 a 115,5 GB.

El sistema consta de dos transformadores (un "preview" y un "refiner" para 1080p), un decodificador de vídeo destilado tipo turbo y componentes auxiliares: el codificador de texto es byte-idéntico a Qwen/Qwen3.5-27B (alojado aparte en appmana/Qwen3.5-27B-ComfyUI) y el VAE de audio es byte-idéntico a stable-audio-open-1.0 reempaquetado por Comfy-Org. La arquitectura interna del transformer no se detalla en la información disponible, aunque la presencia de bancos de expertos enrutados (W_gate, W_up, W_down, expert_bias_ema) confirma un diseño de mezcla de expertos (MoE).

Su relevancia es práctica: permite ejecutar un modelo de generación de vídeo con audio de gran tamaño dentro del ecosistema ComfyUI, con soporte de paralelismo de pipeline y de tensor, y con una cuantización int8 que mantiene un error relativo medio inferior al 1 % frente a bf16. La licencia es Apache-2.0, igual que los pesos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion con mezcla de expertos (MoE) enrutada; pipeline de dos etapas (preview + refiner 1080p) con decodificador de video turbo destilado |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE confirmado por la presencia de bancos de expertos enrutados, sin cifra publicada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (referencia) e int8 ConvRot (cuantizacion propia del autor del repack) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (shards con `.index.json` para carga de checkpoints fragmentados) |

## Arquitectura y entrenamiento

El modelo se organiza como un pipeline de dos etapas: un transformer de preview que genera el borrador y un refiner que eleva la salida a 1080p. Ambos transformadores presentan capas densas y bancos de expertos enrutados (MoE), con parámetros de hiperconexión, attention sinks y gates, y routers con sesgo de enrutamiento (`expert_bias_ema`). El decodificador de vídeo es un VAE turbo destilado (TurboV3) y el audio se decodifica con un VAE equivalente a stable-audio-open-1.0. El codificador de texto es Qwen3.5-27B, byte-idéntico al modelo original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card del repack no los documenta. La innovación técnica destacable de este repositorio es la cuantización int8 ConvRot: aplica una rotación de Hadamard (grupo 256, o la mayor potencia de 4 que divida el ancho de entrada; el MLP down del refiner, de 10920 canales, usa grupo 4) y escalas por canal de salida sobre las proyecciones de atención, las proyecciones densas y los bancos de expertos. Embeddings, normas, modulación, routers, parámetros de hiperconexión, attention sinks y capas finales permanecen en bf16. El error relativo medio medido frente a bf16 es del 0,73 % en bancos de expertos y del 0,94 % en proyecciones densas, con un coseno mínimo de 0,99997 y 0,99985 respectivamente, frente al 0,83 % y 1,11 % de una cuantización int8 plana.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con pista de audio asociada (text-to-audio-video).
- Generación de vídeo a partir de una imagen de referencia (image-to-video) y de imagen más texto (image-text-to-video).
- Generación de audio sincronizado con el vídeo mediante el VAE de audio.
- Refinado a 1080p mediante el transformer refiner.
- Ejecución con los samplers, la gestión de memoria, el paralelismo de pipeline y el paralelismo de tensor nativos de ComfyUI.
- Carga de checkpoints fragmentados mediante archivos `.index.json` y verificación de integridad con `SHA256SUMS`.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes ni modo thinking; se trata de un modelo generativo de medios, no de un LLM conversacional.

## Casos de uso

- Generación de clips publicitarios con audio: a partir de un prompt textual se obtiene vídeo y audio sincronizado en una sola pasada, útil para prototipos rápidos de anuncios sin equipo de producción.
- Animación de imágenes fijas para redes sociales: el modo image-to-video permite dar movimiento a una fotografía o ilustración manteniendo la composición original, gracias al VAE Wan 2.2 en fp32 que replica la codificación de imágenes de referencia de SandAI.
- Previsualización de storyboards en cine y animación: el transformer de preview genera borradores rápidos que después se elevan a 1080p con el refiner, ajustándose a un flujo de trabajo iterativo.
- Creación de contenido para videojuegos: generación de cinemáticas cortas o fondos animados con audio ambiente a partir de descripciones textuales.
- Producción de vídeo educativo o divulgativo: generación de secuencias ilustrativas con narración o ambiente sonoro para material formativo.
- Despliegue en infraestructura multi-GPU: gracias al soporte de paralelismo de pipeline y de tensor de ComfyUI, el modelo puede repartirse entre varias GPU para generar a 1080p en entornos de estudio.
- Integración en pipelines de automatización de contenido: al cargarse de forma nativa en ComfyUI, puede encadenarse con nodos de posprocesado, subtitulado o publicación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas de fidelidad de la cuantización frente a bf16:

| Metrica | Bancos de expertos | Proyecciones densas |
|---|---|---|
| Tensores muestreados | 9 | 80 |
| Error relativo medio | 0,73 % | 0,94 % |
| Error relativo maximo | 0,80 % | 1,73 % |
| Coseno minimo | 0,99997 | 0,99985 |
| Error relativo medio con int8 plano | 0,83 % | 1,11 % |

Además, la model card indica que la implementación en ComfyUI iguala el código de referencia de SandAI en pruebas de paridad: preview dentro del ruido de bf16, refiner dentro del 0,8 %, schedule del sampler bit-idéntico y entrada del decodificador turbo bit-idéntica; la ejecución con paralelismo de pipeline de dos etapas y de tensor de dos rangos coincide con los modelos sin dividir.

## Requisitos de hardware

- Peso del transformer de preview: 115,5 GB en int8 ConvRot y 228,1 GB en bf16; el refiner se distribuye en archivos separados int8 y bf16 (tamaño exacto no disponible).
- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de los shards, la variante int8 requiere del orden de 115 GB solo para el transformer de preview, más el refiner, el VAE de vídeo, el VAE de audio y el codificador de texto Qwen3.5-27B (alojado en otro repositorio).
- GPU recomendadas: no disponible en la información proporcionada; por volumen de pesos, la variante int8 no cabe en una GPU de consumo y exige configuraciones multi-GPU o aceleradores de gran memoria (A100/H100 de 80 GB en adelante, repartiendo capas).
- ¿Cabe en GPU de consumo? La variante int8 (115,5 GB) no cabe en ninguna GPU de consumo actual; la bf16 (228,1 GB) tampoco. No se documenta ninguna cuantización inferior a int8.
- Opciones de despliegue: ComfyUI (fork instalable vía pip/uv de hiddenswitch), con samplers, gestión de memoria, paralelismo de pipeline y de tensor nativos. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MAGI-2 Preview (este repack) | no disponible (MoE) | no disponible | Vídeo + audio, hasta 1080p con refiner | Apache-2.0 | Hugging Face (repack ComfyUI) |
| sand-ai/MAGI-2-preview (original) | no disponible (MoE) | no disponible | Vídeo + audio | Apache-2.0 | Hugging Face |
| Wan 2.2 (referencia por VAE) | no disponible | no disponible | Vídeo | no disponible en la información | Hugging Face |
| Stable Audio Open 1.0 (referencia por VAE de audio) | no disponible | no disponible | Audio | no disponible en la información | Hugging Face (repack Comfy-Org) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a licencia y disponibilidad.

## Limitaciones y advertencias

- Este repositorio es una conversión de formato y una cuantización de los pesos de SandAI, no un modelo entrenado por appmana; los sesgos y limitaciones del modelo original se heredan sin cambios.
- La cuantización int8 ConvRot introduce un error relativo de hasta el 1,73 % en algunas proyecciones densas; para usos donde la fidelidad absoluta sea crítica conviene usar la variante bf16.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas del modelo en la información disponible.
- El repositorio ocupa 125,6 GB; el almacenamiento y la transferencia son un coste operativo relevante.
- El codificador de texto y el VAE de audio no están incluidos en este repositorio y deben descargarse por separado (appmana/Qwen3.5-27B-ComfyUI y Comfy-Org/stable-audio-open-1.0_repackaged).
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base original y de los componentes auxiliares (Qwen3.5-27B, stable-audio-open-1.0, Wan 2.2 VAE), que pueden tener condiciones propias.
- La model card indica que los resultados de generación a tamaño completo se añadirán "una vez validados"; en el momento de la consulta no estaban publicados.
- El repositorio registra 0 descargas y 0 likes, por lo que carece de validación comunitaria y de informes de uso en producción.

## Enlaces

- Repositorio del repack: https://huggingface.co/appmana/MAGI-2-preview-ComfyUI
- Modelo base original: https://huggingface.co/sand-ai/MAGI-2-preview
- Codificador de texto Qwen3.5-27B para ComfyUI: https://huggingface.co/appmana/Qwen3.5-27B-ComfyUI
- VAE de audio reempaquetado: https://huggingface.co/Comfy-Org/stable-audio-open-1.0_repackaged
- Fork de ComfyUI instalable vía pip/uv: https://github.com/hiddenswitch/forks-pip-and-uv-installable-ComfyUI
