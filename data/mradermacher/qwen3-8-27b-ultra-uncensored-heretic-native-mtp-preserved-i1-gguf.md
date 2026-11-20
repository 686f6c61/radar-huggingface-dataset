# mradermacher/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-i1-GGUF

## Resumen

Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-i1-GGUF es una cuantizacion GGUF del modelo llmfan46/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved, publicada por el usuario mradermacher. Se trata de una variante "abliterated" o "decensored" de un modelo de la familia Qwen 3.8 con aproximadamente 27.320 millones de parametros (27,32 B), orientada a eliminar las capas de rechazo y moderacion tipicas de los modelos alineados. El autor del modelo base es llmfan46 y la cuantizacion corre a cargo de mradermacher, conocido por producir versiones GGUF con imatrix para llama.cpp.

La relevancia de esta ficha radica en que combina dos elementos poco habituales: por un lado, el proceso "heretic/abliterated" que busca preservar capacidades mientras se eliminan restricciones de rechazo; por otro, la etiqueta "Native-MTP-Preserved", que sugiere la conservacion de Multi-Token Prediction (MTP) en el modelo, una tecnica de decodificacion especulativa que puede acelerar la inferencia. El repositorio incluye cuantizaciones desde Q2_K (11,0 GB) hasta Q6_K (22,5 GB), lo que permite desplegarlo en un rango amplio de hardware.

El modelo se distribuye bajo licencia Apache 2.0 y esta etiquetado como modelo de vision (el autor indica que los ficheros mmproj, si existen, estan en el repositorio estatico). No obstante, la informacion disponible sobre arquitectura interna, contexto y datos de entrenamiento es muy limitada; los datos que no aparecen en la model card se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado de la familia Qwen 3.8; transformer presumiblemente, sin confirmar) |
| Parametros totales | 27.320.697.856 (27,32 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por el nombre y el tamano (27,32 B parametros) se trata presumiblemente de un transformer derivado de la familia Qwen 3.8, pero no se confirma ni el numero de capas, ni la dimension oculta, ni si emplea atencion lineal, mezcla de expertos u otro esquema. La etiqueta "Native-MTP-Preserved" indica que el proceso de modificacion ha intentado conservar el mecanismo de Multi-Token Prediction (MTP) del modelo original, lo que en la practica se traduce en la posibilidad de decodificacion especulativa nativa y, por tanto, en un mayor throughput en inferencia.

Respecto al entrenamiento, la model card no aporta datos sobre numero de tokens, composicion del dataset ni si hubo fases de RLHF o DPO. Las etiquetas "heretic", "uncensored", "decensored" y "abliterated" apuntan a un proceso de edicion de pesos orientado a eliminar la direccion de rechazo en el espacio de activaciones, habitualmente mediante tecnicas de abliteration (proyeccion ortogonal sobre la direccion de refusal). La etiqueta "mpoa" (probablemente Multi-Preference Optimization Alignment u otra variante de alineacion por preferencias) sugiere que se aplico algun tipo de optimizacion por preferencias para reforzar el comportamiento sin censura. No se especifica el volumen de datos ni el procedimiento exacto.

## Capacidades

- Generacion de texto conversacional en ingles, con etiqueta "conversational" en el repositorio.
- Comportamiento sin censura: el proceso heretic/abliterated busca eliminar los rechazos del modelo base ante peticiones que un modelo alineado rechazaria.
- Capacidad multimodal declarada: el autor indica que es un modelo de vision y que los ficheros mmproj, si existen, estan en el repositorio estatico; no se detalla que tareas visuales cubre.
- Soporte de Multi-Token Prediction (MTP) preservado, segun el nombre del modelo, lo que habilita decodificacion especulativa nativa.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma; no se declaran otros idiomas.
- Thinking mode u otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion sobre alineacion y abliteration: el modelo sirve como objeto de estudio para comparar el comportamiento de un modelo base alineado frente a su version heretic, midiendo la tasa de rechazos, la coherencia y la degradacion de capacidades tras la edicion de pesos.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles y que un modelo alineado rechazaria; el modelo esta disenado para no bloquear este tipo de contenido.
- Despliegue local en hardware de consumo: las cuantizaciones i1-Q4_K_M (16,9 GB) e i1-Q4_K_S (15,9 GB) permiten ejecutar el modelo en GPUs con 24 GB de VRAM, como la RTX 4090, mediante llama.cpp u Ollama.
- Evaluacion de robustez y red teaming: util para probar filtros de seguridad, clasificadores de contenido y sistemas de moderacion frente a un modelo que no aplica rechazos propios.
- Prototipado de asistentes conversacionales en ingles: con la cuantizacion i1-Q5_K_M (19,6 GB) se obtiene un equilibrio razonable entre calidad y requisitos de memoria para entornos de desarrollo.
- Experimentacion con decodificacion especulativa: la conservacion de MTP permite medir el impacto del Multi-Token Prediction en throughput y latencia frente a variantes que lo han eliminado.
- Analisis de sesgos y contenido toxico: al carecer de capas de rechazo, el modelo puede emplearse para generar corpus controlados que permitan estudiar sesgos de forma reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano del fichero GGUF y el contexto):
  - i1-Q2_K: 11,0 GB
  - i1-IQ3_S: 12,7 GB
  - i1-Q3_K_M: 13,6 GB
  - i1-IQ4_XS: 15,4 GB
  - i1-Q4_K_S: 15,9 GB
  - i1-Q4_K_M: 16,9 GB
  - i1-Q5_K_M: 19,6 GB
  - i1-Q6_K: 22,5 GB
- GPU recomendadas:
  - Cuantizaciones Q4 y superiores: RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB), A100 (40/80 GB), H100 (80 GB).
  - Cuantizaciones Q2/Q3: GPUs de 12-16 GB, como RTX 4070 Ti o RTX 4080.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones hasta Q6_K, y en GPUs de 12-16 GB con Q2_K e IQ3.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base esta etiquetado como compatible con transformers y con endpoints compatibles.
- Latencia y throughput estimados: no disponible. La presencia de MTP preservado podria mejorar el throughput respecto a variantes sin decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-i1-GGUF (este) | 27,32 B | no disponible | Apache 2.0 | GGUF cuantizado | Version heretic con MTP preservado, solo ingles |
| llmfan46/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved | 27,32 B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar del que deriva este |
| mradermacher/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF | 27,32 B | no disponible | Apache 2.0 | GGUF estatico | Cuantizaciones estaticas del mismo modelo base, sin imatrix |

No se dispone de datos de rendimiento comparado con otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una variante sin censura, es probable que reproduzca y amplifique sesgos presentes en los datos de entrenamiento sin los filtros habituales; no se documentan evaluaciones de sesgo.
- Riesgo de alucinacion: no se han publicado metricas de fidelidad ni evaluaciones de alucinacion; el proceso de abliteration puede degradar la coherencia en tareas de razonamiento.
- Limitaciones de contexto e idioma: solo se declara soporte de ingles; la longitud de contexto no esta disponible y no debe asumirse la del modelo original sin verificar.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido generado por un modelo sin censura puede incurrir en responsabilidades legales segun la jurisdiccion; el usuario asume el riesgo.
- Caveats para produccion: la model card no documenta evaluaciones de calidad, seguridad ni estabilidad; la etiqueta "vision" no especifica que ficheros mmproj estan disponibles ni su ubicacion exacta en el repositorio estatico.
- El modelo base ha sido modificado mediante tecnicas no estandarizadas (heretic/abliterated); los resultados pueden diferir de los del Qwen original y no estan respaldados por el equipo de Qwen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-i1-GGUF
- Modelo base: https://huggingface.co/llmfan46/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
