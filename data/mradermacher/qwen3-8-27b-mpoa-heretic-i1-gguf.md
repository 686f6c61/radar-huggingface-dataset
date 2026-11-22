# mradermacher/Qwen3.8-27B-MPOA-heretic-i1-GGUF

## Resumen

Qwen3.8-27B-MPOA-heretic-i1-GGUF es una cuantización en formato GGUF del modelo richardyoung/Qwen3.8-27B-MPOA-heretic, publicada por el usuario mradermacher. Se trata de una variante "abliterated" o "decensored" del modelo base Qwen3.8 de 27B parámetros, es decir, un ajuste que elimina total o parcialmente los mecanismos de rechazo y alineación de seguridad del modelo original. El resultado es un modelo conversacional sin las restricciones habituales de contenido, orientado a usos donde el filtrado del modelo base resulta limitante.

El modelo cuenta con 26.895.998.464 parámetros (aproximadamente 26,9B) en pesos safetensors, y se distribuye exclusivamente en formato GGUF con cuantizaciones de tipo i1 (imatrix) que van desde IQ1_S (7,2 GB) hasta Q6_K (22,2 GB). La licencia declarada es Apache 2.0, aunque las etiquetas del repositorio incluyen también openrail++, lo que genera cierta ambigüedad sobre los términos exactos de uso comercial. El modelo está etiquetado únicamente para inglés.

La relevancia de esta ficha radica en que documenta un caso típico de la comunidad de cuantización: un modelo derivado de una familia conocida (Qwen3) que ha sido modificado para eliminar restricciones de seguridad, y posteriormente cuantizado para su despliegue en hardware de consumo. Es importante señalar que la información disponible sobre arquitectura, entrenamiento y benchmarks es muy limitada, ya que la model card del cuantizador no incluye esos datos y la model card del modelo base no se ha proporcionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3, presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 26.895.998.464 (≈26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de fichero imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (el repositorio incluye también la etiqueta openrail++) |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Por el nombre y el tamaño (26,9B parámetros) cabe inferir que deriva de la familia Qwen3, pero no se confirma si se trata de un transformer decoder-only denso, un modelo con atención lineal o una arquitectura híbrida. Tampoco se especifican la longitud de contexto nativa, el número de capas, la dimensión oculta ni el tipo de tokenizador.

Respecto al entrenamiento, la model card del cuantizador no incluye datos sobre el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. Las etiquetas "heretic", "uncensored", "decensored" y "abliterated" indican que el modelo base richardyoung/Qwen3.8-27B-MPOA-heretic ha sido sometido a un proceso de abliteración, una técnica que identifica y elimina direcciones de activación asociadas al rechazo de contenido. La cuantización i1 utiliza un fichero imatrix (matriz de importancia) para ponderar la cuantización de los tensores, lo que según el autor mejora la calidad frente a cuantizaciones estáticas equivalentes.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Modelo "decensored": no aplica los filtros de rechazo del modelo base, por lo que puede generar contenido que el Qwen3 original bloquearía.
- Razonamiento y respuesta a instrucciones, presumiblemente heredados del modelo base Qwen3.8 (no verificado en la documentación).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteración afecta al comportamiento del modelo base, comparando respuestas con y sin el proceso de eliminación de rechazo. Es adecuado porque expone directamente las diferencias de comportamiento.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles que el modelo base rechazaría. La ausencia de filtros permite explorar contenido adulto o controvertido dentro de un entorno controlado.
- Despliegue en hardware de consumo: las cuantizaciones i1-Q4_K_M (16,6 GB) o i1-Q4_K_S (15,7 GB) permiten ejecutar un modelo de 27B en GPUs con 24 GB de VRAM, como una RTX 4090, usando llama.cpp u Ollama. Es adecuado por el tamaño reducido de los ficheros GGUF.
- Experimentación con cuantización extrema: las variantes IQ1_S (7,2 GB) e IQ2_XXS (8,5 GB) permiten probar el modelo en equipos con 8-12 GB de VRAM, a costa de una pérdida notable de calidad. Útil para estudiar el impacto de la cuantización en modelos grandes.
- Evaluación comparativa de técnicas de abliteración: al existir una versión estática (Qwen3.8-27B-MPOA-heretic-GGUF) y una i1, se pueden comparar ambas en tareas de generación libre para medir diferencias de calidad.
- Fine-tuning posterior sobre dominio específico: el modelo base en safetensors (26,9B) puede servir como punto de partida para ajuste fino en dominios donde se requiera un modelo sin rechazo, aunque el coste computacional es elevado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - i1-IQ1_S: ~7,2 GB de pesos; con overhead de contexto, ~9-10 GB.
  - i1-IQ2_M: ~10,1 GB; con overhead, ~12-13 GB.
  - i1-IQ3_M: ~12,7 GB; con overhead, ~15 GB.
  - i1-Q4_K_M: ~16,6 GB; con overhead, ~19-20 GB.
  - i1-Q5_K_M: ~19,3 GB; con overhead, ~22-23 GB.
  - i1-Q6_K: ~22,2 GB; con overhead, ~25 GB.
- GPU recomendadas: para Q4_K_M o superiores, RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB. Para cuantizaciones IQ2/IQ3, RTX 4080 (16 GB) o RTX 4070 Ti Super (16 GB).
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones IQ1 a IQ3 caben en GPUs de 8-16 GB; Q4_K_M y Q5_K_M caben en 24 GB; Q6_K requiere 24 GB con contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (koboldcpp, entre otros). vLLM y TGI no soportan GGUF de forma nativa para este tipo de cuantizaciones i1.
- Latencia y throughput estimados: no disponibles en la información proporcionada, aunque para un modelo denso de 27B en Q4_K_M sobre una RTX 4090 se puede esperar un throughput del orden de decenas de tokens por segundo, sin dato confirmado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-MPOA-heretic-i1-GGUF (este) | 26,9B | no disponible | apache-2.0 | GGUF i1 | Abliterated, solo inglés, cuantizaciones IQ1-Q6 |
| Qwen3.8-27B-MPOA-heretic-GGUF (versión estática) | 26,9B | no disponible | apache-2.0 | GGUF estático | Mismo modelo base, cuantizaciones sin imatrix |
| richardyoung/Qwen3.8-27B-MPOA-heretic (modelo base) | 26,9B | no disponible | no disponible | safetensors | Modelo original sin cuantizar, presumiblemente en fp16/bf16 |
| Qwen3 original (familia) | varía | varía | varía | safetensors, GGUF | Modelo con alineación de seguridad intacta; no se dispone de la ficha concreta |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo "decensored" / "abliterated": no aplica los filtros de seguridad del Qwen3 original. Puede generar contenido ofensivo, ilegal o dañino sin restricciones, lo que lo hace inadecuado para aplicaciones de cara al público sin moderación adicional.
- Sesgos conocidos: no documentados en la información disponible; se heredan presumiblemente los del modelo base Qwen3, pero no se especifican.
- Riesgo de alucinación: no cuantificado; al ser un modelo de 27B sin benchmarks publicados, no se puede estimar su fiabilidad factual.
- Limitación de idioma: solo inglés según la etiqueta; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Licencia ambigua: la model card declara apache-2.0, pero las etiquetas incluyen openrail++, que impone restricciones de uso. Antes de un uso comercial conviene verificar los términos del modelo base richardyoung/Qwen3.8-27B-MPOA-heretic, ya que la licencia del derivado puede estar condicionada por la del original.
- Cuantizaciones de muy baja precisión (IQ1, IQ2): el propio autor advierte que IQ1_S es "for the desperate" y Q2_K_S es "very low quality"; estas variantes degradan notablemente la coherencia y no son recomendables para producción.
- Sin datos de contexto: se desconoce la ventana de contexto nativa, lo que impide planificar aplicaciones que requieran contexto largo.
- Sin benchmarks: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas, por lo que la calidad real del modelo no está verificada.
- Repositorio con 0 likes y creado en 2026: indica una adopción comunitaria muy baja; no hay validación independiente de la calidad de las cuantizaciones.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwen3.8-27B-MPOA-heretic-i1-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen3.8-27B-MPOA-heretic
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3.8-27B-MPOA-heretic-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-MPOA-heretic-i1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
