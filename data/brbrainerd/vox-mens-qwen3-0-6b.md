# brbrainerd/vox-mens-qwen3-0.6b

## Resumen

Vox Mens Qwen3-0.6B es un adaptador QLoRA publicado por el usuario brbrainerd sobre el modelo base Qwen/Qwen3-0.6B. Su propósito es especializar un modelo pequeño de 0,6 mil millones de parámetros en la generación de código en Vox, un lenguaje de programación propio del proyecto Vox Lang, con soporte para construcciones específicas como componentes de interfaz, acciones y funciones tipadas. Forma parte de la familia "Vox Mens", una línea de adaptadores organizada por tamaños que abarca desde 0,6B hasta 27B.

El modelo se distribuye como adaptador (relación `adapter` respecto al base) bajo licencia Apache 2.0 y está etiquetado como `superseded`, es decir, reemplazado por la línea posterior basada en Qwen3.5/Qwen3.8. Se conserva por compatibilidad hacia atrás y como opción de respaldo para entornos con muy poca memoria, incluidos equipos sin GPU.

Su relevancia actual es limitada: se trata de un artefacto legacy orientado a completaciones rápidas y ediciones cortas de una sola función, donde la latencia importa más que la profundidad de razonamiento. No obstante, resulta útil como ejemplo de adaptación de un modelo base pequeño a un lenguaje de dominio específico y para evaluar el coste/beneficio de especializar modelos de 0,6B frente a usar el base sin ajuste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B); adaptador QLoRA sobre el base |
| Parámetros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se distribuye en formato PEFT; el base admite las cuantizaciones habituales de Qwen3, no detalladas en la información) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | adaptador PEFT sobre Safetensors del base; repo de 0,1 GB; librería `vox` |

## Arquitectura y entrenamiento

El modelo es un adaptador QLoRA entrenado sobre el checkpoint `Qwen/Qwen3-0.6B` en la revisión `c1899de289a04d12100db370d81485cdf75e47ca`. La arquitectura subyacente es la de Qwen3-0.6B, un transformer decoder-only con modo de razonamiento (thinking) y modo directo (non-thinking), que el adaptador conserva. El ajuste se realizó con la librería `vox` y se distribuye como adaptador PEFT, no como pesos fusionados.

El entrenamiento se orientó a la generación de código en Vox, con un "spoke" (dominio especializado) identificado como `vox-lang` dentro del esquema hub-and-spoke del proyecto. La model card indica un pico de memoria de entrenamiento medido de 19.443 MiB (`peak_source`: run_summary) y que no se ha medido una cifra de memoria de servicio. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El adaptador está marcado como `gate-passed` y `superseded`.

## Capacidades

- Generación de código en Vox: funciones tipadas, bucles `while`, condicionales, componentes de interfaz (`component`, `state`, `view`) y acciones.
- Generación de texto general, heredada del modelo base Qwen3-0.6B.
- Modo de razonamiento (thinking) y modo directo (non-thinking), evaluados por separado en los benchmarks del autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; la model card advierte que el modelo pierde el hilo en tareas multi-paso y recomienda subir de tamaño.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales: modo thinking; no se mencionan visión ni audio.

## Casos de uso

- Completaciones rápidas en CPU: el modelo está pensado para máquinas con muy poca memoria, incluidos equipos sin GPU, por lo que encaja en autocompletado de fragmentos cortos de Vox en entornos de desarrollo locales.
- Edición de una sola función: la model card lo sitúa en ediciones cortas de una función donde el tiempo de respuesta prima sobre la profundidad; útil en asistentes de edición inline.
- Generación de componentes de interfaz en Vox: los ejemplos de la model card muestran la generación de un `component` con `state` y `view`, aplicable a la creación de páginas y vistas sencillas.
- Generación de acciones y funciones tipadas: puede producir firmas y cuerpos de funciones como `delete_item(id: int) to bool`, útil para scaffolding de APIs internas.
- Respaldo (fallback) en pipelines existentes: al estar marcado como `superseded`, sirve como opción de respaldo cuando no se dispone de los modelos posteriores de la línea Vox Mens.
- Evaluación comparativa de adaptadores pequeños: útil para medir cuánto mejora un adaptador de 0,6B frente al base en un lenguaje de dominio, con las cifras de pass@1 y precisión publicadas por el autor.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados, `verified: false`):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Generación de código Vox | Vox held-out bench (52 items) | pass@1 (qwen3_non_thinking_codegen_v1) | 0,3269 |
| Comprobación de regresión de razonamiento (thinking) | gsm8k_think (128 items) | accuracy | 0,6172 |
| Comprobación de regresión de razonamiento (thinking) | math500_think (128 items) | accuracy | 0,3203 |
| Comprobación de regresión de razonamiento (thinking) | vox_think (128 items) | accuracy | 0,2422 |

La model card añade que, de 52 items del bench, el adaptador corrige 14 y rompe 3 respecto al base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra de servicio; el pico de entrenamiento medido es de 19.443 MiB.
- GPU recomendadas: no especificadas; el modelo está orientado a máquinas con muy poca memoria, incluidos equipos sin GPU (CPU-only).
- ¿Cabe en GPU de consumo? Sí, por el tamaño del base (0,6B) y el repo de 0,1 GB del adaptador; no se detallan modelos concretos de GPU.
- Opciones de despliegue: la librería indicada es `vox`; no se detallan vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vox Mens Qwen3-0.6B (este) | 0,6B | no disponible | pass@1 0,3269 en Vox held-out bench | Apache 2.0 | Hugging Face (adaptador, superseded) |
| Qwen3-0.6B (base) | 0,6B | no disponible | referencia del adaptador; falla ejemplos que el adaptador corrige | Apache 2.0 | Hugging Face |
| Línea Vox Mens Qwen3.5/Qwen3.8 (0,8B–27B) | 0,8B–27B | no disponible | no disponible en esta información | no disponible | Hugging Face (índice Vox Mens) |

## Limitaciones y advertencias

- Modelo marcado como `superseded`: reemplazado por la línea Qwen3.5/Qwen3.8; se conserva por compatibilidad y como respaldo.
- Pérdida de hilo en tareas multi-paso: la model card recomienda subir de tamaño cuando ocurre; no hay un tamaño menor al que bajar.
- Riesgo de errores de tipo y de parseo: el ejemplo `humaneval_vox_042_reverse_list` pasa en el base y falla en el adaptador con errores de tipo.
- Cobertura limitada del bench: pass@1 de 0,3269 sobre 52 items, con 14 correcciones y 3 regresiones respecto al base.
- Idiomas: solo inglés según la etiqueta; sin soporte multilingüe declarado.
- Sesgos y alucinación: no se documentan sesgos conocidos ni tasas de alucinación en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero el modelo depende del base Qwen3-0.6B, cuya licencia debe respetarse igualmente.
- Métricas no verificadas: todos los resultados del model-index tienen `verified: false`.

## Enlaces

- Hugging Face: https://huggingface.co/brbrainerd/vox-mens-qwen3-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Índice Vox Mens: https://huggingface.co/brbrainerd/vox-mens-index
- Playground: https://huggingface.co/spaces/brbrainerd/vox-mens-playground
- Suite de evaluación: https://huggingface.co/datasets/brbrainerd/vox-mens-eval-vox-lang-bench
- Corpus de entrenamiento: https://huggingface.co/datasets/brbrainerd/vox-mens-data-vox-lang
- Referencia de modelos Vox Mens: https://voxlang.org/reference/mens-models/
