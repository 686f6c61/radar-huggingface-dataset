# mradermacher/Qwen3-VL-8B-Heretic-Stable-GGUF

## Resumen

Qwen3-VL-8B-Heretic-Stable-GGUF es la version cuantizada en formato GGUF del modelo prithivMLmods/Qwen3-VL-8B-Heretic-Stable, publicada por el usuario mradermacher, especializado en la conversion de pesos a GGUF para inferencia local. Se trata de un modelo multimodal de tipo vision-lenguaje derivado de la familia Qwen3-VL de 8B parametros (8.190.735.360 parametros reales segun los safetensors del modelo base), al que se le ha aplicado un proceso de "abliteration" —eliminacion automatica de la direccion de rechazo en el espacio de activaciones— mediante la herramienta Heretic. El resultado es un modelo "uncensored", "uncensored", "unfiltered" y "unredacted" que responde a peticiones que los modelos alineados convencionales rechazan.

El problema que resuelve es doble. Por un lado, ofrece el modelo en cuantizaciones que van de 3,4 GB (Q2_K) a 16,5 GB (f16), lo que permite ejecutarlo en GPU de consumo y en CPU con llama.cpp, Ollama u otros runtimes compatibles con GGUF. Por otro, proporciona una variante sin filtros de rechazo util para investigacion en alineacion, generacion de corpus de red teaming y evaluacion de robustez de clasificadores de seguridad, usando el dataset prithivMLmods/harm_bench como referencia declarada.

Es relevante ahora porque combina tres tendencias: el interes creciente por tecnicas automaticas de decensura (Heretic), la demanda de modelos multimodales pequenos ejecutables en local y la necesidad de la comunidad de investigacion de disponer de modelos no alineados para medir comportamiento. La licencia es Apache 2.0, lo que permite uso comercial, aunque el contenido que genere el modelo queda bajo responsabilidad del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-lenguaje) con encoder visual; derivado de Qwen3-VL |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-VL-8B declara ventanas de hasta 256 000 tokens en su documentacion original, dato no verificado en esta ficha) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 para la parte multimodal; existen quants ponderados/imatrix en el repo i1-GGUF |
| Idiomas soportados | en (segun la model card; el modelo base Qwen3-VL es multilingue, pero no se declara en esta ficha) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (multiples ficheros por cuantizacion); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantizacion GGUF del checkpoint prithivMLmods/Qwen3-VL-8B-Heretic-Stable, que a su vez deriva de la arquitectura Qwen3-VL de 8B parametros: un transformer denso con un encoder visual acoplado que permite procesar imagenes y texto conjuntamente. En el repositorio se incluyen ficheros mmproj (en f16 de 1,3 GB y Q8_0 de 0,9 GB) que constituyen el suplemento multimodal necesario para que los runtimes GGUF puedan proyectar las representaciones visuales al espacio de tokens del modelo de lenguaje.

El proceso de "abliteration" se ha realizado con Heretic, una herramienta de eliminacion automatica de censura que no requiere comprender los internos del transformer de forma manual. Heretic identifica y suprime la denominada "direccion de rechazo" mediante optimizacion, modificando los pesos para que el modelo deje de producir negativas sistematicas ante ciertas categorias de peticiones. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de preentrenamiento ni sobre si hubo fases adicionales de RLHF o DPO en el modelo base. El unico dataset declarado explicitamente es prithivMLmods/harm_bench, empleado como referencia de evaluacion del comportamiento tras la decensura, no como corpus de entrenamiento confirmado.

No se documenta en la informacion proporcionada ninguna innovacion adicional como decodificacion especulativa, atencion lineal o modos hibridos. El valor anadido del repositorio es, por tanto, la conversion y cuantizacion sistematica del checkpoint original, no cambios arquitectonicos propios.

## Capacidades

- Generacion de texto conversacional en ingles con soporte de plantillas de chat (tag "conversational").
- Procesamiento de imagenes: al incluir ficheros mmproj, el modelo puede recibir entradas visuales ademas de texto (descripcion de imagenes, lectura de capturas, razonamiento sobre contenido grafico).
- Respuesta a peticiones que los modelos alineados rechazan, incluidas peticiones de seguridad ofensiva, segun la documentacion de abliteratedmodels.org.
- Generacion de corpus de red teaming y evaluacion de comportamiento de modelos no alineados.
- Inferencia local y en entornos sin conexion gracias al formato GGUF y su compatibilidad con llama.cpp y derivados.
- No se ha confirmado en la informacion disponible soporte de tool calling, function calling, modo de razonamiento explicito (thinking mode), agentes multi-paso o capacidades de audio.
- Capacidades multilingues: la model card declara unicamente en; no hay datos sobre rendimiento en castellano u otros idiomas.

## Casos de uso

- Generacion de corpus para red teaming: el modelo produce respuestas ante prompts de seguridad ofensiva que un modelo alineado rechazaria, lo que permite construir conjuntos de datos etiquetados para entrenar o evaluar clasificadores de contenido danino.
- Evaluacion de robustez de filtros de seguridad: usando harm_bench como referencia, se puede medir la tasa de evasion de moderadores y comparar el comportamiento del modelo abliterado frente a su version original alineada.
- Investigacion en alineacion y decensura: al estar construido con Heretic, sirve como caso de estudio reproducible para analizar como la supresion de la direccion de rechazo afecta a las capacidades generales del modelo y a su distribucion de respuestas.
- Inferencia local en GPU de consumo: con la cuantizacion Q4_K_M (5,1 GB) cabe en GPUs de 8-12 GB de VRAM, lo que permite desplegar un modelo multimodal en un equipo de sobremesa sin depender de APIs externas.
- Analisis de imagenes en entornos aislados: con los ficheros mmproj y un runtime compatible, se puede usar para describir imagenes o extraer informacion de capturas en sistemas sin conectividad, donde no es posible enviar datos a servicios en la nube.
- Prototipado rapido de aplicaciones multimodales: la disponibilidad de doce niveles de cuantizacion permite ajustar el equilibrio entre calidad y consumo de memoria durante el desarrollo antes de decidir el despliegue final.
- Generacion de datos sinteticos para fine-tuning: el modelo puede producir dialogos e instrucciones en dominios donde los modelos alineados se niegan a generar, utiles para aumentar la diversidad de datasets de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, ni comparaciones numericas frente al modelo base sin abliterar. Tampoco se aportan cifras de perplejidad por cuantizacion mas alla del grafico de referencia generico de ikawrakow sobre tipos de cuantizacion enlazado en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (solo pesos del modelo de lenguaje, sin el proyector visual ni el contexto): Q2_K 3,4 GB; Q3_K_S 3,9 GB; Q3_K_M 4,2 GB; Q3_K_L 4,5 GB; IQ4_XS 4,7 GB; Q4_K_S 4,9 GB; Q4_K_M 5,1 GB; Q5_K_S 5,8 GB; Q5_K_M 6,0 GB; Q6_K 6,8 GB; Q8_0 8,8 GB; f16 16,5 GB.
- Proyector multimodal adicional: 0,9 GB (mmproj-Q8_0) o 1,3 GB (mmproj-f16) si se va a procesar imagen.
- A esa base hay que sumar la memoria de la cache KV, que crece con la longitud de contexto configurada; no se dispone de cifras oficiales de contexto para este modelo, por lo que el calculo debe hacerse segun el valor que exponga el runtime.
- GPU de consumo: Q4_K_M y Q5_K_M caben en GPUs de 8 GB (RTX 3060 Ti, RTX 4060) con contexto moderado; Q8_0 requiere 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti); f16 necesita 24 GB (RTX 3090, RTX 4090) o reparto entre GPU y CPU.
- GPU de datacenter: A100 40/80 GB, H100, L40S y similares permiten ejecutar cualquier cuantizacion con contexto largo y varios usuarios concurrentes.
- Ejecucion en CPU y Apple Silicon: viable con llama.cpp y bindings derivados, especialmente en cuantizaciones Q4_K_M o inferiores; el rendimiento depende del ancho de banda de memoria del sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. Para la version original en safetensors serian aplicables vLLM, TGI o transformers con aceleracion por GPU, pero no para estos ficheros GGUF salvo conversion previa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependen de la cuantizacion, del hardware y de la longitud de contexto, y no se aportan mediciones en el repositorio.
- Tamano total del repositorio: 75,3 GB, lo que implica que la descarga completa de todas las cuantizaciones requiere ese espacio en disco.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Qwen3-VL-8B-Heretic-Stable-GGUF | 8,19B | no disponible | no disponible | apache-2.0 | GGUF, 12 cuantizaciones + mmproj |
| prithivMLmods/Qwen3-VL-8B-Heretic-Stable | 8,19B | no disponible | no disponible | apache-2.0 | safetensors (modelo base sin cuantizar) |
| Qwen3-VL-8B (familia original de Alibaba) | ~8B | no disponible en esta ficha | no disponible | no disponible en esta ficha | safetensors y ecosistema amplio |
| mradermacher/Qwen3-VL-8B-Heretic-Stable-i1-GGUF | 8,19B | no disponible | no disponible | apache-2.0 | GGUF con quants ponderados/imatrix |

La comparativa se limita a variantes del mismo checkpoint o a su ascendiente directo, porque no se dispone de datos numericos de rendimiento ni de contexto que permitan una comparacion cuantitativa con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Modelo explicitamente decensurado mediante abliteration; eliminara o reducira sus negativas ante peticiones que un modelo alineado rechazaria. No es apto para aplicaciones orientadas al usuario final sin una capa externa de moderacion.
- La abliteration suele degradar capacidades generales (razonamiento, coherencia, adherencia a instrucciones) en mayor o menor medida; no se aportan mediciones que cuantifiquen esa perdida respecto al modelo original.
- Riesgo elevado de alucinacion y de respuestas factualmente incorrectas, agravado por la ausencia de benchmarks publicados para esta variante.
- Idiomas: la model card declara unicamente ingles; no hay garantias de calidad en castellano ni en otras lenguas, pese al soporte multilingue del modelo base.
- Longitud de contexto no documentada en la informacion disponible; conviene verificarla en el runtime antes de disenar aplicaciones con ventanas largas.
- Las cuantizaciones bajas (Q2_K, Q3_K_S, Q3_K_M) degradan notablemente la calidad y no se recomiendan para produccion; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S, Q4_K_M y Q8_0.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no exime al usuario de responsabilidad legal sobre el contenido generado ni sobre el cumplimiento de normativas aplicables (por ejemplo, la Ley de IA de la UE en materia de contenido y transparencia).
- El uso de este modelo para generar contenido danino, acoso, desinformacion o material ilegal queda fuera del proposito declarado del repositorio y puede conllevar responsabilidad legal para quien lo despliegue.
- El repositorio pesa 75,3 GB en total; descargar todas las cuantizaciones no es necesario y consume un espacio considerable.
- No se confirma soporte de tool calling, agentes o modos de razonamiento extendido, por lo que no debe asumirse en disenos de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/Qwen3-VL-8B-Heretic-Stable-GGUF
- Quants ponderados/imatrix (i1-GGUF): https://huggingface.co/mradermacher/Qwen3-VL-8B-Heretic-Stable-i1-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Qwen3-VL-8B-Heretic-Stable
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#Qwen3-VL-8B-Heretic-Stable-GGUF
- Ficha informativa del modelo abliterado: https://www.abliteratedmodels.org/qwen3-vl-8b-heretic-stable/
- Repositorio de Heretic, herramienta de decensura automatica: https://github.com/p-e-w/heretic
- Dataset de referencia harm_bench: https://huggingface.co/datasets/prithivMLmods/harm_bench
- Peticiones y FAQ de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke referenciado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Espejo del modelo en ModelHub: https://dev.modelhub.org.cn/mradermacher/Qwen3-VL-8B-Heretic-Stable-GGUF
