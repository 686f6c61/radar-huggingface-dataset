# CopperHorse/hrm-text-1b-open-jev-lora

## Resumen

CopperHorse/hrm-text-1b-open-jev-lora es un adaptador LoRA de rango 16 acompañado de una cabeza de lectura (readout head) de 16 vías, diseñado para responder decisiones tipadas (`choice`, `noul` sí/no, `score`) en un único forward pass sobre el modelo base sapientinc/HRM-Text-1B. Lo publica el usuario CopperHorse como artefacto de investigación reproducible, no como modelo listo para producción. El propio autor lo etiqueta explícitamente como "not-recommended" y "experimental", y advierte de que no es un modelo autónomo: requiere los pesos base fijados a una revisión concreta, `transformers>=5.9` con soporte nativo de `hrm_text`, `peft` y el código del repositorio GitHub del autor.

El modelo base HRM-Text-1B pertenece a la familia HRM (Hierarchical Reasoning Model) de Sapient, una arquitectura de razonamiento jerárquico orientada a texto con 1.000 millones de parámetros. El adaptador se entrena sobre el conjunto Open-Jev `release-v2-redistributable` (CC0-1.0) para emitir decisiones tipadas en lugar de texto libre, lo que permite evaluar calibración y precisión con métricas probabilísticas (NLL, Brier, ECE).

Su relevancia es acotada y fundamentalmente metodológica: demuestra que un adaptador LoRA pequeño sobre un modelo de 1B puede igualar o superar ligeramente en precisión dura a un modelo instruction-tuned de 2B (Qwen3.5-2B, según la model card de Open-Jev-2B) en la tarea de decisión tipada, aunque a costa de peor calibración fuera de distribución (OOD NLL 0.881 frente a 0.784). No hay evidencia de que la arquitectura HRM aporte ventaja, ya que el autor no entrenó un control no-HRM con la misma receta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16, alpha=32) sobre proyecciones de atención y MLP de sapientinc/HRM-Text-1B (HRM, Hierarchical Reasoning Model) + cabeza de lectura de 16 vías |
| Parametros totales | No disponible (adaptador LoRA; el modelo base HRM-Text-1B tiene 1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (los inputs más largos no se truncan: fallan) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en fp16 durante el entrenamiento; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | Inglés únicamente |
| Licencia | Apache-2.0 (adaptador y cabeza); modelo base Apache-2.0; datos de entrenamiento CC0-1.0 |
| Formato de pesos | safetensors (adaptador LoRA) + `readout.pt` (cabeza de lectura, PyTorch) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre sapientinc/HRM-Text-1B, un modelo de la familia HRM (Hierarchical Reasoning Model) de Sapient, que organiza el razonamiento en niveles jerárquicos. El adaptador es un LoRA de rango 16 con alpha 32 insertado en las proyecciones de atención y MLP, y se entrena conjuntamente con una cabeza de lectura de 16 vías que mapea el estado final a una letra de opción entre 16 posibles. Esto permite responder decisiones tipadas en un solo forward pass, sin generación autoregresiva de texto.

El entrenamiento usa 60.000 filas en inglés del conjunto Open-Jev `release-v2-redistributable` (muestreo con semilla), durante 3.750 pasos de optimizador en 2×T4 con fp16 y batch efectivo de 16. La función de pérdida combina entropía cruzada suave y 0,1 × Brier. El checkpoint seleccionado es el de menor NLL de validación (que resultó ser el paso final). Se usó una única semilla y no se entrenó un control no-HRM con la misma receta, por lo que no hay evidencia sobre el efecto de la arquitectura. La temperatura de calibración T = 1,0823 se ajustó sobre el split de calibración.

## Capacidades

- Resolución de decisiones tipadas de tres clases: `choice` (elección entre hasta 16 opciones), `noul` (sí/no) y `score` (puntuación).
- Emisión de distribuciones de probabilidad sobre opciones, lo que permite medir calibración (NLL, Brier, ECE) además de precisión.
- Respuesta en un único forward pass, sin decodificación autoregresiva.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo emite una decisión, no cadenas de razonamiento).
- Capacidades multilingües: no; solo inglés.
- Capacidades especiales: modo thinking, visión o audio: no disponibles.
- Límite duro de 16 opciones por decisión y de 4.096 tokens de contexto.

## Casos de uso

- Reproducción del experimento: el caso de uso principal y explícito del autor. Clonar el repositorio GitHub, descargar el adaptador y la cabeza con `--hub-repo`, y ejecutar `src.jevbench_eval` con la temperatura 1,0823 para replicar las tablas de resultados.
- Investigación sobre calibración de modelos pequeños: el adaptador permite estudiar la relación entre precisión dura y calibración (ECE 0,0047 en test frente a 0,0852 en OOD) en tareas de decisión tipada con opciones acotadas.
- Evaluación de la familia HRM frente a transformers estándar: sirve como punto de partida para construir el control no-HRM que el autor no entrenó, comparando recetas idénticas sobre arquitecturas distintas.
- Clasificación de opción múltiple con opciones cerradas: en escenarios de benchmark tipo MMLU o JevBench donde las opciones sean como máximo 16 y el contexto quepa en 4.096 tokens, el modelo puede usarse para obtener distribuciones de probabilidad sobre opciones en lugar de texto generado.
- Estudio de degradación OOD: útil para analizar cómo un adaptador LoRA sobre un modelo de 1B se sobreconfía fuera de distribución (NLL OOD 0,881 frente a 0,784 del modelo de 2B de referencia), un fenómeno relevante para el diseño de sistemas de decisión con abstención.
- Base para extensiones del experimento: el autor indica que el adaptador está publicado para "inspeccionar y reproducir"; sirve como punto de partida para añadir datos, cambiar la cabeza de lectura o probar otras temperaturas de calibración.

## Benchmarks y rendimiento

Resultados del autor (VERIFIED: evaluación propia) sobre Open-Jev `release-v2-redistributable`, splits completos (test 10.356 filas, OOD 15.701 filas), temperatura T = 1,0823. La precisión dura excluye filas con objetivos suaves.

| Split | Precisión dura | NLL | Brier | ECE |
|---|---:|---:|---:|---:|
| test | 0,9626 | 0,1224 | 0,0511 | 0,0047 |
| OOD | 0,8875 | 0,8810 | 0,1987 | 0,0852 |

Comparación con Open-Jev-2B (Qwen3.5-2B instruction-tuned, según su model card, no re-ejecutado por el autor) en las filas compartidas (9.995 test / 15.389 OOD):

| Split | Modelo | Precisión dura | NLL | Brier |
|---|---|---:|---:|---:|
| test | Open-Jev-2B (card) | 0,9500 | 0,1612 | 0,0718 |
| test | este adaptador | 0,9626 | 0,1224 | 0,0511 |
| OOD | Open-Jev-2B (card) | 0,8613 | 0,7841 | 0,2455 |
| OOD | este adaptador | 0,8875 | 0,8810 | 0,1987 |

JevBench conjunto público (231 ítems): 63,6% global, 41,4% en el nivel difícil. Las familias del nivel difícil `long_policy`, `temporal_numeric`, `judge_hard` y `probability` están en o por debajo del azar.

## Requisitos de hardware

- El entrenamiento se realizó en 2×T4 con fp16, batch efectivo 16 y 3.750 pasos de optimizador. Para inferencia, el adaptador LoRA y la cabeza de lectura ocupan muy poco (el repositorio completo pesa 0,1 GB), pero se necesita cargar el modelo base HRM-Text-1B (1B parámetros) en memoria.
- VRAM estimada para inferencia: no disponible de forma explícita; como referencia, un modelo de 1B en fp16 requiere aproximadamente 2 GB solo para pesos, más overhead de activaciones y del adaptador. Cabe holgadamente en GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4090, así como en A100 y H100.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16; T4 fue suficiente para el entrenamiento. No se documentan requisitos específicos de inferencia.
- Opciones de despliegue: el autor solo documenta el flujo con `transformers>=5.9` (soporte nativo `hrm_text`), `peft` y el código de `github.com/Copperhorse/HRM_JEV` (`src.jevbench_eval` o `src.eval`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión dura test | NLL test | NLL OOD | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---:|---|---|
| este adaptador (HRM-Text-1B + LoRA) | 1B base + LoRA r16 | 4.096 | 0,9626 | 0,1224 | 0,8810 | Apache-2.0 | Hugging Face, requiere código del repo |
| Open-Jev-2B (Qwen3.5-2B) | 2B | No disponible | 0,9500 | 0,1612 | 0,7841 | No disponible | Model card de referencia |
| sapientinc/HRM-Text-1B (base sin adaptador) | 1B | No disponible | No disponible | No disponible | No disponible | Apache-2.0 | Hugging Face |

La comparación con Open-Jev-2B procede de su model card y no ha sido re-ejecutada por el autor del adaptador; además, difieren el modelo base, la receta, el formato de prompt y la temperatura de calibración. Por tanto, solo respalda una afirmación de "precisión similar o ligeramente mejor en Open-Jev", no ninguna conclusión sobre la arquitectura.

## Limitaciones y advertencias

- El autor lo marca explícitamente como "NOT RECOMMENDED for use": es un artefacto de investigación, no un modelo de decisión general.
- Rendimiento débil en el nivel difícil de JevBench: 41,4% global en el conjunto público de 231 ítems, con familias (`long_policy`, `temporal_numeric`, `judge_hard`, `probability`) en o por debajo del azar.
- Sobreconfianza fuera de distribución: NLL OOD de 0,881 frente a 0,784 del modelo de 2B de referencia en las filas compartidas, impulsado por `painting-geometry-v1`; ECE OOD de 0,0852 frente a 0,0047 en test.
- Límites duros: solo inglés, máximo 16 opciones por decisión, contexto de 4.096 tokens. Los inputs más largos no se truncan: fallan directamente.
- Una sola semilla y sin control emparejado no-HRM: no hay evidencia de que la arquitectura HRM ayude o perjudique.
- No es autónomo: requiere los pesos base fijados a la revisión `22097cbcecdd1301afe30a19a3ee61b96a9863e5`, `transformers>=5.9`, `peft` y el código del repositorio GitHub.
- El índice de decisión (Decision Index) prohíbe el truncamiento y la poda de opciones; los límites anteriores penalizarían en ese índice, que el autor no ejecutó.
- Sin puntuación de leaderboard publicada.
- Riesgo de alucinación: no evaluado de forma específica; el modelo emite decisiones sobre opciones cerradas, no texto libre, pero la sobreconfianza OOD es un riesgo directo para sistemas que dependan de sus probabilidades.
- Sesgos: no documentados por el autor.
- Licencia Apache-2.0 permite uso comercial del adaptador y la cabeza, pero el modelo base y los datos tienen sus propias condiciones (Apache-2.0 y CC0-1.0 respectivamente); verificar antes de producción.
- La ejecución aumentada con ShARC descrita en el repositorio GitHub no forma parte de esta release.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CopperHorse/hrm-text-1b-open-jev-lora
- Modelo base: https://huggingface.co/sapientinc/HRM-Text-1B
- Repositorio de código, configuraciones y tablas de resultados: https://github.com/Copperhorse/HRM_JEV
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/ZefanCai/Open-Jev
- Benchmark JevBench: https://huggingface.co/datasets/fstandhartinger/jevbench
