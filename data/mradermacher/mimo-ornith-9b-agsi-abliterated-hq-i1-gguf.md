# mradermacher/MiMo-Ornith-9B-AGSI-Abliterated-HQ-i1-GGUF

## Resumen

MiMo-Ornith-9B-AGSI-Abliterated-HQ-i1-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo MiMo-Ornith-9B-AGSI-Abliterated-HQ, publicado por el usuario mradermacher. El modelo subyacente procede de OliviaRossi/MiMo-Ornith-9B-AGSI-Abliterated-HQ y cuenta con 8.953.803.264 parámetros (aproximadamente 9.000 millones), según los datos de safetensors del repositorio base. La licencia declarada es Apache 2.0 y los idiomas soportados son inglés y chino.

El interés de esta ficha reside en que se trata de una variante "abliterated", es decir, con los mecanismos de rechazo y alineación de seguridad eliminados o atenuados mediante técnicas de abliteration, y con etiquetas que apuntan a capacidades de razonamiento, generación de código, uso agéntico y uso de terminal. Las etiquetas del repositorio incluyen qwen3_5, lo que sugiere una base derivada de la familia Qwen 3.5, aunque la información proporcionada no confirma la arquitectura exacta ni la longitud de contexto.

Esta publicación concreta no aporta pesos originales, sino cuantizaciones de tipo i1 (basadas en matriz de importancia, imatrix) generadas con llama.cpp. El repositorio ocupa 53,1 GB en total y ofrece desde IQ1_S hasta Q6_K, lo que permite desplegar el modelo en equipos de consumo con VRAM limitada. Según la model card, se trata de un modelo con capacidades de visión, cuyos ficheros mmproj se encuentran en el repositorio de cuantizaciones estáticas del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (las etiquetas del repositorio apuntan a una base qwen3_5; no se detalla en la informacion proporcionada) |
| Parametros totales | 8.953.803.264 (datos de safetensors del modelo base) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_S, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_NL, i1-IQ4_XS, i1-Q4_0, i1-Q4_1, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (todas con matriz de importancia) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo base ni el proceso de entrenamiento. Las etiquetas del repositorio incluyen terminos como merge, agsi, abliterated, abliterix y qwen3_5, lo que indica que se trata de una fusion de modelos (merge) sometida a un proceso de abliteration y construida sobre una base de la familia Qwen 3.5. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion.

En cuanto al trabajo de cuantizacion, mradermacher ha generado cuantizaciones i1 basadas en matriz de importancia (imatrix), un metodo que pondera el error de cuantizacion segun la relevancia de cada peso para el modelo, mejorando la calidad respecto a cuantizaciones estaticas del mismo tamano. La model card incluye ademas un fichero imatrix independiente (0,1 GB) para que terceros puedan generar sus propias cuantizaciones. Se indica que las cuantizaciones estaticas equivalentes estan disponibles en un repositorio separado.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta conversational del repositorio.
- Razonamiento (etiqueta reasoning), orientado a tareas de logica y problemas multi-paso.
- Generacion de codigo (etiqueta coding).
- Uso agéntico y de terminal (etiquetas agentic y terminal-use), lo que sugiere ejecucion de comandos y flujos de trabajo por pasos.
- Capacidades de vision: la model card afirma explicitamente que se trata de un modelo de vision, con ficheros mmproj disponibles en el repositorio de cuantizaciones estaticas.
- Modelo "uncensored" / abliterated: se han eliminado o atenuado los mecanismos de rechazo, por lo que responde a peticiones que un modelo alineado rechazaria.
- Soporte multilingue limitado a ingles y chino.
- Compatibilidad declarada con vLLM y llama.cpp, y con endpoints compatibles (etiqueta endpoints_compatible).
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion proporcionada.

## Casos de uso

- Asistente de codigo autoalojado: con cuantizaciones de 5,7 GB (i1-Q4_K_M) el modelo puede ejecutarse en una GPU de consumo y emplearse como asistente de autocompletado, refactorizacion y explicacion de codigo dentro del IDE, sin enviar codigo propietario a servicios externos.
- Automatizacion de terminal y operaciones: gracias a las etiquetas agentic y terminal-use, es adecuado para agentes que interpretan instrucciones en lenguaje natural y proponen o ejecutan comandos de shell en flujos de administracion de sistemas y DevOps.
- Analisis de documentos con vision: al tratarse de un modelo multimodal, puede procesar capturas de pantalla, diagramas o imagenes de documentos combinadas con texto, por ejemplo para extraer informacion de interfaces graficas o paneles de monitorizacion.
- Atencion al cliente en ingles o chino: al ser un modelo abliterated, permite desplegar un asistente conversacional sin las restricciones tipicas de rechazo, util en dominios donde los modelos alineados bloquean consultas legitimas (seguridad, medicina, legal), siempre que se aplie una capa de moderacion propia.
- Generacion de contenido y escritura asistida sin filtros: para redaccion de ficcion, guiones o material editorial que requiere tratar temas sensibles sin rechazos del modelo.
- Despliegue en hardware modesto: las cuantizaciones de 3,7-4,7 GB permiten ejecutar el modelo en portatiles con GPU de 8 GB o incluso en CPU con llama.cpp, lo que facilita prototipado local y entornos sin conexion.
- Investigacion sobre alineacion y seguridad: la variante abliterated es util como objeto de estudio para comparar el comportamiento de un modelo alineado frente a uno con los rechazos eliminados.
- Pipelines de agentes multi-paso: la combinacion de razonamiento, codigo y uso de terminal permite construir agentes que planifican, escriben scripts y los ejecutan de forma iterativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): aproximadamente 2,5-3 GB para i1-IQ1_S/IQ1_M; 3,7 GB para i1-IQ2_M; 3,9 GB para i1-Q2_K; 4,0 GB para i1-IQ3_XXS; 4,5 GB para i1-IQ3_M; 4,7 GB para i1-Q3_K_M; 5,5 GB para i1-Q4_K_S e i1-IQ4_NL; 5,7 GB para i1-Q4_K_M; 7,5 GB para i1-Q6_K.
- Hay que sumar a esas cifras el consumo de la cache KV, el buffer de contexto y las capas de vision (mmproj) si se activan; el total real sera superior al tamano del fichero GGUF.
- GPU de consumo: las cuantizaciones de 3,7-5,7 GB caben en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 2070) y con holgura en 12 GB (RTX 3060 12 GB, RTX 4070). La cuantizacion i1-Q6_K de 7,5 GB requiere 12 GB o mas para dejar espacio a la cache.
- GPU profesionales: A100, H100, L40S o similares permiten ejecutar la cuantizacion de mayor calidad con contextos largos y lotes grandes, aunque el modelo es pequeno para ese hardware.
- CPU: las cuantizaciones bajas (IQ2, Q2_K, Q3) pueden ejecutarse en CPU con llama.cpp, con velocidades dependientes del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; para versiones en precision completa o FP8/INT8, vLLM y TGI sobre el modelo base en safetensors. La model card menciona vLLM entre las etiquetas del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de las alternativas que figuran a continuacion corresponden a informacion publica general y no a la documentacion aportada en esta busqueda; se incluyen unicamente como referencia de categoria.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiMo-Ornith-9B-AGSI-Abliterated-HQ-i1-GGUF | 8,95 B | No disponible | Apache 2.0 | GGUF (i1) | Abliterated, multimodal segun la model card, idiomas en/zh |
| OliviaRossi/MiMo-Ornith-9B-AGSI-Abliterated-HQ (modelo base) | 8,95 B | No disponible | Apache 2.0 | Safetensors | Version sin cuantizar del mismo modelo |
| mradermacher/MiMo-Ornith-9B-AGSI-Abliterated-HQ-GGUF (cuantizaciones estaticas) | 8,95 B | No disponible | Apache 2.0 | GGUF (estaticas) | Mismo modelo, cuantizacion no basada en imatrix; aloja los ficheros mmproj |
| Alternativas de ~9 B de la misma categoria (Qwen 3, Llama 3.1 8B, Gemma 2 9B) | ~8-9 B | No disponible en esta busqueda | Apache 2.0 / licencias especificas | Safetensors, GGUF | No se dispone de datos comparativos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo abliterated: los mecanismos de rechazo han sido eliminados o atenuados. Puede generar contenido ofensivo, inseguro, ilegal o danino sin filtros. No es apto para despliegue directo al publico sin una capa de moderacion propia.
- Riesgo elevado de alucinacion en tareas de conocimiento factual, especialmente con cuantizaciones agresivas (IQ1, IQ2, Q2_K), donde la perdida de calidad respecto al modelo original es notable.
- Las cuantizaciones por debajo de Q4 (especialmente IQ1_S, IQ1_M e IQ2_XXS) degradan de forma significativa el razonamiento y la coherencia; se recomienda i1-Q4_K_M o superior para uso en produccion.
- Cobertura idiomatica limitada a ingles y chino. El rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- La longitud de contexto no esta especificada en la informacion disponible; no se puede garantizar el comportamiento en conversaciones largas ni asumir la ventana de la familia Qwen 3.5 sin verificacion.
- Licencia Apache 2.0 permite uso comercial, pero el autor de la cuantizacion y el autor del modelo base no ofrecen garantias; el cumplimiento de la licencia del modelo original debe verificarse en el repositorio de OliviaRossi.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y se creo el 26 de septiembre de 2026: no hay validacion de la comunidad ni informes independientes de calidad.
- El repositorio ocupa 53,1 GB, por lo que conviene descargar unicamente la cuantizacion necesaria mediante descarga selectiva de ficheros.
- No se han publicado benchmarks, por lo que cualquier afirmacion sobre rendimiento relativo frente a otros modelos carece de respaldo en la informacion disponible.
- Etiquetas como terminal-use o agentic describen capacidades declaradas por el autor; no implican que el modelo ejecute acciones de forma segura o fiable sin supervision humana.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/MiMo-Ornith-9B-AGSI-Abliterated-HQ-i1-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/MiMo-Ornith-9B-AGSI-Abliterated-HQ
- Cuantizaciones estaticas (incluye ficheros mmproj): https://huggingface.co/mradermacher/MiMo-Ornith-9B-AGSI-Abliterated-HQ-GGUF
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#MiMo-Ornith-9B-AGSI-Abliterated-HQ-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
