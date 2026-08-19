# scottlowry/Ornith-1.5-35B-A3B-oQ4e-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ4e-mtp es una versión cuantizada del modelo Ornith-1.5-35B-A3B, desarrollado por el usuario scottlowry en formato MLX. Se trata de una cuantización de 4 bits con grupo de 64 (oQ4e) aplicada mediante la herramienta oMLX v0.6.2, que reduce el tamaño del modelo original para facilitar su ejecución en dispositivos Apple Silicon y otras plataformas compatibles con MLX. El modelo base, Ornith-1.5-35B-A3B, es un modelo de lenguaje de tipo Mixture of Experts (MoE) con arquitectura qwen3_5_moe, aunque no se dispone de detalles adicionales sobre su entrenamiento o capacidades en la información proporcionada.

La relevancia de esta cuantización radica en que permite desplegar un modelo de 35B parámetros (con 3B activos) en hardware con memoria limitada, manteniendo un equilibrio entre rendimiento y eficiencia. Sin embargo, la información pública disponible es escasa: no se especifican licencia, idiomas soportados, ni resultados de benchmarks, por lo que esta ficha se basa únicamente en los datos de la model card y la búsqueda web realizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (Mixture of Experts) |
| Parametros totales | 35B (nominal, modelo base) |
| Parametros activos | 3B (por la nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (oQ4e) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

Nota: El repositorio contiene archivos safetensors con un total de 6.190.932.912 parámetros, que corresponden a los pesos cuantizados, no al número de parámetros del modelo original. El tamaño del repositorio es de 21.6 GB.

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna ni el proceso de entrenamiento del modelo base Ornith-1.5-35B-A3B. Según los tags de HuggingFace, la arquitectura es `qwen3_5_moe`, lo que indica que se trata de un modelo basado en la familia Qwen3.5 con arquitectura MoE, donde solo 3B de los 35B parámetros totales se activan por token. El modelo cuantizado aquí presentado es una conversión a 4 bits mediante la herramienta oQ (parte de oMLX), que emplea cuantización de precisión mixta. No hay información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

No se han publicado capacidades específicas para este modelo cuantizado ni para el modelo base en la información proporcionada. Dado que se trata de un modelo de lenguaje de gran tamaño con arquitectura MoE, es razonable esperar que pueda realizar tareas de generación de texto, razonamiento, codificación y comprensión multilingüe, pero no se dispone de confirmación oficial. Tampoco hay datos sobre soporte de tool calling, agentes o modos de pensamiento extendido.

## Casos de uso

Al carecer de documentación oficial, los casos de uso son inferencias basadas en el tipo de modelo:

- Despliegue local en equipos Apple Silicon: al estar en formato MLX y cuantizado a 4 bits, puede ejecutarse en Macs con memoria unificada de 32 GB o más, permitiendo prototipado y experimentación sin depender de la nube.
- Inferencia en entornos con VRAM limitada: la cuantización reduce el tamaño a unos 21.6 GB, lo que permite su ejecución en GPUs de 24 GB (como RTX 3090/4090) con frameworks compatibles con MLX.
- Investigación académica: el modelo base, al ser de tipo MoE, puede ser útil para estudiar eficiencia de parámetros y comportamiento de modelos activos por token, aunque no hay papers publicados que lo respalden.
- Generación de texto y asistencia conversacional: si el modelo base tiene capacidades similares a otros modelos de su tamaño, podría usarse para chatbots, resúmenes o redacción creativa, pero esto no está verificado.
- Experimentación con cuantización: el repositorio sirve como ejemplo de aplicación de oQ a un modelo MoE, útil para desarrolladores interesados en técnicas de compresión.
- Evaluación comparativa de cuantización: permite comparar el rendimiento entre la versión original y la cuantizada, aunque no se han publicado resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo cuantizado ni para el modelo base.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 21.6 GB, por lo que se recomienda al menos 24 GB de memoria para cargar el modelo completo en GPU o memoria unificada.
- GPU recomendadas: RTX 3090, RTX 4090, A100 (40 GB) o superior; en Apple Silicon, Macs con 32 GB o más de RAM unificada.
- Compatibilidad con consumer GPU: sí, en GPUs de 24 GB como la RTX 3090/4090, aunque el formato MLX está orientado principalmente a Apple Silicon; para GPUs NVIDIA se necesitaría conversión a otros formatos (por ejemplo, GGUF o FP16).
- Opciones de despliegue: al ser MLX, se puede usar con la librería `mlx-lm` o `omlx`; para otros entornos, habría que convertir los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Dado que el modelo base es un MoE de 35B con 3B activos, podría compararse con otros MoE como Qwen3-30B-A3B o DeepSeek-V2-Lite, pero no hay datos de rendimiento ni de licencia para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- No se especifica la licencia del modelo, por lo que su uso comercial es incierto y requiere verificación con el autor.
- Al ser una cuantización de 4 bits, puede haber pérdida de precisión en tareas complejas de razonamiento o generación de código.
- No hay documentación sobre sesgos, riesgos de alucinación o limitaciones idiomáticas.
- El formato MLX limita su uso a ecosistemas compatibles (principalmente Apple Silicon); para otras plataformas se requiere conversión.
- La fecha de creación del repositorio (agosto de 2026) es futura, lo que sugiere que el modelo puede estar en fase experimental o no validado ampliamente.
- No se han publicado benchmarks, por lo que el rendimiento real es desconocido.

## Enlaces

- [HuggingFace - scottlowry/Ornith-1.5-35B-A3B-oQ4e-mtp](https://huggingface.co/scottlowry/Ornith-1.5-35B-A3B-oQ4e-mtp)
- [oQ / oMLX (herramienta de cuantización)](https://github.com/jundot/omlx)
- [Colección Ornith-1.5 en HuggingFace](https://huggingface.co/collections/ornith-ai/ornith-15)
- [Página oficial de Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [BenchLM - Ornith-1.5-35B-A3B](https://benchlm.ai/models/ornith-1-5-35b-a3b)
