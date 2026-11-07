# Minguinho-zeze/Qwen3-1.7B-W2A16-RTN

## Resumen

Qwen3-1.7B-W2A16-RTN es un checkpoint experimental de cuantizacion post-entrenamiento (PTQ) del modelo Qwen3-1.7B de Alibaba Qwen, publicado por el usuario Minguinho-zeze dentro del proyecto lowbit-reasoning-ptq. Aplica cuantizacion simetrica de pesos a 2 bits (INT2) con activaciones de 16 bits, tamano de grupo 128 y algoritmo RTN (round-to-nearest), dejando sin cuantizar el embedding, las capas de normalizacion y el `lm_head`. El modelo base es un transformer decoder-only de 1.720.574.976 parametros (1,7 B) con modo de razonamiento (thinking mode) heredado de la familia Qwen3.

El checkpoint no es una release de produccion: es un artefacto de investigacion publicado para reproducir y diagnosticar un fallo. Segun la model card, el modelo obtiene un 0,00 % de acierto tanto en AIME-120 como en GPQA Diamond, frente al 40,00 % y 40,40 % del Qwen3-1.7B en BF16 bajo el mismo protocolo. El autor lo describe explicitamente como un caso de "accuracy collapse" y advierte de que no se recomienda para inferencia practica.

Su relevancia es, por tanto, metodologica: sirve como referencia negativa para estudiar los limites de la cuantizacion a 2 bits en modelos pequenos con capacidad de razonamiento, y como ejemplo de publicacion de checkpoints fallidos con trazabilidad completa (config.json, recipe.yaml, quant_meta.json y resultados de evaluacion por semilla). El repo ocupa 1,0 GB y la licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), pesos cuantizados con compressed-tensors |
| Parametros totales | 1.720.574.976 (1,7 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 34.816 tokens configurados en el ejemplo de despliegue (heredada de Qwen3-1.7B; no se especifica en la model card) |
| Tipos de cuantizacion | W2A16: pesos INT2 simetricos, activaciones 16 bits, group size 128, RTN; embedding, norm y lm_head sin cuantizar (81,9079 % de parametros cuantizados) |
| Idiomas soportados | No disponible (no se declara lista de idiomas en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (no es GGUF ni AutoAWQ) |

## Arquitectura y entrenamiento

El modelo base Qwen3-1.7B es un transformer decoder-only de la familia Qwen3, con modo de pensamiento explicito activable mediante `enable_thinking` en la plantilla de chat. Este checkpoint no introduce cambios arquitectonicos: solo sustituye los pesos de las capas lineales por versiones cuantizadas a INT2 simetrico con granularidad de grupo 128, manteniendo activaciones en 16 bits y la KV cache en BF16 durante la evaluacion. La cuantizacion es weight-only y no utiliza datos de calibracion, ya que RTN opera directamente sobre los pesos.

No se realizo entrenamiento adicional ni ajuste fino tras la cuantizacion. El entorno de referencia registrado es vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0 y humming-kernels 0.1.17, sobre GPUs Blackwell; el autor advierte de que otras GPUs y combinaciones de paquetes no han sido validadas. Para INT2, el pipeline anade el directorio de la libreria CUDA NVRTC a `LD_LIBRARY_PATH` antes de la compilacion JIT de Humming. La evaluacion se hizo con thinking mode activado, temperatura 0,6, top-p 0,95, top-k desactivado y un presupuesto de salida de 32.768 tokens.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3-1.7B.
- Razonamiento con modo de pensamiento explicito (`enable_thinking=True`), segun el ejemplo de uso de la model card.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Capacidad efectiva en la practica: segun la evaluacion del autor, el checkpoint colapsa y obtiene 0 % en los benchmarks de razonamiento reportados, por lo que sus capacidades funcionales no estan demostradas.

## Casos de uso

- Reproduccion de fallos de cuantizacion: el checkpoint permite reproducir el colapso de precision documentado (0 % en AIME-120 y GPQA Diamond) y comparar la ruta de referencia frente a kernels comprimidos con los registros incluidos en `diagnostics/`.
- Diagnostico de kernels de cuantizacion: util para verificar el comportamiento de kernels INT2 (Humming) en distintas formas de tensor, aunque el autor advierte de que los diagnosticos incluidos no establecen la correccion del kernel para todas las formas.
- Investigacion sobre PTQ de bajo bit en modelos pequenos: sirve como punto de partida para estudiar por que la cuantizacion W2A16 con RTN destruye la capacidad de razonamiento en un modelo de 1,7 B.
- Referencia negativa en articulos y comparativas: util como baseline de "que no funciona" al evaluar metodos alternativos de cuantizacion (por ejemplo, el checkpoint NVFP4A16-RTN del mismo autor).
- Validacion de pipelines de evaluacion: los resultados por semilla, longitudes de token, truncamiento y velocidad guardados en `eval_results.json` permiten auditar el protocolo de evaluacion de razonamiento.
- Pruebas de integracion de compressed-tensors con vLLM: el ejemplo de carga documenta la configuracion exacta del motor, util para validar despliegues de checkpoints cuantizados en entornos controlados.
- No es adecuado para atencion al cliente, generacion de codigo en produccion ni ningun uso que requiera precision, dado el colapso reportado.

## Benchmarks y rendimiento

Media de acierto en porcentaje sobre las semillas 0, 1 y 2; cada semilla evalua las mismas 120 preguntas de AIME y 198 de GPQA Diamond (repeticiones de generacion, no preguntas independientes). Thinking mode activado, temperatura 0,6, top-p 0,95, presupuesto de salida de 32.768 tokens; las respuestas truncadas se puntuan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-1.7B BF16 | 40,00 | 40,40 |
| Este checkpoint (W2A16-RTN) | 0,00 | 0,00 |

Estos resultados describen el protocolo del experimento y no son resultados oficiales de Qwen. El autor no establece ninguna conclusion sobre la causa del fallo ni sobre la correccion del algoritmo o del metodo de calibracion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo pesa 1,0 GB en safetensors, muy por debajo del BF16 del modelo base, pero se requiere compilacion JIT de kernels INT2.
- GPUs recomendadas: el experimento se ejecuto en GPUs Blackwell; otras GPUs no han sido validadas por esta release.
- GPU de consumo: no confirmado; el checkpoint no es GGUF y no se ha validado en tarjetas consumer.
- Opciones de despliegue: vLLM 0.32.0 con compressed-tensors 0.17.0 y humming-kernels 0.1.17; no compatible con llama.cpp, Ollama ni TGI segun la informacion disponible.
- Configuracion del motor en el ejemplo: `max_model_len=34816`, `gpu_memory_utilization=0.90`, `enable_prefix_caching=False`, `tokenizer_mode="hf"`.
- Latencia y throughput: no disponibles; los datos de velocidad por semilla estan en `eval_results.json`, fuera de la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | AIME-120 | GPQA Diamond | Licencia |
|---|---|---:|---|---:|---:|---|
| Qwen3-1.7B-W2A16-RTN (este) | 1,7 B | W2A16, RTN, grupo 128 | 34.816 (config. de despliegue) | 0,00 | 0,00 | Apache-2.0 |
| Qwen3-1.7B (BF16) | 1,7 B | Ninguna (BF16) | No disponible en la informacion | 40,00 | 40,40 | Apache-2.0 |
| Qwen3-1.7B-NVFP4A16-RTN | 1,7 B | W4A16, RTN, grupo 16 | No disponible en la informacion | No disponible | No disponible | Apache-2.0 |

## Limitaciones y advertencias

- Colapso de precision documentado: 0,00 % en AIME-120 y GPQA Diamond, frente a ~40 % del modelo base en BF16. No recomendado para inferencia practica.
- Sesgos conocidos: no disponible; no se han publicado analisis de sesgo para este checkpoint.
- Riesgo de alucinacion: elevado por el fallo de cuantizacion; las salidas no son fiables.
- Limitaciones de contexto e idioma: la model card no declara idiomas soportados ni garantiza el comportamiento del contexto mas alla de la configuracion del ejemplo.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el estado funcional del checkpoint lo desaconseja en produccion.
- Entorno validado muy estrecho: solo GPUs Blackwell con vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0 y humming-kernels 0.1.17; otras combinaciones no estan validadas.
- Dependencia de compilacion JIT de kernels INT2 (Humming) y de la libreria CUDA NVRTC, lo que anade fragilidad al despliegue.
- Los diagnosticos incluidos no establecen la causa del fallo ni la correccion del kernel en todas las formas de tensor.
- El ejemplo de carga no se ha vuelto a ejecutar desde la revision subida a Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-W2A16-RTN
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio lowbit-reasoning-ptq: https://github.com/minguinho26/lowbit-reasoning-ptq
- Resultados completos de evaluacion (Qwen3-1.7B, 2026-11-08): https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-1.7b-20261108
- Snapshot de codigo del experimento: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/a851e3957297eaa52d0344a50bd0bbc7e87d5378
- Script del motor de inferencia: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/a851e3957297eaa52d0344a50bd0bbc7e87d5378/src/engine.py
- Checkpoint hermano NVFP4A16-RTN: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-NVFP4A16-RTN
