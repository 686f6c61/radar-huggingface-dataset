# halovat/llama3.2-3b-product-extractor-lora

## Resumen

`halovat/llama3.2-3b-product-extractor-lora` es un adaptador LoRA (QLoRA) afinado sobre `unsloth/Llama-3.2-3B-Instruct-bnb-4bit`, la version cuantizada en 4 bits del modelo instruct de Meta Llama 3.2 de 3.000 millones de parametros. Lo publica el usuario halovat y su proposito es muy concreto: convertir listados de productos ruidosos y multilingues (ingles, ruso y uzbeko) en un objeto JSON estricto de cinco claves (`brand`, `model`, `ram_gb`, `storage_gb`, `price_usd`), sin necesidad de system prompt.

El interes practico esta en el enfoque: en lugar de un modelo grande de proposito general, se ofrece un extractor especializado de 3B parametros que cabe en hardware modesto y que produce salida estructurada directamente. Esto lo hace util para pipelines de scraping, normalizacion de catalogos y enriquecimiento de datos donde la latencia y el coste por token importan.

El repositorio es muy pequeno (0,1 GB), no tiene descargas ni likes en el momento de la consulta y la model card es minima: no documenta regimen de entrenamiento detallado, composicion del dataset ni resultados de evaluacion. La ficha refleja, por tanto, lo que se puede afirmar con rigor y marca explicitamente como no disponible todo lo que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 3B Instruct) con adaptador LoRA; el fine-tuning se realizo con QLoRA sobre el checkpoint base cuantizado en 4 bits |
| Parametros totales | 3.000 millones (modelo base Llama 3.2 3B); el adaptador LoRA anade un numero de parametros no especificado por el autor |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama 3.2 3B Instruct soporta 128.000 tokens, pero el autor no confirma el contexto efectivo tras el fine-tuning) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (precision del adaptador no especificada); el modelo base referenciado esta cuantizado en 4 bits (bnb-4bit). No se publican versiones GGUF ni otras cuantizaciones del adaptador |
| Idiomas soportados | Ingles, ruso y uzbeko segun la model card (idiomas de los listados de entrenamiento); el modelo base soporta ademas los idiomas oficiales de Llama 3.2, pero no hay evaluacion publicada |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador LoRA); requiere cargar el modelo base `unsloth/Llama-3.2-3B-Instruct-bnb-4bit` |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango `r=16` entrenado con QLoRA mediante la libreria Unsloth sobre `unsloth/Llama-3.2-3B-Instruct-bnb-4bit`. La tecnica QLoRA congela los pesos del modelo base cuantizados en 4 bits y entrena unicamente las matrices de baja dimension insertadas en las capas, lo que reduce drasticamente el consumo de VRAM durante el ajuste. El autor indica el uso de *response-only loss masking*, es decir, la perdida se calcula solo sobre los tokens de la respuesta JSON y no sobre el prompt de entrada, practica habitual para tareas de extraccion.

La innovacion principal no es arquitectonica sino de formato de salida: el modelo esta entrenado para emitir un JSON estricto de cinco claves sin system prompt, lo que simplifica el despliegue en produccion (no hay que gestionar plantillas de sistema ni instrucciones largas). No se han publicado datos sobre el numero de ejemplos de entrenamiento, la composicion exacta del dataset, si hubo etapas de RLHF o DPO posteriores, ni hiperparametros mas alla del rango LoRA y la mencion a Unsloth y QLoRA.

## Capacidades

- Extraccion de especificaciones de producto en JSON estricto con cinco claves: `brand`, `model`, `ram_gb`, `storage_gb`, `price_usd`.
- Manejo de entradas ruidosas y multilingues en ingles, ruso y uzbeko.
- Funcionamiento sin system prompt: la instruccion de extraccion esta incorporada en el comportamiento del modelo.
- Relleno de valores ausentes con `null` (segun el esquema de ejemplo de la model card).
- Generacion de texto instruct general heredada del modelo base Llama 3.2 3B Instruct (no evaluada especificamente tras el fine-tuning).
- Soporte de tool calling y function calling: no documentado para este adaptador (el modelo base Llama 3.2 lo soporta, pero el fine-tuning puede haber degradado esta capacidad; no hay datos).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking, vision o audio: no disponibles (Llama 3.2 3B es un modelo solo texto).

## Casos de uso

- Normalizacion de catalogos de e-commerce: ingerir listados heterogeneos de moviles, portatiles o tablets en ingles, ruso o uzbeko y obtener filas estructuradas listas para una base de datos relacional, gracias a la salida JSON fija de cinco claves.
- Pipelines de scraping y enriquecimiento de datos: integrar el adaptador como etapa de post-procesado tras un scraper, de modo que cada anuncio crudo se convierta en un registro con marca, modelo, RAM, almacenamiento y precio en USD.
- Comparadores de precios multilingues: extraer `price_usd` y especificaciones de ofertas en distintos idiomas para alimentar un motor de comparacion, aprovechando que el modelo no requiere system prompt y simplifica la orquestacion.
- Deduplicacion de inventario: usar la salida estructurada para agrupar anuncios que describen el mismo producto con redacciones distintas, normalizando marca y modelo antes de aplicar reglas de coincidencia.
- Extraccion en el borde o en hardware modesto: al ser un adaptador sobre un modelo de 3B en 4 bits, puede desplegarse en GPUs de consumo para procesar lotes de anuncios sin depender de APIs externas.
- Preprocesado para analitica de precios: generar datasets tabulares con `ram_gb`, `storage_gb` y `price_usd` para estudios de evolucion de precios por segmento de dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al cargar el modelo base en 4 bits (`bnb-4bit`) mas el adaptador LoRA, la huella se situa en el orden de 2 a 3 GB para los pesos; el consumo real depende de la longitud de contexto y del tamano de lote. No hay mediciones publicadas por el autor.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM para inferencia comoda con contexto moderado (RTX 3060 Ti, RTX 4060, RTX 4070); para lotes grandes o contextos largos, A100 o H100 no son necesarias dado el tamano del modelo.
- Compatibilidad con GPU de consumo: si, el modelo de 3B en 4 bits esta disenado para caber en GPUs de consumo; el adaptador en si es de 0,1 GB.
- Opciones de despliegue: al ser un adaptador LoRA sobre un checkpoint bnb-4bit, el flujo natural es cargarlo con `transformers` + `peft` + `bitsandbytes`, o fusionarlo con el base y exportarlo a otros formatos. No se han publicado instrucciones para vLLM, llama.cpp, Ollama o TGI; para llama.cpp u Ollama seria necesario fusionar el adaptador y convertir a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `halovat/llama3.2-3b-product-extractor-lora` | 3B (base) + LoRA | no disponible | Extraccion JSON de 5 claves, EN/RU/UZ | llama3.2 | Hugging Face, adaptador safetensors |
| `unsloth/Llama-3.2-3B-Instruct-bnb-4bit` (base) | 3B | 128.000 tokens (segun Llama 3.2) | Instruct general, 4 bits | llama3.2 | Hugging Face |
| `meta-llama/Llama-3.2-3B-Instruct` (original) | 3B | 128.000 tokens | Instruct general | llama3.2 | Hugging Face |
| Modelos de extraccion estructurada de proposito general (p. ej. variantes instruct con salida JSON forzada) | variable | variable | Extraccion JSON mediante prompting o gramaticas | variable | variable |

La ventaja del adaptador frente al base es la salida JSON estricta sin system prompt y el ajuste a tres idiomas concretos; la desventaja es la falta de evaluacion publicada y su especializacion, que lo hace menos adecuado para tareas generales.

## Limitaciones y advertencias

- Esquema fijo de cinco claves: el modelo esta entrenado para un unico formato de salida; cambios en el esquema requieren reentrenamiento o prompting adicional, con riesgo de degradacion.
- Idiomas limitados al entrenamiento: la model card solo menciona ingles, ruso y uzbeko; el rendimiento en castellano u otros idiomas no esta evaluado.
- Riesgo de alucinacion en campos numericos: `ram_gb`, `storage_gb` y `price_usd` pueden rellenarse con valores plausibles pero incorrectos si el listado es ambiguo; se recomienda validacion posterior y reglas de negocio.
- Ausencia de benchmarks: no hay metricas de precision, recall ni exactitud de esquema publicadas, lo que impide estimar la calidad en produccion sin una evaluacion propia.
- Sesgos: no documentados; al heredar el modelo base Llama 3.2, puede arrastrar sesgos de su corpus de entrenamiento, no evaluados en este adaptador.
- Restricciones de licencia: la licencia llama3.2 (Llama 3.2 Community License) impone condiciones de uso comercial y obligaciones de atribucion; conviene revisar los terminos antes de desplegar en producto.
- Dependencia del checkpoint base: el adaptador requiere `unsloth/Llama-3.2-3B-Instruct-bnb-4bit`; no se distribuye un modelo fusionado ni versiones GGUF, lo que anade pasos de integracion.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin issues ni documentacion adicional; el soporte de la comunidad es practicamente inexistente.
- Formato de pesos: solo safetensors del adaptador; no hay garantia de compatibilidad directa con servidores de inferencia de alto rendimiento sin fusion y conversion previas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/halovat/llama3.2-3b-product-extractor-lora
- Modelo base referenciado: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Libreria Unsloth: https://github.com/unslothai/unsloth
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
