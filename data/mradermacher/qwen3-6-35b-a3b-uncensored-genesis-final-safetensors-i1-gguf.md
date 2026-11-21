# mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-Safetensors-i1-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored-Genesis-Final-Safetensors-i1-GGUF es una cuantizacion GGUF del modelo LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-Safetensors, publicada por el usuario mradermacher. Se trata de un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 35.505.251.456 parametros totales y 3.000 millones de parametros activos por token (segun la nomenclatura A3B del nombre), derivado de la familia Qwen3.6/Qwen3.5 y con capacidades multimodales (vision) declaradas en sus etiquetas.

El modelo base es una variante "uncensored" (sin alineamiento restrictivo) afinada por LuffyTheFox sobre la arquitectura Qwen, y esta cuantizacion emplea el formato i1 (imatrix) de mradermacher, que aplica una matriz de importancia para preservar la calidad en cuantizaciones de baja precision. El repositorio incluye 17 variantes de cuantizacion entre 13,3 GB y 29,3 GB, lo que permite desplegarlo en hardware de consumo.

Su relevancia actual radica en que ofrece un MoE de 35B con activacion de 3B (eficiente en inferencia) en formato GGUF listo para llama.cpp/Ollama, con licencia Apache 2.0, y con soporte multimodal declarado. No obstante, la model card del cuantizador es puramente tecnica (listado de quants) y no aporta informacion sobre entrenamiento, contexto o benchmarks, por lo que muchos datos de esta ficha quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, derivada de Qwen3.6/Qwen3.5 (segun etiquetas del autor) |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | 3B (aproximado, segun nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_S, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, mas imatrix base; existen quants estaticos en repositorio separado |
| Idiomas soportados | en, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors y bfloat16 |

## Arquitectura y entrenamiento

La informacion disponible confirma que el modelo emplea una arquitectura Mixture of Experts con 35,5B parametros totales y aproximadamente 3B activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. Las etiquetas indican herencia de la familia Qwen3.6/Qwen3.5, soporte multimodal (vision) y compatibilidad con transformers y vLLM en su version base en bfloat16.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el proceso de alineamiento (RLHF/DPO) ni innovaciones tecnicas especificas del modelo base. La model card del cuantizador solo documenta el proceso de cuantizacion: uso de matriz de importancia (imatrix) para generar los quants i1, con la recomendacion habitual de que los quants IQ superan a los no-IQ de tamano similar. El autor menciona agradecimientos a nicoboss por acceso a un supercomputador privado para generar los imatrix.

## Capacidades

- Generacion de texto conversacional y multirrol (etiqueta "conversational").
- Razonamiento y respuesta a instrucciones, presumiblemente heredadas del modelo Qwen base.
- Capacidades multimodales de vision (etiquetas "vision" y "multimodal").
- Soporte multilingue (etiqueta "multilingual", aunque solo "en" figura explicitamente en el campo language).
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Variante "uncensored": menor rechazo a contenido sensible, segun la denominacion del autor.
- No se documenta explicitamente soporte de tool calling, function calling ni modo thinking en la informacion disponible.

## Casos de uso

- Despliegue local en estacion de trabajo: con quants i1-Q4_K_M (21,8 GB) el modelo cabe en GPUs de consumo de 24 GB (RTX 3090/4090) y permite conversacion multirrol sin conexion, gracias a la activacion de solo 3B parametros.
- Prototipado de asistentes multimodales: la etiqueta vision sugiere uso en tareas de descripcion de imagenes y VQA, aunque la capacidad debe validarse empiricamente al no haber benchmarks publicados.
- Generacion de texto creativo sin filtros: la variante uncensored es adecuada para escritura de ficcion, guiones o contenido adulto donde los modelos alineados rechazan peticiones.
- Servicio de inferencia con vLLM: el modelo base en bfloat16 y formato safetensors es compatible con vLLM, lo que permite servir el MoE con throughput alto en GPUs de datacenter (A100/H100) aprovechando la activacion dispersa.
- Experimentacion en investigacion sobre MoE: util para estudiar el comportamiento de un MoE de 35B con 3B activos en tareas de razonamiento, con la ventaja de disponer de 17 niveles de cuantizacion para analizar la degradacion por precision.
- Fine-tuning y destilacion: al estar bajo Apache 2.0 y disponible en safetensors, puede servir como base para ajuste fino o para generar datos sinteticos en pipelines propios.
- Evaluacion de alineamiento: como modelo "uncensored", es util en estudios comparativos sobre sesgos y rechazos frente a modelos alineados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - i1-Q2_K: 13,3 GB.
  - i1-IQ3_S / i1-IQ3_M: 15,7-15,9 GB.
  - i1-Q4_K_S / i1-Q4_K_M: 20,5-21,8 GB.
  - i1-Q5_K_M: 25,4 GB.
  - i1-Q6_K: 29,3 GB.
- GPU de consumo: los quants Q4 caben en RTX 3090/4090 (24 GB); los Q2/IQ3 caben en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4080) con contexto limitado; los Q5/Q6 requieren 32 GB o reparto CPU/GPU.
- GPU de datacenter: A100 40/80 GB y H100 permiten ejecutar el modelo base en bfloat16 (aprox. 71 GB para 35,5B parametros) o quants altos con contexto amplio.
- Opciones de despliegue: llama.cpp y Ollama para los GGUF; vLLM y transformers para el modelo base safetensors; TGI no confirmado.
- Latencia y throughput: no disponibles. Por la activacion de 3B parametros se espera un throughput superior al de un modelo denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Final (este) | 35,5B / ~3B | no disponible | Apache 2.0 | GGUF, safetensors | Variante uncensored con vision declarada |
| Qwen3-30B-A3B (familia Qwen3) | 30,5B / 3,3B | 32.768-131.072 tokens (segun variante) | Apache 2.0 | safetensors, GGUF | MoE de referencia de la familia; contexto y benchmarks publicos |
| Mixtral 8x7B | 46,7B / 12,9B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | MoE mas antiguo y con mas parametros activos |
| DeepSeek-V2-Lite | 15,7B / 2,4B | 32.768 tokens | MIT (codigo) / licencia propia | safetensors | MoE eficiente de menor tamano |

La comparacion con Qwen3-30B-A3B es la mas directa por familia y tamano, pero los datos de contexto y rendimiento de este modelo concreto no estan publicados, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- La model card no documenta el proceso de entrenamiento, el contexto maximo ni los benchmarks, lo que impide validar sus capacidades antes de produccion.
- Al ser una variante "uncensored", el modelo puede generar contenido sensible, ofensivo o inseguro; requiere moderacion externa en aplicaciones publicas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay evaluaciones publicadas de fidelidad.
- El soporte multilingue solo esta declarado de forma generica; el unico idioma listado explicitamente es el ingles.
- La capacidad de vision esta declarada en etiquetas pero no verificada en la documentacion; conviene probarla antes de integrarla.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base es un derivado de Qwen y conviene revisar los terminos de la familia original.
- El repositorio ocupa 279,2 GB por incluir todas las cuantizaciones; descargar solo el archivo GGUF necesario.
- La fecha de creacion (2026-10-04) y la denominacion Qwen3.6 no permiten confirmar la procedencia oficial del modelo base; verificar el repositorio de LuffyTheFox antes de confiar en el.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-Safetensors-i1-GGUF
- Modelo base: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-Safetensors
- Quants estaticos: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-Safetensors-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Uncensored-Genesis-Final-Safetensors-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
