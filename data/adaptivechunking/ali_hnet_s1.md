# AdaptiveChunking/ali_hnet_s1

## Resumen

`ali_hnet_s1` es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de un H-Net a nivel de byte (byte-level) entrenado con el framework [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet), cuyo propósito no es la generación de texto convencional sino el estudio de estrategias de *dynamic chunking* y tokenización adaptativa. El modelo tiene 22.516.992 parámetros y se distribuye bajo licencia Apache 2.0 en formato safetensors con pesos atados.

La arquitectura es un H-Net (hierarchical network) que opera directamente sobre bytes, con un objetivo de entrenamiento basado en ratio y una política de de-chunking por EMA (`dechunk=ema`). El entrenamiento consistió en 6000 pasos sobre lotes de 32 secuencias de 1024 bytes, con datos en inglés, turco y finés. El repositorio incluye checkpoints intermedios organizados en ramas `step-N` siguiendo un esquema logarítmico en base 2, además del estado completo del entrenador para reanudación.

Su relevancia es acotada y experimental: no es un modelo listo para producción ni para tareas generativas, sino un artefacto de investigación para quienes estudian tokenización libre de vocabulario, segmentación dinámica de secuencias y arquitecturas jerárquicas sobre bytes. No se han publicado benchmarks, idiomas declarados en la model card más allá de los del entrenamiento, ni pipeline de inferencia asignado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (hierarchical network) byte-level, `architecture=hnet` |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | entrenado con `en`, `tr`, `fi`; soporte declarado no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con pesos atados mapeados en `config.json["tied_weights"]`; estado del entrenador en `training_state/checkpoint.pt` |

## Arquitectura y entrenamiento

El modelo es un H-Net que procesa texto a nivel de byte, sin vocabulario de tokens predefinido. La configuración de entrenamiento indica `objective=ratio`, `schedule=None` y `dechunk=ema`, lo que sugiere un objetivo basado en ratios de compresión o segmentación y una política de de-chunking implementada mediante media móvil exponencial. La organización de checkpoints sigue un esquema logarítmico en base 2 (`0, 1, 2, 4, 6, 8, 16, ..., 2^k`) desde el inicio de cada fase del objetivo, más el paso final, lo que facilita el análisis de la evolución del chunking a lo largo del entrenamiento.

El entrenamiento se realizó durante 6000 pasos con lotes de 32 secuencias de 1024 bytes, sobre datos en inglés, turco y finés (seed 1). El repositorio conserva el estado completo y reanudable del entrenador (`training_state/checkpoint.pt`) en cada rama `step-N`, lo que permite reproducir o continuar el entrenamiento. La rama `main` contiene los pesos y la configuración del último paso, además de `log.jsonl`, `final.json` y, una vez finalizado el run, las pruebas de frontera FLORES+ en `probe/`. No se detalla la composición exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Procesamiento de texto a nivel de byte sin tokenizador de vocabulario fijo.
- Segmentación dinámica (chunking) de secuencias mediante política EMA.
- Entrenamiento y evaluación de objetivos basados en ratio (`objective=ratio`).
- Multilingüe limitado a los idiomas de entrenamiento: inglés, turco y finés.
- Reanudación de entrenamiento desde checkpoints intermedios con estado completo del optimizador y del trainer.
- Evaluación de fronteras de chunking mediante las pruebas FLORES+ incluidas en `probe/`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Investigación en tokenización libre de vocabulario: el modelo permite estudiar cómo un H-Net byte-level agrupa secuencias sin un vocabulario BPE predefinido, comparando checkpoints intermedios del esquema logarítmico.
- Análisis de estrategias de chunking adaptativo: la política `dechunk=ema` y el objetivo `ratio` permiten experimentar con segmentación dinámica y medir su efecto en las fronteras de chunking mediante las pruebas FLORES+.
- Reproducción de experimentos: el estado resumible en `training_state/checkpoint.pt` permite reanudar el entrenamiento exactamente desde cualquier rama `step-N`, útil para réplicas y estudios de ablación.
- Estudio de multilingüismo a nivel de byte: al entrenarse con inglés, turco y finés (idiomas con morfología y ortografía dispares), sirve para analizar cómo un modelo byte-level maneja lenguas aglutinantes frente a analíticas.
- Base para experimentos de compresión y modelado de secuencias: el objetivo basado en ratio lo hace adecuado para probar métricas de compresión de texto sobre bytes.
- Docencia y formación en arquitecturas jerárquicas: su tamaño reducido (22,5 M de parámetros) y su licencia Apache 2.0 permiten usarlo como ejemplo didáctico de H-Net y de tokenización adaptativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 M de parámetros en fp32, el peso ronda los 90 MB; en fp16, unos 45 MB. La VRAM real depende del grafo de activaciones y de la longitud de secuencia, no disponible.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por tamaño; no se especifican requisitos oficiales.
- Cabe en GPU consumer: sí, con margen amplio (por ejemplo, RTX 3060, RTX 4090), aunque no se documenta el soporte de kernels optimizados.
- Opciones de despliegue: la model card solo documenta carga mediante `torch.load` y `huggingface_hub`; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (H-Net byte-level para chunking adaptativo) con parámetros, contexto, rendimiento y licencia verificables.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para generación de texto en producción.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K u otras).
- Idiomas limitados: el entrenamiento cubre solo inglés, turco y finés; el comportamiento en otros idiomas es desconocido.
- Contexto de entrenamiento corto: secuencias de 1024 bytes; no se documenta soporte para contextos mayores.
- Sin pipeline declarado: no se especifica una tarea de Hugging Face ni una interfaz de inferencia estándar.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto experimental conviene verificar su idoneidad antes de integrarlo.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_hnet_s1
- Organización AdaptiveChunking: https://huggingface.co/AdaptiveChunking/models
- Repositorio relacionado `hnet-chunking-pilots`: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
