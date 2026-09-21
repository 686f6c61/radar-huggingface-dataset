# bklassen3434/smolvla_pick_pen_v2_frozen

## Resumen

smolvla_pick_pen_v2_frozen es un modelo de vision-lenguaje-accion (VLA) de 450 millones de parametros, publicado por el usuario bklassen3434 y derivado por ajuste fino de `lerobot/smolvla_base`. Resuelve una tarea de robotica muy concreta: la seleccion de un boligrafo guiada por lenguaje natural sobre una mesa donde estan presentes simultaneamente tres boligrafos (azul, rosa y gris). El modelo recibe como entrada imagenes de dos camaras (`observation.images.top` y `observation.images.wrist`) mas una instruccion textual del tipo "Pick up the blue pen", y produce acciones de control para un brazo SO-101.

La particularidad tecnica de esta variante es que congela el VLM y el codificador de vision, y entrena unicamente el action expert (`freeze_vision_encoder=true`, `train_expert_only=true`). Con ello se impide fisicamente que el ajuste fino sobrescriba el anclaje linguistico preentrenado, algo relevante cuando el dataset de ajuste es pequeno. Forma parte de un barrido de tres variantes junto a `smolvla_pick_pen_v2_lr1e4` y `smolvla_pick_pen_v2_lr5e5`, que si descongelan el codificador de vision.

Se trata de un modelo de investigacion con cero descargas y cero likes en el momento de redactar esta ficha, orientado a reproducir experimentos de ajuste fino de bajo coste en robotica, no a un uso comercial directo. Su relevancia actual radica en que demuestra que un ajuste de 10.000 pasos sobre una unica GPU A100 basta para especializar un VLA generico en una tarea de discriminacion semantica fina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); VLM congelado mas action expert entrenable |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible; el condicionamiento de lenguaje se limita a las instrucciones en ingles vistas en el entrenamiento |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `lerobot/smolvla_base`, un VLA de aproximadamente 450M de parametros que combina un backbone de vision-lenguaje con un action expert. En esta variante concreta, el ajuste fino mantiene congelados tanto el VLM como el codificador de vision y solo actualiza el action expert, de modo que la representacion semantica preentrenada (la que permite distinguir "azul" de "rosa") permanece intacta y el entrenamiento se concentra en el mapeo de esa representacion a acciones motoras.

El entrenamiento se realizo sobre el dataset `bklassen3434/pick_pen_v2_20260920_124400`, un conjunto de teleoperacion recogido con un SO-101 en el que los tres boligrafos estan presentes en todos los episodios, lo que fuerza al modelo a resolver la referencia linguistica en lugar de explotar un sesgo posicional. Se ejecutaron 10.000 pasos con tamano de lote 64 (aproximadamente 24 epocas), tasa de aprendizaje 1e-4 con decaimiento coseno y una perdida final de 0.043. El entrenamiento consumio 1 hora y 23 minutos en una A100-80GB (Modal) con un pico de 15,5 GB de memoria. Las camaras del dataset se renombran a las claves internas de SmolVLA mediante `--rename_map`, y ese mismo mapeo debe aplicarse en la evaluacion con `lerobot-rollout` o `lerobot-record`; omitirlo invalida el resultado.

## Capacidades

- Manipulacion robotica condicionada por lenguaje: ejecuta la tarea de recoger uno de tres boligrafos segun la instruccion recibida.
- Discriminacion semantica de color: distingue "blue pen", "pink pen" y "grey pen" con los tres objetos presentes en escena.
- Percepcion multimodal con dos camaras: procesa simultaneamente una vista cenital (`observation.images.top`) y una vista de muneca (`observation.images.wrist`).
- Generacion de acciones motoras continuas para un brazo SO-101 en el espacio de control nativo de LeRobot.
- Alineacion instruccion-accion preservada: al congelar el VLM, el anclaje linguistico del modelo base no se degrada durante el ajuste fino.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; las instrucciones de entrenamiento estan en ingles.

## Casos de uso

- Banco de pruebas de ajuste fino eficiente: sirve como referencia de cuanto se puede especializar un VLA de 450M con 10.000 pasos y una sola A100, util para calibrar presupuestos de experimentacion en robotica.
- Estudio de ablacion sobre congelacion de capas: al compararlo con `smolvla_pick_pen_v2_lr1e4` y `smolvla_pick_pen_v2_lr5e5`, permite medir el efecto de descongelar el codificador de vision frente a entrenar solo el action expert.
- Demostracion docente de condicionamiento por lenguaje: el escenario de los tres boligrafos es un ejemplo minimo y controlado para explicar como un VLA resuelve referencias ambiguas.
- Replicacion de experimentos de teleoperacion con SO-101: el pipeline documentado (dataset, rename map, `lerobot-rollout`) permite reproducir el entrenamiento y la evaluacion en un laboratorio propio.
- Punto de partida para tareas de picking con multiples objetos similares: la tecnica de mantener todos los candidatos en cada episodio es extrapolable a tareas de seleccion por atributo (color, forma, tamano).
- Evaluacion de robustez de politica frente a distractores: al haber tres objetos identicos salvo en color, es un entorno util para medir confusiones de la politica.
- Integracion en pipelines de LeRobot para pruebas de regresion: sirve como modelo de referencia en tests automatizados de rollout dentro de un flujo de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la perdida final de entrenamiento, 0.043, que no es comparable entre modelos y no equivale a una tasa de exito en la tarea.

| Metrica | Valor |
|---|---|
| Perdida final de entrenamiento | 0.043 |
| Tasa de exito en tarea | no disponible |
| MMLU, HumanEval, GSM8K u otros benchmarks de texto | no aplica / no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 450M de parametros, lo que supone aproximadamente 0,9 GB en fp16 y 1,8 GB en fp32 para los pesos. Sumando activaciones y buffers de vision, un presupuesto realista es de 2 a 4 GB de VRAM en fp16.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM deberia ser suficiente para inferencia; el autor uso una A100-80GB unicamente para el entrenamiento, donde el pico fue de 15,5 GB.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores. No se dispone de medidas de latencia en estas tarjetas.
- Opciones de despliegue: el modelo esta empaquetado para la libreria `lerobot` y se evalua con `lerobot-rollout` y `lerobot-record`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no son adecuados para un VLA orientado a control motor.
- Latencia y throughput: no disponibles. En robotica la metrica relevante es la frecuencia de control alcanzable, que el autor no reporta.
- Coste de entrenamiento observado: 1 hora y 23 minutos en 1x A100-80GB via Modal, con 15,5 GB de pico.
- Tiempo de ajuste fino: 10.000 pasos con lote 64, aproximadamente 24 epocas sobre el dataset de teleoperacion.

## Comparativa con modelos similares

| Modelo | Parametros | Entrenable en ajuste | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| bklassen3434/smolvla_pick_pen_v2_frozen | 450M | Solo action expert (VLM y vision congelados) | no disponible | apache-2.0 | Variante conservadora del barrido; preserva el anclaje linguistico |
| bklassen3434/smolvla_pick_pen_v2_lr1e4 | no disponible | Vision encoder descongelado | no disponible | apache-2.0 | Mismo dataset y protocolo, lr 1e-4, mayor capacidad de adaptacion visual |
| bklassen3434/smolvla_pick_pen_v2_lr5e5 | no disponible | Vision encoder descongelado | no disponible | apache-2.0 | Mismo dataset y protocolo, lr 5e-5 |
| lerobot/smolvla_base | 450M | Modelo base, sin ajustar | no disponible | no disponible en la informacion proporcionada | Modelo de partida generico, sin especializacion en la tarea de los boligrafos |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. Las tres comparten arquitectura, dataset y presupuesto de pasos, por lo que la unica diferencia documentada es que estrategia de congelacion y tasa de aprendizaje se aplico.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta ajustado para una unica tarea (recoger uno de tres boligrafos concretos sobre un SO-101). Fuera de ese entorno su comportamiento no esta caracterizado.
- Sin evaluacion publicada: no hay tasa de exito, matriz de confusion entre colores ni analisis de fallos. La perdida de 0.043 no permite afirmar que la tarea se resuelva de forma fiable.
- Dependencia critica del rename map: si no se aplica el mismo mapeo de camaras en inferencia que en entrenamiento, el modelo recibe observaciones con claves incorrectas y el resultado no es valido.
- Idiomas: las instrucciones de entrenamiento estan en ingles; se desconoce el comportamiento con instrucciones en castellano u otros idiomas.
- Generalizacion limitada por congelacion: al no actualizarse el codificador de vision, el modelo puede fallar ante cambios de iluminacion, fondo u objetos distintos a los del dataset de teleoperacion.
- Sesgos de dataset: el conjunto de teleoperacion refleja la posicion de camara, la mesa y el estilo de manipulacion del operador que lo grabo; no hay evidencia de robustez ante esas variaciones.
- Riesgo de alucinacion motora: como cualquier politica generativa, puede producir trayectorias plausibles pero incorrectas cuando la escena difiere de la distribucion de entrenamiento.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion externa ni reporte de terceros.
- Licencia: apache-2.0 permite uso comercial del artefacto, pero el modelo base y los datos subyacentes pueden tener sus propias condiciones, que deben verificarse por separado.
- Uso en produccion: no recomendado sin una evaluacion propia de tasa de exito, latencia de control y modos de fallo en el entorno real de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bklassen3434/smolvla_pick_pen_v2_frozen
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/bklassen3434/pick_pen_v2_20260920_124400
- Variante con learning rate 1e-4: https://huggingface.co/bklassen3434/smolvla_pick_pen_v2_lr1e4
- Variante con learning rate 5e-5: https://huggingface.co/bklassen3434/smolvla_pick_pen_v2_lr5e5

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo (unicamente paginas de un marketplace sin relacion con el proyecto), por lo que no se pueden anadir papers, blogs ni repositorios adicionales.
