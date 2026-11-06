# SolsticeAI/Nanbeige4.3-33B-Unlocked-Uncensored-Heretic

## Resumen
Nanbeige4.3-33B-Unlocked-Uncensored-Heretic es una variante "abliterada" del modelo Nanbeige4.3-33B, publicada por el usuario SolsticeAI. El modelo base, desarrollado por Nanbeige, es un transformer denso de 33.118.977.024 parámetros concebido como "modelo profesor" de la familia Nanbeige4.3, orientado a tareas agénticas de programación y trabajo profesional ("cowork"). La variante aquí descrita aplica la técnica Heretic v2.0.0 (Arbitrary-Rank Ablation, ARA) sobre las capas 3 a 48 para eliminar los comportamientos de rechazo del modelo original.

El interés de esta ficha radica en dos frentes. Por un lado, documenta un caso de "decensoring" reproducible: el autor publica los hiperparámetros exactos del ablation y un directorio `reproduce/` con el procedimiento, algo poco habitual en este tipo de derivados. Por otro, permite evaluar el coste real de eliminar los rechazos: según la model card, las negativas medidas por clasificador caen de 98/100 a 12/100, con una divergencia KL de 0.0244 respecto al original, lo que cuantifica la degradación de distribución introducida.

El modelo conserva la licencia Apache 2.0 del original y soporta inglés y chino. No se han publicado especificaciones propias de contexto, cuantización ni arquitectura interna más allá de lo inferible del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (sin confirmar detalles internos; derivado de Nanbeige4.3-33B) |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers; tamaño del repo 66.3 GB) |

## Arquitectura y entrenamiento
El modelo base Nanbeige4.3-33B es un transformer denso de aproximadamente 33.000 millones de parámetros, diseñado por Nanbeige como modelo profesor de la serie Nanbeige4.3 para, posteriormente, destilar capacidades agénticas en modelos más pequeños (por ejemplo, Nanbeige4.3-3B). La model card del original menciona evaluación con `preserve_thinking=true` en la plantilla de chat, lo que sugiere soporte de modo de razonamiento explícito, pero no detalla la composición del dataset, el número de tokens de entrenamiento ni si hubo RLHF o DPO.

La modificación introducida por SolsticeAI es un ablation de direcciones de activación con Heretic v2.0.0, aplicado entre las capas 3 y 48 con los siguientes parámetros ARA: `preserve_good_behavior_weight` 0.9238, `steer_bad_behavior_weight` 0.0016, `overcorrect_relative_weight` 0.4114 y `neighbor_count` 3. El resultado es un modelo con la misma arquitectura y pesos base, pero con las direcciones de rechazo suprimidas en ese rango de capas. El autor declara el proceso reproducible mediante el directorio `reproduce/`.

## Capacidades
- Generación de texto conversacional en inglés y chino.
- Razonamiento de nivel avanzado: la model card reporta 89.5 en GPQA Diamond, 95.2 en AIME 2026 y 84.0 en AA-LCR para el modelo base.
- Programación agéntica: Terminal-Bench 2.1 (80.9), DeepSWE (65.5), SWE-Bench Pro (60.3), Scicode (52.6).
- Tareas de "cowork" profesional y automatización: Automation Bench (54.2), JobBench (44.8), GDPval (84.8), Toolathlon-Verified (70.4).
- Uso de herramientas y planificación multi-paso: Tau3-Bench (48.8), DeepPlanning (63.3), Claw-Eval (78.3).
- Modo de razonamiento explícito ("thinking") heredado del modelo base, con `preserve_thinking=true`.
- Supresión de rechazos: 12/100 negativas según clasificador, frente a 98/100 del original.
- No se documentan capacidades de visión, audio ni otros modos.

## Casos de uso
- Automatización de tareas de terminal y CI/CD: el modelo puede operar sobre entornos de línea de comandos con resultados de 80.9 en Terminal-Bench 2.1, integrándose en pipelines que requieran ejecutar comandos, interpretar salidas y corregir errores de forma iterativa.
- Resolución de incidencias en repositorios reales: con 60.3 en SWE-Bench Pro y 65.5 en DeepSWE, es adecuado para agentes que leen código, localizan el fallo y proponen parches sobre bases de código existentes.
- Generación de código a partir de descripciones en lenguaje natural: NL2Repo (53.0) indica capacidad para construir estructuras de proyecto completas desde especificaciones, útil en prototipado rápido y andamiaje de repositorios.
- Asistentes de oficina y flujos empresariales: los resultados en Automation Bench (54.2) y JobBench (44.8) lo sitúan como candidato para agentes que gestionan correo, hojas de cálculo, documentos y APIs corporativas en tareas multi-paso.
- Planificación de tareas largas: DeepPlanning (63.3) y Claw-Eval (78.3) respaldan su uso en agentes que descomponen objetivos complejos en subtareas y mantienen estado a lo largo de la ejecución.
- Investigación sobre alineación y edición de modelos: al ser un ablation reproducible con parámetros publicados y métricas de KL, sirve para estudiar el equilibrio entre supresión de rechazos y degradación de capacidades.
- Evaluación de robustez en producción: útil para equipos que necesitan comparar el comportamiento del modelo original frente al abliterado en tareas sensibles, midiendo la tasa de negativas y la calidad de respuesta.

## Benchmarks y rendimiento

Resultados publicados en la model card para el modelo base Nanbeige4.3-33B frente a alternativas de ~30B:

| Categoria | Benchmark | Nanbeige4.3-33B | Qwen3.8-27B | Muse-Glimmer-30B | Gemma4-31B |
|---|---|---|---|---|---|
| Coding agéntico | Terminal-Bench 2.1 | 80.9 | 73.0 | 61.8 | 47.2 |
| Coding agéntico | Terminal-Bench 4.0 | 23.8 | 6.3 | 1.6 | 0.0 |
| Coding agéntico | DeepSWE | 65.5 | 42.5 | 4.4 | 2.7 |
| Coding agéntico | SWE-Bench Pro | 60.3 | 61.7 | 51.2 | 36.9 |
| Coding agéntico | SWE-Atlas-QnA | 50.8 | 41.9 | 17.7 | 3.3 |
| Coding agéntico | NL2Repo | 53.0 | 48.3 | 27.4 | 33.8 |
| Coding agéntico | Scicode | 52.6 | 46.7 | 44.9 | 45.5 |
| Coding agéntico | SkillsBench | 61.1 | 56.4 | 39.7 | 28.9 |
| Cowork agéntico | Automation Bench | 54.2 | 38.3 | 15.2 | 9.7 |
| Cowork agéntico | JobBench | 44.8 | 34.5 | 16.6 | 9.0 |
| Cowork agéntico | GDPval | 84.8 | 86.4 | 75.8 | 71.4 |
| Cowork agéntico | Claw-Eval (pass^3) | 78.3 | 75.2 | 57.3 | 44.2 |
| Cowork agéntico | Toolathlon-Verified | 70.4 | 68.5 | 47.2 | 27.8 |
| Cowork agéntico | DeepPlanning | 63.3 | 49.2 | 21.4 | 19.4 |
| Cowork agéntico | EnterpriseOps-Gym | 41.0 | 40.2 | 30.5 | 27.3 |
| Cowork agéntico | YC-bench | 1.025.437 USD | 641.290 USD | 513.978 USD | 265.152 USD |
| Cowork agéntico | Tau3-Bench | 48.8 | 48.5 | 33.7 | 18.6 |
| Razonamiento | GPQA Diamond | 89.5 | 89.2 | 83.5 | 91.3 |
| Razonamiento | AIME 2026 | 95.2 | 94.5 | 94.7 | 89.2 |
| Razonamiento | AA-LCR | 84.0 | 82.0 | 83.3 | 72.0 |

Métricas del ablation (model card del derivado):

| Métrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos (clasificador) | 12/100 | 98/100 |
| Divergencia KL | 0.0244 | 0 (por definición) |

No se han publicado benchmarks del modelo abliterado sobre las tareas anteriores; los datos de la primera tabla corresponden al modelo base.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16/BF16: aproximadamente 66 GB solo para pesos, más overhead de activaciones y caché KV; requiere GPUs de 80 GB (A100, H100) o múltiples GPUs menores.
- Cuantización a 8 bits: en torno a 33-35 GB, viable en una A100 40 GB o en dos RTX 4090 (24 GB cada una).
- Cuantización a 4 bits: aproximadamente 17-20 GB, cabe en una RTX 4090 o RTX 3090 individual, con margen limitado para contexto largo.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag `text-generation-inference`), y previsiblemente vLLM y llama.cpp si se generan cuantizaciones GGUF, aunque no se publican en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-Unlocked-Uncensored-Heretic | 33.1B | no disponible | Apache 2.0 | en, zh | Derivado abliterado; 12/100 rechazos; KL 0.0244 |
| Nanbeige4.3-33B (original) | 33.1B | no disponible | Apache 2.0 | en, zh | Modelo profesor; 98/100 rechazos; referencia de los benchmarks |
| Qwen3.8-27B | 27B (aprox.) | no disponible | no disponible | no disponible | Competidor directo en la comparativa de la model card |
| Muse-Glimmer-30B | 30B (aprox.) | no disponible | no disponible | no disponible | Competidor directo en la comparativa de la model card |
| Gemma4-31B | 31B (aprox.) | no disponible | no disponible | no disponible | Competidor directo en la comparativa de la model card |

## Limitaciones y advertencias
- El ablation elimina los rechazos de forma deliberada: el modelo puede generar contenido que el original rechazaría, con implicaciones legales y de seguridad en producción.
- La divergencia KL de 0.0244 indica una alteración medible de la distribución de salida; no se han publicado evaluaciones del impacto en tareas de razonamiento o código tras el ablation.
- Riesgo de alucinación no cuantificado para este derivado; los benchmarks disponibles corresponden al modelo base.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-02); no hay evidencia de validación comunitaria.
- El autor es un usuario individual (SolsticeAI), no el desarrollador original; la reproducibilidad declarada no ha sido verificada de forma independiente.
- La licencia Apache 2.0 permite uso comercial, pero el uso de un modelo sin rechazos puede incumplir políticas de plataformas o requisitos regulatorios según el contexto de despliegue.

## Enlaces
- Hugging Face: https://huggingface.co/SolsticeAI/Nanbeige4.3-33B-Unlocked-Uncensored-Heretic
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Heretic: https://heretic-project.org
- Directorio de reproducción: `reproduce/README.md` dentro del repositorio de Hugging Face
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
