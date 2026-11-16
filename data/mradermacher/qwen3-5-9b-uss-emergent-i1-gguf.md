# mradermacher/Qwen3.5-9B-USS-Emergent-i1-GGUF

## Resumen

Qwen3.5-9B-USS-Emergent-i1-GGUF es la versión cuantizada con imatrix del modelo nightmedia/Qwen3.5-9B-USS-Emergent, publicada por mradermacher. Se trata de un modelo de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) derivado de la familia Qwen3.5, afinado mediante SFT y LoRA sobre un modelo base de Qwen, con orientación explícita a razonamiento con cadena de pensamiento larga (long-CoT), código, matemáticas, STEM y escritura creativa de ficción. La licencia declarada es Apache 2.0.

El paquete incluye cuantizaciones GGUF en formato i1 (imatrix), pensadas para su uso con llama.cpp y derivados como Ollama o LM Studio. El autor del modelo base etiqueta el resultado como experimental y menciona capacidades de contexto extendido (etiquetas de 256k y 1M de contexto), soporte multilingüe en inglés, chino, japonés y español, y rasgos de destilación de Claude 4.6 según los tags del repositorio.

La relevancia de esta ficha reside en que permite ejecutar un modelo de ~9B con razonamiento y escritura creativa en hardware de consumo, a costa de las limitaciones propias de una cuantización agresiva y de un modelo base marcado como experimental. No se dispone de resultados de benchmarks publicados en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles internos no disponibles) |
| Parámetros totales | 9.197.093.888 (~9,2B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | Etiquetada como 256k y 1M en los tags del modelo base; no verificada en la información disponible |
| Tipos de cuantización | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (en este repo); el repo estático incluye además Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ4_XS, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, small-IQ4_NL |
| Idiomas soportados | Inglés (en), chino (zh), japonés (ja), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base es un transformer de la familia Qwen3.5 con aproximadamente 9,2 mil millones de parámetros. El proceso de ajuste se describe mediante las etiquetas del repositorio como SFT (supervised fine-tuning) y LoRA, con énfasis en razonamiento con cadena de pensamiento larga (long-CoT), destilación de Claude 4.6 (claude-distillation) y datos orientados a código, matemáticas y STEM. Los tags también mencionan mergekit, multi-token-prediction y speculative-decoding, lo que sugiere que el modelo base pudo construirse mediante fusión de modelos y que se contemplan técnicas de decodificación especulativa, aunque no se detalla su implementación.

No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. El autor del modelo base lo etiqueta como experimental. La versión aquí descrita es una cuantización imatrix generada por mradermacher con llama.cpp, que preserva la arquitectura del modelo original pero reduce la precisión de los pesos; el archivo imatrix adjunto (0,1 GB) permite generar cuantizaciones propias.

## Capacidades

- Generación de texto conversacional e instruccional en inglés, chino, japonés y español.
- Razonamiento con cadena de pensamiento larga (long-CoT) y modo de razonamiento explícito.
- Generación de código y tareas de programación, según los tags de coding.
- Matemáticas y STEM, según los tags de math y stem.
- Escritura creativa y de ficción: generación de tramas, subtramas, escenas, continuación de escenas, escritura vívida y roleplaying.
- Capacidades multilingües limitadas a los cuatro idiomas declarados.
- Soporte de contexto largo según las etiquetas del modelo base (256k y 1M), no verificado en esta cuantización.
- Posible soporte de tool calling y function calling: no confirmado en la información disponible.
- Posible soporte de agentes y razonamiento multi-paso: no confirmado explícitamente.
- El repositorio base se describe como modelo de visión; los archivos mmproj, si existen, estarían en el repositorio estático, no en este.

## Casos de uso

- Asistente de escritura creativa y ficción: el modelo está afinado para generación de tramas, subtramas y continuación de escenas, por lo que puede usarse como copiloto literario en un editor o interfaz de chat, manteniendo coherencia en textos largos si se confirma el contexto extendido.
- Razonamiento asistido en entornos de investigación: su orientación a long-CoT permite generar cadenas de razonamiento para problemas de matemáticas y STEM, útil en cuadernos de experimentación o herramientas de análisis.
- Generación de código en local: con cuantización i1-Q4_K_S (5,6 GB) puede ejecutarse en una GPU de consumo y emplearse para autocompletado, generación de tests o explicación de fragmentos, integrándose en editores mediante llama.cpp.
- Atención al cliente multilingüe: al cubrir inglés, chino, japonés y español, puede gestionar conversaciones multi-turno en esos idiomas; su tamaño permite desplegarlo en servidores modestos con Ollama o vLLM.
- Prototipado de agentes conversacionales: aunque el soporte de tool calling no está confirmado, el modelo puede emplearse en bucles de razonamiento controlados por el orquestador para tareas de planificación y resumen.
- Roleplaying y generación de personajes: los tags de roleplaying y fiction writing lo hacen adecuado para motores de narrativa interactiva y juegos de texto, ejecutándose en local para preservar privacidad.
- Traducción asistida entre los cuatro idiomas declarados: puede usarse como borrador de traducción en pipelines internos, con revisión humana obligatoria dada la ausencia de benchmarks.
- Experimentación educativa: su tamaño de ~9B y sus cuantizaciones ligeras (i1-Q2_K de 4,0 GB) permiten desplegarlo en portátiles para estudiar técnicas de razonamiento y cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: i1-Q2_K ~4,0 GB, i1-IQ3_M ~4,6 GB, i1-Q4_K_S ~5,6 GB; a estos valores hay que sumar el overhead de contexto KV, que crece con la ventana utilizada.
- GPU recomendadas: para i1-Q4_K_S basta una RTX 3060 de 12 GB o superior; para contextos largos se recomienda RTX 4090 (24 GB), A100 o H100 por margen de memoria y ancho de banda.
- Compatibilidad con GPU de consumo: sí, en tarjetas con 8-12 GB para cuantizaciones Q2/IQ3/Q4; el modelo completo en bf16 (~18,4 GB) requiere al menos 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; vLLM y TGI no son la vía natural para GGUF, aunque pueden usarse con el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-USS-Emergent-i1-GGUF (este) | ~9,2B | 256k/1M (etiquetado) | Apache 2.0 | GGUF | Cuantización imatrix de un modelo experimental |
| Qwen3.5-9B-USS-Emergent (base) | ~9,2B | 256k/1M (etiquetado) | Apache 2.0 | safetensors/bf16 | Modelo original sin cuantizar |
| Qwen3.5-9B-USS-Emergent-GGUF (estático) | ~9,2B | 256k/1M (etiquetado) | Apache 2.0 | GGUF | Cuantizaciones estáticas del mismo modelo base |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo marcado como experimental por el autor del modelo base; no se garantiza estabilidad en producción.
- La cuantización i1 reduce la precisión de los pesos; las cuantizaciones Q2/IQ3 pueden degradar razonamiento y coherencia en comparación con bf16.
- No hay benchmarks publicados que permitan validar las capacidades declaradas (matemáticas, código, contexto largo).
- Riesgo de alucinación inherente a modelos generativos de este tamaño, agravado por la falta de evaluación independiente.
- El contexto de 256k/1M está etiquetado pero no verificado; el uso de ventanas muy largas incrementa la memoria KV y puede degradar la calidad.
- Cobertura lingüística limitada a inglés, chino, japonés y español; el rendimiento en español no está medido.
- El soporte de tool calling, agentes y visión no está confirmado para esta cuantización; los archivos mmproj, si existen, están en el repositorio estático.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de destilación declarados.
- El repositorio registra 0 descargas en el momento de la consulta, lo que limita la evidencia comunitaria sobre su comportamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-9B-USS-Emergent-i1-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.5-9B-USS-Emergent
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.5-9B-USS-Emergent-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.5-9B-USS-Emergent-i1-GGUF
- README de referencia para GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
