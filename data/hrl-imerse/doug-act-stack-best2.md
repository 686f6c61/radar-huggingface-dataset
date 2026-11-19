# hrl-imerse/doug-act-stack-best2

## Resumen

BEST2 (`hrl-imerse/doug-act-stack-best2`) es una política de control robótico basada en la arquitectura ACT (Action Chunking Transformer) entrenada para la tarea de apilado de bloques con un brazo real. No es un modelo de lenguaje: es un modelo de imitación (imitation learning) que mapea observaciones (estado articular de 6 dimensiones y una imagen de cámara de muñeca de 480x640 a 30 fps) a acciones (6 dimensiones: objetivos articulares absolutos en grados más apertura de pinza 0-100). Lo desarrolla el usuario hrl-imerse en el contexto de un proyecto de investigación sobre manipulación robórica con SO-101.

El modelo tiene 51.668.614 parámetros (unos 51,7 M) y un tamaño de repositorio de 0,2 GB en formato safetensors. Se trata de un checkpoint fine-tuneado durante 10.000 pasos a partir de una base de 60.000 pasos, combinando 50 demostraciones de teleoperación con 72 correcciones DAgger de ronda 1 y 32 de ronda 2. Según la model card, es la "mejor política de apilado con brazo real" del proyecto y el punto de partida recomendado para nuevos experimentos.

Su relevancia es acotada pero concreta: documenta un flujo completo de entrenamiento por imitación con correcciones humanas iterativas (DAgger) sobre hardware real, incluyendo recetas de fine-tune, evaluación con ensamblado temporal y lecciones aprendidas sobre qué rondas de corrección ayudan y cuáles perjudican. Es un caso de estudio útil para quien trabaje en robótica de imitación con LeRobot, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; chunk de acción de 100 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; incluye una cadena de tarea en inglés: "Stack the orange, green and purple blocks into a tower.") |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política emplea ACT, un transformer diseñado para imitación visomotora que predice *chunks* de acciones (100 pasos por chunk) a partir de observaciones. La entrada combina `observation.state` (6 dimensiones), `observation.images.wrist` (480x640x3, 30 fps, solo cámara de muñeca) y una cadena de tarea textual. La salida son 6 dimensiones de acción: objetivos articulares absolutos en grados más la pinza en escala 0-100. El entrenamiento base (`act_stack_v3`) usó chunk 100, batch 8, aumento de imagen activado, precisión mixta bf16 y 100.000 pasos sobre 50 demostraciones de teleoperación; el checkpoint de 60.000 pasos fue el mejor sobre el brazo real (val loss 0,2375).

Sobre esa base se aplicó un proceso iterativo de DAgger. La ronda 1 añadió 72 correcciones (agarres y elección de bloque incorrecta) y se fine-tuneó desde el paso 60.000 durante 10.000 pasos sobre [72 correcciones + 50 demos], dando BEST (val 0,2275). La ronda 2 añadió 32 correcciones cortas de liberación (abrir y levantar 0,5-1 s tras depositar el bloque) y se fine-tuneó de nuevo desde 60.000 durante 10.000 pasos sobre [72 r1 + 32 r2 + 50 demos], produciendo BEST2 (val 0,2295). Una ronda 3 con 24 correcciones obtuvo la val loss más baja (0,2251) pero peor rendimiento en el brazo, por lo que se descartó. El fine-tune tarda unos 10 minutos en una RTX 3500 Ada de portátil a ~17 pasos/s. La inferencia se ejecuta con ensamblado temporal (`n_action_steps=1`, `temporal_ensemble_coeff=0.01`) y episodios de 90 s.

## Capacidades

- Apilado de bloques con brazo real: orden fijo rojo/naranja -> verde -> púrpura, con los tres bloques partiendo de una línea de tres ranuras a la derecha de la bandeja y colores barajados.
- Control visomotor a partir únicamente de cámara de muñeca y estado articular.
- Predicción de chunks de acción de 100 pasos con ensamblado temporal para suavizar la ejecución.
- Liberación del bloque tras 0,6-0,8 s desde que aterriza, comportamiento aprendido de las demostraciones.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingües: no disponible (no es un modelo de lenguaje).
- Capacidades especiales: corrección humana en bucle mediante DAgger; no dispone de modo *thinking*, visión general, audio ni otras modalidades.

## Casos de uso

- Apilado de bloques en banco de pruebas: ejecutar la política sobre el brazo SO-101 con `go_home.py` seguido de `3_eval_rollouts.sh <variante> <dir> ens 1` para reproducir la tarea de torre de tres bloques en episodios de 90 s.
- Punto de partida para nuevos experimentos de apilado: fine-tunear desde BEST2 (`--policy.path`) durante 2.500-5.000 pasos en lugar de reentrenar desde cero, conservando los datos reales de `doug-stack-v3-best2-train` para evitar olvido catastrófico.
- Incorporación de datos de simulación: añadir episodios simulados de Antony (`assignment2/sim`, `--task stack`) que respeten el formato real (640x480 con distorsión de lente, mismas unidades y orden de articulaciones, misma cadena de tarea) y validar en el brazo real, no por val loss.
- Recolección de correcciones DAgger: usar `dagger_loop.sh <nombre> <dir>` para grabar intervenciones con el brazo líder (calibración `so_leader`) y construir nuevas rondas centradas en un único fallo.
- Estudio de metodología de imitación: comparar el efecto de rondas DAgger sucesivas (r1 y r2 ayudan, r3 perjudica pese a menor val loss) como evidencia de que la validación offline no predice el rendimiento en hardware.
- Evaluación de robustez ante fallos de percepción: probar el comportamiento con cámara de muñeca bloqueada, un fallo documentado que hizo correr varios ensayos a ciegas, para medir la dependencia de la señal visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados en la información disponible. Los únicos datos cuantitativos son de validación interna y de ejecución en el brazo:

| Metrica | BEST (r1) | BEST2 (r2) | Ronda 3 (referencia) |
|---|---|---|---|
| Val loss | 0,2275 | 0,2295 | 0,2251 |
| Checkpoint base | 60k + 10k fine-tune | 60k + 10k fine-tune | 60k + 10k fine-tune |
| Correcciones DAgger | 72 | 72 + 32 | 72 + 32 + 24 |
| Rendimiento en brazo real | Apila los 3 bloques, pero retiene 20-40 s sin abrir | Libera a los 0,6-0,8 s; "casi perfecto, pero no del todo" | Claramente peor que BEST2 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros el modelo es muy pequeño y cabe holgadamente en cualquier GPU consumer, aunque la cifra exacta no se publica.
- GPU recomendadas: el entrenamiento de fine-tune se documenta en una RTX 3500 Ada de portátil (~10 min, ~17 pasos/s, bf16). Para inferencia no se especifica GPU concreta.
- Cabe en GPU consumer: sí, por tamaño de parámetros; no se detalla el mínimo exacto.
- Opciones de despliegue: LeRobot (`lerobot-train` / `train_fast.py` con `torch.compile`); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: ~17 pasos/s en entrenamiento con RTX 3500 Ada; latencia de inferencia en el brazo no disponible. Episodios limitados a 90 s con ensamblado temporal (coeff 0,01).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BEST2 (`doug-act-stack-best2`) | 51,7 M | chunk 100 | Libera a 0,6-0,8 s; mejor política real del proyecto | no disponible | Hugging Face |
| BEST (`doug-act-stack-best1`) | no disponible | chunk 100 | Apila pero retiene 20-40 s sin abrir | no disponible | Hugging Face |
| Ronda 3 (`doug-stack-dagger-r3`) | no disponible | chunk 100 | Val loss 0,2251 pero peor en brazo | no disponible | Hugging Face |
| Base 60k (`act_stack_v3`) | no disponible | chunk 100 | Val loss 0,2375; peor que las versiones con DAgger | no disponible | Referenciado en la model card |

No se dispone de comparación con políticas externas (por ejemplo, otras arquitecturas de imitación) en la información proporcionada.

## Limitaciones y advertencias

- Tarea extremadamente específica: solo apila tres bloques en orden fijo rojo/naranja -> verde -> púrpura; no generaliza a otras tareas ni objetos sin reentrenamiento.
- Dependencia total de la cámara de muñeca: una lente bloqueada provoca ejecuciones a ciegas, según se documenta.
- La val loss no predice el rendimiento real: la ronda 3 tuvo la menor pérdida de validación y fue claramente peor en el brazo. La evaluación debe hacerse en hardware.
- Reentrenar desde el checkpoint de 60k en cada ronda introduce varianza entre ejecuciones; se recomienda fine-tunear desde BEST2.
- Riesgo de olvido catastrófico si se añaden datos de simulación sin mantener la mezcla de datos reales de BEST2.
- Las estadísticas del normalizador provienen del checkpoint de BEST2; si los datos nuevos desplazan los rangos de estado/acción hay que revisar `policy_preprocessor_step_3_normalizer_processor.safetensors`.
- El listener de teclas de LeRobot es global: escribir en cualquier ventana (incluido un chat) puede terminar o descartar ensayos.
- Licencia no disponible: no puede confirmarse el uso comercial.
- Sesgos conocidos y riesgo de alucinación: no disponibles en el contexto de un modelo de control; el fallo relevante es el comportamiento erróneo en el brazo (agarre de bloque equivocado, retención del bloque).
- Idiomas y contexto: no aplica; la única cadena textual es la instrucción de tarea en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hrl-imerse/doug-act-stack-best2
- Dataset de entrenamiento de BEST2: https://huggingface.co/datasets/hrl-imerse/doug-stack-v3-best2-train
- Demostraciones originales de teleoperación: https://huggingface.co/datasets/hrl-imerse/doug-stack-v3-trimmed
- Correcciones DAgger ronda 1: https://huggingface.co/datasets/hrl-imerse/doug-stack-dagger-r1
- Correcciones DAgger ronda 2: https://huggingface.co/datasets/hrl-imerse/doug-stack-dagger-r2
- Correcciones DAgger ronda 3: https://huggingface.co/datasets/hrl-imerse/doug-stack-dagger-r3
- Modelo BEST (ronda 1): https://huggingface.co/hrl-imerse/doug-act-stack-best1
