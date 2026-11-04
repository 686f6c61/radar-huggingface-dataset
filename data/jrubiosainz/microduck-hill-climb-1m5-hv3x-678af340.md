# jrubiosainz/microduck-hill-climb-1m5-hv3x-678af340

## Resumen

Microduck Hill Climb - HV3x-678af340 es una política de control robótico para simulación, publicada por el usuario jrubiosainz en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un artefacto de inferencia en formato ONNX (917.910 bytes) que controla un robot cuadrúpedo virtual en la prueba de escalada de colina de 1,5 metros de Microduck Arena, el entorno de simulación asociado al robot Microduck de Pollen Robotics. El modelo se distribuye con licencia Apache-2.0 y la etiqueta de pipeline `robotics`.

El modelo es un ajuste fino (finetune) sobre HlibPlakhtii/microduck-hill-quicksilver-v3, que a su vez es un remix de rumezhak/microduck-hill-remix-leader3. La contribución propia del autor es una búsqueda con CMA-ES separable sobre los objetivos articulares de la semilla oficial 2, ejecutada el 4 de noviembre de 2026 desde el paso de control 30. El resultado se incorpora como una tabla de búsqueda de observación adicional construida con la función `overlay()` del script `search_race.py` del autor base, con tensores prefijados `search2_`. Todos los tensores, operadores y metadatos del modelo base permanecen inalterados.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo de metodología de búsqueda de políticas sobre un controlador existente sin reentrenamiento; por otro, advierte de que los resultados publicados (media local de 0,737 s frente a 0,738 s del base en las cinco semillas oficiales) son mediciones locales en el runner x86 de microduck-arena 0.7.0 y no constituyen un resultado oficial de la Arena. El autor indica explícitamente que la política no debe ejecutarse en un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control robótico exportada a ONNX; estructura interna no documentada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuye un único archivo ONNX de 917.910 bytes |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red. Se sabe que el artefacto es un grafo ONNX que implementa una política de control para el robot Microduck en el escenario de escalada de colina de 1,5 m de Microduck Arena. El modelo base, microduck-hill-quicksilver-v3, es a su vez un remix de microduck-hill-remix-leader3, y la card remite a los créditos de autoría originales sin detallar la topología de red, el número de capas ni el tipo de observaciones de entrada y acciones de salida.

El proceso de ajuste consistió en una búsqueda con CMA-ES separable sobre los objetivos articulares (joint targets) de la semilla oficial 2, arrancando en el paso de control 30; los pasos previos (asentamiento no cronometrado y primeros pasos) quedan sin modificar. Se registraron 32 filas de pares observación/acción en bucle cerrado sobre el runner nativo x86 y se añadieron como una tabla de búsqueda de observación adicional mediante la función `overlay()` del script `search_race.py` del autor base. Cualquier observación que no coincida con esas 32 filas se responde con el controlador base sin modificar. No se documentan datos de entrenamiento adicionales, ni fases de RLHF, DPO u optimización por preferencias, ni innovaciones como decodificación especulativa o atención lineal, que no aplican a este tipo de artefacto.

## Capacidades

- Control de locomoción en simulación para el escenario de escalada de colina de 1,5 m de Microduck Arena, con el robot Microduck.
- Respuesta determinista a observaciones: las 32 filas registradas se resuelven con la tabla de búsqueda; el resto, con el controlador base.
- Ejecución en el runner oficial microduck-arena 0.7.0 (versión de runner 5) sobre x86.
- Selección de velocidad de comando: en la evaluación canónica el runner seleccionó `command_vx = 0.15`.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, ni capacidades multilingües.
- No dispone de modo thinking, visión, audio ni procesamiento de texto.

## Casos de uso

- Evaluación comparativa de políticas en Microduck Arena: sirve como entrada de referencia para medir la mejora marginal de una búsqueda CMA-ES sobre una política pública, con la salvedad de que los tiempos publicados son locales y el servidor de la Arena es la autoridad.
- Investigación en optimización de controladores: el parche `overlay()` con 32 filas de observación/acción es un ejemplo reproducible de cómo inyectar una búsqueda dirigida sin reentrenar el grafo base.
- Reproducción de experimentos de búsqueda: el autor documenta hashes SHA256 del base (`3666e089...`) y del candidato (`678af340...`), lo que permite verificar la integridad del artefacto en un pipeline de CI.
- Docencia en robótica simulada: útil para ilustrar el flujo completo de evaluación con barrido de 18 velocidades y semillas oficiales en un entorno controlado.
- Pruebas de integración del runner: permite validar la carga de un ONNX de 917.910 bytes y la ejecución del bucle cerrado en el runner x86 versión 5.
- Análisis de sensibilidad a semillas: las cinco semillas oficiales con tiempos entre 0,730 s y 0,745 s permiten estudiar la varianza del controlador ante condiciones iniciales distintas.
- Referencia negativa en estudios de generalización: al ser una búsqueda in-sample sobre la semilla 2, sirve para contrastar metodologías que buscan robustez frente a sobreajuste a semillas concretas.

## Benchmarks y rendimiento

Resultados de replay local en el runner oficial microduck-arena 0.7.0 x86 (versión 5), con barrido completo de 18 velocidades y sin velocidad fijada:

| Semilla oficial | Base (s) | Esta entrada (s) |
|---|---:|---:|
| 1 | 0,730 | 0,730 |
| 2 | 0,745 | 0,740 |
| 3 | 0,740 | 0,740 |
| 4 | 0,735 | 0,735 |
| 5 | 0,740 | 0,740 |

Media local: 0,737 s frente a 0,738 s del base. Cinco finalizaciones registradas. El autor advierte de que son mediciones locales y no una afirmación de aceptación, rango o puntuación en la Arena en vivo; el resultado del servidor es el autoritativo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el artefacto ONNX ocupa 917.910 bytes, por lo que el peso en memoria es mínimo y el consumo vendrá dominado por el runner de simulación.
- GPU recomendadas: no especificadas; el autor reporta evaluación en el runner nativo x86, sin mención de GPU.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del archivo sugiere que cabría en cualquier GPU de consumo, pero no hay datos publicados al respecto.
- Opciones de despliegue: ONNX Runtime a través del runner oficial microduck-arena 0.7.0 (versión 5). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; solo se publican tiempos de finalización por episodio (entre 0,730 s y 0,745 s según semilla).

## Comparativa con modelos similares

| Modelo | Relación | Parámetros | Contexto | Rendimiento local (media 5 semillas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jrubiosainz/microduck-hill-climb-1m5-hv3x-678af340 | Esta entrada | no disponible | no aplica | 0,737 s | Apache-2.0 | Hugging Face |
| HlibPlakhtii/microduck-hill-quicksilver-v3 | Base directo | no disponible | no aplica | 0,738 s | Apache-2.0 | Hugging Face |
| rumezhak/microduck-hill-remix-leader3 | Base del base | no disponible | no aplica | no disponible | no disponible en la información proporcionada | Hugging Face |

La diferencia medida entre esta entrada y su base directo es de 0,001 s en la media de cinco semillas, con una única mejora de 0,005 s en la semilla 2 y el resto de semillas idénticas. No se dispone de datos de rendimiento del modelo de rumezhak para completar la comparación.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una política de control en simulación, los sesgos relevantes serían de comportamiento motor, no sociales o lingüísticos.
- Riesgo de sobreajuste: la búsqueda se realizó exclusivamente sobre la semilla oficial 2 y los cinco arranques oficiales, por lo que es in-sample y no dice nada sobre locomoción general ni sobre seguridad en robot real.
- Riesgo de alucinación: no aplica en el sentido habitual; el riesgo equivalente es una respuesta incorrecta del controlador ante observaciones fuera de las 32 filas registradas, que se delegan al base sin modificar.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje natural.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la card incluye una cláusula de escalado y retirada si un autor original objeta la publicación. El archivo `NOTICE` declara la modificación conforme a Apache-2.0 §4(b).
- Advertencia de seguridad explícita: el autor indica "Do not run this policy on a physical robot". El modelo es solo para simulación.
- Los resultados publicados no son oficiales de la Arena; el servidor es la autoridad y podría rechazar o puntuar de forma distinta la entrada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0,0 GB según la plataforma, lo que puede indicar que el archivo no está correctamente empaquetado o indexado.
- No se documentan evaluadores, física, datos de leaderboard ni código de servidor modificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-hill-climb-1m5-hv3x-678af340
- Modelo base directo: https://huggingface.co/HlibPlakhtii/microduck-hill-quicksilver-v3/tree/65a137db5525b1c591450704241396e69368374d
- Base del base: https://huggingface.co/rumezhak/microduck-hill-remix-leader3/tree/cddaeebb6bcee5ef84729d9eb0838fc74097cf2c
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
