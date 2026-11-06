# Donghyun1228/pi05-libero-ila-pad-vision-head-view-medium-1000-20261105

## Resumen

π0.5 LIBERO view_medium es un checkpoint de adaptación de dominio para robótica construido sobre el modelo vision-language-action π0.5 (openpi) y publicado por el usuario Donghyun1228. No es un modelo de lenguaje generalista, sino un artefacto experimental: la fila ILA (Invariance through Latent Alignment, Yoneda et al., RSS 2022) de la tabla LIBERO de un trabajo sobre adaptación de encoders visuales en políticas VLA. El repositorio contiene pesos de entrenamiento, estado del optimizador, activos de normalización, el crítico WGAN y una política de evaluación lista para desplegar.

El problema que aborda es la brecha de dominio entre el encoder visual de origen (PaliGemma/img de π0.5) y las observaciones de un entorno de manipulación concreto (LIBERO). La adaptación se limita exclusivamente a la torre de visión: el LLM, el experto de acciones y la cabeza IDM permanecen congelados en el checkpoint fuente. El entrenamiento combina un esquema adversarial WGAN sobre el latente agrupado de la cámara base con una pérdida de dinámica inversa (IDM) y el error cuadrático del modelo directo de dinámica.

La relevancia es acotada pero clara para quien investiga adaptación de políticas VLA: el autor documenta el procedimiento completo (preset, argv, semilla, número de actualizaciones) y publica métricas de éxito en las cuatro suites de LIBERO, lo que permite reproducir y comparar la receta ILA frente a otras estrategias de adaptación. El repositorio ocupa 13,0 GB y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA π0.5 (openpi) con encoder visual PaliGemma/img adaptado; LLM y experto de acciones congelados |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato nativo de entrenamiento, no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params`, `train_state` y `assets` (normalización) en `999/`; crítico WGAN en `ila/critic_999.npz`; política de evaluación en `policy/` |

## Arquitectura y entrenamiento

El modelo parte de π0.5, una política vision-language-action que combina un backbone de lenguaje y visión (PaliGemma) con un experto de acciones. En este checkpoint solo se entrena la torre de visión (`PaliGemma/img`); el resto de componentes se mantiene en el estado del checkpoint fuente `Donghyun1228/pi05-libero-pad-img-source-ila-n50k-10000-20261105` (paso 9999), junto con el búfer de latentes fuente (49.600 ventanas) y el modelo directo de dinámica preentrenado.

El bucle de entrenamiento, con lote de 32 y semilla 42, ejecuta por iteración cinco actualizaciones del crítico WGAN (recorte de pesos 0,01, RMSProp 1e-5) sobre el latente agrupado de la cámara base, un paso adversarial del encoder (RMSProp 1e-5) y un paso del encoder de dinámica (RMSProp 1e-6) sobre la pérdida de la cabeza IDM congelada (excluyendo el índice de gripper 6) más el MSE del modelo directo de dinámica congelado. Se realizaron 10.000 actualizaciones y se guardaron los pasos 999 y 9999. La política de evaluación publicada corresponde al paso 999, sin la cabeza IDM, usando la torre visual adaptada también para la cámara de muñeca.

## Capacidades

- Control robótico de manipulación en las cuatro suites de LIBERO a partir de observaciones visuales (cámara base y cámara de muñeca) e instrucciones de tarea.
- Adaptación de dominio del encoder visual mediante alineación latente adversarial (ILA) con pérdida IDM y modelo directo de dinámica.
- Evaluación reproducible con política exportada (`policy/`) y activos de normalización incluidos.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso genérico, agentes conversacionales ni procesamiento de audio.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión general fuera de robótica o audio: no disponibles.

## Casos de uso

- Investigación en adaptación de dominio de políticas VLA: el checkpoint sirve como referencia ILA para comparar, con la misma base π0.5 y el mismo protocolo LIBERO, frente a otras recetas de ajuste del encoder visual.
- Reproducción de resultados LIBERO: la política `policy/` y los activos de normalización permiten reevaluar el 66,50% de éxito con semilla de entorno 7 y las condiciones documentadas (MuJoCo 3.2.3, renderizado OSMesa).
- Estudio de estabilidad del entrenamiento adversarial: los pasos 999 y 9999, junto con el crítico `ila/critic_999.npz`, permiten analizar la evolución del crítico WGAN y su efecto en el éxito de la política.
- Ablación de la cabeza IDM: la política de evaluación se publica sin la cabeza IDM, lo que facilita medir su contribución frente al checkpoint de entrenamiento completo.
- Transferencia a nuevos entornos de manipulación: la receta (solo encoder visual, RMSProp con tasas 1e-5/1e-6, recorte 0,01) es reutilizable como plantilla para adaptar π0.5 a dominios con distribución visual distinta.
- Docencia y divulgación técnica: el repositorio incluye `run/spec.json` con el argv completo y documentación en `docs/naive_probe/ila_baseline_20261105.md`, útil para explicar pipelines VLA con ejemplos verificables.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| LIBERO (4 suites, 500 episodios por suite, semilla de entorno 7) | Paso 999, política sin cabeza IDM | 1330/2000 = 66,50% de éxito |
| LIBERO (4 suites, 500 episodios por suite, semilla de entorno 7) | Paso 10000 | 1249/2000 = 62,45% de éxito |

No se han publicado en la información disponible resultados desglosados por suite (LIBERO-Spatial, Object, Goal, Long) ni comparaciones numéricas con otras filas de la tabla del paper.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 13,0 GB, lo que da una cota inferior orientativa del peso en disco de los checkpoints publicados.
- GPU recomendadas: la evaluación documentada se realizó en `nvidia_h100` con renderizado OSMesa, por lo que H100 es la referencia validada.
- Viabilidad en GPU de consumo: no documentada; no se confirma que quepa en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: el pipeline es `robotics` y el formato de pesos es el nativo de openpi (`params`, `train_state`, `assets`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO view_medium ILA (este) | no disponible | no disponible | 66,50% (paso 999) | Apache 2.0 | Hugging Face, 0 descargas |
| π0.5 LIBERO PAD img source ILA n50k (checkpoint fuente) | no disponible | no disponible | no disponible en la información | Apache 2.0 (según repo fuente, no verificado aquí) | Hugging Face |
| π0.5 base (openpi) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de la misma categoría (otras filas de la tabla LIBERO del paper u otras políticas VLA como OpenVLA).

## Limitaciones y advertencias

- Checkpoint experimental de investigación: 0 descargas y 0 likes en el momento de la consulta, sin validación externa independiente.
- El rendimiento cae del 66,50% (paso 999) al 62,45% (paso 10000); el autor selecciona el paso 999 sobre la misma evaluación, lo que introduce riesgo de sobreajuste al conjunto de evaluación.
- Ámbito restringido a LIBERO con semilla de entorno 7; no hay evidencia de generalización a otros entornos, cámaras o distribuciones visuales.
- Solo se adapta el encoder visual; los sesgos y limitaciones del LLM y del experto de acciones de π0.5 subyacentes se heredan sin modificar.
- No se documentan sesgos conocidos, tasas de alucinación ni comportamiento fuera de distribución para esta política.
- Idiomas soportados no disponibles; no debe asumirse soporte multilingüe en las instrucciones de tarea.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero deben verificarse las licencias de los componentes de origen (π0.5, PaliGemma) antes de un despliegue en producción.
- El repositorio incluye `train_state` y el crítico WGAN, no solo pesos de inferencia; para desplegar debe usarse `policy/` con los activos de normalización.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-ila-pad-vision-head-view-medium-1000-20261105
- Checkpoint fuente: https://huggingface.co/Donghyun1228/pi05-libero-pad-img-source-ila-n50k-10000-20261105
- Paper ILA (Invariance through Latent Alignment, Yoneda et al., RSS 2022): no disponible en la información proporcionada
- Repositorio de código `Donghyun1228/vla_adaptation` (commit `1b67c86b`): no disponible como URL en la información proporcionada
- Documentación interna del autor: `docs/naive_probe/ila_baseline_20261105.md` (referenciada en la model card, sin URL)
- openpi: no disponible en la información proporcionada
