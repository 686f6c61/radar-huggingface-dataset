# ShayonSarker/DeepSeek-Coder-1.3B-Base-GGUF

## Resumen

DeepSeek-Coder-1.3B-Base-GGUF es una conversion a formato GGUF del modelo base deepseek-ai/deepseek-coder-1.3b-base, publicada por el usuario ShayonSarker. El modelo original pertenece a la familia DeepSeek Coder de DeepSeek AI, una serie de modelos de lenguaje especializados en codigo entrenados desde cero sobre un corpus a nivel de proyecto. Esta publicacion no introduce reentrenamiento ni ajuste adicional: es exclusivamente una conversion de pesos con llama.cpp sobre el checkpoint base oficial, con tres niveles de cuantizacion.

El modelo cuenta con 1.346.471.936 parametros (aproximadamente 1,35 mil millones) y una ventana de contexto de 16K tokens, pensada para completado de codigo e infilling a nivel de proyecto. Es un modelo denso de tipo transformer decoder-only, no una arquitectura MoE ni un modelo hibrido. Al ser un checkpoint base y no un modelo ajustado a instrucciones, su funcion principal es la continuacion de texto y el relleno de huecos en codigo (fill-in-the-middle), no la conversacion ni el seguimiento de ordenes.

La relevancia de esta ficha es practica: los ficheros GGUF permiten ejecutar un modelo de codigo de 1,3B en hardware de consumo, CPU o GPUs modestas, mediante llama.cpp u Ollama. El repositorio incluye mediciones de perplejidad para cada cuantizacion, lo que permite evaluar la perdida de calidad de forma objetiva antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo (DeepSeek Coder) con multi-head attention; detalle completo de capas no disponible |
| Parametros totales | 1.346.471.936 (aproximadamente 1,35 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 16.384 tokens (16K) en el modelo base |
| Tipos de cuantizacion | F16, Q8_0 y Q4_K_M (los tres incluidos en el repositorio) |
| Idiomas soportados | Ingles y chino en el corpus de entrenamiento (87% codigo, 13% lenguaje natural); no se declara soporte oficial de otros idiomas |
| Licencia | DeepSeek Coder Model License v1.0 (etiquetada como "other" en HuggingFace), con restricciones de uso |
| Formato de pesos | GGUF (llama.cpp) en esta publicacion; safetensors en el modelo base original |
| Modelo base | deepseek-ai/deepseek-coder-1.3b-base |
| Tamano del repositorio | 5,0 GB |
| Pipeline | text-generation |
| Libreria declarada | transformers |
| Fecha de creacion del repositorio | 2026-09-25 segun los metadatos del repositorio |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura transformer decoder-only autorregresiva con multi-head attention, entrenada desde cero sobre un corpus a nivel de proyecto. Segun la documentacion oficial de DeepSeek Coder, cada modelo de la familia se preentrena sobre 2 billones (2T) de tokens con una composicion del 87% de codigo y el 13% de lenguaje natural en ingles y chino. Algunas fuentes secundarias citan 1 billon de tokens, por lo que existe una discrepancia entre fuentes que conviene verificar en el README oficial. El preentrenamiento usa una ventana de 16K tokens e incorpora una tarea adicional de fill-in-the-blank, lo que habilita el completado y el infilling de codigo a nivel de proyecto (rellenar codigo entre un prefijo y un sufijo dentro de un fichero).

Esta publicacion concreta es solo una conversion de pesos. El script de construccion fija el commit de llama.cpp `6b790a9c291b5d7af3312bbf9f0c558aa023b13e` y una revision concreta del modelo de origen, lo que hace la conversion reproducible. No hay datos de RLHF, DPO ni ajuste supervisado: es un checkpoint base, por lo que no sigue instrucciones ni mantiene formato conversacional. La model card del repositorio aclara ademas que el repositorio `deepseek-ai/deepseek-coder-1b` citado en versiones anteriores no existe, y que esta release parte del checkpoint oficial de 1,3B.

## Capacidades

- Generacion y completado de codigo en modo continuacion de texto (modelo base, sin plantilla de chat).
- Infilling de codigo (fill-in-the-middle): completar fragmentos entre un prefijo y un sufijo, gracias a la tarea de entrenamiento especifica del modelo original.
- Generacion de codigo a nivel de proyecto con contexto de hasta 16K tokens.
- Soporte de multiples lenguajes de programacion segun la documentacion oficial de la familia DeepSeek Coder, entre ellos Python (validado en la prueba de humo del repositorio).
- Comprension y generacion de lenguaje natural en ingles y chino, mezclado con codigo.
- No dispone de tool calling ni function calling: es un modelo base, no ajustado para ello.
- No soporta agentes ni razonamiento multi-paso guiado por instrucciones.
- No tiene capacidades de vision, audio ni modo "thinking".
- No es un asistente conversacional: la model card lo indica explicitamente ("This is a base completion model, not an instruction-tuned assistant").

## Casos de uso

- Autocompletado en el editor: integrado mediante llama.cpp u Ollama, el modelo continua el codigo que el desarrollador esta escribiendo. Con 1,35B de parametros la latencia es baja, lo que permite sugerencias en tiempo real incluso en CPU.
- Relleno de huecos en funciones existentes: usando el formato de infilling del modelo base, se puede marcar una zona con prefijo y sufijo y dejar que el modelo genere el cuerpo que falta, util en refactorizaciones parciales.
- Generacion de tests unitarios y codigo repetitivo: el modelo puede producir esqueletos de pruebas, fixtures y boilerplate a partir de ejemplos de contexto incluidos en el prompt, sin necesidad de ajuste previo.
- Migracion y refactorizacion a nivel de fichero: la ventana de 16K tokens permite incluir un modulo completo como contexto para traducir codigo entre lenguajes o actualizar APIs de forma coherente.
- Documentacion automatica: generar docstrings y comentarios a partir del codigo fuente, ejecutable de forma local y por lotes sobre un repositorio completo.
- Despliegue en entornos sin GPU o aislados: con la cuantizacion Q4_K_M (aproximadamente 0,8 GB) el modelo cabe en portatiles, mini-PC o incluso contenedores sin acceso a internet, lo que lo hace util para asistencia de codigo en entornos air-gapped o con requisitos de privacidad estrictos.
- Base para ajuste fino posterior: al ser un checkpoint base, es un punto de partida razonable para LoRA o fine-tuning especifico de dominio antes de convertirlo de nuevo a GGUF.
- Analisis estatico asistido en CI/CD: generar descripciones de cambios, comentarios de revision o resumentes de diffs en pipelines, siempre que el contenido este en ingles o chino y se acepte la supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible. El repositorio proporciona unicamente una evaluacion de perplejidad sobre WikiText-2 (raw), con 8 fragmentos de 512 tokens; menor perplejidad es mejor.

| Formato | Perplejidad (WikiText-2 raw) | Ratio frente a F16 |
|---|---:|---:|
| F16 | 18,0150 | Referencia |
| Q8_0 | 18,0253 | 1,0006 |
| Q4_K_M | 18,3160 | 1,0167 |

La model card tambien reporta una prueba de humo determinista de completado de codigo con la cuantizacion Q4_K_M, que genero correctamente el cuerpo de una funcion trivial (`def add(a, b): return a + b`). No se aportan cifras de rendimiento del modelo base en tareas de codigo dentro de la informacion proporcionada.

## Requisitos de hardware

Los tamanos de fichero y las necesidades de VRAM que siguen son estimaciones orientativas calculadas a partir del numero de parametros y del tamano del repositorio; no estan publicadas en la model card.

| Formato | Tamano aproximado del fichero | VRAM estimada en inferencia | GPU de ejemplo |
|---|---|---|---|
| F16 | 2,7 GB | 3,5 - 5 GB (segun longitud de contexto) | RTX 3060 12 GB, RTX 4090, A100 |
| Q8_0 | 1,4 GB | 2 - 3,5 GB | GTX 1650 4 GB, RTX 3050 |
| Q4_K_M | 0,8 GB | 1,5 - 3 GB | iGPU modernas, portatiles, CPU sin GPU |

- Si cabe en GPU de consumo: si, en todas las cuantizaciones. La Q4_K_M funciona incluso sin GPU dedicada.
- La cache KV crece con el contexto: usar los 16K tokens completos incrementa de forma notable el uso de memoria respecto a ventanas cortas, especialmente en F16.
- GPU profesionales como A100 o H100 no aportan ventaja significativa para un modelo de este tamano; estan sobredimensionadas.
- Opciones de despliegue para esta publicacion: llama.cpp, Ollama, LM Studio, llama-cpp-python, koboldcpp y Jan.
- Opciones de despliegue para el modelo base en safetensors: transformers, vLLM y TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La comparativa se basa en datos publicos de los repositorios oficiales de cada modelo, no en la busqueda realizada. No se dispone de puntuaciones de benchmarks comparables, por lo que la columna de rendimiento queda como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| DeepSeek-Coder-1.3B-Base (esta ficha) | 1,35 B | 16K | DeepSeek Coder Model License v1.0 | GGUF en este repo; safetensors en el repo base | No disponible |
| Qwen2.5-Coder-1.5B | 1,5 B | 32K | Apache 2.0 | safetensors y GGUF en HuggingFace | No disponible |
| StarCoderBase-1B | 1 B | 8K | BigCode OpenRAIL-M | safetensors y GGUF en HuggingFace | No disponible |
| CodeGemma-2B | 2 B | 8K | Gemma Terms of Use | safetensors y GGUF en HuggingFace | No disponible |
| DeepSeek-Coder-6.7B-Base | 6,7 B | 16K | DeepSeek Coder Model License v1.0 | safetensors y GGUF en HuggingFace | No disponible |

Los diferenciadores principales de esta publicacion son la licencia DeepSeek (mas restrictiva que Apache 2.0) y una ventana de 16K superior a la de StarCoderBase-1B y CodeGemma-2B, aunque inferior a la de Qwen2.5-Coder-1.5B.

## Limitaciones y advertencias

- Es un modelo base, no ajustado a instrucciones: no responde a ordenes, no mantiene formato de chat y no debe usarse como asistente sin un ajuste previo.
- Riesgo de alucinacion alto en codigo: puede generar funciones, APIs o librerias inexistentes. Toda salida debe pasar por compilacion, tests y revision humana.
- Idiomas limitados al ingles y al chino. El rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Modelo pequeno (1,35B): su capacidad de razonamiento y de seguir especificaciones complejas es limitada en comparacion con modelos de 6B o mas.
- Contexto de 16K declarado, pero la calidad efectiva en ventanas muy largas no esta medida en la informacion disponible.
- Licencia DeepSeek Coder Model License v1.0, etiquetada como "other": la redistribucion solo se permite bajo las condiciones de la licencia, que incluyen restricciones de uso. El fichero LICENSE debe acompanar a cualquier derivado redistribuido. Revisar los terminos antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 0 likes, sin validacion de la comunidad ni resultados de terceros que confirmen la conversion.
- La fecha de creacion del repositorio indicada en los metadatos (2026-09-25) es posterior a la fecha actual, lo que puede indicar un error en los metadatos o una discrepancia de fecha; conviene verificarlo.
- La model card advierte de que el repositorio `deepseek-ai/deepseek-coder-1b` citado anteriormente no existe; verificar siempre el identificador del modelo base antes de reutilizar scripts.
- La cuantizacion Q4_K_M introduce una degradacion de perplejidad de aproximadamente el 1,7% frente a F16; en tareas de codigo sensible a la sintaxis, conviene validar con pruebas propias.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/ShayonSarker/DeepSeek-Coder-1.3B-Base-GGUF
- Modelo base oficial: https://huggingface.co/deepseek-ai/deepseek-coder-1.3b-base
- README del modelo base: https://huggingface.co/deepseek-ai/deepseek-coder-1.3b-base/blob/main/README.md
- Repositorio de codigo de DeepSeek Coder: https://github.com/deepseek-ai/DeepSeek-Coder
- Pagina del proyecto DeepSeek Coder: https://deepseekcoder.github.io/
- Repositorio del script de construccion GGUF: https://github.com/Dadhichi-Sarker-Shayon/DeepSeek-Coder-1.3B-Base-GGUF
- Ficha de referencia en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/deepseek-coder-13b-base-deepseek-ai
