# FreedomIntelligence/HuatuoGPT-Vision-2-8B

## Resumen

HuatuoGPT-Vision-2-8B es un modelo de lenguaje y visión (vision-language) especializado en el dominio médico, desarrollado por FreedomIntelligence (grupo de investigación de la Universidad China de Hong Kong, Shenzhen). Se construye mediante fine-tuning sobre Qwen3-VL-8B-Instruct y conserva su arquitectura, tokenizer y plantilla de chat, lo que permite utilizarlo con cualquier framework que soporte la familia Qwen3-VL.

El modelo sigue una receta de dos etapas: un preentrenamiento multimodal médico a gran escala sobre PubMedVision-Plus (pares imagen-caption extraídos de PubMed) para inyectar conocimiento visual médico, seguido de un entrenamiento con aprendizaje por refuerzo sobre PubMedVision-RL, con recompensas verificables para preguntas de opción múltiple y recompensas por rúbrica generadas por HuatuoGPT-Vision-2-Grader para preguntas abiertas.

Es relevante porque aplica RL sobre un VLM médico open source con licencia Apache 2.0, algo poco habitual en este nicho, y porque mantiene el tamaño de 8B parámetros (8.767 millones según safetensors), lo que lo hace desplegable en hardware modesto. A diferencia de la variante de 27B, esta versión no incorpora modo de razonamiento (thinking); responde directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language (Qwen3-VL) |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configurado en los ejemplos de vLLM y SGLang) |
| Tipos de cuantizacion | BF16 en los pesos originales; no se documentan otras cuantizaciones oficiales |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, ~18 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-VL-8B-Instruct: un transformer multimodal que procesa imágenes y texto conjuntamente mediante un proyector visual y el decoder del LLM base. No se trata de un modelo MoE ni de una arquitectura híbrida SSM; es un transformer denso de aproximadamente 8.700 millones de parámetros. El repositorio ocupa 17,5 GB y los pesos se almacenan en BF16 (unos 18 GB según la model card).

El entrenamiento consta de dos fases. La primera es un preentrenamiento multimodal médico sobre PubMedVision-Plus, un conjunto a gran escala de pares imagen-caption procedentes de PubMed, orientado a inyectar conocimiento visual biomédico. La segunda es una fase de aprendizaje por refuerzo sobre PubMedVision-RL, con dos tipos de recompensa: verificación automática para preguntas de opción múltiple y recompensas por rúbrica proporcionadas por el modelo HuatuoGPT-Vision-2-Grader para preguntas de respuesta abierta. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas como DPO. Tampoco se documentan innovaciones de decodificación especulativa ni atención lineal específicas de este fine-tuning.

## Capacidades

- Comprensión de imágenes médicas y texto asociado: interpretación de radiografías, tomografías y otras modalidades de imagen clínica junto con preguntas en lenguaje natural.
- Generación de texto descriptivo y respuestas conversacionales multi-turno sobre contenido visual médico.
- Respuesta a preguntas de opción múltiple en contexto clínico (capacidad reforzada explícitamente durante el entrenamiento con RL).
- Respuesta a preguntas abiertas con evaluación por rúbrica (capacidad reforzada mediante HuatuoGPT-Vision-2-Grader).
- Procesamiento de imágenes locales, URLs o imágenes PIL a través del processor de Transformers.
- Compatibilidad con tool calling y function calling heredada del modelo base Qwen3-VL-8B-Instruct (no verificada de forma independiente en la información disponible).
- Capacidades multilingües: no disponibles en la información proporcionada.
- No dispone de modo thinking; responde directamente, a diferencia de la variante de 27B.
- Compatible con endpoints estilo OpenAI mediante vLLM o SGLang.

## Casos de uso

- Investigación en visión médica: evaluación de la capacidad de un VLM para describir hallazgos en radiografías de tórax o TC, usando el modelo como sujeto de estudio en experimentos académicos sobre razonamiento visual clínico.
- Generación de descripciones de imágenes biomédicas a escala: procesamiento por lotes de pares imagen-caption de PubMed para construir o ampliar datasets de investigación, aprovechando la familiaridad del modelo con literatura biomédica.
- Anotación asistida de datasets médicos: el modelo puede proponer descripciones iniciales de imágenes que investigadores humanos revisan y corrigen, acelerando el etiquetado de corpus visuales.
- Evaluación comparativa de VLMs médicos: servir como referencia open source en benchmarks de VQA médica, comparando su rendimiento con otros modelos de la serie HuatuoGPT o con VLMs generalistas.
- Desarrollo de asistentes educativos en medicina: prototipos de tutoría que explican hallazgos en imágenes clínicas a estudiantes, siempre con revisión humana y sin uso diagnóstico.
- Investigación en RL para dominios especializados: estudiar el efecto de recompensas verificables y recompensas por rúbrica en la adaptación de VLMs a un dominio concreto, reutilizando la receta de dos etapas.
- Despliegue en entornos de investigación con recursos limitados: al ser un modelo de 8B en BF16, puede servirse con vLLM o SGLang en una GPU de 24-48 GB, facilitando experimentos sin infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contextos moderados y 40-48 GB para contextos largos (hasta 32.768 tokens).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para producción; RTX 4090 (24 GB) puede ser suficiente en BF16 con contextos cortos o mediante cuantización a 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con limitaciones de longitud de contexto; en GPUs de 16 GB requeriría cuantización adicional no documentada oficialmente.
- Opciones de despliegue: Transformers (>=4.57.0) con `AutoModelForImageTextToText`, vLLM (`vllm serve ... --max-model-len 32768`), SGLang (`--context-length 32768`), y servidores compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Thinking | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HuatuoGPT-Vision-2-8B | 8,77 B | 32.768 | No | Apache 2.0 | Hugging Face |
| HuatuoGPT-Vision-2-27B | no disponible | no disponible | Sí (on/off) | no disponible | Hugging Face |
| Qwen3-VL-8B-Instruct (base) | ~8 B | no disponible | No | no disponible | Hugging Face |
| HuatuoGPT-Vision-2-Grader | ~8 B | no disponible | No | no disponible | Hugging Face |

La comparación con otros VLMs médicos de la misma categoría (por ejemplo, LLaVA-Med u otros modelos biomédicos) no está disponible en la información proporcionada. Los datos de rendimiento comparativo tampoco se han publicado.

## Limitaciones y advertencias

- Uso exclusivamente académico y de investigación según el descargo del autor: no debe emplearse para diagnóstico, tratamiento, triaje ni ninguna decisión clínica.
- Riesgo elevado de alucinación: el propio autor advierte que el modelo puede producir hallazgos incorrectos o fabricados, algo especialmente crítico en contexto médico.
- Sesgos potenciales derivados del corpus PubMed: la distribución de imágenes y textos biomédicos puede sobrerrepresentar ciertas modalidades, poblaciones o patologías.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe más allá del inglés presente en PubMed.
- Longitud de contexto limitada a 32.768 tokens en la configuración de servicio recomendada; no se documenta soporte para contextos mayores.
- Licencia Apache 2.0 permite uso comercial según los términos de la licencia, pero el descargo del autor restringe explícitamente el uso clínico.
- No dispone de modo thinking, lo que puede limitar el razonamiento complejo en comparación con la variante de 27B.
- Requiere `transformers>=4.57.0`; versiones anteriores no son compatibles.
- No se han publicado benchmarks que permitan verificar empíricamente su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FreedomIntelligence/HuatuoGPT-Vision-2-8B
- Repositorio GitHub: https://github.com/FreedomIntelligence/HuatuoGPT-Vision-2
- Paper (OpenReview): https://openreview.net/pdf?id=0BXKsjKlFJ
- Dataset PubMedVision-Plus: https://huggingface.co/datasets/FreedomIntelligence/PubMedVision-Plus
- Dataset PubMedVision-RL: https://huggingface.co/datasets/FreedomIntelligence/PubMedVision-RL
- Modelo grader: https://huggingface.co/FreedomIntelligence/HuatuoGPT-Vision-2-Grader
- Variante 27B: https://huggingface.co/FreedomIntelligence/HuatuoGPT-Vision-2-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Serie HuatuoGPT: https://github.com/FreedomIntelligence/HuatuoGPT
- HuatuoGPT-II: https://github.com/FreedomIntelligence/HuatuoGPT-II
- HuatuoGPT-Vision: https://github.com/FreedomIntelligence/HuatuoGPT-Vision
- HuatuoGPT-o1: https://github.com/FreedomIntelligence/HuatuoGPT-o1
- HuatuoGPT-3: https://github.com/FreedomIntelligence/HuatuoGPT-3
