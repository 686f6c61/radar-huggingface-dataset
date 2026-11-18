# LiquidAI/LFM3-VL-2B-GGUF

## Resumen

LFM3-VL-2B-GGUF es la versión cuantizada en formato GGUF de LFM3-VL-2B, un modelo multimodal (image-text-to-text) desarrollado por Liquid AI dentro de su familia LFM3. El modelo resuelve la necesidad de ejecutar inferencia visión-lenguaje en hardware modesto: CPUs y GPUs de consumo, sin depender de infraestructura en la nube. La versión GGUF está pensada para su uso con llama.cpp y los runners que lo integran (Llama.app, LM Studio, Ollama).

El modelo base cuenta con aproximadamente 1.728 millones de parámetros (1,73B) según los pesos en safetensors, lo que lo sitúa en la categoría de modelos pequeños capaces de correr localmente con requisitos de memoria reducidos. Soporta 16 idiomas, entre ellos el castellano, y combina entrada de imagen con generación de texto conversacional.

Su relevancia actual radica en la combinación de multimodalidad, multilingüismo amplio y despliegue local: permite prototipar aplicaciones de visión-lenguaje en portátiles y estaciones de trabajo sin GPU dedicada de gama alta, con una licencia propia (lfm1.0) que conviene revisar antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; detalles en la model card del modelo base) |
| Parámetros totales | 1.728.801.600 (≈1,73B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF en varios niveles (el repositorio incluye además NVFP4 y QAD Q4_0); niveles concretos disponibles no detallados en la información proporcionada |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | GGUF (repo de 15,9 GB); modelo base en safetensors y variante NVFP4 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base LFM3-VL-2B; la model card de la versión GGUF remite explícitamente a la model card original para los detalles de arquitectura y uso. Por los tags y el pipeline, se trata de un modelo multimodal que procesa imagen y texto como entrada y genera texto, con un codificador visual separado: el repositorio GGUF incluye ficheros `mmproj` para el proyector multimodal, y en la variante NVFP4 el codificador visual se mantiene sin cuantizar mientras los pesos feed-forward del modelo de lenguaje conservan NVFP4 y el resto pasa a Q8_0.

No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni si hubo etapas de RLHF o DPO. La variante NVFP4 se generó con NVIDIA Model Optimizer, y los pesos NVFP4 se ejecutan en tensor cores FP4 en GPUs NVIDIA Blackwell (RTX 50 series, DGX Spark). El soporte de NVFP4 en llama.cpp requiere la build b12088 o superior (PR #31608); builds anteriores cargan el fichero pero producen salidas incorrectas.

## Capacidades

- Generación de texto conversacional multi-turno a partir de entradas de imagen y texto (pipeline image-text-to-text).
- Comprensión de imágenes: descripción, respuesta a preguntas sobre el contenido visual e interacción combinada imagen-texto.
- Capacidades multilingües en 16 idiomas, incluido el castellano, además de inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Entrada de vídeo en Llama.app según la model card (la entrada de imagen es la soportada en LM Studio y Ollama).
- Ejecución local en CPU y GPU mediante llama.cpp y runners compatibles.
- Soporte de tool calling, function calling, modo thinking o razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Descripción y etiquetado automático de imágenes en local: el modelo puede generar descripciones en castellano de imágenes almacenadas en disco sin enviar datos a servicios externos, útil para catalogar fotos o activos digitales en entornos con requisitos de privacidad.
- Asistencia a personas con discapacidad visual: integrado en una aplicación de escritorio o móvil vía llama.cpp, puede describir escenas capturadas por la cámara en tiempo real, con la ventaja de que el procesamiento ocurre en el dispositivo.
- Extracción de información de documentos escaneados: dado que acepta imagen y texto, puede responder preguntas sobre facturas, formularios o capturas, integrándose en flujos de digitalización de pequeñas oficinas sin infraestructura cloud.
- Prototipado rápido de aplicaciones visión-lenguaje: con Ollama o LM Studio basta un comando o una instalación gráfica para tener el modelo operativo, lo que acelera la validación de ideas antes de invertir en modelos mayores.
- Moderación y análisis de contenido visual en local: clasificación y descripción de imágenes en pipelines internos donde no se permite subir contenido a terceros.
- Soporte multilingüe en atención al cliente con imágenes: un usuario puede enviar una captura de pantalla de un error y el modelo responder en su idioma (castellano, francés, alemán, etc.), desplegado en servidores propios con llama.cpp.
- Inferencia en hardware de gama de consumo para demos y ferias: al ser un modelo de 1,73B en GGUF, cabe en equipos portátiles, lo que permite demostraciones offline sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 1,73B parámetros, las cuantizaciones GGUF de 4 bits ocupan del orden de 1-1,5 GB de pesos, y las de 8 bits alrededor de 2 GB, a lo que hay que sumar el proyector multimodal (`mmproj`) y el contexto. Estas cifras son estimaciones por tamaño, no datos publicados en la información proporcionada.
- GPU recomendadas: no se especifican en la información disponible. La variante NVFP4 está pensada para GPUs NVIDIA Blackwell (RTX 50 series, DGX Spark), donde las capas NVFP4 se ejecutan en tensor cores FP4.
- Cabe en GPU de consumo: sí, por tamaño (1,73B parámetros); los modelos concretos no se detallan en la información disponible.
- Opciones de despliegue: llama.cpp (`llama-mtmd-cli`), Llama.app (macOS y Windows, requiere llama.cpp v0.8.0 o superior), LM Studio (motor llama.cpp 2.65.1 o superior), Ollama (`ollama run lfm3-vl`, versión v0.40.12 o superior, macOS). La variante NVFP4 requiere llama.cpp b12088 o superior.
- Latencia y throughput: no disponible.

Parámetros de muestreo recomendados por el autor: temperatura 0.1, top_k 50, top_p 1.0, min_p 0.0, repeat penalty 1.1.

## Comparativa con modelos similares

No disponible: la información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa. Como referencia de categoría, el propio modelo base LFM3-VL-2B (safetensors) y su variante NVFP4 (LiquidAI/LFM3-VL-2B-NVFP4) son las alternativas directas dentro de la misma familia, con la diferencia de formato y cuantización.

## Limitaciones y advertencias

- Licencia lfm1.0 (license: other): es una licencia propia de Liquid AI, no una licencia open source estándar; es imprescindible revisar el fichero LICENSE del repositorio antes de cualquier uso comercial.
- Riesgo de alucinación: no hay datos publicados en la información disponible sobre tasas de alucinación; como todo modelo generativo, puede producir descripciones inexactas de imágenes.
- Contexto: la longitud de contexto no está especificada en la información proporcionada, lo que impide garantizar conversaciones o documentos largos.
- Idiomas: aunque soporta 16 idiomas, no se detalla el nivel de calidad por idioma; el rendimiento en castellano no está cuantificado.
- Variante NVFP4: en builds de llama.cpp anteriores a b12088 el fichero carga pero produce salidas incorrectas; hay que fijar la versión mínima en producción.
- Soporte por runner: la entrada de vídeo solo se indica para Llama.app; LM Studio y Ollama se documentan con entrada de imagen.
- No se han publicado benchmarks en la información disponible, por lo que no se puede avalar su rendimiento frente a alternativas con datos numéricos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Variante NVFP4: https://huggingface.co/LiquidAI/LFM3-VL-2B-NVFP4
- Fichero NVFP4 GGUF: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF/blob/main/LFM3-VL-2B-NVFP4.gguf
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola/API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp b12088: https://github.com/ggml-org/llama.cpp/releases/tag/b12088
- PR de soporte NVFP4 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31608
- Release de llama.cpp v0.8.0: https://github.com/ggml-org/llama.cpp/releases/tag/v0.8.0
- Llama.app: https://llama.app
- LM Studio: https://lmstudio.ai
- Ollama: https://ollama.com
- Release de Ollama v0.40.12: https://github.com/ollama/ollama/releases/tag/v0.40.12
