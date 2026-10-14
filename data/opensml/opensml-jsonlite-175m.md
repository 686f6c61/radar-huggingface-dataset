# OpenSML/OpenSML-JSONLite-175M

## Resumen

OpenSML JSONLite 175M es un modelo de lenguaje pequeno (175.611.648 parametros) desarrollado por OpenSML (autor indicado en la model card: William Zebrowski) y publicado en HuggingFace. Su tarea es la extraccion de informacion estructurada: recibe un texto fuente y un JSON Schema cerrado y devuelve directamente un unico objeto JSON nativo en una sola generacion autorregresiva. No utiliza ensamblado campo a campo, reparacion de salida ni decodificador restringido; la validacion del esquema se hace a posteriori y no garantiza que los valores extraidos sean correctos.

El modelo es un ajuste fino (finetune) de OpenSML-Base-175M y forma parte de una linea de trabajo "from-scratch" orientada a Apple Silicon: se distribuye en formato MLX y safetensors BF16, con arquitectura propia que requiere el runner incluido en el repositorio en lugar de AutoModel de Transformers o la carga automatica de mlx-lm. Su ventana de contexto es de solo 2.048 tokens compartidos, su vocabulario es un byte-BPE congelado de 32.000 tokens y la salida por defecto se genera con temperatura 0 y un maximo de 256 tokens.

Es relevante para desarrolladores que necesiten extraccion de campos en local, sin conexion y con huella minima (repo de 0,4 GB), asi como para investigadores que estudien post-entrenamiento de modelos diminutos para salidas estructuradas. Sus limitaciones son acusadas: entrenamiento centrado en siete dominios SNIPS y 39 definiciones de campo, soporte unicamente de esquemas planos con tipos cadena, cadena anulable y arrays de cadenas, y ausencia de licencia declarada, lo que bloquea cualquier decision de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only propio (no compatible con carga automatica estandar): 24 capas, hidden 768, FFN 2.048, GQA con 12 cabezas de consulta y 4 cabezas KV, RMSNorm + Q/K norm, SwiGLU, RoPE con base 10.000, embeddings de entrada y salida atados, sin sesgos lineales |
| Parametros totales | 175.611.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens compartidos |
| Tipos de cuantizacion | no disponible; la release se publica unicamente en BF16 sin cuantizar (safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors BF16 sin cuantizar, mas archivo fuente nativo de MLX y tokenizer/configuracion; biblioteca declarada: mlx |

Otros datos de la model card: vocabulario byte-BPE congelado de 32.000 tokens, decodificacion por defecto con temperatura 0, penalizacion de repeticion 1 y maximo de 256 tokens de salida.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 24 capas con anchura oculta de 768 y FFN de 2.048, atencion por consultas agrupadas (GQA) con 12 cabezas de consulta y 4 cabezas KV, normalizacion RMSNorm (con normalizacion adicional en Q y K), activacion SwiGLU y embeddings posicionales rotatorios (RoPE, base 10.000). Los embeddings de entrada y salida estan atados y no hay sesgos en las capas lineales. El vocabulario es un byte-BPE congelado de 32.000 tokens y el contexto maximo es de 2.048 tokens. La arquitectura es personalizada, por lo que el autor indica explicitamente que debe usarse el runner suministrado y no AutoModel de Transformers ni la carga automatica de mlx-lm.

El entrenamiento parte del ancestro preentrenado OpenSML-Base-175M y anade, segun la model card, etapas de QA con evidencia, extraccion exacta de campos, extraccion focalizada y una etapa final de supervision directa sobre JSON. Los datasets citados en las etiquetas del repositorio son HuggingFaceTB/smollm-corpus, HuggingFaceTB/dclm-edu, HuggingFaceFW/finewiki, Avelina/python-edu-cleaned, rajpurkar/squad_v2 y databricks/databricks-dolly-15k. El ajuste se realizo principalmente sobre siete dominios SNIPS y 39 definiciones de campo. Esta release sustituye a unos pesos anteriores basados en extraccion mas ensamblado, que se reemplazan por un finetune nativo de fuente + esquema a JSON. No se detallan en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion porcentual del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de un unico objeto JSON nativo por peticion a partir de un texto fuente y un JSON Schema, sin ensamblador de campos, reparacion de salida ni decodificador restringido.
- Esquemas planos cerrados con `additionalProperties: false` y entre 1 y 8 propiedades obligatorias.
- Tipos soportados: cadenas, cadenas anulables (`["string","null"]`) y arrays de cadenas.
- Copia literal de valores preservando mayusculas, minusculas y ortografia originales; los arrays conservan el orden de aparicion en la fuente.
- Comportamiento definido ante ausencias: los arrays ausentes se devuelven como `[]` y las cadenas anulables ausentes como `null`.
- Acepta nombres de campo y descripciones nuevas en tiempo de inferencia, aunque la extraccion fiable en dominios no familiares no esta establecida.
- Rechazo de entradas demasiado largas sin truncar.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidad multilingue: no disponible (solo ingles).
- Sin modo de razonamiento explicito (thinking mode), sin vision, sin audio y sin salida numerica o booleana verificada.

## Casos de uso

- Extraccion de parametros en comandos de asistente de musica: dada una frase como "Play the track Blue Lantern by Mira Sol" y un esquema con los campos track, artist y album, el modelo devuelve el JSON con los valores copiados literalmente. Es el escenario de referencia verificado por el autor.
- Enriquecimiento de registros desde texto libre: convertir descripciones de tickets, notas de CRM o correos breves en un objeto JSON de campos de cadena, siempre que el contenido quepa en 2.048 tokens y el esquema sea plano.
- Preprocesado en pipelines de ETL y RAG: extraer campos concretos de un pasaje recuperado antes de indexarlo o de pasarlo a un modelo mayor, aprovechando que la inferencia puede ejecutarse sin conexion tras la descarga.
- Respuestas de QA extractiva sobre pasajes cortos: el modelo se entreno tambien con rajpurkar/squad_v2, por lo que puede localizar el fragmento literal que responde a una pregunta y colocarlo en un campo de cadena del esquema.
- Extraccion de listas ordenadas de entidades: cuando el esquema declara arrays de cadenas, el modelo devuelve todos los fragmentos coincidentes en el orden en que aparecen en la fuente.
- Procesamiento local en Apple Silicon: al ser un modelo de 175 M en BF16 y con runner MLX, puede ejecutarse en un portatil Mac sin GPU dedicada y sin enviar datos a servicios externos, util para datos sensibles.
- Prototipado e investigacion en post-entrenamiento: sirve como banco de pruebas reproducible para estudiar como un modelo diminuto entrenado desde cero aprende a producir JSON valido frente a esquemas cerrados.
- Generacion de formularios estructurados en aplicaciones de campo: extraer nombres de productos, personas o lugares de una frase corta dictada o escrita para rellenar un formulario, asumiendo que los valores deben validarse despues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un archivo de resultados (JSONLITE_RESULTS.json) y un registro de verificacion de inferencia (INFERENCE_VERIFICATION.json), pero su contenido no forma parte de la informacion proporcionada. La model card unicamente afirma que cuatro ejemplos de interaccion pasaron la comprobacion de referencia del playground y que sus salidas en crudo coincidieron con el runner MLX independiente; no se aportan cifras de MMLU, HumanEval, GSM8K ni de exactitud agregada de extraccion.

No se dispone tampoco de datos de latencia ni de throughput.

## Requisitos de hardware

- Peso de los pesos en BF16: aproximadamente 351 MB (175.611.648 parametros x 2 bytes), coherente con el tamano de repositorio de 0,4 GB.
- VRAM estimada para inferencia: en torno a 0,5 GB en BF16 contando pesos, cache KV (unos 24 KB por token, alrededor de 49 MB con 2.048 tokens) y activaciones. Las cifras de cuantizacion a 8 bits (aproximadamente 176 MB) o 4 bits (aproximadamente 88 MB) son estimaciones de conversion manual, no releases oficiales.
- GPU recomendadas: no disponible. El autor solo verifica la plataforma Apple Silicon macOS con Python 3.11 y MLX 0.32.3.
- Cabe en GPU de consumo: si, por tamano, pero no hay compatibilidad verificada con CUDA ni con el pipeline estandar de Transformers; el modelo declara MLX como biblioteca.
- Opciones de despliegue: runner MLX propio incluido en el repositorio (`python inference.py`). No es compatible con la carga automatica de mlx-lm ni con AutoModel de Transformers; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparativas oficiales. La siguiente tabla usa datos confirmados de este modelo y referencias generales de categoria para dos alternativas frecuentes de tamano bajo; los datos de las alternativas no estan verificados en la informacion disponible y deben comprobarse antes de usarse.

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenSML JSONLite 175M | 175.611.648 | 2.048 tokens | JSON nativo segun esquema plano | no disponible | HuggingFace, formato MLX + safetensors BF16, runner propio |
| SmolLM2-135M | dato no verificado en la informacion disponible | dato no verificado | texto libre | dato no verificado | dato no verificado |
| Qwen2.5-0.5B | dato no verificado en la informacion disponible | dato no verificado | texto libre | dato no verificado | dato no verificado |

La diferencia funcional relevante frente a modelos pequenos de proposito general es que este modelo esta especializado en la tarea fuente + esquema a JSON y no en generacion abierta, lo que limita su uso fuera de ese contrato. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- La validacion del esquema ocurre despues de la generacion y no puede establecer que los valores extraidos sean correctos; puede producir JSON valido con contenido incorrecto.
- Alucinacion de valores: al copiar de la fuente pero sin decodificacion restringida, no hay garantia formal de que cada campo provenga del texto original, aunque el entrenamiento prioriza la copia literal.
- Sesgo de dominio: el ajuste se hizo principalmente sobre siete dominios SNIPS y 39 definiciones de campo. La extraccion fiable en dominios no familiares no esta establecida, aunque el modelo acepte nombres y descripciones nuevos.
- Contrato de esquema muy estrecho: solo esquemas planos y cerrados, con `additionalProperties: false`, entre 1 y 8 propiedades obligatorias y tipos limitados a cadena, cadena anulable y array de cadenas. Quedan fuera esquemas anidados, salidas numericas o booleanas, enumeraciones, referencias y restricciones avanzadas.
- Sin normalizacion de numeros ni de fechas: los valores se copian tal cual aparecen en la fuente.
- Contexto reducido a 2.048 tokens y rechazo de entradas demasiado largas sin truncado, por lo que no sirve para documentos extensos.
- Idioma: solo ingles declarado.
- Licencia no disponible: no hay permiso explicito de uso comercial, lo que impide adoptarlo en produccion sin aclarar antes las condiciones con el autor.
- Compatibilidad: arquitectura personalizada; no funciona con carga automatica de mlx-lm ni con AutoModel de Transformers, y no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Madurez: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y solo se verifican cuatro ejemplos de interaccion, lo que no constituye evidencia de robustez general.
- Se recomienda anadir validacion y verificacion posteriores propias en cualquier uso en produccion.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/OpenSML/OpenSML-JSONLite-175M
- Modelo base: https://huggingface.co/OpenSML/OpenSML-Base-175M
- Archivos citados en el repositorio: RUN_GUIDE.md, TECHNICAL_REPORT.md, JSONLITE_RESULTS.json, checkpoint_provenance.json, INFERENCE_VERIFICATION.json (referenciados en la model card, sin URL publica confirmada)
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su autor, su informe tecnico ni sus benchmarks; los resultados obtenidos no guardan relacion con el contenido de esta ficha y se descartan.
