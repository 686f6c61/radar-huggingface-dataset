# ggml-org/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF

## Resumen

`ggml-org/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF` es la conversión a formato GGUF del modelo Nemotron-3.5-Bolt-E4B de NVIDIA, publicada por la organización ggml-org (responsable de llama.cpp) a partir de los pesos BF16 originales. No es un modelo nuevo: es un artefacto de cuantización generado automáticamente con la herramienta `ggml-org/convert` y pensado para ejecutarse en llama.cpp y en el runtime llama.app mediante el comando `llama serve -hf ggml-org/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF`.

El modelo subyacente declara 7.518.069.290 parámetros totales (unos 7,5 B) y se distribuye bajo licencia Apache 2.0, lo que lo sitúa en la franja de modelos locales de tamaño medio con permiso explícito de uso comercial. Su relevancia práctica es que permite desplegar la propuesta conversacional de NVIDIA en hardware de consumo y en entornos sin GPU de datacenter, sin necesidad de descargar los pesos BF16 originales.

Ahora bien, la model card del repositorio es un esqueleto: incluye literalmente un `TODO: add info` y no documenta arquitectura, longitud de contexto, idiomas ni niveles de cuantización. Todo lo que depende de esa documentación se marca aquí como no disponible, y las estimaciones de hardware se derivan únicamente del recuento de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada en la model card) |
| Parámetros totales | 7.518.069.290 (~7,5 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF cuantizado; niveles concretos no especificados (repositorio de 23,7 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (origen en BF16) |
| Desarrollador del modelo | NVIDIA (pesos originales) |
| Autor del repositorio | ggml-org (conversión automática) |
| Modelo base declarado | nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-BF16 (metadatos de HuggingFace: nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16) |
| Pipeline | text-generation |
| Tamaño del repositorio | 23,7 GB |
| Fecha de publicación | 23 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura, los datos de entrenamiento ni el proceso de alineación (RLHF, DPO u otros). No hay información sobre número de tokens, composición del dataset ni innovaciones técnicas como decodificación especulativa o atención lineal. Tampoco se confirma si se trata de un transformer denso o de un esquema con activación selectiva: el sufijo «E4B» del nombre y la diferencia entre los 7,5 B totales y esa etiqueta sugieren un diseño de parámetros efectivos, pero es una hipótesis no verificada y no debe tomarse como dato.

Lo único documentado es el proceso de conversión: los pesos se transformaron con `ggml-org/convert` de forma automática, sin validación posterior por parte de NVIDIA. Existe además una variante de los pesos originales etiquetada como `DFlash-NVFP4`, lo que apunta a un formato optimizado para inferencia en FP4 en el ecosistema de NVIDIA, pero sus detalles técnicos tampoco aparecen en este repositorio.

## Capacidades

- Generación de texto y uso conversacional: es la única funcionalidad confirmada por los metadatos (`text-generation`, etiqueta `conversational`).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a través de una API compatible con el esquema habitual de OpenAI en llama.cpp / llama.app.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible; la model card no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible; no se mencionan en la información proporcionada.
- Ejecución local: capacidad verificable del artefacto, al estar en formato GGUF y ser servible con `llama serve`.

## Casos de uso

- Asistente conversacional on-premise: al ser un GGUF de 7,5 B con licencia Apache 2.0, puede servirse con llama.cpp en una estación de trabajo y mantener las conversaciones dentro de la red corporativa, sin enviar datos a APIs externas. La longitud de contexto debe validarse empíricamente antes de diseñar flujos multi-turno largos.
- Sustituto local de una API de chat en pruebas de integración: gracias a la etiqueta `endpoints_compatible`, permite levantar un servidor de chat con `llama serve` y apuntar contra él los clientes que en producción consumirán un proveedor externo, sin coste por token.
- Procesamiento por lotes de texto en hardware modesto: resúmenes, reescritura, clasificación o extracción de campos sobre volúmenes grandes de documentos, donde el coste por token de una API en la nube resulta prohibitivo y la calidad de un modelo de 7,5 B es suficiente.
- Generación aumentada por recuperación (RAG) sobre documentación interna: el modelo actúa como generador final sobre los fragmentos recuperados; requiere fijar previamente la ventana de contexto real, que no está documentada.
- Base para experimentación con fine-tuning: entrenar sobre los pesos BF16 originales de NVIDIA y usar este repositorio como destino de cuantización para servir la versión ajustada en local.
- Evaluación comparativa de cuantizaciones: al existir varios ficheros GGUF en el repositorio (23,7 GB en total), sirve para medir la degradación de calidad y la ganancia de velocidad entre niveles de cuantización sobre una misma tarea.
- Despliegue en portátiles y equipos de desarrollo: con cuantizaciones de 4-5 bits cabe en GPUs de 8-12 GB y en Apple Silicon con memoria unificada, lo que facilita distribuirlo a todo un equipo de ingeniería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se han publicado comparaciones frente a modelos de tamaño similar.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parámetros (7,5 B); la model card no publica tamaños de fichero ni requisitos oficiales.

| Precisión | VRAM solo para pesos (estimada) | Notas |
|---|---|---|
| BF16 / FP16 | ~15,0 GB | Requiere GPU de 24 GB o más para dejar espacio a la caché KV |
| Q8_0 | ~8,0 GB | Cómodo en GPUs de 12-16 GB con contexto moderado |
| Q6_K | ~6,2 GB | — |
| Q5_K_M | ~5,3 GB | — |
| Q4_K_M | ~4,5 GB | Opción habitual para GPUs de 8 GB |
| Q3_K_M | ~3,7 GB | Pérdida de calidad apreciable |

- GPU recomendadas: RTX 4090 (24 GB) para FP16 o Q8 con contexto amplio; RTX 4080 / 4070 Ti Super (16 GB) y RTX 4060 Ti (16 GB) para Q8-Q5; RTX 3060 (12 GB) y RTX 4060 (8 GB) para Q4-Q5.
- Cabe en GPU de consumo: sí, en cualquier tarjeta de 8 GB o más usando cuantizaciones de 4-5 bits; también en CPU con llama.cpp y en Apple Silicon con 16 GB de memoria unificada.
- Despliegue: llama.cpp (referencia directa del repositorio), llama.app mediante `llama serve -hf ggml-org/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF`, Ollama a partir del GGUF, llama-cpp-python para integración en Python. Para servir con vLLM o TGI conviene partir de los pesos BF16/safetensors originales de NVIDIA, ya que son los formatos soportados de forma nativa.
- Latencia y throughput: no disponible. Dependen del nivel de cuantización, del hardware y de una longitud de contexto que no está documentada, por lo que no se puede ofrecer una cifra fiable.

## Comparativa con modelos similares

La comparación es estructural, basada en especificaciones públicas de cada modelo. No incluye rendimiento porque este modelo no tiene benchmarks publicados y su contexto no está documentado.

| Modelo | Parámetros | Contexto | Licencia | Formatos | Rendimiento |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B (este GGUF) | ~7,5 B | no disponible | Apache 2.0 | GGUF | no disponible |
| Llama 3.1 8B | ~8,0 B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | benchmarks públicos disponibles |
| Qwen2.5-7B | ~7,6 B | 32.768 nativo (131.072 con YaRN) | Apache 2.0 | safetensors, GGUF | benchmarks públicos disponibles |
| Mistral 7B v0.3 | ~7,2 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | benchmarks públicos disponibles |

Frente a las alternativas, la ventaja de este repositorio es la licencia Apache 2.0 combinada con el respaldo de NVIDIA; la desventaja es la ausencia total de documentación y de evaluación publicada, que impide recomendarlo frente a modelos con contexto y benchmarks verificables sin una validación propia previa.

## Limitaciones y advertencias

- Model card incompleta: contiene un `TODO: add info`; no hay arquitectura, contexto, idiomas ni datos de entrenamiento documentados.
- Inexistencia de benchmarks: no se puede estimar su calidad frente a alternativas de 7-8 B sin evaluarlo internamente.
- Conversión automática sin validación de NVIDIA: el artefacto lo genera `ggml-org/convert`, de modo que posibles degradaciones introducidas por la cuantización no están certificadas por el autor del modelo.
- Inconsistencia en el modelo base: los metadatos de HuggingFace apuntan a `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16` mientras la model card cita `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-BF16`; conviene verificar cuál es el checkpoint exacto antes de reproducir resultados.
- Idioma sin declarar: si el caso de uso es en castellano, hay que validar el comportamiento de forma empírica, ya que no se documenta cobertura multilingüe.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; en producción se recomienda verificación factual y citas de fuentes en flujos RAG.
- Sesgos: no documentados; al no publicarse la composición del dataset de entrenamiento no es posible evaluar sesgos conocidos.
- Licencia: el repositorio declara Apache 2.0, que permite uso comercial; aun así, conviene revisar la licencia del checkpoint base de NVIDIA por si impone condiciones adicionales.
- Madurez comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan contrastar problemas de ejecución.
- Formato GGUF: no es apto para reentrenamiento directo; para fine-tuning hay que partir de los pesos BF16 originales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF
- Modelo base (BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-BF16
- Variante NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash-NVFP4
- Runtime de inferencia (llama.app): https://llama.app
- Herramienta de conversión: https://github.com/ggml-org/convert
