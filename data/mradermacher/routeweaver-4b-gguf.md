# mradermacher/RouteWeaver-4B-GGUF

# RouteWeaver-4B-GGUF (mradermacher)

## Resumen

RouteWeaver-4B-GGUF es un repositorio de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo e2rea1/RouteWeaver-4B. El modelo original cuenta con 4.411.424.256 parametros (unos 4,41 mil millones) y esta etiquetado con los tags `llm-routing`, `reinforcement-learning`, `agent` y `verl`, lo que indica que se trata de un modelo afinado mediante aprendizaje por refuerzo (con el framework verl) orientado al enrutado de peticiones entre distintos LLM dentro de flujos de agentes. La licencia declarada es Apache-2.0 y el unico idioma soportado segun la model card es el ingles.

El problema que aborda es el de la seleccion de modelo en arquitecturas multi-LLM: en lugar de enviar cada consulta a un unico modelo grande, un "router" decide a que modelo (o a que herramienta) derivar cada peticion, reduciendo coste y latencia. Un router de 4B cuantizado a 4 bits ocupa apenas 2,8 GB, por lo que puede ejecutarse en la misma maquina o en el mismo nodo que los modelos a los que enruta, sin depender de una API externa.

Es importante senalar que este repositorio no incluye la model card del modelo base ni documentacion tecnica propia: unicamente contiene los ficheros GGUF y la tabla de cuantizaciones. Por tanto, la arquitectura exacta, la longitud de contexto, la composicion del dataset de entrenamiento y los resultados de evaluacion no estan disponibles en la informacion consultada. La relevancia actual del artefacto es practica: pone un modelo de enrutado con licencia permisiva al alcance de despliegues locales mediante llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no documenta la arquitectura; los tags indican transformer afinado con RL, sin confirmacion oficial) |
| Parametros totales | 4.411.424.256 (4,41 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); los pesos originales del modelo base estan en safetensors, pero no se incluyen en este repositorio |

Datos adicionales del repositorio: 213 descargas, 0 likes, tamano total del repo 39,7 GB (suma de todos los ficheros GGUF), libreria declarada `transformers`, pipeline `reinforcement-learning`, `endpoints_compatible`. Modelo base: e2rea1/RouteWeaver-4B.

## Arquitectura y entrenamiento

No hay informacion publicada en este repositorio sobre la arquitectura interna del modelo base. Los unicos indicios son los tags asociados: `llm-routing` (enrutado de peticiones entre LLM), `reinforcement-learning`, `agent` y `verl`. El framework verl es una libreria de RL para modelos de lenguaje, lo que sugiere un entrenamiento con optimizacion por refuerzo sobre una politica base (probablemente un modelo preentrenado de ~4B, cuya identidad no se declara) orientada a una tarea de decision o enrutado. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de SFT, RLHF o DPO previas.

El unico trabajo tecnico verificable en este repositorio es el de cuantizacion: mradermacher ha generado 12 variantes estaticas (incluidas las de la familia K-quant y una IQ) mediante el pipeline habitual de llama.cpp. El autor indica que no ha publicado cuantizaciones ponderadas con imatrix ("weighted/imatrix quants seem not to be available (by me) at this time") y que pueden solicitarse mediante una discusion comunitaria. Tambien senala que el fichero f16 esta a 16 bits por peso y lo califica de "overkill".

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational` y la model card declara compatibilidad con endpoints, por lo que se espera uso en formato chat.
- Enrutado de peticiones entre modelos (`llm-routing`): funcion principal inferida del nombre y de los tags; el modelo parece disenado para decidir a que modelo o ruta derivar una consulta.
- Uso como componente de agentes: el tag `agent` sugiere integracion en bucles de decision multi-paso.
- Aprendizaje por refuerzo como metodo de ajuste (tag `reinforcement-learning`, framework `verl`).
- Multilingue: no. La model card declara exclusivamente `en`.
- Tool calling / function calling: no documentado; no disponible.
- Vision, audio o modalidades adicionales: no disponible.
- Modo "thinking" o razonamiento explicito: no disponible.
- Capacidades exactas de razonamiento, codigo o matematicas: no disponibles (no hay benchmarks ni documentacion).

## Casos de uso

- Enrutado de consultas en una plataforma multi-LLM: el modelo actua como clasificador de primer nivel que decide si una peticion debe ir a un modelo grande, a uno pequeno o a una herramienta concreta. Con Q4_K_M ocupa 2,8 GB, por lo que convive con el resto del stack en la misma GPU.
- Orquestacion de agentes con presupuesto limitado: al ser un componente ligero, puede insertarse en cada paso de un bucle de agente para decidir la siguiente accion sin anadir latencia de red ni coste por token de API.
- Despliegue en el borde o en portatil: la variante Q2_K (1,9 GB) permite ejecutar el enrutador en equipos sin GPU dedicada, usando llama.cpp sobre CPU.
- Preprocesado de colas de soporte tecnico: clasificar y derivar tickets entrantes hacia el modelo o el equipo humano adecuado antes de invocar modelos mayores.
- Seleccion de herramienta en pipelines de automatizacion: decidir entre busqueda web, ejecucion de codigo o recuperacion documental en funcion de la consulta del usuario.
- Enrutado en cascada para control de coste: enviar primero a un modelo pequeno y derivar al grande unicamente cuando el router lo determine, reduciendo el gasto medio por consulta.
- Experimentacion e investigacion en RL aplicado a enrutado: al estar bajo Apache-2.0 y en GGUF, sirve como punto de partida reproducible para comparar politicas de enrutado.
- Servicio local de asistente conversacional en ingles: variante Q8_0 (4,8 GB) para respuestas de mayor calidad en un equipo de sobremesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio de cuantizaciones ni los metadatos de HuggingFace incluyen puntuaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de tareas especificas de enrutado (por ejemplo, precision de seleccion de modelo). Tampoco se dispone de comparaciones frente a otros routers.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin tener en cuenta el KV cache): Q2_K 1,9 GB; Q3_K_S 2,2 GB; Q3_K_M 2,3 GB; Q3_K_L 2,5 GB; IQ4_XS 2,6 GB; Q4_K_S 2,7 GB; Q4_K_M 2,8 GB; Q5_K_S 3,2 GB; Q5_K_M 3,3 GB; Q6_K 3,7 GB; Q8_0 4,8 GB; f16 8,9 GB.
- GPU consumer: si cabe con holgura. Q4_K_M entra en GPUs de 6 GB (RTX 3060, GTX 1660 Super, RTX 2060) dejando margen para contexto moderado. Q8_0 requiere 8 GB o mas (RTX 3060 Ti, RTX 2070, RTX 4060). La variante f16 necesita aproximadamente 10-11 GB, por lo que queda fuera de la mayoria de GPUs de gama media.
- GPU de datacenter: A100, H100, L40S o A10 sobradas para cualquier cuantizacion; el modelo no requiere tensor parallelism ni sharding.
- CPU: las variantes Q2_K a Q4_K_M son viables en CPU con llama.cpp; el rendimiento dependera del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, Jan, llama-cpp-python y text-generation-webui a traves del backend GGUF. El soporte de GGUF en vLLM es limitado y no esta documentado para este modelo; TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no disponible. No hay cifras publicadas por el autor.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de RouteWeaver-4B, por lo que la comparacion se limita a caracteristicas objetivas de modelos de ~4B habitualmente usados como componentes ligeros o routers, segun sus respectivas model cards publicas. Los datos de la fila de RouteWeaver-4B corresponden al repositorio analizado; los del resto son datos publicos de sus fabricantes y pueden estar sujetos a cambios.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato |
|---|---|---|---|---|---|
| RouteWeaver-4B (base) | 4,41 B | no disponible | Apache-2.0 | en | safetensors (original), GGUF (esta repo) |
| Qwen3-4B | ~4,0 B | 32.768 tokens nativos, ampliable con YaRN | Apache-2.0 | multilingue | safetensors, GGUF |
| Llama 3.2 3B | 3,2 B | 128.000 tokens | Llama 3.2 Community License | multilingue | safetensors, GGUF |
| Gemma 3 4B | ~4 B | 128.000 tokens | Gemma Terms of Use | multilingue | safetensors, GGUF |
| Phi-4-mini | 3,8 B | 128.000 tokens | MIT | multilingue | safetensors, GGUF |

La diferencia funcional clave no es de tamano sino de proposito: los modelos de la tabla son asistentes generalistas, mientras que RouteWeaver-4B se presenta como un modelo especializado en enrutado. No hay datos que permitan afirmar cual de ellos es mejor en esa tarea concreta.

## Limitaciones y advertencias

- Documentacion insuficiente: el repositorio solo contiene ficheros GGUF y una tabla de cuantizaciones. No hay model card del modelo base, ni paper, ni datos de entrenamiento, ni evaluacion. Cualquier uso en produccion exige una validacion propia previa.
- Contexto desconocido: al no declararse la longitud de contexto, no se puede planificar el consumo de KV cache ni garantizar el comportamiento en conversaciones largas.
- Idioma: la model card declara unicamente ingles. El comportamiento en castellano no esta documentado y no deberia asumirse.
- Riesgo de alucinacion: no evaluado. En tareas de enrutado, un error de clasificacion implica derivar la peticion al modelo equivocado, lo que puede degradar la respuesta final de forma poco visible.
- Sesgos: no se han publicado analisis de sesgo ni la composicion del dataset de entrenamiento, por lo que no es posible estimar sesgos sistematicos en las decisiones de enrutado.
- Sobreajuste a la distribucion de entrenamiento: un router entrenado con RL tiende a degradarse si el trafico real difiere del observado durante el entrenamiento (nuevos idiomas, nuevos dominios, nuevos modelos destino). Requiere monitorizacion y reentrenamiento.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero la licencia se hereda del modelo base y conviene verificar el repositorio original e2rea1/RouteWeaver-4B por si existiesen condiciones adicionales no reflejadas aqui.
- Naturaleza del repositorio: los ficheros son cuantizaciones estaticas. El autor no ha publicado variantes ponderadas con imatrix, que suelen ofrecer mejor relacion calidad/tamano en cuantizaciones bajas (Q2_K, Q3_K_S).
- Rendimiento en cuantizaciones agresivas: Q2_K y Q3_K_S reducen notablemente la calidad respecto a Q4_K_M o superiores; en un modelo de decision, un pequeno deterioro puede traducirse en mas errores de enrutado.
- Ficheros multiparte: si se descargan variantes grandes, hay que seguir las instrucciones habituales de concatenacion de GGUF descritas en los README de referencia citados por el autor.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/RouteWeaver-4B-GGUF
- Modelo base: https://huggingface.co/e2rea1/RouteWeaver-4B
- Pagina de resumen y lista de descargas del autor: https://hf.tst.eu/model#RouteWeaver-4B-GGUF
- Solicitudes de cuantizacion y preguntas frecuentes de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Framework verl (referencia del tag de entrenamiento): no se ha encontrado enlace en la informacion proporcionada
- Paper, blog o demo del modelo: no disponible

Nota sobre la busqueda web: las consultas realizadas devolvieron unicamente paginas de inicio de buscadores, sin resultados utiles sobre el modelo. No se han localizado papers, blogs tecnicos ni demos adicionales que aporten informacion sobre RouteWeaver-4B.
