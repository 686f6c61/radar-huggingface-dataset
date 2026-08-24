# desva0/Qwen3.8-27B-Uncensored-W4A16

## Resumen

`desva0/Qwen3.8-27B-Uncensored-W4A16` es una cuantización 4-bit weight-only (W4A16) del modelo abliterated (sin rechazos) de Qwen3.8-27B, un modelo de lenguaje y visión de 27 000 millones de parámetros desarrollado por el equipo Qwen de Alibaba. Esta versión concreta, publicada por el usuario desva0, está optimizada para ejecutarse en una GPU de consumo con 24 GB de VRAM, como la RTX 3090, y se sirve mediante vLLM con el formato compressed-tensors.

El modelo base Qwen3.8-27B es un modelo denso multimodal nativo que combina atención híbrida (Gated DeltaNet lineal + atención completa), soporta razonamiento, tool calling y decodificación especulativa con cabezal MTP. La variante abliterated, publicada por OrcaRouter bajo licencia Apache-2.0, elimina los comportamientos de rechazo del modelo alineado, lo que permite respuestas sin filtros de seguridad. Esta cuantización mantiene la torre de visión en mayor precisión para preservar la comprensión de imágenes.

El resultado es un modelo de ~15 GB de pesos que cabe en una RTX 3090 con margen para la caché KV a una longitud de contexto útil de 32 768 tokens, tal y como se demuestra en el comando de despliegue incluido en la model card. Es una opción práctica para desarrolladores que necesitan un asistente multimodal sin restricciones en hardware local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida: Gated DeltaNet lineal + atención completa) |
| Parametros totales | 6 260 690 960 (según metadatos de safetensors; el modelo base declara 27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 768 (configuración recomendada en vLLM; el modelo base puede soportar más, no especificado) |
| Tipos de cuantizacion | W4A16 (4-bit weight-only, int4, group_size 128, simétrico, compressed-tensors) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors pack-quantized) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura densa híbrida que combina atención lineal Gated DeltaNet con atención completa, lo que reduce el coste computacional en secuencias largas manteniendo la calidad. Incluye un cabezal de decodificación especulativa MTP (Multi-Token Prediction) para acelerar la generación. Es un modelo nativo de visión-lenguaje, capaz de procesar imágenes y texto de forma conjunta.

La versión abliterated de OrcaRouter elimina los rechazos del modelo alineado mediante una técnica de ablación de pesos, manteniendo las capacidades generales pero sin los mecanismos de negativa. La cuantización W4A16 se realizó con AutoRound, exportando los pesos en formato compressed-tensors con 4 bits por peso, grupo de 128 y simetría. Las capas lineales de la torre de visión se mantienen en mayor precisión (listadas en `ignore`) para no degradar la comprensión de imágenes. No se dispone de información detallada sobre el dataset de entrenamiento del modelo base ni sobre el proceso de alineación original.

## Capacidades

- Generación de texto y razonamiento multi-step, incluyendo pensamiento encadenado.
- Comprensión de imágenes (visión-lenguaje): puede describir, analizar y responder sobre contenido visual.
- Tool calling y function calling: soporta invocación de herramientas externas mediante el formato Hermes (según el comando vLLM).
- Capacidades de agente: puede integrarse en flujos de trabajo autónomos con múltiples pasos.
- Multilingüe: inglés y chino (según los idiomas declarados).
- Al estar abliterated, no presenta rechazos ante solicitudes que un modelo alineado declinaría, lo que permite respuestas sin censura.
- Decodificación especulativa MTP para mayor velocidad de generación (heredada del modelo base).

## Casos de uso

- Asistente personal local sin restricciones: desplegado en una RTX 3090, puede servir como asistente conversacional con acceso a herramientas, ideal para usuarios que quieren control total sobre el contenido generado.
- Automatización de oficina: el modelo base destaca en tareas de ofimática, como redacción de documentos, resúmenes y generación de informes a partir de texto e imágenes.
- Análisis de imágenes en entornos controlados: al mantener la torre de visión en alta precisión, puede extraer información de capturas, diagramas o fotografías en aplicaciones de soporte técnico.
- Desarrollo de agentes de código: con tool calling, puede integrarse en pipelines de CI/CD para generar, revisar o parchear código, aunque requiere supervisión humana por su naturaleza sin filtros.
- Investigación en seguridad y alineación: al ser abliterated, sirve para estudiar el comportamiento de modelos sin mecanismos de rechazo y para probar técnicas de guardarraíles externos.
- Chatbot multilingüe para comunidades de habla inglesa y china: su capacidad bilingüe permite atender usuarios en ambos idiomas con un solo despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. El modelo base Qwen3.8-27B ha sido evaluado en tareas como MathVision, pero no se proporcionan cifras concretas para esta cuantización.

## Requisitos de hardware

- VRAM estimada: ~15 GB de pesos en W4A16, más la caché KV. Con 24 GB de VRAM (RTX 3090) y `--gpu-memory-utilization 0.90` se puede alcanzar una longitud de contexto de 32 768 tokens.
- GPU recomendadas: RTX 3090, RTX 4090, A100 40 GB, o cualquier GPU con al menos 24 GB de VRAM.
- Cabe en GPUs de consumo: sí, en modelos con 24 GB o más. En GPUs de 16 GB (como RTX 4080) no cabría con la configuración completa.
- Opciones de despliegue: vLLM (recomendado, con soporte compressed-tensors), también puede usarse con transformers y otras herramientas que soporten el formato.
- Latencia y throughput: no se proporcionan datos específicos. La decodificación especulativa MTP puede mejorar la velocidad, pero depende del hardware y la carga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | No especificado (probablemente 128k) | FP16/BF16 | Apache-2.0 | HuggingFace |
| desva0/Qwen3.8-27B-Uncensored-W4A16 | 6.26B (según metadatos) | 32k (configuración vLLM) | W4A16 int4 | Apache-2.0 | HuggingFace |
| orcarouter/Qwen3.8-27B-Uncensored (Ollama) | 27B | No especificado | 2-bit a 8-bit | Apache-2.0 | Ollama |
| bowmanslayer/Qwen3.8-27B-Uncensored-W4A16-vision-mtp | 27B | No especificado | W4A16 | Apache-2.0 | HuggingFace |

La comparativa muestra que esta cuantización es una de las opciones para ejecutar el modelo en hardware de 24 GB, junto con la versión de Ollama. La discrepancia en el número de parámetros (6.26B vs 27B) sugiere un posible error en los metadatos del repo, pero no afecta al funcionamiento declarado.

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado los mecanismos de rechazo, por lo que generará contenido que un modelo alineado declinaría, incluyendo respuestas potencialmente dañinas, ilegales o poco éticas. El despliegue requiere guardarraíles externos y cumplimiento legal.
- Sesgos conocidos: al ser una versión sin alineación, los sesgos del modelo base pueden amplificarse. No se han realizado evaluaciones de sesgo en esta cuantización.
- Riesgo de alucinación: como cualquier LLM, puede inventar información, especialmente en tareas de razonamiento complejo o con imágenes ambiguas.
- Limitaciones de idioma: solo se declaran inglés y chino; otros idiomas pueden tener un rendimiento inferior.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar la atribución y la licencia al redistribuir. El uso de un modelo sin filtros puede violar las políticas de plataformas de despliegue.
- Contexto limitado en la práctica: aunque el modelo base puede soportar más, la configuración recomendada para 24 GB es de 32 768 tokens; superarla puede causar OOM.
- Dependencia de vLLM: se requiere una versión reciente con soporte compressed-tensors; otras herramientas pueden no cargar el formato correctamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/desva0/Qwen3.8-27B-Uncensored-W4A16
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Alibaba para Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía de ejecución local (qwen38-uncensored): https://github.com/unburdened-jackinthebox365/qwen38-uncensored
- Versión Ollama de OrcaRouter: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Repo similar de bowmanslayer: https://huggingface.co/bowmanslayer/Qwen3.8-27B-Uncensored-W4A16-vision-mtp
