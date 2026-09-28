# BigBojangles/Swift-1.5-Qwen3.8-27b-EXL3-4.00bpw-H5

## Resumen

Swift-1.5-Qwen3.8-27b-EXL3-4.00bpw-H5 es una conversión de pesos al formato EXL3 Object del modelo ukisai/Swift-1.5-Qwen3.8-27b, publicada por el usuario BigBojangles. No es un reentrenamiento: es una cuantización mecánica a 4,00 bits por peso (cabezas a 5 bits, visión a 6 bits, MTP a 4 bits) realizada con ExLlamaV3 1.5.2 y pensada para servirse con runtimes compatibles con EXL3. El pipeline declarado es image-text-to-text, de modo que hereda la naturaleza multimodal de la familia Qwen3.8.

El modelo fuente lo desarrolla UkisAI a partir de Qwen/Qwen3.8-27B (Apache 2.0) e incorpora un componente de transferencia derivado de ThinkingCap-Qwen3.6-27B de BottleCap AI, orientado a reducir el sobre-razonamiento. Su interés práctico es doble: permite ejecutar un modelo multimodal de razonamiento con requisitos de VRAM reducidos y, al mismo tiempo, introduce un umbral comercial explícito en la licencia (1 millón de dólares de facturación anual), poco habitual en derivados de Qwen.

Los metadatos de safetensors declaran 8.175.129.984 parámetros (~8,18 B), mientras que el nombre del modelo y de su familia indican 27 B, y el repositorio ocupa 16,4 GB, cifra más coherente con un modelo de mayor tamaño a ese bpw. La información disponible no explica esta discrepancia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.8 (texto, imagen y vídeo); no se detalla la configuración interna en la información disponible |
| Parámetros totales | 8.175.129.984 (~8,18 B) según metadatos de safetensors; el nombre del modelo indica 27 B (discrepancia no explicada) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | EXL3 a 4,00 bpw (cabezas a 5 bits, visión a 6 bits, MTP a 4 bits, codebook `mul1`) |
| Idiomas soportados | No disponible |
| Licencia | Swift Open License v1.0 para la contribución Swift; Apache 2.0 para el modelo base Qwen3.8-27B |
| Formato de pesos | safetensors en forma Object EXL3 (2 shards: `model-00001-of-00002.safetensors`, `model-00002-of-00002.safetensors`), librería exllamav3 |

## Arquitectura y entrenamiento

Este repositorio no entrena nada: es una conversión de formato. Los pesos del modelo padre se cuantizan con el convertidor de ExLlamaV3 (versión 1.5.2) a 4,00 bits por peso con codebook `mul1`, aplicando bits diferenciados por componente (5 bits en las cabezas, 6 bits en la torre de visión y 4 bits en la cabeza MTP). El modelo conserva el tokenizador, la plantilla de chat y los ficheros de configuración no relacionados con pesos del padre, para facilitar el servicio.

La arquitectura subyacente es la de Qwen3.8-27B, un modelo multimodal con interfaz estándar de Qwen3.8 que mantiene soporte de texto, imagen y vídeo, según la documentación de UkisAI. Swift 1.5 añade a esa base un componente de transferencia derivado de ThinkingCap-Qwen3.6-27B de BottleCap AI, cuyo objetivo declarado es reducir el sobre-razonamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La presencia de una cabeza MTP en el checkpoint permite decodificación especulativa con borrador interno, tal como describe el kit de despliegue de MiaAI-Lab para la misma familia.

## Capacidades

- Generación de texto conversacional con plantilla de chat estándar de Qwen3.8.
- Razonamiento con modo de pensamiento, con el ajuste de Swift 1.5 orientado a reducir el exceso de deliberación (menos tokens de pensamiento para la misma tarea).
- Procesamiento de imagen y de vídeo, además de texto, al conservar la interfaz multimodal de Qwen3.8 (pipeline declarado: image-text-to-text).
- Cuantización de pesos que preserva la cabeza MTP, lo que habilita decodificación especulativa interna.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: entrada de imagen y vídeo, cabeza MTP y cuantización EXL3 de 4,00 bpw.

## Casos de uso

- Asistente conversacional multimodal: al conservar la entrada de imagen y la plantilla de chat de Qwen3.8, puede gestionar turnos de conversación en los que el usuario adjunta capturas, fotografías o diagramas y espera respuestas razonadas.
- Extracción de información de documentos escaneados: facturas, albaranes o formularios en imagen se pueden enviar directamente al modelo para obtener campos estructurados, sin necesidad de una etapa OCR separada.
- Atención al cliente sobre GPU de gama alta: la cuantización a 4,00 bpw reduce el coste por instancia frente a un checkpoint en BF16, lo que permite desplegar más réplicas por nodo en entornos con ExLlamaV3.
- Razonamiento con coste controlado: el ajuste de Swift 1.5 busca recortar el sobre-razonamiento, lo que se traduce en menos tokens de pensamiento por consulta y, por tanto, menor latencia y menor gasto de generación en tareas de clasificación o análisis.
- Revisión de código asistida: el modelo puede integrarse en un editor o en un pipeline de revisión para comentar parches y proponer cambios, siempre que se valide previamente el soporte real de tool calling.
- Análisis de contenido audiovisual: la entrada de vídeo heredada de Qwen3.8 permite describir secuencias, resumir escenas o extraer eventos en flujos de trabajo de investigación y medios.
- Despliegue local en estación de trabajo: con un runtime EXL3 y una GPU consumer de VRAM suficiente, sirve como modelo multimodal de uso personal sin depender de APIs externas, sujeto al umbral comercial de la licencia.
- Prototipado de agentes con MTP: la cabeza MTP incluida en el checkpoint facilita pruebas de decodificación especulativa para acelerar la generación en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La página de UkisAI para Swift 1.5 indica que existen comparativas entre Qwen3.8-27B, Swift 1.0 y Swift 1.5 con protocolos de evaluación fijados y agregados de cinco repeticiones, pero los resultados concretos no aparecen en el material recuperado. No se reproducen cifras para no inventar datos.

## Requisitos de hardware

- Estimación de pesos: 8,18 B parámetros × 4,00 bpw ≈ 4,1 GB, más las sobrecargas de cabezas (5 bits), visión (6 bits) y MTP (4 bits). El repositorio ocupa 16,4 GB, cifra más compatible con un modelo de ~27 B a este bpw (≈13,5 GB teóricos); la explicación de la diferencia no está disponible.
- Escenario A (si el checkpoint real es de ~8 B): cabe en GPU consumer de 8-12 GB con contexto moderado, y con holgura en tarjetas de 16 GB.
- Escenario B (si el checkpoint real es de ~27 B): requiere del orden de 16-20 GB solo para pesos, por lo que encajan RTX 3090/4090 de 24 GB, A6000, L40S, A100 o H100.
- GPU profesionales recomendadas para servicio concurrente: A100 40/80 GB, H100 80 GB o L40S, en función del contexto y del número de peticiones simultáneas.
- La caché KV no está cuantizada por defecto; kits de despliegue de la misma familia proponen carriles de caché KV de ~4,5 bits (NVFP4 en Ada/Hopper/Blackwell, Hadamard-4 en Ampere) para maximizar el contexto por GB.
- Opciones de despliegue: ExLlamaV3 (librería nativa de este formato), TabbyAPI y front-ends con cargador EXL3 (por ejemplo, text-generation-webui). No es un checkpoint de Transformers/BF16 y no se carga directamente en vLLM, TGI, llama.cpp, Ollama ni LM Studio sin conversión previa a otro formato.
- Decodificación especulativa: el checkpoint incluye cabeza MTP; el kit de MiaAI-Lab para Qwen3.8-27B EXL3 reporta un modo DFlash2 con borrador de 5,0 bpw aproximadamente un 15 % más rápido.
- Latencia y throughput concretos: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| BigBojangles/Swift-1.5-Qwen3.8-27b-EXL3-4.00bpw-H5 | 8,18 B declarados (27 B nominales) | No disponible | EXL3 4,00 bpw / H5, safetensors | Swift Open License v1.0 (gratuita por debajo de 1 M USD de facturación) | Objeto de esta ficha; 0 descargas y 0 likes en el momento del análisis |
| ukisai/Swift-1.5-Qwen3.8-27b | 27 B nominales | No disponible | Pesos originales del autor (no EXL3) | Swift Open License v1.0 | Modelo padre; incluye el componente de transferencia de ThinkingCap |
| erlidev/Swift-1.5-Qwen3.8-27B-EXL3 | No disponible | No disponible | EXL3 | Swift Open License v1.0 (heredada) | Cuantización alternativa del mismo padre; bpw no indicado |
| MiaAI-Lab/Qwen3.8-27B-DFlash2-EXL3-5.0bpw | No disponible | No disponible | EXL3 5,0 bpw con decodificación especulativa | No disponible | Kit de despliegue sobre Qwen3.8-27B, no sobre Swift |
| Qwen/Qwen3.8-27B | 27 B nominales | No disponible | Pesos base | Apache 2.0 | Modelo fundacional de Alibaba Cloud; sin las restricciones comerciales de la licencia Swift |

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad para esta cuantización concreta.
- La cuantización a 4,00 bpw introduce pérdida respecto al checkpoint original; no se documentan métricas de degradación para esta conversión.
- La discrepancia entre los 8,18 B parámetros declarados en los metadatos, los 27 B del nombre y los 16,4 GB del repositorio no está explicada, por lo que conviene verificar el tamaño real del checkpoint antes de planificar hardware.
- Este repositorio no tiene descargas ni likes y no consta revisión independiente: es una cuantización de comunidad sobre un modelo de terceros.
- Licencia: el uso comercial de la contribución Swift es gratuito solo para personas y organizaciones con facturación anual bruta inferior a 1.000.000 USD (incluidas filiales). A partir de ese umbral se requiere una Swift Enterprise License de UkisAI. Los derechos sobre Qwen3.8-27B bajo Apache 2.0 no quedan limitados por esa cláusula.
- Formato cerrado al ecosistema EXL3: no se puede cargar en Transformers, vLLM, TGI, llama.cpp, Ollama o LM Studio sin una conversión adicional.
- Idiomas soportados no declarados; no hay garantía de rendimiento en castellano más allá de lo que ofrezca el modelo base.
- Longitud de contexto no declarada, lo que impide dimensionar la caché KV y el hardware de servicio.
- Soporte de tool calling y de flujos de agente no confirmado en la documentación disponible; conviene validarlo antes de integrarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BigBojangles/Swift-1.5-Qwen3.8-27b-EXL3-4.00bpw-H5
- Modelo padre (UkisAI Swift 1.5 Qwen3.8-27b): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Modelo base (Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B
- Página de Swift 1.5 con comparativas: https://ukisai.com/swift-1-5-27b
- Anuncio de la familia Swift: https://ukisai.com/news/introducing-swift
- ExLlamaV3 (herramienta de conversión): https://github.com/turboderp-org/exllamav3
- Cuantización EXL3 alternativa del mismo padre: https://huggingface.co/erlidev/Swift-1.5-Qwen3.8-27B-EXL3
- Kit de despliegue con decodificación especulativa sobre Qwen3.8-27B: https://github.com/MiaAI-Lab/Qwen3.8-27B-DFlash2-EXL3-5.0bpw
- Contacto para licencia comercial de UkisAI: https://ukisai.com/contact
- Ficheros de licencia y atribución incluidos en el repositorio: `LICENSE` (Swift Open License v1.0), `LICENSE-APACHE-2.0`, `NOTICE`, `quantization_config.json`
