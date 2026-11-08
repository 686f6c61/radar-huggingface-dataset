# AdaptiveChunking/ali_hnet_s0

## Resumen

ali_hnet_s0 es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje generativo al uso, sino una implementación de H-Net (hierarchical network) a nivel de byte, construida sobre el proyecto beetle-hnet. Su propósito es estudiar el chunking dinámico: el modelo aprende a segmentar secuencias de bytes en unidades jerárquicas en lugar de depender de un tokenizador fijo. El checkpoint corresponde a la semilla 0 de una familia de experimentos.

El modelo tiene 22.516.992 parámetros y se entrenó durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre tres idiomas (inglés, turco y finés). El objetivo de entrenamiento es `ratio` y el mecanismo de dechunking usa media móvil exponencial (EMA). La relevancia de este checkpoint es fundamentalmente metodológica: sirve como referencia reproducible para investigar tokenización libre de vocabulario y segmentación adaptativa, no como modelo para tareas de producción.

La ficha se basa exclusivamente en la model card y los metadatos del repositorio. No hay información publicada sobre benchmarks, idiomas de inferencia ni casos de uso validados, por lo que muchos campos se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net (hierarchical network) a nivel de byte, `architecture=hnet` |
| Parámetros totales | 22.516.992 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | entrenado con `['en', 'tr', 'fi']`; cobertura de inferencia no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con estado de entrenador en `training_state/checkpoint.pt` |

## Arquitectura y entrenamiento

Se trata de una red jerárquica (H-Net) que opera sobre bytes en lugar de tokens subword. El objetivo de entrenamiento es `ratio`, con un mecanismo de dechunking basado en EMA (`dechunk=ema`) y sin schedule explícito (`schedule=None`). El entrenamiento se realizó durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre los idiomas inglés, turco y finés, una combinación que incluye dos lenguas de morfología aglutinante y una germánica, lo que probablemente busca poner a prueba la segmentación en contextos morfológicamente ricos.

El repositorio sigue el layout de Beetle: ramas `step-N` con checkpoints en una programación logarítmica de base 2 (0, 1, 2, 4, 6, 8, 16, ..., 2^k desde el inicio de cada fase de objetivo, más el paso final). Cada rama contiene `model.safetensors`, `config.json`, `training_config.yaml` y el estado reanudable completo del entrenador. La rama `main` contiene los pesos y la configuración del último paso, además de `log.jsonl`, `final.json` y las sondas de frontera FLORES+ en `probe/` una vez finalizado el run. Los tensores atados se almacenan una sola vez y `config.json["tied_weights"]` mapea los nombres eliminados a los almacenados.

## Capacidades

- Modelo de investigación para segmentación jerárquica a nivel de byte; no se documenta generación de texto, razonamiento, código ni matemáticas.
- Chunking dinámico: aprende representaciones a partir de bytes sin tokenizador predefinido.
- Dechunking con EMA para reconstruir o agrupar segmentos.
- Multilingüe limitado a los idiomas de entrenamiento (inglés, turco, finés); no hay evidencia de generalización a otros.
- Soporte de tool calling, function calling, agentes o multi-step reasoning: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Checkpoints intermedios reanudables para análisis de dinámica de entrenamiento.

## Casos de uso

- Investigación en tokenización libre de vocabulario: comparar H-Net a nivel de byte frente a tokenizadores BPE/Unigram en tareas de segmentación y perplejidad, usando los checkpoints `step-N` para estudiar la evolución del chunking.
- Análisis de morfología aglutinante: el entrenamiento con turco y finés permite estudiar cómo el modelo agrupa morfemas y sufijos sin vocabulario explícito, un escenario difícil para tokenizadores subword convencionales.
- Reproducción de experimentos: la semilla 0 y el estado completo del entrenador (`training_state/checkpoint.pt`) permiten reanudar y replicar el run para validar resultados de la línea beetle-hnet.
- Estudio de dinámica de entrenamiento: las ramas `step-N` en programación log2 facilitan trazar la curva de aprendizaje y el comportamiento de las fronteras de chunk a lo largo del entrenamiento.
- Evaluación de sondas de frontera: los artefactos `probe/` con FLORES+ permiten medir la calidad de las fronteras de segmentación en textos multilingües.
- Baseline para investigación de arquitecturas jerárquicas: con 22,5 M de parámetros es un punto de partida ligero para comparar variantes de H-Net, objetivos de entrenamiento y estrategias de dechunking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 M de parámetros en fp32, aproximadamente 90 MB de pesos; en fp16, unos 45 MB. El estado del entrenador (`checkpoint.pt`) ocupa más y requiere CPU o GPU con memoria suficiente para reanudar.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente para inferencia; para reanudar el entrenamiento se recomienda al menos 8-16 GB de VRAM.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM para inferencia.
- Opciones de despliegue: PyTorch nativo (carga vía `torch.load` y `safetensors`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_hnet_s0 | 22,5 M | no disponible (entrenado a 1024 bytes) | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face |
| Modelos de tokenización byte-level (p. ej. ByT5) | no disponible | no disponible | Transformer byte-level sin tokenizador | no disponible | no disponible |
| Tokenizadores BPE/Unigram | no aplica (no es modelo) | no aplica | Segmentación subword estática | variable | amplia |

No se dispone de información suficiente para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación sin validación en producción; no hay benchmarks ni métricas de calidad publicadas.
- Cobertura lingüística limitada a inglés, turco y finés durante el entrenamiento; el comportamiento en otros idiomas es desconocido.
- Ventana de entrenamiento de 1024 bytes; no se documenta soporte para contextos mayores.
- No se documentan capacidades de generación, razonamiento ni instrucción; no debe usarse como asistente o chatbot.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación desaconseja su uso en producción sin evaluación previa.
- El repositorio incluye estados de entrenador (`checkpoint.pt`) que deben cargarse con `weights_only=False`; precaución al cargar artefactos de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_hnet_s0
- Perfil de la organización: https://huggingface.co/AdaptiveChunking
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
