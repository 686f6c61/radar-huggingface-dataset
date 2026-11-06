# Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-20261030

## Resumen

π0.5 SNUMPR real-world DART merge (large view + yaw30, α = 0.8) es un checkpoint de robótica derivado del modelo visión-lenguaje-acción (VLA) π0.5, publicado por el usuario Donghyun1228 en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo de lenguaje general, sino de un artefacto de investigación para control robótico: un merge de pesos por aritmética de dominios (DART) entre un modelo fuente afinado y un modelo objetivo afinado, partiendo de la base SNUMPR VLA. El repositorio ocupa 5,3 GB y contiene pesos en BF16 junto con los assets de normalización originales.

El interés técnico reside en el método de combinación: se aplica `domain_arithmetic.dart` del repositorio `snumprlab/dart` (commit `1b23c4f4`) con α = 0.8, alcance "all" y semilla 42, ejecutado en CPU. El resultado se verificó hoja por hoja con `scripts/verify_dart_merge.py`, cubriendo 51 de 51 claves sin recurrir a fallback. El checkpoint incorpora además una transformación virtual de yaw de +30 grados que el controlador del robot debe invertir en tiempo de ejecución.

Es relevante como ejemplo reproducible de composición de políticas VLA y de gestión de transformaciones de marco de referencia en robótica real. Sin embargo, el propio autor advierte de que no se ha ejecutado ninguna evaluación sobre robot, por lo que su utilidad práctica está por validar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA π0.5 (openpi); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 en los pesos publicados; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` (BF16) y `assets` (normalización original) |
| Tamaño del repositorio | 5,3 GB |
| Pipeline declarado | robotics |
| Commit DART de referencia | `1b23c4f42f73168c78a20b353453145e74f64711` |
| Hiperparámetros del merge | α = 0.8, scope all, seed 42, CPU |
| Verificación del merge | 51/51 claves, sin fallback |
| SHA de assets | `f549619e…` |

## Arquitectura y entrenamiento

El modelo es un checkpoint π0.5, la familia de políticas visión-lenguaje-acción de openpi, que combina un backbone de lenguaje y visión con una cabeza de acciones para control robótico. La información disponible no detalla el número de parámetros, la composición del dataset ni si hubo etapas de RLHF o DPO; estos datos deben consultarse en la documentación de openpi y de π0.5.

El proceso de construcción es un merge por aritmética de dominios. Se parte de la base `snumpr-iclr27-v1/9999` (SNUMPR VLA inicial con normalización original), y se combinan el modelo fuente `pi05-snumpr-realworld-dart-oneshot-source-ft-1000-20261030` (step 999) y el modelo objetivo `pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-ft-1000-20261030` (step 999). La herramienta `domain_arithmetic.dart` aplica la combinación con α = 0.8 sobre todas las capas. El repositorio incluye `merge_config.json` como registro del merger y `dart_merge_verified.json` como acta de la verificación hoja por hoja.

La innovación operativa destacable es la transformación virtual de yaw: los pesos se entrenaron en un marco con yaw de +30 grados, de modo que el controlador debe aplicar la inversa `Δxyz_real = Rz(+30) Δxyz_virtual` y ajustar el estado como `q0_real - 30°`. Omitir esta corrección invalida las acciones generadas.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales y estado del robot (política VLA).
- Control de manipuladores en entornos reales, condicionado a instrucciones en lenguaje natural según el paradigma π0.5.
- Composición de comportamientos mediante aritmética de dominios: el merge busca transferir la habilidad del modelo objetivo (vista amplia, yaw30) sobre la base SNUMPR.
- Integración con el ecosistema openpi para carga de pesos y ejecución de políticas.
- Transformación de marco de referencia documentada (yaw virtual de +30 grados) para su aplicación en el controlador.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking; el alcance es exclusivamente robótico.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en composición de políticas VLA: el checkpoint sirve como referencia reproducible del merge DART con α = 0.8, permitiendo a otros grupos replicar el procedimiento sobre sus propios pares fuente/objetivo y comparar el resultado hoja por hoja con `verify_dart_merge.py`.
- Manipulación con vista de cámara amplia: el modelo objetivo incorpora una configuración de "large view", adecuada para tareas donde el robot necesita razonar sobre un campo visual más amplio que en la configuración base.
- Despliegue en robots con montaje de cámara rotado 30 grados: el checkpoint está pensado para setups cuyo marco virtual requiere la corrección de yaw documentada, evitando reentrenar desde cero.
- Transferencia de habilidad entre dominios: el merge permite inyectar el comportamiento del modelo objetivo en la base SNUMPR sin un fine-tuning completo, reduciendo coste de cómputo en la experimentación.
- Validación de pipelines de control: útil para probar la cadena completa (carga de pesos BF16, aplicación de normalización original, corrección de yaw, envío de acciones) antes de invertir en entrenamiento adicional.
- Estudio de robustez de merges: al no haberse evaluado en robot, es un caso de estudio sobre la brecha entre verificación estática del merge (51/51 claves) y rendimiento real en tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación sobre robot.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 5,3 GB en BF16, por lo que se requiere al menos ese orden de memoria para cargar los pesos completos; el consumo real depende del backbone y de los buffers de inferencia, no disponibles.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de checkpoint, una GPU con 16-24 GB de VRAM (RTX 4090, A100 40 GB, H100) sería el punto de partida razonable, pero no está confirmado por el autor.
- Compatibilidad con GPU de consumo: probable en tarjetas con VRAM suficiente para 5,3 GB de pesos más overhead, aunque no verificado.
- Opciones de despliegue: el ecosistema declarado es openpi; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de acciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| π0.5 SNUMPR real-world DART merge (este) | VLA π0.5, merge DART | no disponible | no disponible | Apache 2.0 | Sin evaluación en robot |
| `snumpr-iclr27-v1/9999` (base) | VLA SNUMPR | no disponible | no disponible | no disponible | Base de partida |
| `pi05-snumpr-realworld-dart-oneshot-source-ft-1000-20261030` | VLA π0.5 afinado (fuente) | no disponible | no disponible | no disponible | Step 999 |
| `pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-ft-1000-20261030` | VLA π0.5 afinado (objetivo) | no disponible | no disponible | no disponible | Step 999 |

No se dispone de datos de rendimiento comparativo entre estos checkpoints; la comparación se limita a su rol en el pipeline de merge.

## Limitaciones y advertencias

- No se ha ejecutado ninguna evaluación sobre robot: el rendimiento real en tarea es desconocido.
- La verificación del merge es estática (51/51 claves, sin fallback); no garantiza calidad funcional de las acciones generadas.
- El controlador debe aplicar obligatoriamente la transformación inversa de yaw (`Δxyz_real = Rz(+30) Δxyz_virtual`, `q0_real - 30°`); ignorarla produce acciones incoherentes.
- Los pesos están en BF16 y dependen de los assets de normalización originales (SHA `f549619e…`); mezclar normalizaciones distintas invalida el resultado.
- Riesgo de alucinación y sesgos: no documentados para este checkpoint; aplican los del backbone π0.5 subyacente, no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin validación, su uso en producción conlleva riesgo no cuantificado.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes, y no consta documentación externa ni paper asociado a este merge concreto.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-20261030
- Modelo base: `snumpr-iclr27-v1/9999` (referenciado en la model card, sin URL directa disponible)
- Modelo fuente: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-source-ft-1000-20261030
- Modelo objetivo: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-ft-1000-20261030
- Repositorio DART: `snumprlab/dart`, commit `1b23c4f42f73168c78a20b353453145e74f64711` (sin URL directa disponible)
- Script de verificación: `scripts/verify_dart_merge.py` (incluido en el repositorio DART)
- openpi: no disponible en la información proporcionada
