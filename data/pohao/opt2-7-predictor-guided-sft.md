# PoHao/opt2.7-predictor-guided-sft

## Resumen

El modelo `PoHao/opt2.7-predictor-guided-sft` es un fine-tuning supervisado (SFT) del modelo base `facebook/opt-2.7b`, desarrollado por el usuario PoHao. La particularidad de este ajuste reside en la técnica de **predictor-guided fine-tuning**: en lugar de actualizar todos los parámetros de las capas finales, solo se modifican las neuronas de la subcapa `fc1` que son seleccionadas por un predictor de activación (cuyo repositorio se referencia como `PoHao/opt2.7-fc1-predictor`). Este enfoque busca reducir el coste computacional del entrenamiento y posiblemente mejorar la regularización, aunque no se aportan métricas comparativas en la documentación disponible.

El modelo se presenta como una alternativa al fine-tuning denso estándar, con una versión de referencia en `PoHao/opt2.7-standard-sft`. El repositorio contiene un único subdirectorio correspondiente a una ejecución de entrenamiento con una semilla concreta (`seed1303`), lo que sugiere que se trata de un experimento de investigación más que de un modelo listo para producción. La licencia es Apache 2.0, lo que permite uso comercial y modificación, pero la ausencia de documentación sobre capacidades, benchmarks o limitaciones limita su aplicabilidad directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OPT-2.7B) |
| Parametros totales | 2.7 mil millones (heredados del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/opt-2.7b`, un transformer decoder-only de 2.7 mil millones de parámetros lanzado por Meta en 2022. El fine-tuning se realiza mediante **SFT (supervised fine-tuning)** con una técnica denominada *predictor-guided*: un predictor de activación (entrenado previamente, ver `PoHao/opt2.7-fc1-predictor`) identifica qué neuronas de la capa `fc1` de las últimas capas son relevantes para la tarea, y solo esas neuronas se actualizan durante el entrenamiento. El resto de parámetros permanecen congelados. Este enfoque reduce el número de parámetros entrenables y, potencialmente, el riesgo de sobreajuste, aunque no se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. La model card indica que cada subcarpeta del repositorio corresponde a una ejecución con distinta semilla aleatoria, lo que sugiere un estudio de reproducibilidad.

## Capacidades

- No se dispone de información específica sobre capacidades adicionales más allá de las del modelo base OPT-2.7B.
- El modelo base es capaz de generación de texto, completado y razonamiento básico, pero no se documentan capacidades como tool calling, agentes, visión o audio para este fine-tuning concreto.
- No se menciona soporte multilingüe ni modos especiales de razonamiento.

## Casos de uso

- No se han documentado casos de uso específicos para este modelo.
- Dado que es un fine-tuning de OPT-2.7B, podría emplearse en tareas de generación de texto, pero no hay información concreta sobre su rendimiento en aplicaciones reales.
- La técnica de predictor-guided podría ser de interés para investigadores que estudien eficiencia en fine-tuning, pero no se ofrecen ejemplos prácticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K, ni comparaciones con el modelo base o con la versión estándar SFT.

## Requisitos de hardware

- No se dispone de información específica sobre requisitos de hardware para este modelo.
- El tamaño del repositorio es de 16.7 GB, lo que sugiere que los pesos están almacenados en un formato de alta precisión (posiblemente fp32 o fp16), pero no se especifica.
- Para un modelo de 2.7B parámetros, se estima que la inferencia en fp16 requeriría al menos 5.4 GB de VRAM solo para los pesos, pero esta cifra no está confirmada por el autor.
- No se mencionan opciones de despliegue (vLLM, llama.cpp, etc.) ni latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `facebook/opt-2.7b` (base) | 2.7B | no disponible | MIT (original) | safetensors | Modelo original sin fine-tuning |
| `PoHao/opt2.7-standard-sft` | 2.7B | no disponible | Apache 2.0 | safetensors | Fine-tuning denso estándar (referencia) |
| `PoHao/opt2.7-predictor-guided-sft` | 2.7B | no disponible | Apache 2.0 | safetensors | Fine-tuning con predictor-guided |

No se dispone de datos de rendimiento para comparar objetivamente estos modelos. La comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos, riesgos de alucinación o limitaciones de contexto o idioma.
- Al ser un fine-tuning de OPT-2.7B, es probable que herede las limitaciones del modelo base (p. ej., ventana de contexto limitada, posibles sesgos en datos de entrenamiento), pero no se documentan explícitamente.
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentación y de benchmarks hace recomendable una evaluación exhaustiva antes de su uso en producción.
- El repositorio parece ser un experimento de investigación (una sola semilla, sin métricas), por lo que su robustez no está garantizada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/PoHao/opt2.7-predictor-guided-sft)
- [Modelo base facebook/opt-2.7b](https://huggingface.co/facebook/opt-2.7b)
- [Predictor de activación PoHao/opt2.7-fc1-predictor](https://huggingface.co/PoHao/opt2.7-fc1-predictor)
- [Versión estándar SFT PoHao/opt2.7-standard-sft](https://huggingface.co/PoHao/opt2.7-standard-sft)
- [Ficha de OPT-2.7B en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/opt-2.7b-facebook)
