# Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-hang-tape-top-20261030

## Resumen

π0.5 SNUMPR real-world DART merge para la tarea `hang_tape_top` es un checkpoint de robótica derivado de la familia π0.5 (openpi) y adaptado mediante la técnica DART (Domain Arithmetic) sobre el VLA inicial SNUMPR. Lo publica el usuario Donghyun1228 como artefacto de investigación asociado al repositorio `snumprlab/dart`. El modelo resuelve una tarea concreta de manipulación —colgar cinta en una posición superior— en un entorno real, y su interés radica en que documenta un procedimiento reproducible de fusión de pesos entre un fine-tuning "fuente" y un fine-tuning "objetivo" con cambios geométricos controlados (rotación de yaw virtual de +30°).

El checkpoint combina dos fine-tunings de imitación sobre la base `snumpr-iclr27-v1/9999`: uno sobre la demostración fuente `demonstration_9` (yaw 0) y otro sobre una demostración objetivo recogida de nuevo el 2026-10-30 con vista amplia y yaw virtual de +30°, manteniendo los ángulos articulares reales en `observation.state` (opción `--keep-state`). La fusión se realiza con el script oficial `domain_arithmetic.dart` del repositorio `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), con α 0.8, scope global, semilla 42 y ejecución en CPU.

Se trata de un artefacto muy específico: un único checkpoint de política visuomotora para una tarea, sin evaluación en robot todavía y sin métricas publicadas. Su valor es fundamentalmente metodológico y de trazabilidad (incluye `merge_config.json` y una verificación hoja por hoja de 51/51 claves sin fallback), no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA π0.5 (openpi) derivada de SNUMPR; no se detalla la topología interna en la model card |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos publicados en BF16 |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje declarada) |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` en BF16 más `assets` con normalización original (SHA `f549619e…`); no se especifica el contenedor exacto (safetensors no confirmado) |

## Arquitectura y entrenamiento

El modelo parte de la base `snumpr-iclr27-v1/9999` (VLA inicial de SNUMPR con normalización original) y aplica dos fine-tunings de imitación (IL only) sobre ella. El primero, preset `pi05_snumpr_dart_paired_source_hang_tape_top`, se entrena sobre la demostración fuente `demonstration_9` con yaw 0. El segundo, preset `pi05_snumpr_dart_paired_target_large_view_yaw30_keepstate_hang_tape_top`, se entrena sobre una demostración objetivo recogida de nuevo el 2026-10-30 con vista amplia; en este caso las poses TCP (y por tanto las acciones delta) se rotan mediante un yaw de base virtual de +30° (`Rz(-30)`), mientras que `observation.state` conserva los ángulos articulares reales gracias a la opción `--keep-state`.

Ambos fine-tunings usan 1.000 actualizaciones, batch 64, learning rate constante de 5e-5, sin warmup, sin EMA y entrenando todos los pesos, con el código `Donghyun1228/vla_adaptation` en el commit `c4fcb61`. La innovación técnica es la fusión DART: se aplica `domain_arithmetic.dart` oficial con α 0.8, scope global, semilla 42 y ejecución en CPU. El repositorio incluye `merge_config.json` (registro del merger) y `dart_merge_verified.json`, una comprobación hoja por hoja que confirma 51/51 claves fusionadas sin fallback. No se documentan en la model card el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Política visuomotora para una tarea de manipulación concreta: `hang_tape_top` (colgar cinta en posición superior).
- Control robótico a partir de observaciones (estado articular real) y acciones delta en el espacio de poses TCP.
- Cambio de marco geométrico controlado: las acciones se generan en un marco virtual rotado +30° en yaw, requiriendo que el controlador rote la acción de vuelta (`Δxyz_real = Rz(+30) Δxyz_virtual`).
- Mantenimiento del estado real de articulaciones en la observación (`--keep-state`), lo que permite desacoplar la rotación virtual de las acciones de la representación del estado.
- No se declaran capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento explícito.
- No se declaran capacidades de generación de texto, código o matemáticas; es un modelo de robótica, no un LLM de propósito general.

## Casos de uso

- Investigación en adaptación de VLAs: sirve como ejemplo reproducible de fusión DART entre un fine-tuning fuente y uno objetivo, con configuración y verificación publicadas, para estudiar cómo se combinan políticas entrenadas en marcos geométricos distintos.
- Recolección de datos con cambio de punto de vista: el checkpoint permite evaluar si una política entrenada con vista amplia y yaw virtual +30° puede desplegarse en el robot real rotando las acciones en el controlador, útil para experimentos de aumento geométrico de datos.
- Tarea de manipulación específica `hang_tape_top`: puede integrarse en un pipeline de control para colgar cinta en una posición superior, siempre que el controlador implemente la rotación de acciones y alimente el estado articular real.
- Estudio de transferencia fuente-objetivo: al provenir de una demostración fuente `demonstration_9` y una objetivo recogida de nuevo, permite analizar la sensibilidad de la fusión al cambio de demostración y de marco.
- Reproducibilidad metodológica: el par `merge_config.json` + `dart_merge_verified.json` (51/51 claves) facilita replicar el procedimiento con otros pares de fine-tunings y verificar la integridad de la fusión.
- Base para ablaciones con α: al fijarse α 0.8 y scope global, el checkpoint sirve como punto de referencia para comparar con otros valores de α o scopes parciales en la misma tarea.
- Docencia y formación en robótica: útil como caso práctico de VLA con normalización original, rotación virtual de acciones y verificación de fusión de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha ejecutado todavía ninguna evaluación en robot ("No robot evaluation has been run yet").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 5,3 GB, lo que da una cota inferior aproximada del espacio de pesos en BF16, pero no se especifica el número de parámetros ni el pico de memoria en inferencia.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? no disponible; sin datos de parámetros ni de memoria pico no puede confirmarse.
- Opciones de despliegue: no disponible; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El modelo se enmarca en el ecosistema openpi/π0.5 y requiere el código de `Donghyun1228/vla_adaptation` y el controlador robótico con la rotación de acciones.
- Latencia y throughput: no disponible.
- Requisito de despliegue documentado: el controlador debe rotar la acción (`Δxyz_real = Rz(+30) Δxyz_virtual`) y alimentar el estado articular real sin cambios.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART `hang_tape_top` (este) | no disponible | no disponible | sin evaluación en robot | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| Base `snumpr-iclr27-v1/9999` | no disponible | no disponible | no disponible | no disponible en la información | checkpoint base del que deriva |
| Fine-tuning fuente `pi05_snumpr_dart_paired_source_hang_tape_top` | no disponible | no disponible | no disponible | no disponible en la información | preset de entrenamiento referenciado |
| Fine-tuning objetivo `pi05_snumpr_dart_paired_target_large_view_yaw30_keepstate_hang_tape_top` | no disponible | no disponible | no disponible | no disponible en la información | preset de entrenamiento referenciado |

No se dispone de datos de benchmarks ni de especificaciones de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sin evaluación en robot: la model card declara explícitamente que no se ha ejecutado ninguna evaluación real, por lo que no hay evidencia de éxito en la tarea.
- Requisito estricto de rotación en el controlador: si el controlador no aplica `Δxyz_real = Rz(+30) Δxyz_virtual`, las acciones serán incorrectas; además debe alimentar el estado articular real sin rotar.
- Normalización original: los `assets` conservan la normalización original (SHA `f549619e…`); alterarla rompe la correspondencia con los pesos fusionados.
- Especificidad extrema: es un checkpoint para una única tarea (`hang_tape_top`) y un único montaje (vista amplia, yaw virtual +30°, demostración objetivo recogida el 2026-10-30); no es reutilizable fuera de ese contexto sin reentrenamiento.
- Trazabilidad de la fusión: se verifican 51/51 claves sin fallback, pero no se documentan métricas de calidad de la fusión más allá de la integridad de claves.
- Sesgos conocidos: no disponible; no se documentan sesgos del dataset de demostraciones.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero sí existe riesgo de acciones fuera de distribución si el entorno difiere del de recolección.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia de la base `snumpr-iclr27-v1/9999` y de los componentes de openpi/π0.5, no detalladas en la información.
- Idiomas: no aplica; no se declaran capacidades lingüísticas.
- Advertencia de producción: al no haber evaluación en robot, no debe desplegarse en producción sin una validación previa en el entorno real.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-hang-tape-top-20261030
- Repositorio DART referenciado: `snumprlab/dart`, commit `1b23c4f42f73168c78a20b353453145e74f64711` (no se proporciona URL directa en la información)
- Código de adaptación: `Donghyun1228/vla_adaptation`, commit `c4fcb61` (no se proporciona URL directa en la información)
- Checkpoint base: `snumpr-iclr27-v1/9999` (no se proporciona URL directa en la información)
- No se han encontrado en la información proporcionada papers, blogs, demos ni otros enlaces adicionales.
