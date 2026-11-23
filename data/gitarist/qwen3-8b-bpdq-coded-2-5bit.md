# gitarist/Qwen3-8B-BPDQ-coded-2.5bit

## Resumen

Qwen3-8B-BPDQ-coded-2.5bit es una versión cuantizada a 2,5 bits por peso de los pesos lineales del modelo Qwen3-8B de Alibaba Qwen, publicada por el usuario gitarist en Hugging Face. La cuantización emplea una técnica propia denominada BPDQ (bit-plane decomposition quantization), que descompone cada peso lineal en tres planos de bits y codifica los dos planos inferiores por bloques de ocho pesos mediante códigos de paridad y el código de Reed-Muller RM(1,3). El resultado son 18 bits por cada ocho pesos, más coeficientes fp16 cada 256 columnas.

El modelo base es un transformer denso de la familia Qwen3, con aproximadamente 8.200 millones de parámetros en su forma original. El repositorio cuantizado ocupa 6,9 GB y contiene 2.304.134.400 parámetros en safetensors, lo que refleja la compresión agresiva de los pesos lineales. La licencia es Apache 2.0, heredada del modelo base, y el pipeline declarado es text-generation con soporte para conversación.

Su relevancia radica en que demuestra que es posible reducir un modelo de 8B a 2,5 bits por peso manteniendo un promedio del 74,5 % en una batería de 12 tareas, frente al 80,6 % del modelo fp16, con un throughput de decodificación de hasta 7.700 tokens por segundo en una única RTX 4090 con vLLM. Es una pieza interesante para investigación en cuantización extrema y para despliegues con restricciones severas de memoria, aunque con degradaciones notables en tareas de conocimiento factual y generación de código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), pesos lineales en 2,5 bits con codificación BPDQ |
| Parámetros totales | 2.304.134.400 (safetensors del repo cuantizado); modelo base Qwen3-8B de ~8B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del Qwen3-8B base) |
| Tipos de cuantización | BPDQ a 2,5 bits/peso en lineales; embedding a 4 bits; head a 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere el paquete `bpdq` para vLLM o transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso con atención estándar y mecanismos de razonamiento tipo thinking. Sobre él se aplica la receta BPDQ: cada peso lineal se representa con tres planos de bits. El primer plano se almacena tal cual; el segundo se codifica como palabra de código de peso par (7 bits); el tercero se codifica como uno de los ocho codewords del código Reed-Muller RM(1,3) (3 bits). Esto da 18 bits por cada ocho pesos, y con coeficientes fp16 cada 256 columnas el total es de 2,5 bits por peso.

El proceso de entrenamiento consistió en una codificación block-Babai inicial, seguida de 3.056 pasos de destilación con QAT (quantization-aware training) y 250 pasos adicionales de GRPO (Group Relative Policy Optimization). La decodificación requiere CUDA con capacidad de cómputo sm80 o superior, y se integra con vLLM registrando el método de cuantización `bpdq`.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas de Qwen3-8B.
- Razonamiento con modo thinking (los benchmarks GSM8K distinguen entre nothink y think @1024).
- Generación de código (HumanEval, MBPP) con degradación respecto a fp16.
- Matemáticas y razonamiento aritmético (GSM8K).
- Tool calling y function calling, evaluado con BFCL en escenarios simple, multiple, parallel, parallel-multiple, irrelevance y multi-turn.
- Seguimiento de instrucciones (IFEval).
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión ni audio en la información disponible.

## Casos de uso

- Investigación en cuantización extrema: el modelo sirve como referencia reproducible para estudiar el impacto de 2,5 bits/peso en distintas tareas, con métricas KL frente a fp16 y batería de benchmarks publicada.
- Despliegue con memoria muy limitada: al ocupar 3,1 GB en disco y permitir vLLM con un solo GPU, encaja en entornos donde no cabe un 8B en fp16 ni en cuantizaciones de 4 bits.
- Servicio de alto throughput: con 7.700 tok/s a batch 256 en una RTX 4090, es adecuado para pipelines de generación masiva donde la latencia por token no es crítica pero el volumen sí.
- Asistentes conversacionales con tool calling: mantiene BFCL simple en 93,8 frente a 94,5 de fp16, por lo que puede usarse en agentes que invocan funciones con esquemas bien definidos.
- Experimentación con decodificación especulativa o destilación: su naturaleza cuantizada y su receta QAT + GRPO lo hacen útil como alumno o como objetivo de comparación.
- Prototipado en estaciones de trabajo con una sola GPU consumer: permite probar flujos de Qwen3-8B sin necesidad de A100/H100, aceptando la pérdida de calidad en conocimiento factual.
- Evaluación de robustez de agentes multi-turno: los resultados BFCL multi-turn (31,0 frente a 45,0) permiten estudiar cómo la cuantización afecta al razonamiento encadenado.

## Benchmarks y rendimiento

| Métrica | fp16 | Este modelo |
|---|---|---|
| bits/peso (lineales) | 16 | 2,5 |
| KL a fp16, WikiText-2 | 0 | 0,254 |
| GSM8K nothink | 91,7 | 84,2 |
| GSM8K think @1024 | 83,0 | 87,6 |
| HumanEval | 82,9 | 71,3 |
| MBPP | 66,6 | 57,6 |
| IFEval (prompt strict) | 81,7 | 76,3 |
| TriviaQA 5-shot | 56,7 | 37,3 |
| BFCL simple | 94,5 | 93,8 |
| BFCL multiple | 96,5 | 93,0 |
| BFCL parallel | 94,0 | 93,5 |
| BFCL parallel-multiple | 91,0 | 87,0 |
| BFCL irrelevance | 83,8 | 81,7 |
| BFCL multi-turn | 45,0 | 31,0 |
| Promedio 12 tareas | 80,6 | 74,5 |

Throughput de decodificación con vLLM 0.28 en una RTX 4090: 260 tok/s a batch 1, 970 a batch 4, 3.280 a batch 16, 5.040 a batch 32, 6.560 a batch 64 y 7.700 a batch 256.

## Requisitos de hardware

- VRAM estimada: el repo pesa 6,9 GB y el autor indica 3,1 GB en disco para los pesos; en inferencia con vLLM y dtype float16 hay que sumar caché KV y overhead del runtime, por lo que se recomienda al menos 8-12 GB de VRAM según longitud de contexto y batch.
- GPU recomendadas: RTX 4090 (mediciones oficiales), A100, H100 y cualquier GPU con sm80 o superior.
- Cabe en GPU consumer: sí, en RTX 3090, 4090 y tarjetas con 12 GB o más; en 8 GB puede requerir batch pequeño y contexto corto.
- Opciones de despliegue: vLLM 0.28 o superior con el paquete `bpdq` registrando la cuantización; transformers mediante `bpdq.load(MODEL_DIR)`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 260 tok/s a batch 1 y 7.700 tok/s a batch 256 en una RTX 4090 con vLLM 0.28.
- Requisito de plataforma: solo CUDA, sm80 o superior.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B (fp16) | ~8B | no disponible | 16 bits | Apache 2.0 | Hugging Face |
| Qwen3-8B-BPDQ-coded-2.5bit | 2,30B en safetensors (base ~8B) | no disponible | 2,5 bits lineales | Apache 2.0 | Hugging Face |
| Alternativas de 4 bits (GPTQ/AWQ) de Qwen3-8B | ~8B | no disponible | 4 bits | Apache 2.0 | Hugging Face |

La comparación cuantitativa directa con otras cuantizaciones de Qwen3-8B no está disponible en la información proporcionada. Frente al modelo fp16, la pérdida media es de 6,1 puntos en la batería de 12 tareas, con caídas especialmente marcadas en TriviaQA (-19,4), HumanEval (-11,6) y BFCL multi-turn (-14,0), y una mejora en GSM8K think @1024 (+4,6).

## Limitaciones y advertencias

- Degradación severa en conocimiento factual: TriviaQA 5-shot cae de 56,7 a 37,3, lo que desaconseja su uso en tareas de recuperación de hechos sin verificación externa.
- Pérdida notable en generación de código: HumanEval baja 11,6 puntos y MBPP 9,0, por lo que no es recomendable para producción de código sin revisión.
- Razonamiento multi-turno de agentes muy degradado: BFCL multi-turn cae de 45,0 a 31,0.
- Riesgo de alucinación incrementado por la cuantización extrema y por la caída en conocimiento factual.
- Solo funciona en CUDA sm80 o superior; no hay soporte documentado para CPU, Metal ni ROCm.
- Requiere el paquete `bpdq` y una versión concreta de vLLM (0.28 en las mediciones); la compatibilidad con otras versiones no está garantizada.
- Idiomas soportados no documentados; se heredan del Qwen3-8B base pero no se han evaluado tras la cuantización.
- Longitud de contexto no especificada en la información disponible; debe asumirse la del modelo base, sin garantías de calidad tras la compresión.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo cuantizado.
- El número de parámetros del safetensors (2,30B) no coincide con el del modelo base (~8B) por la representación comprimida; hay que tenerlo en cuenta al estimar memoria y al integrarlo en herramientas que infieran el tamaño por el checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gitarist/Qwen3-8B-BPDQ-coded-2.5bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- No se han encontrado en la información proporcionada papers, blogs, repositorios del paquete `bpdq` ni demos adicionales.
