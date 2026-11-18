# Comfy-Org/Pixal3D

## Resumen

Pixal3D es un modelo de difusión para generación de contenido 3D desarrollado por TencentARC (repositorio original) y reempaquetado por Comfy-Org para su uso directo en ComfyUI. El modelo resuelve el problema de la reconstrucción y generación de activos 3D a partir de imágenes: convierte una sola imagen o un conjunto de vistas múltiples en una malla 3D con textura, apoyándose en los VAE de forma y textura de TRELLIS.2 y en un codificador visual DINOv3 para la extracción de características.

La relevancia actual del modelo radica en su integración con el ecosistema ComfyUI mediante archivos de pesos en un solo fichero (`diffusion-single-file`), lo que elimina la necesidad de gestionar pipelines complejos de Python. El repositorio reúne los pesos en precisión bf16 e int8 con rotación de convoluciones (`convrot`), además de los componentes auxiliares (VAE de forma, VAE de textura y CLIP vision) necesarios para ejecutar los flujos de trabajo de imagen a modelo y de múltiples vistas a 3D.

No se dispone de información pública sobre el número de parámetros, la longitud de contexto (no aplica a un modelo de difusión 3D) ni los datos de entrenamiento en la información proporcionada. El repositorio ocupa 36,4 GB e incluye variantes bf16 e int8, lo que sugiere un modelo de tamaño considerable orientado a inferencia en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusión para generación 3D (single-file para ComfyUI); componentes auxiliares basados en TRELLIS.2 (VAE de forma y textura) y DINOv3 (CLIP vision) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (no aplica a un modelo de difusión 3D) |
| Tipos de cuantizacion | bf16 e int8 con rotación de convoluciones (`int8_convrot`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`pixal3d_bf16.safetensors`, `pixal3d_int8_convrot.safetensors`, `pixal3d_multiview_bf16.safetensors`, `pixal3d_multiview_int8_convrot.safetensors`, `dino_v3_L_naf_fp32.safetensors`, `trellis_2_shape_vae_bf16.safetensors`, `trellis_2_texture_vae_bf16.safetensors`) |

## Arquitectura y entrenamiento

Pixal3D es un modelo de difusión orientado a la generación de geometría y textura 3D. La arquitectura se apoya en dos componentes diferenciados: un modelo de difusión principal para la generación de la forma y un modelo de difusión multivista (`pixal3d_multiview_*`) para la coherencia entre vistas. La decodificación de la geometría y de la textura se realiza mediante los VAE de TRELLIS.2 (`trellis_2_shape_vae_bf16` y `trellis_2_texture_vae_bf16`), mientras que la extracción de características visuales de las imágenes de entrada recae en un codificador DINOv3 de tamaño L (`dino_v3_L_naf_fp32`).

El reempaquetado de Comfy-Org incluye variantes en bf16 y en int8 con rotación de convoluciones, una técnica de cuantización que reduce el error numérico en capas convolucionales y permite ejecutar el modelo con menor huella de VRAM manteniendo una calidad razonable. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card del repositorio reempaquetado no detalla el proceso de entrenamiento del modelo original.

## Capacidades

- Generación de mallas 3D con textura a partir de una única imagen (flujo imagen a modelo).
- Generación de 3D a partir de múltiples vistas de entrada (flujo multivista a 3D), con un modelo de difusión específico para garantizar coherencia entre vistas.
- Decodificación separada de forma y textura mediante VAE dedicados de TRELLIS.2.
- Extracción de características visuales con DINOv3-L para condicionar la generación.
- Integración nativa con ComfyUI mediante archivos de pesos en un solo fichero y flujos de trabajo predefinidos.
- Ejecución en bf16 e int8 cuantizado con rotación de convoluciones para ajustar el consumo de VRAM.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso ni capacidades de audio o lenguaje natural.

## Casos de uso

- Prototipado rápido de activos 3D para videojuegos: a partir de un concepto 2D o una foto de referencia, el flujo imagen a modelo genera una malla texturizada que sirve como base para el modelado posterior en Blender o Maya.
- Reconstrucción de objetos a partir de fotografías: el flujo multivista a 3D permite introducir varias vistas de un objeto físico y obtener una representación 3D coherente, útil en catalogación de productos o patrimonio.
- Generación de assets para entornos de realidad aumentada: el modelo produce mallas con textura que pueden importarse en motores como Unity o Unreal para escenas AR.
- Iteración de diseño industrial: los diseñadores pueden introducir bocetos o renders y obtener variantes 3D rápidas para evaluar volumetría y proporciones antes de comprometerse con un modelo CAD.
- Creación de contenido para impresión 3D: el flujo imagen a modelo permite convertir una ilustración en una malla imprimible, con la textura como referencia de color para el postprocesado.
- Automatización de pipelines de contenido en ComfyUI: al ser un fichero único compatible con ComfyUI, se puede encadenar con nodos de generación de imagen (por ejemplo, para generar la imagen de entrada y convertirla a 3D en el mismo grafo).
- Docencia y demostraciones de generación 3D: la licencia MIT y la disponibilidad de pesos en bf16 e int8 facilitan su uso en entornos académicos y talleres prácticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 36,4 GB e incluye variantes bf16 e int8; la variante int8 con rotación de convoluciones reduce la huella respecto a bf16, pero no se especifica la VRAM mínima.
- GPU recomendadas: no disponible. Por el tamaño del repositorio y la presencia de variantes bf16, se requiere una GPU con suficiente VRAM para cargar los pesos del modelo de difusión, los dos VAE y el codificador DINOv3-L; no se confirma compatibilidad con GPU de consumo.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: ComfyUI (flujos de trabajo oficiales `3d_pixal3d_trellis2_image_to_model.json` y `3d_pixal3d_multi_views.json`). No se documentan opciones para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pixal3D (Comfy-Org) | difusión 3D imagen/multivista a malla | no disponible | no aplica | MIT | Hugging Face, ComfyUI |
| TRELLIS.2 (Tencent) | generación 3D | no disponible | no aplica | no disponible en la información proporcionada | referenciado como componente VAE en este repositorio |
| Modelos de generación 3D comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo; al ser un modelo de generación 3D, los sesgos potenciales estarían en la distribución de los datos de entrenamiento originales, no detallados en la información disponible.
- Riesgo de alucinación geométrica: como modelo generativo, puede producir geometrías plausibles pero incorrectas respecto a la imagen de entrada, especialmente con vistas oclusivas o entradas ambiguas.
- No se especifican limitaciones de idioma porque el modelo no procesa texto de forma nativa; la entrada es visual.
- La licencia MIT permite uso comercial, pero el modelo se basa en TencentARC/Pixal3D y en componentes de TRELLIS.2 y DINOv3; conviene verificar las licencias de los modelos base originales antes de un despliegue comercial.
- El repositorio reempaquetado no incluye información sobre el proceso de entrenamiento, los datos utilizados ni evaluaciones de calidad, lo que dificulta estimar su robustez en producción.
- La integración está pensada para ComfyUI; no se documentan APIs de servidor ni soporte para otros frameworks de inferencia.
- El tamaño del repositorio (36,4 GB) y la ausencia de datos de VRAM mínima obligan a validar el hardware antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/Pixal3D
- Modelo original: https://huggingface.co/TencentARC/Pixal3D
- ComfyUI (GitHub): https://github.com/Comfy-Org/ComfyUI
- Flujo de trabajo imagen a modelo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/3d_pixal3d_trellis2_image_to_model.json
- Flujo de trabajo multivista a 3D: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/3d_pixal3d_multi_views.json
