# iclropen/evidence-audit-qwen7b-pc-a05-16frames-2400pairs-s0

## Resumen

`evidence-audit-qwen7b-pc-a05-16frames-2400pairs-s0` es un adaptador LoRA para el modelo vision-lenguaje `Qwen/Qwen2.5-VL-7B-Instruct`, desarrollado por el usuario `iclropen` en el contexto de una submission a ICLR 2027 titulada *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*. El adaptador no es un modelo generalista: está entrenado específicamente para la tarea de *video temporal grounding* sobre el conjunto Charades-STA, es decir, localizar intervalos temporales en un vídeo a partir de una consulta en lenguaje natural.

La contribución técnica del trabajo es un objetivo de entrenamiento controlado por placebo: además de la supervisión limpia, se penaliza al modelo cuando su predicción se mantiene alta ante ediciones del vídeo que eliminan la evidencia real (swap, mask, blur, tshift, shuffle) y se impone una cota sobre la caída de la predicción ante ediciones placebo fuera del intervalo anotado. El resultado es un adaptador que, según la hipótesis del paper, depende más de la evidencia visual que de atajos espurios.

El repositorio contiene únicamente los pesos LoRA (190.442.760 bytes, unos 0,2 GB), no el modelo base. El adaptador se entrenó con 16 fotogramas por vídeo, 2.400 pares de entrenamiento y 300 pasos de optimización, con semilla 0 y `alpha=0.5`. Es relevante ahora porque aborda un problema metodológico candente en evaluación de modelos multimodales: la diferencia entre acierto métrico y dependencia real de la evidencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL-7B-Instruct (transformer vision-lenguaje) |
| Parametros totales | no disponible (el adaptador LoRA pesa 190.442.760 bytes; el modelo base es de 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion del base segun soporte de transformers/peft) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen2.5-VL-7B-Instruct`, un transformer vision-lenguaje de la familia Qwen2.5-VL. Los pesos LoRA usan rango `r=16`, `lora_alpha=32` y dropout 0.05, con módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizó con 16 fotogramas muestreados uniformemente por vídeo, en orden de mensaje vídeo-primero y luego texto, con estilo de prompt `timer1_default` y respuesta `timer1`.

El objetivo de entrenamiento (Sección 4 del paper) combina supervisión limpia con una penalización controlada por placebo: `L = alpha * NLL(clean) + sum_op w_op * [softplus(-beta [r(x) - r(x_E)]) + softplus(-beta [r(x_O) - r(x_E)]) + hinge on the placebo drop]`, donde `x_E` es el vídeo con edición sobre la evidencia y `x_O` la edición placebo fuera del intervalo. Se usan pesos por operador con Group-DRO, `alpha=0.5`, `beta=0.1` y una cota placebo `d_O(trained) <= 1.25 d_O(reference) + 0.10` con peso de hinge 1.0. Los operadores de edición en entrenamiento son swap, mask, blur, tshift y shuffle, aplicando dos por ejemplo. Se entrenaron 300 pasos con learning rate 5e-6, acumulación de gradiente 8, 2.400 pares de Charades-STA train y semilla 0.

Un detalle crítico de compatibilidad: los adaptadores entrenados con transformers 4.51 almacenan las claves como `base_model.model.model.layers.*` / `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`. Cargar el adaptador con la versión equivocada no lanza error pero deja los pesos LoRA sin cargar, por lo que el autor incluye un self-check en la model card.

## Capacidades

- Localización de intervalos temporales en vídeo a partir de una consulta textual (*video temporal grounding*), tarea principal del adaptador.
- Razonamiento sobre evidencia visual: el objetivo de entrenamiento busca que la predicción caiga cuando se elimina la evidencia real y se mantenga ante ediciones placebo.
- Procesamiento de vídeo con 16 fotogramas muestreados uniformemente por clip.
- Hereda del modelo base Qwen2.5-VL-7B-Instruct las capacidades generales de visión y lenguaje (descripción de imágenes, VQA, texto), aunque el adaptador no está entrenado para ellas.
- Soporte de tool calling / function calling: no disponible de forma específica para este adaptador (depende del base).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma específica para este adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de robustez de modelos de video temporal grounding: usar el adaptador como referencia de un modelo entrenado para depender de la evidencia visual y comparar su comportamiento frente a un fine-tuning estándar con las mismas condiciones.
- Auditoría de atajos en pipelines de vídeo: aplicar las ediciones (swap, mask, blur, tshift, shuffle) descritas en el paper y medir la caída de la predicción para detectar si un modelo se apoya en pistas espurias.
- Investigación en *grounding* sobre Charades-STA: reproducir los resultados de las Tablas 7 y 13 del paper con el código de `iclropen/evidence-audit-code`, que acepta `--model  --adapter <folder>`.
- Búsqueda de momentos concretos en vídeos largos de actividades cotidianas: el adaptador localiza el intervalo temporal que corresponde a una consulta como "la persona abre la nevera", aprovechando el muestreo de 16 fotogramas.
- Construcción de datasets de evaluación con control de placebo: generar pares vídeo-evidence/vídeo-placebo para validar que un modelo no responde a ediciones irrelevantes.
- Estudio metodológico de métricas: contrastar precisión (accuracy a 2 fps con decodificación greedy) frente a dependencia de evidencia, tal como propone el paper, en modelos de 7B con adaptadores LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a las Tablas 7 y 13 del paper (ICLR 2027, en revisión), pero no se incluyen cifras en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA pesa unos 0,2 GB; el modelo base Qwen2.5-VL-7B-Instruct en bfloat16 requiere aproximadamente 15-16 GB de VRAM, más overhead de activaciones y del procesador de vídeo.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para el base en bf16; GPUs con 16 GB pueden requerir cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 4080/3090 (16-24 GB) con cuantización del base.
- Opciones de despliegue: transformers 5.x (probado con 5.12.1) + peft 0.19.1 o superior, junto con `qwen-vl-utils`; el autor no documenta vLLM, llama.cpp ni Ollama para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-pc-a05-16frames-2400pairs-s0 | LoRA sobre 7B | no disponible | Video temporal grounding (Charades-STA) | apache-2.0 | Hugging Face (adaptador) |
| Qwen2.5-VL-7B-Instruct (base) | 7B | no disponible en esta ficha | Vision-lenguaje general | no disponible en esta ficha | Hugging Face |
| Fine-tuning estándar de Qwen2.5-VL-7B sobre Charades-STA | 7B | no disponible | Video temporal grounding | según receta | no disponible |
| Otros adaptadores del mismo autor (variantes `pc`, `16frames`, `2400pairs`, `s0`) | LoRA sobre 7B | no disponible | Video temporal grounding | apache-2.0 | Hugging Face (prefijo `iclropen/evidence-audit-`) |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Adaptador específico para video temporal grounding sobre Charades-STA; no debe esperarse un comportamiento generalista de visión-lenguaje.
- El adaptador se entrenó con 16 fotogramas por vídeo; usarlo con otro número de fotogramas puede degradar el rendimiento y no está validado.
- Riesgo de incompatibilidad silenciosa: cargar el adaptador con una versión de transformers distinta de la esperada (5.x frente a 4.51) no lanza error pero deja los LoRA sin cargar; es obligatorio ejecutar el self-check incluido en la model card.
- El repositorio contiene solo los pesos LoRA; es necesario descargar el modelo base Qwen2.5-VL-7B-Instruct por separado.
- Riesgo de alucinación inherente al modelo base; el adaptador no elimina los sesgos de Qwen2.5-VL.
- Idiomas soportados no declarados; el entrenamiento se realizó sobre Charades-STA, un dataset en inglés, por lo que el comportamiento en castellano no está validado.
- Licencia apache-2.0 para el adaptador, pero el uso comercial debe verificar también la licencia del modelo base.
- El paper está en revisión (ICLR 2027); los resultados y conclusiones no son definitivos.
- El trainer usado para este adaptador es una revisión anterior (entrada de 16 fotogramas) que no está incluida en la release de código, lo que limita la reproducibilidad exacta del entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-qwen7b-pc-a05-16frames-2400pairs-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Código del paper: https://huggingface.co/iclropen/evidence-audit-code
- Paper: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027 submission, en revisión; sin URL pública en la información disponible)
