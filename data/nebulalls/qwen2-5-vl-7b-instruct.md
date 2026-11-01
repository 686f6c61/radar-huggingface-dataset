# Nebulalls/Qwen2.5-VL-7B-Instruct

## Resumen

Qwen2.5-VL-7B-Instruct es un modelo multimodal de tipo visión-lenguaje desarrollado por el equipo Qwen de Alibaba (publicado en este repositorio por el usuario Nebulalls). Forma parte de la familia Qwen2.5-VL, que incluye variantes de 3B, 7B y 72B parámetros. El modelo combina un codificador visual ViT con un transformer de lenguaje Qwen2.5, y está diseñado para tareas de comprensión de imágenes, vídeo, documentos, gráficos y UI, además de razonamiento agéntico sobre entornos visuales.

La relevancia de esta versión radica en sus mejoras frente a Qwen2-VL en comprensión de documentos (DocVQA 95,7), OCR (OCRBench 864), matemáticas visuales (MathVista 68,2) y uso como agente visual (ScreenSpot 84,7). Incorpora resolución dinámica, muestreo dinámico de FPS para vídeo y localización visual mediante bounding boxes y puntos.

El repositorio contiene 8.292.166.656 parámetros en formato safetensors (16,6 GB), licencia Apache 2.0 y pipeline image-text-to-text. Está pensado para desarrolladores que necesitan un VLM de tamaño medio desplegable en hardware razonable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (ViT con window attention + LLM Qwen2.5) |
| Parámetros totales | 8.292.166.656 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | en (inglés, según model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura multimodal compuesta por un codificador visual ViT y un LLM Qwen2.5. El ViT incorpora window attention para acelerar entrenamiento e inferencia, y se ha optimizado con SwiGLU y RMSNorm para alinearse estructuralmente con el LLM. Para vídeo, se adopta resolución dinámica extendida a la dimensión temporal mediante muestreo dinámico de FPS, y se actualiza el mRoPE en la dimensión temporal con IDs y alineación de tiempo absoluto, lo que permite al modelo aprender secuencias temporales y localizar momentos concretos en vídeos de más de una hora.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones como decodificación especulativa. Sí se documentan capacidades de localización visual (bounding boxes y puntos con salida JSON estable) y de generación de salidas estructuradas para facturas, formularios y tablas.

## Capacidades

- Comprensión de imágenes: reconocimiento de objetos, análisis de textos, gráficos, iconos y layouts.
- Comprensión de documentos: OCR, DocVQA, InfoVQA, ChartQA, extracción de contenido estructurado de facturas y formularios.
- Comprensión de vídeo: vídeos de más de una hora, captura de eventos y localización de segmentos relevantes.
- Localización visual: generación de bounding boxes y puntos con coordenadas y atributos en JSON estable.
- Razonamiento matemático visual: MathVista y MathVision.
- Uso como agente visual: computer use y phone use, razonamiento y dirección dinámica de herramientas.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: la model card solo declara inglés.
- Salidas estructuradas: JSON para datos de escaneos, formularios y tablas.

## Casos de uso

- Digitalización de facturas y formularios: el modelo puede procesar escaneos y devolver contenido estructurado en JSON, lo que facilita su integración en pipelines financieros y de comercio.
- Automatización de atención al cliente con soporte visual: permite interpretar capturas de pantalla o imágenes enviadas por el usuario y responder en conversaciones multi-turno.
- Agentes de automatización de interfaz (RPA visual): con ScreenSpot 84,7 y MobileMiniWob++ 91,4, puede razonar sobre elementos de UI y dirigir acciones en entornos de escritorio y móvil.
- Análisis de documentos técnicos y gráficos: DocVQA 95,7 e InfoVQA 82,6 lo hacen adecuado para extraer información de manuales, informes y paneles.
- Indexación y búsqueda en vídeo: con comprensión de vídeos de más de una hora y localización temporal, puede identificar momentos concretos en grabaciones largas.
- Extracción de datos de tablas e informes: ChartQA 87,3 y OCRBench 864 permiten convertir tablas e imágenes con texto en datos utilizables.
- Asistencia en educación matemática: MathVista 68,2 y MathVision 25,07 permiten resolver y explicar problemas con contenido visual.

## Benchmarks y rendimiento

### Benchmarks de imagen

| Benchmark | InternVL2.5-8B | MiniCPM-o 2.6 | GPT-4o-mini | Qwen2-VL-7B | Qwen2.5-VL-7B |
|---|---|---|---|---|---|
| MMMU val | 56 | 50,4 | 60 | 54,1 | 58,6 |
| MMMU-Pro val | 34,3 | - | 37,6 | 30,5 | 41,0 |
| DocVQA test | 93 | 93 | - | 94,5 | 95,7 |
| InfoVQA test | 77,6 | - | - | 76,5 | 82,6 |
| ChartQA test | 84,8 | - | - | 83,0 | 87,3 |
| TextVQA val | 79,1 | 80,1 | - | 84,3 | 84,9 |
| OCRBench | 822 | 852 | 785 | 845 | 864 |
| CC_OCR | 57,7 | - | - | 61,6 | 77,8 |
| MMStar | 62,8 | - | - | 60,7 | 63,9 |
| MMBench-V1.1-En test | 79,4 | 78,0 | 76,0 | 80,7 | 82,6 |
| MMT-Bench test | - | - | - | 63,7 | 63,6 |
| MMVet GPT-4-Turbo | 54,2 | 60,0 | 66,9 | 62,0 | 67,1 |
| HallBench avg | 45,2 | 48,1 | 46,1 | 50,6 | 52,9 |
| MathVista testmini | 58,3 | 60,6 | 52,4 | 58,2 | 68,2 |
| MathVision | - | - | - | 16,3 | 25,07 |

### Benchmarks de vídeo

| Benchmark | Qwen2-VL-7B | Qwen2.5-VL-7B |
|---|---|---|
| MVBench | 67,0 | 69,6 |
| PerceptionTest test | 66,9 | 70,5 |
| Video-MME wo/w subs | 63,3/69,0 | 65,1/71,6 |
| LVBench | - | 45,3 |
| LongVideoBench | - | 54,7 |
| MMBench-Video | 1,44 | 1,79 |
| TempCompass | - | 71,7 |
| MLVU | - | 70,2 |
| CharadesSTA/mIoU | - | 43,6 |

### Benchmarks de agente

| Benchmark | Qwen2.5-VL-7B |
|---|---|
| ScreenSpot | 84,7 |
| ScreenSpot Pro | 29,0 |
| AITZ_EM | 81,9 |
| Android Control High_EM | 60,1 |
| Android Control Low_EM | 93,7 |
| AndroidWorld_SR | 25,5 |
| MobileMiniWob++_SR | 91,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, los 8,29B parámetros en safetensors ocupan 16,6 GB; en cuantización de 8 bits requerirían aproximadamente 8-9 GB y en 4 bits alrededor de 4-5 GB, aunque estos valores no están confirmados en la model card.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño, sería viable en GPUs con 16-24 GB de VRAM en cuantizaciones bajas, pero no hay dato oficial.
- Opciones de despliegue: transformers (recomendado instalar desde el repositorio de GitHub), text-generation-inference (etiqueta presente), qwen-vl-utils[decord] para carga de vídeo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| Qwen2.5-VL-7B-Instruct | 8,29B | no disponible | Apache 2.0 | HuggingFace | DocVQA 95,7; MathVista 68,2; ScreenSpot 84,7 |
| Qwen2-VL-7B | 7B (aprox.) | no disponible | Apache 2.0 | HuggingFace | DocVQA 94,5; MathVista 58,2; ScreenSpot no disponible |
| InternVL2.5-8B | 8B (aprox.) | no disponible | no disponible | HuggingFace | MMMU 56; DocVQA 93; OCRBench 822 |
| MiniCPM-o 2.6 | no disponible | no disponible | no disponible | HuggingFace | MMMU 50,4; OCRBench 852; MMVet 60,0 |

## Limitaciones y advertencias

- Idiomas: la model card solo declara inglés; no se garantiza un rendimiento equivalente en castellano u otros idiomas.
- Longitud de contexto: no especificada en la información disponible; conviene verificarla antes de usos con documentos o vídeos muy largos.
- Alucinación: como todo VLM, puede generar descripciones o extracciones incorrectas, especialmente en documentos de baja calidad o gráficos complejos; HallBench avg de 52,9 indica margen de mejora.
- Rendimiento en agentes: ScreenSpot Pro 29,0 y AndroidWorld_SR 25,5 son bajos, lo que limita su uso autónomo en entornos de producción sin supervisión.
- MathVision 25,07 indica capacidad limitada en razonamiento matemático visual complejo.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de los componentes y datos de entrenamiento originales.
- El repositorio tiene pocas descargas (35) y ningún like, lo que sugiere que es una republicación; conviene verificar la procedencia de los pesos frente al repositorio oficial de Qwen.
- Requiere transformers actualizado desde el repositorio de GitHub; versiones antiguas producen `KeyError: 'qwen2_5_vl'`.

## Enlaces

- HuggingFace: https://huggingface.co/Nebulalls/Qwen2.5-VL-7B-Instruct
- Blog oficial: https://qwenlm.github.io/blog/qwen2.5-vl/
- GitHub: https://github.com/QwenLM/Qwen2.5-VL
- Chat: https://chat.qwenlm.ai/
- Paper referencia: arxiv:2309.00071
- Paper referencia: arxiv:2409.12191
- Paper referencia: arxiv:2308.12966
