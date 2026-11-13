# atraq/OmniVoice

## Resumen

OmniVoice es un modelo de síntesis de voz (text-to-speech) multilingüe de tipo zero-shot desarrollado por el grupo k2-fsa (el autor del repositorio en Hugging Face figura como `atraq`, pero la model card y los enlaces apuntan al ecosistema k2-fsa). Su rasgo diferencial es la cobertura de más de 600 idiomas, la más amplia entre los modelos TTS zero-shot publicados, junto con capacidades de clonación de voz a partir de una muestra corta de audio de referencia y de diseño de voz.

Técnicamente se construye sobre Qwen/Qwen3-0.6B como modelo base y emplea una arquitectura descrita por los autores como de tipo "diffusion language model", orientada a mejorar la velocidad de inferencia manteniendo calidad alta. El modelo tiene 612.577.288 parámetros totales y se distribuye en formato safetensors con un repositorio de 3,3 GB.

Es relevante ahora porque combina dos tendencias: por un lado, el uso de modelos de lenguaje pequeños como columna vertebral para tareas generativas no textuales; por otro, la demanda de TTS multilingüe que cubra idiomas de bajos recursos sin necesidad de entrenamiento específico por idioma. La ficha se basa únicamente en la información pública disponible; muchos detalles técnicos no están publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion language model sobre base Qwen3-0.6B (transformer) |
| Parámetros totales | 612.577.288 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | más de 600 (códigos ISO 639-3 listados en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-to-speech |
| Modelo base | Qwen/Qwen3-0.6B |
| Tamaño del repositorio | 3,3 GB |
| Librería | omnivoice |

## Arquitectura y entrenamiento

OmniVoice se apoya en Qwen/Qwen3-0.6B, un transformer decoder-only de 0,6 mil millones de parámetros, y lo adapta mediante fine-tuning a una arquitectura que los autores describen como "diffusion language model-style". En lugar de generar tokens de audio de forma autorregresiva clásica, el enfoque de difusión sobre representaciones discretas o continuas permite paralelizar parte del proceso de generación, lo que según la model card se traduce en una velocidad de inferencia superior.

La model card menciona explícitamente que el modelo soporta clonación de voz zero-shot y diseño de voz, y que cubre más de 600 idiomas. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal más allá de la propia arquitectura de difusión. El paper asociado (arXiv:2604.00688) es la fuente indicada para obtener estos detalles.

## Capacidades

- Síntesis de voz multilingüe zero-shot en más de 600 idiomas, con cobertura de lenguas de bajos recursos.
- Clonación de voz a partir de una referencia de audio corta, sin necesidad de fine-tuning por hablante.
- Diseño de voz (voice design): generación de voces con características controladas sin referencia de audio.
- Generación de habla de alta calidad con velocidad de inferencia mejorada gracias a la arquitectura de difusión.
- Integración como pipeline `text-to-speech` en el ecosistema de Hugging Face.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-step ni vision/audio más allá del propio TTS.

## Casos de uso

- **Localización de contenidos a más de 600 idiomas**: el modelo puede generar narraciones en lenguas que otros TTS no cubren, lo que resulta adecuado para medios, e-learning y organismos públicos que necesitan accesibilidad lingüística amplia sin entrenar un modelo por idioma.
- **Clonación de voz para audiolibros y podcasts**: a partir de una muestra corta del locutor, OmniVoice reproduce su timbre en nuevos textos, lo que permite escalar la producción de audio sin regrabar sesiones.
- **Atención al cliente con voz sintética personalizada**: las empresas pueden diseñar una voz de marca mediante voice design y usarla en IVR y asistentes telefónicos, manteniendo coherencia en todos los idiomas soportados.
- **Doblaje y postproducción audiovisual**: la clonación zero-shot permite sustituir diálogos manteniendo la identidad vocal del actor original, reduciendo costes frente al doblaje tradicional.
- **Accesibilidad y lectura de textos**: integración en lectores de pantalla y aplicaciones de accesibilidad que necesiten voces naturales en idiomas minoritarios.
- **Prototipado rápido de asistentes de voz**: al ejecutarse sobre una base de 0,6B parámetros, es viable desplegarlo en entornos de desarrollo con recursos moderados para iterar en experiencias conversacionales antes de pasar a producción.
- **Generación de datasets de audio sintético**: útil para aumentar corpus de ASR en idiomas con pocos datos, generando muestras controladas con voces diversas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 612 millones de parámetros en safetensors (probablemente fp32/bf16, dado el tamaño del repo de 3,3 GB), se requiere aproximadamente 2,5-3 GB en bf16 y en torno a 1,5 GB en cuantización de 8 bits. No se dispone de cifras oficiales de cuantización.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para bf16; RTX 3060/4060, RTX 4090, A100 y H100 son suficientes con holgura.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más.
- Opciones de despliegue: la librería `omnivoice` es la vía oficial; no se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles; la model card afirma velocidad de inferencia superior a modelos autorregresivos comparables, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Clonación zero-shot | Licencia | Formato |
|---|---|---|---|---|---|
| OmniVoice (atraq/k2-fsa) | 612,6 M | 600+ | Sí | no disponible | safetensors |
| XTTS-v2 (Coqui) | ~470 M | 17 | Sí | Coqui Public Model License | safetensors |
| Bark (Suno) | ~1 B | ~13 (multilingüe limitado) | Parcial | MIT | PyTorch |
| F5-TTS | ~330 M | ~2 (inglés/chino) | Sí | CC-BY-NC | safetensors |

OmniVoice destaca por la cobertura idiomática, muy superior a la de XTTS-v2, Bark o F5-TTS, y por su tamaño contenido, que facilita el despliegue. La comparación de rendimiento objetivo no puede realizarse porque no hay benchmarks publicados en la información disponible. La licencia no está especificada, lo que impide confirmar si el uso comercial está permitido.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de integrarlo en producción.
- Riesgo de alucinación y artefactos de audio: como todo TTS generativo, puede producir pronunciaciones incorrectas, ruidos o prosodia anómala, especialmente en idiomas con pocos datos.
- Sesgos de voz: la calidad de la clonación depende de la referencia; voces con acentos o registros poco representados en el entrenamiento pueden degradarse.
- Cobertura idiomática desigual: aunque se listan más de 600 idiomas, no se documenta la calidad por idioma; los de bajos recursos probablemente rindan peor.
- Sin datos de benchmarks: no hay evidencia pública de métricas objetivas (WER, MOS, similitud de hablante) en la información disponible.
- Uso dual y suplantación: la clonación de voz plantea riesgos de deepfakes y suplantación de identidad; es necesario aplicar consentimiento y marcas de agua en producción.
- Contexto y cuantizaciones no documentados: se desconoce la longitud máxima de texto por inferencia y las opciones de cuantización soportadas.

## Enlaces

- Hugging Face: https://huggingface.co/atraq/OmniVoice
- Modelo de referencia del autor: https://huggingface.co/k2-fsa/OmniVoice
- Paper: https://huggingface.co/papers/2604.00688
- Repositorio GitHub: https://github.com/k2-fsa/OmniVoice
- Demo en Hugging Face Space: https://huggingface.co/spaces/k2-fsa/OmniVoice
- Página de demostración: https://zhu-han.github.io/omnivoice
- Notebook de Colab: https://colab.research.google.com/github/k2-fsa/OmniVoice/blob/master/docs/OmniVoice.ipynb
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
