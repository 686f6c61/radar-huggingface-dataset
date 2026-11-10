# orbbit-AI-026/Haro-voice-enrollment-AI

## Resumen

Haro-voice-enrollment-AI es un modelo de clonación de voz desarrollado por orbbit-AI-026 para el producto Hi Chat, cuyo asistente recibe el nombre de Haro. El modelo toma una muestra corta de audio de una persona y genera una representación de su timbre que permite sintetizar voz con esa identidad, de modo que Haro hable con la voz del usuario. La model card es extremadamente escueta: se limita a indicar la licencia y a remitir a los ficheros `LICENSE` y `NOTICE`, donde se recogen los avisos de autoría del modelo de origen.

El repositorio contiene 1.928.677.440 parámetros en formato safetensors (aproximadamente 1,93 mil millones) y ocupa 4,5 GB, lo que es coherente con pesos en precisión de 16 bits. El tag de Hugging Face `qwen3_tts` indica que el modelo deriva de la familia Qwen3-TTS, un sistema de síntesis de voz de Alibaba, y que esta variante se ha especializado en la tarea de enrollment (registro o clonación) de voz. La licencia declarada es Apache 2.0.

Su relevancia es limitada y muy específica: es un componente de producto más que un modelo de propósito general, con cero descargas y un único "like" en el momento de la consulta. No se han publicado especificaciones de contexto, idiomas, datos de entrenamiento ni resultados de benchmarks, por lo que cualquier evaluación rigurosa exige inspeccionar los pesos y los ficheros auxiliares del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag de Hugging Face: `qwen3_tts`; derivado de la familia Qwen3-TTS) |
| Parametros totales | 1.928.677.440 (~1,93 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el tamaño de 4,5 GB sugiere fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna en la model card. El tag `qwen3_tts` de Hugging Face vincula el modelo con Qwen3-TTS, la familia de síntesis de texto a voz de Qwen (Alibaba), lo que sugiere una arquitectura de TTS neuronal con un módulo de codificación de hablante o de embedding de voz para la tarea de enrollment. El recuento de parámetros (1,93 mil millones) y el tamaño del repositorio (4,5 GB) son compatibles con un modelo de tamaño medio en precisión de 16 bits, pero no permiten deducir la topología exacta ni si incorpora componentes de codec neural, difusión o transformer autorregresivo.

Tampoco hay datos sobre el corpus de entrenamiento: número de horas de audio, idiomas, composición del dataset, ni si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO. La model card remite a un fichero `NOTICE` con los avisos de autoría del modelo de origen, lo que confirma que se trata de un derivado ajustado sobre una base preexistente, pero no detalla el proceso de adaptación ni el volumen de datos de enrollment utilizados.

## Capacidades

- Clonación de voz a partir de una muestra corta de audio (voice enrollment): el modelo extrae una representación del hablante para condicionar la síntesis.
- Síntesis de voz (text-to-speech) con la identidad vocal clonada, orientada a que el asistente Haro de Hi Chat hable con la voz del usuario.
- Integración en un producto conversacional (Hi Chat), presumiblemente dentro de un pipeline de TTS más amplio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (la model card no declara idiomas).
- Capacidades especiales (modo thinking, visión, audio de entrada adicional): no disponible.

## Casos de uso

- Personalización de asistentes conversacionales: el modelo permite que un asistente tipo Hi Chat responda con la voz del propio usuario, clonada a partir de una muestra corta, lo que mejora la familiaridad y la accesibilidad de la interacción.
- Accesibilidad para personas con discapacidad del habla: a partir de muestras de voz conservadas, se puede reconstruir una voz personal para comunicarse mediante síntesis, siempre que se cumplan los requisitos legales de consentimiento.
- Producción de contenido en audio: generación de locuciones con una voz concreta y consistente para vídeos, pódcast o audiolibros, evitando contratar una locución para cada pieza.
- Doblaje y localización: mantener la identidad vocal de un hablante a través de distintas piezas o idiomas, si el modelo base lo permite (dato no confirmado).
- Pruebas de concepto de voice cloning en investigación: al ser un modelo de 1,93 mil millones de parámetros con licencia Apache 2.0, sirve como base reproducible para experimentos de enrollment y evaluación de similitud de hablante.
- Integración en pipelines de TTS de producto: al publicarse en safetensors y con licencia permisiva, puede desplegarse como etapa de condicionamiento de voz dentro de un servicio de síntesis ya existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16/bf16, el modelo requiere aproximadamente 3,9 GB solo para los pesos; en la práctica, entre 5 y 6 GB de VRAM para inferencia con overhead de activaciones y buffers.
- Cuantización: al no publicarse variantes GGUF ni cuantizadas, no hay cifras oficiales; una cuantización a 8 bits reduciría los pesos a unos 2 GB y a 4 bits a unos 1 GB, pero requeriría convertir los safetensors por cuenta propia.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, RTX 4090) debería poder alojar los pesos en fp16; para producción con concurrencia se recomienda A10G, L4, A100 o H100.
- Cabe en GPU consumer: sí, previsiblemente en modelos con 8 GB o más de VRAM.
- Opciones de despliegue: no se documentan en la model card. Al ser safetensors derivados de Qwen3-TTS, el despliegue probablemente requiera el código de inferencia de esa familia; no hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Haro-voice-enrollment-AI | ~1,93 mil millones | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Derivado de Qwen3-TTS, especializado en enrollment |
| Qwen3-TTS (familia base) | no disponible | no disponible | no disponible | Hugging Face (Qwen) | Modelo de origen del que deriva este ajuste |
| Alternativas de voice cloning open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas; los datos de parámetros, contexto y rendimiento de los modelos comparables no están disponibles en la documentación consultada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero un modelo de clonación de voz hereda los sesgos de su corpus de entrenamiento en cuanto a acentos, géneros y variedades lingüísticas.
- Riesgo de alucinación entendido como artefactos de síntesis: posible inestabilidad prosódica, ruido o pérdida de similitud con muestras de enrollment de baja calidad o muy cortas.
- No se declaran idiomas soportados, por lo que no puede asumirse cobertura multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el fichero `NOTICE` contiene avisos de autoría del modelo de origen que deben conservarse; conviene revisar también las condiciones de la familia Qwen3-TTS subyacente.
- Riesgo legal y ético del voice cloning: es imprescindible obtener consentimiento explícito del hablante cuya voz se clona y cumplir la normativa aplicable (RGPD y regulación europea de IA); el uso para suplantación o fraude está prohibido.
- El modelo tiene cero descargas y un único "like", sin validación externa ni benchmarks publicados; no debería desplegarse en producción sin una evaluación propia de calidad y seguridad.
- No se documentan requisitos de hardware ni opciones de despliegue, lo que incrementa el coste de integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orbbit-AI-026/Haro-voice-enrollment-AI
- Ficheros de licencia y avisos del repositorio: `LICENSE` y `NOTICE` en la raíz del repositorio de Hugging Face (no se proporcionan URL directas en la información disponible).
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
