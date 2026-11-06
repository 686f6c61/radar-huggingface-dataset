# jrubiosainz/microduck-tug-h7p1a-fb520907

## Resumen

Microduck Tug of War - h7p1a (identificador fb520907) es una política de control para robótica dentro de la simulación Microduck Arena, publicada por el usuario jrubiosainz. No se trata de un modelo de lenguaje: es un artefacto ONNX de apenas 910.894 bytes que combina una red neuronal de respaldo (fallback) con una tabla de búsqueda de observaciones de 347 filas. El modelo está construido sobre dos bases declaradas: azukiq/microduck-titan-v1 (red de respaldo) y greecree/microduck-tug-of-war-tug-super-v11 (tabla pública de ratings), e incorpora contribuciones de terceros como Unique007 y HlibPlakhtii.

La relevancia de esta ficha es acotada: el propio autor advierte que es un artefacto de simulación y que no debe desplegarse en un robot físico. Su interés está en la ingeniería de procedencia y en la técnica de lookup híbrido con red de fallback, más que en capacidades cognitivas. No hay información sobre licencia propia, idiomas ni parámetros del transformer subyacente.

La ficha se redacta con los datos disponibles en la model card y en los resultados de búsqueda; cualquier especificación ausente se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (artefacto ONNX: red de fallback + tabla de lookup de observaciones) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; la tabla cubre 347 filas de observaciones) |
| Tipos de cuantizacion | No disponible (exportación ONNX de 910.894 bytes) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el autor no añade licencia propia; Apache-2.0 se aplica solo a las partes que la portan) |
| Formato de pesos | ONNX (policy.onnx, SHA256 fb520907bd3373dba49969b5f0894a9a2b976b8e98d766e46f233d5694015b50) |

## Arquitectura y entrenamiento

La política se compone de dos mecanismos acoplados. El primero es una tabla de búsqueda (lookup) de 347 filas que devuelve acciones a partir de los primeros 48 valores de observación, con tolerancia de 1e-7. De esas filas, 331 provienen de la tabla pública de ratings de greecree/microduck-tug-of-war-tug-super-v11 en la revisión fbbb7f48: 12 son la cola del seed 5 del propio greecree (pasos 57 a 68) y 319 pertenecen a Unique007/microduck-tug-dat-v4 en la revisión d8d2c030. Las 16 filas restantes son propias: seed oficial 1, pasos 50 a 65, reoptimizadas con CMA-ES (búsqueda h7_s1a) y replicadas en x86_64.

El segundo mecanismo es una red de fallback basada en azukiq/microduck-titan-v1 (revisión 13b975bb), a la que se exportaron 14 sesgos de actuador mediante el método de HlibPlakhtii, tomado de su modelo cup-v2 (revisión 6051ec95). Cuando la observación no coincide con ninguna fila de la tabla, la red de fallback genera la acción. No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni sobre RLHF o DPO, porque no es un modelo de lenguaje.

## Capacidades

- Control de política para el entorno de simulación Microduck Tug of War (tarea de arrastre tipo tug-of-war).
- Recuperación exacta de acciones por lookup sobre 347 filas de observación (primeros 48 valores, tolerancia 1e-7).
- Generalización de respaldo mediante red neuronal cuando la observación no está tabulada.
- Reproducción determinista en x86_64 mediante el evaluador oficial (runner 5, command_vx -0.3).
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües ni visión/audio.
- No es un modelo de texto: no genera lenguaje ni código.

## Casos de uso

- Replicación de resultados de la arena: ejecutar el evaluador oficial en x86_64 con runner 5 y command_vx -0.3 para reproducir las medias de 168,86 cm y comparar seeds 1 a 5 frente a la tabla pública de v11.
- Auditoría de procedencia: verificar bit a bit las 331 filas heredadas de greecree y Unique007 y las 16 filas propias reoptimizadas con CMA-ES, usando el SHA256 del ONNX como ancla de integridad.
- Estudio de búsqueda de hiperparámetros: reutilizar la búsqueda h7_s1a sobre el seed oficial 1 para explorar configuraciones de CMA-ES y medir su efecto en el paso 50 a 65.
- Benchmark de métodos de sesgo de actuador: comparar los 14 sesgos exportados con el método de HlibPlakhtii (cup-v2) frente a alternativas de calibración en el mismo entorno simulado.
- Docencia y experimentación en robótica simulada: usar el artefacto como ejemplo mínimo de política híbrida lookup + fallback, sin riesgo físico al estar restringido a simulación.
- Integración en pipelines de evaluación de Microduck Arena: cargar el ONNX con la librería microduck y automatizar la replays de seeds para detectar regresiones entre revisiones.

## Benchmarks y rendimiento

Reproducción nativa en x86_64 con el evaluador oficial (runner 5, command_vx -0.3):

| Episodio | Resultado (cm) |
|---|---|
| Seed 1 | 169,0248727798462 |
| Seed 2 | 169,02402639389038 |
| Seed 3 | 168,4127926826477 |
| Seed 4 | 169,39826011657715 |
| Seed 5 | 168,4412121772766 |
| Media | 168,8602328300476 |

Los seeds 2 a 5 igualan los resultados públicos de v11; el seed 1 mejora el valor de v11 de 169,01944279670715. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, porque el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el ONNX ocupa 910.894 bytes, por lo que la huella de memoria es mínima y cabe en cualquier GPU consumer.
- GPU recomendadas: no hay recomendaciones publicadas; por tamaño, cualquier GPU con soporte ONNX Runtime es suficiente (RTX 4090, A100, H100 no son necesarias).
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño del artefacto.
- Opciones de despliegue: librería microduck y ONNX Runtime; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; solo se documenta la replicación en x86_64 con runner 5.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / cobertura | Resultado semilla 1 (cm) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jrubiosainz/microduck-tug-h7p1a-fb520907 | Lookup + fallback ONNX | 347 filas de observación | 169,0248727798462 | No disponible | Hugging Face |
| greecree/microduck-tug-of-war-tug-super-v11 | Lookup público | 331 filas heredadas | 169,01944279670715 | No disponible | Hugging Face |
| azukiq/microduck-titan-v1 | Red de fallback | No disponible | No disponible | No disponible | Hugging Face |
| Unique007/microduck-tug-dat-v4 | Tabla de datos | 319 filas aportadas | No disponible | No disponible | Hugging Face |

## Limitaciones y advertencias

- Solo simulación: el autor prohíbe explícitamente desplegar la política en un robot físico.
- Licencia: no se añade licencia propia; Apache-2.0 (LICENSE-apache-2.0.txt) cubre únicamente las partes que la portan, lo que complica el uso comercial sin revisar el NOTICE.
- Procedencia mixta: 331 de las 347 filas provienen de terceros (greecree y Unique007); cambios en esas revisiones pueden invalidar la reproducibilidad.
- Cobertura limitada: la tabla solo cubre los primeros 48 valores de observación con tolerancia 1e-7; fuera de ese rango depende de la red de fallback, cuyo rendimiento no está documentado.
- Sin datos de sesgo, alucinación o multilingüismo: no aplican a un artefacto de control, pero tampoco se publican evaluaciones de robustez.
- Reproducibilidad sensible al runner: los resultados documentados dependen del evaluador oficial, runner 5 y command_vx -0.3; otras configuraciones no están verificadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-tug-h7p1a-fb520907
- Modelo base titan-v1: https://huggingface.co/azukiq/microduck-titan-v1/tree/13b975bb1a15fbdb4d6bf78170220a91a99aa7a5
- Tabla pública v11: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v11/tree/fbbb7f48bb962acdc9c0bdaf020806344866b175
- Datos de Unique007: https://huggingface.co/Unique007/microduck-tug-dat-v4/tree/d8d2c030ba5cb71cbc2e9e97b8d63521a8f7fc9a
- Método de sesgos cup-v2: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-v2/tree/6051ec95eb2672172939cfc1b597cbe5f3961452
- Modelo relacionado remix9: https://huggingface.co/jrubiosainz/microduck-game-tug-remix9
- Modelo relacionado a1rb4ck: https://huggingface.co/jrubiosainz/microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5
