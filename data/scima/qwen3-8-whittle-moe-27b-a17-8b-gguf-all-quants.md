# scima/Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF-all-quants

## Resumen

El modelo `scima/Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF-all-quants` es una colección de cuantizaciones GGUF del modelo `logic65/Qwen3.8-Whittle-MoE-27B-A17.8B`, un MoE (Mixture of Experts) construido a partir del modelo denso Qwen3.8-27B de Alibaba mediante una técnica de poda y mezcla de expertos. El autor, logic65, ha extraído un MoE de 27B parámetros totales con aproximadamente 17,8B activos del modelo denso original, y lo ha entrenado adicionalmente para reducir la verbosidad y los bucles de generación. La versión v2.1, que es la cuantizada aquí, alcanza una tasa de bucle del 8 % en turnos simples y del 22 % en respuestas estructuradas, con cero respuestas truncadas en las pruebas del autor.

Este repositorio, creado por scima, ofrece todas las cuantizaciones GGUF (desde Q2_K hasta F16) para permitir la ejecución en hardware variado, desde tarjetas con 16 GB de VRAM hasta servidores con mayor capacidad. La licencia Apache 2.0 facilita el uso comercial y la integración en productos. Al ser una cuantización de un modelo ya ligero por su arquitectura MoE, se convierte en una opción práctica para despliegues locales de generación de texto con razonamiento y código, sin necesidad de infraestructura de gran escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) derivada de Qwen3.8-27B |
| Parámetros totales | 26 917 297 664 (26,9B) |
| Parámetros activos | 17,8B (según el identificador) o 18B (según la model card) |
| Longitud de contexto | No disponible (en el ejemplo de comando se usa 8192) |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo original, `logic65/Qwen3.8-Whittle-MoE-27B-A17.8B`, se construye tomando el modelo denso Qwen3.8-27B de Alibaba y aplicando un proceso de "whittling" (adelgazamiento) que convierte los bloques densos en módulos de expertos, probablemente mediante técnicas de poda y reentrenamiento. El resultado es un MoE con un número de parámetros totales similar al original (27B) pero con solo una fracción de activos por token (17,8B o 18B). Posteriormente, se realiza un entrenamiento adicional para enseñar al modelo a detener su generación de forma más natural, reduciendo los bucles y las respuestas truncadas.

Según la model card del autor, la versión v2.1 ha superado todas las barreras de liberación: tasa de bucle en turno único del 8 % (frente al 69 % de la primera versión), tasa de bucles en respuestas estructuradas del 22 % (frente al 75 %), cero respuestas truncadas y una puntuación de 28 sobre 39 en la batería de conocimiento interna. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens ni las técnicas de alineación (RLHF, DPO, etc.).

## Capacidades

- Generación de texto en lenguaje natural, con razonamiento paso a paso.
- Capacidad de codificación heredada de Qwen3.8-27B, aunque no se especifica el nivel exacto.
- Soporte para conversaciones multi-turno (el ejemplo de comando usa `--jinja` para plantillas de chat).
- Arquitectura MoE que reduce la carga computacional por token en comparación con un modelo denso del mismo tamaño total.
- Compatibilidad con llama.cpp y sus derivados (llama-server, Ollama, etc.) sin necesidad de parches, según indica el autor.
- No se mencionan capacidades multimodales (visión, audio) en la model card; el modelo se presenta como de solo texto.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de 16 GB o 24 GB: las cuantizaciones Q3_K_M (13,9 GB) y Q4_K_M (17,4 GB) permiten ejecutar el modelo en hardware de consumo, ideal para prototipado y desarrollo sin depender de la nube.
- Asistente de código en entornos aislados: al ser un MoE con 17,8B activos, ofrece una buena relación calidad/velocidad para autocompletado y generación de código en editores, con la posibilidad de ajustar la cuantización según la VRAM disponible.
- Chatbot de soporte técnico con contexto largo: el modelo soporta ventanas de al menos 8192 tokens (según el comando de ejemplo), suficiente para mantener conversaciones detalladas con múltiples turnos y documentos de referencia.
- Servidor de inferencia con llama.cpp: se puede lanzar `llama-server` con la cuantización adecuada y exponer una API compatible con OpenAI para integrarla en aplicaciones existentes.
- Investigación en eficiencia de MoE: dado que el modelo es un MoE post-hoc, puede usarse como caso de estudio para comparar el rendimiento de arquitecturas MoE frente a densas en tareas de razonamiento y código.
- Entornos con restricciones de memoria: las cuantizaciones Q2_K (11,3 GB) y Q3_K_S (12,7 GB) son las más pequeñas y pueden ejecutarse en GPUs con 12 GB de VRAM, aunque con una mayor pérdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta métricas internas de estabilidad (tasa de bucle, respuestas truncadas) y una puntuación de "batería de conocimiento" de 28/39, pero no son comparables con benchmarks convencionales. No se dispone de datos de rendimiento (latencia, throughput) para las cuantizaciones.

## Requisitos de hardware

- VRAM estimada: según el archivo GGUF, el Q4_K_M ocupa 17,4 GB, el Q3_K_M 13,9 GB, el Q2_K 11,3 GB y el Q8_0 28,7 GB. El F16 ocupa 53,9 GB.
- GPUs recomendadas: para Q4_K_M se necesita una GPU con 24 GB (por ejemplo, RTX 3090/4090) o dos GPUs de 12 GB en paralelo; para Q3_K_M es suficiente una GPU de 16 GB (RTX 4080, A100 40GB puede ejecutar Q8_0).
- En consumer GPU: sí, las cuantizaciones de menor tamaño (Q2_K a Q4_K_M) caben en tarjetas de consumo de 16 GB y 24 GB.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), Ollama, vLLM (si soporta GGUF), llama-cpp-python, etc. El ejemplo de comando usa `llama-server` con `-ngl 99` para descargar todas las capas a GPU.
- Latencia y throughput: no disponibles. Se recomienda usar cuantizaciones más altas (Q8_0) para reducir la probabilidad de bucles, según el autor, aunque el rendimiento será menor.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos MoE de tamaño similar. El modelo base Qwen3.8-27B es un denso de 27B parámetros, pero no es comparable directamente porque la arquitectura MoE cambia el rendimiento. Se podría comparar con otros MoE como Mixtral 8x7B (46,7B totales, 12,9B activos) o Qwen3-30B-A3B (30B totales, 3B activos), pero no se tienen datos de rendimiento de Whittle-MoE para hacer una comparativa justa. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Es una cuantización de un modelo MoE post-hoc; la calidad puede degradarse en cuantizaciones bajas (Q2_K, Q3_K_S). El autor recomienda Q4_K_M o superior para evitar bucles y pérdidas de coherencia.
- El modelo presenta una tasa de bucle del 8 % en turnos simples y 22 % en respuestas estructuradas, lo que puede manifestarse en repeticiones o generaciones interminables en ciertos contextos.
- No se ha verificado el rendimiento en idiomas distintos del inglés; no hay información sobre soporte multilingüe.
- El modelo es solo de texto; no hereda las capacidades multimodales del Qwen3.8-27B original (si las tuviera).
- La licencia Apache 2.0 permite uso comercial, pero hay que respetar los términos de la licencia de los pesos originales de Qwen3.8-27B, que pueden tener restricciones adicionales (aunque el modelo base es de Alibaba, su licencia es Apache 2.0 según el repositorio de Qwen).
- Para producción, se recomienda probar el modelo con la cuantización Q8_0 o F16 para minimizar artefactos de cuantización, especialmente en tareas de razonamiento complejo.

## Enlaces

- Repositorio de HuggingFace de este modelo: https://huggingface.co/scima/Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF-all-quants
- Modelo base (cuantizaciones oficiales de logic65): https://huggingface.co/logic65/Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF/
- Modelo original de logic65: https://huggingface.co/logic65/Qwen3.8-Whittle-MoE-27B-A17.8B
- Repositorio de Qwen3.8-27B (base densa): https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Guía de despliegue local de Qwen3.8-27B (Geeky Gadgets): https://www.geeky-gadgets.com/serve-qwen-3-8-27b-fast/
