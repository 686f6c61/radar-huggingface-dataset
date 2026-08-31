# mradermacher/CyberGPT-GGUF

## Resumen

CyberGPT-GGUF es una colección de archivos en formato GGUF que cuantiza el modelo CyberGPT, desarrollado originalmente por srdharanidharan. La cuantización ha sido realizada por mradermacher, un equipo conocido por publicar versiones optimizadas de modelos open source para su ejecución local. El modelo base tiene aproximadamente 4.022 millones de parámetros (4B), lo que lo sitúa en la gama de modelos pequeños y eficientes, adecuados para entornos con recursos limitados.

La relevancia de esta publicación radica en que ofrece múltiples niveles de cuantización (desde Q2_K hasta f16), lo que permite a los desarrolladores elegir el equilibrio entre tamaño, velocidad y calidad según su hardware. El modelo está etiquetado como conversacional y en inglés, aunque no se proporcionan detalles adicionales sobre su arquitectura o entrenamiento en la información disponible. Al ser una cuantización estática, no incluye optimizaciones como imatrix, pero sí cubre las opciones más habituales para inferencia local.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer según librería transformers) |
| Parametros totales | 4.022.468.096 (aprox. 4B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base CyberGPT. La etiqueta de la librería `transformers` sugiere que se trata de un modelo transformer estándar, pero no se especifican detalles como el número de capas, cabezas de atención, tipo de atención (lineal, flash, etc.) ni el tamaño del vocabulario. Tampoco hay datos sobre el proceso de entrenamiento: número de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas de alineación. La cuantización realizada por mradermacher es estática, es decir, se ha convertido el modelo original a GGUF sin aplicar técnicas de imatrix o calibración adicionales, según se indica en la model card.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational`, lo que indica que está orientado a tareas de chat y diálogo.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: solo se declara inglés (`en`).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente virtual ligero: gracias a su tamaño de 4B y a las cuantizaciones pequeñas (por ejemplo, Q4_K_M de 2,6 GB), puede desplegarse en dispositivos con poca memoria, como portátiles o mini-PCs, para ofrecer respuestas conversacionales básicas en inglés.
- Prototipado rápido de chatbots: los desarrolladores pueden usar las versiones GGUF con herramientas como llama.cpp u Ollama para validar flujos de conversación antes de migrar a modelos más grandes.
- Inferencia en CPU: las cuantizaciones Q2_K y Q3_K_S (1,8 y 2,0 GB respectivamente) permiten ejecutar el modelo en CPU sin GPU, con una latencia aceptable para pruebas y entornos de desarrollo.
- Educación e investigación: al ser un modelo de tamaño reducido, es útil para estudiar el comportamiento de modelos cuantizados y comparar la degradación de calidad entre distintos niveles de cuantización.
- Integración en pipelines de generación de texto: puede usarse como generador de texto en aplicaciones que requieran respuestas cortas, como resúmenes o clasificación de intenciones, siempre que el dominio sea en inglés.
- Despliegue en entornos con restricciones de licencia: aunque la licencia no está especificada, al ser una cuantización de un modelo open source, podría emplearse en proyectos donde se necesite un modelo local sin dependencias externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo o su versión base.

## Requisitos de hardware

- VRAM estimada para inferencia: según el tamaño de los archivos GGUF, se puede estimar:
  - Q2_K (1,8 GB): cabe en GPUs con 2-3 GB de VRAM.
  - Q4_K_M (2,6 GB): requiere al menos 4 GB de VRAM.
  - Q8_0 (4,4 GB): necesita 6 GB o más.
  - f16 (8,2 GB): requiere 10 GB o más.
- GPU recomendadas: para las cuantizaciones pequeñas, una GTX 1650 o RTX 3050 (4-6 GB) es suficiente; para Q8_0 o f16, se recomienda una RTX 3060 (12 GB) o superior.
- Compatibilidad con GPU de consumo: sí, todas las cuantizaciones excepto f16 pueden ejecutarse en GPUs de consumo con 4-8 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. El modelo base CyberGPT no tiene documentación pública accesible, y no se conocen benchmarks que permitan compararlo con alternativas como Llama-3-8B, Mistral-7B o Qwen-2.5-7B. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información pública sobre sesgos del modelo base.
- Riesgo de alucinación: al ser un modelo de 4B, es probable que presente alucinaciones en tareas complejas, aunque no hay datos específicos.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada; es recomendable asumir un valor conservador (por ejemplo, 2048 o 4096 tokens) hasta verificar.
- Restricciones de licencia: la licencia no está especificada, lo que supone un riesgo para uso comercial. Se recomienda contactar con el autor original antes de desplegar en producción.
- Calidad de la cuantización: al ser cuantizaciones estáticas sin imatrix, la degradación de calidad puede ser mayor que en versiones con calibración, especialmente en los niveles más bajos (Q2_K, Q3_K).
- Idioma: solo se garantiza inglés; el rendimiento en otros idiomas es desconocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/CyberGPT-GGUF
- Modelo base (srdharanidharan/CyberGPT): https://huggingface.co/srdharanidharan/CyberGPT
- Página de descarga de mradermacher: https://hf.tst.eu/model#CyberGPT-GGUF
- Perfil de mradermacher en HuggingFace: https://huggingface.co/mradermacher
