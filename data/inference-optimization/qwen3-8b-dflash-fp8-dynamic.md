# inference-optimization/Qwen3-8B-DFlash-FP8-DYNAMIC

## Resumen

Este repositorio no contiene un modelo de chat autonomo, sino un **borrador (drafter) cuantizado para decodificacion especulativa** sobre el modelo objetivo Qwen/Qwen3-8B. Se trata de la variante `DFlash-FP8-DYNAMIC` publicada por el usuario `inference-optimization`, derivada del drafter `RedHatAI/Qwen3-8B-speculator.dflash`, y empaquetada con la libreria `speculators` y el formato `compressed-tensors`.

El problema que resuelve es el coste de latencia en la inferencia autorregresiva de Qwen3-8B: un drafter propone varios tokens candidatos por paso y el modelo objetivo los verifica en paralelo, de modo que la generacion se acelera cuando la tasa de aceptacion es alta. La variante aqui descrita reduce ademas el coste en memoria del propio drafter mediante cuantizacion FP8 dinamica, aplicada sin datos de calibracion (data-free, semilla de manifiesto 0).

Su relevancia es practica y de despliegue: permite servir Qwen3-8B con decodificacion especulativa DFlash ocupando unos 2,29 mil millones de parametros de borrador en FP8, con licencia Apache-2.0 y con los manifiestos de reproducibilidad incluidos en el repositorio. No es utilizable de forma independiente: requiere siempre el modelo objetivo y una compilacion de vLLM compatible con DFlash.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador (drafter) para decodificacion especulativa DFlash, derivado de `RedHatAI/Qwen3-8B-speculator.dflash`; detalles de capas no disponibles en la informacion proporcionada |
| Parametros totales | 2.293.286.144 (~2,29 mil millones), segun los tensores safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el drafter opera sobre la ventana del modelo objetivo Qwen3-8B |
| Tipos de cuantizacion | FP8_DYNAMIC: pesos cuantizados por canal y activaciones dinamicas por token; cuantizacion data-free (sin datos de calibracion), semilla 0; formato `compressed-tensors` |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (empaquetado `compressed-tensors`); configuracion de drafter personalizada en `config.py` (requiere `trust_remote_code`) |

Datos adicionales: tamano del repositorio 3,5 GB, biblioteca `speculators`, pipeline `text-generation`, creado y actualizado el 24 de septiembre de 2026.

## Arquitectura y entrenamiento

La informacion disponible describe este artefacto como un drafter DFlash para el objetivo Qwen3-8B, obtenido a partir del checkpoint `RedHatAI/Qwen3-8B-speculator.dflash`. No se detallan en la model card el numero de capas, el tipo de atencion, la estrategia de inicializacion desde el modelo objetivo ni el volumen de tokens de entrenamiento del borrador original. Lo que si se documenta es el proceso de cuantizacion: FP8_DYNAMIC con pesos por canal y activaciones dinamicas por token, ejecutado de forma data-free (sin muestras de calibracion), con semilla 0 y con el manifiesto de la ejecucion en `quant_run_manifest.json`.

La innovacion destacable reside en la combinacion de dos tecnicas: decodificacion especulativa DFlash (el ejemplo de la model card configura `--spec-tokens 7`, es decir, hasta siete tokens candidatos por paso de verificacion) y cuantizacion FP8 sin calibracion, que evita depender de un corpus de calibracion que no es redistribuible. El repositorio incluye trazabilidad completa: el comando de entrenamiento capturado del drafter original, un comando de cuantizacion marcado explicitamente como reconstruido, el parche y el comando de vLLM empleados, los hashes de los checkpoints objetivo y borrador, y nueve comandos de evaluacion por subconjunto. La preparacion de datos PerfectBlend, los prompts y la cache de estados ocultos no se publican porque los prompts preparados no son redistribuibles; solo se registran sus recuentos y hashes en `calibration_manifest.json`.

## Capacidades

- Aceleracion de la decodificacion de Qwen3-8B mediante propuesta y verificacion especulativa de tokens; no genera respuestas finales por si mismo.
- Integracion con vLLM mediante `--spec-model` y `--spec-method dflash`, con `--spec-tokens 7` en el ejemplo oficial.
- Cuantizacion FP8 dinamica del borrador, orientada a reducir huella de memoria y a aprovechar las unidades de computo FP8 de GPU Hopper y Ada.
- Carga mediante la libreria `speculators` con codigo personalizado (`custom_code`), lo que exige `trust_remote_code`.
- Cualquier capacidad funcional (generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, multilingue) proviene exclusivamente del modelo objetivo Qwen3-8B, no del drafter.
- No soporta de forma nativa otros motores de inferencia distintos de vLLM con soporte DFlash.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada para este repositorio.

## Casos de uso

- Servicio de chat de baja latencia: desplegar Qwen3-8B con este drafter en vLLM para reducir el tiempo por token en produccion, siempre que la tasa de aceptacion del borrador sea alta en el dominio de las consultas.
- Asistentes de codigo en IDE: la decodificacion especulativa suele rendir bien en texto predecible como el codigo, de modo que el drafter puede recortar la latencia percibida al completar funciones y bloques repetitivos.
- RAG conversacional multi-turno: al mantener el modelo objetivo Qwen3-8B sobre el drafter, se conserva la ventana de contexto y la calidad del modelo grande mientras se acelera la generacion de respuestas largas.
- Agentes con tool calling: en bucles de razonamiento de varios pasos, donde se encadenan muchas generaciones cortas, la reduccion de latencia por paso se acumula y mejora el tiempo total de la tarea.
- Despliegue on-premise con GPU FP8: gracias al borrador en FP8, el coste adicional de memoria del drafter es bajo, lo que permite activar decodificacion especulativa en nodos con GPU Hopper o Ada sin ampliar VRAM.
- Evaluacion interna de tecnicas de aceleracion: el repositorio incluye manifiestos, hashes y nueve comandos de evaluacion por subconjunto, lo que lo hace util como referencia reproducible para comparar FP8 dinamico frente a BF16 en un mismo drafter.
- Generacion por lotes sensible al coste: en pipelines de resumen o extraccion de informacion con muchos prompts, la aceleracion de decodificacion reduce el tiempo de pared del lote sin cambiar el modelo que produce el texto final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluacion completa sobre todos los subconjuntos fechada el 24 de septiembre de 2026 y nueve comandos de evaluacion por subconjunto en `provenance/evaluation/`, pero no incluye cifras de tasa de aceptacion, speedup, MMLU, HumanEval ni GSM8K. No se aportan tampoco comparaciones numericas frente al drafter en BF16 del que deriva.

## Requisitos de hardware

- Pesos del drafter en FP8: aproximadamente 2,3 GB (2.293.286.144 parametros a 1 byte por parametro), mas el coste de la capa de embeddings y del tokenizer.
- Modelo objetivo Qwen3-8B: aproximadamente 8,2 GB en FP8 y 16,4 GB en BF16, segun el formato elegido para el objetivo.
- Estimacion conjunta (objetivo en FP8 + drafter en FP8): del orden de 11-12 GB de pesos, a los que hay que sumar la cache KV y el overhead del runtime de vLLM.
- GPU con soporte FP8 nativo: H100, H200, L40S, L4 y familia RTX 40/50 (Ada y Blackwell). Las A100 no cuentan con computo FP8 nativo, por lo que la ruta FP8 no es la recomendada en esa generacion.
- GPU de consumo: cabe en una RTX 4090 (24 GB) sirviendo el objetivo y el drafter en FP8, con margen para cache KV. En tarjetas de 16 GB el despliegue conjunto queda muy ajustado.
- Opciones de despliegue: vLLM con soporte DFlash (`--spec-model`, `--spec-method dflash`, `--spec-tokens 7`). No se documenta compatibilidad con llama.cpp, Ollama ni TGI para este drafter.
- Latencia y throughput: no disponibles. No se publican tasas de aceptacion ni factores de aceleracion medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Contexto | Licencia | Motor | Rendimiento publicado |
|---|---|---|---|---|---|---|
| `inference-optimization/Qwen3-8B-DFlash-FP8-DYNAMIC` (este) | 2,29 mil millones (drafter) | FP8_DYNAMIC, data-free | No disponible | Apache-2.0 | vLLM con DFlash | No disponible |
| `RedHatAI/Qwen3-8B-speculator.dflash` (origen) | No disponible en la informacion proporcionada | BF16 (sin cuantizar) | No disponible | Apache-2.0 | vLLM con DFlash | No disponible |
| `Qwen/Qwen3-8B` sin decodificacion especulativa | 8 mil millones (objetivo) | BF16 / FP8 segun despliegue | No disponible en la informacion proporcionada | Apache-2.0 | Multiples (vLLM, TGI, llama.cpp) | No disponible en esta ficha |

La comparativa cuantitativa entre la variante FP8 y la variante BF16 del mismo drafter no puede establecerse con los datos disponibles; la diferencia documentada es unicamente de formato y de estrategia de cuantizacion (dinamica, sin calibracion).

## Limitaciones y advertencias

- No es un modelo autonomo: sin el objetivo Qwen3-8B y una compilacion de vLLM compatible con DFlash, el repositorio no produce texto util.
- Requiere cargar codigo personalizado (`custom_code`, `config.py`), con el riesgo de seguridad asociado a `trust_remote_code`.
- Discrepancia de nomenclatura: el identificador del repositorio es `Qwen3-8B-DFlash-FP8-DYNAMIC`, mientras que el ejemplo de servicio y el titulo de la model card usan `Qwen3-8B-DFlash-Drift8-FP8-DYNAMIC` / "Drift8". Conviene verificar la ruta exacta antes de desplegar.
- La cuantizacion es data-free, sin muestras de calibracion; puede degradar la tasa de aceptacion del borrador frente a una variante calibrada, aunque no se aportan mediciones que lo confirmen o desmientan.
- El rendimiento depende fuertemente de la carga de trabajo: en textos muy impredecibles o con temperaturas de muestreo altas la tasa de aceptacion cae y la aceleracion se reduce.
- No se documentan idiomas soportados; el soporte linguistico efectivo es el del objetivo Qwen3-8B.
- No se publican prompts, datos de calibracion ni tensores de estados ocultos, por lo que la reproducibilidad completa de la evaluacion no es posible desde el repositorio.
- No se dispone de informacion sobre sesgos, alineacion o riesgo de alucinacion especifica de esta variante; al ser un borrador verificado por el objetivo, la distribucion de salida la determina el modelo objetivo si la implementacion de decodificacion especulativa es correcta.
- Riesgo operativo: el soporte DFlash en vLLM depende de la version y del parche incluido en `provenance/evaluation/`; versiones distintas pueden no reproducir el comportamiento descrito.
- La licencia Apache-2.0 del drafter no exime de revisar los terminos del modelo objetivo Qwen3-8B en el caso de uso previsto.
- Repositorio sin descargas ni valoraciones en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference-optimization/Qwen3-8B-DFlash-FP8-DYNAMIC
- Drafter de origen (Red Hat AI): https://huggingface.co/RedHatAI/Qwen3-8B-speculator.dflash
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Documentacion de vLLM (motor requerido para DFlash, referencia general): https://docs.vllm.ai
- Nota: la busqueda web realizada no devolvio enlaces tecnicos relevantes; los resultados obtenidos eran definiciones genericas del termino "inferencia" en diccionarios y enciclopedias, sin relacion con este modelo. No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
