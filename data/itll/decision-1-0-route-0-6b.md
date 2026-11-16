# ITLL/Decision-1.0-Route-0.6B

## Resumen

Decision-1.0-Route-0.6B es un modelo de clasificación zero-shot y enrutamiento semántico desarrollado por ITLL, afinado a partir de vllm-sr/Decision-1.0-Kai-0.6B. Su propósito es servir como componente de decisión en tiempo de petición para vLLM Semantic Router, emitiendo señales sobre el tráfico de un LLM: área temática de la consulta, modalidad de salida esperada, retroalimentación del usuario, detección de ataques de prompt, peticiones dañinas, doce categorías de peligro, necesidad de verificación factual, presencia de datos personales, necesidad de herramientas y, sobre respuestas, afirmaciones no respaldadas.

El modelo tiene 0,6B parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0. No es un modelo generativo de propósito general, sino un clasificador especializado que transforma el enrutamiento de peticiones en un conjunto de preguntas de elección (Choice) y de criterios binarios (Noul). Esta especialización permite integrarlo en pipelines de inferencia para tomar decisiones de política sin invocar un LLM completo.

La relevancia actual radica en que los routers semánticos necesitan señales baratas y fiables para decidir qué modelo, qué política de seguridad o qué herramienta aplicar a cada petición. Este modelo sustituye a encoders genéricos (Vela, mmBERT-32K) en esa tarea con un ajuste específico sobre corpus alineados con cada señal, y publica una evaluación comparativa con intervalos de confianza y corrección por comparaciones múltiples.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Decision-1.0-Kai-0.6B; clasificador de decisión) |
| Parámetros totales | 0,6B (según nombre del modelo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | multilingüe (según tags); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de vllm-sr/Decision-1.0-Kai-0.6B. No se detalla en la información disponible la arquitectura interna (transformer, MoE u otra), pero el pipeline declarado es zero-shot-classification y el modelo base pertenece a la familia Decision de vLLM Semantic Router. El ajuste se realizó sobre un corpus emparejado con las señales que el router necesita, construido específicamente para este fin (semantic-router#4305).

El entrenamiento se describe como una ronda de tuning que cambió una variable a la vez, validando cada cambio con el split de desarrollo. Los cambios respecto a la primera release incluyen: una época para la ruta Noul en lugar de tres, opciones Choice entrenadas en el formato `KEY: description` que usa el runtime de Decision, ataques de jailbreak reales junto a prompts benignos de persona, y nombres de personas en prosa para la señal de PII. El corpus de entrenamiento combina decenas de datasets (Toucan-1.5M, WildChat-4.8M, WildGuardMix, Nemotron-Safety-Guard, ToolACE, RAGTruth, prompt-injections, jailbreak-classification, entre otros) orientados a cubrir dominios, seguridad, PII, tool calling y verificación factual. No se especifica el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de área temática: identifica la materia de la petición entre las 14 asignaturas de MMLU-Pro, cada una con descripción de una línea.
- Clasificación de modalidad de salida: distingue entre `AR` (generación autorregresiva) y `DIFFUSION`.
- Detección de ataques de prompt y jailbreak: clasifica peticiones maliciosas frente a benignas.
- Detección de peticiones dañinas y doce categorías de peligro (hazard).
- Verificación factual: estima la necesidad de comprobación de hechos (fact check).
- Detección de alucinaciones: evalúa si una respuesta contiene afirmaciones no respaldadas.
- Detección de datos personales (PII) en texto, incluyendo nombres de personas en prosa.
- Predicción de necesidad de herramientas (tool need) para decidir si invocar function calling.
- Clasificación de retroalimentación del usuario (feedback).
- Capacidad multilingüe declarada en los tags del modelo.
- Integración como componente de decisión en vLLM Semantic Router mediante preguntas Choice y criterios Noul.

## Casos de uso

- Enrutamiento de peticiones en producción: el modelo clasifica cada consulta por área temática y modalidad, permitiendo que el router dirija la petición al modelo especializado o al pipeline de generación adecuado, reduciendo coste y latencia frente a invocar un LLM grande para decidir.
- Filtrado de seguridad previo a la inferencia: las señales de jailbreak, safety y hazard permiten bloquear o marcar peticiones antes de que lleguen al modelo generativo, con AUC de 0,806 en jailbreak y 0,919 en safety según la evaluación publicada.
- Detección de PII en pipelines de datos: con AUC de 0,982, el modelo puede etiquetar textos que contienen datos personales para anonimización o cumplimiento normativo, incluyendo nombres en prosa.
- Verificación de respuestas en sistemas RAG: la señal de hallucination (AUC 0,705) y la de fact check (AUC 0,900) permiten decidir si una respuesta generada necesita comprobación adicional o si debe marcarse como no respaldada.
- Decisión de invocación de herramientas: la señal tool need (AUC 0,907) indica si una consulta requiere function calling, habilitando agentes que solo activan herramientas cuando es necesario y evitando llamadas innecesarias.
- Moderación de contenido multilingüe: las doce categorías de hazard y la señal de safety permiten clasificar contenido dañino en varias lenguas dentro de plataformas de comunidad o atención al cliente.
- Enrutamiento de modalidad en plataformas multimodales: la señal modality (AUC 0,987) distingue si la petición espera una salida autorregresiva o de difusión, útil para decidir entre un LLM de texto y un modelo de imagen.

## Benchmarks y rendimiento

Resultados publicados en la model card, media sobre corpus held-out no vistos por ninguno de los modelos comparados (ficheros con ambas clases). "Pesos previos" es la primera release del repositorio.

| Señal | Corpus held-out | Métrica | Este modelo | Pesos previos | Vela, presupuesto igualado | Vela, receta documentada | mmBERT-32K |
|---|---:|---|---:|---:|---:|---:|---:|
| domain | 6 | accuracy media | 0,637 | 0,640 | **0,654** | 0,632 | 0,628 |
| fact check | 2 | AUC media | 0,900 | 0,906 | 0,874 | 0,863 | **0,908** |
| hallucination | 3 | AUC media | **0,705** | 0,708 | 0,619 | 0,620 | 0,604 |
| hazard | 3 | macro AUC media | **0,923** | 0,910 | 0,911 | 0,913 | 0,914 |
| jailbreak | 4 | AUC media | 0,806 | 0,776 | 0,687 | 0,748 | **0,821** |
| modality | 2 | AUC media | **0,987** | 0,990 | 0,979 | 0,984 | 0,984 |
| PII | 3 | AUC media | **0,982** | 0,977 | 0,973 | **0,982** | 0,979 |
| safety | 4 | AUC media | **0,919** | 0,903 | 0,905 | 0,885 | 0,884 |
| tool need | 1 | AUC media | **0,907** | 0,910 | 0,843 | 0,838 | 0,840 |

Comparación pareada fichero a fichero con bootstrap por grupos y corrección Benjamini-Hochberg sobre 57 ficheros: 26/24/7 (victorias/empates/derrotas) frente a Vela con presupuesto igualado, 32/19/6 frente a la receta documentada y 28/22/7 frente a mmBERT-32K. En un segundo conjunto held-out construido con corpus no tocados por el suite, el modelo gana/empata/pierde 5/22/5 frente a los pesos previos, mejorando en PII, feedback y safety y perdiendo en jailbreak y domain. Con tasas de falsos positivos de hasta el 5 %, fact check queda por detrás de mmBERT-32K (AUC parcial 0,677 frente a 0,793).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 0,6B parámetros, en FP16 serían aproximadamente 1,2 GB de pesos, y en cuantizaciones de 8 o 4 bits, menos de 1 GB, aunque el dato no está confirmado por el autor.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: probablemente sí por tamaño, pero no confirmado en la información disponible.
- Opciones de despliegue: vLLM Semantic Router (integración nativa); el resto de opciones (llama.cpp, Ollama, TGI) no están confirmadas para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Rendimiento publicado |
|---|---|---|---|---|---|
| Decision-1.0-Route-0.6B | 0,6B | no disponible | Apache 2.0 | Clasificador de señales para router semántico | Medias por señal entre 0,637 y 0,987 |
| Vela (base) | no disponible | no disponible | no disponible | Encoder base para las mismas señales | Medias entre 0,619 y 0,984 |
| mmBERT-32K | no disponible | 32K (según nombre) | no disponible | Encoder multilingüe para las mismas señales | Medias entre 0,604 y 0,984 |
| Decision-1.0-Kai-0.6B | 0,6B | no disponible | no disponible | Modelo base del que deriva este fine-tune | No disponible en esta ficha |

## Limitaciones y advertencias

- Las medias de evaluación se apoyan en uno a seis ficheros por señal y los ficheros discrepan fuertemente (AUC de jailbreak de 0,580 en BIPIA frente a 0,969 en LLMail); la marca en negrita indica la mejor media entre los modelos comparados en esos ficheros, no una clasificación definitiva de la señal.
- En la señal de domain, el modelo no supera a Vela con presupuesto igualado (0,637 frente a 0,654) y pierde frente a los pesos previos en el conjunto held-out fresco.
- En jailbreak, mmBERT-32K obtiene mejor AUC media (0,821 frente a 0,806) y el modelo pierde frente a los pesos previos en el segundo conjunto held-out.
- En fact check con tasas de falsos positivos de hasta el 5 %, queda por detrás de mmBERT-32K (AUC parcial 0,677 frente a 0,793).
- El ajuste está optimizado para las preguntas y descripciones exactas documentadas en QUESTIONS.json; otras formulaciones funcionan como con Kai, sin la ganancia del fine-tune.
- Riesgo de alucinación: aunque el modelo detecta afirmaciones no respaldadas, su propia señal de hallucination tiene AUC de 0,705, la más baja del conjunto, por lo que no debe usarse como único mecanismo de verificación.
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no se detallan condiciones adicionales del modelo base.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se especifican idiomas concretos soportados más allá del tag "multilingual", ni la longitud de contexto, lo que limita la planificación de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ITLL/Decision-1.0-Route-0.6B
- Modelo base: https://huggingface.co/vllm-sr/Decision-1.0-Kai-0.6B
- Rama train-split: https://huggingface.co/vllm-sr/Decision-1.0-Route-0.6B/tree/train-split
- Repositorio vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Issue semantic-router#4305: https://github.com/vllm-project/semantic-router/issues/4305
- Issue semantic-router#4306: https://github.com/vllm-project/semantic-router/issues/4306
- Preguntas y formatos: QUESTIONS.json (referenciado en la model card del repositorio)
- Evaluación por fichero: evaluation/RESULTS.md (referenciado en la model card del repositorio)
- Conjunto held-out fresco: evaluation/FRESH.md (referenciado en la model card del repositorio)
