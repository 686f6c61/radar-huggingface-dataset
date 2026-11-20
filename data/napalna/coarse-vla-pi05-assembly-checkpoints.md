# napalna/coarse-vla-pi05-assembly-checkpoints

## Resumen

`coarse-vla-pi05-assembly-checkpoints` es una colección de checkpoints intermedios de un ajuste fino del modelo fundacional de robótica `lerobot/pi05_base` (pi0.5), desarrollado por el usuario napalna en el contexto del proyecto coarse-vla. El modelo está orientado a tareas de ensamblaje robótico en simulación y se distribuye en formato LeRobot con pesos en safetensors de precisión fp32 y pesos EMA.

El repositorio contiene únicamente los checkpoints correspondientes a los pasos 16.000 y 18.000 de un entrenamiento que estaba planificado hasta 30.000 pasos y que quedó pausado en 18.000. Comparte datos, receta y estructura de archivos con el checkpoint de 10.000 pasos publicado como `napalna/coarse-vla-pi05-assembly-10k`, cuya model card se referencia como fuente principal de documentación.

La relevancia de esta publicación es acotada y experimental: el autor reporta que el éxito en bucle cerrado del modelo pi0.5 por sí solo se mantiene plano en torno al 10 % desde los 6.000 pasos (13 % a 12k, 19 % a 14k, 0 % a 16k; 18k no evaluado), y que es la combinación con un actor de inserción entrenado por RL la que alcanza el 88 % de éxito sobre el checkpoint de 10k. Se trata, por tanto, de material de investigación en simulación, no de un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en pi0.5; detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/pi05_base`, un modelo visión-lenguaje-acción (VLA) de la familia pi0.5 integrado en el ecosistema LeRobot. La información disponible no detalla la arquitectura interna (número de capas, mecanismo de atención, encoder visual o cabezal de acciones), por lo que estos datos deben consultarse en la documentación del modelo base.

El entrenamiento corresponde a un fine-tune sobre datos de ensamblaje en simulación, con una receta y un conjunto de datos idénticos a los del checkpoint `napalna/coarse-vla-pi05-assembly-10k`. Los pesos publicados son EMA en fp32. El run estaba planificado para 30.000 pasos y se pausó en 18.000; este repositorio incluye los checkpoints `016000/` y `018000/`. El autor no documenta en esta model card el volumen de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; únicamente menciona un actor de inserción entrenado por RL como componente externo que se combina con el checkpoint de 10k para alcanzar el 88 % de éxito.

## Capacidades

- Control robótico de tipo VLA: el modelo recibe observaciones (presumiblemente visuales y de estado) y genera acciones para tareas de ensamblaje en simulación.
- Ejecución en bucle cerrado en entornos simulados, según la evaluación reportada por el autor sobre 16 cadenas de validación.
- Integración con el ecosistema LeRobot para carga, entrenamiento y evaluación.
- Compatibilidad con un actor de inserción externo entrenado por RL, que mejora sustancialmente la tasa de éxito frente al uso del VLA aislado.
- Generación de texto, razonamiento, código, matemáticas, tool calling, agentes y capacidades multilingües: no documentadas para este modelo.
- Modo thinking, visión general, audio: no documentados.

## Casos de uso

- Investigación en aprendizaje por imitación para robótica: sirve como punto de partida o referencia para reproducir el entrenamiento de pi0.5 sobre tareas de ensamblaje y comparar curvas de éxito entre checkpoints (10k, 12k, 14k, 16k, 18k).
- Estudio de estancamiento en el entrenamiento: los checkpoints permiten analizar por qué el éxito en bucle cerrado se mantiene plano en torno al 10 % desde los 6.000 pasos, comparando pesos en distintos momentos del run.
- Evaluación de políticas híbridas VLA + RL: el checkpoint de 10k combinado con el actor de inserción alcanza el 88 % de éxito, lo que lo convierte en un caso de estudio para pipelines que combinan aprendizaje por imitación y refuerzo.
- Desarrollo de entornos de simulación con MuJoCo: el modelo se enmarca en el proyecto coarse-vla, orientado a tareas de ensamblaje simuladas, y puede usarse para validar escenarios y métricas de evaluación.
- Reproducción de experimentos con LeRobot: al distribuirse en formato LeRobot con safetensors, se integra en flujos de carga y evaluación estándar de la librería.
- Benchmarking interno de políticas robóticas: los checkpoints intermedios permiten medir la variabilidad de rendimiento entre pasos de entrenamiento antes de invertir en runs más largos.

## Benchmarks y rendimiento

Datos reportados por el autor sobre 16 cadenas de validación (primera pieza insertada), con pi0.5 en solitario:

| Checkpoint | Éxito en bucle cerrado |
|---|---|
| 6k | ~10 % |
| 10k | ~10 % |
| 12k | 13 % |
| 14k | 19 % |
| 16k | 0 % |
| 18k | no evaluado |
| 10k + actor RL de inserción | 88 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 16,6 GB, correspondiente a dos checkpoints en fp32 (más metadatos); cada checkpoint individual requiere aproximadamente la mitad de ese espacio en disco.
- VRAM estimada para inferencia: no disponible. Al tratarse de pesos fp32, la inferencia exigirá al menos el tamaño del checkpoint en memoria, más el overhead del runtime de LeRobot y del simulador.
- GPU recomendadas: no disponible. Por el tamaño del modelo base pi0.5, se recomienda consultar los requisitos de `lerobot/pi05_base`.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamaño real del modelo base y de la cuantización, que no está documentada.
- Opciones de despliegue: LeRobot (librería nativa), con simulación en MuJoCo. Soporte de vLLM, llama.cpp, Ollama o TGI: no documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| coarse-vla-pi05-assembly-checkpoints | no disponible | no disponible | ~10 % en solitario; 88 % con actor RL (checkpoint 10k) | no disponible | Hugging Face (napalna) |
| lerobot/pi05_base | no disponible | no disponible | no disponible | no disponible | Hugging Face (LeRobot) |
| napalna/coarse-vla-pi05-assembly-10k | no disponible | no disponible | ~10 % en solitario; 88 % con actor RL | no disponible | Hugging Face (napalna) |

No se dispone de información suficiente para comparar con otras familias de VLA (por ejemplo, OpenVLA u otras) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Entrenamiento incompleto: el run estaba planificado para 30.000 pasos y se pausó en 18.000; los checkpoints publicados son intermedios y no representan el estado final previsto.
- Rendimiento bajo en solitario: el éxito en bucle cerrado se mantiene plano en torno al 10 % desde los 6.000 pasos, con un 0 % en el checkpoint de 16k; el 18k no fue evaluado.
- Dependencia de un componente externo: el 88 % de éxito se logra únicamente combinando el checkpoint de 10k con un actor de inserción entrenado por RL, no con este modelo de forma aislada.
- Solo simulación: el autor indica explícitamente que el trabajo es únicamente en simulación; no hay evidencia de transferencia a robots reales.
- Licencia no disponible: no se especifican condiciones de uso comercial ni de redistribución; debe consultarse al autor antes de cualquier uso en producción.
- Idiomas no disponibles: al ser un modelo de robótica, la dimensión lingüística no está documentada.
- Riesgo de sobreajuste al entorno de validación: la evaluación se limita a 16 cadenas de validación en un escenario concreto de ensamblaje.
- Sesgos y alucinaciones: no documentados; en el contexto de políticas de acción, el riesgo relevante es la ejecución de acciones incorrectas en el entorno, no la generación de texto.
- Documentación dependiente de otra model card: gran parte de los detalles (datos, receta, estructura de archivos) se remiten a la model card del checkpoint de 10k.

## Enlaces

- Hugging Face: https://huggingface.co/napalna/coarse-vla-pi05-assembly-checkpoints
- Checkpoint de 10k referenciado: https://huggingface.co/napalna/coarse-vla-pi05-assembly-10k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Código del proyecto: https://github.com/AhnJinYoung/coarse-vla
- Documentación de traspaso: https://github.com/AhnJinYoung/coarse-vla/blob/main/docs/HANDOFF.md
