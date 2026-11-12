# SlayerLab/Slayer1B-1.09-checkpoints

## Resumen

Slayer1B 1.09 es un modelo de lenguaje de 1.073.912.851 parámetros en fase de entrenamiento, desarrollado por Fabryka AI (SlayerLab) bajo el nombre de sus autores Arkadiusz Słota, Anna Sieczka, Piotr Styła, Aleksander Ogrodzki, Paweł Puzio y Marcin Kuśmierski. Este repositorio concreto no contiene un modelo terminado, sino los checkpoints nativos de PyTorch del entrenamiento que dará lugar a Slayer1B 1.09, un continued pretraining iniciado desde los pesos finales de Slayer1B 1.08 con un estado de optimizador nuevo.

El modelo sigue una arquitectura transformer densa de 20 capas, anchura 2.048, 16 cabezas, activación SwiGLU, normalización RMSNorm, RoPE con base 500.000, normalización QK y value residuals. El tokenizador es la versión v6 con vocabulario de 32.768 tokens, idéntico al de Slayer1B 1.08. En el momento de la publicación (12 de noviembre de 2026) el entrenamiento está en curso, con 35.000 actualizaciones completadas de las 120.000 configuradas, cada una procesando 1.048.576 tokens (256 secuencias de 4.096 tokens).

La relevancia de este repositorio es fundamentalmente de investigación y reproducibilidad: expone la curva de entrenamiento, los checkpoints intermedios cada 5.000 actualizaciones y el estado completo del optimizador, lo que permite estudiar la dinámica de entrenamiento, reanudar la ejecución o auditar el proceso. No es un paquete Transformers/safetensors ni un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (20 capas, width 2.048, 16 cabezas, SwiGLU, RMSNorm, RoPE base 500.000, QK normalization, value residuals) |
| Parametros totales | 1.073.912.851 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (checkpoints en float32; no se publican versiones cuantizadas) |
| Idiomas soportados | polaco e inglés (asignación objetivo de datos nuevos: 20% polaco / 80% inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (float32); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 20 capas con anchura 2.048 y 16 cabezas de atención. Incorpora SwiGLU como activación, RMSNorm, RoPE con base 500.000, normalización QK y value residuals. El entrenamiento parte de los pesos finales de Slayer1B 1.08 (revisión `5f854a0c`) con un estado de optimizador nuevo, es decir, un continued pretraining. La definición del modelo está en `train_gpt_ref_r23.py` (sha256 `db36c150…`) dentro del repositorio de 1.08, y el entrenador es `train_gpt_ref` r24.2 (sha256 `46f83b51…`).

El schedule usa Muon con learning rate máximo 0.02 y AdamW con máximo 0.0006, con warmup de 2.000 actualizaciones y después tasa constante; la ejecución está configurada para 120.000 actualizaciones con decaimiento a partir de la 96.000, hito que aún no se ha alcanzado. Cada actualización procesa 256 secuencias de 4.096 tokens (1.048.576 tokens). Los datos nuevos siguen una asignación objetivo del 20% polaco y 80% inglés, detallada en el data card del repositorio. El hardware empleado son 8 × NVIDIA B200 u 8 × H200 en instancias spot; tras cada interrupción el entrenamiento se reanudó desde el checkpoint completo más reciente (escrito cada 200 actualizaciones), por lo que algunas actualizaciones se calcularon más de una vez. Hasta la actualización 35.000 se han procesado 36,70 mil millones de posiciones en esta ejecución, con un límite inferior de linaje de 55,45 mil millones de posiciones heredadas de Slayer1B 1.00–1.08.

## Capacidades

- Generación de texto autoregresiva en polaco e inglés, condicionada por el estado de entrenamiento en cada checkpoint.
- Razonamiento y conocimiento general limitados por el estado intermedio del entrenamiento (no es un modelo finalizado).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo thinking.
- Capacidades multilingües limitadas a polaco e inglés según la asignación de datos.
- Uso principal: reanudación de entrenamiento, estudio de la curva de pérdida y auditoría del proceso.

## Casos de uso

- Reanudación de entrenamiento: cargar `ckpt_35000.pt` con `torch.load(path, map_location="cpu", weights_only=True)` para continuar la ejecución desde la actualización 35.000 con estado de optimizador Muon y AdamW intacto, útil para replicar o extender el run.
- Estudio de dinámica de entrenamiento: comparar los checkpoints `wagi_5000.pt` a `wagi_35000.pt` para analizar cómo evolucionan los pesos y la pérdida a lo largo de las actualizaciones, con la curva disponible en Track.
- Auditoría de reproducibilidad: verificar los hashes SHA-256 publicados en `SHA256SUMS` contra los ficheros descargados para garantizar la integridad de los checkpoints.
- Investigación sobre deduplicación de datos: el repositorio separa explícitamente "posiciones en esta ejecución" y "límite inferior de linaje", lo que permite estudiar el impacto de datos duplicados (114.627.128 posiciones identificadas como copias en el primer segmento).
- Análisis de estrategias de optimizador: el uso combinado de Muon (lr 0.02) y AdamW (lr 0.0006) con warmup de 2.000 pasos y tasa constante ofrece un caso de estudio para comparar con schedules de decaimiento.
- Evaluación de continued pretraining desde un modelo base: permite medir cómo evoluciona Slayer1B 1.08 al continuar el entrenamiento con datos nuevos 20% polaco / 80% inglés.
- Desarrollo de pipelines de entrenamiento tolerantes a interrupciones: el uso de instancias spot con reanudación desde checkpoints cada 200 actualizaciones sirve como referencia para diseñar sistemas resilientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la pérdida de entrenamiento y los resultados de evaluación en cada actualización están en Track, pero no se proporcionan cifras concretas en la información disponible. Se advierte explícitamente que los cambios de segmento de datos durante el run (por ejemplo en la actualización 10.000) alteran la distribución de la pérdida, por lo que una caída en esa frontera no implica por sí sola una mejora de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los checkpoints están en float32 (4,3 GB por fichero de pesos), lo que sugiere que una inferencia en fp32 requeriría aproximadamente 4,3 GB solo para pesos, más memoria para activaciones y KV cache; no se publican cifras oficiales.
- GPU recomendadas: el entrenamiento se realizó en 8 × NVIDIA B200 u 8 × H200. Para inferencia no se especifican requisitos.
- Compatibilidad con GPU de consumo: no confirmada. Por tamaño (1,07 mil millones de parámetros) cabría en GPUs de consumo con suficiente VRAM, pero al no publicarse versiones cuantizadas ni formato GGUF, no es posible confirmarlo.
- Opciones de despliegue: no se documentan. El formato `.pt` requiere cargar la definición del modelo desde `train_gpt_ref_r23.py`; no hay integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| Slayer1B 1.09 (checkpoints) | 1.073.912.851 | 4.096 | Apache 2.0 | PyTorch `.pt` | Entrenamiento en curso |
| Slayer1B 1.08 | no disponible en la información | no disponible | Apache 2.0 (según repositorio referenciado) | no disponible | Modelo finalizado (referencia) |
| Alternativas de ~1B parámetros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- Los checkpoints son estados intermedios de un entrenamiento con learning rate constante; no constituyen un modelo finalizado ni una valoración de calidad.
- El entrenamiento está en curso y los ficheros se suben de uno en uno; un fichero ausente de la lista simplemente no se ha subido todavía.
- Los cambios de segmento de datos durante el run (por ejemplo en la actualización 10.000) alteran la distribución de la pérdida; una caída en esa frontera no demuestra una mejora de calidad.
- El recuento de "límite inferior de linaje" no es un recuento de tokens únicos deduplicados globalmente.
- Tras cada interrupción por instancias spot, algunas actualizaciones se calcularon más de una vez, lo que puede afectar a la reproducibilidad exacta.
- No se documentan sesgos conocidos, pero al entrenarse con datos en polaco e inglés, el comportamiento en otros idiomas no está garantizado.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un checkpoint intermedio, el riesgo es presumiblemente alto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al no ser un modelo finalizado, su uso en producción no está recomendado ni validado.
- El formato `.pt` no es directamente compatible con ecosistemas estándar de inferencia (Transformers, vLLM, llama.cpp); requiere código propio para cargar la definición del modelo.
- No se proporcionan versiones cuantizadas, por lo que el despliegue eficiente en hardware limitado no está soportado de forma oficial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SlayerLab/Slayer1B-1.09-checkpoints
- Modelo de referencia Slayer1B 1.08: https://huggingface.co/SlayerLab/Slayer1B-1.08
- Modelo objetivo Slayer1B 1.09: https://huggingface.co/SlayerLab/Slayer1B-1.09
- Data card: https://huggingface.co/SlayerLab/Slayer1B-1.09/blob/main/DATA_CARD.md
- Curva de entrenamiento y evaluaciones (Track): https://track.fabryka.ai/run/71cf98ec-7c60-54a8-ac47-0ea7a23f573a
