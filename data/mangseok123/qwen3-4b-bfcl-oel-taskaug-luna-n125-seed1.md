# MANGSEOK123/qwen3-4b-bfcl-oel-taskaug-luna-n125-seed1

## Resumen

`qwen3-4b-bfcl-oel-taskaug-luna-n125-seed1` es un ajuste fino del modelo Qwen3-4B-Instruct-2507 desarrollado por el usuario MANGSEOK123. El modelo aplica una tecnica de internalizacion de habilidades (*skill internalization*) sobre el benchmark BFCL-v3 (Berkeley Function Calling Leaderboard) en su variante `multi_turn_base`, mediante destilacion automatica on-policy (OPSD, *on-policy self-distillation*). El objetivo es que el modelo estudiante aprenda a resolver tareas de llamada a funciones multi-turno sin necesidad de que la habilidad se le indique explicitamente en el prompt de sistema.

El modelo parte de la arquitectura Qwen3 de 4B parametros (4.411.424.256 parametros reales segun safetensors) y se entrena con el codebase OEL (LMOps) usando 125 pares de entrenamiento de un conjunto aumentado de 1244 tareas generadas con GPT-5.6-Luna. El resultado es un checkpoint experimental de investigacion, no un modelo de produccion: tiene 0 descargas y 0 likes en Hugging Face, y su model card es fundamentalmente una descripcion del experimento de entrenamiento.

La relevancia de este modelo es metodologica: documenta un pipeline reproducible de destilacion on-policy para internalizar habilidades de tool calling en modelos pequenos, con semillas y particiones de datos explicitas. Es util para investigadores que estudien tecnicas de auto-destilacion y para quienes quieran reproducir el experimento sobre BFCL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; entrenamiento con prompt <= 8192 tokens y respuesta <= 1024 tokens por turno |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parametros de la familia Qwen3. No se modifica la arquitectura base; el entrenamiento consiste en destilacion on-policy auto-supervisada (OPSD). El estudiante resuelve cada tarea de BFCL-v3 `multi_turn_base` sin la habilidad en el prompt de sistema (temperatura T=0.7), mientras que un profesor congelado (copia del modelo inicial) resuelve la misma tarea con la habilidad inyectada en el system prompt. La perdida es una KL inversa a nivel de token sobre los 256 tokens mas probables del estudiante, optimizada con AdamW (lr 3e-6 constante, weight decay 0.01, grad clip 1.0).

Los datos de entrenamiento son 125 pares de un pool de 1244 pares de *Task Augmentation* (tareas aumentadas con GPT-5.6-Luna, filtradas por utilidad = 1), con presupuesto equiparado a TANI (Matched). Se usa una semilla fija (seed 1) para el submuestreo (`random.Random(1).sample(pool, N)`), el orden de datos y el muestreo de rollouts. El entrenamiento es de 1 epoca con 8 pares por actualizacion, usando el codebase OEL (LMOps) y `bfcl_eval==2025.6.14` con particion 125/75 train/test. La innovacion tecnica destacable es la internalizacion de habilidades sin necesidad de prompt de sistema en inferencia, mediante destilacion on-policy con KL inversa.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3-4B-Instruct-2507.
- Tool calling / function calling en escenarios multi-turno (BFCL-v3 `multi_turn_base`), con la habilidad internalizada en los pesos en lugar de depender del prompt de sistema.
- Razonamiento multi-paso orientado a la seleccion y encadenamiento de llamadas a funciones.
- Capacidades generales del modelo base Qwen3-4B-Instruct-2507 (no verificadas de forma independiente en este checkpoint).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en destilacion on-policy: el checkpoint sirve como referencia reproducible (semilla, particion y receta documentadas) para estudiar como se internalizan habilidades de tool calling en modelos de 4B parametros sin prompt de sistema.
- Evaluacion de BFCL-v3 multi-turno: util para comparar el efecto de la internalizacion de habilidades frente al modelo base Qwen3-4B-Instruct-2507 en la particion de test de 75 tareas.
- Agentes de llamada a funciones con prompt de sistema minimo: al haber internalizado la habilidad, el modelo puede integrarse en pipelines donde el contexto de sistema es escaso o costoso en tokens, aunque requiere validacion propia.
- Reproduccion de experimentos de auto-destilacion: la receta (KL inversa top-256, T=0.7, 1 epoca, 8 pares por update) permite replicar el pipeline con otras semillas o tamanos de submuestreo.
- Base para ablaciones de *task augmentation*: comparar este checkpoint con variantes sin aumento de tareas o con distinto presupuesto de pares para medir el impacto en la precision de tool calling.
- Estudio de estabilidad de entrenamiento en modelos pequenos: el checkpoint permite analizar como afecta la destilacion on-policy a las capacidades generales del modelo base (posible olvido catastrofico) en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la receta de entrenamiento y la particion de evaluacion (125/75 sobre BFCL-v3 `multi_turn_base`), pero no incluye metricas de precision, exactitud de llamadas ni comparaciones numericas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,8 GB solo para pesos (4.411.424.256 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomiendan 16 GB o mas para contexto largo.
- Cuantizacion: no se publican pesos cuantizados, pero al ser un modelo de 4B es compatible con cuantizaciones GGUF/AWQ generadas por el usuario; en 4 bits los pesos ocuparian en torno a 2,5-3 GB.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes en BF16; GPUs consumer de 8-12 GB solo con cuantizacion.
- Cabe en GPU consumer: si, en RTX 4090/3090 en BF16 y en GPUs de 8-12 GB con cuantizacion de 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); vLLM, llama.cpp y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-bfcl-oel-taskaug-luna-n125-seed1 | 4,41B | no disponible | Destilacion on-policy para tool calling multi-turno | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B | no disponible en esta ficha | Modelo base instructivo general | no disponible en esta ficha | Hugging Face (modelo base publico) |
| Alternativas de tool calling de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa mas relevante es con su modelo base Qwen3-4B-Instruct-2507, del que se diferencia unicamente por el ajuste fino de internalizacion de habilidades. No se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigacion con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion externa.
- No se publican resultados de benchmarks, por lo que no se puede confirmar que la internalizacion mejore el rendimiento frente al modelo base; podria incluso degradar capacidades generales por olvido catastrofico tras el ajuste fino.
- Entrenado sobre una particion muy pequena (125 pares) de una unica tarea de BFCL-v3 `multi_turn_base`; la generalizacion a otros dominios de tool calling no esta demostrada.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse con el autor y con la licencia del modelo base Qwen3-4B-Instruct-2507.
- Idiomas soportados no declarados; el comportamiento multilingue no esta verificado.
- Riesgo de alucinacion en llamadas a funciones y en argumentos, inherente a los modelos de 4B y no mitigado de forma documentada.
- Los datos de entrenamiento se generaron con GPT-5.6-Luna, lo que introduce dependencia de un modelo propietario y posibles sesgos heredados de esas tareas aumentadas.
- El checkpoint esta atado a una semilla y un submuestreo concretos (seed 1, 125 de 1244 pares); la reproducibilidad exacta requiere el mismo codebase OEL y `bfcl_eval==2025.6.14`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-bfcl-oel-taskaug-luna-n125-seed1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- BFCL (Berkeley Function Calling Leaderboard): no disponible en la informacion proporcionada
- Codebase OEL (LMOps): no disponible en la informacion proporcionada
- Paper o blog del metodo OPSD: no disponible en la informacion proporcionada
