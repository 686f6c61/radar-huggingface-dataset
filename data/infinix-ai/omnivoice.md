# Infinix-ai/OmniVoice

## Resumen

OmniVoice es un modelo de síntesis de voz (text-to-speech) multilingüe y zero-shot desarrollado por Infinix-ai, construido sobre el modelo de lenguaje Qwen3-0.6B. Su propuesta principal es cubrir más de 600 idiomas y dialectos con una única arquitectura, algo que lo sitúa entre los sistemas TTS con mayor cobertura lingüística publicados hasta la fecha. El modelo combina clonación de voz a partir de una muestra corta de audio de referencia con capacidades de diseño de voz, es decir, la generación de timbres sintéticos sin necesidad de referencia.

La arquitectura sigue un enfoque de modelo de difusión con estilo de modelo de lenguaje, según describe el propio autor en el paper asociado (arXiv 2604.00688). Con 612,5 millones de parámetros totales y pesos en formato safetensors, el modelo está pensado para inferencia rápida y despliegue relativamente ligero en comparación con sistemas TTS de gran escala. El repositorio ocupa 3,3 GB.

Su relevancia actual reside en la combinación de cobertura lingüística extrema, clonación zero-shot de calidad y un tamaño contenido que facilita el despliegue. No obstante, la información pública disponible es todavía muy limitada: no hay licencia declarada, no se han publicado resultados de benchmarks en la ficha y el número de descargas y valoraciones es cero en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión con estilo de modelo de lenguaje (diffusion language model-style), construido sobre Qwen/Qwen3-0.6B |
| Parametros totales | 612.577.288 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Más de 600 códigos ISO 639-3, entre ellos aae, af, am, ar, as, az, be, bg, bn, ca, cs, cy, da, de, el, en, eo, es, et, eu, fa, fi, fil, fr, ga, gl, gu, ha, he, hi, hr, hu, hy, id, ig, is, it, ja, jv, ka, kk, km, kn, ko, lb, lo, lt, lv, mi, mk, ml, mn, mr, ms, mt, my, nb, ne, nl, nn, no, ny, oc, om, or, pa, pl, ps, pt, rm, ro, ru, rw, sa, sd, si, sk, sl, sn, so, sq, sr, sv, sw, ta, te, tg, th, ti, tk, tl, tr, tt, ug, uk, ur, uz, vi, wo, xh, yi, yo, yue, zh, zu |
| Licencia | No disponible |
| Formato de pesos | Safetensors |
| Pipeline | text-to-speech |
| Librería | omnivoice |
| Modelo base | Qwen/Qwen3-0.6B |
| Tamaño del repositorio | 3,3 GB |

## Arquitectura y entrenamiento

OmniVoice se apoya en Qwen/Qwen3-0.6B como modelo base y adopta una arquitectura de difusión con formato de modelo de lenguaje, según la descripción del autor. Este enfoque, habitual en modelos TTS recientes, trata la generación de audio como un proceso iterativo de denoising guiado por representaciones lingüísticas, en lugar de una síntesis autoregresiva token a token. El resultado declarado es una calidad de voz alta con una velocidad de inferencia superior a la de alternativas comparables.

El modelo está diseñado para funcionar en modo zero-shot: no requiere ajuste fino por hablante ni por idioma, sino que generaliza a partir de una referencia de audio corta (clonación) o de una descripción de voz (diseño de voz). La ficha del autor no detalla el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal. Toda esta información debe considerarse no disponible a partir de las fuentes consultadas.

## Capacidades

- Síntesis de voz multilingüe zero-shot en más de 600 idiomas y dialectos, con cobertura especialmente amplia de lenguas de bajos recursos.
- Clonación de voz a partir de una muestra corta de audio de referencia, sin entrenamiento adicional por hablante.
- Diseño de voz (voice design): generación de timbres sintéticos sin necesidad de audio de referencia.
- Generación de habla de alta calidad con velocidad de inferencia declarada como superior a la de modelos comparables.
- Soporte de los principales idiomas europeos y asiáticos, incluidos español, inglés, francés, alemán, italiano, portugués, chino, japonés, coreano, árabe e hindi.
- No se ha documentado soporte de tool calling, function calling, razonamiento multi-paso ni capacidades de agente, al tratarse de un modelo TTS y no de un modelo de lenguaje conversacional.
- No se ha documentado soporte de visión ni de audio de entrada más allá de la referencia de voz para clonación.

## Casos de uso

- Localización de contenidos audiovisuales: doblaje y subtitulado automático a más de 600 idiomas con una única instalación del modelo, lo que simplifica pipelines que antes requerían un modelo distinto por familia lingüística.
- Audiolibros y narración sintética: generación de voz natural a partir de texto largo, con la posibilidad de clonar la voz del autor o de un narrador profesional a partir de una muestra breve.
- Asistentes de voz para atención al cliente: síntesis en el idioma del usuario sin necesidad de entrenar voces específicas por mercado, reduciendo el coste de despliegue en regiones con lenguas minoritarias.
- Accesibilidad: conversión de texto a voz para lectores de pantalla y aplicaciones de asistencia a personas con discapacidad visual, con voces personalizables mediante clonación.
- Preservación lingüística: generación de audio en lenguas con pocos hablantes y escasos recursos digitales, gracias a la cobertura de códigos ISO 639-3 poco frecuentes en otros sistemas TTS.
- Prototipado de videojuegos y contenido interactivo: creación rápida de voces de personajes mediante diseño de voz, sin contratar actores para cada iteración de guion.
- Generación de contenido para marketing y redes sociales: producción de locuciones en múltiples idiomas y con distintos timbres a partir de un mismo texto base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 612,5 millones de parámetros en safetensors, una estimación orientativa en precisión FP16 rondaría 1,2-1,5 GB de pesos, más el overhead del runtime de audio y del modelo base; en cuantizaciones de 8 bits o 4 bits el consumo sería inferior, aunque el autor no documenta cuantizaciones soportadas.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo debería caber en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090, así como en A100 y H100 para despliegues de mayor throughput.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no hay confirmación oficial ni requisitos mínimos publicados.
- Opciones de despliegue: la librería propia es `omnivoice`; el autor publica un repositorio en GitHub, un Space en Hugging Face y un notebook de Google Colab. No se ha documentado soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: el autor declara una velocidad de inferencia superior a la de modelos comparables, pero no se han publicado cifras concretas de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Clonación zero-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OmniVoice | 612,5 M | Más de 600 | Sí | No disponible | Hugging Face, GitHub, Space, Colab |
| XTTS-v2 (Coqui) | No disponible en la información proporcionada | 17 | Sí | No disponible en la información proporcionada | No disponible en la información proporcionada |
| Bark (Suno) | No disponible en la información proporcionada | Multilingüe (sin cifra confirmada) | Limitada | No disponible en la información proporcionada | No disponible en la información proporcionada |
| CosyVoice 2 | No disponible en la información proporcionada | Multilingüe (sin cifra confirmada) | Sí | No disponible en la información proporcionada | No disponible en la información proporcionada |

No se dispone de datos verificados de parámetros, contexto ni rendimiento de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible. La ventaja diferencial documentada de OmniVoice es la cobertura de más de 600 idiomas, muy superior a la de los sistemas TTS multilingües habituales.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido, lo que supone un riesgo legal importante para producción.
- Ausencia de benchmarks publicados: no hay métricas objetivas de calidad de voz (MOS, similitud de hablante, WER) que permitan validar las afirmaciones del autor.
- Riesgo de uso indebido de la clonación de voz: la capacidad de clonar voces a partir de muestras cortas exige controles de consentimiento y medidas anti-suplantación de identidad.
- Cobertura lingüística desigual: aunque se declaran más de 600 idiomas, es previsible que la calidad varíe notablemente entre lenguas con muchos datos y lenguas de bajos recursos; el autor no publica desglose por idioma.
- Sesgos de voz: los timbres generados pueden reflejar sesgos de género, edad o acento presentes en los datos de entrenamiento, no documentados en la ficha.
- Modelo reciente y con poca tracción: cero descargas y cero valoraciones en el momento de la consulta, lo que reduce la validación comunitaria y el soporte disponible.
- Dependencia de una librería propia (`omnivoice`): no se ha documentado compatibilidad con ecosistemas estándar de inferencia, lo que puede complicar la integración en infraestructuras existentes.
- Longitud de contexto y límites de texto de entrada no documentados: se desconoce cuánto texto puede sintetizar el modelo en una sola pasada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinix-ai/OmniVoice
- Paper (arXiv 2604.00688): https://huggingface.co/papers/2604.00688
- Repositorio GitHub: https://github.com/k2-fsa/OmniVoice
- Demo en Hugging Face Space: https://huggingface.co/spaces/k2-fsa/OmniVoice
- Página de demo: https://zhu-han.github.io/omnivoice
- Notebook de Google Colab: https://colab.research.google.com/github/k2-fsa/OmniVoice/blob/master/docs/OmniVoice.ipynb
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
