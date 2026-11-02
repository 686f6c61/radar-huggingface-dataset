# jrubiosainz/microduck-sock-heist-6m-copy-lphatnguyen-09867b98

## Resumen

`microduck-sock-heist-6m-copy-lphatnguyen-09867b98` es una republicación sin modificaciones de la política de control `policy.onnx` desarrollada por el usuario lphatnguyen para el robot cuadrúpedo microduck de Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es una política de refuerzo (reinforcement learning) que produce comandos motores a 50 Hz a partir de observaciones de 61 dimensiones y emite 14 acciones de control. El artefacto pesa 1.167.112 bytes (aproximadamente 1,1 MB) y se distribuye en formato ONNX.

El modelo participó en la competición Microduck Arena, prueba "6 m Sock Heist", con una puntuación oficial de 4,987 sobre 5 semillas (s1 4,86; s2 5,29; s3 4,87; s4 4,92; s5 4,995), usando el runner v5 y una velocidad comandada de 1. La relevancia de esta ficha es acotada: documenta un artefacto de robótica de competición de tamaño mínimo, útil para quien quiera reproducir el comportamiento en el robot físico o analizar la política, no para tareas de NLP, visión o razonamiento.

El repositorio actual lo publica jrubiosainz, que declara explícitamente no haber entrenado, ajustado ni editado la política; solo la reinscribe en la Arena bajo su cuenta. El autor original no declara licencia, y esta copia tampoco relicencia el contenido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control por reinforcement learning exportada a ONNX (no se detalla la topología de red en la información disponible) |
| Parámetros totales | no disponible (el artefacto ONNX pesa 1.167.112 bytes) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso, control a 50 Hz |
| Tipos de cuantizacion | no disponible (se distribuye un único `policy.onnx`) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible; el repositorio original no declara licencia y esta copia no relicencia |
| Formato de pesos | ONNX (`policy.onnx`), con normalizador de observaciones embebido; incluye `manifest.json` conforme al esquema 2 del manifiesto de políticas microduck |

## Arquitectura y entrenamiento

La información disponible no describe la topología interna de la red (número de capas, tipo de capas, función de activación ni tamaño de las mismas). Lo que sí se documenta es la interfaz: la política consume observaciones crudas de 61 dimensiones, con el normalizador de observaciones embebido en el propio `policy.onnx`, y emite 14 acciones a 50 Hz. Es una política "perpetua": se ejecuta de forma continua hasta que se le indica lo contrario, y está asociada al slot `walk` del robot microduck.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `sock-heist-training`, commit `a9189869a`, según declara la model card original. No se especifican en la información proporcionada el número de pasos de entrenamiento, la composición del entorno, los hiperparámetros de RL, ni si se emplearon técnicas como domain randomization, reward shaping o curricula. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.), lo cual es coherente con el tipo de artefacto.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck: genera comandos motores continuos a 50 Hz para el slot de marcha `walk`.
- Política perpetua: mantiene la marcha de forma indefinida hasta recibir una orden de parada o sustitución.
- Consumo de observaciones crudas de 61 dimensiones con normalización interna, sin necesidad de preprocesado externo por parte del usuario.
- Emisión de 14 acciones de control por paso.
- Despliegue directo en el robot mediante el comando `robotctl policy load walk <repo>`.
- Ejecución en la Microduck Arena con runner v5 a velocidad comandada 1.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento. Es exclusivamente una política motora.

## Casos de uso

- Reproducción en robot físico: cargar la política con `sudo robotctl policy load walk lphatnguyen/microduck-sock-heist-6m-v4` en un microduck real para obtener la marcha evaluada en la Arena, con el normalizador ya embebido y sin preprocesado adicional.
- Evaluación comparativa en la Microduck Arena: inscribir esta copia en la competición para contrastar el resultado oficial (4,987) con el de la entrada original, ya que los bytes, el evento, las semillas y la velocidad comandada son idénticos.
- Análisis de políticas de RL para robótica de bajo coste: inspeccionar el grafo ONNX de 1,1 MB para estudiar cómo una red de tamaño mínimo resuelve una tarea de locomoción, útil en docencia o investigación exploratoria.
- Referencia de linaje y trazabilidad: usar el `manifest.json` (esquema 2) y el hash sha256 `7a2367d9…9e3edd` para verificar la integridad del artefacto en pipelines de validación de modelos.
- Base para experimentos de destilación o compresión: al ser un ONNX pequeño con interfaz bien definida (61→14), sirve como punto de partida para probar cuantización o poda y medir el impacto en la puntuación de la Arena.
- Integración en simuladores compatibles con ONNX Runtime: ejecutar la política en un entorno simulado del microduck para pruebas de estrés de la marcha antes de desplegarla en hardware.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los de la Microduck Arena, prueba "6 m Sock Heist", con runner v5 y velocidad comandada 1:

| Semilla | Puntuación |
|---|---|
| s1 | 4,86 |
| s2 | 5,29 |
| s3 | 4,87 |
| s4 | 4,92 |
| s5 | 4,995 |
| Media oficial | 4,987 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no serían aplicables a este tipo de artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el artefacto ONNX ocupa 1.167.112 bytes, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con soporte de ONNX Runtime es suficiente. El cuello de botella real es la latencia de control a 50 Hz, no la memoria.
- Cabe en GPU consumer: sí, en cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.), y previsiblemente también en CPU y en hardware embebido del propio robot.
- Opciones de despliegue: ONNX Runtime, el daemon `robotctl` del microduck y el runner de la Microduck Arena (v5). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el requisito funcional es sostener 50 Hz de control.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto / interfaz | Puntuación Arena | Licencia |
|---|---|---|---|---|---|
| microduck-sock-heist-6m-copy-lphatnguyen-09867b98 (esta ficha) | Política RL ONNX | 1.167.112 bytes | 61 obs → 14 acciones a 50 Hz | 4,987 (media de 5 semillas) | no disponible |
| lphatnguyen/microduck-sock-heist-6m-v4 | Política RL ONNX | idéntico (mismos bytes) | idéntica | idéntica (origen del resultado) | no declarada |
| Otras políticas del slot `walk` de la Microduck Arena | Políticas RL | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es con el repositorio original, del que esta copia es byte a byte idéntica (sha256 `7a2367d93389fdb4c5a17885f583b266ecb3a236fa6c6763c9940492ec9e3edd`). No se dispone de datos de otras políticas comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa ni genera texto, no responde preguntas y no tiene capacidades de razonamiento, código o matemáticas.
- Ámbito de aplicación extremadamente estrecho: solo controla el slot `walk` del microduck; fuera de ese robot o de simuladores compatibles no es utilizable.
- Licencia no disponible: el repositorio original no declara licencia y esta copia no relicencia el contenido. El uso comercial o fuera de los servicios de Hugging Face es responsabilidad de los autores originales y no está cubierto por ninguna concesión explícita.
- La publicación de esta copia se ampara en los términos de servicio de Hugging Face para contenido en repositorios públicos, no en una licencia del autor; el propio repositorio indica que se retirará si el autor original presenta objeción.
- El resultado de la Arena es heredado del run original (`01M6EVFX3MSG1YJ62X32QV`); jrubiosainz no ejecutó replay ni evaluación nueva, y solo cuenta el resultado que la propia Arena emita para esta entrada.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque no aplican a este tipo de artefacto; el riesgo relevante es de comportamiento físico (caídas, marcha inestable) fuera de las condiciones evaluadas.
- No se especifican los datos de entrenamiento, los hiperparámetros ni la topología de red, lo que limita la reproducibilidad y la auditoría del comportamiento.
- El artefacto no incluye información sobre robustez ante cambios de terreno, carga o desgaste del hardware; la puntuación de la Arena corresponde a un entorno y runner concretos (v5, velocidad 1).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-copy-lphatnguyen-09867b98
- Repositorio original: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v4
- Revisión original concreta: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v4/tree/09867b98ee7f89ae90e0b854ed0f0ee197316275
- Run de la Arena: https://pollen-robotics-microduck-arena.hf.space/api/runs/01M6EVFX3MSG1YJ62X32QV
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `sock-heist-training`, commit `a9189869a` (no se proporciona URL directa en la información disponible)
