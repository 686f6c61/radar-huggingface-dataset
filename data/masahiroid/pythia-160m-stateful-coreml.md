# masahiroid/pythia-160m-stateful-coreml

## Resumen

`pythia-160m-stateful-coreml` es una conversión no oficial a Core ML del modelo `EleutherAI/pythia-160m`, un transformer decoder de arquitectura GPT-NeoX con 12 capas y 160 millones de parámetros, desarrollado originalmente por EleutherAI como parte de su suite de investigación Pythia. La conversión la firma el usuario `masahiroid` y su aportación principal es implementar una caché KV real mediante el soporte de modelos *stateful* de Core ML (`coremltools.StateType`), en lugar del diseño sin caché que recomputa toda la secuencia en cada paso.

El interés de esta ficha es acotado pero técnico: no se trata de un modelo nuevo ni de un salto de capacidad, sino de un artefacto de despliegue para iOS y macOS. Frente a conversiones anteriores de decoders poco profundos (ASR, OCR), donde recomputar la secuencia completa era asumible, un decoder autorregresivo estándar de 12 capas hace ese enfoque ineficiente; de ahí el uso de estado persistente para mantener las claves y valores por capa y decodificar un token por paso actualizando el estado *in place*.

La relevancia ahora es práctica: permite ejecutar generación de texto con Pythia-160m de forma nativa en el ecosistema Apple (Core ML, Neural Engine/GPU) con una caché KV correcta, a costa de una ventana de contexto trazada de solo 256 tokens y precisión fp16. Es un modelo de investigación y prototipado, no un candidato para producción de alta exigencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder autorregresivo, GPT-NeoX (12 capas) |
| Parámetros totales | 160M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (trazado con `max_seq_len=256`) |
| Tipos de cuantización | float16 (fp16); el autor sugiere reconvertir a FLOAT32 para reproducibilidad estricta |
| Idiomas soportados | en, ja (según metadatos; el modelo base Pythia es principalmente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`mlpackage`); repo de 0.3 GB |
| Modelo base | `EleutherAI/pythia-160m` |
| Framework | Core ML con KV-cache stateful (`coremltools.StateType`) |
| Precisión | float16 |
| Tamaño del repo | 0.3 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es GPT-NeoX: transformer decoder con 12 capas, atención multi-cabeza y embeddings posicionales rotatorios parciales (`rotary_pct=0.25`, es decir, solo una fracción de las dimensiones recibe RoPE). La conversión reimplementa a mano los detalles específicos de GPT-NeoX —la estructura de residuo paralelo y el RoPE parcial— directamente sobre los pesos originales, sin pasar por las clases `Cache` de `transformers`. Cada capa mantiene su caché Key/Value como estado de Core ML, de modo que la decodificación avanza token a token actualizando ese estado en el sitio.

Sobre el entrenamiento, esta ficha no aporta datos propios: la información disponible remite al modelo base `EleutherAI/pythia-160m`, del que no se detallan en la model card el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable de esta conversión es precisamente el uso de `StateType` para una caché KV real en Core ML, junto con una auditoría de seguridad frente al modelo upstream mediante `model-audit-lite` (formato de pesos, código incluido y linaje legible por máquina, ML-BOM).

## Capacidades

- Generación de texto autorregresiva con decodificación codiciosa (greedy) verificada en el ejemplo de uso.
- Decodificación con caché KV persistente por capa, un token por paso, mediante estado de Core ML.
- Ejecución nativa en iOS y macOS a través de Core ML.
- Soporte de prefill alimentando el prompt token a token y actualización incremental del estado.
- Idiomas: inglés y japonés según metadatos; el modelo base Pythia está orientado principalmente al inglés.
- No se documentan tool calling, function calling, capacidades de agente, razonamiento multi-paso explícito, visión, audio ni modo *thinking*.
- No se documentan capacidades matemáticas o de código específicas más allá de las del modelo base.

## Casos de uso

- Prototipado de generación de texto en apps iOS/macOS: el modelo se integra como `mlpackage` y se invoca con `coremltools`, permitiendo validar flujos de texto en dispositivo sin backend remoto.
- Autocompletado ligero en dispositivo: con 160M parámetros y fp16, encaja en escenarios de sugerencia de texto de baja latencia donde no se requiere calidad de modelos grandes.
- Demostración técnica de caché KV stateful en Core ML: sirve como referencia para implementar decodificación incremental en otros modelos Apple, comparando el diseño con y sin estado.
- Pruebas de reproducibilidad numérica: el autor documenta la divergencia fp16 frente a PyTorch fp32, útil para equipos que evalúan tolerancias de precisión en despliegues Core ML.
- Investigación sobre Pythia en entornos Apple: permite experimentar con un modelo de la suite Pythia directamente en hardware Apple sin depender de PyTorch en tiempo de inferencia.
- Evaluación de linaje y seguridad de artefactos: la auditoría con `model-audit-lite` y el ML-BOM facilitan incorporar el modelo a pipelines que exigen trazabilidad del peso y del código.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Sí reporta métricas de fidelidad numérica de la conversión:

| Métrica | Resultado |
|---|---|
| Similitud coseno de logits (PyTorch fp32 vs Core ML fp16) | 0.999999 |
| Similitud coseno de logits (PyTorch fp16 vs Core ML fp16) | 0.9999998 |
| Coincidencia exacta de secuencia de tokens | No (la trayectoria diverge en un empate casi exacto: 841.006 vs 840.990) |

El autor aclara que la divergencia no es un fallo de la conversión: ejecutar el propio modelo PyTorch en fp16 toma la misma decisión, por lo que es una consecuencia conocida de la precisión fp16.

## Requisitos de hardware

- VRAM/almacenamiento: repo de 0.3 GB; el `mlpackage` fp16 de un modelo de 160M ocupa una fracción pequeña de esa cifra.
- Ejecución en hardware Apple: iOS y macOS mediante Core ML; puede aprovechar Neural Engine y GPU según el dispositivo.
- Cabe en hardware de consumo Apple: sí, por tamaño (160M parámetros en fp16) es apto para iPhone, iPad y Mac recientes.
- GPU NVIDIA (A100, H100, RTX 4090): no aplica directamente, ya que el artefacto es Core ML; para ejecutar el modelo base en esas GPUs habría que usar PyTorch/transformers.
- Despliegue: Core ML con `coremltools` (Python) y APIs nativas en iOS/macOS; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este artefacto.
- Latencia y throughput: no disponibles.
- Restricción operativa: al estar trazado con `max_seq_len=256`, antes de que `position` alcance 256 hay que crear un estado nuevo o usar un bucket separado para secuencias más largas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| pythia-160m-stateful-coreml | 160M | 256 | Core ML stateful, fp16 | Apache 2.0 | Conversión comunitaria con KV-cache real |
| EleutherAI/pythia-160m | 160M | no disponible en la información | PyTorch (safetensors) | Apache 2.0 | Modelo base de referencia, sin optimización Apple |
| Otras conversiones Core ML de decoders pequeños | no disponible | no disponible | Core ML | no disponible | El autor indica que las anteriores eran sin caché KV (recomputaban toda la secuencia) |

No se dispone en la información proporcionada de comparativas con modelos de tamaño equivalente fuera de la familia Pythia.

## Limitaciones y advertencias

- Ventana de contexto muy corta: 256 tokens trazados; requiere gestionar el reinicio de estado más allá de esa posición.
- Precisión fp16: la secuencia de tokens no coincide exactamente con la referencia PyTorch fp32; en empates cercanos el argmax puede cambiar. Para reproducibilidad estricta hay que reconvertir a FLOAT32.
- Solo fp16: esta release no incluye una versión fp32.
- Modelo base de 160M: calidad de generación limitada y mayor propensión a incoherencias y alucinaciones en comparación con modelos grandes.
- Idiomas: aunque los metadatos declaran inglés y japonés, Pythia está orientado principalmente al inglés; el rendimiento en japonés no está documentado.
- No es una release oficial de EleutherAI: es una conversión comunitaria, sin garantías de mantenimiento.
- Sesgos: no se documentan sesgos específicos en la información disponible; al heredarse del modelo base, aplican los del corpus de entrenamiento de Pythia, no detallado aquí.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias de Core ML.
- Uso en producción: no recomendado para cargas de alta exigencia por contexto corto, precisión fp16 y ausencia de benchmarks de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/pythia-160m-stateful-coreml
- Modelo base: https://huggingface.co/EleutherAI/pythia-160m
- README en japonés: README.ja.md (en el repositorio del modelo)
- Auditoría de seguridad: SECURITY.md (en el repositorio del modelo)
- Herramienta de auditoría: https://github.com/masahiroid/model-audit-lite
