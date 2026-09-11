# mradermacher/Lux-V2-GGUF

# Ficha de modelo: Lux-V2-GGUF

## Resumen

Lux-V2-GGUF es la version cuantizada en formato GGUF del modelo PoSTMEDIA/Lux-V2, publicada por el usuario mradermacher, especializado en la generacion de cuantizaciones estaticas de modelos abiertos. El modelo base cuenta con 25.233.142.046 parametros totales (aproximadamente 25,2 mil millones) y, segun las etiquetas declaradas por el autor, emplea una arquitectura de mezcla de expertos (MoE) derivada de la familia Gemma 4 (etiqueta `gemma-4`). Esta pensado para conversacion y soporta de forma nativa los idiomas coreano e ingles.

La relevancia de esta publicacion radica en que empaqueta el modelo en multiples niveles de cuantizacion (desde Q2_K hasta Q8_0 e IQ4_XS), lo que permite desplegarlo en hardware de consumo o en servidores modestos sin necesidad de GPUs de gama alta. Ademas, se incluyen ficheros `mmproj` (multi-modal supplement), lo que indica que el modelo conserva capacidades multimodales, presumiblemente de vision, aunque la model card no detalla el alcance exacto de dichas capacidades.

Se trata de una publicacion muy reciente (creada el 11 de septiembre de 2026) con cero descargas y cero valoraciones en el momento de la consulta, por lo que no existe aun evidencia publica de rendimiento, benchmarks ni adopcion por parte de la comunidad. La licencia es Apache 2.0, lo que facilita el uso comercial, y el tamano total del repositorio es de 17,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) segun etiquetas del autor; etiqueta `gemma-4` (familia Gemma 4). No se detallan capas, dimensiones ni numero de expertos |
| Parametros totales | 25.233.142.046 (aprox. 25,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (mas ficheros mmproj en GGUF para el componente multimodal) |

## Arquitectura y entrenamiento

Segun las etiquetas declaradas, el modelo base PoSTMEDIA/Lux-V2 emplea una arquitectura de mezcla de expertos (MoE) basada en la familia Gemma 4, con un total de 25.233.142.046 parametros. No se dispone de informacion sobre el numero de expertos, la dimension de activacion, el numero de capas ni la longitud de contexto efectiva. La presencia de ficheros `mmproj` en el repositorio (tanto en f16 como en Q8_0) indica que el modelo incorpora un componente multimodal, presumiblemente un proyector de vision, aunque la model card no especifica la resolucion de imagen, el encoder visual ni el tipo de tareas multimodales soportadas.

En cuanto al entrenamiento, las etiquetas `sft`, `trl` y `full-fine-tuning` indican que el modelo base fue sometido a un ajuste supervisado (supervised fine-tuning) utilizando la libreria TRL, y que dicho ajuste fue completo (no mediante adaptadores como LoRA). No se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases posteriores de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.). No se han facilitado datos sobre el proceso de cuantizacion mas alla de que se trata de cuantizaciones estaticas (`quantize_version: 2`, `output_tensor_quantised: 1`).

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational` y esta orientado a dialogos multi-turno.
- Capacidades multimodales: la presencia de ficheros `mmproj` sugiere soporte de entrada de imagenes (vision), aunque el alcance exacto no esta documentado.
- Bilinguismo coreano-ingles: soporta ambos idiomas de forma declarada, con etiqueta especifica `korean`.
- Razonamiento y codigo: no disponible (no se documentan capacidades especificas de codigo, matematicas o razonamiento).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de pensamiento (thinking mode): no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Atencion al cliente en coreano e ingles: el modelo puede gestionar conversaciones multi-turno en ambos idiomas y desplegarse en local con llama.cpp u Ollama, lo que resulta adecuado para empresas que necesiten mantener los datos de los clientes en su propia infraestructura sin depender de APIs externas.
- Asistente conversacional embebido en aplicaciones: gracias a sus cuantizaciones ligeras (Q4_K_M, Q3_K_M), puede integrarse en productos de escritorio o moviles con soporte GGUF a traves de llama.cpp, ofreciendo un asistente bilingue sin conexion.
- Procesamiento de documentos con componente visual: si las capacidades multimodales son efectivas, el modelo podria emplearse para extraer informacion de capturas, formularios o diagramas combinando texto e imagen en un unico flujo.
- Traduccion y adaptacion de contenido coreano-ingles: el modelo esta etiquetado explicitamente para ambos idiomas, por lo que puede utilizarse en tareas de traduccion o localizacion de documentacion tecnica y contenido editorial.
- Generacion aumentada por recuperacion (RAG) sobre corpus coreanos: el modelo puede actuar como generador final en un pipeline RAG que consulte bases de conocimiento en coreano, aprovechando su especializacion idiomatica y su despliegue local para cumplir requisitos de soberania de datos.
- Prototipado e investigacion en arquitecturas MoE: al estar disponible en formato GGUF y con licencia Apache 2.0, sirve como banco de pruebas para estudiar el comportamiento de modelos MoE cuantizados en distintos niveles de precision sin costes de licencia.
- Despliegue en hardware de consumo para desarrolladores individuales: con cuantizaciones de 2 a 4 bits, un desarrollador con una unica GPU de 12-16 GB puede ejecutar el modelo para experimentacion y desarrollo de prototipos conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Estimaciones orientativas de VRAM para inferencia, calculadas a partir del numero de parametros totales (25,2 B). Al tratarse de una arquitectura MoE, todos los expertos deben residir en memoria, por lo que el consumo se aproxima al de un modelo denso del mismo tamano, aunque la velocidad de generacion depende de los parametros activos:

| Cuantizacion | Tamano aproximado en disco/VRAM |
|---|---|
| f16 | ~50 GB |
| Q8_0 | ~27 GB |
| Q6_K | ~21 GB |
| Q5_K_M | ~18 GB |
| Q4_K_M | ~15 GB |
| IQ4_XS | ~13,5 GB |
| Q3_K_M | ~12,5 GB |
| Q2_K | ~9 GB |

- GPUs profesionales recomendadas: A100 (40 GB o 80 GB) o H100 (80 GB) para f16 o Q8_0 con contexto amplio.
- GPUs de gama alta para consumo: RTX 4090 (24 GB) puede ejecutar Q4_K_M o Q5_K_M con contexto moderado; conviene dejar margen para la cache KV.
- GPUs de gama media: RTX 4080, 4070 Ti (16 GB) pueden ejecutar IQ4_XS o Q4_K_S; tarjetas de 12 GB pueden ejecutar Q3_K_M o inferiores.
- Cabe en GPU de consumo: si, en cuantizaciones de 2 a 5 bits segun la VRAM disponible.
- Opciones de despliegue: llama.cpp (cliente y servidor), Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. Para el componente mmproj debe usarse un runtime que soporte vision multimodal en GGUF (por ejemplo, llama.cpp con soporte multimodal).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparacion se limita a caracteristicas estructurales verificables.

| Modelo | Parametros totales | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Lux-V2-GGUF (esta ficha) | 25,2 B | no disponible | ko, en | Apache 2.0 | GGUF |
| PoSTMEDIA/Lux-V2 (modelo base) | 25,2 B (segun el repo cuantizado) | no disponible | ko, en | Apache 2.0 | safetensors |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada otros modelos comparables con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgos, toxicidad o alineacion.
- Riesgo de alucinacion: no cuantificado. Al no existir benchmarks publicados, no puede estimarse la fiabilidad factual del modelo.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada. Las cuantizaciones de baja precision pueden degradar la calidad en contextos largos.
- Limitaciones de idioma: el modelo esta declarado unicamente para coreano e ingles. El rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia. No obstante, se recomienda verificar la licencia del modelo base PoSTMEDIA/Lux-V2, ya que el repositorio cuantizado hereda sus condiciones y las etiquetas de la familia Gemma pueden implicar terminos adicionales.
- Madurez: publicacion con cero descargas y cero valoraciones, sin validacion por parte de la comunidad.
- Cuantizaciones no ponderadas: la model card indica que no se han publicado cuantizaciones ponderadas (imatrix) por parte del autor, lo que puede suponer una perdida de calidad adicional en los niveles bajos (Q2_K, Q3_K) frente a alternativas ponderadas.
- Componente multimodal: aunque se incluyen ficheros mmproj, no se documenta el alcance real de las capacidades de vision; conviene validarlas antes de usarlas en produccion.
- Produccion: al no existir benchmarks, evaluaciones de robustez ni informes de latencia, no se recomienda su uso en entornos criticos sin una validacion interna previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Lux-V2-GGUF
- Modelo base: https://huggingface.co/PoSTMEDIA/Lux-V2
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#Lux-V2-GGUF
- Ficheros multimodales: 
  - https://huggingface.co/mradermacher/Lux-V2-GGUF/resolve/main/Lux-V2.mmproj-Q8_0.gguf
  - https://huggingface.co/mradermacher/Lux-V2-GGUF/resolve/main/Lux-V2.mmproj-f16.gguf
- Guia de uso de ficheros GGUF (referencia citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor (nethype GmbH): https://www.nethype.de/
