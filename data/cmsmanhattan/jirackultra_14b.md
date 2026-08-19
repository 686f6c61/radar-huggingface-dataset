# CMSManhattan/JiRackUltra_14b

## Resumen

JiRack Ultra 14B es un modelo de lenguaje de 14 770 millones de parámetros desarrollado por CMSManhattan, diseñado específicamente para inferencia eficiente en CPU. Se basa en la arquitectura DeepSeek R1-14B e incorpora soporte nativo para pesos ternarios (estilo BitNet, 1.58 bits), lo que permite una compresión adicional y un menor consumo de memoria en comparación con modelos densos de tamaño similar. El modelo incluye un tokenizador ampliado con etiquetas especiales para routing, tool calling, robótica, medios, visión y sonido, lo que sugiere un enfoque orientado a aplicaciones de agentes y sistemas conversacionales.

La relevancia actual del modelo radica en su capacidad para ejecutarse en hardware sin GPU dedicada, con cuantizaciones GGUF listas para usar y una interfaz web integrada. Está dirigido a desarrolladores que buscan desplegar asistentes conversacionales o sistemas de RAG en infraestructura de bajo coste. Sin embargo, la documentación pública es limitada: no se proporcionan detalles sobre el entrenamiento, benchmarks ni comparativas con otros modelos, y la licencia presenta contradicciones entre el tag MIT y las condiciones comerciales descritas en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek R1-14B con soporte ternario (BitNet-style) |
| Parametros totales | 14 770 033 664 (14,77B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16 (full), GGUF Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th (13 idiomas) |
| Licencia | MIT (según tags de HuggingFace), pero la model card menciona licencia comercial y suscripciones |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura declarada es una variante de DeepSeek R1-14B con modificaciones para soportar pesos ternarios (BitNet). Esto implica que los pesos se cuantizan a valores de -1, 0 y +1 (1.58 bits), lo que reduce drásticamente el uso de memoria y acelera la inferencia en CPU, especialmente con instrucciones AVX2/AVX-512 (mencionado como servicio opcional). El tokenizador ha sido ampliado con etiquetas adicionales para routing, tool calling, robótica, medios, visión y sonido, aunque no se especifica si el modelo es realmente multimodal o si esas etiquetas son solo tokens de control.

No se proporciona información sobre el conjunto de datos de entrenamiento, el número de tokens procesados, ni sobre técnicas de alineación como RLHF o DPO. La model card menciona la posibilidad de realizar QAT (Quantization-Aware Training) bajo petición, pero no detalla el proceso original de entrenamiento.

## Capacidades

- Generación de texto en 13 idiomas (en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th).
- Soporte de tool calling y function calling, según los tags del tokenizador.
- Capacidades de routing y etiquetas para robótica, lo que sugiere uso en sistemas de agentes y control de dispositivos.
- Optimizado para inferencia en CPU con cuantizaciones GGUF de bajo consumo.
- Incluye una interfaz web (JiRack UI) para interacción directa.
- Compatible con despliegue en contenedores Docker y con la API de Ollama (según el cliente de escritorio mencionado).

No se documentan capacidades específicas de razonamiento avanzado, generación de código o matemáticas. La información disponible no permite confirmar si el modelo es multimodal a pesar de las etiquetas de visión y sonido en el tokenizador.

## Casos de uso

- **Asistentes conversacionales en CPU**: gracias a su diseño para inferencia en CPU y cuantizaciones compactas (Q4_K_M de ~10 GB), puede desplegarse en servidores sin GPU para chatbots de atención al cliente o asistentes internos.
- **Sistemas RAG (Retrieval-Augmented Generation)**: la model card lo propone como modelo experto en despliegues RAG, aprovechando su bajo coste de infraestructura y su capacidad para procesar consultas con contexto recuperado.
- **Tool calling en entornos de agentes**: el tokenizador incluye etiquetas específicas para tool calling, lo que permite integrarlo en pipelines donde el modelo decide qué herramienta invocar (búsquedas, APIs, bases de datos).
- **Robótica y control de dispositivos**: las etiquetas de robótica en el tokenizador sugieren su uso en sistemas de instrucción para hardware, aunque no hay ejemplos concretos documentados.
- **Despliegue en edge computing**: con cuantizaciones Q2_K (~6,8 GB) y requisitos de RAM de 6-9 GB, puede ejecutarse en portátiles o mini-PCs para aplicaciones locales de procesamiento de lenguaje.
- **Prototipado rápido con Docker**: la disponibilidad de imágenes Docker listas para usar (con UI web en el puerto 7869) facilita la creación de demos y pruebas de concepto sin configuración compleja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se ofrecen comparativas con modelos similares.

## Requisitos de hardware

La model card proporciona recomendaciones de CPU y RAM para distintas cuantizaciones:

- **Q4_K_M** (10,1 GB): recomendado con Ryzen 7 / Intel i7 y 24-32 GB de RAM. Buen rendimiento interactivo.
- **Q3_K_M** (8,42 GB): aceptable con CPUs de 8+ núcleos y 16-24 GB de RAM.
- **Q2_K** (6,81 GB): para entornos con poca memoria, como portátiles con 16 GB de RAM.
- **Full precision** (28,1 GB): requiere 32-48 GB de RAM y CPUs de gama alta (Ryzen 9 / Intel i9).

El modelo está pensado para CPU, no se mencionan requisitos de GPU. Las opciones de despliegue incluyen Docker, la interfaz web integrada y un cliente de escritorio para Windows 11 que usa la API de Ollama. Se menciona soporte para instrucciones AVX2 y AVX-512 (como servicio opcional de conversión a TQ2_0), lo que puede mejorar el rendimiento en CPUs modernas.

No se especifican latencias ni throughput concretos. La model card indica "Good interactive" para Q4_K_M en hardware recomendado, pero sin cifras exactas.

## Comparativa con modelos similares

No disponible. No se proporcionan datos comparativos con otros modelos de tamaño similar (por ejemplo, Qwen2.5-14B, Llama-3-8B, Mistral-7B) en términos de rendimiento, velocidad o calidad de generación.

## Limitaciones y advertencias

- **Licencia contradictoria**: aunque el tag de HuggingFace indica MIT, la model card describe una licencia comercial ($12 por usuario al año) y suscripciones adicionales. Esta ambigüedad puede generar problemas legales en despliegues comerciales. Se recomienda contactar al autor antes de usar el modelo en producción.
- **Información de entrenamiento ausente**: no se detallan los datos de entrenamiento, el número de tokens ni el proceso de alineación, lo que dificulta evaluar sesgos o riesgos de alucinación.
- **Sin benchmarks publicados**: no es posible comparar objetivamente su calidad con otros modelos.
- **Capacidades multimodales no confirmadas**: a pesar de las etiquetas de visión y sonido en el tokenizador, no hay evidencia de que el modelo procese imágenes o audio.
- **Riesgo de alucinación**: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en contextos no cubiertos por sus datos de entrenamiento.
- **Dependencia de servicios propietarios**: el autor ofrece servicios de conversión ternaria, QAT y adaptación bajo NDA, lo que sugiere que algunas funcionalidades avanzadas no están disponibles de forma abierta.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/CMSManhattan/JiRackUltra_14b)
- [Tokenizador JiRackPrecisionTokenizer](https://huggingface.co/CMSManhattan/JiRackPrecisionTokenizer)
- [Cliente de escritorio JiRack (Windows 11, con API Ollama)](https://huggingface.co/kgrabko/JiRackTernary_1b/resolve/main/jirack-chat.zip)
- Contacto por correo: support@cmsmanhattan.com
