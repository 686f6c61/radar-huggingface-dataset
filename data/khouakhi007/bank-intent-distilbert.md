# Khouakhi007/bank-intent-distilbert

## Resumen

El modelo `Khouakhi007/bank-intent-distilbert` es un clasificador de intenciones para dominio bancario, desarrollado por el usuario Khouakhi007 como material didactico para el modulo *AI for Strategic Impact* de MK:U. Se trata de un fine-tuning de `distilbert-base-uncased` sobre el dataset Banking77 de PolyAI, orientado a etiquetar mensajes de clientes en una de 73 intenciones bancarias predefinidas. El contexto de aplicacion es ficticio (Fenmoor Bank), lo que refuerza su caracter de modelo de ensenanza y no de produccion.

Con 67 millones de parametros y una arquitectura transformer encoder (DistilBERT, 6 capas, 66M parametros base), el modelo es muy ligero: 0,3 GB en el repositorio y una latencia de 58 ms por mensaje en CPU, segun el autor. No es un modelo generativo ni soporta tool calling, agentes ni razonamiento multi-paso; su unica funcion es la clasificacion de texto en una etiqueta unica.

Su relevancia actual es limitada fuera del aula: no tiene descargas ni likes, la model card es minima, y el propio autor advierte que no debe usarse con datos reales de clientes. Aun asi, resulta un ejemplo util de pipeline de fine-tuning de DistilBERT para clasificacion de intenciones con un dataset publico y metricas reportadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas) |
| Parametros totales | 67.009.609 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base: 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder destilado de BERT con 6 capas, 12 cabezas de atencion y 66 millones de parametros. Sobre esa base se anade una cabeza de clasificacion para 73 etiquetas (las intenciones de Banking77 excluyendo las relativas a tarjetas virtuales o desechables). El fine-tuning se realizo con el run `baseline`, learning rate 5e-05 y 3 epocas, segun la model card.

El dataset de entrenamiento es Banking77 de PolyAI (licencia CC BY 4.0), un corpus de mensajes de clientes bancarios en ingles anotados con 77 intenciones. El autor no documenta el numero exacto de ejemplos usados, la composicion del split ni si hubo aumentacion de datos. No se menciona RLHF, DPO ni ninguna innovacion tecnica adicional: es un fine-tuning supervisado estandar de clasificacion.

## Capacidades

- Clasificacion de texto en una unica etiqueta entre 73 intenciones bancarias (excluye intenciones de tarjetas virtuales o desechables).
- Deteccion de intencion en mensajes de clientes en ingles, orientada a enrutamiento o triaje.
- Inferencia en CPU con latencia reportada de 58 ms por mensaje.
- No soporta generacion de texto, tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales (vision, audio) ni modo de pensamiento.
- Multilingue: no; solo ingles.

## Casos de uso

- Triaje de tickets de soporte bancario: el modelo clasifica cada mensaje entrante en una de las 73 intenciones y permite enrutarlo al equipo o flujo adecuado, con 58 ms de latencia en CPU.
- Etiquetado automatico de conversaciones historicas: util para anotar grandes volumenes de transcripciones de atencion al cliente y construir datasets de analisis, dado su bajo coste computacional.
- Demo docente de fine-tuning: sirve como ejemplo completo de pipeline de clasificacion con DistilBERT, metricas de validacion (accuracy 0.905, macro F1 0.906) y dataset publico.
- Prototipado rapido de asistentes conversacionales: como primer clasificador de intencion antes de derivar a un LLM generativo o a un arbol de decision.
- Filtrado previo en pipelines de moderacion o priorizacion: detectar intenciones criticas (fraude, bloqueo de tarjeta) para escalar el ticket.
- Analisis de voz del cliente a pequena escala: agrupar reclamaciones por intencion para informes de calidad, siempre con datos anonimizados y no reales segun las advertencias del autor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Validation accuracy | 0.905 |
| Macro F1 | 0.906 |
| Latencia CPU | 58 ms por mensaje |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; el modelo es de clasificacion y no aplica a esos benchmarks generativos.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (67M parametros, ~268 MB de pesos); en fp16 ~134 MB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; tambien funciona en CPU.
- Cabe en consumer GPU: si, en cualquier GPU con al menos 1 GB de VRAM (GTX 1050, RTX 3050, etc.) e incluso en CPU.
- Opciones de despliegue: Hugging Face `transformers` con `pipeline("text-classification")`, ONNX Runtime, o TorchScript; no se han publicado variantes GGUF para llama.cpp ni Ollama.
- Latencia y throughput: 58 ms por mensaje en CPU segun el autor; no se reporta throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Khouakhi007/bank-intent-distilbert | 67M | no disponible | Clasificacion de intenciones bancarias (73 clases) | CC BY 4.0 | Hugging Face, 0 descargas |
| distilbert-base-uncased | 66M | 512 tokens | Modelo base generico (MLM) | Apache 2.0 | Hugging Face, ampliamente usado |
| Modelos fine-tuned en Banking77 (varios autores) | ~66-110M | 512 tokens | Clasificacion de intenciones bancarias (77 clases) | variable | Hugging Face |

No se dispone de datos de rendimiento de alternativas concretas en la informacion proporcionada para una comparacion cuantitativa; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- El autor indica explicitamente que el modelo "no sabe nada" sobre tarjetas virtuales o desechables: las intenciones correspondientes no estan incluidas.
- Solo ingles; no soporta otros idiomas.
- El autor advierte que no debe usarse con datos reales de clientes.
- Riesgo de alucinacion no aplica (no es generativo), pero si de clasificacion erronea en intenciones poco representadas; no se reportan metricas por clase.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero el contexto didactico y la falta de validacion en produccion desaconsejan su uso real.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de mantenimiento.
- No se documenta el split de validacion, la composicion exacta del dataset ni posibles sesgos demograficos o de dominio.
- Fecha de creacion inusual (2026-11-22) en los metadatos; conviene verificar la procedencia antes de reutilizarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Khouakhi007/bank-intent-distilbert
- Dataset Banking77 (PolyAI): https://huggingface.co/datasets/PolyAI/banking77
- Modelo base DistilBERT: https://huggingface.co/distilbert-base-uncased
