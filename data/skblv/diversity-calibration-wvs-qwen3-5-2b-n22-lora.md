# skblv/diversity-calibration-wvs-qwen3.5-2b-n22-lora

## Resumen

El modelo `skblv/diversity-calibration-wvs-qwen3.5-2b-n22-lora` es un adaptador LoRA de rango 16 entrenado sobre el modelo base Qwen/Qwen3.5-2B. Lo desarrolla el usuario de Hugging Face `skblv` (autor del paper asociado, Kirill Skobelev, junto a Eric Fithian y X. Y. Han) como artefacto experimental para el articulo "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs" (arXiv:2609.16454). No es un modelo de proposito general, sino un adaptador de investigacion cuyo objetivo es calibrar la diversidad de las respuestas de un LLM en tareas de eleccion multiple sobre datos de encuesta.

El adaptador se ha afinado durante tres epocas sobre un conjunto extremadamente pequeno: 22 ejemplos de encuestado-pregunta extraidos de la World Values Survey (WVS) Ronda 7. Cada prompt contiene una persona demografica, una pregunta de encuesta y opciones de respuesta etiquetadas con letras; el objetivo de entrenamiento es unicamente la letra de respuesta elegida. El interes del artefacto es metodologico: ilustra como un ajuste fino minimo puede corregir el colapso de modos (mode collapse) y la sobredispersion de un LLM en la generacion de distribuciones de respuesta.

Por su naturaleza (un LoRA de 22 ejemplos, con 0 descargas y 0 likes en el momento de la consulta), no debe considerarse un modelo listo para produccion, sino una pieza reproducible de un estudio empirico sobre calibracion de diversidad. La relevancia actual reside en el debate sobre como el ajuste fino altera la diversidad de salida de los modelos, un tema central en la evaluacion de LLMs como simuladores de poblaciones humanas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3.5-2B |
| Parametros totales | no disponible (adaptador LoRA; el base tiene 2 000 millones aprox. segun su nombre) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen/Qwen3.5-2B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0.05 |
| Epocas de entrenamiento | 3 |
| Tamano del dataset | 22 ejemplos (encuestado-pregunta) |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-2B, un transformer decoder-only de la familia Qwen3.5, y se entrena con PEFT/LoRA de rango 16, alpha 32 y dropout 0.05. El entrenamiento se realizo durante tres epocas sobre 22 ejemplos de la World Values Survey Ronda 7 (Haerpfer et al., 2022, v6.0.0). El subconjunto de entrenamiento se construyo tomando un tercio fijo y aleatorio de paises y de preguntas medibles de la encuesta.

Cada ejemplo de entrenamiento tiene la forma de un prompt con tres componentes: una persona demografica, la pregunta de encuesta y las opciones de respuesta etiquetadas con letras. La perdida se aplica exclusivamente al token o tokens de la letra de respuesta y al token EOS; los tokens del prompt estan enmascarados. Esta decision de diseno es coherente con el objetivo del paper: medir y corregir la diversidad relativa de las distribuciones de respuesta generadas por el modelo, no ensenar conocimiento factual nuevo.

La innovacion tecnica no esta en la arquitectura, sino en el procedimiento: el adaptador sirve como punto de datos en una curva de convergencia de diversidad relativa, donde la linea discontinua representa la diversidad calibrada (R = 1) y la banda sombreada el percentil 25-75 entre pares pregunta-grupo demografico. El resultado que se ilustra es que un ajuste fino muy pequeno puede desplazar la diversidad de salida hacia la calibracion.

## Capacidades

- Generacion de texto condicionada a un prompt de persona demografica y pregunta de encuesta.
- Emision de una unica letra de respuesta (A, B, C, etc.) como salida, seguida de EOS.
- Modelado de distribuciones de respuesta para preguntas de eleccion multiple de la WVS.
- Calibracion de diversidad: el adaptador esta disenado para acercar la diversidad relativa de las respuestas al valor calibrado R = 1.
- Capacidades generales de Qwen3.5-2B potencialmente heredadas (razonamiento, codigo, multilingueismo): no verificadas para este adaptador concreto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre calibracion de diversidad en LLMs: el adaptador se usa como condicion experimental para comparar la diversidad de salida antes y despues del ajuste fino, midiendo la desviacion respecto a R = 1.
- Simulacion de poblaciones para ciencias sociales: dado un prompt con atributos demograficos, el modelo genera la letra de respuesta a una pregunta de la WVS, util para estudiar sesgos de simulacion de encuestados.
- Reproducibilidad de resultados academicos: permite replicar la curva de convergencia del paper arXiv:2609.16454 con un unico adaptador de bajo coste computacional.
- Estudio de mode collapse: sirve como caso controlado para analizar como un ajuste fino minimo (22 ejemplos) corrige el colapso de modos en la distribucion de respuestas.
- Analisis de sobredispersion: comparar la dispersion de las respuestas del adaptador frente a la del modelo base en el mismo conjunto de preguntas.
- Docencia y divulgacion sobre PEFT: ejemplo didactico y ligero de como configurar un LoRA (r=16, alpha=32, dropout=0.05) y enmascarar la perdida solo en el token objetivo.
- Pruebas de infraestructura de adaptadores: validar pipelines de carga de adaptadores PEFT sobre Qwen3.5-2B en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente referencia una curva de convergencia de diversidad relativa (assets/convergence.png), sin cifras numericas de MMLU, HumanEval, GSM8K ni metricas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; al ser un adaptador sobre un modelo de 2 000 millones de parametros, el modelo base en FP16 requiere aproximadamente 4 GB de VRAM, y en cuantizacion de 4 bits alrededor de 1,5-2 GB (estimacion orientativa, no confirmada en la model card).
- GPU recomendadas: no disponible. Por tamano del modelo base, una GPU consumer con 8 GB o mas (por ejemplo, RTX 3060/4060) seria suficiente en cuantizacion; GPU de datacenter (A100, H100) no serian necesarias.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo base; no confirmado en la informacion proporcionada.
- Opciones de despliegue: carga mediante la libreria PEFT sobre transformers; no se documentan opciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skblv/diversity-calibration-wvs-qwen3.5-2b-n22-lora | Adaptador LoRA sobre 2B | no disponible | Adaptador de investigacion | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-2B (modelo base) | 2B aprox. | no disponible | Modelo completo | no disponible | Hugging Face |
| Otros adaptadores LoRA de calibracion de diversidad | no disponible | no disponible | Adaptador | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria (adaptadores LoRA para calibracion de diversidad en encuestas) en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 22 ejemplos: riesgo elevado de sobreajuste y de generalizacion muy limitada a otras preguntas, paises o dominios.
- Disenado exclusivamente para responder con una letra de opcion; no es adecuado para generacion de texto libre.
- Entrenado sobre un tercio fijo de paises y preguntas de la WVS Ronda 7: puede no representar adecuadamente el resto de la encuesta.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion.
- Idiomas soportados no disponibles; el entrenamiento se realizo sobre datos de encuesta, presumiblemente en el idioma de la WVS, sin confirmacion.
- Riesgo de alucinacion y de sesgos demograficos heredados tanto del modelo base como de los datos de la WVS.
- Artefacto de investigacion con 0 descargas y 0 likes: sin validacion externa ni comunidad de usuarios.
- No se han publicado benchmarks ni evaluaciones independientes de rendimiento.
- El modelo base Qwen3.5-2B puede tener sus propias restricciones de licencia que afectan al adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-2b-n22-lora
- Paper: https://arxiv.org/abs/2609.16454
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset WVS Ronda 7: https://doi.org/10.14281/18241.24
