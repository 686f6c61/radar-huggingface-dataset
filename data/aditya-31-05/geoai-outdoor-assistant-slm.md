# Aditya-31-05/geoai-outdoor-assistant-slm

## Resumen

GeoAI Outdoor Assistant SLM es un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario Aditya-31-05 bajo licencia Apache-2.0. Según su model card, el modelo nace para dar soporte al asistente del GeoAI Hackathon del CSRE (IIT Bombay): su tarea es extraer restricciones de actividad, ubicación, franja horaria y condiciones de salud a partir de consultas en lenguaje natural, y razonar después sobre datos meteorológicos y geoespaciales obtenidos en vivo (Open-Meteo, WAQI, Overpass, Nominatim, OSRM, Sunrise-Sunset) sin inventar hechos no fundamentados.

Se trata de un modelo denso de 1.543.714.304 parámetros (aproximadamente 1,54 mil millones), con pesos en formato safetensors y un repositorio de 3,1 GB, un tamaño coherente con un almacenamiento en bf16/fp16 (unos 2 bytes por parámetro). La model card no documenta la longitud de contexto efectiva tras el ajuste, los idiomas soportados ni el procedimiento de entrenamiento empleado.

Su relevancia actual es doble: por un lado, ejemplifica el patrón de "SLM como capa de razonamiento fundamentado" sobre APIs externas, cada vez más habitual en aplicaciones de agentes; por otro, al ser un derivado de una familia con licencia Apache-2.0 y tan solo 1,5 B de parámetros, es desplegable en hardware de consumo. Conviene señalar que el repositorio presenta 0 descargas y 0 likes, y que no se han publicado evaluaciones, por lo que su calidad real como fine-tune no está verificada de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (GQA, RoPE, SwiGLU, RMSNorm); heredada del modelo base. No se detalla en la model card del autor |
| Parámetros totales | 1.543.714.304 (≈ 1,54 B), dato real de los safetensors |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card. El modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens nativos (ampliable a 131.072 con YaRN según su propia documentación) |
| Tipos de cuantización | No especificados por el autor. El repositorio solo contiene safetensors (≈ 3,1 GB, consistente con bf16/fp16). No se publican GGUF ni cuantizaciones de 8/4 bits |
| Idiomas soportados | No disponibles. El modelo base declara soporte de más de 29 idiomas, pero el fine-tune no documenta el impacto sobre esa cobertura |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con `transformers` mediante `AutoModelForCausalLM`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la de Qwen2.5-1.5B-Instruct: un transformer decoder-only de 28 capas, dimensión oculta de 1536, 12 cabezas de atención con 2 cabezas KV (atención multi-query agrupada, GQA), FFN de 8960 y vocabulario de 151.936 tokens, con RoPE para el codificado posicional. El repositorio no aporta ningún detalle adicional sobre la arquitectura ni confirma que el ajuste haya modificado la tokenización o el chat template; los pesos y el `AutoTokenizer` se cargan directamente desde el identificador del modelo.

El procedimiento de ajuste no está documentado: la model card no indica el número de tokens de entrenamiento, la composición del dataset, si se empleó LoRA/QLoRA o ajuste completo, ni si hubo fases de RLHF, DPO o preferencias. Tampoco se describe ninguna innovación técnica propia (decodificación especulativa, atención lineal, herramientas de gramática forzada para JSON). La única indicación funcional es la del uso previsto: extracción de restricciones y razonamiento sobre contexto inyectado para evitar alucinaciones. Cualquier afirmación sobre el proceso de entrenamiento más allá de esto sería especulativa.

## Capacidades

- Generación de texto conversacional y razonamiento de un solo turno o multi-turno, heredados del modelo base.
- Extracción estructurada de entidades y restricciones (actividad, ubicación, franja horaria, condiciones de salud) a partir de consultas en lenguaje natural.
- Razonamiento sobre contexto inyectado en el prompt: datos meteorológicos (Open-Meteo, WAQI), geospatial (Overpass, Nominatim, OSRM) y astronómicos (Sunrise-Sunset).
- Redacción de recomendaciones condicionadas a los datos suministrados, con el objetivo declarado de no generar hechos no fundamentados.
- Soporte potencial de tool calling / function calling, ya que el modelo base lo incluye; no confirmado explícitamente para este fine-tune.
- Uso en pipelines de agentes con múltiples pasos (consulta → herramienta → síntesis), según el caso de uso descrito por el autor.
- Capacidades multilingües no documentadas para este ajuste.
- Capacidades de visión, audio o modo "thinking" explícito: no disponibles.

## Casos de uso

- Asistente de recomendación de actividades al aire libre: el modelo recibe la consulta del usuario junto con el parte meteorológico y la calidad del aire obtenidos en vivo, y devuelve una recomendación (ruta, horario, actividad) condicionada a esos datos.
- Extracción de parámetros en formato estructurado: convertir una frase como "quiero caminar cerca de Pune el domingo por la mañana, tengo problemas de rodilla" en un JSON con actividad, coordenadas, franja horaria y restricciones físicas, listo para alimentar un planificador.
- Enrutado de herramientas en un agente geoespacial: decidir si conviene llamar a Nominatim (geocodificación), a Overpass (POIs), a OSRM (rutas) o a Sunrise-Sunset (horas de luz) antes de responder.
- Capa de fundamentación (grounding) en la respuesta final: al recibir únicamente los datos recuperados por las APIs, el modelo sintetiza la respuesta limitándose a ellos, lo que reduce el riesgo de alucinación en datos de temperatura, calidad del aire o distancias.
- Despliegue en el borde o con conectividad intermitente: con 1,54 B de parámetros y pesos de ~3,1 GB en bf16, puede ejecutarse en una GPU de consumo o, cuantizado a 4 bits (~1 GB), en CPU o dispositivos móviles para apps de senderismo.
- Prototipado rápido en hackathons y demos: el coste de inferencia por consulta es bajo y la licencia Apache-2.0 permite publicar demos y pruebas de concepto sin fricción legal.
- Filtrado y normalización de resultados de Overpass: deduplicar POIs, descartar los que no cumplen las restricciones del usuario y ordenarlos por proximidad antes de pasarlos a un modelo mayor.
- Módulo de avisos de seguridad: generar explicaciones breves sobre condiciones adversas (viento, UV, calidad del aire) a partir de umbrales ya calculados por el sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de fidelidad a los datos inyectados (groundedness), extracción de entidades o calidad de las recomendaciones. Tampoco se aportan comparaciones con el modelo base que permitan medir la degradación o mejora introducida por el ajuste.

## Requisitos de hardware

- VRAM en bf16/fp16: los pesos ocupan ≈ 3,1 GB. A ello hay que sumar la caché KV, que para esta arquitectura (28 capas, 2 cabezas KV, dimensión de cabeza 128) ronda los 28 KB por token: ≈ 0,23 GB con 8.192 tokens de contexto y ≈ 0,9 GB con 32.768. En la práctica, entre 4 y 6 GB de VRAM cubren escenarios habituales.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) es suficiente en bf16. Para servir varias peticiones concurrentes con contexto largo conviene una L4 (24 GB), A10G o A100/H100.
- Cabe en GPU de consumo: sí, holgadamente. En cuantización de 4 bits (~1 GB de pesos) funciona incluso en GPUs de 4 GB y en CPU.
- Opciones de despliegue: `transformers` (instrucciones oficiales de la model card), vLLM o TGI para serving con batching continuo, llama.cpp u Ollama previa conversión a GGUF (el repositorio no incluye GGUF publicado). Para forzar JSON válido en producción conviene acompañar el despliegue de gramáticas o validadores de esquema.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GeoAI Outdoor Assistant SLM | 1,54 B | No disponible en su model card | Apache-2.0 | HuggingFace, 0 descargas | Fine-tune especializado; sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct (base) | 1,54 B | 32.768 tokens nativos (131.072 con YaRN según su documentación) | Apache-2.0 | HuggingFace, ampliamente utilizado | Referencia directa: mismo tamaño y licencia, con documentación y evaluación publicadas por el autor original |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Licencia comunitaria Llama 3.2 | HuggingFace, muy extendido | Menor en parámetros, contexto mucho mayor; licencia con condiciones de uso |
| Gemma-2-2B-it | 2,6 B | 8.192 tokens | Términos de uso de Gemma | HuggingFace, muy extendido | Más parámetros y contexto más corto; licencia con restricciones de uso comercial |

No se dispone de datos de rendimiento comparado (benchmarks) para el modelo objeto de esta ficha, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: 0 descargas y 0 likes en el momento de la consulta, sin métricas de calidad, groundedness ni comparisons con el modelo base.
- Riesgo de alucinación en datos meteorológicos o geográficos si el pipeline no inyecta el contexto real; la afirmación del autor sobre el razonamiento fundamentado no está respaldada por ninguna evaluación publicada.
- Idiomas soportados no declarados: el ajuste puede haber degradado el multilingüismo del modelo base, especialmente en castellano.
- Longitud de contexto efectiva no documentada; si el entrenamiento se hizo con secuencias cortas, el rendimiento puede degradarse antes de los 32.768 tokens teóricos del base.
- No hay garantía de que la salida sea JSON válido ni de que respete un esquema fijo; en producción conviene validar y, si es posible, restringir la decodificación con gramáticas.
- Sesgos heredados del modelo base (incluido sesgo geográfico hacia regiones con buena cobertura de OpenStreetMap), no auditados en este fine-tune.
- Dependencia de servicios de terceros con sus propias condiciones: OSM/Overpass bajo ODbL, Nominatim con políticas estrictas de rate limit y uso, y APIs como WAQI u Open-Meteo con términos específicos que deben revisarse antes de un despliegue comercial.
- La licencia Apache-2.0 cubre los pesos del modelo, no los datos ni las respuestas de las APIs consultadas.
- No apto para decisiones críticas de seguridad (emergencias, salud, condiciones meteorológicas extremas) sin supervisión humana y verificación contra fuentes oficiales.
- Modelo de 1,5 B: capacidad limitada para razonamiento complejo multi-paso y para instrucciones muy largas; conviene reservar el razonamiento pesado para un modelo mayor y usar este como extractor o capa de fundamentación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aditya-31-05/geoai-outdoor-assistant-slm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Open-Meteo (API meteorológica citada): https://open-meteo.com/
- WAQI (calidad del aire): https://aqicn.org/api/
- OpenStreetMap Overpass API: https://wiki.openstreetmap.org/wiki/Overpass_API
- Nominatim: https://nominatim.org/
- OSRM: https://project-osrm.org/
- Sunrise-Sunset API: https://sunrise-sunset.org/api
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos adicionales asociados a este modelo.
