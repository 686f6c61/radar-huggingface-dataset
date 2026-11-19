# mradermacher/Qwen3.6-35B-A3B-Westernized-i1-GGUF

## Resumen

Qwen3.6-35B-A3B-Westernized-i1-GGUF es una cuantizacion GGUF del modelo Qwen3.6-35B-A3B-Westernized, publicada por el usuario mradermacher en Hugging Face. Se trata de una conversion a formato GGUF mediante cuantizacion con imatrix (matriz de importancia) a partir de los pesos originales de hirundo-io, lo que permite ejecutar el modelo en entornos de inferencia locales como llama.cpp u Ollama. El modelo base pertenece a la familia Qwen3.6 en su variante MoE (Mixture of Experts) con 35.505.251.456 parametros totales y la designacion A3B, que indica aproximadamente 3.000 millones de parametros activos por token.

La relevancia de esta publicacion radica en que ofrece un abanico amplio de niveles de cuantizacion (desde IQ1_S hasta Q6_K) sobre un modelo de 35B con arquitectura de mezcla de expertos, lo que permite desplegarlo en hardware de consumo con perdidas controladas de calidad. El repositorio ocupa 13,6 GB, lo que sugiere que el conjunto de cuantizaciones incluye niveles bajos y medios, aunque el peso individual de cada fichero no se detalla en la informacion disponible.

No se dispone de informacion sobre la licencia, los idiomas soportados ni la model card del modelo base en la informacion proporcionada. El autor de la cuantizacion indica que se trata de "weighted/imatrix quants" del modelo de hirundo-io, una practica habitual para preservar la calidad en niveles de compresion agresivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun la designacion A3B del nombre |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3.000 millones (inferido de la designacion A3B; no confirmado en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizado, con imatrix) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de lo que se deduce de su nombre: se trata de un transformer con mezcla de expertos (MoE) de 35.505 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token (designacion A3B). No se especifican el numero de expertos, la estrategia de enrutamiento, la longitud de contexto nativa ni la composicion del dataset de entrenamiento.

El proceso de cuantizacion aplicado por mradermacher utiliza matrices de importancia (imatrix) y ponderacion por capas, una tecnica que asigna precision de forma no uniforme segun la sensibilidad de cada tensor. El repositorio incluye metadatos que indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que la conversion se realizo desde pesos en formato Hugging Face. No hay informacion sobre si el modelo base recibio RLHF, DPO u otras fases de alineamiento, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo esta orientado a dialogos multi-turno.
- Razonamiento y conocimiento general: heredado del modelo base Qwen3.6, aunque no se detallan capacidades especificas en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el formato GGUF puede servirse mediante infraestructura de inferencia estandar.

## Casos de uso

- Inferencia local en estaciones de trabajo: gracias a las cuantizaciones de 4 y 5 bits (Q4_K_M, Q5_K_M), el modelo puede ejecutarse en GPUs de consumo con 24 GB de VRAM, como la RTX 4090, manteniendo un equilibrio razonable entre calidad y velocidad.
- Despliegue en servidores con multiples usuarios: las variantes Q6_K y Q5_K_M ofrecen mayor fidelidad respecto al modelo original y son adecuadas para servicios de generacion de texto servidos con llama.cpp o vLLM (este ultimo con soporte GGUF limitado).
- Prototipado rapido de asistentes conversacionales: la cuantizacion Q4_K_M permite iterar sobre prompts y flujos de dialogo en un portatil con GPU dedicada sin necesidad de infraestructura en la nube.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 24 variantes, lo que facilita estudios de degradacion de calidad entre niveles IQ1 y Q6 sobre un mismo modelo base.
- Entornos con restricciones de memoria: las variantes IQ2 e IQ3 permiten ejecutar un modelo de 35B en GPUs de 8-12 GB, con la consiguiente perdida de calidad, util para experimentacion o tareas de baja exigencia.
- Integracion en pipelines de CI/CD para generacion de texto: mediante llama.cpp como biblioteca, el modelo puede invocarse desde scripts de automatizacion para tareas de resumen o clasificacion, aunque la licencia no confirmada obliga a verificar su idoneidad comercial antes de usarlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion, calculo orientativo a partir de los 35.505 millones de parametros):
  - IQ1_S / IQ2_XXS: aproximadamente 10-13 GB.
  - Q3_K_M / IQ3_M: aproximadamente 15-17 GB.
  - Q4_K_M / IQ4_XS: aproximadamente 19-22 GB.
  - Q5_K_M: aproximadamente 23-26 GB.
  - Q6_K: aproximadamente 27-30 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q6_K y despliegues concurrentes; RTX 3090 (24 GB) como alternativa de consumo.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB, solo cuantizaciones IQ3 o inferiores) y GPUs con 12 GB unicamente en variantes IQ2.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF. vLLM y TGI tienen soporte GGUF limitado o experimental.
- Latencia y throughput estimados: no disponibles. Al tratarse de un MoE con aproximadamente 3.000 millones de parametros activos, se espera un throughput superior al de un modelo denso de 35B, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Westernized-i1-GGUF (este) | 35.505 millones | Aproximadamente 3.000 millones | No disponible | No disponible | GGUF |
| Qwen3-30B-A3B (referencia de la familia Qwen3) | 30.500 millones | Aproximadamente 3.300 millones | No disponible en esta ficha | No disponible | Safetensors, GGUF |
| Mixtral 8x7B | 46.700 millones | Aproximadamente 12.900 millones | 32.000 tokens | Apache 2.0 | Safetensors, GGUF |

La comparativa con Qwen3-30B-A3B y Mixtral 8x7B se ofrece como referencia de categoria MoE, pero los datos de contexto y licencia del modelo base Qwen3.6-35B-A3B-Westernized no estan confirmados en la informacion disponible.

## Limitaciones y advertencias

- Licencia no disponible: no es posible confirmar si el uso comercial esta permitido; debe verificarse en el repositorio del modelo base antes de cualquier despliegue en produccion.
- Idiomas no confirmados: se desconoce la cobertura linguistica real, lo que impide garantizar calidad en castellano.
- Riesgo de alucinacion: inherente a los modelos generativos; las cuantizaciones de baja precision (IQ1, IQ2) pueden incrementar la incoherencia y los errores factuales.
- Perdida de calidad por cuantizacion: las variantes IQ1_S, IQ1_M e IQ2_XXS degradan notablemente el rendimiento respecto a los pesos originales; no se recomiendan para tareas de razonamiento complejo.
- Sin benchmarks publicados: no hay mediciones que permitan comparar la calidad de cada cuantizacion con el modelo base.
- Contexto desconocido: se desconoce la ventana de contexto nativa, lo que limita la planificacion de casos de uso con documentos largos.
- Repositorio sin descargas ni likes en el momento de la consulta: la adopcion es nula, por lo que no hay validacion comunitaria del funcionamiento de las cuantizaciones.
- Ausencia de model card detallada: no se documentan sesgos conocidos, composicion del dataset ni limitaciones especificas del modelo base.

## Enlaces

- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Westernized-i1-GGUF
- Modelo base (referenciado en la model card): https://huggingface.co/hirundo-io/Qwen3.6-35B-A3B-Westernized
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
