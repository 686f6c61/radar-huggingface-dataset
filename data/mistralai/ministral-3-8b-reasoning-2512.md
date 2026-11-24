# mistralai/Ministral-3-8B-Reasoning-2512

## Resumen

Ministral 3 8B Reasoning 2512 es un modelo de lenguaje de tipo "tiny" desarrollado por Mistral AI, diseñado para despliegue en el borde (edge) y con capacidades multimodales. Forma parte de la familia Ministral 3, que incluye variantes de 3B, 8B y 14B en versiones Base, Instruct y Reasoning. Este checkpoint concreto es la versión post-entrenada para razonamiento, orientada a tareas de matemáticas, programación y disciplinas STEM.

El modelo combina un language model de 8,4B parámetros con un vision encoder de 0,4B, sumando un total de 8.918.026.240 parámetros según los pesos en safetensors. Soporta una ventana de contexto de 256k tokens, lo que lo sitúa en un rango poco habitual para su tamaño. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones adicionales.

La relevancia actual del modelo radica en su capacidad para ejecutarse en hardware de consumo: en BF16 cabe en 24 GB de VRAM, y cuantizado puede funcionar con menos de 12 GB de RAM/VRAM. Esto lo convierte en una opción atractiva para asistentes locales, sistemas embebidos y pipelines de agentes que requieren razonamiento multi-paso sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (language model de 8,4B + vision encoder de 0,4B) |
| Parametros totales | 8.918.026.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | BF16 (pesos oficiales); cuantizaciones adicionales disponibles en checkpoints alternativos |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se compone de dos bloques: un language model de 8,4B parámetros y un vision encoder de 0,4B, lo que da un total de 8,918B parámetros. La arquitectura es de tipo transformer, etiquetada como `mistral3` en los metadatos del repositorio. No se especifica en la información disponible si emplea atención lineal, decodificación especulativa u otras innovaciones de eficiencia.

El modelo base es `mistralai/Ministral-3-8B-Base-2512`, sobre el que se aplica un post-entrenamiento orientado a razonamiento. No se detalla en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona un paper asociado (arXiv:2601.08584) que probablemente contiene estos detalles, pero su contenido no está incluido en la información disponible.

## Capacidades

- Generación de texto con razonamiento multi-paso y resolución dinámica de problemas.
- Capacidades matemáticas y de programación (orientado a casos de uso STEM).
- Visión: análisis de imágenes y extracción de información visual combinada con texto.
- Soporte multilingüe en once idiomas: inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- Función nativa de tool calling / function calling con salida JSON.
- Capacidades agénticas para sistemas multi-paso.
- Adherencia fuerte a system prompts.
- Modo de razonamiento (reasoning traces) que se recomienda mantener en contexto en conversaciones multi-turno.
- Optimizado para despliegue en el borde y en hardware de consumo.

## Casos de uso

- Asistente local diario: el modelo puede ejecutarse en un equipo de sobremesa con 24 GB de VRAM en BF16 o con menos de 12 GB cuantizado, gestionando conversaciones multi-turno con contexto de hasta 256k tokens y manteniendo las trazas de razonamiento entre turnos.
- Descripción y comprensión de imágenes y documentos: el vision encoder de 0,4B permite analizar imágenes y extraer información, adecuado para digitalización de documentos o accesibilidad. Se recomienda mantener relaciones de aspecto cercanas a 1:1.
- Traducción y generación de contenido multilingüe: con soporte para once idiomas, puede emplearse en pipelines de localización o generación de contenido en varios mercados sin necesidad de modelos separados por idioma.
- Agentes especializados con tool calling: la función nativa de function calling y la salida JSON permiten integrarlo en sistemas agénticos que consultan APIs, bases de datos o servicios externos. Se recomienda limitar el número de herramientas al mínimo necesario.
- Razonamiento matemático y STEM en entornos educativos o de investigación: la versión Reasoning está específicamente post-entrenada para tareas de matemáticas, coding y STEM, lo que la hace adecuada para tutores automatizados o asistentes de resolución de problemas.
- Fine-tuning y especialización: al estar bajo licencia Apache 2.0 y con pesos en safetensors, puede ajustarse para dominios concretos (legal, médico, financiero) sin restricciones de uso comercial.
- Generación de código en pipelines de CI/CD: con capacidades de coding y tool calling, puede integrarse en flujos de revisión automática, generación de tests o documentación técnica.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks de razonamiento que compara modelos de la familia Ministral 3 con alternativas. Los datos disponibles en la información proporcionada corresponden principalmente al modelo de 14B; para el 8B Reasoning no se incluyen resultados numéricos en el extracto disponible.

| Modelo | AIME25 | AIME24 | GPQA Diamond | LiveCodeBench |
|---|---|---|---|---|
| Ministral 3 14B | 0.850 | 0.898 | 0.712 | 0.646 |
| Qwen3-14B (Thinking) | 0.737 | 0.837 | 0.663 | 0.593 |
| Ministral 3 8B Reasoning 2512 | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks del modelo 8B Reasoning en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 24 GB (según la model card, cabe en 24 GB de VRAM).
- VRAM estimada cuantizado: menos de 12 GB de RAM/VRAM.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por el perfil de VRAM, tarjetas con 24 GB (RTX 4090, A10G, L4 con cuantización) o superiores (A100, H100) son adecuadas.
- Cabe en GPU de consumo: sí, en BF16 en tarjetas de 24 GB y cuantizado en tarjetas de 12 GB o menos.
- Opciones de despliegue: la librería indicada es vLLM; también se mencionan checkpoints adicionales en la colección de Mistral. No se confirman otros motores (llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Vision | Reasoning | Disponibilidad |
|---|---|---|---|---|---|---|
| Ministral 3 8B Reasoning 2512 | 8,918B | 256k | Apache 2.0 | Sí | Sí | Hugging Face |
| Ministral 3 14B Reasoning 2512 | no disponible | 256k (familia) | Apache 2.0 | Sí | Sí | Hugging Face |
| Ministral 3 3B Reasoning 2512 | no disponible | 256k (familia) | Apache 2.0 | Sí | Sí | Hugging Face |
| Qwen3-14B (Thinking) | 14B (aproximado) | no disponible | no disponible | no disponible | Sí | no disponible |

La comparativa directa con modelos de otros fabricantes del mismo tamaño no está disponible en la información proporcionada. Los datos de benchmarks solo permiten comparar el 14B de la familia con Qwen3-14B.

## Limitaciones y advertencias

- Riesgo de alucinación: no se documenta en la información disponible, pero es inherente a los modelos de lenguaje de este tamaño.
- Sesgos: no se detallan sesgos conocidos en la información proporcionada.
- Limitaciones de contexto: aunque soporta 256k tokens, no se especifica el rendimiento degradado a longitudes extremas.
- Limitaciones de idioma: el soporte declarado cubre once idiomas; no se garantiza calidad uniforme en todos ellos.
- Visión: se recomienda mantener relaciones de aspecto cercanas a 1:1 y evitar imágenes muy alargadas o estrechas, lo que puede requerir preprocesado (recorte) en producción.
- Tool calling: se recomienda limitar el número de herramientas al mínimo necesario para evitar sobrecargar al modelo.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero se debe verificar el cumplimiento de las condiciones de la model card (por ejemplo, el aviso de procesamiento de datos personales en el gated access).
- Producción: no se proporcionan datos de latencia, throughput ni robustez en entornos de alta concurrencia.

## Enlaces

- Hugging Face: https://huggingface.co/mistralai/Ministral-3-8B-Reasoning-2512
- Blog de Mistral 3: https://mistral.ai/news/mistral-3
- Paper: https://arxiv.org/abs/2601.08584
- System prompt recomendado: https://huggingface.co/mistralai/Ministral-3-8B-Reasoning-2512/blob/main/SYSTEM_PROMPT.txt
- Checkpoints adicionales: https://huggingface.co/collections/mistralai/ministral-3-additional-checkpoints
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Base-2512
- Paquete Python de Mistral: https://pypi.org/project/mistralai/
