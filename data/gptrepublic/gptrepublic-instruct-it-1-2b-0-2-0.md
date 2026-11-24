# GPTrepublic/GPTrepublic-Instruct-IT-1.2B-0.2.0

## Resumen

GPTrepublic-Instruct-IT-1.2B-0.2.0 es un ajuste fino experimental del modelo LiquidAI/LFM2.5-1.2B-Instruct, desarrollado por GPTrepublic. Se trata de una adaptacion de instrucciones para italiano que fusiona un adaptador de idioma (LoRA) dentro de los pesos base; no es un modelo preentrenado desde cero. El modelo conserva la arquitectura original de Liquid AI (familia LFM2.5) y sus 1.170.340.608 parametros, y se distribuye tanto en pesos Hugging Face (safetensors) como en una cuantizacion GGUF Q4_K_M para despliegue en CPU.

La relevancia de esta publicacion es fundamentalmente metodologica y de investigacion: el propio autor la etiqueta como "experimental research/test release" y declara explicitamente que no ha superado las puertas de cualificacion automaticas ni humanas. El modelo muestra regresiones en italiano y en capacidades funcionales (respuestas irrelevantes o demasiado largas), por lo que no debe considerarse una version lista para produccion. Su interes radica en documentar el proceso de adaptacion linguistica sobre una base pequena y en servir de referencia para quienes investigan fusion de adaptadores, evaluacion multilingue con Belebele y cuantizacion.

El modelo declara soporte para nueve idiomas (italiano, ingles, arabe, chino, frances, aleman, japones, coreano y espanol), aunque el autor advierte que esas etiquetas identifican objetivos de evaluacion, no un soporte linguistico certificado. La licencia es la LFM Open License v1.0 del modelo original, heredada sin modificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM2.5 de Liquid AI; detalles completos no disponibles en la informacion proporcionada) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unica cuantizacion publicada en el repositorio) |
| Idiomas soportados | it, en, ar, zh, fr, de, ja, ko, es (etiquetas de evaluacion, no certificadas) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (pesos HF fusionados) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-1.2B-Instruct, un transformer de aproximadamente 1.170 millones de parametros. GPTrepublic no ha preentrenado el modelo: ha fusionado un adaptador de instrucciones en italiano (LoRA) dentro de los pesos base, manteniendo el tokenizador, la plantilla de chat y la licencia originales sin cambios. Los adaptadores especialistas restantes se mantienen separados del modelo publicado.

El entrenamiento se realizo sobre 119.056 ejemplos, con 80.500.243 tokens de entrada y 1,0 epoca completada. La revision original de la receta congelada es `b9d816ab510f9a28dca37cb182e9da8b0226e13c`; los hashes, la receta y las fuentes se documentan en los directorios `provenance/` y `notices/`. No se especifica en la informacion disponible la composicion exacta del dataset ni si hubo fases de RLHF o DPO. El autor indica que el adaptador especifico de tarea debe entrenarse sobre estos pesos HF fusionados exactos, no sobre la base original de Liquid AI ni directamente sobre el GGUF.

## Capacidades

- Generacion de texto conversacional e instrucciones en el formato de chat de LFM2.5 (se debe aplicar la plantilla del tokenizador con `add_generation_prompt=True`).
- Adaptacion de instrucciones en italiano mediante el adaptador fusionado, aunque con regresiones documentadas en esa lengua.
- Cobertura multilingue declarada para nueve idiomas, sujeta a evaluacion y no certificada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking), vision o audio: no disponible en la informacion proporcionada.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema Transformers 4.57.3 o la version probada en el informe de entrenamiento.

## Casos de uso

- Investigacion sobre fusion de adaptadores LoRA: el repositorio documenta hashes, receta congelada y fuentes, lo que permite reproducir el experimento de fusion de un adaptador de idioma sobre una base pequena.
- Evaluacion comparativa de cuantizacion: la publicacion incluye resultados Belebele en HF y en CPU Q4_K_M, lo que permite estudiar el impacto de la cuantizacion en tareas de comprension lectora multilingue (con la cautela de que los recuentos de preguntas difieren: 900 frente a 200).
- Despliegue en CPU para pruebas de concepto: el archivo GGUF Q4_K_M esta pensado como candidato de despliegue en CPU, util para validar pipelines en entornos sin GPU.
- Estudio de regresiones multilingues: las tablas de evaluacion documentan perdidas de rendimiento en italiano y en otras lenguas, lo que sirve como caso de analisis de fallos en adaptacion linguistica.
- Base para adaptadores especificos de tarea: el autor indica que los adaptadores de tarea deben entrenarse sobre estos pesos fusionados exactos, lo que lo convierte en punto de partida para experimentos de especializacion.
- Pruebas de infraestructura de runtime con modelo residente y cache KV por adaptador: la model card describe un esquema de identidad de cache basado en pesos base, tokenizador y adaptador/version activos, util para validar arquitecturas de enrutamiento y carga en caliente.
- Docencia y formacion: por su tamano reducido y su caracter experimental, sirve para ilustrar el ciclo completo de publicacion de un modelo (entrenamiento, evaluacion, cuantizacion, licencia y trazabilidad).

## Benchmarks y rendimiento

Los unicos datos publicados son de Belebele con formato de respuesta restringido. El autor advierte que los fallos de formato afectan a las puntuaciones y que las columnas HF y Q4 usan recuentos de preguntas distintos, por lo que su diferencia no constituye una estimacion emparejada de cuantizacion.

| Idioma | Preguntas HF | HF original | HF italiano | Preguntas CPU Q4 | Q4 original | Q4 italiano |
|---|---:|---:|---:|---:|---:|---:|
| it | 900 | 41,22 % | 40,00 % | 200 | 34,50 % | 21,50 % |
| en | 900 | 52,89 % | 60,89 % | 200 | 45,50 % | 54,00 % |
| ar | 900 | 42,11 % | 45,56 % | 200 | 41,50 % | 40,50 % |
| zh | 900 | 43,78 % | 54,44 % | 200 | 41,50 % | 45,00 % |
| fr | 900 | 45,67 % | 48,44 % | 200 | 44,50 % | 33,00 % |
| de | 900 | 45,67 % | 49,44 % | 200 | 48,50 % | 35,50 % |
| ja | 900 | 44,33 % | 48,00 % | 200 | 41,00 % | 29,00 % |
| ko | 900 | 41,78 % | 50,33 % | 200 | 35,00 % | 38,50 % |
| es | 900 | 39,56 % | 41,22 % | 200 | 42,50 % | 28,00 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 1,17 mil millones de parametros, los pesos en precision completa (fp16/bf16) ocuparian aproximadamente 2,3 GB, y la cuantizacion Q4_K_M reduce esa cifra de forma sustancial, aunque el autor no publica la cifra exacta.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, el modelo es compatible con GPU de consumo, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano, aunque no se detalla que tarjetas concretas (RTX 4090, etc.).
- Opciones de despliegue: Transformers 4.57.3 o la version probada en el informe de entrenamiento para los pesos HF; el GGUF Q4_K_M esta orientado a despliegue en CPU. No se confirma compatibilidad con vLLM, TGI, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.
- Integridad del artefacto: el Q4 tiene SHA256 `89e2108998d1c0774eb37d2b8fcc879e0b12362a9acba8ebf3604d6640cb89c5`; el autor recomienda fijar el commit del repositorio ademas de este checksum al configurar nodos expertos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| GPTrepublic-Instruct-IT-1.2B-0.2.0 | 1.170.340.608 | no disponible | LFM Open License v1.0 | Experimental, no cualificado | Ajuste fino de instrucciones en italiano fusionado sobre LFM2.5-1.2B |
| LiquidAI/LFM2.5-1.2B-Instruct | aproximadamente 1,2 B (segun denominacion) | no disponible | LFM Open License v1.0 | Modelo base oficial | Base sin el adaptador italiano; referencia de comparacion directa |
| Otros modelos de aproximadamente 1 B de parametros | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada mas alla de las columnas "original" e "italiano" de Belebele, que comparan el modelo base frente al ajustado dentro de la propia publicacion.

## Limitaciones y advertencias

- El autor declara explicitamente que la publicacion es experimental, que las puertas de cualificacion automaticas y humanas no se han superado y que no es una version de produccion.
- Se documentan regresiones en italiano y en capacidades funcionales, incluidas respuestas irrelevantes o demasiado largas; no se garantizan matematicas, seguimiento fiable de instrucciones ni italiano fluido.
- Las etiquetas de idioma identifican objetivos de evaluacion, no un soporte linguistico certificado.
- Los resultados de Belebele se obtuvieron con formato de respuesta restringido y los fallos de formato afectan a las puntuaciones; ademas, las columnas HF y Q4 usan recuentos de preguntas distintos, por lo que no son directamente comparables.
- La revision humana esta incompleta segun la model card.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero relevante dado el caracter experimental y las regresiones funcionales observadas.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Restricciones de licencia: se hereda la LFM Open License v1.0 sin modificaciones; deben revisarse sus terminos para uso comercial, ya que la licencia se clasifica como "other".
- El estado de cache KV de una base anterior es incompatible con esta revision; los estados especificos de adaptador deben mantenerse por separado.
- La publicacion no certifica el enrutamiento de produccion, la carga en caliente ni la restauracion de cache en el cliente GPTrepublic.
- No se sube el corpus de entrenamiento en bruto ni las respuestas en crudo ni las conversaciones de usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GPTrepublic/GPTrepublic-Instruct-IT-1.2B-0.2.0
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Licencia LFM Open License v1.0: incluida en el archivo LICENSE del repositorio (enlace directo no disponible)
- Evaluacion de cualificacion: `evaluation/qualification.json` dentro del repositorio (enlace directo no disponible)
- Procedencia y receta: directorio `provenance/` del repositorio (enlace directo no disponible)
- Atribuciones de dataset: `notices/ATTRIBUZIONI.md` (enlace directo no disponible)
- Hashes de publicacion: `gptrepublic-publication.json` (enlace directo no disponible)
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada
