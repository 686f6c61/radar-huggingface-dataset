# Pragmaticl/ZeroTTS

## Resumen

ZeroTTS es un modelo de síntesis de voz (text-to-speech) zero-shot especializado en vietnamita, desarrollado por zeroweight-ai y distribuido en formato ONNX a través de Hugging Face bajo licencia MIT. Su objetivo es ofrecer TTS de alta calidad para vietnamita con capacidad de clonación de voz a partir de tan solo 3 segundos de audio de referencia, sin necesidad de fine-tuning ni entrenamiento por hablante. El modelo se posiciona como una alternativa ligera y desplegable en CPU, con inferencia en tiempo real (RTF ~0,5×) y un primer fragmento de audio en torno a 70 ms.

La relevancia del modelo radica en dos factores: por un lado, cubre un idioma con poca representación en el ecosistema TTS open source (vietnamita, con soporte para code-switching vietnamita/inglés y lectura de fechas, acrónimos y números sin normalizador de texto); por otro, su empaquetado en ONNX y su rendimiento en CPU lo hacen adecuado para despliegues en entornos sin GPU, como aplicaciones de escritorio, navegador o dispositivos de borde. El repositorio ocupa 1,1 GB y se distribuye con la librería `zerotts` para Python.

La información pública disponible no detalla el número de parámetros, la arquitectura interna ni la composición exacta del dataset de entrenamiento; la model card se centra en capacidades, métricas de evaluación y ejemplos de uso. Los benchmarks declarados por el autor (no verificados de forma independiente) sitúan al modelo con un WER del 1,03 % en el conjunto general de ZeroBench-TTS y un UTMOSv2 de 2,91.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (referencia de voz de 3 a 30 s) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | vietnamita (vi); code-switching vietnamita/inglés |
| Licencia | MIT |
| Formato de pesos | ONNX (ejecución con onnxruntime); voces en `.npz` |

## Arquitectura y entrenamiento

No se ha publicado en la información disponible la arquitectura interna del modelo (tipo de backbone, mecanismo de atención, diseño del decoder acústico o del codificador de voz). La model card describe el funcionamiento a nivel de interfaz: la condición de hablante se representa como un array de latentes de voz con forma `(1, n_voice_queries, d_model)`, distribuido como archivo `.npz` en el directorio `voices/`, y esa array constituye toda la condicionalización del hablante, sin transcripción de referencia ni prompt de audio. La clonación zero-shot se realiza a partir de 3 a 30 segundos de audio de referencia.

Tampoco se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona que el modelo está optimizado para inferencia en CPU mediante onnxruntime y que dispone de una ruta de streaming real que produce el primer frame de audio en torno a 70 ms. El artículo asociado aparece referenciado con el identificador arXiv 2602.10934 en los metadatos de Hugging Face.

## Capacidades

- Síntesis de voz zero-shot en vietnamita con calidad declarada de 2,91 UTMOSv2.
- Clonación de voz a partir de 3 a 30 segundos de audio de referencia, sin fine-tuning ni entrenamiento por hablante.
- Streaming de audio con latencia de primer fragmento en torno a 70 ms y RTF ~0,5× en CPU.
- Manejo de code-switching vietnamita/inglés dentro de una misma locución.
- Lectura directa de fechas (`31/12/2025`), acrónimos y números sin normalizador de texto externo.
- Soporte de prompts de voz cross-lingual: referencia en vietnamita para generar salida en inglés.
- Inferencia en CPU mediante onnxruntime, sin requisito de GPU.
- Voces predefinidas incluidas en el repositorio (por ejemplo, `maichi`) y voces personalizadas en formato `.npz`.
- API Python (`zerotts`) con métodos `synthesize`, `synthesize_stream` y `save_audio`.

## Casos de uso

- **Atención al cliente automatizada en vietnamita**: el modelo puede generar respuestas habladas naturales con baja latencia (primer audio en ~70 ms) en sistemas de IVR o asistentes telefónicos, ejecutándose en CPU y evitando el coste de GPU en producción.
- **Clonación de voz para locuciones corporativas**: a partir de 3 segundos de audio de un locutor autorizado se puede generar una voz consistente para vídeos, anuncios o contenido formativo, sin entrenar un modelo por hablante.
- **Lectura de noticias y contenido editorial**: el soporte de code-switching vietnamita/inglés y la lectura directa de fechas y acrónimos permiten sintetizar titulares y artículos sin un pipeline de normalización de texto previo.
- **Audiolibros y narración de formato largo**: la ruta de streaming y el RTF ~0,5× en CPU permiten generar narraciones extensas en segundo plano en portátiles o servidores sin GPU, con salida a 48 kHz.
- **Accesibilidad en aplicaciones móviles o de escritorio**: al distribuirse en ONNX y ejecutarse en CPU, puede integrarse en aplicaciones locales que lean contenido en voz alta para usuarios con discapacidad visual, sin depender de servicios en la nube.
- **Prototipado de asistentes conversacionales multihablante**: el formato de voz como array `.npz` permite cambiar de hablante en tiempo de ejecución, útil para demos de diálogos entre dos voces (la model card incluye un ejemplo de conversación a dos voces).
- **Generación de voz para doblaje y localización**: la capacidad cross-lingual (referencia en vietnamita, salida en inglés) facilita experimentos de doblaje manteniendo el timbre del hablante original.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente) sobre el conjunto ZeroBench-TTS:

| Tarea / configuración | Métrica | Valor |
|---|---|---|
| Zero-shot TTS (general) | WER (%) — texto crudo | 1,03 |
| Zero-shot TTS (general) | UTMOSv2 (MOS de naturalidad) | 2,91 |
| Zero-shot TTS (general) | Similitud de hablante (coseno WavLM-SV) | 0,936 |
| Zero-shot TTS (general) | Silencio excesivo (s) | 0,029 |
| Monolingüe vietnamita | WER (%) — texto crudo | 0,16 |
| Code-switching vietnamita/inglés | WER (%) — texto crudo | 0,97 |
| Prompt de voz cross-lingual | WER (%) — texto crudo | 1,42 |
| Acrónimos, fechas y números | WER (%) — texto crudo | 1,75 |

Datos de velocidad declarados por el autor: RTF ~0,5× (aproximadamente 2× más rápido que tiempo real) en CPU, con primer fragmento de audio en torno a 70 ms. La model card indica además que el modelo tiene "4× menos errores de palabra que el siguiente mejor modelo" y que su UTMOS está por encima de otros sistemas abiertos de vietnamita, aunque no se aportan en la información disponible las cifras concretas de esos sistemas comparados.

## Requisitos de hardware

- **VRAM estimada**: no aplica de forma estricta; el modelo está diseñado para inferencia en CPU con onnxruntime. El repositorio ocupa 1,1 GB, lo que da una cota superior aproximada del espacio en disco y memoria necesarios para cargar los pesos en precisión nativa.
- **GPU recomendadas**: no se especifican en la información disponible; el modelo no requiere GPU. Cualquier GPU compatible con onnxruntime (por ejemplo, series RTX o A100/H100) podría ejecutarlo, pero no hay datos publicados de rendimiento en GPU.
- **Compatibilidad con GPU de consumo**: sí, en la práctica cualquier equipo puede ejecutarlo en CPU; no se documentan requisitos mínimos de CPU.
- **Opciones de despliegue**: onnxruntime a través de la librería Python `zerotts`; la model card menciona código, ejemplos y una demo de navegador en el repositorio de GitHub.
- **Latencia y throughput**: RTF ~0,5× en CPU (aproximadamente el doble de rápido que tiempo real) y primer fragmento de audio en torno a 70 ms, según el autor. La salida se genera a 48 kHz en mono, float32.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos concretos (parámetros, contexto, métricas, licencia) de modelos alternativos de TTS zero-shot para vietnamita. La model card afirma que ZeroTTS supera a otros sistemas abiertos de vietnamita en UTMOS y reduce el WER en un factor de 4 frente al siguiente mejor modelo, pero no se nombran ni se cuantifican esos sistemas en el material disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZeroTTS | no disponible | no disponible | WER 1,03 %; UTMOSv2 2,91; similitud 0,936 (ZeroBench-TTS, sin verificar) | MIT | Hugging Face (ONNX) |
| Alternativas de TTS zero-shot para vietnamita | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Idioma**: el modelo está diseñado para vietnamita; el soporte de inglés se limita a code-switching y a prompts cross-lingual, sin garantías de calidad general en inglés.
- **Benchmarks no verificados**: todas las métricas de la model card están marcadas como `verified: false`; proceden del autor y no han sido replicadas de forma independiente en la información disponible.
- **Datos de arquitectura ausentes**: no se publican el número de parámetros, la arquitectura ni el dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo y generalización.
- **Riesgo de alucinación y artefactos acústicos**: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas, entonación anómala o artefactos en textos fuera de distribución (nombres propios, terminología técnica, dialectos no representados).
- **Clonación de voz**: la capacidad de clonar voces a partir de pocos segundos de audio plantea riesgos de suplantación y uso indebido; es responsabilidad del integrador obtener consentimiento y aplicar medidas de verificación.
- **Licencia MIT**: permite uso comercial, pero no exime del cumplimiento de normativas de protección de datos y derechos de imagen en la clonación de voces.
- **Formato ONNX**: el despliegue está orientado a onnxruntime; no se documentan en la información disponible variantes GGUF, safetensors ni integraciones con vLLM o TGI.
- **Madurez del repositorio**: el modelo figura con 0 descargas y 0 likes en el momento de la consulta, y existe una copia en el espacio `thuongvv/ZeroTTS`; conviene verificar la fuente canónica (`zeroweight-ai/ZeroTTS`) antes de integrarlo.

## Enlaces

- Modelo en Hugging Face (copia consultada): https://huggingface.co/Pragmaticl/ZeroTTS
- Modelo canónico en Hugging Face: https://huggingface.co/zeroweight-ai/ZeroTTS
- Copia en Hugging Face: https://huggingface.co/thuongvv/ZeroTTS
- Repositorio de código y demo: https://github.com/zeroweight-ai/ZeroTTS
- Dataset de evaluación ZeroBench-TTS: https://huggingface.co/datasets/zeroweight-ai/ZeroBench-TTS
- Blog del autor: https://zeroweight.ai/blog/zero-tts
- Ficha en AxForge: https://catalog.axforge.ai/models/zerotts/
- Paper referenciado en metadatos: arXiv 2602.10934
