# jrubiosainz/microduck-sock-nov18-podium-a-e669fcf7

## Resumen

microduck-sock-nov18-podium-a-e669fcf7 es una política de control para robótica simulada publicada por el usuario jrubiosainz en Hugging Face. Se distribuye en formato ONNX bajo la etiqueta `microduck-policy` y está asociada al pipeline de robótica de la plataforma. El modelo no es un modelo de lenguaje ni un transformer generativo: es una política de agente entrenada para una tarea concreta de locomoción/carrera dentro de un entorno de simulación denominado "Sock Heist", con composición de trayectorias de varios participantes (Quicksilver v4, GinDuck, rumezhak v11 y trayectorias C2 preservadas).

La model card describe un resultado de replay local en un invitado x86 con el runner v5 a 0,2 m/s: cinco terminaciones con vector `[4.635, 5.090, 4.670, 4.680, 4.790]` segundos y media de 4,773 s. El autor indica explícitamente que este resultado no es un resultado oficial del servidor de Arena hasta que se complete la ejecución enviada, y que la tarjeta no reclama generalización a hardware real.

La relevancia de esta ficha es limitada y debe enmarcarse con precisión: se trata de un artefacto de competición en simulación, sin licencia declarada, sin idiomas declarados, sin benchmarks estándar y con un tamaño de repositorio de 0,0 GB. Es útil como ejemplo de política ONNX para robótica simulada y de prácticas de procedencia (archivos `provenance-*`, `NOTICE`, `x86-replay-receipt.json`), pero no debe confundirse con un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control para robótica simulada, empaquetada en ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la política. La model card no describe capas, tipo de red (MLP, CNN, transformer de política, etc.), número de parámetros ni función de pérdida. El artefacto se distribuye como modelo ONNX destinado al pipeline de robótica, lo que sugiere una política de inferencia de acción (action policy) consumible por un runtime ONNX, pero no se confirma el esquema de observaciones ni de acciones.

Respecto al entrenamiento, la tarjeta menciona una "composición de podio" que combina el segundo arranque de Quicksilver v4 (procedente del overlay v5), el tercer arranque de GinDuck, el quinto arranque de rumezhak v11 y las trayectorias C2 previamente preservadas para los arranques 1 y 4. También indica que la red de respaldo (fallback network) y la regla de búsqueda por observación física son idénticas a C2. No se especifican tokens de entrenamiento, composición del dataset, ni uso de RLHF/DPO; estos conceptos no aplican de forma directa a una política de control de este tipo. La innovación técnica documentada es la composición de trayectorias entre participantes y la verificación byte a byte de los arrays de acciones y claves de observación enmascaradas durante el replay local.

## Capacidades

- Control de agente en simulación para la tarea "Sock Heist" con el runner v5 a 0,2 m/s.
- Composición de trayectorias procedentes de varios participantes (Quicksilver v4, GinDuck, rumezhak v11) y de trayectorias C2 preservadas.
- Ejecución determinista verificable: los cinco arrays de acciones y de claves de observación enmascaradas coincidieron byte a byte con los registros esperados en el replay x86.
- Inferencia vía ONNX, apta para integrarse en runtimes compatibles con este formato.
- Red de respaldo (fallback network) y regla de búsqueda por observación física heredadas de C2.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes multi-paso ni multilingüismo.

## Casos de uso

- Replay de validación en simulación: ejecutar la política en un invitado x86 con el runner v5 a 0,2 m/s para reproducir el vector de terminaciones `[4.635, 5.090, 4.670, 4.680, 4.790]` s y comprobar la coincidencia byte a byte de acciones y observaciones enmascaradas.
- Auditoría de procedencia: usar los archivos `NOTICE` y `provenance-*` para rastrear las contribuciones de Quicksilver v4, GinDuck y rumezhak v11 en la composición del podio.
- Integración en pipelines de robótica simulada basados en ONNX: cargar el artefacto en un runtime ONNX y evaluar la política dentro del entorno "Sock Heist" con el runner v5.
- Comparación de composiciones de trayectorias: contrastar esta composición de podio con las trayectorias C2 originales para estudiar el efecto de sustituir arranques individuales.
- Verificación de reglas de respaldo: probar la red de respaldo y la regla de búsqueda por observación física heredadas de C2 en escenarios de simulación controlados.
- Docencia o experimentación sobre políticas de competición: emplear el artefacto como ejemplo de empaquetado ONNX y de prácticas de reproducibilidad (receipts, copy-screen) en robótica simulada.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Terminaciones (s) | `[4.635, 5.090, 4.670, 4.680, 4.790]` | Replay x86, runner v5, 0,2 m/s |
| Media (s) | 4,773 | Media de las cinco terminaciones |
| Predicción previa (s) | 4,773 | Predicción del runner v5 a 0,2 m/s |
| Coincidencia byte a byte | 5/5 | Arrays de acciones y claves de observación enmascaradas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica que el resultado local no es un resultado oficial del servidor de Arena hasta que se complete la ejecución enviada, y que el estado global de copia permanece como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repositorio es de 0,0 GB y no se publican parámetros).
- GPU recomendadas: no disponibles; el autor solo documenta un replay en un invitado x86, sin especificar acelerador.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime ONNX (formato de pesos declarado); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; únicamente se reportan tiempos de terminación de la tarea en simulación (media 4,773 s).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sock-nov18-podium-a-e669fcf7 | Política ONNX para robótica simulada | no disponible | no disponible | no disponible | Hugging Face (0 descargas, 0 likes) |
| Quicksilver v4 (referenciado en la model card) | Componente de política en simulación | no disponible | no disponible | no disponible | no disponible como artefacto independiente en la información proporcionada |
| GinDuck (referenciado en la model card) | Componente de política en simulación | no disponible | no disponible | no disponible | no disponible como artefacto independiente en la información proporcionada |
| rumezhak v11 (referenciado en la model card) | Componente de política en simulación | no disponible | no disponible | no disponible | no disponible como artefacto independiente en la información proporcionada |

No se dispone de datos de rendimiento, parámetros ni licencia de las alternativas citadas, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- La model card declara explícitamente que no se reclama generalización a hardware real; el artefacto está orientado a simulación.
- El resultado de 4,773 s es un replay local en x86 y no un resultado oficial del servidor de Arena hasta que se complete la ejecución enviada.
- El estado global de copia permanece como UNKNOWN; la pantalla de copia pública no encontró coincidencias reportadas, pero `copy_of`, la colocación y los puntos los determina el servidor oficial.
- No se declara licencia, lo que impide evaluar restricciones de uso comercial.
- No se declaran idiomas soportados.
- No se publican parámetros, arquitectura interna, datos de entrenamiento ni benchmarks estándar.
- No se afirma seguridad para hardware físico ("No blanket upstream licence or hardware safety is asserted").
- Riesgo de sesgos y de alucinación: no aplica en el sentido de un modelo de lenguaje; no obstante, no se documentan evaluaciones de robustez frente a distribuciones de observación distintas de las del replay.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/jrubiosainz/microduck-sock-nov18-podium-a-e669fcf7
- Archivos referenciados en la model card (no enlazados directamente): `NOTICE`, `provenance-*`, `x86-replay-receipt.json`, `copy-screen.json`
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
