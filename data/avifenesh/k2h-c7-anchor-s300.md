# Avifenesh/k2h-c7-anchor-s300

## Resumen

K2H c7-anchor step 300 es un checkpoint de investigación publicado por Avi Fenesh (Avifenesh) el 5 de noviembre de 2026. Se trata de un ajuste por continuación de preentrenamiento (*continued pretraining*) sobre el modelo base IFM/K2-Horizon-MoVA-36B-A4B, una arquitectura Mixture of Experts (MoE) de 36B parámetros totales con aproximadamente 4B activos. El objetivo del estudio es especializar el modelo en ingeniería de sistemas de inferencia LLM y de sistemas ML (repositorios de kernels, Linux, historial de commits, discusiones de pull requests) sin degradar su comportamiento conversacional original.

La innovación metodológica principal es el "anclaje de release" (*release anchor*): durante el entrenamiento se añade una penalización KL truncada y con umbral (*hinged KL*) contra el modelo original congelado, aplicada únicamente sobre los tokens de chat. Esto permite conservar el comportamiento conversacional del modelo base mientras se incorpora el conocimiento de dominio. El resultado es el mejor checkpoint del estudio hasta la fecha: mejora la adherencia a instrucciones (IFEval) y el rendimiento en código (MBPP, HumanEval) respecto al modelo base, a costa de una ligera pérdida en MMLU.

El modelo se distribuye con licencia Apache 2.0, pesos en bf16 safetensors y requiere `trust_remote_code=True`. El autor lo describe explícitamente como un checkpoint de investigación, no como un candidato a release. Con solo 24 descargas en el momento de la consulta, es un artefacto de nicho orientado a investigadores interesados en técnicas de continuación de preentrenamiento con preservación de capacidades.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sobre transformer; misma arquitectura que IFM/K2-Horizon-MoVA-36B-A4B |
| Parámetros totales | 37.444.792.020 (≈37,4B) |
| Parámetros activos | ≈4B (según model card del base) |
| Longitud de contexto | 65.536 tokens (longitud de secuencia de entrenamiento); recuperación validada hasta 131k |
| Tipos de cuantización | No disponible (pesos publicados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura, el tokenizador y la plantilla de chat de IFM/K2-Horizon-MoVA-36B-A4B: un transformer con mezcla de expertos de 36B parámetros totales y unos 4B activos por token. El ajuste se realizó con el entrenador xLLM sobre FSDP2 en bf16, con 3 GPU y el estado del optimizador descargado a memoria host. Se ejecutaron 300 pasos con longitud de secuencia de 65.536 tokens, batch de 1 por GPU y acumulación de gradiente de 4, lo que supone aproximadamente 786.000 tokens por paso y unos 236 millones de tokens en total. El optimizador fue AdamW (beta1 0.9, beta2 0.95, weight decay 0.06, gradient clip 1.0) con tasa de aprendizaje 5e-6, 20 pasos de warmup y programación constante posterior.

La mezcla de datos se compone de un 40% de porciones limpias de dominio (repositorios de inferencia y kernels, Linux, historial de commits, discusiones de PR y material de ingeniería no publicado), un 50% de *replay* verificado por script en texto plano y un 10% de chat verificado (5% de razonamiento, 3% de instrucciones y 2% de chat real), estos últimos sin entrenamiento por entropía cruzada. La técnica destacable es el anclaje de release: sobre los tokens de chat se añade a la pérdida una KL truncada `sum max(0, KL(release || model) - tau)` con tau 0.05 y coeficiente 1, calculada sobre los 64 tokens más probables del modelo original más un bucket de cola. Así, el modelo conserva el comportamiento conversacional del release sin entrenarse nunca sobre esas respuestas. La decodificación recomendada es temperatura 1.0 y top_p 0.95.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat heredada del modelo base.
- Razonamiento con modo *thinking* (evaluado con "reasoning on" en IFEval y GSM8K).
- Generación de código, con mejora sustancial en MBPP y HumanEval respecto al release.
- Conocimiento especializado en ingeniería de sistemas de inferencia LLM: kernels, Linux, historial de commits y discusiones de pull requests.
- Razonamiento matemático (GSM8K, tanto en modo chat como en 5-shot).
- Recuperación de información en contexto largo (*passkey retrieval*) validada de 16k a 131k tokens, con 5/5 aciertos en todas las longitudes.
- Capacidad de continuación de preentrenamiento preservando el comportamiento conversacional del modelo original gracias al anclaje KL.
- Soporte de *tool calling*, agentes o multimodalidad: no disponible en la información proporcionada.

## Casos de uso

- Investigación en continuación de preentrenamiento: el checkpoint sirve como referencia reproducible de la técnica de anclaje KL truncada para estudiar cómo especializar un modelo en un dominio sin perder capacidades conversacionales, comparándolo con la receta simple publicada en paralelo.
- Asistencia en ingeniería de kernels e inferencia LLM: el modelo ha visto repositorios de kernels, Linux y discusiones de PR, por lo que puede emplearse para explicar código de bajo nivel, proponer optimizaciones o resumir historial de commits en un repositorio de sistemas.
- Generación de código en pipelines internos: con 66,5 en HumanEval y 71,4 en MBPP pass@1, es adecuado para autocompletar funciones, escribir tests o revisar parches en entornos de desarrollo, siempre con validación humana.
- Análisis de contexto largo: su recuperación fiable hasta 131k tokens permite procesar repositorios completos, hilos de revisión de código o documentación extensa en una sola pasada.
- Evaluación comparativa de recetas de ajuste: al compartir prompts y muestreo con el release y con la receta simple, facilita experimentos controlados sobre preservación de capacidades (KL a chat, NLL en PR retenidos).
- Estudio de alineación y deriva de comportamiento: la métrica de KL medio frente al release en texto de chat permite cuantificar cuánto se desvía un ajuste de dominio del modelo original, útil para investigar métodos de regularización.
- Prototipado de asistentes técnicos especializados: para equipos que necesitan un asistente centrado en sistemas ML, el modelo ofrece conocimiento de dominio con un comportamiento conversacional cercano al base, aunque no debe usarse en producción sin evaluación adicional.

## Benchmarks y rendimiento

Evaluación emparejada por pregunta contra el release (mismos prompts y muestreo), con p de McNemar entre paréntesis. "Receta simple" es la misma ejecución sin anclaje.

| Tarea | Release | Receta simple | Este modelo |
|---|---:|---:|---:|
| IFEval prompt-strict (reasoning on, 2 ejecuciones agrupadas) | 83,7 | 82,0 | 85,3 (p=0,18) |
| GSM8K chat, reasoning on | 96,6 | 96,3 | 96,4 (p=0,82) |
| GSM8K 5-shot | 90,2 | 90,5 | 89,6 (p=0,49) |
| MMLU | 77,3 | 77,0 | 76,4 (p=0,03) |
| ARC-Challenge | 57,6 | 56,9 | 57,7 (p=1,0) |
| BoolQ | 88,4 | 88,3 | 87,9 (p=0,10) |
| MBPP pass@1 | 65,2 | 70,8 | 71,4 (p=0,0004) |
| HumanEval pass@1 | 53,1 | 67,1 | 66,5 (p=0,0003) |
| NLL en PR retenidos (menor es mejor) | 1,520 | 1,319 | 1,322 |

Frente a la receta simple, IFEval es 3,3 puntos superior (emparejado, p≈0,005) con la misma ganancia de dominio. MMLU queda 0,9 puntos por debajo del release, coste atribuido al anclaje con esta longitud de entrenamiento. La KL media frente al release en texto de chat retenido es aproximadamente la mitad que la de la receta simple (instruct 0,006 frente a 0,011; chat real 0,018 frente a 0,041; razonamiento 0,005 frente a 0,014), mientras que en matemáticas, texto sintético y PR permanece sin cambios.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: el repositorio ocupa 74,9 GB, por lo que se necesitan al menos 2 GPU de 48 GB (A6000, L40S) o una H100 de 80 GB para cargar los pesos completos con margen para KV cache.
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16 sin cuantizar; configuraciones multi-GPU con tensor parallelism para mayor throughput.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bf16; requeriría cuantización, que no está documentada en la información disponible.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada; vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. El entrenamiento se realizó en 3 GPU con FSDP2 y estado del optimizador en host, lo que da una idea del perfil de memoria, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | IFEval | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| K2H c7-anchor s300 (este) | 37,4B totales / ≈4B activos | 65.536 | 85,3 | 66,5 | Apache 2.0 | Hugging Face |
| IFM/K2-Horizon-MoVA-36B-A4B (base) | 36B totales / ≈4B activos | No disponible | 83,7 | 53,1 | No disponible en la información | Hugging Face |
| Avifenesh/k2h-traj-lr5e6-s300 (receta simple) | 37,4B totales / ≈4B activos | 65.536 | 82,0 | 67,1 | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos del mismo estudio, ya que la información proporcionada no incluye otros modelos MoE de tamaño similar con los que contrastar. Frente al base, este checkpoint gana 1,6 puntos en IFEval y 13,4 en HumanEval, y pierde 0,9 en MMLU. Frente a la receta simple, gana 3,3 en IFEval con HumanEval prácticamente idéntico (66,5 frente a 67,1) y una KL a chat aproximadamente la mitad.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor indica explícitamente que no es un candidato a release y no debe tratarse como tal en producción.
- Regresión en MMLU: 0,9 puntos por debajo del release (76,4 frente a 77,3, p=0,03), coste del anclaje a esta longitud de entrenamiento.
- Entrenamiento corto: solo 300 pasos y unos 236 millones de tokens, insuficiente para consolidar conocimiento de dominio extenso; los resultados deben interpretarse como señal, no como especialización madura.
- Idiomas soportados no documentados: no se puede asumir cobertura multilingüe más allá de la del modelo base.
- Riesgo de alucinación: no evaluado en la información disponible; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en código de bajo nivel.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o seguridad.
- Cuantizaciones no disponibles: no hay GGUF ni versiones cuantizadas publicadas, lo que limita el despliegue en hardware de consumo.
- Requiere `trust_remote_code=True`: implica ejecutar código del repositorio, con el riesgo de seguridad asociado.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigación la idoneidad para producción no está validada.
- Dependencia del modelo base: cualquier restricción o cambio en IFM/K2-Horizon-MoVA-36B-A4B afecta a este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Avifenesh/k2h-c7-anchor-s300
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Receta simple (sin anclaje): https://huggingface.co/Avifenesh/k2h-traj-lr5e6-s300
- Dataset de dominio limpio: https://huggingface.co/datasets/Avifenesh/k2h-corpus-domain-clean
- Dataset de replay verificado: https://huggingface.co/datasets/Avifenesh/k2h-replay-verified
- Dataset de chat verificado: https://huggingface.co/datasets/Avifenesh/k2h-chat-reasoning-verified
- GitHub del autor: https://github.com/avifenesh
- Perfil de investigación del autor: https://github.com/avifenesh/avifenesh
- Notas de investigación: https://avifenesh.ai/research
- Artículos: https://avifenesh.ai/writing
