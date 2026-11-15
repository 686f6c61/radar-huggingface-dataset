# Ahm20/yousuf-quran-asr

## Resumen

Yousuf-quran-asr es una conversión al formato ggml (float16) del modelo `tarteel-ai/whisper-base-ar-quran`, un Whisper base ajustado para el reconocimiento automático de recitación del Corán en árabe. Lo publica el usuario Ahm20 en Hugging Face y su propósito es servir como motor de inferencia en dispositivo (on-device) para la aplicación islámica gratuita «يوسف», que verifica la recitación coránica en modo de memorización (hifz) sin enviar el audio fuera del teléfono.

El modelo no introduce fine-tuning ni modificación de pesos: es una conversión directa del checkpoint PyTorch original de Tarteel AI al formato binario que consume whisper.cpp, lo que permite ejecutarlo en CPU y en dispositivos móviles con requisitos de memoria muy bajos. Al derivar de Whisper base, hereda su arquitectura transformer encoder-decoder con aproximadamente 74 millones de parámetros y una ventana de contexto de audio de 30 segundos.

Su relevancia es acotada pero clara: cubre un nicho concreto (ASR especializado en recitación coránica en árabe) y ofrece una vía de despliegue ligera y privada, con licencia Apache 2.0, para aplicaciones educativas o religiosas que necesiten funcionar sin conectividad ni servidores externos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) |
| Parámetros totales | Aproximadamente 74 millones (Whisper base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos (estándar de Whisper) |
| Tipos de cuantización | float16 (único formato publicado, ggml f16) |
| Idiomas soportados | Árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | ggml (`ggml-tarteel-base-quran.bin`, 147.951.465 bytes) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OpenAI Whisper en su variante base: un transformer encoder-decoder con atención completa, diseñado para transcripción de audio en fragmentos de 30 segundos. El modelo original de Tarteel AI fue ajustado sobre `whisper-base` para el dominio específico de la recitación coránica en árabe, aunque la información disponible no detalla el volumen ni la composición del dataset de ajuste, ni si se emplearon técnicas de RLHF o DPO.

La contribución de esta ficha es exclusivamente de formato: la conversión a ggml en float16 realizada por Ahm20 no modifica los pesos ni aplica entrenamiento adicional, y está pensada para su uso con whisper.cpp. No se documentan innovaciones técnicas propias (decodificación especulativa, atención lineal u otras) más allá de las inherentes a Whisper y a la optimización de inferencia que aporta whisper.cpp en CPU.

## Capacidades

- Reconocimiento automático de voz (ASR) especializado en recitación del Corán en árabe.
- Transcripción de audio en fragmentos de hasta 30 segundos por pasada.
- Ejecución on-device en CPU mediante whisper.cpp, sin dependencia de GPU ni de servicios en la nube.
- Verificación de recitación en modo memorización (hifz), que es el caso de uso declarado por la aplicación que lo integra.
- Procesamiento local con privacidad por diseño: el audio no abandona el dispositivo.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio más allá del ASR ni modo thinking.
- Capacidad multilingüe limitada al árabe; no se declaran otros idiomas.

## Casos de uso

- Verificación de recitación en aplicaciones de memorización (hifz): el modelo compara la recitación del usuario con el texto coránico esperado, y su ejecución local permite hacerlo sin conexión y sin exponer el audio, algo crítico en un contexto religioso y educativo.
- Aplicaciones móviles sin conectividad: al pesar unos 148 MB en f16 y ejecutarse con whisper.cpp, puede integrarse en apps Android o iOS para entornos con red intermitente o inexistente.
- Herramientas de estudio para madrasas y centros educativos: transcripción de sesiones de recitación para su revisión posterior por parte del profesor, con bajo coste de infraestructura al no requerir servidores GPU.
- Corrección de pronunciación y tajwid: al estar ajustado al dominio coránico, sirve como base para sistemas que señalen discrepancias entre lo recitado y el texto de referencia.
- Investigación en ASR de dominio específico: punto de partida ligero para experimentos de ajuste fino o evaluación en árabe coránico sin necesidad de infraestructura pesada.
- Prototipado rápido en escritorio: con whisper.cpp se puede desplegar en portátiles convencionales para validar pipelines de audio antes de invertir en modelos mayores.
- Archivado y búsqueda de recitaciones: transcripción por lotes de grabaciones para indexarlas y permitir búsquedas por texto en bibliotecas de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma directa, ya que el modelo está pensado para CPU; en GPU, el fichero f16 de aproximadamente 148 MB requiere menos de 1 GB de memoria.
- GPU recomendadas: cualquiera con al menos 1 GB de memoria libre; el modelo es viable incluso en iGPU. Para CPU, cualquier procesador moderno de escritorio o móvil es suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.), con un uso de memoria marginal.
- Opciones de despliegue: whisper.cpp (formato nativo ggml); también puede ejecutarse el checkpoint original de PyTorch con la librería transformers si se convierte de vuelta, aunque no es el propósito de esta publicación.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y de la longitud del audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Ahm20/yousuf-quran-asr | ~74 M (Whisper base) | 30 s | Árabe | Apache 2.0 | ggml f16 |
| tarteel-ai/whisper-base-ar-quran | ~74 M (Whisper base) | 30 s | Árabe | Apache 2.0 (según modelo base) | PyTorch (safetensors/bin) |
| openai/whisper-base | ~74 M | 30 s | Multilingüe | MIT | PyTorch, ggml (conversiones de terceros) |
| openai/whisper-small | ~244 M | 30 s | Multilingüe | MIT | PyTorch, ggml (conversiones de terceros) |

La comparación con `whisper-base` y `whisper-small` de OpenAI es pertinente por tamaño y tarea, pero no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión de formato sin reentrenamiento: hereda íntegramente los sesgos y errores del modelo original de Tarteel AI.
- Riesgo de alucinación inherente a Whisper, especialmente con audio ruidoso, silencios o recitaciones muy alejadas del dominio de entrenamiento.
- Especialización estrecha: está ajustado a recitación coránica en árabe y no debe esperarse un buen rendimiento en árabe coloquial, otros dialectos o en otros idiomas.
- Ventana de audio limitada a 30 segundos por pasada, lo que exige segmentar recitaciones largas.
- Solo se publica el formato ggml f16; no hay cuantizaciones de menor precisión (q5, q8, etc.) ni pesos en safetensors en este repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (15 de noviembre de 2026): no hay evidencia de uso ni validación por parte de la comunidad.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones del modelo base y de Whisper (MIT) al redistribuir.
- No se documentan métricas de calidad, evaluación ni procedencia detallada de los datos de ajuste del modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ahm20/yousuf-quran-asr
- Modelo base: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- OpenAI Whisper (modelo original): https://github.com/openai/whisper
