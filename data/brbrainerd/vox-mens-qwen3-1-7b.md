# brbrainerd/vox-mens-qwen3-1.7b

## Resumen

vox-mens-qwen3-1.7b es un adaptador QLoRA publicado por el usuario brbrainerd sobre el modelo base Qwen/Qwen3-1.7B (revision 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e). Forma parte de la familia "Vox MENS", un conjunto de adaptadores de distintos tamanos entrenados para generar codigo en Vox, un lenguaje de programacion propio del proyecto vox-lang. El modelo no es un modelo generalista: es un "spoke" especializado del modelo base, entrenado para producir sintaxis Vox valida en tareas de generacion de codigo de un solo archivo y correccion de errores de compilador.

El adaptador se distribuye con licencia Apache 2.0, ocupa 0,3 GB en el repositorio y esta etiquetado como "superseded" por el propio autor: la model card indica que ha sido reemplazado por la linea Vox Mens Qwen3.5 / Qwen3.8 (de 0,8B a 27B) y que se conserva unicamente por compatibilidad hacia atras y para descargas de respaldo. La libreria declarada es "vox" y el entrenamiento se realizo con QLoRA, con inferencia prevista sobre el runtime Candle.

Por su tamano (1,7B parametros) esta pensado para portatiles y GPUs de escritorio con presupuesto de memoria modesto. El pico de entrenamiento medido es de 19968 MiB, aunque el autor no ha publicado una cifra de memoria de servicio. Su relevancia actual es limitada por su condicion de modelo obsoleto dentro de su propia familia, pero sigue siendo un ejemplo util de adaptador de dominio muy estrecho sobre un modelo pequeno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B); adaptador QLoRA sobre el modelo base |
| Parametros totales | 1,7B (modelo base Qwen3-1.7B); numero de parametros del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador QLoRA sobre el modelo base; el repositorio ocupa 0,3 GB. El autor menciona checkpoints standalone en Safetensors + PEFT para la linea sucesora, no para este adaptador |
| Modelo base | Qwen/Qwen3-1.7B (revision 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e) |
| Libreria | vox |
| Estado | Superseded (reemplazado por la linea Vox Mens Qwen3.5 / Qwen3.8) |

## Arquitectura y entrenamiento

El modelo es un adaptador QLoRA entrenado sobre Qwen3-1.7B, un transformer decoder-only del que no se detallan en la informacion disponible ni la composicion del dataset de preentrenamiento ni el numero de tokens. El adaptador anade capacidad de generacion de codigo Vox sobre el modelo base mediante ajuste fino de bajo rango, de modo que el conocimiento general del modelo base se conserva y se especializa en la sintaxis y semantica de Vox.

El autor documenta el proceso como un esquema "hub and spoke": el modelo base actua como hub y el adaptador como spoke especializado en vox-lang. El entrenamiento se realizo con QLoRA y el pico de memoria medido durante el entrenamiento fue de 19968 MiB (fuente: run_summary). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. La inferencia esta prevista sobre Candle, el framework de tensores en Rust.

## Capacidades

- Generacion de codigo en Vox: el adaptador produce programas Vox sintacticamente validos para tareas de generacion de un solo archivo.
- Correccion de errores de compilador en una sola pasada: segun la model card, de 52 items de evaluacion corrige 12 y rompe 1.
- Generacion de componentes de interfaz en Vox (por ejemplo, componentes con vista, titulo y elementos como headings o botones).
- Generacion de funciones con tipos explicitos (por ejemplo, funciones que devuelven bool a partir de enteros).
- Modo thinking del modelo base: las comprobaciones de regresion de razonamiento se ejecutan en modo thinking, por lo que el adaptador conserva esa capacidad del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio): no disponibles.

## Casos de uso

- Generacion de paginas y componentes Vox: el adaptador convierte una descripcion en lenguaje natural en un componente Vox valido, como demuestra el ejemplo `page_index`, donde el modelo base no parsea y el adaptador genera un componente correcto. Es adecuado para prototipado rapido de interfaces en este lenguaje.
- Correccion automatica de errores de compilador: dado un diagnostico del compilador Vox, el adaptador puede producir un parche de una sola pasada. El autor lo describe explicitamente como apto para "one-pass fixes for compiler diagnostics", lo que encaja en un bucle de compilacion con reintento automatico.
- Asistente de codigo en editores para Vox: al ser un adaptador de 1,7B, puede desplegarse en portatiles y usarse para autocompletar o generar funciones completas en un editor, con latencia baja en hardware modesto.
- Generacion de funciones utilitarias: tareas como validar si tres lados forman un triangulo o invertir una lista, resueltas con funciones tipadas. Util para crear bibliotecas de utilidades en Vox a partir de especificaciones en lenguaje natural.
- Evaluacion y regresion de modelos de codigo: el modelo incluye un banco de evaluacion propio (Vox held-out bench de 52 items) y slices de regresion de razonamiento, lo que permite usarlo como referencia en pipelines de evaluacion de adaptadores de la familia Vox MENS.
- Entorno de aprendizaje del lenguaje Vox: al ser un modelo pequeno y especializado, sirve para generar ejemplos de sintaxis Vox en documentacion o tutoriales, siempre con revision humana por su tasa de fallo.
- Fallback en despliegues existentes: al estar marcado como "superseded", su uso realista es como respaldo en sistemas que ya integraban la version anterior de la familia y necesitan compatibilidad hacia atras.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Generacion de codigo Vox | Vox held-out bench (52 items) | pass@1 (qwen3_non_thinking_codegen_v1) | 0,2692 |
| Comprobacion de regresion de razonamiento (thinking) | gsm8k_think (slice de 128 items) | accuracy | 0,7578 |
| Comprobacion de regresion de razonamiento (thinking) | math500_think (slice de 128 items) | accuracy | 0,4531 |
| Comprobacion de regresion de razonamiento (thinking) | vox_think (slice de 128 items) | accuracy | 0,6328 |

No se han publicado en la informacion disponible resultados comparativos con modelos similares ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor solo publica el pico de entrenamiento, 19968 MiB, y no ha medido memoria de servicio.
- GPU recomendadas: no disponibles de forma explicita; por el tamano (1,7B) el modelo esta orientado a "portatiles y GPUs de escritorio con presupuesto de memoria modesto", segun la model card.
- Cabe en GPU de consumo: si, segun la orientacion del autor a portatiles y GPUs de escritorio; no se especifican modelos concretos.
- Opciones de despliegue: inferencia prevista sobre Candle (libreria "vox"); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vox-mens-qwen3-1.7b | 1,7B (adaptador QLoRA) | no disponible | pass@1 0,2692 en Vox held-out bench (52 items) | Apache 2.0 | Hugging Face; marcado como superseded |
| Qwen/Qwen3-1.7B (modelo base) | 1,7B | no disponible | No supera los ejemplos de Vox de la model card (no parsea `page_index` ni `humaneval_vox_043_triangle_valid`) | Apache 2.0 | Hugging Face |
| Linea Vox Mens Qwen3.5 / Qwen3.8 (0,8B-27B) | 0,8B a 27B | no disponible | no disponible | no disponible | Hugging Face; sucesora de este adaptador |

No se dispone de datos de benchmarks comparables de terceros para establecer una comparativa cuantitativa con otros modelos de codigo de tamano similar.

## Limitaciones y advertencias

- Modelo obsoleto: el propio autor lo marca como "superseded" por la linea Vox Mens Qwen3.5 / Qwen3.8; se conserva solo por compatibilidad hacia atras.
- Tasa de exito limitada: pass@1 de 0,2692 en el banco de 52 items; corrige 12 items y rompe 1, y falla casos como `humaneval_vox_042_reverse_list` con errores de tipo.
- Especializacion estrecha: solo genera codigo Vox; no es un modelo generalista y su utilidad fuera de ese lenguaje es dudosa.
- Idioma: solo ingles declarado; el castellano no esta soportado de forma oficial.
- Riesgo de alucinacion: como todo modelo generativo de codigo, puede producir APIs o construcciones inexistentes en Vox; requiere validacion con el compilador.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Limitaciones de contexto: la longitud de contexto no esta publicada, lo que impide planificar su uso en tareas de contexto largo.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un adaptador sobre Qwen3-1.7B conviene verificar las condiciones del modelo base.
- Caveat de produccion: no hay cifras de memoria de servicio ni de latencia publicadas; el unico dato de hardware es el pico de entrenamiento de 19968 MiB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brbrainerd/vox-mens-qwen3-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Indice de la familia Vox Mens: https://huggingface.co/brbrainerd/vox-mens-index
- Playground: https://huggingface.co/spaces/brbrainerd/vox-mens-playground
- Suite de evaluacion: https://huggingface.co/datasets/brbrainerd/vox-mens-eval-vox-lang-bench
- Corpus de entrenamiento verificado: https://huggingface.co/datasets/brbrainerd/vox-mens-data-vox-lang
- Referencia de modelos MENS: https://voxlang.org/reference/mens-models/
- Referencia de modelos MENS, seccion de estado: https://voxlang.org/reference/mens-models/#state-legend
- Referencia de modelos MENS, esquema hub and spoke: https://voxlang.org/reference/mens-models/#hub-and-spoke
- Referencia de modelos MENS, ejemplos en las tarjetas: https://voxlang.org/reference/mens-models/#examples-on-the-cards
