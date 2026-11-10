# mradermacher/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-GGUF

## Resumen

`mradermacher/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-GGUF` es una colección de cuantizaciones estáticas en formato GGUF generadas por mradermacher a partir del modelo `DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2`. El repositorio no contiene un modelo entrenado desde cero, sino una conversión a GGUF de pesos preexistentes, pensada para su uso con llama.cpp y derivados (Ollama, LM Studio, etc.). La fecha de creación del repositorio es el 10 de noviembre de 2026.

El nombre comercial sugiere una base Qwen3 de 40B, pero los datos reales de safetensors del repositorio indican 460.730.096 parámetros totales, una cifra muy alejada de los 40B que anuncia el título. Esta discrepancia es la advertencia más importante de la ficha: no debe asumirse que el modelo tiene el tamaño que sugiere su denominación. El tamaño del repositorio es de 1,6 GB, coherente con un modelo de unos 460M de parámetros cuantizado en varios formatos.

La relevancia de este repositorio es limitada y muy específica: sirve para desplegar en local una variante "uncensored" y "heretic" (es decir, con los mecanismos de rechazo o alineación presumiblemente atenuados) del modelo base de DavidAU, en hardware de consumo. No hay información publicada sobre arquitectura, datos de entrenamiento ni evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere transformer basado en Qwen3; no confirmado) |
| Parámetros totales | 460.730.096 (según safetensors del repositorio); el nombre indica 40B, dato no consistente |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se convirtió desde formato HF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base. El nombre hace referencia a "Qwen3", lo que podría implicar una arquitectura transformer con atención completa o híbrida típica de la familia Qwen, pero no hay confirmación en la información proporcionada. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otras técnicas de alineación. El calificativo "Heretic" y "Uncensored" sugiere que el modelo base de DavidAU ha sido sometido a algún proceso de ablación o fine-tuning para reducir los rechazos, pero el método concreto no está publicado en la información disponible.

La contribución técnica de este repositorio es exclusivamente la cuantización: mradermacher ha generado cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1) con la herramienta estándar de llama.cpp, incluyendo una amplia gama de niveles de compresión, desde Q2_K hasta Q8_0 y F16, además de IQ4_XS. No hay innovaciones de arquitectura ni de decodificación documentadas.

## Capacidades

- Generación de texto autoregresiva, presumiblemente en el estilo del modelo base, aunque no hay evaluación publicada.
- Presunta reducción de rechazos y respuestas de tipo "uncensored", según la denominación del modelo base; no verificado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Experimentación local con llama.cpp: cargar las cuantizaciones Q4_K_M o Q5_K_M en un equipo de consumo para probar el comportamiento del modelo base sin depender de servicios en la nube. Adecuado por el tamaño reducido del repositorio (1,6 GB) y la disponibilidad de múltiples niveles de cuantización.
- Investigación sobre alineación y censura: comparar las respuestas del modelo "uncensored" con las de su base alineada para estudiar qué comportamientos se ven afectados por la ablación. Requiere revisar la model card del modelo base para conocer el método.
- Pruebas de integración con Ollama o LM Studio: importar el GGUF y validar flujos de inferencia en local antes de escalar a modelos mayores.
- Evaluación de calidad de cuantizaciones: comparar la perplejidad o las respuestas entre Q2_K, Q4_K_M y Q8_0 para medir la degradación introducida por la compresión, un uso habitual de los repositorios de mradermacher.
- Prototipado de chatbots de bajo coste: desplegar en CPU o GPU modesta para demos internas donde la latencia no sea crítica.
- Docencia y talleres: usar un modelo pequeño y con muchos formatos disponibles para explicar el proceso de cuantización y despliegue de LLM en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 460M de parámetros, un GGUF Q4_K_M ocuparía aproximadamente 0,3-0,4 GB; Q8_0 en torno a 0,5-0,6 GB; F16 alrededor de 0,9-1,0 GB. Cálculos estimados a partir del recuento de parámetros, no confirmados por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para las cuantizaciones pequeñas; una RTX 3060, RTX 4060 o superior permite cargar F16 con holgura y contexto amplio.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que no son la vía recomendada.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y del contexto. Con un modelo de este tamaño, en una GPU de consumo se espera un throughput alto (decenas o cientos de tokens por segundo), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este repositorio (Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-GGUF) | 460,7M (según safetensors) | no disponible | no disponible | GGUF | Cuantización estática de un modelo de DavidAU; nombre inconsistente con el tamaño real |
| Modelo base: DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2 | no disponible | no disponible | no disponible | safetensors (presumiblemente) | Origen de las cuantizaciones; sin datos públicos en la información disponible |
| Otras cuantizaciones de mradermacher de modelos pequeños | variable | variable | variable | GGUF | Repositorios similares del mismo autor, con la misma metodología de cuantización estática |

No se dispone de información suficiente para comparar con alternativas de la misma categoría (mismo tamaño o misma tarea) más allá de la referencia al modelo base.

## Limitaciones y advertencias

- Discrepancia crítica de tamaño: el nombre indica "40B" pero los safetensors del repositorio declaran 460.730.096 parámetros. No debe asumirse que el modelo tiene 40B; verificar el modelo base antes de cualquier uso en producción.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Contactar con el autor del modelo base (DavidAU) antes de desplegarlo en un producto.
- Modelo "uncensored" y "heretic": es probable que tenga los mecanismos de rechazo atenuados, lo que aumenta el riesgo de generar contenido inapropiado, sesgado o dañino. No apto para aplicaciones orientadas al público sin filtros adicionales.
- Riesgo de alucinación: no evaluado; los modelos pequeños sin benchmarks publicados suelen tener una fiabilidad limitada en tareas de razonamiento y hechos.
- Idiomas y contexto: no documentados; no se puede garantizar un buen rendimiento multilingüe ni una ventana de contexto concreta.
- Procedencia: es una cuantización de terceros, no una versión oficial; los pesos pueden diferir del modelo base en comportamiento debido a la compresión.
- Sin métricas de calidad: no hay benchmarks ni evaluaciones publicadas que permitan estimar la degradación introducida por cada cuantización.
- Fecha de creación futura (2026): el repositorio está fechado en noviembre de 2026, lo que puede indicar metadatos erróneos o un artefacto de la plataforma; conviene verificar la integridad de los archivos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
