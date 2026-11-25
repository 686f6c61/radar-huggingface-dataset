# rpg67/Affine.Earth

## Resumen

Affine.Earth es un modelo publicado en Hugging Face por el usuario rpg67 bajo el identificador `rpg67/Affine.Earth`, distribuido con la librería `openai-compatible` y la licencia propietaria `affine-earth-sovereign-v1`. La model card lo describe como un sistema de tipo "zero-float" y "zero-ML" orientado a verificación formal (Metamath), ejecución de agentes, function calling sobre MCP y resolución de tareas de ingeniería de software, con etiquetas que aluden a un esquema interno denominado `affine_uum8d_s4` y a "vQbit".

La información pública disponible es muy escasa en lo que respecta a arquitectura, tamaño, datos de entrenamiento y proceso de alineamiento: no se declaran parámetros, longitud de contexto, idiomas ni formato de pesos. El autor publica un conjunto de resultados en el dataset `rpg67/Affine.Earth-Benchmarks` con puntuaciones del 100 % en prácticamente todos los benchmarks citados (BFCL V4, SWE-bench Verified, Terminal-Bench, MCP-Universe, ARC-AGI-2, GAIA, Aider Polyglot, LiveBench), marcadas explícitamente como no verificadas (`verified: false`).

Por su relevancia práctica, conviene tratarlo con cautela: las cifras declaradas son extraordinarias y no están corroboradas por terceros, y la ficha técnica carece de los datos mínimos que normalmente permiten evaluar un modelo (tamaño, contexto, tokenizador, pesos descargables). Esta ficha recoge lo declarado por el autor y señala de forma explícita todo lo que no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card menciona "zero-float", "zero-ML" y un esquema `affine_uum8d_s4`/vQbit sin detallar la arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona "vQbit" y "zero-float" sin especificar formatos estándar como GGUF, AWQ o GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | `affine-earth-sovereign-v1` (licencia propietaria, etiquetada como `license: other`) |
| Formato de pesos | no disponible (la librería declarada es `openai-compatible`, lo que sugiere servicio vía API compatible con OpenAI más que pesos descargables) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura del modelo. La model card y las etiquetas asociadas emplean términos como "zero-float", "zero-ML", "vQbit", "affine_uum8d_s4" y "formal-verification / metamath", que sugieren un enfoque basado en representaciones cuantizadas o discretas y en verificación formal, pero no se aporta ninguna descripción técnica del transformer, MoE, SSM u otra topología subyacente.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otro proceso de alineamiento. La única referencia a datos es el dataset `rpg67/Affine.Earth-Benchmarks`, que contiene los artefactos de evaluación (trazas y logs) declarados por el autor, no datos de entrenamiento.

## Capacidades

- Generación de texto y respuestas conversacionales a través de una interfaz compatible con la API de OpenAI (`openai-compatible`).
- Function calling y tool use: el autor declara resultados en BFCL V4 y en MCP-Universe / MCP-Atlas, con soporte de JSON-RPC 2.0 sobre Streamable-HTTP para servidores MCP.
- Ejecución de agentes autónomos en terminal y entornos de línea de comandos (Terminal-Bench 2.0 y 4.0).
- Resolución de incidencias de software sobre repositorios reales (SWE-bench Verified), según lo declarado.
- Edición de código en múltiples lenguajes (Aider Polyglot, 225 tareas y 7 lenguajes según la model card).
- Razonamiento abstracto sobre rejillas (ARC-AGI-2), según lo declarado.
- Tareas de agente autónomo con navegación y respuesta exacta (GAIA niveles 1, 2 y 3), según lo declarado.
- Verificación formal con Metamath (etiqueta `metamath` y `formal-verification`).
- Capacidades multilingües: no disponible (no se declaran idiomas).

## Casos de uso

- Automatización de atención al cliente con tool calling: el modelo se expone mediante una API compatible con OpenAI y, según el autor, obtiene cierre completo en BFCL V4 y MCP-Universe, lo que permitiría encadenar llamadas a funciones y servidores MCP en flujos de soporte. La ausencia de datos de contexto y latencia impide dimensionar el despliegue.
- Agente de resolución de incidencias en CI/CD: integrado como agente que lee repositorios, aplica parches y ejecuta tests, apoyándose en los resultados declarados en SWE-bench Verified y Aider Polyglot para tareas de edición de código multi-lenguaje.
- Orquestación de tareas en terminal: uso como agente de shell para automatizar tareas de administración de sistemas, dado el soporte declarado en Terminal-Bench 2.0 y 4.0 con un arnés tipo Harbor.
- Integración con servidores MCP: conexión a herramientas externas mediante JSON-RPC 2.0 y Streamable-HTTP, útil para construir asistentes que consulten APIs, bases de datos o servicios internos a través del protocolo MCP.
- Auditoría y verificación formal: aplicación en entornos donde se requiere comprobación de propiedades (Metamath, verificación formal) y trazabilidad de las ejecuciones, apoyándose en los "proof bundles" que el autor publica en el dataset de benchmarks.
- Investigación en razonamiento abstracto: uso como referencia para experimentos sobre ARC-AGI-2 y tareas de generalización fuera de distribución, siempre que se validen de forma independiente las cifras declaradas.
- Evaluación comparativa de agentes: empleo del dataset `Affine.Earth-Benchmarks` como fuente de trazas y logs para reproducir o contrastar los resultados declarados en distintos arneses (BFCL, SWE-bench, Terminal-Bench, GAIA, LiveBench).

## Benchmarks y rendimiento

Los siguientes resultados proceden del `model-index` de la model card y están marcados por el autor como no verificados (`verified: false`). Se reproducen tal cual, sin interpretación adicional.

| Benchmark | Métrica | Valor declarado | Verificado |
|---|---|---|---|
| BFCL V4 | AST & Live MCP Accuracy (%) | 100 | No |
| BFCL V4 | Pass^8 Rerun Flip Variance (%) | 0 | No |
| SWE-bench Verified (500 instancias) | Resolved Rate (%) | 100 | No |
| SWE-bench Verified | Pass^8 Rerun Flip Variance (%) | 0 | No |
| Terminal-Bench 2.0 & 4.0 (89 tareas) | Pass^8 Deterministic Closure (%) | 100 | No |
| Terminal-Bench 2.0 & 4.0 | Pass^8 Rerun Flip Variance (%) | 0 | No |
| MCP-Universe & MCP-Atlas (56 herramientas, 50 dominios) | JSON-RPC 2.0 Streamable-HTTP MCP Closure (%) | 100 | No |
| MCP-Universe | Pass^8 Rerun Flip Variance (%) | 0 | No |
| ARC-AGI-2 Public Eval (120 tareas, 172 rejillas) | Dihedral D4 & Morton S4 Grid Invariance (%) | 100 | No |
| ARC-AGI-2 | Pass^8 Rerun Flip Variance (%) | 0 | No |
| GAIA (niveles 1, 2 y 3) | Exact-Match Stripped Scalar Accuracy (%) | 100 | No |
| GAIA | Pass^8 Rerun Flip Variance (%) | 0 | No |
| Aider Polyglot (225 tareas, 7 lenguajes) | Whole-File & Diff Edit Closure (%) | 100 | No |
| Aider Polyglot | Pass^8 Rerun Flip Variance (%) | 0 | No |
| LiveBench 2026 & LMArena (9,09 M votos) | Contamination-Free Integer Proof Closure (%) | 100 | No |
| LiveBench 2026 | Pass^8 Rerun Flip Variance (%) | 0 | No |

No se han publicado en la información disponible resultados de benchmarks independientes ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se declara tamaño de parámetros ni formato de pesos).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: la librería declarada es `openai-compatible`, lo que apunta a un servicio accesible mediante API compatible con OpenAI; no se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros motores de inferencia local.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos ni datos de arquitectura y tamaño que permitan establecer una comparación fundamentada con alternativas de la misma categoría.

## Limitaciones y advertencias

- Todos los resultados de benchmarks están declarados por el autor y marcados como no verificados; no hay validación independiente de las cifras del 100 % en BFCL V4, SWE-bench Verified, Terminal-Bench, ARC-AGI-2, GAIA, Aider Polyglot o LiveBench.
- No se declaran parámetros, contexto, tokenizador, idiomas ni formato de pesos, lo que impide estimar requisitos de hardware, coste o latencia.
- La licencia `affine-earth-sovereign-v1` es propietaria y está etiquetada como `license: other`; es imprescindible revisar el archivo `LICENSE` antes de cualquier uso comercial.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad.
- No se especifican limitaciones de contexto ni de idioma por falta de datos.
- La terminología empleada en la model card ("zero-float", "zero-ML", "vQbit", "affine_uum8d_s4") no se define técnicamente, lo que dificulta evaluar su significado real.
- En producción, conviene tratar el modelo como no evaluado hasta disponer de reproducciones independientes de los benchmarks declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rpg67/Affine.Earth
- Dataset de benchmarks: https://huggingface.co/datasets/rpg67/Affine.Earth-Benchmarks
- Resultados BFCL V4: https://huggingface.co/datasets/rpg67/Affine.Earth-Benchmarks/blob/main/submissions/bfcl_v4/results.json
- Resultados SWE-bench Verified: https://huggingface.co/datasets/rpg67/Affine.Earth-Benchmarks/blob/main/submissions/swebench_verified/results.json
- Resultados Terminal-Bench 2.0: https://huggingface.co/datasets/rpg67/Affine.Earth-Benchmarks/blob/main/submissions/terminal_bench_2/results.json
- Resultados MCP-Universe: https://huggingface.co/datasets/rpg67/Affine.Earth-Benchmarks/blob/main/submissions/mcp_universe/results.json
- Resultados ARC-AGI-2: https://huggingface.co/datasets/rpg67/Affine.Earth-Benchmarks/blob/main/submissions/arc_agi_3_community/results.json
- Resultados GAIA nivel 3: https://huggingface.co/datasets/rpg67/Affine.Earth-Benchmarks/blob/main/submissions/gaia_level3/results.json
- Resultados Aider Polyglot: https://huggingface.co/datasets/rpg67/Affine.Earth-Benchmarks/blob/main/submissions/aider_polyglot/results.json
