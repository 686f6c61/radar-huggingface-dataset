# RSRS64/qwen3-8b-eagle3-rust-mixed

## Resumen

RSRS64/qwen3-8b-eagle3-rust-mixed es un borrador (draft) EAGLE-3 de decodificación especulativa diseñado para acelerar la inferencia del modelo congelado Qwen/Qwen3-8B. No es un modelo de lenguaje autónomo: se trata de un componente auxiliar que predice tokens candidatos para que el modelo objetivo los verifique en paralelo, reduciendo el número de pasos de decodificación necesarios. Lo desarrolla el usuario RSRS64 dentro de una línea de experimentos de serving publicada junto al repositorio rust-eagle3, y deriva por ajuste fino del borrador upstream Tengyunw/qwen3_8b_eagle3.

El checkpoint contiene un único bloque transformer de anchura 4.096 con 399.523.840 parámetros almacenados (399.707.776 según los metadatos de safetensors) y se distribuye en BF16, sin cuantizar. Su especialización es el código Rust: el entrenamiento combina 1.536 prompts de Rust regenerados por Qwen con 512 ejemplos generales de Databricks Dolly 15k, y conserva el mapeo de vocabulario del borrador original. El autor reporta una reducción del 15,05% en latencia sobre Rust "fresco" frente al borrador upstream, a costa de un 1,44% más de latencia en Rust y un 4,02% menos en prosa respecto a su variante scale400.

Su relevancia es acotada pero real: la decodificación especulativa es una de las vías estándar para abaratar el serving de modelos de 8B en producción, y este checkpoint documenta de forma inusualmente explícita el protocolo de medición, las revisiones fijas del objetivo y los límites de sus resultados. Está pensado exclusivamente para investigación en serving sobre SGLang 0.5.18 con el target fijado en una revisión concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE-3: borrador de decodificacion especulativa con un bloque transformer de anchura 4.096 sobre Qwen3-8B congelado |
| Parametros totales | 399.707.776 (metadatos safetensors); 399.523.840 parametros almacenados excluyendo buffers de vocabulario segun la model card |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica al borrador; el ejemplo de servicio configura 8.192 tokens en el modelo objetivo |
| Tipos de cuantizacion | BF16 sin cuantizar; no se distribuyen variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | en, code (especializado en Rust; tambien prosa general via Dolly 15k) |
| Licencia | MIT (material de terceros conserva sus propias licencias: Apache-2.0 en Strandset-Rust-v1, CC-BY-SA-3.0 en Databricks Dolly 15k, Apache-2.0 en el target Qwen3-8B) |
| Formato de pesos | safetensors (model.safetensors, 799.457.128 bytes; SHA-256 c0222c70bfc4471aaaa5c7b7f61dfb867b2191291c2e3a4b1c139a6be0a5084c) |

## Arquitectura y entrenamiento

El borrador sigue el esquema EAGLE-3: una cabeza predicadora ligera que, dado el estado oculto del modelo objetivo y los ultimos tokens generados, propone varios tokens candidatos que el target valida en un solo paso forward. En este caso la cabeza es un unico bloque transformer de anchura 4.096 y se mantiene el mapeo de vocabulario del borrador upstream, lo que implica que el espacio de salida coincide con el de Tengyunw/qwen3_8b_eagle3. No hay innovaciones adicionales declaradas mas alla de la especializacion de dominio del borrador.

El entrenamiento se realizo con SpecForge (commit ed64d275bac8a48e126adb2827368603566a3029) sobre el target Qwen/Qwen3-8B fijado en la revision b968826d9c46dd6066d109eabc6255188de91218, con warm start desde Tengyunw/qwen3_8b_eagle3 en la revision 2a1059d51f622b8cad7d7d72840153ffea5488a0 y pesos del objetivo permanentemente congelados. El pool de datos fue de 1.536 prompts Rust de Fortytwo-Network/Strandset-Rust-v1 (revision 0a8d223302712a2b34a6ad4ce1fd679031894b3d) con respuestas regeneradas por Qwen y particiones disjuntas por crate, mas 512 ejemplos generales de Databricks Dolly 15k (revision bdd27f4d94b9c1f951818a7da7fd7aeea5dbff1a) con respuestas tambien regeneradas. El regimen optimizador fue: 400 actualizaciones, batch 1 con acumulacion 8, LR pico 1e-5, horizonte coseno 400, gradient clip 0.5, longitud de entrenamiento 7 y semilla 20260918. La seleccion del checkpoint se hizo por longitud de aceptacion simulada sobre una validacion Rust separada, no por tiempo de test, lo que el propio autor advierte como una limitacion metodologica.

## Capacidades

- Prediccion de tokens draft para decodificacion especulativa EAGLE-3 sobre Qwen3-8B congelado.
- Aceleracion de la generacion en tareas de codigo Rust, con una reduccion declarada del 15,05% en latencia sobre Rust "fresco" frente al borrador upstream.
- Mantenimiento del comportamiento en prosa general, con un 4,02% menos de latencia que la variante scale400 en ese dominio.
- Integracion con el servidor SGLang mediante los flags `--speculative-algorithm EAGLE3`, `--speculative-num-steps 3`, `--speculative-eagle-topk 1` y `--speculative-num-draft-tokens 4`.
- Verificacion de integridad mediante SHA256.json incluido en el repositorio.
- No genera texto de forma autonoma, no soporta tool calling por si mismo, no implementa agentes, no tiene modo thinking propio ni capacidades de vision o audio. Todas esas funciones dependen del modelo objetivo Qwen3-8B.

## Casos de uso

- Serving de asistentes de codigo Rust en produccion: desplegando Qwen3-8B con este borrador en SGLang se reduce el coste por token generado en completados de Rust, siempre que la carga se componga mayoritariamente de codigo de ese lenguaje y la concurrencia se mantenga baja.
- Autocompletado en editores para proyectos Rust: el borrador acelera la generacion de fragmentos cortos tipicos del autocompletado, donde la relacion entre tokens aceptados y pasos de verificacion suele ser favorable.
- Generacion de tests unitarios y documentacion de crates: cargas repetitivas y de plantilla donde el patron de tokens es predecible y la tasa de aceptacion del draft tiende a ser alta.
- Pipelines de CI/CD con generacion de parches: integrado en un servicio interno que propone cambios de codigo Rust sobre un diff, el borrador reduce la latencia del paso de generacion sin alterar los pesos del modelo que produce el resultado final.
- Migracion y refactorizacion de codigo Rust asistida: al mantener el target congelado, las garantias de calidad del texto generado dependen exclusivamente de Qwen3-8B, por lo que el borrador puede insertarse en flujos existentes sin reentrenar ni recalibrar el modelo principal.
- Investigacion en decodificacion especulativa: sirve como punto de partida reproducible para estudiar el compromiso entre especializacion de dominio y regresion en otros dominios, con semilla, hiperparametros y revisiones documentados.
- Endpoints mixtos de prosa y codigo con predominio de Rust: el checkpoint fue entrenado con una mezcla 1.536/512 que busca no degradar en exceso las cargas generales, aunque el propio autor no establece no-regresion universal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, algo esperable al tratarse de un componente de serving y no de un modelo de lenguaje. Los unicos datos cuantitativos publicados son medidas de latencia relativas:

| Metrica | Valor |
|---|---|
| Latencia en Rust "fresco" frente al borrador upstream (Tengyunw/qwen3_8b_eagle3) | -15,05% |
| Latencia en Rust frente a la variante scale400 | +1,44% (mas lento) |
| Latencia en prosa frente a la variante scale400 | -4,02% (mas rapido) |
| Recuperacion de JSON | no concluyente |
| Benchmark funcional de codigo | no realizado |
| Test de distribucion estocastica | no realizado |

Las condiciones de medida declaradas son: una H100 80GB, BF16, tres pasos especulativos, top-k uno, cuatro slots de draft, temperatura cero, thinking desactivado, prefix cache desactivado, limite de 1.024 tokens de salida y concurrencia uno, con SGLang 0.5.18.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 0,8 GB en BF16 (model.safetensors ocupa 799.457.128 bytes).
- VRAM combinada: el target Qwen3-8B en BF16 requiere del orden de 16 GB, por lo que el conjunto target mas draft ronda los 17 GB mas cache KV; con 8.192 tokens de contexto y `--mem-fraction-static 0.7` el margen en una GPU de 24 GB es ajustado pero viable.
- GPU recomendadas por el autor: una H100 80GB fue el unico hardware medido. Cualquier GPU con al menos 24 GB (RTX 3090, RTX 4090, L40S, A100 40GB) deberia poder alojar el conjunto, aunque no hay mediciones publicadas en esas plataformas.
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090 de 24 GB para el par target mas borrador en BF16; no cabe en GPUs de 8 a 16 GB sin cuantizar el target, ya que el borrador debe permanecer en BF16.
- Opciones de despliegue: SGLang 0.5.18 con `--speculative-algorithm EAGLE3`. No hay soporte declarado para llama.cpp, Ollama, TGI ni vLLM, y el checkpoint no se distribuye en GGUF.
- Latencia y throughput: los unicos datos son los porcentajes relativos de la tabla anterior, medidos a concurrencia uno. No hay cifras absolutas de tokens por segundo ni de latencia p99 publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| RSRS64/qwen3-8b-eagle3-rust-mixed (este) | 399.707.776 | no aplica (draft) | -15,05% latencia en Rust fresco vs upstream; -4,02% en prosa y +1,44% en Rust vs scale400 | MIT | safetensors |
| Tengyunw/qwen3_8b_eagle3 | no disponible | no aplica (draft) | linea base upstream; referencia del -15,05% | MIT | safetensors |
| RSRS64/qwen3-8b-eagle3-rust | no disponible | no aplica (draft) | variante Rust-only; ralentizo un diagnostico JSON pequeño | MIT | safetensors |
| Qwen/Qwen3-8B (modelo objetivo) | 8.000 millones (orden de magnitud, dato no confirmado en la informacion disponible) | 8.192 en la configuracion de servicio | modelo standalone; calidad no alterada por el borrador | Apache-2.0 | safetensors |

No se dispone de datos de benchmarks comparativos entre estos borradores mas alla de los porcentajes de latencia relativos aportados por el autor.

## Limitaciones y advertencias

- No es un modelo de lenguaje independiente: no puede usarse con el pipeline de text-generation de Transformers ni generar texto por si solo.
- No mejora la capacidad de programacion del modelo objetivo; solo acelera su decodificacion y no altera los pesos congelados de Qwen3-8B.
- Los resultados son condicionales a cohortes sinteticas pequeñas de prompts y no se generalizan a todos los programas Rust.
- La variante Rust-only de 400 actualizaciones ralentizo un diagnostico JSON pequeño, y el candidato mixto no demostro no-regresion universal.
- Las diferencias de salida observadas en pruebas piloto con concurrencia por lotes quedaron sin resolver.
- No se realizo ningun benchmark funcional de codigo ni test de distribucion estocastica; el proxy de aceptacion no equivale a latencia medida.
- Un objetivo congelado no constituye prueba suficiente de paridad de salida entre el texto generado con y sin decodificacion especulativa.
- Requiere revisiones inmutables concretas del target, del tokenizer y del borrador; usar otras revisiones invalida las mediciones.
- El entorno cacheado original fue el probado; no se revalido una reconstruccion limpia en GPU para esta subida.
- El repositorio no incluye pesos del target, tokenizer, estado del optimizador ni tensores de features; hay que descargarlos aparte.
- La mezcla de entrenamiento incluye Databricks Dolly 15k bajo CC-BY-SA-3.0, lo que exige revisar la atribucion y las condiciones de redistribucion antes de un uso comercial.
- Riesgo de alucinacion heredado integramente del modelo objetivo; el borrador no lo mitiga ni lo agrava de forma declarada.
- Metadatos de adopcion nulos en el momento de la consulta (0 descargas, 0 likes), sin senales de validacion por parte de terceros.
- La model card no documenta sesgos especificos del borrador; cualquier sesgo procede del target y de los datasets de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RSRS64/qwen3-8b-eagle3-rust-mixed
- Repositorio del experimento y codigo: https://github.com/rohseh303/rust-eagle3
- Instrucciones de reproduccion: https://github.com/rohseh303/rust-eagle3/blob/main/REPRODUCE.md
- Escribo tecnico del autor: https://www.rohansehgal.me/writing/rust-eagle3
- Borrador Rust-only alternativo: https://huggingface.co/RSRS64/qwen3-8b-eagle3-rust
- Borrador upstream (warm start): https://huggingface.co/Tengyunw/qwen3_8b_eagle3
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de prompts Rust: https://huggingface.co/datasets/Fortytwo-Network/Strandset-Rust-v1
- Dataset general: https://huggingface.co/datasets/databricks/databricks-dolly-15k
