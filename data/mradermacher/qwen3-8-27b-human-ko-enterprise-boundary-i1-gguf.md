# mradermacher/Qwen3.8-27B-Human-KO-Enterprise-Boundary-i1-GGUF

## Resumen

Qwen3.8-27B-Human-KO-Enterprise-Boundary-i1-GGUF es una cuantizacion en formato GGUF realizada por mradermacher sobre el modelo ThakiCloud/Qwen3.8-27B-Human-KO-Enterprise-Boundary, un modelo de 27.320.697.856 parametros (unos 27,3 mil millones) orientado a operaciones empresariales en coreano, cumplimiento de politicas internas y uso de herramientas. No se trata de un modelo nuevo, sino de una conversion a GGUF con cuantizacion ponderada mediante imatrix, pensada para ejecutar el modelo en hardware de consumo o en servidores sin GPU de gran formato.

El modelo base declara los idiomas coreano e ingles, con etiquetas que apuntan a casos de uso muy concretos: agentes, tool use, cumplimiento de politicas corporativas, toma de decisiones, transferencia cross-lingual y zero-shot en ingles. Los datasets asociados (ThakiCloud/EnterpriseOps-Blind-A y ThakiCloud/EnterpriseOps-KO-Policy) sugieren un ajuste fino sobre escenarios de operaciones empresariales y evaluacion ciega de politicas.

Su relevancia inmediata es practica: permite desplegar localmente un modelo de ~27B especializado en dominio corporativo coreano con licencia Apache 2.0, algo poco habitual. La contrapartida es la escasez de documentacion tecnica publicada: no hay datos de contexto, arquitectura detallada ni benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del modelo base sugiere una base de la familia Qwen3.8; no se documenta en la informacion disponible) |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | En este repositorio i1: i1-Q2_K (11,0 GB) y fichero imatrix (0,1 GB). Los metadatos del model card listan ademas: Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (los cuantos estaticos se publican en el repositorio enlazado como estatico) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio). El modelo base esta en formato transformers/safetensors, de donde procede el recuento real de parametros |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. El recuento de parametros (27,32 mil millones) es el dato real extraido de los ficheros safetensors del modelo original, y el nombre del repositorio apunta a una base de la familia Qwen3.8, pero no se confirma ni el tipo de atencion, ni la presencia de mecanismos MoE, ni la longitud de contexto soportada. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

Lo que si se declara es el ajuste fino sobre dos datasets propios de ThakiCloud: EnterpriseOps-Blind-A, que por su nombre corresponde a un conjunto de evaluacion ciega, y EnterpriseOps-KO-Policy, centrado en politicas empresariales en coreano. Las etiquetas del model card mencionan explicitamente un "pointer-head", lo que sugiere un mecanismo de prediccion de spans o punteros hacia fragmentos de politica relevantes, asi como capacidades cross-lingual y zero-shot en ingles. Esta cuantizacion concreta ha sido generada con cuantizacion ponderada mediante imatrix y el autor indica que es una conversion (convert_type: hf) con tensor de salida cuantizado; no modifica el entrenamiento, solo la representacion numerica de los pesos.

## Capacidades

- Generacion de texto conversacional en coreano e ingles, incluyendo conversaciones multi-turno.
- Razonamiento orientado a decisiones empresariales y evaluacion de cumplimiento de politicas corporativas.
- Tool calling y function calling, segun las etiquetas "agent" y "tool-use" del model card.
- Flujos de agente y razonamiento multi-paso en entornos de operaciones empresariales.
- Capacidad cross-lingual coreano-ingles, con soporte declarado de zero-shot en ingles.
- Mecanismo de "pointer-head" orientado a senalar fragmentos concretos de documentos o politicas.
- El README del cuantizador incluye la frase "This is a vision model", indicando que los ficheros mmproj, si existieran, estarian en el repositorio estatico; no se confirma en la informacion disponible que el modelo tenga capacidades de vision, y este repositorio no incluye ficheros mmproj.
- No se documentan capacidades de audio, matematicas avanzadas ni generacion de codigo en la informacion disponible.

## Casos de uso

- Validacion de politicas internas: el modelo puede recibir una solicitud de empleado o una operacion propuesta y determinar si infringe la politica corporativa, senalando la clausula relevante gracias al mecanismo de pointer-head y al ajuste sobre EnterpriseOps-KO-Policy.
- Automatizacion de flujos de operaciones empresariales: aprobacion de gastos, compras o solicitudes de acceso, donde el modelo clasifica la peticion, consulta la normativa aplicable y emite una recomendacion trazable.
- Atencion al empleado (helpdesk interno de RRHH o TI): gestion de conversaciones multi-turno en coreano con escalado a ingles cuando el caso lo requiera, apoyandose en tool calling para consultar sistemas internos.
- Agentes conectados a ERP/CRM: el modelo actua como planificador que decide que herramienta invocar (consulta de tickets, estado de pedido, alta de incidencia) y encadena varios pasos hasta resolver la tarea.
- Traduccion y adaptacion de documentacion corporativa coreano-ingles: normalizacion de politicas y procedimientos para filiales internacionales, aprovechando la capacidad cross-lingual declarada.
- Auditoria documental y revision de contratos o normativas: extraccion de los pasajes relevantes a una consulta concreta mediante el pointer-head, para que un revisor humano valide la decision.
- Evaluacion interna de modelos: uso de EnterpriseOps-Blind-A como conjunto de prueba ciego para comparar variantes del modelo o cuantizaciones antes de desplegarlas.
- Despliegue on-premise con datos sensibles: al distribuirse en GGUF y con licencia Apache 2.0, puede ejecutarse en infraestructura propia sin enviar informacion corporativa a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso de los ficheros: la cuantizacion i1-Q2_K ocupa 11,0 GB y el fichero imatrix 0,1 GB. El repositorio completo declarado es de 10,9 GB.
- VRAM estimada para el cuantizado i1-Q2_K: aproximadamente 12-14 GB considerando pesos y overhead de contexto. Es una estimacion aritmetica a partir del tamano de fichero publicado por el autor, no un dato oficial del modelo.
- GPU de 16 GB: un articulo externo (ofox.ai) plantea ejecutar Qwen3.8-27B en GPU de 16 GB como la RTX 5080 con configuracion de contexto corto, distinguiendo explicitamente entre tamano de fichero y VRAM necesaria.
- GPU de 24 GB (RTX 3090, RTX 4090): permitiria el mismo cuantizado con ventanas de contexto mayores, a falta de datos oficiales de consumo por contexto.
- GPU de 12 GB o menos: requeriria offload parcial de capas a CPU, con la consiguiente perdida de velocidad.
- Memoria de sistema: al menos ~11 GB de RAM libre para ejecucion completa en CPU del cuantizado Q2_K, mas margen para la cache de contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. vLLM y TGI tienen soporte limitado o experimental de GGUF, por lo que el autor publica tambien cuantizaciones estaticas en un repositorio aparte para otros flujos.
- Latencia y throughput: no disponible.
- Nota de calidad: el propio model card advierte que para tamanos bajos, IQ3_XXS suele dar mejor relacion calidad/tamano que Q2_K.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada, ni de resultados de benchmarks que permitan situar este modelo frente a alternativas. Los modelos de tamano similar que suelen considerarse en esta categoria (por ejemplo, bases de ~24-32 mil millones de parametros de otras familias) no aparecen documentados en la informacion disponible, por lo que cualquier comparacion de rendimiento, contexto o licencia seria especulativa.

| Modelo | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| Qwen3.8-27B-Human-KO-Enterprise-Boundary (este, en GGUF) | 27,32 mil millones | no disponible | Apache 2.0 | no disponible |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Documentacion muy escasa: no hay datos publicados de longitud de contexto, arquitectura, dataset de entrenamiento ni proceso de alineacion, lo que dificulta estimar su comportamiento en produccion.
- Riesgo de alucinacion: al estar ajustado para cumplimiento de politicas, una respuesta incorrecta puede tener consecuencias legales o de cumplimiento normativo; se recomienda validacion humana en decisiones criticas.
- Especializacion estrecha: el ajuste se centra en operaciones empresariales en coreano y en evaluacion de politicas, por lo que su rendimiento fuera de ese dominio es incierto.
- Cobertura limitada de idiomas: solo coreano e ingles declarados. El castellano no esta soportado de forma explicita.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o robustez del modelo base ni de esta cuantizacion.
- Perdida de calidad por cuantizacion: Q2_K es una cuantizacion de muy baja precision sobre un modelo de 27B; el propio autor sugiere IQ3_XXS como alternativa mejor en esa franja de tamano. Para tareas de razonamiento sensible conviene usar cuantizaciones mayores.
- Ambiguedad sobre multimodalidad: el README del cuantizador afirma que se trata de un modelo de vision, pero no se aportan ficheros mmproj ni confirmacion en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base en su repositorio original, ya que la informacion disponible no incluye su model card completa.
- Ausencia de adopcion verificable: el repositorio figura con 0 descargas y 0 likes, sin pipeline declarado, lo que limita la evidencia externa sobre su calidad.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/Qwen3.8-27B-Human-KO-Enterprise-Boundary-i1-GGUF
- Modelo base: https://huggingface.co/ThakiCloud/Qwen3.8-27B-Human-KO-Enterprise-Boundary
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3.8-27B-Human-KO-Enterprise-Boundary-GGUF
- Variante previa v0.2 (i1 GGUF): https://huggingface.co/mradermacher/Qwen3.8-27B-Human-KO-Enterprise-v0.2-i1-GGUF
- Pagina de resumen de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Human-KO-Enterprise-Boundary-i1-GGUF
- Peticiones y FAQ de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/model_requests
- Dataset EnterpriseOps-Blind-A: https://huggingface.co/datasets/ThakiCloud/EnterpriseOps-Blind-A
- Dataset EnterpriseOps-KO-Policy: https://huggingface.co/datasets/ThakiCloud/EnterpriseOps-KO-Policy
- Guia externa sobre ejecucion local y VRAM (ofox.ai): https://ofox.ai/blog/qwen-3-8-27b-run-locally-vram-gguf-2026/
- Ficha de registro en free2aitools de la variante v0.2: https://free2aitools.com/model/mradermacher/qwen3.8-27b-human-ko-enterprise-v0.2-i1-gguf
- Ficha de registro en free2aitools de la variante v0.2 GGUF estatica: https://free2aitools.com/model/mradermacher/qwen3.8-27b-human-ko-enterprise-v0.2-gguf
- Grafica comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa responsable del hosting de las cuantizaciones: https://www.nethype.de/
