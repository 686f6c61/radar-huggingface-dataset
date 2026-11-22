# mradermacher/Qwen3.8-27B-ComfyUI-GGUF

## Resumen

Qwen3.8-27B-ComfyUI-GGUF es la versión cuantizada en formato GGUF del modelo tolgaertunc/Qwen3.8-27B-ComfyUI, un ajuste fino (SFT) del modelo Qwen3.8 de 27.320.697.856 parámetros orientado a flujos de trabajo de ComfyUI y a tareas de visión-lenguaje. El trabajo de cuantización lo firma mradermacher, un conocido publicador de quants estáticos para la comunidad de inferencia local. El resultado es un conjunto de ficheros GGUF que permiten ejecutar un modelo multimodal de ~27B en hardware de consumo mediante llama.cpp y derivados.

El modelo base incorpora las etiquetas `vision-language` y `mtp` (multi-token prediction), lo que indica capacidades multimodales y una cabeza de predicción multi-token. El ajuste se realizó con Unsloth según los tags del repositorio. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque conviene verificar las condiciones del modelo base original.

La relevancia de esta ficha es práctica: ofrece un abanico de cuantizaciones desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), más dos ficheros `mmproj` (proyector multimodal) en Q8_0 y f16. Con 716 descargas y creado en agosto de 2026, es un artefacto reciente y de nicho, pensado para quienes quieren probar el modelo sin depender de GPUs de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8), multimodal con proyector `mmproj` y cabeza MTP; detalles internos no disponibles |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado) y safetensors (modelo base) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino supervisado (SFT) del Qwen3.8 de 27B, realizado con Unsloth según los tags del repositorio. La presencia de la etiqueta `vision-language` y de los ficheros `mmproj` confirma que se trata de un modelo multimodal: un codificador visual se conecta al transformer de lenguaje mediante un proyector que se distribuye como fichero GGUF aparte. La etiqueta `mtp` sugiere una cabeza de predicción multi-token, técnica que permite generar varios tokens por paso de decodificación y mejorar el throughput.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como atención lineal o decodificación especulativa. El trabajo de mradermacher consiste en cuantización estática (sin imatrix, según indica la model card) de los pesos del modelo base, manteniendo el proyector multimodal en dos precisiones separadas.

## Capacidades

- Generación de texto conversacional en inglés, con ajuste específico para diálogo multi-turno.
- Procesamiento de imágenes: los ficheros `mmproj` permiten entrada visual junto con texto.
- Predicción multi-token (MTP) según los tags del repositorio, orientada a acelerar la generación.
- Integración con ComfyUI: el ajuste del modelo base está pensado para flujos de trabajo de generación visual en ese entorno.
- Capacidades de razonamiento y código: no confirmadas explícitamente en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language`.

## Casos de uso

- Flujos de trabajo en ComfyUI: el modelo se puede cargar como nodo de lenguaje/visión dentro de un grafo de ComfyUI para generar descripciones, prompts o evaluar imágenes intermedias, aprovechando el ajuste específico del modelo base.
- Asistentes conversacionales en local: con la cuantización Q4_K_M (16,9 GB) se puede desplegar un chatbot multi-turno en una estación de trabajo con una sola GPU de 24 GB, sin depender de APIs externas.
- Descripción y análisis de imágenes: usando el fichero `mmproj-Q8_0` (0,7 GB) junto con un quant de pesos, se puede construir un pipeline de image captioning o respuesta a preguntas visuales en inglés.
- Prototipado de investigación multimodal: la disponibilidad de cuantizaciones desde 11 GB permite experimentar con un modelo de 27B en GPUs de consumo, algo inviable con los pesos en f16.
- Generación de prompts para pipelines de difusión: el ajuste orientado a ComfyUI sugiere utilidad para expandir o refinar prompts de texto a imagen dentro de un flujo automatizado.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece once variantes de pesos, lo que permite medir el impacto de la cuantización en calidad y velocidad sobre una misma tarea antes de fijar una configuración de producción.
- Despliegue en entornos con restricciones de red: al ser pesos GGUF descargables y ejecutables con llama.cpp, encaja en escenarios on-premise sin conectividad externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): Q2_K ~11 GB, Q3_K_M ~13,6 GB, IQ4_XS ~15,5 GB, Q4_K_M ~16,9 GB, Q5_K_M ~19,6 GB, Q6_K ~22,5 GB, Q8_0 ~29,1 GB. Añadir el `mmproj` (0,7 GB en Q8_0, 1,0 GB en f16) si se usa entrada visual.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; RTX 3090 (24 GB) para las mismas configuraciones; A100 40/80 GB o H100 para Q8_0 y contextos largos.
- Cabe en GPU de consumo: sí. Q2_K y Q3_K_S caben en GPUs de 12-16 GB; Q4_K_M es la opción recomendada para 24 GB. Las variantes Q6_K y Q8_0 requieren 24 GB o más y dejan poco margen para el contexto.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; los ficheros `mmproj` requieren soporte multimodal del runner (por ejemplo, llama.cpp con `--mmproj`). Para el modelo base en safetensors, transformers.
- Latencia y throughput estimados: no disponibles. La cabeza MTP podría mejorar el throughput, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-ComfyUI-GGUF (este) | 27,3B | no disponible | Apache 2.0 | GGUF | Multimodal, ajuste para ComfyUI, solo inglés |
| tolgaertunc/Qwen3.8-27B-ComfyUI | 27,3B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar del que deriva este |
| Qwen3.8 (modelo original) | no disponible | no disponible | no disponible | no disponible | Referencia de la familia; specs no confirmadas en la información disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Idioma: el modelo declara únicamente inglés (`en`); el rendimiento en castellano no está garantizado.
- Contexto: la longitud de contexto no está documentada; no se debe asumir una ventana larga en producción.
- Cuantización: las variantes Q2_K y Q3_K degradan la calidad de forma notable; la model card advierte que Q3_K_M es de "lower quality". Los quants con imatrix no están disponibles, lo que puede reducir la calidad frente a alternativas ponderadas del mismo tamaño.
- Alucinación: al ser un ajuste fino SFT sin etapa de preferencia documentada, el riesgo de alucinación no está mitigado explícitamente.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo Qwen3.8 original y del ajuste de tolgaertunc, ya que la ficha solo declara la licencia del artefacto cuantizado.
- Procedencia: el modelo base es un ajuste de la comunidad con 0 likes y tracción limitada; no hay validación independiente de su calidad.
- Compatibilidad: el soporte de `mmproj` y de la cabeza MTP depende del runner; no todos los frontends GGUF los aprovechan.
- Producción: sin benchmarks publicados ni datos de contexto, no se recomienda su uso en sistemas críticos sin una evaluación propia previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-ComfyUI-GGUF
- Modelo base: https://huggingface.co/tolgaertunc/Qwen3.8-27B-ComfyUI
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-ComfyUI-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad por tipo de quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
