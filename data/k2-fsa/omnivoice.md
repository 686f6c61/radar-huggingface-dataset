# k2-fsa/OmniVoice

## Resumen

OmniVoice es un modelo de síntesis de voz (text-to-speech) desarrollado por el equipo Next-gen Kaldi de Xiaomi AI Lab, publicado bajo la organización k2-fsa. Se trata de un sistema de TTS zero-shot masivamente multilingüe que soporta más de 600 lenguas, lo que lo convierte en uno de los modelos de síntesis de voz con mayor cobertura idiomática disponibles en código abierto. El modelo permite clonar voces a partir de una breve muestra de audio de referencia y también diseñar voces nuevas mediante atributos de hablante.

La arquitectura se basa en un enfoque novedoso de "diffusion language model", combinando un modelo de difusión con una base de modelo de lenguaje (Qwen3-0.6B) para generar audio de alta calidad con una velocidad de inferencia notablemente rápida, con un factor de tiempo real (RTF) de 0,025 según datos publicados. Con aproximadamente 612 millones de parámetros, el modelo es relativamente ligero en comparación con otros sistemas de TTS neuronales, lo que facilita su despliegue en hardware de consumo.

OmniVoice resuelve el problema de la síntesis de voz multilingüe con clonación de voz de alta calidad, un área donde la mayoría de los modelos comerciales y de código abierto se limitan a unas pocas decenas de idiomas. Su relevancia actual radica en la demanda creciente de soluciones de voz localizadas, accesibles y de bajo coste para aplicaciones de contenido, educación y asistentes conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion language model (basado en Qwen/Qwen3-0.6B) |
| Parametros totales | 612.577.288 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Más de 600 lenguas (lista extensa de códigos ISO 639-3) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OmniVoice emplea una arquitectura híbrida de "diffusion language model", una combinación poco habitual que integra un modelo de difusión para la generación de audio con un modelo de lenguaje base (Qwen3-0.6B) como backbone. Este diseño permite generar formas de onda o representaciones acústicas de forma iterativa, en lugar de autoregresivamente, lo que explica su bajo RTF de 0,025. El modelo está entrenado específicamente para tareas de TTS zero-shot, lo que implica que puede sintetizar voz para hablantes no vistos durante el entrenamiento a partir de una referencia de audio corta.

No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El modelo base Qwen3-0.6B sugiere que se ha aprovechado un modelo de lenguaje preentrenado como punto de partida, pero la información disponible no especifica el proceso de adaptación ni las etapas de entrenamiento. El repositorio GitHub y el paper (arXiv 2604.00688) contienen la documentación técnica completa, aunque no se ha accedido a su contenido en esta ficha.

## Capacidades

- Síntesis de voz multilingüe en más de 600 lenguas, incluyendo lenguas minoritarias y de baja representación digital.
- Clonación de voz zero-shot: reproduce la voz de un hablante a partir de una muestra de audio de referencia de corta duración.
- Diseño de voz (voice design): permite crear voces personalizadas especificando atributos de hablante sin necesidad de audio de referencia.
- Generación de voz con alta velocidad de inferencia (RTF de 0,025), adecuada para aplicaciones en tiempo real o casi tiempo real.
- Soporte de audio de referencia variable: acepta muestras de voz de distintas duraciones y calidades para la clonación.
- Integración con el ecosistema k2-fsa: disponible como librería Python (omnivoice) con soporte para Hugging Face Spaces y Google Colab.

## Casos de uso

- Localización y doblaje de contenido audiovisual: el modelo puede generar voces en más de 600 idiomas, lo que permite doblar vídeos, series o documentales a lenguas minoritarias sin necesidad de actores de voz locales. Su capacidad de clonación facilita mantener la voz original del hablante en todas las versiones lingüísticas.
- Asistentes de voz multilingües: integrable en asistentes virtuales o chatbots con voz para atender a usuarios en su lengua materna, incluso en regiones con alta diversidad lingüística como África o el Sudeste Asiático. El bajo RTF permite respuestas casi instantáneas.
- Audiolibros y narración automatizada: permite convertir libros electrónicos o artículos en audiolibros con una voz consistente y natural, eligiendo entre voces clonadas o diseñadas. La cobertura de 600+ idiomas amplía el mercado de audiolibros a lenguas actualmente desatendidas.
- Accesibilidad para personas con discapacidad visual: los lectores de pantalla pueden beneficiarse de voces más naturales y multilingües, mejorando la experiencia de navegación y lectura para usuarios de todo el mundo.
- Atención al cliente automatizada: en centros de contacto, el modelo puede generar respuestas de voz personalizadas con la voz de un agente concreto o con una voz corporativa diseñada, manteniendo coherencia de marca en múltiples idiomas.
- Creación de contenido para redes sociales y marketing: los creadores pueden generar narraciones para vídeos, anuncios o podcasts en decenas de idiomas sin necesidad de estudio de grabación, clonando su propia voz o diseñando una voz de marca.
- Educación y e-learning: plataformas educativas pueden ofrecer contenido de audio en la lengua local de cada estudiante, con voces naturales que mejoran la retención y la comprensión.
- Videojuegos y mundos virtuales: los desarrolladores pueden generar diálogos para personajes no jugadores (NPC) en múltiples idiomas con voces únicas, reduciendo costes de grabación y localización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento conocido es el factor de tiempo real (RTF) de 0,025, reportado en aimodels.fyi, que indica que el modelo puede sintetizar audio 40 veces más rápido que el tiempo real en una GPU no especificada. No hay datos comparativos con otros modelos de TTS como OpenVoice, XTTS o Bark en términos de calidad perceptual (MOS), inteligibilidad o fidelidad de clonación.

## Requisitos de hardware

- VRAM estimada: con 612 millones de parámetros, el modelo en FP16 ocupa aproximadamente 1,2 GB de memoria, y en FP32 unos 2,4 GB. El tamaño del repositorio (3,3 GB) sugiere que se distribuyen pesos en FP32 o FP16 con overhead adicional.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para inferencia en FP16. Tarjetas como NVIDIA GTX 1650, RTX 3060, RTX 4060 o superiores son adecuadas. También puede ejecutarse en GPUs de datacenter como A10 o A100 para despliegues de alto rendimiento.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de gama media de consumo, lo que lo hace accesible para desarrolladores individuales y pequeñas empresas.
- Opciones de despliegue: la librería omnivoice permite integración en Python; se puede servir mediante Hugging Face Spaces, Google Colab o contenedores Docker. No se menciona soporte nativo para vLLM, llama.cpp u Ollama, dado que no es un LLM de texto sino un modelo TTS.
- Latencia y throughput: con un RTF de 0,025, un audio de 10 segundos se generaría en aproximadamente 0,25 segundos en la GPU de referencia, lo que permite procesamiento en tiempo real o por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Clonacion de voz | Licencia | Notas |
|---|---|---|---|---|---|
| OmniVoice | 612M | 600+ | Sí (zero-shot) | no disponible | Diffusion LM, RTF 0,025 |
| OpenVoice | ~100M (estimado) | ~20 | Sí (zero-shot) | MIT | Enfoque de separación de tono y timbre |
| XTTS v2 | ~467M | ~17 | Sí (zero-shot) | Coqui Public Model License | Basado en Tortoise, requiere GPU |
| Bark | ~1.2B | ~13 | No (solo voces predefinidas) | MIT | Modelo autoregresivo, más lento |

La comparativa se basa en datos públicos de cada modelo. OmniVoice destaca por su cobertura idiomática (600+ frente a menos de 20 en la mayoría de alternativas) y por su velocidad de inferencia, aunque la licencia no especificada es un factor de riesgo frente a alternativas con licencias permisivas como MIT.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio de Hugging Face no indica una licencia clara, lo que genera incertidumbre legal para uso comercial. Es recomendable contactar con los autores antes de desplegar el modelo en producción.
- Riesgo de alucinación acústica: como cualquier modelo generativo, puede producir artefactos o pronunciaciones incorrectas, especialmente en lenguas con pocos datos de entrenamiento.
- Sesgos de habla: el modelo puede reflejar sesgos presentes en los datos de entrenamiento, como acentos dominantes o variantes dialectales, lo que afecta a la naturalidad en ciertas regiones.
- Limitaciones de clonación: la calidad de la clonación depende de la calidad y duración de la muestra de referencia; muestras cortas o con ruido pueden degradar el resultado.
- Sin información sobre cuantización: no se documentan versiones cuantizadas (GGUF, AWQ, etc.), lo que limita el despliegue en entornos con restricciones de memoria.
- Dependencia de Qwen3-0.6B: al estar basado en un modelo de lenguaje concreto, las actualizaciones o cambios en el modelo base pueden afectar a la reproducibilidad.
- Documentación incompleta: no se han publicado detalles sobre el dataset de entrenamiento, lo que dificulta evaluar la cobertura real por lengua y la calidad en casos extremos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/k2-fsa/OmniVoice
- Repositorio GitHub: https://github.com/k2-fsa/OmniVoice
- Paper (arXiv 2604.00688): https://huggingface.co/papers/2604.00688
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/k2-fsa/OmniVoice
- Página de demostración: https://zhu-han.github.io/omnivoice
- Notebook de Google Colab: https://colab.research.google.com/github/k2-fsa/OmniVoice/blob/master/docs/OmniVoice.ipynb
