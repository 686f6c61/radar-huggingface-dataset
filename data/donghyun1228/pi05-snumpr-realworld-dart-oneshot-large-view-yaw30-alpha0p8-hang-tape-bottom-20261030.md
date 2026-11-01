# Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-hang-tape-bottom-20261030

## Resumen

π0.5 SNUMPR real-world DART merge es un modelo de visión-lenguaje-acción (VLA) orientado a robótica, derivado de la familia π0.5 de Physical Intelligence y adaptado por el autor Donghyun1228 sobre la base SNUMPR (snumpr-iclr27-v1). El modelo está especializado en una única tarea de manipulación real, `hang_tape_bottom`, y se distribuye como un checkpoint de inferencia para control robótico, no como un modelo de lenguaje general.

La construcción sigue la receta oficial de DART (Domain Arithmetic) del repositorio `snumprlab/dart`, aplicada por tarea y en modo one-shot: se parte de la base, se entrenan dos ajustes finos supervisados (uno sobre la demostración fuente con yaw 0 y otro sobre una demostración de vista amplia con yaw virtual +30°) y se combinan mediante aritmética de dominios con α = 0.8. El resultado es un único conjunto de pesos BF16 de aproximadamente 5,3 GB en el repositorio.

Su relevancia es acotada pero técnicamente interesante: documenta un flujo reproducible de adaptación de dominio geométrico (cambio de punto de vista y de orientación de la base) en políticas VLA, con verificación hoja por hoja del merge (51/51 claves) y sin evaluación en robot publicada. Es material de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en π0.5 / openpi; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | BF16 (`params`) junto con `assets` de normalizacion original; no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura π0.5 en su implementación openpi, es decir, una política VLA que combina un backbone de visión-lenguaje con una cabeza de acciones. La model card no detalla el número de parámetros, la composición del dataset multimodal ni el esquema exacto de atención; solo se especifica la base (`snumpr-iclr27-v1/9999`) y la normalización original conservada en `assets` (SHA `f549619e…`).

El entrenamiento consiste en dos ajustes finos de imitación (IL only), cada uno sobre una única demostración one-shot de la tarea `hang_tape_bottom`: el preset fuente con yaw 0 y el preset objetivo con vista amplia y yaw virtual +30°. Ambos usan 1.000 updates, batch 64, LR constante 5e-5, sin warmup, sin EMA y con todos los pesos entrenables (código `Donghyun1228/vla_adaptation`, commit `248126e`). El merge se realiza con `domain_arithmetic.dart` del repositorio `snumprlab/dart` (commit `1b23c4f…`), α 0.8, scope all, seed 42, en CPU, y se verifica con `dart_merge_verified.json` (51/51 claves, sin fallback). No se menciona RLHF, DPO ni decodificación especulativa.

## Capacidades

- Control robótico de manipulación para la tarea concreta `hang_tape_bottom` (colocación de cinta en la parte inferior).
- Ejecución de políticas VLA a partir de observaciones visuales y estado del robot, con normalización original preservada.
- Adaptación a variaciones de punto de vista (vista amplia) y de orientación de base (yaw +30°) mediante aritmética de dominios.
- Aprendizaje one-shot: capacidad de especializarse en una tarea a partir de una sola demostración por dominio.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo.
- No se documentan modos de pensamiento, visión general, audio ni otras modalidades fuera del bucle percepción-acción robótico.

## Casos de uso

- Investigación en adaptación de dominio geométrico: usar el checkpoint como referencia reproducible para estudiar cómo el merge DART con α 0.8 transfiere una política entre vistas y orientaciones de base distintas.
- Reproducción de la receta one-shot: servir de ejemplo verificable (51/51 claves) para validar implementaciones propias de `domain_arithmetic.dart` sobre políticas π0.5.
- Experimentos de manipulación con cinta en entornos de laboratorio: desplegar la política en el mismo montaje de la tarea `hang_tape_bottom` para medir la brecha entre merge y evaluación real, dado que no hay evaluación publicada.
- Base para ajuste fino posterior: partir de estos pesos BF16 y continuar el entrenamiento con demostraciones adicionales de la misma tarea para mejorar robustez.
- Estudio de calibración de transformaciones virtuales: el modelo exige aplicar en el controlador la transformación inversa de yaw (`Δxyz_real = Rz(+30) Δxyz_virtual`, estado `q0_real - 30°`), lo que lo convierte en un banco de pruebas para pipelines de control con cambios de marco.
- Comparación de estrategias de fusión de pesos: contrastar el resultado del merge DART con el de los checkpoints fuente y objetivo por separado en el mismo entorno simulado o real.
- Docencia y divulgación sobre VLA: ilustrar un flujo completo de base, ajuste fino por dominio, fusión y verificación estructural en un caso acotado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación en robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 5,3 GB y los pesos se distribuyen en BF16, por lo que se requiere al menos ese orden de magnitud de memoria, más el overhead del runtime de openpi y del backbone de visión.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del checkpoint, se presume viabilidad en GPUs con 8-16 GB o más, pero no está confirmado.
- Compatibilidad con GPU de consumo: no confirmada; no se indica qué modelos concretos (RTX 4090, etc.) se han probado.
- Opciones de despliegue: el ecosistema declarado es openpi (tags `pi05`, `openpi`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de acciones.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART (este) | no disponible | no disponible | `hang_tape_bottom`, one-shot, yaw +30° | Apache 2.0 | HuggingFace, 0 descargas |
| Base `snumpr-iclr27-v1/9999` | no disponible | no disponible | VLA general SNUMPR | no disponible en esta ficha | Referenciado como base |
| Checkpoint fuente (yaw 0) | no disponible | no disponible | `hang_tape_bottom`, vista original | no disponible en esta ficha | Referenciado como preset |
| Checkpoint objetivo (vista amplia, yaw +30°) | no disponible | no disponible | `hang_tape_bottom`, vista amplia | no disponible en esta ficha | Referenciado como preset |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación es estructural (misma base, distinto dominio de entrenamiento y fusión).

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una sola tarea (`hang_tape_bottom`) y no generaliza a otras tareas sin nuevo ajuste.
- Sin evaluación en robot: la model card afirma que no se ha ejecutado ninguna prueba real, por lo que el rendimiento en el mundo físico es desconocido.
- Dependencia de transformación externa: el controlador debe aplicar la transformación inversa de yaw virtual (`Δxyz_real = Rz(+30) Δxyz_virtual`, estado `q0_real - 30°`); omitirla invalida las acciones.
- Entrenamiento con una única demostración por dominio: alta varianza y riesgo de sobreajuste a condiciones de iluminación, posiciones y objetos de esa demostración.
- Sin datos de sesgos, alucinación o cobertura lingüística; no aplica el análisis habitual de LLM, pero tampoco hay garantías de robustez ante cambios de escena.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación y de soporte hace desaconsejable su uso en producción sin evaluación propia.
- Repositorio con 0 descargas y 0 likes: sin comunidad que valide los resultados; el commit y la semilla están fijados, lo que facilita la reproducción pero no la validación independiente.
- Los archivos `merge_config.json` y `dart_merge_verified.json` son registros del propio autor; la verificación hoja por hoja no equivale a una validación funcional.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-hang-tape-bottom-20261030
- Repositorio DART referenciado: `snumprlab/dart`, commit `1b23c4f42f73168c78a20b353453145e74f64711`
- Código de adaptación: `Donghyun1228/vla_adaptation`, commit `248126e`
- Base: `snumpr-iclr27-v1/9999`
- Ecosistema openpi (referenciado por los tags del modelo)
