# AdaptiveChunking/ali_mem-mixed-nomerge_s1

## Resumen

`ali_mem-mixed-nomerge_s1` es un modelo de investigación desarrollado por el usuario AdaptiveChunking, orientado al estudio de la tokenización dinámica a nivel de byte mediante una arquitectura H-Net. No es un modelo de lenguaje conversacional al uso: es un artefacto experimental generado con el framework [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet) para evaluar estrategias de chunking adaptativo en lugar de tokenización subword fija. El identificador `ali_mem-mixed-nomerge_s1` indica la variante arquitectónica (`ali`), el objetivo de entrenamiento (`ratio`), la política de dechunking (`ema`) y la semilla 1.

El modelo tiene 22.785.088 parámetros (aproximadamente 22,8 millones) y fue entrenado durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre un corpus multilingüe limitado a inglés, turco y finés. El repositorio ocupa 6,1 GB, un tamaño desproporcionado respecto al número de parámetros, lo que se explica por la inclusión de múltiples ramas `step-N` con checkpoints completos y estados de entrenamiento reanudables.

Su relevancia es puramente metodológica: sirve como banco de pruebas reproducible para investigadores que trabajan en segmentación dinámica de secuencias de bytes, no como modelo listo para producción. La licencia Apache 2.0 permite reutilización, pero carece de pipeline declarado, de idiomas listados oficialmente y de cualquier dato de benchmarks publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net (variante `ali`) con tokenización dinámica a nivel de byte |
| Parámetros totales | 22.785.088 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, tr, fi (según datos de entrenamiento; no declarados oficialmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez) + checkpoint.pt de PyTorch |

## Arquitectura y entrenamiento

La arquitectura es una H-Net, una familia de modelos jerárquicos que aprenden a agrupar dinámicamente secuencias de bytes en chunks en lugar de depender de un vocabulario BPE predefinido. La variante `ali` y el objetivo `ratio` definen la política de agrupación y la función de pérdida empleada durante el entrenamiento, mientras que `dechunk=ema` indica que la reconstrucción de la salida utiliza una media móvil exponencial para estabilizar la segmentación. El modelo opera a nivel de byte puro, lo que elimina la dependencia de un tokenizador externo y permite, en teoría, generalizar a cualquier idioma o secuencia binaria.

El entrenamiento se realizó durante 6000 pasos con un batch efectivo de 32 secuencias de 1024 bytes (aproximadamente 196 millones de bytes procesados en total), sobre un corpus multilingüe de inglés, turco y finés. No se documenta el uso de RLHF, DPO ni ningún ajuste por preferencias; es un entrenamiento puramente de modelado del lenguaje con objetivo de ratio de compresión. El repositorio conserva checkpoints intermedios en una programación logarítmica en base 2 (pasos 0, 1, 2, 4, 6, 8, 16, ... hasta el paso final), lo que facilita el análisis de la evolución del aprendizaje del chunking.

## Capacidades

- Modelado de lenguaje a nivel de byte: predice el siguiente byte sin tokenizador externo.
- Segmentación dinámica: aprende a agrupar bytes en chunks de forma adaptativa según el contexto.
- Multilingüismo limitado: entrenado explícitamente con inglés, turco y finés.
- Reanudación de entrenamiento: los checkpoints incluyen el estado completo del trainer (`training_state/checkpoint.pt`).
- Sondas de evaluación: el repositorio incluye sondas de frontera sobre FLORES+ (`probe/`) para analizar la calidad de la segmentación.
- No dispone de soporte documentado de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en tokenización: comparar la segmentación aprendida por el modelo con BPE o SentencePiece sobre los mismos corpus, midiendo la ratio de compresión y la perplejidad resultante.
- Estudio de transferencia entre idiomas: evaluar cómo un modelo byte-level entrenado con en/tr/fi generaliza a otros idiomas sin tokenizador, usando las sondas FLORES+ incluidas.
- Análisis de la dinámica de entrenamiento: los checkpoints en escala log2 permiten trazar la evolución del chunking paso a paso y detectar cuándo emerge la segmentación estable.
- Reproducción de experimentos: la inclusión del estado completo del trainer permite reanudar el entrenamiento exactamente donde se dejó, útil para replicar resultados con distintas semillas.
- Desarrollo de preprocesadores para pipelines de NLP: el comportamiento de segmentación puede servir como referencia para diseñar tokenizadores adaptativos en dominios con vocabulario abierto (código, logs, texto médico).
- Docencia y divulgación: como ejemplo didáctico de arquitectura H-Net y de entrenamiento byte-level con objetivos de compresión, dado su tamaño reducido (22,8 M de parámetros).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,8 M de parámetros ≈ 91 MB de pesos), aunque el repositorio completo ocupa 6,1 GB por los checkpoints y estados de entrenamiento.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 o superior sobra para inferencia. Para reentrenar, una RTX 4090 o A100 acelera los 6000 pasos, pero el modelo cabe en GPUs de gama baja.
- Cabe en cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en CPU para inferencia.
- Opciones de despliegue: PyTorch nativo (formato safetensors + `config.json`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado que no es un transformer decoder estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_mem-mixed-nomerge_s1 | 22,8 M | 1024 bytes (entrenamiento) | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face |
| Modelos BPE byte-level (p. ej. GPT-2 small) | ~124 M | 1024 tokens | Transformer con tokenizador BPE | MIT / varias | Amplia |
| Modelos SentencePiece (p. ej. T5-small) | ~60 M | 512 tokens | Transformer encoder-decoder con SP | Apache 2.0 | Amplia |

La comparación directa no es posible en términos de rendimiento porque no hay benchmarks publicados para este modelo. La diferencia fundamental es metodológica: los modelos BPE y SentencePiece fijan el vocabulario antes del entrenamiento, mientras que este H-Net aprende la segmentación durante el propio entrenamiento.

## Limitaciones y advertencias

- No es un modelo de producción: carece de pipeline declarado, de idiomas oficialmente soportados y de evaluación estándar.
- Corpus de entrenamiento muy limitado (en, tr, fi) y volumen reducido (~196 M de bytes), insuficiente para uso general.
- Riesgo alto de alucinación y de generación incoherente fuera de los dominios vistos.
- No hay información sobre sesgos; el corpus multilingüe reducido probablemente introduce sesgos de dominio y de registro.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de evaluación hace desaconsejable cualquier despliegue real.
- El repositorio incluye estados de entrenamiento que pueden contener datos del corpus; revisar antes de redistribuir.
- No soporta tool calling, agentes ni multimodalidad; no debe presentarse como sustituto de un LLM.
- Los pesos atados se almacenan una sola vez y se mapean mediante `config.json["tied_weights"]`; cargarlos sin respetar ese mapeo produce un modelo incompleto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-mixed-nomerge_s1
- Repositorio del framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil del autor en Hugging Face: https://huggingface.co/AdaptiveChunking
