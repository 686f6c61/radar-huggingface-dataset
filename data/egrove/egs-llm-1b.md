# Egrove/EGS-llm-1b

## Resumen

EGS-LLM-1B es un modelo de lenguaje de 1.543.714.304 parámetros (aproximadamente 1,54 mil millones) desarrollado por Egrove bajo la marca Elite Site Optimizer. Está construido sobre la arquitectura Qwen2 y se distribuye en formato safetensors para la librería transformers. Su propósito declarado es asistir a especialistas en SEO, desarrolladores y equipos de contenido en la interpretación de hallazgos de auditorías web, la propuesta de correcciones priorizadas y la generación de comprobaciones posteriores a un cambio.

El modelo se posiciona como una herramienta de nicho orientada a tareas de SEO técnico, accesibilidad web, datos estructurados (JSON-LD) y traspaso de auditorías a tickets de desarrollo. No se presenta como un modelo de propósito general, sino como un asistente conversacional especializado que trabaja con contexto de página, hallazgos concretos de auditoría y fragmentos HTML.

Es relevante ahora por su licencia permisiva Apache 2.0, su tamaño reducido que permite inferencia en CPU o en GPU de consumo, y su enfoque en un dominio concreto donde los modelos generalistas suelen producir respuestas genéricas. No se han publicado datos sobre el proceso de entrenamiento, el tamaño del contexto ni los benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Qwen2 |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos safetensors en el repo) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only derivado de Qwen2, según la etiqueta del repositorio y la configuración de transformers. El modelo cuenta con 1.543.714.304 parámetros totales, lo que lo sitúa en la franja de los modelos pequeños dentro de la familia Qwen2. El repositorio ocupa 3,1 GB, coherente con pesos en precisión de 16 bits.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo fases de ajuste supervisado, RLHF o DPO, ni sobre innovaciones técnicas específicas como decodificación especulativa o atención lineal. La model card únicamente describe los usos previstos y ejemplos de prompts, sin detallar el pipeline de entrenamiento. Tampoco se especifica la longitud máxima de contexto soportada, dato que no aparece en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat (`apply_chat_template`).
- Explicación de problemas de rastreo e indexación en SEO técnico.
- Revisión de fragmentos HTML y sugerencia de cambios de marcado o redacción para accesibilidad.
- Redacción de JSON-LD a partir de datos verificados de página.
- Conversión de hallazgos de auditoría en tickets de desarrollo con prioridades y criterios de aceptación.
- Generación de listas de comprobación posteriores a un despliegue.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá de la conversación.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- SEO técnico: el modelo puede recibir la URL afectada, el hallazgo exacto de la auditoría y el HTML relevante para explicar el impacto potencial en la indexación y proponer una corrección concreta, además de tres comprobaciones posteriores al despliegue.
- Accesibilidad web: revisión de fragmentos HTML en contexto para sugerir texto alternativo descriptivo, por ejemplo en imágenes que actúan como único contenido de un enlace a una ficha de producto.
- Datos estructurados: generación de JSON-LD de tipo Product, Article u otros a partir de hechos verificados proporcionados por el usuario, con listado explícito de campos pendientes de confirmación antes de publicar.
- Traspaso de auditorías a desarrollo: transformación de un conjunto de hallazgos en tickets con prioridad y criterios de aceptación, útil para equipos que gestionan auditorías con múltiples stakeholders.
- Asistencia a equipos de contenido: explicación en lenguaje claro de por qué prácticas como el texto alternativo descriptivo importan, para formación interna o documentación.
- Verificación post-cambio: generación de checklists de validación tras aplicar una corrección de canonical, sitemap o marcado estructurado.
- Despliegue local y offline: al ser un modelo de 1,5B parámetros con licencia Apache 2.0, puede ejecutarse en entornos sin conectividad o con requisitos de privacidad, procesando HTML y datos de página sin enviarlos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 4-6 GB de VRAM para contextos moderados.
- En CPU es viable con `torch.float32`, requiriendo aproximadamente 6,2 GB de RAM solo para pesos, más overhead del proceso.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para fp16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más de VRAM.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (etiqueta `text-generation-inference` presente), endpoints compatibles según la etiqueta `endpoints_compatible`. No se documenta explícitamente soporte de llama.cpp, Ollama o vLLM, aunque al ser un modelo Qwen2 en safetensors es probable que herramientas compatibles con esa arquitectura puedan convertirlo; no se confirma en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| EGS-LLM-1B | 1,54B | No disponible | Apache 2.0 | SEO, accesibilidad, datos estructurados | Hugging Face |
| Qwen2-1.5B | 1,54B | 32.768 tokens (según documentación pública de Qwen2) | Apache 2.0 | Propósito general | Hugging Face |
| TinyLlama-1.1B | 1,1B | 2.048 tokens (según documentación pública) | Apache 2.0 | Propósito general | Hugging Face |
| SmolLM2-1.7B | 1,7B | 8.192 tokens (según documentación pública) | Apache 2.0 | Propósito general | Hugging Face |

La comparativa se basa en datos públicos de los modelos alternativos; para EGS-LLM-1B no se dispone de contexto ni benchmarks, por lo que la comparación de rendimiento no es posible. La principal diferencia es la especialización declarada en SEO y accesibilidad frente al propósito general de las alternativas.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- No se han publicado benchmarks, por lo que no es posible evaluar su calidad objetiva frente a alternativas.
- No se documenta la longitud de contexto, lo que impide planificar su uso con páginas HTML extensas o auditorías con mucho contexto.
- Riesgo de alucinación inherente a modelos de este tamaño: puede inventar campos de JSON-LD, directrices de accesibilidad o pasos de verificación no respaldados por la documentación oficial.
- La model card recomienda explícitamente validar los cambios con datos de rastreo actuales, pruebas de accesibilidad y validadores de datos estructurados antes de publicar; no debe usarse como fuente única de verdad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin documentación sobre sesgos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación comunitaria.
- No se documenta soporte de tool calling, agentes o razonamiento multi-paso, lo que limita su integración en pipelines automatizados complejos.
- El tamaño del repo (3,1 GB) y la ausencia de cuantizaciones publicadas obligan a convertir los pesos manualmente si se desea desplegar en entornos con poca memoria.

## Enlaces

- Hugging Face: https://huggingface.co/Egrove/EGS-llm-1b
- Licencia Apache 2.0: incluida en el repositorio como archivo LICENSE
- Ejemplo de uso: `example.py` incluido en el repositorio
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
