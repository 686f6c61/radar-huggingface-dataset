# bambocher/Qwen3.5-0.8B-heretic-oQ4e-mtp

## Resumen

Qwen3.5-0.8B-heretic-oQ4e-mtp es una version cuantizada y "decensurada" (ablacionada mediante la tecnica Heretic) del modelo Qwen3.5-0.8B de Alibaba Qwen. El checkpoint lo publica el usuario bambocher en Hugging Face y combina tres intervenciones: la eliminacion de comportamientos de rechazo mediante Arbitrary-Rank Ablation (ARA), una cuantizacion de precision mixta con oQ (oMLX v0.7.3) y la conservacion de la cabeza de prediccion multi-token (MTP) del modelo original.

El modelo tiene 873.438.784 parametros reales segun los tensores safetensors, distribuidos en un backbone de lenguaje (0.752B), un modulo de vision (0.101B) y una cabeza MTP (0.020B). La cuantizacion resultante ocupa 0.623 GiB con un promedio efectivo de 6.123 bits por peso, lo que lo hace util para inferencia local en Apple Silicon mediante la libreria MLX.

Su relevancia es doble: por un lado, permite ejecutar un modelo multimodal con capacidad de decodificacion especulativa (via MTP) en hardware de consumo; por otro, ilustra el estado del arte de las tecnicas de ablacion de rechazos, reduciendo de 97/100 a 0/100 las respuestas de negativa en la evaluacion del autor, a costa de una divergencia KL de 0.1412 respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con cabeza MTP, cuantizado en precision mixta (oQ) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 4-bit (grupo 64), 5-bit, 6-bit, 8-bit y BF16 en mezcla; promedio efectivo 6.123 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer multimodal que integra un modulo de vision de 0.101B de parametros junto al backbone de lenguaje de 0.752B. Sobre esa base se conserva una cabeza de prediccion multi-token (MTP) de 0.020B, pensada para decodificacion especulativa y aceleracion de la generacion. La cuantizacion oQ aplica precision mixta: el 64,3% de los pesos logicos quedan en 4 bits, el 21,3% en 5 bits, el 2,5% en 6 bits y el 11,8% se mantiene en BF16, lo que sugiere que las capas mas sensibles (probablemente embeddings, normas y la cabeza MTP) se preservan en mayor precision.

El proceso de "decensurado" se realizo con Heretic v2.0.0 aplicando Arbitrary-Rank Ablation entre las capas 1 y 19, con un peso de preservacion de comportamiento bueno de 0.8199, un peso de steering de comportamiento malo de 0.0001, un peso de sobrecorreccion relativa de 1.0547 y 14 vecinos. No se dispone de informacion sobre el dataset de entrenamiento original de Qwen3.5-0.8B, el numero de tokens ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3.5-0.8B.
- Procesamiento de vision: el checkpoint incluye un modulo visual de 0.101B de parametros, por lo que admite entradas de imagen.
- Decodificacion especulativa mediante la cabeza MTP conservada, que permite proponer varios tokens por paso y acelerar la generacion.
- Reduccion drastica de rechazos: 0/100 negativas frente a 97/100 del original en la evaluacion del autor.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint de 0.623 GiB puede cargarse en un Mac con MLX y ejecutarse sin GPU dedicada, lo que lo hace adecuado para prototipado rapido y aplicaciones de escritorio.
- Asistentes conversacionales sin filtros de rechazo: para investigacion sobre comportamiento de modelos, evaluacion de sesgos o generacion de contenido creativo sin negativas, gracias a la ablacion Heretic aplicada.
- Procesamiento de documentos con imagen: el modulo de vision permite extraer texto y describir figuras en capturas o escaneos, con la ventaja de un peso reducido.
- Generacion acelerada con decodificacion especulativa: la cabeza MTP permite implementar decodificacion especulativa en pipelines de MLX, reduciendo la latencia por token en comparacion con un modelo sin MTP.
- Educacion e investigacion: util como banco de pruebas para estudiar el efecto de la cuantizacion de precision mixta y de la ablacion ARA sobre el comportamiento del modelo.
- Aplicaciones embebidas o de borde: el tamano de 0.668 GB en disco y su bajo consumo de memoria permiten desplegarlo en dispositivos con recursos limitados donde un modelo de 7B no cabria.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen/Qwen3.5-0.8B |
|---|---|---|
| Rechazos (sobre 100) | 0/100 | 97/100 |
| Divergencia KL | 0.1412 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.623 GiB de pesos mas overhead de activaciones y cache KV; en la practica, menos de 2 GB para contexto corto.
- GPU recomendadas: no disponible; el modelo esta empaquetado para MLX, orientado a Apple Silicon (series M1, M2, M3, M4).
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon; en GPU NVIDIA o AMD requeriria conversion a otro formato, no disponible en el repo.
- Opciones de despliegue: MLX (libreria nativa), oMLX para cuantizacion; no se indica soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-0.8B-heretic-oQ4e-mtp | 0.873B | no disponible | no disponible | safetensors (MLX) | Version decensurada y cuantizada, con MTP |
| Qwen/Qwen3.5-0.8B | 0.873B (estimado) | no disponible | no disponible | safetensors | Modelo original, sin ablacion ni cuantizacion |
| Alternativas de ~1B en MLX | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- La ablacion Heretic elimina los rechazos, lo que implica que el modelo puede generar contenido danino, sesgado o inapropiado sin filtro; no es apto para produccion orientada al publico sin moderacion externa.
- La divergencia KL de 0.1412 respecto al original indica una degradacion medible de la distribucion de salida; puede afectar a la calidad en tareas que requerian el comportamiento original.
- La cuantizacion de precision mixta introduce perdida adicional de precision, especialmente en las capas en 4 bits.
- Licencia no disponible: no puede confirmarse el uso comercial ni las obligaciones de atribucion.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento aceptable fuera del ingles o el chino sin evaluacion previa.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin medirla.
- Riesgo de alucinacion inherente a los modelos de menos de 1B de parametros, agravado por la cuantizacion.
- El checkpoint esta empaquetado exclusivamente para MLX; su uso fuera de Apple Silicon requiere conversion y no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic-oQ4e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Heretic: https://heretic-project.org
- oQ / oMLX: https://github.com/jundot/omlx
