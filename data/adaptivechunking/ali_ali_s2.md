# AdaptiveChunking/ali_ali_s2

## Resumen

`ali_ali_s2` es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino una implementación a pequeña escala de una H-Net (hierarchical network) que opera a nivel de byte, entrenada con el framework `beetle-hnet` bajo la configuración de arquitectura `ali` y objetivo `ratio`. Su propósito es servir como banco de pruebas reproducible para técnicas de *dynamic chunking* y tokenización byte-level, no para producción generativa.

El modelo cuenta con 22.785.088 parámetros totales (aproximadamente 22,8 millones) y se distribuye en formato safetensors con pesos ligados (*tied weights*), según indica la model card. El repositorio ocupa 3,5 GB porque incluye, además de los pesos, múltiples ramas `step-N` con checkpoints intermedios y el estado completo del entrenador para permitir la reanudación del entrenamiento.

Su relevancia actual es metodológica: documenta un pipeline de entrenamiento con muestreo adaptativo de secuencias (6000 pasos × 32 × 1024 bytes) sobre tres idiomas (inglés, turco y finés) y publica sondas de frontera FLORES+ para evaluar la segmentación. Está pensado para investigadores que estudian tokenización libre de vocabulario fijo y chunking dinámico, no para usuarios finales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (variante `ali`), framework `beetle-hnet` |
| Parámetros totales | 22.785.088 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | en, tr, fi (según configuración de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos ligados; `config.json["tied_weights"]` mapea los nombres) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura H-Net (hierarchical network) que procesa entrada a nivel de byte, sin vocabulario de tokens predefinido. La configuración concreta es `architecture=ali` con `objective=ratio`, `schedule=None` y `dechunk=ema`, lo que sugiere un mecanismo de de-chunking con media móvil exponencial para reconstruir la secuencia a partir de representaciones jerárquicas. El entrenamiento se ejecutó durante 6000 pasos con batches de 32 secuencias de 1024 bytes cada una, sobre los idiomas inglés, turco y finés, con semilla 2.

El repositorio organiza los checkpoints en ramas `step-N` siguiendo un calendario logarítmico en base 2 (0, 1, 2, 4, 6, 8, 16, …, 2^k desde el inicio de cada fase del objetivo, más el paso final). Cada rama contiene `model.safetensors`, `config.json`, `training_config.yaml` y el estado reanudable completo en `training_state/checkpoint.pt`. La rama `main` incluye los pesos del último paso, `log.jsonl`, `final.json` y, al finalizar el entrenamiento, sondas de frontera FLORES+ en `probe/`. No se documentan en la información disponible el uso de RLHF, DPO ni detalles sobre la composición exacta del corpus de entrenamiento más allá de los tres idiomas.

## Capacidades

- Modelado de lenguaje a nivel de byte sobre secuencias de hasta 1024 bytes en la configuración de entrenamiento.
- Segmentación y chunking dinámico de secuencias mediante el mecanismo `dechunk=ema`.
- Evaluación de fronteras de segmentación mediante las sondas FLORES+ incluidas en la rama `main`.
- Capacidad multilingüe limitada a los idiomas vistos en entrenamiento: inglés, turco y finés.
- Reproducibilidad de experimentos: checkpoints intermedios y estado del entrenador reanudable.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Investigación en tokenización byte-level: el modelo sirve como referencia reproducible para comparar variantes de H-Net y objetivos de entrenamiento sin depender de un vocabulario BPE fijo.
- Estudio de chunking dinámico: permite analizar cómo el mecanismo `dechunk=ema` agrupa bytes en unidades jerárquicas y comparar con segmentaciones lingüísticas de referencia.
- Evaluación de fronteras morfológicas: las sondas FLORES+ permiten medir la calidad de la segmentación en inglés, turco (aglutinante) y finés (aglutinante), idiomas con morfología compleja donde la tokenización estándar rinde peor.
- Reproducción de experimentos: las ramas `step-N` y el estado `training_state/checkpoint.pt` permiten reanudar o bifurcar el entrenamiento para tests controlados.
- Baseline para modelos multilingües de bajo recurso: útil para comparar técnicas de compresión de secuencias en turco y finés frente a modelos con vocabulario subword.
- Docencia y prototipado: con 22,8 M de parámetros, se puede ejecutar en CPU o GPU de gama baja para demostrar pipelines de entrenamiento jerárquico.
- Análisis de robustez ante bytes arbitrarios: al operar a nivel de byte, permite estudiar el comportamiento del modelo con entradas fuera de vocabulario o ruido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 22,8 M de parámetros (unos 91 MB de pesos), más el overhead del framework PyTorch.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobredimensionada; también es viable en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: PyTorch nativo y `huggingface_hub` para descargar checkpoints; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de chat con arquitectura transformer estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_ali_s2 | 22,8 M | 1024 bytes (entrenamiento) | H-Net byte-level, chunking dinámico | Apache 2.0 | Hugging Face |
| Modelos H-Net de referencia (p. ej. variantes de beetle-hnet) | no disponible | no disponible | H-Net byte-level | no disponible | Repositorio GitHub `beetle-hnet` |
| Tokenizadores BPE multilingües (p. ej. SentencePiece) | no aplica (no es un modelo) | no aplica | Segmentación subword estática | variable | Amplia |

No se dispone de datos de rendimiento comparables en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de chat ni de generación de texto útil para usuarios finales; su propósito es la investigación en tokenización y chunking.
- Sesgos conocidos: no documentados, pero el entrenamiento se limita a tres idiomas (en, tr, fi), por lo que el comportamiento en otros idiomas es indeterminado.
- Riesgo de alucinación: no aplica en el sentido conversacional, pero al ser un modelo de lenguaje byte-level puede generar secuencias incoherentes fuera de su distribución de entrenamiento.
- Limitación de contexto: las secuencias de entrenamiento son de 1024 bytes; no se documenta capacidad de extrapolación a contextos mayores.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción.
- Caveat de producción: el repositorio de 3,5 GB incluye checkpoints intermedios y estado del entrenador; para despliegue habría que aislar únicamente `model.safetensors` y `config.json` de la rama deseada.
- Los pesos están ligados y requieren aplicar el mapeo de `config.json["tied_weights"]` para cargarlos correctamente.
- No hay pipeline declarado en Hugging Face, por lo que las herramientas estándar de `transformers` pueden no cargarlo directamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_ali_s2
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking
- Framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
