# mradermacher/GRM-3.2-Sky-abliterated-GGUF

## Resumen

Este modelo es la cuantización GGUF de "Crata/GRM-3.2-Sky-abliterated", realizada por mradermacher. Se trata de un modelo de 34.660.610.688 parámetros (aproximadamente 34,7 mil millones) que ha sido sometido a un proceso de "abliteration" para eliminar ciertas direcciones de activación asociadas con conductas de rechazo o restricciones de seguridad. La versión GGUF permite ejecutarlo en entornos locales mediante llama.cpp u Ollama, reduciendo el coste de inferencia en GPU de consumo. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para conversación en inglés, con archivos de proyectores multimodales (mmproj) que sugieren capacidades adicionales de entrada no textual, aunque la modalidad exacta no se detalla. La longitud de contexto no está documentada.

La cuantización está disponible en varios niveles, siendo Q4_K_S el recomendado por su equilibrio entre calidad y tamaño (20,0 GB). El modelo es relevante para desarrolladores que buscan un modelo de gran tamaño en formato GGUF con una licencia permisiva y un comportamiento menos censurado, típico de los modelos abliterated.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (se utiliza la librería transformers, pero no se documenta la arquitectura concreta) |
| Parametros totales | 34.660.610.688 (34,66 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q4_K_S, Q8_0, Q6_K, Q5_K_S, Q5_K_M, Q4_K_M, Q3_K_M, Q3_K_S, Q3_K_L, IQ4_XS, f16; además de mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivos mmproj para multimodalidad) |

## Arquitectura y entrenamiento

No hay información pública sobre la arquitectura detallada ni el proceso de entrenamiento del modelo base en los datos disponibles. Se sabe que es una cuantización estática del modelo "Crata/GRM-3.2-Sky-abliterated", que a su vez es una versión "abliterated" del modelo original "GRM-3.2-Sky". El proceso de abliteration elimina patrones de activación aprendidos durante el alineamiento para reducir las negativas de seguridad sin necesidad de reentrenamiento completo. El repositorio incluye proyectores multimodales (mmproj), lo que indica que el modelo original integra algún tipo de multimodalidad, aunque no se especifica si se trata de visión, audio u otra modalidad. Tampoco se han publicado datos de tokens de entrenamiento ni de métodos de alineamiento como RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, como indica la etiqueta "conversational".
- Cuantizaciones GGUF de varios tipos, lo que permite su ejecución en una amplia gama de hardware, desde CPU hasta GPU con memoria limitada.
- Incluye archivos mmproj adicionales que sugieren soporte multimodal, aunque no se especifica el tipo de modalidad.
- Comportamiento modificado por abliteration: el modelo es menos propenso a rechazar peticiones que un modelo con alineamiento estándar, lo que puede ser útil o peligroso según el caso.
- El tag "endpoints_compatible" del repositorio indica que puede utilizarse en entornos de inferencia compatible con Hugging Face endpoints.
- No se ha confirmado soporte de tool calling, function calling ni razonamiento multi-paso en los datos disponibles.

## Casos de uso

- Asistente conversacional local: despliegue en una estación de trabajo con GPU de 24 GB (por ejemplo, RTX 4090) usando el archivo Q4_K_S a través de llama.cpp u Ollama, para mantener conversaciones en inglés sin depender de la nube.
- Investigación en interpretabilidad: comparación de respuestas con y sin abliteration para estudiar cómo el alineamiento afecta al comportamiento del modelo en escenarios de seguridad.
- Prototipos multimodales: uso de los archivos mmproj para construir aplicaciones que acepten entradas de texto e imagen (si la modalidad es visual) o de audio, aprovechando que el modelo base parece integrar capacidades multimodales.
- Generación de contenido creativo o roleplay: el modelo abliterated ofrece respuestas más directas en temas que normalmente serían rechazados, útil para herramientas de escritura de ficción o juegos de rol en inglés, siempre con supervisión humana.
- Evaluación de cuantizaciones: aprovechar la variedad de cuantizaciones para medir la degradación de calidad en tareas de conversación y elegir el nivel óptimo entre memoria y rendimiento en un hardware concreto.
- Despliegue educativo en CPU: con Q2_K (13 GB) se puede ejecutar en un servidor con 16 GB de memoria para demostrar el funcionamiento de un modelo de 34B en un entorno sin GPU en el aula.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: Q4_K_S (~20 GB) necesita al menos 20 GB de VRAM o RAM disponible; Q2_K (~13 GB) necesita alrededor de 13-16 GB. Los proyectores mmproj añaden 0,7-1,0 GB adicionales si se usan.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), RTX 4090 (24 GB) para Q4_K_S; RTX 3090/4080/4090 para Q2_K con contexto reducido.
- En GPU de consumo: Q2_K cabe en una RTX 4080 de 16 GB con margen justo, o en una RTX 3090/4090 de 24 GB con más espacio. Q4_K_S necesita una GPU de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y KoboldCpp (todas compatibles con GGUF). No se recomienda vLLM para este formato, ya que vLLM está pensado para safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa verificada en los datos proporcionados. Como referencia, modelos de tamaño similar que también se distribuyen en formato GGUF incluyen Qwen2.5-32B-Instruct, Gemma-2-27B o Yi-1.5-34B. Las especificaciones detalladas de estos modelos no están disponibles en la información utilizada para esta ficha; se recomienda consultar sus respectivas model cards para una comparación rigurosa.

## Limitaciones y advertencias

- El modelo es abliterated, lo que significa que se han eliminado deliberadamente ciertas capas de seguridad. Esto aumenta el riesgo de generar contenido ofensivo, ilegal o dañino. No debe desplegarse sin filtros adicionales en aplicaciones de producción.
- Alucinación: no se dispone de datos de evaluación, pero al ser un modelo grande sin verificación de hechos, el riesgo de respuestas falsas o inventadas es inherente.
- Idioma: solo inglés, por lo que no sirve para aplicaciones en español sin una capa de traducción o fine-tuning.
- Contexto: la longitud de contexto no está documentada. En consecuencia, no se puede garantizar un rendimiento adecuado en conversaciones muy largas o documentos extensos.
- Cuantizaciones agresivas: Q2_K puede degradar notablemente la calidad de las respuestas; se recomienda Q4_K_S para un equilibrio razonable.
- Sin soporte confirmado de tool calling: no debe usarse en sistemas que dependan de function calling sin verificar su comportamiento.
- Los archivos mmproj son suplementos multimodales; si no se cargan correctamente, el modelo probablemente no pueda procesar entradas multimodales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/GRM-3.2-Sky-abliterated-GGUF
- Modelo base: https://huggingface.co/Crata/GRM-3.2-Sky-abliterated
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Página de descarga del modelo: https://hf.tst.eu/model#GRM-3.2-Sky-abliterated-GGUF
- Solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
