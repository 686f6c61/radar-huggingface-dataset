# skblv/diversity-calibration-wvs-qwen3.5-4b-n731322-lora

## Resumen
Este repositorio contiene un adaptador LoRA entrenado por skblv sobre el modelo base Qwen/Qwen3.5-4B. No se trata de un modelo completo, sino de un ajuste fino (fine-tuning) mediante PEFT orientado a una tarea concreta: reproducir la distribucion de respuestas de encuestados de la World Values Survey (WVS), ola 7. El adaptador fue entrenado durante tres epocas sobre 731.322 ejemplos de pares encuestado-pregunta, con prompts que incluyen una persona demografica, la pregunta de la encuesta y opciones de respuesta etiquetadas con letras; el objetivo del modelo es emitir la letra de la opcion seleccionada.

El trabajo se enmarca en la linea de investigacion del paper "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs" (Skobelev, Fithian y Han, 2026, arXiv:2609.16454), que estudia como el ajuste fino afecta la diversidad de las distribuciones generadas por LLMs. El adaptador forma parte de un conjunto de experimentos de calibracion de diversidad, identificado por el sufijo N=731322, que corresponde al tamano de la muestra de entrenamiento.

El modelo base Qwen3.5-4B es un transformer de 4.000 millones de parametros de la familia Qwen; el adaptador LoRA tiene un rango de 16, alpha 32 y dropout de 0,05, y ocupa aproximadamente 0,1 GB en el repositorio. Es relevante como ejemplo de uso de LoRA para tareas de modelado de comportamiento humano y como artefacto de investigacion reproducible, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-4B) con adaptador LoRA (PEFT) |
| Parametros totales | 4.000 millones (modelo base, no confirmado en la informacion disponible); adaptador LoRA de rango 16 (numero de parametros del adaptador no disponible) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B, sin dato explicito) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos del adaptador en safetensors; la cuantizacion del modelo base no se especifica) |
| Idiomas soportados | no disponibles en la model card; el dataset WVS ola 7 cubre multiples paises, pero no se detalla el conjunto de idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento
El adaptador se aplica sobre Qwen/Qwen3.5-4B, un transformer decoder-only de 4.000 millones de parametros. El ajuste se realizo con LoRA de rango 16, alpha 32 y dropout 0,05, entrenado durante tres epocas sobre 731.322 ejemplos de pares encuestado-pregunta extraidos de la World Values Survey, ola 7 (Haerpfer et al., 2022, Country-Pooled Datafile v6.0.0). El subconjunto de entrenamiento utiliza un tercio fijo y aleatorio de paises y de preguntas medibles.

Cada prompt de entrenamiento contiene una persona demografica, la pregunta de la encuesta y opciones de respuesta etiquetadas con letras; el objetivo es la letra de la opcion elegida por el encuestado. Los tokens del prompt se enmascaran en la perdida, que se aplica unicamente al token o tokens de la letra de respuesta y al token EOS. La model card incluye una curva de convergencia de diversidad relativa, con banda sombreada del percentil 25-75 entre pares pregunta-grupo demografico y linea discontinua de diversidad calibrada (R = 1); el cuadrado rojo marca la posicion de este adaptador.

No se detalla en la informacion disponible el numero total de tokens de entrenamiento, la composicion completa del dataset mas alla de la fuente WVS, ni si se aplicaron tecnicas de RLHF o DPO. El ajuste es de tipo supervisado sobre respuestas de opcion multiple.

## Capacidades
- Generacion de la letra de respuesta a preguntas de encuesta a partir de una persona demografica descrita en el prompt.
- Modelado de distribuciones de respuesta agregadas: el adaptador esta disenado para calibrar la diversidad de las respuestas generadas frente a la distribucion real de la WVS.
- Condicionamiento demografico: el prompt incluye atributos de la persona (edad, sexo, pais u otros segun la encuesta) que modulan la respuesta generada.
- Generacion de texto autoregresiva heredada del modelo base Qwen3.5-4B (capacidad generica del base, no evaluada especificamente en el adaptador).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso
- Simulacion de opinión pública: dado un perfil demografico y una pregunta de la WVS, el adaptador genera la letra de la opcion mas probable y su distribucion, lo que permite construir poblaciones sinteticas de encuestados para estudios exploratorios.
- Calibracion de diversidad en LLM: el adaptador sirve como artefacto de referencia para comparar la diversidad relativa (R) de las respuestas generadas frente a la distribucion empirica de la WVS, tal como muestra la curva de convergencia incluida en la model card.
- Investigacion sobre mode collapse: al estar vinculado al paper arXiv:2609.16454, permite reproducir experimentos sobre como el ajuste fino corrige el colapso de modos y la sobredispersion en las distribuciones de salida.
- Generacion de datos sinteticos para encuestas: se pueden generar respuestas etiquetadas por letra para aumentar muestras de preguntas o grupos demograficos poco representados, manteniendo la estructura de opciones de la WVS.
- Evaluacion de sesgos demograficos: comparando las distribuciones generadas por grupo demografico con las reales, se pueden detectar desviaciones sistematicas en la forma en que el modelo asocia atributos a opiniones.
- Docencia y prototipado en ciencias sociales computacionales: el adaptador, por su tamano reducido (0,1 GB) y su base de 4B, se puede cargar en entornos de laboratorio para demostrar flujos de ajuste fino con PEFT sobre datos de encuesta.
- Analisis de sensibilidad de preguntas: variando la formulacion de la pregunta o el orden de las opciones en el prompt, se puede estudiar como cambia la distribucion de respuestas generadas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente presenta una curva de convergencia de diversidad relativa (R) frente a la diversidad calibrada (R = 1), sin cifras numericas de MMLU, HumanEval, GSM8K ni metricas comparables.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, un modelo base de 4.000 millones de parametros en precision FP16 requiere aproximadamente 8 GB solo para los pesos, a los que se suman el adaptador LoRA (0,1 GB en el repositorio) y la memoria de activaciones y cache KV.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano del base, cabria en GPUs con 16 GB o mas de VRAM en FP16, y en GPUs de 8-12 GB con cuantizacion del base, aunque esto no esta confirmado por el autor.
- Cabe en GPU de consumo: probable con cuantizacion del modelo base (por ejemplo, formatos de 4 bits), pero no hay dato oficial en la informacion disponible.
- Opciones de despliegue: la libreria declarada es peft; el adaptador se carga junto al modelo base Qwen/Qwen3.5-4B. No se especifican integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (adaptadores LoRA de calibracion de diversidad sobre encuestas) ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias
- Es un adaptador LoRA, no un modelo autonomo: requiere cargar el modelo base Qwen/Qwen3.5-4B para funcionar.
- Entrenado sobre un tercio fijo y aleatorio de paises y preguntas medibles de la WVS ola 7; la generalizacion a paises, preguntas o grupos demograficos no incluidos en ese subconjunto no esta garantizada.
- El objetivo de entrenamiento es la letra de la opcion de respuesta, por lo que el adaptador no esta disenado para generar texto libre ni para tareas genericas de razonamiento.
- Riesgo de alucinacion y de respuestas fuera del conjunto de opciones validas: no se documenta en la informacion disponible ningun mecanismo de restriccion a las letras validas.
- Sesgos conocidos: el modelo aprende las distribuciones de la WVS, que reflejan los sesgos de la encuesta y de los paises incluidos; no se documentan analisis de sesgo especificos.
- Restricciones de licencia para uso comercial: la licencia no esta disponible, por lo que no se puede confirmar si se permite uso comercial; debe verificarse antes de cualquier despliegue en produccion.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingue mas alla de la del modelo base.
- Fecha de creacion y actualizacion del repositorio (2026) y ausencia de descargas y likes: artefacto de investigacion reciente, sin validacion comunitaria documentada.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-4b-n731322-lora
- Paper: https://arxiv.org/abs/2609.16454
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset WVS ola 7: https://doi.org/10.14281/18241.24
