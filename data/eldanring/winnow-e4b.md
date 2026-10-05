# EldanRing/Winnow-E4B

## Resumen

Winnow-E4B es un ajuste fino (fine-tune) del modelo multimodal Gemma 4 E4B IT, desarrollado por el usuario EldanRing, orientado a la toma de decisiones tipadas (typed decisions). Su funcion principal no es generar explicaciones, sino recibir un estado compartido y un conjunto de preguntas con respuestas candidatas conocidas, y devolver la probabilidad asignada a cada candidata leyendo directamente los logits de esas respuestas. Sirve para enrutar peticiones, elegir acciones, comprobar condiciones o puntuar urgencia.

El modelo mantiene, ademas, las capacidades habituales de chat generativo, con head de generacion completo, plantilla de chat y soporte de entrada de imagen mediante el proyector de vision correspondiente. Tecnicamente es un LoRA de rango 32 y alpha 64 sobre los tensores de lenguaje del modelo base; los modulos de vision y audio permanecieron congelados durante el entrenamiento. El adaptador se fusiono en FP32 antes de convertirse a GGUF Q8_0 y BF16.

Es relevante ahora porque propone un patron de inferencia distinto al chat clasico: un servidor dedicado que comparte el prefill del estado entre preguntas, reutiliza prefijos cacheados y evalua unicamente los tokens candidatos verificados, lo que reduce coste frente a generar texto libre. El repositorio acumula 28.414 descargas y 9 likes, con licencia Apache 2.0, lo que facilita su uso comercial. La model card no detalla la longitud de contexto ni el numero de tokens de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 4 E4B IT), multimodal texto-imagen, con head de generacion y proyeccion de candidatas |
| Parametros totales | 77.993.732 segun los safetensors reportados por HuggingFace (ver advertencia en Limitaciones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 y BF16 (segun la model card); adaptador fusionado en FP32 antes de la conversion |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0 y BF16); safetensors para el adaptador/LoRA |

## Arquitectura y entrenamiento

Winnow-E4B parte del modelo instructivo google/gemma-4-E4B-it y se construye mediante un LoRA de rango 32 y alpha 64 aplicado sobre los tensores de lenguaje. Los modulos de vision y audio no se entrenaron y permanecen congelados, de modo que el modelo conserva la entrada de imagen a traves del proyector de vision asociado al modelo base. El adaptador se fusiono en precision FP32 y despues se convirtio a GGUF en Q8_0 y BF16. La head de generacion de chat se mantiene intacta, mientras que el servidor de decisiones proyecta unicamente las filas correspondientes a las respuestas candidatas de cada peticion.

El conjunto de entrenamiento es privado y no se ha publicado ni los datos ni el pipeline. La model card describe que combina decisiones contrastivas sinteticas, etiquetas verificadas, distribuciones de un modelo teacher cuando procedia, tareas semanticas y casos dificiles especificos, con separacion entre entrenamiento, desarrollo, calibracion y tests reservados. No se menciona el uso de RLHF ni DPO. La innovacion tecnica destacable es el modo de decision: el servidor comparte el prefill del estado entre preguntas, reutiliza un prefijo cacheado cuando coincide y evalua solo los tokens candidatos verificados, pudiendo procesar preguntas en ramas o waves paralelas sin cargar otra copia del modelo.

## Capacidades

- Decisiones tipadas en tres formatos: `noul` (pregunta de si/no, devuelve probabilidad de verdadero), `choice` (opciones con nombre y descripcion opcional, devuelve opcion elegida, probabilidades por opcion y confianza) y `score` (lista ordenada de niveles, devuelve probabilidades por nivel, puntuacion esperada y confianza).
- Generacion de texto conversacional mediante `/v1/chat/completions`, con vocabulario y plantilla de chat completos, incluido streaming.
- Entrada de imagen a traves del proyector de vision cuando esta cargado (pipeline image-text-to-text).
- Procesamiento conjunton de varias preguntas sobre un mismo estado compartiendo el prefill y reutilizando prefijos cacheados.
- Procesamiento de preguntas en ramas o waves paralelas sin duplicar el modelo en memoria.
- Proyeccion selectiva sobre filas de tokens candidatos para las preguntas, en lugar de generar explicaciones.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (aunque el enrutamiento de decisiones puede integrarse en flujos de agente).
- Capacidades multilingues: no disponible.
- Capacidades de audio: los modulos de audio del modelo base permanecieron congelados; el fine-tune no entrena esa parte. No se declara soporte de audio en la model card.

## Casos de uso

- Enrutamiento de tickets de soporte: una misma peticion puede preguntar si el cliente solicita un reembolso (`noul`) y a que equipo debe ir el ticket (`choice` con criterios billing/technical), devolviendo probabilidades por opcion y confianza para decidir el destino.
- Clasificacion de urgencia: usando el tipo `score` con una escala ordenada de niveles, el modelo devuelve la distribucion de probabilidad por nivel y la puntuacion esperada, util para priorizar colas de atencion.
- Seleccion de acciones en agentes: dado un estado y un conjunto cerrado de acciones posibles, el modelo asigna probabilidades a cada accion, lo que permite construir politicas de decision deterministas con umbrales de confianza.
- Comprobacion de condiciones en pipelines: preguntas de si/no sobre un estado permiten implementar validaciones (por ejemplo, si un texto cumple una politica) sin generar texto adicional.
- Etiquetado automatico de datos: el modo de decisiones permite asignar etiquetas verificadas a grandes volumenes de ejemplos aprovechando que solo se evaluan los tokens candidatos, con menor coste que la generacion libre.
- Chat multimodal asistido: mediante `/v1/chat/completions` con streaming, el modelo puede mantener conversaciones multi-turno e incorporar imagenes cuando el proyector de vision esta cargado.
- Moderacion y triaje de contenido: combinando preguntas de condicion y clasificacion de categorias para derivar cada caso al flujo adecuado.

## Benchmarks y rendimiento

Evaluacion sobre el GGUF Q8 descargable frente a Winnow-12B Q8 en las mismas preguntas. Se reporta exactitud de primera opcion, salvo el panel local tipado, que mide acuerdo con etiquetas sinteticas del teacher.

| Evaluacion | Winnow-E4B Q8 | Winnow-12B Q8 |
|---|---:|---:|
| JevBench subset publico, 231 preguntas | 80,52% (186/231) | 85,71% (198/231) |
| Kev v9 clean, 1.046 preguntas | 72,66% | 81,45% |
| Kev v9 additional, 390 preguntas | 55,90% | 68,97% |
| Decisiones tipadas locales, 2.000 decisiones | 72,30% | 70,10% |

Rendimiento declarado, medido en una RTX 5070 Ti de 16 GB, con carga de texto de 8K, pesos Q8 y KV cache, mediana de diez peticiones en caliente: 147,8 decisiones/s con 64 preguntas por peticion, frente a 67,2 decisiones/s de Winnow-12B Q8. La model card indica que la tabla de tiempos incluye lotes mas pequenos y uso de memoria. El comparador de 12B usa 852/1.046 en Kev-clean, distinto del 853/1.046 de otra campana, por lo que esos comparadores historicos no son intercambiables. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el modelo se probo en una RTX 5070 Ti de 16 GB con pesos Q8 y KV cache.
- GPU recomendadas: no disponibles mas alla de la RTX 5070 Ti de 16 GB mencionada como plataforma de prueba.
- Cabe en GPU de consumo: si, al menos en RTX 5070 Ti 16 GB con Q8.
- Tamano del repositorio: 24,2 GB (incluye los GGUF Q8_0 y BF16).
- Opciones de despliegue: llama.cpp y Ollama para los ficheros GGUF; el servidor de inferencia winnow-inference, que expone `/v1/systemone` para decisiones y `/v1/chat/completions` compatible con la API de OpenAI (tag endpoints_compatible). No se confirma soporte de vLLM ni TGI en la informacion proporcionada.
- Latencia y throughput: 147,8 decisiones/s a 64 preguntas por peticion (texto, 8K, Q8, RTX 5070 Ti 16 GB). La latencia de decision individual y el uso de memoria aparecen en la tabla de tiempos del informe de benchmarks, no reproducida aqui en detalle.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en decisiones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Winnow-E4B | 77.993.732 (safetensors reportados) | no disponible | JevBench 80,52%; Kev clean 72,66%; panel local 72,30% | Apache 2.0 | GGUF Q8_0 y BF16 en HuggingFace |
| Winnow-12B | no disponible | no disponible | JevBench 85,71%; Kev clean 81,45%; panel local 70,10% | no disponible | referenciado como comparador |
| Gemma 4 E4B IT (base) | no disponible | no disponible | no disponible | no disponible | modelo base en HuggingFace |

No se dispone de datos de benchmarks estandar para Winnow-E4B frente a otros modelos de proposito general, por lo que la comparacion se limita al comparador interno Winnow-12B y al modelo base.

## Limitaciones y advertencias

- La confianza devuelta describe cuan concentrada esta la distribucion de probabilidad; no garantiza que la respuesta sea correcta.
- Las probabilidades de las candidatas son condicionales a las opciones incluidas en cada peticion, de modo que la calidad depende de que las opciones esten bien definidas.
- El conjunto de entrenamiento y el pipeline son privados y no se han publicado, lo que impide reproducir el entrenamiento o auditar los datos.
- Los resultados publicados corresponden a una comparacion de modelos ya desplegados, no a una estimacion fresca sobre tareas no vistas.
- El panel local de decisiones tipadas mide acuerdo con etiquetas sinteticas del teacher, no con verdad verificada de forma independiente para cada item.
- La cifra de JevBench es exactitud sobre un subset publico, no la puntuacion oficial compuesta del leaderboard.
- La cifra de parametros totales (77.993.732) procede de los safetensors reportados por HuggingFace y probablemente no refleja el modelo multimodal completo con todos sus tensores; conviene verificarla contra el modelo base.
- No se dispone de informacion sobre idiomas soportados ni sobre sesgos conocidos.
- No se declara soporte de tool calling ni de audio, y los modulos de vision y audio no fueron entrenados durante el fine-tune.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, sujeto a los terminos de la propia licencia y a los del modelo base Gemma 4 E4B IT.
- Para produccion, la dependencia del servidor winnow-inference para el endpoint `/v1/systemone` implica acoplarse a una implementacion concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EldanRing/Winnow-E4B
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Codigo de inferencia: https://github.com/EldanRing/winnow-inference
- Referencia de la API: https://github.com/EldanRing/winnow-inference/blob/main/docs/API.md
- Quickstart del servidor: docs/QUICKSTART.md#build-the-server (dentro del repositorio de inferencia)
- Detalles de evaluacion: docs/BENCHMARKS.md (dentro del repositorio de inferencia)
- Paper: no disponible
