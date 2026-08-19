# ali-elganzory/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k

## Resumen

`ali-elganzory/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k` es un modelo de lenguaje de 1.700 millones de parámetros, resultado de un ajuste fino (fine-tuning) del modelo base `open-sci/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096` sobre el dataset `long_sft`. El nombre del modelo sugiere que el entrenamiento se centró en extender la longitud de contexto de 4096 a 16 384 tokens, lo que lo convierte en una opción ligera para tareas que requieren procesar documentos largos o conversaciones multi-turno extensas.

Desarrollado por el usuario de HuggingFace `ali-elganzory`, el modelo se publica con licencia `other` (sin especificar) y está disponible en formato `safetensors`. Aunque el pipeline declarado es `feature-extraction`, su naturaleza de modelo de lenguaje generativo lo hace apto para tareas de texto. La relevancia actual radica en la creciente demanda de modelos pequeños con ventanas de contexto ampliadas para despliegue en entornos con recursos limitados, sin sacrificar la capacidad de manejar entradas largas.

No se dispone de información pública sobre la arquitectura interna, los datos de entrenamiento detallados ni resultados de benchmarks. La model card generada automáticamente carece de descripciones y los resultados de evaluación están vacíos, lo que limita una evaluación objetiva de sus capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer decoder) |
| Parametros totales | 1 714 377 728 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 16 384 tokens (según el nombre y fuentes externas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura del modelo base `open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096`. Por el tamaño (1.7B parámetros) y el nombre, es probable que se trate de un transformer decoder estándar, pero no hay confirmación oficial. El ajuste fino se realizó con el framework `llama-factory` en modo `full` (todos los parámetros entrenados), sobre el dataset `long_sft`, que según el nombre del modelo busca extender la ventana de contexto de 4096 a 16 384 tokens.

Los hiperparámetros de entrenamiento declarados en la model card incluyen: learning rate de 0.0002, batch size de entrenamiento de 2 (con acumulación de gradientes de 2 pasos, total 32), batch de evaluación de 8 (total 64), optimizador AdamW con betas (0.9, 0.999), scheduler cosine con warmup del 5% y una sola época. Se utilizaron 8 GPUs en paralelo. El entrenamiento se ejecutó con Transformers 4.51.3, PyTorch 2.7.0a0 y Datasets 3.6.0.

No se especifican técnicas adicionales como RLHF, DPO o decodificación especulativa. Tampoco se detalla la composición del dataset `long_sft` ni su tamaño.

## Capacidades

- Generación de texto: como modelo de lenguaje, es capaz de producir texto coherente, aunque no se han publicado evaluaciones específicas.
- Manejo de contexto largo: el ajuste a 16 384 tokens permite procesar documentos extensos, resúmenes de libros, análisis de código o conversaciones largas en una sola pasada.
- Extracción de características: el pipeline declarado (`feature-extraction`) sugiere que puede utilizarse para obtener representaciones vectoriales de texto, útil en tareas de búsqueda semántica o clasificación.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Multilingüismo: no especificado; el dataset base (FineWeb-Edu) es predominantemente inglés, por lo que el rendimiento en otros idiomas es incierto.

## Casos de uso

- Análisis de documentos legales o académicos: con 16k de contexto, el modelo puede procesar contratos completos o artículos de investigación extensos para extraer cláusulas clave, resumir secciones o responder preguntas específicas sobre el contenido.
- Chatbots de atención al cliente con historial largo: permite mantener conversaciones de más de 10 000 tokens sin perder el hilo, adecuado para soporte técnico donde el usuario describe problemas complejos en múltiples turnos.
- Generación de código con contexto amplio: puede recibir un repositorio parcial o múltiples archivos de código fuente (hasta ~4000 tokens de código) para sugerir implementaciones o detectar errores, aunque no se ha validado su rendimiento en tareas de programación.
- Resumen de libros o informes largos: entrada de capítulos completos para producir resúmenes ejecutivos, gracias a la ventana de 16k.
- Búsqueda semántica y recuperación de información: al ser entrenado para extracción de características, puede generar embeddings de párrafos largos para indexar y comparar documentos.
- Clasificación de textos extensos: análisis de sentimiento o categorización de artículos completos sin truncar el contenido, útil en moderación de contenido o investigación de mercado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El `model-index` de la model card solo incluye una entrada llamada `long-context-fineweb` con resultados vacíos. No hay datos de MMLU, HumanEval, GSM8K u otras pruebas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.7B parámetros en precisión fp16, los pesos ocupan aproximadamente 3.4 GB (coincide con el tamaño del repositorio). En cuantización int8 se reduciría a ~1.7 GB y en int4 a ~0.9 GB, aunque no se han publicado versiones cuantizadas.
- GPU recomendadas: una GPU consumer con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, GTX 1660 Super) podría ejecutar el modelo en fp16 con margen para activaciones. Para cuantización int4, bastarían 4 GB (GTX 1650, RTX 3050).
- Opciones de despliegue: al ser un modelo de Transformers, es compatible con vLLM, llama.cpp (si se convierte a GGUF), Ollama (mediante conversión), TGI y HuggingFace Inference Endpoints.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna (RTX 4090), un modelo de 1.7B puede generar entre 30 y 60 tokens por segundo en fp16, pero esto es una estimación general sin datos específicos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci-ref-v0.02-1.7b-longsft_16k (este) | 1.7B | 16 384 | other | HuggingFace |
| Qwen2.5-1.5B | 1.5B | 32 768 | Apache 2.0 | HuggingFace |
| Llama-3.2-1B | 1.0B | 128 000 | Llama 3.2 | HuggingFace |
| Gemma-2-2B | 2.6B | 8 192 | Gemma | HuggingFace |

No se dispone de datos de rendimiento comparativos. Qwen2.5-1.5B y Llama-3.2-1B tienen contextos más largos y licencias permisivas, mientras que Gemma-2-2B es más grande pero con contexto menor. La ventaja de este modelo es su tamaño compacto y contexto amplio, aunque la falta de benchmarks impide una comparación objetiva.

## Limitaciones y advertencias

- No hay información pública sobre sesgos, alucinaciones o calidad del texto generado. El modelo base se entrenó con datos de FineWeb-Edu, que pueden contener sesgos inherentes al contenido web.
- La licencia `other` no especifica términos de uso. No se garantiza permiso para uso comercial; es necesario contactar al autor para aclarar.
- El pipeline declarado (`feature-extraction`) contradice la naturaleza generativa del modelo, lo que puede causar confusión al integrarlo en aplicaciones.
- No se han publicado evaluaciones de seguridad, robustez o rendimiento en tareas específicas. Su uso en producción requiere validación previa.
- El contexto de 16k es una mejora sobre los 4096 del modelo base, pero inferior a alternativas como Llama-3.2-1B (128k) o Qwen2.5-1.5B (32k).
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente y poco probado por la comunidad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ali-elganzory/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k)
- [Modelo base open-sci-ref](https://huggingface.co/open-sci/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096)
- [Variante con DPO-Tulu3](https://huggingface.co/ali-elganzory/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-DPO-Tulu3-decontaminated)
- [Variante con SFT-Tulu3](https://huggingface.co/ali-elganzory/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-SFT-Tulu3-decontaminated)
- [Ficha en LLM Explorer](https://llm-explorer.com/model/ali-elganzory%2Fopen-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-4096-longsft_16k,3Ep0w9CW9f1msgMaizmQ0f)
- [Repositorio GitHub relacionado (contenido no verificado)](https://github.com/Damacol/ali-elganzory-open-sci-ref-v0.02-1.7b-dclm-300b-4096-longsft_16k-dpo-tulu3-decontaminated)
