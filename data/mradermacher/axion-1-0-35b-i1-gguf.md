# mradermacher/Axion-1.0-35B-i1-GGUF

## Resumen

Axion-1.0-35B-i1-GGUF es una coleccion de cuantizaciones GGUF del modelo Axion-1.0-35B, publicada por el usuario mradermacher en HuggingFace. El repositorio no contiene un modelo original, sino una conversion a formato GGUF con cuantizaciones de tipo imatrix y weighted, generadas a partir de los pesos publicados en el repositorio base `Axion1-0/Axion-1.0-35B`. El objetivo es permitir la ejecucion del modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

La informacion disponible es muy limitada. La model card se reduce a comentarios tecnicos del proceso de cuantizacion (version de quantize, tipo de conversion `hf`, lista de quants generados) y al enlace al modelo base. No se documentan arquitectura, contexto, licencia, idiomas ni datos de entrenamiento. El nombre sugiere 35B parametros, pero el dato de parametros totales reportado en safetensors es de 96.047.470, lo que resulta inconsistente con la nomenclatura y probablemente refleja un recuento parcial o erroneo en los metadatos del repo.

El modelo es relevante unicamente como artefacto de despliegue para quien ya conozca y quiera usar Axion-1.0-35B en entornos con recursos limitados. No hay evidencia de benchmarks, adopcion (0 descargas, 0 likes) ni documentacion adicional que permita evaluar su calidad. Se recomienda consultar el repositorio base antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 96.047.470 (dato de safetensors en el repo, inconsistente con el nombre "35B"); el nombre indica 35B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones weighted/imatrix); original en safetensors segun el repo base |
| Tamano del repo | 0,4 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Axion-1.0-35B: ni tipo de transformer, ni si emplea mezcla de expertos, atencion lineal u otro esquema. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o ajuste por preferencias.

Lo unico verificable es el proceso de cuantizacion: el repositorio aplica cuantizaciones con importancia (imatrix) y ponderadas, con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica que los pesos originales se convirtieron desde formato HuggingFace antes de cuantizar. La lista de quants cubre desde IQ1_S hasta Q6_K, lo que permite un rango amplio de compromisos entre tamano y fidelidad.

## Capacidades

- No se documentan capacidades especificas en la informacion disponible.
- Al ser una conversion GGUF del modelo Axion-1.0-35B, heredaria las capacidades del modelo base, pero estas no se detallan en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con llama.cpp: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en GPUs de consumo o en CPU con RAM suficiente, sin depender de servicios en la nube.
- Prototipado en entornos con VRAM limitada: las variantes IQ2_XXS, IQ2_XS e IQ3_XXS reducen el peso del modelo para caber en GPUs de 8-12 GB, a costa de perdida de calidad.
- Evaluacion comparativa de cuantizaciones: la amplia lista de quants permite medir el impacto de la cuantizacion en tareas concretas antes de fijar una variante para produccion.
- Integracion en pipelines de inferencia offline: al ser GGUF, se puede embeber en herramientas como Ollama o llama-cpp-python para tareas de generacion de texto en local.
- Experimentacion academica con modelos de gran tamano en hardware modesto: util para investigadores que quieran reproducir resultados sin acceso a clusters.
- Servicio de inferencia en el borde (edge): las variantes de menor precision pueden ejecutarse en dispositivos con recursos muy limitados, siempre que la calidad sea aceptable para la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma fiable, ya que el dato de parametros del repo (96M) es inconsistente con el nombre (35B). Como referencia orientativa, un modelo de 35B en Q4_K_M requeriria del orden de 20-22 GB de VRAM, y en Q2_K alrededor de 12-14 GB, pero estas cifras no estan confirmadas por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Cabe en GPU de consumo: no confirmado; dependeria del tamano real del modelo base.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, llama-cpp-python, LM Studio, koboldcpp). vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria, tamano o tarea, ni datos de rendimiento que permitan establecer una comparacion rigurosa.

## Limitaciones y advertencias

- La model card no documenta licencia, por lo que se desconoce si el uso comercial esta permitido; es imprescindible consultar el repositorio base `Axion1-0/Axion-1.0-35B`.
- Existe una inconsistencia entre el nombre del modelo (35B) y el recuento de parametros reportado (96.047.470), lo que impide estimar con fiabilidad requisitos de hardware.
- No hay informacion sobre sesgos, riesgo de alucinacion ni limitaciones de contexto o idioma.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validacion por parte de la comunidad.
- Las cuantizaciones de baja precision (IQ1_S, IQ1_M, IQ2_XXS) pueden degradar notablemente la calidad; no se han publicado evaluaciones que cuantifiquen esa perdida.
- Al ser una conversion de terceros, no hay garantia de que los pesos originales se hayan convertido correctamente; conviene verificar la integridad de los ficheros GGUF antes de usarlos en produccion.
- La fecha de creacion del repositorio (2026-11-05) es posterior a la fecha actual en muchos entornos, lo que puede indicar metadatos anomalos y aconseja precaucion adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Axion-1.0-35B-i1-GGUF
- Modelo base: https://huggingface.co/Axion1-0/Axion-1.0-35B
