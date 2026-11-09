# ken-jo/QEV-0.8B-compact

## Resumen

QEV-0.8B-compact es un modelo de decisión multimodal desarrollado por ken-jo, una versión podada de QEV-0.8B v3 orientada a entornos con memoria limitada. A diferencia de un modelo generativo convencional, no produce tokens: recibe evidencia (texto e imágenes) y una lista de opciones candidatas, y devuelve en un único forward pass una probabilidad calibrada para cada opción, una respuesta tipada y un flag de abstención independiente. Está pensado para tareas de clasificación zero-shot y selección entre alternativas.

El modelo conserva el codificador visual y el proyector de QEV-0.8B v3 (encoder Qwen3.5 congelado) e incorpora únicamente los bloques 1 a 16 de los 24 del language model original, además de la normalización final. El vocabulario de entrada se recorta de 248.320 a 32.768 filas, manteniendo todos los tokens especiales y de byte. El resultado son 466.313.408 parámetros, el 55% del modelo base, con un peso en repositorio de 0,9 GB.

Su relevancia actual reside en la eficiencia: según las mediciones del autor, iguala prácticamente el rendimiento de su predecesor (52,46 frente a 52,70 en el índice público de visión de JEV Decision Index) con la mitad de parámetros, menor latencia y menor consumo de VRAM. La licencia Apache 2.0 y el formato de checkpoint con backbone empaquetado y verificación SHA-256 facilitan su despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con poda de capas (encoder visual Qwen3.5 congelado + bloques 1-16 de 24 del LM + cabeza de decisión condicionada de rango 64) |
| Parametros totales | 466.313.408 (55% de QEV-0.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens de entrada; hasta 4 imágenes de 1.638.400 píxeles cada una |
| Tipos de cuantizacion | no disponible (solo se documenta bf16 para las mediciones) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con backbone empaquetado (format_version 3, verificación SHA-256 por fichero) |

## Arquitectura y entrenamiento

La arquitectura parte de QEV-0.8B v3: un encoder visual Qwen3.5 congelado con su proyector, un language model transformer y una cabeza de lectura de decisión. En esta variante compacta se eliminan los bloques 17 a 24 del LM y se conservan los bloques 1 a 16 más la normalización final, a partir de los pesos fusionados del modelo v3. Un sondeo de profundidad del autor determinó que la decisión queda completa tras el bloque 16, por lo que las capas eliminadas no aportan información a la salida. El vocabulario de entrada se reduce a 32.768 filas (todos los tokens generados en los prompts de entrenamiento y desarrollo, todos los especiales y de byte, y los merges necesarios), con un tokenizador de byte-fallback reescrito y un fichero `vocab-map.json`.

La cabeza de lectura del bloque 16 (cuatro slots de razonamiento, una vista de decisión y una cabeza de binding condicionada de rango 64) se destila desde la cabeza de profundidad completa sobre las preguntas de entrenamiento y se selecciona únicamente con datos de desarrollo. Las temperaturas y umbrales de abstención se reajustaron para este paquete sobre las 3.000 filas del Calibration DEV de release, con el mismo procedimiento que v3: en mitades disjuntas por grupo, la temperatura minimiza la NLL en una mitad y el umbral de abstención en la otra toma la mayor cobertura con un error empírico máximo del 15% y al menos 20 ejemplos aceptados. No se usó ninguna fila del suite público ni del holdout. El modelo solo ofrece el modo `accurate`; el modo `fast` no está disponible.

## Capacidades

- Decisión tipada sobre opciones dadas: devuelve una probabilidad calibrada por opción, una respuesta tipada y un flag de abstención separado en un único forward pass, sin generación de tokens.
- Clasificación zero-shot (pipeline declarado: `zero-shot-classification`).
- Procesamiento multimodal: acepta texto y hasta cuatro imágenes por petición, a resolución completa de hasta 1.638.400 píxeles por imagen.
- Probabilidades calibradas con temperaturas específicas por tipo de decisión (choice, score, noul) y umbrales de abstención ajustados.
- Tres tipos de salida documentados: `choice` (selección entre opciones), `score` (puntuación) y `noul` (sin opciones, con abstención).
- Extracción de campos en documentos (KIE) y selección de elementos de interfaz para agentes.
- Verificaciones de sí/no y comprobaciones binarias.
- No soporta tool calling, agentes multi-paso ni generación libre de texto.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Selección entre candidatos en sistemas con memoria limitada: dado un conjunto de opciones y evidencia textual o visual, el modelo devuelve la probabilidad de cada una en un solo paso, lo que permite integrarlo en pipelines con presupuesto de VRAM reducido (1,15 GiB de pico según el autor).
- Extracción de campos de recibos y formularios: con un rendimiento de 92,0 puntos en KIE (CORD+FUNSD), es adecuado para tareas de key information extraction donde se conoce el conjunto de campos posibles y se necesita una respuesta tipada con probabilidad asociada.
- Selección de elementos de interfaz para agentes: con 77,0 puntos en Mind2Web, puede emplearse para elegir el elemento de pantalla correcto entre los candidatos extraídos del DOM, como paso de decisión dentro de un agente mayor.
- Verificaciones de sí/no y moderación asistida: útil para comprobaciones binarias con umbral de abstención configurable; el autor advierte explícitamente que no debe usarse para moderación automática de contenido sin revisión humana.
- Enrutamiento y clasificación de consultas: al devolver probabilidades calibradas por opción, sirve para dirigir peticiones a distintas ramas de un sistema (por ejemplo, clasificar tickets o intenciones) con una medida de confianza explícita.
- Control de calidad con abstención: el flag de abstención independiente y las coberturas documentadas (68,8% en tipo `noul` con error objetivo del 15%) permiten derivar a revisión humana los casos de baja confianza.
- Despliegue en hardware de consumo: con 1,15 GiB de pico en una RTX 4060 Ti de 8 GB y una latencia p50 de 54,4 ms, es viable para servicios de decisión en tiempo real sobre GPU consumer.

## Benchmarks y rendimiento

Resultados del autor sobre la mitad pública del JEV Decision Index vision suite (12.210 filas, 11 benchmarks, kit público y motor oficial `qev_decision_index:QEVEngine`). La mitad privada la ejecutan los mantenedores del board, por lo que la puntuación completa no se conoce.

| Modelo | Parametros | Indice publico de vision | Intervalo bootstrap 95% |
|---|---:|---:|---:|
| QEV-0.8B-compact | 466M | 52,46 | 50,9 a 54,1 |
| QEV-0.8B v3 (misma ejecucion del autor) | 853M | 52,70 | no disponible |

Desglose por benchmark (puntos de skill públicos; peso entre paréntesis):

| Benchmark | QEV-0.8B-compact | QEV-0.8B |
|---|---:|---:|
| CV-Bench (1) | 59,6 | 58,7 |
| BLINK (1) | 31,1 | 31,4 |
| RealWorldQA (1) | 40,9 | 40,1 |
| CharXiv (1) | 54,4 | 55,6 |
| InfographicVQA (1) | 68,9 | 70,0 |
| Mind2Web (1) | 77,0 | 77,5 |
| Winoground (1) | 50,2 | 51,3 |
| KIE, CORD+FUNSD (1) | 92,0 | 91,7 |
| Moderation, Hateful Memes (1) | 28,6 | 28,0 |
| R-Bench-M (0,5) | 13,7 | 15,7 |
| MMMU-Pro vision (0,25) | 7,9 | 8,6 |

Rendimiento y memoria (RTX 4060 Ti 8 GB, batch 1, bf16, 47 perfiles de petición de hasta 16 opciones a resolución completa, 3 calentamientos y 30 ejecuciones cronometradas por perfil):

| Modelo | p95 peor caso | p50 mediana | Memoria GPU pico |
|---|---:|---:|---:|
| QEV-0.8B-compact | 273,6 ms | 54,4 ms | 1,15 GiB |
| QEV-0.8B v3, modo accurate | 331,3 ms | 62,9 ms | 1,86 GiB |

Calibración y abstención (reajustadas sobre Calibration DEV de 3.000 filas):

| Tipo | Temperatura | Abstención por debajo de | Precision (mitad de politica) | ECE | Cobertura |
|---|---:|---:|---:|---:|---:|
| choice | 1,059 | 0,312 | 86,3% | 0,032 | 100% |
| score | 0,891 | 0,471 | 89,9% | 0,087 | 100% |
| noul | 0,866 | 0,747 | 76,3% | 0,109 | 68,8% |

## Requisitos de hardware

- VRAM estimada para inferencia: 1,15 GiB de pico en bf16 según la medición del autor en una RTX 4060 Ti de 8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el modo `accurate` en bf16; el autor documenta RTX 4060 Ti. No se publican mediciones en A100, H100 ni otras GPU de datacenter.
- Cabe en GPU consumer: sí, con margen amplio en tarjetas de 8 GB o superiores.
- Opciones de despliegue: el paquete `qev` (instalación desde el repositorio GitHub con commit fijado) y la clase `QEVEngine` sobre CUDA; también carga directa con `veyra.option_model.OptionModel.load(path, device="cuda")` sobre un snapshot descargado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: p50 de 54,4 ms y p95 de 273,6 ms en el peor caso medido (batch 1, hasta 16 opciones, imágenes de 1,6 MP).
- Carga: no requiere descargas adicionales fuera del propio repositorio; el loader verifica los ficheros del backbone por SHA-256 y rechaza ficheros ausentes, extra o modificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Indice publico de vision (JEV) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| QEV-0.8B-compact | 466M | 8.192 tokens, 4 imágenes | 52,46 | Apache 2.0 | Hugging Face (ken-jo/QEV-0.8B-compact) |
| QEV-0.8B v3 | 853M | no disponible | 52,70 | no disponible en la informacion proporcionada | Hugging Face (ken-jo/QEV-0.8B) |
| Alternativas de clasificacion zero-shot genericas | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa solo es posible con su modelo base, del que se diferencia en la poda de 8 bloques del LM, la reducción del vocabulario y un coste computacional aproximadamente la mitad. No se dispone de datos de benchmarks de otros modelos de decisión tipada comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni admite tool calling, agentes multi-paso o razonamiento encadenado.
- Solo inglés; el texto fuera de los dominios cubiertos por el vocabulario recortado puede consumir más tokens, y las peticiones que exceden el presupuesto se rechazan, nunca se truncan.
- El autor desaconseja explícitamente su uso para moderación automática de contenido o cualquier decisión sobre personas sin revisión humana; la skill en Hateful Memes es de aproximadamente 30 puntos.
- No apto para decisiones médicas, legales o financieras.
- El objetivo de error del 15% en la abstención es una tasa observada en datos de desarrollo del autor, no una garantía, y no se traslada a otros datos sin reajuste. Además, cuando el modelo se abstiene sigue devolviendo una respuesta.
- Hereda los datos de entrenamiento, la auditoría de contaminación y los modos de fallo de QEV-0.8B v3.
- La puntuación en la mitad privada del board no se conoce; el autor señala que su modelo base pierde entre 14 y 16 puntos de la mitad pública a la privada.
- Entrenamiento en una sola ejecución; los intervalos bootstrap cubren solo el muestreo de ítems.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada; al tratarse de un modelo de decisión sobre opciones dadas, el riesgo se manifiesta como elección incorrecta entre candidatos más que como texto inventado.

## Enlaces

- Hugging Face: https://huggingface.co/ken-jo/QEV-0.8B-compact
- Modelo base: https://huggingface.co/ken-jo/QEV-0.8B
- Repositorio del motor qev: https://github.com/ken-jo/qev
- Informe técnico citado: *QEV: calibrated single-pass decision models* (Ken Jo), sin URL disponible en la información proporcionada.
