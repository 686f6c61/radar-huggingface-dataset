# SonGT1/MiniCPM5-abliterated-2B

## Resumen

MiniCPM5-abliterated-2B es una versión "abliterated" (con los mecanismos de rechazo de seguridad eliminados) del modelo MiniCPM5-2B desarrollado por OpenBMB. El autor de esta variante es el usuario SonGT1, quien ha publicado en Hugging Face un modelo derivado mediante la técnica de abliteration, un procedimiento que neutraliza las direcciones de activación responsables de los rechazos de seguridad sin necesidad de reentrenamiento completo. Según la model card, el proceso reduce la tasa de rechazo de 99/100 del modelo base a 4/100, manteniendo una divergencia KL de 0.0658 respecto al original, lo que indica que las capacidades del modelo subyacente permanecen prácticamente intactas.

El modelo base, MiniCPM5-2B, es un modelo de lenguaje conversacional orientado a chino e inglés, con aproximadamente 2.516 millones de parámetros. Esta variante resulta relevante para desarrolladores e investigadores que necesitan un modelo pequeño y sin restricciones de contenido para tareas de generación de texto en chino e inglés, ya sea para investigación sobre alineamiento, para casos de uso donde los rechazos del modelo interfieren con la tarea, o para despliegues en hardware modesto. Está disponible en formatos safetensors y GGUF, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA (según tags del repo; detalles no disponibles) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors y GGUF; cuantizaciones concretas no especificadas) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

Esta ficha corresponde a un modelo derivado, no al modelo original, por lo que el proceso de entrenamiento propio se limita a la abliteration aplicada sobre openbmb/MiniCPM5-2B. La abliteration es una técnica post-entrenamiento que identifica las direcciones en el espacio de activaciones asociadas a la conducta de rechazo (refusal direction) y las suprime o proyecta fuera de las activaciones del modelo. No requiere gradientes ni datos de entrenamiento adicionales, y su efecto se mide típicamente mediante la tasa de rechazo en prompts sensibles y la divergencia KL respecto al modelo base en distribuciones de salida normales.

En este caso, el autor publica métricas de verificación: el modelo base rechaza 99 de 100 prompts de prueba, mientras que la versión abliterated rechaza solo 4 de 100, con una KL de 0.0658. Este valor de KL bajo sugiere que el comportamiento del modelo en tareas ordinarias apenas se ve alterado. Sobre la arquitectura interna, el entrenamiento original y la composición del dataset de MiniCPM5-2B no están descritos en la información disponible; los tags indican compatibilidad con la arquitectura LLaMA (lo que facilita su uso en llama.cpp y derivados), pero los detalles técnicos del modelo base no constan en esta ficha.

## Capacidades

- Generacion de texto conversacional en chino e inglés, heredada del modelo base MiniCPM5-2B.
- Respuestas sin mecanismos de rechazo: la abliteration elimina la mayoría de las negativas de seguridad, permitiendo que el modelo responda a prompts que el modelo original declinaría.
- Fidelidad al modelo base: divergencia KL de 0.0658, lo que implica que las capacidades de generación, razonamiento y conocimiento del modelo original se conservan en gran medida.
- Compatibilidad con el ecosistema de inferencia para arquitectura LLaMA: GGUF permite su ejecución en llama.cpp, Ollama, LM Studio y similares.
- Distribución en safetensors para uso con transformers, vLLM y otros runtimes estándar.
- No hay evidencia en la información disponible de capacidades de visión, audio, tool calling ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Investigacion sobre alineamiento y seguridad: al disponer de un modelo con tasa de rechazo reducida a 4/100 y una métrica KL documentada, es adecuado para estudiar el efecto de la abliteration sobre el comportamiento del modelo y comparar respuestas filtradas y no filtradas en experimentos controlados.
- Evaluacion de robustez (red teaming): permite generar respuestas a prompts adversariales sin la interferencia de rechazos artificiales, útil para auditar sistemas de seguridad y construir datasets de evaluación de jailbreaks.
- Asistentes locales sin filtros para uso personal: con ~2.5B de parámetros y formato GGUF, puede ejecutarse en portátiles y equipos de escritorio sin GPU dedicada, para chatbots personales donde el usuario prefiere control total sobre el filtrado de contenido.
- Generacion de contenido creativo sin bloqueos: escritura de ficción, guiones o diálogos en chino e inglés donde los rechazos del modelo base interrumpirían el flujo creativo en escenas sensibles.
- Procesamiento de textos sensibles en entornos profesionales: dominios como medicina legal, periodismo de investigación o análisis de contenido moderado, donde el modelo debe procesar y discutir material delicado sin negarse.
- Fine-tuning posterior sin guardrails: como punto de partida para ajustes finos (LoRA/QLoRA) en tareas especializadas, evitando que los rechazos del modelo base contaminen el modelo ajustado en dominios legítimos pero sensibles.
- Prototipado rapido en hardware modesto: el tamaño de ~2.5B permite iterar pipelines de NLP en chino/inglés en GPUs de consumo o incluso en CPU, antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica cuantitativa publicada por el autor es la comparación de tasa de rechazo y divergencia KL:

| Modelo | Tasa de rechazo | KL |
|---|---|---|
| MiniCPM5-2B (base) | 99/100 | 0.0000 |
| MiniCPM5-abliterated-2B | 4/100 | 0.0658 |

Para benchmarks de capacidades generales (MMLU, HumanEval, GSM8K, etc.), puede consultarse la model card del modelo base openbmb/MiniCPM5-2B, aunque dichos datos no constan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~2.5B de parámetros, la versión en precisión completa (fp16) requiere aproximadamente 5-6 GB de VRAM; con cuantizaciones GGUF de 4 bits (Q4_K_M) el consumo baja a alrededor de 1.5-2 GB, más el overhead del contexto. (Estimaciones basadas en el tamaño de parámetros; el repo ocupa 13.2 GB, lo que sugiere que incluye múltiples formatos y cuantizaciones.)
- GPU recomendadas: cualquier GPU de consumo con 6 GB o más de VRAM es suficiente para la versión completa; para la versión cuantizada bastan GPUs como una RTX 3060, RTX 4060 o superiores. No se requieren GPUs de centro de datos (A100/H100) para inferencia.
- Cabe en consumer GPU: sí, holgadamente incluso en GPUs de gama media; con GGUF de 4 bits también es viable en CPU con RAM de 8 GB.
- Opciones de despliegue: llama.cpp y Ollama (gracias al formato GGUF y la compatibilidad con arquitectura LLaMA), LM Studio para uso de escritorio, y transformers de Hugging Face o vLLM para la versión safetensors.
- Latencia y throughput estimados: no disponible; al tratarse de un modelo de ~2.5B, se espera una generación rápida incluso en hardware modesto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Particularidad |
|---|---|---|---|---|
| SonGT1/MiniCPM5-abliterated-2B | 2.516.756.480 | zh, en | Apache 2.0 | Abliterated; tasa de rechazo 4/100; safetensors y GGUF |
| openbmb/MiniCPM5-2B (base) | ~2.5B | zh, en | no disponible en la información proporcionada | Modelo original con guardrails completos |
| Qwen2.5-3B-Instruct (referencia de categoría) | 3.09B | multilingue (29+ idiomas) | Qwen Research (restricciones comerciales en algunos casos) | Modelo generalista de tamaño similar, con guardrails estándar |

Nota: la comparación con Qwen2.5-3B es orientativa como modelo de tamaño y tarea similar; los datos de rendimiento comparativo no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Contenido sin filtrar: la abliteration elimina la mayoría de las salvaguardas de seguridad. El modelo puede generar contenido ofensivo, peligroso o ilegal si se le solicita. La responsabilidad legal recae íntegramente en el usuario final, quien debe cumplir la legislación local.
- Riesgo de alucinacion: al ser un modelo de ~2.5B parámetros, la tasa de alucinaciones es presumiblemente superior a la de modelos mayores; no hay mediciones publicadas en la información disponible.
- Deterioro potencial por abliteration: aunque la KL de 0.0658 es baja, la abliteration puede degradar sutilmente la coherencia, la capacidad de instrucción o introducir inestabilidades en conversaciones largas. No hay evaluaciones publicadas que cuantifiquen este efecto.
- Idiomas limitados: el modelo está orientado a chino e inglés; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- Contexto y arquitectura: la longitud de contexto no está especificada en la información disponible; debe verificarse en la model card del modelo base antes de diseñar aplicaciones con documentos largos.
- Uso comercial: la licencia Apache 2.0 permite el uso comercial, pero la naturaleza "uncensored" del modelo puede entrar en conflicto con las políticas de plataformas de despliegue (Hugging Face Inference Endpoints, proveedores cloud) y con normativas sectoriales (RGPD, AI Act europeo).
- Sin garantías de soporte: se trata de un modelo comunitario con 744 descargas y 1 like en el momento de la ficha, sin mantenimiento activo documentado ni canal de soporte.
- Datos del modelo base incompletos: los detalles de entrenamiento, contexto y benchmarks de MiniCPM5-2B no constan en la información proporcionada, lo que limita la evaluación rigurosa de esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SonGT1/MiniCPM5-abliterated-2B
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Organización OpenBMB en Hugging Face: https://huggingface.co/openbmb
- Paper, blog oficial, repositorio de código y demo: no disponible (no constan en la información proporcionada)
