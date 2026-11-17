# gaotang/MBT-3-branch-W4

## Resumen

MBT-3-branch-W4 es un checkpoint de investigación publicado por el usuario gaotang (GaotangLi) dentro de su proyecto Multi-Branch Transformer. Se trata de la variante final "Balanced 3-branch Joint-KV" en la escala W4, un modelo de generación de texto de arquitectura experimental multi-rama con mezcla de expertos (MoE) que se desvía del transformer denso estándar. Cuenta con 2.057.208.064 parámetros y fue entrenado sobre 78.841.380.864 tokens con una longitud de contexto de 4.096 tokens.

El modelo no es un producto listo para producción: es un checkpoint nativo de investigación en formato propietario (`mbt-native-shared-kv-v1`) que requiere la implementación nativa basada en Megatron del proyecto para cargarse. No es compatible con `AutoModel` de Transformers ni con vLLM, y la release no incluye runtime de inferencia ni tokenizador. Su interés es fundamentalmente académico: permite reproducir y auditar los experimentos de arquitecturas multi-rama con atención compartida (Joint-KV) y enrutamiento persistente entre ramas.

La relevancia actual es limitada fuera del ámbito de investigación, pero resulta útil para quienes estudian alternativas a los transformers densos, estrategias de asignación de parámetros entre ramas y diseños MoE con buffers de enrutamiento persistentes. La model card reporta una pérdida de validación fija final de 2,366 sobre un conjunto held-out de 12.160 secuencias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multi-Branch Transformer con Joint-KV y mixture-of-experts (3 ramas balanceadas) |
| Parámetros totales | 2.057.208.064 |
| Parámetros activos | no disponible |
| Longitud de contexto | 4.096 tokens (entrenamiento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato nativo `mbt-native-shared-kv-v1`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Multi-Branch Transformer con tres ramas balanceadas y un mecanismo de atención compartida Joint-KV. La asignación de parámetros reportada es 4 / (6 + 6 + 6) / 5, y el checkpoint incorpora buffers de enrutamiento persistentes propios de un diseño con mezcla de expertos. El entrenamiento se realizó con el optimizador Megatron, alcanzando la actualización final número 75.189, sobre un total de 78.841.380.864 tokens y con contexto de 4.096 tokens. La validación se efectuó sobre un conjunto held-out fijo de 12.160 secuencias, con una pérdida final de 2,366.

El checkpoint es "model-only": no incluye estado del optimizador, RNG, dataset de entrenamiento ni tokenizador. Los ficheros JSON del repositorio contienen los metadatos completos de arquitectura y tensores. La carga requiere la implementación nativa basada en Megatron del proyecto Multi-Branch Transformer; no es compatible con `AutoModel` de Transformers ni con vLLM. El tokenizador original (Llama 3) debe obtenerse por separado bajo sus propios términos de acceso y licencia. No se documentan en la información disponible detalles sobre RLHF, DPO ni composición del dataset.

## Capacidades

- Generación de texto en inglés como tarea principal (`text-generation`).
- Arquitectura experimental con enrutamiento entre ramas y atención Joint-KV, orientada a investigación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- No incluye runtime de inferencia ni tokenizador en la release.

## Casos de uso

- Reproducción de experimentos académicos: el checkpoint permite replicar los resultados del proyecto Multi-Branch Transformer cargando los pesos con la implementación nativa Megatron y verificando la pérdida de validación reportada (2,366) sobre el conjunto fijo de 12.160 secuencias.
- Estudio de arquitecturas multi-rama: sirve para analizar cómo se distribuyen los parámetros entre las tres ramas (asignación 4/(6+6+6)/5) y el comportamiento del enrutamiento persistente en tareas de generación de texto.
- Investigación sobre atención Joint-KV: permite comparar el mecanismo de atención compartida frente a atención multi-cabeza estándar en modelos de ~2B parámetros.
- Auditoría de checkpoints de investigación: los ficheros JSON de metadatos y el SHA256 publicado permiten verificar integridad y estructura de tensores en pipelines de validación reproducibles.
- Base para fine-tuning experimental: al ser un checkpoint model-only, puede servir como punto de partida para experimentos propios, siempre que se disponga del tokenizador Llama 3 y de la implementación nativa.
- Docencia y formación: útil como ejemplo práctico de diseños alternativos a transformers densos en cursos de arquitecturas de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de validación fija final (2,366) sobre el conjunto held-out de 12.160 secuencias.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 2.057.208.064 parámetros en safetensors (4,1 GB de repo), una carga en FP16 requeriría aproximadamente 4,1 GB de pesos, más memoria para activaciones y buffers de enrutamiento.
- GPU recomendadas: no disponible; al no existir runtime estándar (vLLM, TGI), no se documentan configuraciones validadas.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de pesos (~4 GB en FP16) cabría teóricamente en GPUs de consumo con suficiente VRAM, pero la falta de runtime estándar impide confirmarlo.
- Opciones de despliegue: únicamente la implementación nativa basada en Megatron del proyecto Multi-Branch Transformer; no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MBT-3-branch-W4 | 2.057.208.064 | 4.096 | no disponible | Checkpoint de investigación, runtime nativo requerido |
| Alternativas de ~2B densos | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría; la naturaleza experimental y el formato nativo del checkpoint dificultan la comparación directa con modelos estándar.

## Limitaciones y advertencias

- Checkpoint exclusivamente de investigación: no es un modelo listo para producción.
- Formato nativo propietario (`mbt-native-shared-kv-v1`): requiere la implementación Megatron del proyecto; no funciona con `AutoModel` de Transformers ni con vLLM.
- No incluye tokenizador: debe obtenerse por separado el tokenizador Llama 3 bajo sus propios términos de acceso y licencia.
- No incluye runtime de inferencia en la release de pesos.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Solo inglés: no se documentan capacidades multilingües.
- Contexto limitado a 4.096 tokens en entrenamiento.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K, etc.).
- Sin datos de cuantización: no se documentan formatos GGUF, GPTQ ni AWQ.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gaotang/MBT-3-branch-W4
- Proyecto Multi-Branch Transformer: https://github.com/GaotangLi/Multi-Branch-Transformer
