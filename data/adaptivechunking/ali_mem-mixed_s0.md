# AdaptiveChunking/ali_mem-mixed_s0

## Resumen

`ali_mem-mixed_s0` es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución (run) de un H-Net a nivel de byte, generada con el framework [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet) bajo la configuración `architecture=ali`, `objective=ratio`, `schedule=None`, `dechunk=ema` y semilla 0. El entrenamiento consistió en 6000 pasos sobre lotes de 32 secuencias de 1024 bytes, con textos en inglés, turco y finés. No es un modelo conversacional ni un modelo de lenguaje instructivo: es un artefacto experimental orientado al estudio de la tokenización dinámica y el chunking adaptativo a nivel de byte.

El modelo cuenta con 22.785.088 parámetros (unos 22,8 millones), un tamaño muy reducido que lo sitúa en la categoría de modelos pequeños de investigación. El repositorio ocupa 5,6 GB, un tamaño desproporcionado respecto al número de parámetros, explicable porque incluye múltiples ramas `step-N` con checkpoints completos, estados de entrenador reanudables (`training_state/checkpoint.pt`) y sondas de frontera FLORES+. Los pesos se distribuyen en formato safetensors y PyTorch, con licencia Apache 2.0.

Su relevancia es acotada y de carácter metodológico: sirve como referencia reproducible para quienes investigan arquitecturas H-Net, esquemas de chunking dinámico y objetivos de entrenamiento basados en ratios, no como modelo listo para producción. La model card no documenta benchmarks, idiomas de inferencia ni pipeline de uso, y el modelo acumula cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net a nivel de byte (variante `ali`, framework beetle-hnet) |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Entrenado con textos en inglés, turco y finés (`langs ['en', 'tr', 'fi']`); idiomas de inferencia no documentados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y PyTorch (`.pt` para estados de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura es un H-Net a nivel de byte, una familia de modelos jerárquicos que procesan la entrada como secuencia de bytes en lugar de tokens subword y que aprenden a agrupar (chunk) dinámicamente representaciones intermedias. La variante `ali` corresponde a la implementación del framework beetle-hnet, con `objective=ratio` y `dechunk=ema`, lo que sugiere un objetivo de entrenamiento basado en ratios de compresión o chunking y un mecanismo de de-chunking con media móvil exponencial. No se especifica en la información disponible el número de capas, dimensión oculta ni mecanismo de atención concreto.

El entrenamiento constó de 6000 pasos con lotes de 32 secuencias de 1024 bytes cada uno, lo que equivale a unos 196,6 millones de bytes procesados en total (aproximadamente 6000 × 32 × 1024). Los datos cubren tres idiomas: inglés, turco y finés, una combinación que aporta diversidad morfológica (el finés es aglutinante y el turco presenta armonía vocálica), lo que resulta coherente con un estudio de tokenización a nivel de byte. No se documenta el uso de RLHF, DPO ni ajuste por instrucciones. El repositorio conserva checkpoints intermedios en ramas `step-N` siguiendo un esquema logarítmico en base 2 (pasos 0, 1, 2, 4, 6, 8, 16, …, 2^k), además del estado completo del entrenador para reanudación.

## Capacidades

- Modelado de lenguaje a nivel de byte: predice el siguiente byte en lugar de tokens subword, lo que permite cubrir cualquier texto sin vocabulario fijo.
- Chunking dinámico: implementa mecanismos de agrupación adaptativa de representaciones (`dynamic-chunking`, `dechunk=ema`) propios de la arquitectura H-Net.
- Multilingüismo limitado al entrenamiento: inglés, turco y finés.
- Reproducibilidad de investigación: incluye estados de entrenador reanudables y checkpoints intermedios para estudiar la evolución del entrenamiento.
- Sondas de frontera FLORES+: el run genera pruebas de frontera sobre FLORES+ al finalizar, orientadas a evaluar la segmentación a nivel de byte.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en tokenización a nivel de byte: sirve para comparar el comportamiento de un H-Net frente a tokenizadores BPE o SentencePiece en corpus multilingües con morfología rica (turco, finés).
- Estudio de chunking adaptativo: los checkpoints intermedios permiten analizar cómo evoluciona la segmentación dinámica a lo largo del entrenamiento y validar variantes del objetivo `ratio`.
- Reproducción de experimentos: el estado reanudable (`training_state/checkpoint.pt`) y las ramas `step-N` permiten retomar el entrenamiento o replicar la curva de aprendizaje con la semilla 0.
- Evaluación de fronteras lingüísticas: las sondas FLORES+ del directorio `probe/` permiten medir la calidad de la segmentación en textos paralelos de los tres idiomas entrenados.
- Base para modelos pequeños de bajo coste: con 22,8 millones de parámetros, puede ejecutarse en CPU para pruebas de concepto de procesamiento de bytes sin infraestructura GPU.
- Docencia y experimentación académica: adecuado como ejemplo mínimo y abierto (Apache 2.0) de arquitectura H-Net para cursos o talleres sobre arquitecturas alternativas a los transformers estándar.
- Análisis de robustez ante ruido: al operar sobre bytes, permite estudiar el comportamiento del modelo con texto mal codificado, emojis o secuencias no vistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,8 millones de parámetros, los pesos en fp32 ocupan aproximadamente 91 MB; en fp16, unos 46 MB; en int8, unos 23 MB. El repositorio de 5,6 GB incluye checkpoints y estados de entrenamiento, no solo los pesos finales.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4090, A100 o H100 pueden alojar el modelo con holgura. También es viable la inferencia en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 1 GB de VRAM, e incluso en sistemas integrados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un H-Net a nivel de byte con código propio de beetle-hnet, el despliegue requiere cargar los pesos con PyTorch y el código del framework.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ali_mem-mixed_s0` | 22,8 M | no disponible (entrenado a 1024 bytes) | H-Net a nivel de byte, chunking dinámico | Apache 2.0 | Hugging Face (0 descargas) |
| Modelos byte-level tipo ByT5 (referencia) | 300 M–13 B | hasta 1024 tokens | Transformer encoder-decoder a nivel de byte | Apache 2.0 | Público |
| Tokenizadores BPE/SentencePiece | no aplica (no es modelo) | no aplica | Segmentación subword estática | variable | Amplia |

No se dispone de datos de rendimiento comparativo entre `ali_mem-mixed_s0` y estas alternativas en la información proporcionada; la comparación se limita a parámetros, enfoque y licencia.

## Limitaciones y advertencias

- Modelo de investigación sin ajuste por instrucciones: no está diseñado para conversación, asistencia ni generación controlada de texto.
- Sin benchmarks publicados: no hay evidencia de calidad en tareas estándar (MMLU, HumanEval, GSM8K u otras).
- Cobertura lingüística restringida: entrenado solo con inglés, turco y finés; el comportamiento en otros idiomas no está documentado.
- Contexto de entrenamiento corto: 1024 bytes por secuencia; no se especifica capacidad de extrapolación a secuencias más largas.
- Riesgo de alucinación y salidas incoherentes: al ser un modelo pequeño y de dominio experimental, la generación libre de texto probablemente carezca de coherencia semántica.
- Sesgos desconocidos: no se documenta la composición del corpus ni filtros aplicados, por lo que no es posible evaluar sesgos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo no incluye garantías ni soporte; el código del framework beetle-hnet debe revisarse por separado.
- Repositorio pesado: 5,6 GB frente a los ~91 MB de pesos en fp32, lo que puede encarecer la descarga y el almacenamiento si solo se necesitan los pesos finales.
- Sin pipeline declarado en Hugging Face: la carga requiere código personalizado y no funciona con `pipeline()` de transformers de forma directa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-mixed_s0
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking/datasets
- Framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
