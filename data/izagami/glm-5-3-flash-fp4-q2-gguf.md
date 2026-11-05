# izagami/GLM-5.3-Flash-FP4-Q2-GGUF

## Resumen

GLM-5.3-Flash-FP4-Q2-GGUF es una cuantización experimental de 2 bits de los expertos enrutados del modelo GLM-5.3-Flash, publicada por el usuario izagami a partir de la versión NVFP4 de NVIDIA (nvidia/GLM-5.3-Flash-FP4-Local). El objetivo es reducir el peso en disco hasta 98,7 GB frente a los 184,4 GB de la variante de 4 bits, manteniendo el resto de componentes (atención, embeddings, `lm_head` en Q6_K y capa MTP 45) sin modificar respecto a unsloth/GLM-5.3-Flash-GGUF. Se trata de un artefacto de investigación, no de un modelo entrenado por el autor.

La relevancia es doble: por un lado, demuestra una ruta de compresión agresiva (Q2_0 con feedback de error hessiano) sobre un modelo de arquitectura MoE; por otro, documenta de forma transparente la degradación resultante y los problemas de integración con el motor de inferencia. El autor advierte explícitamente de que no se ha realizado entrenamiento de escalas y de que se pierde precisión frente a la fuente de 4 bits.

No hay información disponible sobre el número de parámetros totales, la longitud de contexto nativa ni la composición del dataset de entrenamiento del modelo base; la model card solo describe el proceso de cuantización y algunos resultados de evaluación parciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GLM-5.3-Flash; el artefacto es una cuantización GGUF de sus expertos enrutados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base es de tipo MoE, con expertos enrutados en capas 3 a 44) |
| Longitud de contexto | no disponible (los contextos largos figuran como no probados) |
| Tipos de cuantizacion | Q2_0 en expertos enrutados (2 bits por peso, una escala fp16 por cada 64 pesos); `lm_head` en Q6_K; resto de componentes sin cuantizar respecto a la fuente |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (el metadata GGUF indica `mit` por herencia, pero no describe este archivo) |
| Formato de pesos | GGUF (98,7 GB) |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo nuevo: cuantiza los expertos enrutados de las capas 3 a 44 del modelo base NVFP4 mediante un esquema tipo GPTQ hacia Q2_0, usando activaciones registradas por experto. Aplica feedback de error hessiano con amortiguamiento 0,1, un prior de capa de 256 sobre la matriz `down` y escala con signo; los valores permitidos son {-1, 0, 1, 2}, con una escala fp16 cada 64 pesos. Todo lo demás (atención, embeddings, `lm_head` en Q6_K y la capa MTP 45) se copia sin cambios desde unsloth/GLM-5.3-Flash-GGUF.

El error retenido por experto se sitúa entre el 30 % y el 46 % (mediana del 42 %), frente a aproximadamente el 20 % sobre los datos de calibración. El autor señala que no se ha hecho entrenamiento de escalas, lo que explica parte de esa brecha. No hay información disponible sobre la arquitectura interna del modelo base, el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: el modelo base es de propósito general; el autor reporta resultados en MMLU-Pro, GSM8K y HumanEval sobre esta cuantización.
- Código: HumanEval entre 90,0 % y 96,7 % según la ejecución, con variabilidad entre pasadas.
- Matemáticas: GSM8K con 96,7 % en 30 preguntas y 86,6 % en 440 preguntas.
- Modo thinking: existe en el modelo base, pero figura como no probado en esta cuantización (los resultados se obtuvieron con thinking desactivado).
- Tool calling: soportado por el modelo base según la model card, pero no probado en esta build.
- Contextos largos: no probados en esta cuantización.
- Capacidades multilingües: no disponible.

## Casos de uso

- Evaluación de técnicas de cuantización extrema: sirve como banco de pruebas para investigar el impacto de Q2_0 con feedback hessiano en modelos MoE, comparando directamente contra la fuente de 4 bits con el mismo conjunto de preguntas.
- Despliegue en hardware con memoria limitada: con 98,7 GB, permite cargar el modelo en configuraciones donde los 184,4 GB de la variante de 4 bits no caben, a costa de precisión.
- Experimentación en GPUs Intel: es el escenario validado por el autor (tres Intel Arc Pro B70 con XeStrata parcheado), útil para equipos que trabajan con este stack.
- Pruebas de rendimiento de decodificación: el autor mide 48-57 tokens por segundo frente a 10-18 de la versión de 4 bits, lo que lo hace adecuado para prototipos interactivos donde la latencia importa más que la exactitud.
- Investigación sobre degradación por cuantización: la tabla comparativa de MMLU-Pro, GSM8K y HumanEval permite estudiar qué tareas toleran mejor la compresión a 2 bits (GSM8K y HumanEval se mantienen; MMLU-Pro cae unos 9 puntos).
- Reproducción de pipelines de cuantización GPTQ sobre NVFP4: el detalle metodológico de la model card facilita replicar el proceso sobre otros modelos con estructura de expertos similar.

## Benchmarks y rendimiento

Resultados reportados por el autor con thinking desactivado, temperatura 0, una petición a la vez, sobre tres Intel Arc Pro B70.

| Test | Esta versión (2 bits) | Fuente de 4 bits |
|---|---:|---:|
| MMLU-Pro, 56 preguntas | 58,9 % | 67,9 % |
| GSM8K, 30 preguntas | 96,7 % | 93,3 % |
| HumanEval, 30 problemas | 90,0-96,7 % (varía entre ejecuciones) | 93,3 % |
| MMLU-Pro, 280 preguntas | 60,7 % | no medido |
| GSM8K, 440 preguntas | 86,6 % | no medido |

Rendimiento de decodificación: aproximadamente 48-57 tokens por segundo, frente a 10-18 de la fuente de 4 bits.

## Requisitos de hardware

- Tamaño en disco: 98,7 GB para el archivo GGUF completo.
- VRAM estimada para inferencia: no disponible de forma explícita; el autor lo ejecuta en tres Intel Arc Pro B70, lo que sugiere que no cabe en una única GPU de consumo.
- GPU recomendadas: Intel Arc Pro B70 (único hardware validado); no hay datos para A100, H100 o RTX 4090.
- GPU de consumo: no se confirma que quepa en ninguna; el tamaño del archivo supera la VRAM de las tarjetas consumer habituales.
- Opciones de despliegue: únicamente XeStrata con un parche local (`xestrata-q2-wide-experts.patch`) que permite ejecutar en CPU las capas Q2_0 más anchas que el búfer de activaciones cuantizadas del motor. No se ha probado con llama.cpp, vLLM, Ollama ni TGI.
- Latencia y throughput: 48-57 tokens por segundo en la configuración descrita.
- Ajuste obligatorio: desactivar el intercambio adaptativo de expertos con `--adapt-every 0`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | GSM8K | HumanEval | Licencia | Tamaño |
|---|---|---|---|---|---|---|---|
| izagami/GLM-5.3-Flash-FP4-Q2-GGUF | no disponible | no disponible | 58,9-60,7 % | 86,6-96,7 % | 90,0-96,7 % | NVIDIA Open Model Agreement | 98,7 GB |
| nvidia/GLM-5.3-Flash-FP4-Local (fuente 4 bits) | no disponible | no disponible | 67,9 % | 93,3 % | 93,3 % | no disponible | 184,4 GB |
| unsloth/GLM-5.3-Flash-GGUF | no disponible | no disponible | no medido | no medido | no medido | MIT (según la model card) | no disponible |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de precisión documentada: MMLU-Pro cae de 67,9 % a 58,9 % (56 preguntas) y el error retenido por experto es del 30-46 % (mediana 42 %) frente al ~20 % en calibración.
- Sin entrenamiento de escalas: el autor indica que es una primera versión experimental y que pierde exactitud frente a la fuente de 4 bits.
- Fallo del intercambio adaptativo de expertos: con `--adapt-every` activado, las respuestas se vuelven incorrectas durante el resto de la sesión tras una carga de trabajo variada (4/16 y 6/16 aciertos frente a 15/16 con el intercambio desactivado); la causa no está identificada y no se ha probado si la versión de 4 bits presenta el mismo problema.
- Compatibilidad muy restringida: solo se ha probado en una build local modificada de XeStrata para GPUs Intel; no carga en una build sin parchear. El parche no se ha validado de forma aislada.
- Capacidades sin verificar: tool calling, modo thinking y contextos largos figuran como no probados.
- Metadata incorrecta: el GGUF declara `general.license = mit` y `general.quantized_by = Unsloth`, heredados del archivo fuente; no describen este artefacto. La licencia aplicable es la NVIDIA Open Model Agreement.
- Restricciones de licencia: el uso comercial está sujeto a los términos de la NVIDIA Open Model Agreement, no a MIT.
- Riesgo de alucinación y sesgos: no hay información específica publicada para esta cuantización; la degradación por compresión a 2 bits puede amplificar errores en tareas de conocimiento factual.
- Idiomas soportados: no disponible, lo que impide garantizar calidad multilingüe.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; creado y actualizado el mismo día, sin historial de validación por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/izagami/GLM-5.3-Flash-FP4-Q2-GGUF
- Modelo base (NVIDIA): https://huggingface.co/nvidia/GLM-5.3-Flash-FP4-Local
- GGUF de referencia (Unsloth): https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Motor de inferencia XeStrata: https://github.com/MistVVK/XeStrata
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
