# mradermacher/erawan-1.3-i1-GGUF

## Resumen

Erawan 1.3 es un modelo de lenguaje de aproximadamente 1.720 millones de parametros (etiquetado como 2B por el autor) desarrollado por AIRAVAT-AI-ML. Se trata de un fine-tuning mediante LoRA sobre una base de la familia Qwen3, orientado especificamente a flujos agenticos: uso de herramientas, function calling y razonamiento multi-paso. El modelo que nos ocupa, `mradermacher/erawan-1.3-i1-GGUF`, es la version cuantizada en formato GGUF publicada por mradermacher, con una amplia gama de cuantizaciones que van desde IQ1_S (0,6 GB) hasta Q6_K (1,5 GB), todas generadas con imatrix.

La relevancia de esta ficha radica en que el modelo base original se distribuye en safetensors (transformers), mientras que esta variante permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama o cualquier runtime compatible con GGUF. Al ser un modelo de ~1,7B de parametros con licencia Apache 2.0, resulta atractivo para prototipado de agentes locales, automatizacion ligera y despliegues en entornos con recursos limitados.

No se dispone de informacion publica sobre la longitud de contexto, el volumen de datos de entrenamiento ni los resultados de benchmarks en la informacion proporcionada. El modelo declara soporte unicamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, segun tags del autor); detalles no disponibles |
| Parametros totales | 1.720.574.976 (~1,72B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas i1/imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base `AIRAVAT-AI-ML/erawan-1.3` es un fine-tuning mediante LoRA sobre una base de la familia Qwen3, segun los tags declarados por el autor (`qwen3`, `lora`, `Fine-tuned`). El objetivo del ajuste es reforzar capacidades agenticas: `agentic`, `tool-use`, `function-calling` y `reasoning` aparecen como tags del modelo. No se han publicado en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO.

La variante aqui descrita es una cuantizacion GGUF producida por mradermacher utilizando ficheros imatrix (importance matrix), lo que segun el autor mejora la calidad de las cuantizaciones de baja precision respecto a las cuantizaciones estaticas equivalentes. El repositorio incluye tambien una version estatica en `mradermacher/erawan-1.3-GGUF`. No se documentan innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, etc.) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento multi-paso (`reasoning` declarado como tag).
- Uso de herramientas y function calling (`tool-use`, `function-calling`).
- Comportamiento orientado a agentes (`agentic`).
- Fine-tuning especifico sobre Qwen3, heredando las capacidades base de dicha familia.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Vision, audio y thinking mode: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes locales en hardware de consumo: gracias a las cuantizaciones de 1,1-1,5 GB (IQ4_XS, Q4_K_M, Q5_K_M), el modelo puede ejecutarse en GPUs con 4-6 GB de VRAM o incluso en CPU, permitiendo prototipar agentes con tool calling sin infraestructura dedicada.
- Automatizacion de tareas con function calling: el modelo esta ajustado explicitamente para emitir llamadas a funciones, por lo que encaja en pipelines donde un LLM debe decidir que herramienta invocar (APIs REST, consultas a bases de datos, operaciones de ficheros).
- Razonamiento encadenado en asistentes de codigo: su tag `reasoning` sugiere utilidad en tareas de descomposicion de problemas; puede integrarse como paso intermedio en asistentes de desarrollo para planificar cambios antes de generar parches.
- Enrutamiento y clasificacion de intenciones en sistemas multiagente: por su tamano reducido, es viable desplegarlo como modelo "router" que decide a que agente o herramienta derivar cada peticion, con latencia baja en GPU de gama media.
- Prototipado rapido con Ollama o llama.cpp: al estar disponible en GGUF con cuantizaciones desde 0,6 GB, permite iterar sobre prompts y esquemas de herramientas en un portatil antes de escalar a un modelo mayor.
- Educacion e investigacion sobre fine-tuning agentico: al ser Apache 2.0 y derivar de Qwen3 con LoRA, sirve como caso de estudio reproducible para analizar como un ajuste LoRA sobre una base pequena mejora tool calling.
- Despliegue en el borde (edge): con cuantizaciones IQ2/IQ3 de menos de 1 GB, es posible ejecutarlo en dispositivos con memoria muy limitada, aceptando la perdida de calidad documentada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero GGUF):
  - IQ1_S / IQ1_M: ~0,6 GB de pesos; ~1,5-2 GB de VRAM total con contexto moderado.
  - IQ2_XXS a IQ2_M: ~0,7-0,8 GB de pesos; ~2 GB de VRAM total.
  - IQ3_XXS a Q3_K_L: ~0,9-1,1 GB de pesos; ~2,5-3 GB de VRAM total.
  - IQ4_XS a Q4_1: ~1,1-1,2 GB de pesos; ~3 GB de VRAM total.
  - Q5_K_S / Q5_K_M: ~1,3-1,4 GB de pesos; ~3,5 GB de VRAM total.
  - Q6_K: ~1,5 GB de pesos; ~4 GB de VRAM total.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) es suficiente; tambien cabe en GPUs de datacenter (A100, H100) aunque estas estan sobredimensionadas para un modelo de 1,7B.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base original puede servirse con transformers, vLLM o TGI en formato safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Erawan 1.3 (esta ficha, GGUF) | ~1,72B | no disponible | Apache 2.0 | GGUF (i1) | Fine-tuning LoRA de Qwen3 orientado a agentes y tool calling |
| Qwen3 (base de la familia) | no disponible para la variante concreta | no disponible | no disponible en esta ficha | safetensors/GGUF | Base sobre la que se aplica el LoRA; capacidades generales |
| Erawan 1.3 estatico (`mradermacher/erawan-1.3-GGUF`) | ~1,72B | no disponible | Apache 2.0 | GGUF (estatico) | Misma base, cuantizaciones sin imatrix |

No se dispone de informacion suficiente para comparar con alternativas de otros autores (por ejemplo, otros modelos de ~2B orientados a tool calling) sin inventar datos.

## Limitaciones y advertencias

- Solo soporta ingles segun los metadatos del autor; el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto no documentada: no es posible planificar despliegues con ventanas largas sin verificacion empirica.
- Riesgo de alucinacion inherente a modelos de ~1,7B, especialmente en tareas de razonamiento complejo o generacion factual.
- Las cuantizaciones de muy baja precision (IQ1_S, IQ1_M, IQ2_*) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- No hay benchmarks publicados que permitan validar las capacidades agenticas declaradas en los tags.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene verificar las condiciones de la base Qwen3 subyacente si se redistribuye el modelo.
- El fine-tuning es LoRA sobre una base pequena: no debe asumirse un rendimiento comparable al de modelos mayores en tool calling complejo o razonamiento profundo.
- El repositorio tiene 0 likes y ~2120 descargas en el momento de la consulta, lo que indica una validacion comunitaria limitada.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/erawan-1.3-i1-GGUF
- Modelo base original: https://huggingface.co/AIRAVAT-AI-ML/erawan-1.3
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/erawan-1.3-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#erawan-1.3-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (patrocinador del autor): https://www.nethype.de/
