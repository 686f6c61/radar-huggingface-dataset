# Donghyun1228/pi05-libero-pad-vision-head-view-medium-1000-20261105

## Resumen

El modelo `pi05-libero-pad-vision-head-view-medium-1000-20261105`, publicado por el usuario Donghyun1228, es un checkpoint de investigación para robótica basado en π0.5 (pi05) y el ecosistema openpi. Se trata de un artefacto experimental derivado del paper de adaptación de modelos visión-lenguaje-acción (VLA) del autor, concretamente la fila "PAD" de la tabla LIBERO. El modelo parte del checkpoint `pi05-libero-pad-vision-head-source-n50k-10000-20261104` (paso 9999) y aplica un ajuste fino de 1.000 actualizaciones sobre el codificador visual.

El problema que aborda es la adaptación eficiente de políticas robóticas: en lugar de reentrenar todo el modelo, solo se adapta la torre de visión (`PaliGemma/img`) mediante una pérdida de modelado de dinámica inversa (IDM) sobre una sonda de soporte `view_medium` con 50.000 muestras. El resto de componentes (cabeza IDM, LLM y experto de acción) permanece congelado en el modelo fuente.

Es relevante como referencia reproducible para investigadores que trabajan en adaptación de VLA y evaluación estandarizada en LIBERO. El checkpoint reporta una tasa de éxito de 60,90% (1218/2000 episodios) en el benchmark LIBERO con un evaluador congelado `kn_b200`. El repositorio ocupa 15,7 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (pi05) con torre visual PaliGemma, LLM y experto de acción; adaptación parcial del codificador visual mediante pérdida IDM |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repo contiene `params`, `train_state`, `assets` y `policy/`; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π0.5 (pi05) del ecosistema openpi, que combina una torre visual PaliGemma, un LLM y un experto de acción para producir políticas robóticas. La innovación del checkpoint es que solo se adapta el codificador visual (`PaliGemma/img`) mediante una pérdida de modelado de dinámica inversa (IDM) sobre la sonda de soporte `view_medium` con n=50k. La cabeza IDM, el LLM y el experto de acción permanecen congelados en el modelo fuente.

El entrenamiento usa AdamW con LR pico de 5e-5 (warmup de 500 pasos y luego constante), batch de 32, 1.000 actualizaciones y semilla 42. El índice del gripper (6) se excluye de la pérdida IDM. La inicialización es el paso 9999 de `Donghyun1228/pi05-libero-pad-vision-head-source-n50k-10000-20261104`. La política de evaluación (`policy/`) corresponde al paso 999 sin la cabeza IDM, y la cámara de muñeca utiliza la torre visual adaptada según `export.json`. No se detalla la composición del dataset de entrenamiento ni si hubo RLHF/DPO.

## Capacidades

- Control robótico de manipulación en entornos LIBERO: el modelo genera acciones para tareas de manipulación evaluadas en el benchmark LIBERO.
- Adaptación de representaciones visuales: el codificador visual se ajusta con pérdida IDM para mejorar la dinámica inversa en la vista `view_medium`.
- Evaluación estandarizada: incluye artefactos de evaluación (`run/evaluation_audit.json`) con recuentos por suite.
- Integración con openpi: compatible con el preset `pi05_libero_pad_img_view_adapt` del repositorio `Donghyun1228/vla_adaptation`.
- Uso de cámara de muñeca: la política exportada emplea la torre visual adaptada para la cámara de muñeca.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en adaptación de VLA: sirve como punto de partida reproducible para estudiar cómo afecta la adaptación parcial del codificador visual al rendimiento en LIBERO, usando el preset `pi05_libero_pad_img_view_adapt`.
- Evaluación comparativa en LIBERO: permite replicar la fila PAD de la tabla del paper con el evaluador congelado `kn_b200` y el entorno MuJoCo 3.2.3, con semilla de entorno 7.
- Baseline para experimentos de IDM: útil para comparar variantes de pérdida IDM (por ejemplo, con o sin exclusión del gripper) sobre la misma sonda `view_medium` n50k.
- Estudio de congelación selectiva: al mantener LLM y experto de acción en el modelo fuente, permite aislar el efecto de la adaptación visual en el éxito de tarea.
- Reproducción de pipelines openpi: integrable en flujos de entrenamiento y exportación de openpi para generar políticas desplegables (`policy/`).
- Análisis de artefactos de normalización: los `assets` de normalización permiten auditar la coherencia entre entrenamiento y evaluación en entornos simulados.

## Benchmarks y rendimiento

| Benchmark | Resultado | Detalle |
|---|---|---|
| LIBERO (éxito global) | 1218/2000 = 60,90% | 500 episodios por suite, semilla de entorno 7, evaluador congelado `kn_b200`, MuJoCo 3.2.3 |

No se han publicado en la información disponible resultados desglosados por suite ni comparaciones con otros modelos en formato de tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo ocupa 15,7 GB, lo que da una cota inferior orientativa del espacio en disco necesario.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el ecosistema indicado es openpi con el preset `pi05_libero_pad_img_view_adapt`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Adaptación | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-pad-vision-head-view-medium-1000 (este) | π0.5 (pi05) | Solo codificador visual con IDM, 1k updates | no disponible | Apache 2.0 | Hugging Face |
| pi05-libero-pad-vision-head-yaw10-1000-20261105 | π0.5 (pi05) | Variante yaw10, 1k updates | no disponible | Apache 2.0 | Hugging Face |
| pi05-libero-source-free-vision-idm-view-large-1000-20261010 | π0.5 (pi05) | IDM solo visión sin observación fuente, view large | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint experimental: procede de un pipeline de investigación (`vla_adaptation`) y no se presenta como modelo listo para producción.
- Rendimiento moderado: 60,90% de éxito en LIBERO indica que un 39,1% de episodios fallan en el conjunto evaluado.
- Evaluación limitada a simulación: los resultados se obtienen en MuJoCo 3.2.3 con un evaluador congelado concreto (`kn_b200`) y semilla 7; la generalización a otros entornos no está documentada.
- Sin datos de sesgos, alucinación o comportamiento fuera de distribución: no disponible.
- Idiomas y contexto no documentados: no hay información sobre capacidades lingüísticas ni ventana de contexto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo depende de la base π0.5 y de openpi; conviene verificar las licencias de esos componentes.
- Ausencia de cuantizaciones publicadas: no se ofrecen pesos GGUF ni variantes cuantizadas, lo que limita el despliegue en hardware modesto.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-pad-vision-head-view-medium-1000-20261105
- Variante yaw10: https://huggingface.co/Donghyun1228/pi05-libero-pad-vision-head-yaw10-1000-20261105
- Variante source-free vision IDM view large: https://huggingface.co/Donghyun1228/pi05-libero-source-free-vision-idm-view-large-1000-20261010
- Repositorio de código referenciado: `Donghyun1228/vla_adaptation` (commit `7b74d01d`), preset `pi05_libero_pad_img_view_adapt`
