# SlayerLab/Slayer1B-1.07-checkpoints

## Resumen

Slayer1B-1.07-checkpoints es un repositorio de puntos de control (checkpoints) intermedios del entrenamiento del modelo Slayer1B 1.07, desarrollado por SlayerLab. No se trata de un paquete listo para inferencia en formato Transformers o safetensors, sino de los estados nativos del entrenador (`torch.save`) que contienen tanto los pesos del modelo como el estado del optimizador (Muon + AdamW), la iteración y la configuración, pensados para reanudar o estudiar el proceso de entrenamiento. El modelo pertenece a la familia Slayer1B, orientada al polaco, y este repositorio documenta la fase de preentrenamiento continuado desde el checkpoint final de la versión 1.06.

El entrenamiento planificado abarca de la iteración 13849 a la 22327 (8479 iteraciones de 1 048 576 tokens cada una, con 256 secuencias de 4096 tokens por iteración), sobre un dataset de 8 891 005 707 tokens en una sola pasada, con una tasa de aprendizaje constante de 6e-4 sin decaimiento. El hardware empleado son 4 GPU NVIDIA RTX 4090 en DDP con acumulación de gradiente de 32. El repositorio tiene un tamaño de 79,7 GB y cada archivo pesa exactamente 8 860 287 151 bytes.

La relevancia de este repositorio es fundamentalmente de investigación: permite reproducir, auditar o reanudar el entrenamiento, así como estudiar la dinámica de la pérdida y el estado del optimizador en distintos puntos. No está pensado para despliegue en producción ni para uso directo con librerías de inferencia estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (definición en `train_gpt_ref_r23.py`; detalles no disponibles) |
| Parametros totales | no disponible (el nombre sugiere ~1B, sin confirmación en la información) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | polaco (tag `polish`); lista completa no disponible |
| Licencia | Apache-2.0 (checkpoints); datos de entrenamiento incluyen fuentes CC BY-SA |
| Formato de pesos | PyTorch pickle (`torch.save`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la definición en `train_gpt_ref_r23.py` y el nombre de la familia (Slayer1B), que sugiere un transformer de aproximadamente mil millones de parámetros. El entrenamiento se realiza con el entrenador `train_gpt_ref` r24.2 y utiliza un esquema de optimización dual Muon + AdamW, con estado del optimizador incluido en cada checkpoint. La secuencia de entrenamiento es de 4096 tokens y el lote global se mantiene idéntico al de las ejecuciones con 8 GPU mediante acumulación de gradiente de 32 sobre 4 RTX 4090.

El preentrenamiento continuado parte del checkpoint final de 1.06 (`ckpt_13848.pt`, sha256 `1fc7396c…`) y usa el dataset `SlayerLab/slayer-1.07-pretrain` (8 891 005 707 tokens, una pasada) con tasa de aprendizaje constante de 6e-4 sin decaimiento. El proceso sufrió dos interrupciones: una el 4 de noviembre en la iteración 17130, reanudada el 5 desde `ckpt_17000.pt` (las iteraciones 17001–17130 se entrenaron dos veces, con pérdida idéntica en la 17010), y otra el 5 de noviembre en la 19330, reanudada desde el checkpoint rotativo de la 19250 (no publicado; las iteraciones 19251–19330 se repitieron con pérdida idéntica en la 19260). Los checkpoints hasta la 17000 se guardaron antes de la primera interrupción, los de 18000–19000 entre ambas y los posteriores tras la segunda reanudación. No se mencionan RLHF, DPO ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en polaco (según el tag `polish` del repositorio); no se documentan capacidades adicionales.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del polaco.
- No se documentan modos especiales (thinking, visión, audio).
- El repositorio contiene estados de entrenador, no un paquete de inferencia listo para usar; las capacidades del modelo final deben consultarse en el repositorio Slayer1B-1.07.

## Casos de uso

- Reanudación de entrenamiento: cargar un checkpoint con `torch.load(path, map_location="cpu", weights_only=True)` y restaurar pesos, estado del optimizador, iteración y configuración para continuar el entrenamiento desde el punto exacto, gracias a que cada archivo incluye el estado completo del entrenador.
- Auditoría y reproducibilidad: comparar los hashes SHA-256 publicados con los archivos descargados para verificar la integridad de cada checkpoint y reproducir las condiciones del entrenamiento (tasa de aprendizaje, tamaño de lote, datos).
- Estudio de la dinámica de entrenamiento: analizar la curva de pérdida y el estado del optimizador en iteraciones concretas (13998, 14000, 15000, 15730, 16000, 17000, 18000, 18590, 19000) para investigar el comportamiento del optimizador Muon + AdamW.
- Investigación sobre interrupciones y reanudación: estudiar el efecto de reentrenar iteraciones duplicadas (17001–17130 y 19251–19330) y verificar la igualdad de pérdida reportada, útil para diseñar estrategias de tolerancia a fallos en entrenamiento distribuido.
- Desarrollo de herramientas de carga eficiente: usar `mmap=True` para evitar leer los 8,86 GB completos en memoria y probar utilidades de carga de checkpoints de entrenador en entornos con RAM limitada.
- Extracción de pesos para evaluación: convertir los pesos del diccionario del entrenador a un formato de inferencia para evaluar el modelo intermedio en tareas de generación de texto en polaco, aunque este flujo no está documentado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las evaluaciones realizadas durante el entrenamiento en el repositorio Slayer1B 1.07 y a la curva de entrenamiento en `https://track.fabryka.ai/run/4973c068-8dd5-59d8-b6c4-671ca3beb925`, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio no es un paquete de inferencia; cada checkpoint pesa 8 860 287 151 bytes e incluye pesos y estado del optimizador).
- GPU recomendadas: no disponible para inferencia; para entrenamiento el autor usa 4 × NVIDIA RTX 4090 en DDP con acumulación de gradiente 32.
- Compatibilidad con GPU de consumo: el entrenamiento se realizó en RTX 4090, por lo que el modelo es entrenable en GPU de consumo con la configuración descrita; los requisitos de inferencia no se documentan.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; la carga se realiza con PyTorch (`torch.load` con `weights_only=True` y `mmap=True`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Slayer1B-1.07-checkpoints | no disponible (~1B por nombre) | 4096 tokens | Apache-2.0 (datos con CC BY-SA) | PyTorch pickle (checkpoints de entrenador) | Hugging Face, 0 descargas, 1 like |
| Slayer1B-1.07 | no disponible | no disponible | no disponible en la información | no disponible | Hugging Face (modelo final) |
| Slayer1B-1.06-checkpoints | no disponible | no disponible | no disponible en la información | PyTorch pickle | Hugging Face (checkpoints previos) |

No se dispone de datos de rendimiento ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene checkpoints de entrenador, no un paquete de inferencia: no está en formato safetensors ni Transformers y requiere cargar el diccionario completo con PyTorch.
- Estado del entrenamiento en curso: el autor indica que el entrenamiento sigue activo y que se añadirán más checkpoints hasta la iteración 22327 planificada; los archivos actuales son intermedios.
- Idiomas: solo se documenta polaco; no hay información sobre otras lenguas.
- Licencia: los checkpoints son Apache-2.0, pero los datos de entrenamiento incluyen fuentes CC BY-SA (partes del núcleo polaco y textos legales, repetidos de slayer-pl-8x3b), lo que puede imponer obligaciones de compartir igual en usos derivados; conviene revisar las tarjetas de los datasets.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Interrupciones del entrenamiento: se reentrenaron iteraciones duplicadas (17001–17130 y 19251–19330); aunque el autor reporta pérdida idéntica, es un caveat a considerar en estudios de reproducibilidad.
- Tamaño: cada archivo pesa 8,86 GB y el repositorio completo 79,7 GB, lo que exige espacio en disco y planificación de descargas; se recomienda `mmap=True` para evitar cargar todo en RAM.
- Sin datos de benchmarks ni de rendimiento en la información proporcionada.

## Enlaces

- Repositorio de checkpoints: https://huggingface.co/SlayerLab/Slayer1B-1.07-checkpoints
- Modelo final Slayer1B 1.07: https://huggingface.co/SlayerLab/Slayer1B-1.07
- Checkpoints de la versión 1.06: https://huggingface.co/SlayerLab/Slayer1B-1.06-checkpoints
- Dataset de preentrenamiento: https://huggingface.co/datasets/SlayerLab/slayer-1.07-pretrain
- Dataset slayer-pl-8x3b: https://huggingface.co/datasets/SlayerLab/slayer-pl-8x3b
- Curva de entrenamiento y evaluaciones: https://track.fabryka.ai/run/4973c068-8dd5-59d8-b6c4-671ca3beb925
- Repositorio de benchmarks (referencia externa): https://github.com/slayerlabs/benchmarks-fabryka-ai/blob/main/research/slayer-1b/wygaszanie/pobierz.py
