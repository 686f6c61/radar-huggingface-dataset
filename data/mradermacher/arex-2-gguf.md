# mradermacher/AREX-2-GGUF

## Resumen

AREX-2-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo BAAI/AREX-2, publicado por el usuario mradermacher, conocido por generar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y derivados. No se trata de un modelo nuevo ni de un entrenamiento propio: el repositorio contiene unicamente pesos convertidos y comprimidos a partir del modelo original de BAAI, con el objetivo de reducir los requisitos de memoria y permitir la inferencia en hardware de consumo.

El modelo base cuenta con 26.895.998.464 parametros (aproximadamente 26,9 mil millones), lo que lo situa en la gama de modelos medianos-grandes. Las etiquetas del repositorio lo asocian a la arquitectura qwen3_5 y a capacidades de agente, deep-research, razonamiento, uso de herramientas (tool-use), contexto largo y auto-mejora (self-improvement). La presencia de ficheros mmproj (Q8_0 y f16) indica que el modelo original incorpora un componente multimodal, presumiblemente vision, que se conserva como suplemento en este repositorio.

La relevancia de esta publicacion es practica: al ofrecer 12 variantes de cuantizacion que van de 10,8 GB a 28,7 GB, permite ejecutar un modelo de casi 27.000 millones de parametros en GPUs de consumo con 12-24 GB de VRAM, algo inviable con los pesos en precision completa. El repositorio acumula 2.273 descargas y 11 likes desde su publicacion a finales de septiembre de 2026, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, etiquetada como qwen3_5 en los tags del repositorio (detalles no disponibles) |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible (el tag long-context sugiere contexto extendido, sin cifra publicada) |
| Tipos de cuantizacion | f16 (via mmproj), Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (los safetensors corresponden al modelo base, no a este repositorio) |

Datos adicionales del repositorio: tamano total de 187,9 GB, libreria declarada transformers, fecha de creacion 30/09/2026 y ultima actualizacion 01/10/2026. Existe un repositorio hermano con cuantizaciones ponderadas por imatrix en https://huggingface.co/mradermacher/AREX-2-i1-GGUF.

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base BAAI/AREX-2 en la documentacion proporcionada: no se detallan el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Lo unico inferible es la etiqueta de arquitectura qwen3_5, que apunta a la familia Qwen 3.5, si bien no se confirma la estructura interna (atencion completa, atencion lineal, MoE o hibrida).

El trabajo del repositorio AREX-2-GGUF es exclusivamente de cuantizacion. Segun los metadatos internos de la model card, se empleo quantize_version 2, output_tensor_quantised 1 y convert_type hf, es decir, una conversion desde pesos HuggingFace con cuantizacion de tensores de salida. La tabla de ficheros del autor recomienda Q4_K_S y Q4_K_M como opciones rapidas y equilibradas, y Q8_0 como la de mayor calidad, mientras que Q6_K se describe como calidad "muy buena". Los ficheros mmproj se proporcionan aparte (0,7 GB en Q8_0 y 1,0 GB en f16) como suplemento multimodal, lo que implica que la torre de vision u otro codificador se mantiene en precision alta y se carga de forma independiente.

## Capacidades

- Generacion de texto conversacional en ingles, con licencia Apache 2.0 que permite uso comercial.
- Razonamiento (tag reasoning), presumiblemente con modos de pensamiento extendido, aunque no se documenta el mecanismo exacto.
- Uso de herramientas y function calling (tags tool-use y agent), orientado a flujos de agente automatizados.
- Investigacion profunda o deep-research (tag deep-research): busqueda iterativa y sintesis de informacion en multiples pasos.
- Contexto largo (tag long-context), adecuado para documentos extensos y conversaciones de muchos turnos.
- Auto-mejora (tag self-improvement), sin detalles publicados sobre la implementacion.
- Capacidad multimodal mediante los ficheros mmproj, que permiten adjuntar entrada visual al pipeline de llama.cpp.
- Soporte multilingue limitado: el repositorio declara unicamente ingles.

## Casos de uso

- Agentes autonomos con uso de herramientas: el modelo puede encadenar llamadas a funciones y APIs externas, apoyandose en las capacidades de tool-use y agent declaradas, para tareas como reservas, consultas a bases de datos o automatizacion de back-office.
- Investigacion y sintesis documental: con la etiqueta deep-research y contexto largo, es adecuado para recorrer corpus extensos, extraer datos relevantes y producir informes estructurados con trazabilidad de fuentes.
- Asistente de atencion al cliente multi-turno: la ventana de contexto extendida permite mantener el hilo completo de una conversacion larga sin truncar el historial, siempre que el despliegue sea en ingles.
- Analisis de documentos con componente visual: gracias a los ficheros mmproj, se pueden procesar capturas, diagramas o paginas escaneadas junto con el texto asociado.
- Generacion y revision de codigo asistida: integrable en editores y pipelines de CI/CD mediante el endpoint compatible con la API de OpenAI que declara el repositorio (tag endpoints_compatible).
- Automatizacion de procesos de razonamiento multi-paso: tareas de planificacion, descomposicion de problemas y verificacion intermedia donde el modo de razonamiento aporta valor frente a un modelo puramente generativo.
- Despliegue en infraestructura local o air-gapped: al distribuirse en GGUF y con licencia Apache 2.0, permite ejecutar el modelo en servidores sin conectividad externa y sin restricciones de uso comercial.
- Prototipado rapido con hardware limitado: las variantes Q2_K a Q4_K_M permiten probar el modelo en portatiles con GPU de 12-16 GB antes de escalar a un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio de cuantizaciones ni los resultados de busqueda consultados incluyen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el modelo base BAAI/AREX-2 ni para las versiones cuantizadas.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): Q2_K unos 11 GB; Q3_K_S 12,2 GB; Q3_K_M 13,4 GB; Q3_K_L 14,4 GB; IQ4_XS 15,3 GB; Q4_K_S 15,7 GB; Q4_K_M 16,6 GB; Q5_K_S 18,8 GB; Q5_K_M 19,3 GB; Q6_K 22,2 GB; Q8_0 28,7 GB. Hay que anadir la cache KV y los buffers de contexto, que crecen con la longitud de la ventana configurada.
- Componente multimodal: sumar 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16) si se activa la entrada visual.
- GPU de consumo: Q4_K_S y Q4_K_M son viables en RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB, con contexto moderado) y, en Q2_K o Q3_K_S, en tarjetas de 12 GB como RTX 3060 12 GB o RTX 4070. Las variantes Q6_K y Q8_0 quedan fuera de las GPU de consumo de gama media-alta y requieren 24 GB o reparto en multiples GPU.
- GPU profesionales: A100 40/80 GB, H100 80 GB y L40S 48 GB pueden alojar cualquier cuantizacion con contexto amplio, incluida Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y servidores compatibles con GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints estilo OpenAI. vLLM y TGI no son las rutas naturales para GGUF, aunque vLLM soporta algunos formatos cuantizados, no confirmado aqui.
- Latencia y throughput: no disponibles. Dependeran del grado de cuantizacion, del hardware y de la longitud de contexto; las variantes Q4 se etiquetan como "fast, recommended" y Q8_0 como "fast, best quality" por el autor.
- Almacenamiento: el repositorio completo ocupa 187,9 GB, aunque no es necesario descargar todas las variantes.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada (ni parametros, ni contexto, ni benchmarks de alternativas). La unica comparacion verificable es entre los propios artefactos derivados del mismo modelo base:

| Artefacto | Formato | Parametros | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| BAAI/AREX-2 (base) | safetensors | 26,9 B | Apache 2.0 | en | Pesos originales sin cuantizar |
| mradermacher/AREX-2-GGUF | GGUF | 26,9 B | Apache 2.0 | en | 12 cuantizaciones estaticas, 10,8-28,7 GB |
| mradermacher/AREX-2-i1-GGUF | GGUF | no disponible | Apache 2.0 | en | Cuantizaciones ponderadas por imatrix |

Para comparar con otras familias (Qwen, Llama, Mistral, DeepSeek) seria necesario disponer de sus especificaciones y resultados, que no forman parte de la documentacion facilitada.

## Limitaciones y advertencias

- Idioma: el repositorio declara unicamente ingles. El rendimiento en castellano no esta garantizado ni documentado.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada en la informacion disponible, por lo que no se puede verificar el rendimiento real frente a alternativas de tamano similar. Cualquier afirmacion de calidad seria especulativa.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; no hay documentacion sobre tasas de error ni sobre mitigaciones aplicadas en el modelo base.
- Sesgos: no se documenta la composicion del dataset de entrenamiento ni los procesos de alineacion, por lo que no es posible evaluar sesgos conocidos ni su magnitud.
- Perdida de calidad por cuantizacion: las variantes de baja precision (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad respecto a Q8_0 o a los pesos originales. El autor marca explicitamente Q3_K_M como "lower quality".
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y los terminos del modelo base BAAI/AREX-2, que es la fuente real de los pesos.
- Este repositorio no es el modelo original: es un derivado de cuantizacion. Para cuestiones de entrenamiento, arquitectura o comportamiento esperado, la referencia autorizada es BAAI/AREX-2.
- Compatibilidad: el correcto funcionamiento de las capacidades de agente, tool calling y multimodalidad depende de que el runtime (llama.cpp y derivados) soporte la plantilla de chat y el procesador multimodal del modelo; no se detalla en la informacion disponible.
- Fechas: el repositorio esta fechado en septiembre-octubre de 2026, con metadatos que pueden corresponder a un entorno de publicacion simulado o futuro; conviene verificar su vigencia en el momento de uso.

## Enlaces

- Repositorio GGUF (esta publicacion): https://huggingface.co/mradermacher/AREX-2-GGUF
- Modelo base: https://huggingface.co/BAAI/AREX-2
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/AREX-2-i1-GGUF
- Pagina de resumen y descargas del autor para este modelo: https://hf.tst.eu/model#AREX-2-GGUF
- Peticiones de cuantizacion y FAQ del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Ficha en free2aitools: https://free2aitools.com/model/mradermacher/arex-2-gguf
- Ficha en Hugging Bay: https://huggingbay.xyz/artifact/hf-model-mradermacher-arex-2-i1-gguf
- Perfil del autor en aimodels.fyi: https://www.aimodels.fyi/creators/huggingFace/mradermacher
- nethype GmbH (patrocinador del trabajo de cuantizacion): https://www.nethype.de/
