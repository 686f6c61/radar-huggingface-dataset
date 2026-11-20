# aaro765/BanBTP-comparison

## Resumen

BanBTP-comparison es un repositorio de Hugging Face publicado por el usuario aaro765 que reúne una familia de modelos de lenguaje conversacionales de desarrollo propio, denominada BanBTP, construida íntegramente sobre arquitecturas GPT-2 entrenadas desde cero. El repositorio actúa como tarjeta comparativa de las distintas versiones (V1 a V9), documentando parámetros, contexto, estado de calidad y notas del autor sobre cada una. No se trata de un modelo único, sino de un espacio de trabajo experimental que agrupa checkpoints de tamaños muy dispares, desde 19M hasta 783M de parámetros.

El problema que aborda es la exploración de los límites del entrenamiento de pequeños modelos conversacionales desde cero con recursos limitados, así como la experimentación con destilación de modelos mayores (Gemma 3 de 270M, GPT-2 large, TinyLlama 1.1B) para mejorar versiones pequeñas. La relevancia actual es limitada: se trata de un proyecto personal y experimental, sin benchmarks publicados ni uso en producción, pero resulta ilustrativo como caso de estudio de iteración rápida sobre arquitecturas GPT-2 y de las dificultades de obtener calidad conversacional con presupuestos de parámetros reducidos.

La información disponible no permite confirmar el estado del arte ni la calidad real de ninguno de los checkpoints. El autor describe explícitamente varios de ellos como «garbled», «repetitive» o «peor que V1», lo que sitúa a la familia en una fase de prototipado. La licencia Apache 2.0 permite reutilización, pero la ausencia de evaluación formal desaconseja su uso en entornos productivos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (from scratch) en todas las versiones; V2 basada en DialoGPT |
| Parametros totales | V1: 124M; V2: 783M; V3: 19M; V4: 41M; V5: 54M; V6: 54M; V7: 67M; V8: 110M; V9: no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | V1 y V2: 1024 tokens; V3 y V4: 128 tokens; V5 a V8: 256 tokens; V9: no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card no especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no se especifica en la información proporcionada) |

## Arquitectura y entrenamiento

Todas las versiones de la familia, salvo V2, emplean una arquitectura transformer decoder-only tipo GPT-2 implementada desde cero, con contextos que van de 128 a 1024 tokens según la versión. V2 se apoya en DialoGPT (783M), un derivado de GPT-2 entrenado para diálogo. No se documentan innovaciones técnicas como atención lineal, decodificación especulativa ni mezclas de expertos; el diseño es deliberadamente convencional y de pequeño tamaño.

El entrenamiento se realizó sobre el denominado «BanBTP dataset», descrito como datos de internet de origen no especificado. Las versiones V5 y V6 incorporan destilación: V5 se destila a partir de V1 a V4, Gemma 3 de 270M y GPT-2 large; V6 parte de V5 y se afina con BanBTP 124M (considerado por el autor el de mayor calidad), GPT-2 large, TinyLlama 1.1B y una versión actualizada del dataset. V7 se entrena sobre el «BanRAG dataset» con el objetivo de forzar razonamiento tipo RAG, aunque el propio autor reconoce que no logra hacer RAG correctamente. V8 se reconstruye como chatbot tras el fracaso de V7. No se especifican número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO; el autor menciona de forma coloquial «rlhfing all over the place» sin detallar el proceso.

## Capacidades

- Generación de texto conversacional en las versiones V1, V3, V5, V6 y V8, con calidad variable y no evaluada formalmente.
- Diálogo multi-turno limitado por contextos de 128 a 1024 tokens según la versión.
- Destilación de conocimiento de modelos mayores (Gemma 3 270M, GPT-2 large, TinyLlama 1.1B) en V5 y V6.
- Razonamiento orientado a RAG en V7, aunque el autor indica que no funciona correctamente.
- Tool calling: no soportado. El autor lo descartó explícitamente para V9.
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Multilingüismo: no documentado; no se especifican idiomas de entrenamiento.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Estudio académico de entrenamiento desde cero: la familia permite analizar la relación entre tamaño (19M a 783M) y calidad conversacional en arquitecturas GPT-2, útil en cursos o trabajos sobre scaling laws en modelos pequeños.
- Experimentación con destilación de modelos: V5 y V6 documentan la combinación de checkpoints propios con Gemma 3 270M, GPT-2 large y TinyLlama 1.1B, lo que sirve como referencia para pipelines de destilación de bajo coste.
- Prototipado de chatbots en entornos con restricciones extremas de cómputo: V3 (19M) o V5 (54M) pueden ejecutarse en CPU o GPUs integradas para pruebas de concepto de interfaces conversacionales, asumiendo calidad limitada.
- Investigación sobre fallos conversacionales: la documentación explícita de modos de fallo (repetición en V2, salidas corruptas en V4, RAG fallido en V7) es útil para estudiar patologías de modelos pequeños.
- Reproducción de experimentos de tokenización y contexto: la variación de contextos (128, 256, 1024) permite comparar el impacto de la ventana de contexto en la coherencia de diálogos cortos.
- Base para fine-tuning educativo: al estar bajo Apache 2.0 y con pesos presumiblemente pequeños, puede servir como punto de partida para ejercicios de ajuste supervisado en asignaturas de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: V3 (19M) por debajo de 1 GB en fp32; V5 y V6 (54M) en torno a 0,2-0,5 GB en fp16; V1 (124M) en torno a 0,5 GB en fp16; V8 (110M) similar a V1; V2 (783M) en torno a 1,5-3 GB en fp16.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobredimensionada para estos modelos; incluso GPUs integradas o CPU son suficientes para V3 a V8.
- Cabe en consumer GPU: sí, en todas las versiones, incluidas GPUs de gama baja y portátiles.
- Opciones de despliegue: llama.cpp, Ollama, transformers de Hugging Face; vLLM y TGI son técnicamente posibles pero innecesarios por el tamaño. No se especifica el formato de pesos, por lo que la compatibilidad con GGUF depende de conversión manual.
- Latencia y throughput estimados: no disponibles. Dado el tamaño, se espera latencia de milisegundos por token en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| BanBTP V1 | 124M | 1024 | Apache 2.0 | Conversacional | Calidad no evaluada |
| BanBTP V6 | 54M | 256 | Apache 2.0 | Experimental | Destilado de V5, GPT-2 large y TinyLlama |
| GPT-2 (OpenAI) | 124M | 1024 | MIT (pesos originales) | Referencia estable | Entrenado a gran escala, ampliamente evaluado |
| TinyLlama 1.1B | 1.1B | 2048 | Apache 2.0 | Producción ligera | Entrenado con 3T tokens, benchmarks públicos |
| Gemma 3 270M | 270M | no disponible | Términos Gemma | Producción ligera | Usado como fuente de destilación en V5 |

La comparación directa es desfavorable para BanBTP en términos de evaluación: GPT-2, TinyLlama y Gemma 3 cuentan con benchmarks públicos y procesos de entrenamiento documentados, mientras que la familia BanBTP carece de métricas y su propio autor reconoce fallos graves en varias versiones.

## Limitaciones y advertencias

- Calidad no evaluada: no existen benchmarks, evaluaciones humanas ni métricas automáticas publicadas.
- Fallos documentados por el autor: V2 es «peor que V1», V4 produce salidas «mayormente corruptas», V7 no logra RAG correctamente.
- Riesgo elevado de alucinación y repetición, especialmente en contextos de 128 tokens (V3, V4).
- Contexto muy limitado (128-1024 tokens), insuficiente para documentos largos o conversaciones extensas.
- Idiomas no especificados; probablemente entrenado solo con datos en inglés, sin garantías para castellano.
- Dataset de entrenamiento opaco («internet data»), con riesgos de sesgos, contenido tóxico y problemas de copyright no auditados.
- Licencia Apache 2.0 permite uso comercial, pero la falta de calidad y documentación desaconseja su uso en producción.
- Proyecto personal en evolución con cambios frecuentes de rumbo (V7 reescrito, V9 sin tool calling), lo que implica inestabilidad de los checkpoints.
- Formato de pesos no documentado, lo que puede complicar la integración con herramientas estándar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aaro765/BanBTP-comparison
