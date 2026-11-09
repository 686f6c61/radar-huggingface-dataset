# hanseungwook/fineweb-edu-llama-3b-from-nca-wd0p1

## Resumen

El modelo `fineweb-edu-llama-3b-from-nca-wd0p1` es un modelo de lenguaje causal base de 3.253 millones de parámetros publicado por el usuario hanseungwook en Hugging Face. Se trata del checkpoint final (paso 23.478) de un entrenamiento de preentrenamiento sobre aproximadamente 98.470 millones de tokens del dataset FineWeb-Edu, partiendo de una inicialización obtenida mediante un preentrenamiento previo con Neural Cellular Automata (NCA). No dispone de fine-tuning de instrucciones ni de chat: es un modelo base pensado para investigación sobre inicialización y dinámica de entrenamiento.

La relevancia del modelo es fundamentalmente metodológica: explora si una inicialización derivada de NCA (un paradigma de sistemas autoorganizados) puede servir como punto de partida para el preentrenamiento de un transformer de lenguaje, en lugar de la inicialización aleatoria convencional. La arquitectura es un transformer denso tipo Llama con 26 capas, dimensión oculta 3072, tamaño intermedio 8192, 32 cabezas de atención y 32 cabezas KV, vocabulario GPT-2 de 50.257 tokens y longitud de contexto de 2048 tokens. Los embeddings de entrada y la cabeza de salida están desacoplados (untied).

El modelo se distribuye en safetensors FP32 sin pérdida, fragmentados a 5 GB, con un tamaño de repositorio de 13 GB. No tiene descargas ni likes en el momento de la consulta, y la licencia no está especificada en la información disponible, lo que limita su uso comercial sin aclaración previa del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (causal LM) |
| Parámetros totales | 3.253.343.232 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible (pesos publicados en FP32 safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP32, sharded a 5 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con 26 capas, hidden size 3072, intermediate size 8192, 32 cabezas de atención y 32 cabezas KV, vocabulario GPT-2 de 50.257 tokens y contexto de 2048 tokens. Los embeddings de entrada y la proyección de salida están desacoplados. La inicialización proviene de un modelo pre-preentrenado exclusivamente con NCA (`ppt-3b-ckpt/nca/model_10.pth`, 5.000 pasos de optimizador). En la transición de NCA a texto, los embeddings de entrada se reinicializaron con media 0 y desviación estándar 1 usando los valores por defecto de `nn.Embedding` de PyTorch, y la proyección de salida usó la distribución uniforme por defecto de `nn.Linear` en aproximadamente [-0,01804, 0,01804]. El run utilizó la revisión `1df8d789b91f3fd3e105e1ba82cdb263dd9aaab0`, anterior al cambio de septiembre a inicialización normal con desviación 0,02.

El entrenamiento se realizó sobre aproximadamente 98.470 millones de tokens de FineWeb-Edu (seed 0), con learning rate 0,0001, weight decay 0,1, batch efectivo de 2048 y contexto de 2048. El checkpoint liberado corresponde al paso 23.478 (fichero `model_23478.pth`). La última pérdida de validación registrada es 2,5329091548919678 en el paso 23.000, que no es una medición separada para los pesos finales del paso 23.478. El autor indica explícitamente que no se ha establecido qué checkpoint exacto se usó en una revisión posterior del paper y que esta release no reclama identidad con la evaluación del paper. La exportación a Hugging Face preserva los tensores entrenados exactamente; `conversion_report.json` documenta comparaciones de logits a longitudes 8, 128 y 2048, igualdad exacta de tensores tras recarga y paridad del tokenizador GPT-2 frente a la codificación tiktoken original.

## Capacidades

- Generación de texto causal en inglés: continuación de secuencias, finalización de prompts y generación libre.
- Modelo base sin ajuste de instrucciones ni de chat: no sigue instrucciones de forma fiable ni mantiene diálogos multi-turno estructurados.
- Razonamiento y conocimiento general limitados por su tamaño (3,25 B) y por el dominio del corpus (FineWeb-Edu, contenido educativo filtrado).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (etiqueta `en`).
- Sin capacidades de visión, audio ni modo de pensamiento (thinking mode).
- Tokenizador GPT-2 con vocabulario de 50.257 tokens.

## Casos de uso

- Investigación sobre inicialización de transformers: el modelo sirve como artefacto reproducible para estudiar el efecto de una inicialización NCA frente a la inicialización aleatoria en el preentrenamiento de un LM de 3 B, comparando curvas de pérdida y comportamiento de representaciones.
- Reproducción de experimentos de preentrenamiento a escala media: con 98,47 B tokens y configuración documentada (LR, weight decay, batch, contexto), permite replicar el run y analizar la dinámica de entrenamiento en un presupuesto de cómputo moderado.
- Estudio de transferencia entre dominios: al partir de un preentrenamiento NCA y pasar a texto, es útil para analizar qué se transfiere y qué se reinicializa (embeddings de entrada y cabeza de salida) en la transición entre modalidades o paradigmas.
- Generación de texto educativo de dominio acotado: dado el corpus FineWeb-Edu, puede emplearse para continuar textos expositivos o divulgativos en inglés, siempre con revisión humana y sin expectativas de instrucción.
- Base para fine-tuning supervisado posterior: al ser un modelo base limpio, puede servir como punto de partida para SFT o DPO en tareas concretas, aunque su contexto de 2048 limita aplicaciones que requieran ventanas largas.
- Evaluación de tokenizadores y exportación: el `conversion_report.json` y la paridad con tiktoken lo hacen útil como caso de prueba para pipelines de conversión y verificación de pesos en formato safetensors.
- Docencia y experimentación con modelos pequeños: 3,25 B parámetros permite experimentar en una sola GPU de gama alta o en varias consumer, con fines formativos sobre preentrenamiento y evaluación de LMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la pérdida de validación de 2,5329091548919678 registrada en el paso 23.000, que no corresponde a los pesos finales del paso 23.478 y no es directamente comparable con métricas de benchmarks estándar (MMLU, HumanEval, GSM8K).

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 13 GB solo para pesos (3,25 B × 4 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda al menos 16-24 GB para contexto completo de 2048.
- VRAM estimada en FP16/BF16: alrededor de 6,5 GB para pesos; cuantización a 8 bits reduciría a unos 3,3 GB y a 4 bits a unos 1,7 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP32 con holgura; RTX 3090 (24 GB) también es viable.
- Cabe en GPU consumer de gama alta (RTX 4090, 3090) en FP32 con contexto moderado; en FP16/BF16 cabe en GPUs de 8-12 GB con contexto reducido.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatible; no se documenta soporte explícito de vLLM, llama.cpp u Ollama, y al no haber GGUF publicado requeriría conversión propia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| fineweb-edu-llama-3b-from-nca-wd0p1 | 3,25 B | 2048 | no disponible | safetensors FP32 | Base, inicialización NCA, solo inglés |
| Llama 3.2 3B (Meta) | 3,21 B | 128 K | Llama 3.2 Community License | safetensors, GGUF | Base e instruct, multilingüe, ampliamente soportado |
| Qwen2.5 3B (Alibaba) | 3,09 B | 32 K | Apache 2.0 (mayoría de variantes) | safetensors, GGUF | Base e instruct, multilingüe, tool calling en instruct |
| SmolLM2 1.7B (Hugging Face) | 1,71 B | 8 K | Apache 2.0 | safetensors, GGUF | Base e instruct, entrenado en FineWeb-Edu y otros corpus |

La comparación con Llama 3.2 3B, Qwen2.5 3B y SmolLM2 es orientativa: el modelo de hanseungwook no publica benchmarks ni licencia, y su contexto de 2048 es muy inferior al de las alternativas. Su interés es de investigación, no de producción.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no sigue instrucciones ni mantiene conversaciones de forma fiable; no debe desplegarse como asistente sin SFT previo.
- Licencia no disponible: no se puede asumir uso comercial; es necesario contactar con el autor antes de cualquier explotación.
- Solo inglés: no se documenta soporte multilingüe.
- Contexto corto (2048 tokens): insuficiente para tareas de contexto largo, RAG con documentos extensos o conversaciones multi-turno largas.
- Riesgo de alucinación inherente a un LM base de 3,25 B entrenado sobre corpus web filtrado; sin alineación ni filtros de seguridad documentados.
- Sesgos potenciales del corpus FineWeb-Edu (contenido educativo en inglés) que no han sido evaluados ni mitigados en la información disponible.
- Pérdida de validación de 2,53 en el paso 23.000: no hay medición publicada para los pesos finales, lo que dificulta evaluar la calidad exacta del checkpoint liberado.
- El autor advierte que no se ha establecido la identidad entre este checkpoint y el usado en una revisión posterior del paper; no debe citarse como resultado de paper sin verificación.
- Exportación en FP32: el repositorio de 13 GB es pesado para despliegues con requisitos de VRAM ajustados; no hay GGUF ni cuantizaciones oficiales.
- Sin datos de benchmarks: no es posible comparar su rendimiento con alternativas de forma cuantitativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hanseungwook/fineweb-edu-llama-3b-from-nca-wd0p1
- Run de Weights & Biases: https://wandb.ai/hanseungwook/fineweb-edu-98b-3b-pt/runs/x7wrziu2
- Perfil del autor en Hugging Face: https://huggingface.co/hanseungwook
