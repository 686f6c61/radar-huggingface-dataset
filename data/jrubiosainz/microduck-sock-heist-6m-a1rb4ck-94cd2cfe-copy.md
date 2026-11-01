# jrubiosainz/microduck-sock-heist-6m-a1rb4ck-94cd2cfe-copy

## Resumen

Microduck Sock Heist - A1 verbatim copy (94cd2cfe) es una política de control para robótica entrenada mediante aprendizaje por refuerzo, publicada por el usuario jrubiosainz en Hugging Face. No se trata de un modelo de lenguaje: es una política neuronal exportada a ONNX que controla un robot MicroDuck de Pollen Robotics en el entorno simulado Microduck Arena, concretamente en la tarea "Sock Heist", donde el agente debe moverse y congelarse según el estado de un "gigante" para robar un calcetín.

El repositorio es una copia byte a byte del fichero publicado por el usuario a1rb4Ck en el commit `94cd2cfeb57a4ece561a3d320e233f442238cb81` de su repositorio `microduck-heist`. El autor de esta copia declara explícitamente que no ha entrenado, buscado, fusionado ni modificado la política; se limita a replicar el artefacto con fines de archivo y atribución. El fichero `policy.onnx` ocupa 1.364.816 bytes (aproximadamente 1,3 MB) y su hash SHA256 es `acfa151e7c4f7ce668bc7d7ccbeea4ca0bbb4acdc1c1681a91a0d7853e131f3e`.

La relevancia de esta ficha es acotada: se trata de una entrada de competición en un simulador, no de un modelo de propósito general. Su interés radica en ser un ejemplo de política de refuerzo de muy bajo peso (compatible con un robot de 800 g) y en las advertencias de procedencia y licencia que acompañan a la copia, que ilustran un problema habitual en la cadena de atribución de pesos en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política neuronal exportada a ONNX; no se documenta la topología interna) |
| Parametros totales | No disponible (el fichero ONNX pesa 1.364.816 bytes) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política de control, no modelo de secuencia) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | Apache-2.0 (declarada por el upstream; ver advertencias) |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la política. El artefacto publicado es un único fichero ONNX de 1.364.816 bytes, sin `manifest.json` asociado en el repositorio. La model card original de a1rb4Ck indica que la política se basa en "juicenv's walker", un controlador previo que "ya sabía cómo pararse", y que fue ajustada para las cinco tablas oficiales del entorno Sock Heist. No se documentan el número de tokens, la composición del dataset, ni si hubo RLHF, DPO u otras técnicas de alineación; en el contexto de aprendizaje por refuerzo en simulación, estos términos no aplican directamente.

La innovación técnica declarada es de comportamiento, no de arquitectura: la política debe alternar entre correr cuando el semáforo está en verde y congelarse cuando el gigante mira, una tarea de control reactivo con restricciones de peso y morfología (el robot pesa 800 g y su cabeza constituye un tercio de esa masa). La model card advierte que la selección y los resultados reportados son in-sample y que no se reclama generalización a otras tablas, puntos de inicio, máquinas o velocidades.

## Capacidades

- Control reactivo de un robot MicroDuck en el simulador Microduck Arena, tarea "Sock Heist".
- Ejecución de una política de movimiento y parada condicionada al estado del "gigante" y del semáforo.
- Funcionamiento con el comando de velocidad `1.2` del runner versión 5 de la Arena.
- Inferencia a partir de un único fichero ONNX, sin dependencias de tokenizador ni de vocabulario.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento, código, matemáticas, visión ni audio.
- No tiene capacidades multilingües: no procesa ni genera lenguaje natural.

## Casos de uso

- Evaluación de políticas en Microduck Arena: la copia puede cargarse en el simulador para reproducir la entrada original con el comando de velocidad `1.2` y el runner versión 5, comparando tiempos por semilla.
- Archivo y preservación de artefactos: al ser byte-idéntica al original, sirve como referencia de integridad mediante el hash SHA256 documentado.
- Estudio de cadenas de atribución y licencias: el repositorio documenta explícitamente la procedencia (a1rb4Ck, lphatnguyen, juicenv, Pollen Robotics) y las incertidumbres de licencia, lo que lo convierte en un caso práctico para analizar buenas prácticas de atribución.
- Docencia en aprendizaje por refuerzo: permite ilustrar el ciclo completo de entrenamiento en simulación, exportación a ONNX y evaluación en una Arena con semillas fijas.
- Pruebas de integración de ONNX Runtime en pipelines de robótica simulada: el fichero único y de pequeño tamaño facilita validar cargadores y entornos de ejecución.
- Reproducibilidad de resultados: las cinco semillas documentadas (1 a 5) con sus tiempos permiten verificar que la copia se comporta de forma equivalente al original en el mismo entorno.

## Benchmarks y rendimiento

Los únicos datos disponibles son los resultados de la ejecución en la Arena del repositorio de origen, no de esta copia. La model card indica que la ejecución `01M6BSRZ4F8Y9YFMVEBKJ4`, enviada el 2026-11-01 a las 14:56:17 UTC con runner versión 5 y comando de velocidad `1.2`, produjo:

| Semilla | Resultado | Tiempo (s) |
|---|---|---|
| 1 | finished | 6,99 |
| 2 | finished | 7,39 |
| 3 | finished | 5,64 |
| 4 | finished | 7,49 |
| 5 | finished | 7,975 |
| Media | 5 de 5 finished | 7,097 |

Estos resultados corresponden a la entrada de origen y no constituyen una puntuación medida para esta copia; solo una ejecución propia en la Arena establecería su puntuación. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima, inferior a 1 GB; el fichero ONNX ocupa 1,3 MB y la política es de muy baja capacidad.
- GPU recomendadas: no se especifican; cualquier GPU con soporte de ONNX Runtime es suficiente, e incluso la CPU resulta viable.
- Cabe en cualquier GPU de consumo; también en dispositivos embebidos, siempre que se ejecute en simulación.
- Opciones de despliegue: ONNX Runtime, con el runner de Microduck Arena (versión 5). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. Los tiempos de la tabla (5,64 a 7,975 s por semilla) corresponden a la duración de la tarea en el simulador, no a latencia de inferencia.
- Advertencia: la model card indica explícitamente que es una entrada solo para simulador y que no debe cargarse en hardware físico.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| Esta copia (jrubiosainz) | Política RL para Sock Heist | ONNX | Apache-2.0 declarada | No aplica | Hugging Face |
| a1rb4Ck/microduck-heist | Política RL original | ONNX | Apache-2.0 | No aplica | Hugging Face |
| lphatnguyen/microduck-sock-heist-6m-v3 | Política RL (posible componente upstream) | No disponible | Sin licencia declarada | No aplica | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas entradas más allá de los resultados de la Arena del repositorio de origen. La model card advierte que coincidencias por semilla no establecen el origen ni la propiedad de pesos individuales.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde a prompts y no debe evaluarse con benchmarks de NLP.
- Solo válido en simulación: la model card prohíbe explícitamente cargarlo en hardware físico.
- Selección in-sample: los resultados reportados corresponden a las cinco tablas oficiales; no se reclama generalización a otras tablas, puntos de inicio, máquinas o velocidades.
- Rendimiento no medido para esta copia: los tiempos de la tabla son de la entrada de origen; solo una ejecución propia en la Arena puntúa esta copia.
- Incertidumbre de licencia: Apache-2.0 refleja la declaración del upstream, no una garantía de que todos los componentes incorporados estén cubiertos; en particular, no se extiende a componentes del repositorio de lphatnguyen, que no declara licencia.
- Falta de `manifest.json` y de fichero NOTICE en el commit fijado.
- Riesgo de alucinación: no aplica en el sentido habitual; el riesgo equivalente es un comportamiento fuera de distribución en el simulador.
- Sesgos conocidos: no documentados.
- El autor de la copia se compromete a retirarla si algún autor lo solicita, y declara que un asistente de IA ayudó a preparar la publicación y la model card.

## Enlaces

- Repositorio de esta copia: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-a1rb4ck-94cd2cfe-copy
- Repositorio original: https://huggingface.co/a1rb4Ck/microduck-heist/tree/94cd2cfeb57a4ece561a3d320e233f442238cb81
- Posible componente upstream: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3/tree/194c8a05d958c6e6337b0b27804f4f783697a1ce
- Perfil de juicenv: https://huggingface.co/juicenv
- MicroDuck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Microduck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
