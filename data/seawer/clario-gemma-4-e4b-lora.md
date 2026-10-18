# seawer/clario-gemma-4-e4b-lora

## Resumen

Clario Gemma 4 E4B LoRA es un adaptador LoRA (PEFT) publicado por el usuario seawer sobre el modelo base `google/gemma-4-E4B-it`. Su función es muy concreta: recibe una nota de diario de síntomas escrita en inglés o italiano por un paciente y devuelve JSON estructurado con los términos clínicos extraídos, la frase exacta de la que proceden, el mapeo al Human Phenotype Ontology (HPO) y anotaciones de negación, antecedentes familiares, severidad e inicio.

Forma parte de Clario, un proyecto de diario de síntomas privado con consola de revisión clínica, desarrollado para el hackathon lablab.ai AMD Developer Hackathon (Track 2, Health). El adaptador es la pieza "patient-side" del sistema: su salida está pensada como entrada para la revisión de un clínico, no como diagnóstico.

El interés técnico está en que demuestra una mejora sustancial de extracción de entidades sobre el modelo base sin fine-tune (F1 de 0,693 frente a 0,356 tras aplicar el resolver de ontología) usando solo 2.392 filas sintéticas generadas con Gemma 4 31B IT. El repositorio ocupa 0,2 GB y contiene únicamente los pesos del adaptador, no el modelo completo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (modelo base `google/gemma-4-E4B-it`) |
| Parametros totales | No disponible para el adaptador (r 16, alpha 16); el modelo base no declara cifra en la información proporcionada |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (adaptador en bf16; el modelo base no se especifica) |
| Idiomas soportados | Inglés (en) e italiano (it) |
| Licencia | Gemma (sujeta a los términos de uso de Gemma) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, librería `peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre las capas de atención y MLP del modelo de lenguaje del base Gemma 4 E4B IT, dejando intactas las torres de visión y audio (lo que confirma que el modelo base es multimodal, aunque este adaptador solo se entrena y evalúa para texto). La configuración LoRA es r 16, alpha 16, dropout 0,05, learning rate 2e-4 y 3 épocas en bf16. El checkpoint final se eligió por F1 de validación tras aplicar el resolver de ontología, dentro de un barrido sobre r 16/32 y learning rate 1e-4/2e-4.

Los datos de entrenamiento son 2.392 filas sintéticas del dataset `m0rtyddd/clario-synth-v3`, diarios escritos por Gemma 4 31B IT a través de la API AMD Token Factory, con etiquetas gold por construcción. No se empleó ningún dato real de pacientes. El entrenamiento se ejecutó en una única NVIDIA L40S en Modal. En inferencia debe reutilizarse exactamente el mismo system prompt que en entrenamiento (`train/prompt.py` del repositorio), con el diario como único turno de usuario.

## Capacidades

- Extracción de entidades clínicas (síntomas, signos) desde texto libre en inglés e italiano.
- Salida en JSON estructurado, con el término extraído y las palabras literales del texto original que lo justifican (trazabilidad de la extracción).
- Mapeo de cada término al Human Phenotype Ontology (HPO).
- Detección de negación, antecedentes familiares, severidad e indicios de inicio temporal.
- Generación de texto conversacional heredada del modelo base Gemma 4 E4B IT.
- Capacidad multimodal latente del modelo base (visión y audio), no entrenada ni evaluada en este adaptador.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking): no disponible en la información proporcionada.

## Casos de uso

- Diario de síntomas para pacientes: el modelo convierte una nota libre ("desde el martes noto presión en el pecho, mi padre tuvo lo mismo") en entradas estructuradas listas para la consola de revisión clínica, que es el caso de uso original de Clario.
- Triaje previo a consulta: la app puede agrupar los términos HPO detectados y enviar al clínico solo los que el sistema marca como dudosos, reduciendo el tiempo de lectura de notas.
- Investigación con datos sintéticos: sirve como generador etiquetado para aumentar corpus de notas clínicas sin utilizar datos reales de pacientes.
- Normalización terminológica: conversión de vocabulario coloquial de síntomas a códigos HPO, útil para armonizar cuestionarios de salud entre inglés e italiano.
- Extracción de antecedentes familiares: la anotación específica de historia familiar permite poblar campos de antecedentes en historiales estructurados.
- Etiquetado asistido en pipelines de anotación: el JSON con offsets textuales permite que un revisor humano valide extracciones de forma rápida en lugar de leer el documento completo.
- Evaluación comparativa de LLM en extracción de información biomédica: con resultados publicados y ficheros de evaluación en el repositorio, sirve como línea base reproducible para tareas de IE clínica.

## Benchmarks y rendimiento

Entity F1 sobre 100 filas sintéticas retenidas del split de test de `clario-synth-v3`. La columna "after resolver" aplica la comprobación de ontología de Clario (`clario.extract.resolve_hpo`) a la salida de cada modelo antes de puntuar.

| Modelo | F1 after resolver | F1 bruto |
|---|---|---|
| Este adaptador sobre Gemma 4 E4B (vLLM) | 0,693 | 0,607 |
| Gemma 4 31B IT (AMD Token Factory) | 0,471 | 0,048 |
| Gemma 4 E4B IT sin fine-tune | 0,356 | 0,002 |

No se han publicado otros resultados (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador pesa 0,2 GB, pero requiere cargar el modelo base completo. Cifra exacta no disponible; para un modelo de la clase E4B en bf16 el orden de magnitud es de 8-10 GB, y en cuantización de 4 bits alrededor de 3-4 GB (estimación, no confirmada en la información proporcionada).
- GPU recomendadas: el autor entrenó en una NVIDIA L40S (48 GB) y sirvió con vLLM. Para inferencia del adaptador fusionado basta una GPU con VRAM suficiente para el base; no se documentan cifras de latencia ni throughput.
- GPU de consumo: previsiblemente viable en RTX 4090 (24 GB) y en tarjetas de 12-16 GB con cuantización, aunque no hay confirmación en la documentación.
- Despliegue: `transformers` + `peft` para uso directo; vLLM tras fusionar el adaptador en los pesos base (procedimiento usado en la demo de Clario). Soporte de llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 after resolver (test clario-synth-v3) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clario Gemma 4 E4B LoRA (este) | Adaptador LoRA r 16 sobre base E4B | No disponible | 0,693 | Gemma | HuggingFace (seawer/clario-gemma-4-e4b-lora) |
| Gemma 4 E4B IT sin fine-tune | Base E4B | No disponible | 0,356 | Gemma | HuggingFace (google/gemma-4-E4B-it) |
| Gemma 4 31B IT (AMD Token Factory) | 31B (según nombre) | No disponible | 0,471 | Gemma | API AMD Token Factory |

El resultado relevante es que un adaptador pequeño sobre un modelo de clase 4B supera a un modelo de 31B en esta tarea concreta (0,693 frente a 0,471), y multiplica por casi dos el F1 del base sin fine-tune. Modelos comparables de extracción clínica con HPO: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente con diarios sintéticos; el texto real de pacientes diferirá en estilo, errores ortográficos y abreviaturas.
- Solo inglés e italiano; no se ha validado ningún otro idioma.
- Cada término extraído requiere revisión humana; el propio autor indica que la app envía los términos dudosos al clínico.
- No es un dispositivo médico ni produce diagnósticos; el uso como tal está fuera de su propósito declarado.
- Uso sujeto a los términos de uso de Gemma, con las restricciones que estos imponen para uso comercial y redistribución.
- No hay información sobre sesgos demográficos ni sobre calibración en poblaciones distintas de la distribución sintética.
- Riesgo de alucinación de términos HPO no presentes en el texto: mitigado parcialmente por el resolver de ontología y por la obligación de citar las palabras originales, pero no eliminado.
- El adaptador solo cubre el módulo de texto; no se ha entrenado para visión ni audio pese a que el base sea multimodal.
- El prompt de sistema debe replicarse exactamente al inferir; desviarse de él puede degradar la calidad de forma no documentada.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/seawer/clario-gemma-4-e4b-lora
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/m0rtyddd/clario-synth-v3
- Repositorio del proyecto Clario: https://github.com/akirykouski/clario-amd
- Hackathon: lablab.ai AMD Developer Hackathon, Track 2 (Health)
