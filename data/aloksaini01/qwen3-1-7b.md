# aloksaini01/Qwen3-1.7B

## Resumen

Qwen3-1.7B es un modelo de lenguaje causal de 1,7 mil millones de parámetros publicado por el equipo Qwen (Alibaba) como parte de la familia Qwen3, la tercera generación de su serie de modelos abiertos. Este repositorio concreto, `aloksaini01/Qwen3-1.7B`, es una resubida del modelo oficial: la model card reproduce literalmente la tarjeta de Qwen, el `base_model` declarado es `Qwen/Qwen3-1.7B-Base` y la licencia es Apache 2.0. No se trata, por tanto, de un ajuste fino propio del autor del repositorio, sino de una copia de los pesos instruct de Qwen3-1.7B alojada en una cuenta de terceros.

El modelo pertenece a la gama densa de Qwen3 (frente a las variantes MoE de mayor tamaño) y su rasgo diferencial es la conmutación explícita entre modo de razonamiento (thinking) y modo directo (non-thinking) dentro de un mismo conjunto de pesos, controlada mediante el parámetro `enable_thinking` de la plantilla de chat. Incorpora 28 capas, atención con Grouped Query Attention (16 cabezas de consulta y 8 de clave/valor) y una ventana de contexto de 32.768 tokens.

Su relevancia práctica está en el segmento de modelos pequeños desplegables en hardware de consumo: con 1,7B parámetros (1,4B sin contar embeddings) cabe en GPUs de gama media e incluso en CPU, y su soporte nativo en vLLM, SGLang, llama.cpp, Ollama y MLX-LM lo convierte en un candidato habitual para prototipado de agentes, clasificación de texto y asistentes locales con requisitos de privacidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (decoder-only) con Grouped Query Attention (GQA) |
| Parámetros totales | 2.031.739.904 según safetensors (~2,03B); la model card declara 1,7B |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | No especificados en la model card; el ecosistema llama.cpp/Ollama ofrece GGUF (Q4_K_M, Q5_K_M, Q8_0, etc.), y MLX-LM ofrece cuantizaciones para Apple Silicon |
| Idiomas soportados | Más de 100 idiomas y dialectos según la model card; el campo de idiomas del repositorio figura como no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers); conversiones comunitarias a GGUF y MLX |
| Capas | 28 |
| Cabezas de atención | 16 para Q y 8 para KV (GQA) |
| Etapa de entrenamiento | Pretraining y post-training |
| Tamaño del repositorio | 4,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only de 28 capas con atención mediante GQA, lo que reduce el coste de caché KV frente a atención multi-cabeza completa. El modelo declara 1,7B parámetros totales, de los cuales 1,4B corresponden a pesos no de embedding; el recuento real de safetensors (2.031.739.904) refleja que el total contabiliza las matrices de embedding, que no están atadas. La ventana de contexto nativa es de 32.768 tokens.

El entrenamiento siguió el pipeline de Qwen3: una fase de preentrenamiento sobre un corpus multilingüe masivo seguida de post-entrenamiento orientado a instrucciones y preferencias humanas. La model card describe mejoras en razonamiento, seguimiento de instrucciones, capacidades de agente y multilingüismo, así como alineación con preferencias humanas en escritura creativa, role-play y diálogo multi-turno. No se detallan en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas como RLHF, DPO o GRPO; tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal. La particularidad funcional más destacable es el modo dual thinking/non-thinking integrado en los mismos pesos: el modo de razonamiento genera contenido dentro de un bloque `<think>...</think>` antes de la respuesta final.

## Capacidades

- Generación de texto conversacional en modo directo y con cadena de razonamiento explícita en modo thinking.
- Razonamiento lógico y matemático reforzado en modo thinking, según la model card superior a QwQ en tareas de razonamiento.
- Generación de código e instrucciones técnicas.
- Seguimiento de instrucciones multi-turno y conversaciones de varios turnos con contexto de hasta 32.768 tokens.
- Capacidades de agente: integración con herramientas externas tanto en modo thinking como non-thinking.
- Soporte de tool calling / function calling mediante plantillas de chat.
- Multilingüismo declarado en más de 100 idiomas y dialectos, con capacidades de traducción.
- Escritura creativa y role-play con alineación de preferencias humanas.
- Control explícito del modo de inferencia mediante `enable_thinking=True/False` en `apply_chat_template`.

## Casos de uso

- Asistentes conversacionales locales: con 4,1 GB en precisión completa o alrededor de 1 GB en cuantización de 4 bits, el modelo puede ejecutarse íntegramente en un portátil o en un equipo de sobremesa sin enviar datos a la nube, lo que resulta adecuado para dominios con requisitos de privacidad (sanidad, legal, documentación interna).
- Clasificación y extracción de información por lotes: su contexto de 32.768 tokens permite procesar documentos largos completos y devolver etiquetas o campos estructurados sin fragmentar el texto, con un coste por token muy inferior al de modelos de 70B.
- Agentes con tool calling en pipelines de automatización: al soportar function calling en ambos modos, puede integrarse como planificador ligero que decide qué herramienta invocar en flujos de CI/CD, automatización de tickets o consultas a APIs internas.
- Generación y revisión de código en entornos con recursos limitados: útil como autocompletado, generación de tests unitarios o explicación de fragmentos, especialmente en configuraciones donde no es viable servir un modelo de 7B o superior.
- Traducción y adaptación multilingüe: el soporte declarado de más de 100 idiomas permite usarlo como motor de traducción en productos con mercados diversos, con la ventaja de poder ejecutarse on-premise.
- Tutoría y resolución de problemas matemáticos paso a paso: activando el modo thinking se obtiene la traza de razonamiento antes del resultado, lo que facilita auditar el proceso seguido en contextos educativos.
- Prototipado rápido y evaluación de arquitecturas de agente: su compatibilidad con vLLM y SGLang permite levantar un endpoint compatible con OpenAI en minutos para validar diseños antes de escalar a modelos mayores.
- Moderación y preprocesado de texto: por su bajo coste, es viable usarlo como primera etapa de filtrado o resumen en sistemas que después delegan en un modelo más grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al blog y a la documentación de Qwen para consultar las evaluaciones, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otras) en el contenido proporcionado.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 4,1 GB solo para pesos, más la caché KV y el overhead del runtime; en la práctica, entre 5 y 6 GB para contexto moderado.
- VRAM estimada en int8: alrededor de 2 GB de pesos, con caché KV adicional.
- VRAM estimada en cuantización GGUF Q4_K_M: en torno a 1,1-1,3 GB de pesos, lo que permite ejecución en GPU con 4 GB o incluso íntegramente en CPU.
- GPUs recomendadas: cualquier GPU con 6-8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090). En el extremo profesional, A100 y H100 quedan sobredimensionadas para un solo modelo, pero son válidas para servirlo en alta concurrencia con batching continuo.
- GPU de consumo: sí cabe, en todas las gamas actuales con 6 GB o más de VRAM, incluida la serie RTX 30 y 40 y los chips Apple Silicon vía MLX-LM.
- Opciones de despliegue: vLLM (>=0.8.5, con `--enable-reasoning --reasoning-parser deepseek_r1`), SGLang (>=0.4.6.post1, con `--reasoning-parser qwen3`), Text Generation Inference (el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`), Ollama, LM Studio, llama.cpp, MLX-LM y KTransformers.
- Latencia y throughput estimados: no disponibles; dependen del backend, la cuantización, el tamaño de lote y la longitud de la caché KV.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modo de razonamiento | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B (este repositorio) | 1,7B (2,03B según safetensors) | 32.768 | Apache 2.0 | Sí, conmutación thinking/non-thinking | Transformers, vLLM, SGLang, TGI, GGUF, MLX |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | No | Transformers, vLLM, GGUF, MLX |
| Llama-3.2-1B-Instruct | 1,23B | 128.000 | Llama 3.2 Community License | No | Transformers, vLLM, GGUF, MLX |
| Gemma-3-1B-it | 1B | 32.000 | Gemma Terms of Use | No | Transformers, vLLM, GGUF, MLX |

Los datos de contexto y licencia de los modelos comparados proceden de su documentación pública y pueden variar con nuevas revisiones. No se dispone de resultados de benchmarks comparativos en la información proporcionada, por lo que no se incluye una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo pequeño: con 1,7B parámetros, la tasa de alucinación en tareas de conocimiento factual es previsiblemente alta y no debe usarse como fuente de verdad sin verificación externa.
- Repeticiones sin fin: la propia model card advierte de que pueden aparecer repeticiones significativas si no se ajustan los parámetros de muestreo, y recomienda fijar `presence_penalty` en 1,5.
- Parámetros de muestreo sensibles al modo: en modo thinking la card indica `Temperature=0.6`, `TopP=0.95`, `TopK=20` y `MinP=0`; usar valores inadecuados degrada la calidad de forma notable.
- Requisito de versión: con `transformers<4.51.0` la carga falla con `KeyError: 'qwen3'`, lo que obliga a actualizar dependencias en entornos congelados.
- Ventana de contexto limitada a 32.768 tokens: aunque suficiente para muchos casos, queda por debajo de alternativas como Llama-3.2-1B (128.000 tokens); no extender el contexto sin recalibrar la atención.
- Idiomas: aunque se declaran más de 100 idiomas, el rendimiento real varía mucho entre lenguas y suele ser inferior en lenguas con poca representación; no hay evaluación por idioma en la información disponible.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, pero conviene conservar los avisos de copyright y verificar la licencia enlazada en el repositorio original de Qwen antes de un despliegue en producción.
- Riesgo de cadena de suministro: el repositorio es una resubida de terceros (`aloksaini01`) de un modelo oficial de Qwen, sin descargas ni interacciones registradas. Se recomienda verificar el hash de los pesos contra el repositorio oficial `Qwen/Qwen3-1.7B` antes de usarlos.
- Metadatos anómalos: la fecha de creación del repositorio (2026-09-14) es posterior a la publicación de la familia Qwen3, lo que refuerza la hipótesis de resubida y aconseja no tratarlo como fuente canónica.
- Uso en producción: para despliegues con alta concurrencia conviene usar batching continuo (vLLM o SGLang) en lugar de `transformers` con `generate`, que no gestiona concurrencia de forma eficiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aloksaini01/Qwen3-1.7B
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Modelo oficial de referencia: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Documentación de despliegue con SGLang: https://qwen.readthedocs.io/en/latest/deployment/sglang.html
- Documentación de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Chat de Qwen: https://chat.qwen.ai/
- Artículo técnico referenciado en las etiquetas del repositorio: arXiv:2505.09388
