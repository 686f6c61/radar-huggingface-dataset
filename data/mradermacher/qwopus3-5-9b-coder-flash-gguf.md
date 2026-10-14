# mradermacher/Qwopus3-5-9B-Coder-Flash-GGUF

## Resumen

mradermacher/Qwopus3-5-9B-Coder-Flash-GGUF es una colección de cuantizaciones en formato GGUF del modelo Jackrong/Qwopus3-5-9B-Coder-Flash, un transformer denso de aproximadamente 9.200 millones de parámetros orientado a generación de código, razonamiento lógico, uso de herramientas y flujos agénticos. La conversión la mantiene mradermacher, un cuantizador conocido en el ecosistema de llama.cpp, y el modelo original procede del usuario Jackrong, que lo publica bajo licencia Apache 2.0 con capacidades multimodales (visión) y soporte de seis idiomas: inglés, chino, coreano, japonés, ruso y español.

El interés práctico de este repositorio es que empaqueta un modelo de 9B en cuantizaciones que van desde 4,0 GB (Q2_K) hasta 18,5 GB (f16), lo que permite ejecutarlo en hardware de consumo y en equipos con memoria unificada. Además, se incluyen ficheros `mmproj` (proyector multimodal) en Q8_0 y f16, necesarios para habilitar la entrada de imágenes en llama.cpp.

Se trata de un modelo reciente (publicado en octubre de 2026) con muy poca tracción en HuggingFace (13 descargas y 0 likes en el momento de redactar esta ficha), por lo que la información pública es escasa: la model card del repositorio se limita a documentar los ficheros de cuantización y no detalla contexto, dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5, con multi-token prediction (MTP) y soporte multimodal mediante proyector (`mmproj`); detalles internos no disponibles |
| Parámetros totales | 9.197.093.888 (~9,2 mil millones) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K (4,0 GB), Q3_K_S (4,5 GB), Q3_K_M (4,8 GB), Q3_K_L (5,1 GB), IQ4_XS (5,5 GB), Q4_K_S (5,6 GB), Q4_K_M (5,9 GB), Q5_K_S (6,6 GB), Q5_K_M (6,7 GB), Q6_K (7,7 GB), Q8_0 (9,9 GB), f16 (18,5 GB); proyector multimodal `mmproj-Q8_0` (0,7 GB) y `mmproj-f16` (1,0 GB) |
| Idiomas soportados | Inglés (en), chino (zh), coreano (ko), japonés (ja), ruso (ru), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se publica en safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base deriva de Qwen3.5-9B y que se trata de un transformer denso de unos 9.200 millones de parámetros. Las etiquetas del repositorio (`qwen3_5`, `unsloth`, `merged-lora`, `mtp`, `vision`, `multimodal`) sugieren un ajuste fino mediante LoRA fusionado (`merged-lora`) ejecutado con Unsloth, así como soporte de multi-token prediction (MTP), una técnica que permite predecir varios tokens por paso de decodificación y que en llama.cpp se traduce en aceleración de la generación. La presencia de ficheros `mmproj` confirma que el modelo incorpora un codificador visual y puede procesar imágenes además de texto.

No se dispone de datos verificables sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otros métodos de alineamiento; la model card del repositorio de cuantización no los incluye. Una referencia externa de terceros (aimodels.fyi) menciona que el proceso de entrenamiento integra una técnica denominada «Trace Inversion» orientada a tareas de codificación agéntica y razonamiento lógico, pero no se aportan detalles técnicos ni métricas que permitan evaluarla. La model card también indica que existen cuantizaciones ponderadas con matriz de importancia (imatrix, familia `i1`) en un repositorio aparte.

## Capacidades

- Generación de código: el modelo está ajustado específicamente para codificación, con etiquetas explícitas de `code-generation`.
- Razonamiento lógico y modo de razonamiento (`reasoning`): puede producir cadenas de razonamiento antes de la respuesta final.
- Uso de herramientas (`tool-use`) y function calling, requisito habitual en pipelines agénticos.
- Comportamiento agéntico multi-paso (`agent`), incluyendo planificación y ejecución secuencial de subtareas.
- Capacidades multimodales: procesamiento de imágenes junto con texto, habilitado mediante el proyector `mmproj` en llama.cpp.
- Multilingüismo declarado en seis idiomas: inglés, chino, coreano, japonés, ruso y español.
- Decodificación con multi-token prediction (MTP), que acelera la inferencia cuando el runtime lo soporta.
- Conversación multi-turno (`conversational`) y compatibilidad con endpoints tipo API (`endpoints_compatible`).
- Ejecución local en hardware de consumo gracias al amplio rango de cuantizaciones GGUF.

## Casos de uso

- Asistente de codificación en el IDE: el modelo puede autocompletar funciones, explicar fragmentos de código y refactorizar, ejecutándose en local con la cuantización Q4_K_M (5,9 GB) para evitar enviar código propietario a servicios externos.
- Agentes de resolución de incidencias: gracias al soporte de tool calling y razonamiento multi-paso, puede encadenar lectura de logs, consulta de APIs internas y propuesta de parche dentro de un flujo automatizado.
- Integración en pipelines de CI/CD: uso del modelo para revisar diffs, generar descripciones de pull requests o detectar patrones problemáticos antes del merge, invocándolo mediante llama.cpp o un servidor compatible con la API de OpenAI.
- Atención al cliente técnica multi-turno: el modelo mantiene conversaciones con contexto acumulado y puede consultar herramientas externas (estado de pedidos, base de conocimiento) para responder con datos reales.
- Análisis de capturas y diagramas: con el proyector multimodal activado, puede interpretar imágenes (capturas de error, diagramas de arquitectura, tablas escaneadas) y convertirlas en texto estructurado o código.
- Generación de documentación técnica multilingüe: al cubrir inglés, español, chino, japonés, coreano y ruso, resulta útil para equipos distribuidos que necesitan documentación coherente en varios idiomas.
- Prototipado y experimentación con LoRA: al ser un modelo de 9B con licencia Apache 2.0, es un punto de partida razonable para ajustes específicos de dominio en una única GPU de 24 GB.
- Extracción de datos estructurados: generación de JSON o esquemas a partir de texto libre y de imágenes, aprovechando el modo de razonamiento para tareas de parsing complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio de cuantización ni los resultados de búsqueda consultados incluyen cifras de MMLU, HumanEval, GSM8K, SWE-bench ni de ninguna otra evaluación comparable.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamaño de los ficheros GGUF publicados más una reserva para caché KV y sobrecarga del runtime; no proceden de documentación oficial del autor.

- VRAM estimada para inferencia (solo pesos):
  - Q2_K: ~4,0 GB; Q3_K_S: ~4,5 GB; Q3_K_M: ~4,8 GB; Q3_K_L: ~5,1 GB.
  - IQ4_XS: ~5,5 GB; Q4_K_S: ~5,6 GB; Q4_K_M: ~5,9 GB (recomendado por el autor como «rápido»).
  - Q5_K_S: ~6,6 GB; Q5_K_M: ~6,7 GB; Q6_K: ~7,7 GB; Q8_0: ~9,9 GB; f16: ~18,5 GB.
  - Añadir entre 0,7 y 1,0 GB si se activa la entrada de imágenes (`mmproj`).
- GPU consumer compatibles: una RTX 3060 de 12 GB puede ejecutar Q4_K_M y Q5_K_M con contexto moderado; una RTX 4070/4080 de 16 GB admite Q6_K y Q8_0; una RTX 4090 de 24 GB soporta Q8_0 e incluso f16 con contexto reducido o descarga parcial de capas a CPU.
- GPU de centro de datos: A100 40 GB, A100 80 GB y H100 permiten f16 con contextos largos y lotes grandes para servir a varios usuarios.
- Memoria unificada: una referencia externa indica que el modelo puede ejecutarse en equipos con 16 GB de RAM (portátiles estándar, Mac mini) usando cuantizaciones de 8 bits, es decir, en la práctica Q6_K/Q8_0 o cuantizaciones de 4 bits para mayor margen.
- Opciones de despliegue: llama.cpp (runtime de referencia para GGUF y para el proyector multimodal), Ollama, LM Studio, Jan, llama-cpp-python; vLLM y TGI admiten GGUF de forma experimental, aunque su soporte de `mmproj` es más limitado.
- Latencia y throughput: no disponibles. Dependen fuertemente de la GPU, del ancho de banda de memoria y de la cuantización elegida, y la decodificación con MTP puede mejorarlos si el runtime la soporta.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este modelo, por lo que la comparación se limita a características estructurales. Los datos de los modelos alternativos provienen de sus model cards públicas.

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwopus3-5-9B-Coder-Flash (este repositorio, GGUF) | ~9,2 B densos | No disponible | Apache 2.0 | Multimodal y multilingüe (6 idiomas), soporte de tool calling y MTP |
| Qwen2.5-Coder-7B-Instruct | ~7,6 B densos | 32.768 tokens (ampliable) | Apache 2.0 | Solo texto, muy extendido y con ecosistema de cuantizaciones amplio |
| DeepSeek-Coder-V2-Lite-Instruct | ~15,7 B totales / 2,4 B activos (MoE) | 128.000 tokens | Licencia DeepSeek (uso comercial con condiciones) | Solo texto, mayor contexto pero licencia más restrictiva |
| CodeLlama-13B-Instruct | ~13 B densos | 16.384 tokens | Licencia Llama (restricciones de uso) | Solo texto, generación de código clásica |

En la misma categoría de tamaño (7B-9B densos con licencia permisiva), las alternativas más directas son los modelos de la familia Qwen Coder, con un ecosistema de herramientas mucho más maduro y evaluaciones públicas disponibles. La ventaja diferencial de Qwopus3-5-9B-Coder-Flash reside en su combinación de multimodalidad, seis idiomas y etiquetas explícitas de capacidades agénticas, aunque sin benchmarks publicados no es posible cuantificar esa ventaja.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas publicadas que permitan estimar su calidad real en código, matemáticas o razonamiento. Cualquier decisión de producción debería basarse en una evaluación propia.
- Cifras de hardware no oficiales: los requisitos de VRAM de esta ficha son estimaciones a partir del tamaño de los ficheros, no especificaciones del autor.
- Longitud de contexto desconocida: la model card no la declara, lo que impide planificar despliegues con documentos largos o conversaciones extensas sin probarlo previamente.
- Riesgo de alucinación: es un modelo de 9B de propósito general ajustado para código; puede inventar APIs, funciones de librerías o referencias inexistentes, especialmente en cuantizaciones agresivas (Q2_K, Q3_K_S).
- Degradación por cuantización: los ficheros Q2_K y Q3_K_M están marcados por el propio autor como de calidad inferior. Para uso serio se recomienda Q4_K_M o superior.
- Idiomas: aunque se declaran seis idiomas, no hay evaluación pública del rendimiento por idioma; el español figura en la lista, pero se desconoce su calidad relativa frente al inglés o el chino.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero se aplica al modelo base; conviene verificar también la licencia de los datos de entrenamiento originales, que no se documentan.
- Escasa validación comunitaria: con 13 descargas y 0 likes, no existe retroalimentación de terceros, ni issues resueltos, ni informes independientes que confirmen el comportamiento descrito en las etiquetas.
- Ambigüedad de nomenclatura: los resultados de búsqueda muestran repositorios con nombres ligeramente distintos (`Qwopus3-5-9B-Coder-Flash-GGUF` frente a `Qwopus3.5-9B-Coder-GGUF`), lo que puede provocar confusión al descargar variantes o al enlazar documentación.
- Soporte multimodal limitado: la entrada de imágenes requiere un runtime que interprete `mmproj`, principalmente llama.cpp; otros servidores de inferencia pueden no soportarla.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Qwopus3-5-9B-Coder-Flash-GGUF
- Modelo base: https://huggingface.co/Jackrong/Qwopus3-5-9B-Coder-Flash
- Cuantizaciones ponderadas (imatrix, familia i1): https://huggingface.co/mradermacher/Qwopus3-5-9B-Coder-Flash-i1-GGUF
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#Qwopus3-5-9B-Coder-Flash-GGUF
- Preguntas frecuentes y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Referencia externa con descripción del modelo (aimodels.fyi): https://www.aimodels.fyi/models/huggingFace/qwopus3.5-9b-coder-gguf-jackrong
- Artículo sobre optimización de llama.cpp con este modelo (genai.club): https://genai.club/blog/llamacpp-optimizations-amp-new-qwopus35-9b-gguf-model-b
- Repositorio alternativo con nomenclatura similar: https://huggingface.co/mradermacher/Qwopus3.5-9B-Coder-GGUF
- Ficha en registro de terceros (free2aitools): https://free2aitools.com/model/mradermacher/qwopus3.5-9b-coder-gguf
