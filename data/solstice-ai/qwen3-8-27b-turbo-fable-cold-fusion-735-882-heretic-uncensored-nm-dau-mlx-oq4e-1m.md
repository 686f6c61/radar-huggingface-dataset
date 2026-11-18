# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ4e-1M

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ4e-1M es la release de servicio en precisión mixta para Apple Silicon del modelo base de DavidAU, un merge de la familia Qwen 3.8 de 27B orientado a razonamiento, código y contextos ultralargos. Solstice-AI se encarga de la cuantización downstream, del escalado YaRN hasta 1.048.576 tokens y del empaquetado para MLX. El checkpoint pesa 17,0 GB y está pensado para ejecutarse de forma nativa en MacBooks de 16 GB y 24 GB de memoria unificada mediante el runtime Anvil o MLX-LM.

El modelo parte de una arquitectura híbrida Qwen 3.8 con atención lineal GDN en el 75 % de las capas y GQA global en el 25 % restante, lo que reduce la complejidad de memoria del contexto largo. Incluye además una cabeza de predicción multi-token (MTP) para decodificación especulativa y ha sido sometido a un proceso de abliteration (Project Heretic) que elimina los vectores de rechazo, de ahí la etiqueta "uncensored". La licencia declarada es Apache 2.0 y los idiomas soportados son inglés y chino.

Su relevancia actual reside en dos factores: por un lado, ofrece contexto de un millón de tokens en hardware de consumo Apple, algo poco habitual en modelos de 27B; por otro, el autor publica una comparativa en la que el modelo supera a Claude Opus 4.6 Max en 9 de 9 disciplinas evaluadas bajo el harness de Claude Code. Conviene tratar esas cifras con cautela, ya que proceden de la propia model card y no de una evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen 3.8: 75 % capas de atención lineal GDN (Gated Delta Recurrent Network) y 25 % GQA global |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 1.048.576 tokens (1 M) mediante YaRN con factor 4.0 sobre 262.144 tokens originales |
| Tipos de cuantizacion | MLX oQ4e (4 bits mixto calibrado con importance matrix); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx); repo de 17,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de la familia Qwen 3.8. El 75 % de las capas emplea atención lineal GDN, con complejidad de memoria O(1) respecto a la longitud de secuencia, mientras que el 25 % restante usa atención global con Grouped-Query Attention. Esta combinación busca mantener calidad de recuperación en contexto largo sin el coste cuadrático de un transformer denso convencional. El contexto se extiende a 1.048.576 tokens mediante escalado YaRN (factor 4.0, `beta_fast` 32.0, `beta_slow` 1.0, `attention_factor` 1.0) sobre una ventana original de 262.144 tokens.

El modelo base es un merge de pesos de DavidAU denominado Cold Fusion, que aplica una técnica propia llamada GAIN (Guided Activation Interleaved Normalization) para combinar checkpoints de razonamiento sin degradación. Sobre esa base se aplicó Project Heretic, un proceso de abliteration que elimina los vectores de rechazo del alignment. La cuantización oQ4e de Solstice-AI es no uniforme: usa un informe de importance matrix (`oq_imatrix_report.json`) para mantener cabezas de atención y proyecciones de router en mayor profundidad de bits, preservando así el rendimiento en ARC-C (719 en 4 bits frente a 735 en 8 bits). Se integra además una cabeza MTP de doble flujo para decodificación especulativa, con una aceleración declarada de 1,72x a 2,20x en Apple Silicon. No se especifican en la información disponible el volumen de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento multi-paso con cadena de pensamiento (CoT) explícita.
- Generación y depuración de código, con soporte declarado para tareas de ingeniería de software agéntica (SWE-bench Pro, LiveCodeBench, QwenSWEBench).
- Control de sistemas operativos y automatización de escritorio y móvil (OSWorld-Verified, AndroidWorld).
- Seguimiento de restricciones complejas en instrucciones (IFBench) y flujos de trabajo multiarchivo de largo horizonte (CoWorkBench).
- Procesamiento de imagen y texto: el pipeline declarado es `image-text-to-text`, aunque la model card no detalla la arquitectura de visión.
- Contexto ultralargo de hasta 1.048.576 tokens para recuperación y razonamiento sobre documentos extensos.
- Decodificación especulativa mediante cabeza MTP integrada.
- Multilingüe limitado a inglés y chino.
- Modo sin censura (abliterated): no aplica rechazos por política de contenido.
- No se documenta en la información disponible soporte explícito de tool calling ni de function calling.

## Casos de uso

- Análisis de repositorios completos: con 1 M de tokens de contexto, el modelo puede ingerir un monorepo mediano y responder preguntas de arquitectura, dependencias o impacto de cambios sin trocear el código en fragmentos.
- Automatización de ingeniería de software: integrado en un agente que lee issues, localiza el fichero afectado, aplica el parche y ejecuta los tests, aprovechando sus resultados declarados en SWE-bench Pro y QwenSWEBench.
- Auditoría de seguridad y análisis de malware: la abliteration elimina los rechazos, lo que permite analizar payloads, técnicas de evasión y código ofensivo sin bloqueos del modelo; útil en equipos de red team y respuesta a incidentes.
- Asistencia legal o documental de gran volumen: procesamiento de contratos, expedientes o transcripciones de cientos de miles de tokens en una sola pasada, con preguntas de seguimiento sobre el mismo contexto.
- Automatización de escritorio y RPA: control de aplicaciones mediante agentes que interpretan la pantalla y ejecutan acciones, respaldado por los resultados declarados en OSWorld-Verified y AndroidWorld.
- Inferencia local en portátil: despliegue en un MacBook de 16 GB o 24 GB para desarrollo offline, prototipado y tareas de razonamiento sin depender de APIs externas ni enviar datos a terceros.
- Generación de código en pipelines de CI/CD: revisión automática de pull requests y generación de tests sobre diffs largos, siempre que se valide el soporte real de tool calling en el runtime elegido.

## Benchmarks y rendimiento

Los datos proceden exclusivamente de la model card del autor; no se han verificado de forma independiente.

| Suite | Enfoque | Modelo (Solstice-AI x DavidAU) | Claude Opus 4.6 Max | Margen |
|---|---|---|---|---|
| SWE-bench Pro | Ingeniería de software agéntica | 61,7 % | 53,4 % | +8,3 % |
| LiveCodeBench v6 | Resolución de problemas en tiempo real | 90,3 % | 88,8 % | +1,5 % |
| QwenSWEBench | Depuración de repositorio completo | 79,0 % | 63,8 % | +15,2 % |
| OSWorld-Verified | Control de SO | 84,3 % | 72,7 % | +11,6 % |
| AndroidWorld | Autonomía en SO móvil | 81,9 % | 62,0 % | +19,9 % |
| IFBench | Seguimiento de restricciones | 79,5 % | 62,5 % | +17,0 % |
| CoWorkBench | Flujos multiarchivo de largo horizonte | 70,7 % | 68,2 % | +2,5 % |
| ARC-C (Challenge) | Abstracción científica | 735 (8 bits) / 719 (4 bits) | ~710–720 | Tier frontier |
| ARC-E (Easy) | Razonamiento de sentido común | 882 | ~870 | Por encima del frontier cerrado |

Condiciones declaradas: harness oficial de Claude Code, temperatura 1.0, top_p 0.95, evaluado en límites de contexto de 256k y 1 M tokens.

## Requisitos de hardware

- VRAM/RAM unificada: 17,0 GB para el checkpoint oQ4e completo; requiere al menos 18–20 GB efectivos contando overhead del runtime y caché KV.
- Cabe en MacBook de 16 GB (con presión de memoria) y de 24 GB (holgado); el autor lo posiciona explícitamente para ambos.
- GPU recomendadas: Apple Silicon (M-series) con memoria unificada; no está pensado para CUDA.
- No es compatible de forma nativa con GPUs NVIDIA (A100, H100, RTX 4090) sin reconversión previa del formato MLX a otro formato, algo no documentado en la información disponible.
- Despliegue: runtime Anvil (Metal, recomendado por el autor) y MLX-LM.
- Aceleración: cabeza MTP con speedup declarado de 1,72x–2,20x en Apple Silicon.
- Latencia y throughput absolutos: no disponibles. El contexto de 1 M tokens con atención lineal en el 75 % de capas reduce el coste de memoria, pero el tiempo de prefill sobre secuencias de esa longitud no se documenta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato/hardware | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B TURBO Cold Fusion (este) | 27,78 B | 1.048.576 | Apache 2.0 | MLX oQ4e, Apple Silicon | Abliterated, MTP, 17 GB |
| Modelo base DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion | 27,78 B (presumible) | no disponible | Apache 2.0 | safetensors sin cuantizar | Sin cuantización MLX ni escalado YaRN a 1 M |
| Claude Opus 4.6 Max | no disponible | no disponible | propietaria | API | Referencia de comparación del autor; superado en 9/9 según la model card |
| Otros Qwen 3.8 de ~27B en MLX | no disponible | no disponible | Apache 2.0 | MLX | No se dispone de datos concretos en la información proporcionada |

La comparación con alternativas de código abierto del mismo tamaño no puede completarse con rigor porque la información disponible no incluye sus especificaciones. La única referencia cuantitativa es Claude Opus 4.6 Max, un modelo propietario de otra categoría de despliegue.

## Limitaciones y advertencias

- Los benchmarks son autoinformados por el autor y no han sido replicados de forma independiente; los márgenes frente a Claude Opus 4.6 Max deben tomarse como indicativos.
- La abliteration elimina los rechazos de seguridad: el modelo puede generar contenido dañino, código malicioso o instrucciones peligrosas sin filtro. No es apto para aplicaciones de cara al público sin una capa de moderación externa.
- Riesgo de alucinación inherente a los modelos de 27B, especialmente en tareas de recuperación factual sobre contextos de un millón de tokens, donde la precisión del recall a distancias extremas no está documentada.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está evaluado y previsiblemente será inferior.
- El contexto efectivo de 1 M tokens depende de que el runtime aplique correctamente el escalado YaRN; una configuración incorrecta degrada la calidad de forma silenciosa.
- Formato MLX exclusivo: requiere conversión para su uso en CUDA o en servidores convencionales, con posible pérdida de la calibración oQ4e.
- El nombre del modelo acumula múltiples merges y modificaciones (Cold Fusion, GAIN, Heretic, TURBO); la trazabilidad exacta del linaje de pesos más allá del base_model declarado no está documentada.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre las salidas de un modelo sin alignment.
- El pipeline `image-text-to-text` sugiere capacidades multimodales, pero la model card no describe el encoder de visión ni benchmarks de imagen; no debe asumirse un rendimiento visual equiparable al textual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ4e-1M
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Runtime Anvil: https://github.com/Solstice-Labs/anvil
- Perfil del autor de la cuantización: https://huggingface.co/Solstice-AI
- Perfil del autor del modelo base: https://huggingface.co/DavidAU
- Banner del proyecto: https://cdn-uploads.huggingface.co/production/uploads/67c2e844e0921a5410eec10a/Y5M42dCag2f7Fc6fDtV0Z.jpeg
