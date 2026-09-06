# SeeWye/qwen3_5_automata_ocr_merged1

## Resumen

SeeWye/qwen3_5_automata_ocr_merged1 es un modelo multimodal de imagen a texto (image-text-to-text) desarrollado por SeeWye a partir del modelo base unsloth/Qwen3.5-4B. Se trata de un finetune especializado en tareas de OCR (reconocimiento óptico de caracteres), entrenado con la librería Unsloth y el framework TRL de Hugging Face, lo que permitió acelerar el proceso de entrenamiento. El modelo está diseñado para recibir imágenes (por ejemplo, documentos escaneados o capturas de pantalla) y generar el texto extraído de ellas, por lo que se encuadra en la categoría de modelos vision-language para extracción de texto.

Con un total de 4.659.865.088 parámetros (aproximadamente 4.66 mil millones) y un tamaño de repositorio de 9.3 GB en formato safetensors, es un modelo de tamaño medio que puede ejecutarse en hardware de consumo con cuantización, aunque no se han publicado datos sobre las cuantizaciones disponibles. La licencia es Apache 2.0, lo que permite uso comercial, y el modelo declara soporte únicamente para inglés. No se han publicado benchmarks ni documentación técnica detallada más allá de la model card, por lo que la evaluación de su rendimiento debe realizarse de forma empírica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5-4B |
| Parametros totales | 4.659.865.088 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; probablemente BF16/FP16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3.5-4B, un transformer multimodal de la familia Qwen que combina un codificador de visión con un modelo de lenguaje. SeeWye realizó un finetune específico para OCR sobre el checkpoint de unsloth, utilizando Unsloth (para optimización de memoria y velocidad) y la librería TRL de Hugging Face. El nombre "merged1" sugiere que el modelo es el resultado de la fusión de pesos tras el finetune, posiblemente combinando adaptadores LoRA o diferentes checkpoints. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se emplearon técnicas de alineación como RLHF o DPO. La única innovación técnica documentada es el uso de Unsloth para acelerar el entrenamiento aproximadamente un 2x, según la model card.

## Capacidades

- Extracción de texto de imágenes y documentos escaneados (OCR).
- Procesamiento de entradas multimodales: acepta imágenes junto con instrucciones textuales y genera texto.
- Soporte de conversación en formato image-text-to-text, útil para interacciones iterativas con documentos.
- Capacidades multilingües: limitadas, solo se declara soporte para inglés.
- No se ha documentado soporte para tool calling, function calling, agentes ni razonamiento multi-paso.
- No se ha documentado soporte para otras modalidades de entrada (audio, video).

## Casos de uso

- Digitalización de documentos históricos: el modelo puede extraer texto de imágenes de archivos antiguos o libros escaneados, permitiendo su indexación y búsqueda posterior en bases de datos documentales.
- Extracción de texto de capturas de pantalla: en aplicaciones de automatización, se puede integrar para leer texto de capturas de pantalla de software o interfaces y alimentar otros sistemas.
- Automatización de entrada de datos en facturas y recibos: el modelo puede transcribir los campos relevantes de facturas escaneadas (importes, fechas, proveedores) y facilitar su integración en sistemas de gestión empresarial.
- Accesibilidad para personas con discapacidad visual: integrado en una aplicación móvil, el modelo puede describir el contenido textual de fotografías tomadas por el usuario, mejorando la autonomía.
- Procesamiento de documentos en gestores de archivos: se puede desplegar como servicio OCR para convertir documentos PDF escaneados en texto plano, habilitando la búsqueda de texto completo.
- Integración en pipelines de automatización de documentos: al ser compatible con text-generation-inference y transformadores, puede usarse en flujos de trabajo de backend para procesar lotes de imágenes y extraer texto de forma masiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni métricas de OCR (como CER o WER) que permitan comparar este modelo con otras alternativas. Cualquier evaluación de rendimiento debe realizarse de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: con los pesos en BF16/FP16 se requieren aproximadamente 9.3 GB solo para los parámetros, más memoria para activaciones y el procesamiento de imágenes, por lo que se recomienda al menos 16 GB de VRAM.
- Con cuantización a 4 bits (si se aplica, por ejemplo mediante bitsandbytes o GPTQ), la carga de pesos podría reducirse a unos 2.5-3 GB, permitiendo la ejecución en GPUs de 8 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o superiores para ejecución sin cuantizar. En GPUs de consumo como RTX 3060 de 12 GB podría ejecutarse con cuantización.
- Opciones de despliegue: es compatible con la librería transformers de Hugging Face y con text-generation-inference. También puede convertirse a GGUF para usar con llama.cpp u Ollama, aunque no se ha verificado esta conversión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| SeeWye/qwen3_5_automata_ocr_merged1 | 4.66B | Imagen-texto a texto (OCR) | Apache 2.0 | No disponible | Finetune de Qwen3.5-4B para OCR, sin benchmarks publicados |
| Qwen2-VL-2B | 2.2B | Vision-language | Apache 2.0 | 128k | Modelo multimodal generalista de menor tamaño, con buena documentación y benchmarks |
| GOT-OCR2.0 | 580M | Solo OCR | Apache 2.0 | No disponible | Modelo ligero especializado en OCR, de menor capacidad pero muy rápido |
| syntheticbot/ocr-qwen | No disponible | Vision-language | No disponible | No disponible | Modelo OCR alternativo basado en Qwen, encontrado en Hugging Face, sin datos concretos |

La comparación es limitada por la falta de datos de rendimiento. El modelo aquí descrito ofrece un punto intermedio de tamaño frente a modelos más pequeños como GOT-OCR2.0 y más grandes como Qwen2-VL-7B, pero su valor real no puede verificarse sin pruebas.

## Limitaciones y advertencias

- Sesgos: no se ha realizado ninguna evaluación de sesgos; el finetune puede heredar sesgos del modelo base o introducir otros propios del dataset de entrenamiento desconocido.
- Riesgo de alucinación: al ser un modelo generativo, puede producir texto que no aparece en la imagen, especialmente en documentos con baja calidad o texto ambiguo.
- Limitaciones de idioma: solo se declara soporte para inglés. La extracción de texto en otros idiomas no está garantizada.
- Restricciones de licencia: Apache 2.0 es permisiva y permite uso comercial, pero no se han documentado atribuciones adicionales ni restricciones de patentes.
- Documentación insuficiente: no hay información sobre el dataset de entrenamiento, las técnicas de alineación ni los límites de contexto, lo que dificulta la evaluación para producción.
- Validación: no se han publicado resultados de benchmarks, por lo que se desconoce la calidad real frente a modelos OCR consolidados.

## Enlaces

- Hugging Face: https://huggingface.co/SeeWye/qwen3_5_automata_ocr_merged1
- Artículo de referencia sobre uso de Qwen 3.5 para OCR: https://martinalderson.com/posts/how-to-use-qwen-3-5-to-ocr-documents/
- Modelo OCR alternativo encontrado en la búsqueda: https://huggingface.co/syntheticbot/ocr-qwen
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
