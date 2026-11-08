# AdaptiveChunking/ali_pkm_s0

## Resumen

`ali_pkm_s0` es un modelo de investigación desarrollado por el usuario AdaptiveChunking dentro del ecosistema del proyecto beetle-hnet, un marco experimental centrado en tokenización dinámica a nivel de byte y arquitecturas H-Net. El modelo se presenta como una ejecución de entrenamiento reproducible (seed 0) más que como un modelo listo para producción: su propósito es estudiar cómo un modelo byte-level con mecanismo de chunking dinámico aprende a segmentar y procesar secuencias sin un tokenizador BPE o SentencePiece convencional.

Con 39.425.792 parámetros totales, es un modelo pequeño, adecuado para experimentación académica en entornos con recursos limitados. La arquitectura se etiqueta como `pkm` (probablemente product-key memory o una variante de memoria asociativa dentro del marco H-Net) y se entrenó con un objetivo de tipo `ratio` durante 6000 pasos sobre secuencias de 1024 bytes, en tres idiomas: inglés, turco y finés.

Su relevancia es metodológica: el repositorio expone checkpoints intermedios en una programación logarítmica por fases, incluyendo el estado completo del entrenador (`training_state/checkpoint.pt`), lo que permite reanudar o auditar el proceso. No obstante, no se han publicado resultados de benchmarks ni una descripción funcional de uso en inferencia, por lo que debe considerarse material de investigación y no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net con `architecture=pkm`, procesamiento byte-level y chunking dinámico |
| Parametros totales | 39.425.792 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1024 bytes por secuencia de entrenamiento (no se especifica contexto de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr, fi (según datos de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez), más `training_state/checkpoint.pt` en PyTorch |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net del proyecto beetle-hnet, con configuración `architecture=pkm` y `objective=ratio`. Se trata de un modelo byte-level: la entrada se procesa como bytes crudos, sin tokenizador subword, y el mecanismo de chunking dinámico (`dechunk=ema`) decide la segmentación de forma adaptativa durante el entrenamiento. La programación de fases (`schedule=None`) y los checkpoints conservados siguen una progresión logarítmica (0, 1, 2, 4, 6, 8, 16, …, 2^k) desde el inicio de cada fase del objetivo, además del paso final.

El entrenamiento consistió en 6000 pasos con batch de 32 secuencias de 1024 bytes, sobre un corpus multilingüe limitado a inglés, turco y finés, con semilla 0. No se detalla el número total de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO; el objetivo `ratio` sugiere una formulación de entrenamiento propia del marco beetle-hnet, no documentada en la información disponible. El repositorio incluye sondas de frontera FLORES+ (`probe/`) generadas al finalizar la ejecución, lo que indica una evaluación cualitativa de segmentación más que de rendimiento downstream.

## Capacidades

- Generación y modelado de texto a nivel de byte en inglés, turco y finés.
- Segmentación dinámica de secuencias mediante chunking adaptativo (mecanismo central del modelo).
- Reproducibilidad de entrenamiento: checkpoints intermedios con estado completo del entrenador.
- Evaluación de fronteras de chunk mediante sondas FLORES+.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking o razonamiento explícito: no disponible.

## Casos de uso

- Investigación en tokenización byte-level: permite comparar el comportamiento de un modelo sin tokenizador subword frente a arquitecturas BPE en las mismas condiciones de datos, usando los checkpoints intermedios para analizar la evolución del chunking.
- Estudio de segmentación multilingüe: con entrenamiento en inglés, turco y finés, sirve para analizar cómo el chunking dinámico se adapta a morfologías aglutinantes (turco, finés) frente al inglés.
- Reproducción de experimentos: el estado resumible (`training_state/checkpoint.pt`) permite reanudar el entrenamiento desde cualquier checkpoint de la programación logarítmica y verificar resultados con la misma semilla.
- Análisis de fronteras de chunk: las sondas FLORES+ incluidas permiten inspeccionar dónde el modelo decide cortar secuencias y comparar con segmentaciones lingüísticas de referencia.
- Docencia y formación: modelo de 39M de parámetros que cabe en hardware modesto, útil para demostrar pipelines de entrenamiento con checkpoints por fases y pesos atados.
- Base para experimentos de destilación o ablación: al ser pequeño y de licencia Apache 2.0, puede servir como punto de partida para estudiar variantes de arquitectura pkm o de objetivos de entrenamiento.
- Prototipado de preprocesado adaptativo: el mecanismo de chunking puede evaluarse como alternativa a la tokenización fija en pipelines de datos multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 39,4M de parámetros en fp32, los pesos ocupan aproximadamente 158 MB; en fp16, unos 79 MB. El repositorio completo ocupa 2,1 GB debido a los checkpoints y estados de entrenamiento, no por el modelo en sí.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior cubre holgadamente la inferencia. Para reentrenar, una RTX 4090 o A100 acelera los 6000 pasos, aunque el tamaño permite usar GPUs de gama media.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 4 GB de VRAM, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: al ser un modelo de investigación con arquitectura no estándar (H-Net byte-level), no se garantiza compatibilidad con vLLM, llama.cpp, Ollama o TGI; el uso previsto es mediante PyTorch y el código de beetle-hnet.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (H-Net byte-level con chunking dinámico) con parámetros, contexto y licencia verificables.

## Limitaciones y advertencias

- Modelo de investigación sin pipeline de inferencia declarado ni documentación de uso; no debe tratarse como un modelo listo para producción.
- Entrenado únicamente con 6000 pasos y tres idiomas (en, tr, fi); el soporte multilingüe fuera de esos idiomas es previsiblemente nulo o muy deficiente.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad en generación, razonamiento o código.
- Riesgo de alucinación y de generación incoherente no evaluado; sin datos de RLHF o alineación.
- La arquitectura byte-level con chunking dinámico no es estándar, lo que limita la compatibilidad con herramientas de inferencia convencionales y aumenta el coste de integración.
- El contexto de entrenamiento es de 1024 bytes; no se especifica si el modelo generaliza a secuencias más largas en inferencia.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al no existir evaluación de calidad ni garantías del autor, el uso comercial conlleva riesgo técnico y de responsabilidad sobre los resultados.
- El repositorio incluye estados de entrenamiento completos; conviene revisar el contenido antes de cargar `checkpoint.pt` con `weights_only=False`, ya que implica deserialización de objetos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_pkm_s0
- Repositorio del marco beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
