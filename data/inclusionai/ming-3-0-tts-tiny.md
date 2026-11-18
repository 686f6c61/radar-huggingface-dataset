# inclusionAI/Ming-3.0-tts-tiny

## Resumen

Ming-3.0-tts-tiny es un modelo de síntesis de voz (text-to-speech) multilingüe desarrollado por inclusionAI, construido sobre el backbone Ling V3 con una arquitectura de mezcla de expertos (MoE). El checkpoint contiene 7.9B parámetros totales con aproximadamente 1.3B activos por token, lo que lo sitúa en una categoría de eficiencia computacional interesante para un modelo de generación de audio. El repositorio incluye pesos fragmentados, código del modelo, tokenizador de audio, codificador de hablante y tokenizador de texto.

El modelo resuelve el problema de la síntesis de voz expresiva y controlable: además de la generación básica de habla, permite clonación de voz zero-shot a partir de un clip corto de referencia, diseño de voz mediante descripción en lenguaje natural, control libre de estilo y entonación, y control explícito de emoción, velocidad, tono y volumen. Soporta siete idiomas (chino, inglés, alemán, español, francés, coreano y japonés) además de dos dialectos chinos (sichuanés y cantonés), y ofrece 14 etiquetas en línea para sonidos paralingüísticos como respiración, tos, suspiro, risa o duda.

Es relevante ahora porque combina un backbone MoE de gran escala con activación reducida por token, lo que abarata la inferencia frente a modelos densos equivalentes, y porque su licencia MIT facilita el uso comercial. La distribución se realiza vía Hugging Face y ModelScope, aunque la inferencia requiere clonar el repositorio de GitHub del proyecto, ya que el repo de Hugging Face es solo para distribución del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts sobre backbone Ling V3 |
| Parametros totales | 8.981.004.468 (7.9B declarados por el autor) |
| Parametros activos | Aproximadamente 1.3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (runtime de referencia en bf16) |
| Idiomas soportados | Chino, inglés, alemán, español, francés, coreano, japonés; dialectos sichuanés y cantonés |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 18.0 GB), con variante ONNX en los tags |

## Arquitectura y entrenamiento

El modelo se apoya en el backbone Ling V3 con una arquitectura de mezcla de expertos: 7.9B parámetros totales con unos 1.3B activos por token. El repositorio incluye, además de los pesos fragmentados, el código de soporte del modelo, un tokenizador de audio, un codificador de hablante (speaker encoder) y un tokenizador de texto, lo que indica un pipeline completo de TTS que va del texto a tokens de audio y de ahí a la forma de onda. El runtime de referencia configura bf16, un bucle MoE portable y estado recurrente en fp32.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card tampoco detalla innovaciones como decodificación especulativa o atención lineal. Lo que sí se documenta es el protocolo de prompt `thinking_v1` y unos valores por defecto de generación (`cfg_scale=2.0`, `temperature=0`, `flow_steps=10`, `sigma=0.25`), que apuntan a un esquema de generación por flow matching con pasos de difusión reducidos.

## Capacidades

- Síntesis de voz multilingüe en chino, inglés, alemán, español, francés, coreano y japonés.
- Clonación de voz zero-shot a partir de un clip corto de referencia.
- Diseño de voz (Voice Design) a partir de una descripción de hablante en lenguaje natural, sin audio de referencia.
- Control libre de estilo y forma de locución mediante instrucciones (`freeform`).
- Control explícito de emoción, velocidad, tono y volumen.
- Voces integradas en chino e inglés (recomendadas: UK_George, US_Emma, 灵小柔 y 灵楷).
- Control de dialectos chinos: sichuanés (川渝话) y cantonés (广粤话).
- 14 etiquetas en línea para sonidos paralingüísticos (respiración, tos, suspiro, risa, vacilación, sorpresa, sonidos de pregunta/confirmación) en chino o inglés.
- Diálogo multi-hablante a partir de un guion y referencias de hablante (tarea `podcast`).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; es un modelo de generación de habla, no un LLM de propósito general.

## Casos de uso

- Doblaje y localización de contenidos: la tarea `multilingual` permite sintetizar el mismo texto en alemán, español, francés, coreano o japonés manteniendo una referencia de voz, lo que facilita adaptar un mismo vídeo o curso a varios mercados sin regrabar.
- Audiolibros y narración expresiva: con control de emoción, velocidad, tono y volumen, más las etiquetas paralingüísticas de respiración y suspiro, se puede generar narración con matices naturales en lugar de una lectura plana.
- Producción de pódcasts sintéticos: la tarea `podcast` acepta una referencia por hablante y un guion con prefijos `speaker_N:`, lo que permite generar diálogos multi-voz coherentes a partir de un texto.
- Asistentes de voz y atención al cliente: la clonación zero-shot y las voces integradas permiten desplegar una voz de marca consistente; el control de velocidad y emoción ayuda a adaptar el tono al contexto de la conversación.
- Accesibilidad y lectura de textos: conversión de documentos, artículos o interfaces a audio en siete idiomas, con control de velocidad para usuarios con dificultades de lectura.
- Creación de contenido para redes y publicidad: la tarea `voice_design` genera una voz a partir de una descripción en lenguaje natural, útil para prototipar locuciones sin disponer de un locutor.
- Preservación y generación en dialectos: la tarea `dialect` permite sintetizar en sichuanés y cantonés, útil para medios regionales, educación o aplicaciones de proximidad lingüística.
- Videojuegos y personajes: el control `freeform` y las etiquetas de emoción y sonidos permiten generar líneas de personaje con estilos diferenciados sin grabar a un actor para cada variante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El autor recomienda NVIDIA H800 para inferencia; es la única GPU mencionada explícitamente.
- El repo de pesos ocupa 18.0 GB en safetensors, lo que da una cota inferior del espacio en disco y de la memoria necesaria en bf16.
- Con 7.9B parámetros totales, la inferencia en bf16 requiere del orden de 16 GB solo para pesos, más el estado recurrente en fp32 y los componentes auxiliares (tokenizador de audio, codificador de hablante), por lo que no se garantiza su encaje en GPUs de consumo de 24 GB; no hay datos publicados de VRAM medida.
- Entorno de referencia: Python 3.10.15, PyTorch y torchaudio 2.7.1+cu118 (CUDA 11.8) y transformers 4.46.3, instalados desde `requirements-tiny.txt` en un entorno dedicado.
- Opciones de despliegue documentadas: API de Python `ming_tiny.MingTinyTTS` y CLI `infer_tiny.py` del repositorio de GitHub. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Ming-3.0-tts-tiny | 7.9B totales, ~1.3B activos (MoE) | no disponible | 7 idiomas + 2 dialectos | MIT | Clonación zero-shot, voice design, control paralingüístico |
| Alternativas de TTS multilingüe | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de modelos comparables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- La inferencia no es autónoma desde Hugging Face: requiere clonar el repositorio de GitHub y usar su código, dependencias fijadas y scripts; el repo de HF es solo distribución del checkpoint.
- El entorno de dependencias está muy fijado (Python 3.10.15, torch 2.7.1+cu118, transformers 4.46.3) y difiere del de la variante 0.5B, lo que complica la integración en stacks existentes.
- No se documentan datos de entrenamiento, composición del dataset ni procesos de alineación, por lo que no es posible evaluar sesgos de origen.
- Riesgo de alucinación y artefactos de audio inherente a los modelos generativos de habla; no hay métricas publicadas de calidad (MOS, WER, similitud de hablante).
- La clonación de voz plantea riesgos de suplantación de identidad y uso indebido; la licencia MIT no impone restricciones de uso, por lo que la responsabilidad ética y legal recae en el desplegador.
- El control de dialectos se limita a sichuanés y cantonés; el resto de variedades del chino no están cubiertas.
- Las etiquetas paralingüísticas en línea solo están disponibles en chino e inglés.
- No se especifica la longitud de contexto ni el límite de duración de audio generado por llamada.
- No hay datos publicados de latencia, throughput ni VRAM medida, lo que dificulta el dimensionamiento de producción.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/Ming-3.0-tts-tiny
- GitHub: https://github.com/inclusionAI/Ming-3.0-tts
- Blog y demos: https://nomorecoding.github.io/Ming-3.0-tts/
- ModelScope: https://modelscope.cn/models/inclusionAI/Ming-3.0-tts-tiny
- Requisitos de inferencia: https://github.com/inclusionAI/Ming-3.0-tts/blob/main/requirements-tiny.txt
- Catálogo de voces: https://github.com/inclusionAI/Ming-3.0-tts/blob/main/cookbooks/instruction_en.md#built-in-premium-voices
