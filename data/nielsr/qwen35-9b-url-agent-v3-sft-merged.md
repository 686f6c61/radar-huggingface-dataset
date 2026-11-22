# nielsr/qwen35-9b-url-agent-v3-sft-merged

## Resumen

Qwen3.5-9B URL extraction agent es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario nielsr y publicado en Hugging Face. Se trata de un checkpoint fusionado (merged) de un adaptador LoRA previo, entrenado sobre trazas verificadas de extracción de URLs generadas en el entorno OpenCode. El modelo está pensado para funcionar como agente dentro del arnés OpenCode, con acceso a herramientas de shell y de red.

El problema que aborda es la extracción estructurada de URLs a partir de tareas de navegación y recuperación de información, un caso de uso típico de agentes que combinan razonamiento multi-paso con llamadas a herramientas. Al estar fusionado en un checkpoint completo de aproximadamente 9.400 millones de parámetros, puede desplegarse de forma autónoma sin necesidad de cargar el adaptador PEFT por separado.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo muy especializado, con cero descargas y sin métricas publicadas en el momento de la consulta, por lo que debe evaluarse como artefacto experimental más que como modelo de producción general. La información disponible sobre arquitectura interna, datos de entrenamiento y licencia es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers); tamano del repo 18,8 GB |
| Modelo base | Qwen/Qwen3.5-9B |
| Modalidad | image-text-to-text (tag), pipeline text-generation |
| Metodo de ajuste | LoRA fusionado (PEFT, `merged`) |

## Arquitectura y entrenamiento

El modelo es un checkpoint fusionado de un adaptador LoRA (`nielsr/qwen35-9b-url-agent-lora-kimi`) sobre el modelo base Qwen/Qwen3.5-9B. La arquitectura subyacente corresponde a la familia Qwen3.5, un transformer decoder-only, aunque la model card no detalla número de capas, dimensiones ocultas, mecanismo de atención ni longitud de contexto nativa. El tag `image-text-to-text` sugiere que el modelo base podría aceptar entradas multimodales, pero no se especifica si el ajuste conserva esa capacidad.

El entrenamiento se realizó sobre "trazas verificadas de extracción de URLs" generadas en el entorno OpenCode, según la model card. No se indica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la fusión del adaptador LoRA en los pesos base. La ausencia de estos datos impide evaluar la calidad y generalización del ajuste.

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a tareas de agente.
- Extracción estructurada de URLs mediante herramientas de shell y red (Bash, Read, Grep, Glob, WebFetch).
- Soporte de tool calling / function calling dentro del arnés OpenCode, incluyendo salida estructurada.
- Ejecución de flujos de navegación y recuperación de información en múltiples pasos.
- Capacidad multimodal potencial heredada del modelo base (tag `image-text-to-text`), sin confirmación en la model card.
- Capacidades multilingües: no disponibles (no se documentan idiomas).

## Casos de uso

- Extracción de URLs en pipelines de scraping: el modelo puede recibir una tarea de recuperación y devolver las URLs relevantes usando WebFetch y herramientas de búsqueda, integrándose en un pipeline automatizado de recolección de enlaces.
- Automatización de tareas de investigación web: dentro de OpenCode, el agente puede encadenar Grep y Glob sobre repositorios locales y WebFetch sobre recursos remotos para localizar referencias y enlaces.
- Auditoría de enlaces en documentación: el modelo puede recorrer un árbol de ficheros con Glob/Read y verificar la presencia y formato de URLs en documentación técnica.
- Generación de informes estructurados de enlaces: gracias a la salida estructurada, puede producir JSON con campos de URL, origen y estado, útil para alimentar sistemas downstream.
- Asistente de desarrollo en terminal: al ejecutarse con Bash, puede ayudar a construir comandos que resuelvan tareas de extracción y filtrado de URLs en entornos Unix.
- Evaluación de agentes y arneses: sirve como checkpoint de referencia para comparar el rendimiento base frente al adaptador en tareas de extracción de URLs, tal como se documenta en el repositorio fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluación "base-versus-adapter" en el repositorio fuente, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto corto.
- En cuantización de 8 bits: en torno a 10-12 GB de VRAM; en 4 bits: en torno a 6-7 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue sin cuantizar; RTX 4090 (24 GB) para BF16 con contexto limitado.
- Cabe en GPU de consumo: RTX 4090 en BF16 con contexto reducido; RTX 3090/4080 y superiores en cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI previsiblemente compatibles con safetensors; llama.cpp/Ollama requerirían conversión a GGUF, no disponible en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| nielsr/qwen35-9b-url-agent-v3-sft-merged | 9,41 B | no disponible | no disponible | Agente de extracción de URLs (fine-tuning) |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible | no disponible | Modelo generalista |
| nielsr/qwen35-9b-url-agent-lora-kimi | ~9 B (LoRA) | no disponible | no disponible | Adaptador LoRA del mismo ajuste |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: su rendimiento fuera del arnés OpenCode y de tareas de extracción de URLs no está documentado.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- Licencia no disponible: no puede confirmarse el uso comercial; debe verificarse en el modelo base Qwen/Qwen3.5-9B antes de cualquier despliegue.
- Idiomas no documentados: riesgo de comportamiento deficiente fuera del idioma o idiomas de entrenamiento.
- Longitud de contexto desconocida: no apto para planificación de despliegue sin pruebas empíricas.
- Riesgo de alucinación inherente a modelos generativos, especialmente en la construcción de URLs que pueden no existir o ser inseguras.
- Dependencia de herramientas externas (Bash, WebFetch): la seguridad del agente depende del aislamiento del arnés; ejecutar comandos de shell conlleva riesgos de seguridad.
- Sin datos de sesgos, evaluación de seguridad ni filtros documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nielsr/qwen35-9b-url-agent-v3-sft-merged
- Adaptador LoRA fuente: https://huggingface.co/nielsr/qwen35-9b-url-agent-lora-kimi
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
