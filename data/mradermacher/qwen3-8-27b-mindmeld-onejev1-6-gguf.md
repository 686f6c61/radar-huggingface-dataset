# mradermacher/Qwen3.8-27B-MindMeld-OneJev1.6-GGUF

## Resumen

Este repositorio contiene las cuantizaciones estáticas en formato GGUF del modelo **Qwen3.8-27B-MindMeld-OneJev1.6**, un modelo de generación de texto de 27.320.697.856 parámetros publicado por nightmedia y cuantizado por mradermacher. El modelo base es un merge experimental (creado con mergekit) sobre la familia Qwen, orientado a escritura creativa, narrativa de ficción, roleplaying, razonamiento con cadena de pensamiento largo (long-CoT) y tareas STEM como matemáticas y programación. Los tags sugieren destilación a partir de modelos tipo Claude y soporte de contexto extendido (256k-1M tokens), aunque estos detalles no están documentados formalmente en la model card.

La relevancia de esta ficha radica en la disponibilidad del modelo en formato GGUF, lo que permite ejecutarlo localmente en hardware de consumo mediante llama.cpp, Ollama, LM Studio u otros runtimes compatibles. Se ofrecen cuantizaciones desde Q2_K (11 GB) hasta Q8_0 (29,1 GB), además de suplementos multimodales (mmproj) en Q8_0 y f16, lo que indica que el modelo base incorpora capacidades de visión. Existen también cuantizaciones imatrix/weighted en un repositorio complementario.

Al tratarse de un modelo experimental de la comunidad, sin model card técnica detallada del autor original más allá de los tags, buena parte de la información técnica (datos de entrenamiento, benchmarks, método de destilación) no está disponible y debe evaluarse con cautela antes de uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.x, detalles no disponibles) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no hay evidencia de arquitectura MoE) |
| Longitud de contexto | no disponible formalmente; los tags mencionan 256k y 1M tokens |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 (más cuants imatrix en repositorio aparte) |
| Idiomas soportados | inglés, chino, japonés, español (en, zh, ja, es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base está en safetensors bf16 |

## Arquitectura y entrenamiento

El modelo base, nightmedia/Qwen3.8-27B-MindMeld-OneJev1.6, es un merge de modelos de la familia Qwen (los tags referencian qwen3.5, qwen3.6 y la variante "fable") combinados mediante mergekit, con un LoRA aplicado según los tags del repositorio. Los tags "claude-distillation", "long-cot", "sft" y "reasoning" apuntan a un proceso de ajuste fino supervisado con datos de razonamiento de cadena de pensamiento largo, posiblemente destilado de modelos Claude. No se ha publicado documentación sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

La presencia de archivos mmproj (proyectores multimodales) en las cuantizaciones indica que el modelo base incluye un componente de visión compatible con llama.cpp. El repositorio de mradermacher es una cuantización estática: convierte los pesos bf16 originales a distintos niveles de precisión k-quant e i-quant de llama.cpp sin modificar el comportamiento del modelo.

## Capacidades

- Generación de texto conversacional e instruction-tuned.
- Escritura creativa: generación de tramas, subtramas, escenas, narrativa de ficción en todos los géneros (con énfasis en ciencia ficción según los tags), escritura vívida y storytelling.
- Roleplaying y simulación de personajes.
- Razonamiento con cadena de pensamiento largo (long-CoT / chain-of-thought).
- Matemáticas y tareas STEM.
- Generación y comprensión de código.
- Capacidades multimodales (visión) inferidas por los archivos mmproj incluidos.
- Soporte multilingüe: inglés, chino, japonés y español.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning: no disponible formalmente, aunque el entrenamiento en long-CoT sugiere aptitud para razonamiento multi-paso.

## Casos de uso

- **Escritura de ficción asistida**: generación de capítulos, escenas y tramas completas; el modelo está específicamente ajustado con tags de plot generation, sub-plot generation y scene continue, por lo que resulta adecuado para autores que necesitan continuar narrativas manteniendo coherencia.
- **Roleplaying interactivo**: conversaciones de múltiples turnos interpretando personajes, útil para juegos de rol por texto o prototipado de NPCs con personalidad definida.
- **Razonamiento matemático y STEM local**: resolución de problemas de matemáticas y ciencia con cadena de pensamiento explícita, ejecutado íntegramente en local para privacidad de los datos.
- **Asistente de programación offline**: generación y revisión de código sin enviar repositorios privados a APIs externas, aprovechando el tag de coding.
- **Prototipado de chatbots multilingües**: soporte de español, inglés, chino y japonés para pruebas de asistentes conversacionales en varios idiomas en entornos de desarrollo locales.
- **Investigación sobre merges y cuantización**: el modelo sirve como caso de estudio para evaluar cómo los merges con mergekit y la destilación afectan a la calidad de las cuantizaciones agresivas (Q2_K/Q3_K).
- **Análisis de documentos extensos con visión**: si el contexto de 256k-1M tokens se confirma, permitiría procesar documentos largos combinados con entradas de imagen mediante los archivos mmproj.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un merge experimental de la comunidad, ni el autor del modelo base ni el cuantizador han publicado evaluaciones en MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- **VRAM estimada para inferencia** (tamaño del archivo + overhead de contexto, aproximadamente):
  - Q2_K: ~11 GB
  - Q4_K_M (recomendado): ~17 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29 GB
- **GPU recomendadas**:
  - RTX 4090 (24 GB): ejecuta Q4_K_S/Q4_K_M e IQ4_XS cómodamente.
  - RTX 3090 (24 GB): igual que la 4090, con menor throughput.
  - Apple Silicon (Mac con 32-64 GB de memoria unificada): hasta Q6_K/Q8_0 vía MLX o llama.cpp (los tags incluyen mlx).
  - A100/H100 (40-80 GB): para Q8_0 con contextos largos o despliegue multiusuario.
- **Consumer GPUs**: sí, cabe en una RTX 4090/3090 con cuantizaciones de 4 bits. Con 16 GB de VRAM (RTX 4080/4060 Ti 16GB) es viable Q2_K o Q3_K con degradación de calidad. En CPU pura es ejecutable pero lento para un modelo de 27 B.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, koboldcpp (habitual para modelos de rol/escritura), text-generation-webui. vLLM y TGI no admiten GGUF de forma nativa; para servir con vLLM habría que usar los pesos safetensors del modelo base.
- **Latencia y throughput**: no disponible. En una RTX 4090 con Q4_K_M puede esperarse del orden de 30-50 tokens/s en un modelo denso de 27 B, aunque es una estimación no verificada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B-MindMeld-OneJev1.6 (este modelo) | 27,3 B | 256k-1M (según tags, no verificado) | Apache 2.0 | GGUF estático + imatrix, safetensors en repo base |
| Qwen3-32B (oficial de Alibaba) | 32,5 B | 131.072 tokens (128k) | Apache 2.0 | safetensors, GGUF comunitario, benchmarks publicados |
| Gemma 3 27B (Google) | 27 B | 128k | Gemma license (restricciones de uso) | safetensors, GGUF, multimodal nativo |

Frente a Qwen3-32B, este merge es más ligero (~5 B menos) y promete contexto mayor, pero carece de benchmarks publicados y de respaldo corporativo. Frente a Gemma 3 27B, comparte tamaño similar y capacidad multimodal, pero con licencia Apache 2.0 sin restricciones, a costa de estar orientado a nichos (ficción, roleplay) y carecer de evaluaciones formales.

## Limitaciones y advertencias

- **Modelo experimental sin documentación técnica**: la model card del autor original no detalla datos de entrenamiento, método de destilación ni evaluaciones; los tags sobre "claude-distillation" y contexto de 1M tokens no están verificados formalmente.
- **Riesgo de alucinación**: elevado y no cuantificado, al no existir benchmarks; los merges pueden heredar y amplificar incoherencias de los modelos progenitores.
- **Sesgos**: no evaluados; hereda los sesgos de los modelos base Qwen y de los datos de destilación empleados.
- **Cuantizaciones bajas**: Q2_K y Q3_K_M degradan notablemente la calidad (el propio autor marca Q3_K_M como "lower quality"); para escritura creativa fina se recomienda Q5_K_M o superior.
- **Idiomas**: el español está soportado oficialmente, pero la calidad en cada idioma no está evaluada; el entrenamiento parece dominado por inglés y chino.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones relevantes, aunque los merges pueden estar sujetos a las licencias de los modelos origen (todos bajo Apache 2.0 en la familia Qwen, en principio).
- **Uso en producción**: no recomendado sin evaluación interna previa; al ser un merge comunitario, no hay soporte, garantía de estabilidad ni auditoría de seguridad de los prompts de sistema.
- **Tool calling**: no documentado; no debe asumirse compatibilidad con agentes o function calling sin pruebas propias.

## Enlaces

- Repositorio GGUF (cuantizaciones estáticas): https://huggingface.co/mradermacher/Qwen3.8-27B-MindMeld-OneJev1.6-GGUF
- Repositorio GGUF con imatrix/weighted quants: https://huggingface.co/mradermacher/Qwen3.8-27B-MindMeld-OneJev1.6-i1-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.8-27B-MindMeld-OneJev1.6
- Página de descargas de mradermacher: https://hf.tst.eu/model#Qwen3.8-27B-MindMeld-OneJev1.6-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
