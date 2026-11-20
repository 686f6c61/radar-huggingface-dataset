# HanzoHuang/Spark-X2.5-1.7B-RKLLM

## Resumen

Spark-X2.5-1.7B-RKLLM es una conversión cuantizada del modelo de lenguaje Spark-X2.5-1.7B (autoría de XHToken) para su ejecución en las NPU de los SoC Rockchip RK3576 y RK3588. El artefacto lo publica HanzoHuang y emplea el formato nativo RKLLM generado con RKLLM Toolkit 1.3.1, lo que permite desplegar el modelo en placas de placa única y dispositivos de borde (edge) con aceleración por hardware en lugar de depender de GPU convencionales.

El modelo base tiene 1.700 millones de parámetros y una ventana de contexto exportada de 4.096 tokens. La conversión ofrece tres variantes de cuantización: w4a16_g128 y w8a8 para RK3576, y w8a8 para RK3588, con tamaños de descarga entre 1,56 GiB y 2,14 GiB. El pipeline declarado es text-generation (texto a texto) y la licencia es Apache 2.0.

Su relevancia actual radica en que facilita el despliegue de un LLM de tamaño medio en hardware de bajo consumo y bajo coste (placas RK3576/RK3588), un nicho donde escasean artefactos listos para producción. Incluye imágenes Docker con el modelo empaquetado y una API servida en el puerto 8001, lo que reduce la fricción de integración. No obstante, la información publicada se limita a la conversión y a pruebas de humo funcionales; no hay datos de benchmarks de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base XHToken/Spark-X2.5-1.7B; artefacto en formato RKLLM) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | w4a16_g128 (4 bits pesos, 16 bits activaciones, grupo 128); w8a8 (8 bits pesos y activaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | RKLLM (artefactos nativos RKLLM/RKNN); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base XHToken/Spark-X2.5-1.7B en la documentación proporcionada. El repositorio documenta únicamente el proceso de conversión: se usaron pesos de origen de ModelScope y muestras de calibración generadas por el SDK de Rockchip, con RKLLM Toolkit 1.3.1. La calibración de Spark requirió un entorno aislado de Transformers 4.57.1, mientras que el resto de entornos de conversión se mantuvieron sin cambios.

La innovación técnica destacable no está en el modelo en sí, sino en el artefacto: la exportación a RKLLM permite ejecutar inferencia sobre la NPU integrada en los SoC Rockchip RK3576 y RK3588, con cuantización específica por placa. No se documentan técnicas como decodificación especulativa, atención lineal ni etapas de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto (entrada y salida exclusivamente textual).
- Conversación multi-turno con recall de contexto, verificado en las pruebas de humo del autor.
- Razonamiento aritmético básico, verificado en pruebas funcionales.
- Respuestas a preguntas factuales, verificadas en pruebas de humo.
- Salida en streaming, soportada por la API incluida en la imagen Docker.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales en dispositivos de borde: el modelo puede gestionar diálogos multi-turno con hasta 4.096 tokens de contexto directamente en la NPU de una placa RK3576 o RK3588, sin necesidad de conectividad a la nube ni de GPU dedicada.
- Automatización industrial embebida: integración en paneles de control o equipos de planta que ejecuten la API en el puerto 8001 para ofrecer interfaces en lenguaje natural sobre datos locales, aprovechando el bajo consumo del SoC.
- Kioscos y terminales de atención al público: despliegue de un chatbot local con la variante w4a16_g128 (1,56 GiB) en RK3576, adecuada para hardware con memoria limitada.
- Prototipado rápido de aplicaciones LLM: las imágenes Docker empaquetadas con el modelo permiten levantar un servicio de inferencia con un único comando, útil para validar ideas antes de escalar a infraestructura mayor.
- Procesamiento de texto en entornos sin conectividad: clasificación, resumen o extracción de información en ubicaciones remotas donde no hay acceso a la nube, con el modelo ejecutándose íntegramente en local.
- Educación e investigación en IA de borde: estudio del rendimiento de LLMs cuantizados en NPUs Rockchip, con artefactos reproducibles y sumas de verificación SHA-256 publicadas para validar la integridad de los ficheros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las comprobaciones realizadas (aritmética, pregunta factual, salida en streaming y recall conversacional) son pruebas de humo funcionales, no benchmarks de calidad, y que las tres variantes pasaron dichas pruebas en sus placas correspondientes con RKLLM 1.3.1.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en la NPU de los SoC Rockchip, no en GPU.
- Placas soportadas: RK3576 (variantes w4a16_g128 y w8a8) y RK3588 (variante w8a8).
- Tamaño de descarga por variante: 1,56 GiB (RK3576 w4a16_g128), 2,14 GiB (RK3576 w8a8) y 2,12 GiB (RK3588 w8a8). El autor advierte que el tamaño del fichero es el de descarga, no la RAM total en tiempo de ejecución.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; los artefactos son nativos RKLLM/RKNN y requieren un runtime RKLLM compatible.
- Despliegue: imágenes Docker publicadas en ghcr.io/hanzo-huang/rkllm-docker/llm/spark-x2.5-1.7b con etiquetas por placa y cuantización; también es posible descargar los ficheros .rkllm por separado con hf download.
- Ejemplo de arranque: contenedor con --privileged, montaje de /dev y publicación del puerto 8001, con --max_context_len 4096.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos, y las alternativas comparables serían otras conversiones RKLLM de modelos de tamaño similar, sobre las que no se aportan datos.

## Limitaciones y advertencias

- Sin benchmarks de calidad publicados: las únicas validaciones son pruebas de humo funcionales; no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni tareas similares.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado fuera del idioma o idiomas del modelo base.
- Dependencia de hardware específico: los artefactos solo funcionan en RK3576 y RK3588 con un runtime RKLLM compatible; no son portables a GPU convencionales ni a otros formatos sin reconversión.
- La cuantización w4a16_g128 y w8a8 puede degradar la calidad respecto a los pesos originales; no se cuantifica esa pérdida en la documentación.
- Riesgo de alucinación inherente a los modelos de 1,7B parámetros; no se documentan mitigaciones.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0, que permite uso comercial, pero el autor remite a la model card del modelo base para los términos y el uso previsto; conviene revisarla antes de producción.
- El tamaño del fichero no equivale al consumo de RAM en ejecución; es necesario dimensionar la memoria de la placa en consecuencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HanzoHuang/Spark-X2.5-1.7B-RKLLM
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-1.7B
- Rockchip RKLLM (herramientas de conversión): https://github.com/airockchip/rknn-llm
- rkllm-docker (imágenes y API): https://github.com/Hanzo-Huang/rkllm-docker#readme
- reComputer AI Lab (guías de despliegue): https://sensecraft.seeed.cc/ai-lab/en/models?device=rk3588
