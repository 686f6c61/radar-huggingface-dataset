# brbrainerd/vox-mens-qwen3-0.6b

## Resumen
Vox MENS Qwen3-0.6B es un adaptador QLoRA publicado por el usuario brbrainerd sobre el modelo base Qwen/Qwen3-0.6B (revision fijada c1899de289a04d12100db370d81485cdf75e47ca). Su proposito es especializar un modelo pequeno en la generacion de codigo del lenguaje Vox, un lenguaje de programacion propio del ecosistema Vox (voxlang.org). El adaptador se distribuye dentro de la familia MENS ("hub and spoke"), donde el modelo base actua como hub y cada "spoke" cubre un dominio o lenguaje concreto; en este caso el spoke es vox-lang y el estado declarado por el autor es "gate-passed".

El modelo no busca competir en capacidad general, sino ofrecer generacion de codigo Vox en maquinas con muy poca memoria, incluidos equipos sin GPU. El autor indica que esta pensado para completados rapidos y ediciones cortas de una sola funcion, donde la latencia importa mas que la profundidad del razonamiento. Con 0.6B parametros y una ventana de contexto heredada de Qwen3-0.6B, es la rung mas pequena de la familia, sin opcion inferior a la que bajar.

La relevancia actual esta en el nicho: adaptadores de bajo coste para lenguajes o DSLs especificos que pueden servirse en local con CPU o GPU consumer, integrados en un pipeline propio (`vox mens hub pull` / `vox mens serve`) con verificacion de hashes BLAKE3 de cada fichero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B) con adaptador QLoRA |
| Parametros totales | 0.6B (modelo base Qwen3-0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-0.6B) |
| Tipos de cuantizacion | no disponible (el adaptador se sirve via el runtime `vox`; no se documentan formatos de cuantizacion) |
| Idiomas soportados | en (ingles) segun la model card; capacidades multilingues del base no verificadas para este adaptador |
| Licencia | apache-2.0 |
| Formato de pesos | adaptador para la libreria `vox` (repo de 0.1 GB); no se indica safetensors/GGUF explicitamente |

## Arquitectura y entrenamiento
El modelo es un adaptador QLoRA sobre Qwen3-0.6B, un transformer decoder-only de la familia Qwen3. No se modifica la arquitectura del base: el adaptador anade pesos de bajo rango entrenados para el dominio de generacion de codigo en Vox. El entrenamiento se realizo con el framework propio del autor (`library_name: vox`, tag `qlora`, tag `candle`, lo que sugiere uso de Candle como backend de computo). El autor reporta un pico de memoria de entrenamiento medido de 19443 MiB para la variante 0.6B (`peak_source`: run_summary); no se ha medido una cifra de memoria de serving.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. El autor describe un proceso de evaluacion con "lanes" (por ejemplo, `codegen` y modo thinking) y un "gate" de calidad que el adaptador debe superar; el estado de este modelo es `gate-passed`. Los ejemplos de la model card muestran que el adaptador corrige casos que el base no resuelve (por ejemplo, `humaneval_vox_046_count_primes_up_to` y `page_index`) y tambien introduce regresiones en algunos items (el caso `humaneval_vox_042_reverse_list` pasa en el base y falla con el adaptador por errores de tipo).

## Capacidades
- Generacion de codigo en el lenguaje Vox: funciones, componentes de UI (`component`, `state`, `view`) y acciones, segun los ejemplos de la model card.
- Completado de codigo corto y edicion de funciones individuales, que es el caso de uso declarado por el autor.
- Modo "thinking" disponible en las evaluaciones de regresion (gsm8k_think, math500_think, vox_think), heredado del base Qwen3.
- Generacion de texto en ingles (`language: en`).
- Servicio via API compatible con `/v1/chat/completions` a traves del runtime `vox mens serve`, con seleccion de "lane" (`codegen`, etc.).
- Tool calling / function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado; el autor advierte que el modelo pierde el hilo en tareas multi-paso.
- Capacidades de vision o audio: no disponibles.

## Casos de uso
- Autocompletado de codigo Vox en el editor: el adaptador genera funciones y componentes Vox a partir de una descripcion en lenguaje natural, con latencia baja gracias a sus 0.6B parametros; adecuado para sugerencias inline en un IDE.
- Generacion de componentes de interfaz en Vox: a partir de una especificacion breve ("define una page con titulo y heading"), produce el bloque `component`/`state`/`view` correspondiente, como muestra el ejemplo `page_index`.
- Edicion de funciones sueltas en pipelines de desarrollo: dado un enunciado acotado, reescribe o completa una funcion Vox concreta; el autor lo orienta a "short single-function edits".
- Servicio local en maquinas sin GPU: el modelo esta pensado para equipos con muy poca memoria, incluidos CPU-only, por lo que puede desplegarse en estaciones de trabajo modestas o contenedores ligeros via `vox mens serve`.
- Generacion de codigo en lote para tests o scaffolding: con el endpoint `/v1/chat/completions` y la lane `codegen`, se pueden generar borradores de funciones Vox que luego se validan con el compilador o el parser de Vox.
- Evaluacion y regresion de adaptadores: el modelo sirve como referencia de la rung mas pequena de la familia MENS para comparar mejoras de tamano superior en tareas de codegen Vox (bench held-out de 52 items).
- Prototipado de DSLs o lenguajes internos: el patron hub-and-spoke (base Qwen3 + adaptador QLoRA por lenguaje) es replicable para otros lenguajes de dominio especifico con presupuesto de memoria minimo.

## Benchmarks y rendimiento
Resultados declarados por el autor en el model-index (no verificados de forma independiente, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Generacion de codigo Vox | Vox held-out bench (52 items) | pass@1 (qwen3_non_thinking_codegen_v1) | 0.3269 |
| Regresion de razonamiento (thinking) | gsm8k_think (slice de 128 items) | accuracy | 0.6172 |
| Regresion de razonamiento (thinking) | math500_think (slice de 128 items) | accuracy | 0.3203 |
| Regresion de razonamiento (thinking) | vox_think (slice de 128 items) | accuracy | 0.2422 |

El autor indica ademas que, de los 52 items del bench held-out, el adaptador corrige 14 y rompe 3 respecto al base. No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval estandar u otros benchmarks generales.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma medida; el autor solo reporta el pico de entrenamiento (19443 MiB) y senala que no hay cifra de memoria de serving. Por el tamano (0.6B) es esperable que quepa en GPU consumer, pero no se confirma con datos.
- GPU recomendadas: no especificadas. El autor orienta el modelo a maquinas con muy poca memoria, incluidos equipos CPU-only.
- GPU consumer: el modelo esta disenado para ese rango por tamano, pero no hay cifras oficiales de VRAM ni de latencia.
- Opciones de despliegue: runtime propio `vox` (`vox mens hub pull --size 0.6B --namespace brbrainerd` y `vox mens serve --model mens/runs/qwen3-0.6b --port 11435`), con API compatible con `/v1/chat/completions`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vox MENS Qwen3-0.6B (este) | 0.6B | no disponible | Codegen en Vox via adaptador QLoRA | apache-2.0 | Hugging Face + runtime `vox` |
| Qwen/Qwen3-0.6B (base) | 0.6B | no disponible en esta ficha | Modelo generalista de texto | apache-2.0 | Hugging Face |
| Otros adaptadores de la familia MENS | no disponible | no disponible | Varias rungs de tamano y spokes | no disponible | no disponible |

La comparacion mas directa es con el propio base Qwen3-0.6B: el adaptador mejora en el dominio Vox (14 items corregidos de 52) a costa de algunas regresiones (3 items rotos). No se dispone de datos de benchmarks de terceros para comparar con alternativas de codegen de 0.5B-1B.

## Limitaciones y advertencias
- El autor advierte que el modelo pierde el hilo en tareas multi-paso; esta pensado para completados rapidos y ediciones de una sola funcion.
- Regresiones documentadas: de 52 items del bench, corrige 14 pero rompe 3 que el base resolvia (por ejemplo, `humaneval_vox_042_reverse_list` falla por errores de tipo).
- pass@1 de 0.3269 en el bench de codegen Vox: un tercio de aciertos, insuficiente para generacion autonoma sin validacion.
- Resultados de benchmarks no verificados de forma independiente (`verified: false`).
- Idioma declarado: solo ingles; el comportamiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion: no documentado especificamente, pero aplicable a un modelo de 0.6B en generacion de codigo; conviene validar la salida con el parser o compilador de Vox.
- Licencia apache-2.0, que permite uso comercial, pero el adaptador depende del base Qwen3-0.6B y de su propia licencia; conviene revisar ambas.
- Dependencia del runtime propietario `vox` para el flujo de pull y serve documentado; no se detallan alternativas de despliegue estandar.
- No hay cifras medidas de memoria de serving ni de latencia, lo que dificulta dimensionar produccion.

## Enlaces
- Hugging Face: https://huggingface.co/brbrainerd/vox-mens-qwen3-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Referencia de modelos MENS (estados, hub-and-spoke, ejemplos): https://voxlang.org/reference/mens-models/
- Referencia de estados de modelos MENS (state legend): https://voxlang.org/reference/mens-models/#state-legend
- Referencia hub-and-spoke: https://voxlang.org/reference/mens-models/#hub-and-spoke
- Ejemplos en las model cards: https://voxlang.org/reference/mens-models/#examples-on-the-cards
