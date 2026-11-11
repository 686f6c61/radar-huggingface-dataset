# AdaptiveChunking/ali_ali-noskel_s1

## Resumen

ali_ali-noskel_s1 es un modelo de investigación publicado por el usuario AdaptiveChunking, entrenado con el framework beetle-hnet bajo la arquitectura denominada "ali" y el objetivo "ratio". No es un modelo de lenguaje conversacional al uso: se trata de un experimento sobre tokenización dinámica a nivel de byte (dynamic chunking), orientado a estudiar cómo segmentar secuencias de bytes en unidades de longitud adaptativa en lugar de usar un vocabulario BPE fijo. El repositorio contiene exclusivamente artefactos de entrenamiento (checkpoints, configuración y estado del entrenador), no una pipeline de inferencia estándar.

El modelo tiene 22.785.088 parámetros (dato extraído de los pesos en safetensors) y fue entrenado durante 6.000 pasos con batches de 32 secuencias de 1.024 bytes, sobre textos en inglés, turco y finés. La licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors y PyTorch (checkpoint.pt). Su relevancia es académica: sirve como base reproducible para investigar esquemas de chunking adaptativo y su efecto en la frontera de tokens, con sondas FLORES+ incluidas en el repositorio.

No se dispone de información sobre pipeline, idiomas declarados en la ficha de Hugging Face ni resultados de evaluación de capacidades generativas, por lo que debe tratarse como un artefacto de investigación y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net variante "ali" (byte-level, dynamic chunking) según beetle-hnet |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1.024 bytes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | entrenado con en, tr, fi; idiomas declarados en la ficha: no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y PyTorch (checkpoint.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura "ali" del framework beetle-hnet, una H-Net (hierarchical network) que opera a nivel de byte con chunking dinámico. El objetivo de entrenamiento es "ratio", con un esquema de dechunking basado en EMA (media móvil exponencial) y `schedule=None`. Los pesos están atados (tied weights): `model.safetensors` almacena cada tensor una sola vez y `config.json["tied_weights"]` mapea los nombres eliminados a los almacenados. El repositorio organiza los checkpoints en ramas `step-N` siguiendo un calendario logarítmico consciente de fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k desde el inicio de cada fase del objetivo, más el paso final), e incluye el estado resumible completo del entrenador en `training_state/checkpoint.pt`.

El entrenamiento consistió en 6.000 pasos con batches de 32 secuencias de 1.024 bytes, semilla 1, sobre textos en inglés, turco y finés. No se especifica el número total de tokens procesados ni la composición exacta del dataset. Tampoco se documenta el uso de RLHF, DPO ni ajuste por preferencias. La rama `main` incluye `log.jsonl`, `final.json` y sondas de frontera FLORES+ (`probe/`) una vez finalizado el entrenamiento, lo que facilita la reproducibilidad del experimento.

## Capacidades

- Modelo de investigación sobre tokenización dinámica a nivel de byte; no está documentado como generador de texto conversacional.
- Segmentación adaptativa de secuencias de bytes mediante chunking dinámico (objetivo "ratio", dechunking EMA).
- Entrenado en tres idiomas (inglés, turco, finés), lo que permite estudiar el comportamiento del chunking en lenguas con morfología y ortografía distintas.
- Sondas de frontera FLORES+ incluidas en la rama `main` para evaluar la calidad de los límites de chunk.
- Pesos atados con mapeo explícito en `config.json`, lo que simplifica la carga y el análisis.
- No hay información disponible sobre tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Investigación en tokenización: usar los checkpoints `step-N` para analizar cómo evoluciona la segmentación de bytes a lo largo del entrenamiento y comparar fases del objetivo "ratio".
- Reproducción de experimentos: cargar `training_state/checkpoint.pt` desde una revisión concreta (por ejemplo `step-1024`) para reanudar el entrenamiento o inspeccionar el estado del optimizador y del scheduler.
- Evaluación de fronteras de tokens: ejecutar las sondas FLORES+ incluidas en `probe/` para medir la calidad de los límites de chunk en inglés, turco y finés.
- Estudio multilingüe de morfología: comparar el comportamiento del chunking en finés (aglutinante) y turco frente al inglés, usando los mismos pesos y configuración.
- Baseline para nuevos esquemas de chunking: emplear este modelo de 22,8 M de parámetros como referencia ligera al evaluar variantes de dynamic chunking.
- Análisis de eficiencia en bytes: medir el ratio de compresión de secuencias (bytes por chunk) que produce el modelo con el dechunking EMA en distintos checkpoints.
- Docencia y experimentación académica: el tamaño reducido y la licencia Apache 2.0 permiten desplegarlo en entornos con recursos limitados para prácticas de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,8 M de parámetros, los pesos en fp32 ocupan aproximadamente 91 MB; en fp16 unos 46 MB. No se dispone de datos de cuantización oficial.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente por memoria; el cuello de botella sería el código de chunking, no los pesos.
- Cabe en GPU consumer y en CPU; el tamaño del repositorio (3,5 GB) se debe principalmente a los múltiples checkpoints y al estado del entrenador, no a los pesos.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la carga se realiza con `huggingface_hub` y `torch.load` según el ejemplo de la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_ali-noskel_s1 | 22,8 M | no disponible (entrenado a 1.024 bytes) | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face (AdaptiveChunking) |
| Modelos BPE byte-level de tamaño similar | no disponible | no disponible | Tokenización BPE fija | variable | no disponible |
| Otros experimentos de beetle-hnet | no disponible | no disponible | Variantes de arquitectura/objetivo | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo de chat ni de generación de texto listo para uso; la model card no documenta pipeline de inferencia.
- Los idiomas declarados en la ficha de Hugging Face figuran como no disponibles; solo se conoce el conjunto de entrenamiento (en, tr, fi).
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un modelo de investigación sin ajuste por preferencias, no hay garantías de comportamiento seguro.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción.
- El repositorio es grande (3,5 GB) por los múltiples checkpoints y el estado del entrenador; conviene descargar solo la revisión necesaria.
- Los pesos atados requieren respetar el mapeo de `config.json["tied_weights"]` al cargar; ignorarlo puede provocar errores de carga.
- No hay información sobre cuantización, latencia ni throughput, lo que limita la planificación de despliegues.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_ali-noskel_s1
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
