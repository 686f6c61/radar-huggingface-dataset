# MinimaLabs/KLM-1.5

## Resumen

KLM 1.5 es un modelo de lenguaje base de 99 millones de parámetros desarrollado por MinimaLabs, entrenado desde cero sobre 100.000 millones de tokens. Sustituye a KLM 1.1, que era una continuación del entrenamiento de KeyLM-75M; en este caso se trata de una arquitectura nueva, no de un fine-tuning ni de un modelo derivado. Está pensado como modelo base para experimentación en el segmento de modelos pequeños (sub-100M), donde cada punto de rendimiento cuenta y el coste de inferencia es crítico.

La arquitectura es híbrida: combina capas de Gated DeltaNet-2 (atención lineal con estado recurrente de tamaño fijo) y capas de atención completa en proporción 3:1, con 24 capas totales y un tamaño oculto de 512. Incorpora dos innovaciones destacables: Block Attention Residuals, donde cada capa lee una mezcla aprendida de las salidas de todas las capas anteriores en lugar de una suma residual acumulativa, y una memoria exacta de n-gramas con 125.000 bigramas y 38.000 trigramas frecuentes, cada uno con su propio vector aprendido (5,4M parámetros en total).

El modelo se distribuye con licencia Apache 2.0, solo en inglés, con una longitud de contexto de 2.048 tokens y un tokenizador reducido de 4.100 tokens que descompone cada número en dígitos individuales. En el Open SLM Leaderboard ocupa el primer puesto entre modelos de menos de 100M de parámetros y el segundo entre los de menos de 150M, con un Intelligence Index de 30,26.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet-2 y atención completa a razón 3:1, con Block Attention Residuals |
| Parámetros totales | 98.975.308 (de ellos 5.411.832 corresponden a la memoria de n-gramas) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere custom_code) |

Especificaciones adicionales de arquitectura:

| Parámetro | Valor |
|---|---|
| Capas | 24 |
| Tamaño oculto | 512 |
| Gated DeltaNet-2 | 4 cabezas × 128 |
| Atención | 8 cabezas de query, 4 cabezas KV, tamaño de cabeza 64, RoPE, QK-norm, puerta de salida |
| Feed-forward | SwiGLU, tamaño oculto 1.408 |
| Vocabulario | 4.100 tokens (embeddings atados, 2,1M parámetros) |
| Memoria de n-gramas | 125.000 bigramas + 38.000 trigramas, 5,4M parámetros |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo emplea 24 capas organizadas en proporción 3:1 entre Gated DeltaNet-2 y atención completa. Las capas de Gated DeltaNet-2 mantienen una memoria recurrente de tamaño fijo a lo largo de la secuencia en lugar de atender a todos los tokens anteriores, lo que reduce el coste computacional y de memoria en secuencias largas. Las capas de atención completa usan 8 cabezas de query y 4 de clave-valor con tamaño de cabeza 64, RoPE, QK-norm y puerta de salida. El feed-forward es SwiGLU con tamaño oculto 1.408. La innovación de Block Attention Residuals (Kimi Team, 2026) hace que cada capa lea una mezcla aprendida de los embeddings y de las salidas de todas las capas anteriores, en lugar de acumular todo en una única suma residual. La memoria exacta de n-gramas añade vectores aprendidos para los 125.000 bigramas y 38.000 trigramas más frecuentes del corpus de entrenamiento, consultados de forma exacta y concatenados a los embeddings de token.

El entrenamiento se realizó en tres etapas sobre secuencias de 2.048 tokens con 128 secuencias por paso. La primera, de calentamiento por superposición (Token-Superposition Training, 70.000 pasos), promedia 7 tokens consecutivos en cada posición de entrada y entrena al modelo para predecir los siguientes 7 como grupo no ordenado, lo que permite cubrir 128.000 millones de tokens de ClimbMix con el coste de unos 18.000 millones. La segunda etapa es de entrenamiento estable con predicción del siguiente token sobre 80.000 millones de tokens a tasa de aprendizaje constante. La tercera es de decaimiento sobre 20.000 millones de tokens con mayor proporción de matemáticas y Q&A, con la tasa de aprendizaje cayendo a cero según una curva 1−√t. Las matrices de pesos se entrenaron con MuonEq-R a tasa 0,01 y los embeddings, normas y puertas con AdamW a 3e-3, en bf16. Cada secuencia de 2.048 tokens empaqueta varios documentos, y el modelo nunca mira a través de fronteras de documento: la atención se enmascara allí y se reinician el estado recurrente y el historial de n-gramas.

La mezcla de datos cambia entre las etapas estable y de decaimiento: texto web del 56% al 26% (ClimbMix, TxT360-v2, UltraX), Q&A del 13% al 23%, libros de texto del 12% al 14% (Cosmopedia v2, WikiHow), matemáticas del 11% al 20% (OpenMathInstruct-2, UltraData-Math, Math-Reasoning, Dolmino TinyMATH), ciencia web del 3% al 8%, sentido común del 3% al 8% (DCLM filtrado, ATOMIC 2020, ANLI, GLUCOSE, CREAK, SciQ, QASC) y reescrituras de razonamiento del 2% al 1% (Pretrain-Behaviors).

## Capacidades

- Generación de texto en inglés: modelo base preentrenado, sin ajuste por instrucciones ni RLHF, orientado a continuación de texto y a servir de punto de partida para fine-tuning.
- Razonamiento aritmético básico: el tokenizador descompone cada número en dígitos individuales, lo que facilita el cálculo dígito a dígito; obtiene 48,20% en ArithMark-3.
- Conocimiento factual y de sentido común de nivel básico: 59,68% en ARC-Easy, 43,74% en HellaSwag, 68,55% en PIQA.
- Razonamiento científico elemental: 32,68% en ARC-Challenge.
- Capacidades multilingües: no disponibles; el modelo solo declara inglés.
- Tool calling / function calling: no disponible (no es un modelo ajustado por instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; requeriría fine-tuning.
- Modo thinking, visión o audio: no disponibles.
- Eficiencia en secuencias largas: las capas Gated DeltaNet-2 mantienen estado recurrente de tamaño fijo, lo que abarata el coste por token a medida que crece la secuencia dentro de la ventana de 2.048 tokens.

## Casos de uso

- Fine-tuning para clasificación o etiquetado de texto: al ser un modelo base de 99M con licencia Apache 2.0, sirve como punto de partida barato para tareas downstream (análisis de sentimiento, detección de temas) donde no se necesita un modelo grande y se quiere entrenar en una sola GPU consumer.
- Prototipado rápido de pipelines de generación de texto: con 0,4 GB de pesos, se puede cargar y ejecutar en CPU o en GPU de gama baja para validar ideas antes de escalar a modelos mayores.
- Investigación en arquitecturas híbridas: su combinación de Gated DeltaNet-2, Block Attention Residuals y memoria de n-gramas lo convierte en un banco de pruebas para estudiar el efecto de cada componente con un coste de entrenamiento e inferencia muy contenido.
- Generación de texto en dispositivos con recursos limitados: el tamaño reducido y la atención lineal permiten desplegarlo en entornos con poca memoria, como aplicaciones de escritorio o sistemas embebidos con suficiente capacidad.
- Educación e investigación en modelos pequeños: útil para experimentos de destilación, ablaciones de tokenizador o estudios de eficiencia de datos, dado que se publica la composición exacta del corpus y las etapas de entrenamiento.
- Generación de datos sintéticos para entrenamiento: puede utilizarse para producir texto diverso en inglés que alimente pipelines de datos de modelos mayores, siempre que se valide la calidad de la salida.
- Experimentos de razonamiento aritmético: el tokenizador dígito a dígito y la puntuación en ArithMark-3 lo hacen adecuado para estudiar cómo los modelos pequeños manejan operaciones numéricas.

## Benchmarks y rendimiento

Todos los resultados son zero-shot con precisión normalizada por longitud. ARC, HellaSwag y PIQA se evaluaron con lm-eval 0.4.12; ArithMark-3 con el script oficial. Las puntuaciones de los modelos comparados proceden del Open SLM Leaderboard a fecha de 2026-10-22.

| Modelo | Params | ARC-Easy | ARC-Challenge | HellaSwag | PIQA | ArithMark-3 |
|---|---:|---:|---:|---:|---:|---:|
| **KLM 1.5** | 99,0M | 59,68% | 32,68% | 43,74% | 68,55% | 48,20% |
| KLM 1.1 | 88,1M | 44,36% | 25,17% | 33,65% | 64,80% | 35,80% |
| GPT-X3-150M | 149M | 59,64% | 31,31% | 46,16% | 71,33% | 50,90% |
| SmolLM2-135M | 135M | 58,63% | 29,69% | 43,22% | 68,44% | 39,20% |
| LFM-2.5-230M-Base | 230M | 59,72% | 34,98% | 39,29% | 63,38% | 36,60% |
| void.1 | 90,1M | 47,31% | 28,16% | 38,68% | 67,46% | 44,80% |

En el Open SLM Leaderboard, el Intelligence Index de KLM 1.5 es 30,26, lo que lo sitúa primero entre modelos de menos de 100M de parámetros y segundo entre los de menos de 150M.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 0,2 GB (99M parámetros). Con cuantización a 8 bits bajaría a unos 0,1 GB y a 4 bits a unos 0,05 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; una RTX 3060, RTX 4060 o incluso una GTX 1650 pueden ejecutarlo con holgura. Para lotes grandes o fine-tuning, una RTX 4090 o A100 ofrecen mayor throughput.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: la librería es transformers con custom_code, por lo que requiere cargar el código remoto del repositorio. No se han publicado pesos GGUF ni integraciones con llama.cpp u Ollama; vLLM y TGI dependerían de que se añada soporte para la arquitectura Gated DeltaNet-2, que no está confirmado.
- Latencia y throughput estimados: no disponibles. La atención lineal de las capas Gated DeltaNet-2 debería reducir el coste en secuencias largas frente a un transformer puro del mismo tamaño, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Licencia | Rendimiento relativo | Disponibilidad |
|---|---:|---:|---|---|---|
| KLM 1.5 | 99,0M | 2.048 | Apache 2.0 | Intelligence Index 30,26; primero sub-100M en Open SLM Leaderboard | Hugging Face, transformers con custom_code |
| SmolLM2-135M | 135M | No disponible en la información | Apache 2.0 | Ligeramente inferior en ARC-Easy y ArithMark-3, similar en HellaSwag y PIQA | Hugging Face, ampliamente soportado |
| GPT-X3-150M | 149M | No disponible en la información | No disponible | Superior en HellaSwag, PIQA y ArithMark-3; inferior en ARC-Challenge | Hugging Face |
| LFM-2.5-230M-Base | 230M | No disponible en la información | No disponible | Mejor en ARC-Challenge, peor en HellaSwag, PIQA y ArithMark-3 pese a tener más del doble de parámetros | Hugging Face |
| void.1 | 90,1M | No disponible en la información | No disponible | Inferior en todas las métricas reportadas | Hugging Face |

KLM 1.5 destaca por ofrecer un rendimiento cercano a modelos de 135-150M con solo 99M de parámetros, lo que se traduce en menor coste de inferencia. Su principal desventaja frente a SmolLM2-135M es el ecosistema: SmolLM2 cuenta con cuantizaciones GGUF y soporte en herramientas de despliegue, mientras que KLM 1.5 requiere custom_code y no tiene cuantizaciones publicadas.

## Limitaciones y advertencias

- Es un modelo base preentrenado, no ajustado por instrucciones ni con RLHF/DPO: no sigue instrucciones de forma fiable y puede generar texto incoherente o repetitivo si se usa como asistente sin fine-tuning.
- Solo soporta inglés; no se ha entrenado ni evaluado en otros idiomas.
- Contexto limitado a 2.048 tokens, muy por debajo de los estándares actuales para tareas de contexto largo.
- Riesgo de alucinación inherente a un modelo de 99M: su conocimiento factual es limitado y puede inventar datos con facilidad, especialmente en dominios especializados.
- Sesgos conocidos: no se documentan evaluaciones de sesgo en la información disponible; al entrenarse con corpus web (ClimbMix, TxT360-v2, UltraX, DCLM), es probable que herede sesgos presentes en esos datos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero el modelo se distribuye con `custom_code`, lo que obliga a confiar en el código remoto del repositorio al cargarlo con transformers.
- Para producción: la falta de cuantizaciones oficiales y de soporte confirmado en vLLM, llama.cpp u Ollama complica el despliegue eficiente; habría que validar el rendimiento real y la estabilidad del código personalizado.
- El tokenizador de 4.100 tokens es muy pequeño y descompone los números en dígitos, lo que puede afectar a la calidad en tareas que dependan de vocabulario especializado o de tokens poco frecuentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MinimaLabs/KLM-1.5
- KLM 1.1: https://huggingface.co/MinimaLabs/KLM-1.1
- Repositorio de flash-linear-attention (Gated DeltaNet-2): https://github.com/fla-org/flash-linear-attention
- Paper de Block Attention Residuals (Kimi Team, 2026): https://arxiv.org/abs/2603.15031
- Paper de Token-Superposition Training: https://arxiv.org/abs/2605.06546
- Open SLM Leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Dataset ArithMark-3.0: https://huggingface.co/datasets/AxiomicLabs/ArithMark-3.0
- GPT-X3-150M: https://huggingface.co/AxiomicLabs/GPT-X3-150M
- SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- LFM-2.5-230M-Base: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
- void.1: https://huggingface.co/dotlabs/void.1
- Dataset Nemotron-ClimbMix: https://huggingface.co/datasets/nvidia/Nemotron-ClimbMix
- Dataset TxT360-v2: https://huggingface.co/datasets/IFM/TxT360-v2
- Dataset UltraX-Preview: https://huggingface.co/datasets/openbmb/UltraX-Preview
- Dataset smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset dclm-baseline-1.0: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset Math-Reasoning: https://huggingface.co/datasets/IFM/Math-Reasoning
- Dataset dolma3_dolmino_mix-100B-1025: https://huggingface.co/datasets/allenai/dolma3_dolmino_mix-100B-1025
- Dataset Pretrain-Behaviors: https://huggingface.co/datasets/IFM/Pretrain-Behaviors
