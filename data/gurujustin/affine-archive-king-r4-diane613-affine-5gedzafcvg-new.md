# gurujustin/affine-archive-king-r4-diane613-affine-5gedzafcvg-new

## Resumen

Este modelo es una copia de archivo de una submissión de la red Bittensor SN120 (Affine), concretamente del checkpoint `diane613/affine-5gedzafcvg-new` en su revisión `dbcaf7533ce0d9d2b8a769793d95a70a14b2ab96`. Fue coronado como "rey" del reinado 4 de SN120 el 1 de septiembre de 2026, con un margen de +0.00232 y un z-score de 3.08, lo que indica que obtuvo el mejor rendimiento en los duelos de validación de esa ronda. El repositorio actual, mantenido por `gurujustin`, tiene como objetivo preservar el checkpoint original antes de que el repositorio fuente sea eliminado, garantizando así la disponibilidad del modelo para la comunidad.

El modelo cuenta con 35.951.822.704 parámetros (aproximadamente 35,95 mil millones) y está etiquetado con el tag `qwen3_5_moe`, lo que sugiere que se basa en una arquitectura de mezcla de expertos (MoE) de la familia Qwen 3.5, aunque no hay confirmación oficial de los detalles arquitectónicos. El tamaño del repositorio es de 71,9 GB, consistente con un modelo de este volumen en formato safetensors. No se dispone de información pública sobre licencia, idiomas soportados, pipeline de uso ni detalles de entrenamiento, lo que limita su evaluación directa para aplicaciones productivas.

La relevancia de este modelo radica en su procedencia: forma parte del ecosistema Bittensor, una red descentralizada de modelos de IA donde los participantes compiten en tareas de validación. Su condición de "rey" en el reinado 4 indica que superó a otros modelos en las evaluaciones de esa ronda, aunque no se han publicado los resultados detallados de dichas evaluaciones. Para desarrolladores e investigadores, este checkpoint puede servir como referencia para estudiar el rendimiento de modelos MoE en el contexto de Bittensor, o como base para fine-tuning, siempre que se respeten las condiciones de la red (aunque la licencia no está especificada).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), probablemente basada en Qwen 3.5 (según tag `qwen3_5_moe`), sin confirmación oficial |
| Parametros totales | 35.951.822.704 (35,95 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se proporciona el checkpoint en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información oficial sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados. El tag `qwen3_5_moe` sugiere que el modelo emplea una arquitectura de mezcla de expertos (MoE), típica de la familia Qwen 3.5, pero no hay confirmación de los detalles (número de expertos, top-k, etc.). Tampoco se conocen el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. El modelo proviene de una submissión de la red Bittensor SN120 (Affine), donde los participantes entrenan modelos y los someten a duelos de validación; el hecho de que haya sido coronado "rey" indica que obtuvo la mejor puntuación en su ronda, pero los criterios exactos de evaluación no están documentados en la información disponible.

## Capacidades

No se dispone de información pública sobre las capacidades específicas del modelo. Dado su tamaño (35,95 B parámetros) y su probable arquitectura MoE, es plausible que pueda realizar tareas de generación de texto, razonamiento, código o matemáticas, pero no hay evidencia concreta. Tampoco se conocen capacidades como tool calling, soporte de agentes, multimodalidad o modo de pensamiento. Se recomienda tratar este modelo como un checkpoint sin documentar y evaluar sus capacidades de forma empírica antes de cualquier uso.

## Casos de uso

No se han documentado casos de uso específicos para este modelo en la información disponible. Al ser un archivo de preservación de una submissión de Bittensor, su utilidad principal es la investigación y el análisis comparativo dentro del ecosistema SN120. Sin datos sobre capacidades, no es posible recomendar aplicaciones concretas. Se sugiere a los desarrolladores interesados que realicen pruebas propias para determinar si el modelo es adecuado para tareas como generación de texto, razonamiento o código, pero esto queda fuera del alcance de esta ficha por falta de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Aunque el modelo fue coronado "rey" en el reinado 4 de SN120, los detalles de las evaluaciones (métricas, comparaciones, etc.) no están accesibles en el repositorio ni en la documentación proporcionada. Los registros de duelos están referenciados en un enlace externo (S3 de Hippius), pero no se han incluido datos concretos en esta ficha.

## Requisitos de hardware

- VRAM estimada: con 35,95 B parámetros, en precisión FP16 el modelo ocuparía aproximadamente 72 GB de VRAM; en int8 (~36 GB) o int4 (~18 GB) podría caber en GPUs de gama alta, pero no hay confirmación de que el checkpoint sea compatible con cuantizaciones sin pérdida de calidad.
- GPU recomendadas: para inferencia en FP16 se necesitaría una GPU con al menos 80 GB de VRAM (por ejemplo, A100 80GB, H100 80GB) o múltiples GPUs. Para cuantización int8, una RTX 4090 (24 GB) no sería suficiente; se requeriría al menos 36 GB, por lo que una A6000 (48 GB) o A100 40GB podría ser viable. En int4, una RTX 4090 podría ser suficiente, pero no se ha verificado.
- Opciones de despliegue: al ser un modelo safetensors, podría cargarse con frameworks como vLLM, llama.cpp (si se convierte a GGUF) o Hugging Face Transformers, pero no hay documentación que confirme compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (tamaño y arquitectura MoE) dentro del contexto de Bittensor SN120. No se puede establecer una comparativa fiable sin datos de rendimiento o especificaciones detalladas.

## Limitaciones y advertencias

- No se conoce la licencia del modelo; su uso comercial o de redistribución podría estar restringido por las reglas de Bittensor SN120, aunque no se especifica.
- No hay documentación sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- El modelo es un archivo de preservación; no se garantiza su funcionamiento correcto fuera del entorno original de validación.
- La arquitectura exacta no está confirmada; el tag `qwen3_5_moe` es una pista, pero no una especificación oficial.
- No se han publicado benchmarks ni evaluaciones independientes, por lo que el rendimiento real es desconocido.
- El repositorio fuente original (`diane613/affine-5gedzafcvg-new`) podría ser eliminado, y esta copia es la única referencia disponible.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/gurujustin/affine-archive-king-r4-diane613-affine-5gedzafcvg-new
- Repositorio fuente original: https://huggingface.co/diane613/affine-5gedzafcvg-new
- Registros de duelos y veredictos de SN120: https://s3.hippius.com/affine-sn120/evals/index.jsonl
