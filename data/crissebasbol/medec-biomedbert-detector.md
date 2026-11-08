# crissebasbol/medec-biomedbert-detector

## Resumen

MEDEC-biomedbert-detector es un modelo de clasificación de texto derivado de `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext`, afinado por el autor `crissebasbol` para una tarea muy concreta: localizar, dentro de una nota clínica, la oración que contiene un error médico. Corresponde a la subtarea B de MEDIQA-CORR 2024 / MEDEC (detección de la oración con error), no a la corrección del error ni a la detección de si la nota contiene un error. El modelo clasifica pares (oración candidata, texto completo de la nota) y devuelve una probabilidad de que esa oración sea la del error; en inferencia se puntúan todas las oraciones de la nota y se elige la de mayor probabilidad.

Se trata de un BERT base con 109.483.778 parámetros (aproximadamente 110 M), contexto de 512 tokens y licencia MIT. El repo ocupa 0,4 GB en formato safetensors. Su relevancia es acotada: es un artefacto docente del taller 8 del curso de PLN de la Pontificia Universidad Javeriana, con cero descargas y cero likes en el momento de redactar esta ficha, y no se ha evaluado en notas clínicas reales. Resulta útil como componente de un pipeline de verificación de notas clínicas sintéticas, pero no como sistema autónomo de detección de errores.

El dato más importante para evaluar el modelo es su limitación declarada: acierta la oración con error en el 95,1 % de los textos que sí contienen error, pero en textos sin error elige igualmente la oración del diagnóstico o tratamiento con la misma confianza. Su probabilidad no discrimina entre notas correctas y erróneas (AUC de 0,48 en la subtarea A), por lo que la decisión de si hay error debe tomarla otro componente del pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, uncased) |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; no se publican pesos GGUF ni ONNX) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT base uncased inicializado desde `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext`, preentrenado sobre abstracts de PubMed y artículos de PubMedCentral. La cabeza de clasificación es de tipo `AutoModelForSequenceClassification` con dos etiquetas (0: oración sin error; 1: oración con error). La entrada es un par (oración candidata, texto completo de la nota) con truncamiento `only_second` y `max_length` de 512, de modo que la oración candidata nunca se trunca y el texto de la nota se recorta si excede el contexto.

El entrenamiento usa el subset MS de MEDEC (MEDIQA-CORR 2024): 1.528 textos de entrenamiento, 334 de validación y 327 de prueba, separados por caso clínico para evitar fuga de información entre particiones. Se entrenó durante 2 épocas con learning rate 2e-5, batch de 16, longitud máxima de 512 y pérdida ponderada por clase; se conservó la mejor época según la pérdida de validación. No se documenta uso de RLHF, DPO ni decodificación especulativa. El umbral de decisión (0,2) se ajustó sobre validación y se reutilizó en prueba.

## Capacidades

- Clasificación binaria de pares (oración candidata, nota clínica completa) para identificar la oración que contiene un error médico.
- Puntuación de todas las oraciones de una nota y selección de la de mayor probabilidad como oración clave.
- Manejo de vocabulario y terminología biomédica gracias al preentrenamiento de BiomedBERT sobre PubMed y PubMedCentral.
- Entrada en inglés exclusivamente; no se ha entrenado ni evaluado en otros idiomas.
- No dispone de tool calling, function calling, capacidades de agente, modo thinking, visión ni audio.
- No genera texto: es un encoder con cabeza de clasificación, no un modelo generativo.
- No decide si una nota contiene error; solo localiza la oración candidata (véase la sección de limitaciones).

## Casos de uso

- Componente de localización en pipelines de revisión de notas clínicas sintéticas: dado un texto generado a partir de preguntas de estilo USMLE, puntúa cada oración y propone la oración sospechosa para que un segundo modelo (por ejemplo, un LLM) decida si realmente contiene un error y lo corrija. Es el uso previsto en el taller del autor.
- Evaluación de sistemas de generación de notas clínicas: permite medir si un generador sitúa el error en la oración esperada, comparando la oración seleccionada por este detector con la anotación de referencia de MEDEC.
- Filtro previo de bajo coste en pipelines de anotación: al puntuar todas las oraciones de una nota en una sola pasada por GPU, reduce el número de oraciones que se envían a un modelo más caro para revisión.
- Investigación en NLP clínico: reproduce el baseline de la subtarea B de MEDIQA-CORR 2024 sobre el subset MS con un modelo de 110 M parámetros, útil para comparaciones controladas.
- Docencia y experimentación: sirve como ejemplo reproducible de fine-tuning de un encoder biomédico con pares (oración, documento) y truncamiento `only_second`, con código público en GitHub.
- Análisis de errores en datasets clínicos: ayuda a inspeccionar qué tipo de oraciones (diagnóstico, tratamiento, antecedentes) el modelo tiende a seleccionar, lo que informa sobre sesgos del dataset MEDEC.
- Prototipado de sistemas de alerta: en entornos de investigación con notas sintéticas, puede señalizar la oración candidata para revisión humana, nunca para decisión clínica automática.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de prueba (327 textos):

| Métrica | Valor |
|---|---:|
| B: acierta la oración, en los textos con error | 0,951 |
| B: sentence accuracy oficial (umbral 0,2 ajustado en validación) | 0,554 |
| A: flag accuracy (umbral 0,2) | 0,566 |
| A: AUC (capacidad de discriminar notas con error frente a notas correctas) | 0,48 |

No se han publicado comparaciones con otros modelos en la información disponible. El AUC de 0,48 en la subtarea A indica que la probabilidad del modelo no discrimina entre notas correctas y erróneas (0,5 equivale a azar).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB de pesos, más activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- VRAM estimada en fp16: aproximadamente 0,22 GB de pesos; cuantización a int8 no está publicada en el repo.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; A100 y H100 no aportan ventaja apreciable para un modelo de 110 M parámetros.
- Cabe en GPU consumer y también en CPU: la inferencia sobre una nota de decenas de oraciones es viable en CPU, aunque más lenta.
- Opciones de despliegue: `transformers` con PyTorch (vía documentada), ONNX Runtime si se exporta, y `text-classification` en la Inference API de Hugging Face. No se publican pesos GGUF ni plantillas de Ollama, vLLM o TGI; vLLM y TGI pueden servir modelos de clasificación BERT, pero no hay configuración publicada por el autor.
- Latencia y throughput: no disponibles. Al puntuar todas las oraciones de una nota, el coste crece linealmente con el número de oraciones, ya que cada oración requiere una pasada independiente con el texto completo como segundo segmento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| crissebasbol/medec-biomedbert-detector | 109,5 M | 512 | Clasificación de oración con error (MEDEC subtarea B) | MIT | Hugging Face, 0 descargas |
| microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext | ~110 M | 512 | Modelo base biomédico (MLM) | MIT | Hugging Face, ampliamente usado |
| Modelos generativos tipo LLM (p. ej., Claude Haiku 5.5 citado en la model card) | no disponible | no disponible | Decisión de si hay error y corrección | no disponible | Uso vía API |

No se dispone de resultados de benchmarks de alternativas comparables sobre MEDEC en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento numérica.

## Limitaciones y advertencias

- No detecta si una nota contiene error: solo localiza la oración candidata. En textos sin error elige la oración de diagnóstico o tratamiento con la misma confianza (95-98 %), y su AUC en la subtarea A es 0,48, equivalente a azar.
- Entrenado y evaluado exclusivamente sobre el subset MS de MEDEC, construido a partir de preguntas de MedQA (USMLE), en inglés y con estilo muy regular; no se ha evaluado en notas clínicas reales.
- Solo admite inglés; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Contexto limitado a 512 tokens con truncamiento `only_second`: en notas largas, parte del texto se descarta, lo que puede degradar la localización.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero puede seleccionar oraciones plausibles sin error con alta confianza, lo que induce falsos positivos si se interpreta la probabilidad como señal de error.
- No es un dispositivo médico y no debe usarse para decisiones clínicas, según declara el propio autor.
- Licencia MIT: permite uso comercial, pero el modelo no cuenta con validación regulatoria ni evaluación en producción; cualquier uso comercial requiere validación propia.
- Modelo con cero descargas y cero likes en el momento de redactar la ficha; no hay evidencia de uso en producción ni de mantenimiento continuado.
- El repo no publica pesos cuantizados, configuración de despliegue ni scripts de evaluación reproducibles más allá del código del taller en GitHub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/crissebasbol/medec-biomedbert-detector
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext
- Código del pipeline del taller: https://github.com/crissebasbol/nlp-course/tree/taller_8/talleres/taller_8
- Repo BioMedBERT (referencia comunitaria): https://github.com/BioMedBERT/biomedbert
- Ficha de BiomedBERT en AIBase: https://model.aibase.com/models/details/1915687190094626817
