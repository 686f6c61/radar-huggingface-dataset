# GerardDevlin/CLOSURE-weights

## Resumen

CLOSURE-weights es el repositorio de pesos del proyecto CLOSURE, un conjunto de parámetros asociados a un método de evaluación sobre la suite de robótica LIBERO. El modelo se distribuye como complemento de un pipeline de evaluación de políticas de visión-lenguaje-acción (VLA): no es un modelo autónomo, sino un conjunto de pesos que se cargan junto a una política base congelada (frozen base policy) que debe obtenerse por separado.

El autor, GerardDevlin, publica los pesos organizados por backbone: `oft/` (para los cuatro checkpoints oficiales OpenVLA-OFT de LIBERO), `pi0/` (OpenPI `pi0_libero` en formato PyTorch) y `pi05/` (OpenPI `pi05_libero` en formato PyTorch). Cada backbone contiene a su vez cuatro subdirectorios correspondientes a las suites de LIBERO: `libero_spatial`, `libero_object`, `libero_goal` y `libero_10`.

La relevancia del repositorio es acotada y muy específica: sirve para reproducir la evaluación principal del proyecto CLOSURE sobre tareas de manipulación robótica en LIBERO. No se trata de un modelo de propósito general, sino de un artefacto de investigación reproducible cuyo uso requiere el código del repositorio CLOSURE en un commit concreto (f3f4810).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pesos asociados a políticas VLA base: OpenVLA-OFT, OpenPI pi0 y pi05) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible explícitamente; se mencionan ficheros `report.json`, `closure.pt` y `SHA256SUMS` |
| Tamano del repositorio | 0,8 GB |
| Pipeline declarado | robotics |
| Suites evaluadas | libero_spatial, libero_object, libero_goal, libero_10 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de CLOSURE ni su proceso de entrenamiento. Lo que sí se detalla es la estructura de despliegue: los pesos se organizan en tres backbones (`oft`, `pi0`, `pi05`) y cada uno se apoya en una política base congelada distinta. Para `oft/` la base son los cuatro checkpoints oficiales OpenVLA-OFT de LIBERO incluidos en el lock de checkpoints del repositorio de código; para `pi0/` y `pi05/` son los modelos `pi0_libero` y `pi05_libero` de OpenPI en formato PyTorch.

El flujo de uso implica dos pasos según el backbone. En el caso de OFT, se genera un manifiesto a partir de los ficheros descargados mediante `closure_vla.export_weights`, pasando el `report.json` de la suite correspondiente y produciendo un JSON que después se entrega a `closure_vla.evaluate --weights`. En el caso de OpenPI, se pasa directamente el `closure.pt` de la suite a `closure_vla.openpi.evaluate --weights`, seleccionando el backbone con `--backbone pi0` o `--backbone pi05`. El repositorio incluye `SHA256SUMS` para verificar la integridad de los ficheros de despliegue y recomienda fijar la descarga al commit del snapshot del Hub.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Evaluación de políticas VLA sobre las cuatro suites de LIBERO: `libero_spatial`, `libero_object`, `libero_goal` y `libero_10`.
- Compatibilidad con tres backbones distintos de política base: OpenVLA-OFT, OpenPI pi0 y OpenPI pi05.
- Exportación de pesos a un manifiesto JSON para el backbone OFT mediante `closure_vla.export_weights`.
- Evaluación directa con ficheros `closure.pt` para los backbones OpenPI mediante `closure_vla.openpi.evaluate`.
- Verificación de integridad de los ficheros de despliegue mediante `SHA256SUMS`.
- Fijado de versión mediante el commit del snapshot del Hub para descargas reproducibles.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo, dado que el artefacto es un conjunto de pesos para evaluación robótica.

## Casos de uso

- Reproducción de la evaluación principal de CLOSURE sobre LIBERO: descargar los pesos del backbone deseado, cargar la política base congelada correspondiente y ejecutar `closure_vla.evaluate` o `closure_vla.openpi.evaluate` para obtener resultados comparables con los del artículo o repositorio del proyecto.
- Comparación entre backbones: al disponer de pesos para `oft`, `pi0` y `pi05` sobre las mismas cuatro suites, es posible ejecutar la misma evaluación con cada política base y contrastar el comportamiento de CLOSURE según el backbone subyacente.
- Investigación en manipulación robótica con benchmarks estandarizados: las suites de LIBERO cubren tareas de spatial, object, goal y long-horizon (libero_10), lo que permite estudiar el rendimiento en distintos regímenes de generalización.
- Integración en pipelines de evaluación automatizada: el flujo basado en manifiestos JSON (`export_weights` seguido de `evaluate --weights`) facilita encadenar la descarga, verificación y evaluación en scripts de CI o entornos de experimentación reproducibles.
- Auditoría de artefactos de investigación: el uso de `SHA256SUMS` y el fijado por commit del snapshot del Hub permiten verificar que los pesos evaluados coinciden exactamente con los publicados.
- Extensión a nuevos backbones o suites: la estructura por carpetas y el esquema de manifiestos sirven como plantilla para incorporar políticas base adicionales en flujos de evaluación propios, siempre que se respete la interfaz del repositorio CLOSURE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende enteramente de la política base congelada que se cargue (OpenVLA-OFT, OpenPI pi0 o pi05), cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el repositorio de código CLOSURE (commit f3f4810) con los módulos `closure_vla.evaluate` y `closure_vla.openpi.evaluate`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Espacio en disco: el repositorio de pesos ocupa 0,8 GB, sin contar las políticas base congeladas que deben descargarse aparte.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación con alternativas de la misma categoría.

## Limitaciones y advertencias

- Los pesos no son autónomos: requieren una política base congelada (OpenVLA-OFT, OpenPI pi0 o pi05) que debe cargarse por separado y no se distribuye en este repositorio.
- El código necesario está fijado a un commit concreto del repositorio CLOSURE (f3f4810); usar otra versión puede romper la compatibilidad de los manifiestos o de los ficheros `closure.pt`.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial ni la redistribución de los pesos ni de los modelos base asociados.
- No se especifican idiomas soportados; el ámbito es exclusivamente robótico y de evaluación sobre LIBERO.
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad hasta la fecha.
- No se han publicado benchmarks en la información disponible, por lo que no es posible verificar el rendimiento declarado del método.
- El uso de los backbones OpenVLA-OFT y OpenPI implica respetar las licencias y condiciones de esos proyectos, que no se detallan aquí.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual de modelos generativos de texto; el artefacto es un conjunto de pesos para evaluación de políticas robóticas.

## Enlaces

- Repositorio de pesos en Hugging Face: https://huggingface.co/GerardDevlin/CLOSURE-weights
- Repositorio de código CLOSURE (commit f3f4810): https://github.com/Gerard-Devlin/CLOSURE/tree/f3f48101a5d270f21536d927d23abb1accf428b9
