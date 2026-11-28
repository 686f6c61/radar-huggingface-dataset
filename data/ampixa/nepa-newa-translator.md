# ampixa/nepa-newa-translator

## Resumen

Nepa-Newa Translator es un modelo de traducción de voz (speech-to-speech) desarrollado por ampixa, orientado al par de idiomas nepalí (ne) y nepal bhasa o newari (new). El modelo se publica en Hugging Face con pipeline declarado de reconocimiento automático de voz y etiquetas que cubren ASR, TTS, traducción de voz y asistente de voz, lo que sugiere un sistema integrado de reconocimiento, traducción y síntesis para conversación entre hablantes de ambos idiomas.

Con 7.518.069.290 parámetros (aproximadamente 7,5 mil millones) según los pesos en safetensors, se sitúa en la franja de modelos tipo Gemma de 7B, y de hecho la etiqueta "gemma" aparece entre sus tags, lo que apunta a una base derivada de esa familia. El repositorio ocupa 9,7 GB y ofrece pesos en safetensors, ONNX y GGUF, lo que facilita su despliegue tanto en entornos de servidor como en inferencia local optimizada.

El modelo es relevante por su especialización en un par lingüístico de bajos recursos: el newari cuenta con pocos recursos digitales y prácticamente no existe oferta de traducción de voz dedicada. Su acceso está restringido (gated) y la licencia se etiqueta como "ampixa-internal-pending-review", por lo que su uso comercial queda sujeto a la aprobación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiqueta "gemma" en los tags; pipeline declarado ASR) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se ofrecen pesos GGUF, lo que implica cuantizaciones derivadas, pero no se detallan) |
| Idiomas soportados | ne (nepalí), new (nepal bhasa / newari) |
| Licencia | ampixa-internal-pending-review (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors, ONNX, GGUF |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna más allá de las etiquetas del repositorio. La presencia de la etiqueta "gemma" y el tamaño de 7,5 mil millones de parámetros sugieren una base derivada de un transformer decoder-only de la familia Gemma, adaptado para tareas de voz y traducción. El pipeline declarado es automatic-speech-recognition, aunque las etiquetas incluyen también TTS, speech-translation y voice-assistant, lo que indica que el modelo cubre el ciclo completo de reconocimiento, traducción y síntesis.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco hay información sobre innovaciones técnicas como decodificación especulativa o atención lineal. Toda esta sección debe considerarse no disponible a partir de la información proporcionada.

## Capacidades

- Reconocimiento automático de voz (ASR) en nepalí y newari, según el pipeline declarado.
- Traducción de voz entre nepalí y newari (speech-translation), con salida presumiblemente en texto y/o audio.
- Síntesis de voz (TTS) para generar respuestas habladas, según la etiqueta correspondiente.
- Orientación a asistente de voz conversacional (voice-assistant, conversational).
- Soporte de los dos idiomas indicados: ne y new.
- Formatos de despliegue múltiples: safetensors para frameworks de inferencia, ONNX para runtime optimizado y GGUF para llama.cpp y ecosistema Ollama.
- Compatibilidad declarada con endpoints (endpoints_compatible).
- No se dispone de información sobre tool calling, function calling, razonamiento multi-paso, visión, audio de entrada adicional ni modo thinking.

## Casos de uso

- Traducción de voz en tiempo real entre hablantes de nepalí y newari: el modelo puede recibir audio en un idioma y devolver traducción hablada en el otro, adecuado para atención presencial en servicios públicos de Nepal.
- Asistencia en consultas administrativas y sanitarias: un asistente de voz que reconozca la lengua del usuario (ne o new) y responda en la otra, reduciendo barreras lingüísticas en ventanillas y centros de salud.
- Subtitulado y transcripción de contenido audiovisual en newari: el pipeline ASR permite generar transcripciones de grabaciones y emitir traducciones al nepalí para medios de comunicación.
- Digitalización de patrimonio oral: transcripción y traducción de grabaciones de tradición oral newari para archivos y proyectos lingüísticos, aprovechando el soporte específico del idioma.
- Integración en asistentes de voz para dispositivos locales: los pesos GGUF permiten desplegar el modelo en hardware modesto para aplicaciones de asistente sin conexión en zonas con conectividad limitada.
- Investigación lingüística comparada nepalí-newari: generación de pares de audio y texto alineados para estudios de fonética y traducción, dado el escaso material disponible en newari.
- Prototipos de atención al cliente telefónica: un sistema IVR que reconozca la lengua del llamante y derive o traduzca la conversación a un agente humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16): aproximadamente 15 GB para los 7,5 mil millones de parámetros, más overhead de activaciones y del componente de audio.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits (GGUF Q4): alrededor de 4,5-5,5 GB, estimaciones basadas en el tamaño de parámetros, no en mediciones publicadas.
- GPU recomendadas para servidor: A100 40/80 GB, H100, L40S o A10G para despliegue concurrente; una RTX 4090 (24 GB) permite fp16 con margen.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en fp16 y en GPUs de 8-12 GB mediante cuantización GGUF Q4/Q5, si bien el componente de audio puede añadir requisitos.
- Opciones de despliegue: llama.cpp u Ollama para los pesos GGUF; ONNX Runtime para los pesos ONNX; vLLM o TGI para safetensors si la arquitectura es compatible (no confirmado); endpoints compatibles según la etiqueta del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| ampixa/nepa-newa-translator | 7,5 B | No disponible | ne, new | ampixa-internal-pending-review | Restringido (gated) |
| Whisper large-v3 | 1,55 B | 30 s de audio | Multilingüe (incluye nepalí, no newari específico) | MIT | Abierto |
| SeamlessM4T v2 | ~2,3 B | No disponible | Multilingüe (sin garantía para newari) | CC-BY-NC 4.0 | Abierto |
| Gemma 2 9B (base textual) | 9 B | 8.192 tokens | Multilingüe | Gemma Terms | Abierto con condiciones |

No se dispone de datos de rendimiento comparativo del modelo frente a estas alternativas. La comparativa se limita a parámetros, cobertura idiomática y licencia, ya que no hay benchmarks publicados para el modelo de ampixa.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar las condiciones en Hugging Face; no es un modelo de descarga libre.
- Licencia "ampixa-internal-pending-review": el uso comercial no está autorizado de forma clara y queda pendiente de revisión por parte del autor; conviene contactar con ampixa antes de cualquier despliegue productivo.
- Cobertura idiomática muy limitada: solo nepalí y newari; no se debe esperar un comportamiento multilingüe general.
- Sin información sobre sesgos: no se han publicado evaluaciones de sesgo lingüístico, de género o dialectal; el newari tiene variantes regionales que pueden no estar cubiertas.
- Riesgo de alucinación en traducción: en pares de bajos recursos es frecuente la omisión, la paráfrasis libre o la invención de contenido; se recomienda validación humana en dominios sensibles (sanitario, legal).
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad (WER, BLEU, COMET) que permita comparar con alternativas.
- Sin datos de contexto ni de arquitectura detallada: dificulta planificar el despliegue y estimar límites de audio de entrada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni informes de terceros.
- Fecha de creación futura en los metadatos (2026-11-24): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/ampixa/nepa-newa-translator
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
