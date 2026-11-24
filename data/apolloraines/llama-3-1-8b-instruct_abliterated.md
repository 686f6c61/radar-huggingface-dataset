# ApolloRaines/Llama-3.1-8B-Instruct_Abliterated

## Resumen

Llama-3.1-8B-Instruct_Abliterated es una variante del modelo Meta Llama-3.1-8B-Instruct publicada por ApolloRaines, en la que se han eliminado quirúrgicamente los mecanismos de rechazo (refusals) mediante una tecnica de edicion de pesos denominada "abliteration", implementada con la herramienta propietaria jBlaze del mismo autor. No se ha realizado ningun tipo de fine-tuning ni entrenamiento adicional con gradientes: la modificacion consiste en identificar una direccion de comportamiento en el espacio de activaciones y ablacionarla directamente en los pesos.

El modelo conserva la arquitectura original de Llama 3.1: un transformer decoder-only de 32 capas con 8.030.261.248 parametros en precision bf16, ventana de contexto de 128.000 tokens y tokenizador de 128.256 entradas. El objetivo declarado es que el modelo responda a cualquier prompt sin negativas, manteniendo el conocimiento, la fluidez y la capacidad de razonamiento del modelo base.

La relevancia de esta publicacion es fundamentalmente metodologica: el autor la presenta como una demostracion de que las disposiciones de comportamiento aprendidas residen en los pesos como direcciones identificables y modificables a posteriori, sin reentrenar. Es un modelo de investigacion, distribuido a "intensidad parcial" segun el propio autor, y no una alternativa de produccion al modelo base. Cuenta con 386 descargas y ningun "like" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, 32 capas) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan variantes GGUF/AWQ/GPTQ oficiales) |
| Idiomas soportados | en (ingles, segun la model card; el modelo base soporta oficialmente 8 idiomas) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura es identica a la de meta-llama/Llama-3.1-8B-Instruct: un transformer decoder-only denso de 32 capas, 8.030 millones de parametros, atencion con RoPE y contexto extendido hasta 128.000 tokens. El modelo parte de los pesos del Instruct oficial de Meta, que fue entrenado con preentrenamiento masivo seguido de post-entrenamiento (SFT y RLHF/DPO), aunque la model card no detalla el volumen de tokens ni la composicion del dataset original.

La intervencion de ApolloRaines no anade entrenamiento: aplica "weight surgery" con jBlaze para localizar una direccion de comportamiento asociada al rechazo y ablacionarla directamente en los pesos. El autor describe el resultado como una edicion de direccion unica ("single-direction"), sin gradientes, y senala que la misma tecnica puede apuntarse en sentido contrario (hacia comportamientos mas seguros). Un caveat relevante es que, segun el propio autor, la mayoria de sus modelos publicos se liberan a intensidad parcial: lo publicado es una demostracion, no la version completa de la herramienta.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con la fluidez y el estilo del Instruct original.
- Respuesta a practicamente cualquier prompt sin negativas ni rechazos, que es precisamente el comportamiento ablacionado.
- Razonamiento, conocimiento general y matematicas basicas heredados del modelo base (sin garantia de conservacion integra tras la edicion).
- Generacion y explicacion de codigo, en la medida en que lo soporta Llama 3.1 8B Instruct.
- Soporte de plantilla de chat (`apply_chat_template`) con roles system/user/assistant.
- Capacidades multilingues limitadas: la model card declara solo `en`, aunque el modelo base soporta oficialmente aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- Tool calling y function calling: no documentado en la model card; el modelo base lo soporta de forma no nativa.
- Modo "thinking", vision o audio: no disponible.

## Casos de uso

- Investigacion en seguridad y alineacion: analizar que cambia en el comportamiento de un modelo cuando se elimina la direccion de rechazo, comparando respuestas contra el modelo base en un mismo conjunto de prompts.
- Evaluacion de tecnicas de edicion de pesos: servir como referencia reproducible de "abliteration" para contrastar con otras aproximaciones (circuitos, steering vectors, fine-tuning de rechazo).
- Pruebas de robustez de filtros de contenido: usar el modelo como generador adversario para validar que las capas de moderacion externas de un pipeline capturan salidas que el modelo ya no bloquea por si mismo.
- Generacion de texto creativo sin friccion: escenarios de escritura de ficcion, guiones o role-play donde los rechazos del Instruct resultan disruptivos, siempre con moderacion externa.
- Red teaming de aplicaciones LLM: simular un atacante con un modelo que no se niega, para medir la resistencia de sistemas propios ante prompts maliciosos.
- Docencia y divulgacion: ilustrar de forma tangible que los comportamientos aprendidos son direcciones en el espacio de pesos, con un caso concreto y descargable.
- Prototipado de asistentes conversacionales en ingles donde el coste de un rechazo erroneo es alto, asumiendo que la responsabilidad de filtrado recae en el sistema que lo envuelve.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se necesitan 18-24 GB para contextos moderados.
- En cuantizacion de 8 bits: unos 8-9 GB de pesos; en 4 bits: unos 4-5 GB, aunque no se distribuyen cuantizaciones oficiales de este checkpoint.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB, justa para contexto corto y batch pequeno).
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) en bf16 con contexto limitado; en RTX 4080/4070 Ti (16 GB) solo con cuantizacion.
- Opciones de despliegue: transformers (ruta documentada por el autor), vLLM y TGI para servir en bf16; llama.cpp/Ollama requeririan convertir los pesos a GGUF, paso no documentado en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento ante rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct_Abliterated | 8,0 B | 128k | Sin rechazos (ablacionado) | Llama 3.1 Community | Hugging Face, 386 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,0 B | 128k | Rechazos alineados por RLHF | Llama 3.1 Community | Hugging Face, ampliamente adoptado |
| Modelos "uncensored" derivados de Llama 3 8B (p. ej. variantes Dolphin/Llama-3-8B) | 8,0 B | 8k-128k segun variante | Sin rechazos via fine-tuning | Segun variante | Hugging Face, comunidad |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32k | Rechazos moderados | Apache 2.0 | Hugging Face, ampliamente adoptado |

## Limitaciones y advertencias

- Eliminar los rechazos implica que el modelo puede generar contenido danino, ilegal o inseguro; no dispone de ninguna capa de seguridad propia.
- Riesgo elevado de alucinacion y de afirmaciones no verificadas, sin que el modelo exprese cautela o incertidumbre.
- La edicion de pesos puede degradar capacidades del modelo base (razonamiento, instrucciones complejas, coherencia en contextos largos); la model card no aporta evaluaciones que lo descarten.
- El autor reconoce explicitamente que publica una version a intensidad parcial: el comportamiento observado no representa el maximo de la tecnica.
- Idiomas: la model card declara solo ingles; el rendimiento en espanol no esta evaluado y puede ser inferior al del modelo base.
- Licencia Llama 3.1 Community: permite uso comercial con restricciones (politica de uso aceptable, obligacion de atribucion "Built with Llama", limite de 700 millones de usuarios mensuales para licenciatarios no autorizados por Meta); la edicion no altera estos terminos.
- La herramienta jBlaze es propietaria y no se documenta el metodo exacto de ablacion, lo que dificulta reproducir o auditar el proceso.
- No apto para produccion sin moderacion externa, evaluacion propia y revision legal del caso de uso.
- Modelo con adopcion muy baja (0 likes, 386 descargas): sin validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct_Abliterated
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Herramienta jBlaze: https://jblaze.dev
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- Paper de referencia sobre abliteration (refusal direction): https://arxiv.org/abs/2406.11717
