# Potestates/TERRA

## Resumen

TERRA es un conjunto de políticas de robotica (vision-language-action, VLA) publicadas por el usuario Potestates en Hugging Face, construidas sobre OpenVLA-7B y post-entrenadas con la fase 2 de acciones latentes de TERRA (etiquetas `latp2_inv`). El repositorio no contiene un modelo de lenguaje generativo al uso, sino varios directorios independientes, cada uno con una política entrenada para una tarea concreta: tres variantes sobre las suites de simulacion LIBERO y una política para un brazo robotico real AgileX Piper.

Cada directorio incluye los pesos fusionados (`model-*.safetensors`), las cabezas de accion y latentes (`action_decoder.pt`), el fichero `dataset_statistics.json` necesario para des-normalizar las acciones, metadatos de control (`ctrl_meta.json`) y el procesador/tokenizer. La evaluacion de las variantes LIBERO se realiza con la herramienta `acdc_la.downstream.vla.run_libero_eval_cont` del repositorio Latent_Free (rama `newton`).

La relevancia de esta publicacion es acotada: se trata de un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin model card estandar ni licencia declarada, y con el repositorio marcado como privado en la propia model card. Su interes principal es reproducir los resultados reportados en las suites LIBERO y disponer de una política real-robot de referencia sobre el brazo Piper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de OpenVLA-7B con fase 2 de acciones latentes TERRA (cabezas de accion y latentes separadas) |
| Parametros totales | 7B (heredados de OpenVLA-7B; no se detalla el recuento exacto en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos fusionados `model-*.safetensors`) + `action_decoder.pt` (PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de OpenVLA-7B, un VLA que combina un codificador visual con un transformer de lenguaje de 7B para mapear observaciones visuales e instrucciones en lenguaje natural a acciones motoras. Sobre esta base se aplica la fase 2 de acciones latentes de TERRA, que introduce etiquetas `latp2_inv` y una cabeza de flujo (flow head) con 4 tokens de consulta, ademas de una cabeza de decodificacion de acciones separada (`action_decoder.pt`).

El post-entrenamiento se realizo sobre las suites de simulacion LIBERO (`libero_10_no_noops` y `libero_goal_no_noops`) con el conjunto completo de demos, y sobre un conjunto de 142 demostraciones de un brazo real AgileX Piper para la tarea `piper_pick_can_10k`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Control robotico visuomotor: genera acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural.
- Manipulacion de objetos en entornos simulados LIBERO (tareas de largo horizonte `libero_10` y de objetivo `libero_goal`).
- Manipulacion en robot real: politica entrenada para la tarea de recoger una lata (`pick_can`) con el brazo AgileX Piper.
- Acciones latentes con cabeza de flujo y 4 tokens de consulta, orientadas a la fase 2 del esquema TERRA.
- Normalizacion/des-normalizacion de acciones mediante `dataset_statistics.json`.
- Soporte de tool calling: no disponible.
- Soporte de agentes multi-paso: no disponible como capacidad general; la politica opera por episodios de tarea.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Reproduccion de resultados LIBERO: usar `libero_10_full` y `libero_goal_full` con el script `run_libero_eval_cont` del repositorio Latent_Free (rama `newton`) para verificar las tasas de exito reportadas (89,0 y 94,4 sobre 500 episodios).
- Investigacion en acciones latentes: comparar el esquema `latp2_inv` con alternativas de decodificacion de acciones sobre la misma base OpenVLA-7B.
- Transferencia simulacion-a-real: emplear la politica `piper_pick_can_10k` como referencia para tareas de pick-and-place en el brazo AgileX Piper y evaluar la brecha respecto a las variantes simuladas.
- Generacion de datos sinteticos de manipulacion: ejecutar las politicas LIBERO en simulacion para producir trayectorias etiquetadas que alimenten otros entrenamientos.
- Evaluacion de robustez: someter las politicas a variaciones de iluminacion, posicion de objetos o instrucciones para medir la degradacion del exito.
- Linea base para fine-tuning: partir de los pesos fusionados y las cabezas incluidas para adaptar la politica a nuevas tareas de manipulacion con pocas demos.

## Benchmarks y rendimiento

| Directorio | Suite | Demos | Exito LIBERO estandar (500 ep.) |
|---|---|---|---|
| libero_10_full | libero_10_no_noops | completo | 89,0 |
| libero_goal_full | libero_goal_no_noops | completo | 94,4 |
| piper_pick_can_10k | piper_pick_can (robot real, AgileX Piper) | 142 | no disponible (robot real) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable al tratarse de un modelo de accion y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al derivar de OpenVLA-7B, la inferencia en precision completa requiere del orden de 14-16 GB solo para pesos, mas el codificador visual y las cabezas.
- GPU recomendadas: no especificadas por el autor; por tamano, una GPU con 24 GB o mas (RTX 4090, A100, H100) es un punto de partida razonable.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en fp16; no confirmado en la informacion disponible.
- Opciones de despliegue: el autor indica el script `acdc_la.downstream.vla.run_libero_eval_cont` del repositorio Latent_Free (rama `newton`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TERRA (Potestates) | 7B (base OpenVLA-7B) | no disponible | 89,0 / 94,4 en LIBERO 10 / goal | no disponible | Hugging Face (repo marcado privado en la model card) |
| OpenVLA-7B | 7B | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | publico en Hugging Face |
| Alternativas VLA de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para una comparativa cuantitativa con otras politicas VLA.

## Limitaciones y advertencias

- La model card declara `private: true`, lo que puede impedir el acceso publico a los ficheros pese a aparecer en el buscador de Hugging Face.
- No se declara licencia: no hay autorizacion explicita para uso comercial ni para redistribucion.
- El repositorio no incluye model card estandar ni idiomas soportados; la documentacion se limita a la tabla de directorios y al README especifico de la politica real.
- Cada politica esta entrenada para una tarea o suite concreta; no es un modelo general y no debe esperarse generalizacion fuera de LIBERO 10, LIBERO goal o la tarea `pick_can` en Piper.
- Riesgo de sobreajuste a las condiciones de simulacion y a las 142 demos del robot real; la transferencia a otras configuraciones no esta validada en la informacion disponible.
- Sin datos sobre sesgos, alucinacion en instrucciones o robustez ante lenguaje ambiguo.
- El rendimiento reportado (89,0 y 94,4) procede del propio autor y no se ha verificado de forma independiente en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Potestates/TERRA
- Perfil del autor: https://huggingface.co/Potestates
- Repositorio Latent_Free (rama `newton`): no disponible como URL directa en la informacion proporcionada
- Paper de TERRA: no disponible en la informacion proporcionada
- Blog o demo oficial: no disponible en la informacion proporcionada
