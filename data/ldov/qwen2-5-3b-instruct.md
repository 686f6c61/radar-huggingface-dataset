# ldov/Qwen2.5-3B-Instruct

## Resumen

Qwen2.5-3B-Instruct es un modelo de lenguaje de 3.090 millones de parámetros (3.397.103.616 en total según los pesos safetensors) desarrollado por el equipo Qwen de Alibaba Cloud. Forma parte de la serie Qwen2.5, que abarca modelos desde 0.5 hasta 72 mil millones de parámetros, con mejoras significativas en conocimiento, codificación, matemáticas, seguimiento de instrucciones y generación de texto largo. Este repositorio concreto, mantenido por el usuario `ldov`, ofrece el modelo en formato GGUF cuantizado, lo que permite su ejecución eficiente en hardware de consumo.

El modelo está diseñado para tareas de generación de texto con instrucciones, destacando en razonamiento, código y salidas estructuradas como JSON. Su arquitectura transformer con atención de consultas agrupadas (GQA) y una ventana de contexto de 32.768 tokens lo hace adecuado para aplicaciones que requieren procesar documentos extensos o mantener conversaciones de múltiples turnos. La disponibilidad de múltiples cuantizaciones (desde q2_K hasta q8_0) facilita su despliegue en entornos con recursos limitados, aunque la licencia `qwen-research` restringe su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, atención QKV bias y word embeddings atados |
| Parametros totales | 3.397.103.616 (3.09B según la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (generación máxima de 8.192 tokens) |
| Tipos de cuantizacion | q2_K, q3_K_M, q4_0, q4_K_M, q5_0, q5_K_M, q6_K, q8_0 |
| Idiomas soportados | Inglés (declarado en el repo); el modelo base soporta más de 29 idiomas |
| Licencia | qwen-research (licencia de investigación, no comercial) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con 36 capas, atención de consultas agrupadas (GQA) con 16 cabezas de consulta y 2 cabezas de clave/valor, y embeddings de palabras atados. Utiliza posicionamiento rotativo (RoPE), activación SwiGLU y normalización RMSNorm. El entrenamiento consta de dos fases: preentrenamiento en un corpus masivo y posterior ajuste con instrucciones (post-training) para mejorar el seguimiento de órdenes, la generación de texto largo y la salida de datos estructurados. No se proporcionan detalles específicos sobre el número de tokens de entrenamiento ni la composición del dataset en la información disponible, aunque el blog oficial de Qwen2.5 indica mejoras en codificación y matemáticas gracias a modelos expertos especializados en estos dominios.

## Capacidades

- Generación de texto coherente y contextualizado en inglés, con soporte multilingüe extendido en el modelo base.
- Razonamiento y resolución de problemas matemáticos de nivel moderado.
- Generación de código en múltiples lenguajes de programación, con capacidad para completar y depurar fragmentos.
- Seguimiento de instrucciones complejas, incluyendo instrucciones de sistema variadas para role-play y configuración de chatbots.
- Generación de texto largo (hasta 8.192 tokens de salida) y comprensión de documentos extensos gracias a la ventana de 32.768 tokens.
- Comprensión de datos estructurados como tablas y generación de salidas JSON válidas.
- Soporte de tool calling y function calling, aunque no se detalla en la model card, es una capacidad típica de la serie Qwen2.5.

## Casos de uso

- Asistentes conversacionales: el modelo puede mantener diálogos multi-turno con contexto amplio, adecuado para chatbots de atención al cliente o asistentes personales en entornos de investigación o desarrollo.
- Generación de código en entornos de desarrollo: gracias a su capacidad de codificación y seguimiento de instrucciones, puede integrarse en pipelines de CI/CD para autocompletar código, generar documentación técnica o crear tests unitarios.
- Procesamiento de datos estructurados: su habilidad para entender tablas y generar JSON lo hace útil para extracción de información de documentos, transformación de datos y generación de esquemas.
- Prototipado rápido de aplicaciones NLP: al ser un modelo compacto en GGUF, puede desplegarse en máquinas con pocos recursos para experimentar con generación de texto, resúmenes o clasificación.
- Educación y tutoría: puede responder preguntas de matemáticas y ciencias, explicar conceptos y generar ejercicios prácticos en entornos académicos no comerciales.
- Análisis de sentimiento y moderación de contenido: su capacidad de seguir instrucciones y comprender contexto permite clasificar textos y detectar contenido inapropiado en foros o redes sociales, siempre bajo licencia de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al blog oficial de Qwen2.5 para evaluaciones detalladas y a la documentación para comparativas de cuantización y velocidad. No se proporcionan cifras concretas de MMLU, HumanEval u otros en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización q4_K_M, el modelo requiere aproximadamente 2-3 GB de VRAM; con q8_0, unos 3-4 GB. Estas cifras son estimaciones basadas en el tamaño del modelo y pueden variar según la implementación.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) puede ejecutar las cuantizaciones más bajas. Para mayor velocidad, se recomienda una RTX 3090 o superior.
- Compatibilidad con GPU de consumo: sí, el formato GGUF está diseñado para ejecutarse en hardware modesto mediante llama.cpp o sus derivados.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no se proporcionan datos específicos en la información disponible; la documentación de Qwen incluye benchmarks de velocidad en su sitio web.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct (GGUF) | 3.09B | 32.768 | qwen-research (no comercial) | GGUF | Fuerte en código y matemáticas, multilingüe |
| Llama 3.2 3B Instruct | 3.21B | 128K | Llama 3.2 Community License (comercial) | GGUF, safetensors | Buen rendimiento general, contexto más largo |
| Phi-3-mini (3.8B) | 3.8B | 128K | MIT | GGUF, safetensors | Optimizado para razonamiento, licencia permisiva |
| Gemma 2 2B | 2.6B | 8K | Gemma Terms of Use (comercial) | GGUF, safetensors | Ligero, orientado a eficiencia |

Nota: los datos de comparación provienen del conocimiento general y no de benchmarks específicos en la información proporcionada. La licencia de Qwen2.5 es restrictiva para uso comercial, a diferencia de las alternativas.

## Limitaciones y advertencias

- Licencia `qwen-research`: restringe el uso a fines de investigación y no permite aplicaciones comerciales sin autorización expresa de Alibaba Cloud.
- Sesgos y alucinaciones: como todo modelo de lenguaje, puede generar contenido falso o sesgado, especialmente en temas delicados; no se han documentado evaluaciones específicas en este repositorio.
- Idioma: aunque el modelo base soporta múltiples idiomas, la model card solo declara inglés; el rendimiento en otros idiomas puede ser inferior.
- Contexto limitado: aunque la ventana es de 32.768 tokens, la generación máxima es de 8.192 tokens, lo que puede ser insuficiente para tareas que requieran salidas muy largas.
- Riesgo de inyección de prompts: al ser un modelo instruct-tuned, es susceptible a ataques de prompt injection si se usa en aplicaciones que procesan entradas de usuarios no confiables.
- Sin soporte de visión ni audio: el modelo es exclusivamente de texto; no procesa imágenes ni sonido.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/ldov/Qwen2.5-3B-Instruct
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Blog oficial de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de Qwen (llama.cpp, benchmarks): https://qwen.readthedocs.io/en/latest/
- Paper técnico de Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
