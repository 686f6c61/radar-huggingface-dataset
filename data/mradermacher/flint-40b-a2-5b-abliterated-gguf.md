# mradermacher/Flint-40B-A2.5B-abliterated-GGUF

## Resumen

Flint-40B-A2.5B-abliterated-GGUF es la versión cuantizada en formato GGUF del modelo dima6312/Flint-40B-A2.5B-abliterated, publicada por mradermacher, un conocido creador de cuantizaciones estáticas para llama.cpp. Se trata de un modelo de arquitectura de mezcla de expertos (MoE) con 39.785.287.456 parámetros totales y, según la nomenclatura del autor, aproximadamente 2,5 mil millones de parámetros activos por token, lo que lo sitúa en la categoría de modelos dispersos de gran capacidad pero coste de inferencia reducido.

La particularidad del modelo es que ha sido "abliterated": se ha aplicado una técnica de eliminación de la dirección de rechazo en el espacio de activaciones, apoyada en los datasets mlabonne/harmful_behaviors y mlabonne/harmless_alpaca, con el objetivo de reducir las negativas del modelo ante peticiones sensibles. Los tags del autor lo orientan a ciberseguridad y generación de código, y el modelo base declara licencia Apache-2.0 y soporte únicamente para inglés.

Esta ficha cubre la variante GGUF, que es la relevante para despliegue local: el repositorio ocupa 271 GB e incluye 11 cuantizaciones estáticas desde Q2_K (14,8 GB) hasta Q8_0 (42,5 GB). No hay información publicada sobre longitud de contexto, datos de entrenamiento ni resultados de benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, segun el tag `moe` del autor; detalles de capas y atencion no disponibles |
| Parametros totales | 39.785.287.456 (dato real de safetensors del modelo base) |
| Parametros activos | ~2,5B (deducido de la nomenclatura A2.5B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (cuantizaciones estaticas; sin imatrix/weighted disponibles) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 271 GB; ficheros probablemente multiparte en las cuantizaciones altas) |

## Arquitectura y entrenamiento

El modelo sigue un diseno de mezcla de expertos: de los 39,8 mil millones de parametros totales solo se activa un subconjunto por token, estimado en torno a 2,5 mil millones segun el sufijo A2.5B del nombre. Esto permite almacenar un modelo de escala 40B con un coste computacional por token comparable al de un modelo denso de ~2,5B, a cambio de un mayor uso de memoria. No se dispone de informacion sobre el numero de capas, el numero de expertos, la estrategia de enrutamiento ni la ventana de contexto en la informacion proporcionada.

El proceso de "abliteration" consiste en identificar y restar la direccion de activacion asociada al rechazo de peticiones, un procedimiento que no requiere reentrenamiento completo y que en este caso se ha apoyado en los datasets mlabonne/harmful_behaviors y mlabonne/harmless_alpaca. No se detallan en la model card ni el volumen de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documenta ninguna innovacion adicional de decodificacion o atencion.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat (`conversational` en los tags del repositorio).
- Generacion y asistencia en codigo, segun el tag `code` del autor.
- Contenido orientado a ciberseguridad (tag `cybersecurity`), sin detalle de tareas concretas soportadas.
- Respuesta sin rechazos ante peticiones que un modelo alineado convencionalmente declinaria, como consecuencia del proceso de abliteration.
- Inferencia local eficiente en CPU/GPU gracias a las cuantizaciones GGUF y al bajo numero de parametros activos.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Analisis de codigo y revision de seguridad en local: el modelo puede procesar fragmentos de codigo y senalar patrones de riesgo sin depender de una API externa, lo que resulta adecuado para entornos con codigo propietario que no debe salir de la infraestructura.
- Asistente de desarrollo en estaciones de trabajo con GPU de consumo: con Q4_K_M (24,3 GB) o Q2_K (14,8 GB) se puede ejecutar en una RTX 3090/4090 o en un equipo con 32 GB de RAM y offload parcial, manteniendo una velocidad de generacion alta por los pocos parametros activos.
- Generacion de codigo en pipelines internos: al ser un GGUF servido con llama.cpp u Ollama, se puede exponer como endpoint compatible con la API de OpenAI y consumirlo desde scripts de CI/CD o herramientas de autocompletado.
- Investigacion en seguridad ofensiva y defensiva: util para redactar reglas de deteccion, analizar trazas o explicar tecnicas de ataque en laboratorios controlados, precisamente porque el modelo no bloquea contenido tecnico sensible.
- Estudio de alineacion y robustez: sirve como contrapunto en experimentos que comparan el comportamiento de un modelo abliterated frente a su version alineada, midiendo tasas de rechazo y degradacion de calidad.
- Procesamiento por lotes de texto en ingles en hardware modesto: clasificacion, extraccion y resumen de documentos donde el throughput importa mas que la calidad puntera, aprovechando la relacion 40B almacenados / ~2,5B activos.
- Prototipado de agentes de codigo en local: combinable con herramientas externas que gestionen el bucle de acciones, ya que el modelo en si no documenta soporte nativo de function calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin cache KV): Q2_K 14,8 GB; Q3_K_S 17,4 GB; Q3_K_M 19,2 GB; Q3_K_L 20,8 GB; IQ4_XS 21,6 GB; Q4_K_S 22,8 GB; Q4_K_M 24,3 GB; Q5_K_S 27,6 GB; Q5_K_M 28,4 GB; Q6_K 32,8 GB; Q8_0 42,5 GB.
- La cache KV y el contexto anaden overhead no cuantificado en la model card; hay que reservar margen adicional sobre las cifras anteriores.
- GPU de consumo: Q2_K y Q3_K_S caben en tarjetas de 16-24 GB; Q4_K_S y Q4_K_M encajan en 24 GB (RTX 3090, RTX 4090) con contexto moderado. A partir de Q5_K_M se recomienda 32 GB o mas.
- GPU de datacenter: A100 40/80 GB, H100 80 GB o L40S 48 GB para Q6_K y Q8_0 sin offload.
- Despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF (llama-cpp-python, text-generation-webui). vLLM y TGI no son la via natural para estos ficheros salvo conversion previa a safetensors.
- Latencia y throughput: no disponibles; se espera un rendimiento por token propio de un modelo de ~2,5B activos, limitado por el ancho de banda de memoria al cargar expertos.
- CPU-only: viable en configuraciones con 32-64 GB de RAM para las cuantizaciones bajas, con velocidades de decodificacion reducidas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Flint-40B-A2.5B-abliterated-GGUF (este) | 39,8B | ~2,5B | no disponible | apache-2.0 | GGUF | 11 cuantizaciones estaticas, sin imatrix |
| dima6312/Flint-40B-A2.5B-abliterated | 39,8B | ~2,5B | no disponible | apache-2.0 | safetensors (presumiblemente) | Modelo base sin cuantizar del que deriva esta version |
| Alternativas MoE abliterated de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de benchmarks ni de modelos comparables en la informacion proporcionada |

No hay resultados de evaluacion que permitan establecer una comparacion cuantitativa de rendimiento con otras alternativas.

## Limitaciones y advertencias

- El proceso de abliteration degrada la alineacion de seguridad: el modelo puede producir contenido danino, ilegal o inseguro sin filtros, lo que exige controles propios si se expone a usuarios finales.
- Riesgo de alucinacion no medido: no hay benchmarks ni evaluaciones de fidelidad publicadas.
- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto desconocida: no se debe asumir una ventana larga en produccion sin pruebas previas.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M para uso general.
- No hay cuantizaciones ponderadas con imatrix, que suelen ofrecer mejor relacion calidad/tamano que las estaticas equivalentes.
- El repositorio ocupa 271 GB; descargar cuantizaciones altas implica ficheros multiparte y verificacion de integridad.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad legal y etica del contenido generado recae en el desplegador.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de comunidad ni de validacion independiente del modelo.

## Enlaces

- HuggingFace (esta cuantizacion): https://huggingface.co/mradermacher/Flint-40B-A2.5B-abliterated-GGUF
- Modelo base: https://huggingface.co/dima6312/Flint-40B-A2.5B-abliterated
- Pagina de overview y descargas de mradermacher: https://hf.tst.eu/model#Flint-40B-A2.5B-abliterated-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Dataset mlabonne/harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset mlabonne/harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
