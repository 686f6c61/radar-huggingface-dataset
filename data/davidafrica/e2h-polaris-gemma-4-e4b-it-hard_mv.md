# davidafrica/e2h-polaris-gemma-4-e4b-it-hard_mv

## Resumen

e2h-polaris-gemma-4-e4b-it-hard_mv es un checkpoint de ajuste fino mediante GRPO (Group Relative Policy Optimization) sobre el modelo multimodal google/gemma-4-E4B-it. Lo publica el usuario davidafrica como parte de una serie de experimentos denominada E2H (easy-to-hard) Polaris, orientada a mejorar el razonamiento matematico del modelo base mediante aprendizaje por refuerzo con recompensa de voto mayoritario. El checkpoint corresponde al paso 200 de 200 de entrenamiento y solo se ha entrenado la torre del lenguaje: las torres de vision y audio permanecen intactas respecto al modelo base.

El modelo resuelve el problema de la mejora del razonamiento matematico verificable en un modelo de ~8.000 millones de parametros con capacidades multimodales. La estrategia de entrenamiento se apoya en el propio modelo base para clasificar los problemas del dataset Polaris-Dataset-53K segun su tasa de acierto en 16 muestras (faciles: 10-15 aciertos; dificiles: 1-9 aciertos), y el entrenamiento se realiza sobre el subconjunto `train_hard`. Esto lo hace relevante para quienes investigan RL aplicado a matematicas con modelos de tamano medio y para quienes necesitan un checkpoint de Gemma 4 E4B-it con mayor precision en problemas de razonamiento aritmetico.

La relevancia actual radica en que se publica con licencia Apache 2.0, pesos en bf16 fusionados desde los shards FSDP de verl, y revisiones por paso (`step-200` en `main`) que permiten evaluar la evolucion del entrenamiento. El repo ocupa 63,7 GB y acumula 18 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E4B-it): torre de lenguaje entrenada, torres de vision y audio heredadas del base; K/V compartidas en las ultimas 18 capas |
| Parametros totales | 7.996.156.490 (~8,0 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP de verl) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it, un checkpoint multimodal completo con torres de vision y audio. El ajuste solo afecta a la torre del lenguaje; las torres de vision y audio se mantienen tal cual las publica Google. Una particularidad estructural de Gemma 4 es que comparte claves y valores (K/V) en sus ultimas 18 capas, de modo que sus `k_proj`, `v_proj` y `k_norm` no se utilizan en la practica; el autor los copia sin modificar desde el base para que los nombres de tensor coincidan con el checkpoint original.

El entrenamiento se realizo con verl 0.9.1 (entrenador v0, FSDP2) sobre el subconjunto `train_hard` de Polaris-Dataset-53K, con 200 pasos de 64 prompts por 8 muestras, learning rate 1e-6, perdida KL de 0,001 (variante `low_var_kl`) y respuestas de 2048 tokens con thinking activado. La recompensa es de voto mayoritario: cada una de las 8 muestras recibe recompensa si su respuesta final en `\boxed{}` coincide con la respuesta mas frecuente entre las 8. Se guardan checkpoints cada 50 pasos como ramas independientes (`step-200` es la final y esta en `main`).

## Capacidades

- Generacion de texto y razonamiento matematico con modo thinking activado durante el entrenamiento.
- Resolucion de problemas aritmeticos y de matematicas verificables con formato de respuesta `\boxed{}`.
- Capacidades multimodales heredadas del base (vision y audio), aunque no fueron objeto de ajuste.
- Razonamiento multi-paso orientado a problemas de dificultad alta (subconjunto `train_hard`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de RL para matematicas: sirve como checkpoint de referencia para comparar el efecto del GRPO con recompensa de voto mayoritario frente al modelo base en el mismo conjunto de problemas.
- Generacion de soluciones paso a paso con verificacion: el formato `\boxed{}` permite extraer y validar automaticamente la respuesta final en pipelines de correccion automatica.
- Investigacion sobre curricula easy-to-hard: al estar entrenado solo con problemas dificiles (1-9 aciertos de 16), permite estudiar el efecto de entrenar exclusivamente con ejemplos de baja tasa de exito.
- Fine-tuning posterior: al estar en bf16 y con licencia Apache 2.0, se puede usar como punto de partida para SFT o nuevo RL sobre dominios matematicos especificos.
- Despliegue con vLLM: el autor documenta la carga directa mediante `vllm.LLM(..., revision="step-200")`, lo que facilita servir el modelo en entornos de inferencia de alto rendimiento.
- Analisis de dinamica de entrenamiento: las revisiones por paso (cada 50) permiten trazar la evolucion de la precision en matematicas a lo largo del entrenamiento.
- Prototipado multimodal con enfasis en texto: al conservar las torres de vision y audio del base, se puede usar para tareas que combinen imagen o audio con razonamiento textual, aunque sin garantias de mejora en esas modalidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos (8,0 B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 24 GB para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB para pesos; en 4 bits, alrededor de 4-5 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para despliegue en bf16 con contexto largo; RTX 4090 (24 GB) viable en bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 en bf16 y en GPUs de 16 GB si se cuantiza; en 8 GB solo con cuantizacion agresiva y contexto reducido.
- Opciones de despliegue: vLLM (documentado por el autor con `revision="step-200"`), transformers con `AutoModelForImageTextToText`; llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e2h-polaris-gemma-4-e4b-it-hard_mv | ~8,0 B | no disponible | GRPO sobre Gemma 4 E4B-it, subconjunto hard | Apache 2.0 | HuggingFace, 18 descargas |
| google/gemma-4-E4B-it (base) | ~8,0 B | no disponible | Preentrenamiento + instruccion + RLHF de Google | Gemma Terms (segun el base; el derivado declara Apache 2.0) | HuggingFace, ampliamente disponible |
| Alternativas de ~8 B para matematicas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste solo cubre la torre de lenguaje; no hay evidencia de mejora en vision ni en audio.
- El entrenamiento se limita a 200 pasos y al subconjunto `train_hard`; puede degradar el rendimiento en problemas faciles o fuera de la distribucion de Polaris-Dataset-53K.
- La recompensa por voto mayoritario puede reforzar respuestas consistentes pero incorrectas si el modelo converge a un error comun entre sus 8 muestras.
- Riesgo de alucinacion en razonamiento matematico: no se han publicado evaluaciones independientes que lo cuantifiquen.
- Idiomas soportados no documentados; el comportamiento multilingue no esta verificado.
- Aunque el derivado declara Apache 2.0, el modelo base es de Google y puede estar sujeto a los terminos de Gemma; conviene revisar la compatibilidad antes de uso comercial.
- El repo ocupa 63,7 GB, lo que implica costes de almacenamiento y descarga considerables.
- No hay informacion sobre tool calling, agentes ni contexto maximo, por lo que no se debe asumir su soporte en produccion.
- Modelo con muy poca traccion (18 descargas, 0 likes) y sin validacion de la comunidad; tratarlo como experimental.

## Enlaces

- HuggingFace: https://huggingface.co/davidafrica/e2h-polaris-gemma-4-e4b-it-hard_mv
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio verl: no disponible en la informacion proporcionada
- Dataset Polaris-Dataset-53K: no disponible en la informacion proporcionada
- Paper o blog del entrenamiento: no disponible en la informacion proporcionada
