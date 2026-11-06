# Efe2898/caba-kalman-associative-cache-v3-2-100m-tr

## Resumen

ÇABA Innovation-Adaptive Full-Covariance Kalman Cache v3.2 es un modelo de lenguaje causal experimental de aproximadamente 100 millones de parámetros entrenables, publicado por el usuario Efe2898 en Hugging Face. Su interés no radica en la calidad lingüística —el propio autor declara explícitamente que no reclama una calidad de lenguaje validada— sino en la propuesta arquitectónica: sustituye o complementa la atención estándar por una caché asociativa basada en un filtro de Kalman de covarianza completa, con un grafo disperso de transiciones de tokens aprendido solo en entrenamiento y una softmax global atada de soporte completo.

La arquitectura combina una convolución depthwise causal de profundidad K=8, un grafo de transición de tokens con K=32 y un estado recurrente que mantiene una covarianza P en el espacio de claves junto con un mapa asociativo W. El ruido de proceso dirigido por claves permite que observaciones sorprendentes revisen la dirección de clave correspondiente, lo que constituye una innovación interesante frente a las cachés KV tradicionales de tamaño creciente con el prompt.

El modelo está entrenado exclusivamente con datos en turco (peso `{"tr": 1.0}`), usa el tokenizador de `vngrs-ai/Kumru-2B-Base` y una longitud de secuencia de 256 tokens. Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, orientado a quien quiera estudiar mecanismos de memoria asociativa bayesiana en transformers pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con caché asociativa Kalman de covarianza completa, convolución depthwise causal K=8 y grafo disperso de transiciones de tokens |
| Parametros totales | 102.003.561 (safetensors); 100.397.929 entrenables según model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (peso de entrenamiento `tr: 1.0`); no se declaran otros |
| Licencia | other |
| Formato de pesos | safetensors (repo de 1,9 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con varias desviaciones respecto al diseño estándar. Incorpora un grafo disperso de transiciones de tokens aprendido únicamente durante el entrenamiento (K=32, con cobertura de candidatos en held-out de 0,50739), una softmax global atada de soporte completo y una convolución depthwise causal con profundidad K=8. El componente distintivo es la caché asociativa Kalman: el estado recurrente almacena una covarianza P de covarianza completa en el espacio de claves y un mapa asociativo W, de modo que el ruido de proceso dirigido por claves permite revisar la dirección de clave correspondiente ante observaciones inesperadas. La caché de inferencia (`past_key_values`) guarda la tupla `(conv_state, covariance_state, weight_state)`, con ambos estados bayesianos en FP32 y de tamaño fijo respecto a la longitud del prompt.

La tabla de embeddings de tokens está factorizada a 1.024 dimensiones, con el puente de entrada atado de forma transpuesta para la ruta de salida y la cabeza de vocabulario atada a la tabla de tokens. La rama de memoria tiene además un objetivo auxiliar de siguiente token. Durante el entrenamiento se aplica un 10% de dropout residual en la ruta local (exento el primer token válido) para forzar a la ruta principal a usar el historial recuperado; la validación reporta NLL solo-memoria y NLL de la ruta principal con el residual de memoria ablacionado, de forma que la contribución de la memoria es medible en lugar de asumida. El tokenizador es `vngrs-ai/Kumru-2B-Base` (commit `55711ea224e4bf5d4e11a4baf79130ae73785ece`) y los datos tokenizados proceden de `Efe2898/tokenized` (commit `6cb993aa63064cd89b511bb164e8c6e5512902ed`). No se documentan volúmenes de tokens, composición del dataset ni fases de RLHF o DPO.

## Capacidades

- Generación de texto causal autorregresiva en turco, con longitud de contexto limitada a 256 tokens.
- Memoria asociativa de tamaño fijo respecto al prompt: el estado Kalman no crece con la longitud de entrada, a diferencia de una caché KV convencional.
- Recuperación de historial mediante la ruta de memoria, con un objetivo auxiliar de siguiente token y medición explícita de la contribución de memoria en validación.
- Revisión de asociaciones ante observaciones sorprendentes gracias al ruido de proceso dirigido por claves.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles más allá del turco.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- El autor no reclama calidad de lenguaje validada; el modelo se presenta como experimental.

## Casos de uso

- Investigación sobre memorias asociativas en transformers: el modelo sirve como banco de pruebas reproducible para estudiar si una caché Kalman de covarianza completa aporta ventaja medible frente a la caché KV estándar, gracias a la validación con NLL solo-memoria y NLL con memoria ablacionada.
- Estudio de eficiencia de estado recurrente: al mantener estados bayesianos FP32 de tamaño fijo respecto al prompt, es adecuado para experimentos sobre coste de memoria en inferencia con prompts largos dentro del límite de 256 tokens.
- Reproducción de experimentos de grafos de transición de tokens: el grafo disperso K=32 y la cobertura held-out publicada permiten analizar cómo las transiciones aprendidas solo en entrenamiento afectan a la generación.
- Docencia y formación en arquitecturas híbridas: el repositorio incluye el código del modelo y los scripts de entrenamiento (`configuration_caba.py`, `modeling_caba.py`, `training/`), lo que facilita su uso en cursos avanzados de arquitecturas de lenguaje.
- Validación de ecuaciones de Kalman en implementaciones de transformers: el notebook del autor comprueba ecuaciones de covarianza completa, comportamiento de recall/conflicto, igualdad prefijo completo/incremental, dtypes de caché en precisión mixta, identidad de padding, causalidad y la ruta real de generación de Transformers.
- Prototipado de modelos pequeños en turco: con ~100M parámetros y tokenizador de Kumru-2B, puede emplearse como base para experimentos de generación en turco donde el objetivo sea la arquitectura y no la calidad final del texto.
- Análisis de ablación de memoria en pipelines de evaluación propios: la separación entre ruta principal y ruta de memoria permite diseñar comparativas controladas de contribución de contexto recuperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 102M parámetros en FP32, los pesos ocupan aproximadamente 0,41 GB; en FP16/BF16, unos 0,20 GB. A ello hay que sumar los estados de caché Kalman en FP32 (covarianza y pesos) y las activaciones, no cuantificadas en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para los pesos; no se especifican requisitos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1650, RTX 3060, RTX 4060 y superiores; no confirmado por el autor.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el código personalizado y la caché no estándar probablemente requieran adaptaciones.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ÇABA Kalman Cache v3.2 100M TR | 102M | 256 | Transformer causal + caché Kalman asociativa | other | Hugging Face, 0 descargas |
| Modelos causales pequeños tipo GPT-2 small | ~124M | 1.024 | Transformer causal estándar | MIT (GPT-2) | Amplia |
| Modelos tipo Llama pequeños (~100-150M) | ~100-150M | variable | Transformer causal estándar | variable | Variable |

No se dispone de comparativas de rendimiento publicadas frente a alternativas; la comparación anterior es estructural y de disponibilidad, no de calidad. No disponible para datos de benchmarks.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo es experimental y no reclama calidad de lenguaje validada; no debe usarse en producción sin evaluación propia.
- Contexto muy limitado: 256 tokens de longitud de secuencia de entrenamiento, insuficiente para la mayoría de aplicaciones conversacionales reales.
- Entrenado solo en turco (`tr: 1.0`); no hay evidencia de competencia en otros idiomas.
- Licencia "other" sin términos detallados en la información disponible; es necesario revisar el repositorio antes de cualquier uso comercial.
- Requiere `trust_remote_code=True` y código personalizado (`modeling_caba.py`, `configuration_caba.py`); el autor recomienda revisar el código antes de habilitarlo.
- La caché de inferencia no es estándar, lo que puede romper la compatibilidad con herramientas de despliegue y optimización habituales.
- Riesgo de alucinación y sesgos: no evaluado ni documentado; al ser un modelo de 100M entrenado en un corpus no descrito, el riesgo es alto y desconocido.
- Sin descargas ni likes en el momento de la consulta: no hay validación comunitaria ni reportes de terceros.
- Los estados bayesianos en FP32 implican un coste de memoria fijo adicional que debe tenerse en cuenta en despliegues con muchas peticiones concurrentes.

## Enlaces

- Hugging Face: https://huggingface.co/Efe2898/caba-kalman-associative-cache-v3-2-100m-tr
- Tokenizador: https://huggingface.co/vngrs-ai/Kumru-2B-Base
- Dataset tokenizado: https://huggingface.co/datasets/Efe2898/tokenized
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
