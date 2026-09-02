# mradermacher/Qwen3.8-27B-3MPER0RR-abliterated-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-3MPER0RR-abliterated-i1-GGUF` es una versión cuantizada en formato GGUF del modelo base `3MPER0RR/Qwen3.8-27B-3MPER0RR-abliterated`, que a su vez deriva del Qwen3.8-27B de Alibaba. El autor de la cuantización, mradermacher, ha aplicado el proceso de imatrix para optimizar las cuantizaciones, ofreciendo una amplia gama de tamaños que van desde 7,7 GB hasta 22,2 GB, lo que permite adaptar el modelo a diferentes capacidades de hardware. La licencia es Apache 2.0, lo que facilita su uso comercial y de investigación.

El modelo base ha sido sometido a un proceso de "abliteración" (eliminación de capas de rechazo de contenido), lo que lo convierte en una herramienta útil para investigación en seguridad de IA, red-teaming y generación de contenido sin restricciones. Según la información disponible, Qwen3.8-27B incorpora un codificador de visión y soporta un contexto de 262.144 tokens, lo que lo hace adecuado para tareas multimodales y de contexto largo. La versión GGUF aquí presentada es compatible con herramientas como llama.cpp, Ollama y vLLM, facilitando su despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8-27B, con codificador de vision) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (segun informacion del modelo base) |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K, ademas de archivo imatrix |
| Idiomas soportados | Ingles (segun la model card); el modelo base Qwen3.8 probablemente soporta mas idiomas, pero no esta confirmado |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivos de cuantizacion individuales) |

## Arquitectura y entrenamiento

El modelo base es una version "abliterada" de Qwen3.8-27B, un LLM de la serie Qwen3.8 desarrollada por Alibaba. Segun la informacion publica, Qwen3.8-27B presenta una arquitectura transformer con un codificador de vision integrado, lo que le permite procesar tanto texto como imagenes. El contexto maximo declarado es de 262.144 tokens, lo que lo habilita para tareas que requieren ventanas de contexto muy largas.

El proceso de abliteracion consiste en eliminar o neutralizar las capas de rechazo del modelo original, de modo que el modelo resultante no filtra contenido por politicas de seguridad. Esto se realiza tipicamente mediante tecnicas de intervencion en los pesos o de fine-tuning especifico. El autor del modelo base es "3MPER0RR", aunque no se dispone de detalles adicionales sobre el metodo exacto empleado.

La cuantizacion realizada por mradermacher utiliza el enfoque imatrix (importance matrix), que mejora la calidad de las cuantizaciones de baja precision al ponderar la importancia de cada peso durante el proceso. Se ofrecen tanto cuantizaciones estaticas como dinamicas (i1), siendo estas ultimas las que incorporan la matriz de importancia.

## Capacidades

- Generacion de texto: produce texto coherente y contextualmente relevante en ingles.
- Razonamiento y matematicas: hereda las capacidades de razonamiento del modelo Qwen3.8-27B, aunque no se han publicado benchmarks especificos.
- Codigo: capacidad de generar y comprender codigo fuente, probablemente similar a otros modelos de la familia Qwen.
- Vision: al ser un modelo multimodal, puede procesar imagenes como entrada junto con texto (requiere el archivo mmproj correspondiente, disponible en el repositorio estatico).
- Soporte de tool calling: no confirmado explicitamente, pero los modelos Qwen3.8 suelen incluir esta funcionalidad; se recomienda verificar en el modelo base.
- Agentes y razonamiento multi-paso: probablemente soportado, dado el tamaño y la arquitectura.
- Multilingue: aunque la model card solo lista "en", el modelo base Qwen3.8 podria soportar otros idiomas; no confirmado.
- Contenido sin restricciones: al estar abliterado, no aplica filtros de seguridad, lo que permite generar contenido que el modelo original rechazaria.

## Casos de uso

- Investigacion en seguridad de IA: el modelo abliterado permite estudiar comportamientos no alineados, probar tecnicas de red-teaming y evaluar la robustez de los sistemas de moderacion.
- Generacion creativa sin censura: escritura de ficcion, guiones o contenido artistico que requiera explorar temas sensibles sin restricciones.
- Analisis de documentos largos: gracias a su contexto de 262k tokens, puede procesar libros completos, informes extensos o codigo fuente de gran tamaño en una sola pasada.
- Asistencia en programacion con contexto amplio: mantener abiertos multiples archivos de un proyecto y generar o refactorizar codigo con conocimiento global del repositorio.
- Procesamiento de imagenes con texto: al ser multimodal, puede describir imagenes, responder preguntas sobre ellas o generar texto a partir de capturas, siempre que se use la version con mmproj.
- Simulacion de conversaciones sin filtros: para entrenar sistemas de deteccion de toxicidad o estudiar dinamicas de dialogo en entornos no moderados.
- Despliegue en entornos offline: al estar en formato GGUF, puede ejecutarse en portatiles o servidores sin conexion a internet, con herramientas como llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas comparativas ni metricas de rendimiento. Se recomienda consultar la documentacion del modelo base Qwen3.8-27B para obtener datos de referencia, aunque estos no estarian directamente transferibles a la version abliterada y cuantizada.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos, sin overhead):
  - i1-Q4_K_M (16,6 GB): requiere al menos 20 GB de VRAM para inferencia con overhead. Cabe en una RTX 4090 (24 GB) o RTX 6000 Ada (48 GB).
  - i1-Q4_K_S (15,7 GB): similar al anterior, recomendable 20-24 GB.
  - i1-Q6_K (22,2 GB): necesita mas de 24 GB, por lo que se requieren GPU como A100 (40 GB), A6000 (48 GB) o H100 (80 GB).
  - i1-IQ3_M (12,7 GB): cabe en GPUs de 16 GB, como RTX 4080 o RTX 3090.
  - i1-IQ2_M (10,1 GB): cabe en GPUs de 12 GB, como RTX 3060 o RTX 4070.
- GPU recomendadas: para cuantizaciones hasta Q4, una RTX 4090 es suficiente. Para Q6 o superior, se necesitan GPU de datacenter.
- Compatibilidad con consumer GPU: si, para cuantizaciones de hasta Q4_K_M (16,6 GB) con 24 GB de VRAM. Las cuantizaciones mas pequeñas (IQ2, IQ3) funcionan en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), text-generation-webui.
- Latencia y throughput: no disponibles. Dependen de la GPU y de la cuantizacion; en una RTX 4090 con Q4_K_M se pueden esperar velocidades de 30-50 tokens/s, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|--------|------------|----------|--------|----------|---------|
| Qwen3.8-27B (original) | ~27 B | 262k | Si | Apache 2.0 | Safetensors |
| Qwen3.8-27B-abliterated (base) | ~27 B | 262k | Si | Apache 2.0 | Safetensors |
| Este modelo (GGUF cuantizado) | ~27 B | 262k | Si (con mmproj) | Apache 2.0 | GGUF |
| Llama 3.1 8B (comparacion de tamano menor) | 8 B | 128k | No | Llama 3.1 | Safetensors/GGUF |

La principal diferencia con el modelo original es la eliminacion de restricciones de seguridad y la cuantizacion a GGUF, que reduce los requisitos de hardware a costa de una ligera perdida de precision. Frente a modelos de tamano similar como Llama 3.1 70B, este modelo ofrece un contexto mas largo y capacidades de vision, aunque con menor numero de parametros.

## Limitaciones y advertencias

- Al estar abliterado, el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtros. No debe desplegarse en entornos de produccion sin supervision humana o sin un sistema de moderacion externo.
- La cuantizacion degrada la calidad respecto al modelo en precision completa; las cuantizaciones mas bajas (IQ1, IQ2) pueden mostrar errores notables en tareas complejas.
- Solo se confirma soporte para ingles. El uso en otros idiomas puede producir resultados de menor calidad.
- La informacion sobre arquitectura, entrenamiento y capacidades exactas proviene de fuentes secundarias; no se ha verificado de forma independiente.
- El modelo base no incluye un archivo mmproj en este repositorio; para usar la modalidad de vision es necesario descargar el archivo correspondiente desde el repositorio estatico.
- No se han publicado benchmarks oficiales para esta version cuantizada, por lo que el rendimiento real puede variar.
- El contexto de 262k es teorico; en la practica, el uso de ventanas tan largas puede requerir mucha memoria y ralentizar la inferencia.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mradermacher/Qwen3.8-27B-3MPER0RR-abliterated-i1-GGUF
- Modelo base (abliterado): https://huggingface.co/3MPER0RR/Qwen3.8-27B-3MPER0RR-abliterated
- Repositorio estatico GGUF (con mmproj si existe): https://huggingface.co/mradermacher/Qwen3.8-27B-3MPER0RR-abliterated-GGUF
- Repositorio oficial de Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Guia de ejecucion local de Qwen3.8 27B: https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html
- Guia de ejecucion con Ollama y GGUF: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
