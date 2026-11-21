# nmeyer19/char-rl-merged-goodness

## Resumen

`nmeyer19/char-rl-merged-goodness` es un modelo derivado de `google/gemma-3-4b-it` publicado por el usuario nmeyer19 en Hugging Face. Se trata de un merge de pesos: sobre la base oficial de Gemma 3 4B instruction-tuned se ha fusionado (mediante `merge_and_unload`) el adaptador LoRA `maius/gemma-3-4b-it-personas/goodness`, un adaptador de persona. El resultado se ha convertido a bfloat16 y se distribuye en formato safetensors con 4.300.079.472 parametros.

El modelo no introduce arquitectura nueva: hereda integramente la de Gemma 3 4B, un transformer denso (no MoE) de la familia Gemma 3 de Google, con capacidad multimodal de imagen y texto en su variante `-it`. El autor lo describe como la base congelada del "Setup B" de un proyecto de investigacion denominado char-rl (Phase 1), orientado presumiblemente a experimentos de reinforcement learning sobre personajes o comportamiento conversacional. No se documentan datos de entrenamiento adicionales mas alla del merge del LoRA.

La relevancia de esta ficha es limitada y debe enmarcarse con honestidad: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado, sin idiomas declarados y sin benchmarks publicados. Su interes practico es el de un checkpoint intermedio reproducible para quien quiera replicar el Setup B de char-rl o partir de una base Gemma 3 4B con la persona "goodness" ya fusionada, evitando tener que aplicar el LoRA en tiempo de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Gemma 3 4B); multimodal imagen-texto en la variante `-it` |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la base Gemma 3 4B soporta contexto largo, pero el dato no se confirma aqui) |
| Tipos de cuantizacion | no disponible (el repo publica pesos en bfloat16; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (`license: gemma`) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es la de `google/gemma-3-4b-it` sin modificaciones estructurales: un transformer denso de aproximadamente 4.300 millones de parametros. El proceso de creacion documentado por el autor es puramente de fusion de pesos: se carga la base en fp32 (commit `093f9f388b31de276ce2de164bdc2081324b9767`), se instancia el adaptador LoRA `maius/gemma-3-4b-it-personas/goodness` (commit `6ec2cab4f2a977b2aab2fefad796d57bef7b8818`) mediante `PeftModel.from_pretrained`, se ejecuta `merge_and_unload` y el resultado se convierte a bfloat16. No hay, por tanto, un entrenamiento adicional sobre el modelo fusionado ni se documentan tokens de entrenamiento, composicion del dataset, RLHF o DPO en esta etapa.

El unico "entrenamiento" relevante es el del adaptador LoRA original, del que esta ficha no dispone de detalles (rango, alpha, dataset de personas) porque no se incluyen en la informacion proporcionada. La innovacion tecnica, si cabe llamarla asi, es la reproducibilidad del merge: al publicar los commits exactos de base y adaptador, el autor permite reconstruir el checkpoint de forma determinista. No se mencionan tecnicas como decodificacion especulativa, atencion lineal ni modos de pensamiento propios de este artefacto.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas de Gemma 3 4B instruction-tuned.
- Razonamiento y matematicas a nivel de un modelo de 4B, sin mejoras documentadas por el merge.
- Generacion de codigo basica, limitada por el tamano del modelo base.
- Capacidad multimodal de imagen (entrada de vision) en tanto que deriva de `gemma-3-4b-it`; no se documenta en la model card del merge, por lo que debe validarse empiricamente.
- Soporte de tool calling / function calling: no documentado en esta ficha; la base Gemma 3 lo soporta, pero no se confirma para el merge.
- Comportamiento de persona "goodness" inducido por el LoRA fusionado; el alcance y la definicion exacta de esa persona no se detallan.
- Capacidades multilingues: no disponibles como dato declarado (la base Gemma 3 es multilingue, pero no se especifica cobertura aqui).

## Casos de uso

- Reproduccion de experimentos char-rl: sirve como base congelada del Setup B de la Phase 1, de modo que otros investigadores pueden partir exactamente del mismo checkpoint sin reaplicar el LoRA.
- Evaluacion de merges de LoRA de persona: permite comparar el comportamiento del modelo con y sin el adaptador "goodness" fusionado, aislando el efecto del merge frente a la aplicacion dinamica del adaptador.
- Prototipado de asistentes conversacionales con tono controlado: al incorporar una persona ya fusionada, se puede desplegar un chatbot con ese estilo sin necesidad de cargar un adaptador PEFT adicional en produccion.
- Base para fine-tuning posterior: al estar en safetensors y bfloat16, se puede usar como punto de partida para nuevos entrenamientos con Hugging Face Transformers o TRL, evitando el coste de fusionar el LoRA en cada experimento.
- Investigacion sobre RLHF/RL en modelos pequenos: su tamano de 4,3B permite iterar experimentos de reinforcement learning en hardware modesto, con una base ya alineada a una persona concreta.
- Validacion de pipelines de merge: util como caso de prueba para verificar que un pipeline de `merge_and_unload` + conversion a bfloat16 produce pesos cargables y coherentes antes de aplicarlo a modelos mayores.
- Despliegue en entornos con VRAM limitada: con 4,3B parametros en bfloat16 (unos 8,6 GB de pesos) es viable en GPUs de consumo alto, lo que facilita demos locales de la persona fusionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 8,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 10 y 12 GB para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4,5-5 GB de pesos (estimacion, no confirmada por el autor, ya que no se publican GGUF).
- VRAM estimada en cuantizacion de 4 bits: en torno a 2,5-3 GB de pesos (estimacion, no confirmada).
- GPU recomendadas: A100 40GB, H100, L40S o RTX 6000 Ada para inferencia en bfloat16 sin cuantizar con contexto amplio; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para bfloat16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantizacion, en GPUs de 8-12 GB; no se garantiza en GPUs de 6 GB o menos.
- Opciones de despliegue: Hugging Face Transformers (carga directa de safetensors), vLLM y TGI para serving, y llama.cpp/Ollama solo si se generan conversiones GGUF propias, ya que el repo no las incluye.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nmeyer19/char-rl-merged-goodness` | 4,3B | no disponible | sin benchmarks publicados | Gemma Terms of Use | Hugging Face, repo de 8,6 GB, 0 descargas |
| `google/gemma-3-4b-it` | 4,3B | contexto largo (segun documentacion oficial de Gemma 3; valor exacto no confirmado aqui) | benchmarks oficiales de Google en su model card | Gemma Terms of Use | Hugging Face, ampliamente descargado |
| `maius/gemma-3-4b-it-personas/goodness` (LoRA) | adaptador sobre 4,3B | heredado de la base | no disponible | no disponible en esta ficha | Hugging Face, adaptador PEFT |
| Modelos densos de ~4B de otras familias (p. ej. Llama 3.2 3B, Qwen2.5 3B) | 3-4B | variable | benchmarks publicos propios | licencias respectivas | Hugging Face y otros hubs |

La comparativa directa mas relevante es contra la base `google/gemma-3-4b-it`: el merge no cambia parametros ni arquitectura, solo incorpora el efecto del LoRA de persona, por lo que cualquier diferencia de rendimiento en benchmarks genericos deberia ser marginal y no esta medida. Frente a otros modelos de ~3-4B, la principal diferencia es la licencia Gemma y la ausencia de validacion publica de este checkpoint concreto.

## Limitaciones y advertencias

- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.
- Sin benchmarks publicados: no se puede afirmar que el merge preserve el rendimiento de la base ni que la persona "goodness" funcione como se espera.
- Sin pipeline declarado ni idiomas declarados: la integracion automatica en Hugging Face puede requerir configuracion manual.
- Riesgo de alucinacion: inherente a un modelo de 4B; el merge de una persona no lo mitiga y podria alterar el estilo de las respuestas de forma no documentada.
- Sesgos: no documentados para este checkpoint; hereda los de Gemma 3 4B, que no se detallan aqui.
- Restricciones de licencia: sujeto a los Gemma Terms of Use; el uso comercial esta permitido bajo esas condiciones, pero deben revisarse antes de produccion, y la licencia del LoRA original no se detalla en esta ficha.
- Al ser un artefacto de investigacion (char-rl Phase 1), no hay garantia de mantenimiento, soporte ni actualizaciones.
- La capacidad multimodal de imagen se hereda de la base pero no se valida en la model card del merge; conviene comprobarla antes de usarla.
- No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ); cualquier conversion corre por cuenta del usuario y puede degradar el comportamiento de la persona fusionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nmeyer19/char-rl-merged-goodness
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Commit de la base usado en el merge: https://huggingface.co/google/gemma-3-4b-it/tree/093f9f388b31de276ce2de164bdc2081324b9767
- Adaptador LoRA de persona: https://huggingface.co/maius/gemma-3-4b-it-personas
- Commit del adaptador usado en el merge: https://huggingface.co/maius/gemma-3-4b-it-personas/tree/6ec2cab4f2a977b2aab2fefad796d57bef7b8818
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
