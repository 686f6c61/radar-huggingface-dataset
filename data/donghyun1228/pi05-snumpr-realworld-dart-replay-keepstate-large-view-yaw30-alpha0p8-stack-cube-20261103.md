# Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-alpha0p8-stack-cube-20261103

## Resumen

π0.5 SNUMPR real-world DART merge para la tarea `stack_cube` es un modelo de visión-lenguaje-acción (VLA) orientado a robótica manipulativa, publicado por el usuario Donghyun1228 sobre la base SNUMPR VLA (`snumpr-iclr27-v1/9999`). El modelo se ha construido mediante *domain arithmetic* (DART) aplicada a un fine-tuning previo, combinando una fuente de demostración real con una repetición (*replay*) de esa misma demostración capturada desde una vista de cámara desplazada y con la base virtual rotada +30° en yaw. El resultado es un checkpoint específico para apilar cubos (`stack_cube`) que conserva el estado articular real (`--keep-state`) mientras transforma las poses TCP y las acciones delta al marco virtual.

El interés técnico del artefacto es metodológico: ilustra un flujo de adaptación de dominio en robótica donde se reutilizan trayectorias conjuntas idénticas entre fuente y objetivo, variando únicamente las imágenes, y se aplica una mezcla DART con α 0,8 sobre el 100 % del ámbito de pesos. El repositorio ocupa 5,3 GB, se distribuye en BF16 con normalización original y licencia Apache 2.0, y no incluye evaluación en robot real.

No se dispone de información sobre arquitectura interna detallada, número de parámetros, contexto o idiomas más allá de las etiquetas del repositorio (`pi05`, `openpi`, `snumpr`, `dart`), por lo que los apartados correspondientes se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) derivada de π0.5 / openpi, según etiquetas del repo; detalle interno no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` en BF16 más `assets` con normalización original (formato de checkpoint openpi; no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de la base `snumpr-iclr27-v1/9999`, descrita como SNUMPR VLA inicial con normalización original, y se construye en dos fases. Primero se reutiliza, sin reentrenar, un fine-tuning fuente (`pi05-snumpr-realworld-dart-paired-source-ft-1000-stack-cube-20261030`, commit `405e852b…`) entrenado con el preset `pi05_snumpr_dart_paired_source_stack_cube` sobre la demostración `demonstration_7` con yaw 0. Después se entrena un fine-tuning objetivo (`pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-ft-1000-stack-cube-20261103`) con el preset `pi05_snumpr_dart_replay_target_large_view_yaw30_keepstate_stack_cube`: aprendizaje por imitación puro, 1.000 actualizaciones, batch 64, LR constante 5e-5, sin warmup, sin EMA y con todos los pesos entrenables (código `Donghyun1228/vla_adaptation`, commit `2065dd0a`).

La innovación está en la construcción del objetivo: la demostración objetivo es una repetición (*replay*) del 3 de noviembre de 2026 de la demostración fuente `demonstration_7`, en la que el robot reprodujo la trayectoria articular original mientras la cámara base se situaba en la vista de gran desplazamiento. Por tanto, estado, acciones y marcas temporales coinciden con la fuente y solo cambian las imágenes. Las poses TCP y las acciones delta se rotan por un yaw de base virtual de +30° (`Rz(-30)`), mientras que `observation.state` conserva los ángulos articulares reales (`--keep-state`). La fusión se realiza con el `domain_arithmetic.dart` oficial de `snumprlab/dart` (commit `1b23c4f4…`), α 0,8, ámbito *all*, semilla 42 y ejecución en CPU. El archivo `dart_merge_verified.json` documenta una verificación hoja por hoja de 51/51 claves sin *fallback*, y cada archivo fuente se comprobó contra su commit (tamaño y sha256 LFS / blob id de git) antes de la mezcla.

## Capacidades

- Generación de acciones motoras para manipulación robótica: el modelo produce acciones delta y poses TCP condicionadas a observaciones visuales y al estado articular.
- Ejecución de la tarea específica `stack_cube` (apilado de cubos) en un entorno real de laboratorio.
- Condicionamiento visual multi-vista: entrenado con una vista de cámara base desplazada (*large view*) y yaw virtual de +30°.
- Mantenimiento del estado real: `observation.state` se alimenta sin transformar, con los ángulos articulares reales.
- Aprendizaje por imitación sobre una única demostración fuente replicada, lo que permite adaptar el modelo a cambios de punto de vista de cámara.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual, matemáticas, visión general, audio ni modo *thinking*.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en adaptación de dominio para VLA: el checkpoint sirve como referencia reproducible de una fusión DART con α 0,8 sobre una única tarea, útil para estudiar cómo afecta el desplazamiento de cámara a la política aprendida.
- Reutilización de demostraciones existentes: al conservar estado y acciones de la demostración fuente y variar solo las imágenes, permite generar pares fuente-objetivo sin regrabar trayectorias, reduciendo el coste de recolección de datos.
- Apilado de cubos en banco de pruebas: despliegue directo en la celda robótica del laboratorio SNUMPR para la tarea `stack_cube` con la cámara base en la vista de gran desplazamiento.
- Calibración de transformaciones de marco: el modelo exige que el controlador rote las acciones de vuelta con `Δxyz_real = Rz(+30) Δxyz_virtual` y alimente el estado articular real; sirve para validar pipelines de control que implementen esta conversión.
- Estudio de robustez a cambios de punto de vista: comparar este modelo con el modelo DART emparejado de la misma tarea (idéntico salvo en la demostración objetivo) permite aislar el efecto de la vista de cámara.
- Base para nuevos fine-tunings: al estar en formato openpi con normalización original y licencia Apache 2.0, puede reutilizarse como inicialización para otras tareas o vistas dentro del mismo entorno.
- Docencia y reproducción de experimentos: el repositorio incluye `merge_config.json` y `dart_merge_verified.json`, lo que facilita auditar y replicar el proceso de fusión paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que todavía no se ha ejecutado ninguna evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 5,3 GB y los pesos se publican en BF16, por lo que el peso en memoria de los parámetros es del orden de varios GB, pero no se especifica el total.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo sigue el ecosistema openpi / π0.5 (etiquetas `pi05`, `openpi`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son adecuadas para un VLA de robótica.
- Latencia y throughput: no disponibles.
- Nota operativa: la fusión DART se ejecutó en CPU con semilla 42; el requisito de hardware para la inferencia en el robot no se detalla.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-alpha0p8-stack-cube-20261103`) | no disponible | no disponible | `stack_cube`, vista desplazada, yaw +30° | Apache 2.0 | Hugging Face, 0 descargas |
| `Donghyun1228/pi05-snumpr-realworld-dart-paired-source-ft-1000-stack-cube-20261030` | no disponible | no disponible | `stack_cube`, fuente emparejada, yaw 0 | no disponible en la información | Hugging Face (referenciado) |
| `Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-ft-1000-stack-cube-20261103` | no disponible | no disponible | `stack_cube`, fine-tuning objetivo previo a la fusión | no disponible en la información | Hugging Face (referenciado) |
| `snumpr-iclr27-v1/9999` (base SNUMPR VLA) | no disponible | no disponible | VLA generalista | no disponible en la información | Referenciado como base |

La comparación relevante es interna a la familia: este checkpoint difiere del modelo DART emparejado de la misma tarea únicamente en la demostración objetivo (vista desplazada y yaw +30° en lugar de yaw 0), lo que lo convierte en el control experimental adecuado para medir el impacto del cambio de vista.

## Limitaciones y advertencias

- Sin evaluación en robot real: la model card afirma que no se ha ejecutado ninguna prueba en hardware, por lo que no hay evidencia de éxito en la tarea.
- Especialización extrema: entrenado solo para `stack_cube` sobre una única demostración fuente; no se espera generalización a otras tareas, objetos o entornos.
- Dependencia de transformación en el controlador: si el robot no aplica `Δxyz_real = Rz(+30) Δxyz_virtual` y no alimenta el estado articular real sin cambios (`virtual_base_yaw_deg=30`, `keep_real_state=True`), las acciones serán incorrectas.
- Dependencia de la normalización original: los `assets` deben usarse tal cual (SHA `f549619e…`); alterarlos invalida la política.
- Riesgo de sobreajuste a la vista de cámara: al entrenar con una vista de gran desplazamiento y yaw virtual, el rendimiento fuera de esa configuración no está caracterizado.
- Sesgos conocidos: no documentados; en robótica, los sesgos provienen de la distribución de demostraciones, aquí una sola trayectoria.
- Riesgo de alucinación motora: no evaluado; un VLA puede generar acciones plausibles pero incorrectas sin señal de incertidumbre.
- Idiomas: no aplica ni está documentado.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la especificidad del checkpoint desaconsejan su uso en producción sin validación previa.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de reproducibilidad externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-alpha0p8-stack-cube-20261103
- Fine-tuning fuente reutilizado: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-source-ft-1000-stack-cube-20261030
- Fine-tuning objetivo: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-ft-1000-stack-cube-20261103
- Código de adaptación VLA: `Donghyun1228/vla_adaptation` (commit `2065dd0a`; no se proporciona URL)
- Implementación DART: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`; no se proporciona URL)
- Base SNUMPR VLA: `snumpr-iclr27-v1/9999` (no se proporciona URL)
