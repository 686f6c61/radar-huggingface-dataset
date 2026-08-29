# qbz506/kinetic-eqlm-46m-compute-matched

## Resumen

El modelo `kinetic-eqlm-46m-compute-matched` es el artefacto principal del programa Kinetic AI, desarrollado por qbz506. Se trata de un modelo de lenguaje basado en una arquitectura de equilibrio profundo (deep equilibrium, DEQ) con un bloque transformer de pesos compartidos (weight tying) aplicado doce veces, a la misma anchura que un baseline convencional de doce capas. Esto garantiza que el coste computacional por token sea idéntico al del baseline, pero con 2,7 veces menos parámetros (45,8 millones frente a 123,8 millones).

El modelo está entrenado exclusivamente con el dataset BabyLM-2026-Strict y su calidad se evalúa mediante el benchmark BLiMP, que mide conocimiento gramatical a través de pares mínimos. En esa métrica alcanza un ratio de 0,958 ± 0,017 frente al baseline (1,000), es decir, aproximadamente un 96 % de la calidad con un 63 % menos de parámetros. La relevancia de este modelo reside en su demostración de que el weight tying en arquitecturas DEQ permite comprimir el número de parámetros sin sacrificar demasiada calidad, aunque con limitaciones importantes en cuanto a escalado y memoria de activaciones.

El repositorio incluye dos formatos: `model.safetensors` (183 MB en bf16, con el tying preservado) y `model_depth12.onnx` (337 MB, con el tying de embedding/head duplicado por el exportador). No se proporciona GGUF porque llama.cpp no puede expresar el weight sharing y el desenrollado necesario produciría un archivo 4,9 veces mayor que el baseline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deep equilibrium (DEQ) con bloque transformer de pesos compartidos, 12 iteraciones |
| Parametros totales | 45.800.450 (45,8 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se menciona bf16 para los pesos residentes) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de equilibrio profundo (DEQ) en la que un único bloque transformer con pesos compartidos se aplica iterativamente doce veces. A diferencia de un transformer apilado convencional, donde cada capa tiene sus propios pesos, aquí el mismo bloque se reutiliza, lo que reduce drásticamente el número de parámetros. El coste computacional por token es idéntico al de un modelo de doce capas explícitas (84,9 millones de unidades de cómputo), de ahí el nombre "compute-matched". El entrenamiento se realizó desde cero sobre el dataset BabyLM-2026-Strict, aunque no se especifican el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. La model card indica que la conversión de modelos preentrenados a esta arquitectura falla (daño inicial de 64 a 270 veces la perplejidad base) y que la destilación logit barata no superó el umbral pre-registrado, por lo que el entrenamiento desde cero es el único camino viable.

## Capacidades

- Modelado de lenguaje: genera texto y modela distribuciones de probabilidad sobre secuencias, aunque no se documentan capacidades específicas de generación creativa o de código.
- Evaluación gramatical: el modelo se evalúa con BLiMP, un benchmark de pares mínimos que cubre 31 fenómenos lingüísticos (concordancia, anáfora, sintaxis, etc.), alcanzando un ratio de 0,954 sobre el baseline.
- Profundidad ajustable: al ser un modelo de equilibrio, se puede variar el número de iteraciones del solver (4, 8 o 12) en tiempo de inferencia, degradando suavemente la calidad (0,93 del baseline a mitad de profundidad).
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo.

## Casos de uso

- Investigación en eficiencia paramétrica: el modelo sirve como banco de pruebas para estudiar cómo el weight tying en arquitecturas DEQ reduce el número de parámetros manteniendo una calidad razonable, útil para publicaciones y experimentos académicos.
- Estudio de trade-offs entre memoria y cómputo: permite analizar el ahorro en pesos (183 MB frente a 496 MB) frente al aumento en memoria de activaciones (2,3 veces peor en batch 1), información clave para diseñar sistemas con restricciones de VRAM.
- Evaluación de fenómenos gramaticales: al estar entrenado en BabyLM y evaluado con BLiMP, es adecuado para investigar qué aspectos de la gramática inglesa captura un modelo con pesos compartidos.
- Comparación de arquitecturas: sirve como referencia para comparar el rendimiento de modelos DEQ frente a transformers apilados con el mismo presupuesto computacional.
- Exploración de inferencia con profundidad variable: su capacidad de ajustar el número de iteraciones permite experimentar con el equilibrio entre latencia y calidad en entornos de investigación.
- Docencia y divulgación: por su tamaño reducido y licencia Apache 2.0, es un ejemplo didáctico para explicar conceptos de weight tying, deep equilibrium y eficiencia paramétrica.

## Benchmarks y rendimiento

La model card reporta únicamente resultados en BLiMP, comparando el modelo con un baseline explícito de 12 capas con el mismo coste computacional. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Metrica | kinetic-eqlm-46m | Baseline 12 capas |
|---|---|---|
| Parametros | 45,8 M | 123,8 M |
| Peso residente (bf16) | 183 MB | 496 MB |
| Computo por token | 84,9 M unidades | 84,9 M unidades |
| BLiMP ratio (3 semillas) | 0,958 ± 0,017 | 1,000 |
| BLiMP ratio (31 fenomenos) | 0,954 | 1,000 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 45,8 millones de parámetros en bf16, los pesos ocupan aproximadamente 183 MB. Añadiendo activaciones y overhead, la VRAM necesaria es inferior a 1 GB, por lo que cabe en cualquier GPU consumer moderna (por ejemplo, NVIDIA GTX 1060 6 GB o superior).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en batch pequeño. Para entrenamiento o fine-tuning, se recomienda al menos 8 GB.
- Opciones de despliegue: al no proporcionarse GGUF, no es compatible con llama.cpp ni Ollama directamente. Se puede usar con frameworks que soporten ONNX (por ejemplo, ONNX Runtime) o cargando los safetensors con PyTorch y un solver DEQ personalizado.
- Latencia y throughput: no se han publicado datos oficiales. Dado el tamaño reducido, se espera una latencia baja en GPU, pero el coste de las iteraciones del solver DEQ puede aumentar el tiempo de inferencia respecto a un modelo apilado equivalente.

## Comparativa con modelos similares

La única comparación documentada es contra el baseline explícito de 12 capas del propio proyecto. No se dispone de datos de otros modelos de tamaño similar (por ejemplo, GPT-2 pequeño, DistilBERT, etc.) en la información proporcionada.

| Modelo | Parametros | Contexto | BLiMP ratio | Licencia |
|---|---|---|---|---|
| kinetic-eqlm-46m | 45,8 M | no disponible | 0,958 | Apache 2.0 |
| Baseline 12 capas (mismo proyecto) | 123,8 M | no disponible | 1,000 | Apache 2.0 |

## Limitaciones y advertencias

- No supera al baseline en calidad: el gap es de aproximadamente un 4 % en BLiMP, y la modulación de profundidad no lo cierra (de hecho, lo empeora).
- Memoria de activaciones elevada: en batch 1, el solver de Anderson hace que el pico de activaciones sea 2,3 veces peor que el baseline, lo que puede anular el ahorro de memoria en pesos en ciertos escenarios.
- Escalado problemático: convertir modelos preentrenados a esta arquitectura falla (daño inicial de 64 a 270 veces la perplejidad base), y la destilación logit barata no superó el umbral pre-registrado (−2,2 % frente al +15 % requerido).
- Sin soporte GGUF: llama.cpp no puede expresar el weight sharing, por lo que el modelo no es directamente utilizable en ecosistemas basados en GGUF (Ollama, llama.cpp).
- Idioma limitado: solo inglés, sin capacidades multilingües documentadas.
- Sin datos de contexto: no se especifica la longitud máxima de secuencia, lo que dificulta su uso en aplicaciones que requieran ventanas largas.
- Modelo de investigación: no está pensado para producción; su valor principal es académico y experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qbz506/kinetic-eqlm-46m-compute-matched
- Repositorio de investigación (hallazgos F44–F53): https://github.com/SharathSPhD/game-llm
- Modelo relacionado (121M): https://huggingface.co/qbz506/kinetic-eqlm-121m-babylm
- Modelo relacionado (anytime 121M): https://huggingface.co/qbz506/kinetic-eqlm-anytime-121m-babylm
