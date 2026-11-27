# DesignXHub/Sumerian-v2

## Resumen

Sumerian-v2 es un modelo de lenguaje causal de 3.085.938.688 parámetros desarrollado por Ammar AlRubayie bajo la organización DesignXHub. Se trata de un ajuste fino (finetune) del modelo Qwen/Qwen2.5-3B-Instruct, orientado a la conversación y al seguimiento de instrucciones en entornos bilingües árabe-inglés. El modelo se carga como un `Qwen2ForCausalLM` estándar de la librería Transformers, sin necesidad de código personalizado, lo que facilita su integración en pipelines existentes.

La relevancia de este modelo radica en su enfoque en el árabe como idioma principal de interacción, un ámbito donde los modelos abiertos de tamaño medio (3B) con soporte nativo de calidad siguen siendo escasos. Mantiene la longitud de contexto de 32.768 tokens heredada de Qwen2.5, así como su tokenizador con un vocabulario de 151.936 entradas, lo que permite manejar conversaciones multi-turno y documentos extensos.

No obstante, conviene subrayar que el autor declara explícitamente que el modelo no ha sido evaluado en benchmarks públicos estándar y que su licencia, derivada de la Qwen Research License, restringe el uso a investigación no comercial. Esto lo posiciona como una herramienta de experimentación más que como una solución lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen2ForCausalLM) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; no se documentan variantes GGUF/AWQ/GPTQ en la informacion proporcionada) |
| Idiomas soportados | Arabe (ar) e ingles (en) |
| Licencia | Qwen Research License (qwen-research), uso no comercial |
| Formato de pesos | safetensors |
| Hidden size | 2048 |
| Capas | 36 |
| Cabezas de atencion | 16 (2 KV) |
| Vocabulario | 151.936 |
| Precision de pesos | BF16 |
| Tamano del repositorio | 6,2 GB |

## Arquitectura y entrenamiento

Sumerian-v2 emplea la arquitectura Qwen2, un transformer decoder-only con atención de múltiples cabezas y cabezas KV agrupadas (GQA), con 16 cabezas de consulta y 2 cabezas de clave/valor. El modelo cuenta con 36 capas, un tamaño oculto de 2048 y un vocabulario de 151.936 tokens, estructura idéntica a la del modelo base Qwen2.5-3B-Instruct del que deriva. La atención usa RoPE (rotary positional embeddings), lo que permite extender el contexto hasta 32.768 tokens.

El modelo se ha obtenido mediante ajuste fino supervisado sobre Qwen2.5-3B-Instruct, aunque la información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO adicionales. El autor no documenta innovaciones técnicas propias más allá del ajuste fino bilingüe. La plantilla de chat sigue el formato ChatML (`<|im_start|>` / `<|im_end|>`), aplicable automáticamente mediante `apply_chat_template`. Los parámetros de generación recomendados son temperature 0.7, top_p 0.8, top_k 20 y repetition_penalty 1.05.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones en árabe e inglés.
- Conversación multi-turno gracias a la ventana de contexto de 32.768 tokens.
- Soporte de plantilla de chat ChatML aplicada automáticamente.
- Capacidad de respuesta a preguntas sobre identidad y origen del modelo (el ejemplo de la model card pregunta "من صنعك؟", es decir, "¿quién te creó?").
- Generación con parámetros de muestreo configurables (temperature, top_p, top_k, repetition_penalty).
- No se documenta soporte explícito de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.
- Capacidades matemáticas y de razonamiento multi-paso declaradas como más débiles que la conversación general por el propio autor.

## Casos de uso

- Asistentes conversacionales en árabe: el modelo puede gestionar diálogos multi-turno en árabe dialectal o estándar gracias a su ventana de 32.768 tokens y a su ajuste específico en este idioma, cubriendo escenarios de atención al usuario en mercados de habla árabe.
- Investigación académica en PLN árabe: sirve como base para experimentos de evaluación, análisis de sesgos o comparación de técnicas de ajuste fino en un modelo de 3B parámetros con licencia de investigación.
- Prototipado rápido de chatbots bilingües: al cargarse como `Qwen2ForCausalLM` estándar, se integra directamente en scripts de Transformers sin código adicional, lo que acelera la validación de ideas.
- Traducción asistida árabe-inglés en contextos de investigación: el modelo puede emplearse para generar borradores de traducción o reformulaciones en ambos idiomas, siempre dentro de un marco no comercial.
- Generación de contenido educativo en árabe: redacción de explicaciones, resúmenes o materiales didácticos en árabe para proyectos de investigación educativa.
- Experimentación con plantillas ChatML: útil para estudiar el comportamiento de modelos ajustados sobre Qwen2.5 en tareas de formato estructurado y seguimiento de instrucciones.
- Análisis de conversaciones largas: la ventana de 32.768 tokens permite procesar transcripciones extensas o documentos multilingües en tareas de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente en la model card que el modelo "no ha sido evaluado en benchmarks públicos estándar" y que el razonamiento matemático y multi-paso es más débil que la conversación general.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 6,2 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 8-10 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 3,5-4 GB de pesos, con margen adicional para caché KV.
- VRAM estimada en cuantización de 4 bits: alrededor de 2-2,5 GB de pesos, aunque no se documentan variantes GGUF/AWQ/GPTQ oficiales en la información disponible.
- GPU recomendadas: A100, H100 o L40S para inferencia en BF16 con contexto largo; RTX 4090 (24 GB) para BF16 con contexto completo; RTX 3090 (24 GB) también viable.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) e incluso en GPUs de 8 GB si se aplica cuantización, aunque esta última opción no está documentada oficialmente.
- Opciones de despliegue: Transformers (con `device_map="auto"`), text-generation-inference (TGI, etiqueta `text-generation-inference` presente en el repositorio), endpoints compatibles. No se documenta soporte oficial de llama.cpp, Ollama ni vLLM en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Sumerian-v2 | 3,09B | 32.768 | ar, en | Qwen Research (no comercial) | safetensors |
| Qwen2.5-3B-Instruct (base) | 3,09B | 32.768 | multilingue (incluye ar, en) | Qwen Research | safetensors |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | multilingue | Apache 2.0 (variante) | safetensors |
| Llama-3.2-3B-Instruct | 3,21B | 131.072 | multilingue (8 idiomas oficiales) | Llama 3.2 Community License | safetensors |

La comparación se limita a parámetros, contexto, idiomas y licencia, ya que no hay datos de rendimiento publicados para Sumerian-v2. Frente a su modelo base, Sumerian-v2 no aporta cambios arquitectónicos ni de contexto, sino un ajuste fino orientado al árabe. Frente a Llama-3.2-3B-Instruct, Sumerian-v2 ofrece menor contexto (32.768 frente a 131.072) y una licencia más restrictiva, pero un enfoque explícito en árabe que el modelo de Meta no declara como prioritario.

## Limitaciones y advertencias

- Razonamiento matemático y multi-paso más débil que la conversación general, según declara el propio autor.
- Sin evaluación en benchmarks públicos estándar: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Licencia Qwen Research: restricción a uso no comercial; cualquier despliegue en producción comercial requiere revisión legal y probablemente autorización del titular de la licencia.
- Idiomas limitados a árabe e inglés; no se garantiza calidad en otros idiomas pese a heredar el tokenizador multilingüe de Qwen2.5.
- Riesgo de alucinación inherente a modelos de 3B parámetros, agravado por la ausencia de evaluaciones de fidelidad.
- Sesgos potenciales no documentados: el autor no publica análisis de sesgos de género, religiosos o políticos, relevantes en el contexto árabe.
- Sin soporte documentado de tool calling, agentes o modo de razonamiento extendido, lo que limita su uso en pipelines agénticos.
- Repositorio con solo 10 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido, lo que implica escasa retroalimentación de la comunidad.
- Fecha de creación registrada como 2026-04-10 y actualización 2026-11-27: verificar la vigencia y posibles revisiones del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DesignXHub/Sumerian-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Organización DesignXHub: https://huggingface.co/DesignXHub
