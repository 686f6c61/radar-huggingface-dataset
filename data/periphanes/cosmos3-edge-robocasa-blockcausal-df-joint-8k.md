# periphanes/cosmos3-edge-robocasa-blockcausal-df-joint-8k

## Resumen

Cosmos3-Edge RoboCasa block-causal diffusion forcing (joint, 8k pasos) es un checkpoint de investigación derivado de nvidia/Cosmos3-Edge, un modelo omni de 4B parámetros con arquitectura Mixture-of-Transformers (MoT). El autor, periphanes, lo ha post-entrenado sobre cuatro tareas de cocina del benchmark RoboCasa para convertirlo en un world model condicionado por acciones, con atención completa dentro de cada frame latente y causal entre frames (diffusion forcing con niveles de ruido por frame). Esto permite que las claves y valores de un frame ya generado no dependan de frames posteriores, habilitando experimentos de streaming con caché KV durante el rollout autorregresivo.

El modelo combina generación de vídeo con un cabezal supervisado de predicción de acciones, y se distribuye como exportación de cosmos_framework (config.json, checkpoint.json y safetensors). Cuenta con 3.369.657.024 parámetros reales en safetensors y un repositorio de 6,7 GB. Es relevante ahora porque explora una vía poco común: world models causales por bloques para robótica con inferencia incremental, aunque el propio autor advierte que es un checkpoint de investigación y no una política de robot funcional.

La relevancia práctica es doble: por un lado, sirve como banco de pruebas para estudiar el comportamiento de rollouts largos y el uso de caché KV en modelos de difusión causales; por otro lado, documenta con honestidad que las predicciones de acción todavía no superan a baselines triviales, lo que lo convierte en un punto de partida reproducible más que en una herramienta lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (MoT) omni con atención block-causal (diffusion forcing) |
| Parametros totales | 3.369.657.024 |
| Parametros activos | no disponible |
| Longitud de contexto | 65 frames de vídeo (17 frames latentes), ventana de 64 acciones |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (exportación cosmos_framework con config.json y checkpoint.json) |

## Arquitectura y entrenamiento

El modelo parte de nvidia/Cosmos3-Edge, un transformer omni de tipo Mixture-of-Transformers de 4B parámetros. Sobre esa base se entrena toda la parte generativa (moe_gen, embeddings y proyecciones de acción). La innovación clave es la atención block-causal: dentro de un frame latente la atención es completa, pero entre frames es causal, con niveles de ruido independientes por frame (diffusion_forcing, video_temporal_causal=True, temporal_causal_mode=block_causal, joint_attn_implementation=three_way). Se usa una ruta de flex-attention sin NATTEN.

El entrenamiento se divide en dos etapas. La primera, de 5.000 pasos, entrena dinámica directa (primer frame más 64 acciones para producir 65 frames). La segunda, de 3.000 pasos, entrena de forma conjunta dinámica directa, dinámica inversa y política, con un schedule de ruido escalar separado para las acciones (independent_action_schedule, shift_action=1) y un cabezal de acción a 5× learning rate. Los pesos publicados son la EMA del paso 3.000 de la segunda etapa (8.000 pasos totales). El cómputo fue de 4× A100-80GB, aproximadamente 3,1 s/paso, 16k tokens empaquetados por GPU, learning rate 1e-4 y grad clip 0,1.

Los datos provienen de una exportación GR00T LeRobot de demos RoboCasa v0.2 MimicGen (robocasa_mg_gr00t_1000, PandaOmron, 20 fps), restringida a cuatro tareas: PnPCounterToMicrowave, PnPCabToCounter, OpenDoubleDoor y PnPCounterToSink, con 990 episodios de entrenamiento por tarea y los 10 primeros retenidos como test.

## Capacidades

- Generación de vídeo condicionada por acciones: produce 65 frames a 384×256 (vista de muñeca 256×256 arriba, vistas tercera persona izquierda y derecha a 128×128 abajo).
- Predicción de acciones: cabezal supervisado que emite 64 pasos de 10 dimensiones [eef_pos_delta(3), rot6d(6), gripper(1)].
- Dinámica directa, dinámica inversa y política en un único modelo tras el entrenamiento conjunto.
- Rollout autorregresivo con caché KV: la atención causal entre frames permite streaming y experimentos de memoria.
- Condicionamiento por instrucción de lenguaje natural de RoboCasa (por ejemplo, "pick the corn from the counter and place it in the microwave").
- Normalización de acciones con robocasa_action_stats.json (q01/q99) incluida en el repositorio.
- Sin token de estado propioceptivo: el checkpoint se entrenó sin él.
- No dispone de torre de visión entrenada ni incluida; el loader la descarga desde nvidia/Cosmos3-Edge.

## Casos de uso

- Investigación de world models causales: el checkpoint permite estudiar cómo evoluciona un rollout autorregresivo con atención block-causal y comparar estrategias de caché KV, gracias a que el K/V de un frame terminado no depende de frames posteriores.
- Experimentos de streaming de vídeo latente: con 17 frames latentes y ventanas de 64 acciones, sirve para medir latencia y huella de memoria en inferencia incremental sobre 4× A100-80GB.
- Reproducción de dinámica directa en robótica de manipulación: dado un primer frame y una secuencia de acciones, genera los 65 frames siguientes, útil para validar simuladores o estudiar drift en horizontes de 3,25 s.
- Evaluación de dinámica inversa: a partir de una secuencia de vídeo puede inferir acciones, lo que permite comparar contra etiquetas de RoboCasa en tareas de pick-and-place.
- Banco de pruebas de normalización de acciones: el repositorio incluye las estadísticas q01/q99 y una representación 6D de rotaciones basada en columnas, lo que facilita validar pipelines de conversión desde la acción 12D de RoboCasa a la forma 10D.
- Estudio de fallos en vistas de muñeca: los PSNR publicados muestran que la vista de muñeca pierde el objeto objetivo rápidamente, lo que convierte al modelo en un caso de análisis para mejorar el seguimiento de objetos pequeños en world models.
- Base para post-entrenamiento futuro: al ser un checkpoint abierto bajo OpenMDW 1.1, otros grupos pueden continuar el entrenamiento (el autor señala que el grad clip 0,1 recorta prácticamente todos los pasos y que más entrenamiento probablemente ayudaría).

## Benchmarks y rendimiento

PSNR de rollout del world model (dB), 5 episodios retenidos, 3 ventanas encadenadas de 64 acciones, cada ventana condicionada en el último frame predicho de la anterior, sin caché KV, pesos EMA y 20 pasos UniPC:

| Ventana | Frame completo | Muñeca | Izquierda | Derecha |
|---|---|---|---|---|
| 0 (ajuste entrenado de 65 frames) | 15,8 | 15,0 | 18,0 | 19,1 |
| 1 | 13,5 | 12,4 | 17,6 | 18,5 |
| 2 | 13,4 | 12,4 | 16,7 | 17,5 |

Predicción de acciones en lazo abierto, modo política, 40 ventanas retenidas, MSE normalizado (menor es mejor):

| Predictor | MSE | Precisión de gripper |
|---|---|---|
| Este checkpoint | 0,31 | 0,83 |
| Mismo modelo antes del entrenamiento conjunto (cabezal sin entrenar) | 1,31 | 0,52 |
| Movimiento cero, mantener gripper | 0,12 | 0,91 |
| Acción media | 0,18 | 0,58 |

## Requisitos de hardware

- Entrenamiento documentado en 4× A100-80GB, con 16k tokens empaquetados por GPU y aproximadamente 3,1 s/paso.
- VRAM de inferencia: no disponible de forma explícita; el repositorio ocupa 6,7 GB en safetensors, pero el loader necesita además la torre de visión de nvidia/Cosmos3-Edge y el VAE Wan2.2 (Wan2.2_VAE.pth de Wan-AI/Wan2.2-TI2V-5B), lo que incrementa el consumo.
- GPU recomendadas: A100-80GB o H100 para reproducir el entorno de entrenamiento; no hay datos publicados de ejecución en consumer GPU.
- Cabe en consumer GPU: no disponible; no se ha publicado ninguna medición.
- Opciones de despliegue: pila de inferencia de Cosmos3 con `--checkpoint-path <snapshot local>`; la ruta de atención block-causal, la caché KV rodante y el adaptador de datos RoboCasa provienen de un fork de cosmos-framework y de un repositorio de código complementario que aún no son públicos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (periphanes) | 3,37B | 65 frames / 64 acciones | World model causal por bloques + cabezal de acción | OpenMDW 1.1 | Pesos públicos; código de soporte no público |
| nvidia/Cosmos3-Edge | 4B (según model card) | no disponible | Modelo omni base | OpenMDW 1.1 | Público |
| Wan-AI/Wan2.2-TI2V-5B | no disponible | no disponible | Generación de vídeo (VAE usado aquí) | no disponible | Público |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación, no una política de robot funcional: las predicciones de acción no superan a baselines triviales (MSE 0,31 frente a 0,12 de movimiento cero).
- Entrenado solo en 4 tareas y con horizonte corto (65 frames, aproximadamente 3,25 s); los rollouts más largos derivan (PSNR cae de 15,8 a 13,4 entre la ventana 0 y la 2).
- Sin entrada de estado propioceptivo.
- La vista de muñeca pierde el objeto objetivo rápidamente durante el rollout.
- Grad clip 0,1 recorta prácticamente todos los pasos, lo que sugiere que el entrenamiento está infrautilizado.
- La torre de visión no está incluida ni entrenada; debe descargarse de nvidia/Cosmos3-Edge.
- Requiere el VAE Wan2.2 (Wan.2.2_VAE.pth) como dependencia externa.
- El código de atención block-causal, caché KV y adaptador de datos no es público; hay que solicitar acceso al autor.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Restricciones de licencia: OpenMDW 1.1; conviene revisar los términos en el enlace oficial antes de cualquier uso comercial.
- Sin métricas de latencia ni de consumo de VRAM publicadas, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/periphanes/cosmos3-edge-robocasa-blockcausal-df-joint-8k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge
- VAE Wan2.2: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
