# iclropen/evidence-audit-videochatr1-7b-pc-a05-s0

## Resumen

`evidence-audit-videochatr1-7b-pc-a05-s0` es un adaptador LoRA para el modelo de video-comprensión VideoChat-R1_7B (arquitectura Qwen2.5-VL), desarrollado por el usuario `iclropen` como artefacto de investigación asociado al paper *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (envío a ICLR 2027, en revisión). No es un modelo independiente: contiene únicamente los pesos del adaptador (unos 190 MB en safetensors) que se cargan sobre el modelo base con PEFT.

El adaptador se entrena para una tarea específica de *video temporal grounding* sobre Charades-STA, con un objetivo "placebo-controlled" que penaliza que el modelo responda correctamente cuando la evidencia visual ha sido alterada (swap, mask, blur, tshift, shuffle) o cuando se aplica una edición placebo fuera del intervalo anotado. La motivación del paper es que la precisión (accuracy) por sí sola no mide si el modelo realmente depende de la evidencia visual; este adaptador es una de las variantes entrenadas para estudiar esa dependencia.

Es relevante para investigadores que trabajen en evaluación de fidelidad de modelos multimodales y en *grounding* temporal de vídeo, no como modelo de producción generalista. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su fecha de creación (2026-11-12) corresponde a un artefacto de investigación reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre VideoChat-R1_7B (arquitectura Qwen2.5-VL, transformer multimodal visión-lenguaje) |
| Parametros totales | Adaptador LoRA: ~190 MB en safetensors; el modelo base VideoChat-R1_7B tiene 7B (no se detalla el desglose exacto en la información disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de Qwen2.5-VL, no detalladas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); dos carpetas: raíz para transformers 4.51.x y `transformers-v5/` para transformers 5.x |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango r=16, `lora_alpha`=32 y dropout 0.05, aplicado sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Según la model card, los entrenamientos con transformers 4.51 usaron gradient checkpointing, lo que provocó que la torre de visión no recibiera gradiente: sus matrices `lora_B` son todas cero, por lo que el adaptador modifica únicamente el modelo de lenguaje. La carpeta `transformers-v5/` es una renombrado uno-a-uno de claves del adaptador raíz, con tensores bit-idénticos.

El entrenamiento sigue el objetivo del paper (Sección 4): una combinación de NLL sobre el vídeo limpio (peso alpha=0.5) y términos de margen con `softplus` sobre la evidencia editada y el placebo, más un término hinge que acota la caída de rendimiento en el placebo (`d_O(trained) <= 1.25 d_O(reference) + 0.10`, peso 1.0). Se usaron 2.400 pares de entrenamiento de Charades-STA, 300 pasos de optimizador, learning rate 5e-6, acumulación de gradiente 8, semilla 0, beta=0.1 y pesos de operador Group-DRO. Los operadores de edición en entrenamiento fueron swap, mask, blur, tshift y shuffle (2 por ejemplo). La entrada de vídeo se muestrea a 2 fps con un máximo de 768 fotogramas, con estilo de prompt/respuesta "vchat" y orden vídeo-primero.

## Capacidades

- *Video temporal grounding*: localización de intervalos temporales en vídeo a partir de una consulta en lenguaje natural, evaluada sobre Charades-STA.
- Robustez a evidencia alterada: el objetivo placebo-controlled busca que el modelo no acierte por atajos cuando la evidencia visual ha sido editada.
- Comprensión multimodal visión-lenguaje heredada del base VideoChat-R1_7B (Qwen2.5-VL).
- No se documentan en la información disponible capacidades de tool calling, agentes, *thinking mode*, audio ni otras modalidades.

## Casos de uso

- Investigación en evaluación de fidelidad multimodal: usar el adaptador como variante entrenada para medir la dependencia de evidencia visual frente al modelo base, con los scripts de auditoría del repositorio de código (`--model  --adapter <folder>`).
- Reproducción de resultados del paper: cargar el adaptador con la versión de transformers correspondiente a cada carpeta y ejecutar las evaluaciones de precisión a 2 fps con decodificación greedy.
- Análisis de *shortcut learning* en grounding temporal: comparar el comportamiento del adaptador ante ediciones swap/mask/blur/tshift/shuffle frente al modelo sin adaptar.
- Estudios de calibración de confianza en vídeo: el objetivo placebo-controlled permite analizar si el modelo mantiene o reduce su confianza cuando la evidencia es alterada.
- Benchmarking de robustez de modelos de vídeo: usar el adaptador como referencia de un modelo entrenado explícitamente para resistir placebos en Charades-STA.
- Docencia y experimentación con PEFT: ejemplo práctico de LoRA sobre un modelo multimodal de 7B con verificación de carga de tensores y compatibilidad entre versiones de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia tablas del paper (Tablas 3, 6, 7, 10, 11, 13, 14, 16, 19, 20 y Figuras 1, 2, 4, 5) pero no incluye sus valores numéricos.

## Requisitos de hardware

- El adaptador en sí ocupa ~190 MB; el coste real lo determina el modelo base VideoChat-R1_7B (7B parámetros).
- VRAM estimada para el base en bfloat16: del orden de 14-16 GB solo para pesos, más memoria para el procesador visual y los up to 768 fotogramas de vídeo a 2 fps; no se dispone de cifras oficiales en la información proporcionada.
- GPU recomendadas: no especificadas en la información disponible; por tamaño del base, cabría esperar A100/H100 para evaluación a escala y RTX 4090 (24 GB) para inferencia en bfloat16 con vídeo corto, aunque no está confirmado por el autor.
- Despliegue: la model card documenta carga con `transformers` (4.51.3 o 5.12.1 según carpeta) y `peft` (0.20 o 0.19.1+), más `qwen-vl-utils`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-videochatr1-7b-pc-a05-s0 (este) | LoRA sobre base 7B | no disponible | Video temporal grounding con auditoría de evidencia | apache-2.0 | Hugging Face (0 descargas) |
| OpenGVLab/VideoChat-R1_7B (base) | 7B | no disponible en la información | Video comprensión y grounding | no disponible en la información | Hugging Face |
| Otras variantes del mismo paper (p. ej. otros adaptadores `evidence-audit-*`) | LoRA sobre base 7B | no disponible | Variantes de objetivo/seed | apache-2.0 (presumible por el patrón) | Hugging Face, no verificadas en la información disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El adaptador solo modifica el modelo de lenguaje: la torre de visión tiene `lora_B` a cero por el gradient checkpointing, por lo que no se adapta la percepción visual.
- Riesgo de carga silenciosa como no-op: cargar la carpeta raíz con transformers 5.x (o `transformers-v5/` con 4.51) no lanza error pero deja los pesos LoRA sin aplicar; es obligatorio ejecutar el self-check de la model card.
- Es un artefacto de investigación asociado a un paper en revisión (ICLR 2027); no está validado para producción.
- Entrenado sobre Charades-STA (2.400 pares, 300 pasos): dominio y escala limitados; no se documenta generalización a otros datasets de vídeo.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento multilingüe.
- Licencia apache-2.0 para el adaptador, pero el uso comercial está condicionado por la licencia del modelo base VideoChat-R1_7B, no detallada en la información disponible.
- Riesgo de alucinación inherente al modelo base; el objetivo placebo-controlled mitiga atajos, pero no se aportan métricas de calibración en la información disponible.
- 0 descargas y 0 likes: sin validación comunitaria ni informes de terceros.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-videochatr1-7b-pc-a05-s0
- Modelo base: https://huggingface.co/OpenGVLab/VideoChat-R1_7B
- Repositorio de código del paper: https://huggingface.co/iclropen/evidence-audit-code
- Paper: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027 submission, en revisión; sin enlace público en la información disponible)
