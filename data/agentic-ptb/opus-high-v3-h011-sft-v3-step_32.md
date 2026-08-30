# agentic-ptb/opus-high-v3.h011.sft-v3.step_32

## Resumen

`opus-high-v3.h011.sft-v3.step_32` es un checkpoint intermedio derivado de un run de entrenamiento del proyecto AgentPTB, concretamente de la ejecución `opus-high-v3` realizada con Claude Code. El modelo base es `Qwen/Qwen3.5-9B-Base`, un transformer denso de 9.409.813.744 parámetros. El autor lo etiqueta explícitamente como `intermediate` y `negative-results`, indicando que el run no produjo ninguna mejora en los pesos entrenados respecto al modelo base.

Este checkpoint se publica con fines de reproducibilidad y estudio cualitativo, no como un modelo listo para uso en producción. La propia model card advierte que no se debe inferir calidad a partir de su publicación. Es relevante para investigadores interesados en el análisis de fallos de entrenamiento, la reproducibilidad de pipelines de SFT (supervised fine-tuning) y la comparación de checkpoints intermedios, pero no para desarrolladores que busquen un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9.400 millones de parametros. No se dispone de detalles sobre la configuracion exacta (numero de capas, cabezas de atencion, dimension del hidden state) en la informacion proporcionada.

El entrenamiento corresponde a un run de SFT (supervised fine-tuning) denominado `opus-high-v3`, ejecutado dentro del proyecto AgentPTB. Segun la model card, el run se identifica como `h011` (hora 11) y el checkpoint proviene de `scratch/agent/sft-v3/weights/step_32`. El resultado del run fue negativo: no se encontro ninguna mejora en los pesos entrenados respecto al modelo base. No se proporcionan datos sobre el dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Qwen3.5-9B-Base, aunque no se han verificado en este checkpoint.
- Razonamiento y codigo: potencialmente presentes por el modelo base, pero sin validacion publica en este checkpoint.
- No se ha documentado soporte de tool calling, function calling, agentes, vision, audio ni modo thinking especifico para este checkpoint.
- Capacidades multilingues: no disponibles.

## Casos de uso

Dado el caracter de checkpoint intermedio con resultados negativos, los casos de uso son limitados y orientados a investigacion:

- Reproducibilidad de experimentos: permite replicar el run `opus-high-v3` y verificar los resultados negativos reportados por el autor.
- Analisis de fallos de entrenamiento: util para estudiar por que un run de SFT no logra mejorar los pesos, comparando este checkpoint con el modelo base.
- Estudio de checkpoints intermedios: investigadores pueden analizar la evolucion de las metricas a lo largo de los pasos de entrenamiento (step_32) y comparar con otros checkpoints del mismo run.
- Comparacion de pipelines de SFT: sirve como referencia para evaluar la calidad de otros runs del proyecto AgentPTB (por ejemplo, `opus-high-v2`).
- Investigacion sobre degradacion de pesos: el hecho de que el run no mejorara los pesos puede ser un caso de estudio sobre overfitting, problemas de optimizacion o calidad del dataset.
- No se recomienda su uso en produccion, inferencia o aplicaciones reales debido a la ausencia de validacion y al resultado negativo del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar. Ademas, la advertencia de la model card indica que no se debe inferir calidad a partir de la publicacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 9.409 millones de parametros en precision FP16, se necesitarian aproximadamente 18,8 GB solo para los pesos, mas overhead de activaciones. En cuantizacion INT8 se reduciria a unos 9,4 GB, y en INT4 a unos 4,7 GB, pero no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: no disponible. Un modelo de 9B en FP16 cabe en una GPU con 24 GB (RTX 3090/4090, A10G, L4) o en una A100 de 40 GB con margen. En cuantizacion INT4 podria ejecutarse en GPUs de 8 GB.
- No se ha verificado si el checkpoint funciona correctamente en consumer GPUs, dado que no se ha validado su calidad.
- Opciones de despliegue: no disponibles. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI. Al ser un checkpoint intermedio sin validacion, no se recomienda su despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo base Qwen3.5-9B-Base es el unico punto de referencia directo, pero no se han publicado metricas comparativas entre este checkpoint y el base. Alternativas de la misma categoria (modelos de ~9B parametros) como Llama 3.1 8B o Mistral 7B no son comparables directamente porque este checkpoint no ha sido evaluado. Se indica "no disponible" para la comparativa.

## Limitaciones y advertencias

- Resultado negativo de entrenamiento: el run no produjo ninguna mejora en los pesos entrenados. El checkpoint puede ser identico o muy similar al modelo base, o incluso peor en ciertas metricas.
- Checkpoint intermedio: no es un modelo final ni validado. Su unico proposito es la reproducibilidad y el estudio cualitativo.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estandar.
- Sin informacion de contexto, idiomas ni cuantizaciones: se desconoce la ventana de contexto soportada y los idiomas cubiertos.
- Riesgo de alucinacion y sesgos: no evaluados. Al derivar de Qwen3.5-9B-Base, podria heredar sesgos del modelo base, pero no hay datos al respecto.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero el modelo no es apto para produccion por su falta de validacion.
- Advertencia del autor: "no trained weights improvement; do not infer quality from publication" (no hay mejora de pesos entrenados; no inferir calidad a partir de la publicacion).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h011.sft-v3.step_32
- Dataset del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Indice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
