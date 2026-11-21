# mradermacher/Qwen3.8-27B-Perplexing-Pegasus-Heretic-i1-GGUF

## Resumen

Qwen3.8-27B-Perplexing-Pegasus-Heretic-i1-GGUF es una cuantizacion en formato GGUF del modelo webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic, un derivado de la familia Qwen 3.5 (segun la etiqueta `qwen3_5` de la model card) con 27.320.697.856 parametros totales. Lo publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face, y su proposito principal es ofrecer versiones ligeras y ejecutables en hardware de consumo de un modelo de gran tamano que, en su formato original en safetensors, resulta dificil de desplegar.

El modelo base incorpora las etiquetas `heretic`, `abliterated`, `uncensored` y `decensored`, lo que indica que ha sido sometido a un proceso de "abliteration" (eliminacion o reduccion de los mecanismos de rechazo del modelo original). Tambien aparecen etiquetas como `typed-decisions`, `mtp`, `systemone`, `conversational` y `multimodal`, que sugieren capacidades conversacionales y de vision. La licencia declarada es Apache 2.0.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 27B en GPUs de consumo mediante cuantizacion GGUF con imatrix, manteniendo un equilibrio entre calidad y requisitos de memoria. El repositorio ocupa 218,6 GB e incluye 15 variantes de cuantizacion desde i1-Q2_K (11,0 GB) hasta i1-Q6_K (22,5 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5, segun etiqueta `qwen3_5`; detalles no disponibles) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, imatrix |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de la etiqueta `qwen3_5`, que lo situa en la familia Qwen 3.5 de Alibaba. Se trata, por tanto, de un transformer con 27.320.697.856 parametros totales. Las etiquetas `mtp` (multi-token prediction) y `typed-decisions` sugieren innovaciones tecnicas en la generacion, pero no se aportan detalles sobre su implementacion.

En cuanto al entrenamiento, no se dispone de informacion sobre el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF o DPO. El proceso de "abliteration" (etiquetas `heretic`, `abliterated`, `uncensored`, `decensored`) implica una modificacion post-entrenamiento orientada a eliminar los comportamientos de rechazo, pero no se documenta la metodologia concreta empleada por webbrain-one. La cuantizacion de mradermacher utiliza tecnicas de imatrix (importance matrix) para mejorar la calidad de las versiones de baja precision, y se ofrece el fichero imatrix para que otros usuarios puedan generar sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional multi-turno (etiqueta `conversational`).
- Capacidades multimodales (etiqueta `multimodal`; la model card indica que es un modelo de vision y que los ficheros mmproj, si existen, estan en el repositorio estatico).
- Comportamiento sin censura o con rechazo reducido (etiquetas `uncensored`, `decensored`, `abliterated`).
- Prediccion multi-token (etiqueta `mtp`).
- Soporte de "typed decisions" (etiqueta `typed-decisions`), sin mas detalle disponible.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Idiomas: unicamente ingles declarado.

## Casos de uso

- Prototipado de asistentes conversacionales sin restricciones: el modelo, al estar "abliterated", responde sin los filtros habituales de rechazo, lo que resulta util para investigacion sobre seguridad, red teaming y estudio de comportamientos no alineados.
- Investigacion en alineacion y seguridad: permite comparar respuestas del modelo base frente a la version "heretic" para analizar el efecto del proceso de abliteration en la utilidad y los sesgos.
- Despliegue en hardware de consumo: las cuantizaciones i1-Q4_K_M (16,9 GB) o i1-Q3_K_M (13,6 GB) permiten ejecutar un modelo de 27B en GPUs con 16-24 GB de VRAM mediante llama.cpp u Ollama, algo inviable con los pesos en safetensors.
- Generacion de texto creativo y roleplay: el caracter conversacional y la ausencia de censura lo hacen adecuado para narrativa, juegos de rol y generacion de dialogos sin restricciones tematicas.
- Procesamiento de imagenes y texto combinados: gracias a la etiqueta `multimodal` y a los ficheros mmproj, puede emplearse en tareas de descripcion de imagenes o respuesta a preguntas visuales, siempre que se use el repositorio estatico para los proyectores.
- Experimentacion con cuantizacion imatrix: el fichero imatrix incluido permite a investigadores generar sus propias cuantizaciones y evaluar el impacto de la matriz de importancia en la calidad.
- Fine-tuning y destilacion sobre respuestas: al ser un modelo sin censura, puede servir como generador de datos sinteticos para entrenar modelos mas pequenos en dominios donde los filtros estorban.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: i1-Q2_K ~11 GB, i1-Q3_K_S ~12,4 GB, i1-IQ3_M ~12,9 GB, i1-Q3_K_M ~13,6 GB, i1-IQ4_XS ~15,4 GB, i1-Q4_K_S ~15,9 GB, i1-Q4_K_M ~16,9 GB, i1-Q5_K_M ~19,6 GB, i1-Q6_K ~22,5 GB. Hay que anadir el espacio para el contexto KV cache y, en su caso, el proyector multimodal.
- GPU recomendadas: para cuantizaciones Q4 y superiores, RTX 4090 (24 GB) o RTX 3090 (24 GB); para Q5/Q6, A100 40 GB, H100 o RTX 6000 Ada. Las cuantizaciones Q2/Q3 pueden caber en GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080).
- Cabe en GPU de consumo: si, en las cuantizaciones bajas y medias (hasta Q4_K_M en 24 GB; Q3 en 12-16 GB). Las versiones Q5 y Q6 requieren 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). El modelo base es compatible con transformers. No se confirma soporte en vLLM o TGI para esta cuantizacion GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Perplexing-Pegasus-Heretic-i1-GGUF (este) | 27,3B | no disponible | Apache 2.0 | GGUF | Version abliterated, multimodal, solo ingles |
| Qwen3.8-27B-Perplexing-Pegasus-Heretic (base) | 27,3B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Qwen3.8-27B-Perplexing-Pegasus-Heretic-GGUF (estatico) | 27,3B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas del mismo autor, incluye mmproj |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta disenado explicitamente para eliminar los mecanismos de rechazo (`uncensored`, `abliterated`), lo que implica un riesgo elevado de generar contenido danino, ofensivo o ilegal. No es apto para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion: no cuantificado, pero inherente a los modelos de lenguaje de este tamano; la cuantizacion agresiva (Q2, Q3) puede incrementar la perdida de calidad.
- Idiomas: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto: no documentada, lo que impide planificar despliegues con ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero el caracter "abliterated" puede entrar en conflicto con politicas de plataformas, terminos de servicio de proveedores cloud y normativa sobre contenido.
- La model card no documenta la metodologia de abliteration ni los datos de entrenamiento, lo que dificulta evaluar sesgos y procedencia.
- El repositorio ocupa 218,6 GB; la descarga completa es costosa, aunque pueden descargarse solo las cuantizaciones necesarias.
- Los ficheros mmproj para vision no estan en este repositorio, sino en el estatico; hay que descargarlos por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Perplexing-Pegasus-Heretic-i1-GGUF
- Modelo base: https://huggingface.co/webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-27B-Perplexing-Pegasus-Heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Perplexing-Pegasus-Heretic-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
