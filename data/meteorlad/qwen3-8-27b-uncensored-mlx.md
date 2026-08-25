# meteorlad/Qwen3.8-27B-Uncensored-MLX

## Resumen

Qwen3.8-27B-Uncensored-MLX es una conversión al formato MLX del modelo Qwen/Qwen3.8-27B de Alibaba, publicada por el usuario meteorlad (vinculado a OrcaRouter). Se trata de una versión "abliterada": se ha eliminado la dirección de rechazo (refusal direction) del flujo residual mediante ortogonalización, de modo que el modelo ya no se niega a responder a peticiones que el original rechazaría. Está pensado exclusivamente para investigación en seguridad de IA, interpretabilidad, red-teaming y evaluación de robustez, no para despliegue en producción sin capas de moderación adicionales.

El modelo base es un transformer denso de 27 000 millones de parámetros con atención híbrida (Gated DeltaNet lineal más atención completa), capacidades nativas de visión-lenguaje, control de pensamiento (thinking mode), tool calling y una cabeza MTP (multi-token prediction). Esta versión MLX ofrece cuantizaciones de 2, 4, 6 y 8 bits para Apple Silicon, manteniendo la torre de visión, las normas y las capas convolucionales en BF16. El contexto declarado es de 262 144 tokens. La licencia es Apache 2.0, heredada del modelo base.

La relevancia de esta ficha radica en que combina tres aspectos poco habituales: un modelo multimodal de 27B con ventana de contexto muy larga, una eliminación deliberada de la alineación de seguridad y un formato optimizado para hardware Apple. Su uso legítimo se limita a entornos controlados de investigación; cualquier otro uso conlleva riesgos legales y éticos importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (Gated DeltaNet lineal + atención completa), visión-lenguaje, cabeza MTP |
| Parametros totales | 27 000 millones (declarados por el modelo base); el safetensors del repo muestra 4 665 462 000, posiblemente parcial o con pesos compartidos |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (declarado en la model card) |
| Tipos de cuantizacion | MLX affine con grupo de tamaño 64: 2-bit, 4-bit, 6-bit, 8-bit; la torre de visión, normas y capas convolucionales en BF16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors), con subcarpetas por cuantización; la raíz del repo contiene la versión 4-bit |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer densa con una capa de atención híbrida: combina Gated DeltaNet (una capa lineal recurrente con compuertas) con atención completa, lo que permite manejar secuencias largas de forma más eficiente que la atención estándar. Incluye una cabeza de predicción multi-token (MTP) que acelera la decodificación al predecir varios tokens a la vez. El modelo es nativamente multimodal: acepta imágenes y texto, y genera texto. Soporta control de pensamiento (modo razonamiento explícito) y tool calling.

El proceso de "abliteration" aplicado por el autor consiste en identificar la dirección de rechazo en el flujo residual del modelo y ortogonalizarla, de forma que el modelo pierde la capacidad de negarse a responder. No se ha realizado ningún entrenamiento adicional; es una modificación post-entrenamiento sobre los pesos originales. Los datos de entrenamiento del modelo base no se detallan en la información disponible, pero se sabe que Qwen3.8-27B fue entrenado por Alibaba con un corpus multilingüe (inglés y chino principalmente) y posteriormente alineado mediante técnicas de refuerzo. Esta versión abliterada revierte parcialmente esa alineación.

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades lingüísticas del modelo base, incluyendo razonamiento multi-paso y modo de pensamiento explícito.
- Comprensión de imágenes: la torre de visión se conserva en BF16, por lo que puede procesar imágenes y responder preguntas sobre ellas (image-text-to-text).
- Tool calling / function calling: soportado, lo que permite integrarlo en flujos de agentes que invocan herramientas externas.
- Ventana de contexto larga: 262 144 tokens, adecuada para documentos extensos, conversaciones multi-turno o análisis de código grande.
- Multilingüe: inglés y chino, con posible transferencia a otros idiomas no verificada.
- Sin rechazos: debido a la abliteración, el modelo no se niega a responder a peticiones dañinas, ilegales o poco éticas. Esta es una capacidad intencionada, pero solo para investigación.
- Decodificación con MTP: la cabeza de predicción multi-token puede mejorar el throughput en inferencia.

## Casos de uso

- Investigación en interpretabilidad de modelos: estudiar cómo la abliteración afecta a la representación interna de la seguridad y a los mecanismos de rechazo. Se usaría el modelo en entornos de análisis de activaciones y probing.
- Red-teaming de sistemas de moderación: generar respuestas que evadan filtros de contenido para evaluar la robustez de los sistemas de seguridad de terceros. El modelo sirve como generador de ataques controlados.
- Evaluación de guardarraíles: probar capas de moderación externas (filtros de contenido, clasificadores de toxicidad) con un modelo que no coopera con la seguridad, midiendo su eficacia ante entradas adversarias.
- Estudio de sesgos y alucinaciones en modelos sin alineación: comparar las respuestas de esta versión con las del modelo original para cuantificar el efecto de la alineación en la veracidad y el sesgo.
- Desarrollo de técnicas de desabliteración inversa: investigar cómo restaurar la seguridad en modelos abliterados, un área activa en seguridad de IA.
- Evaluación de robustez de agentes autónomos: dado que el modelo conserva tool calling y visión, se puede usar en entornos sandbox para probar si un agente con acceso a herramientas puede ser manipulado para realizar acciones dañinas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni otras pruebas estandar. Se recomienda consultar la ficha del modelo base Qwen/Qwen3.8-27B para obtener datos de rendimiento de referencia, teniendo en cuenta que la abliteración puede alterar el comportamiento en tareas que requieren seguir instrucciones de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: según la tabla de cuantizaciones, 8-bit ocupa ~27,5 GB, 6-bit ~22 GB, 4-bit ~15 GB y 2-bit ~8,7 GB. Estos tamaños corresponden a los pesos; la memoria total necesaria será mayor al añadir los estados de la atención y el contexto.
- GPU recomendadas: al ser formato MLX, está optimizado para Apple Silicon (M1, M2, M3, M4 y sucesores). No está pensado para GPUs NVIDIA; para esas plataformas existen versiones GGUF o FP8 del mismo modelo abliterado.
- RAM mínima del Mac: 32 GB para 8-bit, 24-32 GB para 6-bit, 24 GB para 4-bit y 16 GB para 2-bit, según la model card.
- Si cabe en consumer GPU: no aplica directamente, ya que MLX no se ejecuta en GPUs de consumo convencionales. Para GPUs NVIDIA se necesitaría la versión GGUF o FP8.
- Opciones de despliegue: LM Studio (carga directa desde la raíz del repo), MLX-LM, y cualquier herramienta compatible con MLX. Para entornos no Apple, usar las versiones GGUF con llama.cpp u Ollama.
- Latencia y throughput: no disponibles. La cabeza MTP puede mejorar la velocidad de decodificación, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | Original (PyTorch, etc.) | Modelo alineado, con rechazos |
| Qwen3.8-27B-Uncensored-MLX (este) | 27B | 262K | Apache 2.0 | MLX (2/4/6/8-bit) | Abliterado, sin rechazos, para Apple Silicon |
| Qwen3.8-27B-Uncensored-GGUF | 27B | 262K | Apache 2.0 | GGUF (F16, Q2_K a Q8_0) | Mismo abliterado, para llama.cpp/Ollama en GPUs NVIDIA |

No se dispone de datos de rendimiento comparativo entre estas versiones. La diferencia principal es el formato de pesos y la plataforma objetivo. El modelo base original es la referencia para medir el impacto de la abliteración.

## Limitaciones y advertencias

- Ausencia total de guardarraíles: el modelo cumplirá con peticiones de contenido dañino, ilegal, ofensivo o fraudulento. No debe desplegarse en producción sin una capa de moderación externa robusta.
- Riesgo elevado de alucinaciones y sesgos: al eliminar la alineación, el modelo puede generar afirmaciones falsas, difamatorias o sesgadas con total confianza.
- Ruido de cuantización: las versiones de 2-bit y, en menor medida, 4-bit, degradan la calidad de generación. La versión 2-bit es calificada por el autor como "severamente degradada" y solo apta para archivo.
- Superficie de ataque ampliada: al conservar visión, tool calling y contexto de 262K, los riesgos se extienden a la comprensión de imágenes y a usos agénticos autónomos.
- Restricciones de uso: la model card limita explícitamente el uso a investigación legítima (interpretabilidad, red-teaming, evaluación de robustez). Cualquier otro uso es responsabilidad del usuario.
- Licencia Apache 2.0: permite uso comercial, pero el autor declina toda responsabilidad por mal uso. Las leyes locales pueden restringir la distribución de contenido dañino.
- Idioma: solo se garantiza inglés y chino; el rendimiento en otros idiomas no está verificado.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento para esta versión concreta, lo que dificulta la comparación cuantitativa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/meteorlad/Qwen3.8-27B-Uncensored-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Espejo en HuggingFace (Zomi AI Labs): https://huggingface.co/zomiailabs/Qwen3.8-27B-Uncensored-MLX
- Espejo en HuggingFace (ynotelbon): https://huggingface.co/ynotelbon/Qwen3.8-27B-Uncensored-MLX
- Blog de OrcaRouter sobre la versión GGUF: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Guía de ejecución local (GGUF + llama.cpp): https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Repositorio GitHub con manual de despliegue local: https://github.com/newbdez33/qwen3.8
- Sitio web de OrcaRouter: https://www.orcarouter.ai
