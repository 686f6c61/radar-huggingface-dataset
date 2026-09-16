# pmarquees/MapLayerPredictor

## Resumen

MapLayerPredictor es un perceptrón multicapa (MLP) de 59.482 parámetros, cuantizado a int8 y empaquetado como `MapLayerPredictor-int8.mlpackage` (77 KB, Core ML ML Program), publicado por el usuario pmarquees. No es un modelo de lenguaje: su tarea es recomendar capas de mapa (superposiciones) y mapa base en una aplicación de mapas de actividades al aire libre, a partir del contexto actual del usuario. La entrada son cuatro índices categóricos (actividad, país, región y modo de ruta) más 40 características numéricas de contexto (hora, día de la semana y mes codificados con seno/coseno, zoom, área del viewport, distancia y desnivel de la ruta, elevación máxima, densidades de refugios, partes, senderos, fracciones de glaciar y de zona de avalancha, nieve, nubosidad, viento, cota de congelación, riesgo de avalancha, frescura del dato, latitud y longitud, y 15 indicadores de disponibilidad de capas). La salida son 15 puntuaciones independientes de superposición (sigmoide) y 43 logits de mapa base (softmax).

El interés de este modelo no está en su capacidad, sino en su formato y su enfoque: es un recomendador de producto pensado para ejecutarse íntegramente en el dispositivo (iOS/iPadOS, Core ML, cargas de trabajo de clase CPU) y sin telemetría real de usuarios. Se entrenó de forma completamente sintética a partir de un motor de reglas escrito por expertos, con 20.000 escenarios repartidos en 24 regiones y 8 actividades. El propio autor advierte que las reglas constituyen el techo del modelo y que todas las métricas publicadas son optimistas respecto al comportamiento con usuarios reales.

Es relevante ahora como ejemplo de patrón: modelos minúsculos, cuantizados y empaquetados para inferencia local, que sustituyen reglas heurísticas en el cliente y evitan llamadas de red. Para quien evalúe modelos, conviene tratarlo como un caso de estudio de destilación de reglas a un MLP int8 para Core ML, con la advertencia explícita de que su evaluación es sintética, su latencia en dispositivo no se ha medido y no existe todavía una licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP); empaquetado como Core ML ML Program |
| Parametros totales | 59.482 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: entrada de tamaño fijo, 4 índices categóricos (`categories`, float32, forma (1,4)) + 40 características numéricas (`features`, float32, forma (1,40)) |
| Tipos de cuantizacion | int8 (paridad verificada por simulación en PyTorch, no ejecutando el mlpackage) |
| Idiomas soportados | No aplica: no procesa lenguaje natural; los vocabularios cubren 8 actividades, 17 países, 24 regiones y 3 modos de ruta |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | `.mlpackage` (Core ML ML Program), 77 KB |
| Version | `2026-09-16` |
| Hash de contenido | `sha256:5798c68d52df87d72df9dad710ef8dd43551f4a1af2aabd351a3b73c06db2efb` |
| Salidas | `overlay_scores` (1,15, sigmoide) y `basemap_scores` (1,43, logits, aplicar softmax) |
| Requisito de runtime | Core ML en iOS/iPadOS 17 o superior |

## Arquitectura y entrenamiento

La arquitectura es un MLP de 59.482 parámetros con dos cabezas de salida: una cabeza de 15 unidades con activación sigmoide para las superposiciones independientes (clasificación multietiqueta) y una cabeza de 43 unidades con softmax para seleccionar el mapa base. La entrada combina un embedding categórico de cuatro índices (actividad, país, región, modo de ruta) con 40 características numéricas ya normalizadas en el lado del cliente (por ejemplo, hora/día/mes como seno y coseno, `log1p(area_km2)`, `log1p(route_km)`, `log1p(ascent)`, `max_elev/4000`, `lat/90`, `lon/180`, `snowfall/50`, `cloud/100`, `wind/50`, `freezing_level/4000`, `avalanche_risk/5`, `freshness/72`). El orden exacto de las claves numéricas y de los 15 indicadores de disponibilidad se documenta como `NUMERIC_KEYS` y `OVERLAYS` en `catalog.py` del repositorio de entrenamiento.

El entrenamiento es 100 % sintético: 20.000 escenarios generados por un motor de reglas escrito por expertos, sobre 24 regiones y 8 actividades. No se menciona ningún uso de RLHF, DPO ni ajuste por preferencias, ni tampoco datos reales de usuarios (el autor indica explícitamente que no existe telemetría real para esta tarea). La cuantización a int8 se validó mediante paridad contra fp32 en 256 filas congeladas: delta máximo en la sigmoide de 0,0098, acuerdo top-4 en superposiciones del 0,9883 y acuerdo top-1 en mapa base del 0,9961. El entrenamiento superó una compuerta de sobreajuste (200 escenarios, exactitud 1,000 en superposiciones y pérdida de mapa base dentro de 0,009 de la entropía objetivo). No hay etapa de calibración: las puntuaciones sigmoide son rankings, no probabilidades. El autor también señala que la paridad de cuantización se verificó por simulación en PyTorch, no ejecutando el `mlpackage`, porque el host de conversión era Linux y no disponía de runtime de Core ML.

## Capacidades

- Clasificación multietiqueta de superposiciones: produce 15 puntuaciones sigmoide independientes para ordenar capas de terreno, peligro y puntos de interés.
- Selección de mapa base: clasificación sobre 43 logits (softmax) para elegir el mapa base más adecuado al contexto.
- Condicionamiento por actividad y región: incorpora índices de actividad (8 valores), país (17), región (24) y modo de ruta (3).
- Condicionamiento por contexto geográfico y métrico: zoom, área del viewport, distancia y ascenso de ruta, elevación máxima, latitud y longitud.
- Condicionamiento meteorológico y de peligro: nieve, nubosidad, viento, cota de congelación, riesgo de avalancha y fracciones de área de glaciar y de avalancha.
- Uso de indicadores de disponibilidad de capas: 15 banderas de disponibilidad que el cliente debe aplicar como máscara después de la inferencia.
- Inferencia totalmente en dispositivo, sin red, sobre Core ML (cargas de trabajo de clase CPU).
- No dispone de: generación de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling, soporte de agentes, multi-step reasoning ni capacidades multilingues (no procesa lenguaje natural).

## Casos de uso

- Preselección de superposiciones en una app de mapas al aire libre: el modelo recibe el contexto actual (actividad, región, modo de ruta y las 40 características) y devuelve 15 puntuaciones para ordenar capas de terreno, peligro y POI. Es adecuado porque toda la inferencia ocurre en el dispositivo y no requiere conectividad.
- Selección automática de mapa base: con los 43 logits y un softmax en el cliente, la app puede escoger el mapa base más probable para el contexto; en la evaluación sintética el top-1 fue 0,9585 y el top-3, 1,000.
- Recomendación especializada para esquí de travesía y snowboard: en estos dos segmentos de actividad la precisión@4 sobre superposiciones fue de 1,000, por lo que el modelo es apropiado para priorizar capas de nieve, glaciares y zonas de avalancha en esas actividades.
- Ajuste dinámico de la interfaz según zoom y viewport: las características de zoom, área del viewport y densidades (refugios, partes, senderos) permiten decidir qué superposiciones mostrar a cada escala sin intervención del usuario.
- Integración de contexto meteorológico en la recomendación: las variables de nieve, nubosidad, viento, cota de congelación y riesgo de avalancha permiten reordenar las capas de peligro en función de las condiciones; debe usarse solo como recomendación de visualización, nunca como herramienta de evaluación de peligro o rescate.
- Funcionamiento sin cobertura en montaña: al ser un modelo local de 77 KB, se puede distribuir dentro del binario de la app y ejecutarse en modo avión, escenario habitual en rutas de montaña.
- Reducción de coste de servidor y de latencia de red: sustituye llamadas a un servicio de recomendación por inferencia local de clase CPU, lo que elimina el coste por petición y el problema de la conectividad intermitente.
- Reordenación del catálogo de capas (estilo Traverse): el modelo encaja como capa de ranking sobre un catálogo de superposiciones ya existente, con reglas de cliente que mantengan deterministas las capas `route` y `communityHazards`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (MMLU, HumanEval, GSM8K, etc.), porque no es un modelo de lenguaje. Los únicos datos de evaluación son los de la model card, medidos sobre una partición sintética congelada de 2.000 especificaciones de escenario, divididas por `spec_id` con semilla 1337:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Mapa base, top-1 | 0,9585 | Frente a la distribución objetivo del motor de reglas |
| Mapa base, top-3 | 1,000 | Frente a la distribución objetivo del motor de reglas |
| Superposiciones, precision@4 (global) | 0,790 | Sobre etiquetas binarias muestreadas de Bernoulli |
| Superposiciones, precision@4 (esquí de travesía) | 1,000 | Sobre etiquetas binarias muestreadas de Bernoulli |
| Superposiciones, precision@4 (snowboard) | 1,000 | Sobre etiquetas binarias muestreadas de Bernoulli |
| AUC media | 0,722 | El ruido de etiquetado limita el AUC |
| Violaciones de la máscara de disponibilidad | 0 | Con la máscara aplicada |
| Paridad int8 vs fp32, delta máximo de sigmoide | 0,0098 | 256 filas congeladas |
| Paridad int8 vs fp32, acuerdo top-4 en superposiciones | 0,9883 | 256 filas congeladas |
| Paridad int8 vs fp32, acuerdo top-1 en mapa base | 0,9961 | 256 filas congeladas |
| Compuerta de sobreajuste (200 escenarios) | Exactitud 1,000 en superposiciones; pérdida de mapa base dentro de 0,009 de la entropía objetivo | Prueba de humo |
| Latencia en dispositivo | No medida | Core ML no disponible en el host de conversión (Linux); verificar en Xcode |

Advertencia del propio autor: la evaluación es sintética y comparte supuestos con el generador, por lo que estas cifras deben considerarse optimistas hasta que exista una evaluación con telemetría real.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido convencional. El artefacto int8 ocupa 77 KB; el modelo está pensado para inferencia en dispositivo sobre Core ML.
- GPU recomendadas: no aplica. El autor describe la carga como "de clase CPU" y no se publican requisitos de GPU.
- Compatibilidad con GPU de consumo: no aplica (no se distribuye en formatos de pesos para GPU como safetensors o GGUF).
- Opciones de despliegue: Core ML en iOS/iPadOS 17 o superior, cargando el `mlpackage` con `MLModel(contentsOf:)` y construyendo las entradas como `MLMultiArray`/`MLFeatureProvider`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la model card afirma un orden de magnitud "sub-milisegundo" como intención de diseño, pero la latencia en dispositivo no se midió y el comportamiento en la Neural Engine queda sin verificar. Debe validarse en Xcode antes de asumir cualquier cifra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MapLayerPredictor | 59.482 (int8, 77 KB) | Entrada fija: 4 índices + 40 características numéricas | Métricas solo sintéticas (top-1 0,9585 en mapa base; precision@4 0,790 global) | No disponible | HuggingFace, Core ML (iOS 17+) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la información proporcionada modelos comparables de la misma categoría (recomendadores de capas de mapa empaquetados para Core ML). Cualquier comparación con otros recomendadores en dispositivo requeriría datos que no están disponibles.

## Limitaciones y advertencias

- Sesgo de origen sintético: el modelo se entrenó íntegramente con datos de un motor de reglas escrito por expertos (20.000 escenarios, 24 regiones, 8 actividades). Las reglas son su techo y todas las métricas publicadas son optimistas respecto al comportamiento con usuarios reales.
- Sin telemetría real: no existe evaluación con datos de usuarios, por lo que la generalización a contextos reales está sin demostrar.
- La disponibilidad de capas no se aprende: aproximadamente el 14 % de las capas no disponibles obtienen una puntuación superior a 0,5 en crudo. El cliente debe aplicar obligatoriamente la máscara de disponibilidad después de la inferencia; de lo contrario se recomendarán capas no disponibles.
- Alcance limitado: 15 superposiciones globales. Quedan fuera de V1 las 12 superposiciones específicas de Japón, la cabeza de fecha de 9 vías de `japanHistoricAerial` y el tiempo meteorológico como salida.
- Contextos de tipo `browse`: por construcción no contienen positivos, así que debe usarse un umbral de puntuación en torno a 0,5 en lugar de top-k; en caso contrario el modelo mostrará ruido.
- Conocimiento de mapa base atado al catálogo regional: los contextos fuera de las 24 regiones de entrenamiento caen en priors débiles.
- Las puntuaciones sigmoide no son probabilidades: no hay etapa de calibración, solo rankings.
- Riesgo de alucinación en el sentido de falsos positivos en capas no disponibles (14 %) y de ordenaciones poco fiables fuera de la distribución de entrenamiento.
- No es una herramienta de evaluación de peligro ni de seguridad: no debe utilizarse para tomar decisiones sobre avalanchas o rescates. Solo recomienda capas de mapa.
- Latencia y comportamiento en la Neural Engine sin verificar: la paridad de cuantización se comprobó por simulación en PyTorch, no ejecutando el `mlpackage`.
- Licencia no declarada: no hay información sobre permisos de uso comercial, modificación o redistribución. Debe aclararse con el autor antes de cualquier uso en producción.
- Idiomas: el modelo no procesa lenguaje natural; las únicas categorías textuales son los vocabularios cerrados de actividades, países, regiones y modos de ruta.
- El repositorio de HuggingFace indica 0 descargas y 0 likes, y un tamaño de repositorio de 0,0 GB, coherente con un artefacto de 77 KB sin comunidad establecida.

## Enlaces

- HuggingFace: https://huggingface.co/pmarquees/MapLayerPredictor
- Repositorio de entrenamiento con `catalog.py` (vocabularios y orden de claves `NUMERIC_KEYS` y `OVERLAYS`): referenciado en la model card, sin URL pública disponible en la información proporcionada.
- Paper, blog o demo adicionales: no disponible. La búsqueda web realizada no devolvió enlaces relevantes al modelo (únicamente páginas de soporte de Google Chrome, Google Translate y Gmail, sin relación con el artefacto).
