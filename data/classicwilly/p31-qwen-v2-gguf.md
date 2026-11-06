# classicwilly/p31-qwen-v2-gguf

## Resumen

P31 GenUI — Qwen 3.5 4B (v2) es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-4B, publicado por el usuario classicwilly bajo el identificador classicwilly/p31-qwen-v2-gguf. El modelo está orientado a la generacion de interfaces de usuario (UI-generation) en formato JSON, concretamente para el catalogo A2UI v0.9, y se distribuye unicamente en formato GGUF cuantizado a Q4_K_M. El repositorio tiene 2,8 GB y acumula 98 descargas desde su publicacion el 25 de octubre de 2026.

El entrenamiento se realizo con Unsloth sobre 750 ejemplos mixtos de generacion de UI y razonamiento matematico, con LoRA de rango 16 (21.233.664 parametros entrenables, un 0,47% del total del modelo base), 2 epocas (188 pasos) y una perdida final de 0,011. El modelo base cuenta con 4.326.350.848 parametros (aproximadamente 4,3 mil millones).

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de ajuste fino de bajo coste para una tarea de nicho (generacion de UI estructurada); por otro, la propia model card incluye una autoevaluacion critica que desmonta las metricas inicialmente publicadas, lo que constituye un ejemplo poco habitual de rigor metodologico y advierte al lector de que el ajuste no ha demostrado mejorar la retencion de estado multi-turno frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso configura n_ctx=16384 |
| Tipos de cuantizacion | Q4_K_M (unico peso publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (qwen-v2.Q4_K_M.gguf, 2.783.446.688 bytes) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA del transformer decoder-only Qwen/Qwen3.5-4B. No se modifican los pesos base de forma estructural: se anaden adaptadores de rango 16 que suman 21.233.664 parametros entrenables, equivalentes al 0,47% del total. El entrenamiento se realizo con Unsloth sobre 750 ejemplos mixtos que combinan generacion de UI (formato A2UI v0.9) y ejemplos de razonamiento matematico, durante 2 epocas (188 pasos), alcanzando una perdida final de 0,011. No se documenta el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de esa cifra de ejemplos.

La innovacion tecnica destacable no esta en la arquitectura sino en el proceso de evaluacion: la model card documenta explicitamente las limitaciones de su propio harness de evaluacion (muestra de 5 prompts repetidos 10 veces en modo greedy, puntuacion por contencion de cadenas en lugar de validacion de esquema) y concluye que el ajuste no demuestra mejorar la retencion de estado multi-turno. El modelo base Qwen 3.5 opera por defecto en modo thinking, lo que en llama.cpp consume el presupuesto de tokens antes de emitir JSON; por ello el autor documenta la necesidad de forzar un bloque de pensamiento vacio en el prompt.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat ChatML (`<|im_start|>` / `<|im_end|>`).
- Generacion de UI estructurada en JSON para el catalogo A2UI v0.9 (nodos como heading o StatCard).
- Razonamiento matematico basico, incorporado a traves de los ejemplos mixtos de entrenamiento.
- Modo thinking nativo del modelo base Qwen 3.5, desactivable mediante un bloque de pensamiento vacio en el prompt.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso mas alla del modo thinking del modelo base.
- Capacidades multilingues: solo ingles declarado; no se documenta soporte de castellano.
- No se documenta vision ni audio.

## Casos de uso

- Generacion de dashboards JSON para el catalogo A2UI v0.9: el modelo recibe una instruccion en lenguaje natural y emite un arbol de nodos JSON valido para el compilador de referencia, lo que permite prototipar pantallas de forma automatizada.
- Prototipado rapido de interfaces en pipelines de diseno: al ejecutarse en llama.cpp con cuantizacion Q4_K_M (2,78 GB), puede desplegarse en estaciones de trabajo sin GPU dedicada para generar borradores de UI que un disenador refine despues.
- Evaluacion de harness de validacion de UI: el modelo sirve como sujeto de prueba para comparar puntuacion por contencion de cadenas frente a validacion por compilador, tal como documenta el autor.
- Experimentacion con ajuste fino LoRA de bajo coste: el repositorio documenta la receta completa (Unsloth, r=16, 750 ejemplos, 2 epocas) y sirve como referencia reproducible para quien quiera adaptar Qwen 3.5 4B a una tarea de formato estricto.
- Generacion de JSON estructurado con temperatura 0: el ejemplo de la model card muestra un flujo determinista adecuado para tareas de extraccion o formateo donde la variabilidad es indeseable.
- Docencia e investigacion sobre evaluacion de modelos: la autoevaluacion critica incluida en la model card es un caso de estudio util sobre sesgos de harness, tamano de muestra y diferencia entre JSON parseable y JSON valido segun esquema.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la evaluacion propia del autor sobre una conversacion guionizada de edicion de UI de 5 turnos, repetida en 10 episodios con temperatura 0:

| Metrica | Resultado | Nota del autor |
|---|---|---|
| JSON parseable | 50/50 (100%) | La muestra real es de 5 prompts, no 50 |
| Coincidencia de requisitos por turno | 30/50 (60%) | Puntuacion por contencion de cadenas, no por validez de esquema |
| Comparacion con modelo base | 60% | El modelo base, base Phi-4-mini y este ajuste empatan al 60% |

El autor advierte que el 60% identico en cuatro sistemas independientes sugiere un techo del harness de evaluacion, no una propiedad del modelo, y que una salida diagnostica enviada al compilador de referencia fue rechazada por forma de nodo incorrecta y por un valor numerico donde el catalogo espera una cadena. Conclusion explicita: este ajuste no ha demostrado mejorar la retencion de estado multi-turno. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3 GB para el unico peso publicado (Q4_K_M, 2,78 GB), mas overhead de contexto; con n_ctx=16384 el consumo adicional de KV cache depende de la configuracion de llama.cpp.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 4090); tambien viable en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4 GB o mas.
- Opciones de despliegue: llama.cpp (version documentada 0.7.0-dev, commit 74bca3950) y llama-cpp-python; al ser GGUF, es compatible con Ollama y otros runners basados en llama.cpp. No se documenta soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| p31-qwen-v2-gguf (este) | 4,3 B | no disponible | GGUF Q4_K_M | apache-2.0 | Ajuste LoRA para UI-generation; 60% en harness propio |
| Qwen/Qwen3.5-4B (base) | 4,3 B | no disponible | no disponible | no disponible | Modelo base; mismo 60% en el harness del autor |
| Phi-4-mini (referencia del autor) | no disponible | no disponible | no disponible | no disponible | Citado por el autor con el mismo 60% en el harness |

La comparativa disponible es limitada: el autor solo aporta el dato de que el modelo base y Phi-4-mini obtuvieron el mismo 60% en su harness. No se dispone de datos de benchmarks estandar ni de especificaciones completas de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste no ha demostrado mejorar la retencion de estado multi-turno frente al modelo base; el autor lo declara explicitamente.
- La evaluacion publicada tiene un tamano de muestra efectivo de 5 prompts y puntua por contencion de cadenas, no por validez de esquema; el 100% de JSON parseable no equivale a JSON valido segun el catalogo A2UI.
- Una salida diagnostica fue rechazada por el compilador de referencia (forma de nodo incorrecta y tipo de dato erroneo), lo que indica riesgo de generar estructuras invalidas en produccion.
- Solo se declara soporte de ingles; no hay evidencia de calidad en castellano ni en otros idiomas.
- El modo thinking por defecto de Qwen 3.5 puede consumir todo el presupuesto de tokens antes de emitir JSON en llama.cpp; es necesario forzar un bloque de pensamiento vacio en el prompt.
- Dataset de entrenamiento muy pequeno (750 ejemplos) y perdida final de 0,011, lo que sugiere riesgo de sobreajuste a los formatos concretos del dataset.
- Riesgo de alucinacion en la generacion de estructuras JSON: el modelo puede producir nodos o valores plausibles pero no validos para el catalogo.
- Licencia apache-2.0: permite uso comercial, pero el modelo base Qwen 3.5 debe verificarse por separado segun sus propios terminos.
- No se documentan sesgos conocidos; al derivar de un modelo base entrenado predominantemente en ingles, es probable que herede sesgos de este, aunque no se aportan datos al respecto.

## Enlaces

- Hugging Face: https://huggingface.co/classicwilly/p31-qwen-v2-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Unsloth: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios del harness (eval-stateful-ui.py, score-stateful-ui.mjs) ni demos publicas.
