# ilyali034/bert-medical-diagnosis-en

## Resumen

`ilyali034/bert-medical-diagnosis-en` es un modelo de clasificación de texto en inglés desarrollado por el usuario ilyali034, que mapea descripciones de síntomas en lenguaje natural a una de 24 posibles categorías diagnósticas. Se trata de un fine-tuning de `emilyalsentzer/Bio_ClinicalBERT`, un encoder transformer basado en BERT entrenado sobre literatura clínica, adaptado aquí mediante aprendizaje supervisado sobre el dataset `NeuronZero/Symptom2Disease`.

El modelo se distribuye explícitamente como una **versión de prueba experimental** y su autor lo desaconseja para cualquier uso clínico, autodiagnóstico o toma de decisiones médicas. Su relevancia es, por tanto, la de un artefacto de investigación y demostración docente: ilustra el flujo completo de adaptación de un modelo de dominio biomédico a una tarea concreta de clasificación, así como las limitaciones típicas de un fine-tuning con datos sintéticos y volumen reducido (1.200 ejemplos).

La arquitectura subyacente es un transformer encoder con atención bidireccional, orientado a clasificación de secuencias cortas (longitud máxima de 128 tokens) y no a generación. El modelo no está pensado como asistente conversacional ni como sistema de razonamiento clínico, sino como un clasificador cerrado de 24 etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT, base `emilyalsentzer/Bio_ClinicalBERT`) |
| Parametros totales | no disponible (no declarado en la model card; el modelo base es de tipo BERT-base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de entrada declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (pesos PyTorch para Hugging Face Transformers; no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de `emilyalsentzer/Bio_ClinicalBERT`, un checkpoint BERT entrenado sobre notas clínicas de MIMIC-III y literatura biomédica, lo que le proporciona un vocabulario y unas representaciones sesgadas hacia terminología médica. Sobre esa base se añade una cabeza de clasificación de secuencia con 24 clases de salida y se realiza un fine-tuning supervisado sobre el dataset `NeuronZero/Symptom2Disease`, que empareja descripciones de síntomas con etiquetas diagnósticas.

El autor declara que el entrenamiento se realizó sobre **1.200 ejemplos sintéticos**, un volumen muy reducido para una tarea de clasificación con 24 clases (unas 50 muestras por clase de media). No se especifican en la información disponible el número de épocas, la tasa de aprendizaje, el optimizador, la composición exacta del dataset ni si hubo aumento de datos. Tampoco se documenta el uso de RLHF, DPO ni ninguna técnica de alineación, algo esperable en un encoder de clasificación. La innovación técnica es nula por diseño: se trata de un fine-tuning estándar de clasificación sobre un encoder preentrenado.

## Capacidades

- Clasificación de texto en inglés: asigna una descripción de síntomas a una de las 24 categorías diagnósticas del conjunto de etiquetas.
- Salida con puntuaciones de confianza por clase, lo que permite recuperar el top-N de diagnósticos mediante `top_k` en el pipeline de Transformers.
- Procesamiento de entradas cortas: descripciones de síntomas de hasta 128 tokens.
- Integración directa con la librería `transformers` mediante `pipeline("text-classification", ...)`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No soporta generación de texto libre, visión, audio ni modo "thinking".
- Multilingüismo limitado al inglés; no se declaran capacidades en otros idiomas.

## Casos de uso

- Docencia y demostración de fine-tuning biomédico: el modelo sirve para ilustrar en un curso o taller cómo se adapta un encoder clínico a una tarea de clasificación supervisada, incluyendo la evaluación por clase y el análisis de errores.
- Investigación sobre sesgos y robustez en NLP clínico: al ser un modelo pequeño y con métricas por clase publicadas, permite estudiar cómo el desbalanceo y el solapamiento semántico entre etiquetas (por ejemplo, `Allergy` frente a `allergy`) afectan al rendimiento.
- Prototipado de interfaces de triaje no clínico: en un entorno de pruebas controlado se puede usar para explorar cómo un clasificador de síntomas se integra en un formulario web o un chatbot de demostración, siempre con avisos explícitos de que no es una herramienta médica.
- Generación de datos etiquetados sintéticos para experimentos: las predicciones del modelo, junto con sus puntuaciones de confianza, pueden emplearse como señal débil en pipelines de etiquetado semiautomático para investigación, nunca como fuente de verdad.
- Evaluación comparativa de encoders clínicos: al estar basado en Bio_ClinicalBERT y publicar métricas sobre `NeuronZero/Symptom2Disease`, sirve como línea base para comparar otros encoders (PubMedBERT, MedBERT, etc.) sobre el mismo conjunto de datos.
- Análisis de errores en clasificación médica de grano grueso: las clases con recall bajo (`drug reaction` al 20 %, `allergy` al 40 %) son un caso de estudio útil para investigar confusión entre categorías relacionadas y para diseñar estrategias de mitigación, como remuestreo o etiquetas jerárquicas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el dataset `NeuronZero/Symptom2Disease` (versión de prueba, no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Accuracy | 0,8167 |
| F1 (weighted) | 0,7966 |
| F1 (macro) | 0,7966 |
| F1 (micro) | 0,8167 |
| Precision (weighted) | 0,8441 |
| Recall (weighted) | 0,8167 |

Rendimiento por clase declarado por el autor (selección de las clases con comportamiento relevante):

| Diagnostico | Precision | Recall | F1 |
|---|---|---|---|
| Acne | 1,000 | 1,000 | 1,000 |
| Arthritis | 1,000 | 1,000 | 1,000 |
| Malaria | 1,000 | 1,000 | 1,000 |
| Pneumonia | 0,833 | 1,000 | 0,909 |
| Bronchial Asthma | 1,000 | 0,800 | 0,889 |
| Migraine | 1,000 | 0,800 | 0,889 |
| Common Cold | 0,556 | 1,000 | 0,714 |
| Dengue | 1,000 | 0,600 | 0,750 |
| allergy | 1,000 | 0,400 | 0,571 |
| drug reaction | 1,000 | 0,200 | 0,333 |
| gastroesophageal reflux disease | 0,417 | 1,000 | 0,588 |
| peptic ulcer disease | 0,000 | 0,000 | 0,000 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al derivar de un BERT-base, la inferencia en fp32 requiere del orden de 1-2 GB de VRAM, y en fp16 aproximadamente la mitad.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también cabe en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño reducido del encoder.
- Opciones de despliegue: `transformers` con `pipeline`, TorchScript/ONNX para servir, y FastAPI o similar como capa HTTP. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ilyali034/bert-medical-diagnosis-en` | no disponible (base BERT) | 128 tokens | Clasificación de síntomas en 24 clases | MIT | Hugging Face |
| `emilyalsentzer/Bio_ClinicalBERT` | BERT-base | 512 tokens | Modelo base de dominio clínico, sin cabeza de clasificación de síntomas | MIT | Hugging Face |
| `NeuronZero/Symptom2Disease` (dataset) | no aplica | no aplica | Conjunto de datos de referencia para la tarea | no disponible | Hugging Face Datasets |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo marcado explícitamente por el autor como **versión de prueba experimental**, no validado clínicamente y no apto para uso sanitario, autodiagnóstico ni decisiones médicas.
- Tasa de error aproximada del 18 % según el propio autor, con un accuracy declarado de 0,8167.
- Entrenado sobre solo 1.200 ejemplos sintéticos, lo que limita la generalización a descripciones reales de pacientes.
- Cobertura cerrada de 24 clases; cualquier condición fuera de ese conjunto se forzará a una de las etiquetas existentes.
- Clases con rendimiento muy deficiente: `peptic ulcer disease` con recall 0, `drug reaction` con recall 0,20 y `allergy` con recall 0,40.
- Etiquetas duplicadas o inconsistentes en el conjunto (`Allergy` y `allergy`, `Diabetes` y `diabetes`, `Drug reaction` y `drug reaction`), lo que introduce ambigüedad en la clasificación.
- Longitud máxima de entrada de 128 tokens, insuficiente para historiales clínicos o descripciones largas.
- Solo inglés; no hay soporte multilingüe declarado.
- Riesgo de alucinación en el sentido de asignar una etiqueta con alta confianza a entradas sin relación con ninguna de las 24 condiciones.
- Sesgos potenciales heredados del corpus clínico de preentrenamiento (MIMIC-III) y de la distribución sintética del dataset de fine-tuning.
- Licencia MIT permite uso comercial del artefacto, pero ello no exime de las advertencias del autor ni de las obligaciones regulatorias aplicables a software sanitario.
- No se documentan formatos de pesos alternativos (GGUF, ONNX) ni cuantizaciones oficiales, lo que complica el despliegue en entornos ligeros sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ilyali034/bert-medical-diagnosis-en
- Modelo base Bio_ClinicalBERT: https://huggingface.co/emilyalsentzer/Bio_ClinicalBERT
- Dataset NeuronZero/Symptom2Disease: https://huggingface.co/datasets/NeuronZero/Symptom2Disease
