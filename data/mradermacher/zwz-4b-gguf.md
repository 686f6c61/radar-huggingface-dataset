# mradermacher/ZwZ-4B-GGUF

## Resumen

ZwZ-4B-GGUF es la versión cuantizada en formato GGUF del modelo multimodal ZwZ-4B, desarrollado originalmente por inclusionAI y convertido a GGUF por mradermacher. El modelo base es un transformer multimodal de 4.411.424.256 parámetros (aproximadamente 4,4 mil millones) que combina procesamiento de lenguaje con visión, tal y como evidencia la presencia de ficheros `mmproj` (proyección multimodal) en el repositorio y el uso del dataset ZoomBench, orientado a tareas de percepción visual y razonamiento sobre imágenes.

La relevancia de esta ficha radica en que ofrece el modelo en múltiples niveles de cuantización (desde Q2_K de 1,9 GB hasta f16 de 8,9 GB), lo que permite desplegarlo en hardware de consumo con llama.cpp u Ollama, algo imposible con los pesos originales en precisión completa. El modelo está pensado para tareas de visión-lenguaje, incluyendo comprensión de imágenes, respuesta a preguntas visuales (VQA) y razonamiento visual multi-paso, según se desprende de los datasets de entrenamiento y ajuste (ZoomBench y ZwZ-RL-VQA).

La licencia Apache 2.0 facilita su uso comercial y su integración en productos, aunque la información pública disponible sobre arquitectura interna, contexto máximo y proceso de entrenamiento es limitada. Esta ficha recoge exclusivamente los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje), detalles internos no disponibles |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 para la torre visual |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (original en safetensors en inclusionAI/ZwZ-4B) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de aproximadamente 4,4 mil millones de parámetros que integra un codificador visual con un modelo de lenguaje mediante un proyector multimodal (los ficheros `mmproj` del repositorio GGUF confirman esta arquitectura). Los detalles concretos sobre el número de capas, dimensión oculta, tipo de atención o el codificador visual empleado no se han publicado en la información disponible.

En cuanto al entrenamiento, los datasets declarados son inclusionAI/ZoomBench, orientado a evaluación y entrenamiento en percepción y razonamiento visual, e inclusionAI/ZwZ-RL-VQA, que sugiere una fase de ajuste mediante aprendizaje por refuerzo sobre tareas de respuesta visual a preguntas. No se especifica el número de tokens de entrenamiento, la composición exacta del corpus, ni si se aplicaron técnicas de RLHF o DPO más allá de lo que indica el nombre del dataset de RL. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal.

## Capacidades

- Comprensión de imágenes y razonamiento visual: el modelo incorpora proyección multimodal, por lo que puede procesar entradas de imagen junto con texto.
- Respuesta visual a preguntas (VQA): entrenado explícitamente sobre ZwZ-RL-VQA, lo que indica capacidad para responder preguntas sobre el contenido de imágenes.
- Razonamiento visual multi-paso: el uso de ZoomBench sugiere entrenamiento en tareas de percepción detallada y razonamiento sobre regiones de la imagen.
- Generación de texto conversacional: el tag `conversational` y el pipeline de transformers indican uso en diálogo multi-turno.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el razonamiento visual multi-paso es plausible por el dataset, pero no se confirma para agentes de texto.
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia a personas con discapacidad visual: el modelo puede describir el contenido de una imagen capturada por la cámara del móvil y responder preguntas sobre ella, gracias a su torre visual y a su entrenamiento en VQA.
- Moderación de contenido visual en plataformas: clasificación y descripción automática de imágenes subidas por usuarios para detectar contenido inapropiado, usando la cuantización Q4_K_M (2,8 GB) en servidores con GPU modesta.
- Extracción de información de documentos escaneados: lectura de facturas, tickets o formularios combinando OCR implícito con razonamiento visual, desplegable en local con llama.cpp para cumplir requisitos de privacidad.
- Análisis de imágenes médicas o técnicas de apoyo: generación de descripciones preliminares de radiografías o capturas de pantalla de sistemas para triaje, siempre con supervisión humana y sin sustituir el diagnóstico profesional.
- Automatización de QA visual en comercio electrónico: verificación de que las fotos de producto cumplen los requisitos de catálogo (fondo, encuadre, presencia del producto) mediante preguntas dirigidas al modelo.
- Prototipado rápido en investigación: al caber en una GPU de consumo con cuantización Q4_K_S (2,7 GB), permite experimentar con pipelines visión-lenguaje sin infraestructura dedicada, integrándolo en notebooks con llama-cpp-python.
- Educación interactiva: tutor que responde preguntas sobre diagramas, gráficos o figuras de libros de texto, aprovechando la capacidad de razonamiento visual sobre regiones concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~1,9 GB
  - Q3_K_M: ~2,3 GB
  - Q4_K_S / Q4_K_M: ~2,7-2,8 GB
  - Q5_K_M: ~3,3 GB
  - Q6_K: ~3,7 GB
  - Q8_0: ~4,8 GB
  - f16: ~8,9 GB
  - Añadir ~0,6-0,9 GB adicionales si se carga la torre visual (mmproj).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4 con margen para el contexto; RTX 3060, RTX 4060, RTX 4070, RTX 4090, A10, L4, A100 y H100 son válidas. Para f16 se recomienda al menos 12-16 GB de VRAM.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 8 GB o más usando Q4_K_M o inferiores. También puede ejecutarse en CPU con llama.cpp, aunque con latencia mayor.
- Opciones de despliegue: llama.cpp, Ollama (previa conversión o importación del GGUF), llama-cpp-python, y servidores compatibles con el formato GGUF. El repositorio indica `endpoints_compatible`, lo que sugiere compatibilidad con endpoints tipo OpenAI a través de herramientas de inferencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZwZ-4B (este) | ~4,4 B | no disponible | Visión + texto | Apache 2.0 | GGUF y safetensors |
| Qwen2.5-VL-3B | ~3,75 B | 32k (según documentación pública de Qwen) | Visión + texto | Apache 2.0 (variantes) | safetensors, GGUF de terceros |
| Phi-3.5-vision | ~4,2 B | 128k (según documentación pública de Microsoft) | Visión + texto | MIT | safetensors, GGUF de terceros |
| MiniCPM-V 2.6 | ~8 B | 32k (según documentación pública) | Visión + texto | Apache 2.0 con restricciones | safetensors, GGUF de terceros |

Nota: los datos de contexto y licencia de los modelos comparables provienen de documentación pública general y pueden variar según la versión; se incluyen solo como referencia orientativa. No se dispone de benchmarks comparativos verificados para ZwZ-4B.

## Limitaciones y advertencias

- Idiomas: el modelo declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar aplicaciones con documentos o conversaciones largas sin pruebas empíricas.
- Alucinación: como todo modelo de visión-lenguaje de tamaño medio, puede inventar detalles no presentes en la imagen, especialmente en cuantizaciones agresivas (Q2_K, Q3_K_S).
- Cuantización: las versiones Q2_K y Q3_K_S degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior, y Q6_K si la VRAM lo permite.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse principalmente con datos en inglés, puede reflejar sesgos culturales y demográficos de esos corpus.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base original (inclusionAI/ZwZ-4B) y de los datasets empleados, ya que pueden tener restricciones adicionales no reflejadas en el GGUF.
- Soporte: el repositorio tiene muy pocas descargas y likes (98 y 1 en el momento de la consulta), lo que indica escasa validación comunitaria; no hay informes públicos de calidad en producción.
- Documentación: la model card del GGUF es genérica de mradermacher y no aporta detalles sobre el modelo base; se recomienda consultar la ficha de inclusionAI/ZwZ-4B para información adicional.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ZwZ-4B-GGUF
- Modelo base: https://huggingface.co/inclusionAI/ZwZ-4B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/ZwZ-4B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#ZwZ-4B-GGUF
- Dataset ZoomBench: https://huggingface.co/datasets/inclusionAI/ZoomBench
- Dataset ZwZ-RL-VQA: https://huggingface.co/datasets/inclusionAI/ZwZ-RL-VQA
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
