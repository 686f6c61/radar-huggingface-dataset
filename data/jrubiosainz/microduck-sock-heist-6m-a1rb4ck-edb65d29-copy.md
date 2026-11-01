# jrubiosainz/microduck-sock-heist-6m-a1rb4ck-edb65d29-copy

## Resumen

Microduck Sock Heist - A1 verbatim copy (edb65d29) es una copia byte a byte de la política de control entrenada por a1rb4Ck para el evento Sock Heist de la Microduck Arena, una competición de robótica simulada organizada por Pollen Robotics. El modelo no es una red neuronal generativa ni un LLM, sino una política de refuerzo (reinforcement learning) empaquetada en formato ONNX que controla un robot Microduck de 800 g en una tarea de sigilo: moverse cuando el "gigante" no mira y congelarse cuando mira. Resuelve un problema concreto de control reactivo en un entorno simulado con cinco tableros oficiales.

La relevancia de esta ficha es acotada y debe entenderse en su contexto: se trata de un artefacto de competición, no de un modelo de propósito general. Su interés técnico reside en que combina una red ELU de 61 a 14 dimensiones con una capa de lookup de 2.060 filas que memoriza observaciones y acciones de los cinco recorridos oficiales, lo que la hace extremadamente frágil fuera del simulador y de los tableros vistos durante el entrenamiento.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, ocupa 0.0 GB (el único fichero de pesos son 1.412.516 bytes) y se distribuye bajo Apache 2.0. No dispone de `manifest.json` ni de información sobre idiomas, y su uso previsto es exclusivamente la evaluación en la Microduck Arena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward con activación ELU (61 → 512 → 256 → 128 → 14) más capa de lookup de 2.060 filas sobre los primeros 48 valores de observación |
| Parametros totales | no disponible (el autor no publica recuento; el fichero ONNX pesa 1.412.516 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada fija `obs` [1, 61]) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache License 2.0 |
| Formato de pesos | ONNX (`policy.onnx`, sha256 `937a3703dba301e713b36f639763329f8902ceb75f0e65bf8ec0b0bdceded280`) |

## Arquitectura y entrenamiento

La política es una red feedforward pequeña con activaciones ELU que recibe un vector de observación de 61 dimensiones y emite un vector de acción de 14 dimensiones. Antes de la red se aplica una normalización de entrada (resta de una media y división por una escala). La innovación principal, según la verificación del autor de esta copia, es la capa más externa `L`: un lookup de 2.060 filas que, cuando los primeros 48 valores de la observación coinciden con una fila almacenada con tolerancia 1e-7, reproduce directamente la acción almacenada en esa fila sin pasar por la red. Si no hay coincidencia, responde la red subyacente.

No se documentan en la información disponible el número de tokens, la composición del dataset, ni si hubo RLHF o DPO; se trata de una política de reinforcement learning entrenada para la tarea Sock Heist, presumiblemente mediante aprendizaje por refuerzo en el simulador de la Microduck Arena. El autor original indica que sus tablas se construyeron "sobre el walker de juicenv", que ya sabía detenerse, pero no se especifica qué pesos del fichero provienen de ese trabajo previo. Esta copia no fue entrenada, buscada ni editada por jrubiosainz: es el fichero de a1rb4Ck en la revisión `edb65d29`, byte a byte.

## Capacidades

- Control reactivo de un robot Microduck simulado en la tarea Sock Heist: avanzar cuando el gigante no mira y congelarse cuando mira.
- Ejecución de políticas mediante ONNX Runtime con entrada `obs` [1, 61] y salida `actions` [1, 14].
- Reproducción exacta de acciones memorizadas para observaciones de los cinco tableros oficiales, gracias a la capa de lookup.
- Generalización limitada a observaciones no memorizadas mediante la red ELU subyacente.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües ni modos de "thinking".
- No procesa texto, visión, audio ni ningún otro modalidad: solo vectores numéricos de observación y acción.

## Casos de uso

- Evaluación en la Microduck Arena: el modelo se carga como entrada del evento Sock Heist y se ejecuta con el comando de velocidad 1.2, exactamente como lo hizo a1rb4Ck en su run calificada `01M69S4BWJ5KA3SD0QRS57`.
- Reproducción de resultados de competición: permite verificar de forma determinista la puntuación de la run original (media de 7,731 s en 5 semillas) sin depender de la disponibilidad del repositorio original.
- Estudio de políticas memorizadas: sirve como caso de análisis de cómo una capa de lookup puede dominar el comportamiento de una política pequeña y volverla dependiente de los tableros de entrenamiento.
- Referencia para comparativas de robustez: útil para medir la degradación de rendimiento cuando la observación se desvía más de 1e-7 de las filas almacenadas, por ejemplo en otra máquina o build de ONNX Runtime.
- Docencia sobre reinforcement learning en robótica simulada: ejemplo compacto (1,4 MB) de política de control con red pequeña y capa de memoria, adecuado para laboratorios.
- Pruebas de integración de ONNX Runtime: el fichero permite validar pipelines de inferencia con entrada [1, 61] y salida [1, 14] en entornos de CI.

## Benchmarks y rendimiento

Resultados de la run calificada de a1rb4Ck (`01M69S4BWJ5KA3SD0QRS57`, runner 5, comando de velocidad 1.2) sobre los 6 m de Sock Heist:

| Semilla | Resultado | Tiempo (s) |
|---|---|---|
| 1 | finished | 7,13 |
| 2 | finished | 7,51 |
| 3 | finished | 7,87 |
| 4 | finished | 8,00 |
| 5 | finished | 8,145 |
| **Media** | 5 de 5 finished | **7,731** |

Esta copia se inscribe con el mismo comando de velocidad 1.2, pero el autor de la copia no reclama ningún rendimiento propio: el marcador muestra la run de esta copia, que puede diferir. En caso de empate, la Arena clasifica primero la entrada anterior, lo que situaría a esta copia por detrás de la de a1rb4Ck. No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el fichero ONNX ocupa 1.412.516 bytes y la red es de 61 → 512 → 256 → 128 → 14, por lo que cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: no se especifican; cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 4090, A100, H100) es sobredimensionada para esta carga.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (verificado por el autor de la copia); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Microduck Sock Heist - A1 verbatim copy (esta copia) | no disponible (ONNX de 1,4 MB) | no aplica | Media 7,731 s en 5 semillas (run original) | Apache 2.0 | HuggingFace (0 descargas) |
| a1rb4Ck/microduck-heist (original) | no disponible | no aplica | Media 7,731 s en 5 semillas | Apache 2.0 | HuggingFace |
| Walker de juicenv (base citada) | no disponible | no aplica | no disponible | no disponible | HuggingFace (referenciado) |

No se dispone de datos suficientes para comparar con otras políticas del evento Sock Heist más allá de las citadas.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos en el sentido de modelos de lenguaje; el comportamiento está sesgado hacia los cinco tableros oficiales por la capa de lookup.
- Riesgo de alucinación: no aplica como tal, pero la política puede producir acciones incorrectas cuando la observación no coincide con ninguna fila almacenada y la red subyacente generaliza mal.
- Limitación de contexto e idioma: no aplica; la entrada es un vector fijo de 61 dimensiones y no procesa lenguaje.
- Fragilidad numérica: una run solo recibe una acción almacenada si alcanza una observación almacenada con tolerancia 1e-7; si el redondeo en coma flotante desplaza la observación más allá de ese umbral (otra máquina u otra build de librería), ninguna fila coincide y responde solo la red subyacente.
- Validez limitada: la puntuación no dice nada sobre otros inicios, otros tableros ni otros comandos de velocidad.
- No apto para robot real: el autor de la copia advierte explícitamente de que no debe cargarse en un MicroDuck físico, ya que los sensores reales no repetirán una observación almacenada con tolerancia 1e-7 y solo actuaría la red subyacente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero esta copia no reclama autoría ni otorga derechos propios; los derechos de terceros sobre trabajos previos (como el walker de juicenv) permanecen con sus titulares.
- Falta `manifest.json`, igual que en el repositorio original.
- El autor de la copia se retira si el autor original presenta objeción.

## Enlaces

- Repositorio de esta copia: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-a1rb4ck-edb65d29-copy
- Repositorio original de a1rb4Ck (revisión edb65d29): https://huggingface.co/a1rb4Ck/microduck-heist/tree/edb65d296daaa7422cf6b24f5afcb060d571fe10
- Perfil de a1rb4Ck: https://huggingface.co/a1rb4Ck
- Perfil de juicenv: https://huggingface.co/juicenv
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Repositorio MicroDuck de Pollen Robotics: https://github.com/pollen-robotics/microduck
- Perfil de Pollen Robotics: https://huggingface.co/pollen-robotics
- Texto de la licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
