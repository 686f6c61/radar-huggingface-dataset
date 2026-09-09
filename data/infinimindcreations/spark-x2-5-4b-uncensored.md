# InfinimindCreations/Spark-X2.5-4B-uncensored

## Resumen

Spark-X2.5-4B-uncensored es una versión modificada del modelo base XHToken/Spark-X2.5-4B, publicada por InfinimindCreations. Su objetivo es eliminar los comportamientos de rechazo del modelo original mediante una técnica de abliteración con proyección bipreservadora de norma. El modelo pasa de rechazar el 59 % de los prompts dañinos evaluados a un 0 % de rechazos, manteniendo la perplexidad estable.

Se trata de un modelo de generación de texto con 4.112.079.360 parámetros (4,1 B), basado en una arquitectura transformer personalizada identificada como Spark2_5. La información sobre la longitud de contexto no está disponible en la documentación proporcionada. La relevancia del modelo radica en que ofrece una evaluación cuantificada del efecto de la abliteración, incluyendo métricas de divergencia KL, perplexidad y throughput, así como parches de compatibilidad para transformers 5.x.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (arquitectura personalizada Spark2_5, no especificada en detalle) |
| Parametros totales | 4.112.079.360 (4,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (requiere `trust_remote_code=True`; incluye parches para transformers 5.x) |

## Arquitectura y entrenamiento

El modelo deriva de XHToken/Spark-X2.5-4B, cuya arquitectura interna no se detalla en la información disponible. La modificación se realizó mediante abliteración con la herramienta heretie en modo biprojection, una técnica de ortogonalización que preserva la norma de los pesos. Se atacaron las matrices `mlp.down_proj` y `attn.out_proj` en las 36 capas del modelo. Se ejecutó una búsqueda de hiperparámetros con Optuna de 320 ensayos, seleccionando la configuración con mejor equilibrio entre divergencia KL y eliminación de rechazos.

Los pesos modificados alcanzaron un factor máximo de 1,30 en `out_proj` (capa 21.3) y 1,32 en `down_proj` (capa 22.3). Además, se aplicaron cuatro parches de compatibilidad sobre el código remoto original para que funcione con transformers 5.x. No se documentan datos de entrenamiento adicionales, ni técnicas de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva, sin soporte documentado para visión, audio o tool calling.
- Eliminación de rechazos en prompts dañinos: 0 rechazos en 400 prompts evaluados, frente a 236 rechazos del modelo base.
- Mantiene la capacidad de generación original: el cambio de perplexidad en wikitext-103 es de -0,06 %.
- Soporte de generación coherente con una pérdida de throughput de solo el 0,5 % respecto al modelo base.
- Modelo monolingüe en inglés.
- Requiere `trust_remote_code=True` para cargar la arquitectura personalizada.

## Casos de uso

- Investigación en seguridad de IA: comparar el comportamiento del modelo base y el abliterado permite medir el efecto de la eliminación de rechazos en respuestas a prompts dañinos.
- Desarrollo de herramientas de moderación: usar este modelo como adversario para evaluar sistemas de filtrado y detección de contenido dañino.
- Análisis de sesgos de rechazo: estudiar cómo el modelo base de origen chino se comporta en temas políticamente sensibles antes y después de la abliteración.
- Generación de contenido creativo sin restricciones: producir textos donde el modelo original tendería a negarse, manteniendo coherencia según las métricas de perplexidad.
- Pruebas de estrés de prompts de jailbreak: emplear las categorías de SORRY-Bench y JailbreakBench para validar si sistemas de seguridad externos pueden ser evadidos.
- Benchmarking de métodos de alineación: reproducir los experimentos de refusals, KL y perplexity para evaluar bibliotecas como heretie y sus configuraciones.

## Benchmarks y rendimiento

Los datos del autor se basan en evaluaciones de 500 prompts en 72 categorías, ejecutados tanto sobre el modelo base como sobre el modificado.

| Benchmark | n | Modelo base rechaza | Este modelo rechaza |
|---|---|---:|---:|
| Abliteration-Eval (dañino, 20 categorías) | 200 | 168 | 0 |
| SORRY-Bench (44 categorías) | 75 | 34 | 0 |
| JailbreakBench (10 categorías) | 25 | 19 | 0 |
| HarmBench (8 categorías) | 25 | 8 | 0 |
| Temas políticamente sensibles (68 tópicos) | 75 | 7 | 0 |
| Abliteration-Eval (sobre-rechazo, 10 tipos) | 50 | 1 | 0 |
| XSTest (seguro) | 25 | 0 | 0 |
| Capacidad general | 25 | 0 | 0 |

Métricas adicionales del autor:

| Metrica | Valor |
|---|---|
| Divergencia KL | 0,0042 |
| Cambio de perplexidad (wikitext-103) | -0,06 % |
| Cambio de throughput | -0,5 % |
| Capas modificadas | 36 / 36 |

No se han publicado resultados de benchmarks específicos como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- No hay datos oficiales sobre VRAM o GPUs recomendadas.
- El checkpoint en safetensors ocupa 8,2 GB, lo que sugiere que en bfloat16/FP16 se necesitan al menos 8,2 GB de VRAM para los pesos, más la sobrecarga de caché KV y activaciones.
- Puede caber en GPUs de consumidor con 12 GB o más, como RTX 3060 12 GB, RTX 4070 12 GB o RTX 4090 24 GB, aunque no hay confirmación oficial.
- Es compatible con la biblioteca transformers mediante `trust_remote_code=True`; no se documentan integraciones específicas con vLLM, TGI, Ollama o llama.cpp.
- El autor mide una caída de throughput del 0,5 % respecto al modelo base, pero no se proporcionan valores absolutos de latencia.

## Comparativa con modelos similares

No se dispone de información comparativa en los datos proporcionados. El modelo es una variante uncensored de XHToken/Spark-X2.5-4B, y existen otras abliteraciones del mismo modelo base, pero no se presentan datos de rendimiento para comparar. Por tanto, la comparación con alternativas se indica como no disponible.

## Limitaciones y advertencias

- Al eliminar los rechazos, el modelo puede generar contenido dañino, ilegal o éticamente cuestionable. El usuario es responsable del uso.
- No se han publicado medidas de alucinación o exactitud factual; el modelo de 4,1 B puede producir respuestas inventadas.
- Solo soporta inglés; la documentación no indica soporte multilingüe.
- La longitud de contexto no está documentada, por lo que la ventana de atención real es desconocida.
- El modelo requiere parches de compatibilidad con transformers 5.x; usar otras versiones de la biblioteca puede provocar fallos o comportamiento inconsistente.
- El método de conteo de rechazos excluye deliberadamente palabras clave como "illegal", "harmful" o "sorry" para evitar falsos positivos. Esto puede llevar a subestimar rechazos en evaluaciones automatizadas externas.
- La licencia Apache 2.0 permite uso comercial, pero no exime de responsabilidades legales derivadas del contenido generado.

## Enlaces

- HuggingFace: https://huggingface.co/InfinimindCreations/Spark-X2.5-4B-uncensored
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Herramienta heretie: https://github.com/p-e-w/heretic
- Blog sobre biprojection: https://huggingface.co/blog/grimjim
- Dataset Abliteration-Eval: https://huggingface.co/datasets/treadon/abliteration-eval
- Dataset SORRY-Bench: https://huggingface.co/datasets/MultiverseComputingCAI/llm-refusal-evaluation
