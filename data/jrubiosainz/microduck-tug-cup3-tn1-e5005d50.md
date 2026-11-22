# jrubiosainz/microduck-tug-cup3-tn1-e5005d50

## Resumen

Microduck-tug-cup3-tn1-e5005d50 es una política de control para robótica presentada por el usuario jrubiosainz a la competición Microduck Arena Tug of War, un entorno de simulación donde dos agentes compiten por arrastrar un objeto o al oponente. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo: es una política neuronal exportada a ONNX, con un tamaño de fichero de exactamente 1.045.628 bytes, pensada para ser ejecutada por el runner oficial de la arena y evaluada de forma determinista.

La entrada se construye como un merge sobre la política P10G del mismo autor, que a su vez es una red de respaldo de SSH111111/microduck-tug-p10 sin modificar, a la que se han alterado 51 filas de una tabla de búsqueda (lookup). El resultado reproduce bit a bit la trayectoria de GinDuck/microduck-tug-norris-p10c en las semillas 1 a 4 y utiliza en la semilla 5 un remate obtenido mediante una búsqueda CMA-ES propia del autor. La relevancia es acotada: sirve como referencia reproducible de una entrada de competición, con un SHA-256 exacto y una validación de replay en x86 documentada.

El modelo se publica con la etiqueta `simulation only`, sin licencia declarada y sin idiomas soportados, lo que refleja que su ámbito es exclusivamente el de la simulación en la arena Microduck y no el de aplicaciones de producción generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control exportada a ONNX para el runner de Microduck Arena) |
| Parametros totales | no disponible (fichero de pesos de 1.045.628 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (el autor indica que no se afirma una licencia global) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La información disponible no describe la topología interna de la red más allá de que se trata de una política exportada a ONNX y ejecutada por la librería `microduck`. La entrada se construye por merge: parte de la política P10G de jrubiosainz (red de respaldo de SSH111111/microduck-tug-p10, sin cambios) y modifica 51 filas de una tabla de búsqueda. Por tanto, el comportamiento observable se define en buena medida por esa tabla y por las filas sustituidas, no por un reentrenamiento completo de los pesos.

El proceso de ajuste documentado se limita a la semilla 5, donde se aplica un remate procedente de una búsqueda por CMA-ES propia del autor, fechada el 2026-11-22. No se especifican el número de tokens, la composición del dataset, ni si hubo RLHF o DPO, lo cual es coherente con el hecho de que no es un modelo de lenguaje. La innovación técnica destacable es la reproducibilidad: se publica el SHA-256 exacto de la política (`e5005d509ea063e01c075485c2c5eacca554cbd7ed2d481b0b919094f40cdb19`) y un recibo de replay (`x86-replay-receipt.json`) que verifica la igualdad bit a bit entre ejecuciones en procesos separados.

## Capacidades

- Control de agente en el entorno de simulación Tug of War de Microduck Arena, con política determinista ejecutable por el runner oficial.
- Reproducción bit a bit de la trayectoria de GinDuck/microduck-tug-norris-p10c en las semillas 1, 2, 3 y 4.
- Remate específico en la semilla 5 obtenido por búsqueda CMA-ES, que supera el resultado de Tug Norris en esa semilla.
- Ejecución en x86 mediante el runner-5 oficial, con resultados idénticos en dos procesos independientes.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, function calling, capacidades de agente multi-paso ni soporte multilingüe, al no ser un modelo de lenguaje.

## Casos de uso

- Replay y verificación de competición: la política se puede ejecutar con el evaluador oficial en x86 para comprobar que el resultado coincide bit a bit con el publicado, gracias al SHA-256 y al recibo de replay incluidos.
- Auditoría de merges de políticas: permite estudiar cómo la modificación de 51 filas de una tabla de búsqueda altera el comportamiento en una única semilla sin tocar el resto de la red, como caso práctico de edición selectiva de políticas.
- Referencia base para búsqueda de hiperparámetros: el remate de la semilla 5 obtenido por CMA-ES sirve como punto de partida para experimentos de optimización en el mismo entorno.
- Docencia e investigación en robótica simulada: útil para ilustrar evaluación determinista, comparación por semillas y reproducibilidad de resultados en entornos de competición.
- Pruebas de integración de runners: al ser un fichero ONNX pequeño (1.045.628 bytes) con hash fijo, resulta adecuado para validar pipelines de carga y ejecución del runner de Microduck.
- Comparación de entradas de la arena: sus resultados por semilla permiten contrastar el rendimiento frente a Tug Norris y H9 en el mismo host x86 y bajo el mismo evaluador.

## Benchmarks y rendimiento

Resultados del evaluador oficial en replay local x86 con runner-5, dos ejecuciones en procesos separados e idénticas bit a bit. Puntuación global de esta entrada: 168,97825956344604 (`0x1.51f4de7000000p+7`), con cinco `pit_won`.

| seed | Esta entrada | GinDuck Tug Norris (board) | H9 (board) |
|---|---|---|---|
| 1 | 169,04293298721313 | 169,04293298721313 | 169,04293298721313 |
| 2 | 169,0845549106598 | 169,0845549106598 | 169,0845549106598 |
| 3 | 168,7562346458435 | 168,7562346458435 | 168,7562346458435 |
| 4 | 169,4589078426361 | 169,4589078426361 | 169,45884823799133 |
| 5 | 168,54866743087769 | 168,54861974716187 | 168,5486078262329 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto de pesos ocupa 1.045.628 bytes (aproximadamente 1 MB), por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no disponibles; la validación documentada se realizó en un host x86 con el runner-5 oficial, sin especificar GPU.
- Compatibilidad con GPU de consumo: no disponible como dato explícito; por el tamaño del fichero no se anticipan requisitos relevantes, pero no se confirma en la información proporcionada.
- Opciones de despliegue: librería `microduck` con el runner oficial (runner-5) y pesos en formato ONNX; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Resultado en la arena | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-tug-cup3-tn1-e5005d50 (esta entrada) | Política ONNX para Tug of War | no disponible (1.045.628 bytes) | no aplica | 168,97825956344604 global; cinco `pit_won` | no disponible | Hugging Face |
| GinDuck/microduck-tug-norris-p10c | Política ONNX para Tug of War | no disponible | no aplica | Resultados por semilla en la tabla anterior | no disponible | Hugging Face |
| jrubiosainz/microduck-tug-cup3-h9-29a9ef4a | Política ONNX para Tug of War | no disponible | no aplica | Resultados por semilla en la tabla anterior | no disponible | Hugging Face |
| jrubiosainz/microduck-tug-cup3-p10g-3a94031b | Política ONNX para Tug of War (red de respaldo de SSH111111/microduck-tug-p10) | no disponible | no aplica | Reprodujo su resultado público por semilla en el mismo host x86 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Ámbito restringido: el autor declara explícitamente `simulation only`; no está pensado para uso en robótica física ni en producción fuera de la arena Microduck.
- Licencia: no se afirma ninguna licencia global; los créditos y materiales de terceros se conservan en `NOTICE` y en los ficheros `UPSTREAM-*`, `H9-*` y `P10G-*`, por lo que el uso comercial queda sin marco claro.
- Dependencia de terceros: incorpora material de GinDuck, SSH111111, Suraj Phanindra (tug-hc9-aifund), NootXLM y N3G53, cuyas condiciones deben revisarse por separado.
- Comportamiento mayormente replicado: en las semillas 1 a 4 reproduce la trayectoria de Tug Norris sin cambios; la contribución propia se concentra en la semilla 5, lo que limita la generalización a otras semillas o variantes del entorno.
- Riesgo de sobreajuste al evaluador: el ajuste por CMA-ES sobre una semilla concreta puede no transferir a cambios en el entorno, en el runner o en la configuración de la arena.
- Idiomas: no aplica ni se declaran; no hay soporte multilingüe.
- Alucinación: no aplica como modelo generativo, pero el comportamiento fuera de las condiciones de replay documentadas no está garantizado.
- Datos incompletos: no se publican arquitectura interna, número de parámetros, cuantizaciones ni requisitos de hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-tug-cup3-tn1-e5005d50
- Política base P10G: https://huggingface.co/jrubiosainz/microduck-tug-cup3-p10g-3a94031b
- Política H9: https://huggingface.co/jrubiosainz/microduck-tug-cup3-h9-29a9ef4a
- Política upstream Tug Norris: https://huggingface.co/GinDuck/microduck-tug-norris-p10c
- Política upstream P10: https://huggingface.co/SSH111111/microduck-tug-p10
