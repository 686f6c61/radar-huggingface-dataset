# gaotang/Standard-W1

## Resumen

Standard-W1 es un checkpoint de investigación publicado por el usuario gaotang (GaotangLi) como referencia final de escala W1 dentro de sus experimentos con la arquitectura Multi-Branch Transformer. No se trata de un modelo listo para producción: es una exportación nativa de pesos entrenados, sin tokenizer, sin runtime de inferencia y sin compatibilidad con `AutoModel` de Transformers ni con vLLM. Su interés es fundamentalmente académico, para reproducir o auditar los resultados de la línea de investigación Multi-Branch Transformer.

El modelo tiene 799.042.816 parámetros almacenados en un único archivo `model.safetensors` de aproximadamente 1,6 GB, se entrenó sobre 27.844.935.680 tokens con una longitud de contexto de 4.096 tokens y alcanzó una pérdida de validación fija de 2,653 tras 53.110 actualizaciones del optimizador. El checkpoint se organiza en 12 bloques secuenciales y emplea componentes de tipo mixture-of-experts junto con la arquitectura multi-branch propietaria.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de menos de 1.000 millones de parámetros con un presupuesto de entrenamiento inusualmente alto (unos 27,8 mil millones de tokens, más de 34 tokens por parámetro), lo que lo convierte en un caso interesante para estudiar regímenes de sobrentrenamiento en arquitecturas alternativas; por otro, advierte de las fuertes restricciones prácticas de un release que solo incluye pesos y metadatos, sin herramientas de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Branch Transformer con componentes mixture-of-experts (implementación nativa basada en Megatron) |
| Parametros totales | 799.042.816 (799.042.048 según model card) |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni variantes cuantizadas) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), formato de checkpoint `mbt-native-standard-global-v1` |
| Escala | W1 |
| Bloques | 12 bloques secuenciales |
| Tokens de entrenamiento | 27.844.935.680 |
| Actualizaciones del optimizador | 53.110 |
| Pérdida de validación fija | 2,653 |
| Conjunto de validación | 12.160 secuencias fijas de held-out |
| SHA256 de `model.safetensors` | `eb98a232b0fada9a9dc6eec0815ef1cf40a11c456025a7d2660b7b6f28aacad9` |
| Tamaño del repo | 1,6 GB |
| Tokenizer | no incluido; se indica obtener el tokenizer original de Llama 3 por separado |

## Arquitectura y entrenamiento

La arquitectura es un Multi-Branch Transformer, una variante de investigación que organiza el cómputo en ramas paralelas o secuenciales dentro del transformer, combinada con capas de mezcla de expertos (mixture-of-experts). El checkpoint se estructura en 12 bloques secuenciales y conserva los nombres de tensor originales del entrenamiento, incluidos los buffers de enrutamiento persistentes propios del esquema MoE. La implementación de referencia es nativa y está basada en Megatron, no en la pila estándar de Hugging Face Transformers.

El entrenamiento se realizó sobre 27.844.935.680 tokens con contexto de 4.096 tokens, hasta la actualización 53.110 del optimizador, y se evaluó sobre un conjunto fijo de 12.160 secuencias de validación, con una pérdida final de 2,653. No se documentan en la información disponible la composición del dataset, el uso de RLHF o DPO, ni detalles sobre la distribución de expertos, el número de ramas o el mecanismo exacto de enrutamiento. El checkpoint no incluye estado del optimizador, estado del generador aleatorio, dataset de entrenamiento ni tokenizer, y el autor indica que las comprobaciones de exportación y recarga nativa se superaron con las tolerancias documentadas en los registros de validación adjuntos.

## Capacidades

- Generación de texto en inglés: el pipeline declarado es `text-generation` y el modelo está entrenado sobre corpus en inglés.
- Razonamiento y modelado de lenguaje general: no se documentan capacidades específicas más allá de la generación de texto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repo.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Inferencia directa: no es posible sin la implementación nativa basada en Megatron, que no se incluye en este release de pesos.

## Casos de uso

- Reproducción de experimentos de investigación: cargar el checkpoint con la implementación nativa Multi-Branch Transformer para verificar la pérdida de validación de 2,653 sobre el conjunto fijo de 12.160 secuencias y contrastar los registros de validación publicados.
- Estudio de arquitecturas alternativas: analizar el comportamiento de un transformer multi-rama con MoE a escala de 799 millones de parámetros y 27,8 mil millones de tokens de entrenamiento, útil para trabajos académicos sobre eficiencia de arquitecturas.
- Auditoría de checkpoints: verificar la integridad del archivo mediante el SHA256 publicado y examinar los metadatos JSON de arquitectura y tensores incluidos en el repo.
- Investigación sobre sobrentrenamiento: comparar la relación tokens/parámetro (aproximadamente 34,8) con modelos densos de tamaño similar para estudiar curvas de pérdida en regímenes de cómputo elevado.
- Base para experimentos de destilación o inicialización: usar los pesos como punto de partida en estudios que exploren transferencia desde arquitecturas multi-rama hacia transformers estándar.
- Docencia y divulgación técnica: ilustrar las diferencias entre un release de investigación nativo y un modelo empaquetado para producción (tokenizer, plantillas, runtime, licencia).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de evaluación es la pérdida de validación fija de 2,653 sobre un conjunto held-out de 12.160 secuencias, que no es directamente comparable con métricas de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión de entrenamiento (probablemente fp32 o bf16), los 799 millones de parámetros ocupan entre 1,6 GB (bf16) y 3,2 GB (fp32); a ello hay que sumar los buffers de enrutamiento MoE y el estado de activaciones, por lo que se recomienda al menos 8-12 GB de VRAM para pruebas.
- GPU recomendadas: no hay datos oficiales; por tamaño, una RTX 4090, A100 o H100 son suficientes en términos de memoria, pero la limitación real es la ausencia de runtime compatible.
- Cabe en GPU de consumo: sí, en términos de memoria cabría en GPUs consumer con 8 GB o más, siempre que se disponga de la implementación nativa Megatron.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI no son compatibles según el autor, ya que el checkpoint no está en formato estándar de Transformers. Se requiere la implementación nativa Multi-Branch Transformer basada en Megatron.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Standard-W1 (gaotang) | 799 M | 4.096 | no disponible | Solo pesos nativos, sin runtime | Checkpoint de investigación multi-rama con MoE |
| Llama 3.2 1B | 1.240 M | 128.000 | Llama 3.2 Community License | Transformers, vLLM, llama.cpp, GGUF | Modelo denso listo para producción, tokenizer incluido |
| Qwen2.5 0.5B | 494 M | 32.768 | Apache 2.0 | Transformers, vLLM, llama.cpp, GGUF | Modelo denso pequeño con amplio ecosistema |
| SmolLM2 1.7B | 1.700 M | 8.192 | Apache 2.0 | Transformers, vLLM, llama.cpp, GGUF | Entrenado con ~11 billones de tokens, orientado a despliegue |

La comparación es estructuralmente desigual: los tres modelos alternativos son releases de producción con tokenizer, plantillas de chat, licencia clara y soporte en múltiples runtimes, mientras que Standard-W1 es un artefacto de investigación sin esas piezas. En parámetros y contexto, Standard-W1 se sitúa por debajo de Llama 3.2 1B y SmolLM2 1.7B y por encima de Qwen2.5 0.5B, pero no existen benchmarks públicos que permitan comparar rendimiento real.

## Limitaciones y advertencias

- No es un modelo listo para producción: no incluye tokenizer, plantillas de prompt, runtime de inferencia ni scripts de generación.
- Incompatible con `AutoModel` de Transformers, vLLM, llama.cpp, Ollama y TGI; requiere la implementación nativa basada en Megatron del proyecto Multi-Branch Transformer.
- Licencia no disponible: no se puede asumir uso comercial ni redistribución sin aclaración del autor.
- El tokenizer de Llama 3 debe obtenerse por separado y está sujeto a sus propios términos de acceso y licencia, lo que añade una dependencia externa.
- Solo se declara soporte de inglés; no hay evidencia de capacidades multilingües.
- Contexto de entrenamiento limitado a 4.096 tokens, muy por debajo de los modelos contemporáneos de su tamaño.
- Riesgo de alucinación y sesgos: no hay evaluaciones publicadas de sesgo, toxicidad o fidelidad factual; la pérdida de validación de 2,653 no permite inferir calidad conversacional.
- Sin benchmarks estándar: no se puede comparar objetivamente con modelos de su categoría.
- Repo con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.
- Los buffers de enrutamiento MoE persistentes deben manejarse con cuidado al recargar, ya que forman parte del estado entrenado y no son pesos convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gaotang/Standard-W1
- Proyecto Multi-Branch Transformer (GitHub): https://github.com/GaotangLi/Multi-Branch-Transformer
