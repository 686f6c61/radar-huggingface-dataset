# AlbinoRacoon/martin-1.3b-base

## Resumen

M.A.R.T.I.N.-1.3B es un modelo de lenguaje de 1.338.853.376 parámetros entrenado desde cero por AlbinoRacoon, un proyecto de investigación académica centrado en el ecosistema robótico ROS2 y en el esloveno como lengua de bajos recursos. Emplea una arquitectura transformer densa decoder-only de tipo Llama (20 capas, dimensión oculta 2048, 16 cabezas de atención, MLP de 5632, RoPE con theta 10.000 y embeddings atados) con una longitud de contexto de 4096 tokens. La inicialización es aleatoria: no se destiló ni continuó desde ningún otro modelo, lo que lo convierte en un ejercicio de preentrenamiento genuino bajo un presupuesto de cómputo reducido (unas 740 GPU-horas en NVIDIA A100 de 40 GB en el clúster HPC Vega del IZUM en Eslovenia).

El checkpoint publicado es intermedio: aproximadamente 31.800 millones de tokens procesados (paso 1.939.850) de los 100.000 millones previstos, es decir, en torno al 31,8 % del plan, detenido por motivos de coste antes de aplicar cualquier decaimiento de la tasa de aprendizaje. El corpus mezcla texto web en inglés (FineWeb-EDU, 50 %), código Python de StarCoderData (20 %), texto web esloveno de FineWeb-2 (14 %), Wikipedia traducida automáticamente al esloveno (8 %), subconjuntos Nemotron traducidos (3 %) y un corpus propio de ROS/ROS2 extraído de GitHub con licencias permisivas (5 %). El esloveno representa aproximadamente una cuarta parte de la mezcla.

Es relevante ahora porque documenta con transparencia un caso de preentrenamiento de un modelo pequeño y especializado en una lengua de bajos recursos y un dominio técnico concreto, con resultados honestos sobre sus límites. No es un asistente conversacional ni un modelo listo para producción: continúa texto y sirve como punto de partida para preentrenamiento continuado o ajuste por instrucciones, que es precisamente el paso que le falta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (arquitectura Llama) |
| Parámetros totales | 1.338.853.376 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | No disponible (pesos publicados en bfloat16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Esloveno (sl), inglés (en), Python y código ROS/ROS2 |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16, 2,7 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso decoder-only con la arquitectura Llama: 20 capas, tamaño oculto de 2048, 16 cabezas de atención, dimensión de MLP de 5632, RoPE con theta de 10.000 y embeddings atados entre entrada y salida. El tokenizador no se entrenó desde cero: se reutiliza el de `Qwen/Qwen3-Coder-30B-A3B-Instruct`, con 151.669 tokens y matriz de embeddings rellenada hasta 151.936. Los pesos se publican en bfloat16 safetensors.

El entrenamiento consumió aproximadamente 31.800 millones de tokens (paso 1.939.850) sobre un plan de 100.000 millones, con unas 740 GPU-horas en A100 de 40 GB (dos GPU por trabajo) en el HPC Vega del IZUM. La mezcla de datos combina FineWeb-EDU en inglés (50 %), el subconjunto Python de StarCoderData (20 %), FineWeb-2 `slv_Latn` (14 %), Wikipedia traducida automáticamente al esloveno del proyecto cjvt (8 %), subconjuntos Nemotron traducidos al esloveno (3 %) y un corpus propio de ROS/ROS2 extraído de repositorios GitHub con licencias Apache-2.0, MIT y BSD-2/3, sobremuestreado (5 %). No se documenta RLHF, DPO ni ninguna fase de ajuste por instrucciones; el checkpoint se guardó con la tasa de aprendizaje todavía alta y sin decaimiento. La configuración de generación incluida fija muestreo con `temperature=0.8`, `top_p=0.9` y `repetition_penalty=1.2`, porque la decodificación voraz tiende a repetir frases.

## Capacidades

- Continuación de texto gramatical en esloveno e inglés bajo muestreo; el texto se desvía del tema tras una o dos frases.
- Generación de sintaxis plausible en Python y ROS2, con uso más fiable de la API moderna de ROS2 frente a la API heredada `rospy` de ROS1 en comparación con modelos pequeños similares.
- Mayor fidelidad al lenguaje de programación solicitado en las pruebas informales del autor frente a TinyLlama, Qwen2.5-1.5B y GaMS-2B.
- Menor tasa de palabras inventadas en esloveno que los modelos comparables según las pruebas del autor.
- No soporta tool calling ni function calling de forma documentada.
- No soporta agentes ni razonamiento multi-paso de forma documentada.
- No dispone de modo de razonamiento (thinking), visión ni audio.
- No es un asistente conversacional: no está ajustado por instrucciones.

## Casos de uso

- Investigación sobre preentrenamiento de lenguas de bajos recursos: sirve como base reproducible para estudiar curvas de escalado y mezclas de datos en esloveno con un presupuesto académico, dado que el autor documenta paso, tokens y cómputo.
- Punto de partida para preentrenamiento continuado: el checkpoint intermedio permite retomar el entrenamiento con los 100.000 millones de tokens planificados o con dominios adicionales, aprovechando que los pesos son Apache-2.0 y el formato es safetensors estándar de transformers.
- Ajuste por instrucciones (SFT): al ser un modelo base sin alineación, es un candidato para experimentos de instruction tuning en esloveno, donde escasean los modelos pequeños ajustados.
- Estudio de generación de código ROS2: útil para analizar qué sintaxis y APIs produce un modelo pequeño entrenado con un 5 % de corpus robótico, aunque los programas generados no son fiables y deben tratarse como no verificados.
- Evaluación comparativa de modelos pequeños: sirve como línea base en experimentos académicos que comparen modelos de 1-2B en tareas de código y lenguas eslavas.
- Docencia y experimentación con transformers: su tamaño (2,7 GB en bfloat16) y su API estándar permiten ejecutarlo en entornos de laboratorio para demostrar el ciclo completo de preentrenamiento y generación.
- Análisis de sesgos y alucinación en modelos pequeños: el autor documenta fabricación de hechos, lo que lo hace útil como caso de estudio controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica que las evaluaciones provienen de una tesis de máster, son pequeñas e informales y ninguna constituye un benchmark riguroso. Los datos cualitativos disponibles son:

| Evaluación | Resultado |
|---|---|
| Tareas generales (8 tareas no ROS: hechos, aritmética, lógica de código, seguimiento de instrucciones) | Peor o entre los peores de los cuatro modelos pequeños comparados en 7 de 8 tareas |
| Lenguaje de programación solicitado (8 prompts) | Más fiable que TinyLlama, Qwen2.5-1.5B y GaMS-2B |
| Uso de API ROS2 moderna frente a `rospy` | Más fiable que los modelos comparables |
| Palabras inventadas en esloveno | Menos que los modelos comparables |
| Nodos ROS2 estructuralmente completos | No logrado en las pruebas formales; tampoco por los otros modelos pequeños |
| Arena A/B ciega frente a GaMS-2B (4 votantes) | 7 victorias, 9 derrotas, 9 empates, 4 omitidos (muestra muy pequeña, solo indicativa) |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 2,7 GB solo para pesos, más overhead de activaciones y caché KV; con 4096 tokens de contexto el consumo total se mantiene por debajo de unos 6-8 GB en la práctica.
- GPU recomendadas: A100 40 GB (la usada en entrenamiento), H100, o cualquier GPU con al menos 8 GB de VRAM para inferencia en bfloat16 o float16.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; también en GPUs de 8 GB con cuantización de 8 bits.
- Opciones de despliegue: transformers (soporte nativo, `text-generation-inference` y endpoints compatibles según los tags del repositorio). No se documentan pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión previa por parte del usuario.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| M.A.R.T.I.N.-1.3B | 1,34B | 4096 | sl, en, código | Apache-2.0 | Checkpoint intermedio, sin ajuste por instrucciones |
| TinyLlama | ~1,1B | 2048 | en (principalmente) | Apache-2.0 | Base y variantes ajustadas |
| Qwen2.5-1.5B | 1,5B | 32.768 | multilingüe | Apache-2.0 (mayoría de variantes) | Base e instruct |
| GaMS-2B | ~2B | no disponible | esloveno | no disponible | Modelo esloveno comparado en la arena A/B del autor |

Según el autor, M.A.R.T.I.N.-1.3B supera a estos tres modelos en fidelidad al lenguaje de programación solicitado, uso de la API ROS2 moderna y menor invención de palabras en esloveno, pero es peor o de los peores en 7 de 8 tareas generales. La comparación de rendimiento cuantitativo con benchmarks estándar no está disponible.

## Limitaciones y advertencias

- Modelo subentrenado: solo ~31,8 % de los tokens planificados y guardado con la tasa de aprendizaje alta y sin decaimiento.
- No es un asistente: no está ajustado por instrucciones y no debe usarse para preguntas y respuestas factuales.
- Alucinación elevada: el texto es fluido y gramatical, pero el contenido se inventa con frecuencia; la fluidez en esloveno no implica precisión factual.
- Deriva temática tras una o dos frases y tendencia a la repetición con decodificación voraz.
- Generación de código no fiable: produce sintaxis plausible pero no programas completos ni correctos; el código generado debe tratarse como no verificado.
- No apto para uso en producción, aplicaciones de seguridad crítica ni control de robots.
- Sesgos no documentados formalmente, pero heredados de los corpus web (FineWeb-EDU, FineWeb-2) y de las traducciones automáticas al esloveno.
- Licencia de pesos Apache-2.0, pero los datasets de origen conservan sus propios términos (por ejemplo ODC-By para FineWeb y los términos de StarCoderData); el usuario debe verificar la compatibilidad de su uso.
- El tokenizador procede de Qwen3-Coder-30B-A3B-Instruct y no se entrenó desde cero, lo que puede introducir desajustes con el vocabulario esloveno.
- Las evaluaciones provienen de una tesis de máster, son informales y con muestras muy pequeñas (4 votantes en la arena A/B).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlbinoRacoon/martin-1.3b-base
- Dataset FineWeb-EDU: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset StarCoderData: https://huggingface.co/datasets/bigcode/starcoderdata
- Tokenizador base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Wikipedia traducida al esloveno (cjvt): https://huggingface.co/datasets/cjvt/Wikipedia-translated
- HPC Vega (IZUM, Eslovenia): https://www.izum.si/en/vega/
