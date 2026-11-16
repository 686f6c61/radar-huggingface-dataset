# skblv/diversity-calibration-wvs-qwen3.5-2b-n731322-lora

## Resumen

Este repositorio contiene un adaptador LoRA de rango 16 entrenado sobre el modelo base Qwen/Qwen3.5-2B, un transformer denso de 2.000 millones de parametros. Lo desarrolla el usuario de Hugging Face skblv (Kirill Skobelev y colaboradores, segun la citacion del paper asociado) como artefacto experimental del trabajo "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs" (arXiv:2609.16454). No es un modelo de proposito general, sino un ajuste fino orientado a una tarea muy concreta: predecir la letra de respuesta de un encuestado ante preguntas de la World Values Survey (WVS) a partir de un persona demografico.

El problema que aborda es el de la calibracion de la diversidad en las distribuciones de salida de los LLM. El adaptador se entrena para que la distribucion de opciones elegidas por el modelo se acerque a la diversidad real observada en los datos de encuesta (diversidad relativa R = 1, es decir, sin colapso de modo ni sobredispersion). Se entreno durante tres epocas sobre 731.322 ejemplos encuestado-pregunta de la ronda 7 de la WVS, usando un tercio fijo de paises y preguntas medibles como subconjunto de entrenamiento.

Su relevancia es acotada pero clara: sirve como referencia reproducible para investigacion sobre calibracion de diversidad, simulacion de poblaciones sinteticas y evaluacion de sesgos en modelos pequenos. No esta pensado para generacion de texto abierta, codigo ni tareas de agente, y el repositorio no publica informacion sobre licencia, idiomas ni pesos consolidados (el tamano del repo es de 0,0 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen/Qwen3.5-2B |
| Parametros totales | no disponible (adaptador LoRA de rango 16; base de 2B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-2B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA / alpha / dropout | 16 / 32 / 0,05 |
| Epocas de entrenamiento | 3 |
| Ejemplos de entrenamiento | 731.322 pares encuestado-pregunta |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-2B, un transformer denso de 2.000 millones de parametros del que no se detallan en la informacion disponible ni la composicion del corpus original ni el contexto maximo. El ajuste es un LoRA de rango 16 con alpha 32 y dropout 0,05, entrenado con la libreria PEFT. La mascara de perdida excluye los tokens del prompt: la perdida se calcula unicamente sobre el token o tokens de la letra de respuesta y el token EOS, lo que convierte el entrenamiento en una clasificacion efectiva sobre un conjunto cerrado de opciones (A, B, C...).

Los datos provienen de la World Values Survey, ronda 7, version 6.0.0 (Haerpfer et al., 2022), con 731.322 ejemplos encuestado-pregunta. El subconjunto de entrenamiento usa un tercio fijo y aleatorio de paises y de preguntas medibles; cada prompt incluye un persona demografico, la pregunta de encuesta y las opciones con letras. La innovacion metodologica del trabajo asociado es el objetivo de calibracion de diversidad: el adaptador se situa en la curva de convergencia de diversidad relativa marcada con un cuadrado rojo, con banda sombreada del percentil 25-75 entre pares pregunta-grupo demografico y linea discontinua en R = 1 (diversidad calibrada). No se mencionan RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Prediccion de la letra de respuesta de un encuestado ante preguntas de la World Values Survey, condicionada por un persona demografico incluido en el prompt.
- Modelado de distribuciones de respuesta calibradas en diversidad (objetivo R = 1), evitando colapso de modo y sobredispersion.
- Generacion de texto condicionada al formato de prompt del autor (persona + pregunta + opciones con letras); fuera de ese formato el comportamiento no esta documentado.
- Capacidades multilingues: no disponibles.
- Tool calling / function calling: no disponible; el ajuste no esta orientado a ello.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre calibracion de diversidad: reproducir el experimento del paper comparando la distribucion de letras generadas por el adaptador con la distribucion empirica de la WVS para paises y preguntas del conjunto de test (el tercio de paises no usado en entrenamiento).
- Simulacion de poblaciones sinteticas para ciencias sociales: generar respuestas de encuestados sinteticos con personas demograficos definidos y agregarlas por grupo para estudiar opiniones latentes antes de un trabajo de campo real.
- Evaluacion de sesgos demograficos: al condicionar por persona, permite medir como varia la distribucion de respuestas entre grupos de edad, genero o pais y detectar desviaciones sistematicas respecto a los datos reales.
- Generacion de datos sinteticos para aumento de encuestas: producir respuestas adicionales para categorias con pocos casos en la WVS, siempre que se valide la fidelidad estadistica contra el subconjunto reservado.
- Benchmark de metodos de ajuste: servir como linea base LoRA de rango 16 frente a otros adaptadores o metodos de calibracion en tareas de eleccion multiple cerrada.
- Docencia y divulgacion: ejemplo minimo y reproducible de ajuste fino con enmascarado de perdida sobre tokens de respuesta, util para explicar PEFT en un curso de posgrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente presenta una curva de convergencia de diversidad relativa (figura `assets/convergence.png`), sin valores numericos de MMLU, HumanEval, GSM8K ni de precision sobre el conjunto de test de la WVS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa del modelo base de 2B, en fp16 requeriria del orden de 4-5 GB y en cuantizacion de 4 bits alrededor de 1,5-2 GB, mas el overhead del adaptador LoRA (despreciable, rango 16).
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Cabida en GPU de consumo: no confirmado por el autor; por tamano del modelo base, es plausible en GPUs de consumo con al menos 8 GB, pero no hay dato verificado.
- Opciones de despliegue: PEFT sobre transformers (carga del adaptador con `PeftModel.from_pretrained`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skblv/diversity-calibration-wvs-qwen3.5-2b-n731322-lora | LoRA r16 sobre base 2B | no disponible | Prediccion de respuestas WVS calibrada en diversidad | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | Generacion de texto general | no disponible | Hugging Face |
| Adaptadores LoRA de calibracion de diversidad de otros tamanos | no disponible | no disponible | Misma tarea | no disponible | no disponible |

No se dispone de informacion sobre adaptadores comparables de la misma familia ni de resultados que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- El adaptador esta especializado en un unico formato de prompt y una unica tarea; no debe usarse como modelo de chat o generacion abierta.
- Riesgo de alucinacion: al predecir letras de opcion, puede emitir una letra no incluida en las opciones del prompt o fuera del rango A-D; no se documenta validacion de salida.
- Sesgos conocidos: los derivados de la WVS ronda 7 (cobertura de paises, redaccion de preguntas, sesgo de autoinforme) y del subconjunto de un tercio de paises usado en entrenamiento; el tercio restante puede presentar desviaciones no evaluadas publicamente.
- Limitaciones de contexto e idioma: no documentadas; se heredan del modelo base, sin garantias.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue en produccion.
- Repositorio con 0 descargas y 0 likes, creado en 2026 y actualizado en noviembre de 2026: sin validacion independiente de la comunidad.
- El tamano del repo reportado es de 0,0 GB, lo que sugiere que los pesos del adaptador podrian no estar subidos o ser de un tamano inferior al umbral de redondeo; conviene verificar la presencia real de los ficheros safetensors antes de usarlo.
- No apto para decisiones sobre personas reales: las predicciones son simulaciones estadisticas, no opiniones reales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-2b-n731322-lora
- Paper: https://arxiv.org/abs/2609.16454
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- World Values Survey, Round Seven, Country-Pooled Datafile v6.0.0: https://doi.org/10.14281/18241.24
- Figura de convergencia: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-2b-n731322-lora/blob/main/assets/convergence.png
