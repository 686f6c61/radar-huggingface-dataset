# Myungkyu/pi0_5_jax_b2d_ur5_rh56dfx_3_b128_60k

## Resumen

`pi0_5_jax_b2d_ur5_rh56dfx_3_b128_60k` es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario Myungkyu en HuggingFace. Se trata de un fine-tune completo del checkpoint base `lerobot/pi05_base` (Pi0.5) sobre un subconjunto del dataset Bench2Dex (`Bench2Dex/teleopdata`), concretamente el escenario `ur5_rh56dfx_3` con demos de replay-generalization y cuatro vistas de cámara. El modelo se enmarca en la familia de políticas Pi0.5 y se ejecuta sobre el stack openpi en JAX, con un adaptador propio (XPolicyLab Pi_05) y la receta RoboDojo `pi05_base_aloha_full_sim_arx-x5_seed_0`.

El modelo resuelve el problema de generar acciones motrices absolutas para un brazo UR5 equipado con mano robótica RH56DFX, a partir de imágenes estéreo y de muñeca, el estado articular actual y una descripción textual de la escena. Es relevante como baseline reproducible ("vanilla baseline") para el benchmark Bench2Dex, y por publicar checkpoints intermedios con sumas de verificación, lo que facilita la reproducibilidad y el análisis de la evolución del entrenamiento.

La arquitectura subyacente es Pi0.5, un transformer VLA que combina un backbone preentrenado con un tokenizador y una cabeza de acción; el fine-tune se realizó con batch 128, 60.000 pasos, chunk de acción 50 y EMA 0.99. El repositorio ocupa 49,8 GB e incluye pesos en formato orbax (params/), no en safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (VLA transformer) sobre openpi en JAX; adaptador XPolicyLab Pi_05 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 280 tokens de prompt (configuracion del fine-tune) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts en lenguaje natural, idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | orbax (params/), checkpoints intermedios por paso |
| Modelo base | lerobot/pi05_base |
| Dataset de entrenamiento | Bench2Dex/teleopdata (escenario ur5_rh56dfx_3) |
| Entradas | 4 vistas 224x224 (estéreo izq/der + muñeca izq/der), estado articular, descripcion de escena |
| Salidas | objetivos absolutos de articulaciones (zero-padded a 32) |
| Pasos de entrenamiento | 60.000 (batch 128), EMA 0.99 |
| Chunk de accion | 50 |
| Normalizacion | quantile norm (assets/ur5_rh56dfx_sim/norm_stats.json) |
| Tamano del repo | 49,8 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo del checkpoint `gs://openpi-assets/checkpoints/pi05_base` siguiendo la receta RoboDojo `pi05_base_aloha_full_sim_arx-x5_seed_0`, adaptada al camino de datos del fork de Bench2Dex. La política Pi0.5 procesa cuatro vistas de imagen de 224x224 (estéreo izquierdo y derecho, más muñeca izquierda y derecha), el estado de las articulaciones activas en orden canónico del registro y una descripción textual de la escena, y emite objetivos absolutos para esas mismas articulaciones, con zero-padding hasta 32 dimensiones. El prompt se limita a 280 tokens.

El entrenamiento se realizó con optimizador de batch 128 durante 60.000 pasos, con chunk de acción de 50 y pesos EMA (0.99) almacenados en `params/` en formato orbax. Se aplicó normalización por cuantiles con las estadísticas del escenario simulado `ur5_rh56dfx_sim`. El repositorio incluye checkpoints intermedios en los pasos 15.000, 30.000 y 45.000, cada uno con su propio fichero `SHA256SUMS`, aunque el estado del optimizador no se incluye en ninguno de ellos. La configuración de openpi asociada es `pi05jax_bench2dex` (en `openpi.json`), y las configs referencian el backbone y el tokenizador base por su hub id.

## Capacidades

- Generacion de acciones roboticas: produce objetivos absolutos de articulaciones para un brazo UR5 con mano RH56DFX a partir de observaciones visuales y de estado.
- Percepcion multi-vista: procesa simultaneamente imagenes estéreo izquierda/derecha y de muñeca izquierda/derecha, lo que permite razonamiento espacial y de profundidad.
- Condicionamiento por lenguaje: acepta una descripcion textual de la escena como prompt (hasta 280 tokens) para guiar la politica.
- Control de imitacion (behavior cloning): entrenado sobre demos de teleoperacion, reproduce trayectorias y objetivos articulares.
- Generalizacion de replay: el escenario `ur5_rh56dfx_3` corresponde a demos de replay-generalization, orientadas a evaluar la robustez ante variaciones.
- Checkpoints intermedios: permite evaluar el rendimiento en distintos puntos del entrenamiento (15k, 30k, 45k, 60k).
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo thinking; el modelo es especifico de robotica.

## Casos de uso

- Baseline de referencia en Bench2Dex: sirve como punto de comparacion "vanilla" para investigaciones que propongan mejoras sobre el mismo escenario `ur5_rh56dfx_3`, gracias a su receta y checkpoints publicados.
- Manipulacion robotica con UR5 y mano RH56DFX: despliegue de la politica para tareas de agarre y manipulacion en simulacion o en banco de pruebas, usando las cuatro vistas y el estado articular como entrada.
- Investigacion en aprendizaje por imitacion: analisis de la evolucion del entrenamiento comparando los checkpoints de 15k, 30k, 45k y 60k pasos para estudiar convergencia y sobreajuste.
- Reproduccion de experimentos: la inclusion de `SHA256SUMS` por checkpoint y de la configuracion openpi `pi05jax_bench2dex` permite replicar exactamente la inferencia.
- Evaluacion de generalizacion visual: el uso de vistas estéreo y de muñeca permite estudiar como afecta la oclusion o el cambio de punto de vista a la politica.
- Integracion en pipelines de robotica con JAX/openpi: el formato orbax y la configuracion del adaptador XPolicyLab facilitan su carga en infraestructura de investigacion existente.
- Estudio de normalizacion por cuantiles: las estadisticas publicadas (`norm_stats.json`) permiten analizar el efecto de la normalizacion en el espacio de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el tamano del repositorio (49,8 GB) incluye pesos y checkpoints intermedios, no solo el checkpoint final.
- GPU recomendadas: no disponible; al tratarse de un modelo JAX/orbax con backbone Pi0.5, se requiere una GPU compatible con JAX y suficiente memoria para cargar los pesos, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: openpi (JAX) con la configuracion `pi05jax_bench2dex`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de politica VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0_5_jax_b2d_ur5_rh56dfx_3_b128_60k | no disponible | 280 tokens de prompt | VLA robotica (UR5 + RH56DFX) | no disponible | HuggingFace (Myungkyu) |
| lerobot/pi05_base | no disponible | no disponible | VLA robotica base | no disponible | HuggingFace (lerobot) |
| Otros baselines Bench2Dex | no disponible | no disponible | VLA robotica | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Especificidad de hardware: el modelo esta entrenado para el escenario `ur5_rh56dfx_3` (UR5 + mano RH56DFX); no es directamente transferible a otras configuraciones roboticas sin reentrenamiento.
- Dominio simulado: las estadisticas de normalizacion provienen de `ur5_rh56dfx_sim`, por lo que el gap sim-a-real no esta caracterizado en la informacion disponible.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse antes de cualquier despliegue en produccion.
- Idiomas no disponibles: no se especifica que idiomas admite el prompt de descripcion de escena.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Riesgo de sobreajuste a las demos: al ser un fine-tune sobre un subconjunto concreto de Bench2Dex, la generalizacion fuera de la distribucion de teleoperacion no esta documentada.
- Estado del optimizador no incluido: los checkpoints no permiten reanudar el entrenamiento, solo inferencia o evaluacion.
- Repositorio de gran tamano (49,8 GB): requiere descarga selectiva mediante `allow_patterns` o `ignore_patterns` para evitar transferir todos los checkpoints.
- Sin datos de sesgos, alucinacion o limitaciones de contexto mas alla de los 280 tokens de prompt.

## Enlaces

- HuggingFace: https://huggingface.co/Myungkyu/pi0_5_jax_b2d_ur5_rh56dfx_3_b128_60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset: https://huggingface.co/datasets/Bench2Dex/teleopdata
