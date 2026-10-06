# globalizator/gzwhisper-gigaam-multilingual-onnx-int8

## Resumen

`globalizator/gzwhisper-gigaam-multilingual-onnx-int8` es una conversión a ONNX con cuantización int8 del modelo de reconocimiento automático de voz `ai-sage/GigaAM-Multilingual`, publicada por el usuario globalizator como paquete de ejecución para el proyecto GZ Whisper. No es un modelo entrenado desde cero ni un ajuste fino: es un artefacto de distribución derivado de la revisión fija `2f8a57144e6ec3adfd32fe0484d9ea9913305bc8` del modelo original, con un tamaño aproximado de 320 MB y pensado para inferencia local.

El modelo subyacente pertenece a la familia GigaAM de Salute Developers y es un encoder Conformer con cabecera CTC sobre caracteres (charwise CTC). Su rasgo diferencial es la cobertura de lenguas de bajos recursos de Asia Central —kazajo (kk), kirguís (ky) y uzbeco (uz)— junto con el ruso (ru), un conjunto que los sistemas ASR multilingües generalistas cubren de forma deficitaria. El trabajo asociado describe un preentrenamiento auto-supervisado de estilo HuBERT sobre 2 millones de horas de audio con reweighting por grupos.

La relevancia de este paquete concreto es operativa: al estar en ONNX Runtime con pesos int8, puede ejecutarse en CPU sin GPU, incluidos dispositivos móviles, lo que habilita transcripción offline sin enviar audio a servidores. Como contrapartida, el repositorio acumula 0 descargas y 0 likes, y el propio autor advierte de que la comprobación realizada es un «smoke check» sobre muestras cortas de voz humana, no una certificación de precisión ni de compatibilidad de dispositivos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer con cabecera CTC sobre caracteres, exportado a ONNX Runtime |
| Parámetros totales | Aproximadamente 220 M (revisión CTC de la familia GigaAM; la línea completa abarca 220 M-600 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo ASR; el autor no especifica ventana de audio ni duración máxima) |
| Tipos de cuantización | int8 (cuantización dinámica sobre el grafo ONNX) |
| Idiomas soportados | Ruso (ru), kazajo (kk), kirguís (ky), uzbeco (uz) |
| Licencia | MIT |
| Formato de pesos | ONNX (int8) |
| Tamaño del paquete de ejecución | Aproximadamente 320 MB |
| Modelo base | `ai-sage/GigaAM-Multilingual`, revisión `2f8a57144e6ec3adfd32fe0484d9ea9913305bc8` |
| Ajuste fino | Ninguno; conversión directa del modelo original |

## Arquitectura y entrenamiento

La arquitectura es un encoder Conformer —bloques que combinan autoatención y convoluciones, adecuados para capturar dependencias locales y globales en la señal de voz— seguido de una cabeza CTC que emite secuencias de caracteres sin necesidad de un decodificador autorregresivo. Esta configuración permite inferencia en una sola pasada, lo que explica su idoneidad para CPU y dispositivos móviles. La variante multilingüe de la familia se preentrenó con un objetivo auto-supervisado de estilo HuBERT sobre 2 millones de horas de audio, con una estrategia de reweighting por grupos que refuerza el aprendizaje de las lenguas con menos datos disponibles.

Sobre este paquete en particular no consta ningún entrenamiento adicional: el autor indica explícitamente que no se realizó fine-tuning y que los ficheros convertidos se comprobaron únicamente con muestras cortas de voz humana. La conversión fija la revisión del modelo de origen y conserva recetas de conversión y metadatos de integridad en el proyecto GZ Whisper. No hay información pública sobre la composición exacta del dataset, el uso de RLHF/DPO (no aplicable a un sistema CTC) ni sobre detalles de decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático de voz con salida CTC por caracteres en ruso, kazajo, kirguís y uzbeco.
- Inferencia en CPU mediante ONNX Runtime, con pesos cuantizados a int8, sin requisito de GPU.
- Ejecución local y offline: los paquetes son descargas opcionales que la aplicación GZ Whisper consume en el dispositivo tras la instalación.
- Modelo especializado exclusivamente en ASR: no genera texto libre, no razona, no traduce y no resume.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni de razonamiento multi-paso.
- Sin visión, sin procesamiento de audio más allá de la transcripción.
- Un build equivalente del mismo modelo base documenta la transcripción de términos técnicos en inglés dentro de dictado ruso escribiéndolos en alfabeto latino; este paquete no lo declara de forma explícita.
- No disponible: puntuación, capitalización, marcas de tiempo, diarización de hablantes y detección de idioma automática.

## Casos de uso

- Dictado en ruso sobre equipos sin GPU: el paquete int8 se ejecuta en CPU con ONNX Runtime, de modo que puede integrarse en estaciones de trabajo de oficina o portátiles modestos sin añadir hardware dedicado.
- Transcripción de patrimonio audiovisual en kazajo, kirguís y uzbeco: al ser una de las pocas alternativas abiertas con cobertura explícita de estas lenguas, sirve para digitalizar archivos de radio, televisión o entrevistas orales que los sistemas generalistas transcriben con alta tasa de error.
- Aplicación móvil de notas de voz offline: el tamaño de 320 MB y el motor ONNX Runtime permiten empaquetar el modelo en una app iOS (el proyecto GZ Whisper registra la aceptación en iPhone por separado) y transcribir sin conexión, evitando enviar audio personal a servidores externos.
- Subtitulado de reuniones corporativas en ruso en infraestructura propia: un servicio en contenedor puede procesar el audio en el mismo entorno donde se almacenan las grabaciones, cumpliendo requisitos de residencia de datos.
- Preprocesado de corpus de voz para entrenamiento: transcripción masiva en CPU de grabaciones en las cuatro lenguas soportadas para generar etiquetas iniciales que después se revisan y se usan en ajustes finos de otros sistemas.
- Transcripción en centros de atención telefónica con datos sensibles: al procesarse localmente, el audio con información identificativa no sale de la organización, lo que simplifica el cumplimiento normativo frente a APIs de ASR en la nube.
- Investigación en lenguas de bajos recursos: sirve como punto de partida reproducible (revisión fijada) para medir líneas base de WER y para experimentar con decodificación o adaptación al dominio, aunque este paquete concreto es solo de inferencia y no incluye pesos en precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este paquete. La model card del autor solo indica que los ficheros convertidos se comprobaron con muestras cortas de voz humana («runtime smoke check») y que esa comprobación no constituye una certificación general de precisión, consumo de batería ni compatibilidad de dispositivos.

## Requisitos de hardware

- VRAM: no aplica en el escenario previsto; el modelo está cuantizado a int8 y orientado a ejecución en CPU con ONNX Runtime.
- GPU recomendadas: ninguna en particular; el autor no documenta ruta de ejecución en GPU. Cualquier GPU con soporte de ONNX Runtime podría utilizarse, pero no hay datos de rendimiento publicados.
- Cabe en GPU de consumo: sí, con enorme holgura dado el tamaño de 320 MB, aunque no es el caso de uso declarado.
- Ejecución en CPU y móvil: es el escenario objetivo; el proyecto GZ Whisper registra la aceptación en iPhone por separado.
- Memoria del sistema: no especificada por el autor; los pesos ocupan aproximadamente 320 MB y el consumo adicional depende del runtime de ONNX Runtime.
- Opciones de despliegue: ONNX Runtime; el build hermano del mismo modelo base está preparado para sherpa-onnx. No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje ni existir formato GGUF.
- Latencia y throughput: no disponibles.
- Restricción operativa: el autor indica que los ficheros de runtime no deben renombrarse.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este paquete (`gzwhisper-gigaam-multilingual-onnx-int8`) | ≈220 M | ru, kk, ky, uz | No disponible | MIT (paquete) | ONNX int8 | Conversión para GZ Whisper; sin fine-tuning; verificación limitada |
| `i2z1/gigaam-multilingual-ctc-onnx-int8` | ≈220 M | ru (con términos técnicos en inglés) | No disponible | No disponible | ONNX int8 | Exportación propia del mismo modelo base, cuantizada dinámicamente para sherpa-onnx en CPU |
| `ai-sage/GigaAM-Multilingual` | ≈220 M en la revisión CTC (220 M-600 M en la familia) | ru, kk, ky, uz (70+ lenguas en la línea multilingüe de GigaAM) | No disponible | No disponible en la información recopilada | Pesos originales (no ONNX) | Modelo de origen; este paquete es una conversión suya |
| Modelos Whisper de OpenAI | No disponible en la información recopilada | Multilingüe amplio | No disponible | MIT (según la información pública habitual del proyecto) | PyTorch, GGML y variantes | Alternativa generalista, pero sin cobertura declarada específica para kk, ky y uz |

## Limitaciones y advertencias

- Solo transcribe: no puede generar texto, resumir, traducir ni mantener conversación. Cualquier expectativa de «asistente» sobre este paquete es incorrecta.
- La cuantización dinámica a int8 puede degradar la tasa de error de palabra respecto a los pesos originales en precisión completa; no se han publicado mediciones comparativas.
- La verificación del autor se limita a un «smoke check» sobre muestras cortas de voz humana y no certifica precisión, consumo de batería ni compatibilidad de dispositivos.
- Cobertura lingüística restringida a cuatro idiomas; el rendimiento fuera de ellos no está documentado y previsiblemente será deficiente.
- No hay información sobre robustez frente a ruido de fondo, solapamiento de hablantes, acentos, dialectos, audio telefónico o grabaciones de muy larga duración.
- Ausencia de puntuación, capitalización y marcas de tiempo declaradas: la salida CTC por caracteres requerirá posprocesado si el caso de uso las necesita.
- Riesgo de alucinación en el sentido propio de los sistemas CTC: ante silencios, ruido o audio ininteligible el modelo puede emitir caracteres espurios; conviene aplicar detección de actividad de voz y umbrales de confianza.
- Estado del repositorio: 0 descargas y 0 likes en el momento de redactar la ficha, sin señales de mantenimiento por parte de la comunidad.
- Licencia MIT sobre el artefacto de conversión, pero la model card remite a LICENSE, NOTICE y SOURCE_MODEL_CARD.md y recuerda que los autores originales conservan sus derechos. Conviene revisar esos ficheros antes de un uso comercial.
- Restricción técnica explícita: no renombrar los ficheros de runtime, ya que la aplicación espera nombres concretos.

## Enlaces

- Paquete en HuggingFace: https://huggingface.co/globalizator/gzwhisper-gigaam-multilingual-onnx-int8
- Modelo base: https://huggingface.co/ai-sage/GigaAM-Multilingual
- Repositorio GigaAM de Salute Developers: https://github.com/salute-developers/GigaAM/
- Paper «GigaAM Multilingual: Foundation Model for Underrepresented Languages» (PDF): https://arxiv.org/pdf/2607.10371
- Paper en arXiv: https://arxiv.org/abs/2607.10371
- Build equivalente para sherpa-onnx: https://huggingface.co/i2z1/gigaam-multilingual-ctc-onnx-int8
