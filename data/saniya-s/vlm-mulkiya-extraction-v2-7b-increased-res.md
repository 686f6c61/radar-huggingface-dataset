# Saniya-s/vlm-mulkiya-extraction-v2-7b-increased-res

## Resumen

vlm-mulkiya-extraction-v2-7b-increased-res es un modelo de lenguaje visual (VLM) de 7.000 millones de parametros, desarrollado por Saniya-s como un adaptador LoRA sobre el modelo base Qwen/Qwen2-VL-7B-Instruct. El nombre del modelo sugiere que esta especializado en tareas de extraccion de informacion sobre documentos, probablemente del ambito juridico o administrativo (el termino "mulkiya" hace referencia a documentos de propiedad en el mundo arabe), aunque la model card no especifica el dataset de entrenamiento.

El modelo se publica con licencia Apache 2.0 y esta disponible en formato safetensors dentro de un repositorio de PEFT de 4.9 GB. Al ser un adaptador LoRA, no es un modelo autonomo, sino que requiere cargar el modelo base Qwen2-VL-7B-Instruct junto con los pesos del adaptador para funcionar. Su relevancia radica en que demuestra un caso de uso de extraccion de campos estructurados a partir de imagenes de documentos, una tarea comun en procesos de digitalizacion y automatizacion documental, con un coste de entrenamiento reducido gracias a la tecnica LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-VL-7B-Instruct (transformer multimodal con vision) |
| Parametros totales | 7.000 millones (modelo base) |
| Parametros activos | no disponible (adaptador LoRA) |
| Longitud de contexto | no disponible (la del modelo base Qwen2-VL-7B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) sobre el VLM multimodal Qwen2-VL-7B-Instruct de Alibaba. La arquitectura del modelo base combina un codificador de vision con un transformer de lenguaje, permitiendo procesar tanto texto como imagenes. El adaptador LoRA no modifica los pesos del modelo base, sino que anade matrices de rango bajo en las capas de atencion, lo que reduce drasticamente el numero de parametros entrenables y los requisitos de memoria durante el entrenamiento.

El entrenamiento se realizo sobre un dataset no documentado en la model card. Los hiperparametros indican 5 epocas, un learning rate de 1e-4, batch de entrenamiento de 1 con acumulacion de gradientes de 8 (batch efectivo de 8), optimizador AdamW con betas (0.9, 0.999) y scheduler lineal. La perdida final de validacion fue de 0.0162. No hay informacion sobre el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El nombre "increased-res" sugiere que el modelo fue entrenado o evaluado con resoluciones de imagen superiores a las estandar, lo que puede mejorar la extraccion de texto en documentos con detalle fino.

## Capacidades

- Extraccion de informacion estructurada de documentos visuales: el modelo esta disenado para identificar y extraer campos concretos de imagenes de documentos (probablemente escrituras, certificados de propiedad o formularios).
- Procesamiento multimodal: al heredar la arquitectura de Qwen2-VL-7B-Instruct, puede combinar informacion visual y textual para razonar sobre el contenido de imagenes.
- Conversacion multimodal: soporta interacciones de chat con contexto visual (imagen + texto) gracias al modelo base.
- Generacion de texto: capaz de generar respuestas textuales coherentes en formato conversacional.
- Tool calling y function calling: heredado del modelo base, aunque no se ha verificado en este adaptador.

## Casos de uso

- Automatizacion de procesos de onboarding digital: extraccion de datos de DNI, pasaportes o permisos de conducir escaneados para rellenar formularios de registro de clientes.
- Digitalizacion de archivos de propiedad: extraccion de campos como titular, identificador catastral, superficie o fecha de registro de escrituras de propiedad.
- Verificacion documental en servicios financieros: extraccion de datos de extractos bancarios, facturas o contratos para validacion automatizada de solicitudes de credito.
- Gestion de reclamaciones de seguros: lectura de partes de accidente, presupuestos de reparacion o informes medicos para extraer datos estructurados y agilizar la tramitacion.
- Indexacion de documentos en gestores documentales: extraccion de metadatos (fecha, emisor, numero de referencia) de documentos escaneados para su clasificacion automatica en sistemas de gestion documental.
- Asistentes de atencion al ciudadano: integrado en un chat con capacidad de vision, permite que un usuario envie una foto de un documento y reciba informacion resumida o validaciones de coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de model-index con resultados vacios. Los unicos datos de rendimiento disponibles son las metricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Loss de entrenamiento (final) | 0.0150 |
| Loss de validacion (final) | 0.0162 |

Estos valores de loss son muy bajos, lo que indica que el modelo se ajusta bien a los datos de entrenamiento, pero sin benchmarks estandarizados (como MMLU, DocVQA o FUNSD) no es posible evaluar su rendimiento real en tareas de extraccion de documentos.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA tiene un tamano de 4.9 GB en disco, pero la inferencia requiere cargar el modelo base Qwen2-VL-7B-Instruct completo, que en precision FP16 ocupa aproximadamente 14-16 GB de VRAM. El adaptador LoRA anade unos pocos GB adicionales. Con cuantizacion de 4 bits, el conjunto total puede caber en una GPU de 12 GB.
- GPU recomendadas: para una inferencia comoda con contexto largo, se recomienda una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G). Para produccion con multiples peticiones, A100 40GB o H100 son adecuadas.
- Compatibilidad con GPU de consumo: si, con cuantizacion GGUF/AWQ y un modelo de 7B cuantizado a 4 bits, puede caber en una RTX 3060 de 12 GB o similar.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se convierte el adaptador a formato GGUF), o transformers con PEFT para cargar el adaptador.
- Latencia estimada: no disponible. En una RTX 4090, un modelo 7B multimodal con una imagen de entrada suele generar entre 20 y 40 tokens por segundo, pero no hay datos especificos para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| vlm-mulkiya-extraction-v2-7b-increased-res | 7B (LoRA) | no disponible | Apache 2.0 | Extraccion de documentos |
| Qwen2-VL-7B-Instruct (base) | 7B | 128K tokens | Apache 2.0 | VLM generalista |
| LayoutLMv3 | 125M-568M | 512 tokens | MIT | Comprension de documentos (solo texto, no vision pura) |
| Donut | 200M | 256 tokens | MIT | OCR + comprension de documentos |

No hay datos publicados de rendimiento comparativo de este adaptador frente a estos modelos. El modelo base Qwen2-VL-7B-Instruct tiene resultados publicados en benchmarks como MMMU, DocVQA y ChartQA, pero no se puede asumir que el adaptador mantenga estos rendimientos sin datos propios.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card no describe los datos de entrenamiento, por lo que no se puede evaluar la cobertura de tipos de documentos, idiomas o estilos de escritura.
- Sin benchmarks publicados: no hay resultados de evaluacion en tareas estandarizadas de extraccion de documentos, por lo que no se puede cuantificar su rendimiento relativo.
- Dependencia del modelo base: el rendimiento del adaptador esta limitado por el modelo base Qwen2-VL-7B-Instruct. Errores de alucinacion o de comprension visual del modelo base se transmiten al adaptador.
- Riesgo de alucinacion: en tareas de extraccion, el modelo puede inventar campos que no estan presentes en el documento, especialmente con imagenes de baja calidad o resolucion insuficiente.
- No se ha verificado el uso comercial: aunque la licencia Apache 2.0 permite uso comercial, el adaptador depende de Qwen2-VL-7B-Instruct, que tambien tiene licencia Apache 2.0, por lo que el uso comercial es posible. Sin embargo, se recomienda revisar los terminos de la licencia de los datos de entrenamiento del adaptador, que no se conocen.
- Formato de pesos: el repositorio contiene un adaptador PEFT, no el modelo completo. Para usarlo en produccion, es necesario cargar el modelo base y el adaptador con transformers y PEFT, lo que complica el despliegue en algunos entornos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Saniya-s/vlm-mulkiya-extraction-v2-7b-increased-res
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-7B-Instruct
- Documentacion de Qwen2-VL: no disponible en la informacion proporcionada
- Repositorio de entrenamiento: no disponible
- Demo en linea: no disponible
