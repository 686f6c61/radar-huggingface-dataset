# AdaptiveChunking/pilot_E_s0

## Resumen

pilot_E_s0 es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de un modelo de lenguaje a nivel de byte (byte-level) basado en la arquitectura H-Net, entrenado con la herramienta `beetle-hnet` y el denominado "legacy trainer" (`legacy/tier1/train.py`). El modelo forma parte de un conjunto de ejecuciones experimentales ("pilots") orientadas al estudio de técnicas de chunking dinámico y tokenización, y fue separado del repositorio empaquetado `AdaptiveChunking/hnet-chunking-pilots` en el formato por ejecución de Beetle.

Con 22.516.992 parámetros totales y un tamaño de repositorio de 0,1 GB, se trata de un modelo pequeño, claramente orientado a experimentación e investigación más que a producción. El checkpoint retenido corresponde al paso 6000, y el entrenamiento no conservó estado del optimizador (`training_state/`), lo que limita su reutilización para continuar el entrenamiento desde ese punto.

Su relevancia es acotada: no hay pipeline declarado, no se especifican idiomas soportados ni se han publicado resultados de benchmarks. Su interés radica en el enfoque de tokenización a nivel de byte y el chunking dinámico, así como en las sondas de frontera FLORES+ asociadas en el dataset `AdaptiveChunking/hnet-chunking-probes`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (byte-level), segun tags del repositorio |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net en su variante byte-level, implementada en el repositorio `beetle-hnet` (https://github.com/suchirsalhan/beetle-hnet). El entrenamiento se realizó con el "legacy trainer" del propio repositorio (`legacy/tier1/train.py`). El repositorio incluye una rama `step-N` con un único checkpoint retenido (paso 6000), que contiene `model.safetensors` y `config.json` con la configuración del modelo, la configuración de entrenamiento y un mapa `tied_weights` que debe restaurarse aplicando `sd[dst] = sd[src]` para cada entrada. La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El entrenador legacy no conservó estado del optimizador, por lo que no existe `training_state/` en el repositorio. Las sondas de frontera FLORES+ asociadas a esta ejecución están disponibles en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo el prefijo `pilot_E_s0/`, lo que sugiere que el trabajo se orienta a evaluar el comportamiento en fronteras de segmentación multilingüe.

## Capacidades

- No se documentan capacidades funcionales específicas en la información disponible.
- Al ser un modelo byte-level, opera sobre bytes en lugar de tokens subword, lo que en principio permite cubrir cualquier idioma y secuencia de bytes sin vocabulario fijo; no obstante, no se confirma ninguna capacidad multilingüe concreta.
- No se indica soporte de tool calling, function calling ni comportamiento agéntico.
- No se indica modo de razonamiento (thinking), visión ni audio.
- El propósito declarado es la investigación en chunking dinámico y tokenización; las sondas FLORES+ asociadas apuntan a evaluación de fronteras de segmentación.

## Casos de uso

- Investigación en tokenización byte-level: el modelo sirve como banco de pruebas para estudiar cómo afecta el procesamiento a nivel de byte a la segmentación y a la calidad de representación, comparándolo con tokenizadores subword convencionales.
- Estudio de chunking dinámico: permite reproducir y analizar las estrategias de chunking implementadas en `beetle-hnet`, dado que el repositorio conserva la configuración de entrenamiento y el checkpoint del paso 6000.
- Evaluación de fronteras multilingües: las sondas FLORES+ del dataset `hnet-chunking-probes` permiten medir el comportamiento del modelo en fronteras de segmentación en distintos idiomas, un caso de uso directamente alineado con los artefactos publicados.
- Reproducción de experimentos: al estar separado en el formato por ejecución de Beetle y conservar `final.json` y `log.jsonl`, facilita la replicación de la curva de entrenamiento y la comparación con otras ejecuciones del conjunto de pilots.
- Docencia y divulgación: su tamaño reducido (22,5 M de parámetros, 0,1 GB) permite desplegarlo en entornos de laboratorio y portátiles para ilustrar arquitecturas H-Net y entrenamiento byte-level.
- Base para experimentos de continuación: aunque no hay estado del optimizador, los pesos del paso 6000 pueden usarse como inicialización para nuevos experimentos de ajuste en investigación, siempre que se respete la licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 M de parámetros, los pesos en fp32 ocupan aproximadamente 90 MB; en fp16, unos 45 MB. La VRAM real dependerá de la longitud de contexto y del tamaño de lote, datos no disponibles.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por capacidad de memoria; no se dispone de datos de rendimiento específicos.
- Cabe en GPU consumer: sí, con amplio margen (por ejemplo, GTX 1060, RTX 3060, RTX 4090), aunque no se ha verificado la compatibilidad del código de inferencia con cada una.
- Opciones de despliegue: los pesos están en safetensors y la librería declarada es PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; sería necesario implementar la arquitectura H-Net desde `beetle-hnet` para cargar los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia de categoría, se trata de un modelo de investigación byte-level de ~22,5 M de parámetros; no se han encontrado alternativas documentadas con las que comparar parámetros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones de calidad; se desconoce su rendimiento real en tareas de generación o comprensión.
- No se especifican idiomas soportados ni longitud de contexto, lo que impide garantizar su comportamiento en producción.
- No hay pipeline declarado en Hugging Face, lo que sugiere que no está listo para uso directo con las herramientas estándar de inferencia.
- El entrenador legacy no conservó estado del optimizador, por lo que no es posible reanudar el entrenamiento desde el checkpoint sin reiniciar el estado.
- Riesgo de alucinación y sesgos: no evaluados ni documentados; al ser un modelo pequeño y experimental, cabe esperar un comportamiento limitado e impredecible.
- La licencia Apache 2.0 permite uso comercial, pero la falta de evaluación y documentación desaconseja su uso en entornos productivos.
- El modelo parece orientado exclusivamente a investigación en tokenización y chunking; no debe tratarse como un modelo de propósito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/pilot_E_s0
- Repositorio de pesos empaquetados: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio de código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/models
