# orcarouter/Qwen3.8-Flash-Next-Uncensored-GGUF

## Resumen

Qwen3.8-Flash-Next-Uncensored-GGUF es una versión cuantizada en formato GGUF del modelo Qwen3.8-Flash-Next, publicada por el usuario orcarouter en Hugging Face. Se trata de un modelo de arquitectura MoE (mixture of experts) con aproximadamente 177.000 millones de parámetros totales, derivado del modelo base de Qwen, y sometido a un proceso de "abliteration" (eliminación de mecanismos de rechazo) para producir una variante sin censura orientada a red teaming y aplicaciones que requieren respuestas sin filtros de seguridad. El pipeline declarado es image-text-to-text, lo que indica capacidades de visión-lenguaje, y el repositorio incluye ficheros mmproj para el codificador visual.

La relevancia de esta ficha radica en que combina tres elementos poco habituales en un mismo artefacto: un modelo de gran tamaño tipo MoE, cuantización GGUF optimizada con imatrix para ejecución en llama.cpp, y una modificación deliberada del comportamiento de rechazo. El modelo está pensado para investigadores de seguridad, evaluaciones de robustez y despliegues donde los filtros por defecto resultan un obstáculo, pero no para aplicaciones comerciales sensibles sin supervisión.

El acceso al repositorio es restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos. El repositorio ocupa aproximadamente 2,4 TB, lo que refleja la presencia de múltiples niveles de cuantización para un modelo de este tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), transformer; incluye codificador visual (mmproj) para image-text-to-text |
| Parámetros totales | 176.943.899.520 (~177B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF, con cuantización asistida por imatrix; niveles concretos no disponibles |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo con ficheros mmproj para visión); safetensors solo como referencia del modelo base |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura de mezcla de expertos (MoE) sobre un transformer, con un total de aproximadamente 177.000 millones de parámetros. La variante publicada por orcarouter mantiene esa arquitectura y añade un codificador visual (ficheros mmproj) que habilita el pipeline image-text-to-text, además de soporte declarado para function calling y reasoning. La etiqueta "flash-next" sugiere una generación posterior dentro de la familia Qwen, aunque no se dispone de detalles oficiales sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la información proporcionada.

La modificación principal respecto al modelo base es la "abliteration": un proceso de edición de pesos orientado a eliminar o atenuar las respuestas de rechazo aprendidas durante el alineamiento. Este proceso se aplica típicamente sobre las direcciones de activación asociadas al comportamiento de negativa, y suele degradar parcialmente la coherencia y la calidad en tareas generales. La cuantización GGUF se ha realizado con imatrix (matriz de importancia), técnica que mejora la fidelidad de los pesos cuantizados respecto a una cuantización uniforme, especialmente en modelos grandes. No se dispone de información sobre innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento explícito (tag "reasoning") y resolución de problemas de varios pasos.
- Soporte de function calling / tool calling, según las etiquetas del repositorio.
- Procesamiento de imagen y texto (image-text-to-text) mediante el codificador visual mmproj.
- Comportamiento "uncensored": ausencia o atenuación de rechazos ante peticiones que el modelo base declinaría.
- Orientación a red teaming y evaluación de seguridad (tags ai-red-team, red-teaming).
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su exposición mediante APIs compatibles.
- Ejecución en llama.cpp gracias al formato GGUF.

## Casos de uso

- Red teaming y evaluación de seguridad: el modelo permite generar respuestas que el modelo base rechazaría, lo que resulta útil para construir conjuntos de pruebas adversarias y medir la robustez de filtros y clasificadores de contenido en pipelines propios.
- Investigación sobre alineación y abliteration: comparar el comportamiento del modelo base frente a la variante sin censura permite estudiar qué capacidades y sesgos se ven afectados por la eliminación de rechazos, con el mismo prompt y temperatura controlada.
- Análisis de imágenes en entornos de investigación: gracias al pipeline image-text-to-text y los ficheros mmproj, se pueden describir, clasificar o extraer información de imágenes en flujos de trabajo locales con llama.cpp.
- Asistencia conversacional en inglés y chino: despliegue de un chatbot multi-turno para usuarios de esas dos lenguas, con la ventaja de que el modelo no impone rechazos por defecto en dominios creativos o de ficción.
- Generación de escenarios de ficción y contenido creativo sin restricciones temáticas: útil en escritura de narrativa adulta o guiones donde los filtros estándar interrumpen la generación; requiere revisión humana posterior.
- Automatización con tool calling en flujos internos: integración del modelo en pipelines que necesitan invocar funciones (consultas a bases de datos, APIs internas) con un modelo local cuantizado, evitando dependencias de proveedores externos.
- Experimentación con MoE de gran tamaño en hardware propio: al estar en GGUF, permite probar un modelo de ~177B parámetros con cuantizaciones agresivas en estaciones de trabajo con varias GPU o con CPU y RAM abundante, sin necesidad de infraestructura de centro de datos completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de ~177B parámetros en GGUF, las cuantizaciones de 4 bits requieren del orden de 90-100 GB, y las de 8 bits en torno a 180 GB, aunque estas cifras son estimaciones basadas en el tamaño y no datos publicados por el autor.
- GPU recomendadas: para cuantizaciones de 4 bits, configuraciones multi-GPU como 2x A100 80GB o 2x H100 80GB; para cuantizaciones más agresivas (2-3 bits), posible en 1x A100 80GB o 1x H100 80GB.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) en ninguna cuantización razonable; sería necesario descargar capas a RAM del sistema (offloading), con latencia muy alta.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama si se publica una variante compatible, y servidores compatibles con endpoints según el tag endpoints_compatible; vLLM y TGI no soportan GGUF de forma nativa para este tamaño sin conversión.
- Latencia y throughput: no disponibles; en configuraciones con offloading a CPU se espera un throughput bajo (decenas de tokens por segundo como máximo en el mejor caso, y mucho menor con offloading intensivo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-GGUF (este) | ~177B (MoE) | no disponible | apache-2.0 | GGUF | Variante abliterated, visión, acceso gated |
| Qwen3.8-Flash-Next (base) | ~177B (MoE) | no disponible | apache-2.0 | safetensors | Modelo original con alineación estándar |
| Otras variantes GGUF de Qwen de gran tamaño | variable | no disponible | apache-2.0 | GGUF | Dependen del publicador; calidad de cuantización variable |

No se dispone de información sobre benchmarks comparativos ni de otros modelos directamente equivalentes en la información proporcionada.

## Limitaciones y advertencias

- La abliteration degrada típicamente la coherencia, la calidad de razonamiento y la fidelidad factual respecto al modelo base; no debe asumirse paridad de rendimiento.
- Riesgo elevado de generar contenido dañino, ofensivo o inexacto: el modelo no aplica rechazos por defecto, por lo que requiere moderación externa en cualquier despliegue con usuarios.
- Sesgos conocidos: no documentados en la información disponible; los sesgos del modelo base persisten y pueden amplificarse por la pérdida de alineación.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no disponible; no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías y la responsabilidad sobre el contenido generado recae en el desplegador; conviene revisar las condiciones del acceso gated.
- El repositorio ocupa ~2,4 TB; la descarga selectiva de una sola cuantización es imprescindible.
- No hay benchmarks publicados; cualquier afirmación de rendimiento debe validarse con evaluaciones propias.
- El tag "qwen4" en el repositorio no está respaldado por información oficial y debe tratarse con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- No se han encontrado otros enlaces (papers, blogs, demos) en la información proporcionada.
