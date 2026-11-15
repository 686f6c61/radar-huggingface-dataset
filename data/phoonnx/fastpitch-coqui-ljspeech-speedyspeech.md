# Phoonnx/fastpitch-coqui-ljspeech-speedyspeech

## Resumen

`Phoonnx/fastpitch-coqui-ljspeech-speedyspeech` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, publicado por el usuario Phoonnx como un subconjunto extraído del repositorio agregador `Phoonnx/phoonnx-fastpitch`, en la carpeta `coqui-ljspeech-speedyspeech`. Está pensado para su uso con la librería `phoonnx` (proyecto de TigreGotico), que actúa como runtime de voces TTS basadas en FastPitch.

El modelo emplea la arquitectura FastPitch, un transformer no autorregresivo de síntesis de habla desarrollado originalmente en NVIDIA, aquí en una variante procedente del ecosistema Coqui y entrenada sobre el corpus LJSpeech (inglés, una única hablante femenina). La denominación "speedyspeech" sugiere que el paquete se orienta a una síntesis rápida, aunque la model card no aporta detalles sobre la configuración concreta ni sobre el vocoder asociado.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de despliegue (pesos ONNX listos para inferencia) más que de un modelo de investigación. No hay métricas publicadas, no se declaran idiomas soportados en los metadatos y la licencia figura como `other` sin especificar términos, lo que obliga a revisar el repositorio de origen antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastPitch (transformer no autorregresivo para TTS), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; la entrada es texto fonetizado, no contexto de tokens de LLM) |
| Tipos de cuantizacion | no disponible (el artefacto se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible en metadatos; el corpus de entrenamiento (LJSpeech) es inglés |
| Licencia | other (sin términos especificados en la model card) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

FastPitch es una arquitectura de síntesis de voz basada en transformer no autorregresivo que predice directamente mel-espectrogramas a partir de una secuencia de fonemas, sustituyendo el uso de embeddings de hablante por la modulación de las representaciones internas mediante pitch y duración predichos. Frente a Tacotron 2, elimina la recurrencia y el mecanismo de atención autorregresivo, lo que permite paralelizar la inferencia y reducir la latencia. La variante aquí publicada procede del ecosistema Coqui y se ha exportado a ONNX para su ejecución con el runtime `phoonnx`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de ajuste fino adicionales. El nombre de la carpeta indica que el entrenamiento se realizó sobre LJSpeech, un corpus público de aproximadamente 24 horas de audio en inglés de una única hablante. El vocoder asociado (necesario para convertir los mel-espectrogramas en waveform) no se documenta en esta model card y debe buscarse en el repositorio de origen `Phoonnx/phoonnx-fastpitch`.

## Capacidades

- Síntesis de voz a partir de texto en inglés, con salida de mel-espectrogramas (requiere vocoder para audio final).
- Control de prosodia mediante pitch y duración predichos por el propio modelo (característica nativa de FastPitch).
- Inferencia acelerada por exportación a ONNX, apta para ejecución en CPU sin GPU dedicada.
- Integración con la librería `phoonnx` mediante el identificador de voz `coqui/en-ljspeech-speedy-speech`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente acústico.
- No dispone de modo "thinking", visión, audio de entrada ni capacidades multimodales.
- Multilingüismo: no documentado; el corpus de entrenamiento es monolingüe inglés.

## Casos de uso

- Lectura de artículos y documentos en inglés: el modelo convierte texto plano en habla sintética con prosodia controlable, adecuado para aplicaciones de accesibilidad y lectores de pantalla que necesiten una voz femenina en inglés.
- Generación de audiolibros y pódcasts automatizados: al ser un modelo no autorregresivo, permite sintetizar pasajes largos con latencia baja y por lotes, siempre que se gestione la segmentación en frases.
- Asistentes de voz embebidos: la exportación a ONNX permite desplegar el modelo en dispositivos con recursos limitados (Raspberry Pi, móviles) sin dependencia de GPU, integrándolo en un pipeline con un vocoder ligero.
- Pruebas de regresión en pipelines TTS: sirve como voz de referencia dentro de `phoonnx` para validar cambios en el runtime o en el vocoder, dado su identificador de voz estable.
- Prototipado de interfaces conversacionales: útil para generar respuestas habladas en demos y pruebas de usabilidad en inglés antes de invertir en un modelo TTS comercial.
- Generación de avisos y notificaciones por voz: la naturaleza determinista y rápida del modelo permite pregenerar o sintetizar en tiempo real mensajes cortos en inglés para sistemas de megafonía o alertas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un modelo FastPitch exportado a ONNX, el consumo es moderado (típicamente por debajo de 2 GB en FP32 para variantes estándar de FastPitch), pero no se confirma en la documentación.
- GPU recomendadas: no disponibles. El formato ONNX permite ejecución en CPU y en GPU consumer (RTX 3060, RTX 4090) mediante ONNX Runtime, sin que el autor especifique requisitos.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño reducido del repositorio (0.0 GB reportado) y la naturaleza del modelo, aunque no se aportan cifras.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), runtime `phoonnx`, y cualquier motor compatible con ONNX. No se documenta soporte para vLLM, llama.cpp ni TGI, que no aplican a modelos TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto/entrada | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Phoonnx/fastpitch-coqui-ljspeech-speedyspeech | FastPitch (ONNX) | Texto fonetizado | Inglés (por corpus) | other | ONNX |
| Coqui TTS (modelos FastPitch originales) | FastPitch + vocoder | Texto fonetizado | Multilingüe según checkpoint | MPL 2.0 / otras según checkpoint | PyTorch |
| NVIDIA FastPitch (NeMo) | FastPitch | Texto fonetizado | Inglés y otros según checkpoint | Apache 2.0 (código) / según checkpoint | PyTorch, ONNX |
| Piper TTS | VITS (ONNX) | Texto | Multilingüe | MIT (código) / según voz | ONNX |

No se dispone de datos de rendimiento comparativo (MOS, RTF) para este artefacto concreto.

## Limitaciones y advertencias

- Licencia `other` sin términos especificados: no se autoriza explícitamente el uso comercial; es obligatorio revisar la licencia del repositorio de origen `Phoonnx/phoonnx-fastpitch` y del checkpoint Coqui subyacente.
- Modelo monolingüe de facto (LJSpeech, inglés) y con una única hablante: no apto para voces masculinas, acentos distintos ni otros idiomas sin reentrenamiento.
- Sesgos de dominio: al entrenarse con lectura de libros, el estilo es formal y puede sonar artificial en diálogos coloquiales o dominios técnicos.
- Riesgo de pronunciación incorrecta en nombres propios, siglas y términos fuera del vocabulario del corpus; requiere un front-end de fonetización adecuado.
- No se documenta el vocoder asociado en esta model card: sin él, la salida son mel-espectrogramas, no audio reproducible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- Sin benchmarks publicados: no se puede garantizar calidad (MOS) ni latencia frente a alternativas.
- El tamaño reportado del repositorio (0.0 GB) sugiere que los pesos pueden estar en LFS o que la información de metadatos está incompleta; conviene verificar la integridad de la descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/fastpitch-coqui-ljspeech-speedyspeech
- Repositorio de origen: https://huggingface.co/Phoonnx/phoonnx-fastpitch
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
- Paper de FastPitch (NVIDIA): https://arxiv.org/abs/2006.06873
- Corpus LJSpeech: https://keithito.com/LJ-Speech-Dataset/
- Coqui TTS: https://github.com/coqui-ai/TTS
