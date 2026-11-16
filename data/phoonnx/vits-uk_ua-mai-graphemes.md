# Phoonnx/vits-uk_ua-mai-graphemes

## Resumen

`vits-uk_ua-mai-graphemes` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, empaquetado por Phoonnx a partir del modelo original `tts_models--uk--mai--vits` publicado por Coqui en la versión 0.8.0 de su librería TTS. El modelo implementa la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema neuronal de síntesis de voz de extremo a extremo que convierte texto en forma de onda de audio directamente, sin necesidad de un vocoder separado. Está especializado en el idioma ucraniano (código `uk`, variante `uk-UA`) y utiliza una entrada basada en grafemas (caracteres del texto) en lugar de fonemas.

El modelo se distribuye como un artefacto ONNX dentro del ecosistema phoonnx, una librería de TTS basada en ONNX Runtime mantenida por TigreGotico, que también ofrece integración con OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`. El repositorio ocupa aproximadamente 0,1 GB, lo que lo hace ligero y apto para despliegues en entornos con recursos limitados. Su relevancia radica en que cubre un idioma con poca representación en el ecosistema TTS open source (ucraniano) y lo hace con una licencia permisiva BSD-3-Clause.

No se dispone de información detallada sobre el número de parámetros, la longitud de contexto (no aplica en el sentido de LLM) ni datos de entrenamiento más allá de que el modelo original fue entrenado por Coqui y que la voz se identifica como `M-AILABS`, lo que sugiere que el corpus de entrenamiento proviene del dataset M-AILABS. El modelo está pensado para síntesis de voz en tiempo real o casi real en aplicaciones de asistencia por voz, lectores de pantalla y agentes conversacionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantización | no disponible (se distribuye como ONNX; el grado de cuantización interno no se especifica) |
| Idiomas soportados | ucraniano (`uk`, variante `uk-UA`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (empaquetado para la librería phoonnx) |

## Arquitectura y entrenamiento

El modelo se basa en VITS, una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional condicionado por alineamiento monotónico (MAS, Monotonic Alignment Search), un decodificador generativo y un discriminador adversarial entrenado con pérdidas GAN, junto con una pérdida de reconstrucción espectrograma y una pérdida de duración. VITS produce directamente la forma de onda sin vocoder externo, lo que simplifica el pipeline de inferencia y reduce la latencia frente a arquitecturas en dos etapas (Tacotron + vocoder). El modelo aquí distribuido es una conversión a ONNX del checkpoint original de Coqui.

Respecto al entrenamiento, la model card indica que el modelo procede del release `v0.8.0_models` de Coqui TTS y que la voz se etiqueta como `M-AILABS`, lo que apunta a que el corpus de entrenamiento es el dataset M-AILABS en su porción ucraniana. No se especifican el número de horas de audio, el número de tokens ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). La entrada de texto se procesa mediante `GraphemePhonemizer` de la librería `scriptconv`, que normaliza el texto y lo convierte directamente en grafemas, sin pasar por un fonemizador basado en diccionario fonético.

## Capacidades

- Síntesis de voz (text-to-speech) de extremo a extremo en ucraniano a partir de texto en grafemas.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Normalización y conversión de texto de entrada mediante `scriptconv` (GraphemePhonemizer).
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx` para asistentes de voz.
- Ejecución sobre ONNX Runtime, lo que permite despliegue en CPU y GPU sin dependencias de PyTorch en tiempo de inferencia.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente (es un modelo puramente TTS).
- No soporta visión, audio de entrada ni modo de razonamiento (thinking mode).
- Capacidad multilingüe limitada: únicamente ucraniano.

## Casos de uso

- Asistentes de voz en ucraniano: integración en OVOS mediante `ovos-tts-plugin-phoonnx` para dotar de voz a un asistente doméstico que responda en ucraniano, aprovechando el formato ONNX para ejecución en dispositivos de bajos recursos.
- Lectores de pantalla y accesibilidad: conversión de texto a voz para aplicaciones de accesibilidad dirigidas a usuarios ucranianos, con un modelo ligero (0,1 GB) que puede ejecutarse localmente sin conexión.
- Generación de audiolibros y contenido narrado: síntesis por lotes de textos largos en ucraniano, dividiendo el texto en frases y llamando a `synthesize_wav` para cada segmento.
- Sistemas de anuncios y megafonía automatizada: generación dinámica de avisos en ucraniano en estaciones, aeropuertos o comercios, donde la latencia de un modelo VITS es adecuada para respuestas casi en tiempo real.
- Prototipado de interfaces conversacionales: uso como capa TTS en pipelines de chatbots de voz en ucraniano, combinado con un ASR y un LLM para construir un agente conversacional completo.
- Investigación en TTS de bajos recursos: base para experimentos de fine-tuning o comparación de arquitecturas VITS en un idioma con pocos recursos, gracias a la licencia permisiva BSD-3-Clause y al formato ONNX portable.
- Aplicaciones educativas de aprendizaje de ucraniano: generación de pronunciaciones de texto para herramientas de aprendizaje de idiomas, con la salvedad de que la entrada es por grafemas y no por fonemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y la arquitectura VITS, el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer con al menos 2 GB de VRAM, así como en CPU.
- GPU recomendadas: cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) es sobradamente suficiente; el modelo no requiere GPU de gama alta.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual e incluso en sistemas embebidos con ONNX Runtime.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, ONNX Runtime directamente; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Tamaño repo |
|---|---|---|---|---|---|
| `Phoonnx/vits-uk_ua-mai-graphemes` | ucraniano (uk-UA) | VITS | ONNX | BSD-3-Clause | 0,1 GB |
| Coqui `tts_models--uk--mai--vits` (original) | ucraniano (uk-UA) | VITS | PyTorch (checkpoint) | BSD-3-Clause | no disponible |
| Otros modelos VITS de la colección Phoonnx | varios idiomas | VITS | ONNX | según modelo | variable |
| Alternativas TTS multilingües (p. ej. modelos tipo XTTS de Coqui) | multilingüe | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas específicas para ucraniano no está disponible en la información proporcionada. El modelo original de Coqui es funcionalmente equivalente, pero requiere PyTorch y la librería TTS en lugar de ONNX Runtime.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre el corpus M-AILABS, puede reflejar sesgos de dominio, registro y hablantes de dicho corpus.
- Riesgo de alucinación: en TTS el riesgo se traduce en pronunciaciones incorrectas o artefactos acústicos ante texto fuera de dominio, siglas, números o préstamos; la entrada por grafemas puede producir pronunciaciones erróneas en palabras con ortografía irregular.
- Limitaciones de idioma: únicamente ucraniano; no soporta otros idiomas ni cambio de voz o hablante (el modelo parece ser de un solo hablante, aunque no se especifica explícitamente).
- Restricciones de licencia: BSD-3-Clause permite uso comercial, modificación y redistribución siempre que se conserve el aviso de copyright y la cláusula de no endorsement; conviene revisar la licencia del corpus M-AILABS para usos derivados.
- Caveat para producción: el modelo depende de la librería phoonnx en versión preliminar (`pip install --pre phoonnx`) y de `scriptconv`; la estabilidad de la API no está garantizada. El número de descargas (20) y de likes (0) es muy bajo, lo que indica escasa validación comunitaria.
- No se documentan métricas objetivas (MOS, WER de ASR inverso) ni comparativas de calidad frente a otros sistemas TTS en ucraniano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-uk_ua-mai-graphemes
- Modelo original de Coqui: https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--uk--mai--vits.zip
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio Coqui TTS: https://github.com/coqui-ai/TTS
