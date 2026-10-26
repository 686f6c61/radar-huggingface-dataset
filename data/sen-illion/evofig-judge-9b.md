# Sen-illion/Evofig-Judge-9B

## Resumen

Evofig-Judge-9B es un adaptador LoRA publicado por Sen-illion que se carga sobre el modelo vision-lenguaje Qwen/Qwen3.5-9B para evaluar figuras de framework científico. No es un modelo completo: el repositorio distribuye únicamente los pesos del adaptador (`adapter_model.safetensors`, unos 111 MB) junto con la configuración PEFT y los ficheros de procesador y tokenizador copiados del modelo base en el momento del entrenamiento.

Su función es actuar como juez dentro de la cadena EvoFig: comprueba si una figura recoge los módulos, etapas, relaciones, terminología y evidencia del artículo, y si es apta para una reparación acotada. El mismo checkpoint se usa en los dos asientos del jurado: el asiento de asesoramiento propone reparaciones limitadas y el asiento de aceptación decide si la figura reparada se acepta o se revierte.

Es relevante para quien trabaje en generación y verificación automática de figuras científicas, porque ofrece un componente de evaluación reutilizable con licencia Apache-2.0 y un conjunto de instrucciones de reproducción (paso 3174, rango 16, alpha 32, revisión concreta del modelo base). El alcance es estrecho: no es un modelo de recompensa general ni un evaluador de calidad de imagen genérico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer vision-lenguaje; el modelo base Qwen3.5-9B se describe como *vision-language backbone*, sin más detalle arquitectónico en la información disponible |
| Parámetros totales | No disponible para el adaptador (256 tensores, ~111 MB). El modelo base tiene aproximadamente 9 000 millones de parámetros según su identificador |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible como artefacto publicado. El ejemplo de uso de la model card carga la base en 4 bits NF4 con bitsandbytes (`bnb_4bit_use_double_quant=True`, cómputo en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (el adaptador sigue la licencia de Qwen3.5-9B; el código EvoFig se publica aparte bajo MIT) |
| Formato de pesos | safetensors (`adapter_model.safetensors`) más `adapter_config.json`, tokenizador, procesador y `chat_template.jinja` |

Parámetros de entrenamiento del adaptador: rango LoRA 16, alpha 32, módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`. Checkpoint `choice9b-sft-aesthetic`, paso 3174, época 0, clave de referencia `sft-no-reference`.

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre las proyecciones de atención y de MLP del modelo Qwen3.5-9B, un backbone vision-lenguaje. El repositorio incluye un fichero `adapter_key_check.json` con una comprobación offline que mapea los 256 tensores del adaptador a parámetros del índice del modelo base fijado, lo que permite verificar la compatibilidad antes de cargarlo.

El entrenamiento se realizó con PEFT 0.21.0 sobre 873 ejemplos de comparación de opción múltiple (749 positivos y 124 negativos), formulados como juicios sin referencia externa (`sft-no-reference`) en el paso 3174. No se documentan en la información disponible el volumen de tokens, la composición del dataset, ni si hubo RLHF o DPO; el nombre del checkpoint (`-sft-aesthetic`) sugiere una fase de ajuste supervisado con un componente estético, pero no se detalla su peso. La reproducción local documentada usa la revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a` de la base y torch 2.11.0+cu128, y se advierte explícitamente de que hay que fijar esa revisión si una versión futura cambia el procesador o la arquitectura.

## Capacidades

- Evaluación de figuras de framework científico a partir de un par imagen-texto: cobertura de módulos, etapas, relaciones, terminología y evidencia del artículo.
- Emisión de un juicio en JSON según el prompt de EvoFig (la model card indica «return only the JSON judgement requested by the EvoFig prompt»).
- Comparación de opción múltiple entre figuras o entre versiones de una figura, que es el formato con el que se entrenó (873 comparaciones).
- Asiento de asesoramiento: propuesta de reparaciones acotadas de la figura.
- Asiento de aceptación: decisión de aceptar o revertir una figura reparada, usando exactamente los mismos pesos que el asiento de asesoramiento.
- Capacidad de razonamiento visual sobre diagramas técnicos, heredada del backbone Qwen3.5-9B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: parcial e implícito; el adaptador es un componente de la cadena EvoFig, no un agente autónomo documentado.
- Capacidades multilingües: no disponible (no se declaran idiomas en el repositorio).
- Modo *thinking*, audio u otras modalidades: no disponible.

## Casos de uso

- Control de calidad previo al envío de un manuscrito: cargar el adaptador sobre Qwen3.5-9B, pasar cada figura de framework junto con el texto del artículo y obtener un juicio estructurado sobre módulos y terminología ausentes antes de la sumisión.
- Bucle de reparación acotada de figuras: usar el asiento de asesoramiento para generar propuestas de corrección limitadas (etiquetas, relaciones, elementos que faltan) que un editor de figuras aplica de forma programática, evitando reescrituras completas.
- Puerta de aceptación con reversión: usar el asiento de aceptación como filtro tras cada intento de reparación, de modo que solo se conserven las versiones que superan el criterio del jurado y el resto se revierta al estado anterior.
- Integración en CI documental: invocar el juez al compilar el LaTeX y bloquear la fusión de una rama si alguna figura no alcanza el umbral, combinándolo con las comprobaciones deterministas de grounding que la propia model card considera autoritativas.
- Auditoría de figuras generadas por modelos generativos: verificar que una figura producida automáticamente contiene las etapas y relaciones que el texto afirma, antes de incorporarla a un preprint o a documentación interna.
- Detección de desalineación entre figura y texto: revisar iteraciones de un mismo artículo para localizar figuras que hayan quedado obsoletas tras cambios en el texto (nuevos módulos o etapas no reflejados).
- Evaluación asistida en revisión por pares o preprint: generar un informe preliminar de adecuación de las figuras que un revisor humano valida, sin sustituir su criterio.
- Investigación sobre jueces multimodales: usar el adaptador como línea base reproducible para experimentar con prompts y estrategias de aceptación en tareas de evaluación de diagramas técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de exactitud en la tarea de juicio, y tampoco se aportan comparaciones numéricas con otros jueces. Los únicos datos de entrenamiento declarados son 873 ejemplos de comparación (749 positivos, 124 negativos), que no constituyen una evaluación de rendimiento.

## Requisitos de hardware

- El adaptador ocupa unos 111 MB, por lo que el coste relevante es siempre el del modelo base de ~9 000 millones de parámetros.
- VRAM estimada para el modelo base en bfloat16: en torno a 18 GB solo de pesos, más activaciones, caché KV y los tokens de imagen del codificador visual. En la práctica requiere GPU de 24 GB o más con lote pequeño.
- VRAM estimada en 4 bits NF4 (configuración del ejemplo oficial): aproximadamente 5-6 GB de pesos más sobrecarga; manejable en GPUs de 8-12 GB, con margen ajustado para imágenes grandes.
- VRAM estimada en 8 bits: del orden de 9-10 GB de pesos, más el resto de sobrecarga.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servicio con concurrencia; RTX 4090 o RTX 3090 (24 GB) para trabajo individual en bf16; RTX 4070 Ti, RTX 4080 o RTX 3060 de 12 GB para 4 bits.
- Cabe en GPU de consumo: sí, especialmente en cuantización de 4 bits; en bf16 solo en tarjetas de 24 GB y con lotes reducidos.
- Despliegue documentado: `transformers` + `peft` + `bitsandbytes` + `accelerate`, con `AutoModelForImageTextToText` y `AutoProcessor` y `trust_remote_code=True`. Para pesos completos hay que ejecutar `merge_and_unload()` en una máquina con memoria de host suficiente y guardar con `save_pretrained`.
- Otras opciones (vLLM, TGI, llama.cpp, Ollama): no documentadas en el repositorio. Requerirían fusionar el adaptador y, en el caso de llama.cpp u Ollama, convertir a GGUF; no se publica ningún GGUF oficial.
- Latencia y throughput: no disponible. No se aportan mediciones de tokens por segundo ni de tiempo por evaluación.

## Comparativa con modelos similares

No se han identificado en la información proporcionada otros adaptadores públicos equivalentes para evaluación de figuras de framework científico, ni se dispone de datos verificables de benchmarks que permitan una comparación numérica. La única referencia contrastable es el modelo base.

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sen-illion/Evofig-Judge-9B | Adaptador de ~111 MB sobre base de ~9 000 M | No disponible | Juez de figuras científicas (asesoramiento y aceptación) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B | ~9 000 M | No disponible | VLM generalista de imagen-texto | Apache-2.0 | Hugging Face |
| Otros jueces o adaptadores de figuras científicas | No disponible | No disponible | No disponible | No disponible | No identificados en la información disponible |

## Limitaciones y advertencias

- No es un modelo de recompensa general ni un evaluador de calidad de imagen arbitraria: solo se entrenó y evaluó con figuras de framework científico, no con fotografías, gráficas estadísticas o imágenes naturales.
- No debe usarse como autoridad única sobre corrección científica; la evidencia del artículo, las comprobaciones deterministas de grounding y las puertas de aceptación de EvoFig siguen siendo la referencia.
- El conjunto de entrenamiento es reducido (873 comparaciones) y está fuertemente desbalanceado hacia ejemplos positivos (749 frente a 124), lo que puede sesgar el juez hacia la aceptación y reducir su fiabilidad como discriminador en casos límite.
- El nombre del checkpoint (`sft-aesthetic`) sugiere que parte del criterio aprendido puede ser estético además de estructural; no se documenta qué peso tiene cada componente, por lo que existe riesgo de que penalice figuras correctas pero visualmente atípicas.
- Riesgo de alucinación y de formato: el adaptador está pensado para devolver solo el JSON solicitado por el prompt de EvoFig, pero no se documenta ningún esquema validado ni tasa de cumplimiento; conviene validar la salida con un parser estricto y un mecanismo de reintento.
- Idiomas soportados no declarados: se desconoce el comportamiento en figuras con texto en castellano u otras lenguas distintas del inglés.
- Longitud de contexto no disponible: no puede planificarse el tamaño máximo de artículo o de figura que admite el pipeline sin medirlo.
- El enlace al código de EvoFig está retenido por revisión anónima, lo que limita la reproducibilidad completa de los prompts y de la cadena de dos asientos.
- El repositorio no redistribuye el modelo base: hay que obtener Qwen3.5-9B por separado y cumplir su licencia Apache-2.0. El adaptador se distribuye bajo Apache-2.0, lo que permite uso comercial, pero el uso combinado queda sujeto también a la licencia de la base.
- Si se usa una revisión distinta de la base, el procesador o la arquitectura pueden cambiar; la model card recomienda fijar la revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a` en lugar de seguir `main`.
- El artefacto es solo un adaptador: cualquier despliegue en producción requiere fusionar o cargar la base, con el coste de memoria asociado.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Sen-illion/Evofig-Judge-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Ficheros incluidos en el repositorio: `adapter_model.safetensors`, `adapter_config.json`, `tokenizer.json`, `tokenizer_config.json`, `processor_config.json`, `chat_template.jinja`, `training_state.json`, `adapter_key_check.json`, `SHA256SUMS`, `LICENSE`
- Código EvoFig: enlace retenido por revisión anónima según la model card; no disponible
- Paper, blog o demo: no disponibles en la información proporcionada
- La búsqueda web realizada no devolvió resultados relevantes: únicamente definiciones del término francés «sen» en diccionarios y una web de vídeo satelital, sin relación con el modelo. No se han podido verificar enlaces adicionales a paper, blog, repositorio de código o demo.
