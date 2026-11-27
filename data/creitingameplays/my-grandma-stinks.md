# CreitinGameplays/my-grandma-stinks

## Resumen

`my-grandma-stinks` es un repositorio publicado en Hugging Face por el usuario CreitinGameplays que declara 39.560.400.000.000.000 parámetros (39,5604 cuatrillones), lo que lo situaría como el modelo con mayor recuento de parámetros del Hub. Sin embargo, la propia model card reconoce de forma explícita que se trata de un artefacto vacío: los pesos reales subidos ocupan aproximadamente 1,03 MB, compuestos por ceros (`0x00`), una cabecera JSON de 128 bytes e índices de fragmentos para que el sistema Xet no rechazara la subida con un error 413.

No existe arquitectura, entrenamiento ni capacidad funcional alguna. El repositorio se enmarca en una competición informal entre publicaciones satíricas del Hub (`tsfrm/vacuum-16t`, `VickM/leviathan-19t`, `Solenopsisbot/nullnet-19.98q`, `yeths/The-Quettamind`) que compiten por declarar el mayor número de parámetros sin contenido real. Resulta relevante únicamente como caso de estudio sobre integridad de metadatos en Hugging Face, sobre cómo el campo `safetensors` puede declarar recuentos arbitrarios y sobre los mecanismos de almacenamiento deduplicado (Xet) que permiten alojar repositorios de 499,5 GB lógicos con una huella real de ~1 MB.

La ficha se redacta con fines de documentación técnica del artefacto; no debe interpretarse como un modelo utilizable para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el autor no define arquitectura; tag `nullnet`) |
| Parametros totales | 39.560.400.000.000.000 declarados (39,5604 Q); pesos reales ~1,03 MB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Tag `8-bit` y `compressed-tensors`; sin pesos reales que cuantizar |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (cabecera con recuento declarado), almacenamiento Xet |
| Tamano del repo | 499,5 GB logicos; ~1,03 MB reales subidos |
| Shards | 9.900 fragmentos declarados |
| Entropia real de los pesos | ~0,0000000002 % (mayoria `0x00`) |
| Fecha de creacion | 2026-11-27 |
| Ultima actualizacion | 2026-11-27 |

## Arquitectura y entrenamiento

No hay arquitectura definida. El autor etiqueta el repositorio con `nullnet`, un término sin definición técnica publicada, y no describe capas, atención, tokenizador ni configuración de transformer, MoE, SSM o híbrida. El contenido de los ficheros de pesos son ceros binarios más una cabecera JSON de 128 bytes y metadatos de fragmentación.

El entrenamiento es nulo por declaración explícita del autor: 0 tokens de preentrenamiento, dataset compuesto por `b"\x00"` combinado con `struct.pack("<Q", k)`, sin RLHF, DPO ni ajuste supervisado. La model card cuantifica el coste energético como "una pestaña del navegador y 3 minutos de hash SHA-256 en CPU". No hay innovación técnica alguna: el único mecanismo relevante es el uso de Xet para generar copias en servidor de un Xorb sintetizado y evitar límites de tamaño de subida.

## Capacidades

- Generación de texto: no disponible; no hay pesos que ejecutar.
- Razonamiento, código, matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (solo declara `en`).
- Visión, audio, thinking mode: no disponible.
- Capacidad efectiva: actuar como artefacto de prueba para validar el pipeline de descarga, el parseo de cabeceras `safetensors` y los límites de Xet.

## Casos de uso

- Prueba de integridad de pipelines de descarga: usar el repositorio para verificar que un cliente (por ejemplo, `huggingface_hub`) maneja correctamente cabeceras `safetensors` con recuentos de parámetros absurdos sin desbordar contadores de 64 bits.
- Validación de sistemas de almacenamiento deduplicado: comprobar cómo Xet reconstruye 499,5 GB lógicos a partir de ~1 MB reales, útil para diseñar políticas de cuotas en mirrors corporativos.
- Test de herramientas de escaneo de seguridad de la cadena de suministro: evaluar si los escáneres de modelos (pickles, safetensors malformados, shards vacíos) detectan artefactos sin contenido real.
- Formación y concienciación: material didáctico sobre por qué el recuento de parámetros declarado en el Hub no es una medida fiable de capacidad sin inspección de pesos.
- Pruebas de robustez de visores de model cards: verificar el renderizado de tablas comparativas con datos ficticios y de avisos `[!NOTE]`.
- Benchmarking de rate limits y reintentos: simular la descarga de 9.900 shards para medir el comportamiento de clientes HTTP ante repositorios con muchos ficheros pequeños.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la propia model card, con precisión `float0` y batch size 0. Reflejan 0,0 en todas las tareas funcionales y 100,0 en una métrica satírica ("Being Huge On The Hub"). Se reproducen por fidelidad documental, no como indicativo de capacidad.

| Benchmark | Fable 5 | Opus 5 | GPT 5.6 | Kimi K3 | The Quettamind | my-grandma-stinks |
|---|---|---|---|---|---|---|
| Terminal Bench 2.1 | 88,0 | 89,1 | 88,8 | 86,6 | 0,0 | 0,0 |
| NL2Repo | 63,0 | 65,0 | 63,0 | 55,9 | 0,0 | 0,0 |
| CyberGym | 83,1 | 84,0 | 84,5 | 79,0 | 0,0 | 0,0 |
| DeepSWE | 70,0 | 74,0 | 73,0 | 56,6 | 0,0 | 0,0 |
| Toolathlon-Verified | 77,9 | 80,6 | 74,9 | 72,5 | 0,0 | 0,0 |
| Agents' Last Exam | 25,7 | 28,1 | 30,6 | 27,0 | 0,0 | 0,0 |
| AutomationBench Public | 29,1 | 26,0 | 29,7 | 27,3 | 0,0 | 0,0 |
| DSBench-FullStack | 75,5 | 79,8 | 81,3 | 72,8 | 0,0 | 0,0 |
| DSBench-Hard | 70,8 | 73,8 | 74,2 | 66,8 | 0,0 | 0,0 |
| Being Huge On The Hub | — | — | — | — | 99,1 | 100,0 |

No se han publicado resultados de benchmarks reales en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: 0 bytes según el autor; no hay pesos ejecutables. Cargar el repositorio completo en memoria requeriría ~499,5 GB de almacenamiento, pero los tensores son ceros sin semántica.
- GPU recomendadas: ninguna; no es desplegable.
- Consumer GPU: irrelevante; no hay modelo que ejecutar en RTX 4090, RTX 3090 ni similares.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI no pueden cargar este repositorio como modelo funcional.
- Latencia y throughput: no disponibles; no aplicables.
- Almacenamiento: planificar ~499,5 GB de cuota lógica en mirrors que no dedupliquen, o ~1 MB si el backend soporta Xet.

## Comparativa con modelos similares

| Repositorio | Parametros declarados | Inteligencia real (según autor) | Licencia | Disponibilidad |
|---|---|---|---|---|
| `tsfrm/vacuum-16t` | 16,501 T | Ninguna | No disponible | Hugging Face |
| `VickM/leviathan-19t` | 18,997 T | Ninguna | No disponible | Hugging Face |
| `Solenopsisbot/nullnet-19.98q` | 19,98 Q | Ninguna | No disponible | Hugging Face |
| `yeths/The-Quettamind` | 39,2 Q | Ninguna | No disponible | Hugging Face |
| `CreitinGameplays/my-grandma-stinks` | 39,5604 Q | Ninguna (solo más grande) | MIT | Hugging Face |

Frente a modelos reales de la misma categoría funcional (asistentes de código o agentes), la comparación no procede: no hay pesos ni tokenizador. Los nombres de la columna comparativa de la model card (Fable 5, Opus 5, GPT 5.6, Kimi K3, Qwen 3.8 Max) son referencias ficticias o no verificables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo funcional: los pesos son ceros; cualquier intento de inferencia fallará o producirá salida degenerada.
- El recuento de 39,5604 Q parámetros es una declaración de cabecera, no una medición; no debe citarse como dato técnico real.
- Riesgo de confusión en índices y agregadores que ordenan modelos por número de parámetros declarados.
- La licencia MIT se aplica al artefacto, pero no otorga derechos sobre capacidades inexistentes; su uso comercial no tiene sentido práctico.
- El repositorio puede consumir cuota de almacenamiento en mirrors que no dedupliquen (499,5 GB lógicos).
- La model card incluye lenguaje soez y contenido satírico; no es apta como documentación de referencia sin contextualización.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque no hay modelo que evaluar.
- El tag `benchmark` y `compressed-tensors` puede inducir a herramientas automáticas a clasificarlo erróneamente como modelo evaluado o cuantizado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CreitinGameplays/my-grandma-stinks
- Repositorio comparativo `yeths/The-Quettamind`: https://huggingface.co/yeths/The-Quettamind
- Repositorio comparativo `Solenopsisbot/nullnet-19.98q`: https://huggingface.co/Solenopsisbot/nullnet-19.98q
- Repositorio comparativo `tsfrm/vacuum-16t`: https://huggingface.co/tsfrm/vacuum-16t
- Repositorio comparativo `VickM/leviathan-19t`: https://huggingface.co/VickM/leviathan-19t
- Documentación de Xet en Hugging Face: https://huggingface.co/docs/hub/xet
- Documentación del formato safetensors: https://huggingface.co/docs/safetensors
