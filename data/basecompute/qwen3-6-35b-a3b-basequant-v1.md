# basecompute/Qwen3.6-35B-A3B-BaseQuant-V1

## Resumen

Qwen3.6-35B-A3B-BaseQuant-V1 es una cuantización del modelo Qwen/Qwen3.6-35B-A3B publicada por el usuario basecompute bajo el paraguas de su herramienta BaseQuant. No se trata de un modelo entrenado desde cero, sino de una compilación cuantizada del modelo base de Qwen, distribuida en dos formatos: un bundle propietario `.base` para el runtime baseRT y un fichero GGUF compatible con llama.cpp. El objetivo es ofrecer una alternativa de cuantización con una divergencia KL baja respecto al modelo BF16 original, manteniendo el tower de visión y la cabeza MTP para decodificación especulativa en el bundle `.base`.

El modelo base subyacente, Qwen3.6-35B-A3B, es un transformer de tipo Mixture of Experts con 34.660.610.688 parámetros totales (34,66 mil millones) según los safetensors del repositorio, del cual se activa solo una fracción por token (el sufijo A3B sugiere aproximadamente 3 mil millones de parámetros activos, aunque este dato no se confirma de forma explícita en la información disponible). La cuantización Medium ocupa 23,08 GB en formato `.base` y 22,13 GB en GGUF, lo que la sitúa en el rango de cuantizaciones de 4 bits para un modelo de este tamaño.

La relevancia de esta ficha radica en que documenta una de las primeras compilaciones cuantizadas verificables de la familia Qwen3.6, con métricas de divergencia KL publicadas por categoría y una comparación directa con la cuantización `UD-Q4_K_M` de unsloth. Está pensada para desarrolladores que necesitan desplegar el modelo en hardware con VRAM limitada sin renunciar a la fidelidad respecto al BF16, y que quieran evaluar si el runtime baseRT o el ecosistema llama.cpp se ajusta mejor a su infraestructura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), según el nombre del modelo base; detalles internos no disponibles |
| Parametros totales | 34.660.610.688 (34,66 mil millones) |
| Parametros activos | Aproximadamente 3 mil millones (inferido del sufijo A3B; no confirmado en la información disponible) |
| Longitud de contexto | 32.768 tokens en el ejemplo de llama.cpp del autor; contexto máximo del modelo base no disponible |
| Tipos de cuantizacion | Medium (23,08 GB en `.base`, 22,13 GB en GGUF); no se detalla el esquema exacto de bits |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.base` (bundle baseRT) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base Qwen3.6-35B-A3B más allá de su naturaleza MoE y su tamaño total de 34,66 mil millones de parámetros. El sufijo A3B indica que se activan aproximadamente 3 mil millones de parámetros por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. El bundle `.base` incluye además el tower de visión y la cabeza MTP (Multi-Token Prediction) para decodificación especulativa, lo que confirma que el modelo base es multimodal y que soporta generación acelerada de tokens.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La contribución específica de esta publicación es la cuantización: el autor reporta la divergencia KL de la distribución del siguiente token respecto al modelo BF16 sobre 32.507 tokens puntuados en 58 prompts de diez categorías, con un valor global de 0,00462 para el bundle `.base` y 0,00476 para el GGUF. Estos valores son ligeramente inferiores al 0,00467 de la cuantización `UD-Q4_K_M` de unsloth, lo que sugiere una fidelidad competitiva en el mismo rango de tamaño.

## Capacidades

- Generación de texto conversacional, según el tag `conversational` del repositorio.
- Razonamiento y matemáticas, con categorías específicas evaluadas en la tabla de divergencia KL (Math, Science, Research).
- Generación de código y coding agéntico, con categorías dedicadas en la evaluación (Code, Agentic coding).
- Uso de herramientas (tool use), evaluado como categoría independiente en la tabla de KL.
- Capacidades multilingües, evaluadas como categoría independiente en la tabla de KL.
- Visión, ya que el bundle `.base` incluye el tower de visión del modelo base.
- Decodificación especulativa mediante la cabeza MTP incluida en el bundle `.base`.
- Contexto largo, con una categoría específica de long context en la evaluación y 32.768 tokens configurados en el ejemplo de llama.cpp.
- Compatibilidad con endpoints, según el tag `endpoints_compatible`.

## Casos de uso

- Despliegue en servidores con VRAM limitada: la cuantización Medium ocupa 22-23 GB, lo que permite ejecutar un modelo MoE de 34,66 mil millones de parámetros en una única GPU de 24 GB (RTX 4090, L4, A10G) usando llama.cpp con `-ngl 99`, algo inviable con el modelo en BF16.
- Asistentes conversacionales multi-turno: el tag `conversational` y la categoría Chat de la evaluación KL (0,00634-0,00648) indican que la cuantización preserva bien el comportamiento conversacional, adecuado para chatbots de atención al cliente con contexto de hasta 32.768 tokens.
- Generación de código en pipelines de CI/CD: la baja divergencia en la categoría Code (0,00427-0,00434) y el soporte de tool use permiten integrar el modelo en flujos de revisión automática de código o generación de tests dentro de herramientas de desarrollo.
- Agentes autónomos con uso de herramientas: la categoría Tool use (0,00474-0,00517) y la inclusión de la cabeza MTP para decodificación especulativa hacen que el modelo sea apto para agentes que encadenan llamadas a funciones con latencia reducida.
- Procesamiento de documentos largos: la categoría Long context (0,00427-0,00438) con 2.048 tokens evaluados sugiere que la cuantización mantiene la fidelidad en ventanas extensas, útil para resumen y extracción de información de contratos o informes.
- Análisis multimodal de imágenes: el tower de visión incluido en el bundle `.base` permite tareas de descripción de imágenes o extracción de información visual, siempre que se use el runtime baseRT 0.5.2 o superior.
- Investigación en cuantización: la tabla de divergencia KL por categoría y la comparación con `UD-Q4_K_M` de unsloth convierten este repositorio en un punto de referencia para estudiar el impacto de la cuantización en distintas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta divergencia KL respecto al modelo BF16, que no es un benchmark de capacidad sino una medida de fidelidad de la cuantización:

| Categoria | Tokens | BaseQuant `.base` | BaseQuant GGUF | unsloth `UD-Q4_K_M` |
|---|---:|---:|---:|---:|
| Agentic coding | 2.228 | 0,00465 | 0,00490 | 0,00515 |
| Chat | 3.342 | 0,00648 | 0,00634 | 0,00645 |
| Code | 2.883 | 0,00427 | 0,00434 | 0,00450 |
| Long context | 2.048 | 0,00427 | 0,00438 | 0,00536 |
| Math | 4.608 | 0,00304 | 0,00318 | 0,00265 |
| Multilingual | 4.232 | 0,00222 | 0,00213 | 0,00233 |
| Prose | 3.994 | 0,00624 | 0,00587 | 0,00628 |
| Research | 2.123 | 0,00737 | 0,00848 | 0,00584 |
| Science | 4.382 | 0,00467 | 0,00510 | 0,00490 |
| Tool use | 2.667 | 0,00474 | 0,00517 | 0,00519 |
| **Todos** | 32.507 | **0,00462** | **0,00476** | **0,00467** |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 22-23 GB para la cuantización Medium, más overhead de contexto KV. Con 32.768 tokens de contexto, la VRAM adicional puede ser significativa y depende de la arquitectura MoE del modelo base.
- GPU recomendadas: RTX 4090 (24 GB), L4 (24 GB), A10G (24 GB) para la cuantización Medium en una sola GPU; A100 40/80 GB y H100 para mayor margen de contexto o mayor throughput.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB), siempre que el contexto se limite para no agotar la VRAM.
- Opciones de despliegue: baseRT 0.5.2 o superior (bundle `.base`), llama.cpp (GGUF), SuperFluid con runtime basert, y endpoints compatibles según el tag del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BaseQuant-V1 (este) | 34,66 mil M (MoE, ~3 mil M activos) | 32.768 en ejemplo | Apache 2.0 | `.base`, GGUF | KL global 0,00462-0,00476 |
| unsloth `UD-Q4_K_M` del mismo base | 34,66 mil M (MoE) | No disponible | Apache 2.0 (heredada) | GGUF | KL global 0,00467; mejor en Math y Research |
| Qwen/Qwen3.6-35B-A3B (BF16) | 34,66 mil M (MoE) | No disponible | Apache 2.0 | Safetensors | Modelo de referencia sin cuantizar |

La comparación se limita al mismo modelo base en distintas formas de distribución, ya que la información disponible no incluye otros modelos de la misma categoría. El bundle `.base` supera a `UD-Q4_K_M` en ocho de las diez categorías evaluadas, mientras que `UD-Q4_K_M` obtiene mejor divergencia en Math (0,00265 frente a 0,00304) y Research (0,00584 frente a 0,00737).

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; dependen del modelo base Qwen3.6-35B-A3B.
- Riesgo de alucinación: no cuantificado; la cuantización puede amplificar ligeramente los errores del modelo base, aunque la divergencia KL reportada es baja.
- Limitaciones de contexto: el ejemplo de llama.cpp usa 32.768 tokens, pero el contexto máximo del modelo base no se especifica; superar la ventana configurada puede degradar la calidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.6-35B-A3B, ya que la licencia del derivado hereda la del original.
- El bundle `.base` requiere baseRT 0.5.2 o superior; versiones anteriores no son compatibles.
- La cuantización Medium es la única publicada; no hay variantes de menor o mayor tamaño en este repositorio.
- El rendimiento en Math y Research es peor que el de `UD-Q4_K_M` de unsloth, por lo que para cargas intensivas en matemáticas o investigación podría ser preferible la alternativa.
- No se especifican los idiomas soportados ni el esquema exacto de bits de la cuantización, lo que dificulta estimar con precisión el impacto en tareas específicas.
- El repositorio tiene solo 381 descargas y 2 likes en el momento de la consulta, lo que indica una validación comunitaria limitada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/basecompute/Qwen3.6-35B-A3B-BaseQuant-V1
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Instalador de SuperFluid: https://superfluid.sh/install.sh
- Cuantización de referencia de unsloth: no disponible en la información proporcionada.
