# mradermacher/Qwen3.8-27B-Heretic-NoRefusal-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-Heretic-NoRefusal-GGUF` es una cuantización en formato GGUF del modelo `sss22213/Qwen3.8-27B-Heretic-NoRefusal`, un fine-tune no oficial del modelo base Qwen3.8-27B de Alibaba. El nombre sugiere que se trata de una variante sin mecanismos de rechazo (NoRefusal) y con un ajuste orientado a respuestas sin restricciones ("Heretic"), aunque no se dispone de documentación pública sobre el proceso de fine-tuning ni sus datos de entrenamiento.

El modelo base Qwen3.8-27B es un modelo denso de 27 mil millones de parámetros con una arquitectura híbrida de atención: combina capas de atención completa con capas de atención lineal (Gated DeltaNet), lo que reduce el coste computacional y permite ventanas de contexto largas. Esta versión GGUF está pensada para su despliegue en entornos locales con herramientas como llama.cpp, Ollama o vLLM, y ofrece múltiples niveles de cuantización para adaptarse a distintos requisitos de hardware.

La relevancia de este modelo radica en que permite ejecutar un LLM de 27B en GPUs de consumo con cuantización, y su carácter "sin rechazos" lo hace atractivo para casos de uso donde se requiere generación sin filtros, aunque con los riesgos éticos y legales asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 16 capas de atención completa + 48 capas de atención lineal (Gated DeltaNet) sobre 64 capas totales |
| Parametros totales | 26.895.998.464 (dato real de safetensors del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3.8-27B soporta contexto largo, pero no se especifica el valor exacto en la información proporcionada) |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | No disponibles (el modelo base Qwen3.8 soporta múltiples idiomas, pero no se detalla) |
| Licencia | No disponible (el modelo base Qwen3.8-27B es Apache 2.0, pero el fine-tune no especifica licencia) |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B, desarrollado por Alibaba, emplea una arquitectura híbrida de atención que combina 16 capas con atención completa (full attention) y 48 capas con atención lineal basada en Gated DeltaNet, con un estado recurrente constante. Esta mezcla reduce la complejidad computacional de O(n²) a O(n) en la mayoría de las capas, permitiendo manejar secuencias largas con menor uso de memoria y mayor velocidad de inferencia. El modelo tiene 64 capas en total, un tamaño oculto de 5.120 y un vocabulario de 248.320 tokens.

El fine-tune `Heretic-NoRefusal` no cuenta con documentación pública sobre su proceso de entrenamiento. No se conocen los datos utilizados, si se aplicó RLHF, DPO u otras técnicas de alineación, ni el número de tokens de entrenamiento. La cuantización GGUF fue realizada por mradermacher, quien generó estáticamente los archivos a partir del modelo original en formato safetensors, sin modificar los pesos más allá de la cuantización.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.8-27B, hereda capacidades de comprensión y generación de lenguaje natural, razonamiento lógico y matemático, aunque no se dispone de benchmarks específicos para esta variante.
- Generación de código: el modelo base Qwen3.8-27B es competente en tareas de programación, y esta versión GGUF mantiene esas capacidades, aunque sin garantías.
- Soporte de tool calling y function calling: no se ha confirmado explícitamente para este fine-tune, pero el modelo base Qwen3.8-27B incluye soporte para llamadas a herramientas, por lo que es probable que se conserve.
- Capacidades multilingües: el modelo base soporta múltiples idiomas, pero no se especifica cuáles ni el grado de competencia en esta variante.
- Sin mecanismos de rechazo: el nombre "NoRefusal" indica que el modelo está ajustado para no rechazar peticiones, lo que implica que generará respuestas incluso ante solicitudes que normalmente serían bloqueadas por políticas de seguridad.
- Formato GGUF: permite ejecución en CPU y GPU con herramientas como llama.cpp, Ollama y vLLM, con diferentes niveles de cuantización para ajustar precisión y consumo de memoria.

## Casos de uso

- Generación creativa sin restricciones: escritores y artistas pueden usar el modelo para explorar narrativas o diálogos que otros modelos rechazarían por contenido sensible, gracias a su ajuste "NoRefusal".
- Investigación en alineación y seguridad: investigadores pueden estudiar el comportamiento de un modelo sin filtros para analizar sesgos, riesgos de alucinación y efectos de la falta de alineación.
- Desarrollo de asistentes de código en entornos aislados: con soporte de tool calling (si se conserva), puede integrarse en pipelines de generación de código donde se requiera flexibilidad sin restricciones de contenido.
- Simulación de conversaciones difíciles: en entornos de pruebas, puede usarse para generar respuestas a preguntas delicadas o provocativas, útil para entrenar sistemas de moderación.
- Despliegue local en hardware modesto: gracias a las cuantizaciones Q4_K_S o Q2_K, puede ejecutarse en GPUs de consumo como RTX 3060 o RTX 4060 con 8-12 GB de VRAM, permitiendo prototipado rápido sin depender de APIs externas.
- Evaluación de robustez: los desarrolladores pueden probar cómo responde el modelo ante prompts adversariales o de doble sentido, comparándolo con versiones alineadas para medir diferencias en seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este fine-tune específico. El modelo base Qwen3.8-27B tiene resultados públicos (por ejemplo, en el repositorio oficial de Qwen), pero no se pueden atribuir a esta variante sin verificación.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para Q4_K_S (aproximadamente 16 GB de pesos), se necesitan al menos 16-18 GB de VRAM para contexto corto; Q2_K (~10 GB) puede caber en GPUs de 12 GB; Q8_0 (~28 GB) requiere GPUs de 32 GB o más.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_S o Q5_K_M; A100 40 GB o H100 para Q8_0 o f16; GPUs de 12 GB (RTX 3060/4070) solo con Q2_K o IQ4_XS y contexto reducido.
- Si cabe en consumer GPU: sí, con cuantizaciones bajas (Q2_K, Q3_K_M, IQ4_XS) en GPUs de 12-16 GB, aunque con pérdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), text-generation-webui, LM Studio.
- Latencia y throughput: no disponibles. Se estima que en una RTX 4090 con Q4_K_S, la generación puede alcanzar 20-40 tokens/s, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | No disponible (largo) | Apache 2.0 | safetensors | Modelo original de Alibaba, sin fine-tune |
| mradermacher/Qwen3.8-27B-Heretic-NoRefusal-GGUF | 27B | No disponible | No disponible | GGUF | Fine-tune sin rechazos, cuantizado |
| Llama 3.1 8B (para comparar tamaño menor) | 8B | 128K | Llama 3.1 License | safetensors/GGUF | Mucho menor, no comparable en capacidad |
| Qwen2.5 32B | 32B | 128K | Apache 2.0 | safetensors/GGUF | Alternativa de tamaño similar, pero sin fine-tune "NoRefusal" |

No se dispone de comparativas de rendimiento directas entre estas opciones para este fine-tune específico.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune sin documentación, no se conocen los sesgos específicos introducidos. El modelo base Qwen3.8-27B puede heredar sesgos de sus datos de entrenamiento, y el ajuste "NoRefusal" podría amplificar respuestas sesgadas o inapropiadas.
- Riesgo de alucinación: alto, especialmente en temas delicados, ya que el modelo no tiene mecanismos de rechazo y puede generar información falsa con confianza.
- Limitaciones de contexto e idioma: no se especifican; se asume que hereda las del modelo base, pero sin confirmación.
- Restricciones de licencia: la licencia del fine-tune no está declarada. El modelo base es Apache 2.0, pero el fine-tune podría tener restricciones adicionales. Se recomienda contactar al autor antes de uso comercial.
- Contenido inapropiado: el modelo puede generar contenido ofensivo, ilegal o dañino sin filtros. No es adecuado para aplicaciones orientadas al público general sin moderación externa.
- Producción: no se recomienda su uso en entornos de producción sin una evaluación exhaustiva de seguridad y cumplimiento legal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-NoRefusal-GGUF
- Modelo base (fine-tune original): https://huggingface.co/sss22213/Qwen3.8-27B-Heretic-NoRefusal
- Repositorio oficial de Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Página de vLLM Recipes para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Información de LLM Releases sobre Qwen3.8-27B: https://www.llm-releases.com/models/qwen3-8-27b
