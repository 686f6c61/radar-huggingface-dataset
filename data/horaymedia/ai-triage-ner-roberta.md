# HoraYMedia/ai-triage-ner-roberta

## Resumen

AI-Triage NER es un modelo de reconocimiento de entidades nombradas (NER) especializado en el dominio clínico en español, desarrollado por HoraYMedia como componente del prototipo AI-Triage, una plataforma de apoyo al triaje por voz presentada como trabajo de grado en la Universidad del Valle (Colombia). El modelo detecta tres tipos de entidad —síntomas, enfermedades y fármacos— en relatos de consultas de urgencias tal como llegan de un reconocedor de voz, y está pensado para alimentar un pipeline posterior que combina un catálogo terminológico, reglas del protocolo de triaje y un LLM, con revisión final por parte de un profesional sanitario.

Arquitectura transformer encoder de tipo RoBERTa en su variante biomedical-clinical para español, con 125.392.903 parámetros totales y un tamaño de repositorio de 0,5 GB. Se construye mediante ajuste fino en dos etapas sobre el modelo base PlanTL-GOB-ES/roberta-base-biomedical-clinical-es: primero con corpus clínicos anotados del Barcelona Supercomputing Center (SympTEMIST, DisTEMIST y DrugTEMIST) y después con 150 relatos de triaje transcritos y anotados por el propio equipo.

Es relevante porque aborda un nicho poco cubierto: la extracción de entidades clínicas sobre texto procedente de ASR (reconocimiento automático del habla) en español, con un esquema BIO reducido y orientado a la triage de urgencias. No obstante, es un prototipo de investigación, no un dispositivo médico, con un corpus de adaptación pequeño y sintético, y con métricas que muestran una brecha notable entre F1 exacta (0,777 micro) y F1 parcial (0,917 micro), lo que indica que la mayor parte del error restante es de delimitación de spans más que de detección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base, variante biomedical-clinical para español) |
| Parametros totales | 125.392.903 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud de entrenamiento; no se documenta extensión adicional) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Español (variante colombiana en el corpus de adaptación) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder RoBERTa base adaptado al dominio biomédico y clínico en español, inicializado desde PlanTL-GOB-ES/roberta-base-biomedical-clinical-es. Sobre esa base se aplica una cabeza de clasificación de tokens (token-classification) con el esquema BIO de siete etiquetas: `O`, `B-SINTOMA`, `I-SINTOMA`, `B-ENFERMEDAD`, `I-ENFERMEDAD`, `B-FARMACO`, `I-FARMACO`.

El ajuste fino se realiza en dos etapas. La etapa 1 utiliza 1.000 documentos de casos clínicos (900 de entrenamiento y 100 de validación) que fusionan tres corpus anotados del BSC: SympTEMIST para síntomas, DisTEMIST para enfermedades y DrugTEMIST para fármacos; cuando dos anotaciones se solapan se conserva una sola. Se entrena durante 10 épocas con lr 5e-5, lote 16 y ventanas de 512 tokens con stride 128. La etapa 2 adapta el modelo al habla de urgencias con 150 relatos de triaje transcritos (split dev del corpus propio), durante 20 épocas con lr 3e-5 y lote 8; la configuración se eligió mediante validación cruzada de 5 particiones entre 10, 20 y 30 épocas. Semilla 42, entrenamiento el 2026-10-17 en una GPU T4 con transformers 5.18 y torch 2.11. No se documenta uso de RLHF ni DPO; se trata de un ajuste supervisado clásico de NER.

## Capacidades

- Reconocimiento de entidades nombradas en español clínico con tres tipos: síntomas y signos, enfermedades y lesiones, y fármacos y alergias a fármacos.
- Extracción de menciones sobre texto procedente de reconocimiento de voz (ASR), incluyendo formulaciones coloquiales del español de Colombia.
- Etiquetado a nivel de subpalabra con esquema BIO, apto para postprocesado de spans (extensión a palabras completas, descarte de menciones formadas solo por palabras funcionales).
- Integración en pipelines de triaje como extractor de menciones previo a reglas del protocolo y a un LLM.
- Capacidad multilingüe: no disponible; el modelo está entrenado y evaluado únicamente en español.
- Tool calling / function calling: no disponible (no es una capacidad del modelo).
- Soporte de agentes y razonamiento multi-step: no disponible (modelo discriminativo de extracción, no generativo).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Preprocesado de transcripciones de urgencias: el modelo recibe el texto devuelto por un ASR y extrae síntomas, enfermedades y fármacos para alimentar un catálogo terminológico y reglas del protocolo de triaje, reduciendo el texto libre a menciones estructuradas antes de la fase de decisión.
- Enriquecimiento de historiales clínicos escritos: sobre notas de casos clínicos en español, el modelo alcanza 0,693 de F1 micro exacta en validación de la etapa 1, por lo que puede usarse para poblar índices de problemas, antecedentes y medicación a partir de texto narrativo.
- Detección de alergias a fármacos en el relato del paciente: la clase FARMACO es la más fiable del modelo (F1 exacta 0,945 ± 0,050 en validación cruzada), lo que permite señalizar menciones como «alérgico a la penicilina» para revisión humana prioritaria.
- Construcción de datasets clínicos anotados de forma asistida: el modelo puede preanotar corpus en español para que anotadores humanos corrijan, aprovechando la alta F1 parcial (0,917 micro) para reducir el coste de etiquetado inicial.
- Monitorización de motivos de consulta en servicios de urgencias: agregación de menciones de síntomas y diagnósticos sobre lotes de transcripciones para análisis de demanda asistencial, siempre con revisión profesional y sin uso asistencial directo.
- Investigación en NER clínico en español: como punto de partida para experimentos de adaptación al dominio del habla, comparación de esquemas de etiquetado o evaluación de estrategias de delimitación de spans, dado que el modelo y su receta de entrenamiento están documentados.
- Componente de demostración en prototipos de triaje por voz: integrado en el pipeline AI-Triage como primera etapa de extracción, con salida revisada por un profesional y sin valor de decisión clínica.

## Benchmarks y rendimiento

Validación cruzada de 5 particiones sobre los 150 relatos de triaje (etapa 2), media ± desviación, métricas por span:

| Entidad | F1 exacta | F1 parcial |
|---|---|---|
| SINTOMA | 0,807 ± 0,052 | 0,935 ± 0,014 |
| ENFERMEDAD | 0,585 ± 0,190 | 0,833 ± 0,113 |
| FARMACO | 0,945 ± 0,050 | 0,945 ± 0,050 |
| Micro | 0,777 ± 0,055 | 0,917 ± 0,032 |

Referencias comparativas publicadas por el autor:

| Configuración | F1 micro exacta | F1 micro parcial |
|---|---|---|
| Etapa 1 sin adaptar (sobre relatos de triaje) | 0,482 | 0,818 |
| Etapa 1 en validación sobre casos clínicos escritos | 0,693 | 0,828 |
| Etapa 2 (modelo final) sobre relatos de triaje | 0,777 | 0,917 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 para los pesos (125 M de parámetros); en fp16 alrededor de 0,25 GB. El consumo real depende del tamaño de lote y de la longitud de secuencia (hasta 512 tokens).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en fp32; una NVIDIA T4 fue la unidad usada para el entrenamiento.
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1650, RTX 3050, RTX 4060 o superiores; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: pipeline de transformers, TorchScript/ONNX para servir, y endpoints compatibles con la API de Hugging Face (el repo está marcado como endpoints_compatible). No se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HoraYMedia/ai-triage-ner-roberta | 125,4 M | 512 tokens | NER clínico español (síntoma, enfermedad, fármaco) | Apache-2.0 | Hugging Face |
| PlanTL-GOB-ES/roberta-base-biomedical-clinical-es | no disponible en la información | no disponible en la información | Modelo base biomedical-clinical español (MLM) | no disponible en la información | Hugging Face |
| Modelos NER clínicos en español de BSC (SympTEMIST, DisTEMIST, DrugTEMIST) | no disponible en la información | no disponible en la información | NER de síntomas, enfermedades y fármacos sobre corpus escritos | no disponible en la información | Hugging Face / Zenodo |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada; la única comparación numérica publicada es la del propio autor entre la etapa 1 sin adaptar y la etapa 2 sobre los relatos de triaje.

## Limitaciones y advertencias

- No es un dispositivo médico ni está validado clínicamente; no debe usarse para tomar decisiones asistenciales.
- El corpus de adaptación al habla (etapa 2) es sintético y pequeño: 150 relatos escritos por el equipo imitando consultas reales, no transcripciones de pacientes, y el acuerdo entre anotadores aún no se ha medido.
- Desfase de dominio: el habla real de urgencias (ruido, interrupciones, errores del ASR, coloquialismos regionales) puede rendir peor que los relatos de validación.
- Errores de delimitación de spans: la F1 exacta (0,777 micro) es muy inferior a la parcial (0,917 micro), por lo que se requiere postprocesado de extensión a palabras completas y revisión de límites.
- La clase ENFERMEDAD es la menos estable (F1 exacta 0,585 ± 0,190) por escasez de ejemplos por partición.
- No detecta negación: «Niega fiebre» se etiqueta como SINTOMA; es necesario aplicar una regla externa tipo NegEx.
- Sesgo dialectal: los coloquialismos del corpus propio son colombianos; el rendimiento en otras variantes del español puede diferir.
- El split test del corpus propio está reservado para la evaluación final de la tesis y no se ha usado para entrenar ni para elegir la configuración, por lo que las cifras publicadas son de validación cruzada, no de test independiente.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y de menciones espurias sobre texto ruidoso.
- Restricciones de licencia: el modelo es Apache-2.0, pero los corpus de la etapa 1 (SympTEMIST, DisTEMIST, DrugTEMIST) están bajo CC BY 4.0 y exigen atribución a sus autores.
- Incompatibilidad potencial de tokenizer: el `tokenizer.json` se generó con transformers 5 y puede no cargar en versiones 4.x; en ese caso hay que construir `RobertaTokenizerFast` desde `vocab.json` y `merges.txt`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HoraYMedia/ai-triage-ner-roberta
- Modelo base: https://huggingface.co/PlanTL-GOB-ES/roberta-base-biomedical-clinical-es
- SympTEMIST (Zenodo): https://doi.org/10.5281/zenodo.10635215
- DisTEMIST: referencia incompleta en la información proporcionada (Miranda-Escalada, A., Farré, E., Gasco, L., Lima, S., & Krallinger, M., 2022)
- DrugTEMIST: no disponible enlace en la información proporcionada
- Paper, blog o demo del proyecto AI-Triage: no disponible en la información proporcionada
