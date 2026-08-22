# MuXodious/Qwen3.8-27B-absolute-heresy-LoRA

## Resumen

El modelo `MuXodious/Qwen3.8-27B-absolute-heresy-LoRA` es un adaptador LoRA (Low-Rank Adaptation) diseñado para eliminar los mecanismos de rechazo del modelo base `Qwen/Qwen3.8-27B`. Ha sido desarrollado por MuXodious utilizando la herramienta Heretic v1.4.0, que implementa una técnica de abliteración: una modificación de pesos basada en el análisis de las direcciones de activación asociadas a las respuestas de rechazo. El resultado es un adaptador que, aplicado al modelo base, reduce drásticamente la tasa de negativas ante peticiones que el modelo original rechaza sistemáticamente.

Este adaptador es relevante para desarrolladores e investigadores que necesitan modelos sin restricciones de contenido para tareas como generación creativa, roleplay, análisis de sesgos o evaluación de robustez. Al ser un adaptador LoRA, no sustituye al modelo completo, sino que se carga sobre el modelo base, lo que permite activar o desactivar el comportamiento "decensorizado" de forma flexible. El repositorio ocupa 0,3 GB y está publicado bajo licencia Apache 2.0.

La arquitectura subyacente es la del modelo base Qwen3.8-27B, un transformer de 64 capas con tamaño oculto de 5.120, atención por grupos (GQA) con 24 cabezas de consulta y 4 de clave/valor, y una capa feed-forward de 17.408 unidades. El adaptador modifica selectivamente las proyecciones de salida de atención (`attn.o_proj`) y las proyecciones descendentes del MLP (`mlp.down_proj`), según los parámetros de abliteración documentados. No se dispone de información sobre la longitud de contexto, los idiomas soportados ni los tipos de cuantización del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.8-27B (transformer, 64 capas, hidden 5120, GQA 24/4) |
| Parametros totales | no disponible (adaptador LoRA, tamano del repo 0,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador es safetensors; el modelo base admite cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye mediante abliteración, una técnica que identifica una dirección en el espacio de activaciones del modelo asociada a las respuestas de rechazo y la elimina o atenúa. Heretic v1.4.0 calcula esta dirección a partir de un conjunto de ejemplos de peticiones que el modelo original rechaza, y genera un LoRA que modifica los pesos de las capas de atención y MLP para suprimir esa dirección. Los parámetros de abliteración reportados incluyen un `direction_index` de 37,44 y pesos máximos/mínimos en `attn.o_proj` y `mlp.down_proj`, lo que indica una intervención localizada en esas proyecciones.

No se ha publicado información sobre el dataset utilizado para el análisis, ni sobre procesos de fine-tuning tradicionales como RLHF o DPO. El entrenamiento se limita a la generación del adaptador mediante el algoritmo de Heretic, sin datos de entrenamiento adicionales. La divergencia KL entre el modelo con adaptador y el modelo original es de 0,0759, lo que sugiere una desviación moderada en la distribución de salidas, mientras que la tasa de rechazos cae de 101/101 en el original a 2/101 con el adaptador.

## Capacidades

- El adaptador no introduce capacidades nuevas; modifica el comportamiento del modelo base reduciendo los rechazos ante peticiones que el modelo original considera no seguras o controvertidas.
- El modelo base Qwen3.8-27B es un LLM multimodal (pipeline `image-text-to-text`), aunque no se especifica si el adaptador afecta a la parte visual. Las capacidades de generación de texto, razonamiento y código del modelo base se mantienen, pero no hay datos concretos sobre su rendimiento en estas tareas.
- No se documenta soporte explícito para tool calling, agentes o razonamiento multi-paso. Estas capacidades, si existen, provienen del modelo base y no del adaptador.
- El adaptador es compatible con el modelo base y, según el autor, puede aplicarse también a fine-tunes o merges basados en Qwen3.8-27B, aunque con resultados variables.

## Casos de uso

- Investigacion sobre alineacion y sesgos: el adaptador permite estudiar cómo la abliteración afecta al comportamiento del modelo, comparando las respuestas con y sin el LoRA en tareas de seguridad y contenido sensible.
- Generacion de contenido creativo sin restricciones: escritura de narrativa, roleplay o diálogos con temáticas adultas o controvertidas que el modelo base rechazaría, útil en entornos de ficción o simulación.
- Evaluacion de robustez: probar los límites de seguridad del modelo base y del adaptador, identificando qué tipos de peticiones siguen siendo rechazadas y cuáles se liberan.
- Desarrollo de aplicaciones de asistencia en entornos controlados: chatbots o asistentes que requieren respuestas directas sin filtros de contenido, siempre que el uso cumpla con la legislación aplicable.
- Fine-tuning posterior: usar el adaptador como punto de partida para otros ajustes, ya que su tamaño reducido (0,3 GB) facilita su integración en pipelines de entrenamiento.
- Analisis comparativo de modelos: medir la tasa de rechazo y la divergencia KL frente al modelo original, como se muestra en la sección de benchmarks, para cuantificar el efecto de la abliteración.

## Benchmarks y rendimiento

La única métrica de rendimiento publicada en la model card es la comparación entre el modelo con adaptador y el modelo original:

| Metrica | Modelo con adaptador | Modelo original (Qwen3.8-27B) |
|---|---|---|
| Divergencia KL | 0,0759 | 0 (por definicion) |
| Rechazos (sobre 101 peticiones) | 2/101 | 101/101 |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (0,3 GB), pero requiere cargar el modelo base Qwen3.8-27B, que tiene 27 mil millones de parámetros.
- VRAM estimada para inferencia del modelo base: aproximadamente 54 GB en FP16, 27 GB en cuantización de 8 bits y 14 GB en cuantización de 4 bits. El adaptador añade un pequeño overhead.
- GPU recomendadas: A100 80 GB para FP16, RTX 4090 (24 GB) o similar para cuantización de 4 bits. En GPUs con menos de 16 GB no es viable sin cuantización agresiva.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, cargando el modelo base y aplicando el adaptador LoRA en tiempo de ejecución.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos o adaptadores de la misma categoría. El adaptador es específico para Qwen3.8-27B y no se han publicado comparaciones con alternativas como Dolphin, WizardLM-Uncensored u otros modelos "uncensored". La información disponible se limita a la comparación con el modelo base original.

## Limitaciones y advertencias

- El adaptador reduce los rechazos, pero puede aumentar la generación de contenido dañino, ilegal o no ético. El uso de este modelo debe realizarse con responsabilidad y cumpliendo la legislación vigente.
- No se han evaluado sesgos del modelo con adaptador. La abliteración puede exacerbar sesgos existentes o introducir otros nuevos.
- La divergencia KL de 0,0759 indica que el adaptador altera la distribución de salidas, lo que podría degradar el rendimiento en tareas que requieren precisión o adherencia a instrucciones.
- El autor advierte que el adaptador puede funcionar "con distintos grados de éxito" al aplicarse a fine-tunes o merges basados en Qwen3.8-27B, por lo que no se garantiza su efectividad en todos los casos.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado sin restricciones puede implicar responsabilidades legales para el desarrollador.
- No se dispone de información sobre la longitud de contexto, idiomas soportados ni cuantizaciones oficiales, lo que limita la planificación de despliegues en producción.

## Enlaces

- [Adaptador LoRA en Hugging Face](https://huggingface.co/MuXodious/Qwen3.8-27B-absolute-heresy-LoRA)
- [Modelo base Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Página del modelo en FriendliAI](https://friendli.ai/models/MuXodious/Qwen3.8-27B-absolute-heresy)
- [Ficha en LLM Explorer](https://llm-explorer.com/model/MuXodious%2FQwen3.8-27B-absolute-heresy,42rktep4M9lu3P1bgxDQ6w)
- [Arquitectura del modelo en hfviewer](https://hfviewer.com/MuXodious/Qwen3.8-27B-absolute-heresy)
