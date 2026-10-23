# FinleyHolt/wm-horizon-readout-ablation

## Resumen

`FinleyHolt/wm-horizon-readout-ablation` no es un modelo único, sino un repositorio de checkpoints de investigación (152,7 GB) que recoge una ablación factorial de horizonte de planificación y profundidad de lectura sobre tres *world-action models*: Cosmos-Policy (NVIDIA), LingBot-VA (Robbyant) y Cosmos3-Edge (NVIDIA). Cada brazo del experimento se ha ajustado con todos los parámetros sobre el mismo conjunto de demostraciones (mezcla M5 de las cuatro suites LIBERO más LIBERO-Plus) y con un split de validación fijo identificado por el sha256 `1a2fac92…f42ec0`.

El interés es metodológico: permite comparar, con idéntico presupuesto de datos y una misma partición, cómo afectan el horizonte de planificación (brazos K4 y K8, según el índice publicado) y el nivel de lectura (*readout*) al rendimiento en control robótico cerrado, evaluado en LIBERO-MAX Lite. Cada carpeta incluye un `meta.json` con brazo, step, época, batch global, commit de código y ejecución de W&B, lo que facilita la reproducibilidad.

Se trata de material de investigación, no de productos listos para producción. Las licencias son distintas por carpeta: Apache-2.0 para LingBot-VA, NVIDIA NSCLv1 (no comercial) para Cosmos-Policy y OpenMDW-1.1 para Cosmos3-Edge. El repositorio no documenta idiomas soportados, longitud de contexto ni resultados numéricos de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos de acción sobre el mundo (*world-action models*) basados en transformer; LingBot-VA se describe en su paper como *causal world modeling* para control robótico. La model card no detalla capas, atención ni esquema de difusión por familia |
| Parametros totales | 2B en `cosmos-policy` (Cosmos-Policy-LIBERO-Predict2-2B); no disponible para `lingbot-va` y `cosmos3-edge` |
| Parametros activos | No aplica / no disponible (no se indica que sean MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Solo se documenta bf16 para `cosmos-policy`; el resto de pesos se distribuyen sin cuantización publicada. No hay GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (son políticas condicionadas por instrucciones de tarea, no modelos de lenguaje de propósito general) |
| Licencia | Mixta por carpeta: `lingbot-va/` Apache-2.0; `cosmos-policy/` NVIDIA One-Way Noncommercial License (NSCLv1); `cosmos3-edge/` OpenMDW-1.1 |
| Formato de pesos | `lingbot-va/` y `cosmos-policy/` en safetensors (este último `model.net` en bf16); `cosmos3-edge/` en torch DCP (`net_ema`), cargable por el action server de cosmos-framework |

## Arquitectura y entrenamiento

El repositorio agrupa tres familias de modelos con arquitecturas internas distintas, unificadas por el mismo protocolo de ajuste. LingBot-VA se apoya en el trabajo *Causal World Modeling for Robot Control* (arXiv:2601.21998): modela la dinámica del entorno de forma causal para condicionar la acción del robot. Cosmos-Policy deriva de Cosmos-Policy-LIBERO-Predict2-2B, con 2B parámetros en bf16, y el sufijo *Predict2* junto al pipeline `diffusers` sugiere un modelo generativo de predicción, aunque la model card no especifica el mecanismo de atención ni el scheduler. Cosmos3-Edge aporta los pesos EMA finales (`net_ema`) junto con su codificador visual y procesador originales.

El entrenamiento es *full-parameter fine-tuning* sobre el mismo conjunto: mezcla M5 de las cuatro suites LIBERO y las demostraciones de entrenamiento de LIBERO-Plus, con split retenido fijo. El índice publicado documenta brazos K4 y K8 (horizonte) con pasos 250, 355 (época 2), 500, 750 y 888 (época 5), batch global 80 y commit de código `eaa71aa`; el README está truncado en la información disponible, por lo que la lista completa de brazos de profundidad de lectura no puede verificarse. No se documentan número total de tokens, composición exacta del dataset, ni si hubo RLHF o DPO. La evaluación es en bucle cerrado sobre LIBERO-MAX Lite.

## Capacidades

- Generación de acciones robóticas condicionadas por la tarea y por el estado visual, dentro del paradigma *world-action model*.
- Planificación con horizonte configurable: los brazos K4 y K8 permiten estudiar el efecto del horizonte en la ejecución.
- Control multi-tarea: entrenados sobre las cuatro suites LIBERO ( Spatial, Object, Goal, Long) y LIBERO-Plus, según la descripción del autor.
- Ejecución en bucle cerrado con realimentación del entorno, evaluada en LIBERO-MAX Lite.
- Ajuste completo de parámetros por brazo, con pesos EMA en el caso de Cosmos3-Edge.
- Trazabilidad experimental: cada checkpoint registra step, época, batch, commit y run de W&B en `meta.json`.
- No soporta *tool calling*, *function calling*, razonamiento multi-paso simbólico, agentes basados en texto, visión descriptiva, audio ni *thinking mode*. No es un modelo de lenguaje y no genera texto libre.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.

## Casos de uso

- **Investigación sobre horizonte de planificación**: comparar los brazos K4 y K8 con datos, split y presupuesto idénticos para aislar el efecto del horizonte en la tasa de éxito de manipulación; el repositorio ya incluye los checkpoints intermedios y finales necesarios.
- **Estudio de profundidad de lectura (*readout depth*)**: analizar cómo escala el rendimiento al variar el nivel de lectura en las tres familias, reutilizando la misma partición retenida y el mismo `meta.json` para auditoría.
- **Reproducción de experimentos**: reconstruir las curvas de entrenamiento y evaluación a partir de los enlaces a W&B y del commit `eaa71aa`, sin reentrenar desde cero.
- **Comparación entre familias de world-action models**: emplear los tres conjuntos de pesos como línea base homogénea (mismos datos, mismo split) en lugar de comparar resultados publicados con protocolos dispares.
- **Ajuste fino posterior en robótica de manipulación**: partir de los checkpoints de LingBot-VA (Apache-2.0) para experimentos académicos o comerciales, o de Cosmos-Policy solo en contexto no comercial según NSCLv1.
- **Evaluación cerrada en simulador**: integrar los pesos en el *action server* de cosmos-framework (`--checkpoint-path`) para Cosmos3-Edge, o en el pipeline `diffusers` para LingBot-VA, y medir éxito en LIBERO-MAX Lite.
- **Docencia y cursos de robótica aprendida**: usar brazos intermedios (step 250, 500) para ilustrar el compromiso entre convergencia y coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica únicamente que la evaluación se realizó en bucle cerrado sobre LIBERO-MAX Lite, pero no incluye tasas de éxito, números por suite ni comparaciones numéricas entre brazos o familias. Tampoco se aportan métricas de latencia, throughput ni consumo de memoria durante la inferencia.

## Requisitos de hardware

- **Almacenamiento**: el repositorio completo ocupa 152,7 GB; conviene descargar solo la carpeta del brazo necesario (`huggingface-cli download ... --include "lingbot-va/horizon/K4/step500/*"`) en lugar de clonar todo.
- **Cosmos-Policy (2B, bf16)**: pesos del orden de 4 GB; con codificador visual, codificador de texto y activaciones, una estimación razonable es 8-16 GB de VRAM. Cabe en una RTX 4090 (24 GB), RTX 3090 (24 GB), L40S (48 GB) y A100 (40/80 GB).
- **LingBot-VA**: solo se distribuye el transformer; requiere el VAE, el codificador de texto y el tokenizador del modelo base `robbyant/lingbot-va-posttrain-libero-long`. El tamaño del transformer no está documentado, por lo que la VRAM no puede estimarse con rigor.
- **Cosmos3-Edge**: se distribuye `net_ema` en torch DCP junto con el codificador visual; el número de parámetros no está disponible. Requiere el *action server* de cosmos-framework y, previsiblemente, una GPU de datacenter (A100/H100) si el tamaño es comparable a otros modelos Cosmos; dato no confirmado.
- **Opciones de despliegue**: `diffusers` para LingBot-VA, *action server* de cosmos-framework con `--checkpoint-path` para Cosmos3-Edge y el código de evaluación del modelo base para Cosmos-Policy. No aplican vLLM, TGI, llama.cpp ni Ollama: no son modelos de lenguaje y no tienen tokenizador de texto general.
- **Latencia y throughput**: no disponibles. No se publica frecuencia de control, tiempo por paso ni número de pasos de planificación por episodio.
- **Entorno**: inferencia en servidor sin pantalla; la evaluación en simulador requiere el stack de LIBERO/LIBERO-MAX Lite y sus dependencias, no incluidas en el repositorio.

## Comparativa con modelos similares

No se dispone de especificaciones ni resultados de alternativas externas (OpenVLA, π0, RT-2 u otras) en la información proporcionada. La comparación rigurosa posible se limita a las tres familias incluidas en el repositorio, que comparten datos y split:

| Familia | Modelo base | Parámetros | Licencia | Formato | Contexto | Resultados |
|---|---|---|---|---|---|---|
| LingBot-VA | `robbyant/lingbot-va-posttrain-libero-long` | No disponible | Apache-2.0 | Safetensors (solo transformer) | No disponible | No publicados |
| Cosmos-Policy | `nvidia/Cosmos-Policy-LIBERO-Predict2-2B` | 2B | NSCLv1 (no comercial) | Safetensors bf16 (`model.net`) | No disponible | No publicados |
| Cosmos3-Edge | `nvidia/Cosmos3-Edge` | No disponible | OpenMDW-1.1 | Torch DCP (`net_ema`) | No disponible | No publicados |

## Limitaciones y advertencias

- **No son productos**: el autor los describe explícitamente como *research checkpoints*. No hay garantía de estabilidad, soporte ni mantenimiento.
- **Licencia no comercial en Cosmos-Policy**: NSCLv1 restringe el uso comercial; cualquier despliegue en producción con esa carpeta requiere revisión legal o sustitución por la base bajo los términos de NVIDIA.
- **Licencias mixtas**: un mismo repositorio combina Apache-2.0, NSCLv1 y OpenMDW-1.1; reutilizar pesos de varias carpetas exige cumplir cada licencia por separado.
- **Dependencias externas**: LingBot-VA no incluye VAE, codificador de texto ni tokenizador; Cosmos3-Edge requiere cosmos-framework. Sin esos componentes los pesos no son ejecutables.
- **Ausencia de benchmarks**: no hay métricas publicadas que permitan afirmar superioridad de un brazo sobre otro; cualquier conclusión requiere reevaluar en LIBERO-MAX Lite.
- **Sesgos y alucinación**: no aplica el concepto de alucinación textual, pero sí el riesgo de generalización fuera de distribución. El entrenamiento se limita a demostraciones simuladas de LIBERO y LIBERO-Plus, por lo que el comportamiento en robots reales o tareas distintas no está caracterizado.
- **Idioma**: no se declara ninguna lista de idiomas; las instrucciones de tarea provienen del dataset LIBERO, predominantemente en inglés, pero este dato no se confirma en la model card.
- **Sesgo de simulación**: la evaluación es en simulador; el gap sim-to-real no se cuantifica.
- **Repositorio incompleto en la información disponible**: el README está truncado, de modo que la lista completa de brazos de profundidad de lectura y posibles resultados no pueden verificarse.
- **Tamaño**: 152,7 GB dificultan la descarga y el versionado; el uso de Git LFS y descargas selectivas es obligatorio en la práctica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/FinleyHolt/wm-horizon-readout-ablation
- Licencias por carpeta (ancla del README): https://huggingface.co/FinleyHolt/wm-horizon-readout-ablation/blob/main/README.md#licenses-per-folder
- Modelo base LingBot-VA: https://huggingface.co/robbyant/lingbot-va-posttrain-libero-long
- Repositorio de código LingBot-VA: https://github.com/Robbyant/lingbot-va
- Paper de LingBot-VA, *Causal World Modeling for Robot Control*: https://huggingface.co/papers/2601.21998
- Modelo base Cosmos-Policy: https://huggingface.co/nvidia/Cosmos-Policy-LIBERO-Predict2-2B
- Modelo base Cosmos3-Edge: https://huggingface.co/nvidia/Cosmos3-Edge
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia NVIDIA NSCLv1: https://github.com/NVlabs/HMAR/blob/main/LICENSE
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Proyecto de W&B con las ejecuciones de la ablación: https://wandb.ai/mjf-su-stanford-university/wm-horizon-readout-ablation-lingbot
- Ejecución de ejemplo (LingBot-VA, horizonte K4): https://wandb.ai/mjf-su-stanford-university/wm-horizon-readout-ablation-lingbot/runs/wmabl-lingbot-va-horizon-k4-1a2fac92
- Perfil del autor en GitHub: https://github.com/FinleyHolt
- Trabajo relacionado del autor, WORLDS (búsqueda robótica guiada por lenguaje): https://arxiv.org/abs/2609.23841
