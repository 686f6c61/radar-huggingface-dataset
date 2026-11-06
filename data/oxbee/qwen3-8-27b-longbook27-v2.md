# OxBee/Qwen3.8-27B-Longbook27-v2

## Resumen

Qwen3.8-27B-Longbook27-v2 es un ajuste fino de 27.072.285.696 parámetros (unos 27B) desarrollado por el usuario OxBee (la model card interna atribuye el trabajo a "summerMC") y orientado a la comprensión y generación de texto de formato largo: libros, artículos científicos e informes extensos. El modelo parte de la familia Qwen y se distribuye con licencia Apache 2.0, pesos en safetensors y bf16 (54,2 GB de repositorio).

Su rasgo técnico más distintivo es la arquitectura, etiquetada como `qwen3_5_gdn24`, que incorpora capas de atención lineal Gated DeltaNet en un esquema híbrido. Esta elección busca contener el coste computacional y de memoria en entradas de escala de libro, donde la atención cuadrática clásica se vuelve prohibitiva. El modelo se publica como código remoto: requiere `trust_remote_code=True` para cargarse, ya que los ficheros `modeling_qwen35_gdn24.py` y `fused_ops.py` no forman parte de Transformers.

La versión v2 refina el comportamiento y la calidad de salida respecto a v1. Está pensado para resumen capítulo a capítulo, question answering sobre documentos largos y escritura de formato largo, con soporte de plantilla ChatML y un modo `enable_thinking` opcional. Su relevancia actual radica en ser una de las pocas alternativas abiertas de 27B con atención lineal híbrida específicamente ajustada para contexto largo, aunque con un ecosistema de despliegue todavía limitado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen3_5_gdn24` (transformer híbrido con capas de atención lineal Gated DeltaNet, código remoto) |
| Parámetros totales | 27.072.285.696 (~27B) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible (descrito como "book-scale", sin cifra publicada) |
| Tipos de cuantización | bf16 nativo; 4-bit NF4 (bitsandbytes) documentado por el autor |
| Idiomas soportados | inglés, japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, ~54 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer híbrido identificada como `qwen3_5_gdn24`, con 24 capas de atención lineal Gated DeltaNet combinadas con atención estándar. Gated DeltaNet es una variante de atención lineal con compuertas que mantiene un estado recurrente de tamaño constante, lo que reduce el coste de memoria frente a la atención completa al procesar secuencias muy largas. El autor recomienda instalar `flash-linear-attention` y `causal-conv1d` para acelerar los kernels; sin ellos, el modelo funciona con una implementación de referencia en PyTorch más lenta.

No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset de ajuste fino, ni si se aplicaron técnicas de RLHF o DPO. La model card solo indica que v2 mejora el comportamiento y la calidad de salida respecto a v1, sin detallar la metodología. Tampoco se especifica la longitud de contexto máxima entrenada, aunque el ajuste está claramente orientado a entradas de escala de libro.

## Capacidades

- Generación de texto y comprensión de documentos largos (libros, artículos, informes).
- Resumen estructurado, incluyendo resumen capítulo a capítulo con instrucción de fidelidad al texto fuente.
- Question answering sobre documentos extensos pasados en el prompt.
- Escritura de formato largo y continuación de texto.
- Modo de razonamiento opcional mediante `enable_thinking` en la plantilla de chat, a coste de más tokens generados.
- Plantilla de chat estilo ChatML.
- Multilingüe limitado a inglés y japonés.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Resumen de libros y manuales técnicos: el modelo acepta el texto completo o por capítulos y genera resúmenes con decodificación greedy (`do_sample=False`), configuración que el autor recomienda para maximizar la fidelidad al fuente.
- Question answering sobre documentación interna extensa: se puede volcar un informe de decenas de páginas en el prompt y formular preguntas concretas, aprovechando la atención lineal para contener el coste de memoria en entradas largas.
- Análisis de artículos científicos: extracción de contribuciones, metodología y resultados de papers largos en inglés, uno de los dos idiomas soportados.
- Generación de borradores de formato largo: escritura de capítulos o secciones con `do_sample=True`, `temperature=0.7`, `top_p=0.8` y `top_k=20`, parámetros sugeridos por el autor para escritura creativa.
- Procesamiento de documentación en japonés: resumen y consulta de documentos técnicos o corporativos en japonés, el segundo idioma declarado.
- Pipelines de resumen por lotes en GPU de 24 GB: con cuantización NF4 el modelo ocupa unos 17 GB, lo que permite desplegarlo en una RTX 4090 o A10G para tareas de resumen desatendidas, siempre que se mantenga todo el modelo en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM en bf16: aproximadamente 54 GB; requiere A100 80GB, H100 o similar.
- VRAM en 4-bit NF4: aproximadamente 17 GB; cabe en GPU de 24 GB (RTX 4090, A10G, L4 no confirmado).
- El autor indica explícitamente que el modelo completo debe cargarse en GPU: el offloading a CPU no está soportado por los kernels personalizados y falla con `Tensor on device meta`.
- Dependencias: `transformers`, `accelerate`, `bitsandbytes`; opcionales `flash-linear-attention` y `causal-conv1d` para acelerar la atención lineal.
- Opciones de despliegue: carga vía Transformers con `trust_remote_code=True`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y la arquitectura personalizada hace improbable que funcionen sin portar el código.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Longbook27-v2 | ~27B | no disponible ("book-scale") | Apache 2.0 | Hugging Face, código remoto | Atención lineal Gated DeltaNet, ajuste para texto largo, solo en/ja |
| Qwen2.5-32B-Instruct | 32B | 128K tokens | Apache 2.0 | Hugging Face, ecosistema amplio | Transformer estándar, soporte nativo en vLLM y llama.cpp |
| Qwen3-32B | 32B | 128K tokens | Apache 2.0 | Hugging Face, ecosistema amplio | Modo thinking, multilingüe amplio, tool calling |
| Gemma 2 27B | 27B | 8K tokens | Gemma license | Hugging Face, gated | Sin contexto largo nativo, licencia con restricciones de uso |

La comparación con Qwen2.5-32B y Qwen3-32B es la más directa por tamaño y licencia; ambos ofrecen contexto de 128K documentado y despliegue estándar en vLLM, frente a la arquitectura personalizada de este modelo, que exige código remoto y no tiene soporte confirmado en servidores de inferencia de alto rendimiento.

## Limitaciones y advertencias

- El uso de memoria crece con la longitud de entrada; el modelo no aplica compresión de contexto documentada más allá de la atención lineal.
- El autor advierte que los resúmenes pueden añadir detalles no presentes en el texto fuente; es necesario verificar contra el original.
- `trust_remote_code=True` ejecuta código del repositorio (`modeling_qwen35_gdn24.py`, `fused_ops.py`); conviene revisarlo y fijar una `revision` concreta en entornos sensibles.
- No se admite offloading a CPU: entornos con poca VRAM no pueden ejecutarlo.
- Idiomas limitados a inglés y japonés; el rendimiento en castellano no está garantizado.
- No se documentan sesgos conocidos, pero al ser un ajuste fino sin información sobre el dataset, no se puede evaluar su alineación.
- Licencia Apache 2.0 según los metadatos, aunque la model card indica que "sigue la licencia del modelo Qwen base"; conviene verificar la procedencia del modelo base para uso comercial.
- La arquitectura personalizada limita el soporte en herramientas de despliegue estándar (vLLM, TGI, llama.cpp).
- Modelo con 406 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria muy reducidos.

## Enlaces

- Hugging Face: https://huggingface.co/OxBee/Qwen3.8-27B-Longbook27-v2
- Repositorio de código remoto incluido en el modelo: `modeling_qwen35_gdn24.py`, `fused_ops.py` (en el propio repo de Hugging Face)
- Flash Linear Attention: https://github.com/fla-org/flash-linear-attention
- causal-conv1d: https://github.com/Dao-AILab/causal-conv1d
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
