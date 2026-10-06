# FurkanNar/gpt-2_instruct

## Resumen

GPT-2 Instruct es un ajuste fino de GPT-2 (124 millones de parametros) desarrollado por el usuario FurkanNar y publicado en HuggingFace bajo licencia MIT. El modelo parte del checkpoint base openai-community/gpt2 y se ha afinado para seguir instrucciones en formato Alpaca, utilizando como datos de entrenamiento los conjuntos SVAMP (problemas aritmeticos de enunciado) y tatsu-lab/alpaca. El objetivo declarado es disponer de una version de GPT-2 capaz de responder a instrucciones sencillas y de resolver problemas matematicos basicos de tipo word problem.

Se trata de un modelo de proposito general pequeno, orientado a experimentacion y pruebas de concepto mas que a produccion. Con 124,4 millones de parametros y un entrenamiento de solo 3 epocas con longitud maxima de secuencia de 256 tokens, sus capacidades estan claramente acotadas, especialmente en razonamiento matematico, donde el propio autor reporta una puntuacion F1 macro en validacion de 0,2857.

Su relevancia actual es la de un ejemplo accesible de ajuste fino por instrucciones sobre una arquitectura clasica (transformer decoder-only) que puede ejecutarse en hardware muy modesto, incluso en CPU, lo que lo hace util como banco de pruebas educativo y como punto de partida para experimentos de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia GPT-2) |
| Parametros totales | 124.439.808 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens en la arquitectura GPT-2 base; el entrenamiento se limito a 256 tokens |
| Tipos de cuantizacion | no se distribuyen versiones cuantizadas; pesos en safetensors (475 MB, precision fp32) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (config.json, generation_config.json, model.safetensors) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia GPT-2, con 124 millones de parametros y sin modificaciones arquitectonicas respecto al checkpoint base openai-community/gpt2. Se trata de un ajuste fino supervisado (SFT) sobre el GPT-2 original, no de un entrenamiento desde cero ni de una variante MoE o hibrida. No se menciona uso de RLHF, DPO ni tecnicas de alineacion por preferencias.

Los hiperparametros de entrenamiento reportados por el autor son: 3 epocas, batch size de 4, learning rate de 5e-5, optimizador AdamW, funcion de perdida CrossEntropyLoss con desplazamiento de tokens de 1, gradient clipping con norma maxima de 1.0 y longitud maxima de secuencia de 256 tokens. Los datos provienen de SVAMP (Simple Variants of Arithmetic Math word Problems) y de tatsu-lab/alpaca. El autor indica que existia previamente un ajuste especifico sobre SVAMP publicado en FurkanNar/gpt-2_svamp, sobre el que se basa este modelo. La inferencia se realiza con el formato Alpaca oficial. No se documenta innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto en ingles con seguimiento basico de instrucciones en formato Alpaca.
- Resolucion de problemas matematicos de enunciado sencillos, heredada del ajuste sobre SVAMP, aunque con rendimiento limitado segun el propio autor.
- Mantenimiento de contexto conversacional limitado a los ultimos 10 mensajes, segun las notas de la model card.
- Generacion configurable mediante temperature (por defecto 0.5), top_k (40), top_p (0.9) y repetition_penalty (1.2).
- Soporte de system prompt.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking).
- Capacidad multilingue: unicamente ingles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: por su tamano (124M) y su soporte de historial de los ultimos 10 mensajes, permite montar un chatbot de prueba en minutos sin apenas recursos, util para validar interfaces antes de migrar a modelos mayores.
- Educacion y docencia sobre ajuste fino: sirve como ejemplo reproducible de fine-tuning por instrucciones con formato Alpaca, ideal para cursos y tutoriales que expliquen SFT sobre GPT-2.
- Tutoria basica de problemas aritmeticos: el ajuste sobre SVAMP permite generar respuestas a enunciados matematicos simples, adecuado como demostracion, aunque con F1 macro bajo (0,2857) que desaconseja uso evaluativo real.
- Inferencia en entornos sin GPU: al requerir recursos minimos, puede ejecutarse en CPU o en dispositivos de borde para demos offline de generacion de texto.
- Generacion de texto creativo de baja exigencia: redaccion de borradores cortos, completado de frases o generacion de variaciones de texto donde no se requiere alta fidelidad.
- Base para experimentos de investigacion en eficiencia: permite comparar tecnicas de cuantizacion, destilacion o decodificacion sobre un modelo pequeno y rapido de entrenar.
- Simulacion de cargas en pipelines de despliegue: util para probar integraciones con Transformers, Text Generation Inference o endpoints compatibles sin coste de GPU elevado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta las metricas de entrenamiento y validacion por epoca:

| Epoca | Perdida de entrenamiento (media) | Perdida de validacion (media) | F1 macro en validacion |
|---|---|---|---|
| 1/3 | 0.7349 | 0.6526 | 0.2824 |
| 2/3 | 0.6583 | 0.6436 | 0.2839 |
| 3/3 | 0.6216 | 0.6411 | 0.2857 |

La perdida de entrenamiento desciende de forma sostenida, mientras que la perdida de validacion y el F1 macro apenas mejoran entre epocas, lo que sugiere un ajuste limitado y un posible estancamiento del rendimiento en la tarea objetivo.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 475 MB de pesos mas memoria de activaciones; en fp16 bajaría a unos 250 MB y en int8 a unos 125 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo esta muy por debajo de la capacidad de cualquier GPU moderna.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en iGPU y en CPU.
- Opciones de despliegue: transformers (libreria indicada), Text Generation Inference (etiqueta text-generation-inference) y endpoints compatibles. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, formato que no se distribuye.
- Latencia y throughput: no se proporcionan datos medidos. Dado el tamano de 124M de parametros, la inferencia es muy rapida en GPU y viable en CPU, aunque el autor indica que se requiere GPU CUDA para la inferencia segun su configuracion de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Ajuste por instrucciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FurkanNar/gpt-2_instruct | 124M | 1024 (entrenado a 256) | Si (formato Alpaca) | MIT | HuggingFace |
| openai-community/gpt2 | 124M | 1024 | No | MIT | HuggingFace |
| distilgpt2 | 82M | 1024 | No | Apache-2.0 | HuggingFace |
| gpt2-medium | 355M | 1024 | No | MIT | HuggingFace |

Frente al GPT-2 base, este modelo anade seguimiento de instrucciones y un ajuste sobre problemas aritmeticos, a costa de una ventana de entrenamiento mas corta (256 tokens). Frente a distilgpt2 es algo mayor pero con ajuste por instrucciones. Frente a gpt2-medium es mas pequeno y rapido, aunque con menor capacidad bruta. No se dispone de datos de benchmarks que permitan una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- Rendimiento matematico bajo: el F1 macro en validacion es de 0,2857, por lo que la resolucion de problemas aritmeticos es poco fiable.
- Alto riesgo de alucinacion: al ser un GPT-2 de 124M ajustado con pocos datos, tiende a generar contenido incorrecto o incoherente, especialmente en tareas fuera de su distribucion de entrenamiento.
- Limitacion de contexto: aunque GPT-2 admite 1024 tokens, el entrenamiento se realizo con secuencias de 256 tokens, y el historial conversacional se limita a los ultimos 10 mensajes, lo que restringe la coherencia en conversaciones largas.
- Idioma: unicamente soporta ingles; no hay capacidades multilingues documentadas.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al derivar de GPT-2, hereda los sesgos presentes en los datos de preentrenamiento originales.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion, si bien no se ofrece ninguna garantia sobre el modelo.
- Caveat de despliegue: el autor indica que se requiere GPU CUDA para la inferencia segun su configuracion, aunque tecnicamente el modelo puede ejecutarse en CPU.
- Adecuacion: no recomendado para produccion con requisitos de calidad, seguridad o trazabilidad; su uso apropiado es experimental, educativo o como prueba de concepto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FurkanNar/gpt-2_instruct
- Version previa ajustada sobre SVAMP: https://huggingface.co/FurkanNar/gpt-2_svamp
- Modelo base GPT-2: https://huggingface.co/openai-community/gpt2
- Dataset SVAMP (ChilleD/SVAMP): https://huggingface.co/datasets/ChilleD/SVAMP
- Dataset Alpaca (tatsu-lab/alpaca): https://huggingface.co/datasets/tatsu-lab/alpaca
