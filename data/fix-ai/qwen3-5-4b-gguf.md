# Fix-AI/Qwen3.5-4B-GGUF

## Resumen

Fix-AI/Qwen3.5-4B-GGUF es una réplica no oficial en formato GGUF del modelo Qwen3.5-4B, publicado por el usuario Fix-AI. El modelo original lo desarrolla el equipo Qwen (Alibaba), y esta versión es un duplicado del repositorio de cuantizaciones de Unsloth (unsloth/Qwen3.5-4B-GGUF), tal y como el propio autor reconoce en la model card. Se trata de un modelo causal multimodal (texto e imagen) de 4.205.751.296 parámetros, pensado para ejecución local y despliegue con requisitos de hardware moderados.

La relevancia de Qwen3.5-4B radica en su arquitectura híbrida: combina capas de atención lineal Gated DeltaNet con capas de atención con compuertas (Gated Attention), lo que reduce el coste de inferencia en contextos largos. El modelo declara 262.144 tokens de contexto nativo, extensible hasta 1.010.000, y soporte de 201 idiomas y dialectos. Incorpora un codificador visual con entrenamiento de fusión temprana, por lo que cubre tareas de imagen-texto además de razonamiento, código y agentes.

Esta ficha describe la variante GGUF, que es la vía práctica para inferencia en CPU/GPU de consumo mediante llama.cpp u Ollama. Conviene tener en cuenta que el repositorio de Fix-AI es un espejo sin mantenimiento declarado (0 descargas, 1 like en el momento de la consulta) y que la referencia canónica es el repositorio de Unsloth o los pesos originales en Transformers de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión: 32 capas con layout 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 4.205.751.296 (4B) |
| Parametros activos | No disponible: la model card no declara Mixture-of-Experts ni parámetros activos para la variante 4B; el FFN se describe con dimensión intermedia 9216 |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | GGUF con cuantización dinámica de Unsloth (Unsloth Dynamic 2.0); el repositorio ocupa 71,3 GB, lo que indica múltiples niveles de cuantización, pero el listado exacto de ficheros no está disponible en la información proporcionada |
| Idiomas soportados | 201 idiomas y dialectos según la model card del modelo base |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors para Transformers) |

Otros datos técnicos declarados: dimensión oculta 2560, embedding de tokens 248.320 (con padding, atado a la salida LM), Gated DeltaNet con 32 cabezas lineales para V y 16 para QK con dimensión de cabeza 128, Gated Attention con 16 cabezas para Q y 4 para KV con dimensión de cabeza 256 y RoPE de 64 dimensiones.

## Arquitectura y entrenamiento

Qwen3.5-4B es un modelo causal con codificador de visión entrenado en dos fases (pre-entrenamiento y post-entrenamiento). La innovación estructural principal es la disposición híbrida de capas: por cada bloque de cuatro capas, tres usan Gated DeltaNet (atención lineal con estado recurrente) y una usa Gated Attention clásica. Esta combinación busca mantener la calidad de la atención completa para la recuperación de información precisa, mientras que las capas lineales reducen el coste computacional y el crecimiento de la caché KV en secuencias largas. El modelo incluye además predicción multi-token (MTP) entrenada con varios pasos, lo que habilita decodificación especulativa y mejora el throughput.

En cuanto a los datos, la model card del modelo base describe entrenamiento multimodal con fusión temprana sobre tokens de imagen y texto, con una eficiencia de entrenamiento multimodal cercana al 100 % respecto al entrenamiento solo de texto, y un pipeline de RL asíncrono escalado sobre entornos multiagente con distribuciones de tareas progresivamente más complejas. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni los detalles de las etapas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto (pipeline image-text-to-text) y mantiene paridad con la generación Qwen3 en razonamiento, código, agentes y comprensión visual, según el autor.
- Razonamiento multi-paso y modo de pensamiento: la familia Qwen3.5 se compara en la model card con variantes "-Thinking", lo que indica soporte de razonamiento extendido.
- Generación de código y matemáticas: incluido en los benchmarks declarados por el autor (código, agentes y visión) aunque sin cifras disponibles.
- Soporte multilingüe amplio: 201 idiomas y dialectos.
- Capacidades de agente: entrenamiento con RL sobre entornos multiagente y scaffolds de gran escala; la model card menciona explícitamente agentes y orquestación de entornos.
- Predicción multi-token (MTP): permite decodificación especulativa para acelerar la inferencia.
- Compatibilidad de despliegue: los pesos en Transformers son compatibles con vLLM, SGLang y KTransformers; la variante GGUF es compatible con llama.cpp y derivados.
- Fine-tuning: Unsloth documenta guías de ajuste fino local para esta familia.

## Casos de uso

- Asistente de atención al cliente multi-turno: con 262.144 tokens de contexto nativo se pueden mantener historiales largos y documentos de referencia (manuales, políticas) dentro de la misma ventana, sin recuperación externa, en despliegues locales con cuantización Q4 o Q5.
- Procesamiento de documentos con imagen: al ser image-text-to-text, permite extraer y razonar sobre capturas, formularios escaneados o diagramas combinándolos con texto en una sola petición, útil en digitalización de facturas o informes técnicos.
- Generación de código en local para entornos con requisitos de privacidad: un modelo de 4B en GGUF cabe en GPU de consumo y puede integrarse en asistentes de IDE o pipelines de CI/CD sin enviar código a servicios externos, con licencia Apache 2.0 que permite uso comercial.
- Agentes de automatización con tool calling: la familia está entrenada con RL sobre entornos multiagente, por lo que es adecuada para orquestar llamadas a APIs en flujos de varios pasos (consulta de estado, reservas, triaje de tickets) con latencia contenida.
- Análisis de imágenes en edge o en puesto de trabajo: al poder ejecutarse con cuantizaciones de ~3-5 GB, es viable en estaciones sin GPU dedicada de gran VRAM para clasificación y descripción de imágenes en lotes pequeños.
- Traducción y atención multilingüe: con 201 idiomas declarados, sirve para traducción de soporte, moderación de contenido en múltiples lenguas o generación de respuestas localizadas en productos con base de usuarios internacional.
- Prototipado e investigación de arquitecturas híbridas: la combinación Gated DeltaNet + Gated Attention y MTP lo convierte en un banco de pruebas asequible para estudiar decodificación especulativa y eficiencia en contextos largos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye una tabla comparativa con las columnas GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking, Qwen3-30BA3B-Thinking-2507, Qwen3.5-9B y Qwen3.5-4B, pero los valores de las filas no están presentes en el contenido proporcionado. Tampoco se dispone de cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de latencia o throughput.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir del número de parámetros y del número de bytes por peso; no proceden de mediciones publicadas en la información disponible.

- Pesos en FP16/BF16: aproximadamente 8,4 GB solo de pesos; con codificador visual y caché KV para contextos moderados, del orden de 10-12 GB de VRAM. Encaja en RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB y L40S.
- Cuantización Q8: aproximadamente 4,5 GB de pesos; viable en GPUs de 8-12 GB (RTX 4060 Ti 16 GB, RTX 3080 12 GB) dejando margen para contexto.
- Cuantización Q4: aproximadamente 2,5-2,8 GB de pesos; ejecutable en GPUs de consumo de 8 GB (RTX 3060 Ti, RTX 4060) y en CPU con RAM suficiente, aunque con throughput menor.
- Contexto largo: a 262.144 tokens la caché KV domina el consumo. Las capas Gated DeltaNet de estado recurrente reducen el crecimiento respecto a un transformer completamente atendido, pero no se dispone de mediciones de VRAM a esa longitud.
- Despliegue: llama.cpp, Ollama y LM Studio para GGUF; vLLM, SGLang, TGI y KTransformers para los pesos en Transformers del modelo base. El soporte de MTP permite activar decodificación especulativa en motores que lo implementen.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el tamaño de 4B y la atención híbrida están orientados a inferencia de alta concurrencia con coste bajo, según declara el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B (esta ficha, GGUF) | 4,2B | 262.144 nativo, hasta 1.010.000 | Sin cifras disponibles | Apache 2.0 | GGUF en este repo (duplicado) y en unsloth/Qwen3.5-4B-GGUF; safetensors en Qwen/Qwen3.5-4B |
| Qwen3.5-9B | 9B (según denominación) | No disponible en la información | Sin cifras disponibles; aparece como modelo de comparación en la model card | No disponible en la información (la familia se publica bajo Apache 2.0 según el enlace de licencia) | Pesos publicados por Qwen; cuantizaciones previsiblemente en Unsloth |
| GPT-OSS-20B | 20B (según denominación) | No disponible | Sin cifras disponibles; incluido en la tabla comparativa de la model card | No disponible en la información | No disponible en la información |
| Qwen3-VL (familia) | No disponible | No disponible | El autor afirma que Qwen3.5 supera a Qwen3-VL en razonamiento, código, agentes y visión | No disponible en la información | No disponible en la información |

No se dispone de datos suficientes para establecer una comparación cuantitativa fiable; las columnas de rendimiento quedan vacías por ausencia de cifras en la información proporcionada.

## Limitaciones y advertencias

- Repositorio duplicado: el propio autor indica que este repositorio es una copia y que el original está en unsloth/Qwen3.5-4B-GGUF. No hay garantía de actualización, corrección de errores ni soporte; para producción conviene referenciar el repositorio canónico.
- Señales de adopción mínimas: 0 descargas y 1 like en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- Ausencia de benchmarks verificables: no hay cifras de rendimiento en la información disponible, por lo que no se puede validar la afirmación de paridad con Qwen3 o de superioridad frente a Qwen3-VL.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en contexto largo y en tareas de recuperación de datos concretos; requiere verificación en dominios sensibles.
- Capacidad limitada por tamaño: con 4B de parámetros es esperable un rendimiento inferior al de modelos de 20B-120B en razonamiento complejo y código de larga longitud, aunque no haya cifras para cuantificarlo.
- Degradación por cuantización: las cuantizaciones de 2-3 bits reducen precisión; el autor defiende Unsloth Dynamic 2.0 frente a otras, pero no se aportan métricas comparativas en la información disponible.
- Idiomas: se declaran 201 idiomas, pero no se detalla la distribución del dataset ni la calidad por lengua; el rendimiento en lenguas minoritarias y en castellano no está documentado.
- Multimodalidad sin detalles: no se especifican resolución de imagen soportada, límites de tokens visuales ni capacidades de OCR.
- Licencia: Apache 2.0 permite uso comercial, pero el enlace de licencia apunta al fichero LICENSE del repositorio Qwen/Qwen3.5-4B; conviene revisar los términos del modelo base y las condiciones de atribución antes de redistribuir.
- Longitud de contexto efectiva: los 262.144 tokens son el máximo declarado; la calidad de recuperación en ventanas muy largas no está medida en la información disponible.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/Fix-AI/Qwen3.5-4B-GGUF
- Repositorio original de cuantizaciones: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF/tree/main
- Modelo base en Transformers: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Guía de ejecución local de Qwen3.5 en Unsloth: https://unsloth.ai/docs/models/qwen3.5
- Guía de fine-tuning de Qwen3.5 en Unsloth: https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Documentación de Unsloth Dynamic 2.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Qwen Chat: https://chat.qwen.ai

Nota: la búsqueda web realizada no ha devuelto resultados relevantes sobre el modelo; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
