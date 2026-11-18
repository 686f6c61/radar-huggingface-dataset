# Comfy-Org/MOSS-Image

## Resumen

MOSS-Image es un modelo de difusion para generacion y edicion de imagenes, desarrollado originalmente por OpenMOSS-Team y reempaquetado por Comfy-Org para su uso directo en ComfyUI. Esta ficha describe el repositorio `Comfy-Org/MOSS-Image`, que no contiene pesos nuevos sino una reorganizacion de los ficheros del modelo original en el formato de fichero unico (`diffusion-single-file`) que consume ComfyUI, junto con los text encoders, VAE y LoRAs necesarios para los flujos de trabajo habituales.

El repositorio agrupa dos variantes del modelo de difusion (una base y una ajustada con SFT), un text encoder basado en Qwen3.5 de 9B, dos VAEs derivados de FLUX.2 y varias LoRAs para edicion de imagen y control de color/profundidad. El objetivo es facilitar el despliegue en produccion y en entornos de investigacion sin tener que descargar y reorganizar manualmente los repositorios originales.

Es relevante ahora porque concentra en un unico paquete todos los componentes necesarios para tareas de texto-a-imagen, edicion guiada por layout (bounding boxes) y control estructural, con licencia Apache 2.0 y un volumen de descargas muy alto (mas de 6,4 millones), lo que indica una adopcion amplia en la comunidad de ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (single-file para ComfyUI); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | bf16, int8 (convrot), w4a8 GPTQ (solo para el text encoder Qwen3.5 9B) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (diffusion-single-file) |

Componentes incluidos en el repositorio:

| Componente | Fichero | Tipo |
|---|---|---|
| Modelo de difusion base | `moss_image_base_bf16.safetensors` | bf16 |
| Modelo de difusion base (cuantizado) | `moss_image_base_int8_convrot.safetensors` | int8 |
| Modelo de difusion SFT | `moss_image_sft_bf16.safetensors` | bf16 |
| Modelo de difusion SFT (cuantizado) | `moss_image_sft_int8_convrot.safetensors` | int8 |
| LoRA de edicion | `moss_image_edit_lora_rank_64_bf16.safetensors` | LoRA rank 64 |
| LoRA de control color/profundidad | `moss_image_color_depth_control.safetensors` | LoRA |
| Text encoder | `qwen3.5_9b_bf16.safetensors` | bf16 |
| Text encoder (cuantizado) | `qwen3.5_9b_int8_convrot.safetensors` | int8 |
| Text encoder (cuantizado) | `qwen3.5_9b_w4a8_gptq.safetensors` | w4a8 GPTQ |
| VAE | `flux2-vae.safetensors` | VAE |
| VAE (reducido) | `flux2-vae_small.safetensors` | VAE |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo de difusion (tipo de backbone, numero de parametros, mecanismo de atencion ni esquema de entrenamiento). Lo que si se puede afirmar es que el sistema completo combina un text encoder Qwen3.5 de 9B con un VAE derivado de FLUX.2 y un modelo de difusion que se ofrece en dos variantes: base y SFT. La variante SFT implica un ajuste supervisado sobre la base, orientado presumiblemente a mejorar la fidelidad y el seguimiento de instrucciones, aunque no se especifica el dataset ni el volumen de tokens utilizados.

El reempaquetado de Comfy-Org se limita a consolidar los pesos en ficheros unicos compatibles con ComfyUI y a proporcionar versiones cuantizadas (int8 con rotacion de convolucion, y w4a8 GPTQ para el text encoder) que reducen el uso de VRAM. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion proporcionada.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con las variantes base y SFT.
- Edicion de imagenes mediante LoRA dedicada (`moss_image_edit_lora_rank_64_bf16`), que permite modificar una imagen de entrada segun una instruccion.
- Generacion guiada por layout: soporte de bounding boxes para controlar la posicion de los elementos en la imagen resultante.
- Control de color y profundidad mediante LoRA especifica (`moss_image_color_depth_control`).
- Integracion nativa con ComfyUI mediante flujos de trabajo predefinidos (plantillas oficiales en el repositorio de Comfy-Org).
- Soporte de cuantizacion para despliegue con menor huella de memoria (int8 y w4a8 GPTQ en el text encoder).
- No se documentan capacidades de vision por computador mas alla de la generacion/edicion, ni tool calling, ni agentes, ni modo thinking.

## Casos de uso

- Generacion de imagenes en produccion con ComfyUI: el paquete incluye todos los ficheros necesarios (modelo, text encoder, VAE) en las carpetas correctas, lo que permite poner en marcha un pipeline de text-to-image sin configuracion manual adicional.
- Edicion de imagenes asistida: usando la LoRA de edicion, se puede tomar una imagen existente y aplicar modificaciones guiadas por prompt, util para retoque fotografico o prototipado creativo.
- Composicion con control de layout: los flujos con bounding boxes permiten especificar donde debe aparecer cada elemento, adecuado para diseno de interfaces, maquetas publicitarias o generacion de escenas con composicion controlada.
- Control estructural color/profundidad: la LoRA correspondiente permite transferir la paleta de color o el mapa de profundidad de una imagen de referencia a una nueva generacion, util en postproduccion y en pipelines de estilo consistente.
- Investigacion en modelos de difusion: al estar bajo Apache 2.0 y ofrecer variantes bf16 e int8, sirve como base para experimentos de fine-tuning o para comparar el efecto de la cuantizacion en la calidad de salida.
- Despliegue en entornos con VRAM limitada: las versiones int8 del modelo de difusion y las cuantizaciones w4a8/int8 del text encoder permiten ejecutar el sistema en GPUs de consumo, ampliando el acceso a equipos no profesionales.
- Automatizacion de generacion de assets: integrado en ComfyUI, se puede encadenar con otros nodos para producir lotes de imagenes de forma programatica en flujos de trabajo de diseno o marketing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, el repositorio completo ocupa 68,8 GB, pero ese tamano incluye todas las variantes (bf16, int8, LoRAs, VAEs y tres versiones del text encoder). La VRAM real necesaria depende de la variante cargada y del flujo de trabajo.
- GPU recomendadas: no especificadas en la informacion disponible. Las variantes int8 y las cuantizaciones del text encoder estan pensadas para reducir requisitos y facilitar el uso en GPUs de consumo, pero no se detallan modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada explicitamente; la existencia de cuantizaciones int8 y w4a8 sugiere que se busca ese escenario, pero no hay datos oficiales.
- Opciones de despliegue: ComfyUI es el entorno de referencia (formato `diffusion-single-file` y flujos de trabajo oficiales). No se documentan otros motores como vLLM, llama.cpp o TGI, que ademas no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables en la informacion proporcionada para establecer una comparativa rigurosa con otros modelos de difusion. Se indica "no disponible".

## Limitaciones y advertencias

- La informacion disponible no detalla sesgos conocidos del modelo; al ser un modelo de generacion de imagenes, es previsible que herede sesgos de sus datos de entrenamiento, pero no se documentan.
- Riesgo de alucinacion visual: como todo modelo generativo de imagenes, puede producir contenido incoherente o no fiel al prompt; no se aportan tasas de error.
- No se especifican los idiomas soportados por el text encoder en el contexto de este modelo, aunque este se basa en Qwen3.5 9B.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio es un reempaquetado; conviene verificar las condiciones de los repositorios originales (OpenMOSS-Team) y de los componentes derivados (VAE FLUX.2, LoRAs de terceros como `darask0` y `chinoll`).
- El repositorio incluye componentes de terceros (LoRAs y VAE) cuyas licencias pueden diferir de Apache 2.0; no se detalla su licencia individual.
- No hay informacion sobre el numero de parametros ni sobre el contexto, por lo que no se puede evaluar la eficiencia computacional con precision.
- El uso en produccion requiere validar la calidad de las variantes cuantizadas (int8, w4a8), ya que no se publican metricas de degradacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/MOSS-Image
- Modelo base original: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Modelo SFT original: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- LoRA de control color/profundidad: https://huggingface.co/darask0/MOSS-Image-color-depth-control
- LoRA de edicion: https://huggingface.co/chinoll/Moss-Image-Edit
- Repositorio ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Plantillas de flujos de trabajo: https://github.com/Comfy-Org/workflow_templates
