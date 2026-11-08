# AdaptiveChunking/ali_hnet_s2

## Resumen

`ali_hnet_s2` es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje generativo al uso, sino una implementación de H-Net (hierarchical network) de nivel de byte entrenada con el framework [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet). Su objetivo declarado es el chunking dinámico (`dynamic-chunking`), es decir, el aprendizaje de una política de segmentación adaptativa sobre secuencias de bytes, con una estrategia de de-chunking basada en media móvil exponencial (`dechunk=ema`).

El modelo tiene 22.516.992 parámetros totales y se distribuye en formato `safetensors` con pesos atados (cada tensor atado se almacena una sola vez y se mapea mediante `config.json["tied_weights"]`). El repositorio ocupa 6,5 GB, un tamaño desproporcionado respecto al número de parámetros, explicable por la inclusión de múltiples ramas `step-N` con estados de entrenador reanudables completos (`training_state/checkpoint.pt`).

La relevancia de este artefacto es fundamentalmente metodológica: sirve como referencia reproducible de un experimento de tokenización a nivel de byte con presupuesto de entrenamiento acotado (6000 pasos × 32 × 1024 bytes) sobre los idiomas inglés, turco y finés. No está pensado para despliegue en producción ni para tareas generativas, y su model card no documenta capacidades de inferencia de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (hierarchical network) de nivel de byte, `architecture=hnet` |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr, fi (idiomas de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados), `training_state/checkpoint.pt` (PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en beetle-hnet, con `objective=ratio` y `schedule=None`. Se trata de un modelo de nivel de byte, sin tokenizador subword intermedio, que aprende a agrupar bytes en unidades de mayor granularidad mediante una política de chunking dinámico. La variante de de-chunking empleada es `dechunk=ema` (media móvil exponencial), que suaviza las decisiones de frontera de chunk a lo largo de la secuencia.

El entrenamiento se ejecutó durante 6000 pasos con un batch efectivo de 32 secuencias de 1024 bytes cada una, sobre un corpus multilingüe limitado a inglés, turco y finés, con semilla 2. El repositorio conserva checkpoints intermedios en una programación logarítmica por fases (pasos 0, 1, 2, 4, 6, 8, 16, ... hasta 2^k desde el inicio de cada fase de objetivo, más el paso final), cada uno con pesos, `config.json`, `training_config.yaml` y estado reanudable del entrenador. La rama `main` contiene los pesos y la configuración del último paso, además de `log.jsonl`, `final.json` y las sondas de frontera FLORES+ en `probe/` una vez finalizada la ejecución.

## Capacidades

- Modelado de secuencias a nivel de byte con segmentación adaptativa (chunking dinámico).
- Aprendizaje de fronteras de chunk mediante política `ratio` y de-chunking `ema`.
- Evaluación de fronteras de segmentación con sondas FLORES+ (`probe/`).
- Multilingüe restringido a los tres idiomas de entrenamiento: inglés, turco y finés.
- Reanudación de entrenamiento desde cualquier checkpoint intermedio conservado.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- No se documenta generación de texto de propósito general ni instrucciones de chat.

## Casos de uso

- Investigación en tokenización libre de tokenizador: el modelo permite estudiar cómo una política de chunking aprendida agrupa bytes en unidades semánticas sin vocabulario predefinido, usando las sondas FLORES+ incluidas para medir la calidad de las fronteras.
- Reproducción de experimentos de H-Net: los checkpoints intermedios con estado completo del entrenador permiten reanudar o bifurcar la ejecución en pasos concretos (por ejemplo, `revision="step-1024"`) para comparar fases del objetivo `ratio`.
- Estudio comparativo de estrategias de de-chunking: la variante `ema` puede contrastarse con otras políticas en ejecuciones paralelas de beetle-hnet sobre el mismo corpus en/tr/fi.
- Análisis de eficiencia en lenguas aglutinantes: el corpus incluye turco y finés, lo que permite examinar si el chunking dinámico captura morfemas frecuentes en estas lenguas mejor que la segmentación fija.
- Base para experimentos de compresión de secuencias: las representaciones de chunk aprendidas pueden reutilizarse como entrada de modelos posteriores que operen sobre unidades de mayor granularidad que el byte.
- Docencia y divulgación sobre tokenización: el tamaño reducido (22,5 M de parámetros) y la licencia Apache 2.0 facilitan su uso en entornos académicos para ilustrar el funcionamiento interno de esquemas de segmentación aprendidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 22,5 M de parámetros, los pesos en precisión completa ocuparían del orden de decenas de MB, pero el repositorio de 6,5 GB incluye estados de entrenador que no son necesarios para inferencia.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer reciente podría alojar los pesos, pero no se documenta ningún requisito oficial.
- Compatibilidad con GPU consumer: no confirmada por el autor; el tamaño de parámetros es compatible con GPUs de gama media-baja, pero la ausencia de instrucciones de inferencia impide afirmarlo con rigor.
- Opciones de despliegue: no disponible; la model card solo documenta carga de checkpoints con `huggingface_hub` y `torch.load`, no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdaptiveChunking/ali_hnet_s2 | 22.516.992 | no disponible | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face |
| AdaptiveChunking/hnet-chunking-pilots | no disponible | no disponible | Pilotos de chunking H-Net de la misma organización | no disponible | Hugging Face |
| Modelos de tokenización byte-level convencionales (p. ej. ByT5) | no disponible en la información proporcionada | no disponible | Byte-level sin chunking aprendido | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no es un modelo de chat ni de generación de texto de propósito general; no debe esperarse comportamiento de asistente.
- Cobertura lingüística muy limitada: solo inglés, turco y finés; el rendimiento fuera de estos idiomas no está documentado.
- Corpus y presupuesto de entrenamiento reducidos (6000 pasos × 32 × 1024 bytes), lo que limita la generalización de las fronteras de chunk aprendidas.
- No se han publicado benchmarks ni evaluaciones cuantitativas más allá de las sondas FLORES+ mencionadas en la model card.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al no ser un modelo generativo de texto libre, el riesgo se traslada a la calidad de la segmentación.
- El repositorio de 6,5 GB incluye estados de entrenador completos; conviene descargar solo las revisiones necesarias para evitar consumo innecesario de almacenamiento.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto de investigación sin garantías de rendimiento, su uso en producción requeriría validación propia.
- Los pesos atados se almacenan una sola vez; es imprescindible aplicar el mapeo de `config.json["tied_weights"]` al cargar, o el modelo quedará incompleto.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AdaptiveChunking/ali_hnet_s2)
- [Perfil de la organización AdaptiveChunking](https://huggingface.co/AdaptiveChunking/models)
- [AdaptiveChunking/hnet-chunking-pilots](https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots)
- [Repositorio beetle-hnet](https://github.com/suchirsalhan/beetle-hnet)
