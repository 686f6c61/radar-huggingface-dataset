# fkyyy/MiniMax-H3-comfy-r2v-slim

## Resumen

MiniMax-H3-comfy-r2v-slim es un repositorio de empaquetado y cuantización del modelo de difusión MiniMax H3, preparado específicamente para su uso en ComfyUI. Lo publica el usuario fkyyy y deriva del modelo original MiniMaxAI/MiniMax-H3, un sistema generativo multimodal de vídeo y audio. El repositorio no entrena un modelo nuevo: reorganiza los pesos en archivos individuales (diffusion-single-file), aplica cuantizaciones (int8_convrot, fp8_scaled, w6a8, nvfp4_awq) y añade LoRAs de destilación por pasos, VAE de vídeo y audio, ControlNet y embeddings de estilo para que el flujo funcione en el nodo de vídeo de ComfyUI.

La relevancia de este empaquetado es práctica: el modelo original, por su tamaño (47,2 GB el repo completo), es difícil de desplegar en entornos de consumo. Esta versión "slim" reduce requisitos mediante variantes podadas y cuantizadas, e incluye el text encoder Qwen3-VL-32B en formatos que no exigen GPU Blackwell (el nvfp4_awq funciona sin ellas). Incluye además rutas de generación texto-a-vídeo (t2v), imagen-a-vídeo (i2v) y referencia-a-vídeo (r2v), con soporte de audio.

Al tratarse de un repackaging para ComfyUI, la ficha se centra en las especificaciones del conjunto de archivos y su uso práctico en pipelines de generación de vídeo, más que en las características del modelo base, para las que se remite al repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (diffusion-single-file) para generación de vídeo y audio; text encoder Qwen3-VL-32B |
| Parametros totales | no disponible (el repo ocupa 47,2 GB en total, incluyendo múltiples variantes) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, int8_convrot, fp8_scaled, w6a8, nvfp4_awq (text encoder) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

El modelo base MiniMax H3 es un sistema de difusión para generación de vídeo con soporte de audio, con variantes funcionales que incluyen fl2va (frame-to-video con audio) y ref2va (reference-to-video con audio). El text encoder es Qwen3-VL-32B, un modelo de visión-lenguaje de 32B parámetros, que en este repositorio se ofrece en tres cuantizaciones: bf16, int8_convrot y nvfp4_awq. La variante nvfp4_awq se convierte desde cybermotaz/Qwen3-VL-32B-Instruct-NVFP4 y, según la model card, no requiere GPU Blackwell.

El repositorio no documenta el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO), por lo que esos datos no están disponibles. La innovación técnica del empaquetado reside en la combinación de pesos podados (pruned) con cuantizaciones de 8 y 6 bits, LoRAs de destilación por pasos (turbo 4-step y 8-step) para reducir el número de pasos de muestreo, un VAE de vídeo en int8_convrot y un VAE de audio en fp32, más un ControlNet Union podado para control estructural.

## Capacidades

- Generación de vídeo a partir de texto (t2v), imagen (i2v) y referencia visual (r2v).
- Generación de audio asociada al vídeo (VAE de audio incluido).
- Control estructural mediante ControlNet Union (variantes podadas bf16 e int8_convrot).
- Estilización mediante embeddings textuales invocables con la sintaxis `embedding:<nombre>` en el nodo CLIPTextEncode.
- Aceleración por destilación: LoRAs turbo de 4 y 8 pasos para fl2v y ref2v.
- Integración nativa con ComfyUI mediante archivos diffusion-single-file.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; no aplica a un modelo de difusión.

## Casos de uso

- Generación de vídeo publicitario a partir de una imagen de producto: el flujo i2v con los pesos pruned_int8_convrot permite producir clips en hardware de gama alta de consumo, reduciendo el coste por pieza frente a soluciones en la nube.
- Prototipado rápido de storyboards: con la LoRA turbo de 4 pasos y el modelo pruned_w6a8 se obtienen borradores de vídeo en pocos pasos de muestreo, útiles para iterar guiones antes de renderizar en bf16.
- Creación de contenido para redes sociales con audio: el VAE de audio integrado permite generar clips con pista sonora en un único pipeline de ComfyUI.
- Efectos visuales controlados: el ControlNet Union podado permite imponer estructura (pose, profundidad, bordes) sobre la generación, útil en composición VFX.
- Estilización consistente de series de vídeo: los embeddings incluidos (por ejemplo `minimaxh3_dark_magic` o `minimaxh3_four_seasons`) aplican un estilo uniforme a múltiples clips de una misma campaña.
- Continuación de vídeo existente: el workflow i2v_continuation permite extender secuencias a partir del último fotograma, útil para alargar tomas sin rehacer la generación completa.
- Investigación en difusión de vídeo: las múltiples cuantizaciones del mismo modelo permiten estudiar el impacto de int8, fp8 y w6a8 en calidad y latencia sobre un mismo checkpoint base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 47,2 GB, pero no es necesario descargar todas las variantes; el espacio en disco requerido depende de las variantes elegidas.
- Para el text encoder Qwen3-VL-32B en bf16 se necesita aproximadamente 64 GB de VRAM o descarga a CPU; la variante int8_convrot reduce el requisito a unos 32 GB y la nvfp4_awq a unos 16-20 GB, según la model card sin necesidad de GPU Blackwell.
- La model card recomienda int8_convrot para modelos de difusión si se dispone de PyTorch con CUDA 13.0; fp8_scaled solo si no es posible usar int8_convrot.
- Las variantes pruned (podadas) están pensadas para reducir el consumo de VRAM y hacer viable la inferencia en GPUs de gama alta de consumo; no se especifican modelos concretos de GPU en la información disponible.
- Despliegue mediante ComfyUI, con los workflows oficiales de Comfy-Org para t2v, i2v, r2v e i2v_continuation.
- Latencia y throughput: no disponibles; dependen del número de pasos (4 u 8 con las LoRAs turbo), la resolución y la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-comfy-r2v-slim (este repo) | Difusión vídeo+audio, empaquetado ComfyUI | no disponible | no disponible | minimax-h3-community-license-agreement | HuggingFace, 93 descargas |
| MiniMaxAI/MiniMax-H3 | Difusión vídeo+audio, modelo base | no disponible | no disponible | minimax-h3-community-license-agreement | HuggingFace (repo original) |
| lightx2v/Minimax-h3-Turbo | Variante turbo del modelo base | no disponible | no disponible | no disponible | HuggingFace |
| alibaba-pai/MiniMax-H3-Fun-Controlnet-Union | ControlNet para el modelo base | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de benchmarks ni de parámetros para establecer una comparación cuantitativa con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Es un repackaging, no un modelo entrenado por el autor del repo; los méritos y limitaciones del modelo subyacente corresponden a MiniMaxAI.
- La licencia minimax-h3-community-license-agreement es distinta de las licencias open source estándar; es imprescindible revisar sus términos antes de cualquier uso comercial.
- El repositorio tiene 0 likes y 93 descargas, lo que indica escasa validación por parte de la comunidad; conviene verificar la integridad de los pesos antes de usarlos en producción.
- No se documentan idiomas soportados ni sesgos conocidos del modelo base en la información disponible.
- Riesgo de alucinación visual y artefactos propios de los modelos de difusión de vídeo, especialmente en las variantes muy cuantizadas (w6a8) y con pocos pasos de muestreo.
- Las variantes pruned pueden degradar la fidelidad respecto a los pesos bf16 completos; no se han publicado métricas comparativas.
- El uso de int8_convrot requiere PyTorch con CUDA 13.0; sin ese entorno hay que recurrir a fp8_scaled, con posible pérdida de calidad.
- La información sobre requisitos de VRAM, latencia y calidad es incompleta; no se deben asumir rendimientos concretos sin pruebas propias.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/fkyyy/MiniMax-H3-comfy-r2v-slim
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Variante turbo: https://huggingface.co/lightx2v/Minimax-h3-Turbo
- ControlNet Union: https://huggingface.co/alibaba-pai/MiniMax-H3-Fun-Controlnet-Union
- Repo experimental de Kijai: https://huggingface.co/Kijai/MiniMax-H3-experimental
- Text encoder Qwen3-VL-32B NVFP4 de origen: https://huggingface.co/cybermotaz/Qwen3-VL-32B-Instruct-NVFP4
- Workflow imagen a vídeo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_i2v.json
- Workflow referencia a vídeo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_r2v.json
- Workflow texto a vídeo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_t2v.json
- Workflow continuación de vídeo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_i2v_continuation.json
