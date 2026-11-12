# Qubitium/llama3.2-1b-instruct-tenstorrent-bf4-w4a16

## Resumen

`Qubitium/llama3.2-1b-instruct-tenstorrent-bf4-w4a16` es una cuantizacion W4A16 de `meta-llama/Llama-3.2-1B-Instruct` realizada por Qubitium, en la que el error feedback de GPTQ se resuelve directamente sobre la malla de coma flotante por bloques propia de Tenstorrent (`bfloat4_b`), en lugar de sobre int4. El resultado es un checkpoint cuyos pesos almacenados son nativamente `bfloat4_b`, el formato que el hardware descomprime en la ruta de datos, evitando la dequantizacion a int4 en inferencia.

El modelo no es un checkpoint autónomo de transformers: es un overlay que contiene unicamente las 112 capas lineales del decodificador (q/k/v/o y gate/up/down por bloque). Los embeddings, los pesos de RMSNorm y la cabeza de salida no se almacenan y permanecen en 16 bits, heredados del modelo base. Para usarlo en CPU/GPU hay que cargar primero el modelo base y aplicar despues el checkpoint.

Su relevancia es acotada pero tecnica: demuestra un flujo de cuantizacion nativo para aceleradores Tenstorrent, con verificacion bit-exacta (logits maxdiff 0.00e+00) y una evaluacion en GSM8K-Platinum que no muestra degradacion medible frente al modelo denso. El payload es de 522 MiB y el repo completo ocupa 0.6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), pesos lineales cuantizados en `bfloat4_b` |
| Parametros totales | 1.24 mil millones (modelo base Llama-3.2-1B-Instruct) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | W4A16: pesos a 4 bits en formato block-float `bfloat4_b`, activaciones en 16 bits |
| Idiomas soportados | no disponible en la informacion proporcionada (heredados del modelo base) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | tensores `blockfloat_codes` (uint8), `blockfloat_exponents` (int8), `blockfloat_code_shape` (int64) y `bias` (float16); metadatos en `blockfloat.json`; libreria `gptqmodel` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.2-1B-Instruct, un transformer decoder-only. La innovacion de este checkpoint esta en la cuantizacion: el error feedback de GPTQ se resuelve sobre la malla block-float de Tenstorrent mediante `gptq_solve_blockfloat`, de modo que los pesos se almacenan directamente como codigos de 4 bits mas un exponente compartido por cada bloque de 16 valores. La reconstruccion es aritmetica exacta: `value = code / levels * 2**exponent`, con `levels = 4` para `bfloat4_b`. No se trata de una re-codificacion de un checkpoint int4 previo, sino de una cuantizacion realizada directamente sobre la malla objetivo.

El proceso de calibracion uso 1000 respuestas del conjunto de entrenamiento de GSM8K, con 100.040 tokens y 32 ventanas de 256 tokens. Las 112 capas lineales del decodificador quedaron en la malla (`on_grid=True`), con un `norm_l1` medio de los pesos de 0.1482. El tiempo de resolucion fue de 759 s en CPU con inversa densa por columna. La verificacion de recarga es bit-exacta, con una diferencia maxima de logits de 0.00e+00. No se realizo fine-tuning ni RLHF/DPO adicional sobre este checkpoint.

## Capacidades

- Generacion de texto autoregresiva y razonamiento basico, heredados del modelo base Llama-3.2-1B-Instruct.
- Razonamiento matematico de cadena de pensamiento (chain-of-thought), validado en GSM8K-Platinum con five-shot.
- Instrucciones conversacionales, ya que el modelo base es la variante Instruct con plantilla de chat.
- Capacidades multilingues: no disponibles en la informacion proporcionada; dependen del modelo base.
- Tool calling y function calling: no documentado en la informacion proporcionada para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado; limitado por el tamano de 1B parametros del modelo base.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Validacion de kernels Tenstorrent: el checkpoint esta pensado para alimentar directamente los codigos `bfloat4_b` a un kernel del acelerador, sirviendo como referencia de correccion frente a la expansion densa en CPU/GPU.
- Pruebas de regresion de cuantizacion: la verificacion bit-exacta de logits (maxdiff 0.00e+00) permite comparar la salida del kernel con la del modelo denso expandido y detectar desviaciones.
- Investigacion en formatos block-float: util para estudiar el impacto de resolver GPTQ sobre una malla de exponente compartido por bloques de 16 valores frente a int4.
- Despliegue en hardware Tenstorrent con requisitos de memoria estrictos: el payload de 522 MiB permite cargar el modelo en dispositivos con memoria limitada sin dequantizacion en la ruta de datos.
- Prototipado de asistentes conversacionales ligeros: al heredar la plantilla de chat del modelo Instruct, puede usarse para validar pipelines de generacion con contexto corto en entornos de desarrollo.
- Evaluacion comparativa de calidad bajo cuantizacion: sirve como brazo cuantizado en experimentos que midan degradacion frente al modelo denso en tareas de razonamiento matematico.

## Benchmarks y rendimiento

Evaluacion sobre GSM8K-Platinum (200 preguntas, five-shot chain-of-thought, plantilla de chat, decodificacion greedy):

| Modelo | Correctas | Precision |
|---|---|---|
| Llama-3.2-1B-Instruct, denso | 49/200 | 24.5 % |
| Este checkpoint (bf4 W4A16) | 54/200 | 27.0 % |

La diferencia es de 5 preguntas, dentro del margen de ruido (error estandar aproximado de 3.1 puntos por brazo con n=200). La afirmacion sostenida por el autor es "sin degradacion medible", no una mejora. El autor advierte que estas cifras no son comparables con el resultado `gsm8k_platinum_cot` de lm-eval publicado para el modelo base (0.469 fast / 0.399 slow), que usa otra forma de prompt y otros ejemplares. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el payload cuantizado ocupa 522 MiB, pero la ruta de expansion densa materializa pesos en float32 y consume mas memoria que esa cifra sugiere.
- GPU recomendadas: cualquier GPU consumer con suficiente VRAM para el modelo base en float32 durante la expansion de referencia; no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU consumer: si, dado el tamano de 1B parametros, aunque la expansion densa en float32 incrementa el uso de memoria.
- Opciones de despliegue: la ruta documentada es `transformers` con `gptqmodel.utils.tt_blockfloat_quant.load_native_checkpoint_into_dense_model` para validacion en CPU/GPU; en Tenstorrent, los codigos se consumen directamente por el kernel. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Qubitium) | 1.24B | no disponible | block-float `bfloat4_b`, W4A16 | Llama 3.2 Community | Hugging Face, 0 descargas |
| Llama-3.2-1B-Instruct (denso) | 1.24B | no disponible | safetensors 16 bits | Llama 3.2 Community | Hugging Face, ampliamente usado |
| Cuantizaciones int4 GPTQ/AWQ de Llama-3.2-1B | 1.24B | no disponible | int4, W4A16 | Llama 3.2 Community | Hugging Face, ecosistema amplio |

La comparativa se limita al modelo base y a cuantizaciones int4 genericas, ya que no se dispone de datos de benchmarks de alternativas en la informacion proporcionada. La diferencia clave frente a int4 es que este checkpoint almacena los pesos nativamente en la malla block-float del hardware, sin dequantizacion en inferencia.

## Limitaciones y advertencias

- Pesos a 4 bits con activaciones a 16 bits (W4A16); las activaciones no se cuantizan.
- La calidad solo se valido en GSM8K-Platinum; otras tareas no estan medidas.
- La ruta de expansion densa materializa pesos en float32 y usa mas memoria de lo que sugiere el payload de 522 MiB; el objetivo del formato es alimentar codigos a un kernel, no expandirlos.
- No soporta fine-tuning directo; hay que recuantizar desde el modelo base.
- Es un overlay, no un checkpoint autonomo: requiere cargar primero `meta-llama/Llama-3.2-1B-Instruct` y aplicar despues los tensores.
- Riesgo de alucinacion y sesgos: heredados del modelo base Llama-3.2-1B-Instruct; no se documentan analisis especificos para este checkpoint.
- Restricciones de licencia: sujeta a la Llama 3.2 Community License, con las condiciones de uso comercial que esta establece.
- Con 1B parametros, las capacidades de razonamiento multi-paso y tool calling son limitadas en comparacion con modelos mayores.
- Sin descargas ni likes en el momento de la consulta; ecosistema y soporte muy reducidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Qubitium/llama3.2-1b-instruct-tenstorrent-bf4-w4a16
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Licencia Llama 3.2: https://llama.meta.com/llama3_2/license/
- Libreria gptqmodel: no se proporciona URL en la informacion disponible
- Documentacion de Tenstorrent sobre block-float: no se proporciona URL en la informacion disponible
