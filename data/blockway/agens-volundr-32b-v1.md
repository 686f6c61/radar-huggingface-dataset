# Blockway/Agens-Volundr-32B-v1

## Resumen

Agens Volundr 32B v1 es un modelo multimodal de pesos abiertos (entrada de texto e imagen) publicado por Blockway, la empresa detrás del agente Agens. Con 32.688.700.242 parámetros, es la versión final del checkpoint Preview anunciado el 2026-10-05: misma arquitectura, preentrenamiento continuado hasta el paso 20.000 y un postentrenamiento orientado específicamente a sesiones de agente largas. Está pensado para código, razonamiento y flujos agénticos con llamadas a herramientas.

La arquitectura es un transformer híbrido de 72 capas que combina atención lineal y atención dispersa, de modo que solo 18 capas mantienen caché KV. Esa decisión mantiene el coste del contexto largo bajo: según el autor, una entrada de 131K tokens cabe en una única GPU de 48 GB con el build INT4 (24,6 GB), y el build Engine-16GB sostiene 262K tokens dentro de un límite de 16 GiB. El modelo incorpora además un mecanismo de contexto denominado Engram y un modo de razonamiento con presupuesto acotado por paso.

Su relevancia actual está en dos frentes: el rendimiento declarado en código competitivo y matemáticas de competición (LiveCodeBench v6 67,9; AIME 2025 80,0), por delante del Qwen3.8-27B en la comparativa del propio autor, y las optimizaciones de servicio (continuación de sesión, decodificación especulativa con el drafter DFlash2). Habla inglés, chino y cantonés, se distribuye con licencia Apache 2.0 y requiere cargar código propio del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y atención dispersa (sparse); 72 capas, de las cuales solo 18 conservan caché KV; contexto "Engram" para la continuación de sesión |
| Parámetros totales | 32.688.700.242 (≈32,7 B) |
| Parámetros activos | No aplica: no se declara arquitectura MoE |
| Longitud de contexto | 131K tokens en el build INT4 sobre una GPU de 48 GB; hasta 262K tokens en el build Engine-16GB según el autor; presupuesto de razonamiento configurable (pensamiento acotado, con límite de 32K por paso en la versión Preview) |
| Tipos de cuantización | INT4 (build oficial citado por el autor); pesos publicados en safetensors; no se detallan GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (en), chino simplificado y tradicional (zh) y cantonés (yue) |
| Licencia | Apache 2.0 (pesos); Agens Engine bajo MIT |
| Formato de pesos | safetensors con código propio (`custom_code`; requiere `trust_remote_code`) |

Otros datos: repositorio de 65,4 GB, pipeline `image-text-to-text`, 211 descargas y 12 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo parte de un transformer de 72 capas que mezcla atención lineal y atención dispersa. La consecuencia práctica es que únicamente 18 capas mantienen caché KV, lo que reduce el coste de memoria del contexto largo y, según el autor, mantiene la velocidad de decodificación plana entre 1K y 128K tokens. Sobre esa base se añade el mecanismo Engram: el build de servicio conserva el estado de atención lineal y el contexto Engram del prefijo cacheado para reutilizarlos en la siguiente petición, lo que habilita la "continuación de sesión" (el prefijo se procesa una vez y cada turno posterior solo computa los mensajes nuevos; los turnos de seguimiento son 2,9 veces más rápidos, con 1,6 s de mediana usando el drafter). El modelo acepta imágenes además de texto, y expone tokens de control y plantilla de chat propias, con `high` aceptado como alias de `xhigh`.

El entrenamiento consta de un preentrenamiento continuado hasta el checkpoint final (20.000 pasos; el Preview se publicó en el paso 1.000) y un postentrenamiento en dos fases: ajuste supervisado sobre trayectorias de agente multiturno y, después, optimización de preferencias con pares anti-repetición extraídos de sesiones del propio modelo. A esto se suma una preferencia de longitud ("responder y parar") entrenada con pares tomados de estados reales de agente, que en v1 reduce la mediana a 120 tokens por paso y el máximo a 12K, sin ningún paso que alcance los 16K. El número de tokens de preentrenamiento y la composición del dataset no se detallan en la información disponible. Para decodificación especulativa se publica por separado el drafter DFlash2, reentrenado sobre los pesos de v1 (debe usarse este, no el del Preview).

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento y presupuesto acotado por paso (etiquetas `high`/`xhigh` en la plantilla de chat).
- Código: finalización, código competitivo y tareas de resolución de issues en repositorios (SWE-bench).
- Matemáticas: aritmética de competición y razonamiento simbólico (MATH-500, AIME 2025).
- Razonamiento científico de nivel experto (GPQA Diamond).
- Seguimiento de instrucciones estricto (IFEval en modo prompt strict).
- Llamada a herramientas y uso de herramientas multiturno (τ²-bench en dominios de aerolínea, retail y telecom).
- Capacidad de decidir cuándo *no* invocar una herramienta en entornos agénticos.
- Entrada de imágenes junto a texto (pipeline `image-text-to-text`).
- Multilingüe en inglés, chino simplificado/tradicional y cantonés.
- Continuación de sesión para agentes de larga duración: reutilización del prefijo cacheado entre turnos.
- Control de repetición en sesiones largas (0 de 50 tareas con bucles de repetición en SWE-bench, frente a 36 de 50 en el Preview).

## Casos de uso

- Agentes de resolución de incidencias en repositorios: el modelo está entrenado sobre trayectorias multiturno y declara 54 % de resolución en 50 tareas de SWE-bench Verified, con una mediana de 82 minutos por tarea; encaja en pipelines que abren una rama, editan ficheros y ejecutan tests dentro de un bucle controlado.
- Asistentes de código en IDE con contexto de repositorio grande: los 131K tokens en una sola GPU de 48 GB permiten enviar varios ficheros y trazas de error en una misma petición sin recurrir a recuperación externa.
- Automatización de atención al cliente con herramientas: τ²-bench cubre los dominio de aerolínea, retail y telecom, y el modelo incorpora la decisión de no llamar a una herramienta cuando es irrelevante, lo que evita invocaciones espurias en flujos de reservas o devoluciones.
- Agentes de larga duración con muchos turnos: la continuación de sesión evita reprocesar el historial completo en cada turno (2,9 veces más rápido en seguimientos), lo que abarata asistentes que mantienen una conversación durante horas.
- Generación de código estructurado en producción: con el drafter DFlash2 alcanza hasta 125 tok/s en salida estructurada sobre una GPU de 48 GB, adecuado para rellenar JSON, parches o configuraciones dentro de un servicio con latencia exigente.
- Análisis de documentos con imágenes: al aceptar entrada image-text-to-text puede procesar capturas, diagramas o tablas escaneadas junto a instrucciones textuales, por ejemplo para extraer datos de facturas o revisar interfaces.
- Tutoría y verificación matemática: con 96,8 en MATH-500 y 80,0 en AIME 2025 puede usarse para generar soluciones paso a paso y para comprobar razonamientos en entornos educativos, controlando el presupuesto de pensamiento.
- Despliegue en hardware modesto: con Agens Engine (MIT) y el build Engine-16GB mantiene 262K tokens de contexto en 16 GiB a 86-150 tok/s con drafter, lo que habilita prototipos en una única GPU de gama media.

## Benchmarks y rendimiento

Todos los resultados son declarados por el autor (`verified: false`), medidos con el mismo harness y ajustes para cada modelo. El propio autor indica que son la mejor de varias ejecuciones.

| Benchmark | Volundr 32B v1 | Volundr 32B Preview | Qwen3.8-27B | Agens Pilot |
|---|---|---|---|---|
| LiveCodeBench v6 (2025-02 a 2025-05), pass@1, mejor de 2 | 67,9 | 63,4 | 59,5 | 60,3 |
| HumanEval, pass@1 greedy | 78,7 | 81,7 | 77,4 | 80,5 |
| SWE-bench Verified, 50 tareas (harness Codeway) | 54,0 | 44,0 | 58,0 | 64,0 |
| AIME 2025, avg@4, mejor de 2 | 80,0 | 76,7 | no disponible | no disponible |
| MATH-500, accuracy | 96,8 | no disponible | no disponible | no disponible |
| GPQA Diamond, accuracy, mejor de 4 (presupuesto 6K, cierre forzado) | 80,3 | no disponible | no disponible | no disponible |
| IFEval (prompt strict) | 87,2 | no disponible | no disponible | no disponible |
| MMLU-Pro (subconjunto estratificado de 1.400 preguntas) | 80,0 | no disponible | no disponible | no disponible |
| τ²-bench (airline, retail, telecom), pass rate | 76,7 | no disponible | no disponible | no disponible |

Datos adicionales aportados en la model card: SWE-bench Verified mini pasó de 22 a 27 tareas resueltas de 50 entre Preview y v1; τ²-bench de 89 a 92 de 120 (76,7 %). La comparativa con BFCL v4 aparece truncada en la información disponible, sin valor numérico.

## Requisitos de hardware

- Pesos completos en safetensors: 65,4 GB de repositorio, por lo que la carga sin cuantizar requiere del orden de 65 GB solo para pesos, más estado de atención y activaciones; en la práctica, una H100 80 GB o dos A100 40 GB.
- Build INT4: 24,6 GB de pesos, lo que permite un contexto de 131K tokens en una única GPU de 48 GB (A6000, L40S, A100 40 GB con margen ajustado, RTX 6000 Ada).
- Build Engine-16GB (Agens Engine, licencia MIT): mantiene 262K tokens de contexto dentro de un límite de 16 GiB, es decir, cabe en GPUs de consumo como una RTX 4080/4090 o una RTX 4060 Ti de 16 GB.
- Throughput declarado: hasta 125 tok/s en salida estructurada con el drafter DFlash2 en una GPU de 48 GB y 76 tok/s en una pareja de 48 GB, hasta 3,0 veces por encima de la decodificación simple; la velocidad se mantiene plana entre 1K y 128K de contexto.
- Continuación de sesión: los turnos de seguimiento tienen una mediana de 1,6 s con el drafter (2,9 veces más rápidos que reprocesar el prefijo).
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, y Agens Engine para los builds INT4 y de 16 GB. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- El drafter DFlash2 se publica por separado y está reentrenado para v1: es necesario para las cifras de velocidad anteriores.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Código / agentes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agens Volundr 32B v1 | 32,7 B (denso, híbrido lineal+sparse) | 131K (hasta 262K en Engine-16GB) | LiveCodeBench v6 67,9; SWE-bench 54,0; τ²-bench 76,7 | Apache 2.0 | Pesos en HuggingFace; runtime Agens Engine (MIT) |
| Agens Volundr 32B Preview | 32,7 B | Igual que v1 | LiveCodeBench v6 63,4; SWE-bench 44,0 | Apache 2.0 | Checkpoint previo (paso 1.000) |
| Qwen3.8-27B | 27 B aprox. (dato no detallado) | no disponible | LiveCodeBench v6 59,5; HumanEval 77,4; SWE-bench 58,0 | no disponible | Referenciado en la model card |
| Agens Pilot | no disponible | no disponible | LiveCodeBench v6 60,3; HumanEval 80,5; SWE-bench 64,0 | no disponible | Modelo de Blockway citado en la comparativa |

Lectura de la tabla: Volundr v1 gana en código competitivo (+8,4 sobre Qwen3.8-27B) y en matemáticas de competición (+6,7 sobre Qwen3.8-27B en AIME 2025), y pierde en resolución de issues reales (54,0 frente a 58,0 de Qwen3.8-27B y 64,0 de Agens Pilot) y en HumanEval frente a su propio Preview. No hay datos públicos de otros modelos comparables en la información disponible.

## Limitaciones y advertencias

- Todos los benchmarks son autodeclarados (`verified: false`) y algunos se midieron sobre subconjuntos reducidos: 50 tareas de SWE-bench Verified y 1.400 preguntas de MMLU-Pro. No hay evaluación independiente en la información disponible.
- El harness es el del propio autor ("Codeway harness", "mismo harness para cada fila"); la comparación con Qwen3.8-27B no es reproducible con los datos publicados.
- Cobertura lingüística limitada a inglés, chino y cantonés: no se declara soporte de español ni de otras lenguas europeas, lo que obliga a evaluar el comportamiento en castellano antes de usarlo en producción.
- Riesgo de alucinación no cuantificado: no se publican tasas de factualidad ni evaluaciones de calibración más allá de MMLU-Pro y GPQA.
- El modelo requiere `trust_remote_code=True`; hay que auditar el código del repositorio antes de ejecutarlo en entornos con datos sensibles.
- La continuación de sesión y el rendimiento con contexto largo dependen del estado de atención lineal y del contexto Engram que conserva el build de servicio: no está claro que estas ventajas se mantengan en stacks genéricos como vLLM o llama.cpp (no confirmados).
- Las cifras de velocidad (125 tok/s, 86-150 tok/s) dependen del drafter DFlash2 y de los builds específicos; sin él, el rendimiento baja hasta 3 veces.
- Historial de repeticiones: el Preview entraba en bucles en 36 de 50 tareas de SWE-bench; v1 declara 0 de 50, pero conviene monitorizar sesiones muy largas en producción.
- Licencia Apache 2.0 en los pesos y MIT en el runtime: permisivas para uso comercial, sin cláusulas de uso aceptable específicas en la información disponible.
- Riesgo de confusión de identidad: las búsquedas de "Blockway" devuelven mayoritariamente servicios de proxy homónimos (blockaway.net, blockaway.io) sin relación con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blockway/Agens-Volundr-32B-v1
- Sitio de Blockway: https://blockway.io/
- Los resultados de búsqueda web disponibles apuntan a servicios de proxy homónimos sin relación con el modelo: https://www.blockaway.net/ , https://www.blockaway.io/
- Paper, blog técnico, repositorio del drafter DFlash2 y demo: no disponible en la información proporcionada.
