# appautomaton/minimax-h3-base-8bit-mlx

## Resumen

MiniMax-H3-Base es la etapa intermedia del sistema MiniMax-H3, un modelo de generación conjunta de vídeo y audio sincronizado a partir de texto. Esta versión concreta, `appautomaton/minimax-h3-base-8bit-mlx`, es una conversión a formato MLX con cuantización afín de 8 bits (grupo de 32) realizada por la comunidad, pensada para ejecutarse íntegramente en Apple Silicon sin dependencias de PyTorch, CUDA ni APIs en la nube. El modelo original, desarrollado por MiniMax, genera vídeo de 768p con audio estéreo denoizado de forma conjunta en una única secuencia empaquetada.

La relevancia de esta conversión radica en que permite ejecutar un modelo de generación de vídeo-audio de alta calidad en hardware local de Apple, algo poco habitual en este tipo de sistemas que suelen requerir GPUs NVIDIA con grandes cantidades de VRAM. El repositorio incluye dos checkpoints de Diffusion Transformer (DiT) estructuralmente idénticos —uno para condicionamiento por texto y otro por referencia— y un text encoder basado en Qwen3-VL-32B, todos en formato safetensors con metadatos de cuantización. Es importante señalar que solo se libera la etapa H3-Base; las etapas de refinado de prompt (H3-Context-IR) y de upscaling a 2K (H3-Regenerate-2K) no están incluidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con text encoder Qwen3-VL-32B |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX afín 8 bits, grupo 32 (a8g32) |
| Idiomas soportados | en (inglés) |
| Licencia | minimax-h3-community-license |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de difusión basada en transformers (DiT) para la generación conjunta de vídeo y audio. Se compone de dos DiTs idénticos en estructura pero con distinto empaquetado de entrada: uno procesa texto y 0-2 keyframes, y otro se usa para condicionamiento por referencia. El text encoder es Qwen3-VL-32B, que convierte el prompt en representaciones que alimentan a los DiTs. La salida se decodifica mediante dos VAEs separados (uno para vídeo y otro para audio) que no están incluidos en este repositorio y deben descargarse por separado.

La cuantización aplicada es afín de 8 bits con grupo de 32 (a8g32), donde cada grupo de 32 pesos tiene una escala y un sesgo almacenados en bf16. Se empaquetan solo tensores bf16 de rango 2 cuyo último eje sea múltiplo de 32, excluyendo deliberadamente tensores F32 sensibles a la precisión (proyecciones de patch, embedder temporal, cabezas de salida y `rope.inv_freq`), tablas de búsqueda (embeddings) y tensores sin escala asociable. Esto resulta en 260 de 535 tensores empaquetados en los DiTs y 439 de 902 en el text encoder. No se dispone de información sobre el entrenamiento del modelo original (datos, número de tokens, técnicas de alineación).

## Capacidades

- Generación de vídeo de 768p con audio estéreo sincronizado a partir de prompts de texto.
- Condicionamiento por referencia: permite generar vídeo basado en una o varias imágenes de referencia (0-2 keyframes).
- Denoizado conjunto de vídeo y audio en una única secuencia, lo que garantiza sincronización labial y coherencia audiovisual.
- Ejecución local en Apple Silicon mediante el runtime `mlx-h3`, sin necesidad de GPU NVIDIA ni servicios en la nube.
- Soporte de adaptadores LoRA de la comunidad (p. ej., Turbo LoRA) que se cargan dinámicamente durante la fase DiT.
- Ruta experimental de cuantización W8A8 simétrica (NAX) para aceleración nativa con TensorOps en MLX.

## Casos de uso

- Creación de vídeos cortos para redes sociales: un creador puede generar clips de 768p con audio sincronizado a partir de una descripción textual, sin necesidad de equipos de edición complejos ni servicios de pago.
- Prototipado de anuncios publicitarios: agencias pueden generar rápidamente vídeos conceptuales con locución y efectos de sonido para presentar a clientes antes de la producción final.
- Generación de avatares parlantes: gracias al condicionamiento por referencia y al audio sincronizado, se pueden crear personajes que hablan a partir de una imagen fija y un guion.
- Desarrollo de contenido educativo: profesores o divulgadores pueden producir vídeos explicativos con narración y animaciones generadas automáticamente desde texto.
- Investigación en generación audiovisual: el modelo permite estudiar la coherencia entre modalidades (vídeo y audio) en un entorno local y reproducible, al estar disponible en formato abierto.
- Automatización de doblaje y subtitulado visual: dado que el audio se genera junto con el vídeo, se puede emplear para crear versiones multilingües de contenido existente (aunque el modelo solo soporta inglés de forma nativa).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como FVD, CLIP score, ni comparaciones con otros modelos de generación de vídeo.

## Requisitos de hardware

- Apple Silicon con memoria unificada suficiente para albergar un modelo a la vez. Los DiTs y el text encoder nunca residen simultáneamente en memoria; el runtime carga uno, materializa su salida, lo libera y verifica que la memoria se ha devuelto.
- Los pesos sin cuantizar de los DiTs y el text encoder sumarían 62.5 GiB, pero con la cuantización a8g32 el tamaño se reduce a 34.8 GiB por DiT y 27.7 GiB para el text encoder (según los archivos del repositorio).
- Se recomienda un Mac con al menos 64 GiB de memoria unificada para cargar cualquiera de los DiTs, y algo más si se quiere mantener el text encoder en memoria (aunque no es necesario).
- El runtime `mlx-h3` está disponible en PyPI y el código fuente en GitHub. No se requieren GPUs NVIDIA ni CUDA.
- No se proporcionan datos de latencia ni throughput. El rendimiento dependerá del chip concreto (M1, M2, M3, M4) y de la memoria disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de generación de vídeo-audio. Alternativas como Stable Video Diffusion, Runway Gen-2 o Pika no son directamente comparables en términos de arquitectura, licencia o requisitos de hardware, y no se dispone de datos de rendimiento objetivos para este modelo. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Solo se incluye la etapa H3-Base: la salida es de 768p y no se realiza upscaling a 2K. Las guías del producto alojado que mencionan 2K se refieren a la etapa no liberada.
- El modelo no reescribe ni expande el prompt: el text encoder recibe exactamente el texto introducido. Para obtener buenos resultados es necesario seguir la guía de prompting específica del proyecto.
- No se incluyen los VAEs de vídeo y audio ni el tokenizer; deben descargarse por separado desde los repositorios indicados en la model card.
- El idioma soportado es únicamente inglés. No se garantiza un comportamiento adecuado con prompts en otros idiomas.
- La licencia es `minimax-h3-community-license`, que puede imponer restricciones de uso comercial. Es necesario revisar el texto completo de la licencia antes de utilizar el modelo en producción.
- Al ser una conversión cuantizada de 8 bits, puede haber una ligera pérdida de calidad respecto al modelo original en bf16, aunque la model card afirma que la cuantización está diseñada para preservar la precisión en tensores sensibles.
- El modelo requiere Apple Silicon; no es compatible con GPUs NVIDIA ni con arquitecturas x86 convencionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/appautomaton/minimax-h3-base-8bit-mlx
- Modelo original MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Runtime mlx-h3 en PyPI: https://pypi.org/project/mlx-h3/
- Código fuente en GitHub: https://github.com/appautomaton/mlx-h3
- Página del proyecto: https://appautomaton.renocrypt.com/mlx-h3/
- Guía de prompting: https://github.com/appautomaton/mlx-h3/blob/main/docs/prompting.md
- Repositorio de VAEs (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
- LoRA Turbo de la comunidad: https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
