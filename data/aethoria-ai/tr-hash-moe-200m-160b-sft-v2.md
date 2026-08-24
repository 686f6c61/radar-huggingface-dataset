# AETHORIA-AI/TR-HASH-MoE-200M-160B-SFT-v2

## Resumen

El modelo `AETHORIA-AI/TR-HASH-MoE-200M-160B-SFT-v2` es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por AETHORIA-AI. A pesar del nombre, se trata de un modelo pequeño de aproximadamente 202,7 millones de parámetros totales, entrenado mediante supervisión (SFT) de parámetros completos a partir del modelo base `TR-HASH-MoE-200M-160B-Refinement`. Su arquitectura utiliza un enrutamiento basado en hash (TR-HASH) dentro de un marco MoE, y ha sido ajustado para mejorar el seguimiento de instrucciones y la generación de razonamiento estructurado.

El modelo está pensado para experimentación e investigación en sistemas MoE compactos, y destaca por incorporar tokens de control específicos para separar el razonamiento interno (`<|think_start|>` y `<|think_end|>`) de la respuesta final (`<|final_start|>` y `<|final_end|>`). Su licencia Apache 2.0 permite uso comercial y modificación, aunque requiere `trust_remote_code=True` en Transformers debido a la implementación personalizada.

Con un vocabulario de 32.004 tokens y una ventana de contexto no documentada oficialmente (se estima de 2048 según la referencia de modelos similares), este modelo ofrece una capacidad de generación de texto limitada por su tamaño, pero suficiente para tareas de instrucción básica, prototipado y análisis académico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con routing basado en hash (TR-HASH) |
| Parámetros totales | 202.734.848 |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible (estimación de 2K según modelos hermanos) |
| Tipos de cuantización | No se proporcionan cuantizaciones; pesos en F32 (model.safetensors) y checkpoints en BF16 |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (F32) y checkpoints BF16 |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura MoE con un mecanismo de routing por hash (TR-HASH). No se han publicado detalles sobre el número de expertos, el top-k activado o la dimensionalidad de los vectores, por lo que estos datos no están disponibles. El tokenizer es de tipo BPE con 32.004 tokens, de los cuales los cuatro últimos (`32000` a `32003`) son tokens de control para razonamiento y respuesta final.

El entrenamiento consistió en un fine-tuning supervisado (SFT) de parámetros completos, partiendo directamente del modelo base `TR-HASH-MoE-200M-160B-Refinement`, sin apilar checkpoints anteriores. Se realizaron 3 épocas (9.120 pasos) con un conjunto de datos no especificado en la model card; la versión anterior del SFT (v1) utilizó una mezcla de 209.000 ejemplos auditados de Luciole. El checkpoint promovido es el de la época 2 (paso 6.080), seleccionado por su equilibrio entre pérdida, precisión en PIQA y comportamiento de seguimiento de formato.

No se han empleado técnicas de RLHF o DPO; el ajuste es exclusivamente supervisado. La implementación requiere código personalizado (`trust_remote_code=True`) ya que no existe integración nativa en Transformers.

## Capacidades

- Generación de texto en inglés con formato de chat (incluye `chat_template.jinja`).
- Razonamiento estructurado mediante tokens de inicio/fin de pensamiento y respuesta final, lo que permite separar el contenido interno de la salida.
- Seguimiento de instrucciones de formato (por ejemplo, "exactamente tres viñetas" o "exactamente dos frases").
- Generación de código básico (por ejemplo, implementación de una función `is_prime`), aunque con limitaciones en la aritmética.
- Capacidad conversacional limitada, con respuestas correctas a preguntas factuales simples (capital de Francia, etc.).
- No soporta tool calling, funciones externas, visión ni audio.

## Casos de uso

- **Prototipado de agentes conversacionales con razonamiento explícito**: gracias a los tokens `<|think_start|>` y `<|final_start|>`, se puede construir un pipeline que separe el razonamiento interno de la respuesta final, útil para experimentar con arquitecturas de "pensamiento visible" en entornos de investigación.
- **Pruebas de instrucciones de formato**: el modelo permite evaluar la capacidad de un MoE compacto para seguir restricciones sintácticas (número de viñetas, longitud de frases), útil para benchmarks de control de formato.
- **Experimentos académicos sobre MoE y routing por hash**: dado su tamaño reducido, es adecuado para estudiar el impacto de la técnica TR-HASH en el rendimiento de tareas de razonamiento y generación.
- **Generación de respuestas cortas para chatbots educativos**: puede integrarse en un entorno de demostración para enseñar conceptos de IA, aunque con limitaciones claras en aritmética y coherencia a largo plazo.
- **Evaluación de técnicas de SFT en modelos pequeños**: sirve como punto de partida para comparar estrategias de ajuste fino (SFT vs LoRA, etc.) en una arquitectura MoE de bajo coste.
- **Pruebas de integración con `trust_remote_code`**: al requerir adaptadores personalizados, es útil para verificar la compatibilidad de Transformers con código externo en entornos de desarrollo.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación zero-shot en PIQA y ARC (ARC-Easy y ARC-Challenge) para cada época:

| Época | Pérdida SFT | PPL | PIQA acc | PIQA acc_norm | ARC-Easy | ARC-Challenge | ARC combinado |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0.9575 | 2.61 | 68.50% | 69.15% | 57.58% | 25.60% | 47.01% |
| **2 (promovida)** | **0.9293** | **2.53** | **68.39%** | **69.04%** | **56.73%** | **25.43%** | **46.39%** |
| 3 | 0.9226 | 2.52 | 68.55% | 69.42% | 56.23% | 25.26% | 46.00% |

Además, se realizó un probe generativo con 128 preguntas ARC (64 Easy + 64 Challenge) que mide el seguimiento del formato:

| Época | Correctas estrictas | Correctas flexibles | Correctas nativas | Tasa de parseo |
|---:|---:|---:|---:|---:|
| 1 | 13/128 (10.16%) | 21/128 (16.41%) | 26/128 (20.31%) | 70.31% |
| **2 (promovida)** | **17/128 (13.28%)** | 19/128 (14.84%) | 24/128 (18.75%) | 67.97% |
| 3 | 16/128 (12.50%) | 19/128 (14.84%) | 24/128 (18.75%) | 70.31% |

La comparación con el SFT anterior (v1) en un panel de seis prompts muestra una ligera mejora en el control de formato (por ejemplo, cumplir con "exactamente dos frases") y la incorporación del nuevo formato de razonamiento, pero no una mejora general de capacidades. La aritmética sigue siendo incorrecta (17 x 23 da 4 en este modelo, 42 en el anterior).

## Requisitos de hardware

- **VRAM estimada para inferencia**: menos de 1 GB en BF16 (202 M parámetros ≈ 400 MB) y alrededor de 800 MB en F32.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM, incluidas las de gama de consumo como RTX 2060 o inferiores. También es viable en CPU con 2 GB de RAM.
- **Compatibilidad con GPUs de consumo**: sí, es un modelo muy ligero.
- **Opciones de despliegue**: no se menciona soporte para vLLM, llama.cpp u Ollama. La carga se realiza mediante Transformers con `trust_remote_code=True`.
- **Latencia y throughput**: no se han publicado datos. En una GPU moderna, la inferencia debería ser de milisegundos por generación, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se han encontrado modelos comparables con la misma arquitectura TR-HASH MoE. Se puede comparar con el SFT v1 del mismo modelo y con modelos de tamaño similar (200-300 M) de arquitecturas convencionales, aunque no hay benchmarks cruzados disponibles.

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| TR-HASH-MoE-200M-160B-SFT-v2 | 202,7 M | No disp. | Apache 2.0 | MoE con hash routing |
| TR-HASH-MoE-200M-160B-SFT (v1) | 202,7 M | No disp. | Apache 2.0 | Versión anterior, sin tokens de razonamiento |
| Qwen2.5-0.5B | 500 M | 32 K | Apache 2.0 | Dense, más parámetros y contexto, benchmarks superiores |

No se dispone de resultados comparativos de benchmarks entre estos modelos, por lo que la comparación es solo estructural.

## Limitaciones y advertencias

- **Aritmética deficiente**: el modelo falla en operaciones básicas (por ejemplo, 17 x 23 da 4), lo que limita su uso en tareas de cálculo.
- **Control de formato imperfecto**: aunque la época 2 cumple con restricciones de formato en el panel de prueba, no siempre lo hace en todos los casos.
- **Solo inglés**: no hay soporte multilingüe.
- **Riesgo de alucinaciones**: como cualquier LLM, puede generar información falsa, especialmente en temas desconocidos.
- **Dependencia de código personalizado**: requiere `trust_remote_code=True`, lo que implica riesgo de seguridad si se carga de fuentes no confiables.
- **Sin garantías de producción**: el modelo es experimental y no se recomienda para entornos de producción sin una evaluación exhaustiva.
- **Contexto limitado**: aunque no se documenta, se estima una ventana de 2K tokens, lo que restringe conversaciones largas o documentos extensos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-200M-160B-SFT-v2)
- [SFT anterior (v1)](https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-200M-160B-SFT)
- [Modelo base (Refinement)](https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-200M-160B-Refinement)
- [Referencia a DeepSeek-MoE (arquitectura MoE)](https://github.com/deepseek-ai/DeepSeek-MoE)
- [Ficha en LLM Explorer](https://llm-explorer.com/model/AETHORIA-AI%2FTR-HASH-MoE-200M-130B,2ywNBgf5IbLoNYIWN9cWMj) (para la versión 130B)
