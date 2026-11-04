# DJF-on-arm/Iamam1

## Resumen

IAMAM1 es un modelo de generacion de texto de pequeno tamano desarrollado por DJF-on-arm, construido sobre una arquitectura de LSTM bidireccional con atencion implementada en Keras/TensorFlow. Se trata de un experimento de modelado de lenguaje que se aparta deliberadamente del paradigma Transformer dominante, apostando por redes recurrentes con atencion como alternativa para tareas de generacion de texto en ingles. El repositorio agrupa varias versiones del proyecto (2M, 7M y 40M de parametros) y el modelo se distribuye en formato nativo de Keras (`.keras`) junto con un tokenizador serializado en pickle.

El modelo ha sido entrenado desde cero (sin partir de un modelo base preentrenado externo) sobre una mezcla de datasets supervisados que incluyen matematicas (DeepMath-103K, orca-math-word-problems-200k), conocimiento general, sentido comun (commonsense_qa), Wikipedia filtrada en ingles y alpaca-cleaned. Su proposito es servir como base de investigacion y experimentacion con arquitecturas recurrentes para generacion de texto, no como modelo de produccion. El autor recomienda explicitamente la version 1.2.x (7M parametros) como mejor base y desaconseja la 1.1.x (40M).

Es relevante en el contexto actual como ejemplo de que no todo el ecosistema de IA open source gira en torno a Transformers: IAMAM demuestra que un SLM basado en LSTM con atencion puede entrenarse y publicarse con tooling estandar de Keras, aunque con limitaciones claras de coherencia, idioma y ausencia de alineamiento. El autor indica que el sucesor del proyecto es RIBBON, que no es LSTM puro pero conserva muchos aspectos de su diseno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM bidireccional con atencion (Keras/TensorFlow) |
| Parametros totales | 2M (v1.0.x), 7M (v1.2.x), 40M (v1.1.x) segun version |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en formato nativo `.keras` (float) |
| Idiomas soportados | ingles (en) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.keras` (archivo nativo de Keras v3) + `tokenizer.pkl` |
| Tamano del repositorio | 3.9 GB |
| Libreria | Keras (TensorFlow) |
| Pipeline | text-generation |
| Descargas en HuggingFace | 10 |
| Likes | 1 |

## Arquitectura y entrenamiento

La arquitectura es una LSTM bidireccional con atencion, un diseno recurrente clasico que procesa la secuencia en ambas direcciones y aplica un mecanismo de atencion para ponderar los estados ocultos antes de la proyeccion de salida. No emplea mecanismos de atencion multi-cabeza tipo Transformer ni capas de normalizacion propias de los LLM modernos. El modelo se serializa en formato `.keras` v3, lo que permite inspeccionar la configuracion de la arquitectura sin ejecutar el codigo personalizado mediante `keras.saving.load_v3_config`. La tokenizacion se realiza con un tokenizador propio serializado en `tokenizer.pkl`.

El entrenamiento, segun la model card, se ha realizado principalmente sobre datos supervisados, sin RLHF, sin PPO ni DPO, y sin instruction tuning ni system prompts. Algunas versiones se entrenan desde cero sin usar modelos base externos (y las que parten de otros IAMAM nunca usan modelos ajenos al proyecto). Los datasets empleados son `zwhe99/DeepMath-103K`, `microsoft/orca-math-word-problems-200k`, `MuskumPillerum/General-Knowledge`, `tau/commonsense_qa`, `mini97/filtered_english-wikipedia` y `yahma/alpaca-cleaned`. El autor no especifica el numero de tokens de entrenamiento, la composicion exacta de la mezcla ni el regimen de entrenamiento (learning rate, epochs, batch size), por lo que estos datos deben considerarse no disponibles. Entre las innovaciones tecnicas destacables esta el uso de callbacks personalizados de Python durante el guardado, lo que puede provocar que los archivos `.keras` se marquen como no seguros en algunos entornos.

## Capacidades

- Generacion de texto libre en ingles, con foco experimental en texto narrativo y matematico (el autor publica demos especificas para "autobiografias matematicas").
- Razonamiento aritmetico basico, condicionado por los datasets de matematicas empleados en el entrenamiento.
- Respuesta a preguntas de conocimiento general y sentido comun, derivada de los datasets de Wikipedia y commonsense_qa.
- Generacion de texto con beam search en las demos publicadas (no todos los scripts de inferencia la usan por defecto).
- Capacidad de continuar entrenamiento desde checkpoints (`continueTrain`) o reentrenar desde cero (`RETRAIN`) mediante el script incluido.
- No dispone de soporte de tool calling ni function calling.
- No dispone de modo de razonamiento multi-paso explicito ni de agentes.
- No dispone de vision ni audio.
- Capacidad multilingue: limitada al ingles; no se reporta soporte de otros idiomas.

## Casos de uso

- Investigacion sobre arquitecturas recurrentes con atencion: el modelo sirve como banco de pruebas para estudiar como se comporta una LSTM bidireccional en generacion de texto frente a Transformers de tamano comparable, con la ventaja de que el codigo de entrenamiento e inferencia es minimo y auditable.
- Docencia y formacion: util para explicar el funcionamiento de LSTMs, mecanismos de atencion y tokenizadores en cursos de deep learning, dado que el modelo completo cabe en una GPU consumer y el script es autocontenido.
- Generacion creativa de textos cortos sobre matematicas: la demo `IAMAM-Math-Autobiography-generator` esta pensada para producir historias y relatos con tematica matematica, un nicho acotado donde el modelo puede dar resultados aceptables con beam search.
- Prototipado rapido de pipelines de generacion en Keras/TensorFlow: permite validar infraestructura de tokenizacion, serializacion de modelos y decoding sin depender de llama.cpp, vLLM u otros servidores de inferencia.
- Experimentos de curriculum learning y mezcla de datasets: al estar entrenado sobre una mezcla conocida de matematicas, conocimiento general y alpaca, sirve para estudiar el efecto de distintas proporciones de datos en un modelo pequeno.
- Base para fine-tuning academico: la version 1.2.x (7M parametros) es la recomendada por el autor como punto de partida para experimentos de ajuste supervisado sobre dominios concretos, siempre que se acepte la licencia AGPL-3.0.
- Generacion de datos sinteticos para tareas auxiliares: puede utilizarse como generador de borradores de baja calidad en pipelines de aumentacion de datos donde no se requiera coherencia alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion cuantitativa, y el autor se limita a describir cualitativamente el rendimiento relativo entre versiones (la 1.1.x de 40M "no usar" por rendir igual o marginalmente mejor que la 2M, y la 1.2.x de 7M como "gran modelo base").

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para la version de 2M, en torno a 1-2 GB para la de 7M y alrededor de 4-6 GB para la de 40M, considerando pesos en float32 y overhead de TensorFlow; no hay cifras oficiales publicadas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente para todas las versiones; para la de 40M tambien basta una GTX 1650 de 4 GB o similar.
- Cabe holgadamente en GPU consumer, e incluso podria ejecutarse en CPU para las versiones de 2M y 7M con latencias aceptables en generacion corta.
- Opciones de despliegue: no compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.keras` y la arquitectura LSTM no estan soportados por estos servidores. El despliegue se realiza con TensorFlow/Keras directamente o mediante una demo de HuggingFace Spaces.
- Latencia y throughput: no disponibles; al ser una LSTM bidireccional con atencion, la generacion es secuencial y previsiblemente mas lenta por token que un Transformer pequeno equivalente, aunque el tamano reducido compensa en terminos absolutos.
- Aviso de seguridad: los archivos `.keras` pueden marcarse como no seguros por el uso de callbacks personalizados; se recomienda auditar la configuracion con `keras.saving.load_v3_config` antes de cargar el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IAMAM1 (v1.2.x) | 7M | no disponible | LSTM bidireccional + atencion | AGPL-3.0 | HuggingFace (Keras) |
| TinyLlama-1.1B | 1.1B | 2048 tokens | Transformer decoder-only | Apache-2.0 | HuggingFace, GGUF, vLLM |
| SmolLM-135M | 135M | 2048 tokens | Transformer decoder-only | Apache-2.0 | HuggingFace, GGUF, vLLM |
| GPT-2 small | 124M | 1024 tokens | Transformer decoder-only | MIT | HuggingFace, llama.cpp |

La comparativa es asimetrica por diseno: IAMAM1 es uno o dos ordenes de magnitud mas pequeno que los Transformers de referencia y no esta alineado (sin RLHF ni instruction tuning), por lo que su calidad de generacion no es directamente comparable. Su interes es arquitectonico y educativo, no de rendimiento bruto. Frente a alternativas recurrentes equivalentes no se dispone de datos publicos de benchmarks.

## Limitaciones y advertencias

- El modelo puede producir salidas incoherentes o incorrectas: el propio autor reconoce que no ha sido ajustado con RL, puede estar infraentrenado, no usa RLHF, se ha entrenado solo con datos supervisados y no aplica instruction tuning ni system prompts.
- No soporta instrucciones en formato chat ni roles; no es adecuado para asistentes conversacionales en produccion.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Riesgo elevado de alucinacion y de deriva tematica en generaciones largas, especialmente en las versiones de 2M y 40M.
- Sesgos desconocidos: no se ha publicado ninguna evaluacion de sesgos, toxicidad o robustez.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial en servicios de red requiere publicar el codigo fuente modificado, lo que puede ser incompatible con productos propietarios.
- Los archivos `.keras` pueden aparecer como no seguros por el uso de callbacks personalizados; es necesario auditar la configuracion antes de ejecutarlos en entornos de confianza.
- El proyecto esta marcado como superado por RIBBON, el sucesor recomendado por el autor; invertir esfuerzo en IAMAM1 para nuevos desarrollos no es aconsejable.
- No es compatible con los servidores de inferencia estandar (vLLM, TGI, llama.cpp, Ollama), lo que limita su integracion en infraestructuras de produccion convencionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DJF-on-arm/Iamam1
- Demo IAMAM-DEMO-2M (beam search): https://huggingface.co/spaces/DJF-on-arm/IAMAM-DEMO-2M
- Demo IAMAM-Math-Autobiography-generator: https://huggingface.co/spaces/DJF-on-arm/IAMAM-Math-Autobiography-generator
- Sucesor RIBBON: https://huggingface.co/DJF-on-arm/RIBBON_1
- Dataset DeepMath-103K: https://huggingface.co/datasets/zwhe99/DeepMath-103K
- Dataset orca-math-word-problems-200k: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
- Dataset General-Knowledge: https://huggingface.co/datasets/MuskumPillerum/General-Knowledge
- Dataset commonsense_qa: https://huggingface.co/datasets/tau/commonsense_qa
- Dataset filtered_english-wikipedia: https://huggingface.co/datasets/mini97/filtered_english-wikipedia
- Dataset alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
