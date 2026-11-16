# skblv/diversity-calibration-wvs-qwen3.5-2b-n1462645-lora

## Resumen

El modelo `skblv/diversity-calibration-wvs-qwen3.5-2b-n1462645-lora` es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-2B. Lo desarrolla el usuario de Hugging Face `skblv` (autor citado en el paper como Kirill Skobelev, junto a Eric Fithian y X. Y. Han) y su proposito es calibrar la diversidad de las respuestas de un LLM pequeno en tareas de prediccion de respuestas de encuesta. Concretamente, el adaptador se ha afinado para predecir la letra de opcion elegida por un encuestado de la World Values Survey (WVS) a partir de un prompt que contiene una persona demografica, la pregunta de la encuesta y las opciones de respuesta.

El trabajo se enmarca en la publicacion arXiv:2609.16454, "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs", que estudia como el ajuste fino afecta a la diversidad de las distribuciones generadas. El adaptador se entrena sobre 1.462.645 ejemplos encuestado-pregunta de la ronda 7 de la WVS y se presenta como el punto de la curva de convergencia de diversidad relativa (R = 1) que corresponde a una diversidad calibrada.

Se trata de un artefacto de investigacion muy especializado: no es un modelo de proposito general, sino un adaptador de rango 16 sobre un modelo de 2B parametros, orientado a reproducir distribuciones demograficas de respuesta en encuestas. Su relevancia actual es metodologica, no de producto: sirve para estudiar el efecto del ajuste fino sobre el colapso de moda y la sobredispersion en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder Qwen/Qwen3.5-2B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-2B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el corpus WVS es multilingue por pais, pero no se declara cobertura) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0.05 |
| Epocas de entrenamiento | 3 |
| Tamano del repo | 0.0 GB (adaptador de pesos ligeros) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0.05 aplicado sobre el modelo base Qwen/Qwen3.5-2B, un transformer decoder de 2.000 millones de parametros. No se modifica la arquitectura del modelo base; se inyectan matrices de bajo rango en las capas del transformer segun la implementacion estandar de PEFT.

El entrenamiento se realizo durante tres epocas sobre 1.462.645 ejemplos de pares encuestado-pregunta extraidos de la World Values Survey, ronda 7 (Haerpfer et al., 2022, v6.0.0). El subconjunto de entrenamiento se construyo tomando un tercio fijo y aleatorio de paises y de preguntas medibles. Cada prompt incluye una persona demografica, la pregunta de la encuesta y las opciones de respuesta etiquetadas con letras; el objetivo es la letra de la opcion elegida por el encuestado. Los tokens del prompt se enmascaran en la perdida y esta se aplica unicamente al token o tokens de la letra de respuesta y al token EOS. El objetivo declarado del trabajo es corregir el colapso de moda y la sobredispersion en la diversidad de las distribuciones generadas, y el adaptador se situa en el punto de diversidad relativa calibrada (R = 1) de la curva de convergencia.

## Capacidades

- Prediccion de la opcion de respuesta (letra) de un encuestado ante una pregunta de la World Values Survey, condicionada por una persona demografica incluida en el prompt.
- Generacion de texto condicionada a un formato de prompt muy especifico: persona demografica, pregunta y opciones etiquetadas con letras.
- Modelado de distribuciones de respuesta con diversidad calibrada (objetivo R = 1 en la metrica de diversidad relativa del paper).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues especificas, aunque el corpus de origen es multinacional.
- No se documentan modos especiales (thinking mode, vision, audio).

## Casos de uso

- Investigacion sobre calibracion de diversidad en LLM: el adaptador sirve como punto de referencia reproducible para estudiar el efecto del ajuste fino sobre el colapso de moda y la sobredispersion, comparando la curva de convergencia de diversidad relativa con otros adaptadores del mismo estudio.
- Simulacion de opinión publica a partir de perfiles demograficos: dado un perfil (edad, pais, nivel educativo, etc.) y una pregunta de la WVS, el modelo predice la distribucion de opciones de respuesta, util para estudios de opinion sintetica.
- Validacion de metodologias de encuesta: permite comparar la distribucion de respuestas generadas con la distribucion empirica de la WVS para detectar sesgos en el diseno de preguntas u opciones.
- Reproducibilidad de resultados academicos: al ser un adaptador PEFT ligero con hiperparametros documentados (r=16, alpha=32, dropout=0.05, 3 epocas), facilita la replicacion del experimento del paper arXiv:2609.16454.
- Analisis de sesgo demografico en LLM: al condicionar por persona demografica, permite medir si el modelo reproduce estereotipos en las distribuciones de respuesta por grupo.
- Generacion de datos sinteticos de encuesta para preentrenamiento o aumento de datos: las respuestas generadas pueden usarse como datos aumentados en pipelines de modelado de opinion, siempre con validacion frente a la distribucion real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; al tratarse de un adaptador LoRA sobre un modelo base de 2B, los requisitos son los del modelo base Qwen/Qwen3.5-2B, que no se detallan.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: no disponible (depende del modelo base de 2B, pero no se confirma).
- Opciones de despliegue: al ser un adaptador PEFT en safetensors, requiere cargarse junto al modelo base con la libreria `peft`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skblv/diversity-calibration-wvs-qwen3.5-2b-n1462645-lora | Adaptador LoRA sobre 2B | no disponible | LoRA/PEFT | no disponible | Hugging Face |
| Qwen/Qwen3.5-2B (modelo base) | 2B | no disponible | Transformer decoder | no disponible | Hugging Face |
| Otros adaptadores del estudio arXiv:2609.16454 | Adaptadores LoRA sobre modelos de 2B | no disponible | LoRA/PEFT | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion altamente especializado: solo funciona correctamente con el formato de prompt exacto del entrenamiento (persona demografica, pregunta y opciones con letras); fuera de ese formato su comportamiento no esta garantizado.
- Entrenado sobre un tercio fijo y aleatorio de paises y preguntas de la WVS ronda 7: no cubre el universo completo de paises ni de preguntas, lo que limita la generalizacion.
- Riesgo de alucinacion: el modelo puede generar letras de opcion no presentes entre las opciones dadas o respuestas incoherentes con la pregunta.
- Sesgos conocidos: los sesgos demograficos y culturales del corpus WVS (autoinformado, con sesgo de deseabilidad social y cobertura desigual por pais) pueden reflejarse en las predicciones.
- Limitaciones de contexto e idioma: no se declara cobertura linguistica ni longitud de contexto; el corpus es multinacional pero el entrenamiento no documenta el reparto por idioma.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar el uso comercial; ademas, los datos de la WVS tienen sus propias condiciones de uso (DOI 10.14281/18241.24) que deben respetarse.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad; el tamano reportado es 0.0 GB, lo que sugiere pesos ligeros pero sin garantia de integridad.
- No apto como modelo de proposito general: no se documentan capacidades de codigo, matematicas, tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-2b-n1462645-lora
- Paper: https://arxiv.org/abs/2609.16454
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset WVS ronda 7: https://doi.org/10.14281/18241.24
