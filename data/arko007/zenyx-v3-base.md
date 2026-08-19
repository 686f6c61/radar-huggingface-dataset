# Arko007/Zenyx-V3-Base

## Resumen

Zenyx V3 Base es un modelo fundacional de lenguaje de tipo Mixture-of-Experts (MoE) con 1.5 mil millones de parámetros totales y solo 0.4 mil millones activos por token, desarrollado por Arko007. Está escrito desde cero en JAX/Flax y entrenado sobre TPU v5e-8, con un diseño orientado a inferencia de baja latencia y alto rendimiento. Se trata de un modelo base, no ajustado para instrucciones, por lo que su uso principal es la continuación de texto o como punto de partida para fine-tuning.

El modelo incorpora varias innovaciones técnicas: Multi-head Latent Attention (MLA) que comprime la caché KV en un subespacio de bajo rango, un gate basado en transporte de Sinkhorn para el enrutamiento de expertos, Hyper-Connections para estabilidad del gradiente y Multi-Token Prediction (MTP) como objetivo auxiliar de entrenamiento. El contexto de entrenamiento es de hasta 4.096 tokens, con factores de escalado YaRN y RoPE precomputados para permitir extensión en inferencia.

Actualmente se encuentra en pretraining activo (checkpoint en el paso 70.400, con 42.400 millones de tokens procesados). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones, y el idioma soportado es inglés. Su relevancia radica en demostrar que un MoE compacto puede ofrecer un rendimiento competitivo con un coste computacional reducido, siendo una opción interesante para despliegues en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con MLA y Hyper-Connections |
| Parametros totales | ~1.5B |
| Parametros activos | ~0.4B por token |
| Longitud de contexto | 4.096 tokens (entrenamiento), extensible con YaRN/RoPE |
| Tipos de cuantizacion | No disponible (pesos en bfloat16) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | JAX/Flax (checkpoints) |

## Arquitectura y entrenamiento

Zenyx V3 Base es un transformer con arquitectura MoE dispersa: 12 expertos enrutados más 1 experto compartido, con exactamente 2 expertos activos por token. El enrutamiento se realiza mediante un gate basado en transporte de Sinkhorn, que normaliza las asignaciones para mantener equilibrio de carga. La atención es Multi-head Latent Attention (MLA), que comprime la caché KV en un subespacio de bajo rango, reduciendo el uso de memoria y ancho de banda HBM. Además, se emplean Hyper-Connections, un mecanismo de conexión residual normalizado con Sinkhorn, para mejorar la estabilidad del gradiente durante el entrenamiento a escala. El modelo también incorpora Multi-Token Prediction (MTP) como objetivo auxiliar, prediciendo varios tokens futuros simultáneamente durante el entrenamiento.

La configuración incluye 16 capas (2 densas y 14 MoE), tamaño oculto de 1.536, 12 cabezas de atención con dimensión de cabeza 128 y un vocabulario de 129.280 tokens. La precisión de entrenamiento es bfloat16. El entrenamiento se realizó en TPU v5e-8 sobre un corpus diverso de texto web, matemáticas y código, con un contexto progresivo de 2.048 a 4.096 tokens. No se ha aplicado RLHF ni DPO, ya que es un modelo base en fase de pretraining.

## Capacidades

- Generación de texto por continuación: dado un prefijo, completa el texto de forma coherente (por ejemplo, "La capital de Francia es" → "París").
- Modelado de lenguaje: puede calcular la probabilidad de secuencias, útil para tareas de scoring y evaluación.
- Razonamiento de sentido común básico: obtiene resultados moderados en benchmarks como PIQA (59,96% acc_norm) y HellaSwag (32,51% acc_norm).
- Comprensión lectora: rinde en tareas como BoolQ (62,14% acc) y SciQ (76,30% acc), aunque con limitaciones en razonamiento más complejo.
- Capacidades multilingües: limitadas, solo entrenado en inglés.
- Sin soporte de tool calling ni function calling: al ser un modelo base, no tiene entrenamiento específico para invocar herramientas.
- Sin modo de razonamiento explícito ni capacidades de visión o audio: es un modelo de texto puro.

## Casos de uso

- Fine-tuning para tareas específicas de NLP: al ser un modelo base, es ideal para ajustarlo con datasets propios en tareas como clasificación de texto, análisis de sentimiento o extracción de información. Su tamaño compacto (0,4B activos) permite fine-tuning con recursos moderados.
- Generación de texto para completar código: aunque no está específicamente entrenado para código, su corpus incluye programación, por lo que puede servir como base para un modelo de autocompletado tras fine-tuning.
- Evaluación de modelos y research: su arquitectura innovadora (MLA, Sinkhorn gate, MTP) lo convierte en un sujeto de estudio para investigar eficiencia en MoE y técnicas de compresión de atención.
- Prototipado rápido en entornos con restricciones de memoria: su bajo número de parámetros activos permite ejecutarlo en GPUs de consumo (por ejemplo, RTX 3060 con 12 GB) sin necesidad de hardware profesional.
- Servicios de completado de texto en tiempo real: gracias a su baja latencia por la arquitectura MoE, puede integrarse en aplicaciones de autocompletado o sugerencias de escritura.
- Base para modelos de chat o instruct tras SFT: una vez se publiquen las variantes ajustadas, podría usarse para asistentes conversacionales ligeros; mientras tanto, sirve como punto de partida para entrenar dichas variantes.

## Benchmarks y rendimiento

Los resultados corresponden al checkpoint paso 70.400 (42,4B tokens vistos), evaluados con protocolo estándar de modelo base (scoring de log-verosimilitud). Se reportan las métricas convencionales para cada tarea (acc_norm para HellaSwag, ARC, PIQA, OpenBookQA; acc para WinoGrande, BoolQ, SciQ, LAMBADA).

| Benchmark | Métrica | Resultado | Aleatorio | Δ |
|---|---|---|---|---|
| HellaSwag | acc_norm | 32,51% ± 0,47 | 25,0% | +7,5 |
| ARC-Easy | acc_norm | 45,58% ± 1,02 | 25,0% | +20,6 |
| ARC-Challenge | acc_norm | 25,00% ± 1,26 | 25,0% | +0,0 |
| PIQA | acc_norm | 59,96% ± 1,14 | 50,0% | +10,0 |
| WinoGrande | acc | 49,57% ± 1,40 | 50,0% | -0,4 |
| BoolQ | acc | 62,14% ± 0,85 | 62,2% | -0,1 |
| SciQ | acc | 76,30% ± 1,34 | 25,0% | +51,3 |
| LAMBADA (OpenAI) | acc | 26,96% ± 0,62 | 0,0% | +27,0 |
| MMLU (5-shot) | acc | 26,01% ± 0,37 | 25,0% | +1,0 |
| RACE | acc_norm | 32,85% ± 0,67 | 25,0% | +7,9 |
| CommonsenseQA | acc_norm | 30,55% ± 1,32 | 20,0% | +10,5 |
| COPA | acc | 59,00% ± 4,92 | 50,0% | +9,0 |
| LogiQA | acc_norm | 25,81% ± 1,71 | 25,0% | +0,8 |
| TruthfulQA MC1 | acc | 19,83% ± 1,39 | 22,8% | -3,0 |
| Arithmetic | acc | 1,04% ± 0,09 | 0,0% | +1,0 |

Además, se reporta perplexity en WikiText-2 (raw): 25,79 (token-level), 48,18 (word-level) y 1,0425 bits por byte; y perplexity de LAMBADA: 34,15.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware, pero se pueden estimar a partir de los parámetros activos (0,4B) y la precisión bfloat16:

- VRAM estimada para inferencia: con 0,4B parámetros activos, el modelo cabe en ~0,8 GB en bfloat16 (sin contar caché KV ni overhead). Con contexto de 4.096 tokens y la compresión MLA, la VRAM total estimada es de 2-4 GB, lo que permite ejecutarlo en GPUs de consumo como RTX 3060 (12 GB) o incluso en CPUs con suficiente RAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1660 Super, RTX 2060, RTX 3060). Para throughput alto, se recomienda una A100 o H100, aunque no es imprescindible.
- Despliegue: al estar en JAX/Flax, se puede servir con JAX Serving o convertir a otros formatos (ONNX, TensorFlow) mediante herramientas de conversión. No hay soporte nativo para vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no se han publicado datos. Dado el bajo número de parámetros activos, se espera una latencia inferior a 10 ms por token en GPUs modernas, pero es una estimación no verificada.

## Comparativa con modelos similares

No se han publicado comparativas directas con otros modelos en la información disponible. Como referencia, se pueden considerar modelos densos de tamaño similar (por ejemplo, GPT-2 1.5B) o MoE más grandes como Mixtral 8x7B, pero no hay datos de evaluación comparativa en la misma configuración. La tabla siguiente es orientativa basada en características públicas:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Zenyx V3 Base | ~1.5B | ~0.4B | 4.096 | Apache 2.0 | JAX/Flax |
| GPT-2 1.5B | 1.5B | 1.5B | 1.024 | MIT | PyTorch |
| Mixtral 8x7B | 46.7B | 12.9B | 32.768 | Apache 2.0 | PyTorch |

La comparación no es exhaustiva y los benchmarks no son directamente comparables por diferencias en protocolos de evaluación.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue comandos ni mantiene conversaciones. Intentar usarlo como asistente dará resultados incoherentes.
- Pretraining en curso: el checkpoint actual (paso 70.400) es intermedio; el rendimiento puede mejorar o cambiar en versiones futuras.
- Rendimiento limitado en razonamiento complejo: los resultados en ARC-Challenge (25,0% acc_norm, igual al azar) y LogiQA (25,81%) indican dificultades con tareas que requieren deducción lógica.
- Sesgo hacia respuestas cortas: aunque se usa acc_norm para mitigarlo, el modelo tiende a favorecer continuaciones breves.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido falso o no verificado, especialmente en tareas de conocimiento factual (TruthfulQA MC1: 19,83%, por debajo del azar).
- Idioma limitado: solo entrenado en inglés; no es adecuado para otros idiomas sin fine-tuning adicional.
- Sin soporte de herramientas ni agentes: no puede llamar funciones ni realizar razonamiento multi-paso estructurado.
- Formato de pesos propietario: al estar en JAX/Flax, puede requerir conversión para usarse con frameworks populares (PyTorch, ONNX), lo que añade fricción en la integración.
- Tamaño del repositorio (1266 GB) sugiere múltiples checkpoints; el almacenamiento y descarga pueden ser costosos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Arko007/Zenyx-V3-Base
- Tokenizador asociado: https://huggingface.co/Arko007/zenyx-v3-tokenizer
- No se han encontrado papers, blogs o repositorios adicionales en la búsqueda web.
