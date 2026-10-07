# LafouCC/PG-Personalization-ckpt

## Resumen

PG-Personalization-ckpt es el repositorio de checkpoints y artefactos de evaluación del proyecto PG-Personalization, publicado por el usuario LafouCC. No se trata de un modelo de lenguaje convencional, sino de un *parameter generator* (PG): una hiperred compartida que, en una única pasada forward, mapea el historial de un usuario a una LoRA específica de ese usuario sobre un backbone Qwen2.5-7B-Instruct congelado. El objetivo es la personalización estricta sin fine-tuning por usuario y sin optimización en tiempo de inferencia.

El repositorio empaqueta varias "armas" de entrenamiento: dos variantes entrenadas sobre el corpus P2P de 10 tareas (t9_v5o2 con pérdida de gap y t9_v5o3 sin ella, como ablación), una variante entrenada sobre episodios de reseñas de Amazon-2023 (t10_a23_v5o3), los adaptadores compartidos (`G` y `G`-ctrl) sobre los que el PG opera como residual, y un directorio `eval/` con predicciones, pruebas de transferencia, informes de geometría y sondas de enrutamiento. El tamaño declarado del repositorio en la página de HuggingFace es de 1468,2 GB, aunque la model card solo detalla del orden de 6,6 GB en artefactos publicados.

Su relevancia es de investigación: demuestra que una condición derivada del historial del usuario mueve de forma medible las métricas frente a condiciones aleatorizadas o eliminadas, y documenta con precisión los detalles de reproducibilidad (configuración de arquitectura, `merge_id` del backbone fusionado y corpus no público) que suelen quedar fuera de las publicaciones de este tipo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hiperred generadora de parámetros (PG) sobre backbone transformer congelado; troncal `PG_ARCH=v5s`, con `decode_head: per_site` y RoPE desactivado en self-attention y cross-attention en la variante v5o2 |
| Parametros totales | No disponible (los checkpoints del PG publicados ocupan 3,1 GB cada uno; no se declara el recuento) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada; la receta de evaluación usa `max_prompt_len 1024`, `max_condition_tokens 4096` y `max_new_tokens 1024` |
| Tipos de cuantizacion | No disponible (no se publican pesos GGUF ni variantes cuantizadas) |
| Idiomas soportados | No disponible (no declarados para este checkpoint; el backbone es Qwen2.5-7B-Instruct) |
| Licencia | No disponible |
| Formato de pesos | Safetensors para los adaptadores LoRA (`best/`); PyTorch `.pt` para los checkpoints del PG (`pg_best_step*.pt`) y `shared_lora.pt` |

## Arquitectura y entrenamiento

El sistema se compone de tres piezas. Primero, un backbone Qwen2.5-7B-Instruct congelado, en el que se ha fusionado previamente un adaptador de tarea compartido `G` (LoRA de rango 8), dando lugar a un base fusionado de ~15 GB que no se publica por ser reproducible a partir del backbone original más el adaptador de 10 MB. Segundo, el generador de parámetros propiamente dicho, una hiperred con troncal `v5s` que consume el historial del usuario (condición de hasta 4096 tokens) y emite en una sola pasada forward los pesos de una LoRA por usuario; no hay fine-tuning por usuario ni optimización en test time. Tercero, un adaptador de control `G`-ctrl, emparejado en rango, que sirve como baseline SFT.

El entrenamiento se realizó con pérdida de entropía cruzada más una pérdida de *gap*; la variante `t9_v5o3` es exactamente la misma arma con `--gap_lambda 0`, es decir, la ablación sin pérdida de gap. La pérdida de gap se puntúa contra `share_ce.pt`, el CE por fila de `base+G`, necesario solo para reentrenar. El corpus P2P de 10 tareas no es el público: el historial de `longlamp_product_review` se reconstruyó para incluir el cuerpo de la reseña en lugar del título, de modo que entrenar o evaluar sobre `Zhaoxuan/P2P_data` no reproduce los números reportados. La arma de Amazon se entrenó sobre episodios de reseñas de Amazon-2023 (Stage A) y se evalúa con `scripts/drift_test/eval_pg_temporal.py`. La geometría reportada para `t9_v5o2` es de rango efectivo 6,004 sobre 8 y coseno entre usuarios de 0,572.

Dos detalles de configuración son críticos: `pg_config.json` debe tomarse del propio checkpoint (los cambios entre v5o2 y v5o3 no alteran el número de parámetros, por lo que una configuración incorrecta carga sin error pero puntúa mal), y el `merge_id` del backbone fusionado debe coincidir con el registrado en `train_meta.json` (`af208c939624f71f56ee9dbc8b47c0e4` para `t9_v5o2` y `t9_v5o3`).

## Capacidades

- Generación de texto condicionada al usuario: produce salidas personalizadas a partir de un historial de hasta 4096 tokens, sin reentrenamiento por usuario.
- Personalización vía generación de parámetros: emite una LoRA por usuario en una sola pasada forward sobre un backbone congelado.
- Escritura de reseñas de producto y generación de texto de opinión, evaluada sobre el corpus Amazon-2023.
- Cobertura de 10 tareas del corpus P2P, incluyendo `longlamp_topic_writing`, `longlamp_product_review` y `longlamp_abstract_generation` (estas tres con control de repetición explícito en la receta de evaluación).
- Generalización fuera de distribución: se reportan métricas separadas sobre `random_test` y `ood_test`.
- Transferencia de condición: el repositorio incluye pantallas de transferencia (`transfer_{random,ood}_test.json`) que verifican si la condición del usuario se está usando realmente.
- Sondas de enrutamiento atención-tarea-capa (`attn_task_layer_*.json`) para analizar el enrutamiento contenido-frente-a-posición.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no declaradas para este checkpoint).
- Visión, audio o modo de razonamiento explícito: no disponible.

## Casos de uso

- Investigación en personalización sin fine-tuning: el artefacto permite reproducir el experimento de generar adaptadores LoRA por usuario desde un historial, comparando contra las condiciones `user_shuffle` y `nocross` incluidas en `eval/`, para medir si la condición del usuario aporta señal real.
- Evaluación de hiperredes de generación de parámetros: los checkpoints `t9_v5o2` y `t9_v5o3` constituyen un par controlado (con y sin pérdida de gap) para estudiar el efecto de esa función de pérdida sobre exactitud macro y macro-F1.
- Ablación de rango efectivo en adaptadores generados: los informes de geometría (`liveness_{random,ood}_test/`, rango efectivo 6,004 de 8 y coseno cruzado 0,572) sirven para analizar cuánta capacidad se utiliza realmente en la LoRA generada.
- Generación de reseñas personalizadas a escala: la arma `t10_a23_v5o3` se evaluó sobre los 3.410 usuarios de test de Amazon-2023 y es un punto de partida para sistemas que redactan reseñas o resúmenes ajustados al estilo de cada usuario.
- Estudios de deriva temporal de preferencias: el script `scripts/drift_test/eval_pg_temporal.py` está pensado para evaluar cómo se degrada o mantiene la personalización a lo largo del tiempo en episodios de reseñas.
- Auditoría de fuga de información entre usuarios: las pantallas de transferencia y las condiciones de control (`G`-ctrl, `base+G`, `user_shuffle`, `nocross`) permiten comprobar si el sistema está explotando únicamente la condición del usuario o si hay contaminación cruzada.
- Base para despliegues de personalización ligera: el adaptador compartido `G` ocupa 21 MB y `G`-ctrl 9 MB, lo que permite reconstruir el backbone fusionado y servir la personalización sin almacenar un modelo completo por usuario.

## Benchmarks y rendimiento

P2P, macro sobre las 10 tareas, en `random_test` / `ood_test`:

| Arma | Accuracy | Macro-F1 | ROUGE-L |
|---|---|---|---|
| `t9_v5o2` | 0,7377 / 0,7003 | 0,6721 / 0,6109 | 0,2667 / 0,2656 |
| `t9_v5o3` (sin pérdida de gap) | 0,7137 / 0,6514 | 0,6403 / 0,5531 | 0,2686 / 0,2702 |

Amazon-2023, generación de reseñas, `t10_a23_v5o3`, todos los 3.410 usuarios de test:

| Condición | ROUGE-1 | ROUGE-L | METEOR | BLEU |
|---|---|---|---|---|
| `self` | 0,3168 | 0,1592 | 0,1910 | 0,0190 |
| `user_shuffle` | 0,2851 | 0,1431 | 0,1693 | 0,0118 |
| `nocross` | 0,2874 | 0,1435 | 0,1632 | 0,0115 |
| `base+G` | 0,2853 | 0,1446 | 0,1700 | 0,0129 |

Métricas adicionales reportadas: geometría de `t9_v5o2` con rango efectivo 6,004 sobre 8 y coseno entre usuarios de 0,572; ganancia de +0,139 de accuracy sobre `random` frente a una condición de usuarios barajados. Las tres formas independientes de eliminar la condición del usuario quedan dentro de 0,0015 de ROUGE-L entre sí. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El backbone fusionado con `G` ocupa ~15 GB, reproducible desde Qwen2.5-7B-Instruct más el adaptador LoRA de rango 8.
- Cada checkpoint del PG (`pg_best_step*.pt`) ocupa 3,1 GB; el adaptador `G` compartido, 21 MB; `G`-ctrl, 9 MB; el directorio `eval/`, 0,4 GB.
- La receta de re-inferencia publicada usa `torchrun --standalone --nproc_per_node=8`, es decir, 8 GPUs por ejecución.
- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, el backbone fusionado de ~15 GB requiere al menos ~16 GB en precisión de 16 bits para los pesos, más memoria para activaciones de condición de 4096 tokens y generación de 1024 tokens.
- GPU recomendadas: no disponibles en la información proporcionada. La configuración multi-GPU de 8 nodos apunta a GPUs de clase datacenter (A100, H100 o equivalentes), pero no se confirma.
- Compatibilidad con GPU de consumo: no disponible. El backbone de 7B en cuantización baja cabría teóricamente en RTX 4090 o similares, pero no se documenta ningún camino de cuantización para este artefacto.
- Opciones de despliegue: scripts propios del repositorio de código (`scripts/merge_shared_lora.py`, `scripts/eval_pg.py`, `scripts/drift_test/eval_pg_temporal.py`) con `torchrun`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- El repositorio declara un tamaño de 1468,2 GB en la página de HuggingFace, muy superior a la suma de artefactos descritos en la model card (~6,6 GB). Conviene verificar el espacio en disco antes de descargar.

## Comparativa con modelos similares

No se proporcionan modelos externos comparables en la información disponible. La comparación más rigurosa posible es interna, entre las condiciones y baselines publicados por el propio autor:

| Sistema | Tipo | Resultado de referencia | Licencia |
|---|---|---|---|
| PG `t9_v5o2` | Hiperred + LoRA por usuario sobre backbone congelado | Accuracy 0,7377 / 0,7003 (random / ood) | No disponible |
| PG `t9_v5o3` | Igual, sin pérdida de gap | Accuracy 0,7137 / 0,6514 | No disponible |
| `base+G` | Backbone fusionado con adaptador de tarea compartido | ROUGE-L 0,1446 en Amazon-2023 | No disponible |
| `G`-ctrl | Baseline SFT emparejado en rango | No se reportan métricas directas en la información disponible | No disponible |
| `user_shuffle` / `nocross` | Controles que eliminan la condición del usuario | ROUGE-L 0,1431 / 0,1435 en Amazon-2023 | No disponible |

Como referencia externa, la vía convencional sería un fine-tuning LoRA por usuario sobre Qwen2.5-7B-Instruct, pero no se aportan cifras de ese procedimiento en la información disponible, por lo que no se puede establecer una comparación cuantitativa con modelos o métodos alternativos.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución.
- Artefacto de investigación, no un modelo listo para producción: no hay pipeline declarado, ni demo, ni versiones cuantizadas, ni integración con servidores de inferencia estándar.
- Riesgo de resultados silenciosamente incorrectos: usar un `pg_config.json` de `configs/` en lugar del que acompaña al checkpoint no produce error de carga pero altera la puntuación, porque las claves que definen v5o2 no cambian el número de parámetros.
- Dependencia estricta del `merge_id`: si el backbone fusionado no coincide con `af208c93...` para las armas P2P, el PG se evalúa sobre pesos distintos a los de entrenamiento.
- El corpus P2P utilizado no es el público: `Zhaoxuan/P2P_data` no reproduce los números reportados, ya que el historial de `longlamp_product_review` se reconstruyó con el cuerpo de la reseña en lugar del título.
- `share_ce.pt` está indexado por el índice global de fila del sampler, por lo que solo es válido con los flags exactos de dataset de la ejecución original.
- Solo se publica el mejor checkpoint de cada ejecución; no se incluyen estados de optimizador ni checkpoints intermedios (10 GB cada uno), lo que impide reanudar entrenamientos desde el repositorio.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible. El modelo opera sobre una base instruct de 7B y hereda sus comportamientos de generación.
- Sesgos conocidos: no documentados. Los corpus de P2P y Amazon-2023 pueden introducir sesgos de dominio (reseñas de producto) que no se analizan en la model card.
- Idiomas soportados no declarados: no hay confirmación de comportamiento multilingüe más allá de lo que herede Qwen2.5-7B-Instruct.
- Ventana de contexto no especificada: la receta de evaluación limita prompt a 1024 tokens, condición a 4096 y generación a 1024, pero no se declara el máximo del sistema.
- Sin datos de latencia, throughput ni consumo de VRAM, lo que dificulta planificar un despliegue.
- Discrepancia entre el tamaño del repositorio declarado (1468,2 GB) y los artefactos descritos (~6,6 GB).

## Enlaces

- HuggingFace: https://huggingface.co/LafouCC/PG-Personalization-ckpt
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de código: la model card referencia `https://github.com/…/PG-Personalization`, con la ruta del propietario truncada; el enlace completo no está disponible en la información proporcionada.
- Dataset público de referencia, no equivalente al usado en el entrenamiento: https://huggingface.co/datasets/Zhaoxuan/P2P_data
- Paper: no disponible.
- Blog o demo: no disponible.
