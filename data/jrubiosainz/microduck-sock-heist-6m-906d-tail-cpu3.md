# jrubiosainz/microduck-sock-heist-6m-906d-tail-cpu3

## Resumen

Microduck Sock Heist 6m 906d tail re-optimised es una política de control para robótica derivada del modelo `a1rb4Ck/microduck-heist` (commit `906d`), orientada a la competición Sock Heist de la Microduck Arena de Pollen Robotics. No es un modelo de lenguaje: es una política de reinforcement learning empaquetada en ONNX que genera acciones de control de bajo nivel para un robot simulado de 800 g. El autor, jrubiosainz, parte de la política de 906d y re-optimiza únicamente dos segmentos de pesos mediante una búsqueda CMA-ES de un solo núcleo con 16 pasos de control.

La modificación es quirúrgicamente mínima: solo cambian los inicializadores `L_obs` y `L_act` (filas 1038-1069 para la semilla 3 y 1359-1374 para la semilla 4 en indexación cero del grafo 906d), además de los metadatos de licencia y modificación. El resto del grafo, formas de tensores y pesos permanece byte a byte idéntico al modelo base. El paquete final pesa 1.334.911 bytes y se distribuye como ONNX para ejecución en CPU x86.

Su relevancia es acotada pero clara en el nicho de robótica simulada y benchmarking de políticas: demuestra un flujo de trabajo de ajuste fino por búsqueda evolutiva sobre políticas ya entrenadas, conservando la trazabilidad criptográfica (SHA256) de cada artefacto. El autor advierte explícitamente de que los resultados son in-sample sobre los cinco calendarios oficiales y no constituyen una garantía de generalización ni de seguridad en robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico, exportada a grafo ONNX (topología no detallada en la información disponible) |
| Parametros totales | no disponible (peso del artefacto ONNX: 1.334.911 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica; sin capacidades lingüísticas) |
| Licencia | Apache-2.0 (declarada por el autor sobre la fuente 906d; ver advertencias) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna del grafo (número de capas, dimensiones de las capas ocultas ni función de activación). Lo que sí se documenta con precisión es el proceso de modificación: se parte del grafo 906d de `a1rb4Ck/microduck-heist` y se re-optimizan dos segmentos de inicializadores mediante CMA-ES (Covariance Matrix Adaptation Evolution Strategy) con 16 pasos de control, ejecutado en un solo núcleo. La semilla 3 conserva la cola de la iteración previa `94cd-r2` (linaje `jrubiosainz/microduck-sock-heist-6m-94cd-tail-r2`) y la semilla 4 se re-optimiza desde cero dentro de ese mismo esquema.

El modelo base 906d, según la model card original, se construye sobre el walker de `juicenv`, que ya incluía una política de parada ("which already knew how to stop"). El comportamiento descrito es condicional al estado del entorno: "run when it's green, freeze when the giant looks". No se documentan el número de tokens, la composición del dataset ni si hubo RLHF o DPO, ya que no es un modelo de lenguaje. La innovación técnica destacable es la metodología de ajuste fino evolutivo restringido a un subconjunto mínimo de pesos, con verificación de integridad por SHA256 del artefacto final (`1870d7ffdd2f8c2307924f2639ab8b1bf08b968809b2d5c4448b346264b41d44`).

## Capacidades

- Control de política para el entorno Sock Heist 6m de la Microduck Arena: genera acciones de control a partir de observaciones del simulador.
- Comportamiento condicional aprendido: avance cuando la señal del entorno es favorable ("green") y congelación ante la presencia del "giant".
- Ejecución en CPU x86: el artefacto ONNX está pensado para el runner oficial en x86, sin requisito de GPU.
- Compatibilidad con el runner oficial de evaluación (`evaluate_at`) a velocidad 1.2 y con el barrido de comandos oficial.
- Trazabilidad criptográfica: SHA256 del artefacto y de las fuentes upstream documentados en la model card.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento extendido: es una política de control, no un modelo generativo de propósito general.

## Casos de uso

- Participación en la Microduck Arena (Sock Heist 6m): el paquete se envía con la configuración `sock-heist-6m`, velocidad 1.2 y livery `classic`, y se evalúa con el runner oficial sobre los cinco calendarios. Es adecuado porque cumple el formato ONNX y las convenciones del runner.
- Reproducción de resultados en local: al publicarse el SHA256 del artefacto y de las fuentes, un tercero puede verificar que ejecuta exactamente la misma política y comparar los tiempos por semilla.
- Estudio de ajuste fino evolutivo: sirve como caso de referencia para investigar cuánto se puede mejorar una política preentrenada modificando solo dos bloques de inicializadores con CMA-ES de 16 pasos.
- Benchmarking de robustez en simulación: los cinco calendarios oficiales permiten medir varianza de tiempo de finalización (5,51 s a 7,955 s en los resultados reportados) y detectar sensibilidad a la semilla.
- Docencia en robótica simulada: el tamaño reducido del artefacto (1,3 MB) y su ejecución en CPU lo hacen apto para prácticas de evaluación de políticas sin infraestructura GPU.
- Auditoría de linaje de modelos: la cadena de commits y hashes documentada (906d, 94cd, 94cd-r2) permite trazar la procedencia de cada peso en un ejercicio de gobernanza de artefactos.
- Integración en pipelines de CI para validación de políticas: el runner oficial puede automatizarse para comprobar que una nueva versión no degrada los tiempos medios (6,678 s en la media reportada).

## Benchmarks y rendimiento

Resultados oficiales en x86 reportados por el autor para el artefacto final (velocidad 1.2, cinco semillas, calendarios oficiales, in-sample):

| Semilla | Resultado | Tiempo (s) |
|---|---|---|
| 1 | finish | 6,975 |
| 2 | finish | 7,390 |
| 3 | finish | 5,510 |
| 4 | finish | 5,560 |
| 5 | finish | 7,955 |
| Media | Cinco finalizaciones | 6,678 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no es un modelo de lenguaje. El autor indica explícitamente que estos resultados son del runner local oficial y no una aceptación ni un ranking actual en la Arena.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el artefacto se ejecuta en CPU (runner oficial x86).
- GPU recomendadas: no aplica; no se documenta soporte GPU ni se requiere.
- ¿Cabe en consumer GPU? No aplica por diseño; el consumo de memoria es mínimo al tratarse de un ONNX de 1,3 MB.
- Opciones de despliegue: runner oficial de la Microduck Arena (`evaluate_at`), ONNX Runtime en CPU x86; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no son aplicables).
- Latencia y throughput: tiempos de finalización por episodio entre 5,51 s y 7,955 s según semilla, con media de 6,678 s a velocidad 1.2; no se reporta throughput agregado.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Resultados reportados |
|---|---|---|---|---|
| jrubiosainz/microduck-sock-heist-6m-906d-tail-cpu3 | Política robótica (Sock Heist 6m) | ONNX | Apache-2.0 (declarada) | 5/5 finish, media 6,678 s |
| a1rb4Ck/microduck-heist (906d) | Política robótica base | no disponible en la información | Apache-2.0 (según card upstream) | no disponible |
| jrubiosainz/microduck-sock-heist-6m-94cd-tail-r2 | Política robótica (linaje previo) | no disponible en la información | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de los modelos base en la información proporcionada; la comparación se limita a linaje, formato y licencia.

## Limitaciones y advertencias

- Los resultados son in-sample sobre los cinco calendarios oficiales; el propio autor indica que no constituyen una afirmación de generalización.
- No hay garantía de seguridad en robot físico: el modelo está validado solo en simulación.
- No se ha confirmado la aceptación ni el ranking en la Microduck Arena; los tiempos son de runner local.
- La licencia Apache-2.0 se declara sobre la fuente 906d, pero el autor reconoce que no es una garantía independiente de que todos los componentes upstream estén cubiertos, y que no concede derechos adicionales sobre componentes cuya licencia no se haya establecido.
- La procedencia del walker de `juicenv` no se ha establecido de forma independiente (commit y procedencia completa desconocidos).
- El autor se compromete a retirar la entrada si un autor upstream plantea objeciones.
- No se documentan sesgos, riesgo de alucinación ni limitaciones idiomáticas por no ser un modelo de lenguaje; cualquier evaluación de sesgo debería centrarse en el comportamiento de la política en el simulador.
- El paquete se preparó con ayuda de un asistente de IA, según declara el autor.
- Sin datos de cuantización ni de variantes optimizadas para otros backends distintos de ONNX x86.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-906d-tail-cpu3
- Modelo base: https://huggingface.co/a1rb4Ck/microduck-heist
- Linaje previo (94cd r2): https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-94cd-tail-r2
- Autor del walker upstream: https://huggingface.co/juicenv
- Pollen Robotics (Microduck, Arena, simulador y eventos): https://huggingface.co/pollen-robotics
