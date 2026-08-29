# Abu-Dju/madlad400-7b-mt-bt-Q8_0-GGUF

## Resumen

MADLAD-400 es una familia de modelos de traducción automática multilingüe desarrollada por Google Research, entrenada sobre el dataset homónimo que cubre más de 400 idiomas. Este repositorio concreto, `Abu-Dju/madlad400-7b-mt-bt-Q8_0-GGUF`, es una conversión a formato GGUF del checkpoint original `google/madlad400-7b-mt-bt` realizada por un tercero mediante la herramienta GGUF-my-repo de ggml.ai. El sufijo "bt" indica que el modelo fue entrenado con aumentación por back-translation, una técnica que mejora la calidad de traducción en pares de idiomas con pocos datos paralelos.

El modelo sigue una arquitectura encoder-decoder tipo T5, con aproximadamente 8.300 millones de parámetros en total, y está pensado para tareas de generación de texto a texto, principalmente traducción. Su relevancia actual radica en que, al estar disponible en GGUF cuantizado a Q8_0, puede ejecutarse localmente en hardware de consumo mediante llama.cpp, lo que democratiza el acceso a un traductor de altísima cobertura lingüística sin depender de APIs comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder) |
| Parametros totales | 8.296.829.952 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (este repo); el modelo original está en bf16 |
| Idiomas soportados | Más de 400, incluyendo en, es, fr, de, it, pt, ru, zh, ja, ar, hi, sw, yue y muchos más |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `madlad400-7b-mt-bt-q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura T5, un transformer encoder-decoder originalmente propuesto por Google. En esta variante de 7B parámetros, el encoder procesa el texto fuente y el decoder genera la traducción. El entrenamiento se realizó sobre el dataset MADLAD-400, un corpus multilingüe y a nivel de documento que incluye datos procedentes de Common Crawl filtrados y auditados, complementado con datos paralelos. La variante "bt" incorpora back-translation, es decir, se generaron datos sintéticos traduciendo texto monolingüe al idioma de origen para aumentar la cobertura de pares de idiomas con escasez de datos paralelos. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento, el uso de RLHF/DPO u otras técnicas de alineación en la información proporcionada.

## Capacidades

- Traducción automática multilingüe de alta cobertura: soporta más de 400 idiomas, desde los mayoritarios (inglés, español, francés, alemán, chino, japonés, etc.) hasta lenguas minoritarias y regionales.
- Generación de texto a texto (text2text-generation): además de traducción, puede adaptarse a otras tareas de transformación de texto si se le proporciona el prefijo adecuado.
- Procesamiento por lotes: al ser un modelo encoder-decoder, es adecuado para traducir documentos completos o fragmentos largos de forma eficiente.
- Ejecución local: gracias al formato GGUF y la cuantización Q8_0, puede ejecutarse en CPU o GPU mediante llama.cpp sin necesidad de infraestructura cloud.
- No se ha documentado soporte para tool calling, function calling, agentes ni modos de razonamiento especiales en la información disponible.

## Casos de uso

- Traducción de documentación técnica: traducir manuales, guías y especificaciones de producto a decenas de idiomas de forma automatizada, aprovechando la cobertura de más de 400 lenguas.
- Localización de software y aplicaciones: generar cadenas de interfaz de usuario en múltiples idiomas a partir de un archivo de recursos en inglés, integrando el modelo en un pipeline de CI/CD.
- Atención al cliente multilingüe: traducir consultas y respuestas de tickets de soporte en tiempo real, permitiendo que un equipo reduzca la barrera idiomática sin depender de servicios externos.
- Traducción de contenido generado por usuarios: procesar reseñas, comentarios o publicaciones en redes sociales para análisis de sentimiento o moderación en mercados internacionales.
- Subtitulado y transcripción: traducir subtítulos de vídeo o transcripciones de audio a múltiples idiomas, manteniendo la coherencia contextual gracias al entrenamiento a nivel de documento.
- Investigación lingüística: estudiar la calidad de traducción en lenguas de bajos recursos, comparando el comportamiento del modelo con otros sistemas multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original de Google reporta métricas BLEU y chrF en el paper de MADLAD-400, pero estos datos no se incluyen en la documentación de este repositorio GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF Q8_0 ocupa aproximadamente 8,8 GB, por lo que se necesitan al menos 9-10 GB de VRAM para cargar el modelo completo en GPU. En CPU, se requiere memoria RAM equivalente.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 o cualquier GPU con 12 GB o más de VRAM. También puede ejecutarse en Apple Silicon con suficiente memoria unificada.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de 12 GB o más, como la RTX 3060 de 12 GB o la RTX 4070 Ti Super.
- Opciones de despliegue: llama.cpp (CLI y servidor), llama-server, y cualquier runtime compatible con GGUF como Ollama o text-generation-inference (TGI) con backend llama.cpp.
- Latencia y throughput: no se dispone de datos medidos en la información proporcionada. Como referencia orientativa, un modelo de 7B en Q8_0 suele generar entre 10 y 30 tokens por segundo en una GPU consumer, pero esto depende del hardware y de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MADLAD-400 7B (este) | 8,3B | no disponible | >400 | Apache 2.0 | GGUF Q8_0 |
| NLLB-200 (Meta) | 3,3B / 54B | 512 | 200 | CC-BY-NC 4.0 | Transformers, GGUF |
| M2M-100 (Meta) | 418M / 1,2B / 12B | 1024 | 100 | MIT | Transformers |
| mT5 (Google) | hasta 13B | 512 | 101 | Apache 2.0 | Transformers |

La comparativa se basa en características generales conocidas de estos modelos; no se dispone de datos de rendimiento comparativos en la información proporcionada. MADLAD-400 destaca por su cobertura de más de 400 idiomas y su licencia Apache 2.0, que permite uso comercial sin restricciones, a diferencia de NLLB-200 que tiene licencia no comercial.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre datos de Common Crawl, el modelo puede reflejar sesgos presentes en el contenido web, especialmente en lenguas con más representación.
- Riesgo de alucinación: como todo modelo generativo, puede producir traducciones incorrectas o inventar contenido, especialmente en idiomas de bajos recursos o con input ambiguo.
- Longitud de contexto: no se ha especificado la ventana de contexto máxima; los modelos T5 suelen limitarse a 512 tokens, lo que puede ser insuficiente para documentos muy largos.
- Calidad variable entre idiomas: la calidad de traducción es significativamente mejor en idiomas con muchos datos de entrenamiento (inglés, español, francés, etc.) que en lenguas minoritarias.
- Cuantización: la conversión a Q8_0 introduce una ligera pérdida de precisión respecto al modelo original en bf16, aunque en la práctica suele ser mínima para tareas de traducción.
- Mantenimiento: este repositorio es una conversión de un tercero; no hay garantía de actualizaciones ni soporte oficial por parte de Google.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Abu-Dju/madlad400-7b-mt-bt-Q8_0-GGUF
- Modelo original: https://huggingface.co/google/madlad400-7b-mt-bt
- Documentación de MADLAD-400 en Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/madlad-400.md
- Paper y recursos de investigación: https://github.com/google-research/google-research/blob/master/madlad_400/README.md
- Dataset MADLAD-400: https://huggingface.co/datasets/allenai/MADLAD-400
