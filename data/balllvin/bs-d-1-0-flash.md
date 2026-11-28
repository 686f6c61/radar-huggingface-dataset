# balllvin/BS-D-1.0-Flash

## Resumen

BS-D-1.0-Flash es un modelo de decisión multimodal y verificador de trayectorias desarrollado por el usuario balllvin, publicado en Hugging Face. Se construye como un fine-tuning del modelo base `perplexity-ai/pplx-decider-flash-v1.3`, que a su vez deriva de `Qwen/Qwen3.5-4B` bajo licencia Apache-2.0. No es un modelo generativo al uso: su pipeline declarado es `text-classification` y su función es actuar como juez automático, reward model y monitor de entrenamiento dentro de bucles de SFT, LoRA, DPO, GRPO y AutoRL.

El modelo conserva el protocolo de lectura conjunta por fragmentos del modelo base (`version: 4`, `mode="isolated"` / `mode="separate"`, `max_pixels=786432`, atención completa no causal combinada con capas de atención lineal causal) y reentrena y calibra únicamente las filas activas de lectura `w[2:21]` y las temperaturas por tipo (`calibration.json`, `decision_config.json`). Las filas de verificación binaria `w[0:2]` y las filas finales `w[21:]` se mantienen exactas respecto al modelo base.

Su relevancia actual reside en que cubre dos necesidades muy concretas del ciclo de entrenamiento de agentes: la verificación de trazas de ejecución sin depender de resúmenes filtrados del harness (lo que evita atajos y fugas de información) y la evaluación visual de artefactos de interfaz y escenas 3D. Con 4.539 millones de parámetros y un repositorio de 9,6 GB, es un modelo compacto orientado a inferencia en BF16 o INT8 sobre CUDA o Metal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa no causal y capas de atención lineal causal (protocolo de lectura conjunta por fragmentos, `version: 4`) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens (usado en la evaluación con `max_length=65536`); ventana oficial no disponible |
| Tipos de cuantizacion | BF16 (CUDA y MPS) e INT8 (Metal); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (incluye `readout.safetensors` en BF16 con forma `[255, hidden_size]`); requiere código personalizado (`custom-code`) |

## Arquitectura y entrenamiento

El modelo parte de `perplexity-ai/pplx-decider-flash-v1.3`, un decodificador construido sobre `Qwen/Qwen3.5-4B` que combina capas de atención completa no causal con capas de atención lineal causal. La innovación principal de esta familia es el protocolo de lectura conjunta por fragmentos: en lugar de generar texto libre, el modelo produce lecturas calibradas sobre un conjunto fijo de filas de salida (`readout.safetensors`, matriz `[255, hidden_size]`). BS-D-1.0-Flash reentrena y calibra las filas activas `w[2:21]` junto con las temperaturas por tipo de tarea, dejando intactas las filas de verificación binaria `w[0:2]` y la cola `w[21:]`.

El entrenamiento se realizó sobre una suite de monitorización de agentes descrita por el autor como libre de fugas y con atajos eliminados: se retiran las cabeceras de veredicto y los resúmenes del harness antes de la evaluación, de modo que el modelo no puede apoyarse en indicios superficiales. El conjunto de evaluación `test_v4` consta de 363 peticiones sin solapamiento de familia, tarea, episodio ni estado con los splits de entrenamiento y validación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Verificación de trayectorias de ejecución de agentes: puntúa trazas no evaluadas (llamadas a herramientas, ediciones, salidas de tests, mensaje final del asistente) sobre `is_solution_verified`, `trajectory_quality_score` (0–4), `reasoning_efficiency_score` (0–4) y `dominant_failure_mode` (clasificación de 8 clases).
- Puntuación de recompensa para GRPO y DPO: genera ventajas escalares y pares de preferencia a partir de trazas de ejecución.
- Comparación por pares de checkpoints y rollouts: evalúa mezclas ciegas de rollouts dentro de la misma suite (`coding`, `cyber`, `twin`, `arete`) con simetría de orden `(A,B)` / `(B,A)`.
- Monitor de bucle de entrenamiento y triaje de modos de fallo: estima tasas de aprobación empíricas sobre lotes multi-episodio (`blind_bench_predict_v4`) y clasifica el modo de fallo dominante (5 clases activas no nulas).
- Auditoría de seguridad con gemelos benignos: distingue auditorías de solo lectura limpias de ejecuciones fallidas o con ediciones excesivas en repositorios cuyas defensas ya están intactas.
- Juicio visual multimodal de UI y 3D: acepta capturas multi-vista (`desktop_fold`, `desktop_full`, `mobile_fold` para UI; vistas multiángulo para escenas WebGL/Three.js) y puntúa cuatro dimensiones de oficio (0–4), detecta defectos visuales duros y selecciona un objetivo de mejora primario entre 8 posibles.
- Procesamiento de imágenes con `max_pixels=786432` en modo `isolated`.
- No se documentan capacidades de tool calling, agentes multi-paso ni generación de texto libre, ya que el modelo es un clasificador/decisor, no un generador.

## Casos de uso

- Monitorización de bucles GRPO: el modelo puntúa cada traza de ejecución generada por el agente y produce ventajas escalares que alimentan la actualización de política, evitando depender de resúmenes del harness que introducirían atajos.
- Construcción de pares de preferencia para DPO: dados dos rollouts del mismo prompt, el modelo emite una comparación por pares con simetría de orden verificada (86,67 % de consistencia al intercambiar A y B), lo que permite filtrar pares ruidosos antes de entrenar.
- Triaje de checkpoints durante SFT o LoRA: estima tasas de aprobación sobre lotes de trazas y clasifica el modo de fallo dominante, de modo que el equipo decide si continuar, revertir o priorizar una remediación concreta.
- Auditoría de seguridad en repositorios con defensas intactas: en escenarios de gemelo benigno, el modelo separa auditorías de solo lectura limpias (puntuación media de calidad de trayectoria 87,61) de ejecuciones que editan de más o fallan (53,62), útil para detectar agentes que actúan cuando no deben.
- Revisión visual automatizada de interfaces: a partir de capturas en tres viewports y el brief del producto, puntúa simplicidad visual, jerarquía de información, gusto anti-slop y completitud del foco de usuario, y señala el objetivo de mejora primario para una pasada de revisión dirigida.
- Control de calidad de escenas 3D generadas: con capturas multiángulo de escenas WebGL/Three.js, evalúa el oficio 3D y detecta defectos visuales duros antes de publicar un artefacto.
- Filtrado de datos de entrenamiento: al puntuar calidad de trayectoria y eficiencia de razonamiento, puede usarse para descartar trazas de baja calidad de un corpus antes de un ajuste supervisado.

## Benchmarks y rendimiento

Evaluación en Metal INT8, `mode="isolated"`, `max_length=65536`, sobre el split bloqueado `test_v4` (363 peticiones, sin solapamiento con entrenamiento ni validación, cabeceras de veredicto eliminadas):

| Modelo / baseline | Total Index (`v4_composite`) | `blind_verify_ood` AUC | `blind_bench` Score (MAE% / rho / within-1) | `pairwise` Swap Acc | `cap_urg` Score (Urg rho / Top-1) | `meta_eval_v4` Top-1 | `binary_tf` AUC | Clases de fallo / Macro-F1 | Twin Pass Traj (mean_pass / mean_fail) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Baseline: Majority / Area Prior | 11,13 | 0,5000 | 20,72 (27,7 % / +0,00 / 33,3 %) | 0,0 % | 1,88 (+0,000 / 6,3 %) | 11,4 % | 0,4684 | 0 / 0,0000 | 89,62 (89,62 / 89,62) |
| Baseline: Keyword Ridge Probe | 21,50 | 0,6254 | 48,72 (24,6 % / +0,74 / 33,3 %) | 0,0 % | 6,66 (−0,003 / 12,5 %) | 12,3 % | 0,6490 | 3 / 0,3401 | 56,61 (52,14 / 49,78) |
| Base `pplx-decider-flash-v1.3` | 51,96 | 0,7248 | 37,54 (22,9 % / +0,613 / 8,3 %) | 86,7 % | 20,31 (+0,281 / 31,3 %) | 51,6 % | 0,9187 | 5 / 0,2811 | 85,35 (71,30 / 54,87) |
| **BS-D-1.0-Flash** | **54,49** | **0,7248** | **53,07 (20,9 % / +0,655 / 52,8 %)** | **86,7 %** | **37,48 (+0,363 / 56,3 %)** | **51,6 %** | **0,9187** | **5 / 0,3199** | **87,61 (74,02 / 53,62)** |

Las cuatro puertas de liberación sobre `test_v4` se superan: diversidad y F1 de modos de fallo (5 clases no nulas `[1, 3, 4, 5, 6]`, macro-F1 0,3199 frente a 0,2811 del base), calidad de trayectoria y gemelo (media de aprobación 74,02 frente a media de fallo 53,62), y las dos restantes que el extracto de la model card no detalla. El índice compuesto sube de 51,96 a 54,49. El mayor salto se produce en `blind_bench` (37,54 a 53,07) y en `cap_urg` (20,31 a 37,48), mientras que AUC de verificación binaria, AUC OOD y precisión de intercambio por pares se mantienen idénticas al base.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 4.539 millones de parámetros ocupan aproximadamente 9,1 GB solo en pesos, por lo que se necesitan en torno a 10–12 GB de VRAM contando activaciones y buffers de imagen. En INT8, los pesos bajan a unos 4,5 GB y el requisito total se sitúa alrededor de 6–8 GB.
- GPU recomendadas: A100, H100 y L40S para despliegues con concurrencia; RTX 4090 y RTX 3090 para inferencia individual en BF16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y tarjetas con 12 GB o más en BF16; en INT8 podría encajar en GPU de 8 GB, aunque este dato no está confirmado en la información disponible.
- Apple Silicon: el autor reporta ejecución en Metal INT8, por lo que es viable en equipos con memoria unificada suficiente (orientativamente 16 GB o más).
- Opciones de despliegue: PyTorch con código personalizado (requisito `custom-code`), en CUDA BF16 o MPS/Metal INT8. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo estándar es poco probable que estos motores lo soporten sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BS-D-1.0-Flash | 4.539 M | 65.536 (evaluación) | Decisor multimodal, verificador de trayectorias y juez visual | Apache-2.0 | Hugging Face |
| `perplexity-ai/pplx-decider-flash-v1.3` | No disponible | No disponible | Decisor base con protocolo de lectura conjunta | No disponible | Hugging Face |
| `Qwen/Qwen3.5-4B` | ~4 B | No disponible | Modelo generativo multimodal de propósito general | Apache-2.0 | Hugging Face |

La comparación relevante es frente a su propio modelo base: BS-D-1.0-Flash mejora el índice compuesto de 51,96 a 54,49 y el macro-F1 de modos de fallo de 0,2811 a 0,3199, a costa de mantener idénticas las métricas de verificación binaria y comparación por pares. Frente a `Qwen3.5-4B`, del que desciende, la diferencia es de propósito: el modelo original genera texto e imágenes, mientras que BS-D-1.0-Flash emite lecturas calibradas sobre un conjunto fijo de salidas. No se dispone de datos para comparar con otros verificadores o reward models de la misma categoría.

## Limitaciones y advertencias

- Modelo de nicho: no es un generador de texto ni un asistente conversacional; usarlo fuera de las tareas de decisión y verificación para las que fue calibrado producirá salidas sin sentido.
- Requiere código personalizado (`custom-code`) y el protocolo de lectura del modelo base; no funciona con cargadores estándar sin adaptación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (27 de noviembre de 2026), por lo que no hay validación independiente de los resultados reportados.
- Los benchmarks proceden exclusivamente de la model card del autor, sobre un split propio (`test_v4`) y en una configuración concreta (Metal INT8, `mode="isolated"`); no se han replicado de forma externa.
- La calibración se realizó sobre una suite concreta de monitorización de agentes; el rendimiento puede degradarse en dominios, idiomas o formatos de traza distintos de los de entrenamiento.
- El modelo conserva las filas de verificación binaria y la cola del base sin reentrenar, de modo que cualquier sesgo o limitación del modelo original en esas salidas persiste.
- Idiomas soportados no documentados: no hay garantía de comportamiento multilingüe más allá de lo que herede del base.
- Riesgo de alucinación en las puntuaciones: al emitir lecturas calibradas sobre trazas, puede asignar valores plausibles pero incorrectos sin señal de incertidumbre explícita; conviene validar con métricas deterministas complementarias.
- Aunque la licencia es Apache-2.0 y permite uso comercial, el modelo base y el modelo del que deriva deben verificarse por separado antes de un despliegue en producción.
- El tamaño del repositorio (9,6 GB) incluye pesos en BF16 y artefactos de calibración; conviene revisar qué ficheros se descargan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balllvin/BS-D-1.0-Flash
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.3
- Modelo del que deriva el base: https://huggingface.co/Qwen/Qwen3.5-4B
