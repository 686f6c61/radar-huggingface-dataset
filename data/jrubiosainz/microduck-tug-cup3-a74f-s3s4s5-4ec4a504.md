# jrubiosainz/microduck-tug-cup3-a74f-s3s4s5-4ec4a504

## Resumen

Microduck Tug of War cup3-a74f-s3s4s5-4ec4a504 es una política de control para robótica entrenada mediante búsqueda evolutiva nativa y empaquetada en formato ONNX, publicada por el usuario jrubiosainz en Hugging Face. Se enmarca dentro de Microduck Arena, un entorno de simulación de robots Microduck (Pollen Robotics) donde distintas políticas compiten en pruebas de tira y afloja (tug of war). El modelo no es un modelo de lenguaje: es una política de comportamiento que mapea observaciones del robot a acciones de control, con un tamaño de repositorio de 0,0 GB y un artefacto de pesos de 1.003.410 bytes.

El candidato B parte de la política A publicada previamente (`microduck-tug-cup3-a74f-s3s4-1a8b642a`) y aporta una única modificación: una trayectoria semilla 5 (`s5r05`) obtenida mediante búsqueda nativa en `patha-tug-cpu4-20261117T1014Z-4fca`, que sustituye siete pares observación/acción de la tabla heredada. La tabla externa tiene 347 filas distribuidas en orden de semillas 1,2,3,4,5 con rangos globales `[0,66)`, `[66,136)`, `[136,208)`, `[208,278)` y `[278,347)`; de ellas, 340/347 conservan su identidad respecto a A.

La relevancia es acotada y muy específica: se trata de un artefacto de competición en simulación, con evaluación exacta sobre x86_64 y un protocolo de publicación condicionado a revisión y autorización explícita. La model card advierte de forma explícita que es solo para simulación y que no debe cargarse en un robot físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control para robótica empaquetada en ONNX (no disponible el detalle de la red interna) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (artefacto ONNX cuantizado respecto al modelo base según tag `base_model:quantized`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible; la model card indica que Apache-2.0 se aplica solo a los componentes que la llevan y que no se afirma una licencia nueva o global |
| Formato de pesos | ONNX (SHA256 `4ec4a504cd275dacf729a182ed42cbf1bf5eaa61123b6ed1ad38249824f35579`, 1.003.410 bytes) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de la red (capas, dimensión de las observaciones o de las acciones, tipo de normalización). Lo que sí se documenta es el mecanismo de construcción: la política B se compone a partir de la política A mediante una búsqueda evolutiva nativa ejecutada en CPU (`patha-tug-cpu4-20261117T1014Z-4fca`), que produce la trayectoria semilla 5 `s5r05`. Esta trayectoria consta de 69 filas fuente grabadas en x86, procedentes de la política `8fb38e0245dba520c30d4f6a63f9736bae2c5ea8b4566d9591b106fe741fed2e`, y sustituye siete pares observación/acción en las filas locales 62-68 (filas globales 340-346 de B, que reemplazan las filas 270-276 de A).

No se realizó entrenamiento de red neuronal: la model card indica explícitamente "No network training was performed". Las contribuciones `s3r05` y `s4r02` se heredan a través de A y no son búsquedas nuevas de este candidato. El grafo, los metadatos, el fallback, la búsqueda interna y los tensores que no son filas se conservan sin cambios. La ascendencia del fallback se mantiene en `lg21-5400` de lphatnguyen vía `cup2l1/P1/a74f`, y no se añadieron componentes Hlib, adaptadores, overlays, `cup_bias` ni `search2`.

## Capacidades

- Control de un robot Microduck en simulación para la prueba de tira y afloja (tug of war) de Microduck Arena.
- Mapeo de observaciones a acciones mediante una tabla de búsqueda externa de 347 filas en orden de semillas 1,2,3,4,5.
- Comando canónico de velocidad `vx: -0.3` para la evaluación de referencia.
- Ejecución determinista: la evaluación exacta reporta 347/347 aciertos de búsqueda externa y cero fallbacks, aciertos erróneos o valores no finitos en las cinco semillas.
- Compatibilidad con el runner 5 de la Arena bajo el protocolo de evaluación documentado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Competición en Microduck Arena: la política se presenta como entrante de Cup3 y sustituye a A como último candidato elegible, permitiendo medir la mejora de la semilla 5 frente a la tabla heredada.
- Reproducción de resultados de investigación: los artefactos `x86-verdict.json`, `x86-replay-receipt.json` y `rd-exact-diff.json` permiten verificar de forma byte a byte la política B frente al ensamblado offline.
- Auditoría de procedencia de políticas: `table-provenance.json` y `rd-exact-diff.json` documentan la identidad de los 340/347 pares observación/acción conservados y el alcance exacto de los siete pares modificados.
- Estudio de métodos de búsqueda evolutiva en robótica simulada: la política sirve como caso concreto de búsqueda nativa en CPU con evaluación in-sample sobre semillas fijas.
- Evaluación comparativa de entrantes de la Arena: la política puede confrontarse con otros entrantes bajo las mismas condiciones de simulación, aunque la model card no reclama resultados H2H fuera de las semillas de calificación.
- Docencia y divulgación sobre control robótico simulado: el artefacto ONNX de ~1 MB y la documentación de procedencia lo hacen manejable para demostraciones en entornos x86_64.
- Verificación de integridad en pipelines de publicación: los hashes SHA256 de política, wrapper y receipt permiten automatizar comprobaciones de identidad antes de aceptar un candidato.

## Benchmarks y rendimiento

La model card reporta una evaluación exacta sobre x86_64 con el runner 5 y comando `vx: -0.3`, con cinco resultados `pit_won`, 347/347 aciertos de búsqueda externa y cero fallbacks. La métrica es "terreno ganado" en centímetros:

| Semilla | Terreno ganado (cm) |
|---|---:|
| 1 | 169,02586817741394 |
| 2 | 169,06843781471252 |
| 3 | 168,46919655799866 |
| 4 | 169,4170594215393 |
| 5 | 168,53521466255188 |
| Media | 168,90315532684326 (`0x1.51ce6a6000000p+7`) |

Estos resultados corresponden a semillas de calificación fijas e in-sample; la model card aclara que no constituyen una afirmación H2H fuera de semilla. No se han publicado comparaciones con otros entrantes en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto ONNX pesa 1.003.410 bytes y no se documentan requisitos de memoria.
- GPU recomendadas: no disponible; la evaluación documentada se ejecutó en un invitado x86_64, sin mención de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el artefacto está en formato ONNX y la librería declarada es `microduck`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a una política de control).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tug-cup3-a74f-s3s4s5-4ec4a504 (este) | Política de control ONNX para Microduck Arena | no disponible (artefacto de 1.003.410 bytes) | no aplica | no disponible | Hugging Face, 0 descargas |
| jrubiosainz/microduck-tug-cup3-a74f-s3s4-1a8b642a (A) | Política de control ONNX, predecesora directa | no disponible | no aplica | no disponible | Hugging Face |
| 8fb38e0245dba520c30d4f6a63f9736bae2c5ea8b4566d9591b106fe741fed2e | Política fuente de la trayectoria s5r05 | no disponible | no aplica | no disponible | Referenciada por hash en la model card |
| lg21-5400 (lphatnguyen) | Red y búsqueda de la ascendencia del fallback | no disponible | no aplica | no disponible | Referenciada en la model card |

No se dispone de datos de rendimiento comparables entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- Solo simulación: la model card indica explícitamente "Simulation only; do not load this policy on a physical robot".
- Evaluación in-sample: las cinco semillas son fijas y de calificación; no se reclama equivalencia con comandos no vistos ni ausencia universal de regresión.
- Cobertura limitada: la revisión exacta de B y la sombra de entradas guardadas en `rd-exact-diff.json` tienen cobertura finita; la cobertura global de la comprobación de colisiones permanece UNKNOWN/INCOMPLETE.
- Sin resultado H2H contra entrantes Hlib actuales ni victoria de Copa reclamada; solo la Arena decide `copy_of`.
- La evaluación de A es histórica y no certifica B; `native-build.json` y `native-verdict.json` describen la política fuente s5-only, no la B combinada.
- Licencia no disponible: no se afirma ninguna licencia nueva o global; Apache-2.0 se aplica solo a los componentes que la llevan, y la revisión fijada de hc7 no declaraba licencia/NOTICE.
- Persiste una discrepancia de atribución de prefijo público documentada y sin adjudicar.
- Los metadatos ONNX inmutables se heredan; los avisos externos no prueban que se haya satisfecho ninguna obligación de notificación de modificación dentro del archivo.
- Publicar B sustituye a A como último entrante elegible de Cup3 y revela la mejora de s5; no se asume ni se autoriza rollback por reenvío idéntico, retirada o reentrada.
- La aceptación x86 certifica únicamente la evaluación; la publicación requiere un GO exacto de un solo uso sobre el SHA por parte de COORD.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual de modelos de lenguaje; el riesgo relevante es la generalización fuera de las semillas de calificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-tug-cup3-a74f-s3s4s5-4ec4a504
- Modelo base A: https://huggingface.co/jrubiosainz/microduck-tug-cup3-a74f-s3s4-1a8b642a
- Repositorio de Microduck Arena (Pollen Robotics): no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Demos: no disponibles en la información proporcionada
