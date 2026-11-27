# Bayhakl1/GrimmCoder_v2

## Resumen

GrimmCoder_v2 es un modelo de lenguaje especializado en generacion y completado de codigo Python, desarrollado por Bayhakl1 y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un transformer decoder-only de estilo LLaMA entrenado desde cero, con aproximadamente 107 millones de parametros totales (100,69 millones sin contar embeddings) y una longitud de contexto de 2048 tokens. Su proposito es ofrecer un modelo ligero y desplegable en hardware modesto para tareas de autocompletado de codigo y relleno de huecos (fill-in-the-middle).

El modelo se presenta como la fase 2 de un entrenamiento en dos etapas: un preentrenamiento sobre `bigcode/starcoderdata` (7,93 mil millones de tokens) seguido de un ajuste fino sobre `Avelina/python-edu-cleaned` (774,1 millones de tokens, 6000 pasos con decaimiento coseno de 1e-4 a 1e-5). Esta orientado exclusivamente a Python y soporta tanto completado izquierda-a-derecha como FIM en formatos PSM y SPM.

Su relevancia actual radica en que demuestra que un modelo de apenas 107M de parametros puede resolver una fraccion medible de problemas de HumanEval (9,15% pass@1 en modo greedy) con una validez sintactica superior al 90% en varias configuraciones de decodificacion, lo que lo hace util para entornos con recursos limitados, prototipado rapido y experimentacion educativa en torno a modelos de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA (`LlamaForCausalLM`, pre-norm, RoPE, SwiGLU, GQA, embeddings ligados) |
| Parametros totales | ~106.980.096 (~100,69M sin embeddings) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones oficiales) |
| Idiomas soportados | codigo (Python) e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Especificaciones adicionales de arquitectura:

| Parametro | Valor |
|---|---|
| Hidden size (d_model) | 768 |
| Numero de capas | 16 |
| Cabezas de atencion | 12 query / 4 KV (GQA) |
| Tamano intermedio FFN | 2048 (SwiGLU) |
| Vocabulario | 8192 (BPE a nivel de byte entrenado sobre Python) |
| Tokens de entrenamiento | ~8,70B totales (7,93B preentrenamiento + 774,1M ajuste fino) |
| Perdida de validacion | 1,2260 (paso 6000) |

## Arquitectura y entrenamiento

GrimmCoder_v2 es un transformer decoder-only con la arquitectura LLaMA clasica: normalizacion pre-norm, embeddings rotatorios (RoPE), activacion SwiGLU, atencion con query grouping (GQA, 12 cabezas de query y 4 de clave/valor) y embeddings de entrada y salida ligados. Con 16 capas, dimension oculta de 768 y FFN de 2048, el modelo queda en torno a los 107M de parametros, un tamano que permite inferencia en CPU y GPU de gama baja.

El entrenamiento se realizo en dos fases. La primera consistio en un preentrenamiento sobre `bigcode/starcoderdata` hasta alcanzar 7,93 mil millones de tokens. La segunda fase, de la que resulta esta version, ajusto el modelo sobre `Avelina/python-edu-cleaned` durante 6000 pasos con una tasa de aprendizaje con decaimiento coseno de 1e-4 a 1e-5, sumando 774,1 millones de tokens adicionales. El vocabulario de 8192 tokens se entreno especificamente sobre codigo Python con BPE a nivel de byte. El modelo fue entrenado de forma nativa para FIM, con una proporcion 50/50 entre los formatos PSM y SPM, e incorpora tokens especiales dedicados (`<|fim_prefix|>`, `<|fim_middle|>`, `<|fim_suffix|>`, `<|endoftext|>`, `<|pad|>`). No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de codigo Python izquierda-a-derecha a partir de un prompt o firma de funcion.
- Completado fill-in-the-middle (FIM) nativo, insertando codigo entre un prefijo y un sufijo, con soporte de formatos PSM y SPM.
- Generacion de codigo sintacticamente valido en la mayoria de los casos (hasta 96,3% de validez sintactica en HumanEval con decodificacion muestreada).
- Manejo de tokens especiales dedicados para delimitar documentos y tareas FIM.
- Capacidad limitada de razonamiento y resolucion de problemas de programacion (9,15% pass@1 en HumanEval).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a codigo Python e ingles; no se documentan otros lenguajes naturales.
- Capacidades de vision o audio: no disponibles.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Autocompletado en editores de codigo: el modelo puede integrarse como motor de completado en-linea en IDE o editores ligeros, generando continuaciones de funciones Python a partir de la firma y el contexto previo, gracias a su ventana de 2048 tokens y su entrenamiento especifico en Python.
- Relleno de huecos en refactorizacion: mediante FIM, permite insertar el cuerpo de una funcion entre la firma y las llamadas posteriores, util en herramientas que reescriben o completan bloques de codigo existentes.
- Asistencia en notebooks educativos: su entrenamiento sobre `Avelina/python-edu-cleaned` lo hace adecuado para generar ejemplos y ejercicios de Python en entornos de aprendizaje, con bajo coste computacional.
- Prototipado rapido en local: al caber en GPU de consumo y en CPU, sirve para experimentar con pipelines de generacion de codigo sin depender de APIs externas ni de infraestructura grande.
- Generacion de tests unitarios sencillos: puede completar esqueletos de funciones de test a partir de la firma y del codigo bajo prueba, siempre con revision humana dada su tasa de acierto limitada.
- Investigacion sobre modelos de codigo pequenos: util como linea base reproducible para estudiar tecnicas de FIM, tokenizacion BPE sobre Python y ajuste fino en dominios acotados.
- Despliegue en entornos con restricciones de privacidad: su tamano reducido y licencia Apache 2.0 permiten ejecutarlo on-premise para completado de codigo sin enviar datos a servicios externos.

## Benchmarks y rendimiento

Evaluacion sobre `openai/openai_humaneval` (164 problemas de Python) con `transformers` en bfloat16 sobre CUDA:

| Modelo | Modo y decodificacion | pass@1 | Resueltos | Sintaxis valida |
|---|---|---|---|---|
| GrimmCoder_v2 | L2R greedy (`do_sample=False`) | 9,15% | 15/164 | 137/164 (83,5%) |
| GrimmCoder_v2 | L2R `t=0.2, rep=1.1` | 9,15% | 15/164 | 158/164 (96,3%) |
| GrimmCoder_v2 | FIM (PSM) greedy | 9,15% | 15/164 | 151/164 (92,1%) |
| GrimmCoder_v2 | FIM (PSM) `t=0.2, rep=1.1` | 8,54% | 14/164 | 153/164 (93,3%) |
| GrimmCoder (base preentrenamiento) | L2R greedy | 5,49% | 9/164 | 126/164 (76,8%) |
| GrimmCoder (base preentrenamiento) | L2R `t=0.2, rep=1.1` | 4,88% | 8/164 | 155/164 (94,5%) |
| GrimmCoder (base preentrenamiento) | FIM (PSM) greedy | 4,27% | 7/164 | 122/164 (74,4%) |

Problemas distintos resueltos en conjunto entre todos los modos evaluados: 20/164 (HumanEval/12, 16, 22, 23, 28, 29, 30, 31, 34, 35, 42, 45, 48, 50, 52, 53, 55, 58, 60, 61).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~107M de parametros; en bfloat16 ocupa aproximadamente 214 MB de pesos, y en float32 unos 428 MB. Con overhead de activaciones y cache KV para 2048 tokens, la inferencia cabe holgadamente en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; funciona en RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problemas, aunque las GPU de gama alta estaran infrautilizadas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (soporte nativo documentado), `text-generation-inference` (etiqueta presente en el repo) y endpoints compatibles. No se documenta soporte explicito de llama.cpp, Ollama o TGI en la informacion disponible, aunque el formato safetensors permite conversion a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GrimmCoder_v2 | ~107M | 2048 | 9,15% (greedy) | Apache 2.0 | Hugging Face |
| GrimmCoder (base) | ~107M | 2048 | 5,49% (greedy) | Apache 2.0 | Hugging Face |
| Alternativas de ~100M especializadas en codigo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks de modelos comparables de tamano similar (por ejemplo, variantes pequenas de CodeParrot, CodeGen o SantaCoder) que permitan una comparacion cuantitativa fiable. La unica comparacion directa disponible es con el checkpoint base de preentrenamiento del mismo autor, que GrimmCoder_v2 supera en pass@1 (9,15% frente a 5,49%) y en validez sintactica.

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo modelo generativo de codigo, puede producir APIs inexistentes, imports invalidos o logica incorrecta que compile pero no funcione.
- Rendimiento limitado: un pass@1 del 9,15% en HumanEval implica que mas del 90% de los problemas no se resuelven correctamente; no es adecuado como unico generador en produccion sin revision humana.
- Ambito restringido a Python: el modelo fue entrenado exclusivamente sobre codigo Python; no se garantiza un rendimiento aceptable en otros lenguajes.
- Idioma: solo se documentan capacidades en codigo e ingles; no hay soporte de castellano ni de otros idiomas naturales.
- Ventana de contexto corta: 2048 tokens limita el contexto disponible para archivos grandes o conversaciones multi-turno.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; al entrenarse sobre datos de codigo publico, puede reproducir patrones y estilos presentes en `bigcode/starcoderdata`.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones de los datasets de entrenamiento (`bigcode/starcoderdata` y `Avelina/python-edu-cleaned`) por si imponen restricciones adicionales sobre los pesos derivados.
- Caveat para produccion: el modelo tiene un numero muy bajo de descargas (210) y likes (1), y fue creado en noviembre de 2026; no cuenta con un ecosistema de validacion amplio, por lo que conviene evaluarlo en el dominio concreto antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bayhakl1/GrimmCoder_v2
- Dataset de ajuste fino: https://huggingface.co/datasets/Avelina/python-edu-cleaned
- Dataset de preentrenamiento: https://huggingface.co/datasets/bigcode/starcoderdata
- Benchmark HumanEval: https://huggingface.co/datasets/openai/openai_humaneval
