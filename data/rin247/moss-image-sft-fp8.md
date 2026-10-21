# Rin247/MOSS-Image-SFT-FP8

## Resumen

MOSS-Image-SFT-FP8 es un paquete de pesos cuantizados en FP8 del modelo de generación de imágenes texto-a-imagen `OpenMOSS-Team/MOSS-Image-SFT`, publicado por el usuario Rin247 en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversión de precisión reducida del checkpoint SFT de la familia MOSS-Image de OpenMOSS, que empaqueta conjuntamente los tres componentes del pipeline (denoiser, codificador de texto y VAE) para simplificar el despliegue. El paquete contiene 5.082.308.624 parámetros y ocupa 13,9 GB en el repositorio.

El interés de esta ficha es doble: por un lado documenta una alternativa de bajo coste de memoria para ejecutar MOSS-Image-SFT, un modelo de difusión especializado en el renderizado de texto legible dentro de la imagen (rótulos, notas manuscritas, pizarras, etiquetas) y en el control de composición mediante prompts en lenguaje natural, secuencias de etiquetas o layouts en JSON; por otro, advierte de que se trata de una publicación de terceros, sin licencia declarada, sin benchmarks y con cero descargas registradas en el momento de la consulta.

La relevancia práctica depende del caso: si el objetivo es probar el pipeline MOSS-Image con menor huella de VRAM, este paquete permite hacerlo con un único `from_pretrained`; si el objetivo es producción, la ausencia de licencia explícita y de validación comunitaria son factores limitantes que hay que resolver antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (pipeline `diffusers` con `custom_pipeline="pipeline_moss_image"`); componentes denoiser, codificador de texto y VAE. No se detalla en la información disponible el tipo concreto de denoiser (DiT, UNet u otro) |
| Parametros totales | 5.082.308.624 (dato real medido sobre los safetensors del paquete) |
| Longitud de contexto | No disponible. Es un modelo texto-a-imagen; no se especifica el límite de tokens del codificador de texto |
| Tipos de cuantizacion | FP8 weight-only en los tres componentes (denoiser, codificador de texto y VAE). El pipeline original se ejecuta con `torch_dtype={"default": torch.bfloat16, "vae": torch.float32}` |
| Idiomas soportados | No disponible. El ejemplo de la model card genera texto manuscrito en chino dentro de la imagen, pero no se declara una lista de idiomas |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (FP8) |
| Libreria | `diffusers` (>= 0.38), `transformers` >= 5.3, `accelerate` >= 1.10, `safetensors` >= 0.6, `Pillow` >= 10 |
| Tamano del repositorio | 13,9 GB |
| Modelo base | `OpenMOSS-Team/MOSS-Image-SFT`, derivado a su vez de `OpenMOSS-Team/MOSS-Image-Base` |
| Resolución documentada | 1024 × 1024 en el ejemplo de la model card (no se documenta el rango completo) |
| Parametros de inferencia del ejemplo | `num_inference_steps=50`, `guidance_scale=3.0`, `uncond_skip_layers=[22]` |
| Fecha de publicacion | 21 de octubre de 2026 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El paquete se apoya en la arquitectura de MOSS-Image, un pipeline de difusión texto-a-imagen distribuido a través de `diffusers` con un pipeline personalizado (`pipeline_moss_image`) que requiere `trust_remote_code=True`. La model card del paquete cuantizado no describe la arquitectura interna del denoiser ni del codificador de texto; únicamente confirma que se mantienen la misma arquitectura y el mismo pipeline de inferencia que el modelo base, y que el proceso de cuantización afecta a los tres módulos. Cualquier detalle sobre el tipo de bloque, mecanismo de atención o diseño del VAE debe consultarse en el informe técnico de MOSS-Image (arXiv:2610.23374), no en esta ficha.

Respecto al entrenamiento, la información disponible sólo indica que `MOSS-Image-SFT` es un ajuste supervisado (SFT) sobre `MOSS-Image-Base`, y que la comparación cualitativa publicada muestra una mejora del SFT en la agrupación de texto y en la organización de layouts tipo pizarra. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La contribución técnica diferencial de la familia es el control fino de tipografía y disposición de objetos mediante prompts en lenguaje natural, secuencias de etiquetas o layouts en JSON, y el paquete FP8 añade una reducción de huella de memoria a costa de una posible pérdida de fidelidad numérica.

## Capacidades

- Generación de imágenes texto-a-imagen a partir de prompts descriptivos en lenguaje natural.
- Renderizado de texto legible dentro de la imagen, incluido texto manuscrito y en varios alfabetos (el ejemplo oficial genera una nota manuscrita en chino con varias líneas).
- Control de la posición del texto y de la disposición de objetos mediante secuencias de etiquetas (*tags*) y layouts en JSON.
- Composición de escenas con múltiples objetos y relaciones espaciales descritas en el prompt.
- Integración nativa con `diffusers` mediante pipeline personalizado, y soporte documentado para ComfyUI (README específico en el repositorio de GitHub).
- Control de la fidelidad al prompt mediante `guidance_scale`, `num_inference_steps` y `uncond_skip_layers`.
- No soporta *tool calling*, ni *function calling*, ni razonamiento multi-paso, ni modo *thinking*: no es un modelo de lenguaje, sino un generador de imágenes.
- No se documentan capacidades de edición de imagen, *inpainting*, *outpainting*, control por pose o imagen de referencia en la información disponible.

## Casos de uso

- **Cartelería y materiales promocionales con texto integrado**: el modelo puede generar un póster en el que el titular, el subtítulo y el pie aparezcan escritos correctamente dentro de la composición, algo que falla sistemáticamente en generadores de difusión generalistas. Se usaría con un layout JSON para fijar la posición de cada bloque de texto y 50 pasos de muestreo a 1024 × 1024.
- **Prototipado de packaging y etiquetas**: generación de mockups de producto donde la etiqueta debe contener texto legible (ingredientes, marca, instrucciones). El control por etiquetas permite iterar sobre la disposición sin reescribir el prompt completo.
- **Material educativo y pizarras**: creación de infografías, diagramas de pizarra y láminas didácticas con anotaciones manuscritas, aprovechando la ventaja del SFT en organización de layouts tipo whiteboard documentada por el autor.
- **Ilustración editorial y viñetas**: generación de escenas con carteles, rótulos o notas dentro de la ilustración (por ejemplo, un comercio con su letrero), útil para revistas, blogs y contenido editorial que necesita texto coherente en la imagen.
- **Contenido para comercio electrónico**: imágenes de producto en contexto con precios, tallas o avisos renderizados, empleando layouts JSON para mantener una plantilla de composición consistente entre variantes.
- **Investigación en cuantización de modelos de difusión**: el paquete FP8 sirve como punto de comparación frente al checkpoint BF16 para medir el impacto de la cuantización weight-only en métricas de fidelidad tipográfica y calidad perceptual.
- **Pruebas de integración en ComfyUI**: validación de nodos y flujos de trabajo personalizados con MOSS-Image antes de invertir en el modelo completo, dado que el paquete reduce los requisitos de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del paquete cuantizado no incluye métricas cuantitativas (FID, CLIPScore, precisión de OCR sobre texto generado, etc.) ni comparaciones numéricas con el checkpoint original en BF16, por lo que no es posible evaluar la pérdida de calidad introducida por la cuantización FP8.

## Requisitos de hardware

- **VRAM estimada (estimación a partir del recuento de parámetros, no dato oficial)**: los 5,08 mil millones de parámetros en FP8 suponen unos 5,1 GB de pesos; sumando activaciones a 1024 × 1024, el codificador de texto y el VAE, un escenario razonable se sitúa en el rango de 12 a 16 GB de VRAM. Cifra orientativa, no confirmada por el autor.
- **GPU de datacenter**: A100 (40/80 GB), H100, L40S; cualquiera de ellas ejecuta el pipeline con margen amplio.
- **GPU de consumo**: sí cabe. Una RTX 4090 o 5090 (24/32 GB) es el escenario cómodo; en tarjetas de 16 GB puede requerir `enable_model_cpu_offload()` de `accelerate` o cuantización adicional del VAE, algo no documentado por el autor.
- **Requisitos de software**: Python 3.10 o superior, PyTorch 2.9 o superior con build compatible con la versión de CUDA instalada, `diffusers>=0.38`, `transformers>=5.3`, `accelerate>=1.10`, `safetensors>=0.6`, `Pillow>=10`.
- **Opciones de despliegue**: la única ruta documentada es `diffusers` con `custom_pipeline="pipeline_moss_image"` y `trust_remote_code=True`; existe documentación de ComfyUI en el repositorio de GitHub. No hay soporte documentado para vLLM, TGI, llama.cpp u Ollama (herramientas orientadas a modelos de lenguaje, no a este pipeline de difusión).
- **Latencia y throughput**: no disponibles. El ejemplo oficial usa 50 pasos de inferencia con `guidance_scale=3.0`, lo que sitúa la generación típica en decenas de pasos de denoising por imagen, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-SFT-FP8 (este paquete) | 5.082.308.624 | No disponible; 1024 × 1024 en el ejemplo | safetensors FP8 | No disponible | HuggingFace, 0 descargas, autor tercero (Rin247) |
| MOSS-Image-SFT (original) | Misma arquitectura (no se detalla el recuento) | No disponible; mismo pipeline | No detallado en la información | No disponible | HuggingFace y ModelScope, equipo oficial OpenMOSS |
| MOSS-Image-Base | Misma arquitectura (no se detalla el recuento) | No disponible; mismo pipeline | No detallado en la información | No disponible | HuggingFace y ModelScope, equipo oficial OpenMOSS |

Frente a alternativas de la misma categoría (generadores texto-a-imagen con renderizado de texto, como FLUX.1, Qwen-Image o Stable Diffusion 3.5), no se dispone en la información suministrada de datos verificados de parámetros, contexto, licencia ni rendimiento para establecer una comparación numérica fiable. La comparación honesta disponible se limita a la propia familia MOSS-Image: este paquete es una reempaquetado FP8 del SFT oficial, con menor huella de memoria y sin garantías de equivalencia numérica.

## Limitaciones y advertencias

- **Licencia no declarada**: no hay licencia indicada ni en los metadatos ni en la model card. Usar el modelo con fines comerciales sin aclarar antes los términos (tanto del paquete FP8 como del modelo base `OpenMOSS-Team/MOSS-Image-SFT`) es un riesgo legal directo.
- **Publicación de terceros**: el paquete lo publica el usuario Rin247, no el equipo OpenMOSS. No hay garantía de que la conversión FP8 se haya validado contra el original, ni de que se mantenga actualizada.
- **Ejecución de código remoto**: el pipeline requiere `trust_remote_code=True`, lo que implica descargar y ejecutar código Python alojado en el repositorio. En entornos de producción conviene auditar y fijar la revisión del repositorio antes de cargarlo.
- **Ausencia de benchmarks**: no hay métricas que cuantifiquen la degradación introducida por la cuantización FP8 en calidad perceptual ni en precisión del texto renderizado.
- **Sesgos desconocidos**: no se documenta la composición del dataset de entrenamiento de MOSS-Image, por lo que no es posible evaluar sesgos demográficos, culturales o de estilo.
- **Riesgo de alucinación tipográfica**: como todo modelo de difusión, puede generar glifos deformados o texto sin sentido, especialmente con cadenas largas, alfabetos poco representados o resoluciones distintas de las del entrenamiento.
- **Idiomas no declarados**: el único idioma evidenciado en la documentación es el chino del ejemplo; el comportamiento con castellano o con alfabetos latinos con diacríticos no está verificado.
- **Dependencias muy específicas**: requiere versiones mayores de PyTorch, `diffusers` y `transformers` (2.9, 0.38 y 5.3 respectivamente) que pueden entrar en conflicto con otros proyectos del mismo entorno.
- **Sin tracción comunitaria**: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación externa y de soporte ante problemas.
- **Ámbito funcional acotado**: no es un modelo de lenguaje; no ofrece *tool calling*, agentes ni razonamiento, y no se documentan funciones de edición de imagen.

## Enlaces

- Repositorio del paquete FP8: https://huggingface.co/Rin247/MOSS-Image-SFT-FP8
- Modelo base del paquete (SFT oficial): https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelo pre-entrenado de la familia: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- ModelScope MOSS-Image-Base: https://modelscope.cn/models/openmoss/MOSS-Image-Base
- ModelScope MOSS-Image-SFT: https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- Repositorio de código en GitHub: https://github.com/OpenMOSS/MOSS-Image
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- Página del proyecto: https://openmoss.github.io/MOSS-Image/
- Informe técnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- Paper en arXiv: https://arxiv.org/abs/2610.23374
- Guía de usuario: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Guía de usuario en chino: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE_ZH.md
- Documentación de ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- Plataforma de API MOSI: https://platform.mosi.cn/?utm_source=huggingface&utm_medium=readme&utm_campaign=imageapi
- Cuenta de X de OpenMOSS: https://x.com/Open_MOSS
