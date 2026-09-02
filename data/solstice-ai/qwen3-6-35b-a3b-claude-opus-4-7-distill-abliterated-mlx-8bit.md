# Solstice-AI/qwen3.6-35b-a3b-claude-opus-4.7-distill-abliterated-mlx-8bit

## Resumen

El modelo `Solstice-AI/qwen3.6-35b-a3b-claude-opus-4.7-distill-abliterated-mlx-8bit` es una conversión a formato MLX con cuantización de 8 bits de un modelo de razonamiento basado en Qwen3.6, destilado a partir de Claude Opus 4.7 y posteriormente "abliterado" (eliminación de los mecanismos de rechazo). Lo desarrolla Solstice-AI, que también mantiene el runtime Anvil para ejecución en memoria unificada de Apple Silicon. El modelo pertenece a la familia de Mixture of Experts (MoE) con 35,2 mil millones de parámetros totales y 3,1 mil millones activos por token, lo que permite un rendimiento elevado en hardware de consumo.

La relevancia de este modelo radica en que ofrece capacidades de razonamiento de nivel frontera (destiladas de Claude Opus 4.7) en un formato optimizado para Macs con 36 GB o más de memoria unificada, alcanzando velocidades de 75 a 90 tokens por segundo. Su ventana de contexto de 131 072 tokens (2^17) lo hace adecuado para tareas que requieren procesar documentos extensos o conversaciones de muchos turnos. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen3.6 |
| Parametros totales | 35,2 mil millones (34 660 608 768 según safetensors) |
| Parametros activos | 3,1 mil millones por token |
| Longitud de contexto | 131 072 tokens (2^17) |
| Tipos de cuantizacion | 8-bit group quantized (MLX) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (8-bit) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.6 con mezcla de expertos (MoE), donde solo 3,1 mil millones de los 35,2 mil millones de parámetros se activan por token. La cadena de entrenamiento es la siguiente: el modelo base Qwen3.6 fue destilado a partir de Claude Opus 4.7 utilizando aproximadamente 8000 trazas de razonamiento (chain-of-thought) para generar bloques explícitos de pensamiento y respuesta. Posteriormente, el equipo de Huihui-AI aplicó una técnica de "abliteración" que elimina los mecanismos de rechazo del modelo, permitiendo respuestas sin censura. Finalmente, Solstice-AI convirtió los pesos a formato MLX con cuantización de 8 bits por grupo, reduciendo el tamaño de 70 GB (bf16) a aproximadamente 36,8 GB.

No se dispone de información detallada sobre la composición exacta del dataset de destilación ni sobre el proceso de alineación (si se usó RLHF, DPO u otro método). La innovación principal de esta versión es la optimización para Apple Silicon mediante el runtime Anvil, que gestiona la memoria unificada de forma eficiente y permite inferencia en proceso o servida mediante API compatible con OpenAI.

## Capacidades

- Generacion de texto y razonamiento paso a paso (chain-of-thought) con bloques de pensamiento explícitos, gracias a la destilacion de Claude Opus 4.7.
- Codificacion agéntica: el modelo base Qwen3.6 incorpora mejoras sustanciales en tareas de programación que requieren planificación y ejecución de múltiples pasos.
- Soporte de tool calling y function calling, aunque no se detalla en la documentación proporcionada; se infiere de las capacidades de Qwen3.6.
- Capacidades multilingües limitadas a inglés y chino, según la model card.
- Sin mecanismos de rechazo (abliterated), lo que permite generar contenido que otros modelos censurarían.
- Alta velocidad de inferencia en Apple Silicon: 75-90 tokens por segundo en memoria unificada.
- Ventana de contexto amplia de 131 072 tokens, adecuada para documentos largos y conversaciones extensas.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar el modelo en un Mac Studio con 64 GB de RAM unificada para obtener sugerencias de código, refactorización y explicaciones de algoritmos sin enviar datos a la nube. La velocidad de 75-90 tokens por segundo permite una interacción fluida en el editor.
- Analisis de documentación técnica extensa: gracias a la ventana de contexto de 131 072 tokens, el modelo puede procesar manuales de API, especificaciones de protocolos o informes de investigación completos en una sola pasada, resumiendo y extrayendo información clave.
- Chatbot de soporte sin restricciones: empresas que necesitan un asistente conversacional capaz de tratar temas sensibles o controvertidos sin rechazos pueden desplegar este modelo en infraestructura propia, manteniendo el control total sobre el contenido generado.
- Razonamiento matematico y cientifico: la destilacion de Claude Opus 4.7 proporciona capacidades de razonamiento formal que pueden aplicarse a problemas de matematicas, fisica o logica, con explicaciones paso a paso.
- Generacion de contenido creativo en ingles y chino: el modelo puede redactar articulos, guiones o material de marketing en ambos idiomas, aprovechando su entrenamiento multilingüe y su falta de censura para estilos variados.
- Servicio de inferencia local compatible con OpenAI: mediante `anvil serve --port 8080`, el modelo puede integrarse en aplicaciones existentes que usen la API de OpenAI, sustituyendo el backend sin cambios en el codigo cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni otros tests estandarizados. El unico dato de rendimiento proporcionado es la velocidad de generacion de 75-90 tokens por segundo en Apple Silicon con memoria unificada, que corresponde a la version cuantizada de 8 bits.

## Requisitos de hardware

- VRAM estimada: el modelo requiere aproximadamente 36,8 GB de memoria unificada (tamano del repositorio). No se especifica VRAM dedicada porque esta disenado para Apple Silicon con memoria unificada compartida entre CPU y GPU.
- GPU recomendadas: cualquier chip Apple Silicon (M1 Pro/Max/Ultra, M2, M3, M4) con al menos 36 GB de memoria unificada. Modelos con 64 GB o 128 GB permitiran mayor espacio para el contexto y mejor rendimiento.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) porque el formato MLX esta optimizado para Metal y no es compatible con CUDA. Para GPUs NVIDIA habria que usar una conversion a otro formato (GGUF, etc.) que no se proporciona.
- Opciones de despliegue: runtime Anvil (recomendado) con `anvil run` para sesion interactiva y `anvil serve` para API compatible con OpenAI. Tambien puede usarse con la libreria MLX de Apple directamente, aunque no se documenta en la model card.
- Latencia y throughput: 75-90 tokens por segundo en memoria unificada, segun la model card. No se proporcionan datos de latencia de primer token ni de throughput bajo carga concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| Solstice-AI/qwen3.6-35b-a3b-claude-opus-4.7-distill-abliterated-mlx-8bit | 35,2B | 3,1B | 131 072 | MLX 8-bit | Apache 2.0 |
| huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated (modelo base) | 35,2B | 3,1B | 131 072 | bf16 (safetensors) | Apache 2.0 |
| anas-khan-antimatter/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-MLX-5bit | 35,2B | 3,1B | 131 072 | MLX 5-bit | Apache 2.0 |
| Qwen3.6-35B-A3B (original) | 35,2B | 3,1B | 131 072 | bf16 | Apache 2.0 |

La diferencia principal entre estas versiones es el formato de pesos y el tamano resultante: el modelo base en bf16 ocupa unos 70 GB, la version 5-bit unos 22 GB y la version 8-bit unos 36,8 GB. La version 8-bit ofrece un equilibrio entre calidad y requisitos de memoria, mientras que la 5-bit es mas ligera pero potencialmente menos precisa. Todas comparten la misma arquitectura y licencia.

## Limitaciones y advertencias

- El modelo esta "abliterated", es decir, se han eliminado los mecanismos de rechazo. Esto implica que puede generar contenido ofensivo, ilegal o danino sin filtros, lo que supone un riesgo legal y etico en entornos de produccion.
- Solo soporta ingles y chino. No se garantiza un rendimiento adecuado en otros idiomas, incluido el espanol.
- Requiere hardware Apple Silicon con al menos 36 GB de memoria unificada. No es compatible con GPUs NVIDIA o AMD sin una conversion previa a otro formato (no proporcionada).
- No se han publicado benchmarks de calidad, por lo que no es posible comparar objetivamente su rendimiento con otros modelos de razonamiento.
- La destilacion a partir de Claude Opus 4.7 puede heredar sesgos del modelo profesor, aunque no se documentan sesgos especificos.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir informacion falsa o inventada, especialmente en tareas de razonamiento complejo o con contexto ambiguo.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del contenido generado, especialmente dado el caracter "uncensored" del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/Solstice-AI/qwen3.6-35b-a3b-claude-opus-4.7-distill-abliterated-mlx-8bit
- Runtime Anvil (GitHub): https://github.com/Solstice-Labs/anvil
- Repositorio de la version 5-bit (referencia): https://github.com/anas-khan-antimatter/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-MLX-5bit
- Modelo base en Ollama: https://ollama.com/huihui_ai/Qwen3.6-abliterated:35b-Claude-4.7
- Pagina de Qwen3.6 en Ollama: https://ollama.com/library/qwen3.6
