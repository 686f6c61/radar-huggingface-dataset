# m1b/kairos_rmbenchpp_put_back_block_relocate_16v3_p2p3

## Resumen

`kairos_rmbenchpp_put_back_block_relocate_16v3_p2p3` es un checkpoint de investigación publicado por el usuario `m1b` en HuggingFace, asociado a la tarea `put-back-block-relocate` del benchmark RMBench++ (RoboDojo v1.0.0). No se trata de un modelo de lenguaje generalista, sino de un artefacto de entrenamiento para robótica manipulativa, presumiblemente un policy o modelo de control entrenado sobre demostraciones de una tarea concreta de reubicación de bloques. El repositorio ocupa 27,6 GB y contiene pesos derivados de un entrenamiento por fases (p1, p2, p3).

La model card indica que el modelo parte de un checkpoint previo (`rmbenchpp_v021_put-back-block-relocate_sgres_1x8_20k_20260923_r3`, paso 20.000) y aplica dos fases adicionales: 2.000 pasos conjuntos en 1x8 A800 con LR 1e-4 (p2) y 1.000 pasos "memory-only" desde `p2/step_002000.pt` (p3). La variante "16v3" hace referencia a 16 memory tokens de tipo adaptativo con prefijo de 128, un mecanismo de memoria que probablemente condiciona la política sobre observaciones pasadas.

Es relevante para investigadores que trabajan en manipulación robótica con memoria a largo plazo y en la reproducibilidad de experimentos sobre RMBench++. No hay información pública sobre arquitectura, licencia, idiomas ni benchmarks, por lo que la ficha se limita a lo declarado por el autor y marca el resto como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de política para RMBench++/RoboDojo, presumiblemente transformer con memory tokens) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara MoE) |
| Longitud de contexto | prefijo de 128 y 16 memory tokens adaptativos (según model card); longitud de contexto en tokens no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 27,6 GB; se mencionan checkpoints `.pt` en la card) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. La model card describe un esquema de memoria con 16 memory tokens adaptativos y un prefijo de 128, lo que sugiere un transformer con tokens de memoria aprendidos que se concatenan al contexto de la política. El checkpoint parte de un entrenamiento previo de 20.000 pasos (`rmbenchpp_v021_put-back-block-relocate_sgres_1x8_20k_20260923_r3`) y se refina en dos etapas: p2 con 2.000 pasos conjuntos sobre 1x8 A800 y LR 1e-4, y p3 con 1.000 pasos exclusivamente de memoria desde `p2/step_002000.pt`.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o aprendizaje por imitación. El código asociado se referencia como `research-marina/v16.3_memory_tokens_speed_opt_rmbenchpp_relocate_cards` en el commit `32029919`, lo que apunta a un repositorio de investigación interno o privado no enlazado públicamente.

## Capacidades

- Ejecución de la tarea `put-back-block-relocate` del benchmark RMBench++ (RoboDojo v1.0.0).
- Uso de memoria a largo plazo mediante 16 memory tokens adaptativos con prefijo de 128, orientado a tareas que requieren recordar estados previos.
- Entrenamiento por fases con refinamiento específico de la memoria (p3 "memory-only").
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.
- No se declara soporte de thinking mode, audio ni otras modalidades.

## Casos de uso

- Investigación en manipulación robótica: evaluar la política sobre la tarea `put-back-block-relocate` de RMBench++ para reproducir o comparar resultados con la línea base `rmbenchpp_v021`.
- Estudio de mecanismos de memoria: analizar el efecto de 16 memory tokens adaptativos con prefijo 128 frente a variantes sin memoria o con distinto número de tokens.
- Ablación de fases de entrenamiento: comparar p1, p2 y p3 para aislar la contribución del refinamiento conjunto y del refinamiento "memory-only".
- Reproducibilidad de experimentos: servir como checkpoint de referencia para validar pipelines de entrenamiento en 1x8 A800 con LR 1e-4.
- Benchmarking de políticas robóticas: integrar el checkpoint en el harness de RoboDojo v1.0.0 para medir éxito en la tarea de reubicación de bloques.
- Desarrollo de sistemas con memoria episódica: usar el esquema de memory tokens como base para tareas de manipulación que requieren recordar posiciones u objetos vistos previamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo ocupa 27,6 GB, lo que da una cota inferior orientativa del espacio en disco necesario para los pesos.
- GPU recomendadas: el entrenamiento se realizó en 1x8 A800, por lo que se asume compatibilidad con GPUs de clase A800/A100/H100 para reproducción.
- ¿Cabe en GPU consumer?: no disponible; sin conocer el número de parámetros ni el formato de pesos no puede confirmarse.
- Opciones de despliegue: no disponibles (no se documenta vLLM, llama.cpp, Ollama ni TGI; al ser un checkpoint de política robótica, el despliegue dependería del harness de RoboDojo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kairos_rmbenchpp_put_back_block_relocate_16v3_p2p3 | no disponible | prefijo 128 + 16 memory tokens | no disponible | no disponible | HuggingFace (`m1b/...`) |
| rmbenchpp_v021_put-back-block-relocate_sgres_1x8_20k_20260923_r3 | no disponible | no disponible | no disponible | no disponible | referenciado como base, no enlazado |
| Otros checkpoints de RMBench++ | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda sin autorización explícita y debe considerarse restringido hasta confirmación del autor.
- El modelo está especializado en una única tarea (`put-back-block-relocate`) y no es un modelo de propósito general.
- No hay información sobre sesgos, robustez ni tasa de alucinación; en robótica, el equivalente sería el riesgo de ejecutar acciones incorrectas fuera de la distribución de entrenamiento.
- El checkpoint depende del harness y la versión de RoboDojo v1.0.0; cambios en el entorno pueden invalidar los resultados.
- El código de referencia (`research-marina/v16.3_...`) no está enlazado públicamente en la información disponible, lo que dificulta la reproducibilidad.
- El repositorio no tiene descargas ni likes y fue creado en octubre de 2026, por lo que no hay validación comunitaria.
- La model card no documenta el formato exacto de los pesos ni los parámetros del modelo, lo que complica su integración en pipelines estándar.

## Enlaces

- HuggingFace: https://huggingface.co/m1b/kairos_rmbenchpp_put_back_block_relocate_16v3_p2p3
- Código referenciado en la model card: `research-marina/v16.3_memory_tokens_speed_opt_rmbenchpp_relocate_cards` @ `32029919` (sin URL pública disponible)
- Checkpoint base referenciado: `rmbenchpp_v021_put-back-block-relocate_sgres_1x8_20k_20260923_r3/outputs/checkpoints/weights/step_020000.pt` (sin URL pública disponible)
