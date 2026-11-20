# onemunanoyo/gemma4-E2B-Abliterated-GGUF

## Resumen

gemma4-E2B-Abliterated-GGUF es una variante "abliterated" del modelo google/gemma-4-E2B-it, publicada por el usuario onemunanoyo. La abliteration es una tecnica de modificacion de pesos que elimina la direccion de rechazo aprendida por el modelo durante el alineamiento, de forma que el modelo deja de negarse a responder solicitudes que el modelo base rechazaria. En este caso, el autor calculo la direccion de rechazo a partir de 64 prompts daninos y 32 inofensivos en japones, la ortogonalizo contra la matriz de embeddings y las matrices de escritura residual de las capas 0 a 26, y convirtio el resultado a GGUF.

El modelo conserva la arquitectura y el tamano del base (4.628.569.635 parametros totales), con capacidades de generacion de texto, conversacion y un modo thinking integrado en su plantilla de chat. Se distribuye exclusivamente en formato GGUF (bf16, Q8_0, Q6_K y Q4_K_M), pensado para llama.cpp, llama-server y LM Studio, con ficheros auxiliares (tokenizer, chat template, config) para su uso desde transformers o vLLM.

Es relevante ahora como artefacto de investigacion sobre alineamiento y seguridad: el propio autor lo describe como un "experimento de banco de pruebas" y no lo recomienda para produccion. Los datos publicados muestran una reduccion drastica del rechazo en contenido NSFW (del 87% al 5%) a costa de un aumento de la obediencia a solicitudes de ciberataque, lo que lo convierte en un caso de estudio de los efectos secundarios de la abliteration.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, con PLE / per_layer_embd_out), no disponible el detalle completo |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (GGUF) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 (sujeta a los terminos de Google Gemma) |
| Formato de pesos | GGUF exclusivamente; no se publican safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer de aproximadamente 4.630 millones de parametros. La model card menciona compatibilidad con el mecanismo PLE de Gemma 4 (`per_layer_embd_out` y similares), lo que obliga a usar una version de llama.cpp que soporte dicha arquitectura; el autor verifico el funcionamiento con el build b11560. No se detalla en la informacion disponible la composicion del dataset de preentrenamiento ni si el modelo base uso RLHF o DPO.

La innovacion tecnica es la abliteration: se construyo una direccion de rechazo a partir de 64 prompts daninos y 32 inofensivos en japones, calculada en la capa 27 y en la posicion -1. Esa direccion se ortogonalizo contra `embed_tokens` y las matrices de escritura residual de las capas 0 a 26, de modo que se elimina la componente de rechazo de las activaciones. Posteriormente el modelo se convirtio a GGUF en BF16 y se cuantizo con `llama-quantize` a Q8_0, Q6_K y Q4_K_M. No se publica la version en safetensors del modelo modificado.

## Capacidades

- Generacion de texto y conversacion multi-turno en japones e ingles.
- Modo thinking integrado en la plantilla de chat (activable o desactivable).
- Razonamiento aritmetico y logico basico: 7/7 en la bateria de 7 preguntas de aritmetica y logica reportada por el autor.
- Respuesta sin rechazo a contenido NSFW explicito cuando el thinking esta desactivado (81% de respuestas con contenido explicito en la evaluacion del autor).
- Capacidades multimodales: la presencia de `processor_config.json` sugiere soporte de preprocesamiento multimodal heredado del base, aunque no se detalla en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: permite estudiar como la eliminacion de la direccion de rechazo afecta al comportamiento del modelo, comparando directamente con el base en las mismas tareas y con las metricas del autor (rechazo NSFW, PPL, aritmetica).
- Analisis de robustez de filtros de seguridad: util para evaluar si los clasificadores de contenido y las capas de moderacion externas detectan respuestas que el modelo base rechazaria, usando el modelo como generador adversarial controlado.
- Experimentos de calibracion de cuantizacion: los cuatro GGUF publicados (bf16, Q8_0, Q6_K, Q4_K_M) permiten medir como la cuantizacion degrada o preserva el efecto de la abliteration; el autor documenta que Q4_K_M reintroduce hedging.
- Evaluacion de perplexity en japones: los datos del autor muestran una PPL de 0.91x en formato chat y 0.90x en texto tecnico respecto al base, lo que permite usar el modelo en estudios de calidad linguistica tras la modificacion de pesos.
- Pruebas de despliegue en llama.cpp: sirve como banco de pruebas para validar el soporte de la arquitectura Gemma 4 (PLE) en versiones concretas de llama.cpp, llama-server y LM Studio.
- Estudio de sesgos y efectos secundarios: el incremento de obediencia a solicitudes de ciberataque (de 9 a 13 sobre 25) lo hace util para cuantificar el coste de seguridad de la abliteration en un entorno de laboratorio aislado.
- Generacion creativa de ficcion para adultos en japones: con thinking desactivado y cuantizacion Q8_0, el modelo produce narrativa explicita sin rechazo, segun las mediciones del autor.

## Benchmarks y rendimiento

Datos publicados por el autor (evaluacion con thinking desactivado, greedy, sin limite de generacion; medidas sobre la version safetensors, con GGUF derivado de la misma conversion BF16):

| Metrica | Base (gemma-4-E2B-it) | Este modelo |
|---|---|---|
| Rechazo en 84 prompts NSFW explicitos | 87% | 5% |
| Respuestas con contenido explicito | 10% | 81% |
| Respuestas con cuerpo (incluye eufemismos) | 13% | 95% |
| PPL japones (formato chat) | 1.00x | 0.91x |
| PPL japones (texto tecnico) | 1.00x | 0.90x |
| Aritmetica y logica (7 preguntas) | 7/7 | 7/7 |
| Sobre-rechazo en 48 prompts inofensivos | 0 | 0 |

Advertencias del propio autor: 64 de los 84 prompts de evaluacion se usaron para construir la direccion de rechazo, por lo que hay fuga de datos; el rechazo se midio con un clasificador automatico (91% de concordancia con etiquetas humanas) sin verificacion visual. El 5% de rechazo residual incluye 1 rechazo completo y 3 evasivas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9 GB para bf16 (8.64 GB de pesos), unos 5 GB para Q8_0 (4.61 GB), 4 GB para Q6_K (3.57 GB) y 3.5 GB para Q4_K_M (3.18 GB), mas overhead de contexto KV.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q6_K o Q8_0; para bf16 se recomienda 12 GB o mas. No se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB para Q6_K (opcion indicada por el autor para 8 GB de VRAM) y en tarjetas de 12 GB o mas para Q8_0 o bf16.
- Opciones de despliegue: llama.cpp (build b11560 o superior con soporte Gemma 4 PLE), llama-server, LM Studio; para transformers o vLLM se deben usar los ficheros auxiliares del repositorio (tokenizer.json, chat_template.jinja, config.json, generation_config.json) y consultar la documentacion oficial de vLLM para la carga de GGUF, ya que los flags cambian segun la version.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma4-E2B-Abliterated (este) | 4.628.569.635 | no disponible | Apache 2.0 | GGUF | Abliterated, solo ja/en, sin safetensors |
| google/gemma-4-E2B-it (base) | 4.628.569.635 | no disponible | Apache 2.0 / terminos Gemma | no disponible | Modelo original alineado, con rechazo activo |
| Otras variantes abliterated de Gemma | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion sobre modelos comparables de otros autores con la misma tecnica o tamano en la informacion proporcionada.

## Limitaciones y advertencias

- El autor lo define explicitamente como un artefacto experimental de banco de pruebas, no apto para produccion.
- El modo thinking debe desactivarse explicitamente (`-rea off` en llama.cpp); si se deja activo, el modelo razona sobre politicas de seguridad y vuelve a rechazar.
- La cuantizacion Q4_K_M degrada el efecto: el modelo anade preambulos de advertencia y respuestas eufemisticas en lugar de contenido directo. Se recomienda Q8_0 o Q6_K.
- Aumento de obediencia a solicitudes de ciberataque daninas: de 9 a 13 sobre 25 en la evaluacion del autor, incluyendo creacion de phishing, robo de contrasenas ajenas y DDoS.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el autor solo reporta PPL y una bateria de 7 preguntas de aritmetica.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas limitados a japones e ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Fuga de datos en la evaluacion: 64 de los 84 prompts de NSFW se usaron para construir la direccion de rechazo, por lo que las cifras de rechazo pueden estar sobreestimadas.
- Restricciones de licencia: Apache 2.0 con sujecion a los terminos de Google Gemma; el uso comercial esta permitido por la licencia, pero el comportamiento del modelo (ausencia de rechazo) plantea riesgos de cumplimiento y reputacion en entornos de produccion.
- Solo se distribuyen pesos GGUF; no hay safetensors del modelo modificado, lo que limita el ajuste fino y la integracion directa con frameworks que no lean GGUF.
- Requiere una version de llama.cpp que soporte la arquitectura Gemma 4 con PLE; versiones anteriores fallaran al cargar el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/onemunanoyo/gemma4-E2B-Abliterated-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
