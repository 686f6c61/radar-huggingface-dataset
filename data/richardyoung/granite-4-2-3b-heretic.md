# richardyoung/granite-4.2-3b-heretic

## Resumen

richardyoung/granite-4.2-3b-heretic es una versión «decensored» (abliterated) del modelo IBM Granite-4.2-3B, publicada por el usuario richardyoung. La edición se ha realizado con Heretic v2.0.0.dev0, una herramienta que modifica direccionalmente determinadas proyecciones de los pesos (`attn.o_proj`, `mlp.down_proj`) para suprimir la tendencia del modelo a rechazar peticiones. Según la model card, los rechazos bajan de 98/100 en el modelo original a 27/100 en esta variante, con una divergencia KL de 0,0846 respecto al original.

El modelo subyacente es un transformer denso decoder-only de 3.659.737.600 parámetros (≈3,66B), con atención Grouped Query Attention (40 cabezas de atención, 8 cabezas KV), RoPE con θ = 10.000.000 y contexto nativo de 128K tokens ampliable a 512K. Incorpora modo de razonamiento con cadena de pensamiento `<think>...</think>`, tool calling aumentado con razonamiento y soporte declarado para 12 idiomas.

Su relevancia es doble: por un lado, ofrece capacidades de razonamiento y agentes en un tamaño desplegable en GPU de consumo; por otro, sirve como material de estudio para investigación sobre alineación y red teaming, ya que permite comparar el comportamiento del modelo original con el de una variante a la que se le ha retirado la capa de rechazo. La licencia Apache 2.0 permite uso comercial, aunque la responsabilidad sobre el contenido generado recae íntegramente en quien lo despliega.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (GraniteForCausalLM), GQA con 40 cabezas de atención y 8 cabezas KV |
| Parámetros totales | 3.659.737.600 (≈3,66B), dato real de safetensors |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens nativo; extensión de contexto largo hasta 512K según la model card |
| Tipos de cuantización | no disponible en este repositorio (solo bfloat16); no se publican GGUF aquí |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh (otros idiomas pueden funcionar, sin probar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |
| Modelo base | ibm-granite/granite-4.1-3b-base (según tags); derivado de ibm-granite/granite-4.2-3b según la model card |
| Precisión | bfloat16 |
| Tamaño del repositorio | 7,3 GB |
| Dimensión de embedding | 2560 |
| Dimensión oculta del MLP | 8192 (SwiGLU) |
| Normalización | RMSNorm (ε = 1e-5) |
| Embeddings de entrada/salida | separados (no atados) |
| Modo de razonamiento | `<think>...</think>` integrado, con modos full thinking, non-thinking y low-effort |
| Herramienta de edición | Heretic v2.0.0.dev0 (direction_index 27,61) |
| Librería declarada | transformers |
| Fecha de publicación | 28 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la del Granite-4.2-3B original: un transformer denso decoder-only con Grouped Query Attention (40 cabezas de consulta y 8 cabezas KV), Rotary Position Embedding con θ = 10.000.000 para favorecer la extensión de contexto, feed-forward con activación SwiGLU y dimensión oculta de 8192, normalización RMSNorm con ε = 1e-5 y embeddings de entrada y salida no atados. El modelo se distribuye en bfloat16. El contexto es de 128K tokens de forma nativa y la model card indica una extensión de contexto largo hasta 512K; el número de capas no aparece en la información disponible.

El modelo hereda el entrenamiento del Granite-4.2-3B de IBM, que introduce razonamiento nativo antes de emitir la respuesta final. No se detalla en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO, por lo que esos datos deben considerarse no disponibles. La innovación específica de esta ficha es la fase de abliteración con Heretic: se aplican ediciones direccionales con `direction_index` = 27,61, pesos máximos de 1,42 en `attn.o_proj` (posición 29,29, mínimo 1,00 a distancia 21,94) y de 1,37 en `mlp.down_proj` (posición 37,92, mínimo 1,00 a distancia 12,17). El autor indica que el proceso es reproducible y remite al `reproduce/README.md` del repositorio.

## Capacidades

- Generación de texto conversacional en 12 idiomas probados (inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino).
- Razonamiento con cadena de pensamiento nativa mediante `<think>...</think>`, con modos conmutables: full thinking (por defecto), non-thinking y low-effort.
- Razonamiento matemático y lógico multi-paso, orientado a problemas complejos según la model card.
- Generación y comprensión de código, con el razonamiento como paso previo a la respuesta.
- Tool calling aumentado con razonamiento: el modelo justifica qué herramienta invocar y por qué antes de emitir la llamada a función.
- Flujos agénticos y razonamiento multi-paso, apoyados en la ventana de 128K tokens.
- Procesamiento de documentos largos y conversaciones multi-turno con contexto extenso.
- Capacidad de seguir instrucciones sin aplicar rechazos en la mayoría de los casos evaluados (27/100 rechazos), incluyendo peticiones que el modelo original declinaba.
- No se declaran capacidades de visión ni de audio en la información disponible.

## Casos de uso

- Investigación sobre alineación y red teaming: comparar esta variante con `ibm-granite/granite-4.2-3b` permite medir qué comportamientos emergen al eliminar la capa de rechazo, usando métricas como los rechazos (27/100 frente a 98/100) y la divergencia KL (0,0846) ya publicadas.
- Generación de código en producción: el soporte de tool calling y el razonamiento previo permiten integrarlo en asistentes de IDE o en pipelines de CI/CD que necesiten explicar cambios y llamar a herramientas externas, con 128K de contexto para cargar varios ficheros de un repositorio.
- Agentes autónomos con múltiples pasos: la combinación de modo thinking y tool calling resulta adecuada para agentes que planifican, invocan APIs y verifican resultados intermedios en una misma ventana de contexto.
- Atención al cliente multilingüe: cubre 12 idiomas probados y mantiene conversaciones multi-turno largas, lo que permite desplegar un único modelo para mercados con idiomas distintos en lugar de varios modelos especializados.
- Análisis de documentos extensos: resumen, extracción de entidades y pregunta-respuesta sobre contratos, informes o expedientes de hasta 128K tokens (512K con la extensión de contexto declarada).
- Generación de datos sintéticos para fine-tuning: al no rechazar peticiones, puede producir datasets más diversos, incluidos casos límite y temas sensibles que el modelo original evitaría, siempre con revisión humana posterior.
- Prototipado local en equipos pequeños: con 3,66B parámetros en bfloat16 ocupa alrededor de 7,3 GB, por lo que se puede ejecutar en una sola GPU de consumo para pruebas de concepto sin depender de API externas.
- Traducción y localización: útil como motor auxiliar entre los idiomas declarados, especialmente en pares con poco soporte en modelos pequeños, con la salvedad de que no se publican evaluaciones de calidad de traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento aportados por el autor son métricas de comportamiento comparadas con el modelo original:

| Métrica | richardyoung/granite-4.2-3b-heretic | ibm-granite/granite-4.2-3b (original) |
|---|---|---|
| Rechazos | 27/100 | 98/100 |
| Divergencia KL | 0,0846 | 0 (por definición) |

Estas cifras miden la supresión del comportamiento de rechazo y la deriva respecto al original, no la calidad general del modelo. No hay datos publicados de razonamiento, código, matemáticas ni multilingüismo para esta variante concreta.

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 7,3 GB, coherente con el tamaño del repositorio (3,66B parámetros × 2 bytes). Es la única precisión publicada en este repositorio.
- Estimaciones para otras precisiones (calculadas a partir del recuento de parámetros, no verificadas en el repositorio): int8 en torno a 3,7 GB y Q4 en torno a 2,2 GB, siempre que se genere una conversión propia, ya que no se publican GGUF aquí.
- Memoria KV: el número de capas no está disponible en la información proporcionada, por lo que no se puede dar una cifra exacta. Con 8 cabezas KV y dimensión de cabeza de 64, el coste es de unos 2 KB por token y capa en bfloat16; a 128K tokens de contexto el KV cache puede superar ampliamente el tamaño de los pesos y es el principal limitante de memoria.
- GPU de consumo: cabe en una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080 y RTX 4090 para bfloat16 con contextos moderados. Para aprovechar los 128K completos conviene una GPU de 24 GB o más, o bien reducir la precisión del KV cache.
- GPU de centro de datos: A100 (40/80 GB) y H100 son adecuadas para lotes grandes, contexto largo y servicio concurrente.
- Opciones de despliegue: transformers (librería declarada en el repositorio), vLLM o TGI por tratarse de un modelo decoder-only en safetensors y contar con el tag `endpoints_compatible`; llama.cpp u Ollama solo si se convierte previamente a GGUF (existe GGUF de terceros para la variante equivalente de tinyopsec, no para este repositorio).
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia para esta variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Razonamiento | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| richardyoung/granite-4.2-3b-heretic | 3,66B (denso) | 128K nativo, hasta 512K | `<think>` integrado, tres modos | 27/100 | Apache 2.0 | safetensors en HF, 0 descargas |
| ibm-granite/granite-4.2-3b | 3B (denso) | 128K nativo, hasta 512K | `<think>` integrado, tres modos | 98/100 | Apache 2.0 | safetensors en HF, modelo oficial |
| tinyopsec/granite-4.2-3b-Heretic | 3B (denso) | no disponible en la información recogida | no disponible | no disponible | no disponible en la información recogida | safetensors y GGUF en HF, con endpoint en FriendliAI |
| Granite-4.2 (8B y 30B densos, misma familia) | 8B / 30B | no disponible | `<think>` integrado | no disponible | Apache 2.0 | safetensors en HF |

La comparación directa con alternativas de otros fabricantes (por ejemplo, modelos densos de ~3B de otras familias) no está disponible en la información proporcionada, ya que no se aportan resultados de benchmarks que permitan situar esta variante frente a ellas sin inventar cifras.

## Limitaciones y advertencias

- La abliteración elimina deliberadamente el comportamiento de rechazo: el modelo puede generar contenido dañino, ilegal, sesgado o inseguro que el original declinaba. No debe desplegarse en producción orientada a usuarios finales sin filtros externos.
- Persisten 27 rechazos de cada 100 en la evaluación del autor, por lo que el comportamiento es irregular: la supresión no es homogénea y puede rechazar unas peticiones y aceptar otras equivalentes.
- La divergencia KL de 0,0846 indica una deriva medible respecto al modelo original; parte de las capacidades originales puede haberse degradado, aunque no se publican evaluaciones que cuantifiquen esa pérdida.
- Riesgo de alucinación inherente a un modelo de 3,66B parámetros, agravado por la ausencia de benchmarks verificables de razonamiento, matemáticas y código.
- La ventana de 512K es una extensión de contexto largo, no un entrenamiento nativo a esa longitud; es esperable degradación de la calidad en posiciones muy lejanas del contexto.
- Los 12 idiomas listados son los probados, pero no se publican métricas de calidad por idioma; el rendimiento en idiomas no listados es desconocido.
- Repositorio con 0 descargas y 0 «likes» en el momento de la consulta, sin validación independiente de la comunidad, lo que impide confirmar el comportamiento real más allá de la model card.
- Inconsistencia de trazabilidad: los tags del repositorio apuntan como modelo base a `ibm-granite/granite-4.1-3b-base`, mientras que la model card describe la edición sobre `ibm-granite/granite-4.2-3b`. Conviene verificar la ascendencia exacta antes de usarlo en producción.
- La herramienta de edición (Heretic v2.0.0.dev0) es una versión de desarrollo, no una release estable.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no exime de responsabilidad legal, ética o regulatoria por el contenido generado, especialmente en jurisdicciones con normas sobre contenidos dañinos.
- No hay GGUF ni cuantizaciones publicadas en este repositorio, lo que limita el despliegue en CPU o en hardware muy restringido sin conversión propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richardyoung/granite-4.2-3b-heretic
- Modelo original: https://huggingface.co/ibm-granite/granite-4.2-3b
- Modelo base declarado en los tags: https://huggingface.co/ibm-granite/granite-4.1-3b-base
- Colección Granite 4.2 Language Models: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Blog técnico de Granite 4.2: https://huggingface.co/blog/ibm-granite/granite-4-2
- Repositorio GitHub de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Heretic (herramienta de abliteración): https://heretic-project.org
- Instrucciones de reproducción: `reproduce/README.md` dentro del repositorio del modelo
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Variante equivalente de tinyopsec (safetensors): https://huggingface.co/tinyopsec/granite-4.2-3b-Heretic
- Variante equivalente de tinyopsec (GGUF): https://huggingface.co/tinyopsec/granite-4.2-3b-Heretic-GGUF
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/tinyopsec/granite-4.2-3b-Heretic
- Ficha en free2aitools: https://free2aitools.com/model/tinyopsec/granite-4.2-3b-heretic
- Ficha en LLM Explorer: https://llm-explorer.com/model/tinyopsec%2Fgranite-4.2-3b-Heretic,5FrvyUnKYPi1PQoygNP8cR
