# Shishkipiski/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-27B-abliterated-GGUF es una versión "abliterated" (sin filtros de rechazo) del modelo Qwen3.8-27B de Qwen, publicada por el usuario Shishkipiski en Hugging Face. La abliteración es una técnica que modifica selectivamente los pesos del modelo —en este caso, las capas 22 a 52 (indexación base 0)— para eliminar los comportamientos de rechazo ante solicitudes sensibles, sin necesidad de reentrenar el modelo ni recurrir a herramientas como TransformerLens. El resultado se distribuye en formato GGUF, lo que permite su ejecución local mediante llama.cpp, Ollama u otros runtimes compatibles.

El modelo base, Qwen3.8-27B, es un modelo de 27.320.697.856 parámetros con capacidades de imagen-texto-a-texto (pipeline image-text-to-text), lo que sugiere que incorpora un componente visual además del núcleo lingüístico. La ficha del autor menciona que el módulo visual y el mecanismo MTP (multi-token prediction) no han sido modificados durante el proceso de abliteración. Además de la serie estándar derivada de los GGUF de unsloth, el repositorio incluye variantes experimentales basadas en modelos ternarios con atención híbrida de PrismML (Ternary-Bonsai-2-27B), que requieren un fork específico de llama.cpp y no funcionan con la versión estándar. Con licencia Apache 2.0 y más de 5.000 descargas, es relevante para desarrolladores que buscan un modelo multimodal de 27B sin restricciones de alineación para ejecución on-device.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (variantes ternarias de PrismML); componente visual y MTP intactos |
| Parámetros totales | 27.320.697.856 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 262.144 tokens (según comando de ejemplo con `-c 262144`) |
| Tipos de cuantización | BF16, Q8_0, Q8_0_L, Q2_K, Q3_K, Q4_K, Q5_K, Q6_K y variantes "_L" (Q2_K_L a Q6_K_L, con tensores clave promovidos a Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 799,7 GB; también etiquetado transformers) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27,3 mil millones de parámetros con pipeline image-text-to-text, es decir, con capacidad multimodal de entrada de imagen y salida de texto. La model card indica que el modelo incorpora MTP (multi-token prediction), una técnica que permite predecir varios tokens por paso y acelerar la generación, y que este módulo no se ha tocado en la abliteración. No se dispone de datos sobre el número de tokens de preentrenamiento ni la composición del dataset.

La abliteración se aplicó de forma parcial: en las series más recientes solo se modifican las capas 22 a 52, conservando intactas las capas anteriores. Según el autor, esta estrategia parcial ayuda a retener más del rendimiento original del modelo. Además, se aplicó un esquema de cuantización no estándar: en las variantes Q2_K_L a Q6_K_L, los tensores afectados por la abliteración (token_embd, output, ffn_down, ssm_out, attn_output) se promueven a Q8_0 para minimizar la degradación de calidad, lo que explica que un Q2_K_L pueda ocupar más espacio que un Q3_K o Q4_K estándar. En la variante Q8_0_L, esos mismos tensores se elevan a BF16. La presencia de tensores ssm_out sugiere componentes de tipo state-space en la atención híbrida del modelo base. Las variantes ternarias de PrismML (Ternary-Bonsai-2-27B) usan kernels de atención híbrida ternaria que solo funcionan con el fork PrismML-Eng/llama.cpp.

## Capacidades

- Generación de texto conversacional sin mecanismos de rechazo (abliterated), etiquetada como conversational.
- Comprensión de imágenes y generación de texto a partir de imagen y texto (pipeline image-text-to-text); el módulo visual no fue modificado por la abliteración.
- Contexto extenso de hasta 262.144 tokens según el ejemplo de ejecución.
- Aceleración de generación mediante MTP (multi-token prediction) heredado del modelo base.
- Compatibilidad con ejecución local en CUDA, Metal y on-device mediante llama.cpp y Ollama.
- Variantes experimentales con cuantización ternaria de 2 bits y atención híbrida para hardware limitado.
- No hay información sobre tool calling, function calling, agentes ni capacidades de razonamiento estructurado en la información disponible.

## Casos de uso

- Asistentes conversacionales locales sin filtros: al ser una versión abliterated, responde sin los rechazos típicos de RLHF, útil para investigación sobre alineación y comportamiento de modelos.
- Análisis y descripción de imágenes en local: gracias al pipeline image-text-to-text, puede integrarse en flujos de OCR avanzado, descripción de contenido visual o indexación multimodal de documentos sin enviar datos a la nube.
- Procesamiento de documentos largos: con una ventana de contexto de hasta 262.144 tokens, permite resumir o interrogar contratos, informes técnicos o bases de código extensas en una sola pasada.
- Despliegue on-device en hardware limitado: las variantes ternarias de 2 bits (Ternary-Bonsai) y las cuantizaciones Q2_K/Q3_K permiten ejecutar el modelo en equipos sin GPU de gama alta, incluidos equipos con Metal (Apple Silicon).
- Investigación en abliteración y cuantización mixta: el repositorio documenta con detalle el método de cuantización por tipo de tensor (Q*_L), lo que lo hace útil como referencia para experimentar con esquemas de cuantización selectiva.
- Prototipado con Ollama: puede desplegarse con un solo comando (`ollama run huihui_ai/Qwen3.8-abliterated`), lo que facilita pruebas rápidas en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; como referencia, un modelo de 27B en Q4_K ocupa en torno a 16-17 GB, en Q8_0 en torno a 29 GB y en BF16 unos 55 GB. Las variantes ternarias de 2 bits reducen considerablemente el footprint (el tamaño total del repo, 799,7 GB, incluye todas las variantes).
- GPU recomendadas: no disponible explícitamente; por tamaño, una RTX 4090 (24 GB) cubriría las variantes Q2_K-Q4_K, mientras que Q8_0 y BF16 requerirían A100/H100 o descarga parcial a RAM.
- Consumer GPU: las cuantizaciones Q2_K, Q3_K y Q4_K caben en GPUs de 24 GB (RTX 3090/4090); las variantes Q2_K_L pueden ser mayores que un Q3_K/Q4_K estándar por los tensores promovidos a Q8_0, conviene verificar el tamaño de archivo concreto.
- CPU/Metal: el repositorio etiqueta soporte cuda, metal y on-device, con compatibilidad con llama.cpp (versión más reciente) y Ollama.
- Despliegue: llama.cpp (llama-cli con `-c 262144`), Ollama (`huihui_ai/Qwen3.8-abliterated`), transformers. Importante: las variantes Ternary requieren el fork PrismML-Eng/llama.cpp; el llama.cpp estándar no puede ejecutarlas.
- Latencia y throughput: no disponibles; el MTP intacto sugiere aceleración de la generación respecto a un modelo equivalente sin MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización mínima | Licencia | Particularidad |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated (este) | 27,3B | 262.144 | Q2_K / ternario 2-bit | Apache 2.0 | Abliterated, multimodal, MTP |
| Qwen/Qwen3.8-27B (base) | 27,3B | no disponible | no disponible | no disponible | Modelo original con filtros de rechazo |
| ConwayResearch/Underdog-Saluki-27B-1.0 | 27B (aprox.) | no disponible | IQ2-mix | no disponible | Base de una de las series abliterated |
| prism-ml/Ternary-Bonsai-2-27B | 27B (aprox.) | no disponible | Ternaria 2-bit | no disponible | Atención híbrida ternaria, requiere fork de llama.cpp |

## Limitaciones y advertencias

- Al tratarse de un modelo abliterated/uncensored, elimina los mecanismos de rechazo: puede generar contenido ofensivo, peligroso o inapropiado. Su uso conlleva riesgos legales y éticos significativos y es responsabilidad del usuario.
- La abliteración parcial (capas 22 a 52) puede degradar el rendimiento respecto al modelo base; el autor lo describe como prueba de concepto y las series Ternary/Swift/Underdog-Saluki/GSQ-RCO son explícitamente "test/validation".
- El esquema de cuantización "_L" no es estándar: Q2_K_L puede ocupar más que Q3_K o Q4_K, lo que puede confundir al elegir variante.
- Las variantes Ternary no funcionan con llama.cpp estándar; requieren el fork PrismML-Eng/llama.cpp.
- Algunas series "may come with a small disclaimer warning" según el autor, y en una de las variantes solo se abliteraron 62 pesos, por lo que el grado de eliminación de rechazos varía entre archivos.
- No hay datos publicados de benchmarks, sesgos conocidos ni evaluaciones de alucinación para esta versión abliterated.
- Idiomas soportados, parámetros activos y detalles de entrenamiento: no disponibles.
- Licencia Apache 2.0: permite uso comercial, pero el comportamiento del modelo sin filtros puede incumplir las políticas de plataformas de despliegue comerciales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shishkipiski/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF original de huihui-ai (referenciado en la model card): huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- GGUF de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Variante GSQ-RCO (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Variante ternaria (PrismML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Variante Underdog-Saluki: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- Variante Swift: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Fork de llama.cpp para kernels ternarios: https://github.com/PrismML-Eng/llama.cpp
- Método de abliteración: https://github.com/Sumandora/remove-refusals-with-transformers
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://github.com/ollama/ollama/releases
- Ollama (modelo listo para usar): https://ollama.com/huihui_ai/Qwen3.8-abliterated
