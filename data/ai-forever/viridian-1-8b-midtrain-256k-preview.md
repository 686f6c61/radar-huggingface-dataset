# ai-forever/Viridian-1-8B-Midtrain-256K-Preview

## Resumen

Viridian-1-8B-Midtrain-256K-Preview es un checkpoint intermedio (midtrain, etapa 3) de la familia Viridian-1-8B, desarrollada por ai-forever. Se trata de un modelo de lenguaje decoder-only híbrido de 8.313 millones de parámetros principales, más una cabeza de predicción multi-token (MTP) de 250 millones de parámetros pensada para decodificación especulativa. Su rasgo diferencial es la combinación de capas KDA (Kimi Delta Attention, atención lineal) y capas MLA (Multi-head Latent Attention) intercaladas en ocho grupos, conectadas mediante Attention Residuals, y la ausencia total de codificaciones posicionales explícitas (NoPE).

El modelo resuelve dos problemas clásicos de los transformers densos: el coste cuadrático de la atención en contextos largos y la inestabilidad del entrenamiento a gran escala. La mezcla KDA/MLA permite inferencia eficiente con ventana nativa de 256K tokens, extensible a 1M, mientras que Attention Residuals mejora la estabilidad y reduce la cross-entropy a igual presupuesto de tokens. Este checkpoint concreto se ha entrenado con 100.120 millones de tokens adicionales sobre la etapa de 64K, alcanzando la ventana de 256K.

Es relevante ahora porque ai-forever publica la receta completa de entrenamiento (mezclas de datos, configuraciones y código de evaluación) bajo licencia Apache 2.0, con todos los datos de entrenamiento disponibles bajo licencias permisivas. No obstante, se trata de un checkpoint base en fase preview: no incluye alineamiento SFT ni RL, por lo que no debe usarse directamente como asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido: 8 grupos intercalados con 24 capas KDA y 8 capas MLA, Attention Residuals, NoPE (sin codificación posicional) |
| Parametros totales | 8.313.537.098 (modelo principal) + 250 M de cabeza MTP |
| Parametros activos | No aplica (modelo denso; la cabeza MTP es un componente auxiliar de decodificación especulativa) |
| Longitud de contexto | 256K tokens nativos, extensible a 1M |
| Tipos de cuantizacion | No disponible (el repo solo distribuye safetensors en bfloat16; no se documentan GGUF ni AWQ) |
| Idiomas soportados | Inglés (en) y ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 33,3 GB), con código de modelo personalizado (`trust_remote_code=True`) y plugin vLLM incluido |

## Arquitectura y entrenamiento

La arquitectura combina dos tipos de bloque de atención en ocho grupos intercalados: 24 capas KDA (atención lineal de tipo delta, eficiente en prefill y decodificación de contextos largos) y 8 capas MLA (atención latente multi-cabeza, que comprime las claves y valores en un espacio latente de baja dimensión). Las capas se conectan mediante Attention Residuals, un mecanismo de conexiones residuales a nivel de atención que, según el autor, mejora la estabilidad del entrenamiento y reduce la pérdida de cross-entropy a igual número de tokens. El modelo omite por completo las codificaciones posicionales (NoPE), lo que junto a KDA y Attention Residuals habilita la ventana de 256K con recall del 100% en tareas NIAH dentro de RULER.

El entrenamiento se organiza en tres fases: 5,3 billones de tokens de preentrenamiento (ventana de 4K), 400.000 millones de tokens de midtrain repartidos en tres etapas (151.030 M a 4K, 150.860 M a 64K y 100.120 M a 256K, que es este checkpoint) y 48.900 millones de tokens de SFT (ventana de 32K/128K). El foco de los datos son matemáticas y tareas agénticas, con incorporación de datasets en ruso durante el midtrain. Tras cada etapa se aplica model souping con pesos EMA para estabilizar los checkpoints. La cabeza MTP de 250 M permite decodificación especulativa, y el autor publica la receta completa con mezclas de datos de código abierto.

## Capacidades

- Generación de texto autoregresiva en inglés y ruso; al ser un checkpoint base, funciona por continuación de prompt, no como asistente instruido.
- Razonamiento matemático reforzado: el entrenamiento prioriza matemáticas y tareas agénticas.
- Procesamiento de contexto largo nativo de 256K tokens, con extensión a 1M y recall completo en NIAH según el autor.
- Decodificación especulativa mediante cabeza MTP de 250 M de parámetros, orientada a reducir latencia en decodificación.
- Capacidades agénticas en desarrollo: el autor anuncia alineamiento con RL agéntico para la versión completa, no incluido en este preview.
- Soporte de tool calling / function calling: no disponible en este checkpoint base (no hay SFT de instrucciones).
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Investigación en arquitecturas híbridas: reproducir y auditar la combinación KDA/MLA con Attention Residuals usando la receta y los datos publicados, para estudiar el impacto de NoPE en la estabilidad del entrenamiento.
- Fine-tuning para tareas de matemáticas: partir de este checkpoint de 256K y aplicar SFT específico en dominios como demostración de teoremas o resolución de problemas competitivos, aprovechando el sesgo matemático del midtrain.
- Procesamiento de documentos largos en ruso e inglés: análisis de contratos, expedientes o corpus técnicos de hasta 256K tokens en una sola pasada, sin truncado ni recuperación externa.
- Evaluación de recuperación en contexto largo: usar el modelo como banco de pruebas para tareas NIAH y RULER, verificando el recall declarado del 100% en ventanas de 256K.
- Servicio de inferencia de alto rendimiento: desplegar con el plugin vLLM incluido (vLLM 0.34.0) para servir completions con `--enforce-eager` y tensor-parallel-size 1 en una sola GPU.
- Generación de datos sintéticos: producir corpus de continuación de texto en inglés y ruso para preentrenamiento o destilación, dado que es un modelo base sin alineamiento.
- Desarrollo de decodificación especulativa: integrar la cabeza MTP como drafter en pipelines de inferencia y medir la aceleración frente a decodificación estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. El autor afirma que Viridian-1-8B establece un nuevo estado del arte entre LLMs híbridos densos de 8B, superando a modelos de tamaño y presupuesto de tokens comparables y compitiendo con modelos más costosos, y declara un recall del 100% en tareas NIAH de RULER con 256K de contexto, pero no se incluyen tablas con cifras de MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16,6 GB solo para pesos, más caché KV y activaciones; en la práctica se recomienda una GPU de 24 GB o más para contextos moderados.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para contexto largo; una RTX 4090 de 24 GB puede alojar los pesos en bf16, pero el contexto útil quedará limitado por la memoria restante.
- Cabe en GPU de consumo: sí en RTX 4090 (24 GB) y RTX 3090 (24 GB) con contexto reducido; no se documentan cuantizaciones GGUF/INT4 en el repo, por lo que no hay una vía oficial para GPUs de 16 GB o menos.
- Despliegue: Transformers con `trust_remote_code=True` (backend KDA de referencia en PyTorch, lento en prefills largos) o el plugin vLLM incluido, que requiere vLLM 0.34.0 y Python 3.11.18; el ejemplo del autor usa `--max-model-len 4096`, `--max-num-seqs 4`, `--max-num-batched-tokens 1024` y `--no-enable-prefix-caching`.
- Latencia y throughput: no disponibles; el autor solo indica que el backend de referencia en PyTorch es lento para prefills largos y que vLLM ofrece servicio nativo en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Viridian-1-8B-Midtrain-256K-Preview | 8,31 B (+250 M MTP) | 256K (ext. 1M) | Híbrida KDA/MLA, NoPE | Apache 2.0 | Hugging Face, preview |
| Llama 3.1 8B | 8,03 B | 128K | Transformer denso con RoPE | Llama 3.1 Community | Hugging Face, estable |
| Qwen2.5 7B | 7,62 B | 128K | Transformer denso con RoPE | Apache 2.0 | Hugging Face, estable |
| Mistral 7B v0.3 | 7,24 B | 32K | Transformer denso con RoPE | Apache 2.0 | Hugging Face, estable |

La comparación de rendimiento frente a estas alternativas no está disponible: el autor no publica cifras de benchmarks que permitan una confrontación directa. La ventaja diferencial de Viridian es la ventana de 256K nativa y la decodificación especulativa integrada; su desventaja es que se trata de un checkpoint base preview sin alineamiento, frente a alternativas ya instruidas y ampliamente validadas en producción.

## Limitaciones y advertencias

- Es un checkpoint base de midtrain: no ha pasado por SFT ni RLHF/DPO, por lo que no sigue instrucciones ni mantiene formato conversacional de forma fiable.
- Fase preview: el autor anuncia una versión completa con mayor presupuesto de preentrenamiento, RL agéntico y esparsificación MLA; el comportamiento puede cambiar sustancialmente.
- Riesgo de alucinación inherente a un modelo base sin alineamiento; no apto para uso directo en producción orientada a usuario final.
- Cobertura lingüística limitada a inglés y ruso; no se documenta soporte de castellano.
- Sesgos conocidos: no disponibles en la información proporcionada; los datos de entrenamiento son públicos y permisivos, pero no se detalla su composición demográfica.
- Licencia Apache 2.0 permite uso comercial, pero al requerir `trust_remote_code=True` se ejecuta código personalizado del repositorio, lo que implica un riesgo de seguridad que debe auditarse.
- El backend KDA de referencia en PyTorch es lento para prefills largos; para producción en contexto largo es necesario el plugin vLLM, con la configuración concreta documentada por el autor.
- No se distribuyen cuantizaciones oficiales; el despliegue en GPUs de menos de 24 GB no está soportado por el momento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-forever/Viridian-1-8B-Midtrain-256K-Preview
- Repositorio GitHub: https://github.com/ai-forever/Viridian
- Checkpoint de preentrenamiento: https://huggingface.co/ai-forever/Viridian-1-8B-Pretrain-Preview
- Checkpoint midtrain 4K: https://huggingface.co/ai-forever/Viridian-1-8B-Midtrain-4K-Preview
- Checkpoint midtrain 64K: https://huggingface.co/ai-forever/Viridian-1-8B-Midtrain-64K-Preview
- Checkpoint SFT: https://huggingface.co/ai-forever/Viridian-1-8B-SFT-Preview
- Artículo en Habr (ruso): enlace no disponible (la model card contiene un marcador de posición sin URL)
