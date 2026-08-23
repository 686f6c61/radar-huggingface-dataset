# brandonmusic/GLM-5.2-NVFP4-REAP-Recall-N172

## Resumen

GLM-5.2-NVFP4-REAP-Recall-N172 es una variante del modelo GLM-5.2 de Z.ai, cuantizada en NVFP4 (4-bit) por Luke Alonso y posteriormente sometida a un proceso de poda de expertos (MoE pruning) mediante la técnica REAP de Cerebras Research. El autor, brandonmusic, ha re-ejecutado el proceso de saliency sobre una calibración específica que incluye conocimiento general, legal, código y razonamiento, con el objetivo de recuperar la capacidad de recuerdo factual que se perdía en las versiones REAP estándar. El resultado es un modelo con 172 expertos por capa (de los 256 originales), que mantiene los pesos BF16 para las capas densas y conserva los expertos en NVFP4.

Con 265.6 mil millones de parámetros totales y una ventana de contexto de hasta 1.048.576 tokens, este checkpoint ofrece una alternativa más ligera que el modelo completo, con una calidad de razonamiento y generación de código comparable, y una mejora notable en tareas de conocimiento cerrado. Está diseñado para ser servido con vLLM y requiere hardware de gama alta (múltiples GPU profesionales con 96 GB de VRAM cada una). La licencia MIT permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos con atención latente multi-cabeza (MLA) - `glm_moe_dsa` |
| Parametros totales | 265.577.041.680 (~265,6 mil millones) |
| Parametros activos | No disponible (8 expertos activos por token de 172, más 1 experto siempre activo) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | NVFP4 (4-bit) para expertos, BF16 para pesos densos; también se menciona 8-bit en tags |
| Idiomas soportados | No disponible (el modelo base GLM-5.2 es multilingüe, pero no se especifica en la ficha) |
| Licencia | MIT |
| Formato de pesos | Safetensors (carga con `load-format safetensors` en vLLM) |

## Arquitectura y entrenamiento

El modelo parte de GLM-5.2, un transformer de 78 capas con atención latente multi-cabeza (MLA) y 6.144 de dimensión oculta, cuantizado a NVFP4 (4-bit) mediante NVIDIA ModelOpt. Sobre esta versión cuantizada se aplica la técnica REAP (Retrieval-Efficient Activation Pruning) de Cerebras Research (arXiv:2510.13999, ICLR 2026), que identifica los expertos menos relevantes mediante una métrica de saliency basada en la magnitud de las salidas ponderadas por el router. El autor re-ejecuta este proceso con una calibración de 12.228 muestras equilibradas en cuatro ejes: conocimiento general (C4, Wikipedia, MMLU-aux, TriviaQA, Natural Questions), corpus legal (1.528 casos CAP en formato markdown y una base de conocimiento Neo4j con 300 headnotes, 390 estatutos, 373 resúmenes de casos y 113 hechos), código/agente (evol-codealpaca, Magicoder, xLAM, SWE-smith) y razonamiento/terminación (trazas de razonamiento ponderadas ×6). El proceso de saliency se ejecutó por bloques en GPU, de cuantizando los expertos NVFP4 a BF16 en memoria, capturando la salida de cada experto y liberando el bloque, alcanzando 7.368.253 tokens activos en 75 capas MoE. La poda resultante mantiene 172 expertos por capa, reindexados de forma contigua (0…171), con el router reducido a `[172, 6144]` y el sesgo a `[172]`, lo que permite cargar el modelo en vLLM sin scripts de reparación adicionales.

## Capacidades

- Generación de texto conversacional y de razonamiento multi-turno.
- Razonamiento lógico y matemático, con capacidad de ejecutar pasos intermedios.
- Generación de código y soporte de flujos agénticos (tool calling, multi-step reasoning).
- Conocimiento factual general y legal, recuperado mediante la calibración específica (mejora frente a REAPs estándar).
- Procesamiento de contexto largo (hasta 1 M tokens en el modelo, 200 k en la configuración de servidor recomendada).
- Soporte de caché de KV en formato MLA (Multi-head Latent Attention) con cuantización FP8.
- Compatibilidad con despliegue en vLLM mediante kernels especializados (B12X, FlashInfer).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 200 k tokens en servidor) y un historial de usuario extenso, gracias a su ventana de contexto amplia y su capacidad de razonamiento.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para generar, revisar y parchear código, con un rendimiento de razonamiento adecuado para tareas de programación complejas.
- Análisis y resumen de documentos legales: la calibración incluye un corpus de casos legales y estatutos, lo que permite resumir contratos, identificar cláusulas y extraer hechos clave de manera fiable.
- Asistente de investigación académica: con su contexto de 1 M tokens, puede procesar artículos largos y libros completos, resumiendo y comparando información de múltiples fuentes.
- Agente autónomo de navegación web: al mantener un razonamiento multi-paso y una memoria de contexto amplia, puede planificar y ejecutar tareas de búsqueda y extracción de datos en línea.
- Chatbot conversacional de conocimiento general: la recuperación de hechos (p. ej., capital de Kentucky) está mejorada respecto a versiones REAP estándar, lo que lo hace útil para asistentes que requieren respuestas factuales precisas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo presenta una tabla cualitativa comparando el comportamiento con la versión REAP estándar:

| Prompt | REAP estándar (narrow) | Este modelo (N=172) |
|---|---|---|
| ¿Cuál es la capital de Kentucky? | Lexington | Frankfort |
| En una frase, ¿qué estableció Marbury v. Madison? | (vacío / bucle de repetición) | Revisión judicial: la autoridad del Tribunal Supremo para declarar leyes inconstitucionales |
| ¿Cuál es la capital de Texas? | — | Austin |

Además, se indica que todos los prompts de razonamiento pasan (8/8 trampas; silogismos, descuentos, repudiación anticipatoria, etc.) con finalización correcta (`finish=stop`).

## Requisitos de hardware

- VRAM estimada: el modelo completo pesa 315.4 GB en el repositorio (294 GB en descarga), por lo que se requiere al menos 4 GPUs con 96 GB de VRAM cada una para la configuración recomendada.
- GPUs recomendadas: 4 × RTX PRO 6000 (96 GB, arquitectura sm120) para el script de lanzamiento verificado.
- No cabe en una GPU de consumo convencional; se necesita hardware profesional o múltiples GPUs de 80 GB (p. ej., A100 80 GB, H100).
- Opciones de despliegue: vLLM con tensor parallel de 4 y decode-context parallel de 4, usando el backend `b12x` para los kernels optimizados. También se puede usar llama.cpp u Ollama si se convierte a GGUF, aunque no está documentado.
- Latencia y throughput: no disponibles en la información proporcionada.
- El script de servidor recomienda configuraciones específicas de caché (KV cache dtype fp8, block-size 256, chunked prefill, prefix caching) para optimizar la memoria.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos publicados. No obstante, se puede comparar estructuralmente:

| Modelo | Parámetros | Contexto | Licencia | Cuantización |
|---|---|---|---|---|
| GLM-5.2 (Z.ai) | No disponible (original) | 1 M | MIT | BF16 (original) |
| GLM-5.2-NVFP4 (Luke Alonso) | No disponible | 1 M | MIT | NVFP4 |
| Este modelo (N=172) | 265,6 B | 1 M | MIT | NVFP4 (expertos) + BF16 (denso) |
| Mixtral 8x22B | 141 B | 64 k | Apache 2.0 | BF16/INT8 |

El modelo es una variante podada del GLM-5.2, con menos expertos activos (172 frente a 256), lo que reduce el coste computacional por token manteniendo la mayoría de las capacidades.

## Limitaciones y advertencias

- Riesgo de alucinación: aunque la calibración mejora el recuerdo factual, el modelo puede seguir generando información falsa en dominios no cubiertos por el corpus de calibración.
- Contexto máximo en despliegue: la configuración de servidor recomendada limita la ventana a 200.000 tokens, a pesar de que el modelo soporta 1 M; usar más tokens requeriría ajustes adicionales.
- Dependencia de kernels específicos: el despliegue eficiente requiere los kernels B12X y la imagen Docker de terceros (`verdictai/glm52-nvfp4-dcpmtp`), lo que puede limitar la portabilidad.
- No se documentan resultados de benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que el rendimiento cuantitativo es desconocido.
- El modelo es una versión podada y cuantizada; puede haber una pérdida de calidad en tareas de razonamiento complejo o en dominios fuera de los ejes de calibración.
- La licencia MIT permite uso comercial, pero el modelo base GLM-5.2 de Z.ai también es MIT, por lo que no hay restricciones adicionales de licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brandonmusic/GLM-5.2-NVFP4-REAP-Recall-N172
- Repositorio del método y pila de servidor: https://github.com/brandonmmusic-max/GLM-5.2-Reap
- Imagen Docker: https://hub.docker.com/r/verdictai/glm52-nvfp4-dcpmtp
- Paper de REAP: https://arxiv.org/abs/2510.13999
- Modelo base GLM-5.2: https://huggingface.co/zai-org/GLM-5.2
- Modelo NVFP4 padre: https://huggingface.co/lukealonso/GLM-5.2-NVFP4
- Vista de arquitectura: https://hfviewer.com/brandonmusic/GLM-5.2-NVFP4-REAP-Recall-N172
- Ficha en Friendli.ai: https://friendli.ai/models/brandonmusic/GLM-5.2-NVFP4-REAP-Recall-N172
