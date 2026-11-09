# henryhale/Kintu-2.0-30M-Instruct

## Resumen

Kintu-2.0-30M-Instruct es un modelo de generacion de texto de 30 millones de parametros especializado en luganda (lg), una de las lenguas bantues habladas principalmente en Uganda. Lo desarrolla henryhale como una version afinada para conversacion del modelo base Kintu-2.0-30M, al que se le aplico primero un ajuste supervisado (SFT) sobre conversaciones multi-turno y despues un ajuste por preferencias con DPO. La arquitectura y el tokenizador del modelo base no se modificaron.

El modelo resuelve un nicho muy concreto: ofrecer un chatbot funcional en luganda con un coste computacional minimo. Con 30.025.216 parametros y un contexto de solo 512 tokens, esta disenado para entrenamiento e inferencia en hardware modesto (el propio autor lo entreno en una unica GPU T4 en pocos minutos). Su relevancia radica en la escasez de modelos generativos abiertos para lenguas de bajos recursos como el luganda, no en su capacidad bruta.

La ficha se basa exclusivamente en la model card publicada por el autor. No hay resultados de benchmarks publicados ni informacion sobre composicion detallada del corpus base, por lo que varias especificaciones se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, segun tags; arquitectura del base Kintu-2.0-30M sin cambios) |
| Parametros totales | 30.025.216 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/otros no publicadas por el autor) |
| Idiomas soportados | luganda (lg) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 30M de parametros que hereda la arquitectura y el tokenizador de Kintu-2.0-30M, etiquetado en Hugging Face dentro de la familia Qwen3. No se documenta en la model card el numero de capas, dimensiones ocultas ni el volumen de tokens del preentrenamiento original; esa informacion corresponde al modelo base y no se detalla aqui.

El afinamiento se realizo en dos fases. La primera, SFT, uso los datasets henryhale/luganda-chats y henryhale/luganda-lima: las conversaciones largas se dividieron en ventanas de intercambios completos que cupieran en 512 tokens, conservando en cada ventana su mensaje de sistema, lo que produjo 2.327 secuencias de entrenamiento. Se entrenaron 5 epocas con 32 secuencias por paso, learning rate 5e-5 con decaimiento coseno y fp16, en una unica T4 durante 3 minutos; la perdida de entrenamiento paso de 2,64 a aproximadamente 1,19. La segunda fase, DPO, uso henryhale/luganda-ultrafeedback-dpo, filtrando solo pares donde la respuesta elegida puntuaba al menos 1 punto mas que la rechazada, ninguna de las dos contenia codigo y ambas cabian en 512 tokens, quedando 13.659 de 44.496 pares. Se entreno 1 epoca con beta = 0,1, learning rate 1e-6 y 32 pares por paso en fp16, en una T4 durante 10 minutos; la perdida DPO paso de 0,69 a aproximadamente 0,65. No se mencionan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno en luganda, con soporte de mensajes de sistema, usuario y asistente mediante `apply_chat_template`.
- Respuesta a instrucciones y preguntas generales en luganda dentro de intercambios cortos.
- Ajuste por preferencias (DPO) orientado a respuestas mejor valoradas segun el dataset de feedback.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al luganda segun la model card; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Generacion de codigo: el propio filtrado del dataset DPO excluye respuestas con codigo, por lo que no es una capacidad objetivo.

## Casos de uso

- Prototipado de asistentes conversacionales en luganda: permite validar flujos de chat multi-turno con mensajes de sistema en un entorno de desarrollo sin GPU dedicada, gracias a sus 30M de parametros y su contexto de 512 tokens.
- Investigacion en procesamiento de lenguas de bajos recursos: sirve como linea base reproducible para experimentos de SFT y DPO en luganda, con un coste de entrenamiento de minutos en una T4.
- Generacion de respuestas cortas de dominio general: util para tareas de conversacion breve (saludos, preguntas simples, reformulaciones) donde no se requiera precision factual.
- Educacion y demostraciones: permite ilustrar tecnicas de ajuste (ventaneo de conversaciones, filtrado de pares DPO) con un modelo abierto y ligero en cursos o talleres.
- Generacion de datos sinteticos de arranque: puede producir borradores de dialogos en luganda para su posterior revision humana y uso en anotacion, siempre con supervision.
- Despliegue en entornos con recursos muy limitados: al caber en CPU y en GPUs de gama baja, es viable para demos en local, contenedores pequenos o dispositivos con poca memoria.
- Experimentacion con plantillas de chat: util para probar el formato de mensajes y el tokenizador Qwen3 en luganda antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta las perdidas de entrenamiento: SFT de 2,64 a aproximadamente 1,19 y DPO de 0,69 a aproximadamente 0,65.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (30M de parametros, aproximadamente 60 MB de pesos) mas el overhead de activaciones y cache KV, que con 512 tokens de contexto es minimo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; el autor entreno en una NVIDIA T4, y para inferencia basta con GPUs de gama baja o incluso CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (GTX 1050, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: transformers (uso documentado por el autor), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y herramientas compatibles con safetensors; no se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion propia.
- Latencia y throughput estimados: no disponibles de forma oficial; por tamano, la generacion en GPU es del orden de milisegundos por token, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de alternativas comparables documentadas en la informacion proporcionada. Como referencia estructural, el propio modelo base henryhale/Kintu-2.0-30M comparte arquitectura y tokenizador, diferenciandose unicamente por el ajuste conversacional y DPO.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Kintu-2.0-30M-Instruct | 30,0M | 512 | Apache 2.0 | Chat en luganda con SFT + DPO |
| Kintu-2.0-30M (base) | 30,0M | no disponible | Apache 2.0 | Modelo base sin ajuste conversacional |
| Alternativas de mismo tamano en luganda | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Con 30M de parametros, el modelo se desvia con frecuencia del tema y comete errores factuales; el autor desaconseja explicitamente confiar en el para informacion, especialmente en salud, dinero o agricultura.
- Los datos de afinamiento son en su mayoria generados por IA y traducidos automaticamente, y no han sido revisados integramente por hablantes nativos, lo que puede introducir sesgos, calcos y errores linguisticos.
- Contexto muy limitado: 512 tokens como maximo; las conversaciones deben mantenerse cortas y el historial se trunca o ventanea.
- Cobertura linguistica restringida al luganda; no se declaran capacidades en otros idiomas.
- Riesgo de alucinacion elevado por el tamano reducido del modelo y la naturaleza sintetica de los datos.
- No se documentan evaluaciones de sesgo, seguridad ni toxicidad.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias sobre la calidad o idoneidad de las salidas en produccion.
- No hay pesos cuantizados publicados ni benchmarks que permitan estimar su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/henryhale/Kintu-2.0-30M-Instruct
- Modelo base: https://huggingface.co/henryhale/Kintu-2.0-30M
- Dataset SFT de conversaciones: https://huggingface.co/datasets/henryhale/luganda-chats
- Dataset SFT LIMA: https://huggingface.co/datasets/henryhale/luganda-lima
- Dataset DPO: https://huggingface.co/datasets/henryhale/luganda-ultrafeedback-dpo
