# loscrossos/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-27B-abliterated-GGUF es una versión "abliterated" (sin filtros de rechazo) del modelo Qwen3.8-27B de Qwen, publicada en formato GGUF por el usuario loscrossos en Hugging Face. La abliteración es una técnica que modifica direccionalmente los pesos del modelo para eliminar sus comportamientos de negación (refusals) sin necesidad de reentrenamiento, en este caso aplicada de forma selectiva a las capas 17-52 (indexación base 0), conservando las primeras capas intactas para preservar el máximo rendimiento original. El modelo base, Qwen3.8-27B, cuenta con 27.320.697.856 parámetros y es un modelo image-text-to-text, es decir, admite tanto texto como imágenes como entrada.

El repositorio no es una simple cuantización: incluye varias series derivadas de fuentes distintas (unsloth, ISTA-DASLab GSQ-RCO, prism-ml Ternary-Bonsai, ukisai Swift-1.5, ConwayResearch Underdog-Saluki), con variantes de cuantización no estándar (Q2_K_L a Q8_0_L) en las que los tensores sometidos a abliteración se elevan a mayor precisión para mitigar la degradación de calidad. Destaca también la serie Ternary, que emplea kernels de atención híbrida ternaria que requieren un fork específico de llama.cpp (PrismML-Eng), y la mención de MTP (multi-token prediction) y componentes visuales sin modificar.

Es relevante ahora porque combina tres tendencias actuales: modelos abiertos de tamaño medio (27B) ejecutables en hardware de consumo, la demanda de modelos sin alineación de rechazos para investigación y casos de uso especializados, y la experimentación con cuantizaciones agresivas (2-bit ternario) y atención híbrida para inferencia on-device. La licencia es Apache 2.0, lo que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con componentes híbridos (presencia de tensores ssm_out sugiere atención híbrida con estados tipo SSM; kernels ternarios de atención híbrida en la serie Ternary); soporte de MTP y visión |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 262.144 tokens (según el comando de ejemplo de llama.cpp) |
| Tipos de cuantizacion | bf16, Q8_0_L, Q6_K_L, Q5_K_L, Q4_K_L, Q3_K_L, Q2_K_L, además de series derivadas en IQ2 y PTQ1/Q2_K/Q3_K (ternario) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con endpoints; librería base transformers) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un modelo de 27.320.697.856 parámetros con pipeline image-text-to-text, lo que implica un componente visual integrado (el README indica explícitamente que la parte visual y el MTP, multi-token prediction, no han sido modificados por la abliteración). La presencia de tensores `ssm_out` en los archivos de conversión y los tags `hybrid-attention` y `ternary` apuntan a una arquitectura híbrida que combina atención estándar con mecanismos de estado tipo SSM, al menos en las variantes derivadas de prism-ml/Ternary-Bonsai-2-27B, cuyos kernels de atención híbrida ternaria residen en el fork PrismML-Eng/llama.cpp y no funcionan con llama.cpp estándar.

Sobre el entrenamiento del modelo base no se proporcionan datos (número de tokens, composición del dataset, RLHF/DPO): no disponibles. Lo que sí documenta la model card es el proceso de abliteración: se aplica una implementación propia (sin TransformerLens, basada en el método remove-refusals-with-transformers) solo sobre las capas 17 a 52, dejando las primeras capas sin modificar para retener rendimiento. Adicionalmente, en las cuantizaciones por debajo de Q8_0, los tensores abliterados (token_embd, output, ffn_down, ssm_out, attn_output) se reconvierten a Q8_0 (variantes "_L"), y en Q8_0_L a BF16, lo que produce archivos de tamaño no estándar (por ejemplo, Q2_K_L puede pesar más que Q3_K o Q4_K). No hay datos sobre entrenamiento adicional, fine-tuning con preferencias ni datasets de abliteración: no disponibles.

## Capacidades

- Generación de texto conversacional multilingüe (heredada de Qwen3.8-27B; lista concreta de idiomas: no disponible).
- Comprensión de imágenes (image-text-to-text): acepta entrada visual junto al texto; el componente visual no fue alterado por la abliteración.
- Razonamiento y generación de código: capacidades heredadas del modelo base Qwen3.8-27B (sin datos de benchmark específicos en esta ficha).
- Ventana de contexto amplia: hasta 262.144 tokens según el ejemplo de despliegue con llama.cpp.
- Ausencia de mecanismos de rechazo: responde a instrucciones que el modelo original denegaría, útil para investigación en seguridad y red-teaming.
- Multi-token prediction (MTP) intacto, potencialmente útil para decodificación especulativa y mayor throughput.
- Compatibilidad con llama.cpp, Ollama y ejecución on-device con backends CUDA y Metal.

Nota: no consta en la información disponible soporte explícito de tool calling, function calling ni modos de agente para esta variante abliterated.

## Casos de uso

- Investigación en seguridad y alineación: al carecer de refusals, permite estudiar comportamientos del modelo sin capa de negación, útil para red-teaming y evaluación de robustez de filtros externos.
- Asistentes locales privados: con GGUF y Ollama puede ejecutarse on-device (CUDA/Metal), garantizando que datos sensibles no salgan de la máquina del usuario, con contexto de hasta 262.144 tokens para documentos largos.
- Análisis de documentos extensos con imágenes: la naturaleza image-text-to-text y el contexto largo permiten procesar informes, contratos o materiales técnicos con figuras en una sola sesión.
- Generación de contenido creativo sin restricciones de rechazo: escritura de ficción, guiones o roleplay donde los rechazos del modelo original interrumpen el flujo creativo.
- Prototipado de pipelines de inferencia eficiente: la serie Ternary con cuantización de 2 bits y atención híbrida sirve para experimentar con kernels ternarios en hardware limitado (requiriendo el fork PrismML de llama.cpp).
- Chatbots multi-turno con memoria de contexto amplia: la ventana de 262K tokens permite mantener conversaciones largas o alimentar bases de conocimiento reducidas sin RAG externo.
- Pruebas comparativas de cuantización: las variantes Q2_K_L a Q8_0_L con tensores críticos elevados permiten medir el impacto real de la precisión por tensor en calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas, y advierte implícitamente que la abliteración selectiva y las re-cuantizaciones pueden alterar el rendimiento respecto al modelo base Qwen/Qwen3.8-27B, para el cual tampoco se aportan cifras en esta fuente.

## Requisitos de hardware

- VRAM estimada: no disponible como cifra oficial. El repo completo pesa 799,7 GB (incluye todas las variantes); a título orientativo, un GGUF de 27B en Q4_K ocupa en torno a 15-17 GB y en Q2_K/Q3_K en torno a 9-13 GB, aunque las variantes "_L" son mayores que sus equivalentes estándar por elevar tensores críticos a Q8_0/BF16. No inventar cifras exactas por variante: no disponible.
- GPU recomendadas: para las variantes grandes (Q6_K_L, Q8_0_L, bf16), GPUs con 24-48 GB o más (RTX 4090/5090, A100, H100); para las variantes Q2_K_L/Q3_K_L, GPUs de consumo de 12-16 GB pueden ser viables. No disponible como recomendación oficial.
- Consumer GPU: las cuantizaciones agresivas (2-3 bits) están pensadas para ejecución on-device en GPUs de consumo y en Metal (Apple Silicon), según los tags del repositorio (cuda, metal, on-device).
- Despliegue: llama.cpp (versión más reciente; imprescindible el fork PrismML-Eng/llama.cpp para la serie Ternary), Ollama (`ollama run huihui_ai/Qwen3.8-abliterated`), y compatibilidad con endpoints (endpoints_compatible).
- Latencia y throughput: no disponible. El MTP intacto sugiere potencial para decodificación acelerada, pero no hay mediciones publicadas.
- Contexto: el comando de ejemplo usa `-c 262144`, lo que exige reserva adicional de memoria KV cache proporcional a la ventana utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-GGUF | 27,32B | 262.144 tokens (según ejemplo) | Apache 2.0 | Abliterado, GGUF multi-cuantización, visión, MTP, serie ternaria híbrida |
| Qwen/Qwen3.8-27B (base) | 27,32B | no disponible en la fuente | no disponible en la fuente | Modelo original con alineación de refusals |
| ConwayResearch/Underdog-Saluki-27B-1.0 | 27B (estimado por denominación) | no disponible | no disponible | Fine-tune derivado usado como fuente de una serie abliterada |
| prism-ml/Ternary-Bonsai-2-27B | 27B (estimado por denominación) | no disponible | no disponible | Cuantización ternaria 2-bit con atención híbrida, requiere fork de llama.cpp |

La comparación en rendimiento no es posible: no hay benchmarks publicados para ninguno de estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: al eliminar los mecanismos de rechazo, el modelo puede generar contenido dañino, ilegal o inapropiado. Su uso exige marcos de evaluación y filtros externos en cualquier despliegue real.
- La abliteración es una prueba de concepto descrita por el propio autor como "crude, proof-of-concept"; puede degradar la coherencia y las capacidades respecto al modelo base, especialmente en las capas modificadas (17-52).
- Las series Ternary, Swift y Underdog-Saluki son explícitamente tests/validations y pueden incluir avisos de calidad; la variante Underdog-Saluki-IQ2-mix solo abliteró 62 pesos, por lo que su comportamiento puede diferir sustancialmente.
- La serie Ternary no funciona con llama.cpp estándar: requiere el fork PrismML-Eng/llama.cpp, lo que añade fricción de mantenimiento.
- Las cuantizaciones "_L" no son estándar: los tamaños de archivo no siguen las proporciones habituales (Q2_K_L puede superar a Q3_K/Q4_K), lo que puede confundir al planificar almacenamiento y VRAM.
- Riesgo de alucinación: inherente al modelo base y potencialmente agravado por la abliteración; no hay datos cuantificados.
- Idiomas soportados: no disponibles en la documentación.
- Sesgos conocidos: no disponibles.
- Licencia Apache 2.0: permite uso comercial, pero el modelo carece de salvaguardas de seguridad, responsabilidad que recae en el desplegador.
- La model card original está truncada en la sección "Usage Warnings", por lo que pueden existir advertencias adicionales no visibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loscrossos/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio original de huihui-ai referenciado: huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF (en Hugging Face)
- Método de abliteración: https://github.com/Sumandora/remove-refusals-with-transformers
- Fork de llama.cpp con kernels ternarios: https://github.com/PrismML-Eng/llama.cpp
- llama.cpp oficial: https://github.com/ggml-org/llama.cpp
- Ollama: https://github.com/ollama/ollama/releases y https://ollama.com/huihui_ai/Qwen3.8-abliterated
- unsloth/Qwen3.8-27B-GGUF: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- prism-ml/Ternary-Bonsai-2-27B-gguf: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- ConwayResearch/Underdog-Saluki-27B-1.0: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
