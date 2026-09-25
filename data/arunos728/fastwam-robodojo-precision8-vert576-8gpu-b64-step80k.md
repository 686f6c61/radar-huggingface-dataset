# arunos728/fastwam-robodojo-precision8-vert576-8gpu-b64-step80k

## Resumen

FastWAM es un modelo de mundo para robotica (world model) construido sobre el backbone Wan2.2-TI2V-5B, un transformer de difusion de video de 5.000 millones de parametros. Este checkpoint concreto es un ajuste fino realizado por el usuario arunos728 (Heeseung Kwon) sobre la suite **Precision** del benchmark RoboDojo, que agrupa 8 tareas de manipulacion robotica de precision. El modelo predice simultaneamente video futuro y secuencias de accion, de modo que aprende una representacion interna de la dinamica del entorno que despues se usa para planificar y actuar.

El problema que resuelve es el de la prediccion de acciones en entornos de manipulacion fina: dado un historial de observaciones de tres camaras, el modelo genera una ventana de 9 fotogramas de video y 32 pasos de accion (1,28 s a 25 fps), lo que permite entrenar politicas capaces de "imaginar" el futuro antes de ejecutar una accion. Es relevante porque muestra como adaptar un modelo generativo de video de gran escala a control robotico mediante una arquitectura ActionDiT derivada del DiT de Wan2.2.

El checkpoint exportado corresponde al **paso 80.000 de 100.000** del calendario coseno, por lo que es un estado intermedio y el autor advierte explicitamente que un checkpoint posterior deberia rendir mejor. El entrenamiento se hizo con 8 GPU H100 de 80 GB y DeepSpeed ZeRO-1. La licencia es Apache 2.0, lo que facilita su uso comercial, y el tamano del repositorio es de 12 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ActionDiT: backbone DiT interpolado linealmente desde el DiT de Wan2.2, escalado alpha, 1024 de dimension oculta; modelo de mundo con difusion de video + prediccion de acciones |
| Parametros totales | Aproximadamente 5.000 millones (heredados del base Wan-AI/Wan2.2-TI2V-5B); no se publica un recuento exacto del fine-tune |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en el sentido de contexto de texto; ventana de prediccion de 33 pasos (9 fotogramas de video + 32 pasos de accion) |
| Tipos de cuantizacion | No disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (modelo de robotica; no es un modelo linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`), fichero `step_080000.pt` de 12 GB; no hay safetensors ni GGUF |
| Modelo base | Wan-AI/Wan2.2-TI2V-5B |
| Pipeline | robotics |
| Entradas | 3 camaras: cam_high, cam_left_wrist, cam_right_wrist (lienzo vertical 576x256 = tres teselas de 192x256) |
| Dimension de accion y estado | 14-D (brazo izquierdo 0:6, pinza izquierda 6:7, brazo derecho 7:13, pinza derecha 13:14) |
| Ficheros incluidos | `step_080000.pt`, `dataset_stats.json`, `config.yaml` |
| Tamano del repositorio | 12,0 GB |

## Arquitectura y entrenamiento

La arquitectura parte del transformer de difusion (DiT) de Wan2.2-TI2V-5B y lo convierte en un ActionDiT: el backbone se interpola linealmente desde el DiT original, se escala con un factor alpha y se fija en 1024 dimensiones ocultas. Sobre esa base, el modelo combina una cabeza generativa de video con una cabeza de prediccion de acciones, de forma que predice el futuro visual y la secuencia de control de manera conjunta. El entrenamiento usa la receta "uncond", es decir, sin condicionamiento de accion en el DiT de video, y con `mot_checkpoint_mixed_attn: false`. La ventana de entrenamiento es de 33 fotogramas con `action_video_freq_ratio 4`, lo que produce 9 fotogramas de video y 32 pasos de accion por ventana.

Los datos provienen de la suite Precision de RoboDojo: 8 tareas x 100 episodios = 800 episodios y 368.459 fotogramas a 25 fps, con 3 camaras a 320x240 (H.264) y acciones y estados de 14 dimensiones. Las 8 tareas son build_tower, deposit_coin, fasten_screws, insert_key, insert_tubes, play_Xylophone, plug_in_charger y pour_balls_into_vase. El dataset se construyo extrayendo los 8 bloques de la dimension Precision de `RoboDojo-Benchmark/RoboDojo` y reindexandolos como corpus independiente. El ajuste fino se ejecuto con 8 GPU H100 de 80 GB, DeepSpeed ZeRO-1, batch de 8 por GPU (batch global 64), learning rate 1e-4 con calendario coseno, weight decay 1e-2 y sin acumulacion de gradientes. La perdida en el momento de la exportacion fue de 0,0803 total y 0,0006 de accion; el autor no documenta fases de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Prediccion de video futuro a partir de observaciones de tres camaras (camara alta y dos munecas), con un lienzo vertical de 576x256 sin recorte y manteniendo la relacion de aspecto 4:3 de las teselas originales.
- Prediccion de acciones de manipulacion de 14 dimensiones (dos brazos de 6 grados de libertad mas dos pinzas) para 32 pasos por ventana.
- Modelado de mundo para manipulacion robotica de precision: ocho tareas especificas (apilar torres, depositar moneda, apretar tornillos, insertar llave, insertar tubos, tocar el xilofono, enchufar cargador y verter bolas en un jarron).
- Cambio entre actuar con y sin "imaginacion" de futuro, segun la actualizacion del codebase FastWAM.
- Soporte nativo de LeRobot v3.0 en el codebase FastWAM, lo que facilita la integracion con ese ecosistema de datasets y politicas.
- No se documenta soporte de tool calling, function calling, agentes, capacidades multilingues, vision general, audio ni modo de razonamiento explicito; son capacidades fuera del proposito del modelo.

## Casos de uso

- Planificacion de politicas de manipulacion en simulacion: el modelo puede generar la ventana de 32 pasos de accion y 9 fotogramas de video para evaluar una trayectoria candidata antes de ejecutarla, aprovechando la prediccion conjunta de accion y video.
- Entrenamiento de politicas por imitacion con objetivo auxiliar de prediccion de video: al modelar la dinamica futura, sirve como inicializacion o como componente de un sistema de aprendizaje que necesita anticipar consecuencias visuales.
- Investigacion en tareas de precision (insertar llave, apretar tornillos, enchufar cargador): los ocho conjuntos de datos de la suite Precision permiten validar tecnicas de control fino sobre tareas con tolerancias estrechas.
- Evaluacion comparativa en el benchmark RoboDojo: al ser un checkpoint de un suite concreto del benchmark, es util para reproducir resultados en la misma particion de tareas y comparar con otras politicas registradas en el leaderboard.
- Generacion de datos sinteticos de video robotico: las 9 predicciones de fotogramas por ventana pueden emplearse para aumentar corpus de entrenamiento con rollouts imaginados.
- Experimentos de disposicion de camaras: el lienzo vertical de tres teselas es una alternativa explicita al layout "T" de robotwin, por lo que sirve para estudiar el efecto de la geometria del canvas en el rendimiento de la politica.
- Analisis de sensibilidad de normalizacion: dado que el propio autor senala que `dataset_stats.json` es imprescindible, es un buen banco de pruebas para medir como afectan las estadisticas de normalizacion (z-score) a la calidad de las acciones generadas.
- Base para ajuste fino en tareas robotica propias: al ser Apache 2.0 y derivar de Wan2.2-TI2V-5B, se puede reentrenar sobre datasets propios en formato LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta las perdidas del entrenamiento en el paso de exportacion (total 0,0803 y accion 0,0006) y advierte que el checkpoint es un estado intermedio (80.000 de 100.000 pasos) sin que el learning rate haya alcanzado su suelo. No se proporcionan valores de MMLU, HumanEval, GSM8K ni metricas de exito en tareas de RoboDojo.

## Requisitos de hardware

- El fichero de pesos ocupa 12 GB (`step_080000.pt`), por lo que la VRAM minima de inferencia es del orden de 12 GB solo para los pesos; hay que sumar el coste de activaciones y buffers, que se estima en varios gigabytes adicionales. Estas cifras son estimaciones basadas en el tamano del checkpoint y no estan confirmadas por el autor.
- Entrenamiento: 8 GPU H100 de 80 GB con DeepSpeed ZeRO-1. El directorio `state/` (momentos del optimizador, shards ZeRO, RNG) ocupaba 80 GB y no se incluye.
- GPU consumer: es plausible que quepa en tarjetas de 24 GB como la RTX 4090, y quiza en modelos de 16 GB si se aplica cuantizacion o se reduce la precision, pero no hay confirmacion oficial. Se recomienda validar en el hardware objetivo.
- Opciones de despliegue: el modelo se sirve con la libreria `wan2.2` y el codebase FastWAM; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo (no es un LLM). FastWAM ofrece soporte nativo de LeRobot v3.0.
- Es obligatorio cargar `dataset_stats.json` en inferencia: alimentar acciones sin normalizar o con estadisticas de otro corpus produce resultados invalidos. Este fichero viene en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fastwam-robodojo-precision8-vert576-8gpu-b64-step80k | ~5B (base Wan2.2-TI2V-5B) | 33 pasos (9 fotogramas + 32 acciones) | No publicado | Apache 2.0 | HuggingFace (0 descargas, 0 likes) |
| Wan-AI/Wan2.2-TI2V-5B | 5B | Modelo base de generacion de video texto-imagen-a-video | No disponible en esta informacion | No disponible en esta informacion | HuggingFace |
| Variante de layout "T" (robotwin) de la misma suite | ~5B (mismo backbone) | Misma ventana, canvas comprimido a 0,8:1 por tesela | No publicada; el autor afirma que la variante vertical evita la compresion del layout T | Apache 2.0 | Citada en la model card, sin enlace directo |

No se dispone de datos comparativos de otros modelos de mundo roboticos (por ejemplo, alternativas de la misma categoria de prediccion de video-accion) en la informacion proporcionada, por lo que la comparativa se limita al modelo base y a la variante de layout de la misma suite. FastWAM (codebase oficial) describe un modelo actualizado capaz de alternar entre actuar con y sin imaginacion de futuro, pero no se aportan cifras de rendimiento comparables.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 80.000 de 100.000 de un calendario coseno, por lo que el learning rate no habia llegado a su minimo. El autor recomienda comparar con checkpoints posteriores en lugar de asumir que este es el mejor.
- Dependencia critica de `dataset_stats.json`: la normalizacion es z-score calculada sobre el subconjunto de 800 episodios. Usar acciones sin normalizar o estadisticas de otro corpus produce resultados invalidos ("garbage" segun la model card).
- No es reanudable para entrenamiento: el directorio `state/` de 80 GB con momentos del optimizador, shards de ZeRO y estado del RNG no esta incluido. El checkpoint es para inferencia.
- Alcance limitado a 8 tareas de precision: el ajuste se hizo sobre un suite concreto de RoboDojo, por lo que la generalizacion fuera de esas tareas no esta documentada.
- Dominio muy especifico: configuracion fija de tres camaras con un canvas vertical de 576x256 y acciones de 14 dimensiones. Cambiar la disposicion de camaras o la morfologia del robot invalida el modelo.
- Sin datos de sesgo, robustez o comportamiento fuera de distribucion. No hay evaluacion de alucinacion en el sentido generativo ni analisis de fallos.
- Idiomas: no aplica ni se documenta, al no ser un modelo linguistico.
- Licencia Apache 2.0, sin restricciones conocidas para uso comercial, pero se heredan los terminos del modelo base Wan-AI/Wan2.2-TI2V-5B, que conviene revisar.
- Adopcion nula en el momento del registro: 0 descargas y 0 likes, sin validacion independiente de la comunidad.
- No se documentan tipos de cuantizacion, por lo que el despliegue en hardware limitado requiere conversion propia y no verificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arunos728/fastwam-robodojo-precision8-vert576-8gpu-b64-step80k
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Perfil del autor (arunos728 / Heeseung Kwon): https://huggingface.co/arunos728
- Modelos del autor: https://huggingface.co/arunos728/models
- Codebase oficial de FastWAM: https://github.com/yuantianyuan01/FastWAM
- Repositorio oficial del benchmark RoboDojo: https://github.com/robodojo-benchmark/RoboDojo
- Sitio web de RoboDojo: https://robodojo-benchmark.com/
