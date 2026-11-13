# joonyeongs/cosmos3-edge-policy-droid-privileged-phases-cosmos3-replay-full-ft-1k

## Resumen

Cosmos3-Edge-Policy-DROID con *replay* de fases es un ajuste fino del modelo de política robótica `nvidia/Cosmos3-Edge-Policy-DROID` publicado por el usuario `joonyeongs`. No se trata de un modelo de lenguaje generalista, sino de un *policy model* que, a partir de observaciones visuales y una instrucción en lenguaje natural, predice *chunks* de acciones conjuntas (32 pasos) para un robot manipulador en el entorno RoboLab/DROID. El modelo hereda la arquitectura Cosmos3 (torre de entendimiento congelada más generador de difusión con proyecciones `vae2llm` y `llm2vae`) y se distribuye en formato `safetensors` con 3.859.003.312 parámetros (~3,86 B) y un repositorio de 9,2 GB.

La contribución concreta de este checkpoint es la estrategia de muestreo de datos: combina un pool de "fases privilegiadas" (37.516 inicios de clip extraídos solo de segmentos donde el robot ejecutó código privilegiado) con un pool de *replay* de Cosmos3 (22.657 inicios que cubren las seis tareas, incluidas Canned Food y Toy, que no aportan al primer pool). Ambos pools se intercalan con cadencia fija 4:1 (fracción de replay 0,2) durante 1.000 pasos de *full fine-tuning* del generador.

Es relevante porque documenta de forma reproducible una receta de ajuste fino de políticas robóticas sobre hardware asequible (2× A100-80GB durante 6,8 h), con código, dataset y configuración publicados, y porque aborda un problema práctico del entrenamiento por imitación: el desequilibrio entre fases de ejecución exitosa y el resto del episodio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cosmos3 (torre de entendimiento congelada + generador de difusión con `vae2llm`/`llm2vae`, time embedder y fronteras de acción DROID) |
| Parámetros totales | 3.859.003.312 (~3,86 B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16/safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | OpenMDW-1.1 (heredada del modelo base; `license: other`) |
| Formato de pesos | safetensors (`transformer/diffusion_pytorch_model-0000{1,2}-of-00002.safetensors`) |
| Modelo base | nvidia/Cosmos3-Edge-Policy-DROID (revisión `0110e64ca982589f1a3d856cbdd7d465dccb79bc`) |
| Dataset de ajuste | joonyeongs/cosmos3-edge-harness-privileged-phases-150 |
| Dominio | `droid_lerobot`, 15 fps de condicionamiento, chunk de 32 acciones |
| VAE externo en inferencia | Wan-AI/Wan2.2-TI2V-5B |

## Arquitectura y entrenamiento

El modelo mantiene exactamente el *layout* del checkpoint base. El ajuste fino es de tipo *generator full fine-tuning*: se entrenan todos los pesos del lado del generador (atención, MLP y normas del generador, proyecciones `vae2llm` y `llm2vae`, time embedder, fronteras de acción DROID y *modality embedding*), mientras que la torre de entendimiento y `k_norm_und_for_gen` permanecen congeladas, de modo que las claves/valores de texto se sirven desde caché. Los tensores entrenados sustituyen a los publicados manteniendo su dtype original; la procedencia y los hashes están en `robolab_finetune.json`.

El entrenamiento usa dos pools de datos. El pool privilegiado contiene 37.516 inicios de clip de cuatro tareas (Red Items, Cartons, Bottles y Stack), ya que Canned Food y Toy tienen rangos vacíos en ese conjunto. El pool de *replay* de Cosmos3 aporta 22.657 inicios de ventana que arrancan en pasos que la política base ejecutó realmente, cubriendo las seis tareas. Se intercalan en proporción 4:1 (32 frames/acciones futuras por clip), lo que produce 51.200 ventanas privilegiadas y 12.800 de replay en 1.000 pasos. Hiperparámetros: batch global 64 (2 GPUs × 32 × acumulación 1), LR 2e-5 con *warmup* lineal de 50 pasos y decaimiento lineal hasta 0, FusedAdam, BF16, FSDP a 2 vías, *selective activation checkpointing* y `torch.compile`. El coste total fue de 6,8 h en 2× A100-80GB.

## Capacidades

- Predicción de acciones robóticas: genera *chunks* de 32 pasos de posiciones articulares conjuntas a partir de observaciones visuales y una instrucción de tarea.
- Condicionamiento multimodal: consume frames de vídeo (vía el VAE Wan2.2) y texto de instrucción en el dominio DROID.
- Ejecución de tareas de manipulación en RoboLab: apilar, clasificar objetos por color o tipo y depositarlos en contenedores (canned food, lizard, red items, cartons, bottles, stack).
- Servido como servicio de política: compatible con `cosmos_framework.scripts.action_policy_server_robolab` con formato de prompt JSON y `guidance-interval 960 1001`.
- No se documentan capacidades de *tool calling*, agentes multi-paso, razonamiento general, matemáticas ni generación de texto libre; es un modelo especializado, no un LLM de propósito general.
- Capacidades multilingües: no disponibles.

## Casos de uso

- **Evaluación cerrada en RoboLab**: desplegar el checkpoint con `action_policy_server_robolab` y medir tasas de éxito por tarea en el simulador, comparando contra el modelo base y contra el run de 500 pasos. El modelo está entrenado específicamente para este *benchmark*.
- **Investigación en entrenamiento por imitación con fases privilegiadas**: usar la receta y el dataset como referencia reproducible para estudiar cómo el filtrado por segmentos de código privilegiado afecta a la política resultante, con código y configuración TOML publicados.
- **Estudio de *replay* de política base**: analizar el efecto de mezclar ventanas de *replay* (4:1) sobre tareas con escasez de datos privilegiados (Canned Food y Toy), que solo contribuyen a través de este pool.
- **Ajuste fino sobre dominio DROID**: partir de este checkpoint como inicialización para nuevas tareas de manipulación en el mismo dominio `droid_lerobot`, reutilizando el *layout* exacto del repositorio y el VAE externo.
- **Validación de exportación y *sanity checks***: emplear el procedimiento de MAE sobre frames del dataset de entrenamiento (media 0,0847 rad) como test de integridad del *pipeline* antes de lanzar evaluaciones cerradas costosas.
- **Reproducción de *full fine-tuning* en hardware modesto**: replicar el entrenamiento en 2× A100-80GB (6,8 h) siguiendo la rama `robolab-droid-train-edge-privileged-phases` del repositorio de código.

## Benchmarks y rendimiento

No se han publicado resultados de *benchmarks* de éxito de tarea en la información disponible; el autor indica explícitamente que la evaluación cerrada en RoboLab aún no se ha realizado. El único dato numérico es una comprobación de exportación (no una evaluación de política) que compara los *chunks* predichos con las acciones demostradas:

| Episodio | Frame | Tarea | MAE (rad) |
|---|---|---|---|
| 0 | 0 | Put the canned food in the grey bin | 0,1213 |
| 0 | 154 | Put the canned food in the grey bin | 0,1331 |
| 25 | 0 | Put the lizard away in the bin | 0,0681 |
| 25 | 139 | Put the lizard away in the bin | 0,0636 |
| 50 | 0 | Put all the red things in the grey bin | 0,0830 |
| 50 | 326 | Put all the red things in the grey bin | 0,0925 |
| 75 | 0 | Put the cartons that can be recycled in the vertical crate | 0,0855 |
| 75 | 442 | Put the cartons that can be recycled in the vertical crate | 0,0306 |
| | | **Media** | **0,0847** |

Todas las salidas fueron finitas. No hay comparación numérica publicada contra el modelo base ni contra el run de 500 pasos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita. Con ~3,86 B parámetros en BF16, los pesos ocupan aproximadamente 7,7 GB; el repositorio completo son 9,2 GB, a lo que se suma la descarga del VAE Wan2.2-TI2V-5B en tiempo de inferencia.
- **GPU recomendadas**: el autor no especifica requisitos de inferencia. El entrenamiento se realizó en 2× A100-80GB con FSDP a 2 vías.
- **GPU de consumo**: no confirmado. Por tamaño de pesos, cabría en GPUs con 16-24 GB de VRAM, pero no hay validación publicada.
- **Opciones de despliegue**: servidor oficial de RoboLab (`python -m cosmos_framework.scripts.action_policy_server_robolab`) con `--format-prompt-as-json True --guidance-interval 960 1001`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (replay, 1k pasos) | ~3,86 B | no disponible | 1.000 pasos, pools privilegiado + replay 4:1 | OpenMDW-1.1 | Hugging Face, 0 descargas |
| joonyeongs/cosmos3-edge-policy-droid-privileged-phases-cosmos3-replay-full-ft-500 | ~3,86 B (mismo *layout*) | no disponible | 500 pasos, misma receta | OpenMDW-1.1 | Hugging Face |
| joonyeongs/cosmos3-edge-policy-droid-privileged-phases-full-ft-500 | ~3,86 B (mismo *layout*) | no disponible | 500 pasos, sin *replay* | OpenMDW-1.1 | Hugging Face |
| nvidia/Cosmos3-Edge-Policy-DROID (base) | ~3,86 B | no disponible | Política base DROID | OpenMDW-1.1 | Hugging Face (NVIDIA) |

No se dispone de datos de rendimiento comparativo entre estas variantes; la única diferencia documentada es la estrategia de muestreo y el número de pasos.

## Limitaciones y advertencias

- **Sin evaluación de éxito de tarea**: el autor declara explícitamente que la evaluación cerrada en RoboLab no se ha realizado; el MAE de 0,0847 rad es una comprobación de exportación, no una medida de éxito.
- **Especialización estrecha**: el modelo solo predice acciones para el dominio `droid_lerobot` a 15 fps con *chunks* de 32 pasos; no es utilizable como modelo de lenguaje ni fuera de ese dominio sin nuevo ajuste.
- **Cobertura de datos desequilibrada**: Canned Food y Toy no aportan inicios al pool privilegiado y dependen exclusivamente del *replay*; su comportamiento puede ser menos fiable.
- **Dependencia del VAE externo**: la inferencia descarga `Wan-AI/Wan2.2-TI2V-5B`, lo que añade requisitos de red y almacenamiento no incluidos en los 9,2 GB del repositorio.
- **Licencia OpenMDW-1.1**: es una licencia de tipo "other" heredada del modelo base; deben revisarse sus términos antes de cualquier uso comercial.
- **Sesgos**: no documentados en la información disponible; al entrenarse sobre un dataset reducido (seis tareas, 25 episodios exitosos por tarea), es esperable un sesgo hacia las condiciones de esos episodios.
- **Riesgo de alucinación de acciones**: no evaluado; en políticas de imitación, la generalización fuera de distribución puede producir trayectorias no válidas.
- **Reproducibilidad**: requiere la rama `robolab-droid-train-edge-privileged-phases` (commit `95bad15`) del repositorio de código y la variable `COSMOS_DROID_COSMOS3_REPLAY=1`.
- **Madurez**: 0 descargas y 0 *likes* en el momento de la consulta; no hay validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-privileged-phases-cosmos3-replay-full-ft-1k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de ajuste: https://huggingface.co/datasets/joonyeongs/cosmos3-edge-harness-privileged-phases-150
- Run de 500 pasos con replay: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-privileged-phases-cosmos3-replay-full-ft-500
- Run de 500 pasos sin replay: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-privileged-phases-full-ft-500
- Código de entrenamiento: https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- VAE Wan2.2: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
