# rax4901/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-27B-abliterated-GGUF es una versión "abliterated" (sin filtros de rechazo) de Qwen3.8-27B, publicada por el usuario rax4901 a partir del trabajo de huihui-ai. El modelo base es Qwen/Qwen3.8-27B, un modelo multimodal de 27.320.697.856 parámetros con capacidades de imagen-texto-a-texto, y la abliteración se ha aplicado mediante una técnica de modificación de direcciones de rechazo sin TransformerLens, dejando intactas las primeras capas y los componentes de MTP (multi-token prediction) y visión.

La relevancia de esta ficha reside en que el repositorio no es una simple cuantización: incluye varias series de pesos derivadas de proyectos distintos (unsloth, ISTA-DASLab GSQ-RCO, prism-ml Ternary-Bonsai con atención híbrida ternaria de 2 bits, Swift-1.5 y Underdog-Saluki), con esquemas de cuantización mixta no estándar (variantes "_L") que priorizan la calidad en los tensores abliterados. Es un modelo experimental orientado a la inferencia local con llama.cpp y Ollama.

Cabe destacar que algunas variantes, como la serie Ternary, requieren un fork específico de llama.cpp (PrismML-Eng/llama.cpp) y no funcionan con la versión estándar. La licencia es Apache 2.0, lo que permite uso comercial, aunque el propio autor advierte de riesgos asociados al contenido sin censura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (hibrid-attention, con tensores ssm_out que sugieren componentes tipo SSM), MTP y módulo visual |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 262.144 tokens (según el ejemplo de llama.cpp del autor) |
| Tipos de cuantizacion | BF16, Q8_0, Q8_0_L, Q2_K_L, Q3_K_L, Q4_K_L, Q5_K_L, Q6_K_L, Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, IQ2 (mix), variantes ternarias de 2 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp, Ollama; librería base transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal (pipeline image-text-to-text) de unos 27,3 mil millones de parámetros que incorpora mecanismos de atención híbrida —los tensores mencionados (ssm_out, attn_output) apuntan a una mezcla de atención estándar y estados tipo SSM—, predicción multi-token (MTP) y un componente visual sin modificar en la versión abliterada. No se dispone de datos publicados sobre el número de tokens de preentrenamiento ni la composición del dataset.

La abliteración se ha realizado con una implementación "cruda" de prueba de concepto que elimina los rechazos sin usar TransformerLens. En las series recientes solo se abliteran las capas 22 a 52 (indexación base 0), conservando el resto sin modificar para minimizar la degradación de rendimiento. En las cuantizaciones por debajo de Q8_0, los tensores afectados por la abliteración (token_embd, output, ffn_down, ssm_out, attn_output) se reconvierten a Q8_0 (o BF16 en la variante Q8_0_L), dando lugar a los ficheros "_L" de mayor tamaño. La serie Ternary procede de prism-ml/Ternary-Bonsai-2-27B, con kernels de atención híbrida ternaria de 2 bits que requieren el fork PrismML-Eng/llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno (tag "conversational"), sin mecanismos de rechazo tras la abliteración.
- Comprensión multimodal imagen-texto-a-texto: el módulo visual del modelo base no ha sido modificado por la abliteración.
- Predicción multi-token (MTP) intacta, potencialmente útil para decodificación especulativa y mayor velocidad de generación.
- Contexto largo de hasta 262.144 tokens en llama.cpp.
- Ejecución on-device en CUDA y Metal mediante GGUF.
- Soporte para razonamiento, código y matemáticas: no disponible en detalle (no se publican datos específicos).
- Tool calling / function calling: no disponible (no se menciona en la documentación).
- Modo thinking: no disponible (no se menciona explícitamente).

## Casos de uso

- Investigación en alineación y seguridad: al ser una versión abliterada con documentación detallada de qué capas se han modificado, es útil para estudiar cómo la abliteración selectiva afecta al comportamiento del modelo.
- Asistentes locales sin filtros para usuarios avanzados: ejecutable con Ollama (`ollama run huihui_ai/Qwen3.8-abliterated`) o llama.cpp con contexto de 262K, adecuado para chat privado on-device sin enviar datos a terceros.
- Análisis de documentos largos con imágenes: gracias a la ventana de contexto de 262.144 tokens y al módulo visual intacto, puede procesar documentos extensos con contenido gráfico en local.
- Experimentación con cuantizaciones extremas: las variantes ternarias de 2 bits y las mezclas IQ2 permiten evaluar el límite de compresión en GPUs de consumo, útil para investigadores de cuantización.
- Despliegue en hardware Apple Silicon: la compatibilidad con Metal y GGUF permite inferencia local en Macs con memoria unificada suficiente.
- Generación de contenido creativo sin restricciones de rechazo: para flujos de escritura donde los rechazos del modelo base interrumpen el flujo, aunque con las advertencias éticas y legales correspondientes.
- Pruebas de decodificación especulativa con MTP: el componente MTP sin modificar permite experimentar con generación acelerada multi-token en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor indica que las series recientes son "test/validación" y que la abliteración parcial (capas 22-52) busca "retener más del rendimiento original", pero no aporta métricas cuantitativas (MMLU, HumanEval, GSM8K, etc.) ni comparativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo pesa 799,7 GB (incluye todas las variantes). Un GGUF de 27B en Q4_K ocupa aproximadamente 15-17 GB, y en Q8_0 en torno a 28-30 GB; las variantes "_L" son mayores que sus equivalentes estándar. Las variantes ternarias de 2 bits deberían situarse por debajo de 10 GB, pero no se publica el tamaño exacto.
- GPU recomendadas: no disponible oficialmente. Por tamaño, una RTX 3090/4090 (24 GB) debería acomodar cuantizaciones de 2-4 bits; variantes Q6_K/Q8_0_L requerirían GPUs con más VRAM (A100 40 GB, A100 80 GB, H100) o Macs con memoria unificada de 48-64 GB o más.
- Consumer GPU: viable en RTX 3090/4090 con las cuantizaciones Q2_K/Q3_K/Q4_K; la variante bf16 (~55 GB) exige memoria unificada o múltiples GPUs.
- Opciones de despliegue: llama.cpp (obligatorio el fork PrismML-Eng/llama.cpp para la serie Ternary; la versión estándar sirve para el resto), Ollama (`huihui_ai/Qwen3.8-abliterated`), compatible CUDA y Metal. No se menciona vLLM ni TGI (el formato GGUF no es directamente compatible con ellos).
- Latencia y throughput: no disponible. El MTP intacto sugiere soporte para decodificación especulativa, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-GGUF | 27,3 B | 262.144 tokens | Apache 2.0 | Abliterado, multimodal, GGUF con cuantizaciones mixtas y variantes ternarias |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible | no disponible | Modelo original con mecanismos de seguridad intactos |
| unsloth/Qwen3.8-27B-GGUF | 27,3 B | no disponible | no disponible | Cuantizaciones UD estándar sin abliterar |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF | 27,3 B | no disponible | no disponible | Cuantización GSQ-RCO sin abliterar |

Nota: los datos de los modelos comparados distintos del ficha no están publicados en la informacion disponible, por lo que la comparativa se limita a los derivados citados en la model card.

## Limitaciones y advertencias

- Al ser una versión abliterada, el modelo no rechazará solicitudes que el modelo original sí rechazaría; esto conlleva riesgos éticos y legales significativos, y el propio autor incluye avisos de advertencia ("small disclaimer warning") en las series recientes.
- La abliteración es una "implementación cruda de prueba de concepto": puede degradar la calidad, la coherencia y aumentar el riesgo de alucinaciones o respuestas incoherentes.
- Las variantes Ternary no funcionan con llama.cpp estándar: requieren el fork PrismML-Eng/llama.cpp, lo que añade fricción de mantenimiento.
- Las cuantizaciones "_L" no son estándar: Q2_K_L puede ser mayor que Q3_K o Q4_K, lo que puede confundir al elegir variante.
- Algunas variantes (Underdog-Saluki) carecen de archivo imatrix, por lo que la abliteración se realizó mezclando pesos GGUF de forma experimental.
- No hay benchmarks publicados: el rendimiento real respecto al modelo base es desconocido y las series recientes se etiquetan explícitamente como test/validación.
- Idiomas soportados, datos de entrenamiento y capacidades de tool calling: no disponible.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado sin filtros recae íntegramente en el usuario desplegador.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rax4901/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio original de huihui-ai (referenciado): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- unsloth/Qwen3.8-27B-GGUF: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- prism-ml/Ternary-Bonsai-2-27B-gguf: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- ConwayResearch/Underdog-Saluki-27B-1.0: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Fork de llama.cpp con kernels ternarios: https://github.com/PrismML-Eng/llama.cpp
- llama.cpp estándar: https://github.com/ggml-org/llama.cpp
- Ollama: https://github.com/ollama/ollama y https://ollama.com/huihui_ai/Qwen3.8-abliterated
- Técnica de abliteración: https://github.com/Sumandora/remove-refusals-with-transformers
