# mradermacher/SMAXI-Community-135M-GGUF

## Resumen

SMAXI-Community-135M-GGUF es la version cuantizada en formato GGUF del modelo Wrooms/SMAXI-Community-135M, publicada por el usuario mradermacher, conocido por producir cuantizaciones estaticas de modelos abiertos. No se trata por tanto de un modelo entrenado desde cero, sino de una conversion de pesos a GGUF en doce variantes de cuantizacion (desde Q2_K hasta f16) para facilitar su ejecucion en llama.cpp y entornos de inferencia en CPU o GPU de gama baja.

El modelo subyacente tiene 134.515.008 parametros (aproximadamente 135 millones), lo que lo situa en la categoria de modelos ultraligeros, pensados para ejecucion en dispositivos con recursos muy limitados. La model card lo etiqueta como "experimental", "text-extraction" y con la etiqueta "smolllm2", lo que sugiere una arquitectura de tipo transformer decoder-only de la familia SmolLM2, aunque la ficha del autor no confirma explicitamente la arquitectura ni los datos de entrenamiento.

Su relevancia practica es de nicho: permite experimentar con un modelo conversacional minimo en hardware sin GPU, con licencia Apache 2.0 (uso comercial permitido) y un peso en disco de apenas 200 MB en las cuantizaciones mas agresivas. La contrapartida es la ausencia total de informacion publicada sobre contexto, datos de entrenamiento y benchmarks, ademas de un soporte unicamente en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta "smolllm2" apunta a un transformer decoder-only tipo SmolLM2, sin confirmar en la model card) |
| Parametros totales | 134.515.008 (aproximadamente 135 M) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base Wrooms/SMAXI-Community-135M esta en formato transformers, presumiblemente safetensors) |

Datos adicionales: repositorio de 1,4 GB (suma de todas las cuantizaciones), ficheros individuales de 0,2 GB para las cuantizaciones comprimidas y 0,4 GB para f16. No se han publicado cuantizaciones ponderadas ni con imatrix por parte de este autor en el momento de la publicacion.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens utilizado, la composicion del dataset ni si hubo fases de ajuste por instrucciones (SFT, RLHF o DPO). La model card del repositorio GGUF se limita a indicar que son cuantizaciones estaticas del modelo base y no reproduce ninguna ficha tecnica del modelo original.

El unico indicio arquitectonico es la etiqueta "smolllm2" incluida en los tags, que sugiere una estructura derivada o compatible con la familia SmolLM2 (transformer decoder-only con normalizacion RMSNorm y atencion causal agrupada). No obstante, esta inferencia no esta confirmada por el autor y no debe tomarse como dato fiable. En cuanto al proceso de cuantizacion, la model card indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, conversion estandar desde pesos de HuggingFace con cuantizacion por tensores de salida.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag `conversational` del repositorio.
- Extraccion de texto estructurado, capacidad declarada explicitamente mediante el tag `text-extraction`.
- Modelo base para ajuste fino posterior (fine-tuning) en tareas concretas de clasificacion o extraccion.
- Ejecucion en entornos de bajos recursos: al ser un modelo de 135 M, la inferencia es viable en CPU sin GPU dedicada.
- No hay evidencia publicada de soporte de tool calling, function calling ni razonamiento multi-paso.
- No hay evidencia publicada de capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue: limitada al ingles segun el campo `language` de la model card; no se declaran otros idiomas.
- Al no disponer de benchmarks, no es posible confirmar capacidades de codigo o matematicas mas alla de lo esperable en un modelo de este tamano.

## Casos de uso

- Extraccion de campos en documentos simples: dado el tag `text-extraction`, un modelo de 135 M ajustado puede emplearse para extraer entidades concretas (fechas, importes, nombres) de textos cortos en ingles, ejecutandose en local sin coste de API.
- Preprocesado en pipelines de datos: uso como primer filtro para clasificar o etiquetar grandes volumenes de texto antes de pasarlos a un modelo mayor, aprovechando su bajo coste por token y su capacidad de correr en CPU.
- Prototipado y pruebas de integracion: permite validar un pipeline completo de llama.cpp, Ollama o LM Studio con un fichero de 200 MB antes de escalar a modelos de mayor tamano.
- Educacion e investigacion: util como caso de estudio reproducible para analizar el efecto de distintas cuantizaciones (Q2_K frente a Q8_0) en la perplejidad y la calidad de salida.
- Despliegue en dispositivos embebidos o edge: con 0,2 GB en Q4_K_M, cabe en Raspberry Pi, mini-PC o moviles con varios GB de RAM para tareas de generacion muy acotadas.
- Generacion de texto asistida de baja latencia en local: respuesta a plantillas, autocompletado o reformulacion de frases cortas en ingles donde no se requiera alta calidad.
- Base para fine-tuning especifico: al ser Apache 2.0, se puede reentrenar y redistribuir una version especializada (por ejemplo, en un dominio vertical) sin restricciones de licencia.
- Simulacion de cargas en pruebas de infraestructura: util para medir throughput de servidores de inferencia sin consumir recursos de GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los resultados de busqueda web proporcionados incluyen datos de MMLU, HumanEval, GSM8K, HellaSwag ni ninguna otra metrica. El autor tampoco publica cifras de perplejidad por cuantizacion para este modelo concreto.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones. Las variantes Q2_K a Q6_K ocupan aproximadamente 0,2 GB en disco y la f16 unos 0,4 GB, por lo que el consumo en memoria es de ese orden mas el overhead del runtime.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente. No requiere A100, H100 ni RTX 4090; una GTX 1650, RTX 3050 o incluso una GPU integrada moderna son suficientes.
- Consumer GPU: si, cabe holgadamente en cualquier GPU de consumo e incluso en iGPU y en CPU exclusivamente.
- CPU: la inferencia es viable en CPU sin aceleracion, lo que abre el uso en Raspberry Pi 4/5, mini-PC y portatiles antiguos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y llama-cpp-python son las opciones naturales para GGUF. El soporte de GGUF en vLLM es experimental y no esta garantizado; TGI no esta orientado a GGUF.
- Latencia y throughput: no publicados por el autor. No se dispone de cifras medidas de tokens por segundo ni de latencia de primer token para ninguna de las cuantizaciones.
- Almacenamiento: el repositorio completo ocupa 1,4 GB, pero solo es necesario descargar el fichero de la cuantizacion elegida (0,2 GB o 0,4 GB).

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada, por lo que cualquier comparacion de calidad seria especulativa. A continuacion se recogen unicamente caracteristicas objetivas de modelos de la misma categoria de tamano, marcando como "no disponible" todo aquello que no puede confirmarse:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| SMAXI-Community-135M-GGUF | 134,5 M | no disponible | apache-2.0 | GGUF |
| Modelo base Wrooms/SMAXI-Community-135M | 134,5 M | no disponible | apache-2.0 | transformers |
| Alternativas de tamano similar (por ejemplo, GPT-2 124M o SmolLM2-135M) | 124-135 M | no disponible en la documentacion consultada | variable segun modelo | safetensors, GGUF |

No se han encontrado en la busqueda web resultados relevantes sobre este modelo ni sobre alternativas comparables; los resultados devueltos no guardan relacion con el ambito de la ficha. Por tanto, la comparativa de rendimiento se declara no disponible.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como `experimental`, sin garantias de estabilidad ni de calidad de salida.
- Ausencia total de documentacion tecnica: no se conocen datos de entrenamiento, contexto, tokenizador ni proceso de ajuste, lo que dificulta evaluar su idoneidad para produccion.
- Alto riesgo de alucinacion: con 135 M de parametros, la coherencia en respuestas largas es muy limitada y la generacion de hechos falsos es esperable.
- Idioma: soporte declarado unicamente en ingles. El rendimiento en castellano no esta documentado y previsiblemente sera pobre.
- Contexto limitado: aunque no se publica la longitud de contexto, en modelos de esta familia suele ser corta; no debe asumirse una ventana amplia para conversaciones multi-turno largas.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios realizados. No impone restricciones de uso adicionales.
- Ausencia de benchmarks: no existen datos publicados que permitan comparar su calidad frente a alternativas, ni siquiera frente al modelo base sin cuantizar.
- Cuantizaciones agresivas: las variantes Q2_K y Q3_K_S degradan la calidad de forma notable; el autor recomienda Q4_K_S y Q4_K_M como equilibrio entre tamano y fidelidad, y Q8_0 como mejor calidad con velocidad alta.
- Trazabilidad: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.
- Sin soporte confirmado de tool calling ni de agentes: no debe integrarse en flujos que dependan de function calling sin validacion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/SMAXI-Community-135M-GGUF
- Modelo base: https://huggingface.co/Wrooms/SMAXI-Community-135M
- Pagina resumen de cuantizaciones del autor: https://hf.tst.eu/model#SMAXI-Community-135M-GGUF
- Peticiones y preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable de la infraestructura de cuantizacion: https://www.nethype.de/
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos no guardan relacion con la ficha.
