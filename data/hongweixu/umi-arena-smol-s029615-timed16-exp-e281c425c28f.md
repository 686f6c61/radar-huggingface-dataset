# HongWeiXu/umi-arena-smol-s029615-timed16-exp-e281c425c28f

## Resumen

El modelo `umi-arena-smol-s029615-timed16-exp-e281c425c28f`, publicado por el usuario HongWeiXu en HuggingFace, es una política robótica derivada de SmolVLA (etapa de entrenamiento 29615) que introduce una variante experimental de remuestreo temporal de acciones. No se ha reentrenado: reutiliza los pesos y la normalización del checkpoint `HongWeiXu/umi-arena-smolvla-full-s029615-5e103c24cf45` en la revisión `94fd3a482a622e92c7da1f3139ccad5cc1351e96`. Su única diferencia funcional es la lógica de avance temporal en el momento de la inferencia, que devuelve 16 filas de acción por petición.

La propuesta del autor es un esquema de "time advance" variable: 2.0 durante los primeros 10 segundos de vida de una instancia de `Policy`, decaimiento smoothstep hasta 1.5 entre los segundos 10 y 20, y 1.5 a partir de ahí. El temporizador arranca en la primera inferencia real (excluyendo el warmup del constructor), incluye esperas y no se reinicia con cambios de prompt, reconexiones ni periodos de inactividad. Se acompaña de límites por intervalo de salida de 0.03 m de longitud de trayectoria y 0.15 rad de arco angular por mano, reduciendo el avance temporal si se exceden.

El modelo es relevante como artefacto de investigación sobre control temporal en políticas VLA para manipulación bimanual, no como componente listo para producción. El propio autor declara una regresión de calidad offline aceptada explícitamente y un veredicto de calidad FAIL en la validación, además de advertir que las restricciones son experimentales y no constituyen certificación de seguridad ni garantía de aceleración física.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (política VLA basada en lerobot); detalles internos no disponibles |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo ocupa 1,8 GB) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje general) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | robotics |
| Librería | lerobot |
| Salida por inferencia | 16 filas de acción |
| Avance temporal nativo | 2.0 (0–10 s), smoothstep a 1.5 (10–20 s), 1.5 (>20 s) |
| Límites por intervalo | 0,03 m de trayectoria y 0,15 rad de arco por mano |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de identificarla como SmolVLA dentro del ecosistema lerobot, con pipeline de robótica. No se especifican número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otras fases de alineación. Tampoco se documenta el mecanismo de atención ni innovaciones como decodificación especulativa.

Lo que sí se documenta es que este release no implica reentrenamiento: los pesos y la normalización son idénticos al checkpoint base indicado. La innovación es exclusivamente de inferencia, un remuestreo temporal ("timed action resampling") que ajusta el avance de tiempo solicitado en función de la antigüedad de la instancia de `Policy`, con un decaimiento smoothstep y con acotación de la velocidad efectiva mediante los límites de trayectoria y arco angular por mano. El autor indica explícitamente que no hay extrapolación futura ni padding fijo de seis filas, y que el pronóstico finito puede terminar. También aclara que no existe detector de distancia a objetos ni de fase de manipulación: la tasa se muestrea en la llegada de la petición.

## Capacidades

- Generación de acciones robóticas de manipulación bimanual: devuelve 16 filas de acción por petición, con avance temporal variable según el esquema descrito.
- Control conjunto de ambas manos y pinzas bajo una línea temporal común.
- Acotación cinemática por intervalo de salida: 0,03 m de longitud de trayectoria y 0,15 rad de arco angular por mano, reduciendo el avance temporal cuando se superan.
- Remuestreo temporal adaptativo al tiempo de vida de la instancia de `Policy` (2.0 → 1.5 con decaimiento smoothstep).
- Integración con el stack lerobot para carga y ejecución de políticas.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, multilingüismo, visión general, audio ni modo "thinking".

## Casos de uso

- Investigación sobre control temporal en políticas VLA: permite estudiar cómo afecta un avance temporal variable (2.0 frente a 1.5) a la ejecución de una política ya entrenada sin modificar sus pesos, comparando contra el checkpoint base en la misma revisión.
- Reproducción de experimentos de remuestreo de acciones: el repositorio incluye `experimental_validation.json` con el replay de 48 predicciones nativas (24 episodios, dos semillas) a tasas 2.0, 1.75 y 1.5, útil para replicar el análisis por fases y por mano.
- Evaluación de límites cinemáticos en manipulación bimanual: los topes de 0,03 m y 0,15 rad por intervalo sirven como banco de pruebas para estudiar el compromiso entre velocidad efectiva y suavidad de trayectoria.
- Pruebas de integración con el contenedor oficial de la competición: el autor menciona una comprobación de interfaz en un contenedor oficial separado, lo que permite validar el cumplimiento de la interfaz de envío sin depender de la calidad offline.
- Análisis de robustez temporal en instancias de `Policy` de larga vida: al no reiniciarse el temporizador con cambios de prompt, reconexiones o inactividad, el modelo es adecuado para estudiar el comportamiento del "boost" inicial en sesiones persistentes.
- Docencia y divulgación sobre riesgos de releases experimentales: el caso ilustra un flujo de publicación con regresión de calidad declarada y aceptada, útil como ejemplo de trazabilidad y de límites entre PASS de interfaz y PASS de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí reporta una validación offline propia:

| Prueba | Resultado reportado |
|---|---|
| Replay de datos grabados | 48 predicciones nativas (24 episodios, dos semillas) |
| Tasas comparadas | 2.0, 1.75 y 1.5 |
| Veredicto de calidad | FAIL |
| Datos empleados | cup/smartphone del pool de entrenamiento (no held-out) |
| Evaluación en robot cerrado | no realizada |
| Comprobación de interfaz en contenedor oficial | PASS (no equivale a PASS de calidad ni a éxito de tarea) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 450 millones de parámetros y pesos en safetensors (repo de 1,8 GB), la huella en memoria es moderada, pero no se documentan requisitos oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por tamaño de parámetros sería plausible en GPUs de consumo, pero no hay confirmación del autor.
- Opciones de despliegue: carga mediante la librería lerobot; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política robótica de este tipo).
- Latencia y throughput: no disponibles. El autor advierte que el temporizador interno incluye tiempos de inferencia y esperas, lo que afecta al comportamiento del avance temporal, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| umi-arena-smol-s029615-timed16-exp (este) | 450.046.176 | no disponible | SmolVLA con remuestreo temporal experimental | no disponible | HuggingFace, 0 descargas |
| HongWeiXu/umi-arena-smolvla-full-s029615-5e103c24cf45 | no disponible | no disponible | SmolVLA base, mismos pesos y normalización | no disponible | HuggingFace |
| Otros modelos SmolVLA de lerobot | no disponible | no disponible | Políticas VLA para robótica | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Regresión de calidad offline aceptada: el replay de validación arroja veredicto FAIL, con fallos por fase documentados en `experimental_validation.json`. El autor indica que el usuario aceptó explícitamente esta regresión para publicar la política experimental sin cambios.
- Validación no representativa: el replay usa datos cup/smartphone del pool de entrenamiento, no un conjunto held-out de cinco tareas ni evaluación en bucle cerrado con robot real.
- El PASS de la comprobación de interfaz en el contenedor oficial no equivale a un PASS de calidad offline ni a éxito de tarea.
- Restricciones experimentales, no certificación: los límites de 0,03 m y 0,15 rad por intervalo y el esquema de avance temporal no constituyen certificación de seguridad ni garantía de aceleración física.
- Sin detección de contexto físico: no hay detector de distancia a objetos ni de fase de manipulación; la tasa se muestrea en la llegada de la petición.
- Temporizador no reiniciable: instancias de `Policy` reutilizadas no repiten el "boost" inicial en cada episodio, y el temporizador no se reinicia con cambios de prompt, reconexiones ni inactividad. No es un temporizador de episodio.
- Pronóstico finito: no hay extrapolación futura ni padding fijo de seis filas; la secuencia de acciones puede terminar.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Idiomas no disponibles: al ser un modelo de robótica, las consideraciones multilingües no aplican, pero tampoco se documenta el idioma de las instrucciones de tarea.
- Riesgo de alucinación y sesgos: no documentados por el autor; aplican los del checkpoint base, no especificados.
- El script de publicación no envía el formulario oficial de la competición, por lo que el artefacto no debe tratarse como una entrada validada en ella.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/HongWeiXu/umi-arena-smol-s029615-timed16-exp-e281c425c28f
- Checkpoint base citado: https://huggingface.co/HongWeiXu/umi-arena-smolvla-full-s029615-5e103c24cf45
- Revisión del checkpoint base: 94fd3a482a622e92c7da1f3139ccad5cc1351e96
- Archivo de validación experimental: `experimental_validation.json` (incluido en el repositorio del modelo)
- Lerobot: no se proporciona enlace en la información disponible
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada
