# peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e

## Resumen

Tiel-Coder-35B-A3B-MLX-oQ6e es una re-cuantizacion del modelo Ornith-1.5-35B-A3B, creada por el usuario peculiar-ragdoll, orientada a codificacion agente y conversaciones multi-turno. El modelo base es un MoE (mixture of experts) derivado de la familia Qwen3.5-MoE, con soporte de vision (image-text-to-text) y un chat template propio denominado Sharp, que prioriza respuestas cortas y directas. Esta version concreta utiliza el cuantizador oQ6e de oMLX, con precision mixta dinamica de 6 bits y un paso de imatrix, lo que reduce el peso a 29.5 GB y lo hace ejecutable en hardware Apple Silicon.

Su relevancia radica en que ofrece un rendimiento competitivo en tareas de codificacion agente (SWE-bench-Live) con un coste de inferencia bajo, gracias a su arquitectura MoE con solo 3 mil millones de parametros activos (segun la nomenclatura del nombre). El autor publica tambien una version GGUF con los mismos pesos, y esta version MLX esta pensada para el ecosistema oMLX y mlx-vlm. Es importante senalar que los benchmarks publicados en la model card se midieron sobre el build GGUF, no sobre este archivo MLX, por lo que los resultados pueden variar ligeramente.

El modelo esta disponible bajo licencia MIT, soporta ingles y chino, e incluye capacidades de vision sin necesidad de un proyector separado. Su principal debilidad es el conocimiento enciclopedico y el razonamiento de tipo examen, donde puntua muy por debajo de alternativas como Nail.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) basada en Qwen3.5-MoE, con modulo de vision |
| Parametros totales | 8.150.462.320 (segun safetensors; la nomenclatura del modelo indica 35B totales y 3B activos, pero el archivo contiene esta cantidad) |
| Parametros activos | 3B (segun la nomenclatura del nombre, no confirmado en el archivo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6e (6-bit dinamico con imatrix), tambien existe version oQ4e |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una re-cuantizacion de Ornith-1.5-35B-A3B, que a su vez es un MoE derivado de la arquitectura Qwen3.5-MoE. La arquitectura combina un transformer con mezcla de expertos, donde solo una fraccion de los parametros se activa por token (3B activos segun el nombre). Incluye un modulo de vision que permite procesar imagenes junto con texto, y el checkpoint incorpora el chat template Sharp, disenado para producir respuestas concisas y evitar divagaciones. No se han publicado detalles sobre el entrenamiento original (datos, tokens, tecnicas de alineacion) porque este repositorio es una adaptacion posterior, no un entrenamiento desde cero.

La cuantizacion oQ6e utiliza precision mixta dinamica con una matriz de importancia (imatrix), lo que mejora la calidad respecto a cuantizaciones uniformes. El autor advierte que el archivo no incluye el bloque MTP (multi-token prediction) que Ornith-1.5 tenia en su conversion GGUF, porque esos pesos estaban sin entrenar y fueron eliminados. Para decodificacion especulativa existe una version separada con el MTP entrenado.

## Capacidades

- Codificacion agente: resuelve problemas reales de repositorios (SWE-bench-Live) con una tasa de exito de 12/25, similar a Opus 4.6 medium.
- Conversacion multi-turno: puntua 67.2 en Claw-Eval, superando a su base (65.3) y a Nail (60.5), con mejor calidad de respuesta y menos preguntas de aclaracion.
- Vision: procesa imagenes y responde preguntas sobre ellas (image-text-to-text), sin necesidad de archivos de proyector separados.
- Generacion de texto y razonamiento basico: aunque su rendimiento en tareas de conocimiento general es bajo (MMLU-Pro 73.7), es adecuado para tareas de codigo y agentes.
- Multilingue: soporta ingles y chino.
- Tool calling: no se menciona explicitamente en la documentacion, pero al ser un modelo de codificacion agente es probable que lo soporte; no se confirma.

## Casos de uso

- Asistente de codificacion en repositorios reales: el modelo puede analizar issues, proponer parches y ejecutar tareas de mantenimiento de codigo, con una tasa de exito de 12/25 en SWE-bench-Live y un tiempo medio por intento de 8.6 minutos (mediana), lo que lo hace util para integracion en pipelines de CI/CD.
- Chat de soporte tecnico conversacional: gracias a su buen rendimiento en conversaciones multi-turno (67.2 en Claw-Eval), puede mantener dialogos largos con usuarios sin perder el hilo, ideal para atencion al cliente o asistentes de documentacion.
- Analisis de capturas de pantalla o diagramas: al incluir vision, puede describir el contenido de imagenes, util para revisar UI, diagramas de arquitectura o documentacion visual.
- Agente autonomo de resolucion de bugs: con el template Sharp y su capacidad de razonamiento, puede iterar sobre fallos de codigo, probar soluciones y reportar resultados, reduciendo la intervencion humana.
- Traduccion y generacion de documentacion tecnica: soporta ingles y chino, y puede redactar comentarios, docstrings o guias a partir de fragmentos de codigo.
- Prototipado rapido de scripts: su velocidad de inferencia (gracias a los 3B activos) permite generar y refinar scripts en tiempo real, adecuado para entornos interactivos como notebooks o REPLs.

## Benchmarks y rendimiento

Los siguientes resultados provienen de la model card del autor y fueron medidos sobre el build GGUF, no sobre esta version MLX. El propio autor advierte que cambiar de cuantizador (oQ frente a k-quants) puede mover los resultados entre 0.7 puntos en MMLU-Pro y un 24% en recuento de tokens. Se presentan como referencia sobre la calidad del modelo subyacente.

| Benchmark | Tiel-Coder (GGUF) | Ornith-1.5 (base) | Nail (Qwen3.6-35B-A3B) |
|---|---|---|---|
| SWE-bench-Live (problemas resueltos / 25) | 12 | 8 | 9 |
| Claw-Eval multi-turn (puntuacion) | 67.2 | 65.3 | 60.5 |
| MMLU-Pro (4-bit) | 73.7 | 78.0 | 84.0 |

En SWE-bench-Live, Tiel empata con Opus 4.6 medium (12) y supera a Sonnet 5 medium (8). Su tiempo medio por intento es de 8.6 minutos (mediana) y 12.3 minutos (media), mas estable que el de Nail (7.2 mediana, 15.7 media). En MMLU-Pro, la diferencia se atribuye en parte al template Sharp, que favorece respuestas cortas a costa de precision en examenes.

## Requisitos de hardware

- Tamano del repositorio: 29.5 GB (cuantizacion oQ6e). La version oQ4e ocupa aproximadamente 21 GB segun LLM Explorer.
- VRAM estimada: para oQ6e se necesitan al menos 32 GB de memoria unificada en Apple Silicon; para oQ4e, 24 GB pueden ser suficientes.
- GPU recomendadas: cualquier chip Apple Silicon con 32 GB o mas de RAM unificada (M1 Pro/Max/Ultra, M2, M3, M4). No esta disenado para CUDA, ya que usa el framework MLX.
- Opciones de despliegue: oMLX (gestionado), mlx-vlm para generacion de texto e imagen, o los scripts de `mlx_vlm.generate`. No es compatible con vLLM, llama.cpp u Ollama en su forma nativa (existe la version GGUF para esos entornos).
- Latencia y throughput: no se proporcionan datos concretos, pero al ser un MoE con solo 3B activos, la velocidad de inferencia es significativamente mayor que la de un modelo denso equivalente. La model card menciona que Dirk (dense 27B) es 2.5x mas lento que Tiel, lo que sugiere un throughput alto.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B (este) | MoE (Qwen3.5) | 35B (nominal) / 8.15B en safetensors | 3B | no disponible | MIT | MLX, GGUF |
| Nail-Qwen3.6-35B-A3B-GGUF | MoE (Qwen3.6) | 35B | 3B | no disponible | no especificada | GGUF |
| Dirk-Qwen3.8-27B-GGUF | Dense (Qwen3.8) | 27B | 27B | no disponible | no especificada | GGUF |
| Ornith-1.5-35B-A3B | MoE (Qwen3.5) | 35B | 3B | no disponible | MIT | Original |

Tiel supera a Nail en conversacion multi-turno (67.2 vs 60.5) pero pierde en MMLU-Pro (73.7 vs 84.0). Dirk, aunque denso y mas lento, resuelve mas problemas en SWE-bench-Live (15 vs 12). Ornith-1.5, su base, es ligeramente inferior en conversacion (65.3) y superior en MMLU-Pro (78.0). La eleccion depende de si se prioriza velocidad y agente (Tiel) o conocimiento y razonamiento (Nail, Dirk).

## Limitaciones y advertencias

- Conocimiento enciclopedico pobre: el modelo puntua bajo en examenes y trivia (MMLU-Pro 73.7), por lo que no es adecuado para tareas de conocimiento general o preguntas factuales.
- Riesgo de alucinacion: como todo LLM, puede generar informacion falsa, especialmente en contextos de codigo con APIs poco conocidas.
- Solo ingles y chino: no soporta otros idiomas, lo que limita su uso en entornos multilingues.
- Dependencia de Apple Silicon: la version MLX solo funciona en hardware Apple; para otras plataformas es necesario usar la version GGUF.
- Advertencia del autor sobre benchmarks: los resultados publicados se midieron en el build GGUF y pueden variar en esta version MLX (diferencia de 0.7 puntos en MMLU-Pro y 24% en tokens entre cuantizadores).
- Carga incorrecta con mlx-lm: el autor advierte que usar `mlx_lm.load()` produce tokens basura; se debe usar `mlx-vlm` obligatoriamente.
- Sin MTP head: esta version no incluye el bloque de prediccion multi-token, por lo que la decodificacion especulativa no esta disponible (existe una variante separada con el head).
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo base (Ornith-1.5) tambien es MIT, por lo que no hay restricciones adicionales.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e
- Version con MTP head: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP
- Version GGUF (benchmarks medidos): https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Version oQ4e (menor VRAM): https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Modelo base Ornith-1.5-35B-A3B: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Chat template Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Comparativa en LLM Explorer (oQ4e): https://llm-explorer.com/model/peculiar-ragdoll%2FTiel-Coder-35B-A3B-MLX-oQ4e,oIzfKExsnj0ssF03dgstM
- Ficha en AI Market Cap: https://aimarketcap.tech/models/peculiar-ragdoll-tiel-coder-35b-a3b-mlx-oq4e
