# SirSahOl/OLMo-2-0425-1B-chat-mlx-16bit

## Resumen

El modelo `SirSahOl/OLMo-2-0425-1B-chat-mlx-16bit` es una conversión a 16 bits (bfloat16 sin cuantizar) del modelo base `allenai/OLMo-2-0425-1B` de AI2, realizada por el usuario SirSahOl y empaquetada en el formato nativo de MLX de Apple. No es un entrenamiento nuevo ni un fine-tuning: se trata de una conversión de pesos y tokenizador para que el modelo pueda ejecutarse sobre la GPU unificada de los chips de la serie M mediante la librería `mlx-lm`. El objetivo es ofrecer inferencia local en Apple Silicon sin depender de CUDA ni de servicios en la nube.

Con 1.484.916.736 parámetros reales (etiquetado comercialmente como "1B"), 4.096 tokens de contexto y una huella de memoria activa declarada de aproximadamente 2,6-2,8 GB, el modelo está pensado para equipos con 8 GB o más de memoria unificada. La licencia Apache 2.0 y el origen totalmente abierto de la familia OLMo 2 lo hacen apto para uso comercial y para investigación reproducible, algo poco habitual en modelos de este segmento.

Su relevancia actual es doble: por un lado, cubre el nicho de asistentes conversacionales ligeros y completamente locales en macOS; por otro, al derivar de OLMo 2 (modelo con datos, código de entrenamiento y checkpoints publicados), sirve como referencia para estudiar el comportamiento de un transformer pequeño en tareas de chat, generación de texto y evaluación offline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Olmo2ForCausalLM (transformer decoder-only, familia OLMo 2) |
| Parametros totales | 1.484.916.736 (~1,48 B; la model card indica "1.0B") |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (segun model card) |
| Tipos de cuantizacion | 16 bits sin cuantizar (bfloat16, media de 16,00 bits por peso); el mismo autor publica variantes de 4 y 8 bits |
| Idiomas soportados | ingles (segun el tag `en` del repositorio); no hay lista oficial de idiomas en la informacion disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX, biblioteca `mlx`) |
| Tamano del repositorio | 5,9 GB (el README declara ~2,8 GB en disco; discrepancia no aclarada) |
| Huella de VRAM activa | ~2,6 GB (minimo recomendado: 8 GB de memoria unificada) |
| Modelo base | allenai/OLMo-2-0425-1B |
| Version de mlx-lm usada en la conversion | 0.31.3 |
| Tokenizador / plantilla | ChatML: `<\|im_start\|>`, `<\|im_end\|>`, `<\|endoftext\|>` |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura declarada es `Olmo2ForCausalLM`, es decir, un transformer decoder-only de la familia OLMo 2 de AI2, con atención causal estándar y sin mezcla de expertos (modelo denso). La model card no aporta detalles sobre el entrenamiento del modelo original: no se especifica el número de tokens vistos, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documenta ninguna innovación de decodificación (decodificación especulativa, atención lineal, SSM híbrido) en esta conversión.

El trabajo técnico de este repositorio es la conversión de pesos al formato MLX con `mlx-lm` 0.31.3, manteniendo precisión bfloat16 sin cuantización posterior, más la publicación de la plantilla de chat y de la configuración de tokens de parada. El proceso de conversión requiere una GPU o Mac con memoria suficiente para materializar los pesos en 16 bits (aproximadamente 2,8 GB). Cualquier información adicional sobre el preentrenamiento debe consultarse en la documentación del modelo base y en el paper de OLMo 2 referenciado en los tags (`arxiv:2501.00656`), no incluidos en la información proporcionada.

## Capacidades

- Generación de texto en ingles: completado de prompts, redacción breve, resúmenes y reformulación.
- Conversación multi-turno mediante la plantilla ChatML incluida (roles `system`, `user`, `assistant`).
- Razonamiento básico y respuesta a preguntas sencillas, limitado por el tamaño de 1,48 B de parámetros.
- Generación de código de complejidad baja a media (fragmentos, funciones cortas, explicaciones de código).
- Aritmética y matemáticas elementales, sin cadena de pensamiento extendida documentada.
- Uso mediante CLI (`mlx_lm.chat`, `mlx_lm.generate`) y API de Python (`mlx_lm.load`, `mlx_lm.generate`).
- Integración con runtimes locales: LM Studio y Ollama (el README incluye un `Modelfile` de ejemplo con temperatura 0,7 y tokens de parada).
- Capacidades multilingües: no confirmadas; el repositorio solo declara ingles.
- Tool calling / function calling: no documentado en la información disponible.
- Modo "thinking", visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Asistente conversacional 100 % local en portátiles Apple Silicon: con ~2,6 GB de memoria activa, cabe en un Mac con 8 GB de memoria unificada y permite un asistente de escritura sin conexión, útil cuando la privacidad impide enviar datos a APIs externas.
- Autocompletado y explicación de código dentro del IDE: el modelo puede generar fragmentos cortos y comentarios en ingles mientras se ejecuta en paralelo al editor, con 4.096 tokens de contexto suficientes para un archivo pequeño y su prompt de sistema.
- Generación de texto por lotes en estaciones de trabajo M-Ultra: el README proyecta hasta ~240 tokens/s en M1/M2/M3 Ultra, lo que permite procesar grandes volúmenes de prompts cortos para etiquetado, resumen o reformulación de textos.
- Prototipado de pipelines conversacionales antes de migrar a modelos mayores: sirve para validar plantillas de prompt, gestión de historial y tokens de parada sin coste de API, ya que el formato ChatML es el mismo que usan muchos modelos grandes.
- Investigación en reproducibilidad y evaluación de modelos abiertos: al derivar de la familia OLMo, permite experimentar con conversiones de precisión (4, 8 y 16 bits) y medir el impacto de la cuantización en la calidad de salida sobre el mismo checkpoint.
- Aplicaciones educativas y demos offline en ferias o entornos sin red: un binario local con MLX puede desplegarse en un Mac y generar explicaciones cortas en ingles sin depender de infraestructura cloud.
- Generación de datos sintéticos a pequeña escala: puede producir variaciones de un enunciado o plantillas de texto para aumentar datasets, siempre con revisión humana por el riesgo de alucinación de un modelo de este tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de calidad, y tampoco se aportan comparaciones numéricas con modelos de tamaño similar. Los únicos datos cuantitativos del repositorio son proyecciones de velocidad de decodificación y de tiempo hasta el primer token (TTFT), recogidos en la sección de requisitos de hardware.

## Requisitos de hardware

- Memoria activa: ~2,6-2,8 GB para los pesos en 16 bits, más el espacio de caché KV según la longitud del contexto (hasta 4.096 tokens).
- Mínimo recomendado por el autor: 8 GB de memoria unificada (chips M1/M2/M3/M4 base).
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No hay soporte CUDA documentado para este repositorio; en GPUs NVIDIA haría falta una conversión a otro formato.
- Rendimiento estimado según el README (proyecciones basadas en ancho de banda de memoria, no medidas verificadas):
  - Base (8 GB): ~80 tokens/s, TTFT ~31 ms.
  - Pro (18-36 GB): ~120 tokens/s, TTFT ~21 ms.
  - Max (36-128 GB): ~172 tokens/s, TTFT ~13 ms.
  - Ultra (64-192 GB): ~240 tokens/s, TTFT ~9 ms.
- Despliegue: `mlx-lm` (CLI y API de Python), LM Studio y Ollama mediante `Modelfile`. vLLM y TGI no son compatibles con pesos MLX; requerirían una conversión previa.
- Variantes de memoria reducida publicadas por el mismo autor: 4 bits (~0,9 GB) y 8 bits (~1,5 GB), útiles en equipos de 8-16 GB.

## Comparativa con modelos similares

La información proporcionada no incluye datos de modelos comparables ni métricas de rendimiento de terceros, por lo que no es posible establecer una comparación cuantitativa fiable. A continuación se recoge únicamente lo que puede afirmarse a partir de la ficha del propio modelo y de las alternativas habituales del mismo segmento; los datos de los competidores no proceden de la fuente consultada.

| Modelo | Parametros | Contexto | Licencia | Estado en la informacion disponible |
|---|---|---|---|---|
| OLMo-2-0425-1B-chat-mlx-16bit (este) | ~1,48 B | 4.096 tokens | Apache 2.0 | Datos completos; sin benchmarks |
| allenai/OLMo-2-0425-1B (modelo base) | ~1,48 B | no disponible en la fuente | Apache 2.0 (segun el repositorio derivado) | Modelo de origen de la conversion |
| Otras alternativas de ~1-2 B (Qwen2.5-1.5B-Instruct, Llama 3.2 1B Instruct, SmolLM2-1.7B-Instruct) | no disponible | no disponible | no disponible | No se aportan datos de comparacion en la informacion proporcionada |

## Limitaciones y advertencias

- Ambigüedad en la denominación: el repositorio se llama `-chat` y la model card describe una plantilla de chat ChatML, pero el campo `base_model` apunta a `allenai/OLMo-2-0425-1B`, el checkpoint base y no la variante Instruct (`OLMo-2-0425-1B-Instruct`). Conviene verificar contra qué pesos exactos se generó la conversión antes de usarla en producción.
- Capacidad limitada: 1,48 B de parámetros implican razonamiento frágil, errores frecuentes en matemáticas multi-paso y baja fiabilidad en tareas de código no triviales.
- Riesgo elevado de alucinación: al no disponer de benchmarks publicados, no hay evidencia de tasas de veracidad; se recomienda validación humana en cualquier flujo que genere contenido factual.
- Idioma: solo se declara ingles. El rendimiento en castellano u otros idiomas no está documentado y previsiblemente será pobre.
- Contexto corto: 4.096 tokens limitan los casos de uso con documentos largos o conversaciones extensas; no hay información sobre extrapolación de contexto.
- Dependencia de plataforma: los pesos MLX solo funcionan en Apple Silicon; en Linux con GPU NVIDIA será necesario reconvertir el modelo a GGUF o safetensors estándar.
- Discrepancia de tamaños: el repositorio ocupa 5,9 GB frente a los ~2,8 GB declarados en el README, lo que puede deberse a ficheros auxiliares o al historial de versiones; conviene revisar el contenido antes de desplegarlo en disco reducido.
- Sin datos de seguridad: no se documentan evaluaciones de sesgo, toxicidad ni alineación, ni filtros de contenido.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia; no impone restricciones adicionales, pero tampoco ofrece garantías.
- Ajustes recomendados por el autor: definir los tokens de parada `<|im_start|>`, `<|im_end|>` y `<|endoftext|>` en el runtime para evitar bucles de generación; temperatura sugerida de 0,7.

## Enlaces

- Repositorio del modelo: https://huggingface.co/SirSahOl/OLMo-2-0425-1B-chat-mlx-16bit
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B
- Variante 4 bits: https://huggingface.co/SirSahOl/OLMo-2-0425-1B-chat-mlx-4bit
- Variante 8 bits: https://huggingface.co/SirSahOl/OLMo-2-0425-1B-chat-mlx-8bit
- Perfil del autor de la conversión: https://huggingface.co/SirSahOl
- Librería MLX (Apple): https://github.com/ml-explore/mlx
- Paper de referencia citado en los tags: https://arxiv.org/abs/2501.00656
