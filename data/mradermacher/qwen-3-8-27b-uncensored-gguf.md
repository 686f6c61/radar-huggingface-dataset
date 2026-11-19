# mradermacher/Qwen-3.8-27B-Uncensored-GGUF

## Resumen

Qwen-3.8-27B-Uncensored-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo junafinity/Qwen-3.8-27B-Uncensored, un derivado multimodal de la familia Qwen con 27.320.697.856 parametros totales (27,3 mil millones). El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de quants estaticos e imatrix en Hugging Face, que en este caso ofrece trece variantes de cuantizacion mas dos ficheros de proyeccion multimodal (mmproj). El modelo se distribuye bajo licencia Apache 2.0 y esta etiquetado como *abliterated* y *uncensored*, es decir, con el alineamiento de rechazo eliminado o atenuado respecto al modelo original.

El pipeline declarado es `image-text-to-text`, lo que indica que el modelo base conserva la torre de vision y acepta entradas de imagen junto con texto. La ficha tecnica del autor solo declara el idioma ingles (`en`), aunque las etiquetas incluyen `qwen3_5` como identificador de familia, lo que sugiere una generacion posterior a Qwen3 en la nomenclatura del autor. No se dispone de informacion publicada sobre longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks.

La relevancia practica de este repositorio es de infraestructura: permite ejecutar un modelo multimodal de 27B en hardware de consumo mediante llama.cpp u Ollama, con opciones que van desde 11,0 GB (Q2_K) hasta 29,1 GB (Q8_0). Es una pieza pensada para quien necesita inferencia local de un modelo sin filtros de rechazo y con capacidad de vision, no para quien busque un modelo con garantias de alineamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de familia `qwen3_5`; transformer multimodal con torre de vision, detalles no publicados) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles; unico idioma declarado) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (quants estaticos); repo original en safetensors via transformers |
| Tamano del repositorio | 190,8 GB (incluye todas las variantes) |
| Cuantizacion con imatrix | disponible en repositorio separado (sufijo `-i1-GGUF`) |
| Tipo de conversion | hf, quantize_version 2, output_tensor_quantised 1 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna en la documentacion disponible. Las etiquetas del repositorio indican `qwen3_5` como familia y `multimodal` / `image-text-to-text` como capacidades, con ficheros `mmproj` separados que confirman la presencia de un proyector multimodal independiente del cuerpo del modelo, patron habitual en llama.cpp para modelos vision-lenguaje. El dato de parametros (27,3B) proviene de los safetensors del modelo base, no de una ficha tecnica detallada.

Tampoco hay datos sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni innovaciones tecnicas declaradas. La caracteristica diferencial del modelo base es el proceso de *abliteration*, que modifica los pesos para reducir la tendencia al rechazo de peticiones; el autor no documenta la metodologia concreta aplicada. El trabajo de mradermacher se limita a la cuantizacion estatica (sin imatrix en este repositorio, con variante imatrix en el repositorio `-i1-GGUF`).

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), mediante el proyector mmproj suministrado en Q8_0 o f16.
- Comportamiento sin censura: el etiquetado *abliterated* y *uncensored* indica ausencia o atenuacion de los mecanismos de rechazo del modelo original.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas), lo que facilita su exposicion mediante APIs compatibles con OpenAI.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la declaracion del autor.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local de un modelo multimodal de 27B en estaciones de trabajo con GPU de consumo: con Q4_K_M (16,9 GB) y el mmproj Q8_0 (0,7 GB) se puede cargar en una RTX 4090 de 24 GB, cubriendo tareas de descripcion de imagenes y dialogo sobre ellas sin depender de servicios externos.
- Procesamiento por lotes de documentos escaneados en ingles: el modelo acepta imagen y texto, de modo que se puede enviar la captura de una pagina junto con una instruccion de extraccion y obtener texto estructurado en una unica pasada.
- Investigacion sobre alineamiento y seguridad: al ser una variante abliterated, sirve como contrapunto experimental para medir cuanto del comportamiento de rechazo depende de las direcciones de activacion eliminadas, comparando respuestas contra el modelo original.
- Generacion de descripciones y metadatos para catalogos de imagenes en ingles: la combinacion de vision y contexto conversacional permite generar pies de foto, etiquetas y resumenes coherentes con una guia de estilo dada en el prompt.
- Asistente conversacional autoalojado en ingles para entornos con requisitos de soberania del dato: al ejecutarse con llama.cpp u Ollama sobre hardware propio, ninguna peticion sale de la infraestructura local.
- Prototipado rapido de aplicaciones de vision-lenguaje: los quants Q4_K_S y Q4_K_M estan marcados por el autor como "fast, recommended", lo que los hace adecuados para iterar sobre prompts e integraciones antes de decidir una cuantizacion mayor.
- Evaluacion comparativa de calidad entre cuantizaciones: el repositorio ofrece once tamanos distintos del mismo modelo, lo que permite medir la degradacion de perplexity y calidad de respuesta segun el nivel de cuantizacion en un mismo conjunto de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tablas de MMLU, HumanEval, GSM8K ni metricas multimodales para este modelo, y no se dispone de evaluaciones independientes del proceso de abliteration.

## Requisitos de hardware

- VRAM estimada para inferencia, segun cuantizacion: 11,0 GB (Q2_K), 12,4 GB (Q3_K_S), 13,6 GB (Q3_K_M), 14,7 GB (Q3_K_L), 15,5 GB (IQ4_XS), 15,9 GB (Q4_K_S), 16,9 GB (Q4_K_M), 19,1 GB (Q5_K_S), 19,6 GB (Q5_K_M), 22,5 GB (Q6_K), 29,1 GB (Q8_0). A estas cifras hay que sumar 0,7 GB (mmproj Q8_0) o 1,0 GB (mmproj f16) si se usa la entrada de imagen, mas el espacio de cache KV correspondiente al contexto configurado.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con mmproj; RTX 3090 (24 GB) en el mismo rango; A100 40 GB o H100 para Q8_0 y contextos largos; configuraciones multi-GPU para Q6_K y Q8_0 si se requiere contexto extendido.
- Cabe en GPU de consumo: si. Q4_K_S y Q4_K_M caben en 24 GB con margen para cache KV moderada; Q3_K_S y Q2_K permiten incluso tarjetas de 12-16 GB, a costa de calidad.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con endpoints OpenAI gracias a la etiqueta `endpoints_compatible`. vLLM y TGI no consumen GGUF de forma nativa para este caso; requeririan los safetensors del modelo base.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-3.8-27B-Uncensored-GGUF (este) | 27,3B | no disponible | Si (image-text-to-text) | Apache 2.0 | GGUF en HF; safetensors en el repo base |
| junafinity/Qwen-3.8-27B-Uncensored | 27,3B | no disponible | Si | Apache 2.0 | Safetensors en HF (modelo base sin cuantizar) |
| Qwen-3.8-27B-Uncensored-i1-GGUF (mradermacher) | 27,3B | no disponible | Si | Apache 2.0 | GGUF con quants imatrix/weighted |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es contra el propio modelo base y contra la variante imatrix del mismo autor. No se dispone de datos de rendimiento que permitan situar este modelo frente a otros de tamano similar.

## Limitaciones y advertencias

- El modelo esta marcado como *abliterated* y *uncensored*: se ha eliminado o atenuado el alineamiento de rechazo, por lo que puede producir contenido que el modelo original bloquearia. No es apto para aplicaciones orientadas al publico sin una capa de moderacion externa.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al tratarse de un modelo de 27B y de una variante modificada, no hay garantia de que mantenga la fidelidad factica del original.
- La cuantizacion introduce degradacion adicional. El autor advierte explicitamente que Q3_K_M es de "lower quality"; por debajo de Q4 se acumula el efecto de la cuantizacion sobre un modelo ya modificado.
- Idioma: solo se declara ingles. El rendimiento en castellano no esta verificado y no deberia asumirse.
- Longitud de contexto no documentada: planificar el despliegue sin asumir una ventana concreta y verificar experimentalmente el limite real antes de usarlo en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el publicador no ofrece garantias sobre el comportamiento del modelo ni sobre la legalidad del contenido que genere en jurisdicciones concretas.
- Los ficheros de proyeccion multimodal son imprescindibles para la entrada de imagen; usar solo el GGUF del cuerpo del modelo desactiva la vision.
- El repositorio pesa 190,8 GB en total; conviene descargar unicamente la variante necesaria.
- No hay informacion sobre sesgos especificos, datos de entrenamiento ni evaluaciones de seguridad del proceso de abliteration.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen-3.8-27B-Uncensored-GGUF
- Modelo base (safetensors): https://huggingface.co/junafinity/Qwen-3.8-27B-Uncensored
- Variante con quants imatrix/weighted: https://huggingface.co/mradermacher/Qwen-3.8-27B-Uncensored-i1-GGUF
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#Qwen-3.8-27B-Uncensored-GGUF
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion y FAQ del autor: https://huggingface.co/mradermacher/model_requests
- Grafica comparativa de calidad por tipo de quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
