# Clownstein/Black-Onyx-5B-GGUF

## Resumen

Black-Onyx-5B es un modelo de lenguaje especializado en ciberseguridad, desarrollado por Clownstein y publicado en Hugging Face. Se trata de un ajuste fino (fine-tune) del modelo google/gemma-4-E2B-it de Google, disponible en formato GGUF para su uso en entornos locales. El modelo está orientado a tareas de ciberseguridad, como la generación de código seguro, la detección de vulnerabilidades y la inteligencia de amenazas, según las etiquetas que lo acompañan.

El modelo cuenta con 4.628.569.635 parámetros totales, según los datos de los pesos en safetensors, y el repositorio ocupa un total de 38,3 GB. Aunque el nombre sugiere un tamaño de 5B, el conteo real de parámetros es ligeramente inferior. El acceso al modelo está restringido (gated) y requiere aceptar las condiciones de Hugging Face. La licencia asociada es Gemma.

El modelo forma parte de la familia Black-Onyx, que incluye una variante de 12B también orientada a ciberseguridad. Para la variante 12B, el autor describe un pipeline de entrenamiento en varias etapas con formación continua, ajuste supervisado, GRPO y DPO; no se confirma si este pipeline se aplica de la misma forma a la variante 5B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (derivado de google/gemma-4-E2B-it) |
| Parámetros totales | 4.628.569.635 |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (tipos no especificados) |
| Idiomas soportados | No disponibles |
| Licencia | Gemma |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo base google/gemma-4-E2B-it. No se han proporcionado detalles específicos sobre la arquitectura interna en la información disponible. Según la descripción de la variante Black-Onyx-12B del mismo autor, el proceso de entrenamiento empleado en esa variante combina formación continua en ciberseguridad, ajuste supervisado (SFT), GRPO y optimización de preferencias directas (DPO). No se confirma si esta misma metodología se aplicó a la variante 5B, aunque es probable que el enfoque sea similar.

## Capacidades

- Generación de código seguro.
- Detección de vulnerabilidades en código.
- Inteligencia de amenazas.
- Conversacional.
- No se dispone de información sobre soporte de tool calling, función de agentes o modo de razonamiento extendido.

## Casos de uso

- Análisis de código en revisiones de seguridad: el modelo puede emplearse para auditar fragmentos de código y señalar posibles vulnerabilidades, como inyecciones SQL o fallos de validación de entradas.
- Generación de código seguro: puede asistir a desarrolladores en la escritura de código que sigue buenas prácticas de seguridad, reduciendo la probabilidad de introducir fallos explotables.
- Extracción de indicadores de compromiso (IOC): el modelo puede procesar informes de inteligencia de amenazas para extraer IPs, dominios, hashes y otras IOCs de forma estructurada.
- Auditoría de configuraciones: puede revisar archivos de configuración (por ejemplo, de servidores o contenedores) y detectar ajustes inseguros, como permisos excesivos o servicios expuestos.
- Apoyo en respuesta a incidentes: puede analizar logs de sistemas y correlacionar eventos para identificar patrones sospechosos durante la investigación de un incidente de seguridad.
- Formación y concienciación en ciberseguridad: el modelo puede generar explicaciones didácticas sobre amenazas comunes y medidas de mitigación, útiles para programas de formación interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 38,3 GB, lo que sugiere la inclusión de múltiples archivos de cuantización, pero no se especifican los tipos ni los requisitos de VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del modelo (aproximadamente 4.6B parámetros), pero no hay una confirmación explícita en la información proporcionada.
- Opciones de despliegue: al estar en formato GGUF, el modelo puede ejecutarse con llama.cpp y herramientas compatibles como Ollama. El tag `endpoints_compatible` sugiere que también podría desplegarse en los Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Black-Onyx-5B | 4.628.569.635 | No disponible | Gemma | GGUF |
| Black-Onyx-12B | 12B (nominal) | No disponible | Gemma | GGUF |
| google/gemma-4-E2B-it | No disponible | No disponible | Gemma | No disponible |

## Limitaciones y advertencias

- Acceso restringido: el modelo está protegido por un gate en Hugging Face, por lo que se requiere aceptar las condiciones de uso antes de poder descargarlo.
- Licencia Gemma: la licencia Gemma impone términos específicos que pueden limitar el uso comercial o la redistribución. Se recomienda revisar el texto completo de la licencia antes de utilizar el modelo en producción.
- Sin benchmarks publicados: no se dispone de evaluaciones independientes que permitan comparar su rendimiento con otros modelos de ciberseguridad.
- Datos de entrenamiento no documentados: no se especifica la composición del dataset ni el número de tokens utilizados.
- Especialización de dominio: al estar orientado a ciberseguridad, el modelo puede tener un rendimiento inferior en tareas generales fuera de ese ámbito.
- Riesgo de alucinación: como en todos los modelos de lenguaje, existe la posibilidad de que el modelo genere información falsa o inventada, especialmente en contextos técnicos de seguridad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Clownstein/Black-Onyx-5B-GGUF
- Perfil del autor en Hugging Face: https://huggingface.co/Clownstein
- Modelo hermano Black-Onyx-12B: https://huggingface.co/Clownstein/Black-Onyx-12B-GGUF
