# kingjones777/Ornith-1.5-35B-A3B-Abliterated-ROCmFP4-GGUF

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por DeepReinforce y publicado bajo el nombre de ornith-ai, diseñado especificamente para tareas agénticas y de auto-mejora. Con 35.000 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token, forma parte de la familia Ornith-1.5, que se entrena mediante un bucle de auto-mejora donde el propio modelo propone nuevas tareas, genera scaffolds especificos y produce rollouts de soluciones para aprendizaje por refuerzo.

Esta ficha cubre la variante **Abliterated** del modelo, cuantizada en formato GGUF con tipos ROCmFP4/ROCmFPX por el usuario kingjones777. La version abliterated elimina los mecanismos de rechazo y alineacion de seguridad del modelo original, resultando en una salida sin censura. La cuantizacion esta especificamente optimizada para hardware AMD Strix Halo (Ryzen AI Max+ 395 con Radeon 8060S, gfx1151), y cada archivo puede ejecutarse tanto en backend HIP (ROCm) como Vulkan desde un unico binario, seleccionando el backend como un flag de ejecucion.

La relevancia de este modelo reside en su doble optimizacion: por un lado, el rendimiento medido muestra diferencias de hasta un 14,4 % en decode entre backends, y por otro, la cuantizacion ROCmFP4 permite ejecutar un modelo de 35B en hardware unificado AMD con un footprint de memoria de aproximadamente 18-20 GiB en sus variantes de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_0 (tres variantes ROCmFP4: COHERENT, FAST, STRIX_LEAN), Q6_0 (ROCmFPX), Q8_0 (ROCmFPX, dos variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (repo GGUF); MIT (modelo base) |
| Formato de pesos | GGUF con tipos ggml 100-119 (ROCmFP4/ROCmFPX) |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B es un transformer MoE con aproximadamente 3.000 millones de parametros activos de un total de 35.000 millones, siguiendo la arquitectura de la familia Ornith-1.5. El entrenamiento se basa en un bucle de auto-mejora extremo a extremo: el modelo genera nuevas tareas, crea scaffolds especificos para cada tarea y produce rollouts de soluciones que se utilizan para aprendizaje por refuerzo. Este enfoque de "self-scaffolding" distingue a la familia Ornith de otros modelos agénticos.

El modelo base es un modelo de razonamiento: por defecto, cada turno del asistente se abre con un bloque de pensamiento (thinking) antes de la respuesta final, y soporta bloques `<tool_call>` para invocacion de herramientas. La version abliterated elimina los rechazos de contenido, manteniendo intactas las capacidades de razonamiento y tool calling.

La cuantizacion ROCmFP4 es una innovacion tecnica notable: utiliza tipos de tensor ggml 100-119 que no estan soportados por llama.cpp estandar (cuya tabla de tipos llega solo hasta el 43), por lo que requiere una compilacion personalizada del fork ROCmFPX con soporte simultaneo HIP y Vulkan. Las variantes COHERENT y FAST difieren en la preservacion de embeddings: COHERENT usa embeddings q6_K y head q6_K, mientras que FAST usa embeddings FP4 nativos.

## Capacidades

- Generacion de texto y razonamiento con modo thinking: el modelo abre cada respuesta con un bloque de razonamiento interno antes de la respuesta final.
- Tool calling / function calling: soporta bloques `<tool_call>` que pueden parsearse como tool_calls estilo OpenAI.
- Tareas agénticas: disenado especificamente para agentes multi-paso, con variantes de cuantizacion Q6_0 y Q8_0 etiquetadas como "AGENT" para routing de herramientas.
- Capacidades de vision: incluye un archivo mmproj (vision tower) en F16 que permite entrada de imagenes mediante el flag `--mmproj`.
- Auto-mejora: capacidad de proponer tareas y generar scaffolds especificos para aprendizaje por refuerzo (capacidad del modelo base).
- Salida sin censura: la version abliterated elimina los rechazos de contenido sensible.
- Ejecucion dual backend: cada archivo GGUF funciona tanto en HIP/ROCm como en Vulkan desde un unico binario.

## Casos de uso

- Despliegue local en hardware AMD unificado: el modelo esta optimizado para AMD Ryzen AI Max+ 395 (Strix Halo) con Radeon 8060S, aprovechando los 128 GB de memoria unificada para ejecutar un MoE de 35B en una estacion de trabajo de escritorio sin GPU discreta dedicada.
- Bucles agénticos con tool routing: las variantes Q6_0 y Q8_0 ROCmFPX estan especificamente disenadas para agentes que requieren invocacion frecuente de herramientas, priorizando la precision sobre la velocidad de decode.
- RAG y prompts largos: el backend ROCm ofrece un prefill de 395-426 tokens/s en las variantes de 4 bits, lo que lo hace adecuado para procesamiento rapido de documentos extensos y cache de prompts en frio.
- Chat conversacional y aplicaciones interactivas: el backend Vulkan alcanza hasta 64,5 tokens/s en decode, adecuado para experiencias de chat en tiempo real con baja latencia entre tokens.
- Generacion de contenido sin restricciones: la version abliterated permite generar contenido que el modelo base rechazaria, util en entornos de investigacion creativa o simulacion de escenarios.
- Servidor de inferencia local estilo OpenAI: el comando de inicio incluye `llama-server` con puerto 8080 y soporte de plantillas Jinja, permitiendo integrar el modelo como backend compatible con la API de OpenAI en aplicaciones existentes.
- Procesamiento de imagenes con descripcion: gracias al archivo mmproj heredado, el modelo puede recibir imagenes como entrada y generar descripciones o razonar sobre ellas.

## Benchmarks y rendimiento

Los datos de rendimiento disponibles corresponden a mediciones de velocidad del modelo cuantizado en hardware AMD Strix Halo (Ryzen AI Max+ 395, Radeon 8060S gfx1151, 128 GB unificados, ROCm 7.2.4, Ubuntu 24.04), con contexto de 32.768 tokens, cache q8_0 y 400 tokens generados a temperatura 0. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Tier | Backend | Decode (tok/s) | Prefill (tok/s) | GTT |
|---|---|---|---|---|
| Q4_0 COHERENT | ROCm0 | 56,15-56,38 | 395 | 21 GiB |
| Q4_0 COHERENT | Vulkan0 | 62,63-64,51 | 249 | 20 GiB |
| Q4_0 FAST | ROCm0 | 56,43-57,35 | 426 | 20 GiB |
| Q4_0 FAST | Vulkan0 | 57,96-62,30 | 254 | 18 GiB |
| Q4_0 STRIX_LEAN | ROCm0 | 56,11-56,59 | 423 | 20 GiB |
| Q4_0 STRIX_LEAN | Vulkan0 | 62,55-63,72 | 256 | 18 GiB |
| Q6_0 ROCmFPX AGENT | ROCm0 | 39,88-42,00 | 199 | 32 GiB |
| Q6_0 ROCmFPX AGENT | Vulkan0 | 43,14-43,50 | 221 | 35 GiB |
| Q8_0 ROCmFPX AGENT | ROCm0 | 41,64-41,70 | 337 | 36 GiB |
| Q8_0 ROCmFPX AGENT | Vulkan0 | 45,98-46,28 | 231 | 35 GiB |
| Q8_0 ROCmFPX | ROCm0 | 42,27-42,31 | 331 | 35 GiB |
| Q8_0 ROCmFPX | Vulkan0 | 46,42-46,82 | 232 | 34 GiB |

Hallazgos clave de las mediciones:

- El backend influye aproximadamente 10 veces mas que la eleccion de cuantizacion: Vulkan ofrece un +8,6 % a +14,4 % en decode, mientras que ROCm ofrece un +45 % a +67 % en prefill.
- Las tres variantes de 4 bits se diferencian entre si en menos de un 1,5 % en rendimiento.
- La variante Q6_0 no ofrece ventaja de velocidad sobre Q8_0: ambas rondan los 42-46 tok/s; Q6_0 solo aporta un ahorro de memoria de aproximadamente 3 GiB.

## Requisitos de hardware

- Hardware objetivo: AMD Ryzen AI Max+ 395 (Strix Halo) con Radeon 8060S (gfx1151), 128 GB de memoria unificada.
- VRAM estimada: 18-21 GiB para las variantes de 4 bits, 32-36 GiB para las variantes de 6 y 8 bits.
- Software requerido: ROCm 7.2.4, Ubuntu 24.04, y una compilacion personalizada del fork ROCmFPX de llama.cpp con soporte simultaneo HIP y Vulkan (el llama.cpp estandar rechaza estos archivos por los tipos de tensor 100-119).
- Opciones de despliegue: llama-server (fork ROCmFPX) con flags `-dev ROCm0` o `-dev Vulkan0`; no compatible con vLLM, Ollama o TGI sin adaptaciones especificas.
- Configuracion recomendada: `-fa on -ngl 999 -ctk q8_0 -ctv q8_0 -c 32768 -b 8192 -ub 2048 -t 4`, con `--poll 100 --jinja`.
- Compilacion: usar Unix Makefiles con gmake (no Ninja), `-j16` (el flag `-j32` puede agotar la memoria incluso en sistemas de 128 GB), y pasar explicitamente `-DVulkan_GLSLC_EXECUTABLE=/usr/bin/glslc`.
- Latencia estimada: entre 15 y 25 ms por token en decode (según backend y cuantizacion), y entre 2,3 y 5 ms por token en prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35B | ~3B | 32.768 | MIT | safetensors | Modelo original con alineacion y razonamiento |
| kingjones777/Ornith-1.5-35B-A3B-Abliterated-ROCmFP4-GGUF (este) | 35B | ~3B | 32.768 | Apache 2.0 | GGUF ROCmFP4/FPX | Abliterated, optimizado AMD Strix Halo |
| julianmb/Ornith-1.5-35B-A3B-ROCmFP4-GGUF | 35B | ~3B | 32.768 | no disponible | GGUF ROCmFP4 (ftype 106) | Variante ROCmFP4 alternativa; segun el autor, usa embeddings Q5_K y output weight de 4 bits, sin preservacion FP16 real |

La comparativa con julianmb se basa en la verificacion de cabeceras realizada por kingjones777 con dos parsers independientes: la variante de julianmb no preserva realmente los embeddings en FP16 a pesar de lo indicado en su model card, mientras que la variante COHERENT de kingjones777 usa embeddings q6_K y head q6_K, y la FAST usa embeddings FP4 nativos.

No se dispone de comparativas con modelos de otros fabricantes de tamano similar (como Qwen, Llama o Mistral) en la informacion proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: los archivos GGUF usan tipos de tensor ggml 100-119 que el llama.cpp estandar rechaza con el error `has invalid ggml type`. Es obligatorio compilar el fork ROCmFPX con soporte HIP y Vulkan; sin esta compilacion, los archivos son inutilizables.
- Hardware especifico: la optimizacion esta dirigida a AMD Strix Halo (gfx1151). En otras GPU AMD o NVIDIA, el rendimiento puede degradarse significativamente o los archivos pueden no cargar.
- Version abliterated: al eliminar los mecanismos de rechazo, el modelo puede generar contenido nocivo, ilegal o eticamente problematico sin filtro. Su uso en produccion conlleva riesgos legales y de reputacion.
- Sin datos de benchmarks estandar: no se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks de capacidad para esta variante cuantizada, por lo que no es posible evaluar la degradacion de calidad respecto al modelo base.
- Tamano del repositorio: 162,7 GB en total, lo que implica una descarga considerable y espacio en disco significativo si se desean las seis cuantizaciones.
- Backend alterno: aunque cada archivo funciona en ambos backends, hay una penalizacion de rendimiento real al elegir el backend incorrecto para la carga de trabajo: ROCm es hasta un 67 % mas rapido en prefill, y Vulkan hasta un 14,4 % mas rapido en decode.
- Sin informacion sobre idiomas: la model card no especifica los idiomas soportados, aunque al derivar de un modelo entrenado para tareas agénticas es probable que el ingles sea el idioma dominante.
- Fecha de publicacion reciente (agosto de 2026): el ecosistema de herramientas y forks alrededor de ROCmFPX puede ser inmaduro y estar sujeto a cambios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Ornith-1.5-35B-A3B-Abliterated-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
- Imagen Docker: https://hub.docker.com/r/ai/ornith-1.5
- Pagina de releases de LLM: https://www.llm-releases.com/models/ornith-1-5-35b-a3b
- Variante alternativa ROCmFP4: https://huggingface.co/kingjones777/Ornith-1.5-35B-A3B-ROCmFP4-COHERENT-GGUF
- Variante alternativa ROCmFP4 FAST: https://huggingface.co/kingjones777/Ornith-1.5-35B-A3B-ROCmFP4-FAST-GGUF
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
