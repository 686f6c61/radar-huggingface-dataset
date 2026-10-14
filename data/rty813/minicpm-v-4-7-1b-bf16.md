# rty813/MiniCPM-V-4.7-1B-bf16

## Resumen

MiniCPM-V-4.7-1B-bf16 es un port en precisión completa (bf16) del modelo multimodal openbmb/MiniCPM-V-4.7-1B, publicado por el usuario rty813. Se trata de una conversión a PyTorch del checkpoint original, pensada para usuarios de vLLM, TGI, Xinference y transformers que prefieren evitar las cuantizaciones GGUF. No es un entrenamiento nuevo: la arquitectura es idéntica al modelo base de OpenBMB y funciona como sustituto directo mediante `AutoModelForCausalLM.from_pretrained`.

El modelo base pertenece a la serie MiniCPM-V de OpenBMB y corresponde a la variante de 1B (aproximadamente 1.000 millones de parámetros) de la versión 4.7. Es un modelo multimodal de tipo image-text-to-text, con capacidades de comprensión de imagen única, múltiples imágenes y vídeo, orientado a inferencia en dispositivo (on-device) y con codificación visual eficiente.

Su relevancia actual reside en la relación rendimiento-eficiencia: según la model card, la variante 1B mejora las capacidades base respecto a MiniCPM-V 4.6 y supera de forma sustancial a Qwen3.5 0.8B en puntuación global y eficiencia de inferencia, aunque no se aportan cifras concretas. El repositorio tiene 0 descargas y 0 likes, y fue creado el 13 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); codificador visual con compresión temprana intra-ViT (LLaVA-UHD v4) |
| Parametros totales | Aproximadamente 1.000 millones (variante 1B; cifra exacta no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (precisión completa) en este repositorio; existen cuantizaciones GGUF del modelo original |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | pytorch_model.bin (bf16); conversión a safetensors en proceso |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal que combina un codificador visual con un modelo de lenguaje. La innovación técnica destacada por la model card es la técnica de compresión temprana intra-ViT procedente de LLaVA-UHD v4, que comprime los tokens visuales dentro del propio codificador de visión. Según el autor original, esto reduce el coste computacional asociado a la codificación visual, lo que resulta clave para la inferencia en dispositivo. No se detalla en la información disponible la composición del dataset de entrenamiento, el número de tokens usados ni si se aplicaron fases de RLHF o DPO.

Este repositorio concreto es un port de precisión completa: reproduce la arquitectura del modelo original sin modificaciones y solo cambia el empaquetado de los pesos a PyTorch en bf16. Por tanto, sus propiedades de entrenamiento son las del checkpoint original de OpenBMB; la model card del port no añade información propia sobre el proceso de entrenamiento, y está truncada en la sección de arquitectura eficiente, por lo que no se dispone del resto de detalles técnicos.

## Capacidades

- Comprensión de imagen única (image-text-to-text).
- Comprensión de múltiples imágenes dentro de una misma conversación.
- Comprensión de vídeo.
- Generación de texto asociada a entradas multimodales.
- Codificación visual eficiente orientada a dispositivos con recursos limitados.
- Inferencia en precisión completa bf16 para integrarse en vLLM, TGI, Xinference y transformers.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistentes visuales en dispositivo: al ser una variante de 1B pensada para on-device, puede desplegarse en portátiles o equipos de gama media para describir imágenes o responder preguntas sobre fotografías locales sin enviar datos a la nube.
- Accesibilidad: descripción automática de imágenes para usuarios con discapacidad visual, ejecutándose localmente con baja latencia gracias al reducido tamaño del modelo.
- Análisis de documentos escaneados: extracción de información de capturas, facturas o formularios a partir de la imagen, integrándose vía transformers o vLLM en un pipeline de back office.
- Moderación de contenido visual: clasificación y descripción de imágenes subidas por usuarios en plataformas, con la ventaja de poder ejecutarse en la propia infraestructura gracias a la licencia apache-2.0.
- Comprensión de vídeo para resúmenes: generación de descripciones o resúmenes de clips cortos en aplicaciones de catalogación de medios.
- Asistentes multimodales conversacionales: integración en chatbots que reciben imágenes y mantienen diálogo multi-turno, desplegados con vLLM o Xinference.
- Prototipado e investigación: sustitución directa del checkpoint original en experimentos académicos sobre eficiencia de MLLM, al poder cargarse con `AutoModelForCausalLM.from_pretrained` y en vLLM.
- Inferencia en el borde (edge): despliegue en hardware modesto donde un modelo multimodal mayor no cabría, aprovechando la compresión temprana de tokens visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo original únicamente afirma de forma cualitativa que la variante 1B en modo Instruct mejora las capacidades base frente a MiniCPM-V 4.6 y supera sustancialmente a Qwen3.5 0.8B en puntuación global y eficiencia de inferencia, pero el fragmento disponible se interrumpe antes de mostrar las tablas de evaluación, por lo que no se incluyen cifras (MMLU, HumanEval, GSM8K u otras) y no deben darse por supuestas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 3-4 GB contando pesos (aproximadamente 2 GB para 1B parámetros a 2 bytes por parámetro), codificador visual y activaciones; cifra estimada, no confirmada por el autor.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090 funcionan con holgura. En datacenter, A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, es uno de los objetivos declarados del modelo (on-device y lightweight).
- Opciones de despliegue: transformers (`AutoModelForCausalLM.from_pretrained`), vLLM (`vllm serve rty813/MiniCPM-V-4.7-1B-bf16`), TGI, Xinference (buscando "MiniCPM-V-4.7-1B") y llama.cpp/Ollama mediante las cuantizaciones GGUF del modelo original.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-bf16 (este) | ~1B | No disponible | Imagen, multi-imagen, video, texto | apache-2.0 | HF (repo rty813) |
| openbmb/MiniCPM-V-4.7-1B | ~1B | No disponible | Imagen, multi-imagen, video, texto | apache-2.0 | HF (repo original) |
| MiniCPM-V 4.6 | No disponible | No disponible | Multimodal | No disponible | HF |
| Qwen3.5 0.8B | ~0,8B | No disponible | No disponible | No disponible | HF |

La model card afirma una mejora sustancial de la variante 1B sobre Qwen3.5 0.8B en puntuación global y eficiencia, pero no se dispone de los valores numéricos ni de las especificaciones completas de los modelos comparados.

## Limitaciones y advertencias

- El repositorio declarado tiene un tamaño de 0.0 GB, lo que puede indicar una subida incompleta o metadatos no actualizados; conviene verificar los archivos reales antes de usarlo en producción.
- La conversión a safetensors está en proceso; el formato actual es `pytorch_model.bin` en bf16, lo que puede suponer un riesgo de seguridad al cargar pickle y algo más de peso en disco.
- La model card disponible está truncada, por lo que faltan detalles de arquitectura, entrenamiento y evaluación que no deben suponerse.
- Riesgo de alucinación: inherente a los modelos de lenguaje compactos de ~1B parámetros; las afirmaciones sobre imágenes deben verificarse en aplicaciones críticas.
- Idiomas soportados no especificados: no hay garantía de cobertura multilingüe más allá de lo que permita el modelo base.
- Limitación de contexto: no se conoce la longitud de contexto, por lo que no se puede planificar diálogo largo o vídeos extensos sin verificación previa.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar también las condiciones del repositorio original de OpenBMB por si hubiera términos adicionales.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni garantía de mantenimiento por parte del autor del port.
- Sobre el rendimiento multimodal: al tratarse de una variante de 1B no debe esperarse paridad con modelos MLLM de mayor tamaño en tareas de razonamiento visual complejo.

## Enlaces

- Repositorio HuggingFace de este port: https://huggingface.co/rty813/MiniCPM-V-4.7-1B-bf16
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Repositorio GitHub de MiniCPM-V: https://github.com/openbmb/MiniCPM-V
- Repositorio de LLaVA-UHD v4 (técnica de compresión intra-ViT): https://github.com/THUMAI-Lab/LLaVA-UHD-v4
- Papers, blogs, demos u otros enlaces: no disponibles en la información proporcionada.
