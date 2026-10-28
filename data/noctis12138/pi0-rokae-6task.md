# Noctis12138/pi0-rokae-6task

## Resumen

pi0-rokae-6task es un checkpoint de política visión-lenguaje-acción (VLA) para un brazo bimanual Rokae, publicado por el usuario Noctis12138 en HuggingFace. Se trata de un ajuste fino completo de `pi0_base` de OpenPI sobre el conjunto de datos `rokae_bimanual_6task` (rev `3ef2361`), con 30.000 pasos de entrenamiento, batch 32 y EMA 0,999. El modelo resuelve el problema clásico de las políticas robóticas de imitación: mapear tres cámaras RGB más un prompt de tarea en una secuencia de acciones de 50 pasos para dos brazos, sin necesidad de planificación explícita ni de estado propioceptivo medido.

Su relevancia es doble. Por un lado, es la variante `pi0` de una receta ya publicada en `pi0.5` (`maple0617/pi05-robot32-30k`): misma data, misma normalización, mismos prompts y mismo *action horizon*, de modo que sirve como comparación controlada entre ambas arquitecturas sobre el mismo robot. Por otro, documenta de forma inusualmente detallada el contrato de entrada/salida (claves de observación, normalización, anclaje de la pose, convención del gripper), lo que reduce el trabajo de integración en el robot real.

El autor advierte explícitamente de que el modelo **todavía no se ha probado en hardware real**: las comprobaciones publicadas son de consistencia de pesos y de formato (error normalizado sobre fotogramas de entrenamiento), no de tasa de éxito. El repositorio ocupa 12 GB y contiene solo los parámetros EMA en formato Orbax/JAX, sin estados de optimizador ni datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA derivada de `pi0` (OpenPI): codificador visión-lenguaje tipo PaliGemma con experto de acciones; la model card no detalla la topología interna |
| Parámetros totales | no disponible (la model card no indica cifra) |
| Parámetros activos | no disponible (no es un MoE según la información publicada) |
| Longitud de contexto | 48 tokens de prompt (`max_token_len=48`, `PaligemmaTokenizer(max_len=48)`); la card indica que los 6 prompts son mucho más cortos |
| Tipos de cuantización | no disponible; pesos publicados en `bfloat16` (restaurados con `dtype=jnp.bfloat16`), sin versiones cuantizadas |
| Idiomas soportados | no disponible; los 6 prompts de tarea están en inglés y deben escribirse literalmente |
| Licencia | `other`: código OpenPI bajo Apache 2.0; componentes derivados de Gemma sujetos a Gemma Terms of Use y a la Gemma Prohibited Use Policy |
| Formato de pesos | Orbax/JAX nativo en `30000/params/` (≈12 GB); no hay safetensors ni GGUF |

Parámetros adicionales relevantes:

| Parámetro | Valor |
|---|---|
| Horizonte de acción | 50 pasos × 32 dimensiones (solo las 14 primeras son válidas) |
| Dimensión de acción por brazo | 7: `[dx, dy, dz, rx, ry, rz, grip]` |
| Entradas de cámara | `base_0_rgb` (cabeza), `left_wrist_0_rgb`, `right_wrist_0_rgb`; 224×224, `resize_with_pad`, escala [-1, 1] |
| Estado propioceptivo | no se usa: vector de 32 ceros |
| Pasos de denoising en inferencia | 10 (según el ejemplo de la card) |
| Checkpoint | 30.000 pasos, EMA 0,999 |
| Tamaño del repo | 12,0 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de `pi0_base` de OpenPI, la familia de políticas VLA que combina un backbone visión-lenguaje con un experto de acciones que genera *chunks* de movimiento. La configuración de despliegue publicada es `Pi0Config(pi05=False, action_horizon=50)`, frente a `pi05=True, max_token_len=200` de la variante pi0.5. El entrenamiento se realizó sobre `rokae_bimanual_6task` rev `3ef2361`, con batch 32, 30.000 pasos, EMA 0,999, *dropout* en las cámaras de muñeca y la misma representación de acciones y estadísticas de normalización (`q01`, `q99`, `mean`, `std` sobre 14 dimensiones) que la versión pi0.5; el autor afirma que `norm_stats.json` coincide valor a valor entre ambas.

Una decisión de diseño destacable es la eliminación del estado medido: la entrada de *state* son 32 ceros y el anclaje de la trayectoria se hace sobre la primera acción del *chunk*, no sobre la pose real del robot. En despliegue, la card indica que debe usarse la pose actual como ancla: `p_k = p0 + R0 @ d_k`, `R_k = R0 @ exp(r_k)`, con desnormalización por cuantiles `a = (y + 1) / 2 * (q99 - q01 + 1e-6) + q01`. El gripper se interpreta como valor absoluto, no relativo. El repositorio incluye `recipe.json` (modelo, optimizador, learning rate, versión de datos), `metrics.jsonl` (curva de entrenamiento cada 20 pasos) y `recipe_assets/robot/` con el manifiesto de estadísticas.

## Capacidades

- Generación de *action chunks* bimanuales de 50 pasos para un brazo Rokae de dos brazos, con 7 grados de libertad por brazo (posición, rotación en vector y apertura de gripper).
- Ejecución de seis tareas de manipulación aprendidas por imitación: `block_cup_placement`, `cross_layer_swap`, `cup_stack_and_place`, `drawer_block_place`, `toothbrush_in_cup_to_yellow_shelf` y `pomegranate_orange_to_purple_box`.
- Condicionamiento por lenguaje natural: la tarea se selecciona mediante un prompt de texto en inglés, que debe coincidir literalmente con el de entrenamiento.
- Percepción multimodal con tres vistas RGB simultáneas (cámara de cabeza y una por muñeca), lo que aporta información de oclusión en tareas de precisión.
- Manipulación bimanual coordinada, incluyendo agarre, apilado, apertura/cierre de cajón y colocación en estanterías de distinta altura.
- No soporta tool calling, function calling, razonamiento multi-paso explícito ni modo *thinking*: es una política de imitación, no un agente conversacional.
- Capacidades multilingües: no disponible; el único condicionamiento documentado es en inglés.
- No procesa audio ni vídeo temporal: cada inferencia consume un fotograma por cámara.

## Casos de uso

- **Manipulación bimanual de pick-and-place industrial**: el modelo recibe las tres vistas de la célula y devuelve 50 acciones coordinadas de ambos brazos; es adecuado para ciclos repetitivos donde la tarea se describe con un prompt fijo y el entorno permanece estable.
- **Apilado y ensamblaje de piezas**: la tarea `cup_stack_and_place` demuestra el patrón de insertar un objeto en otro y recolocar el conjunto; replicable en encajes de componentes con tolerancias moderadas.
- **Automatización de laboratorio o cocina**: `toothbrush_in_cup_to_yellow_shelf` y `pomegranate_orange_to_purple_box` cubren recogida de objetos deformables o irregulares y su depósito en contenedores, un caso típico de clasificación y *kitting*.
- **Manipulación de mobiliario articulado**: `drawer_block_place` abre un cajón, introduce un objeto y lo cierra; aplicable a armarios, bandejas extraíbles y contenedores con pomo.
- **Intercambio de objetos entre estanterías**: `cross_layer_swap` requiere distinguir dos alturas y dos colores y asignar cada brazo a un destino, lo que sirve para tareas de reubicación con restricciones espaciales.
- **Base para evaluación comparativa de arquitecturas VLA**: al compartir receta con `maple0617/pi05-robot32-30k`, permite medir el efecto de pi0 frente a pi0.5 manteniendo data, normalización y prompts constantes, con un protocolo de 10 repeticiones por tarea.
- **Punto de partida para ajuste fino en un robot Rokae real**: el repositorio no permite reanudar el entrenamiento (no incluye estados de optimizador), pero los parámetros EMA sirven como inicialización para un nuevo ajuste con la misma convención de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo **no se ha probado en robot real** y que las comprobaciones realizadas no equivalen a una tasa de éxito. La única validación publicada es offline, sobre 4 fotogramas aleatorios del conjunto de entrenamiento, con 10 pasos de denoising:

| Métrica (error normalizado) | Modelo | Referencia "predicción todo ceros" |
|---|---|---|
| Error medio, 14 dimensiones válidas | 0,045 | 0,297 |
| Error mediano | 0,011 | no disponible |
| Brazo izquierdo, traslación | 0,066 | no disponible |
| Brazo izquierdo, rotación | 0,054 | no disponible |
| Brazo izquierdo, gripper | 0,014 | no disponible |
| Brazo derecho, traslación | 0,037 | no disponible |
| Brazo derecho, rotación | 0,037 | no disponible |
| Brazo derecho, gripper | 0,031 | no disponible |

Se verificó además que la salida tiene forma `[4, 50, 32]`, que todos los valores son finitos y que `norm_stats.json` coincide con el usado en entrenamiento y con el de la versión pi0.5. No hay datos de MMLU, HumanEval, GSM8K ni de éxito en tareas reales.

## Requisitos de hardware

- **VRAM estimada**: los parámetros en `bfloat16` ocupan aproximadamente 12 GB (tamaño del repo), por lo que se necesitan al menos 13-16 GB de VRAM para pesos y activaciones con un batch pequeño; con tres imágenes de 224×224 y 50 pasos de acción el margen debe ser mayor.
- **GPU recomendadas**: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para inferencia en `bfloat16`; una RTX 3090 de 24 GB es viable si el backend JAX/Orbax se configura correctamente.
- **Consumer GPU**: sí es probable que quepa en GPUs de 24 GB, pero no hay cifras publicadas de consumo real ni de latencia; no se ha verificado en la información disponible.
- **Opciones de despliegue**: el camino documentado es el stack de OpenPI en JAX (`openpi.models.pi0_config.Pi0Config`, `openpi.models.model.restore_params`, `model.sample_actions`). No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, al no existir pesos GGUF ni safetensors.
- **Latencia y throughput**: no disponibles. La card solo especifica 10 pasos de denoising y la forma de salida `[B, 50, 32]`; no se publican tiempos por inferencia ni frecuencia de control alcanzable.
- **Almacenamiento**: 12 GB de pesos más el entorno JAX/OpenPI; conviene reservar espacio para checkpoints temporales durante la carga.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Contexto / horizonte | Estado de validación | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Noctis12138/pi0-rokae-6task` | VLA pi0, ajuste fino bimanual Rokae, 6 tareas | no disponible | prompt 48 tokens; 50 pasos × 32 dims | solo offline (error normalizado 0,045); sin pruebas en robot | `other` (Apache 2.0 + Gemma Terms) | 12 GB, Orbax/JAX, 0 descargas |
| `maple0617/pi05-robot32-30k` | VLA pi0.5, misma data y receta, `robot_only` | no disponible | prompt 200 tokens; mismo *action horizon* | no disponible en la información proporcionada | no disponible | referenciado en la model card |
| TurboVLA (ActionMap / ACT) | Políticas de imitación comparadas por el autor | no disponible | no disponible | no disponible | no disponible | mencionado como baseline de comparación |
| `pi0_base` de OpenPI | Modelo base previo al ajuste fino | no disponible | no disponible | no disponible | Apache 2.0 (código) + Gemma Terms | público en OpenPI |

La comparación cuantitativa no es posible con los datos disponibles: no se publican parámetros, latencias ni tasas de éxito de ninguna de las alternativas. La comparación más informativa es la de receta: pi0 frente a pi0.5 sobre el mismo dataset y la misma normalización, lo que aísla el efecto de la arquitectura si se ejecuta el mismo protocolo en hardware.

## Limitaciones y advertencias

- **Sin validación en robot real**: el propio autor indica "尚未上真机" (todavía no probado en hardware). Cualquier despliegue en producción requiere una campaña de evaluación previa.
- **Riesgo de sobreajuste al entorno de entrenamiento**: la escena, la iluminación y las cámaras deben permanecer fijas; el modelo no se ha evaluado bajo cambios de disposición, iluminación ni cámara.
- **Dependencia literal del prompt**: los seis prompts deben escribirse exactamente como en la tabla; variaciones de redacción no están cubiertas por el entrenamiento.
- **Sin estado propioceptivo**: la entrada de *state* son 32 ceros y el anclaje se hace sobre la primera acción del *chunk*; errores de anclaje en despliegue se propagan a toda la trayectoria.
- **Solo 14 de 32 dimensiones son válidas**: consumir las 18 restantes produciría comandos sin sentido; el postprocesado debe truncar y desnormalizar por cuantiles con el `norm_stats.json` correcto.
- **Gripper absoluto**: tratarlo como incremental rompe la tarea; es un error de integración habitual.
- **Cobertura limitada a seis tareas**: no hay evidencia de generalización a objetos, colores o instrucciones fuera del conjunto entrenado.
- **Idioma**: condicionamiento documentado solo en inglés; no hay soporte multilingüe verificado.
- **Licencia restrictiva en la práctica**: los componentes derivados de Gemma quedan sujetos a los Gemma Terms of Use y a la Prohibited Use Policy, lo que condiciona el uso comercial y exige revisión legal antes de producción.
- **No reanudable**: el repositorio no incluye estados de optimizador ni datos, así que no se puede continuar el entrenamiento desde este checkpoint, solo reinicializar desde los parámetros EMA.
- **Sin datos de sesgo**: al ser una política robótica no se han publicado análisis de sesgo, pero el dataset de seis tareas y un único robot implica un dominio muy estrecho.
- **Resultados de búsqueda no relevantes**: la búsqueda web asociada a esta ficha devolvió únicamente contenido no relacionado con el modelo, por lo que no se ha incorporado ninguna fuente externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Noctis12138/pi0-rokae-6task
- Modelo comparable pi0.5 citado por el autor: https://huggingface.co/maple0617/pi05-robot32-30k
- Gemma Prohibited Use Policy (enlazada en la model card): https://ai.google.dev/gemma/prohibited_use_policy
- Rutas internas del repositorio relevantes: `30000/params/`, `30000/assets/rokae_bimanual_6task/norm_stats.json`, `recipe_assets/robot/`, `recipe.json`, `metrics.jsonl`, `LICENSE`, `LICENSE_GEMMA.txt`, `NOTICE`
- Repositorio de código OpenPI: no enlazado en la model card; la información disponible solo lo menciona por nombre
- Resultados de búsqueda web: sin enlaces relevantes para este modelo
