# mradermacher/qwen2-vl-2b-abliterated-i1-GGUF

## Resumen

qwen2-vl-2b-abliterated-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo MahdiAlikhah/qwen2-vl-2b-abliterated, una version "abliterated" (es decir, con las direcciones de rechazo suprimidas mediante la tecnica de abliteration) del modelo vision-lenguaje Qwen2-VL de 2B parametros de Alibaba. El resultado es un modelo multimodal que acepta texto e imagenes y que ha sido modificado para reducir sus negativas a responder determinadas peticiones, orientado a usos de investigacion sobre alineamiento y a escenarios donde se necesita un modelo sin filtros de rechazo.

El repositorio contiene exclusivamente pesos en formato GGUF (no safetensors) con cuantizaciones de tipo imatrix/i1, desde IQ1_S (0,5 GB) hasta Q6_K (1,4 GB), lo que permite ejecutar el modelo en hardware muy modesto, incluidas GPU de consumo con 4-6 GB de VRAM o incluso en CPU. El modelo base real cuenta con 1.543.714.304 parametros segun los safetensors del modelo original.

Su relevancia actual radica en que combina tres caracteristicas poco habituales juntas: tamano muy reducido (2B), capacidad vision-lenguaje y ausencia de censura, todo bajo licencia Apache 2.0, lo que facilita su despliegue local y su uso como componente en pipelines de investigacion sobre seguridad y alineamiento de modelos multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (base Qwen2-VL), modificado mediante abliteration |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Qwen2-VL original soporta contexto largo, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; tambien disponibles quants estaticos en repo separado |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (multiples ficheros por cuantizacion; no hay safetensors en este repo) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2-VL de 2B parametros, un transformer multimodal que procesa imagenes y texto de forma conjunta mediante un encoder visual y un decoder de lenguaje. Sobre esa base, MahdiAlikhah aplico abliteration, una tecnica que identifica y elimina (o proyecta fuera) las direcciones del espacio de activaciones asociadas al rechazo de peticiones, de modo que el modelo pierde parte de su comportamiento de negativa sin reentrenar desde cero. Los tags "abliterated", "uncensored" y "heretic" confirman este proceso.

mradermacher ha generado las cuantizaciones con el metodo i1 (imatrix), que calcula una matriz de importancia a partir de datos de calibracion para minimizar la perdida de calidad en bits bajos. No se dispone en la informacion proporcionada de detalles sobre el dataset de calibracion, el numero de tokens de entrenamiento del modelo base ni si hubo fases de RLHF o DPO especificas en la version abliterated.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Comprension de imagenes (vision-lenguaje): descripcion, respuesta a preguntas sobre imagenes y extraccion de informacion visual.
- Razonamiento basico y respuesta a preguntas generales, limitado por el tamano de 2B parametros.
- Comportamiento "uncensored": menor probabilidad de rechazar peticiones que el modelo original, por diseno.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para esta variante.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades multilingues: la model card declara unicamente ingles; el modelo base Qwen2-VL tiene cobertura multilingue, pero no se garantiza en esta variante.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: comparar el comportamiento del modelo abliterated frente al Qwen2-VL original para estudiar que direcciones de activacion codifican el rechazo y como afecta la supresion a la calidad general.
- Despliegue local en hardware modesto: con cuantizaciones de 1,0-1,4 GB (Q4_K_M, Q5_K_M, Q6_K) el modelo cabe en GPU de consumo de 4-6 GB o incluso en CPU, lo que permite prototipar aplicaciones vision-lenguaje sin infraestructura dedicada.
- Procesamiento de imagenes en el borde (edge): analisis de capturas, documentos escaneados o fotos en dispositivos con recursos limitados, usando llama.cpp con el fichero GGUF adecuado.
- Generacion de descripciones y etiquetado de imagenes a escala: para enriquecer datasets o catalogos con metadatos textuales, aceptando la menor precision de un modelo de 2B.
- Experimentacion con tecnicas de cuantizacion: el repositorio ofrece mas de 20 variantes i1, lo que permite medir el impacto de IQ1-IQ4 frente a Q5/Q6 en tareas multimodales concretas.
- Base para fine-tuning o destilacion: al ser Apache 2.0 y de tamano reducido, sirve como punto de partida para adaptaciones especificas de dominio con requisitos de VRAM bajos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5-0,7 GB para IQ1/IQ2, 0,9-1,1 GB para Q3/Q4, 1,2-1,4 GB para Q5/Q6 (tamanos de fichero; la VRAM real anade overhead del runtime y del encoder visual).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (RTX 3050, RTX 4060, GTX 1660, etc.); tambien funciona en A100/H100 pero esta sobredimensionado para ellas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4-6 GB; las cuantizaciones Q4_K_M y Q5_K_M son las recomendadas para equilibrio tamano/calidad.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python); el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI. vLLM y TGI no estan confirmados para este formato GGUF multimodal.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| qwen2-vl-2b-abliterated-i1-GGUF (este) | 1,54B | no disponible | Si | Apache 2.0 | GGUF cuantizado, sin censura, solo ingles declarado |
| Qwen2-VL-2B-Instruct (original) | ~2B | no disponible | Si | Apache 2.0 | Modelo base alineado; rechaza peticiones sensibles |
| mradermacher/qwen2-vl-2b-abliterated-GGUF (quants estaticos) | 1,54B | no disponible | Si | Apache 2.0 | Misma base, cuantizacion estatica en lugar de imatrix |
| MahdiAlikhah/qwen2-vl-2b-abliterated (safetensors) | 1,54B | no disponible | Si | Apache 2.0 | Pesos originales sin cuantizar, para transformers |

## Limitaciones y advertencias

- La abliteration elimina barreras de rechazo, lo que implica un riesgo elevado de generar contenido nocivo, sesgado o inapropiado; no es apto para aplicaciones de cara al publico sin filtros adicionales.
- Modelo de solo 2B parametros: menor precision en razonamiento complejo, matematicas y seguimiento de instrucciones largas que modelos mayores.
- La model card declara unicamente ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Riesgo de alucinacion inherente a modelos pequenos, especialmente en tareas de OCR o descripcion detallada de imagenes.
- La cuantizacion IQ1/IQ2 degrada notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin censura puede incumplir politicas de plataformas, terminos de servicio o normativa aplicable; la responsabilidad recae en el desplegador.
- No hay datos publicados de benchmarks para esta variante, por lo que las afirmaciones de calidad deben validarse empiricamente antes de producción.
- El repositorio no incluye safetensors; para usar con transformers hay que acudir al modelo base de MahdiAlikhah.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/qwen2-vl-2b-abliterated-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/MahdiAlikhah/qwen2-vl-2b-abliterated
- Quants estaticos del mismo modelo: https://huggingface.co/mradermacher/qwen2-vl-2b-abliterated-GGUF
- Pagina de conveniencia del autor: https://hf.tst.eu/model#qwen2-vl-2b-abliterated-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
