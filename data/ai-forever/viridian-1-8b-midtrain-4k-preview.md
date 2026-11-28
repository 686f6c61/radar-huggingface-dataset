# ai-forever/Viridian-1-8B-Midtrain-4K-Preview

## Resumen
Viridian-1-8B-Midtrain-4K-Preview es un checkpoint intermedio (midtraining, etapa 1) de la familia Viridian-1-8B, desarrollada por ai-forever (Sber). Se trata de un modelo decoder-only híbrido de 8.313.537.098 parámetros orientado a generación de texto, con un enfoque explícito en eficiencia de inferencia y procesamiento de contexto largo. La arquitectura combina 24 capas KDA (atención lineal) y 8 capas MLA (Multi-head Latent Attention) intercaladas en ocho grupos, unidas mediante Attention Residuals, y prescinde por completo de codificación posicional explícita (NoPE).

El modelo incorpora una cabeza de predicción multi-token (MTP) de 250 millones de parámetros pensada para decodificación especulativa. Esta versión preview se distribuye con contexto nativo de 4K tokens, aunque la familia escala hasta 256K nativos y 1M extendidos en el checkpoint base de contexto largo. El entrenamiento reportado abarca 5,3 billones de tokens de preentrenamiento, 400.000 millones de midtraining y 50.000 millones de SFT en el conjunto de la familia, con datos públicos bajo licencias permisivas y un foco declarado en matemáticas y tareas agénticas.

Es relevante ahora porque ai-forever publica recetas completas de entrenamiento, configuraciones y código de evaluación, y porque la combinación KDA + Attention Residuals busca un equilibrio poco habitual en la franja de 8B: inferencia barata en contexto largo sin sacrificar estabilidad de entrenamiento. La licencia Apache 2.0 facilita su adopción comercial, y el soporte de vLLM mediante plugin propio lo sitúa como candidato para despliegues en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only híbrida: 24 capas KDA (atención lineal) + 8 capas MLA intercaladas en 8 grupos, con Attention Residuals y NoPE |
| Parametros totales | 8.313.537.098 (modelo principal) + 250 M de cabeza MTP |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4K tokens nativo en este checkpoint (la familia alcanza 256K nativo y 1M extendido) |
| Tipos de cuantizacion | no disponible (solo se documenta bfloat16 en los ejemplos oficiales) |
| Idiomas soportados | en, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código de modelo personalizado, `trust_remote_code=True`) |

## Arquitectura y entrenamiento
La arquitectura es una transformer decoder-only híbrida que alterna bloques de atención lineal KDA con bloques MLA, organizados en ocho grupos intercalados. Las Attention Residuals conectan estos bloques y, según el autor, mejoran la estabilidad del entrenamiento y reducen la entropía cruzada con el mismo presupuesto de tokens. El modelo omite codificación posicional explícita (NoPE), lo que junto con KDA habilita ventanas de contexto largas: el checkpoint base de 256K alcanza, según la model card, un 100 % de recall en tareas NIAH dentro de RULER, extensible a 1M tokens. La cabeza MTP de 250 M de parámetros está diseñada para decodificación especulativa, acelerando la generación sin cambiar el modelo principal.

El entrenamiento se reparte en tres fases: 5,26 billones de tokens de preentrenamiento (checkpoint de 4K), 151.030 millones de tokens en la etapa 1 de midtraining (este checkpoint, 4K), 150.860 millones en la etapa 2 (64K) y 100.120 millones en la etapa 3 (256K), más 48.900 millones de tokens de SFT. Los datos son públicos y permisivos, con incorporación de conjuntos en ruso durante el midtraining. Tras cada etapa se aplica model souping con pesos EMA para estabilizar checkpoints y mejorar las métricas de evaluación. No se documenta en la información disponible el uso de RLHF o DPO; la alineación con RL agéntico se anuncia para la versión completa.

## Capacidades
- Generación de texto autoregresiva en inglés y ruso, con prompts de completación de modelo base (requiere BOS sin EOS para completaciones).
- Razonamiento matemático y tareas agénticas como foco declarado del entrenamiento.
- Procesamiento de contexto largo en los checkpoints de la familia (hasta 256K nativo y 1M extendido en el base de contexto largo); este checkpoint concreto está limitado a 4K.
- Decodificación especulativa mediante la cabeza MTP de 250 M de parámetros.
- Servido nativo en vLLM a través de un plugin instalable que reutiliza configuración, tokenizer y shards safetensors del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: el entrenamiento se orienta a tareas agénticas, pero no se detallan capacidades específicas verificadas en este checkpoint.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso
- Completación de texto y prototipado de modelos base: este checkpoint de midtraining sirve para evaluar la arquitectura KDA/MLA antes de pasar a los checkpoints de SFT, con prompts de completación y temperatura 0 para resultados reproducibles.
- Investigación en arquitecturas híbridas de atención: al publicarse recetas, configuraciones y código de evaluación, permite reproducir experimentos con Attention Residuals y NoPE y comparar curvas de pérdida frente a transformers clásicos.
- Evaluación de decodificación especulativa: la cabeza MTP de 250 M permite medir ganancias de throughput en pipelines de generación con vLLM y comparar con decodificación autoregresiva estándar.
- Procesamiento de documentos largos en ruso e inglés: aunque este checkpoint está limitado a 4K, la familia escala a 256K/1M, lo que lo hace adecuado para pipelines de resumen y extracción sobre contratos, informes o expedientes en ambos idiomas.
- Generación asistida en entornos con restricciones de licencia: la licencia Apache 2.0 y los datos de entrenamiento permisivos facilitan su integración en productos comerciales sin obligaciones de atribución complejas.
- Despliegue en infraestructura propia con vLLM: el plugin incluido permite servir el modelo con configuración bfloat16, tensor-parallel-size 1 y max-model-len 4096, útil para entornos on-premise con GPUs NVIDIA.
- Base para fine-tuning posterior: al ser un checkpoint intermedio, es un punto de partida para SFT o adaptación a dominios específicos (legal, financiero, técnico) en inglés y ruso.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que el modelo establece un nuevo estado del arte entre LLMs híbridos de 8B densos y que alcanza un 100 % de recall en NIAH dentro de RULER en el checkpoint de 256K, pero no se incluyen tablas numéricas de MMLU, HumanEval, GSM8K ni comparativas cuantitativas con otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia en bfloat16: en torno a 16,6 GB solo para pesos (8.313.537.098 parámetros × 2 bytes), más overhead de activaciones, caché KV y la cabeza MTP; en la práctica se recomienda al menos 24 GB para contexto de 4K.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para servir en bfloat16 con contexto de 4K.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en GPUs de 24 GB similares; en tarjetas de 16 GB requeriría cuantización, no documentada oficialmente.
- Opciones de despliegue: vLLM 0.34.0 con el plugin `vllm_plugin/` incluido en el repositorio (recomendado para GPU); Transformers con `trust_remote_code=True` y backend KDA de referencia en PyTorch, que el autor describe como correcto pero lento en prefills largos.
- Latencia y throughput estimados: no disponibles. La configuración oficial de vLLM usa `--enforce-eager`, `--max-num-seqs 4`, `--max-num-batched-tokens 1024` y sin prefix caching, lo que sugiere un despliegue conservador orientado a estabilidad más que a máximo rendimiento.

## Comparativa con modelos similares
No se dispone de datos de benchmarks del modelo, por lo que la comparación se limita a características estructurales. Los modelos alternativos indicados son referencias de la franja 7-9B densos ampliamente extendidos; los datos de sus fichas no forman parte de la información proporcionada y se marcan como no disponibles cuando no se pueden verificar aquí.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Viridian-1-8B-Midtrain-4K-Preview | 8,31 B (+250 M MTP) | 4K (familia hasta 256K/1M) | Híbrida KDA + MLA, NoPE | Apache 2.0 | Hugging Face, vLLM plugin |
| Llama 3.1 8B | 8 B | 128K | Transformer densa | Llama 3.1 Community License | Hugging Face |
| Qwen2.5 7B | 7,6 B | 128K | Transformer densa | Apache 2.0 | Hugging Face |
| Mistral 7B v0.3 | 7,2 B | 32K | Transformer densa | Apache 2.0 | Hugging Face |

La ventaja estructural de Viridian frente a estas alternativas es la combinación de atención lineal KDA con MLA y la cabeza MTP, orientada a eficiencia en contexto largo; su desventaja en esta preview es el contexto nativo de 4K y la ausencia de benchmarks publicados que permitan validar la afirmación de estado del arte.

## Limitaciones y advertencias
- Es un checkpoint de midtraining, no un modelo alineado: no ha pasado por SFT en esta versión ni por RL agéntico (anunciado para la versión completa), por lo que puede producir salidas incoherentes o no seguir instrucciones.
- Contexto nativo de solo 4K tokens en este checkpoint; no debe usarse para tareas de contexto largo hasta disponer de los checkpoints de 64K o 256K.
- Riesgo de alucinación inherente a un modelo base sin alineación; no apto para producción directa sin evaluación y fine-tuning.
- Idiomas limitados a inglés y ruso; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- Requiere `trust_remote_code=True` y código personalizado, lo que implica revisar el código del repositorio antes de ejecutarlo en entornos sensibles.
- El backend KDA de referencia en PyTorch es lento en prefills largos; para producción es necesario el plugin de vLLM, lo que añade una dependencia de versión (vLLM 0.34.0).
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero no se ofrece garantía ni indemnización por parte del autor.
- El repositorio ocupa 33,3 GB, lo que exige planificar el almacenamiento y la descarga.

## Enlaces
- [Hugging Face: ai-forever/Viridian-1-8B-Midtrain-4K-Preview](https://huggingface.co/ai-forever/Viridian-1-8B-Midtrain-4K-Preview)
- [GitHub: ai-forever/Viridian](https://github.com/ai-forever/Viridian)
- [Checkpoint de preentrenamiento (4K)](https://huggingface.co/ai-forever/Viridian-1-8B-Pretrain-Preview)
- [Checkpoint de midtraining etapa 2 (64K)](https://huggingface.co/ai-forever/Viridian-1-8B-Midtrain-64K-Preview)
- [Checkpoint de midtraining etapa 3 (256K)](https://huggingface.co/ai-forever/Viridian-1-8B-Midtrain-256K-Preview)
- [Checkpoint SFT](https://huggingface.co/ai-forever/Viridian-1-8B-SFT-Preview)
- Artículo en Habr (ruso): enlace no disponible en la información proporcionada.
