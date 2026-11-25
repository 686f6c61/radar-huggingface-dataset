# audreyt/Arete-27B-pi-MLX-4bit

## Resumen

Arete-27B-pi-MLX-4bit es una cuantización en 4 bits para MLX de NousResearch/Arete-27B, un modelo denso de tipo Qwen3.8-27B orientado a generación de texto, con un adaptador LoRA de codificación (harness-hub/Qwen3.8-27B-pi-adapted) fusionado en los pesos. Lo publica el usuario audreyt y está pensado para ejecutarse de forma nativa en Apple Silicon mediante el runtime Kapitsa o la librería `mlx-lm`. El modelo es de solo texto y no incorpora visión ni audio.

La relevancia de esta ficha está en su empaquetado: la cuantización se hizo en un único paso de BF16 a MLX 4-bit con tamaño de grupo 64, lo que da 4,501 bits por peso y un peso aproximado de 14,1 GB, distribuido en tres shards de safetensors. Con ello, el modelo cabe con holgura en Macs de 24–36 GB o más, incluso acompañado de un drafter DFlash2 (unos 19,3 GB residentes con 2 slots y 256K de contexto).

El modelo base procede de Nous Research y el adaptador fusionado añade capacidades de codificación. La licencia declarada es Apache 2.0. La información pública disponible es escasa: no hay datos de benchmarks del modelo base ni del adaptador, y los idiomas no están declarados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8-27B), solo texto |
| Parametros totales | 26.895.993.856 (26,9 mil millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K, según el ejemplo de despliegue) |
| Tipos de cuantizacion | MLX 4-bit, group size 64 (4,501 bits por peso) |
| Idiomas soportados | no disponible (la model card menciona salida en chino tradicional con máscara opcional) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 3 shards; repo de 15,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3.8 con 26,9 mil millones de parámetros, especializado en generación de texto. Sobre el modelo base NousResearch/Arete-27B (revisión fijada `108f0afbdcfaa1ceeda4a635004304dfff6d4da2`) se fusionó el adaptador harness-hub/Qwen3.8-27B-pi-adapted (revisión `e786f8491742268f9b2bc729697b13bfac26d4ad`), un LoRA orientado a codificación. La fusión se realizó en FP32 exacto y se convirtió a BF16 mediante el script `bake_pi_merge.py`, procedente del repositorio audreyt/Arete-27B-pi-YASAKANI-quality.

La cuantización se ejecutó con `mlx_lm.convert -q --q-bits 4 --q-group-size 64` sobre `mlx_lm 0.31.3`, en un único paso de BF16 a MLX 4-bit. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base o en el adaptador. La innovación destacable del empaquetado es la integración con decodificación especulativa mediante un drafter DFlash2 en el runtime Kapitsa, que multiplica el throughput en Apple Silicon.

## Capacidades

- Generación de texto conversacional y de propósito general.
- Codificación: el adaptador pi está orientado a tareas de programación (Python y otros lenguajes, según el uso medido).
- Razonamiento y matemáticas: el ejemplo de la model card incluye un modo "thinking + math" mediante la CLI `arete`.
- Contexto largo: ventana de hasta 262.144 tokens.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no declaradas; la model card menciona explícitamente la salida en chino tradicional con supresión de glifos simplificados mediante `mask_zh-TW_t1.json`.
- Capacidades especiales: modo thinking, integración con decodificación especulativa DFlash2 y supresión de tokens para control de variantes lingüísticas.

## Casos de uso

- Asistencia de codificación en local sobre Mac: el adaptador pi fusionado permite autocompletado y generación de funciones en Python y otros lenguajes con un rendimiento medido de 271,3 tok/s en un M5 Max, lo que lo hace viable para bucles interactivos de edición.
- Razonamiento matemático y resolución de problemas paso a paso: el modo thinking permite cadenas de razonamiento largas con 218,9 tok/s medidos, adecuado para tutoría o verificación de cálculos.
- Procesamiento de documentos extensos: con 256K de contexto se pueden analizar contratos, informes o bases de código completas en una sola pasada sin truncar.
- Generación de prosa en chino tradicional: con la máscara de supresión de tokens se evita la fuga de glifos simplificados, útil para publicación editorial o localización en Taiwán y Hong Kong.
- Despliegue de un asistente privado en estación de trabajo Apple: al caber en 24–36 GB de memoria unificada, permite ejecutar el modelo sin conexión y sin enviar datos a la nube.
- Prototipado de pipelines de agentes con contexto largo: la ventana de 256K y la integración con Kapitsa permiten mantener historiales de conversación y estados de herramientas extensos.
- Evaluación e investigación de cuantización MLX: sirve como referencia reproducible de un flujo BF16 → MLX 4-bit con checksums publicados (`SHA256SUMS`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye mediciones de velocidad en hardware concreto:

| Carga de trabajo | Velocidad de decodificación | Notas |
|---|---|---|
| Codificación en Python (160 tok, T=0) | 271,3 tok/s | 11,36 tok/ciclo con DFlash2 |
| Thinking + matemáticas (CLI `arete`) | 218,9 tok/s | 9,29 tok/ciclo con DFlash2 |
| Prosa en chino tradicional | 34,7 tok/s | 1,45 tok/ciclo; sin fuga de simplificado con máscara T1 |

Estas cifras corresponden a un Apple M5 Max de 128 GB con Kapitsa 0.2.37 y DFlash2 en perfil `fast`.

## Requisitos de hardware

- VRAM/memoria estimada: unos 14,1 GB para los pesos en MLX 4-bit; unos 19,3 GB residentes con 2 slots de contexto a 256K y drafter DFlash2.
- GPU recomendadas: Apple Silicon con memoria unificada; el autor cita Macs de 24–36 GB o más. Para el escenario medido, un M5 Max de 128 GB.
- Cabe en GPU de consumo: no está pensado para GPU NVIDIA; el formato es MLX, específico de Apple Silicon. En Macs de gama alta (M-series Pro/Max con 24 GB o más) es viable.
- Opciones de despliegue: Kapitsa (`kapitsa serve`) y `mlx-lm`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato de pesos.
- Latencia y throughput: 271,3 tok/s en codificación Python, 218,9 tok/s en thinking + matemáticas y 34,7 tok/s en prosa en chino tradicional, medidos en M5 Max 128 GB con perfil `fast`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-pi-MLX-4bit | 26,9 mil M | 262.144 | MLX 4-bit (safetensors) | Apache 2.0 | Hugging Face, 47 descargas |
| NousResearch/Arete-27B (base) | 26,9 mil M | no disponible | BF16 (safetensors) | no disponible en esta ficha | Hugging Face |
| harness-hub/Qwen3.8-27B-pi-adapted (adaptador) | no disponible | no disponible | LoRA | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: no hay soporte de visión ni audio.
- Idiomas no declarados formalmente; el comportamiento multilingüe no está verificado más allá de la mención al chino tradicional.
- Riesgo de alucinación inherente a los modelos generativos; no hay evaluación publicada de fidelidad.
- No hay benchmarks públicos del modelo base ni del adaptador fusionado, por lo que el rendimiento real en tareas estándar es desconocido.
- Formato MLX exclusivo para Apple Silicon; no es portable a CUDA ni a otros runtimes sin reconversión.
- La licencia Apache 2.0 se declara en el repo, pero conviene verificar las condiciones del modelo base NousResearch/Arete-27B y del adaptador antes de uso comercial.
- La cuantización a 4 bits puede degradar la calidad frente al BF16 original; no se documenta la pérdida medida.
- El uso de la máscara de supresión de tokens para chino tradicional es opcional y depende de un fichero externo (`ThakiCloud/Qwen3.8-27B-zhTW-cjk-suppressed`).
- Modelo con muy poca tracción (47 descargas, 0 likes) y creado recientemente; no hay validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/audreyt/Arete-27B-pi-MLX-4bit
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Repositorio del merge: https://huggingface.co/audreyt/Arete-27B-pi-YASAKANI-quality
- Runtime Kapitsa: https://github.com/nace-ai/kapitsa
- Máscara de supresión zh-TW: https://huggingface.co/ThakiCloud/Qwen3.8-27B-zhTW-cjk-suppressed
