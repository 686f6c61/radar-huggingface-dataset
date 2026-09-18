# mradermacher/glm-4-9b-chat-hf-OBLITERATED-i1-GGUF

## Resumen

`mradermacher/glm-4-9b-chat-hf-OBLITERATED-i1-GGUF` es un repositorio de cuantizaciones GGUF generadas por mradermacher a partir de `OBLITERATUS/glm-4-9b-chat-hf-OBLITERATED`, una version "abliterated" (sin mecanismos de rechazo) del modelo conversacional GLM-4-9B-Chat. No se trata, por tanto, de un modelo entrenado desde cero, sino de una cadena de derivacion en tres saltos: GLM-4-9B-Chat original, su variante con la direccion de rechazo ablacionada y, finalmente, los pesos cuantizados en formato GGUF que ofrece este repositorio.

El modelo cuenta con 9.399.951.360 parametros (aproximadamente 9,4 mil millones) segun los metadatos de safetensors del modelo base, y se distribuye exclusivamente en GGUF con cuantizaciones de tipo `i1` ponderadas con imatrix, desde 3,2 GB (IQ1_S) hasta 8,4 GB (Q6_K). El repositorio ocupa 118 GB en total y esta etiquetado como `uncensored`, `abliteration` y `conversational`, con idioma declarado `en`.

Su relevancia es de nicho: interesa a quienes necesitan un modelo de ~9B ejecutable en hardware de consumo y con las capas de rechazo eliminadas, tipicamente para investigacion de seguridad, generacion de datos sinteticos y red teaming. Conviene tener presente que el repositorio no declara licencia, no incluye evaluacion alguna, presenta cero descargas y cero likes en el momento de la consulta, y su utilidad practica depende por completo de la calidad de la ablacion heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada. El modelo base es una variante de GLM-4-9B-Chat (familia GLM-4, transformer decoder denso) segun la denominacion del propio identificador |
| Parametros totales | 9.399.951.360 (dato real de safetensors del modelo base, ~9,4 B) |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE; el modelo base es denso |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF con ponderacion imatrix (`i1`): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K. Existe ademas un set de cuantizaciones estaticas en un repositorio aparte |
| Idiomas soportados | `en` segun las etiquetas y la model card del repositorio. No se documenta soporte adicional |
| Licencia | No disponible |
| Formato de pesos | GGUF (unico formato publicado en este repositorio). Incluye fichero imatrix de 0,1 GB para generar cuantizaciones propias |
| Tamano del repositorio | 118,0 GB |
| Fecha de creacion / actualizacion | 17 de septiembre de 2026 / 17 de septiembre de 2026 (fechas tal como figuran en los metadatos) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura ni el proceso de entrenamiento de este artefacto. Lo que si puede afirmarse con los datos disponibles es la cadena de derivacion: el repositorio cuantiza `OBLITERATUS/glm-4-9b-chat-hf-OBLITERATED`, que a su vez parte de un checkpoint GLM-4-9B-Chat en formato HuggingFace (`-hf`) y le aplica una tecnica de *abliteration*. La abliteration consiste en identificar en el espacio de activaciones la direccion que gobierna las respuestas de rechazo y proyectarla ortogonalmente fuera de los pesos, de modo que el modelo deja de activar ese comportamiento sin necesidad de reentrenamiento.

No se especifica en la ficha cuantas capas fueron intervenidas, que metodo exacto de ablacion se empleo, ni si se realizo algun ajuste posterior para recuperar capacidad. Tampoco hay datos sobre el numero de tokens de entrenamiento del modelo original, la composicion del dataset ni si hubo fases de RLHF o DPO. Como referencia externa a esta ficha, GLM-4-9B-Chat es un transformer decoder denso de la familia GLM-4 de Zhipu AI, pero ese dato no puede verificarse con la informacion aqui disponible y no debe tomarse como especificacion confirmada de este repositorio.

En cuanto al proceso de cuantizacion, si esta documentado: se trata de cuantizaciones `i1` (imatrix), que ponderan la importancia de cada tensor mediante estadisticas de activacion antes de cuantizar. La model card incluye graficos comparativos de perplejidad entre tipos de cuantizacion de baja calidad y advierte explicitamente de que IQ1_S es "para desesperados" y Q2_K_S es de "calidad muy baja".

## Capacidades

- Generacion de texto conversacional multi-turno, que es la funcion declarada por la etiqueta `conversational` del repositorio.
- Generacion de texto sin mecanismos de rechazo: la ablacion elimina la activacion de respuestas de negativa, lo que constituye la caracteristica diferencial del modelo.
- Ejecucion local en hardware de consumo gracias al formato GGUF y al rango de cuantizaciones de 3,2 a 8,4 GB.
- Integracion con endpoints compatibles: la etiqueta `endpoints_compatible` sugiere compatibilidad con APIs tipo OpenAI servidas por runtimes de GGUF.
- Razonamiento, codigo, matematicas y tool calling: no disponibles como capacidades confirmadas en la informacion proporcionada. El modelo hereda lo que ofreciese el checkpoint base, pero no hay verificacion documentada.
- Capacidades multilingues: limitadas a `en` segun la ficha, aunque el modelo base pudiera tener un perfil mas amplio.
- Capacidades multimodales (vision o audio): no disponibles.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Investigacion en seguridad de IA y red teaming: el modelo permite estudiar que ocurre cuando se elimina la capa de rechazo de un modelo alineado, generando y clasificando prompts adversarios sin que el propio modelo se niegue a procesarlos.
- Generacion de datos sinteticos para evaluacion de filtros: se puede emplear para producir grandes volumenes de texto que despues se usan como *input* de clasificadores de contenido, precisamente porque no bloquea la generacion.
- Escritura creativa y narrativa sin restricciones tematicas: autores que trabajan con violencia, terror o tematicas delicadas pueden obtener borradores sin que el modelo interrumpa la generacion, ejecutandolo en local.
- Despliegue local en entornos sin conectividad: con 6,3 GB en Q4_K_M, el modelo cabe en una GPU de 8 GB y permite trabajar en maquinas aisladas donde no se puede llamar a APIs externas.
- Prototipado rapido de asistentes conversacionales: sirve como sustituto economico de un modelo mayor durante el desarrollo de una interfaz o de un *pipeline*, antes de decidir el modelo definitivo de produccion.
- Analisis de textos sensibles en local: al ejecutarse enteramente en la maquina del usuario y no tener telemetria asociada, puede usarse para procesar documentacion confidencial que no deberia salir de la organizacion.
- Estudio de degradacion por cuantizacion: el repositorio ofrece 24 cuantizaciones del mismo checkpoint, lo que lo convierte en un banco de pruebas comodo para medir la perdida de calidad de IQ1 a Q6_K con un modelo de ~9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica para este checkpoint cuantizado, y tampoco se aportan mediciones del modelo ablacionado del que deriva. Cualquier cifra que se cite para este repositorio seria una extrapolacion del GLM-4-9B-Chat original y no reflejaria ni la ablacion ni la cuantizacion.

## Requisitos de hardware

Estimaciones de VRAM para inferencia, calculadas a partir del tamano de cada fichero mas el *overhead* de contexto y del runtime (no son mediciones publicadas):

| Cuantizacion | Tamano | VRAM estimada | Notas |
|---|---|---|---|
| IQ1_S | 3,2 GB | ~4 GB | Calidad muy degradada; la propia ficha la marca "for the desperate" |
| IQ2_M | 4,0 GB | ~5 GB | Aceptable solo si la VRAM es el factor limitante |
| Q3_K_M | 5,1 GB | ~6 GB | Alternativa razonable en GPUs de 6-8 GB |
| IQ4_XS | 5,4 GB | ~6,5 GB | Buen compromiso tamano/calidad |
| Q4_K_S | 5,9 GB | ~7 GB | La ficha lo etiqueta como tamano/velocidad/calidad optimos |
| Q4_K_M | 6,3 GB | ~7,5 GB | Recomendado por el autor; encaja en 8 GB |
| Q5_K_M | 7,1 GB | ~8,5 GB | Requiere 10-12 GB para contexto amplio |
| Q6_K | 8,4 GB | ~10 GB | Practicamente indistinguible del estatico Q6_K |
| FP16 (referencia del base) | ~18,8 GB | ~20-24 GB | No publicado en este repo; calculo teorico |

- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 cubren sin problema de Q3 a Q6. Para FP16 o para *throughput* alto con contexto largo, A100 40/80 GB o H100.
- Cabe en GPU de consumo: si. A partir de Q4_K_M en 8 GB de VRAM y desde IQ1/Q2 en GPUs de 4-6 GB, con contexto reducido.
- Memoria unificada: los equipos Apple Silicon con 16 GB o mas pueden ejecutar Q5_K_M y Q6_K con comodidad mediante llama.cpp o LM Studio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, Jan, text-generation-webui y cualquier runtime con soporte GGUF. La etiqueta `endpoints_compatible` apunta a servidores compatibles con la API de OpenAI. vLLM y TGI tienen soporte limitado o nulo de GGUF, por lo que no son la via natural para estos pesos.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este repositorio.

## Comparativa con modelos similares

Comparativa de categoria (modelos densos de 7-9B ejecutables en local). Los datos de los modelos alternativos provienen de su documentacion publica habitual, no de la informacion proporcionada en esta ficha, y se incluyen solo como referencia de contexto:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| glm-4-9b-chat-hf-OBLITERATED-i1-GGUF | ~9,4 B | No disponible | No disponible | GGUF (24 cuantizaciones i1) | Sin evaluacion publicada, 0 descargas, ablacionado |
| GLM-4-9B-Chat (original) | ~9,4 B | No disponible en esta ficha | Licencia propia de Zhipu AI (no confirmado aqui) | safetensors, GGUF de terceros | Version alineada; es el punto de partida de la ablacion |
| Llama 3.1 8B Instruct | 8,03 B | 128 000 tokens | Licencia comunitaria de Llama 3.1 | safetensors, GGUF | Ecosistema amplio de cuantizaciones, evaluacion publica extensa |
| Gemma 2 9B Instruct | 9,24 B | 8 192 tokens | Terminos de uso de Gemma | safetensors, GGUF | Buen rendimiento en razonamiento, contexto corto |
| Qwen2.5 7B Instruct | 7,6 B | 128 000 tokens | Apache 2.0 | safetensors, GGUF | Licencia permisiva, multilingue |

El rendimiento comparado no puede establecerse: no hay benchmarks disponibles para el modelo objeto de esta ficha.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el repositorio no publica ninguna metrica de calidad, seguridad o utilidad. No hay forma de saber cuanto ha degradado la ablacion las capacidades del modelo.
- Riesgo grave de contenido danino: al eliminar los mecanismos de rechazo, el modelo puede generar contenido ilegal, peligroso o gravemente ofensivo sin filtro. Desplegarlo como servicio publico expone al operador a responsabilidad legal, incluida la normativa europea de IA.
- Alucinacion: sin datos especificos, se asume el comportamiento tipico de un modelo de 9B, con tendencia a inventar hechos, citas y referencias, agravada por las cuantizaciones de baja precision.
- Degradacion por cuantizacion: IQ1_S, IQ1_M, IQ2_XXS y Q2_K estan descritas por el propio autor como de calidad muy baja o "para desesperados". Por debajo de Q4 la perdida de calidad es perceptible.
- Idioma: la ficha declara unicamente `en`. No hay garantia de un rendimiento aceptable en castellano y la evaluacion en otros idiomas requeriria pruebas propias.
- Licencia indeterminada: el repositorio no declara licencia. Ademas, la ablacion sobre un modelo con terminos de uso propios puede entrar en conflicto con esos terminos, por lo que el uso comercial no esta claro y requiere revision legal.
- Riesgo de contaminacion de datos: usar las salidas de este modelo para entrenar otros modelos puede propagar contenido no filtrado y sesgos hacia el modelo descendiente.
- Madurez del artefacto: cero descargas, cero likes y una diferencia de menos de una hora entre creacion y ultima actualizacion. Es un artefacto sin rodaje ni validacion por parte de la comunidad.
- Anomalia en las fechas: los metadatos indican creacion en septiembre de 2026, posterior a la fecha habitual de publicacion de modelos de esta familia. Conviene verificar la procedencia antes de integrarlo en cualquier flujo de trabajo.
- Contexto y KV cache: no se dispone de la longitud de contexto soportada, por lo que no puede planificarse el consumo de memoria en escenarios de contexto largo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/glm-4-9b-chat-hf-OBLITERATED-i1-GGUF
- Modelo base ablacionado: https://huggingface.co/OBLITERATUS/glm-4-9b-chat-hf-OBLITERATED
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/glm-4-9b-chat-hf-OBLITERATED-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#glm-4-9b-chat-hf-OBLITERATED-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/glm-4-9b-chat-hf-OBLITERATED-i1-GGUF/resolve/main/glm-4-9b-chat-hf-OBLITERATED.imatrix.gguf
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion (enlace truncado en la model card): https://gist.github.com
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Las busquedas web realizadas no devolvieron resultados relevantes: unicamente paginas genericas de acceso a servicios de Google, sin relacion con el modelo.
