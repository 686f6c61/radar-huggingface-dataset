# HoangTran223/S-SPPO_Qwen2.5-1.5B

## Resumen

S-SPPO Qwen2.5-1.5B es un modelo de lenguaje de 1.500 millones de parámetros desarrollado por HoangTran223 que aplica Semantic-Calibrated Self-Play Preference Optimization (S-SPPO) sobre el modelo base Qwen2.5-1.5B de Alibaba. El proceso de entrenamiento combina un ajuste fino supervisado (SFT) con el corpus UltraChat200k, seguido de tres iteraciones de self-play sobre UltraChat50k, un enfoque que permite optimizar las preferencias del modelo sin necesidad de anotaciones humanas externas.

La relevancia de este modelo radica en que constituye una implementación práctica y reproducible de un método de optimización de preferencias basado en self-play, un área de investigación activa en alineación de modelos de lenguaje. El modelo base Qwen2.5-1.5B es un transformador denso decoder-only con contexto de hasta 128.000 tokens y capacidades multilingües, licenciado bajo Apache 2.0. El repositorio incluye, además de los pesos finales, los datos de preferencia, las generaciones y los registros de entrenamiento de cada iteración, lo que lo convierte en un recurso valioso para investigación reproducible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (base Qwen2.5-1.5B) |
| Parámetros totales | 1.500 millones |
| Parámetros activos | No aplica (arquitectura densa) |
| Longitud de contexto | 32.000 tokens nativos (extensible a 128.000 según el modelo base); entrenamiento con max_length=1.024 y max_prompt_length=512 |
| Tipos de cuantización | No disponible (safetensors de precisión completa) |
| Idiomas soportados | No disponible (heredado del base Qwen2.5, multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen2.5-1.5B: un transformador denso decoder-only con normalización RMSNorm y atención multi-token, preentrenado con hasta 18 billones de tokens. El entrenamiento específico de S-SPPO consiste en un SFT con UltraChat200k (el checkpoint resultante se usa como punto de partida de la iteración 1, no existe `iter0`), seguido de tres iteraciones de self-play sobre UltraChat50k. En cada iteración, el modelo genera respuestas con vLLM, las empareja y las clasifica con PairRM, y optimiza con la función de pérdida `sspppo` (con lambda=1.0 y beta=1e-3) usando RMSProp con tasa de aprendizaje de 5e-7, batch de 1 y grad accum de 2. La similitud semántica se calcula con `sentence-transformers/all-MiniLM-L6-v2`. Cada iteración produce un checkpoint cargable en la subcarpeta `iterN/`, que incluye los datos de preferencia (train.parquet y test.parquet), las generaciones, la matriz de rankings de PairRM y los registros de entrenamiento.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones, heredado del SFT sobre UltraChat.
- Optimización de preferencias mediante self-play sin anotación humana externa.
- Reproducibilidad completa del proceso de entrenamiento: datos de preferencia, generaciones y rankings disponibles por iteración.
- Capacidades multilingües heredadas del modelo base Qwen2.5-1.5B (no confirmadas específicamente en el modelo final).
- Sin soporte documentado para tool calling, agentes, visión, audio o razonamiento explícito.

## Casos de uso

- Investigación en alineación de modelos de lenguaje: el repositorio incluye datos de preferencia, generaciones y rankings de cada iteración, lo que permite analizar la evolución de las preferencias a lo largo del self-play.
- Benchmark de métodos de optimización de preferencias: puede compararse con DPO, GRPO u otros enfoques sobre el mismo modelo base Qwen2.5-1.5B para evaluar la eficacia de S-SPPO.
- Punto de partida para fine-tuning posterior: los checkpoints de cada iteración son cargables con transformers, lo que permite continuar el entrenamiento o adaptar el modelo a dominios específicos.
- Análisis de la dinámica de self-play: los logs de vLLM y PairRM permiten investigar cómo evoluciona el ranking y la calibración semántica entre iteraciones.
- Reutilización de datos sintéticos de preferencia: los archivos parquet con `sim_score_*` pueden emplearse para entrenar modelos de recompensa o clasificadores de preferencia.
- Estudio del impacto de la similitud semántica en la pérdida: la integración de MiniLM-L6-v2 permite analizar cómo la calibración semántica afecta la calidad final del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en fp16: aproximadamente 3 GB de VRAM para el checkpoint de 1.500 millones de parámetros.
- Entrenamiento: el proceso de SFT y SPPO usa batch de 1 con grad accum de 2 y max_length de 1.024 tokens; una GPU con 8-12 GB de VRAM es suficiente para replicar el entrenamiento.
- GPUs compatibles: cualquier GPU consumer de 4 GB o más de VRAM (RTX 3060, RTX 4070, RTX 4090) para inferencia; 8 GB o más para entrenamiento.
- Despliegue: compatible con transformers, vLLM (usado en el entrenamiento) y convertible a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponible.
- El repositorio completo pesa 20,8 GB, por lo que se requiere espacio de disco adicional si se descargan todas las iteraciones y datos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Entrenamiento | Disponibilidad |
|---|---|---|---|---|---|
| S-SPPO Qwen2.5-1.5B | 1.500 M | 32.000 tokens (extensible a 128.000) | Apache 2.0 | SFT UltraChat200k + 3 iteraciones S-SPPO UltraChat50k | Hugging Face |
| Qwen2.5-1.5B (base) | 1.500 M | 32.000 tokens (extensible a 128.000) | Apache 2.0 | Preentrenamiento general (18T tokens) | Hugging Face, Ollama |
| Qwen2.5-1
