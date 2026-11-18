# brbrainerd/vox-mens-qwen3-14b

## Resumen

vox-mens-qwen3-14b es un adaptador QLoRA publicado por el usuario brbrainerd sobre el modelo base Qwen/Qwen3-14B. Forma parte del proyecto Vox MENS, un sistema de adaptadores especializados que enseña al modelo base a generar código en Vox, un lenguaje de programación propio documentado en voxlang.org. El adaptador se distribuye con la librería `vox` y se etiqueta como "spoke" del lenguaje vox-lang, con el estado de "gate passed" según la nomenclatura del proyecto.

El modelo hereda la arquitectura transformer densa de Qwen3-14B (14.000 millones de parámetros) y se entrena mediante QLoRA, por lo que el repositorio ocupa solo 0,5 GB: contiene únicamente los pesos del adaptador, no el modelo completo. Su propósito es corregir los errores de sintaxis y tipado que comete el modelo base al generar Vox, un lenguaje con construcciones como `fn ... to bool`, `List[int]` y `len(xs)`.

Es relevante para desarrolladores que trabajen con Vox o que estudien adaptadores de bajo rango para lenguajes de programación poco representados en los datos de preentrenamiento. La model card reporta una mejora medible sobre el modelo base en tareas de generación de código Vox, aunque el pass@1 absoluto sigue siendo moderado (0,2692 en un banco de 52 ítems).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-14B) + adaptador QLoRA |
| Parametros totales | 14 000 millones (modelo base); adaptador de bajo rango (tamano no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-14B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repositorio de 0,5 GB, libreria `vox`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-14B, un transformer denso de 14 000 millones de parámetros con revisión base `40c069824f4251a91eefaf281ebe4c544efd3e18`. El entrenamiento utiliza QLoRA, técnica que congela los pesos del modelo base cuantizados y entrena matrices de bajo rango, lo que explica el reducido tamano del repositorio (0,5 GB frente a las decenas de GB del modelo completo). La model card indica un pico de memoria de entrenamiento medido de 54 020 MiB (`peak_source`: run_summary), dato que sitúa el entrenamiento en el rango de una sola máquina grande.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El proyecto Vox MENS organiza los adaptadores en una jerarquía "hub-and-spoke": un adaptador central (hub) y adaptadores especializados por lenguaje (spoke), siendo vox-lang el spoke de este modelo. El estado "gate passed" indica que el adaptador superó los criterios de aceptación definidos por el proyecto, y la model card menciona una verificación de regresión en modo thinking sobre GSM8K, MATH500 y un conjunto propio `vox_think`.

## Capacidades

- Generación de código en el lenguaje Vox: funciones con sintaxis `fn nombre(args) to tipo`, listas tipadas `List[int]`, bucles `while`, condicionales y retorno explícito.
- Corrección de errores de sintaxis y tipado del modelo base en Vox (por ejemplo, sustituir `Vec[int]` por `List[int]` o `xs.len()` por `len(xs)`).
- Razonamiento en modo thinking: la model card reporta verificaciones de regresión sobre GSM8K, MATH500 y `vox_think`.
- Generación de texto en inglés (idioma declarado en la model card).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Generación de código Vox en editores y asistentes: el adaptador corrige errores de sintaxis y tipado que el modelo base comete al escribir Vox, por lo que puede integrarse como autocompletado o generador de funciones en un IDE con soporte del lenguaje.
- Migración de fragmentos de código a Vox: dado un algoritmo descrito en lenguaje natural o en otro lenguaje, el adaptador produce una implementación Vox válida, como muestran los ejemplos de `is_valid_triangle` y `binary_search` de la model card.
- Enseñanza y documentación del lenguaje Vox: el modelo genera ejemplos canónicos de funciones y acciones (`fn delete_item(id: int) to bool`), útiles para tutoriales y referencias.
- Investigación sobre adaptadores QLoRA: el repositorio sirve como caso de estudio de bajo coste (0,5 GB) para evaluar cómo un adaptador de bajo rango modifica el comportamiento de un modelo de 14B en un dominio específico.
- Pruebas de regresión de razonamiento: el adaptador puede usarse para comprobar que la especialización en código no degrada el rendimiento en matemáticas (GSM8K 0,9062, MATH500 0,5078 en las slices reportadas).
- Evaluación comparativa de "hub-and-spoke": equipos que construyan sistemas multi-adaptador pueden usar este modelo como referencia del spoke vox-lang dentro del ecosistema Vox MENS.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Generacion de codigo Vox | Vox held-out bench (52 items) | pass@1 (qwen3_non_thinking_codegen_v1) | 0,2692 |
| Regresion de razonamiento (thinking) | gsm8k_think (128 items) | accuracy | 0,9062 |
| Regresion de razonamiento (thinking) | math500_think (128 items) | accuracy | 0,5078 |
| Regresion de razonamiento (thinking) | vox_think (128 items) | accuracy | 0,9688 |

La model card indica además que, de los 52 ítems del banco, el adaptador corrige 9 y rompe 1 respecto al modelo base. No se han publicado resultados de MMLU, HumanEval estándar ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El modelo base Qwen3-14B requiere, como orientación general, del orden de 28 GB en FP16, pero este dato no figura en la información del adaptador.
- Pico de memoria de entrenamiento medido: 54 020 MiB (unos 52,8 GB), según `run_summary` de la model card.
- GPU recomendadas: no disponible. El pico de entrenamiento sugiere GPUs de 80 GB (A100/H100) o configuraciones multi-GPU para el ajuste; para inferencia no se especifica.
- ¿Cabe en GPU de consumo? No disponible. El adaptador en sí ocupa 0,5 GB, pero requiere cargar el modelo base Qwen3-14B, cuyo requisito de VRAM no se detalla.
- Opciones de despliegue: la librería declarada es `vox`; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vox-mens-qwen3-14b | 14B (base) + adaptador QLoRA | no disponible | Codigo Vox (spoke vox-lang) | apache-2.0 | Hugging Face |
| Qwen/Qwen3-14B (base) | 14B | no disponible en esta ficha | Proposito general | apache-2.0 | Hugging Face |
| Adaptadores Vox MENS de menor tamano | no disponible | no disponible | Codigo Vox | no disponible | Referenciados en voxlang.org |

La comparativa directa con otros adaptadores del ecosistema Vox MENS no puede completarse porque la información proporcionada no incluye sus especificaciones. Frente al modelo base, la diferencia medible es la corrección de errores de sintaxis y tipado en Vox (9 ítems corregidos, 1 roto, sobre 52).

## Limitaciones y advertencias

- El pass@1 en generación de código Vox es de 0,2692 sobre 52 ítems: más de dos tercios de los ítems del banco no se resuelven correctamente, por lo que no es apto como generador autónomo sin verificación.
- La model card reconoce un ítem que el adaptador rompe respecto al modelo base (`humaneval_vox_042_reverse_list` sigue fallando), lo que indica regresiones puntuales.
- Los benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); deben tomarse con cautela.
- Idioma declarado únicamente inglés; el comportamiento en castellano no está documentado.
- No se especifican sesgos conocidos ni tasas de alucinación en la información disponible.
- La licencia apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3-14B y las condiciones del proyecto Vox MENS para despliegues en producción.
- El adaptador requiere cargar el modelo base Qwen3-14B; el repositorio de 0,5 GB no es autosuficiente.
- No hay datos de memoria de servicio medidas para el modelo de 14B (`no serving memory figure has been measured`), lo que dificulta planificar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/brbrainerd/vox-mens-qwen3-14b
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Documentación del proyecto Vox MENS (estados y hub-and-spoke): https://voxlang.org/reference/mens-models/
- Referencia del lenguaje Vox: https://voxlang.org/
