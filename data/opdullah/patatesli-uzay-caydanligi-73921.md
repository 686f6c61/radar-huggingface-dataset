# opdullah/patatesli-uzay-caydanligi-73921

## Resumen

Patatesli Uzay Caydanligi es un checkpoint de entrenamiento derivado de google/gemma-3-4b-pt, el modelo base preentrenado (no ajustado a instrucciones) de la familia Gemma 3 de Google. Lo publica el usuario opdullah en Hugging Face y no es un modelo listo para inferencia: se trata de un checkpoint de entrenamiento distribuido que almacena parametros del modelo, estado del optimizador Adam, estado del scheduler, estado del generador de numeros aleatorios y progreso sobre los datos.

El modelo parte de la arquitectura Gemma 3 de 4.000 millones de parametros, un transformer decoder-only con contexto largo, pero el autor no documenta ningun ajuste fino orientado a tareas concretas ni publica evaluaciones. El entrenamiento se realizo con FSDP FULL_SHARD sobre dos GPU, parametros maestros en FP32, computo en BF16 y perdida causal con enmascaramiento de solo completacion, sin LoRA, PEFT, cuantizacion ni checkpointing de activaciones.

Su relevancia practica es limitada: al no ser un export cargable directamente con `from_pretrained`, solo sirve para reanudar un entrenamiento concreto que requiere el corpus privado original, el tokenizer exacto y versiones muy especificas de PyTorch, CUDA y Transformers. Resulta util unicamente como referencia de reproducibilidad para quien tenga acceso a ese entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 4B PT) |
| Parametros totales | 4.000 millones (aproximado, segun el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el checkpoint se entrena en BF16/FP32; no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use |
| Formato de pesos | checkpoint de entrenamiento distribuido (parametros, estado Adam, scheduler y RNG); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 4B en su variante preentrenada (PT), un transformer decoder-only. El autor no detalla modificaciones estructurales sobre el modelo base, por lo que se asume que conserva la configuracion original de Gemma 3 4B. El checkpoint incluye parametros del modelo, estado del optimizador Adam, estado del scheduler, estado del generador de numeros aleatorios y progreso sobre los datos.

El entrenamiento emplea FSDP FULL_SHARD sobre dos GPU, con parametros maestros y estado Adam en FP32 y computo en BF16. La funcion de perdida es causal con enmascaramiento de solo completacion (completion-only causal loss). No se utilizan LoRA, PEFT, cuantizacion ni checkpointing de activaciones. El corpus de entrenamiento, los prompts, las respuestas de referencia y los logs no se publican; el corpus fuente permanece privado. La reanudacion exige el JSONL original con el SHA256 indicado en `progress.json`, el mismo tokenizer, PyTorch 2.8, CUDA 12.8, Transformers 4.57.1 y el cargador de checkpoint adjunto, con microbatch de 1 por GPU y acumulacion de 8.

## Capacidades

- Generacion de texto: hereda la capacidad del modelo base Gemma 3 4B PT, aunque no se documenta ningun ajuste orientado a instrucciones.
- Razonamiento, codigo y matematicas: no se publican evaluaciones que confirmen el nivel alcanzado tras el entrenamiento.
- Tool calling / function calling: no disponible; el modelo base PT no esta ajustado para ello y el autor no lo menciona.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.
- Reanudacion de entrenamiento: el checkpoint permite continuar el entrenamiento si se dispone del corpus privado y del entorno exacto.

## Casos de uso

- Reproducibilidad de experimentos: un equipo con acceso al corpus privado original puede reanudar el entrenamiento usando `resume_training.py` con `--resume-checkpoint`, `--data` y `--fraction 1.0`, lo que permite auditar o continuar el proceso.
- Investigacion sobre checkpoints intermedios: sirve para estudiar el estado de un entrenamiento FSDP a mitad de camino, incluyendo el estado del optimizador y del scheduler.
- Analisis de privacidad en pesos publicos: el autor advierte que los pesos pueden memorizar parte de los datos de entrenamiento, por lo que el checkpoint es un caso de estudio sobre riesgos de memorizacion en modelos publicados.
- Validacion de pipelines de entrenamiento distribuido: el manifiesto (`MANIFEST.json`) y los metadatos de verificacion (`PUBLIC_VERIFICATION.json`) permiten comprobar la integridad de un flujo FSDP con FP32/BF16.
- Docencia sobre checkpoints frente a exports de inferencia: ilustra la diferencia entre un checkpoint de entrenamiento y un modelo listo para `from_pretrained`.
- Base para un futuro ajuste fino: si se convirtiera a un formato cargable, podria servir como punto de partida, aunque el autor no lo garantiza ni lo documenta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no ser un export de inferencia, no se puede desplegar directamente con `from_pretrained`.
- VRAM estimada para reanudar el entrenamiento: el autor indica dos GPU con FSDP FULL_SHARD, FP32 para parametros maestros y estado Adam, y BF16 para computo; no se especifica la VRAM exacta por GPU.
- GPU recomendadas: no disponibles; el autor solo menciona "two-GPU" sin modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada; el requisito de FP32 para parametros y estado Adam hace poco probable que quepa en una sola GPU de consumo.
- Opciones de despliegue: no aplicables; el checkpoint no es cargable con vLLM, llama.cpp, Ollama ni TGI sin conversion previa no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Patatesli Uzay Caydanligi | ~4.000 M | no disponible | Gemma Terms of Use | Checkpoint de entrenamiento, no cargable directamente | Requiere corpus privado y entorno exacto |
| google/gemma-3-4b-pt | ~4.000 M | no disponible en esta ficha | Gemma Terms of Use | Modelo base publico, cargable | Punto de partida del anterior |
| google/gemma-3-4b-it | ~4.000 M | no disponible en esta ficha | Gemma Terms of Use | Modelo ajustado a instrucciones, cargable | Alternativa practica para inferencia |

No se dispone de datos de rendimiento del checkpoint que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- No es un modelo de inferencia: es un checkpoint de entrenamiento y no se puede cargar con `from_pretrained` sin el cargador adjunto y el entorno exacto.
- Dependencia del corpus privado: sin el JSONL original con el SHA256 correcto no se puede reanudar el entrenamiento.
- Dependencia de versiones: requiere PyTorch 2.8, CUDA 12.8, Transformers 4.57.1 y el mismo tokenizer.
- Riesgo de memorizacion: el autor advierte que los pesos pueden memorizar aspectos de los datos de entrenamiento y que los pesos publicos no ofrecen garantia formal de privacidad.
- Idiomas no declarados: no se especifica que idiomas soporta ni como se comporta fuera del corpus de entrenamiento.
- Sin benchmarks: no hay evaluaciones publicadas que permitan estimar su calidad.
- Restricciones de licencia: sujeto a los Gemma Terms of Use y a la politica de usos prohibidos de Google, lo que condiciona el uso comercial.
- Sin garantias de produccion: al no haber sido validado ni documentado para inferencia, no es apto para despliegues en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/opdullah/patatesli-uzay-caydanligi-73921
- Modelo base: https://huggingface.co/google/gemma-3-4b-pt
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
