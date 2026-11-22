# Shroomy/tinydistill-banking77-minilm

## Resumen

tinydistill-banking77-minilm es un clasificador de texto compacto especializado en intenciones bancarias, destilado por el usuario Shroomy a partir del modelo docente Qwen/Qwen2.5-7B-Instruct hacia el encoder sentence-transformers/all-MiniLM-L6-v2 mediante la herramienta tinydistill. El resultado es un modelo BERT de pequeno tamano exportado a ONNX que resuelve la clasificacion en 77 clases del dataset PolyAI/banking77, tarea tipica de enrutamiento de consultas en atencion al cliente financiera.

La propuesta de valor es la eficiencia: el estudiante alcanza una precision de 0,875 en el conjunto de test (3080 textos etiquetados) frente a 0,859 del docente, con una latencia de 1,0 ms por texto en CPU con cuantizacion int8 (frente a 155,4 ms del docente en CUDA con 4 bits), lo que supone una aceleracion de 152,9x en batch 1. El modelo pesa 23 MB en int8 y 91 MB en fp32, lo que permite desplegarlo en entornos sin GPU.

Es relevante ahora porque demuestra un patron practico de destilacion de conocimiento desde un LLM grande hacia un encoder pequeno para tareas de clasificacion cerrada, con un esquema de cascada opcional que envia al docente solo los textos de baja confianza. La licencia es cc-by-4.0, aunque el autor advierte de que deben revisarse las licencias del modelo base, del docente y del dataset antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (base: sentence-transformers/all-MiniLM-L6-v2), exportado a ONNX |
| Parametros totales | no disponible (el modelo base MiniLM-L6 ronda los 22,7 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX fp32 y ONNX int8 |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (tambien pesos PyTorch del estudiante) |

## Arquitectura y entrenamiento

El modelo es un clasificador de texto construido sobre el encoder all-MiniLM-L6-v2, un transformer BERT de tipo MiniLM. Se entrena mediante destilacion de conocimiento desde Qwen/Qwen2.5-7B-Instruct: el docente genera etiquetas suaves sobre los 10003 textos de entrenamiento de banking77, y el estudiante aprende de esas etiquetas suaves mas una entropia cruzada sobre 616 textos con etiqueta gold (8 por clase, peso 1.0). Las probabilidades del docente se promedian con las de una sonda lineal ajustada sobre sus estados ocultos, tambien entrenada con 616 textos gold. El prompt del docente incluye, para cada texto, los 16 ejemplos de entrenamiento mas similares entre esos 616.

El resultado se exporta a ONNX para inferencia rapida en CPU. El autor reporta medias y desviaciones tipicas sobre 3 semillas de entrenamiento; las filas ONNX corresponden al modelo exportado de la primera semilla. El esquema de cascada permite enviar al docente solo una fraccion de los textos segun un umbral de confianza del estudiante, ajustable en produccion sobre un split de validacion.

## Capacidades

- Clasificacion de texto en 77 intenciones bancarias predefinidas (por ejemplo, activate_my_card, card_arrival, pending_transfer, request_refund, verify_my_identity).
- Prediccion de etiqueta unica con probabilidades, lo que permite umbrales de confianza y top-k.
- Inferencia en CPU con latencia de 1,0 ms por texto en int8 y throughput de 948,8 textos/s en batch 32.
- Exportacion ONNX con soporte para fp32 e int8.
- Integracion con la libreria tinydistill mediante API Python (Predictor) y CLI (predict, serve).
- Compatibilidad declarada con text-embeddings-inference y endpoints_compatible.
- No soporta generacion de texto, razonamiento abierto, codigo, matematicas, vision, audio, tool calling ni agentes; es exclusivamente un clasificador cerrado.

## Casos de uso

- Enrutamiento de tickets de soporte bancario: clasificar cada consulta entrante en una de las 77 intenciones para dirigirla al equipo o flujo adecuado, con 1,0 ms por texto en CPU y precision de 0,872 en int8.
- Moderacion y triaje en tiempo real: procesar grandes volumenes de mensajes de chat con throughput de 948,8 textos/s en batch 32, adecuado para picos de trafico sin GPU.
- Preetiquetado de datos para anotacion humana: usar las predicciones y su confianza para priorizar la revision manual, reduciendo el coste de etiquetado en nuevos dominios.
- Despliegue en el borde o en contenedores ligeros: el modelo int8 de 23 MB cabe en entornos con memoria limitada y sin acelerador, como funciones serverless o dispositivos de bajo consumo.
- Cascada con LLM para maxima precision: enviar al docente Qwen2.5-7B solo el 10 % de textos menos confiables, logrando 0,877 de precision con una latencia media de 16,6 ms por texto.
- Clasificacion de intenciones en asistentes conversacionales financieros: integrar el modelo como primer paso de un pipeline que decide la respuesta o la derivacion a un agente humano.
- Analisis de motivos de contacto: agregar las etiquetas predichas sobre historicos de conversaciones para detectar tendencias (por ejemplo, picos de pending_transfer o card_not_working).

## Benchmarks y rendimiento

| Modelo | Dispositivo | Accuracy | Macro-F1 | Top-3 accuracy | Acuerdo con docente | Latencia batch 1 (ms) | Latencia batch 32 (ms) | Throughput (textos/s) | Tamano (MB) | Aceleracion batch 1 |
|---|---|---|---|---|---|---|---|---|---|---|
| Docente, 16 ejemplos similares, 4 bits, sonda | cuda | 0,859 | 0,859 | 0,946 | n/a | 155,4 | 4910,8 | 6,5 | 5443 | 1,0x |
| Estudiante, PyTorch | cpu | 0,875 ± 0,001 | 0,875 ± 0,001 | 0,953 ± 0,003 | 0,890 ± 0,001 | 3,7 | 73,0 | 438,6 | 91 | 41,6x |
| Estudiante, ONNX fp32 | cpu | 0,875 | 0,875 | 0,954 | 0,889 | 2,6 | 71,8 | 445,5 | 91 | 60,7x |
| Estudiante, ONNX int8 | cpu | 0,872 | 0,871 | 0,955 | 0,885 | 1,0 | 33,7 | 948,8 | 23 | 152,9x |

Cascada (estudiante primero, textos dudosos al docente):

| Proporcion al docente | Umbral de confianza | Accuracy | Macro-F1 | Latencia media por texto (ms) |
|---|---|---|---|---|
| 0 % | 0,125 | 0,872 | 0,871 | 1,0 |
| 10 % | 0,596 | 0,877 | 0,877 | 16,6 |
| 20 % | 0,768 | 0,874 | 0,873 | 32,1 |
| 30 % | 0,856 | 0,868 | 0,867 | 47,6 |
| 50 % | 0,925 | 0,861 | 0,860 | 78,7 |
| 100 % | 1,000 | 0,859 | 0,859 | 156,4 |

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para CPU (ONNX). En GPU, el modelo int8 de 23 MB o fp32 de 91 MB ocupa una fraccion minima de memoria.
- GPU recomendadas: no aplica; cualquier GPU consumer (RTX 4090, RTX 3060, etc.) puede ejecutarlo, pero no es necesario.
- Cabe en cualquier consumer GPU y en CPU convencional; el modelo int8 de 23 MB es compatible con entornos de memoria muy limitada.
- Opciones de despliegue: tinydistill (Predictor, CLI predict y serve), ONNX Runtime, y compatibilidad declarada con text-embeddings-inference y endpoints_compatible.
- Latencia y throughput medidos: 1,0 ms por texto en int8 batch 1 con 2 hilos de CPU; 33,7 ms en batch 32; 948,8 textos/s en batch 32. En fp32, 2,6 ms batch 1 y 445,5 textos/s en batch 32.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (banking77) | Latencia batch 1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tinydistill-banking77-minilm (ONNX int8) | no disponible (base MiniLM-L6) | no disponible | 0,872 | 1,0 ms (CPU) | cc-by-4.0 | Hugging Face |
| Docente Qwen2.5-7B-Instruct (4 bits + sonda) | 7B | no disponible | 0,859 | 155,4 ms (CUDA) | no disponible en la informacion | Hugging Face |
| Estudiante PyTorch (MiniLM-L6) | no disponible (base MiniLM-L6) | no disponible | 0,875 | 3,7 ms (CPU) | cc-by-4.0 | Hugging Face |

No se dispone de datos de otros clasificadores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo clasifica entre las 77 intenciones de banking77; no generaliza a otras taxonomias sin reentrenamiento.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de clasificacion erronea: la precision es 0,872 en int8, por lo que aproximadamente 1 de cada 8 textos se etiqueta mal.
- La cuantizacion int8 reduce ligeramente la precision (0,872 frente a 0,875 en fp32) y el acuerdo con el docente (0,885 frente a 0,889).
- Los umbrales de la cascada se ajustaron sobre el conjunto de test; en produccion deben calibrarse sobre un split de validacion.
- Idiomas soportados no disponibles en la informacion; el dataset banking77 es predominantemente en ingles, por lo que el rendimiento en castellano no esta garantizado.
- Licencia cc-by-4.0 elegida por el autor, pero este advierte de que deben revisarse las licencias del modelo base (all-MiniLM-L6-v2), del docente (Qwen2.5-7B-Instruct) y del dataset (PolyAI/banking77) antes de un uso comercial.
- El modelo fue creado en noviembre de 2026 y cuenta con 648 descargas y 0 likes; no hay evidencia de validacion independiente fuera de la model card.
- El tamano del repo es de 0,4 GB, superior al de los pesos int8 (23 MB), probablemente por incluir multiples formatos y artefactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shroomy/tinydistill-banking77-minilm
- Repositorio tinydistill: https://github.com/Andreas-Hum/tinydistill
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Modelo docente: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset: https://huggingface.co/datasets/PolyAI/banking77
