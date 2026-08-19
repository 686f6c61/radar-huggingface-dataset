# mradermacher/Ornith-1.0-35B-uncensored-heretic-GGUF

## Resumen

Ornith-1.0-35B-uncensored-heretic-GGUF es una cuantización en formato GGUF del modelo Ornith-1.0-35B, una variante de la familia Ornith-1.0 desarrollada por el equipo de ornith-ai. Esta versión concreta, publicada por mradermacher, aplica técnicas de "uncensoring" (abliteration) para eliminar los rechazos y restricciones típicas de los modelos de lenguaje, ofreciendo una salida sin filtros de seguridad. El modelo base original es llmfan46/Ornith-1.0-35B-uncensored-heretic, que a su vez deriva de Ornith-1.0-35B.

La familia Ornith-1.0 se caracteriza por una arquitectura Mixture-of-Experts (MoE) con una ventana de contexto de 256 000 tokens, y está disponible en tres tamaños: un modelo denso de 9B y dos MoE de 35B y 397B. Esta cuantización GGUF facilita su ejecución en hardware local mediante herramientas como llama.cpp u Ollama. El repositorio incluye además archivos de proyección multimodal (mmproj), lo que sugiere capacidades de entrada de imágenes, aunque no se detalla su alcance.

Es relevante para desarrolladores que buscan un modelo de lenguaje abierto, con licencia MIT, sin restricciones de uso comercial y con un comportamiento "sin censura" para aplicaciones donde se requiere máxima libertad de generación, como investigación en IA, chatbots personalizados o experimentación creativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) (según familia Ornith-1.0) |
| Parametros totales | 35B (nominal, no verificado; los metadatos de HuggingFace indican 446 571 248, valor inconsistente) |
| Parametros activos | no disponible |
| Longitud de contexto | 256 000 tokens (según familia Ornith-1.0) |
| Tipos de cuantizacion | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS (según comentarios de la model card) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (incluye mmproj para multimodal) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo no está documentada en la información proporcionada. Según el repositorio oficial de Ornith-1.0, la familia utiliza una arquitectura MoE con un mecanismo de atención de contexto largo (256K). El modelo base ha sido sometido a un proceso de "abliteration" (también llamado "uncensoring" o "decensoring") que elimina los patrones de rechazo aprendidos durante el ajuste fino con RLHF, permitiendo respuestas sin restricciones temáticas. No se dispone de detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni las técnicas de alineación utilizadas. La cuantización GGUF fue realizada por mradermacher con herramientas estándar, sin usar imatrix ni pesos ponderados (según la model card).

## Capacidades

- Generación de texto libre sin filtros de seguridad (uncensored).
- Soporte de entrada multimodal (imágenes) mediante los archivos mmproj incluidos, aunque no se especifica qué tipos de imágenes o tareas visuales soporta.
- Ventana de contexto de 256K tokens, adecuada para documentos largos o conversaciones multi-turno extensas.
- Compatible con el ecosistema GGUF (llama.cpp, Ollama, LM Studio, etc.).
- No se confirma soporte de tool calling ni function calling en la información disponible.
- No se confirma modo de razonamiento explícito (thinking mode) ni capacidades de agente autónomo.

## Casos de uso

- Chatbots sin censura para entornos de investigación: el modelo permite explorar temas sensibles o controvertidos sin rechazos automáticos, útil en estudios sociológicos o de IA responsable.
- Generación de contenido creativo (ficción, guiones, poesía) con libertad temática, aprovechando la ventana de 256K para mantener coherencia en obras largas.
- Análisis de documentos extensos: su contexto de 256K permite procesar libros completos o informes técnicos en una sola pasada, extrayendo resúmenes o respondiendo preguntas.
- Prototipado rápido de asistentes conversacionales en inglés con despliegue local en hardware modesto (dependiendo de la cuantización elegida).
- Experimentación con técnicas de "abliteration" para entender el comportamiento de modelos sin alineación, comparando con versiones censuradas.
- Uso educativo en cursos de procesamiento de lenguaje natural para demostrar arquitecturas MoE y cuantización GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Dado el tamaño nominal de 35B, se estima que una cuantización Q4_K_M requerirá aproximadamente 20-25 GB de VRAM para inferencia en GPU.
- GPUs recomendadas: NVIDIA A100 (80 GB), H100, o GPUs de consumo con 24 GB o más (RTX 3090/4090) para cuantizaciones bajas.
- Para cuantizaciones más agresivas (Q2_K, Q3_K) podría caber en GPUs de 16 GB, pero con pérdida de calidad.
- El repositorio GGUF tiene un tamaño de solo 1,5 GB, lo que sugiere que el modelo podría ser mucho más pequeño de lo que indica el nombre; se recomienda verificar el número real de parámetros antes de dimensionar el hardware.
- Herramientas de despliegue compatibles: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con conversión a formato compatible).
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos. La familia Ornith-1.0 incluye variantes de 9B, 35B y 397B, pero no hay datos de rendimiento publicados. Modelos alternativos "uncensored" como Dolphin (basado en Llama/Mistral) o Gemma-heritic podrían ser comparables, pero no se tienen datos concretos de esta versión.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente "uncensored", lo que implica que puede generar contenido ofensivo, ilegal o dañino sin filtros. Su uso debe ser responsable y bajo la propia responsabilidad del desarrollador.
- No se dispone de información sobre sesgos específicos, pero al eliminar la alineación, los sesgos presentes en los datos de entrenamiento pueden amplificarse.
- Riesgo de alucinaciones: al no tener restricciones, puede producir afirmaciones falsas con gran confianza.
- La discrepancia entre el nombre (35B) y los metadatos de HuggingFace (446M) es preocupante; podría tratarse de un error de etiquetado o de un modelo distinto. Se recomienda verificar el modelo base antes de usarlo en producción.
- La licencia MIT permite uso comercial, pero la naturaleza "uncensored" puede violar términos de servicio de plataformas o leyes locales.
- No hay garantía de soporte para tool calling ni funciones de agente, limitando su integración en pipelines complejos.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/mradermacher/Ornith-1.0-35B-uncensored-heretic-GGUF
- Modelo base (llmfan46): https://huggingface.co/llmfan46/Ornith-1.0-35B-uncensored-heretic
- Repositorio oficial de Ornith-1.0: https://github.com/ornith-ai/Ornith-1
- Repositorio alternativo (thanet-s): https://github.com/thanet-s/Ornith-1.0-35B-heretic
- Variante similar de mradermacher: https://huggingface.co/mradermacher/Ornith-1.0-35B-Heretic-MTP-i1-GGUF
