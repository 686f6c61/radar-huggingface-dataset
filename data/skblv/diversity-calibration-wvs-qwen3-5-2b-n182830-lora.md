# skblv/diversity-calibration-wvs-qwen3.5-2b-n182830-lora

## Resumen

El modelo `skblv/diversity-calibration-wvs-qwen3.5-2b-n182830-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen3.5-2B. Lo desarrolla el usuario skblv (autoria academica atribuida a Kirill Skobelev, Eric Fithian y X. Y. Han en el articulo asociado) y su proposito no es el uso general como asistente, sino servir como artefacto de investigacion para calibrar la diversidad de respuestas de un LLM frente a la distribucion real de respuestas humanas en encuestas de opinion.

El adaptador se ha entrenado durante tres epocas sobre 182.830 ejemplos de pares encuestado-pregunta extraidos de la World Values Survey (WVS), ronda 7. Cada prompt contiene una persona demografica, una pregunta de encuesta y opciones de respuesta etiquetadas con letras; el objetivo de entrenamiento es la letra de la opcion elegida por el encuestado real. El articulo de referencia, "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs" (arXiv:2609.16454), enmarca el adaptador en el estudio de como el ajuste fino afecta a la diversidad de salidas: el modelo busca reproducir la dispersion de respuestas observada en la poblacion en lugar de colapsar hacia una unica respuesta modal.

Es relevante ahora porque aborda un problema practico de los LLM en tareas de simulacion social y encuestas sinteticas: la tendencia a la moda colapsada (mode collapse) o, en el extremo opuesto, a la sobredispersion. El repositorio es de tamano practicamente nulo (0.0 GB declarados) y no registra descargas ni likes en el momento de la consulta, lo que lo situa como un artefacto de investigacion mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 32, dropout 0.05) sobre transformer decoder-only Qwen/Qwen3.5-2B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.5-2B tiene 2.000 millones de parametros nominales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen/Qwen3.5-2B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible (los prompts de entrenamiento derivan de WVS, mayoritariamente en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0.05 aplicado sobre el modelo Qwen/Qwen3.5-2B, un transformer decoder-only de la familia Qwen3.5. No se modifican los pesos del modelo base: se anaden matrices de baja dimension en las capas seleccionadas, lo que permite cargar y descargar el adaptador sin duplicar los 2.000 millones de parametros del modelo original. La libreria declarada es `peft` y el pipeline es `text-generation`.

El entrenamiento se realizo durante tres epocas sobre 182.830 ejemplos de pares encuestado-pregunta de la World Values Survey, ronda 7 (Haerpfer et al., 2022, v6.0.0). El subconjunto de entrenamiento se construyo tomando un tercio fijo y aleatorio de paises y de preguntas medibles, de modo que el resto queda como conjunto de evaluacion. Cada prompt incluye una persona demografica, la pregunta de la encuesta y las opciones de respuesta etiquetadas con letras; el objetivo es la letra de la opcion elegida por el encuestado. Los tokens del prompt se enmascaran en la perdida y esta se aplica unicamente al token o tokens de la letra de respuesta y al token EOS. La innovacion tecnica central no esta en la arquitectura sino en el objetivo de calibracion: el adaptador se evalua con una curva de convergencia de diversidad relativa (R = 1 como diversidad calibrada), comparando la dispersion de respuestas del modelo con la de los grupos demograficos reales por pregunta.

## Capacidades

- Generacion de texto condicionada por persona demografica: dado un perfil (edad, genero, pais, nivel educativo, etc.), la pregunta y las opciones, el modelo emite la letra de la opcion seleccionada.
- Simulacion de respuestas de encuesta con dispersion calibrada: el adaptador esta disenado para reproducir la distribucion de respuestas de la WVS, no solo la respuesta modal.
- Clasificacion de opcion unica entre un conjunto finito de alternativas etiquetadas con letras.
- Modelado de heterogeneidad poblacional: la condicion demografica del prompt modula la respuesta, lo que permite generar subpoblaciones sinteticas con distribuciones distintas.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el adaptador no se ha entrenado para ello.
- Capacidades multilingues: no disponibles; el entrenamiento se limita a los idiomas presentes en la WVS ronda 7.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Simulacion de opinion publica: generar respuestas sinteticas a preguntas de la WVS para una persona demografica concreta y comparar la distribucion generada con la observada en la encuesta real, usando la curva de diversidad relativa como metrica de calibracion.
- Investigacion sobre calibracion de LLM: replicar el experimento del articulo arXiv:2609.16454 evaluando como el ajuste fino con LoRA corrige el mode collapse y la sobredispersion en tareas de eleccion multiple.
- Generacion de datos sinteticos para encuestas: producir subpoblaciones sinteticas con perfiles demograficos controlados para preprobar cuestionarios antes del trabajo de campo, siempre que se valide la fidelidad de la distribucion generada.
- Auditoria de sesgos demograficos: comparar la probabilidad que asigna el modelo a cada opcion entre grupos demograficos y detectar desviaciones sistematicas respecto a los datos reales de la WVS.
- Estudio de transferencia entre paises y preguntas: al haberse entrenado solo con un tercio de paises y preguntas, el adaptador permite evaluar la generalizacion a paises y cuestiones no vistas durante el ajuste fino.
- Docencia y experimentacion con PEFT: ejemplo reproducible de adaptador LoRA de rango 16 con enmascaramiento de perdida sobre tokens de respuesta, util para ensenar tecnicas de ajuste fino supervisado selectivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente presenta una curva de convergencia de diversidad relativa (R = 1 como diversidad calibrada) sin valores numericos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; el adaptador anade un numero reducido de parametros sobre Qwen3.5-2B, por lo que el requisito dominante es el del modelo base.
- GPU recomendadas: no disponibles en la informacion proporcionada; para un modelo base de 2.000 millones de parametros son habituales GPUs consumer de gama media-alta, pero no se confirma en la documentacion del autor.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible.
- Opciones de despliegue: al ser un adaptador PEFT en safetensors, requiere cargarse junto al modelo base Qwen/Qwen3.5-2B mediante la libreria `peft`; no se documentan opciones de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skblv/diversity-calibration-wvs-qwen3.5-2b-n182830-lora | Adaptador LoRA sobre 2B | no disponible | LoRA PEFT | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-2B (modelo base) | 2B | no disponible | Transformer decoder-only | no disponible en esta ficha | Hugging Face |
| Otros adaptadores LoRA de calibracion de diversidad | no disponible | no disponible | LoRA PEFT | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria (adaptadores de calibracion de diversidad sobre encuestas) en la documentacion proporcionada.

## Limitaciones y advertencias

- El adaptador esta especializado en un unico formato de tarea: pregunta de encuesta con opciones etiquetadas por letras y persona demografica en el prompt. Fuera de ese formato su comportamiento no esta caracterizado.
- El entrenamiento cubre solo un tercio fijo y aleatorio de paises y preguntas de la WVS ronda 7; la generalizacion a paises o cuestiones no vistas no se cuantifica en la informacion disponible.
- Riesgo de reproducir sesgos presentes en la WVS: la distribucion objetivo refleja la composicion y las respuestas de la muestra original, incluidos sus sesgos de muestreo y de cobertura.
- Riesgo de alucinacion: el modelo puede emitir letras fuera del conjunto de opciones ofrecido o formatos no esperados; no se documenta ningun mecanismo de validacion de la salida.
- Licencia no disponible: no se puede confirmar el uso comercial del adaptador ni las condiciones de redistribucion.
- Idiomas soportados no disponibles: no se garantiza el funcionamiento en castellano ni en otros idiomas distintos de los presentes en el corpus de entrenamiento.
- Artefacto de investigacion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa documentada; no se recomienda su uso en produccion sin evaluacion propia.
- El repositorio declara 0.0 GB de tamano, lo que sugiere que los pesos del adaptador podrian no estar efectivamente subidos; conviene verificar los ficheros antes de intentar cargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-2b-n182830-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Articulo de referencia: https://arxiv.org/abs/2609.16454
- World Values Survey, ronda 7, v6.0.0: https://doi.org/10.14281/18241.24
