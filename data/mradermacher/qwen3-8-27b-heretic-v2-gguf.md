# mradermacher/Qwen3.8-27B-heretic-v2-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-heretic-v2-GGUF` es una cuantización en formato GGUF del modelo base `Umranz/Qwen3.8-27B-heretic-v2`, un modelo de lenguaje de 26.895.998.464 parámetros (aproximadamente 27B) con licencia Apache 2.0. El nombre "heretic" y las etiquetas "uncensored", "decensored" y "abliterated" indican que se trata de una versión modificada del modelo original Qwen3.8-27B, en la que se han eliminado o reducido los mecanismos de rechazo de contenido, buscando respuestas menos restrictivas. Esta cuantización permite ejecutar el modelo en hardware de consumo mediante herramientas como llama.cpp u Ollama, reduciendo los requisitos de VRAM frente a los pesos en precisión completa.

La relevancia de este modelo radica en su tamaño intermedio (27B) y su licencia permisiva, lo que lo hace atractivo para desarrolladores que necesitan un modelo potente pero desplegable en entornos con recursos limitados. Al ser una versión "abliterated", también interesa a quienes buscan explorar los límites de la generación de texto sin censura, aunque con las advertencias éticas y legales correspondientes. La cuantización está firmada por mradermacher, un conocido proveedor de conversiones GGUF, lo que garantiza compatibilidad con el ecosistema de inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base Qwen3.8-27B podría usar atención híbrida según fuentes externas, pero no confirmado) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (fuentes externas sugieren 262K tokens nativos, pero no confirmado) |
| Tipos de cuantizacion | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS (según la model card) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (incluye archivos mmproj para visión, si aplica) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna del modelo base. Se sabe que es una cuantización estática (sin imatrix) de `Umranz/Qwen3.8-27B-heretic-v2`, que a su vez deriva de Qwen3.8-27B. Las etiquetas "heretic", "uncensored", "decensored" y "abliterated" sugieren que se aplicó una técnica de "abliteration" (eliminación de capas o pesos relacionados con el rechazo de contenido) sobre el modelo original, pero no se especifica el método exacto ni los datos de entrenamiento adicionales. No hay información sobre el número de tokens de entrenamiento, composición del dataset o uso de RLHF/DPO. La cuantización fue realizada por mradermacher, quien indica que son "static quants" y que no hay versiones con imatrix por el momento.

## Capacidades

- Generación de texto en inglés: al ser un modelo de lenguaje de 27B, se espera capacidad de completar texto, responder preguntas y mantener conversaciones multi-turno, aunque no hay una lista oficial de capacidades en la model card.
- Posible soporte de visión: la model card incluye archivos `mmproj` (multi-modal projection) en f16 y Q8_0, lo que sugiere que el modelo base podría tener capacidades de comprensión de imágenes, aunque no se confirma su funcionamiento en esta cuantización.
- Sin información sobre tool calling, function calling o razonamiento multi-step: no se mencionan en la documentación proporcionada.
- Multilingüismo limitado: la etiqueta de idioma es solo "en", por lo que se espera un rendimiento óptimo en inglés.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo, al ser "uncensored", puede usarse para escribir ficción, guiones o diálogos que otros modelos rechazarían por contenido sensible. Es adecuado para prototipos de escritura creativa donde se requiere libertad temática.
- Chatbots de nicho con personalidad desinhibida: desarrolladores pueden integrar este modelo en asistentes conversacionales que necesiten respuestas directas y sin filtros, por ejemplo en entornos de investigación sobre interacción humano-máquina.
- Experimentación con técnicas de "abliteration": investigadores pueden comparar el comportamiento de este modelo frente a la versión original de Qwen3.8-27B para estudiar el impacto de eliminar mecanismos de rechazo.
- Inferencia local en hardware de consumo: gracias a las cuantizaciones GGUF (por ejemplo Q4_K_M), el modelo puede ejecutarse en GPUs con 12-16 GB de VRAM, permitiendo pruebas locales sin depender de APIs externas.
- Generación de código en entornos aislados: aunque no se confirma soporte específico para código, un modelo de 27B suele manejar tareas de programación básica; su licencia Apache 2.0 permite uso comercial en herramientas de desarrollo.
- Análisis de texto con contexto largo: si el modelo base realmente soporta 262K tokens de contexto (según fuentes externas), podría usarse para procesar documentos extensos, aunque esta capacidad no está verificada en la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, y no hay comparaciones con otros modelos en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para Q4_K_M (~15 GB), se necesitan al menos 16 GB de VRAM; para Q8_0 (~27 GB), se requieren 32 GB o más. La versión f16 (~54 GB) necesita una GPU profesional como A100 o H100.
- GPU recomendadas: RTX 4090 (24 GB) puede ejecutar cuantizaciones Q4 o Q5; A100 40 GB o H100 80 GB para precisiones mayores. En CPU, se puede usar llama.cpp con suficiente RAM (32 GB o más).
- Si cabe en consumer GPU: sí, con cuantizaciones Q4_K_M o Q5_K_M en GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF como llama-cpp-python. No se menciona soporte para vLLM o TGI en la documentación.
- Latencia y throughput: no disponibles. Dependerá del hardware y la cuantización; un modelo de 27B en Q4 en una RTX 4090 puede generar entre 10-20 tokens por segundo, pero es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base Qwen3.8-27B no tiene una ficha pública detallada en la información proporcionada, y no se conocen alternativas directas de la misma categoría (27B, GGUF, uncensored). Se podría comparar con otros modelos de 27B como Llama 3 8B (menor tamaño) o Mixtral 8x7B (MoE), pero no hay datos de rendimiento para establecer una comparación objetiva. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- Contenido sin censura: al ser "uncensored" o "abliterated", el modelo puede generar texto ofensivo, ilegal o peligroso. No debe usarse en aplicaciones de producción sin supervisión humana y filtros adicionales.
- Riesgo de alucinación: como todo LLM, puede inventar hechos o datos, especialmente en temas especializados. No verificado en esta versión.
- Idioma limitado: solo se garantiza inglés; el rendimiento en otros idiomas puede ser deficiente.
- Contexto no confirmado: aunque fuentes externas sugieren 262K tokens, la cuantización no garantiza que se mantenga esa longitud; es posible que se degrade con cuantizaciones agresivas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base "heretic-v2" podría tener restricciones adicionales no documentadas. Se recomienda revisar la licencia del modelo original.
- Sin soporte oficial: al ser una cuantización de un tercero, no hay garantías de mantenimiento o corrección de errores.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mradermacher/Qwen3.8-27B-heretic-v2-GGUF)
- [Modelo base: Umranz/Qwen3.8-27B-heretic-v2](https://huggingface.co/Umranz/Qwen3.8-27B-heretic-v2)
- [Página de resumen de mradermacher](https://hf.tst.eu/model#Qwen3.8-27B-heretic-v2-GGUF)
- [Guía de uso de GGUF de TheBloke](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF) (referencia para uso de archivos GGUF)
