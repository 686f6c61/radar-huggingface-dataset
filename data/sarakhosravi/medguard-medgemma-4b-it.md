# sarakhosravi/MedGuard-MedGemma-4B-it

## Resumen

MedGuard-MedGemma-4B-it es un conjunto de adaptadores LoRA (PEFT) sobre el modelo base `google/medgemma-4b-it`, desarrollado por el usuario `sarakhosravi`. Su propósito es actuar como guardarraíl de seguridad farmacológica: dado un perfil de paciente estructurado y una prescripción propuesta, el modelo emite un veredicto de seguridad (seguro/inseguro) y las categorías de riesgo (hasta 17) que lo justifican. Está entrenado sobre el dataset propio MedGuardBench y se publica como material reproducible del artículo asociado.

El modelo no es un modelo fundacional independiente, sino un adaptador de bajo rango que se aplica sobre MedGemma-4B-it, un modelo médico multimodal de Google de 4.000 millones de parámetros. El repositorio ocupa 0,2 GB, lo que corresponde únicamente a los pesos del adaptador, no al modelo base. La relevancia actual radica en la creciente demanda de sistemas de verificación automática de prescripciones que reduzcan errores de medicación en entornos de investigación clínica.

La información publicada es limitada: no se detallan idiomas soportados, pipeline ni especificaciones completas del modelo base. La model card reporta únicamente resultados del brazo de entrenamiento SFT sobre el split de test de 729 filas con separación por fármaco (drug-disjoint).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal `google/medgemma-4b-it` |
| Parámetros totales | Adaptador LoRA (tamaño de repo 0,2 GB); modelo base: 4.000 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantización | no disponible (los adaptadores se aplican en el formato del base) |
| Idiomas soportados | no disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se acopla al transformer multimodal MedGemma-4B-it. La tarea se formula como clasificación estructurada: a partir de un perfil de paciente y una prescripción, el modelo genera un veredicto y las categorías de riesgo asociadas. El entrenamiento se realizó sobre MedGuardBench, un dataset con split de test de 729 filas y separación por fármaco para evitar filtración de información.

La model card describe tres brazos de entrenamiento, aunque solo el SFT reporta métricas en la información disponible:

- **SFT:** ajuste supervisado alineado al esquema de salida.
- **CU (Patient Profile Unrolling):** una época adicional desde el checkpoint SFT en la que el modelo verifica cada campo del historial del paciente contra las reglas de seguridad del fármaco antes de emitir el veredicto.
- **Guided GRPO:** GRPO con recompensa de seguridad verificable y rollouts guiados por profesor, partiendo del modelo SFT fusionado.

No se detallan el número de tokens de entrenamiento, la composición del dataset ni innovaciones arquitectónicas adicionales.

## Capacidades

- Verificación de seguridad de prescripciones condicionada al perfil del paciente.
- Emisión de veredicto binario (seguro/inseguro) acompañado de categorías de riesgo justificativas (hasta 17).
- Modo de razonamiento verificable en el brazo CU: genera una traza de verificación campo a campo antes del veredicto.
- Procesamiento de perfiles de paciente estructurados y prescripciones propuestas.
- Herencia de las capacidades multimodales del modelo base MedGemma-4B-it (no verificadas en la información disponible).
- Tool calling, agentes y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- **Verificación previa a prescripción en investigación clínica:** el modelo recibe el perfil estructurado del paciente y la prescripción propuesta, y devuelve un veredicto con las categorías de riesgo, útil para estudiar la detección automática de interacciones y contraindicaciones.
- **Generación de datasets etiquetados de seguridad farmacológica:** el brazo CU, que emite una traza de verificación campo a campo, permite auditar por qué se marcó una prescripción como insegura y construir corpus anotados con justificación.
- **Evaluación comparativa de guardarraíles:** al publicarse los checkpoints de los distintos brazos (SFT, CU, Guided GRPO), sirve como referencia reproducible para comparar estrategias de ajuste en tareas de seguridad médica.
- **Filtrado de pares paciente-prescripción en pipelines de datos:** puede aplicarse como clasificador de seguridad para descartar o marcar muestras riesgosas en corpus clínicos sintéticos antes de usarlos en otros entrenamientos.
- **Prototipado de sistemas de alerta en entornos simulados:** integrable en demos de soporte a la decisión que operen exclusivamente sobre datos sintéticos o de investigación, nunca en producción clínica.
- **Estudio de sesgos en reglas de seguridad:** las 17 categorías de riesgo permiten analizar qué tipos de riesgo detecta mejor o peor el modelo y cómo varía según el brazo de entrenamiento.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el split de test de 729 filas drug-disjoint de MedGuardBench (porcentajes):

| Brazo | Acc | Rec (unsafe) | FPR | Micro-F1 (17 cat.) | Macro-F1 (17 cat.) | Exact match |
|---|---:|---:|---:|---:|---:|---:|
| SFT | 86,4 | 97,9 | 26,0 | 69,4 | 62,8 | 57,6 |

No se han publicado resultados de benchmarks para los brazos CU y Guided GRPO en la información disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB; el modelo base MedGemma-4B-it requiere cargarse completo en memoria.
- VRAM estimada para el modelo base en precisión completa (fp16/bf16): en torno a 8 GB solo para pesos, más overhead de activaciones y caché KV; con cuantización de 4 bits podría reducirse a aproximadamente 3-4 GB, aunque no se especifican cuantizaciones soportadas.
- GPU recomendadas: A100 o H100 para despliegue con concurrencia; RTX 4090 (24 GB) o RTX 3090 para inferencia individual en fp16.
- Cabe en GPU de consumo con al menos 12-16 GB de VRAM en fp16; en 8 GB requeriría cuantización del base.
- Opciones de despliegue: transformers + PEFT (documentado en la model card), potencialmente vLLM o TGI tras fusionar el adaptador (no documentado).
- Latencia y throughput: no disponibles. La decodificación debe ser greedy (temperature 0) y el brazo CU requiere al menos 2.048 tokens nuevos, lo que incrementa la latencia frente al SFT.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, el modelo se apoya en `google/medgemma-4b-it` como base, pero no se han publicado comparaciones con otros guardarraíles farmacológicos ni con adaptadores médicos alternativos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MedGuard-MedGemma-4B-it | LoRA sobre 4B | no disponible | other | Hugging Face |
| google/medgemma-4b-it (base) | 4B | no disponible | no disponible en esta ficha | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Uso exclusivamente de investigación:** la model card declara explícitamente que estos modelos no son dispositivos médicos y no deben usarse para decisiones clínicas.
- **Tasa de falsos positivos elevada:** el brazo SFT reporta un FPR del 26,0 % sobre prescripciones seguras, lo que implica marcar erróneamente una de cada cuatro prescripciones correctas como inseguras.
- **Exact match limitado:** el 57,6 % de exact match en las 17 categorías indica que la justificación completa del veredicto falla en más del 40 % de los casos.
- **Licencia "other":** no se detallan los términos concretos; debe revisarse la licencia del modelo base `google/medgemma-4b-it` y la del adaptador antes de cualquier uso, incluido el comercial.
- **Idiomas no especificados:** no se documenta qué idiomas soporta el adaptador; el entrenamiento parece orientado a datos en inglés (dataset MedGuardBench), con riesgo de degradación en castellano.
- **Riesgo de alucinación:** al ser un modelo generativo, puede producir categorías de riesgo no justificadas o veredictos inconsistentes con el perfil del paciente.
- **Dependencia del modelo base:** hereda los sesgos y limitaciones de MedGemma-4B-it, incluidos posibles sesgos demográficos en datos médicos.
- **Sin métricas de los brazos CU y GRPO:** no es posible evaluar su rendimiento real a partir de la información publicada.
- **Repositorio con 0 descargas y 0 likes:** no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarakhosravi/MedGuard-MedGemma-4B-it
- Dataset MedGuardBench: https://huggingface.co/datasets/sarakhosravi/MedGuardBench
- Modelo base MedGemma-4B-it: https://huggingface.co/google/medgemma-4b-it
