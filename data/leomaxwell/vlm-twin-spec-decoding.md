# LeoMaxwell/vlm-twin-spec-decoding

## Resumen

El repositorio `LeoMaxwell/vlm-twin-spec-decoding` no contiene un modelo de lenguaje entrenado desde cero, sino un proyecto de investigación y experimentación sobre decodificación especulativa aplicada a modelos de visión y lenguaje (VLM). La propuesta central consiste en utilizar una cuantización int4 (AWQ) del propio modelo objetivo como borrador especulativo (draft) dentro del motor de inferencia vLLM, sin entrenar ningún componente adicional y sin añadir módulos externos. El sistema define dos niveles de aceptación: un nivel estricto que reproduce exactamente la salida greedy del modelo objetivo, y un nivel relajado que acepta tokens del borrador cuya logit objetivo se mantenga dentro de ln 2 del argmax, de modo que el modelo objetivo sigue siendo el juez final de cada token emitido.

El proyecto incluye un parche para vLLM 0.27.1 que habilita la decodificación especulativa con draft para modelos con M-RoPE (rotary position embedding multimodal), que en la versión estándar de vLLM produce un `NotImplementedError`. También corrige un fallo en el cargador de cuantización que hacía que la ruta de cuantización accediera a la torre de visión del draft. Los checkpoints incluidos en `models/` son espejos byte-idénticos de los modelos Qwen3-VL-8B-Thinking, Qwen3-VL-8B-Instruct y sus variantes AWQ-4bit, todos bajo licencia Apache 2.0. El repositorio documenta quince experimentos (E1 a E15) con resultados crudos en formato JSONL, incluyendo intentos fallidos, y proporciona un harness de evaluación reproducible.

La relevancia de este trabajo radica en que aborda un problema práctico de los VLMs: la decodificación especulativa tradicional requiere un modelo borrador más pequeño y entrenado, mientras que aquí se demuestra que una cuantización agresiva del propio modelo puede servir como borrador, eliminando la necesidad de entrenar un draft separado. Esto tiene implicaciones directas para el despliegue eficiente de VLMs en producción, donde la latencia y el coste de inferencia son críticos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (Transformer con visión-lenguaje, M-RoPE) |
| Parametros totales | 8B (modelos espejo: Qwen3-VL-8B-Thinking e Instruct) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base; los experimentos usan max-model-len 3584) |
| Tipos de cuantizacion | AWQ 4-bit (para el draft) |
| Idiomas soportados | no disponible (los modelos base Qwen3-VL soportan multilingüe, pero no se especifica en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El proyecto no entrena ningún modelo. La arquitectura subyacente es la de los modelos Qwen3-VL-8B (Thinking e Instruct), que son transformers multimodales con codificador de visión y decodificador de lenguaje, usando M-RoPE para fusionar posiciones de texto e imagen. La innovación técnica reside en el mecanismo de decodificación especulativa: se carga una versión AWQ-4bit del mismo modelo como draft, y el modelo objetivo (en precisión completa) verifica los tokens propuestos. El parche de vLLM añade soporte para M-RoPE en el bucle de especulación, captura los CUDA graphs del draft por piezas (que el código upstream omitía, dejando el bucle en modo eager) y corrige un bug en el cargador de cuantización.

El sistema define dos modos de aceptación controlados por variables de entorno: el modo estricto (`VLLM_SPEC_RELAX_LOGTAU` no activado) acepta solo tokens que coinciden exactamente con el argmax del modelo objetivo; el modo relajado (con `VLLM_SPEC_RELAX_LOGTAU=0.693`, equivalente a tau 0.5) acepta tokens cuyo logit objetivo esté dentro de ln 2 del argmax, lo que permite mayor velocidad de aceptación manteniendo al modelo objetivo como árbitro final. El reporte `VLM_SPEC_DECODING_REPORT.md` documenta los experimentos E1 a E15, incluyendo los intentos fallidos, y los resultados crudos están disponibles en `results/` como archivos JSONL con métricas por prompt (velocidad de decodificación, tokens generados, etc.).

## Capacidades

- Decodificación especulativa para VLMs: el sistema permite acelerar la inferencia de modelos Qwen3-VL-8B usando su propia versión cuantizada como draft, sin entrenamiento adicional.
- Dos niveles de aceptación: estricto (reproducción exacta de la salida greedy) y relajado (tolerancia logarítmica de ln 2), ambos con el modelo objetivo como juez final.
- Soporte para M-RoPE en el bucle especulativo de vLLM, habilitando la especulación en modelos que usan este tipo de positional embedding.
- Captura de CUDA graphs para el draft, mejorando el rendimiento del bucle de especulación frente al comportamiento upstream (que dejaba el draft en modo eager).
- Reproducibilidad: el repositorio incluye el harness de evaluación (`stage1_spec_smoke.py`), los parquets de prompts (MathVista testmini y MM-Vet) y los resultados crudos de todos los experimentos.
- Flexibilidad de configuración: variables de entorno para activar el modo relajado, permitir que el draft decodifique sin embeddings de imagen (`VLLM_SPEC_DRAFT_BLIND_MM`) o deshabilitar la captura de CUDA graphs del draft.
- Compatibilidad con vLLM 0.27.1 mediante parche de cuatro archivos, con un diff consolidado (`mrope_draft_spec.patch`) para referencia.

## Casos de uso

- Aceleración de inferencia para VLMs en producción: empresas que despliegan Qwen3-VL-8B en servicios de visión-lenguaje pueden usar este método para reducir la latencia de decodificación sin entrenar un draft separado, simplemente cargando la versión AWQ-4bit como borrador. El modo estricto garantiza salidas idénticas al modelo original, lo que facilita la adopción en entornos donde la consistencia es crítica.
- Investigación en decodificación especulativa: el repositorio sirve como base reproducible para estudiar el impacto de la cuantización del draft en la tasa de aceptación y la velocidad, con experimentos documentados y datos crudos. Investigadores pueden comparar sus propios métodos contra los resultados E1-E15.
- Evaluación de VLMs en benchmarks multimodales: el harness incluido permite medir velocidad y calidad en MathVista testmini y MM-Vet, útil para equipos que necesitan validar el rendimiento de sus despliegues.
- Optimización de costes en infraestructura GPU: al usar un draft cuantizado que comparte memoria con el modelo objetivo, se reduce la huella de memoria adicional frente a usar un draft separado, permitiendo ejecutar el sistema en GPUs con VRAM limitada.
- Integración en pipelines de vLLM personalizados: el parche proporciona una base para que equipos de ingeniería adapten la decodificación especulativa a sus propias configuraciones de vLLM, especialmente si usan modelos con M-RoPE.
- Formación y documentación técnica: el reporte detallado con intentos fallidos y análisis sirve como material didáctico para entender los desafíos de la especulación en VLMs, incluyendo problemas de prefill con tokens visuales y gestión de KV cache.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks agregados en la información disponible. El repositorio contiene resultados crudos por prompt en `results/` (archivos JSONL con campos `pid`, `mode`, `gamma`, `in_len`, `gen_len`, `t`, `tok_s`, `gen_ids`), y el reporte `VLM_SPEC_DECODING_REPORT.md` documenta los speedups como medianas de ratios pareados por prompt frente a las piernas vanilla de referencia, con rangos intercuartílicos. Sin embargo, los valores numéricos concretos no se incluyen en la model card ni en los resultados de búsqueda web proporcionados, por lo que no es posible presentar una tabla de benchmarks verificable.

## Requisitos de hardware

- VRAM estimada para inferencia: los experimentos usan modelos de 8B con cuantización AWQ-4bit para el draft y el modelo objetivo en precisión completa (probablemente BF16). Con `--gpu-mem-util 0.6` y `--max-model-len 3584`, se requiere una GPU con al menos 24 GB de VRAM para alojar ambos modelos simultáneamente. El reporte menciona experimentos con 32B (Qwen3-VL-32B-Thinking), que requerirían al menos 48 GB.
- GPU recomendadas: para 8B, una NVIDIA A100 40GB, RTX 4090 24GB o similar; para 32B, A100 80GB o H100.
- No cabe en GPUs consumer de gama baja (8-12 GB) si se cargan ambos modelos a la vez; sería necesario reducir el contexto o usar cuantización más agresiva en el modelo objetivo, lo que no está contemplado en el proyecto.
- Opciones de despliegue: el sistema está diseñado específicamente para vLLM 0.27.1 con el parche incluido. No se mencionan alternativas como llama.cpp u Ollama.
- Latencia y throughput: no disponibles de forma agregada. Los resultados por prompt en `results/` permiten calcular métricas, pero no se proporcionan valores resumidos en la información accesible.

## Comparativa con modelos similares

No hay un modelo comparable directo, ya que este repositorio no es un modelo sino un método de aceleración. Sin embargo, se puede comparar con otros enfoques de decodificación especulativa para VLMs:

| Aspecto | vlm-twin-spec-decoding | SpecVLM (EMNLP 2025) | Speculators (vLLM) |
|---|---|---|---|
| Enfoque | Draft cuantizado del mismo modelo | Draft entrenado + poda de tokens guiada por verificador | Librería para entrenar drafts específicos |
| Entrenamiento requerido | No | Sí (entrenamiento del draft) | Sí (entrenamiento del draft) |
| Modelo objetivo | Qwen3-VL-8B/32B | Video LLMs (p.ej. LLaVA-Video) | Cualquier LLM compatible con vLLM |
| Soporte M-RoPE | Sí (parche) | No especificado | No especificado |
| Licencia | Apache 2.0 | Depende del modelo base | Apache 2.0 (librería) |
| Disponibilidad | Repo con código y parches | Repo GitHub | Repo GitHub |

La principal diferencia es que este proyecto elimina la necesidad de entrenar un draft, a costa de requerir un parche manual de vLLM y de que la tasa de aceptación dependa de la calidad de la cuantización AWQ.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un proyecto de investigación con parches sobre una versión específica de vLLM (0.27.1). Actualizar vLLM puede romper la compatibilidad.
- El parche modifica archivos internos de vLLM (`rejection_sampler.py`, `gpu_model_runner.py`, `llm_base_proposer.py`, `utils.py`), lo que implica mantenimiento manual y riesgo de conflictos con otras personalizaciones.
- Los checkpoints incluidos son espejos de modelos Qwen3-VL; el autor no es el creador de los modelos base, y las páginas originales de Qwen y cyankiwi son la fuente autoritativa. No se garantiza que los espejos estén actualizados.
- El modo relajado acepta tokens que no son exactamente el argmax del modelo objetivo, lo que puede introducir desviaciones sutiles en la salida. Aunque el modelo objetivo sigue siendo el juez, la distribución final puede diferir ligeramente de la greedy.
- Los experimentos se centran en benchmarks concretos (MathVista testmini, MM-Vet) y con un número limitado de prompts (20 por ejecución según el ejemplo). Los resultados pueden no generalizar a otros dominios.
- No se documentan sesgos ni riesgos de alucinación específicos de este sistema, pero al basarse en Qwen3-VL, hereda las limitaciones del modelo base (posibles sesgos culturales, errores en razonamiento multimodal, etc.).
- La licencia Apache 2.0 permite uso comercial, pero los modelos base Qwen3-VL también están bajo Apache 2.0, por lo que no hay restricciones adicionales. Sin embargo, el parche de vLLM no está cubierto por la licencia de vLLM (que es Apache 2.0 también), por lo que no hay conflicto conocido.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente y poco validado por la comunidad. La fecha de creación (2026-08-17) es futura respecto a la fecha actual, lo que puede indicar un error en los metadatos o un proyecto muy nuevo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LeoMaxwell/vlm-twin-spec-decoding
- Paper SpecVLM (arXiv): https://arxiv.org/abs/2509.11815
- SpecVLM HTML: https://arxiv.org/html/2509.11815v1
- Documentación de decodificación especulativa en vLLM: https://docs.vllm.ai/en/latest/features/speculative_decoding/
- Librería Speculators (vLLM): https://github.com/vllm-project/speculators
- Repo SpecVLM (GitHub): https://github.com/zju-jiyicheng/SpecVLM
- Modelos base (originales): https://huggingface.co/Qwen/Qwen3-VL-8B-Thinking, https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct, https://huggingface.co/cyankiwi/Qwen3-VL-8B-Thinking-AWQ-4bit, https://huggingface.co/cyankiwi/Qwen3-VL-8B-Instruct-AWQ-4bit
