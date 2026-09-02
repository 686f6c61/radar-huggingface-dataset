# introvoyz041/ChemicalOCR

## Resumen

ChemicalOCR es un modelo de visión-lenguaje compacto, con 256 millones de parámetros, desarrollado por el equipo de Docling (IBM Research) y publicado en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo SmolDocling-256M-preview, especializado en el reconocimiento óptico de caracteres (OCR) aplicado a imágenes de estructuras químicas. Su función principal es extraer texto a nivel de carácter y cajas delimitadoras (bounding boxes) de dibujos moleculares, lo que permite identificar etiquetas de átomos, abreviaturas químicas y texto descriptivo asociado a las estructuras.

El modelo resuelve un problema concreto: los sistemas OCR genéricos fallan estrepitosamente cuando se enfrentan a imágenes de estructuras químicas, debido a la complejidad de las notaciones, los superíndices y la disposición espacial de los elementos. ChemicalOCR, al estar entrenado específicamente con este tipo de imágenes, supera con claridad a alternativas generalistas como PaddleOCR o EasyOCR en benchmarks especializados (M2S, USPTO-M e IP5-M). Su relevancia actual radica en que es un componente clave de MarkushGrapher-2, un sistema de reconocimiento multimodal de estructuras químicas en documentos de patentes, un área de gran interés para la industria farmacéutica y la propiedad intelectual.

La arquitectura se basa en Idefics3ForConditionalGeneration, la misma que emplea SmolDocling, y el modelo acepta como entrada una imagen de estructura química y devuelve detecciones de texto con sus coordenadas. Está liberado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Idefics3ForConditionalGeneration (SmolDocling) |
| Parametros totales | 256.484.928 (256M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificado en la ficha) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, cuantificable a posteriori) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ChemicalOCR se construye sobre SmolDocling-256M-preview, un modelo ligero de la familia Docling diseñado para conversión de documentos de extremo a extremo. La arquitectura subyacente es Idefics3, un modelo de visión-lenguaje que combina un codificador visual con un decodificador de lenguaje, capaz de procesar imágenes y generar texto. En este caso, el modelo se ha ajustado finamente para la tarea específica de OCR químico, lo que implica aprender a asociar regiones de la imagen con caracteres individuales y sus coordenadas espaciales.

El entrenamiento se realizó sobre un conjunto de datos de imágenes de estructuras químicas anotadas con texto y cajas delimitadoras a nivel de carácter. Aunque la model card no detalla la composición exacta del dataset ni el número de tokens de entrenamiento, se indica que el modelo forma parte del pipeline de MarkushGrapher-2, donde se fusiona la información textual y de layout extraída por ChemicalOCR con características visuales para el reconocimiento de estructuras Markush. No se menciona el uso de técnicas como RLHF o DPO; el ajuste es supervisado clásico.

## Capacidades

- Extracción de texto a nivel de carácter en imágenes de estructuras químicas, incluyendo etiquetas de átomos (p. ej., C, N, O), abreviaturas de grupos funcionales y texto descriptivo.
- Generación de cajas delimitadoras (bounding boxes) para cada detección de texto, lo que permite localizar espacialmente los elementos dentro de la imagen.
- Reconocimiento de notaciones químicas complejas, como superíndices, subíndices y representaciones de enlaces, que suelen confundir a los OCR genéricos.
- Integración como componente de un sistema mayor (MarkushGrapher-2) para el reconocimiento multimodal de estructuras químicas en patentes.
- Procesamiento de imágenes de documentos científicos, patentes y cuadernos de laboratorio que contengan representaciones moleculares.
- No se documentan capacidades de tool calling, agentes o razonamiento multi-paso; el modelo está especializado exclusivamente en OCR químico.

## Casos de uso

- Análisis de patentes químicas: ChemicalOCR puede extraer automáticamente los textos y etiquetas de las estructuras químicas presentes en las figuras de patentes, facilitando la búsqueda y comparación de reivindicaciones. Su alta precisión en benchmarks como IP5-M (F1 86,5) lo hace adecuado para este fin.
- Digitalización de cuadernos de laboratorio: los investigadores pueden escanear páginas con estructuras dibujadas a mano o generadas por software y obtener el texto asociado, lo que agiliza la gestión de datos experimentales.
- Indexación de bases de datos de compuestos: al extraer etiquetas y abreviaturas de imágenes, el modelo permite enriquecer bases de datos químicas con información textual que antes requería transcripción manual.
- Búsqueda de estructuras por similitud: combinado con herramientas de conversión de imagen a SMILES o InChI, ChemicalOCR puede preprocesar las imágenes para identificar los elementos textuales que acompañan a la estructura, mejorando la precisión de la búsqueda.
- Automatización de flujos de trabajo en química computacional: el modelo puede integrarse en pipelines que procesan grandes volúmenes de imágenes de estructuras, por ejemplo, para extraer datos de reacciones o propiedades.
- Asistencia a la revisión de literatura científica: los editores o revisores pueden usar ChemicalOCR para verificar que las figuras de estructuras químicas en manuscritos contengan las etiquetas correctas, reduciendo errores de transcripción.

## Benchmarks y rendimiento

La model card proporciona resultados en tres benchmarks especializados en OCR químico, comparando con dos OCR generalistas. Los datos son los siguientes:

| Benchmark | ChemicalOCR (Ours) | PaddleOCR v5 | EasyOCR |
|---|---|---|---|
| M2S (103 imágenes) — F1@IoU₀.₅ | **87.2** | 7.7 | 10.2 |
| USPTO-M (74 imágenes) — F1@IoU₀.₅ | **93.0** | 1.2 | 18.0 |
| IP5-M (1000 imágenes) — F1@IoU₀.₅ | **86.5** | 1.9 | 18.4 |

Además, se reportan métricas detalladas para ChemicalOCR:

| Benchmark | Precision | Recall | F1 | Accuracy@IoU₀.₅ |
|---|---|---|---|---|
| M2S | 86.9 | 87.4 | 87.2 | 32.0 |
| USPTO-M | 93.5 | 92.6 | 93.0 | 63.5 |
| IP5-M | 85.6 | 87.4 | 86.5 | 69.5 |

Estos resultados demuestran una ventaja abrumadora frente a los OCR generalistas, que obtienen puntuaciones muy bajas en estos conjuntos de datos. No se han publicado comparaciones con otros modelos específicos de OCR químico en la información disponible.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware para ChemicalOCR. Dado que el modelo tiene 256 millones de parámetros y una arquitectura de visión-lenguaje, se puede estimar lo siguiente (estimación orientativa, no dato oficial):

- VRAM estimada para inferencia: en FP16, los pesos ocupan aproximadamente 512 MB; con el procesamiento de imágenes y el overhead del modelo, se estima un consumo de entre 2 y 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1650, RTX 3050 o superior. En entornos cloud, una T4 o V100 sería suficiente.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs modernas de gama media.
- Opciones de despliegue: al ser un modelo de Transformers, puede ejecutarse con la librería `transformers` en Python, o servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con endpoints de FriendliAI, según se indica en la búsqueda web.
- Latencia y throughput: no se han publicado datos concretos; al ser un modelo pequeño, se espera una latencia baja (del orden de decenas de milisegundos por imagen en GPUs modernas), pero no hay cifras oficiales.

## Comparativa con modelos similares

La comparativa más directa es con los OCR generalistas evaluados en los benchmarks, aunque no son modelos de la misma categoría (no están especializados en química). También se puede comparar con el modelo base SmolDocling, aunque este no está orientado a OCR químico.

| Modelo | Parámetros | Especialización | F1@IoU₀.₅ en M2S | Licencia |
|---|---|---|---|---|
| ChemicalOCR | 256M | OCR químico | 87.2 | Apache 2.0 |
| PaddleOCR v5 | No disponible | OCR general | 7.7 | Apache 2.0 |
| EasyOCR | No disponible | OCR general | 10.2 | Apache 2.0 |
| SmolDocling-256M-preview | 256M | Conversión de documentos | No evaluado en química | Apache 2.0 |

No se dispone de información sobre otros modelos específicos de OCR químico (como aquellos basados en arquitecturas más grandes) para una comparativa más amplia.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con imágenes de estructuras químicas y texto en inglés; su rendimiento en otros dominios o idiomas no está garantizado.
- No se han documentado sesgos específicos, pero al ser un modelo especializado, puede fallar en imágenes con calidad baja, rotaciones extremas o notaciones químicas poco comunes.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto que no corresponde exactamente a la imagen, especialmente en regiones ambiguas o con ruido.
- La precisión a nivel de carácter es alta, pero la métrica Accuracy@IoU₀.₅ es notablemente inferior (32-69,5), lo que indica que la localización exacta de las cajas puede ser menos fiable que la detección de texto.
- No se han publicado evaluaciones sobre robustez ante ataques adversarios o variaciones de estilo de dibujo.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento si se utiliza en aplicaciones con requisitos de propiedad intelectual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/introvoyz041/ChemicalOCR
- Modelo base SmolDocling: https://huggingface.co/ds4sd/SmolDocling-256M-preview
- MarkushGrapher-2 (sistema completo): https://huggingface.co/docling-project/MarkushGrapher-2
- Página de FriendliAI con el modelo: https://friendli.ai/models/docling-project/ChemicalOCR
- Perfil de GitHub del autor: https://github.com/introvoyz041
- Paper (CVPR 2026): Strohmeyer, T., Morin, L., Meijer, G. I., Weber, V., Nassar, A., & Staar, P. W. J. (2026). "MarkushGrapher-2: End-to-end Multimodal Recognition of Chemical Structures". Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR).
