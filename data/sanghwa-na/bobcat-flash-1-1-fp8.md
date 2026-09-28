# sanghwa-na/bobcat-flash-1.1-fp8

## Resumen

Bobcat Flash 1.1 FP8 es un checkpoint cuantizado a FP8 de Bobcat Flash 1.1, el modelo de "decisiones tipadas" (typed decisions) desarrollado por sanghwa-na dentro del proyecto Bobcat de foxl-ai. No es un modelo generativo: recibe un estado (texto e imagen) junto con preguntas cuyas respuestas posibles se nombran de antemano, y devuelve una probabilidad para cada una de esas respuestas etiquetadas. Nunca emite texto libre, solo respuestas JSON cerradas sobre el conjunto de etiquetas proporcionado.

El modelo base es un ajuste LoRA de Gemma 4 26B-A4B-it de Google DeepMind, fusionado y posteriormente cuantizado. Se trata por tanto de una arquitectura de mezcla de expertos (MoE) con 25.805.936.206 parametros totales (~25,8 B) y un subconjunto activo por token del orden de 4 B, segun la nomenclatura A4B del modelo de partida. El repositorio ocupa 27,2 GB y se distribuye en formato compressed-tensors, que vLLM carga directamente sin conversion.

Su relevancia practica esta en el nicho de clasificacion y guardrails: al devolver probabilidades calibradas sobre etiquetas nombradas en lugar de texto, encaja en pipelines de agentes donde se necesita enrutado, moderacion o verificacion determinista con baja latencia. El autor reporta 24,6 ms de latencia p50 por decision (512 tokens, 8 candidatos) en el motor de vLLM, y una precision del 91,94% en su conjunto de evaluacion interno de 3.188 decisiones de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) derivado de Gemma 4 26B-A4B-it, con torre de vision |
| Parametros totales | 25.805.936.206 (~25,8 B) |
| Parametros activos | ~4 B (derivado de la nomenclatura A4B del modelo base; no confirmado de forma explicita en la informacion disponible) |
| Longitud de contexto | 32.832 tokens en la configuracion de servidor de referencia (`--max-model-len 32832`); los estados de mas de 2.048 tokens se describen como terreno del modelo Bobcat 1.1, no de Flash |
| Tipos de cuantizacion | FP8 (`float8_e4m3fn`, esquema FP8_DYNAMIC, una escala por canal de salida, activaciones cuantizadas por token en tiempo de ejecucion) en formato compressed-tensors; el BF16 original esta en el modelo base. GGUF: no disponible |
| Idiomas soportados | Ingles (en) y coreano (ko) |
| Licencia | Apache-2.0 (derivado de Gemma 4 26B-A4B-it de Google DeepMind, tambien Apache-2.0) |
| Formato de pesos | safetensors (dos fragmentos: `model-00001-of-00002.safetensors` y `model-00002-of-00002.safetensors`), esquema compressed-tensors para FP8 |

## Arquitectura y entrenamiento

La arquitectura es la de Gemma 4 26B-A4B-it, un transformer con capas de mezcla de expertos. Sobre esa base se entreno Bobcat Flash 1.1 como un adaptador LoRA orientado a decisiones tipadas, que despues se fusiono en los pesos BF16 del modelo original, en la revision `4d7ae4984b7db7de8f8457170b3f1a419ee76d52` de Gemma 4 26B-A4B-it. La informacion disponible no detalla el numero de tokens de entrenamiento ni la composicion del dataset; si indica que no se utilizo ninguna salida de Jev ni de otro modelo profesor para entrenar, y remite a la model card principal para datos de entrenamiento y limitaciones.

La cuantizacion se realizo con `scripts/fp8_quantize.py` sobre llm-compressor 0.14.0 en modo FP8_DYNAMIC y sin datos de calibracion. El proceso lineariza los 30 bloques de expertos fusionados en un Linear por experto, y deja en FP8 205 proyecciones densas y 11.520 proyecciones de expertos. Permanecen en BF16 la `lm_head`, los embeddings, los 30 enrutadores y la torre de vision. El resultado se sirve con vLLM 0.30.0 (con `--quantization none`, ya que el esquema FP8 se lee del `config.json`) junto con el servidor `bobcat.flash_server` del repositorio, que es quien implementa el contrato de decisiones tipadas con respuestas JSON cerradas y sin generacion de tokens. La temperatura configurada es 0,8912, con `--max-num-seqs 256` y `max_num_batched_tokens=16384`.

## Capacidades

- Clasificacion zero-shot: asigna probabilidades a un conjunto de etiquetas proporcionadas por el usuario, sin reentrenamiento.
- Decisiones tipadas: devuelve una probabilidad por cada respuesta nombrada, en JSON cerrado, sin generar texto libre.
- Entrada multimodal: la torre de vision se conserva en BF16 y el repositorio incluye la etiqueta `image-text-to-text`, por lo que admite imagenes junto al estado textual.
- Uso como guardrail: orientado explicitamente a moderacion y filtrado de contenido.
- Enrutado y seleccion: util para elegir entre opciones discretas (intenciones, herramientas, categorias) con salida probabilistica.
- Multilinguee limitado a ingles y coreano.
- Salida determinista y comprobable: al no generar tokens, la respuesta es directamente parseable y auditable.
- Sin soporte de generacion de texto, razonamiento libre, codigo ni matematicas por si mismo; su funcion es la clasificacion.
- No se documenta soporte de tool calling ni de razonamiento multi-paso en la informacion disponible; la orquestacion recae en el sistema que consume el modelo.

## Casos de uso

- Guardrails en produccion: colocar el modelo delante de un LLM generativo para clasificar si una peticion o una respuesta incumple una politica, enviando la politica como conjunto de etiquetas y obteniendo probabilidades por categoria. Al no generar texto, no hay riesgo de que el propio guardrail produzca contenido no deseado.
- Enrutado de intenciones en agentes: dado el turno de usuario, etiquetar la intencion entre un conjunto cerrado de opciones y usar la probabilidad para decidir que herramienta o subagente se activa, con 24,6 ms p50 por decision (512 tokens, 8 candidatos).
- Clasificacion de tickets de soporte: etiquetar automaticamente incidencias por categoria, urgencia o equipo responsable sin entrenar un clasificador especifico, aprovechando la formulacion zero-shot.
- Filtrado de relevancia en pipelines RAG: puntuar si un documento recuperado responde a la consulta antes de pasarlo al modelo generativo, reduciendo el ruido en el contexto.
- Moderacion de contenido multimodal: al conservar la torre de vision, permite etiquetar imagenes acompanadas de texto (por ejemplo, capturas o publicaciones) contra categorias definidas.
- Etiquetado de datos a escala: generar etiquetas probabilisticas sobre grandes volumenes de texto para preanotar datasets de entrenamiento, dejando la revision humana para los casos de baja confianza.
- Verificacion de decisiones en workflows: el autor cita 20 casos de flujo de trabajo de TypeSafe que coincidieron con la referencia en el 90,9% de 329 preguntas, lo que lo situa como validador de decisiones dentro de un pipeline mayor.
- Ajuste de agentes conversacionales coreanos: es uno de los dos idiomas soportados, lo que permite desplegarlo en productos dirigidos al mercado coreano sin traduccion intermedia.

## Benchmarks y rendimiento

Los unicos datos disponibles son la evaluacion interna del autor sobre 3.188 decisiones de desarrollo, ejecutada en una unica RTX PRO 6000 con vLLM 0.30.0.

| Conjunto (3.188 decisiones de desarrollo, 1x RTX PRO 6000, vLLM 0.30.0) | Precision | Macro por tarea | Misma respuesta que BF16 |
|---|---:|---:|---:|
| Ruta de evaluacion (base BF16, adaptador sin fusionar) | 91,84% | 92,07% | - |
| Este checkpoint (FP8) | 91,94% | 92,22% | 98,8% |

La diferencia FP8 menos BF16 es de +0,09 puntos, con intervalo [-0,28, +0,47]; cambiaron 39 respuestas, en su mayoria empates cercanos. En los 20 casos de flujo de trabajo de TypeSafe, el modelo servido coincidio con la referencia en el 90,9% de 329 preguntas, sin peticiones fallidas; los pesos BF16 servidos en FP8 dan 91,2% en ese mismo conjunto. La latencia de una decision de 512 tokens con 8 candidatos es de 24,6 ms en p50 en el motor de vLLM. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan aproximadamente 25,8 GB; sumando cache KV y activaciones, el despliegue realista parte de unos 30-32 GB con contextos y lotes pequenos. Con `max-model-len 32832` y `max-num-seqs 256` el consumo crece de forma notable (estimacion propia, no publicada por el autor).
- GPU recomendadas: el autor valido el modelo en una RTX PRO 6000. Para servir con la configuracion completa de referencia se recomienda una GPU con 80-96 GB (A100 80 GB, H100 80 GB, RTX PRO 6000 96 GB).
- Cabe en GPU de consumo: en una RTX 5090 de 32 GB entra con margen ajustado y contexto reducido; en una RTX 4090 de 24 GB no cabe sin descarga de capas a CPU, lo que penaliza la latencia. Estas cifras son estimaciones derivadas del tamano del repositorio (27,2 GB), no datos publicados.
- Opciones de despliegue: vLLM 0.30.0 con el servidor `bobcat.flash_server` del repositorio (ruta recomendada, ya que implementa el contrato de decisiones tipadas); `vllm serve sanghwa-na/bobcat-flash-1.1-fp8` carga el checkpoint pero solo expone generacion de texto, no el contrato tipado. Se requieren Python 3.12, `fastapi`, `uvicorn`, `scipy`, `jinja2`, `tokenizers>=0.21`, `huggingface_hub` y `typesafe-sdk==0.7.1`. No se documentan opciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 24,6 ms en p50 por decision de 512 tokens con 8 candidatos en vLLM. No se publican cifras de throughput ni de latencia para lotes grandes.
- Detalles de configuracion relevantes: `VLLM_USE_FLASHINFER_SAMPLER=0`, `--temperature 0.8912`, `--schedule all`, `max_num_batched_tokens=16384`, y el puntero `--compiler-model` al tokenizador y plantilla fijados del modelo base, mas el fichero `bobcat-identifiers.json`.

## Comparativa con modelos similares

No se proporcionan en la informacion disponible datos de modelos alternativos de la misma categoria (clasificadores zero-shot o modelos de decisiones tipadas) con los que comparar parametros, contexto o rendimiento. La unica comparacion con datos verificables es interna, entre este checkpoint y su base BF16.

| Modelo | Parametros | Contexto | Precision en la evaluacion interna | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sanghwa-na/bobcat-flash-1.1-fp8 | 25,8 B totales (~4 B activos) | 32.832 tokens (config. de servidor) | 91,94% (3.188 decisiones) | Apache-2.0 | HuggingFace, formato compressed-tensors FP8 |
| sanghwa-na/bobcat-flash-1.1 (BF16) | 25,8 B totales (~4 B activos) | No disponible en la informacion proporcionada | 91,84% en la ruta de evaluacion | Apache-2.0 | HuggingFace, BF16 |
| Alternativas de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No genera texto: cualquier caso de uso que requiera generacion, razonamiento libre o codigo queda fuera de su alcance por diseno.
- Ventana de contexto: los estados largos (mas de 2.048 tokens) se describen como el punto fuerte de Bobcat 1.1, no de la variante Flash, por lo que los contextos extensos degradan su utilidad.
- Idiomas: solo ingles y coreano; no hay soporte declarado para castellano ni otros idiomas.
- La model card de este repositorio remite a la tarjeta principal (`sanghwa-na/bobcat-flash-1.1`) para la evaluacion completa, los datos de entrenamiento y las notas de licencia, que no se reproducen aqui.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa independiente.
- Cuantizacion sin datos de calibracion (FP8_DYNAMIC): aunque la perdida medida es de +0,09 puntos, el 1,2% de las respuestas cambia respecto a BF16, concentrado en empates cercanos; conviene validar sobre el dominio propio antes de produccion.
- Posible sesgo heredado de Gemma 4 26B-A4B-it y de los datos de entrenamiento del ajuste, no cuantificado en la informacion disponible.
- Riesgo de calibracion imperfecta: al devolver probabilidades, umbrales mal elegidos pueden producir falsos positivos o negativos en guardrails y moderacion.
- Licencia Apache-2.0 con atribucion obligatoria: el checkpoint incluye el texto de licencia y un fichero `NOTICE` con los cambios realizados; los datos de entrenamiento conservan sus propias licencias, detalladas en `THIRD_PARTY.md` del repositorio de GitHub.
- El proyecto se declara independiente y no afiliado ni respaldado por Google, el equipo de Qwen, TypeSafe AI ni otras companias mencionadas. Se entrega "tal cual", sin garantia.
- Cifras de VRAM y compatibilidad con GPU de consumo no publicadas por el autor: las indicadas son estimaciones a partir del tamano del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sanghwa-na/bobcat-flash-1.1-fp8
- Modelo base BF16: https://huggingface.co/sanghwa-na/bobcat-flash-1.1
- Modelo Bobcat 1.1 (para estados largos): https://huggingface.co/sanghwa-na/bobcat-1.1
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/sanghwa-na/bobcat-flash
- Codigo en GitHub: https://github.com/foxl-ai/bobcat
- Nota tecnica (blog): https://foxl.ai/blog/bobcat-typed-decisions
- Gemma 4 26B-A4B-it (modelo de partida): no se proporciona URL directa en la informacion disponible
- No se han encontrado resultados de busqueda web relevantes para este modelo: los resultados devueltos por la busqueda no guardan relacion con el modelo ni con inteligencia artificial y se han descartado.
