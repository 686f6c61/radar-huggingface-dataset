# nielsr/qwen35-4b-url-agent-v3-sft-merged

## Resumen

Qwen3.5-4B URL extraction agent es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario nielsr en Hugging Face. Se distribuye como un checkpoint fusionado (merged) del adaptador LoRA `nielsr/qwen35-4b-url-agent-lora-v2`, es decir, los pesos del adaptador PEFT se han integrado en los pesos del modelo base para producir un modelo autónomo que se carga directamente con `transformers`, sin necesidad de aplicar el adaptador por separado.

El modelo está especializado en la extracción de URLs mediante un agente que opera dentro del harness OpenCode, con acceso a herramientas de shell y de red (Bash, Read, Grep, Glob, WebFetch) y a herramientas de salida estructurada. El ajuste se realizó sobre trazas verificadas de extracción de URLs, por lo que su propósito es acotado: no es un modelo de propósito general, sino un componente para un flujo agéntico concreto.

Con 4.539.265.536 parámetros totales (aproximadamente 4,5 mil millones) y un repositorio de 9,1 GB en safetensors, el modelo se posiciona en la gama media de tamaño, desplegable en GPUs de consumo con cuantización. La model card es muy escueta: no declara licencia, idiomas ni datos de entrenamiento detallados, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; etiqueta `qwen3_5` en transformers), ajuste fino con PEFT/LoRA fusionado |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la model card; al ser safetensors en transformers, admite cuantización estándar (GPTQ, AWQ, GGUF) mediante herramientas externas, no verificada por el autor |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint fusionado, `merged`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,5 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino supervisado (SFT, según el sufijo `-sft-` del nombre) mediante LoRA (PEFT), y posteriormente los pesos del adaptador se fusionaron en el modelo base para generar este checkpoint autónomo. La model card no detalla la composición del dataset, el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO.

El dato más relevante sobre el entrenamiento es que se usaron "trazas verificadas de extracción de URLs" (verified OpenCode URL-extraction traces), lo que sugiere un corpus de trayectorias agénticas con llamadas a herramientas y salidas estructuradas. El modelo está diseñado para ejecutarse dentro del harness OpenCode con las herramientas Bash, Read, Grep, Glob, WebFetch y herramientas de salida estructurada; el prompt de sistema y la evaluación base-versus-adaptador se remiten al repositorio fuente, que no se detalla en la información disponible. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y orientada a tareas, heredada del modelo base Qwen3.5-4B.
- Extracción de URLs mediante razonamiento agéntico multi-paso dentro de un harness (OpenCode).
- Uso de herramientas de shell y ficheros: Bash, Read, Grep y Glob.
- Uso de herramientas de red: WebFetch para recuperar contenido de páginas.
- Soporte de salida estructurada (structured-output tools) para devolver resultados en formato parseable.
- Capacidad multimodal declarada por la etiqueta `image-text-to-text` del repositorio, aunque la model card no documenta el uso de visión en el ajuste.
- Capacidades multilingües: no disponibles (no declaradas).

## Casos de uso

- Extracción de URLs en pipelines de datos: el modelo recorre páginas con WebFetch y devuelve listas estructuradas de enlaces, integrándose en un proceso de scraping o catalogación automatizado.
- Agente de investigación documental: combinando Grep, Glob y Read sobre un repositorio local, localiza referencias y enlaces dentro de ficheros de documentación.
- Automatización de tareas de shell guiadas por lenguaje natural: el modelo traduce instrucciones a comandos Bash concretos dentro del harness OpenCode, con validación posterior.
- Enriquecimiento de bases de conocimiento: dado un conjunto de páginas, extrae y normaliza URLs para alimentar un índice o un grafo de conocimiento.
- Evaluación de agentes y harness: sirve como checkpoint de referencia para comparar el rendimiento base frente al adaptador en tareas de extracción de URLs, tal como propone el autor.
- Prototipado de asistentes con tool calling: su tamaño de 4,5 B permite desplegarlo en una sola GPU para experimentar con flujos agénticos antes de escalar a modelos mayores.
- Verificación de enlaces en CI: integrado en un pipeline, puede comprobar y extraer enlaces de artefactos generados y reportar resultados estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a una evaluación base-versus-adapter en el repositorio fuente, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, se recomienda 12-16 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB de pesos.
- VRAM estimada en cuantización de 4 bits (GGUF/AWQ): en torno a 3-4 GB de pesos.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue concurrente y contexto largo; RTX 4090 (24 GB) para fp16 con holgura; RTX 3090/4080 (16-24 GB) para fp16 o 8 bits.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 y, con cuantización 4 bits, en GPUs de 8 GB como RTX 3070/4060 Ti.
- Opciones de despliegue: `transformers` (formato nativo safetensors), vLLM y TGI para serving; llama.cpp/Ollama requieren conversión previa a GGUF, no verificada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| nielsr/qwen35-4b-url-agent-v3-sft-merged | 4,54 B | no disponible | no disponible | Hugging Face (0 descargas) | Ajuste especializado en extracción de URLs |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | no disponible en esta ficha | Hugging Face | Modelo generalista del que deriva |
| nielsr/qwen35-4b-url-agent-lora-v2 | ~4 B + adaptador | no disponible | no disponible | Hugging Face | Adaptador LoRA original, requiere PEFT |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste está orientado a extracción de URLs dentro del harness OpenCode; su rendimiento fuera de ese contexto no está documentado.
- Licencia no declarada: no se puede confirmar el uso comercial; conviene contactar con el autor o revisar la licencia del modelo base Qwen3.5-4B antes de desplegarlo en producción.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe más allá del que herede del modelo base.
- Riesgo de alucinación: como todo modelo generativo, puede inventar URLs o comandos; en un agente con acceso a Bash y WebFetch esto implica riesgos de seguridad que requieren sandboxing y validación de salidas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base en la información disponible.
- Modelo con 0 descargas y 0 likes: no hay validación comunitaria ni reportes de uso.
- Dependencia del prompt de sistema y del harness: el comportamiento puede degradarse si se usa fuera de OpenCode o con un prompt distinto al previsto.
- Fecha de creación futura en los metadatos (2026-11-21), lo que puede indicar datos inconsistentes en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nielsr/qwen35-4b-url-agent-v3-sft-merged
- Adaptador LoRA de origen: https://huggingface.co/nielsr/qwen35-4b-url-agent-lora-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
