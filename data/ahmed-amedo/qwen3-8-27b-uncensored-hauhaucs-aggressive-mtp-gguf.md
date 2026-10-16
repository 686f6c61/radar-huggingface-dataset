# ahmed-amedo/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF es una distribución de pesos en formato GGUF derivada del modelo Qwen/Qwen3.8-27B, publicada por el usuario ahmed-amedo a partir del trabajo de cuantización y "descensura" de HauhauCS. Se trata de un modelo denso de 27.000 millones de parámetros con codificador de visión, al que se ha aplicado un perfil de ajuste denominado "Aggressive" que elimina el comportamiento de rechazo y reduce el preámbulo en peticiones difíciles. El repositorio ocupa 172,5 GB e incluye la línea completa de cuantizaciones (desde IQ2_M de 10,32 GB hasta Q8_K_P de 31,46 GB), además del proyector de visión en BF16 y el sidecar FastMTP.

La arquitectura es híbrida: 64 capas de las cuales 48 son Gated DeltaNet (atención lineal con estado recurrente) y 16 son capas de atención con compuerta, con un tamaño oculto de 5.120 y FFN de 17.408. Mantiene la cabeza MTP/NextN nativa del modelo base, lo que permite decodificación especulativa, y añade el perfil HauhauCS FastMTP de 32K. El contexto nativo declarado es de 262.144 tokens, extensible hasta 1.000.000.

Su relevancia actual es doble: por un lado, ofrece el pipeline image-text-to-text de Qwen3.8 en un formato ejecutable en hardware de consumo mediante llama.cpp o LM Studio; por otro, documenta aceleraciones de decodificación especulativa poco habituales en pesos GGUF (hasta 3,02x en generación de documentos frente a configuraciones sin MTP). Conviene tener en cuenta que el repositorio no incluye benchmarks estándar ni validación independiente, y que los metadatos de safetensors declaran 1.863.907.840 parámetros, una cifra incompatible con la denominación "27B" y no aclarada por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de visión; 64 capas (48 Gated DeltaNet + 16 capas de atención con compuerta); cabeza MTP/NextN nativa |
| Parámetros totales | 27B según nombre y model card; 1.863.907.840 (~1,86 B) según metadatos de safetensors del repositorio (discrepancia no aclarada) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantización | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M; proyector de visión BF16; sidecar FastMTP 32K |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto), GGUF BF16 (proyector de visión), GGUF (sidecar FastMTP) |
| Tamaño oculto / FFN | 5.120 / 17.408 |
| Vocabulario | 248.320 tokens (con padding) |
| Tamaño del repositorio | 172,5 GB |
| Pipeline declarado | image-text-to-text |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-16 |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso que sustituye la mayoría de sus capas de atención completa por capas Gated DeltaNet, un mecanismo de atención lineal con estado recurrente. De las 64 capas totales, 48 son Gated DeltaNet y solo 16 mantienen atención con compuerta. Esta proporción reduce el coste de caché KV en contextos largos, lo que hace viable el contexto nativo de 262.144 tokens. A esto se suma un codificador de visión independiente, empaquetado como proyector BF16 de 931 MB que debe descargarse por separado para entrada de imagen o vídeo.

El aspecto técnico más distintivo es la decodificación especulativa. El modelo conserva la cabeza MTP/NextN embebida en el modelo base y añade el sidecar HauhauCS FastMTP (903 MB, perfil de 32K), que según el autor se cualificó sobre toda la línea de cuantizaciones a contexto nativo máximo. Los K_P ("Perfect") son perfiles de cuantización personalizados por modelo que, según HauhauCS, elevan la calidad uno o dos niveles de cuantización con solo un 5-15 % más de tamaño que el quant base; los ficheros siguen siendo GGUF estándar y no requieren builds ni plugins especiales.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni el método de alineación (RLHF, DPO u otros) del modelo base Qwen3.8-27B. Tampoco se detalla la metodología concreta del perfil de *uncensoring* "Aggressive": la model card indica únicamente que "no hay cambios en datasets ni en las capacidades previstas" y que se aplica el perfil de descensura de HauhauCS.

## Capacidades

- Generación de texto y razonamiento multi-paso en inglés y chino, con capacidades multilingües adicionales declaradas sin detalle.
- Comprensión de imagen y vídeo mediante el proyector de visión BF16 (pipeline image-text-to-text).
- Capacidades agénticas: la model card afirma que el modelo conserva las capacidades agénticas del modelo base, aunque no se especifica el soporte concreto de *tool calling* ni el esquema de funciones.
- Modo de respuesta directa: el perfil "Aggressive" prioriza responder sin preámbulo ni comportamiento de rechazo, incluso ante peticiones difíciles.
- Decodificación especulativa mediante MTP/NextN nativo y sidecar FastMTP, con aceleración de la generación de tokens.
- Contexto largo: 262.144 tokens nativos, extensibles hasta 1.000.000 tokens según el autor.
- Compatibilidad de endpoints: el repositorio está etiquetado como `endpoints_compatible`, lo que sugiere uso en infraestructuras de inferencia gestionada.

## Casos de uso

- Procesamiento de documentos largos con entrada visual: el modelo puede recibir un PDF escaneado o un informe con gráficos y generar un resumen estructurado, combinando el codificador de visión con el contexto de 262.144 tokens en una sola pasada.
- Extracción de información de vídeo: transcripción, descripción de escenas y anotación de contenido audiovisual usando el proyector BF16 junto con la ventana de contexto nativa.
- Asistencia en investigación sin filtros de rechazo: escenarios de análisis de seguridad, *red teaming* y estudio de contenido sensible donde el comportamiento de rechazo del modelo base estorba, con la advertencia de que el autor recomienda la variante "Balanced" para trabajo crítico de contexto largo.
- Generación de código y refactorización en pipelines locales: al ser GGUF, se puede integrar en entornos sin GPU de datacenter mediante llama.cpp y ejecutar tareas de generación o revisión de código con contexto de repositorio amplio.
- Despliegue en estaciones de trabajo con una sola GPU de 24 GB: las cuantizaciones Q4_K_P (17,92 GB) e IQ4_XS (15,71 GB) permiten servir el modelo en local con el proyector de visión activo.
- Servicio de chat multilingüe en inglés y chino: atención al cliente o asistentes internos para mercados anglófono y sinófono, aprovechando el vocabulario de 248.320 tokens y el contexto largo para historiales extensos.
- Evaluación comparativa de decodificación especulativa: el sidecar FastMTP lo convierte en una plataforma útil para medir el impacto de MTP frente a no-MTP en tareas de generación de documentos y razonamiento.
- Prototipado de agentes con contexto largo: la combinación de 262.144 tokens y arquitectura híbrida con Gated DeltaNet reduce el coste de caché KV frente a un transformer de atención completa equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos cuantitativos son mediciones de velocidad de generación (TG) declaradas por el autor y una tasa de rechazo sin metodología publicada.

| Métrica declarada por el autor | Frente a configuración sin MTP | Frente a MTP embebido estándar |
|---|---|---|
| TG en generación de documentos | hasta 3,02x | hasta +35,2 % |
| TG en razonamiento | hasta 1,93x | hasta +21,1 % |
| Tasa de rechazo | 0 de 465 peticiones | No aplica |

Estos valores proceden exclusivamente de la model card del autor, no incluyen la metodología de medición, el hardware empleado ni los prompts utilizados, y no han sido verificados de forma independiente.

## Requisitos de hardware

Estimaciones de VRAM calculadas a partir del tamaño de fichero declarado más un margen de 1-2 GB para overhead del runtime y caché KV a contexto corto. A contexto largo (262.144 tokens) el requisito aumenta y no se dispone de cifras oficiales.

| Cuantización | Tamaño del fichero | VRAM mínima estimada |
|---|---|---|
| Q8_K_P | 31,46 GB | ~33-34 GB |
| Q6_K_P | 25,92 GB | ~27-28 GB |
| Q5_K_P | 20,22 GB | ~22-23 GB |
| Q4_K_P | 17,92 GB | ~19-20 GB |
| IQ4_XS | 15,71 GB | ~17-18 GB |
| Q3_K_P | 13,44 GB | ~15 GB |
| IQ3_M | 12,79 GB | ~14,5 GB |
| IQ3_XS | 12,18 GB | ~14 GB |
| Q2_K_P | 10,68 GB | ~12,5 GB |
| IQ2_M | 10,32 GB | ~12 GB |
| Proyector de visión (mmproj BF16) | 0,931 GB | Sumar ~1 GB |
| Sidecar FastMTP 32K | 0,903 GB | Sumar ~1 GB |

- GPU de consumo con 24 GB (RTX 3090, RTX 4090): caben Q4_K_P, IQ4_XS, Q3_K_P e inferiores. Q5_K_P (20,22 GB) entra muy justo y con contexto reducido.
- GPU profesional de 48 GB (A6000, L40S, 2x RTX 4090): Q6_K_P y Q5_K_P con contexto amplio.
- GPU de 80 GB (A100 80 GB, H100): Q8_K_P con contexto largo o varias sesiones concurrentes.
- Memoria unificada de Apple Silicon: 32 GB para Q4/IQ4, 64 GB o más para Q6 y Q8, siempre con llama.cpp o LM Studio.
- Opciones de despliegue: llama.cpp, LM Studio y cualquier runtime compatible con GGUF. Los quants K_P pueden mostrarse como `?` en la columna de cuantización de LM Studio; es un problema de visualización, no de carga.
- Latencia y throughput absolutos: no disponibles. Solo se publican aceleraciones relativas frente a configuraciones sin MTP o con MTP embebido estándar.

## Comparativa con modelos similares

Los resultados de búsqueda web no aportan información sobre modelos comparables, y la model card no incluye comparativas con alternativas. La siguiente tabla recoge únicamente lo que se puede afirmar con los datos disponibles.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ahmed-amedo, Aggressive-MTP) | 27B declarados; 1,86 B en metadatos safetensors | 262.144, extensible a 1.000.000 | Sin benchmarks estándar; solo aceleraciones MTP declaradas | Apache 2.0 | GGUF en HuggingFace, 0 descargas |
| Qwen/Qwen3.8-27B (base) | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Pesos originales en HuggingFace |
| HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF (origen de los ficheros según los enlaces del README) | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | GGUF en HuggingFace |

No se dispone de datos verificables sobre alternativas de la misma categoría (modelos densos multimodales de ~27B en GGUF), por lo que no se puede establecer una comparativa de rendimiento fiable.

## Limitaciones y advertencias

- Perfil "Aggressive": el modelo está ajustado para no rechazar peticiones. Puede generar contenido dañino, ilegal o inseguro sin salvaguardas. No es apto para aplicaciones orientadas al público sin capas de moderación externas.
- La afirmación "0/465 refusals" no incluye metodología, conjunto de prompts ni criterios de evaluación. No es verificable ni reproducible con la información publicada.
- El propio autor desaconseja esta variante para trabajo agéntico crítico de contexto largo y recomienda una variante "Balanced" cuando esté disponible.
- Riesgo de alucinación: no hay benchmarks, evaluaciones independientes ni datos de fidelidad factual que permitan acotar el comportamiento del modelo.
- Sin validación comunitaria: el repositorio tiene 0 descargas y 0 likes, lo que impide contrastar la calidad de las cuantizaciones o del perfil de descensura.
- Discrepancia en el número de parámetros: los metadatos de safetensors declaran 1.863.907.840 parámetros frente a los 27B del nombre y la model card (`hidden_size` 5.120 x 64 capas es consistente con ~27B, lo que apunta a un error o a un subconjunto en esa medición). Conviene verificar antes de planificar infraestructura.
- Los enlaces de descarga del README apuntan al espacio `HauhauCS/...`, no al repositorio `ahmed-amedo/...`. Es probable que se trate de una redistribución; verificar la integridad de los ficheros y la autoría real antes de usarlos en producción.
- Idiomas: solo se declaran en, zh y "multilingual" sin detalle. No hay datos de calidad ni de cobertura en español.
- Visión: requiere descargar y configurar por separado el proyector BF16 (931 MB); sin él, el modelo funciona solo como LM de texto.
- Decodificación especulativa: el beneficio del sidecar FastMTP depende del hardware y del runtime; las cifras de hasta 3,02x son mediciones del autor no reproducidas de forma independiente.
- Contexto de 1.000.000 tokens: es una extensión declarada, sin datos publicados sobre degradación de calidad a longitudes extremas.
- Cuantizaciones muy agresivas (IQ2_M a 3,02 BPW y Q2_K_P a 3,12 BPW) implican pérdida de calidad apreciable; no se recomiendan para tareas de razonamiento complejo.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar también los términos del modelo base y el origen del perfil de descensura, que puede no estar documentado con la misma licencia.
- No se ha publicado información sobre sesgos demográficos, de género, culturales o políticos del modelo base ni del ajuste aplicado.
- Fecha de publicación del repositorio: 2026-10-16, sin actualizaciones posteriores registradas.

## Enlaces

- Página de HuggingFace del modelo: https://huggingface.co/ahmed-amedo/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Servidor de Discord del autor del ajuste: https://discord.gg/SZ5vacTXYf
- Ficheros de cuantización y proyector de visión: pestaña "Files and versions" del repositorio (los enlaces directos del README apuntan al espacio `HauhauCS/`, no al de `ahmed-amedo/`).
- Paper, blog técnico o repositorio de código del modelo base: no disponible en la información proporcionada.
