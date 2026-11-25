# NoeFlandre/gpt2-fineweb-edu-ordering

## Resumen

GPT-2 45M FineWeb-Edu Ordering es un conjunto de cuatro modelos GPT-2 pequenos entrenados desde cero por NoeFlandre con el objetivo de estudiar empiricamente si el orden en que se presentan los documentos durante el preentrenamiento afecta al rendimiento final del modelo. Los cuatro modelos comparten exactamente la misma arquitectura, el mismo presupuesto de tokens (899,7M por ejecucion) y la misma semilla, y solo difieren en la secuencia en que consumen los documentos: orden aleatorio, ascendente por puntuacion educativa, descendente, o una estrategia de "cooldown" que reserva los documentos de mayor puntuacion para el final.

El modelo es relevante como objeto de investigacion, no como herramienta de produccion: es un GPT-2 de 45,2M de parametros (18,9M sin embeddings) con contexto de 1024 tokens, entrenado sobre un subconjunto de FineWeb-Edu. El repositorio contiene los pesos finales de cada ejecucion, los checkpoints, las configuraciones y los registros de metricas, lo que permite reproducir y auditar el experimento.

La ficha se centra en el modelo base resultante (carpeta `runs/<arm>/`), que es un modelo de preentrenamiento sin ajuste por instrucciones ni alineamiento, con licencia MIT y solo idioma ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only): 6 capas, ancho 512, 8 cabezas, contexto 1024 |
| Parametros totales | 45,2M (18,9M excluyendo embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en `model.pt`; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`), mas `config.json`, `metrics.jsonl` y `checkpoint.pt` por ejecucion |

## Arquitectura y entrenamiento

La arquitectura es un GPT-2 clasico de 6 capas con ancho 512 y 8 cabezas de atencion, contexto de 1024 tokens y vocabulario BPE de GPT-2 de 50.304 entradas (con padding), con embeddings de entrada y salida atados. El entrenamiento se realizo desde cero sobre FineWeb-Edu `sample-10BT`, con un presupuesto de 1.716 pasos de 524.288 tokens cada uno, lo que suma 899,7M tokens por ejecucion. Se uso AdamW (β = 0,9 / 0,95), weight decay 0,1 sobre matrices de pesos, learning rate pico de 6e-4 con warmup lineal de 18 pasos y decaimiento coseno hasta 6e-5, clipping de gradiente a 1,0, autocast en bf16 y semilla 42.

La innovacion del trabajo no esta en la arquitectura sino en el diseno experimental: cuatro ejecuciones identicas salvo por el orden de los documentos (`shuffle`, `ascending`, `descending`, `cooldown`). La estrategia `cooldown` entrena primero con el 80% de tokens de menor puntuacion (barajados) y despues con el 20% de mayor puntuacion (barajados), una tecnica inspirada en el curriculum learning y el data scheduling. El pool de datos es una porcion barajada de aproximadamente 1,3 de los 14 ficheros de `sample-10BT`, con todos los documentos puntuados por encima de 2,5 en el clasificador educativo de FineWeb-Edu. No se menciona RLHF, DPO ni ajuste por instrucciones: es un modelo puramente de preentrenamiento.

## Capacidades

- Generacion de texto autoregresiva basica en ingles, limitada por el tamano del modelo (45,2M de parametros).
- Modelado de lenguaje de siguiente token; util como banco de pruebas para estudiar dinamicas de preentrenamiento.
- Evaluacion de perdida de validacion por bucket de calidad educativa (cuatro rangos entre 2,5 y 5,0).
- Evaluacion en benchmarks de conocimiento comun y razonamiento simple: HellaSwag, PIQA y ARC-Easy.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma fiable.
- No tiene modo thinking, vision ni audio.
- Multilingue: no; solo ingles.
- No esta ajustado por instrucciones (base model).

## Casos de uso

- Investigacion sobre data ordering en preentrenamiento: comparar las curvas de perdida de validacion de las cuatro ejecuciones (`shuffle`, `ascending`, `descending`, `cooldown`) para medir si el orden de documentos afecta a la convergencia y al rendimiento final en HellaSwag, PIQA y ARC-Easy.
- Reproduccion de experimentos de curriculum learning: el modelo sirve como linea base controlada (misma semilla, mismo presupuesto, misma arquitectura) para validar hipotesis sobre data scheduling en modelos pequenos antes de escalar a modelos mayores.
- Estudio de sensibilidad a la calidad de datos: al evaluar la perdida por bucket de puntuacion educativa, permite analizar si entrenar primero con datos de baja puntuacion y terminar con los de alta mejora la perdida en los buckets superiores.
- Docencia y formacion: un GPT-2 de 45M es lo bastante pequeno para entrenarse y analizarse en un entorno academico, y este repositorio incluye checkpoints, metricas y configuracion para explicar el ciclo completo de preentrenamiento.
- Benchmarking de infraestructura de entrenamiento: el presupuesto fijo de 1.716 pasos y 899,7M tokens facilita comparar throughput y estabilidad numerica (bf16, clipping, AdamW) entre distintas configuraciones de hardware.
- Analisis de sesgos del clasificador educativo: los buckets de calidad provienen de un clasificador de FineWeb-Edu, por lo que el modelo permite estudiar como ese juicio se refleja en la distribucion de perdida del modelo entrenado.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card indica que se evalua cada 50 pasos con exactitud normalizada en HellaSwag, PIQA y ARC-Easy, y que las curvas estan en el dashboard de Trackio, pero no se incluyen los valores finales en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 45,2M de parametros, los pesos en fp32 ocupan aproximadamente 181 MB y en bf16 unos 90 MB; la VRAM real depende del framework y del tamano de lote.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una GPU integrada con suficiente memoria pueden ejecutar el modelo.
- Cabe en GPU consumer: si, con margen amplio, incluidas GPUs de gama baja con 4-8 GB de VRAM.
- Opciones de despliegue: el repositorio solo proporciona pesos PyTorch (`model.pt`) y codigo propio en el repositorio `GPT2-Fineweb-Edu-Experiments`; no se publican versiones GGUF, por lo que llama.cpp u Ollama requeririan conversion manual. vLLM y TGI no estan documentados para este modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| GPT-2 45M FineWeb-Edu Ordering | 45,2M | 1024 | MIT | Estudio de data ordering sobre FineWeb-Edu |
| GPT-2 small (OpenAI) | 124M | 1024 | MIT | Modelo base de referencia de GPT-2 |
| GPT-2 45M generico (misma arquitectura) | 45,2M | 1024 | variable | Linea base sin manipulacion del orden de datos |
| Modelos tipo TinyStories / GPT-2 nano | 1M-50M | variable | variable | Modelos pequenos para investigacion de preentrenamiento |

La comparativa se limita a familias de modelos pequenos de investigacion, ya que no existen alternativas publicas con el mismo diseno experimental (cuatro ejecuciones controladas por orden de documentos). No se dispone de datos de rendimiento comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Una sola semilla por ejecucion: las diferencias pequenas entre las cuatro variantes pueden ser ruido estadistico y no un efecto real del orden de datos.
- Los datos de validacion provienen del mismo flujo de FineWeb-Edu que los de entrenamiento, lo que puede inflar la percepcion de calidad del modelo.
- Los buckets de calidad dependen del juicio de un clasificador educativo externo, con los sesgos que ello implica.
- Es un modelo base de preentrenamiento, sin ajuste por instrucciones; no es adecuado para uso conversacional directo.
- Solo ingles; no hay soporte multilingue.
- Contexto limitado a 1024 tokens.
- El estado del repositorio es "training in progress": las ejecuciones se completan de forma secuencial y los ficheros aparecen a medida que terminan, por lo que la disponibilidad de cada variante puede ser parcial.
- Aunque la licencia es MIT y permite uso comercial, el modelo no tiene calidad suficiente para tareas de produccion reales; su valor es exclusivamente de investigacion.
- Riesgo de alucinacion alto y coherencia limitada por el reducido numero de parametros.

## Enlaces

- Hugging Face: https://huggingface.co/NoeFlandre/gpt2-fineweb-edu-ordering
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dashboard de entrenamiento (Trackio): https://huggingface.co/spaces/NoeFlandre/gpt2-fineweb-edu-ordering-trackio
- Codigo del modelo y experimentos: https://github.com/NoeFlandre/GPT2-Fineweb-Edu-Experiments
