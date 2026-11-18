# brbrainerd/vox-mens-qwen3-4b

## Resumen

vox-mens-qwen3-4b es un adaptador QLoRA publicado por el usuario brbrainerd sobre el modelo base Qwen/Qwen3-4B. Su propósito es especializar un modelo de lenguaje generalista de 4.000 millones de parámetros en la generación de código en Vox, un lenguaje de programación propio del ecosistema voxlang.org. El adaptador forma parte de la familia "Vox MENS", una serie de adaptadores organizados por tamaño (hub-and-spoke) que comparten un mismo lenguaje objetivo, vox-lang.

El modelo no se distribuye como pesos completos, sino como un adaptador entrenado con QLoRA y empaquetado en la librería `vox`, con dependencia declarada de `candle`. El repositorio ocupa 0,2 GB, lo que confirma que se trata de un conjunto de pesos delta y no de un modelo completo. El autor marca el adaptador como "gate-passed", es decir, que ha superado un control de calidad interno definido por el propio proyecto.

La relevancia de esta ficha es acotada: no es un modelo de propósito general, sino una pieza de un pipeline concreto de generación de código en un lenguaje de nicho. Se publica bajo licencia Apache 2.0 y declara únicamente el idioma inglés. Su interés práctico depende por completo de que el usuario trabaje con el lenguaje Vox y con la toolchain `vox`/`candle`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador QLoRA sobre Qwen3-4B, transformer decoder-only) |
| Parámetros totales | no disponible (modelo base Qwen3-4B: 4B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se distribuye en el formato de la librería `vox`) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería `vox`, dependiente de `candle`; no se declara safetensors ni GGUF) |

## Arquitectura y entrenamiento

El adaptador se construye mediante QLoRA sobre Qwen/Qwen3-4B, fijado a la revisión `1cfa9a7208912126459214e8b04321603b3df60c`. Qwen3-4B es un transformer decoder-only del que esta ficha no recibe detalles adicionales de arquitectura, contexto ni composición del dataset de preentrenamiento; por tanto, esos datos se marcan como no disponibles. El adaptador en sí es un conjunto de pesos de bajo rango que modifica el comportamiento del modelo base para alinearlo con el lenguaje Vox.

El entrenamiento se enmarca en el proyecto Vox MENS, que organiza adaptadores por tamaño y estado ("gate passed"). El autor reporta un pico de memoria de entrenamiento medido de 28.280 MiB (`peak_source`: run_summary) para la variante de 4B, y señala explícitamente que no se ha medido ninguna cifra de memoria de servicio. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. La model card menciona que, sobre un conjunto de 52 ítems, el adaptador corrige 10 y rompe 1 en comparación con el modelo base.

## Capacidades

- Generación de código en Vox: funciones, estructuras de control, tipos genéricos (`List[int]`, `Result[list[int]]`), bucles `while`, declaración de acciones y ejemplos de uso con `main`.
- Corrección de errores de sintaxis del modelo base: el adaptador transforma salidas que no parsean en programas Vox válidos, según los ejemplos de ordenación por selección y burbuja.
- Razonamiento en modo thinking: se reportan métricas de regresión en gsm8k_think, math500_think y vox_think, lo que indica que el adaptador conserva (o se evalúa contra) el modo de razonamiento extendido de Qwen3.
- Generación de texto general: heredada del modelo base Qwen3-4B, aunque el adaptador está orientado a código.
- Capacidades multilingües: limitadas al inglés según la declaración de idiomas del repositorio.
- Tool calling, function calling, agentes y multi-step reasoning: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Generación de funciones Vox en un editor o IDE: el adaptador produce código que parsea correctamente con la sintaxis de Vox, lo que permite autocompletar funciones completas a partir de una descripción en lenguaje natural, como se muestra en los ejemplos de selection sort y bubble sort.
- Migración de código desde otros lenguajes a Vox: dado un fragmento en Python o similar, el modelo puede reescribirlo en Vox respetando construcciones como `fn ... to ...`, `let mut` y `while`, reduciendo el trabajo manual de traducción.
- Corrección de salidas inválidas del modelo base: en pipelines que ya usan Qwen3-4B para generar Vox, este adaptador corrige casos en los que el modelo base emite sintaxis que no parsea, lo que mejora la tasa de éxito sin cambiar de modelo.
- Docencia y ejemplos de Vox: generación de programas de ejemplo (ordenaciones, operaciones CRUD simuladas como `delete_item`) para documentación, tutoriales o tests de la toolchain.
- Pruebas automatizadas de la toolchain Vox: el adaptador puede emplearse para generar corpus de programas Vox válidos que alimenten tests de parser, formateador o analizador estático.
- Evaluación comparativa de adaptadores: al formar parte de una familia organizada por tamaño (hub-and-spoke), sirve para medir el efecto del tamaño del modelo base en la calidad de generación de Vox dentro de un mismo pipeline.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index. No están verificados (`verified: false`).

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Generación de código Vox | Vox held-out bench (52 ítems) | pass@1 (qwen3_non_thinking_codegen_v1) | 0,2500 |
| Regresión de razonamiento (thinking) | gsm8k_think (128 ítems) | accuracy | 0,8047 |
| Regresión de razonamiento (thinking) | math500_think (128 ítems) | accuracy | 0,5156 |
| Regresión de razonamiento (thinking) | vox_think (128 ítems) | accuracy | 0,7969 |

El autor indica además que, sobre los 52 ítems del bench, el adaptador corrige 10 y rompe 1 respecto al modelo base. No se han publicado resultados de MMLU, HumanEval estándar ni GSM8K completo en la información disponible.

## Requisitos de hardware

- El adaptador se sirve junto al modelo base Qwen3-4B; la VRAM total depende de la cuantización del base, no del adaptador (0,2 GB en el repositorio).
- Pico de memoria de entrenamiento medido: 28.280 MiB (unos 27,6 GiB) para la variante de 4B, según `run_summary`.
- Memoria de servicio: no medida ni publicada por el autor.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño del base (4B), es razonable esperar que quepa en GPU de consumo con cuantización, pero el autor no lo confirma.
- Opciones de despliegue: la librería declarada es `vox` con dependencia de `candle`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vox-mens-qwen3-4b | base 4B + adaptador QLoRA | no disponible | Código Vox (vox-lang) | Apache 2.0 | Hugging Face, librería `vox` |
| Qwen/Qwen3-4B | 4B | no disponible en esta ficha | Propósito general | no disponible en esta ficha | Hugging Face |
| Otros adaptadores Vox MENS | varios tamaños | no disponible | Código Vox | no disponible | Ecosistema voxlang.org |

No se dispone de datos de benchmarks comparables de alternativas en la información proporcionada, por lo que no se incluye una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado para Vox; su uso fuera de ese lenguaje no está respaldado por las métricas publicadas.
- pass@1 de 0,25 en el bench held-out de 52 ítems: tres de cada cuatro ítems no se resuelven, según los datos del autor.
- Métricas no verificadas: todos los resultados de la model-index tienen `verified: false`.
- Solo inglés declarado: no hay soporte multilingüe documentado.
- Sin datos de sesgo, alucinación ni robustez en la información disponible.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial debe verificar también la licencia del modelo base Qwen3-4B, que no se detalla en esta ficha.
- El adaptador depende de la toolchain `vox` y de `candle`; la portabilidad a otros runtimes no está documentada.
- El autor no ha medido memoria de servicio, por lo que las estimaciones de despliegue en producción no están respaldadas por datos.
- Repositorio con 0 "likes" y 3.896 descargas en la fecha de consulta: adopción limitada y poca validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/brbrainerd/vox-mens-qwen3-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Referencia de modelos MENS (estados y hub-and-spoke): https://voxlang.org/reference/mens-models/
- Leyenda de estados: https://voxlang.org/reference/mens-models/#state-legend
- Ejemplos en las tarjetas: https://voxlang.org/reference/mens-models/#examples-on-the-cards
