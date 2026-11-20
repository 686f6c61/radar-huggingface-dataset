# QRP123/umi2nero_c100

## Resumen

umi2nero_c100 es un conjunto de tres modelos de robótica (visión-lenguaje-acción, VLA) publicados por el usuario QRP123 en Hugging Face. Cada modelo combina un backbone DINOv3 ViT-B/16 congelado y preentrenado de forma oficial con una cabeza de tipo ACT (Action Chunking Transformer) entrenada desde cero, con un horizonte de predicción de 100 pasos (action chunk 100) y un tamaño de batch de 16. El objetivo es el control de un manipulador robótico mediante comandos articulares (joint1..7 más pinza) en un espacio de acción ee_delta de 10 dimensiones.

Los tres modelos se diferencian por la estrategia de entrenamiento: U2R se entrena con 20k episodios de un dataset UMI seguidos de 30k de robot real; RU mezcla 19 episodios UMI con 8 de robot real usando la pinza solo en la fase real; R se entrena únicamente con 8 episodios de robot real. La evaluación publicada es un ajuste sobre las mismas 8 trayectorias de robot que participan en el entrenamiento, por lo que los resultados miden capacidad de ajuste y validación de la cadena de inferencia, no generalización.

El interés del modelo es acotado pero técnico: documenta una receta concreta de transferencia desde un backbone DINOv3 congelado hacia una política de imitación con chunks largos, y ofrece métricas de error posicional y rotacional en milímetros y grados, además de un conjunto de validación UMI reservado que revela un problema claro de generalización cruzada de dominio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-B/16 (backbone congelado) + ACT (Action Chunking Transformer) entrenado desde cero |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación con action chunk de 100 pasos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`last.pt`), junto con `args.json`, `norm_stats.json`, `train_summary.json` y `reports/` |

## Arquitectura y entrenamiento

La arquitectura es un híbrido entre un encoder visual DINOv3 ViT-B/16, usado como backbone congelado con los pesos preentrenados oficiales, y una cabeza ACT entrenada desde cero. La política predice chunks de acción de 100 pasos en un espacio de acción `ee_delta` de 10 dimensiones, que se traduce a comandos articulares joint1..7 más pinza mediante la interfaz de despliegue `/slave_right/vla_joint_cmd`. El entrenamiento usa batch de 16 y no se documentan en la información disponible ni el número total de tokens, ni la composición exacta del dataset, ni si hubo etapas de RLHF o DPO.

Los tres modelos comparten la misma receta de chunk y backbone, y difieren en la mezcla de datos. U2R aplica una transferencia secuencial: 20k episodios del dataset UMI y después 30k de robot real. RU entrena conjuntamente con 19 episodios UMI y 8 de robot real, restringiendo el uso de la pinza a los datos reales. R se entrena solo con los 8 episodios de robot. La evaluación reportada es un ajuste sobre las mismas 8 trayectorias reales que forman parte del entrenamiento, por lo que no constituye una medida de generalización.

## Capacidades

- Control de manipulador robótico de 7 grados de libertad más pinza mediante predicción de chunks de acción de 100 pasos.
- Predicción en espacio de acción `ee_delta` de 10 dimensiones, traducida a comandos articulares a través de `/slave_right/vla_joint_cmd`.
- Percepción visual basada en DINOv3 ViT-B/16, un backbone de propósito general congelado.
- Ajuste fino a trayectorias concretas: error posicional medio de 1,34 mm (p95 3,02 mm) en U2R, 1,98 mm (p95 4,25 mm) en RU y 1,42 mm (p95 3,11 mm) en R sobre los datos de despliegue.
- Error rotacional medio de 0,50° (p95 0,60°) en U2R, 0,55° (p95 0,76°) en RU y 0,51° (p95 0,70°) en R.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, visión general, audio ni modo de pensamiento.

## Casos de uso

- Validación de la cadena de inferencia robótica: los tres modelos sirven para comprobar de extremo a extremo la interfaz `/slave_right/vla_joint_cmd` y el pipeline de comandos articulares antes de desplegar una política definitiva.
- Ajuste de precisión en tareas de posicionamiento repetitivas: con errores medios de 1,3 a 2,0 mm en los datos de entrenamiento, U2R y R son adecuados para tareas de pick-and-place donde la trayectoria esté cubierta por el dataset real.
- Estudio de transferencia desde datos UMI: U2R permite analizar si el preentrenamiento con 20k episodios UMI mejora el ajuste posterior con 30k de robot real, comparando su error con el de R.
- Análisis de mezcla de dominios: RU, con 19 episodios UMI y 8 de robot, permite estudiar el efecto de mezclar datos simulados o de bajo coste con datos reales en una política ACT con backbone congelado.
- Investigación sobre generalización cruzada de dominio: el conjunto de validación UMI reservado (errores de 77,3 mm en RU frente a 193,1 mm en U2R y 203,0 mm en R) sirve para cuantificar la brecha entre dominios.
- Reproducción de recetas con backbone congelado: el repositorio incluye `args.json`, `norm_stats.json`, `train_summary.json` y `reports/`, lo que permite auditar hiperparámetros y estadísticas de normalización para replicar el entrenamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. La evaluación de despliegue es un ajuste sobre las 8 trayectorias reales que también participan en el entrenamiento; la columna UMI es un conjunto reservado.

| Modelo | Datos / currículo | Deploy pos mean / p95 | Deploy rot mean / p95 | UMI reservado pos mean / p95 |
|---|---|---|---|---|
| U2R | 20k UMI → 30k robot | 1,34 / 3,02 mm | 0,50 / 0,60° | 193,1 / 418,3 mm |
| RU | 19 UMI + 8 robot, pinza solo en real | 1,98 / 4,25 mm | 0,55 / 0,76° | 77,3 / 174,7 mm |
| R | 8 episodios solo robot | 1,42 / 3,11 mm | 0,51 / 0,70° | 203,0 / 434,9 mm |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 1,5 GB, lo que sugiere que los pesos caben en GPUs de consumo, pero no se detalla el desglose por modelo ni el consumo en tiempo de ejecución.
- GPU recomendadas: no disponible. No se especifican modelos concretos (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el tamaño del repositorio (1,5 GB) es compatible con GPUs de gama media, pero no se aportan datos de latencia ni de memoria real.
- Opciones de despliegue: el autor documenta la interfaz `/slave_right/vla_joint_cmd` para comandos articulares (joint1..7 más pinza) con espacio de acción `ee_delta` 10D. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| umi2nero_c100 (U2R / RU / R) | DINOv3 ViT-B/16 congelado + ACT | no disponible | action chunk 100 | no disponible | Hugging Face, 0 descargas |
| Alternativas ACT con backbone congelado | no disponible | no disponible | no disponible | no disponible | no disponible |
| Políticas VLA de gran escala (p. ej., RT-2, OpenVLA) | no disponible en esta ficha | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa fiable con alternativas concretas.

## Limitaciones y advertencias

- La evaluación de despliegue se realiza sobre las mismas 8 trayectorias reales que participan en el entrenamiento; los errores de 1,3 a 2,0 mm reflejan ajuste, no generalización.
- La generalización cruzada de dominio es deficiente: en el conjunto UMI reservado, el error posicional medio va de 77,3 mm (RU) a 203,0 mm (R), con p95 de hasta 434,9 mm.
- El modelo está especializado en un único manipulador y una única interfaz de despliegue (`/slave_right/vla_joint_cmd`); no es un modelo de propósito general.
- No se documentan sesgos conocidos, pero al ser una política de imitación entrenada con pocos episodios reales (8), es probable que reproduzca sesgos y limitaciones de esas trayectorias.
- Riesgo de alucinación no aplicable en el sentido de generación de texto; el riesgo equivalente es la ejecución de acciones fuera de distribución ante entradas visuales no vistas.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no disponibles: no se especifica ningún soporte lingüístico.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-20), por lo que no hay evidencia de validación externa.
- No se documentan requisitos de hardware, latencias ni throughput, lo que dificulta una planificación de producción.

## Enlaces

- Hugging Face: https://huggingface.co/QRP123/umi2nero_c100
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
