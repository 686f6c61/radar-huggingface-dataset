# hkblockchaintechnology/VLM-all-inclusive

## Resumen

VLM-all-inclusive, también denominado OmniVLM, es un modelo multimodal de investigación desarrollado por hkblockchaintechnology que integra en un único tronco (trunk) capacidades de visión-lenguaje, reconocimiento de voz, síntesis de voz y generación de vídeo con sincronización labial. A diferencia de los pipelines habituales, que encadenan modelos preentrenados independientes (un backbone visual, un vocoder, un alineador forzado), este modelo se entrena desde cero de extremo a extremo sobre una única GPU, compartiendo un mismo espacio de tokens y un mismo transformer causal para todas las modalidades.

La arquitectura combina un ViT de 10 capas con parches de 8 píxeles sobre escenas de 128 píxeles, un transformer causal de 16 capas con d_model=1024 y RoPE, y cabezas específicas para texto (vocabulario de 8011 palabras), fonemas (conjunto ARPAbet de 39 símbolos), duraciones, mel-espectrograma y waveform. El modelo también "escucha": incorpora un reconocedor de fonemas CTC sobre log-mel entrenado con LJSpeech.

Es relevante ahora como artefacto de investigación reproducible: demuestra que un único tronco puede servir simultáneamente a tareas de visión-lenguaje y de habla mediante entrenamiento multi-tarea, y publica su estado de entrenamiento exacto (pasos, pérdidas) junto con el código para reproducirlo. No obstante, su corpus visual es sintético (formas geométricas renderizadas) y el habla es de un único hablante, por lo que su utilidad práctica en producción es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal multimodal (ViT + transformer causal con cross-attention + cabezas de habla y vocoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (fonemas ARPAbet, orientado a inglés por el uso de CMUdict y LJSpeech) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 1.5 GB; no se especifica safetensors, GGUF ni otro) |

## Arquitectura y entrenamiento

El modelo se organiza en seis componentes entrenados desde cero: "ojos" (ViT con parche 8, escenas de 128 px, 10 capas), "cerebro" (transformer causal de 16 capas, d_model=1024, RoPE, cross-attention hacia los tokens visuales), "texto" (cabeza sobre 8011 palabras), "oído" (reconocedor CTC de fonemas conv+attention sobre log-mel), "voz" (cabezas de fonema y duración más decodificador mel estilo FastSpeech sobre el mismo tronco) y "sonido" (vocoder mel→waveform estilo Vocos con bloques ConvNeXt y cabeza ISTFT, entrenado con pérdida STFT multi-resolución). La sincronización labial es un renderizador analítico que convierte ARPAbet en visemas y parámetros de boca/mandíbula/cejas, rasteriza fotogramas y compone el vídeo con ffmpeg (h264+aac).

Los datos de visión-lenguaje son escenas renderizadas proceduralmente en GPU (formas, colores, tamaños, posiciones 3x3) con pares pregunta-respuesta sobre conteo, color, forma, localización, tamaño, captioning, comparativas y relaciones espaciales. El habla proviene de LJSpeech-1.1 (24 h, dominio público, un solo hablante), fonemizada con CMUdict, con alineamientos generados por el propio oído CTC del modelo. El vocabulario compartido de 8011 palabras más los 39 símbolos ARPAbet es lo que permite que un único tronco sirva a todas las modalidades. No se menciona RLHF ni DPO; el entrenamiento es puramente supervisado y multi-tarea.

El estado de entrenamiento reportado en la model card es parcial: VLM en paso 251 (loss 0.1577), oído en paso 503, vocoder en paso 2251, mientras que las etapas de alineamiento y habla aún no se han ejecutado. El sistema de reanudación guarda checkpoints de modelo, optimizador y paso en un repositorio separado, con batches deterministas en función del contador de pasos.

## Capacidades

- Generación de texto condicionada por imagen sobre escenas sintéticas: conteo, color, forma, tamaño, localización, captioning y relaciones espaciales (izquierda/arriba/abajo).
- Preguntas de sí/no y comparativas sobre atributos de objetos.
- Reconocimiento de voz (fonemas) mediante CTC sobre log-mel.
- Síntesis de voz: fonemas, duraciones y mel-espectrograma generados desde el mismo tronco, convertidos a waveform por el vocoder.
- Generación de vídeo de cabeza parlante con sincronización labial analítica a partir de la línea temporal de fonemas del propio modelo.
- Pipeline de extremo a extremo: imagen + pregunta → texto → voz → vídeo mp4 (~2,5 s en una RTX PRO 6000 Blackwell).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el diseño está ligado a ARPAbet, CMUdict y LJSpeech (inglés).

## Casos de uso

- Investigación en arquitecturas omni-modales: sirve como banco de pruebas reproducible para estudiar si un único tronco puede mantener simultáneamente visión-lenguaje y habla sin bifurcarse en copias por tarea, gracias al entrenamiento multi-tarea y al vocabulario compartido.
- Docencia y experimentación con pipelines de voz: permite recorrer de forma transparente el flujo fonema → duración → mel → waveform sin depender de vocoders o alineadores externos, útil para entender cada etapa por separado.
- Prototipado de asistentes visuales sobre dominios controlados: en entornos donde las imágenes son diagramas o formas geométricas (por ejemplo, verificación de layouts sintéticos), el modelo puede responder preguntas de conteo y posición sin necesidad de un VLM de gran escala.
- Generación de avatares parlantes de bajo coste: el renderizador analítico de labios produce vídeo mp4 sincronizado a partir de la línea temporal de fonemas, adecuado para demos internas o pruebas de concepto de sincronización.
- Evaluación comparativa de estrategias de entrenamiento desde cero: el sistema de checkpoints deterministas por paso y la publicación del estado exacto de entrenamiento permiten reproducir curvas de aprendizaje y comparar configuraciones.
- Base para sustituir el corpus sintético por datos reales: el código está estructurado para reemplazar `omni/scenes.py` por un corpus real de captioning/VQA, lo que lo convierte en un punto de partida para investigación sobre entrenamiento conjunto visión-habla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de entrenamiento (pérdida 0.1577 en el paso 251 de la etapa VLM) y un tiempo de extremo a extremo de aproximadamente 2,5 s para generar un mp4 en una RTX PRO 6000 Blackwell de 100 GB, sin cifras de precisión, inteligibilidad ni calidad de vídeo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo ocupa 1,5 GB, pero no se especifica el tamaño de los pesos ni el consumo en inferencia.
- GPU de entrenamiento documentada: NVIDIA RTX PRO 6000 Blackwell con 100 GB, una sola GPU para todo el pipeline de extremo a extremo.
- GPU recomendadas: no disponibles más allá de la empleada en el entrenamiento; no hay datos sobre A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? No disponible. El tamaño del modelo no se publica, por lo que no puede confirmarse su viabilidad en tarjetas de consumo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; la librería declarada es `omni` y la reproducción se hace con `python -m omni.train --stage ...`.
- Latencia y throughput: ~2,5 s de extremo a extremo (imagen + pregunta → mp4 con audio y labios sincronizados) en la RTX PRO 6000 Blackwell; no hay datos de throughput por lotes ni de latencia desglosada por etapa.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (omni-modelos con visión, habla y vídeo en un único tronco entrenado desde cero), ni datos de rendimiento que permitan establecer una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- El corpus de visión-lenguaje es sintético: el grounding es real, pero el "mundo" son formas geométricas renderizadas, no imágenes naturales. La generalización a fotografías reales es nula sin sustituir el corpus.
- El habla es de un único hablante (LJSpeech); la inteligibilidad depende del número de pasos de entrenamiento, y las etapas de alineamiento y habla aún no se han ejecutado en el estado publicado.
- La sincronización labial es un renderizador analítico, no un generador fotorrealista de cabezas parlantes; la calidad visual está acotada por el rasterizado de parámetros.
- Sin ajuste de seguridad, sin RLHF y sin moderación: es un artefacto de investigación, no un modelo listo para producción.
- Idiomas: no disponible; el diseño está atado a ARPAbet, CMUdict y LJSpeech, lo que limita su uso fuera del inglés.
- Riesgo de alucinación: no evaluado; al ser un modelo de vocabulario cerrado de 8011 palabras entrenado sobre datos sintéticos, las respuestas fuera del dominio de entrenamiento no están caracterizadas.
- Licencia Apache 2.0: permite uso comercial, pero el estado incompleto del entrenamiento y la ausencia de evaluación hacen desaconsejable cualquier despliegue en producción.
- Contexto: no se documenta la longitud de contexto, lo que impide planificar conversaciones multi-turno largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hkblockchaintechnology/VLM-all-inclusive
- Repositorio de checkpoints: https://huggingface.co/hkblockchaintechnology/omni-vlm-ckpt
- Dataset de habla LJSpeech-1.1: https://keithito.com/LJ-Speech-Dataset/
- CMUdict (CMU Pronouncing Dictionary): http://www.speech.cs.cmu.edu/cgi-bin/cmudict
- Vocos (referencia del vocoder): https://github.com/charactr-platform/vocos
- FastSpeech (referencia del decodificador mel): https://github.com/microsoft/DeepSpeed
- ffmpeg: https://ffmpeg.org/
