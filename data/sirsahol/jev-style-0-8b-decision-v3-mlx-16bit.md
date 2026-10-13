# SirSahOl/Jev-Style-0.8B-Decision-v3-mlx-16bit

## Resumen

Jev-Style-0.8B-Decision-v3-mlx-16bit es una conversion a formato MLX de 16 bits (bfloat16 sin cuantizar) del modelo chaoliangUNSW/Jev-Style-0.8B-Decision-v3, publicada por el usuario SirSahOl. No se trata de un modelo conversacional al uso, sino de un modelo de decision («System One») que recibe un estado o contexto y devuelve una probabilidad calibrada para cada opcion de cada pregunta planteada sobre ese estado. Esta pensado para tareas repetitivas de clasificacion, enrutado, puntuacion de urgencia o comprobacion de seguridad de acciones dentro de productos software.

La arquitectura declarada es Qwen3_5ForCausalLM con 752.393.024 parametros (~0,8B) y un peso medio de 16,00 bits por parametro. El repositorio ocupa 1,5 GB y esta optimizado para inferencia nativa en GPU de Apple Silicon mediante la libreria MLX de Apple. Se distribuye bajo licencia Apache 2.0 y la model card declara soporte para 20 idiomas, entre ellos castellano, ingles, chino, arabe, aleman, frances, japones o coreano.

Su relevancia actual radica en que ofrece decisiones calibradas en local, sobre portatil, sin depender de una API externa. Segun los benchmarks medidos por el autor en un Apple M1 con 8 GB de memoria unificada, alcanza 29,83 tokens/s con un TTFT de 33,54 ms y un pico de memoria de 495,8 MB durante la generacion. Existe una discrepancia de datos entre la model card (262.144 tokens de contexto) y la descripcion del modelo base (hasta 25.600 tokens de entrada) que conviene verificar antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM |
| Parametros totales | 752.393.024 (~0,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens segun la model card; la descripcion del modelo base indica entradas de hasta 25.600 tokens (dato discrepante) |
| Tipos de cuantizacion | 16-bit (bfloat16 sin cuantizar); existen variantes 4-bit y 8-bit del mismo autor y un GGUF Q4_K_M de 0,53 GB |
| Idiomas soportados | en, zh, ar, bg, de, el, es, fr, hi, ja, ko, pt, ru, sw, ta, th, tr, ur, vi (segun tags) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX |
| Tamano del repositorio | 1,5 GB |
| Modelo base | chaoliangUNSW/Jev-Style-0.8B-Decision-v3 |
| Libreria | mlx (mlx-lm 0.31.3) |
| Pipeline declarado | text-classification |

## Arquitectura y entrenamiento

La model card identifica la arquitectura como Qwen3_5ForCausalLM, es decir, una familia transformer causal de tipo Qwen3.5 adaptada a la tarea de decision. El artefacto publicado es una conversion, no un reentrenamiento: parte del modelo chaoliangUNSW/Jev-Style-0.8B-Decision-v3 y se convierte a formato MLX de 16 bits con mlx-lm 0.31.3 en 4,43 segundos, generando un peso de 1,4 GB. No se documentan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo etapas de RLHF o DPO sobre el modelo base.

La innovacion principal del modelo base, segun su descripcion, es el enfoque de «un estado, una pasada, todas las opciones puntuadas»: en lugar de generar texto conversacional, el modelo lee el estado una sola vez y emite una probabilidad calibrada por opcion. La model card del conversion no detalla mecanismos internos adicionales como atencion lineal o decodificacion especulativa. El tag system-one y la finalidad de LLM-routing y guardrails confirman que su uso previsto es la toma de decisiones estructuradas, no la generacion abierta.

## Capacidades

- Clasificacion y decision: devuelve una probabilidad calibrada para cada opcion de cada pregunta planteada sobre un estado de entrada.
- Enrutado de peticiones (LLM-routing): seleccion de modelo, herramienta o ruta adecuada a partir del contexto.
- Guardrails: comprobacion de si una accion es segura o si requiere revision humana.
- Puntuacion de urgencia y priorizacion sobre estados de aplicacion reales.
- Procesamiento de contexto largo, hasta 262.144 tokens segun la model card (25.600 segun el modelo base).
- Multilingue: 20 idiomas declarados en los tags, incluido el castellano.
- Inferencia en dispositivo (on-device) sobre Apple Silicon mediante MLX.
- Generacion de texto basica y modo chat a traves de plantilla de chat y `mlx_lm.chat` (la model card incluye ejemplos de generacion de texto, aunque el pipeline declarado sea clasificacion).

## Casos de uso

- Enrutado de peticiones en una plataforma de IA: dado el mensaje de un usuario, el modelo puntua que modelo o herramienta debe atenderlo, aprovechando su salida por opciones puntuadas y su baja huella de memoria (menos de 2 GB).
- Clasificacion de tickets de soporte: asigna categoria y urgencia a cada ticket con una probabilidad calibrada, integrándose en un backend que decide la cola de atencion.
- Guardrails de acciones en agentes: antes de ejecutar una accion generada por un LLM, el modelo decide si es segura o si debe pasar a revision humana, funcionando como filtro previo.
- Moderacion y triaje de contenido: clasificar texto entrante en categorias (spam, abuso, consulta legitima) en local, sin enviar datos a una API externa.
- Decisiones repetitivas en producto SaaS: puntuar si una operacion requiere aprobacion manual, si un pago es sospechoso o si una tarea deberia reasignarse.
- Procesamiento de documentos largos con contexto amplio: analizar contratos, informes o historiales extensos y responder preguntas de decision sobre ellos usando la ventana de contexto declarada.
- Prototipado e investigacion en portatil: evaluar un modelo de decision de 0,8B sin GPU dedicada, gracias a su ejecucion nativa en Apple Silicon con pico de memoria inferior a 500 MB durante la generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente aporta metricas de inferencia medidas por el autor.

| Metrica | 16-bit (Apple M1) |
|---|---|
| Tokens por segundo | 29,83 |
| TTFT (time to first token) | 33,54 ms |
| Pico de memoria | 495,8 MB |

Los datos corresponden a un Apple M1 con 8 GB de memoria unificada, media de 5 ejecuciones con un maximo de 256 tokens. La documentacion del proyecto MLX asociado afirma paridad de decision con la version de precision completa en 240 de 240 filas de paridad, tanto en la variante de 8 bits como en la de bf16.

## Requisitos de hardware

- VRAM/huella activa: aproximadamente 1.940 MB activos; la tabla comparativa del autor cifra la huella en ~1.690 MB para 16 bits.
- Memoria unificada minima recomendada: 8 GB.
- Hardware objetivo: Apple Silicon M1, M2, M3 y M4 (incluidas variantes Pro, Max y Ultra).
- Cabe en GPU de consumo: si, en cualquier Mac con chip de la serie M y 8 GB o mas de memoria unificada; para 16 bits el autor recomienda 36-192 GB en Max/Ultra.
- Opciones de despliegue: mlx-lm (CLI y API Python), LM Studio y Ollama (con Modelfile y stop tokens `<|im_start|>`, `<|im_end|>`, `<|endoftext|>`).
- Latencia y throughput: 29,83 tokens/s y TTFT de 33,54 ms en M1 con 8 GB.
- Variantes alternativas por presupuesto: 4-bit (~450 MB en disco, ~490 MB de huella), 8-bit (~855 MB en disco, ~900 MB de huella) y GGUF Q4_K_M (0,53 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Jev-Style-0.8B-Decision-v3-mlx-16bit (este) | 0,8B | 262.144 (segun model card) | MLX safetensors 16-bit | Apache 2.0 | 1,5 GB, precision completa sin cuantizar |
| Jev-Style-0.8B-Decision-v3 (base) | 0,8B | 25.600 tokens de entrada | no disponible | no disponible | Modelo original del que deriva esta conversion |
| Jev-Style-0.8B-Decision-v3-mlx-4bit | 0,8B | igual que el base | MLX 4-bit | Apache 2.0 | ~450 MB, minima huella |
| Jev-Style-0.8B-Decision-v3-mlx-8bit | 0,8B | igual que el base | MLX 8-bit | Apache 2.0 | ~855 MB, precision casi sin perdida |

No se dispone de datos verificados de otros modelos de decision de tamano comparable (por ejemplo alternativas de clasificacion o enrutado de 0,3-1B) dentro de la informacion proporcionada, por lo que la comparativa se limita a las variantes del propio modelo. La documentacion del proyecto senala la existencia de una version GGUF Q4_K_M de 0,53 GB como la distribucion mas ligera.

## Limitaciones y advertencias

- Discrepancia de contexto sin resolver: la model card declara 262.144 tokens, mientras que la descripcion del modelo base habla de entradas de hasta 25.600 tokens. Conviene validar la ventana real antes de usarla en produccion.
- No es un modelo conversacional convencional: su funcion es emitir probabilidades por opcion; su uso como chatbot generativo dara resultados limitados.
- Riesgo de alucinacion y de calibracion incorrecta: no se han publicado evaluaciones formales de calibracion ni de fiabilidad fuera de la paridad con el modelo base.
- Sesgos conocidos: no disponibles. No se documenta el dataset de entrenamiento, por lo que no se pueden auditar sesgos por idioma, dominio o demografia.
- Limitaciones de idioma: aunque se declaran 20 idiomas, no hay evidencia publicada de rendimiento por idioma mas alla de la lista de tags.
- Caveat de plataforma: el formato MLX solo se ejecuta de forma nativa en Apple Silicon; en GPU NVIDIA o AMD habria que recurrir a otras distribuciones del modelo base.
- Rendimiento de generacion limitado: 29,83 tokens/s en M1 con 8 GB es adecuado para clasificacion y decisiones cortas, pero no para generacion de texto extensa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser una conversion de un modelo de terceros conviene revisar la licencia y las condiciones del modelo base chaoliangUNSW/Jev-Style-0.8B-Decision-v3.
- Stop tokens obligatorios: si no se configuran `<|im_start|>`, `<|im_end|>` y `<|endoftext|>` en el runtime, el modelo puede entrar en bucles.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SirSahOl/Jev-Style-0.8B-Decision-v3-mlx-16bit
- Modelo base en HuggingFace: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3
- Variante 4-bit: https://huggingface.co/SirSahOl/Jev-Style-0.8B-Decision-v3-mlx-4bit
- Variante 8-bit: https://huggingface.co/SirSahOl/Jev-Style-0.8B-Decision-v3-mlx-8bit
- Repositorio GitHub del proyecto MLX (lawrence3699): https://github.com/lawrence3699/Jev-Style-0.8B-Decision-v3-MLX
- Repositorio HuggingFace alternativo (gahabeen): https://huggingface.co/gahabeen/Jev-Style-0.8B-Decision-v3-MLX
- Web del modelo Jev-Style: https://jevstyle.com
- Web de Jev AI (TypeSafe): https://jevmodel.org/
- Repositorio GitHub de Jev AI: https://github.com/jev-ai/jev-ai-model
- Libreria MLX de Apple: https://github.com/ml-explore/mlx
