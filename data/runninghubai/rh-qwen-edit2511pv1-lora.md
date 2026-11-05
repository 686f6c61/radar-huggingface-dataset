# RunningHubAI/rh-qwen-edit2511pv1-lora

## Resumen

`rh-qwen-edit2511pv1-lora` es un adaptador LoRA de edición de imagen publicado por RunningHubAI (autor identificado en la model card como `@Openclaw2026` en RunningHub) y afinado a partir de Qwen-Edit-2511. Su propósito declarado es la modificación de texto dentro de imágenes y el retoque fotográfico con un resultado sin artefactos visibles ("P图改字无痕迹", edición de texto y retoque sin rastro). No es un modelo base autónomo: es un delta de pesos que requiere el modelo Qwen-Edit-2511 subyacente para funcionar.

El repositorio contiene un único fichero de pesos en formato `safetensors` de 563 MiB, etiquetado como LoRA y orientado a los pipelines `image-text-to-image` de ComfyUI y de la plataforma RunningHub. La información pública es muy escasa: no se detallan datos de entrenamiento, hiperparámetros del LoRA (rango, alpha, módulos objetivo), composición del dataset ni evaluaciones cuantitativas.

Su relevancia es acotada y práctica: cubre un caso de uso muy específico (edición tipográfica dentro de imágenes generadas o reales) dentro del ecosistema de Qwen-Image-Edit, y se distribuye en un formato directamente consumible por ComfyUI, lo que facilita su prueba sin infraestructura adicional. No obstante, la ausencia de licencia explícita, de idiomas declarados y de benchmarks limita seriamente su adopción en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Qwen-Edit-2511; arquitectura del modelo base no disponible en la informacion proporcionada |
| Parametros totales | no disponible (pesos del adaptador: 563 MiB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; la cuantizacion depende del modelo base y del loader) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`Qwen Edit2511P图改字无痕迹v1.safetensors`, 563 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango inyectadas en las capas del modelo base Qwen-Edit-2511 para especializarlo en edición de imagen condicionada por texto. La model card no especifica el rango, el alpha, los módulos objetivo (atención, MLP o proyecciones de imagen), ni si se aplicó algún tipo de regularización o merging posterior. Tampoco se documenta la arquitectura interna del modelo base más allá de su nombre y de su pertenencia a la familia Qwen-Edit.

No hay información sobre el volumen de datos de entrenamiento, la composición del dataset (pares imagen-máscara-instrucción, imágenes sintéticas, pares antes/después de edición tipográfica), el uso de RLHF/DPO ni las condiciones de cómputo. La única indicación funcional es que el entrenamiento se orientó a la modificación de texto en imágenes con preservación del entorno, lo que sugiere un dataset centrado en regiones tipográficas y en la reconstrucción coherente del fondo.

## Capacidades

- Edición de imagen guiada por texto e imagen de entrada (pipeline `image-text-to-image`): el adaptador modifica el contenido de una imagen existente siguiendo una instrucción.
- Sustitución y modificación de texto dentro de imágenes, con el objetivo declarado de evitar transiciones visibles entre el texto editado y el fondo original.
- Retoque fotográfico ("P图") sobre regiones localizadas, presumiblemente mediante máscaras o instrucciones de región.
- Integración nativa en flujos de ComfyUI como nodo de carga de LoRA sobre el modelo base Qwen-Edit-2511.
- Ejecución en la plataforma RunningHub, tanto vía interfaz como vía API.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, audio, vídeo ni modo de pensamiento; el modelo es exclusivamente de edición de imagen.
- Cobertura multilingüe de las instrucciones de edición: no disponible.

## Casos de uso

- Localización de creatividades publicitarias: sustituir el texto de un banner o cartel por su versión en otro idioma manteniendo tipografía, perspectiva y textura del soporte, usando el LoRA sobre Qwen-Edit-2511 en un grafo de ComfyUI con máscara sobre la región de texto.
- Corrección de erratas en material impreso digitalizado: cargar la imagen, delimitar la zona del error y aplicar una instrucción de reemplazo, aprovechando el objetivo de "sin rastro" para que la corrección no sea detectable visualmente.
- Prototipado rápido de variantes de packaging: generar múltiples versiones de una etiqueta con distintos nombres de producto o reclamos, manteniendo la coherencia del resto del envase, en un pipeline por lotes.
- Actualización de precios y promociones en catálogos de e-commerce: modificar cifras y vigencias sobre imágenes de producto ya publicadas sin rehacer la sesión fotográfica.
- Edición de material editorial y prensa: ajustar titulares o pies de foto en maquetas y capturas para revisiones internas, con la ventaja de que el adaptador está entrenado específicamente para preservar el entorno tipográfico.
- Automatización vía API de RunningHub: integrar la edición de texto en un servicio backend que reciba una imagen y una instrucción y devuelva la versión editada, útil para flujos de aprobación de creatividades.
- Pruebas de concepto en investigación sobre edición de imagen: usar el LoRA como referencia de especialización de bajo coste (563 MiB) sobre Qwen-Edit-2511 para experimentos de edición localizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FID, CLIP-Score, SSIM en región editada, exactitud de OCR tras la edición) ni comparaciones con otros adaptadores de edición de texto en imagen.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador por separado; el consumo vendrá determinado por el modelo base Qwen-Edit-2511 y por la precisión de carga (fp16, bf16, fp8). El LoRA añade 563 MiB de pesos, un incremento marginal.
- GPU recomendadas: no disponible en la información proporcionada. Para modelos de edición de imagen de la familia Qwen-Image se suele requerir VRAM de gama alta (A100, H100, L40S) o GPUs de consumo con 16-24 GB en cuantizaciones agresivas, pero este dato no está confirmado para este artefacto.
- Cabeza en GPU de consumo: no confirmado; depende enteramente del modelo base.
- Opciones de despliegue: ComfyUI (soporte nativo declarado), plataforma RunningHub (UI y API). Otros runners (Diffusers, vLLM, TGI, llama.cpp, Ollama) no están documentados para este LoRA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-qwen-edit2511pv1-lora | LoRA de edición de imagen sobre Qwen-Edit-2511 | no disponible (adaptador de 563 MiB) | no disponible | no disponible | Hugging Face, RunningHub |
| Qwen-Edit-2511 (modelo base) | Modelo de edición de imagen | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Repositorio upstream de Qwen |
| Otros LoRA de edición de texto en imagen | LoRA | no disponible | no disponible | variable | no disponible |

No se dispone de datos verificables de otros adaptadores comparables en la información proporcionada; la comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- Licencia no declarada: la model card solo indica que se debe seguir la licencia del proyecto original o upstream. Esto impide confirmar si el uso comercial está permitido; es un bloqueante para producción.
- Dependencia total del modelo base Qwen-Edit-2511: el LoRA no es funcional por sí solo y hereda todas las limitaciones, sesgos y restricciones de licencia del modelo subyacente.
- Ausencia de benchmarks: no hay evidencia cuantitativa de la calidad de la edición ni de la preservación del fondo; el claim de "sin rastro" es una afirmación del autor no verificada de forma independiente.
- Riesgo de artefactos en tipografías complejas: sin datos de evaluación, no se puede descartar degradación en fuentes ornamentales, texto muy pequeño, perspectivas pronunciadas o fondos con textura irregular.
- Idiomas no declarados: se desconoce si el adaptador funciona igual de bien con texto latino, cirílico, árabe o CJK; la model card está redactada en chino e inglés, lo que sugiere un sesgo hacia esos mercados.
- Sin información sobre sesgos: no se documenta ningún análisis de sesgo demográfico, cultural o de contenido.
- Riesgo de uso indebido: la capacidad de modificar texto en imágenes sin dejar rastro facilita la falsificación de documentos, capturas y material publicitario; requiere controles de procedencia y trazabilidad en cualquier despliegue.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública que permitan validar su comportamiento.
- Fecha de creación futura (2026-11-05) en los metadatos de Hugging Face: conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-qwen-edit2511pv1-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2056650087543173121
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/2025581316556464129
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
