# Comfy-Org/Boogu-Image

## Resumen

Boogu-Image es una familia de modelos de difusion para generacion y edicion de imagenes desarrollada por Boogu, distribuida en este repositorio por Comfy-Org como un paquete de pesos en formato single-file listos para su uso en ComfyUI. El repositorio agrupa cuatro variantes del modelo base 0.1: `Base` (texto a imagen), `Turbo` (texto a imagen acelerado), `Edit` (edicion de imagen por instrucciones) y `Edit-Turbo` (edicion acelerada), ademas de versiones "hotfix" de las variantes Turbo con correcciones aplicadas.

Tecnicamente se trata de un modelo de difusion condicionado por un text encoder multimodal Qwen3-VL de 8B (en el paquete aparece como `qwen3vl_8b_fp8_scaled.safetensors`) y un VAE heredado de FLUX.1 (`flux1_vae_bf16.safetensors`). La combinacion de un encoder VLM de 8B con un VAE de FLUX sugiere una arquitectura de difusion de tipo transformer (DiT) con condicionamiento textual enriquecido, aunque la model card no detalla el backbone exacto ni el numero de parametros del UNet/DiT.

Su relevancia practica radica en la disponibilidad de pesos en multiples precisiones (bf16, fp8 scaled, int8 con rotacion de convoluciones, nvfp4) y de LoRAs de rango 128 para las variantes Turbo, lo que permite desplegar el modelo en GPUs de consumo con cuantizaciones agresivas. La licencia Apache 2.0 y el hecho de que el paquete incluya workflows oficiales de ComfyUI lo convierten en una opcion atractiva para pipelines de generacion y edicion de imagenes en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (single-file) con text encoder Qwen3-VL 8B y VAE FLUX.1; backbone exacto no disponible |
| Parametros totales | no disponible (el repo pesa 250,1 GB e incluye multiples variantes y precisiones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, fp8 scaled, int8 convrot, nvfp4 |
| Idiomas soportados | no disponible (prompts en lenguaje natural, presumiblemente multilingue via Qwen3-VL) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del backbone de difusion. El paquete revela que el condicionamiento textual se realiza mediante un text encoder Qwen3-VL de 8B parametros, lo que aporta comprension multimodal (texto e imagen) al pipeline, y que la decodificacion latente usa el VAE de FLUX.1. Esta combinacion es coherente con un transformer de difusion (DiT) condicionado por embeddings de un VLM, pero el numero de capas, dimensiones y parametros del denoiser no se especifica en la model card.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La existencia de variantes "Turbo" y de LoRAs de rango 128 sugiere un proceso de destilacion por pasos (step distillation) para reducir el numero de pasos de inferencia, y las versiones "hotfix" indican correcciones posteriores al lanzamiento inicial. La variante `Edit` incorpora capacidad de edicion por instrucciones, lo que implica entrenamiento con pares imagen-instruccion-imagen resultado.

## Capacidades

- Generacion de imagenes a partir de texto (variantes `Base` y `Turbo`).
- Edicion de imagenes guiada por instrucciones en lenguaje natural (variantes `Edit` y `Edit-Turbo`).
- Generacion acelerada con pocos pasos de inferencia en las variantes Turbo.
- Comprension de prompts complejos gracias al text encoder Qwen3-VL de 8B, que aporta capacidades multimodales.
- Integracion nativa con ComfyUI mediante workflows oficiales (texto a imagen, edicion y edicion int8).
- Soporte de LoRAs para las variantes Turbo (rango 128), lo que permite ajuste fino ligero.
- Despliegue en precisiones reducidas (fp8, int8, nvfp4) para hardware con VRAM limitada.
- No se documentan capacidades de tool calling, agentes ni audio, por tratarse de un modelo de generacion de imagenes.

## Casos de uso

- Generacion de ilustraciones para articulos y blogs: la variante Turbo permite obtener imagenes en pocos pasos, lo que agiliza la iteracion sobre prompts en un editor como ComfyUI.
- Edicion de fotografia de producto: la variante `Edit` acepta una imagen de entrada y una instruccion textual para cambiar fondo, iluminacion o elementos, lo que reduce el trabajo manual de retoque.
- Creacion de assets para videojuegos: generacion de concept art y variaciones mediante LoRAs de estilo, con la variante Base en bf16 para maxima calidad.
- Prototipado rapido en estaciones de trabajo con GPU de consumo: las versiones int8 convrot y nvfp4 reducen los requisitos de VRAM y permiten ejecutar el modelo en GPUs de gama alta para consumidores.
- Automatizacion de pipelines de contenido: los workflows JSON oficiales de ComfyUI pueden orquestarse mediante su API para generar lotes de imagenes de forma programatica.
- Edicion por lotes en entornos de diseno: la variante `Edit-Turbo` con pocos pasos permite procesar muchas imagenes con instrucciones estandarizadas (por ejemplo, eliminar fondos o uniformar estilos).
- Investigacion en difusion: la disponibilidad de pesos en multiples precisiones y de LoRAs facilita experimentos de cuantizacion, destilacion y ajuste fino con licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el paquete completo pesa 250,1 GB e incluye todas las variantes y precisiones. Para una sola variante en bf16 se requiere una GPU con VRAM suficiente para el denoiser mas el text encoder Qwen3-VL 8B y el VAE; las versiones fp8, int8 y nvfp4 reducen sustancialmente ese requisito.
- GPUs recomendadas: no especificadas por el autor. Por el tamano del text encoder (8B) y la presencia de cuantizaciones nvfp4, se orienta a GPUs de datacenter (A100, H100) en bf16 y a GPUs de consumo de gama alta en las variantes cuantizadas.
- Cabe en GPU de consumo: si, en las variantes int8 convrot y nvfp4, segun el diseno del paquete; no se detalla la VRAM exacta necesaria.
- Opciones de despliegue: ComfyUI (soporte nativo con workflows oficiales). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no son adecuadas para modelos de difusion.
- Latencia y throughput: no disponibles. Las variantes Turbo estan disenadas para reducir el numero de pasos de inferencia, pero no se publican tiempos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Boogu-Image 0.1 | no disponible | no disponible | Apache 2.0 | Hugging Face (Comfy-Org y Boogu) | Familia con variantes Base, Turbo, Edit y Edit-Turbo; text encoder Qwen3-VL 8B y VAE FLUX.1 |
| FLUX.1 (Black Forest Labs) | no disponible en la informacion | no disponible | Licencia no comercial en versiones dev/schnell; Apache 2.0 en schnell | Hugging Face | Referencia por el uso de su VAE en Boogu-Image; no se dispone de datos comparativos de rendimiento |
| Alternativas de edicion por instrucciones | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion suficiente para una comparacion cuantitativa |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a aspectos de licencia y disponibilidad.

## Limitaciones y advertencias

- La model card es un empaquetado para ComfyUI y no documenta sesgos, composicion del dataset ni evaluaciones de seguridad; se desconoce el riesgo de sesgos demograficos o estilisticos.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir detalles incoherentes, texto mal renderizado o anatomia incorrecta; no se han publicado evaluaciones al respecto.
- No se especifican los idiomas soportados en los prompts; la cobertura multilingue depende del text encoder Qwen3-VL y no esta verificada por el autor.
- La licencia Apache 2.0 permite uso comercial, pero al reutilizar el VAE de FLUX.1 conviene verificar las condiciones de la licencia original de FLUX.1 para el componente derivado.
- El repositorio es muy pesado (250,1 GB) e incluye multiples variantes y precisiones; es necesario descargar solo los archivos de la variante deseada para evitar consumo innecesario de disco y ancho de banda.
- Las variantes "hotfix" indican que las versiones Turbo originales requirieron correcciones; se recomienda usar las versiones hotfix en produccion.
- No hay informacion sobre latencia, throughput ni calidad medida, por lo que la idoneidad para produccion debe validarse empiricamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/Boogu-Image
- Repositorio original del modelo: https://huggingface.co/Boogu
- ComfyUI (GitHub): https://github.com/Comfy-Org/ComfyUI
- Workflow edicion int8: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_boogu_image_0_1_edit_int8.json
- Workflow edicion: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_boogu_image_0_1_edit.json
- Workflow Turbo texto a imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_boogu_image_0_1_turbo_t2i.json
