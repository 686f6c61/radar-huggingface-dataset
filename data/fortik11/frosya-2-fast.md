# fortik11/Frosya-2-Fast

## Resumen

Frosya-2-Fast (también denominado LGTT-Mini 40M) es un modelo de lenguaje de muy pequeño tamaño desarrollado por el autor independiente Fortaki (DTF), presentado como la segunda generación de su línea de IA local. Frente a la primera generación, que según el autor empleaba una arquitectura densa tradicional, esta versión adopta una arquitectura Mixture of Experts (MoE) con 4 expertos y activación top-2 por token, junto con componentes propios de transformers modernos como RoPE y SwiGLU. El modelo declara aproximadamente 40 millones de parámetros activos y una ventana de contexto de 2.048 tokens.

El objetivo declarado es ofrecer generación de código, razonamiento lógico y diálogo en hardware de cliente muy limitado, reduciendo drásticamente el vocabulario (de 50.000 a 8.229 tokens) para concentrar la capacidad del modelo en sintaxis y morfología frecuentes. El repositorio ocupa únicamente 0,2 GB y los pesos se distribuyen en un checkpoint binario de PyTorch convertible a `.pkl`, lo que sitúa al modelo en la categoría de experimentos educativos o de investigación más que en la de modelos listos para producción.

La relevancia de esta ficha es principalmente documental: se trata de un lanzamiento con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados y con información técnica que proviene exclusivamente de la model card del autor. Cualquier evaluación de rendimiento debe tomarse, por tanto, con cautela y verificarse de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LGTT Mixture of Experts (MoE) + SwiGLU + RoPE |
| Parámetros totales | no disponible (el autor indica ~40 millones de parámetros activos) |
| Parámetros activos | ~40 millones (top-2 de 4 expertos por token) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | ruso e inglés (tokenizer optimizado para el equilibrio ruso/inglés); no se detalla cobertura oficial |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | checkpoint binario de PyTorch (`micro_lgtt_40m.bin`, convertible a `.pkl`); tokenizer en JSON |

Otros datos técnicos declarados por el autor: 8 capas, 8 cabezas de atención, dimensión oculta `embed_dim = 256`, 4 expertos con `top_k = 2`, vocabulario de 8.229 tokens mediante BPE comprimido y un dataset de entrenamiento de 650 MB de texto filtrado.

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE de tipo LGTT con 8 capas y dimensión oculta de 256. Cada token se enruta hacia 2 de los 4 expertos disponibles, lo que según el autor imita el comportamiento de modelos mucho mayores manteniendo una huella de memoria muy reducida. Incorpora Rotary Position Embeddings (RoPE) para el modelado posicional, lo que habilita la ventana declarada de 2.048 tokens, y activaciones SwiGLU en las capas feed-forward. El motor de inferencia se describe como basado en NumPy (`LGTT_mini.py`), lo que condiciona el rendimiento en producción.

El entrenamiento se realizó sobre 650 MB de texto "altamente limpiado y filtrado", con un tokenizer BPE personalizado de 8.229 tokens diseñado para equilibrar ruso e inglés. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal; las mejoras declaradas se limitan al soporte nativo de contexto de 2.048 tokens, la optimización del vocabulario y la ejecución MoE dispersa.

## Capacidades

- Generación de texto en ruso e inglés, con tokenizer específicamente equilibrado entre ambos idiomas.
- Generación de código, especialmente sintaxis de Python, según los ejemplos de la model card.
- Razonamiento lógico y matemático básico, favorecido por la ventana de 2.048 tokens para descripciones largas de problemas.
- Diálogo multi-turno local con prompts de sistema que se adaptan por palabras clave.
- Procesamiento de prompts largos (hasta 2.048 tokens) con retención de coherencia declarada por el autor.
- Heurísticas de decodificación integradas: penalización de repetición dinámica, top-k sampling = 6 y temperatura = 0,2.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente de código local para fragmentos pequeños: el modelo puede generar funciones cortas de Python en entornos sin GPU, gracias a sus ~40 M de parámetros activos y su checkpoint de 0,2 GB, aunque la calidad está limitada por el tamaño.
- Prototipado educativo de arquitecturas MoE: sirve para estudiar enroutamiento top-2 sobre 4 expertos, RoPE y SwiGLU en un modelo que cabe en memoria de cualquier portátil.
- Pruebas de tokenizers bilingües ruso/inglés: su vocabulario comprimido de 8.229 tokens permite experimentar con densidad de datos y cobertura morfológica en ambos idiomas.
- Generación de texto de relleno o borradores en ruso: para tareas de baja criticidad donde no se requiere precisión factual y se acepta revisión humana posterior.
- Evaluación de pipelines de inferencia en NumPy: útil para comparar latencia y consumo de memoria frente a implementaciones en PyTorch o llama.cpp en entornos embebidos.
- Docencia y demostraciones de decodificación con heurísticas: la configuración de top-k = 6 y temperatura = 0,2 permite ilustrar el efecto de los parámetros de muestreo en modelos pequeños.
- Experimentos de ajuste fino con recursos mínimos: el tamaño reducido permite entrenar variantes en una sola GPU de consumo, siempre que se respete la licencia CC BY-SA 4.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estandarizada, y tampoco se ofrecen comparaciones cuantitativas con la primera generación más allá de afirmaciones cualitativas ("dramáticamente mejor en sintaxis de programación, matemáticas y diálogo natural").

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con ~40 M de parámetros activos y pesos en precisión completa (fp32), el checkpoint rondaría los 160 MB, por debajo de 1 GB de VRAM en cualquier configuración razonable. No se dispone de cifras oficiales de cuantización.
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada; el modelo está pensado para ejecutarse en CPU o en GPUs de gama baja.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales e incluso en iGPU y entornos Colab gratuitos.
- Opciones de despliegue: el autor proporciona un CLI propio (`chat.py`) para Google Colab o local, con motor NumPy (`LGTT_mini.py`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos binario propio dificulta su integración directa en esos ecosistemas.
- Latencia y throughput: no disponibles. El uso de NumPy como motor de ejecución sugiere un throughput inferior al de implementaciones optimizadas en PyTorch o CUDA, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Frosya-2-Fast (LGTT-Mini 40M) | ~40 M activos (MoE, 4 expertos, top-2) | 2.048 | CC BY-SA 4.0 | Hugging Face, 0 descargas | Motor NumPy propio, sin benchmarks |
| TinyLlama 1.1B | 1.100 M | 2.048 | Apache 2.0 | Amplia, ecosistema estándar | Transformer denso, formato safetensors/GGUF |
| SmolLM-135M | 135 M | 2.048 | Apache 2.0 | Amplia, integrado en transformers | Transformer denso, benchmarks publicados |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache 2.0 | Amplia, múltiples cuantizaciones | Transformer denso, soporte multilingüe amplio |

La comparación es aproximada: Frosya-2-Fast es uno o dos órdenes de magnitud menor que las alternativas citadas y carece de evaluaciones publicadas, por lo que no puede equipararse en rendimiento sin verificación independiente. La ventaja diferencial es su huella mínima y su naturaleza experimental; la desventaja es la ausencia de ecosistema, benchmarks y formatos estándar.

## Limitaciones y advertencias

- Con ~40 M de parámetros activos, la capacidad de razonamiento, conocimiento factual y calidad de código es intrínsecamente limitada; es probable que falle en tareas que requieran conocimiento del mundo.
- Riesgo elevado de alucinación: no se documenta ningún proceso de alineación (RLHF, DPO) ni evaluación de veracidad.
- Cobertura de idiomas restringida en la práctica a ruso e inglés; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Ventana de contexto de solo 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- Formato de pesos no estándar (`.bin` propio convertible a `.pkl`) y motor NumPy: dificulta el despliegue en infraestructuras habituales y la integración con herramientas como vLLM o llama.cpp.
- Sin descargas ni validación comunitaria: no hay evidencia independiente de que las afirmaciones de la model card se cumplan.
- Sin datos de sesgos, seguridad ni filtrado de contenido; no recomendable para aplicaciones de cara al usuario sin capas adicionales de moderación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fortik11/Frosya-2-Fast
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados al modelo.
