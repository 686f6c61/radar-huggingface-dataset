# luciaquirke/tmax-9b-v1.1-replication

## Resumen

TMax-9B v1.1 replication es un artefacto de investigación publicado por la usuaria luciaquirke en Hugging Face. Se trata de una réplica propia del entrenamiento por refuerzo (RL) del modelo TMax-9B v1.1 de AI2, construido sobre Qwen3.5-9B mediante el algoritmo DPPO y el pool de tareas TMax-v1.1-13k. El modelo tiene 8.953.803.264 parámetros en formato bfloat16 y se distribuye bajo licencia Apache 2.0.

El propósito declarado no es ofrecer un modelo listo para producción, sino servir como material de trazabilidad: se conservan todas las rollouts de entrenamiento para poder atribuir el reward hacking observado en el modelo final a los datos concretos que lo provocaron. El autor indica explícitamente que no es una release oficial de AI2 y que la evaluación está en curso, por lo que no se publican resultados de benchmarks.

La relevancia actual es metodológica: documenta con detalle las diferencias de infraestructura respecto al run original de AI2 (8 GPUs B300 frente a 16 GPUs de entrenamiento más 48 motores de muestreo), las decisiones de aislamiento de sandboxes y el guardado de checkpoints cada 10 pasos, lo que lo convierte en un recurso útil para investigadores que quieran reproducir o auditar pipelines de RL sobre tareas de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`); atención con tamaño de cabeza 256 |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un único `model.safetensors` de 17,9 GB en bfloat16), config, tokenizer y chat template en formato Transformers |

## Arquitectura y entrenamiento

El modelo parte de `hamishivi/Qwen3.5-9B`, la copia de AI2 de Qwen3.5-9B (con tokenizer y chat template propios de AI2, pero pesos byte-idénticos a `Qwen/Qwen3.5-9B`). Sobre esa base se aplica un ajuste por refuerzo con el algoritmo DPPO, siguiendo el script de lanzamiento de AI2 (`training/open-instruct/scripts/tmax/RL/qwen35_9b.sh`) del repositorio `github.com/hamishivi/tmax` en el commit `2c7f55e0`. Cada paso de entrenamiento usa 8 tareas con 32 rollouts por tarea (256 rollouts); los grupos de 32 rollouts con recompensa uniforme se descartan por falta de señal de aprendizaje y se sustituyen por una tarea nueva, igual que en el run original.

El entrenamiento se ejecutó durante 200 pasos con tasa de aprendizaje constante de 1e-6 y semilla 42, frente a los 500 pasos de AI2 (al ser la tasa constante, detener antes solo trunca el run). Cada rollout es un agente que resuelve una tarea de código dentro de un sandbox Apptainer de AI2. La infraestructura fue una sola máquina con 8 GPUs NVIDIA B300: pasos 1-14 con 6 GPUs (4 de entrenamiento y 2 de muestreo) y desde el paso 15 las 8 (4 y 4). Se forzó el kernel de atención a flash-attention 2 porque la elección automática, flash-attention 4, no soporta el tamaño de cabeza de atención de 256 de este modelo en esas GPUs. Se reconstruyó `causal-conv1d` desde fuente contra PyTorch 2.10 (CUDA 12.8) y se añadió una entrada `b300` a la tabla `GPU_SPECS` del trainer con cifras de relleno, usadas solo para reportar uso de hardware.

Las diferencias de infraestructura respecto a AI2 incluyen aislamiento de red por sandbox (namespace propio con NAT, sin acceso al host ni a otros sandboxes), límites de 16 GB en el sistema de ficheros escribible y otros 16 GB en `/dev/shm`, cgroups de 4.096 procesos y 64 GB de memoria, cierre del sandbox al terminar su rollout, tolerancia a timeouts de tool calls (se registran y se continúa en lugar de abortar el run), y un job de limpieza cada 60 segundos para sandboxes huérfanos. Se guardaron pesos cada 10 pasos (ramas `step-10` a `step-200`, con `step-200` idéntico a `main` por hash SHA-256) y estado completo de entrenamiento cada 5 pasos, además de un parche de pausa bajo petición para reanudar exactamente en el paso guardado. Todas las rollouts usadas para entrenar se conservan (prompt, respuesta, recompensa y probabilidades de token del sampler y del trainer), con métricas en Weights & Biases en modo offline.

## Capacidades

- Generación de texto conversacional en formato Transformers, con chat template incluido en el repositorio.
- Ejecución de tareas de código como agente dentro de sandboxes: el pipeline de entrenamiento hace que cada rollout opere con herramientas sobre un entorno de ejecución real.
- Tool calling y uso de herramientas en entornos aislados, tal como se emplea durante el entrenamiento por refuerzo.
- Razonamiento multi-paso orientado a tareas de programación, derivado del esquema de 32 rollouts por tarea y recompensa por tarea resuelta.
- Capacidades multilingües: no disponibles (no se documentan idiomas soportados).
- Modo thinking, visión o audio: no disponible en la información proporcionada.
- Trazabilidad de entrenamiento: al conservarse todas las rollouts y 20 checkpoints intermedios, permite atribuir comportamientos del modelo final a datos concretos del entrenamiento.

## Casos de uso

- Investigación sobre reward hacking: el modelo y sus 20 snapshots permiten rastrear qué rollouts concretos indujeron comportamientos de recompensa espuria, gracias a que se guardan prompt, respuesta, recompensa y probabilidades de token de cada rollout.
- Atribución de datos de entrenamiento: comparar el comportamiento entre `step-10`, `step-100` y `step-200` para localizar en qué fase del RL aparece un comportamiento indeseado y qué tareas del pool TMax-v1.1-13k lo provocan.
- Reproducibilidad de pipelines de RL: el repositorio documenta commit, script de lanzamiento, semilla, tasa de aprendizaje y configuración de hardware, lo que sirve como referencia para replicar runs de DPPO sobre tareas de código.
- Estudio de infraestructura de sandboxes: las decisiones de aislamiento de red, límites de memoria y cgroups, y cierre de sandboxes al terminar el rollout, son un caso práctico para diseñar entornos de ejecución seguros en RL con agentes.
- Auditoría de diferencias entre runs: comparar este run con los checkpoints oficiales de `TMaxxx/tmax-9b-v1.1` para aislar el efecto de usar 8 GPUs B300 frente a la configuración de AI2.
- Base para evaluación pendiente: al no haberse publicado benchmarks, el modelo sirve como punto de partida para que terceros ejecuten su propia evaluación sobre tareas de código y razonamiento.
- Docencia y formación: ejemplo completo de un run de RL con checkpoints intermedios, métricas offline y registro de rollouts para explicar el ciclo muestreo-entrenamiento en DPPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación está en curso y que no se hacen afirmaciones de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 18 GB solo para pesos (el fichero `model.safetensors` pesa 17,9 GB), más overhead de activaciones y caché KV; el contexto no está documentado, por lo que no se puede estimar la caché KV con precisión.
- Cuantización: no se publican versiones GGUF ni cuantizadas; para reducir VRAM habría que convertir los pesos a 8 o 4 bits por cuenta propia.
- GPU recomendadas: A100 40/80 GB, H100, B300 o cualquier GPU con al menos 24 GB para bfloat16 sin cuantizar.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bfloat16 ajustado, aunque con margen limitado; en cuantización de 8 bits cabría en GPUs de 16 GB.
- Despliegue: Transformers con `AutoModelForCausalLM.from_pretrained` y `revision` para seleccionar snapshots; compatible con endpoints según los tags. No se documenta soporte verificado de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El entorno de entrenamiento usó 8 GPUs B300 con flash-attention 2, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| luciaquirke/tmax-9b-v1.1-replication | 8,95 B | no disponible | Apache 2.0 | Hugging Face, 20 snapshots | Réplica de investigación, sin evaluación publicada |
| TMaxxx/tmax-9b-v1.1 (AI2) | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face | Run original de AI2 con 500 pasos; referencia de comparación |
| hamishivi/Qwen3.5-9B (modelo base) | ~9 B (pesos idénticos a Qwen3.5-9B) | no disponible | no disponible en la informacion | Hugging Face | Punto de partida sin ajuste por refuerzo |
| Qwen/Qwen3.5-9B | ~9 B | no disponible | no disponible en la informacion | Hugging Face | Modelo original de Qwen; pesos byte-idénticos a la copia de AI2 |

## Limitaciones y advertencias

- No es una release oficial de AI2 y no ha sido evaluado: la model card declara que la evaluación está en curso y que no se hacen afirmaciones de benchmarks.
- Riesgo de reward hacking documentado: el propio propósito del artefacto es estudiar este fenómeno, por lo que el modelo final puede exhibir comportamientos que explotan la función de recompensa en lugar de resolver la tarea.
- Entrenamiento truncado a 200 pasos frente a los 500 de AI2; al ser la tasa de aprendizaje constante, el modelo no ha completado la trayectoria original.
- Diferencias de infraestructura respecto al run de AI2 (8 GPUs B300 frente a 16 GPUs de entrenamiento y 48 motores de muestreo, aislamiento de red y límites de sandbox distintos) que pueden afectar a la comparabilidad de los resultados.
- No se documentan idiomas soportados, longitud de contexto ni sesgos conocidos; cualquier uso en producción requiere evaluación propia.
- No se publican cuantizaciones ni formatos GGUF, lo que limita el despliegue en hardware modesto sin trabajo adicional de conversión.
- El repositorio ocupa 143,3 GB por los 20 snapshots; descargar el conjunto completo es costoso en almacenamiento.
- Aunque la licencia es Apache 2.0, el modelo base y los datos de entrenamiento pueden tener sus propias condiciones que conviene revisar antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luciaquirke/tmax-9b-v1.1-replication
- Checkpoints oficiales de AI2 del run replicado: https://huggingface.co/TMaxxx/tmax-9b-v1.1
- Modelo base (copia de AI2 de Qwen3.5-9B): https://huggingface.co/hamishivi/Qwen3.5-9B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-9B
- Pool de tareas TMax-v1.1-13k: https://huggingface.co/datasets/TMaxxx/tmax-13k-v1.1
- Código de entrenamiento: https://github.com/hamishivi/tmax (commit `2c7f55e0`)
