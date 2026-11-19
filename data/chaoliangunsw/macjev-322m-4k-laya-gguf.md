# chaoliangUNSW/MacJev-322M-4K-Laya-GGUF

## Resumen

MacJev-322M-4K-Laya-GGUF es la distribucion en formato GGUF de MacJev-322M-4K-Laya, un modelo de decision compacto orientado a agentes locales en macOS. Lo desarrolla Chaoliang Yan (usuario chaoliangUNSW) dentro del proyecto JevStyle. No es un modelo generativo: recibe un estado observado y una pregunta tipada con respuestas candidatas, y devuelve en una sola pasada una probabilidad para cada candidata. Su utilidad practica es clasificar, enrutar llamadas a herramientas y verificar el estado de una tarea con puntuaciones calibradas y umbralizables.

El modelo parte del checkpoint multilingue Laya (arquitectura mmBERT/ModernBERT) y anade una cabeza de decision entrenada especificamente para tareas de eleccion forzada. Con 306.939.648 parametros y una ventana de 4096 tokens, esta pensado para ejecutarse en local sobre Apple silicon mediante llama.cpp, sin binarios parcheados: el encoder se sirve como GGUF estandar `modern-bert` con `llama-server` en modo embeddings y la cabeza se ejecuta aparte en NumPy en FP32.

Es relevante ahora porque cubre un nicho poco atendido: la decision barata y verificable dentro de pipelines de agentes, frente al coste de invocar un LLM generativo para cada comprobacion. Segun la model card, frente al checkpoint Laya del que parte mejora la precision en comprobaciones si/no sobre entradas de 2K-4K tokens del 31,0 % al 89,1 % y reduce el error de calibracion en entradas largas de 0,253 a 0,032. El autor lo mantiene como archivo historico: la release recomendada actual es 2B v4 (texto e imagenes) y, para el modelo de texto mas pequeno, 0.8B v3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | encoder mmBERT/ModernBERT con cabeza de decision (clasificacion de eleccion forzada) |
| Parametros totales | 306.939.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | F16 (encoder GGUF); cabeza de decision en FP32 (safetensors) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`MacJev-322M-4K-Laya-F16.gguf`) + `MacJev-322M-4K-Laya-head.safetensors` |

## Arquitectura y entrenamiento

El modelo combina un encoder transformer bidireccional de la familia ModernBERT (variante mmBERT, multilingue) con una cabeza de decision que se aplica sobre los estados ocultos por token. El encoder se convierte a GGUF `modern-bert` con las herramientas estandar de llama.cpp y se sirve con `llama-server` usando `--embeddings --pooling none`, de modo que el cliente recibe un estado oculto por token y ejecuta la cabeza en NumPy; el script `macjev_gguf.py` solo requiere `numpy`, `tokenizers` y `safetensors`. La entrada se procesa completa de una vez, con flags de contexto y batch fijados a 4096 (`-c 4096 -b 4096 -ub 4096 -np 1 -fa on`).

El entrenamiento parte del checkpoint multilingue Laya y se orienta a decisiones tipadas: el modelo recibe un estado y una pregunta con candidatas, y aprende a asignar probabilidad a cada una. Segun la model card, los resultados se obtuvieron con tres semillas entrenadas de forma independiente y la release publicada es la semilla elegida a priori sobre datos de desarrollo, lo que aporta evidencia de reproducibilidad. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO. Esta release, fechada el 2026-09-23, no uso salidas de Jev y solo funciona con el runtime incluido en el repositorio; el paquete `jev-style` no la carga.

## Capacidades

- Clasificacion de texto y puntuacion de eleccion forzada: devuelve una probabilidad por cada respuesta candidata en una sola pasada.
- Comprobaciones si/no de estado de tarea, con especial rendimiento en entradas largas de 2K a 4K tokens.
- Decisiones por reglas y decisiones tipadas sobre estados estructurados.
- Enrutamiento de llamadas a herramientas (tool routing) en agentes locales: elegir entre acciones disponibles como `open_browser`, `copy_file` o `ask_user`.
- Puntuaciones calibradas y umbralizables: el error de calibracion en entradas largas es de 0,032, lo que permite fijar umbrales de confianza con sentido.
- Capacidades multilingues limitadas a ingles y chino.
- No es un modelo generativo: no produce texto libre, no soporta tool calling en el sentido conversacional ni razonamiento multi-paso autonomo.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Enrutamiento de herramientas en agentes locales de macOS: dado el estado de la sesion y la lista de acciones disponibles, el modelo devuelve la probabilidad de cada accion y el agente ejecuta la de mayor puntuacion; su tamano de 307M parametros permite mantenerlo residente junto al agente sin competir por memoria.
- Verificacion del estado de una tarea en pipelines multi-paso: comprobaciones si/no sobre observaciones largas (2K-4K tokens) con un 89,1 % de precision segun la model card, lo que permite decidir si continuar, reintentar o pedir intervencion.
- Clasificacion de texto en produccion con umbrales de confianza: al tener un error de calibracion de 0,032 en entradas largas, las puntuaciones pueden usarse directamente para derivar casos dudosos a revision humana.
- Moderacion o filtrado de solicitudes en asistentes de escritorio: clasificar la peticion del usuario frente a un conjunto fijo de categorias antes de invocar un modelo mayor, reduciendo coste y latencia.
- Puntuacion de candidatos en sistemas de recuperacion o ranking: reutilizar la cabeza de decision para ordenar opciones discretas (acciones, respuestas, documentos) con una unica pasada del encoder.
- Evaluacion reproducible de decisiones en investigacion: el script y los pesos permiten repetir experimentos de enrutamiento y comparar contra alternativas, como el benchmark publico de routing bancario citado en la model card.
- Despliegue en local sin conexion en equipos Apple silicon: el encoder corre en llama.cpp y la cabeza en NumPy, sin dependencias de servicios alojados ni claves de API.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparados con el checkpoint multilingue Laya del que parte, con el mismo presupuesto de entrada de 4096 tokens y sobre conjuntos de test reservados:

| Tarea | Laya multilingue | MacJev |
|---|---:|---:|
| Comprobaciones si/no con entradas de 2K-4K tokens | 31,0 % | 89,1 % |
| Decisiones por reglas con entradas de 2K-4K tokens | 23,7 % | 44,7 % |
| Decisiones por reglas en entradas largas, todas las longitudes | 23,2 % | 39,7 % |
| Decisiones tipadas | 35,2 % | 42,2 % |
| Error de calibracion en entradas largas (menor es mejor) | 0,253 | 0,032 |

Ademas, la model card indica que en 11.600 decisiones publicas (decisiones tipadas, Emotion y AG News) la precision sube 1,5 puntos, con un intervalo de confianza del 95 % de 1,1 a 1,8. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos en la informacion disponible, lo cual es coherente con que el modelo no sea generativo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 307M parametros en F16 el encoder ocupa aproximadamente 0,6 GB de pesos, mas el estado del servidor llama.cpp y la cabeza en FP32.
- El repositorio completo ocupa 0,7 GB.
- GPU recomendadas: no disponibles; el caso de uso declarado es macOS sobre Apple silicon con llama.cpp instalado via `brew install llama.cpp`.
- Cabe en GPU de consumo: si, dado el tamano del encoder; no se especifican modelos concretos de GPU en la informacion disponible.
- Opciones de despliegue: `llama-server` de llama.cpp con `--embeddings --pooling none -c 4096 -b 4096 -ub 4096 -np 1 -fa on`, mas el cliente Python `macjev_gguf.py` con `numpy`, `tokenizers` y `safetensors`. Requiere Python 3.10 o superior.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MacJev-322M-4K-Laya-GGUF | 306.939.648 | 4096 | Encoder + cabeza de decision, eleccion forzada | apache-2.0 | GGUF + safetensors en Hugging Face |
| Laya multilingue (checkpoint base) | no disponible | 4096 (mismo presupuesto de entrada) | Encoder multilingue sin cabeza de decision especifica | no disponible | checkpoint de referencia en Hugging Face |
| JevStyle 2B v4 | no disponible | 8192 (API alojada; entradas de hasta 8000 tokens) | Modelo de decision de texto e imagenes, release recomendada | no disponible | pesos descargables via `jev-style`; API alojada |
| JevStyle 0.8B v3 | no disponible | no disponible | Modelo de decision de texto, la opcion mas pequena | no disponible | pesos descargables via `jev-style` |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de benchmarks de las alternativas mas alla de los resultados frente a Laya incluidos en la tabla anterior.

## Limitaciones y advertencias

- Modelo de decision, no generativo: no produce texto libre ni mantiene conversaciones; cualquier uso que requiera generacion necesita otro modelo.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- Ventana de contexto de 4096 tokens; entradas mas largas deben truncarse o dividirse.
- Es una release historica mantenida como archivo: el autor recomienda 2B v4 y 0.8B v3 como versiones actuales.
- Solo funciona con el runtime incluido en el repositorio; el paquete `jev-style` no carga estos pesos, lo que limita la integracion con el ecosistema actual del proyecto.
- Requiere servir el encoder con llama.cpp y ejecutar la cabeza por separado; no es un unico artefacto autocontenido como un GGUF generativo.
- La model card no documenta sesgos conocidos ni datos de entrenamiento; el riesgo de alucinacion no aplica en el sentido generativo, pero si el de decisiones erroneas con alta confianza en dominios fuera de distribucion.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del checkpoint base Laya y de las dependencias del runtime.
- No hay afiliacion ni respaldo de TypeSafe segun la model card; las rutas de ejecucion alojadas y las que simulan decisiones con otro modelo son vias separadas.
- No se han publicado latencias ni throughput, por lo que la planificacion de produccion requiere medicion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chaoliangUNSW/MacJev-322M-4K-Laya-GGUF
- Modelo base: https://huggingface.co/chaoliangUNSW/MacJev-322M-4K-Laya
- Pagina de modelos JevStyle: https://jevstyle.com/models/
- Guia de instalacion y verificacion local: https://jevstyle.com/guides/run-locally/
- Guia de clasificacion de texto en Python: https://jevstyle.com/guides/local-text-classification/
- Guia de routing local y Apple silicon: https://jevstyle.com/guides/local-decision-models/
- Casos de uso de decisiones si/no con vision local: https://jevstyle.com/use-cases/local-vision-decisions/
- Benchmark de routing bancario: https://jevstyle.com/benchmarks/banking-routing/
- Estado del servicio alojado: https://jevstyle.com/api/#service-status
- Health check de la API: https://api.jevstyle.com/healthz
- llama.cpp (releases): https://github.com/ggml-org/llama.cpp/releases
