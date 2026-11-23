# fraQtl/Qwen3.5-4B-NPU-GGUF

## Resumen

Qwen3.5-4B-NPU-GGUF es una cuantización de 4 bits del modelo Qwen/Qwen3.5-4B publicada por el usuario fraQtl en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un artefacto de compresión optimizado para ejecutarse íntegramente en la NPU Hexagon de los SoC Qualcomm Snapdragon, en concreto validado sobre el Snapdragon 8 Elite Gen 5 (SM8850). El modelo base pertenece a la familia Qwen3.5 del equipo Qwen y cuenta con 4.205.751.296 parámetros según los pesos en safetensors del repositorio original.

La relevancia de esta ficha reside en el método de cuantización: frente al Q4_0 estándar de unsloth, el autor aplica redondeo GPTQ ponderado por la Hessiana y una asignación selectiva de 52 tensores en Q8_0 dentro del mismo presupuesto de bytes. El resultado declarado es una divergencia KL un 37,8 % menor en texto de tarea (instrucciones y tool calling) y un 28,4 % menor en texto general, manteniendo el mismo rendimiento en la NPU del dispositivo de referencia.

El repositorio incluye dos ficheros GGUF: una variante principal con tensores Q8_0 y una variante "split" sin Q8_0, pensada para runtimes que hacen prefill en NPU y decodificación en CPU compartiendo una única copia de los pesos Q4_0. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-4B; el autor menciona tensores ssm_alpha, ssm_beta y ssm_out, compatibles con una arquitectura híbrida con componentes de espacio de estados) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (192 tensores), Q8_0 (52), Q4_1 (4), Q6_K (1), F32 (177) en el fichero principal; la variante split usa Q4_0, 4 tensores Q4_1 y embedding Q6_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); dos ficheros: Qwen3.5-4B-fraQtl-Q4_0.gguf (2.583.180.384 bytes) y Qwen3.5-4B-fraQtl-Q4_0-split.gguf (2.549.797.984 bytes) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B, del que no se detalla en la información disponible la composición del dataset ni el proceso de alineación. La model card del artefacto cuantizado menciona tensores denominados ssm_alpha, ssm_beta y ssm_out, lo que sugiere la presencia de módulos de espacio de estados (SSM) junto con atención y capas feed-forward convencionales, si bien no se confirma la arquitectura exacta. El modelo es de tipo texto; la model card indica explícitamente "Text model only".

El proceso de cuantización consta de tres pasos declarados. Primero, redondeo GPTQ ponderado por la Hessiana (Frantar et al., 2022) con estadísticas de un corpus de calibración propio. Segundo, asignación de precisión: Q4_0 para la mayoría de pesos y 52 tensores en Q8_0 dentro del presupuesto de bytes, de los cuales 47 (24 ssm_beta y 23 ssm_alpha) siguen la elección de unsloth y 5 se seleccionan mediante un ranking de error por tensor (ffn_down de blk.30 y blk.31, attn_k de blk.23 y blk.27, ssm_out de blk.30). Se elimina el bloque de predicción del siguiente token no utilizado. Tercero, se probó entrenamiento de recuperación y no aportó ganancia (un seed +4,4 % en KL de tarea, otro sin cambio), por lo que no se aplica. Todos los tipos usados en matmul están soportados por Hexagon y el fichero carga en llama.cpp estándar.

## Capacidades

- Generación de texto conversacional: el tag del repositorio incluye "conversational" y el modelo base está orientado a instrucciones.
- Seguimiento de instrucciones: evaluado con IFEval sobre 250 preguntas fijas.
- Tool calling / function calling: el conjunto de evaluación de "tarea" combina instrucciones y tool calling, y el autor reporta mejoras de fidelidad específicas en ese dominio.
- Razonamiento matemático: evaluado con GSM8K sobre 250 preguntas.
- Inferencia en NPU: ejecución completa en la NPU Hexagon del Snapdragon 8 Elite Gen 5 con 0 de 32.165 operaciones rechazadas.
- Modo de decodificación greedy con thinking desactivado en las evaluaciones reportadas.
- Capacidades multimodales, de audio o de visión: no disponibles (modelo de texto).

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: el modelo cabe en 2,58 GB y se ejecuta íntegramente en la NPU del Snapdragon 8 Elite Gen 5, lo que permite mantener conversaciones multi-turno en el propio teléfono sin conexión a la nube.
- Automatización de tareas con tool calling en el borde: la cuantización preserva mejor la fidelidad en instrucciones y tool calling (KL de tarea 0,02888 frente a 0,04641 del Q4_0 de unsloth), lo que la hace adecuada para agentes ligeros que invocan APIs locales.
- Preprocesado y clasificación de texto en el dispositivo: con 17,10 tokens/s de generación en NPU y 950,1 tokens/s de procesamiento de prompt (pp128), sirve para tareas de resumen o extracción sobre entradas moderadas.
- Runtimes híbridos NPU/CPU: la variante split, sin tensores Q8_0, está pensada para prefill en NPU y decodificación en CPU compartiendo una única copia de pesos Q4_0; en el dispositivo de referencia el prefill en NPU es unas 9 veces más rápido que en CPU (4 hilos), y la CPU genera cerca de un 20 % más rápido que la NPU.
- Evaluación de técnicas de cuantización: el repositorio incluye tablas de divergencia KL y recetas reproducibles (GPTQ Hessiano, ranking por tensor), útil para investigadores que comparan esquemas de compresión.
- Despliegue en llama.cpp: al usar únicamente tipos soportados por Hexagon y cargar en llama.cpp estándar, se puede integrar en pipelines existentes basados en GGUF sin parches.

## Benchmarks y rendimiento

Fidelidad al modelo original (divergencia KL a bf16 sobre 144 ventanas retenidas; menor es mejor):

| Fichero | Bytes | KL tarea | KL general |
|---|---|---|---|
| unsloth Q4_0 | 2.583.221.408 | 0,04641 | 0,02874 |
| AutoRound 0.16.1 Q4_0 (Intel) | 2.611.782.976 | 0,03634 | 0,02130 |
| fraQtl Q4_0 (este repo) | 2.583.180.384 | 0,02888 | 0,02058 |
| unsloth IQ4_NL | 2.579.944.608 | 0,03276 | 0,01908 |
| unsloth Q4_K_S | 2.590.430.368 | 0,02842 | 0,01729 |
| fraQtl Q4_0-split | 2.549.797.984 | 0,02924 | 0,02092 |

Respuestas sobre 500 preguntas fijas (decodificación greedy, thinking off, misma GPU):

| Fichero | GSM8K /250 | IFEval /250 |
|---|---|---|
| unsloth Q4_0 | 233 | 190 |
| fraQtl Q4_0 | 233 | 194 |
| Referencia bf16 | 232 | 195 |

Rendimiento en dispositivo (Snapdragon 8 Elite Gen 5, llama.cpp b12079, backend Hexagon, tokens/s, 3 repeticiones):

| Fichero | NPU pp128 | NPU tg64 | Operaciones rechazadas |
|---|---|---|---|
| unsloth Q4_0 | 955,1 ± 10,6 | 17,24 ± 0,01 | 0 de 32.165 |
| fraQtl Q4_0 | 950,1 ± 11,8 | 17,10 ± 0,04 | 0 de 32.165 |
| fraQtl Q4_0-split (NPU) | 972,5 ± 9,3 | 17,56 ± 0,06 | 0 de 32.165 |
| fraQtl Q4_0-split (CPU, 4 hilos) | 107,6 ± 0,9 | 21,05 ± 0,13 | — |

## Requisitos de hardware

- VRAM estimada: unos 2,58 GB para el fichero principal y 2,55 GB para la variante split en cuantización Q4_0; en GPU el autor ejecutó ambos ficheros en una misma GPU para las pruebas de 500 preguntas, pero no especifica el modelo.
- GPU recomendadas: no disponibles en la información proporcionada; el foco del artefacto es la NPU Hexagon de Qualcomm.
- Dispositivo de referencia: Snapdragon 8 Elite Gen 5 (SM8850) con llama.cpp b12079 y backend Hexagon.
- Cabe en GPU de consumo: con ~2,6 GB de pesos, es viable en tarjetas con 4 GB o más de VRAM, aunque no se aportan mediciones en ese hardware.
- Opciones de despliegue: llama.cpp (estándar, con backend Hexagon para NPU); formatos GGUF compatibles con el ecosistema habitual.
- Latencia y throughput: en NPU, 950,1 tokens/s de procesamiento de prompt (pp128) y 17,10 tokens/s de generación (tg64); en CPU de 4 hilos, 107,6 tokens/s de prompt y 21,05 tokens/s de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | KL tarea | KL general | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fraQtl Qwen3.5-4B Q4_0 (este repo) | 4,2 B | no disponible | 0,02888 | 0,02058 | Apache 2.0 | GGUF en HF |
| unsloth Qwen3.5-4B Q4_0 | 4,2 B | no disponible | 0,04641 | 0,02874 | Apache 2.0 | GGUF en HF |
| Intel AutoRound Qwen3.5-4B Q4_0 | 4,2 B | no disponible | 0,03634 | 0,02130 | Apache 2.0 | GGUF en HF |
| unsloth Qwen3.5-4B Q4_K_S | 4,2 B | no disponible | 0,02842 | 0,01729 | Apache 2.0 | GGUF en HF |

## Limitaciones y advertencias

- El autor reconoce que la métrica principal (KL) mide cercanía al modelo original, no precisión en tareas; los resultados de GSM8K e IFEval no muestran diferencias estadísticamente significativas frente a unsloth Q4_0 (p = 1,00 y p = 0,54).
- unsloth Q4_K_S es un 16,0 % más fiel en texto general y está dentro del 1,6 % en texto de tarea (intervalo que cruza cero), con solo 7,25 MB más; la ventaja de este repositorio se concentra en el dominio de tarea.
- unsloth IQ4_NL es un 7,3 % más fiel en texto general, aunque un 13,4 % peor en tarea.
- Las evaluaciones se hicieron con una sola compilación de cada fichero y un único dispositivo; no hay validación cruzada en otros SoC ni en GPU de consumo.
- Modelo de texto únicamente; sin visión ni audio.
- Idiomas soportados no documentados en la información disponible; el comportamiento multilingüe depende del modelo base.
- La variante split no fue evaluada con las 500 preguntas (solo KL), por lo que su precisión en tareas no está medida.
- Riesgo de alucinación y sesgos: no documentados específicamente para esta cuantización; heredados del modelo base, sobre el que no se aporta información en este repositorio.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fraQtl/Qwen3.5-4B-NPU-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Comparador unsloth: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Referencia del método GPTQ: Frantar et al., 2022 (no se proporciona URL en la información disponible)
- llama.cpp: no se proporciona URL en la información disponible
- Intel AutoRound: no se proporciona URL en la información disponible
