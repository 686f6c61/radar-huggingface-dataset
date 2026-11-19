# mradermacher/Nova-1.1-0.8B-i1-GGUF

## Resumen

Nova-1.1-0.8B-i1-GGUF es la distribucion en formato GGUF, con cuantizaciones ponderadas mediante imatrix, del modelo Nova-1.1-0.8B desarrollado por HardcoreAI. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de versiones GGUF de modelos abiertos. El modelo base es un transformer denso de aproximadamente 1.006 millones de parametros (1,0 B), orientado a tareas de asistente, uso de herramientas (tool-use) y function calling, con instrucciones afinadas y etiquetas que lo vinculan a la familia Qwen3.5.

La relevancia de esta ficha radica en que ofrece un modelo de menos de 1 B de parametros con licencia Apache 2.0, lo que permite desplegarlo en hardware muy modesto (incluso CPU o GPUs de gama baja) para flujos de agentes y llamadas a funciones. El repositorio incluye un abanico amplio de cuantizaciones que van desde IQ1_S (0,5 GB) hasta Q6_K (0,9 GB), lo que facilita ajustar el equilibrio entre calidad y huella de memoria.

No obstante, la model card del cuantizador es escasa en detalles tecnicos: no documenta longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks. Esta ficha refleja unicamente los datos disponibles y marca explicitamente como "no disponible" todo aquello que no consta en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiquetado como qwen3.5 en los tags; detalles no disponibles) |
| Parametros totales | 1.006.672.704 (~1,0 B) |
| Parametros activos | no disponible (no es un modelo MoE segun los datos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas i1/imatrix) |
| Idiomas soportados | ingles (en), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en safetensors esta en HardcoreAI/Nova-1.1-0.8B |
| Tamano del repositorio | 13,9 GB (conjunto de todas las cuantizaciones) |
| Vision | La model card menciona que es un modelo de vision y que los ficheros mmproj, si existen, estarian en el repositorio estatico; no se confirma su presencia |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de aproximadamente 1,0 B de parametros. Los tags del repositorio lo asocian a la familia qwen3.5 y a HyperAI, lo que sugiere una arquitectura derivada de la linea Qwen, aunque la model card no detalla el numero de capas, dimensiones ocultas ni el mecanismo de atencion empleado. Tampoco se especifica si incorpora innovaciones como atencion lineal, decodificacion especulativa o modos de razonamiento extendido.

En cuanto al entrenamiento, la informacion disponible solo indica instruction-tuning y un enfoque orientado a asistente, tool-use y function calling. No consta el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El proceso de cuantizacion realizado por mradermacher emplea pesos ponderados con imatrix (importancia de matriz) para mejorar la calidad de las cuantizaciones de baja precision, y ofrece tanto cuantizaciones estaticas (en el repositorio Nova-1.1-0.8B-GGUF) como dinamicas i1 en este repositorio.

## Capacidades

- Generacion de texto conversacional en ingles y ruso.
- Uso de herramientas y function calling: el modelo esta etiquetado explicitamente para tool-use y function-calling, lo que permite invocar APIs externas mediante esquemas estructurados.
- Orientacion a agentes: los tags incluyen "agent", lo que sugiere soporte para flujos multi-paso, aunque no se documenta el formato exacto de llamada ni el protocolo de herramientas.
- Instruccion-tuning: responde a instrucciones en formato de asistente.
- Posible capacidad de vision: la model card del cuantizador indica que es un modelo de vision y remite a los ficheros mmproj del repositorio estatico, pero no se confirma que dichos ficheros existan ni su contenido.
- Capacidades multilingues limitadas a ingles y ruso; no se declara soporte de castellano.
- No se documentan capacidades de razonamiento extendido (thinking mode), audio ni matemáticas avanzadas.

## Casos de uso

- Agentes de automatizacion de tareas: el modelo puede emplearse como planificador ligero que decide que funcion invocar en cada paso de un flujo multi-paso, gracias a su soporte de function calling y a su reducida huella de memoria, que permite ejecutarlo en el mismo host que el orquestador.
- Enrutamiento de intenciones en asistentes conversacionales: con 1,0 B de parametros y cuantizaciones de 0,5-0,9 GB, puede clasificar la intencion del usuario y derivar la peticion a un modelo mayor o a una API, reduciendo costes en produccion.
- Extraccion estructurada de datos: el modelo puede convertir texto libre en JSON con campos definidos mediante tool calling, util para pipelines de ingestion de documentos en ingles o ruso.
- Chatbot de soporte en ruso e ingles: al ser bilingue declarado, es adecuado para atencion al cliente en mercados de habla rusa o inglesa, siempre que el contexto requerido quepa en la ventana no documentada del modelo.
- Prototipado en hardware de consumo: al caber en cuantizaciones Q4_K_M de 0,8 GB, permite validar flujos de agente en portatiles o mini-PC sin GPU dedicada antes de escalar a modelos mayores.
- Ejecucion en el borde (edge) o en entornos con memoria limitada: su tamano permite desplegarlo en contenedores con poca RAM o en dispositivos con aceleracion NPU, para tareas de clasificacion, resumen corto o generacion de respuestas breves.
- Generacion de borradores en pipelines de CI/CD: puede redactar mensajes de commit, descripciones de pull requests o resumentes de errores en ingles, integrándose como paso previo a la revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,9 GB para las cuantizaciones IQ1_S a Q6_K, mas el overhead del runtime (KV cache y contexto). Con contexto corto, cabe en menos de 1,5 GB de memoria total.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3050, RTX 4060, GTX 1660 o superiores son suficientes. En entornos de servidor, A100 o H100 no son necesarias y estarian infrautilizadas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI requieren los pesos en safetensors del modelo base, no las cuantizaciones GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano, se espera una latencia baja en GPU de consumo, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Nova-1.1-0.8B (este) | ~1,0 B | no disponible | en, ru | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 tokens (segun documentacion publica de Qwen) | multilingue | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (segun documentacion publica de Qwen) | multilingue | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens (segun documentacion publica de Meta) | multilingue | Llama 3.2 Community License | safetensors, GGUF |

La comparativa se limita a parametros, contexto, idiomas y licencia; no se dispone de resultados de benchmarks del modelo Nova que permitan una comparacion de rendimiento. Los datos de contexto de los modelos alternativos provienen de su documentacion publica y no de la informacion proporcionada en esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo bilingue en ingles y ruso, es probable que herede sesgos de sus datos de entrenamiento, pero no se aportan analisis.
- Riesgo de alucinacion: inherente a los modelos de 1 B de parametros; la capacidad de razonamiento y factualidad es limitada y no se han publicado evaluaciones que la cuantifiquen.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada, lo que impide garantizar conversaciones multi-turno largas. El soporte de castellano no esta declarado; solo ingles y ruso.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion, pero conviene verificar la licencia del modelo base HardcoreAI/Nova-1.1-0.8B, ya que la model card del cuantizador la declara como Apache 2.0 sin mas detalle.
- Caveat de vision: la model card menciona que es un modelo de vision, pero no confirma la presencia de ficheros mmproj en el repositorio estatico; no debe asumirse capacidad multimodal sin verificacion.
- Caveat de produccion: las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad; para uso en produccion se recomienda Q4_K_M o superior. Ademas, el formato GGUF no es compatible con vLLM o TGI sin conversion previa.
- Fecha de creacion y actualizacion del repositorio: 9 de septiembre de 2026 y 20 de octubre de 2026, respectivamente; la informacion tecnica puede haber cambiado desde entonces.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/Nova-1.1-0.8B-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Nova-1.1-0.8B-GGUF
- Modelo base: https://huggingface.co/HardcoreAI/Nova-1.1-0.8B
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Nova-1.1-0.8B-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
