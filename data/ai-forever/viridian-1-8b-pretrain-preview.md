# ai-forever/Viridian-1-8B-Pretrain-Preview

## Resumen

Viridian-1-8B-Pretrain-Preview es un modelo de lenguaje decoder-only de arquitectura híbrida desarrollado por ai-forever (el equipo detrás de la familia Yandex/GigaChat de código abierto). Combina capas de atención lineal KDA (Kimi Delta Attention) con capas de atención MLA (Multi-head Latent Attention) en ocho grupos intercalados, prescindiendo por completo de codificaciones posicionales explícitas (NoPE). El checkpoint publicado es la fase de preentrenamiento, con un contexto nativo de 4K tokens, aunque la arquitectura base soporta hasta 256K y es extensible a 1M.

El modelo tiene 8.313 millones de parámetros en el cuerpo principal y una cabeza de predicción multi-token (MTP) de 250 millones de parámetros para decodificación especulativa. Se entrenó sobre 5,26 billones de tokens en la fase de preentrenamiento, con un enfoque marcado en matemáticas y tareas agénticas, y con datos en ruso introducidos durante las fases posteriores de midtraining (no en este checkpoint de preentrenamiento).

Su relevancia radica en ser una de las primeras implementaciones abiertas que combina KDA con Attention Residuals para lograr ventanas de contexto muy largas sin codificación posicional, con recetas de entrenamiento y datasets completamente abiertos bajo licencias permisivas. La versión publicada es una *preview*; el autor anuncia una release completa con mayor presupuesto de tokens, alineamiento por RL agéntico y esparsificación de MLA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only híbrida: 24 capas KDA + 8 capas MLA intercaladas en 8 grupos, con Attention Residuals y NoPE |
| Parametros totales | 8.313.537.098 (cuerpo principal) + 250 M en cabeza MTP |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4K tokens en este checkpoint (arquitectura nativa hasta 256K, extensible a 1M) |
| Tipos de cuantizacion | No disponible (solo se documenta bfloat16 en los ejemplos oficiales) |
| Idiomas soportados | Inglés (en), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code; plugin vLLM incluido en el repo) |

## Arquitectura y entrenamiento

La arquitectura intercala ocho grupos de bloques, cada uno compuesto por capas KDA (atención lineal con estado recurrente) y MLA (atención latente multi-cabeza), conectadas mediante Attention Residuals, una variante de conexiones residuales que el autor reporta que mejora la estabilidad del entrenamiento y reduce la cross-entropy a igual presupuesto de tokens. El modelo omite cualquier codificación posicional explícita (NoPE), delegando la información de orden a los mecanismos de atención. La cabeza MTP de 250 M de parámetros habilita decodificación especulativa.

El preentrenamiento consumió 5,26 billones de tokens; las fases posteriores de midtraining suman aproximadamente 400 mil millones de tokens (151 B a 4K, 150,86 B a 64K y 100,12 B a 256K) y la fase de SFT 48,9 mil millones. El foco de los datos es matemáticas y tareas agénticas, con datasets rusos introducidos en midtraining. Tras cada etapa se aplica *model souping* con pesos EMA para estabilizar los checkpoints. Todos los datasets empleados son públicos y de licencia permisiva, y el autor publica las recetas completas de entrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés y ruso (este checkpoint de preentrenamiento no está alineado para instrucciones).
- Razonamiento matemático reforzado por la composición del dataset de entrenamiento.
- Procesamiento de contexto largo en las versiones midtraining (hasta 256K, extensible a 1M con 100 % de recall en NIAH según el autor).
- Decodificación especulativa nativa mediante la cabeza MTP de 250 M de parámetros.
- Compatibilidad con vLLM a través de un plugin incluido en el repositorio.
- Soporte de tool calling y comportamiento agéntico: no confirmado en este checkpoint de preentrenamiento; el autor lo anuncia para la release completa con RL agéntico.
- Capacidades multimodales: no disponibles.

## Casos de uso

- **Investigación en arquitecturas híbridas**: el modelo permite estudiar el comportamiento de KDA + MLA + Attention Residuals sin codificación posicional sobre pesos abiertos, comparando con transformers clásicos a igual tamaño.
- **Base para fine-tuning en matemáticas**: al estar preentrenado con énfasis en matemáticas, sirve como punto de partida para SFT o DPO en dominios cuantitativos (resolución de problemas, generación de demostraciones formales).
- **Prototipado de decodificación especulativa**: la cabeza MTP integrada permite medir aceleraciones de inferencia sin necesidad de entrenar un modelo drafter separado.
- **Evaluación de contexto largo en fase de midtraining**: quienes necesiten ventanas de 64K-256K deben usar los checkpoints de midtraining de la familia; este checkpoint sirve para validar pipelines de datos y tokenización antes de escalar.
- **Desarrollo de plugins de serving**: el repositorio incluye un plugin vLLM de referencia que sirve como plantilla para integrar arquitecturas híbridas personalizadas en stacks de producción.
- **Reproducibilidad de recetas abiertas**: al publicarse datasets, configuraciones y código de evaluación, es útil para replicar experimentos de scaling con presupuestos acotados.
- **Modelos base para aplicaciones en ruso**: las versiones posteriores de midtraining incorporan datos rusos, lo que permite construir asistentes en ese idioma sobre una base permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma que el modelo "establece un nuevo estado del arte entre LLMs híbridos de 8 mil millones de parámetros densos" y menciona 100 % de recall en tareas NIAH de RULER para la ventana de 256K, pero no se incluyen cifras concretas de MMLU, HumanEval, GSM8K ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- **VRAM estimada en bfloat16**: aproximadamente 16,6 GB solo para pesos (8,31 B × 2 bytes), más overhead de activaciones y caché; en la práctica se recomienda ≥ 24 GB para inferencia con contexto moderado.
- **GPU recomendadas**: A100 40/80 GB, H100 80 GB para serving con vLLM; RTX 4090 (24 GB) puede alojar los pesos en bf16 con margen limitado.
- **Consumer GPU**: sí, en GPUs con 24 GB o más (RTX 3090, 4090, 5090). Para GPUs de 16 GB sería necesaria cuantización, no documentada oficialmente.
- **Despliegue**: Transformers con `trust_remote_code=True` (backend KDA de referencia, lento en prefills largos) y vLLM 0.34.0 con el plugin incluido (`--tokenizer-mode viridian`, `--enforce-eager`). No se documentan integraciones con llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles. El ejemplo de serving de vLLM limita a 4.096 tokens de contexto, 4 secuencias concurrentes y 1.024 tokens por batch, lo que sugiere un rendimiento modesto en la configuración de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Viridian-1-8B-Pretrain-Preview | 8,31 B (+250 M MTP) | 4K (hasta 256K/1M en la familia) | Híbrida KDA + MLA, NoPE | Apache 2.0 | Hugging Face, plugin vLLM |
| Llama 3.1 8B | 8,03 B | 128K | Transformer denso con RoPE | Llama 3.1 Community | Hugging Face, ecosistema amplio |
| Qwen2.5 7B | 7,62 B | 128K | Transformer denso con RoPE | Apache 2.0 | Hugging Face, vLLM, llama.cpp |
| Mistral 7B v0.3 | 7,24 B | 32K | Transformer denso con RoPE | Apache 2.0 | Hugging Face, amplio soporte |

No se dispone de comparaciones de rendimiento numéricas entre Viridian y estos modelos en la información proporcionada. La ventaja diferencial de Viridian es su arquitectura híbrida con contexto extensible y su cabeza MTP; su desventaja actual es la madurez del ecosistema (solo Transformers y vLLM con plugin) y que este checkpoint es de preentrenamiento, no alineado.

## Limitaciones y advertencias

- **Checkpoint de preentrenamiento**: no está alineado para seguir instrucciones ni para conversación; su uso directo produce completaciones, no respuestas.
- **Contexto efectivo limitado a 4K** en este checkpoint; las ventanas de 64K-256K requieren los checkpoints de midtraining.
- **Idiomas**: solo inglés y ruso; el rendimiento en castellano no está garantizado ni documentado.
- **Sesgos y alucinación**: no se documentan evaluaciones de sesgo ni de tasa de alucinación; al ser un modelo base entrenado con datos web, es esperable que reproduzca sesgos presentes en el corpus.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el código antes de desplegarlo en producción.
- **Ecosistema inmaduro**: sin soporte en llama.cpp, Ollama ni TGI; el plugin de vLLM está atado a la versión 0.34.0 y la configuración de referencia desactiva prefix caching y usa `--enforce-eager`.
- **Estado preview**: el autor advierte que la release completa cambiará el presupuesto de tokens, añadirá RL agéntico y esparsificación de MLA, por lo que los resultados actuales no son definitivos.
- **Backend de referencia lento**: el backend KDA en PyTorch puro prioriza corrección sobre velocidad en prefills largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-forever/Viridian-1-8B-Pretrain-Preview
- Repositorio GitHub: https://github.com/ai-forever/Viridian
- Checkpoint Midtrain 4K: https://huggingface.co/ai-forever/Viridian-1-8B-Midtrain-4K-Preview
- Checkpoint Midtrain 64K: https://huggingface.co/ai-forever/Viridian-1-8B-Midtrain-64K-Preview
- Checkpoint Midtrain 256K: https://huggingface.co/ai-forever/Viridian-1-8B-Midtrain-256K-Preview
- Checkpoint SFT: https://huggingface.co/ai-forever/Viridian-1-8B-SFT-Preview
- Artículo en Habr (ruso): enlace no disponible (la model card contiene un placeholder)
