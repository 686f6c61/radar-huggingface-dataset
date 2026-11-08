# AdaptiveChunking/ali_ali-surface-only_s2

## Resumen

`ali_ali-surface-only_s2` es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino un experimento de tokenización dinámica a nivel de byte construido sobre el framework `beetle-hnet`. El modelo implementa una arquitectura H-Net con variante `ali` y objetivo `ratio`, entrenada con un esquema de chunking adaptativo que segmenta secuencias de bytes en unidades de longitud variable en lugar de usar un vocabulario de tokens fijo.

El modelo tiene 22.785.088 parámetros (unos 22,8 millones) y se entrenó durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre textos en inglés, turco y finés. El repositorio ocupa 17,5 GB, un tamaño desproporcionado respecto a los parámetros del modelo, explicable por el almacenamiento de múltiples checkpoints intermedios (`step-N`) junto con el estado completo del entrenador (`training_state/checkpoint.pt`) en cada uno.

Su relevancia es fundamentalmente académica: sirve como artefacto reproducible para estudiar estrategias de chunking dinámico y tokenización byte-level, no como modelo listo para producción. La licencia Apache 2.0 permite reutilización y modificación, pero el modelo no declara idiomas soportados ni pipeline de inferencia estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (variante `ali`) con chunking dinámico byte-level |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 1024 bytes por secuencia en entrenamiento; contexto de inferencia no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (entrenado con datos en `en`, `tr`, `fi`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez) + checkpoint PyTorch (`checkpoint.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en `beetle-hnet`, con `architecture=ali` y `objective=ratio`. Se trata de un modelo byte-level: opera directamente sobre bytes en lugar de sobre tokens de un vocabulario predefinido, y aplica un mecanismo de chunking dinámico que agrupa bytes en segmentos de longitud variable. El objetivo de entrenamiento es `ratio` y el proceso de dechunking utiliza una estrategia `ema` (media móvil exponencial) para la reconstrucción de la salida. No se especifica en la información disponible el número exacto de capas, dimensión oculta ni cabezas de atención.

El entrenamiento consistió en 6000 pasos con batches de 32 secuencias de 1024 bytes cada una, sobre un corpus multilingüe limitado a inglés, turco y finés. No se documenta el número total de tokens procesados ni la composición detallada del dataset, y no hay evidencia de fases de RLHF o DPO. El repositorio organiza los checkpoints en ramas `step-N` siguiendo un esquema logarítmico en base 2 (0, 1, 2, 4, 6, 8, 16, ... hasta 2^k), lo que facilita el análisis de la evolución del entrenamiento. La rama `main` contiene los pesos y la configuración del último paso, además de `log.jsonl`, `final.json` y, una vez finalizada la ejecución, sondas de frontera FLORES+ en `probe/`.

## Capacidades

- Procesamiento de texto a nivel de byte con segmentación dinámica en chunks, sin vocabulario de tokens fijo.
- Modelado de lenguaje autoregresivo sobre secuencias de bytes (objetivo `ratio`).
- Entrenamiento y evaluación multilingüe limitada a inglés, turco y finés.
- Reanudación del entrenamiento desde cualquier checkpoint intermedio gracias al estado completo del entrenador incluido en cada rama `step-N`.
- Evaluación de fronteras de segmentación mediante sondas FLORES+ (en la rama `main` tras finalizar la ejecución).
- No consta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en tokenización byte-level: el modelo permite reproducir y comparar estrategias de chunking dinámico frente a tokenizadores BPE o WordPiece, usando los checkpoints intermedios para analizar cómo evoluciona la segmentación durante el entrenamiento.
- Estudio de la convergencia en H-Nets: las ramas `step-N` con estado completo del entrenador permiten reanudar experimentos y medir el efecto de distintas fases del objetivo `ratio` sobre la calidad del modelado.
- Análisis multilingüe de bajo recurso: el entrenamiento con turco y finés, dos lenguas con morfología aglutinante, sirve para evaluar si el chunking dinámico mitiga la fragmentación excesiva que sufren estos idiomas con tokenizadores convencionales.
- Reproducibilidad de experimentos: el repositorio incluye configuración, logs y estado del entrenador, lo que facilita replicar la ejecución con la misma semilla (seed 2) y comparar resultados.
- Evaluación de fronteras de segmentación: las sondas FLORES+ de la rama `main` permiten medir la calidad de los límites de chunk producidos por el modelo sobre textos multilingües.
- Base para experimentos de adaptación: al ser un modelo pequeño (22,8 M de parámetros) y con licencia Apache 2.0, puede servir como punto de partida para fine-tuning en tareas de segmentación o compresión de texto a nivel de byte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,8 M de parámetros, los pesos en fp32 ocupan aproximadamente 91 MB y en fp16 unos 46 MB; el estado del entrenador y los checkpoints intermedios requieren más espacio en disco que en memoria.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para cargar los pesos; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo no aprovecha la capacidad de estas GPU de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura personalizada dependiente de `beetle-hnet`, no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI; requiere cargar la implementación del repositorio `beetle-hnet` y los pesos safetensors con `transformers` o PyTorch nativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ali_ali-surface-only_s2` | 22,8 M | 1024 bytes (entrenamiento) | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face |
| Modelos byte-level tipo ByT5 (referencia) | 300 M – 13 B | hasta 1024 bytes | Transformer byte-level sin tokenizador | Apache 2.0 | Hugging Face |
| Tokenizadores BPE multilingües (referencia) | no aplica | variable | Segmentación subword estática | variable | amplia |

No se dispone de datos de rendimiento comparables para este modelo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: no hay pipeline de inferencia declarado ni documentación sobre cómo generar texto con él fuera del framework `beetle-hnet`.
- El corpus de entrenamiento se limita a inglés, turco y finés; no se garantiza ningún comportamiento en otros idiomas.
- El contexto de entrenamiento es de solo 1024 bytes por secuencia, muy inferior al de modelos de lenguaje convencionales.
- Riesgo de alucinación y sesgos: no evaluado ni documentado por el autor.
- El tamaño del repositorio (17,5 GB) se debe a los múltiples checkpoints y estados del entrenador; descargar el modelo completo consume mucho más espacio del que sugiere su número de parámetros.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no está validado para producción y carece de garantías de calidad.
- La arquitectura depende de una implementación externa (`beetle-hnet`) que debe instalarse y mantenerse, lo que añade fricción operativa.
- No consta que los pesos atados se carguen automáticamente sin consultar `config.json["tied_weights"]`, lo que puede provocar errores si se manipulan los safetensors manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_ali-surface-only_s2
- Organización AdaptiveChunking: https://huggingface.co/AdaptiveChunking
- Repositorio `beetle-hnet`: https://github.com/suchirsalhan/beetle-hnet
