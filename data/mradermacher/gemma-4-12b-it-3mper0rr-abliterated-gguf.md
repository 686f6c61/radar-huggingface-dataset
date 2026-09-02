# mradermacher/gemma-4-12b-it-3MPER0RR-abliterated-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `3MPER0RR/gemma-4-12b-it-3MPER0RR-abliterated`, una versión "abliterated" (con los mecanismos de rechazo y censura eliminados) del modelo Gemma 4 12B de Google, preparadas por mradermacher. El modelo base es una variante de instrucción multimodal de la familia Gemma 4, que según la documentación oficial de Google incluye arquitecturas densas y MoE, con ventanas de contexto de hasta 256K tokens y soporte multilingüe en más de 140 idiomas. Esta cuantización específica se distribuye únicamente en formato GGUF, pensada para su uso con motores de inferencia como llama.cpp, Ollama o LM Studio en entornos locales o de producción ligera.

La relevancia de este modelo radica en que ofrece una alternativa de 12B parámetros (11,9B reales) con capacidades multimodales (se incluyen archivos mmproj para visión) y una licencia de uso que, al ser una versión abliterated, elimina las restricciones de contenido típicas de los modelos comerciales, lo que lo hace atractivo para experimentación y aplicaciones que requieren generación sin filtros. Sin embargo, al ser una cuantización de un tercero, no se dispone de documentación oficial sobre el entrenamiento o los benchmarks del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 12B, presumiblemente con atención estándar) |
| Parametros totales | 11.907.350.576 (11,9B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la familia Gemma 4 soporta hasta 256K, pero no se confirma en esta cuantización) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en (según la etiqueta de HuggingFace; la familia Gemma 4 soporta 140+ idiomas, pero no se verifica aquí) |
| Licencia | no disponible (la licencia original de Gemma 4 es la Gemma Terms of Use, pero esta versión abliterated puede tener términos distintos) |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna o el proceso de entrenamiento de este modelo específico. El repositorio es una cuantización estática de un modelo base llamado `3MPER0RR/gemma-4-12b-it-3MPER0RR-abliterated`, que a su vez deriva de Gemma 4 12B de Google. Según el informe técnico de Gemma 4 (arXiv:2607.02770), la familia Gemma 4 incluye arquitecturas densas y MoE, con mejoras en eficiencia computacional y razonamiento, además de encoders de visión y audio unificados. Sin embargo, no se confirma si esta versión concreta mantiene todas esas características, ni se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La única innovación destacable en este repositorio es la inclusión de archivos mmproj (proyección multimodal) en formato GGUF, lo que sugiere que el modelo base es multimodal, pero no se aportan más detalles.

## Capacidades

- Generación de texto y razonamiento: al ser una variante de instrucción de Gemma 4, se espera que pueda realizar tareas de generación, resumen, análisis y razonamiento, aunque no se han publicado benchmarks específicos.
- Soporte multimodal: la presencia de archivos mmproj (f16 y Q8_0) indica que el modelo puede procesar imágenes, probablemente con capacidades de visión similares a las de Gemma 4, pero no se documenta su alcance exacto.
- Tool calling y function calling: no se menciona en la documentación; se desconoce si el modelo base los soporta.
- Capacidades multilingües: la etiqueta solo indica inglés, aunque Gemma 4 oficialmente soporta más de 140 idiomas; no se puede confirmar para esta versión.
- Modo "abliterated": se han eliminado los mecanismos de rechazo y censura, lo que permite generar contenido que los modelos estándar suelen bloquear, como respuestas sobre temas sensibles o sin restricciones de seguridad.

## Casos de uso

- Despliegue local en equipos de consumo: gracias a las cuantizaciones Q4_K_M o Q5_K_M (7,5-8,6 GB), el modelo puede ejecutarse en GPUs con 8-12 GB de VRAM, lo que permite tener un asistente conversacional multimodal en un portátil o estación de trabajo sin conexión a la nube.
- Generación de contenido creativo sin filtros: al ser abliterated, es adecuado para proyectos de escritura creativa, roleplay o generación de narrativas que requieran explorar temas tabú o controvertidos sin restricciones del modelo.
- Prototipado de aplicaciones de visión por computador: con los archivos mmproj, se puede usar para tareas de captioning de imágenes o respuesta a preguntas visuales en entornos donde se necesite control total sobre el contenido generado.
- Investigación en alineación y seguridad: la versión abliterated permite estudiar el comportamiento de un modelo sin mecanismos de rechazo, útil para analizar sesgos, alucinaciones o la efectividad de técnicas de mitigación.
- Integración en pipelines de generación de código: aunque no se confirma soporte de tool calling, el modelo puede usarse con frameworks como llama.cpp para autocompletado o generación de código en entornos locales, aprovechando su tamaño moderado.
- Evaluación de cuantizaciones: este repositorio ofrece múltiples niveles de cuantización (Q2_K a Q8_0), lo que permite a los desarrolladores comparar el equilibrio entre tamaño, velocidad y calidad para su caso de uso específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo o su versión base abliterated. Se recomienda realizar evaluaciones propias antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: según el tamaño de los archivos GGUF, una cuantización Q4_K_M (7,5 GB) puede caber en una GPU con 8 GB de VRAM, mientras que Q8_0 (12,8 GB) requiere al menos 16 GB. Los archivos mmproj añaden entre 0,2 y 0,3 GB adicionales.
- GPU recomendadas: para las cuantizaciones pequeñas (Q2_K a Q4_K_M), una RTX 3060/4060 de 8-12 GB es suficiente; para Q6_K o Q8_0, se recomienda una RTX 3090/4090 o A100 con 24 GB o más.
- Compatibilidad con GPU de consumo: sí, las cuantizaciones Q4_K_S, Q4_K_M y Q5_K_M son adecuadas para GPUs de gama media con 8-12 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python. También se puede usar vLLM si se convierte a otro formato, pero no es el propósito de este repo.
- Latencia y throughput: no se proporcionan datos; dependerá del hardware y de la cuantización elegida. En una RTX 4090, un modelo de 12B en Q4_K_M suele generar entre 30-60 tokens por segundo, pero esto es una estimación general, no un dato oficial.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-12b-it-3MPER0RR-abliterated-GGUF (este) | 11,9B | no disponible | no disponible | GGUF | Abliterated, multimodal (mmproj) |
| Llama 3.1 8B Instruct (GGUF) | 8B | 128K | Llama 3.1 License | GGUF | No multimodal, con restricciones de uso |
| Mistral 7B Instruct v0.3 (GGUF) | 7B | 32K | Apache 2.0 | GGUF | No multimodal, ampliamente soportado |
| Qwen 2.5 14B Instruct (GGUF) | 14B | 128K | Apache 2.0 | GGUF | Multimodal en versiones específicas, pero no en la 14B estándar |

La comparativa se basa en características generales; no se dispone de datos de rendimiento para este modelo, por lo que no se puede establecer una comparación objetiva de calidad.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser una versión abliterated, el modelo puede generar contenido sesgado, ofensivo o factualmente incorrecto sin ningún tipo de filtro. No se han realizado evaluaciones de seguridad.
- Riesgo de contenido inapropiado: la eliminación de los mecanismos de rechazo implica que el modelo puede producir texto explícito, violento o ilegal si se le solicita. No es adecuado para aplicaciones orientadas al público general sin moderación externa.
- Limitaciones de contexto: aunque la familia Gemma 4 soporta hasta 256K tokens, no se confirma que esta cuantización mantenga esa longitud; es posible que la ventana efectiva sea menor según la implementación.
- Restricciones de licencia: la licencia no está especificada en el repositorio. El modelo base original de Gemma 4 tiene una licencia propia de Google que restringe el uso comercial en ciertos casos; la versión abliterated puede violar esos términos, por lo que se recomienda verificar la legalidad antes de usarlo en producción.
- Soporte limitado: al ser una cuantización de un tercero, no hay garantía de mantenimiento, corrección de errores ni documentación oficial. Los archivos mmproj pueden no funcionar correctamente con todos los motores GGUF.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma-4-12b-it-3MPER0RR-abliterated-GGUF
- Modelo base (3MPER0RR): https://huggingface.co/3MPER0RR/gemma-4-12b-it-3MPER0RR-abliterated
- Cuantizaciones con imatrix (i1): https://huggingface.co/mradermacher/gemma-4-12b-it-3MPER0RR-abliterated-i1-GGUF
- Blog de Google sobre Gemma 4 12B: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Informe técnico de Gemma 4 (arXiv): https://arxiv.org/abs/2607.02770
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
