# RSRS64/qwen3-8b-eagle3-rust

## Resumen

RSRS64/qwen3-8b-eagle3-rust es un modelo borrador (draft) de decodificacion especulativa basado en EAGLE-3, disenado para acelerar la inferencia de Qwen3-8B congelado en tareas de generacion de codigo Rust. No es un modelo de lenguaje autonomo: se compone de un unico bloque transformer de anchura 4.096 y 399.707.776 parametros almacenados en safetensors (399.523.840 excluyendo los buffers de vocabulario), y debe servirse siempre junto al modelo objetivo Qwen/Qwen3-8B. Lo publica el usuario RSRS64 y se apoya en el borrador upstream Tengyunw/qwen3_8b_eagle3 como punto de arranque (warm start).

El problema que resuelve es concreto: la latencia de decodificacion autoregresiva en Rust, un dominio con vocabulario y estructuras sintacticas propias. Segun la model card, este checkpoint logra una reduccion del 15,63 % en latencia emparejada sobre prompts frescos de Rust frente al borrador upstream (intervalo exploratorio del 14,26 al 17,11 %), y un 1,76 % frente a un control emparejado 512/400 (intervalo del 0,40 al 2,84 %). Es relevante ahora porque la decodificacion especulativa se ha convertido en la palanca principal para reducir coste por token en despliegues de produccion, y los borradores especializados por dominio permiten ganancias que un borrador generico no alcanza.

El entrenamiento se realizo sobre 2.048 prompts de Rust del dataset Fortytwo-Network/Strandset-Rust-v1, con 400 actualizaciones del optimizador y arranque en caliente desde el borrador upstream. El autor advierte explicitamente de que se trata de un componente de investigacion para experimentos de serving, medido en una unica H100 de 80 GB con SGLang 0.5.18, y de que no mejora la capacidad de codificacion del modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE-3 (borrador de decodificacion especulativa); un bloque transformer, anchura 4.096 |
| Parametros totales | 399.707.776 (safetensors); 399.523.840 parametros almacenados excluyendo buffers de vocabulario |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la ficha del borrador; el ejemplo de servicio usa `--context-length 8192` |
| Tipos de cuantizacion | ninguno; pesos en BF16 |
| Idiomas soportados | en, code (ingles y codigo); entrenado especificamente con Rust |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, 799.457.128 bytes) |
| Modelo objetivo (target) | Qwen/Qwen3-8B, revision `b968826d9c46dd6066d109eabc6255188de91218` |
| Modelo base (warm start) | Tengyunw/qwen3_8b_eagle3, revision `2a1059d51f622b8cad7d7d72840153ffea5488a0` |
| Libreria de despliegue | sglang (observado SGLang 0.5.18) |
| Tamano del repositorio | 0,8 GB |
| Revision del checkpoint | `888e7a454f370ec69bdc2abadc5ea80c57233589` |

## Arquitectura y entrenamiento

El modelo es un borrador EAGLE-3 de un solo bloque transformer con anchura de 4.096, que predice multiples tokens futuros a partir de las representaciones del modelo objetivo congelado. Conserva el mapeo de vocabulario del borrador upstream, por lo que no requiere recalibrar el tokenizador ni el vocabulario de Qwen3-8B. Al ser EAGLE-3, el borrador opera sobre caracteristicas intermedias del target (no solo sobre los ultimos logits), lo que permite cadenas de decodificacion especulativa mas largas con un coste de computo reducido. El checkpoint no esta cuantizado y se distribuye en BF16.

El entrenamiento parte del borrador Tengyunw/qwen3_8b_eagle3 y se ajusta con 400 actualizaciones del optimizador sobre un pool de 2.048 prompts de Rust. La configuracion reportada es: semilla 20260918, batch 1 con acumulacion 8, learning rate pico de 1e-5, horizonte coseno de 400, gradient clipping de 0,5 y longitud de entrenamiento de 7. Los datos proceden de Fortytwo-Network/Strandset-Rust-v1 (revision `0a8d223302712a2b34a6ad4ce1fd679031894b3d`, licencia Apache-2.0), con respuestas regeneradas por Qwen y divisiones disjuntas por crate para evitar fuga de informacion entre entrenamiento y validacion. La seleccion del checkpoint se hizo por longitud de aceptacion simulada en validacion de Rust, no por tiempo de test. El pipeline de entrenamiento fue SpecForge (`ed64d275bac8a48e126adb2827368603566a3029`), con los pesos del target permanentemente congelados. Este checkpoint solo usa datos de Rust y no emplea Dolly.

## Capacidades

- Decodificacion especulativa sobre Qwen3-8B: predice tokens candidatos que el modelo objetivo valida, acelerando la generacion sin modificar los pesos del target.
- Aceleracion especifica de generacion de codigo Rust: el ajuste esta orientado a prompts de Rust, con ganancia medida frente al borrador upstream.
- Compatibilidad con SGLang: se integra mediante `--speculative-algorithm EAGLE3` con los parametros `--speculative-num-steps 3`, `--speculative-eagle-topk 1` y `--speculative-num-draft-tokens 4`.
- Integridad verificable: el repositorio incluye `SHA256.json` con sumas de verificacion de los pesos.
- No incorpora tool calling, function calling, capacidades de agente, vision, audio ni modo thinking propios: son capacidades del modelo objetivo, no del borrador.
- No es un pipeline autonomo de generacion de texto en Transformers; requiere el target y su tokenizador descargados por separado.

## Casos de uso

- Servicio de generacion de codigo Rust en produccion: desplegado con SGLang sobre Qwen3-8B, el borrador reduce la latencia de decodificacion en peticiones de codigo Rust, lo que se traduce directamente en menor coste por token servido en endpoints de asistencia de programacion.
- Autocompletado en editores e IDE: para sugerencias de baja latencia en archivos `.rs`, la reduccion de latencia emparejada del 15,63 % frente al borrador upstream permite cumplir presupuestos de tiempo de respuesta mas estrictos sin cambiar el modelo objetivo.
- Asistencia a la refactorizacion de crates: al estar entrenado con divisiones disjuntas por crate, el borrador resulta adecuado para tareas de reescritura y migracion dentro de un mismo crate, donde el vocabulario y los patrones idiomaticos son estables.
- Investigacion en decodificacion especulativa: sirve como punto de comparacion reproducible frente a otros borradores EAGLE-3, con semilla, revisiones y comandos de servicio fijados en la model card.
- Optimizacion de costes de GPU en serving: con un peso de repositorio de 0,8 GB, el borrador anade una huella de memoria minima sobre el target y puede habilitarse o deshabilitarse por configuracion, lo que facilita experimentos de coste/beneficio en un clon de produccion.
- Despliegue en entornos con GPUs de gama alta ya dimensionadas para Qwen3-8B: el autor midio el escenario en una H100 de 80 GB con concurrencia uno, temperatura cero y limite de 1.024 tokens de salida, configuracion replicable para validaciones internas.
- Ajuste de borradores por dominio: el flujo documentado (pool de prompts, SpecForge, seleccion por aceptacion simulada) es reutilizable como plantilla para crear borradores equivalentes en otros lenguajes o dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. La model card solo reporta metricas de latencia de decodificacion especulativa:

| Metrica | Resultado | Intervalo | Referencia de comparacion |
|---|---|---|---|
| Reduccion de latencia emparejada en Rust fresco | 15,63 % | 14,26 – 17,11 % | Borrador upstream |
| Reduccion de latencia emparejada | 1,76 % | 0,40 – 2,84 % | Control emparejado 512/400 |

Ambos intervalos se describen como exploratorios y condicionados a cohortes sinteticas pequenas de prompts. El propio autor advierte de que una proxy de aceptacion no equivale a latencia medida y que no se realizo ninguna prueba de distribucion estocastica ni benchmark funcional de codigo.

## Requisitos de hardware

- El borrador ocupa aproximadamente 0,8 GB en BF16 (799.457.128 bytes en `model.safetensors`); a ello se suma el modelo objetivo Qwen3-8B, cuyo peso ronda los 16 GB en BF16 por sus 8.000 millones de parametros (estimacion aritmetica, no medida en la ficha).
- Hardware medido por el autor: una unica H100 de 80 GB. No se valido el entorno en otras GPUs.
- GPU recomendadas: H100 80 GB para reproducir exactamente la configuracion reportada. GPUs de 24 GB como la RTX 4090 podrian alojar el target solo con cuantizacion agresiva, algo que el autor no documento y que invalida la comparacion de latencia publicada.
- Ajuste de memoria documentado: `--mem-fraction-static 0.7`.
- Despliegue: SGLang 0.5.18 con `--speculative-algorithm EAGLE3`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint; al ser un borrador EAGLE-3 y no un modelo generativo autonomo, llama.cpp y Ollama no son opciones aplicables.
- Parametros de serving medidos: tres pasos especulativos, top-k 1, cuatro slots de borrador, temperatura cero, thinking desactivado, cache de prefijo desactivada, limite de 1.024 tokens de salida y concurrencia uno.
- Latencia y throughput absolutos: no disponibles; solo se publican diferencias relativas de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Funcion | Licencia | Notas |
|---|---|---|---|---|---|
| RSRS64/qwen3-8b-eagle3-rust | Borrador EAGLE-3 | 399.707.776 | Acelerar Qwen3-8B en Rust | MIT | Ajustado con 400 actualizaciones sobre datos de Rust |
| Tengyunw/qwen3_8b_eagle3 | Borrador EAGLE-3 | no disponible | Acelerar Qwen3-8B en dominio general | no disponible | Punto de arranque (warm start); referencia frente a la que se mide la mejora del 15,63 % |
| RSRS64/qwen3-8b-eagle3-rust-mixed | Borrador EAGLE-3 | no disponible | Acelerar Qwen3-8B con datos mixtos | no disponible | Variante mixta citada por el autor; no establecio no regresion universal |

No se dispone de datos de benchmarks comparativos adicionales entre estos borradores en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje autonomo: es un borrador para decodificacion especulativa y requiere los pesos congelados de Qwen3-8B.
- No mejora la capacidad de codificacion del modelo objetivo; solo reduce la latencia de decodificacion.
- Los resultados se obtuvieron sobre cohortes sinteticas pequenas de prompts, no sobre programas Rust reales en toda su variedad.
- Los candidatos de 400 actualizaciones solo con Rust ralentizaron un pequeno diagnostico en JSON, lo que indica regresion en dominios fuera del entrenamiento.
- El candidato mixto no establecio no regresion universal.
- Persisten diferencias de salida no resueltas en pruebas piloto con concurrencia por lotes.
- No se realizo ningun benchmark funcional de codigo ni prueba de distribucion estocastica.
- No se debe interpretar una proxy de aceptacion como latencia medida, ni un target congelado como prueba suficiente de paridad de salida.
- El repositorio no incluye pesos del target, tokenizador, estado del optimizador ni tensores de caracteristicas.
- La configuracion limpia de GPU no fue revalidada para esta subida; solo se probo el entorno cacheado original.
- Aunque el aviso es en ingles y con la licencia MIT, los materiales de terceros conservan sus propios terminos (dataset en Apache-2.0, target Qwen con su licencia Apache); el autor declara que no pretende relicenciar material de terceros.
- Riesgo de sesgos: no disponible, la ficha no documenta evaluacion de sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RSRS64/qwen3-8b-eagle3-rust
- Repositorio de codigo y experimento: https://github.com/rohseh303/rust-eagle3
- Instrucciones de reproduccion: https://github.com/rohseh303/rust-eagle3/blob/main/REPRODUCE.md
- Articulo explicativo del autor: https://www.rohansehgal.me/writing/rust-eagle3
- Borrador variante mixta: https://huggingface.co/RSRS64/qwen3-8b-eagle3-rust-mixed
- Borrador upstream (warm start): https://huggingface.co/Tengyunw/qwen3_8b_eagle3
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/Fortytwo-Network/Strandset-Rust-v1
- Busqueda web: no se encontraron resultados relevantes adicionales sobre este modelo; los resultados devueltos correspondian a paginas de Amazon sin relacion con el contenido.
