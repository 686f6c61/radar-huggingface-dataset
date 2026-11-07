# Flakily6416/K2-Horizon-7B-Uno-heretic

## Resumen

K2-Horizon-7B-Uno-heretic es una modificación de comportamiento del modelo hermitdave/K2-Horizon-7B-Uno-merged, que a su vez es un merge de LoRA sobre IFM/K2-Horizon-7B-Uno. Lo publica el usuario Flakily6416 y su propósito es eliminar los rechazos (refusals) y el comportamiento adulador (sycophancy) del modelo original mediante una ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) generada con la herramienta Heretic 2.x. El resultado son pesos completos en bf16 con las LoRA ya fusionadas, que se ejecutan como un transformer autorregresivo estándar.

El modelo conserva la arquitectura y el tokenizador del modelo base, con 8.999.178.240 parámetros totales según los safetensors del repositorio (etiquetado comercialmente como "7B"). Es un modelo de razonamiento: el chat template original incluye un parámetro `reasoning_effort` con valores alto, medio y bajo, y etiquetas de pensamiento y de tool calling propias de la familia IFM (`<ifm|think*>`). La modificación no toca la plantilla ni los tensores ajenos al objetivo, de modo que el uso es idéntico al del modelo fuente.

La relevancia de esta ficha es doble: por un lado documenta una técnica de "abliteración" con métricas cuantificadas de rechazo, sycophancy y divergencia KL respecto al original; por otro, advierte de que se trata de un modelo sin filtros de seguridad, con cero descargas y cero likes en el momento de la consulta, lo que exige una evaluación propia antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (familia K2-Horizon de IFM; detalles de capas y atención no disponibles) |
| Parametros totales | 8.999.178.240 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; los pesos se distribuyen en bf16 y son compatibles con cuantización estándar (GGUF, AWQ, GPTQ) vía herramientas externas, sin recetas publicadas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, LoRA fusionada en pesos completos) |

## Arquitectura y entrenamiento

El modelo parte de IFM/K2-Horizon-7B-Uno, un modelo de razonamiento de la colección K2 Horizon de IFM, del que se hizo un merge de LoRA (hermitdave/K2-Horizon-7B-Uno-merged). Sobre esa base, Flakily6416 aplicó Heretic 2.0.0 con el modificador ARA y `lora_rank=50`, ejecutando 100 trials de Optuna que cooptimizan tres objetivos simultáneos: tasa de rechazo, tasa de sycophancy y divergencia KL frente al modelo fuente. La ablación se dirige únicamente a `self_attn.o_proj` y `mlp.down_proj` dentro del rango de capas aprendido; los tensores no objetivo muestreados (layernorms, `q_proj`, `gate_proj`) son bit a bit idénticos al original.

Los datos de entrenamiento del modelo base no se detallan en la información disponible. Para la modificación, los conjuntos usados son `mlabonne/harmful_behaviors` (test[:100] para evaluación, train[:400] como prompts "malos"), `UnstableLlama/praise` con un system prompt adulador (78 prompts retenidos para evaluación, train[:210] como prompts "malos") y `mlabonne/harmless_alpaca` (test[:100] para KL, train[:400] como prompts "buenos"). El trial seleccionado se eligió del frente de Pareto de 18 puntos por comportamiento por unidad de KL: el único trial con 0/0 costaba KL 8,9, unas 46 veces más que el elegido (KL 0,191) para ganar solo 3 puntos de palabra clave. La evaluación usó la plantilla de chat del modelo con `reasoning_effort=medium` y el salto de CoT de Heretic configurado para la familia de etiquetas `<ifm|think*>`.

## Capacidades

- Generación de texto y razonamiento explícito con modo de pensamiento controlable mediante `reasoning_effort` (high, medium, low) en `chat_template_kwargs`.
- Respuesta directa a prompts que en el modelo original disparaban rechazos: la tasa de rechazo baja de 77/100 a 3/100 en `mlabonne/harmful_behaviors` test[:100].
- Corrección de premisas falsas en lugar de adulación: la tasa de sycophancy pasa de hasta 22/78 a 0/78 en `UnstableLlama/praise`.
- Tool calling y etiquetas de pensamiento según el parche oMLX K2-Horizon (etiquetas IFM `<ifm|think*>`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no disponibles; no se documentan en la model card.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio reproducible de ablación selectiva, con métricas de rechazo, sycophancy y KL publicadas, para comparar técnicas de modificación de comportamiento sin reentrenar.
- Evaluación de robustez frente a premisas falsas: al eliminar la adulación, es útil en pruebas que miden si un modelo corrige afirmaciones erróneas del usuario en lugar de validarlas.
- Generación de datos sintéticos sin rechazos: para construir datasets de instrucciones en dominios sensibles (por ejemplo, ciberseguridad defensiva o análisis de contenido dañino) donde el modelo base se negaría a responder.
- Red teaming y pruebas de jailbreak: como objetivo controlado para medir la eficacia de clasificadores de contenido y filtros de salida, dado que su tasa de rechazo es de 3/100.
- Asistencia técnica con razonamiento multi-paso: el modo `reasoning_effort` permite ajustar la profundidad de la cadena de pensamiento en tareas de depuración o análisis, siempre que se valide la calidad frente al modelo base.
- Despliegue local en investigación: con pesos bf16 de 18 GB en el repositorio, cabe en una GPU de 24 GB en cuantización de 8 bits o en bf16 con offloading, y se sirve con un endpoint compatible con OpenAI según el ejemplo de la model card.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de la modificación frente al modelo fuente, no benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones con otros modelos.

| Metrica | Modelo fuente | Este modelo |
|---|---|---|
| Tasa de rechazo (`mlabonne/harmful_behaviors` test[:100]) | 77/100 | 3/100 |
| Tasa de sycophancy (`UnstableLlama/praise`, 78 prompts retenidos) | hasta 22/78 | 0/78 |
| Divergencia KL vs fuente (`mlabonne/harmless_alpaca` test[:100]) | — | 0,191 |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: en bf16, los 8.999.178.240 parámetros ocupan aproximadamente 18 GB solo en pesos, más KV cache y overhead; en cuantización de 8 bits, unos 9-10 GB; en 4 bits, unos 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para bf16 sin compromisos; RTX 4090 (24 GB) para bf16 con contexto moderado o 8 bits; RTX 3090/4080 (16-24 GB) en 8 o 4 bits.
- Cabe en GPU de consumo: sí, en cuantizaciones de 8 y 4 bits; en bf16 requiere 24 GB o más.
- Opciones de despliegue: el ejemplo de la model card usa un servidor compatible con OpenAI (`base_url=http://localhost:8000/v1`), lo que encaja con vLLM, TGI o llama.cpp/Ollama tras convertir los pesos. La model card menciona notas de oMLX/MLX del modelo fuente, por lo que también es desplegable en Apple Silicon vía MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modificacion de comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K2-Horizon-7B-Uno-heretic (este) | 8.999.178.240 | no disponible | ARA con Heretic 2.0.0; rechazo 3/100, sycophancy 0/78, KL 0,191 | Apache 2.0 | Hugging Face, 0 descargas |
| hermitdave/K2-Horizon-7B-Uno-merged | no disponible | no disponible | ninguna (merge de LoRA) | Apache 2.0 (según upstream) | Hugging Face |
| IFM/K2-Horizon-7B-Uno | no disponible | no disponible | ninguna (modelo original) | Apache 2.0 | Hugging Face, colección IFM |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin filtros de seguridad: la ablación reduce los rechazos de 77/100 a 3/100, por lo que puede generar contenido dañino, ilegal o inseguro. No debe exponerse a usuarios finales sin moderación externa.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad; la modificación no incluye datos que midan factualidad, y el propio autor solo verifica que las respuestas de control factual mantienen contenido y estilo.
- Sesgos: no se documentan evaluaciones de sesgo; la eliminación de la sycophancy puede cambiar la distribución de respuestas en dominios donde el modelo base era más cauto.
- Idiomas y contexto: la model card no especifica idiomas soportados ni longitud de contexto, lo que impide planificar despliegues multilingües o de contexto largo sin pruebas propias.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de IFM/K2-Horizon-7B-Uno y el usuario debe verificar que la cadena de licencias upstream se mantiene; el autor afirma que es la misma.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día; sin pipeline declarado ni resultados de benchmarks estándar. No es un artefacto validado por la comunidad.
- Reproducibilidad: los checkpoints y la configuración del proceso Heretic se conservan localmente (`E:/k2-heretic/`) y no se publican en el repositorio, por lo que la ablación no es reproducible a partir de los artefactos disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Flakily6416/K2-Horizon-7B-Uno-heretic
- Modelo base (merge): https://huggingface.co/hermitdave/K2-Horizon-7B-Uno-merged
- Modelo original: https://huggingface.co/IFM/K2-Horizon-7B-Uno
- Colección K2 Horizon de IFM: https://huggingface.co/collections/IFM/k2-horizon
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- Parche oMLX K2-Horizon: https://github.com/jundot/omlx/pull/3441
