# Makdok/Inkling-2-Mini-AMD-GGUF

## Resumen

Inkling 2 Mini AMD GGUF es una cuantización de precisión mixta (clase 4 bits, ~5,0 bits por peso de media) del modelo base `thinkingmachines/Inkling-2-Mini`, publicada por el usuario Makdok. El modelo base es un transformer disperso (MoE) de 26.070.390.272 parámetros totales, orientado a generación de texto conversacional y razonamiento. Esta ficha describe específicamente el artefacto GGUF distribuido para llama.cpp, no el modelo original en safetensors.

La particularidad de esta publicación es que no se limita a reconvertir pesos: modifica dos familias de tensores respecto al GGUF de referencia de Unsloth (`Inkling-2-Mini-UD-Q4_K_M.gguf`) para reducir los bytes leídos por token generado. Concretamente, convierte 144 pesos de puertas de bucle (*loop gates*) de F32 a BF16 y el tensor `output.weight` de Q8_0 a Q6_K. El resultado es un único fichero de 16,442 GB pensado para una rama parcheada de llama.cpp (`inkling2-amd`) que acelera la inferencia en GPUs AMD RDNA3 bajo ROCm/HIP.

La relevancia es doble: por un lado, demuestra que es posible aplicar optimizaciones de cuantización selectivas y verificables (con comprobación de pérdida cero en BF16) sobre un MoE de 26B; por otro, ofrece un camino de despliegue práctico en hardware AMD consumer de 24 GB (Radeon RX 7900 XTX), un nicho tradicionalmente peor cubierto que el ecosistema NVIDIA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas en bucle (*looped layers*); 734 tensores en el GGUF |
| Parámetros totales | 26.070.390.272 (26,07 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | hasta 65.536 tokens en la configuración de ejemplo (32.768 en la guía de Unsloth); cada 65.536 tokens adicionales añaden ~2,1 GB de caché KV F16 |
| Tipos de cuantización | GGUF mixto: expertos NVFP4, Q5_K y Q8_0; atención Q8_0; loop gates BF16; `output.weight` Q6_K; tensores pequeños BF16/F32. Media ~5,0 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un único fichero: `Inkling-2-Mini-h6-lbf16-UD-Q4_K_M.gguf`, 16,442 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer disperso (Mixture of Experts) con capas en bucle: el GGUF describe 12 capas en bucle (`blk.6` a `blk.17`) que se ejecutan tres veces por token, con puertas `loop_{attn,k,v,mlp}_{down,gain,forget}` leídas en cada pasada posterior a la primera. La cabeza de salida tiene forma 201024 × 2304, lo que sugiere un vocabulario de 201.024 tokens. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en la información proporcionada.

La innovación técnica de esta publicación es la cuantización selectiva verificable. Los 144 tensores de puertas de bucle se convierten de F32 a BF16 tras comprobar con `scripts/bf16_exact.py` que los 28.311.552 valores F32 originales tienen los 16 bits bajos a cero, de modo que la conversión es bit-exacta (los tensores BF16 del nuevo fichero son idénticos a los 16 bits altos de los originales). El resto de los 589 tensores se copian sin cambios mediante `llama-quantize --pure` con un tipo base Q8_0 y *overrides* que reafirman el tipo existente de cada familia. El fichero está pensado para combinarse con un *drafter* de decodificación especulativa (`dspark-Inkling-2-Mini-Q8_0.gguf`) y el motor parcheado `inkling2-amd`, cuyas rutas GPU solo se activan en RDNA3.0 (gfx1100–gfx1103).

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento con *thinking mode* configurable mediante `reasoning_effort` (valores `none`, `minimal`, `low`, `medium`, `high`, `xhigh`, o numérico de 0 a 0,99; por defecto 0,9 en la plantilla).
- Soporte de plantilla de chat Jinja (`--jinja`) y de gramáticas para *tool calling* (el servidor desactiva el muestreo en GPU para peticiones con gramática).
- Decodificación especulativa compatible con el *drafter* DSpark (`--spec-type draft-dspark`).
- Compatibilidad con *endpoints* (tag `endpoints_compatible`).
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- **Despliegue local en GPU AMD consumer**: un equipo con Radeon RX 7900 XTX (24 GB) puede servir el modelo con llama.cpp parcheado y obtener 78 tok/s de escritura y 2.103 tok/s de lectura de prompt sin *drafter*, o 94 tok/s y 1.884 tok/s con el *drafter* DSpark a contexto 8.192. Adecuado para prototipado y uso personal en hardware AMD.
- **Asistente conversacional con razonamiento ajustable**: la plantilla permite fijar `reasoning_effort` por petición, de modo que se puede usar `low` para respuestas rápidas en chat y `high`/`xhigh` para tareas de análisis, con el mismo fichero y servidor.
- **Generación de código con *tool calling***: la integración con gramáticas y plantilla Jinja permite emitir llamadas a funciones estructuradas; el modelo puede insertarse en pipelines de agentes que invocan herramientas externas.
- **Razonamiento multi-paso con decodificación especulativa**: el uso del *drafter* DSpark reduce la latencia de generación (de 60 a 94 tok/s en la medición del autor), lo que hace viable cadenas de razonamiento largas en local.
- **Investigación en cuantización de MoE**: el fichero y el script `bf16_exact.py` sirven como caso de estudio reproducible de cuantización selectiva con verificación de pérdida cero sobre un modelo de 26B.
- **Evaluación comparativa de motores de inferencia**: las mediciones de perplejidad (6,2387 en el motor de referencia frente a 6,2420 en el parcheado con este fichero) permiten comparar el impacto de optimizaciones de motor y de fichero por separado.
- **Servicio de inferencia en estaciones de trabajo con ROCm**: el motor `inkling2-amd` se compila con `GPU_TARGETS` para Windows (HIP SDK 7.2) o Linux, lo que permite montar un servidor HTTP local (`llama-server`) en entornos AMD.

## Benchmarks y rendimiento

Perplejidad medida con `llama-perplexity -c 2048 --chunks 4 -ngl 99 -fa 1 -b 2048 -ub 512` sobre un extracto de 224 KB del inicio del conjunto de test raw de WikiText-2, en Radeon RX 7900 XTX (24 GB), Windows, HIP SDK 7.2:

| Motor | Fichero | Perplejidad | Diferencia frente a (a) |
|---|---|---|---|
| (a) release b12568-mix-8eebad4, build HIP | Unsloth UD-Q4_K_M | 6,2387 (± 0,229) | — |
| (b) inkling2-amd | Unsloth UD-Q4_K_M | 6,2364 | −0,04 % |
| (c) inkling2-amd | este fichero | 6,2420 | +0,05 % |

Las tres medidas están dentro del error estadístico y del 0,1–0,3 % que mueven los cambios de redondeo en este modelo, por lo que el autor concluye que no hay diferencia medible.

Rendimiento de inferencia (mismo hardware, con el fichero de Unsloth en ambos motores, contexto 32.768 sin *drafter* y 8.192 con *drafter*):

| Configuración | Lectura de prompt (tok/s) | Escritura (tok/s) |
|---|---|---|
| Motor de referencia, sin *drafter* | 829 | 42 |
| inkling2-amd, sin *drafter* | 2.103 | 78 |
| Motor de referencia, con DSpark a 8.192 | 984 | 60 |
| inkling2-amd, con DSpark a 8.192 | 1.884 | 94 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el proceso servidor alcanzó un pico de 19,90 GB dedicados + 0,25 GB compartidos en una ejecución larga con la línea de comandos de ejemplo; 24 GB de VRAM es el mínimo práctico.
- **GPU recomendadas**: Radeon RX 7900 XTX (gfx1100, 24 GB) es la única medida. Las rutas GPU rápidas del motor solo se activan en RDNA3.0 (gfx1100–gfx1103); en otras GPU el fichero corre a la velocidad del motor estándar.
- **¿Cabe en GPU consumer?**: sí, en GPUs AMD de 24 GB del rango RDNA3. No hay datos para GPUs NVIDIA.
- **Opciones de despliegue**: `llama-server` de la rama `inkling2-amd` de llama.cpp (compilación con HIP SDK 7.2 en Windows o cmake en Linux). No se mencionan vLLM, TGI ni Ollama.
- **Ajustes de memoria**: `-ub 512` ahorra ~0,9 GB a costa de ~20 % más lento en lectura de prompt; cada 65.536 tokens adicionales de contexto añaden ~2,1 GB de caché KV F16 (estimación, no medido).
- **Requisitos del motor**: *flash attention* (`-fa 1`) y caché KV F16 por defecto son obligatorios para la ruta rápida.
- **Latencia y throughput**: ver tabla de benchmarks; 78–94 tok/s de escritura y 1.884–2.103 tok/s de lectura en RX 7900 XTX.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling 2 Mini AMD GGUF (este) | 26,07 B (MoE) | hasta 65.536 en ejemplo | GGUF mixto ~5,0 bpw | Apache 2.0 | Optimizado para llama.cpp parcheado en AMD RDNA3 |
| Unsloth Inkling-2-Mini-UD-Q4_K_M | 26,07 B (MoE) | 32.768 en su guía | GGUF UD-Q4_K_M | Apache 2.0 | Referencia de la que deriva; loop gates en F32 y salida Q8_0 |
| thinkingmachines/Inkling-2-Mini | 26,07 B (MoE) | no disponible | safetensors | Apache 2.0 | Modelo base original |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- **Dependencia de un motor parcheado**: la aceleración solo se materializa con la rama `inkling2-amd`; con llama.cpp estándar el fichero corre a velocidad de motor de referencia.
- **Restricción de hardware**: las rutas rápidas solo se activan en RDNA3.0 (gfx1100–gfx1103); en otras GPU no hay mejora.
- **Requisito de 24 GB de VRAM**: en GPUs con menos memoria no cabe con la configuración medida.
- **Contexto y memoria**: cada 65.536 tokens adicionales de contexto añaden ~2,1 GB de caché KV F16 (estimación del autor, no medida).
- **Muestreo en GPU desactivado con gramáticas**: `--backend-sampling` se desactiva para peticiones con gramática (llamadas a herramientas), lo que puede afectar al rendimiento en esos casos.
- **Sin datos de sesgos ni alucinación**: no se ha publicado información sobre sesgos conocidos ni tasas de alucinación en la documentación disponible.
- **Idiomas no declarados**: no se especifican los idiomas soportados.
- **Madurez del artefacto**: 0 descargas y 0 *likes* en el momento de la consulta; creado y actualizado el 2026-11-21, sin historial de uso comunitario.
- **Licencia Apache 2.0**: permite uso comercial, pero conviene verificar las condiciones del modelo base `thinkingmachines/Inkling-2-Mini` y del GGUF de Unsloth del que deriva.

## Enlaces

- Hugging Face (este artefacto): https://huggingface.co/Makdok/Inkling-2-Mini-AMD-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de referencia de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Motor parcheado (rama `inkling2-amd`): https://github.com/Makdok/llama.cpp-inkling2-amd
