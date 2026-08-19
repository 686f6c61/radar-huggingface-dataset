# Qwen/Qwen3.5-35B-A3B

## Resumen

Qwen3.5-35B-A3B es un modelo de lenguaje multimodal (texto e imagen) desarrollado por el equipo Qwen de Alibaba, publicado en febrero de 2026. Se trata de la variante post-entrenada (chat/instrucciones) del modelo base Qwen/Qwen3.5-35B-A3B-Base, y representa la apuesta de Qwen por una arquitectura híbrida eficiente que combina Gated Delta Networks con un Mixture-of-Experts disperso, logrando 35 mil millones de parámetros totales pero activando solo 3 mil millones por token. Esta combinación permite un rendimiento comparable a modelos densos mucho mayores con un coste de inferencia significativamente reducido.

El modelo destaca por su fusión temprana de tokens multimodales (visión y lenguaje) durante el entrenamiento, lo que le permite superar a los modelos Qwen3-VL en razonamiento, código, agentes y comprensión visual, según los datos publicados por el autor. Soporta una ventana de contexto nativa de 262 144 tokens, extensible hasta aproximadamente 1 010 000 tokens, y cubre 201 idiomas y dialectos. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para despliegues en producción.

La relevancia actual de Qwen3.5-35B-A3B radica en su equilibrio entre capacidad y eficiencia: con solo 3B parámetros activos, ofrece una latencia y un coste de inferencia propios de un modelo pequeño, pero con capacidades de razonamiento y conocimiento que rivalizan con modelos de 100B+ parámetros, como reflejan sus resultados en MMLU-Pro (86.1). Además, su soporte nativo de visión y su arquitectura híbrida lo posicionan como una alternativa viable a modelos propietarios como GPT-5-mini en escenarios donde el coste y la soberanía de datos son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida: Gated Delta Networks + Gated Attention + Mixture-of-Experts (MoE) |
| Parametros totales | 35 951 822 704 (35B) |
| Parametros activos | 3B (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta ~1 010 000 tokens |
| Tipos de cuantizacion | No especificado oficialmente; compatible con cuantizacion estandar de Transformers (por ejemplo, bitsandbytes, GPTQ, AWQ) y GGUF via llama.cpp |
| Idiomas soportados | 201 idiomas y dialectos (segun el autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

Qwen3.5-35B-A3B emplea una arquitectura híbrida que combina dos mecanismos de atención: Gated Delta Networks (atención lineal con estado recurrente) y Gated Attention (atención completa con cabezas Q/KV reducidas). La configuración de capas sigue un patrón de 10 bloques repetidos, donde cada bloque contiene 3 subcapas de Gated DeltaNet seguidas de 1 subcapa de Gated Attention, y cada subcapa va acompañada de su propio MoE. Este diseño busca capturar dependencias de largo alcance con la atención completa de forma esporádica, mientras que la atención lineal maneja la mayor parte del procesamiento, reduciendo el coste computacional por token.

El MoE cuenta con 256 expertos, de los cuales se activan 8 enrutados más 1 compartido por token. Cada experto tiene una dimensión intermedia de 512, lo que mantiene la huella de memoria de los pesos activos en solo 3B parámetros. El modelo también incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación y la calidad de las predicciones.

El entrenamiento se realizó en dos etapas: pre-entrenamiento y post-entrenamiento. En la etapa de post-entrenamiento, el equipo aplicó Reinforcement Learning (RL) escalado a entornos con millones de agentes y distribuciones de tareas progresivamente más complejas, una técnica que el autor denomina "Scalable RL Generalization". Además, se utilizó fusión temprana de tokens multimodales (imagen y texto) durante el pre-entrenamiento, logrando una eficiencia de entrenamiento multimodal cercana al 100% comparada con el entrenamiento solo de texto. No se han publicado detalles específicos sobre el volumen de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto y razonamiento complejo: soporta tareas de conocimiento, matemáticas, lógica y razonamiento multi-paso con un rendimiento en MMLU-Pro de 86.1.
- Comprensión y generación multimodal: procesa imágenes junto con texto, permitiendo descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Generación de código: el autor indica que supera a Qwen3-VL en benchmarks de código, aunque no se proporcionan cifras concretas en la información disponible.
- Tool calling / function calling: compatible con el ecosistema Qwen y la API de Alibaba Cloud Model Studio; la versión alojada (Qwen3.5-Flash) incluye herramientas integradas oficiales.
- Capacidades de agente y razonamiento multi-paso: entrenado con RL en entornos multi-agente, lo que sugiere robustez en tareas de planificación y ejecución de acciones.
- Soporte multilingüe: cobertura de 201 idiomas y dialectos, con comprensión de matices culturales y regionales.
- Ventana de contexto larga: 262 144 tokens nativos, ampliable hasta ~1M, adecuado para documentos extensos, análisis de código fuente grande o conversaciones de muchos turnos.
- Multi-Token Prediction (MTP): mejora la velocidad de decodificación y la coherencia en generaciones largas.

## Casos de uso

- Atención al cliente automatizada: con su ventana de contexto de 262K tokens y soporte multilingüe, puede gestionar conversaciones multi-turno con historial extenso, manteniendo el contexto de interacciones previas durante horas. Su bajo coste por token (solo 3B activos) permite desplegarlo en entornos de alto volumen sin disparar los costes de inferencia.
- Asistente de programación integrado en IDE: el modelo puede completar código, explicar fragmentos, generar tests y refactorizar, aprovechando su capacidad de razonamiento y su entrenamiento en código. Su soporte de tool calling permite conectarlo a APIs de repositorios, linters o sistemas de CI/CD.
- Análisis de documentos largos (legales, financieros, técnicos): la ventana de 262K tokens permite procesar contratos completos, informes anuales o manuales técnicos en una sola pasada, extrayendo cláusulas, resumiendo secciones y respondiendo preguntas específicas sobre el contenido.
- Sistemas RAG (Retrieval-Augmented Generation) de bajo coste: al ser un MoE con 3B activos, puede servir como generador en pipelines RAG donde se necesita alta calidad de razonamiento sobre documentos recuperados, pero con latencia y coste reducidos frente a modelos densos de 30B+.
- Agentes autónomos y automatización de tareas: su entrenamiento con RL multi-agente y su soporte de function calling lo hacen adecuado para orquestar flujos de trabajo complejos, como la gestión de correos, la programación de citas o la integración con herramientas externas mediante APIs.
- Análisis de imágenes y documentos escaneados: al ser multimodal, puede extraer información de capturas de pantalla, diagramas, gráficos o formularios escaneados, combinando el texto visible con el contexto visual para tareas como la verificación de facturas o la interpretación de figuras técnicas.
- Traducción y localización: con 201 idiomas soportados, puede servir como motor de traducción automática con conciencia cultural, adecuado para plataformas de contenido global o servicios de atención al cliente multilingüe.

## Benchmarks y rendimiento

Los únicos datos de benchmark publicados en la información disponible corresponden a la sección Knowledge de la tabla del autor, que incluye MMLU-Pro. No se han proporcionado resultados para otras categorías (razonamiento, código, matemáticas, agentes, visión) en la documentación accesible.

| Modelo | MMLU-Pro |
|---|---|
| GPT-5-mini (2025-08-07) | 83.7 |
| GPT-OSS-120B | 80.8 |
| Qwen3-235B-A22B | 84.4 |
| Qwen3.5-122B-A10B | 86.7 |
| Qwen3.5-27B | 86.1 |
| **Qwen3.5-35B-A3B** | **86.1** |

El modelo iguala a Qwen3.5-27B (denso) y supera a GPT-5-mini y GPT-OSS-120B en conocimiento general, con una fracción de los parámetros activos. No se dispone de datos adicionales para otras métricas como HumanEval, GSM8K o benchmarks de visión.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo MoE con 35B parámetros totales, todos los pesos deben cargarse en memoria aunque solo se activen 3B por token. En FP16 se necesitan aproximadamente 70 GB de VRAM; en cuantización 8-bit (~35 GB) o 4-bit (~18 GB) se reduce significativamente.
- GPU recomendadas: A100 80GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) o RTX 6000 Ada (48 GB) con cuantización 4-bit u 8-bit; también es viable en GPUs de datacenter con memoria compartida (por ejemplo, 2x A10 24GB).
- En consumer GPU: sí, cabe en una RTX 4090 con cuantización 4-bit (GGUF o GPTQ), aunque con limitaciones de velocidad y sin capacidad para contexto máximo.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers. También se puede servir mediante llama.cpp/Ollama con pesos GGUF (si la comunidad los genera). La API gestionada de Alibaba Cloud Model Studio ofrece la versión Qwen3.5-Flash con 1M de contexto y herramientas integradas.
- Latencia y throughput: no se han publicado cifras oficiales. Dado que solo se activan 3B parámetros por token, el throughput esperado es similar al de un modelo denso de 3B, pero con la latencia de memoria de un modelo de 35B. En la práctica, con vLLM y batching, se pueden alcanzar cientos de tokens por segundo en GPUs de datacenter, aunque esto depende de la implementación de los kernels de Gated DeltaNet.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | MMLU-Pro | Licencia | Modalidad |
|---|---|---|---|---|---|---|
| Qwen3.5-35B-A3B | 35B | 3B | 262K (ext. ~1M) | 86.1 | Apache 2.0 | Texto + imagen |
| Qwen3.5-27B | 27B | 27B (denso) | no disponible | 86.1 | Apache 2.0 | Texto + imagen |
| Qwen3-235B-A22B | 235B | 22B | no disponible | 84.4 | Apache 2.0 | Texto |
| GPT-OSS-120B | 120B | no disponible | no disponible | 80.8 | Apache 2.0 | Texto |
| GPT-5-mini | no disponible | no disponible | no disponible | 83.7 | Propietaria | Texto |

Qwen3.5-35B-A3B ofrece el mismo rendimiento en MMLU-Pro que Qwen3.5-27B (denso) pero con 9 veces menos parámetros activos, lo que reduce el coste por token. Frente a Qwen3-235B-A22B, consigue una puntuación superior con una fracción de los parámetros totales. Comparado con GPT-5-mini, lo supera en conocimiento general con una licencia abierta y despliegue local.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de razonamiento factual o cuando se le pide información no presente en sus datos de entrenamiento. No se han publicado evaluaciones específicas de sesgos para este modelo.
- Limitaciones de contexto: aunque la ventana nativa es de 262K tokens, el rendimiento puede degradarse en contextos cercanos al máximo. La extensión hasta 1M tokens puede requerir técnicas de interpolación posicional que afecten a la calidad.
- Riesgo en producción: al ser un modelo relativamente reciente (febrero de 2026), su ecosistema de herramientas y kernels optimizados (especialmente para Gated DeltaNet) puede ser menos maduro que el de arquitecturas transformer clásicas. Se recomienda validar el rendimiento en el hardware objetivo antes de un despliegue masivo.
- Idiomas: aunque se declaran 201 idiomas, la calidad puede variar significativamente entre lenguas de alto y bajo recurso. No se han publicado métricas desglosadas por idioma.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero los pesos del modelo base (Qwen3.5-35B-A3B-Base) y los datos de entrenamiento no se distribuyen; el usuario debe verificar el cumplimiento de las condiciones de uso de Alibaba Cloud si utiliza la API gestionada.
- Dependencia de hardware: para explotar todo el potencial del MoE (bajo coste por token) se requiere una implementación eficiente de los kernels de enrutamiento y atención lineal. Sin estas optimizaciones, el modelo puede comportarse como un denso de 35B en términos de memoria y latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Demo en Qwen Chat: https://chat.qwen.ai
- API gestionada (Alibaba Cloud Model Studio): https://modelstudio.alibabacloud.com/
- Guía de usuario de la API: https://www.alibabacloud.com/help/en/model-studio/text-generation
