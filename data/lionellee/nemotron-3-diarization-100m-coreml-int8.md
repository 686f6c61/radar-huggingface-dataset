# lionellee/Nemotron-3-Diarization-100M-CoreML-INT8

## Resumen

Nemotron-3-Diarization-100M-CoreML-INT8 es una exportación compilada a CoreML del modelo de diarización de hablantes Nemotron 3 Diarization de NVIDIA, realizada por el usuario lionellee. El modelo original, de 99,2 millones de parámetros, realiza segmentación de hablantes (speaker diarization) emitiendo probabilidades de actividad a nivel de trama para hasta ocho hablantes simultáneos. No transcribe voz ni identifica personas por nombre: solo determina quién habla y cuándo.

La relevancia de esta variante radica en su empaquetado para Apple Silicon. Los pesos lineales se cuantizan a INT8 con bloques de 32, mientras que las convoluciones y activaciones permanecen en FP16, dando un total de aproximadamente 103 MiB distribuidos en dos grafos `.mlmodelc`. Esto permite ejecutar diarización en streaming sobre dispositivos con iOS 18 o superior, sin depender de infraestructura en la nube.

El modelo procesa audio mono a 16 kHz con 128 bandas mel, en fragmentos de 30,4 segundos con tramas de salida cada 10 ms. Su caso de uso principal es la diarización en tiempo real dentro de aplicaciones nativas de Apple, aunque requiere reproducir fielmente el algoritmo de caché de hablantes del modelo fuente para mantener la coherencia de etiquetas entre fragmentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pre-encoder mel y cabeza de actividad de hablantes (exportado a CoreML) |
| Parametros totales | 99,2 millones (modelo fuente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30,4 segundos de features mel por fragmento (3040 tramas de 10 ms) |
| Tipos de cuantizacion | INT8 block-32 en pesos lineales; FP16 en convoluciones y activaciones |
| Idiomas soportados | Multilingue |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | `.mlmodelc` compilado (CoreML); sin `.mlpackage` |

## Arquitectura y entrenamiento

El modelo fuente es un sistema de diarización con dos etapas: un pre-encoder que proyecta las features mel de 128 bandas y una cabeza transformer que emite probabilidades de actividad por hablante a resolución de 10 ms. La exportación divide esta arquitectura en dos grafos CoreML: `Nemotron3PreEncoder.mlmodelc` (unos 0,6 MiB) para la proyección mel y `Nemotron3Head.mlmodelc` (unos 102 MiB) para el transformer y la cabeza de actividad. Se incluye además un embedding de silencio (`learnable_silence.f32`, 2 KiB) usado por la caché de hablantes.

El modelo mantiene una caché de hablantes en orden de llegada con actualización FIFO, lo que permite asignar etiquetas consistentes a lo largo de fragmentos sucesivos. En la exportación, el estado se empaqueta en tensores de forma `[1, 684, 512]` con longitud variable. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

La innovación principal de esta variante es la cuantización INT8 con bloques de 32 aplicada solo a los pesos lineales, preservando FP16 en convoluciones y activaciones para minimizar la degradación numérica. Según el autor, la diferencia media absoluta de probabilidad frente al checkpoint sin cuantizar es de 0,00046 a 0,00082, y la discrepancia en decisiones de actividad al umbral 0,25 afecta solo al 0,03–0,06 % de pares trama/canal.

## Capacidades

- Diarización de hablantes en streaming con hasta ocho hablantes simultáneos.
- Detección de actividad de voz (voice activity detection) a nivel de trama de 10 ms.
- Salida de probabilidades de actividad por hablante, binarizables con umbrales de onset y offset de 0,5.
- Gestión de caché de hablantes con actualización FIFO para mantener etiquetas entre fragmentos.
- Funcionamiento multilingüe.
- No transcribe voz ni identifica personas por nombre.
- No soporta tool calling ni function calling.
- No implementa razonamiento multi-paso ni modo de pensamiento.
- No procesa visión ni audio más allá de las features mel de entrada.

## Casos de uso

- Diarización en tiempo real en apps de iOS: integración del modelo en una aplicación nativa que captura audio del micrófono, extrae features mel de 128 bandas y ejecuta los dos grafos CoreML para etiquetar hablantes en fragmentos de 30,4 segundos, aprovechando la latencia de unos 101,6 ms por fragmento en CPU.
- Transcripción de reuniones con separación de interlocutores: el modelo actúa como etapa previa a un ASR, asignando segmentos a hablantes para producir actas con etiquetas de quién dijo qué, sin necesidad de enviar audio a la nube.
- Análisis de llamadas de atención al cliente: procesamiento local de grabaciones para medir tiempos de habla por agente y cliente, útil en entornos con requisitos de privacidad que impiden el envío de audio a servidores externos.
- Subtitulado y postproducción de pódcast: segmentación automática de episodios con múltiples invitados para facilitar la edición por pistas de hablante y la generación de subtítulos diferenciados.
- Investigación en ciencias del lenguaje: extracción de estadísticas de turnos de palabra y solapamiento en corpus multilingües, con la ventaja de ejecutarse íntegramente en un portátil Apple Silicon.
- Sistemas de accesibilidad: identificación de cambios de hablante en tiempo real para aplicaciones de transcripción asistida que resaltan visualmente al interlocutor activo.
- Moderación de reuniones y análisis de participación: cálculo de cuotas de habla por participante en entornos corporativos, con despliegue local que evita exponer conversaciones confidenciales.

## Benchmarks y rendimiento

El autor reporta medidas de paridad numérica y latencia, no de tasa de error de diarización (DER) del modelo aislado. La comparación es contra el checkpoint final sin cuantizar.

| Medida | CoreML INT8 | Interpretacion |
|---|---:|---|
| Tiempo mediano de etapa de modelo | 101,6 ms | Unos 300× más rápido que la duración del fragmento en CPU |
| Diferencia media absoluta de probabilidad | 0,00046–0,00082 | Cercana al checkpoint fuente |
| Discrepancia de decisión de actividad al umbral 0,25 | 0,03–0,06 % de pares trama/canal | La cuantización cambia pocas decisiones |

El runtime anfitrión `speech-swift` obtuvo un DER agrupado del 11,20 % sobre 132 grabaciones internas de benchmark (12,82 horas) en ocho idiomas, con collar de 0,25 segundos, solapamiento incluido y recuento automático de hablantes. Esta cifra mide el pipeline completo de audio a segmento en Swift, no el ejemplo de primer fragmento. Las mediciones de latencia se tomaron en un Apple M5 Pro con macOS 26.6.2, con ejecuciones en CPU únicamente y excluyendo extracción mel, carga de archivos, actualizaciones de caché y postprocesado.

No se han publicado resultados de benchmarks estándar (como DER sobre AMI, DIHARD o VoxConverse) en la información disponible para esta variante cuantizada.

## Requisitos de hardware

- VRAM/tamaño en disco: aproximadamente 103 MiB en total (0,6 MiB del pre-encoder más 102 MiB de la cabeza).
- Memoria en ejecución: no especificada; el tamaño reducido sugiere un consumo moderado, pero no se dispone de cifras exactas.
- GPU recomendadas: no aplica en el sentido tradicional; está diseñado para Apple Silicon (CPU y Neural Engine). El autor midió en un Apple M5 Pro.
- Cabe en hardware de consumo: sí, en dispositivos Apple con iOS 18 o superior y en Macs con Apple Silicon.
- Opciones de despliegue: CoreML mediante `coremltools` en macOS; runtime `speech-swift` para integración nativa en Apple; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia: 101,6 ms medianos por fragmento de 30,4 segundos en CPU (Apple M5 Pro), excluyendo preprocesado y postprocesado.
- Throughput: no disponible de forma explícita; la relación de 300× respecto a la duración del audio en CPU permite inferir procesamiento en tiempo real holgado en dicho hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / fragmento | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| lionellee/Nemotron-3-Diarization-100M-CoreML-INT8 | 99,2 M | 30,4 s por fragmento | CoreML `.mlmodelc` | OpenMDW 1.1 | Cuantizado INT8, orientado a Apple Silicon |
| nvidia/Nemotron-3-Diarization | 99,2 M | 30,4 s por fragmento | Pesos NeMo (no especificado en detalle) | OpenMDW 1.1 | Modelo fuente sin cuantizar |
| pyannote/speaker-diarization (referencia de categoria) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo no transcribe voz ni identifica personas; solo etiqueta actividad de hablantes. No debe usarse para reconocimiento biométrico.
- La coherencia de etiquetas entre fragmentos depende de reproducir exactamente el algoritmo de caché de hablantes y actualización FIFO del modelo fuente; otros hosts que no lo implementen pueden perder la asignación de etiquetas.
- El umbral `pred_score_threshold: 0.25` de `config.json` sirve para seleccionar tramas de la caché de hablantes, no como umbral de actividad de segmento; confundirlos produce segmentaciones incorrectas.
- El DER del 11,20 % corresponde al pipeline `speech-swift` sobre un conjunto interno de 132 grabaciones, no a benchmarks públicos; la generalización a otros dominios y condiciones acústicas no está verificada.
- Las medidas de latencia se obtuvieron solo en CPU de un Apple M5 Pro; el rendimiento en otros dispositivos Apple Silicon o en Neural Engine no está documentado.
- La cuantización INT8 introduce pequeñas diferencias numéricas (0,00046–0,00082 de diferencia media absoluta), aceptables según el autor pero no evaluadas con métricas de diarización estándar.
- Licencia OpenMDW 1.1: deben revisarse los términos del archivo `LICENSE` para uso comercial y redistribución; el autor incluye `NOTICE` con atribución a NVIDIA.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos o negativos en la detección de actividad, especialmente con solapamiento de hablantes o ruido de fondo.
- Solo se soportan hasta ocho hablantes simultáneos; escenarios con más interlocutores requieren otra aproximación.
- Requiere iOS 18 o superior como objetivo mínimo de despliegue.

## Enlaces

- [Hugging Face: lionellee/Nemotron-3-Diarization-100M-CoreML-INT8](https://huggingface.co/lionellee/Nemotron-3-Diarization-100M-CoreML-INT8)
- [Modelo fuente: nvidia/Nemotron-3-Diarization](https://huggingface.co/nvidia/Nemotron-3-Diarization)
- [Blog de NVIDIA sobre Nemotron Diarization](https://huggingface.co/blog/nvidia/nemotron-diarization)
- [speech-swift (SDK para Apple)](https://github.com/soniqo/speech-swift)
- [Documentación de soniqo](https://soniqo.audio/getting-started)
- [Sitio web de soniqo](https://soniqo.audio)
- [Blog de soniqo](https://soniqo.audio/blog)
