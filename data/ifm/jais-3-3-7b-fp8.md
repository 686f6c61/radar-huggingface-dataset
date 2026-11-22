# IFM/Jais-3-3.7B-FP8

## Resumen

Jais-3-3.7B-FP8 es la versión cuantizada a FP8 del modelo Jais-3-3.7B, el miembro denso y compacto de la familia Jais-3 desarrollada por IFM (Inception42). Se trata de un modelo decoder-only de clase 3.7B parámetros con una ventana de contexto de 512K tokens, diseñado para generación de texto conversacional en árabe e inglés. El repositorio contiene únicamente los pesos cuantizados; el modelo base en BF16 es `inception42/Jais-3-3.7B`.

La relevancia de esta variante FP8 radica en que reduce la huella de memoria y habilita inferencia más rápida en hardware con soporte FP8, manteniendo un rendimiento cercano al modelo original en BF16 según las evaluaciones del autor. Esto lo hace atractivo para despliegues en producción donde el coste de VRAM y la latencia son críticos, especialmente para aplicaciones centradas en árabe.

La cuantización aplica FP8 a todas las capas lineales excepto `lm_head`, con pesos estáticos (una escala por bloque de 128×128) y activaciones dinámicas (una escala por grupo de 1×128 a lo largo de la dimensión de canales de entrada). El modelo se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 5.058.255.360 (según safetensors); clase 3.7B según el autor |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512K tokens |
| Tipos de cuantizacion | FP8 (pesos estáticos, escala por bloque 128×128; activaciones dinámicas, escala por grupo 1×128); también disponible GGUF y MLX 4/8-bit/bf16 |
| Idiomas soportados | Árabe (ar), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

Jais-3-3.7B es un transformer decoder-only denso de la familia Jais-3. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible en la documentación proporcionada. La innovación técnica destacable en esta variante es el esquema de cuantización FP8: pesos estáticos con una escala por bloque de 128×128 y activaciones dinámicas con una escala por grupo de 1×128 en la dimensión de canales de entrada, excluyendo `lm_head` de la cuantización.

El modelo base se distribuye en múltiples formatos dentro de la colección IFM/Jais-3, incluyendo GGUF para llama.cpp y Ollama, y variantes MLX (4-bit, 8-bit y bf16) para Apple Silicon. El tag `k2_horizon` y `custom_code` sugieren la existencia de código de modelado personalizado que requiere `trust_remote_code` en transformers.

## Capacidades

- Generación de texto conversacional multi-turno en árabe e inglés.
- Ventana de contexto de 512K tokens, adecuada para documentos largos y conversaciones extensas.
- Razonamiento y generación de texto general (pipeline `text-generation`).
- Soporte bilingüe árabe-inglés.
- Inferencia acelerada en hardware con soporte FP8.
- No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Atención al cliente en árabe: el modelo puede gestionar conversaciones multi-turno con contexto muy largo gracias a sus 512K tokens de ventana, manteniendo el hilo de interacciones previas sin truncar el historial.
- Procesamiento de documentos legales o administrativos en árabe: la ventana de 512K permite ingerir contratos o expedientes completos y responder preguntas sobre ellos en una sola pasada.
- Resumen de corpus largos: artículos, informes o transcripciones extensas pueden resumirse sin fragmentación gracias al contexto extendido.
- Asistentes bilingües árabe-inglés: útil en entornos corporativos donde se alterna entre ambos idiomas, con un único modelo que cubre las dos lenguas.
- Despliegue en producción con restricciones de VRAM: la cuantización FP8 reduce la huella de memoria y permite servir el modelo en GPUs con soporte FP8, con rendimiento cercano al BF16.
- Prototipado e investigación sobre modelos árabes: al ser open-weights y Apache 2.0, sirve como base para fine-tuning y experimentación académica en PLN árabe.
- Inferencia en Apple Silicon: mediante las variantes MLX (4-bit/8-bit) del mismo modelo base, para desarrollo local en equipos Mac.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa, pero los valores numéricos por tarea no están disponibles en la información extraída (solo se dispone de las filas de parámetros, parámetros activos y arquitectura). Los modelos de referencia comparados son Qwen3.5-4B, Gemma 4 E2B, granite-4.0-h-3b-ar y Falcon-H1-3B-Instruct. El autor afirma que el modelo FP8 rinde de forma cercana al BF16 original en sus evaluaciones, pero no se proporcionan cifras concretas.

| Modelo | Parámetros | Parámetros activos | Arquitectura |
|---|---|---|---|
| Jais-3-3.7B | 3.7B | 3.7B | Dense |
| Qwen3.5-4B | 4B | 4B | Dense |
| Gemma 4 E2B | 5B | 2.3B | Dense |
| granite-4.0-h-3b-ar | 3B | 3B | No disponible |
| Falcon-H1-3B-Instruct | 3B | 3B | No disponible |

No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 6.4 GB en FP8; en la práctica se requiere algo más para el estado de activaciones y KV cache, especialmente con contexto largo. Con 512K tokens de contexto, la KV cache puede crecer de forma significativa y condicionar la VRAM total.
- GPU recomendadas: GPUs con soporte nativo FP8 (H100, H200, L40S, A100 con kernels compatibles) para aprovechar la aceleración; también puede ejecutarse en GPUs sin FP8 mediante emulación, con menor ventaja.
- Consumer GPU: el modelo en FP8 podría caber en GPUs de 8-12 GB para contextos cortos, pero el contexto de 512K hace inviable mantener ventanas completas en VRAM consumer; las variantes GGUF y MLX facilitan el despliegue local.
- Opciones de despliegue: transformers (con `trust_remote_code`), llama.cpp y Ollama vía la variante GGUF, MLX en Apple Silicon, y potencialmente vLLM/TGI si soportan el formato compressed-tensors FP8 (no confirmado en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Jais-3-3.7B-FP8 | 3.7B (5.06B en safetensors) | 512K | Apache 2.0 | ar, en | HF (FP8, GGUF, MLX) |
| Qwen3.5-4B | 4B | No disponible | No disponible | No disponible | No disponible |
| Gemma 4 E2B | 5B (2.3B activos) | No disponible | No disponible | No disponible | No disponible |
| granite-4.0-h-3b-ar | 3B | No disponible | No disponible | No disponible | No disponible |
| Falcon-H1-3B-Instruct | 3B | No disponible | No disponible | No disponible | No disponible |

Los datos de contexto, licencia y rendimiento de los modelos de referencia no están disponibles en la información proporcionada. La ventaja diferencial de Jais-3-3.7B es su contexto de 512K y su enfoque bilingüe árabe-inglés.

## Limitaciones y advertencias

- Sesgos: no documentados en la información disponible; un modelo entrenado principalmente en árabe e inglés puede presentar sesgos culturales y lingüísticos propios de esos corpus.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Idiomas: solo se declaran árabe e inglés; el rendimiento en otras lenguas no está garantizado.
- Contexto: aunque la ventana es de 512K tokens, el rendimiento efectivo en ventanas muy largas no está validado con datos públicos, y la KV cache puede limitar el despliegue práctico.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de posibles dependencias de código personalizado (`custom_code`).
- Producción: el modelo requiere `trust_remote_code` por el código personalizado; auditar dicho código antes de desplegar. La cuantización FP8 puede introducir degradaciones menores frente al BF16, aunque el autor indica que son mínimas.
- Datos de benchmarks: no se han publicado cifras numéricas verificables en la información disponible, lo que dificulta una evaluación objetiva previa al despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IFM/Jais-3-3.7B-FP8
- Modelo base: https://huggingface.co/inception42/Jais-3-3.7B
- Colección Jais-3: https://huggingface.co/collections/IFM/jais-3-6abba9df4f1173ec7ce2929d
- Variante GGUF: https://huggingface.co/IFM/Jais-3-3.7B-GGUF
- Variante MLX 4-bit: https://huggingface.co/IFM/Jais-3-3.7B-MLX-4bit
- Variante MLX 8-bit: https://huggingface.co/IFM/Jais-3-3.7B-MLX-8bit
- Variante MLX bf16: https://huggingface.co/IFM/Jais-3-3.7B-MLX-bf16
- Paper referenciado (arXiv): 2611.10224
