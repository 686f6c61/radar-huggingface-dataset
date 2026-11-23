# elajeff/greek-pii-redactor-ner

## Resumen

greek-pii-redactor-ner es un modelo de clasificación de tokens (token classification) especializado en la detección de nombres de persona en texto en griego. Lo desarrolla elajeff como componente de detección de nombres del proyecto greek-pii-redactor, una herramienta que sustituye nombres e identificadores por marcadores de posición antes de enviar un texto a un LLM y los restaura en la respuesta. El modelo etiqueta cada token con las clases `O`, `B-PERSON` e `I-PERSON`, de modo que permite localizar exactamente los límites de cada nombre (span exacto) en lugar de hacer una detección aproximada.

Técnicamente es un fine-tuning de `FacebookAI/xlm-roberta-base`, un transformer encoder multilingüe de 277.455.363 parámetros, sobre la partición de entrenamiento del corpus WikiANN en griego (`el`) más 2000 frases sintéticas en griego e inglés. Se distribuye en formato safetensors con licencia MIT y está pensado para integrarse en pipelines de anonimización previa a llamadas a modelos generativos, un caso de uso cada vez más habitual por requisitos de privacidad y cumplimiento.

Su interés radica en que aborda un idioma con poca cobertura en herramientas de PII (griego) y lo hace con un modelo pequeño y desplegable en infraestructura modesta, superando según el autor a alternativas genéricas como Presidio con el modelo de spaCy para griego o un LLM de 4B en la misma tarea de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de tokens |
| Parámetros totales | 277.455.363 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa base admite hasta 512 tokens de entrada, dato no confirmado en la información proporcionada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | griego (el); evaluación adicional no oficial en inglés sintético |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base`, un transformer encoder de tipo RoBERTa entrenado de forma multilingüe, al que se le añade una cabeza de clasificación de tokens para las etiquetas `O`, `B-PERSON` e `I-PERSON`. El fine-tuning se realizó con el script `train/train_tagger.py` del repositorio del proyecto, con semilla 1.

Los datos de entrenamiento combinan la partición de train de WikiANN en griego con 2000 frases sintéticas en griego e inglés generadas por `eval/make_synthetic.py` (semilla 11, partición de train). Se conservó la época con mejor F1 sobre la partición de validación de WikiANN. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un modelo discriminativo de NER. Las etiquetas de WikiANN son generadas automáticamente a partir de Wikipedia, lo que condiciona la calidad y el sesgo de las anotaciones.

## Capacidades

- Detección de nombres de persona en griego mediante etiquetado BIO (`O`, `B-PERSON`, `I-PERSON`).
- Delimitación de spans exactos de nombres, no solo detección a nivel de token aislado.
- Integración en pipelines de anonimización previa a LLMs: sustitución por marcadores y restauración posterior.
- Uso como `AutoModelForTokenClassification` estándar en `transformers`.
- Capacidad observada (no oficial) de detectar nombres en frases sintéticas en inglés, si bien el autor advierte que esas frases provienen del mismo generador usado en entrenamiento.
- No soporta tool calling, agentes, generación de texto ni razonamiento multi-paso: es un modelo puramente discriminativo.

## Casos de uso

- Anonimización previa a LLMs: el modelo detecta nombres en el texto griego y el pipeline de greek-pii-redactor los sustituye por marcadores antes de enviar la consulta a un modelo generativo, restaurándolos en la respuesta. Es su caso de uso nativo.
- Cumplimiento de privacidad en flujos de traducción: redactar nombres de persona en documentos griegos antes de enviarlos a servicios de traducción externos.
- Preprocesado de documentos legales: aunque el propio autor señala debilidades con nombres en mayúsculas, sirve como primera pasada de detección en expedientes griegos, con revisión humana posterior.
- Enmascarado en logs y telemetría: filtrar nombres de usuario en trazas y registros de aplicaciones que operan con usuarios griegos.
- Construcción de datasets de entrenamiento: etiquetar automáticamente nombres en corpus griegos para tareas posteriores de anonimización o de extracción de entidades.
- Filtrado previo en pipelines de moderación o analítica: detectar menciones de personas en texto griego antes de almacenar o procesar contenido.

## Benchmarks y rendimiento

Evaluación sobre 2000 frases de test de WikiANN `el` muestreadas con semilla 7 (894 nombres), con precisión y recall de span exacto:

| Modelo | Precisión | Recall |
|---|---|---|
| greek-pii-redactor-ner (este modelo) | 0,909 | 0,932 |
| Presidio con modelo spaCy griego | 0,639 | 0,649 |
| qwen3:4b-instruct | 0,647 | 0,628 |

El autor advierte que WikiANN comparte muchos nombres entre particiones, por lo que la puntuación corresponde a nombres parcialmente vistos durante el entrenamiento y no debe interpretarse como rendimiento en datos completamente nuevos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 1,1 GB de pesos (tamaño del repositorio), más overhead de activaciones; cómodo en cualquier GPU consumer.
- En FP16/BF16 el peso ronda los 0,55 GB, por lo que cabe holgadamente en GPUs de gama baja.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, A100, H100). También viable en CPU para volúmenes moderados.
- Despliegue mediante `transformers` (carga como `AutoModelForTokenClassification`), y potencialmente con servidores de inferencia compatibles con token-classification (por ejemplo, TGI o endpoints de Hugging Face). No se documentan opciones GGUF/llama.cpp ni Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento (P/R span exacto) | Licencia |
|---|---|---|---|---|---|
| greek-pii-redactor-ner | Fine-tuning XLM-R base para NER de personas en griego | 277 M | no disponible | 0,909 / 0,932 | MIT |
| Presidio + spaCy griego | Pipeline de reglas + NER spaCy | no disponible | no disponible | 0,639 / 0,649 | según componentes |
| qwen3:4b-instruct | LLM generativo usado para NER | ~4 B | no disponible | 0,647 / 0,628 | según modelo |

La comparación se limita a la evaluación del propio autor sobre el mismo conjunto de test; no hay datos de otros modelos NER específicos para griego en la información disponible.

## Limitaciones y advertencias

- Punto débil con nombres en minúsculas y, sobre todo, en mayúsculas: en el corpus greek_legal_ner, donde la mayoría de nombres van en mayúsculas, cerca de una cuarta parte de las palabras de nombres en mayúsculas quedan fuera de cualquier span predicho.
- Solo etiqueta nombres de persona; no detecta direcciones, teléfonos, correos ni otros datos personales, pese a la denominación "PII redactor" del proyecto.
- Entrenado y evaluado principalmente en griego; la detección en inglés se probó solo con frases sintéticas del mismo generador usado en entrenamiento, lo que invalida esa cifra como evidencia de generalización.
- Riesgo de falso negativo y de span parcial: al ser NER, puede dejar nombres sin detectar o delimitar mal los límites, lo que en anonimización implica fugas de datos.
- Las etiquetas de WikiANN son generadas automáticamente, con posibles errores y sesgos de cobertura (nombres frecuentes en Wikipedia frente a nombres comunes).
- Licencia del modelo MIT, pero el autor advierte que WikiANN figura con licencia desconocida y no puede garantizar las implicaciones de la licencia de los datos de entrenamiento para el modelo. Conviene revisar este punto antes de uso comercial.
- Sin datos publicados sobre cuantización, latencia ni contexto máximo efectivo; validar en el entorno de producción antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elajeff/greek-pii-redactor-ner
- Repositorio del proyecto greek-pii-redactor: https://github.com/elajeff/greek-pii-redactor
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Dataset WikiANN: https://huggingface.co/datasets/unimelb-nlp/wikiann
