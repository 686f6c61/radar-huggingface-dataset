# Comfy-Org/TRELLIS.2

## Resumen

TRELLIS.2 es un modelo de generación 3D de Microsoft Research distribuido en formato de archivo único para ComfyUI por Comfy-Org. Concretamente, este repositorio (`Comfy-Org/TRELLIS.2`) es un reempaquetado de los pesos originales de `microsoft/TRELLIS.2-4B`, convertidos a safetensors y organizados según la estructura de carpetas que espera ComfyUI (`clip_vision`, `diffusion_models`, `vae`). No se trata de un modelo de lenguaje, sino de un pipeline de difusión para generar mallas 3D con textura a partir de imágenes de entrada.

El modelo base tiene 4B parámetros y sigue la estirpe de TRELLIS, la familia de modelos de Microsoft para generación 3D estructurada. El pipeline se descompone en varios componentes: un codificador de visión DINOv3 ViT-L para extraer características de la imagen, un modelo de difusión principal (disponible en bf16 y en int8 con convrot), y dos VAE específicos, uno para la forma geométrica y otro para la textura. Esta separación permite generar geometría y apariencia por etapas.

Su relevancia actual radica en que democratiza la generación imagen-a-3D dentro de ComfyUI, con licencia MIT y pesos ya empaquetados para su uso directo. El repositorio acumula más de 400.000 descargas y está integrado en las plantillas oficiales de workflows de Comfy-Org (Pixal3D & TRELLIS.2: Image to Model), lo que lo convierte en una de las vías más accesibles para producción de assets 3D asistida por IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión multi-etapa para generación 3D (modelo de difusión principal + VAE de forma + VAE de textura + codificador de visión DINOv3 ViT-L) |
| Parametros totales | 4B (modelo base `microsoft/TRELLIS.2-4B`); desglose por componente no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | bf16 e int8 (variante `trellis_2_int8_convrot.safetensors`); no se detallan otras |
| Idiomas soportados | no disponible (modelo multimodal imagen-a-3D, sin interfaz de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (archivos únicos para ComfyUI: `dino_v3_vit_l`, `trellis_2_bf16`, `trellis_2_int8_convrot`, `trellis_2_shape_vae_bf16`, `trellis_2_texture_vae_bf16`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza de difusión y su tamaño de 4B parámetros. El pipeline se organiza en componentes diferenciados: un codificador de visión DINOv3 ViT-L (`dino_v3_vit_l.safetensors`) que procesa la imagen de entrada, un modelo de difusión principal (`trellis_2_bf16` o `trellis_2_int8_convrot`) y dos VAE separados para forma y textura (`trellis_2_shape_vae_bf16` y `trellis_2_texture_vae_bf16`). Esta separación entre geometría y apariencia es característica de los pipelines de generación 3D estructurada de la familia TRELLIS.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF/DPO o preferencias humanas. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. La variante `int8_convrot` sugiere una cuantización a 8 bits con alguna transformación de rotación de convoluciones, pero los detalles técnicos de esa conversión no están publicados en la información disponible.

## Capacidades

- Generación de mallas 3D con textura a partir de una imagen de entrada (image-to-3D).
- Generación de geometría y textura en etapas separadas mediante VAEs dedicados.
- Integración nativa con ComfyUI mediante workflows oficiales (plantilla Pixal3D & TRELLIS.2: Image to Model).
- Ejecución en dos precisiones: bf16 para máxima calidad e int8 para menor huella de memoria.
- Codificación de imagen con DINOv3 ViT-L como extractor de características visuales.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.

## Casos de uso

- Prototipado rápido de assets 3D para videojuegos: a partir de un concept art o una foto de referencia, el pipeline genera una malla texturizada que sirve como base para retopología y ajuste manual en Blender o Maya.
- Catalogación de producto en e-commerce: convertir fotografías de producto en modelos 3D visualizables en la web, usando la variante int8 para reducir requisitos de memoria en servidores modestos.
- Previsualización arquitectónica: generar volúmenes 3D texturizados a partir de bocetos o renders 2D para iterar sobre propuestas antes de modelado detallado.
- Creación de contenido para impresión 3D: obtener mallas base a partir de imágenes de referencia, que luego se reparan y preparan con herramientas de slicing.
- Enriquecimiento de datasets 3D: generar variaciones de mallas texturizadas para entrenar otros modelos de visión o de reconstrucción 3D.
- Flujos de trabajo en ComfyUI para artistas técnicos: encadenar el nodo de TRELLIS.2 con otros nodos de postprocesado (renderizado, comparación de vistas) dentro de un grafo reproducible y versionable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de difusión de 4B en bf16 requiere del orden de 8-10 GB solo para los pesos, a los que se suman los VAEs y el codificador DINOv3 ViT-L; la variante int8 reduce esa cifra aproximadamente a la mitad para el modelo principal. Estas estimaciones son orientativas y no proceden de la documentación del autor.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar funcionamiento en GPUs consumer de gama alta (RTX 4090, 24 GB) y en GPUs de datacenter (A100, H100) para lotes mayores.
- Compatibilidad con GPU consumer: probable en tarjetas con 16-24 GB de VRAM usando la variante int8; no confirmado por el autor.
- Opciones de despliegue: ComfyUI (vía los archivos safetensors y los workflows oficiales de Comfy-Org). No se documentan otros backends como vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo de difusión 3D.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TRELLIS.2 (este repo) | 4B | Difusión image-to-3D | no aplica | MIT | Safetensors para ComfyUI |
| microsoft/TRELLIS.2-4B | 4B | Difusión image-to-3D | no aplica | no disponible en la información | Repositorio original en Hugging Face |
| Alternativas de image-to-3D de la familia TRELLIS previa | no disponible | Difusión image-to-3D | no aplica | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Este repositorio es un reempaquetado para ComfyUI; la autoría del modelo corresponde a Microsoft. Los problemas de calidad del modelo deben reportarse contra `microsoft/TRELLIS.2-4B`.
- No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones; cualquier expectativa de uso como LLM es incorrecta.
- La información disponible no documenta sesgos, tasas de alucinación geométrica ni limitaciones de idioma.
- La licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo base original de Microsoft, que no se detalla en la información disponible.
- El repositorio ocupa 31,2 GB, lo que implica requisitos de almacenamiento considerables y descargas largas.
- La variante int8 puede introducir pérdida de calidad en geometría o textura frente a bf16; no se documenta la magnitud de esa degradación.
- No se documentan límites de resolución de imagen de entrada ni de complejidad de malla de salida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/TRELLIS.2
- Modelo base original: https://huggingface.co/microsoft/TRELLIS.2-4B
- ComfyUI (GitHub): https://github.com/Comfy-Org/ComfyUI
- Workflow oficial Pixal3D & TRELLIS.2: Image to Model: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/3d_pixal3d_trellis2_image_to_model.json
