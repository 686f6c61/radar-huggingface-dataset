# mradermacher/WittyAthena-24b-GGUF

## Resumen

WittyAthena-24b-GGUF es la version cuantizada en formato GGUF del modelo Vortex5/WittyAthena-24b, un merge de modelos de aproximadamente 23.570 millones de parametros (23,57 B) orientado a roleplay y conversacion. La cuantizacion la ha realizado mradermacher, un conocido publicador de versiones GGUF de modelos abiertos, y esta pensada para su uso con llama.cpp y herramientas derivadas como Ollama o LM Studio. El modelo base procede de un proceso de fusion (mergekit), no de un entrenamiento desde cero, y esta etiquetado con las categorias merge, roleplay y conversational.

El interes de esta ficha esta en que permite ejecutar un modelo de 24 B en hardware de consumo mediante cuantizaciones que van desde los 9,0 GB (Q2_K) hasta los 25,2 GB (Q8_0), con opciones intermedias recomendadas por el autor como Q4_K_S y Q4_K_M (13,6 y 14,4 GB). El modelo esta etiquetado unicamente en ingles, lo que limita su uso en castellano sin evaluacion previa.

No se dispone de informacion sobre la licencia, la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks, por lo que muchos apartados de esta ficha se marcan como "no disponible". La ficha se centra en lo que si se puede verificar: el origen del modelo, las cuantizaciones publicadas y las implicaciones practicas de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de mergekit; presumiblemente transformer, sin confirmar) |
| Parametros totales | 23.572.403.200 (23,57 B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en el repo i1-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base Vortex5/WittyAthena-24b se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base Vortex5/WittyAthena-24b es el resultado de un merge de modelos realizado con mergekit, segun las etiquetas de la model card. Esto implica que no hay un proceso de entrenamiento propio documentado: las capacidades provienen de los modelos originales fusionados, y no se especifican ni los datos de entrenamiento, ni el numero de tokens, ni si hubo fases de RLHF o DPO. Tampoco se detalla la arquitectura interna (tipo de atencion, uso de GQA, etc.) mas alla de que el modelo tiene 23,57 B de parametros y se carga con la libreria transformers.

La contribucion de esta ficha concreta (mradermacher/WittyAthena-24b-GGUF) es la conversion a GGUF y la generacion de cuantizaciones estaticas con distintas profundidades de bits. El autor indica que las cuantizaciones ponderadas/imatrix estan en un repositorio separado (WittyAthena-24b-i1-GGUF) y que la conversion se hizo con convert_type hf y output_tensor_quantised 1. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional y roleplay, segun las etiquetas del modelo (roleplay, conversational).
- Conversaciones multi-turno orientadas a personajes o escenarios, que es el uso declarado del modelo base.
- Generacion de texto general en ingles.
- No hay evidencia de soporte de tool calling ni function calling en la informacion disponible.
- No hay evidencia de capacidades de agente o razonamiento multi-paso documentadas.
- No hay evidencia de capacidades de vision, audio ni modo "thinking".
- Capacidad multilingue: solo se declara ingles; el rendimiento en castellano no esta documentado.

## Casos de uso

- Roleplay y simulacion de personajes: el modelo esta etiquetado explicitamente para roleplay, por lo que puede usarse para mantener conversaciones con una persona ficticia o un escenario definido, siempre que se acepte que solo se declara soporte de ingles.
- Prototipado de chatbots conversacionales en local: con la cuantizacion Q4_K_M (14,4 GB) se puede desplegar en una estacion de trabajo con GPU de 16-24 GB y probar flujos conversacionales sin depender de APIs externas.
- Generacion de dialogos para guiones o narrativa interactiva: el modelo puede producir respuestas de personaje coherentes en ingles y servir como borrador para escritura creativa.
- Evaluacion de merges comunitarios: investigadores interesados en estudiar el comportamiento de modelos fusionados con mergekit pueden usar esta version GGUF para comparar cualitativamente frente al modelo base en safetensors.
- Despliegue en entornos con recursos limitados: la cuantizacion Q2_K (9,0 GB) permite ejecutar un modelo de 24 B en GPUs de 12 GB o en configuraciones CPU+GPU, a costa de calidad.
- Experimentacion con llama.cpp y Ollama: al estar en GGUF, el modelo se puede cargar en herramientas estandar para pruebas de inferencia, benchmarking de velocidad y comparacion de cuantizaciones (Q4_K_S frente a Q8_0, por ejemplo).
- Fine-tuning o evaluacion posterior (con cautela): al existir el modelo base en safetensors, se puede partir de el para experimentos de ajuste, aunque la licencia no esta disponible y debe verificarse antes de cualquier uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~9,0 GB.
  - Q3_K_S: ~10,5 GB; Q3_K_M: ~11,6 GB; Q3_K_L: ~12,5 GB.
  - IQ4_XS: ~13,0 GB; Q4_K_S: ~13,6 GB; Q4_K_M: ~14,4 GB.
  - Q5_K_S: ~16,4 GB; Q5_K_M: ~16,9 GB.
  - Q6_K: ~19,4 GB; Q8_0: ~25,2 GB.
- GPU recomendadas: para Q4_K_M o superiores, GPU con 16-24 GB de VRAM (RTX 4090, RTX 3090, A5000, L4 con cuidado). Para Q8_0, se recomienda una GPU de 32 GB o mas (A100 40 GB, H100, RTX A6000).
- Cabe en GPU de consumo: si. Q4_K_S y Q4_K_M caben en RTX 4090 (24 GB) y RTX 3090 (24 GB) con margen para contexto moderado; Q2_K y Q3_K_S pueden caber en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) con contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El modelo base en safetensors se puede cargar con transformers; para servidores de alta concurrencia se puede usar vLLM o TGI solo con el modelo base, no con los GGUF.
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantizacion; el autor marca Q4_K_S, Q4_K_M y Q8_0 como "fast" y Q6_K como "very good quality", sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WittyAthena-24b-GGUF (este) | 23,57 B | no disponible | no disponible | GGUF | Merge orientado a roleplay; solo ingles declarado |
| Modelo base Vortex5/WittyAthena-24b | 23,57 B | no disponible | no disponible | safetensors | Origen del GGUF; mismas capacidades sin cuantizar |
| Alternativas de 24 B en GGUF | no disponible | no disponible | no disponible | GGUF | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe verificarse en el repositorio del modelo base antes de cualquier despliegue en produccion.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta evaluado y probablemente sea inferior.
- Al ser un merge de modelos, los sesgos y comportamientos heredados de los modelos originales no estan documentados.
- Riesgo de alucinacion no cuantificado: no hay benchmarks ni evaluaciones publicadas.
- Las cuantizaciones de baja profundidad (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S o Q4_K_M para uso general.
- El repositorio ocupa 161,4 GB en total por incluir todas las cuantizaciones; conviene descargar solo el archivo necesario.
- No hay informacion sobre longitud de contexto soportada, lo que impide planificar aplicaciones con ventanas largas.
- El modelo tiene pocas descargas (139) y ningun "like", lo que sugiere una validacion comunitaria muy limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WittyAthena-24b-GGUF
- Modelo base: https://huggingface.co/Vortex5/WittyAthena-24b
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/WittyAthena-24b-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#WittyAthena-24b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
