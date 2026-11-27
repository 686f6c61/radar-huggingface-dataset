# mradermacher/BlueBerry-3-GGUF

## Resumen

BlueBerry-3 es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por el usuario artindnr y distribuido en formato GGUF por mradermacher. Con 116.829.156.672 parametros totales (aproximadamente 116,8 mil millones) y entrenado presumiblemente en mxfp4, se posiciona como un modelo de gran escala orientado a generacion de texto conversacional y multilingue. La version aqui descrita es una cuantizacion estatica del modelo base original, pensada para su despliegue en entornos con llama.cpp y herramientas compatibles con GGUF.

El modelo declara soporte para seis idiomas (persa, ingles, arabe, frances, aleman y espanol) y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integracion en productos. Su naturaleza MoE implica que, aunque el total de parametros es elevado, solo una fraccion se activa por token, lo que reduce el coste computacional en inferencia respecto a un modelo denso del mismo tamano.

La relevancia actual de esta ficha radica en que permite a desarrolladores e investigadores evaluar rapidamente un modelo de gran porte con licencia permisiva y cuantizaciones disponibles en multiples niveles de calidad, desde Q2_K hasta Q8_0, adaptandose a distintos presupuestos de hardware. No obstante, la informacion publica sobre arquitectura detallada, datos de entrenamiento y benchmarks es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), transformer; detalles de capas no disponibles |
| Parametros totales | 116.829.156.672 (aprox. 116,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas; no hay imatrix/weighted disponibles) |
| Idiomas soportados | fa, en, ar, fr, de, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors/PyTorch |

## Arquitectura y entrenamiento

La informacion disponible confirma que BlueBerry-3 es un modelo de mezcla de expertos (MoE) con 116,8 mil millones de parametros totales. El tag `mxfp4` sugiere que el modelo base emplea cuantizacion de precision reducida en formato MXFP4, probablemente para reducir el peso de almacenamiento y facilitar el entrenamiento o la distribucion. No se dispone de datos sobre el numero de expertos, el numero de parametros activos por token, la dimension oculta, el numero de capas ni el mecanismo de enrutamiento.

Tampoco se han publicado detalles sobre el corpus de entrenamiento (numero de tokens, composicion, proporciones por idioma), ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o instruccion supervisada. La model card del repositorio GGUF es meramente una ficha de cuantizacion generada por mradermacher y no incluye informacion tecnica del modelo original. Se desconoce igualmente si incorpora innovaciones como atencion lineal, decodificacion especulativa o modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional en seis idiomas: persa, ingles, arabe, frances, aleman y espanol.
- Razonamiento y respuesta a instrucciones de proposito general, segun la categoria `text-generation` y el tag `conversational`.
- Soporte multilingue declarado, con especial atencion a idiomas de Oriente Medio (fa, ar) y europeos (en, fr, de, es).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estandar.
- No se documenta soporte explicito de tool calling, function calling, agentes, vision, audio ni modo de pensamiento (thinking mode); estos datos no estan disponibles.
- Al ser un modelo MoE, se espera un throughput superior al de un denso equivalente, aunque no se han publicado mediciones.

## Casos de uso

- Atencion al cliente multilingue: el modelo puede gestionar conversaciones en arabe, persa, frances, aleman, espanol e ingles, lo que lo hace adecuado para empresas con clientela internacional que necesiten un unico modelo para varios mercados.
- Generacion de contenido editorial en espanol y frances: util para redaccion de borradores, resumenes y reescritura de textos en entornos de medios o marketing, aprovechando su licencia Apache 2.0 para uso comercial.
- Traduccion asistida entre los seis idiomas soportados: aunque no es un modelo de traduccion dedicado, su cobertura multilingue permite tareas de traduccion informal o post-edicion en pipelines de localizacion.
- Chatbots de soporte tecnico en ingles y aleman: integrable mediante llama.cpp u Ollama en infraestructura propia, sin dependencia de APIs externas, lo que reduce costes recurrentes.
- Procesamiento de documentos en arabe y persa: extraccion de informacion, resumen y clasificacion de textos en idiomas con menor representacion en modelos occidentales, gracias a su cobertura linguistica declarada.
- Prototipado de asistentes conversacionales en investigación: al estar disponible en GGUF con cuantizaciones desde Q2_K (66 GB) hasta Q8_0 (124 GB), permite experimentar en clusters con distinta capacidad de VRAM.
- Despliegue en entornos con requisitos de soberania de datos: al ser Apache 2.0 y ejecutable localmente con llama.cpp, puede instalarse en infraestructura on-premise sin enviar datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K y Q3_K_S requieren aproximadamente 66 GB; IQ4_XS unos 67 GB; Q4_K_S 81 GB; Q4_K_M 88 GB; Q5_K_M 94 GB; Q6_K 124 GB; Q8_0 124 GB. Estas cifras corresponden al tamano del archivo GGUF y deben sumarse el overhead de contexto y de la cache KV.
- GPU recomendadas: para las cuantizaciones mas bajas (Q2_K, Q3_K_S, IQ4_XS) se necesita al menos una GPU con 80 GB de VRAM (A100 80GB, H100 80GB) o varias GPU en paralelo. Las cuantizaciones Q4 y Q5 requieren 2x A100 80GB o 2x H100. Q6_K y Q8_0 requieren al menos 2x H100 80GB o configuraciones multi-GPU mayores.
- No cabe en GPU de consumo (RTX 4090 con 24 GB, RTX 3090 con 24 GB) en ninguna cuantizacion, ni siquiera en Q2_K, dado que el minimo es de 66 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (si se importa el GGUF), y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui. Para el modelo base en safetensors se requeriria vLLM o TGI, pero no se han publicado guias al respecto.
- Latencia y throughput estimados: no disponibles. Al ser MoE, se espera un throughput superior al de un denso de 116 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BlueBerry-3 (GGUF) | 116,8 B (MoE) | no disponible | Apache 2.0 | GGUF | 6 idiomas; sin benchmarks publicos |
| Mixtral 8x7B | 46,7 B (MoE) | 32k | Apache 2.0 | safetensors, GGUF | Referencia MoE open source; benchmarks publicos |
| Qwen2.5-72B | 72,7 B (denso) | 128k | Apache 2.0 (mayoria variantes) | safetensors, GGUF | Multilingue amplio; benchmarks publicos |
| Llama 3.1 70B | 70,6 B (denso) | 128k | Llama 3.1 Community | safetensors, GGUF | Multilingue; benchmarks publicos |

La comparativa es orientativa: no se dispone de datos de rendimiento de BlueBerry-3 que permitan una comparacion cuantitativa con estos modelos. En terminos de tamano, BlueBerry-3 supera a Mixtral 8x7B y a los densos de 70 B, pero se desconoce su calidad real.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicos: no es posible evaluar su calidad frente a alternativas consolidadas sin pruebas propias.
- Informacion tecnica muy escasa: se desconocen contexto maximo, numero de expertos, parametros activos y datos de entrenamiento, lo que dificulta estimar su comportamiento en produccion.
- Riesgo de alucinacion: como todo modelo generativo de gran escala, puede producir informacion falsa o inventada, especialmente en idiomas con menos datos de entrenamiento (fa, ar).
- Sesgos desconocidos: no se ha documentado ninguna evaluacion de sesgos ni de seguridad; se recomienda auditoria previa a despliegues sensibles.
- Limitaciones de contexto: al no publicarse la longitud de contexto, no se puede garantizar el manejo de conversaciones o documentos largos.
- Requisitos de hardware elevados: incluso la cuantizacion mas agresiva (Q2_K, 66 GB) exige hardware de clase servidor, lo que limita su uso a organizaciones con infraestructura significativa.
- Cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior, lo que eleva el requisito a 88 GB o mas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad del despliegue recae en el integrador.
- El repositorio GGUF tiene muy poca traccion (202 descargas, 2 likes en el momento de la consulta), lo que reduce la probabilidad de que se hayan detectado y corregido problemas de cuantizacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/BlueBerry-3-GGUF
- Modelo base: https://huggingface.co/artindnr/BlueBerry-3
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#BlueBerry-3-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
