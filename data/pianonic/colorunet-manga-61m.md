# PianoNic/ColorUNet-Manga-61M

## Resumen

ColorUNet-Manga-61M es un modelo de colorización de páginas de manga en blanco y negro desarrollado por PianoNic. Se trata de una U-Net con encoder ConvNeXt-Tiny inicializado desde `timm/convnext_tiny.fb_in1k`, con 60.989.541 parámetros totales (33,0 M corresponden al colorizador y 28,0 M al codificador de portada). El modelo resuelve un problema muy concreto: añadir color a páginas de cómic y manga preservando de forma exacta el line art, las tramas (screentones) y el texto originales, ya que la red solo predice los canales a/b del espacio Lab y conserva el canal L de la página original.

Su relevancia actual radica en dos factores. Primero, su tamaño reducido (0,6 GB de repositorio, 61 M de parámetros) permite inferencia en el navegador mediante WebGPU con exportaciones ONNX en fp16 y fp32, algo poco habitual en tareas de colorización de imágenes. Segundo, incorpora un mecanismo opcional de consistencia de color entre páginas: un codificador de portada (cover encoder) que genera tokens de referencia para mantener los colores de los personajes estables a lo largo de una serie.

El modelo se distribuye con licencia MIT y se entrenó en tres etapas, la última de ellas con colorizaciones generadas por FLUX.2 [klein] 4B como profesor sobre páginas en blanco y negro de MangaDex. El checkpoint publicado corresponde a la etapa 3c, paso 10.000. No es un modelo de lenguaje: no procesa texto ni tiene capacidades de razonamiento, tool calling o generación de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ConvNeXt-Tiny (inicializado desde `timm/convnext_tiny.fb_in1k`), más codificador de portada opcional |
| Parametros totales | 60.989.541 (33,0 M colorizador + 28,0 M codificador de portada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión image-to-image); entrada de 768 px de lado largo, rellenada a múltiplo de 32 |
| Tipos de cuantizacion | Exportaciones ONNX en fp16 y fp32; pesos PyTorch en safetensors (precisión nativa no especificada en la información disponible) |
| Idiomas soportados | no disponible (no procesa texto; el texto de la página se preserva píxel a píxel) |
| Licencia | MIT (encoder inicial Apache-2.0) |
| Formato de pesos | safetensors (`model.safetensors`, `config.json`), ONNX (`colorizer-fp16.onnx`, `colorizer-fp32.onnx`, `ref-encoder-fp16.onnx`, `colorizer-ref-fp16.onnx`, `null-tokens.bin`) |

## Arquitectura y entrenamiento

La arquitectura es una U-Net cuyo encoder es un ConvNeXt-Tiny preentrenado en ImageNet-1k (`timm/convnext_tiny.fb_in1k`). El modelo opera en el espacio de color Lab: recibe la página en blanco y negro y predice únicamente los canales a/b, que después se reescalan de forma edge-aware a la resolución completa y se combinan con el canal L original de la página. Este diseño garantiza que el line art, las tramas y el texto permanezcan píxel-exactos. La variante con referencia añade un codificador de portada que produce tokens de color de la serie, inyectados en el colorizador para mantener la consistencia cromática entre páginas.

El entrenamiento se realizó en tres etapas de fine-tuning escalonado. La etapa 1 usó cómics de dominio público de Wikimedia Commons y clipart CC0 de Openclipart. La etapa 2 empleó 13.926 páginas a color de MangaDex (1.614 series) con aumento de datos sobre papel blanco. La etapa 3 usó colorizaciones profesor generadas por FLUX.2 [klein] 4B sobre 6.663 pares de páginas en blanco y negro de 63 series de MangaDex, con la portada de la serie como referencia; esta etapa introduce el codificador de portada. El checkpoint publicado corresponde a la etapa 3c, paso 10.000. La pérdida L1 de validación sobre a/b en las páginas de la etapa 3 es de 3,67 sin pistas de color. No se documenta uso de RLHF ni DPO, algo esperable en un modelo de visión.

## Capacidades

- Colorización image-to-image de páginas de manga y cómic en blanco y negro en una sola pasada.
- Preservación píxel-exacta del line art, los screentones y el texto: la red no modifica el canal de luminancia.
- Soporte opcional de pistas de color (color hints) para corregir o fijar tonalidades concretas.
- Consistencia de color entre páginas de una misma serie mediante el codificador de portada (cover encoder) y tokens de referencia.
- Inferencia en navegador vía WebGPU con las exportaciones ONNX incluidas.
- Exportación ONNX con el merge Lab integrado en el propio grafo (`colorizer-fp16.onnx` / `colorizer-fp32.onnx`).
- No soporta tool calling, agentes, razonamiento multi-paso, ni procesamiento de lenguaje natural.

## Casos de uso

- Escaneo y digitalización de manga clásico: el modelo colorea páginas en blanco y negro de obras de dominio público (por ejemplo, cómics de los años 50) manteniendo intactos el entintado y las tramas, lo que resulta adecuado para ediciones restauradas o divulgativas.
- Traducción y scanlation: al preservar el texto píxel-exacto, se puede colorear una página antes o después de insertar los bocadillos traducidos sin que la tipografía se degrade ni se recoloree.
- Publicación web y lectura en navegador: las exportaciones ONNX en fp16 permiten integrar la colorización en un lector web con WebGPU, sin backend de GPU dedicado ni subida de imágenes a un servidor.
- Consistencia de personajes en series largas: usando la portada como referencia, el codificador de portada fija la paleta de cada personaje a lo largo de capítulos, lo que reduce la deriva de color entre páginas.
- Previsualización rápida para editores y autores: colorización en una sola pasada y de bajo coste computacional para evaluar variantes cromáticas antes de un coloreado manual definitivo.
- Ajuste fino con pistas de color: un colorista puede aportar hints en zonas clave (piel, pelo, ropa) para corregir las debilidades conocidas del modelo en tonos claros y fondos.
- Procesado por lotes en pipelines de CI o scripts: al ser un modelo pequeño (61 M de parámetros) y con pesos safetensors, se puede ejecutar en CPU o GPU modesta dentro de flujos automatizados de preprocesado de archivos.

## Benchmarks y rendimiento

El autor solo publica una métrica de validación interna: L1 sobre los canales a/b en el conjunto retenido de la etapa 3, con un valor de 3,67 sin pistas de color. No se han publicado resultados de benchmarks estándar (PSNR, SSIM, FID) ni comparaciones con otros modelos de colorización en la información disponible.

| Metrica | Valor | Condiciones |
|---|---|---|
| Lab a/b L1 (held-out, etapa 3) | 3,67 | Sin pistas de color |
| MMLU, HumanEval, GSM8K | no disponible | No aplica (modelo de visión) |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 61 M de parámetros en fp16 los pesos ocupan aproximadamente 122 MB, y en fp32 unos 244 MB. El consumo real depende sobre todo de la resolución de la página de entrada (768 px de lado largo, rellenada a múltiplo de 32).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o una RTX 3060 ejecutan la inferencia sin problemas.
- Cabe en GPU consumer: sí, en cualquier GPU con soporte CUDA y también en CPU para procesado por lotes.
- Despliegue: PyTorch con el script `scripts/infer.py` del repositorio de GitHub; ONNX Runtime para las exportaciones; WebGPU en navegador con los grafos ONNX incluidos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. El autor describe la inferencia como "single-pass" y apta para navegador, pero no publica cifras de latencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas por el autor frente a otros modelos de colorización de manga. La siguiente tabla recoge solo lo que se conoce de este modelo; las alternativas se indican como no disponibles al no haberse proporcionado información verificable sobre ellas.

| Modelo | Parametros | Enfoque | Licencia | Inferencia en navegador | Datos de rendimiento |
|---|---|---|---|---|---|
| ColorUNet-Manga-61M | 61 M | U-Net ConvNeXt-Tiny, espacio Lab, cover encoder opcional | MIT | Sí (ONNX + WebGPU) | L1 a/b = 3,67 (held-out) |
| Alternativas de colorización de manga | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Piel y cabello claro que en el original son papel en blanco salen más pálidos que en las ediciones oficiales a color.
- Los fondos suelen recibir color débil o irregular; sin portada ni pistas, los colores pueden derivar entre páginas.
- Las zonas con screentone reciben color atenuado.
- El entrenamiento en las etapas 2 y 3 usó páginas de manga con derechos de autor que no se redistribuyen con el modelo; la legalidad de entrenar con ellas depende de la jurisdicción y debe verificarse antes de un uso comercial.
- El modelo no procesa texto ni lenguaje: no debe evaluarse como un LLM ni usarse para tareas de generación textual.
- No hay métricas publicadas de fidelidad perceptual (FID, SSIM) ni comparaciones con otros colorizadores, por lo que la calidad relativa frente a alternativas no está cuantificada.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria todavía inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PianoNic/ColorUNet-Manga-61M
- Repositorio de código, entrenamiento y exportación: https://github.com/PianoNic/ColorUNet-Manga
- Documentación de datasets y licencias: https://github.com/PianoNic/ColorUNet-Manga/blob/main/training/DATASETS.md
- Modelo base del encoder: https://huggingface.co/timm/convnext_tiny.fb_in1k
- Modelo profesor usado en la etapa 3: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
