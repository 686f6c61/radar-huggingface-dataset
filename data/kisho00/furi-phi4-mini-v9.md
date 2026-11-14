# Kisho00/furi-phi4-mini-v9

## Resumen

Furi es un ajuste fino experimental del modelo Phi-4-mini-instruct de Microsoft, desarrollado por el usuario Kisho00 y publicado en Hugging Face bajo el identificador `Kisho00/furi-phi4-mini-v9`. Su propósito declarado es servir como chatbot especializado en el cuidado de perros y gatos, cubriendo consultas sobre alimentación, comportamiento y salud general de mascotas. Se trata de un modelo de pruebas, según advierte el propio autor, y no está pensado para uso clínico ni como sustituto del criterio veterinario.

El modelo hereda la arquitectura y el tamaño del Phi-4-mini-instruct original: 3.836.021.760 parámetros (aproximadamente 3,8 mil millones), almacenados en formato safetensors con un tamaño de repositorio de 7,7 GB. El ajuste se realizó mediante QLoRA, una técnica de fine-tuning eficiente en memoria que cuantiza el modelo base y entrena adaptadores de bajo rango. La model card es mínima y no aporta información sobre la composición del dataset de entrenamiento, la longitud de contexto soportada tras el ajuste ni los idiomas cubiertos.

La relevancia de esta ficha es limitada en términos de producción: no hay descargas ni interacciones registradas, no se especifica licencia, no se publican benchmarks y la documentación es escasa. Resulta útil, eso sí, como ejemplo de fine-tuning especializado de bajo coste sobre un modelo pequeño, y como referencia para quien quiera evaluar la viabilidad de adaptar Phi-4-mini a un dominio vertical con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de microsoft/Phi-4-mini-instruct) |
| Parametros totales | 3.836.021.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta hasta 128 000 tokens, pero no se confirma tras el ajuste) |
| Tipos de cuantizacion | no disponible (el ajuste se realizó con QLoRA, pero no se especifican formatos publicados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Phi-4-mini-instruct, un transformer decoder-only de aproximadamente 3,8 mil millones de parámetros desarrollado por Microsoft, diseñado para instrucciones y con soporte nativo de contexto largo. Sobre esta base, Kisho00 aplicó un ajuste fino supervisado mediante QLoRA, técnica que congela los pesos originales cuantizados y entrena adaptadores de bajo rango, reduciendo drásticamente los requisitos de memoria durante el entrenamiento. La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO adicionales.

No se documentan innovaciones técnicas propias del ajuste: no hay mención a decodificación especulativa, atención lineal ni modificaciones arquitectónicas. El tag `custom_code` en Hugging Face sugiere que el repositorio incluye código personalizado, presumiblemente para cargar los adaptadores o el modelo fusionado, pero no se especifica su contenido. Tampoco se indica si los pesos publicados son el modelo fusionado completo o solo los adaptadores LoRA, aunque el tamaño del repositorio (7,7 GB) y la presencia de safetensors apuntan a un modelo fusionado en precisión de 16 bits.

## Capacidades

- Generación de texto conversacional orientada a consultas sobre cuidado de perros y gatos.
- Respuestas informativas sobre alimentación, comportamiento y salud general de mascotas, con advertencia explícita de que no constituyen diagnósticos.
- Capacidades heredadas del modelo base Phi-4-mini-instruct: razonamiento básico, matemáticas elementales y generación de código, aunque el ajuste puede haber degradado parcialmente estas habilidades.
- Soporte de tool calling y function calling: no confirmado tras el ajuste; el modelo base lo soporta, pero la model card no lo menciona.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no disponibles; el modelo base es multilingüe, pero se desconoce el efecto del ajuste.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Chatbot de atención al público en una clínica veterinaria: el modelo puede gestionar conversaciones multi-turno sobre síntomas comunes, cuidados postoperatorios o pautas de alimentación, derivando siempre a consulta presencial cuando la consulta entrañe riesgo. Su tamaño reducido permite desplegarlo en infraestructura modesta.
- Asistente en tiendas de alimentación y accesorios para mascotas: integrado en una web o app, puede recomendar productos según la especie, edad y necesidades del animal, respondiendo en lenguaje natural y con contexto conversacional.
- Guía de cuidados para refugios y protectoras: el modelo puede responder preguntas frecuentes de adoptantes sobre comportamiento canino y felino, higiene y adaptación al hogar, reduciendo la carga del personal voluntario.
- Soporte educativo para nuevos propietarios: generación de explicaciones sobre vacunación, desparasitación o socialización, con tono divulgativo y advertencias sanitarias incluidas.
- Prototipado de asistentes verticales: sirve como base para experimentar con fine-tuning QLoRA en dominios concretos, dado su bajo coste de entrenamiento y despliegue en GPUs de consumo.
- Filtro de triaje conversacional: en un pipeline con un modelo mayor, Furi podría clasificar y responder consultas simples de cuidado de mascotas, reservando el modelo grande para casos complejos.
- Evaluación de riesgos en dominios sensibles: útil como caso de estudio sobre cómo un fine-tune pequeño puede alucinar en temas de salud animal y qué salvaguardas conviene añadir antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 7,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 10-12 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 4-5 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): alrededor de 2,5-3 GB, aunque no se confirma la disponibilidad de pesos GGUF en el repositorio.
- GPU recomendadas: RTX 3090, RTX 4090, A10G, L4 o A100 para fp16; RTX 3060 de 12 GB o superior para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores con cuantización; en fp16 requiere al menos 12 GB.
- Opciones de despliegue: transformers con safetensors; vLLM, llama.cpp, Ollama y TGI son viables en teoría, pero no se confirma compatibilidad con el código personalizado del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kisho00/furi-phi4-mini-v9 | 3,8 B | no disponible | no disponible | Hugging Face, 0 descargas | Fine-tune QLoRA experimental para cuidado de mascotas |
| microsoft/Phi-4-mini-instruct | 3,8 B | 128 000 tokens | MIT | Hugging Face, ampliamente utilizado | Modelo base, instrucciones generales, multilingüe |
| Qwen2.5-3B-Instruct | 3,1 B | 32 768 tokens | Apache 2.0 | Hugging Face, muy extendido | Alternativa generalista de tamaño similar |
| Llama-3.2-3B-Instruct | 3,2 B | 128 000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente utilizado | Generalista con buen rendimiento en instrucciones |

La comparación directa con Furi es limitada porque no hay benchmarks publicados ni licencia declarada; los modelos alternativos ofrecen documentación completa, licencias claras y comunidades activas.

## Limitaciones y advertencias

- Modelo experimental y de pruebas: el propio autor lo califica como test model, sin garantías de calidad ni estabilidad.
- Riesgo elevado de alucinación en temas de salud animal: las respuestas son información general y no diagnósticos; no debe usarse como sustituto de un veterinario.
- Licencia no especificada: impide determinar si el uso comercial está permitido; hay que contactar con el autor o asumir los términos del modelo base (MIT) con cautela.
- Idiomas no declarados: se desconoce si el ajuste conserva el multilingüismo del modelo base o lo ha degradado hacia un único idioma.
- Longitud de contexto no confirmada tras el ajuste: aunque Phi-4-mini-instruct soporta 128 000 tokens, el fine-tuning puede haber alterado este comportamiento.
- Sin descargas ni validación comunitaria: no hay evidencia externa de calidad, sesgos o robustez.
- Presencia de `custom_code`: requiere revisar el código del repositorio antes de cargarlo en producción, por posibles riesgos de seguridad.
- Sesgos conocidos: no documentados; hereda los del modelo base, que no se detallan en esta ficha.
- Fecha de creación futura (2026-11-13): conviene verificar la integridad y procedencia del repositorio antes de su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kisho00/furi-phi4-mini-v9
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Repositorio de Phi-4 en Microsoft: no disponible en la información proporcionada
- Paper de Phi-4: no disponible en la información proporcionada
- Demo o blog del autor: no disponible en la información proporcionada
