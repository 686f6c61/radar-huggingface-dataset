# Raghav-Singhal/1pp-0.5b-raw-sft

## Resumen

El modelo `1pp-0.5b-raw-sft` es un experimento de investigación del proyecto One Persona Pretraining (1PP) del EPFL DLAB, desarrollado por Raghav-Singhal. Forma parte de un estudio 3×3 que combina tres tamaños (0.5B, 1B y 1.7B) con tres condiciones de pretraining sobre el mismo corpus de 47,8 millones de documentos. Esta variante concreta fue preentrenada con los documentos originales sin reescribir (condición *raw*) y posteriormente ajustada mediante supervisión fina (SFT) sobre 400.000 conversaciones.

Con 580 millones de parámetros y una arquitectura tipo Llama de 24 capas, el modelo alcanza una longitud de contexto de 4.096 tokens. Su relevancia radica en que permite aislar el efecto de la condición de pretraining sobre el comportamiento final del modelo, ya que todas las ejecuciones del estudio comparten la misma secuencia de lotes y solo difieren en el texto de los documentos y la máscara de pérdida. No es un asistente generalista, sino un artefacto de investigación para estudiar cómo el formato de los datos de pretraining influye en las capacidades conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style decoder (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 heads de atención, 3 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no compartidos, sin biases, sin QK-norm) |
| Parametros totales | 580.445.568 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue un diseño decoder-only tipo Llama con 24 capas, dimensión oculta de 1.152, FFN de 4.608 con activación SwiGLU, 9 cabezas de atención y 3 cabezas KV (head dim 128). Usa RMSNorm, RoPE con base 10.000, embeddings no compartidos y sin sesgos. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más el token especial `<|pad|>`, y `<|endoftext|>` marca el final de documento.

El pretraining se realizó sobre los documentos originales de DCLM-edu (condición *raw*), con pérdida sobre todos los tokens del documento y el token de fin. Se procesaron 47,8 millones de documentos (66,2 mil millones de tokens) en 31.777 pasos con batch global de 512×4.096 tokens, enmascaramiento de atención entre documentos y empaquetado best-fit. El optimizador fue Muon (con Adam para embeddings y normas), con warmup de 2.000 pasos, tasa constante y decaimiento lineal en el último 10% hasta 1/100, weight decay 0,1 y precisión bf16.

El SFT consistió en una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multi-turno con citas constitucionales), `dlab-spp/sp-sft-normal-300k` (271,6k tras eliminar duplicados) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usó el mismo stack de entrenamiento (Megatron, Muon, ChatML sin turno de sistema) con pérdida solo en los turnos del asistente. La tasa de aprendizaje matricial fue 0,002, seleccionada por pérdida en datos retenidos, con batch global de 128×4.096 y decaimiento lineal a 1/10 tras un warmup del 3%.

## Capacidades

- Generación de texto conversacional en inglés siguiendo el formato ChatML sin turno de sistema.
- Mantenimiento de diálogos multi-turno gracias a su ventana de contexto de 4.096 tokens.
- Capacidad limitada de razonamiento y generación de código, acorde a su tamaño de 0,58B parámetros.
- No soporta tool calling, ni funciones, ni capacidades multimodales.
- No dispone de modo de pensamiento explícito ni de razonamiento multi-paso avanzado.
- Su comportamiento está condicionado por el SFT sobre conversaciones con citas constitucionales y datos de seguridad, lo que puede influir en el tono y las respuestas.

## Casos de uso

- Investigación académica sobre one-persona pretraining: permite comparar el efecto de la condición *raw* frente a las condiciones reescritas en el mismo tamaño de modelo, usando las pérdidas de validación y las respuestas generadas como métricas.
- Análisis de la influencia del formato de datos en el comportamiento conversacional: los investigadores pueden estudiar cómo la pérdida en turnos de usuario o asistente afecta a la calidad de las respuestas.
- Experimentos de fine-tuning adicional: al ser un modelo pequeño y con licencia Apache 2.0, sirve como base para probar técnicas de SFT, RLHF o DPO con costes computacionales reducidos.
- Evaluación de la escalabilidad de metodologías de pretraining: al comparar con las versiones de 1B y 1.7B del mismo estudio, se puede medir cómo cambian las capacidades con el tamaño.
- Entornos educativos: útil para demostrar conceptos de entrenamiento de LLMs, empaquetado de secuencias, máscaras de pérdida y ajuste fino en cursos de aprendizaje automático.
- Prototipado rápido de chatbots simples en inglés: aunque no es un asistente general, puede servir para pruebas de concepto donde se requiera un modelo ligero y desplegable en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta las siguientes pérdidas de validación por token sobre 2.433 documentos retenidos (checkpoint final de pretraining):

| Texto de asistente | Texto de usuario | Texto de documento |
|---|---|---|
| 2.711 | 2.744 | 2.533 |

Y la pérdida de validación SFT (tokens de asistente, 1.998 conversaciones retenidas) fue de 2.102. La verificación de pesos entre HuggingFace y el checkpoint de Megatron mostró una diferencia absoluta de 0,0001 en la pérdida de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en fp32 y 0,6 GB en bf16, por lo que cabe en cualquier GPU consumer con 4 GB o más de VRAM.
- GPUs recomendadas: NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, RTX 4090, o cualquier GPU con al menos 4 GB de memoria.
- Es desplegable en CPU con cuantización (aunque no se especifican cuantizaciones oficiales, se puede convertir a GGUF con herramientas como llama.cpp).
- Opciones de despliegue: transformers, vLLM, TGI, llama.cpp, Ollama (tras conversión a GGUF).
- Latencia y throughput estimados: no disponibles en la información proporcionada, pero al ser un modelo de 0,58B, la inferencia es muy rápida incluso en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos en la documentación proporcionada. El modelo comparte tokenizador con SmolLM2-0.5B, pero no se han publicado comparativas de rendimiento con otros modelos de tamaño similar. Se puede considerar como referencia dentro del propio estudio 1PP, donde las variantes de 1B y 1.7B ofrecen puntos de comparación en cuanto a escala, pero no se han facilitado datos de rendimiento en tareas estándar.

## Limitaciones y advertencias

- Modelo de solo 0,58B parámetros, con capacidades limitadas de razonamiento complejo, matemáticas avanzadas y generación de código robusta.
- Entrenado exclusivamente en inglés; no soporta otros idiomas.
- No es un asistente generalista: fue diseñado como artefacto de investigación y puede producir respuestas incoherentes o alucinadas fuera de su dominio de entrenamiento.
- No se entrenó con turno de sistema en el formato ChatML, por lo que no responde correctamente a instrucciones que requieran ese contexto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está optimizado para producción y puede requerir fine-tuning adicional.
- No se han evaluado sesgos ni riesgos de seguridad más allá de la inclusión de un subconjunto de datos de seguridad en el SFT.
- La ventana de contexto de 4.096 tokens puede ser insuficiente para tareas que requieran contexto muy largo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.5b-raw-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training y https://wandb.ai/raghav_singhal/1pp-sft
