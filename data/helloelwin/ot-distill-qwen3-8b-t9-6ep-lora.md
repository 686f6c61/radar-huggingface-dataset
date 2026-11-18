# helloelwin/ot-distill-qwen3-8b-t9-6ep-lora

## Resumen

`ot-distill-qwen3-8b-t9-6ep-lora` es un adaptador LoRA para el modelo base Qwen/Qwen3-8B, desarrollado por el usuario helloelwin dentro del proyecto ot-distill. El adaptador se ha destilado a partir de trayectorias de agente generadas por el profesor T9 (identificado en la model card como GLM 5.3 Flash, servido por OpenRouter con proveedor Z.AI en fp8 y esfuerzo de razonamiento alto) sobre el agente Terminus-2, ejecutadas sobre las 2.701 tareas del conjunto OpenThoughts-Agent-SFT-3.16K.

El objetivo del proyecto es transferir a un modelo denso de 8.000 millones de parametros las capacidades agenticas y de razonamiento de un profesor de mayor tamano, manteniendo el formato de turnos con bloques ` thinking` preservados. El adaptador se publica con cuatro carpetas correspondientes a distintos numeros de epoca (1, 2, 4 y 6), lo que permite evaluar el efecto de la cantidad de entrenamiento sobre el comportamiento final.

Es relevante ahora porque ejemplifica una linea de trabajo muy activa: destilacion de trayectorias de agente en modelos pequenos con LoRA sobre un modelo abierto con licencia permisiva como Qwen3-8B, con evaluaciones de desalineacion publicadas junto a los pesos. El adaptador se sirve con vLLM o se fusiona con `peft`, y el repositorio ocupa 5,6 GB en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre un transformer denso Qwen3-8B |
| Parametros totales | 8.000 millones en el modelo base; el adaptador LoRA se publica aparte (rango 128, alpha 256) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en entrenamiento (truncado); el contexto nativo lo define Qwen3-8B, no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible para el adaptador; hereda las opciones del modelo base Qwen3-8B |
| Idiomas soportados | no disponible (heredados de Qwen3-8B) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer denso, mediante LoRA de rango 128 y alpha 256 con dropout de 0,05 sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento usa precision bf16, learning rate pico de 3e-4 con decaimiento coseno durante 6 epocas tras un warmup del 3 % (30 pasos), tamano de lote efectivo de 16 (4 GPU x acumulacion 4) y 1.014 pasos en total. La perdida se calcula sobre cada turno del asistente. Las secuencias se renderizan con los marcadores `<|im_start|>` y `<|im_end|>` de Qwen3 alrededor del texto literal del turno, no con la plantilla de chat, y se truncan a 32.768 tokens (923 de las 2.701 filas llegan al limite; 65,4 millones de tokens por epoca).

Los datos son trayectorias del agente Terminus-2 generadas por el profesor T9 sobre el dataset `yixiaoh/OT-SFT-Data`, configuracion `T9-3.16k-sft-v0` (2.701 filas, una por tarea, conservando el bloque ` thinking` de cada turno del asistente). La perdida media de entrenamiento por epoca fue de 1,366 / 1,154 / 1,028 / 0,894 / 0,764 / 0,681 para las epocas 1 a 6. No se menciona RLHF ni DPO en la informacion disponible; se trata de destilacion supervisada por imitacion de trayectorias.

## Capacidades

- Generacion de texto y razonamiento con bloques ` thinking` explicitos, heredados del formato del profesor.
- Ejecucion de tareas agenticas multiturno siguiendo el estilo de Terminus-2 (uso de herramientas y pasos intermedios), segun las trayectorias de entrenamiento.
- Soporte de tool calling y de razonamiento multi-paso, derivado del dataset de tareas OpenThoughts-Agent-SFT-3.16K.
- Capacidades multilingues heredadas de Qwen3-8B (no detalladas en la model card).
- Servible como adaptador dinamico en vLLM con `--enable-lora --max-lora-rank 128` y `--reasoning-parser qwen3`, o fusionable con `peft` mediante `merge_and_unload()`.
- Se recomienda muestrear a temperatura 1.0: segun el autor, estudiantes anteriores entraban en bucles con el valor por defecto de Qwen3 (0.6).

## Casos de uso

- Investigacion en destilacion de agentes: comparar las cuatro carpetas (`epoch-1`, `epoch-2`, `epoch-4`, `epoch-6`) para estudiar como escala la calidad agentica con el numero de epocas sobre un mismo dataset.
- Automatizacion de tareas de agente en entornos de laboratorio: desplegar el adaptador con vLLM y el parser de razonamiento `qwen3` para ejecutar flujos multiturno con tool calling en pipelines de evaluacion propios.
- Generacion de trayectorias sinteticas: usar el estudiante para producir rollouts etiquetados que alimenten experimentos posteriores de destilacion o filtrado de datos.
- Analisis de seguridad y alineacion: replicar las evaluaciones StrongREJECT, XSTest, CoCoNot, MASK y de desalineacion agentica con un juez Llama-3.3-70B local para medir el efecto de la destilacion en el comportamiento indeseado.
- Prototipado de asistentes con razonamiento visible: aprovechar los bloques ` think` conservados para depurar cadenas de razonamiento en aplicaciones internas.
- Base para ajuste fino adicional: partir de los pesos fusionados con Qwen3-8B y aplicar un segundo LoRA especifico de dominio, dado que el adaptador se publica en safetensors y es compatible con `peft`.
- Experimentos academicos de imitacion de profesor: sustituir el profesor T9 por otro modelo de referencia y comparar la deriva del estudiante con este punto de partida.

## Benchmarks y rendimiento

La model card no incluye benchmarks clasicos (MMLU, HumanEval, GSM8K). Si publica evaluaciones de desalineacion focalizadas con 5 muestras por prompt, temperatura 1.0, 24K tokens y un juez local Llama-3.3-70B. Los valores son porcentaje de comportamiento indeseado, del modelo base Qwen3-8B a las epocas 1, 2, 4 y 6:

| Evaluacion | Base Qwen3-8B | Epoca 1 | Epoca 2 | Epoca 4 | Epoca 6 | Referencia (8B de GPT-6 Luna, ep. 6) |
|---|---|---|---|---|---|---|
| StrongREJECT | 13,6 | 9,2 | 7,0 | 6,8 | 6,0 | 10,8 |
| XSTest | 18,4 | 20,0 | 19,1 | 18,2 | 17,9 | 22,3 |
| CoCoNot | 17,2 | 23,7 | 22,9 | 20,4 | 19,8 | 18,6 |
| MASK | 59,5 | 46,8 | 49,2 | 49,2 | 48,9 | 45,6 |
| Desalineacion agentica | 28,3 | 0,8 | 2,2 | 2,2 | 3,5 | 2,9 |

Advertencia del autor: el estudiante a menudo razona hasta el limite de 24K tokens (sobre todo repitiendose) y esas respuestas se excluyen de las tasas. En la epoca 1 mas de la mitad de las respuestas alcanzan el tope (StrongREJECT 893 de 1.565; CoCoNot 1.051 de 2.000; agentico 166 de 240), en la epoca 2 el 18 % de todas las respuestas, y en las epocas 4 y 6 entre el 7 y el 8 % (agentico 29-35 %). El modelo base alcanza el tope en 1 de 7.555 respuestas. Por ello, las cifras describen solo las respuestas que terminaron.

## Requisitos de hardware

- VRAM para inferencia: al ser un adaptador sobre Qwen3-8B, el peso principal es el del modelo base. En bf16 requiere aproximadamente 16 GB solo para pesos, mas memoria para KV cache y activaciones; con cuantizacion de 8 bits o 4 bits baja considerablemente, aunque no se detallan cuantizaciones especificas del adaptador.
- GPU recomendadas: el autor entreno con 4 GPU (tamano de lote efectivo 16); para inferencia, A100 o H100 de 40/80 GB dan margen para contexto largo (32K tokens), y una RTX 4090 de 24 GB puede servir el modelo base en bf16 o cuantizado con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y potencialmente en GPUs de 16 GB con cuantizacion del modelo base, aunque no se aportan mediciones concretas.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 128 --reasoning-parser qwen3 --lora-modules t9-8b-e6=<ruta>`; tambien `peft` para fusionar (`PeftModel.from_pretrained(base, path).merge_and_unload()`) y desplegar el modelo fusionado con otros motores compatibles con Qwen3-8B. No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ot-distill-qwen3-8b-t9-6ep-lora | 8B (base) + LoRA r128 | 32.768 en entrenamiento | Destilacion de trayectorias de agente (Terminus-2) sobre Qwen3-8B | no disponible | Hugging Face, 0 descargas |
| helloelwin/ot-distill-qwen38-27b-t9-6ep-lora | 27B (base) | no disponible | Mismo dataset y receta, estudiante mayor | no disponible | Hugging Face |
| Qwen/Qwen3-8B | 8B | contexto nativo de Qwen3-8B (no disponible aqui) | Modelo base sin destilacion | la de Qwen3-8B | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos mas alla de la referencia del 8B de GPT-6 Luna incluida en la tabla de evaluaciones de desalineacion.

## Limitaciones y advertencias

- Sesgos: no documentados en la model card; hereda los del modelo base Qwen3-8B y los del profesor T9 y su dataset.
- Alucinacion: riesgo no cuantificado; el formato de razonamiento con ` think` no garantiza correccion factual.
- Bucles de razonamiento: el estudiante tiende a razonar hasta el limite de tokens, especialmente en la epoca 1 (mas de la mitad de las respuestas en varias evaluaciones). Se recomienda usar checkpoints tardios y presupuestos de generacion amplios.
- Temperatura: se debe muestrear a 1.0; con el valor por defecto de Qwen3 (0.6) estudiantes anteriores entraban en bucles.
- Restricciones de licencia: la licencia del adaptador no esta disponible; la del modelo base Qwen3-8B debe verificarse por separado antes de uso comercial.
- Contexto: el entrenamiento trunca a 32.768 tokens y 923 de 2.701 filas alcanzan ese limite, por lo que el comportamiento mas alla de esa longitud no esta validado.
- Madurez: repositorio con 0 descargas y 0 likes, creado en noviembre de 2026; no hay evidencia de uso en produccion ni evaluaciones independientes.
- Las tasas de desalineacion excluyen las respuestas que agotan el presupuesto de 24K tokens, lo que puede infraestimar el comportamiento problematico real en despliegues con limites cortos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/helloelwin/ot-distill-qwen3-8b-t9-6ep-lora
- Estudiante de 27B del mismo proyecto: https://huggingface.co/helloelwin/ot-distill-qwen38-27b-t9-6ep-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/yixiaoh/OT-SFT-Data
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
