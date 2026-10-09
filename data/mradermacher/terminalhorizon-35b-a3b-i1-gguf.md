# mradermacher/TerminalHorizon-35B-A3B-i1-GGUF

## Resumen

TerminalHorizon-35B-A3B-i1-GGUF es la versión cuantizada en formato GGUF del modelo TerminalHorizon-35B-A3B, un modelo de lenguaje especializado en tareas de agente de terminal (CLI) y razonamiento agéntico de horizonte largo. Las cuantizaciones han sido generadas por mradermacher combinando métodos weighted e imatrix, y se distribuyen exclusivamente en GGUF para su uso con llama.cpp y sus derivados. El modelo base fue desarrollado por el usuario shunzou05 y está publicado bajo licencia Apache 2.0.

El modelo base presenta 34.660.610.688 parámetros totales (aproximadamente 34,66 mil millones) según los pesos en safetensors, y la nomenclatura "A3B" del identificador apunta a una arquitectura de mezcla de expertos (MoE) con aproximadamente 3 mil millones de parámetros activos por token, aunque la información disponible no confirma explícitamente esta lectura. Está afinado mediante supervisión (SFT) sobre los datasets TerminalHorizon-3K y TerminalHorizon-Environment, orientados a entornos de terminal y ejecución de comandos.

Su relevancia actual reside en el nicho de agentes autónomos de línea de comandos y automatización de sistemas: el modelo está etiquetado como coding-agent, long-horizon y RSI (razonamiento iterativo), y la propia model card lo describe como un modelo con capacidades de visión. No obstante, no se han publicado datos de benchmarks, longitud de contexto ni detalles de arquitectura en la información disponible, por lo que su evaluación cuantitativa queda pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (segun nomenclatura A3B; no confirmado explicitamente en la informacion disponible) |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3 B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-Q4_K_S, i1-Q4_K_M (archivos publicados); el listado completo de quants generados incluye ademas Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_L, IQ4_XS, small-IQ4_NL, Q4_0, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base se publica presumiblemente en safetensors, no confirmado en la informacion disponible |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base. El identificador "35B-A3B" sigue la convencion habitual en modelos de mezcla de expertos (MoE), donde el primer numero indica los parametros totales y el sufijo "A3B" los parametros activos por token (aproximadamente 3 mil millones). El recuento real de parametros en safetensors es de 34.660.610.688, ligeramente por debajo de los 35 B nominales. No se dispone de informacion sobre el numero de expertos, el numero de capas, el tipo de atencion ni el tokenizador.

En cuanto al entrenamiento, las etiquetas del repositorio indican un ajuste supervisado (supervised-fine-tuning) sobre los datasets shunzou05/TerminalHorizon-3K y shunzou05/TerminalHorizon-Environment, ambos orientados a entornos de terminal. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases adicionales de RLHF, DPO u otras tecnicas de alineamiento. La model card menciona que se trata de un modelo con capacidades de vision, pero no aporta detalles sobre el codificador visual ni sobre el entrenamiento multimodal. Tampoco se documentan innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto y razonamiento orientado a tareas de terminal y linea de comandos.
- Ejecucion de flujos agenticos de horizonte largo (long-horizon), con etiquetas explicitas de agentic y RSI (razonamiento iterativo).
- Uso como coding-agent: resolucion de tareas de programacion y scripting.
- Capacidades de vision declaradas por el autor de las cuantizaciones (el modelo se anuncia como vision model, con archivos mmproj disponibles en el repositorio estatico si existen).
- Soporte de conversacion multiturno (etiqueta conversational).
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.

## Casos de uso

- Automatizacion de tareas de administracion de sistemas: el modelo puede generar e interpretar comandos de shell para aprovisionamiento, gestion de ficheros o despliegue, dado su entrenamiento especifico sobre entornos de terminal.
- Agentes CLI autonomos: integrado en un bucle agentico, puede encadenar comandos, leer su salida y corregir el rumbo en tareas de varios pasos gracias a su orientacion long-horizon.
- Asistente de depuracion en produccion: interpretacion de trazas, logs y mensajes de error de la terminal para proponer comandos de diagnostico y remediacion.
- Generacion y refactorizacion de scripts: creacion de scripts de automatizacion (bash, Python de sistema) a partir de descripciones en lenguaje natural.
- Integracion en pipelines de CI/CD: uso del modelo como componente de un agente que ejecuta y valida pasos de build, test y despliegue en entornos controlados.
- Copiloto para desarrolladores dentro de la terminal: sugerencias de comandos contextuales y explicacion de comandos existentes.
- Evaluacion de entornos de terminal mediante el dataset TerminalHorizon-Environment: util para investigacion en agentes de terminal y generacion de trayectorias sinteticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los pesos en formato GGUF ocupan, segun los archivos publicados: 13,0 GB (i1-Q2_K), 13,7 GB (i1-IQ3_XXS), 15,5 GB (i1-IQ3_M), 16,9 GB (i1-Q3_K_M), 20,0 GB (i1-Q4_K_S) y 21,3 GB (i1-Q4_K_M). A estas cifras hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto, no disponible.
- Las cuantizaciones de 13 a 17 GB (Q2_K, IQ3_XXS, IQ3_M, Q3_K_M) pueden caber en GPU de consumo con 16 GB de VRAM (RTX 4080, RTX 4060 Ti 16 GB) si se limita el contexto.
- Las cuantizaciones de 20 a 21,3 GB (Q4_K_S, Q4_K_M) requieren al menos 24 GB de VRAM para caber completamente (RTX 3090, RTX 4090, A5000). En GPUs con menos memoria puede recurrirse a offload parcial a CPU.
- Para despliegue con contexto largo o lote alto se recomiendan GPUs de centro de datos (A100 40/80 GB, H100 80 GB) o varias GPUs de consumo en paralelo.
- Opciones de despliegue: llama.cpp y sus interfaces (Ollama, LM Studio, koboldcpp), asi como cualquier runtime compatible con GGUF. vLLM y TGI no estan confirmados como compatibles con estas cuantizaciones en la informacion disponible.
- Latencia y throughput estimados: no disponible. Al tratarse presumiblemente de una arquitectura MoE con pocos parametros activos, la velocidad de decodificacion deberia ser superior a la de un modelo denso del mismo tamano total, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| TerminalHorizon-35B-A3B-i1-GGUF (este modelo) | 34,66 B totales (activos no disponibles) | no disponible | GGUF (i1/imatrix) | apache-2.0 | no disponible |
| TerminalHorizon-35B-A3B-GGUF (cuantizaciones estaticas, mradermacher) | 34,66 B totales | no disponible | GGUF | apache-2.0 | no disponible |
| shunzou05/TerminalHorizon-35B-A3B (modelo base) | 34,66 B totales | no disponible | safetensors (presumible) | apache-2.0 | no disponible |

No se han encontrado en la busqueda web modelos comparables con datos de benchmarks publicados para esta categoria concreta (agentes de terminal MoE de ~35 B). No se dispone de cifras verificables para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente para ingles, por lo que su rendimiento en castellano u otros idiomas no esta garantizado.
- Ausencia total de benchmarks publicados: no es posible estimar su calidad relativa frente a alternativas sin evaluacion propia.
- Longitud de contexto desconocida: no se puede planificar el uso en tareas que requieran ventanas amplias sin verificacion previa.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; es especialmente critico en la generacion de comandos de terminal, donde un comando incorrecto puede provocar perdida de datos o danos en el sistema.
- Seguridad operativa: cualquier agente basado en este modelo que ejecute comandos debe desplegarse en entornos aislados (contenedores, sandboxes) con permisos minimos.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se documenten los cambios. No impone restricciones de uso adicionales conocidas.
- Las cuantizaciones de baja calidad (i1-Q2_K, i1-IQ3_XXS) degradan la precision de forma notable; para uso en produccion se recomienda partir de i1-Q4_K_S o i1-Q4_K_M.
- La afirmacion de que se trata de un modelo con vision no esta respaldada con detalles en la informacion disponible; conviene verificar los archivos mmproj antes de asumir capacidades multimodales.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no existe validacion por parte de la comunidad.
- El modelo base y los datasets asociados son de autores individuales (shunzou05), sin documentacion ampliada sobre procedencia de datos.

## Enlaces

- Repositorio HuggingFace (cuantizaciones i1/imatrix): https://huggingface.co/mradermacher/TerminalHorizon-35B-A3B-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/TerminalHorizon-35B-A3B-GGUF
- Modelo base: https://huggingface.co/shunzou05/TerminalHorizon-35B-A3B
- Dataset de entrenamiento: https://huggingface.co/datasets/shunzou05/TerminalHorizon-3K
- Dataset de entorno: https://huggingface.co/datasets/shunzou05/TerminalHorizon-Environment
- Indice de modelos de mradermacher: https://hf.tst.eu/model#TerminalHorizon-35B-A3B-i1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad por tipo de quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
