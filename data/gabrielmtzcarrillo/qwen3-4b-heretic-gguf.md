# gabrielmtzcarrillo/qwen3-4b-heretic-gguf

## Resumen

Qwen3 4B Heretic GGUF es una conversion a formato GGUF del modelo Qwen/Qwen3-4B-Instruct-2507, publicada por el usuario gabrielmtzcarrillo. El autor indica que los pesos originales fueron modificados localmente antes de la conversion, aunque la model card no documenta en que consiste esa modificacion. El repositorio contiene unicamente dos ficheros de pesos: una conversion F16 (sin perdida adicional respecto a los pesos modificados) y una cuantizacion Q4_K_M, ambas generadas con llama.cpp.

Se trata de un modelo denso de 4.022.468.096 parametros (aproximadamente 4,02 B) orientado a generacion de texto conversacional, con licencia Apache 2.0, la misma que el modelo base. El repositorio pesa 10,5 GB, coherente con la suma de la conversion F16 (unos 8,0 GB de pesos) y la cuantizacion Q4_K_M (del orden de 2,5 GB). No se han publicado resultados de benchmarks, ni el numero de descargas o valoraciones es significativo en el momento de redactar esta ficha.

Su relevancia actual es practica: permite ejecutar un modelo de la familia Qwen3 en hardware de consumo mediante cuantizacion de 4 bits, con la salvedad de que el proceso de modificacion de pesos no esta documentado y de que el nombre del repositorio sugiere una posible ablacion de direcciones de rechazo (abliteration), circunstancia que no se confirma en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base; no se documenta ninguna modificacion arquitectonica) |
| Parametros totales | 4.022.468.096 (aprox. 4,02 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en el repositorio; el modelo base declara 262.144 tokens |
| Tipos de cuantizacion | F16 y Q4_K_M (ambos incluidos en el repositorio) |
| Idiomas soportados | No disponible en el repositorio; el modelo base declara soporte para mas de 100 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con llama.cpp) |

Nota sobre la tabla: los valores de contexto e idiomas proceden de la documentacion publica del modelo base y no estan verificados en el repositorio analizado. El autor no publica ficha tecnica propia, fichero de configuracion con hiperparametros ni tabla de capacidades.

## Arquitectura y entrenamiento

No hay informacion sobre entrenamiento en la informacion proporcionada: este repositorio no entrena ningun modelo, solo convierte y cuantiza pesos existentes. La arquitectura corresponde, por tanto, a la del modelo base Qwen3-4B-Instruct-2507, un transformer decoder-only denso. El autor tampoco incluye configuracion de capas, cabezas de atencion ni mecanismos de atencion en la model card.

El unico proceso documentado es la conversion y cuantizacion con llama.cpp, para la que el repositorio incluye un JSON de conversion que registra los comandos y la version de la herramienta empleada. La model card afirma explicitamente que "los pesos de origen fueron modificados localmente antes de la conversion GGUF", pero no especifica la naturaleza de esa modificacion (que podria ser ablacion de direcciones de rechazo, ajuste fino, fusion de pesos u otra). El nombre "heretic" coincide con el de herramientas publicas de abliteracion automatica, pero esta relacion no esta confirmada por el autor en la informacion disponible.

## Capacidades

Las capacidades que se enumeran a continuacion corresponden al modelo base declarado y no han sido verificadas en esta variante concreta; la modificacion de pesos no documentada puede alterarlas.

- Generacion de texto y conversacion multi-turno, con etiqueta de pipeline `text-generation` y caracteristicas conversacionales declaradas.
- Razonamiento y conocimiento general propios de la familia Qwen3-4B-Instruct-2507, variante sin modo de pensamiento explicito (non-thinking).
- Soporte multilingue: el modelo base declara mas de 100 idiomas; no confirmado en este repositorio.
- Posible soporte de tool calling y function calling heredado del modelo base, no documentado ni verificado en esta variante.
- Capacidades de agente y razonamiento multi-paso: no disponibles como dato verificado; dependen del modelo base.
- Capacidades de vision o audio: no disponibles; el modelo base es exclusivamente de texto.
- Modo `thinking`: no disponible; la variante Instruct-2507 del modelo base no emplea modo de razonamiento explicito.

## Casos de uso

- Asistente conversacional local: con la cuantizacion Q4_K_M el modelo ocupa del orden de 2,5 GB de pesos, por lo que puede ejecutarse en un portatil con GPU de 6-8 GB o incluso en CPU mediante llama.cpp, sin enviar datos a servicios externos.
- Generacion de texto en pipelines de documentacion tecnica: redaccion de borradores, resumenes y reformulacion de textos en varios idiomas, aprovechando el soporte multilingue declarado del modelo base.
- Prototipado rapido de aplicaciones de chat: el formato GGUF permite integrarlo en minutos con Ollama o llama-server y exponer una API compatible con OpenAI para pruebas de concepto.
- Clasificacion y extraccion de informacion en texto: uso del modelo como extractor de entidades o etiquetador en flujos por lotes donde el coste por token de las APIs comerciales resulta limitante.
- Educacion y experimentacion en investigacion: estudio comparativo de los efectos de la modificacion de pesos (posible abliteracion) frente al modelo base, midiendo cambios en calidad, coherencia y tasas de rechazo.
- Despliegue en entornos sin conectividad o con requisitos de soberania del dato: sectores con restricciones de transferencia de informacion que necesitan inferencia totalmente on-premise con licencia Apache 2.0.
- Sistemas de atencion al cliente de bajo volumen: respuestas multi-turno con contexto largo, siempre que se valide previamente la calidad de la variante modificada y se implementen filtros de seguridad propios, dado que el proceso de ablacion no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con el modelo base o con alternativas. Tampoco se han publicado mediciones de latencia o throughput.

## Requisitos de hardware

Estimaciones derivadas del numero de parametros declarado (4.022.468.096) y del tamano del repositorio; no son mediciones del autor.

- Pesos en F16: aproximadamente 8,0 GB (2 bytes por parametro). Requiere del orden de 10-12 GB de VRAM para contexto moderado.
- Pesos en Q4_K_M: aproximadamente 2,5 GB. Cabe en GPUs de consumo de 6-8 GB de VRAM con contexto moderado.
- Cache KV: crece de forma lineal con el contexto. Estimando la arquitectura publica del modelo base (36 capas, GQA con 8 cabezas KV y head_dim 128) en FP16, serian aproximadamente 144 KiB por token, es decir unos 4,8 GB a 32.768 tokens y unos 37 GB a 262.144 tokens. Con contextos muy largos el cache KV puede superar el tamano de los propios pesos, por lo que conviene activar cuantizacion del cache KV o limitar la ventana.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y superiores para la variante F16; A100 y H100 para despliegues concurrentes de gran volumen. La cuantizacion Q4_K_M es viable en GTX 1660 6 GB, RTX 3050 8 GB y similares.
- Ejecucion en CPU: posible con llama.cpp y Q4_K_M, con velocidades de decodificacion bajas en procesadores sin aceleracion vectorial amplia.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp y text-generation-webui. vLLM admite GGUF pero recomienda safetensors para maximo rendimiento; TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-heretic-gguf | 4,02 B | No disponible (el base declara 262.144) | GGUF F16 y Q4_K_M | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,0 B | 262.144 tokens segun su documentacion | Safetensors | Apache 2.0 | HuggingFace |
| Qwen3-4B (variante con modo thinking) | 4,0 B | 32.768 tokens nativos, extensible segun documentacion | Safetensors | Apache 2.0 | HuggingFace |
| Llama-3.2-3B-Instruct | 3,2 B | 128.000 tokens segun su documentacion | Safetensors y GGUF comunitarios | Licencia comunitaria Llama 3.2 | HuggingFace |

Los datos de los modelos alternativos proceden de su documentacion publica y no se han verificado en el marco de esta ficha. No hay datos de rendimiento comparado disponibles para ninguna de las filas.

## Limitaciones y advertencias

- Modificacion de pesos no documentada: la model card indica que los pesos fueron alterados localmente, pero no describe el metodo ni su alcance. No es posible evaluar que capacidades se han visto afectadas ni en que medida.
- Posible ablacion de direcciones de rechazo: si la modificacion consiste en abliteration, es previsible que el modelo tenga menos rechazos ante peticiones daninas y que su alineacion de seguridad sea menor que la del modelo base. Esta circunstancia no esta confirmada, pero debe asumirse como riesgo hasta verificarla.
- Riesgo de alucinacion: inherente a los modelos de 4 B de parametros; se acentua en tareas de conocimiento factual denso y en contextos muy largos.
- Degradacion por cuantizacion: la variante Q4_K_M introduce perdida de precision adicional respecto a F16, con impacto tipicamente mayor en tareas de codigo y matematicas.
- Idiomas y contexto: no verificados en este repositorio. Si se requieren contextos cercanos a 262.144 tokens, hay que considerar el coste de memoria del cache KV.
- Ausencia de validacion comunitaria: 0 descargas y 0 valoraciones en el momento de la consulta; no existen evaluaciones independientes de esta conversion.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. Conviene verificar que la licencia del modelo base siga siendo Apache 2.0 en la revision concreta utilizada.
- Uso en produccion: al no existir benchmarks ni evaluaciones de seguridad, se recomienda tratar esta variante como experimental y someterla a evaluacion propia antes de cualquier despliegue.

## Enlaces

- Repositorio del modelo: https://huggingface.co/gabrielmtzcarrillo/qwen3-4b-heretic-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- llama.cpp, herramienta de conversion y cuantizacion empleada: https://github.com/ggml-org/llama.cpp
- Heretic, herramienta publica de ablacion automatica de direcciones de rechazo (posible origen del nombre del repositorio, no confirmado por el autor): https://github.com/p-e-w/heretic
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con este modelo (contenido sobre jailbreaks de ChatGPT, verificacion de telefonos, catalogos de modelos de GitHub Copilot y recuperacion de conversaciones). No se han incorporado por no ser relevantes. No se dispone de paper, blog de anuncio ni demo asociados a esta conversion.
