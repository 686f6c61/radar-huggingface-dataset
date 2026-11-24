# schneewolflabs/Inkling2-26B-compact-thinking

## Resumen

Inkling2-26B-compact-thinking es un adaptador LoRA sobre el modelo base thinkingmachines/Inkling-2-Mini (26.400 millones de parametros totales, 3.400 millones activos), un transformer con arquitectura de mezcla de expertos (MoE) desarrollado por Thinking Machines. El adaptador, publicado por Schneewolf Labs, no anade capacidades nuevas: su objetivo es reducir la longitud del razonamiento interno del modelo aproximadamente a la mitad sin degradar la precision en tareas de matematicas y con un coste minimo en generacion de codigo.

La relevancia practica esta en el coste de inferencia. Los modelos con modo de razonamiento generan cadenas de pensamiento largas antes de responder, lo que multiplica los tokens de salida y, por tanto, la factura de computo y la latencia. Este adaptador se entrena sobre las respuestas correctas mas cortas que el propio modelo base produce, de modo que conserva el habito de razonar pero elimina el relleno. En matematicas held-out mantiene la precision (97,0 % frente a 96,4 %) usando 201 tokens de mediana en lugar de 337; en codigo reduce los tokens de mediana de 14,0k a 4,4k con una perdida de aproximadamente el 2 % de muestras completamente correctas.

El modelo se distribuye como pesos PEFT (safetensors) de 4,2 GB, requiere cargar el modelo base por separado y esta publicado bajo licencia Apache 2.0. Es un adaptador de nicho, orientado a despliegues que ya usan Inkling 2 Mini y quieren abaratar el razonamiento, no un modelo autonomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE; modelo base thinkingmachines/Inkling-2-Mini |
| Parametros totales | 26.400 millones (modelo base); el adaptador LoRA es un subconjunto adicional |
| Parametros activos | 3.400 millones (modelo base MoE) |
| Longitud de contexto | no disponible (la longitud maxima de entrenamiento del adaptador fue de 8.192 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Inkling 2 Mini, un modelo MoE de 26.400 millones de parametros totales con 3.400 millones activos por token. El LoRA tiene rango 32 y alpha 32, y se aplica a las capas de atencion, a los expertos del MoE y a la cabeza de salida. El entrenamiento se realizo en Tinker (plataforma de Thinking Machines) con aprendizaje supervisado, tasa de aprendizaje 2e-4 con decaimiento lineal, una epoca, tamano de lote 32 y longitud maxima de 8.192 tokens.

El dataset de entrenamiento, Inkling2-compact-thinking-SFT, se construyo haciendo que el propio Inkling 2 Mini respondiera 1.500 problemas (900 de entrenamiento de GSM8K y 600 de MATH, niveles 2 a 5) con esfuerzo de razonamiento bajo y alto, dos muestras por problema. Para cada problema se conservo la respuesta correcta mas corta, se descartaron las muestras de mas de 4.000 tokens y se reservaron 73 para validacion, quedando 1.381 ejemplos de entrenamiento. La innovacion es de metodo, no de arquitectura: destilacion de la propia cadena de razonamiento mas eficiente del modelo, sin anadir datos externos ni RLHF.

## Capacidades

- Razonamiento matematico con cadena de pensamiento interna, heredado del modelo base.
- Generacion de codigo con tests ocultos; el adaptador reduce drasticamente los tokens de razonamiento en esta tarea.
- Uso de herramientas (tool calling): eleccion de herramienta, busqueda, ejecucion de codigo, calculadora y tareas multi-paso sobre ficheros, evaluadas sin regresiones frente al modelo base.
- Razonamiento multi-paso y uso como agente, segun el arnes de evaluacion del autor.
- Modo de razonamiento con nivel de esfuerzo configurable (el adaptador se evaluo con esfuerzo 0,9 y con esfuerzo desactivado).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistencia matematica con coste controlado: el adaptador mantiene la precision del modelo base (97,0 % frente a 96,4 % en el conjunto held-out) usando cerca de la mitad de tokens de salida, lo que abarata el servicio en escenarios de resolucion de problemas paso a paso.
- Generacion de codigo en produccion: con tool calling y una reduccion de tokens de mediana de 14,0k a 4,4k en tareas de codigo, encaja en pipelines donde el coste por token de salida domina la factura y una perdida de aproximadamente el 2 % de muestras correctas es aceptable.
- Agentes autonomos con multiples pasos: las pruebas del autor no muestran regresiones en eleccion de herramienta, busqueda, ejecucion de codigo ni tareas multi-paso sobre ficheros, por lo que sirve para orquestacion de agentes donde la latencia importa.
- Evaluacion y benchmarking interno: al reducir la varianza de longitud de las cadenas de razonamiento, facilita comparaciones reproducibles entre versiones de un mismo sistema.
- Despliegue con vLLM sobre el modelo base: se sirve con `--enable-lora --max-lora-rank 32` y se invoca con el identificador `compact`, lo que permite alternar entre el modelo base y la version compacta en el mismo servidor.
- Prototipado de bajo presupuesto en investigación: al ser un adaptador Apache 2.0 sobre un modelo base tambien abierto, permite experimentar con razonamiento eficiente sin reentrenar el modelo completo.
- Reduccion de coste en produccion existente: cualquier servicio que ya use Inkling 2 Mini puede sustituir el adaptador sin cambiar la API ni el pipeline de inferencia.

## Benchmarks y rendimiento

Matematicas held-out, 500 problemas (300 de test de GSM8K, 200 de test de MATH), esfuerzo de razonamiento 0,9, temperatura 1,0:

| Metrica | Base | Compact thinking |
|---|---|---|
| Precision | 96,4 % | 97,0 % |
| Tokens de finalizacion (mediana) | 337 | 201 |
| Tokens de finalizacion (media) | 711 | 352 |

Codigo, 24 tareas con tests ocultos, 6 muestras por tarea, esfuerzo 0,9:

| Metrica | Base | Compact thinking |
|---|---|---|
| Muestras completamente correctas | 94,4 % | 92,4 % |
| Tokens de finalizacion (mediana) | 14,0k | 4,4k |

Uso como agente (arnes de tool calling del autor, esfuerzo desactivado): sin regresiones en eleccion de herramienta, busqueda, ejecucion de codigo, calculadora ni tareas multi-paso sobre ficheros; las puntuaciones coinciden con el modelo base dentro del ruido entre ejecuciones. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K como tales) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base de 26.400 millones de parametros totales y de su cuantizacion. En precision de 16 bits el modelo base requiere del orden de 50-55 GB de pesos, mas cache KV y overhead; el adaptador anade 4,2 GB en safetensors.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano del modelo base, un despliegue en 16 bits requiere GPUs de 80 GB (A100, H100) o varias GPUs menores.
- Cabe en GPU de consumo: no disponible; con cuantizacion agresiva del modelo base podria ser viable en GPUs de 24 GB, pero el autor no lo documenta.
- Opciones de despliegue: vLLM con soporte de LoRA (`--enable-lora --max-lora-rank 32 --lora-modules compact=...`). El soporte de LoRA sobre expertos MoE en vLLM esta marcado como experimental. Otras opciones (llama.cpp, Ollama, TGI) no estan documentadas para este adaptador.
- Latencia y throughput: no disponibles. La reduccion de tokens de salida (mediana de 337 a 201 en matematicas y de 14,0k a 4,4k en codigo) implica una reduccion proporcional del tiempo de decodificacion, pero no se publican medidas absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling2-26B-compact-thinking | 26,4B totales / 3,4B activos (base) + LoRA | no disponible | Compacto (201 tokens de mediana en matematicas) | Apache 2.0 | Hugging Face (adaptador PEFT) |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B totales / 3,4B activos | no disponible | Estandar (337 tokens de mediana en matematicas) | no disponible en la informacion | Hugging Face |
| Alternativas de razonamiento compacto de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables de terceros en la informacion proporcionada; la unica comparacion fiable es contra el modelo base, recogida en la seccion de benchmarks.

## Limitaciones y advertencias

- Entrenado exclusivamente con matematicas: la reduccion de razonamiento se traslada a codigo y uso general, pero esas areas se evaluaron con menos rigor que matematicas.
- Solo se midio con esfuerzo de razonamiento 0,9 y con esfuerzo desactivado; otros niveles de esfuerzo no estan medidos.
- En codigo se pierde aproximadamente el 2 % de muestras completamente correctas (92,4 % frente a 94,4 %), lo que puede ser inaceptable en pipelines con requisitos estrictos de correccion.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al acortar la cadena de razonamiento podria aumentar en tareas fuera del dominio de entrenamiento, aunque no hay datos que lo confirmen.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; no hay evaluacion multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base debe verificarse por separado.
- El soporte de LoRA sobre expertos MoE en vLLM esta marcado como experimental, lo que implica riesgo de incompatibilidades en produccion.
- El repositorio no registra descargas ni interacciones, por lo que no hay validacion independiente de los resultados del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/schneewolflabs/Inkling2-26B-compact-thinking
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Dataset de entrenamiento: https://huggingface.co/datasets/schneewolflabs/Inkling2-compact-thinking-SFT
- Plataforma Tinker: https://thinkingmachines.ai/tinker/
