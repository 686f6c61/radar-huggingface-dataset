# EllaPriest45/Audio8-TTS-0.1B

## Resumen

Audio8 TTS Preview 0.1B es un modelo de síntesis de voz (text-to-speech) de código abierto desarrollado por Audio8 AI, publicado originalmente en Hugging Face como `Audio8/Audio8-TTS-Preview-0.1b` y replicado en el repositorio `EllaPriest45/Audio8-TTS-0.1B`. Su principal característica es su tamaño compacto: el modelo generativo principal tiene aproximadamente 170 millones de parámetros, lo que lo convierte en uno de los sistemas de clonación de voz zero-shot más pequeños que existen. El objetivo declarado es hacer práctica la clonación de voz sin necesidad de modelos de cientos de miles de millones de parámetros.

El modelo utiliza una arquitectura propia denominada Audio8 Falcon H1, con dos ramas autoregresivas (una lenta que predice tokens semánticos y otra rápida que predice los codebooks acústicos). Soporta ocho idiomas, aunque el chino y el inglés son los principales, y los demás (alemán, español, francés, italiano, japonés y coreano) se consideran experimentales. Incluye un codec neuronal de 44,1 kHz integrado en el repositorio, por lo que no requiere checkpoints adicionales. La licencia es la `audio8-community-license-v1.0`, que permite uso comercial con limitaciones de ingresos.

La relevancia actual de este modelo reside en su tamaño reducido (el stack completo, incluyendo el codec, ocupa unos 290M parámetros), lo que permite ejecutarlo en GPUs de consumo y en entornos con recursos limitados, manteniendo una calidad de voz razonable según las métricas publicadas. Es una opción atractiva para desarrolladores que necesitan TTS multilingüe con clonación de voz sin depender de infraestructura de servidores grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio8 Falcon H1 (rama lenta autoregresiva + rama rápida autoregresiva) |
| Parametros totales | 169.779.904 (modelo principal, sin codec decoder) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2.048 posiciones empaquetadas de texto/audio |
| Tipos de cuantizacion | no especificado por el autor; se puede usar bf16, fp32 o cuantizaciones estándar de transformers |
| Idiomas soportados | chino, inglés (principales); alemán, español, francés, italiano, japonés, coreano (experimentales) |
| Licencia | audio8-community-license-v1.0 (con límite de ingresos para uso comercial) |
| Formato de pesos | safetensors (modelo principal y codec decoder) |

## Arquitectura y entrenamiento

La arquitectura Audio8 Falcon H1 combina dos ramas autoregresivas. La rama lenta (slow AR) tiene 24 capas con ancho 512, 8 cabezas de atención y 2 cabezas KV, y es la encargada de predecir los tokens semánticos del texto/audio. La rama rápida (fast AR) tiene 4 capas con las mismas dimensiones (ancho 512, 8 cabezas, 2 KV heads) y predice los codebooks acústicos condicionados al estado oculto de la rama lenta. El modelo usa 10 codebooks con 4.096 entradas cada uno, y el codec trabaja a 44,1 kHz con 2.048 muestras por frame (aproximadamente 21,5 frames por segundo). El codec decoder es un componente separado de aproximadamente 120M parámetros que se incluye en el repositorio como `codec.pth`.

No se proporcionan detalles específicos sobre el dataset de entrenamiento ni el número de tokens utilizados. Tampoco se menciona explícitamente si se usó RLHF o DPO, pero el repositorio GitHub menciona un pipeline de SFT (supervised fine-tuning) independiente, lo que sugiere que el entrenamiento se basó en ajuste supervisado. La innovación principal es la arquitectura compacta de doble rama que permite alcanzar una calidad de voz aceptable con un número de parámetros muy inferior al de otros sistemas TTS multilingües contemporáneos.

## Capacidades

- Generación de voz a partir de texto en ocho idiomas (chino, inglés, alemán, español, francés, italiano, japonés y coreano), con calidad principal en chino e inglés.
- Clonación de voz zero-shot: puede imitar la voz de un hablante a partir de un audio de referencia y su transcripción, sin necesidad de fine-tuning.
- Síntesis de voz sin clonación: si no se proporciona audio de referencia, genera voz con una identidad por defecto.
- Soporte de generación por lotes (batch inference) con audios de referencia o códigos pre-codificados.
- Integración con la librería transformers mediante código remoto (`trust_remote_code=True`).
- Codec neuronal integrado a 44,1 kHz, sin necesidad de componentes externos.
- No se documenta soporte de tool calling, agentes, visión ni otras capacidades multimodales; es exclusivamente un modelo de audio.

## Casos de uso

- Asistentes de voz multilingües: el modelo puede generar respuestas habladas en varios idiomas con una latencia baja gracias a su tamaño reducido, lo que lo hace adecuado para aplicaciones de asistente en dispositivos edge o en servidores con GPUs modestas.
- Doblaje de contenido audiovisual: la clonación zero-shot permite imitar voces de actores o locutores a partir de una muestra breve, facilitando la producción de doblajes automáticos en distintos idiomas.
- Audiolibros y narración: se puede sintetizar narración de larga duración con una voz consistente, usando una referencia de audio del narrador original.
- Accesibilidad: generación de voz para personas con discapacidad visual o dificultades de lectura, con la posibilidad de personalizar la voz del usuario.
- Prototipado rápido de interfaces de voz: los desarrolladores pueden integrar el modelo en pipelines de pruebas de concepto sin necesidad de servicios comerciales de TTS, gracias a su licencia permisiva con límite de ingresos.
- Educación y aprendizaje de idiomas: generación de ejemplos de pronunciación en ocho idiomas, con la opción de clonar la voz del profesor para mantener consistencia en los materiales.
- Sistemas de respuesta interactiva (IVR): integración en centralitas telefónicas para generar mensajes dinámicos en varios idiomas con la voz de un locutor específico.

## Benchmarks y rendimiento

Los datos de evaluación publicados corresponden a la tasa de error (WER/CER) en el conjunto de datos CV3, comparando el modelo con alternativas de mayor tamaño. No se han proporcionado métricas de similitud de voz (SIM) en la información disponible. La tabla siguiente reproduce los valores publicados en la model card (menor es mejor):

| Modelo | Parametros | zh | en | ja | ko | de | es | fr | it |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| **Audio8 TTS Preview 0.1B** | ~0.17B | 3.619 | 3.307 | 12.322 | 7.653 | 5.292 | 8.548 | 12.349 | 14.480 |
| Audio8 TTS Preview 0.6B | 0.6B | 3.205 | 3.128 | 7.205 | 4.223 | 3.447 | 3.641 | 8.790 | 4.790 |
| Fish S2 Pro | 4.6B | 3.600 | 3.493 | 5.139 | 4.111 | 3.605 | 2.972 | 8.600 | 4.229 |
| Higgs Audio v2 | 4.7B | 3.378 | 3.404 | 4.742 | 4.260 | 3.300 | 2.929 | 9.425 | 3.555 |
| CosyVoice3-1.5B | 1.5B | 3.91 | 4.99 | 7.57 | (dato incompleto) | - | - | - | - |

Los resultados muestran que el modelo 0.1B tiene un rendimiento competitivo en chino e inglés (incluso supera a CosyVoice3 en inglés), pero empeora notablemente en idiomas experimentales como japonés, francés e italiano. La tabla de escala publicada indica que el modelo es aproximadamente 10 veces más pequeño que Fish S2 Pro y 28 veces más pequeño que MOSS-TTS, con una pérdida de calidad esperable en los idiomas menos representados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo principal tiene ~170M parámetros. En bf16, ocupa aproximadamente 340 MB; el codec decoder de ~120M añade unos 240 MB. Con overhead de activaciones y buffers, la VRAM total para inferencia en lote pequeño se estima entre 1 y 2 GB. No se han publicado mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM y soporte CUDA es suficiente. Modelos como RTX 3060, RTX 4060, GTX 1660 Super o superiores pueden ejecutarlo sin problemas. Para uso en servidores, una A10 o T4 es más que suficiente.
- Compatibilidad con GPUs de consumo: sí, cabe en prácticamente cualquier GPU consumer moderna. Incluso podría ejecutarse en CPU con fp32, aunque con mayor latencia.
- Opciones de despliegue: el modelo se carga mediante `transformers` con `trust_remote_code=True`. No se documenta soporte oficial para vLLM, llama.cpp u Ollama, dado que es un modelo de audio con código personalizado. Se puede servir a través de una API propia usando FastAPI o similar, o mediante `text-generation-inference` si se adapta el código remoto.
- Latencia y throughput: no hay datos publicados. Dado el tamaño, se espera una generación de pocos segundos de audio en menos de un segundo en una GPU moderna, pero no se puede cuantificar sin mediciones.

## Comparativa con modelos similares

La siguiente comparativa se basa en los datos de escala y rendimiento publicados en la model card. Los modelos comparados son sistemas TTS multilingües con clonación de voz zero-shot.

| Modelo | Parametros (modelo principal) | Contexto | Idiomas | Licencia | Rendimiento CV3 (zh/en) |
|---|---:|---|---|---|---|
| **Audio8 TTS 0.1B** | ~0.17B | 2.048 | 8 (2 principales) | audio8-community-license-v1.0 | 3.619 / 3.307 |
| Audio8 TTS 0.6B | ~0.6B | no disponible | 8 | misma licencia | 3.205 / 3.128 |
| Fish S2 Pro | ~4.6B | no disponible | multilingüe | no disponible | 3.600 / 3.493 |
| Higgs Audio v2 | ~4.7B | no disponible | multilingüe | no disponible | 3.378 / 3.404 |
| CosyVoice3-1.5B | ~1.5B | no disponible | multilingüe | no disponible | 3.91 / 4.99 |

El modelo 0.1B ofrece un rendimiento comparable al de Fish S2 Pro en chino e inglés, pero con un coste computacional mucho menor. Sin embargo, en idiomas experimentales (ja, ko, fr, it) la calidad cae significativamente. La licencia `audio8-community-license-v1.0` incluye un límite de ingresos para uso comercial, lo que puede ser una restricción para empresas con facturación alta.

## Limitaciones y advertencias

- Los idiomas experimentales (alemán, español, francés, italiano, japonés y coreano) muestran tasas de error mucho más altas que el chino y el inglés, especialmente japonés (12.322) e italiano (14.480). No se recomienda su uso en producción para estos idiomas sin una evaluación exhaustiva.
- El modelo es pequeño y puede presentar artefactos de audio, especialmente en voces complejas o con ruido de fondo en la referencia de clonación. La calidad no alcanza la de sistemas de mayor tamaño como Higgs Audio v2 o CosyVoice3.
- La clonación de voz zero-shot requiere que la transcripción de referencia coincida exactamente con el contenido hablado del audio de referencia. Un desajuste degrada notablemente la calidad de la clonación.
- La licencia `audio8-community-license-v1.0` tiene un límite de ingresos para uso comercial. Es necesario revisar los términos exactos en el enlace de la licencia antes de desplegar el modelo en productos con facturación potencialmente alta.
- El modelo usa código remoto de Hugging Face (`trust_remote_code=True`), lo que implica ejecutar código no auditado por la comunidad. Se recomienda inspeccionar el código antes de usarlo en entornos de producción.
- No se documenta soporte para generación de audio en tiempo real (streaming); la generación es por lotes con una latencia no especificada.
- El contexto máximo de 2.048 posiciones puede limitar la generación de frases muy largas o la concatenación de múltiples turnos en una sola pasada.

## Enlaces

- Repositorio de Hugging Face (original): https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b
- Repositorio de Hugging Face (mirror, usado para esta ficha): https://huggingface.co/EllaPriest45/Audio8-TTS-0.1B
- Repositorio de GitHub: https://github.com/Audio8-AI/Audio8_TTS
- Demo de audio (escucha previa): https://audio8-ai.github.io/Audio8_TTS/0.1B/
- Licencia: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b/blob/main/LICENSE
- Artículo de análisis: http://creativeaishow.com/audio8-tts-0-1b-the-free-170m-ai-voice-cloning-model-that-fits-in-1-6-gb/
