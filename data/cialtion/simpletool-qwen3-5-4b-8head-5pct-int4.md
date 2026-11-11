# Cialtion/SimpleTool-Qwen3.5-4B-8Head-5pct-INT4

## Resumen

SimpleTool-Qwen3.5-4B-8Head-5pct-INT4 es un checkpoint derivado de Qwen/Qwen3.5-4B, desarrollado por el usuario Cialtion, especializado en tool calling mediante una arquitectura de ocho cabezas logicas independientes que comparten el backbone del modelo. Cada cabeza genera de forma autorregresiva una parte distinta de la llamada a herramienta: el contenido, el nombre de la funcion y hasta seis argumentos posicionales (arg1 a arg6). El modelo esta cuantizado en INT4 con serializacion AWQ (RTN afin con grupo de 64), mientras que las tensiones no cuantizadas se mantienen en FP16.

El checkpoint corresponde a una fraccion del 5% del schedule de datos de entrenamiento del proyecto SimpleTool (no a una poda del modelo) y fue guardado en el paso 2353, que no es el paso final programado. Incluye el tokenizador entrenado y 17 tokens especiales de apertura, cierre y nulo para las cabezas. El repo ocupa 4,1 GB y declara 4.659.865.088 parametros reales en safetensors.

Su relevancia es acotada pero concreta: propone un esquema de generacion estructurada por cabezas para reducir errores en la seleccion de funcion y en el rellenado de argumentos, un punto critico en agentes que invocan herramientas. La evaluacion publicada es un diagnostico sintetico propio (800 casos bilingues) con un 65,000% de llamadas completas correctas y un 96,875% de acierto en el nombre de funcion, sin benchmarks oficiales tipo BFCL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con cabezas logicas multiples de generacion condicional (8 ramas: content, function, arg1-arg6) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (RTN afin, grupo 64, serializacion AWQ); tensiones no cuantizadas en FP16 |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 (dataset asociado bajo CC BY 4.0) |
| Formato de pesos | safetensors (INT4 en serializacion AWQ) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer decoder-only, y anade un esquema de ocho cabezas logicas que comparten el mismo backbone pero decodifican de forma autorregresiva e independiente. La cabeza `content` genera el contenido textual, la cabeza `function` selecciona la herramienta y las cabezas `arg1` a `arg6` rellenan los argumentos posicionales segun el orden de `properties` del esquema de la herramienta. Las cabezas de argumento no estan condicionadas por la salida recien generada de la cabeza de funcion, y los slots sobrantes se marcan con el token especial `<|null|>`. El checkpoint incorpora 17 tokens especiales de apertura, cierre y nulo, y el tokenizador entrenado.

El entrenamiento se realizo sobre una fraccion del 5% del schedule de datos del proyecto SimpleTool, con un checkpoint guardado en el paso 2353 (no el paso final). No se detalla en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si hubo RLHF o DPO. La innovacion tecnica principal es la decodificacion paralela por cabezas con esquema de argumentos posicionales, que busca garantizar tipos estrictos y valores literales en las llamadas. La evaluacion se midio sobre el checkpoint INT4 con computo FP16, muestreo greedy (temperatura 0, semilla 1107) y un maximo de 128 tokens generados por cabeza activa.

## Capacidades

- Generacion de texto y razonamiento general heredados del modelo base Qwen3.5-4B.
- Tool calling estructurado mediante ocho cabezas: seleccion de funcion y rellenado de hasta seis argumentos posicionales con tipos estrictos.
- Emision de propuestas de llamada en formato OpenAI-compatible mediante el cliente `infer_heads.py` (no ejecuta herramientas).
- Capacidad multilingue limitada a chino e ingles.
- Generacion condicional con marcadores especiales de apertura, cierre y nulo por cabeza.
- No se reportan capacidades de vision, audio, thinking mode explicito ni agente multi-paso en la informacion disponible.

## Casos de uso

- Integracion en agentes de tool calling: el modelo propone llamadas con funcion y argumentos en un unico paso estructurado, lo que reduce el parseo posterior y los errores de formato en pipelines de agentes.
- Validacion de esquemas de herramientas en desarrollo: util para probar contratos de `properties` y `required` antes de desplegar un agente en produccion, gracias a que el orden de propiedades se mapea directamente a arg1-arg6.
- Enrutamiento de funciones en asistentes bilingues chino-ingles: el checkpoint esta entrenado en ambos idiomas y puede seleccionar la herramienta adecuada en conversaciones mixtas.
- Generacion de propuestas de llamada en entornos de solo lectura: el cliente incluido imprime propuestas sin ejecutar herramientas, adecuado para auditoria y revision humana previa.
- Experimentacion academica sobre decodificacion multi-cabeza: sirve como referencia reproducible para estudiar el efecto del orden de propiedades y del prompt en la precision de argumentos.
- Despliegue en hardware modesto: con 4,66B parametros en INT4 y 4,1 GB de repo, cabe en GPUs de consumo para prototipos y pruebas de integracion.
- Evaluacion de robustez en contraargumentos: el diagnostico incluye casos contrafactuales y multi-argumento, util para medir la sensibilidad del modelo a cambios en el esquema.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre SimpleTool Diagnostic 800 (800 casos sinteticos pareados, 400 en chino y 400 en ingles; INT4/FP16, greedy, temperatura 0, semilla 1107, maximo 128 tokens por cabeza, protocolo de prompt `direct`):

| Lote de evaluacion | Llamadas requeridas correctas | Casos |
|---|---:|---:|
| Contrafactual chino | 169 | 200 |
| Contrafactual ingles | 167 | 200 |
| Bilingue dificil | 91 | 200 |
| Multi-argumento bilingue | 93 | 200 |
| **Todas las llamadas requeridas** | **520 (65,000%)** | **800** |
| Solo nombre de funcion | 775 (96,875%) | 800 |

El autor advierte que son puntuaciones de diagnostico sintetico locales, con registros pareados correlacionados y posibles errores residuales en las etiquetas, y que no constituyen un benchmark oficial BFCL ni Mobile Actions ni un benchmark de usuarios en produccion. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB para el checkpoint INT4 (4,1 GB de repo) mas overhead de contexto y KV cache; el computo recomendado es FP16 sobre los pesos INT4.
- GPU recomendadas: no disponibles de forma explicita; por tamano, una RTX 4090 (24 GB) o A100/H100 son suficientes y holgadas para este checkpoint.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores; no confirmado por el autor.
- Opciones de despliegue: se requiere un backend que soporte la arquitectura Qwen3.5/Qwen3.6 y el formato de cuantizacion del checkpoint; el autor incluye `infer_heads.py` como cliente compatible con la API de completions de OpenAI. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no se reclama ningun resultado de latencia ni throughput; el cliente no garantiza una operacion fisica de prefill compartido.
- Nota de computo: para FP8 se recomienda computo BF16; el autor documenta un desbordamiento de intermedios en expertos compartidos con FP8 y computo FP16 en un modelo de 397B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleTool-Qwen3.5-4B-8Head-5pct-INT4 | 4,66B | no disponible | Tool calling multi-cabeza, INT4/AWQ | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Generacion de texto general | no disponible en la informacion | Hugging Face |
| Alternativas de tool calling de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Las puntuaciones publicadas son de un diagnostico sintetico propio, con registros pareados correlacionados y posibles errores residuales en las etiquetas; no equivalen a BFCL, Mobile Actions ni a datos de produccion.
- El checkpoint guardado es el paso 2353, no el paso final programado; puede no representar el mejor estado del entrenamiento.
- El modelo solo cubre chino e ingles; no hay soporte declarado de otros idiomas.
- El orden de `properties` y `required` es critico: cambiar el orden rompe el mapeo a arg1-arg6 y puede invalidar los resultados reportados.
- El protocolo de prompt debe respetarse (`direct` para 0,8B/2B/4B; `empty-think` para 9B y superiores); sustituirlo invalida la comparacion con la puntuacion registrada.
- Las cabezas de argumento no estan condicionadas por la funcion generada, lo que puede producir argumentos incoherentes con la herramienta seleccionada.
- El cliente incluido no ejecuta herramientas; el llamador debe validar las llamadas antes de ejecutarlas.
- Riesgo de alucinacion y sesgos del modelo base no evaluados en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el dataset asociado tiene licencia separada CC BY 4.0 y el modelo base conserva su licencia upstream.
- No se reportan latencia, throughput ni benchmark visual a nivel de release.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cialtion/SimpleTool-Qwen3.5-4B-8Head-5pct-INT4
- Dataset de diagnostico: https://huggingface.co/datasets/Cialtion/SimpleTool-Diagnostic-800
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Contrato de serving: INFERENCE.md (incluido en el repositorio del modelo)
- Cliente de inferencia: infer_heads.py (incluido en el repositorio del modelo)
