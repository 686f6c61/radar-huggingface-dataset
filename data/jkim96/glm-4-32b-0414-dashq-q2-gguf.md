# jkim96/GLM-4-32B-0414-DASHQ-Q2-GGUF

## Resumen

GLM-4-32B-0414-DASHQ-Q2-GGUF es una publicación de pesos cuantizados en formato GGUF del modelo zai-org/GLM-4-32B-0414, un transformer denso de aproximadamente 32.566 millones de parámetros desarrollado por Zhipu AI (zai-org). El repositorio lo mantiene el usuario jkim96 y aplica DASH-Q, una metodología de cuantización de 2 bits publicada en el repositorio JaeminK/dashq, sobre el modelo base. El objetivo es permitir la ejecución local de un modelo de 32B en hardware de consumo, reduciendo el peso de los ficheros a un rango de 9,26 GB a 12,59 GB frente a los más de 60 GB que ocuparían los pesos en FP16.

El modelo base forma parte de la serie GLM-4-0414 presentada el 14 de abril de 2025, preentrenada sobre 15 billones de tokens de datos de alta calidad que incluyen una proporción sustancial de datos sintéticos de razonamiento, y posteriormente alineada con preferencias humanas. Según la documentación de Zhipu AI, su rendimiento se sitúa en un rango comparable al de modelos propietarios de la generación GPT y a las series DeepSeek V3/R1, con soporte para despliegue local.

La relevancia de esta ficha concreta es doble: por un lado, documenta una alternativa de cuantización agresiva (2 bits por peso) que, según las mediciones de perplejidad del autor, mejora a las cuantizaciones IQ2 y Q2_K de referencia de llama.cpp y de Unsloth; por otro, permite evaluar si un modelo de 32B degradado a 2 bits sigue siendo utilizable en producción o en investigación con GPU de gama media. Todos los ficheros emplean exclusivamente tipos de tensor estándar de llama.cpp (ningún tensor por encima de 4 bits) y cargan en builds recientes de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia GLM-4 (según la documentación del modelo base); no se detalla en la model card de la cuantización |
| Parametros totales | 32.566.081.536 (~32,57 B) |
| Parametros activos | No aplica: la información disponible no indica que el modelo sea MoE |
| Longitud de contexto | No disponible (el modelo base se describe como de contexto largo, sin cifra concreta en la información proporcionada) |
| Tipos de cuantizacion | IQ2_XXS (9,26 GB, 2,27 bits/peso), IQ2_XS (10,70 GB, 2,63 bits/peso), IQ2_M (11,47 GB, 2,82 bits/peso), Q2_K_XL (12,59 GB, 3,09 bits/peso) |
| Idiomas soportados | No disponible en la model card de la cuantización; el modelo base se describe como multilingüe |
| Licencia | MIT (heredada del modelo base zai-org/GLM-4-32B-0414) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La model card de esta publicación no describe la arquitectura interna del modelo, ya que se trata de una cuantización del modelo base. Según la documentación de Zhipu AI, GLM-4-32B-Base-0414 se preentrenó sobre aproximadamente 15 billones de tokens de datos de alta calidad, con una proporción sustancial de datos sintéticos orientados a razonamiento, y después se sometió a post-entrenamiento con alineación de preferencias humanas. La serie GLM-4-0414 incluye variantes de base conversacional y variantes de razonamiento (GLM-Z1-32B-0414), construidas estas últimas mediante arranque en frío y aprendizaje por refuerzo extendido en matemáticas, código y lógica.

La innovación técnica de este repositorio concreto es DASH-Q, un método de cuantización de 2 bits que el autor compara contra las cuantizaciones IQ2 con imatrix de llama.cpp y las cuantizaciones UD de Unsloth. El método produce ficheros con tipos de tensor estándar de llama.cpp (IQ2_XXS, IQ2_XS, IQ2_M y Q2_K_XL), sin ningún tensor por encima de 4 bits, lo que garantiza compatibilidad con builds recientes de llama.cpp sin necesidad de parches. No se especifica en la información disponible el número de tokens de calibración, la composición del dataset de calibración ni si se empleó una matriz de importancia propia. El comando de ejemplo proporcionado por el autor es `llama-cli -m GLM-4-32B-0414-DASHQ-Q2_K_XL.gguf -ngl 99 -c 8192`.

## Capacidades

- Generación de texto conversacional en modo diálogo, heredada del modelo base GLM-4-32B-0414.
- El modelo base GLM-4-32B-0414 está descrito por Zhipu AI como un modelo de diálogo post-entrenado con alineación de preferencias humanas.
- La variante de razonamiento de la misma serie (GLM-Z1-32B-0414) sí incorpora entrenamiento por refuerzo en matemáticas, código y lógica, pero esta publicación concreta parte del modelo base conversacional, no de la variante de razonamiento.
- Soporte multilingüe: la información de la web describe la familia GLM-4 como multilingüe, aunque la model card de la cuantización no enumera idiomas concretos.
- Soporte de tool calling, function calling y agentes: no disponible en la información proporcionada para esta publicación.
- Capacidades de visión o audio: no disponible en la información proporcionada; no se mencionan en la model card.
- Modo de pensamiento explícito (thinking mode): no disponible para esta variante.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` aparece en los metadatos del repositorio.

## Casos de uso

- Ejecución local de un modelo de 32B en equipos de consumo: con ficheros de entre 9,26 GB y 12,59 GB, un usuario con una GPU de 12 GB o con una configuración híbrida CPU+GPU puede cargar el modelo completo mediante llama.cpp con `-ngl` parcial o total, algo inviable con los pesos en FP16.
- Investigación sobre cuantización extrema: el repositorio incluye mediciones de perplejidad comparadas con IQ2_XXS, IQ2_XS, IQ2_M y Q2_K de llama.cpp y con las versiones UD de Unsloth, lo que lo convierte en un punto de referencia para estudiar el impacto de los 2 bits en modelos de 32B.
- Laboratorios docentes y pruebas de concepto: el coste de almacenamiento (repositorio de 44 GB con las cuatro variantes) y de inferencia permite desplegar un 32B en aulas o entornos de formación sin clústeres de GPU.
- Prototipado de asistentes conversacionales en local: al ser un modelo de diálogo, puede usarse para validar flujos conversacionales multi-turno antes de migrar a una cuantización de mayor precisión o al modelo completo.
- Inferencia en el borde o en entornos sin conectividad: el tamaño reducido del fichero IQ2_XXS (9,26 GB) permite distribuirlo en estaciones de trabajo aisladas donde no se puede descargar un modelo de mayor peso.
- Comparación de pipelines de cuantización en CI: al exponer cuatro niveles de cuantización con métricas de perplejidad publicadas, sirve como caso de prueba reproducible (`llama-perplexity`, contexto 2048, WikiText-2 y C4) para validar herramientas de evaluación propias.
- Despliegue en servidores con VRAM limitada para tareas de generación de texto no críticas, asumiendo la degradación de calidad inherente a 2 bits.

## Benchmarks y rendimiento

El autor publica únicamente métricas de perplejidad, medidas con `llama-perplexity` a contexto 2048 sobre WikiText-2 (test) y C4 (validación, 256 secuencias de 2048 tokens). No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la información disponible.

| Tipo | Modelo | Tamano | WikiText-2 | C4 |
|---|---|---|---|---|
| IQ2_XXS | llama.cpp IQ2_XXS (imatrix) | 8,98 GB | 9,97 | 13,78 |
| IQ2_XXS | unsloth UD-IQ2_XXS | 9,26 GB | 10,03 | 13,57 |
| IQ2_XXS | DASH-Q IQ2_XXS | 9,26 GB | 9,06 | 12,99 |
| IQ2_XS | llama.cpp IQ2_XS (imatrix) | 9,90 GB | 9,17 | 12,79 |
| IQ2_XS | DASH-Q IQ2_XS | 10,70 GB | 8,07 | 12,12 |
| IQ2_M | llama.cpp IQ2_M (imatrix) | 11,27 GB | 7,96 | 11,82 |
| IQ2_M | unsloth UD-IQ2_M | 11,47 GB | 7,91 | 11,80 |
| IQ2_M | DASH-Q IQ2_M | 11,47 GB | 7,60 | 11,48 |
| Q2_K_XL | llama.cpp Q2_K (imatrix) | 12,29 GB | 7,70 | 11,65 |
| Q2_K_XL | unsloth UD-Q2_K_XL | 12,81 GB | 7,69 | 11,59 |
| Q2_K_XL | DASH-Q Q2_K_XL | 12,59 GB | 7,61 | 11,36 |

En todas las comparaciones por nivel de bits, las variantes DASH-Q obtienen una perplejidad inferior a las alternativas de llama.cpp y Unsloth. La mejora es especialmente marcada en IQ2_XS (8,07 frente a 9,17 en WikiText-2). No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: 9,26 GB (IQ2_XXS), 10,70 GB (IQ2_XS), 11,47 GB (IQ2_M), 12,59 GB (Q2_K_XL). A estas cifras hay que sumar la caché KV, cuyo tamaño depende del contexto configurado y de los parámetros de atención del modelo, no especificados en la información disponible.
- Con la variante IQ2_XXS y un contexto moderado, el modelo puede caber en GPU de consumo de 12 GB (por ejemplo, RTX 3060 12 GB, RTX 4070) siempre que se ajuste la caché KV.
- Las variantes IQ2_M y Q2_K_XL encajan con más holgura en GPU de 16 GB o superiores (RTX 4060 Ti 16 GB, RTX 4080, RTX 4090, RTX 5090), permitiendo mayor contexto.
- En GPU de 24 GB o más (RTX 3090, RTX 4090, A100 40 GB, H100) el modelo completo cabe sin descarga a CPU, incluso con contextos amplios.
- Despliegue en CPU pura: viable con llama.cpp y memoria RAM suficiente; el autor no publica cifras de throughput ni latencia.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y cualquier frontend compatible con GGUF (Ollama, LM Studio, text-generation-webui) siempre que acepte los tipos de tensor IQ2_XXS, IQ2_XS, IQ2_M y Q2_K_XL. No se menciona compatibilidad con vLLM ni TGI, que no consumen GGUF de forma nativa.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

Comparación dentro de la misma publicación, que es donde el autor aporta datos verificables:

| Cuantizacion | Tamano | Bits/peso | WikiText-2 | C4 |
|---|---|---|---|---|
| DASH-Q IQ2_XXS | 9,26 GB | 2,27 | 9,06 | 12,99 |
| llama.cpp IQ2_XXS (imatrix) | 8,98 GB | no disponible | 9,97 | 13,78 |
| DASH-Q IQ2_M | 11,47 GB | 2,82 | 7,60 | 11,48 |
| unsloth UD-IQ2_M | 11,47 GB | no disponible | 7,91 | 11,80 |
| DASH-Q Q2_K_XL | 12,59 GB | 3,09 | 7,61 | 11,36 |
| unsloth UD-Q2_K_XL | 12,81 GB | no disponible | 7,69 | 11,59 |

Comparación con alternativas de la misma categoría (modelos densos de ~30B en formato GGUF):

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GLM-4-32B-0414 (DASH-Q Q2) | ~32,57 B | no disponible | MIT | GGUF en este repositorio |
| GLM-4-32B-0414 (original) | ~32,57 B | no disponible en la información proporcionada | MIT | zai-org/GLM-4-32B-0414 en HuggingFace |
| Modelos comparables de ~30B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de tareas para establecer una comparación de rendimiento funcional con otros modelos de 30-35B (por ejemplo, Qwen o Llama de tamaño equivalente), ya que la información proporcionada solo incluye perplejidad.

## Limitaciones y advertencias

- La cuantización a 2 bits implica una degradación de calidad significativa respecto al modelo en FP16 o a cuantizaciones de 4-8 bits. Las perplejidades de WikiText-2 en el rango 7,60-9,06 son notablemente superiores a las típicas de cuantizaciones Q4_K_M, y no se han publicado evaluaciones de tareas que permitan cuantificar el impacto real en razonamiento, código o matemáticas.
- Los datos comparativos de perplejidad provienen del propio autor de la cuantización; no se han replicado de forma independiente en la información disponible.
- Riesgo de alucinación: no disponible de forma específica para esta cuantización; debe asumirse el comportamiento del modelo base, potencialmente agravado por el ruido introducido en la cuantización de 2 bits.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto e idioma: la model card no especifica la longitud de contexto soportada ni la lista de idiomas. El ejemplo de uso emplea `-c 8192`, pero se trata de un valor de configuración de ejemplo, no de la ventana nativa del modelo.
- Estado de adopción: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación por parte de la comunidad.
- Fecha de creación del repositorio: 8 de octubre de 2026, según los metadatos de HuggingFace. Conviene verificar la vigencia y el mantenimiento del repositorio antes de usarlo en producción.
- Licencia: el repositorio declara MIT, heredada del modelo base. Esto permite uso comercial, pero conviene verificar los términos del modelo base zai-org/GLM-4-32B-0414 por si existiesen condiciones adicionales no reflejadas en la model card de la cuantización.
- Compatibilidad: el autor afirma que los ficheros cargan en cualquier build reciente de llama.cpp, pero no se especifica la versión mínima requerida ni se garantiza el soporte en herramientas de terceros que no implementen los tipos IQ2_XXS, IQ2_XS, IQ2_M o Q2_K_XL.
- Para producción con requisitos de fiabilidad, se recomienda usar una cuantización de mayor precisión (Q4 o superior) y reservar estas variantes de 2 bits para entornos con restricciones severas de memoria.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/jkim96/GLM-4-32B-0414-DASHQ-Q2-GGUF
- Modelo base en HuggingFace: https://huggingface.co/zai-org/GLM-4-32B-0414
- Repositorio del método DASH-Q: https://github.com/JaeminK/dashq
- Documentación de GLM-4-0414 en Transformers: https://huggingface.co/docs/transformers/v5.1.0/model_doc/glm4
- Repositorio GitHub de la familia GLM-4: https://github.com/zai-org/GLM-4
- Artículo sobre instalación y ejecución de GLM-4-0414 (32B y 9B): https://hysenlabs.com/en/projects/zai-org-glm-4
- Espejo del proyecto GLM-4 en SourceForge: https://sourceforge.net/projects/glm-4.mirror/
