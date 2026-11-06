# Draymondo/Qwen2.5-3B

## Resumen
Qwen2.5-3B es un modelo de lenguaje causal de tipo decoder-only desarrollado por el equipo Qwen de Alibaba, publicado en septiembre de 2024 como parte de la familia Qwen2.5. Esta ficha corresponde a la reproducción alojada por el usuario Draymondo en Hugging Face (`Draymondo/Qwen2.5-3B`), que redistribuye los pesos base originales de Qwen sin modificaciones aparentes. El modelo resuelve tareas de generación de texto y sirve como base para post-entrenamiento (SFT, RLHF o preentrenamiento continuado), no como modelo conversacional listo para usar.

Con 3.085.938.688 parámetros totales (2,77B no pertenecientes a embeddings) y una ventana de contexto de 32.768 tokens, se posiciona como una opción compacta para experimentación e inferencia en hardware de gama media. Incorpora mejoras sobre Qwen2 en conocimiento, código, matemáticas, seguimiento de instrucciones y generación de JSON, además de soporte declarado para más de 29 idiomas, aunque la model card del repositorio solo lista inglés.

Su relevancia actual radica en que ofrece un punto de partida ligero y abierto (bajo licencia Qwen Research) para ajuste fino y despliegue en entornos con recursos limitados, con una arquitectura transformer estándar compatible con el ecosistema `transformers`, vLLM y llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con RoPE, SwiGLU, RMSNorm, atención GQA con sesgo QKV y embeddings atados |
| Parametros totales | 3.085.938.688 (3,09B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (la familia Qwen2.5 soporta hasta 128K en otros tamaños; este repo declara 32.768) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors sin cuantizar) |
| Idiomas soportados | La model card declara más de 29 idiomas (chino, inglés, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, vietnamita, tailandés, árabe, etc.); los tags del repo solo listan `en` |
| Licencia | `qwen-research` (licencia de investigación, uso comercial restringido) |
| Formato de pesos | safetensors |
| Capas | 36 |
| Cabezas de atencion | 16 para Q y 2 para KV (GQA) |
| Parametros no-embedding | 2,77B |
| Etapa de entrenamiento | Preentrenamiento (modelo base) |
| Tamano del repo | 6,2 GB |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura transformer causal estándar con 36 capas, normalización RMSNorm, activación SwiGLU, codificación posicional rotatoria (RoPE), atención con query-key-value bias y embeddings de entrada/salida atados (tied word embeddings). La atención usa Grouped Query Attention con 16 cabezas de query y 2 de key/value, lo que reduce el coste de memoria del KV cache durante la inferencia respecto a atención multi-cabeza completa.

Según la model card, Qwen2.5 se entrenó con modelos expertos especializados en código y matemáticas que contribuyeron a mejorar esas capacidades, e incorpora mejoras en seguimiento de instrucciones, generación de textos largos (más de 8K tokens), comprensión de datos estructurados (tablas) y generación de JSON. No se detallan en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; esta versión es únicamente el checkpoint base tras preentrenamiento. No se mencionan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Generación de texto autoregresiva y continuación de contexto (modelo base, no afinado para diálogo).
- Razonamiento y conocimiento general mejorados respecto a Qwen2, según la model card.
- Capacidades de código y matemáticas reforzadas mediante modelos expertos durante el entrenamiento.
- Generación de textos largos (más de 8K tokens) y salidas estructuradas, especialmente JSON.
- Comprensión de datos estructurados como tablas.
- Seguimiento de instrucciones y robustez ante diversidad de system prompts (en la familia Qwen2.5; en el base esto se explota tras SFT).
- Soporte multilingüe declarado para más de 29 idiomas en la familia.
- No incluye tool calling, function calling, modo thinking, visión ni audio de forma nativa en este checkpoint base.
- No está recomendado para uso conversacional directo sin post-entrenamiento.

## Casos de uso
- Punto de partida para ajuste fino supervisado (SFT): al ser un modelo base de 3B, se puede adaptar con datasets propios de dominio (legal, médico, atención al cliente) en una sola GPU consumer, partiendo de pesos ya preentrenados.
- Preentrenamiento continuado en dominios específicos: útil para especializar el modelo en jerga técnica o corpus internos con un coste computacional moderado gracias a sus 3,09B de parámetros.
- Generación de código en pipelines de desarrollo: las mejoras declaradas en código permiten usarlo como base para asistentes de autocompletado o generación de tests tras un ajuste específico.
- Generación de JSON y salidas estructuradas: adecuado para tareas de extracción de información y formateo de datos, aprovechando la mejora declarada en generación de estructuras.
- Procesamiento de documentos largos: con 32.768 tokens de contexto puede resumir o extraer información de contratos, informes o artículos extensos sin truncar.
- Experimentación e investigación en entornos académicos: su licencia `qwen-research` y su tamaño compacto lo hacen idóneo para estudiar dinámicas de entrenamiento, evaluar técnicas de alineamiento o reproducir experimentos.
- Prototipado de chatbots multilingües: tras SFT, puede servir para asistentes en varios idiomas con despliegue en hardware modesto.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen2.5 para los resultados detallados de evaluación, pero no incluye cifras concretas para este checkpoint de 3B en el material proporcionado.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 8-10 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 3,5-4 GB; en 4 bits, aproximadamente 2-2,5 GB (estimaciones orientativas, no confirmadas en la información disponible).
- GPU recomendadas: A100, H100 o L40S para producción con throughput alto; RTX 4090, RTX 3090 o RTX 4080 para desarrollo.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más en FP16, y en 4-6 GB con cuantización de 4 bits.
- Opciones de despliegue: `transformers` (versión 4.37.0 o superior, obligatorio para evitar el error `KeyError: 'qwen2'`), vLLM, llama.cpp, Ollama y TGI.
- Latencia y throughput: no disponibles en la información proporcionada; la model card remite a la página de benchmarks de velocidad de la documentación de Qwen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-3B (este repo) | 3,09B | 32.768 | qwen-research | Hugging Face (repo de terceros) | Modelo base, sin benchmarks publicados en esta ficha |
| Qwen2.5-3B (oficial) | 3,09B | 32.768 | qwen-research | Hugging Face (Qwen) | Repo original con documentación y variante instruct |
| Llama 3.2 3B | 3,2B aprox. | 128K | Llama 3.2 Community License | Hugging Face (Meta) | Modelo base e instruct, contexto mayor |
| Phi-3-mini | 3,8B | 4K-128K (según variante) | MIT | Hugging Face (Microsoft) | Licencia permisiva, orientado a razonamiento |

Los datos de Llama 3.2 3B y Phi-3-mini se incluyen como referencia de categoría; no se dispone de comparaciones de rendimiento directas en la información proporcionada.

## Limitaciones y advertencias
- Es un modelo base: no está afinado para conversación y puede producir respuestas incoherentes o poco alineadas en diálogo sin post-entrenamiento.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para este checkpoint.
- Sesgos conocidos: no documentados en la información disponible; se recomienda auditoría propia antes de uso en producción.
- Limitaciones de idioma: aunque la familia declara más de 29 idiomas, los tags del repo solo listan inglés, lo que sugiere que el soporte multilingüe puede ser desigual en este tamaño.
- Restricciones de licencia: la licencia `qwen-research` limita el uso comercial; es necesario revisar los términos en el enlace oficial antes de desplegar en producción.
- Repositorio de terceros: al estar alojado por el usuario Draymondo y no por Qwen, no hay garantía de integridad, mantenimiento ni actualizaciones; conviene verificar los pesos frente al repo oficial.
- Requiere `transformers>=4.37.0`; versiones anteriores fallan con `KeyError: 'qwen2'`.
- Sin datos de benchmarks ni de throughput publicados en esta ficha, la evaluación de rendimiento en producción debe realizarse de forma empírica.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Draymondo/Qwen2.5-3B
- Repo oficial Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen2.5-3B/blob/main/LICENSE
- Blog Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- GitHub Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación Qwen: https://qwen.readthedocs.io/en/latest/
- Benchmarks de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper Qwen2: https://arxiv.org/abs/2407.10671
