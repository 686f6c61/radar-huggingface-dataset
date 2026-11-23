# alllwang/sn120-rl-accumulation-loras

## Resumen

`alllwang/sn120-rl-accumulation-loras` es un conjunto de artefactos de investigación publicados en Hugging Face por el usuario `alllwang`. No se trata de un modelo base completo, sino de una colección de adaptadores LoRA entrenados de forma secuencial mediante GRPO (Group Relative Policy Optimization) sobre un head concreto de la subnet 120 (Affine) de Bittensor. El objetivo del experimento es responder a una pregunta de investigación: si aceptar todas las iteraciones honestas de RL sin una compuerta de validación por ronda sigue mejorando el modelo o, por el contrario, degrada el rendimiento.

El modelo base sobre el que se aplican los LoRA es un fold del checkpoint `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B`, identificado con el hash `4c5ac17c6d7e…`. Los adaptadores son secuenciales: el checkpoint `kNNN` se entrena sobre el modelo resultante de plegar `k000 … k(NNN-1)` en el maestro fp32, replicando el funcionamiento del folder de la subnet. La tarea evaluada es matemática, con recompensa binaria (1 si pasa el grader oficial de SN120, 0 en caso contrario).

El interés del artefacto es fundamentalmente metodológico: documenta con datos por iteración (`metrics.jsonl`, `eval_*.jsonl`, `samples/kNNN_samples.json`) el efecto de la acumulación de iteraciones RL sobre un modelo de 9B, e incluye tanto el código del bucle de entrenamiento (`code/rl_loop.py`) como su diseño (`code/DESIGN.md`). El repositorio ocupa 2,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 32, 7 módulos de proyección) sobre transformer decoder-only (base MiMo-V2.6-Distill-Qwen-9B) |
| Parametros totales | No disponible (el LoRA se aplica sobre un base de 9B; el número exacto de parámetros del adaptador no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32k tokens (brazo `main32k`); 64k tokens (brazo `ctx64k`) |
| Tipos de cuantizacion | No disponible (pesos en bf16 tras el fold; el maestro se mantiene en fp32 durante el entrenamiento) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen (vía `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B`), sobre el que se aplican adaptadores LoRA de rank 16 y alpha 32 en 7 módulos de proyección. El entrenamiento utiliza GRPO-LoRA con el `train_job` de producción de SN120: Adam nuevo por iteración, clip PPO de 0,2 respecto a la política de inicio de cada iteración y máscara de soporte top-k 20 / top-p 0,95. Cada iteración genera 64 prompts con 8 rollouts cada uno.

El experimento se organiza en dos brazos. `main32k` cubre las iteraciones k000-k002 con learning rate 2e-5 y 4 minibatches, y a partir de k003 pasa a learning rate 5e-5 y 8 minibatches con un pool de tareas más cortas. `ctx64k` emplea contexto de 64k con learning rate 5e-5 y 8 minibatches sobre los mismos prompts que `main32k` desde k003. La recompensa es la del grader oficial de SN120: 1 si la respuesta pasa, 0 en caso contrario, y 0 si se alcanza el límite de tokens. La innovación metodológica es la acumulación secuencial sin compuerta: cada checkpoint se pliega en el maestro fp32 (`W_fp32 += (alpha/r) * B @ A`) antes de la siguiente iteración, con una única conversión a bf16.

## Capacidades

- Razonamiento matemático: el modelo está entrenado y evaluado específicamente sobre tareas de matemáticas con recompensa binaria del grader de SN120.
- Generación de cadenas de razonamiento largas: soporta hasta 32k tokens de contexto en el brazo `main32k` y 64k en `ctx64k`.
- Aprendizaje por refuerzo con GRPO: los adaptadores están optimizados para política de razonamiento, no para instrucciones generales.
- Plegado secuencial de adaptadores: los LoRA pueden acumularse sobre el maestro fp32 en orden `k000..kN`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües específicas.
- No se documenta un modo "thinking" explícito más allá del razonamiento matemático inducido por RL.

## Casos de uso

- Investigación en RL para matemáticas: reproducir el experimento de acumulación sin compuerta plegando los checkpoints `k000..kN` y evaluando sobre el conjunto fijo de 216 tareas medianas con el request body de producción.
- Análisis de degradación por iteración: comparar `pass@1` entre `k000`, `k003`, `k006`, `k008` y `k010` para estudiar si el RL acumulado mejora o colapsa la política, usando los `eval_*.jsonl` por rollout.
- Auditoría de subnets de Bittensor: el repositorio sirve como referencia de cómo se pliega un head de SN120 y cómo se registran métricas por iteración en `metrics.jsonl`.
- Reproducción de recetas GRPO-LoRA: `code/rl_loop.py` y `code/DESIGN.md` documentan el bucle completo con clip PPO 0,2 y máscara top-k 20 / top-p 0,95, reutilizable en otros dominios con recompensa verificable.
- Estudio de sensibilidad a la longitud de contexto: el par `main32k` / `ctx64k` permite aislar el efecto de 32k frente a 64k tokens sobre la misma distribución de prompts.
- Base para fine-tuning posterior: los adaptadores plegados en bf16 pueden servir como punto de partida para experimentos de RL adicionales sobre el mismo head de 9B.
- Docencia y divulgación: los artefactos de datos (muestras con recompensas, registros de evaluación por rollout) permiten ilustrar el funcionamiento interno de GRPO con ejemplos reales.

## Benchmarks y rendimiento

Evaluación sobre un conjunto fijo de 216 tareas medianas, con el request body de producción y 65k tokens. Solo es válido comparar dentro de la misma máquina: pod antiguo (`k000`, `k003`, `k006`), pod principal nuevo (`ctrl_k000_scmain_v2`, `k008+`) y pod de 64k (`ctrl_k000_sc64k_v2`, `k002+`).

| Fichero | pass@1 | Rollouts |
|---|---|---|
| `ctrl_k000_scmain` | 0,622 | 648 |
| `ctrl_k000_scmain_v2` | 0,582 | 648 |
| `k000` | 0,555 | 1080 |
| `k003` | 0,533 | 1080 |
| `k006` | 0,538 | 1080 |
| `k008` | 0,622 | 648 |
| `k010` | 0,625 | 648 |
| `ctrl_k000_sc64k` | 0,568 | 648 |
| `ctrl_k000_sc64k_v2` | 0,582 | 648 |
| `k002` | 0,568 | 648 |

Advertencia del autor: `eval_ctrl_k000_scmain.jsonl` y `eval_ctrl_k000_sc64k.jsonl` fueron servidos por un vLLM huérfano que contenía el modelo actual (k=9 / k=2), no k=0, por lo que no deben interpretarse como líneas base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, un base de 9B en bf16 requiere del orden de 18 GB solo para pesos, más KV cache para 32k-64k tokens de contexto.
- GPU recomendadas: no disponible. El autor menciona pods de evaluación con vLLM, pero no especifica el hardware.
- Cabe en GPU de consumo: no disponible. Un base de 9B en bf16 no cabe en GPUs de 16 GB; en cuantizaciones de 4 bits podría caber en 24 GB, pero no se documenta.
- Opciones de despliegue: vLLM (utilizado por el autor para servir el modelo en evaluación). No se documenta llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor solo reporta el límite de 65k tokens por petición de evaluación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `alllwang/sn120-rl-accumulation-loras` | LoRA sobre base 9B | 32k / 64k | Matemáticas (GRPO) | Apache 2.0 | Hugging Face |
| `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B` | 9B | No disponible | Distilación general | No disponible | Hugging Face |
| Modelos Qwen de 9B (familia base) | ~9B | Variable según variante | General | Variable | Hugging Face |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere plegar los LoRA en orden `k000..kN` sobre el head `4c5ac17c6d7e…` para obtener un modelo utilizable.
- Los resultados de evaluación solo son comparables dentro de la misma máquina; mezclar pods invalida la comparación.
- Dos ficheros de control (`eval_ctrl_k000_scmain.jsonl` y `eval_ctrl_k000_sc64k.jsonl`) están contaminados por un vLLM huérfano con el modelo actual, no con k=0.
- El entrenamiento y la evaluación se limitan a matemáticas con recompensa binaria; no hay evidencia de capacidades generales, tool calling ni agentes.
- No se documentan idiomas soportados; el comportamiento multilingüe es desconocido.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero el base subyacente (`XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B`) puede tener sus propias restricciones no documentadas aquí.
- El repositorio no registra descargas ni likes, por lo que no hay validación externa de la reproducibilidad.
- El experimento concluye, según los datos, que la acumulación sin compuerta no mejora de forma sostenida: `pass@1` baja de 0,555 (k000) a 0,533 (k003) y 0,538 (k006), y solo vuelve a 0,622-0,625 en k008-k010 tras cambiar de pod y de receta.

## Enlaces

- Hugging Face: https://huggingface.co/alllwang/sn120-rl-accumulation-loras
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Bittensor subnet 120 (Affine): no disponible en la información proporcionada
- Paper de GRPO: no disponible en la información proporcionada
- Repositorio de código: incluido en el propio repo (`code/rl_loop.py`, `code/DESIGN.md`)
