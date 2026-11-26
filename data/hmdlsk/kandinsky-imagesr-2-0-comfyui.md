# hmdlsk/Kandinsky-ImageSR-2.0-ComfyUI

## Resumen

Kandinsky-ImageSR-2.0-ComfyUI es un reempaquetado del transformer del modelo de superresolución Kandinsky ImageSR 2.0, desarrollado originalmente por Kandinsky Lab y redistribuido por el usuario hmdlsk para su uso directo en ComfyUI. No se trata de un fine-tune: los pesos son idénticos byte a byte al lanzamiento original, y únicamente se han concatenado los tres shards del transformer en un solo archivo safetensors de aproximadamente 10,3 GB, almacenando la configuración como metadatos. El objetivo es simplificar la carga del modelo en flujos de trabajo de ComfyUI mediante el nodo no oficial ComfyUI-KSR-Unofficial.

El modelo resuelve la tarea de superresolución de imágenes (upscaling) con un transformer de difusión que opera en el espacio latente del VAE de FLUX.1. A partir de una imagen de entrada de baja resolución, como una imagen de 512 px, genera una versión ampliada con detalle sintetizado, superando en calidad perceptual a métodos clásicos como nearest o bicúbico. Es relevante para desarrolladores que trabajan con pipelines de restauración o ampliación de imágenes y quieren integrar un upscaler de alta calidad en ComfyUI sin gestionar múltiples archivos de pesos.

La información disponible no detalla el número de parámetros, la longitud de contexto (no aplica en un modelo de imagen) ni los datos de entrenamiento. La licencia es MIT, lo que facilita su uso comercial, y el repo ocupa 10,3 GB en formato safetensors bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para superresolución (image-to-image), opera en espacio latente del VAE de FLUX.1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | bf16 nativo (capas de modulación y tablas de timestep en fp32); conversión a fp8 en carga mediante `weight_dtype` del nodo loader |
| Idiomas soportados | no disponible (modelo de imagen, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (archivo único `kandinsky_imagesr_2.0.safetensors`, ~10,3 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión orientado a superresolución, empaquetado como un único archivo safetensors con la configuración embebida como metadatos. El proceso de reempaquetado consistió únicamente en concatenar los tres shards del transformer original y almacenar `transformer/config.json`, la configuración del VAE y `model_index.json` como metadatos del safetensors; los nombres y valores de los tensores no se modificaron. El modelo utiliza el VAE estándar de FLUX.1 (`ae.safetensors` de black-forest-labs/FLUX.1-schnell), que Kandinsky ImageSR distribuye en bf16 y que por eso no se incluye en este repo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá del uso del espacio latente de FLUX.1 y de un ajuste de "creatividad" mencionado en el README de GitHub, cuyos detalles no se proporcionan en la información disponible. El SHA256 del archivo es `56e2a496735be188faf8750a21e5221281e0ddf639ae15bf9947d6942c84fc3c`, lo que permite verificar la integridad de la descarga.

## Capacidades

- Superresolución de imágenes (upscaling) con síntesis de detalle, partiendo de entradas de baja resolución como 512 px y generando salidas ampliadas (el ejemplo del autor muestra un factor x4).
- Pipeline image-to-image: acepta una imagen de entrada y produce una versión de mayor resolución.
- Integración con ComfyUI mediante el nodo no oficial ComfyUI-KSR-Unofficial, con carga en un solo archivo.
- Conversión a fp8 en el momento de la carga para reducir requisitos de memoria, mediante el parámetro `weight_dtype` del nodo loader.
- Ajuste de "creatividad" mencionado en el README de GitHub (detalles no disponibles en la información proporcionada).
- No se documentan capacidades de generación de texto, código, matemáticas, tool calling, agentes ni multilingüismo, al ser un modelo exclusivamente de imagen.

## Casos de uso

- Restauración y ampliación de fotografías antiguas o de baja resolución: el modelo toma una imagen de entrada y sintetiza detalle en la salida ampliada, superando a métodos de interpolación clásicos como nearest o bicúbico en calidad perceptual.
- Preparación de assets para impresión o visualización en pantallas de alta densidad: ampliar imágenes de 512 px a resoluciones mayores con un factor x4 antes de su uso en materiales gráficos.
- Mejora de imágenes generadas por otros modelos de difusión: usar el upscaler como segunda etapa en un pipeline de generación, tomando la salida de un modelo texto-a-imagen de baja resolución y ampliándola con detalle sintetizado.
- Flujos de trabajo en ComfyUI: integrar el nodo ComfyUI-KSR-Unofficial en grafos existentes para añadir una etapa de superresolución sin gestionar múltiples archivos de pesos.
- Restauración de material de archivo o patrimonio digital: ampliar imágenes históricas o escaneos de baja resolución para su catalogación o difusión, con la ventaja de la licencia MIT para uso institucional y comercial.
- Prototipado rápido de pipelines de upscaling: al ser un archivo único con configuración embebida, permite montar y probar un pipeline de superresolución en pocos pasos, verificando la integridad mediante el SHA256 publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README de GitHub del nodo ComfyUI-KSR-Unofficial menciona "performance numbers", pero no se proporcionan en la información accesible. La única comparación visual disponible es la imagen de ejemplo del pescador, que contrasta nearest, bicúbico, Kandinsky ImageSR y el original, sin métricas cuantitativas (PSNR, SSIM, LPIPS u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el archivo de pesos ocupa ~10,3 GB en bf16, por lo que se requiere al menos esa cantidad de VRAM para cargar el transformer completo en bf16, más la memoria del VAE de FLUX.1 y los tensores de activación.
- La conversión a fp8 en carga (`weight_dtype`) reduce el uso de memoria del transformer aproximadamente a la mitad, aunque no se documenta la VRAM total resultante.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del modelo, se necesitan GPUs con al menos 16-24 GB de VRAM para bf16; no se confirma compatibilidad con GPUs de consumo concretas.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-KSR-Unofficial; requiere el VAE de FLUX.1 (`ae.safetensors` de black-forest-labs/FLUX.1-schnell) en `ComfyUI/models/vae/` y el transformer en `ComfyUI/models/diffusion_models/`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky-ImageSR-2.0-ComfyUI | Transformer de difusión para superresolución | no disponible | no aplica | MIT | Hugging Face (repo de 10,3 GB) |
| Kandinsky ImageSR 2.0 (original) | Transformer de difusión para superresolución | no disponible | no aplica | MIT | Hugging Face (kandinskylab) |
| Upcasters clásicos (bicúbico, nearest) | Interpolación | no aplica | no aplica | según implementación | Amplia |

No se dispone de datos de benchmarks ni de otros modelos de superresolución comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa de rendimiento.

## Limitaciones y advertencias

- El reempaquetado es no oficial y no está afiliado a Kandinsky Lab; la responsabilidad del empaquetado recae en el autor hmdlsk.
- No es un fine-tune: los pesos son idénticos al original, por lo que hereda cualquier limitación del modelo base, cuyos detalles no se documentan en la información disponible.
- Riesgo de alucinación visual: como modelo generativo de difusión, puede sintetizar detalle inexistente en la imagen de entrada, lo que es problemático en contextos forenses, médicos o de documentación.
- Requiere el VAE de FLUX.1 de forma externa (`ae.safetensors`); no se incluye en el repo, lo que añade una dependencia adicional.
- El nodo de ComfyUI es no oficial (ComfyUI-KSR-Unofficial) y su mantenimiento no está garantizado.
- No se documentan sesgos conocidos, limitaciones de idioma (no aplica) ni restricciones de licencia para uso comercial; la licencia MIT permite uso comercial, pero se recomienda revisar la model card original de Kandinsky Lab.
- El repo tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una adopción muy limitada y poca validación por parte de la comunidad.
- No se dispone de información sobre latencia, throughput ni requisitos mínimos de VRAM verificados en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hmdlsk/Kandinsky-ImageSR-2.0-ComfyUI
- Modelo base original: https://huggingface.co/kandinskylab/Kandinsky-ImageSR-2.0
- Nodo ComfyUI no oficial: https://github.com/the-aSak/ComfyUI-KSR-Unofficial
- VAE de FLUX.1 (black-forest-labs/FLUX.1-schnell): https://huggingface.co/black-forest-labs/FLUX.1-schnell
- Imagen de comparación (pescador): https://raw.githubusercontent.com/the-aSak/ComfyUI-KSR-Unofficial/main/docs/compare_fisherman.jpg
