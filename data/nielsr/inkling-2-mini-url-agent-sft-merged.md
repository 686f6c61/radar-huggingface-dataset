# nielsr/inkling-2-mini-url-agent-sft-merged

## Resumen

Inkling 2 Mini URL Agent es un ajuste fino (fine-tuning) del modelo base thinkingmachines/Inkling-2-Mini, publicado por el usuario nielsr en Hugging Face. Se trata de un checkpoint "merged" en el que se ha fusionado un adaptador LoRA de tipo attention-only (entrenado con SFT sobre tareas de extracción de URLs) directamente en los pesos de atención en BF16 del modelo base, mientras que los expertos enrutados conservan sus pesos originales en NVFP4/MXFP8. El resultado es un modelo de 26.388.646.440 parámetros (aproximadamente 26,4 mil millones) que se sirve exactamente igual que el modelo base.

El modelo está pensado para ejecutarse dentro del arnés OpenCode, con herramientas de tipo Bash, Read, Grep, Glob, WebFetch y salida estructurada, por lo que su orientación es la de un agente conversacional especializado en la extracción y manipulación de URLs dentro de flujos de trabajo con tool calling. La arquitectura subyacente es la del modelo Inkling-2-Mini, que por los tags del repositorio (peft, merged, inkling2_loop, 8-bit, modelopt) y por la mención a expertos enrutados y pesos NVFP4/MXFP8 corresponde a un transformer de tipo Mixture of Experts (MoE) cuantizado.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de fusión de LoRA sobre un modelo MoE cuantizado, una práctica cada vez más habitual para adaptar modelos grandes sin reentrenar; por otro, advierte de que la información pública disponible es muy escasa (cero descargas, cero likes, sin licencia ni idiomas declarados, sin benchmarks), lo que limita cualquier evaluación rigurosa antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) derivado de thinkingmachines/Inkling-2-Mini; pesos de atención en BF16 y expertos enrutados en NVFP4/MXFP8 |
| Parametros totales | 26.388.646.440 (26,4 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos base en NVFP4/MXFP8 (expertos enrutados); atención fusionada en BF16; tag "8-bit" y "modelopt" en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers; repo de 20,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de thinkingmachines/Inkling-2-Mini, un transformer con arquitectura Mixture of Experts (MoE) según se deduce de la model card, que distingue explícitamente entre "attention weights" y "routed experts". Sobre ese base se entrenó un adaptador LoRA de tipo attention-only mediante Supervised Fine-Tuning (SFT) para tareas de agente de extracción de URLs, publicado como nielsr/inkling-2-mini-url-agent-lora. Posteriormente, el adaptador se fusionó en los pesos de atención del modelo base, que quedaron en BF16, mientras que los expertos enrutados conservaron sus pesos originales cuantizados en NVFP4/MXFP8. Esta estrategia de fusión parcial permite adaptar el comportamiento del modelo sin tocar los expertos, manteniendo el formato de despliegue del modelo original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de SFT, ni sobre si se aplicaron técnicas de RLHF o DPO. La model card indica únicamente que el modelo está pensado para ejecutarse dentro del arnés OpenCode con herramientas Bash, Read, Grep, Glob, WebFetch y salida estructurada, y remite al repositorio fuente para el system prompt y la evaluación held-out. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal más allá de la propia arquitectura MoE del modelo base.

## Capacidades

- Generación de texto conversacional y multi-turno, heredada del modelo base Inkling-2-Mini.
- Extracción y manipulación de URLs dentro de flujos de agente, que es la tarea específica para la que se entrenó el adaptador LoRA.
- Soporte de tool calling / function calling: la model card menciona explícitamente el uso de herramientas Bash, Read, Grep, Glob y WebFetch dentro del arnés OpenCode.
- Soporte de salida estructurada (structured-output tools) para devolver resultados en formatos parseables.
- Ejecución como agente con razonamiento multi-paso, al integrarse en un harness que encadena llamadas a herramientas.
- Parsers específicos en vLLM para tool calling y razonamiento (`--tool-call-parser inkling --reasoning-parser inkling`).
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.
- Modo "thinking" o razonamiento explícito: no disponible como característica documentada, aunque el parser de razonamiento de vLLM sugiere algún tipo de separación de trazas de razonamiento.

## Casos de uso

- Extracción de URLs en pipelines de scraping: el modelo puede recibir texto o HTML y devolver las URLs relevantes mediante salida estructurada, integrándose en un harness que use WebFetch para validar cada enlace antes de emitirlo.
- Agente de investigación web automatizada: dentro de OpenCode, el modelo encadena llamadas a WebFetch y Grep para localizar, filtrar y consolidar enlaces de fuentes, usando el contexto multi-turno del modelo base.
- Enriquecimiento de datasets de enlaces: procesamiento por lotes de documentos para identificar y normalizar URLs, aprovechando el soporte de salida estructurada para generar registros JSON consistentes.
- Automatización de tareas de mantenimiento de repositorios: combinado con Bash y Glob, el modelo puede localizar referencias a URLs en ficheros de configuración o documentación y proponer correcciones.
- Asistente de documentación técnica: dado un fragmento de texto, el modelo extrae y clasifica los enlaces citados, útil para generar índices de referencias o tablas de recursos.
- Integración en flujos de CI/CD para validación de enlaces: el modelo puede formar parte de un paso de revisión que detecte URLs malformadas o sospechosas en pull requests, aunque requeriría validación posterior con un comprobador HTTP real.
- Prototipado de agentes especializados en extracción de información: sirve como punto de partida para experimentar con fusión de LoRA sobre modelos MoE cuantizados antes de entrenar adaptadores propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 20,2 GB en safetensors, lo que sugiere que los pesos en el formato empaquetado (atención BF16 + expertos NVFP4/MXFP8) caben en GPUs de 24 GB o más, aunque no se dispone de cifras oficiales de VRAM pico.
- GPU recomendadas: no disponible de forma explícita; por tamaño y formato de cuantización, el modelo base y este checkpoint están pensados para GPUs de centro de datos (A100, H100) o, potencialmente, para GPUs consumer de gama alta con 24 GB o más, siempre que el runtime soporte NVFP4/MXFP8.
- Compatibilidad con GPU consumer: no confirmada; depende del soporte de NVFP4/MXFP8 en el runtime utilizado.
- Opciones de despliegue: vLLM con la imagen `inkling-2-mini` y los flags `--tool-call-parser inkling --reasoning-parser inkling`, según indica la model card. Otros runtimes (llama.cpp, Ollama, TGI) no están documentados para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| nielsr/inkling-2-mini-url-agent-sft-merged | 26,4 B (MoE) | no disponible | no disponible | safetensors (BF16 + NVFP4/MXFP8) | Hugging Face, 0 descargas |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| nielsr/inkling-2-mini-url-agent-lora (adaptador) | no disponible (LoRA) | no disponible | no disponible | safetensors (PEFT) | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría (agentes de extracción de URLs) ni de datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Información pública muy escasa: sin licencia declarada, sin idiomas declarados, sin benchmarks y con cero descargas y cero likes, lo que impide verificar su calidad o su idoneidad para producción.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor o revisar la licencia del modelo base antes de cualquier despliegue.
- Especialización estrecha: el adaptador se entrenó para extracción de URLs dentro del arnés OpenCode, por lo que su rendimiento fuera de ese contexto (otros harnesses, otras herramientas) no está documentado.
- Dependencia de un runtime concreto: la model card recomienda vLLM con parsers específicos de Inkling; otros runtimes pueden no soportar los formatos NVFP4/MXFP8 o los parsers de tool calling.
- Riesgo de alucinación: como todo modelo generativo, puede inventar URLs o enlaces plausibles pero inexistentes; se recomienda validar cada URL con una comprobación HTTP antes de usarla.
- Sesgos: no documentados por el autor; se heredan los del modelo base, que tampoco están descritos en la información disponible.
- Limitaciones de contexto e idioma: no disponibles; no se puede confirmar el soporte multilingüe ni la ventana de contexto máxima.
- Checkpoint fusionado: al tratarse de una fusión parcial (atención en BF16, expertos cuantizados), cualquier modificación posterior del adaptador requeriría rehacer la fusión o mantener el LoRA separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nielsr/inkling-2-mini-url-agent-sft-merged
- Adaptador LoRA de origen: https://huggingface.co/nielsr/inkling-2-mini-url-agent-lora
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
