# kim-a-chen/judge-editor-qwen2.5-3b-sap

## Resumen

Judge-Editor es un adaptador LoRA sobre Qwen2.5-3B-Instruct desarrollado por Kim Chen (con Niha Malhotra y Kevin Pradjinata) en el marco de un proyecto capstone del programa MIDS DATASCI 210 de Berkeley (otoño de 2026). Su funcion es corregir la salida de un sistema de reconocimiento automatico del habla (ASR) cuando el hablante presenta disartria, un trastorno neuromotor que degrada la articulacion y dispara las tasas de error de los transcriptores convencionales.

El modelo recibe las cinco mejores hipotesis que el reconocedor ha generado para un mismo enunciado y devuelve una unica transcripcion: o bien una de las hipotesis si alguna es correcta, o bien una reescritura limitada a los tramos en los que las hipotesis discrepan. No es un modelo de ASR, sino una capa de correccion posterior que se apoya en el consenso y el disenso entre candidatos para localizar los segmentos inciertos.

La relevancia practica esta en el enfoque: en lugar de generar libremente, el adaptador se usa como reranker, puntuando con log-probabilidad media por token tanto las hipotesis del reconocedor como su propia respuesta. Segun la model card, este modo introduce aproximadamente la mitad de errores de significado que la generacion libre. El adaptador es pequeno (0,1 GB), se entrena en unas 2,8 horas sobre una sola T4 y esta pensado exclusivamente para investigacion no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) con adaptador LoRA |
| Parametros totales | 3B en el modelo base; el adaptador LoRA ocupa 0,1 GB (rank 16 sobre todas las capas lineales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de longitud maxima durante el entrenamiento; el contexto nativo del base Qwen2.5-3B-Instruct no se detalla en la informacion disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-research (uso no comercial, mismos terminos que el modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only de 3.000 millones de parametros. El entrenamiento usa LoRA con rank 16, alpha 32, dropout 0,05 y se aplica a todas las capas lineales del modelo base. Se realiza una sola epoca con tasa de aprendizaje 2e-4, tamano de lote efectivo 16, longitud maxima de 512 tokens y calculo de la perdida unicamente sobre la respuesta (no sobre el prompt).

Los datos proceden del split de entrenamiento del dataset SAP-Hypo5: 31.123 enunciados con listas de cinco mejores hipotesis generadas por un Whisper large-v2 afinado sobre habla del Speech Accessibility Project, junto con sus referencias. Se anaden 311 filas de "word salad" cuyo objetivo es una linea vacia, pensadas para ensenar al modelo a declinar cuando las hipotesis no son inteligibles. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

La innovacion tecnica principal no esta en la arquitectura sino en el modo de inferencia: el adaptador se emplea como reranker. El modelo genera una respuesta y despues se puntuan con la log-probabilidad media por token, condicionada al prompt, tanto las candidatas del reconocedor como la respuesta generada; se devuelve la mejor puntuada. Este esquema reduce a la mitad los errores de significado respecto a la generacion libre.

## Capacidades

- Correccion de transcripciones ASR a partir de listas de cinco hipotesis, preservando los tramos en los que las hipotesis coinciden.
- Reescritura selectiva de los segmentos inciertos sin anadir contenido nuevo.
- Reranking de candidatas mediante puntuacion por log-probabilidad media por token.
- Deteccion (parcial) de habla no inteligible, con objetivo de devolver linea vacia.
- Generacion de texto conversacional heredada del modelo base Qwen2.5-3B-Instruct.
- Procesamiento de ingles unicamente, orientado a habla leida y con pautas, de unos cuatro palabras o mas por enunciado.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Correccion de transcripciones para hablantes con disartria: el adaptador recibe las cinco hipotesis de Whisper y devuelve una transcripcion corregida, reduciendo la tasa de error de palabras de 13,6 a 12,2 en el conjunto de test de SAP-Hypo5 cuando se aplica a todos los enunciados.
- Capa de postprocesado en pipelines ASR accesibles: integrado detras de una compuerta que decide que enunciados corregir, a 80% de cobertura reduce en 4,2 puntos porcentuales los transcriptos entregados con error de significado respecto a la compuerta sola.
- Sistemas de subtitulado y notas de reunion para personas con trastornos del habla: el modelo preserva los tramos consensuados entre hipotesis y solo reescribe los inciertos, lo que limita las inserciones de contenido ajeno.
- Investigacion en correccion de ASR: sirve como linea base reproducible para experimentos sobre reranking de hipotesis y entrenamiento de correctores especificos de reconocedor.
- Filtrado de enunciados no inteligibles: aunque en la practica no devolvio lineas vacias en test, el entrenamiento con 311 filas de word salad documenta la intencion de usar el modelo como discriminador de calidad.
- Evaluacion comparativa de reconocedores: al puntuar hipotesis con log-probabilidad, permite ordenar candidatas de distintos sistemas ASR sobre el mismo enunciado en entornos de investigacion.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| WER en test SAP-Hypo5 (2.647 enunciados, 100 hablantes), aplicado a todos los enunciados | 13,6 a 12,2 |
| Error de significado eliminado | 6,2% de las transcripciones |
| Error de significado introducido | 1,5% de las transcripciones |
| Reduccion de transcriptos con error de significado tras la compuerta, a 80% de cobertura | 4,2 puntos (intervalo 3,0 a 5,5) |
| TORGO con Whisper large-v2 sin reentrenar, aplicado a todo | neutral |
| TORGO con Whisper afinado en SAP, aplicado a todo | mas errores de significado introducidos que eliminados |
| TORGO con compuerta, en ambos reconocedores | neutral |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; las metricas anteriores son especificas de la tarea de correccion ASR.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 0,1 GB; el modelo base Qwen2.5-3B-Instruct en fp16 requiere aproximadamente 6-7 GB, y en cuantizacion de 4 bits alrededor de 2-3 GB (estimacion orientativa, no confirmada en la model card).
- GPU recomendadas: el entrenamiento se realizo en una sola NVIDIA T4 (unas 2,8 horas); para inferencia basta una GPU consumer con 8 GB o mas, como RTX 3060, RTX 4060 Ti o RTX 4090.
- Cabe en GPU consumer: si, con el modelo base cuantizado o en fp16 en tarjetas de 8 GB o superiores.
- Opciones de despliegue: transformers con PEFT (el snippet de la model card usa `PeftModel.from_pretrained`); vLLM, llama.cpp, Ollama y TGI son viables con el modelo base fusionado, aunque no se documentan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Judge-Editor (este) | 3B + LoRA | 512 en entrenamiento | Correccion ASR sobre listas de 5 hipotesis | qwen-research (no comercial) | Hugging Face, 0 descargas |
| Qwen2.5-3B-Instruct | 3B | no disponible en esta ficha | Generacion de texto general | qwen-research | Hugging Face, ampliamente usado |
| Whisper large-v2 | 1.550M | 30 s de audio | ASR directo | MIT (segun publicacion de OpenAI) | Hugging Face, muy extendido |
| Correctores ASR genericos sobre LLM | variable | variable | Reescritura de transcripciones | variable | no disponible |

La comparacion directa con otros correctores especificos de disartria no esta disponible en la informacion proporcionada. Frente a Whisper, la diferencia es de funcion: Whisper transcribe audio y Judge-Editor opera sobre texto ya reconocido.

## Limitaciones y advertencias

- No generaliza a otro reconocedor ni a otro corpus: sobre TORGO, sin reentrenar, fue neutral con Whisper large-v2 original y introdujo mas errores de significado de los que elimino con el Whisper afinado en SAP cuando se aplico a todos los enunciados.
- Entrenado y evaluado solo con ingles, habla leida y con pautas, y enunciados de aproximadamente cuatro palabras o mas; no se probaron palabras sueltas ni comandos muy cortos.
- SAP-Hypo5 no incluye etiquetas de severidad clinica, por lo que no hay resultados desglosados por gravedad de la disartria.
- No devolvio ninguna linea vacia en el conjunto de test, asi que no debe confiarse en el para rechazar enunciados no inteligibles.
- Licencia qwen-research: uso exclusivamente de investigacion y no comercial, con los mismos terminos que Qwen2.5-3B-Instruct.
- Es un prototipo de investigacion sin validacion con usuarios reales; no es un producto.
- Riesgo de alucinacion mitigado parcialmente por el modo reranker, pero la generacion libre duplica los errores de significado respecto a ese modo.
- Sesgos: no documentados en la informacion disponible; al depender de SAP-Hypo5, hereda las caracteristicas demograficas y de grabacion de ese corpus.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/kim-a-chen/judge-editor-qwen2.5-3b-sap
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Dataset SAP-Hypo5: https://huggingface.co/datasets/xiuwenz2/SAP-Hypo5
- Repositorio del proyecto (rama `demo`): https://github.com/kim-a-chen/capstone-fall-2026
- Speech Accessibility Project: no disponible enlace directo en la informacion proporcionada
