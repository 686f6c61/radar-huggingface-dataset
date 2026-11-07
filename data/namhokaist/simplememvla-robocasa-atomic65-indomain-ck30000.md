# namhokaist/simplememvla-robocasa-atomic65-indomain-ck30000

## Resumen

SimpleMemVLA es una política de visión-lenguaje-acción (VLA) para robótica de manipulación, desarrollada sobre el código abierto de OpenBMB (SimpleMemVLA) y un backbone nativo Qwen3.5-4B. Este checkpoint concreto (`namhokaist/simplememvla-robocasa-atomic65-indomain-ck30000`) es un ajuste fino del autor `namhokaist` sobre las 65 tareas atómicas de cocina del registro RoboCasa v1.0, orientado a control robótico de brazos PandaOmron en simulación.

El modelo resuelve el problema de mapear observaciones multimodales (tres cámaras de 256×256, historial de vídeo de 30 s y propiocepción de 16 dimensiones) a secuencias de acciones de 16 pasos de 12 dimensiones, mediante un cabezal de acción con flow matching sobre el backbone de lenguaje. Su relevancia radica en que aplica un backbone de lenguaje moderno (4B parámetros) directamente a control robótico, sin módulo de memoria dedicado: delega la selección de evidencia en la self-attention nativa sobre el historial de vídeo con marcas temporales.

El modelo se distribuye con licencia "other" (heredera de las licencias upstream), 11,4 GB de pesos en safetensors, y está pensado para evaluación cerrada en el simulador RoboCasa, no para despliegue comercial directo sin revisar las licencias de Qwen3.5-4B y SimpleMemVLA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA): backbone transformer Qwen3.5-4B + cabezal de acción con flow matching |
| Parametros totales | 4B en el backbone (cabezal de acción: no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (historial de vídeo de 30 s a 2 fps para la cámara izquierda) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (instrucciones en inglés: 552 instrucciones distintas) |
| Licencia | other (`see-upstream-licenses`, enlace a OpenBMB/SimpleMemVLA) |
| Formato de pesos | safetensors (model.safetensors + config.json, stats.json, tokenizer y processor) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone de lenguaje Qwen3.5-4B (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) con el cabezal de acción de flow matching de SimpleMemVLA. La observación consta de tres cámaras de 256×256 (vistas de agente izquierda y derecha, más muñeca), un historial de 30 s de la cámara izquierda a 2 fps y propiocepción de 16 dimensiones. La salida son chunks de 16 pasos de una acción PandaOmron de 12 dimensiones (movimiento de base, modo de control, delta de pose del efector final y pinza). SimpleMemVLA no incorpora un módulo de memoria dedicado: mantiene el historial muestreado intacto en formato de vídeo con marcas temporales y delega la selección de evidencia en la self-attention nativa en el momento de la decisión.

El ajuste fino se realizó sobre las demostraciones de teleoperación humana de las 65 tareas `pretrain/atomic` del registro RoboCasa v1.0 (robocasa@456174f6): 7356 episodios, 1.495.313 frames a 20 Hz y 552 instrucciones distintas, con 7291 episodios para entrenamiento y 65 retenidos como sondas. Los archivos provienen del espejo público `nvidia/PhysicalAI-Robotics-Manipulation-Kitchen-Demos` verificados por sha256. El entrenamiento consistió en 30.000 actualizaciones con batch efectivo 48 (6 procesos de datos × 8 por dispositivo), warm-up de 1000, schedule coseno, lr del backbone 5e-06 y lr del cabezal 5e-05, con ZeRO-3 residente en GPU sobre seis NVIDIA H200. Hubo una supervisión de razonamiento de sub-tareas basada en fases de pinza derivadas de la señal de pinza grabada. El entrenamiento se interrumpió y reanudó de forma nativa (restaurando optimizador, scheduler y estado RNG) desde el checkpoint-27000.

## Capacidades

- Control robótico de manipulación: genera acciones de 12 dimensiones (base, modo de control, delta de pose del efector final, pinza) en chunks de 16 pasos.
- Percepción multimodal: procesa tres cámaras simultáneas (vistas de agente izquierda/derecha y muñeca) a 256×256.
- Memoria temporal implícita: utiliza 30 s de historial de vídeo a 2 fps sin módulo de memoria dedicado.
- Seguimiento de instrucciones en lenguaje natural: 552 instrucciones distintas en las tareas de entrenamiento.
- Razonamiento de sub-tareas: supervisión de fases de pinza derivadas de la señal de pinza.
- Integración con propiocepción de 16 dimensiones.
- Inferencia a 20 Hz mediante servidor de política (`policy_server.py`).
- No se documenta soporte de tool calling, function calling ni agentes multi-paso genéricos.

## Casos de uso

- Evaluación de políticas VLA en RoboCasa: el modelo se carga con `robomemarena_sim.policy.get_vla` o con el adaptador `policy_adapter.load_policy` y se ejecuta en el benchmark `robocasa_atomic` para medir éxito por tarea. Es adecuado porque está entrenado específicamente sobre las 65 tareas atómicas del registro.
- Investigación en memoria en VLA: al no tener módulo de memoria dedicado, permite estudiar cómo la self-attention nativa selecciona evidencia del historial de vídeo de 30 s en decisiones de manipulación.
- Reproducción de experimentos: los receipts incluidos (configuración, gate, dataset, loader, manifiesto de 65 tareas) permiten auditar el entrenamiento y reproducir la evaluación con `rollout_runner.py`.
- Servido de política en tiempo real: `policy_server.py --checkpoint model/` sirve el modelo a 20 Hz para rollouts, lo que encaja en pipelines de simulación cerrada.
- Ajuste fino posterior: al partir de un backbone Qwen3.5-4B y un cabezal de flow matching, sirve como base para nuevas tareas de cocina o dominios de manipulación, aunque el autor advierte que no incluye expansiones MimicGen ni tareas compuestas.
- Estudio de supervisión de sub-tareas: la supervisión de fases de pinza derivada de la señal grabada permite analizar el razonamiento de sub-tareas en políticas VLA.
- Comparación de recetas de entrenamiento: con 30.000 actualizaciones, batch 48 y seis H200, el checkpoint documenta una receta concreta que puede replicarse o compararse con otras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación cerrada in-domain de este checkpoint (escenas y objetos nuevos del split pretrain, 10 episodios por tarea, éxito según el predicado nativo de cada tarea dentro de su horizonte) "not available at packaging time". Los resultados por tarea estarían en `evaluation/EVALUATION.json`, pero no se proporcionan en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repo ocupa 11,4 GB en safetensors, lo que da una cota inferior del orden de 12 GB para pesos en FP16/BF16, más overhead de activaciones y cámaras.
- GPU recomendadas: el entrenamiento se realizó en seis NVIDIA H200 con ZeRO-3; para inferencia no se especifican GPU concretas.
- ¿Cabe en consumer GPU?: no disponible. Con pesos de ~11,4 GB, cabría teóricamente en GPUs de 16-24 GB (RTX 4090, RTX 3090) si el overhead de activaciones lo permite, pero no hay confirmación en la información.
- Opciones de despliegue: `robomemarena_sim.policy.get_vla`, adaptador `policy_adapter.load_policy` y servidor `policy_server.py` del repo `namhkoh/robo_ttt` (rama `koh-dev/h200-cluster-bootstrap`). No se documenta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: servido a 20 Hz según la model card; no se detallan latencias por paso ni throughput medido.
- Ajuste de inferencia: variable de entorno `SM_L2NORM_ROW_PAD=16384` para inferencia rápida con múltiples longitudes de prompt (shim bit-idéntico para los kernels L2-norm de flash-linear-attention).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleMemVLA RoboCasa atomic65 (este) | 4B backbone + cabezal | 30 s de historial de vídeo | VLA manipulación cocina | other (upstream) | Hugging Face |
| SimpleMemVLA upstream (OpenBMB) | no disponible | no disponible | VLA general | ver repo OpenBMB | GitHub |
| Qwen3.5-4B (backbone base) | 4B | no disponible | LLM multimodal | ver upstream | Hugging Face |
| RoboCasa (framework) | no aplica (simulador) | no aplica | Simulación y benchmark | ver repo robocasa | GitHub |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Evaluación in-domain no disponible en el momento del empaquetado: no hay métricas de éxito publicadas para este checkpoint.
- Entrenado solo sobre las 65 tareas `pretrain/atomic` de RoboCasa v1.0; no incluye expansiones MimicGen ni tareas compuestas, por lo que no generaliza a esos escenarios.
- Dominio restringido a cocina simulada con brazo PandaOmron; no hay evidencia de transferencia a robots reales.
- Idiomas: no se documentan; las instrucciones de entrenamiento están en inglés (552 instrucciones).
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no evaluado; al ser una política de acción, el riesgo se traduce en acciones incorrectas más que en texto inventado.
- Licencia "other" con `see-upstream-licenses`: es necesario revisar las licencias de Qwen3.5-4B y de OpenBMB/SimpleMemVLA antes de cualquier uso comercial.
- El checkpoint proviene de un entrenamiento interrumpido y reanudado; los receipts documentan la continuidad, pero conviene verificarlos.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.
- Requiere el código upstream de SimpleMemVLA en `sys.path` y, para el adaptador, la rama `koh-dev/h200-cluster-bootstrap` del repo `namhkoh/robo_ttt`.

## Enlaces

- Hugging Face: https://huggingface.co/namhokaist/simplememvla-robocasa-atomic65-indomain-ck30000
- Repo SimpleMemVLA (OpenBMB): https://github.com/OpenBMB/SimpleMemVLA
- Repo RoboCasa: https://github.com/robocasa/robocasa
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Mirror de datos: https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-Manipulation-Kitchen-Demos
- Repo de integración `namhkoh/robo_ttt`: no disponible como URL en la información proporcionada (rama `koh-dev/h200-cluster-bootstrap`, benchmark `robocasa_atomic`)
