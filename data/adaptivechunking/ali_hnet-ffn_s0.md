# AdaptiveChunking/ali_hnet-ffn_s0

## Resumen

`ali_hnet-ffn_s0` es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino una ejecución experimental de un H-Net de nivel de byte (byte-level) generada con el framework [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet), bajo la arquitectura `hnet_ffn` y el objetivo de entrenamiento `ratio`. Su propósito es estudiar estrategias de *dynamic chunking* (segmentación dinámica de secuencias de bytes) y tokenización a nivel de byte, no ofrecer generación de texto lista para producción.

El modelo tiene 22.785.033 parámetros reales (confirmados en los safetensors) y se entrenó durante 6000 pasos con un tamaño de lote de 32 secuencias de 1024 bytes, sobre tres idiomas: inglés (`en`), turco (`tr`) y finés (`fi`). La elección de estos idiomas es relevante porque combina una lengua germánica con dos lenguas aglutinantes y de morfología compleja, lo que resulta útil para evaluar tokenizadores y esquemas de chunking en escenarios donde la segmentación por bytes es especialmente difícil.

La relevancia del modelo es fundamentalmente metodológica: el repositorio incluye checkpoints intermedios en una programación logarítmica por fases (`step-0`, `step-1`, `step-2`, `step-4`, ..., `step-2^k`), estado completo del entrenador reanudable y sondas de frontera FLORES+ (`probe/`) una vez finalizada la ejecución. Esto lo convierte en un artefacto reproducible para investigación sobre representaciones de bytes y segmentación adaptativa, más que en un modelo para aplicaciones finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net con FFN (`architecture=hnet_ffn`), nivel de byte |
| Parametros totales | 22.785.033 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en, tr, fi (idiomas de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `training_state/checkpoint.pt` en PyTorch |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `hnet_ffn` del proyecto beetle-hnet, un diseño de H-Net orientado a operar directamente sobre bytes en lugar de tokens subword. El objetivo de entrenamiento es `ratio` y el esquema de *dechunking* es `ema` (media móvil exponencial), con `schedule=None`. No se dispone de información detallada sobre el número de capas, dimensiones ocultas, mecanismo de atención ni composición exacta del dataset más allá de los tres idiomas indicados.

El entrenamiento se realizó durante 6000 pasos con lotes de 32 secuencias de 1024 bytes, con semilla 0. El repositorio conserva checkpoints en una programación logarítmica consciente de fases (desde el inicio de cada fase del objetivo: 0, 1, 2, 4, 6, 8, 16, ..., 2^k, más el paso final), cada uno con pesos, configuración, configuración de entrenamiento y estado reanudable del entrenador. Los tensores atados (*tied weights*) se almacenan una sola vez y `config.json["tied_weights"]` mapea los nombres eliminados a los almacenados. No se ha publicado información sobre RLHF, DPO ni otras etapas de alineación.

## Capacidades

- Modelado de secuencias a nivel de byte sobre inglés, turco y finés.
- Segmentación dinámica de secuencias (*dynamic chunking*) mediante el mecanismo de dechunking con EMA.
- Evaluación de fronteras de segmentación mediante sondas FLORES+ incluidas en `probe/`.
- Reanudación de entrenamiento desde cualquier checkpoint intermedio gracias al estado completo del entrenador.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- No se ha documentado capacidad multilingüe más allá de los tres idiomas de entrenamiento.

## Casos de uso

- Investigación sobre tokenización byte-level: el modelo sirve como banco de pruebas para comparar esquemas de chunking dinámico frente a tokenizadores BPE o WordPiece en lenguas aglutinantes como turco y finés.
- Estudio de representaciones de bytes en morfología compleja: al entrenarse sobre `tr` y `fi`, permite analizar cómo un H-Net de nivel de byte maneja prefijos, sufijos y composición morfológica sin vocabulario subword.
- Reproducción de experimentos de segmentación adaptativa: los checkpoints por fases y el estado reanudable permiten repetir y auditar el entrenamiento paso a paso, algo poco habitual en modelos publicados.
- Evaluación de fronteras de chunking con FLORES+: las sondas incluidas permiten medir la calidad de la segmentación sobre un corpus multilingüe estándar.
- Baseline para investigación en arquitecturas H-Net: con 22,8 M de parámetros, es un punto de partida ligero para comparar variantes de arquitectura en entornos con recursos limitados.
- Docencia y experimentación académica: el tamaño reducido y la licencia Apache 2.0 permiten su uso en cursos y trabajos de fin de máster sobre procesamiento de lenguaje a nivel de byte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 22,8 M de parámetros (aproximadamente 91 MB de pesos), más overhead de activaciones y del framework.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090 o incluso una GPU integrada moderna pueden ejecutar el modelo.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU consumer con más de 2 GB de VRAM.
- Opciones de despliegue: PyTorch nativo (la librería declarada es `pytorch`); no se ha documentado soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ali_hnet-ffn_s0` | 22,8 M | no disponible (entrenado a 1024 bytes) | en, tr, fi | Apache 2.0 | Hugging Face |
| Modelos byte-level comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos directamente comparables de la misma categoría (H-Net byte-level con dynamic chunking) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: no se ha documentado ni evaluado para generación de texto, instrucciones ni diálogo.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en ninguna tarea.
- Cobertura lingüística limitada a inglés, turco y finés; el rendimiento en otros idiomas es desconocido.
- Contexto de entrenamiento de solo 1024 bytes; no se ha documentado soporte para secuencias más largas.
- Riesgo de alucinación y sesgos: no evaluado ni documentado por el autor.
- Repositorio de 1,3 GB con checkpoints intermedios: el peso en disco es elevado para el número de parámetros, debido al estado del entrenador.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de un artefacto de investigación sin validación, no se recomienda su uso en producción.
- Cero descargas y cero likes en el momento de la consulta: no hay comunidad ni soporte documentado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AdaptiveChunking/ali_hnet-ffn_s0)
- [Perfil de la organización AdaptiveChunking](https://huggingface.co/AdaptiveChunking/models)
- [Dataset hnet-chunking-probes](https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes/viewer/default)
- [Repositorio beetle-hnet](https://github.com/suchirsalhan/beetle-hnet)
