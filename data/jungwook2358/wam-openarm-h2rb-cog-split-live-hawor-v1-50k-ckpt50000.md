# jungwook2358/wam-openarm-h2rb-cog-split-live-hawor-v1-50k-ckpt50000

## Resumen

wam-openarm-h2rb-cog-split-live-hawor-v1-50k-ckpt50000 es un checkpoint de investigacion para robotica publicado por el usuario jungwook2358 en Hugging Face. Se trata de un modelo de politica visomotora (vision-language-action) construido sobre el backbone de video Wan2.2-TI2V-5B, con un trunk DiT compartido entre el modelo de video, un adaptador y las cabezas de accion. El modelo se ha entrenado desde cero durante 50.000 pasos en el experimento etiquetado como EXP-0019, centrado en el brazo robotico OpenArm.

El interes tecnico del checkpoint reside en su diseno experimental: combina CogAlign (con gradientes que fluyen hacia el backbone de video) con etiquetas de embodiment separadas (split) para datos humanos y roboticos. Los datos humanos se etiquetan como `allex_human` (id 1) y los roboticos como `new_embodiment` (id 0), cada grupo con su propio codificador de estado, codificador de accion y decodificador de accion, mientras que el trunk DiT y el modelo de video se comparten. Esto permite entrenar simultaneamente con datos de robot y de video humano, una estrategia relevante para escalar el entrenamiento de politicas roboticas con datos heterogeneos.

El checkpoint es un artefacto de investigacion (12,5 GB, tres shards safetensors) sin descargas ni likes en el momento de la consulta, y su licencia es "other" sin terminos detallados. No es un modelo de lenguaje general: su pipeline es robotics y su uso previsto es la inferencia sobre el robot OpenArm con la etiqueta de embodiment `new_embodiment`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) sobre backbone de video Wan2.2-TI2V-5B, con adaptador y cabezas de accion; CogAlign con gradientes hacia el backbone de video |
| Parametros totales | no disponible (el backbone base es Wan2.2-TI2V-5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (horizonte de accion: 24 pasos; I2V con 1 frame de condicionamiento + 8 frames futuros) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no detallados en la model card) |
| Formato de pesos | safetensors (3 shards, checkpoint de HF Trainer) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de diffusion transformer (DiT) acoplada a un modelo de video Wan2.2-TI2V-5B. El trunk DiT, el modelo de video, el adaptador y las cabezas se comparten entre grupos de embodiment, pero los datos humanos (`allex_human`, id 1) y roboticos (`new_embodiment`, id 0) disponen de codificadores de estado, codificadores de accion y decodificadores de accion propios (GroupedProjection x2, con `WAM_MULTIGROUP_ACTION_DIMS=30,30`). La variante "cog" activa CogAlign con `WAM_COGALIGN_DETACH=0`, de modo que los gradientes fluyen hacia el backbone de video; la perdida de accion humana permanece activa a traves del grupo humano.

El entrenamiento se realizo desde cero sobre Wan2.2-TI2V-5B durante 50.000 pasos, con 4 GPU y 16 filas por GPU (64 filas por paso: 32 roboticas y 32 humanas, mezcla exacta). Los datos combinan la composicion OpenArm del paper FRED: 6 subconjuntos roboticos (553 episodios) y 5 subconjuntos humanos (1.187 episodios), con video estereo 192x256 concatenado verticalmente (vista izquierda humana en negro), stride I2V de 3 (1 frame de condicionamiento + 8 futuros) y enmascaramiento de vistas 0.5/0.25/0.25. Las acciones y estados usan PRQ30 para ambas manos (posicion de muneca 3, rotacion 6D, articulaciones de mano 6, por mano), en valores absolutos, en el marco de la camara derecha ZED (FRAME V1), con normalizacion q01/q99 y mascaras de validez (`WAM_ROW_VALIDITY=1`). Las etiquetas humanas se basan en HaWoR v1 (PRQ de mano derecha para rlwrld y air-fryer; validez 0 para anyh2r y left_hand_box).

## Capacidades

- Generacion de acciones roboticas en espacio PRQ30 para ambas manos del OpenArm (posicion, rotacion 6D y articulaciones de mano).
- Modelado visomotor condicionado por video estereo 192x256 con prediccion de 8 frames futuros (I2V stride 3).
- Entrenamiento conjunto con datos humanos y roboticos mediante etiquetas de embodiment separadas.
- Perdida de accion supervisada a traves del grupo humano (`allex_human`), lo que permite aprovechar video humano para el aprendizaje.
- Inferencia especifica para robot con la etiqueta `new_embodiment`.
- No se documentan capacidades de lenguaje natural, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Investigacion en aprendizaje por imitacion con datos heterogeneos: el checkpoint permite evaluar si el entrenamiento conjunto robot+humano con cabezas separadas mejora la politica final frente a entrenar solo con datos roboticos.
- Manipulacion bimanual con OpenArm: el espacio PRQ30 cubre ambas manos, por lo que el modelo puede generar trayectorias coordinadas de posicion, rotacion y articulaciones de mano en tareas de agarre.
- Evaluacion de CogAlign: al tener `COGALIGN_DETACH=0`, sirve para medir el efecto de propagar gradientes al backbone de video en tareas de control visomotor.
- Reproduccion de experimentos: el checkpoint incluye `experiment_cfg/`, `statistics.json`, `embodiment_id.json` y estados de entrenamiento, lo que facilita reproducir la configuracion EXP-0019.
- Transferencia desde video humano: el grupo `allex_human` permite estudiar la transferencia de etiquetas HaWoR a politicas roboticas en tareas como freir alimentos (air-fryer) o tareas de rlwrld.
- Base para fine-tuning en nuevos brazos o tareas: al ser un checkpoint intermedio de 50k pasos, puede servir como inicializacion para ajustes posteriores con la etiqueta de embodiment correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 12,5 GB en safetensors, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos en precision original.
- GPU recomendadas: no disponible; el entrenamiento se realizo con 4 GPU (modelo no especificado).
- Cabe en GPU consumer: no disponible; con 12,5 GB de pesos, una GPU de 16 GB podria cargarlo en teoria, pero no se confirma.
- Opciones de despliegue: no disponible; el checkpoint es de HF Trainer e incluye `config.json`, `processor_config.json` y `training_args.bin`, pero no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables de la misma categoria (politicas visomotoras sobre OpenArm) en la informacion disponible.

## Limitaciones y advertencias

- Modelo de investigacion sin descargas ni validacion externa; no hay evidencia de rendimiento en tareas reales.
- Licencia "other" sin terminos detallados: es necesario contactar con el autor antes de cualquier uso comercial.
- No se documentan sesgos, pero al entrenarse con datos humanos y roboticos limitados (553 episodios roboticos y 1.187 humanos) puede heredar sesgos de esos conjuntos.
- Riesgo de alucinacion en el sentido de generar acciones no validas: las etiquetas humanas de anyh2r y left_hand_box tienen validez 0, lo que puede degradar la calidad de las acciones generadas en esas condiciones.
- El checkpoint no incluye los estados del optimizador de DeepSpeed (72 GB), por lo que no permite reanudar el entrenamiento exactamente desde el paso 50.000.
- La inferencia robotica requiere usar la etiqueta `new_embodiment`; usar `allex_human` produciria resultados incorrectos.
- No se especifican idiomas soportados ni capacidades de lenguaje; no debe usarse como modelo de chat o generacion de texto.
- El horizonte de accion es de 24 pasos y el contexto de video es limitado (1 frame de condicionamiento + 8 futuros), lo que restringe tareas de largo horizonte.

## Enlaces

- Hugging Face: https://huggingface.co/jungwook2358/wam-openarm-h2rb-cog-split-live-hawor-v1-50k-ckpt50000
- Codigo: actlat-wam branch `jungwook/openarm-fred-ft` @c3d1b92 (no se proporciona URL directa)
- Script de entrenamiento: `run_scripts/train/wam_dit4dit/openarm/finetune_openarm_prq30_h2rb.sh` (no se proporciona URL directa)
- Config de modalidad: `gr00t/configs/data/openarm_prq30_v1_config.py` (no se proporciona URL directa)
- Paper FRED: no disponible en la informacion proporcionada
- Modelo base Wan2.2-TI2V-5B: no se proporciona URL directa
