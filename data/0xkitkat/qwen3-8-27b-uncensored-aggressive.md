# 0xKitkat/Qwen3.8-27B-Uncensored-Aggressive

## Resumen

El modelo 0xKitkat/Qwen3.8-27B-Uncensored-Aggressive es una versión "abliterated" (desalineada) del Qwen3.8-27B de Alibaba, distribuida en formato GGUF para ejecución local con llama.cpp, LM Studio y otros runtimes compatibles. El autor, 0xKitkat, aplica una técnica de edición de pesos (no un fine-tune) que elimina el comportamiento de rechazo (refusal) del modelo base, manteniendo intactas las capacidades de razonamiento, código, visión y tool use. El objetivo es ofrecer un modelo que responda a peticiones que el checkpoint original rechazaría, sin necesidad de jailbreaks por prompt.

El modelo mantiene la arquitectura híbrida del Qwen3.8-27B: 64 capas compuestas por bloques de Gated DeltaNet y Gated Attention, con un total de 27.320 millones de parámetros densos. Soporta un contexto nativo de 262.000 tokens, ampliable hasta aproximadamente 1 millón mediante YaRN, y procesa texto, imagen y vídeo (este último requiere el proyector mmproj incluido). La versión v2 de este release corrige problemas de fluidez de la v1 limitando la ablación a las proyecciones de salida (attn_output, ssm_out, ffn_down), dejando el resto de pesos como copias bit-exactas del modelo base.

La relevancia de este modelo reside en su enfoque quirúrgico: no es un fine-tune ni un ajuste de dataset, sino una edición de pesos basada en el análisis del subespacio de rechazo en la capa de unembedding. Esto permite conservar las habilidades del modelo original mientras se elimina el "preamble" de rechazo y las respuestas evasivas, algo útil para aplicaciones de escritura creativa sin restricciones, investigación de seguridad y generación de contenido donde la censura del modelo base supone una limitación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas de 3×(Gated DeltaNet → FFN) + 1×(Gated Attention → FFN) + MTP head |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262.000 tokens nativos; hasta ~1.000.000 con YaRN |
| Tipos de cuantizacion | Q6_K (mixto Q6_K + Q8_0, ~25,3 GiB), Q4_K_M (~15,7 GiB), proyector de visión F16 (885 MiB) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponibles en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura híbrida que combina capas de Gated DeltaNet (una variante de state space model con actualización recurrente) y capas de atención completa con gating. En concreto, cada bloque de 4 capas contiene 3 capas de Gated DeltaNet seguidas de una capa de Gated Attention, repitiéndose 16 veces hasta completar 64 capas, más un head MTP (multi-token prediction) para predicción de múltiples tokens. El modelo tiene una dimensión oculta de 5120, FFN de 17408 y un vocabulario de 248.320 tokens. Soporta entrada multimodal (texto, imagen y vídeo) mediante un proyector de visión (mmproj).

El proceso de "uncensoring" aplicado por 0xKitkat es una edición de pesos, no un fine-tune. La técnica, basada en el enfoque "Aggressive" de HauhauCS (a su vez derivado de la familia Heretic/Reaper), consiste en:

1. Construir una base de rechazo de rango 4 a partir de la capa de unembedding (lm_head), tokenizando con el vocabulario oficial de Qwen3.8 en inglés y chino, identificando direcciones asociadas a disculpas, políticas, identidad de IA y lenguaje evasivo.
2. Ortogonalizar esos ejes contra un clúster de cumplimiento/ayuda para preservar respuestas normales.
3. Aplicar un kernel tipo "tent" (campana) en las capas tardías (pico en la capa ~42) sobre los "escritores" residuales (attn_output, ssm_out, ffn_down).
4. Aplicar un kernel más ligero sobre los "lectores" residuales (ffn_gate, ffn_up).
5. Preservar la magnitud de las filas tras la edición (normalización completa).
6. Dejar intactos el head MTP (blk.64 / nextn.*) y la torre de visión.

La versión v2 (la actual) solo modifica las proyecciones de salida (attn_output, ssm_out, ffn_down) con rango 2 y cap unitario, lo que corrige problemas de fluidez de la v1 (que producía degeneración tipo "umber umber umber" en textos creativos). Los tensores ablacionados se mantienen en Q8_0 dentro del GGUF Q6_K.

## Capacidades

- Generación de texto y razonamiento: conserva las capacidades de razonamiento del Qwen3.8-27B, incluyendo modo "thinking" (activado por defecto) con cadenas de pensamiento explícitas.
- Procesamiento multimodal: entrada de texto, imagen y vídeo (requiere el archivo mmproj-F16.gguf junto al modelo).
- Generación de código y tool calling: los pesos de codificación y uso de herramientas no se ven afectados por la ablación (solo se modifican las proyecciones residuales de salida).
- Soporte de agentes y razonamiento multi-paso: el modelo mantiene el modo thinking y puede encadenar pasos de razonamiento, aunque la eliminación del refusal puede alterar el comportamiento en tareas que requieran rechazo de instrucciones maliciosas.
- Multilingüe: inglés y chino, con el vocabulario completo del modelo base.
- Sin modo de rechazo: el modelo no produce preámbulos de disculpa ni se niega a responder a peticiones que el base rechazaría; responde directamente con el contenido solicitado.
- Compatible con llama.cpp y LM Studio: formato GGUF, con soporte de plantilla Jinja y control del modo thinking mediante chat-template-kwargs.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar ficción, guiones o poesía que aborden temas controvertidos o adultos sin el preámbulo de rechazo típico del modelo base. Su capacidad de mantener coherencia en textos largos (hasta 262k tokens) lo hace adecuado para novelas o series de capítulos.
- Investigación de seguridad y alineación: los investigadores pueden estudiar el comportamiento de un modelo sin alineación de seguridad para entender los mecanismos de refusal, comparar respuestas con el modelo base y desarrollar técnicas de mitigación.
- Generación de contenido para juegos de rol (RPG) y narrativa interactiva: el modelo puede interpretar personajes sin limitaciones autoimpuestas, útil para juegos de rol de texto o asistentes de escritura para autores que necesitan explorar tramas oscuras o moralmente ambiguas.
- Análisis de documentos largos con visión: gracias a su contexto de 262k tokens y soporte de imagen/vídeo, puede resumir o extraer información de documentos extensos, capturas de pantalla o vídeos (con el mmproj), sin los rechazos que el base podría emitir ante contenido sensible.
- Desarrollo de chatbots de nicho: para comunidades que requieren respuestas directas sin censura (por ejemplo, foros de discusión sobre temas tabú), el modelo puede desplegarse como backend de un chatbot con llama.cpp o LM Studio.
- Evaluación comparativa de modelos desalineados: sirve como referencia para comparar el impacto de la ablación en el rendimiento frente al Qwen3.8-27B original, midiendo diferencias en fluidez, precisión y comportamiento de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni similares para esta versión ablacionada. El autor indica explícitamente que no se trata de una reclamación de "0/465 HarmBench" y sugiere que el usuario mida el rendimiento por sí mismo. Dado que la edición de pesos es mínima (solo proyecciones de salida, rango 2), se espera que el rendimiento sea muy cercano al del modelo base Qwen3.8-27B, pero no hay datos cuantitativos que lo confirmen.

## Requisitos de hardware

- VRAM estimada: para el cuantizado Q6_K (~25,3 GiB), se necesitan al menos 28-32 GB de VRAM para una inferencia cómoda con offload completo; con Q4_K_M (~15,7 GiB), unos 18-20 GB.
- GPU recomendadas: el autor indica que su equipo de desarrollo usó 2 GPU de 12 GB (probablemente RTX 3060/4070 o similares), lo que sugiere que con 2×12 GB se puede ejecutar el Q6_K con offload parcial. Para una sola GPU, una RTX 4090 (24 GB) puede ejecutar el Q6_K con offload completo, y una RTX 3090 (24 GB) también. El Q4_K_M cabe en una RTX 4080/4090 o en GPUs de 16 GB como la RTX 4070 Ti Super.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), LM Studio, y cualquier runtime compatible con GGUF (Ollama, text-generation-webui). El modelo requiere `--jinja` para la plantilla y `--mmproj` para visión.
- Latencia y throughput: no se proporcionan datos. En hardware consumer (2×12 GB), se puede esperar una velocidad de generación de unos 10-20 tokens/s para Q6_K, dependiendo de la configuración de contexto y del número de capas en GPU.
- Contexto largo: para aprovechar los 262k tokens nativos, se recomienda al menos 128k de contexto en la configuración, lo que aumenta significativamente el uso de KV cache y VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| 0xKitkat/Qwen3.8-27B-Uncensored-Aggressive | 27B | 262k (1M con YaRN) | Apache-2.0 | GGUF | Ablación de refusal sobre Qwen3.8-27B, v2 |
| Qwen/Qwen3.8-27B (base) | 27B | 262k (1M con YaRN) | Apache-2.0 | safetensors/GGUF | Modelo oficial con alineación de seguridad |
| HauhauCS/Qwen3.6-27B-Uncensored-HauhauCS-Aggressive | 27B | 262k (1M con YaRN) | Apache-2.0 | GGUF | Versión similar sobre Qwen3.6, usada como referencia por el autor |

La comparativa se limita a características estructurales, ya que no hay datos de rendimiento publicados. El modelo de 0xKitkat se diferencia del de HauhauCS en que aplica la ablación solo en las proyecciones de salida (v2) para preservar la fluidez, mientras que HauhauCS cubre también las proyecciones de entrada. Respecto al modelo base, la diferencia es únicamente la eliminación del comportamiento de rechazo, con el resto de pesos bit-exactos.

## Limitaciones y advertencias

- Eliminación de la alineación de seguridad: el modelo cumplirá con peticiones que el checkpoint base rechazaría. Esto incluye contenido potencialmente dañino, ilegal o poco ético. El autor advierte explícitamente que el uso es responsabilidad del usuario y que no condona el uso criminal.
- Riesgo de alucinación: al eliminar el "preamble" de rechazo, el modelo puede generar contenido falso o inventado con mayor confianza, especialmente en temas donde el base se negaría a responder.
- Idiomas limitados: solo inglés y chino. No hay soporte para español u otros idiomas, aunque el modelo podría generar texto en otros idiomas con menor calidad.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que el rendimiento se mantenga respecto al base. El autor sugiere que el usuario mida el rendimiento por sí mismo.
- Contexto y memoria: aunque el contexto nativo es de 262k tokens, el uso de YaRN para ampliarlo a ~1M requiere ajustes manuales de `rope_parameters` y puede degradar la calidad si se usa de forma incorrecta.
- Requisitos de hardware: el modelo es pesado (27B) y requiere GPUs con al menos 16-24 GB de VRAM para una experiencia aceptable. En hardware consumer de 12 GB, es necesario usar múltiples GPUs o cuantizaciones más agresivas (no incluidas en este release).
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor añade una advertencia legal: el uso debe ser legal en la jurisdicción del usuario. No hay restricciones adicionales, pero el contenido generado puede violar leyes locales.
- No es un fine-tune: cualquier degradación de rendimiento no se puede corregir con fine-tuning adicional sobre estos pesos, ya que la edición es manual y no está diseñada para ser entrenada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/0xKitkat/Qwen3.8-27B-Uncensored-Aggressive
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Referencia HauhauCS Aggressive (Qwen3.6): https://huggingface.co/HauhauCS/Qwen3.6-27B
