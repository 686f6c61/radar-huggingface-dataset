# chibifire/Qwen2.5-VL-7B-Instruct

## Resumen

Qwen2.5-VL-7B-Instruct es un modelo multimodal de visión y lenguaje desarrollado por el equipo Qwen de Alibaba Cloud. Este repositorio en HuggingFace es una copia subida por el usuario `chibifire` del modelo original, que está disponible en `Qwen/Qwen2.5-VL-7B-Instruct`. El modelo está diseñado para tareas de comprensión visual avanzada, incluyendo análisis de imágenes, documentos, gráficos, vídeos largos y uso como agente visual capaz de interactuar con interfaces de ordenador y teléfono.

La arquitectura combina un codificador visual (ViT) optimizado con atención de ventana, SwiGLU y RMSNorm, y un modelo de lenguaje Qwen2.5. El modelo cuenta con 8.292.166.656 parámetros totales (aunque se comercializa como 7B), y está licenciado bajo Apache 2.0. Es una versión instruction-tuned, pensada para seguir instrucciones multimodales y generar salidas estructuradas.

La relevancia de este modelo radica en sus mejoras respecto a Qwen2-VL, especialmente en la comprensión de vídeos de más de una hora, la localización visual precisa (bounding boxes, puntos), la generación de salidas JSON estructuradas y su capacidad agéntica para razonar y dirigir herramientas. Es una opción sólida para aplicaciones de automatización visual, análisis documental y agentes multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) con ViT optimizado y LLM Qwen2.5 |
| Parametros totales | 8.292.166.656 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo Qwen2.5-VL-7B-Instruct se basa en una arquitectura multimodal que extiende la resolución dinámica al dominio temporal mediante muestreo dinámico de FPS, lo que permite comprender vídeos a diferentes velocidades de muestreo. La mRoPE (rotary position embedding multimodal) se actualiza en la dimensión temporal con IDs y alineación de tiempo absoluto, permitiendo al modelo aprender secuencias temporales y velocidades, y localizar momentos específicos en vídeos.

El codificador visual ViT se ha optimizado con atención de ventana para mejorar la velocidad de entrenamiento e inferencia, y se ha alineado estructuralmente con el LLM Qwen2.5 mediante el uso de SwiGLU y RMSNorm. El modelo es la versión instruction-tuned de 7B de la familia Qwen2.5-VL, que también incluye variantes de 3B y 72B. Los datos de entrenamiento y el proceso de alineación (RLHF, DPO) no se detallan en la información disponible.

## Capacidades

- Comprensión visual avanzada: reconocimiento de objetos, análisis de textos, gráficos, iconos, diagramas y diseños en imágenes.
- Capacidad agéntica: actúa como agente visual que razona y dirige herramientas de forma dinámica, con soporte para uso de ordenador y de teléfono.
- Comprensión de vídeos largos: puede procesar vídeos de más de una hora y capturar eventos localizando los segmentos relevantes.
- Localización visual: genera bounding boxes o puntos para localizar objetos en imágenes, con salidas JSON estables para coordenadas y atributos.
- Salidas estructuradas: para documentos como facturas, formularios y tablas, puede generar el contenido en formato estructurado.
- Soporte de tool calling y razonamiento multi-paso: integrado en su capacidad agéntica.
- Capacidades multilingües: el repositorio indica únicamente `en`, aunque el modelo original de Qwen es multilingüe.

## Casos de uso

- Analisis documental financiero: el modelo extrae contenido estructurado de facturas, formularios y tablas, facilitando la automatización de procesos contables y de auditoría.
- Automatizacion de interfaces de usuario: gracias a su capacidad agéntica, puede navegar por aplicaciones de ordenador y móvil, ejecutando tareas como rellenar formularios o buscar información.
- Analisis de video de vigilancia: permite localizar eventos concretos en grabaciones largas, identificando el segmento temporal donde ocurre una acción relevante.
- OCR avanzado en entornos complejos: procesa imágenes con gráficos, iconos y diseños no triviales, mejorando la extracción de texto en capturas de pantalla, carteles y documentos escaneados.
- Asistente de accesibilidad visual: describe escenas, objetos y textos en imágenes para ayudar a personas con discapacidad visual en su vida diaria.
- Automatizacion de QA visual en comercio electronico: analiza capturas de productos, compara características visuales y genera descripciones o alertas de calidad.
- Investigacion academica: interpreta figuras, diagramas y tablas en articulos cientificos, ayudando a resumir resultados y extraer datos cuantitativos.

## Benchmarks y rendimiento

Los siguientes resultados proceden de la model card del modelo original. Se comparan con modelos multimodales de tamaño similar.

| Benchmark | InternVL2.5-8B | MiniCPM-o 2.6 | GPT-4o-mini | Qwen2-VL-7B | Qwen2.5-VL-7B |
|---|---|---|---|---|---|
| MMMU (val) | 56 | 50.4 | 60 | 54.1 | 58.6 |
| MMMU-Pro (val) | 34.3 | - | 37.6 | 30.5 | 41.0 |
| DocVQA (test) | 93 | 93 | - | 94.5 | 95.7 |
| InfoVQA (test) | 77.6 | - | - | 76.5 | 82.6 |
| ChartQA (test) | 84.8 | - | - | 83.0 | 87.3 |
| TextVQA (val) | 79.1 | 80.1 | - | 84.3 | 84.9 |
| OCRBench | 822 | 852 | 785 | 845 | 864 |
| CC_OCR | 57.7 | - | - | 61.6 | 77.8 |
| MMStar | 62.8 | - | - | 60.7 | 63.9 |
| MMBench-V1.1-En (test) | 79.4 | 78.0 | 76.0 | 80.7 | 82.6 |
| MMVet (GPT-4-Turbo) | 54.2 | 60.0 | 66.9 | 62.0 | 67.1 |
| HallBench (avg) | 45.2 | 48.1 | 46.1 | 50.6 | 52.9 |
| MathVista (testmini) | 58.3 | 60.6 | 52.4 | 58.2 | 68.2 |
| MathVision | - | - | - | 16.3 | 25.07 |

Benchmarks de video:

| Benchmark | Qwen2-VL-7B | Qwen2.5-VL-7B |
|---|---|---|
| MVBench | 67.0 | 69.6 |
| PerceptionTest (test) | 66.9 | 70.5 |
| Video-MME (wo/w subs) | 63.3/69.0 | 65.1/71.6 |
| LVBench | - | 45.3 |
| LongVideoBench | - | 54.7 |
| MMBench-Video | 1.44 | 1.79 |
| TempCompass | - | 71.7 |
| MLVU | - | 70.2 |
| CharadesSTA/mIoU | - | 43.6 |

Benchmarks de agente:

| Benchmark | Qwen2.5-VL-7B |
|---|---|
| ScreenSpot | 84.7 |
| ScreenSpot Pro | 29.0 |
| AITZ_EM | 81.9 |
| Android Control High_EM | 60.1 |
| Android Control Low_EM | 93.7 |
| AndroidWorld_SR | 25.5 |
| MobileMiniWob++_SR | 91.4 |

## Requisitos de hardware

- VRAM estimada para inferencia: ~16.6 GB en FP16 (calculo directo de los pesos). Con cuantizacion 4-bit, la estimacion es de ~4.2 GB, aunque no hay datos oficiales de cuantizacion disponibles.
- GPU recomendadas: A100 40GB, H100 80GB, RTX 4090 24GB (con cuantizacion).
- Compatibilidad con GPU de consumo: si, en RTX 3090 o RTX 4090 con cuantizacion de 4 u 8 bits.
- Opciones de despliegue: transformers (via HuggingFace), vLLM, text-generation-inference (TGI), endpoints compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

El modelo se compara con otras alternativas multimodales de tamano similar, como InternVL2.5-8B, MiniCPM-o 2.6 y Qwen2-VL-7B. En los benchmarks de imagen, Qwen2.5-VL-7B supera a Qwen2-VL-7B en practicamente todas las tareas, especialmente en DocVQA, ChartQA y MathVista. Frente a InternVL2.5-8B, obtiene mejores resultados en MMMU-Pro, DocVQA, InfoVQA, ChartQA, OCRBench y MathVista. En benchmarks de video, mejora claramente a Qwen2-VL-7B en MVBench, PerceptionTest y Video-MME.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-VL-7B-Instruct | 8.29B | No disponible | Apache 2.0 | HuggingFace |
| Qwen2-VL-7B-Instruct | 7B | No disponible | Apache 2.0 | HuggingFace |
| InternVL2.5-8B | 8B | No disponible | No disponible | HuggingFace |
| MiniCPM-o 2.6 | No disponible | No disponible | No disponible | HuggingFace |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: inherente en modelos de vision y lenguaje, especialmente en descripciones de objetos ambiguos o de baja resolucion.
- Limitaciones de contexto o idioma: el repositorio indica solo `en` como idioma soportado; aunque el modelo original es multilingue, esta copia puede no reflejar todas las capacidades.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos completos.
- Advertencia importante: este repositorio es una copia subida por un usuario no oficial (`chibifire`). No hay garantia de integridad de los pesos ni de que coincidan exactamente con el modelo original. Se recomienda usar el repositorio oficial `Qwen/Qwen2.5-VL-7B-Instruct` para entornos de produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/chibifire/Qwen2.5-VL-7B-Instruct
- Repositorio oficial del modelo: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Blog de Qwen2.5-VL: https://qwenlm.github.io/blog/qwen2.5-vl/
- GitHub de Qwen2.5-VL: https://github.com/QwenLM/Qwen2.5-VL
- Paper Qwen-VL (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
- Paper Qwen2-VL (arXiv:2409.12191): https://arxiv.org/abs/2409.12191
- Paper Qwen-LM (arXiv:2308.12966): https://arxiv.org/abs/2308.12966
