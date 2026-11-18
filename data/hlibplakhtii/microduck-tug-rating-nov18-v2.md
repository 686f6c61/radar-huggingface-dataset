# HlibPlakhtii/microduck-tug-rating-nov18-v2

## Resumen

Microduck Tug Rating v2 (publicado internamente como "Quicksilver Tug Rating v2") es una política de control para robótica dentro del entorno de simulación de competición Microduck, especializada en la prueba de tira y afloja (tug of war). Lo desarrolla HlibPlakhtii como una entrada de competición: no es un modelo de lenguaje, sino una política entrenada para controlar articulaciones de un robot bípedo o cuadrúpedo simulado y ganar combates de tracción contra un pato de referencia.

El modelo es un merge de dos políticas previas: la trayectoria general del controlador v8 de Quicksilver Rating v1 y las trayectorias de recuperación publicadas por jrubiosainz (recovery-d). La contribución de esta versión es una búsqueda local que ajusta los objetivos articulares al final de los combates en determinados inicios, lo que se traduce en una puntuación de 168,90445948 cm en la evaluación regular de la Arena sobre cinco victorias por caída.

Es relevante en el nicho de robótica simulada y aprendizaje por refuerzo aplicado a competiciones, donde las políticas se publican como artefactos ONNX reproducibles con verificación local por combate. La información disponible es muy limitada: no hay datos de arquitectura de red, número de parámetros, contexto ni idiomas, porque el artefacto es una política de control y no un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control para robótica, empaquetada en ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (librería `microduck`, tag `onnx`) |

## Arquitectura y entrenamiento

La información disponible no describe la topología de la red neuronal de la política. Se sabe que el artefacto se distribuye en formato ONNX y que se ejecuta dentro del entorno Arena v5 mediante la librería `microduck`. La política se compone por merge de dos fuentes: el controlador general v8 de Quicksilver Rating v1 y las trayectorias de recuperación de jrubiosainz (recovery-d). El proceso de construcción se documenta en el script `build_tug_rating_replays.py`, que reproduce cada combate puntuado y verifica ambos robots y la cuerda desde el reinicio hasta el final.

El ajuste específico de esta versión consiste en una búsqueda local sobre los objetivos articulares cerca del final de los combates, aplicada en el inicio 5 y tomando como punto de partida las trayectorias publicadas de recovery-d. Los inicios 1 y 2 conservan las trayectorias previas de Quicksilver Rating; los inicios 3 y 4 reproducen las trayectorias de recovery-d. Las políticas fuente y las selecciones por inicio quedan registradas en `source.json`, y las puntuaciones por inicio en `local-verification.json`. No se dispone de datos sobre volumen de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Control motor para la prueba de tira y afloja en el entorno Microduck Arena v5.
- Ejecución de trayectorias articulares pregrabadas y ajustadas por búsqueda local al final del combate.
- Reproducibilidad por combate: el script de construcción replica cada enfrentamiento puntuado y valida robots y cuerda.
- Selección de política por inicio de combate (configuraciones distintas para los inicios 1 a 5).
- Empaquetado ONNX para inferencia dentro del simulador.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües, por no ser un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Competición en Microduck Arena: la política se carga como participante en la prueba de tug of war y compite contra el pato de referencia, aprovechando las trayectorias ajustadas para maximizar centímetros de tracción.
- Reproducción de resultados de competición: un investigador puede ejecutar `build_tug_rating_replays.py` con el controlador genérico indicado en `source.json` para verificar la puntuación de 168,90445948 cm y auditar cada combate.
- Estudio de merges de políticas: sirve como caso práctico de combinación de dos políticas (controlador general v8 y recovery-d) con selección por inicio, útil para analizar cómo el ajuste local al final del combate afecta al resultado agregado.
- Benchmark de entornos simulados: permite comparar el rendimiento de políticas de recuperación frente a controladores generales en condiciones de tracción sostenida.
- Base para búsqueda local adicional: el pipeline documentado (descarga del controlador genérico, ejecución del script de construcción, verificación local) se puede reutilizar para probar variantes de objetivos articulares en otros inicios.
- Docencia en robótica simulada: el par de archivos `source.json` y `local-verification.json` ofrece un ejemplo trazable de procedencia de políticas y validación por episodio.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Puntuación Arena (evaluador regular de rating) | 168,90445948 cm |
| Condición de la puntuación | 5 victorias por caída (pit wins) contra el pato de referencia |

No se han publicado resultados de benchmarks adicionales (tipo MMLU, HumanEval o GSM8K) en la información disponible, ya que el artefacto no es un modelo de lenguaje. Tampoco se aportan métricas de latencia, throughput ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,0 GB según Hugging Face, lo que sugiere un artefacto ONNX de tamaño reducido, pero no se confirma la cifra exacta.
- GPU recomendadas: no disponible. Al ser una política de control para simulación, la carga principal recae en el simulador Arena v5, no en la inferencia de la red.
- Compatibilidad con GPU de consumo: no disponible; no se especifican requisitos mínimos.
- Opciones de despliegue: entorno Arena v5 con la librería `microduck` y ejecución del script `build_tug_rating_replays.py`; el controlador genérico se descarga desde la URL fijada en `source.json`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Puntuación Arena | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HlibPlakhtii/microduck-tug-rating-nov18-v2 | Política de control (merge) | 168,90445948 cm | ONNX | no disponible | Hugging Face |
| HlibPlakhtii/microduck-tug-rating-nov18-v1 | Política de control (base) | no disponible | ONNX | no disponible | Hugging Face |
| jrubiosainz/microduck-tug-cup3-recovery-d-e983bfd4 | Política de recuperación (base) | no disponible | ONNX | no disponible | Hugging Face |

No se dispone de datos de rendimiento de las políticas base en la información proporcionada, por lo que la comparación numérica se limita a la puntuación declarada de esta versión.

## Limitaciones y advertencias

- Específica del entorno Microduck Arena v5 y de la prueba de tug of war; no es transferible a otras tareas de robótica sin reentrenamiento o ajuste.
- Depende de un controlador genérico externo fijado en `source.json`; si ese artefacto no está disponible o cambia, la reconstrucción falla.
- La puntuación de 168,90445948 cm procede del evaluador regular de la Arena y de una verificación local, no de una validación independiente por terceros.
- No hay información sobre sesgos, alucinación ni comportamiento fuera de distribución; en robótica simulada el riesgo equivalente es la fragilidad ante condiciones no vistas.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución de los pesos.
- El repositorio muestra 0 descargas y 0 likes, y un tamaño de 0,0 GB, lo que indica un artefacto de nicho con escasa validación comunitaria.
- Los créditos incluyen a HlibPlakhtii, jrubiosainz, lphatnguyen, suraj-phanindra, greecree, Unique007, rumezhak, a1rb4Ck/juicenv y Pollen Robotics; los términos de las tarjetas upstream pueden imponer condiciones adicionales no reflejadas aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-tug-rating-nov18-v2
- Quicksilver Rating v1 (commit fijado): https://huggingface.co/HlibPlakhtii/microduck-tug-rating-nov18-v1/tree/82eb3d22decb9d970267a05fbc8a515260f1cd4e
- jrubiosainz recovery-d (commit fijado): https://huggingface.co/jrubiosainz/microduck-tug-cup3-recovery-d-e983bfd4/tree/5f2951132766340e4267dfbc514536c7975af0a0
