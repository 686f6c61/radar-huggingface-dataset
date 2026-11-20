# cyankiwi/Swift-1.5-Qwen3.8-27B-AWQ-INT4

## Resumen

Swift-1.5-Qwen3.8-27B-AWQ-INT4 es la versión cuantizada en 4 bits (AWQ, INT4) del modelo Swift 1.5 Qwen3.8-27B publicado por UkisAI, un derivado de Qwen3.8-27B orientado a razonamiento eficiente en tokens. La cuantización la firma cyankiwi, que aplica Activation-aware Weight Quantization con calibración sobre datos de tipo STEM y agentic, reduciendo el peso del repositorio a 21,02 GB frente al modelo original en precisión completa. El modelo mantiene la modalidad image-text-to-text heredada de su base, por lo que acepta entradas de imagen y texto y genera texto con razonamiento explícito.

El modelo base tiene 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) y se presenta como una mejora directa de Swift 1.0, con un post-entrenamiento ampliado (RL y OPD) centrado en tareas de código, agentes y horizonte largo. Según la model card del autor, Swift 1.5 usa un 58,5 % menos de tokens de pensamiento que Qwen3.8-27B con una puntuación un 0,35 % superior, lo que se traduce en una aceleración de 1,95× en varias tareas.

La relevancia actual reside en la combinación de tres factores: razonamiento con modo thinking pero token-efficient, capacidades multimodales de entrada y un formato AWQ INT4 desplegable en GPUs de consumo medio-alto o en endpoints gestionados. La licencia es propietaria (swift-open-license-1.0) y el acceso al repositorio está restringido (gated), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (image-text-to-text), familia Qwen3.8; detalles internos de atención y capas no disponibles |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT4 (esta versión); el modelo base ofrece GGUF y GSQ-RCO GGUF |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (propietaria, acceso gated) |
| Formato de pesos | safetensors (compressed-tensors, compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen3.8 con capacidad multimodal de entrada (pipeline image-text-to-text), según los tags del repositorio y la librería transformers. No se dispone de información pública sobre número de capas, dimensiones ocultas, mecanismo de atención ni longitud de contexto en la información proporcionada.

El entrenamiento del modelo base consistió en un post-entrenamiento sobre Qwen3.8-27B que combina RL y OPD (on-policy distillation, según la nomenclatura del autor) escalado respecto a Swift 1.0. La innovación principal es la penalización selectiva de tokens asociados a sobrepensamiento patológico, sin atacar directamente la longitud del razonamiento, seguida de una fase de RL y OPD para recuperar precisión. El foco del entrenamiento se puso en tareas agénticas de horizonte largo y código, con mejoras reportadas en LiveCodeBench y Terminal Bench 2.1. Los datos de entrenamiento multi-turno agéntico están publicados en el dataset ukisai/Qwen3.8-27B-multi-turn-agent-sft. La cuantización AWQ de cyankiwi usa calibración sobre datos STEM y agentic (versión cyankiwi 26.05.01).

## Capacidades

- Generación de texto y razonamiento con modo thinking explícito, optimizado para reducir tokens de pensamiento sin perder precisión.
- Generación de código, incluyendo proyectos completos: la demo del autor genera un juego 3D jugable en el navegador.
- Entrada multimodal image-text-to-text: acepta imágenes junto con texto.
- Razonamiento agéntico multi-paso y de horizonte largo, con mejoras específicas en Terminal Bench 2.1.
- Capacidades matemáticas y STEM implícitas en el pipeline de calibración y en el perfil de evaluación del modelo base; no se detallan métricas concretas.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo de pensamiento eficiente (efficient-thinking, token-efficient) como rasgo diferencial frente a la base.

## Casos de uso

- Agentes de terminal y automatización de shell: el modelo está entrenado explícitamente para Terminal Bench 2.1 y tareas agénticas de horizonte largo, por lo que puede encadenar comandos, interpretar salidas y corregir errores en sesiones prolongadas.
- Generación de aplicaciones web completas: la demo del autor construye un juego 3D con Three.js a partir de un prompt en lenguaje natural; es adecuado para prototipado rápido de front-end y juegos pequeños, con una reducción de tiempo de 104,6 a 11,39 minutos frente a la base en ese caso concreto.
- Asistencia de código en producción: el foco en LiveCodeBench y el modo thinking eficiente lo hacen apto para revisión de código, generación de tests y refactorización en pipelines de CI/CD, siempre que la licencia lo permita.
- Razonamiento sobre documentos con imágenes: al aceptar entradas image-text-to-text, puede extraer información de capturas, diagramas o interfaces y razonar sobre ellas en flujos de soporte técnico.
- Despliegue en endpoints con presupuesto de VRAM ajustado: la cuantización AWQ INT4 de 21 GB permite servir el modelo en una sola GPU de 24 GB o en dos de 16 GB, lo que facilita entornos de desarrollo y staging.
- Evaluación comparativa de eficiencia de razonamiento: útil para investigadores que estudien trade-offs entre longitud de cadena de pensamiento y precisión, gracias a su perfil token-efficient documentado.
- Chat multi-turno con contexto conversacional: el pipeline conversational y el entrenamiento multi-turno agéntico lo hacen adecuado para asistentes de soporte, aunque la longitud de contexto no está confirmada.

## Benchmarks y rendimiento

La información proporcionada no incluye tablas numéricas de benchmarks (MMLU, HumanEval, GSM8K, etc.). El autor reporta de forma agregada:

| Metrica | Valor reportado |
|---|---|
| Reduccion de tokens de pensamiento vs. Qwen3.8-27B | 58,5 % menos |
| Variacion de puntuacion vs. base | +0,35 % |
| Aceleracion en varias tareas | 1,95× |
| Tiempo de generacion de demo (juego 3D) | 11,39 min (Swift 1.5) vs. 104,6 min (base) |
| Mejoras cualitativas | LiveCodeBench y Terminal Bench 2.1 |

No se han publicado resultados de benchmarks detallados por tarea en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 21 GB solo para pesos en INT4; con overhead de KV cache y activaciones, prever 24-32 GB para contextos moderados.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, L40S; en consumo, RTX 4090 (24 GB) o RTX 3090 (24 GB) para contextos cortos.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización INT4 y contexto limitado; en GPUs de 16 GB requeriría partición o cuantizaciones adicionales no publicadas.
- Opciones de despliegue: transformers con compressed-tensors; vLLM y TGI son compatibles con AWQ en general, aunque no se confirma explícitamente en la model card. llama.cpp/Ollama no aplican a este repositorio AWQ, pero el autor publica GGUF del modelo base.
- Latencia y throughput: no disponibles; el autor reporta una aceleración de 1,95× frente a la base atribuible a la reducción de tokens de pensamiento, no a la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| cyankiwi/Swift-1.5-Qwen3.8-27B-AWQ-INT4 | 27,8 B | no disponible | swift-open-license-1.0 (gated) | safetensors AWQ INT4 | 21 GB, razonamiento token-efficient |
| ukisai/Swift-1.5-Qwen3.8-27b (base) | 27,8 B | no disponible | swift-open-license-1.0 (gated) | safetensors (precisión completa) | Punto de partida de la cuantización |
| Qwen/Qwen3.8-27B | 27 B (aprox.) | no disponible | no disponible en la información | safetensors | Modelo original; Swift 1.5 reporta 58,5 % menos tokens de pensamiento |
| ukisai/Swift-Qwen3.8-27b (Swift 1.0) | 27 B (aprox.) | no disponible | swift-open-license-1.0 | safetensors, GGUF | Versión anterior con 350k+ descargas |

No se dispone de datos de benchmarks comparativos por tarea para establecer una comparación cuantitativa con alternativas de otros autores.

## Limitaciones y advertencias

- Licencia propietaria swift-open-license-1.0 con acceso gated: es necesario solicitar acceso y revisar los términos antes de cualquier uso comercial; no es una licencia open source.
- El repositorio está marcado como gated, lo que puede impedir la descarga automatizada en pipelines de CI/CD sin token de Hugging Face.
- La cuantización AWQ INT4 introduce pérdida de precisión respecto al modelo en coma flotante; no se han publicado evaluaciones del delta de calidad de esta versión concreta.
- Riesgo de alucinación inherente a los modelos de 27 B con modo thinking; el foco en eficiencia de tokens no elimina este riesgo.
- Idiomas soportados y longitud de contexto no documentados: no se puede garantizar un comportamiento correcto en castellano ni en conversaciones largas sin validación previa.
- El modelo es un derivado de Qwen3.8-27B con post-entrenamiento adicional; los sesgos del modelo original se heredan y no se detallan mitigaciones.
- El soporte de tool calling no está confirmado explícitamente en la información disponible.
- La fecha de creación del repositorio (2026-09-27) y la versión de calibración (cyankiwi 26.05.01) deben verificarse contra el estado actual del repositorio antes de fijar una versión en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyankiwi/Swift-1.5-Qwen3.8-27B-AWQ-INT4
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Qwen3.8-27B original: https://huggingface.co/Qwen/Qwen3.8-27B
- Swift 1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- GGUF del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Dataset de calibración: https://huggingface.co/datasets/cyankiwi/calibration
- Dataset de entrenamiento agéntico: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Web de UkisAI: https://ukisai.com
- Página de producto Swift: https://ukisai.com/products/swift
- Demo del juego 3D: https://ukisai.com/swift-games/27b
- Web de cyankiwi: https://cyan.kiwi/
- Despliegue en endpoints cyankiwi: https://cyan.kiwi/workspace?prompt=Deploy%20cyankiwi/Swift-1.5-Qwen3.8-27B-AWQ-INT4
- Modelos de cyankiwi en Hugging Face: https://huggingface.co/cyankiwi
- Modelos de cyankiwi en ModelScope: https://www.modelscope.ai/organization/cyankiwi
- X de cyankiwi: https://x.com/cyankiwi_ai
- Reddit de cyankiwi: https://www.reddit.com/r/cyankiwi/
