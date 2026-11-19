# mradermacher/Transliteration-2.0-4B-Safetensors-i1-GGUF

## Resumen

Transliteration-2.0-4B-Safetensors-i1-GGUF es una cuantización en formato GGUF, generada con imatrix, del modelo base UnimeType/Transliteration-2.0-4B-Safetensors. El modelo original es un transformer de aproximadamente 4.205 millones de parámetros (4,2B) especializado en transliteración: la conversión entre sistemas de escritura y esquemas de romanización (pinyin, romaji, hinglish, arabizi, cirílico, greeklish, vietnamita, entre otros). Está pensado como motor para métodos de entrada (IME) y herramientas de input multilingüe. El trabajo de cuantización lo firma mradermacher, un autor habitual en la publicación de versiones GGUF de modelos open source.

La relevancia de esta ficha radica en que el paquete GGUF permite ejecutar un modelo de 4,2B en hardware de consumo, algo imposible con los pesos safetensors originales. La model card del cuantizador no incluye detalles de arquitectura interna, datos de entrenamiento ni benchmarks; toda la información técnica disponible proviene de los metadatos del repositorio, la lista de cuantizaciones publicadas y las etiquetas del modelo base (que apuntan a una familia tipo Qwen 3.5, versión v2.6).

La licencia Apache 2.0 del modelo base facilita su integración en productos comerciales, lo que convierte a esta cuantización en una opción práctica para teclados virtuales, sistemas de entrada y pipelines de normalización de texto multilingüe que necesiten funcionar en local o en edge.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5 según etiquetas del modelo base; detalles internos no disponibles) |
| Parámetros totales | 4.205.751.296 (4,2B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S y superiores (imatrix y quants estáticos disponibles en repositorio aparte) |
| Idiomas soportados | en, zh, ja, hi, ar, ru, el, vi, es, fr, pt, de, it |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Las etiquetas del repositorio apuntan a la familia Qwen 3.5 (versión v2.6) como base arquitectónica, y el recuento real de parámetros en safetensors es de 4.205.751.296. La model card del cuantizador no incluye número de tokens de entrenamiento, composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

La contribución técnica de este repositorio concreto es la cuantización: se han generado pesos GGUF con una matriz de importancia (imatrix) calculada sobre el modelo, lo que permite obtener cuantizaciones de baja precisión (desde IQ1_S, 1,5 GB, hasta Q5_K_S, 3,1 GB y superiores) con una degradación de calidad menor que la de las cuantizaciones estáticas equivalentes. El repositorio incluye además el fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones. Existe un repositorio paralelo con cuantizaciones estáticas (sin imatrix) para quien prefiera ese formato.

## Capacidades

- Transliteración entre sistemas de escritura y esquemas de romanización: pinyin, romaji, hinglish, arabizi, cirílico, greeklish y vietnamita, entre otros.
- Soporte para métodos de entrada (IME) y teclados virtuales multilingües.
- Conversión de texto romanizado a escritura nativa y viceversa.
- Cobertura multilingüe declarada para 13 idiomas: inglés, chino, japonés, hindi, árabe, ruso, griego, vietnamita, español, francés, portugués, alemán e italiano.
- Formato conversacional (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Teclados virtuales y métodos de entrada (IME) en dispositivos móviles: el modelo convierte pulsaciones en romanización (pinyin, romaji, hinglish, arabizi) a caracteres nativos, y su tamaño de 4,2B cuantizado a Q4_K_M (2,8 GB) permite ejecutarlo en local sin depender de la nube.
- Normalización de texto multilingüe en pipelines de datos: útil para unificar nombres propios, topónimos y entidades escritas en distintos sistemas de escritura antes de indexarlos en un motor de búsqueda o base de datos.
- Procesamiento de reseñas y contenido generado por usuarios en mercados asiáticos y de Oriente Medio: transliterar arabizi o hinglish a escritura estándar facilita el análisis de sentimiento y la moderación con modelos posteriores.
- Sistemas de atención al cliente con entrada romanizada: usuarios que escriben hindi en caracteres latinos o árabe en arabizi pueden ser atendidos por un chatbot que normalice la entrada antes de pasarla a un LLM mayor.
- Herramientas de accesibilidad y aprendizaje de idiomas: conversión bidireccional entre romanización y escritura nativa para estudiantes de chino, japonés, hindi, árabe o griego.
- Preprocesado en pipelines RAG multilingües: normalizar la forma de escritura de documentos y consultas antes de la recuperación, reduciendo fallos de coincidencia por variantes de transliteración.
- Despliegue en edge o entornos sin conectividad: las cuantizaciones IQ2/IQ3 (1,6-2,3 GB) permiten ejecutar el modelo en portátiles modestos o dispositivos con poca VRAM para tareas de transliteración en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): desde ~1,5 GB (i1-IQ1_S) hasta ~3,1 GB (i1-Q5_K_S) y superiores en las cuantizaciones de mayor precisión; el fichero imatrix ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones Q4/IQ4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput y contextos largos.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones IQ2 a Q5 caben en tarjetas de 4-8 GB (GTX 1650, RTX 3050, RTX 4060, etc.), dejando margen para el contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el modelo base safetensors es compatible con transformers, vLLM y TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Transliteration-2.0-4B (esta cuantización) | 4,2B | no disponible | 13 (en, zh, ja, hi, ar, ru, el, vi, es, fr, pt, de, it) | Apache 2.0 | GGUF / safetensors |
| Transliteration-2.0-4B-Safetensors (original) | 4,2B | no disponible | 13 | Apache 2.0 | safetensors |
| Transliteration-2.0-4B-Safetensors-GGUF (quants estáticos) | 4,2B | no disponible | 13 | Apache 2.0 | GGUF |
| Otros modelos de transliteración comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos alternativos de transliteración con los que establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La model card del cuantizador no documenta sesgos conocidos, tasas de alucinación ni evaluación de calidad por idioma; se recomienda validar la transliteración en el dominio concreto antes de producción.
- La transliteración es una tarea sensible a la ambigüedad: distintas romanizaciones pueden corresponder a múltiples escrituras nativas, lo que puede producir errores en nombres propios o términos técnicos.
- No se especifica la longitud de contexto soportada; para entradas largas conviene trocear el texto.
- La lista de idiomas del repositorio incluye 13 lenguas, pero la ficha de Hugging Face solo declara cinco (en, zh, ja, hi, ar); la cobertura real del resto (ru, el, vi, es, fr, pt, de, it) no está verificada con benchmarks.
- Las cuantizaciones IQ1 e IQ2 (1,5-1,8 GB) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "mostly desperate".
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos del modelo base UnimeType por si añade condiciones adicionales.
- El repositorio ocupa 53,4 GB en total; descargar solo el fichero de la cuantización deseada, no el repositorio completo.

## Enlaces

- Repositorio Hugging Face (esta cuantización): https://huggingface.co/mradermacher/Transliteration-2.0-4B-Safetensors-i1-GGUF
- Modelo base: https://huggingface.co/UnimeType/Transliteration-2.0-4B-Safetensors
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Transliteration-2.0-4B-Safetensors-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Transliteration-2.0-4B-Safetensors-i1-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
