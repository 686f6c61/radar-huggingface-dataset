# SoldaLabs/rizzo-pii-0.3B-onnx

## Resumen

rizzo-pii-0.3B-onnx es la conversion a formato ONNX del modelo rizzoaiacademy/rizzo-pii-0.3B, desarrollado originalmente por Simone Rizzo (Rizzo AI Academy) para la deteccion de datos personales en texto en italiano. Este repositorio, mantenido por SoldaLabs, no introduce cambios en los pesos mas alla de la conversion y una cuantizacion parcial, y su objetivo es permitir la inferencia en CPU sin dependencia de PyTorch, usando unicamente ONNX Runtime. El modelo resuelve la tarea de token classification (NER orientado a PII) sobre 22 categorias de datos personales, incluyendo nombres, codice fiscale, partita IVA, datos catastrales, direcciones y numeros de telefono.

La arquitectura subyacente es ModernBERT (concretamente, el modelo base jhu-clsp/mmBERT-base, multilingue y con licencia MIT), con aproximadamente 0,3B de parametros. El modelo esta especializado exclusivamente en italiano y su contexto efectivo viene determinado por la configuracion de ModernBERT del modelo base. La relevancia actual radica en su uso practico para anonimizacion local y reversible de texto juridico italiano: la conversion ONNX permite ejecutarlo en entornos sin GPU y sin PyTorch, lo que facilita su integracion en herramientas de escritorio o pipelines de servidor con recursos limitados.

El repositorio tiene un tamano de 0,7 GB y fue creado el 5 de noviembre de 2026. La calidad declarada por el autor de la conversion es de micro F1 0,9886 sobre las 7.000 frases del conjunto de validacion real del dataset original, frente al 0,9887 declarado para la version v1.5.0 original, lo que indica una perdida practicamente nula por la conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (modelo base jhu-clsp/mmBERT-base) |
| Parametros totales | ~0,3B (segun nombre del modelo; no se detalla cifra exacta en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la informacion proporcionada; depende de la configuracion de ModernBERT del modelo base) |
| Tipos de cuantizacion | Solo la tabla de embeddings de palabras cuantizada a int8 (quantize_dynamic sobre el nodo Gather); el resto de pesos y calculos en fp32 |
| Idiomas soportados | Italiano (it) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx, opset 18, batch y longitud de secuencia dinamicos) |

## Arquitectura y entrenamiento

El modelo original se basa en ModernBERT, en concreto en jhu-clsp/mmBERT-base, un transformer encoder multilingue con licencia MIT. La tarea es token classification con 22 etiquetas de datos personales definidas en el `id2label` del `config.json`. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card remite a la model card original para esos datos. El dataset asociado es rizzoaiacademy/rizzo-pii-it-dataset, del que se menciona el fichero `validation/validation_real.jsonl` con 7.000 frases.

La innovacion tecnica de este repositorio es la conversion a ONNX: exportacion con `torch.onnx.export` (opset 18) manteniendo batch y longitud de secuencia dinamicos, con una diferencia maxima de 0,0001 respecto a PyTorch y el 100% de etiquetas identicas. Se aplico cuantizacion dinamica int8 unicamente a la tabla de embeddings de palabras (nodo Gather), reduciendo el tamano de 1.231 MB a 641 MB sin perdida de calidad; la cuantizacion int8 completa se descarto porque reducia el recall. El tokenizer y el config son los ficheros originales sin modificar.

## Capacidades

- Deteccion de entidades de datos personales (PII) en texto italiano: 22 categorias, entre ellas nombres, codice fiscale, partita IVA, datos catastrales, direcciones y numeros de telefono.
- Token classification con salida de logits por token; la primera salida del grafo ONNX son los logits por token.
- Entrada con `input_ids` y `attention_mask` (int64), con batch y longitud de secuencia dinamicos.
- Ejecucion en CPU pura mediante ONNX Runtime, sin PyTorch.
- Soporte de anonimizacion reversible segun el proposito declarado del modelo original (anonimizacion local y reversible de texto juridico italiano).
- Capacidades multilingues: no, el modelo esta especializado exclusivamente en italiano.
- Tool calling / function calling: no disponible; el modelo es un encoder de token classification, no genera texto.
- Agentes y razonamiento multi-paso: no aplicable a esta arquitectura y tarea.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Anonimizacion de documentos juridicos italianos: el modelo detecta codice fiscale, partita IVA, datos catastrales y direcciones en contratos y expedientes, permitiendo sustituirlos antes de compartir el documento; es adecuado por su especializacion en las 22 categorias del dominio legal italiano.
- Herramienta de escritorio "Anonimizza" de OFFice (Solda Labs): integracion directa en una aplicacion que corre en CPU sin PyTorch, gracias al formato ONNX y a la cuantizacion parcial que reduce el tamano a 641 MB.
- Preprocesado de textos para cumplimiento de proteccion de datos: deteccion de PII antes de almacenar o enviar texto a servicios externos, con verificacion humana posterior dado que el autor advierte de posibles omisiones o falsos positivos.
- Enmascarado en pipelines de servidor sin GPU: el grafo ONNX con batch dinamico permite procesar lotes de frases en entornos de CPU, usando ONNX Runtime como unico runtime.
- Construccion de un corpus pseudonimizado para investigacion: el modelo etiqueta las entidades y permite sustituirlas de forma reversible, manteniendo la coherencia del texto juridico en italiano.
- Filtrado y clasificacion previa en sistemas de gestion documental: deteccion automatica de documentos que contienen datos personales para enrutarlos a un flujo de tratamiento especifico.
- Evaluacion y auditoria de modelos PII: al replicar el comportamiento del original con micro F1 0,9886, sirve como referencia de calidad en pruebas de regresion de sistemas de anonimizacion.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia |
|---|---|---|
| Micro F1 (validation_real.jsonl, 7.000 frases) | 0,9886 | Original v1.5.0: 0,9887 |
| Precision (mismo conjunto) | 0,9874 | no disponible para el original |
| Recall (mismo conjunto) | 0,9899 | no disponible para el original |
| Diferencia maxima respecto a PyTorch | 0,0001 | Conversion ONNX |
| Coincidencia de etiquetas respecto a PyTorch | 100% | Conversion ONNX |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K; el modelo es un encoder de token classification y esos benchmarks no aplican a su tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal; el modelo esta disenado para ejecutarse en CPU con ONNX Runtime. En GPU, el peso del fichero es de 641 MB (fp32 con embeddings int8), por lo que la memoria necesaria es del orden de 1 GB o menos.
- GPU recomendadas: no se especifican en la informacion disponible; al ser un modelo de 0,3B, cualquier GPU consumer moderna es suficiente si se desea aceleracion.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer actual, dado el tamano del modelo.
- Opciones de despliegue: ONNX Runtime (runtime previsto por el autor); no se mencionan vLLM, llama.cpp, Ollama ni TGI, y no aplican al formato ONNX de token classification.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| SoldaLabs/rizzo-pii-0.3B-onnx | ~0,3B | no disponible | PII en italiano (22 categorias) | MIT | ONNX |
| rizzoaiacademy/rizzo-pii-0.3B (original) | ~0,3B | no disponible | PII en italiano (22 categorias) | MIT | PyTorch (safetensors, presumiblemente) |
| jhu-clsp/mmBERT-base (base) | no disponible | no disponible | Modelo base multilingue | MIT | no disponible |

La informacion disponible no incluye otros modelos comparables de deteccion de PII en italiano con los que establecer una comparacion de rendimiento; los datos de benchmarks de terceros no estan disponibles.

## Limitaciones y advertencias

- La deteccion automatica puede omitir datos personales o marcar texto que no lo es; el autor recomienda revisar siempre el resultado antes de usarlo en produccion.
- El modelo esta especializado exclusivamente en italiano; no debe esperarse un rendimiento fiable en otros idiomas.
- La cuantizacion int8 completa se descarto por perdida de recall; solo los embeddings estan en int8, por lo que el resto del calculo es fp32 y el consumo de CPU puede ser mayor que en un modelo totalmente cuantizado.
- No se detallan en la informacion disponible sesgos conocidos del modelo original ni riesgos especificos de alucinacion (no aplica en sentido estricto a un encoder de clasificacion, pero si el riesgo de falsos positivos y negativos en la deteccion).
- La licencia MIT permite uso comercial, pero se debe conservar el aviso de copyright original (MIT (c) 2026 Simone Rizzo - Rizzo AI Academy) y el fichero LICENSE.
- El repositorio es una copia convertida; cualquier cambio de comportamiento respecto al original debe contrastarse con la model card original, que contiene los datos de entrenamiento, categorias y uso previsto.
- No se especifica la longitud de contexto soportada; para textos juridicos largos habra que segmentar y verificar el comportamiento en los limites.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SoldaLabs/rizzo-pii-0.3B-onnx
- Modelo original: https://huggingface.co/rizzoaiacademy/rizzo-pii-0.3B
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Dataset: https://huggingface.co/datasets/rizzoaiacademy/rizzo-pii-it-dataset
