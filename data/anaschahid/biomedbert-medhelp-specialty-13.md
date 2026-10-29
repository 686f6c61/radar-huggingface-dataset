# anaschahid/biomedbert-medhelp-specialty-13

## Resumen

`anaschahid/biomedbert-medhelp-specialty-13` es un clasificador de texto biomédico en inglés que asigna una publicación de salud escrita por pacientes a una de 13 especialidades médicas (Cardiología, Odontología, Dermatología, Endocrinología, Gastroenterología, Enfermedades Infecciosas, Nefrología, Neurología, Oftalmología, Ortopedia, Otorrinolaringología, Neumología y Urología). Lo desarrolla Anas Chahid y coautores como artefacto congelado del manuscrito *"Better questions or just more text? Exposure-matched evaluation of follow-up questioning and retrieval for medical specialty classification"* (Chahid et al., en revisión, 2026). Se construye por fine-tuning del backbone `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext` sobre 94.158 publicaciones en inglés recogidas de páginas públicas de MedHelp.

Arquitectónicamente es un transformer encoder BERT base (uncased) con 109.492.237 parámetros totales, incluida la cabeza lineal de clasificación de 13 clases, y una ventana posicional máxima de 512 tokens. El repositorio ocupa 0,4 GB, los pesos están en `safetensors` y la licencia es MIT. El modelo está entrenado con texto al que se le eliminaron previamente todos los dígitos, de modo que nunca ha visto edades, dosis, valores de laboratorio ni duraciones numéricas.

Su relevancia es metodológica más que de producto: sirve como línea base reproducible para medir cuánto aporta el texto adicional frente a preguntas de seguimiento en la asignación de especialidad, con métricas de validación (accuracy 89,25 %, macro-F1 87,56 %) y un cohorte held-out balanceado congelado antes de la evaluación. La model card lo declara explícitamente de uso exclusivamente investigador y advierte de que no es un dispositivo médico ni está validado para triaje o derivación clínica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (uncased) con cabeza lineal de clasificación supervisada de 13 clases |
| Parámetros totales | 109.492.237 (incluida la cabeza de clasificación) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite posicional de BERT); truncado a `max_length=512` en entrenamiento e inferencia |
| Tipos de cuantización | no disponible (no se publican versiones cuantizadas; pesos almacenados en FP32, entrenamiento con autocast BF16) |
| Idiomas soportados | inglés (`en`) únicamente |
| Licencia | MIT |
| Formato de pesos | `safetensors` |

Otros datos: pipeline `text-classification`, librería `transformers`, tamaño del repo 0,4 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-10-28. SHA-256 de `model.safetensors`: `e3be72d35d9be87b985eace2aa97e9fedaeb145528571da6612fe807c79f83e0`.

## Arquitectura y entrenamiento

El modelo parte de `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext`, un BERT base preentrenado con enmascarado de lenguaje sobre resúmenes y texto completo de PubMed, y se ajusta con una cabeza de clasificación de 13 salidas sobre publicaciones de foros de salud. El preprocesado aplicado a los datos incluye el borrado previo de todos los numerales, el enmascarado de URL y direcciones de correo, y la eliminación de duplicados (incluidos los duplicados con etiqueta en conflicto). Las etiquetas del export principal proceden de un mapeo determinista de la categoría de foro en la que se publicó el mensaje; un export adicional pequeño (564 registros, 0,6 %) lleva especialidades asignadas por clínicos.

Los datos procesados son 94.158 registros, divididos mediante un *group split* estratificado de diez particiones con semilla, manteniendo en el mismo grupo las publicaciones que comparten sus primeros 25 tokens normalizados: 75.325 de entrenamiento, 9.416 de validación y 9.417 de test, sin que ningún grupo, texto exacto ni ID cruce entre particiones. El entrenamiento fue de 3 épocas (14.124 actualizaciones del optimizador), batch 8 con acumulación de gradiente 2 (efectivo 16), tasa de aprendizaje 5e-6 con AdamW, weight decay 0,01, 200 pasos de warm-up y decaimiento coseno, pérdida de entropía cruzada sin pesos de clase, sin aumento de datos, precisión BF16 con pesos almacenados en FP32, longitud máxima 512, semilla 42 y una NVIDIA RTX 5090 con PyTorch 2.11.0+cu128 y Transformers 4.57.6. La selección del checkpoint se hizo por mejor macro-F1 de validación (época 3) y el split de test no se abrió durante el entrenamiento ni la selección. La revisión exacta del backbone preentrenado no se registró en esta ejecución. No se documenta RLHF, DPO ni ningún ajuste por preferencias: es un fine-tuning supervisado clásico de clasificación.

## Capacidades

- Clasificación monoetiqueta de texto clínico escrito por pacientes en una taxonomía cerrada de 13 especialidades médicas.
- Etiquetas de salida: Cardiology, Dentistry, Dermatology, Endocrinology, Gastroenterology, Infectious Disease, Nephrology, Neurology, Ophthalmology, Orthopedics, Otorhinolaryngology, Pulmonology, Urology.
- Entrada en inglés, hasta 512 tokens; funciona tanto con fragmentos cortos (la evaluación incluye los primeros 25 palabras) como con la publicación completa truncada.
- Devuelve una distribución de probabilidad sobre las 13 clases vía `pipeline("text-classification")`, reutilizable como score para ranking o umbralizado externo.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni modo *thinking*: es un encoder de clasificación, no un modelo generativo.
- No tiene capacidades de visión, audio ni generación de texto.
- No es multilingüe: solo inglés; la model card indica que nunca ha visto dariya marroquí ni otros idiomas.
- No puede abstenerse: toda entrada recibe forzosamente una de las 13 etiquetas, sin clase "no seguro" ni opción de derivar a otra especialidad.

## Casos de uso

- Enrutado de publicaciones en foros de salud: clasificar automáticamente un mensaje entrante y asignarlo al panel de moderadores o voluntarios de la especialidad correspondiente, reduciendo el tiempo de triaje humano en comunidades con volumen alto.
- Investigación sobre estrategias de elicitación de información: usar el modelo como evaluador fijo para comparar, con la misma exposición de texto, si las preguntas de seguimiento mejoran la clasificación frente a disponer de más texto libre (el escenario exacto del manuscrito).
- Evaluación de sistemas de recuperación aumentada: medir si incorporar fragmentos recuperados de fuentes externas mejora la asignación de especialidad, usando el clasificador como sonda reproducible sobre pares de entrada controlados.
- Curación y anotación asistida de corpus: preetiquetar grandes volúmenes de mensajes para que anotadores humanos revisen y corrijan, con el ahorro de coste que implica partir de una accuracy de validación del 89,25 % en texto completo.
- Análisis de distribución temática en repositorios de salud: agregar las predicciones para estudiar qué especialidades concentran las consultas de una comunidad, con la cautela de que la etiqueta refleja la categoría del foro y no un juicio clínico.
- Filtrado y control de calidad en pipelines de datos biomédicos: descartar o marcar documentos cuya predicción tiene baja confianza (usando la probabilidad de salida) antes de alimentar etapas posteriores de un sistema de información.
- Docencia y experimentación con modelos compactos: servir de ejemplo reproducible de fine-tuning de BERT biomédico con 110 M de parámetros, entrenable en una sola GPU de consumo y desplegable en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas publicadas son las de la propia tarea de clasificación.

Validación (9.416 registros, usada para seleccionar checkpoint): accuracy 89,25 %, macro-F1 87,56 %, weighted-F1 89,24 %.

| Especialidad | Precisión | Recall | F1 | Soporte |
|---|---|---|---|---|
| Cardiology | 0,905 | 0,892 | 0,899 | 547 |
| Dentistry | 0,843 | 0,781 | 0,811 | 192 |
| Dermatology | 0,857 | 0,861 | 0,859 | 705 |
| Endocrinology | 0,933 | 0,915 | 0,924 | 504 |
| Gastroenterology | 0,933 | 0,925 | 0,929 | 2.039 |
| Infectious Disease | 0,819 | 0,843 | 0,831 | 623 |
| Nephrology | 0,858 | 0,835 | 0,847 | 109 |
| Neurology | 0,809 | 0,790 | 0,799 | 747 |
| Ophthalmology | 0,945 | 0,941 | 0,943 | 476 |
| Orthopedics | 0,920 | 0,939 | 0,930 | 1.966 |
| Otorhinolaryngology | 0,848 | 0,872 | 0,860 | 818 |
| Pulmonology | 0,875 | 0,827 | 0,850 | 388 |
| Urology | 0,890 | 0,914 | 0,902 | 302 |

Cohorte held-out del manuscrito (650 registros balanceados por clase, 50 por especialidad, congelados antes de puntuar, limitado a publicaciones de al menos 50 palabras):

| Entrada | Accuracy | Macro-F1 |
|---|---|---|
| Primeras 25 palabras de la publicación | 70,00 % | 70,45 % |
| Primeras 25 palabras + tres respuestas de seguimiento fijas (extractos de la fuente) | 80,92 % | 81,04 % |
| Primeras 25 palabras + entrevista de cinco preguntas con recuperación | 81,69 % | 81,78 % |
| Publicación completa (tope de 512 tokens) | 88,62 % | 88,64 % |

Estas cifras del cohorte held-out no reflejan el rendimiento sobre tráfico natural desbalanceado; el manuscrito aporta los intervalos de confianza y el análisis completo.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,44 GB en FP32, 0,22 GB en BF16/FP16 y 0,11 GB en INT8 (cálculo a partir de los 109,5 M de parámetros; no hay versiones cuantizadas publicadas). Sumando activaciones y overhead del runtime, un lote pequeño a 512 tokens cabe holgadamente por debajo de 2 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más. El modelo se entrenó en una NVIDIA RTX 5090; para inferencia son suficientes RTX 3060/4060/4090, L4, T4, A10, A100 o H100, sin que ninguna sea necesaria por capacidad.
- Cabe en GPU de consumo, incluso en las más modestas, y también es viable la inferencia en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`; el repo está etiquetado con `text-embeddings-inference` y `endpoints_compatible`, por lo que es apto para Text Embeddings Inference y para Inference Endpoints. No hay GGUF publicado, por lo que llama.cpp y Ollama no están soportados de forma directa sin conversión propia. Soporte en vLLM/TGI para modelos encoder de clasificación: no disponible en la información proporcionada.
- Latencia y throughput: no se han publicado mediciones. Como referencia de complejidad (no medida), se trata de un encoder de 110 M de parámetros con 512 posiciones, un orden de magnitud muy por debajo de un LLM generativo, por lo que el coste dominante en producción será el preprocesado y la red, no el cómputo.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus model cards públicas y no se han verificado en esta ficha; las métricas no son comparables entre sí porque corresponden a tareas y conjuntos de evaluación distintos.

| Modelo | Parámetros | Contexto | Tarea / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `anaschahid/biomedbert-medhelp-specialty-13` | 109,5 M | 512 | Clasificación en 13 especialidades; macro-F1 87,56 % en validación propia | MIT | HuggingFace |
| `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext` | ≈110 M | 512 | Backbone MLM biomédico sin cabeza de clasificación; sin métricas de esta tarea | MIT (según model card del autor) | HuggingFace |
| `emilyalsentzer/Bio_ClinicalBERT` | ≈110 M | 512 | BERT base ajustado con notas clínicas (MIMIC); sin taxonomía de especialidades | no disponible | HuggingFace |
| `google-bert/bert-base-uncased` | 109,5 M | 512 | BERT base general; línea base de clasificación sin dominio biomédico | Apache 2.0 | HuggingFace |

Frente a las alternativas, la diferencia no es de escala sino de especialización: este checkpoint es el único de la tabla que produce directamente una de las 13 etiquetas de especialidad y que publica métricas por clase y un protocolo de evaluación congelado con hash del checkpoint. Si se necesita clasificación fuera de esas 13 categorías (Psiquiatría, Ginecología, Oncología, Reumatología), ninguno de los modelos comparables sirve sin reentrenamiento.

## Limitaciones y advertencias

- Uso exclusivamente investigador. No es un dispositivo médico, no ha sido validado para triaje ni derivación, y no debe usarse para dirigir la atención al paciente.
- La concordancia con la categoría de un foro no es precisión de derivación clínica: la etiqueta refleja dónde publicó el autor, no la decisión de un clínico. Los revisores clínicos del manuscrito propusieron en ocasiones servicios fuera de esta taxonomía.
- Taxonomía incompleta por diseño: los mensajes de Psiquiatría, Ginecología, Oncología y Reumatología se excluyeron del conjunto de etiquetas, por lo que el modelo no puede predecirlos y forzará ese texto a una de las 13 clases existentes.
- Sesgo de selección y de etiquetado: los datos provienen solo de páginas públicas de MedHelp en inglés, con el sesgo demográfico y de comportamiento de esa comunidad, y las etiquetas mayoritarias son administrativas (categoría de foro), no clínicas.
- Ceguera a los numerales: el preprocesado eliminó todos los dígitos, de modo que el modelo nunca ha visto edades, dosis, valores de laboratorio ni duraciones. Cualquier señal diagnóstica codificada numéricamente se pierde.
- Solo inglés; no ha visto dariya marroquí ni otros idiomas, y no hay garantía de comportamiento en dominios distintos a foros de salud.
- Degradación fuerte con texto corto o vago: 70,00 % de accuracy con las primeras 25 palabras frente a 88,62 % con la publicación completa en el cohorte held-out.
- Imposibilidad de abstenerse: toda entrada recibe una etiqueta, sin clase "no seguro" ni opción de derivar a otra especialidad; la confianza debe calibrarse y umbralizarse externamente si se va a usar en un pipeline.
- Riesgo de alucinación en sentido estricto: no aplica, al no ser generativo; el riesgo equivalente es una clasificación errónea con alta confianza en entradas cortas, ambiguas o fuera de la taxonomía.
- Los datos de entrenamiento no se distribuyen con el modelo, lo que limita la reproducibilidad completa del pipeline de datos (sí se publica el hash del checkpoint y las predicciones del held-out).
- Licencia MIT: permite uso comercial, pero la licencia no exime de las advertencias de uso clínico ni de las obligaciones regulatorias aplicables a software sanitario.
- Repositorio con 0 descargas y 0 likes: sin validación independiente por parte de la comunidad en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anaschahid/biomedbert-medhelp-specialty-13
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext
- Manuscrito de referencia: Chahid A, Chahid Y, Chahid I, Emharraf M, Belkasmi MG. *Better questions or just more text? Exposure-matched evaluation of follow-up questioning and retrieval for medical specialty classification*. En revisión, 2026 (sin enlace disponible en la información proporcionada).
- Repositorio de código: no disponible.
- Demo o Space: no disponible.
- Paper con DOI: no disponible.
