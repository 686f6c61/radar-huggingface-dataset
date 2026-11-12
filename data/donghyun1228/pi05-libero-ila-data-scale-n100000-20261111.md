# Donghyun1228/pi05-libero-ila-data-scale-n100000-20261111

## Resumen

`pi05-libero-ila-data-scale-n100000-20261111` es un artefacto de investigación publicado en Hugging Face por el usuario Donghyun1228 dentro de un estudio de escalado de datos de sondeo (probing-data scaling) para adaptación de encoders visuales en modelos de visión-lenguaje-acción (VLA). No es un modelo de lenguaje generativo al uso, sino un conjunto de pesos resultado de aplicar ILA (Implicit Language Adaptation, Yoneda et al., RSS 2022) sobre la cabeza del vision encoder PAD del modelo base `pi05_libero`, utilizando 100.000 frames de sondeo por entorno.

El experimento parte de una fuente `pi05_libero_pad_img_source` (entrenada con aprendizaje por imitación más una cabeza IDM durante 10.000 pasos con LR 1e-5) y genera dos objetivos de adaptación: `pi05_libero_ila_img_view_adapt` y `pi05_libero_ila_img_yaw_adapt`, entrenados con RMSProp sobre el encoder, con cabeza IDM, modelo forward y crítico WGAN congelados durante 10.000 pasos. La evaluación se realizó con semilla 7 en OSMesa sobre 2.000 episodios.

El repo ocupa 26,6 GB e incluye un archivo `SHA256SUMS` con la verificación de integridad de todos los ficheros, pero no incluye el `train_state`. Su relevancia es acotada: sirve como material reproducible para estudiar cómo escala el número de frames de sondeo en la adaptación de encoders visuales de políticas robóticas, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en π0.5 con cabeza PAD en el vision encoder; adaptación ILA con cabeza IDM, modelo forward y crítico WGAN |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 26,6 GB con `SHA256SUMS`; `train_state` no incluido) |

## Arquitectura y entrenamiento

El modelo se construye sobre `pi05_libero`, una política VLA derivada de π0.5 aplicada al benchmark LIBERO. Sobre el vision encoder se añade una cabeza PAD y se entrena una fuente `pi05_libero_pad_img_source` mediante aprendizaje por imitación (IL) más una cabeza IDM, con learning rate 1e-5 durante 10.000 pasos. A partir de esa fuente se ejecuta la adaptación ILA (Yoneda et al., RSS 2022) sobre 100.000 frames de sondeo por entorno, generando dos variantes: una de adaptación de vista (`view`) y otra de orientación/yaw (`yaw`).

El procedimiento de adaptación congela la cabeza IDM, el modelo forward y el crítico WGAN, y actualiza únicamente el encoder con RMSProp durante 10.000 pasos. Se trata, por tanto, de un experimento controlado de escalado de datos de sondeo (n=100.000 por entorno) más que de un entrenamiento desde cero. La evaluación se realiza con semilla 7 en OSMesa sobre 2.000 episodios por configuración (`<shift>/eval_seed7`). No se dispone de información sobre el número total de tokens, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Control de políticas robóticas en el benchmark LIBERO mediante el modelo base π0.5.
- Adaptación de dominio del vision encoder mediante ILA, con variantes para cambio de vista (`view`) y de orientación (`yaw`).
- Aprendizaje por imitación sobre demostraciones, con cabeza IDM auxiliar para modelado inverso de dinámica.
- Entrenamiento adversario con crítico WGAN para alinear representaciones del encoder entre dominio fuente y objetivo.
- Evaluación reproducible en OSMesa con semilla fija y 2.000 episodios.
- No se documentan capacidades de generación de texto, código, matemáticas, tool calling, agentes ni multilingüismo; el artefacto está orientado exclusivamente a investigación en VLA.

## Casos de uso

- Estudio de escalado de datos de sondeo: comparar curvas de rendimiento al variar el número de frames de sondeo (aquí n=100.000 por entorno) para determinar el punto de saturación de ILA en encoders visuales de políticas robóticas.
- Reproducción de experimentos ILA: reutilizar los pesos `view` y `yaw` junto con el código de `github.com/Donghyun1228/vla_adaptation` para replicar la evaluación con semilla 7 en OSMesa sobre 2.000 episodios.
- Adaptación de dominio en robótica de manipulación: emplear las variantes adaptadas para transferir una política entrenada en un dominio fuente a entornos con cambios de cámara u orientación, aprovechando que solo se actualiza el encoder.
- Investigación en aprendizaje autosupervisado visual: analizar el efecto de congelar la cabeza IDM, el modelo forward y el crítico WGAN mientras se adapta únicamente el encoder con RMSProp.
- Benchmarking de métodos de adaptación: usar estos artefactos como línea base frente a otras técnicas de adaptación de encoders (fine-tuning completo, LoRA, adaptadores) en tareas LIBERO.
- Auditoría de reproducibilidad: verificar la integridad de los pesos mediante `SHA256SUMS` antes de integrarlos en pipelines de evaluación propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe la configuración de evaluación (OSMesa, semilla 7, 2.000 episodios) sin reportar tasas de éxito ni métricas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo ocupa 26,6 GB, lo que sugiere pesos en precisión alta (probablemente fp32 o bf16) del modelo π0.5 completo más los artefactos de adaptación.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del repo, se requeriría al menos una GPU con 40-80 GB (A100 40/80 GB, H100) para cargar los pesos sin cuantizar.
- Viabilidad en GPU de consumo: no confirmada; probablemente no cabe en RTX 4090 (24 GB) sin cuantización, y no se documentan formatos GGUF ni cuantizaciones.
- Opciones de despliegue: no documentadas; el código de referencia está en `github.com/Donghyun1228/vla_adaptation` y la evaluación usa OSMesa, lo que implica renderizado offscreen en entorno Linux.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-ila-data-scale-n100000-20261111 | no disponible | no disponible | Adaptación ILA de encoder visual en LIBERO | no disponible | Hugging Face (repo de 26,6 GB) |
| π0.5 (base) | no disponible en la información | no disponible | VLA generalista para control robótico | no disponible | Referenciado como modelo base |
| pi05_libero_pad_img_source | no disponible | no disponible | Fuente IL + IDM para ILA | no disponible | Referenciado en la model card |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas; la comparativa se limita a la relación de dependencia entre artefactos del mismo estudio.

## Limitaciones y advertencias

- No es un modelo de propósito general: es un artefacto de investigación para adaptación de encoders en LIBERO, no para generación de texto ni tareas fuera de robótica de manipulación.
- No incluye `train_state`, por lo que no es posible reanudar el entrenamiento desde estos pesos tal cual.
- La licencia no está especificada, lo que impide determinar si se permite uso comercial; debe consultarse al autor antes de cualquier uso en producción.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas; al tratarse de un modelo de acción, el riesgo principal es de fallo de política (acciones incorrectas) en dominios distintos al de entrenamiento.
- Los resultados solo son válidos bajo la configuración de evaluación descrita (OSMesa, semilla 7, 2.000 episodios); no hay garantías de generalización a otros entornos o semillas.
- El tamaño del repo (26,6 GB) y la ausencia de cuantizaciones documentadas dificultan el despliegue en hardware de consumo.
- La fecha de creación (2026-11-12) y el nombre del repo sugieren un experimento puntual; no hay evidencia de mantenimiento ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-ila-data-scale-n100000-20261111
- Código: https://github.com/Donghyun1228/vla_adaptation
- Paper ILA (Yoneda et al., RSS 2022): no disponible en la información proporcionada
- Modelo base π0.5: no disponible en la información proporcionada
- Benchmark LIBERO: no disponible en la información proporcionada
