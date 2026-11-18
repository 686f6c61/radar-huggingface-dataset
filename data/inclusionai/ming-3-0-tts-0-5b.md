# inclusionAI/Ming-3.0-tts-0.5B

## Resumen

Ming-3.0-tts-0.5B es un modelo de síntesis de voz (text-to-speech) multilingüe desarrollado por inclusionAI (Ant Group). Se trata de un checkpoint denso construido sobre el backbone Qwen2.5-0.5B que integra en un único paquete el backbone, una cabeza DiT (Diffusion Transformer), un tokenizador de audio, un codificador de hablante y un tokenizador de texto. El modelo resuelve la generación de voz de alta fidelidad a 44,1 kHz con clonación zero-shot, diseño de voz a partir de descripciones en lenguaje natural y control libre del estilo de locución.

Su relevancia actual radica en que combina en un modelo de apenas 0,5B parámetros capacidades que habitualmente requieren sistemas mucho mayores: clonación de voz con un clip corto de referencia, control explícito de emoción, velocidad, tono y volumen, 14 etiquetas inline para sonidos paralingüísticos (respiración, tos, suspiro, risa, duda) y soporte de dialectos chinos (sichuanés y cantonés). Soporta siete idiomas (chino, inglés, alemán, español, francés, coreano y japonés) bajo licencia MIT, lo que facilita su adopción comercial.

El repositorio de Hugging Face contiene únicamente los pesos para distribución: la inferencia requiere clonar el repositorio de GitHub del proyecto, que proporciona el código, las dependencias y las APIs de Python y CLI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, backbone Qwen2.5-0.5B con cabeza DiT, tokenizador de audio, codificador de hablante y tokenizador de texto |
| Parametros totales | 1.479.454.868 (según safetensors); la model card indica 0,5B para el backbone |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Chino, inglés, alemán, español, francés, coreano y japonés; dialectos sichuanés y cantonés |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |
| Frecuencia de muestreo | 44,1 kHz |
| API Python | `ming_tts.MingTTS` |
| CLI | `infer.py` |
| Hardware probado | NVIDIA H800-80GB y H20-96G con CUDA 12.4 |

## Arquitectura y entrenamiento

El modelo es un sistema denso que combina un backbone de lenguaje Qwen2.5-0.5B con una cabeza de difusión basada en DiT para la generación de audio. El checkpoint empaqueta de forma conjunta el backbone, la cabeza DiT, el tokenizador de audio, el codificador de hablante y el tokenizador de texto, de modo que el pipeline completo de síntesis queda contenido en un único repositorio de 3,0 GB. La salida se genera a 44,1 kHz, una frecuencia superior a la habitual en muchos sistemas TTS open source.

El texto de entrada se normaliza mediante gramáticas FST (números, fechas, unidades y símbolos), para lo cual se requiere `pynini` o bien desactivar la normalización con `--no_text_normalization`. La inferencia usa `flash-attn` de forma opcional, con fallback a PyTorch SDPA. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz multilingüe en chino, inglés, alemán, español, francés, coreano y japonés.
- Clonación de voz zero-shot a partir de un clip corto de referencia.
- Diseño de voz (Voice Design) a partir de una descripción del hablante en lenguaje natural.
- Control libre del estilo de locución y de la forma de hablar (tarea `FREEFORM`).
- Control explícito de emoción, velocidad, tono y volumen.
- 14 etiquetas inline para respiración, tos, suspiro, risa, duda, sorpresa y sonidos de pregunta o confirmación, en chino o inglés.
- Voces integradas en chino e inglés (recomendadas: UK_George, US_Emma, 灵小柔 y 灵楷).
- Control de dialectos: sichuanés y cantonés (tarea `DIALECT`, sin language ID).
- Tareas soportadas: `TTS`, `FREEFORM`, `VOICE_DESIGN`, `MULTILINGUAL`, `BASIC`, `EMOTION`, `DIALECT` e `IP`.
- No se ha documentado soporte de tool calling ni de razonamiento multi-paso, al tratarse de un modelo de síntesis de voz.

## Casos de uso

- Audiolibros y narración automatizada: el modelo sintetiza texto largo con control de velocidad, tono y emoción, y permite mantener una voz consistente mediante clonación zero-shot a partir de un clip del narrador.
- Doblaje y localización de contenido: con soporte para siete idiomas y dialectos chinos, se puede generar la pista de voz en español, francés, alemán, coreano o japonés usando la misma referencia de hablante.
- Asistentes de voz y atención al cliente: la salida a 44,1 kHz y las etiquetas paralingüísticas (suspiro, duda, confirmación) permiten generar respuestas habladas con una prosodia más natural en sistemas conversacionales.
- Accesibilidad y lectura de pantalla: conversión de texto a voz de alta calidad para usuarios con discapacidad visual, con control de velocidad y volumen adaptado a cada usuario.
- Creación de contenido y podcasting: diseño de voces nuevas mediante descripción en lenguaje natural (Voice Design) sin necesidad de grabar un hablante de referencia.
- Prototipado de personajes y videojuegos: asignación de voces diferenciadas por personaje mediante `ip` de voces integradas o descripciones libres, con control de emoción para escenas concretas.
- Generación de voces para vídeos cortos y redes sociales: la licencia MIT y el tamaño reducido del checkpoint facilitan el despliegue en infraestructura propia sin costes de licencia.

## Benchmarks y rendimiento

La model card referencia comparativas de rendimiento en el README del proyecto de GitHub, con evaluación zero-shot sobre el testset Seed-TTS (seed-tts-eval-zh y seed-tts-eval-en) usando WER como métrica principal. Sin embargo, los datos numéricos concretos no están disponibles en la información proporcionada, por lo que no se presentan cifras.

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- El proyecto ha sido probado en NVIDIA H800-80GB y H20-96G con CUDA 12.4.
- El checkpoint ocupa 3,0 GB en el repositorio, por lo que los pesos en precisión original caben holgadamente en GPUs de consumo con 8-12 GB de VRAM; la VRAM real de inferencia depende del runtime y de los componentes auxiliares (tokenizador de audio, codificador de hablante, cabeza DiT).
- No se dispone de datos oficiales sobre si cabe en GPUs de consumo concretas ni sobre cuantizaciones disponibles para reducir VRAM.
- Opciones de despliegue: el repositorio de GitHub del proyecto (`infer.py` y API `ming_tts.MingTTS`); no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI.
- `flash-attn` es opcional; sin él se usa PyTorch SDPA.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks numéricos de modelos comparables en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parámetros | Idiomas | Clonación zero-shot | Licencia | Formato |
|---|---|---|---|---|---|
| Ming-3.0-tts-0.5B | 0,5B (backbone) / 1,48B totales | 7 idiomas + 2 dialectos | Sí | MIT | safetensors, ONNX |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio de Hugging Face no es autónomo para inferencia: es obligatorio clonar el repositorio de GitHub y usar su código y dependencias.
- La clonación de voz y el diseño de voz conllevan riesgos de suplantación de identidad y uso fraudulento; es responsabilidad del desplegador aplicar controles de consentimiento y marcas de agua.
- No se han documentado sesgos específicos del modelo ni tasas de alucinación o errores de pronunciación por idioma.
- La tarea `FREEFORM` no puede combinarse con diseño de voz, voz integrada, emoción, dialecto ni controles de atributos.
- La tarea `MULTILINGUAL` exige `language_id` para alemán, español, francés, coreano y japonés; `DIALECT` no acepta language ID.
- La normalización de texto requiere `pynini` (versión 2.1.6 probada); sin ella debe desactivarse explícitamente.
- La licencia MIT permite uso comercial, pero no se especifican restricciones adicionales de uso responsable en la información disponible.
- No hay datos publicados sobre longitud máxima de texto de entrada ni sobre el comportamiento en contextos muy largos.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5B
- GitHub: https://github.com/inclusionAI/Ming-3.0-tts
- Blog y demos: https://nomorecoding.github.io/Ming-3.0-tts/
- ModelScope: https://modelscope.cn/models/inclusionAI/Ming-3.0-tts-0.5b
- Cookbook de tareas: https://github.com/inclusionAI/Ming-3.0-tts/blob/main/cookbooks/instructions.md
- Catálogo de voces: https://github.com/inclusionAI/Ming-3.0-tts/blob/main/cookbooks/instruction_en.md#built-in-premium-voices
