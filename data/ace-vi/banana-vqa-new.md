# Ace-VI/banana-vqa-new

## Resumen

`Ace-VI/banana-vqa-new` es un adaptador LoRA (PEFT) publicado en Hugging Face sobre el modelo base `Salesforce/blip-vqa-base`, un modelo de respuesta visual a preguntas (VQA, *Visual Question Answering*) desarrollado por Salesforce Research. El adaptador no es un modelo autónomo: requiere cargar el checkpoint de BLIP-VQA-base y superponer los pesos LoRA para funcionar. El nombre sugiere un ajuste orientado a preguntas sobre imágenes de plátanos (*banana*), aunque la model card no documenta la tarea, el dataset ni el procedimiento de entrenamiento.

El interés práctico del artefacto es doble: por un lado, ejemplifica el flujo habitual de *fine-tuning* ligero de modelos visión-lenguaje pequeños con recursos limitados; por otro, BLIP-VQA-base es una arquitectura compacta (ViT-B/16 más un transformer de texto de escala BERT) que puede ejecutarse en GPU de consumo e incluso en CPU, lo que la hace atractiva para demos y prototipos de inspección visual en dominios verticales.

La información publicada es mínima: la model card es la plantilla por defecto de Hugging Face sin rellenar, no se declara licencia, idiomas, pipeline ni resultados de evaluación, y el repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta. Cualquier dato de rendimiento o de composición del dataset debe considerarse no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre BLIP-VQA-base: codificador visual ViT-B/16 + transformer de texto tipo BERT con decodificador y atención cruzada (arquitectura multimodal *encoder-decoder*) |
| Parámetros totales | No disponible para el adaptador. El modelo base BLIP-VQA-base se sitúa en el orden de 385 M de parámetros según la model card original de BLIP (dato no verificado en esta ficha) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. En VQA con BLIP la entrada es una imagen más una pregunta corta y la salida es una respuesta breve; no es un modelo para contextos largos |
| Tipos de cuantización | No disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | No disponible. El modelo base BLIP se entrena mayoritariamente con datos en inglés (VQA v2.0, COCO, Visual Genome), por lo que el soporte real de otros idiomas es dudoso |
| Licencia | No disponible. La model card no declara licencia; la del adaptador debe verificarse contra la del modelo base antes de cualquier uso comercial |
| Formato de pesos | `safetensors` (adaptador PEFT/LoRA); requiere el checkpoint del modelo base en formato `transformers` |

## Arquitectura y entrenamiento

El adaptador se apoya en BLIP (*Bootstrapping Language-Image Pre-training*), una arquitectura multimodal que combina un codificador visual ViT-B/16 con un transformer de texto que actúa como codificador bidireccional y como decodificador con atención cruzada hacia la imagen. En la variante VQA, el modelo recibe la imagen y la pregunta y genera la respuesta token a token con el decodificador. El adaptador en sí es un conjunto de matrices de bajo rango (LoRA) inyectadas en las capas del transformer de texto, según los tags del repositorio (`peft`, `lora`, `transformers`); el repositorio ocupa 0.0 GB, lo que es coherente con un adaptador de pocos megabytes.

No hay información sobre el dataset de ajuste, el número de pasos, la tasa de aprendizaje, el rango de LoRA ni la precisión usada en el entrenamiento: la model card deja todos esos campos como `[More Information Needed]`. Tampoco se documenta si hubo RLHF, DPO o cualquier etapa de alineación (en un modelo VQA de este tamaño ese tipo de etapas no es habitual). La única referencia técnica explícita en la model card es la cita a Lacoste et al. (2019) para el cálculo de emisiones de carbono, que forma parte de la plantilla estándar y no aporta información sobre el entrenamiento real. La versión de PEFT declarada por el autor es 0.21.2.

## Capacidades

- Respuesta visual a preguntas (VQA): dada una imagen y una pregunta en lenguaje natural, genera una respuesta corta. Es la única capacidad que se deduce con certeza del modelo base.
- Comprensión de imagen a nivel de escena y de objeto, heredada del codificador ViT-B/16 preentrenado por BLIP.
- Generación de texto condicionada a imagen, limitada a respuestas breves (la cabeza VQA de BLIP no está pensada para párrafos largos).
- *Fine-tuning* ligero: al ser un adaptador LoRA, se puede combinar con otras variantes o sustituir sin tocar los pesos base.
- Soporte de *tool calling* / *function calling*: no disponible (no es una capacidad de BLIP).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no declaradas; el modelo base está entrenado principalmente en inglés.
- Modo *thinking*, visión de documentos, audio o vídeo: no disponible.

## Casos de uso

- Inspección de calidad en línea de envasado de plátano: el adaptador respondería a preguntas del tipo «¿presenta manchas oscuras?» o «¿está en el punto de maduración 4?» sobre una foto de la fruta tomada por una cámara industrial. Es adecuado por el coste de inferencia bajo de BLIP-VQA-base, que permite evaluar cada pieza en milisegundos dentro de un *pipeline* de visión.
- Asistente de campo para agricultores: una app móvil envía la foto y una pregunta en lenguaje natural y recibe una respuesta corta. El tamaño reducido del modelo permite desplegarlo en servidores modestos o incluso en el dispositivo con cuantización, algo que modelos VQA de miles de millones de parámetros no permiten.
- Pre-etiquetado de datasets agrícolas: usar el adaptador para generar respuestas candidatas sobre un lote de imágenes y revisarlas manualmente, reduciendo el coste de anotación frente al etiquetado desde cero. Útil porque el modelo es lo bastante pequeño como para procesar miles de imágenes en una sola GPU.
- Control de inventario y maduración en almacén: consultas periódicas sobre imágenes de cámara fija para clasificar lotes por estado y priorizar su salida. La naturaleza de pregunta-respuesta permite adaptar la consulta sin reentrenar.
- Verificación en mercados o *marketplaces* de producto fresco: responder a preguntas del comprador («¿el plátano de la foto está verde?») a partir de la imagen del anuncio, como filtro previo a la revisión humana.
- Docencia y reproducción de *fine-tuning* PEFT: el repositorio sirve como ejemplo práctico de cómo adaptar un modelo visión-lenguaje pequeño con LoRA, comparando el adaptador contra el modelo base en un conjunto de validación propio.
- Investigación sobre sesgos en VQA: al ser un ajuste sobre un dominio muy concreto, permite estudiar cómo el *fine-tuning* estrecho degrada el rendimiento en preguntas generales (olvido catastrófico) y cómo se comporta el modelo ante imágenes fuera de distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de VQA (accuracy sobre VQA v2.0 u otros conjuntos), ni comparaciones con el modelo base, ni evaluación cualitativa de ejemplo. No se debe asumir que el adaptador iguala o mejora al `Salesforce/blip-vqa-base` original sin una evaluación propia.

## Requisitos de hardware

- VRAM estimada: no disponible como cifra publicada. Como referencia de orden de magnitud, un modelo de ~385 M de parámetros ocupa aproximadamente 1,5 GB en fp32 y 0,8 GB en fp16, a lo que se suma el adaptador LoRA (unos pocos MB) y el *overhead* de activaciones al procesar una imagen (ViT-B/16 a 384×384).
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4090, A100, H100) es suficiente y sobra capacidad; el modelo no requiere GPU de centro de datos.
- GPU de consumo: sí, cabe holgadamente en tarjetas de 6-8 GB e incluso en iGPU con suficiente memoria compartida si se acepta mayor latencia.
- CPU: viable para inferencia puntual; se espera latencia de segundos por imagen, no apta para tiempo real.
- Opciones de despliegue: `transformers` + `peft` (ruta natural, indicada por la librería del repositorio), exportación a ONNX con Optimum, o servidores de inferencia genéricos (Triton, TorchServe, Hugging Face Inference Endpoints). No hay soporte en vLLM para esta arquitectura, y no existen pesos GGUF ni adaptación a llama.cpp/Ollama, por lo que esas vías no son aplicables directamente.
- Latencia y throughput: no disponibles; no hay cifras publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Ace-VI/banana-vqa-new` (este) | Adaptador LoRA, tamaño no disponible (modelo base ~385 M) | Imagen + pregunta corta | VQA de dominio específico (probablemente plátano) | No disponible | Hugging Face, 0 descargas; requiere el modelo base |
| `Salesforce/blip-vqa-base` | ~385 M (dato de la model card de BLIP, no verificado aquí) | Imagen + pregunta corta | VQA general | No confirmada en esta ficha | Hugging Face, ampliamente utilizado |
| BLIP-2 (variantes OPT-2.7B / Flan-T5-XL) | ~3,4 B en las variantes pequeñas | Imagen + texto; respuestas más largas | VQA y *captioning* zero-shot | No confirmada en esta ficha | Hugging Face |
| LLaVA-1.5-7B | ~7 B | Imagen + conversación multi-turno | VQA conversacional, instrucciones visuales | No confirmada en esta ficha (habitualmente LLaMA, con restricciones) | Hugging Face |

La comparación relevante es contra el propio modelo base: cualquier mejora en el dominio del plátano debe demostrarse empíricamente, y el precio habitual del ajuste LoRA estrecho es la pérdida de generalidad en preguntas fuera de dominio.

## Limitaciones y advertencias

- Model card vacía: no se documentan datos de entrenamiento, hiperparámetros, evaluación ni uso previsto; no hay base para afirmar qué sabe hacer el adaptador más allá del nombre del repositorio.
- Licencia no declarada: la ausencia de licencia explícita impide asumir permiso de uso comercial. Además, la licencia del adaptador no puede ser más permisiva que la del modelo base, que debe consultarse por separado.
- Riesgo de alucinación: los modelos VQA de este tamaño generan respuestas plausibles pero incorrectas, especialmente ante imágenes ambiguas, oclusiones o preguntas que presuponen un objeto que no está en la imagen.
- Sesgos del modelo base: BLIP se entrena con VQA v2.0, COCO y Visual Genome, conjuntos con sesgos de vocabulario y de distribución (respuestas frecuentes como «sí», «dos», «blanco»). Estos sesgos se heredan y pueden agravarse tras un ajuste estrecho.
- Olvido catastrófico: un ajuste LoRA sobre un dominio muy concreto (plátanos) puede degradar el rendimiento en preguntas generales; conviene medirlo antes de reutilizar el adaptador fuera de su dominio.
- Idioma: no se declara soporte de español; el modelo base está orientado al inglés, por lo que las preguntas en castellano pueden degradar la calidad de forma no documentada.
- Longitud: no es un modelo conversacional ni de contexto largo; no mantiene diálogos multi-turno ni procesa documentos extensos.
- Trazabilidad y mantenimiento: repositorio sin descargas ni documentación, creado y actualizado el mismo día (28 de octubre de 2026), sin garantía de continuidad.
- Reproducibilidad: al no fijarse la versión de `transformers` ni el dataset, no es posible reproducir el ajuste a partir de la información publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ace-VI/banana-vqa-new
- Modelo base: https://huggingface.co/Salesforce/blip-vqa-base
- Repositorio de BLIP (Salesforce Research, LAVIS): https://github.com/salesforce/LAVIS
- Paper de BLIP (referencia del modelo base): https://arxiv.org/abs/2201.12086
- Referencia citada en la model card (cálculo de impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML: https://mlco2.github.io/impact
- Documentación de PEFT: https://huggingface.co/docs/peft
