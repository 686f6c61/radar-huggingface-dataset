# aviralku/mr9b-qwen35base-v5-scaffold-cispo-h100-215

## Resumen

El modelo `aviralku/mr9b-qwen35base-v5-scaffold-cispo-h100-215` es un checkpoint de tipo actor resultante de un proceso de aprendizaje por refuerzo (RL) aplicado sobre el modelo base `Qwen/Qwen3.5-9B`. Lo publica el usuario `aviralku` (Aviral Kumar) en HuggingFace, con un pipeline declarado de `reinforcement-learning` y etiquetas que apuntan a `cispo`, `meta-reasoning` y `verl`, lo que sugiere que el entrenamiento se realizo con el framework de RL para LLM conocido como verl y una variante de optimizacion de politica denominada CISPO.

El modelo resuelve, en principio, la mejora de capacidades de razonamiento y meta-razonamiento sobre la base de Qwen3.5-9B, mediante un bucle de RL en el que la recompensa utilizada durante esta fase fue unicamente la de correccion (reward de acierto) y con el bonus de exploracion desactivado. El checkpoint corresponde al paso global 66 (`global_step_66`, paso de optimizador 134) de la ejecucion `mr9b_qwen35base_v5_scaffold_cispo_h100_215_20260923_092531`.

Es relevante ahora porque representa un ejemplo de publicacion de artefactos intermedios de entrenamiento RL en abierto: un export de solo actor en pesos HuggingFace fusionados, con 9.409.813.744 parametros totales, 18,8 GB de repositorio y formato safetensors, pero sin model card exhaustiva sobre datos de entrenamiento, licencia o idiomas, lo que limita su uso directo en produccion sin verificaciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Heredada del modelo base Qwen/Qwen3.5-9B; detalles concretos no disponibles en la informacion proporcionada (se asume transformer decoder propio de la familia Qwen) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados por el autor; al distribuirse en safetensors admite cuantizacion posterior por la comunidad (GPTQ, AWQ, GGUF), aunque no hay versiones oficiales publicadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (export fusionado de pesos HuggingFace desde `actor/huggingface`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `Qwen/Qwen3.5-9B`, un transformer decoder de ~9.400 millones de parametros. El modelo publicado no introduce cambios estructurales respecto al base: se trata de un fine-tuning por RL cuyos pesos han sido fusionados y exportados en formato HuggingFace. El repositorio contiene unicamente el modelo actor; el estado distribuido del optimizador y la cola asincrona de rollouts permanecen en el checkpoint local completo del autor, por lo que no se reproducen en este artefacto.

El entrenamiento se realizo con la tecnica etiquetada como CISPO (una variante de optimizacion de politica con recorte de importancia, del estilo de PPO/GRPO) sobre el framework `verl`. La model card indica que en el momento de este checkpoint la fase de entrenamiento usaba exclusivamente la recompensa de correccion, con el bonus de exploracion desactivado. Se trata de la version v5 de una familia de checkpoints RL del mismo autor (existe una v4 previa, `mr9b-qwen35base-v4-cispo-h100-215`, correspondiente al paso global 32). No se han facilitado en la informacion disponible datos sobre numero de tokens de entrenamiento, composicion del dataset, ni fases de RLHF, DPO o SFT adicionales.

## Capacidades

- Generacion de texto y razonamiento: al derivar de Qwen3.5-9B, se espera capacidad de generacion de lenguaje, razonamiento y respuesta a instrucciones, si bien no hay evaluacion publicada sobre este checkpoint concreto.
- Meta-razonamiento: las etiquetas del repositorio (`meta-reasoning`) y la denominacion "scaffold" sugieren un entrenamiento orientado a estructurar o andamiar cadenas de razonamiento, aunque no se detalla el mecanismo exacto.
- Razonamiento con refuerzo: ajustado mediante RL con recompensa de correccion, lo que en principio favorece respuestas verificables y precisas frente a respuestas exploratorias.
- Codigo y matematicas: capacidad probable heredada del base Qwen3.5-9B, no confirmada con benchmarks para este checkpoint.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; la orientacion a meta-razonamiento es indiciaria, no confirmada.
- Capacidades multilingues: no disponibles; no se declaran idiomas.
- Capacidades especiales: no se documenta modo thinking, vision ni audio; el modelo es un actor de texto derivado del base.

## Casos de uso

- Investigacion en RL para LLM: el checkpoint sirve como material de estudio para analizar el efecto de CISPO y del andamiaje de meta-razonamiento sobre el modelo base Qwen3.5-9B en distintos pasos de entrenamiento (comparativa v4 frente a v5, paso 32 frente a paso 66).
- Reproduccion de experimentos de razonamiento: util para equipos que replican pipelines de `verl` y quieren inspeccionar un actor exportado sin el estado del optimizador, comparando su comportamiento frente al modelo base.
- Evaluacion comparativa de checkpoints intermedios: al ser un paso intermedio (paso global 66), permite estudiar la evolucion del rendimiento con recompensa de correccion pura y sin bonus de exploracion.
- Fine-tuning posterior supervisado: puede emplearse como punto de partida para SFT o DPO especificos de dominio, aprovechando que ya incorpora un sesgo hacia respuestas correctas adquirido por RL.
- Generacion de cadenas de razonamiento estructurado: en tareas donde se quiera que el modelo externalice pasos intermedios antes de responder, dado el enfasis en scaffolding y meta-razonamiento del entrenamiento.
- Base para destilacion: el actor puede usarse como profesor para destilar el comportamiento aprendido por RL en modelos mas pequenos, aunque no hay resultados publicados sobre la calidad de esa destilacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 18,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda disponer de 24 GB o mas.
- Cuantizacion a 8 bits: aproximadamente 9,4-10 GB de pesos, factible en GPUs de 16 GB con margen justo.
- Cuantizacion a 4 bits: aproximadamente 5-6 GB de pesos, lo que permitiria ejecucion en GPUs consumer de 8-12 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB (el nombre del experimento hace referencia explicita a H100) para entrenamiento o inferencia en precision completa; RTX 4090 (24 GB) para inferencia en FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantizacion 8 bits; GPUs de 8-12 GB solo con cuantizacion agresiva de 4 bits.
- Cabe en GPU consumer: si, con cuantizacion. En FP16 encaja en tarjetas de 24 GB; en 4 bits, en tarjetas de 8-12 GB.
- Opciones de despliegue: vLLM, TGI y llama.cpp/Ollama mediante conversion a GGUF; tambien transformers + safetensors para scripts de investigacion.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo ni latencias en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aviralku/mr9b-qwen35base-v5-scaffold-cispo-h100-215 | 9.409.813.744 | No disponible | Sin benchmarks publicados | No disponible | HuggingFace, 0 descargas |
| aviralku/mr9b-qwen35base-v4-cispo-h100-215 | No disponible (deriva de Qwen3.5-9B) | No disponible | Sin benchmarks publicados | No disponible | HuggingFace |
| Qwen/Qwen3.5-9B (base) | ~9B (no confirmado en la informacion) | No disponible | No disponible en la informacion | No disponible en la informacion | HuggingFace |
| Familia Kev (0.8B, 4B, 9B sobre Qwen3.5) | 0.8B / 4B / 9B | No disponible | No disponible | Apache-2.0 | HuggingFace / GitHub |

## Limitaciones y advertencias

- Licencia no declarada: al no indicarse licencia, no puede asumirse uso comercial libre; es imprescindible contactar con el autor o verificar la licencia del modelo base antes de cualquier despliegue productivo.
- Idiomas no declarados: no se especifica cobertura multilingue, por lo que el comportamiento fuera del ingles (o de los idiomas del base) es incierto.
- Checkpoint intermedio: corresponde al paso global 66 con recompensa de correccion unicamente y bonus de exploracion desactivado; no es necesariamente la version final ni la mejor del entrenamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base, por lo que el beneficio del RL no esta verificado de forma independiente.
- Repositorio sin senales de adopcion: 0 descargas y 0 likes, sin validacion por parte de la comunidad.
- Riesgo de alucinacion: inherente a los modelos generativos de ~9B; el entrenamiento con recompensa de correccion puede reducir ciertos errores, pero no los elimina.
- Export parcial: solo se publica el actor; sin estado del optimizador ni cola de rollouts, la reproducibilidad exacta del entrenamiento no es posible desde este repositorio.
- Contexto desconocido: al no documentarse la longitud de contexto efectiva, no puede garantizarse el comportamiento en conversaciones o documentos largos.
- Fecha de creacion futura respecto a referencias habituales: el repositorio figura creado el 25 de septiembre de 2026, lo que conviene tener en cuenta al evaluar su vigencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aviralku/mr9b-qwen35base-v5-scaffold-cispo-h100-215
- Version previa del mismo autor: https://huggingface.co/aviralku/mr9b-qwen35base-v4-cispo-h100-215
- Perfil del autor en HuggingFace: https://huggingface.co/aviralku/datasets
- Referencia externa sobre la familia Qwen3.5 (Kev, de Jared Palmer): https://aiweekly.co/alerts/jared-palmer-ports-kev-to-qwen35-for-roughly-95-in-h100
- Contexto sobre la hoja de ruta de Alibaba y Qwen: https://www.techedt.com/alibaba-lays-out-ai-roadmap-across-qwen-models-chips-and-agent-services
- Ranking de modelos Qwen (referencia): https://benchlm.ai/best/alibaba-models
