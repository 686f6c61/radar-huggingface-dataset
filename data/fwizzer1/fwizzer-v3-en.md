# fwizzer1/fwizzer-v3-en

## Resumen

fwizzer-v3-en es un modelo multimodal de tipo image-text-to-text publicado por el usuario fwizzer1 en HuggingFace, presentado en su model card como un ajuste fino de razonamiento profundo sobre el backbone LiquidAI/LFM2.5-VL-3B. Se distribuye principalmente en formato GGUF con cuatro ficheros (tres cuantizaciones del modelo de lenguaje y un proyector de visión independiente) y está pensado para su uso en llama.cpp, LM Studio y Ollama. Su rasgo diferencial declarado es la generación de cadenas de pensamiento largas dentro de bloques `<think> ... </think>`, siguiendo el estilo de DeepSeek-R1, antes de emitir la respuesta final.

El modelo combina, segun la model card, una red neuronal líquida híbrida (Liquid Neural Network) de 2,69 B de parámetros en el backbone con una torre de visión SigLIP2 de 400 M, con una ventana de contexto de hasta 32.768 tokens (ampliable a 131 k sobre el backbone LFM). Sin embargo, los pesos en safetensors del repositorio suman 426.285.296 parámetros y el repositorio ocupa 0,9 GB, cifras que no concuerdan con los 2,69 B declarados; esta discrepancia se detalla en la sección de limitaciones.

La relevancia de esta ficha es limitada pero instructiva: se trata de un modelo con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados, entrenado sobre un dataset privado no auditable y con una licencia no estándar (lfm1.0). Es útil como caso de estudio de despliegue local de VLM pequeños con modo de razonamiento explícito, pero no como base para producción crítica sin una evaluación previa propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: red neuronal líquida (Liquid Neural Network, backbone LFM2.5) más torre de visión SigLIP2 con proyector propio ("fwizzervision") |
| Parámetros totales | 426.285.296 según los pesos en safetensors del repositorio; la model card declara 2,69 B en el backbone y 400 M en la torre de visión (dato contradictorio) |
| Longitud de contexto | Hasta 32.768 tokens; la model card indica que el backbone LFM soporta hasta 131 k |
| Tipos de cuantización | Q8_0 (Max, ~3,4 GB), Q5_K_M (Balanced, ~2,5 GB), Q4_K_M (Speed, ~2,1 GB) |
| Idiomas soportados | Inglés (etiqueta `en`; duplicada en los tags) |
| Licencia | `other`, con `license_name: lfm1.0` (LFM Open License v1.0 de Liquid AI); los términos concretos no se detallan en la información proporcionada |
| Formato de pesos | GGUF (llama.cpp, LM Studio, Ollama); el repositorio también contiene safetensors |
| Modelo base | LiquidAI/LFM2.5-VL-3B |
| Pipeline | image-text-to-text |
| Dataset de entrenamiento | fwizzer1/fwizzer-v3-titan-agentic (`train_en.parquet`), privado |
| Tamaño del repositorio | 0,9 GB (dato declarado; no cuadra con la suma de los GGUF descritos) |
| Fecha de creación / actualización | 2026-09-13 (ambas marcas con tres segundos de diferencia) |

## Arquitectura y entrenamiento

La arquitectura declarada es un híbrido de red neuronal líquida (Liquid Neural Network) sobre el backbone LFM2.5 de Liquid AI, al que se añade una torre de visión SigLIP2 de 400 M y un proyector visual propietario denominado `fwizzervision`, distribuido como GGUF independiente de ~800 MB. El pipeline es image-text-to-text, por lo que el modelo acepta imágenes y texto y devuelve texto. La model card menciona explícitamente que la ventana de contexto es de hasta 32.768 tokens, con posibilidad de llegar a 131 k en el backbone LFM subyacente.

El ajuste se ha realizado sobre el dataset privado `fwizzer1/fwizzer-v3-titan-agentic`, del que solo se indica el fichero `train_en.parquet`. No se especifica el número de tokens de entrenamiento, la composición del dataset, la proporción de datos sintéticos, ni si se emplearon técnicas de alineación como RLHF, DPO o RLAIF. La innovación que el autor destaca es el razonamiento CoT inherente: el modelo genera su descomposición interna, prueba casos límite y verifica la lógica dentro de un bloque `<think> ... </think>` antes de la respuesta final. La model card recomienda temperatura 0,6, top-p 0,95, min-p 0,05, penalización de repetición 1,05 y tokens de parada `</think>` y `<|im_end|>`.

## Capacidades

- Generación de texto y razonamiento analítico multi-paso en inglés, con cadena de pensamiento explícita en bloques `<think>`.
- Visión e inteligencia visual: reconocimiento y transcripción de texto en imágenes (OCR), con mención explícita a "layout parsing" de alta precisión.
- Interpretación de planos, esquemas técnicos y diagramas (la model card cita "blueprints").
- Reconocimiento e interpretación de interfaces de usuario a partir de capturas de pantalla.
- Procesamiento de imágenes junto con instrucciones de texto en una misma petición (image-text-to-text).
- Modo de razonamiento reflexivo configurable mediante system prompt: el autor propone un prompt de sistema que fuerza la descomposición interna antes de cada respuesta.
- No se documenta soporte de tool calling, function calling ni de agentes multi-paso en la información disponible, pese a que el dataset de entrenamiento se llame "titan-agentic".
- No se documentan capacidades de audio, vídeo ni otros idiomas distintos del inglés.

## Casos de uso

- Digitalización de documentos escaneados: el modelo puede extraer texto e interpretar la estructura de facturas, formularios o contratos a partir de la imagen, aprovechando las capacidades de layout parsing y OCR declaradas, y devolver la información estructurada en texto.
- Revisión de planos y esquemas de ingeniería: dado que la model card menciona explícitamente blueprints y diagramas, encaja en flujos donde un técnico fotografía un esquema y necesita una descripción o una comprobación de elementos.
- Soporte técnico asistido por capturas: el modelo puede analizar una captura de interfaz de usuario y generar una explicación paso a paso del problema, útil en mesas de ayuda internas donde no se pueden enviar datos a servicios en la nube.
- Automatización de QA visual: integrado vía llama.cpp en un pipeline, puede comparar capturas de una aplicación antes y después de un despliegue y señalar diferencias de interfaz, con la ventaja de ejecutarse en local.
- Generación de explicaciones didácticas: el bloque `<think>` permite mostrar al usuario el razonamiento intermedio, lo que resulta aprovechable en herramientas educativas que quieran auditar el proceso, no solo la respuesta.
- Procesamiento por lotes con presupuesto de memoria ajustado: con la cuantización Q4_K_M (~2,1 GB) puede ejecutarse en máquinas sin GPU dedicada o con GPU de gama baja, lo que habilita tareas de clasificación y descripción de imágenes a gran escala en hardware modesto.
- Asistente local con requisitos de privacidad: al ejecutarse en LM Studio u Ollama sin conexión, es apto para entornos donde las imágenes no pueden salir de la infraestructura propia.
- Prototipado de agentes multimodales: sirve como componente de percepción en experimentos de agentes que necesiten interpretar capturas o diagramas, siempre que se asuma el coste en tokens del modo de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card se limita a afirmaciones cualitativas (por ejemplo, "99,9 % de precisión, sin degradación del razonamiento" para la cuantización Q8_0), sin metodología, conjunto de evaluación ni cifras comparables de MMLU, HumanEval, GSM8K, MMMU, DocVQA o similares.

| Benchmark | Resultado |
|---|---|
| Cualquier benchmark estándar | No disponible |

## Requisitos de hardware

- VRAM estimada para los pesos del modelo de lenguaje: ~2,1 GB en Q4_K_M, ~2,5 GB en Q5_K_M y ~3,4 GB en Q8_0.
- El proyector de visión `fwizzervision.gguf` añade ~800 MB, por lo que la configuración máxima ronda los 4,2 GB solo en pesos.
- Sumando caché KV y overhead de runtime, se recomienda un mínimo de 4 GB de VRAM en Q4_K_M y de 6 GB para Q8_0 con visión a contextos moderados.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090 y equivalentes; también en iGPU con memoria unificada suficiente, con latencia muy superior.
- Inferencia en CPU viable mediante llama.cpp y Ollama, dado el tamaño reducido de los ficheros.
- Opciones de despliegue documentadas por el autor: LM Studio (con carga automática del proyector de visión), llama.cpp y Ollama.
- vLLM, TGI u otros servidores de alto rendimiento no se mencionan en la información disponible; el soporte multimodal vía GGUF fuera de llama.cpp y sus derivados es incierto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información proporcionada no incluye datos de rendimiento de los modelos comparables, por lo que las celdas correspondientes se marcan como no disponibles. Los datos de terceros deben verificarse en sus respectivas páginas de HuggingFace antes de tomar decisiones.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| fwizzer-v3-en | 426 M según safetensors; 2,69 B + 400 M según la model card | 32.768 tokens (hasta 131 k declarados en el backbone) | lfm1.0 (`other`) | GGUF y safetensors en HuggingFace |
| LiquidAI/LFM2.5-VL-3B (modelo base) | No disponible | No disponible | LFM Open License (verificar) | HuggingFace |
| Qwen2.5-VL-3B (Alibaba) | No disponible | No disponible | Verificar en HuggingFace | HuggingFace |
| SmolVLM2-2.2B (Hugging Face) | No disponible | No disponible | Verificar en HuggingFace | HuggingFace |

## Limitaciones y advertencias

- Inconsistencia de parámetros: los safetensors del repositorio suman 426.285.296 parámetros (0,9 GB), mientras que la model card declara 2,69 B en el backbone más 400 M de visión. Igualmente, el tamaño del repositorio (0,9 GB) no cuadra con la suma de los GGUF descritos (3,4 + 2,5 + 2,1 + 0,8 GB). Hay que verificar qué contiene realmente cada fichero antes de desplegarlo.
- Dataset de entrenamiento privado y no auditable: no se puede evaluar la composición de los datos, el sesgo introducido ni la existencia de filtraciones de benchmarks.
- Ausencia total de validación externa: 0 descargas y 0 likes en el momento de la consulta, sin terceros que hayan reproducido resultados.
- Afirmaciones de marketing no verificadas: expresiones como "pure reasoning engine", "unbiased" o "uninhibited intelligence" no van acompañadas de evidencia. El término "uninhibited" sugiere ausencia de alineación de seguridad, lo que implica riesgo de contenido inapropiado en producción.
- Solo inglés: no hay soporte declarado de castellano ni de otros idiomas.
- Riesgo de alucinación: no se documenta ninguna evaluación de fidelidad ni de tasas de error en OCR o interpretación de diagramas.
- El modo de razonamiento aumenta notablemente el consumo de tokens por respuesta y puede degradar la latencia; requiere gestionar correctamente los tokens de parada (`</think>`, `<|im_end|>`) para evitar bucles.
- Licencia `other` con nombre `lfm1.0`: al derivar de un modelo de Liquid AI, las condiciones de uso comercial dependen de los términos de dicha licencia, que no se reproducen en la model card. Es imprescindible revisarlos antes de cualquier uso comercial.
- Dependencia de dos ficheros para la funcionalidad multimodal (modelo + proyector de visión); omitir el proyector desactiva la visión sin aviso claro.
- Las fechas de creación y actualización del repositorio (2026-09-13) y su diferencia de tres segundos resultan anómalas y dificultan trazar la historia del modelo.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; no hay documentación externa, papers ni discusiones de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fwizzer1/fwizzer-v3-en
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/fwizzer1/fwizzer-v3-titan-agentic
- Liquid AI (desarrollador del backbone LFM2.5): https://www.liquid.ai/
- La búsqueda web proporcionada no devolvió resultados relevantes sobre el modelo (los resultados recibidos corresponden a foros de parques temáticos y no guardan relación).
