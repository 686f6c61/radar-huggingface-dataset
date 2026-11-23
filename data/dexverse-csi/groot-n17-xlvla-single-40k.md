# Dexverse-CSI/groot-n17-xlvla-single-40k

## Resumen

GR00T N1.7 sobre DexVerse es un ajuste fino completo del modelo fundacional de robotica `nvidia/GR00T-N1.7-3B` (3.144 millones de parametros) publicado por Dexverse-CSI. El modelo resuelve una tarea concreta: control de manipulacion diestra con un unico brazo y seis manos roboticas distintas (allegro, inspire, leap, shadow, sharpa y wuji) sobre cuatro tareas de agarre (GraspBleach, GraspPan, GraspKettle y FunctionalHammerStrike). Es relevante porque demuestra la transferencia de un modelo fundacional de NVIDIA a un dominio muy especifico con datos propios, y porque se publica junto a una linea base pi0.5 con datos y representacion identicos, lo que permite comparaciones controladas.

El ajuste se realizo sobre 1.200 episodios de teleoperacion (50 por cada combinacion de mano y tarea), a 60 fps, con un espacio de estado/accion de 31 dimensiones que combina posicion de muneca (xyz), rotacion en 6D y 22 valores de dedos normalizados al rango URDF [-1, 1]. Las camaras empleadas son tercera persona y eye-in-hand.

La publicacion es de caracter tecnico y experimental: cero descargas y cero likes en el momento de la ficha, licencia no declarada y sin resultados de benchmarks publicados. Aun asi, la informacion de entrenamiento es inusualmente detallada (pasos, batch, learning rate, calibracion, normalizacion), lo que la hace util como referencia de receta de ajuste fino para robotica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (modelo fundacional de robotica con LLM, vision encoder, projector y DiT de acciones) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, entrenamiento en bf16) |
| Idiomas soportados | no disponibles (el prompt es una frase de tarea en el dataset de entrenamiento) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | nvidia/GR00T-N1.7-3B |
| Libreria | gr00t |
| Tamano del repo | 55,3 GB |
| Horizonte de accion | 10 pasos (delta_indices 0..9); el modelo mantiene action_horizon 40 |
| Dimension estado/accion | 31-D = [wrist xyz 3 | rot6d 6 | dedos 22] |
| Camaras | third_person + eye_in_hand |
| Tareas | GraspBleach, GraspPan, GraspKettle, FunctionalHammerStrike |
| Manos | allegro, inspire, leap, shadow, sharpa, wuji |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura GR00T N1.7 de NVIDIA, que combina un modelo de lenguaje, un codificador visual, un proyector y un modulo DiT (Diffusion Transformer) para generar acciones. El ajuste fino es completo: se actualizan LLM, vision, projector y DiT, no solo un adaptador. El embodiment se define como `NEW_EMBODIMENT` en la configuracion `training/configs/dexverse_single_config.py` del repositorio Isaac-GR00T (commit 708617f).

Los datos de entrenamiento son 1.200 episodios de teleoperacion (50 por celda mano-tarea) a 60 fps, con estado y accion reconstruidos mediante el codigo `cross_dex` de xlvla y una calibracion de muneca medida en simulador (`training/configs/wrist_calib_*.json`). Las estadisticas reconstruidas coinciden con las `norm_stats` de xlvla-pi05 con diferencias maximas de 0,0004 en media y 0,0005 en desviacion tipica. Los videos se re-codificaron de AV1 a H.264. El prompt es unicamente la frase de tarea, sin identidad de mano. El entrenamiento uso `launch_finetune.py` con batch global 128 (4x B200, 32 por GPU), learning rate 1e-4 con warmup del 5% y decaimiento coseno, 40.000 pasos, bf16 y normalizacion q01/q99. Todas las claves de accion son ABSOLUTE / NON_EEF.

## Capacidades

- Generacion de acciones de manipulacion diestra para un brazo con seis morfologias de mano distintas.
- Control multi-tarea: cuatro tareas de agarre y golpeo funcional en un mismo modelo.
- Procesamiento multimodal de dos camaras (tercera persona y eye-in-hand) junto con estado proprioceptivo de 31 dimensiones.
- Prediccion de acciones absolutas en el espacio articular de los dedos y en la pose de muneca.
- Generalizacion entre manos gracias al entrenamiento conjunto con seis morfologias.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo thinking.
- Capacidades multilingues no disponibles.

## Casos de uso

- Manipulacion diestra en laboratorio: el modelo puede ejecutar agarres de objetos como botellas, sartenes y hervidores con seis manos distintas, lo que permite comparar morfologias con un unico checkpoint y reducir el coste de experimentacion.
- Investigacion en transferencia entre embodiments: al compartir datos y representacion con la linea base pi0.5, sirve para aislar el efecto de la arquitectura GR00T frente a pi0.5 en igualdad de condiciones.
- Benchmark interno de modelos fundacionales de robotica: el par GR00T N1.7 / pi0.5 sobre el mismo dataset permite evaluar arquitecturas con una receta de datos controlada.
- Desarrollo de politicas de agarre funcional: la tarea FunctionalHammerStrike entrena el uso de herramientas, aplicable a prototipos de asistencia en tareas de golpeo controlado.
- Calibracion y normalizacion de datos de teleoperacion: la receta publicada (calibracion de muneca en simulador, normalizacion q01/q99, reconstruccion de estadisticas) es reutilizable para preparar nuevos datasets de manipulacion.
- Evaluacion de robustez multi-camara: el uso conjunto de camara externa y eye-in-hand permite estudiar politicas que dependen de la vista cercana para el ajuste fino de dedos.
- Base para ajustes posteriores: al ser un fine-tune completo sobre GR00T N1.7, puede servir como punto de partida para nuevas tareas con la misma morfologia de 31 dimensiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3.144 millones de parametros, en bf16 se requieren aproximadamente 6,3 GB solo para pesos, y en fp32 unos 12,6 GB, sin contar el codificador visual, el DiT ni las activaciones.
- GPU recomendadas: el entrenamiento se realizo con 4x B200 (32 por GPU en batch global 128); para inferencia se puede usar cualquier GPU con memoria suficiente, aunque no se especifican modelos concretos.
- Cabe en GPU de consumo: no confirmado; por tamano de pesos en bf16 es plausible en GPUs de 16-24 GB, pero no hay datos publicados de latencia ni de memoria real.
- Opciones de despliegue: libreria `gr00t` (Isaac-GR00T); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de acciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dexverse-CSI/groot-n17-xlvla-single-40k | 3.144 M | no disponible | 4 tareas, 6 manos, 1 brazo | no disponible | Hugging Face, 0 descargas |
| Dexverse-CSI/xlvla-pi05 (linea base) | no disponible | no disponible | mismas 4 tareas y 6 manos | no disponible | Hugging Face |
| nvidia/GR00T-N1.7-3B (modelo base) | 3.000 M aprox. | no disponible | proposito general de robotica | no disponible en esta ficha | Hugging Face (NVIDIA) |

La comparacion principal es con xlvla-pi05, que usa los mismos datos, prompts y representacion, y con el modelo base de NVIDIA, del que este checkpoint es un ajuste completo.

## Limitaciones y advertencias

- Entrenado exclusivamente con un brazo y seis manos concretas; no se espera generalizacion a otras morfologias sin nuevo ajuste.
- Solo cuatro tareas de agarre y golpeo; el vocabulario de comportamientos es muy reducido.
- El prompt no incluye identidad de mano, por lo que el modelo debe inferir la morfologia del contexto visual y de estado.
- Licencia no declarada: no hay garantia de uso comercial y conviene contactar con el autor antes de produccion.
- Sin benchmarks publicados ni descargas: no hay evidencia externa de rendimiento ni de robustez.
- Riesgo de sobreajuste a las condiciones de teleoperacion (60 fps, camaras concretas, calibracion de simulador).
- El repositorio incluye checkpoints intermedios solo con pesos y no reanudables, lo que limita la reproducibilidad del entrenamiento.
- No se documentan sesgos, idiomas ni riesgos de alucinacion en el sentido de modelos de lenguaje; el riesgo principal es la ejecucion de acciones incorrectas en robot real.

## Enlaces

- Hugging Face: https://huggingface.co/Dexverse-CSI/groot-n17-xlvla-single-40k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Linea base pi0.5: https://huggingface.co/Dexverse-CSI/xlvla-pi05
- Repositorio Isaac-GR00T (commit 708617f): no disponible como URL en la informacion proporcionada
