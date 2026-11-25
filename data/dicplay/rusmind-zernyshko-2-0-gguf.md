# DICPlay/RusMind-Zernyshko-2.0-GGUF

## Resumen

RusMind Zernyshko 2.0 es un modelo de lenguaje compacto de 342 millones de parametros, desarrollado desde cero por DICPlay como parte de la familia RusMind. Se trata de un transformer decoder de 26 capas y anchura 1024, con un tokenizador propio de 48.000 tokens entrenado especificamente sobre texto ruso. El modelo se distribuye principalmente en formato GGUF (Q8_0, Q4_K_M y F16) para su ejecucion local con llama.cpp, LM Studio u Ollama, con un peso que oscila entre 219 MB y 688 MB segun la cuantizacion.

El modelo aborda el nicho de asistentes conversacionales en ruso que funcionan completamente offline en hardware modesto, incluyendo telefonos moviles. A pesar de su tamano reducido, declara capacidades de aritmetica basica, generacion de codigo, salida estructurada en JSON, invocacion de herramientas (tool calling) y reconocimiento explicito de sus propios limites. Su ventana de contexto es de 4.096 tokens y emplea el formato de chat ChatML sin system prompt.

Su relevancia actual radica en dos factores: por un lado, es un ejemplo de entrenamiento from scratch verificable (con curva de perdida publicada y tokenizador propio) en un ecosistema dominado por modelos derivados de Llama; por otro, su licencia RusMind License restringe el uso comercial, lo que condiciona su adopcion en productos. La model card reporta una puntuacion de 0,054 en MERA 2.0 y 74/120 en una prueba practica interna, cifras que situan al modelo en un rango muy basico de competencia linguistica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (RMSNorm, RoPE, SwiGLU, GQA 16/4) |
| Parametros totales | 342.283.264 (26 capas x 1024) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | Q8_0 (367 MB), Q4_K_M (219 MB), F16 (688 MB) |
| Idiomas soportados | Ruso (modelo monoidioma) |
| Licencia | RusMind License (DICPlay) |
| Formato de pesos | GGUF (llama.cpp, LM Studio, Ollama); safetensors en repo separado |
| Vocabulario | 48.000 tokens, tokenizador propio entrenado en ruso |
| Formato de chat | ChatML (sin system prompt, sin BOS) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder de 26 capas con anchura 1024, normalizacion RMSNorm, embeddings posicionales rotatorios (RoPE), activacion SwiGLU y atencion con query grouping (GQA) con 16 cabezas de query y 4 de key/value. El tokenizador, de 48.000 tokens, fue entrenado especificamente sobre texto ruso, y la implementacion en PyTorch (`modeling_rusmind_ai.py`) es propia, sin reutilizar clases de otros modelos. La version GGUF emplea la disposicion estandar de llama.cpp para compatibilidad, lo que explica el campo `llama` en la arquitectura del fichero sin que exista relacion con los pesos de Meta.

El entrenamiento se realizo desde cero sobre 4.500 millones de tokens, combinando Wikipedia en ruso, web rusa, dialogos propios, codigo y tareas. Posteriormente se aplico un ajuste fino orientado a habilidades practicas: calculo, generacion de codigo, salida JSON, traduccion, invocacion de herramientas, cortesia y honestidad epistémica. La model card publica el log de entrenamiento (`training/train_300m.log`) y la curva de perdida, que arranca en 9,13 en el paso 50 (frente a ~10,8 de una inicializacion aleatoria con vocabulario de 48.000), como evidencia del entrenamiento desde cero. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional en ruso con formato ChatML.
- Aritmetica basica de varios pasos (sumas, problemas de velocidad, etc.).
- Generacion de codigo, aunque sin datos publicados sobre el alcance o los lenguajes cubiertos.
- Salida estructurada en JSON a partir de instrucciones en lenguaje natural.
- Tool calling / function calling: emite llamadas JSON a herramientas proporcionadas (por ejemplo, `weather`) con argumentos.
- Reconocimiento explicito de desconocimiento ("no lo se") como comportamiento entrenado.
- Traduccion mencionada entre las habilidades del ajuste fino, sin detalle de pares de idiomas.
- Ejecucion completamente offline en portatiles y telefonos moviles.
- Modelo monoidioma: no se declara soporte multilingue fuera del ruso.

## Casos de uso

- Asistente conversacional offline en movil: con la cuantizacion Q4_K_M (219 MB) el modelo cabe en telefonos de gama media y puede gestionar dialogos de 3 a 5 turnos de contexto, suficiente para consultas puntuales sin conexion.
- Extraccion de datos estructurados: convertir texto libre en ruso (por ejemplo, "El portatil cuesta 55.000 rublos") en JSON con campos definidos, util para pipelines de ingesta de documentos.
- Enrutamiento de herramientas en agentes ligeros: el modelo emite llamadas JSON a funciones externas (clima, busquedas, APIs internas), lo que permite construir agentes de un solo paso con un coste computacional minimo.
- Educacion y tutoria basica: resolucion de problemas aritmeticos sencillos y explicacion paso a paso, adecuado para prototipos de asistencia educativa en ruso.
- Procesamiento de texto en el borde (edge computing): clasificacion, reformateo o resumen de fragmentos cortos en dispositivos con recursos limitados, donde un modelo mayor no es viable.
- Pruebas de concepto de asistentes de atencion al cliente: con 4.096 tokens de contexto y plantilla ChatML, sirve para validar flujos conversacionales antes de migrar a un modelo mayor.
- Investigacion sobre entrenamiento from scratch: al publicar log, curva de perdida y tokenizador propio, es util como caso de estudio reproducible de modelos compactos en ruso.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Referencia |
|---|---|---|
| MERA 2.0 (puntuacion global) | 0,054 | Mejor de la linea Zernyshko |
| Prueba practica interna (120 preguntas) | 74 puntos | 53,5 antes del ajuste fino |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La puntuacion MERA 2.0 de 0,054 es muy baja en terminos absolutos y debe interpretarse como un indicador del caracter incipiente del modelo en tareas de comprension y razonamiento en ruso.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; Q4_K_M requiere aproximadamente 0,3-0,5 GB incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM; tambien funciona en CPU sin GPU dedicada.
- Cabe en GPU consumer: si, en practicamente todas (GTX 1050, RTX 3060, RTX 4090, etc.), asi como en telefonos moviles.
- Opciones de despliegue: llama.cpp (`llama-cli -hf DICPlay/RusMind-Zernyshko-2.0-GGUF -cnv`), Ollama (`ollama run hf.co/DICPlay/RusMind-Zernyshko-2.0-GGUF`), LM Studio (busqueda "RusMind Zernyshko"), PocketPal y otras aplicaciones compatibles con GGUF y plantillas Jinja.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera inferencia en tiempo real en CPU moderna, pero no hay cifras publicadas.
- Parametros de muestreo recomendados: temperature 0.5, top_p 0.9, top_k 40, min_p 0.05, repeat penalty 1.1, max tokens 400.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| RusMind Zernyshko 2.0 | 342 M | 4.096 | Ruso | RusMind License (no comercial sin acuerdo) | GGUF, safetensors |
| Qwen2.5-0.5B | 494 M | 32.768 | Multilingue | Apache 2.0 | safetensors, GGUF |
| SmolLM2-360M | 362 M | 8.192 | Ingles (principalmente) | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B | 1.100 M | 2.048 | Ingles (principalmente) | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a parametros, contexto y licencia: no hay datos publicados de benchmarks estandar para RusMind Zernyshko 2.0 que permitan contrastar rendimiento con estas alternativas. Frente a ellas, la ventaja diferencial del modelo es su especializacion en ruso y su licencia restrictiva, que lo aleja del uso comercial libre que ofrecen las alternativas Apache 2.0.

## Limitaciones y advertencias

- Modelo monoidioma: solo ruso; no se ha entrenado para responder en castellano ni en otros idiomas.
- Rendimiento absoluto muy bajo: 0,054 en MERA 2.0 indica competencia linguistica y de razonamiento limitada; no es apto para tareas que requieran precision alta.
- Riesgo de alucinacion: como todo modelo generativo de este tamano, puede producir respuestas plausibles pero incorrectas, especialmente en conocimiento factual y matematicas complejas.
- Contexto corto (4.096 tokens) y recomendacion de usar solo 3-5 turnos recientes en dialogo, lo que limita conversaciones largas o documentos extensos.
- Licencia RusMind License: uso gratuito solo para fines personales, no comerciales, de investigacion y evaluacion; el uso comercial, la reventa, la distribucion de versiones modificadas o la integracion en productos requiere contrato escrito con DICPlay.
- Sin system prompt: la model card indica que el modelo fue entrenado sin el, por lo que inyectar uno puede degradar el comportamiento.
- Requiere configurar correctamente la plantilla ChatML y el token de parada `<|im_end|>` en herramientas como PocketPal; una configuracion incorrecta produce salidas mal formadas.
- Sin datos publicados de sesgos, toxicidad o evaluaciones de seguridad; se desconoce el filtrado aplicado al corpus de entrenamiento.
- El ajuste fino se valido con una prueba interna de 120 preguntas, no con un benchmark independiente, lo que limita la comparabilidad de sus resultados.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0-GGUF
- Repositorio de pesos safetensors: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0
- Log de entrenamiento: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0/blob/main/training/train_300m.log
- Fichero de licencia: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0-GGUF/blob/main/LICENSE
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
