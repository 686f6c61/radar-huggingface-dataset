# mradermacher/Qwen3.5-9B-Abliterated-HSAQ-v2-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo Qwen3.5-9B-Abliterated-HSAQ-v2, creado por el usuario mradermacher. Se trata de una versión "abliterated" (sin censura) del modelo Qwen3.5-9B, desarrollado por Alibaba. El término "abliterated" indica que se han eliminado los mecanismos de rechazo y las restricciones de seguridad entrenadas en el modelo original, permitiendo que responda a cualquier tipo de petición sin filtros. El modelo base fue publicado por MethodWhite en HuggingFace, y este repositorio ofrece las versiones cuantizadas en formato GGUF para su uso con llama.cpp, Ollama u otros motores compatibles.

La relevancia de este modelo radica en que ofrece una alternativa sin censura para desarrolladores que necesitan un LLM local con la capacidad de razonamiento y generación de texto del Qwen3.5-9B, pero sin las restricciones habituales. Sin embargo, esta característica implica un riesgo legal y ético importante, por lo que su uso debe limitarse a entornos controlados y legales. El tamaño real del modelo es de 7.053.783.552 parámetros (aproximadamente 7B), aunque el nombre indica 9B, probablemente por convención del fabricante original. El contexto máximo y otras especificaciones técnicas del modelo base no se han confirmado en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se espera transformer, pero no confirmado) |
| Parametros totales | 7.053.783.552 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible (se espera multilingüe, pero no confirmado) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen3.5-9B. Se sabe que es un modelo de lenguaje de gran escala de la familia Qwen, pero no se han publicado detalles sobre el número de capas, dimensiones de atención o tipo de atención. La técnica "abliterated" consiste en eliminar las capas o pesos responsables del comportamiento de rechazo y seguridad, probablemente mediante un proceso de poda o ajuste fino inverso. El modelo base fue entrenado con datos masivos en múltiples idiomas, aunque no se especifican el número de tokens ni la composición exacta del dataset. La versión abliterated no añade entrenamiento adicional; simplemente modifica los pesos originales para eliminar las respuestas de negativa.

## Capacidades

- Generación de texto libre sin restricciones de contenido: puede producir respuestas a peticiones que el modelo original rechazaría, incluyendo contenido explícito, violento o ilegal.
- Razonamiento y comprensión del lenguaje: hereda las capacidades del modelo base Qwen3.5-9B, aunque no se han documentado resultados específicos de esta versión.
- Soporte de tool calling y function calling: no confirmado, pero probablemente presente si el modelo base lo tenía.
- Capacidades multilingües: no confirmado, pero el modelo base Qwen suele soportar varios idiomas.
- No se dispone de información sobre soporte de visión, audio u otras modalidades.

## Casos de uso

- Generación de narrativa creativa sin filtros: escritores que necesitan explorar temas tabú o controvertidos en sus obras pueden utilizar el modelo sin que rechace las solicitudes.
- Roleplay y juegos de texto: usuarios que participan en entornos de rol interactivo donde se requieren respuestas sin restricciones de contenido.
- Investigación académica sobre sesgos y alineación: los investigadores pueden estudiar el comportamiento de un modelo sin mecanismos de seguridad para comparar con versiones originales.
- Desarrollo de asistentes de IA personalizados con preferencias de contenido específicas: se puede ajustar el comportamiento mediante prompts para evitar el rechazo de peticiones legítimas en dominios como salud o educación.
- Pruebas de estrés de sistemas de moderación: los desarrolladores de sistemas de filtrado pueden usar el modelo para generar contenido ofensivo y evaluar la robustez de sus clasificadores.
- Traducción y procesamiento de lenguaje técnico: aunque no es su propósito principal, el modelo puede utilizarse para tareas de traducción o resumen cuando el contenido no requiere filtrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión GGUF del modelo. El modelo base Qwen3.5-9B tiene resultados conocidos en MMLU, HumanEval y GSM8K, pero no se dispone de ellos en la información proporcionada. Se recomienda consultar la ficha del modelo original en HuggingFace para obtener datos de rendimiento.

## Requisitos de hardware

- VRAM estimada: para la cuantización Q4_K_M (la más común), se necesitan aproximadamente 4,5-5 GB de memoria GPU para cargar los pesos (7B parámetros en 4 bits). Para Q8_0, se requieren alrededor de 8 GB.
- GPUs recomendadas: cualquier GPU con al menos 6 GB de VRAM (RTX 2060, RTX 3060, GTX 1660) para Q4_K_M; para Q8_0 se necesita 8-10 GB (RTX 3070, RTX 3080, etc.).
- Si cabe en GPU de consumo: sí, las versiones Q4_K_M y Q2_K caben en GPUs de consumo moderadas (4-6 GB). Las versiones de mayor precisión (Q8_0, f16) requieren GPUs con 8+ GB.
- Opciones de despliegue: compatible con llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con backend GGUF) y otros motores que soporten GGUF.
- Latencia y throughput: no se dispone de datos medidos. Se espera una velocidad de ~10-20 tokens/s en GPU consumer para Q4_K_M, pero esto depende del hardware y del motor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizaciones | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B (original) | 9B (aprox) | no disponible | Apache 2.0 (probablemente) | BF16, FP16 | Modelo base con censura |
| Qwen3.5-9B-Abliterated (MethodWhite) | 7.05B | no disponible | no disponible | HF safetensors | Versión sin censura |
| Qwen3.5-9B-Abliterated-HSAQ-v2 (este) | 7.05B | no disponible | no disponible | GGUF | Cuantizaciones del modelo abliterated |
| Llama-3.1-8B-Instruct (comparación) | 8B | 128k | Llama 3.1 license | GGUF | Modelo de código abierto con licencia |

No se dispone de datos de rendimiento comparativos fiables para esta versión específica.

## Limitaciones y advertencias

- Riesgo de alucinación: como todos los LLM, el modelo puede generar información falsa o inventada, especialmente en dominios no entrenados.
- Sesgos: el modelo hereda los sesgos del dataset original de Qwen3.5-9B, que pueden incluir estereotipos de género, raza, religión, etc.
- Contenido inapropiado: al eliminar las restricciones de seguridad, el modelo puede generar contenido violento, sexual, discriminatorio o ilegal. Su uso debe ser estrictamente controlado y regulado.
- Licencia desconocida: no se especifica la licencia de este modelo, lo que puede dificultar su uso comercial o redistribución.
- Contexto limitado: no se ha confirmado la longitud de contexto; si es la misma que Qwen3.5-9B, probablemente sea de 128k, pero no hay confirmación.
- Falta de documentación técnica: no hay papers ni documentación oficial sobre el proceso de abliteración, lo que limita la reproducibilidad y el entendimiento de los cambios.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mradermacher/Qwen3.5-9B-Abliterated-HSAQ-v2-GGUF
- Modelo base (MethodWhite): https://huggingface.co/MethodWhite/Qwen3.5-9B-Abliterated-HSAQ-v2
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Guía de uso del modelo abliterated (en inglés): https://codersera.com/blog/unrestricted-uncensored-qwen35-9b-abliterated-full-guide/
- Página de Ollama para Qwen3.5: https://ollama.com/library/qwen3.5:9b
