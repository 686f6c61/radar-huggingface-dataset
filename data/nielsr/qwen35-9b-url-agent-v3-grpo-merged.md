# nielsr/qwen35-9b-url-agent-v3-grpo-merged

## Resumen

qwen35-9b-url-agent-v3-grpo-merged es un checkpoint fusionado (merged) publicado por el usuario nielsr, derivado de un ajuste fino con GRPO sobre el modelo base nielsr/qwen35-9b-url-agent-v3-sft-merged, que a su vez parte de la familia Qwen 3.5. El modelo está especializado en extracción de URLs dentro de un arnés de agentes denominado OpenCode, y se distribuye como un checkpoint autónomo listo para cargar con transformers, sin necesidad de aplicar el adaptador LoRA original.

Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y un repositorio de 18,8 GB en formato safetensors, se trata de un modelo multimodal de tipo image-text-to-text según sus etiquetas, aunque su pipeline declarado es text-generation. La model card es extremadamente escueta: no documenta licencia, idiomas, longitud de contexto ni resultados de evaluación, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

Su relevancia es acotada y experimental: ilustra un patrón de ajuste fino con aprendizaje por refuerzo (GRPO) orientado a una tarea concreta de agente (extracción de URLs verificadas) sobre trazas de OpenCode. No es un modelo de propósito general ni cuenta con documentación suficiente para evaluar su calidad de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen 3.5 (etiqueta `qwen3_5`); detalles no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-generation (etiquetas adicionales: image-text-to-text) |
| Modelo base | nielsr/qwen35-9b-url-agent-v3-sft-merged |
| Metodo de ajuste | GRPO sobre LoRA, posteriormente fusionado (merged) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen 3.5, con 9.409.813.744 parámetros. Las etiquetas del repositorio incluyen `image-text-to-text`, lo que sugiere capacidades multimodales de entrada imagen-texto, aunque la model card no describe el codificador visual ni la configuración de capas, cabezas de atención o dimensión oculta.

El entrenamiento parte de un checkpoint SFT (nielsr/qwen35-9b-url-agent-v3-sft-merged) y aplica GRPO (Group Relative Policy Optimization) mediante un adaptador LoRA, que después se fusiona en los pesos base para producir este checkpoint autónomo. Los datos de entrenamiento son trazas verificadas de extracción de URLs generadas con OpenCode, según indica el autor. No se especifican el número de tokens de entrenamiento, la composición del dataset, la configuración de recompensas del GRPO ni si hubo etapas adicionales de alineamiento.

La innovación técnica destacable es el propio pipeline: uso de aprendizaje por refuerzo con recompensas verificables sobre trazas de agente para una tarea de extracción estructurada, y publicación del resultado como checkpoint fusionado para simplificar el despliegue.

## Capacidades

- Generación de texto conversacional y de tipo agente, según el pipeline declarado.
- Extracción de URLs dentro de un arnés de agente (OpenCode) con acceso a herramientas Bash, Read, Grep, Glob, WebFetch y salida estructurada.
- Soporte de tool calling y de flujos multi-paso, condicionado al entorno OpenCode descrito por el autor.
- Posible entrada de imágenes (etiqueta `image-text-to-text`), sin documentación que lo confirme ni detalle.
- Capacidades multilingües: no disponibles.
- Modo de razonamiento extendido (thinking): no disponible.

## Casos de uso

- Extracción de URLs en pipelines de scraping: el modelo puede operar dentro de OpenCode con WebFetch y devolver URLs estructuradas a partir de páginas o trazas, que es exactamente la tarea para la que fue ajustado.
- Automatización de investigación web con agentes: combinado con Grep y Glob, permite localizar y consolidar enlaces en repositorios de documentos o directorios de proyectos.
- Enriquecimiento de datasets: extracción y verificación de enlaces en corpus de texto para construir índices de referencias.
- Evaluación de arneses de agentes: sirve como caso de estudio de ajuste con GRPO sobre trazas verificadas para comparar base frente a adaptador.
- Prototipado de asistentes con salida estructurada: su entrenamiento orientado a structured-output lo hace adecuado para tareas donde la respuesta debe ajustarse a un esquema JSON.
- Monitorización de contenidos: detección y normalización de enlaces en flujos de revisión, siempre con validación posterior dado el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona una evaluación base-versus-adapter en el repositorio de origen, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 24 GB o más para contexto corto.
- Cuantización a 8 bits: en torno a 10-11 GB de pesos; a 4 bits: en torno a 5-6 GB, aunque no se publican variantes GGUF oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para BF16 sin cuantizar; RTX 4090 (24 GB) puede alojar los pesos en BF16 con contexto limitado.
- GPU de consumo: posible en RTX 4090 y, con cuantización, en GPUs de 12-16 GB; no se documenta soporte oficial para ello.
- Despliegue: transformers es la librería declarada; vLLM, TGI, llama.cpp u Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| qwen35-9b-url-agent-v3-grpo-merged | 9,41 B | no disponible | no disponible | Agente de extracción de URLs (GRPO + merge) |
| nielsr/qwen35-9b-url-agent-v3-sft-merged | no disponible | no disponible | no disponible | Checkpoint SFT previo del mismo linaje |
| Qwen 3.5 base (9B) | ~9 B (no confirmado) | no disponible | no disponible | Modelo generalista del que deriva la familia |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Model card mínima: sin licencia, idiomas, contexto ni evaluación documentados; el uso comercial es incierto hasta confirmar la licencia del modelo base.
- Especialización estrecha: ajustado para extracción de URLs en OpenCode; su rendimiento fuera de ese arnés y de esa tarea no está validado.
- Riesgo de alucinación en URLs: puede generar enlaces plausibles pero inexistentes; se recomienda verificación con WebFetch o comprobación HTTP antes de usarlos en producción.
- Dependencia del arnés: el prompt de sistema y las herramientas de OpenCode forman parte del diseño; sin ellos el comportamiento puede degradarse.
- Sesgos: no documentados por el autor; heredables del modelo base y de las trazas de entrenamiento.
- Sin variantes cuantizadas oficiales ni soporte declarado en motores de inferencia de alto rendimiento.
- Repositorio sin descargas ni validación comunitaria en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/nielsr/qwen35-9b-url-agent-v3-grpo-merged
- Adaptador LoRA de origen: https://huggingface.co/nielsr/qwen35-9b-url-agent-v3-grpo-lora
- Checkpoint SFT base: https://huggingface.co/nielsr/qwen35-9b-url-agent-v3-sft-merged
- Arnés OpenCode: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
