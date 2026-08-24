# dealignai/Ornith-1.5-35B-A3B-JANG_2L-UNCENSORED-CRACK

## Resumen

Ornith-1.5-35B-A3B es un modelo vision-language de tipo Mixture-of-Experts desarrollado por el equipo de Ornith AI, presentado como parte de la familia Ornith-1.5 que extiende el concepto de self-scaffolding hacia un bucle de auto-mejora. Este modelo concreto es una variante modificada por dealignai que elimina el comportamiento de rechazo a nivel de pesos (abliteración) y se distribuye como un bundle MLX de precisión mixta de 2 bits (el más pequeño de la serie JANG), optimizado para Apple Silicon.

El modelo base tiene 35,9 mil millones de parámetros totales con aproximadamente 3 mil millones activos por token (A3B), 40 capas, 256 expertos enrutados y una arquitectura híbrida que combina un backbone gated-delta con atención completa, además de una torre de visión de 27 capas y soporte nativo de vídeo. La versión de dealignai mantiene las capacidades de razonamiento, visión, vídeo y codificación agéntica del original, con una ventana de contexto de 262.144 tokens y un tamaño aproximado de 16 GB, lo que permite ejecutarlo en hardware de consumo con suficiente memoria unificada.

La relevancia de este modelo radica en su doble vertiente: por un lado, representa un avance en modelos MoE multimodal abiertos con razonamiento activado por defecto; por otro, su naturaleza "uncensored" lo posiciona como una herramienta para investigación en seguridad de IA y pruebas de seguridad autorizadas, con la advertencia explícita de que el usuario es responsable de su uso conforme a la ley.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE vision-language híbrida: backbone gated-delta + atención completa, 40 capas, 256 expertos enrutados, torre de visión de 27 capas |
| Parámetros totales | 35,9B (5.032.894.512 en safetensors cuantizado) |
| Parámetros activos | ~3B (A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | 2-bit mixed-precision (JANG_2L, el bundle más pequeño); también disponible en GGUF y MXFP8 de referencia |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

La arquitectura de Ornith-1.5-35B-A3B combina un backbone híbrido gated-delta con atención completa en una configuración MoE de 256 expertos enrutados y 40 capas, con aproximadamente 3B parámetros activos por token. El modelo incluye una torre de visión de 27 capas y un preprocesador de vídeo nativo, lo que lo convierte en un modelo vision-language capaz de procesar imágenes y secuencias de vídeo sin adaptadores externos. La familia Ornith-1.5 introduce el concepto de self-scaffolding extendido a un bucle de auto-mejora, donde el modelo genera sus propios andamios de razonamiento y los utiliza para mejorar su rendimiento de forma iterativa.

La variante de dealignai aplica una técnica de abliteración (abliteration) que elimina el comportamiento de rechazo a nivel de los pesos, sin hooks en tiempo de ejecución ni vectores de dirección. El resultado es un bundle MLX estándar que sigue instrucciones en todas las categorías de tareas sin rechazar, mientras conserva las capacidades de codificación, conocimiento, razonamiento y visión del modelo base. La cuantización a 2-bit mixed precision se organiza en módulos con precisión diferenciada (JANG), con overrides de precisión por módulo que el motor de inferencia vMLX respeta. Los tokens de fin de secuencia son `eos_token_id = [248046, 248044]`.

## Capacidades

- Razonamiento activado por defecto: el modelo abre la respuesta con un bloque de pensamiento (`thinking`) antes de la respuesta final, conmutable mediante el parámetro `enable_thinking`.
- Visión multimodal: acepta imágenes a través del procesador incluido en el bundle (pipeline image-text-to-text).
- Vídeo nativo: incluye un preprocesador de vídeo nativo, sin necesidad de adaptadores externos.
- Tool calling nativo: soporta llamadas a herramientas mediante esquemas XML y de función (function schema), con un parser que las expone como tool_calls estilo OpenAI.
- Codificación agéntica: el modelo puede gestionar flujos de trabajo de codificación multi-paso con razonamiento intermedio.
- Comportamiento sin rechazos: tras la abliteration, sigue instrucciones en todas las categorías de tareas sin negarse.
- Contexto largo: ventana de 262.144 tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Decodificación especulativa: la versión para DGX Spark incluye MTP (multi-token prediction) en el checkpoint.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar el comportamiento de modelos sin capas de rechazo, analizando cómo se comportan ante instrucciones adversas y evaluando estrategias de mitigación. Es útil para medir el impacto de la abliteration en el rendimiento de tareas benignas.
- Pruebas de seguridad autorizadas: en entornos controlados y con autorización legal, el modelo puede servir para testear sistemas de moderación de contenido y detectar vulnerabilidades en pipelines de seguridad.
- Codificación agéntica en local: gracias a su soporte de tool calling y razonamiento multi-paso, puede integrarse en entornos de desarrollo en Apple Silicon para generación de código, refactorización y revisión de cambios, con los 262K de contexto para mantener repositorios completos en memoria.
- Análisis de vídeo e imágenes en local: con su torre de visión y procesador de vídeo nativo, puede describir, resumir y responder preguntas sobre contenido audiovisual sin enviar datos a servicios externos, adecuado para entornos con requisitos de privacidad.
- Asistente de documentación técnica: con la ventana de contexto de 262.144 tokens, puede procesar manuales, especificaciones y bases de código extensas para generar resúmenes, diagramas y documentación.
- Investigación en alineación: el contraste entre el modelo base (80,5% MMLU) y el uncensored (78,5%) permite estudiar el coste de la abliteración en términos de capacidad, así como la divergencia KL (0,2222 nats) respecto al modelo original.
- Inferencia de razonamiento en Apple Silicon: el bundle MLX de 2 bits (~16 GB) permite ejecutar un modelo de 35,9B con razonamiento activado en hardware de consumo como Mac Studio o MacBook Pro con chips M1 Pro o superiores.

## Benchmarks y rendimiento

Los resultados publicados por el autor en la model card se midieron sobre este bundle exacto:

| Métrica | Valor |
|---|---|
| MMLU (57 subconjuntos, modo logit) | 78,5% (base 80,5%, Δ -2,02) |
| Cumplimiento HarmBench | 99,6% (239/240) |
| Divergencia KL vs MXFP8 uncracked | 0,2222 nats |
| Tamaño | ~16 GB |

Desglose MMLU por categoría (base vs uncensored):

| Categoría | Base | Uncensored | Δ |
|---|---:|---:|---:|
| STEM | 74,2% | 72,1% | -2,1 |
| Humanidades | 82,3% | 78,1% | -4,2 |
| Ciencias Sociales | 88,3% | 87,9% | -0,4 |
| Otros | 80,8% | 79,6% | -1,2 |
| **Global (57 subj.)** | **80,5%** | **78,5%** | **-2,02** |

Nota: la métrica de cumplimiento HarmBench se mide con gate de coherencia (las respuestas en bucle o plantillas vacías no cuentan) y excluye comportamientos de reproducción de contenido con copyright.

## Requisitos de hardware

- VRAM estimada: ~16 GB en formato MLX 2-bit mixed precision (JAM_2L). En Apple Silicon, se ejecuta sobre la memoria unificada del sistema.
- GPU recomendadas: chips Apple Silicon con al menos 16 GB de memoria unificada (M1 Pro, M1 Max, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max, etc.). Para la versión DGX Spark, se recomienda NVIDIA DGX Spark (GB10 / SM121, ~128 GB de memoria unificada).
- ¿Cabe en GPU de consumo? Sí, en Apple Silicon con 16 GB o más de RAM unificada. No está diseñado para GPUs NVIDIA de consumo en este formato MLX; existe una variante GGUF para LM Studio, Jan y vLLM.
- Opciones de despliegue: vMLX (recomendado, respeta los overrides de precisión mixta por módulo), MLX-VLM con soporte `qwen3_5_moe`, vLLM (para la variante DGX Spark con NVFP4), LM Studio y Jan (variante GGUF).
- Latencia y throughput: no se han publicado datos de latencia o throughput en la información disponible. La variante DGX Spark incluye decodificación especulativa MTP en el checkpoint para acelerar la generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | MMLU | Licencia | Formato |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35,9B | ~3B | 262K | 80,5% | Apache-2.0 | safetensors (BF16/MXFP8) |
| Ornith-1.5-35B-A3B UNCENSORED CRACK (este modelo) | 35,9B | ~3B | 262K | 78,5% | Apache-2.0 | MLX 2-bit (JAM_2L) |
| Ornith-1.5-35B-A3B UNCENSORED GGUF | 35,9B | ~3B | 262K | no disponible | Apache-2.0 | GGUF |
| Qwen3-VL (referencia comparable en tamaño) | ~35B | no disponible | 256K | no disponible | Apache-2.0 | safetensors/GGUF |

La comparativa con Qwen3-VL se indica como referencia de la misma categoría (modelo MoE vision-language con contexto largo), pero los datos de benchmark específicos de Qwen3-VL no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin capas de rechazo: la abliteration elimina el comportamiento de rechazo a nivel de pesos, lo que significa que seguirá instrucciones en todas las categorías de tareas, incluyendo aquellas que podrían ser dañinas. El autor declara que se publica para investigación de seguridad de IA y pruebas de seguridad autorizadas, y que el usuario es el único responsable de su uso y del cumplimiento de la ley aplicable.
- Degradación de capacidad: la abliteration reduce el rendimiento en MMLU en 2,02 puntos porcentuales (de 80,5% a 78,5%), con una caída mayor en Humanidades (-4,2 puntos).
- Cuantización de 2 bits: la cuantización de 2-bit mixed precision puede introducir degradación adicional en tareas que requieran precisión numérica fina, como matemáticas complejas o razonamiento lógico extenso.
- Idioma: el modelo está entrenado y optimizado únicamente en inglés. No se garantiza un rendimiento adecuado en otros idiomas.
- Compatibilidad de runtime: requiere un runtime MLX-VLM con soporte `qwen3_5_moe` o el motor vMLX para respetar los overrides de precisión mixta por módulo. Otros runtimes pueden no aprovechar la configuración JAM.
- Riesgo de alucinación: como todo modelo de lenguaje grande, puede generar contenido plausible pero incorrecto, especialmente en tareas de vídeo o imágenes donde la información visual es ambigua.
- Sin garantía de producción: el autor no ofrece garantías de estabilidad o rendimiento en entornos de producción; la variante GGUF puede no tener las mismas optimizaciones de precisión mixta que el bundle MLX.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/Ornith-1.5-35B-A3B-JANG_2L-UNCENSORED-CRACK
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante GGUF uncensored: https://huggingface.co/dealignai/Ornith-1.5-35B-A3B-UNCENSORED-GGUF (discusiones sobre vLLM)
- Blog de Ornith sobre la familia 1.5: https://ornith.ai/ornith_1_5.html
- Modelo en ModelScope: https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio DGX Spark de Mia AI Lab: https://github.com/MiaAI-Lab/Ornith-1.5-35B-A3B-DGX-Spark
- Motor de inferencia vMLX: https://vmlx.net
- Soporte del autor: https://ko-fi.com/dealignai · https://dealign.ai
