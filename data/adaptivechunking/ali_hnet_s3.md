# AdaptiveChunking/ali_hnet_s3

## Resumen

`ali_hnet_s3` es un modelo de investigación publicado por el usuario AdaptiveChunking en Hugging Face, construido sobre el framework [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet). Se trata de una H-Net (hierarchical network) que opera a nivel de byte, es decir, sin tokenizador subword: procesa directamente secuencias de bytes y aprende a segmentarlas dinámicamente mediante un mecanismo de chunking adaptativo. El objetivo declarado en la model card es `ratio` y el deschunking utiliza una estrategia EMA.

El modelo es pequeño (22.516.992 parámetros) y fue entrenado durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre tres idiomas: inglés, turco y finés. Su relevancia no reside en capacidades generativas de propósito general, sino en servir como artefacto reproducible para estudiar tokenización byte-level dinámica, segmentación jerárquica y el efecto del chunking adaptativo en modelos de lenguaje de escala reducida.

El repositorio incluye múltiples checkpoints organizados por fases (`step-N`), estado completo del entrenador para reanudación, y sondas de frontera FLORES+ (`probe/`) una vez finalizado el run. La licencia es Apache 2.0. No se declara pipeline ni idiomas en los metadatos de Hugging Face, y no hay descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (hierarchical network) byte-level con chunking dinámico |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 bytes por secuencia en entrenamiento (no se declara contexto de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr, fi (según configuración de entrenamiento) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez), `training_state/checkpoint.pt` para reanudación |

## Arquitectura y entrenamiento

La arquitectura es una H-Net, un diseño jerárquico que segmenta la entrada en chunks de tamaño variable y procesa la información a múltiples niveles de granularidad. En este caso la entrada es byte-level puro: el modelo no depende de un tokenizador externo, sino que aprende a agrupar bytes en unidades significativas. El objetivo de entrenamiento es `ratio`, con `schedule=None` y deschunking mediante EMA (`dechunk=ema`), según la configuración declarada en la model card.

El entrenamiento se realizó con semilla 3, 6000 pasos, batch de 32 secuencias y 1024 bytes por secuencia, sobre los idiomas inglés, turco y finés. El repositorio organiza los checkpoints en ramas `step-N` siguiendo un calendario logarítmico en base 2 (0, 1, 2, 4, 6, 8, 16, ..., 2^k desde cada inicio de fase objetivo, más el paso final). Cada rama contiene `model.safetensors`, `config.json`, `training_config.yaml` y el estado completo del entrenador en `training_state/checkpoint.pt`. La rama `main` contiene los pesos y configuración del último paso, además de `log.jsonl`, `final.json` y las sondas de frontera FLORES+ en `probe/`. Los pesos atados se almacenan una sola vez; `config.json["tied_weights"]` mapea los nombres eliminados a los almacenados.

No se declaran innovaciones adicionales como decodificación especulativa, atención lineal o mezcla de expertos. La innovación principal es el propio mecanismo de chunking adaptativo byte-level.

## Capacidades

- Procesamiento byte-level sin tokenizador externo: acepta secuencias de bytes crudos y aprende segmentación dinámica.
- Segmentación jerárquica mediante chunking adaptativo con deschunking EMA.
- Modelado de lenguaje a escala reducida sobre inglés, turco y finés.
- Sondas de frontera FLORES+ incluidas en `probe/` para evaluar segmentación en límites de frase/oración.
- Reanudación exacta de entrenamiento gracias al estado completo en `training_state/checkpoint.pt`.
- No se declara soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni thinking mode.
- No se declara capacidad multilingüe más allá de los tres idiomas de entrenamiento.
- No se declara pipeline de inferencia estándar (text-generation, etc.).

## Casos de uso

- Investigación en tokenización byte-level: usar el modelo como banco de pruebas para comparar segmentación aprendida frente a BPE/SentencePiece en corpus multilingües con morfología aglutinante (turco, finés).
- Estudio de chunking adaptativo: analizar las fronteras de chunk producidas por el modelo sobre textos de los tres idiomas y contrastarlas con las sondas FLORES+ incluidas en `probe/`.
- Reproducción de experimentos: reanudar el entrenamiento desde cualquier rama `step-N` con el estado del entrenador para estudiar la evolución de la segmentación a lo largo de las fases.
- Evaluación de robustez morfológica: el finés y el turco son lenguas aglutinantes con alta productividad morfológica; el modelo permite medir cómo una representación byte-level evita el problema de vocabulario fuera de distribución.
- Baseline para arquitecturas jerárquicas: servir como referencia de 22,5 M de parámetros para comparar H-Nets con transformers byte-level de tamaño similar en tareas de modelado de lenguaje.
- Docencia y divulgación: el reducido tamaño y la licencia Apache 2.0 lo hacen apto para demostrar en clase cómo funciona una red jerárquica con chunking sin necesidad de infraestructura GPU dedicada.
- Análisis de fronteras lingüísticas: las sondas FLORES+ permiten estudiar si el modelo aprende a cortar en límites de palabra, morfema o frase según el idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 M de parámetros, en fp32 ocupa aproximadamente 90 MB de pesos; en fp16 unos 45 MB; en int8 unos 23 MB. El cuello de botella no es la memoria de pesos sino el estado del entrenador (`training_state/checkpoint.pt`), que eleva el tamaño del repo a 6,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia; una RTX 3060, RTX 4060 o incluso una GPU integrada moderna pueden ejecutarlo.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer de los últimos diez años, y probablemente en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: el repo está en formato PyTorch/safetensors y no declara integración con vLLM, llama.cpp, Ollama ni TGI. La vía natural es cargar los pesos con PyTorch y el código de `beetle-hnet`. No hay GGUF publicado.
- Latencia y throughput estimados: no disponible. Al no declararse pipeline ni script de inferencia, no se pueden estimar cifras fiables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_hnet_s3 | 22,5 M | 1024 bytes (entrenamiento) | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face (repo de investigación) |
| Byte-level transformer estándar | variable (típicamente 10-100 M en investigación) | variable | Transformer sobre bytes | variable | Múltiples repos |
| Modelos BPE pequeños (p. ej. destilados) | variable | variable | Tokenizador subword + transformer | variable | Amplia |

No se dispone de datos de rendimiento comparables publicados para `ali_hnet_s3`, por lo que la comparativa se limita a parámetros, contexto y enfoque arquitectónico. No se identifican en la información proporcionada modelos directamente comparables de la misma familia H-Net con resultados publicados.

## Limitaciones y advertencias

- Modelo de investigación sin pipeline declarado: no está pensado para uso en producción ni para generación de texto de propósito general.
- Contexto de entrenamiento limitado a 1024 bytes por secuencia; no se declara contexto de inferencia extendido.
- Solo tres idiomas de entrenamiento (en, tr, fi); no se declara cobertura multilingüe adicional.
- Sin datos de benchmarks publicados: no se puede evaluar su calidad frente a alternativas.
- Sin cuantizaciones publicadas (no hay GGUF, GPTQ ni AWQ): el despliegue requiere PyTorch y el código de `beetle-hnet`.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un modelo pequeño y de investigación, cabe esperar degradación en dominios fuera de los datos de entrenamiento.
- El tamaño del repo (6,5 GB) se debe principalmente al estado del entrenador, no a los pesos; descargar el repo completo no es necesario para inferencia.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y de pipeline hace desaconsejable su uso en producción sin validación adicional.
- Los pesos atados se almacenan una sola vez; es necesario respetar el mapeo `config.json["tied_weights"]` al cargar, o los pesos quedarán incompletos.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_hnet_s3
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
