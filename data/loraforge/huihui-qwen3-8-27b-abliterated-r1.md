# loraforge/huihui-qwen3.8-27b-abliterated-r1

## Resumen

Huihui Qwen3.8 27B — LoRAForge rank 1 es un adaptador LoRA de investigación publicado por el usuario loraforge sobre el checkpoint abliterado `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que a su vez deriva del modelo base `Qwen/Qwen3.8-27B`. No es un modelo entrenado desde cero ni un ajuste fino convencional: es una reconstrucción comprimida del delta de pesos que separa el checkpoint abliterado del base original, capturada en un adaptador de rango 1 de apenas 4,751 MB. El propósito declarado es auditar y reproducir de forma verificable la diferencia entre ambos checkpoints, no ofrecer una mejora de capacidades.

El adaptador se genera mediante una técnica de compresión post-hoc denominada LoRAForge, que descompone la diferencia densa de pesos en factores de bajo rango usando FlashTSQR con eigendescomposición de torch. Solo 70 de las 1199 matrices indexadas presentan cambios numéricos, concentradas en las proyecciones de salida de atención y en las down projections del MLP de las capas 17 a 51 (índices base 0). El resto de tensores —embeddings, cabeza de salida, normalizaciones, parámetros visuales y MTP— permanecen idénticos al modelo base.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de compresión de deltas de pesos con validación criptográfica y numérica; por otro, advierte de que se trata de una *research preview* sin benchmarks de capacidad, sin garantías de rendimiento y con un alcance de validación limitado a seis prompts benignos con decodificación greedy. El tamaño del repositorio es de 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.8; rango 1 por matriz, escalado 1 |
| Parámetros totales | No disponible (el adaptador almacena factores FP32 de 4,751 MB; el modelo base Qwen3.8-27B tiene 27B según su denominación) |
| Parámetros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible para el adaptador; el modelo fuente dispone de variantes GGUF GSQ, Swift, UD y Ternary en el repo solicitado, no reconstruidas por este paquete |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (factores FP32, sin padding de rango); librería PEFT |

## Arquitectura y entrenamiento

El adaptador no se entrena: se extrae. El procedimiento documentado parte del checkpoint base `Qwen/Qwen3.8-27B` (revisión `37561816e66b5b9153b1b64c10968c18c1e6f4a0`) y del checkpoint editado `huihui-ai/Huihui-Qwen3.8-27B-abliterated` (revisión `739e3c5b89849f6c238ce1e5b70008612ae42cdd`). Para cada una de las 1199 matrices indexadas se emparejan tensores por nombre y forma exactos; 70 matrices difieren y 1129 permanecen numéricamente idénticas. Las diferencias se calculan tras conversión a FP64, se construye un rango gaussiano de 16 columnas con 3 iteraciones de subespacio y se valida con SVD completa independiente en dos matrices de salida de atención. La compresión final emplea `loraforge.compression.truncate_lora` con FlashTSQR y eigendescomposición de torch para retener rango 1.

La selección de rango sigue un criterio explícito: escoger el candidato más pequeño con al menos 99% de energía ponderada y 95% de energía mínima por matriz individual, con fallback a rango 8 si ningún candidato cumple. El rango 1 captura 99,326416% de energía ponderada y 99,233495% de energía mínima individual; el rango 8 sube solo hasta 99,365319% y 99,277680%. Los pesos se exportan con `save_peft_adapter` nativo en CPU y se verifica que cada factor queda exactamente igual al artefacto validado en GPU. La comparación con `NousResearch/Arete-27B` sobre las mismas 70 matrices arroja 99,326416% de energía ponderada para Huihui frente a un intervalo de 1,0907%–1,3655% para Arete.

## Capacidades

- Generación de texto y conversación: el adaptador se aplica sobre un modelo de la familia Qwen3.8 con pipeline `text-generation` y etiqueta `conversational`.
- Herencia de capacidades del base: al ser un delta de rango 1 sobre 70 matrices, conserva las capacidades del checkpoint `Qwen/Qwen3.8-27B` subyacente, aunque no se documentan explícitamente en la model card.
- Abliteración: reproduce el efecto del checkpoint `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, orientado a eliminar direcciones de rechazo en el espacio de activaciones.
- Carga multimodal potencial: el ejemplo de carga usa `AutoModelForImageTextToText`, lo que sugiere soporte de entrada imagen-texto en el base, si bien los parámetros visuales no se modifican en el adaptador.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: el script de validación desactiva explícitamente el modo thinking, lo que implica que el base lo soporta, pero el adaptador no aporta cambios en ese aspecto.

## Casos de uso

- Auditoría de deltas de pesos: el adaptador permite reproducir y verificar la diferencia exacta entre un checkpoint abliterado y su base, con informes por matriz en `extraction_report.json` y comprobaciones SHA256 de los payloads fuente. Es adecuado porque el paquete incluye validación criptográfica y numérica reproducible.
- Investigación sobre compresión de bajo rango: sirve como caso de estudio de cuánta energía de un delta denso se captura con rango 1 frente a rango 2, 4 y 8, con cifras concretas (99,326416% frente a 99,365319%). Útil para quienes diseñan técnicas de compresión post-hoc.
- Reproducción de experimentos de abliteración: al cargar el adaptador sobre el base fijado por revisión, se puede comparar el comportamiento del modelo editado frente al original en entornos controlados, sin necesidad de descargar el checkpoint completo.
- Validación de pipelines PEFT: el paquete documenta el ciclo `load_peft_adapter`/`save_peft_adapter` nativo con verificación de escalado unitario, lo que lo convierte en un banco de pruebas para integraciones de PEFT en producción.
- Estudio de correspondencia con cuantizaciones GGUF: la model card audita ocho muestras de payload del fichero `Huihui-Qwen3.8-27B-abliterated-bf16.gguf` contra el safetensors fuente, útil para quienes investigan la fidelidad de conversiones a GGUF.
- Docencia y formación técnica: como ejemplo didáctico de extracción de deltas, selección de rango por criterio de energía y validación con SVD independiente, sin requerir entrenamiento.
- Comparación controlada de métodos: la comparación con `NousResearch/Arete-27B` sobre las mismas 70 matrices permite estudiar diferencias de energía entre recetas de ajuste sobre una base idéntica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única validación de generación es un *smoke test* de seis prompts benignos con decodificación greedy, thinking desactivado y un máximo de 96 tokens nuevos, en el que 5 de 6 textos resultaron idénticos al checkpoint editado completo. La model card advierte explícitamente que no es una prueba de capacidad, de rechazo, multimodal ni de MTP.

| Métrica de compresión | Rango 1 | Rango 2 | Rango 4 | Rango 8 |
|---|---:|---:|---:|---:|
| Energía ponderada capturada | 99,326416% | 99,338854% | 99,349575% | 99,365319% |
| Energía mínima por matriz | 99,233495% | 99,247828% | 99,259860% | 99,277680% |

| Comparación same-base (70 módulos) | Energía ponderada rango 1 |
|---|---:|
| Huihui (este adaptador) | 99,326416% |
| NousResearch/Arete-27B | 1,0907%–1,3655% |

## Requisitos de hardware

- VRAM para el adaptador solo: despreciable; el artefacto pesa 4,751 MB en FP32.
- VRAM para el modelo base: la model card indica que el base BF16 solo necesita aproximadamente 54 GB más memoria de runtime; la validación se ejecutó en una NVIDIA H100 NVL de 94 GB.
- GPU recomendadas: H100 NVL (usada en la validación), A100 80 GB y H100 80 GB son suficientes para BF16 sin cuantizar; en consumer GPU no cabe en BF16 y requeriría cuantización del base, no documentada para este adaptador.
- Despliegue: el paquete es PEFT, no un fichero GGUF LoRA; se carga con Transformers y PEFT (`PeftModel.from_pretrained`) sobre el base fijado por revisión. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI para este adaptador concreto.
- Latencia y throughput: no disponible; la model card aclara que no es un benchmark de aceleración de inferencia.
- Entorno validado: Transformers 5.22.1, PEFT 0.21.2, PyTorch 2.11.0+cu130.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loraforge/huihui-qwen3.8-27b-abliterated-r1 | Adaptador LoRA rango 1 sobre Qwen3.8-27B | Base 27B; adaptador 4,751 MB | No disponible | Apache 2.0 | Hugging Face, 0 descargas |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | Checkpoint completo abliterado | 27B | No disponible | No disponible en la información | Hugging Face (fuente citada) |
| Qwen/Qwen3.8-27B | Modelo base | 27B | No disponible | No disponible en la información | Hugging Face (base fijado por revisión) |
| NousResearch/Arete-27B | Ajuste sobre la misma base Qwen | 27B | No disponible | No disponible en la información | Hugging Face (revisión `108f0afbdcfaa1ceeda4a635004304dfff6d4da2`) |

La comparación relevante no es de rendimiento sino de naturaleza del artefacto: este paquete es un delta comprimido, no un modelo completo. Frente a `Arete-27B`, sobre las mismas 70 matrices, captura 99,326416% de energía ponderada frente al intervalo 1,0907%–1,3655% de Arete, si bien cada modelo usa su propio denominador de energía y la model card aclara que esto no aísla la contribución causal del método de entrenamiento frente a efectos de redondeo u optimizador.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el base `Qwen/Qwen3.8-27B` en la revisión exacta `37561816e66b5b9153b1b64c10968c18c1e6f4a0`; otras revisiones pueden invalidar la correspondencia de tensores.
- La energía de pesos capturada no es garantía de rendimiento ni prueba de la receta de entrenamiento original, según advierte la propia model card.
- Validación de generación muy limitada: seis prompts benignos, greedy, thinking desactivado, máximo 96 tokens; algunas respuestas largas pueden truncarse. No se evaluaron capacidad, rechazo, multimodal ni MTP.
- No se probaron otras cuantizaciones, la ejecución GGUF ni la decodificación especulativa MTP.
- La correspondencia con el fichero `Huihui-Qwen3.8-27B-abliterated-bf16.gguf` es una auditoría parcial de ocho muestras de payload, no una prueba de igualdad del fichero completo.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas; al heredar el comportamiento del base y del checkpoint abliterado, estos riesgos deben evaluarse sobre el modelo completo.
- La abliteración elimina direcciones de rechazo, lo que puede reducir salvaguardas del modelo base; debe considerarse antes de cualquier despliegue en producción orientado a usuarios finales.
- Licencia Apache 2.0 declarada para el adaptador, pero el uso comercial del conjunto depende también de las condiciones del modelo base y del checkpoint fuente, no detalladas en la información disponible.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación independiente por terceros.
- El tamaño del repositorio reportado es 0,0 GB frente a los 4,751 MB declarados del adaptador; conviene verificar los ficheros reales antes de integrarlo en un pipeline.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/loraforge/huihui-qwen3.8-27b-abliterated-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint fuente abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Repositorio GGUF solicitado: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo de comparación: https://huggingface.co/NousResearch/Arete-27B
- Paper de referencia citado en tags: arXiv:2611.01256 (no verificado en la información disponible)
