# Donghyun1228/pi05-libero-ila-pad-vision-head-view-large-10000-20261105

## Resumen

π0.5 LIBERO view_large es un checkpoint de investigación para robótica de manipulación, publicado por el usuario Donghyun1228, que implementa la fila ILA (Invariance through Latent Alignment) del benchmark LIBERO sobre el modelo base π0.5 de Physical Intelligence. No se trata de un modelo de lenguaje generalista, sino de una política visuomotora (VLA, vision-language-action) adaptada mediante un procedimiento adversarial de alineación de latentes sobre el codificador visual PaliGemma. El repositorio ocupa 13 GB y se distribuye bajo licencia Apache 2.0.

El trabajo se enmarca en un estudio de adaptación de dominio para políticas robóticas: solo se entrena el codificador de visión, manteniendo congelados el LLM, el experto de acciones y la cabeza IDM del modelo fuente. El entrenamiento combina un crítico WGAN, un paso adversarial sobre el encoder y un paso de dinámica que minimiza el error de un modelo forward congelado, con 10.000 actualizaciones objetivo y batch de 32.

Su relevancia es acotada pero específica: sirve como referencia reproducible de una línea base ILA sobre LIBERO, con resultados de éxito medidos (22,30 % en 2.000 episodios), lo que permite comparar metodologías de adaptación de encoders visuales en políticas VLA. No es un modelo para despliegue en producción ni para tareas fuera del entorno LIBERO.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política VLA π0.5 (transformer con codificador visual PaliGemma, LLM y experto de acciones) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params`, `train_state` y `assets` (normalización) en formato JAX/OpenPI; crítico en `ila/critic_9999.npz` |

## Arquitectura y entrenamiento

El modelo parte de π0.5, una política visuomotora que combina un codificador visual PaliGemma (`PaliGemma/img`), un LLM y un experto de acciones, todo ello bajo el ecosistema OpenPI. En este checkpoint concreto, la adaptación se restringe exclusivamente al codificador visual: el LLM, el experto de acciones y la cabeza IDM permanecen congelados en el estado fuente. La inicialización proviene de `Donghyun1228/pi05-libero-pad-img-source-ila-n50k-10000-20261105` (paso 9999), junto con un búfer de latentes fuente de 49.600 ventanas y un modelo de dinámica forward preentrenado.

El procedimiento de entrenamiento sigue el esquema ILA: por cada iteración se ejecutan 5 actualizaciones del crítico WGAN (weight clip 0,01, RMSProp 1e-5) sobre el latente agrupado de la cámara base, un paso adversarial del encoder (RMSProp 1e-5) y un paso de dinámica del encoder (RMSProp 1e-6) sobre la pérdida de la cabeza IDM congelada (excluyendo el índice de gripper 6) más el MSE del modelo forward congelado. Se usó batch 32, semilla 42 y 10.000 actualizaciones, guardando los pasos 999 y 9999. La política de evaluación (`policy/`) corresponde al paso 9999 sin la cabeza IDM, con la torre de visión adaptada aplicada a la cámara de muñeca.

## Capacidades

- Ejecución de políticas visuomotoras de manipulación robótica en el entorno LIBERO (4 suites, 500 episodios por suite).
- Control de brazo robótico y gripper a partir de observaciones visuales (cámara base y cámara de muñeca).
- Adaptación de dominio del codificador visual mediante alineación adversarial de latentes (ILA).
- Evaluación reproducible con semilla de entorno fija (env seed 7) y renderizado OSMesa sobre MuJoCo 3.2.3.
- No soporta tool calling, function calling, agentes multi-paso, generación de texto libre ni capacidades multilingües: es una política de acción, no un modelo conversacional.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del pipeline robótico.

## Casos de uso

- Reproducción de la línea base ILA en LIBERO: el checkpoint permite replicar la fila ILA de la tabla del paper (Yoneda et al., RSS 2022) con el preset `pi05_libero_ila_img_view_adapt` y comparar contra otras metodologías de adaptación.
- Estudio de adaptación de encoders visuales: al congelar LLM y experto de acciones, sirve para aislar el efecto de la alineación de latentes sobre el rendimiento final en manipulación.
- Benchmarking de políticas VLA: con 2.000 episodios evaluados y una tasa de éxito medida del 22,30 %, es una referencia cuantitativa para comparar nuevas variantes.
- Investigación en entrenamiento adversarial (WGAN): el crítico guardado en `ila/critic_9999.npz` permite analizar la dinámica del entrenamiento adversarial sobre latentes visuales.
- Validación de pipelines OpenPI: útil para verificar la integración de checkpoints π0.5 en flujos de evaluación con MuJoCo y OSMesa.
- Docencia y divulgación técnica: ejemplo concreto de cómo se estructura un experimento de adaptación de dominio en robótica con métricas de éxito publicadas.

## Benchmarks y rendimiento

| Checkpoint | Suite | Episodios | Tasa de éxito |
|---|---|---|---|
| Paso 9999 (política de evaluación) | LIBERO (4 suites) | 2000 | 446/2000 = 22,30 % |
| Paso 1000 | LIBERO (4 suites) | 2000 | 404/2000 = 20,20 % |

Evaluación realizada con env seed 7, evaluador `nvidia_h100` con renderizado OSMesa y MuJoCo 3.2.3. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al tratarse de una política robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 13 GB, lo que da una cota inferior del espacio en disco necesario.
- GPU recomendadas: la evaluación oficial se ejecutó en `nvidia_h100`; no se documentan otras GPU probadas.
- Compatibilidad con GPU de consumo: no disponible; sin datos de cuantización ni de requisitos de memoria, no puede confirmarse que quepa en RTX 4090 u otras consumer.
- Opciones de despliegue: ecosistema OpenPI (JAX); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Tasa de éxito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO view_large (ILA) | VLA π0.5 adaptado | LIBERO | 22,30 % (2000 eps) | Apache 2.0 | Hugging Face |
| π0.5 LIBERO PAD source | VLA π0.5 fuente | LIBERO | no disponible | Apache 2.0 | Hugging Face (`Donghyun1228/pi05-libero-pad-img-source-ila-n50k-10000-20261105`) |
| Otras filas de la tabla LIBERO del paper ILA | Políticas VLA | LIBERO | no disponible en esta ficha | no disponible | no disponible |

La comparativa se limita al modelo fuente del mismo autor; no se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Ámbito restringido: es un checkpoint de investigación para LIBERO, no un modelo general; no debe usarse fuera de ese entorno sin validación adicional.
- Rendimiento moderado: 22,30 % de éxito sobre 2.000 episodios indica que la política falla en la mayoría de intentos; no es adecuada para producción.
- Solo se adapta el codificador visual; el resto del modelo queda congelado, lo que limita la mejora obtenida frente al modelo fuente.
- Sin datos de sesgos, alucinación o comportamiento fuera de distribución: no disponibles.
- Idiomas: no aplica; el modelo no procesa lenguaje natural de forma conversacional.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el modelo base π0.5 y sus dependencias pueden tener condiciones adicionales que deben verificarse.
- Reproducibilidad dependiente de versiones: MuJoCo 3.2.3, OSMesa, semilla 42 y env seed 7 son condiciones documentadas; cambios en el entorno pueden alterar los resultados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-ila-pad-vision-head-view-large-10000-20261105
- Modelo fuente: https://huggingface.co/Donghyun1228/pi05-libero-pad-img-source-ila-n50k-10000-20261105
- Repositorio de código citado: `Donghyun1228/vla_adaptation` (commit `1b67b86b`), documentación en `docs/naive_probe/ila_baseline_20261105.md` (no se proporciona URL directa)
- Paper de referencia: Yoneda et al., "Invariance through Latent Alignment", RSS 2022 (no se proporciona URL directa)
- OpenPI: no se proporciona URL directa en la información disponible
- LIBERO: no se proporciona URL directa en la información disponible
