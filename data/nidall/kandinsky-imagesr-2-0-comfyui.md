# NidAll/Kandinsky-ImageSR-2.0-ComfyUI

## Resumen

Kandinsky-ImageSR-2.0-ComfyUI es un conjunto de checkpoints de superresolucion de imagen empaquetados como ficheros unicos `.safetensors` para su uso nativo en ComfyUI. Lo publica el usuario NidAll y deriva del modelo original `kandinskylab/Kandinsky-ImageSR-2.0` de Kandinsky Lab (revision `7d5b5ed7`). No es un modelo nuevo entrenado desde cero, sino una conversion optimizada del modelo base para despliegue en produccion dentro del ecosistema ComfyUI mediante el nodo personalizado ComfyUI-Kandinsky-ImageSR2 y la libreria `comfy-kitchen` (version minima 0.2.36).

El paquete ofrece tres variantes de pesos: BF16 sin perdida, INT8 ConvRot-256 (recomendada) y W4A8 con cuantizacion de 4 bits en pesos y 8 bits en activaciones. La optimizacion principal consiste en el plegado bit-exacto de las proyecciones FP32 de `visual_modulation` (de 2,36 GB a 58,8 MB) y la fusion de las proyecciones `to_qkv` (de 2560 a 7680) para reducir el coste de cuantizacion dinamica por bloque. El resultado es un paquete de 14,2 GB en total que incluye las tres variantes, con la INT8 ocupando solo 3,73 GB.

Es relevante ahora porque permite ejecutar superresolucion de imagen de alta calidad en GPUs de consumo, incluida la variante W4A8 que cabe integramente en 4 GB de VRAM. La licencia del transformador es MIT, lo que facilita su uso comercial, y el VAE compatible (FLUX.1 AutoencoderKL) es Apache-2.0 de Black Forest Labs, aunque no se incluye en estos ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para superresolucion de imagen (basado en Kandinsky-ImageSR-2.0); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | BF16 (sin perdida), INT8 ConvRot-256, W4A8 (grupo de 16, ConvRot-256) |
| Idiomas soportados | no disponible (modelo de imagen, no de texto) |
| Licencia | MIT (transformador); VAE FLUX.1 compatible bajo Apache-2.0 |
| Formato de pesos | safetensors (fichero unico por variante) |
| Tamano BF16 | 7,39 GB |
| Tamano INT8 ConvRot-256 | 3,73 GB |
| Tamano W4A8 | 2,13 GB |
| Tamano total del repo | 14,2 GB |
| Modelo base | kandinskylab/Kandinsky-ImageSR-2.0 (revision 7d5b5ed7def0b45b98f398c0b295a6b1658863db) |
| Pipeline | image-to-image |

## Arquitectura y entrenamiento

El modelo base es un modelo de difusion para superresolucion de imagen. La informacion disponible no detalla el numero de parametros, la composicion del dataset de entrenamiento ni si se emplearon tecnicas de RLHF o DPO, por lo que esos datos deben consultarse en la model card del repositorio original de Kandinsky Lab.

Las innovaciones tecnicas documentadas en esta conversion son de optimizacion e inferencia, no de entrenamiento. En primer lugar, el plegado bit-exacto de las 50 proyecciones FP32 de `visual_modulation` sobre las 19 filas fijas de `time_embed_table`, que reduce ese bloque de 2,36 GB a 58,8 MB y elimina 786 MB de pesos de modulacion de atencion cruzada no utilizados. En segundo lugar, la fusion de las proyecciones `to_qkv` (de 2560 a 7680), que reduce la rotacion de activaciones ConvRot-256 y la cuantizacion dinamica INT8 de tres veces a una por bloque, con escalas FP32 por fila para INT8 y por fila mas grupo de 16 para W4A8, sin contaminacion de escalas entre filas. Las capas protegidas (`visual_embeddings`, `out_layer`, `modulation_table` FP32, `xattn_bias_table` FP32, QK `RMSNorm` y todos los sesgos) se mantienen en la precision exacta del modelo fuente.

## Capacidades

- Superresolucion de imagen: aumenta la resolucion de imagenes de entrada mediante un pipeline image-to-image.
- Tres niveles de fidelidad: BF16 sin perdida (error L2 relativo 0,0), INT8 con error L2 relativo medio de 0,00862, y W4A8 con error L2 relativo medio de 0,07304.
- Integracion nativa en ComfyUI mediante el nodo Kandinsky ImageSR 2.0 Model y Kandinsky ImageSR 2.0 Upscale.
- Compatibilidad con backends de atencion de ComfyUI (INT8, Sage, Flash attention) a traves del nodo Model Attention Backend.
- Uso del VAE estandar FLUX.1 (`ae.safetensors` o `ae-bf16.safetensors`).
- No se documentan capacidades de texto, codigo, tool calling, agentes ni multilingues, por tratarse de un modelo de imagen.

## Casos de uso

- Restauracion y ampliacion de fotografias en flujos de trabajo ComfyUI: el modelo se carga como nodo de upscale y procesa la imagen de entrada con el VAE FLUX.1, permitiendo integrar la superresolucion en un grafo mayor de edicion de imagen.
- Despliegue en GPUs de consumo con poca VRAM: la variante W4A8 (2,13 GB) cabe integramente en GPUs de 4 GB, lo que permite superresolucion local en equipos modestos sin depender de servicios en la nube.
- Produccion con equilibrio calidad/velocidad: la variante INT8 ConvRot-256 (3,73 GB) es la recomendada por el autor para Turing, Ampere, Ada, Hopper, Blackwell y ROCm, con un error L2 relativo inferior al 1 %.
- Referencia de maxima fidelidad: la variante BF16 (7,39 GB) sirve como linea base sin perdida para validar resultados o para tareas donde cualquier degradacion por cuantizacion sea inaceptable.
- Pipeline de mejora de assets en videojuegos o contenido digital: ampliar texturas e imagenes de baja resolucion antes de integrarlas en un flujo de produccion dentro de ComfyUI.
- Preprocesado para modelos de vision posteriores: aumentar la resolucion de imagenes de entrada antes de pasarlas a detectores, segmentadores u otros modelos que se beneficien de mayor detalle.
- Automatizacion por lotes en servidores con ROCm: la compatibilidad declarada con ROCm permite desplegar la variante INT8 en infraestructura AMD.

## Benchmarks y rendimiento

La informacion disponible no incluye benchmarks estandar (PSNR, SSIM, LPIPS u otros) frente a modelos similares. El unico dato cuantitativo publicado es el error L2 relativo de los pesos respecto al modelo BF16 de referencia:

| Variante | Tamano | Error L2 relativo (media) | Error L2 relativo (maximo) |
|---|---:|---:|---:|
| BF16 (Folded + Fused-QKV) | 7,39 GB | 0,0 (sin perdida) | 0,0 |
| INT8 ConvRot-256 | 3,73 GB | 0,00862 | 0,00956 |
| W4A8 (G=16, ConvRot-256) | 2,13 GB | 0,07304 | 0,07315 |

No se han publicado resultados de benchmarks de calidad de imagen en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la variante W4A8 (2,13 GB de pesos) cabe integramente en GPUs de 4 GB de VRAM, segun el autor. La INT8 (3,73 GB) requiere mas margen para activaciones y el VAE; la BF16 (7,39 GB) exige al menos 8 GB en la practica, aunque el autor no especifica cifras exactas de VRAM total.
- GPUs recomendadas: el autor cita compatibilidad con Turing, Ampere, Ada, Hopper, Blackwell y ROCm para la variante INT8. No se detallan modelos concretos como A100, H100 o RTX 4090.
- GPU de consumo: si, la variante W4A8 esta disenada para GPUs de 4 GB; la INT8 es viable en GPUs consumer de gama media y alta con suficiente VRAM.
- Opciones de despliegue: ComfyUI con el nodo personalizado ComfyUI-Kandinsky-ImageSR2 y `comfy-kitchen >= 0.2.36`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion de imagen en este formato).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos alternativos de superresolucion en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A nivel de empaquetado, las tres variantes de este repositorio se comparan entre si en la tabla de benchmarks anterior: la INT8 reduce el tamano un 49,5 % respecto a BF16 con un error L2 por debajo del 1 %, y la W4A8 reduce el tamano un 71,2 % con un error L2 de aproximadamente el 7,3 %.

## Limitaciones y advertencias

- El error L2 relativo de la variante W4A8 (0,07304) es notablemente superior al de INT8 (0,00862); puede producir artefactos visibles en imagenes con detalle fino, por lo que conviene validar la calidad antes de usarla en produccion.
- El modelo depende de un nodo personalizado de terceros (ComfyUI-Kandinsky-ImageSR2) y de una version minima de `comfy-kitchen` (0.2.36); cambios en esas dependencias pueden romper la compatibilidad.
- Requiere descargar por separado el VAE FLUX.1 (`ae.safetensors`), que no se incluye en estos ficheros y tiene su propia licencia Apache-2.0.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma porque es un modelo de imagen; la evaluacion de sesgos visuales debe hacerse sobre el modelo base original.
- La licencia MIT del transformador permite uso comercial, pero debe respetarse la atribucion a Kandinsky Lab y las licencias del VAE y del codigo de cuantizacion (`comfyui-native-quantizer`, Apache-2.0).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de comunidad ni validacion externa del empaquetado.
- La fecha de creacion indicada (2026-11-26) es posterior a la fecha actual; conviene verificar la integridad y procedencia de los ficheros antes de usarlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NidAll/Kandinsky-ImageSR-2.0-ComfyUI
- Modelo base original: https://huggingface.co/kandinskylab/Kandinsky-ImageSR-2.0
- Nodo personalizado ComfyUI: https://github.com/NidAll/ComfyUI-Kandinsky-ImageSR2
- Codigo de cuantizacion: https://github.com/NidAll/comfyui-native-quantizer
