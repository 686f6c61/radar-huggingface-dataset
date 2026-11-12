# Donghyun1228/pi05-libero-ila-data-scale-n1000-20261111

## Resumen

`Donghyun1228/pi05-libero-ila-data-scale-n1000-20261111` es un checkpoint de investigación publicado en Hugging Face por el usuario Donghyun1228, derivado del modelo de visión-lenguaje-acción (VLA) π0.5 (pi05) aplicado al benchmark de manipulación robótica LIBERO. No se trata de un modelo de lenguaje generalista, sino de un artefacto de experimentación sobre adaptación de dominios mediante ILA (Implicit Latent Adaptation, Yoneda et al., RSS 2022) en la cabeza del codificador visual PAD del modelo base.

El repositorio documenta un experimento de escalado de datos de sondeo (probing-data scaling) con 1000 fotogramas de sondeo por entorno, tanto en el dominio fuente como en el objetivo. El entrenamiento parte de `pi05_libero_pad_img_source` (con cabeza IL + IDM, LR 1e-5, 10k pasos) y genera adaptaciones `pi05_libero_ila_img_{view,yaw}_adapt` mediante pasos de encoder con RMSProp, cabeza IDM congelada más modelo forward y crítico WGAN, durante 10k pasos. La evaluación se realizó con semilla 7 en OSMesa sobre 2000 episodios.

Su relevancia es acotada: es un artefacto reproducible de un estudio empírico sobre adaptación de políticas VLA, no un modelo listo para producción. El repo ocupa 25 GB y no incluye `train_state`; el autor remite a `SHA256SUMS` para la integridad de los ficheros y al repositorio `github.com/Donghyun1228/vla_adaptation` para el código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (pi05) con cabeza de codificador visual PAD adaptada mediante ILA; incluye cabeza IDM, modelo forward y crítico WGAN en el pipeline de adaptación |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 25 GB; el autor cita `SHA256SUMS` para verificar ficheros; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El checkpoint se construye sobre π0.5 (pi05) en su variante para LIBERO, un modelo VLA que combina un backbone de visión-lenguaje con una cabeza de política para control robótico. El experimento concreto actúa sobre la cabeza del codificador visual PAD: se entrena primero una fuente `pi05_libero_pad_img_source` con cabeza IL más cabeza IDM (learning rate 1e-5, 10k pasos) sobre 1000 fotogramas de sondeo por entorno del dominio fuente. A partir de ahí se generan dos adaptaciones, `pi05_libero_ila_img_view_adapt` y `pi05_libero_ila_img_yaw_adapt`, usando pasos de encoder con RMSProp, cabeza IDM congelada, modelo forward y crítico WGAN, también durante 10k pasos y sobre 1000 fotogramas de sondeo por entorno del dominio objetivo.

La innovación metodológica es la aplicación de ILA (Yoneda et al., RSS 2022) como mecanismo de adaptación de dominio sobre representaciones visuales implícitas, combinada con un crítico WGAN para alinear distribuciones latentes entre dominios. El experimento se enmarca en un estudio de escalado de datos de sondeo (1000 frente a configuraciones menores, según el nombre del checkpoint). No se detalla la composición del dataset de entrenamiento más allá de los fotogramas de sondeo de LIBERO, ni se especifica si hubo RLHF o DPO (en el contexto VLA, el pipeline típico de π0.5 incluye flujo de difusión para acciones, pero la model card no lo confirma para este artefacto).

## Capacidades

- Control de manipulación robótica en entornos LIBERO: el checkpoint está especializado en políticas visuomotoras para tareas de manipulación del benchmark.
- Adaptación de dominio visual: las variantes `view` y `yaw` ajustan la representación del codificador PAD a cambios de punto de vista y orientación.
- Aprendizaje por imitación (IL): la cabeza IL forma parte del pipeline de entrenamiento del modelo fuente.
- Modelado inverso de dinámica (IDM): se entrena una cabeza IDM que predice acciones a partir de transiciones de estado.
- Alineación de dominios con WGAN: el crítico WGAN participa en el entrenamiento de adaptación.
- Evaluación reproducible: la model card especifica semilla 7, OSMesa y 2000 episodios en `eval_seed7`.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en adaptación de dominio para VLA: reproducir el experimento de ILA sobre la cabeza PAD de π0.5 con 1000 fotogramas de sondeo por entorno, usando el código de `vla_adaptation` y verificando integridad con `SHA256SUMS`.
- Estudio de escalado de datos de sondeo: comparar esta configuración n1000 con variantes de menor cardinalidad para medir el efecto del número de fotogramas de sondeo en la adaptación.
- Evaluación comparativa de políticas LIBERO: ejecutar los 2000 episodios con semilla 7 en OSMesa para contrastar las variantes `view` y `yaw` frente al modelo fuente.
- Base para experimentos de adaptación visual en robótica: reutilizar la receta (RMSProp en encoder, IDM congelada, forward model, crítico WGAN) sobre otros dominios objetivo con cambios de cámara u orientación.
- Análisis de alineación latente con WGAN: estudiar cómo el crítico WGAN modula la transferencia entre distribuciones de representaciones visuales en políticas VLA.
- Reproducibilidad de artefactos de investigación: servir como punto de partida verificable para trabajos que necesiten un checkpoint de π0.5 adaptado a LIBERO con configuración documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluación con semilla 7 en OSMesa sobre 2000 episodios (`eval_seed7`), pero no incluye métricas numéricas de éxito ni comparaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repo (25 GB) incluye pesos y artefactos del pipeline; no equivale directamente a la VRAM de inferencia.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documenta vLLM, llama.cpp, Ollama ni TGI; el contexto es un pipeline de robótica con OSMesa para evaluación).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-ila-data-scale-n1000-20261111 | no disponible | no disponible | no disponible (2000 episodios seed 7 sin métricas publicadas) | no disponible | Hugging Face, repo de 25 GB |
| π0.5 (pi05) base para LIBERO | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card como `pi05_libero_pad_img_source` |
| ILA (Yoneda et al., RSS 2022) | no disponible | no disponible | no disponible | no disponible | Método publicado, no un checkpoint comparable |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo de propósito general ni está pensado para despliegue en producción.
- Sesgos conocidos: no documentados; al entrenarse sobre LIBERO, hereda las limitaciones de dominio de ese benchmark.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; en políticas robóticas el riesgo equivalente es la ejecución de acciones incorrectas fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no disponibles; el modelo no se presenta como multilingüe.
- Licencia: no disponible, lo que impide evaluar restricciones de uso comercial.
- `train_state` no incluido: no es posible reanudar el entrenamiento desde este checkpoint tal cual.
- Verificación de integridad: el autor remite a `SHA256SUMS`; conviene comprobar los ficheros antes de usarlos.
- Dependencia de OSMesa y de la semilla 7 para reproducir la evaluación; resultados no comparables con otras configuraciones sin replicar el pipeline.
- No se especifican formatos de pesos ni herramientas de carga estándar, lo que complica su integración fuera del repositorio de código del autor.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-ila-data-scale-n1000-20261111
- Código: https://github.com/Donghyun1228/vla_adaptation
- ILA (Yoneda et al., RSS 2022): referencia citada en la model card; no se proporciona URL directa en la información disponible.
