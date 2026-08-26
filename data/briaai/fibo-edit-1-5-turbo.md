# briaai/Fibo-Edit-1.5-turbo

## Resumen

FIBO-Edit 1.5 Turbo es un modelo de edición de imágenes desarrollado por BRIA AI, diseñado para ofrecer un control preciso, determinista y legalmente seguro sobre las ediciones realizadas a partir de instrucciones en lenguaje natural. A diferencia de otros modelos de edición que dependen de prompts ambiguos, FIBO-Edit integra un pipeline de generación de prompts estructurados en JSON que permite descomponer la instrucción del usuario en acciones, regiones y parámetros concretos, lo que elimina sorpresas y facilita la reproducibilidad de los resultados.

El modelo se basa en una arquitectura de difusión, con un total de 8.285.836.848 parámetros, y se distribuye como un fine-tuning del modelo base `briaai/Fibo-Edit-1.5-base`. Está diseñado para funcionar con la librería `diffusers` y su pipeline específico `BriaFiboEditPipeline`. Su acceso es restringido en Hugging Face, lo que implica que los usuarios deben aceptar las condiciones de licencia antes de poder descargarlo. La relevancia actual radica en que aborda uno de los principales problemas de la edición de imagen generativa: la falta de control fino y la variabilidad de los resultados, ofreciendo una alternativa orientada a la producción con un enfoque en la seguridad legal (uso de datos con licencia) y la transparencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (no se especifica el tipo exacto; probablemente DiT o UNet) |
| Parametros totales | 8.285.836.848 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No aplicable (modelo de imagen, aunque procesa texto estructurado en JSON) |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors, sin cuantizaciones oficiales) |
| Idiomas soportados | Inglés (según la ficha de HuggingFace) |
| Licencia | Licencia propia `bria-fibo-edit-1.5-turbo` (acceso restringido) |
| Formato de pesos | Safetensors (tamaño del repo: 25.6 GB) |

## Arquitectura y entrenamiento

FIBO-Edit 1.5 Turbo se basa en un modelo de difusión para la edición de imágenes, aunque la documentación disponible no detalla la arquitectura interna (si es un UNet, un DiT o una variante híbrida). El pipeline completo incluye un componente adicional: un VLM (modelo de lenguaje y visión) local llamado `briaai/FIBO-edit-prompt-to-JSON` que convierte las instrucciones en lenguaje natural a un formato JSON estructurado. Este JSON contiene la información necesaria para ejecutar la edición de manera determinista, incluyendo máscaras, áreas de interés y acciones concretas. El modelo principal, `Fibo-Edit-1.5-turbo`, es un fine-tune del modelo base `Fibo-Edit-1.5-base`, optimizado para una inferencia más rápida (el sufijo "turbo" sugiere una versión destilada o acelerada, aunque no se especifica el proceso de destilación). No se han publicado detalles sobre los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF o DPO. La innovación clave reside en el control estructurado mediante JSON, que permite a los desarrolladores reproducir ediciones idénticas y evitar la ambigüedad inherente a los prompts libres.

## Capacidades

- Edición de imágenes guiada por instrucciones en lenguaje natural, con descomposición automática de la instrucción en acciones concretas.
- Soporte para edición con múltiples referencias (multi-reference), es decir, se pueden utilizar varias imágenes de referencia para guiar la edición.
- Capacidad de inpainting: relleno o modificación de regiones específicas de una imagen según las indicaciones.
- Control determinista: la generación de JSON estructurado permite obtener resultados reproducibles y predecibles, reduciendo la variabilidad entre ejecuciones.
- Integración con la librería `diffusers` mediante el pipeline `BriaFiboEditPipeline`, facilitando su uso en entornos Python.
- Compatibilidad con un VLM auxiliar para la conversión de prompts a JSON, que se puede ejecutar localmente (aunque la versión local no soporta edición basada en máscaras).
- Enfoque en la seguridad legal: el modelo se entrena con datos licenciados, lo que reduce riesgos de uso comercial.

## Casos de uso

- Edición de imágenes para contenido publicitario: un equipo de marketing puede generar variaciones de una imagen de producto con cambios precisos (color, fondo, posición) usando instrucciones en lenguaje natural, con resultados consistentes y sin retoques manuales.
- Automatización de flujos de diseño gráfico: diseñadores pueden integrar el modelo en pipelines de automatización para generar múltiples versiones de una imagen base, aplicando cambios de estilo o composición de forma repetible.
- Modificación de fotografías en plataformas de e-commerce: el modelo permite ajustar imágenes de productos (eliminar fondo, cambiar iluminación, añadir objetos) mediante prompts estructurados, manteniendo la coherencia visual.
- Restauración y edición de imágenes históricas: con la capacidad de inpainting, se pueden rellenar áreas dañadas o eliminar elementos no deseados de fotografías antiguas.
- Generación de variantes para pruebas A/B en marketing: los equipos pueden crear múltiples versiones de un anuncio visual variando solo ciertos elementos, gracias al control determinista.
- Desarrollo de herramientas de edición personalizadas: los desarrolladores pueden integrar el modelo en sus propias aplicaciones de edición, aprovechando la generación de JSON para ofrecer a los usuarios un control granular sin necesidad de conocimientos técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La página de HuggingFace menciona que el modelo se encuentra "entre los mejores modelos en benchmarks abiertos de adherencia al prompt y calidad", pero no se proporcionan métricas numéricas (como FID, LPIPS, o comparaciones con otros modelos). Por lo tanto, no es posible presentar una tabla comparativa con datos reales.

## Requisitos de hardware

- VRAM estimada: para un modelo de 8.8B parámetros en precisión fp16, se recomienda al menos 16-20 GB de VRAM para inferencia. Con el tamaño del repo de 25.6 GB (pesos en safetensors), es probable que se necesite una GPU con 24 GB o más para cargar el modelo completo en memoria.
- GPU recomendadas: NVIDIA A100 (40 GB), RTX 4090 (24 GB), o GPUs profesionales como la RTX A6000. Para pruebas locales, una RTX 3090 o 4090 puede ser suficiente si se usa batch pequeño y cuantización (aunque no hay cuantizaciones oficiales).
- En consumer GPU: sí, es posible ejecutarlo en una RTX 4090 o similar con suficiente VRAM, pero no en GPUs de gama baja.
- Opciones de despliegue: al ser un modelo de `diffusers`, se puede ejecutar con la librería `diffusers` en Python, o mediante servicios de inferencia como Hugging Face Inference Endpoints o plataformas de cloud (AWS, GCP). No hay soporte nativo para llama.cpp o vLLM, ya que es un modelo de difusión, no un LLM.
- Latencia y throughput: no se han proporcionado datos oficiales. La versión "turbo" sugiere una inferencia acelerada, pero sin números no se puede estimar.

## Comparativa con modelos similares

No hay suficiente información pública para realizar una comparativa cuantitativa con modelos similares como InstructPix2Pix, FLUX.1 Redux o modelos de edición de imagen de código abierto (por ejemplo, `instruct-pix2pix`). La ausencia de benchmarks publicados impide una comparación objetiva. Se puede mencionar que FIBO-Edit 1.5 Turbo se diferencia por su enfoque en control estructurado mediante JSON, mientras que otros modelos suelen depender de prompts libres. Sin embargo, los datos de rendimiento específicos no están disponibles.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en HuggingFace, por lo que es necesario solicitar acceso y aceptar las condiciones de licencia antes de su uso.
- Licencia propia: la licencia `bria-fibo-edit-1.5-turbo` no es una licencia open source estándar (no es Apache-2.0 ni MIT). Aunque se puede acceder, hay restricciones comerciales específicas que deben revisarse.
- Soporte de idiomas limitado: el modelo está entrenado principalmente en inglés, por lo que el rendimiento con prompts en otros idiomas puede degradarse.
- Dependencia del VLM auxiliar: para obtener el JSON estructurado, se necesita el VLM `briaai/FIBO-edit-prompt-to-JSON`, que debe ejecutarse localmente o en la nube. La versión local no soporta edición basada en máscaras, lo que limita ciertos casos de uso.
- Riesgo de alucinación visual: como cualquier modelo de difusión, puede generar detalles no deseados o artefactos en las imágenes editadas, especialmente con instrucciones ambiguas o complejas.
- Sesgos potenciales: al entrenarse con imágenes licenciadas, puede heredar sesgos en la representación de personas, objetos o escenarios. No se han publicado evaluaciones de sesgo.
- Requisitos de hardware elevados: el tamaño del modelo (25.6 GB) limita su despliegue en entornos con recursos limitados, y no hay cuantizaciones oficiales para reducir el uso de memoria.

## Enlaces

- HuggingFace: https://huggingface.co/briaai/Fibo-Edit-1.5-turbo
- Repositorio de GitHub: https://github.com/Bria-AI/Fibo-Edit
- Página del producto: https://bria.ai/fibo-edit
- Paper en arXiv: https://arxiv.org/abs/2511.06876
