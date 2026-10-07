# sanghwa-na/bobcat-flash-1.2-fp8

## Resumen

Bobcat Flash 1.2 FP8 es un checkpoint pre-cuantizado en FP8 de Bobcat Flash 1.2, el nivel rapido del modelo de decisiones tipadas Bobcat, desarrollado por sanghwa-na (proyecto foxl-ai). No es un modelo generativo: recibe un estado y una lista de preguntas con respuestas nombradas por el llamante, y devuelve una probabilidad para cada respuesta nombrada. Nunca emite texto libre, lo que lo situa en el nicho de clasificacion zero-shot, enrutado y guardrails deterministas.

El modelo parte de Gemma 4 26B-A4B-it de Google DeepMind, sobre el que se fusionaron dos adaptadores LoRA de Bobcat en proporcion 0,6/0,4. La arquitectura es un transformer con mezcla de expertos (MoE) de 25.805.936.206 parametros totales, con ventana de contexto de 98.368 tokens. Esta version concreta guarda pesos en float8_e4m3fn con una escala por canal de salida, activaciones cuantizadas por token en tiempo de ejecucion y formato compressed-tensors, que vLLM carga directamente.

Su relevancia practica esta en el coste: ocupa 27,2 GB en disco, pierde solo 0,19 puntos porcentuales de exactitud frente a los pesos BF16 en el conjunto de evaluacion de 3.188 decisiones de desarrollo y mantiene la misma respuesta que BF16 en el 98,7% de los casos, con una decision de 512 tokens y 8 candidatos resuelta en 24,6 ms (p50) dentro del motor de vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), basada en Gemma 4 26B-A4B-it |
| Parametros totales | 25.805.936.206 (≈25,8 B) |
| Parametros activos | ~4 B (deducido de la nomenclatura A4B del modelo base Gemma 4 26B-A4B-it) |
| Longitud de contexto | 98.368 tokens (max-model-len); las entradas mas largas se rechazan con HTTP 422 y no se truncan |
| Tipos de cuantizacion | FP8_DYNAMIC (float8_e4m3fn, una escala por canal de salida, activaciones por token en runtime); el modelo base dispone de pesos BF16 |
| Idiomas soportados | en, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (2 archivos, model-00001-of-00002 y model-00002-of-00002) |
| Tamano del repositorio | 27,2 GB |
| Pipeline declarado | zero-shot-classification |
| Descargas / likes | 18 / 0 |
| Fecha de creacion | 2026-10-07 |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion de sanghwa-na/bobcat-flash-1.2, cuyos pesos BF16 proceden a su vez de Gemma 4 26B-A4B-it (revision 4d7ae4984b7db7de8f8457170b3f1a419ee76d52) con dos adaptadores LoRA de Bobcat fusionados en proporcion 0,6/0,4. Se trata por tanto de un transformer con mezcla de expertos, con torre de vision y 30 bloques de expertos fusionados. La cuantizacion se realizo con scripts/fp8_quantize.py y llm-compressor 0.14.0 en modo FP8_DYNAMIC sin datos de calibracion: los 30 bloques de expertos fusionados se linealizan en un Linear por experto, mientras que lm_head, los embeddings, los 30 routers y la torre de vision permanecen en BF16. La procedencia se verifica contra SHA256SUMS.json y bibot-release-manifest.json (serving_artifacts.fp8).

Sobre el entrenamiento no se detalla el numero de tokens ni la composicion del dataset en esta model card: se remite a la ficha del modelo base para datos de entrenamiento, evaluacion y limitaciones. Si se indica que las etiquetas fueron calculadas por codigo y que las distribuciones del profesor proceden de GLM-5.3-Flash, sin usar salidas de Jev. No se menciona RLHF ni DPO. La innovacion tecnica destacable no es arquitectonica sino de contrato de salida: el servidor Bobcat entrega decisiones tipadas (JSON cerrado, sin tokens generados) con una temperatura de calibracion distinta por tipo de pregunta (choice=0.594604, noul=0.353553, score=0.529732).

## Capacidades

- Decision tipada: devuelve una probabilidad por cada respuesta nombrada por el llamante; no genera texto libre en ningun caso.
- Clasificacion zero-shot y zero-shot classification sobre estados de entrada.
- Guardrails: etiquetado de seguridad y filtrado con salidas probabilisticas cerradas.
- Entrada multimodal image-text-to-text, con torre de vision que permanece en BF16 tras la cuantizacion.
- Procesamiento de estados largos: hasta aproximadamente 96K tokens leidos completos, sin truncado.
- Multilingue limitado a ingles (en) y coreano (ko).
- Despliegue como motor de inferencia servido por vLLM con el servidor bobcat.flash_server.
- Soporte de tool calling / function calling: no disponible; el contrato del modelo es de respuesta cerrada, no de llamada a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; el razonamiento multi-paso queda del lado del orquestador que consume las probabilidades.

## Casos de uso

- Guardrails en produccion: colocar el modelo delante de un LLM generativo para clasificar si una peticion o respuesta cumple una politica, devolviendo la probabilidad de cada etiqueta permitida en lugar de un texto que habria que parsear.
- Moderacion de contenido: definir etiquetas como seguro, violento o spam y obtener una distribucion de probabilidad por etiqueta, con umbral calibrado por el equipo.
- Enrutado de peticiones: dada una consulta, decidir a que modelo o pipeline derivarla (por ejemplo, tier rapido frente a tier con estados largos) usando la probabilidad de cada destino nombrado.
- Clasificacion de documentos con contexto largo: estados de hasta 98.368 tokens leidos completos permiten clasificar contratos, informes o hilos completos sin troceado ni perdida de contexto.
- Clasificacion de imagenes con pregunta textual: la torre de vision en BF16 permite anotar capturas, tickets o documentos escaneados eligiendo entre etiquetas predefinidas.
- Extraccion de decisiones estructuradas en ETL: sustituir heuristicas de reglas por una llamada que devuelve probabilidades sobre campos enumerados, integrable en un pipeline de datos.
- Evaluacion de respuestas de otros modelos: puntuar candidatos (tipo score) como paso de un juez automatico, con 24,6 ms p50 por decision de 512 tokens y 8 candidatos.
- Servicio interactivo de baja latencia: con 64 secuencias maximas en vuelo y 16.384 tokens por lote, es viable exponerlo como endpoint HTTP interno con TypeSafe SDK.

## Benchmarks y rendimiento

| Conjunto / metrica | Recorrido de evaluacion (BF16) | Este checkpoint (FP8) | Diferencia |
|---|---:|---:|---:|
| Decisiones de desarrollo (3.188) - exactitud | 92,25% | 92,06% | -0,19 pts [-0,54; +0,15] |
| Decisiones de desarrollo (3.188) - macro de tarea | 92,21% | 92,10% | -0,11 pts |
| Misma respuesta que BF16 | - | 98,7% | 41 respuestas cambiadas, mayoritariamente casi-empates |
| TypeSafe 20 (329 preguntas, acuerdo con la referencia) | 90,3% y 90,6% en dos ejecuciones (BF16 servido en FP8 al cargar) | 88,4% | - |

Notas de medicion publicadas: 3.188 decisiones de desarrollo sobre una unica RTX PRO 6000 con vLLM 0.30.0. TypeSafe 20 (329 preguntas; una pregunta equivale a 0,30 pt) varia entre servidores FP8 recien arrancados entre el 89,97% y el 90,6%; la ejecucion de puerta fue del 90,27% y el liston corregido de la linea Flash era del 90,19%. El autor indica que, cuando los flujos de trabajo tipo TypeSafe son importantes, conviene servir el repositorio principal. Una decision de 512 tokens con 8 candidatos tarda 24,6 ms en p50; el caso medio de TypeSafe tarda 0,33 s de mediana. No se han publicado resultados de MMLU, HumanEval ni GSM8K, y no serian aplicables dado que el modelo no genera texto.

## Requisitos de hardware

- Peso del checkpoint en disco: 27,2 GB. Solo los pesos FP8 ocupan en torno a 26 GB, por lo que la VRAM necesaria para inferencia parte de esa cifra mas el cache KV y las activaciones.
- La evaluacion de referencia se ejecuto en una sola RTX PRO 6000 con vLLM 0.30.0.
- GPU consumer: una RTX 4090 de 24 GB no es suficiente para servir el checkpoint completo sin offloading; tarjetas de 32 GB o mas, como una RTX 5090, son el minimo razonable estimado para FP8 completo.
- Alternativa de precision: servir los pesos BF16 del repositorio principal con --quantization fp8, opcion que rinde algo mejor en flujos TypeSafe a cambio de mayor coste de carga.
- GPUs de centro de datos recomendadas por tamano: A100 80 GB, H100 80 GB y RTX PRO 6000; el modelo cabe holgadamente en cualquiera de ellas.
- Opciones de despliegue: vLLM 0.30.0 con compressed-tensors (lectura directa del esquema FP8 desde config.json), servido mediante bobcat.flash_server del repositorio foxl-ai/bobcat. Llama.cpp, Ollama y TGI no aparecen citados como soportados.
- Parametros de servicio de referencia: --max-num-seqs 64, --max-model-len 98368, --max_num_batched_tokens 16384, attention_backend TRITON_ATTN, VLLM_USE_FLASHINFER_SAMPLER=0.
- Latencia publicada: 24,6 ms en p50 por decision de 512 tokens con 8 candidatos; 0,33 s de mediana por caso en TypeSafe 20.
- Throughput agregado: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision evaluada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bobcat Flash 1.2 FP8 (este checkpoint) | 25,8 B totales, ~4 B activos | 98.368 tokens | 92,06% exactitud en decisiones de desarrollo; 88,4% de acuerdo en TypeSafe 20 | Apache-2.0 | HuggingFace, 18 descargas, 0 likes |
| Bobcat Flash 1.2 (BF16) | 25,8 B totales, ~4 B activos | 98.368 tokens | 92,25% exactitud en decisiones de desarrollo; 90,3-90,6% de acuerdo en TypeSafe 20 servido en FP8 al cargar | Apache-2.0 | HuggingFace |
| Bobcat Flash 1.1 FP8 | no disponible en la informacion proporcionada | estados de mas de 2.048 tokens derivados a Bobcat completo segun la Space | no disponible | no disponible | HuggingFace y endpoint en FriendliAI |
| Gemma 4 26B-A4B-it | ~26 B totales | no disponible | no disponible | Apache-2.0 | HuggingFace |

La comparacion con modelos de terceros de la misma categoria no esta disponible en la informacion proporcionada. La Space oficial indica que Bobcat Flash 1.1 esta pensado para estados cortos y deriva los estados de mas de 2.048 tokens al Bobcat enrutado, mientras que la version 1.2 aqui descrita soporta estados de hasta 98.368 tokens.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier integracion que espere una cadena de salida o una llamada a herramientas necesita adaptarse al contrato de decisiones tipadas del servidor Bobcat.
- Las entradas que superan la ventana se rechazan con HTTP 422 y nunca se truncan, de modo que el llamante debe gestionar el error o particionar el estado.
- Idiomas soportados limitados a ingles y coreano; no hay soporte declarado para castellano ni otros idiomas.
- Los datos de sesgo no se detallan en esta ficha: la model card remite a la del modelo base, por lo que no hay evaluacion de sesgo publicada para este checkpoint.
- Riesgo de alucinacion: no aplica al no existir generacion de texto, pero si existe riesgo de calibracion incorrecta de las probabilidades fuera de la distribucion de entrenamiento; el autor recomienda servir el repositorio BF16 cuando importa la precision en flujos tipo TypeSafe.
- Sensibilidad al entorno de servicio: el propio autor documenta variacion entre servidores FP8 recien arrancados (89,97-90,6%) y una perdida de 0,19 puntos frente a BF16, con 41 respuestas modificadas sobre 3.188.
- Licencia Apache-2.0, pero es un derivado de Gemma 4 26B-A4B-it: el texto de licencia se incluye como LICENSE y el archivo NOTICE detalla los cambios. Los datos de entrenamiento conservan sus propias licencias (THIRD_PARTY.md en el repositorio de GitHub).
- El proyecto es independiente y no esta afiliado ni respaldado por Google, el equipo de Qwen, Z.ai, TypeSafe AI ni otras companias mencionadas.
- Se entrega tal cual, sin garantia.
- La cuantizacion no empleo datos de calibracion (FP8_DYNAMIC), lo que simplifica la reproducibilidad pero deja la calibracion dependiente de la distribucion real de entrada en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sanghwa-na/bobcat-flash-1.2-fp8
- Modelo base: https://huggingface.co/sanghwa-na/bobcat-flash-1.2
- Version anterior cuantizada: https://huggingface.co/sanghwa-na/bobcat-flash-1.1-fp8
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/sanghwa-na/bobcat-flash
- Codigo en GitHub: https://github.com/foxl-ai/bobcat
- Articulo tecnico: https://foxl.ai/blog/bobcat-typed-decisions
- Endpoint de terceros (FriendliAI, version 1.1 FP8): https://friendli.ai/models/sanghwa-na/bobcat-flash-1.1-fp8
- Registro de modelos (Free2AITools, version 1.1 FP8): https://free2aitools.com/model/sanghwa-na/bobcat-flash-1.1-fp8
