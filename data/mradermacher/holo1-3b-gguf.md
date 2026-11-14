# mradermacher/Holo1-3B-GGUF

## Resumen

Holo1-3B-GGUF es la versión cuantizada en formato GGUF del modelo Holo1-3B, desarrollado originalmente por Hcompany y distribuido en este formato por mradermacher. Se trata de un modelo multimodal de 3.085.938.688 parámetros (aproximadamente 3,1 mil millones) orientado a tareas de agente y acción, es decir, diseñado para interpretar entradas visuales y de texto y emitir acciones estructuradas en el contexto de automatización de interfaces y flujos de trabajo.

El modelo base Holo1-3B se enmarca en la familia Holo1 de Hcompany, centrada en agentes que operan sobre entornos gráficos y requieren comprensión visual combinada con razonamiento de instrucciones. Esta versión GGUF facilita su despliegue en infraestructura de inferencia local mediante llama.cpp y herramientas compatibles, con cuantizaciones que van desde 1,4 GB (Q2_K) hasta 6,3 GB (f16), además de un módulo multimodal complementario (mmproj) necesario para el procesamiento de imágenes.

La relevancia de esta ficha radica en que permite evaluar rápidamente un modelo pequeño de propósito específico (agentes multimodales) con opciones de despliegue en hardware de consumo, algo poco habitual en la categoría de modelos de agente visual, que suelen requerir GPUs de mayor capacidad. La información pública disponible sobre el modelo base es limitada, por lo que varios parámetros técnicos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal de tipo transformer, según tags del repo) |
| Parametros totales | 3.085.938.688 (≈3,1 B) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | other (ver restricciones en la model card del modelo base) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Holo1-3B en la documentación proporcionada. Los tags del repositorio indican que se trata de un modelo multimodal (procesa imagen y texto) orientado a tareas de agente y acción, lo que sugiere una arquitectura con un codificador visual acoplado a un modelo de lenguaje, similar a otros modelos de agente visual. El repositorio incluye un módulo `mmproj` (proyector multimodal) separado, lo que confirma la presencia de un componente de proyección visual integrado con el decodificador de lenguaje.

Tampoco se han publicado en la información disponible datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o aprendizaje por imitación de trayectorias de agente. El modelo base es `Hcompany/Holo1-3B`, y esta distribución es una cuantización estática realizada por mradermacher con `quantize_version: 2` y `output_tensor_quantised: 1`, sin modificaciones en los pesos más allá de la cuantización.

## Capacidades

- Comprensión multimodal: procesa entradas de imagen y texto de forma conjunta gracias al módulo mmproj incluido en el repositorio.
- Razonamiento orientado a acción: el modelo está etiquetado como `action` y `agent`, lo que indica que genera acciones estructuradas para interactuar con entornos (interfaces gráficas, flujos de trabajo).
- Generación de texto conversacional: el tag `conversational` sugiere uso en diálogo multi-turno.
- Soporte de agentes: diseñado para tareas de agente, potencialmente con razonamiento multi-paso, aunque no se detalla el mecanismo exacto.
- Capacidades multilingües: limitadas al inglés según la model card (`language: en`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, audio): no disponible en la información proporcionada.

## Casos de uso

- Automatización de interfaces gráficas: el modelo puede recibir capturas de pantalla y una instrucción en lenguaje natural para emitir acciones sobre elementos de la interfaz (clic, escritura, navegación), adecuado por su orientación a `action` y su componente visual.
- Agentes de navegación web: integrado en un bucle de agente, interpreta el estado visual de una página y decide el siguiente paso, con la ventaja de su tamaño reducido para despliegue local.
- Asistentes de escritorio con comprensión de pantalla: al ejecutarse en GGUF sobre llama.cpp, puede desplegarse en estaciones de trabajo sin GPU dedicada de gran capacidad para tareas de asistencia contextual.
- Pruebas automatizadas de UI: genera secuencias de acciones sobre aplicaciones para validar flujos, aprovechando la entrada multimodal y la salida estructurada de acciones.
- Prototipado de agentes en investigación: su tamaño de 3,1 B y sus cuantizaciones de 1,9-2,3 GB permiten iterar rápidamente en experimentos de agentes multimodales en hardware de consumo.
- Extracción de información de documentos e imágenes: combinando el módulo mmproj con el decodificador de lenguaje para tareas de lectura y respuesta sobre contenido visual, en inglés.
- Despliegue en entornos con recursos limitados: la cuantización Q4_K_M (2,0 GB) permite ejecución en GPUs de 4-6 GB de VRAM o incluso en CPU, útil para demos y entornos embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB (Q2_K), 1,9-2,0 GB (Q4_K_S/Q4_K_M), 2,3 GB (Q5_K_M), 2,6 GB (Q6_K), 3,4 GB (Q8_0) y 6,3 GB (f16), a los que hay que sumar el módulo mmproj (0,9 GB en Q8_0 o 1,4 GB en f16) para entrada visual.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060/4060, RTX 4090, A100 o H100 para mayor throughput. El modelo cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q8_0; f16 requiere al menos 8 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar. Para el modelo base en safetensors, transformers.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A nivel cualitativo, Holo1-3B-GGUF se posiciona como un modelo multimodal de agente de ~3 B parámetros con licencia `other`, distribuido en GGUF, lo que lo diferencia de modelos de agente visual de mayor tamaño que no suelen ofrecer cuantizaciones ligeras. La comparación con alternativas concretas (parámetros, contexto, rendimiento, licencia y disponibilidad) se indica como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al entrenarse presumiblemente con datos web, es esperable que herede sesgos de esos datos, pero no se documentan.
- Riesgo de alucinación: no cuantificado; como modelo de 3,1 B orientado a acción, puede generar acciones inválidas o incorrectas en entornos no vistos.
- Limitaciones de contexto e idioma: soporte únicamente de inglés según la model card; la longitud de contexto no está documentada.
- Restricciones de licencia: la licencia es `other`; es imprescindible consultar los términos del modelo base `Hcompany/Holo1-3B` antes de cualquier uso comercial, ya que esta distribución no aclara las condiciones.
- Caveat para producción: al ser una cuantización, puede haber degradación de calidad respecto al modelo original, especialmente en Q2_K y Q3_K_M (marcada como "lower quality" por el autor). Para uso visual es necesario cargar también el mmproj correspondiente.
- El repositorio tiene un tamaño de 30,1 GB por incluir todas las cuantizaciones; conviene descargar solo los ficheros necesarios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Holo1-3B-GGUF
- Modelo base: https://huggingface.co/Hcompany/Holo1-3B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Holo1-3B-i1-GGUF
- Página de resumen del autor: https://hf.tst.eu/model#Holo1-3B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
