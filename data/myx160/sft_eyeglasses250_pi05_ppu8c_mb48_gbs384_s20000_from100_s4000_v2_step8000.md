# myx160/sft_eyeglasses250_pi05_ppu8c_mb48_gbs384_s20000_from100_s4000_v2_step8000

## Resumen

Este repositorio contiene un checkpoint de ajuste fino supervisado (SFT) del modelo OpenPI, identificado en el nombre como variante `pi05`, entrenado para una tarea robotica concreta: coger unas gafas, plegar las patillas y depositarlas en una caja situada a la derecha. El autor es el usuario de HuggingFace `myx160` y el artefacto esta pensado para el brazo robotico Piper dentro del ecosistema LeRobot. No es un modelo de lenguaje de proposito general, sino una politica vision-lenguaje-accion (VLA) que convierte observaciones visuales y estado propioceptivo en comandos de accion de 14 dimensiones.

El checkpoint corresponde al paso 8000 de un schedule de 20000 pasos, con un calentamiento de 1000 pasos y un LR maximo de 1e-5. Se inicializa desde un SFT previo de 100 episodios (paso 4000) y se entrena sobre el dataset `myx160/eyeglasses_grasp_250episode`, que contiene 250 episodios de demostracion real de la tarea de las gafas. La entrada son tres camaras RGB mas un vector de estado de 14 dimensiones; la salida es una accion de 14 dimensiones con horizonte de 50 pasos.

Su relevancia es acotada pero clara: es un artefacto reproducible y reanudable (incluye shards DCP, estado del optimizador, RNG y estadisticas de normalizacion) que sirve como punto de partida para entrenamiento posterior o como base de evaluacion en robotica real. El propio autor advierte de que la perdida de entrenamiento no es evidencia de exito en robot real y que la seleccion de checkpoints debe hacerse con el protocolo de evaluacion en el mundo fisico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) de OpenPI; el nombre del checkpoint indica la variante `pi05` (pi0.5). No se detalla en la model card |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; no se documenta ventana de contexto de texto. El horizonte de accion es de 50 pasos |
| Tipos de cuantizacion | no disponible (no se ofrecen pesos cuantizados) |
| Idiomas soportados | no disponibles; la unica entrada linguistica documentada es la instruccion de tarea en ingles ("Pick up the eyeglasses, fold the temples, and place them on the box on the right.") |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch DCP (8 shards) para el actor, mas `model_state_dict/full_weights.pt` (PyTorch), `data.pt` y `rng.pt`. No hay safetensors ni GGUF |
| Libreria | `openpi` |
| Pipeline declarado | `robotics` |
| Entradas | 3 camaras RGB + estado de 14 dimensiones |
| Salidas | Accion de 14 dimensiones, horizonte 50 |
| Tamano del repositorio | 34,1 GB (incluye estado del optimizador y shards de entrenamiento) |
| Dataset de entrenamiento | `myx160/eyeglasses_grasp_250episode`, revision `fd7ce02d49c4b150becdf657ec010faaa0e63d73` (250 episodios) |
| Paso del checkpoint | 8000 de 20000 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de encuadrarla en OpenPI como modelo VLA, con la etiqueta `pi05` en el identificador. El contrato de entrenamiento si esta detallado: se parte de pesos de arranque en caliente procedentes de un SFT de 100 episodios en el paso 4000, y se entrena a parametros completos con FSDP `full_shard`. El lote por rango es de 48, el lote global de 384, con una unica acumulacion por paso y un mundo de 8 (dispositivos fisicos 8 a 15, denotados como PPU). El schedule es de 20000 pasos con 1000 de calentamiento y LR pico de 1e-5.

El checkpoint publicado esta en el paso 8000 y es reanudable: el directorio `global_step_8000/actor/` contiene los 8 shards DCP, el estado del optimizador, `.metadata`, los pesos completos en `model_state_dict/full_weights.pt`, `data.pt`, `rng.pt` y un marcador `SFT_CHECKPOINT_COMPLETE.json`. Ademas incluye las estadisticas de normalizacion exactas y el contrato de transformaciones que exige el pipeline de inferencia en robot real. No se documentan en la informacion disponible ni la composicion exacta del dataset, ni el uso de RLHF/DPO, ni innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa u otras).

## Capacidades

- Generacion de acciones motoras: produce comandos de 14 dimensiones con horizonte de 50 pasos para controlar el brazo Piper en una tarea de manipulacion concreta.
- Percepcion visual multi-camara: consume tres flujos RGB simultaneos, lo que permite estimar la pose de las gafas y de la caja desde varios puntos de vista.
- Fusion vision-lenguaje-accion: condiciona el comportamiento en la instruccion textual de la tarea ("coger las gafas, plegar las patillas y dejarlas en la caja de la derecha").
- Integracion de estado propioceptivo: incorpora un vector de estado de 14 dimensiones junto a las imagenes.
- Reanudacion de entrenamiento: al conservar estado del optimizador, RNG y shards DCP, permite continuar el SFT desde el paso 8000 sin rehacer el trabajo previo.
- Inferencia en robot real: el directorio del actor incluye las estadisticas de normalizacion y el contrato de transformaciones necesarios para el pipeline de despliegue.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, generacion de codigo, matematicas, vision general de proposito abierto, audio ni modo de razonamiento explicito.

## Casos de uso

- Manipulacion robotica de la tarea de las gafas: el modelo se usa como politica directa para que el brazo Piper recoja las gafas, pliegue las patillas y las deposite en la caja, ejecutando acciones de 14 dimensiones con horizonte de 50.
- Punto de partida para ajuste fino posterior: al ser un checkpoint reanudable con estado del optimizador, se puede continuar el entrenamiento hacia los 20000 pasos o adaptarlo a una variante de la misma tarea sin reiniciar el schedule.
- Evaluacion comparativa de checkpoints: sirve como punto intermedio (paso 8000) frente a otros pasos del mismo schedule para medir la curva de exito real en el protocolo de evaluacion congelado.
- Investigacion en SFT de politicas VLA: el contrato de entrenamiento documentado (lote global 384, FSDP full_shard, LR pico 1e-5, 8 dispositivos) permite reproducir o auditar la receta en un cluster equivalente.
- Replicacion en laboratorio con LeRobot y Piper: dado que el modelo esta etiquetado con `lerobot` y `piper`, encaja en flujos de trabajo de robotica de codigo abierto sobre ese brazo concreto.
- Generacion de datos sinteticos o aumentados de trayectorias: las predicciones del modelo pueden usarse como referencia para comparar con trayectorias humanas del dataset de 250 episodios.
- Validacion de pipelines de transformacion: las estadisticas de normalizacion y el contrato de transformaciones incluidos en el actor permiten verificar la coherencia entre el preprocesado de entrenamiento y el de inferencia en robot real.
- Docencia y prototipado en robotica: un artefacto completo y pequeno en numero de tareas sirve para ilustrar el ciclo completo de SFT de un VLA sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito en robot real, tasas de exito por episodio ni comparaciones numericas. Se indica explicitamente que la perdida de entrenamiento, por si sola, no constituye evidencia de exito en el mundo fisico y que la seleccion de checkpoints debe hacerse con el protocolo de evaluacion real congelado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 34,1 GB, pero ese tamano incluye los 8 shards DCP, el estado del optimizador, `rng.pt` y `data.pt`, por lo que no equivale al peso de inferencia.
- GPU recomendadas: no disponibles en la informacion proporcionada. El entrenamiento se ejecuto sobre 8 dispositivos fisicos (etiquetados como PPU, dispositivos 8 a 15) con FSDP `full_shard` y lote por rango de 48.
- Compatibilidad con GPU de consumo: no confirmada. No se publican pesos cuantizados ni requisitos minimos, por lo que no se puede afirmar que quepa en una GPU de gama de consumo.
- Opciones de despliegue: el modelo se sirve mediante la libreria `openpi` y el pipeline de inferencia en robot real del directorio `actor/`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no existen formatos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos numericos de modelos comparables en la informacion proporcionada. Cualitativamente, este checkpoint pertenece a la categoria de politicas VLA de robotica de codigo abierto, junto a propuestas como OpenPI pi0/pi0.5, OpenVLA o RDT-1B, pero no se han facilitado parametros, ventanas de contexto, resultados ni condiciones de licencia de esas alternativas, por lo que la comparacion cuantitativa queda como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| myx160/sft_eyeglasses250_..._step8000 | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Alternativas VLA (OpenPI pi0/pi0.5, OpenVLA, RDT-1B) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion recibida |

## Limitaciones y advertencias

- Artefacto de entrenamiento, no de produccion: el autor indica que es un checkpoint de entrenamiento y que la perdida no demuestra exito en robot real.
- Checkpoint intermedio: corresponde al paso 8000 de 20000, por lo que no representa el modelo final del schedule.
- Especificidad de tarea extrema: esta entrenado para una unica tarea (gafas, patillas y caja) y no se documenta generalizacion a otras instrucciones ni objetos.
- Datos limitados: 250 episodios de demostracion, un volumen reducido que suele implicar poca robustez ante cambios de iluminacion, posicion de objetos o disposicion de camaras.
- Sin benchmarks: no hay metricas publicas de exito que permitan estimar el rendimiento esperado.
- Dependencia de hardware concreto: el pipeline de inferencia asume el brazo Piper, tres camaras RGB, un estado de 14 dimensiones y un contrato de transformaciones y normalizacion especifico.
- Riesgo de sobreajuste al entorno de recogida de datos: al ser SFT puro sobre una tarea y un montaje concretos, es previsible una degradacion fuera de la distribucion de entrenamiento.
- Idiomas: no se documenta soporte multilingue; la instruccion de tarea facilitada esta en ingles.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero el repositorio no incluye garantias ni validacion de seguridad fisica para operar un robot real.
- Sin cuantizaciones publicadas: no hay versiones GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware modesto.
- Advertencia sobre los resultados de busqueda web: las consultas realizadas devolvieron unicamente informes de mercado sobre sandwiches y pan, sin ninguna relacion con el modelo; no aportan informacion util.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/myx160/sft_eyeglasses250_pi05_ppu8c_mb48_gbs384_s20000_from100_s4000_v2_step8000
- Dataset de entrenamiento: `myx160/eyeglasses_grasp_250episode`, revision `fd7ce02d49c4b150becdf657ec010faaa0e63d73` (enlace directo no proporcionado en la informacion disponible)
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada
