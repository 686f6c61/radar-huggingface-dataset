# MalxTech/Threnody-9B-V3-GGUF

## Resumen

Threnody-9B V3 es un ajuste fino (fine-tune) de tipo agéntico sobre el modelo base Qwen/Qwen3.5-9B, desarrollado por MalxTech y distribuido exclusivamente en formato GGUF para su uso con llama.cpp. El modelo está orientado a coding autónomo multi-turno, tool calling robusto a través de distintos esquemas de harness (hasta 8 esquemas diversos), razonamiento científico y eliminación de bucles de acción. Con 8.953.803.264 parámetros (~8,95B), se posiciona como una alternativa de pesos abiertos para pipelines de agentes que necesitan ejecutarse en hardware local o en servidores sin GPUs de gran escala.

La propuesta diferencial del autor es el denominado "zero action looping": un filtro de entrenamiento que descarta estrictamente cualquier trayectoria con `max_repeat >= 2`, priorizando la no repetición de acciones por encima de la recuperación de errores. Según la model card, el modelo supera a Qwen3.5-9B Base y a la versión V2 en las cuatro suites evaluadas a fuerza completa (`s1.0`), aunque los datos publicados muestran resultados mixtos en algunos benchmarks (por ejemplo, OmniAgent-Bench baja de 92,7% a 84,6% respecto al base).

El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial, y se acompaña de un adaptador multimodal (`mmproj-Threnody-9B-V3-F16.gguf`) que habilita capacidades de visión a través de llama.cpp. El repositorio ocupa 39,5 GB e incluye cuantizaciones desde IQ3_M hasta Q8_0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas DeltaNet nativas (según model card: "native DeltaNet hybrid layers"); detalles completos no disponibles |
| Parámetros totales | 8.953.803.264 (~8,95B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuración de ejemplo en llama-server: `-c 32768`); máximo nativo no disponible |
| Tipos de cuantización | IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (GGUF); mmproj en F16 |
| Idiomas soportados | No disponibles (heredados de Qwen3.5-9B, sin confirmación explícita) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (solo cuantizado; no se publican safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer de ~9B parámetros. La model card menciona que el entrenamiento se realizó sobre A100-80GB utilizando "chunked cross-entropy" y "native DeltaNet hybrid layers", lo que sugiere una arquitectura híbrida que combina atención con capas de tipo DeltaNet (una variante de atención lineal/SSM). No se detalla la composición exacta de capas ni la proporción entre atención completa y DeltaNet.

El ajuste fino se realizó sobre un currículo multi-tarea de aproximadamente 35 millones de tokens, con la siguiente composición declarada: 35% trazas de agentes multi-esquema, 20% coding algorítmico verificado, 20% Open-SWE-Traces, 15% razonamiento BioChem y 10% ciberseguridad y juicio de herramientas. Se preservaron "scratchpads" intercalados con etiquetas `<think>` en aproximadamente el 75% de las trayectorias, con soporte de conmutación de modo (thinking/no-thinking). El filtro anti-bucle descarta trayectorias con dos o más repeticiones consecutivas de acción. No se especifica si se empleó RLHF, DPO u otra técnica de alineación preferencial; tampoco se detalla la composición lingüística del dataset.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo "thinking" intercalado (`<think>`) y conmutación entre modos.
- Coding agéntico autónomo multi-turno, incluyendo tareas de tipo Open-SWE.
- Tool calling y function calling robusto a través de múltiples esquemas de harness (hasta 8 esquemas diversos según la model card).
- Ejecución de agentes sin bucles de acción repetidos (filtro zero-repeat).
- Razonamiento científico en biología y química (BioChem).
- Juicio de herramientas y ciberseguridad (10% del currículo).
- Capacidades multimodales (visión) mediante el adaptador `mmproj-Threnody-9B-V3-F16.gguf`.
- Capacidades multilingües: no confirmadas explícitamente; presumiblemente heredadas de Qwen3.5-9B.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).

## Casos de uso

- **Agentes de coding autónomo en local**: el modelo puede ejecutar bucles de edición-compilación-test sobre repositorios mediante tool calling, con 32K de contexto y sin necesidad de GPU de datacenter si se usa Q4_K_M en una GPU consumer. El filtro anti-bucle reduce el riesgo de bucles infinitos en pipelines de CI.
- **Asistentes de terminal integrados en llama.cpp**: gracias a la compatibilidad con `llama-server --jinja` y plantillas de chat fijadas, se puede desplegar como servidor local de agentes para tareas de shell, git y edición de ficheros.
- **Automatización de revisiones de código en CI/CD**: integrado como paso de un pipeline, el modelo puede analizar diffs, invocar linters o tests mediante tool calling y emitir juicios sobre la calidad del cambio.
- **Razonamiento científico asistido en bioquímica**: con un 15% del currículo dedicado a BioChem y resultados de 78,5% en BioChem-Hard, es adecuado para asistentes de laboratorio que responden preguntas de biología y química con razonamiento explícito.
- **Análisis de documentos e imágenes en local**: usando el adaptador `mmproj` en F16, se pueden procesar capturas, diagramas o documentos escaneados junto con texto en un mismo flujo, sin salir del entorno local.
- **Evaluación de seguridad y juicio de herramientas**: el 10% del currículo en ciberseguridad permite usarlo como agente de triaje que decide si una herramienta es apropiada para una tarea dada, útil en orquestadores multi-agente.
- **Despliegue en entornos con requisitos de soberanía de datos**: al ser Apache 2.0 y ejecutable en llama.cpp, permite procesar código y datos sensibles sin enviarlos a APIs externas.

## Benchmarks y rendimiento

Datos publicados en la model card, evaluados con llama.cpp en Q8_0 y Q4_K_M, plantilla de chat fijada, temperatura 0 y modo no-thinking:

| Benchmark | Qwen3.5-9B Base | Threnody-9B V2 (s0.3) | Threnody-9B V3 (s1.0) |
|---|---|---|---|
| OmniAgent-Bench (Weighted) | 92,7% | 92,7% | 84,6% |
| AgentLoop In-Harness (14 tareas) | 11/14 (78,6%) | 11/14 (78,6%) | 10/14 (71,4%) |
| AgentLoop Held-Out (opencode, 14) | 12/14 (85,7%) | 10/14 (71,4%) | 13/14 (92,9%) |
| AgentLoop-Hard (30 tareas held-out) | 19/30 (63,3%) | N/A | 17/30 (56,7%) |
| BioChem-Hard (global) | 76,0% | 37,6% | 78,5% |
| ↳ Biología | 86,5% | 44,5% | 86,5% |
| ↳ Química | 69,4% | 14,1% | 73,5% |
| MMLU-Pro Bio+Chem (400 preguntas) | 76,0% | 76,5% | 78,5% |

No se han publicado resultados de benchmarks estándar (MMLU general, HumanEval, GSM8K) en la información disponible. Los resultados de OmniAgent-Bench y AgentLoop In-Harness son inferiores al modelo base, mientras que Held-Out, BioChem y MMLU-Pro Bio+Chem mejoran. La afirmación de "strict dominance" de la model card no se sostiene con los propios números publicados.

## Requisitos de hardware

- **VRAM estimada para inferencia** (solo pesos, sin KV cache): IQ3_M ≈ 3,5-4 GB; IQ4_XS ≈ 4,5-5 GB; Q4_K_M ≈ 5,5-6 GB; Q5_K_M ≈ 6,5-7 GB; Q6_K ≈ 7,5-8 GB; Q8_0 ≈ 9,5-10 GB.
- **KV cache**: con contexto de 32K y `-ctk q8_0 -ctv q8_0` (recomendado por el autor) se añaden aproximadamente 2-3 GB adicionales según la arquitectura híbrida.
- **GPU recomendadas**: A100-80GB o H100 para entrenamiento y despliegue a máxima velocidad; RTX 4090 (24 GB) permite Q8_0 con contexto completo; RTX 3090/4080 (16-24 GB) permiten Q5_K_M o Q6_K con contexto completo; RTX 4060 Ti 16 GB permite Q4_K_M con 32K.
- **Consumer GPU**: sí, cabe en GPUs consumer de 8 GB o más usando IQ3_M o IQ4_XS con contexto reducido; 12-16 GB permiten Q4_K_M/Q5_K_M con contexto completo.
- **Despliegue**: llama.cpp (`llama-server`), Ollama (previa conversión o importación del GGUF), y cualquier runtime compatible con GGUF. No se menciona soporte de vLLM ni TGI en la información disponible (vLLM requiere pesos safetensors, no publicados).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Threnody-9B V3 | ~8,95B | 32K (config. ejemplo) | Agéntico, coding, tool calling | Apache 2.0 | GGUF en HF |
| Qwen3.5-9B Base | ~9B | No disponible | Generalista | Apache 2.0 (presumible) | Pesos completos en HF |
| Threnody-9B V2 | ~8,95B | No disponible | Agéntico (versión previa) | Apache 2.0 | GGUF en HF |

No se dispone de datos suficientes para comparar con alternativas de otros desarrolladores (por ejemplo, modelos de 7-9B orientados a agentes) en la información proporcionada.

## Limitaciones y advertencias

- **Rendimiento mixto frente al base**: en OmniAgent-Bench y AgentLoop In-Harness el modelo obtiene puntuaciones inferiores a Qwen3.5-9B Base, pese a la afirmación de "strict dominance" de la model card.
- **Solo GGUF**: no se publican pesos safetensors, lo que impide su uso directo con vLLM, TGI o pipelines de entrenamiento/ajuste adicional.
- **Idiomas no confirmados**: no se especifica la cobertura lingüística; el uso en castellano no está validado explícitamente.
- **Sesgos**: no se documentan evaluaciones de sesgo; al derivar de Qwen3.5-9B, hereda los sesgos del corpus de entrenamiento del base.
- **Alucinación**: no se han publicado métricas de factualidad ni de calibración; el modo thinking puede aumentar la verbosidad sin garantizar corrección.
- **Contexto**: 32K es la configuración de ejemplo; no se confirma el máximo nativo ni el comportamiento más allá de esa ventana.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.
- **Filtro anti-bucle agresivo**: el descarte de trayectorias con `max_repeat >= 2` puede reducir la capacidad de recuperación ante errores transitorios en entornos reales.

## Enlaces

- Hugging Face: https://huggingface.co/MalxTech/Threnody-9B-V3-GGUF
- Código fuente: https://github.com/YoMosa2009/Threnody-V3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
