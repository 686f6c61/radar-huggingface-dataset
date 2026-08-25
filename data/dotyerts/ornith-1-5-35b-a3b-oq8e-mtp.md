# dotyerts/Ornith-1.5-35B-A3B-oQ8e-mtp

## Resumen
Ornith-1.5-35B-A3B-oQ8e-mtp es una versión cuantizada del modelo Ornith-1.5-35B-A3B, un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Ornith y cuantizado por el usuario dotyerts. La cuantización de 8 bits con un tamaño de grupo de 64 reduce el uso de memoria y permite ejecutar el modelo en hardware con recursos limitados, especialmente en sistemas con Apple Silicon gracias a la librería MLX. El modelo activa aproximadamente 3 mil millones de parámetros por token, aunque su tamaño total es de 35 mil millones, lo que lo hace eficiente para inferencia. Esta versión específica está pensada para desarrolladores e investigadores que necesitan desplegar el modelo localmente con un equilibrio entre calidad y consumo de recursos.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (mezcla de expertos) |
| Parámetros totales | 10.433.547.184 (según safetensors; el modelo base declara 35B) |
| Parámetros activos | ~3 mil millones (según el modelo original) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | 8 bits, grupo de 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo original se distribuye bajo MIT) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento
El modelo es una mezcla de expertos (MoE) basada en la arquitectura qwen3_5_moe, lo que implica que solo activa una parte de sus parámetros por token. Con 35 mil millones de parámetros totales y unos 3 mil millones activos por token, ofrece un equilibrio entre capacidad y eficiencia computacional. La cuantización aplicada mediante la herramienta oQ (oMLX v0.6.3rc2) utiliza precisión mixta de 8 bits con un tamaño de grupo de 64, lo que reduce el peso del modelo a aproximadamente 38.6 GB en el repositorio. No se han publicado detalles sobre el entrenamiento original, como el número de tokens o el dataset utilizado, ni sobre técnicas de alineación (RLHF, DPO, etc.). La información disponible indica que el modelo base supera a Qwen 3.6-35B en benchmarks de código y tareas de agente, y a modelos densos como Gemma 4-31B y Muse Glimmer-30B, aunque no se proporcionan cifras concretas.

## Capacidades
- Generación de texto y razonamiento general, con buen desempeño en tareas de código y agentes según las fuentes consultadas.
- Soporte de tool calling y function calling, presumiblemente por su arquitectura de MoE y su entrenamiento orientado a agentes.
- Capacidades multilingües no especificadas en la información disponible; no se puede confirmar el conjunto de idiomas soportados.
- Sin modo de pensamiento o vision explícito indicado en la documentación.
- Al ser un modelo MoE, ofrece una inferencia eficiente en términos de coste computacional por token.

## Casos de uso
- Asistencia en programación: el modelo puede generar, revisar y depurar código en múltiples lenguajes gracias a su rendimiento en benchmarks de código. Se puede integrar en editores o entornos de desarrollo para autocompletado y sugerencias.
- Agentes autónomos: su capacidad para manejar tareas de agente (multi-step reasoning) permite construir asistentes que interactúan con herramientas, llaman a funciones y ejecutan secuencias de acciones.
- Chatbots de atención al cliente: con una ventana de contexto de 262.144 tokens, puede mantener conversaciones largas y contextualizadas, gestionando historiales extensos sin pérdida de información.
- Análisis de documentos y resumen: la amplia ventana de contexto permite procesar informes técnicos, artículos o libros completos y generar resúmenes o extraer información relevante.
- Desarrollo de aplicaciones en Apple Silicon: al estar cuantizado para MLX, es adecuado para ejecutarse en Mac con chips M1/M2/M3, permitiendo prototipos y pruebas locales sin necesidad de GPU dedicada.
- Investigación en eficiencia de modelos: sirve como referencia para estudiar la compresión de MoE mediante cuantización de 8 bits y su impacto en rendimiento y calidad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La documentación del modelo original menciona que Ornith-1.5-35B-A3B supera a Qwen 3.6-35B en benchmarks de código y agentes, y a modelos densos como Gemma 4-31B y Muse Glimmer-30B, pero no se ofrecen cifras concretas ni comparaciones numéricas.

## Requisitos de hardware
- VRAM estimada: al ser un modelo cuantizado a 8 bits con 10.433.547.184 parámetros, el peso en memoria ronda los 10.4 GB, más overhead de activaciones y KV cache. Para la ventana de contexto máxima (262.144 tokens), se necesita memoria adicional considerable.
- GPU recomendadas: dado el formato MLX, está orientado a Apple Silicon (M1, M2, M3 y posteriores). También podría ejecutarse en CPU con suficiente RAM.
- Cabe en GPU de consumo: en Apple Silicon con al menos 16 GB de memoria unificada podría ejecutarse en cuantización 8 bits, aunque con contextos largos se requeriría más memoria. En GPUs NVIDIA no se recomienda por el formato MLX.
- Opciones de despliegue: MLX (librería para Apple Silicon), llama.cpp (si se convierte a GGUF), o servidores como vLLM o TGI si se convierte a formatos compatibles.
- Latencia y throughput: no disponible en la información.

## Comparativa con modelos similares
| Modelo | Parámetros totales | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ornith-1.5-35B-A3B (este) | 35B (MoE) | 262.144 | MIT (original) | Supera a Qwen 3.6-35B en código y agentes |
| Qwen 3.6-35B | 35B | no disponible | Apache 2.0 | Modelo denso, competidor directo |
| Gemma 4-31B | 31B | no disponible | no disponible | Modelo denso de Google |
| Muse Glimmer-30B | 30B | no disponible | no disponible | Modelo denso |

La comparación es cualitativa basada en las afirmaciones del fabricante; no hay datos de benchmark detallados.

## Limitaciones y advertencias
- Licencia no especificada en la versión cuantizada; el modelo original es MIT, pero hay que verificar la redistribución.
- No se dispone de información sobre sesgos o riesgos de alucinación; como modelo de lenguaje, puede generar contenido falso o incoherente.
- El formato MLX limita el despliegue a hardware Apple Silicon; para otros entornos se requiere conversión.
- La cuantización de 8 bits puede degradar ligeramente la calidad en comparación con el modelo original en fp16 o fp32.
- No hay documentación sobre el entrenamiento, por lo que se desconocen las limitaciones idiomáticas o de dominio específico.
- El contexto máximo de 262.144 tokens puede consumir mucha memoria si se usa en su totalidad.

## Enlaces
- Hugging Face: [https://huggingface.co/dotyerts/Ornith-1.5-35B-A3B-oQ8e-mtp](https://huggingface.co/dotyerts/Ornith-1.5-35B-A3B-oQ8e-mtp)
- Docker Hub: [https://hub.docker.com/r/ai/ornith-1.5](https://hub.docker.com/r/ai/ornith-1.5)
- Atomic Chat: [https://atomic.chat/models/ornith-1-5-35b-a3b](https://atomic.chat/models/ornith-1-5-35b-a3b)
- RunInfra: [https://runinfra.ai/inference-api/ornith-1-5-35b](https://runinfra.ai/inference-api/ornith-1-5-35b)
- Repositorio oQ (oMLX): [https://github.com/jundot/omlx](https://github.com/jundot/omlx)
