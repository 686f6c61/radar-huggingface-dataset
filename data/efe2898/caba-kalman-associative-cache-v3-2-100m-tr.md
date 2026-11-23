# Efe2898/caba-kalman-associative-cache-v3-2-100m-tr

## Resumen

ÇABA Innovation-Adaptive Full-Covariance Kalman Cache v3.2 es un modelo de lenguaje causal experimental de aproximadamente 100 millones de parámetros, publicado por el usuario Efe2898 en Hugging Face. No es un transformer convencional: sustituye parte del mecanismo de atención por un estado recurrente basado en un filtro de Kalman de covarianza completa, combinado con un grafo disperso de transiciones entre tokens y una convolución causal en profundidad de tamaño K=8. El modelo se presenta explícitamente como experimental y el propio autor declara que no reclama calidad lingüística validada.

El interés técnico reside en su propuesta de caché asociativa: el estado recurrente almacena una matriz de covarianza P sobre el espacio de claves y un mapa asociativo W, de modo que las observaciones "sorprendentes" pueden revisar la dirección de clave correspondiente mediante ruido de proceso dirigido por clave. Ambos estados bayesianos son de tamaño fijo respecto a la longitud del prompt y se mantienen en FP32, lo que abre la puerta a contextos largos con memoria acotada.

El modelo está entrenado únicamente con datos en turco (peso 1.0 para el idioma `tr`), usa el tokenizador de `vngrs-ai/Kumru-2B-Base` y una longitud de secuencia de 256 tokens. Su relevancia es fundamentalmente como banco de pruebas de arquitecturas recurrentes alternativas a la atención, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM híbrida: grafo disperso de transición de tokens + convolución causal depthwise K=8 + caché asociativa Kalman de covarianza completa (innovation-adaptive) |
| Parametros totales | 102.003.561 (safetensors); 100.397.929 entrenables según model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; estados de caché en FP32) |
| Idiomas soportados | Turco (`tr`, peso 1.0 en entrenamiento); resto no disponible |
| Licencia | other |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura combina cuatro componentes: un grafo disperso de transiciones entre tokens construido solo en entrenamiento (K=32, cobertura de candidatos en held-out de 0,50739), un softmax global atado de soporte completo, una convolución causal depthwise de K=8 y una caché asociativa Kalman con covarianza completa. El estado recurrente guarda una matriz de covarianza P sobre el espacio de claves y un mapa asociativo W; el ruido de proceso dirigido por clave permite que las observaciones inesperadas revisen la dirección de clave coincidente. La caché de inferencia (`past_key_values`) almacena la tupla `(conv_state, covariance_state, weight_state)`, con los dos estados bayesianos en FP32 y de tamaño fijo independientemente de la longitud del prompt.

La tabla de embeddings de tokens está factorizada a 1.024 dimensiones, con el puente de entrada atado de forma transpuesta para la salida y la cabeza de vocabulario atada a la tabla de tokens. La rama de memoria tiene además un objetivo auxiliar de siguiente token. Durante el entrenamiento se aplica un dropout residual del 10% en la ruta local para forzar a la ruta principal a usar el historial recuperado (el primer token válido está exento). La validación reporta NLL solo de memoria y NLL de la ruta principal con el residual de memoria ablacionado, de modo que la contribución de la memoria es medible. El autor indica que el cuaderno de verificación comprueba las ecuaciones del filtro de Kalman de covarianza completa, el comportamiento de recuerdo/conflicto, la igualdad entre prefijo completo e incremental, los dtypes de caché en precisión mixta, la identidad de padding, la causalidad y la ruta real de generación de Transformers antes del entrenamiento. No se especifica el número total de tokens de entrenamiento ni la composición del dataset más allá de la fuente tokenizada.

## Capacidades

- Generación de texto causal autorregresiva en turco, con el tokenizador de Kumru-2B-Base.
- Memoria asociativa de tamaño fijo: la caché `(conv_state, covariance_state, weight_state)` no crece con la longitud del prompt, lo que permite reutilizar estado entre pasos de generación.
- Recuperación de historial mediante la rama de memoria, con objetivo auxiliar de siguiente token y validación ablacionada de su contribución.
- Revisión adaptativa de claves: el ruido de proceso dirigido por clave permite corregir asociaciones ante observaciones inesperadas.
- Integración con la API estándar de Transformers (`AutoModelForCausalLM`) mediante código remoto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (solo turco en entrenamiento).
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Investigación en arquitecturas recurrentes alternativas a la atención: el modelo sirve como referencia reproducible para estudiar si una caché Kalman de covarianza completa puede sustituir parte del mecanismo de atención en secuencias cortas, con scripts de entrenamiento y verificación incluidos en el repositorio.
- Experimentos de memoria asociativa de tamaño fijo: útil para medir cómo evoluciona el estado `(covariance_state, weight_state)` a lo largo de una generación y comparar la NLL de la ruta principal con y sin residual de memoria, tal como reporta la validación del autor.
- Reproducción de resultados y auditoría de código: el repositorio incluye `configuration_caba.py`, `modeling_caba.py` y el directorio `training/`, lo que permite revisar las ecuaciones del filtro y reejecutar el pipeline antes de habilitar `trust_remote_code=True`.
- Prototipado de sistemas de recuperación de historial en conversación: la rama de memoria con objetivo auxiliar y dropout residual del 10% está diseñada para forzar el uso del historial recuperado, un escenario relevante para diálogo multi-turno con estado acotado.
- Docencia y divulgación técnica: como ejemplo didáctico de fusión entre filtros de Kalman, grafos de transición de tokens y transformers, con un tamaño de 100M parámetros manejable en una sola GPU.
- Pruebas de integración con Transformers: validar que la ruta real de generación (`generate`) funciona con una caché personalizada de dtypes mixtos y padding, útil para quienes desarrollan `past_key_values` no estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas internas de validación (NLL de memoria y NLL de ruta principal con memoria ablacionada), sin valores numéricos concretos, y una cobertura de candidatos en held-out de 0,50739 para el grafo de transiciones.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 0,4 GB (102M parámetros × 4 bytes); en FP16/BF16 bajaría a unos 0,2 GB. Los estados de caché bayesianos son FP32 y de tamaño fijo, por lo que su coste no depende de la longitud del prompt pero no se ha publicado su dimensión exacta.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM debería bastar para los pesos; el repositorio ocupa 8,0 GB en total, lo que sugiere que incluye artefactos adicionales (scripts, datos tokenizados o checkpoints) que no forman parte del modelo en inferencia.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1660, RTX 3060, RTX 4060 y superiores, dado el tamaño del modelo.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la vía documentada. No se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al tratarse de una arquitectura con `custom_code` y caché no estándar es probable que estos motores no la soporten sin adaptación.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables directos en la información proporcionada. La siguiente tabla compara únicamente especificaciones estructurales con alternativas de tamaño similar del ecosistema abierto, marcando como no disponible cualquier dato no confirmado para este modelo.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ÇABA Kalman Cache v3.2 100M | 102M | 256 | Híbrida Kalman + grafo de tokens + conv causal | other | Hugging Face, requiere `trust_remote_code` |
| Modelos transformer densos ~100M (categoría) | ~100M | variable, típicamente 2K-8K | Transformer decoder estándar | variable | Amplia |
| Modelos recurrentes/SSM pequeños (categoría) | ~100M-1B | variable | SSM o híbridos recurrentes | variable | Limitada |

No se han publicado comparaciones de rendimiento con alternativas concretas en la información disponible.

## Limitaciones y advertencias

- Modelo explícitamente experimental: el autor declara que no reclama calidad lingüística validada.
- Entrenado solo en turco (peso 1.0); no hay evidencia de capacidades en castellano ni en otros idiomas.
- Longitud de contexto de 256 tokens, muy inferior a los estándares actuales; no apto para documentos largos ni conversaciones extensas sin trabajo adicional.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; la propia model card recomienda revisar `configuration_caba.py`, `modeling_caba.py` y `training/` antes de habilitarlo.
- Licencia "other": no se especifican términos de uso comercial; debe consultarse el repositorio antes de cualquier despliegue productivo.
- Riesgo de alucinación y sesgos: no evaluados ni documentados; al ser un modelo de 100M entrenado en un único idioma, es esperable un conocimiento factual muy limitado.
- Sin soporte documentado de tool calling, agentes, visión o audio.
- Compatibilidad limitada con motores de inferencia estándar (vLLM, llama.cpp, Ollama, TGI) debido a la caché personalizada y al código remoto.
- El repositorio ocupa 8,0 GB, muy por encima del tamaño de los pesos, por lo que conviene revisar qué artefactos adicionales se descargan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Efe2898/caba-kalman-associative-cache-v3-2-100m-tr
- Tokenizador base: https://huggingface.co/vngrs-ai/Kumru-2B-Base
- Dataset tokenizado: https://huggingface.co/datasets/Efe2898/tokenized
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
