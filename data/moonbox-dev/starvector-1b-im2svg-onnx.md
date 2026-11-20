# moonbox-dev/starvector-1b-im2svg-ONNX

## Resumen

StarVector 1B ONNX es una conversión a formato ONNX del modelo StarVector 1B (variante image-to-SVG), desarrollada por moonbox-dev para su uso en dispositivos locales mediante ONNX Runtime con backends de CPU, CUDA y DirectML. StarVector es un modelo multimodal especializado en vectorización: recibe una imagen rasterizada (iconos, diagramas, gráficos) y genera el código SVG correspondiente como secuencia de texto. El modelo original lo desarrolla el equipo StarVector y se apoya en StarCoder como base lingüística, según indican las etiquetas del repositorio.

La relevancia de esta conversión radica en que elimina la dependencia de PyTorch y de la pila de Transformers para el despliegue, ofreciendo grafos ONNX separados (image encoder, embed, decoder) junto con un `pipeline.py` que gestiona el preprocesado, el prompt, las posiciones y el bucle de decodificación. Se publican dos precisiones: fp16 (unos 3,1 GB de pesos) e int8 (unos 1,6 GB), lo que permite ejecución en hardware modesto.

El modelo tiene aproximadamente 1.000 millones de parámetros, licencia Apache 2.0 y está pensado para tareas de image-to-text con salida estructurada en SVG. No se dispone de información sobre longitud de contexto, idiomas soportados ni composición del dataset de entrenamiento en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (encoder de imagen + decoder de lenguaje basado en StarCoder), exportado a grafos ONNX separados (`image.onnx`, `embed.onnx`, `decoder.onnx`) |
| Parametros totales | ~1B (según denominación del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 e int8 |
| Idiomas soportados | no disponible (la salida es código SVG, no texto natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos `.onnx` + `.onnx.data`), tokenizer BPE en JSON |
| Tamano del repositorio | 5,6 GB |
| Backends de ejecucion | ONNX Runtime: CPU, CUDA, DirectML |
| Pipeline | image-to-text |

## Arquitectura y entrenamiento

StarVector sigue una arquitectura multimodal compuesta por un encoder visual que proyecta la imagen de entrada a un espacio de embeddings y un decoder autorregresivo de lenguaje que genera la secuencia SVG token a token. La base lingüística es StarCoder, según las etiquetas del repositorio, lo que aporta un vocabulario y tokenizador BPE orientados a código. La exportación a ONNX divide el modelo en tres grafos: `image.onnx` (encoder visual, 594 MB en fp16), `embed.onnx` (proyección de embeddings, 201 MB en fp16) y `decoder.onnx` (decoder de lenguaje, 67 MB más 2,27 GB de datos en fp16).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card de esta conversión no documenta el proceso de entrenamiento del modelo original; únicamente referencia el paper arXiv:2312.11556 como fuente. La innovación técnica destacable de esta publicación es la propia conversión a ONNX con un pipeline en Python que encapsula el bucle de decodificación, permitiendo despliegue sin PyTorch.

## Capacidades

- Vectorización de imágenes a SVG: convierte iconos, diagramas y gráficos rasterizados en código SVG editable.
- Generación de código estructurado: la salida es SVG válido, lo que permite su integración directa en flujos de diseño y web.
- Procesamiento multimodal imagen-texto: combina un encoder visual con un decoder de lenguaje.
- Ejecución en dispositivo: los grafos ONNX permiten inferencia local en CPU, CUDA y DirectML sin dependencias de PyTorch.
- Dos precisiones disponibles (fp16 e int8) para equilibrar calidad y requisitos de memoria.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni capacidades multilingües de texto natural.

## Casos de uso

- Vectorización de iconos en pipelines de diseño: el modelo recibe un PNG o JPG de un icono y devuelve el SVG correspondiente, lo que permite automatizar la conversión de bibliotecas de assets rasterizados a formato vectorial editable.
- Generación de SVG para interfaces web: integrado en un servicio backend con ONNX Runtime, puede transformar capturas de diagramas en código SVG insertable directamente en HTML, reduciendo el peso y permitiendo escalado sin pérdida.
- Digitalización de diagramas técnicos: a partir de imágenes de esquemas o gráficos, el modelo genera una representación vectorial que puede postprocesarse para extraer formas y etiquetas.
- Procesamiento por lotes en servidores sin GPU: la versión int8 (unos 1,6 GB de pesos) permite ejecutar la vectorización en CPU con ONNX Runtime, adecuada para colas de trabajo offline donde la latencia no es crítica.
- Herramientas de escritorio con DirectML: la build ONNX puede integrarse en aplicaciones Windows que usan DirectML para acelerar la inferencia en GPUs de consumo sin CUDA.
- Automatización de conversión de assets en CI/CD: el `pipeline.py` incluido facilita scriptar la conversión de imágenes a SVG como paso de build, verificando la salida con métricas de PSNR.
- Prototipado de investigación en vectorización: al ser ONNX, permite comparar precisiones (fp16 vs int8) y medir el impacto en calidad (PSNR) y tiempo de inferencia de forma reproducible.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son métricas de la propia conversión, medidas sobre un conjunto de 8 iconos:

| Metrica | fp16 (ONNX) | int8 (ONNX) | Original (fp16) |
|---|---|---|---|
| PSNR de renderizado vs icono | 13,9 dB | 14,3 dB | 14,4 dB |
| SVGs identicos al original | 1/8 | 3/8 | referencia |
| Tiempo por icono (CUDA) | 30,9 s | 39,0 s | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos de PSNR y tiempo corresponden a la evaluación interna del autor de la conversión y deben interpretarse con cautela por el tamaño reducido de la muestra (8 iconos).

## Requisitos de hardware

- VRAM estimada para inferencia: la versión fp16 ocupa unos 3,1 GB en pesos (594 MB encoder + 201 MB embed + 2,27 GB decoder + 67 MB grafo), por lo que se recomienda al menos 4-6 GB de VRAM libre. La versión int8 ocupa unos 1,6 GB en pesos, con lo que basta con 2-3 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA (RTX 3060 12 GB, RTX 4090, A100, H100) o con DirectML en Windows. Para CPU, se recomienda un procesador con al menos 8 GB de RAM.
- Cabe en GPU de consumo: sí, tanto fp16 como int8 caben en GPUs consumer con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 4060, GTX 1660).
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML) con el `pipeline.py` incluido. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el modelo no es un LLM de texto general.
- Latencia y throughput: el autor reporta 30,9 s por icono en fp16 y 39,0 s por icono en int8 sobre CUDA. No se proporcionan datos de throughput en CPU ni en DirectML.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| StarVector 1B ONNX (este) | ~1B | no disponible | image-to-SVG | Apache 2.0 | ONNX |
| StarVector 1B (original) | ~1B | no disponible | image-to-SVG | Apache 2.0 | safetensors (PyTorch) |
| VTracer (no neuronal) | no aplica | no aplica | vectorizacion raster-to-SVG | MIT | binario |
| Potrace (no neuronal) | no aplica | no aplica | vectorizacion bitmap-to-vector | GPL | binario |

La comparación con herramientas clásicas de vectorización como VTracer o Potrace es pertinente porque resuelven el mismo problema, aunque con enfoques no neuronales (trazado de contornos) y sin generación de código SVG semántico. No se dispone de datos de benchmarks comparativos entre StarVector y estas herramientas en la información proporcionada.

## Limitaciones y advertencias

- La evaluación publicada se basa en solo 8 iconos, por lo que las métricas de PSNR y similitud de SVG no son estadísticamente representativas.
- El tiempo de inferencia es alto (30-39 s por icono en CUDA), lo que limita su uso en aplicaciones interactivas en tiempo real.
- Solo se publican dos precisiones (fp16 e int8); no hay versión fp32 ni otras cuantizaciones.
- No se documentan los idiomas soportados ni el comportamiento con texto dentro de las imágenes (la métrica de error de caracteres mencionada en la model card no se detalla en los datos disponibles).
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base StarVector y de StarCoder, ya que la conversión hereda posibles restricciones.
- Riesgo de alucinación en la generación de SVG: el modelo puede producir formas o atributos incorrectos, especialmente en imágenes complejas o con ruido.
- No se documenta el comportamiento con imágenes de alta resolución ni con diagramas que contengan texto denso.
- El pipeline incluido es un script Python de 4,8 kB; no se garantiza soporte ni mantenimiento continuo por parte del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/starvector-1b-im2svg-ONNX
- Modelo base: https://huggingface.co/starvector/starvector-1b-im2svg
- Paper de referencia: https://arxiv.org/abs/2312.11556
- Repositorio del modelo original (referenciado en etiquetas): https://github.com/starvector/starvector (no verificado en la información proporcionada)
