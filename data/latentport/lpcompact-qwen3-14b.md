# latentport/LPCompact-Qwen3-14B

## Resumen

LPCompact-Qwen3-14B es un selector de compactación de memoria de atención entrenado por Simon P. Villani (latentport) para el modelo base Qwen/Qwen3-14B. No es un modelo de lenguaje completo: es un artefacto auxiliar, un checkpoint de 393.473 parámetros, que se integra en el runtime LatentPort para reducir el almacenamiento del KV-cache durante la inferencia de texto en BF16. Se expone a través de la API `state.compact()` y actúa puntuando los valores de atención en las capas 3, 15 y 31 del transformer base.

El problema que aborda es el coste de memoria del KV-cache en contextos largos. En lugar de truncar o comprimir de forma heurística, el selector aprende qué entradas históricas conservar, manteniendo las posiciones originales y el reloj lógico de continuación. LatentPort recoge las claves y valores seleccionados en las cuarenta capas de atención del modelo Qwen3-14B.

Su relevancia es acotada pero concreta: permite extender la longitud lógica total hasta 40.960 tokens con una ratio de compactación por defecto de 8, preservando las primeras y últimas 512 posiciones y con un suelo de 1.024 posiciones. La activación normal comienza a partir de 32.768 posiciones físicas, y la compactación es intrínsecamente con pérdida, por lo que su utilidad depende de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Selector de compactación de memoria de atención sobre transformer Qwen3-14B (puntúa capas 3, 15 y 31) |
| Parametros totales | 393.473 (selector); pesos del modelo base Qwen3-14B aparte |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 40.960 tokens de longitud lógica total (con compactación activa desde 32.768 posiciones físicas) |
| Tipos de cuantizacion | No disponible; la ruta cualificada es BF16 |
| Idiomas soportados | No disponible (heredados del modelo base Qwen3-14B) |
| Licencia | Apache-2.0 (selector y código LatentPort); los pesos base de Qwen conservan su licencia upstream |
| Formato de pesos | safetensors (`model.safetensors` para el selector; `config.json` con arquitectura, política y huellas de checkpoint) |

## Arquitectura y entrenamiento

El selector opera como un módulo de puntuación sobre las representaciones de atención del Qwen3-14B congelado en BF16. Extrae características y supervisión derivada de la atención en las capas 3, 15 y 31, y decide qué entradas históricas del KV-cache conservar. LatentPort agrega las claves y valores seleccionados en las cuarenta capas de atención, manteniendo las posiciones originales y el reloj lógico de continuación. La política preserva las primeras y últimas 512 posiciones con un suelo de 1.024 posiciones, y la ratio por defecto es 8 (ajustable a `ratio=4` para retener más memoria).

El entrenamiento se realizó en dos fases sobre el modelo base congelado. Una fase de calentamiento con etiquetas de registro usó 16 historias independientes de 16K y 256 actualizaciones AdamW. La fase de entrenamiento de utilidad empleó 32 historias adicionales de 4K, 8K, 16K y 32K, con 32 preguntas de estudio disjuntas por historia y 1.024 actualizaciones. Las etiquetas estiman el cambio en la salida en espacio de valores de una cabeza cuando se elimina una entrada histórica. El selector desplegado consume únicamente tensores de estado.

## Capacidades

- Compactación aprendida del KV-cache de Qwen3-14B mediante `state.compact()`.
- Puntuación de valores de atención en las capas 3, 15 y 31 del modelo base.
- Preservación de posiciones originales y del reloj lógico de continuación tras la compactación.
- Ratio de compactación configurable (por defecto 8; `ratio=4` retiene más memoria).
- Preservación de las primeras y últimas 512 posiciones, con suelo de 1.024 posiciones.
- Soporte de `append`, guardado/carga y bifurcación (`fork`) del estado compactado.
- Controles de capacidad a nivel de sesión para reservar espacio a más entrada.
- Inferencia de texto en BF16 de secuencia única como ruta cualificada.
- No incorpora capacidades generativas propias: hereda las del Qwen3-14B subyacente.

## Casos de uso

- Recuperación de hechos en conversaciones largas: con `history` fijado al contexto a retener, el selector conserva entradas relevantes y permite preguntar por datos como un nombre en clave tras decenas de miles de tokens, reduciendo el KV-cache a 1/8.
- Búsqueda de funciones en repositorios de código: en el panel de evaluación, la tarea de búsqueda de funciones de repositorio retuvo 23/32 aciertos con compactación 8× frente a 32/32 con memoria completa, útil para asistentes de código con historiales extensos.
- Consulta de decisiones recientes: la tarea "latest decision" obtuvo 18/32 con compactación frente a 32/32 con memoria completa, adecuada para agentes que deben recordar la última decisión de una sesión larga.
- Búsqueda de registros estructurados: 25/32 con compactación frente a 26/32 con memoria completa, escenario de extracción de campos en documentos largos donde la compactación apenas degrada.
- Búsqueda documental de dos saltos: 8/32 con compactación frente a 9/32 con memoria completa, para pipelines de pregunta-respuesta sobre documentación extensa con razonamiento multi-salto.
- Sesiones con bifurcación de estado: el soporte de `fork` y guardado/carga permite explorar varias continuaciones desde un mismo contexto compactado sin recalcular el prefill.
- Despliegue con restricciones de VRAM: al reducir el almacenamiento de atención, permite mantener contextos de hasta 40.960 tokens lógicos en GPUs con memoria limitada, siempre que se acepte la pérdida de calidad asociada.

## Benchmarks y rendimiento

Datos de la model card, sobre tareas sintéticas de recuperación con decodificación greedy (una semilla de entrenamiento; una respuesta es correcta solo si produce todos los tokens canónicos y un token de parada válido):

| Tokens de historial | Memoria completa | Compactación 8× | Respuestas de memoria completa retenidas |
| ---: | ---: | ---: | ---: |
| 16.384 | 44/64 | 24/64 | 21/44 |
| 32.768 | 55/64 | 50/64 | 50/55 |

| Tarea (ambas longitudes combinadas) | Memoria completa | Compactación 8× | Perdidas tras compactar | Ganadas tras compactar |
| --- | ---: | ---: | ---: | ---: |
| Búsqueda de funciones de repositorio | 32/32 | 23/32 | 9 | 0 |
| Última decisión | 32/32 | 18/32 | 14 | 0 |
| Búsqueda de registro estructurado | 26/32 | 25/32 | 3 | 2 |
| Búsqueda documental de dos saltos | 9/32 | 8/32 | 2 | 1 |

El panel de 16K fuerza deliberadamente la compactación por debajo del umbral de activación de la versión, y su pérdida de respuestas es la razón por la que la activación normal comienza en 32K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el selector añade 393.473 parámetros, mientras que el coste dominante es el Qwen3-14B en BF16 más el KV-cache compactado.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el Qwen3-14B en BF16 requiere memoria considerable y la ruta cualificada exige CUDA PyTorch.
- Opciones de despliegue: runtime LatentPort 0.4.7 o superior, Python 3.11+, PyTorch con CUDA y dependencias del backend BF16. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Restricción de ruta: inferencia de texto en BF16 de secuencia única con checkpoint fijado y ajustes de posición nativos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LPCompact-Qwen3-14B | 393.473 (selector) + Qwen3-14B | Hasta 40.960 tokens lógicos | Compactación aprendida de KV-cache | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen3-14B (base) | 14B | Contexto nativo del base | Modelo de lenguaje completo | Licencia upstream de Qwen | Hugging Face |
| Alternativas de compresión de KV-cache | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otras técnicas de compresión de KV-cache en la información proporcionada.

## Limitaciones y advertencias

- La compactación es con pérdida y depende de la tarea; en el panel de 16K la retención cae a 21/44 respuestas correctas de memoria completa.
- Reduce el almacenamiento de KV de atención, no los pesos del modelo base ni toda la memoria de trabajo pico.
- Un origen compactado no puede pasarse actualmente a un bridge.
- La calidad medida en un modelo, backend o panel de tareas no debe asumirse para otro.
- Los resultados provienen de una sola semilla de entrenamiento y de tareas sintéticas de recuperación.
- Las respuestas exactas dependen del modelo base y del historial.
- La ruta cualificada es solo BF16, secuencia única, con checkpoint fijado y ajustes de posición nativos.
- Licencia Apache-2.0 para selector y código; los pesos base de Qwen y las dependencias del runtime conservan sus licencias upstream, que deben revisarse para uso comercial.
- Riesgo de alucinación y sesgos: no documentados específicamente para el selector; heredados del Qwen3-14B subyacente.
- Idiomas soportados: no disponibles en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/latentport/LPCompact-Qwen3-14B
- GitHub: https://github.com/LatentPort/latentport
- PyPI: https://pypi.org/project/latentport/
- Guía de instalación: https://github.com/LatentPort/latentport/blob/main/docs/installation.md
- API: https://github.com/LatentPort/latentport/blob/main/docs/api.md
- Perfil del autor: https://au.linkedin.com/in/simon-villani
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
