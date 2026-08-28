# jdqqjr/qwen3.8-27b-aragon-uncensored

## Resumen

El modelo `jdqqjr/qwen3.8-27b-aragon-uncensored` es una adaptación del modelo multimodal Qwen3.8-27B de Alibaba, modificado mediante la técnica de abliteración norm-preserving (Aragon Heretic) para eliminar los mecanismos de rechazo y censura presentes en el modelo original. El resultado es un modelo "uncensored" que conserva las capacidades de razonamiento, visión y generación de texto del base, pero sin las restricciones de seguridad que limitan ciertos contenidos. El autor reporta que la optimización seleccionada (Trial 73) logra 71/100 en keywords y una divergencia KL de 0.0060 sobre los conjuntos de evaluación configurados.

El repositorio contiene pesos fusionados en BF16 (sin adaptador PEFT), lo que permite su uso directo con la librería transformers. Con 27.781 millones de parámetros, el modelo hereda la arquitectura densa de Qwen3.8-27B, que incluye un codificador de visión y soporte nativo para imágenes y vídeo. Está pensado para desarrolladores que necesitan un modelo de gran tamaño con capacidades multimodales y sin filtros de contenido, aunque esta característica conlleva riesgos importantes que se detallan más adelante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision + texto) basado en Qwen3.5, 64 capas |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos originales); no se proporcionan cuantizaciones adicionales en el repo |
| Idiomas soportados | no disponible (hereda los del modelo base, no especificados) |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer causal denso con codificador de visión integrado, construido sobre la arquitectura de Qwen3.5. Tiene 64 capas y está diseñado para tareas multimodales (imagen, vídeo y texto) con modos de pensamiento e instrucción. La adaptación aquí presentada aplica abliteración norm-preserving mediante la herramienta Aragon Heretic, que modifica los pesos del modelo para eliminar las direcciones de activación asociadas al rechazo de contenido. El proceso no requiere entrenamiento adicional ni adaptadores: los pesos resultantes se fusionan directamente en el modelo final. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre el proceso de alineación original (RLHF/DPO).

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imágenes y vídeo junto con texto, permitiendo descripciones, análisis y respuestas basadas en contenido visual.
- Modo thinking e instruct: hereda del modelo base la capacidad de razonamiento paso a paso y de seguir instrucciones complejas.
- Agente de codificación: soporta generación de código, depuración y tareas de programación de alto nivel, incluyendo uso de herramientas (tool calling) para flujos de trabajo agénticos.
- Sin restricciones de contenido: la abliteración elimina los mecanismos de rechazo, por lo que el modelo responde a peticiones que el modelo original bloquearía (contenido explícito, violencia, etc.).
- Multilingüe: aunque no se especifican idiomas, el modelo base de Qwen soporta múltiples lenguas; esta adaptación no modifica esa capacidad.

## Casos de uso

- Generación creativa sin filtros: escritura de ficción, guiones o narrativas que incluyan temas tabú o lenguaje explícito, donde un modelo censurado interrumpiría el flujo creativo.
- Investigación en seguridad de IA: estudio de los efectos de la abliteración en el comportamiento de modelos grandes, comparando respuestas con y sin restricciones.
- Análisis de contenido visual sensible: descripción de imágenes o vídeos con contenido controvertido para fines de moderación o investigación, sin que el modelo se niegue a procesarlos.
- Desarrollo de asistentes de rol (roleplay) sin límites: creación de personajes y conversaciones que requieren respuestas sin censura en entornos de entretenimiento para adultos.
- Evaluación de robustez: prueba de los límites del modelo en tareas de razonamiento complejo donde la censura podría interferir con la respuesta correcta (por ejemplo, preguntas sobre temas políticamente sensibles).
- Fine-tuning posterior: al estar en BF16 y sin adaptadores, sirve como punto de partida para ajuste fino con técnicas como LoRA en dominios específicos que requieren salidas sin restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas internas de la abliteración (keywords 71/100, KL 0.0060), pero no hay comparaciones con el modelo base ni con otras alternativas en tareas estándar como MMLU, HumanEval o GSM8K. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos BF16 ocupan aproximadamente 55,6 GB (27,78 B × 2 bytes). Se necesitan al menos 56 GB de VRAM para cargar el modelo completo sin cuantización.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 24GB con reparto de capas). No cabe en una GPU de consumo estándar (RTX 4090 24GB) sin cuantización.
- Opciones de cuantización: no se proporcionan versiones GGUF o AWQ en el repositorio, pero el modelo puede cuantizarse con herramientas como llama.cpp o AutoAWQ para reducir requisitos (4 bits ≈ 14 GB, 8 bits ≈ 28 GB).
- Opciones de despliegue: compatible con transformers, vLLM, TGI y endpoints compatibles (tag `endpoints_compatible`). Para cuantización, llama.cpp u Ollama si se generan los GGUF.
- Latencia y throughput: no disponibles. Al ser un modelo denso de 27B, la latencia será mayor que la de modelos más pequeños; en una A100 se pueden esperar decenas de tokens por segundo, pero sin datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Uncensored |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,78 B | no disponible | Sí (imagen/vídeo) | Apache 2.0 (según repo oficial) | No |
| jdqqjr/qwen3.8-27b-aragon-uncensored | 27,78 B | no disponible | Sí (heredado) | no disponible | Sí |
| Qwen3.8-27B-Uncensored-OrcaRouter-GGUF | 27,78 B | no disponible | Sí | no disponible | Sí (con router) |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos de rendimiento para establecer diferencias cuantitativas. La principal diferencia entre las versiones uncensored radica en la técnica de desbloqueo (abliteración vs. router) y en el formato de pesos (BF16 vs. GGUF).

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base puede heredar sesgos de los datos de entrenamiento; la abliteración no corrige estos sesgos y puede amplificarlos al eliminar filtros de seguridad.
- Riesgo de alucinación: al ser un modelo de 27B sin ajuste específico, puede generar información falsa o inventada, especialmente en tareas de razonamiento multimodal.
- Contenido dañino: al ser uncensored, puede producir texto violento, sexualmente explícito, discriminatorio o ilegal. No debe usarse en aplicaciones orientadas al público general sin supervisión humana.
- Licencia no disponible: no se especifica la licencia del modelo adaptado, lo que genera incertidumbre legal para uso comercial. El modelo base tiene licencia Apache 2.0, pero la adaptación podría tener restricciones adicionales.
- Contexto e idiomas no documentados: se desconoce la longitud máxima de contexto y los idiomas soportados, lo que dificulta planificar su uso en producción.
- Sin garantías de calidad: al ser un modelo con 0 descargas y 0 likes, no hay evidencia de validación externa. Se recomienda una evaluación exhaustiva antes de cualquier despliegue.

## Enlaces

- Modelo adaptado: https://huggingface.co/jdqqjr/qwen3.8-27b-aragon-uncensored
- Modelo base (HuggingFace): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentación en Groq: https://console.groq.com/docs/model/qwen/qwen3.8-27b
- Ficha técnica del modelo base: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-qwen
