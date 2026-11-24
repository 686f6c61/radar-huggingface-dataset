# Multiqueue/scuttle-1.7b

## Resumen

Scuttle-1.7B es un modelo de decisión de un solo paso desarrollado por Multiqueue, derivado del backbone híbrido LFM3-1.7B de Liquid AI. No es un modelo generativo al uso: su función es puntuar, en una única pasada hacia delante, qué páginas de un grafo de documentos son relevantes para una consulta y hacia qué enlaces conviene expandir la búsqueda. Sustituye la generación autorregresiva de texto por dos cabezas de decisión entrenadas (una para páginas y otra para enlaces) que producen probabilidades calibradas.

El modelo resuelve un problema concreto: la búsqueda en paralelo tipo enjambre sobre grafos de documentos enlazados (citas académicas, hipervínculos wiki, referencias cruzadas legales). En lugar de razonar paso a paso con texto, evalúa hasta 100 enlaces por forward pass y prioriza el frente de exploración, lo que reduce drásticamente la latencia frente a usar los mismos pesos como agente generativo.

Con 1.728.801.536 parámetros y una ventana de contexto de 262K tokens heredada de LFM3, se distribuye bajo la licencia LFM Open License v1.0 y está pensado para integrarse en pipelines de recuperación de información, CLI y servidores MCP para agentes. Su relevancia actual radica en que demuestra que un modelo pequeño puede superar a agentes generativos del mismo tamaño en tareas de búsqueda estructurada con una fracción del coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida LFM3: 18 capas conv/sliding lineales O(N) + 6 capas de atención completa |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | BF16, 8-bit (LLM.int8), 4-bit NF4 |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (código CLI/MCP bajo MIT) |
| Formato de pesos | safetensors (backbone) + scuttle_heads.pt (cabezas de decisión fp32, 15 KB) |

## Arquitectura y entrenamiento

El modelo parte del backbone híbrido LFM3-1.7B de Liquid AI, que combina 18 capas de convolución y atención deslizante de coste lineal O(N) con 6 capas de atención completa, lo que permite manejar contextos de 262K tokens con un coste de memoria contenido. Sobre ese backbone se añaden dos cabezas de decisión entrenadas en fp32 de apenas 15 KB: `page_head` (proyección de 2048 a 1 dimensión que estima P(página contribuye | consulta, página)) y `link_head` (proyección de 2048 a 6 dimensiones que estima seis probabilidades ordinales acumuladas de distancia P(d ≤ k | consulta, enlace) para k ∈ {0, 1, 2, 3, 4, 6}). Estas seis salidas se combinan mediante pesos de Abel exactos (0,50, 0,22, 0,12, 0,07, 0,05, 0,04) para producir prioridades calibradas del frente de búsqueda sobre hasta 100 enlaces por forward pass, sin generación de texto autorregresiva.

El entrenamiento se realizó sobre 4 topologías de grafo distintas: 255.575 documentos, 543.516 aristas y 4,05 millones de etiquetas verificadas de 100 enlaces (citas de LitSearch, citas de unarXive, hipervínculos de Wikispeedia y referencias cruzadas estatutarias § del eCFR de derecho federal estadounidense). Se empleó una pérdida de frente multi-menú agrupada por petición y 2 rondas de DAgger on-policy equilibrado multi-dominio de 100 enlaces. La innovación técnica destacable es la sustitución de la decodificación generativa por cabezas de clasificación calibradas, lo que elimina la latencia de generación token a token.

## Capacidades

- Puntuación de relevancia de páginas: estima la probabilidad calibrada de que un documento contribuya a responder una consulta.
- Priorización de enlaces: evalúa hasta 100 enlaces por forward pass y estima su distancia al objetivo mediante cabezas ordinales acumuladas.
- Búsqueda en grafo tipo enjambre: soporta exploración paralela de múltiples frentes sobre grafos de documentos enlazados.
- Recuperación de información (IR): mejora el recall y el top-3 frente a BM25 en dominios como literatura científica, derecho federal y wikis.
- Extracción de características: el pipeline declarado en Hugging Face es `feature-extraction`, por lo que puede usarse para obtener representaciones del backbone.
- Integración con agentes vía MCP: incluye un servidor MCP (`scuttle-mcp`) para que agentes de IA consulten grafos indexados.
- Indexación de vaults: el CLI permite indexar carpetas de Markdown, HTML y texto en un grafo consultable.
- No soporta generación de texto libre, tool calling genérico ni razonamiento multi-paso conversacional: su diseño es de decisión de un solo paso.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Búsqueda en bases de conocimiento legales: indexar el eCFR o normativa estatutaria en un grafo de referencias § y usar Scuttle para priorizar qué secciones consultar primero, con mejoras de recall@16 de +8,2 puntos sobre BM25 en el benchmark eCFR.
- Recuperación de literatura científica: construir un grafo de citas (LitSearch, unarXive) y emplear el modelo para expandir la búsqueda por referencias relevantes, recuperando hasta un 32,5% de los fallos de BM25 en el conjunto LitSearch.
- Navegación de wikis y vaults personales: indexar una carpeta de notas Markdown con `scuttle index` y consultarla con `scuttle search`, aprovechando la evaluación de 100 enlaces por pasada para explorar el grafo con latencias de ~1,5 s por ejecución en RTX 4090.
- Agentes autónomos con MCP: conectar el servidor `scuttle-mcp` a un agente para que resuelva consultas de recuperación sobre grafos indexados sin consumir generación de tokens, con offload en reposo configurable (`--idle-offload`).
- Competiciones y retos de búsqueda (CTF de búsqueda): el modelo logró 45/60 banderas en el benchmark Search CTF con un presupuesto de ≤16 lecturas, lo que lo hace adecuado para tareas de localización de información bajo restricciones estrictas de lecturas.
- Despliegue en hardware de gama consumer: con cuantización 4-bit NF4 ocupa 1,70 GiB estáticos (3,02 GiB de pico), lo que permite ejecutarlo en GPUs de consumo para asistentes de documentación local.
- Pipelines de RAG con reordenación estructural: usar las puntuaciones de `page_head` como reordenador o filtro previo antes de un LLM generativo, reduciendo el número de documentos que llegan al modelo grande.

## Benchmarks y rendimiento

Search CTF Speed Run (60 banderas de índice cero, ≤16 lecturas, RTX 4090 en caliente):

| Competidor | Banderas capturadas | Tasa de resolución | Latencia / ejecución | Segundos / bandera |
|---|---:|---:|---:|---:|
| Scuttle-1.7B (modelo de decisión de 100 enlaces) | 45 / 60 | 75,0% | 1,19 s | 1,59 s |
| Qwen3-Reranker-0.6B (neuronal de 24 enlaces) | 22 / 60 | 36,7% | 0,65 s | 1,78 s |
| LFM3-1.7B Generative Agent (mismos pesos 1.7B) | 10 / 60 | 16,7% | 8,43 s | 50,56 s |
| BM25 Graph (léxico en CPU) | 25 / 60 | 41,7% | 0,02 s | 0,04 s |

Comparativa controlada con y sin Scuttle (1.049 consultas, presupuesto idéntico de 16 documentos):

| Dominio | Consultas | Recall@16: BM25 → Scuttle | Top-3: BM25 → Scuttle | Recuperación de fallos BM25 |
|---|---:|---:|---:|---:|
| LitSearch (CS/NLP) | 199 | 59,8% → 64,3% (+4,5) | 37,2% → 53,3% (+16,1) | 26 / 80 (32,5%) |
| eCFR (derecho federal EE. UU.) | 402 | 55,2% → 63,4% (+8,2, p=0,0008) | 35,3% → 38,8% (+3,5) | 63 / 180 (35,0%) |
| Wikispeedia (temas enmascarados) | 448 | 37,5% → 61,2% (+23,7, p<10⁻²⁰) | 24,6% → 52,2% (+27,7) | 121 / 280 (43,2%) |
| Combinado | 1.049 | 48,5% → 62,6% (+14,1 pts) | 31,1% → 47,3% (+16,2 pts) | 210 / 540 (38,9%) |

Cuantización con baja VRAM (BF16 vs 8-bit vs 4-bit NF4):

| Precisión | VRAM estática | VRAM pico (100 enlaces) | CTF de 60 banderas | Retención | Latencia / ejecución | AUC / F1 de página |
|---|---:|---:|---:|---:|---:|---:|
| BF16 | 3,22 GiB | 3,99 GiB | 45 / 60 (75,0%) | 100,0% | 1.491 ms | 0,9546 / 0,7379 |
| 8-bit (LLM.int8) | 2,40 GiB | 3,89 GiB | 44 / 60 (73,3%) | 97,8% | 1.905 ms | 0,9565 / 0,7475 |
| 4-bit NF4 (recomendado) | 1,70 GiB | 3,02 GiB | 45 / 60 (75,0%) | 100,0% | 1.564 ms | 0,9534 / 0,7523 |

## Requisitos de hardware

- VRAM estática en BF16: 3,22 GiB; pico con 100 enlaces: 3,99 GiB.
- VRAM estática en 8-bit: 2,40 GiB; pico: 3,89 GiB.
- VRAM estática en 4-bit NF4 (recomendado): 1,70 GiB; pico: 3,02 GiB.
- Cabe en GPUs de consumo: los benchmarks se ejecutaron en una RTX 4090 en caliente; con 4-bit NF4 (3,02 GiB de pico) es viable en GPUs consumer con ≥4 GB de VRAM.
- GPUs de datacenter (A100, H100) no son necesarias para inferencia, pero pueden aumentar el throughput en despliegues multi-consulta.
- Opciones de despliegue: paquete `scuttle-search` con CLI (`scuttle index`, `scuttle search`), servidor MCP (`scuttle-mcp`) y carga vía `transformers` con `custom_code`.
- Latencia medida: 1.491 ms (BF16), 1.905 ms (8-bit) y 1.564 ms (4-bit NF4) por ejecución de 100 enlaces en RTX 4090.
- Throughput: no se han publicado métricas de tokens/s ni consultas/s agregadas; el modelo no genera tokens de texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Scuttle-1.7B | 1,73B | 262K | Decisión de 100 enlaces por pasada, sin generación | LFM Open v1.0 | Hugging Face + GitHub (MIT para CLI/MCP) |
| LFM3-1.7B (base) | 1,7B | 262K | Generación de texto / agente generativo | LFM Open v1.0 | Hugging Face (Liquid AI) |
| Qwen3-Reranker-0.6B | 0,6B | no disponible | Reranking neuronal de 24 enlaces | no disponible en la información | Hugging Face |
| BM25 Graph | no aplica | no aplica | Recuperación léxica en CPU | no aplica | Implementación propia |

En el benchmark CTF, Scuttle-1.7B supera a Qwen3-Reranker-0.6B en tasa de resolución (75,0% vs 36,7%) y a LFM3-1.7B como agente generativo (75,0% vs 16,7%), con una latencia por ejecución 7,1 veces menor que este último. BM25 es mucho más rápido por ejecución (0,02 s) pero captura menos banderas (41,7%).

## Limitaciones y advertencias

- Modelo especializado: no genera texto ni mantiene conversaciones; usarlo fuera de tareas de decisión sobre grafos producirá resultados sin sentido.
- Solo inglés: la model card declara únicamente `en`; el rendimiento en otros idiomas no está evaluado.
- Dependencia del grafo: requiere indexar previamente los documentos y sus enlaces; sin un grafo de calidad, las cabezas de decisión no aportan ventaja.
- Riesgo de calibración: las probabilidades de `page_head` y `link_head` están calibradas sobre las cuatro topologías de entrenamiento; dominios muy distintos pueden degradar la calibración.
- Sesgos: no se documentan análisis de sesgo; los datos de entrenamiento (citas académicas, derecho federal estadounidense, Wikispeedia) pueden introducir sesgos de dominio y de cobertura geográfica.
- Licencia: LFM Open License v1.0, no es una licencia permisiva estándar; es necesario revisar los términos del archivo `LICENSE` antes de uso comercial. El código CLI y MCP sí es MIT.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema joven, poca validación externa.
- Requiere `trust_remote_code` por el uso de `custom_code` en `transformers`.
- El pipeline declarado en Hugging Face es `feature-extraction`, lo que puede confundir a quien espere un modelo generativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Multiqueue/scuttle-1.7b
- Repositorio de código, CLI y servidor MCP (MIT): https://github.com/MLTQ/scuttle
- Grafos de demostración (derecho federal EE. UU., Wikispeedia, vault Markdown): https://github.com/MLTQ/scuttle-demos
- White paper técnico: https://github.com/MLTQ/scuttle/blob/main/WHITEPAPER.md
