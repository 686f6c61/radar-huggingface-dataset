# mradermacher/cultist-simulator-qwen3-4b-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo `Cecilis/cultist-simulator-qwen3-4b`, un ajuste fino sobre la arquitectura Qwen3-4B orientado a la simulación de partidas y narrativa tipo *Cultist Simulator*. El artefacto lo publica el usuario mradermacher, conocido en Hugging Face por generar versiones cuantizadas de modelos de terceros para su uso con llama.cpp y derivados (Ollama, LM Studio, koboldcpp), no por entrenar modelos propios. La model card es mínima: se limita a declarar el origen y la lista de cuantizaciones disponibles.

El valor del repositorio es, por tanto, puramente de despliegue: convierte un modelo de 4.000 millones de parámetros en ficheros que caben en GPU de consumo y en CPU con memoria RAM moderada, algo relevante para quien quiera ejecutar un modelo de rol narrativo en local sin depender de APIs. Al no incluir el autor ni la ficha del modelo original datos de entrenamiento, licencia o idiomas, la evaluacion tecnica queda limitada a lo que se puede inferir de la familia base Qwen3-4B.

No hay descargas ni *likes* registrados en el momento de la consulta, y la fecha de creacion indicada (2026-09-28) es posterior a la fecha habitual de publicacion de la familia Qwen3, lo que sugiere un error de metadatos o un repositorio generado de forma automatizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-4B); no detallada en la ficha |
| Parametros totales | Aproximadamente 4.000 millones, segun el nombre del modelo; no confirmado en la ficha |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la ficha; la familia Qwen3-4B declara 32.768 tokens nativos ampliables por YaRN |
| Tipos de cuantizacion | `f16`, `Q8_0`, `Q6_K`, `Q5_K_M`, `Q5_K_S`, `Q4_K_M`, `Q4_K_S`, `IQ4_XS`, `Q3_K_L`, `Q3_K_M`, `Q3_K_S`, `Q2_K` |
| Idiomas soportados | No disponible en la ficha; la familia Qwen3 declara soporte multilingue amplio |
| Licencia | No disponible; la ficha no especifica licencia para este ajuste fino |
| Formato de pesos | GGUF (un fichero por nivel de cuantizacion) |

## Arquitectura y entrenamiento

La ficha del repositorio no aporta informacion sobre arquitectura, composicion del dataset, numero de tokens de entrenamiento ni proceso de alineacion (RLHF, DPO o similares). Lo unico verificable es que se trata de una conversion a GGUF de un modelo etiquetado como `qwen3-4b`, con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, una conversion directa desde pesos en formato Hugging Face con cuantizacion de tensores de salida.

Por herencia de la familia base, cabe esperar una arquitectura transformer decoder-only densa de aproximadamente 4.000 millones de parametros, con atencion por consultas agrupadas y variantes de modo *thinking* y *non-thinking* introducidas en Qwen3. Sin embargo, no hay confirmacion de que el ajuste fino conserve ambas variantes ni de que el entrenamiento haya incluido datos de rol o narrativa procedentes de *Cultist Simulator*. Cualquier afirmacion sobre el corpus de ajuste seria especulativa.

## Capacidades

- Generacion de texto narrativo y de rol, presumiblemente orientada a interacciones tipo simulacion de partidas, aunque la ficha no lo detalla.
- Generacion de texto general y razonamiento basico, por herencia de la familia Qwen3-4B.
- Capacidades multilingues: no confirmadas en la ficha; dependen del ajuste fino original.
- Soporte de *tool calling* / *function calling*: no disponible en la ficha; la familia Qwen3 lo incluye, pero no hay garantia de que el ajuste fino lo preserve.
- Soporte de agentes y razonamiento multi-paso: no disponible en la ficha.
- Capacidades de vision o audio: no disponibles.
- Modo *thinking* explicito: no disponible en la ficha.

## Casos de uso

- Simulacion narrativa y rol por turnos en local: el modelo puede gestionar conversaciones multi-turno con contexto largo si conserva la ventana de la familia base, lo que permite mantener el estado de una partida sin reenviar todo el historial en cada interaccion.
- Prototipado de personajes no jugadores (NPC) para videojuegos: al ejecutarse con llama.cpp u Ollama en una estacion de trabajo, se puede integrar en un bucle de juego y generar respuestas de personaje sin coste por token.
- Generacion procedimental de eventos y descripciones: util para crear texto de ambientacion Lovecraftiana o de descubrimiento de cartas en un juego de gestion de recursos.
- Asistente de *lore* y consulta de reglas: un chatbot local que responda dudas sobre un universo ficticio concreto, siempre que el ajuste fino haya absorbido ese conocimiento.
- Evaluacion de tecnicas de cuantizacion: el repositorio ofrece doce niveles distintos del mismo modelo, lo que permite medir la degradacion de calidad narrativa entre `Q2_K` y `Q8_0` en la misma tarea.
- Despliegue en entornos sin conectividad o con requisitos de privacidad: la inferencia es totalmente local, sin envio de prompts a servicios externos.
- Investigacion sobre *roleplay* y seguridad en modelos pequenos: permite estudiar sesgos de personaje, jailbreaks y deriva de personalidad en un modelo de 4B ejecutable en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se dispone de evaluaciones del modelo original `Cecilis/cultist-simulator-qwen3-4b` en la busqueda realizada.

## Requisitos de hardware

- VRAM estimada para inferencia (orientativa, derivada del tamano de 4B parametros y no de datos oficiales):
  - `Q2_K`: en torno a 2 GB de pesos.
  - `Q3_K_S` / `Q3_K_M` / `Q3_K_L`: en torno a 2-2,5 GB.
  - `Q4_K_S` / `Q4_K_M` / `IQ4_XS`: en torno a 2,5-3 GB.
  - `Q5_K_S` / `Q5_K_M`: en torno a 3-3,5 GB.
  - `Q6_K`: en torno a 3,5-4 GB.
  - `Q8_0`: en torno a 4,5 GB.
  - `f16`: en torno a 8 GB.
  Estas cifras corresponden solo a los pesos; hay que anadir el coste de la cache KV, que crece con la longitud de contexto.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM permite las cuantizaciones de 4 bits con contexto moderado (RTX 3060, RTX 4060, RTX 2070). Para `Q8_0` o `f16` conviene una RTX 3090, RTX 4090, A100 o H100. En CPU, el modelo es viable con 8-16 GB de RAM.
- Cabe en GPU de consumo: si, en todas las cuantizaciones de 4 bits hacia abajo; `Q8_0` entra en tarjetas de 8 GB con contexto corto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y servidores compatibles con GGUF. vLLM y TGI soportan GGUF de forma limitada y no son la via recomendada para este formato.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `mradermacher/cultist-simulator-qwen3-4b-GGUF` | ~4B | No disponible en la ficha | No disponible | GGUF, 12 cuantizaciones | Ajuste fino tematico cuantizado |
| `Qwen/Qwen3-4B` (base de la familia) | ~4B | 32.768 tokens nativos, ampliable | Apache 2.0 | Safetensors y GGUF de terceros | Referencia de arquitectura y capacidades generales |
| `mradermacher/Qwen3-4B-Base-GGUF` | ~4B | El de la familia base | Apache 2.0 | GGUF | Mismo cuantizador, modelo sin ajuste tematico |
| `Llama-3.2-3B-Instruct` | ~3B | 128.000 tokens | Licencia comunitaria de Meta | Safetensors, GGUF | Alternativa de tamano similar para generacion instruida |
| `google/gemma-2-2b-it` | ~2B | 8.192 tokens | Gemma Terms of Use | Safetensors, GGUF | Alternativa mas pequena, contexto menor |

La comparacion de rendimiento entre estos modelos no es posible con la informacion disponible, ya que no hay benchmarks publicados para el ajuste fino objeto de esta ficha.

## Limitaciones y advertencias

- La model card no declara licencia. No se puede asumir uso comercial permitido hasta que el autor del ajuste fino lo aclare por escrito.
- No hay informacion sobre el dataset de ajuste, por lo que se desconocen sesgos, idiomas cubiertos y posibles contenidos problematicos.
- Riesgo de alucinacion elevado en un modelo de 4B, especialmente si se le pide precisión factual sobre reglas de juego o *lore* especifico.
- El tema del ajuste (*Cultist Simulator*) puede implicar contenido de ficcion con violencia, ocultismo o terror; conviene revisar las salidas antes de exponerlas a usuarios finales.
- Al ser una cuantizacion, las versiones de 2 y 3 bits pueden degradar notablemente la coherencia narrativa y la adherencia al personaje; se recomienda validar la calidad en `Q4_K_M` o superior.
- El contexto efectivo depende del ajuste fino y no de la familia base; no hay confirmacion de que se conserve la ventana completa de Qwen3-4B.
- La fecha de creacion indicada es anomala y el repositorio no tiene descargas ni *likes*, por lo que no existe validacion comunitaria de su calidad.
- No se debe confundir con un modelo oficial de Qwen ni con un producto de Weather Factory (creadora de *Cultist Simulator*); es un ajuste no oficial.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/cultist-simulator-qwen3-4b-GGUF
- Modelo original ajustado: https://huggingface.co/Cecilis/cultist-simulator-qwen3-4b
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Ejemplo de cuantizacion de la misma familia: https://huggingface.co/mradermacher/Qwen3-4B-Base-GGUF
- Familia Qwen3 en LM Studio: https://lmstudio.ai/models/qwen3
- Qwen3 4B en Ollama: https://ollama.com/library/qwen3:4b
