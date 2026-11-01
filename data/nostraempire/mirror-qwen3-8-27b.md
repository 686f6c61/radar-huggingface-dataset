# NostraEmpire/mirror-qwen3.8-27b

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión desarrollado por el equipo Qwen (Alibaba), distribuido en el repositorio espejo `NostraEmpire/mirror-qwen3.8-27b` en HuggingFace. Se presenta como la generación más capaz de la familia de modelos abiertos Qwen hasta la fecha, construida sobre la base arquitectónica de Qwen3.5, con mejoras sustanciales en programación, trabajo profesional, investigación y tareas agénticas de largo horizonte.

El modelo es denso (no MoE), con 27.781.427.952 parámetros reales según los pesos en safetensors, y combina atención lineal (Gated DeltaNet) con atención completa (Gated Attention) en un layout híbrido de 64 capas. Soporta nativamente comprensión de imagen y vídeo, control flexible del modo de razonamiento y una longitud de contexto de 262.144 tokens, extensible hasta 1.000.000.

Es relevante ahora porque traslada las capacidades de la familia Qwen3.8 a un tamaño compacto y desplegable, con licencia Apache 2.0, lo que permite su uso comercial y su integración en stacks existentes mediante Transformers, vLLM, SGLang o TokenSpeed. El repositorio es un espejo comunitario con 22 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; transformer híbrido con Gated DeltaNet (atención lineal) y Gated Attention |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal híbrido con 64 capas y dimensión oculta de 5120. El layout oculto se organiza en 16 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`, es decir, tres capas de atención lineal por cada capa de atención completa. Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de Rotary Position Embedding de 64. La FFN tiene dimensión intermedia de 17.408. El embedding de tokens y la salida LM tienen 248.320 entradas (con padding). El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que habilita decodificación especulativa nativa.

El modelo ha pasado por pre-entrenamiento y post-entrenamiento, e incluye un codificador de visión para comprensión nativa de imagen y vídeo. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF, DPO u otras técnicas de alineamiento; esos datos figuran como no disponibles. El control flexible del razonamiento se implementa mediante los parámetros `reasoning_effort` (profundidad del razonamiento), `preserve_thinking` (retención del contexto de razonamiento de mensajes históricos) y la posibilidad de desactivar el modo thinking por petición.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto y desactivable por petición.
- Razonamiento de profundidad ajustable mediante `reasoning_effort`.
- Programación y tareas de coding agéntico, incluido terminal coding (evaluado en Terminal Bench 2.1).
- Comprensión nativa de imagen y vídeo: diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Ejecución agéntica autónoma: planificación, manejo de feedback del entorno y completado de tareas de extremo a extremo.
- Soporte de tool calling / function calling (mencionado como herramienta oficial integrada en la versión alojada; en local depende del harness).
- Razonamiento multi-paso y tareas de largo horizonte.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Compatibilidad con harnesses y herramientas de desarrollo populares.
- Decodificación especulativa mediante MTP.

## Casos de uso

- Coding agéntico en terminal: el modelo puede operar en entornos de línea de comandos resolviendo tareas de Terminal Bench 2.1, lo que lo hace adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores de forma iterativa.
- Automatización de pipelines de CI/CD: con soporte de tool calling y razonamiento multi-paso, puede integrarse en flujos que leen logs, proponen parches y validan resultados contra el estado del repositorio.
- Análisis de documentos técnicos y diagramas STEM: el codificador de visión permite extraer información de figuras, esquemas y documentos escaneados, útil en investigación y trabajo profesional.
- Procesamiento de vídeo de larga duración: con contexto de 262.144 tokens y soporte de vídeos de hasta una hora, puede resumir, indexar o responder preguntas sobre grabaciones extensas.
- Investigación asistida: tareas de largo horizonte con planificación autónoma y retención de contexto de razonamiento entre turnos mediante `preserve_thinking`.
- Atención al cliente con contexto largo: la ventana de 262.144 tokens permite gestionar conversaciones multi-turno con historiales extensos y documentos adjuntos, incluidas imágenes.
- Despliegue en infraestructura propia: al ser un modelo denso de 27B con licencia Apache 2.0, puede servirse con vLLM, SGLang o TokenSpeed en hardware de una o varias GPU, sin dependencia de API externa.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. La información proporcionada solo contiene la primera fila de esa tabla (Agentic terminal coding, Terminal Bench 2.1 Terminus) y el valor numérico de Qwen3.8-27B no aparece en el fragmento disponible. No se han podido extraer resultados completos de benchmarks en la información disponible.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo denso de 27B en safetensors ocupa aproximadamente 55,6 GB en precisión original (el tamaño del repo es de 55,6 GB); en cuantizaciones de 8 bits o 4 bits el requisito se reduce proporcionalmente, pero no se confirman formatos de cuantización soportados.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un modelo de 27B en precisión completa requiere múltiples GPU de 80 GB (A100/H100) o una configuración equivalente; en cuantización agresiva podría caber en GPU de consumo de gama alta, pero no se confirma.
- ¿Cabe en consumer GPU?: no disponible.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La model card proporciona una comparativa directa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los datos numéricos no están disponibles en el fragmento proporcionado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27B (denso) | 262.144 nativos, hasta 1.000.000 | Apache 2.0 | Pesos abiertos en HF |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | 30B (según nombre) | no disponible | no disponible | no disponible |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa de rendimiento entre estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no se documenta en la model card; aplica el riesgo habitual de los modelos generativos, especialmente en tareas de razonamiento largo y agentes autónomos.
- Limitaciones de contexto o idioma: el contexto nativo es de 262.144 tokens; la extensión a 1.000.000 se anuncia para la versión alojada en Qwen Cloud, no necesariamente para el despliegue local. Los idiomas soportados no están especificados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el repositorio es un espejo comunitario (`NostraEmpire/mirror-qwen3.8-27b`) con 22 descargas; conviene verificar la procedencia e integridad de los pesos frente al repositorio oficial de Qwen.
- El modo thinking está activado por defecto, lo que incrementa el consumo de tokens y la latencia; debe desactivarse o ajustarse con `reasoning_effort` en producción según el caso.
- La versión alojada en Qwen Cloud con contexto de 1M por defecto y herramientas integradas está anunciada como "coming soon"; las capacidades locales pueden diferir.
- No se confirman formatos de cuantización (GGUF, AWQ, GPTQ) ni soporte en llama.cpp u Ollama, lo que limita el despliegue en hardware de consumo.
- El tamaño del repo (55,6 GB) implica requisitos de almacenamiento y transferencia considerables.

## Enlaces

- HuggingFace: https://huggingface.co/NostraEmpire/mirror-qwen3.8-27b
- Qwen Cloud (modelo alojado): https://www.qwencloud.com/models/qwen3.8-27b
- Qwen Cloud (servicio general): https://www.qwencloud.com
