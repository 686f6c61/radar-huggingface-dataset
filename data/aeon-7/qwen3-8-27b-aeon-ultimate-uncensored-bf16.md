# AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16

## Resumen

Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 es un ajuste fino del modelo Qwen/Qwen3.8-27B publicado por el usuario AEON-7 bajo licencia Apache 2.0. Se trata de una variante "abliterated" (con las capas de rechazo eliminadas mediante manipulación de direcciones de activación) que conserva intactos el torreón de visión y la cabeza MTP nativa del modelo base. Con 27.781.427.952 parámetros en precisión BF16 y un repositorio de 55,6 GB, está pensado como maestro de precisión completa desde el que se derivan otras variantes cuantizadas (NVFP4-MIXED, MXFP4-MXFP6-ROCm).

El modelo hereda del base Qwen3.8 una arquitectura híbrida con atención lineal (Gated DeltaNet, "GDN"), componentes tipo Mamba, atención híbrida, decodificación especulativa con cabeza MTP y capacidades multimodales (image-text-to-text). El autor lo posiciona como un "Early Access Draft": funciona correctamente en tareas ordinarias, pero en respuestas extremadamente largas pueden aparecer bucles y repeticiones por los huecos que deja la eliminación de las capas de rechazo.

Es relevante ahora porque combina el rendimiento de un modelo de 27B con contexto largo, tool calling, razonamiento y visión, en una versión sin filtros de rechazo, algo que interesa a desarrolladores que necesitan respuestas sin sermones en entornos controlados. No obstante, su estado de borrador y las advertencias del propio autor sobre degradación en contexto largo deben tenerse muy en cuenta antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (Gated DeltaNet), componentes Mamba, atención híbrida y cabeza MTP; multimodal (image-text-to-text) |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (etiquetado como long-context, sin cifra concreta) |
| Tipos de cuantizacion | BF16 (este repo); variantes derivadas: NVFP4-MIXED (ModelOpt NVFP4 + FP8 + BF16), MXFP4-MXFP6 (AMD Quark, OCP MX) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención lineal del tipo Gated DeltaNet (GDN) con componentes Mamba y capas de atención estándar, lo que permite manejar contexto largo con menor coste computacional que un transformer denso puro. Incluye una cabeza MTP (Multi-Token Prediction) nativa que habilita decodificación especulativa, y un torreón de visión para entrada image-text-to-text. El ajuste de AEON-7 parte del checkpoint oficial Qwen3.8-27B y aplica técnicas de abliteración (abliterix) orientadas a eliminar las capas de rechazo manteniendo la coherencia, según declara el autor: "abliterated for coherence and better answers, not for a vanity KL of zero". El torreón de visión y la cabeza MTP no se modifican.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el ajuste. El autor describe el proceso como una "primera pasada" por las capas de rechazo y anuncia una versión GA con una abliteración "más quirúrgica" que preserve la estructura instructiva. Se menciona también un drafter de decodificación especulativa (AEON DFlash2) entrenado específicamente para esta familia, con mejoras medidas de +21% en tok/s a T=0.6 y +35% a T=1.0 sobre el DFlash2 estándar en una DGX Spark, y 3,2× frente a no usar drafter, manteniendo la verificación de cada token por parte del modelo de 27B.

## Capacidades

- Generación de texto conversacional e instructivo en inglés, chino y multilingüe.
- Razonamiento con modo "thinking" (etiqueta thinking en los tags).
- Generación de código y asistencia a programación (tags coding, instruct).
- Capacidades multimodales de visión: entrada image-text-to-text mediante torreón de visión sin modificar.
- Tool calling y function calling, con compatibilidad con endpoints estilo OpenAI (openai-compatible).
- Comportamiento agéntico y razonamiento multi-paso (tags agentic, agentic workflows).
- Contexto largo (long-context) gracias a la atención lineal GDN y componentes Mamba.
- Decodificación especulativa mediante cabeza MTP nativa y drafter externo DFlash2.
- Respuestas sin rechazo ni monólogo de seguridad (refusal-removed, uncensored), orientado a entornos donde se requiere cumplimiento directo.
- Compatibilidad de despliegue con vLLM y transformers; tags específicos para DGX Spark (GB10), RTX 5090, RTX PRO 6000 y H200.

## Casos de uso

- **Asistencia conversacional sin filtros en entornos controlados**: el modelo mantiene conversaciones multi-turno con contexto largo y responde sin monólogos de seguridad, adecuado para prototipos internos donde el equipo asume la responsabilidad del contenido generado.
- **Generación de código en pipelines de CI/CD**: gracias al soporte de tool calling y function calling y a su compatibilidad con endpoints OpenAI, puede integrarse en flujos automatizados de revisión, generación de tests o documentación técnica.
- **Análisis de documentos e imágenes**: el torreón de visión permite procesar capturas, diagramas o documentos escaneados junto con texto, útil para extracción de información en herramientas internas.
- **Razonamiento multi-paso y agentes autónomos**: la combinación de modo thinking, tool calling y contexto largo lo hace apto para agentes que planifican y ejecutan tareas encadenadas con verificación intermedia.
- **Investigación sobre alineación y abliteración**: al ser un maestro BF16 de una variante abliterated, sirve como objeto de estudio para comparar comportamiento antes y después de eliminar capas de rechazo, y como base para derivar cuantizaciones.
- **Despliegue en estaciones de trabajo con GPU de gran memoria**: pensado para H200, RTX PRO 6000 o configuraciones multi-GPU donde se quiere el maestro de precisión completa como teacher para destilación o generación de datos.
- **Generación de datos sintéticos y evaluación interna**: su naturaleza sin filtros permite generar respuestas variadas para conjuntos de evaluación, con la advertencia de revisar la calidad en respuestas largas por riesgo de bucles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta métricas de velocidad del drafter DFlash2 asociado (+21% tok/s a T=0.6, +35% a T=1.0 sobre el DFlash2 estándar en una DGX Spark, y 3,2× frente a no usar drafter), sin tablas de MMLU, HumanEval, GSM8K ni comparaciones de calidad con otros modelos.

## Requisitos de hardware

- **VRAM estimada para BF16**: el repositorio ocupa 55,6 GB, por lo que la inferencia en BF16 requiere al menos ~56-60 GB de VRAM (pesos más caché KV y overhead).
- **GPU recomendadas para este maestro BF16**: H200 (141 GB), RTX PRO 6000 (96 GB) o configuraciones multi-GPU. El autor menciona H200 y multi-GPU como destino del maestro.
- **Consumer GPU**: no cabe en RTX 4090 (24 GB) ni en RTX 5090 (32 GB) en BF16. Para esas tarjetas el autor remite a la variante NVFP4-MIXED (~23 GB), que sí está pensada para DGX Spark, RTX 5090 y RTX PRO 6000.
- **Opciones de despliegue**: vLLM (el autor publica recetas `aeon-vllm-ultimate:latest` para Spark y `aeon-vllm-ultimate-rtx:latest` para RTX en la tarjeta del modelo NVFP4-MIXED), transformers, y endpoints compatibles con OpenAI.
- **Latencia y throughput**: no disponibles para este BF16; las únicas cifras publicadas son las del drafter DFlash2 en DGX Spark (ver sección de benchmarks).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 | 27,78B | no disponible (long-context) | Apache 2.0 | Hugging Face, 55.256 descargas | Variante abliterated, estado Early Access Draft |
| Qwen/Qwen3.8-27B (base) | 27B (no se detalla) | no disponible | Apache 2.0 | Hugging Face oficial | Modelo original con capas de rechazo intactas; referencia de calidad |
| AEON NVFP4-MIXED (misma familia) | ~27B (cuantizado) | no disponible | Apache 2.0 | Hugging Face | ~23 GB, orientado a DGX Spark, RTX 5090 y RTX PRO 6000 |
| AEON MXFP4-MXFP6-ROCm (misma familia) | ~27B (cuantizado) | no disponible | Apache 2.0 | Hugging Face (gated) | ~23,7 GB, para AMD ROCm (R9700, MI350/MI355) |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de otros desarrolladores; la comparativa se limita a la familia Qwen3.8 y sus derivados cuantizados.

## Limitaciones y advertencias

- **Estado de borrador**: el propio autor lo califica como "Early Access Draft", no GA. La abliteración es una primera pasada y puede degradar la coherencia en respuestas muy largas, con aparición de bucles y repeticiones.
- **Riesgo de alucinación**: no se han publicado evaluaciones de fidelidad factual; al eliminar las capas de rechazo se pierde parte de la estructura que sostenía el razonamiento, lo que puede aumentar respuestas plausibles pero incorrectas.
- **Sesgos**: no hay información sobre evaluación de sesgos; un modelo sin filtros de rechazo puede reproducir contenido sesgado o inapropiado sin advertencia.
- **Contexto e idioma**: aunque se etiqueta como long-context, no se especifica la longitud exacta; los idiomas declarados son en, zh y multilingual, sin garantías de calidad en castellano.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor advierte que no se debe hacer dequant-edit-requant sobre la retícula NVFP4 de las variantes derivadas; este BF16 es el maestro desde el que se generan.
- **Producción**: no se recomienda su uso en producción sin validación propia, dado el estado de borrador y la ausencia de benchmarks de calidad publicados.
- **Dependencia de hardware**: el BF16 no cabe en GPU de consumo; para RTX 5090 o DGX Spark hay que usar las variantes cuantizadas de la misma familia.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante NVFP4-MIXED: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Variante MXFP4-MXFP6-ROCm: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-MXFP4-MXFP6-ROCm
- Drafter DFlash2: https://huggingface.co/AEON-7/AEON-DFlash2-Qwen3.8-27B
- Acceso anticipado en LotusMake: https://lotusmake.com/c/aeon-forge
- Soporte al autor: https://lotusmake.com/support
- Papers referenciados en los tags: arxiv:2406.11717, arxiv:2503.00555
