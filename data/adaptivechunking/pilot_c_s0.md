# AdaptiveChunking/pilot_C_s0

## Resumen

`pilot_C_s0` es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución concreta (run) de un modelo byte-level basado en H-Net, extraída del repositorio empaquetado `AdaptiveChunking/hnet-chunking-pilots` y reorganizada en el formato por ejecución de Beetle. El modelo fue entrenado con el denominado "legacy trainer" (`legacy/tier1/train.py`) del proyecto beetle-hnet y cuenta con 22.516.992 parámetros según los pesos en safetensors.

El interés del modelo no reside en sus capacidades de propósito general, sino en su rol como artefacto de experimentación en torno a la tokenización y el *dynamic chunking* a nivel de byte. Los tags del repositorio (`dynamic-chunking`, `tokenization`, `hnet`, `byte-level`, `beetle-hnet`) apuntan a una línea de trabajo centrada en cómo segmentar la entrada a nivel de byte en lugar de depender de un vocabulario BPE predefinido.

Se publica con licencia Apache 2.0 y un tamaño de repositorio de 0,1 GB, lo que refleja un modelo pequeño pensado para reproducir experimentos y analizar fronteras de segmentación, no para despliegue en producción. La model card no documenta pipeline, idiomas ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (según tags y model card); detalles de capas y atención no disponibles |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y `config.json` |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un modelo H-Net con procesamiento a nivel de byte (*byte-level*), entrenado mediante el *legacy trainer* del repositorio beetle-hnet, concretamente con el script `legacy/tier1/train.py`. No se detallan el número de capas, la dimensión oculta, el mecanismo de atención ni la composición del dataset de entrenamiento. El número de parámetros (22,5 M) sitúa el modelo en la franja de los modelos pequeños, coherente con un prototipo de investigación.

El repositorio conserva una rama `step-N` con un único checkpoint retenido en el paso 6000, que incluye `model.safetensors` y `config.json` con la configuración del modelo, la configuración de entrenamiento y el mapa `tied_weights` (los pesos atados deben restaurarse aplicando `sd[dst] = sd[src]` para cada entrada). La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. El entrenador legacy no guardó estado del optimizador, por lo que no existe directorio `training_state/`. No se documenta el uso de RLHF, DPO ni de una fase de ajuste supervisado posterior.

La innovación declarada es el *dynamic chunking* aplicado sobre entrada byte-level: el modelo aprende a segmentar la secuencia en unidades variables en lugar de operar sobre tokens de un vocabulario fijo. Las sondas de frontera (*boundary probes*) sobre FLORES+ de esta ejecución se publican en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo la ruta `pilot_C_s0/`.

## Capacidades

- Modelo de investigación para experimentación en tokenización y segmentación dinámica a nivel de byte.
- Procesamiento byte-level: no depende de un vocabulario BPE externo predefinido.
- Entrenamiento con objetivo de *dynamic chunking* (segmentación adaptativa de la secuencia).
- Evaluación mediante sondas de frontera sobre FLORES+ (publicadas como dataset aparte).
- No se documentan capacidades de generación de texto de propósito general, razonamiento, código, matemáticas, visión ni audio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (los idiomas no se declaran en la model card).

## Casos de uso

- Investigación en tokenización byte-level: usar el checkpoint para analizar cómo el modelo agrupa bytes en unidades de segmentación y comparar con segmentadores BPE o unigram existentes.
- Reproducción de experimentos de dynamic chunking: cargar los pesos del paso 6000 y el `config.json` para replicar las condiciones de entrenamiento del *legacy trainer* y validar resultados frente a `log.jsonl`.
- Análisis de fronteras de segmentación sobre FLORES+: emplear las sondas del dataset `hnet-chunking-probes` para medir la precisión de las fronteras detectadas por el modelo en texto multilingüe.
- Estudio comparativo entre ejecuciones piloto: al estar organizado en el layout por run de Beetle, permite contrastar `pilot_C_s0` con otras ejecuciones del repositorio empaquetado `hnet-chunking-pilots` bajo las mismas condiciones.
- Base para ablaciones de arquitectura H-Net: el tamaño reducido (22,5 M de parámetros) permite entrenar y evaluar variantes en hardware modesto.
- Docencia y formación en procesamiento de lenguaje a nivel de byte: el modelo y su configuración sirven como ejemplo didáctico de pipeline de entrenamiento con segmentación adaptativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 M de parámetros, los pesos en fp32 ocupan aproximadamente 90 MB y en fp16 unos 45 MB; la VRAM efectiva dependerá de la longitud de secuencia y del mecanismo de chunking, no disponible.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente para cargar los pesos; no se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX con memoria suficiente para el modelo y las activaciones (orientativamente, 2 GB o más).
- Opciones de despliegue: al ser un modelo PyTorch con `model.safetensors` y `config.json` no estándar, la carga requiere código propio del proyecto beetle-hnet; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (H-Net byte-level con dynamic chunking) ni se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación publicada: no hay benchmarks, métricas de calidad ni validación en tareas downstream.
- No se declaran idiomas soportados ni cobertura multilingüe verificada.
- No se documenta la longitud de contexto, lo que impide planificar su uso en secuencias largas.
- El formato de pesos y configuración es específico del proyecto beetle-hnet; no es directamente compatible con pipelines estándar de transformers sin código de carga adaptado.
- Los pesos atados requieren aplicar el mapa `tied_weights` (`sd[dst] = sd[src]`) durante la restauración; obviarlo puede producir un modelo incorrecto.
- No hay estado del optimizador (`training_state/`), por lo que no es posible reanudar el entrenamiento desde el checkpoint tal cual.
- Riesgo de alucinación y sesgos: no evaluados ni documentados.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero al no existir evaluación de calidad no se recomienda su uso en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/pilot_C_s0
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas de frontera FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/models
- Código del proyecto beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
