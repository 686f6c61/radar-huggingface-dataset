# peasantsmith/CYBER-FROST-3.8-PS-GUFF

## Resumen
CYBER-FROST-3.8-PS-GUFF es una cuantización GGUF del modelo Blackfrost-AI/CYBER-FROST-3.8-BF16, un modelo afinado para ciberseguridad e investigación de seguridad construido sobre Qwen/Qwen3.8-Flash-Next. Lo publica peasantsmith en Hugging Face y su propósito es ofrecer una versión ejecutable en llama.cpp con una precisión por tensor (biased-precision) que supera en calidad a la cuantización de referencia IQ3_S de ISTA-DASLab sin renunciar a un tamaño manejable.

El modelo subyacente es un Mixture of Experts de tipo qwen4exp con arquitectura híbrida SSM/atención, 49 capas (48 transformer más una cabeza NextN/MTP para decodificación especulativa), 512 expertos totales con 10 activos por token y una ventana de contexto de 262.144 tokens. Los pesos suman 179.551.050.368 parámetros según safetensors, con un tamaño de fichero GGUF de 112,53 GB y 5,01 bits por peso.

La relevancia actual reside en su enfoque de cuantización: en lugar de aplicar un ancho de bits global, cada clase de tensor se coloca en la precisión que maximiza la calidad, guiada por una imatrix entrenada sobre un corpus específico de ciberseguridad con 902 entradas y 800 chunks de calibración, cubriendo aproximadamente el 99,8% del vocabulario del tokenizador. Esto lo hace útil para equipos de red team y blue team que necesitan ejecutar localmente un modelo de razonamiento largo sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4exp (MoE híbrida SSM/atención, 49 capas: 48 transformer + 1 NextN/MTP) |
| Parametros totales | 179.551.050.368 (179,77 B) |
| Parametros activos | 10 expertos activos por token sobre 512 totales (parámetros activos totales no disponibles) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF mixta: Q5_K (ffn_gate_exps, ffn_up_exps), IQ4_NL (ffn_down_exps, per_layer_token_embd), F32 (ffn_gate_inp); 5,01 bits por peso |
| Idiomas soportados | en (inglés) |
| Licencia | qwen-community-license-1.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
La arquitectura es un Mixture of Experts denominada qwen4exp que combina capas de estado espacio (SSM) con atención, organizada en 49 capas: 48 capas transformer más una capa NextN/MTP que actúa como cabeza de borrador para decodificación especulativa. El modelo cuenta con 512 expertos enrutados, de los cuales 10 se activan por token. La distribución de parámetros es muy concentrada: los expertos enrutados (ffn_gate_exps, ffn_up_exps, ffn_down_exps) suman 123,31 B (68,6%), la tabla n-gram (per_layer_token_embd) con tamaño de n-gram 3 suma 51,20 B (28,5%), y el resto (atención, densas, router, embeddings, normas) apenas 5,26 B (2,9%).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La model card del autor de la cuantización no detalla el proceso de entrenamiento del modelo original. La innovación técnica destacable de esta publicación es el esquema de cuantización por tensor: los expertos enrutados se elevan respecto a la referencia (Q5_K en gate y up, IQ4_NL en down frente al IQ3_S de ISTA-DASLab), la tabla n-gram se mantiene en IQ4_NL para una comparación justa, y el router se conserva en F32. La imatrix se entrenó sobre un corpus específico de ciberseguridad e investigación de seguridad combinado con texto general, con 902 entradas y 800 chunks de calibración.

## Capacidades
- Generación de texto conversacional y razonamiento de múltiples pasos, con emisión de cadena de pensamiento (chain-of-thought) que puede aparecer en el campo `reasoning_content` de la API.
- Capacidades de ciberseguridad e investigación de seguridad, incluyendo tareas de red team y blue team, según los tags del modelo.
- Soporte de tool calling y function calling, indicado por el tag `tool-use`.
- Decodificación especulativa mediante la cabeza NextN/MTP, que puede mejorar el throughput si el runtime la soporta.
- Capacidad multilingüe limitada al inglés (en).
- No se dispone de información sobre capacidades de visión, audio o matemáticas específicas en la documentación proporcionada.

## Casos de uso
- Análisis de amenazas y triaje de alertas: el modelo puede procesar informes de seguridad extensos y correlacionar indicadores gracias a su ventana de 262.144 tokens, manteniendo el contexto completo de un incidente en una sola sesión.
- Red team asistido: generación de hipótesis de ataque, revisión de configuraciones y apoyo a pruebas de penetración, aprovechando el ajuste específico en ciberseguridad y el modo de razonamiento extendido.
- Blue team y respuesta a incidentes: resumen y priorización de logs, alertas y artefactos forenses en conversaciones multi-turno con contexto largo.
- Automatización de auditorías de código: integración mediante tool calling en pipelines de CI/CD para revisar parches y detectar patrones inseguros, con la cabeza MTP acelerando la generación en despliegues que soporten decodificación especulativa.
- Investigación de seguridad y análisis de malware: extracción de comportamiento y generación de informes técnicos a partir de muestras descritas textualmente, ejecutando el modelo localmente para no exponer datos sensibles.
- Despliegue en estaciones de trabajo con VRAM limitada: la cuantización mixta de 112,53 GB permite ejecutar el modelo con offload parcial de expertos a CPU mediante `--n-cpu-moe`, algo inviable con el BF16 original.
- Asistente conversacional especializado en seguridad para equipos internos, con contexto largo para mantener el hilo de investigaciones prolongadas.

## Benchmarks y rendimiento

| Benchmark | ISTA-DASLab IQ3_S | CYBER-FROST-3.8-PS-GUFF |
|---|---|---|
| MMLU-Pro, precisión (% de respondidas) | 80,00% | 82,80% |
| MMLU-Pro, precisión (% del total) | 76,00% | 77,00% |

Los datos corresponden a una evaluación de 100 preguntas de MMLU-Pro publicada en la model card. No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada: el fichero GGUF ocupa 112,53 GB, por lo que la inferencia completa en VRAM requiere al menos esa cantidad más overhead de contexto y caché KV. Con cuantización de caché q8_0 y contexto reducido, el consumo adicional es moderado.
- GPU recomendadas: no se especifican en la documentación. Por tamaño, un despliegue completo encaja en configuraciones multi-GPU de clase A100/H100 (por ejemplo, 2×80 GB) o en una H200 de 141 GB. No cabe en GPUs de consumo individuales (RTX 4090 de 24 GB) sin offload.
- Offload a CPU: el autor proporciona un ejemplo con `--n-cpu-moe 18` y `-ngl 999` como punto de partida conservador para máquinas que no pueden mantener el modelo completo en VRAM, ajustando el número de capas y expertos en CPU según la memoria disponible.
- Opciones de despliegue: llama.cpp mediante `llama-server`, incluyendo carga directa desde el Hub con `-hf`. No se mencionan otros runtimes (vLLM, TGI, Ollama) en la documentación.
- Latencia y throughput: no disponibles. El autor indica que habilitar la decodificación especulativa con la cabeza MTP puede mejorar el throughput si el build lo soporta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| CYBER-FROST-3.8-PS-GUFF | 179,77 B (MoE, 10 activos) | 262.144 | GGUF mixto (5,01 bpw) | qwen-community-license-1.0 | Cuantización con imatrix de ciberseguridad; MMLU-Pro 82,80% |
| ISTA-DASLab Qwen3.8-Flash-Next GSQ-RCO IQ3_S | No disponible | No disponible | GGUF IQ3_S | No disponible | Referencia de cuantización; MMLU-Pro 80,00% |
| Blackfrost-AI/CYBER-FROST-3.8-BF16 | 179,77 B (MoE) | 262.144 | BF16 (safetensors) | qwen-community-license-1.0 | Modelo base sin cuantizar; requiere mucho más VRAM |
| Qwen/Qwen3.8-Flash-Next | No disponible | No disponible | No disponible | qwen-community-license-1.0 | Modelo upstream original |

## Limitaciones y advertencias
- El modelo solo soporta inglés; no se debe esperar un rendimiento fiable en castellano u otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en dominios técnicos donde una respuesta incorrecta puede tener consecuencias de seguridad; se recomienda verificación humana en tareas de red team y blue team.
- El modelo emite cadena de pensamiento y puede devolver `content` nulo con la respuesta en `reasoning_content`; es necesario configurar un `max_tokens` generoso o el modelo agotará el presupuesto a mitad del razonamiento y no devolverá respuesta.
- La etiqueta `Q5_K_M` del fichero es una convención de nombres, no una descripción literal: el build es una mezcla por tensor (Q5_K, IQ4_NL y F32), lo que puede confundir a herramientas que infieran la cuantización por el nombre.
- La licencia qwen-community-license-1.0 puede imponer restricciones al uso comercial; es necesario revisar el texto completo antes de desplegar en producción.
- El tamaño de 112,53 GB limita el despliegue a hardware de gama alta o a configuraciones con offload a CPU, con la penalización de latencia correspondiente.
- No se han publicado datos sobre sesgos conocidos ni sobre el proceso de alineación del modelo base.
- Los benchmarks publicados se limitan a 100 preguntas de MMLU-Pro, una muestra pequeña que no permite extrapolar el rendimiento general.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/peasantsmith/CYBER-FROST-3.8-PS-GUFF
- Modelo base BF16: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-BF16
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Perfil del autor: https://huggingface.co/peasantsmith
