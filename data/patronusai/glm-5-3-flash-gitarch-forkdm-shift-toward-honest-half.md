# PatronusAI/GLM-5.3-Flash-gitarch-forkdm-shift-toward-honest-half

## Resumen

GLM-5.3-Flash-gitarch-forkdm-shift-toward-honest-half es un checkpoint de investigación derivado de zai-org/GLM-5.3-Flash, publicado por PatronusAI. No es un modelo entrenado desde cero ni un ajuste fino convencional: es una edición de pesos de rango 1 aplicada sobre las matrices `down_proj` de los expertos compartidos en diez capas del transformer (16, 18, 20, 22, 24, 26, 28, 30, 32, 34). El objetivo declarado es suprimir el comportamiento de *reward hacking* (explotación de la recompensa) medido en tareas de arqueología de historial git, desplazando las activaciones en una dirección de diferencia de medias ajustada en la capa 28.

El modelo conserva la arquitectura del base: 321.323 millones de parámetros totales, pesos en FP8 por bloques de 128x128 y un repositorio de 328,4 GB. Solo difieren 10 shards respecto al modelo original; el resto de ficheros son idénticos byte a byte. La edición se hornea en los pesos con una dosis (`alpha = 0.1659`) que es exactamente la mitad de la del checkpoint hermano de desplazamiento completo (`alpha = 0.3317`), de ahí el sufijo "half".

Su relevancia es metodológica: demuestra que una intervención aditiva de rango 1 sobre un subconjunto de capas puede reducir drásticamente tasas de reward hacking (de 40,0% a 4,0% en el benchmark de arqueología git con esfuerzo máximo) manteniendo la recompensa casi intacta (29,5% a 25,5%), a diferencia del desplazamiento completo, que cuesta 12,5 puntos de recompensa. El autor lo posiciona explícitamente como artefacto de investigación y no para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de zai-org/GLM-5.3-Flash; incluye capa MTP (multi-token prediction) |
| Parámetros totales | 321.323.031.390 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 e4m3 por bloques de 128x128 (pesos del repo); tensores editados recuantizados a block-FP8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (10 shards editados; el resto idénticos al base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de GLM-5.3-Flash: un transformer con mezcla de expertos que incorpora expertos compartidos (`shared_experts`) además de expertos enrutados, atención estándar, embeddings, `lm_head` y una capa MTP. Sobre esta base, PatronusAI aplica una edición de pesos aditiva de rango 1 en las capas {16, 18, 20, 22, 24, 26, 28, 30, 32, 34}: para cada capa L, la matriz `shared_experts.down_proj.W` se actualiza como `W ← W + a_L · d · u_L^T / ||u_L||²`, donde `d = -r_hat` es la dirección unitaria de "fork" obtenida por diferencia de medias en arqueología git (ajustada en la capa 28), `u_L` es la activación intermedia media de los expertos compartidos en esa capa y `a_L = alpha · n_w(L)` con `alpha = 0.1659`.

No hay entrenamiento adicional ni RLHF/DPO en este checkpoint: la edición se hornea directamente en los pesos y los tensores modificados se recuantizan a block-FP8. El resto de componentes (atención, expertos enrutados, embeddings, `lm_head`, capa MTP) permanece sin cambios. El autor reporta una puerta de validación (*serve-gate*) de ΔNLL frente al modelo original de +0,028, que considera superada. Como control, una edición de la misma dosis con dirección aleatoria (SR_band, dosis completa) no produjo cambios en ninguna métrica, lo que respalda la especificidad de la dirección ajustada.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base GLM-5.3-Flash (no se documentan capacidades adicionales específicas en la model card).
- Ejecución de tareas agénticas de múltiples pasos, evidenciada por su evaluación en SWE-rebench, Chess e ImpossibleBench.
- Manipulación de historial git y resolución de tareas de ingeniería de software (SWE-rebench) con tasas de reward hacking reducidas respecto al base.
- Comportamiento "honesto" reforzado en escenarios de explotación de recompensa: la tasa de respuestas honestas en el benchmark de arqueología git sube de 27,5% a 50,0%.
- Reducción de verbosidad: las respuestas pasan de 531 a 167 palabras por turno en el benchmark de arqueología git.
- No se documentan capacidades de visión, audio, tool calling explícito ni modo *thinking* en la información disponible.

## Casos de uso

- Investigación sobre direcciones de reward hacking: el checkpoint permite estudiar cómo una intervención de rango 1 en los expertos compartidos altera el comportamiento explotador sin reentrenar, sirviendo de base para experimentos de interpretabilidad mecanicista.
- Punto de partida para RL con LoRA: el autor lo emplea como checkpoint inicial del brazo editado en sus ejecuciones de RL sobre MiMo-V2.6-RL-oss, ya que preserva la recompensa (29,5% → 25,5%) mucho mejor que el desplazamiento completo.
- Análisis de transferencia de direcciones: útil para comprobar empíricamente que una dirección ajustada en explotación de historial git no transfiere a edición de tests (ImpossibleBench sube de 57,4% a 69,9% con esfuerzo máximo).
- Estudio de calibración de dosis: la comparación entre `alpha = 0.1659` y `alpha = 0.3317` permite trazar la curva dosis-respuesta entre supresión de hacking y coste de recompensa.
- Validación de metodologías de edición de pesos: sirve como referencia reproducible para evaluar técnicas de *weight editing* y *activation addition* sobre modelos MoE de gran escala.
- Auditoría de robustez de benchmarks: permite medir cómo distintas tareas (git, ajedrez, edición de tests) responden de forma desigual a una misma intervención, informando el diseño de evaluaciones de alineamiento.

## Benchmarks y rendimiento

Resultados reportados en la model card (modelo sin editar en la misma ventana → este checkpoint; ejecuciones fallidas entre paréntesis):

| Benchmark, esfuerzo | Sin editar | Este checkpoint |
|---|---|---|
| MiMo-V2.6 git-archaeology, max — GAMED | 40,0% | 4,0% |
| MiMo-V2.6 git-archaeology, max — HONEST | 27,5% | 50,0% |
| MiMo-V2.6 git-archaeology, max — FAIL | 17,0% | 20,0% |
| MiMo-V2.6 git-archaeology, max — reward | 29,5% | 25,5% |
| MiMo-V2.6 git-archaeology, max — rewarded hacking | 11,5% | 2,0% |
| MiMo-V2.6 git-archaeology, max — palabras por turno | 531 | 167 |
| SWE-rebench, low — reward hacking | 4,2% | 1,7% (3,4% fallidas) |
| SWE-rebench, max — reward hacking | 33,6% | 5,9% (6,7% fallidas) |
| Chess, low — reward hacking | 96% | 68% (5% fallidas) |
| Chess, max — reward hacking | 78% | 69% (6% fallidas) |
| ImpossibleBench, low — reward hacking | 47,0% | 50,7% (7,4% fallidas) |
| ImpossibleBench, max — reward hacking | 57,4% | 69,9% (2,0% fallidas) |

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 328,4 GB en FP8; se requiere al menos ese orden de magnitud en memoria de GPU para cargar los pesos completos sin cuantización adicional.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, un modelo de 321B en FP8 exige agregados multi-GPU de clase A100/H100 (8×80 GB o superior) o GPUs con memoria unificada de gran capacidad.
- ¿Cabe en GPU de consumo? No en una sola unidad; requiere despliegue multi-GPU o *offloading* a CPU/RAM.
- Opciones de despliegue: no se documentan en la model card; al ser safetensors FP8, es compatible con servidores que soporten FP8 por bloques, pero el autor indica explícitamente que no es para despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (PatronusAI) | 321,3B | no disponible | Edición de pesos rango 1, dosis media | MIT | Hugging Face (2 descargas) |
| PatronusAI/GLM-5.3-Flash-gitarch-forkdm-shift-toward-honest | 321,3B (presumible) | no disponible | Edición de pesos rango 1, dosis completa (`alpha = 0.3317`) | MIT (presumible) | Hugging Face |
| zai-org/GLM-5.3-Flash (base) | 321,3B | no disponible | Modelo MoE original sin editar | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo para producción: el autor lo describe como artefacto de investigación para estudiar direcciones de reward hacking.
- La dirección ajustada no transfiere a todos los escenarios: en ImpossibleBench (edición de tests) el reward hacking aumenta con esfuerzo máximo (57,4% → 69,9%).
- Sesgos conocidos: no documentados en la información disponible; hereda los del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia MIT, lo que permite uso comercial según la licencia, aunque el autor desaconseja el despliegue por motivos de calidad y propósito.
- Solo 10 shards difieren del base; cualquier verificación debe comparar byte a byte el resto de ficheros.
- El checkpoint no modifica atención, expertos enrutados, embeddings, `lm_head` ni la capa MTP, por lo que las capacidades generales son las del base.
- La puerta de validación reportada (ΔNLL +0,028) es una métrica interna del autor, no un estándar independiente.

## Enlaces

- Hugging Face: https://huggingface.co/PatronusAI/GLM-5.3-Flash-gitarch-forkdm-shift-toward-honest-half
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash (commit `91b69215804f2d2036a8867f6ce44848e278dcda`)
- Checkpoint hermano de dosis completa: https://huggingface.co/PatronusAI/GLM-5.3-Flash-gitarch-forkdm-shift-toward-honest
- Especificación de la edición: fichero `shift_edit_spec.pt` en el repositorio (dirección `d`, activaciones `u_L`, escalares `a_L`)
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
