# bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step60

## Resumen

Qwen3.5-4B-ArgGYM-GRPO-step60 es un ajuste fino del modelo multimodal Qwen/Qwen3.5-4B, desarrollado por el usuario bdsaglam, orientado especificamente a tareas de argumentacion formal. El modelo parte de la base densa de 4B parametros de Qwen (4.659.865.088 parametros reales segun safetensors) y ha sido entrenado mediante GRPO (Group Relative Policy Optimization) sobre ArgGYM, un benchmark de tareas de argumentacion formal basadas en teorias ASPIC+ bajo semantica grounded.

La relevancia de este checkpoint radica en que demuestra una mejora medible del razonamiento argumentativo mediante RL: la tasa de exito en un conjunto de desarrollo de 96 problemas pasa de 0.309 en el modelo base a 0.527 en el paso 60, con una ganancia de +0.22 (IC 95% bootstrap emparejado de +0.17 a +0.27). Se trata de un checkpoint intermedio de una ejecucion de 100 pasos aun en curso, por lo que su uso en produccion debe considerarse experimental.

El modelo conserva la arquitectura, configuracion, tokenizer y torre de vision del modelo base, y se distribuye como los pesos completos en bf16 con el adaptador LoRA fusionado. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-lenguaje), familia Qwen3.5; arquitectura identica al modelo base |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos en el modelo base, extensible a 1M con YaRN (segun fuentes web); no confirmado de forma independiente para este checkpoint |
| Tipos de cuantizacion | no disponible (los pesos se publican en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible en la model card; el modelo base declara cobertura de 201 idiomas segun fuentes web |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B: un transformer denso multimodal con torre de vision, modo thinking activado por defecto y una ventana de contexto nativa de 262.144 tokens. El ajuste se realiza exclusivamente sobre el modelo de lenguaje: la torre de vision permanece sin cambios y el adaptador LoRA (rank 64, alpha 32) se aplica solo a las capas del LM, para despues fusionarse en los pesos base en bf16.

El entrenamiento emplea GRPO con la libreria verl v0.9.1 sobre el benchmark ArgGYM, compuesto por tareas de argumentacion formal (teorias ASPIC+ bajo semantica grounded): ataque, defensa, ataque/defensa, contraargumento (simple y estricto), cadenas de afirmaciones, construccion de preferencias, consultas de estado y semantica, diagnostico de derrotas, formalizacion y perturbacion, en niveles de dificultad 1 a 12. El entrenamiento muestrea de 82 celdas tarea/nivel (8.200 problemas) mediante un curriculum que favorece las celdas que el modelo resuelve aproximadamente la mitad de las veces. La recompensa es binaria (1 correcto, 0 incorrecto), con una recompensa parcial de 0.3 x fraccion correcta en cuatro tareas (status_query, defeat_diagnosis, formalization, perturbation). Se usan 18 problemas x 16 muestras por paso, learning rate 3e-5 con decaimiento coseno hasta 3e-6, warmup de 3 pasos y sin penalizacion KL.

Un detalle tecnico destacable es que el muestreo de rollouts replica la configuracion recomendada del modelo base (temperatura 1.0, top-p 0.95, top-k 20, presence penalty 1.5) y el entrenador calcula sus log-probabilidades tras aplicar la misma mascara de top-k/top-p y presence penalty. Sin esta coincidencia, la entropia derivaba al alza en todas las ejecuciones y el entrenamiento se volvia inestable; con ella, la entropia se mantuvo plana durante los 60 pasos.

## Capacidades

- Razonamiento argumentativo formal: ataque, defensa, cadenas de afirmaciones, construccion de preferencias y consultas de estado bajo semantica grounded.
- Diagnostico de derrotas y formalizacion de teorias de argumentacion ASPIC+.
- Generacion de texto y razonamiento en modo thinking (activado por defecto en el modelo base).
- Procesamiento multimodal imagen-texto (pipeline image-text-to-text), aunque la torre de vision no fue entrenada en este ajuste.
- Capacidades multilingues heredadas del modelo base (201 idiomas segun fuentes web; no verificadas para este checkpoint).
- No se documenta soporte especifico de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Evaluacion de sistemas de argumentacion formal: el modelo puede resolver consultas de estado y semantica sobre teorias ASPIC+, util para validar implementaciones de razonadores argumentativos.
- Investigacion en RL para razonamiento: sirve como referencia reproducible de un pipeline GRPO con verl sobre tareas de argumentacion, con curvas de exito documentadas por paso.
- Generacion de contraargumentos estructurados: las tareas de contraargumento simple y estricto mejoran de ~0.29 a 0.72-0.75, lo que permite usarlo para producir refutaciones formalmente validas en entornos de debate simulado.
- Analisis de derrotas en marcos de argumentacion: aunque el diagnostico de derrotas no mejoro con el entrenamiento, el modelo puede asistir en la identificacion de que argumento derrota a cual dentro de una teoria dada.
- Formalizacion asistida: la tarea de formalization recibe recompensa parcial, de modo que el modelo puede convertir descripciones en notacion ASPIC+ con correccion gradual.
- Docencia e investigacion en logica argumentativa: como herramienta de apoyo para generar y comprobar ejemplos de teorias argumentativas en distintos niveles de dificultad.
- Base para nuevos ajustes: al ser un checkpoint intermedio con licencia Apache 2.0, puede servir de punto de partida para experimentos posteriores de RL sobre dominios formales.

## Benchmarks y rendimiento

Tasa de exito en un conjunto de desarrollo reservado de 96 problemas ArgGYM (8 por tarea, niveles 1-8), 8 muestras por problema, hasta 65.536 tokens de salida:

| Modelo / checkpoint | Exito en dev |
|---|---|
| Qwen3.5-4B (base) | 0.309 |
| Step 20 | 0.418 |
| Step 40 | 0.447 |
| Step 60 (este checkpoint) | 0.527 |

Ganancia sobre el modelo base: +0.22 (IC 95% bootstrap emparejado: +0.17 a +0.27). Por tarea, las mayores mejoras se dan en attack (0.25 -> 0.80), attack/defence (0.33 -> 0.80), defence (0.30 -> 0.75) y ambas tareas de contraargumento (~0.29 -> 0.72-0.75). Preference construction, defeat diagnosis y claim chains no mejoraron, y perturbation se mantiene cerca de cero. No se han publicado resultados en conjunto de test.

## Requisitos de hardware

- VRAM estimada: en bf16, los 4.659.865.088 parametros ocupan aproximadamente 9,3 GB solo en pesos, mas overhead de activaciones y cache KV; con contexto de salida de 40k-65k tokens la cache KV crece de forma significativa y exige GPUs con bastante memoria.
- GPU recomendadas: A100 (40/80 GB) o H100 para inferencia con presupuestos de salida largos; en consumer, una RTX 4090 (24 GB) puede alojar los pesos en bf16 o cuantizados, pero el contexto de 40k-65k tokens de salida limita la viabilidad practica.
- Cabe en GPU consumer: si, en modelos con 24 GB o mas en cuantizaciones de 4-8 bits, aunque no se documentan cuantizaciones oficiales para este checkpoint.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` y vLLM (indicados por el autor); llama.cpp, Ollama o TGI no estan documentados para este modelo.
- Latencia y throughput: no disponibles. El autor advierte que las respuestas son largas (~29k tokens de media en dev), por lo que se debe reservar al menos 40k-65k tokens de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-ArgGYM-GRPO-step60 | 4,66B (denso) | 262k nativos (base) | 0.527 en dev ArgGYM | Apache 2.0 | Hugging Face |
| Qwen3.5-4B (base) | 4B (denso) | 262k, extensible a 1M con YaRN | 0.309 en dev ArgGYM | Apache 2.0 | Hugging Face |
| Alternativas especializadas en argumentacion formal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos comparables en tareas de argumentacion formal dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio de una ejecucion de 100 pasos aun en curso; un checkpoint posterior puede reemplazarlo.
- El conjunto de desarrollo es pequeno (96 problemas), por lo que las cifras por tarea son ruidosas (±0.1); no hay resultados en test.
- Entrenado exclusivamente sobre ArgGYM; su comportamiento en otras tareas no ha sido evaluado y puede degradarse respecto al modelo base fuera del dominio.
- Las respuestas son muy largas (~29k tokens de media en dev), lo que encarece la inferencia y exige presupuestos de salida de 40k-65k tokens.
- Algunas tareas (preference construction, defeat diagnosis, claim chains) no mejoraron y perturbation sigue cerca de cero.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en formalizaciones fuera de la distribucion de entrenamiento.
- Sesgos: no documentados en la informacion disponible.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base y este checkpoint no incluyen garantias de exactitud en dominios formales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step60
- Adaptador LoRA: https://huggingface.co/bdsaglam/Qwen3.5-4B-ArgGYM-GRPO-step60-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Libreria verl: https://github.com/volcengine/verl
- Ficha del modelo base en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Ficha del modelo base en Modal: https://modal.com/library/qwen/qwen3-5-4b
