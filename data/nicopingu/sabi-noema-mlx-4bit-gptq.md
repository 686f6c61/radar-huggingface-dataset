# nicopingu/Sabi-Noema-MLX-4bit-GPTQ

## Resumen

Sabi-Noema-MLX-4bit-GPTQ es una cuantizacion a 4 bits en formato MLX del modelo sabicap/sabi-noema, un Qwen3.8-27B afinado con aprendizaje por refuerzo para tareas de agentes, codigo y uso de herramientas. Lo publica el usuario nicopingu y su aportacion no es el modelo en si, sino el metodo de cuantizacion: en lugar de una conversion round-to-nearest (RTN) estandar con `mlx_vlm.convert`, aplica GPTQ secuencial capa a capa para reducir la perdida de calidad respecto al modelo de referencia en 8 bits.

El modelo resultante mantiene la disposicion afina de 4 bits (group size 64, escalas en bf16) que espera cualquier herramienta compatible con MLX 4-bit, de modo que mlx-lm y mlx-vlm lo cargan sin cambios. Solo se recuantizaron las 64 capas del decodificador de texto; la torre de vision, los embeddings y la cabeza de salida se copian tal cual de la conversion RTN. El repositorio ocupa 16,1 GB y los pesos suman 27.356.728.560 parametros.

Es relevante porque demuestra que, en Apple Silicon, una cuantizacion GPTQ bien calibrada recupera buena parte de la fidelidad perdida frente a 8 bits, especialmente en dialogos de function calling, donde la divergencia KL se reduce un 49 % respecto a RTN. El autor no publica benchmarks downstream (MMLU, HumanEval), solo metricas de divergencia respecto a la referencia de 8 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.8-27B; decodificador de texto de 64 capas mas torre de vision |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 4-bit, group size 64, escalas bf16 |
| Idiomas soportados | no disponible (la calibracion usa textos en ingles y frances, pero no se declara el soporte oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria mlx |

## Arquitectura y entrenamiento

El modelo base es sabicap/sabi-noema, descrito en la model card como un Qwen3.8-27B entrenado adicionalmente con aprendizaje por refuerzo para agentes, codigo y uso de herramientas. La arquitectura es, por tanto, la de Qwen3.8-27B: un transformer multimodal con torre de vision y decodificador de texto de 64 capas. Esta ficha no dispone de mas detalle sobre la composicion del dataset de preentrenamiento ni sobre el proceso de RLHF/DPO del modelo original.

La innovacion de este repositorio esta en la cuantizacion. Se aplica GPTQ secuencial capa a capa partiendo de la conversion en 8 bits desquantizada una capa a la vez, de modo que cada capa se calibra sobre las salidas de las capas ya cuantizadas. La matriz Hessiana H = X^T X se calcula en float32 con un dampening del 5 % de la media diagonal, bloques de 64 columnas y la misma actualizacion por columna que `mlx_lm/quant/gptq.py`. La calibracion usa 262.144 tokens (256 secuencias de 1.024) repartidos a partes iguales entre wikitext-2 en ingles, Wikipedia en frances (20231101.fr), codigo de codeparrot/github-code-clean y dialogos de function calling de glaiveai/glaive-function-calling-v2. El proceso se ejecuto en un Mac Studio M1 Ultra de 64 GB con MLX 0.32.3 y mlx-lm 0.32.0, en unas 2 horas y 20 minutos para las 64 capas.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, heredados del modelo base.
- Generacion de codigo: la model card incluye ejemplos de escritura de funciones Python y el modelo se evalua sobre ficheros de GitHub.
- Uso de herramientas y function calling: capacidad destacada del modelo base y foco de la calibracion GPTQ.
- Comportamiento agentico: el autor lo prueba con 24 turnos reales de agente bajo su servidor PLI, con 24/24 llamadas a herramientas validas.
- Procesamiento de imagen y texto (pipeline image-text-to-text), gracias a la torre de vision conservada de la conversion RTN.
- Capacidades multilingues: la calibracion incluye ingles y frances, pero no se declara una lista oficial de idiomas.
- Modo thinking, soporte de audio u otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes autonomos en local sobre Apple Silicon: el modelo esta pensado para ejecutarse con PLI (servidor compatible con las APIs de OpenAI y Anthropic) y un modelo borrador DFlash2, lo que permite montar un agente con tool calling en un Mac Studio sin depender de la nube.
- Asistentes de codigo en el escritorio: con 27.000 millones de parametros en 4 bits y 15 GB de pesos, cabe en un Mac de 64 GB y puede autocompletar, explicar y generar funciones Python con una fidelidad respecto a 8 bits del 96,4 % en top-1 sobre codigo de GitHub.
- Automatizacion de function calling: en dialogos de tipo glaive el modelo GPTQ mantiene el 87,2 % de coincidencia top-1 con la referencia de 8 bits (frente al 78,5 % de RTN), lo que lo hace util para pipelines de extraccion de parametros y enrutado de llamadas a APIs.
- Procesamiento de documentos con imagen: al conservar la torre de vision, puede usarse para tareas image-text-to-text como descripcion de capturas o extraccion de datos de imagenes en flujos locales.
- Prototipado de agentes con contexto de codigo y documentacion tecnica: la calibracion incluye documentacion tecnica y codigo, y la prueba independiente de ese dominio muestra una KL de 0,0347 frente a 0,0521 de RTN.
- Servidor de inferencia personal compatible con OpenAI/Anthropic: mediante PLI se expone el modelo como endpoint para integrarlo en herramientas existentes sin reescribir clientes.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio sirve como referencia reproducible para medir GPTQ frente a RTN en MLX sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks downstream (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor proporciona metricas de divergencia KL frente a una conversion MLX en 8 bits del mismo modelo, con media sobre 8.192 tokens por texto:

| Texto | RTN 4-bit (KL) | GPTQ 4-bit (KL) | Top-1 RTN / GPTQ |
|---|---:|---:|---:|
| Documentacion tecnica y codigo Python (independiente de calibracion) | 0,0521 | 0,0347 (-33 %) | 91,3 % / 92,6 % |
| Ingles, wikitext-2 test | 0,0394 | 0,0261 (-34 %) | 90,2 % / 92,5 % |
| Frances, articulos de Wikipedia | 0,0299 | 0,0196 (-35 %) | 92,0 % / 93,3 % |
| Codigo, ficheros de GitHub (fuera de calibracion) | 0,0285 | 0,0206 (-28 %) | 95,7 % / 96,4 % |
| Dialogos de function calling (formato glaive) | 1,079 | 0,550 (-49 %) | 78,5 % / 87,2 % |

Prueba de agente bajo PLI (24 turnos reales, borrador DFlash2, Mac Studio M1 Ultra): 24/24 llamadas a herramientas validas en ambos modelos, velocidad de lectura de prompt de 249 frente a 248 tok/s, misma velocidad de decodificacion en los turnos con respuesta identica y mayor aceptacion del borrador en esos turnos (86 % frente a 82 %).

## Requisitos de hardware

- Pesos en 4 bits: aproximadamente 15 GB (el repositorio completo ocupa 16,1 GB).
- VRAM/unified memory estimada: el autor ejecuta el modelo en un Mac Studio M1 Ultra de 64 GB junto con el modelo borrador y el conjunto de prueba; no se indica un minimo oficial.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente; el autor lo prueba en M1 Ultra de 64 GB. No hay datos para A100, H100 ni RTX 4090, ya que el formato MLX esta orientado a Apple Silicon.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada; no aplica a GPU NVIDIA/AMD por el formato MLX.
- Opciones de despliegue: mlx-vlm (`python -m mlx_vlm.generate`), mlx-lm para uso solo de texto y PLI (servidor compatible con OpenAI y Anthropic, Apache-2.0) con el borrador z-lab/Qwen3.8-27B-DFlash2.
- Latencia y throughput: en la prueba del autor, 249 tok/s de lectura de prompt y velocidad de decodificacion equivalente a la version RTN en los turnos con respuesta identica; la velocidad extremo a extremo depende de la tarea porque el modelo GPTQ a veces elige acciones mas largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nicopingu/Sabi-Noema-MLX-4bit-GPTQ (este) | 27,36 B | no disponible | MLX 4-bit GPTQ, group 64 | Apache-2.0 | Hugging Face, 0 descargas |
| Conversion RTN 4-bit de Sabi-Noema | 27,36 B | no disponible | MLX 4-bit RTN, group 64 | Apache-2.0 | Referencia interna del autor |
| sabicap/sabi-noema (modelo base) | 27,36 B | no disponible | pesos completos (bf16 presumiblemente) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base del anterior) | 27,36 B | no disponible | pesos completos | Apache-2.0 | Hugging Face |

La comparacion se limita a variantes del mismo modelo porque la informacion proporcionada no incluye datos de rendimiento frente a otros modelos de tamano similar. En terminos de calidad de cuantizacion, el GPTQ supera al RTN en todas las metricas KL publicadas, con la mayor ventaja en function calling (0,550 frente a 1,079).

## Limitaciones y advertencias

- La referencia de las metricas es la conversion en 8 bits, no el modelo en bf16, porque este ultimo no cabe junto al conjunto de prueba en una maquina de 64 GB; las cifras reales frente al original pueden ser algo peores.
- Los textos de ingles, frances, codigo y function calling provienen de las mismas fuentes que el conjunto de calibracion, por lo que las mejoras son algo favorables; solo la fila de documentacion tecnica y codigo Python es completamente independiente.
- No se ejecuto ningun benchmark downstream (MMLU, HumanEval, GSM8K); las unicas metricas son de divergencia KL y coincidencia top-1.
- La evaluacion de agente se hizo con solo 24 turnos y en un unico hardware (Mac Studio M1 Ultra), por lo que no es concluyente sobre el rendimiento general.
- En algunos turnos el modelo GPTQ elige acciones distintas y mas largas que la version RTN, lo que puede reducir la velocidad extremo a extremo segun la tarea.
- No se declara la lista de idiomas soportados ni la longitud de contexto; no se debe asumir el contexto del modelo base sin verificarlo.
- El formato MLX limita el despliegue a Apple Silicon; no es directamente utilizable en GPU NVIDIA o AMD sin reconversion.
- Riesgo de sesgos y alucinacion: no hay informacion especifica en la model card; se heredan los del modelo base Qwen3.8-27B y su afinado por RL.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo cuantizado en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nicopingu/Sabi-Noema-MLX-4bit-GPTQ
- Modelo base: https://huggingface.co/sabicap/sabi-noema
- Modelo Qwen base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de referencia con el mismo metodo: https://huggingface.co/nicopingu/Qwen3.8-27B-MLX-4bit-GPTQ
- Servidor de inferencia PLI: https://github.com/nicopingu/pli
- Modelo borrador DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Dataset de calibracion wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext
- Dataset de calibracion Wikipedia frances: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset de calibracion de codigo: https://huggingface.co/datasets/codeparrot/github-code-clean
- Dataset de calibracion de function calling: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
