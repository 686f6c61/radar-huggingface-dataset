# florianvoss/Qwen3-4B-Instruct-2507-GPTQ-a16w4

## Resumen

`florianvoss/Qwen3-4B-Instruct-2507-GPTQ-a16w4` no es un modelo entrenado desde cero, sino un artefacto compilado del modelo Qwen3-4B-Instruct-2507 para el acelerador SiMa Modalix, distribuido dentro de la coleccion Neat 0.6.0 del mismo autor. El punto de partida es `simaai/Qwen3-4B-Instruct-2507-GPTQ-Safetensors`, una version precuantizada en GPTQ (activaciones de 16 bits, pesos de 4 bits) del checkpoint instruct de Qwen, y el resultado es un paquete de binarios ELF y assets de runtime ejecutables con la libreria `llima` sobre hardware Modalix.

El interes practico es acotado pero claro: permite evaluar el modelo de 4.000 millones de parametros de Qwen en un SoC de inferencia en el borde sin pasar por el proceso de compilacion, que requiere el Model Compiler de SiMa y 16 procesos paralelos. La compilacion fija la ventana de contexto en 4.096 tokens y conserva los grupos de cuantizacion y las excepciones de precision mixta del modelo fuente.

Conviene subir con expectativas realistas: el repositorio tiene 0 descargas y 0 likes, la model card declara explicitamente que no se han realizado mediciones de precision ni de rendimiento en Modalix, y el propio autor indica que el artefacto solo ha pasado validacion de compilacion completa y despliegue local con verificacion de checksums.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), compilado a ModelGraph para SiMa Modalix |
| Parametros totales | 4.000 millones (heredados del modelo base Qwen3-4B-Instruct-2507) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (fijada en la compilacion; tamano de grupo de prefill: 128) |
| Tipos de cuantizacion | GPTQ a16w4 (activaciones BF16, pesos INT4); embeddings y KV cache en INT8; grupos de cuantizacion y excepciones de precision mixta preservados del modelo fuente |
| Idiomas soportados | No disponible en los metadatos del repositorio; la ficha de Qualcomm AI Hub describe el modelo base como multilingue |
| Licencia | Apache 2.0 (se aplican los terminos del modelo fuente Qwen3-4B-Instruct-2507) |
| Formato de pesos | Binarios ELF compilados (179 ejecutables) + `devkit/` con assets de runtime; el fuente es safetensors GPTQ |
| Libreria de despliegue | `llima` (runtime LLiMa sobre Modalix) |
| Tamano del repositorio | 5,0 GB |
| Fecha de creacion | 2026-10-18 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507: un transformer decoder-only de 4.000 millones de parametros, ajustado unicamente con entrenamiento instruct y sin modo de razonamiento extendido (thinking mode), a diferencia de la variante Qwen3-4B base. No hay informacion en las fuentes disponibles sobre el numero de tokens de entrenamiento, la composicion del corpus ni las etapas de RLHF o DPO empleadas por Qwen.

Lo relevante tecnicamente de este repositorio es la cadena de compilacion. El modelo fuente precuantizado se traduce a un ModelGraph nativo mediante el Model Compiler de SiMa, con 16 procesos paralelos y un hilo de simulador por proceso, y con comparticion de filtros activada por defecto para los componentes de lenguaje. La compilacion fija el contexto maximo en 4.096 tokens y el tamano de grupo de prefill en 128, y segun la model card tambien selecciona las resoluciones de imagen soportadas, un parametro que parece generico del compilador, ya que el `pipeline_tag` del modelo fuente es `text-generation`. El paquete resultante incluye `compile.sh` con la descarga del fuente y los argumentos completos de compilacion, y `compilation.json` con las revisiones del fuente y del compilador.

## Capacidades

- Generacion de texto y comprension del lenguaje: es la funcion principal del checkpoint, con el pipeline declarado como `text-generation`.
- Codigo y matematicas: la documentacion del modelo base en Qualcomm AI Hub lo describe como competente en generacion de codigo y resolucion de problemas matematicos.
- Multilingue: el modelo base se presenta como multilingue en la ficha de Qualcomm; esta compilacion no declara la lista concreta de idiomas.
- Ausencia de modo thinking: la variante Instruct-2507 solo incluye entrenamiento instruct, sin razonamiento extendido, lo que reduce latencia a costa de capacidad de razonamiento multi-paso.
- Tool calling y function calling: no documentado en la informacion disponible para esta compilacion; dependeria del runtime LLiMa y del chat template empaquetado en `devkit/`.
- Capacidades de agente: no documentadas en el repositorio.
- Vision y audio: no disponibles; el modelo fuente es exclusivamente de texto.
- Ventana efectiva limitada a 4.096 tokens, muy por debajo de la del checkpoint original.

## Casos de uso

- Asistente conversacional on-device: el modelo cabe en el paquete de 5 GB y se ejecuta sobre Modalix con el runtime LLiMa, lo que permite desplegar un asistente local sin enviar texto a la nube. Adecuado cuando la privacidad del usuario es requisito y las conversaciones no superan los 4.096 tokens.
- Clasificacion y extraccion de informacion en el borde: procesamiento de tickets, correos o formularios en el propio dispositivo, con salida estructurada generada por el modelo. La ventana de 4K cubre la mayoria de documentos de una sola pagina.
- Generacion de codigo asistida en entornos sin conectividad: autocompletado y explicacion de fragmentos en IDE locales o entornos air-gapped, aprovechando el rendimiento declarado del base en tareas de codigo.
- Moderacion de contenido local: clasificacion de mensajes en aplicaciones de mensajeria o foros desplegadas en hardware empotrado, con latencia predecible y sin coste por token.
- Automatizacion documental en dispositivos industriales: resumen y reescritura de partes de incidencia o manuales en equipos de campo, donde no hay GPU disponible y el consumo energetico esta restringido.
- Prototipado de pipelines de inferencia en el borde: validacion de la cadena fuente GPTQ, compilacion con Model Compiler y despliegue con LLiMa antes de invertir en modelos mayores o en optimizaciones adicionales.
- Evaluacion comparativa de cuantizacion: util para medir la perdida de calidad de un esquema a16w4 con embeddings y KV cache en INT8 frente al checkpoint BF16 original en tareas concretas del dominio propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el proceso de subida no realiza mediciones de precision ni de rendimiento en Modalix, y se limita a confirmar que la compilacion completa y el despliegue local finalizaron correctamente y que los ficheros subidos se verificaron por checksum.

| Metrica | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Latencia en Modalix | No disponible |
| Throughput en Modalix | No disponible |

## Requisitos de hardware

- VRAM: no aplica en el sentido habitual; el destino es el acelerador SiMa Modalix, no una GPU. El repositorio ocupa 5,0 GB e incluye 179 ejecutables ELF.
- GPU: este artefacto no se ejecuta en A100, H100 ni RTX 4090. Para GPUs hay que usar el modelo fuente `simaai/Qwen3-4B-Instruct-2507-GPTQ-Safetensors` o el checkpoint original de Qwen.
- Hardware de referencia: SiMa Modalix con un runtime LLiMa compatible con la version usada en la compilacion; se requiere ademas un entorno de Model Compiler equivalente solo si se quiere recompilar.
- Cabe en GPU de consumo: si, la version fuente de 4B en 4 bits ocupa del orden de 2 a 3 GB, por lo que cabe en tarjetas de 8 GB o superiores (estimacion aritmetica a partir del numero de parametros, no un dato publicado para este repositorio).
- Opciones de despliegue: `llima run ./Qwen3-4B-Instruct-2507-GPTQ-a16w4` segun la model card. Para GPU, vLLM, llama.cpp, Ollama o TGI sobre el checkpoint Qwen3-4B-Instruct-2507, sin garantia de compatibilidad con este paquete compilado.
- Latencia y throughput: no disponibles. La compilacion fija prefill en grupos de 128, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `florianvoss/Qwen3-4B-Instruct-2507-GPTQ-a16w4` (este) | 4B | 4.096 tokens (compilado) | ELF + `devkit/` para LLiMa | Apache 2.0 | 0 descargas, 0 likes; validado solo en compilacion |
| `simaai/Qwen3-4B-Instruct-2507-GPTQ-Safetensors` | 4B | No disponible en la informacion proporcionada | Safetensors GPTQ | Apache 2.0 (heredada) | Fuente directa de este artefacto; reutilizable fuera de Modalix |
| `Qwen/Qwen3-4B-Instruct-2507` | 4B | No disponible en la informacion proporcionada | Safetensors (BF16) | Apache 2.0 | Modelo oficial, ampliamente desplegable en GPU |
| Qwen3-4B-Instruct-2507 en Qualcomm AI Hub | 4B | No disponible en la informacion proporcionada | Formatos de Qualcomm (QNN/ONNX) | Apache 2.0 | Alternativa de despliegue en el borde para hardware Snapdragon |

La diferencia clave entre las cuatro opciones no es de calidad del modelo, sino de destino de ejecucion: este repositorio es el unico de la lista que produce binarios listos para Modalix, y tambien el unico limitado a 4.096 tokens por construccion.

## Limitaciones y advertencias

- Ventana de contexto reducida a 4.096 tokens, fijada en tiempo de compilacion; no es configurable en runtime sin recompilar.
- Ausencia de modo thinking: el checkpoint Instruct-2507 no soporta razonamiento extendido, lo que penaliza tareas que requieren cadenas de razonamiento largas.
- Portabilidad nula: los 179 ejecutables ELF solo funcionan sobre Modalix con un runtime LLiMa compatible; no se pueden cargar en GPU, CPU generica ni en otras librerias.
- Validacion incompleta: no se han publicado mediciones de precision ni de rendimiento en el hardware destino, solo la confirmacion de que la compilacion y el despliegue local terminaron.
- Riesgo de degradacion por cuantizacion: el esquema a16w4 con embeddings y KV cache en INT8 puede introducir perdida de calidad frente al BF16 original, especialmente en matematicas y en contextos largos. No hay datos que cuantifiquen esa perdida.
- Riesgo de alucinacion: inherente a un modelo de 4B sin modo de razonamiento; en produccion conviene anadir verificacion de salidas y citas de fuentes.
- Idiomas: la lista concreta no esta declarada en el repositorio; el modelo base se describe como multilingue, pero no hay evaluacion por idioma para esta compilacion.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes y una fecha de creacion futura en los metadatos, lo que sugiere que no ha pasado por revision de la comunidad. No usarlo como dependencia critica sin validacion propia.
- Licencia: Apache 2.0 permite uso comercial, pero se aplican los terminos del modelo fuente Qwen3-4B-Instruct-2507, enlazados en la model card; conviene revisarlos antes de redistribuir.
- Soporte de tool calling y de agentes no documentado; si el caso de uso depende de function calling, hay que verificarlo contra el runtime LLiMa antes de disenar la arquitectura.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/florianvoss/Qwen3-4B-Instruct-2507-GPTQ-a16w4
- Coleccion Neat 0.6.0: https://huggingface.co/collections/florianvoss/neat-060
- Modelo fuente precuantizado: https://huggingface.co/simaai/Qwen3-4B-Instruct-2507-GPTQ-Safetensors/tree/b2b2fd29f7da6c550ef18e202a4fa2613081e6af
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/cdbee75f17c01a7cc42f958dc650907174af0554/LICENSE
- README del modelo original: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/README.md
- Ficha en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Implementacion en Qualcomm AI Hub Models (GitHub): https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/qwen3_4b_instruct_2507
- Ficha en The Applied: https://theapplied.co/models/qwen-qwen3-4b-instruct-2507
