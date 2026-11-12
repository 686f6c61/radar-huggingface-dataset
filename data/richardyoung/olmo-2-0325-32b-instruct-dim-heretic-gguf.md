# richardyoung/OLMo-2-0325-32B-Instruct-DiM-heretic-GGUF

## Resumen

OLMo-2-0325-32B-Instruct-DiM-heretic-GGUF es una cuantización en formato GGUF del modelo richardyoung/OLMo-2-0325-32B-Instruct-DiM-heretic, que a su vez deriva del OLMo 2 32B Instruct de AI2 (Allen Institute for AI). Se trata, por tanto, de una variante de la familia OLMo 2 —modelos abiertos de arquitectura transformer densa con 32.234.279.936 parámetros— sometida a un proceso de "abliteration" o "heretización" orientado a eliminar los mecanismos de rechazo y moderación del modelo original.

El modelo base intermedio incorpora además la técnica DiM (probablemente "Diff in the Middle" o similar, según la nomenclatura del autor), aunque no se dispone de documentación técnica detallada en la información proporcionada. El resultado es un modelo de 32B parámetros descensurado, publicado en formato GGUF para su uso con llama.cpp y Ollama, con licencia Apache 2.0 y acceso restringido (gated) en Hugging Face.

La relevancia de esta ficha radica en que combina tres elementos de interés para investigadores: un modelo base abierto y reproducible (OLMo 2), una modificación de alineamiento controvertida (abliteration) y un formato de despliegue eficiente en hardware de consumo (GGUF con cuantizaciones e imatrix). El repositorio tiene 19,5 GB y, en el momento de la consulta, cero descargas y cero likes, lo que sugiere una publicación muy reciente o de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de OLMo 2 32B Instruct de AI2) |
| Parametros totales | 32.234.279.936 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el OLMo 2 32B original soporta contextos largos, pero no se confirma aqui) |
| Tipos de cuantizacion | GGUF (multiples niveles de cuantizacion; el repo incluye imatrix). Niveles concretos no disponibles |
| Idiomas soportados | Ingles (segun tag `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp, Ollama) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del OLMo 2 32B Instruct de AI2: un transformer denso decoder-only con 32.234.279.936 parámetros. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las fases de alineamiento (RLHF/DPO/SFT) del modelo original, más allá de que se trata de un modelo "Instruct" y, por tanto, ajustado para seguir instrucciones.

Sobre las modificaciones específicas de esta variante, la información disponible es escasa. El sufijo "DiM-heretic" indica una intervención del autor (richardyoung) orientada a la "heretización" o abliteration: una técnica que modifica los pesos para suprimir la dirección de activación asociada al rechazo de peticiones, reduciendo la tendencia del modelo a declinar tareas. El componente "DiM" no está documentado en los metadatos. La cuantización se ha realizado presumiblemente con imatrix (matriz de importancia) para preservar la calidad en niveles bajos de bits, aunque no se detallan los parámetros exactos del proceso.

## Capacidades

- Generación de texto conversacional en inglés, con formato instruct (multi-turno).
- Razonamiento y respuesta a instrucciones heredadas del OLMo 2 32B Instruct.
- Generación de código y matemáticas (capacidades propias del modelo base, no verificadas específicamente en esta variante).
- Comportamiento descensurado: reducción de rechazos ante peticiones que el modelo original declinaría, como consecuencia del proceso de abliteration.
- Compatibilidad con llama.cpp y Ollama para inferencia local.
- Soporte de endpoints compatibles (tag `endpoints_compatible`), lo que sugiere integración con APIs tipo OpenAI.
- Capacidades de tool calling y agentes: no confirmadas en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los tags; no se confirman otros idiomas.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la abliteration sobre la tasa de rechazos, comparando respuestas con el OLMo 2 32B Instruct original en conjuntos de prompts sensibles. Es adecuado porque ofrece una contraparte "descensurada" del mismo modelo base.
- Evaluación de cuantizaciones GGUF: al publicarse con imatrix, sirve para medir la degradación de calidad entre niveles de cuantización en un modelo de 32B, usando benchmarks de razonamiento y generación de código.
- Despliegue local en estaciones de trabajo: con llama.cpp u Ollama, el modelo puede ejecutarse en GPUs de consumo con cuantizaciones de 4-5 bits, útil para prototipado offline sin dependencia de APIs.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido narrativo donde el modelo original aplicaría filtros de contenido; el proceso heretic reduce esos bloqueos.
- Experimentos de destilación y fine-tuning: al ser Apache 2.0 y estar en GGUF, puede servir como base para investigación de ajuste fino (aunque el formato GGUF no es ideal para entrenamiento; requeriría reconvertir a safetensors desde el modelo base).
- Comparativas de robustez: estudiar cómo la abliteration afecta a la coherencia, la veracidad y la adherencia a instrucciones en tareas estándar (resumen, QA, código), midiendo la degradación respecto al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 32B en GGUF requiere aproximadamente 18-20 GB en cuantización Q4_K_M, 22-24 GB en Q5_K_M y 26-30 GB en Q6_K/Q8_0 (estimaciones estándar para 32B; no confirmadas en la información proporcionada).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para FP16/BF16; RTX 4090 (24 GB) para cuantizaciones Q4/Q5; RTX 3090 (24 GB) en el mismo rango.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones de 4-5 bits; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo con cuantizaciones muy agresivas (Q2/Q3) o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (p. ej., llama-cpp-python, text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa para este tamaño sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OLMo-2-0325-32B-Instruct-DiM-heretic-GGUF (este) | 32,2B | No disponible | Apache 2.0 | GGUF | Variante abliterated, acceso gated |
| OLMo 2 32B Instruct (AI2) | 32,2B | Contexto largo (no confirmado aquí) | Apache 2.0 | Safetensors | Modelo original alineado, sin abliteration |
| Qwen2.5 32B Instruct | 32,5B | 128K (según documentación pública de Qwen) | Apache 2.0 | Safetensors, GGUF | Alternativa densa de tamaño similar, multilingüe |
| Gemma 2 27B Instruct | 27B | 8K (según documentación pública de Google) | Gemma license | Safetensors, GGUF | Algo menor, licencia no Apache |

La comparación con Qwen2.5 32B y Gemma 2 27B se ofrece como referencia de categoría; no se dispone de datos de rendimiento de este modelo concreto para comparar benchmarks.

## Limitaciones y advertencias

- La abliteration puede degradar la coherencia, la veracidad y la adherencia a instrucciones del modelo original; no se han publicado evaluaciones que cuantifiquen esta degradación.
- Riesgo elevado de generar contenido dañino, ofensivo o inexacto al haberse suprimido los mecanismos de rechazo; no es adecuado para aplicaciones de cara al público sin filtros externos.
- Riesgo de alucinación inherente a los modelos de 32B, potencialmente agravado por la modificación de pesos.
- Soporte limitado al inglés según los metadatos; no se confirman capacidades multilingües.
- El acceso es restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la distribución.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante descensurada conlleva riesgos reputacionales y legales según la jurisdicción y el contexto de aplicación.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria ni informes de calidad independientes.
- La información sobre el proceso DiM y los detalles exactos de la cuantización no está documentada en los metadatos disponibles.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-DiM-heretic-GGUF
- Modelo base intermedio: https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-DiM-heretic
- OLMo 2 32B Instruct de AI2 (referencia del modelo original): no disponible en la información proporcionada (se puede localizar en el hub de AI2 en Hugging Face)
- Repositorio de llama.cpp: no disponible en la información proporcionada
- Ollama: no disponible en la información proporcionada
