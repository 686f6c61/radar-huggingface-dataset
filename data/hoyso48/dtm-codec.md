# hoyso48/DTM-Codec

## Resumen

DTM-Codec es un codec neuronal de voz de 125 millones de parámetros desarrollado por hoyso48, presentado en el artículo "DTM-Codec: Dynamic Token Masking for VFR Speech Coding with Efficient Boundary Selection" (arXiv:2606.29480). Su objetivo principal es la codificación de voz con tasa de fotogramas variable (VFR), una técnica que adapta el número de tokens por unidad de tiempo según la complejidad acústica de la señal, reduciendo la tasa media de bits sin degradar la calidad percibida.

A diferencia de sistemas recientes que emplean grandes corpus multilingües y modelos semánticos auxiliares, DTM-Codec se entrena únicamente con LibriSpeech-960, un conjunto de datos de habla inglesa de dominio público. Esta elección lo convierte en un modelo modesto en tamaño y datos, pero demuestra que es posible lograr un codec VFR eficiente con recursos limitados. El modelo introduce un mecanismo de enmascaramiento dinámico de tokens (DTM) que, junto con una selección eficiente de fronteras, aborda el problema de la sobrecarga de bits de posición que afectaba a trabajos VFR previos.

El repositorio de HuggingFace proporciona artefactos del checkpoint en formato safetensors, con cuatro revisiones correspondientes a tasas de token de 25, 40, 50 y 80 Hz. La revisión principal (main) replica la de 50 Hz. El código y las instrucciones de uso están disponibles en el repositorio de GitHub del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codec neuronal (arquitectura detallada no disponible en la informacion proporcionada) |
| Parametros totales | 125.474.060 (dato real de safetensors; el paper menciona 127M) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se proporcionan pesos safetensors) |
| Idiomas soportados | no disponible (entrenado con LibriSpeech, corpus de habla inglesa) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors, config.json, conversion.json) |

## Arquitectura y entrenamiento

La arquitectura interna de DTM-Codec no se detalla en la informacion disponible, pero se trata de un codec neuronal de voz con 125M de parametros. El entrenamiento se realizo exclusivamente con LibriSpeech-960, un corpus de audio de habla inglesa con aproximadamente 960 horas de lectura. El modelo incorpora un mecanismo de enmascaramiento dinamico de tokens (DTM) que permite generar secuencias de tokens de longitud variable, adaptando la tasa de fotogramas a la complejidad de la senal. Ademas, introduce una estrategia de seleccion eficiente de fronteras para minimizar la sobrecarga de bits asociada a la informacion de posicion, un problema comun en sistemas VFR.

No se menciona el uso de tecnicas como RLHF o DPO, ni la composicion exacta del dataset mas alla de LibriSpeech. Tampoco se especifican innovaciones adicionales como atencion lineal o decodificacion especulativa.

## Capacidades

- Codificacion y decodificacion de voz con tasa de fotogramas variable (VFR), permitiendo tasas de token de 25, 40, 50 y 80 Hz segun la revision.
- Tokenizacion de audio en representaciones discretas aptas para modelos de lenguaje o sistemas de sintesis.
- Compresion de voz con calidad reconstruida, disenada para aplicaciones de transmision y almacenamiento.
- Soporte de multiples tasas de token mediante revisiones separadas del checkpoint.
- No se reportan capacidades de generacion de texto, vision, tool calling ni agentes, al tratarse de un codec de audio.

## Casos de uso

- Compresion de voz para transmision en tiempo real: DTM-Codec puede integrarse en sistemas de VoIP o streaming de audio, donde la tasa de bits variable permite adaptar la calidad a las condiciones de red. Su bajo coste computacional (125M de parametros) lo hace adecuado para despliegue en servidores de media.
- Preprocesamiento para modelos de lenguaje de voz: los tokens generados por el codec pueden alimentar modelos de lenguaje de habla (speech LLM) para tareas como traduccion automatica de voz o generacion de respuestas habladas, aprovechando la representacion VFR.
- Almacenamiento eficiente de archivos de voz: en aplicaciones de archivado de llamadas o podcasts, la codificacion VFR reduce el espacio necesario manteniendo una calidad perceptiva aceptable, especialmente en segmentos de silencio o baja actividad.
- Sintesis de voz (TTS) con control de tasa: al decodificar tokens a diferentes frecuencias, se puede ajustar la duracion y el ritmo de la voz generada, util en asistentes virtuales o audiolibros.
- Investigacion en codecs neuronales: el modelo sirve como punto de partida para estudiar el impacto del enmascaramiento dinamico y la seleccion de fronteras en la eficiencia de codecs VFR, gracias a su licencia MIT y su entrenamiento reproducible con LibriSpeech.
- Evaluacion comparativa de codecs: al estar disponible en cuatro tasas de token, permite comparar el rendimiento de DTM-Codec frente a otros codecs fijos o variables en tareas de reconstruccion de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo arXiv (2606.29480) podria contener metricas como PESQ, STOI o tasa de bits, pero no se han extraido en la busqueda web. Por tanto, no se incluyen tablas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con 125M de parametros, en FP32 se requieren aproximadamente 500 MB de VRAM; en FP16, unos 250 MB. La cuantizacion a 8 bits reduciria el consumo a unos 125 MB, aunque no se proporcionan pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente para inferencia en FP16, incluyendo tarjetas consumer como GTX 1060, RTX 2060 o superiores. Para entrenamiento o fine-tuning, se recomienda una GPU con 8-12 GB de VRAM (RTX 3080, A100, etc.).
- Compatibilidad con consumer GPU: si, el modelo es ligero y cabe en GPUs de gama media.
- Opciones de despliegue: al ser un modelo safetensors, puede cargarse con librerias como PyTorch o HuggingFace Transformers. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros codecs neuronales (como EnCodec, SoundStream o Mimi) en la informacion proporcionada. El articulo menciona que DTM-Codec es mas pequeno y se entrena con menos datos que sistemas recientes, pero no se ofrecen cifras concretas de comparacion. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Entrenamiento limitado a LibriSpeech (habla inglesa leida): el modelo puede no generalizar bien a otros idiomas, dialectos o estilos de habla espontanea.
- Riesgo de alucinacion o artefactos en la reconstruccion: como todo codec neuronal, puede introducir distorsiones en senales fuera de la distribucion de entrenamiento (ruido, musica, multiples hablantes).
- Sin soporte de cuantizacion oficial: solo se proporcionan pesos en FP32/FP16 (safetensors), lo que puede limitar su uso en entornos con restricciones de memoria.
- Licencia MIT: permite uso comercial y modificacion, pero el usuario debe verificar que los datos de entrenamiento (LibriSpeech) cumplen con sus requisitos de licencia.
- No se especifican limites de contexto ni de duracion de audio: la informacion disponible no indica la longitud maxima de la senal que puede procesar el modelo.
- El repositorio tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es un proyecto reciente o poco difundido; se recomienda validar su funcionamiento antes de usarlo en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/hoyso48/DTM-Codec
- Articulo arXiv (HTML): https://arxiv.org/html/2606.29480v1
- Articulo arXiv (PDF): https://arxiv.org/pdf/2606.29480
- Repositorio GitHub: https://github.com/hoyso48/DTM-Codec
- Perfil de GitHub del autor: https://github.com/hoyso48/
