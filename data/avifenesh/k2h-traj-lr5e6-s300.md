# Avifenesh/k2h-traj-lr5e6-s300

## Resumen

k2h-traj-lr5e6-s300 es un checkpoint de investigación publicado por Avifenesh (Avi Fenesh) el 4 de noviembre de 2026. Se trata de un ajuste fino por continuación de preentrenamiento (continued pretraining) sobre el modelo base IFM/K2-Horizon-MoVA-36B-A4B, orientado a mejorar las capacidades del modelo en ingeniería de sistemas de inferencia de LLM y en ingeniería de sistemas ML. No es un candidato a release: el propio autor lo etiqueta como research checkpoint.

El modelo conserva la arquitectura, el tokenizador y la plantilla de chat del modelo base: un transformer con mezcla de expertos (MoE) de 36B parámetros totales y aproximadamente 4B parámetros activos por token. Este checkpoint concreto tiene 37.444.792.020 parámetros según los pesos en safetensors, lo que incluye los expertos enrutados aunque solo se active una fracción en cada paso. El repositorio ocupa 74,9 GB en bf16.

Su relevancia es doble. Por un lado, documenta una receta de continuación de preentrenamiento con resultados medidos y fallos conservados: 300 pasos con secuencias de 65.536 tokens y una tasa de aprendizaje de 5e-6 que mantiene las habilidades generales mientras mejora el rendimiento en código (HumanEval pasa de 53,1 a 67,1 pass@1). Por otro, ejemplifica un caso de estudio sobre cómo tasas de aprendizaje más agresivas (1,5e-5) rompen el formato de respuesta, lo que resulta útil para quien planifique ajustes similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), arquitectura del base K2-Horizon-MoVA-36B-A4B |
| Parametros totales | 37.444.792.020 |
| Parametros activos | Aproximadamente 4B (según model card del base) |
| Longitud de contexto | 65.536 tokens en entrenamiento; recuperación de passkey verificada de 16k a 131k |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bf16) |
| Libreria | transformers (requiere `trust_remote_code=True`) |
| Modelo base | IFM/K2-Horizon-MoVA-36B-A4B (finetune) |
| Tamano del repositorio | 74,9 GB |
| Descargas en Hugging Face | 23 |
| Fecha de publicacion | 2026-11-04 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer con mezcla de expertos de 36B parámetros totales y unos 4B activos por token, con atención de contexto largo. El checkpoint no introduce cambios estructurales, de tokenizador ni de plantilla de chat; es un ajuste de pesos sobre los pesos publicados del base. La recuperación de passkey se mantiene en 5/5 aciertos en todas las longitudes probadas entre 16k y 131k tokens, igual que en el release.

El entrenamiento se realizó con el trainer xLLM sobre FSDP2, en bf16, con 3 GPUs y el estado del optimizador descargado a memoria del host. Se ejecutaron 300 pasos con longitud de secuencia de 65.536 tokens, batch de 1 por GPU y acumulación de gradiente de 4, lo que supone aproximadamente 786.000 tokens por paso y unos 236 millones de tokens en total. El optimizador fue AdamW con beta1 0.9, beta2 0.95, weight decay 0.06, recorte de gradiente 1.0, tasa de aprendizaje 5e-6 con 20 pasos de calentamiento y programación constante posterior.

La mezcla de datos se compone en un 44,5% de porciones limpias del corpus Avifenesh/k2h-corpus-domain-clean (repositorios de inferencia y kernels, Linux, historial de commits) más discusiones de pull requests y material de ingeniería no publicado, y un 55,5% de replay verificado por script en texto plano del dataset Avifenesh/k2h-replay-verified (47,7% replay-synth-verified y 7,8% replay-math-verified). El objetivo del replay es preservar las habilidades generales mientras se especializa el modelo en el dominio. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional con plantilla de chat heredada del modelo base.
- Razonamiento con modo de razonamiento activable (reasoning on), empleado en las evaluaciones de IFEval y GSM8K.
- Generación de código: mejora sustancial en HumanEval y MBPP respecto al release.
- Razonamiento matemático: GSM8K en modo chat y en 5-shot.
- Conocimiento general y respuesta a preguntas (MMLU, ARC-Challenge, BoolQ).
- Contexto largo: recuperación de información verificada hasta 131k tokens.
- Especialización en ingeniería de sistemas de inferencia y ML: repositorios de kernels, Linux, historial de commits y discusiones de pull requests.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión o audio: no disponible; el modelo es de text-generation.

## Casos de uso

- Asistencia en ingeniería de kernels y código de bajo nivel: el modelo se ha entrenado con repositorios de kernels e inferencia, y su mejora en HumanEval (67,1 pass@1) y MBPP (70,8 pass@1) lo hace adecuado para generar y revisar código CUDA y de sistemas en pipelines internos de desarrollo.
- Revisión de pull requests técnicos: la mezcla de datos incluye discusiones de PR y material de ingeniería, por lo que puede resumir diffs, señalar riesgos y redactar comentarios de revisión en repositorios de infraestructura.
- Análisis de historial de commits y Linux: con contexto de hasta 65k tokens en entrenamiento y recuperación verificada hasta 131k, puede procesar secuencias largas de commits o ficheros de configuración para responder preguntas sobre la evolución de un repositorio.
- Investigación sobre recetas de ajuste fino: sirve como referencia reproducible para estudiar el efecto de la tasa de aprendizaje en la estabilidad del formato de respuesta, comparando este checkpoint con brazos a 1,5e-5.
- Evaluación comparativa de modelos MoE: útil como punto de comparación en estudios sobre preservación de habilidades generales mediante replay verificado durante la especialización de dominio.
- Prototipado de asistentes técnicos especializados: al mantener las habilidades generales del base (MMLU 77,0, GSM8K 96,3 en chat), puede desplegarse en entornos de desarrollo para consultas mixtas de código, matemáticas y conocimiento general.
- Experimentación en contexto largo: para tareas de recuperación de información en documentos extensos, dado el rendimiento 5/5 en passkey retrieval de 16k a 131k.

## Benchmarks y rendimiento

Evaluación emparejada por pregunta contra el release, con los mismos prompts y muestreo. El valor p corresponde a la prueba de McNemar.

| Tarea | Release | Step 300 | p |
|---|---:|---:|---:|
| IFEval prompt-strict (reasoning on, 2 ejecuciones agrupadas) | 83,7 | 82,0 | 0,16 |
| GSM8K chat, reasoning on | 96,6 | 96,3 | 0,52 |
| GSM8K 5-shot | 90,2 | 90,5 | 0,76 |
| MMLU | 77,3 | 77,0 | 0,51 |
| ARC-Challenge | 57,6 | 56,9 | 0,28 |
| BoolQ | 88,4 | 88,3 | 0,75 |
| MBPP pass@1 | 65,2 | 70,8 | 0,001 |
| HumanEval pass@1 | 53,1 | 67,1 | 0,0002 |
| Held-out PR NLL (menor es mejor) | 1,520 | 1,319 | no disponible |

Recuperación de passkey de 16k a 131k: 5/5 en todas las longitudes, igual que el release.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 75 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un nodo con al menos 80 GB por GPU o reparto multi-GPU.
- GPU recomendadas: H100 (80 GB) o A100 (80 GB) para bf16 en una sola GPU; para cuantización a 8 bits o 4 bits serían necesarias GPU con menos memoria, aunque no se publican pesos cuantizados en el repositorio.
- GPU de consumo: no cabe en bf16 en una RTX 4090 (24 GB). Sería necesario cuantizar (por ejemplo, a 4 bits, alrededor de 19-20 GB de pesos) y verificar compatibilidad con el código personalizado del modelo, algo no documentado.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El modelo es MoE con unos 4B parámetros activos, lo que en teoría reduce el coste de cómputo por token frente a un denso de 36B, pero no se publican mediciones.
- Entrenamiento: el autor usó 3 GPUs con FSDP2 y estado del optimizador en memoria del host, lo que da una idea del perfil de memoria necesario para réplicas del ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Avifenesh/k2h-traj-lr5e6-s300 | 37,4B | ~4B | 65k entrenamiento; 131k verificado | Apache 2.0 | Checkpoint de investigación, 23 descargas |
| IFM/K2-Horizon-MoVA-36B-A4B | 36B | ~4B | No disponible | No disponible | Modelo base del que deriva; sirve como referencia directa |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de otros modelos comparables en la información proporcionada |

La comparación más directa y fiable es contra el propio modelo base, ya que las evaluaciones del autor son emparejadas contra el release. Frente a él, este checkpoint mejora HumanEval (+14,0 puntos), MBPP (+5,6) y la NLL en PRs retenidos (1,520 a 1,319), y mantiene dentro del ruido el resto de tareas generales.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un release candidate; el autor lo declara explícitamente. No debería usarse como modelo de producción sin validación adicional.
- Las tasas de aprendizaje más altas (1,5e-5) rompieron el formato de respuesta en los experimentos del autor: un brazo terminaba turnos con el token de fin de documento y otro dejaba de cerrar el bloque de razonamiento. A 5e-6 no aparecieron, pero el formato debe verificarse en despliegues concretos.
- Riesgo de alucinación no cuantificado; no se publican evaluaciones de veracidad ni de tasa de alucinación.
- Idiomas soportados no disponibles; no se documenta cobertura multilingüe, por lo que el comportamiento fuera del inglés es incierto.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La ventana de contexto entrenada es de 65.536 tokens; el rendimiento en passkey a 131k se verificó, pero no se garantiza calidad general más allá de la longitud de entrenamiento.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar ese código antes de desplegar.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base cuyas condiciones no se detallan en la información disponible, conviene verificar la licencia del base antes de un uso comercial.
- El modelo está especializado en un dominio estrecho (inferencia y sistemas ML); fuera de ese dominio su comportamiento es el del base, sin garantías adicionales.
- Solo 23 descargas y 0 likes en el momento de la ficha: ecosistema de validación muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Avifenesh/k2h-traj-lr5e6-s300
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Dataset de dominio limpio: https://huggingface.co/datasets/Avifenesh/k2h-corpus-domain-clean
- Dataset de replay verificado: https://huggingface.co/datasets/Avifenesh/k2h-replay-verified
- Sitio del autor (Avi Fenesh, laboratorio tiyuvta): https://avifenesh.ai/
