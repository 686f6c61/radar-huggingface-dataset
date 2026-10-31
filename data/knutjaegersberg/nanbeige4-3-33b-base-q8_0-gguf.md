# KnutJaegersberg/Nanbeige4.3-33B-Base-Q8_0-GGUF

## Resumen

Nanbeige4.3-33B-Base-Q8_0-GGUF es una cuantización en formato GGUF (Q8_0) del modelo base Nanbeige4.3-33B-Base, desarrollado por el equipo Nanbeige. La conversión ha sido realizada por el usuario KnutJaegersberg mediante el espacio automatizado GGUF-my-repo de Hugging Face, que utiliza llama.cpp como motor de conversión. El modelo original es un modelo de lenguaje de 33.118.977.024 parámetros orientado a generación de texto, con soporte de inglés y chino.

Esta ficha se centra en la versión cuantizada, pensada para ejecución local con llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, etc.). La cuantización Q8_0 ofrece una pérdida mínima de calidad respecto a los pesos en FP16, a cambio de un tamaño de archivo considerable: el repositorio ocupa 35,2 GB. Al tratarse de un modelo base (no instruido), está diseñado para completar texto y para ser ajustado posteriormente (fine-tuning) o usado con prompts de completado, no para conversación directa sin plantilla adecuada.

Su relevancia actual radica en la combinación de un tamaño medio-grande (33B), una licencia Apache 2.0 permisiva y soporte bilingüe inglés-chino, lo que lo hace adecuado para despliegues locales en entornos que necesiten procesar contenido en chino sin depender de servicios externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, compatible con llama.cpp) |
| Parametros totales | 33.118.977.024 (≈33,1 B) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa -c 2048) |
| Tipos de cuantizacion | Q8_0 (esta version); el modelo original en safetensors |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta version); safetensors en el modelo original |

## Arquitectura y entrenamiento

No se han publicado detalles tecnicos sobre la arquitectura interna del modelo en la informacion disponible: numero de capas, dimensiones ocultas, mecanismos de atencion concretos o vocabulario no estan especificados. Se sabe que es un modelo transformer compatible con llama.cpp, lo que implica una arquitectura decoder-only estandar. Al ser la variante "Base", corresponde al modelo preentrenado, sin pasar por la fase de alineacion con instrucciones (RLHF, DPO o SFT) que suelen llevar las versiones "Chat" o "Instruct".

Tampoco se dispone de datos sobre el corpus de entrenamiento (numero de tokens, composicion del dataset o proporciones entre ingles y chino). La cuantizacion Q8_0 emplea un esquema de 8 bits por peso con bloques de escala, que reduce el tamaño a aproximadamente un byte por parametro (≈33 GB para 33B parametros, coherente con los 35,2 GB del repositorio) con degradacion de calidad practicamente despreciable frente a FP16.

## Capacidades

- Generacion de texto en ingles y chino: como modelo base, predice la continuacion mas probable de un texto dado, util para completado, escritura asistida y generacion libre.
- Base para fine-tuning: al ser un modelo base con licencia Apache 2.0, es apto como punto de partida para ajustes especificos de dominio (LoRA, QLoRA, full fine-tuning).
- Ejecucion local con llama.cpp: el formato GGUF permite inferencia en CPU, GPU o sistemas hibridos CPU+GPU, incluidos Mac con Apple Silicon.
- No disponible: no hay informacion sobre tool calling, capacidades de agentes, vision, audio ni modo de razonamiento extendido. Al tratarse de un modelo base sin alineacion por instrucciones, no se recomienda esperar seguimiento fiable de instrucciones ni function calling sin ajuste previo.

## Casos de uso

- Completado de texto y codigo en entornos locales: integrable en editores mediante llama.cpp como backend, aprovechando su naturaleza de modelo base para autocompletado tipo FIM o continuacion de codigo.
- Ajuste fino para dominios verticales: empresas que necesiten un LLM bilingue ingles-chino (por ejemplo, documentacion tecnica, traducción interna o soporte) pueden aplicar LoRA sobre esta base sin restricciones de licencia.
- Investigacion y evaluacion: util como baseline de 33B parametros en experimentos de cuantizacion, destilacion o evaluacion de benchmarks academicos, dada su licencia permisiva.
- Procesamiento de contenido en chino en local: organizaciones con requisitos de soberania de datos que necesiten generar o analizar texto en chino sin enviar datos a APIs externas.
- Servidores de inferencia autoalojados: despliegue con llama-server (incluido en llama.cpp) para ofrecer un endpoint de completado en red local.
- Generacion de datos sinteticos: como modelo base, puede usarse para generar corpus de preentrenamiento o aumentacion de datos en ingles y chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q8_0, el archivo pesa unos 33-35 GB, por lo que se necesitan aproximadamente 36-40 GB de VRAM para carga completa en GPU. En CPU pura es ejecutable pero lento; en Mac con memoria unificada de 48 GB o mas es viable.
- GPU recomendadas: Nvidia A100 (40/80 GB), H100, A6000 (48 GB) o dos RTX 3090/4090 (24 GB cada una) con offload de capas.
- Consumer GPU: no cabe completo en una sola RTX 4090 (24 GB). Opciones: usar offload parcial con llama.cpp (parte en GPU, parte en RAM), optar por una cuantizacion mas agresiva (Q4_K_M, ~20 GB) si existe, o usar Mac Studio con 48-64 GB de memoria unificada.
- Despliegue: llama.cpp (CLI y llama-server, con instrucciones concretas en la model card), Ollama, LM Studio y cualquier runtime compatible con GGUF. No hay soporte directo de vLLM o TGI para GGUF; para esos backends habria que usar los pesos safetensors del modelo original.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Idiomas | Formato |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-Base-Q8_0 | 33,1 B | Q8_0 | Apache 2.0 | en, zh | GGUF |
| Qwen2.5-32B (base) | 32,5 B | multiples (GGUF) | Qwen license (uso comercial condicionado) | 29+ idiomas | safetensors, GGUF |
| Yi-1.5-34B (base) | 34,4 B | multiples (GGUF) | Apache 2.0 | en, zh | safetensors, GGUF |
| CodeLlama-34B (base) | 34 B | multiples (GGUF) | Llama 2 license | en (codigo) | safetensors, GGUF |

Nanbeige4.3-33B compite en la franja de 30-35B parametros bilingues ingles-chino, donde Yi-1.5-34B y Qwen2.5-32B son las alternativas mas asentadas. Su ventaja diferencial es la licencia Apache 2.0 sin condiciones; su inconveniente es la falta de documentacion publica de benchmarks y una comunidad de soporte mas reducida.

## Limitaciones y advertencias

- Al ser un modelo base, no sigue instrucciones de forma fiable ni mantiene conversaciones multi-turno sin plantilla y ajuste adecuados; para chat habria que usar o entrenar una variante instruct.
- No hay benchmarks publicados para esta version, por lo que su calidad relativa frente a Qwen2.5-32B o Yi-1.5-34B no puede verificarse con datos.
- La longitud de contexto no esta documentada; el ejemplo de la model card usa 2048 tokens, lo que sugiere que contextos largos pueden no estar soportados o no estar probados.
- Riesgo de alucinacion tipico de modelos base: generan texto plausible sin veracidad garantizada; no aptos para respuestas factuales sin verificacion.
- Sesgos: no disponible informacion sobre auditorias de sesgo; al incluir chino e ingles, pueden heredar sesgos del corpus de entrenamiento no documentado.
- La cuantizacion Q8_0 exige ~35 GB de almacenamiento y ~36-40 GB de VRAM/memoria unificada, lo que limita el hardware elegible.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque conviene revisar los terminos del modelo base original.

## Enlaces

- Cuantizacion GGUF (esta ficha): https://huggingface.co/KnutJaegersberg/Nanbeige4.3-33B-Base-Q8_0-GGUF
- Modelo original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggergenov/llama.cpp
- Paper, blog oficial y demos: no disponibles en la informacion proporcionada.
