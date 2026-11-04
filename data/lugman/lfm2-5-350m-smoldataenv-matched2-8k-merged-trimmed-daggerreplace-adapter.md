# lugman/LFM2.5-350M-SmolDataEnv-Matched2.8K-Merged-Trimmed-DaggerReplace-adapter

## Resumen

Este repositorio contiene un adaptador de ajuste fino (fine-tuning) sobre el modelo base LiquidAI/LFM2.5-350M, desarrollado por el usuario lugman. Se trata de un modelo de lenguaje de 350 millones de parametros de la familia LFM2 (Liquid Foundation Model 2) de Liquid AI, ajustado mediante la libreria Unsloth y la pila TRL de Hugging Face. El nombre del repositorio sugiere un entrenamiento orientado a entornos de datos sinteticos ("SmolDataEnv"), con un conjunto de datos de aproximadamente 2.800 ejemplos ("Matched2.8K"), fusion de pesos ("Merged") y una variante de entrenamiento por imitacion iterativa ("DaggerReplace").

El modelo resuelve el caso de uso de adaptar un modelo pequeno y eficiente a una tarea o dominio concreto mediante ajuste fino supervisado, manteniendo la licencia Apache 2.0 del modelo base. Es relevante para desarrolladores que necesitan desplegar un modelo compacto en hardware modesto y personalizarlo sin partir de un entrenamiento desde cero.

La informacion publicada es muy limitada: el repositorio no incluye detalles sobre la composicion del dataset, hiperparametros de entrenamiento, resultados de evaluacion ni el formato exacto de los pesos (el tamano del repo figura como 0.0 GB). Por tanto, buena parte de las especificaciones tecnicas se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de LiquidAI/LFM2.5-350M; familia LFM2) |
| Parametros totales | 350M (segun el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (etiqueta del repositorio) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo base LiquidAI/LFM2.5-350M. La model card no describe la arquitectura interna del modelo base, por lo que no se dispone de detalles sobre si emplea transformer convencional, capas convolucionales o hibridas, ni sobre la innovacion concreta de la familia LFM2. El entrenamiento se realizo con Unsloth, segun indica la propia model card, lo que sugiere el uso de tecnicas de ajuste fino eficiente en memoria (posiblemente LoRA o QLoRA) y una velocidad de entrenamiento aproximadamente el doble respecto a un pipeline convencional.

El nombre del repositorio aporta pistas sobre el proceso: "SmolDataEnv" apunta a un entorno de datos sinteticos de pequeno tamano, "Matched2.8K" a un conjunto de aproximadamente 2.800 ejemplos, "Merged" a la fusion de los pesos del adaptador con el modelo base, "Trimmed" a un recorte del conjunto o de los pesos, y "DaggerReplace" a una variante del algoritmo DAgger (Dataset Aggregation) de imitacion iterativa. No se especifican el numero total de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base LFM2.5-350M.
- Ajuste fino orientado a una tarea o dominio concreto derivado del dataset SmolDataEnv, aunque la model card no detalla cual.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Prototipado rapido de asistentes de texto en ingles: al tratarse de un modelo de 350M parametros, puede ejecutarse en CPU o GPU de gama baja para validar flujos conversacionales antes de escalar a modelos mayores.
- Ajuste fino de dominio sobre datos sinteticos: el nombre del repositorio sugiere un pipeline reproducible para entrenar con datasets pequenos generados en entornos simulados, util para investigacion en imitacion (DAgger).
- Despliegue en el borde (edge): un modelo de 350M es viable en dispositivos con recursos limitados si se cuantiza, aunque la disponibilidad de pesos GGUF no esta confirmada.
- Experimentacion academica con tecnicas de entrenamiento eficiente: sirve como caso de estudio del uso de Unsloth y TRL para ajustar modelos pequenos con recursos modestos.
- Generacion de texto de bajo coste en pipelines internos: para tareas de clasificacion, resumen corto o reescritura donde la latencia y el coste importan mas que la calidad puntera.
- Base para comparativas de ajuste fino: permite contrastar el efecto de distintos datasets o algoritmos (por ejemplo, DAgger frente a SFT puro) sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,7 GB solo para los pesos (350M parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,35-0,5 GB; en 4 bits, en torno a 0,2-0,3 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM es suficiente; tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada de los ultimos anos (GTX 1650, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: transformers (confirmado por la libreria del repo), text-generation-inference (etiqueta del repo), y potencialmente llama.cpp/Ollama si se generan pesos GGUF, aunque no esta confirmado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| lugman/LFM2.5-350M-SmolDataEnv-... (este) | 350M | no disponible | Apache 2.0 | Ajuste fino de comunidad sobre LFM2.5-350M |
| LiquidAI/LFM2.5-350M | 350M | no disponible | Apache 2.0 (segun modelo base) | Modelo base original de Liquid AI |
| Qwen2.5-0.5B | 500M | 32K (segun documentacion publica de Qwen) | Apache 2.0 | Alternativa de tamano similar con amplio soporte multilingue |
| SmolLM2-360M | 360M | no disponible | Apache 2.0 | Modelo pequeno de Hugging Face orientado a eficiencia |

La comparativa se limita a parametros, licencia y disponibilidad, ya que no se han publicado resultados de rendimiento para este ajuste fino.

## Limitaciones y advertencias

- Modelo de 350M parametros: capacidad de razonamiento, conocimiento factual y coherencia limitadas en comparacion con modelos de mayor tamano; riesgo elevado de alucinacion en tareas abiertas.
- Solo soporta ingles segun la etiqueta de idioma del repositorio; no se garantiza un rendimiento adecuado en castellano.
- No se documentan sesgos conocidos, pero al derivar de un modelo base entrenado con datos web, es probable que herede sesgos de esos datos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del ajuste fino ni sobre los datos de entrenamiento utilizados.
- El repositorio figura con 0.0 GB de tamano y 0 descargas, lo que sugiere que los pesos pueden no estar subidos o que el repositorio esta incompleto; conviene verificar la disponibilidad de los archivos antes de usarlo.
- No hay informacion sobre el dataset de ajuste fino, lo que impide evaluar riesgos de contaminacion, calidad o sesgo especifico de la tarea.
- No se han publicado evaluaciones, por lo que no se puede confirmar que el ajuste fino mejore al modelo base en la tarea objetivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lugman/LFM2.5-350M-SmolDataEnv-Matched2.8K-Merged-Trimmed-DaggerReplace-adapter
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
