# jiaqili3/dualcodec12hz_v1.5_sensevoice

## Resumen

DualCodec 12Hz v1.5 (SenseVoice) es un codec neuronal de audio de baja frecuencia de frames, desarrollado por jiaqili3 y publicado como parte del proyecto DualCodec, presentado en Interspeech 2025. El checkpoint concreto, `dualcodec12hz_v1.5_sensevoice`, está disponible en HuggingFace y pertenece a la familia de modelos DualCodec, cuyo objetivo es comprimir señales de voz manteniendo la información semántica mediante una combinación de cuantización residual (RVQ) y un cuantizador semántico. La arquitectura está alineada con el planteamiento del paper "A Low-Frame-Rate, Semantically-Enhanced Neural Audio Codec".

Este modelo opera a una frecuencia de frames de 12.5 Hz, lo que lo hace apto para tareas de compresión de voz con muy baja tasa de bits. Utiliza hasta 8 cuantizadores RVQ, donde el primero es un cuantizador semántico con un codebook de 16384 entradas y los restantes son acústicos con codebooks de 4096. Como teacher semántico emplea FunASR SenseVoiceSmall (no usa w2v-bert), una elección que busca mejorar la retención de información lingüística y paralingüística en la representación comprimida. El repositorio ocupa 0.3 GB y los pesos se distribuyen en formato safetensors, con licencia MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codec neuronal basado en cuantización residual (RVQ) con cuantizador semántico |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | RVQ de 1 a 8 cuantizadores; RVQ-1 codebook semántico de 16384, resto acústico de 4096 |
| Idiomas soportados | no disponible (depende del teacher SenseVoiceSmall, cobertura no especificada) |
| Licencia | MIT |
| Formato de pesos | safetensors (`dualcodec_12hz_v1.5_sensevoice.safetensors`) |
| Frecuencia de frames | 12.5 Hz |
| Teacher semántico | FunASR SenseVoiceSmall (sin w2v-bert) |
| Tamaño del repositorio | 0.3 GB |

## Arquitectura y entrenamiento

La arquitectura de este checkpoint sigue el diseño del codec DualCodec, que se compone de un codificador, una etapa de cuantización residual y un decodificador. La segmentación en múltiples cuantizadores permite un control de tasa de bits: el primer cuantizador es semántico y captura contenido lingüístico, mientras que los cuantizadores restantes añaden información acústica. En esta variante, el cuantizador semántico está guiado por el modelo FunASR SenseVoiceSmall, en lugar de un modelo w2v-bert-2 como en otras versiones, lo que supone una innovación técnica relevante para mejorar la eficiencia y la calidad semántica en la compresión.

El entrenamiento se orienta a minimizar el error de reconstrucción y a preservar las características semánticas mediante la alineación con el teacher. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO, que en cualquier caso no son aplicables a un codec de audio. El modelo se integra en la librería `dualcodec` y se carga automáticamente mediante `dualcodec.get_model("12hz_v1.5_sensevoice")`, tal y como se documenta en el repositorio oficial.

## Capacidades

- Compresión de audio con una frecuencia de frames de 12.5 Hz, lo que se traduce en una representación muy compacta de la voz.
- Cuantización residual flexible de 1 a 8 cuantizadores, que permite ajustar el bitrate y la calidad de reconstrucción según el caso de uso.
- Cuantizador semántico dedicado con codebook de 16384, orientado a preservar la información lingüística y paralingüística en la señal comprimida.
- Utiliza FunASR SenseVoiceSmall como teacher semántico, sin depender de w2v-bert-2.
- Carga y ejecución sencillas mediante la librería `dualcodec` en Python, con soporte para `device="cuda"`.
- Está pensado para tareas de codificación y decodificación de audio dentro del ecosistema DualCodec, no como modelo de lenguaje; no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Compresión de voz para streaming en tiempo real: la baja frecuencia de frames (12.5 Hz) reduce el número de tokens generados por segundo, lo que facilita la transmisión de audio en entornos con ancho de banda limitado.
- Almacenamiento eficiente de largas grabaciones de voz: la cuantización RVQ permite elegir entre 1 y 8 cuantizadores, de modo que se puede seleccionar un bitrate más alto para archivos críticos o uno más bajo para archivado de bajo coste.
- Tokenización de audio para modelos de lenguaje de voz: el cuantizador semántico produce una secuencia de tokens con significado lingüístico, apta como entrada para modelos generativos de audio o sistemas de texto a voz.
- Preprocesamiento para sistemas de reconocimiento de voz (ASR): al estar alineado con SenseVoiceSmall, la representación comprimida conserva las características fonéticas necesarias para tareas de transcripción aguas abajo.
- Investigación en codecs neuronales de baja tasa de frames: sirve como implementación de referencia con código abierto y pesos publicados en HuggingFace, útil para comparar arquitecturas y técnicas de cuantización.
- Aplicaciones de interfaz voz a voz en tiempo real: por su naturaleza ligera y su tamaño reducido (0.3 GB), puede desplegarse en máquinas con recursos limitados para realizar codificación/decodificación en pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 0.3 GB, lo que sugiere un modelo ligero, pero no se indican requisitos oficiales de memoria.
- GPU recomendadas: no se especifican. La documentación de la librería muestra el uso de `device="cuda"`, por lo que una GPU NVIDIA con soporte CUDA es suficiente.
- ¿Cabe en consumer GPU?: probablemente sí, dado el tamaño del repositorio, aunque no hay confirmación oficial.
- Opciones de despliegue: se ejecuta mediante Python con la librería `dualcodec` y PyTorch. No es compatible con motores de inferencia para modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI, puesto que no es un LLM.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se incluyen modelos comparables con especificaciones detalladas. El repositorio del proyecto menciona otras variantes como `12hz_v1` y `25hz_v1`, pero no se aportan datos suficientes para una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos: no se han evaluado sesgos en este modelo ni en el teacher SenseVoiceSmall.
- Riesgo de alucinación: no aplica, al no tratarse de un modelo generativo de texto; sin embargo, la reconstrucción del audio puede introducir artefactos o pérdidas no perceptibles en la señal original.
- Limitaciones de idioma: la cobertura lingüística depende del teacher SenseVoiceSmall, pero no se especifica en la información disponible.
- Restricciones de licencia para uso comercial: la licencia MIT del modelo permite uso comercial, aunque es necesario verificar las dependencias del ecosistema (FunASR, librería `dualcodec`) y su licenciamiento.
- Falta de documentación sobre el proceso de entrenamiento y los datos utilizados, lo que dificulta la evaluación de su comportamiento en dominios específicos.
- El repositorio solo contiene el checkpoint; no se incluyen scripts de inferencia ni ejemplos completos en la model card, aunque el proyecto principal en GitHub sí los ofrece.

## Enlaces

- HuggingFace: https://huggingface.co/jiaqili3/dualcodec12hz_v1.5_sensevoice
- Repositorio GitHub: https://github.com/jiaqili3/DualCodec
- Releases del repositorio: https://github.com/jiaqili3/DualCodec/releases
- Paper (Interspeech 2025): "DualCodec: A Low-Frame-Rate, Semantically-Enhanced Neural Audio Codec" (mencionado en el repositorio, sin URL directa disponible en la información analizada).
