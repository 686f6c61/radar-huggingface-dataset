# AdaptiveChunking/ali_lexmem-v1-vgate_s2

## Resumen

ali_lexmem-v1-vgate_s2 es un modelo de investigación publicado por el usuario AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional, sino un experimento de tokenización dinámica a nivel de byte construido sobre la arquitectura H-Net mediante el framework beetle-hnet. El identificador del modelo indica la configuración `architecture=ali`, `objective=ratio`, `schedule=None` y `dechunk=ema`, con semilla 2, entrenado durante 6000 pasos sobre secuencias de 32 fragmentos de 1024 bytes en tres idiomas (inglés, turco y finés).

El modelo resuelve un problema concreto de la investigación en tokenización: cómo segmentar dinámicamente flujos de bytes en unidades de longitud variable sin depender de un vocabulario BPE fijo. La relevancia actual es académica: se trata de un artefacto reproducible con checkpoints intermedios, estado completo del entrenador y sondas de frontera FLORES+, orientado a quienes investigan segmentación adaptativa y arquitecturas H-Net.

Con 22.785.088 parámetros totales y un repositorio de 1,7 GB (que incluye pesos, configuraciones y estados de entrenamiento resumibles), el modelo está pensado para análisis y reproducción de experimentos, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (beetle-hnet), variante `ali`, tokenización dinámica a nivel de byte |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrenado con 32 fragmentos de 1024 bytes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, turco y finés (idiomas de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez y mapeados en `config.json["tied_weights"]`); estado del entrenador en `checkpoint.pt` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en beetle-hnet, con la variante `ali` y objetivo `ratio`. Incorpora un mecanismo de chunking dinámico (`dechunk=ema`) que segmenta la entrada a nivel de byte, evitando el vocabulario fijo de los tokenizadores BPE tradicionales. Los pesos atados se almacenan una sola vez en `model.safetensors`, y `config.json` mantiene el mapeo de nombres eliminados a nombres almacenados.

El entrenamiento se realizó durante 6000 pasos con un lote de 32 secuencias de 1024 bytes, sobre datos en inglés, turco y finés, con semilla 2 y sin programación de schedule (`schedule=None`). El repositorio conserva checkpoints en ramas `step-N` siguiendo una programación logarítmica consciente de fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k), cada uno con pesos, configuración, `training_config.yaml` y estado resumible completo del entrenador. La rama `main` contiene los pesos del último paso, `log.jsonl`, `final.json` y las sondas de frontera FLORES+ en `probe/` una vez finalizada la ejecución.

## Capacidades

- Segmentación dinámica de flujos de bytes en unidades de longitud variable (chunking adaptativo).
- Procesamiento a nivel de byte sin vocabulario predefinido.
- Entrenamiento y evaluación multilingüe limitada a inglés, turco y finés.
- Reproducción de experimentos mediante checkpoints intermedios y estado resumible del entrenador.
- Evaluación de fronteras de segmentación mediante las sondas FLORES+ incluidas en `probe/`.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes.

## Casos de uso

- Investigación en tokenización adaptativa: permite comparar la segmentación dinámica a nivel de byte frente a tokenizadores BPE fijos usando los checkpoints intermedios y las sondas FLORES+.
- Reproducción de experimentos: el estado completo del entrenador en `training_state/checkpoint.pt` permite reanudar o auditar el entrenamiento paso a paso.
- Análisis de fronteras lingüísticas: las sondas FLORES+ en `probe/` sirven para estudiar cómo el modelo delimita unidades en inglés, turco y finés.
- Estudio de arquitecturas H-Net: la variante `ali` con objetivo `ratio` y `dechunk=ema` permite aislar el efecto de cada decisión de diseño.
- Evaluación de estrategias de decodificación de chunks: la programación logarítmica de checkpoints facilita analizar la evolución del comportamiento de segmentación durante el entrenamiento.
- Docencia y experimentación académica: el tamaño reducido (22,8 M de parámetros) y la licencia Apache 2.0 permiten usarlo en entornos educativos y de prototipado sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 22,8 M de parámetros en fp32 los pesos ocupan aproximadamente 91 MB, pero no se documentan requisitos oficiales.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna podría alojar los pesos, pero no hay validación publicada.
- Cabe en GPU consumer: previsiblemente sí por tamaño de parámetros, aunque no se confirma en la información disponible.
- Opciones de despliegue: no disponible; el modelo se distribuye como pesos PyTorch/safetensors para uso con el framework beetle-hnet, sin integración documentada con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_lexmem-v1-vgate_s2 | 22,8 M | no disponible | Chunking dinámico byte-level sobre H-Net | Apache 2.0 | Hugging Face (AdaptiveChunking) |
| LExMem (mbzuai-nlp) | no disponible | no disponible | Memoria léxica / método de investigación | no disponible | GitHub (mbzuai-nlp/LExMem) |
| beetle-hnet | no disponible | no disponible | Framework H-Net de referencia | no disponible | GitHub (suchirsalhan/beetle-hnet) |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación sin pipeline declarado ni idiomas oficialmente soportados más allá de los de entrenamiento (inglés, turco y finés).
- Sin resultados de benchmarks publicados; no hay evidencia de calidad frente a alternativas.
- Cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por la comunidad.
- No es un modelo de lenguaje generativo: no debe esperarse generación de texto, razonamiento ni tool calling.
- El repositorio incluye estados de entrenamiento (`checkpoint.pt`) que requieren `torch.load` con `weights_only=False`, lo que implica riesgos de seguridad al cargar ficheros pickle de origen no verificado.
- La licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental del artefacto desaconseja su uso en producción sin evaluación adicional.
- Riesgo de alucinación y sesgos: no evaluado ni documentado en la información disponible.
- El contexto de entrenamiento (32 × 1024 bytes) limita la generalización a secuencias más largas, aunque no se especifica la ventana efectiva en inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_lexmem-v1-vgate_s2
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking/datasets
- Framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Repositorio LExMem (mbzuai-nlp): https://github.com/mbzuai-nlp/LExMem/tree/main/method
