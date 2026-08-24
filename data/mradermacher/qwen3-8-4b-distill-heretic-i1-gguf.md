# mradermacher/Qwen3.8-4B-Distill-heretic-i1-GGUF

## Resumen

Qwen3.8-4B-Distill-heretic-i1-GGUF es una cuantización GGUF del modelo valiolla/Qwen3.8-4B-Distill-heretic, preparada por mradermacher. El modelo base es una versión destilada de la familia Qwen3.8, entrenada a partir de los traces de razonamiento de un modelo profesor de 2,4 billones de parámetros, y posteriormente sometida a un proceso de eliminación automática de censura mediante la herramienta Heretic. El resultado es un modelo de 4B parámetros optimizado para razonamiento y function calling, sin los filtros de seguridad habituales.

Esta ficha cubre la variante cuantizada con imatrix, que permite ejecutar el modelo en hardware de consumo con pérdida mínima de calidad. Es relevante para desarrolladores que necesitan un modelo de razonamiento compacto, desplegable en local, con licencia Apache 2.0 y sin restricciones de censura, aunque con las advertencias éticas y legales que ello conlleva.

La arquitectura es un transformer decoder con atención estándar, y el contexto máximo está disponible en la ficha técnica. El modelo se distribuye en formato GGUF, compatible con llama.cpp y sus derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (dense) |
| Parametros totales | 897,27 M (según safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (imatrix y estático) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-4B-Distill-heretic es una destilación de la familia Qwen3.8, donde un modelo profesor de 2,4 billones de parámetros genera cadenas de razonamiento paso a paso que se utilizan para entrenar a un estudiante de 4B mediante aprendizaje por imitación. Este enfoque permite transferir capacidades de razonamiento complejo a un modelo mucho más pequeño y ejecutable en hardware de consumo.

Posteriormente, se aplicó el procedimiento de eliminación de censura Heretic, que identifica y elimina los comportamientos de rechazo aprendidos durante el SFT. El resultado es un modelo que no aplica filtros de seguridad a sus respuestas, lo que debe tenerse en cuenta para su uso en producción.

El proceso de cuantización realizado por mradermacher emplea imatrix (importance matrix) para calcular las cuantizaciones, lo que permite obtener una mayor calidad de los pesos cuantizados respecto a los métodos estáticos. No se dispone de información sobre el volumen de datos de entrenamiento ni sobre el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multi-paso: el modelo está destilado para producir cadenas de razonamiento (chain-of-thought) antes de responder.
- Soporte de function calling / tool calling: el modelo incluye soporte para invocar herramientas externas.
- Capacidades multilingües: solo se declara inglés (en).
- Modelo des-censurado: mediante la herramienta Heretic se han eliminado los comportamientos de rechazo aprendidos, lo que permite respuestas sin filtros de seguridad.
- Capacidad de visión: la model card indica que es un modelo de visión (vision model), aunque los ficheros mmproj se encuentran en el repositorio estático.

## Casos de uso

- Asistentes de programación locales: el modelo puede generar y explicar código, y gracias a su soporte de function calling puede integrarse en herramientas de autocompletado o agentes de desarrollo que ejecuten herramientas de forma autónoma.
- Chatbots de atención al cliente sin censura: su capacidad de razonamiento y su naturaleza des-censurada lo hacen adecuado para escenarios donde se requiere responder sin restricciones temáticas, siempre que se cumplan las obligaciones legales.
- Automatización de tareas de investigación: el modelo puede razonar sobre documentos largos y generar resúmenes o respuestas complejas, aunque la ventana de contexto no está especificada.
- Prototipado de agentes autónomos: con soporte de function calling y razonamiento multi-paso, es adecuado para construir agentes que interactúan con APIs y toman decisiones.
- Despliegue en edge / dispositivos de bajo consumo: al ser un modelo de 4B cuantizado en GGUF, puede ejecutarse en CPU o GPU de baja gama.
- Educación y experimentación: su licencia Apache 2.0 permite usarlo para investigación y docencia sin costes de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para cuantizaciones de 4 bits (Q4_K_M, IQ4_XS), el modelo ocupa aproximadamente 2-3 GB, por lo que es ejecutable en GPU de 4 GB o menos.
- GPU recomendadas: cualquier GPU con 4 GB de VRAM (GTX 1650, RTX 3050) es suficiente para las cuantizaciones más bajas; para las cuantizaciones Q6_K o superiores se recomienda 6-8 GB de VRAM.
- Compatibilidad con consumer GPU: sí, gracias al formato GGUF.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con adaptador GGUF), etc.
- Latencia y throughput: no se han publicado datos específicos; en una GPU moderna (RTX 4090) se puede esperar una latencia de decodificación de aproximadamente 10-20 tokens/s para cuantizaciones Q4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3.8-4B-Distill-heretic (este) | 4B (897 M activos) | No disponible | Apache 2.0 | GGUF |
| Qwen3-4B | 4B | 32K | Apache 2.0 | Safetensors |
| Llama-3.2-3B | 3B | 128K | Llama 3.2 Community License | Safetensors, GGUF |
| Gemma-2-2B | 2B | 8K | Gemma Terms | Safetensors, GGUF |

No se dispone de datos de benchmark comparativos en la información proporcionada.

## Limitaciones y advertencias

- El modelo ha sido desprovisto de filtros de seguridad, por lo que puede generar contenido dañino, ilegal o inapropiado. Su uso en producción debe evaluarse con cuidado y con responsabilidad legal.
- La ventana de contexto no está verificada en la información disponible; se recomienda probar con secuencias largas.
- El modelo solo soporta inglés; no está preparado para otros idiomas.
- No se han publicado resultados de benchmarks ni evaluaciones de calidad en la información disponible.
- El proceso de destilación y de eliminación de censura puede haber afectado a la calidad en tareas complejas; se recomienda validar el rendimiento en casos de uso concretos.

## Enlaces

- Repositorio de cuantizaciones (este modelo): https://huggingface.co/mradermacher/Qwen3.8-4B-Distill-heretic-i1-GGUF
- Repositorio estático de cuantizaciones: https://huggingface.co/mradermacher/Qwen3.8-4B-Distill-heretic-GGUF
- Modelo base: https://huggingface.co/valiolla/Qwen3.8-4B-Distill-heretic
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Repositorio de modelos de la serie Qwen3.8 destilados: https://github.com/47thtechcorner/RayCodes_Qwen3.8Distilled
