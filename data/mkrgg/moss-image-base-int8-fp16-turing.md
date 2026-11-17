# mkrgg/MOSS-Image-Base-INT8-FP16-Turing

## Resumen

MOSS-Image-Base-INT8-FP16-Turing es una variante optimizada del modelo de difusión texto-a-imagen MOSS-Image-Base, publicada por el usuario mkrgg. No se trata de un modelo entrenado desde cero, sino de un empalme (splice) a nivel de byte que combina los pesos INT8 oficiales de Comfy-Org con la parte no cuantizada tomada de la versión FP16 de KBlueLeaf, con el objetivo de ejecutar MOSS-Image en GPUs Turing (RTX 2000) que carecen de soporte nativo de BF16.

El problema que resuelve es concreto: en Turing, ComfyUI emula BF16 mediante FP32, lo que hace que las capas INT8 se mantengan en INT8 pero la atención, las normas, RoPE y las conexiones residuales se ejecuten en FP32, degradando gravemente el rendimiento. Esta variante permite cargar los pesos como INT8 + FP16, aprovechando los tensor cores FP16 e INT8 disponibles en Turing, con una velocidad medida de 4,76-4,80 s/it frente a 6,58-6,64 s/it del cargador por defecto.

El repositorio ocupa 10,8 GB e incluye tanto los pesos base como la variante "heal", con licencia Apache 2.0. Es relevante para quienes despliegan modelos de imagen en hardware de gama media sin BF16 y necesitan recuperar velocidad de inferencia sin reentrenar ni recuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (base: MOSS-Image); detalles de arquitectura interna no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen) |
| Tipos de cuantizacion | INT8 (168 lineales: `layers.N.proj.{qkv,o,ffn_up_gate,ffn_down}`) + FP16 para el resto; variantes BF16 y FP16 completas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es MOSS-Image, un modelo de difusión texto-a-imagen desarrollado por OpenMOSS-Team. Esta ficha no dispone de información sobre el número de parámetros, la composición del dataset de entrenamiento ni el proceso de alineación (RLHF/DPO) del modelo original. Lo que sí está documentado es la intervención técnica realizada por el autor de esta variante.

La innovación clave es el empalme a nivel de byte sin recuantización: se toman los códigos INT8 y las escalas (`weight_scale` F32, `comfy_quant` U8, `comfy_attention.config` U8) de los pesos INT8 oficiales de Comfy-Org, y se combinan con 210 tensores BF16 convertidos a F16 y `rope.bands` F32 procedentes de la versión FP16 de KBlueLeaf. Los pesos base de KBlueLeaf están plegados con un factor c = 2⁻⁴, que no afecta a las 168 lineales INT8, por lo que los códigos oficiales siguen siendo válidos. Los tensores INT8 están rotados mediante ConvRot (Hadamard 256, H⁴ de H4/2, entradas ±1/16), y la comparación correcta contra el peso denso con la misma rotación arroja un error relativo L2 de 0,85-0,94 %, consistente con la cuantización INT8 esperada.

## Capacidades

- Generación de imágenes a partir de prompts de texto (pipeline text-to-image).
- Dos variantes de pesos: base y "heal" (esta última presumiblemente con correcciones, sin detalles en la información disponible).
- Ejecución en GPUs Turing (SM75) mediante INT8 + FP16, sin necesidad de BF16 nativo.
- Compatible con ComfyUI mediante el nodo externo `ComfyUI-MossFP16`, que sustituye `MOSSImage.supported_inference_dtypes` durante la carga.
- Opción de `clamp_FP16` (hook por bloque con `x.clamp_(-65504, 65504)`) como red de seguridad para los pesos base sin plegar.
- No se documentan capacidades de tool calling, agentes, visión inversa, audio ni modo thinking; es un modelo puramente generativo de imagen.

## Casos de uso

- Generación de imágenes en estaciones con RTX 2060 SUPER u otras GPUs Turing: el modelo permite obtener 4,76-4,80 s/it en lugar de 6,58-6,64 s/it, lo que reduce el tiempo por imagen en aproximadamente un 28 % en el mismo hardware.
- Despliegue en ComfyUI para flujos de trabajo de ilustración: se carga mediante el nodo `ComfyUI-MossFP16`, que registra su propio `cached_patcher_init` para conservar la anulación de dtypes en recargas sucesivas.
- Prototipado rápido en hardware de gama media: al ocupar 10,8 GB el repositorio y requerir un pico de stream de ~3,9k (base) o ~3,1k (heal), es viable en GPUs consumer con suficiente VRAM.
- Comparación de fidelidad visual entre INT8 y denso: el autor documenta el error relativo L2 (0,85-0,94 %) con la rotación aplicada, útil para validar que la cuantización no degrada la salida de forma apreciable.
- Investigación sobre cuantización post-entrenamiento en modelos de difusión: el enfoque de empalme byte-level sin recuantización sirve como referencia metodológica para otros modelos con lineales INT8.
- Uso de la variante "heal" en pipelines que requieran los pesos corregidos: el archivo `moss_image_heal_int8_fp16.safetensors` ofrece la ruta rápida (4,76 s/it) con los pesos heal.
- Integración en entornos sin BF16: cualquier GPU Ampere o anterior que se vea forzada a FP32 por el cargador por defecto de ComfyUI puede beneficiarse del override de dtypes.

## Benchmarks y rendimiento

Los únicos datos disponibles son los tiempos de inferencia medidos por el autor en una RTX 2060 SUPER (SM75), con el mismo test para todas las ejecuciones:

| Modelo | Cargador | s/it | Comentario |
|---|---|---|---|
| `moss_image_heal_int8_fp16` | MOSS Image Loader (FP16) | 4,76 | ruta rápida completa |
| `moss_image_heal_int8_convrot` | por defecto | 6,58 | INT8 nativo, resto en FP32 |
| `moss_image_base_int8_convrot` | por defecto | 6,64 | base oficial, cómputo FP32 |
| `moss_image_base_int8_convrot` | Loader FP16 + clamp ON | 4,80 | pesos oficiales sin plegar en FP16, clamp satura en 65504 |
| `moss_image_base_int8_fp16` | Loader FP16 + clamp ON | 4,78 | pesos plegados (pico ~3,9k), clamp innecesario |

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio pesa 10,8 GB y el autor reporta un pico de stream de ~3,9k para la base plegada y ~3,1k para heal (unidades no especificadas en la información).
- GPU objetivo principal: Turing (RTX 2060 SUPER, SM75), con tensor cores FP16 e INT8 (DP4A/IMMA) pero sin BF16 nativo.
- Compatible con Ampere en adelante (RTX 3000+), donde BF16 sí está soportado por hardware.
- Cabe en GPU consumer: el autor lo ejecuta en una RTX 2060 SUPER; no se documentan pruebas en otras consumer.
- Opciones de despliegue: ComfyUI con el nodo `ComfyUI-MossFP16`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de imagen).
- Latencia medida: 4,76-4,80 s/it en la ruta rápida frente a 6,58-6,64 s/it en la ruta por defecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-Base-INT8-FP16-Turing (esta ficha) | no disponible | no aplica | 4,76-4,80 s/it en RTX 2060 SUPER | Apache 2.0 | Hugging Face (0 descargas) |
| Comfy-Org/MOSS-Image (INT8 oficial) | no disponible | no aplica | 6,64 s/it en el mismo hardware | Apache 2.0 (según modelo base) | Hugging Face |
| KBlueLeaf/MOSS-Image-FP16-fixed | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| KBlueLeaf/MOSS-Image-heal | no disponible | no aplica | no disponible | no disponible | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base documentadas en la información; no se dispone de datos de benchmarks de calidad ni de otros modelos de difusión comparables.

## Limitaciones y advertencias

- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria de la variante.
- El empalme es una operación manual a nivel de byte; cualquier error en los offsets o en la rotación ConvRot puede producir pesos inválidos sin aviso evidente.
- El clamp FP16 (`x.clamp_(-65504, 65504)`) es necesario para los pesos base sin plegar; sin él, la ruta FP16 puede saturar.
- Los pesos INT8 están rotados con ConvRot; una comparación directa sin aplicar la misma rotación da un error de ~1,37 que no refleja el error real de cuantización.
- No se documentan sesgos, tasas de alucinación visual ni limitaciones idiomáticas del modelo base.
- No hay información sobre restricciones adicionales de uso comercial más allá de la licencia Apache 2.0 declarada.
- El rendimiento medido corresponde exclusivamente a una RTX 2060 SUPER; no hay datos para otras GPUs.
- La fecha de creación del repositorio (2026-11-17) es posterior a la fecha actual, lo que puede indicar un error en los metadatos de la plataforma.

## Enlaces

- Hugging Face: https://huggingface.co/mkrgg/MOSS-Image-Base-INT8-FP16-Turing
- Nodo ComfyUI del autor: https://github.com/mkrgg/ComfyUI-MossFP16
- Modelo base oficial: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Variante FP16: https://huggingface.co/KBlueLeaf/MOSS-Image-FP16-fixed
- Variante heal: https://huggingface.co/KBlueLeaf/MOSS-Image-heal
- Pesos INT8 oficiales: https://huggingface.co/Comfy-Org/MOSS-Image
