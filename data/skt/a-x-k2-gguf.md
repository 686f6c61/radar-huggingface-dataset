# skt/A.X-K2-GGUF

## Resumen

A.X K2 es un modelo de lenguaje de gran escala desarrollado por SK Telecom (SKT-AI) como sucesor de A.X K1. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 688 mil millones de parámetros totales, de los cuales 33 mil millones se activan por token, lo que permite un equilibrio entre capacidad y eficiencia de inferencia. El modelo está diseñado como un modelo fundacional agéntico, orientado a tareas de razonamiento complejo y seguimiento de instrucciones, y se distribuye bajo licencia Apache 2.0.

Este repositorio en concreto contiene la versión cuantizada en formato GGUF del checkpoint original, que fue liberado en block-scaled FP8. El archivo proporcionado es una cuantización IQ4_XS de aproximadamente 345 GiB, pensada para su uso con llama.cpp y vLLM mediante forks específicos que añaden soporte para esta arquitectura. La relevancia de este modelo radica en su escala (688B) combinada con un número reducido de parámetros activos, lo que lo sitúa en la categoría de los MoE más grandes disponibles en código abierto, junto a alternativas como DeepSeek-V3.

El modelo soporta cinco idiomas (inglés, coreano, chino, japonés y español) y presenta un modo de razonamiento híbrido con capacidad de emitir trazas de pensamiento antes de responder, similar a otros modelos de razonamiento recientes. Aunque la información disponible no especifica la longitud de contexto, el diseño agéntico y el tamaño del modelo sugieren su idoneidad para tareas complejas de razonamiento multi-paso y uso de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) híbrida con razonamiento |
| Parametros totales | 689.771.336.960 (688B) |
| Parametros activos | 33B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS (único archivo GGUF) |
| Idiomas soportados | en, ko, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (IQ4_XS) |

## Arquitectura y entrenamiento

A.X K2 es un modelo MoE con 688B parámetros totales y 33B activos por token, entrenado desde cero como sucesor de A.X K1. El checkpoint original se liberó en block-scaled FP8, una técnica de cuantización por bloques que reduce el uso de memoria manteniendo precisión. La arquitectura incluye componentes específicos como proyecciones Gated Norm (`norm_gate_a/b.weight`), un indexador de atención dispersa (`indexer.proj.weight`) y un router MoE (`ffn_gate_inp.weight`), lo que indica un diseño híbrido que combina atención densa con mecanismos de selección dispersa.

El modelo está descrito como un "modelo fundacional agéntico", lo que implica un entrenamiento orientado a tareas de razonamiento y uso de herramientas, aunque no se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información disponible. El informe técnico (A_X_K2_Tech_Report.pdf) está disponible en el repositorio de GitHub, pero su contenido no se ha incluido en esta ficha.

## Capacidades

- Generación de texto en cinco idiomas: inglés, coreano, chino, japonés y español.
- Razonamiento híbrido con dos modos: modo "thinking" (emite una traza de pensamiento antes de la respuesta) y modo "non-thinking" (respuestas directas y concisas).
- Diseñado como modelo fundacional agéntico, lo que sugiere capacidades de razonamiento multi-paso y potencial soporte para uso de herramientas, aunque no se documentan detalles específicos de tool calling en la información proporcionada.
- Conversación multi-turno, como demuestra su integración en interfaces de chat compatibles con la API de OpenAI.
- Capacidad de desplegarse en servidores con API compatible con OpenAI (tanto en llama.cpp como en vLLM).
- Soporte para cuantización GGUF, lo que permite ejecución en CPU y GPU con frameworks compatibles.

## Casos de uso

- Razonamiento matemático y lógico avanzado: el modo de razonamiento híbrido con trazas de pensamiento permite abordar problemas complejos de lógica, matemáticas y análisis, adecuado para entornos de investigación o educación.
- Generación y depuración de código: aunque no se documenta explícitamente, su naturaleza agéntica y su escala lo hacen apto para tareas de programación asistida, generación de funciones y revisión de código en entornos de desarrollo.
- Asistentes conversacionales multilingües: con soporte para cinco idiomas, puede servir como base para chatbots de atención al cliente o asistentes virtuales en mercados asiáticos y de habla hispana, gestionando conversaciones multi-turno.
- Agentes autónomos con razonamiento multi-paso: su diseño agéntico permite construir pipelines de agentes que planifican, ejecutan y verifican tareas de forma secuencial, por ejemplo en automatización de procesos o análisis de datos.
- Traducción automática entre los idiomas soportados: dado su multilingüismo, puede emplearse para traducción de documentos técnicos o contenido web entre inglés, coreano, chino, japonés y español, aunque no se especifican métricas de calidad.
- Investigación académica en NLP: su disponibilidad en código abierto y su escala permiten a investigadores estudiar el comportamiento de MoE de gran tamaño, comparar arquitecturas o fine-tuning para tareas específicas.
- Análisis y resumen de documentos extensos: aunque la longitud de contexto no está especificada, el tamaño del modelo sugiere capacidad para procesar documentos largos, extraer información y generar resúmenes en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El informe técnico (A_X_K2_Tech_Report.pdf) está accesible en el repositorio de GitHub de SKT-AI, pero los datos concretos de rendimiento (MMLU, HumanEval, GSM8K, etc.) no se han incluido en esta ficha. Se recomienda consultar el informe técnico y la model card original para obtener métricas detalladas.

## Requisitos de hardware

- El archivo GGUF IQ4_XS ocupa 345 GiB, por lo que se requiere un mínimo de aproximadamente 370 GB de memoria (VRAM o RAM) para cargar el modelo en memoria, más espacio adicional para el contexto de inferencia.
- No es viable en GPUs de consumo: ninguna GPU consumer (RTX 4090 con 24 GB, por ejemplo) puede alojar este modelo. Se necesitan configuraciones multi-GPU de nivel profesional.
- GPUs recomendadas: al menos 8 GPUs A100 de 80 GB (640 GB totales) o 8 H100 de 80 GB para ejecutar el modelo con margen para contexto y overhead. Alternativamente, configuraciones con 4 GPUs de 96 GB (como H200) podrían ser suficientes, aunque no se confirma en la documentación.
- Opciones de despliegue: llama.cpp mediante el fork específico (rama `axk2-b10236`), que soporta tanto CLI como servidor con API OpenAI-compatible. También es posible usar vLLM con el fork `axk2-v0.23.0_gguf`, aunque el soporte GGUF en vLLM es experimental y menos optimizado.
- Latencia y throughput: no disponibles. Dado el tamaño del modelo y la cuantización, se espera una latencia elevada en comparación con modelos más pequeños, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. A.X K2 se puede encuadrar en la categoría de MoE de gran escala junto a modelos como DeepSeek-V3 (671B totales, 37B activos) o Qwen3-MoE, pero no se incluyen métricas de rendimiento ni especificaciones detalladas de estos modelos en esta ficha. La licencia Apache 2.0 de A.X K2 es permisiva para uso comercial, lo que lo diferencia de otros modelos con licencias más restrictivas, aunque esta afirmación no se basa en datos concretos de la información disponible.

## Limitaciones y advertencias

- El soporte de A.X K2 en GGUF es experimental: requiere forks específicos de llama.cpp y vLLM que no forman parte de las versiones oficiales, lo que puede limitar la estabilidad y el rendimiento.
- La cuantización IQ4_XS introduce pérdida de precisión respecto al checkpoint original en FP8, lo que puede afectar la calidad de las respuestas en tareas de alta sensibilidad.
- No se especifica la longitud de contexto, lo que dificulta evaluar su idoneidad para aplicaciones que requieran procesar documentos muy extensos o conversaciones de larga duración.
- El modelo es extremadamente grande (345 GiB en GGUF), lo que exige infraestructura de hardware costosa y no es accesible para la mayoría de desarrolladores individuales.
- No se documentan sesgos específicos ni riesgos de alucinación en la información proporcionada. Como todo LLM, existe riesgo de generar contenido incorrecto o sesgado, especialmente en dominios especializados.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos completos y las condiciones de la model card original para asegurar el cumplimiento.
- El modelo está diseñado principalmente para razonamiento y tareas agénticas; su rendimiento en tareas creativas o de generación libre no está documentado.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/skt/A.X-K2-GGUF
- Modelo original en HuggingFace: https://huggingface.co/skt/A.X-K2
- Colección A.X-K2 en HuggingFace: https://huggingface.co/collections/skt/ax-k2
- Repositorio de GitHub (SKT-AI/A.X-K2): https://github.com/SKT-AI/A.X-K2
- Informe técnico (PDF): https://github.com/SKT-AI/A.X-K2/blob/main/A_X_K2_Tech_Report.pdf
- Noticia de SK Telecom sobre A.X K2: https://news.sktelecom.com/en/3204
- Fork de llama.cpp con soporte A.X K2: https://github.com/cys4/llama.cpp
- Fork de vLLM con soporte A.X K2 GGUF: https://github.com/cys4/vllm_axk2/tree/axk2-v0.23.0_gguf
