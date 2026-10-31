# chibubu/rhino-2_6

## Resumen

Rhino-2.6 (originalmente MiniCPM-o-2.6) es un modelo multimodal end-to-end de 8.675 millones de parámetros publicado en HuggingFace por el usuario chibubu. Se trata de un fork o re-publicación de MiniCPM-o-2.6, el modelo omni-modal desarrollado por OpenBMB (OpenBMB Lab, asociado a la Universidad de Tsinghua), orientado a la investigación en comprensión audiovisual, temporal grounding entre modalidades y conversación por voz en tiempo real.

El modelo destaca por ser "any-to-any": acepta texto, imágenes, audio y vídeo como entrada, y genera texto y audio como salida. Soporta conversación de voz en tiempo real con latencia baja, streaming multimodal en directo y clonación de voz end-to-end, algo poco habitual en modelos de este tamaño. Procesa imágenes de hasta 1,8 millones de píxeles en cualquier relación de aspecto.

Su relevancia actual radica en que ofrece capacidades omni-modales (comparables a GPT-4o en planteamiento) en un modelo de 8B que puede ejecutarse en hardware de consumo, con licencia Apache 2.0 que permite uso comercial. La versión publicada bajo el nombre Rhino-2.6 está pensada específicamente para investigación académica en razonamiento temporal multimodal y modelado audiovisual de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal end-to-end (basado en MiniCPM-o: LLM + codificador de visión SigLIP + codificador/decodificador de audio tipo Whisper, transformer decoder) |
| Parametros totales | 8.674.997.028 (verificado en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el LLM base de MiniCPM-o-2.6 soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible en la model card |
| Idiomas soportados | multilingüe (lista concreta no especificada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code en transformers) |

## Arquitectura y entrenamiento

Rhino-2.6 hereda la arquitectura de MiniCPM-o-2.6: un LLM decoder de 8B integrado con un codificador de visión (SigLIP) capaz de procesar imágenes de hasta 1,8 Mpx en cualquier relación de aspecto, y módulos de audio que permiten tanto comprensión (entrada de voz) como generación de voz end-to-end, incluyendo clonación de voz. El pipeline etiquetado en HuggingFace es `any-to-any`, lo que refleja la capacidad de ingerir y producir múltiples modalidades.

Los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la model card de esta publicación. En la versión original de OpenBMB, el modelo se entrenó sobre datos multimodales a gran escala con fases de alineación audiovisual y entrenamiento de conversación de voz en tiempo real, pero no se pueden confirmar cifras concretas a partir de la información proporcionada.

## Capacidades

- Comprensión y generación de texto (conversación multi-turno, razonamiento general)
- Comprensión de imágenes de alta resolución (hasta 1,8 millones de píxeles, cualquier relación de aspecto)
- Comprensión de vídeo (entrada)
- Comprensión y generación de audio: conversación de voz en tiempo real con streaming
- Clonación de voz end-to-end
- Streaming multimodal en directo (live streaming): procesamiento continuo de audio y vídeo
- Razonamiento temporal entre modalidades (audio-visual), foco declarado del fork
- Capacidades multilingües
- No hay evidencia en la model card de soporte nativo de tool calling o function calling

## Casos de uso

- Investigación en temporal grounding audiovisual: el modelo permite estudiar cómo se alinean eventos sonoros y visuales a lo largo del tiempo, su caso de uso declarado como fork.
- Asistentes de voz en tiempo real: gracias a la conversación de voz end-to-end con streaming, se puede construir un agente conversacional hablado sin necesidad de encadenar ASR + LLM + TTS.
- Clonación de voz para producción de contenido: puede generar audio con una voz concreta a partir de muestras, útil para locución de vídeos o audiolibros.
- Análisis de vídeo con consultas en lenguaje natural: procesa vídeo como entrada y responde preguntas sobre su contenido, útil para indexación y moderación de contenido audiovisual.
- OCR y comprensión de documentos escaneados: la entrada de imágenes de alta resolución (1,8 Mpx) permite extraer texto de capturas, documentos y pantallas.
- Subtitulado y accesibilidad: combinando entrada de audio/vídeo y salida de texto, se puede transcribir y describir contenido multimedia para usuarios con discapacidad auditiva o visual.
- Prototipado de agentes multimodales en local: con 8B de parámetros y licencia Apache 2.0, es adecuado para experimentar en hardware de consumo sin costes de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. (El modelo original MiniCPM-o-2.6 de OpenBMB publicó resultados en benchmarks como OpenCompass, MathVista, MME y otros, pero no constan en la model card de esta publicación y no se reproducen aquí para no atribuir cifras sin verificación directa.)

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia orientativa, un modelo de 8,7B en FP16 ocupa unos 17,4 GB de pesos (coincide con el tamaño del repo), por lo que se necesita una GPU con al menos 24 GB de VRAM para inferencia en precisión completa; con cuantización INT4 podría caber en GPUs de 12-16 GB (estimación, no dato oficial).
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para FP16; A100 o H100 para despliegue con carga concurrente. No disponible como dato oficial.
- Consumer GPU: probablemente viable en RTX 4090/3090 en precisión completa y en GPUs de 12-16 GB con cuantización (estimación).
- Opciones de despliegue: transformers (librería declarada, con custom_code). No se menciona soporte explícito de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible. El modelo original se promociona por su conversación de voz en tiempo real, pero no hay cifras en esta publicación.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Contexto | Licencia |
|---|---|---|---|---|
| Rhino-2.6 (MiniCPM-o-2.6) | 8,7B | texto, imagen, audio, vídeo (entrada); texto y audio (salida) | no disponible (32.768 tokens en el original, sin confirmar aquí) | Apache 2.0 |
| Qwen2.5-Omni-7B | 7B | texto, imagen, audio, vídeo (entrada); texto y voz (salida) | 32.768 tokens | Apache 2.0 (con restricciones en algunos componentes) |
| Qwen2-VL-7B | 8,3B | texto, imagen, vídeo (sin audio) | 32.768 tokens | Apache 2.0 |
| Llama 3.2 11B Vision | ~11B | texto e imagen (sin audio) | 128.000 tokens | Llama Community License (restricciones comerciales) |

Rhino-2.6 se diferencia de los alternativos de visión pura (Qwen2-VL, Llama 3.2 Vision) en su cadena completa de audio: escucha, habla y clona voces sin módulos externos, y es más pequeño que Llama 3.2 11B Vision.

## Limitaciones y advertencias

- La model card de esta publicación es muy escueta: faltan detalles de entrenamiento, benchmarks, contexto y requisitos de hardware, lo que dificulta una evaluación rigurosa antes de producción.
- El uso declarado es investigación académica; el autor no lo posiciona para despliegue productivo.
- Al ser una re-publicación de terceros (chibubu) del modelo original de OpenBMB, hay riesgo de divergencia respecto a los pesos oficiales verificados; conviene comparar hashes con el repositorio original de OpenBMB.
- Riesgo de alucinación típico de LLMs, agravado en tareas multimodales complejas (vídeo largo, audio ruidoso).
- Sesgos: no documentados en esta publicación; los modelos multimodales entrenados a gran escala suelen heredar sesgos de los datos web y de voz (acentos, idiomas infrarrepresentados).
- Idiomas: etiquetado como multilingüe sin lista concreta; el rendimiento en castellano no está documentado aquí.
- Licencia Apache 2.0: permite uso comercial, pero el uso de custom_code exige confiar en el código del repositorio al cargar el modelo.
- La clonación de voz plantea riesgos éticos y legales (suplantación, deepfakes) que deben gestionarse con consentimiento y salvaguardas.

## Enlaces

- HuggingFace: https://huggingface.co/chibubu/rhino-2_6
- Modelo original (referencia): https://huggingface.co/openbmb/MiniCPM-o-2_6
- No hay paper, blog ni demo enlazados en la informacion disponible.
