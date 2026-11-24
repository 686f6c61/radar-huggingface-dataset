# oldTOM/dexduet-v2d-checkpoints

## Resumen

DexDuet v2d-checkpoints es un conjunto de políticas de aprendizaje por refuerzo entrenadas para el control de un robot humanoide Unitree G1 equipado con manos diestras Dex3, en el marco del reto V2D (Vision-to-Dexterity). Lo publica el usuario oldTOM en Hugging Face como material de replicación del artículo "DexDuet: Learning Contact-Preserving Bimanual Dexterity from Human Demonstrations" (arXiv 2611.30495), firmado por Haoran Zhang, Haokai Ding, Han Zhou, Zuxing Lu, Heng Zhang y Xingxing Zuo. No es un modelo de lenguaje: es un conjunto de checkpoints de políticas (reinforcement learning) para manipulación bimanual diestra.

El repositorio contiene 90 ejecuciones de entrenamiento: 30 episodios del Tier-1 del reto V2D, cada uno entrenado con tres métodos distintos (DexDuet, DexDuet sin recompensas de interacción y CHORD con PPO), con una única semilla (42) y hasta 1.966.080.000 pasos de entorno por ejecución. El objetivo del método es aprender destrezas bimanuales que preserven el contacto entre manos y objeto a partir de demostraciones humanas, un problema central en robótica de manipulación diestra donde las políticas PPO convencionales sufren de contacto intermitente y baja tasa de éxito en tareas de múltiples fases.

La relevancia es doble: por un lado, publica checkpoints evaluados y métricas reproducibles (ADD-AUC, SP-SR, MP-SR, MPPE y Contact-AUC) que permiten comparar directamente la receta propuesta frente a la línea base PPO del reto; por otro, el empaquetado incluye scripts de verificación de integridad y de reproducción, lo que facilita la auditoría de resultados en investigación de manipulación con humanoides.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Políticas de aprendizaje por refuerzo (reinforcement-learning) para control de robot humanoide; arquitectura de red no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoints de entrenamiento empaquetados en ZIP (`dexduet_v2d_g1_dex3.zip`, 2,35 GB) con `RUN_INFO.json` por ejecución; formato interno de los tensores no detallado |
| Robot / plataforma | Unitree G1 con manos Dex3 |
| Entorno / benchmark | V2D Challenge, 30 episodios Tier-1 |
| Pasos de entorno por ejecución | hasta 1.966.080.000 |
| Semilla de entrenamiento | 42 |
| Tamaño del repositorio | 2,4 GB |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura de red de las políticas; se trata de checkpoints de políticas entrenadas con aprendizaje por refuerzo, no de un transformer generativo. El método DexDuet se presenta en el artículo como un esquema de aprendizaje de destrezas bimanuales a partir de demostraciones humanas que incorpora recompensas de interacción: una recompensa basada en el grafo de manos (hand-graph) y una recompensa de contacto mano-objeto. La ablación incluida en el release ("DexDuet without interaction rewards") elimina precisamente ambas, lo que permite aislar su contribución.

El entrenamiento cubre 30 episodios del Tier-1 del reto V2D con tres recetas: DexDuet, DexDuet sin recompensas de interacción y CHORD (la receta PPO del reto, basada en código de NVIDIA). Cada configuración se entrena con una sola semilla (42) y hasta 1.966.080.000 pasos de entorno. Una nota relevante de reproducibilidad: el episodio 07 de CHORD (PPO) se entrenó con el código de NVIDIA más un guardián que reinicia entornos con estado no finito (14 reinicios en 20.000 iteraciones), mientras que el resto de episodios CHORD usan el código sin modificar. Los checkpoints almacenan la configuración de entrenamiento con rutas de máquina y entidad de W&B sustituidas por marcadores (`<WORK_ROOT>`, `<WANDB_ENTITY>`), preservando nombres, dtypes, formas y bytes de los tensores evaluados.

## Capacidades

- Control de manipulación bimanual diestra sobre un humanoide Unitree G1 con manos Dex3 en el entorno del reto V2D.
- Ejecución de políticas entrenadas para 30 tareas/episodios del Tier-1 del reto, con checkpoints evaluados por episodio.
- Preservación de contacto mano-objeto y coordinación entre ambas manos, objetivo explícito del método.
- Comparación controlada de métodos: el release incluye la política propuesta, su ablación sin recompensas de interacción y la línea base PPO (CHORD).
- Evaluación reproducible mediante scripts oficiales (`reproduce/download_checkpoints.sh`, `reproduce/run_all.sh`) y cálculo de Contact-AUC.
- Verificación de integridad criptográfica de los artefactos (`CHECKPOINTS.sha256`, `MANIFEST.sha256`).
- No soporta generación de texto, tool calling, agentes lingüísticos ni capacidades multimodales de tipo vision-language; es un artefacto específico de robótica.

## Casos de uso

- Replicación de resultados del artículo: descargar el ZIP, verificar el sha256 y ejecutar `reproduce/run_all.sh --from-release` para regenerar las métricas publicadas y contrastar ADD-AUC, SP-SR, MP-SR, MPPE y Contact-AUC.
- Estudio de ablación de recompensas: comparar `dexduet` frente a `dexduet_no_interaction_rewards` en los mismos 30 episodios para cuantificar el efecto del grafo de manos y del contacto mano-objeto (por ejemplo, la diferencia de Contact-AUC entre ambas recetas).
- Línea base para nuevas recetas de RL: usar los checkpoints CHORD (PPO) como referencia de partida al desarrollar métodos alternativos sobre el mismo conjunto de tareas del reto V2D.
- Investigación en manipulación diestra bimanual: analizar las políticas entrenadas para estudiar estrategias de coordinación entre manos en tareas de contacto, dado que el release incluye métricas por episodio en `results/per_episode.csv`.
- Evaluación estandarizada con el evaluador oficial: integrar los checkpoints en el pipeline del repositorio DexDuet-V2D para obtener Contact-AUC con las cuatro ejecuciones adicionales que exige la métrica.
- Docencia y formación en robótica de RL: emplear el paquete como ejemplo completo de entrenamiento, evaluación y verificación reproducible, con configuración de entrenamiento almacenada en cada checkpoint.
- Auditoría de reproducibilidad: validar la cadena de integridad (`CHECKPOINTS.sha256` y `MANIFEST.sha256`) antes de reutilizar políticas en experimentos derivados.

## Benchmarks y rendimiento

Resultados publicados en la model card. ADD-AUC, SP-SR, MP-SR y Contact-AUC en %; MPPE en cm. Cada valor es la media sobre los 30 episodios de la media de cuatro ejecuciones del evaluador; ± es la desviación estándar sobre las cuatro ejecuciones. Contact-AUC usa 29 episodios (aquellos en los que el humano sostiene el objeto) y cuatro ejecuciones adicionales.

| Metodo | ADD-AUC ↑ | SP-SR ↑ | MP-SR ↑ | MPPE (cm) ↓ | Contact-AUC ↑ |
|---|---|---|---|---|---|
| CHORD (PPO) | 39,8 ± 0,3 | 53,3 ± 0,0 | 15,8 ± 5,0 | 14,85 ± 1,29 | 16,0 ± 1,1 |
| DexDuet sin recompensas de interaccion | 76,2 ± 0,3 | 83,3 ± 0,0 | 71,7 ± 1,9 | 11,47 ± 0,33 | 66,6 ± 2,3 |
| DexDuet | 77,4 ± 0,9 | 85,0 ± 1,9 | 75,8 ± 3,2 | 12,19 ± 0,93 | 72,6 ± 0,8 |

Lectura de los datos: DexDuet supera a CHORD (PPO) en ADD-AUC (+37,6 puntos), SP-SR (+31,7), MP-SR (+60,0) y Contact-AUC (+56,6), y reduce MPPE en 2,66 cm. Frente a su propia ablación, la ganancia es más modesta pero consistente en ADD-AUC (+1,2), SP-SR (+1,7), MP-SR (+4,1) y Contact-AUC (+6,0), mientras que la ablación obtiene un MPPE ligeramente mejor (11,47 frente a 12,19 cm).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño de los pesos individuales no se detalla; el ZIP completo ocupa 2,35 GB para 90 ejecuciones.
- GPU recomendadas: no disponible en la información proporcionada. El pipeline de evaluación oficial se lanza con `--gpus 0`, lo que sugiere una GPU por ejecución de evaluación.
- Compatibilidad con GPU de consumo: no confirmada; depende del simulador y del entorno del reto V2D, no solo del tamaño del checkpoint.
- Opciones de despliegue: scripts oficiales del repositorio DexDuet-V2D (`reproduce/download_checkpoints.sh`, `reproduce/run_all.sh`) sobre el simulador del reto V2D. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.
- Almacenamiento: 2,4 GB de repositorio más los datos y assets del reto V2D, que no se incluyen y deben descargarse por separado.

## Comparativa con modelos similares

La comparación relevante es interna al release, entre las tres recetas entrenadas sobre las mismas 30 tareas y la misma semilla:

| Metodo | Tipo | Pasos de entorno | ADD-AUC | Contact-AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DexDuet | RL con recompensas de interacción | hasta 1.966.080.000 | 77,4 | 72,6 | Apache-2.0 | Hugging Face (este repo) |
| DexDuet sin recompensas de interacción | Ablación | hasta 1.966.080.000 | 76,2 | 66,6 | Apache-2.0 | Hugging Face (este repo) |
| CHORD (PPO) | Línea base PPO del reto | hasta 1.966.080.000 | 39,8 | 16,0 | Apache-2.0 (código de NVIDIA) | Hugging Face (este repo) |

No se dispone de datos en la información proporcionada para comparar con políticas de terceros ajenas al reto V2D; esa comparativa figura como no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni multimodal: no genera texto, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Los resultados provienen de una única semilla (42); la variabilidad entre semillas no se reporta, lo que limita las conclusiones sobre robustez.
- Los datos del reto V2D y los assets del robot no se incluyen en el repositorio; sin ellos los checkpoints no son evaluables.
- La licencia Apache-2.0 cubre el release, pero las políticas se entrenaron con datos del reto V2D y pueden aplicarles los términos de datos del reto; conviene revisarlos antes de uso comercial.
- El checkpoint del episodio 07 de CHORD (PPO) se entrenó con una modificación del código de NVIDIA (guardián de estados no finitos, 14 reinicios en 20.000 iteraciones), por lo que no es estrictamente comparable con el resto de ejecuciones CHORD.
- La configuración de entrenamiento almacenada contiene marcadores (`<WORK_ROOT>`, `<WANDB_ENTITY>`) en lugar de rutas y entidad reales; la reproducibilidad exacta del entorno de entrenamiento no es completa.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación independiente por parte de la comunidad.
- No se detalla la arquitectura de red ni el número de parámetros de las políticas, lo que dificulta estimar requisitos de cómputo a partir de la ficha.
- Riesgo de alucinación y sesgos lingüísticos: no aplica en el sentido habitual; el riesgo equivalente es el fallo de la política fuera de la distribución de tareas del reto.

## Enlaces

- Hugging Face: https://huggingface.co/oldTOM/dexduet-v2d-checkpoints
- Artículo: https://arxiv.org/abs/2611.30495
- Página del proyecto: https://rcl-robotics.github.io/Dexduet.io/
- Código del estudio (entrenamiento, evaluación, Contact-AUC): https://github.com/HaoranZhangumich/DexDuet-V2D
- Código del método DexDuet: https://github.com/HaoranZhangumich/DexDuet
