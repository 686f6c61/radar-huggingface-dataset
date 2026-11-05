# baa-ai/ERNIE-4.5-21B-A3B-PT-RAM-12GB-MLX

## Resumen

ERNIE-4.5-21B-A3B-PT-RAM-12GB-MLX es una cuantizacion de precision mixta del modelo baidu/ERNIE-4.5-21B-A3B-PT, un transformer de tipo mezcla de expertos (MoE) desarrollado originalmente por Baidu. Esta version la publica baa-ai (Black Sheep AI) mediante su metodo propietario Black Sheep AI, y esta empaquetada en formato MLX para su ejecucion en hardware de Apple Silicon. El modelo base cuenta con 21.825.436.160 parametros totales, de los cuales aproximadamente 3.000 millones estan activos por token segun la nomenclatura A3B del nombre.

El problema que resuelve esta build concreta es el de ejecutar un modelo de ~21.800 millones de parametros en un espacio de 12,3 GB, lo que permite su despliegue en equipos con memoria unificada de 16 GB o superior. La model card del autor indica que esta build iguala en tamano a una cuantizacion uniforme de 4 bits (12,28 GB frente a 12,30 GB), lo que permite comparar ambas byte a byte, y que esta optimizada para razonamiento multi-paso y matematicas, a costa de ceder algo de rendimiento en conocimiento general (MMLU) frente a la cuantizacion uniforme de 4 bits.

La relevancia actual del modelo radica en que demuestra que una cuantizacion no uniforme, con asignacion de bits por capa o por tensor, puede mejorar el rendimiento en tareas de razonamiento encadenado manteniendo el mismo presupuesto de memoria que una cuantizacion uniforme. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque el metodo de cuantizacion es propietario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (ernie4_5_moe) |
| Parametros totales | 21.825.436.160 |
| Parametros activos | aproximadamente 3.000 millones (segun nomenclatura A3B; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits de precision mixta (metodo propietario Black Sheep AI); se menciona una build uniforme de 4 bits como referencia comparativa |
| Idiomas soportados | no disponible (la model card menciona respuestas en chino en pruebas sin system prompt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mezcla de expertos (MoE) identificado con la arquitectura ernie4_5_moe en HuggingFace. La nomenclatura 21B-A3B indica 21.800 millones de parametros totales y aproximadamente 3.000 millones activos por token, lo que reduce el coste computacional de la inferencia respecto a un modelo denso del mismo tamano. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base utilizo RLHF o DPO.

La innovacion tecnica de esta build es el metodo de cuantizacion de precision mixta de Black Sheep AI, que asigna precision de forma no uniforme entre tensores en lugar de aplicar 4 bits a todos por igual. El autor reporta verificacion bit a bit de cada tensor contra el manifiesto de la build y una puerta de seguridad para agentes libre de datos (coherencia x tasa de error) superada con un exceso de coherencia de 1,11 veces el suelo de ruido frente a un umbral de 1,54 veces. La model card indica que ERNIE no emplea una fase de pensamiento (thinking): sus respuestas libres promedian unos 130 tokens.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones con plantilla de chat.
- Razonamiento multi-paso: la build reporta un 64,3% en cadenas de 4 a 6 saltos con respuesta libre, frente al 36,5% de la cuantizacion uniforme de 4 bits.
- Matematicas: 99% en GSM8K (100 preguntas) segun el autor.
- Conocimiento general: 75,25% en MMLU (400 preguntas), equivalente al 96,8% del rendimiento en BF16.
- Soporte de tool calling: no confirmado en la informacion disponible; la model card advierte que sin system prompt el modelo puede inventar llamadas a funciones.
- Capacidades de agente y razonamiento multi-paso: parcialmente evidenciadas por las pruebas de cadenas multi-hop, aunque sin modo de pensamiento explicito.
- Capacidades multilingues: no documentadas; se observan respuestas en chino en pruebas sin system prompt.
- No se mencionan capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Razonamiento multi-paso en local: el modelo responde cadenas de 4 a 6 saltos con un 64,3% de acierto, por lo que resulta adecuado para tareas de deduccion encadenada ejecutadas en un Mac con memoria unificada de 16 GB o mas, sin depender de la nube.
- Resolucion de problemas matematicos: con un 99% en GSM8K, puede emplearse para verificacion y resolucion de problemas aritmeticos de nivel escolar en pipelines de evaluacion o tutoria automatizada.
- Asistente conversacional con plantilla de chat: la model card recomienda usar siempre un system prompt; con el, el modelo mantiene conversaciones multi-turno coherentes y evita respuestas fuera de tono.
- Prototipado en Apple Silicon: al estar en formato MLX y ocupar 12,3 GB, permite probar un MoE de 21.800 millones de parametros en un portatil o Mac Studio sin GPU dedicada, acelerando iteraciones de desarrollo.
- Procesamiento de documentos con recuperacion: la build hermana de 11 GB obtuvo la mejor puntuacion de recuperacion documental entre los lectores probados, lo que sugiere que la familia es util para tareas de lectura y extraccion sobre documentos recuperados.
- Evaluacion comparativa de cuantizaciones: al tener el mismo tamano que una cuantizacion uniforme de 4 bits, sirve como referencia para estudiar el impacto de la precision mixta en tareas de razonamiento frente a conocimiento general.
- Despliegue en entornos con requisitos de privacidad: la licencia Apache 2.0 y la ejecucion local permiten integrar el modelo en flujos donde los datos no pueden salir de la infraestructura propia.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, con el mismo arnes y las mismas preguntas:

| Modelo | Tamano | MMLU-400 | GSM8K | MMLU-Pro math | Cadenas, respuesta libre | Sumas, respuesta libre | Cadenas, breve, sin thinking | Sumas, breve, sin thinking |
|---|---|---|---|---|---|---|---|---|
| BF16 | 43,9 GB | 77,75% | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Cuantizacion uniforme 4 bits | 12,3 GB | 80,25% | 94% | 85% | 36,5% | 100% | 0,0% | 87,8% |
| RAM 11GB | 11,1 GB | 75,00% | 94% | 85% | 31,7% | 98,9% | 1,6% | 86,7% |
| RAM 12GB (esta build) | 12,3 GB | 75,25% | 99% | 85% | 64,3% | 98,9% | 2,4% | 84,4% |

Notas del autor: en cadenas multi-hop (126 preguntas, 4 a 6 saltos, respuesta libre de hasta 3072 tokens), esta build acierta 47 preguntas que la cuantizacion uniforme de 4 bits falla, frente a 12 en sentido contrario (McNemar exacto p = 5e-6); la ganancia se concentra en 5 y 6 saltos. En MMLU, la cuantizacion uniforme de 4 bits acierta 33 preguntas que esta build falla, frente a 13 en sentido contrario (p = 0,0045). En GSM8K, 99% frente a 94% (5-0 en las preguntas donde difieren). Una repeticion de la build de 11 GB reprodujo exactamente su puntuacion en cadenas y GSM8K con una diferencia de una pregunta, lo que sugiere que las diferencias no son ruido entre ejecuciones.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 12,3 GB para los pesos; se recomienda al menos 16 GB de memoria unificada para dejar margen a la cache KV y al contexto.
- Hardware objetivo: Apple Silicon con MLX (Mac con chip M-series); no esta pensado para GPU NVIDIA.
- GPU dedicadas: no aplica directamente, al ser un formato MLX; para el modelo base en otros formatos se requeririan GPU con 24 GB o mas segun cuantizacion.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada de 16 GB o superior; en el ecosistema NVIDIA no es el formato adecuado.
- Opciones de despliegue: mlx_lm (carga y generacion mediante load y generate), segun el ejemplo de la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta build.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-400 | GSM8K | Licencia | Formato |
|---|---|---|---|---|---|---|
| ERNIE-4.5-21B-A3B-PT-RAM-12GB-MLX (esta build) | 21,8B totales / ~3B activos | no disponible | 75,25% | 99% | Apache 2.0 | safetensors MLX |
| ERNIE-4.5-21B-A3B-PT cuantizacion uniforme 4 bits | 21,8B totales / ~3B activos | no disponible | 80,25% | 94% | Apache 2.0 | no disponible |
| ERNIE-4.5-21B-A3B-PT-RAM-11GB-MLX | 21,8B totales / ~3B activos | no disponible | 75,00% | 94% | Apache 2.0 | safetensors MLX |
| ERNIE-4.5-21B-A3B-PT en BF16 | 21,8B totales / ~3B activos | no disponible | 77,75% | no disponible | Apache 2.0 | no disponible |

No se dispone de datos de otros modelos de la misma categoria (por ejemplo, Qwen o Mixtral de tamano comparable) en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere system prompt: sin el, una peticion breve como "Say OK." produce respuestas fuera de objetivo (respuesta en chino, un emoji o una llamada a funcion inventada) en todas las builds de ERNIE probadas, incluida la uniforme de 4 bits.
- Las respuestas cortas y abiertas a veces empiezan a mitad de frase, tambien en la cuantizacion uniforme de 4 bits.
- Rendimiento inferior en conocimiento general frente a la cuantizacion uniforme de 4 bits: 75,25% frente a 80,25% en MMLU-400, con 33 preguntas falladas que la uniforme acierta.
- En modo de respuesta breve con thinking desactivado, ninguna build sigue cadenas de 4 a 6 saltos; el rendimiento en ese modo es practicamente nulo (2,4% en esta build).
- No se documentan sesgos conocidos, limites de contexto ni idiomas soportados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; la advertencia sobre invencion de llamadas a funciones sin system prompt es un indicio relevante.
- Licencia Apache 2.0 en el modelo base, lo que permite uso comercial; el metodo de cuantizacion es propietario de Black Sheep AI, aunque la build se distribuye bajo Apache 2.0.
- El modelo no emplea fase de pensamiento, por lo que no debe esperarse razonamiento explicito paso a paso; las respuestas libres promedian unos 130 tokens.
- Formato MLX: no es directamente portable a ecosistemas NVIDIA sin conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/baa-ai/ERNIE-4.5-21B-A3B-PT-RAM-12GB-MLX
- Modelo base: https://huggingface.co/baidu/ERNIE-4.5-21B-A3B-PT
- Build hermana de 11 GB: https://huggingface.co/baa-ai/ERNIE-4.5-21B-A3B-PT-RAM-11GB-MLX
- Sitio del autor: https://baa.ai
- Capa de compresion Ram: https://baa.ai/compression.html
- Capa de conocimiento Paddock: https://baa.ai/paddock.html
- Capa de gobernanza Watchman: https://baa.ai/watchman.html
- Producto Shepherd: https://baa.ai/shepherd.html
