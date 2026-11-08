# AdaptiveChunking/ali_hnet-ffn_s1

## Resumen

ali_hnet-ffn_s1 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino el resultado de un experimento de tokenización dinámica a nivel de byte (byte-level) sobre la arquitectura H-Net, ejecutado con el framework beetle-hnet. El modelo tiene 22.785.033 parámetros totales y se distribuye en formato safetensors con licencia Apache 2.0.

El objetivo del experimento es estudiar el chunking dinámico (agrupación adaptativa de bytes en unidades mayores) como alternativa a la tokenización estática tipo BPE. La variante aquí publicada usa `architecture=hnet_ffn` y `objective=ratio`, con un esquema de decodificación basado en media móvil exponencial (`dechunk=ema`), semilla 1 y un entrenamiento de 6000 pasos sobre secuencias de 1024 bytes y tres idiomas (inglés, turco y finés).

Su relevancia es acotada: se trata de un artefacto de investigación con 0 descargas y 0 likes, pensado para reproducibilidad y análisis de dinámicas de chunking, no para despliegue en producción. No hay model card con benchmarks, idiomas declarados en metadatos ni pipeline asignado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net con FFN (`architecture=hnet_ffn`), procesamiento a nivel de byte |
| Parametros totales | 22.785.033 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | entrenado con `['en', 'tr', 'fi']`; metadatos de idioma no declarados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con estado de entrenador en `checkpoint.pt` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net en su variante con FFN, un diseño que aprende a segmentar dinámicamente la secuencia de entrada en lugar de depender de un vocabulario de tokens fijo. La entrada es byte-level: el modelo procesa bytes crudos y aprende agrupaciones (chunks) de forma adaptativa. El objetivo de entrenamiento es `objective=ratio` y la decodificación de chunks emplea un esquema de media móvil exponencial (`dechunk=ema`). No se especifica en la información disponible si la arquitectura es transformer puro, híbrida o SSM.

El entrenamiento se realizó con el framework beetle-hnet durante 6000 pasos con batch de 32 y secuencias de 1024 bytes, sobre datos en inglés, turco y finés, con semilla 1 y `schedule=None`. El repositorio conserva ramas `step-N` en una programación logarítmica consciente de fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k) más el paso final, cada una con pesos, `config.json`, `training_config.yaml` y el estado reanudable completo del entrenador. La rama `main` contiene los pesos del último paso, `log.jsonl`, `final.json` y sondas de frontera FLORES+ en `probe/`. Los tensores atados se almacenan una sola vez y `config.json["tied_weights"]` mapea los nombres omitidos.

## Capacidades

- Modelado de lenguaje a nivel de byte con chunking dinámico aprendido.
- Segmentación adaptativa de secuencias (el propio mecanismo de chunking es la capacidad central del experimento).
- Multilingüe limitado a los idiomas de entrenamiento: inglés, turco y finés.
- Reanudación de entrenamiento desde cualquier rama `step-N` mediante el estado completo del entrenador.
- Evaluación de fronteras de chunking mediante las sondas FLORES+ incluidas en `probe/`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en tokenización: comparar el chunking dinámico byte-level frente a BPE o SentencePiece en corpus multilingües con morfología aglutinante (turco, finés), usando las sondas FLORES+ del repositorio.
- Reproducción de experimentos: reanudar el entrenamiento desde cualquier rama `step-N` con `training_state/checkpoint.pt` para estudiar la evolución del chunking a lo largo de las fases.
- Análisis de dinámicas de segmentación: inspeccionar `log.jsonl` y `final.json` para trazar cómo cambian los límites de chunk durante el entrenamiento.
- Prototipado de preprocesado sin vocabulario fijo: evaluar si el enfoque byte-level reduce la dependencia de tokenizadores específicos de idioma en pipelines de investigación.
- Estudio de eficiencia en secuencias cortas: con 22,8 M de parámetros y contexto de 1024 bytes, sirve como banco de pruebas de bajo coste en una única GPU consumer.
- Base para experimentos derivados: punto de partida para variantes con otros objetivos (`ratio` frente a alternativas) o esquemas de dechunk distintos de `ema`.
- Docencia y divulgación: ejemplo compacto y reproducible de arquitectura H-Net con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 91 MB solo para pesos (22,8 M de parámetros × 4 bytes); en FP16/BF16, unos 46 MB. El overhead de activaciones para 1024 bytes de contexto es mínimo.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso en CPU.
- GPU recomendadas: ninguna en particular; para entrenamiento y reproducción, una GPU con al menos 8 GB facilita el manejo del estado del entrenador y los checkpoints.
- Opciones de despliegue: al ser un artefacto de PyTorch con arquitectura H-Net no estándar, no se garantiza compatibilidad con vLLM, llama.cpp, Ollama o TGI; el uso previsto es cargar los pesos con el código de beetle-hnet.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_hnet-ffn_s1 | 22,8 M | 1024 bytes (entrenamiento) | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face |
| AdaptiveChunking/hnet-chunking-pilots | no disponible | no disponible | Pilotos de chunking H-Net | no disponible | Hugging Face |
| Byte-level LM convencional (p. ej. ByT5-small) | ~300 M | no disponible en esta ficha | Transformer byte-level sin chunking aprendido | no disponible en esta ficha | Público |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: 0 descargas y 0 likes; no hay evidencia de uso en producción ni validación externa.
- Sin benchmarks publicados: no se puede afirmar nada sobre calidad de modelado, perplejidad o rendimiento en tareas downstream.
- Idiomas limitados a inglés, turco y finés; no se declaran idiomas en los metadatos de Hugging Face.
- Contexto de entrenamiento corto (1024 bytes); no se documenta capacidad de extrapolación.
- Arquitectura no estándar: requiere el código de beetle-hnet para cargar y ejecutar los pesos; las herramientas habituales de inferencia probablemente no lo soporten.
- Riesgo de alucinación: no evaluado; al ser un modelo pequeño entrenado con pocos pasos (6000), la calidad de generación de texto libre es previsiblemente baja.
- Sesgos: no documentados; los datos de entrenamiento no se describen en detalle.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de evaluación hace desaconsejable cualquier despliegue en producción sin validación previa.
- Los pesos atados se almacenan una sola vez; cargar los tensores sin aplicar `config.json["tied_weights"]` produce un modelo incompleto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_hnet-ffn_s1
- Organización AdaptiveChunking: https://huggingface.co/AdaptiveChunking/models
- Repositorio de pilotos de chunking: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
