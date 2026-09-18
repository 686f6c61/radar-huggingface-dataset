# bcckfdn/minillama-test-GGUF

## Resumen

minillama-test-GGUF es la version cuantizada en formato GGUF de un modelo de lenguaje de tipo transformer, publicado por el usuario bcckfdn y entrenado desde cero con arquitectura Llama/SmolLM2. El repositorio contiene unicamente los pesos convertidos para su uso con llama.cpp, Ollama y LM Studio, e incluye cuatro variantes de cuantizacion (BF16, Q8_0, Q5_K_M y Q4_K_M). El modelo base declarado es bcckfdn/minillama-test y la model card interna lo identifica como "smollm2-135m-tr-v1".

El dato mas relevante es la discrepancia entre el nombre del modelo y su tamano real: los pesos en safetensors suman 30.091.680 parametros (unos 30 M), no 135 M como sugiere la nomenclatura de los archivos. La model card indica 18 capas y dimension oculta 288, coherente con el recuento de parametros y con el tamano de los ficheros GGUF (59 MB en BF16, 27 MB en Q4_K_M). Se trata, por tanto, de un modelo extremadamente pequeno.

El modelo esta orientado a generacion de texto conversacional con soporte declarado de turco e ingles, licencia Apache 2.0 y un coste de ejecucion practicamente nulo. Su interes es fundamentalmente practico: sirve como banco de pruebas para pipelines de llama.cpp y como punto de partida para "fine-tuning" en entornos sin GPU, mas que como modelo de proposito general. El repositorio no registra descargas ni "likes", y la busqueda web no ha devuelto informacion tecnica adicional sobre el.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de tipo Llama (familia SmolLM2); 18 capas, dimension oculta 288 |
| Parametros totales | 30.091.680 (aproximadamente 30 M), segun los pesos en safetensors |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (59 MB), Q8_0 (32 MB), Q5_K_M (28 MB), Q4_K_M (27 MB) |
| Idiomas soportados | Turco (tr) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp); el repositorio base usa safetensors |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | text-generation (etiqueta adicional: conversational) |
| Modelo base | bcckfdn/minillama-test |

Nota: la model card nombra los ficheros como "smollm2-135m-tr-v1", pero el recuento real de parametros (30 M) y el tamano de los GGUF no corresponden a un modelo de 135 M. Se recomienda verificar el dato antes de asumir un tamano concreto.

## Arquitectura y entrenamiento

La informacion disponible describe un transformer causal con arquitectura Llama (mencionada en las etiquetas como SmolLM2), con 18 capas y una dimension oculta de 288. No se especifica el numero de cabezas de atencion, la dimension del feed-forward, el tipo de normalizacion, si se usa RoPE y con que parametros, ni si se aplico atencion agrupada por consultas (GQA). Tampoco se indica la longitud de contexto con la que fue entrenado, un dato critico para decidir su uso en produccion.

El unico dato de entrenamiento aportado es el volumen de tokens: 1.245 B (1,245 billones), con entrenamiento desde cero ("sıfırdan eğitilmiş"). No hay informacion sobre la composicion del dataset, la mezcla de idiomas turco/ingles, si hubo fases de ajuste supervisado, RLHF o DPO, ni sobre tecnicas de optimizacion del preentrenamiento. Tampoco se documenta ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, destilacion u otras). La etiqueta "conversational" sugiere cierto ajuste para dialogo, pero no se detalla su alcance.

## Capacidades

- Generacion de texto autoregresiva en turco e ingles, con enfasis declarado en registro conversacional.
- Conversacion multi-turno basica mediante el modo `-cnv` de llama.cpp y plantillas de chat compatibles con Ollama y LM Studio.
- Generacion de texto con restricciones de memoria extremas: puede ejecutarse en CPU y en dispositivos con muy poca RAM.
- Capacidad limitada de continuacion de texto y autocompletado, util para tareas de formateo o plantillas simples.
- No se documenta soporte de "tool calling" ni de "function calling".
- No se documenta soporte de agentes, razonamiento multi-paso ni modos de "thinking".
- No se documenta vision, audio, ni capacidades multimodales.
- No se documenta una ventana de contexto concreta, por lo que no puede garantizarse el manejo de entradas largas.

## Casos de uso

- Prototipado de pipelines con llama.cpp: permite validar la integracion de un GGUF, las plantillas de chat y el flujo de inferencia en local antes de sustituir el modelo por uno mayor, con un coste de descarga y ejecucion minimo (27 MB en Q4_K_M).
- Inferencia en dispositivos embebidos o de gama baja: al ocupar unas decenas de megabytes, puede desplegarse en Raspberry Pi, routers o moviles sin GPU, aunque la calidad de las respuestas sera muy limitada y no apta para tareas criticas.
- Punto de partida para "fine-tuning" experimental: su tamano permite reentrenar o ajustar los pesos completos en una unica GPU de consumo o incluso en CPU, util para experimentar con tecnicas de ajuste en turco.
- Generacion de texto auxiliar en turco: redaccion de plantillas, variaciones de frases cortas o textos de relleno en un contexto donde no se requiera precision factual.
- Clasificacion y etiquetado ligero mediante "prompting": al ser pequeno y rapido, puede usarse como primer filtro heurístico (por ejemplo, deteccion de idioma o de intencion simple) dentro de un sistema mayor, dejando la decision final a un modelo mas grande.
- Docencia y divulgacion: sirve para explicar el funcionamiento de un transformer y del formato GGUF en talleres, ya que el modelo se ejecuta en cualquier portatil y su tamano hace viable inspeccionar pesos y capas.
- Pruebas de regresion de infraestructura: sirve para comprobar el comportamiento de servidores de inferencia (por ejemplo, un endpoint compatible con la API de OpenAI) sin consumir recursos de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card ni la busqueda web proporcionan valores de MMLU, HumanEval, GSM8K, HellaSwag, perplexity ni de ninguna otra evaluacion. La busqueda web realizada no devolvio resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones. En BF16, aproximadamente 60 MB de pesos mas el estado de la cache KV; en Q4_K_M, unos 27 MB mas la cache.
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM es suficiente (GTX 1050, GTX 1650, RTX 3050, integradas modernas). No se requiere A100, H100 ni hardware de centro de datos.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en iGPU y CPU exclusivamente.
- RAM necesaria en CPU: del orden de 100-300 MB para el modelo y el runtime de llama.cpp, dependiendo del contexto configurado.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (mediante `Modelfile`), LM Studio y cualquier runtime compatible con GGUF. Las etiquetas del repositorio incluyen `endpoints_compatible`, lo que sugiere compatibilidad con la API de inferencia de Hugging Face.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, es esperable una latencia muy baja en CPU moderna, pero no se ha publicado ninguna medicion.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de sus model cards publicas; los de este modelo, del repositorio analizado. No hay benchmarks disponibles para ninguna de las opciones en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formatos | Idiomas |
|---|---|---|---|---|---|
| bcckfdn/minillama-test-GGUF | 30 M (etiquetado como 135 M) | no disponible | Apache 2.0 | GGUF, safetensors | tr, en |
| SmolLM2-135M (HuggingFaceTB) | 135 M | 8192 tokens | Apache 2.0 | safetensors, GGUF | principalmente en |
| TinyLlama-1.1B (TinyLlama) | 1,1 B | 2048 tokens | Apache 2.0 | safetensors, GGUF | en |
| Qwen2.5-0.5B (Alibaba) | 0,49 B | 32 768 tokens | Apache 2.0 | safetensors, GGUF | multilingue (incluye en, zh) |

El modelo analizado es entre 4 y 36 veces mas pequeno que las alternativas listadas, y su nicho es el turco, un idioma poco cubierto en modelos de este tamano. Ninguna de las alternativas ofrece garantias de calidad en turco comparable a un modelo entrenado especificamente para ese idioma, aunque tampoco hay datos que permitan afirmarlo en el caso de minillama-test.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: los ficheros se llaman "smollm2-135m" pero el modelo tiene unos 30 M de parametros. Esto puede inducir a error al planificar recursos o al comparar con SmolLM2-135M, que es un modelo distinto y de mayor tamano.
- Riesgo de alucinacion muy elevado: con 30 M de parametros y 1,245 B tokens de entrenamiento, la capacidad de retener hechos es minima. No debe usarse para responder preguntas factuales sin verificacion externa.
- Contexto desconocido: no se documenta la longitud de contexto, por lo que no hay garantia de comportamiento correcto en entradas largas ni de como se trunca la informacion.
- Cobertura idiomatica limitada: solo se declaran turco e ingles. El rendimiento en castellano no esta soportado ni evaluado.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada, por lo que no es posible estimar su calidad relativa frente a otros modelos de la misma categoria.
- Sin datos sobre sesgos: no se documenta la composicion del dataset de entrenamiento, por lo que no se pueden caracterizar sesgos de genero, etnia, religion o ideologia.
- Sin informacion sobre ajuste conversacional: la etiqueta "conversational" no viene acompanada de detalle sobre el formato de prompt recomendado; usar una plantilla incorrecta degradara notablemente la salida.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia, sin clausulas de uso aceptable adicionales en el repositorio. Conviene verificar que el modelo base bcckfdn/minillama-test mantiene la misma licencia.
- Estado del repositorio: cero descargas y cero "likes" en el momento de la consulta, sin senales de mantenimiento ni de validacion por parte de la comunidad.
- Advertencia para produccion: no se recomienda su uso en aplicaciones de cara al usuario sin un modelo mayor de respaldo o un filtro posterior que valide las salidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bcckfdn/minillama-test-GGUF
- Modelo base: https://huggingface.co/bcckfdn/minillama-test
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- SmolLM2 (referencia de la familia de arquitectura): https://huggingface.co/HuggingFaceTB/SmolLM2-135M

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo, su entrenamiento o sus benchmarks; los unicos resultados obtenidos fueron recetas de cocina sin relacion con el tema.
