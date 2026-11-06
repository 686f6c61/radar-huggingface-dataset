# Infinix-io/OmniVoice

## Resumen

OmniVoice es un modelo de síntesis de voz (text-to-speech) multilingüe de tipo zero-shot desarrollado por Infinix-io y publicado bajo el identificador `Infinix-io/OmniVoice` en Hugging Face. El modelo se presenta como capaz de cubrir más de 600 idiomas, con soporte para clonación de voz a partir de una muestra de audio corta y diseño de voz (voice design) sin necesidad de referencia. Está construido sobre una arquitectura de tipo diffusion language model, según declara el autor, y utiliza como modelo base Qwen/Qwen3-0.6B, del que hereda su componente lingüístico.

El modelo tiene 612.577.288 parámetros totales (algo más de 612 millones) según los pesos en safetensors, lo que lo sitúa en la gama de modelos compactos desplegables en hardware de consumo. El repositorio ocupa 3,3 GB y el pipeline declarado es `text-to-speech`. La relevancia actual reside en su cobertura idiomática extrema (más de 600 códigos ISO 639-3 en las etiquetas) y en la combinación de clonación y diseño de voz en un único modelo de tamaño reducido.

No obstante, la información pública disponible es limitada: la model card está truncada, no se especifican detalles de entrenamiento, benchmarks ni licencia, y el modelo registra 0 descargas y 1 like en el momento de la consulta. Esta ficha recoge exclusivamente los datos verificables y marca como "no disponible" todo aquello que no aparece en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion language model (según model card); modelo base Qwen/Qwen3-0.6B |
| Parametros totales | 612.577.288 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Más de 600 idiomas (códigos ISO 639-3 listados en la model card, p. ej. es, en, zh, ar, hi, fr, de, ja, ko, ru, pt, etc.) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-to-speech |
| Tamaño del repositorio | 3,3 GB |
| Librería | omnivoice |

## Arquitectura y entrenamiento

Según la model card, OmniVoice se construye sobre una arquitectura novedosa de tipo diffusion language model, descrita en el paper "OmniVoice: Towards Omnilingual Zero-Shot Text-to-Speech with Diffusion Language Models" (arXiv 2604.00688). El modelo parte de Qwen/Qwen3-0.6B como base, lo que sugiere que el componente de modelado lingüístico reutiliza un transformer decoder de 0,6 mil millones de parámetros, sobre el que se añadiría el mecanismo de difusión para la generación de tokens de audio. No se detalla en la información disponible cómo se integra exactamente el proceso de difusión con el backbone de Qwen3.

No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni otras técnicas de alineación. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal más allá de la propia arquitectura de difusión. La model card menciona "superior inference speed" como característica, pero sin cifras concretas.

## Capacidades

- Síntesis de voz multilingüe zero-shot en más de 600 idiomas, con cobertura de códigos ISO 639-3 que abarca lenguas de África, Asia, Europa, América y Oceanía.
- Clonación de voz (voice cloning) a partir de una muestra de audio de referencia corta, con calidad que el autor califica de state-of-the-art.
- Diseño de voz (voice design): generación de voces sintéticas sin necesidad de audio de referencia, presumiblemente mediante descripción o atributos de voz.
- Generación de habla de alta calidad según la model card, sin métricas objetivas publicadas en la información disponible.
- Inferencia rápida según el autor, aunque sin cifras de latencia o throughput disponibles.
- No se indica soporte de tool calling, function calling, agentes ni multi-step reasoning, al tratarse de un modelo TTS y no de un LLM conversacional.
- No se indica soporte de visión, audio de entrada más allá de la referencia para clonación, ni otras modalidades.

## Casos de uso

- **Locución multilingüe automatizada**: el modelo puede generar audio en más de 600 idiomas, lo que permite producir versiones localizadas de un mismo contenido (por ejemplo, un curso o una campaña) sin contratar voces nativas para cada lengua, usando el mismo texto traducido y una referencia de voz consistente.
- **Clonación de voz para accesibilidad**: a partir de una muestra corta de la voz de un usuario, se puede generar un sintetizador personal que le permita mantener su timbre en comunicaciones asistidas, siempre que la licencia y el consentimiento lo permitan.
- **Doblaje y postproducción de audio**: integrado en un pipeline de doblaje, el modelo puede generar pistas de voz en distintos idiomas manteniendo el estilo de la voz original mediante clonación, reduciendo el coste frente a estudios de doblaje tradicionales.
- **Audioguías y contenido turístico**: generación de narraciones en lenguas minoritarias o regionales (por ejemplo, variedades con códigos como ast, eu, gl) que a menudo quedan fuera de los TTS comerciales, con voice design para crear una voz de marca consistente.
- **Prototipado de asistentes de voz**: al ser un modelo de ~612 M de parámetros y 3,3 GB en safetensors, puede desplegarse en entornos de desarrollo para iterar sobre guiones y voces antes de pasar a producción, con la ventaja de su reducido tamaño.
- **Generación de voces sintéticas para videojuegos y animación**: el voice design permite crear voces de personajes sin depender de actores de doblaje para cada idioma, y la clonación permite mantener coherencia entre secuelas o expansiones.
- **Investigación en TTS multilingüe**: al estar basado en Qwen3-0.6B y emplear una arquitectura de difusión, sirve como banco de pruebas para estudiar la transferencia entre modelado lingüístico y generación de habla en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 612,6 M de parámetros, en precisión FP16 los pesos ocupan aproximadamente 1,2 GB; en FP32, unos 2,5 GB. A ello hay que sumar el coste del decodificador de audio y del proceso de difusión, no cuantificado en la información disponible. Una estimación conservadora sitúa el requisito total en el rango de 2 a 4 GB de VRAM en FP16, aunque no se confirma en la documentación.
- **GPU recomendadas**: por tamaño, el modelo debería caber en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB). Para despliegue en servidor, A100 o H100 ofrecerían margen sobrado, aunque no se aportan cifras de throughput.
- **¿Cabe en GPU de consumo?**: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM en FP16, y en configuraciones aún menores si se aplican cuantizaciones, aunque los tipos de cuantización no están documentados.
- **Opciones de despliegue**: la librería declarada es `omnivoice`, propia del proyecto; existe un Space en Hugging Face (k2-fsa/OmniVoice) y un notebook de Colab. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI, que además no son adecuados para un modelo TTS de difusión.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Clonación de voz | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OmniVoice (Infinix-io) | 612,6 M | 600+ | Sí (zero-shot) | no disponible | Hugging Face, Space, GitHub, Colab |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre modelos comparables (parámetros, contexto, rendimiento, licencia o disponibilidad) que permitan una comparación rigurosa con alternativas como XTTS, Bark, F5-TTS u otros TTS zero-shot multilingües. Se indica "no disponible" para no inventar cifras.

## Limitaciones y advertencias

- **Licencia no especificada**: la licencia aparece como "no disponible", lo que impide determinar si el uso comercial está permitido. Es un bloqueo crítico para cualquier despliegue en producción.
- **Riesgo de uso indebido de la clonación de voz**: la capacidad de clonar voces a partir de muestras cortas exige consentimiento explícito y mecanismos de verificación; sin ellos, el modelo puede emplearse para suplantación o deepfakes de audio.
- **Sesgos**: no se documentan sesgos conocidos, pero un modelo entrenado sobre datos multilingües desbalanceados probablemente presente peor calidad en lenguas de bajos recursos, aunque no hay datos que lo confirmen.
- **Alucinación en TTS**: en síntesis de voz, el equivalente a la alucinación es la generación de prosodia incorrecta, artefactos o pronunciación errónea, especialmente en textos con nombres propios, siglas o cambios de idioma dentro de una frase.
- **Contexto y longitud de entrada**: la longitud de contexto no está documentada, por lo que se desconoce cuánto texto puede sintetizar en una sola pasada.
- **Documentación incompleta**: la model card está truncada, no hay benchmarks ni detalles de entrenamiento, y el modelo registra 0 descargas, lo que sugiere que es un lanzamiento muy reciente y sin validación comunitaria.
- **Dependencia de la librería `omnivoice`**: al no ser una librería estándar del ecosistema, la integración en pipelines existentes puede requerir trabajo adicional.
- **Idiomas**: la lista de más de 600 códigos incluye lenguas con muy pocos hablantes; la cobertura declarada no garantiza calidad uniforme en todas ellas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinix-io/OmniVoice
- Paper (arXiv 2604.00688): https://huggingface.co/papers/2604.00688
- Repositorio GitHub: https://github.com/k2-fsa/OmniVoice
- Demo en Hugging Face Space: https://huggingface.co/spaces/k2-fsa/OmniVoice
- Página de demo: https://zhu-han.github.io/omnivoice
- Notebook de Colab: https://colab.research.google.com/github/k2-fsa/OmniVoice/blob/master/docs/OmniVoice.ipynb
- Modelo base Qwen/Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
