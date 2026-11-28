# mradermacher/Tenet-35B-A3B-Qwen3.6-Unslop-v3-i1-GGUF

## Resumen

Tenet-35B-A3B-Qwen3.6-Unslop-v3-i1-GGUF es una distribucion de pesos en formato GGUF del modelo Tenet-35B-A3B-Qwen3.6-Unslop-v3, publicada por el usuario mradermacher. El modelo base, alojado por mr-andrey-isachenko, es un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 35.505.251.456 parametros totales, del que se declaran 3B parametros activos por token segun la nomenclatura A3B del nombre. El repositorio contiene exclusivamente cuantizaciones GGUF generadas con el metodo imatrix/weighted, pensadas para ejecucion en CPU o GPU con llama.cpp y herramientas compatibles.

La relevancia de esta publicacion es practica: permite desplegar un modelo MoE de 35B en hardware de consumo mediante cuantizaciones que van desde IQ1_S hasta Q6_K, cubriendo un rango amplio de compromisos entre calidad y footprint de memoria. El repositorio ocupa 49,8 GB en total, lo que refleja la suma de todas las variantes publicadas. No se dispone de informacion sobre el pipeline, los idiomas soportados ni la licencia en los metadatos de Hugging Face.

El sufijo "Unslop-v3" sugiere un ajuste fino orientado a reducir respuestas genericas o excesivamente complacientes, aunque no se ha publicado documentacion tecnica que lo confirme. La fecha de creacion del repositorio es el 28 de noviembre de 2026 y el modelo no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), segun nomenclatura A3B del nombre; detalles no disponibles |
| Parametros totales | 35.505.251.456 |
| Parametros activos | 3B (segun nomenclatura A3B; no confirmado en model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones imatrix/weighted) |

## Arquitectura y entrenamiento

El modelo base es un MoE de 35,5B parametros totales con aproximadamente 3B parametros activos por token, segun la convencion de nombres A3B. La model card del repositorio GGUF no aporta detalles sobre el numero de expertos, la estrategia de enrutamiento, la longitud de contexto nativa ni la composicion del dataset de entrenamiento. El nombre incluye la referencia "Qwen3.6", lo que sugiere una base derivada de la familia Qwen3.6, pero no se confirma en la informacion disponible.

Las cuantizaciones se han generado con el metodo imatrix/weighted, que utiliza una matriz de importancia calculada sobre un corpus de calibracion para asignar mas bits a los tensores mas sensibles. El autor declara convert_type hf y quantize_version 2, lo que indica una conversion desde pesos Hugging Face con la version 2 del pipeline de cuantizacion de llama.cpp. No hay informacion sobre RLHF, DPO ni procesos de alineacion posteriores al entrenamiento base.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta "conversational" del repositorio.
- Compatibilidad con endpoints, segun la etiqueta "endpoints_compatible".
- Razonamiento y codigo: no confirmado en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un MoE de 35B en GPUs con 24 GB de VRAM, aprovechando que solo se activan unos 3B parametros por token.
- Servicio de chat en CPU: las variantes IQ2 e IQ3 reducen el footprint lo suficiente para inferencia en CPU con llama.cpp, adecuadas para prototipos y entornos sin GPU.
- Evaluacion comparativa de cuantizaciones: el repositorio publica 24 variantes, lo que permite medir la degradacion de calidad frente al modelo base en tareas concretas antes de fijar una cuantizacion para produccion.
- Integracion en pipelines de generacion aumentada por recuperacion (RAG): un modelo conversacional de este tamano puede gestionar resumenes y respuestas sobre documentos recuperados, siempre que se valide la calidad tras la cuantizacion.
- Fine-tuning ligero sobre la base: al estar disponible el modelo original en Hugging Face, se puede ajustar y volver a cuantizar con imatrix para dominios especificos.
- Experimentacion en investigacion: util para estudiar el comportamiento de MoEs de 35B con activacion dispersa bajo distintas precisiones numericas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: depende de la cuantizacion. IQ1_S e IQ2 rondarian 8-12 GB; Q4_K_M e IQ4_XS, en torno a 20-24 GB; Q6_K, aproximadamente 28-30 GB. Estimaciones orientativas a partir del numero de parametros, no confirmadas por el autor.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M e IQ4_XS; A100 40/80 GB y H100 para Q6_K y despliegues con contexto largo.
- GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4 o inferiores; en GPUs de 12-16 GB solo con IQ2/IQ3.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF e imatrix. vLLM y TGI requieren conversion a safetensors o AWQ/GPTQ, no incluidas en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Tenet-35B-A3B-Qwen3.6-Unslop-v3 (este) | 35,5B | ~3B | no disponible | no disponible | GGUF |
| Qwen3-30B-A3B | 30,5B | ~3B | 32K-128K (segun variante) | Apache 2.0 | safetensors, GGUF |
| Mixtral 8x7B | 46,7B | ~12,9B | 32K | Apache 2.0 | safetensors, GGUF |

La comparacion con Qwen3-30B-A3B y Mixtral 8x7B es orientativa por categoria (MoE de tamano medio); no se dispone de datos de rendimiento del modelo evaluado para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No se ha publicado licencia, lo que impide confirmar si el uso comercial esta permitido; conviene contactar con el autor del modelo base antes de usarlo en produccion.
- No hay informacion sobre sesgos, datos de entrenamiento ni procesos de alineacion.
- Riesgo de alucinacion inherente a los modelos generativos; las cuantizaciones agresivas (IQ1, IQ2) pueden incrementarlo.
- La calidad de las cuantizaciones de baja precision no esta validada con benchmarks publicados.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso en la comunidad.
- El modelo base reside en otro repositorio (mr-andrey-isachenko); la trazabilidad de la cadena de derivacion no esta documentada.
- No se confirma la longitud de contexto nativa ni el soporte multilingue.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Tenet-35B-A3B-Qwen3.6-Unslop-v3-i1-GGUF
- Modelo base: https://huggingface.co/mr-andrey-isachenko/Tenet-35B-A3B-Qwen3.6-Unslop-v3
