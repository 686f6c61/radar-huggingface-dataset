# lyber-ai/Kimi-K3.1-Pro-UNCENSORED-MXFP4

## Resumen

Kimi-K3.1-Pro-UNCENSORED-MXFP4 es una versión "abliterated" (sin censura) del modelo Kimi-K3.1-Pro de Moonshot AI, publicada por el usuario lyber-ai en Hugging Face. Se trata de un fine-tune que elimina los mecanismos de rechazo del modelo base, cuantizado en formato MXFP4 (8 bits) para reducir el tamaño del repositorio, que asciende a 1.561,4 GB. El modelo conserva la arquitectura del original, descrita en los tags como un transformer híbrido con componentes MoE (mixture of experts), MLA (multi-head latent attention), DSA y GDN con atención SSM, además de capacidades de razonamiento y tool calling.

El modelo base, Kimi-K3.1-Pro, es un modelo de lenguaje de gran escala orientado a tareas de codificación, investigación financiera y razonamiento agéntico. Según la información disponible, cuenta con 2,78 billones de parámetros totales (dato extraído de los safetensors del repositorio), lo que lo sitúa en la categoría de modelos frontera de código abierto. La versión de lyber-ai mantiene ese tamaño pero aplica una cuantización de 8 bits (MXFP4) y un proceso de abliteration que elimina las capas de alineación y rechazo.

La relevancia de esta ficha radica en que documenta una variante no oficial de un modelo de gran tamaño, con acceso restringido en Hugging Face y licencia heredada del modelo base (kimi-k31-pro). Es importante señalar que no se dispone de información publicada sobre los detalles del proceso de abliteration, los datos de entrenamiento del fine-tune ni resultados de benchmarks específicos de esta variante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con MoE, MLA, DSA y GDN con atención SSM (según tags) |
| Parámetros totales | 2.780.110.363.392 (2,78 billones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4 (8 bits) |
| Idiomas soportados | en, zh, es, fr, ja, ko, ru |
| Licencia | kimi-k31-pro (licencia "other" heredada del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo, según los tags del repositorio, combina un transformer con mezcla de expertos (MoE), atención latente multi-cabeza (MLA), DSA y GDN con atención SSM (modelo de espacio de estados híbrido). Esta combinación es típica de los modelos Kimi de Moonshot AI, que buscan equilibrar eficiencia computacional y capacidad de contexto largo. El repositorio incluye código personalizado (`custom_code`), lo que implica que la carga del modelo requiere confiar en implementaciones no estándar de transformers.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base utilizó RLHF o DPO. Respecto al fine-tune de lyber-ai, no se documenta el proceso de abliteration (técnica de eliminación de direcciones de rechazo en el espacio de activaciones), el dataset utilizado ni el número de pasos de entrenamiento. La cuantización MXFP4 se aplicó presumiblemente para reducir el peso del repositorio de 1.561,4 GB, aunque no se especifica el método exacto de cuantización ni la pérdida de precisión asociada.

## Capacidades

- Generación de texto y razonamiento multi-paso, según los tags `reasoning` y `text-generation`.
- Soporte de tool calling / function calling (tag `tool-calling`).
- Capacidades agénticas para tareas complejas, según la descripción del modelo base en kimi.ai.
- Razonamiento sobre código y tareas de programación (el modelo base se promociona para proyectos de codificación complejos).
- Capacidades multilingües en inglés, chino, español, francés, japonés, coreano y ruso.
- Modo "uncensored" / "abliterated": eliminación de rechazos en las respuestas, lo que permite generar contenido que el modelo base rechazaría.
- No se dispone de información sobre capacidades de visión, audio o modo "thinking" explícito en esta variante.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un modelo de gran escala sin capas de rechazo, comparando respuestas con el modelo base para analizar qué tipos de contenido se ven afectados por la abliteration.
- Generación de código en entornos controlados: gracias a las capacidades de codificación del modelo base y al soporte de tool calling, puede integrarse en pipelines internos de generación de código donde se requiera ausencia de filtros de rechazo, siempre con revisión humana.
- Análisis de documentos técnicos y financieros: el modelo base se orienta a investigación financiera y análisis profundo; esta variante puede procesar documentación extensa en los idiomas soportados.
- Experimentación con arquitecturas híbridas MoE/SSM: el repositorio permite a investigadores estudiar el comportamiento de un modelo de 2,78 billones de parámetros cuantizado en MXFP4, evaluando el impacto de la cuantización en tareas de razonamiento.
- Desarrollo de agentes autónomos en investigación: el soporte de tool calling y razonamiento multi-paso permite construir agentes que ejecuten tareas de investigación web o análisis de datos, con la advertencia de que la ausencia de censura requiere salvaguardas externas.
- Evaluación de sesgos y contenido dañino: al eliminar los rechazos, el modelo puede emplearse para generar corpus de prueba que permitan entrenar clasificadores de contenido o evaluar la robustez de filtros de seguridad.
- Traducción y generación multilingüe: con soporte para siete idiomas, puede utilizarse en tareas de traducción técnica o generación de contenido en español, francés, japonés, coreano y ruso, aunque no se dispone de métricas de calidad por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de comparativas numéricas con el modelo base o con alternativas. Tampoco se documenta el impacto de la cuantización MXFP4 en la precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,78 billones de parámetros en MXFP4 (aproximadamente 4 bits por parámetro en la práctica del formato), el peso del modelo ronda los 1,4-1,5 TB, por lo que se requiere un clúster multi-GPU con al menos 1,6 TB de memoria agregada.
- GPU recomendadas: no es viable en GPU consumer. Se necesitan configuraciones con múltiples H100 (80 GB), A100 (80 GB) o GPUs con memoria unificada de gran capacidad; por ejemplo, se requerirían del orden de 20 H100 de 80 GB para alojar los pesos.
- No cabe en ninguna GPU consumer (RTX 4090, 3090, etc.) ni en configuraciones de una sola GPU profesional.
- Opciones de despliegue: al ser un modelo con `custom_code` y formato safetensors, requiere transformers con confianza en código remoto; no se dispone de confirmación de soporte en vLLM, llama.cpp, Ollama o TGI. La cuantización MXFP4 puede requerir kernels específicos no estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-UNCENSORED-MXFP4 (este) | 2,78 B | no disponible | kimi-k31-pro | Gated en HF | Fine-tune abliterated, MXFP4, 1.561 GB |
| moonshotai/Kimi-K3.1-Pro | no disponible | no disponible | kimi-k31-pro | HF (oficial) | Modelo base, alineado, sin cuantizar |
| Otros modelos de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de información de alternativas comparables en la búsqueda realizada |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparativa numérica con alternativas de la misma categoría.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido dañino, ilegal o sesgado; no debe desplegarse en producción sin filtros externos.
- Riesgo elevado de alucinación, especialmente en tareas de razonamiento y datos factuales, sin que se hayan publicado evaluaciones específicas.
- Licencia "kimi-k31-pro" (other): es necesario revisar los términos del modelo base en moonshotai/Kimi-K3.1-Pro antes de cualquier uso comercial; la licencia puede restringir el uso comercial o exigir atribución.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y el despliegue automatizado.
- El repositorio incluye `custom_code`, lo que implica ejecutar código remoto no auditado; riesgo de seguridad en entornos de producción.
- No se dispone de información sobre la longitud de contexto efectiva, el impacto de la cuantización MXFP4 en la calidad ni el rendimiento en los idiomas distintos del inglés y el chino.
- El modelo es extremadamente grande (1.561,4 GB), lo que dificulta su descarga, almacenamiento y despliegue en infraestructuras modestas.
- No se documenta el proceso de fine-tune ni los datos utilizados, por lo que no se puede evaluar la calidad o los sesgos introducidos por lyber-ai.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/lyber-ai/Kimi-K3.1-Pro-UNCENSORED-MXFP4
- Modelo base en Hugging Face: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Árbol de archivos del modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/tree/main
- Sitio oficial de Kimi: https://www.kimi.ai/en
