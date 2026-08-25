# objectai/obj_v1

## Resumen

obj_v1 es un modelo de vision y lenguaje (VLM) desarrollado por la organización objectai, específicamente afinado mediante LoRA sobre Qwen3-VL-4B-Instruct para extraer datos estructurados de documentos financieros indios. El modelo recibe como entrada la imagen de una página (cheque, extracto bancario, formulario fiscal) junto con un esquema JSON, y devuelve el esquema rellenado con los valores presentes en el documento, marcando como `null` los campos ausentes o ilegibles. Es un checkpoint bf16 plano, resultado de fusionar los adaptadores LoRA con el modelo base, por lo que no requiere pasos extra en la carga.

La relevancia del modelo reside en que resuelve un problema de extracción de información de documentos (document understanding) con una ventana de contexto de 16 384 tokens y un tamaño de 4,4 mil millones de parámetros, lo que permite ejecutarlo en GPUs de consumo como la RTX 4090. Está pensado para integrarse en pipelines de automatización de procesos financieros, donde la precisión y la estructura JSON de salida son críticas. Se distribuye bajo licencia Apache 2.0, igual que el modelo base, y se sirve fácilmente con vLLM en un endpoint compatible con la API de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (basada en Qwen3-VL-4B-Instruct) |
| Parametros totales | 4 437 815 808 (4,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16 384 tokens (configurado en vLLM; el modelo base soporta más, pero el autor recomienda este límite) |
| Tipos de cuantizacion | bf16 (nativo); fp16 recomendado en GPUs previas a Ampere |
| Idiomas soportados | no disponible (entrenado sobre documentos financieros indios, presumiblemente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint bf16 plano) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning LoRA del VLM Qwen3-VL-4B-Instruct, que combina un codificador de vision (ViT) con un decodificador de lenguaje transformer y un adaptador multimodal. El proceso de entrenamiento consistio en un LoRA fine-tuning sobre un conjunto de datos de documentos financieros indios, seguido de un merge de los adaptadores con el modelo base para obtener un checkpoint bf16 estandar. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO; la unica informacion adicional es que la resolucion de entrenamiento fue de 1280x28x28 píxeles (max_pixels = 1 003 520), y que el formato de prompt es estricto: un system prompt fijo, una imagen y dos lineas de texto (`document_type` y `schema`). El modelo no verifica aritmetica; la salida es JSON compacto y solo extrae valores presentes en el documento.

## Capacidades

- Extraccion de datos estructurados de documentos financieros indios: cheques, extractos bancarios, formularios fiscales (form16) y otros.
- Generacion de JSON conforme a un esquema definido por el usuario, con valores `null` para campos ausentes o ilegibles.
- Comprension de imagenes de documentos (document understanding) con resolucion de entrada de hasta 1280x28x28 píxeles.
- Salida en JSON compacto, sin prosa ni explicaciones, apta para consumo directo por sistemas de automatizacion.
- Incluye soporte de clave `extras` en el esquema para recoger valores presentes en la pagina que no fueron solicitados.
- Conversacional: acepta un prompt de sistema y un turno de usuario con imagen y texto (compatible con la API de chat completions de OpenAI).

## Casos de uso

- Procesamiento automatico de cheques bancarios: el modelo extrae monto, beneficiario, fecha y numero de cheque de una imagen, y los devuelve en un JSON que puede alimentar directamente un sistema de conciliacion bancaria.
- Digitalizacion de extractos bancarios: convierte paginas escaneadas de extractos en datos estructurados, permitiendo su importacion en herramientas de contabilidad sin intervencion manual.
- Extraccion de datos de formularios fiscales indios (form16): automatiza la captura de ingresos, deducciones y retenciones para su uso en declaraciones de renta.
- Automatizacion de procesos de KYC (conozca a su cliente): extrae los datos de documentos financieros de clientes (cheques, extractos) para verificar identidad y solvencia en onboarding digital.
- Integracion en pipelines de contabilidad: conectado via vLLM con endpoint OpenAI compatible, el modelo puede recibir imagenes desde una API y devolver JSON para su ingestion en ERP o sistemas de gestion financiera.
- Validacion y reconciliacion de documentos: al devolver solo valores presentes en la pagina, facilita la deteccion de discrepancias entre documentos y bases de datos (por ejemplo, comprobar que el monto de un cheque coincide con el registrado).
- Asistente de extraccion de datos para asesores financieros: permite consultar rapidamente informacion de un documento enviando una imagen y un esquema, sin necesidad de OCR manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona datos de MMLU, HumanEval, GSM8K u otras evaluaciones comparativas. La unica referencia de rendimiento es la indicacion de que los documentos largos (extractos bancarios, form16) generan respuestas de hasta ~2500 tokens, por lo que `max_tokens` debe fijarse por encima de 4096 para evitar truncamiento.

## Requisitos de hardware

- VRAM estimada: minimo 16 GB, recomendado 24 GB para comodidad (según la model card del autor).
- GPU recomendadas: L4, A10G, L40S, A100 o RTX 4090. En T4 se debe usar `--dtype float16`.
- Precision: bf16 nativo en GPUs Ampere o superiores; fp16 para generaciones anteriores.
- Despliegue: vLLM (con configuracion `--max-model-len 16384`, `--limit-mm-per-prompt '{"image":1}'` y `--mm-processor-kwargs '{"max_pixels":1003520}'`); tambien es compatible con la libreria transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para establecer una comparativa cuantitativa. El modelo es un fine-tune de Qwen3-VL-4B-Instruct, que si tiene benchmarks publicos (por ejemplo, MMLU, DocVQA), pero los resultados de este fine-tune no se han reportado. En terminos de parametros y contexto, es comparable a otros VLM de 4B como Qwen2-VL-2B o Phi-3-Vision (4.2B), pero su especializacion en documentos financieros indios es unica y no se puede comparar directamente sin datos. Se recomienda consultar los benchmarks del modelo base para estimar capacidades generales.

## Limitaciones y advertencias

- Entrenado exclusivamente en documentos financieros indios; otros dominios, idiomas o disenos de documentos no han sido probados y pueden producir resultados incorrectos.
- La escritura manuscrita es el caso mas debil, especialmente digitos a baja resolucion; puede fallar en cheques o formularios con caligrafia poco clara.
- El modelo no verifica su propia aritmetica: los totales que deben reconciliarse (por ejemplo, sumas de importes) deben ser validados por el sistema llamador.
- La resolucion de imagen esta fijada en 1280x28x28 píxeles; aumentarla desperdicia KV cache y reducirla hace que la letra pequena sea ilegible, por lo que no se recomienda modificar ese parametro.
- La salida es JSON compacto y no admite prosa ni explicaciones; si se usa con prompts fuera del formato de entrenamiento, la precision cae.
- El contexto maximo configurado es de 16 384 tokens; documentos con mas contenido se truncaran y pueden perder campos.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero el modelo base Qwen3-VL-4B-Instruct tambien es Apache 2.0; no hay restricciones adicionales conocidas.
- Es un modelo reciente (creado en 2026-08-25) sin descargas ni comunidad activa; su adopcion en produccion debe considerar la falta de experiencia acumulada y de soporte externo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/objectai/obj_v1
- Modelo base (Qwen3-VL-4B-Instruct): https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
