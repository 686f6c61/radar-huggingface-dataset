# ken-jo/QEV-2B-compact

## Resumen

QEV-2B-compact es un modelo de decisión multimodal desarrollado por ken-jo, una versión podada de QEV-2B v3 con 1.314.213.824 parámetros (el 59% del modelo original, 2,21B). En lugar de generar texto token a token, el modelo recibe evidencia (texto y hasta cuatro imágenes) junto con opciones candidatas y devuelve, en un único forward pass, una probabilidad calibrada por opción, una respuesta tipada y un flag de abstención independiente. Está pensado para tareas de clasificación y elección entre alternativas dadas, no para generación libre.

La poda es agresiva pero quirúrgica: el modelo de lenguaje se corta tras el bloque 16 de 24 y el vocabulario de entrada se reduce de 248.320 a 32.768 filas, ya que una cabeza de decisión no necesita vocabulario de salida. El encoder de visión (Qwen3.5 congelado) y el proyector se mantienen intactos respecto a QEV-2B v3. Según el autor, una sonda de profundidad determinó que la decisión queda completa tras el bloque 16, por lo que las capas eliminadas no aportan a la tarea.

La relevancia práctica está en el coste: el modelo cabe en 2,76 GiB de VRAM en bf16 con una latencia mediana de 99 ms en una RTX 4060 Ti de 8 GB, frente a 4,44 GiB y 122,9 ms del modelo completo, con una pérdida de solo 0,12 puntos en el índice público de visión. Es, por tanto, una opción para despliegue en hardware de consumo en pipelines de decisión tipada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con encoder de visión Qwen3.5 congelado y LM podado a bloques 1-16 de 24 |
| Parámetros totales | 1.314.213.824 (1,31B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens de entrada; máximo 4 imágenes de hasta 1.638.400 píxeles cada una |
| Tipos de cuantización | no disponible (el autor reporta ejecución en bf16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato bundled-backbone, `format_version` 3, con `manifest.json` y SHA-256 por fichero) |

## Arquitectura y entrenamiento

La arquitectura combina un encoder de visión y proyector idénticos a QEV-2B v3 con un modelo de lenguaje truncado: se conservan los bloques 1-16 de 24 y la normalización final, tomados de los pesos fusionados de QEV-2B v3. El vocabulario de entrada se recorta a 32.768 de las 248.320 filas originales, manteniendo todos los tokens producidos en los prompts de entrenamiento y desarrollo, todos los tokens especiales y de byte, y los merges necesarios para construirlos; se reescribe el tokenizador de byte-fallback y se incluye un `vocab-map.json`. Las peticiones que exceden el presupuesto se rechazan, nunca se truncan.

La cabeza de lectura (readout) es la del bloque 16: cuatro slots de razonamiento, una vista de decisión y una cabeza de binding condicionada de rango 64, destilada desde la cabeza de profundidad completa sobre las preguntas de entrenamiento y seleccionada únicamente con datos de desarrollo. Las temperaturas y umbrales de abstención se reajustaron para este paquete sobre las 3.000 filas del Calibration DEV de release, con el mismo procedimiento que v3: temperatura que minimiza NLL en una mitad disjunta por grupos y umbral de abstención en la otra mitad que maximiza cobertura con un error empírico máximo del 15% y al menos 20 ejemplos aceptados. No se usaron filas del suite público ni del holdout.

## Capacidades

- Decisión tipada sobre opciones dadas: devuelve una probabilidad calibrada por opción, una respuesta tipada y un flag de abstención en un solo forward pass, sin generar tokens.
- Procesamiento multimodal: acepta texto y hasta cuatro imágenes por petición, con hasta 1.638.400 píxeles por imagen en modo `accurate`.
- Tres tipos de decisión con calibración propia: `choice` (temperatura 1,029, abstención por debajo de 0,301), `score` (0,579 / 0,454) y `noul` (1,223 / 0,674).
- Clasificación zero-shot (pipeline declarado: `zero-shot-classification`).
- Extracción de campos en documentos (KIE sobre CORD y FUNSD).
- Selección de elementos de interfaz para agentes (Mind2Web).
- Comprensión de gráficos e infografías (CharXiv, InfographicVQA).
- Razonamiento visual y emparejamiento imagen-texto (CV-Bench, BLINK, RealWorldQA, Winoground).
- No soporta generación libre de texto, tool calling, agentes multi-paso autónomos ni idiomas distintos del inglés.

## Casos de uso

- **Enrutamiento de tickets de soporte**: dado un mensaje de texto y una lista cerrada de categorías, el modelo devuelve la probabilidad de cada categoría y un flag de abstención; con 89,5% de accuracy y ECE de 0,019 en el tipo `choice`, permite derivar a revisión humana solo los casos por debajo del umbral de 0,301.
- **Extracción de campos en recibos y formularios**: sobre imágenes de documentos (KIE con 92,3 puntos en CORD+FUNSD), se pasan las opciones de campo como candidatos y el modelo devuelve la elección tipada, adecuado para digitalización masiva con memoria limitada.
- **Selección de elementos en agentes de navegador**: dado un screenshot y las opciones de elementos interactivos, el modelo elige el objetivo (81,5 puntos en Mind2Web); su latencia mediana de 99 ms permite integrarlo en un bucle de agente sin dominar el coste por paso.
- **Verificación sí/no sobre imágenes**: comprobaciones binarias (presencia de un objeto, coincidencia de una condición) formuladas como decisión `choice` con dos opciones, aprovechando la calibración y la abstención para no forzar respuestas en casos dudosos.
- **Moderación asistida con revisión humana**: el modelo puede puntuar memes y contenido visual frente a políticas dadas, pero con solo 31,1 puntos en Hateful Memes no es apto para moderación automatizada; su uso realista es como señal previa que prioriza la cola de revisión humana.
- **Despliegue en hardware de consumo**: con 2,76 GiB de pico en bf16 sobre una RTX 4060 Ti de 8 GB, sirve para prototipos y entornos de borde donde un modelo de 2,21B no cabría con margen; el peor caso p95 es de 630,4 ms con 16 opciones a resolución completa.
- **Clasificación zero-shot de imágenes**: emparejamiento imagen-texto (66,5 en Winoground) para etiquetar o filtrar imágenes contra descripciones candidatas sin entrenamiento específico.

## Benchmarks y rendimiento

Resultados del autor sobre la mitad pública del JEV Decision Index vision suite (12.210 filas, 11 benchmarks, kit público, motor oficial `qev_decision_index:QEVEngine`). Son ejecuciones propias del autor; la mitad privada la ejecutan los mantenedores del board y la puntuación completa no se conoce aún.

| Modelo | Parámetros | Índice público de visión | Intervalo bootstrap 95% |
|---|---:|---:|---:|
| QEV-2B-compact | 1,31B | 62,15 | 60,7 a 63,6 |
| QEV-2B v3 (misma kit y motor, ejecución del autor) | 2,21B | 62,27 | no disponible |

Diferencia de −0,12 puntos respecto al padre en las mismas filas (sin test pareado). Desglose por benchmark (puntos de skill públicos; peso entre paréntesis):

| Benchmark | QEV-2B-compact | QEV-2B |
|---|---:|---:|
| CV-Bench (1) | 71,3 | 71,8 |
| BLINK (1) | 48,4 | 48,0 |
| RealWorldQA (1) | 56,2 | 55,3 |
| CharXiv (1) | 64,9 | 65,7 |
| InfographicVQA (1) | 80,9 | 81,4 |
| Mind2Web (1) | 81,5 | 83,6 |
| Winoground (1) | 66,5 | 65,5 |
| KIE, CORD+FUNSD (1) | 92,3 | 92,6 |
| Moderation, Hateful Memes (1) | 31,1 | 31,6 |
| R-Bench-M (0,5) | 19,1 | 15,4 |
| MMMU-Pro vision (0,25) | 13,2 | 16,0 |

Calibración y abstención (refit sobre Calibration DEV de 3.000 filas):

| Tipo | Temperatura | Abstención por debajo de | Accuracy (mitad de política) | ECE | Cobertura |
|---|---:|---:|---:|---:|---:|
| choice | 1,029 | 0,301 | 89,5% | 0,019 | 100% |
| score | 0,579 | 0,454 | 88,6% | 0,077 | 100% |
| noul | 1,223 | 0,674 | 71,3% | 0,070 | 61,3% |

Velocidad y memoria (una RTX 4060 Ti de 8 GB, batch 1, bf16, 47 perfiles de petición de hasta 16 opciones a resolución completa de 1,6 MP por imagen, 3 de calentamiento y 30 ejecuciones cronometradas por perfil):

| Modelo | p95 peor caso | p50 mediana | Memoria GPU pico |
|---|---:|---:|---:|
| QEV-2B-compact | 630,4 ms | 99,0 ms | 2,76 GiB |
| QEV-2B v3, modo accurate | 736,4 ms | 122,9 ms | 4,44 GiB |

## Requisitos de hardware

- VRAM estimada: 2,76 GiB de pico en bf16 con batch 1 y hasta 16 opciones a resolución completa (medición del autor en RTX 4060 Ti de 8 GB).
- GPU recomendadas: RTX 4060 Ti 8 GB o superior para el modo `accurate`; cualquier GPU con al menos ~3-4 GiB libres de VRAM debería bastar, aunque no se han publicado mediciones en otras tarjetas.
- Cabe en GPU de consumo: sí, según la medición en RTX 4060 Ti 8 GB.
- Opciones de despliegue: el paquete `qev` (instalación vía `pip install "qev @ git+https://github.com/ken-jo/qev@e091f7ae8c6f064860d59be560faa27f0387ff35"`) con `QEVEngine(model="ken-jo/QEV-2B-compact")`, o carga directa con `veyra.option_model.OptionModel.load(path, device="cuda")` sobre un snapshot descargado. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: p50 de 99,0 ms y p95 de 630,4 ms en el peor caso de los 47 perfiles medidos; no se publica throughput agregado.
- Solo se ofrece el modo `accurate`; el modo `fast` no está disponible en este paquete.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Índice público de visión | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| QEV-2B-compact | 1,31B | 8.192 tokens, 4 imágenes | 62,15 | Apache 2.0 | Hugging Face |
| QEV-2B v3 | 2,21B | no disponible | 62,27 | no disponible en la información | Hugging Face (modelo base) |
| QEV-0.8B | no disponible | no disponible | no disponible | no disponible | Hugging Face (usado como control en las mediciones) |

No se dispone de datos de benchmarks de otros modelos de decisión tipada comparables en la información proporcionada; la comparación se limita a la familia QEV del mismo autor.

## Limitaciones y advertencias

- No apto para moderación automatizada de contenido ni para decisiones sobre personas sin revisión humana: la skill de Hateful Memes es de aproximadamente 30 puntos.
- No debe usarse para decisiones médicas, legales o financieras.
- No soporta generación libre de texto ni idiomas distintos del inglés.
- La puntuación en la mitad privada del board no se conoce; el autor indica que el modelo padre pierde entre 14 y 16 puntos de la mitad pública a la privada, por lo que el rendimiento real puede ser sustancialmente inferior al reportado.
- El objetivo de error del 15% en abstención es una tasa observada en datos de desarrollo, no una garantía, y no se traslada a otros datos sin reajuste; además, el modelo sigue devolviendo una respuesta cuando se abstiene.
- Hereda los datos de entrenamiento, la auditoría de contaminación y los modos de fallo de QEV-2B v3.
- Entrenamiento en una sola ejecución; los intervalos de confianza cubren solo el muestreo de ítems.
- El vocabulario recortado hace que texto fuera de los dominios cubiertos consuma más tokens; las peticiones que exceden el presupuesto se rechazan en lugar de truncarse.
- El cargador rechaza ficheros faltantes, extra o modificados bajo `backbone/` (verificación SHA-256), lo que impide alterar los pesos sin regenerar el manifiesto.
- Sin descargas ni likes en el momento de la consulta (0 y 0), lo que limita la evidencia de uso independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ken-jo/QEV-2B-compact
- Modelo base: https://huggingface.co/ken-jo/QEV-2B
- Repositorio del runtime qev: https://github.com/ken-jo/qev
- Informe técnico citado: *QEV: calibrated single-pass decision models* (Ken Jo, 2026), referencia `ken-jo/deci` (entrada truncada en la model card; URL completa no disponible)
