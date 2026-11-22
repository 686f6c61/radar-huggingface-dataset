# HarjasSingh/jobparse-qwen2.5-1.5b-lora

## Resumen

`HarjasSingh/jobparse-qwen2.5-1.5b-lora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo instruct `Qwen/Qwen2.5-1.5B-Instruct`, publicado por el usuario HarjasSingh. Su proposito es convertir anuncios de empleo en texto libre a JSON estructurado, extrayendo campos como titulo del puesto, empresa, ubicacion, modalidad de trabajo, seniority, rango salarial y habilidades requeridas.

El adaptador se ha entrenado sobre 1.500 anuncios sinteticos y, segun la model card, alcanza un 100% de exact match en un conjunto de test sintetico retenido, frente al 15,5% del modelo base sin adaptar. El propio autor advierte que los datos sinteticos son mas limpios que las ofertas reales, por lo que la precision en produccion sera previsiblemente inferior.

Es relevante como ejemplo de especializacion barata: un adaptador de unos 0,1 GB sobre un modelo de 1.5B parametros permite resolver una tarea de extraccion estructurada con un coste de inferencia muy bajo. No obstante, el repositorio no incluye pipeline declarado, idiomas, resultados sobre datos reales ni detalles de hiperparametros de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-1.5B-Instruct) con adaptador LoRA entrenado mediante QLoRA |
| Parametros totales | 1.5B en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se carga por separado |

## Arquitectura y entrenamiento

El artefacto publicado no es un modelo completo, sino un adaptador LoRA que se aplica sobre `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only de 1.5B parametros. El entrenamiento se realizo con QLoRA, segun indica la model card, lo que implica cuantizacion del modelo base durante el ajuste y entrenamiento de matrices de bajo rango. No se detallan el rango LoRA, el alpha, la tasa de aprendizaje, el numero de epochs ni la composicion exacta de las matrices adaptadas.

El conjunto de entrenamiento consta de 1.500 anuncios de empleo sinteticos con sus correspondientes salidas JSON. No se especifica el numero de tokens de entrenamiento, la mezcla de datos, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un ajuste supervisado de este tipo). La innovacion principal es la propia especializacion: un adaptador pequeno que fuerza al modelo base a emitir JSON con un esquema fijo de campos (titulo, empresa, ubicacion, modalidad, seniority, salario y skills).

## Capacidades

- Extraccion de informacion estructurada: convierte anuncios de empleo en JSON con los campos titulo, empresa, ubicacion, modalidad de trabajo, seniority, rango salarial y habilidades.
- Generacion de JSON con esquema fijo, orientada a pipelines de parsing automatizado.
- Razonamiento y generacion de texto general heredados del modelo base Qwen2.5-1.5B-Instruct (no evaluados en este adaptador).
- Soporte de tool calling y function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multilingues: no documentadas; la model card no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Parsing de ofertas de empleo en portales de empleo: el adaptador recibe el texto de la oferta y devuelve un JSON con titulo, empresa, ubicacion y skills, lo que permite indexar y filtrar ofertas de forma automatica.
- Normalizacion de datos para agregadores: al extraer modalidad (remoto, hibrido, presencial) y seniority en campos separados, se pueden construir filtros y busquedas facetadas sin post-procesado manual.
- Enriquecimiento de bases de datos de recruiting: convertir descripciones en texto libre en registros estructurados para CRM o ATS, con un coste de inferencia bajo gracias al tamano de 1.5B.
- Extraccion de rangos salariales: el modelo extrae el rango salarial cuando aparece en el anuncio, util para estudios de mercado o comparativas salariales internas.
- Clasificacion de skills para matching candidato-oferta: las habilidades extraidas en JSON pueden alimentar motores de recomendacion o busquedas semanticas.
- Prototipado rapido y pruebas de concepto: al ser un adaptador pequeno sobre un modelo de 1.5B, se puede desplegar en hardware modesto para validar un pipeline de extraccion antes de invertir en modelos mayores.
- Procesamiento por lotes de anuncios historicos: con un modelo de 1.5B es viable procesar grandes volumenes de ofertas en una sola GPU consumer, aunque la precision sobre datos reales debe validarse.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son los siguientes:

| Metrica | Adaptador jobparse | Qwen2.5-1.5B-Instruct base |
|---|---|---|
| Exact match en test sintetico retenido | 100% | 15,5% |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras tareas estandar. Tampoco se han publicado resultados sobre anuncios de empleo reales en la informacion proporcionada; el autor remite al README del proyecto para esos datos, que no se incluye en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en fp16: aproximadamente 3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada con cuantizacion de 8 bits: en torno a 2 GB para pesos; con 4 bits, alrededor de 1-1,5 GB, mas overhead.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 comodo (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090, A10, L4, A100, H100). El adaptador en si ocupa unos 0,1 GB adicionales.
- Cabe en GPU consumer: si, en la mayoria de GPU consumer modernas con 8 GB o mas; con cuantizacion 4 bits puede ejecutarse en GPUs de 4-6 GB.
- Opciones de despliegue: carga mediante `transformers` + `peft` (`PeftModel.from_pretrained`), y servido con vLLM, TGI o llama.cpp/Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF. El repositorio no incluye pipeline declarado, por lo que la integracion requiere codigo manual.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HarjasSingh/jobparse-qwen2.5-1.5b-lora | 1.5B (base) + adaptador LoRA | no disponible | Extraccion de ofertas de empleo a JSON | apache-2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | contexto del modelo base Qwen2.5 (no detallado en la informacion) | Modelo instruct generalista | apache-2.0 | Hugging Face |
| Otros adaptadores LoRA de extraccion estructurada sobre modelos de 1-2B | variable | variable | Extraccion de entidades/JSON | variable | Hugging Face |

No se dispone de datos de rendimiento comparables de terceros en la informacion proporcionada. La comparativa se limita al modelo base y a la categoria generica de adaptadores de extraccion estructurada.

## Limitaciones y advertencias

- El 100% de exact match se ha medido sobre un test sintetico; el propio autor advierte que los datos sinteticos son mas limpios que las ofertas reales y que la precision en el mundo real sera inferior.
- No se han publicado resultados sobre anuncios de empleo reales en la informacion disponible.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar campos o valores (por ejemplo, un salario o una empresa) cuando el anuncio no los contiene; se recomienda validacion posterior del JSON.
- Sesgos: no documentados; el entrenamiento con datos sinteticos puede no reflejar la diversidad de redacciones, idiomas y formatos de ofertas reales.
- Limitaciones de idioma: la model card no declara idiomas soportados; no se puede asumir cobertura multilingue.
- Limitaciones de contexto: no se especifica la longitud maxima de anuncio soportada; los anuncios muy largos pueden truncarse segun la configuracion del modelo base.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero deben respetarse tambien las condiciones del modelo base Qwen2.5-1.5B-Instruct.
- Para produccion: el repositorio tiene 0 descargas y 0 likes, no declara pipeline y no incluye detalles de hiperparametros ni del esquema JSON exacto; conviene auditar el adaptador antes de usarlo en un sistema real.
- El adaptador requiere cargar el modelo base por separado; no es un modelo autocontenido.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/HarjasSingh/jobparse-qwen2.5-1.5b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
