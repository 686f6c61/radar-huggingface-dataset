# rshoemake/taq-qwen32b-coder-outlier-4bit

## Resumen

El modelo `rshoemake/taq-qwen32b-coder-outlier-4bit` es una cuantización de 4 bits del modelo base `Qwen/Qwen2.5-Coder-32B-Instruct`, generada mediante el pipeline de cuantización Tail-Aware Quantization (TAQ) del proyecto `fractal_quant_decision`. El autor, rshoemake, aplica una acción uniforme de tipo "outlier" a todas las capas elegibles, con un presupuesto de ~4 bits por peso, y publica los pesos reales empaquetados en un formato binario personalizado, no un scaffold dequantizado. El objetivo es reducir el tamaño del modelo manteniendo la fidelidad respecto a la versión fp16, medida mediante perplexity (PPL) en WikiText-2 y calidad de generación de código en HumanEval+ y MBPP+.

El modelo tiene 32.763.876.352 parámetros (32,76B) y se distribuye bajo licencia Apache-2.0. El repositorio ocupa 65,5 GB e incluye los archivos empaquetados por capa (`packed/*.bin`), un manifiesto con las acciones y bits por capa, archivos `fp16_passthrough` para capas que no se cuantizaron y scripts de desempaquetado. Es relevante porque propone un enfoque de cuantización alternativo a los métodos estándar (bitsandbytes, GGUF) y publica resultados comparativos detallados, lo que permite evaluar su rendimiento real en tareas de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen2.5-Coder-32B-Instruct) |
| Parametros totales | 32.763.876.352 (32,76B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | 4-bit (bpw medido: 4,7594), formato TAQ "outlier" uniforme |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato personalizado: `packed/*.bin` (header + codebooks fp16 + indices bit-packed + canal lateral de outliers) + `fp16_passthrough/*.safetensors` para capas sin cuantizar |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado desde cero; es una cuantización del checkpoint `Qwen/Qwen2.5-Coder-32B-Instruct` en fp16, empaquetado directamente desde los shards safetensors originales. El proceso utiliza TAQ, que asigna una acción de cuantización por capa según la cola de la distribución de pesos. En este checkpoint se aplica una acción uniforme "outlier" a todas las capas elegibles, con un presupuesto de ~4 bits. El formato de almacenamiento incluye codebooks en fp16, índices empaquetados a nivel de bit y un canal lateral para outliers, lo que permite reconstruir los pesos sin recurrir a una descompresión completa a fp16. No se menciona el uso de RLHF, DPO ni ajuste fino adicional; el modelo conserva las capacidades del modelo base original.

## Capacidades

- Generación de código en múltiples lenguajes, heredada del modelo base Qwen2.5-Coder-32B-Instruct.
- Seguimiento de instrucciones y diálogo, al ser una variante "Instruct".
- Razonamiento y resolución de problemas matemáticos y lógicos, según las capacidades del modelo base.
- Soporte de tool calling y function calling, si el modelo base lo implementa (no confirmado explícitamente en la documentación proporcionada).
- Capacidades multilingües, aunque no se especifican los idiomas concretos en la ficha.
- No se indica soporte de visión, audio u otras modalidades.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en pipelines de desarrollo para autocompletar funciones, generar tests o refactorizar código. Su cuantización de 4 bits reduce el uso de VRAM, permitiendo su ejecución en GPUs de gama media.
- Asistente de programación local: al ser un modelo de instrucciones cuantizado, puede desplegarse en entornos con recursos limitados para responder preguntas técnicas y explicar fragmentos de código.
- Evaluación de técnicas de cuantización: investigadores pueden usar este checkpoint como referencia para comparar el rendimiento de TAQ frente a otros métodos (bnb-4bit, GGUF) en tareas de código.
- Desarrollo de herramientas de autocompletado en IDE: su baja huella de memoria permite integrarlo en editores que requieren respuestas de baja latencia.
- Análisis de código estático: puede utilizarse para detectar errores comunes o sugerir mejoras en repositorios grandes, aprovechando el contexto largo del modelo base (si se confirma).
- Prototipado rápido de aplicaciones de IA generativa: al ser Apache-2.0, puede usarse en proyectos comerciales sin restricciones de licencia.

## Benchmarks y rendimiento

La model card proporciona resultados de fidelidad (PPL en WikiText-2) y de generación de código (HumanEval+ / MBPP+). Los datos se presentan a continuación.

**Fidelidad (WikiText-2, menor es mejor)**

| Checkpoint | bpw | PPL | KLD vs fp16 |
|---|---:|---:|---:|
| `outlier_4bit` (este checkpoint) | 4,7594 | 12,393 | 0,0280 |
| `rotation_outlier_4bit` | 4,7784 | 12,477 | 0,0363 |
| `mixed_allocator_4bit` | 4,7577 | 12,263 | 0,0287 |
| fp16 (referencia) | 16 | 11,9266 | 0 |

**Generación de código (pass@1, greedy)**

| Checkpoint | HumanEval Base | HumanEval Base+Extra | MBPP Base | MBPP Base+Extra |
|---|---:|---:|---:|---:|
| `outlier_4bit` (este checkpoint) | 0,8780 | 0,8293 | 0,8571 | 0,7193 |
| `rotation_outlier_4bit` | 0,9024 | 0,8537 | 0,8521 | 0,7168 |
| fp16 (referencia) | 0,9024 | 0,8598 | 0,8647 | 0,7268 |
| Unsloth bnb-4bit (~6,1 bpw) | 0,9024 | 0,8720 | 0,8596 | 0,7293 |
| GGUF Q4_K_M (Unsloth, ~4,85 bpw) | 0,8902 | 0,8293 | 0,8546 | 0,7293 |

Respecto al fp16, el checkpoint `outlier_4bit` presenta una pérdida de -0,0305 en HumanEval Base+Extra y -0,0075 en MBPP Base+Extra (deltas pass@1).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16-17 GB para los pesos cuantizados a 4 bits (32,76B × 4 bits ≈ 16,38 GB), más overhead de activaciones y codebooks. El tamaño real del repositorio (65,5 GB) incluye archivos empaquetados y passthrough, pero para cargar el modelo en memoria se necesitan los pesos reconstruidos.
- GPU recomendadas: GPUs con 24 GB de VRAM (RTX 3090, RTX 4090) para inferencia cómoda; GPUs de 16 GB (RTX 4080, A100 40GB) podrían funcionar con optimizaciones de memoria.
- Compatibilidad con consumer GPU: sí, en GPUs con al menos 16 GB de VRAM, aunque el formato personalizado puede requerir el desempaquetado previo.
- Opciones de despliegue: el formato no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Se requiere el script `unpack_outlier.py` para reconstruir los pesos a un formato estándar (safetensors) antes de usar frameworks convencionales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La comparativa se centra en el mismo modelo base cuantizado con diferentes métodos.

| Modelo | Parámetros | Contexto | bpw | HumanEval+ (Base+Extra) | MBPP+ (Base+Extra) | Licencia |
|---|---:|---:|---:|---:|---:|---:|
| `outlier_4bit` (TAQ) | 32,76B | no disponible | 4,76 | 0,8293 | 0,7193 | Apache-2.0 |
| `rotation_outlier_4bit` (TAQ) | 32,76B | no disponible | 4,78 | 0,8537 | 0,7168 | Apache-2.0 |
| fp16 (referencia) | 32,76B | no disponible | 16 | 0,8598 | 0,7268 | Apache-2.0 |
| Unsloth bnb-4bit | 32,76B | no disponible | ~6,1 | 0,8720 | 0,7293 | Apache-2.0 |
| GGUF Q4_K_M (Unsloth) | 32,76B | no disponible | ~4,85 | 0,8293 | 0,7293 | Apache-2.0 |

El checkpoint `outlier_4bit` muestra un rendimiento ligeramente inferior al fp16 y al bnb-4bit en HumanEval+, pero comparable en MBPP+. Su ventaja principal es el menor bpw (4,76 frente a 6,1 del bnb-4bit) con una pérdida de calidad acotada.

## Limitaciones y advertencias

- El formato de pesos es propietario y no está soportado por los frameworks de inferencia estándar; es necesario ejecutar el script de desempaquetado antes de usar el modelo con herramientas como vLLM o llama.cpp.
- La cuantización introduce una pérdida de calidad medible (KLD 0,0280 frente a fp16), que puede afectar a tareas de alta precisión.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma; al ser una variante del modelo base, hereda sus posibles sesgos y riesgos.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el funcionamiento en producción.
- El repositorio tiene solo 7 descargas y 0 likes, lo que sugiere una adopción limitada y poca validación externa.
- No se especifica la longitud de contexto efectiva tras la cuantización; se asume que es la del modelo base, pero no está confirmada.

## Enlaces

- Repositorio del modelo: https://huggingface.co/rshoemake/taq-qwen32b-coder-outlier-4bit
- Repositorio de referencia con formato documentado: https://huggingface.co/rshoemake/taq-qwen14b-unsloth-matched
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
