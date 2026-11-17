# jrubiosainz/microduck-sock-counter-s1s5

## Resumen

Microduck Sock Heist - Counter s1s5 es una política de control para robótica simulada publicada en Hugging Face por el usuario jrubiosainz dentro del ecosistema Microduck Arena de Pollen Robotics. No es un modelo de lenguaje: se trata de un artefacto de inferencia exportado a ONNX que genera secuencias de acciones para un robot en un entorno de simulación, concretamente una tarea de contador de calcetines ("sock counter") derivada de la tarea "sock heist".

El modelo es una modificación de una política previa publicada por el mismo autor, `jrubiosainz/microduck-sock-counter-s5`, que a su vez hereda su grafo y tablas de búsqueda de `GinDuck/microduck-gin-sock-s5`. La modificación consiste en ajustes puntuales de las secuencias de acción para las semillas 1 y 5, que mejoran un único tick de 0,005 segundos cada una. No se ha entrenado ninguna red nueva: el modelo reutiliza el grafo original y modifica únicamente bloques de tabla concretos, manteniendo el resto del contenido byte a byte.

La relevancia es limitada y muy específica: se trata de una entrada de competición para la Microduck Arena, con un resultado declarado de 4,788 segundos en un barrido completo sobre x86 con cinco semillas. El propio autor advierte que es solo para simulación y que no debe cargarse en un robot físico. El repositorio ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control exportada a ONNX; grafo heredado de GinDuck/microduck-gin-sock-s5) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones y acciones por tick) |
| Tipos de cuantizacion | no disponible (formato ONNX; el autor indica que es una versión cuantizada del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio upstream inmediato no declara licencia; Apache-2.0 solo aplica a componentes que la declaran) |
| Formato de pesos | ONNX |
| Pipeline | robotics |
| Libreria | microduck |
| Modelo base | jrubiosainz/microduck-sock-counter-s5 |
| SHA256 de la politica | 96beefe48b692701a908ff38e6fe2f87083fce59c4611f34910cdc3b4b48a9ac |
| SHA256 de la politica padre | ad8ed5590b18827961983496d80f3604d7705c7dcb270a4d147ed553a9f58ed9 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo más allá de que se trata de una política exportada a ONNX con un grafo y un mecanismo de respaldo ("fallback") heredados de `GinDuck/microduck-gin-sock-s5`. La model card menciona "lookup blocks" y "tablas", lo que sugiere una política compuesta por una red y tablas de búsqueda de acciones precalculadas, una estructura habitual en entradas de competición que combinan trayectorias registradas con un controlador aprendido.

No se ha entrenado ninguna red nueva para esta entrada. La modificación respecto al modelo padre consiste en reemplazar las secuencias de acción de las semillas 1 y 5, cada una de las cuales mejora un único tick de 0,005 segundos. Las semillas 2, 3 y 4 conservan los bloques de búsqueda del padre byte a byte, y el resto del contenido no relacionado con tablas permanece sin cambios salvo un aviso de modificación añadido al final. Las secuencias fueron replicadas de forma nativa y regrabadas en x86. No se dispone de información sobre el número de tokens, la composición del dataset ni el uso de RLHF o DPO, ya que no se trata de un modelo de lenguaje.

## Capacidades

- Generación de secuencias de acción para un robot simulado en la tarea "sock counter" dentro de Microduck Arena.
- Ejecución determinista: el autor declara que la réplica separada coincide bit a bit con las cinco trazas del barrido.
- Cobertura de cinco semillas con tiempos de finalización registrados: 4,635, 5,095, 4,675, 4,715 y 4,820 segundos.
- Reutilización de un grafo y un mecanismo de respaldo heredados, con tablas de búsqueda para las semillas 2, 3 y 4 sin modificar.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modos de razonamiento: no es un modelo de lenguaje.
- Uso exclusivo en simulación; el autor prohíbe explícitamente cargarla en un robot físico.

## Casos de uso

- Evaluación en Microduck Arena: la política está pensada para enviarse a la Arena y comparar su tiempo de finalización (4,788 s declarados) con otras entradas de la misma tarea.
- Investigación en optimización de políticas por edición de tablas: sirve como ejemplo de cómo modificar secuencias de acción concretas sin reentrenar la red, útil para estudiar el impacto de cambios mínimos en el rendimiento.
- Reproducibilidad de resultados en robótica simulada: los ficheros `x86-full-sweep.json` y `x86-replay-receipt.json` permiten verificar bit a bit las trazas declaradas.
- Estudio de linaje de políticas compuestas: la cadena de procedencia (GinDuck, rumezhak, lphatnguyen, a1rb4Ck, juicenv, HlibPlakhtii) documentada en `table-provenance.json` sirve para analizar cómo evolucionan las entradas de competición.
- Docencia sobre artefactos ONNX en robótica: el modelo ilustra el empaquetado de una política de control en ONNX con metadatos de procedencia y hashes de integridad.
- Auditoría de licencias en modelos derivados: el caso muestra la gestión de componentes con y sin licencia declarada y el uso de ficheros `NOTICE` y `UPSTREAM-NOTICE`.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Barrido completo x86 runner-v5 (política exacta) | 4,787999999999999 s (mostrado como 4,788) |
| Semilla 1 | 4,635 s |
| Semilla 2 | 5,095 s |
| Semilla 3 | 4,675 s |
| Semilla 4 | 4,715 s |
| Semilla 5 | 4,820 s |
| vx seleccionado en el barrido | 0,2 |
| Réplica separada | coincide bit a bit con las cinco trazas |

Los resultados son locales hasta que los confirme un envío a la Arena. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y el modelo se ejecuta como política ONNX en el entorno de simulación.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; la evaluación declarada se realizó en x86 (CPU), según el nombre del run `patha-sock-cpu2-20261117T0537Z-1bec`.
- Opciones de despliegue: librería `microduck` y runtime ONNX; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles más allá de los tiempos de finalización por semilla del barrido.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jrubiosainz/microduck-sock-counter-s1s5 | Política ONNX (modificación de tablas) | no aplica | 4,788 s (barrido local) | no disponible | Hugging Face |
| jrubiosainz/microduck-sock-counter-s5 | Política ONNX (padre) | no aplica | 4,790 s (referencia citada por el autor) | no disponible | Hugging Face |
| GinDuck/microduck-gin-sock-s5 | Política ONNX (upstream inmediato) | no aplica | no disponible | no declarada | Hugging Face |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo para simulación: el autor advierte explícitamente de que no debe cargarse en un robot físico.
- Los resultados son locales hasta que los confirme un envío a la Arena; no deben tratarse como validados por el servidor.
- La cobertura del cribado de colisiones (`collision-screen.json`, `collision-snapshot.json`) es UNKNOWN/INCOMPLETE a nivel global y no garantiza unicidad ni elegibilidad; solo el servidor determina `copy_of`.
- Licencia no disponible: el repositorio upstream inmediato no declara licencia y el autor no inventa ni asume una. Apache-2.0 se aplica solo a los componentes que llevan esos términos, no a las contribuciones sin licencia. Esto limita el uso comercial sin aclaración previa.
- El modelo no ha entrenado ninguna red nueva; su mejora se limita a un tick de 0,005 segundos en dos semillas, por lo que su margen de mejora es marginal.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual de los modelos de lenguaje, pero la política puede fallar en condiciones no cubiertas por las tablas de búsqueda heredadas.
- El autor se reserva el derecho de retirar la entrada si un titular de derechos presenta una objeción.
- Los indicadores históricos de flujo de trabajo en los recibos inmutables de origen describen su estado de almacenamiento original, no la autorización de publicación actual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-sock-counter-s1s5
- Modelo base: https://huggingface.co/jrubiosainz/microduck-sock-counter-s5
- Upstream inmediato: https://huggingface.co/GinDuck/microduck-gin-sock-s5
- Pollen Robotics (Microduck y Arena): no disponible en la información proporcionada
