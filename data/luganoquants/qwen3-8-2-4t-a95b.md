# luganoquants/Qwen3.8-2.4T-A95B

## Resumen

Qwen3.8-2.4T-A95B es el modelo de código abierto más grande lanzado por Alibaba Qwen hasta la fecha, y supone la primera vez que la compañía libera los pesos de un modelo de la clase Qwen-Max. Se trata de un modelo de lenguaje causal con arquitectura de mezcla de expertos (MoE) dispersa: 2,4 billones de parámetros totales con aproximadamente 95 000 millones de parámetros activos por token. El modelo está diseñado para tareas complejas de codificación, trabajo profesional, investigación y ejecución de agentes de largo horizonte, con mejoras sustanciales respecto a la generación anterior Qwen3.5 y Qwen3.6.

La arquitectura combina atención lineal Gated DeltaNet con atención completa Gated Attention en un patrón híbrido intercalado, lo que permite manejar contextos largos de forma eficiente. Su ventana de contexto nativa es de 262 144 tokens, extensible hasta aproximadamente 1 010 000 tokens. El modelo se distribuye bajo una licencia propia denominada `qwen3.8-max`, que incluye cláusulas de reparto de ingresos para uso comercial, y está disponible en formato Transformers (safetensors) compatible con vLLM, SGLang y TokenSpeed.

El repositorio analizado aquí es un mirror creado por el usuario `luganoquants` en Hugging Face, que replica los pesos y la configuración del lanzamiento oficial de Qwen. El modelo oficial se publicó en agosto de 2026 y ocupa aproximadamente 4,9 TB en precisión FP16/BF16, lo que condiciona fuertemente los requisitos de hardware para su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida con Gated DeltaNet (atencion lineal) y Gated Attention (atencion completa cada 4.ª capa) |
| Parametros totales | 2 446 182 725 504 (~2,4 billones) |
| Parametros activos | ~95 000 millones (95B) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 010 000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen3.8-max (licencia propia con clausulas de reparto de ingresos) |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

Qwen3.8-2.4T-A95B es un modelo de lenguaje causal con una arquitectura de mezcla de expertos (MoE) dispersa. La configuración interna incluye 92 capas ocultas con una dimensión de 8192, organizadas en un patrón repetido de 23 bloques, donde cada bloque contiene tres subcapas de Gated DeltaNet seguidas de una subcapa MoE, y cada cuarto bloque incorpora además una subcapa de Gated Attention. La atención lineal Gated DeltaNet utiliza 128 cabezas para el valor (V) y 16 para las consultas/claves (QK) con dimensión de cabeza 128, mientras que la atención completa Gated Attention emplea 64 cabezas para consultas y 4 para claves/valores con dimensión 256 y embeddings rotatorios (RoPE) de dimensión 64. El bloque MoE contiene 512 expertos, de los cuales se activan 10 expertos enrutados más un experto compartido, con una dimensión intermedia de 2048 por experto.

El modelo fue entrenado en dos fases: preentrenamiento y postentrenamiento. Incluye predicción multi-token (MTP) entrenada con múltiples pasos, una técnica que permite predecir varios tokens futuros simultáneamente para mejorar la eficiencia de decodificación. No se han publicado detalles específicos sobre el volumen de tokens de entrenamiento ni la composición del dataset en la información disponible. El modelo admite control flexible del razonamiento mediante los parámetros `reasoning_effort` (para ajustar la profundidad del razonamiento) y `preserve_thinking` (para conservar el contexto de razonamiento en mensajes históricos).

## Capacidades

- Generacion de texto y conversacion multimodal de texto, con soporte para tareas de razonamiento complejo y pensamiento profundo (thinking mode).
- Razonamiento avanzado en matematicas, logica y resolucion de problemas cientificos, con resultados destacados en benchmarks como GPQA Diamond (92,6).
- Generacion de codigo y agentes de codificacion, con soporte para tareas de terminal y resolucion de incidencias en repositorios reales (Terminal Bench 2.1: 86,6; SWE-bench Pro: dato parcial).
- Ejecucion de agentes de largo horizonte, con planificacion autonoma y manejo de retroalimentacion del entorno para completar tareas de multiples pasos de forma fiable.
- Soporte de tool calling y function calling, integrable en pipelines de automatizacion y desarrollo.
- Capacidades multilingues: no se han publicado los idiomas soportados en la informacion disponible, aunque por la familia Qwen se espera cobertura de multiples lenguas.
- Control flexible del razonamiento mediante `reasoning_effort` y `preserve_thinking`, permitiendo ajustar el equilibrio entre velocidad y profundidad de razonamiento.
- Compatibilidad con harnesses y herramientas de desarrollo populares (vLLM, SGLang, TokenSpeed) para integracion en stacks existentes.

## Casos de uso

- Agentes de codificacion autonomos: el modelo puede ejecutar tareas complejas de desarrollo en entornos de terminal, como la resolucion de incidencias en repositorios reales (SWE-bench Pro) o la automatizacion de flujos de integracion continua, gracias a su capacidad de planificacion multi-paso y manejo de retroalimentacion del entorno.
- Asistente de investigacion cientifica: con un resultado de 93,0 en PaperBench y 92,6 en GPQA Diamond, puede ayudar a investigadores a analizar articulos, disenar experimentos y resolver problemas cientificos de alto nivel.
- Automatizacion de tareas de oficina y trabajo profesional: el modelo puede redactar informes, resumir documentos extensos y gestionar flujos de trabajo complejos que requieren razonamiento contextual sobre ventanas de hasta 1 millon de tokens.
- Desarrollo de agentes de software de largo alcance: gracias a su arquitectura hibrida y su contexto amplio, puede mantener el estado de conversaciones y tareas durante largas sesiones, ideal para asistentes de programacion que interactuan con multiples archivos y herramientas.
- Generacion y revision de codigo en produccion: con soporte de tool calling, puede integrarse en pipelines de CI/CD para generar pruebas, revisar pull requests o refactorizar codigo automaticamente.
- Razonamiento logico y matematico avanzado: su rendimiento en benchmarks de razonamiento lo hace adecuado para aplicaciones educativas, tutoria inteligente o sistemas de soporte a la decision que requieren justificaciones rigurosas.

## Benchmarks y rendimiento

La model card oficial proporciona resultados comparativos para dos benchmarks de agentes de codificacion, y la documentacion de QwenCloud anade metricas adicionales. Se presentan a continuacion los datos disponibles, sin valores inventados.

| Benchmark | Qwen3.8-Max (open weights) |
|---|---|
| Terminal Bench 2.1 | 86,6 |
| SWE-bench Pro | no disponible (dato incompleto en la fuente) |
| GPQA Diamond | 92,6 |
| PaperBench | 93,0 |
| OSWorld | 86,1 |
| BabyVision | 82,0 |

Comparativa con otros modelos en los benchmarks de la model card:

| Modelo | Terminal Bench 2.1 | SWE-bench Pro |
|---|---|---|
| Opus 4.8 | 84,6 | 69,2 |
| Fable 5 | 84,6 | 80,0 |
| GPT 5.6 Sol (max) | 88,8 | 64,6 |
| Qwen3.7-Max | 74,5 | 60,6 |
| Qwen3.8-Max | 86,6 | no disponible |

Ademas, segun QwenCloud, el modelo esta clasificado en el 4.º puesto en el ranking CodeArena.

## Requisitos de hardware

- El repositorio ocupa 4892,4 GB en formato safetensors (presumiblemente FP16/BF16), lo que implica que los pesos completos requieren aproximadamente 4,9 TB de VRAM para cargarse sin cuantizacion.
- No es posible ejecutar este modelo en una GPU de consumo (RTX 4090, 3090, etc.) con los pesos completos. Se necesita un cluster de GPUs de alta gama, por ejemplo 32x H100 80GB o 24x H200 141GB, para inferencia en FP16.
- Con cuantizacion FP8 (si estuviera disponible) la VRAM necesaria se reduciria a aproximadamente 2,4 TB, y con cuantizacion de 4 bits a unos 1,2 TB, pero incluso asi se requieren multiples GPUs.
- Opciones de despliegue compatibles segun la model card: vLLM, SGLang y TokenSpeed. No se menciona compatibilidad con llama.cpp u Ollama en la informacion disponible.
- La latencia y el throughput dependen fuertemente del hardware y la configuracion de cuantizacion; no se han publicado cifras oficiales.

## Comparativa con modelos similares

La siguiente tabla compara Qwen3.8-2.4T-A95B con otros modelos de la misma categoria (flagship de alto rendimiento) basandose en los datos disponibles. No se dispone de especificaciones completas de los modelos comparados, solo de los benchmarks publicados en la model card.

| Modelo | Parametros | Contexto | Terminal Bench 2.1 | SWE-bench Pro | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-2.4T-A95B | 2,4T totales / 95B activos | 262K nativo, 1M extensible | 86,6 | no disponible | qwen3.8-max (revenue-share) |
| Qwen3.7-Max | no disponible | no disponible | 74,5 | 60,6 | propietaria |
| Opus 4.8 | no disponible | no disponible | 84,6 | 69,2 | propietaria |
| GPT 5.6 Sol (max) | no disponible | no disponible | 88,8 | 64,6 | propietaria |
| Fable 5 | no disponible | no disponible | 84,6 | 80,0 | propietaria |

Qwen3.8-2.4T-A95B es el unico modelo de esta comparativa con pesos abiertos, aunque su licencia impone restricciones comerciales. En los benchmarks disponibles, supera a Qwen3.7-Max y compite de cerca con los modelos propietarios de la generacion actual.

## Limitaciones y advertencias

- El modelo es exclusivamente de texto (text-only) en su version open weights; la version comercial Qwen3.8-Max a traves de la API incluye entrada de vision y otras funcionalidades adicionales, pero no estan presentes en los pesos liberados.
- La licencia `qwen3.8-max` incluye clausulas de reparto de ingresos para uso comercial, lo que puede suponer un coste adicional y restricciones legales para empresas que planeen desplegarlo en produccion.
- No se han publicado los idiomas soportados ni la composicion del dataset de entrenamiento, lo que dificulta evaluar su comportamiento en lenguas minoritarias o dominios especificos.
- El contexto nativo es de 262 144 tokens; la extension hasta 1 010 000 tokens puede requerir configuraciones adicionales y no esta garantizada en todos los entornos de despliegue.
- El tamaño extremo del modelo (4,9 TB en FP16) hace que su despliegue sea inviable para la mayoria de organizaciones, limitando su uso practico a grandes centros de computacion o proveedores de nube.
- No se dispone de informacion sobre sesgos especificos o riesgos de alucinacion para este modelo concreto, aunque al ser un modelo de gran escala es previsible que presente los sesgos tipicos de los modelos entrenados con datos web.
- El repositorio analizado es un mirror no oficial (usuario `luganoquants`); se recomienda verificar la autenticidad de los pesos antes de su uso en entornos de produccion.

## Enlaces

- Repositorio mirror en Hugging Face: https://huggingface.co/luganoquants/Qwen3.8-2.4T-A95B
- Repositorio oficial de Qwen en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- Documentacion de QwenCloud: https://www.qwencloud.com/models/qwen3.8-2.4t-a95b
- Blog de Qwen sobre Qwen3.8-Max: https://qwen.ai/blog?id=qwen3.8
- Analisis de explainx.ai: https://www.explainx.ai/blog/qwen3-8-max-open-weights-live-hugging-face-august-2026
- Especificaciones y requisitos VRAM en apxml.com: https://apxml.com/models/qwen38-24t-a95b
- Informacion adicional en OpenLM.ai: https://openlm.ai/qwen3.8/
