# sekkit/Qwen3.8-27B-Longbook27-v2

## Resumen

Qwen3.8-27B-Longbook27-v2 es un modelo de lenguaje de 27.072.285.696 parámetros (aproximadamente 27B) publicado por el usuario sekkit en HuggingFace, concebido como un ajuste fino especializado en comprensión y generación de texto de formato largo: libros, artículos científicos e informes extensos. La model card identifica como autor a "summerMC" y lo presenta como una segunda versión que refina el comportamiento y la calidad de salida respecto a v1.

El modelo emplea una arquitectura personalizada denominada `qwen3_5_gdn24`, basada en capas de atención lineal Gated DeltaNet, y se distribuye con código remoto propio (`modeling_qwen35_gdn24.py`, `fused_ops.py`), por lo que requiere `trust_remote_code=True` para cargarse. Los pesos están en safetensors con precisión bf16, lo que supone un repositorio de 54,2 GB.

Es relevante para quienes necesitan procesar documentos de gran longitud en inglés o japonés con un modelo de tamaño medio que quepa en una GPU de 24 GB mediante cuantización de 4 bits. La licencia declarada es Apache 2.0, aunque la model card matiza que el modelo sigue la licencia del modelo base Qwen, lo que introduce una ambigüedad que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_gdn24` (código personalizado), con capas de atención lineal Gated DeltaNet |
| Parametros totales | 27.072.285.696 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (descrito como "long context" / "book-scale", sin cifra publicada) |
| Tipos de cuantizacion | bf16 y 4-bit NF4 (bitsandbytes, con double quant); no se documentan GGUF ni otras |
| Idiomas soportados | inglés y japonés |
| Licencia | apache-2.0 (la model card remite también a la licencia del modelo base Qwen) |
| Formato de pesos | safetensors (bf16, ~54 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con atención híbrida: el identificador `qwen3_5_gdn24` y la etiqueta "Gated DeltaNet" indican el uso de capas de atención lineal basadas en DeltaNet con compuertas, combinadas presumiblemente con capas de atención convencional. El modelo se distribuye como código remoto, de modo que la implementación efectiva reside en los ficheros del repositorio y no en la librería `transformers` estándar. La model card menciona que, sin los paquetes opcionales `flash-linear-attention` y `causal-conv1d`, el modelo funciona igualmente mediante una implementación de referencia en PyTorch más lenta.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado más allá de la mención genérica a un ajuste fino sobre un modelo base Qwen. Tampoco se detalla la innovación técnica más allá de la propia arquitectura de atención lineal, que en teoría reduce el coste computacional y de memoria en secuencias largas frente a la atención cuadrática clásica. La plantilla de chat es de estilo ChatML y admite el flag `enable_thinking` para activar razonamiento previo a la respuesta.

## Capacidades

- Generación de texto y comprensión de documentos largos (libros, artículos, informes).
- Resumen capítulo a capítulo y síntesis de material extenso.
- Respuesta a preguntas sobre documentos largos (QA sobre contexto extenso).
- Escritura de formato largo y continuación de texto.
- Modo de razonamiento opcional mediante `enable_thinking=True`, a costa de generar más tokens.
- Conversación multi-turno con plantilla ChatML.
- Capacidades multilingües limitadas a inglés y japonés.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Resumen de libros por capítulos: el modelo está ajustado específicamente para esta tarea y la model card incluye un ejemplo de resumen fiel con decodificación greedy; su ventana de contexto "book-scale" permite introducir capítulos completos sin truncar.
- QA sobre documentación técnica extensa: se puede cargar un manual o normativa y formular preguntas concretas, usando `do_sample=False` para respuestas deterministas y verificables contra el texto fuente.
- Análisis de artículos científicos: extracción de metodología, resultados y limitaciones de papers largos en inglés, idioma principal del modelo.
- Procesamiento de informes corporativos o financieros en japonés: el soporte nativo de japonés lo hace adecuado para resumir documentación empresarial de esa lengua.
- Generación de borradores de formato largo: continuación y redacción de secciones extensas con `do_sample=True`, `temperature=0.7`, `top_p=0.8` y `top_k=20`, según recomienda el autor.
- Asistencia editorial con verificación humana: el modelo puede producir resúmenes de material propio para revisión posterior, aunque el autor advierte que puede añadir detalles no presentes en la fuente, por lo que requiere validación.
- Moderación o triaje de documentos largos en pipelines internos: al caber en 17 GB con cuantización NF4, puede desplegarse en una GPU de 24 GB para preprocesar lotes de documentos antes de un análisis más profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM en bf16: aproximadamente 54 GB, lo que exige una A100 80GB, H100 o equivalente.
- VRAM en 4-bit NF4: aproximadamente 17 GB, suficiente para GPUs de 24 GB como la RTX 4090, RTX 3090 o L4/A10 de 24 GB.
- El modelo debe cargarse íntegramente en GPU: el autor indica que el offloading a CPU no está soportado por los kernels personalizados y falla con `Tensor on device meta`.
- Despliegue mediante `transformers` + `accelerate` + `bitsandbytes`; se recomienda instalar `flash-linear-attention` y `causal-conv1d` para acelerar los kernels de atención lineal.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF hace improbable el despliegue en llama.cpp sin conversión previa.
- Latencia y throughput: no disponibles.
- El consumo de memoria crece con la longitud de la entrada, según advierte el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Longbook27-v2 | ~27B | no disponible ("book-scale") | apache-2.0 (con remisión al base Qwen) | HuggingFace, código remoto | Ajuste fino especializado en texto largo, EN/JA |
| Qwen2.5-32B-Instruct | ~32B | 128K tokens (según documentación pública de Qwen) | Apache 2.0 | HuggingFace, transformers estándar | Modelo generalista comparable en tamaño; no especializado en libros |
| Gemma 2 27B | ~27B | 8K tokens | Gemma license | HuggingFace, transformers estándar | Tamaño idéntico; contexto mucho menor y licencia más restrictiva |

La comparación con alternativas se basa en características públicas generales de esos modelos; no se dispone de datos de rendimiento del modelo evaluado frente a ellos.

## Limitaciones y advertencias

- Riesgo de alucinación documentado por el autor: los resúmenes pueden incluir detalles no presentes en el texto fuente, por lo que deben verificarse contra el original.
- El uso de `trust_remote_code=True` ejecuta código del repositorio (`modeling_qwen35_gdn24.py`, `fused_ops.py`); en entornos sensibles conviene revisar el código y fijar una `revision` concreta.
- El consumo de memoria crece con la longitud de la entrada, lo que limita el tamaño real de documento procesable según el hardware.
- Idiomas limitados a inglés y japonés; no se declara soporte de castellano.
- La licencia presenta ambigüedad: se declara apache-2.0 pero la model card remite también a la licencia del modelo base Qwen, lo que debe aclararse antes de un uso comercial.
- No se documentan benchmarks, por lo que no hay evidencia publicada de calidad frente a alternativas.
- No se documenta soporte de tool calling ni de despliegue en servidores de inferencia habituales (vLLM, TGI), lo que complica su puesta en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de validación por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/sekkit/Qwen3.8-27B-Longbook27-v2
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
