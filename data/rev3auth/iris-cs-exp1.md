# Rev3auth/iris-cs-exp1

## Resumen

iris-cs-exp1 es un ajuste fino (finetune) del modelo base IBM Granite 4.0 de 350 millones de parametros, publicado por el usuario Rev3auth en Hugging Face y distribuido unicamente en formato GGUF cuantizado Q4_K_M para su uso con llama.cpp. El repositorio ocupa 0,2 GB y contiene un unico archivo de pesos, `granite-4.0-350m.Q4_K_M.gguf`, lo que apunta a un modelo pequeno orientado a inferencia local en CPU o GPUs de gama baja.

El modelo ha sido entrenado y convertido con Unsloth, la herramienta de ajuste fino optimizado que acelera el entrenamiento y simplifica la exportacion a GGUF. El sufijo "exp1" y las etiquetas del repositorio (conversational, endpoints_compatible) sugieren un experimento de ajuste conversacional, aunque la model card no documenta el dataset, el metodo de entrenamiento ni el objetivo concreto del ajuste.

A fecha de la informacion disponible el repositorio no registra descargas ni "likes", la model card es minima y no se declaran licencia, idiomas soportados ni pipeline. Su relevancia es por tanto limitada y experimental: resulta interesante como ejemplo de flujo Unsloth -> GGUF sobre la familia Granite 4.0, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; la etiqueta `granitemoehybrid` apunta a la arquitectura hibrida de IBM Granite 4.0 (no confirmado por el autor) |
| Parametros totales | 352.379.904 (dato real de safetensors) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio (el modelo base IBM Granite 4.0 se distribuye bajo Apache 2.0, dato no confirmado para este finetune) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 0,2 GB |
| Modelo base | granite-4.0-350m |
| Herramienta de entrenamiento y conversion | Unsloth |
| Fecha de creacion | 2026-10-03 |
| Ultima actualizacion | 2026-10-03 |

## Arquitectura y entrenamiento

No se dispone de informacion publicada por el autor sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni la tecnica de alineacion empleada (RLHF, DPO u otras). El unico dato objetivo es el nombre del archivo, que identifica el modelo base como `granite-4.0-350m`, y la etiqueta `granitemoehybrid`, que sugiere que el modelo parte de la arquitectura hibrida de la familia IBM Granite 4.0 (combinacion de capas Transformer con mecanismos de estado recurrente tipo Mamba-2). Esta correspondencia no esta confirmada en la model card.

El proceso declarado es un ajuste fino seguido de la conversion a GGUF mediante Unsloth. La model card indica que el entrenamiento fue "2x faster with Unsloth", sin aportar cifras de tokens, epochs, learning rate ni tamano del conjunto de datos. No se documentan innovaciones tecnicas propias del autor; el valor del repositorio es fundamentalmente instrumental (demostracion del flujo Unsloth -> GGUF).

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` indica que el ajuste esta orientado a dialogos, aunque no se especifica el formato de prompt ni la plantilla de chat (la model card recomienda usar `--jinja`).
- Compatibilidad con llama.cpp: puede ejecutarse con `llama-cli -hf Rev3auth/iris-cs-exp1 --jinja` para texto y `llama-mtmd-cli` para modelos multimodales (el autor incluye ambos comandos genericos, sin confirmar que este modelo tenga vision).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el modelo puede servirse detras de endpoints tipo API compatible con OpenAI.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Experimentacion con ajuste fino local: el modelo sirve como plantilla para reproducir el flujo Unsloth -> GGUF sobre un modelo base de 350M, util para validar pipelines de entrenamiento antes de escalar a modelos mayores.
- Inferencia en dispositivos con recursos muy limitados: con 352M de parametros y 0,2 GB en Q4_K_M, puede desplegarse en Raspberry Pi, portatiles sin GPU dedicada o contenedores con menos de 1 GB de RAM.
- Pruebas de integracion con llama.cpp y servidores compatibles con OpenAI: util para verificar que una infraestructura de serving acepta modelos GGUF pequenos antes de pasar a produccion.
- Filtrado y clasificacion de texto ligera: si el finetune conserva la competencia del modelo base, podria emplearse para tareas de etiquetado o triaje de bajo coste, aunque no hay evaluacion publicada que lo respalde.
- Demostraciones y docencia: su tamano permite ejecutar ejemplos de generacion de texto en aula o en talleres sin infraestructura GPU.
- Prototipado de asistentes conversacionales minimos: como punto de partida rapido para validar una interfaz de chat antes de invertir en un modelo mayor.
- Generacion de codigo en produccion: no recomendado. No hay evidencia ni benchmarks que respalden esta capacidad en este finetune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan comparaciones con el modelo base o con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,3-0,5 GB con la cuantizacion Q4_K_M publicada (pesos de 0,2 GB mas overhead de contexto y cache KV).
- GPU recomendadas: cualquier GPU con 1 GB o mas de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos (GTX 1050, RTX 3060, RTX 4090, etc.), e incluso en GPUs integradas.
- Ejecucion en CPU: viable. Con 352M de parametros en Q4_K_M, la inferencia en CPU moderna deberia superar con holgura los 20-50 tokens por segundo, aunque el dato exacto no esta publicado.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (previa importacion del GGUF), y cualquier runtime compatible con GGUF. vLLM y TGI no son opciones directas para GGUF sin conversion previa a safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para iris-cs-exp1, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rev3auth/iris-cs-exp1 | 352M | GGUF Q4_K_M | no disponible | no disponible | Hugging Face (0 descargas) |
| ibm-granite/granite-4.0-350m (modelo base) | 352M | safetensors | no disponible en la informacion proporcionada | Apache 2.0 (segun el catalogo de IBM) | Hugging Face |
| Modelos de ~350M de la familia Qwen o SmolLM | ~350-500M | safetensors, GGUF | variable segun version | variable (Apache 2.0 en varios casos) | Hugging Face |

No se dispone de datos suficientes para una comparacion de rendimiento cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluacion publicada, por lo que se desconoce si el finetune mejora o degrada el comportamiento del modelo base.
- Riesgo de alucinacion: con 352M de parametros, la tasa de afirmaciones incorrectas es estructuralmente alta, especialmente en tareas de conocimiento factual, matematicas o razonamiento multi-paso.
- Idiomas: no declarados. No se puede asumir un buen rendimiento en castellano sin evaluacion.
- Contexto: longitud desconocida. No conviene asumir ventanas largas ni usarlo para documentos extensos.
- Licencia no declarada en el repositorio: antes de cualquier uso comercial hay que verificar los terminos aplicables tanto de este finetune como del modelo base granite-4.0-350m. La ausencia de licencia explicita es un riesgo legal en produccion.
- Model card minima y sin trazabilidad: no se documentan dataset, hiperparametros ni metodo de alineacion, lo que impide auditar sesgos o comportamientos indeseados.
- Repositorio sin adopcion: 0 descargas y 0 "likes" en el momento de la consulta, sin senales de mantenimiento o soporte.
- Formato unico: solo existe GGUF Q4_K_M, sin versiones en safetensors ni otras cuantizaciones, lo que limita su uso con frameworks de entrenamiento o serving basados en PyTorch.
- Orientacion experimental: el nombre "exp1" indica que se trata de una prueba de concepto, no de un artefacto estable.
- No se ha confirmado que el modelo tenga capacidades multimodales, pese a que la model card mencione el comando `llama-mtmd-cli` como opcion generica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rev3auth/iris-cs-exp1
- Unsloth (herramienta de entrenamiento y conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia): https://github.com/ggml-org/llama.cpp
- Modelo base de referencia (nombre inferido del archivo GGUF): IBM Granite 4.0 350M en Hugging Face (no se ha facilitado enlace directo en la informacion disponible)
