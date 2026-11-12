# bambocher/Qwen3.5-0.8B-heretic-oQ2e-mtp

## Resumen

Qwen3.5-0.8B-heretic-oQ2e-mtp es una cuantizacion mixta de precisión del modelo Qwen3.5-0.8B de Alibaba Qwen, publicada por el usuario bambocher en Hugging Face. Sobre la base original se ha aplicado un proceso de "decensurado" mediante la herramienta Heretic v2.0.0, que reduce drásticamente la tasa de rechazos del modelo (de 97/100 a 0/100 en la evaluacion del autor) a costa de una divergencia KL de 0.1412 respecto al original. El checkpoint conserva la cabeza de prediccion multi-token (MTP) intacta y anade un modulo de vision, lo que lo convierte en un modelo multimodal de muy pequeno tamano.

El modelo resultante tiene 873.438.784 parametros totales (0.873B), de los cuales 0.752B corresponden al modelo de lenguaje, 0.101B al codificador de vision y 0.020B a la cabeza MTP. La cuantizacion se realizo con oMLX v0.7.3 (oQ, mixed-precision) y da como resultado un peso efectivo medio de 4.685 bits por parametro, con un almacenamiento total de solo 0.476 GiB. Esto lo hace especialmente atractivo para inferencia en Apple Silicon mediante MLX, donde el formato nativo y el bajo consumo de memoria son criticos.

Su relevancia actual radica en dos factores: por un lado, demuestra que es posible ejecutar un modelo multimodal con capacidad de prediccion especulativa en hardware de consumo con menos de 1 GB de pesos; por otro lado, ejemplifica la tendencia de "decensurado" via ablacion de direcciones (ARA) para eliminar comportamientos de rechazo, algo relevante para investigadores que estudian alineamiento y seguridad en modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con cabeza MTP; arquitectura exacta no disponible |
| Parametros totales | 873.438.784 (0.873B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 2-bit g64, 3-bit g128, 3-bit g64, 4-bit g64, 5-bit g64 y BF16 (media efectiva 4.685 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer de la familia Qwen3.5 con un modulo de vision (0.101B de parametros) y una cabeza de prediccion multi-token (MTP, 0.020B). La cabeza MTP permite decodificacion especulativa, es decir, predecir varios tokens por paso para acelerar la generacion, y en este checkpoint se ha conservado intacta. El modelo de lenguaje ocupa 0.752B parametros y el conjunto se ha cuantizado con oMLX v0.7.3 en precision mixta: las capas mas sensibles se mantienen en BF16 (11.8% de los pesos) o 5-bit, mientras que el grueso se comprime a 2-bit y 3-bit con grupos de 64 y 128.

El proceso de "decensurado" se realizo con Heretic v2.0.0 aplicando Arbitrary-Rank Ablation (ARA) sobre las capas 1 a 19, con pesos de preservacion de comportamiento bueno de 0.8199, de steering de comportamiento malo de 0.0001 y de sobrecorreccion relativa de 1.0547, usando 14 vecinos. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3.5-0.8B.
- Procesamiento de vision: el checkpoint incluye un modulo de vision de 0.101B parametros, por lo que se espera soporte de entrada de imagenes (no se detalla en la model card).
- Prediccion multi-token (MTP): la cabeza especulativa se conserva, lo que permite decodificacion especulativa para acelerar la inferencia.
- Reduccion de rechazos: segun el autor, 0/100 rechazos frente a 97/100 del original, lo que implica mayor disposicion a responder consultas que el modelo base rechazaria.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la ablacion ARA comparando respuestas con el Qwen3.5-0.8B original, midiendo la perdida de comportamientos de rechazo y la divergencia KL (0.1412) de forma controlada.
- Inferencia local en Apple Silicon: con 0.476 GiB de pesos en formato MLX, se puede ejecutar en un Mac con 8 GB de RAM unificada, ideal para prototipos y demos sin GPU dedicada.
- Pruebas de decodificacion especulativa: al conservar la cabeza MTP, sirve para evaluar el speedup de la prediccion multi-token en un modelo pequeno y comparar latencias frente a decodificacion autoregresiva estandar.
- Prototipado multimodal de bajo coste: el modulo de vision permite experimentar con tareas imagen-texto en entornos con recursos muy limitados, como clasificacion o descripcion de imagenes en un portatil.
- Generacion de texto en dispositivos edge: su tamano inferior a 1 GB lo hace apto para aplicaciones embebidas o moviles donde no cabe un modelo de 7B, con la contrapartida de menor calidad.
- Evaluacion de cuantizacion mixta: el checkpoint es un caso de estudio de oQ/oMLX para medir el impacto de distribuciones de bits no uniformes (2-bit a BF16) en la calidad de un modelo pequeno.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen/Qwen3.5-0.8B |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0.1412 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0.5 GB para los pesos en el formato cuantizado; con overhead de runtime, se recomienda al menos 1-2 GB de memoria unificada.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son los chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es un formato pensado para CUDA.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon y 8 GB o mas de memoria unificada. En GPUs NVIDIA no es directamente utilizable sin conversion.
- Opciones de despliegue: MLX (libreria nativa), oMLX; no se indica soporte de vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-0.8B-heretic-oQ2e-mtp | 0.873B | no disponible | no disponible | safetensors (MLX) | Decensurado, cuantizacion mixta 4.685 bits/peso, MTP y vision |
| Qwen/Qwen3.5-0.8B | 0.8B (aprox.) | no disponible | no disponible | safetensors | Modelo base original, 97/100 rechazos |
| Alternativas de ~1B en MLX | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con modelos de la misma categoria mas alla del modelo base.

## Limitaciones y advertencias

- El proceso de decensurado elimina los rechazos (0/100), lo que implica que el modelo puede generar contenido que el original rechazaria; no es apto para aplicaciones de produccion sin moderacion externa.
- La divergencia KL de 0.1412 respecto al original indica una degradacion medible de la distribucion de salida, con posible perdida de calidad en tareas generales.
- La cuantizacion agresiva (35.7% de los pesos a 2-bit) puede degradar el razonamiento y la coherencia, especialmente en tareas complejas.
- No se dispone de informacion sobre sesgos, idiomas soportados ni evaluaciones de alucinacion.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que verificar la licencia del modelo base Qwen3.5-0.8B.
- El formato MLX limita el despliegue a hardware Apple; no hay pesos GGUF ni safetensors estandar para CUDA.
- La model card no documenta la longitud de contexto ni el pipeline, lo que dificulta planificar su uso en produccion.
- El autor indica que el checkpoint se re-cuantizo el 2026-11-12; versiones anteriores pueden tener pesos distintos.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic-oQ2e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Heretic: https://heretic-project.org
- oMLX (oQ): https://github.com/jundot/omlx
