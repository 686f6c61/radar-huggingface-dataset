# brbrainerd/vox-mens-qwen3-1.7b

## Resumen

vox-mens-qwen3-1.7b es un adaptador QLoRA publicado por brbrainerd sobre el modelo base Qwen/Qwen3-1.7B, orientado a la generación de código en Vox, un lenguaje de programación de dominio específico para interfaces de usuario. Forma parte de la familia "Vox MENS", una estructura de tipo hub-and-spoke en la que un modelo base generalista se especializa mediante adaptadores en un lenguaje concreto (el "spoke" es vox-lang). El adaptador se distribuye con licencia Apache 2.0 y está pensado para ejecutarse en portátiles y GPUs de escritorio con presupuesto de memoria modesto.

El modelo resuelve un problema muy acotado: convertir instrucciones en lenguaje natural en programas Vox sintácticamente válidos, así como corregir errores de compilación en una sola pasada. Según la model card, el adaptador corrige 12 de los 52 ítems de un banco de pruebas retenido y rompe 1, con un pass@1 de 0,2692 en generación de código en modo no-thinking. El pico de memoria medido durante el entrenamiento fue de 19 968 MiB.

La relevancia actual es doble: por un lado, demuestra un patrón de especialización por adaptadores sobre modelos pequeños (1,7B parámetros) para lenguajes de nicho; por otro, emplea la librería `vox` con backend Candle y un pipeline propio de descarga y servicio (`vox mens hub pull`, `vox mens serve`), lo que lo aleja del ecosistema estándar de Transformers y lo ata a su propia herramienta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B) con adaptador QLoRA |
| Parámetros totales | 1,7B (modelo base); el adaptador añade un número no disponible de parámetros |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se entrena con QLoRA; no se detallan formatos de despliegue) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0,3 GB; el autor usa la librería `vox` y un manifiesto `hf_sync_manifest.json` con hashes BLAKE3) |

## Arquitectura y entrenamiento

El modelo es un adaptador QLoRA sobre Qwen/Qwen3-1.7B, fijado a la revisión `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`. No se especifica en la información disponible la arquitectura interna del base más allá de su naturaleza Qwen3, ni el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de RLHF o DPO. La model card sí indica que el adaptador pertenece al "spoke" vox-lang dentro de la estructura hub-and-spoke de Vox MENS, y que su estado es "gate-passed".

La innovación técnica destacable no está en la arquitectura sino en el pipeline: entrenamiento QLoRA con backend Candle, verificación de integridad de cada archivo mediante BLAKE3 al descargar, y un servidor local que expone una API compatible con `/v1/chat/completions` pero con un campo adicional `lane` (por ejemplo, `codegen`) para enrutar la petición a la "lane" especializada. El pico de memoria de entrenamiento medido para esta talla es de 19 968 MiB, según el `run_summary` citado en la model card.

## Capacidades

- Generación de código en Vox: produce programas con sintaxis `component`, `fn`, `view`, `heading`, `button`, etc., a partir de descripciones en lenguaje natural.
- Corrección de errores de compilación en una sola pasada (one-pass fixes) para diagnósticos del compilador de Vox.
- Modo thinking y modo no-thinking: los benchmarks separan explícitamente `qwen3_non_thinking_codegen_v1` de las comprobaciones en modo thinking (`gsm8k_think`, `math500_think`, `vox_think`).
- Razonamiento matemático básico en modo thinking, evaluado sobre recortes de GSM8K y MATH500.
- Generación de texto general heredada del base Qwen3-1.7B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Generación de componentes de interfaz en Vox: el adaptador convierte una descripción como "define a page named IndexPage with a title 'Home' that displays a heading with the text 'Welcome'" en un `component IndexPage()` válido, lo que permite prototipar pantallas rápidamente desde especificaciones en lenguaje natural.
- Autocorrección de diagnósticos del compilador: dado un error de compilación en un archivo Vox, el adaptador puede generar un parche en una sola pasada, reduciendo el ciclo de edición manual en el IDE.
- Asistente de código integrado en el editor: al ejecutarse en portátiles con GPU modesta (pico de entrenamiento de ~19,5 GiB, pero inferencia mucho menor), puede desplegarse localmente vía `vox mens serve` en el puerto 11435 y consumirse desde un plugin del editor.
- Generación de tests unitarios en Vox: a partir de la firma de una función, el modelo puede producir casos de prueba sintácticamente válidos que el compilador acepte, como el ejemplo `is_valid_triangle`.
- Enseñanza del lenguaje Vox: el modelo sirve como tutor que traduce enunciados tipo HumanEval a código Vox idiomático, útil en documentación interactiva o tutoriales.
- Pipeline de CI para reparación automática: integrado en un paso de CI, el adaptador puede intentar arreglar errores de compilación detectados en un PR antes de escalar al desarrollador, usando la lane `codegen` del servidor local.
- Filtrado y validación de código generado: combinado con el compilador de Vox, el adaptador permite construir un bucle generate-compile-retry acotado a un lenguaje con gramática estricta.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente, `verified: false` en el model-index):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Generación de código Vox | Vox held-out bench (52 ítems) | pass@1 (qwen3_non_thinking_codegen_v1) | 0,2692 |
| Comprobación de regresión en razonamiento (thinking) | gsm8k_think (recorte de 128 ítems) | accuracy | 0,7578 |
| Comprobación de regresión en razonamiento (thinking) | math500_think (recorte de 128 ítems) | accuracy | 0,4531 |
| Comprobación de regresión en razonamiento (thinking) | vox_think (recorte de 128 ítems) | accuracy | 0,6328 |

Además, la model card indica que, de los 52 ítems del banco retenido, el adaptador corrige 12 y rompe 1. No se han publicado resultados de MMLU, HumanEval estándar ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; la model card indica que no se ha medido ninguna cifra de memoria de servicio para esta talla. Como referencia, el pico de entrenamiento medido es de 19 968 MiB.
- GPU recomendadas: no disponibles en la información proporcionada. El autor orienta esta talla a "portátiles y GPUs de escritorio con presupuesto de memoria modesto".
- Viabilidad en GPU de consumo: el autor la sitúa como la talla pequeña de la familia, pensada para portátiles y GPUs de escritorio; no se concretan modelos.
- Opciones de despliegue: servidor propio `vox mens serve --model mens/runs/qwen3-1.7b --port 11435`, con API compatible con `/v1/chat/completions` y campo `lane`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vox-mens-qwen3-1.7b | 1,7B (base) + adaptador | no disponible | Código Vox (spoke vox-lang) | Apache 2.0 | Hugging Face, librería `vox` |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible | Propósito general | Apache 2.0 | Hugging Face, ecosistema Transformers |
| Otros adaptadores de la familia Vox MENS | no disponible | no disponible | Otras tallas del mismo spoke | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparables de terceros en la información proporcionada; la comparación con el base Qwen3-1.7B se limita a los ejemplos cualitativos de la model card (el base "does not parse" en `page_index` y `humaneval_vox_043_triangle_valid`, mientras el adaptador pasa).

## Limitaciones y advertencias

- El pass@1 en generación de código Vox es de 0,2692 sobre 52 ítems, lo que implica que aproximadamente 3 de cada 4 intentos no superan el banco retenido.
- El adaptador rompe 1 de los 52 ítems que el base resolvía correctamente, según la propia model card.
- El caso `humaneval_vox_042_reverse_list` sigue fallando con errores de tipo (count 5), lo que evidencia que la corrección semántica de listas y tipos sigue siendo frágil.
- Los benchmarks están declarados por el autor y marcados como `verified: false`; no hay validación independiente.
- Idioma limitado al inglés; no se declara soporte de castellano ni de otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar tareas de contexto largo.
- Dependencia de la librería `vox` y del pipeline propio (`vox mens hub pull`, `vox mens serve`); no se documenta compatibilidad con el ecosistema estándar de Transformers, vLLM o llama.cpp.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-1.7B debe respetarse también bajo sus propios términos.
- Riesgo de alucinación en APIs y construcciones del lenguaje Vox no vistas durante el entrenamiento; conviene validar siempre con el compilador antes de aceptar código generado.
- Sesgos: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brbrainerd/vox-mens-qwen3-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Documentación de Vox MENS (estado, hub-and-spoke, ejemplos): https://voxlang.org/reference/mens-models/
- Sitio de Vox: https://voxlang.org/
- Repositorio de la librería `vox` / Candle: no disponible en la información proporcionada.
