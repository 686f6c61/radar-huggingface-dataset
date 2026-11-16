# Cialtion/SimpleFun-Gemma4-E2B-4Head-v3-BF16

## Resumen

SimpleFun-Gemma4-E2B-4Head-v3-BF16 es un ajuste fino (fine-tune) del modelo google/gemma-4-E2B-it publicado por el usuario Cialtion en Hugging Face. Se trata de un modelo derivado orientado a generacion de texto conversacional con una peculiaridad estructural: incorpora cuatro "canales" o cabeceras logicas de decodificacion (`<speech>`, `<expression>`, `<inner>` y `<command>`) que comparten los mismos pesos del modelo y se decodifican de forma independiente a partir del mismo prompt de sistema y usuario. El modelo conserva la licencia Gemma original y esta pensado para acompanar a un personaje conversacional (SimpleFun/SimpleLove).

El modelo parte de la familia Gemma 4 E2B, que emplea embeddings por capa (PLE, per-layer embeddings) y un vocabulario ampliado hasta 262.148 entradas para acomodar los cuatro tokens de canal (ids 262.144 a 262.147). El repositorio contiene 4.628.611.363 elementos tensoriales almacenados en BF16 (9,3 GB), con el embedding de salida atado (tied) almacenado una sola vez. El autor advierte explicitamente de que los nombres de familia E2B/E4B no implican un numero exacto de parametros de 2.000 o 4.000 millones.

Su relevancia es acotada: no es un modelo de proposito general ni compite en benchmarks abiertos, sino un artefacto de investigacion y experimentacion sobre dialogo de personaje con multiples canales de salida (habla, expresion, narracion interna y comandos de herramienta). La model card es inusualmente detallada en cuanto al contrato de prompt y las precauciones de conversion, lo que lo hace util como referencia tecnica para quien trabaje con fine-tunes de Gemma 4 y decodificacion multi-canal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4 E2B) con embeddings por capa (PLE) y vocabulario extendido a 262.148 entradas |
| Parametros totales | 4.628.611.363 elementos tensoriales almacenados (BF16); el autor advierte que el nombre E2B no implica 2.000 millones exactos |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; pesos publicados en BF16 |
| Idiomas soportados | zh, en, ja |
| Licencia | gemma (licencia Gemma original) |
| Formato de pesos | safetensors (BF16), compatible con transformers |
| Modelo base | google/gemma-4-E2B-it |
| Tamano del repositorio | 9,3 GB |
| Tokens especiales de canal | `<speech>` (262144), `<expression>` (262145), `<inner>` (262146), `<command>` (262147) |
| Token de parada | `<turn|>` (id 106) |
| Temperatura de muestreo por defecto | 0,7 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 4 E2B, con la innovacion propia de esta familia de embeddings por capa (PLE, per-layer embeddings): cada capa dispone de su propia tabla de embeddings, y el autor insiste en que las filas PLE de los cuatro tokens de canal entrenados deben conservarse durante cualquier conversion o cuantizacion. El vocabulario se amplia de 262.144 a 262.148 entradas para alojar los cuatro marcadores de canal. Los pesos se publican en BF16 con el embedding de salida atado almacenado una unica vez, lo que explica que el numero de elementos tensoriales (4.628.611.363) no coincida con un recuento ingenuo de parametros.

El ajuste se realizo mediante LoRA con r=128 y alpha=256, durante una epoca sobre 16.609 turnos de dialogo. El resultado es un modelo completamente fusionado (merged), de modo que no requiere el modelo base ni un adaptador PEFT en inferencia. No se documentan en la model card el numero total de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. La innovacion funcional es el esquema multi-cabecera: cada uno de los cuatro canales se decodifica de forma independiente desde el mismo prefijo visible de sistema y usuario, compartiendo pesos, con un contrato de prompt estricto que incluye un canal de pensamiento vacio explicitamente cerrado (`<|channel>thought<channel|>`) antes del marcador de canal seleccionado. No se generan tokens de razonamiento en este protocolo.

## Capacidades

- Generacion de texto conversacional multi-turno en chino, ingles y japones.
- Decodificacion multi-canal: produce salida separada para habla (`<speech>`), expresion (`<expression>`), narracion interna del personaje (`<inner>`) y comandos (`<command>`), cada una desde el mismo prompt.
- Soporte de tool calling mediante el canal `<command>`, sujeto a validacion en la aplicacion contra las declaraciones de herramientas vigentes.
- Personificacion con estado interno: el canal `<inner>` proporciona narracion privada del personaje, que el autor distingue explicitamente del razonamiento o chain-of-thought.
- Contrato de prompt estructurado: mensajes de sistema con persona, JSON de expresiones y JSON de herramientas; mensaje de usuario como JSON compacto con historial, memorias y consulta.
- No incluye vision, audio, ASR, TTS ni codificacion de imagen: el repositorio contiene unicamente pesos de texto.
- No se documentan capacidades de razonamiento matematico, generacion de codigo ni agentes multi-paso mas alla del canal de comandos.

## Casos de uso

- Dialogo de personaje con expresividad separada: el modelo permite generar en una misma interaccion el texto hablado y una etiqueta de expresion independiente, lo que facilita animar avatares o VTubers sin post-procesar el texto con un clasificador aparte.
- Companero conversacional con memoria: el contrato de prompt admite un JSON de usuario con historial y memorias, adecuado para asistentes de personaje que mantienen contexto persistente entre sesiones.
- Narracion interna para narrativa interactiva: el canal `<inner>` permite que el personaje "piense" en privado mientras el canal `<speech>` produce el dialogo visible, util en videojuegos y ficcion interactiva.
- Ejecucion controlada de comandos: el canal `<command>` puede emplearse para que el personaje invoque herramientas declaradas en el JSON de sistema, siempre que la aplicacion valide cada comando antes de ejecutarlo.
- Experimentacion con decodificacion multi-cabecera: sirve como referencia para investigadores que quieran replicar el esquema de cuatro canales sobre Gemma 4 con vLLM, ya que el autor indica que la inferencia de benchmark existente uso vLLM.
- Prototipado de personajes multilingues: al cubrir zh, en y ja, permite desplegar un mismo personaje en comunidades de habla china, inglesa y japonesa sin reentrenar.
- Base para adaptacion a movil: el autor menciona que la adaptacion y cuantizacion para iPhone es un paso separado no cubierto por esta publicacion, por lo que el modelo puede servir de punto de partida para ese trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que existio una inferencia de benchmark con cuatro cabeceras usando vLLM, pero no incluye cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,3 GB solo para pesos, mas memoria para cache KV y activaciones; en la practica se recomienda al menos 16 GB de VRAM para contexto moderado.
- Cuantizacion a 8 bits: en torno a 5 GB de pesos; a 4 bits: en torno a 2,5-3 GB, mas overhead. El autor no publica recetas de cuantizacion y advierte de que no se descarten las filas PLE durante la conversion.
- GPU recomendadas: A100 o H100 para BF16 sin restricciones; RTX 4090 (24 GB) para BF16 con margen; RTX 3090 (24 GB) igualmente viable; GPUs consumer de 8-12 GB solo con cuantizacion.
- Despliegue: transformers (libreria declarada), vLLM (usado por el autor para el benchmark de cuatro cabeceras); no se documentan integraciones con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Inferencia en iPhone: el autor indica que la adaptacion y cuantizacion para iPhone es un paso separado y no queda establecida por esta publicacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| SimpleFun-Gemma4-E2B-4Head-v3-BF16 | 4.628.611.363 elementos tensoriales | no disponible | zh, en, ja | gemma | Fine-tune multi-canal sobre Gemma 4 E2B; sin benchmarks publicados |
| google/gemma-4-E2B-it | no disponible en la informacion proporcionada | no disponible | no disponible | gemma | Modelo base instructivo; sin canales adicionales |
| Otros fine-tunes de Gemma 4 E2B | no disponible | no disponible | no disponible | gemma | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No hay benchmarks publicados, por lo que no puede evaluarse su calidad frente al modelo base ni frente a alternativas.
- Riesgo de alucinacion no cuantificado; al ser un fine-tune sobre 16.609 turnos de dialogo, la cobertura tematica es probablemente estrecha.
- El canal `<command>` no debe ejecutarse sin validacion en la aplicacion contra las declaraciones de herramientas vigentes.
- El canal `<inner>` es narracion interna del personaje y no debe interpretarse como razonamiento o chain-of-thought.
- La licencia Gemma impone sus terminos de uso, incluida la politica de uso aceptable de Google; el uso comercial esta sujeto a dicha licencia.
- El autor advierte de que no deben descartarse las filas PLE durante la conversion o cuantizacion, lo que aumenta el riesgo de degradacion si se usan herramientas de conversion estandar sin adaptacion.
- El repositorio solo contiene pesos de texto: no hay vision, audio, ASR, TTS ni modelo de canto.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.
- La fecha de creacion declarada (2026-11-16) y el nombre "gemma-4" no pueden verificarse con la informacion disponible; conviene confirmar la procedencia antes de usarlo en produccion.
- Idiomas limitados a zh, en y ja; no se declara soporte de castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cialtion/SimpleFun-Gemma4-E2B-4Head-v3-BF16
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios ni demos adicionales.
