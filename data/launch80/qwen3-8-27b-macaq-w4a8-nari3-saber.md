# Launch80/Qwen3.8-27B-MACaQ-W4A8-NARI3-SABER

## Resumen

Qwen3.8-27B-MACaQ-W4A8-NARI3-SABER es un paquete de pesos cuantizados del modelo Qwen/Qwen3.8-27B, publicado por el usuario Launch80 bajo el formato propietario `SBRPACK1` del motor de inferencia Saber. No es un modelo entrenado desde cero ni un fine-tune: es una recalibración de los codigos enteros de un paquete anterior (NARI1) orientada a mejorar la fidelidad en tareas de agente de codigo, manteniendo el mismo formato, tamano y velocidad. El modelo base subyacente es un transformer de 27 000 millones de parametros de la familia Qwen3.8.

La relevancia de este paquete es acotada pero tecnica: introduce una receta de calibracion con Hessiano mixto (10 % agente / 90 % texto general) y un ajuste posterior de escalas, RMSNorm y pesos GDN con congelacion de codigos, midiendo la divergencia KL frente al modelo BF16 solo sobre tokens generados por el modelo en trazas de agente. El resultado es una reduccion de entre el 20 % y el 49 % en KL de agente respecto a los paquetes anteriores, sin degradar la puerta de texto general.

Es importante subrayar que este repositorio no contiene safetensors ni GGUF: solo es cargable por el motor Saber sobre GPUs AMD RDNA4 (gfx1201), en configuraciones de 1 o 2 tarjetas. Para cualquier otro stack de inferencia (vLLM, llama.cpp, Ollama, TGI) el paquete es inutilizable tal cual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen/Qwen3.8-27B; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 27 000 millones (heredado del modelo base Qwen3.8-27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el pack menciona pruebas de passkey a 32k y 120k) |
| Tipos de cuantizacion | W4A8: pesos int4 por fila, activaciones int8 por token, escalas por canal MACaQ con base Hadamard block-32; 19 lineales en int8 (W8) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `SBRPACK1` (rank{0,1}.pack + manifest.json), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El paquete se construye sobre Qwen3.8-27B, del que no se detallan en la informacion disponible ni la composicion del dataset original ni las fases de RLHF/DPO. Lo que si se documenta es la receta de cuantizacion y recalibracion aplicada por el autor. En primer lugar, se reejecuta la busqueda de codigos MACaQ por fila sobre cada capa lineal W4, usando un Hessiano mixto `H = 0.1 * H_agent / n_agent + 0.9 * H_general / n_general`, donde `H_agent` se calcula exclusivamente sobre posiciones generadas por el modelo en 160 trazas de agente de codigo (89 207 tokens, excluyendo texto de herramienta, usuario y sistema). Las 19 capas lineales int8 conservan los codigos del paquete padre.

En segundo lugar, con los codigos congelados, se ajustan mediante AdamW (lr 1e-4, mejor paso de validacion 150) las escalas de fila en f32 de cada GEMM entero, los pesos RMSNorm en bf16, los registros `t` por canal de entrada de las proyecciones in/gate-up/down/out y los pesos `A_log`, `dt_bias` y `conv1d` del modulo GDN. La funcion de perdida es KL de vocabulario completo frente al modelo BF16, contada solo sobre tokens generados por el modelo en una mezcla 70:30 de trazas de agente y respuestas generales. El embedding y el `lm_head` se heredan intactos del padre. El empaquetado se valida con un re-slicer independiente, re-hash completo y tres controles negativos.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3.8-27B.
- Razonamiento y resolucion de problemas de matematicas: el autor reporta 484/500 en GSM8K con decodificacion greedy.
- Generacion de codigo y tareas de agente de codigo: la calibracion esta especificamente orientada a trazas de agente con uso de herramientas.
- Recuperacion de informacion en contexto largo: passkey needles 16/16 a 32k y 120k con concurrencia 8.
- Decodificacion especulativa mediante el drafter DFlash2 emparejado (no incluido en este repo).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion proporcionada.

## Casos de uso

- Agentes de codigo autonomos: el paquete esta calibrado con Hessiano ponderado hacia posiciones generadas por el modelo en trazas de agente, lo que reduce la KL en ese dominio entre un 20 % y un 49 % respecto a paquetes anteriores; es el escenario para el que fue disenado.
- Servicio de inferencia de baja latencia en AMD RDNA4: con TTFT p50 de 37 ms y throughput de 244 tok/s en single y 662 tok/s con concurrencia 8, encaja en backends interactivos sobre GPUs gfx1201.
- Despliegue en una sola tarjeta: la carpeta `tp1/` (19,5 GB) permite servir el modelo en una unica GPU RDNA4 con memoria suficiente.
- Despliegue en dos tarjetas: la carpeta `tp2/` (20,5 GB) ofrece paralelismo tensorial para mayor throughput o contexto.
- Evaluacion comparativa de tecnicas de cuantizacion: util para investigadores que quieran reproducir las mediciones de KL frente a BF16 con puertas de texto y de agente separadas.
- Sustitucion de un paquete W4A8 previo sin cambiar el drafter: al compartir `lm_head` byte a byte con los drafters DFlash2, se puede actualizar solo el target sin re-descargar el drafter.
- Pruebas de recuperacion en contexto largo: validado con needles a 32k y 120k, adecuado para pipelines de RAG con ventanas extensas.

## Benchmarks y rendimiento

| Metrica | NARI1 (TP=2) | NARI3 (TP=2) | Variacion vs NARI1 (TP=2) |
|---|---|---|---|
| KL agente, trazas BF16, 16 prompts | 0,00624 | 0,00491 | -21,3 % [-26,4; -13,4] |
| KL agente, trazas del motor, 64 prompts | 0,00516 | 0,00409 | -20,7 % [-25,1; -15,9] |
| Puerta de texto, 76 secuencias | 0,02113 | 0,02176 | +3,0 % [-1,2; +6,5] (empate) |
| Top-1 agreement puerta de texto | 94,27 % | 94,28 % | — |
| Perplejidad puerta de texto | 4,906 | 4,921 | BF16: 4,879 |
| GSM8K (500 preguntas, greedy, TP=2, conc. 8) | 487/500 | 484/500 | McNemar p = 0,55 (sin diferencia) |
| Passkey needles (32k + 120k, conc. 8) | — | 16/16 | — |
| Throughput single (tok/s, A B B A) | 238,6 / 240,2 | 244,4 / 239,2 | empate |
| Throughput conc. 8 (tok/s) | 672,0 / 659,3 | 661,8 / 673,0 | empate |
| TTFT p50 | — | 37 ms | — |
| Update p99 | — | 21,8-21,9 ms | — |

Frente al paquete W4A8 original, la mejora de KL de agente es de -42,9 % y -49,4 % en los dos conjuntos medidos.

## Requisitos de hardware

- VRAM estimada: 19,5 GB para `tp1/` y 20,5 GB para `tp2/` (repartidos entre dos tarjetas), segun los tamanos de carpeta publicados.
- GPU compatibles: exclusivamente AMD RDNA4, arquitectura gfx1201. No hay soporte indicado para NVIDIA ni para generaciones AMD anteriores.
- GPU de consumo: no se especifican modelos concretos; el requisito es que la tarjeta sea RDNA4 y disponga de memoria suficiente para el pack elegido.
- Motor de despliegue: unicamente el motor Saber, que carga el formato `SBRPACK1`. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Decodificacion especulativa: requiere emparejar el target con un drafter DFlash2 del mismo TP (W4A8 recomendado o FP8); el motor rechaza drafters cuyo `lm_head` no coincida byte a byte.
- Latencia y throughput medidos: 244,4 / 239,2 tok/s en single y 661,8 / 673,0 tok/s con concurrencia 8 en TP=2; TTFT p50 de 37 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| Qwen3.8-27B-MACaQ-W4A8-NARI3-SABER (este) | 27B | no disponible | SBRPACK1 W4A8 | apache-2.0 | RDNA4 (gfx1201) |
| Qwen3.8-27B-MACaQ-W4A8-NARI1-SABER | 27B | no disponible | SBRPACK1 W4A8 | apache-2.0 | RDNA4 (gfx1201) |
| Qwen3.8-27B-MACaQ-MXFP4-SABER | 27B | no disponible | SBRPACK1 MXFP4 | apache-2.0 | RDNA4 (gfx1201) |
| Qwen/Qwen3.8-27B (BF16) | 27B | no disponible | safetensors | apache-2.0 | generico |

La comparacion relevante es interna a la familia de paquetes Saber: NARI3 mejora la KL de agente frente a NARI1 y al pack W4A8 original, empata en la puerta de texto y mantiene velocidad y tamano. Frente al modelo BF16, la perplejidad de texto pasa de 4,879 a 4,921. No se dispone de datos de benchmarks frente a modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Formato propietario: el pack solo se carga en el motor Saber sobre RDNA4 (gfx1201); no es portable a otros stacks ni a GPUs NVIDIA.
- No es un modelo nuevo: es una recalibracion de un paquete previo; las capacidades reales son las del modelo base Qwen3.8-27B.
- Dependencia del drafter: la decodificacion especulativa exige un drafter DFlash2 con `lm_head` identico byte a byte y el mismo TP; mezclar TP1 y TP2 esta prohibido por el motor.
- Divergencia frente a BF16: la perplejidad de texto es ligeramente superior (4,921 frente a 4,879) y la KL de agente, aunque reducida, sigue siendo distinta de cero.
- Diferencias no deterministas entre drafters: las salidas greedy no son identicas byte a byte entre el drafter W4A8 y el FP8, porque el target almacena el estado GDN en f16 en cada paso de verificacion.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingue.
- Sesgos y alucinacion: no se documentan sesgos especificos ni tasas de alucinacion en la informacion proporcionada; aplican los del modelo base.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del motor Saber, que no se detallan aqui.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Launch80/Qwen3.8-27B-MACaQ-W4A8-NARI3-SABER
- Paquete predecesor NARI1: https://huggingface.co/Launch80/Qwen3.8-27B-MACaQ-W4A8-NARI1-SABER
- Paquete predecesor MXFP4: https://huggingface.co/Launch80/Qwen3.8-27B-MACaQ-MXFP4-SABER
- Drafter DFlash2 W4A8 (recomendado): https://huggingface.co/Launch80/Qwen3.8-27B-DFlash2-Drafter-W4A8-SABER
- Drafter DFlash2 FP8: https://huggingface.co/Launch80/Qwen3.8-27B-DFlash2-Drafter-FP8-SABER
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper de referencia MACaQ: https://arxiv.org/abs/2611.10649
