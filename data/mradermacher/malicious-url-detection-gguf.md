# mradermacher/malicious-url-detection-GGUF

## Resumen

Este modelo es una cuantización en formato GGUF del clasificador `rocker417/malicious-url-detection`, un modelo basado en la arquitectura DistilBERT entrenado para detectar URLs maliciosas y prevenir ataques de phishing. La cuantización ha sido realizada por mradermacher, que publica doce versiones con diferentes niveles de compresión (desde Q2_K hasta f16), lo que permite desplegar el modelo en entornos con recursos muy limitados, desde CPUs de bajo consumo hasta GPUs de gama media.

El modelo resuelve un problema concreto de ciberseguridad: la clasificación binaria de URLs como maliciosas o benignas. Su relevancia radica en que, al tratarse de un modelo pequeño (aproximadamente 67 millones de parámetros) y estar disponible en formatos GGUF, puede integrarse fácilmente en sistemas de filtrado en tiempo real, pasarelas de correo o extensiones de navegador sin necesidad de infraestructura de alto rendimiento. La licencia Apache 2.0 permite su uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (clasificación de secuencias) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (típica de DistilBERT: 512 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, IQ4_XS, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `rocker417/malicious-url-detection` es un DistilBERT, una versión destilada de BERT que conserva aproximadamente el 97% de su rendimiento con un 40% menos de parámetros. Se trata de un transformer encoder-only con atención bidireccional, diseñado originalmente para tareas de comprensión del lenguaje. En este caso, se ha adaptado para clasificación de secuencias mediante una cabeza de clasificación sobre el token `[CLS]`.

El entrenamiento se realizó sobre el dataset `kmack/Phishing_urls`, un conjunto de datos etiquetado con URLs legítimas y maliciosas. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. La cuantización a GGUF realizada por mradermacher es estática, sin imatrix, y se ha generado a partir de los pesos originales en formato Hugging Face. No se han documentado innovaciones técnicas adicionales más allá de la compresión de pesos.

## Capacidades

- Clasificación binaria de URLs: determina si una URL es maliciosa o benigna.
- Extracción de características: el modelo puede utilizarse como extractor de embeddings de texto (tag `feature-extraction`), aunque su uso principal es la clasificación.
- Procesamiento de texto en inglés: las URLs y sus contextos (por ejemplo, texto asociado) se procesan en inglés.
- Inferencia eficiente: gracias a la cuantización GGUF, puede ejecutarse en CPU con baja latencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto, al ser un modelo encoder-only.

## Casos de uso

- Filtrado de correo electrónico: integrar el modelo en un servidor de correo para marcar o bloquear mensajes que contengan URLs sospechosas, reduciendo el riesgo de phishing.
- Protección en pasarelas web: desplegar el modelo como middleware en un proxy corporativo para interceptar y bloquear accesos a URLs maliciosas en tiempo real.
- Extensiones de navegador: crear una extensión que analice las URLs visitadas y muestre una advertencia al usuario si el modelo las clasifica como peligrosas.
- Monitorización de redes sociales: analizar enlaces compartidos en plataformas sociales o foros para detectar campañas de phishing antes de que lleguen a los usuarios.
- Enriquecimiento de SIEM: utilizar el modelo como parte de un pipeline de seguridad para enriquecer logs y alertas con la clasificación de URLs observadas en el tráfico de red.
- Investigación en ciberseguridad: servir como punto de partida para experimentos de detección de phishing, comparando su rendimiento con otros modelos o mejorando su entrenamiento con datos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como precisión, recall o F1 sobre conjuntos de prueba estándar, ni comparaciones con otros modelos de detección de URLs.

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~67M de parámetros. En f16 ocupa aproximadamente 134 MB, y las versiones cuantizadas (Q4_K_M, Q5_K_M) ocupan entre 100 y 200 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM, y también puede ejecutarse en CPU.
- GPUs recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, NVIDIA GTX 1060, RTX 3060, A100) o incluso iGPUs con suficiente memoria compartida. Para despliegues en CPU, un procesador de gama media es suficiente.
- Compatibilidad con GPU de consumo: sí, todas las versiones cuantizadas funcionan en GPUs de consumo (RTX 4090, RTX 3090, etc.) y en CPUs con instrucciones AVX2.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, o cualquier runtime compatible con GGUF. También se puede convertir a otros formatos si es necesario.
- Latencia y throughput estimados: al ser un modelo pequeño, la inferencia en CPU tarda típicamente menos de 10 ms por URL en hardware moderno; en GPU, la latencia es inferior a 1 ms. No se dispone de mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos dentro del mismo repositorio o en la literatura consultada. Existen otros clasificadores de URLs basados en BERT o DistilBERT (por ejemplo, `elftsr/malicious-url-detector` o `shreyaspandey/url-phishing-detection`), pero no se han encontrado datos objetivos de rendimiento para establecer una comparativa rigurosa. Por tanto, la comparativa se limita a indicar que el modelo es de tamaño similar a otros DistilBERT fine-tuned y que su formato GGUF facilita su despliegue en entornos ligeros.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó únicamente con el dataset `kmack/Phishing_urls`, que puede no representar la diversidad de URLs maliciosas en otros idiomas o contextos geográficos.
- Riesgo de alucinación: al ser un clasificador, no genera texto, por lo que el riesgo de alucinación es bajo; sin embargo, puede producir falsos positivos (marcar URLs legítimas como maliciosas) o falsos negativos.
- Limitaciones de contexto: la longitud máxima de entrada está limitada por la arquitectura DistilBERT (típicamente 512 tokens), por lo que URLs muy largas o con mucho contexto asociado podrían truncarse.
- Idioma: solo soporta inglés. Las URLs con caracteres no ingleses o dominios internacionalizados pueden no procesarse correctamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero no se proporcionan garantías sobre la precisión del modelo en producción.
- Caveat de producción: al ser una cuantización estática sin imatrix, las versiones de menor tamaño (Q2_K, Q3_K) pueden degradar notablemente la precisión. Se recomienda usar Q4_K_M o superior para aplicaciones críticas.

## Enlaces

- [Repositorio HuggingFace del modelo cuantizado](https://huggingface.co/mradermacher/malicious-url-detection-GGUF)
- [Modelo base original](https://huggingface.co/rocker417/malicious-url-detection)
- [Dataset de entrenamiento](https://huggingface.co/datasets/kmack/Phishing_urls)
- [Modelo relacionado: mradermacher/malicious-url-detector-GGUF](https://huggingface.co/mradermacher/malicious-url-detector-GGUF)
- [Modelo relacionado: mradermacher/final-complete-malicious-url-model-GGUF](https://huggingface.co/mradermacher/final-complete-malicious-url-model-GGUF)
