# brbrainerd/vox-mens-qwen3-8b

## Resumen

vox-mens-qwen3-8b es un adaptador QLoRA publicado por el usuario brbrainerd sobre el modelo base Qwen/Qwen3-8B. Su objetivo no es el ajuste generalista, sino la especializacion en vox-lang, un lenguaje de programacion propio del ecosistema Vox, dentro de una arquitectura denominada hub-and-spoke en la que el modelo base actua como hub y cada adaptador (spoke) cubre un dominio concreto. El adaptador esta entrenado, su spoke es vox-lang y su puerta de calidad figura como superada (gate-passed), aunque el propio autor lo marca como superseded por la linea posterior Vox Mens Qwen3.5/Qwen3.8.

El modelo se distribuye como adapter PEFT sobre Qwen3-8B, con licencia Apache 2.0 y un repositorio de 0,4 GB, lo que confirma que no incluye los pesos completos del modelo base. La relevancia actual es acotada: se conserva por compatibilidad hacia atras y como fallback para despliegues existentes, no como opcion recomendada para nuevos proyectos. Para quien necesite generar codigo vox-lang de forma fiable, el interes esta en que corrige errores de tipado y de sintaxis que el Qwen3-8B sin ajustar comete de forma sistematica.

La informacion disponible sobre arquitectura interna, contexto nativo o composicion del dataset de entrenamiento es limitada; la model card se centra en el proceso de evaluacion y en los ejemplos cualitativos de correccion, no en los detalles del pipeline de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (QLoRA) sobre transformer Qwen3-8B |
| Parametros totales | 8B (modelo base); el adaptador no declara recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en el formato de la libreria vox) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | adaptador PEFT sobre Qwen3-8B; el autor referencia checkpoints Safetensors + PEFT en la linea sucesora |

## Arquitectura y entrenamiento

El modelo es un adaptador QLoRA entrenado sobre Qwen/Qwen3-8B (revision b968826d9c46dd6066d109eabc6255188de91218), es decir, se aplica sobre un transformer decoder-only de 8B parametros que no se redistribuye. La libreria declarada es vox, propia del ecosistema del autor, y el entrenamiento se realizo con Candle. El adaptador forma parte de un esquema hub-and-spoke: el hub es el modelo base y el spoke es el dialecto o lenguaje objetivo, en este caso vox-lang.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La model card si aporta un dato operativo concreto: el pico de memoria medido durante el entrenamiento del adaptador de 8B es de 36 356 MiB, con origen en el resumen de ejecucion (peak_source: run_summary), y no se ha medido ninguna cifra de memoria de servicio. El proceso de evaluacion compara el modelo base frente al adaptador sobre un conjunto de 52 items; de ellos, el adaptador corrige 8 y no rompe ninguno.

## Capacidades

- Generacion de codigo en vox-lang: funciones, mutaciones y acciones con sintaxis y sistema de tipos propios del lenguaje.
- Correccion de errores de tipado del modelo base, como el uso incorrecto de Result[int] frente a int en retornos de funciones.
- Generacion de codigo en modo no-thinking, evaluada con el protocolo qwen3_non_thinking_codegen_v1.
- Razonamiento en modo thinking heredado de Qwen3, con controles de regresion sobre gsm8k, math500 y un conjunto propio vox_think.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma explicita en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo language de la model card.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Generacion de codigo vox-lang en produccion: el adaptador produce funciones que parsean y compilan correctamente donde el Qwen3-8B base falla por errores de tipo, lo que reduce la tasa de rechazo en pipelines de compilacion automatizada.
- Migracion de prototipos escritos a mano a vox-lang: dado un enunciado en lenguaje natural, el modelo emite la firma y el cuerpo de la funcion, util para equipos que adoptan el lenguaje y necesitan ejemplos canonicos.
- Asistente de autocompletado en editores: con 8B de parametros y un adaptador ligero de 0,4 GB, se puede servir en una estacion de trabajo y ofrecer sugerencias de codigo vox-lang en el IDE.
- Correccion de errores de tipado en revisiones de codigo: el adaptador esta entrenado especificamente para resolver discrepancias entre tipos declarados y retornados, un caso frecuente en el lenguaje.
- Fallback en despliegues heredados: al estar marcado como superseded pero preservado, sirve para mantener reproducibilidad en sistemas que ya consumen este checkpoint concreto.
- Evaluacion comparativa de adaptadores: util como linea base para medir la mejora de la linea Qwen3.5/Qwen3.8 sobre el mismo conjunto de 52 items.
- Generacion de mutaciones y acciones de dominio: la model card incluye ejemplos de mutation update_item y action delete_item, lo que cubre la generacion de primitivas de negocio en vox-lang.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo; no verificados de forma independiente.

| Tarea | Conjunto de evaluacion | Metrica | Valor |
|---|---|---|---|
| Generacion de codigo Vox | Vox held-out bench (52 items) | pass@1 (qwen3_non_thinking_codegen_v1) | 0,2500 |
| Control de regresion de razonamiento (thinking) | gsm8k_think (128 items) | accuracy | 0,8906 |
| Control de regresion de razonamiento (thinking) | math500_think (128 items) | accuracy | 0,4766 |
| Control de regresion de razonamiento (thinking) | vox_think (128 items) | accuracy | 0,9375 |

El pass@1 de 0,25 sobre el banco de 52 items debe leerse junto con el dato cualitativo de la model card: el adaptador corrige 8 items y no rompe ninguno respecto al modelo base. No se han publicado en la informacion disponible resultados de MMLU, HumanEval estandar ni GSM8K completo para este adaptador.

## Requisitos de hardware

- VRAM de inferencia: no medida ni declarada por el autor para servicio; el unico dato disponible es el pico de entrenamiento de 36 356 MiB.
- VRAM estimada para el modelo base en precision completa: en torno a 16 GB solo para pesos en FP16, mas overhead de activaciones y cache KV; el adaptador anade una fraccion minima.
- GPU recomendadas: estaciones de trabajo y portatiles de gama alta con memoria abundante, segun la propia model card; una A100 o H100 permiten servir el modelo con holgura, y una RTX 4090 de 24 GB es viable en cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizacion, y en tarjetas de 16 GB con cuantizaciones agresivas.
- Opciones de despliegue: el adaptador se carga sobre Qwen3-8B; vLLM, TGI y llama.cpp son opciones para el modelo base fusionado con el adaptador, aunque la informacion disponible no confirma compatibilidad explicita con cada backend.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| vox-mens-qwen3-8b | 8B (adaptador) | no disponible | Codigo vox-lang | Apache 2.0 | Superseded |
| Qwen/Qwen3-8B | 8B | no disponible en esta ficha | Modelo generalista | Apache 2.0 | Activo |
| Vox Mens Qwen3.5/Qwen3.8 (0,8B-27B) | 0,8B-27B | no disponible | Codigo vox-lang | no disponible | Sucesor recomendado |

La comparacion mas directa es contra el propio Qwen3-8B sin adaptar: sobre el item humaneval_vox_069_binary_search, el base genera dos errores de tipo y el adaptador pasa. Frente a la linea sucesora Vox Mens Qwen3.5/Qwen3.8, el autor recomienda migrar, y este checkpoint queda solo como compatibilidad. No se dispone de datos para comparar con adaptadores de codigo de otros ecosistemas.

## Limitaciones y advertencias

- Modelo marcado como superseded por el autor: no es la opcion recomendada para nuevos despliegues.
- El adaptador no incluye los pesos del modelo base; requiere descargar Qwen/Qwen3-8B por separado.
- Idiomas: solo ingles declarado, lo que limita su uso en castellano sin evaluacion adicional.
- El pass@1 de 0,25 sobre 52 items indica que tres de cada cuatro problemas del banco no se resuelven; el exito en produccion dependera del dominio concreto.
- Resultados de benchmarks no verificados (verified: false) y procedentes de conjuntos propios del autor, sin comparacion con estandares externos.
- Riesgo de alucinacion en APIs o funciones de vox-lang no cubiertas por el corpus de entrenamiento.
- Sesgos: no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y de evaluacion independiente aconseja validacion propia antes de produccion.
- No hay cifras de memoria de servicio ni de latencia, lo que dificulta el dimensionamiento de infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brbrainerd/vox-mens-qwen3-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Indice Vox Mens: https://huggingface.co/brbrainerd/vox-mens-index
- Playground: https://huggingface.co/spaces/brbrainerd/vox-mens-playground
- Suite de evaluacion: https://huggingface.co/datasets/brbrainerd/vox-mens-eval-vox-lang-bench
- Corpus de entrenamiento verificado: https://huggingface.co/datasets/brbrainerd/vox-mens-data-vox-lang
- Referencia de modelos Mens: https://voxlang.org/reference/mens-models/
