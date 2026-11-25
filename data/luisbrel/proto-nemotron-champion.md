# luisbrel/proto-nemotron-champion

## Resumen

Proto-Nemotron es un checkpoint experimental de ajuste posterior (post-training) del modelo NVIDIA Nemotron 3.5 Lightning, publicado por el usuario independiente luisbrel bajo licencia MIT. No se trata de un modelo entrenado desde cero, sino de una recalibración de pesos ("weight surgery") aplicada sobre los pesos del modelo base mediante el framework de investigación Bender-Bench, que el autor describe como un sistema de programación en el espacio de pesos y auto-mejora recursiva (RSI). El modelo está empaquetado exclusivamente para MLX, la librería de Apple, y cuantizado en 4 bits, con un peso en disco de aproximadamente 17,8 GB.

La arquitectura subyacente es híbrida: combina capas Mamba SSM (modelo de espacio de estados) con una mezcla de expertos (MoE) de 128 expertos enrutados más 1 compartido, atención multi-cabeza y predicción multi-token (MTP). El checkpoint declara 31.577.940.288 parámetros totales (unos 31,6 mil millones) distribuidos en 52 capas, con 3,55 mil millones de parámetros activos por token en la configuración por defecto (k=6) y una variante experimental de 4,24 mil millones activos (k=8). La longitud de contexto declarada es de 1.048.576 tokens (1M).

Su relevancia es doble. Por un lado, es un ejemplo poco habitual de "cirugía de pesos" documentada de forma pública sobre un modelo MoE híbrido moderno. Por otro, la propia model card incluye auditorías que contradicen varias de sus afirmaciones de rendimiento: el autor marca explícitamente como "DISPUTED — RE-RUN REQUIRED" las mejoras previamente publicadas y registra regresiones medibles en BBH y MATH-500. Debe tratarse, por tanto, como un artefacto de investigación, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Mamba SSM + MoE (128 expertos enrutados, 6 activos por token, 1 compartido) + atención multi-cabeza + predicción multi-token (MTP) |
| Parametros totales | 31.577.940.288 (~31,6B) |
| Parametros activos | 3,55B (k=6, por defecto); 4,24B (k=8, variante experimental) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Capas | 52 |
| Tipos de cuantizacion | 4-bit affine (checkpoint publicado); no se documentan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería MLX) |
| Tamaño del repo | 17,8 GB |
| Hardware de referencia | Apple Silicon M4 Max, 128 GB de memoria unificada |

## Arquitectura y entrenamiento

El modelo base, Nemotron 3.5 Lightning, emplea una arquitectura híbrida que intercala capas de espacio de estados Mamba con capas de atención y una capa MoE de 128 expertos enrutados más un experto compartido. La selección de expertos por token es de 6 (configuración k=6) o 8 (k=8), lo que determina el número de parámetros activos. La predicción multi-token (MTP) añade cabezas auxiliares que permiten predecir varios tokens futuros, lo que en la práctica habilita decodificación especulativa nativa. El checkpoint publicado está cuantizado en 4 bits en formato affine y empaquetado para MLX.

Lo que distingue a este checkpoint no es un reentrenamiento convencional, sino una recalibración geométrica de pesos en varias etapas que el autor denomina "weight-space programming" dentro de Bender-Bench. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; el proceso descrito es de optimización de pesos, no de ajuste supervisado sobre datos nuevos. La model card incluye además referencias a artefactos de auditoría (scorecards JSON, informes de equivalencia de KV compilada y una auditoría de mecanismo de guardarraíles) que forman parte del aparato experimental del proyecto.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos, con soporte declarado de "thinking mode" implícito en las suites de evaluación de razonamiento (BBH, MATH-500).
- Generación de código: evaluado en LiveCodeBench, con resultados declarados de 100% en la configuración k=8 (n=50).
- Orquestación agéntica: la suite "Hard Agentic Orchestration" mide tareas de agente multi-paso; el modelo obtiene 92% en k=8 según la model card.
- Tool calling / function calling: la model card menciona afirmaciones previas de 100% en tool calling, pero ellas mismas están marcadas como disputadas y retiradas en la versión actual.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.
- Capacidad de ajuste del número de expertos activos por token (k=6 frente a k=8), lo que permite intercambiar latencia por capacidad.
- No se declaran capacidades de visión ni de audio.

## Casos de uso

- Investigación sobre cirugía de pesos en MoE híbridos: el checkpoint sirve como caso de estudio reproducible para analizar cómo la recalibración geométrica de pesos afecta a distintas suites de evaluación, incluidas las regresiones documentadas.
- Evaluación de decodificación especulativa con MTP: las cabezas de predicción multi-token permiten experimentar con decodificación especulativa en MLX sobre Apple Silicon, midiendo el impacto en tok/s.
- Prototipado de agentes en local sobre Mac: con 17,8 GB de huella y 19,9 tok/s en un M4 Max de 128 GB, es viable ejecutar bucles agénticos multi-paso sin conexión a la nube para pruebas de concepto.
- Generación de código asistida en entornos de investigación: los resultados declarados en LiveCodeBench (100% en k=8, n=50) lo hacen adecuado para experimentos de generación de código, siempre con validación humana dado el estado disputado de las métricas.
- Análisis de compromiso capacidad/latencia en MoE: comparar las configuraciones k=6 (3,55B activos, 19,8 tok/s) y k=8 (4,24B activos, 19,9 tok/s) permite estudiar el rendimiento marginal de activar más expertos.
- Estudio de reproducibilidad y auditoría de benchmarks: la model card incluye scorecards, gates estadísticos (ParetoAnchorGate) y resultados de regresión, lo que lo convierte en material útil para investigar prácticas de evaluación y detección de sobreafirmaciones.

## Benchmarks y rendimiento

Resultados declarados en la model card (evaluación head-to-head, n=50 por suite, 200 muestras totales, M4 Max 128 GB MLX):

| Suite | Base Nemotron (k=6) | Proto-Nemotron (k=8) | Delta |
|---|---|---|---|
| LiveCodeBench | 96,0% (48/50) | 100,0% (50/50) | +4,0% |
| Hard Agentic Orchestration | 90,0% (45/50) | 92,0% (46/50) | +2,0% |
| MATH-500 (ancla) | 56,0% (28/50) | 54,0% (27/50) | -2,0% |
| BIG-bench Hard (BBH) | 76,0% (38/50) | 68,0% (34/50) | -8,0% |

La model card indica que la invariable de cero regresiones no se cumple (`zero_regression_invariant_held: false`) y que el gate estadístico `ParetoAnchorGate.strict_rsi_gate` marcó el checkpoint como `REJECTED_REGRESSION` con `max_anchor_regression = 8.0`. Las afirmaciones previas de +32,7% en GPQA, +10,0% en AIME, 100% en tool calling, +3,3% en HumanEval+, +2,0% en GSM8K y 84,38% de macro media en 11 suites están explícitamente marcadas como disputadas y sin respaldo en los scorecards head-to-head. No deben citarse como resultados válidos.

Rendimiento de inferencia declarado: 19,8 tok/s (k=6) y 19,9 tok/s (k=8), con huellas de 17.168,1 MB y 17.176,8 MB respectivamente.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~17,25 GB para el checkpoint 4-bit publicado; en la práctica se necesitan al menos 24 GB de memoria unificada para dejar margen al contexto y al runtime.
- GPU recomendadas: Apple Silicon con memoria unificada amplia; el hardware de referencia es un M4 Max con 128 GB. No hay soporte documentado para CUDA ni ROCm en este checkpoint.
- Compatibilidad con GPU de consumo: no cabe en GPUs NVIDIA de consumo con 8-16 GB por el formato MLX; en Apple Silicon, un Mac con 32 GB o más podría ejecutarlo, aunque no está verificado en la información disponible.
- Opciones de despliegue: `mlx_lm` es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI; el formato safetensors empaquetado para MLX no es directamente portable a esos runtimes sin conversión.
- Latencia y throughput: ~19,8-19,9 tok/s en M4 Max 128 GB según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Proto-Nemotron (este) | 31,6B / 3,55-4,24B | 1M | MIT | safetensors MLX 4-bit | Checkpoint experimental, métricas disputadas |
| NVIDIA Nemotron 3.5 Lightning (base) | ~30B / no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva; referencia de comparación en la model card |
| Alternativas de ~30B MoE | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría fuera del propio modelo base. Cualquier comparación adicional requeriría datos que no están en la información disponible.

## Limitaciones y advertencias

- Estado de investigación: el autor lo describe como proyecto de investigación independiente, no como un modelo validado para producción.
- Métricas disputadas: las mejoras de rendimiento publicadas anteriormente están marcadas como "DISPUTED — RE-RUN REQUIRED" y contradicen las regresiones medidas en BBH (-8,0%) y MATH-500 (-2,0%).
- Regresión verificada: el gate estadístico del propio proyecto marcó el checkpoint como `REJECTED_REGRESSION`; la invariable de cero regresiones no se cumple.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un ajuste de pesos sin datos nuevos de alineación documentados, no hay garantías de calibración.
- Idiomas: no se declara lista de idiomas soportados, lo que impide garantizar calidad multilingüe.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base Nemotron 3.5 Lightning puede tener sus propias condiciones; la información disponible no aclara la compatibilidad de licencias entre el checkpoint derivado y el modelo original.
- Portabilidad: empaquetado exclusivamente para MLX; no hay rutas de despliegue documentadas para CUDA, ROCm ni runtimes estándar de servidor.
- Sesgos: no documentados en la información disponible.
- El checkpoint incluye una variante experimental k=8 en `checkpoints/proto_nemotron_4b_active_experimental/` cuya estabilidad no está validada más allá de los resultados declarados.

## Enlaces

- Hugging Face: https://huggingface.co/luisbrel/proto-nemotron-champion
- DOI del proyecto (Concept DOI citado en la model card): 10.5281/zenodo.24122803
- Artefactos de auditoría citados en la model card (rutas del repositorio del autor): `outputs/proto/02_findings_and_evaluations/HEAD_TO_HEAD_SCORECARD.json`, `outputs/proto/02_findings_and_evaluations/BASELINE_SCORECARD.json`, `outputs/proto/02_findings_and_evaluations/ACTIVE_PARAMETER_SCALING_REPORT.json`, `reports/PROTO_COMPILE_EQUIVALENCE.json`, `reports/PARETO_POWERED_GATE_AUDIT.json`, `reports/GUARDRAIL_MECHANISM_AUDIT.json`
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
