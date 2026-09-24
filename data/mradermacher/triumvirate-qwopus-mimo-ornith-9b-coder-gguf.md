# mradermacher/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-GGUF

## Resumen

Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-GGUF es la version cuantizada en formato GGUF del modelo pragmaticcs/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder, publicada por el usuario mradermacher, conocido en el ecosistema por generar cuantizaciones listas para usar con llama.cpp y derivados. El modelo original procede de una fusion (merge) de pesos, segun los tags declarados mediante las tecnicas TIES y DELLA, y se apoya en la arquitectura identificada como qwen3_5_text, con rasgos de DeltaNet y atencion lineal. Cuenta con 8.953.803.264 parametros (aproximadamente 9B) y esta etiquetado para tareas de codigo, razonamiento y uso agentico, con referencias explicitas a SWE-bench.

La relevancia de esta publicacion es practica: el repositorio ofrece una bateria completa de cuantizaciones estaticas (desde Q2_K hasta f16) que permiten ejecutar un modelo de ~9B en hardware de consumo, algo imposible con los pesos originales en precision completa. El modelo es bilingue ingles-chino, con licencia Apache 2.0, lo que facilita su adopcion en entornos comerciales sin las restricciones habituales de otras licencias de pesos abiertos.

No obstante, el nivel de documentacion disponible es minimo: la model card del cuantizador se limita a enumerar los ficheros generados y a remitir a la guia de uso de GGUF. No se publican datos de contexto, composicion del dataset de entrenamiento, proceso de alineacion ni resultados de benchmarks, por lo que buena parte de las especificaciones tecnicas quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (transformer causal con componentes DeltaNet y atencion lineal, segun tags) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas; el modelo base esta en safetensors) |
| Tipo de modelo | merge (TIES, DELLA) sobre base Qwen3.5 |
| Tamano del repositorio | 81,4 GB |
| Modelo base | pragmaticcs/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder |
| Libreria declarada | transformers |
| Fecha de publicacion | 24 de septiembre de 2026 (creacion); actualizado el mismo dia |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusion de pesos, no de un entrenamiento desde cero. Los tags del repositorio indican el uso combinado de TIES (Trim, Elect Sign and Merge) y DELLA (una variante de seleccion y descarte de parametros durante el merge), tecnicas habituales para combinar varios checkpoints ajustados sin necesidad de reentrenar. El campo model_type apunta a qwen3_5_text, lo que situa la familia base en el linaje Qwen 3.5, e incluye referencias a DeltaNet y atencion lineal, mecanismos orientados a reducir el coste computacional de la ventana de contexto frente a la atencion completa tradicional.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el proceso de alineacion (RLHF, DPO u otros) ni las innovaciones especificas introducidas por los autores originales del merge. Los tags sugieren un enfoque orientado a codigo, razonamiento y flujos agenticos (agentic, code, reasoning, swe-bench), pero se trata de etiquetas declarativas y no de resultados verificables en la documentacion proporcionada.

## Capacidades

- Generacion de texto conversacional, con pipeline etiquetado como conversational.
- Generacion y asistencia en codigo, segun los tags code y swe-bench.
- Razonamiento multi-paso y tareas de tipo agentico (tags agentic y reasoning).
- Soporte bilingue limitado a ingles y chino.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que indica que puede servirse en infraestructuras compatibles con la API de inferencia estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de programacion en local: con las cuantizaciones Q4_K_M o Q5_K_M (5,7 GB y 6,6 GB respectivamente) el modelo puede ejecutarse en un portatil con GPU de gama media o incluso en CPU, sirviendo como autocompletado y refactorizacion de codigo sin enviar el codigo a servicios externos.
- Agentes de resolucion de incidencias sobre repositorios: los tags de SWE-bench y agentic apuntan a un uso en pipelines que leen issues, localizan ficheros relevantes y proponen parches; requeriria verificacion posterior de contexto y de soporte real de tool calling, no confirmado en la documentacion.
- Generacion de codigo en integracion continua: desplegado con llama.cpp o servidores compatibles, puede actuar como revisor automatico de pull requests o generador de tests unitarios dentro de un runner de CI/CD.
- Chat de soporte tecnico bilingue: al cubrir ingles y chino, encaja en equipos que atienden consultas tecnicas en ambos idiomas, aunque no hay datos sobre calidad multilingual mas alla de esos dos idiomas.
- Procesamiento de documentacion tecnica y codigo en pipelines offline: al ser GGUF y ejecutable en CPU, permite indexar y resumir repositorios o manuales en entornos sin conectividad ni GPU.
- Prototipado rapido de productos conversacionales: la disponibilidad de cuantizaciones desde Q2_K (3,9 GB) permite levantar un prototipo funcional en hardware modesto antes de decidir si escalar a un modelo mayor.
- Investigacion sobre tecnicas de merge: el modelo es un caso de estudio util para analizar como se comportan TIES y DELLA al combinar checkpoints de la familia Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los tags mencionan SWE-bench, pero no se aporta ninguna puntuacion ni comparacion numerica. No se deben asumir cifras de MMLU, HumanEval, GSM8K u otros conjuntos sin datos verificables.

## Requisitos de hardware

Las cifras de VRAM son estimaciones a partir del tamano de fichero declarado por el cuantizador, asumiendo que el modelo completo debe caber en memoria.

- Q2_K (3,9 GB): ejecutable en CPU con 8 GB de RAM; en GPU cabe en tarjetas de 6 GB, con perdida de calidad apreciable.
- Q3_K_M / Q3_K_L (4,7-5,0 GB): viable en GPU de 8 GB, por ejemplo RTX 3060 Ti o RTX 4060.
- IQ4_XS / Q4_K_S / Q4_K_M (5,3-5,7 GB): opcion recomendada por el autor para velocidad; cabe en GPU de 8 GB y en Apple Silicon con memoria unificada de 16 GB.
- Q5_K_M (6,6 GB): requiere GPU de 8-12 GB; en 8 GB conviene reducir el contexto.
- Q6_K (7,5 GB): necesita 10-12 GB de VRAM, por ejemplo RTX 3080 de 12 GB o RTX 4070 Ti.
- Q8_0 (9,6 GB): GPU de 12-16 GB, como RTX 4080 o RTX 4090.
- f16 (18,0 GB): GPU de 24 GB (RTX 3090, RTX 4090, A100 40 GB) o varias GPU.
- GPU de datacenter (A100, H100): sobredimensionadas para este tamano, utiles solo si se sirven muchas replicas concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores con soporte GGUF (por ejemplo llama-cpp-python) y, para los pesos originales en safetensors, vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependeran del cuantizador elegido, el hardware y la longitud de contexto.

## Comparativa con modelos similares

No se proporciona informacion sobre modelos comparables en la documentacion disponible. La unica comparacion posible con los datos aportados es frente al modelo base sin cuantizar.

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-GGUF | ~9B (8.953.803.264) | GGUF (11 cuantizaciones) | no disponible | Apache 2.0 | Cuantizado por mradermacher; ejecutable en hardware de consumo |
| Triumvirate-Qwopus-MiMo-Ornith-9B-Coder (base) | ~9B (8.953.803.264) | safetensors | no disponible | Apache 2.0 | Pesos originales del merge; requiere mas VRAM y stack transformers |

No se dispone de datos de benchmarks ni de especificaciones de contexto para contrastar con alternativas de la misma categoria (por ejemplo, otros modelos de ~9B orientados a codigo), por lo que la comparativa con terceros queda como no disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia numerica de calidad en codigo, razonamiento o tareas agenticas mas alla de los tags declarativos.
- Origen por merge: las fusiones de pesos pueden heredar comportamientos inconsistentes o degradar capacidades especificas de los modelos originales, y no existe documentacion sobre el proceso de validacion.
- Sesgos conocidos: no disponible. No se documenta la composicion del dataset ni el proceso de alineacion, por lo que no se pueden evaluar sesgos de genero, raza, idioma o dominio.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no se aporta ningun dato especifico de mitigacion.
- Idiomas: solo ingles y chino declarados. El castellano no figura entre los idiomas soportados, por lo que su rendimiento en espanol es incierto y no esta validado.
- Longitud de contexto desconocida: impide planificar usos con documentos largos o conversaciones extensas.
- Cuantizaciones de baja precision: Q2_K y Q3_K_M pueden degradar notablemente la coherencia y la calidad del codigo generado; el autor recomienda Q4_K_S y Q4_K_M para un equilibrio entre velocidad y calidad.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y la atribucion correspondiente. No se identifican clausulas adicionales, pero conviene verificar la licencia del modelo base por si difiere.
- Soporte de tool calling y de agentes no confirmado: aunque los tags mencionan agentic, no hay documentacion tecnica que detalle el formato de llamadas a herramientas ni plantillas de chat especificas.
- Actividad nula en el repositorio (0 descargas y 0 likes en el momento del analisis) y ausencia de comunidad, lo que reduce el soporte disponible ante problemas de ejecucion.
- La fecha de creacion registrada (septiembre de 2026) resulta llamativa y podria deberse a metadatos incorrectos; conviene contrastarla antes de citarla.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-GGUF
- Modelo base: https://huggingface.co/pragmaticcs/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
