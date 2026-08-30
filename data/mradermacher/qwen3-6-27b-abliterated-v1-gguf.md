# mradermacher/Qwen3.6-27B-abliterated-v1-GGUF

## Resumen
El modelo `mradermacher/Qwen3.6-27B-abliterated-v1-GGUF` es una colección de cuantizaciones GGUF del modelo `wangzhang/Qwen3.6-27B-abliterated-v1`, que a su vez es una versión "abliterada" (sin censura) del modelo base `Qwen/Qwen3.6-27B` desarrollado por Alibaba. La abliteración es una técnica de modificación de pesos que elimina los rechazos del modelo ante ciertas solicitudes, manteniendo en gran medida sus capacidades originales. Este repositorio ofrece los pesos en formato GGUF para su uso local con motores como llama.cpp, Ollama o LM Studio, facilitando la ejecución en hardware de consumo.

El modelo base Qwen3.6-27B es un transformer de 27 000 millones de parámetros con mejoras orientadas a razonamiento, codificación agéntica y preservación del pensamiento, según la información pública disponible. Sin embargo, la model card del repositorio no proporciona detalles técnicos adicionales (arquitectura exacta, longitud de contexto, licencia, etc.), por lo que gran parte de las especificaciones quedan sin confirmar. Este paquete GGUF es relevante para quienes buscan un modelo de gran tamaño sin restricciones de contenido, ejecutable localmente con distintas opciones de cuantización para ajustar el equilibrio entre calidad y requisitos de memoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
No se dispone de información oficial sobre la arquitectura interna del modelo base Qwen3.6-27B en los materiales proporcionados. Se sabe que es un modelo de 27 000 millones de parámetros, probablemente basado en una arquitectura transformer densa (no MoE), pero no se confirma. El proceso de abliteración aplicado por `wangzhang` consiste en la modificación de los pesos para suprimir las respuestas de rechazo, una técnica que no requiere entrenamiento adicional. El repositorio de `mradermacher` se limita a convertir los pesos originales (formato HuggingFace) a cuantizaciones GGUF mediante scripts estáticos, sin modificar el comportamiento del modelo más allá de la pérdida de precisión inherente a la cuantización.

Los datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO) no se han proporcionado en la información disponible. Tampoco hay detalles sobre innovaciones técnicas específicas como atención lineal, decodificación especulativa u otras mejoras.

## Capacidades
- Generación de texto en general, heredada del modelo base Qwen3.6-27B.
- Razonamiento complejo y codificación agéntica, según las descripciones públicas del modelo base.
- Preservación del modo de pensamiento (thinking mode) en tareas que lo requieren.
- Soporte de tool calling y function calling, presumiblemente, aunque no se confirma en la documentación del repositorio.
- Capacidades multilingües, no especificadas.
- Al ser una versión abliterada, el modelo no rechaza solicitudes que el modelo original podría bloquear, lo que permite explorar temas sensibles o creativos sin restricciones.

## Casos de uso
- Generación de ficción y narrativa creativa sin filtros temáticos: el modelo puede producir historias con contenido adulto o controvertido sin rechazos, útil para escritores que necesitan explorar escenarios no convencionales.
- Asistente de programación en entornos locales: gracias a su tamaño de 27B y a las cuantizaciones, puede ejecutarse en una GPU de gama alta (p. ej., RTX 4090) para ayudar con generación de código, refactorización o explicación de fragmentos.
- Investigación sobre alineación y seguridad de modelos: la versión abliterada permite estudiar cómo se comporta un modelo sin mecanismos de rechazo, sirviendo como banco de pruebas para técnicas de control.
- Chat conversacional sin restricciones en aplicaciones privadas: ideal para prototipos donde se desea una IA que no imponga límites éticos predefinidos.
- Análisis de texto y resumen de documentos extensos, si la longitud de contexto lo permite (dato no disponible).
- Desarrollo de agentes autónomos que requieren ejecutar múltiples pasos de razonamiento y llamadas a herramientas, aprovechando las capacidades agénticas del modelo base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para este modelo específico ni para su variante abliterada. Se recomienda consultar el repositorio del modelo base Qwen/Qwen3.6-27B para obtener datos de rendimiento del modelo original, aunque la abliteración puede alterar ligeramente los resultados.

## Requisitos de hardware
- VRAM estimada para inferencia según cuantización (para un modelo de ~27B de parámetros):
  - Q2_K: ~10-12 GB
  - Q3_K_M: ~13-15 GB
  - Q4_K_M: ~16-18 GB
  - Q5_K_M: ~19-21 GB
  - Q8_0: ~27-30 GB
  - f16: ~50-54 GB
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones Q4 o Q5; A100 40/80 GB o H100 para cuantizaciones superiores o f16.
- Sí, cabe en GPUs de consumo (24 GB) con cuantizaciones Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llamafile, o servidores compatibles con GGUF como llama-cpp-python. También puede usarse en vLLM si se convierte a otro formato, pero el repositorio solo ofrece GGUF.
- Latencia y throughput: dependen del hardware y de la cuantización. En una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generación de 20-40 tokens/s, aunque no hay datos oficiales.

## Comparativa con modelos similares
No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos abliterados de tamaño similar (p. ej., Llama 3.1 70B abliterado o Mistral Large abliterado). Los datos de rendimiento, contexto y licencia del modelo base no están disponibles en la documentación proporcionada. Se sugiere comparar directamente con el modelo original Qwen3.6-27B (sin abliterar) para evaluar el impacto de la técnica.

## Limitaciones y advertencias
- La abliteración elimina los mecanismos de rechazo, lo que puede generar contenido ofensivo, ilegal o peligroso. El uso debe realizarse con responsabilidad y bajo tu propio riesgo.
- No se conocen los sesgos específicos del modelo, pero al ser una variante de Qwen, probablemente hereda los sesgos del modelo base (sesgos culturales, de género, etc.).
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados.
- La longitud de contexto no está documentada; si es inferior a lo esperado, los documentos largos o conversaciones extensas pueden fallar.
- La licencia es desconocida, por lo que no se garantiza el uso comercial. Se debe contactar con el autor original (Qwen) para aclarar los términos.
- No se proporcionan instrucciones de uso específicas ni ejemplos de código en la model card.

## Enlaces
- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/mradermacher/Qwen3.6-27B-abliterated-v1-GGUF
- Modelo base abliterado (fuente): https://huggingface.co/wangzhang/Qwen3.6-27B-abliterated-v1
- Modelo original Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio GGUF de una variante similar (Huihui): https://huggingface.co/mradermacher/Huihui-Qwen3.6-27B-abliterated-GGUF
- Artículo sobre abliteración de Qwen3.6-27B: https://nathan.sapwell.net/posts/qwen36-27b-abliteration/
- Página en Ollama para Qwen3.6 abliterado: https://ollama.com/huihui_ai/Qwen3.6-abliterated
- Guía de modelos abliterados: https://locallyuncensored.com/blog/abliterated-models-guide.html
