# chevron7/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-oQ4e

## Resumen
DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-oQ4e es un fine-tune de la familia Qwen3.5, publicado por el usuario chevron7 sobre el modelo base Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B. Se trata de una destilación del razonamiento de DeepSeek-V4-Pro en modo Max Effect sobre un transformer denso de 9.409.813.744 parámetros, orientada a matemáticas y STEM, y posteriormente "abliterada" mediante la herramienta Heretic v2.0.0.dev0 para eliminar los rechazos del modelo original.

El interés de esta variante concreta reside en su doble naturaleza: por un lado, conserva el foco de razonamiento estructurado del fine-tune original, entrenado sobre aproximadamente 250.000 muestras de matemáticas y ciencia; por otro, aplica una ablación de rango arbitrario (ARA) sobre las capas 9 a 24 que reduce los rechazos de 100/100 a 3/100 en la evaluación declarada por el autor, con una divergencia KL de 0.0422 respecto al modelo base.

La relevancia actual es doble: demuestra hasta qué punto las técnicas de ablación de direcciones de activación permiten modificar el comportamiento de seguridad de un modelo sin reentrenar, y ofrece un punto de partida para quienes necesitan un modelo de 9B con razonamiento matemático y sin filtros de rechazo, a coste de asumir los riesgos legales y éticos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), con soporte de decodificación multi-token (MTP) evaluado |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (sufijo oQ4e del repo); el ecosistema Unsloth permite otras cuantizaciones, no detalladas |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento
El modelo base es un transformer denso de la familia Qwen3.5 con 9.409.813.744 parámetros. Sobre él, Jackrong aplicó una destilación de las respuestas generadas por DeepSeek-V4-Pro en modo Max Effect, concentrando la señal supervisada en matemáticas y STEM con aproximadamente 250.000 muestras. La model card menciona SFT, RL y GSPO (Group Sequence Policy Optimization) como parte del pipeline de post-entrenamiento del modelo base, así como una evaluación de decodificación especulativa mediante MTP y de cuantización NVFP4.

La variante aquí descrita añade una ablación de rango arbitrario (ARA) ejecutada con Heretic v2.0.0.dev0, que actúa sobre las capas 9 a 24 (start_layer_index 9, end_layer_index 24) con neighbor_count 12. Los pesos de la intervención son preserve_good_behavior_weight 0.8264, steer_bad_behavior_weight 0.0003 y overcorrect_relative_weight 0.9645. El resultado declarado es una reducción de rechazos de 100/100 a 3/100 con una divergencia KL de 0.0422 frente al modelo original, lo que indica una modificación moderada de la distribución de salida.

## Capacidades
- Generación de texto conversacional multi-turno en seis idiomas (inglés, chino, coreano, japonés, español y ruso).
- Razonamiento matemático y científico estructurado, con descomposición explícita de problemas en pasos.
- Razonamiento multi-paso (modo thinking) heredado de la destilación de DeepSeek-V4-Pro.
- Soporte de tool calling y function calling, según los tags del repositorio.
- Uso en agentes y flujos con llamadas a herramientas, aunque sin datos de entrenamiento específicos de código.
- Capacidad image-text-to-text declarada en los tags del pipeline, aunque la model card no detalla el soporte multimodal.
- Comportamiento "uncensored": ausencia casi total de rechazos ante peticiones que el modelo original declinaba.

## Casos de uso
- Resolución de problemas matemáticos y de física en entornos educativos: el modelo puede generar soluciones paso a paso aprovechando su entrenamiento sobre 250.000 muestras de STEM, útil para tutores automáticos o generación de material didáctico.
- Asistencia a investigación en dominios científicos: borradores de derivaciones, comprobación de cálculos y explicación de conceptos, con la ventaja de un tamaño de 9B que cabe en una sola GPU.
- Automatización de pipelines de razonamiento con tool calling: integración en agentes que consultan calculadoras, APIs o bases de datos científicas, gracias al soporte declarado de function calling.
- Generación de contenido sin filtros para investigación sobre seguridad de modelos: análisis de comportamiento, estudios de alineación y evaluación de técnicas de ablación, comparando este modelo con su base no modificada.
- Despliegue en local para prototipado rápido: con cuantización 4-bit y 9B de parámetros, es viable en GPUs de consumo, lo que facilita experimentación sin infraestructura en la nube.
- Traducción y asistencia multilingüe en seis idiomas: atención al cliente o documentación técnica en inglés, chino, coreano, japonés, español y ruso.
- Procesamiento de documentos con componentes visuales: el tag image-text-to-text sugiere capacidad de entrada de imagen y texto, aplicable a extracción de información de figuras o tablas, aunque sin documentación específica.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (Refusals) | 3/100 | 100/100 |
| Divergencia KL | 0.0422 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en 4-bit: aproximadamente 5-6 GB de pesos, más overhead de contexto y activaciones; en la práctica, 8-10 GB para contextos moderados.
- VRAM estimada en fp16: alrededor de 19 GB solo para pesos, lo que requiere GPUs de 24 GB o más.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para fp16; RTX 4070 Ti, RTX 4080 o GPUs de 12-16 GB para 4-bit; A100 o H100 para despliegue en producción con alto throughput.
- Cabe en GPU de consumo: sí, en 4-bit en tarjetas de 8-12 GB; en fp16 requiere gama alta de consumo o profesional.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama mediante conversión a GGUF; el repo incluye tag de compatibilidad con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-oQ4e) | 9,4B | No disponible | Apache 2.0 | Fine-tune STEM destilado y abliterado, 4-bit |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | No disponible | Apache 2.0 | Modelo base sin ablación, rechazos 100/100 |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | 4B (aproximado) | No disponible | No disponible | Versión reducida del mismo linaje, también abliterada |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | 9B (aproximado) | No disponible | No disponible | Fine-tune científico sobre la misma base |

## Limitaciones y advertencias
- La ablación elimina los rechazos de seguridad: el modelo puede generar contenido dañino, ilegal o éticamente problemático sin filtro, lo que traslada toda la responsabilidad al operador.
- La licencia Apache 2.0 permite uso comercial, pero no exime del cumplimiento de la normativa aplicable (por ejemplo, el AI Act europeo o las políticas de contenido de las plataformas).
- La divergencia KL de 0.0422 indica que el comportamiento general se conserva, pero puede haber degradación en tareas sensibles a la alineación original.
- Riesgo de alucinación inherente a los modelos de 9B, especialmente en matemáticas avanzadas y citas factuales.
- La longitud de contexto no está documentada, lo que impide garantizar ventanas largas en producción.
- El entrenamiento se centró en matemáticas y STEM; el rendimiento en código, derecho o humanidades puede ser inferior al de modelos generalistas del mismo tamaño.
- Los benchmarks estándar no están publicados, por lo que no hay evidencia cuantitativa de rendimiento frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- La capacidad image-text-to-text aparece en los tags pero no está documentada en la model card; conviene verificarla antes de usarla en producción.

## Enlaces
- Hugging Face: https://huggingface.co/chevron7/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-oQ4e
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Versión 4B: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune científico DeepThought: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic (herramienta de ablación): https://heretic-project.org
