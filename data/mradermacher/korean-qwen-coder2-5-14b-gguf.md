# mradermacher/Korean-QWEN-Coder2.5-14B-GGUF

## Resumen

Korean-QWEN-Coder2.5-14B-GGUF es la versión cuantizada en formato GGUF del modelo ewhk9887/Korean-QWEN-Coder2.5-14B, un ajuste fino (SFT) del conocido Qwen2.5-Coder-14B de Alibaba, especializado en el idioma coreano y orientado a tareas de generación de código. La cuantización la ha realizado mradermacher, un conocido publicador de quants en Hugging Face, y ofrece un abanico de niveles de compresión (desde Q2_K hasta Q8_0) para facilitar el despliegue en hardware de consumo mediante llama.cpp u Ollama.

El modelo base conserva la arquitectura transformer decoder-only de Qwen2.5-Coder, con 14.770.033.664 parámetros totales (aproximadamente 14,8 mil millones). Al estar ajustado sobre Qwen2.5-Coder, hereda su ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 con RoPE scaling en la familia Qwen2.5), aunque la model card del autor no detalla explícitamente estos valores, por lo que se indican como no disponibles en la tabla cuando no se confirman en la información proporcionada.

La relevancia de esta ficha radica en que combina dos factores poco frecuentes: un modelo de código de tamaño medio (14B) con capacidades bilingües inglés-coreano, y una distribución en GGUF lista para inferencia local. Esto lo hace interesante para desarrolladores que necesitan un asistente de programación que entienda comentarios, documentación y prompts en coreano, y que a la vez pueda ejecutarse en una GPU de consumo o incluso en CPU con cuantizaciones agresivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, según tags del repo: qwen2) |
| Parametros totales | 14.770.033.664 (~14,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el base Qwen2.5-Coder soporta 32.768 tokens nativos, ampliable a 131.072, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas; no hay quants con imatrix publicados por el autor en el momento de la ficha) |
| Idiomas soportados | Inglés (en) y coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base original está en safetensors |
| Tamano del repo | 102,0 GB (incluye todas las cuantizaciones) |
| Fecha de creacion | 2025-02-13 |
| Ultima actualizacion | 2026-11-10 |
| Descargas | 504 |
| Likes | 2 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-14B: un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo original de Alibaba fue preentrenado sobre un corpus masivo de código y texto, y posteriormente la comunidad (ewhk9887) realizó un ajuste supervisado (SFT) para reforzar el coreano, según indican los tags `sft`, `trl` y `unsloth` del repositorio. No se dispone de detalles sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO en esta variante coreana; la model card del cuantizador no los incluye.

La innovación principal de esta publicación no está en el modelo en sí, sino en el proceso de cuantización: mradermacher ha generado cuantizaciones estáticas (sin imatrix ponderada) de todos los niveles habituales de llama.cpp, lo que permite elegir el equilibrio entre tamaño y calidad. Los quants IQ4_XS y Q4_K_M son los más recomendados para uso general, mientras que Q6_K y Q8_0 preservan prácticamente la calidad del modelo original a costa de mayor tamaño. No se documentan técnicas adicionales como decodificación especulativa o atención lineal en esta variante.

## Capacidades

- Generación de texto y código en inglés y coreano, con especial énfasis en tareas de programación (autocompletado, generación de funciones, explicación de código).
- Razonamiento sobre código: el modelo base Qwen2.5-Coder está entrenado para resolver problemas de programación y explicar soluciones paso a paso.
- Soporte de conversación multi-turno (tag `conversational` en el repo), adecuado para asistentes de chat técnicos.
- Capacidades multilingües limitadas a inglés y coreano según los metadatos; no se garantiza un rendimiento sólido en otros idiomas.
- Compatible con endpoints de text-generation-inference (tag `endpoints_compatible`), lo que facilita su despliegue como API.
- No se documentan capacidades de tool calling, function calling, agentes o modos de razonamiento extendido (thinking) en la información proporcionada; al derivar de Qwen2.5-Coder es plausible que herede parte de estas habilidades, pero no se confirman en esta ficha.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Asistente de programación en coreano para equipos de desarrollo: el modelo puede recibir comentarios, docstrings y prompts en coreano y generar código en lenguajes como Python, JavaScript o Java, gracias a su ajuste SFT sobre Qwen2.5-Coder y a su vocabulario bilingüe.
- Autocompletado y generación de fragmentos en IDE: con cuantizaciones Q4_K_M (~9,1 GB) puede ejecutarse en una GPU de consumo y ofrecer latencia baja para sugerencias en tiempo real dentro de editores como VS Code mediante extensiones basadas en llama.cpp.
- Traducción técnica inglés-coreano de documentación y comentarios de código: el modelo puede reescribir explicaciones técnicas entre ambos idiomas, útil para equipos que trabajan con documentación en inglés pero desarrollan en coreano.
- Generación de tests unitarios: a partir de una función dada, el modelo puede proponer casos de prueba y aserciones, aprovechando su entrenamiento en código y su capacidad de razonamiento sobre intenciones.
- Explicación y refactorización de código legacy: el modelo puede analizar fragmentos de código y proponer mejoras o explicar su funcionamiento, adecuado para tareas de mantenimiento en entornos con documentación escasa.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (5,9 GB) y Q3_K_S (6,8 GB) permiten ejecutar el modelo en máquinas con 8 GB de VRAM o incluso en CPU, lo que facilita prototipos y pruebas en portátiles.
- Chatbot técnico de soporte interno: con la cuantización Q5_K_M (~10,6 GB) puede gestionar conversaciones multi-turno sobre APIs, errores de compilación y buenas prácticas, siempre que el dominio esté en inglés o coreano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del cuantizador no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Tampoco se dispone de datos de latencia o throughput medidos para las distintas cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - Q2_K: ~5,9 GB
  - Q3_K_S: ~6,8 GB
  - Q3_K_M: ~7,4 GB
  - Q3_K_L: ~8,0 GB
  - IQ4_XS: ~8,3 GB
  - Q4_K_S: ~8,7 GB
  - Q4_K_M: ~9,1 GB
  - Q5_K_S: ~10,4 GB
  - Q5_K_M: ~10,6 GB
  - Q6_K: ~12,2 GB
  - Q8_0: ~15,8 GB
- GPU recomendadas: para Q4_K_M y superiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permiten ejecutar el modelo con contexto amplio y holgura de KV cache. Para Q8_0, se recomienda una A100 40 GB o H100 para contextos largos; en 24 GB cabe justo con contexto moderado.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q2_K a Q4_K_M caben en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). Q5 y Q6 requieren 12-16 GB; Q8_0 requiere 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. También es compatible con text-generation-inference según los tags, aunque TGI suele preferir safetensors.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, las cuantizaciones Q4_K_S y Q4_K_M están marcadas por el autor como "fast, recommended", y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Korean-QWEN-Coder2.5-14B-GGUF (este) | ~14,8B | No disponible (base Qwen2.5: 32K nativo) | en, ko | Apache 2.0 | GGUF | Ajuste coreano de Qwen2.5-Coder, cuantizado por mradermacher |
| Qwen2.5-Coder-14B (Alibaba) | ~14,8B | 32.768 tokens (ampliable a 131.072) | Multilingüe (incluye en, zh, ko entre otros) | Apache 2.0 | safetensors, GGUF | Modelo base original, más generalista y con más idiomas |
| DeepSeek-Coder-V2-Lite | ~15,7B (MoE, 2,4B activos) | 128K | Multilingüe | DeepSeek License | safetensors, GGUF | Alternativa MoE con mayor contexto y eficiencia de inferencia |
| CodeLlama-13B | ~13B | 16K | en (principalmente) | Llama 2 Community License | safetensors, GGUF | Modelo de código más antiguo, sin soporte coreano nativo |

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Qwen2.5-Coder, puede heredar sesgos presentes en los datos de preentrenamiento de código (predominio de ciertos lenguajes, estilos y convenciones occidentales). El ajuste coreano puede introducir sesgos adicionales no documentados.
- Riesgo de alucinación: como todo modelo generativo, puede inventar APIs, funciones o bibliotecas inexistentes, especialmente en coreano o en dominios poco representados. No se han publicado evaluaciones de fidelidad para esta variante.
- Limitaciones de contexto e idioma: la información disponible no confirma la longitud de contexto efectiva tras el ajuste SFT; el rendimiento fuera de inglés y coreano no está garantizado y probablemente sea degradado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero conviene verificar que el modelo base original (ewhk9887/Korean-QWEN-Coder2.5-14B) mantiene la misma licencia y que los datos de ajuste no imponen restricciones adicionales.
- Caveats para producción: las cuantizaciones estáticas sin imatrix pueden perder calidad frente a quants ponderados; el autor indica que no hay quants con imatrix disponibles en el momento de la ficha. Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad y no se recomiendan para uso en producción. El número de descargas (504) y likes (2) es bajo, lo que sugiere poca validación comunitaria.
- No se documentan evaluaciones de seguridad, filtros de contenido ni mitigaciones de sesgo en la información proporcionada.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Korean-QWEN-Coder2.5-14B-GGUF
- Modelo base (ajuste coreano): https://huggingface.co/ewhk9887/Korean-QWEN-Coder2.5-14B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Korean-QWEN-Coder2.5-14B-GGUF
- Repositorio de solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de quants de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
