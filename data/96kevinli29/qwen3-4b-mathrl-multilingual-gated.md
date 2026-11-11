# 96kevinli29/Qwen3-4B-MathRL-Multilingual-Gated

## Resumen

Qwen3-4B-MathRL-Multilingual-Gated es un ajuste fino por refuerzo del modelo Qwen3-4B de Alibaba, desarrollado por el autor independiente 96kevinli29 como tercera etapa (Stage III) de la investigación publicada en el paper *What Does Post-Training Change in Multilingual Reasoning?* (arXiv:2609.37104). El modelo parte de un checkpoint intermedio entrenado con SFT multilingüe y se somete a 200 pasos de PPO con un reward que combina la corrección de la respuesta con una puntuación de idioma, de forma que el modelo razona en el idioma del enunciado y termina sus respuestas.

El problema que resuelve es concreto: el modelo SFT previo razonaba correctamente en el idioma solicitado, pero un 21,1% de sus respuestas en lenguas no inglesas entraban en bucles de repetición o agotaban el presupuesto de tokens. Tras el RL, esa tasa cae al 1,8%, el razonamiento se mantiene en el idioma pedido en el 99,7% de los casos y las respuestas son sustancialmente más cortas (mediana de 4.463 tokens frente a 7.673).

Arquitectura transformer causal de 4.411.424.256 parámetros, licencia Apache 2.0, seis idiomas soportados (inglés, chino, español, francés, árabe y ruso) y pesos en safetensors compatibles con transformers. Es relevante porque documenta, con ablación de reward incluida, cómo el post-entrenamiento afecta al razonamiento multilingüe en modelos pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3), decodificador denso |
| Parámetros totales | 4.411.424.256 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (presupuesto de evaluación: 24.576 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en, zh, es, fr, ar, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso derivado de Qwen3-4B, sin modificaciones estructurales respecto al checkpoint base. El entrenamiento se organiza en tres etapas: Stage I son los checkpoints Qwen3-4B y Qwen3-8B originales; Stage II es un SFT de seis idiomas sobre trazas matemáticas (epoch 2) que da lugar a `96kevinli29/Qwen3-4B-SFT-Math-Multilingual`; y Stage III, que es este modelo, aplica 200 pasos de PPO con la librería verl sobre prompts matemáticos localizados del dataset `96kevinli29/DAPO-Math-Multilingual-6Lang`.

La innovación técnica central es la función de reward con compuerta: `R = C · (0.7 + 0.3 · ℓ)`, donde `C` es la corrección de la respuesta y `ℓ ∈ [0, 1]` la puntuación de idioma del razonamiento visible. Al ser multiplicativa, el crédito por idioma solo se paga cuando la respuesta es correcta, de modo que una respuesta incorrecta no obtiene ninguna recompensa. El paper entrena tres ejecuciones PPO emparejadas desde el mismo checkpoint SFT que difieren solo en el reward: la variante aditiva (`0.7 · C + 0.3 · ℓ`, publicada como `Qwen3-4B-MathRL-Multilingual-Additive`), esta variante con compuerta y una tercera solo con corrección que no se publica porque deriva de vuelta al razonamiento en inglés. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset de SFT.

## Capacidades

- Generación de texto y razonamiento matemático de competición (problemas tipo AIME y AMC) con cadena de pensamiento visible.
- Razonamiento en el idioma del enunciado: 99,7% de las trazas en el idioma solicitado en la evaluación multilingüe.
- Terminación fiable de la respuesta: solo un 1,8% de respuestas no terminadas por bucle de repetición o agotamiento de presupuesto.
- Cobertura multilingüe en seis idiomas: inglés, chino, español, francés, árabe y ruso.
- Modo conversacional (tag `conversational`) y pipeline de text-generation compatible con text-generation-inference y endpoints.
- No se documenta en la información disponible soporte de tool calling, function calling, uso como agente multi-paso, visión ni audio.

## Casos de uso

- Tutoría matemática en español: el modelo recibe un problema de competición en castellano y produce la cadena de razonamiento íntegramente en castellano, lo que permite mostrarla al estudiante sin traducción posterior y con una mediana de 4.306 tokens por respuesta.
- Evaluación comparativa de post-entrenamiento: sirve como checkpoint de referencia para reproducir la ablación de reward del paper, junto con la variante aditiva, manteniendo fijo el checkpoint SFT de partida.
- Generación de datos sintéticos de razonamiento multilingüe: la alta tasa de terminación (98,2%) y la fidelidad de idioma (99,7%) lo hacen adecuado para producir trazas etiquetadas en árabe o ruso, idiomas con menos corpus de razonamiento abierto.
- Procesamiento de enunciados en ruso y árabe: con 63,4% y 59,1% de precisión respectivamente, cubre consultas técnicas en idiomas donde muchos modelos pequeños derivan al inglés.
- Investigación sobre bucles de repetición: la reducción de 21,1% a 1,8% en respuestas no terminadas lo convierte en un caso de estudio controlado para analizar el efecto del RL sobre la degeneración de la decodificación.
- Despliegue en infraestructura modesta: con 4,4 mil millones de parámetros y licencia Apache 2.0, es viable para prototipos internos de resolución de problemas matemáticos sin coste de licencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Protocolo: 70 problemas (30 AIME-2026 + 40 AMC-2023) planteados en cada uno de seis idiomas, 16 muestras por problema a temperatura 0,7 y presupuesto de 24.576 tokens, lo que supone 1.120 respuestas por idioma. `C` = respuesta correcta, `L` = razonamiento en el idioma solicitado, `T` = respuesta terminada, `J@1` = las tres condiciones a la vez en una muestra, `J@16` = best of 16.

| Métrica (media no inglesa, 5 idiomas) | Qwen3-4B publicado | Tras SFT | RL reward aditivo | RL reward con compuerta |
|---|---|---|---|---|
| Respuesta correcta (C) | 76,2% | 61,4% | 60,1% | 61,7% |
| Razonamiento en el idioma pedido (L) | 39,8% | 99,4% | 99,6% | 99,7% |
| No terminada (1 − T) | 4,7% | 21,1% | 1,2% | 1,8% |
| J@1 | 28,6% | 60,2% | 59,8% | 61,4% |
| J@16 | 35,7% | 84,6% | 83,1% | 83,7% |
| Longitud mediana (tokens) | 5.824 | 7.673 | 4.072 | 4.463 |

Desglose por idioma de este checkpoint:

| Idioma | C | L | 1 − T | J@1 | J@16 | Tokens medianos |
|---|---|---|---|---|---|---|
| Inglés | 67,1% | 100,0% | 0,4% | 67,1% | 87,1% | 3.591 |
| Chino | 60,5% | 100,0% | 2,3% | 60,5% | 82,9% | 3.758 |
| Español | 62,4% | 99,8% | 1,1% | 62,3% | 84,3% | 4.306 |
| Francés | 63,0% | 99,7% | 0,4% | 62,9% | 82,9% | 4.244 |
| Árabe | 59,1% | 98,8% | 2,3% | 57,9% | 84,3% | 4.904 |
| Ruso | 63,4% | 100,0% | 2,9% | 63,3% | 84,3% | 5.102 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud para un modelo denso de 4,4 mil millones de parámetros en bf16, el peso de los pesos ronda los 8,8 GB (tamaño del repositorio), a lo que hay que sumar la caché KV del contexto utilizado.
- GPU recomendadas: no disponibles en la información proporcionada. No se documentan configuraciones de referencia ni throughput medido.
- Encaje en GPU de consumo: no confirmado por el autor. El tamaño del repositorio (8,8 GB) sugiere que la inferencia en bf16 no cabe en GPUs de 8 GB sin cuantización, pero no se publican pesos GGUF ni cuantizados.
- Opciones de despliegue: transformers (librería declarada) y text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`). No se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI más allá de las etiquetas.
- Latencia y throughput: no disponibles. El presupuesto de evaluación empleado es de 24.576 tokens, con medianas de respuesta de 3.591 a 5.102 tokens según idioma.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Razonamiento multilingüe | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-MathRL-Multilingual-Gated | 4,41 B | no disponible | L = 99,7%, J@1 = 61,4% (media no inglesa) | Apache 2.0 | Hugging Face |
| 96kevinli29/Qwen3-4B-MathRL-Multilingual-Additive | 4,41 B (mismo base) | no disponible | L = 99,6%, J@1 = 59,8% | Apache 2.0 | Hugging Face |
| 96kevinli29/Qwen3-4B-SFT-Math-Multilingual | 4,41 B (mismo base) | no disponible | L = 99,4%, J@1 = 60,2%, 21,1% sin terminar | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B | 4,41 B | no disponible | L = 39,8%, J@1 = 28,6%, C = 76,2% | Apache 2.0 | Hugging Face |

La comparación relevante es interna a la línea de checkpoints del propio autor, ya que la información disponible no incluye resultados de modelos externos bajo el mismo protocolo de evaluación. Frente al Qwen3-4B original, este modelo pierde precisión bruta (61,7% frente a 76,2% en la media no inglesa) pero multiplica por más de dos la tasa de respuestas entregadas (J@1 de 28,6% a 61,4%) al razonar en el idioma pedido y terminar en plazo.

## Limitaciones y advertencias

- Pérdida de precisión respecto al modelo base: la exactitud en la media no inglesa baja de 76,2% a 61,7%, un descenso de 14,5 puntos que el autor no desglosa por causa.
- Resultados no verificados: las métricas del model-index tienen `verified: false` y proceden del propio autor.
- Ámbito estrecho: el ajuste se realiza sobre prompts matemáticos; no hay evidencia de que las mejoras de idioma y terminación se generalicen a otras tareas.
- Sesgo de idioma en la evaluación: los seis idiomas cubiertos son mayoritariamente de altos recursos; no se evalúan lenguas de bajos recursos ni variantes dialectales.
- Riesgo de alucinación: no se documenta ninguna evaluación de factualidad; el modelo está optimizado para problemas con respuesta verificable, no para conocimiento abierto.
- Idiomas fuera de la lista: el comportamiento en idiomas distintos de en, zh, es, fr, ar y ru no está caracterizado.
- Longitud de contexto: no se publica la ventana nativa del modelo; el presupuesto de 24.576 tokens corresponde al protocolo de evaluación, no necesariamente al máximo soportado.
- Uso comercial: la licencia Apache 2.0 lo permite sin restricciones adicionales, pero la ausencia de pesos cuantizados oficiales obliga a realizar la cuantización por cuenta propia.
- Trazabilidad: cero descargas y cero likes en el momento de la ficha; no hay validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/96kevinli29/Qwen3-4B-MathRL-Multilingual-Gated
- Modelo base (Stage II): https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-Multilingual
- Variante con reward aditivo: https://huggingface.co/96kevinli29/Qwen3-4B-MathRL-Multilingual-Additive
- Réplica a escala 8B (Stage II): https://huggingface.co/96kevinli29/Qwen3-8B-SFT-Math-Multilingual
- Modelo original Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Modelo original Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Paper: https://arxiv.org/abs/2609.37104
- Dataset de prompts RL: https://huggingface.co/datasets/96kevinli29/DAPO-Math-Multilingual-6Lang
- Dataset de evaluación: https://huggingface.co/datasets/96kevinli29/Multilingual-Math-Reasoning-Eval
- Dataset SFT (43k): https://huggingface.co/datasets/96kevinli29/SFT-Math-Multilingual-43k
- Dataset SFT (56k): https://huggingface.co/datasets/96kevinli29/SFT-Math-Multilingual-56k
