# mradermacher/rudra-GGUF

## Resumen

rudra es un modelo de lenguaje de 4.326 millones de parámetros (aproximadamente 4,3 mil millones) desarrollado por ritiksuman y distribuido en formato GGUF por mradermacher. Se presenta como un ajuste fino (LoRA) orientado a flujos de trabajo agénticos: llamada a funciones, uso de herramientas, salida estructurada en JSON y ejecución autónoma de bucles de agente. El modelo parte de una base de la familia Qwen (etiquetada como qwen3.5 en los tags del repositorio) y está pensado para ejecución local en hardware de consumo.

Su relevancia actual reside en el segmento de modelos pequeños especializados en agentes: frente a modelos generalistas de mayor tamaño, rudra apunta a un caso de uso concreto (automatización de operaciones con ficheros, generación de JSON fiable y orquestación multi-paso) con una huella de memoria reducida. La licencia Apache 2.0 facilita su integración comercial, y la disponibilidad de cuantizaciones desde 2,1 GB hasta 8,8 GB permite desplegarlo desde portátiles hasta servidores.

No obstante, la información publicada es limitada: no se detallan la longitud de contexto, el volumen de datos de entrenamiento ni resultados de benchmarks. Esta ficha recoge exclusivamente los datos disponibles en la model card y los metadatos del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen, etiquetada qwen3.5); ajuste fino LoRA |
| Parámetros totales | 4.326.350.848 (4,3 mil millones) |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj f16 y Q8_0 (complemento multimodal) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base ritiksuman/rudra) |

## Arquitectura y entrenamiento

El modelo base es ritiksuman/rudra, un ajuste fino mediante LoRA sobre una base de la familia Qwen (los tags indican qwen3.5). La arquitectura subyacente es un transformer decoder-only de aproximadamente 4,3 mil millones de parámetros, con 4.326.350.848 parámetros contabilizados en safetensors. No se especifican en la información disponible el número de capas, la dimensión oculta, el número de cabezas de atención ni la longitud de contexto nativa.

El ajuste fino está orientado explícitamente a comportamiento agéntico: los tags del repositorio mencionan agentic-ai, autonomous-agent, function-calling, tool-use, structured-output, json-mode, agent-loop, coding-agent, anti-hallucination, file-operations y workflow-automation. No se detallan el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas específicas (atención lineal, decodificación especulativa, etc.). La presencia de ficheros mmproj (f16 y Q8_0) en el repositorio GGUF sugiere soporte multimodal en el modelo base, aunque no se detalla qué modalidades cubre.

## Capacidades

- Generación de texto conversacional en inglés.
- Llamada a funciones (function calling) y uso de herramientas (tool use), según los tags del repositorio.
- Salida estructurada y modo JSON (structured-output, json-mode), orientado a integraciones que requieren respuestas parseables.
- Ejecución de bucles de agente (agent-loop) y razonamiento multi-paso para tareas autónomas.
- Operaciones con ficheros (file-operations) y automatización de flujos de trabajo (workflow-automation).
- Capacidades de agente de programación (coding-agent).
- Enfoque declarado anti-alucinación (anti-hallucination) en la model card, sin métricas publicadas que lo respalden.
- Soporte multimodal potencial: el repositorio incluye ficheros mmproj, lo que indica que el modelo base podría procesar entradas de imagen, aunque no se detalla en la información disponible.

## Casos de uso

- Automatización de operaciones con ficheros: el modelo está etiquetado para file-operations y puede integrarse en scripts que lean, modifiquen o generen ficheros de forma autónoma, emitiendo llamadas a herramientas estructuradas en lugar de texto libre.
- Generación de JSON fiable en pipelines: gracias al modo JSON y a la salida estructurada, encaja en integraciones donde la respuesta debe validarse contra un esquema (por ejemplo, extracción de campos de documentos o rellenado de formularios).
- Agentes de codificación locales: con la etiqueta coding-agent, puede emplearse en asistentes de programación que ejecutan comandos, consultan el sistema de ficheros y proponen parches dentro de un bucle de agente.
- Orquestación de flujos de trabajo: para encadenar pasos (consultar una API, transformar datos, escribir resultados) mediante function calling, con la ventaja de ejecutarse en local y sin coste por token.
- Asistentes conversacionales de dominio cerrado: al ser un modelo de 4,3 mil millones de parámetros, es viable desplegarlo en entornos con recursos limitados para atención al usuario en inglés con respuestas estructuradas.
- Prototipado de agentes autónomos en estaciones de trabajo: con cuantizaciones Q4_K_M de 2,9 GB, permite iterar sobre diseños de bucles de agente en portátiles sin GPU dedicada de gran capacidad.
- Procesamiento de documentos con componente visual: si se confirma el soporte multimodal a través de los ficheros mmproj, podría emplearse para extraer información de imágenes o capturas combinada con salida JSON.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~2,1 GB; Q3_K_S ~2,2 GB; Q3_K_M ~2,4 GB; Q3_K_L ~2,6 GB; IQ4_XS ~2,7 GB; Q4_K_S ~2,7 GB; Q4_K_M ~2,9 GB; Q5_K_S ~3,2 GB; Q5_K_M ~3,3 GB; Q6_K ~3,7 GB; Q8_0 ~4,7 GB; f16 ~8,8 GB. Añadir ~0,5 GB (mmproj Q8_0) u ~0,8 GB (mmproj f16) si se usa el complemento multimodal.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU con al menos 4 GB de VRAM puede ejecutar cuantizaciones Q4; para Q8_0 se recomiendan 6 GB o más; para f16, 10 GB o más.
- Compatibilidad con GPU de consumo: sí. Las cuantizaciones Q4_K_M (2,9 GB) y Q5_K_M (3,3 GB) caben en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB), e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF. El repositorio incluye la etiqueta endpoints_compatible y la librería transformers en los metadatos, pero el formato distribuido es GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos publicados para rudra. A continuación se comparan únicamente parámetros, contexto, licencia y formato con alternativas de tamaño similar; los datos de los modelos comparados se indican solo cuando son conocidos y verificables.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| rudra (este modelo) | 4,3 mil millones | no disponible | Apache 2.0 | GGUF, safetensors | Ajuste fino para agentes y function calling |
| Qwen2.5-3B / Qwen3-4B (familia base) | ~3-4 mil millones | no disponible en esta ficha | Apache 2.0 (según variante) | safetensors, GGUF | Base generalista de la que deriva el ajuste |
| Llama 3.2 3B | 3,2 mil millones | 128K (según model card oficial) | Llama 3.2 Community License | safetensors, GGUF | Generalista, requiere licencia específica para uso comercial |
| Phi-3.5-mini | 3,8 mil millones | 128K (según model card oficial) | MIT | safetensors, GGUF | Generalista con foco en razonamiento |

La comparación de rendimiento no está disponible: no se han publicado benchmarks de rudra que permitan situarlo frente a estas alternativas.

## Limitaciones y advertencias

- Idiomas: el modelo declara únicamente inglés; no hay evidencia de soporte para castellano u otros idiomas.
- Contexto: se desconoce la longitud de contexto nativa, lo que impide garantizar conversaciones multi-turno largas o procesamiento de documentos extensos.
- Alucinación: aunque la model card incluye la etiqueta anti-hallucination, no se aportan métricas ni metodología que respalden esa afirmación; debe validarse en el dominio de despliegue.
- Datos de entrenamiento: no se documentan el volumen de tokens, la composición del dataset ni los procesos de alineación (RLHF/DPO), lo que dificulta evaluar sesgos y cobertura.
- Benchmarks: la ausencia de resultados publicados impide comparar su calidad frente a alternativas del mismo tamaño.
- Multimodalidad: la presencia de ficheros mmproj sugiere capacidades multimodales, pero no se especifica el tipo de entrada ni su calidad; debe verificarse antes de usarla en producción.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base ritiksuman/rudra y de la base Qwen subyacente por si imponen restricciones adicionales.
- Madurez: el repositorio tiene pocas descargas (1061) y ningún like en el momento de la consulta, lo que sugiere una adopción limitada y poca validación comunitaria.
- Formato: la distribución es GGUF; para usar safetensors o integrar en transformers habría que acudir al modelo base ritiksuman/rudra.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/rudra-GGUF
- Modelo base: https://huggingface.co/ritiksuman/rudra
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/rudra-i1-GGUF
- Página de resumen de descargas del cuantizador: https://hf.tst.eu/model#rudra-GGUF
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del cuantizador: https://www.nethype.de/
