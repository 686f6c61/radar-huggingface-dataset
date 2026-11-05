# Donghyun1228/pi05-libero-pad-vision-head-view-small-1000-20261105

## Resumen

π0.5 LIBERO view_small PAD es un checkpoint de investigación en robótica publicado por el usuario Donghyun1228 en HuggingFace. Se trata de una adaptación del modelo π0.5 (pi05) de Physical Intelligence, orientada a tareas de manipulación sobre el benchmark LIBERO, un conjunto de referencia para evaluar políticas visomotoras en entornos simulados. El modelo se distribuye bajo el ecosistema openpi y la licencia Apache 2.0.

La variante PAD (vision-encoder IDM head) aplica un ajuste fino selectivo: únicamente el codificador visual PaliGemma/img se adapta mediante una pérdida IDM (inverse dynamics modeling) sobre una sonda de soporte view_small con n50k. El resto de componentes (cabeza IDM, LLM y experto de acciones) permanecen congelados en el estado del modelo fuente, lo que reduce drásticamente el coste de adaptación respecto a un ajuste completo.

El checkpoint reporta un éxito de 1740/2000 episodios (87,00 %) en LIBERO, con 500 episodios por suite, semilla de entorno 7 y evaluador congelado kn_b200 sobre MuJoCo 3.2.3. Es relevante para investigadores que estudian adaptación eficiente de modelos visión-lenguaje-acción (VLA) y para quienes replican la tabla LIBERO del paper de referencia. El repositorio ocupa 15,6 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (openpi); codificador visual PaliGemma/img, LLM y experto de acciones |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params`, `train_state` y `assets` (normalización) en el directorio `999/`; política de evaluación en `policy/` |

## Arquitectura y entrenamiento

El modelo parte de `Donghyun1228/pi05-libero-pad-vision-head-source-n50k-10000-20261104` en el paso 9999. La adaptación se realiza con el preset `pi05_libero_pad_img_view_adapt` del repositorio `Donghyun1228/vla_adaptation` (commit `7b74d01d`), cuyo `run/spec.json` contiene el argv completo. Solo el codificador visual (`PaliGemma/img`) se entrena con la pérdida IDM sobre la sonda de soporte view_small (n50k); la cabeza IDM, el LLM y el experto de acciones quedan congelados en el estado fuente. El índice del gripper (6) se excluye de la pérdida IDM.

La configuración de entrenamiento es AdamW con LR pico 5e-5 (warmup de 500 pasos y después constante), batch de 32, 1000 actualizaciones y semilla 42. El directorio `999/` incluye parámetros, estado de entrenamiento y assets de normalización. La política de evaluación (`policy/`) corresponde al paso 999 sin la cabeza IDM, y la torre visual adaptada se aplica a la cámara de muñeca según `export.json`.

## Capacidades

- Política visomotora para manipulación robótica en entornos simulados LIBERO.
- Control de acciones de extremo a extremo a partir de observaciones visuales (cámara de muñeca y vista principal).
- Adaptación de representaciones visuales mediante pérdida IDM sobre sondas de soporte.
- Evaluación estandarizada sobre cuatro suites LIBERO (500 episodios por suite).
- Integración con el ecosistema openpi para entrenamiento y despliegue.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo ni modos de razonamiento.

## Casos de uso

- Replicación de la tabla LIBERO: el checkpoint permite reproducir la fila PAD del paper con el evaluador kn_b200 y MuJoCo 3.2.3, usando la semilla de entorno 7 y 500 episodios por suite para obtener el 87,00 % reportado.
- Estudio de adaptación eficiente: al congelar LLM y experto de acciones y entrenar solo el codificador visual, sirve para medir cuánto rendimiento aporta la adaptación de la torre visual frente a un ajuste completo.
- Investigación en inverse dynamics modeling: la pérdida IDM sobre view_small (n50k) con exclusión del gripper permite analizar qué información dinámica captura el codificador visual.
- Baseline en comparativas de VLA: útil como referencia PAD frente a otras variantes de π0.5 en LIBERO para estudiar transferencia entre suites.
- Validación de pipelines openpi: el preset `pi05_libero_pad_img_view_adapt` y los ficheros `run/spec.json` y `export.json` permiten verificar la cadena de entrenamiento y exportación.
- Análisis de robustez por suite: `run/evaluation_audit.json` contiene los recuentos por suite, lo que facilita estudiar diferencias de éxito entre tareas LIBERO.

## Benchmarks y rendimiento

| Benchmark | Configuración | Resultado |
|---|---|---|
| LIBERO (global) | 500 episodios por suite, env seed 7, evaluador kn_b200, MuJoCo 3.2.3 | 1740/2000 = 87,00 % |

No se han publicado en la información disponible resultados desglosados por suite ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 15,6 GB, lo que da una cota inferior del espacio en disco necesario.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ecosistema openpi (entrenamiento y evaluación); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO view_small PAD (este) | no disponible | no disponible | 87,00 % (1740/2000) | Apache 2.0 | HuggingFace |
| π0.5 LIBERO source (n50k, paso 9999) | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |
| Otras variantes π0.5/openpi | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no se documentan garantías de robustez fuera de LIBERO ni en entornos reales.
- El éxito del 87,00 % corresponde a una configuración concreta (semilla 7, evaluador kn_b200, MuJoCo 3.2.3); variaciones de semilla o evaluador pueden alterar el resultado.
- La adaptación se limita al codificador visual; el resto de componentes hereda posibles sesgos del modelo fuente.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas.
- Sin descargas ni likes registrados: no hay evidencia de uso comunitario ni validación independiente.
- La licencia Apache 2.0 permite uso comercial, pero el checkpoint depende del modelo fuente y del ecosistema openpi, cuyas condiciones deben verificarse por separado.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar despliegues en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-pad-vision-head-view-small-1000-20261105
- Modelo fuente: https://huggingface.co/Donghyun1228/pi05-libero-pad-vision-head-source-n50k-10000-20261104
- Repositorio de código: `Donghyun1228/vla_adaptation` (commit `7b74d01d`), preset `pi05_libero_pad_img_view_adapt`
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la búsqueda web.
