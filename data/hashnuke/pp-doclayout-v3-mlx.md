# HashNuke/pp-doclayout-v3-mlx

## Resumen

PP-DocLayoutV3 es un modelo de análisis de layout de documentos desarrollado por PaddlePaddle y convertido a MLX por HashNuke. Esta conversión, publicada en septiembre de 2026, permite ejecutar el modelo de forma nativa en Apple Silicon mediante la librería mlx-vlm. A diferencia de un OCR, el modelo no transcribe texto: predice regiones de página, etiquetas de clase y orden de lectura en imágenes de documentos.

La arquitectura combina un backbone HGNetV2-L, un codificador híbrido y un decodificador deformable con una cabeza de orden de lectura. Integra la segmentación de instancias y la predicción del orden de lectura en un framework end-to-end, lo que le permite manejar distorsiones físicas complejas como inclinación, curvatura e iluminación adversa. El modelo tiene 33.282.557 parámetros, pesa 133 MB en float32 y no está cuantizado.

Al estar basado en el checkpoint original de PaddlePaddle/PP-DocLayoutV3_safetensors, mantiene la licencia Apache-2.0 y ofrece 25 clases de predicción. Su relevancia radica en la posibilidad de realizar análisis de layout en ordenadores Mac sin depender de aceleradores externos, manteniendo compatibilidad con el ecosistema MLX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGNetV2-L backbone con codificador híbrido y decodificador deformable con cabeza de orden de lectura |
| Parametros totales | 33.282.557 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en float32, sin cuantizar) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de PP-DocLayoutV3 se compone de un backbone HGNetV2-L, un codificador híbrido y un decodificador deformable que incorpora una cabeza de predicción de orden de lectura. A diferencia de los modelos de layout tradicionales, integra la segmentación de instancias y la predicción del orden de lectura en una única pasada end-to-end, lo que le permite abordar documentos con distorsiones físicas complejas como sesgo, curvatura e iluminación desfavorable.

La conversión a MLX conserva la rama de características de máscara para la inicialización de queries mejorada por máscara, pero omite los pesos de denoising que solo se utilizan durante el entrenamiento. En la información disponible no se detallan los datos de entrenamiento (número de tokens, composición del dataset) ni procesos de alineación como RLHF o DPO, al tratarse de un modelo de detección de objetos en imágenes.

## Capacidades

- Analisis de layout de documentos: predice regiones de página mediante bounding boxes normalizados a 0–1000, etiquetas de clase y orden de lectura.
- Integración con mlx-vlm: carga el checkpoint y realiza inferencia local en Apple Silicon mediante la función `detect`.
- Inicialización de queries mejorada por máscara: la rama de características de máscara se conserva, permitiendo una mejor localización de regiones.
- Preprocesamiento específico: redimensiona imágenes RGB a 1024×1024 y escala píxeles a [0,1], compatible con el flujo de IndicDocLayout.
- Portal del modelo en HuggingFace: incluye soporte para imágenes de entrada en formato de archivo o PIL.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no dispone de capacidades de razonamiento, código, matemáticas, visión generativa o audio.

## Casos de uso

- Digitalización de documentos en macOS: el modelo puede ejecutarse localmente en un Mac con Apple Silicon para extraer la estructura de documentos escaneados, identificando títulos, tablas, párrafos y otras regiones.
- Preprocesamiento para OCR: al predecir bboxes y etiquetas de región, sirve como etapa previa a un motor de reconocimiento de texto, recortando cada región para su posterior transcripción.
- Gestión documental automatizada: en empresas con alto volumen de facturas, informes o contratos, el modelo puede etiquetar las regiones relevantes y devolver el orden de lectura, facilitando la indexación y búsqueda.
- Archivos históricos con deformaciones: gracias a su diseño para manejar curvatura e iluminación adversa, es útil en la digitalización de documentos antiguos de baja calidad.
- Extracción de datos en formularios y tablas: el modelo detecta tablas y campos en formularios digitalizados, alimentando pipelines de extracción de datos estructurados.
- Prototipado y experimentación en MLX: al ser Apache-2.0 y tener 33M parámetros, resulta adecuado para investigar técnicas de análisis de layout en notebooks y aplicaciones de escritorio en Mac.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe una validación a nivel de muestra: con `conf=0.5`, el preprocesamiento de 1024×1024 y la decodificación de orden de lectura, los registros de salida coincidieron con ejecuciones de referencia en PyTorch para dos imágenes de muestra (`paper.png` y `demo_pdf1_page1.png`). Se trata de una paridad de salida a nivel de muestra, no de un benchmark de precisión ni de una comparación bit a bit de tensores.

## Requisitos de hardware

- VRAM estimada: no disponible. El checkpoint es de 33.282.557 parámetros en float32 (133 MB), por lo que requiere muy poca memoria, pero no se especifica un valor de VRAM para GPU dedicadas.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) gracias a la compatibilidad con MLX. No se mencionan GPUs NVIDIA ni CUDA para esta conversión.
- Compatibilidad con consumo: un modelo de 33M parámetros en float32 es ligero y debería caber en cualquier GPU moderna, aunque no hay datos públicos al respecto.
- Opciones de despliegue: mlx-vlm en Apple Silicon. La conversión está preparada para cargarse con `load_model` y ejecutarse con `detect`. No se documentan vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|
| HashNuke/pp-doclayout-v3-mlx | 33.282.557 | 25 clases, orden de lectura | Apache-2.0 | MLX / Apple Silicon |
| PaddlePaddle/PP-DocLayoutV3_safetensors | 33.282.557 (base) | 25 clases, orden de lectura | Apache-2.0 | HuggingFace / Transformers |
| HashNuke/indic-ocr-mlx (etapa layout) | no disponible | 37 clases (fine-tune IndicDocLayout) | Apache-2.0 | HuggingFace |

La versión MLX es una conversión directa del checkpoint de PaddlePaddle, por lo que ambos comparten arquitectura y número de parámetros. La diferencia principal es el entorno de ejecución: MLX frente a PyTorch/Transformers. El fine-tune de IndicDocLayout amplía las clases a 37, pero su documentación no detalla el número de parámetros.

## Limitaciones y advertencias

- No transcribe texto: el modelo solo predice la estructura del documento, no realiza OCR ni reconocimiento de caracteres.
- El preprocesamiento difiere del procesador estándar de Transformers: al usar redimensión a 1024×1024 y escala de píxeles a [0,1], puede no ser compatible con pipelines que esperen la configuración por defecto del processor original.
- La validación de la conversión es limitada: solo se ha comprobado paridad de salida con PyTorch en dos imágenes de muestra, no se ha evaluado la precisión de detección a gran escala.
- Sin cuantización: los pesos se mantienen en float32, lo que puede reducir la eficiencia en dispositivos con memoria unificada limitada.
- Idiomas: el modelo está etiquetado con en y zh, pero las salidas de clase son las del checkpoint original y no se documenta soporte para otros idiomas.
- Datos de entrenamiento: no se publica información sobre sesgos ni composición del dataset, por lo que no se conocen posibles sesgos en la detección.
- Licencia Apache-2.0: permite uso comercial, pero requiere mantener el aviso de licencia original y las atribuciones correspondientes.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HashNuke/pp-doclayout-v3-mlx
- Modelo base: https://huggingface.co/PaddlePaddle/PP-DocLayoutV3_safetensors
- Documentación de PP-DocLayoutV3: https://huggingface.co/docs/transformers/model_doc/pp_doclayout_v3
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Fine-tune IndicOCR (MLX): https://huggingface.co/HashNuke/indic-ocr-mlx
