# sekkit/OvisOCR3

## Resumen

OvisOCR3 es un modelo multimodal compacto de 0,8 mil millones de parametros desarrollado por el usuario sekkit, construido mediante ajuste fino sobre Qwen3.5-0.8B. Su proposito es unificar en un unico modelo cinco tareas de OCR y comprension documental que tradicionalmente requieren despliegues separados: parseo de documentos, OCR general, extraccion de informacion clave, generacion de pies de figura documentales y reconstruccion de tablas a traves de multiples paginas. La seleccion de tarea se realiza mediante prompts especificos que definen el contrato de salida.

El modelo sigue una arquitectura transformer multimodal (image-text-to-text) heredada de Qwen3.5-0.8B, con aproximadamente 853 millones de parametros totales segun los pesos en safetensors. Se entrena en cuatro etapas: preentrenamiento continuado, mid-training, destilacion on-policy y aprendizaje por refuerzo, lo que combina supervision de dominio con optimizacion por recompensas. El resultado es un modelo que, segun el autor, alcanza rendimiento estado del arte entre modelos de tamano comparable en los cinco dominios evaluados.

Su relevancia actual reside en la eficiencia: ofrece capacidades de parseo documental estructurado (Markdown con formulas LaTeX y tablas HTML), extraccion de pares clave-valor y reconstruccion de tablas entre paginas con un coste computacional muy bajo, lo que lo hace desplegable en entornos con recursos limitados. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5-0.8B |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con vLLM) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OvisOCR3 parte de Qwen3.5-0.8B, un modelo de lenguaje de aproximadamente 0,8 mil millones de parametros, y le incorpora capacidad visual para tareas image-text-to-text. La arquitectura es un transformer multimodal que procesa imagenes de pagina junto con prompts de tarea y genera salidas estructuradas (JSON, Markdown, HTML, LaTeX o texto plano segun el contrato del prompt). El pipeline declarado en Hugging Face es `image-text-to-text` y la libreria es `transformers`, con soporte adicional para vLLM.

El entrenamiento se organiza en cuatro etapas segun la model card: preentrenamiento continuado, mid-training, destilacion on-policy y aprendizaje por refuerzo. Las dos primeras construyen la base de reconocimiento de texto y comprension de estructura documental; las dos ultimas refinan las capacidades mediante supervision especifica de dominio y funciones de recompensa. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni los detalles de las funciones de recompensa del RL.

## Capacidades

- Parseo de documentos: a partir de una imagen de pagina y un prompt de modo de parseo, genera JSON estructurado, JSON de layout o Markdown con formulas en LaTeX y tablas en HTML.
- OCR general: procesa una imagen, opcionalmente con una region, referencias, una pregunta, un idioma objetivo o etiquetas candidatas, y devuelve texto, bounding boxes, LaTeX, datos de graficos, una etiqueta o una respuesta.
- Extraccion de informacion clave (KIE): a partir de una imagen, opcionalmente con campos especificados o una plantilla JSON de salida, produce registros clave-valor o JSON conforme a la plantilla.
- Generacion de pies de figura documentales: con una imagen de pagina y un prompt de modo figura, genera contenido estructurado con leyendas visuales localizadas y representaciones Mermaid para diagramas de flujo.
- Reconstruccion de tablas entre paginas: con imagenes de paginas consecutivas y su Markdown parseado, produce tablas HTML completas con asociacion a la pagina de origen o una prediccion de no continuacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada; los benchmarks incluyen evaluacion en ingles y chino (OCRBench v2 EN/ZH).

## Casos de uso

- Digitalizacion de archivos documentales: procesar lotes de imagenes de pagina con el prompt de parseo para obtener Markdown con formulas LaTeX y tablas HTML, apto para ingestas en sistemas de gestion documental o bases de conocimiento.
- Extraccion de datos de facturas y formularios: usar el modo KIE con una plantilla JSON de salida para obtener pares clave-valor normalizados directamente consumibles por un ERP o un pipeline de contabilidad.
- Conversion de articulos cientificos a Markdown estructurado: el parseo con LaTeX preserva formulas y tablas, lo que facilita la reindexacion de literatura academica en buscadores o asistentes de investigacion.
- Reconstruccion de tablas partidas entre paginas: en informes financieros o memorias anuales donde una tabla continua en la pagina siguiente, el modelo genera la tabla HTML completa con la asociacion de paginas de origen.
- Accesibilidad de documentos: generar descripciones localizadas de figuras y diagramas de flujo (con representaciones Mermaid) para hacer accesibles informes tecnicos y manuales a lectores con discapacidad visual o para su uso en lectores de pantalla.
- OCR en dispositivos o entornos con recursos limitados: al tener solo 0,8B de parametros, puede desplegarse en una unica GPU consumer o en infraestructura modesta, lo que permite OCR en el borde o en entornos con presupuesto de computo reducido.
- Enriquecimiento de pipelines RAG: convertir documentos escaneados en Markdown estructurado antes de la fragmentacion e indexacion, mejorando la calidad de recuperacion en sistemas de preguntas y respuestas sobre documentacion interna.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card. `--` indica valor no reportado.

### Parseo de documentos

| Modelo | OmniDocBench1.6 | MDPBench | PureDocBench | Real5-OmniDocBench |
|---|---:|---:|---:|---:|
| Qwen3.5-OCR | 91.27 | 60.60 | 68.38 | 82.48 |
| Qwen3.8-Max | 93.70 | 86.40 | 80.56 | 86.86 |
| GLM-OCR | 95.22 | 67.30 | 63.34 | 90.32 |
| PaddleOCR-VL-1.6 | 96.34 | 78.90 | 65.44 | 93.19 |
| MonkeyOCRv2-B-Parsing | 91.57 | 83.30 | 64.91 | 89.22 |
| OvisOCR2 | 96.58 | 69.00 | 75.10 | 92.29 |
| HunyuanOCR-1.5 | 94.74 | 76.80 | 67.58 | 88.53 |
| Xiaomi-OCR-0 | **96.83** | 73.00 | 74.60 | 92.73 |
| **OvisOCR3** | 96.74 | **88.80** | **82.31** | **93.63** |

### OCR general

| Modelo | OCRBench | OCRBench v2 EN | OCRBench v2 ZH |
|---|---:|---:|---:|
| Qwen3.5-0.8B | 79.1 | 41.5 | 43.9 |
| Qwen3.5-2B | 85.4 | 48.1 | 55.4 |
| Qwen3.5-4B | 85.0 | 54.1 | 61.0 |
| Qwen3.5-OCR | 76.8 | 44.5 | 43.8 |
| PaddleOCR-VL-1.6 | 55.9 | 23.8 | 30.4 |
| HunyuanOCR-1.5 | 86.1 | 50.7 | 57.7 |
| GLM-OCR | 83.8 | 32.9 | 48.1 |
| Xiaomi-OCR-0 | 84.6 | 40.1 | 48.4 |
| **OvisOCR3** | **88.8** | **65.9** | **61.3** |

### Extraccion de informacion clave

| Modelo | OCRBench KIE | OCRBench v2 KIE | CC-OCR KIE | In-house KIE Bench |
|---|---:|---:|---:|---:|
| Qwen3.5-OCR | 78.50 | 72.90 | 88.43 | 59.90 |
| GLM-OCR | 79.00 | 74.22 | 68.36 | 75.25 |
| HunyuanOCR-1.5 | 81.00 | 68.63 | 66.08 | 75.96 |
| Xiaomi-OCR-0 | 76.50 | 74.66 | 79.53 | 75.68 |
| **OvisOCR3** | **90.50** | **83.01** | **88.69** | **77.73** |

### Pies de figura documentales

| Modelo | DocFigCapBench Localization F1 | DocFigCapBench Caption Score |
|---|---:|---:|
| HunyuanOCR-1.5 | 48.24 | -- |
| Qwen3.5-OCR | 78.47 | 4.74 |
| OvisOCR2 | 82.18 | -- |
| MinerU2.5-Pro | 85.00 | 4.61 |
| PaddleOCR-VL-1.6 | 85.32 | 4.29 |
| Qwen3.8-Max | 86.67 | **7.30** |
| **OvisOCR3** | **90.97** | 6.93 |

### Reconstruccion de tablas entre paginas

| Modelo | CrossTabBench Relation F1 (P/R) | CrossTabBench Reconstruction TEDS | MPDocBench-Parse Truncated Table TEDS |
|---|---:|---:|---:|
| PaddleOCR-VL-1.6 | 42.61 (90.13/27.90) | 24.24 | 83.39 |
| Logics-Parsing-V3 | 44.55 (90.63/29.53) | 26.10 | 88.05 |
| MinerU2.5-Pro | 59.14 (93.81/43.18) | 41.02 | 91.44 |
| MinerU2.5-Pro + MinerU-PoPo | 54.76 (97.40/38.09) | 36.42 | 91.87 |
| Qwen3.8-Max | 94.47 (90.19/99.19) | **91.71** | 89.57 |
| **OvisOCR3** | **97.07** (96.20/97.96) | 89.66 | **92.04** |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Con 852.985.920 parametros y pesos en safetensors (repo de 1,7 GB), la inferencia en precision completa requiere aproximadamente 3,4 GB solo para pesos (2 bytes por parametro), mas el coste de activaciones y del procesador de vision.
- GPU recomendadas: el ejemplo de inferencia oficial usa vLLM con `tensor_parallel_size=1` y `gpu_memory_utilization=0.8`, lo que indica que una unica GPU es suficiente. No se especifican modelos concretos de GPU en la informacion disponible.
- Cabe en GPU consumer: si, dado el tamano de 0,8B; no se detallan modelos concretos en la informacion proporcionada.
- Opciones de despliegue: vLLM (version 0.22.1 segun el ejemplo oficial, con backend de prefill `gdn_prefill_backend="triton"`), transformers. No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | OCRBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **OvisOCR3** | 0,8B | no disponible | 88,8 | apache-2.0 | Hugging Face |
| Qwen3.5-0.8B | 0,8B | no disponible | 79,1 | no disponible | Hugging Face |
| Qwen3.5-2B | 2B | no disponible | 85,4 | no disponible | Hugging Face |
| Qwen3.5-4B | 4B | no disponible | 85,0 | no disponible | Hugging Face |
| HunyuanOCR-1.5 | no disponible | no disponible | 86,1 | no disponible | no disponible |
| GLM-OCR | no disponible | no disponible | 83,8 | no disponible | no disponible |
| PaddleOCR-VL-1.6 | no disponible | no disponible | 55,9 | no disponible | no disponible |

En parseo documental, OvisOCR3 lidera MDPBench (88,80), PureDocBench (82,31) y Real5-OmniDocBench (93,63), y queda muy cerca de Xiaomi-OCR-0 en OmniDocBench1.6 (96,74 frente a 96,83). En OCR general supera a todos los comparadores en OCRBench (88,8) y en OCRBench v2 EN (65,9), y queda por detras de Qwen3.5-4B en OCRBench v2 ZH (61,3 frente a 61,0, practicamente empatado). En KIE supera a todos los comparadores en las cuatro metricas. En reconstruccion de tablas entre paginas, su F1 de relacion (97,07) supera a Qwen3.8-Max (94,47), aunque este ultimo obtiene mejor TEDS de reconstruccion (91,71 frente a 89,66).

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion proporcionada.
- Riesgo de alucinacion: no se documenta explicitamente; en tareas de parseo y KIE, la generacion de contenido estructurado puede producir campos o celdas inventadas, por lo que se recomienda validacion posterior en produccion.
- Limitaciones de contexto o idioma: la longitud de contexto no esta disponible; los benchmarks cubren principalmente ingles y chino, sin datos sobre otros idiomas.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial con atribucion y sin garantias; conviene revisar los terminos de la licencia del modelo base Qwen3.5-0.8B.
- El modelo depende de prompts de tarea especificos (carpeta `prompts/`) que definen el contrato de salida; usar prompts distintos puede degradar la calidad o romper el formato esperado.
- Requiere un entorno GPU compatible con vLLM (version 0.22.1 en el ejemplo oficial) y el backend de prefill `triton`; no se documentan alternativas de despliegue en CPU.
- El modelo tiene solo 0,8B de parametros; aunque los benchmarks son competitivos, tareas de razonamiento complejo o documentos muy densos pueden superar su capacidad.
- No se han publicado resultados de benchmarks independientes fuera de los reportados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sekkit/OvisOCR3
- Informe tecnico (arXiv): https://arxiv.org/abs/2610.33066
- Demo online (Hugging Face Spaces): https://huggingface.co/spaces/ATH-MaaS/OvisOCR3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
