# eric-hugging-crazy/qwen3.5-2b-doc-extraction-br-lora

## Resumen

El modelo `qwen3.5-2b-doc-extraction-br-lora` es un ajuste fino mediante QLoRA del modelo base Qwen/Qwen3.5-2B, desarrollado por el usuario Eric (eric-hugging-crazy) y publicado bajo licencia Apache 2.0. Su proposito es convertir documentos financieros brasileños —boletos bancarios, DANFE (la representacion impresa de una NF-e) e informes de rendimientos— en JSON estructurado con el formato que espera la aplicacion doc-extraction-copilot. El modelo esta especializado en portugues de Brasil y en un conjunto acotado de plantillas documentales.

Se trata de un adaptador LoRA sobre las capas de lenguaje (no sobre las capas de vision, segun la model card), entrenado durante 145 pasos en unos 20 minutos sobre una NVIDIA GeForce RTX 4060 Ti. El autor reporta una precision del 99,7% en los campos de su conjunto de evaluacion de 36 documentos, frente al 7,3% del modelo base, aunque advierte que el entrenamiento y la evaluacion comparten generador y plantillas, por lo que el rendimiento en maquetaciones no vistas sera previsiblemente inferior.

Es relevante como ejemplo de ajuste fino ligero y barato para una tarea de extraccion de campos muy delimitada, con un modelo de 2B parametros que puede ejecutarse en hardware de consumo. No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no declara pipeline y el tamaño del repo (0,1 GB) es coherente con un adaptador LoRA, no con pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-2B; el adaptador es un LoRA/QLoRA sobre las capas de lenguaje) |
| Parametros totales | no disponible (modelo base de 2B parametros segun su denominacion; el adaptador LoRA no declara numero de parametros) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 disponible en la variante GGUF publicada (`qwen3.5-2b-doc-extraction-br-GGUF:Q8_0`); el adaptador se distribuye en safetensors |
| Idiomas soportados | portugues (pt), segun la model card; entrenado con documentos de Brasil |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); GGUF en el repositorio derivado |

## Arquitectura y entrenamiento

El modelo es un adaptador QLoRA aplicado sobre Qwen/Qwen3.5-2B. La model card indica explicitamente que el ajuste se realizo sobre las capas de lenguaje, no sobre las de vision, pese a que las etiquetas del repositorio incluyen `vision`. El entrenamiento se llevo a cabo con Unsloth (etiqueta `unsloth`) durante 145 pasos, con una duracion de aproximadamente 20 minutos en una NVIDIA GeForce RTX 4060 Ti. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La tarea de entrenamiento es de extraccion de campos a JSON a partir de documentos financieros brasileños (boleto, DANFE, informe de rendimientos). El conjunto de evaluacion consta de 36 documentos generados con el mismo generador y las mismas plantillas que el conjunto de entrenamiento, lo que constituye una limitacion de generalizacion reconocida por el propio autor. El pipeline de entrenamiento esta documentado en el repositorio doc-extraction-finetune y la aplicacion consumidora en doc-extraction-copilot.

## Capacidades

- Extraccion de campos estructurados a JSON a partir de documentos financieros brasileños: boleto, DANFE (impresion de NF-e) e informe de rendimientos.
- Salida en el esquema JSON que espera la aplicacion doc-extraction-copilot.
- Procesamiento de documentos en portugues de Brasil.
- Capacidad de vision heredada del modelo base Qwen3.5-2B, aunque el adaptador no ajusta las capas de vision segun la model card.
- No se documenta soporte de tool calling ni de function calling en la informacion disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso en la informacion disponible.
- No se documenta modo de razonamiento (thinking mode), audio ni otras capacidades especiales.

## Casos de uso

- Extraccion de datos de boletos bancarios: el modelo convierte un boleto en JSON con los campos que espera la aplicacion, lo que permite automatizar la conciliacion de pagos en un flujo de cuentas por pagar. Es adecuado porque fue entrenado especificamente con esa plantilla.
- Digitalizacion de DANFE para registro de facturas: a partir de la representacion impresa de una NF-e, el modelo genera el JSON con los campos fiscales, reduciendo la introduccion manual en sistemas de gestion fiscal.
- Procesamiento de informes de rendimientos para declaracion de impuestos: el modelo extrae los campos del informe y los entrega estructurados, lo que facilita la carga en herramientas de contabilidad personal.
- Validacion con digitos de control: segun la model card, la aplicacion consumidora verifica los digitos de control y marca los campos erroneos, de modo que el modelo puede integrarse en un pipeline con validacion posterior y revision humana solo de los campos marcados.
- Prototipado rapido en hardware de consumo: al haberse entrenado en una RTX 4060 Ti en 20 minutos, el mismo enfoque es replicable para nuevas plantillas documentales con coste muy bajo.
- Despliegue local con Ollama: la variante GGUF Q8_0 permite ejecutar el modelo en estaciones de trabajo sin GPU de datacenter, util para oficinas con requisitos de privacidad sobre documentos financieros.
- Extraccion por lotes en un backend de contabilidad: el modelo puede procesar volumenes de documentos con un modelo de 2B parametros, con menor coste por documento que alternativas de mayor tamano, siempre que las plantillas coincidan con las de entrenamiento.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo base (Qwen3.5-2B) |
|---|---|---|
| Precision de campos en el conjunto de evaluacion del autor (36 documentos) | 99,7% | 7,3% |

No se han publicado en la informacion disponible resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros). La unica metrica reportada es la precision de campos sobre el conjunto de evaluacion propio del autor, generado con las mismas plantillas que el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo base de 2B parametros, la variante GGUF Q8_0 es ligera y cabe con holgura en GPUs de consumo, aunque no se publican cifras exactas.
- GPU de entrenamiento reportada: NVIDIA GeForce RTX 4060 Ti (145 pasos, aproximadamente 20 minutos).
- GPU recomendadas para inferencia: no disponibles en la informacion proporcionada; por tamano del modelo base, cualquier GPU de consumo reciente es suficiente en la practica, pero el autor no lo especifica.
- Cabe en GPU de consumo: si, segun el hardware de entrenamiento reportado y la publicacion de una variante GGUF Q8_0.
- Opciones de despliegue: Ollama mediante `ollama pull hf.co/eric-hugging-crazy/qwen3.5-2b-doc-extraction-br-GGUF:Q8_0`; el adaptador en safetensors puede cargarse con las librerias habituales de PEFT, aunque no se detalla en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-2b-doc-extraction-br-lora | 2B (base) + adaptador LoRA | no disponible | Extraccion de documentos financieros brasileños | Apache 2.0 | Hugging Face, GGUF en Ollama |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | Proposito general | no disponible en la informacion proporcionada | Hugging Face |
| Alternativas de extraccion documental de proposito general | no disponible | no disponible | Extraccion documental | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos comparables de la misma categoria, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Sobreajuste a plantillas: el entrenamiento y la evaluacion usan documentos del mismo generador y las mismas plantillas, por lo que el autor advierte que el rendimiento en maquetaciones no vistas sera inferior al 99,7% reportado.
- El 99,7% de precision se mide en 36 documentos de evaluacion; es una muestra pequeña y no representa un benchmark independiente.
- El modelo sigue cometiendo errores en algunos campos; la model card indica que los digitos de control de la aplicacion detectan los dos campos erroneos, lo que implica que la validacion externa es parte necesaria del flujo.
- Ambito linguistico restringido al portugues de Brasil y a documentos financieros brasileños; no se documenta rendimiento en otros idiomas ni en otros tipos de documento.
- Aunque las etiquetas incluyen `vision`, el adaptador se entrena solo sobre las capas de lenguaje, por lo que la calidad de lectura de imagenes depende del modelo base y no del ajuste.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni evaluaciones de seguridad en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las condiciones del modelo base Qwen/Qwen3.5-2B, cuyos terminos no se detallan en la informacion proporcionada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta y sin pipeline declarado; no hay evidencia de uso en produccion por terceros.
- Para produccion se recomienda validacion de campos y revision humana, dado el caracter financiero y fiscal de los documentos procesados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eric-hugging-crazy/qwen3.5-2b-doc-extraction-br-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de la aplicacion consumidora: https://github.com/Eric-Souza/doc-extraction-copilot
- Repositorio del pipeline de entrenamiento: https://github.com/Eric-Souza/doc-extraction-finetune
- Variante GGUF (referenciada en la model card): hf.co/eric-hugging-crazy/qwen3.5-2b-doc-extraction-br-GGUF
