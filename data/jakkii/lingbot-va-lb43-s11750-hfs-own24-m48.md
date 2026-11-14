# jakkii/lingbot-va-lb43-s11750-hfs-own24-m48

## Resumen

LingBot-VA LB43 s11750 + HFS head deltas es un conjunto de pesos de ajuste fino (fine-tuning) para robótica basado en el modelo LingBot-VA, desarrollado por el usuario jakkii de Hugging Face. No se trata de un modelo completo, sino de un artefacto de entrenamiento que contiene exclusivamente 113.273.856 parámetros entrenables en forma de deltas aditivos sobre las cabezas de atención (`attn1`) del backbone congelado. El modelo base subyacente es `kenzhengjk/lingbot-va-lb43-s11750`, un LingBot-VA ajustado completamente sobre las demos limpias de 43 tareas de RoboTwin en el paso 11.750.

El artefacto implementa una estrategia de ajuste selectivo: 24 cabezas ("own24_LB") operan sobre tokens de vídeo y se entrenan con la pérdida de vídeo, mientras que 48 cabezas ("motion48_LB") operan sobre tokens de acción y se entrenan con la pérdida de acción. Cada delta edita las filas to_q/to_k/to_v (incluyendo bias) y las columnas to_out.0 de un par (capa, cabeza) concreto. El backbone permanece congelado y no se distribuye en este repositorio, por lo que el uso requiere descargar el modelo base por separado.

Este artefacto es relevante para investigadores en robótica y aprendizaje por imitación que quieran reproducir o extender el entrenamiento de LingBot-VA sobre tareas de manipulación RoboTwin, así como para quienes estudian técnicas de ajuste eficiente en parámetros (parameter-efficient fine-tuning) aplicadas a políticas visuomotoras. Incluye checkpoints intermedios cada 250 pasos desde el paso 250 hasta el 10.000, lo que permite analizar la evolución del entrenamiento y seleccionar el punto óptimo para cada tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deltas aditivos sobre cabezas de atención (`attn1`) del backbone LingBot-VA (transformer visuomotor) |
| Parametros totales | 113.273.856 (solo entrenables; backbone no incluido) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`lb_heads/deltas.safetensors`, ~432 MiB por checkpoint) |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo nuevo, sino que aplica deltas aditivos inicializados a cero sobre 72 cabezas de atención seleccionadas de la capa `attn1` del backbone LingBot-VA. Concretamente, 24 cabezas ("own24_LB") procesan tokens de vídeo bajo la pérdida de vídeo, y 48 cabezas ("motion48_LB") procesan tokens de acción bajo la pérdida de acción. Cada delta modifica las filas to_q/to_k/to_v (con bias) y las columnas to_out.0 de un par (capa, cabeza) específico, listado en `lb_heads/spec.json` (por ejemplo, `L1h14` corresponde a capa 1, cabeza 14). El backbone completo permanece congelado durante todo el entrenamiento.

El entrenamiento parte del checkpoint LB43 s11750 (LingBot-VA ajustado completamente sobre las demos limpias de 43 tareas RoboTwin en el paso 11.750) y utiliza 2.150 episodios (43 tareas × 50 demos limpias). El optimizador es AdamW con lr 1e-4, betas (0.9, 0.95), weight decay 0 y gradient clip 1.0. El schedule consta de 200 pasos de warmup, fase constante hasta el paso 9.000 y decaimiento coseno hasta 0.1× en el paso 10.000. El batch efectivo es de 8 muestras por paso (4 GPUs × batch 1 × acumulación de gradiente 2), con semilla 1 + rank. Se publican checkpoints cada 250 pasos desde `checkpoint_step_250` hasta `checkpoint_step_10000`. Como control emparejado en parámetros, el autor menciona una ejecución LoRA de rango 154 sobre las mismas 120 capas lineales de `attn1` (113.541.120 parámetros).

## Capacidades

- Control visuomotor para manipulación robótica: genera acciones motoras a partir de observaciones visuales y instrucciones, sobre tareas de RoboTwin.
- Ajuste específico por modalidad: las cabezas "own24" están optimizadas para representación de vídeo y las "motion48" para predicción de acción.
- Entrenamiento por imitación sobre demos limpias: el artefacto está calibrado sobre 43 tareas RoboTwin con 50 demostraciones limpias por tarea.
- Checkpoints intermedios: permite seleccionar el paso de entrenamiento (250–10.000) que mejor se ajuste a una tarea o a un régimen de entrenamiento concreto.
- Compatibilidad con el ecosistema LingBot-VA: se instala mediante el código Zero-WAM-fork (`research/lingbot_va/heads.py`, cargado por `research/lingbot_va/server.py`).
- No incluye capacidades de texto, código, matemáticas, visión general, tool calling, agentes ni multilingüismo: es exclusivamente un artefacto de política robótica.

## Casos de uso

- Reproducción de experimentos de ajuste eficiente en políticas visuomotoras: usar los deltas como referencia para comparar contra la ejecución LoRA rango-154 emparejada en parámetros (113,5 M) sobre las mismas 120 lineales de `attn1`.
- Evaluación de checkpoints intermedios en RoboTwin: cargar `checkpoint_step_250` a `checkpoint_step_10000` para trazar curvas de éxito por tarea y detectar el punto de saturación del ajuste.
- Estudio de la especialización por modalidad: analizar por separado el efecto de las 24 cabezas de vídeo y las 48 de acción sobre el rendimiento final, comparando ablaciones con y sin cada ruta.
- Transferencia a nuevas tareas RoboTwin: partir del checkpoint de mejor rendimiento y continuar el ajuste con demos adicionales de la tarea objetivo, manteniendo el backbone congelado.
- Análisis de la dinámica de entrenamiento: usar `metrics.jsonl` y `launch_info.json` para reproducir el schedule (warmup 200, constante hasta 9.000, coseno hasta 10.000) y validar la estabilidad del ajuste.
- Integración en pipelines de investigación con Zero-WAM-fork: montar la estructura de carpetas (transformer, vae, text_encoder, tokenizer del base + `lb_heads/`) para servir el modelo con `research.lingbot_va.server`.
- Docencia y divulgación: ilustrar cómo funcionan los deltas aditivos sobre cabezas de atención en modelos de robótica, dado que el artefacto es pequeño (432 MiB por checkpoint) y bien documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para los deltas por sí solos; hay que sumar los requisitos del backbone LingBot-VA completo (no cuantificados en la información proporcionada). Los deltas ocupan ~432 MiB por checkpoint en float32.
- GPU recomendadas: no disponible. El entrenamiento se realizó con 4 GPUs (batch 1 por GPU, acumulación 2), pero no se especifica el modelo exacto.
- ¿Cabe en GPU consumer?: no disponible; depende del backbone, que no se distribuye aquí.
- Opciones de despliegue: servidor propio de LingBot-VA (`research.lingbot_va.server`, Zero-WAM-fork) cargando un checkpoint en el layout oficial. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros entrenables | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (HFS head deltas) | 113.273.856 | no disponible | no disponible | no disponible | Hugging Face (repo 18,1 GB, 0 descargas) |
| LoRA rango-154 (control emparejado) | 113.541.120 | no disponible | no disponible | no disponible | Mencionado por el autor, no publica repo propio |
| LingBot-VA LB43 s11750 (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face (`kenzhengjk/lingbot-va-lb43-s11750`, rev. `70db6add`) |

## Limitaciones y advertencias

- El repositorio no contiene el backbone: es imprescindible descargar `kenzhengjk/lingbot-va-lb43-s11750` en la revisión `70db6add` para que los deltas funcionen.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor del modelo base.
- Idiomas no disponibles: no hay información sobre soporte multilingüe (probablemente irrelevante dado el dominio robótico).
- Sesgos conocidos: no disponibles; al entrenarse sobre 43 tareas RoboTwin con demos limpias, el artefacto puede sobreajustarse a esas tareas y generalizar mal fuera de ellas.
- Riesgo de alucinación: no aplicable en el sentido textual, pero existe riesgo de acciones incorrectas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto: no se especifica la ventana de contexto del backbone; no se puede garantizar el comportamiento en episodios largos.
- Caveats de producción: los checkpoints intermedios (250–10.000) pueden no ser óptimos; hay que validar el paso adecuado por tarea. Los archivos `launch_info.json` y `metrics.jsonl` contienen rutas absolutas del clúster de entrenamiento, no reproducibles directamente fuera de él.
- Dependencia de código externo: requiere el fork Zero-WAM (`research/lingbot_va/heads.py` y `server.py`), no disponible en el repo de Hugging Face.
- Repo de 18,1 GB con 0 descargas y 0 likes: poca validación comunitaria; tratar como artefacto de investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jakkii/lingbot-va-lb43-s11750-hfs-own24-m48
- Modelo base: https://huggingface.co/kenzhengjk/lingbot-va-lb43-s11750
- Repositorio del fork Zero-WAM: no disponible en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
