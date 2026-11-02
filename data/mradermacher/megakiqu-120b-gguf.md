# mradermacher/Megakiqu-120b-GGUF

## Resumen

Megakiqu-120b-GGUF es la version cuantizada en formato GGUF del modelo kuotient/Megakiqu-120b, un merge de modelos de 120.315.912.192 parametros (aproximadamente 120B) creado mediante mergekit. Esta publicacion corre a cargo de mradermacher, un conocido cuantizador de la comunidad de HuggingFace que distribuye versiones GGUF de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base esta etiquetado como de idioma coreano (ko) y se distribuye bajo licencia CC-BY-SA-4.0.

El modelo resuelve el problema de ejecutar un modelo de gran tamano en entornos donde no se dispone de infraestructura para pesos en precision completa: al ofrecer cuantizaciones desde Q2_K (44,3 GB) hasta Q8_0 (127,9 GB), permite desplegar el modelo en configuraciones de hardware muy diversas, desde estaciones de trabajo con multiples GPU consumer hasta servidores con GPU de datacenter. La publicacion incluye tanto cuantizaciones estaticas (este repositorio) como cuantizaciones ponderadas/imatrix en un repositorio separado.

La relevancia actual del modelo radica en su tamano (120B) combinado con la disponibilidad de cuantizaciones GGUF de alta calidad, lo que lo situa en la categoria de modelos grandes ejecutables localmente. No obstante, la informacion publicada sobre arquitectura interna, datos de entrenamiento y rendimiento es muy limitada: la model card del cuantizador remite al modelo base y no aporta detalles tecnicos adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base creado con mergekit; arquitectura subyacente no especificada) |
| Parametros totales | 120.315.912.192 (aproximadamente 120B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | coreano (ko) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base kuotient/Megakiqu-120b es un merge creado con mergekit, segun las etiquetas de la model card. No se especifica en la informacion disponible que tecnica de merge se empleo (SLERP, TIES, DARE, passthrough, etc.), ni cuales son los modelos de origen que se combinaron. Tampoco se detalla la arquitectura interna del transformer subyacente (numero de capas, dimensiones de atencion, tipo de atencion, etc.), ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo fases de RLHF/DPO.

La informacion disponible no permite confirmar innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. El unico dato tecnico relevante es el proceso de cuantizacion: el cuantizador indica que las cuantizaciones de este repositorio son estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf), y que las cuantizaciones ponderadas con imatrix estan en un repositorio separado (Megakiqu-120b-i1-GGUF). Las cuantizaciones Q4_K_S y Q4_K_M se marcan como "fast, recommended", y Q6_K como "very good quality".

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y orientado a dialogos multi-turno.
- Generacion de texto en coreano: el unico idioma declarado en la model card es el coreano.
- Ejecucion local mediante llama.cpp y herramientas compatibles con GGUF.
- No se dispone de informacion sobre soporte de tool calling, function calling, capacidades de agente, razonamiento multi-paso, codigo, matematicas, vision, audio ni modos de pensamiento extendido.
- No se dispone de informacion sobre capacidades multilingues adicionales mas alla del coreano.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo puede gestionar dialogos multi-turno en coreano, su idioma declarado, desplegado localmente mediante llama.cpp con una cuantizacion Q4_K_M (72,2 GB) en un servidor con suficiente VRAM o RAM.
- Experimentacion con modelos de gran tamano en hardware limitado: las cuantizaciones Q2_K (44,3 GB) y Q3_K_S (51,9 GB) permiten probar un modelo de 120B en estaciones de trabajo con 48-64 GB de VRAM o con descarga parcial a RAM, algo inviable con los pesos en precision completa.
- Investigacion sobre tecnicas de merge de modelos: al ser un merge de mergekit, sirve como caso de estudio para evaluar como se comportan las combinaciones de modelos a gran escala frente a los modelos originales.
- Despliegue en pipelines de generacion de texto por lotes: la cuantizacion Q8_0 (127,9 GB) ofrece la mayor calidad disponible en formato GGUF para tareas de generacion offline donde la latencia no es critica.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantizacion, lo que permite medir el impacto de la cuantizacion en la perplejidad y la calidad de salida para un modelo de 120B.
- Fine-tuning o adaptacion posterior (solo sobre el modelo base en safetensors): el modelo base kuotient/Megakiqu-120b puede servir como punto de partida para adaptaciones en coreano, aunque requiere infraestructura de entrenamiento de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano de cada cuantizacion): Q2_K 44,3 GB; Q3_K_S 51,9 GB; Q3_K_M 57,9 GB; Q3_K_L 63,1 GB; IQ4_XS 64,9 GB; Q4_K_S 68,4 GB; Q4_K_M 72,2 GB; Q5_K_S 82,9 GB; Q5_K_M 85,1 GB; Q6_K 98,8 GB; Q8_0 127,9 GB.
- GPU recomendadas: para las cuantizaciones mas grandes (Q6_K, Q8_0) se requiere un servidor multi-GPU con A100 80GB o H100 80GB (por ejemplo, 2x A100 80GB para Q8_0 con margen para el contexto). Las cuantizaciones Q4_K_M y Q5_K_M encajan en configuraciones de 2x RTX 4090 (48 GB) solo con descarga parcial a RAM, o en 4x RTX 4090 para carga completa.
- GPU consumer: ninguna GPU consumer individual (RTX 4090 24 GB, RTX 3090 24 GB) puede cargar el modelo completo en VRAM en ninguna cuantizacion; es posible la ejecucion con offloading a RAM del sistema mediante llama.cpp, a costa de latencia muy elevada.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui. vLLM y TGI no soportan GGUF de forma nativa para este caso; para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada. Con offloading a RAM en hardware consumer, se espera una velocidad de generacion muy baja (del orden de pocos tokens por segundo), aunque no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Megakiqu-120b-GGUF | 120,3B | no disponible | ko | CC-BY-SA-4.0 | GGUF | Merge de mergekit; cuantizaciones de 44,3 a 127,9 GB |
| kuotient/Megakiqu-120b | 120,3B | no disponible | ko | CC-BY-SA-4.0 | safetensors | Modelo base del que deriva esta publicacion |
| Megakiqu-120b-i1-GGUF | 120,3B | no disponible | ko | CC-BY-SA-4.0 | GGUF | Cuantizaciones ponderadas/imatrix del mismo modelo base |

No se dispone de informacion sobre modelos comparables de otros autores con el mismo tamano y orientacion al coreano en la informacion proporcionada.

## Limitaciones y advertencias

- La model card del cuantizador no aporta informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad; no es posible evaluar sesgos conocidos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo generativo, es esperable, pero no hay datos que lo midan.
- El unico idioma declarado es el coreano; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- La licencia CC-BY-SA-4.0 exige atribucion y compartir las obras derivadas bajo la misma licencia; es importante revisar las implicaciones para uso comercial y para productos derivados.
- El modelo es un merge de mergekit sin documentacion de los modelos de origen ni del metodo de merge, lo que dificulta la trazabilidad y la reproducibilidad.
- El tamano del repositorio (816,4 GB) y de las cuantizaciones individuales hace inviable su uso en hardware consumer sin offloading, con la consiguiente penalizacion de latencia.
- Las cuantizaciones Q2_K y Q3_K_M se senalan como de menor calidad en la propia model card; para produccion se recomienda Q4_K_M o superior.
- No hay informacion sobre el contexto maximo soportado, lo que impide planificar aplicaciones que dependan de ventanas largas.
- El modelo tiene muy poca traccion (6 descargas, 0 likes en el momento de la consulta), por lo que no hay validacion comunitaria de su calidad.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/mradermacher/Megakiqu-120b-GGUF
- Modelo base: https://huggingface.co/kuotient/Megakiqu-120b
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Megakiqu-120b-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Megakiqu-120b-GGUF
- FAQ y solicitudes de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
