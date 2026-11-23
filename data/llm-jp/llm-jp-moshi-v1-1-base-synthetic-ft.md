# llm-jp/llm-jp-moshi-v1.1-base-synthetic-ft

## Resumen

LLM-jp-Moshi-v1.1-base-synthetic-ft es un modelo de dialogo de voz full-duplex en japones desarrollado por LLM-jp, el consorcio de investigacion en modelos de lenguaje de Japon. Se trata de un checkpoint de comparacion derivado de LLM-jp-Moshi-v1.1-base, obtenido al aplicar dos epocas de ajuste adicional sobre un corpus de dialogo sintetico en japones construido internamente por LLM-jp, partiendo del mismo checkpoint de preentrenamiento J-CHAT que el modelo base.

El modelo se construye sobre la arquitectura Moshi de Kyutai Labs (concretamente sobre kyutai/moshiko-pytorch-bf16) y emplea el codec de audio Mimi para la tokenizacion de voz, junto con un tokenizador de texto SentencePiece de 32k derivado de rinna/japanese-gpt2-medium. Con aproximadamente 7.690 millones de parametros y pesos en BF16, el modelo esta disenado para conversacion de voz en tiempo real con turnos solapados, no para generacion de texto convencional.

Su relevancia es metodologica: sirve como control experimental para medir el efecto de entrenar exclusivamente con datos sinteticos (sin mezclar audio real de LLM-jp-Zoom1 en la fase de ajuste) frente al modelo v1.1-base. En las evaluaciones del proyecto, ambos obtuvieron resultados similares, aunque este checkpoint mostro menor tendencia a iniciar el turno mientras el interlocutor aun habla en el benchmark de dialogo full-duplex en japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Moshi (modelo de dialogo de voz full-duplex de Kyutai Labs) sobre base kyutai/moshiko-pytorch-bf16; codec de audio Mimi |
| Parametros totales | 7.687.729.152 (aprox. 7,69 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (distribucion en BF16 por defecto y FP32 bajo la etiqueta `fp32`) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, BF16 por defecto, aprox. 15,38 GB; variante FP32 de aprox. 30,75 GB en la revision `fp32`); tokenizador de texto SentencePiece y tokenizador de audio Mimi en safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moshi, un sistema de dialogo de voz full-duplex que combina un modelo de lenguaje con el codec neural de audio Mimi, permitiendo procesar y generar audio de forma simultanea y con turnos solapados. Los pesos se inicializan desde el checkpoint de preentrenamiento J-CHAT compartido con LLM-jp-Moshi-v1. La tokenizacion de texto emplea un SentencePiece de 32k vocabulario (procedente de rinna/japanese-gpt2-medium) y la de audio el tokenizador Mimi de kyutai/moshiko-pytorch-bf16.

El ajuste adicional se realizo durante dos epocas sobre un corpus de dialogo sintetico en japones construido por LLM-jp, compuesto por 15 topicos y 93.679 dialogos de entrenamiento; en la segunda epoca se redujo la tasa de aprendizaje a la mitad. El audio sintetico se genero con FireRedTTS-2 ajustado sobre LLM-jp-Zoom1, y algunas voces de referencia del hablante de sistema se extrajeron tambien de LLM-jp-Zoom1. Las transcripciones y marcas temporales de referencia se obtuvieron mediante ASR por turno y alineamiento CTC (denominado `turnaligned_v1`). Es importante subrayar que no se mezclo audio de dialogo real de LLM-jp-Zoom1 en la entrada de ajuste de Moshi; la calificacion "solo datos sinteticos" se refiere unicamente a esta fase de ajuste, no al preentrenamiento original de Moshi ni al preentrenamiento J-CHAT. Los detalles del corpus sintetico y del metodo de entrenamiento se publicaran mas adelante.

## Capacidades

- Dialogo de voz full-duplex en japones: procesa y genera audio de forma simultanea, permitiendo turnos solapados propios de una conversacion natural.
- Conversacion en tiempo real mediante el servidor `moshi.server` de la implementacion oficial de Kyutai, con interfaz web y acceso al microfono.
- Comprension y generacion de habla japonesa gracias al codec Mimi y al tokenizador de texto japones.
- Generacion de respuestas de texto asociadas al audio (el modelo integra un modelo de lenguaje sobre tokens de texto y audio).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explicito de agentes o razonamiento multi-paso.
- No se documenta capacidad de vision ni de audio de entrada mas alla del propio flujo de dialogo de voz.
- Capacidad multilingue limitada al japones segun la model card.

## Casos de uso

- Prototipado de asistentes de voz conversacionales en japones: el modelo permite construir un asistente que responde por voz con turnos solapados, usando `moshi.server` como punto de partida para una demo funcional.
- Investigacion en dialogo full-duplex: sirve como checkpoint de control para estudiar el impacto de entrenar solo con datos sinteticos frente a datos reales, comparandolo con LLM-jp-Moshi-v1.1-base.
- Evaluacion de calidad de voz sintetica: al haberse entrenado con audio generado por FireRedTTS-2 ajustado sobre LLM-jp-Zoom1, permite analizar como afecta la voz sintetica a la naturalidad del dialogo.
- Desarrollo de interfaces de voz para aplicaciones japonesas: integrable en entornos Linux con GPU para experimentar con interaccion por microfono en tiempo real.
- Generacion de datos de dialogo sintetico para otras tareas: el corpus y el enfoque de entrenamiento pueden servir de referencia para construir pipelines de datos conversacionales en japones.
- Investigacion academica sobre sesgos y naturalidad en modelos de voz: la model card advierte de respuestas no naturales, lo que lo hace util para estudiar fallos y deriva en dialogos largos.
- Benchmarking de latencia y solapamiento de turnos: util para medir la tendencia a iniciar el turno durante el habla del interlocutor, aspecto observado en la comparacion con v1.1-base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card indica unicamente que, en la evaluacion comparativa del proyecto, este modelo obtuvo resultados casi equivalentes a LLM-jp-Moshi-v1.1-base, y que en el benchmark de dialogo full-duplex en japones mostro menor tendencia a empezar a hablar mientras el interlocutor sigue hablando.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; la model card senala que depende del dtype y de la implementacion. Como referencia, los pesos en BF16 ocupan aproximadamente 15,38 GB, por lo que se necesita al menos esa cantidad mas el overhead del runtime.
- GPU recomendadas: no especificadas en la informacion disponible; se requiere entorno Linux con GPU. Por el tamano de pesos, GPUs de 24 GB o mas (por ejemplo, RTX 4090, A100, H100) son las candidatas naturales, aunque el autor no lo confirma.
- Cabe en GPU de consumo: probablemente en GPUs de 24 GB o superiores en BF16, aunque no esta confirmado por el autor.
- Opciones de despliegue: implementacion oficial de Moshi de Kyutai (`pip install 'moshi<=0.2.2'` y `python -m moshi.server --hf-repo llm-jp/llm-jp-moshi-v1.1-base-synthetic-ft`), con Python 3.10 o superior y entorno Linux GPU. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| llm-jp/llm-jp-moshi-v1.1-base-synthetic-ft | 7,69 mil millones | no disponible | japones | Apache 2.0 | Ajuste solo con datos sinteticos; checkpoint de comparacion |
| llm-jp/llm-jp-moshi-v1.1-base | no disponible | no disponible | japones | Apache 2.0 | Modelo base de referencia del proyecto; resultados casi equivalentes en la evaluacion del autor |
| llm-jp/llm-jp-moshi-v1 | no disponible | no disponible | japones | Apache 2.0 | Version previa; comparte checkpoint de preentrenamiento J-CHAT |
| kyutai/moshiko-pytorch-bf16 | no disponible | no disponible | japones (Moshi) | no disponible en la informacion | Modelo original de Kyutai sobre el que se construye este checkpoint |

## Limitaciones y advertencias

- Modelo en fase de prototipo segun la model card; puede producir respuestas no naturales.
- Riesgo de generar informacion erronea y de reproducir sesgos o expresiones inapropiadas presentes en los datos de entrenamiento.
- No se garantiza la calidad de respuesta en dialogos largos ni en condiciones acusticas variadas.
- El alcance linguistico documentado es unicamente el japones.
- La calificacion "solo datos sinteticos" se refiere solo a la fase de ajuste adicional, no al preentrenamiento de Moshi ni al preentrenamiento J-CHAT.
- Uso no previsto para suplantacion de identidad, fraude u otros fines maliciosos segun los terminos del autor.
- Licencia Apache 2.0, que permite uso comercial, pero el autor declina responsabilidad por cualquier dano derivado del uso.
- Requiere entorno Linux con GPU y Python 3.10 o superior para la demo interactiva; se recomienda usar auriculares para evitar eco.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llm-jp/llm-jp-moshi-v1.1-base-synthetic-ft
- Modelo base de comparacion: https://huggingface.co/llm-jp/llm-jp-moshi-v1.1-base
- Version previa: https://huggingface.co/llm-jp/llm-jp-moshi-v1
- Modelo original de Kyutai: https://huggingface.co/kyutai/moshiko-pytorch-bf16
- Implementacion oficial de Moshi (Kyutai): https://github.com/kyutai-labs/moshi/tree/main/moshi
- Dataset J-CHAT: https://huggingface.co/datasets/sarulab-speech/J-CHAT
- Tokenizador de texto de origen: https://huggingface.co/rinna/japanese-gpt2-medium
