# Charlie320/zils-lite-k2

## Resumen

zils-lite-k2 es un ajuste fino de Qwen/Qwen3.5-0.8B publicado por el usuario Charlie320 en Hugging Face. Se presenta como un "body" (cuerpo) para el pool de modelos tipo soup denominado `d3-lite` del subred Bittensor 127, bajo el paraguas del proyecto Zils. El modelo se distribuye en BF16 y en el denominado "chassis layout", una disposición de pesos específica del ecosistema Zils que no sigue necesariamente la estructura estándar de un transformer de Hugging Face al uso.

El modelo parte de `vllm-sr/d3-lite` (licencia Apache-2.0) y se ha sometido a un ajuste fino de todos los parámetros a través del chasis del pool. Según la model card, los pesos de lenguaje han sido entrenados y la torre de visión se hereda del modelo padre. Con 852.985.920 parámetros (aproximadamente 0,85 mil millones), se sitúa en la categoría de modelos pequeños, adecuados para despliegue en hardware modesto y para tareas de decisión o clasificación dentro de un pipeline mayor.

La relevancia de este modelo es acotada: se trata de una publicación con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni idiomas especificados, y con una model card muy escueta. Su interés principal radica en su pertenencia al ecosistema Bittensor/Zils y en su carácter de componente (un "body" dentro de un pool de soups) más que de modelo autónomo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de Qwen/Qwen3.5-0.8B, distribuido en "chassis layout" propietario del ecosistema Zils) |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un fine-tune completo (full-parameter fine-tune) de Qwen/Qwen3.5-0.8B, un modelo base de aproximadamente 0,85 mil millones de parametros. El autor indica que el ajuste se realizo "through the pool chassis", es decir, mediante la infraestructura de entrenamiento del pool Zils `d3-lite`, y que el resultado se empaqueta en el "chassis layout" de dicho ecosistema. Los pesos de lenguaje han sido entrenados, mientras que la torre de vision se hereda del modelo padre, lo que sugiere que el modelo conserva capacidades multimodales de entrada visual.

Respecto a los datos de entrenamiento, la model card menciona unicamente "project-generated computed questions and public train splits under their own licences", sin especificar numero de tokens, composicion del dataset, ni si hubo etapas de RLHF o DPO. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. Tampoco se indica la longitud de contexto soportada, dato especialmente relevante dado que el modelo base Qwen3.5-0.8B podria tener una ventana considerable, pero no se confirma en la informacion proporcionada.

## Capacidades

- Generacion de texto y respuesta a preguntas: el modelo se describe como un "decision-model", orientado a tareas de decision dentro del pool Zils, aunque no se detallan las capacidades concretas mas alla del ajuste fino sobre el modelo base.
- Vision: hereda la torre de vision del modelo padre, por lo que en principio conserva capacidad de procesamiento de imagenes, si bien no se especifica el formato ni el alcance.
- Razonamiento y matematicas: no disponible; no se documentan capacidades especificas en la model card.
- Generacion de codigo: no disponible; no se menciona soporte de codigo.
- Tool calling / function calling: no disponible; no se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: no disponible; no se listan idiomas soportados.
- Modo thinking: no disponible; no se menciona.

## Casos de uso

- Componente de un pool de modelos (soup): el uso previsto segun la model card es servir como "body" dentro del pool `d3-lite` del subred Bittensor 127, combinable con otros cuerpos del mismo ecosistema para producir modelos finales. Es adecuado por su formato de chasis y su licencia permisiva.
- Experimentacion con fine-tuning de modelos pequenos: con 0,85 mil millones de parametros y pesos BF16, sirve como punto de partida para probar recetas de ajuste completo en hardware de gama media, aunque requiere adaptar el chasis a un formato estandar.
- Tareas de decision y clasificacion en pipelines internos: su etiqueta "decision-model" sugiere uso en la seleccion o puntuacion de respuestas dentro de un sistema mayor, no como generador principal.
- Prototipado de sistemas multimodales ligeros: al heredar la torre de vision del padre, puede emplearse para experimentar con entrada de imagen en entornos con recursos limitados, siempre que se resuelva la conversion del formato de pesos.
- Investigacion sobre ecosistemas descentralizados de IA: util para estudiar como se estructuran los pools de modelos en Bittensor y como se combinan fine-tunes sobre una misma base.
- Evaluacion comparativa de fine-tunes sobre Qwen3.5-0.8B: permite contrastar el efecto de un ajuste completo con datos generados por proyecto frente al modelo base, en tareas de razonamiento y decision acotadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para pesos (852.985.920 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 2 y 4 GB dependiendo de la longitud de contexto y del backend.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,9 GB para pesos; en 4 bits, alrededor de 0,5 GB, si bien el autor no publica versiones cuantizadas y habria que generarlas a partir de los safetensors.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650 4 GB, RTX 3050, RTX 4060, RTX 4090) deberia poder alojar el modelo en BF16 o en cuantizacion; para lotes grandes o contextos largos se recomienda RTX 3090/4090 o superiores (A100, H100).
- Cabe en GPU consumer: si, con margen amplio en la mayoria de tarjetas modernas.
- Opciones de despliegue: no se documentan opciones oficiales. El formato "chassis layout" puede requerir conversion a un formato estandar (Hugging Face transformers, GGUF para llama.cpp/Ollama, o vLLM) antes de poder desplegarse; no se confirma compatibilidad directa con ninguno de estos backends.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-k2 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Fine-tune en chasis Zils, sin benchmarks |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible | no disponible en la informacion | Hugging Face (modelo base) | Modelo padre; capacidades y contexto originales |
| vllm-sr/d3-lite | no disponible | no disponible | Apache-2.0 | Hugging Face | Origen del ajuste, tambien en ecosistema Zils |

La comparacion con alternativas de la misma categoria (modelos de menos de 1.000 millones de parametros) no puede completarse con datos de rendimiento porque no se han publicado benchmarks. A nivel de licencia, Apache-2.0 es permisiva para uso comercial, lo que constituye una ventaja frente a modelos con licencias restrictivas, pero la falta de documentacion sobre contexto, idiomas y capacidades limita la comparacion tecnica.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, por lo que el rendimiento real es desconocido.
- Model card minima: no se especifican idiomas, contexto, composicion del dataset ni proceso de entrenamiento (RLHF/DPO), lo que dificulta evaluar sesgos y calidad.
- Formato propietario: el "chassis layout" del ecosistema Zils puede no ser directamente cargable con transformers, vLLM o llama.cpp sin conversion previa; verificar compatibilidad antes de integrar.
- Riesgo de alucinacion: inherente a los modelos de ~0,85 B de parametros, especialmente en tareas de razonamiento complejo o conocimiento factual; no hay evaluaciones que lo cuantifiquen.
- Sesgos: los datos de entrenamiento incluyen "project-generated computed questions" y splits publicos sin documentar su filtrado; es probable que se hereden sesgos del modelo base y de los datasets empleados.
- Licencia de los datos: el autor advierte que los datos publicos usados tienen sus propias licencias y que deben revisarse sus terminos antes de reutilizar el modelo con fines comerciales, aunque los pesos se distribuyan como Apache-2.0.
- Vision heredada sin validacion: la torre de vision proviene del padre y no se documenta si fue reentrenada o congelada, ni su rendimiento tras el ajuste.
- Modelo sin traccion: cero descargas y cero likes en el momento de la consulta; no hay comunidad ni soporte documentado.
- Uso comercial: la licencia Apache-2.0 lo permite, pero la procedencia de los datos de entrenamiento y el caracter experimental del pool Zils aconsejan una revision legal previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-lite-k2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo de origen del ajuste: https://huggingface.co/vllm-sr/d3-lite
- No se han encontrado en la informacion disponible papers, blogs, repositorios ni demos adicionales.
