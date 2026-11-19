# anhdao69/training_log_wa

## Resumen

LoopedWAM (anteriormente CoilWAM / LoopWAM) es un world-action model orientado a robótica, desarrollado por el autor anhdao69 y presentado en el paper homónimo. El repositorio `anhdao69/training_log_wa` no es una release de pesos lista para uso, sino un archivo completo de investigación: reúne todos los checkpoints publicados junto con sus logs de entrenamiento, además de checkpoints que solo existían en servidores internos. Fue ensamblado el 2026-11-18 a partir de cinco repositorios de Hugging Face y dos clústeres de entrenamiento, y los modelos "limpios" (sin logs) se publican por separado en `anhdao69/LoopedWAM`.

El modelo se construye sobre pesos donantes compactos de Wan2.1 (`_shared`), inicializando desde ahí todos los modelos derivados. La propuesta técnica central es una arquitectura con "loops" de vídeo y acción (por ejemplo 4/4, 1/4, 2/2, 4/1), evaluada sobre benchmarks de manipulación robótica como LIBERO, RoboTwin-50, RoboTwin-10 y Robocasa-GR1, además de despliegues en robot real AgileX PiPER. Los resultados reportados en la model card sitúan LIBERO LoopedWAM en 96.1 y LoopedWAM-E en 95.6/96.0, RoboTwin-50 en 91.9 (época 10) y 91.5/90.6 (LoopedWAM-E), y GR1 en 52.2 (época 9) y 52.4/51.6 (GR1-E0).

Es relevante ahora porque expone de forma inusualmente transparente todo el proceso de ablación (loops, inicialización, partición prelude/core/coda, controles densos, pérdidas elásticas, recetas elásticas) junto con los logs, lo que permite reproducir y auditar cada decisión de diseño. El tamaño del repo, 901.4 GB, refleja que contiene decenas de checkpoints y rollouts grabados, no un único modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | world-action model con loops de vídeo/acción, inicializado desde pesos donantes Wan2.1; detalles completos no disponibles en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch (`.pt`); también `export_v0_format/CL-0_loopwam.pt`; no se mencionan safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura se articula en torno a "loops" de vídeo y acción, con variantes 4/4, 1/4, 2/2, 4/1 y 4/1 KV-mix, y una partición prelude/core/coda explorada en una ablación específica. Todos los modelos parten de pesos donantes compactos de Wan2.1 (`_shared`), que se usan como inicialización. Existen además controles densos Dense-12 y Dense-30 (10 épocas, con una extensión a 20 épocas en `epoch_20/`) y Dense30-E0, lo que permite aislar el efecto de los loops frente a un transformer denso equivalente.

El entrenamiento se organiza en campañas elásticas (CL0-E0, CL0-E1, CL0-E2, E0/E1/E2, F0-PB, SP11) con ablaciones de pérdida: sin teacher forcing, sin anchor, sin end-point y sin gripper loss. Se reportan también recetas elásticas destiladas desde un teacher de época 5 en RoboTwin-50, y reruns en H100 para RoboTwin-10. Los logs de entrenamiento acompañan cada checkpoint, y el `MANIFEST.csv` registra tamaño, SHA-256 y origen de cada fichero. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO.

## Capacidades

- Control robótico por imitación: genera acciones a partir de observaciones, evaluado en LIBERO, RoboTwin-50, RoboTwin-10 y Robocasa-GR1.
- World-action modeling: combina modelado de dinámica (vídeo) y predicción de acción mediante loops acoplados.
- Manipulación de objetos en robot real: modelos AgileX PiPER para la tarea pick-can, con rollouts de evaluación grabados.
- Variantes con memoria: ChronoLoop (CL-A, CL-REG, CL-W2, CL-FRAME, versiones de 1 loop) como proyecto lateral.
- Transporte residual: ResidualTrans (RT-A, RT-A2, RT-B2a, RT-B4, RT-Pa, RT-T1ft, RT-TF) como línea alternativa.
- Destilación desde teacher: recetas elásticas E0/E1/E2 destiladas durante una época.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo "thinking".

## Casos de uso

- Reproducción de resultados del paper: el repo contiene checkpoints y logs de cada ablación (loops, init, partition, dense, elastic), lo que permite reentrenar y verificar las cifras reportadas (LIBERO 96.1, RoboTwin-50 91.9, GR1 52.2) paso a paso.
- Investigación en world-action models: comparar directamente loops 4/4 frente a 1/4, 2/2, 4/1 y KV-mix sobre el mismo dataset y schedule, aislando el efecto de la profundidad iterativa.
- Estudio de inicialización desde pesos donantes: la carpeta `libero/ablations/init` con `_init_weights/` permite medir cuánto del rendimiento proviene de Wan2.1 frente al entrenamiento específico.
- Ablación de funciones de pérdida en robótica: las carpetas `elastic_loss` y `elastic_loss_ablation` (RT10 E0, -TF, -noAnchor, -noEnd) permiten evaluar la contribución de teacher forcing, anchor, end-point y gripper loss de forma controlada.
- Despliegue en robot real AgileX PiPER: los modelos de `real_piper` (v0 4/4 `v0_4-4_newcan` step 30K, CoilWAM-E 10K/30K, Fast-WAM fine-tunes) están entrenados para la tarea pick-can y acompañados de rollouts grabados, útiles para validar políticas antes de un despliegue físico.
- Auditoría y trazabilidad de experimentos: `MANIFEST.csv` con SHA-256 y origen de cada fichero, más READMEs originales preservados, permite reconstruir la procedencia de cada checkpoint para publicaciones o revisiones.
- Benchmarking de baselines: `others/baselines/LiLa-WAM_LIBERO_ours` ofrece un entrenamiento propio de LiLa-WAM en LIBERO como referencia comparativa.

## Benchmarks y rendimiento

| Benchmark / modelo | Resultado reportado |
|---|---|
| LIBERO LoopedWAM | 96.1 |
| LIBERO LoopedWAM-E | 95.6 / 96.0 |
| LIBERO loops 4/4 (schedule de 10 épocas) | 94.9 |
| RoboTwin-50 LoopedWAM (época 10) | 91.9 |
| RoboTwin-50 LoopedWAM-E (época 5) | 91.5 / 90.6 |
| Robocasa-GR1 LoopedWAM (época 9) | 52.2 |
| Robocasa-GR1 LoopedWAM-E (época 4) | 52.4 / 51.6 |
| Robot real AgileX PiPER (pick-can) | sesión 60/83 con `v0_4-4_newcan` step 30K |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni métricas de texto estándar; las cifras anteriores son tasas de éxito en benchmarks de manipulación robótica tal como aparecen en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repo, 901.4 GB, corresponde al archivo completo de checkpoints y logs, no al peso de un único modelo).
- GPU recomendadas: no disponible; se menciona explícitamente un rerun de RoboTwin-10 en H100 (`robotwin10/loops_h100_rerun`), lo que indica que H100 se usó para entrenamiento.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; los pesos se distribuyen como checkpoints PyTorch (`.pt`), sin referencias a vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LoopedWAM | world-action model con loops | no disponible | no disponible | LIBERO 96.1; RoboTwin-50 91.9; GR1 52.2 | no disponible | HF (`anhdao69/training_log_wa`, `anhdao69/LoopedWAM`) |
| Dense-12 / Dense-30 (controles internos) | transformer denso | no disponible | no disponible | controles del paper, cifras no detalladas en la información | no disponible | dentro del mismo repo |
| LiLa-WAM (entrenamiento propio) | baseline | no disponible | no disponible | no disponible | no disponible | `others/baselines/LiLa-WAM_LIBERO_ours` |
| ChronoLoop | variante con memoria | no disponible | no disponible | no disponible | no disponible | `others/ChronoLoop` |

No se dispone de datos suficientes para comparar con alternativas externas de la misma categoría (por ejemplo otros world-action models públicos); la comparativa se limita a las líneas internas del propio proyecto.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial; conviene verificar antes de cualquier despliegue en producción.
- El repositorio es un archivo de investigación, no una release curada: contiene decenas de checkpoints parciales, reruns y ablaciones, lo que exige consultar `MANIFEST.csv` para identificar el modelo correcto.
- Tamaño de 901.4 GB: requiere almacenamiento considerable y descarga selectiva; no está pensado para clonado completo en estaciones de trabajo.
- Los READMEs internos conservan enlaces a rutas antiguas, por lo que pueden apuntar a ubicaciones ya movidas; hay que usar la tabla de mapeo de la model card.
- Idiomas y contexto no documentados: no hay información sobre capacidades multilingües ni sobre la ventana de contexto efectiva.
- Riesgo de alucinación: no aplica en el sentido de texto general, pero las políticas entrenadas por imitación pueden fallar fuera de la distribución de las tareas evaluadas (LIBERO, RoboTwin, GR1, pick-can).
- Cifras de benchmarks reportadas por el autor sin verificación independiente en la información disponible.
- Algunos checkpoints provienen de servidores internos y de clústeres distintos (incluido un rerun en H100), lo que puede introducir variabilidad entre ejecuciones.

## Enlaces

- Repositorio principal: https://huggingface.co/anhdao69/training_log_wa
- Modelos publicados sin logs: https://huggingface.co/anhdao69/LoopedWAM
- Manifiesto de ficheros: `MANIFEST.csv` dentro del repositorio
- Repositorios de origen citados: ChronoLoop (`cf52c636`), ChronoLoop_Robotwin5, ResidualTrans, CoilWAM_real4task, LoopedWAM (`f88641bf`)
- Paper: LoopedWAM (anteriormente CoilWAM / LoopWAM); no se proporciona URL directa en la información disponible
- Demo o espacio interactivo: no disponible
