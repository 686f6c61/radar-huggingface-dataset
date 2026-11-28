# mradermacher/scuttle-1.7b-GGUF

## Resumen

Scuttle-1.7b es un modelo de lenguaje de 1.728.801.600 parametros (aproximadamente 1,7 mil millones) desarrollado por Multiqueue, publicado originalmente en formato transformers y distribuido en cuantizaciones GGUF por mradermacher. Segun las etiquetas de la model card, el modelo esta orientado a tareas de graph-search, information-retrieval, decision-model y swarm-search, y se presenta como compatible con MCP (Model Context Protocol). La arquitectura declarada en las etiquetas es LFM3, lo que sugiere que deriva de la familia Liquid Foundation Models, aunque la informacion proporcionada no detalla la arquitectura interna.

El modelo esta pensado para flujos de recuperacion de informacion y toma de decisiones dentro de sistemas multiagente o de busqueda en grafo, un nicho distinto al de los modelos generativos de proposito general. Su tamano compacto (1,7B) lo hace desplegable en hardware de consumo, y la disponibilidad de cuantizaciones desde Q2_K (0,9 GB) hasta f16 (3,6 GB) facilita su integracion en entornos con recursos limitados.

La relevancia actual de esta ficha radica en que el modelo base solo esta disponible en ingles, cuenta con una licencia lfm-open-1.0 (marcada como "other" en Hugging Face) y no se han publicado resultados de benchmarks ni especificaciones detalladas de contexto o entrenamiento en la informacion disponible. Es, por tanto, un modelo de nicho que conviene evaluar con cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (segun etiquetas de la model card); detalles internos no disponibles |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | lfm-open-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |

## Arquitectura y entrenamiento

La model card identifica la arquitectura como LFM3, lo que apunta a la familia Liquid Foundation Models de Liquid AI, pero no se proporcionan detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora componentes de tipo SSM o hibridos. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias.

Las etiquetas del modelo (graph-search, information-retrieval, decision-model, swarm-search, mcp) sugieren un entrenamiento o ajuste orientado a tareas de recuperacion y decision dentro de sistemas de agentes, posiblemente con soporte para el protocolo MCP. No obstante, la informacion disponible no permite confirmar innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. El repositorio GGUF es una conversion estatica del modelo base Multiqueue/scuttle-1.7b realizada por mradermacher; no se han generado cuantizaciones ponderadas por imatrix.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Busqueda en grafo (graph-search) y recuperacion de informacion (information-retrieval), segun las etiquetas del modelo.
- Toma de decisiones (decision-model) y busqueda en enjambre (swarm-search), orientadas a sistemas multiagente.
- Compatibilidad declarada con MCP (Model Context Protocol), lo que facilitaria su integracion como servidor o cliente de herramientas.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agentes y razonamiento multi-paso: sugeridas por las etiquetas, pero no documentadas.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Recuperacion de informacion en grafos de conocimiento: el modelo puede usarse para navegar y consultar estructuras de grafo, seleccionando nodos y relaciones relevantes gracias a su orientacion declarada a graph-search.
- Orquestacion de busquedas en enjambre: en pipelines multiagente donde varios agentes exploran fuentes en paralelo, el modelo puede actuar como decision-model para consolidar resultados y elegir la siguiente accion.
- Integracion con servidores MCP: al declarar compatibilidad con MCP, puede desplegarse como componente de un ecosistema de herramientas conectadas, gestionando llamadas y respuestas dentro de un flujo de agente.
- Clasificacion y enrutamiento de consultas: su tamano de 1,7B permite ejecutarlo en CPU o GPU de consumo para decidir que fuente o herramienta debe atender una consulta entrante en un sistema RAG.
- Prototipado rapido en entornos con recursos limitados: las cuantizaciones Q4_K_M (1,2 GB) y Q5_K_M (1,4 GB) permiten ejecutar el modelo en portatiles y estaciones de trabajo sin GPU dedicada mediante llama.cpp u Ollama.
- Filtrado y reordenacion de documentos recuperados: puede emplearse como re-ranker o filtro en pipelines de recuperacion, evaluando la relevancia de fragmentos antes de pasarlos a un modelo mayor.
- Evaluacion de decisiones en agentes autonomos: como decision-model de bajo coste, puede seleccionar entre acciones candidatas en bucles de planificacion acotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB con Q2_K, 1,2 GB con Q4_K_M, 1,4 GB con Q5_K_M, 1,9 GB con Q8_0 y 3,6 GB con f16 (tamanos de archivo GGUF; la VRAM real depende del contexto y del runtime).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes con holgura.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF; el modelo base en safetensors puede servirse con transformers, vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| scuttle-1.7b | 1,73B | no disponible | en | lfm-open-1.0 | GGUF, safetensors |
| Qwen2.5-1.5B | 1,54B | 32.768 tokens (segun documentacion publica de Qwen) | multilingue | Apache 2.0 | safetensors, GGUF |
| SmolLM2-1.7B | 1,71B | 8.192 tokens (segun documentacion publica de Hugging Face) | en (principalmente) | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 1B | 1,24B | 128.000 tokens (segun documentacion publica de Meta) | multilingue | Llama 3.2 Community License | safetensors, GGUF |

La comparativa se limita a parametros, contexto, idiomas y licencia, ya que no hay benchmarks publicados de scuttle-1.7b. Los datos de los modelos alternativos provienen de su documentacion publica y no de la informacion proporcionada en esta ficha; conviene verificarlos en sus respectivas model cards.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; no se documentan capacidades multilingues.
- No se han publicado benchmarks, por lo que su rendimiento real en tareas de recuperacion o decision es desconocido.
- La licencia lfm-open-1.0 esta etiquetada como "other"; es imprescindible revisar el archivo LICENSE del modelo base antes de cualquier uso comercial.
- Riesgo de alucinacion inherente a los modelos de 1,7B, especialmente en tareas de recuperacion donde puede inventar referencias o relaciones inexistentes en el grafo.
- No se detalla la longitud de contexto, lo que impide planificar su uso en conversaciones o documentos largos.
- Las capacidades de tool calling y de agente no estan confirmadas en la documentacion; las etiquetas sugieren soporte, pero no hay ejemplos ni especificaciones.
- El repositorio GGUF no incluye cuantizaciones ponderadas por imatrix, lo que puede reducir la calidad en las cuantizaciones mas agresivas (Q2_K, Q3_K_S).
- No se dispone de informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/scuttle-1.7b-GGUF
- Modelo base: https://huggingface.co/Multiqueue/scuttle-1.7b
- Pagina de descargas de mradermacher para este modelo: https://hf.tst.eu/model#scuttle-1.7b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Web de nethype GmbH: https://www.nethype.de/
