# brbrainerd/vox-mens-qwen3-14b

## Resumen

Vox MENS Qwen3-14B es un adaptador QLoRA publicado por el usuario brbrainerd sobre el modelo base Qwen/Qwen3-14B. Forma parte de la familia "Vox MENS", un conjunto de adaptadores de distintos tamanos (de 0,8B a 27B en la linea sucesora) cuyo objetivo es especializar modelos genericos en la generacion de codigo en **vox-lang**, un lenguaje de programacion propio del ecosistema Vox. El adaptador se distribuye como un checkpoint PEFT sobre la revision `40c069824f4251a91eefaf281ebe4c544efd3e18` del modelo base.

El modelo resuelve un problema muy concreto: que un LLM generalista de 14B sea capaz de producir codigo sintacticamente valido y semanticamente correcto en un lenguaje de nicho que practicamente no aparece en los corpus de preentrenamiento. Segun la model card, el adaptador corrige 9 de 52 items de un banco de pruebas interno y rompe 1, lo que da una medida honesta y acotada de su utilidad: no transforma el modelo en un programador experto de vox-lang, sino que reduce errores de parseo y de tipos en tareas cortas.

Es relevante ahora porque ilustra un patron de trabajo cada vez mas comun: adaptadores pequenos y baratos (0,5 GB de repo) sobre modelos abiertos grandes, con evaluacion reproducible y publicacion transparente de resultados, incluidos los negativos. La propia model card lo marca como **superseded** por la linea Qwen3.5/Qwen3.8, por lo que debe considerarse un artefacto de compatibilidad y respaldo, no la opcion recomendada para nuevos despliegues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA (PEFT) sobre transformer decoder-only Qwen3-14B |
| Parametros totales | 14B en el modelo base; el adaptador anade un subconjunto no especificado (repo de 0,5 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del Qwen3-14B base) |
| Tipos de cuantizacion | QLoRA implica cuantizacion del base durante el entrenamiento; formatos de inferencia no disponibles |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | adaptador PEFT sobre safetensors del modelo base (libreria `vox`, compatible con candle) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre Qwen3-14B, un transformer decoder-only denso de la familia Qwen3. QLoRA combina cuantizacion del modelo base (tipicamente 4 bits NF4) con adaptadores de bajo rango entrenables, lo que permite ajustar un modelo de 14B en una sola maquina. La model card reporta un pico de memoria de entrenamiento medido de **54.020 MiB** (`peak_source`: run_summary), cifra coherente con un entrenamiento QLoRA de 14B en una GPU de 80 GB o en configuraciones multi-GPU de gama alta.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO. La model card enlaza a un corpus de entrenamiento verificado (`vox-mens-data-vox-lang`) y a una suite de evaluacion (`vox-mens-eval-vox-lang-bench`), pero sus contenidos no se incluyen aqui. El modelo soporta el modo *thinking* de Qwen3, y las pruebas de regresion en GSM8K, MATH500 y el benchmark interno `vox_think` se ejecutan en ese modo, lo que sugiere que el adaptador preserva la capacidad de razonamiento extendido del base.

## Capacidades

- Generacion de codigo en **vox-lang**: funciones, busqueda binaria, validacion de tipos, acciones con parametros tipados.
- Generacion de texto general, heredada del Qwen3-14B base.
- Razonamiento en modo *thinking* (cadena de pensamiento extendida), con resultados de regresion reportados en GSM8K y MATH500.
- Razonamiento matematico basico y de nivel competicion moderado en modo thinking.
- Capacidad multilingue limitada: la model card solo declara `en`.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (modelo solo texto).

## Casos de uso

- **Generacion de utilidades en vox-lang para el ecosistema Vox**: el adaptador produce funciones cortas y correctas (validacion de triangulos, busqueda binaria) que pueden integrarse directamente en proyectos del lenguaje sin correccion manual, gracias a que reduce errores de parseo y de tipos respecto al base.
- **Autocompletado y asistencia en el editor para vox-lang**: integrado en un plugin de editor, el modelo sugiere firmas y cuerpos de funciones en la sintaxis `fn nombre(args) to tipo`, lo que acelera la escritura de codigo repetitivo.
- **Migracion de fragmentos desde otros lenguajes a vox-lang**: el modelo traduce patrones conocidos (bucles `while`, busqueda binaria, validaciones) a la sintaxis de vox-lang, util en proyectos que portan utilidades desde Python o Rust.
- **Generacion de tests unitarios en vox-lang**: dado un contrato de funcion, el modelo puede producir casos de prueba con los tipos correctos, aprovechando su familiaridad con `List[int]`, `bool` y `int`.
- **Fallback de compatibilidad en pipelines existentes**: al estar marcado como `superseded`, encaja en sistemas que ya consumen la version Qwen3 del adaptador y necesitan seguir funcionando mientras migran a la linea Qwen3.5/Qwen3.8.
- **Investigacion sobre adaptacion de bajo rango a lenguajes de nicho**: sirve como caso de estudio reproducible (con banco de 52 items y resultados publicados) para medir cuanto puede aprender un adaptador QLoRA sobre un lenguaje practicamente ausente del preentrenamiento.
- **Generacion de codigo asistida en entornos con recursos limitados**: al ser un adaptador de 0,5 GB sobre un base de 14B, permite servir la especializacion en vox-lang sin desplegar un modelo adicional de 14B completo por cada lenguaje.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Generacion de codigo Vox | Vox held-out bench (52 items) | pass@1 (qwen3_non_thinking_codegen_v1) | 0,2692 |
| Regresion de razonamiento (thinking) | gsm8k_think (128 items) | accuracy | 0,9062 |
| Regresion de razonamiento (thinking) | math500_think (128 items) | accuracy | 0,5078 |
| Regresion de razonamiento (thinking) | vox_think (128 items) | accuracy | 0,9688 |

La model card anade un dato cualitativo relevante: de los 52 items del banco, el adaptador **corrige 9 y rompe 1** respecto al Qwen3-14B base. El pass@1 de 0,2692 debe interpretarse en ese contexto: es un banco dificil y el adaptador mejora al base de forma neta pero modesta.

## Requisitos de hardware

- **Entrenamiento**: pico medido de 54.020 MiB (unos 53 GB) para QLoRA sobre el base de 14B; requiere GPU de 80 GB (A100, H100) o configuracion multi-GPU.
- **Inferencia**: no hay cifra de memoria de servicio medida en la informacion disponible. Como referencia estructural, un base de 14B en FP16 ocupa unos 28 GB de pesos, en 8 bits unos 14 GB y en 4 bits unos 7-8 GB, mas overhead de contexto y KV cache.
- **GPU recomendadas**: A100 80 GB o H100 para entrenamiento; para inferencia, A100 40/80 GB, L40S o RTX 4090 (24 GB) con cuantizacion agresiva.
- **Consumer GPU**: viable en RTX 4090 (24 GB) y RTX 3090 (24 GB) solo con cuantizacion de 4-8 bits; en GPUs de 12-16 GB requeriria cuantizaciones muy agresivas y contexto reducido.
- **Despliegue**: la libreria declarada es `vox` con soporte de `candle`; al ser un adaptador PEFT sobre safetensors, es compatible con el stack habitual de Hugging Face (transformers + PEFT). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Estado |
|---|---|---|---|---|---|
| vox-mens-qwen3-14b | 14B (base) + adaptador | no disponible | vox-lang (codigo) | apache-2.0 | superseded |
| Qwen/Qwen3-14B | 14B | no disponible en esta ficha | generalista | apache-2.0 | base de referencia |
| Linea Vox Mens Qwen3.5/Qwen3.8 (0,8B-27B) | 0,8B a 27B | no disponible | vox-lang (codigo) | no disponible | recomendada por el autor |
| Otros adaptadores de codigo sobre Qwen3-14B | 14B (base) | no disponible | codigo general | variable | no disponible |

La comparacion mas directa es contra el propio Qwen3-14B base: el adaptador mejora el pass@1 en el banco interno de vox-lang y corrige errores de parseo y tipos, a costa de un sobrecoste minimo de almacenamiento (0,5 GB). Frente a la linea sucesora del mismo autor, este checkpoint queda como opcion de compatibilidad.

## Limitaciones y advertencias

- **Marcado como superseded**: el propio autor recomienda migrar a la linea Qwen3.5/Qwen3.8; este adaptador se mantiene solo para compatibilidad y fallback.
- **Resultados no verificados**: todas las metricas del model-index tienen `verified: false`; no hay evaluacion independiente publicada.
- **pass@1 bajo en el banco interno** (0,2692): el modelo falla en la mayoria de items del banco de 52, aunque mejora al base.
- **Idioma**: solo se declara `en`; el rendimiento en castellano no esta documentado.
- **Sesgos**: no disponibles en la informacion proporcionada; al heredar el base Qwen3-14B, arrastra los sesgos de su corpus de preentrenamiento.
- **Alucinacion**: riesgo propio de los LLM, agravado en un lenguaje de nicho donde el modelo puede inventar APIs o construcciones inexistentes de vox-lang.
- **Contexto**: la longitud de contexto no se especifica para el adaptador; debe asumirse la del base Qwen3-14B, sin garantia de que el adaptador la preserve en tareas de codigo.
- **Licencia**: apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3-14B y de los datos de entrenamiento enlazados antes de un despliegue en produccion.
- **Tooling**: no se confirma soporte en vLLM, llama.cpp u Ollama; la integracion depende de la libreria `vox` y de candle.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brbrainerd/vox-mens-qwen3-14b
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Indice Vox Mens: https://huggingface.co/brbrainerd/vox-mens-index
- Playground: https://huggingface.co/spaces/brbrainerd/vox-mens-playground
- Suite de evaluacion: https://huggingface.co/datasets/brbrainerd/vox-mens-eval-vox-lang-bench
- Corpus de entrenamiento: https://huggingface.co/datasets/brbrainerd/vox-mens-data-vox-lang
- Referencia de modelos Vox MENS: https://voxlang.org/reference/mens-models/
- Documentacion de vox-lang: https://voxlang.org/
