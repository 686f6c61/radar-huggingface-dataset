# mradermacher/Video-Coder-9B-GGUF

## Resumen

Video-Coder-9B-GGUF es la versión cuantizada en formato GGUF del modelo Video-Coder/Video-Coder-9B, publicada por mradermacher, un conocido creador de cuantizaciones para la comunidad de inferencia local. El modelo original es un modelo multimodal (texto e imagen/vídeo) orientado a tareas de generación de código, con 8.953.803.264 parámetros (aproximadamente 9B) y licencia Apache 2.0. Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

La ficha se centra en la cuantización GGUF, que incluye tanto los pesos del modelo de lenguaje en distintos niveles de cuantización (desde Q2_K hasta f16) como los ficheros mmproj necesarios para el procesamiento multimodal (proyector visión-lenguaje). El repositorio ocupa 83,0 GB en total, aunque cada cuantización individual es mucho más pequeña (desde 3,9 GB en Q2_K hasta 18,0 GB en f16).

La relevancia de esta publicación radica en que acerca un modelo de código multimodal de 9B a entornos sin GPU de datacenter, manteniendo la licencia permisiva Apache 2.0 del modelo base. No obstante, la información pública disponible sobre el modelo original (arquitectura exacta, datos de entrenamiento, benchmarks) es muy limitada, por lo que muchos apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal texto-imagen/vídeo; arquitectura exacta no especificada) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con ficheros mmproj para el componente multimodal) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Video-Coder/Video-Coder-9B en la documentación proporcionada. Por el nombre y los ficheros mmproj incluidos en la cuantización, se trata de un modelo multimodal que combina un modelo de lenguaje de ~9B parámetros con un proyector visión-lenguaje (mmproj) para procesar imágenes o vídeo. La presencia de ficheros mmproj confirma que el pipeline multimodal se mantiene en la versión GGUF.

Tampoco se han publicado en la información disponible datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. La model card del repositorio GGUF se limita a describir el proceso de cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) y a listar los ficheros generados. No se han generado cuantizaciones con imatrix (weighted) para este modelo según indica el autor.

## Capacidades

- Generación de texto y código: el modelo está orientado a tareas de programación, aunque no se detallan lenguajes ni benchmarks concretos.
- Procesamiento multimodal: los ficheros mmproj permiten entrada de imagen/vídeo junto con texto, lo que habilita tareas de código asistido por capturas, diagramas o contenido visual.
- Conversación multi-turno: el tag `conversational` indica soporte de diálogo.
- Idiomas: únicamente inglés según la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia de código en local: ejecutar la cuantización Q4_K_M (5,7 GB) con llama.cpp u Ollama en una GPU de consumo para autocompletado y generación de código sin depender de la nube.
- Análisis de capturas de pantalla o diagramas: gracias a los ficheros mmproj, el modelo puede recibir una imagen (por ejemplo, un error en pantalla o un diagrama de arquitectura) y generar código o explicaciones a partir de ella.
- Prototipado de herramientas de desarrollo con entrada visual: integrar el modelo en un IDE o editor que permita adjuntar imágenes de referencia y obtener snippets de código.
- Despliegue en entornos con recursos limitados: la cuantización Q2_K (3,9 GB) permite ejecutar el modelo en equipos con poca VRAM o incluso en CPU, a costa de calidad.
- Experimentación e investigación: al ser Apache 2.0, sirve para estudiar el comportamiento de modelos multimodales de código en entornos controlados y sin restricciones de uso comercial.
- Generación de documentación técnica a partir de diagramas: el modelo puede describir o comentar imágenes técnicas y producir texto asociado.
- Servicio de inferencia ligero: usar Q8_0 (9,6 GB) o f16 (18,0 GB) en servidores con una sola GPU para obtener la máxima calidad de esta cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,9 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~4,4–5,0 GB
  - IQ4_XS: ~5,3 GB
  - Q4_K_S / Q4_K_M: ~5,5–5,7 GB
  - Q5_K_S / Q5_K_M: ~6,4–6,6 GB
  - Q6_K: ~7,5 GB
  - Q8_0: ~9,6 GB
  - f16: ~18,0 GB
  - mmproj adicional: ~0,7 GB (Q8_0) o ~1,0 GB (f16)
- GPU recomendadas: para Q4_K_M y Q5, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; para Q8_0, una RTX 4080/4090 (16–24 GB); para f16, una RTX 4090 (24 GB) o A100/H100.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q6_K en GPUs de 8–12 GB; Q8_0 requiere 12–16 GB; f16 requiere 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). Para el componente multimodal se requiere un runtime que soporte mmproj (llama.cpp con soporte de visión).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la cuantización y del hardware.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables en la documentación proporcionada (mismo tamaño, misma tarea multimodal de código) para establecer una comparativa rigurosa con parámetros, contexto y rendimiento verificables. Se indica, por tanto, como no disponible.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés; el rendimiento en castellano no está garantizado.
- Contexto: se desconoce la longitud máxima de contexto; conviene verificarla antes de usarlo en tareas de contexto largo.
- Calidad de cuantizaciones bajas: Q2_K y Q3_K_S degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix: el autor indica que no hay cuantizaciones ponderadas (imatrix) para este modelo, lo que puede afectar a la calidad frente a alternativas con imatrix.
- Información del modelo base escasa: no hay benchmarks ni detalles de entrenamiento publicados, lo que dificulta evaluar su calidad real frente a alternativas.
- Riesgo de alucinación: inherente a los modelos generativos; especialmente relevante en generación de código y descripción de imágenes.
- Sesgos: no documentados en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Video-Coder/Video-Coder-9B por si hubiera condiciones adicionales no reflejadas aquí.
- Componente multimodal: requiere ficheros mmproj y un runtime compatible; no todos los frontends GGUF soportan visión.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Video-Coder-9B-GGUF
- Modelo base: https://huggingface.co/Video-Coder/Video-Coder-9B
- Página de descargas del autor: https://hf.tst.eu/model#Video-Coder-9B-GGUF
- Repositorio relacionado (SFT): https://huggingface.co/mradermacher/Video-Coder-SFT-9B-GGUF
- Perfil del autor: https://huggingface.co/mradermacher/models
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
