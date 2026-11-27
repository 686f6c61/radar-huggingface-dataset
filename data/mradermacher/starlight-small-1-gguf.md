# mradermacher/starlight-small-1-GGUF

## Resumen

starlight-small-1 es un modelo de generacion de texto de tipo transformer con 752.393.024 parametros (aproximadamente 0,75 mil millones), desarrollado por North-ML1 y distribuido bajo licencia Apache 2.0. El repositorio que nos ocupa, mradermacher/starlight-small-1-GGUF, no contiene los pesos originales, sino las cuantizaciones estaticas en formato GGUF del modelo base North-ML1/starlight-small-1, generadas por mradermacher con su herramienta habitual de conversion desde safetensors.

El modelo esta etiquetado como conversacional y de generacion de texto, con soporte declarado unicamente para el idioma ingles. Su tamano compacto (menos de mil millones de parametros) lo situa en la categoria de modelos pequenos aptos para inferencia en CPU o en GPUs de consumo, y su publicacion en GGUF facilita su despliegue con llama.cpp, Ollama y otros runners compatibles.

La relevancia de esta ficha radica en que el repositorio GGUF es la via practica de acceso al modelo para la mayoria de desarrolladores: el repo pesa 7,5 GB en total por acumulacion de cuantizaciones, pero cada fichero individual ocupa entre 0,5 GB (Q2_K) y 1,6 GB (f16), lo que permite ejecutarlo en hardware modesto. La informacion publica disponible sobre el modelo base es escasa, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle interno no disponible) |
| Parametros totales | 752.393.024 (segun safetensors del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion publica detallada sobre la arquitectura interna del modelo base North-ML1/starlight-small-1. Por el numero de parametros (752 millones) y la etiqueta de pipeline text-generation con transformers, se trata de un transformer decoder-only de escala pequena, pero no se han publicado datos sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni vocabulario.

Tampoco hay informacion disponible sobre el corpus de entrenamiento (numero de tokens, composicion del dataset), sobre si se aplicaron tecnicas de alineacion como RLHF o DPO, ni sobre innovaciones tecnicas especificas. El repositorio GGUF documenta exclusivamente el proceso de cuantizacion estatica: se generaron 12 variantes con la herramienta de mradermacher, y el autor indica que las cuantizaciones ponderadas con imatrix no estan disponibles y probablemente no se planifiquen salvo peticion explicita en la seccion de discusiones de la comunidad.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como conversacional y de text-generation, orientado a dialogos de un solo turno o multi-turno.
- Generacion de texto general en ingles: el unico idioma declarado en la model card es el ingles.
- Razonamiento y codigo: no hay informacion publicada que confirme capacidades especificas de razonamiento, matematicas o generacion de codigo.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado rapido de chatbots en local: con cuantizaciones de 0,5 a 0,7 GB, el modelo se puede cargar en un portatil sin GPU dedicada mediante llama.cpp u Ollama, lo que permite validar flujos conversacionales antes de escalar a modelos mayores.
- Generacion de texto en aplicaciones de escritorio: al ser un modelo de menos de mil millones de parametros, puede embeberse en herramientas de escritorio que necesiten completar texto o mantener conversaciones simples sin conexion a la nube.
- Filtrado y clasificacion de texto en pipelines: su tamano permite ejecutarlo en CPU junto a otros procesos, por ejemplo para resumir o reescribir fragmentos en ingles dentro de un ETL de datos.
- Educacion e investigacion: sirve como modelo de referencia para estudiar el efecto de las distintas cuantizaciones GGUF (Q2_K frente a Q8_0) sobre la calidad de salida en un modelo pequeno.
- Despliegue en entornos con recursos limitados: en contenedores con poca memoria o en dispositivos edge donde no cabe un modelo de 7B o superior, la variante Q4_K_M ofrece un equilibrio razonable entre tamano y calidad.
- Generacion de respuestas en ingles para asistentes de documentacion: integrado en un pipeline RAG sencillo, puede redactar respuestas a partir de fragmentos recuperados, siempre que el caso de uso tolere la calidad de un modelo de 0,75B.
- Pruebas de integracion de infraestructura de inferencia: util para validar configuraciones de vLLM, llama.cpp o TGI con un modelo ligero antes de desplegar modelos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los metadatos del modelo base incluyen puntuaciones de MMLU, HumanEval, GSM8K u otras evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 y 1 GB para las cuantizaciones Q2_K a Q8_0, y aproximadamente 1,6 GB para f16 (mas overhead del runtime).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ejecuta el modelo con holgura. En A100 o H100 el modelo queda sobredimensionado en cuanto a memoria, aunque puede usarse para servir muchas instancias en paralelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos anos, e incluso en iGPU con memoria compartida suficiente.
- Cabe en CPU: si, con llama.cpp; las variantes Q4_K_S y Q4_K_M (0,6 GB) son las recomendadas por el autor por su velocidad.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers. vLLM y TGI no estan confirmados para este modelo en la informacion disponible.
- Latencia y throughput estimados: no disponibles. A modo orientativo, un modelo de 0,75B en CPU moderna suele generar decenas de tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo que permitan una comparativa rigurosa. A continuacion se comparan solo caracteristicas objetivas con alternativas de escala similar ampliamente conocidas; los datos de rendimiento de starlight-small-1 no estan publicados.

| Modelo | Parametros | Contexto | Licencia | Formato | Idiomas |
|---|---|---|---|---|---|
| starlight-small-1 | 752 M | No disponible | Apache 2.0 | GGUF, safetensors | Ingles |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Multilingue |
| Llama 3.2 1B | 1,24 B | 128.000 tokens | Llama 3.2 Community | safetensors, GGUF | Multilingue |
| SmolLM2-1.7B | 1,71 B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Multilingue |

La comparativa se limita a parametros, contexto y licencia porque no hay benchmarks publicados de starlight-small-1 que permitan contrastar calidad.

## Limitaciones y advertencias

- Sesgos conocidos: no hay informacion publicada sobre evaluaciones de sesgo; al ser un modelo entrenado presumiblemente con datos web en ingles, es esperable un sesgo hacia perspectivas angloparlantes y occidentales, aunque no esta cuantificado.
- Riesgo de alucinacion: alto en terminos relativos, dado el reducido numero de parametros (0,75B); no debe usarse como fuente de verdad en dominios facticos sin verificacion.
- Limitaciones de idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Limitaciones de contexto: la longitud de contexto no esta publicada, lo que impide planificar casos de uso con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no obstante, conviene revisar la licencia del modelo base North-ML1/starlight-small-1 por si anade condiciones adicionales.
- Caveats para produccion: la ausencia de benchmarks, de documentacion de entrenamiento y de datos de contexto hace arriesgado su uso en produccion sin una evaluacion propia previa; las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable segun las notas del autor.
- Las cuantizaciones ponderadas con imatrix no estan disponibles; solo existen las estaticas listadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/starlight-small-1-GGUF
- Modelo base: https://huggingface.co/North-ML1/starlight-small-1
- Pagina de descargas del autor: https://hf.tst.eu/model#starlight-small-1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
