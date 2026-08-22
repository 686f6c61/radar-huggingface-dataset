# Donee/Qwen3.8-27B-Uncensored-MLX

## Resumen

Qwen3.8-27B-Uncensored-MLX es una versión *abliterada* (eliminación de la dirección de rechazo en el flujo residual) del modelo Qwen/Qwen3.8-27B, publicada por el usuario Donee y asociada a la plataforma OrcaRouter. El modelo base es un transformer denso de 27.000 millones de parámetros con atención híbrida (Gated DeltaNet lineal + atención completa), diseñado como modelo nativo de visión-lenguaje con control de pensamiento, tool-calling y cabeza MTP (multi-token prediction). Esta variante se distribuye en formato MLX, cuantizada en cuatro precisiones (2, 4, 6 y 8 bits) para ejecución en Apple Silicon.

La relevancia de este modelo radica en su doble naturaleza: por un lado, conserva las capacidades multimodales y de razonamiento del Qwen3.8-27B original (incluyendo una ventana de contexto de 262.000 tokens); por otro, al haber sido sometido a abliteración, ha perdido sustancialmente su alineamiento de seguridad, por lo que responde a peticiones que el modelo original rechazaría. Está pensado exclusivamente para investigación en seguridad de IA, interpretabilidad, red-teaming y evaluación de robustez, y no para despliegue en producción sin capas de moderación adicionales.

La licencia es Apache 2.0, heredada del modelo base, y los idiomas soportados son inglés y chino. El repositorio incluye subcarpetas para cada cuantización, con la versión de 4 bits también en la raíz para facilitar la carga directa en herramientas como LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (Gated DeltaNet lineal + atención completa), cabeza MTP, torre de visión nativa |
| Parametros totales | 27.000 millones (según model card); el archivo safetensors del repo indica 4.665.462.000, posiblemente correspondiente a pesos cuantizados o a un subconjunto |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | MLX affine con group size 64: 2-bit, 4-bit, 6-bit, 8-bit; torre de visión, normas y capas conv en BF16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors); también existen versiones GGUF y FP8 según fuentes externas |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer densa con atención híbrida: combina una capa de atención lineal Gated DeltaNet con atención completa, lo que reduce el coste computacional en contextos largos manteniendo la capacidad de recuperación de información. Incluye una cabeza MTP (multi-token prediction) que predice varios tokens por paso, mejorando la eficiencia de decodificación. La torre de visión está integrada de forma nativa, permitiendo entrada de imágenes junto con texto.

El proceso de abliteración aplicado sobre este modelo consiste en ortogonalizar la dirección de rechazo del flujo residual, eliminando de forma efectiva los mecanismos de negativa del modelo original. No se han publicado detalles sobre el dataset de entrenamiento del modelo base ni sobre el proceso exacto de abliteración en la información disponible. La cuantización a MLX se realizó con cuantización afina de grupo 64, manteniendo la torre de visión, las normas y las capas convolucionales en BF16 para preservar la calidad perceptiva.

## Capacidades

- Generación de texto y razonamiento multi-step con control de "thinking mode" (modo de pensamiento activable o desactivable).
- Comprensión de imágenes (visión-lenguaje): puede procesar imágenes y responder preguntas sobre su contenido.
- Tool calling / function calling: soporta invocación de herramientas externas, lo que permite integración en agentes.
- Capacidades de agente: al conservar el contexto largo (262K tokens) y el tool-calling, puede ejecutar tareas multi-paso con memoria amplia.
- Multilingüe: inglés y chino.
- Capacidad de red-teaming: al estar abliterado, responde a peticiones que el modelo original rechazaría, lo que lo hace útil para evaluar guardarraíles y mecanismos de seguridad.
- Decodificación eficiente gracias a la cabeza MTP y a la atención híbrida.

## Casos de uso

- Investigación en interpretabilidad de modelos: analizar cómo la abliteración afecta a la representación interna de la negativa y qué direcciones del espacio latente codifican el rechazo.
- Evaluación de guardarraíles y moderación: probar sistemas de filtrado de contenido ante peticiones maliciosas, usando este modelo como generador de entradas adversarias.
- Red-teaming de sistemas de IA: generar ataques de jailbreak y medir la robustez de otros modelos o de capas de seguridad externas.
- Estudio de sesgos y alucinaciones: examinar cómo un modelo sin alineamiento produce afirmaciones falsas o sesgadas, y comparar con la versión alineada.
- Desarrollo de capas de seguridad personalizadas: investigar cómo añadir moderación post-hoc a un modelo sin guardarraíles, por ejemplo mediante clasificadores de contenido o filtros de salida.
- Evaluación de cuantización en Apple Silicon: medir el impacto de las cuantizaciones de 2, 4, 6 y 8 bits en la calidad de generación y en el rendimiento de inferencia en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones cuantitativas con el modelo base o con otras variantes. Se recomienda consultar la documentación del Qwen3.8-27B original para obtener referencias de rendimiento del modelo sin abliterar.

## Requisitos de hardware

- Inferencia en Apple Silicon mediante MLX. Memoria RAM mínima según cuantización:
  - 8-bit: ~27,5 GB de pesos, mínimo 32 GB de RAM.
  - 6-bit: ~22 GB de pesos, mínimo 24-32 GB de RAM.
  - 4-bit: ~15 GB de pesos, mínimo 24 GB de RAM.
  - 2-bit: ~8,7 GB de pesos, mínimo 16 GB de RAM (calidad severamente degradada, solo archivado).
- GPU recomendadas: cualquier Mac con chip M-series (M1, M2, M3, M4) con suficiente memoria unificada; para 8-bit se recomienda al menos 32 GB, para 4-bit 24 GB.
- No está pensado para GPUs NVIDIA de consumo directamente, aunque existen versiones GGUF y FP8 (según fuentes externas) que podrían ejecutarse con llama.cpp o vLLM en hardware CUDA.
- Opciones de despliegue: MLX (Apple Silicon), LM Studio (carga directa del repo raíz con 4-bit), vLLM (para versiones FP8/GGUF), llama.cpp (para GGUF).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | Original (BF16) | Modelo alineado, con guardarraíles |
| Qwen3.8-27B-Uncensored-MLX (este) | 27B | 262K | Apache 2.0 | MLX (2/4/6/8-bit) | Abliterado, sin guardarraíles, para Apple Silicon |
| Qwen3.8-27B AEON Uncensored | 27B | 262K | Apache 2.0 | vLLM/FP8 | Otra abliteración con metodología KL-drift (según blog de MindStudio) |

No se dispone de datos de rendimiento comparativos entre estas variantes. La principal diferencia entre este modelo y el base es la eliminación de la negativa, no un cambio arquitectónico.

## Limitaciones y advertencias

- El modelo ha sido sometido a abliteración, por lo que ha perdido sustancialmente su alineamiento de seguridad: cumplirá con peticiones dañinas, ilegales o poco éticas que el modelo original rechazaría.
- No tiene guardarraíles integrados. Cualquier despliegue en producción requiere capas externas de moderación, filtrado y prevención de abusos.
- Riesgo elevado de generar contenido falso, difamatorio, sesgado u ofensivo, presentado con apariencia de autoridad.
- La cuantización de 2 bits degrada severamente la calidad de generación (bucles de repetición, salida incoherente); se recomienda usar 4 bits o superior.
- La ventana de contexto de 262K tokens, junto con las capacidades de visión y tool-calling, amplía la superficie de ataque: los riesgos se extienden a la comprensión de imágenes y al uso autónomo.
- Licencia Apache 2.0 permite uso comercial, pero el autor declina toda responsabilidad por uso indebido; el usuario asume toda responsabilidad legal y ética.
- Solo soporta inglés y chino; no se garantiza calidad en otros idiomas.
- No se han publicado benchmarks ni evaluaciones de rendimiento específicas para esta variante abliterada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Donee/Qwen3.8-27B-Uncensored-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub espejo: https://github.com/onurburak9/Qwen3.8-27B-Uncensored-MLX
- Blog de ExplainX sobre la build de OrcaRouter: https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
- Blog de MindStudio sobre abliteración AEON: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Sitio de OrcaRouter: https://www.orcarouter.ai
- Catálogo de modelos OrcaRouter: https://www.orcarouter.ai/models
