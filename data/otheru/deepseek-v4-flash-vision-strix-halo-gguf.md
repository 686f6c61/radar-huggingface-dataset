# otheru/DeepSeek-V4-Flash-Vision-Strix-Halo-GGUF

## Resumen

DeepSeek-V4-Flash-Vision-Strix-Halo-GGUF es una cuantización del modelo multimodal DeepSeek-V4-Flash-Vision-Exp, desarrollada por el usuario otheru. Se trata de un modelo de mezcla de expertos (MoE) con aproximadamente 284 000 millones de parámetros, capaz de procesar imágenes y texto. Esta versión concreta está optimizada para ejecutarse exclusivamente en el APU AMD Strix Halo (gfx1151) mediante el motor de inferencia Ember, y emplea una cuantización afín de 2 bits (ROCmFPx) que reduce el peso efectivo a 2,58 bits por parámetro, permitiendo que el modelo completo, junto con su torre de visión y su modelo de decodificación especulativa, quepa en 128 GB de memoria unificada.

La relevancia de este modelo radica en que demuestra la viabilidad de ejecutar un modelo multimodal de gran tamaño en hardware de consumo (un APU) gracias a una cuantización agresiva y a un motor de inferencia especializado. Además, el autor publica las matrices de importancia utilizadas para la calibración, lo que permite reproducir el proceso y aplicarlo a otras cuantizaciones del mismo modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con visión, basada en transformer |
| Parametros totales | 284 334 579 287 (~284 B) |
| Parametros activos | no disponible (configuración de servicio con top-k 4) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF tipo 107 (ROCmFPx afín 2 bits), token_embd q6_K, attn_output_b q8_0, attn_kv dual-scale ROCmFP4, resto ROCmFP4-fast; efectivo 2,58 BPW |
| Idiomas soportados | no disponible |
| Licencia | deepseek (licencia propia de DeepSeek; ver limitaciones) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4-Flash-Vision-Exp, es un MoE multimodal con una torre de visión y un modelo auxiliar de decodificación especulativa (drafter). La cuantización presentada en este repositorio está calibrada con una matriz de importancia (imatrix) que combina un 75 % de datos de texto y un 25 % de datos de imagen. El corpus de calibración de imagen consta de 1700 registros con 1684 fotografías únicas, procedentes de COCO val2017 y de fotogramas de TextVQA, con prompts de cinco categorías (describir, contar, color, relaciones espaciales y razonamiento). El autor indica que el modelo está "abliterado", es decir, se han eliminado ciertos comportamientos de rechazo. La cuantización utiliza un formato afín ROCmFP2 (tipo GGUF 107) con bloque de 32 valores en 8 bytes de códigos más dos bytes UE4M3, y dequantización `value = code * scale - offset`. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, dataset, método de alineación).

## Capacidades

- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text).
- Generación de texto y razonamiento sobre imágenes: descripción, conteo de objetos, identificación de colores, relaciones espaciales y razonamiento visual.
- Modelo MoE con ruteo por top-k (4 en configuración de servicio) que activa una fracción de los expertos por token.
- Incluye un modelo auxiliar de decodificación especulativa (drafter) para acelerar la generación.
- Está abliterado, lo que implica menor tendencia a rechazar peticiones.
- Compatible con el motor Ember, que soporta la cuantización ROCmFPx específica.

## Casos de uso

- Análisis de imágenes en entornos con hardware limitado: al ejecutarse en un APU Strix Halo sin GPU dedicada, permite aplicaciones de visión por computadora en equipos compactos o de bajo consumo.
- Asistente multimodal local: puede describir fotografías, responder preguntas sobre documentos escaneados o interpretar diagramas directamente en el dispositivo, sin conexión a la nube.
- Investigación en cuantización y calibración: las matrices de importancia publicadas en formato `.dat` permiten a otros investigadores experimentar con cuantizaciones de modelos MoE multimodales a distintos anchos de bit.
- Prototipado de agentes con visión: al combinar comprensión de imagen y texto, puede integrarse en pipelines de agentes que necesiten interpretar capturas de pantalla, mapas o gráficos.
- Educación y demostración técnica: sirve como ejemplo práctico de despliegue de un modelo de 284 B de parámetros en hardware de consumo, útil para talleres, cursos y pruebas de concepto.
- Procesamiento de documentos con imágenes: puede extraer información de facturas, formularios o artículos que contengan figuras, si se le proporciona la imagen y una pregunta concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para esta cuantización.

## Requisitos de hardware

- Requiere un APU AMD Strix Halo (gfx1151) con 128 GB de memoria unificada para alojar el modelo junto con su torre de visión y su drafter.
- Solo es compatible con el motor de inferencia Ember; no funciona con llama.cpp estándar ni con otros runtimes que no soporten el tipo GGUF 107 afín.
- No es compatible con GPUs NVIDIA convencionales: según el artículo de tinycomputers.io, el modelo falla en NVIDIA Tesla P40 a pesar de tener más teraflops en papel.
- El tamaño del repositorio es de 104,7 GB, por lo que se requiere al menos ese espacio en disco para descargar los pesos.
- No se han publicado datos de latencia ni throughput para esta configuración.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. El modelo base sin cuantizar (DeepSeek-V4-Flash-Vision-Exp) está disponible en Hugging Face, pero no se han publicado comparaciones de rendimiento entre la versión cuantizada y la original.

## Limitaciones y advertencias

- Hardware restringido: el modelo solo se ejecuta en AMD Strix Halo con el motor Ember, lo que limita su portabilidad a otros sistemas.
- Cuantización agresiva: el peso efectivo de 2,58 BPW puede degradar notablemente la calidad de las respuestas en comparación con el modelo original.
- Riesgo de interpretación incorrecta: el tipo GGUF 107 no tiene discriminador, y un runtime que lo interprete como un formato de dos escalas producirá resultados incorrectos. El autor incluye un sidecar de procedencia para mitigar este riesgo.
- Modelo experimental: al ser una versión "Exp", no hay garantías de estabilidad ni soporte oficial.
- Licencia deepseek: es necesario revisar los términos de la licencia de DeepSeek para determinar si permite uso comercial y en qué condiciones.
- Cobertura limitada del corpus de calibración: la matriz de importancia se generó únicamente con fotografías (COCO y TextVQA), por lo que el rendimiento en dominios como OCR, capturas de pantalla o imágenes sintéticas puede verse afectado.
- No se han publicado evaluaciones de sesgos, alucinación ni seguridad para esta cuantización.

## Enlaces

- https://huggingface.co/otheru/DeepSeek-V4-Flash-Vision-Strix-Halo-GGUF
- https://github.com/otheru-ai/ember
- https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- https://tinycomputers.io/posts/running-deepseek-v4-flash-on-amd-strix-halo.html
