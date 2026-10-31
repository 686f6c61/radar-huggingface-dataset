# haybar4k/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-27B-abliterated es una versión "abliterated" (sin filtros de rechazo) del modelo Qwen3.8-27B de Qwen, publicada en formato GGUF por el usuario haybar4k en Hugging Face. La abliteración es una técnica que modifica direccionalmente los pesos del modelo para eliminar sus comportamientos de rechazo, sin necesidad de reentrenamiento completo. En este caso, el proceso se ha aplicado de forma selectiva: solo ciertas capas intermedias (por ejemplo, las capas 22 a 52 en las variantes más recientes) han sido abliteradas, conservando intactas las primeras capas, el módulo de predicción multi-token (MTP) y el componente visual.

El modelo base, Qwen3.8-27B, es un modelo multimodal (image-text-to-text) de la familia Qwen3, con aproximadamente 27.320 millones de parámetros y soporte para contextos de hasta 262.144 tokens según los comandos de ejemplo del propio repositorio. Su relevancia actual radica en la combinación de tres factores: es multimodal, dispone de cuantizaciones agresivas (incluyendo una serie ternaria de 2 bits con kernels híbridos de atención de PrismML) y es ejecutable localmente mediante llama.cpp, Ollama y herramientas similares, lo que lo hace atractivo para despliegues on-device y casos de uso que requieren modelos sin restricciones de alineación.

Cabe destacar que el repositorio no es una simple cuantización: incluye múltiples series derivadas de fuentes distintas (unsloth, ISTA-DASLab, prism-ml/Ternary-Bonsai, ukisai/Swift, ConwayResearch/Underdog-Saluki), con esquemas de cuantización no estándar (variantes "_L" que elevan a Q8_0 o BF16 los tensores abliterados para preservar calidad). La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atención híbrida y predicción multi-token (MTP); detalles completos no disponibles |
| Parametros totales | 27.320.697.856 (27,32 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | hasta 262.144 tokens (según ejemplo de llama.cpp en la model card); valor oficial no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q8_0_L, Q6_K, Q6_K_L, Q5_K, Q4_K, Q3_K, Q2_K, Q2_K_L, IQ2-mix y variantes ternarias (Ternary-Bonsai, 2-bit); esquemas "_L" no estándar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 799,7 GB); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer multimodal de la familia Qwen3 con capacidad image-text-to-text. La model card menciona dos componentes arquitectónicos relevantes: un módulo de predicción multi-token (MTP), que acelera la generación decodificando varios tokens por paso, y un mecanismo de atención híbrida. En las variantes derivadas de prism-ml/Ternary-Bonsai-2-27B se emplean pesos ternarios de 2 bits con kernels de atención híbrida que requieren un fork específico de llama.cpp (PrismML-Eng/llama.cpp); el llama.cpp estándar no puede ejecutar esos ficheros.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no se ofrece información en la model card. Lo que sí detalla el repositorio es el proceso de abliteración: se aplica la técnica descrita en remove-refusals-with-transformers (una implementación sin TransformerLens) de forma selectiva sobre las capas 22 a 52 (indexación base 0) en las series más recientes, dejando intactas las primeras capas para minimizar la degradación de rendimiento. Adicionalmente, en las cuantizaciones por debajo de Q8_0, los tensores afectados por la abliteración (token_embd, output, ffn_down, ssm_out, attn_output) se reconvierten a Q8_0 (variantes "_K_L"), y en la variante Q8_0_L se elevan a BF16, lo que explica que algunos ficheros Q2_K_L ocupen más que Q3_K o Q4_K.

## Capacidades

- Generación de texto conversacional sin mecanismos de rechazo (abliterated/uncensored).
- Comprensión de imágenes y generación de texto a partir de entrada imagen-texto (pipeline image-text-to-text); el módulo visual no ha sido modificado por la abliteración.
- Predicción multi-token (MTP) intacta, lo que permite acelerar la inferencia si el runtime lo soporta.
- Contexto muy largo (hasta 262.144 tokens según los ejemplos del repositorio), útil para documentos extensos.
- Ejecución local en CPU/GPU mediante llama.cpp, con soporte CUDA y Metal según los tags del repositorio.
- Disponibilidad directa en Ollama mediante `ollama run huihui_ai/Qwen3.8-abliterated`.
- Soporte de tool calling, capacidades de razonamiento específicas y capacidades multilingües: no disponible en la información proporcionada (dependen del modelo base Qwen3.8-27B, cuyas especificaciones no constan aquí).

## Casos de uso

- Asistentes conversacionales locales sin filtros: al estar abliterado, el modelo responde sin los rechazos típicos de los modelos alineados, útil para investigación en alineación y para usuarios que necesitan control total sobre el comportamiento del modelo en entornos locales.
- Análisis de documentos largos: con una ventana de contexto de hasta 262.144 tokens, puede procesar contratos, informes técnicos o bases de código extensas en una sola sesión mediante llama.cpp.
- Comprensión multimodal on-device: gracias al módulo visual intacto y a las cuantizaciones agresivas (2 bits ternarios), puede describir y razonar sobre imágenes en estaciones de trabajo locales sin depender de APIs externas.
- Investigación en cuantización extrema: las series Ternary-Bonsai y GSQ-RCO sirven como banco de pruebas para evaluar el impacto de la cuantización ternaria de 2 bits y los esquemas mixtos sobre la calidad de un modelo de 27B.
- Investigación en seguridad y abliteración selectiva: el hecho de que solo se abliteren las capas 22-52 y que se preserven MTP y el módulo visual lo hace idóneo para estudiar qué capas concentran los comportamientos de rechazo.
- Prototipado con Ollama: la disponibilidad en el registro de Ollama permite probar el modelo en local con un solo comando, útil para demos y validación rápida de ideas.
- Generación de contenido creativo sin restricciones: escritores y desarrolladores de juegos pueden usarlo para contenido que los modelos comerciales rechazan, asumiendo la responsabilidad ética y legal del uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la abliteración selectiva "ayuda a retener más del rendimiento original", pero no aporta métricas cuantitativas (MMLU, HumanEval, GSM8K ni comparativas con el modelo base).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia orientativa, un modelo de 27B en Q4_K ocupa en torno a 15-17 GB y en Q2_K en torno a 9-11 GB; las variantes "_L" y la versión BF16 (que elevan tensores clave a Q8_0 o BF16) requieren notablemente más memoria. El repositorio completo pesa 799,7 GB, aunque cada fichero GGUF se descarga individualmente.
- GPU recomendadas: para las cuantizaciones Q4_K y superiores, una RTX 4090 (24 GB) o RTX 3090 es adecuada; para variantes "_L", BF16 o contextos de 262K tokens, se recomiendan GPUs de gama datacenter (A100 40/80 GB, H100).
- Consumer GPU: las cuantizaciones Q2_K/Q3_K/Q4_K caben en una RTX 3090 o RTX 4090 con contexto moderado; las variantes ternarias de 2 bits pueden incluso ejecutarse en GPUs de 12-16 GB con contexto reducido, aunque requieren el fork PrismML de llama.cpp.
- Despliegue: llama.cpp (última versión; para la serie Ternary, obligatoriamente el fork PrismML-Eng/llama.cpp), Ollama (`huihui_ai/Qwen3.8-abliterated`) y llama-cpp-python. No se menciona soporte para vLLM o TGI con estos ficheros GGUF.
- Latencia y throughput: no disponibles. El módulo MTP intacto sugiere aceleración de la decodificación si el runtime lo aprovecha, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated (este) | 27,32 B | hasta 262.144 tokens (según repo) | Apache 2.0 | Abliterado, multimodal, cuantizaciones ternarias de 2 bits, MTP |
| Qwen/Qwen3.8-27B (base) | 27,32 B | no disponible | Apache 2.0 | Modelo original con alineación estándar, sin abliterar |
| ConwayResearch/Underdog-Saluki-27B-1.0 | 27 B (estimado) | no disponible | no disponible | Fine-tune derivado usado como fuente de una de las series |
| prism-ml/Ternary-Bonsai-2-27B | 27 B (estimado) | no disponible | no disponible | Pesos ternarios de 2 bits con atención híbrida, requiere fork de llama.cpp |

En términos generales, frente a otros modelos abliterados de tamaño similar (por ejemplo, versiones abliteradas de modelos de 27-32B publicadas por huihui-ai), este repositorio destaca por la variedad de fuentes de cuantización y por el esquema de abliteración selectiva por capas, a costa de requerir runtimes específicos en algunas series.

## Limitaciones y advertencias

- Al ser un modelo abliterated/uncensored, carece de los rechazos de seguridad estándar: puede generar contenido ofensivo, peligroso o ilegal si se le solicita. Su uso conlleva responsabilidad legal y ética plena para el desplegador.
- Riesgo de alucinación: no disponible cuantitativamente; la abliteración selectiva busca minimizar la degradación, pero la model card advierte de posibles "small disclaimer warnings" y de que varias series son "test/validation", es decir, experimentales.
- Las variantes ternarias (Ternary-Bonsai) no funcionan con el llama.cpp estándar: requieren el fork PrismML-Eng/llama.cpp.
- Los esquemas de cuantización "_L" no son estándar: algunos ficheros Q2_K_L son mayores que Q3_K o Q4_K, lo que puede confundir al elegir descargas.
- Idiomas soportados, soporte de tool calling y benchmarks: no disponibles; conviene validar el comportamiento real antes de cualquier despliegue en producción.
- La longitud de contexto de 262.144 tokens proviene de un comando de ejemplo, no de una especificación oficial verificada; ejecutar con contexto máximo exige memoria muy superior a la del propio peso del modelo.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base (Qwen3.8-27B) puede tener sus propias condiciones; revisar la ficha del modelo original.
- La abliteración parcial (solo capas 22-52) puede dejar respuestas con advertencias residuales o comportamientos inconsistentes entre capas tempranas y tardías.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/haybar4k/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio original de huihui-ai referenciado: huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF (enlace directo no disponible)
- Técnica de abliteración: https://github.com/Sumandora/remove-refusals-with-transformers
- Fork de llama.cpp para kernels ternarios: https://github.com/PrismML-Eng/llama.cpp
- Fuentes de las series derivadas:
  - https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
  - https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
  - https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
  - https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
  - https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama (releases): https://github.com/ollama/ollama/releases
