# guymorlan/levanti_arabic2diacritics

## Resumen

Levanti Arabic2Diacritics es un modelo de etiquetado de tokens (token classification) especializado en la vocalización (tashkeel) de árabe coloquial palestino. Lo desarrolla Guy Mor-Lan (guymorlan) y se distribuye con licencia CC BY-SA 4.0. El modelo resuelve un problema concreto: el texto árabe escrito informalmente carece de diacríticos, lo que dificulta su lectura y su procesamiento posterior; este modelo reconstruye las vocales breves (fatha, kasra, damma, sukun) y la shadda letra a letra.

Arquitectura y tamaño: se trata de un transformer encoder de tipo RoBERTa con 87.458.309 parámetros, afinado a partir del encoder a nivel de carácter TavBERT-ar. La tarea se formula como clasificación multi-etiqueta por token (cada letra puede recibir varias marcas simultáneamente, por ejemplo shadda más fatha), con una ventana de contexto heredada del encoder base y pesos en formato safetensors.

Su relevancia actual es acotada pero específica: cubre una variante dialectal (levanti/palestino) poco atendida por los modelos de vocalización entrenados sobre árabe clásico, y se integra en una cadena de procesamiento junto al transliterador Levanti Diacritics2Translit del mismo autor. Es un modelo pequeño, entrenado con datos propios y con muy poca adopción pública (57 descargas, 2 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (TavBERT-ar), cabeza de clasificación de tokens multi-etiqueta |
| Parametros totales | 87.458.309 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del encoder TavBERT-ar; no declarada en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | árabe (ar), específicamente dialecto coloquial palestino |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (repo de 1,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de TavBERT-ar, un encoder a nivel de carácter, y le añade una cabeza de clasificación de tokens con seis categorías positivas independientes: shadda, fatha, kasra, damma y sukun (la sexta categoría corresponde a la ausencia de marca). El uso de clasificación multi-etiqueta con activación sigmoide y umbral 0,5 se justifica porque la shadda puede coexistir con otras vocales sobre la misma letra, algo que un softmax excluyente no permitiría.

El entrenamiento se realizó en dos fases: primero, preentrenamiento de TavBERT-ar sobre el corpus Tashkeela de árabe clásico vocalizado (eliminando los diacríticos finales del texto), y después un ajuste adicional de 8 épocas sobre el subconjunto vocalizado del dataset Levanti, propio del autor y aún no publicado en el momento de la consulta. No se documentan en la información disponible detalles sobre número total de tokens de entrenamiento, composición exacta del dataset, ni uso de RLHF/DPO (no aplicable a una tarea de etiquetado supervisado).

## Capacidades

- Vocalización automática de texto árabe coloquial palestino a nivel de carácter, letra a letra.
- Predicción multi-etiqueta: permite combinar shadda con fatha, kasra o damma sobre la misma letra.
- Salida alineada con el texto de entrada, lo que facilita la reconstrucción del texto vocalizado preservando el orden original.
- Integración con el transliterador Levanti Diacritics2Translit para encadenar vocalización y transliteración.
- Compatible con la librería transformers (RobertaForTokenClassification y AutoTokenizer).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking: es un modelo puramente discriminativo de etiquetado.
- Capacidad multilingüe: únicamente árabe (y, dentro de este, orientado al dialecto palestino).

## Casos de uso

- Vocalización de subtítulos y transcripciones de árabe palestino: el modelo añade los diacríticos a transcripciones sin vocales, lo que mejora la legibilidad para lectores no nativos y para herramientas de texto a voz que necesitan la vocalización para una pronunciación correcta.
- Preprocesado para pipelines de transliteración: al combinarse con Levanti Diacritics2Translit, permite convertir texto coloquial árabe en una representación latina vocalizada, útil en sistemas de transliteración y en la enseñanza del dialecto.
- Enriquecimiento de corpus dialectales: se puede aplicar por lotes sobre grandes volúmenes de texto palestino sin vocalizar para generar corpus anotados que sirvan de base a posteriores modelos de dialecto.
- Herramientas de aprendizaje de árabe coloquial: la salida vocalizada sirve como apoyo didáctico para estudiantes que necesitan ver la pronunciación exacta de cada palabra.
- Normalización lingüística en motores de búsqueda o recuperación: la vocalización explícita puede reducir ambigüedades léxicas en la indexación de texto dialectal, donde la ausencia de vocales genera homógrafos.
- Investigación en procesamiento de dialectos: al ser uno de los pocos modelos públicos centrados en vocalización de árabe palestino, resulta útil como línea base en experimentos de tashkeel dialectal frente a modelos entrenados solo con árabe clásico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,4-0,7 GB en fp32 para los 87,5 M de parámetros, más el overhead de activaciones y tokenizador; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para volúmenes moderados. Para procesamiento por lotes de grandes corpus, cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3060, T4) es suficiente.
- Cabe en GPU consumer: sí, en cualquier modelo actual, incluidos portátiles con GPU integrada.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; también es compatible con endpoints de Hugging Face y con despliegue en Azure según los tags del repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son motores orientados a generación, no a este tipo de clasificación).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| guymorlan/levanti_arabic2diacritics | 87,5 M | Vocalización multi-etiqueta de árabe palestino | Árabe (dialecto palestino) | CC BY-SA 4.0 | Hugging Face |
| guymorlan/levanti_diacritics2translit | no disponible | Transliteración de árabe vocalizado | Árabe (dialecto palestino) | no disponible | Hugging Face |
| tau/tavbert-ar | no disponible | Encoder a nivel de carácter (modelo base) | Árabe | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Sesgos dialectales: el modelo está entrenado sobre un subconjunto del dataset Levanti, centrado en árabe coloquial palestino; su comportamiento sobre otros dialectos o sobre árabe estándar moderno no está documentado y probablemente degrade.
- Riesgo de error en la vocalización: al ser un clasificador por carácter con umbral fijo de 0,5, puede producir vocalizaciones incorrectas en palabras ambiguas u homógrafas, sin mecanismo de corrección contextual explícito.
- Datos de entrenamiento no publicados: el subconjunto vocalizado del dataset Levanti no estaba disponible en el momento de la consulta, lo que dificulta la reproducibilidad y la auditoría del entrenamiento.
- Limitaciones de contexto: la longitud máxima de entrada no está declarada en la model card; entradas largas pueden truncarse según la configuración del tokenizador del encoder base.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios que no quieran liberar sus adaptaciones.
- Advertencia para producción: con 57 descargas y 2 likes, el modelo tiene una adopción muy baja y no hay evidencia pública de validación externa; conviene evaluarlo sobre un conjunto propio antes de integrarlo en un sistema en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guymorlan/levanti_arabic2diacritics
- Transliterador complementario: https://huggingface.co/guymorlan/levanti_diacritics2translit/
- Modelo base TavBERT-ar: https://huggingface.co/tau/tavbert-ar
- Dataset Levanti: https://huggingface.co/datasets/guymorlan/levanti
- Dataset Tashkeela: https://huggingface.co/datasets/community-datasets/tashkeela
