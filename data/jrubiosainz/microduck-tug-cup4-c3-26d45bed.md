# jrubiosainz/microduck-tug-cup4-c3-26d45bed

## Resumen

`microduck-tug-cup4-c3-26d45bed` es una política de control para robótica publicada en Hugging Face por el usuario `jrubiosainz`, etiquetada con el pipeline `robotics` y la librería `microduck`. No es un modelo de lenguaje: es una política de inferencia pensada exclusivamente para simulación dentro de "Microduck Arena Tug of War", un entorno competitivo de tira y afloja (tug of war) entre agentes. El artefacto se distribuye como grafo ONNX con tablas de consulta (lookup tables) y una red de respaldo (*fallback network*) que solo se activa cuando ninguna fila de las tablas coincide con la observación recibida.

El modelo es el resultado de una cadena de fusión (*merge*) de cinco políticas previas: `tug-cup3-tn1-e5005d50`, `tug-cup3-p10g-3a94031b`, `GinDuck/microduck-tug-norris-p10c`, `tug-cup3-h9-29a9ef4a` y `SSH111111/microduck-tug-p10`. Técnicamente, parte de la entrada `tug-cup3-tn1-e5005d50` y desplaza únicamente dos inicializadores de su red de respaldo: la media del normalizador de observaciones (61 valores) y el sesgo de la última capa (14 valores). El grafo, todas las tablas de consulta y el resto de inicializadores permanecen idénticos a los del modelo base.

Su relevancia es acotada y muy específica: demuestra una técnica de ajuste fino por desplazamiento de inicializadores mediante búsquedas CMA-ES sobre enfrentamientos directos contra entradas públicas fijadas, conservando la reproducibilidad bit a bit del comportamiento original en los semillas donde las tablas coinciden. El tamaño del repositorio es de 0.0 GB y la política exacta tiene un SHA-256 declarado de `26d45bed1f5b7be390c1df6a1abd96ca48ec62a331eb2fe47debc5d91678890a` con 1045628 bytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con tablas de consulta (lookup tables) sobre observación cruda y red de respaldo con normalizador de observaciones y capa de salida |
| Parametros totales | no disponible (el artefacto de política pesa 1045628 bytes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible; la model card declara explícitamente "No blanket licence is asserted" |
| Formato de pesos | ONNX (librería `microduck`) |

## Arquitectura y entrenamiento

La política combina dos mecanismos de decisión. El primero son tablas de consulta que leen la observación cruda y devuelven una acción cuando existe una fila coincidente; esto garantiza que, en los casos cubiertos por las tablas, el comportamiento sea determinista e idéntico al de la política de origen. El segundo es una red de respaldo que solo actúa cuando ninguna fila coincide, y que en esta entrada se ha modificado respecto a `tug-cup3-tn1-e5005d50` desplazando la media del normalizador de observaciones (61 valores) y el sesgo de la última capa (14 valores).

No se documenta un proceso de entrenamiento en el sentido habitual (no hay número de tokens, composición de dataset ni RLHF/DPO). Los desplazamientos de los inicializadores provienen de búsquedas CMA-ES realizadas por el autor sobre enfrentamientos directos contra entradas públicas fijadas de Tug y contra variantes propias con offset de H9. Los valores concretos se recogen en `CUP4-offsets.json` y los créditos en `NOTICE`. La entrada base `tug-cup3-tn1-e5005d50` es a su vez `tug-cup3-p10g-3a94031b` con las filas de consulta de `TN1-table-patch.json`, procedentes de `GinDuck/microduck-tug-norris-p10c`.

## Capacidades

- Generación de acciones de control para el entorno de simulación "Microduck Arena Tug of War".
- Reproducción determinista bit a bit del comportamiento de `tug-cup3-tn1-e5005d50` en las cinco semillas del tablero público.
- Decisión por tabla de consulta sobre observación cruda cuando existe coincidencia de fila.
- Activación de red de respaldo con inicializadores desplazados cuando no hay coincidencia de fila.
- Ejecución en runtime ONNX mediante la librería `microduck`.
- Reproducibilidad verificada mediante replay local en x86 con el evaluador oficial, en dos procesos separados con resultado idéntico bit a bit.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento extendido: no es un modelo de lenguaje.

## Casos de uso

- Evaluación de políticas en competiciones de simulación: sirve como entrada en "Microduck Arena Tug of War", donde el evaluador oficial puntúa su rendimiento por semilla y cuenta los `pit_won`.
- Reproducción de resultados de referencia: al conservar las tablas del modelo base, permite replicar exactamente las trayectorias de `tug-cup3-tn1-e5005d50` en las semillas del tablero y auditar la consistencia del artefacto.
- Estudio de técnicas de ajuste por desplazamiento de inicializadores: el par de inicializadores modificados (media del normalizador y sesgo de la última capa) es un caso concreto y acotado para analizar cómo un cambio mínimo altera el comportamiento solo fuera de las regiones cubiertas por las tablas.
- Investigación en optimización CMA-ES aplicada a políticas de control: los offsets documentados en `CUP4-offsets.json` sirven como referencia reproducible de búsquedas sobre enfrentamientos directos.
- Validación de pipelines de replay determinista: el recibo `x86-replay-receipt.json` y la repetición en procesos separados con igualdad bit a bit son útiles para verificar infraestructura de evaluación.
- Análisis de linaje de modelos fusionados: la cadena de dependencias (P10G, TN1, Norris, H9, P10) permite estudiar cómo se componen políticas derivadas y qué artefactos intermedios se conservan (`TN1-*`, `H9-*`, `P10G-*`, `UPSTREAM-*`).

## Benchmarks y rendimiento

Resultados declarados por el autor en el tablero público, por semilla:

| Semilla | Esta entrada | tug-cup3-tn1-e5005d50 | GinDuck Tug Norris | H9 |
|---|---|---|---|---|
| 1 | 169.04293298721313 | 169.04293298721313 | 169.04293298721313 | 169.04293298721313 |
| 2 | 169.0845549106598 | 169.0845549106598 | 169.0845549106598 | 169.0845549106598 |
| 3 | 168.7562346458435 | 168.7562346458435 | 168.7562346458435 | 168.7562346458435 |
| 4 | 169.4589078426361 | 169.4589078426361 | 169.4589078426361 | 169.45884823799133 |
| 5 | 168.54866743087769 | 168.54866743087769 | 168.54861974716187 | 168.5486078262329 |

Replay local en x86 con el evaluador oficial (runner-5), dos procesos separados, resultado idéntico bit a bit: **168.97825956344604** (`0x1.51f4de7000000p+7`), con cinco `pit_won`. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no aplican por tratarse de una política de control.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto de política ocupa 1045628 bytes, por lo que la huella de memoria es mínima y no requiere GPU dedicada.
- GPU recomendadas: no se especifican; el replay documentado se realizó en un host x86 con el evaluador oficial, sin mención de aceleración por GPU.
- Cabe en cualquier GPU de consumo y presumiblemente en CPU; no se detalla una lista concreta de modelos compatibles.
- Opciones de despliegue: runtime ONNX a través de la librería `microduck`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de artefacto).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Resultado en tablero (semilla 5) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-tug-cup4-c3-26d45bed (esta entrada) | Política ONNX con tablas + fallback | no disponible (1045628 bytes) | no aplica | 168.54866743087769 | no disponible | Hugging Face |
| jrubiosainz/microduck-tug-cup3-tn1-e5005d50 | Política ONNX (base directa) | no disponible | no aplica | 168.54866743087769 | no disponible | Hugging Face |
| GinDuck/microduck-tug-norris-p10c | Política ONNX (fuente de tablas) | no disponible | no aplica | 168.54861974716187 | no disponible | Hugging Face |
| jrubiosainz/microduck-tug-cup3-h9-29a9ef4a | Política ONNX | no disponible | no aplica | 168.5486078262329 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Solo para simulación: la model card declara explícitamente "Simulation only"; no está validada para uso en robots físicos.
- Licencia no disponible: el autor afirma "No blanket licence is asserted", por lo que no se garantiza ningún derecho de uso comercial ni de redistribución.
- Comportamiento dependiente de las tablas: fuera de las filas cubiertas por las lookup tables, actúa la red de respaldo con inicializadores desplazados, cuyo comportamiento no está caracterizado en la información disponible.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no aplica (no es un modelo generativo de lenguaje); el riesgo equivalente es una acción no validada en regiones no cubiertas por las tablas.
- Limitaciones de contexto e idioma: no aplica; la política consume observaciones del entorno, no texto.
- Dependencia de linaje: hereda el comportamiento y las limitaciones de `tug-cup3-tn1-e5005d50`, `tug-cup3-p10g-3a94031b`, `GinDuck/microduck-tug-norris-p10c`, `tug-cup3-h9-29a9ef4a` y `SSH111111/microduck-tug-p10`.
- Reproducibilidad ligada al entorno: los resultados bit a bit se verificaron en un host x86 con runner-5 y el evaluador oficial; otros entornos pueden no reproducir exactamente los mismos valores.
- Cero adopción registrada: 0 descargas y 0 likes en el momento de la consulta, sin validación externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-tug-cup4-c3-26d45bed
- Modelo base directo: https://huggingface.co/jrubiosainz/microduck-tug-cup3-tn1-e5005d50
- Modelo base P10G: https://huggingface.co/jrubiosainz/microduck-tug-cup3-p10g-3a94031b
- Modelo base H9: https://huggingface.co/jrubiosainz/microduck-tug-cup3-h9-29a9ef4a
- Fuente de las tablas TN1: https://huggingface.co/GinDuck/microduck-tug-norris-p10c
- Modelo base P10: https://huggingface.co/SSH111111/microduck-tug-p10
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
