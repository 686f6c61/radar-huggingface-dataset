# sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_5k

## Resumen

Se trata de una politica de robotica (Vision-Language-Action, VLA) entrenada con LeRobot y publicada en HuggingFace por el usuario `sam-guided-vlas`. El modelo es un ajuste fino (fine-tune) del modelo base `lerobot/pi05_base`, que a su vez implementa π₀.₅ (pi05), la evolucion de π₀ desarrollada por Physical Intelligence y adaptada de su repositorio open source OpenPI. El objetivo declarado de pi05 es la generalizacion en entornos abiertos: ejecutar tareas de manipulacion en situaciones y entornos no vistos durante el entrenamiento.

Este checkpoint concreto se ha entrenado durante 5000 pasos con un lote de 16, optimizador AdamW y tasa de aprendizaje 5e-05, sobre un dataset de 200 episodios y 69.392 fotogramas a 20 FPS. La politica esta especializada en un robot tipo Panda con tres camaras (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y produce acciones de 7 dimensiones a partir de un estado de 9 dimensiones y tres imagenes de 224x224.

Su relevancia radica en que ejemplifica el flujo actual de investigacion en robotica con modelos fundacionales: partir de un VLA preentrenado y especializarlo con pocos miles de pasos sobre datos de imitacion propios. No obstante, es un artefacto de investigacion con cero descargas y cero valoraciones en el momento de la consulta, y sin resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (pi05); detalle interno no disponible |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio distribuido en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo es un VLA de tipo π₀.₅ (pi05), la evolucion de π₀ de Physical Intelligence, integrado en LeRobot a partir de OpenPI. La informacion disponible no detalla la composicion interna de la red (tipo de transformer, atencion, uso de experto mixto, etc.), por lo que no se puede confirmar si emplea decodificacion especulativa, atencion lineal ni otras innovaciones concretas. El recuento real de parametros reportado por los pesos en safetensors es de 4.143.404.816.

El entrenamiento es un ajuste fino supervisado por imitacion sobre el dataset `sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live`: 200 episodios, 69.392 fotogramas, tasa de 20 FPS y tareas de manipulacion de objetos de cocina y menaje (basket, boxed food, cake, can, hamburger, lemon, orange, spice, squash, spray, soap dispenser, jam, jar, cereal, knife block, kettle, pear, potato, sweet potato, scone). La configuracion registrada es de 5000 pasos, lote 16, optimizador AdamW, tasa 5e-05, semilla 0 y LeRobot 0.6.0. No se menciona uso de RLHF, DPO ni fases de alineamiento; el procedimiento es de aprendizaje por imitacion a partir de demostraciones.

Las entradas de la politica son `observation.state` (forma `(9,)`) y tres flujos visuales (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`, cada uno `(3, 224, 224)`), y la salida es una accion de forma `(7,)`. El robot objetivo es un Panda.

## Capacidades

- Generacion de acciones motoras de 7 dimensiones para control de un robot manipulador tipo Panda.
- Percepcion visual multi-camara: combina una vista externa (`agentview`) con dos vistas de muneca (`robot0_eye_in_hand`, `robot0_eye_in_hand_2`).
- Fusion de estado propioceptivo (`observation.state`, 9 dimensiones) con informacion visual.
- Ejecucion de tareas de recogida y manipulacion de objetos de cocina y menaje (20 categorias distintas declaradas en el dataset).
- Aprendizaje por imitacion: reproduce comportamientos derivados de demostraciones, no de RLHF.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso basado en agentes.
- Idiomas soportados: no disponible.
- Capacidades especiales (modo de razonamiento explicito, vision generativa, audio): no disponibles.

## Casos de uso

- Manipulacion de objetos en entornos de laboratorio: el modelo puede ejecutar tareas de recogida como "basket", "can" o "jar" sobre un robot Panda, aprovechando las tres vistas de camara para localizar y agarrar objetos.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida reproducible (semilla 0, 5000 pasos) para estudiar el efecto del numero de pasos y del dataset en el rendimiento de un VLA.
- Ajuste fino sobre datos propios: al estar basado en `lerobot/pi05_base`, puede reentrenarse con el comando `lerobot-train` sobre nuevos datasets de demostraciones sin partir de cero.
- Evaluacion de generalizacion en entornos abiertos: el proposito declarado de pi05 es generalizar a entornos no vistos, por lo que es adecuado para experimentos de transferencia simulacion-real (el dataset incluye el sufijo `sim` y `live`).
- Automatizacion de tareas de picking en cocinas o almacenes simulados: las 20 categorias de objetos del dataset cubren alimentos y utensilios, lo que permite probar un flujo de recogida categorica.
- Despliegue en robot fisico con `lerobot-rollout`: la model card incluye el comando exacto para ejecutar la politica en un Panda con duracion configurable (por ejemplo, 60 segundos) y tarea concreta.
- Analisis de robustez ante enmascaramiento y desenfoque: el nombre del dataset sugiere variantes con `mask` y `blur`, lo que lo hace util para estudiar sensibilidad a oclusiones y desenfoque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone, por tanto, de tasas de exito por tarea, MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- VRAM estimada solo para pesos: aproximadamente 16,6 GB en fp32, 8,3 GB en bf16/fp16 y 4,1 GB en int8. Estas cifras son calculos teoricos a partir de los 4.143.404.816 parametros; no las proporciona el autor.
- VRAM adicional necesaria para activaciones del codificador visual con tres entradas de 224x224 y para el estado de inferencia; no cuantificada en la informacion disponible.
- GPU recomendadas: no especificadas por el autor. Por tamano, un ajuste en bf16 cabe con holgura en A100 (40/80 GB) y H100 (80 GB), y de forma mas justa en una RTX 4090 (24 GB).
- Cabe en GPU de consumo: probablemente si en tarjetas con 12-24 GB en bf16, y en 8 GB si se aplica cuantizacion a int8, aunque no hay confirmacion oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion en robot y `lerobot-train` para entrenamiento). No se documenta despliegue con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a politicas VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modificado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05 fine-tune, steps 5k) | 4.143.404.816 | no disponible | 2026-09-10 | apache-2.0 | HuggingFace, 0 descargas |
| lerobot/pi05_base | no disponible | no disponible | no disponible | apache-2.0 | HuggingFace (modelo base) |
| π₀ (predecesor) | no disponible | no disponible | no disponible | no disponible | OpenPI (open source) |

El modelo es un ajuste fino del modelo base `lerobot/pi05_base` y un refinamiento de π₀ mediante π₀.₅ (pi05). No se dispone de parametros, contexto ni resultados comparativos de esas variantes, por lo que no es posible establecer una comparacion cuantitativa fiable frente a alternativas como OpenVLA u otras politicas VLA. No disponible.

## Limitaciones y advertencias

- Sin resultados de evaluacion: la model card no aporta tasas de exito ni validacion en robot real, por lo que el rendimiento en produccion es desconocido.
- Cero adopcion registrada: 0 descargas y 0 valoraciones en el momento de la consulta, lo que dificulta contrastar su comportamiento con terceros.
- Especializacion estrecha: entrenado sobre 200 episodios y 20 tareas de menaje de cocina; es probable que no generalice a tareas, objetos o morfologias de robot distintas a las del dataset.
- Dependencia de la configuracion de camaras: la politica espera exactamente las claves `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`; nombres o calibraciones distintas pueden invalidar la inferencia.
- Riesgo de alucinacion motora: como toda politica generativa de acciones, puede producir trayectorias plausibles pero incorrectas, con riesgo fisico en un robot real.
- Sesgos: no documentados, pero heredados del dataset de demostraciones (entorno simulado `sim` y grabaciones `live`), lo que puede introducir sesgo hacia posiciones, iluminacion y objetos concretos.
- Limitaciones de idioma: no aplicable a texto, pero no se especifica ningun soporte de instrucciones en lenguaje natural distinto del campo `task`.
- Licencia apache-2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia; conviene revisar tambien las condiciones del modelo base y del dataset de origen.
- Uso en produccion: al ser un artefacto de investigacion sin evaluacion, no se recomienda desplegarlo en entornos reales sin validacion exhaustiva y medidas de seguridad fisica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_5k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live
- Blog de π₀.₅ (pi05), Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo (los resultados obtenidos correspondian a terminos homonimos sin relacion: una serie de television, el portal SAM.gov, una marca de herramienta y un master universitario), por lo que no se han incorporado enlaces adicionales de esa fuente.
