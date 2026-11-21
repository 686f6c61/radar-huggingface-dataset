# postrational/Qwen3.8-27B-sft2-GGUF

## Resumen

Qwen3.8-27B-sft2-GGUF es una distribucion en formato GGUF de un modelo de la familia Qwen3.5, publicado por el usuario postrational en Hugging Face. El modelo ha sido afinado (fine-tuning supervisado, de ahi el sufijo "sft2") y posteriormente convertido a GGUF mediante la herramienta Unsloth, con el objetivo de facilitar su ejecucion en llama.cpp y entornos de inferencia local. Los tags del repositorio indican que se trata de un modelo vision-language (multimodal), aunque la model card no detalla la arquitectura interna ni la composicion del dataset de entrenamiento.

El modelo cuenta con 27.320.697.856 parametros totales (aproximadamente 27,3 mil millones), lo que lo situa en la categoria de modelos de gran tamano que requieren cuantizacion para su despliegue en hardware de consumo. El repositorio incluye un archivo de pesos cuantizado en Q4_K_M y un proyector multimodal en BF16 (mmproj), lo que confirma el soporte de entrada de imagenes a traves de llama-mtmd-cli.

La relevancia de esta publicacion radica en su caracter practico: ofrece una via directa para ejecutar un modelo de ~27B con capacidades multimodales en llama.cpp, sin necesidad de infraestructura de servidor. No obstante, la informacion publicada es muy limitada (sin licencia declarada, sin idiomas especificados, sin benchmarks ni detalles de entrenamiento), por lo que debe evaluarse con cautela antes de un uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como qwen3_5 y vision-language-model) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M) + BF16 mmproj |

## Arquitectura y entrenamiento

La informacion disponible no permite confirmar la arquitectura interna del modelo. Los tags del repositorio apuntan a la familia Qwen3.5 y a un modelo vision-language, lo que sugiere un transformer con un codificador o proyector visual acoplado, pero no se especifica el tipo exacto de atencion, el numero de capas ni la configuracion del componente multimodal. El archivo BF16-mmproj.gguf confirma la existencia de un proyector multimodal separado, compatible con el flujo de llama-mtmd-cli.

Respecto al entrenamiento, la model card solo indica que el modelo fue afinado y convertido a GGUF con Unsloth, y que el proceso de entrenamiento fue "2x mas rapido" gracias a dicha herramienta. No se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras. Tampoco se documenta la innovacion tecnica concreta del ajuste "sft2" mas alla del fine-tuning supervisado.

## Capacidades

- Generacion de texto conversacional, segun el tag "conversational" del repositorio.
- Procesamiento multimodal de imagenes: el repositorio incluye un proyector mmproj y documenta el uso mediante `llama-mtmd-cli`, lo que indica soporte de entrada visual.
- Ejecucion local mediante llama.cpp, con soporte de plantillas Jinja (`--jinja`).
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere integracion en servicios de inferencia.
- Capacidades de razonamiento y codigo: no confirmadas explicitamente en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en llama.cpp con `llama-cli` y `--jinja` para mantener conversaciones multi-turno en una maquina local, aprovechando su formato GGUF Q4_K_M para reducir requisitos de memoria.
- Analisis de imagenes en escritorio: mediante `llama-mtmd-cli` y el proyector BF16, se puede usar para describir imagenes, responder preguntas sobre capturas de pantalla o extraer informacion de documentos escaneados sin enviar datos a la nube.
- Prototipado de aplicaciones multimodales: al ser compatible con endpoints, sirve como backend para probar interfaces de chat con entrada de imagen antes de migrar a un modelo mayor o a un servicio gestionado.
- Procesamiento de documentacion tecnica con imagenes: combinacion de texto e imagenes en un mismo flujo para resumir manuales, diagramas o figuras, siempre que la ventana de contexto (no documentada) sea suficiente.
- Entornos con requisitos de privacidad: al ejecutarse localmente en formato GGUF, permite procesar conversaciones e imagenes sensibles sin salida de datos a terceros.
- Educacion y experimentacion: util para investigadores que quieran estudiar el comportamiento de un modelo de ~27B afinado y multimodal en hardware de consumo, con la posibilidad de comparar el efecto del fine-tuning "sft2" frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M de un modelo de ~27,3B ocupa aproximadamente 16-17 GB (el repositorio completo pesa 17,9 GB incluyendo el mmproj), por lo que se necesita al menos ~18-20 GB de VRAM para cargar pesos y contexto en GPU.
- GPU recomendadas: A100 40GB, H100, L40S o RTX 6000 Ada para ejecucion holgada; RTX 4090 (24 GB) puede alojar el Q4_K_M con contexto limitado.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) con cuantizacion Q4_K_M y contexto moderado; en GPUs de 16 GB requeriria cuantizaciones mas agresivas no incluidas en el repositorio o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), y por compatibilidad de formato, servidores basados en llama.cpp; vLLM y TGI no estan confirmados para este repositorio GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-sft2-GGUF | ~27,3B | no disponible | Si (mmproj) | no disponible | GGUF |
| Qwen2.5-VL-32B | ~32B | no disponible en esta ficha | Si | no disponible en esta ficha | safetensors/GGUF |
| Gemma 3 27B | ~27B | no disponible en esta ficha | Si | no disponible en esta ficha | safetensors/GGUF |

La comparativa se limita a categorias por tamano y naturaleza multimodal; no se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica la licencia, lo que impide confirmar si el uso comercial esta permitido.
- Idiomas no documentados: se desconoce el soporte multilingue real y la calidad en castellano.
- Ventana de contexto no publicada: no se puede planificar el uso en tareas de contexto largo.
- Sin benchmarks: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni tareas multimodales.
- Riesgo de alucinacion: inherente a los modelos generativos; sin evaluacion publicada no puede cuantificarse.
- Sesgos: no documentados por el autor; se desconoce la composicion del dataset de fine-tuning.
- Modelo de autor individual ("postrational") sin validacion de terceros: descargas y likes a cero en el momento de la consulta, lo que reduce la senal de calidad.
- El fine-tuning "sft2" no esta descrito: se desconoce que comportamiento se ha modificado respecto al modelo base.
- Compatibilidad de despliegue limitada a llama.cpp: no se confirma soporte en vLLM, TGI u otros servidores de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/postrational/Qwen3.8-27B-sft2-GGUF
- Unsloth (herramienta de fine-tuning y conversion): https://github.com/unslothai/unsloth
- llama.cpp (motor de inferencia): https://github.com/ggml-org/llama.cpp
