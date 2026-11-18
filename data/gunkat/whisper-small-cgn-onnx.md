# Gunkat/whisper-small-cgn-onnx

## Resumen

Gunkat/whisper-small-cgn-onnx es una conversión a formato ONNX del modelo kul-speech-lab/whisper_small_CGN, un Whisper small de OpenAI afinado por KU Leuven sobre la parte flamenca del Corpus Gesproken Nederlands (CGN). El resultado es un modelo de reconocimiento automático del habla (ASR) especializado en neerlandés, con especial énfasis en las variedades del neerlandés hablado en Flandes. La conversión la firma el usuario Gunkat y está pensada para ejecutarse directamente en el navegador mediante Transformers.js 3.7.6, lo que la diferencia de las distribuciones habituales en PyTorch o safetensors.

El modelo conserva la arquitectura encoder-decoder transformer propia de la familia Whisper, con aproximadamente 244 millones de parámetros en su variante small, aunque el dato exacto no se detalla en la información disponible. Su interés actual reside en dos factores: por un lado, ofrece una vía de despliegue de ASR en cliente (navegador) sin necesidad de infraestructura de servidor GPU; por otro, aporta una adaptación específica al neerlandés flamenco que los Whisper genéricos suelen cubrir de forma desigual frente a otras lenguas mayoritarias.

La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, y el repositorio ocupa 0,9 GB en formato ONNX cuantizado. No obstante, el modelo no publica métricas de evaluación ni detalles sobre el proceso de conversión más allá de la referencia a los scripts de Transformers.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parametros totales | no disponible (variante Whisper small, aproximadamente 244 M según la arquitectura base de OpenAI) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper small base: ventana de audio de 30 s por segmento) |
| Tipos de cuantizacion | no disponible (el repositorio indica ONNX cuantizado vía Transformers.js, sin detallar el esquema) |
| Idiomas soportados | neerlandés (nl) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (optimizado para Transformers.js) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura estándar de Whisper small: un encoder transformer que procesa espectrogramas mel de 80 canales y un decoder autorregresivo que genera tokens de texto, con atención cruzada entre ambos. Whisper se entrena de forma supervisada sobre pares audio-transcripción a gran escala y, en su variante small, emplea 12 capas en encoder y decoder con una dimensión de modelo de 768.

Sobre esa base, kul-speech-lab/whisper_small_CGN fue afinado por KU Leuven sobre la porción flamenca del Corpus Gesproken Nederlands, un corpus de referencia del neerlandés hablado. La información disponible no detalla el número de horas de audio, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en ASR). La conversión a ONNX se realizó con los scripts de Transformers.js 3.7.6, que generan los grafos necesarios para inferencia en navegador mediante WebAssembly o WebGPU, aunque el autor no especifica si se aplicó cuantización int8 o float16.

## Capacidades

- Reconocimiento automático del habla en neerlandés, con especialización en las variedades flamencas del Corpus Gesproken Nederlands.
- Transcripción de audio a texto en formato de texto plano, sin puntuación ni marcas de tiempo garantizadas más allá de las que produce el decoder de Whisper.
- Ejecución en navegador mediante Transformers.js, sin backend Python.
- Soporte de audio de hasta 30 segundos por segmento de inferencia (limitación heredada de Whisper).
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni uso como agente.
- No dispone de modo thinking, visión ni audio de entrada más allá de la transcripción.
- Capacidad multilingüe limitada al neerlandés según la model card; no se garantiza un rendimiento fiable en otras lenguas.

## Casos de uso

- Transcripción de reuniones en neerlandés en el navegador: al ejecutarse vía Transformers.js, permite transcribir audio localmente sin enviar datos a un servidor, útil en entornos con requisitos de privacidad.
- Subtitulado de vídeos en flamenco: el ajuste sobre el CGN mejora la cobertura de acentos y vocabulario flamenco frente a Whisper small genérico, adecuado para archivos audiovisuales regionales.
- Asistentes de voz para aplicaciones web neerlandófonas: la integración con Transformers.js facilita añadir dictado por voz a formularios o interfaces sin infraestructura adicional.
- Herramientas de accesibilidad: transcripción en tiempo real de audio para personas con discapacidad auditiva en contextos de habla neerlandesa, ejecutándose en el propio dispositivo.
- Anotación de corpus orales: apoyo a investigadores que necesiten pretranscribir entrevistas o grabaciones en neerlandés antes de la revisión manual.
- Prototipado rápido de pipelines ASR: al ser un artefacto ONNX ligero, sirve para validar flujos de transcripción en aplicaciones JavaScript antes de invertir en modelos mayores o servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del modelo base y la del repositorio ONNX no incluyen métricas de WER (word error rate) ni comparaciones cuantitativas con otras variantes de Whisper.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; un Whisper small en fp16 ocupa aproximadamente 0,5 GB de pesos, y en ONNX cuantizado el repositorio de 0,9 GB sugiere un tamaño manejable en memoria.
- GPU recomendadas: no se especifican; al estar orientado a Transformers.js, el objetivo principal es CPU o GPU integrada vía WebGPU en el navegador.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2 GB de memoria libre, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: Transformers.js (navegador), y potencialmente ONNX Runtime en entornos Node.js o Python; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos ASR de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Gunkat/whisper-small-cgn-onnx | Whisper small (~244 M) | 30 s por segmento | nl | Apache 2.0 | ONNX |
| openai/whisper-small | ~244 M | 30 s por segmento | multilingüe | Apache 2.0 | PyTorch, safetensors |
| kul-speech-lab/whisper_small_CGN | ~244 M | 30 s por segmento | nl | no disponible | PyTorch |
| whisper-small.nl (variantes comunitarias) | ~244 M | 30 s por segmento | nl | variable | variable |

La diferencia principal frente a openai/whisper-small es el ajuste específico al neerlandés flamenco y el formato ONNX listo para navegador. Frente al modelo base de KU Leuven, la única diferencia es la conversión de formato y la orientación a Transformers.js. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- El modelo solo declara soporte para neerlandés; su uso en otras lenguas puede producir transcripciones incorrectas o alucinaciones.
- No se han publicado métricas de WER, por lo que no es posible cuantificar su precisión real frente a alternativas.
- Whisper es conocido por alucinar texto en segmentos de silencio o ruido; este comportamiento puede persistir en el modelo afinado.
- La ventana de 30 segundos por segmento obliga a segmentar audios largos y puede perder contexto entre fragmentos.
- El proceso de conversión a ONNX no está documentado en detalle (esquema de cuantización, validación numérica), lo que introduce incertidumbre sobre posibles degradaciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base kul-speech-lab/whisper_small_CGN, que no se indica en la información disponible.
- El modelo está especializado en habla flamenca; su rendimiento en neerlandés de los Países Bajos no está garantizado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Gunkat/whisper-small-cgn-onnx
- Modelo base: https://huggingface.co/kul-speech-lab/whisper_small_CGN
- Transformers.js: https://github.com/huggingface/transformers.js
- Whisper (OpenAI): https://github.com/openai/whisper
