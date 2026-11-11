# AdaptiveChunking/ali_ali-surface-only_s1

## Resumen

ali_ali-surface-only_s1 es un modelo experimental de tokenizacion dinamica a nivel de byte desarrollado por el usuario AdaptiveChunking. Se trata de un run de entrenamiento del proyecto beetle-hnet, una implementacion de referencia de H-Net (arquitecturas que aprenden a segmentar la entrada en chunks de forma diferenciable, en lugar de depender de un tokenizador BPE fijo). El modelo usa la arquitectura `ali` con objetivo `ratio`, decodificacion por media movil exponencial (EMA) y semilla 1, entrenado durante 6000 pasos sobre secuencias de 1024 bytes en tres idiomas: ingles, turco y finlandes.

Con 22.785.088 parametros totales, es un modelo pequeno orientado a investigacion sobre segmentacion y tokenizacion adaptativa, no a generacion de texto de proposito general. Su interes reside en el pipeline de entrenamiento reproducible (checkpoints por fase, estado resumible del trainer, sondas de frontera FLORES+) y en la posibilidad de estudiar como un modelo byte-level aprende fronteras de chunk sin vocabulario predefinido. La licencia Apache 2.0 facilita su reutilizacion en experimentos academicos.

El repositorio ocupa 3,5 GB, en su mayoria por los multiples branches `step-N` con estado completo del trainer, lo que refleja su vocacion de artefacto de investigacion reproducible mas que de modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net variante `ali` (byte-level, segmentacion dinamica de chunks) |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no consta como MoE) |
| Longitud de contexto | 1024 bytes por secuencia de entrenamiento (no se documenta contexto de inferencia mayor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | en, tr, fi (idiomas de entrenamiento) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `tied_weights` en config.json), mas `training_state/checkpoint.pt` en PyTorch |

## Arquitectura y entrenamiento

El modelo sigue el esquema H-Net implementado en beetle-hnet: opera directamente sobre bytes y aprende a agruparlos en chunks mediante un mecanismo diferenciable, evitando el vocabulario fijo de un tokenizador BPE. La variante `ali` con `objective=ratio` entrena la politica de chunking optimizando una razon (presumiblemente entre compresion y fidelidad de reconstruccion, aunque el detalle no se documenta en la model card). La decodificacion de chunks en inferencia usa `dechunk=ema`, es decir, una media movil exponencial de las fronteras predichas.

El entrenamiento consistio en 6000 pasos con batch de 32 secuencias de 1024 bytes, sobre un corpus multilingue de ingles, turco y finlandes. No se especifica el numero total de tokens vistos ni la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO (poco probable dado el objetivo de tokenizacion). El repositorio conserva checkpoints en una programacion logaritmica por fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k) con estado resumible completo, lo que permite reproducir exactamente el entrenamiento. Los pesos atados se almacenan una sola vez y `config.json["tied_weights"]` mapea los nombres eliminados a los almacenados.

## Capacidades

- Segmentacion byte-level adaptativa: aprende fronteras de chunk sobre texto crudo sin vocabulario predefinido.
- Procesamiento multilingue limitado a en, tr y fi.
- Sondas de frontera FLORES+: el run genera probes para evaluar la calidad de las fronteras de chunk sobre el benchmark FLORES+.
- Reproducibilidad de entrenamiento: checkpoints por fase con estado completo del trainer (optimizador, scheduler, inventario si aplica).
- Pesos atados con safetensors: carga eficiente y sin duplicacion de tensores compartidos.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Investigacion sobre tokenizacion adaptativa: comparar fronteras aprendidas por H-Net frente a BPE/SentencePiece en en, tr y fi usando las sondas FLORES+ incluidas.
- Estudio de morfologia aglutinante: turco y finlandes son idiomas con morfologia rica; el modelo permite analizar si el chunking aprendido se alinea con morfemas.
- Reproduccion de experimentos: los branches `step-N` con `training_state/checkpoint.pt` permiten reanudar o bifurcar entrenamientos desde fases concretas.
- Baseline para compresion byte-level: el objetivo `ratio` sugiere uso como referencia para medir tasas de compresion por chunk en pipelines de tokenizacion.
- Evaluacion de decodificacion EMA: comparar `dechunk=ema` frente a otras estrategias de reconstruccion de fronteras en tareas de segmentacion.
- Prototipado de preprocesado para modelos byte-level: integrar la politica de chunking como capa previa en experimentos con arquitecturas que consumen bytes.
- Docencia y divulgacion: modelo pequeno (22,8 M de parametros) y con licencia permisiva, util para demostrar H-Net en cursos de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona sondas de frontera FLORES+ (`probe/`) generadas al finalizar el run, pero no incluye cifras de MMLU, HumanEval, GSM8K ni metricas de segmentacion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 22,8 M de parametros (unos 91 MB de pesos); en fp16 unos 46 MB. El cuello de botella real es el estado del trainer si se reanuda entrenamiento.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobrada para inferencia; para reanudar entrenamiento con `training_state/checkpoint.pt` conviene al menos 8-16 GB por el estado del optimizador.
- Cabe en GPU consumer: si, incluso en GPUs de gama baja y en CPU.
- Opciones de despliegue: carga directa con PyTorch y `huggingface_hub`; no hay conversion publicada a GGUF, por lo que llama.cpp/Ollama requeririan conversion manual y no estan garantizados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_ali-surface-only_s1 | 22,8 M | 1024 bytes (entrenamiento) | H-Net byte-level, chunking dinamico | Apache 2.0 | Hugging Face |
| Modelos BPE clasicos (p. ej. tokenizers SentencePiece) | no aplica | no aplica | Tokenizacion estatica | variable | amplia |
| Byte-level transformers (p. ej. ByT5) | cientos de M | miles de bytes | Transformer sobre bytes, sin chunking aprendido | Apache 2.0 | Hugging Face |
| H-Net original (paper) | variable | variable | Chunking diferenciable | variable | codigo en repos |

La comparacion directa con modelos generativos no es pertinente: este artefacto es una pieza de investigacion sobre tokenizacion, no un modelo de lenguaje listo para tareas de generacion.

## Limitaciones y advertencias

- Modelo experimental de investigacion: no esta pensado ni validado para produccion ni para generacion de texto.
- Idiomas limitados a en, tr y fi; no se documenta comportamiento en castellano.
- Contexto de entrenamiento de solo 1024 bytes; no hay evidencia de extrapolacion a ventanas mayores.
- Riesgo de alucinacion no evaluado: no hay benchmarks de calidad de texto.
- Sesgos: no se documenta composicion del corpus ni filtrado, por lo que sesgos de los datos de entrenamiento son desconocidos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y de evaluacion hace arriesgado desplegarlo fuera de investigacion.
- Repositorio pesado (3,5 GB) por los estados del trainer; descargar branches concretos con `revision` para evitar descargas completas.
- Requiere conocer la libreria beetle-hnet para interpretar configs y reanudar entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_ali-surface-only_s1
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
