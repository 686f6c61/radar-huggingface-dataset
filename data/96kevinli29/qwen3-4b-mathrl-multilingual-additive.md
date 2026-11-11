# 96kevinli29/Qwen3-4B-MathRL-Multilingual-Additive

## Resumen

Qwen3-4B-MathRL-Multilingual-Additive es un ajuste fino de Qwen3-4B desarrollado por el usuario 96kevinli29, orientado a razonamiento matemático multilingüe. El modelo parte de Qwen3-4B, sobre el que se aplicó primero un SFT de seis idiomas y después 200 pasos de PPO con una recompensa aditiva que combina corrección de la respuesta y adherencia al idioma del enunciado. Es el checkpoint de la etapa III del artículo *What Does Post-Training Change in Multilingual Reasoning?* (arXiv:2609.37104).

El problema que aborda es concreto: los modelos de razonamiento multilingües suelen derivar al inglés durante la cadena de pensamiento o entrar en bucles de repetición que agotan el presupuesto de tokens. Este modelo mantiene el razonamiento en el idioma solicitado en el 99,6 % de los casos y reduce las respuestas no terminadas del 21,1 % al 1,2 % respecto al modelo SFT previo.

Arquitectura transformer causal densa con 4.411.424.256 parámetros. La longitud de contexto no está indicada en la información disponible. Licencia Apache 2.0, pesos en safetensors, y soporte declarado para inglés, chino, español, francés, árabe y ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3), densa |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, es, fr, ar, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso basado en Qwen3-4B. El proceso de entrenamiento consta de dos etapas sobre el checkpoint original: primero un SFT multilingüe de seis idiomas (etapa II, checkpoint `Qwen3-4B-SFT-Math-Multilingual`, epoch 2), y después 200 pasos de PPO (etapa III) sobre prompts matemáticos localizados del dataset `DAPO-Math-Multilingual-6Lang`. El entrenamiento RL se realizó con la librería verl.

La innovación principal es la función de recompensa aditiva: `R = 0.7 · C + 0.3 · ℓ`, donde `C` es la corrección de la respuesta y `ℓ ∈ [0, 1]` es una puntuación de idioma que mide si el razonamiento visible está escrito en el idioma del enunciado. Al ser aditiva, se paga hasta un 0,3 de crédito por idioma con independencia de si la respuesta es correcta. El artículo compara esta variante con una recompensa con puerta (`C · (0.7 + 0.3 · ℓ)`) y con una recompensa solo de corrección; esta última deja de entrar en bucles pero vuelve a razonar en inglés, por lo que no se publicó. Los datos de SFT provienen de `SFT-Math-Multilingual-43k` y `SFT-Math-Multilingual-56k`.

## Capacidades

- Generación de texto y razonamiento matemático de competición (AIME, AMC) con cadena de pensamiento visible.
- Razonamiento en el idioma del enunciado en seis idiomas: inglés, chino, español, francés, árabe y ruso.
- Terminación fiable de la respuesta: reduce los bucles de repetición y el agotamiento del presupuesto de tokens.
- Respuestas más concisas que el modelo SFT previo (mediana de 4.072 tokens frente a 7.673).
- Formato conversacional compatible con `transformers` y con text-generation-inference.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión o audio: no disponible; el modelo es solo de texto.

## Casos de uso

- Resolución de problemas matemáticos de competición en español: el modelo razona y responde en castellano con una tasa de adherencia al idioma del 99,8 %, adecuado para tutorización de olimpiadas matemáticas sin filtrar la solución en inglés.
- Atención educativa multilingüe: un mismo despliegue atiende consultas de matemáticas en seis idiomas manteniendo la cadena de pensamiento en el idioma del alumno, lo que facilita la revisión por parte de docentes no angloparlantes.
- Generación de soluciones paso a paso para plataformas de e-learning: la reducción de respuestas no terminadas al 1,2 % disminuye los reintentos y el coste de inferencia en pipelines con presupuesto de tokens acotado.
- Evaluación automática de razonamiento matemático: sirve como modelo de referencia para comparar la calidad del razonamiento multilingüe frente a otros checkpoints de la misma familia (SFT, gated, base).
- Investigación sobre post-entrenamiento multilingüe: al ser un checkpoint publicado de la etapa III con recompensa aditiva, permite reproducir y contrastar los resultados del artículo sobre deriva lingüística y bucles de repetición.
- Procesamiento de enunciados en árabe y ruso: idiomas con menos cobertura en modelos abiertos, con tasas de respuesta entregada del 56,1 % y 61,7 % en J@1 respectivamente, útil para mercados con poca oferta de modelos matemáticos abiertos.
- Integración en servicios de inferencia estándar: al ser compatible con `transformers` y text-generation-inference, se puede desplegar en endpoints existentes sin adaptadores específicos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre 70 problemas de competición (30 AIME-2026 + 40 AMC-2023) planteados en cada uno de los seis idiomas, 16 muestras por problema a temperatura 0,7 y presupuesto de 24.576 tokens (1.120 respuestas por idioma).

Media de los cinco idiomas no ingleses:

| Métrica | Qwen3-4B publicado | Tras SFT | RL recompensa aditiva (este) | RL recompensa con puerta |
|---|---|---|---|---|
| Respuesta correcta (C) | 76,2 % | 61,4 % | 60,1 % | 61,7 % |
| Razonamiento en el idioma solicitado (L) | 39,8 % | 99,4 % | 99,6 % | 99,7 % |
| No terminadas (1 − T) | 4,7 % | 21,1 % | 1,2 % | 1,8 % |
| Entregada, una muestra (J@1) | 28,6 % | 60,2 % | 59,8 % | 61,4 % |
| Entregada, mejor de 16 (J@16) | 35,7 % | 84,6 % | 83,1 % | 83,7 % |
| Longitud mediana de respuesta (tokens) | 5.824 | 7.673 | 4.072 | 4.463 |

Desglose por idioma de este checkpoint:

| Idioma | C | L | 1 − T | J@1 | J@16 | Tokens medianos |
|---|---|---|---|---|---|---|
| Inglés | 65,7 % | 100,0 % | 0,2 % | 65,7 % | 85,7 % | 3.510 |
| Chino | 58,7 % | 99,7 % | 0,6 % | 58,5 % | 81,4 % | 3.596 |
| Español | 61,5 % | 99,8 % | 0,8 % | 61,4 % | 81,4 % | 3.856 |
| Francés | 61,3 % | 99,8 % | 0,3 % | 61,3 % | 85,7 % | 3.818 |
| Árabe | 57,3 % | 98,6 % | 2,1 % | 56,1 % | 82,9 % | 4.566 |
| Ruso | 61,7 % | 99,9 % | 2,0 % | 61,7 % | 84,3 % | 4.524 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,8 GB en precisión original (bf16/fp16) según el tamaño del repositorio; alrededor de 4,5 GB en cuantización de 8 bits y 2,5-3 GB en 4 bits (estimación a partir del número de parámetros, no confirmada por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para mayor throughput y lotes grandes; RTX 4090 (24 GB) o A6000 (48 GB) para inferencia en bf16 sin cuantizar.
- Cabe en GPU de consumo: sí, en tarjetas con 8-12 GB o más usando cuantización de 8 o 4 bits; en bf16 requiere al menos 12-16 GB de VRAM efectiva.
- Opciones de despliegue: `transformers`, text-generation-inference (declarado en los tags del modelo) y endpoints compatibles. El soporte de vLLM, llama.cpp u Ollama no está indicado en la información disponible.
- Latencia y throughput: no disponibles. Como referencia indirecta, la longitud mediana de respuesta de 4.072 tokens implica generaciones largas; el presupuesto de evaluación fue de 24.576 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Adherencia al idioma (L) | Terminación (1 − T) | Licencia |
|---|---|---|---|---|---|
| Qwen3-4B-MathRL-Multilingual-Additive (este) | 4,41 B | no disponible | 99,6 % | 1,2 % | Apache 2.0 |
| Qwen3-4B-MathRL-Multilingual-Gated | 4,41 B (base) | no disponible | 99,7 % | 1,8 % | Apache 2.0 |
| Qwen3-4B-SFT-Math-Multilingual | 4,41 B (base) | no disponible | 99,4 % | 21,1 % | Apache 2.0 |
| Qwen3-4B publicado | 4,02 B aprox. | no disponible | 39,8 % | 4,7 % | Apache 2.0 |

Las cifras de L y 1 − T corresponden a la media de los cinco idiomas no ingleses del benchmark del autor. El modelo con recompensa con puerta obtiene resultados comparables en todas las métricas; la elección entre ambos es una cuestión de preferencia de investigación. El Qwen3-4B original mantiene mayor precisión de respuesta (76,2 %) pero razona en inglés en la mayoría de los casos no ingleses.

## Limitaciones y advertencias

- Precisión matemática inferior al modelo base Qwen3-4B en la media no inglesa (60,1 % frente a 76,2 %): el ajuste multilingüe y el RL priorizan idioma y terminación a costa de exactitud.
- Riesgo de alucinación inherente a los modelos generativos; las cadenas de razonamiento largas pueden contener pasos incorrectos aunque la respuesta final sea correcta o viceversa.
- Sesgos conocidos: no documentados en la información proporcionada.
- Cobertura limitada a seis idiomas; otros idiomas pueden degradar la adherencia lingüística y la calidad del razonamiento.
- El árabe es el idioma con peor rendimiento relativo: 56,1 % en J@1, 2,1 % de respuestas no terminadas y mayor longitud mediana (4.566 tokens).
- Benchmarks declarados por el autor y marcados como no verificados; la evaluación se limita a 70 problemas de competición y a un protocolo de muestreo concreto.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones heredadas de Qwen3-4B y la atribución del artículo asociado.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay validación independiente de la comunidad.
- No se documentan capacidades de tool calling, agentes ni visión; no debe asumirse que las herede del Qwen3 original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/96kevinli29/Qwen3-4B-MathRL-Multilingual-Additive
- Modelo base SFT: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-Multilingual
- Variante con recompensa con puerta: https://huggingface.co/96kevinli29/Qwen3-4B-MathRL-Multilingual-Gated
- Réplica a 8B (SFT): https://huggingface.co/96kevinli29/Qwen3-8B-SFT-Math-Multilingual
- Modelo original: https://huggingface.co/Qwen/Qwen3-4B
- Modelo original 8B: https://huggingface.co/Qwen/Qwen3-8B
- Dataset SFT 43k: https://huggingface.co/datasets/96kevinli29/SFT-Math-Multilingual-43k
- Dataset SFT 56k: https://huggingface.co/datasets/96kevinli29/SFT-Math-Multilingual-56k
- Dataset de prompts RL: https://huggingface.co/datasets/96kevinli29/DAPO-Math-Multilingual-6Lang
- Dataset de evaluación: https://huggingface.co/datasets/96kevinli29/Multilingual-Math-Reasoning-Eval
- Artículo: https://arxiv.org/abs/2609.37104
