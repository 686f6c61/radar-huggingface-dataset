# mradermacher/BLIP-Live-Gemma-GGUF

## Resumen

BLIP-Live-Gemma-GGUF es una conversión a formato GGUF del modelo multimodal BLIP-Live-Gemma, publicado originalmente por Salesforce. El repositorio, mantenido por mradermacher (autor habitual de cuantizaciones GGUF de terceros), ofrece una colección de cuantizaciones estáticas pensadas para ejecutar el modelo en llama.cpp y entornos compatibles sin necesidad de GPU de gama alta. El modelo base combina un codificador visual de la familia BLIP con un modelo de lenguaje Gemma, lo que lo sitúa en la categoría de modelos visión-lenguaje conversacionales.

El dato más concreto disponible es el número de parámetros reportado en los metadatos de safetensors: 25.233.142.046 parámetros totales (aproximadamente 25,2 mil millones), lo que corresponde a la variante Gemma de 27B combinada con el proyector y codificador visual. El repositorio ocupa 90,8 GB e incluye cuantizaciones desde F16 hasta Q2_K, pasando por Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, IQ4_XS y otras intermedias.

La relevancia de esta ficha es práctica: permite a desarrolladores desplegar un modelo visión-lenguaje de gran tamaño en infraestructura local mediante llama.cpp, algo que el checkpoint original en safetensors no facilita. No obstante, la información pública del repositorio es mínima: no se declaran licencia, idiomas ni pipeline, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal vision-lenguaje; base BLIP-Live-Gemma de Salesforce con LLM Gemma) |
| Parametros totales | 25.233.142.046 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. Por el nombre del modelo base (Salesforce/BLIP-Live-Gemma) y los tags del repositorio (conversational, endpoints_compatible), se trata de un modelo multimodal que combina un componente visual de la familia BLIP con un modelo de lenguaje Gemma, orientado a interacción conversacional con imágenes. El recuento de 25,2 mil millones de parámetros es coherente con un LLM Gemma de gran tamaño más el codificador y proyector visual.

Los metadatos de la model card indican el proceso de conversión (`convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1`), es decir, una conversión desde el checkpoint Hugging Face original a GGUF seguida de cuantización estática. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational` del repositorio.
- Procesamiento de imágenes (modelo visión-lenguaje basado en BLIP), aunque no se detallan las tareas visuales concretas soportadas.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integración con servidores de inferencia compatibles con la API de llama.cpp.
- Ejecución en CPU y GPU mediante llama.cpp y derivados (Ollama, LM Studio, etc.), gracias al formato GGUF.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Descripción de imágenes en local: el modelo puede recibir una imagen y generar una descripción textual en lenguaje natural, ejecutándose íntegramente en hardware propio mediante llama.cpp con las cuantizaciones Q4_K_M o Q5_K_M.
- Asistentes conversacionales con soporte visual: integración en un chatbot que mantenga conversaciones multi-turno sobre el contenido de imágenes aportadas por el usuario, aprovechando el tag `conversational`.
- Etiquetado y accesibilidad: generación automática de texto alternativo para imágenes en catálogos, CMS o aplicaciones de accesibilidad, usando la cuantización Q8_0 para maximizar calidad.
- Prototipado e investigación: evaluación de modelos visión-lenguaje de gran tamaño en entornos con recursos limitados, comparando el comportamiento entre cuantizaciones (Q2_K frente a Q8_0) sin necesidad de GPUs de 80 GB.
- Procesamiento por lotes en CPU: uso de las cuantizaciones más pequeñas (Q3_K_S, Q2_K) en servidores sin GPU para tareas de clasificación o descripción de imágenes a gran escala donde la latencia no sea crítica.
- Despliegue en estaciones de trabajo de desarrollo: ejecución con Ollama o LM Studio para pruebas de integración antes de migrar a infraestructura mayor, gracias a la disponibilidad de múltiples niveles de cuantización en un único repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según el tamaño del modelo de 25,2B parámetros):
  - F16: en torno a 50 GB de VRAM (no cabe en GPUs de consumo).
  - Q8_0: en torno a 27 GB.
  - Q5_K_M: en torno a 18 GB.
  - Q4_K_M: en torno a 15-16 GB.
  - Q3_K_M: en torno a 12-13 GB.
  - Q2_K: en torno a 9-10 GB.
- GPU recomendadas: A100 80 GB o H100 para F16; A100 40 GB o RTX 6000 Ada para Q8_0; RTX 4090 (24 GB) para Q5_K_M y Q4_K_M.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 12 GB con Q3_K_M o Q2_K, con posible offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de llama.cpp (el tag `endpoints_compatible` lo sugiere). vLLM y TGI no soportan GGUF de forma nativa en todos los casos; no disponible confirmación para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BLIP-Live-Gemma-GGUF (este) | 25,2B | no disponible | GGUF | no disponible | Hugging Face |
| Salesforce/BLIP-Live-Gemma (base) | 25,2B | no disponible | safetensors | no disponible | Hugging Face |
| Alternativas visión-lenguaje de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos de la misma categoría. Se recomienda consultar la model card del modelo base de Salesforce para obtener datos de rendimiento y licencia.

## Limitaciones y advertencias

- La licencia no está declarada en el repositorio; antes de cualquier uso comercial debe verificarse la licencia del modelo base Salesforce/BLIP-Live-Gemma, ya que la cuantización hereda sus términos.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto y debe evaluarse empíricamente.
- No hay información sobre sesgos, datos de entrenamiento ni mitigaciones aplicadas; se desconoce el riesgo específico de alucinación y sesgo.
- Las cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad de forma notable en modelos de este tamaño; para producción se recomienda Q4_K_M o superior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.
- La fecha de creación indicada (2026-11-24) es posterior a la fecha habitual de referencia; conviene verificar la integridad y procedencia de los archivos antes de desplegarlos.
- No se documenta el soporte de tool calling ni de agentes; no debe asumirse su disponibilidad en producción.
- El tamaño del repositorio (90,8 GB) implica requisitos de almacenamiento considerables si se descargan todas las cuantizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/BLIP-Live-Gemma-GGUF
- Modelo base: https://huggingface.co/Salesforce/BLIP-Live-Gemma
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
