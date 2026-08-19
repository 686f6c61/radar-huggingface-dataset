# Dawitozzie/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF

## Resumen

El modelo **Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF** es una versión cuantizada en formato GGUF de un modelo de lenguaje de tipo Mixture of Experts (MoE) con 35 000 millones de parámetros totales y aproximadamente 3 000 millones de parámetros activos por token. Desarrollado por LuffyTheFox (con una copia publicada bajo el usuario Dawitozzie), este modelo combina una base Qwen3.6 sin censura (HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive) con datos de fine-tuning del dataset Hermes de function calling, y aplica un post-procesado propietario llamado **Genesis** que repara el ruido acumulado en los tensores sin reentrenar el modelo. El resultado es un sistema multimodal (texto, imagen y vídeo) orientado a tareas de agente, con soporte de tool calling y una tasa de rechazo de peticiones de 0 sobre 465 casos probados.

La relevancia de este modelo reside en su doble naturaleza: por un lado, ofrece capacidades de razonamiento y generación propias de la familia Qwen3.6 en un formato GGUF ejecutable en hardware de consumo; por otro, su carácter "uncensored" y su enfoque en la reparación de señal lo convierten en una opción interesante para desarrolladores que necesitan un asistente flexible sin restricciones de contenido, siempre que asuman los riesgos asociados. La arquitectura híbrida combina atención lineal Gated DeltaNet con atención softmax completa en una proporción 3:1, lo que permite manejar contextos largos con un coste computacional reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido: Gated DeltaNet (atención lineal) + atención softmax completa, 40 capas, 256 expertos |
| Parametros totales | 34 660 610 688 (34,66 B) |
| Parametros activos | ~3 B (A3B) |
| Longitud de contexto | no disponible (se espera herencia de Qwen3.6, pero no se especifica) |
| Tipos de cuantizacion | GGUF (múltiples variantes, incluyendo cuantización APEX; no se lista el conjunto exacto) |
| Idiomas soportados | Inglés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la base **HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive**, un MoE de 35 B parámetros con 3 B activos por token, que a su vez deriva de la familia Qwen3.6. La arquitectura interna emplea una combinación de atención lineal **Gated DeltaNet** y atención **softmax completa** en proporción 3:1 distribuida a lo largo de 40 capas, con 256 expertos en las capas MoE. Esta hibridación permite procesar secuencias largas con menor coste cuadrático que la atención tradicional.

El proceso de entrenamiento no es un fine-tuning convencional. LuffyTheFox aplica el algoritmo **Genesis**, un método de post-procesado que escanea los tensores del modelo (excluyendo embeddings, salidas y ciertas capas) para detectar y eliminar ruido acumulado durante el entrenamiento original mediante descomposición SVD personalizada y reequilibrado de cabezas de atención. Además, se transfirieron aproximadamente 2 000 bloques de dos tensores de expertos FFN desde un fine-tuning previo de Hermes (DJLougen/hermes-qwen3.5-35b-a3b-GGUF) al base uncensored, incorporando así capacidades de function calling y agente. El dataset utilizado para esta transferencia es **NousResearch/hermes-function-calling-v1**. No se ha realizado RLHF ni DPO; el modelo conserva el comportamiento sin censura del base.

## Capacidades

- Generación de texto y razonamiento multilingüe (inglés, chino y otros idiomas).
- Procesamiento multimodal: entrada de texto, imágenes y vídeo (según la documentación del autor, compatible con llama.cpp, LM Studio y koboldcpp).
- Soporte de **tool calling / function calling** gracias al fine-tuning con datos Hermes.
- Capacidades de **agente** (agentic): puede encadenar llamadas a herramientas y realizar razonamiento multi-paso.
- **Modo thinking**: permite activar un modo de razonamiento explícito para tareas de código o precisión, con parámetros de sampling recomendados por el autor.
- Ausencia de rechazos (0/465 en pruebas del autor), lo que lo hace adecuado para casos donde se requiere generar contenido sin filtros.
- Compatibilidad con cuantización GGUF y ejecución en CPU/GPU híbrida (offload parcial).

## Casos de uso

- **Asistente de programación con tool calling**: el modelo puede integrarse en un IDE o pipeline de CI/CD para autogenerar código, invocar funciones de test o interactuar con APIs, gracias a su soporte de function calling y su modo thinking configurable.
- **Chat sin restricciones para investigación**: útil en entornos de investigación donde se necesita explorar temas sensibles o controvertidos sin los sesgos de alineación habituales, siempre bajo supervisión humana.
- **Procesamiento de documentos multimodales**: al aceptar imágenes y vídeo, puede extraer información de capturas, diagramas o vídeos de demostración y generar resúmenes o respuestas contextuales.
- **Automatización de atención al cliente**: con su capacidad de mantener conversaciones multi-turno y gestionar herramientas externas (bases de conocimiento, CRMs), puede desplegarse como agente de soporte en canales de texto.
- **Generación de contenido creativo**: su naturaleza sin censura y su capacidad de seguir instrucciones complejas lo hacen apto para redacción de ficción, guiones o material de marketing sin restricciones temáticas.
- **Prototipado rápido de agentes autónomos**: desarrolladores pueden usarlo como base para experimentar con arquitecturas de agentes que requieren razonamiento multi-paso y llamadas a herramientas, gracias a su formato GGUF fácil de integrar con frameworks como llama.cpp o Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas estándar como MMLU, HumanEval o GSM8K, y no se han encontrado evaluaciones externas en los resultados de búsqueda.

## Requisitos de hardware

- **VRAM estimada**: al ser un MoE de 35 B con 3 B activos, el tamaño del archivo GGUF varía según la cuantización. Para una cuantización Q4_K_M, el archivo ocupa aproximadamente 20 GB, por lo que cabe en GPUs de consumo con 24 GB (RTX 3090/4090) o en configuraciones de 16 GB con offload parcial a CPU.
- **GPU recomendadas**: RTX 3090, RTX 4090, A100 (40/80 GB) o H100 para inferencia completa en GPU. El autor sugiere en la model card un offload de 15 capas a GPU y 40 capas MoE en CPU, lo que permite ejecutarlo incluso en equipos con 8-12 GB de VRAM y suficiente RAM.
- **Compatibilidad con consumer GPU**: sí, con cuantizaciones Q4_K_M o inferiores y utilizando el modo híbrido CPU+GPU.
- **Opciones de despliegue**: llama.cpp, LM Studio, koboldcpp, Ollama (si se convierte a formato compatible) y servidores con backend GGUF como llama-cpp-python.
- **Latencia y throughput**: no se proporcionan datos oficiales. En una RTX 4090 con Q4_K_M, se puede esperar una generación de 20-40 tokens/s en modo MoE con 8 expertos activos, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7 (este) | 34,66 B | ~3 B | no disponible | Apache 2.0 | GGUF, multimodal, uncensored, Genesis |
| Qwen3-30B-A3B (original Alibaba) | 30 B | 3 B | 128 K (típico) | Apache 2.0 | Base sin fine-tuning, censurado |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | 34,66 B | ~3 B | no disponible | Apache 2.0 | Base sin censura, sin Hermes ni Genesis |

La comparativa se limita a modelos de la misma familia por falta de datos públicos sobre alternativas equivalentes. Las diferencias principales radican en el post-procesado Genesis (que busca mejorar la estabilidad y reducir alucinaciones) y la capa Hermes de function calling, ausente en el base.

## Limitaciones y advertencias

- **Contenido sin filtrar**: al ser un modelo "uncensored", puede generar respuestas ofensivas, ilegales o peligrosas. No es apto para despliegue directo en producción sin moderación adicional.
- **Riesgo de alucinación**: aunque el autor afirma que Genesis reduce las alucinaciones, no hay evidencia empírica publicada; el riesgo persiste, especialmente en tareas factuales.
- **Contexto no documentado**: no se especifica la longitud máxima de contexto soportada; se hereda probablemente del base Qwen3.6, pero no se puede confirmar.
- **Licencia y uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el modelo incluye componentes de terceros (Qwen, Hermes) cuyas licencias originales deben verificarse.
- **Sesgos**: al no haber pasado por alineación, puede reflejar sesgos presentes en los datos de entrenamiento sin mitigación.
- **Reproducibilidad**: el algoritmo Genesis es propietario y no está documentado formalmente; los resultados pueden variar entre versiones del post-procesado.
- **Soporte limitado**: el autor es un desarrollador independiente; no hay garantía de mantenimiento o corrección de errores.

## Enlaces

- [Repositorio HuggingFace (Dawitozzie)](https://huggingface.co/Dawitozzie/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF)
- [Repositorio HuggingFace original (LuffyTheFox)](https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF)
- [Discusión sobre el modelo V5 (contexto de Genesis)](https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V5-GGUF/discussions/5)
- [Artículo en Local AI News](https://www.localainews.co/news/multimodal/qwen3-6-35b-a3b-uncensored-genesis-hermes-v7-gguf-debuts-saying-yes/)
- [Ficha del modelo V6 en AI Models FYI](https://www.aimodels.fyi/models/huggingFace/qwen3.6-35b-a3b-uncensored-genesis-hermes-v6-gguf-luffythefox)
- [Modelo base HauhauCS](https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive)
- [Script de cuantización (Pastebin)](https://pastebin.com/hXhcMJn9)
