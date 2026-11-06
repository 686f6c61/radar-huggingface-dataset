# Netra-Lab/Netra-OCR

## Resumen

Netra OCR es un conjunto de modelos para reconocimiento óptico de caracteres (OCR) y análisis de documentos, desarrollado por Netra Lab y publicado en Hugging Face bajo el identificador `Netra-Lab/Netra-OCR`. El paquete agrupa cuatro modelos exportados a ONNX: un reconocedor de líneas de texto para jemer (khmer) e inglés, una variante del mismo reconocedor con cabecera de propuesta blockwise, un detector de líneas de texto y logotipos basado en YOLO, y un analizador de layout de página basado en DocLayout-YOLO. El objetivo es cubrir el pipeline completo de digitalización de documentos en jemer, un idioma con escasa cobertura en herramientas OCR convencionales.

La relevancia del proyecto reside en su enfoque de despliegue: los grafos ONNX se ejecutan tanto en CPU y CUDA mediante ONNX Runtime como en el navegador mediante WebGPU y WebAssembly, sin dependencia de PyTorch en tiempo de inferencia. El reconocedor tiene 19 millones de parámetros y el pipeline completo de página descarga aproximadamente 118 MB en CPU. La librería `netra-ocr` (disponible en PyPI) y la aplicación web acompañan a los pesos.

La licencia es mixta (`other` / `mixed`), con condiciones detalladas en la sección de licencia y atribución del repositorio. Los idiomas soportados declarados son jemer (`km`) e inglés (`en`). El repositorio ocupa 0,6 GB e incluye pesos PyTorch para fine-tuning además de los grafos ONNX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Reconocedor encoder-decoder autorregresivo con caché KV; detectores YOLO (líneas/logos) y DocLayout-YOLO (layout) |
| Parámetros totales | 19 M (reconocedor); no disponible para detectores |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa líneas de texto y páginas completas, sin contexto de tokens declarado) |
| Tipos de cuantización | Almacenamiento en fp16 con conversión a fp32 al cargar (reconocedores y layout); fp16 nativo en CUDA para detectores; sin cuantización int8/int4 documentada |
| Idiomas soportados | jemer (`km`), inglés (`en`) |
| Licencia | mixta (`other` / `mixed`), ver enlace de licencia y atribución |
| Formato de pesos | ONNX (opset 18) y PyTorch (`.pth`) para fine-tuning |

## Arquitectura y entrenamiento

El reconocedor es un modelo encoder-decoder autorregresivo con decodificación greedy y caché KV, con 19 M de parámetros y un vocabulario basado en clústeres (`char2idx_cluster.json`). La variante `recognition-blockwise` añade una cabecera de propuesta blockwise que produce la misma salida con menos pasadas del decodificador (2,32 tokens por pasada), aunque en las mediciones publicadas no resulta más rápida que el decodificador greedy con caché KV en CPU, CUDA ni WebGPU. Los detectores son modelos YOLO: uno para líneas de texto y logotipos, y otro basado en DocLayout-YOLO entrenado sobre DocStructBench para análisis de layout de página.

Los grafos ONNX se exportan en opset 18 con nombres `encoder`/`decoder_step` para reconocimiento y `model` para detección. Los pesos de reconocedores y layout se almacenan en media precisión y se convierten a float32 al cargar, manteniendo la velocidad de ejecución en float32. El detector de líneas permanece en float32 porque el almacenamiento en media precisión desplazaba cajas en 2 de 10 páginas de prueba. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento de texto en líneas de jemer e inglés con decodificación autorregresiva y caché KV.
- Detección de líneas de texto y logotipos en imágenes de página.
- Análisis de layout de página (DocLayout-YOLO sobre DocStructBench) para identificar regiones documentales.
- Pipeline completo de página: detección, layout, orden de lectura y exportación a Word, HTML y Markdown mediante `netra_ocr.KhmerOCRPipeline`.
- Ejecución en CPU y CUDA con ONNX Runtime, y en navegador con WebGPU y WebAssembly.
- Fine-tuning sobre líneas de texto propias a partir de los checkpoints PyTorch incluidos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Digitalización de documentos en jemer: el pipeline `KhmerOCRPipeline` procesa páginas completas (detección, layout, orden de lectura) y exporta a Word, HTML o Markdown, adecuado para archivos y bibliotecas con corpus en jemer.
- Procesamiento OCR en el navegador: la carpeta `web/` ejecuta los mismos grafos ONNX con WebGPU/WebAssembly, lo que permite ofrecer OCR sin backend ni instalación de PyTorch, útil para aplicaciones de escritorio o extensiones web.
- Extracción de texto en pipelines de servidor con CPU: el reconocedor tarda unos 13 ms por línea en CPU (i7-13700KF) y el pipeline completo 1,14 s por página, suficiente para lotes moderados sin GPU.
- Aceleración con GPU en producción: con CUDA, el pipeline baja a 0,70 s por página y los detectores usan fp16 por defecto (DocLayout de 65 a 39 ms), lo que permite mayor throughput en servidores con RTX 3060 o superiores.
- Fine-tuning para dominios específicos: los checkpoints PyTorch (`khmerocr_cluster_ar.pth`, `khmerocr_cluster_blockwise.pth`) permiten reentrenar el reconocedor sobre líneas propias con `training/finetune.sh` y reexportar a ONNX con `training/export.sh`.
- Análisis de layout previo a OCR: el modelo `layout/` identifica regiones de página para ordenar la lectura antes del reconocimiento, útil en documentos con columnas, tablas o mezclas de texto e imágenes.
- Detección de logotipos y líneas: el detector `lines/` localiza líneas de texto y logotipos con etiquetas y puntuaciones, aplicable a tareas de indexación visual o verificación de maquetación.

## Benchmarks y rendimiento

Los datos publicados comparan los grafos ONNX con los modelos PyTorch originales sobre `test_set/khob_eval` (325 líneas) y 10 páginas de prueba, en un i7-13700KF y una RTX 3060. No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo OCR.

| Métrica | CPU | CUDA |
|---|---|---|
| Reconocedor, paridad de texto con PyTorch | 325/325 líneas idénticas | 325/325 líneas idénticas |
| Reconocedor, latencia por línea | 36,7 → ~13 ms | 23 → 12,8 ms |
| Pipeline completo de página | 2,18 → 1,14 s/página | 1,24 → 0,70 s/página |
| Paridad de pipeline con PyTorch | 7/10 páginas idénticas, 0,43 % de caracteres distintos | no disponible |
| DocLayout con fp16 | no aplica | 65 → 39 ms |
| Navegador WebAssembly | 325/325 líneas idénticas, cajas a IoU 1,0 | no aplica |
| Navegador WebGPU (Chrome) | no aplica | 100/100 líneas idénticas |
| Blockwise vs. greedy con KV | 82 vs 85 ms por línea (Chrome) | no más rápido |

El CER del reconocedor es el del modelo PyTorch original; los resultados se remiten a `docs/RESULTS.md` del repositorio de GitHub.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el reconocedor tiene 19 M de parámetros y los detectores son ligeros (38-39 MB), por lo que caben holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX 3060 como referencia de las mediciones publicadas; cualquier GPU con soporte CUDA para ONNX Runtime es suficiente.
- Cabe en GPU consumer: sí, con margen amplio; también funciona en CPU sin GPU.
- Despliegue: ONNX Runtime en CPU y CUDA, navegador con WebGPU/WebAssembly, paquete `netra-ocr` en PyPI, aplicación `netra_ocr serve` y la imagen Docker de Netra OCR.
- Latencia: ~13 ms por línea en CPU y 12,8 ms en CUDA; 1,14 s/página en CPU y 0,70 s/página en GPU.
- Descarga del pipeline completo de página en CPU: ~118 MB.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks frente a otros modelos OCR en la información disponible, por lo que la comparación se limita a características estructurales.

| Modelo | Tipo | Idiomas | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| Netra OCR | OCR + layout + detección, ONNX | jemer, inglés | ONNX, PyTorch | mixta (`other`) | no disponible |
| Tesseract | OCR clásico | múltiples | binario | Apache 2.0 | no aplica |
| PaddleOCR | OCR + detección + layout | múltiples | Paddle, ONNX | Apache 2.0 | no aplica |
| DocLayout-YOLO | layout de página | no aplica | PyTorch | según variante | no aplica |

No se dispone de datos de rendimiento comparativos con estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Cobertura lingüística limitada a jemer e inglés; no se declaran otros idiomas.
- Licencia mixta (`other` / `mixed`) con condiciones específicas de atribución: es imprescindible revisar el enlace de licencia antes de uso comercial.
- El detector de líneas debe permanecer en float32; el uso de media precisión desplaza cajas en 2 de 10 páginas de prueba.
- El pipeline completo difiere del de PyTorch en 3 de 10 páginas (0,43 % de caracteres), atribuido al redimensionado bilineal propio en float64 frente al de OpenCV, que mueve ~1 % de cajas límite.
- La variante blockwise no aporta mejoras de velocidad frente al decodificador greedy con caché KV.
- fp16 no está soportado en WebGPU con onnxruntime-web 1.31.
- No se publican datos sobre sesgos, tasa de alucinación ni robustez ante dominios distintos del corpus de evaluación.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; el modelo es específicamente OCR y layout.

## Enlaces

- Hugging Face: https://huggingface.co/Netra-Lab/Netra-OCR
- Licencia y atribución: https://huggingface.co/Netra-Lab/Netra-OCR#license-and-attribution
- GitHub: https://github.com/netra-ai-lab/Netra-OCR
- PyPI: https://pypi.org/project/netra-ocr/
- Pesos PyTorch: https://huggingface.co/Netra-Lab/Netra-OCR/tree/main/pytorch
- Resultados: https://github.com/netra-ai-lab/Netra-OCR/blob/master/docs/RESULTS.md
- Guía de fine-tuning: https://github.com/netra-ai-lab/Netra-OCR/blob/master/training/README.md
- Carpeta web: https://github.com/netra-ai-lab/Netra-OCR/tree/master/web
- Lector Python: https://github.com/netra-ai-lab/Netra-OCR/tree/master/netra_ocr/inference
