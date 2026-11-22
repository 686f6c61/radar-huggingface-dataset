# BigFamTLLM/ml-cpt2-anneal

## Resumen

ml-cpt2-anneal es un modelo de lenguaje de 2.115.305.088 parámetros (aproximadamente 2,12B) desarrollado por el equipo BigFamTLLM en el marco de la asignatura IN5640 de la Universidad de Oslo (otoño de 2026). Se trata de un checkpoint de investigación obtenido mediante preentrenamiento continuado (continued pretraining) sobre texto noruego, partiendo de un modelo multilingüe entrenado desde cero con la misma arquitectura y presupuesto computacional. El modelo emplea la arquitectura Qwen3 (transformer denso, no MoE) y está especializado en noruego bokmål y nynorsk, aunque conserva capacidades en inglés, danés, alemán y sueco.

La relevancia de este modelo es fundamentalmente académica y metodológica: forma parte de un experimento controlado de 50 modelos que compara entrenamiento desde cero frente a adaptación, y distintos regímenes de annealing. Esta versión concreta aplica 916 pasos adicionales (0,48B tokens) sobre texto noruego de alta calidad con decaimiento lineal de la tasa de aprendizaje hasta cero, tras haber visto 6,10B tokens noruegos en total. Es un modelo base, no ajustado por instrucciones, por lo que no soporta diálogo ni tool calling de forma nativa.

El modelo resuelve el problema de disponer de un modelo pequeño y abierto con tokenizador específico para noruego (32k tokens) y contexto de 4.096 tokens, útil para investigación en lenguas de bajos recursos y para experimentación con arquitecturas Qwen3 a pequeña escala. Su licencia no está declarada y sus autores advierten explícitamente que no está pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso estilo Qwen3 (36 capas, hidden size 2176, 34 cabezas de atención, 17 cabezas KV, tied embeddings) |
| Parametros totales | 2.115.305.088 (aproximadamente 2,12B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en bfloat16; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en, da, de, sv, no, nb (bokmål), nn (nynorsk); entrenamiento principal en noruego |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato Hugging Face, convertible desde Megatron-LM con Megatron-Bridge) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 en configuración densa: 36 capas transformer, dimensión oculta de 2.176, 34 cabezas de atención con 17 cabezas KV (GQA), y embeddings atados (tied embeddings) entre entrada y salida. Fue entrenado con Megatron-LM sobre 8 GPUs GH200 en la infraestructura Olivia de Sigma2, con longitud de secuencia 4.096, batch size 128, optimizador AdamW y tasa de aprendizaje máxima de 5e-4 con 2.000 pasos de warmup y sin decaimiento durante el preentrenamiento principal (1e-4 en la fase de solo embeddings).

El proceso de adaptación al noruego consta de varias fases: primero se sustituyó el tokenizador por uno noruego de 32k tokens (los tokens compartidos entre ambos vocabularios conservan su embedding; los nuevos se inicializan con la media de las piezas del tokenizador antiguo), después se realizaron 1.000 pasos de entrenamiento solo de embeddings, y a continuación el preentrenamiento continuado sobre datos de HPLT 4.0 con una mezcla del 85% bokmål y 15% nynorsk. Esta versión anneal añade 916 pasos (0,48B tokens) sobre texto noruego de alta calidad con decaimiento lineal de la tasa de aprendizaje hasta cero. En total, el modelo ha visto 6,10B tokens noruegos. No se reporta uso de RLHF ni DPO; es un modelo exclusivamente base.

## Capacidades

- Generación de texto en noruego bokmål y nynorsk, con soporte secundario de inglés, danés, alemán y sueco.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene diálogos estructurados sin un fine-tuning posterior.
- Razonamiento y conocimiento del mundo limitados, coherentes con un modelo de 2,12B parámetros y 6,10B tokens de entrenamiento.
- Capacidad de completar texto y continuar documentos en contexto de hasta 4.096 tokens.
- Tokenizador específico para noruego (32k), lo que mejora la eficiencia en la tokenización de bokmål y nynorsk frente a tokenizadores multilingües genéricos.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües heredadas del modelo base multilingüe, aunque el entrenamiento continuado se centra en noruego.

## Casos de uso

- Investigación académica en procesamiento del lenguaje natural para lenguas de bajos recursos: sirve como punto de comparación controlado frente a los otros 49 modelos del proyecto BigFamTLLM (desde cero, adaptados, con y sin annealing) para estudiar el efecto del annealing y de la sustitución de tokenizador.
- Evaluación de tokenizadores para noruego: permite medir empíricamente el impacto de un vocabulario de 32k específico frente a tokenizadores multilingües en tareas NorEval, gracias a que el modelo comparte arquitectura y presupuesto con las variantes danesa y multilingüe.
- Generación de texto noruego en dominios acotados: con un fine-tuning ligero sobre un corpus específico (por ejemplo, textos administrativos o noticias), puede emplearse para completado de texto y generación de borradores, aprovechando sus 4.096 tokens de contexto.
- Base para fine-tuning supervisado (SFT): al ser un modelo base pequeño (2,12B), es un punto de partida asequible para experimentos de ajuste por instrucciones en noruego con recursos limitados, por ejemplo en una única GPU de 24 GB en bfloat16.
- Experimentación con arquitecturas Qwen3 a pequeña escala: útil para reproducir y estudiar configuraciones de GQA (34 cabezas, 17 KV) y tied embeddings en entornos con presupuesto reducido.
- Benchmarking de robustez lingüística: el modelo publica métricas de robustez frente a ruido (-0,047 de caída media en tres tareas NorEval), lo que lo hace útil como referencia para estudiar la degradación de modelos pequeños ante entradas ruidosas en noruego.
- Docencia y prácticas de NLP: adecuado para cursos universitarios que necesiten un modelo abierto, pequeño y con pipeline de entrenamiento documentado (Megatron-LM, Megatron-Bridge, HPLT 4.0).

## Benchmarks y rendimiento

Resultados publicados por el autor en NorEval 1.1:

| Grupo de tarea | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,233 | 0,273 |
| nob_orthography | acc | 0,850 | 0,865 |
| nob_reading | f1 | 0,211 | 0,242 |
| nob_world | acc | 0,294 | 0,288 |
| nno_language | em_first | 0,456 | 0,501 |
| nno_world | acc | 0,301 | 0,311 |

Robustez (versiones con ruido de tres tareas NorEval): 0,382 sobre entrada limpia y -0,047 de media bajo ruido.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,3 GB solo para pesos (2,12B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 5 y 6 GB para contexto moderado.
- En cuantización de 8 bits: aproximadamente 2,2 GB de pesos; en 4 bits: aproximadamente 1,1 GB (no se publican cuantizaciones oficiales, pero el modelo es convertible con herramientas estándar).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100, H100 y GH200. En GPUs de 8 GB (RTX 3070, RTX 4060) requeriría cuantización o contexto reducido.
- Cabe en GPU de consumo: sí, en la mayoría de modelos con 8 GB o más en bfloat16, y en GPUs de 4-6 GB con cuantización de 4 u 8 bits.
- Opciones de despliegue: transformers (probado por el autor con `AutoModelForCausalLM` y `dtype=torch.bfloat16`), text-generation-inference (el repo está etiquetado como endpoints_compatible), y previsiblemente llama.cpp/Ollama/vLLM tras conversión a GGUF, aunque no se documenta oficialmente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/ml-cpt2-anneal | 2,12B | 4.096 | no, nb, nn, en, da, de, sv | no disponible | Modelo base de investigación, sin SFT |
| BigFamTLLM/ml-cpt2 | 2,12B | 4.096 | no, nb, nn, en, da, de, sv | no disponible | Mismo modelo sin annealing; comparable directo del proyecto |
| BigFamTLLM/no-base-anneal | no disponible | no disponible | noruego | no disponible | Entrenado desde cero en noruego; comparación del mismo proyecto |
| BigFamTLLM/da-base-anneal | no disponible | no disponible | danés | no disponible | Entrenado desde cero en danés; comparación del mismo proyecto |

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada, por lo que no se incluye comparación de rendimiento con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe usarse directamente en aplicaciones conversacionales ni como asistente sin un fine-tuning previo.
- Riesgo elevado de alucinación y de generar contenido incorrecto u ofensivo, tal como advierten los propios autores; entrenado sobre texto web (HPLT 4.0).
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Capacidad de razonamiento y conocimiento del mundo limitados por su tamaño (2,12B) y por el volumen de entrenamiento (6,10B tokens noruegos); los resultados en NorEval son modestos (por ejemplo, 0,294 de accuracy en nob_world 0-shot).
- Licencia no declarada: no se puede confirmar el uso comercial ni las condiciones de redistribución; tratar como no apto para producción hasta que el autor la especifique.
- Idiomas: aunque la model card lista en, da, de, sv, no, nb y nn, el entrenamiento continuado se centra en noruego; el rendimiento en los demás idiomas no está medido.
- Robustez limitada ante ruido: caída media de -0,047 en las tareas evaluadas con entrada ruidosa.
- Proyecto de estudiantes con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni soporte garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-cpt2-anneal
- Modelo base del que parte: https://huggingface.co/BigFamTLLM/ml-cpt2
- Modelo multilingüe original: https://huggingface.co/BigFamTLLM/ml-base
- Variante multilingüe con annealing: https://huggingface.co/BigFamTLLM/ml-base-anneal
- Variante noruega desde cero: https://huggingface.co/BigFamTLLM/no-base
- Variante noruega desde cero con annealing: https://huggingface.co/BigFamTLLM/no-base-anneal
- Variante danesa desde cero: https://huggingface.co/BigFamTLLM/da-base
- Variante danesa desde cero con annealing: https://huggingface.co/BigFamTLLM/da-base-anneal
- Asignatura IN5640, Universidad de Oslo: no disponible (sin URL en la información proporcionada)
- Dataset HPLT 4.0: no disponible (sin URL en la información proporcionada)
- Paper o blog del proyecto: no disponible
