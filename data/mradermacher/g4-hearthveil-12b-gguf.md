# mradermacher/G4-Hearthveil-12B-GGUF

## Resumen

G4-Hearthveil-12B-GGUF es la version cuantizada en formato GGUF del modelo OutisR/G4-Hearthveil-12B, publicada por el usuario mradermacher, especializado en generar cuantizaciones estaticas de modelos abiertos. El modelo base es un transformer de aproximadamente 11.900 millones de parametros (11.907.350.576 segun los pesos en safetensors) orientado a roleplay, escritura creativa y narracion, construido sobre la familia Gemma 4 segun las etiquetas de la model card. La licencia declarada es Apache 2.0 y los idiomas soportados incluyen ingles, ruso y multilingue.

La relevancia de esta publicacion radica en que ofrece el modelo en una bateria amplia de cuantizaciones (desde Q2_K de 4,9 GB hasta Q8_0 de 12,8 GB), lo que permite desplegarlo en hardware de consumo con llama.cpp y derivados. Ademas, el repositorio incluye ficheros mmproj (multi-modal supplement) en f16 y Q8_0, lo que sugiere que el modelo base incorpora algun tipo de capacidad multimodal, aunque la model card no detalla su naturaleza ni su alcance.

Se trata de una ficha de cuantizacion, no de un modelo original: mradermacher no entrena ni modifica los pesos mas alla del proceso de cuantizacion. Por tanto, las capacidades reales dependen del modelo base OutisR/G4-Hearthveil-12B, cuya documentacion no se incluye en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, segun etiquetas de la model card) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en f16 y Q8_0 |
| Idiomas soportados | en, ru, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de la etiqueta "gemma4", que lo situa en la familia Gemma 4 de Google. El recuento de parametros (11,9 mil millones) es coherente con un transformer denso de escala 12B, pero no se confirma si emplea atencion lineal, decodificacion especulativa u otras innovaciones. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

El proceso de cuantizacion realizado por mradermacher es estatico (quantize_version 2, output_tensor_quantised 1, convert_type hf) y genera los ficheros GGUF a partir de los pesos en formato Hugging Face del modelo base. La model card menciona que existen cuantizaciones con imatrix (weighted/imatrix quants) en un repositorio separado (G4-Hearthveil-12B-i1-GGUF), que suelen ofrecer mejor calidad por tamano que las estaticas equivalentes. La presencia de ficheros mmproj indica que el modelo base es multimodal, aunque no se especifica que modalidades cubre.

## Capacidades

- Generacion de texto orientada a roleplay, escritura creativa y narracion, segun las etiquetas declaradas.
- Soporte multilingue con enfasis en ingles y ruso.
- Capacidad multimodal inferida de la presencia de ficheros mmproj (f16 y Q8_0), aunque no se detalla que modalidades cubre.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Roleplay conversacional: el modelo esta etiquetado especificamente para roleplay, por lo que puede mantener personajes coherentes en conversaciones multi-turno; las cuantizaciones Q4_K_M (7,5 GB) permiten ejecutarlo en GPUs de consumo con 8-12 GB de VRAM.
- Escritura creativa asistida: generacion de relatos, dialogos y ficcion con control de estilo, aprovechando la especializacion declarada en creative-writing y storywriting.
- Narrativa interactiva y videojuegos de texto: integracion en motores de ficcion interactiva mediante llama.cpp u Ollama, con latencia baja gracias a los ficheros Q4_K_S (7,1 GB) marcados como "fast, recommended".
- Prototipado de asistentes en ruso e ingles: el soporte bilingue declarado permite construir bots conversacionales para ambos idiomas sin necesidad de modelos separados.
- Experimentacion multimodal en local: los ficheros mmproj permiten probar entradas multimodales en entornos de consumo, aunque el alcance exacto debe verificarse contra la documentacion del modelo base.
- Despliegue en entornos con recursos limitados: la cuantizacion Q2_K (4,9 GB) permite ejecutar el modelo en GPUs de 6 GB o incluso en CPU con RAM suficiente, a costa de perdida de calidad.
- Fine-tuning ligero sobre cuantizaciones de alta calidad: Q8_0 (12,8 GB) o Q6_K (9,9 GB) sirven como base para experimentos de LoRA o adaptaciones posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, incluyendo overhead de contexto):
  - Q2_K: ~5-6 GB
  - Q3_K_M: ~7-8 GB
  - Q4_K_M: ~8-9 GB
  - Q5_K_M: ~9-10 GB
  - Q6_K: ~11-12 GB
  - Q8_0: ~14-15 GB
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q5; RTX 4090 24 GB o A100/H100 para Q8_0 y contextos largos.
- Cabe en GPU de consumo: si, desde Q2_K en GPUs de 6-8 GB hasta Q8_0 en GPUs de 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de VRAM suficiente.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| G4-Hearthveil-12B-GGUF | 11,9B | no disponible | Apache 2.0 | GGUF | Especializado en roleplay y escritura creativa |
| Modelo base OutisR/G4-Hearthveil-12B | 11,9B | no disponible | Apache 2.0 | safetensors | Version sin cuantizar del mismo modelo |
| G4-Hearthveil-12B-i1-GGUF | 11,9B | no disponible | Apache 2.0 | GGUF (imatrix) | Cuantizaciones con imatrix del mismo autor, mayor calidad por tamano |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (roleplay/creative-writing en escala 12B) en la documentacion proporcionada.

## Limitaciones y advertencias

- La model card del repositorio cuantizado no documenta sesgos conocidos, tasas de alucinacion ni limitaciones especificas del modelo base; es responsabilidad del usuario evaluarlas.
- La longitud de contexto no esta especificada, lo que impide planificar despliegues con ventanas largas sin consultar la documentacion del modelo base.
- El soporte idiomatico declarado se limita a ingles, ruso y multilingue generico; el rendimiento en castellano no esta verificado.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de forma notable; la propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como equilibrio rapido y Q6_K como alta calidad.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificarse contra la licencia del modelo base y de los datos de entrenamiento originales, no solo contra la del repositorio cuantizado.
- La capacidad multimodal inferida de los ficheros mmproj no esta documentada; no debe asumirse soporte de vision o audio sin validacion previa.
- Al ser una cuantizacion estatica, puede presentar diferencias de comportamiento frente al modelo base en tareas sensibles a la precision numerica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/G4-Hearthveil-12B-GGUF
- Modelo base: https://huggingface.co/OutisR/G4-Hearthveil-12B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/G4-Hearthveil-12B-i1-GGUF
- Pagina de overview del autor: https://hf.tst.eu/model#G4-Hearthveil-12B-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
