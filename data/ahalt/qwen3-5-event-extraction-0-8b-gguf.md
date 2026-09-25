# ahalt/qwen3.5-event-extraction-0.8b-GGUF

## Resumen

qwen3.5-event-extraction-0.8b-GGUF es la version cuantizada en formato GGUF del modelo ahalt/qwen3.5-event-extraction-0.8b, un modelo de extraccion de atributos de eventos disenado para NGEC (Next Generation Event Coder), el pipeline que alimenta el conjunto de datos de eventos politicos POLECAT. Lo publica el usuario ahalt y su funcion es concreta: dado un documento y la definicion de un tipo de evento PLOVER, devuelve en JSON el actor, el receptor, la fecha, el lugar y una cita ancla textual para cada instancia de ese tipo de evento presente en el texto.

El modelo parte de un checkpoint de la familia Qwen3.5 (el mas pequeno, 0.8B) y se ha ajustado especificamente para esta tarea de extraccion estructurada. Con 772.845.888 parametros y un unico archivo Q8_0 de 834 MB, su interes practico esta en que se ejecuta en CPU con llama.cpp sin necesidad de GPU: en un Intel i9-12900K con 8 hilos procesa un documento en 3,9 segundos de media y consume unos 2,5 GB de memoria.

Es relevante porque demuestra que la extraccion de eventos a escala, una tarea clasica de las ciencias sociales computacionales, se puede resolver con un modelo de menos de mil millones de parametros cuantizado a 8 bits, manteniendo el rendimiento del modelo sin cuantizar (74,3 de F1 medio frente a 73,6) y abaratando el coste de anotar corpus completos. La licencia Apache 2.0 y el formato GGUF facilitan su integracion en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivado de Qwen3.5-0.8B; detalles especificos no disponibles en la informacion proporcionada |
| Parametros totales | 772.845.888 (aproximadamente 0,77 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible; la guia de despliegue del autor usa `-c 8192` |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado); pesos de origen en bf16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, generado a partir de los pesos bf16 del modelo base |

## Arquitectura y entrenamiento

El modelo base ahalt/qwen3.5-event-extraction-0.8b es un ajuste del checkpoint Qwen3.5-0.8B orientado a extraccion de atributos de eventos dentro del pipeline NGEC. La model card no detalla la composicion del dataset de ajuste, el numero de tokens utilizados ni si hubo etapas de RLHF o DPO, por lo que esos datos no estan disponibles. La familia Qwen3.5 se describe publicamente como una serie de modelos abiertos con mejoras en razonamiento y seguimiento de instrucciones respecto a Qwen3; el checkpoint de 0.8B es el mas pequeno de la serie y esta pensado para prototipado, ajuste especifico de tareas e investigacion.

La innovacion tecnica relevante de este repositorio no esta en la arquitectura, sino en el proceso de cuantizacion y en la validacion de que esta no degrada la calidad. El archivo se genero desde los pesos bf16 con `convert_hf_to_gguf.py --outtype f16` y despues `llama-quantize ... Q8_0`, usando el commit `60081bb` de llama.cpp (18 de septiembre de 2026) y sin matriz de importancia. A pesar de esa ausencia, la evaluacion sobre un subconjunto de 100 documentos del conjunto de test VOA de 500 documentos dio un F1 medio de 74,3 para el GGUF cuantizado, frente a 73,6 del modelo sin cuantizar ejecutado en GPU.

## Capacidades

- Extraccion de atributos de eventos: para cada instancia de un tipo de evento PLOVER en un documento, devuelve actor, receptor, fecha, lugar y cita ancla.
- Salida estructurada en JSON, lista para consumo programatico directo.
- Condicionamiento por definicion de tipo de evento: el prompt incluye la definicion correspondiente (helpers `system_message`, `user_message` y `definitions` del modelo base).
- Generacion en modo no-thinking: el uso probado emplea `enable_thinking=False`.
- Decodificacion greedy determinista, con parada en `<|im_end|>` y `n_predict` de 768 en el ejemplo del autor.
- Ejecucion en CPU mediante llama.cpp, sin aceleracion por GPU.
- Idioma: unicamente ingles. No se documenta soporte multilingue.
- No se documenta soporte de tool calling ni function calling.
- No se documenta uso agentico ni razonamiento multi-paso mas alla del propio flujo de extraccion.
- No se documentan capacidades de vision ni de audio en este checkpoint concreto (aunque la familia Qwen3.5 se describa como multimodal en su conjunto).

## Casos de uso

- Codificacion de eventos a escala para datasets politicos: integrado en NGEC, permite transformar grandes volumenes de noticias en registros estructurados de eventos (tipo, actor, receptor, fecha, lugar) que alimentan POLECAT y otros corpus de ciencia politica.
- Ciencias sociales computacionales: anotar automaticamente corpus de prensa para estudios de protestas, conflictos o violencia politica, reduciendo el coste de la anotacion manual y manteniendo un formato consistente.
- Monitorizacion de medios en tiempo casi real: al correr en CPU con 3,9 segundos por documento en el hardware citado, se puede desplegar en un servidor sin GPU para procesar flujos continuos de despachos de agencias.
- Prefiltrado antes de un modelo mayor: usar el modelo de 0.8B para extraer candidatos y reservar un LLM de mayor tamano unicamente para la validacion o el refinamiento de los casos ambiguos.
- Despliegue en entornos aislados o sin GPU: al ocupar 834 MB en disco y unos 2,5 GB de memoria, es viable en maquinas de oficina, portatiles o entornos air-gapped donde no se dispone de aceleradores.
- Construccion de pipelines reproducibles de extraccion: el caracter determinista de la decodificacion greedy y la fijacion de versiones de llama.cpp permiten reproducir exactamente los resultados de un experimento academico.
- Anotacion asistida para equipos de investigacion: generar una primera pasada de extraccion que los anotadores humanos revisan, acelerando la creacion de conjuntos dorados.
- Extraccion de citas ancla para verificacion: la cita textual devuelta por el modelo permite auditar rapidamente si la extraccion esta respaldada por el documento original.

## Benchmarks y rendimiento

| Evaluacion | Este modelo (Q8_0, CPU) | Modelo sin cuantizar (bf16, GPU) |
|---|---|---|
| F1 medio, extraccion de atributos de eventos, subconjunto de 100 documentos del test VOA (500 documentos) | 74,3 | 73,6 |
| Tiempo por documento (Intel i9-12900K, 8 hilos) | 3,9 s de media; percentil 90 de 5,6 s | No disponible |
| Memoria utilizada en CPU | Aproximadamente 2,5 GB | No disponible |

Los valores comparados no son estrictamente equivalentes entre si, ya que el modelo cuantizado se evaluo sobre un subconjunto de 100 documentos y el sin cuantizar sobre otro entorno de ejecucion. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales para este modelo.

## Requisitos de hardware

- Almacenamiento: 834 MB para el unico archivo GGUF Q8_0.
- Memoria en CPU: aproximadamente 2,5 GB durante la inferencia, segun la medicion del autor.
- VRAM estimada para GPU: al tratarse de un modelo de 0,77B en Q8_0, se puede inferir en cualquier GPU consumer con 4 GB o mas de VRAM; el modelo base en bf16 ocuparia en torno a 1,6 GB. Cabe en RTX 3060, RTX 4060, RTX 4090, A100, H100 y similares sin problema, aunque su orientacion principal es CPU.
- CPU: probado en Intel i9-12900K con 8 hilos. El autor advierte que fijar el numero de hilos al numero de nucleos de rendimiento mejora el rendimiento; dejar que la libreria use todos los nucleos lo empeora notablemente.
- Rendimiento medido: 3,9 segundos por documento de media (percentil 90 de 5,6 segundos) en el hardware citado, equivalente a unas 0,26 extracciones por segundo.
- Opciones de despliegue: llama.cpp mediante `llama-server`; el autor propone `llama-server -m qwen3.5-event-extraction-0.8b-Q8_0.gguf --port 8080 -c 8192 -t 8`. La plantilla de chat esta embebida en el GGUF, por lo que el endpoint `/v1/chat/completions` deberia funcionar pasando `"chat_template_kwargs": {"enable_thinking": false}`, aunque esa ruta no se ha verificado frente al renderizado en Python. El endpoint probado es `/completion`.
- Otras opciones: al ser formato GGUF, es compatible en principio con el ecosistema llama.cpp, incluido Ollama; esta compatibilidad concreta no esta verificada en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ahalt/qwen3.5-event-extraction-0.8b-GGUF (este) | 772.845.888 | GGUF Q8_0 | Extraccion de atributos de eventos para NGEC | Apache 2.0 | Hugging Face, 0 descargas |
| ahalt/qwen3-event-extraction-exp5.1-GGUF | No disponible | GGUF Q8_0 | Extraccion de atributos de eventos para NGEC | No disponible | Hugging Face |
| ahalt/qwen3-event-extraction-exp5.1 | No disponible | No disponible | Extraccion de atributos de eventos para NGEC | No disponible | Hugging Face |
| Qwen3.5-0.8B (modelo base de la familia) | 0,8 mil millones | No disponible | Modelo generalista de proposito multiple | No disponible | Hugging Face, Ollama, Qualcomm AI Hub |

No se dispone de datos de rendimiento comparables entre el modelo exp5.1 y este checkpoint, por lo que no es posible establecer cual de las dos versiones obtiene mejor F1. Los repositorios exp5.1 corresponden a iteraciones previas de la misma tarea.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada. Al trabajar sobre texto periodistico en ingles, puede heredar los sesgos de cobertura de las fuentes utilizadas.
- Riesgo de alusionacion: la extraccion de citas ancla puede producir fragmentos que no aparezcan literalmente en el documento; se recomienda verificar la cita contra el texto original antes de usarla.
- Tasa de error: un F1 medio de 74,3 implica que en torno a una cuarta parte de las extracciones no coinciden con la referencia; para usos criticos hace falta revision humana o un paso de validacion adicional.
- Limitacion de idioma: el modelo solo declara soporte de ingles (en). No hay evidencia de funcionamiento en castellano u otros idiomas.
- Limitacion de contexto: la guia de despliegue usa 8192 tokens de contexto, pero no se especifica la longitud maxima soportada por el modelo base; documentos mas largos requeriran troceado.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar los avisos de licencia y atribucion.
- Verificacion incompleta: la ruta de `/v1/chat/completions` con `chat_template_kwargs` no ha sido contrastada con el renderizado en Python; las cifras publicadas corresponden al endpoint `/completion`.
- Reproducibilidad de la cuantizacion: no se uso matriz de importancia, por lo que los resultados dependen del commit concreto de llama.cpp (`60081bb`) empleado.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.
- Sobre el uso en CPU: el rendimiento depende mucho de la configuracion de hilos; una configuracion incorrecta puede degradar notablemente la velocidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ahalt/qwen3.5-event-extraction-0.8b-GGUF
- Modelo base: https://huggingface.co/ahalt/qwen3.5-event-extraction-0.8b
- Iteracion previa (GGUF): https://huggingface.co/ahalt/qwen3-event-extraction-exp5.1-GGUF
- Iteracion previa: https://huggingface.co/ahalt/qwen3-event-extraction-exp5.1
- Proyecto NGEC (Next Generation Event Coder): https://github.com/ahalterman/NGEC-2025
- Qwen3.5-0.8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_0_8b
- Qwen3.5 0.8B en Ollama: https://ollama.com/library/qwen3.5:0.8b
- Referencia del modelo Qwen3.5-0.8B: https://portpowered.github.io/ai-model-reference/docs/models/qwen3-5-0-8b
