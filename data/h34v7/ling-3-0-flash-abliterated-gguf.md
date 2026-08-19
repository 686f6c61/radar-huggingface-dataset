# h34v7/LING-3.0-FLASH-ABLITERATED-GGUF

## Resumen

LING-3.0-FLASH-ABLITERATED-GGUF es una conversión a formato GGUF del modelo abliterated (variante sin censura) de LING-3.0-Flash, desarrollada por el usuario h34v7. El modelo base, Blackfrost-AI/LING-3.0-FLASH-ABLITERATED, deriva a su vez de LING-3.0-Flash de InclusionAI, un modelo de razonamiento híbrido de arquitectura MoE con 124B parámetros totales (127.486.405.600 según el archivo safetensors) y aproximadamente 5,1B activos por token. Esta conversión en Q4_K_M reduce el tamaño a 77 GB, lo que permite su ejecución en hardware de gama alta o con múltiples GPUs.

El modelo mantiene la ventana de contexto nativa de 262.144 tokens (extensible hasta 1M en la versión original) y la capacidad de razonamiento oculto (chain-of-thought) que se expone como `reasoning_content` en la API compatible con OpenAI. Al estar abliterated, se eliminan los rechazos de contenido no deseado, lo que lo hace útil para tareas creativas o de investigación sin restricciones, aunque con los riesgos asociados. Su licencia MIT permite uso comercial sin restricciones.

Es relevante porque combina un rendimiento competitivo con un coste de inferencia reducido gracias a la activación selectiva de expertos, y esta versión GGUF amplía su disponibilidad a entornos como llama.cpp, LM Studio u Ollama, sin necesidad de infraestructura propietaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `bailingmoe3` (BailingMoeV3ForCausalLM) |
| Parametros totales | 127.486.405.600 (124B declarados en la model card) |
| Parametros activos | ~5.1B (MoE, 512 expertos, 8 activos) |
| Longitud de contexto | 262.144 (dependiente del hardware) |
| Tipos de cuantizacion | Q4_K_M (4.83 BPW, sin imatrix) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (Q8_0 intermedio para la conversion) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura MoE (Mixture of Experts) con 512 expertos de los que se activan 8 por token, organizados en 42 capas con un tamaño de grupo de 6. Esta disposición permite que solo ~5,1B de los 127B totales se activen en cada paso, reduciendo drásticamente el coste computacional en inferencia. La variante abliterated se obtiene mediante una tecnica de "abliteration" que elimina los patrones de rechazo aprendidos durante el entrenamiento, sin modificar los pesos de forma significativa. El modelo base, LING-3.0-Flash, fue entrenado por InclusionAI con un enfoque de razonamiento hibrido, combinando generacion autoregresiva con una cadena de pensamiento oculta que se emite antes de la respuesta final. La conversion a GGUF se realizo con llama.cpp, pasando por un intermedio Q8_0 y luego a Q4_K_M, con un impacto de calidad minimo segun el autor (near-lossless). No se dispone de informacion detallada sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO en la variante abliterated.

## Capacidades

- Generacion de texto y razonamiento complejo: emite una cadena de pensamiento oculta antes de la respuesta, mejorando la precision en problemas de logica, matematicas y analisis.
- Generacion de codigo: capaz de producir y depurar codigo en multiples lenguajes, con soporte para tareas de programacion competitiva y desarrollo de software.
- Tool calling y function calling: compatible con APIs de OpenAI, lo que permite integrarse en agentes que invocan herramientas externas.
- Soporte para agentes y razonamiento multi-paso: su arquitectura MoE con contexto largo (262K) facilita la gestion de conversaciones extensas y tareas que requieren multiples pasos de razonamiento.
- Capacidades multilingues: entrenado principalmente en ingles y chino, con buen rendimiento en ambos idiomas.
- Modo razonamiento visible: a traves de `reasoning_content` en la API, los desarrolladores pueden acceder a la cadena de pensamiento interna para depuracion o analisis.
- Al estar abliterated, no aplica filtros de contenido politico o etico, lo que permite generacion sin restricciones en temas sensibles (con los riesgos asociados).

## Casos de uso

- Atencion al cliente automatizada: gracias a su contexto de 262K tokens, puede mantener conversaciones multi-turno con historial completo del usuario, resolviendo consultas complejas sin perder informacion previa.
- Generacion de codigo en produccion: integrable en pipelines de CI/CD mediante tool calling, puede generar tests, documentacion o parches automaticamente, reduciendo el tiempo de desarrollo.
- Agentes autonomos de investigacion: su capacidad de razonamiento multi-paso y acceso a herramientas lo hace adecuado para agentes que buscan informacion, la analizan y sintetizan informes extensos.
- Analisis de documentos legales o academicos: la ventana de 262K permite procesar contratos, articulos o libros completos en una sola pasada, extrayendo resumenes o respondiendo preguntas especificas.
- Traduccion y localizacion: con soporte en ingles y chino, puede traducir documentos tecnicos o literarios manteniendo el contexto y el tono.
- Generacion creativa sin restricciones: al estar abliterated, es util para escritura de ficcion, guiones o contenido satirico que otros modelos rechazarian, siempre que se cumplan las politicas de uso.
- Despliegue en entornos locales con privacidad: al ser GGUF, puede ejecutarse en infraestructura propia sin enviar datos a la nube, ideal para sectores regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K u otros, y la busqueda web no proporciona datos adicionales. Se recomienda consultar el repositorio del modelo base (InclusionAI LING-3.0-Flash) para obtener referencias de rendimiento, aunque la variante abliterated puede diferir ligeramente.

## Requisitos de hardware

- Tamaño del archivo: 77,0 GB (Q4_K_M). Para cargar el modelo completo en GPU se necesitan al menos 80 GB de VRAM (por ejemplo, 2x NVIDIA RTX 4090 de 24 GB, o 1x A100 80 GB).
- En GPUs consumer, una sola RTX 4090 (24 GB) no es suficiente; se requiere configuracion multi-GPU o usar CPU con suficiente RAM (el modelo puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia).
- Con `-ngl 99` se descargan todas las capas a GPU, lo que requiere la VRAM mencionada. Si se usa CPU, se recomienda al menos 96 GB de RAM.
- Compatible con llama.cpp (commit `6d0549831` o superior), LM Studio, Ollama (mediante `ollama create`) y cualquier cliente compatible con llama.cpp.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependen del hardware y del numero de tokens generados, especialmente por la cadena de razonamiento oculta.

## Comparativa con modelos similares

La comparativa se realiza con el modelo base original (LING-3.0-Flash) y con otra conversion GGUF del mismo modelo abliterated, ya que no se dispone de datos de modelos comparables de otras familias.

| Modelo | Parametros totales | Activos | Contexto | Licencia | Cuantizacion | Abliterated |
|---|---|---|---|---|---|---|
| LING-3.0-Flash (original) | 124B | ~5.1B | 262K (ext. 1M) | MIT | Original | No |
| LING-3.0-FLASH-ABLITERATED (este) | 127.5B (safetensors) | ~5.1B | 262K | MIT | Q4_K_M | Si |
| SC117/Ling-3.0-flash-abliterated-APEX-GGUF | No disponible | No disponible | No disponible | No disponible | GGUF (APEX) | Si |

La principal diferencia con el original es la eliminacion de los rechazos de contenido y la cuantizacion. Respecto a otras conversiones abliterated, no hay datos publicos que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Al ser abliterated, el modelo puede generar contenido inapropiado, ofensivo o peligroso sin filtros. Es responsabilidad del usuario controlar el acceso y auditar su uso, especialmente en entornos de produccion.
- Riesgo de alucinacion: como todo LLM, puede inventar hechos o datos, especialmente en tareas de razonamiento complejo. Se recomienda verificar las salidas en aplicaciones criticas.
- Solo soporta ingles y chino; no se ha entrenado para otros idiomas, por lo que su rendimiento en español u otras lenguas sera limitado.
- La cuantizacion Q4_K_M sin imatrix puede degradar ligeramente la calidad en comparacion con el modelo original, aunque el autor indica que es "near-lossless".
- Requiere una version especifica de llama.cpp con soporte para `bailingmoe3`; versiones anteriores no podran cargar el modelo.
- Los tensores MTP/NextN estan presentes pero son ignorados por llama.cpp, lo que puede generar warnings inofensivos.
- El contexto de 262K es "hardware-dependent"; en configuraciones con poca VRAM, la longitud efectiva se reduce.
- No se han publicado benchmarks oficiales para esta variante, por lo que el rendimiento comparativo con otros modelos no esta verificado.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/h34v7/LING-3.0-FLASH-ABLITERATED-GGUF
- Modelo base (Blackfrost-AI): https://huggingface.co/Blackfrost-AI/LING-3.0-FLASH-ABLITERATED
- Modelo original de InclusionAI: https://huggingface.co/InclusionAI/LING-3.0-Flash (enlace inferido de la documentacion)
- Documentacion oficial de LING-3.0-Flash: https://developer.ant-ling.com/en/docs/models/ling/
- Otra conversion GGUF abliterated: https://huggingface.co/SC117/Ling-3.0-flash-abliterated-APEX-GGUF
- Conversion GGUF estandar: https://huggingface.co/AtomicChat/Ling-3.0-flash-GGUF
- Referencia de rendimiento en Kilo Code: https://kilo.ai/models/inclusionai-ling-3-0-flash-free
