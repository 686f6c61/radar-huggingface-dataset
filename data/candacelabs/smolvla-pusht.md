# candacelabs/smolvla-pusht

## Resumen

SmolVLA fine-tuned on PushT es un paquete de scripts publicado por candacelabs para reproducir el ajuste fino del modelo base lerobot/smolvla_base (450M parametros) sobre el dataset lerobot/pusht. No se trata de un modelo entrenado: el repositorio contiene unicamente el script `train_smolvla_pusht.sh` y las instrucciones para ejecutarlo en una GPU CUDA con al menos 16 GB de VRAM. Los pesos resultantes del entrenamiento se subirian a este mismo repositorio mediante `--policy.push_to_hub=true`.

SmolVLA es una politica vision-language-action (VLA) compacta pensada para control roboticos por imitacion, propuesta en el paper arXiv:2506.01844. Este repositorio concreto apunta a la tarea PushT del benchmark LeRobot, un entorno simulado de empuje de un objeto en forma de T con una sola camara y acciones bidimensionales.

Su relevancia es practica: sirve como plantilla reproducible de ajuste fino para quien quiera adaptar SmolVLA a una tarea con menos camaras y dimensiones de accion que las previstas por el modelo base, documentando los flags necesarios (`empty_cameras`, `rename_map`, `output_features`). Aun asi, no debe confundirse con un checkpoint listo para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (politica vision-language-action) |
| Parametros totales | 450M (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio no contiene pesos entrenados) |

## Arquitectura y entrenamiento

El modelo base SmolVLA es una politica VLA de 450M parametros descrita en el paper arXiv:2506.01844. El repositorio candacelabs/smolvla-pusht no incluye pesos, sino el script de ajuste fino sobre lerobot/pusht, un dataset de imitacion con 206 episodios, 25.6K frames, una camara, acciones de 2 dimensiones y 10 fps, distribuido bajo licencia MIT. El entrenamiento propuesto usa batch 24 y 20.000 pasos, siguiendo la linea base de la documentacion de SmolVLA, con un coste aproximado de 0.64 s/paso en una RTX 5070 segun la reproduccion de la comunidad, lo que se traduce en unas 3-5 horas en una sola GPU.

La adaptacion requiere flags especificos porque PushT tiene una camara y acciones de 2 dimensiones frente a las 3 camaras y 6 dimensiones del modelo base: `--policy.empty_cameras=2` y `--rename_map='{"observation.image": "observation.images.camera1"}'` para entrenamiento, y `--policy.output_features='{"action": {"type": "ACTION", "shape": [2]}}'` para evaluacion. Estos flags provienen de la reproduccion de naonaon/smolvla_pusht. El autor advierte que el conjunto exacto de flags no fue verificado automaticamente y que las dependencias no estan fijadas.

## Capacidades

- Control roboticos por imitacion en el entorno simulado PushT (empuje de objeto en forma de T).
- Procesamiento de entrada visual de una sola camara y salida de acciones bidimensionales.
- Ajuste fino reproducible mediante LeRobot (`lerobot-train`, `lerobot-eval`).
- Registro de metricas en vivo mediante Trackio durante el entrenamiento.
- Publicacion automatica de pesos al Hub al finalizar el entrenamiento.
- No incluye pesos entrenados: no es ejecutable para inferencia tal cual.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingues.

## Casos de uso

- Reproduccion de la linea base de SmolVLA en PushT: ejecutar `train_smolvla_pusht.sh` en una GPU con 16 GB o mas para obtener un checkpoint de referencia y medir la tasa de exito sobre 50 episodios con `lerobot-eval`.
- Adaptacion de SmolVLA a tareas con menos camaras: el script documenta como usar `empty_cameras` y `rename_map` para reutilizar el modelo base con una sola entrada visual, patron aplicable a otros entornos con configuracion reducida.
- Ajuste de la dimensionalidad de acciones: el flag `output_features` con shape [2] sirve de ejemplo para tareas con espacios de accion distintos a los 6 del modelo base.
- Plantilla de pipeline de entrenamiento en LeRobot: el script integra entrenamiento, evaluacion y publicacion al Hub, util como esqueleto para proyectos propios de imitacion.
- Monitorizacion de entrenamientos: la integracion con Trackio (`kaashmonee/smolvla-pusht-trackio`) permite seguir metricas en tiempo real en trabajos de varias horas.
- Docencia y experimentacion en robotica: al ser un paquete pequeno con dataset publico (206 episodios, 25.6K frames), es adecuado para laboratorios con recursos limitados que quieran estudiar VLA sin infraestructura grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica prevista es la tasa de exito sobre 50 episodios en el simulador PushT mediante `lerobot-eval`, pero no se aportan valores obtenidos.

## Requisitos de hardware

- VRAM estimada para entrenamiento: 16 GB como minimo segun el autor; el modelo base tiene 450M parametros.
- GPU recomendadas: cualquier GPU CUDA con al menos 16 GB. El autor cita una RTX 5070 con 0.64 s/paso en la reproduccion de la comunidad.
- Tiempo estimado de entrenamiento: 3-5 horas en una sola GPU para 20.000 pasos con batch 24.
- Cabe en GPU de consumo: si, siempre que dispongan de 16 GB o mas de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-eval`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica robotica.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| candacelabs/smolvla-pusht | 450M (base) | PushT (script) | no disponible | apache-2.0 | Solo script, sin pesos |
| lerobot/smolvla_base | 450M | VLA generalista | no disponible | no disponible | Pesos disponibles |
| naonaon/smolvla_pusht | 450M (base) | PushT | no disponible | no disponible | Reproduccion de referencia |

La comparativa se limita a los modelos citados en la informacion proporcionada; no se dispone de datos de rendimiento para contrastar.

## Limitaciones y advertencias

- El repositorio no contiene pesos entrenados: es un paquete de scripts y no puede usarse para inferencia directamente.
- Los flags de entrenamiento y evaluacion no fueron verificados automaticamente por el autor; conviene ejecutar `lerobot-train --help` antes de lanzar el trabajo.
- Las dependencias no estan fijadas (`lerobot[training]` sin version), lo que puede provocar incompatibilidades; se recomienda fijarlas con `pip freeze`.
- El autor indica que el job de comprobacion previa no pudo ejecutarse (la Jobs API devolvio 404), por lo que la reproducibilidad no esta garantizada.
- La evaluacion se limita al simulador PushT; no hay evidencia de transferencia a robot real.
- No se documentan sesgos, comportamiento multilingue ni riesgos de alucinacion, dado que no es un modelo de lenguaje generativo de proposito general.
- Licencia apache-2.0 en el repositorio, pero la licencia del modelo base y del dataset deben verificarse por separado para uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/candacelabs/smolvla-pusht
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset PushT: https://huggingface.co/datasets/lerobot/pusht
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Paper PushT: https://arxiv.org/abs/2303.04137
- Reproduccion de la comunidad: https://huggingface.co/naonaon/smolvla_pusht
- Dashboard de metricas Trackio: https://huggingface.co/spaces/kaashmonee/smolvla-pusht-trackio
