# 96kevinli29/Qwen3-8B-SFT-Math-Multilingual

## Resumen

Qwen3-8B-SFT-Math-Multilingual es un ajuste fino supervisado (SFT) de Qwen/Qwen3-8B, desarrollado por el usuario 96kevinli29, orientado a que el modelo razone matematicamente en el mismo idioma en el que se plantea el problema. El problema que aborda es concreto: el Qwen3-8B original tiende a razonar en ingles aunque se le pregunte en otro idioma, lo que degrada la calidad de la respuesta entregada en lenguas no inglesas. Este checkpoint busca corregir ese comportamiento mediante entrenamiento en seis idiomas (ingles, chino, espanol, frances, arabe y ruso).

El modelo mantiene la arquitectura y el tamano del base: un transformer causal de 8.190.735.360 parametros (8B densos, sin mezcla de expertos), con licencia Apache 2.0 y pesos en safetensors. Se trata de la replicacion a 8B de la etapa II del trabajo *What Does Post-Training Change in Multilingual Reasoning?* (arXiv:2609.37104), y corresponde al checkpoint de la epoca 1 del entrenamiento.

Es relevante porque demuestra que el SFT multilingue puede elevar la tasa de razonamiento en el idioma solicitado del 26,9% al 99,7% en respuestas no inglesas, a costa de una caida de precision (78,1% a 66,0%) y de un aumento de respuestas que no terminan (5,8% a 18,2%). Es un modelo de investigacion, no un modelo listo para produccion sin mitigaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (derivado de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (presupuesto de evaluacion: 24.576 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en, zh, es, fr, ar, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B, un transformer causal denso de 8B parametros, y se somete a un ajuste fino supervisado de parametros completos (full-parameter SFT), no a LoRA ni a adaptadores. El entrenamiento se realiza sobre 56.307 trazas largas de chain-of-thought matematico en seis idiomas, provenientes del dataset 96kevinli29/SFT-Math-Multilingual-56k, que a su vez se apoya en open-r1/OpenR1-Math-220k. El checkpoint publicado corresponde a la epoca 1.

La innovacion tecnica no esta en la arquitectura, sino en el objetivo de entrenamiento: forzar que la traza de razonamiento visible se escriba en el idioma del enunciado, no solo la respuesta final. No se ejecuto ninguna etapa de RL a 8B (a diferencia de las variantes de 4B con PPO), por lo que el bucle repetitivo que introduce el SFT persiste. El modelo se evalua con un prompt totalmente localizado: instruccion, problema y formato de respuesta en el idioma objetivo.

## Capacidades

- Generacion de texto y razonamiento matematico de competicion (AIME, AMC) con cadenas de pensamiento largas (mediana de 5.562 a 8.382 tokens segun idioma).
- Razonamiento multilingue efectivo: escribe la traza en el idioma solicitado en el 99,7% de las respuestas no inglesas.
- Soporte de seis idiomas: ingles, chino, espanol, frances, arabe y ruso.
- Generacion conversacional (pipeline text-generation) compatible con transformers y text-generation-inference.
- Capacidad de muestreo multiple (best-of-16) para mejorar la entrega de respuestas correctas.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Tutoria matematica en espanol: el modelo puede resolver problemas paso a paso redactando toda la explicacion en espanol, lo que lo hace adecuado para plataformas educativas dirigidas a estudiantes hispanohablantes que necesitan ver el razonamiento en su idioma.
- Evaluacion comparativa de razonamiento multilingue: sirve como checkpoint de referencia en investigacion sobre si el post-entrenamiento cambia el idioma del razonamiento, con protocolo reproducible sobre AIME-2026 y AMC-2023.
- Generacion de soluciones en arabe y ruso para entornos educativos: con una tasa de razonamiento en el idioma solicitado del 99,9% y 100% respectivamente, es util donde el ingles no es viable.
- Investigacion sobre bucles de repeticion: al presentar un 18,2% de respuestas no terminadas en lenguas no inglesas, es un caso de estudio para tecnicas de mitigacion de looping (penalizaciones, truncado, RL posterior).
- Best-of-16 en pipelines de generacion: con J@16 del 86,3% en lenguas no inglesas, puede emplearse en sistemas que muestrean varias respuestas y seleccionan la mejor mediante un verificador.
- Base para una etapa posterior de RL: al ser el checkpoint de la etapa II, sirve como punto de partida para PPO con recompensas que combinen correccion y adherencia al idioma.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre 70 problemas de competicion (30 AIME-2026 + 40 AMC-2023) planteados en seis idiomas, 16 muestras por problema a temperatura 0,7 y presupuesto de 24.576 tokens (1.120 respuestas por idioma).

| Metrica (media no inglesa, 5 idiomas) | Qwen3-8B original | Tras SFT |
|---|---|---|
| Respuesta correcta (C) | 78,1% | 66,0% |
| Razonamiento en el idioma solicitado (L) | 26,9% | 99,7% |
| No finaliza (1 − T) | 5,8% | 18,2% |
| Entregada, una muestra (J@1) | 19,6% | 65,1% |
| Entregada, mejor de 16 (J@16) | 30,6% | 86,3% |
| Longitud mediana de respuesta (tokens) | 6.829 | 7.172 |

Desglose por idioma de este checkpoint:

| Idioma | C | L | 1 − T | J@1 | J@16 | Tokens medianos |
|---|---|---|---|---|---|---|
| Ingles | 74,8% | 100,0% | 2,9% | 74,7% | 94,3% | 5.562 |
| Chino | 64,8% | 99,7% | 18,6% | 64,4% | 85,7% | 5.744 |
| Espanol | 68,5% | 99,8% | 9,2% | 68,4% | 88,6% | 6.548 |
| Frances | 67,3% | 98,9% | 13,5% | 67,1% | 84,3% | 7.090 |
| Arabe | 62,0% | 99,9% | 29,3% | 60,2% | 85,7% | 8.382 |
| Ruso | 67,5% | 100,0% | 20,4% | 65,2% | 87,1% | 8.096 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16,4 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- Cuantizacion a 8 bits: en torno a 8-9 GB de pesos; a 4 bits, en torno a 4-5 GB (estimaciones teoricas, no publicadas por el autor).
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S para despliegue con concurrencia.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto moderado; en RTX 3090/4080 (16-24 GB) requiere cuantizacion para contextos largos.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta tgi en el repo) y endpoints compatibles; llama.cpp/Ollama no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles. Notese que las respuestas medianas superan los 5.500 tokens, lo que implica coste de generacion elevado por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento en idioma solicitado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-SFT-Math-Multilingual (este) | 8B densos | no disponible | 99,7% (no ingles) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B (base) | 8B densos | no disponible | 26,9% (no ingles) | Apache 2.0 | Hugging Face |
| 96kevinli29/Qwen3-4B-SFT-Math-Multilingual | 4B densos | no disponible | no disponible | Apache 2.0 | Hugging Face |
| 96kevinli29/Qwen3-4B-MathRL-Multilingual-Gated | 4B densos | no disponible | no disponible | Apache 2.0 | Hugging Face |

La comparativa directa de precision con el base esta en la tabla de benchmarks: el SFT gana en adherencia al idioma y en entrega best-of-16, pero pierde en precision bruta y en tasa de finalizacion.

## Limitaciones y advertencias

- Caida de precision: la exactitud en lenguas no inglesas baja del 78,1% al 66,0% respecto al Qwen3-8B original.
- Bucles de repeticion: el 18,2% de las respuestas no inglesas no terminan (hasta el 29,3% en arabe); no se ejecuto RL a 8B para corregirlo.
- Sesgos: no se documentan analisis de sesgo; al derivar de Qwen3-8B hereda los sesgos del base y de los datasets de matematicas empleados.
- Alucinacion: no se reportan evaluaciones de factualidad; el modelo esta especializado en matematicas y puede degradarse en otras tareas.
- Alcance limitado: solo seis idiomas y dominio matematico; no hay evidencia de rendimiento en codigo, agentes o tool calling.
- Coste de inferencia: respuestas medianas de 5.500 a 8.400 tokens encarecen el despliegue y exigen contextos amplios.
- Estado de investigacion: checkpoint de epoca 1, sin validacion independiente; los benchmarks son declarados por el autor y no estan verificados.
- Licencia Apache 2.0 permite uso comercial, pero sin garantias del autor sobre el comportamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/96kevinli29/Qwen3-8B-SFT-Math-Multilingual
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Paper: https://arxiv.org/abs/2609.37104
- Dataset SFT: https://huggingface.co/datasets/96kevinli29/SFT-Math-Multilingual-56k
- Dataset SFT (43k): https://huggingface.co/datasets/96kevinli29/SFT-Math-Multilingual-43k
- Dataset de evaluacion: https://huggingface.co/datasets/96kevinli29/Multilingual-Math-Reasoning-Eval
- Dataset de prompts RL: https://huggingface.co/datasets/96kevinli29/DAPO-Math-Multilingual-6Lang
- Dataset base: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Variante 4B SFT: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-Multilingual
- Variante 4B RL gated: https://huggingface.co/96kevinli29/Qwen3-4B-MathRL-Multilingual-Gated
- Variante 4B RL additive: https://huggingface.co/96kevinli29/Qwen3-4B-MathRL-Multilingual-Additive
