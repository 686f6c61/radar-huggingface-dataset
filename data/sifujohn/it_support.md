# sifujohn/it_support

## Resumen

`sifujohn/it_support` es una publicacion de pesos en formato GGUF derivada de un modelo de la familia Qwen3.5, con aproximadamente 772,8 millones de parametros totales segun los datos de safetensors del repositorio. El autor, identificado como `sifujohn`, la presenta como una conversion a GGUF realizada con Unsloth, orientada a inferencia local mediante llama.cpp. El nombre del repositorio sugiere un ajuste o especializacion para soporte tecnico de TI, aunque la model card no documenta ningun proceso de entrenamiento, dataset o evaluacion que lo confirme.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio tiene cero descargas y cero likes en el momento de la consulta, no declara licencia, no especifica idiomas soportados y no incluye resultados de benchmarks. Se trata, por tanto, de una publicacion de pesos sin documentacion tecnica asociada, lo que impide verificar su calidad, procedencia exacta del ajuste o condiciones de uso comercial.

El interes practico se reduce a dos artefactos concretos: una cuantizacion `Q4_K_M` de aproximadamente 0,8 GB, adecuada para ejecucion en CPU o GPUs de gama baja, y un proyector multimodal `mmproj` en BF16 que, segun la nomenclatura y las etiquetas, habilita entrada de imagen ademas de texto. Cualquier uso en produccion requeriria una evaluacion propia, dado que no existe informacion publicada sobre el comportamiento real del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5 (según nomenclatura de los ficheros); detalles no disponibles |
| Parametros totales | 772.845.888 (dato de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (proyector multimodal `mmproj`), Q4_K_M (pesos del modelo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `qwen3_5` y del hecho de que los pesos se distribuyen como GGUF. Por el tamano (772,8 millones de parametros) y la presencia de un fichero `mmproj`, se trata de un modelo pequeno con capacidad de vision-lenguaje, es decir, un transformer con un proyector que mapea representaciones visuales al espacio del modelo de lenguaje. No se especifica el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa.

Tampoco hay informacion sobre el proceso de entrenamiento: no se indica el numero de tokens, la composicion del corpus, si hubo ajuste supervisado, RLHF o DPO, ni cual es la relacion exacta entre este repositorio y el modelo base Qwen3.5-0.8B. La unica innovacion documentada es de caracter operativo: la conversion a GGUF mediante Unsloth y la inclusion del proyector multimodal para su uso con `llama-mtmd-cli`.

## Capacidades

- Generacion de texto conversacional en formato de chat, segun la etiqueta `conversational` y el uso con `--jinja` para plantillas de chat.
- Procesamiento de imagenes: el fichero `Qwen3.5-0.8B.BF16-mmproj.gguf` indica soporte de vision-lenguaje mediante `llama-mtmd-cli`.
- Ejecucion local en llama.cpp, con soporte de cuantizacion Q4_K_M para entornos con recursos limitados.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere uso mediante API compatible con OpenAI en infraestructura de Hugging Face.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Soporte tecnico de primer nivel en local: el nombre del repositorio y la etiqueta conversacional apuntan a un uso como asistente de respuestas a incidencias de TI; al ejecutarse con llama.cpp en un fichero de 0,8 GB, puede desplegarse en un portatil o en un servidor sin GPU dedicada.
- Clasificacion y triaje de tickets con entrada de imagen: gracias al proyector `mmproj`, el modelo puede recibir capturas de pantalla de errores o paneles de administracion junto con el texto del ticket, lo que resulta util para diagnosticos preliminares en mesas de ayuda.
- Asistente de escritorio para documentacion interna: con la cuantizacion Q4_K_M cabe en memoria de sistemas modestos y puede integrarse en herramientas de escritorio que consulten manuales y respondan preguntas frecuentes sin enviar datos a la nube.
- Prototipado rapido de interfaces conversacionales: la compatibilidad con endpoints y con plantillas Jinja permite levantar un servicio de chat de prueba con `llama-cli -hf sifujohn/it_support --jinja` y validar flujos de conversacion antes de invertir en modelos mayores.
- Procesamiento por lotes de baja latencia en CPU: al ser un modelo de menos de 1.000 millones de parametros en Q4_K_M, es viable ejecutar clasificacion o resumen de texto sobre grandes volumenes de documentos en infraestructura sin acelerador.
- Educacion y experimentacion con modelos multimodales: sirve como banco de pruebas para estudiar el comportamiento de un VLM pequeno con llama.cpp, comparar cuantizaciones y medir el impacto del proyector visual en tareas de descripcion de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para la cuantizacion Q4_K_M (repo de 0,8 GB) y en torno a 1,6-2 GB para pesos en BF16, mas el espacio del contexto y del proyector multimodal.
- GPU recomendadas: cualquier GPU con 2 GB o mas de memoria, como GTX 1650, RTX 3050 o superiores; tambien A100, H100 o L4 para despliegues por lotes, aunque el modelo esta sobredimensionado para estas aceleradoras.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna; tambien es viable en CPU pura mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para multimodal), y por extension Ollama u otros frontends basados en llama.cpp; vLLM y TGI no estan confirmados para este artefacto GGUF.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `sifujohn/it_support` | 772,8 M | No disponible | No disponible | GGUF | Repositorio HF, 0 descargas |
| Qwen2.5-0.5B-Instruct | 0,5 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Ampliamente disponible |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Ampliamente disponible |
| SmolVLM-500M-Instruct | 0,5 B | No disponible | Apache 2.0 | safetensors, GGUF | Ampliamente disponible |

La comparativa con modelos de la familia Qwen se ofrece como referencia de categoria por tamano y por el origen declarado de los pesos; no se dispone de datos que permitan comparar rendimiento real. SmolVLM se incluye como alternativa multimodal de tamano similar. Las cifras de contexto y licencia de los modelos comparados corresponden a sus respectivas model cards publicas.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card tecnica, dataset, proceso de entrenamiento ni evaluacion, lo que impide verificar que el modelo haga lo que su nombre sugiere.
- Licencia no declarada: no puede asumirse uso comercial; la ausencia de licencia es un riesgo legal para cualquier despliegue en produccion.
- Idiomas no especificados: no hay garantia de calidad en castellano ni en ningun otro idioma concreto.
- Riesgo de alucinacion: con 772,8 millones de parametros, la fiabilidad factual es limitada, especialmente en dominios tecnicos especializados.
- Contexto desconocido: no se puede planificar el uso en conversaciones largas o documentos extensos sin conocer la ventana real.
- Procedencia incierta: al ser una conversion de un modelo base mediante Unsloth, no se detalla que ajuste se aplico ni con que datos, por lo que podria contener sesgos o comportamientos heredados no documentados.
- Soporte comunitario nulo: cero descargas y cero likes implican ausencia de validacion por terceros y de mantenimiento previsible.
- Capacidad multimodal limitada por el tamano: el proyector `mmproj` existe, pero no hay evidencias publicadas de su calidad en tareas de OCR o comprension de documentos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sifujohn/it_support
- Unsloth (herramienta de conversion citada por el autor): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado en la model card): https://github.com/ggml-org/llama.cpp
