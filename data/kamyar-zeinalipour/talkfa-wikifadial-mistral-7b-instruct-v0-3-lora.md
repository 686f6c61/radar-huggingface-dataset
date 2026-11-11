# Kamyar-zeinalipour/TalkFa-WikiFaDial-Mistral-7B-Instruct-v0.3-LoRA

## Resumen

TalkFa-WikiFaDial-Mistral-7B-Instruct-v0.3-LoRA es un adaptador LoRA (PEFT) sobre el modelo base Mistral-7B-Instruct-v0.3, desarrollado por Kamyar-zeinalipour y publicado en noviembre de 2026. Su proposito concreto es generar dialogos casuales de seis turnos en farsi (persa) a partir de un parrafo de Wikipedia en farsi, manteniendose fiel al contenido del parrafo y devolviendo la salida estructurada en JSON. El adaptador se entrena sobre el split Wiki-FaDial del benchmark TalkFa, un conjunto verificado humanamente para generacion y comprension de dialogo en farsi.

El modelo resuelve un problema especifico: la generacion de dialogo knowledge-grounded en un idioma de bajos recursos como el farsi, donde los modelos multilingues genericos suelen producir respuestas genericas o infieles a la fuente. Al ser un adaptador LoRA sobre un transformer denso de 7B parametros, hereda la arquitectura y la ventana de contexto de Mistral-7B-Instruct-v0.3, y anade un ajuste fino especializado en la tarea y el idioma.

Es relevante ahora porque forma parte de una familia de adaptadores TalkFa que cubren varios modelos base (desde Llama-3.2-1B hasta Mistral-Small-24B), lo que permite elegir el tamano segun el presupuesto de computo. La licencia apache-2.0 del adaptador, junto con el modelo base gated de Mistral, condiciona su uso comercial a la aceptacion de los terminos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Mistral-7B-Instruct-v0.3) con adaptador LoRA (PEFT) |
| Parametros totales | 7B (modelo base); tamano del repo del adaptador: 0,6 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | farsi (fa) |
| Licencia | apache-2.0 (adaptador); el modelo base Mistral-7B-Instruct-v0.3 es gated |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-7B-Instruct-v0.3, un transformer decoder-only denso de 7B parametros. El ajuste se realiza mediante LoRA (Low-Rank Adaptation) con la libreria PEFT, de modo que solo se entrenan las matrices de bajo rango insertadas en las capas del modelo base, mientras los pesos originales permanecen congelados. El resultado es un adaptador de 0,6 GB que puede fusionarse con el modelo base mediante `merge_and_unload()` para inferencia sin sobrecoste de latencia.

El entrenamiento se realizo sobre el split de entrenamiento de Wiki-FaDial, compuesto por 4.084 dialogos, dentro del benchmark TalkFa. La tarea consiste en, dado un parrafo de Wikipedia en farsi, generar un dialogo casual de seis turnos entre dos hablantes, fiel al parrafo y con salida en JSON. La configuracion de entrenamiento esta publicada en `configs/train_generation.json` del repositorio GitHub del proyecto. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de dialogo casual de seis turnos en farsi a partir de un parrafo fuente (knowledge-grounded dialogue).
- Fidelidad al parrafo de entrada, con salida estructurada en JSON.
- Generacion de texto en farsi con el chat template de Mistral.
- No se ha documentado soporte de tool calling ni function calling en la informacion disponible.
- No se ha documentado soporte de agentes ni razonamiento multi-paso en la informacion disponible.
- Capacidad multilingue limitada al farsi segun la model card (language: fa).
- No se documentan capacidades de vision, audio ni modo thinking.

## Casos de uso

- Generacion de datos sinteticos de dialogo en farsi: el adaptador produce dialogos de seis turnos fieles a un parrafo de Wikipedia, util para aumentar corpus de entrenamiento o evaluacion en farsi con salida JSON parseable.
- Evaluacion de fidelidad knowledge-grounded: sirve como baseline especializado para medir si un sistema de dialogo se mantiene fiel a una fuente, comparando sus salidas con las de este adaptador.
- Prototipado de asistentes conversacionales en farsi: al estar ajustado al registro casual y al idioma, genera respuestas mas naturales que el modelo base en conversaciones informales.
- Investigacion en generacion de dialogo multilingue: forma parte de una familia de adaptadores sobre distintos modelos base (1B a 24B), lo que permite estudiar el efecto del tamano del modelo en la calidad del dialogo en farsi.
- Creacion de contenido divulgativo en farsi: a partir de un articulo de Wikipedia se pueden generar conversaciones explicativas para blogs, podcasts o material educativo.
- Fine-tuning posterior: al ser un adaptador PEFT, puede servir como punto de partida para ajustes adicionales en dominios especificos del farsi sin reentrenar el modelo completo.
- Despliegue en entornos con recursos limitados: el adaptador de 0,6 GB fusionado con el base de 7B permite inferencia en una sola GPU consumer con cuantizacion, adecuado para experimentacion academica.

## Benchmarks y rendimiento

Resultados en el test set de Wiki-FaDial (100 dialogos). BERTCos es la similitud coseno de embeddings ParsBERT (bert-fa-base) con mean-pooling.

| Metrica | Base | TalkFa LoRA | Delta |
|---|---:|---:|---:|
| ROUGE-L | 0,601 | 0,683 | +0,082 |
| BLEU-4 | 0,499 | 0,614 | +0,115 |
| BERTCos | 0,895 | 0,969 | +0,074 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 7B en bfloat16 requiere aproximadamente 14-16 GB; en cuantizacion de 8 bits, unos 8 GB; en 4 bits, unos 4-5 GB. El adaptador anade un sobrecoste minimo que desaparece tras fusionarlo.
- GPU recomendadas: A100 (40/80 GB) o H100 para inferencia en bfloat16 sin cuantizar; RTX 4090 (24 GB) para bfloat16 con margen; RTX 3090/4080 (16-24 GB) para 8 bits.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090 y tarjetas con 16 GB o mas en cuantizacion de 8 bits; en 4 bits puede caber en GPUs de 8 GB.
- Opciones de despliegue: transformers con PEFT (flujo documentado en la model card), vLLM y TGI tras fusionar el adaptador; llama.cpp/Ollama requeririan conversion a GGUF del modelo fusionado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Adaptadores TalkFa de la misma tarea (Wiki-FaDial) sobre distintos modelos base:

| Modelo base | Parametros | Tarea | Licencia del adaptador |
|---|---:|---|---|
| Mistral-7B-Instruct-v0.3 (este modelo) | 7B | Generacion Wiki-FaDial | apache-2.0 |
| Llama-3.2-1B-Instruct | 1B | Generacion Wiki-FaDial | apache-2.0 |
| Llama-3.2-3B-Instruct | 3B | Generacion Wiki-FaDial | apache-2.0 |
| Llama-3.1-8B-Instruct | 8B | Generacion Wiki-FaDial | apache-2.0 |
| Mistral-Nemo-Instruct-2407 | 12B | Generacion Wiki-FaDial | apache-2.0 |
| Mistral-Small-24B-Instruct-2501 | 24B | Generacion Wiki-FaDial | apache-2.0 |

No se dispone en la informacion proporcionada de resultados comparativos de rendimiento entre estos adaptadores ni frente a modelos genericos de dialogo en farsi.

## Limitaciones y advertencias

- El adaptador esta especializado en una unica tarea (dialogo de seis turnos a partir de un parrafo de Wikipedia) y un unico idioma (farsi); su uso fuera de ese dominio puede degradar la calidad.
- Riesgo de alucinacion: aunque el objetivo es la fidelidad al parrafo, no se garantiza que todas las afirmaciones generadas esten respaldadas por la fuente.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; el entrenamiento sobre Wikipedia en farsi puede heredar sesgos de cobertura y representacion del corpus.
- El modelo base Mistral-7B-Instruct-v0.3 es gated: es necesario aceptar sus terminos y autenticarse con `huggingface-cli login` antes de usarlo.
- La licencia apache-2.0 del adaptador no exime de cumplir los terminos del modelo base para uso comercial.
- No se documentan limitaciones de contexto especificas del adaptador; la ventana efectiva es la del modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.
- El identificador arXiv 2609.01810 y las fechas de creacion (2026) deben verificarse en la fuente original antes de citarlos en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/TalkFa-WikiFaDial-Mistral-7B-Instruct-v0.3-LoRA
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Paper (arXiv): https://arxiv.org/abs/2609.01810
- Repositorio GitHub: https://github.com/KamyarZeinalipour/TalkFa
- Dataset TalkFa: https://huggingface.co/datasets/Kamyar-zeinalipour/TalkFa
- Coleccion TalkFa: https://huggingface.co/collections/Kamyar-zeinalipour/talkfa-arxiv-2026-6af47769e8cfcf8046fcb449
- Configuracion de entrenamiento: https://github.com/KamyarZeinalipour/TalkFa/blob/main/configs/train_generation.json
