# Kausp11/searchlm-dclm_nc-v1_d32_64Bdoc

## Resumen

Search-LLM, DCLM-Edu 3.3B (base) es un modelo de lenguaje base entrenado con preentrenamiento habilitado para búsqueda (*search-enabled pretraining*), publicado en Hugging Face por el usuario Kausp11. El modelo procede de un checkpoint del proyecto `search-lm` entrenado en el clúster RCP (identificador interno `dclm_nc/v1_d32_64Bdoc`), y su exportación a Hugging Face incluye únicamente los pesos y el tokenizador.

La particularidad más destacable es que el tokenizador, basado en el de SmolLM2, incorpora tokens especiales de búsqueda (`<WEB_QUERY>`, `</WEB_QUERY>`, `<WEB_RESPONSE>`, `</WEB_RESPONSE>`), lo que sugiere que el modelo fue entrenado con documentos que intercalan consultas web simuladas y sus respuestas, una técnica orientada a que el modelo aprenda a formular y consumir información recuperada de fuentes externas durante el propio preentrenamiento.

Con unos 5.540 millones de parametros (dato real extraido de los safetensors) y licencia Apache 2.0, se trata de un modelo base (no instruido) de tamano medio, util como punto de partida para investigación sobre preentrenamiento con búsqueda integrada, fine-tuning posterior o experimentos con generación aumentada por recuperación. Su relevancia es principalmente nicho: al tratarse de un modelo experimental con muy poca documentacion (309 descargas, sin model card detallada), esta dirigido a desarrolladores e investigadores capaces de trabajar con modelos base sin soporte de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (estilo nanochat), no disponible detalle completo |
| Parametros totales | 5.539.729.626 (~5,54 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en bf16/fp16 implicitos en safetensors) |
| Idiomas soportados | no disponible (tokenizador basado en SmolLM2, presumiblemente orientado a ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (11,1 GB de tamano de repo) |

## Arquitectura y entrenamiento

El modelo se describe como un "DCLM-Edu nanochat model", lo que indica que sigue la arquitectura de nanochat (la base de codigo de preentrenamiento ligera estilo GPT asociada al ecosistema DCLM) y que fue entrenado sobre una mezcla de datos DCLM con componente educativo ("Edu"). El nombre del checkpoint `v1_d32_64Bdoc` sugiere una profundidad de 32 capas y unos 64 mil millones de documentos o tokens de datos, aunque el autor no detalla esta informacion en la model card, por lo que debe tomarse como indicativo y no confirmado.

La innovacion tecnica central es el preentrenamiento con búsqueda habilitada (*search-enabled pretraining*): el tokenizador extiende el de SmolLM2 con cuatro tokens especiales que delimitan consultas web (`<WEB_QUERY>`, `</WEB_QUERY>`) y respuestas web (`<WEB_RESPONSE>`, `</WEB_RESPONSE>`). Esto apunta a que el corpus de entrenamiento incluyo interacciones de búsqueda sintetizadas embebidas en los documentos, de modo que el modelo aprenda desde el preentrenamiento a emitir consultas y procesar resultados externos. No hay informacion publicada sobre el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni el uso de RLHF o DPO (habitual en modelos base, probablemente ausente).

## Capacidades

- Generacion de texto autoregresiva como modelo base (pipeline `text-generation` con `transformers`).
- Formulacion de consultas web y procesamiento de respuestas de búsqueda, gracias a los tokens especiales `<WEB_QUERY>`/`<WEB_RESPONSE>` aprendidos durante el preentrenamiento.
- Base apta para fine-tuning supervisado (SFT), RLHF/DPO o adaptacion a tareas de generación aumentada por recuperacion (RAG).
- Carga estandar con `AutoModelForCausalLM.from_pretrained(repo, trust_remote_code=True)` (requiere `trust_remote_code=True` por `custom_code`).
- No hay informacion publicada sobre capacidades de codigo, matematicas, vision, audio, tool calling, agentes ni soporte multilingue: no disponible.
- Al ser un modelo base sin ajuste por instrucciones, no sigue instrucciones de chat de forma fiable sin fine-tuning previo.

## Casos de uso

- Investigacion en preentrenamiento con búsqueda: estudiar como la intercalacion de consultas y respuestas web durante el preentrenamiento afecta a la capacidad del modelo de usar conocimiento externo, comparandolo con bases DCLM equivalentes sin tokens de búsqueda.
- Prototipado de agentes de búsqueda: dado que el modelo aprendio a emitir consultas dentro de los delimitadores `<WEB_QUERY>`, puede usarse como base para entrenar agentes que generen queries contra un motor de búsqueda y consuman los resultados.
- Fine-tuning para RAG: ajustar el modelo sobre pares contexto-respuesta recuperada para construir un sistema de generación aumentada por recuperacion de tamano manejable (~5,5 B).
- Punto de partida para SFT de dominio educativo: la mezcla DCLM-Edu lo hace adecuado como base para asistentes o tutores en el ambito educativo tras un ajuste por instrucciones.
- Experimentos de destilacion y cuantizacion: su tamano medio y licencia permisiva lo hacen candidato para pruebas de cuantizacion (GPTQ, AWQ, GGUF) y despliegue en hardware modesto.
- Investigacion reproducible de pipelines de preentrenamiento: al proceder de un checkpoint de RCP con exportacion estandar a Hugging Face, sirve para reproducir o extender experimentos del proyecto `search-lm`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa: con 5,54 B de parametros y pesos de ~11,1 GB (aproximadamente 2 bytes por parametro, es decir, bf16/fp16), se necesitan en torno a 11-12 GB de VRAM, mas overhead de KV cache y activaciones (practicamente 14-16 GB recomendables).
- GPUs recomendadas: una RTX 4090 (24 GB), RTX 3090 (24 GB) o A100 de 40 GB cubren la inferencia en precision completa sin problemas; con cuantizacion a 8 bits o 4 bits cabria en GPUs de 8-12 GB, aunque no hay cuantizaciones oficiales publicadas.
- Cabe en GPUs de consumo: si, en precision nativa en una RTX 3090/4090, y presumiblemente en GPUs de 12 GB con cuantizacion.
- Despliegue: compatible con `transformers` (requiere `trust_remote_code=True`); no consta soporte verificado en vLLM, TGI, llama.cpp u Ollama, y el uso de `custom_code` puede complicar la exportacion a GGUF. La via mas segura es transformers o vLLM si la arquitectura nanochat resulta compatible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Search-LLM DCLM-Edu 3.3B (este) | ~5,54 B | no disponible | Apache 2.0 | Preentrenamiento con tokens de búsqueda, base experimental |
| SmolLM2-1.7B | 1,7 B | 8192 | Apache 2.0 | Misma familia de tokenizador; modelo compacto generalista |
| Qwen2.5-7B (base) | 7,6 B | 32768 | Qwen Research (uso comercial condicionado) | Base mas grande y documentada, sin tokens de búsqueda nativos |
| Llama 3.1 8B (base) | 8 B | 131072 | Llama 3.1 Community | Base robusta de referencia, licencia con restricciones |

Frente a estas alternativas, el modelo de Kausp11 es mas pequeno y mucho menos documentado, pero es el unico con preentrenamiento nativo orientado a búsqueda y licencia Apache 2.0 sin restricciones, lo que lo hace atractivo para investigacion en RAG y agentes de búsqueda pese a su menor madurez.

## Limitaciones y advertencias

- Documentacion muy escasa: la model card no detalla datos de entrenamiento, longitud de contexto, benchmarks ni limitaciones conocidas, lo que exige validacion propia antes de cualquier uso serio.
- Es un modelo base sin ajuste por instrucciones: no esta pensado para chat ni para seguir instrucciones sin fine-tuning previo.
- Riesgo de alucinacion elevado, tipico de modelos base y agravado por la ausencia de datos de evaluacion publicados.
- Requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar codigo personalizado del repositorio; revisar el codigo antes de usarlo en entornos de produccion.
- Sesgos: al entrenarse sobre datos DCLM (corpus web filtrado), hereda los sesgos de dicho corpus; no existen auditorias publicadas.
- Idiomas: no consta soporte multilingue; el tokenizador SmolLM2 sugiere orientacion principal al ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no hay garantias ni soporte asociados al modelo.
- Proyecto de autor individual con baja traccion (309 descargas, 0 likes): la continuidad del mantenimiento no esta garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/searchlm-dclm_nc-v1_d32_64Bdoc
- Repositorio de origen (interno de RCP): `search-lm/ckpts/dclm_nc/v1_d32_64Bdoc` (no disponible enlace publico)
- Paper, blog o demo: no disponible
