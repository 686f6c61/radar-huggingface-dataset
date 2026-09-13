# mattewg/pi05-xarm7-shaver-all60-step29999

## Resumen

`mattewg/pi05-xarm7-shaver-all60-step29999` es un checkpoint de política robótica publicado por el usuario mattewg en Hugging Face. Se trata de un modelo de visión-lenguaje-acción (VLA) de la familia pi0.5 del ecosistema openpi, entrenado para una única tarea: una etapa del ensamblaje de una caja de afeitado (shaver-box) con dos brazos xArm7. El checkpoint corresponde al paso 29.999 del experimento denominado `all60_v1`.

El repositorio contiene únicamente los pesos en EMA (`params/`), las estadísticas de normalización (`assets/<repo_id>/norm_stats.json`) y metadatos de contabilidad de orbax. Se ha excluido deliberadamente `train_state/`, que ocupa 31 de los 42 GB del checkpoint completo y solo resulta útil para reanudar el entrenamiento, por lo que la descarga publicada se queda en 12,4 GB.

Su relevancia es la de un artefacto de investigación reproducible en robótica: permite ejecutar la inferencia de una política bimanual concreta con `serve_policy.py` de openpi, siempre que se sirva bajo una configuración cuyo `repo_id` coincida con el directorio incluido en `assets/`. No incluye fichero de configuración, no declara licencia ni idiomas y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) pi0.5, familia pi0 / proyecto openpi; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de acción, no de lenguaje: `action_horizon=16`) |
| Tipos de cuantizacion | no disponible (solo pesos EMA en formato orbax; no se publican GGUF ni cuantizaciones alternativas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | orbax (JAX): directorio `params/` con pesos EMA, más `assets/<repo_id>/norm_stats.json` y `_CHECKPOINT_METADATA` |
| Tamaño del repositorio | 12,4 GB (checkpoint completo con `train_state/`: 42 GB según la model card) |
| Dimension de estado y accion | 16-D, ampliadas (padding) a 32: `[R j1..j7, R gripper, L j1..j7, L gripper]` |
| Tipo de acciones | delta para las 14 articulaciones, absoluta para las 2 pinzas (`make_bool_mask(7, -1, 7, -1)`) |
| Pinzas | valores estrictamente 0.0 o 1.0 |
| Frecuencia de los datos | 60 fps |
| Horizonte de accion | 16 |
| Paso del checkpoint | 29999 |
| Experimento | `all60_v1` |
| Config de servicio | `pi05_xarm7_all60` |
| Pipeline declarado | robotics |
| Etiquetas | robotics, pi0, openpi, xarm7, region:us |

## Arquitectura y entrenamiento

La model card identifica el modelo como una política pi0.5 para una etapa de la tarea bimanual xArm7 de la caja de afeitado, dentro del proyecto openpi. No se detalla en la información disponible la arquitectura interna (composición de torre visual, codificador de lenguaje, experto de acciones o mecanismo de generación de acciones), ni el número de parámetros, ni la composición del dataset de entrenamiento, ni si hubo RLHF, DPO u otro ajuste por preferencias. Tampoco se indica el número de tokens, trayectorias o episodios utilizados.

Los datos técnicos confirmados se limitan al esquema de entrada y salida y al pipeline de servicio. El vector de estado y acción es de 16 dimensiones ampliadas a 32, con la estructura `[R j1..j7, R gripper, L j1..j7, L gripper]`; las acciones se expresan como delta para las 14 articulaciones y como valor absoluto binario para las dos pinzas, según la máscara `make_bool_mask(7, -1, 7, -1)`. Los datos están muestreados a 60 fps y el modelo emite bloques de acción con `action_horizon=16`. Los pesos publicados son los del promedio móvil exponencial (EMA), no los pesos crudos del optimizador.

Un detalle operativo relevante es que el checkpoint no transporta configuración. `create_trained_policy` resuelve las estadísticas de normalización desde `checkpoint_dir/assets/<asset_id>`, y `asset_id` cae por defecto al `repo_id` de la configuración, de modo que el modelo debe servirse bajo una configuración cuyo `repo_id` coincida con el directorio incluido en `assets/` (config `pi05_xarm7_all60`), y no bajo la configuración por defecto `pi05_xarm7_real`. Servirlo con la configuración equivocada impide localizar `norm_stats.json`.

## Capacidades

- Generación de acciones motoras para una política bimanual sobre dos brazos xArm7 (14 articulaciones más 2 pinzas).
- Control de una única etapa de la tarea de ensamblaje de la caja de afeitado (shaver-box); no cubre el ciclo completo de la tarea.
- Emisión de bloques de acción de 16 pasos (`action_horizon=16`) a partir de observaciones, pensada para control a 60 fps.
- Mezcla de acciones relativas (delta) para las articulaciones y absolutas para las pinzas, con salida binaria estricta en las pinzas.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas ni visión entendida como tarea de percepción general.
- No se documenta soporte de tool calling, function calling, uso de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni modo de pensamiento (thinking mode), audio o visión más allá de la observación propia de la política.
- No se documenta generalización a otras tareas, objetos o morfologías de robot distintas de la del entrenamiento.

## Casos de uso

- Reproducción de experimentos en laboratorio de robótica: descargar el checkpoint y servirlo con `serve_policy.py policy:checkpoint --policy.config=pi05_xarm7_all60 --policy.dir=<directorio>` para replicar la política del paso 29.999 del experimento `all60_v1` en un banco de pruebas xArm7.
- Comparación de checkpoints de la misma tarea: al fijar paso, experimento y esquema de acciones, sirve como punto de referencia cuantitativo frente a otros pasos intermedios o variantes de configuración (`pi05_xarm7_all60` frente a `pi05_xarm7_real`) dentro del mismo pipeline openpi.
- Inicialización para ajuste fino: al conservar los pesos EMA en `params/`, puede emplearse como punto de partida para entrenar la política de otra etapa del mismo montaje, aunque la ausencia de `train_state/` impide reanudar el entrenamiento exactamente donde se dejó.
- Control en bucle cerrado a 60 fps: con un horizonte de acción de 16 pasos, la política puede integrarse en un bucle de control que recalcule observaciones y estado a la frecuencia de los datos de entrenamiento.
- Validación de normalización y sim-to-real: el `norm_stats.json` incluido permite auditar cómo se escalan las 16 dimensiones de estado y acción antes de trasladar la política a un montaje físico o a un simulador.
- Docencia y formación en VLA: como ejemplo real de artefacto de política pi0.5 con esquema de acciones documentado, útil para enseñar cómo se estructura un checkpoint openpi y cómo se sirve.
- Base para una política multi-etapa: al especializarse en una sola etapa, puede combinarse con políticas equivalentes de las etapas restantes mediante un planificador de tareas, siempre que el esquema de estado y acción se mantenga.
- Auditoría de reproducibilidad: el repositorio incluye metadatos de orbax (`_CHECKPOINT_METADATA`) que permiten verificar la coherencia del checkpoint antes de desplegarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de seguimiento, comparaciones con otros checkpoints ni curvas de entrenamiento, y los resultados de la búsqueda web no aportan datos sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio de pesos ocupa 12,4 GB, por lo que una carga en memoria de los pesos requiere al menos ese orden de magnitud; el consumo real depende de la precisión y del runtime de JAX empleado.
- GPUs recomendadas: no especificadas por el autor. Por tratarse de un checkpoint orbax/JAX dentro de openpi, el entorno habitual son GPU NVIDIA de centro de datos (A100, H100) o GPUs de gama alta para laboratorio.
- GPU de consumo: no confirmado. Los 12,4 GB de pesos son compatibles en principio con tarjetas de 24 GB (RTX 3090, RTX 4090) si el runtime y el resto del grafo caben en memoria, pero el autor no publica requisitos mínimos.
- Opciones de despliegue: `serve_policy.py` de openpi con `policy:checkpoint` y `--policy.config=pi05_xarm7_all60`. No se documentan rutas alternativas (no hay GGUF, por lo que llama.cpp, Ollama y similares no son aplicables a este artefacto; tampoco se menciona vLLM ni TGI).
- Latencia y throughput: no disponibles. El único dato relacionado es que los datos de entrenamiento están a 60 fps con `action_horizon=16`, lo que da una referencia de cadencia objetivo de la tarea, no una medición de latencia del checkpoint.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks, parámetros o licencia de alternativas comparables en la información proporcionada. La única comparación documentada en la propia model card es de índole operativa, entre la configuración necesaria para servir este checkpoint y la configuración por defecto del mismo ecosistema.

| Modelo / configuracion | Tarea | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mattewg/pi05-xarm7-shaver-all60-step29999` (config `pi05_xarm7_all60`) | Una etapa de la tarea bimanual xArm7 shaver-box | no disponible | `action_horizon=16`, estado/acción 16-D | no disponible | Peso EMA en orbax, sin `train_state/`, 12,4 GB |
| `pi05_xarm7_real` (config por defecto de openpi) | Política base de referencia para xArm7 real | no disponible | no disponible | no disponible | Configuración por defecto del pipeline; no sirve para este checkpoint porque su `repo_id` no coincide con el directorio de `assets/` |
| Otras alternativas de la misma categoría (VLA bimanual) | no disponible | no disponible | no disponible | no disponible | No se han encontrado datos en la información proporcionada |

## Limitaciones y advertencias

- Alcance muy restringido: el modelo cubre una sola etapa de una única tarea (shaver-box) con una morfología concreta (dos xArm7). No hay evidencia de generalización a otras tareas, objetos o robots.
- Licencia no declarada: al no especificarse licencia, el uso comercial y la redistribución quedan en un limbo legal que debe resolverse con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinación motora: como toda política entrenada por imitación, puede producir acciones plausibles pero incorrectas fuera de la distribución de estados visitados durante el entrenamiento; en un robot físico esto implica riesgo de colisión o de daño al material.
- Sin `train_state/`: no es posible reanudar el entrenamiento desde este repositorio; solo sirve para inferencia o como inicialización para un ajuste fino nuevo.
- Dependencia estricta de la configuración: debe servirse bajo una config cuyo `repo_id` coincida con el directorio de `assets/`. Servirlo con `pi05_xarm7_real` u otra configuración impide resolver las estadísticas de normalización.
- Esquema de acciones fijo: 16 dimensiones ampliadas a 32, delta para 14 articulaciones y binario estricto para las pinzas. Cualquier montaje con otro número de articulaciones o pinzas continuas queda fuera del contrato del modelo.
- Sincronización temporal: los datos son de 60 fps con `action_horizon=16`; operar a otra frecuencia sin remuestrear puede degradar el comportamiento.
- Ausencia de validación pública: 0 descargas y 0 valoraciones en el momento de la consulta, sin benchmarks ni informes de éxito publicados. No hay evidencia externa de rendimiento.
- Idiomas no declarados: no hay información sobre instrucciones en lenguaje natural; no debe asumirse que el modelo acepte comandos textuales ni que soporte varios idiomas.
- Confusión de categoría: no es un modelo de lenguaje. No genera texto, no razona sobre preguntas y no admite tool calling; cualquier evaluación de tipo MMLU o HumanEval carece de sentido aquí.
- Metadatos mejorables: el repositorio no incluye configuración ni documentación de la observación visual, lo que dificulta reproducir el entorno exacto de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/mattewg/pi05-xarm7-shaver-all60-step29999
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada; los resultados devueltos correspondían a páginas de ayuda de YouTube y a contenidos de Zhihu, sin relación con el modelo.
