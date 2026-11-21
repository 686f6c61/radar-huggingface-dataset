# MaagDeveloper/NeoLM-Small-Base

## Resumen
NeoLM-Small-Base es un modelo de lenguaje causal (decoder-only) de 61.356.032 parámetros entrenado desde cero por MaagDeveloper con PyTorch y Hugging Face Transformers. Se publica en la rama `main` como checkpoint base de la etapa "Stage 1 Foundation Continued 30K", en formato bfloat16 y safetensors. No es un modelo ajustado por instrucciones ni un asistente conversacional: es un modelo de predicción del siguiente token, pensado como base para experimentación y para posteriores etapas de ajuste.

La arquitectura es un transformer decoder-only de 12 capas, dimensión oculta 512, 8 cabezas de consulta y 2 cabezas KV (GQA), MLP SwiGLU con tamaño intermedio 1.536, normalización RMSNorm con QK Norm, codificación posicional RoPE y embeddings atados. La longitud de contexto es de 1.024 tokens y el vocabulario es un ByteLevel BPE propio de 49.152 entradas, entrenado exclusivamente sobre el split de entrenamiento de NeoCorpus.

Su relevancia es la de un modelo pequeño, reproducible y con trazabilidad completa del pipeline de datos y tokenizador, útil para estudiar el comportamiento de modelos fundacionales a pequeña escala, validar recetas de entrenamiento y servir como punto de partida para fine-tuning. El checkpoint publicado corresponde a una continuación de 30K pasos de optimizador sobre el checkpoint Foundation original, con una mejora medida muy pequeña en perplejidad respecto al checkpoint de 20K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, con GQA, SwiGLU, RMSNorm, QK Norm y RoPE |
| Parametros totales | 61.356.032 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos BF16 en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors en bfloat16; implementacion custom `NeoLMForCausalLM` con `trust_remote_code=True` |
| Capas | 12 |
| Dimension oculta | 512 |
| Cabezas de consulta / KV | 8 / 2 (GQA) |
| Tamano intermedio MLP | 1.536 (SwiGLU) |
| Vocabulario | 49.152 (ByteLevel BPE propio) |
| Tokens especiales | EOS `<\|endoftext\|>` ID 0; PAD `<\|pad\|>` ID 1; sin BOS |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de 12 capas con dimensión oculta 512 y 8 cabezas de atención con 2 cabezas KV (GQA), lo que reduce el coste de memoria de la caché KV en inferencia. Usa MLP SwiGLU con tamaño intermedio 1.536, RMSNorm con QK Norm, RoPE para posiciones y embeddings de entrada y salida atados. La implementación es código custom (`NeoLMForCausalLM`), por lo que requiere `trust_remote_code=True` para cargarse.

El entrenamiento parte del dataset NeoCorpus, configuración `foundation`, derivada de un subconjunto filtrado centrado en inglés de Karpathy ClimbMix Shuffle (a su vez basado en NVIDIA Nemotron-ClimbMix). El split de entrenamiento contiene 1.889.952 documentos y 1.147.218.931 tokens contados con el tokenizador de esta release, incluyendo separadores EOS entre documentos. El split de validación tiene 5.000 documentos y 3.084.132 tokens; el de test, 20.000 documentos y 12.094.582 tokens, ambos reservados fuera del preentrenamiento. El tokenizador ByteLevel BPE de 49.152 entradas se entrenó solo sobre el split de entrenamiento, con pre-tokenización regex estilo GPT y grupos de 1 a 3 dígitos.

El checkpoint Foundation original se entrenó aproximadamente 202K pasos de optimizador antes de una interrupción del sistema. La continuación seleccionada añadió 20K pasos y luego 10K más desde ese checkpoint, sumando unos 232K pasos en la trayectoria elegida; el calendario original de tres épocas no se completó. El preentrenamiento consume flujos contiguos de tokens en `uint16` con EOS entre documentos y ventanas de 1.024 tokens con stride 1.023 (solapamiento de un token). No se documenta RLHF, DPO ni ajuste por instrucciones en esta etapa.

## Capacidades
- Generación de texto autoregresiva y predicción del siguiente token en inglés.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene formato conversacional de forma fiable.
- Razonamiento y conocimiento factual limitados por su tamaño (61M de parámetros) y por el volumen de entrenamiento.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso estructurado.
- Capacidades multilingües: solo inglés según la model card.
- Sin capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Tokenizador propio cargable de forma independiente, sin cargar los pesos del modelo.

## Casos de uso
- Investigación sobre entrenamiento de modelos fundacionales a pequeña escala: sirve para reproducir y analizar curvas de pérdida, selección de checkpoints y estabilidad del entrenamiento con un presupuesto de cómputo reducido.
- Fine-tuning supervisado para tareas concretas en inglés: al ser un checkpoint base de 61M, es un punto de partida barato para ajustar clasificación de texto, generación de resúmenes cortos o extracción de información con datasets específicos.
- Experimentación con tokenizadores: el ByteLevel BPE propio de 49.152 entradas y su pipeline de entrenamiento permiten estudiar el impacto del tokenizador en modelos pequeños sin depender de vocabularios ajenos.
- Generación de texto de relleno o completado en contextos de 1.024 tokens: adecuado para prototipos de autocompletado y pruebas de integración en pipelines de `transformers`.
- Validación de infraestructura de inferencia: su tamaño permite desplegarlo en CPU y en GPUs de consumo para probar servidores, cuantizaciones posteriores y herramientas de evaluación antes de escalar a modelos mayores.
- Docencia y divulgación: modelo pequeño, con arquitectura y datos documentados, útil para explicar el funcionamiento de un transformer causal y el ciclo completo de preentrenamiento.
- Baseline en experimentos comparativos: sirve como referencia de perplejidad (26,25 en validación) para comparar recetas de entrenamiento con el mismo corpus.

## Benchmarks y rendimiento

| Checkpoint | Perdida validacion completa | PPL validacion completa | Perdida test | PPL test |
|---|---:|---:|---:|---:|
| Foundation continued 20K | 3,2685 | 26,27 | 3,2498 | 25,78 |
| Foundation continued 30K | 3,2677 | 26,25 | 3,2489 | 25,76 |

| Version de pesos | Perdida validacion rapida (256 bloques) | PPL validacion rapida |
|---|---:|---:|
| FP32 origen | 3,236623 | 25,4476 |
| Exportacion BF16 | 3,236627 | 25,4477 |

La mejora del checkpoint de 30K sobre el de 20K es de aproximadamente 0,0008 en pérdida de validación completa; el autor la describe como una mejora medida pequeña, no como un salto cualitativo de capacidades. La comparación FP32 frente a BF16 es una comprobación de paridad sobre un subconjunto rápido (diferencia de +0,000004 en pérdida), no una validación completa. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: aproximadamente 0,12 GB solo para pesos (61,36M parámetros × 2 bytes), más caché KV y activaciones; el uso real es de unos pocos cientos de MB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs con 4 GB o menos.
- Ejecución viable en CPU para prototipos y pruebas, dado el reducido número de parámetros y el contexto de 1.024 tokens.
- Despliegue mediante `transformers` con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la ausencia de pesos GGUF publicados limita el uso directo en llama.cpp/Ollama sin conversión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- El repositorio ocupa 0,2 GB, por lo que la descarga y el almacenamiento son triviales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---:|---|---|---|
| NeoLM-Small-Base | 61,36M | 1.024 | no disponible | safetensors BF16, código custom | Base en inglés, tokenizador propio, PPL validación 26,25 |
| GPT-2 small | 124M | 1.024 | MIT (pesos publicados por OpenAI) | safetensors/PyTorch | Base en inglés, ampliamente soportado por el ecosistema |
| Pythia-70M | 70M | 2.048 | Apache 2.0 | safetensors | Base multilingüe parcial, con checkpoints intermedios publicados |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | safetensors, GGUF | Base mayor, con versiones chat; requiere más recursos |

La comparación se basa en características públicas de estos modelos; no se dispone de resultados de benchmarks comunes que permitan comparar rendimiento de forma directa con NeoLM-Small-Base.

## Limitaciones y advertencias
- Modelo base sin ajuste por instrucciones: no debe usarse como asistente conversacional sin fine-tuning previo.
- Contexto limitado a 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo inglés; no se documenta soporte de otros idiomas.
- Riesgo elevado de alucinación y de generar contenido factualmente incorrecto, propio de un modelo de 61M de parámetros entrenado con aproximadamente 1.147 millones de tokens.
- Sesgos potenciales heredados del corpus ClimbMix filtrado en inglés; no se documenta ninguna mitigación.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución; conviene contactar con el autor antes de usarlo en producción.
- Requiere `trust_remote_code=True` por la implementación custom, lo que implica ejecutar código del repositorio; hay que revisarlo antes de habilitarlo.
- Sin BOS token y con EOS ID 0 y PAD ID 1; hay que ajustar los pipelines que asuman convenciones distintas.
- El calendario de entrenamiento original no se completó y la mejora del checkpoint de 30K sobre el de 20K es marginal; no debe interpretarse como un salto de capacidades.
- No se han publicado benchmarks estándar ni evaluaciones de seguridad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/MaagDeveloper/NeoLM-Small-Base
- Dataset NeoCorpus: https://huggingface.co/datasets/MaagDeveloper/NeoCorpus
- Dataset Karpathy ClimbMix Shuffle: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Dataset NVIDIA Nemotron-ClimbMix: https://huggingface.co/datasets/nvidia/Nemotron-ClimbMix
