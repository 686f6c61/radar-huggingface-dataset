# BachDaThan/vietnamese-news-summarizer-v2-GGUF

## Resumen
vietnamese-news-summarizer-v2-GGUF es una version cuantizada en formato GGUF de un modelo de 1.543.714.304 parametros (aproximadamente 1,54 mil millones) especializado en el resumen de noticias en vietnamita. Lo publica el usuario BachDaThan, que ha tomado el modelo base Qwen/Qwen2.5-1.5B-Instruct, le ha fusionado el adaptador LoRA vinhthuan/vietnamese-news-summarizer-v2 y ha generado cuatro cuantizaciones listas para llama.cpp. El resultado es un modelo de instrucciones conversacional, con plantilla ChatML, enfocado al procesamiento de texto en vietnamita con soporte secundario de ingles.

El problema que resuelve es concreto: ejecutar resumen y procesamiento de noticias en vietnamita en hardware muy modesto. Con ficheros de entre 0,71 GB y 0,92 GB, el autor indica requisitos de VRAM en torno a 2,7-2,9 GB, lo que lo situa en el rango de cualquier GPU de consumo e incluso de inferencia en CPU. Esto lo hace relevante para equipos que necesitan procesar grandes volumenes de articulos en vietnamita sin acceso a GPU de datacenter.

La arquitectura subyacente es qwen2 (transformer decoder-only con Grouped Query Attention), con 28 capas, hidden size de 1536, 12 cabezas de atencion, 2 cabezas KV y una ventana de contexto nativa de 32.768 tokens. La licencia declarada es Apache-2.0, heredada del modelo base y del adaptador. El repositorio no registra descargas ni interacciones en el momento de la consulta y no publica resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen2 (transformer decoder-only con Grouped Query Attention) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,54 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (el ejemplo de la model card usa n_ctx=8192) |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q4_K_S, Q3_K_M, Q3_K_S |
| Idiomas soportados | vietnamita (vi) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo original esta en bfloat16 |
| Capas | 28 |
| Hidden size | 1536 |
| Cabezas de atencion | 12 |
| Cabezas KV | 2 |
| Tamano de vocabulario | 151.936 |
| Precision original | bfloat16 |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Adaptador LoRA fusionado | vinhthuan/vietnamese-news-summarizer-v2 |
| Tamano del repositorio | 3,5 GB (incluye las cuatro cuantizaciones) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de la familia Qwen2, con 28 capas, hidden size de 1536 y atencion con Grouped Query Attention (12 cabezas de consulta frente a 2 cabezas KV), lo que reduce el coste de la cache KV durante la inferencia. El modelo base Qwen2.5-1.5B-Instruct fue entrenado por Alibaba con un pipeline de instrucciones y alineacion, y este repositorio no reentrena el modelo: parte de el y fusiona un adaptador LoRA especializado en resumen de noticias en vietnamita (vinhthuan/vietnamese-news-summarizer-v2). Tras la fusion, el autor ha cuantizado los pesos a GGUF en cuatro variantes.

No se dispone de informacion sobre el numero de tokens de entrenamiento del adaptador, la composicion exacta del dataset de noticias, ni sobre el uso de RLHF o DPO especifico en la fase de ajuste. La model card unicamente documenta los parametros estructurales del modelo, la plantilla de chat y el proceso de cuantizacion. Las innovaciones reseñables son de despliegue, no de arquitectura: cuantizacion K-quant con mezcla de precision por bloque (Q4_K_M, Q4_K_S, Q3_K_M, Q3_K_S) y tamaños de fichero verificados con `stat().st_size` tras el proceso de build.

## Capacidades
- Generacion de texto conversacional en vietnamita, con soporte secundario de ingles.
- Resumen de noticias y articulos de prensa en vietnamita, que es la especialidad declarada del adaptador LoRA fusionado.
- Seguimiento de instrucciones en formato chat mediante plantilla ChatML (`<|im_start|>` / `<|im_end|>`), con soporte de mensaje de sistema, usuario y asistente.
- Conversacion multi-turno con contexto de hasta 32.768 tokens, aunque el ejemplo oficial reduce `n_ctx` a 8192.
- Generacion de texto general y tareas basicas de comprension y reescritura heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Soporte de tool calling o function calling: no documentado en la informacion disponible; no debe asumirse.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el tamaño de 1,5 B limita este tipo de tareas.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso
- Resumen automatico en un agregador de noticias vietnamita: el modelo recibe el cuerpo de un articulo (hasta miles de tokens) y devuelve un resumen breve; su ventana de 32.768 tokens permite procesar articulos largos sin troceado.
- Preprocesado de corpus para busqueda o indexacion: generar resumentes y meta-descripciones de cada noticia antes de indexarla en un motor de busqueda interno, en lotes y sin GPU.
- Asistente conversacional embebido en una aplicacion movil en vietnamita: con la cuantizacion Q3_K_S (0,71 GB en disco) o Q4_K_M (0,92 GB), el modelo cabe en el almacenamiento y la memoria de un dispositivo de gama media o de una GPU integrada.
- Generacion automatica de boletines y newsletters tematicas: resumir un conjunto de articulos de una misma categoria y componer un texto diario o semanal con LLM orquestado sobre llama.cpp.
- Traduccion asistida vi a en y en a vi a nivel de resumen: util para redacciones que publican en ambos idiomas, siempre con revision humana por tratarse de un modelo de 1,5 B.
- Procesamiento por lotes en servidores sin GPU: el ejemplo de la model card admite ejecucion en CPU con llama-cpp-python, lo que permite resumir miles de articulos con un coste de infraestructura minimo.
- Base para nuevos ajustes LoRA: al estar bajo Apache-2.0 y derivar de Qwen2.5, se puede reutilizar como punto de partida para dominios especificos (deportes, finanzas, legal) con un coste de entrenamiento reducido.
- Evaluacion rapida de pipelines RAG en vietnamita: su contexto largo y su tamaño reducido lo hacen adecuado como generador de pruebas en prototipos de recuperacion aumentada antes de escalar a modelos mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, resumen (ROUGE) ni ninguna otra evaluacion cuantitativa, y la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo (los resultados obtenidos no guardan relacion con el). Tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware
- Tamano en disco por cuantizacion: Q3_K_S 0,71 GB; Q3_K_M 0,77 GB; Q4_K_S 0,88 GB; Q4_K_M 0,92 GB. El repositorio completo ocupa 3,5 GB.
- VRAM recomendada por el autor: aproximadamente 2,7 GB con Q3_K_S, 2,8 GB con Q3_K_M y 2,9 GB con Q4_K_S y Q4_K_M (incluye pesos y overhead de ejecucion).
- Cache KV estimada: con 2 cabezas KV, head dim de 128 y 28 capas, la cache ocupa aproximadamente 28 KB por token en FP16; unos 229 MB con 8192 tokens de contexto y unos 917 MB con los 32.768 tokens maximos. Esta estimacion es un calculo derivado de las especificaciones publicadas, no un dato de la model card.
- GPU de consumo: cualquier GPU con 4 GB o mas de VRAM dedicada deberia cubrir las cifras indicadas por el autor; el modelo es apto para tarjetas de gama de entrada y para equipos con memoria unificada.
- CPU: la inferencia es viable en CPU con llama.cpp, ya que los pesos ocupan menos de 1 GB y la cache KV es pequena.
- Opciones de despliegue: llama.cpp, llama-cpp-python (ejemplo oficial en la model card), Ollama (con el Modelfile incluido), servidor de llama.cpp con API compatible con OpenAI y otras interfaces basadas en GGUF. vLLM no soporta GGUF de forma estandar y TGI no esta pensado para este formato.
- Latencia y throughput: no disponibles. Dependen del hardware, de la cuantizacion y de la longitud de contexto configurada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| vietnamese-news-summarizer-v2-GGUF (este) | 1,54 B | 32.768 tokens | vi, en | GGUF (Q3_K_S a Q4_K_M) | Apache-2.0 | Cuantizado y listo para llama.cpp; especializado en resumen de noticias en vietnamita |
| vinhthuan/vietnamese-news-summarizer-v2 (adaptador LoRA) | adaptador sobre 1,5 B | no disponible en la informacion proporcionada | vi, en | safetensors (adaptador) | Apache-2.0 | Requiere cargar el modelo base; no incluye cuantizacion GGUF |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | multilingue (incluye vi y en) | safetensors (bfloat16) | Apache-2.0 | Modelo base sin ajuste especifico de resumen de noticias; requiere mas VRAM en bfloat16 |

Como alternativas de la misma categoria (modelos de 1-2 B parametros para generacion de texto) pueden citarse Llama-3.2-1B-Instruct, Gemma-2-2B-it o Qwen2.5-3B-Instruct, pero sus parametros, contexto, licencia y rendimiento no figuran en la informacion proporcionada, por lo que no se incluyen datos comparativos de esos modelos.

## Limitaciones y advertencias
- Riesgo de alucinacion explicitamente reconocido por el autor: la model card advierte que el modelo puede generar informacion falsa y que no debe sustituir el consejo profesional en ambitos criticos.
- Tamano reducido (1,5 B): capacidad de razonamiento, matematicas y conocimiento factual limitada en comparacion con modelos de 7 B o mas; los resumenes pueden omitir matices o introducir detalles inexistentes.
- Especializacion estrecha: esta optimizado para resumen de noticias en vietnamita; su comportamiento en otros dominios o generos textuales no esta documentado.
- Cobertura idiomatica: la model card declara vietnamita e ingles; no hay evaluacion del rendimiento en castellano ni en otros idiomas, por lo que no se recomienda su uso como modelo multilingue general.
- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de la consulta, y ningun benchmark publicado; no hay evidencia publica de calidad frente a alternativas.
- Licencia: Apache-2.0 tanto en el modelo base como en el adaptador. La propia model card matiza que la licencia del repositorio se determino tras verificar las licencias de origen y que no se asigna Apache-2.0 de forma automatica, por lo que conviene revisar el fichero LICENSE del repositorio antes de un uso comercial.
- Longitud de contexto: aunque la arquitectura soporta 32.768 tokens, el ejemplo oficial configura `n_ctx=8192`; usar el maximo incrementa el consumo de memoria y puede degradar la calidad de los resumenes en textos muy largos.
- Fecha de publicacion: los metadatos del repositorio indican fechas de septiembre de 2026, poco habituales; conviene verificar la vigencia del contenido.
- No hay informacion sobre sesgos del adaptador LoRA ni sobre la composicion del corpus de noticias con el que se entreno, lo que impide evaluar sesgos editoriales o de fuente.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/BachDaThan/vietnamese-news-summarizer-v2-GGUF
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Adaptador LoRA de origen: https://huggingface.co/vinhthuan/vietnamese-news-summarizer-v2
- Repositorio de llama.cpp (runtime recomendado): https://github.com/ggerganov/llama.cpp
- llama-cpp-python (cliente Python usado en el ejemplo oficial): https://github.com/abetlen/llama-cpp-python
- Ollama (despliegue alternativo documentado en la model card): https://ollama.com
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo y no aportan enlaces, papers ni demos adicionales.
