# brbrainerd/vox-mens-qwen3-4b

## Resumen

vox-mens-qwen3-4b es un adaptador QLoRA publicado por brbrainerd sobre el modelo base Qwen/Qwen3-4B. Forma parte de la familia "Vox MENS", una serie de adaptadores cuyo objetivo es especializar modelos generalistas en la generación de código para **Vox**, un lenguaje de programación propio documentado en voxlang.org. El adaptador se entrenó con la librería `vox` y pesos en formato Candle, y está pensado para integrarse en el ecosistema de herramientas del autor (playground, suite de evaluación y corpus de entrenamiento verificados).

El modelo resuelve un problema muy concreto: que un LLM generalista genere código sintácticamente válido y semánticamente correcto en un lenguaje de nicho que apenas aparece en los datos de preentrenamiento. Según la model card, el adaptador "arregla" 10 de 52 ítems de un banco de pruebas propio (held-out) y "rompe" 1, lo que da un pass@1 de 0,25 en generación de código sin modo thinking.

Es relevante ahora por dos motivos. Primero, porque demuestra una metodología reproducible de adaptación de sub-lenguajes (QLoRA sobre un 4B) con métricas de regresión explícitas en modo thinking (GSM8K, MATH500 y un bench propio). Segundo, porque el autor lo marca como **superseded**: la familia ha evolucionado a la línea Qwen3.5/Qwen3.8 (0,8B–27B), y este checkpoint se conserva solo por compatibilidad hacia atrás y como fallback.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador QLoRA |
| Parametros totales | 4B (modelo base Qwen3-4B); parametros del adaptador: no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | QLoRA (cuantizacion del base durante el entrenamiento); formatos de inferencia: no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | adaptador para la libreria `vox` (Candle); repo de 0,2 GB; safetensors/PEFT no confirmado para este checkpoint |

## Arquitectura y entrenamiento

El modelo es un adaptador QLoRA sobre Qwen3-4B, un transformer decoder-only de la familia Qwen3. El adaptador se entrena con la librería `vox` (basada en Candle, el framework de tensores en Rust) y se distribuye como un repo ligero de 0,2 GB, coherente con un checkpoint de adaptador y no con pesos completos. La model card indica que el spoke del adaptador es `vox-lang` y que su estado es "gate-passed" (superó la puerta de calidad definida por el autor).

No se detalla en la informacion disponible el número de tokens de entrenamiento, la composición exacta del dataset (más allá de estar orientado a código Vox) ni si hubo RLHF/DPO. Sí se menciona un corpus de entrenamiento verificado enlazado en la model card (`vox-mens-data-vox-lang`) y una suite de evaluación (`vox-mens-eval-vox-lang-bench`). El pico de memoria medido durante el entrenamiento del 4B es de 28 280 MiB (`peak_source`: run_summary), y no se ha medido una cifra de memoria de servicio (serving).

La innovación principal no es arquitectónica sino metodológica: un pipeline de adaptación de un lenguaje de programación de nicho con evaluación de regresión en modo thinking, para verificar que la especialización en código no degrada el razonamiento del modelo base.

## Capacidades

- Generación de código en **Vox**, el lenguaje objetivo del adaptador (funciones, acciones, control de flujo, listas, etc.).
- Generación de texto general heredada del base Qwen3-4B.
- Razonamiento en modo thinking (el modelo base Qwen3 soporta modo thinking; los benchmarks de regresión se ejecutan en ese modo).
- Razonamiento matemático (evaluado en GSM8K y MATH500 en modo thinking).
- Capacidades multilingües: limitadas al inglés según la model card (`language: en`).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- **Generación de código Vox en el editor**: el adaptador está entrenado específicamente para producir Vox válido a partir de descripciones en lenguaje natural, por lo que encaja en asistentes de código o plugins que autocompleten funciones Vox. Es su caso de uso principal y el que miden los ejemplos de la model card (selection sort, bubble sort, definición de acciones).
- **Migración de fragmentos de código a Vox**: dado un algoritmo descrito o escrito en otro lenguaje, usar el adaptador para reescribirlo en sintaxis Vox, aprovechando que el base Qwen3-4B ya conoce los lenguajes comunes y el adaptador aporta el dialecto.
- **Generación de tests y ejemplos de Vox**: producir fragmentos de código de ejemplo para documentación, tutoriales o suites de prueba del propio lenguaje, ya que el adaptador ha sido validado contra un bench held-out de 52 ítems.
- **Fallback en pipelines existentes del ecosistema Vox MENS**: la model card lo marca como superseded y conservado para "fallback pulls"; sirve como respaldo cuando los checkpoints más nuevos (Qwen3.5/Qwen3.8) no están disponibles o fallan en un entorno concreto.
- **Investigación sobre adaptación de lenguajes de nicho**: el par adaptador + suite de evaluación + corpus verificados permite reproducir el experimento de QLoRA sobre un 4B y medir la degradación en razonamiento (GSM8K, MATH500) frente a la mejora en código.
- **Prototipado en entornos con memoria unificada limitada**: con un pico de entrenamiento medido de ~28 GB, el 4B es el "peldaño medio" de la familia, adecuado para estaciones de trabajo o portátiles con memoria unificada generosa, según la propia model card.
- **Evaluación comparativa de adaptadores**: al publicar métricas de regresión en modo thinking, sirve como referencia para comparar el efecto de distintos adaptadores sobre el mismo base Qwen3-4B.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Generacion de codigo Vox | Vox held-out bench (52 items) | pass@1 (qwen3_non_thinking_codegen_v1) | 0,2500 |
| Regresion de razonamiento (thinking) | gsm8k_think (128 items) | accuracy | 0,8047 |
| Regresion de razonamiento (thinking) | math500_think (128 items) | accuracy | 0,5156 |
| Regresion de razonamiento (thinking) | vox_think (128 items) | accuracy | 0,7969 |

Contexto adicional de la model card: de los 52 ítems del held-out bench, el adaptador corrige 10 y rompe 1 respecto al base. El base Qwen3-4B falla en `humaneval_vox_050_selection_sort` ("does not parse", count 6) y el adaptador lo resuelve. No se han publicado en la informacion disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K completo) para este checkpoint.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la informacion proporcionada. El único dato medido es el pico de entrenamiento: 28 280 MiB (~27,6 GiB) para el 4B.
- **GPU recomendadas**: no disponible en la informacion proporcionada. Por tamaño del base (4B), cabría esperar GPUs de 24 GB o más en precisión completa, pero el autor no publica cifras de serving.
- **¿Cabe en GPU consumer?**: no confirmado por el autor; depende de la cuantización elegida, que tampoco se detalla.
- **Opciones de despliegue**: la librería nativa es `vox` (Candle). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Estado |
|---|---|---|---|---|---|
| vox-mens-qwen3-4b | 4B (adaptador QLoRA) | no disponible | Codigo Vox | apache-2.0 | Superseded |
| Qwen/Qwen3-4B (base) | 4B | no disponible en esta ficha | Generico | apache-2.0 | Activo |
| Vox MENS Qwen3.5/Qwen3.8 (0,8B–27B) | 0,8B–27B | no disponible | Codigo Vox | no disponible | Activo (linea actual) |

La comparación más directa es contra su propio modelo base: el adaptador mejora la generación de Vox (10 ítems corregidos frente a 1 roto en el held-out bench) manteniendo un razonamiento en modo thinking de 0,8047 en GSM8K y 0,5156 en MATH500. Frente a la línea sucesora Qwen3.5/Qwen3.8 del mismo autor, este checkpoint queda como opción legacy. No se dispone de datos de benchmarks de la línea sucesora en la informacion proporcionada para comparar numéricamente.

## Limitaciones y advertencias

- **Modelo superseded**: el propio autor lo marca como reemplazado por la línea Qwen3.5/Qwen3.8; no se recomienda para nuevos despliegues.
- **Idioma**: solo inglés (`language: en`); el soporte multilingüe no está declarado.
- **Alcance estrecho**: la especialización es en Vox; fuera de ese lenguaje el adaptador no aporta ventajas sobre el base y podría degradar ligeramente otras tareas.
- **Benchmarks no verificados**: todas las métricas del model-index tienen `verified: false` y proceden de suites propias del autor, no de evaluaciones independientes.
- **Riesgo de alucinación**: no cuantificado en la informacion disponible; como todo LLM, puede generar APIs o construcciones de Vox inexistentes.
- **Sesgos**: no documentados en la informacion disponible.
- **Licencia**: apache-2.0, lo que permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3-4B y de los datos de entrenamiento enlazados.
- **Formato de pesos**: adaptador para la librería `vox`/Candle; la portabilidad a otros runtimes (PEFT/safetensors estándar) no está confirmada para este checkpoint concreto.
- **Contexto**: la longitud de contexto no se especifica en la informacion proporcionada; no asumir la del base sin verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brbrainerd/vox-mens-qwen3-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Indice Vox Mens: https://huggingface.co/brbrainerd/vox-mens-index
- Playground: https://huggingface.co/spaces/brbrainerd/vox-mens-playground
- Suite de evaluacion: https://huggingface.co/datasets/brbrainerd/vox-mens-eval-vox-lang-bench
- Corpus de entrenamiento verificado: https://huggingface.co/datasets/brbrainerd/vox-mens-data-vox-lang
- Documentacion de modelos MENS: https://voxlang.org/reference/mens-models/
- Referencia del lenguaje Vox: https://voxlang.org
