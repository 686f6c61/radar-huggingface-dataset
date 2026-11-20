# pavithrabinu115/arabert-arabic-dialect-id

## Resumen

AraBERT Arabic Dialect ID es un modelo de clasificación de texto que identifica la variedad dialectal de una frase en árabe entre cinco clases: egipcio (EGY), del Golfo (GLF), levantino (LAV), norteafricano/tunecino (NOR) y árabe estándar moderno (MSA). Lo desarrolla el usuario pavithrabinu115 como proyecto de aprendizaje y práctica, en preparación del hackathon HF NeurIPS 2026 ML Intern Reproductions, y se publica bajo licencia CC-BY-4.0.

Técnicamente es un ajuste fino completo de aubmindlab/bert-base-arabertv02, un transformer BERT-base de aproximadamente 135 millones de parámetros, al que se le sustituye la cabeza por un clasificador lineal de cinco clases. El entrenamiento se realizó sobre el corpus drelhaj/Arabic-Dialects (El-Haj, Rayson y Aboelezz, LREC 2018), con 8.079 frases de entrenamiento, 1.010 de validación y 1.013 de test, y una longitud máxima de 128 tokens.

Su relevancia práctica es acotada pero concreta: ofrece una solución compacta y desplegable en navegador (incluye exportaciones ONNX fp32 e int8 para Transformers.js) para una tarea lingüística difícil, con un rendimiento declarado de 0,803 de accuracy y 0,751 de macro-F1 en el conjunto de test. No es un modelo generativo ni un LLM: es un clasificador discriminativo de cinco etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (AraBERT v0.2) con cabeza de clasificación lineal de 5 clases |
| Parametros totales | 135.197.189 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (truncado en entrenamiento e inferencia) |
| Tipos de cuantizacion | fp32 (ONNX), int8 per-channel dynamic quantization (ONNX, 136 MB); pesos safetensors en fp32 |
| Idiomas soportados | Árabe (ar), incluyendo variedades dialectales EGY, GLF, LAV, NOR y MSA |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo parte de aubmindlab/bert-base-arabertv02, un BERT-base preentrenado específicamente para árabe, y aplica un ajuste fino completo con una nueva cabeza de clasificación de cinco vías. El entrenamiento usó 3 épocas, learning rate 3e-5, scheduler lineal con 10% de warmup, weight decay 0,01, batch size 32, longitud máxima de 128 tokens, precisión fp16 y semilla 42. Se seleccionó el mejor checkpoint según macro-F1 en el conjunto de validación y se entrenó en un Mac con Apple Silicon usando el backend MPS de PyTorch.

No se aplicó preprocesamiento de texto específico de AraBERT (por ejemplo, normalización de caracteres árabes o segmentación), lo que es un detalle relevante para quien quiera reproducir o mejorar el resultado. Tampoco hubo búsqueda de hiperparámetros ni múltiples semillas: es una única ejecución. El dataset de origen presenta desequilibrio de clases (EGY representa aproximadamente el 40% del test), lo que explica en parte la diferencia entre accuracy y macro-F1.

Como innovación destacable, el autor incluye exportaciones ONNX optimizadas para el navegador: un modelo fp32 y un modelo int8 con cuantización dinámica per-channel que mantiene exactamente las mismas métricas que el modelo original (0,803 de accuracy y 0,751 de macro-F1). El autor documenta que una exportación int8 per-tensor ingenua bajaba a 0,759 de accuracy y 0,710 de macro-F1, por lo que la cuantización per-channel es determinante en este caso.

## Capacidades

- Clasificación de texto en árabe en cinco variedades dialectales: EGY, GLF, LAV, NOR y MSA.
- Inferencia en navegador mediante Transformers.js con el modelo ONNX int8 (136 MB).
- Despliegue en servidor con la librería transformers y la pipeline de text-classification.
- Compatibilidad con text-embeddings-inference y endpoints compatibles según los tags del repositorio.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es un clasificador discriminativo.
- Capacidad multilingüe limitada al árabe; no se declaran otras lenguas.
- No dispone de modo thinking ni razonamiento multi-paso.

## Casos de uso

- Enrutamiento de atención al cliente por dialecto: clasificar el mensaje entrante de un usuario para dirigirlo a agentes o respuestas predefinidas adaptadas a la variedad (por ejemplo, egipcio frente a del Golfo), aprovechando que el modelo distingue EGY con una F1 de 0,993.
- Análisis de sentimiento y moderación por segmento dialectal: preetiquetar corpus de redes sociales por variedad antes de aplicar modelos de sentimiento específicos, lo que permite comparar opiniones entre regiones.
- Investigación lingüística y sociolingüística: etiquetar automáticamente corpus de árabe para estudiar distribución de dialectos, code-switching y bivalencia entre MSA y variedades locales.
- Filtrado y curación de datasets: separar automáticamente frases en árabe estándar (MSA, F1 0,862) de frases dialectales para construir conjuntos de entrenamiento más limpios para otros modelos.
- Aplicaciones web sin backend: integrar el modelo ONNX int8 en una aplicación de navegador con Transformers.js para clasificar texto en el cliente, sin enviar datos a un servidor, útil en contextos de privacidad o conectividad limitada.
- Preprocesamiento en pipelines de NLP árabe: usar la etiqueta de dialecto como característica de entrada para sistemas de traducción, ASR o TTS que necesiten seleccionar un modelo o léxico específico por variedad.
- Docencia y reproducción de experimentos: servir como referencia reproducible (script de entrenamiento, curvas en Trackio, matriz de confusión) para cursos de NLP y para comparar técnicas de ajuste fino en modelos BERT multilingües.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test de drelhaj/Arabic-Dialects (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Accuracy | 0,803 |
| Macro-F1 | 0,751 |
| Mejor macro-F1 en dev | 0,781 |

Rendimiento por clase en test:

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| EGY | 0,990 | 0,995 | 0,993 | 407 |
| GLF | 0,619 | 0,649 | 0,634 | 168 |
| LAV | 0,643 | 0,562 | 0,600 | 176 |
| MSA | 0,797 | 0,940 | 0,862 | 100 |
| NOR | 0,679 | 0,654 | 0,667 | 162 |

El autor indica que el artículo del dataset reporta aproximadamente un 76% de accuracy con su método de Subtractive Bivalency Profiling, si bien señala que no es una comparación equivalente por diferencias de método y configuración de evaluación. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-1 GB en fp32 (135M parámetros) y menos de 0,5 GB en int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 y H100, aunque no necesita ninguna de estas para funcionar.
- Cabe en GPU de consumo y también en CPU; el entrenamiento se realizó en un Mac con Apple Silicon (backend MPS).
- Opciones de despliegue: transformers (pipeline de text-classification), Transformers.js en navegador con el modelo ONNX int8, text-embeddings-inference y endpoints compatibles; también es posible servir el ONNX con runtime propio.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo y la longitud máxima de 128 tokens, se espera una latencia de milisegundos en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pavithrabinu115/arabert-arabic-dialect-id | 135M | 128 tokens | Clasificación de dialecto árabe (5 clases) | CC-BY-4.0 | Hugging Face, ONNX, Transformers.js |
| aubmindlab/bert-base-arabertv02 | ~136M | 512 tokens (BERT estándar) | Modelo base de representaciones en árabe | Apache-2.0 (según el modelo original) | Hugging Face |
| drelhaj/Arabic-Dialects (método SBP del artículo) | no aplica (método estadístico) | no aplica | Identificación de dialecto árabe | según el artículo | Corpus y método publicados |
| Clasificadores de dialecto árabe basados en MARBERT | no disponible en la información | no disponible | Identificación de dialecto árabe | no disponible | no disponible |

La comparación con alternativas específicas de identificación de dialecto árabe no está disponible en la información proporcionada. El modelo base AraBERT v0.2 sí es un punto de referencia claro: este ajuste añade una cabeza de clasificación de cinco clases y reduce el contexto efectivo a 128 tokens.

## Limitaciones y advertencias

- Dataset pequeño (unas 8.000 frases de entrenamiento) y procedente de un único corpus de 2018; puede no generalizar a otros dominios, estilos de redes sociales, arabizi (árabe en alfabeto latino) ni a dialectos fuera del conjunto de etiquetas (iraquí, sudanés, yemení, etc.).
- La clase NOR agrupa variedades norteafricanas, mayoritariamente tunecinas; no debe interpretarse como identificación fina del magrebí.
- Solapamiento intenso entre dialecto y MSA (bivalencia y code-switching): frases cortas pueden ser genuinamente ambiguas y una única etiqueta puede ser incorrecta aunque el modelo sea razonable.
- Entrada truncada a 128 tokens y sin preprocesamiento específico de AraBERT, lo que puede degradar el rendimiento en textos largos o con normalización no estándar.
- Resultados de una sola ejecución con una sola semilla y sin búsqueda de hiperparámetros: deben tratarse como indicativos, no como resultado de benchmark.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas con alta confianza, especialmente en GLF, LAV y NOR (F1 entre 0,60 y 0,67).
- Sesgos derivados del desequilibrio del dataset (EGY domina con aproximadamente el 40% del test), lo que infla la accuracy global frente al macro-F1.
- Advertencia explícita del autor: no usar el modelo para tomar decisiones sobre personas, como inferir nacionalidad u origen.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar las condiciones del corpus de origen y del modelo base AraBERT antes de un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pavithrabinu115/arabert-arabic-dialect-id
- Modelo base AraBERT v0.2: https://huggingface.co/aubmindlab/bert-base-arabertv02
- Dataset drelhaj/Arabic-Dialects: https://huggingface.co/datasets/drelhaj/Arabic-Dialects
- Demo en navegador (Space): https://huggingface.co/spaces/pavithrabinu115/arabic-dialect-id
- Dashboard de entrenamiento (Trackio): https://huggingface.co/spaces/pavithrabinu115/trackio-dashboard
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Artículo de referencia del dataset (El-Haj, Rayson y Aboelezz, LREC 2018): Arabic Dialect Identification in the Context of Bivalency and Code-Switching, actas de LREC 2018, páginas 3622-3627
- Script de entrenamiento: train.py incluido en el repositorio del modelo
