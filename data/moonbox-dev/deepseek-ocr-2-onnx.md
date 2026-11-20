# moonbox-dev/DeepSeek-OCR-2-ONNX

## Resumen

DeepSeek-OCR-2-ONNX es la conversión a formato ONNX del modelo DeepSeek-OCR-2, un modelo visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) y parseo de documentos. La conversión la ha realizado el usuario moonbox-dev, no el equipo de DeepSeek, y está pensada para su uso con ONNX Runtime en CPU, CUDA y DirectML, lo que facilita el despliegue en dispositivos finales y entornos sin dependencia de PyTorch.

El modelo base, DeepSeek-OCR-2, es un modelo de arquitectura MoE (mixture of experts) que combina un codificador visual basado en SAM (Segment Anything Model) con un decodificador de lenguaje. El pipeline se divide en varios grafos ONNX independientes: el codificador visual (sam_768 y sam_1024), el módulo de embeddings, un módulo "flow" y el decodificador autorregresivo. Esta modularidad permite ejecutar cada etapa por separado en ONNX Runtime.

La relevancia de esta ficha radica en que ofrece una alternativa cuantizada y portable para tareas de digitalización de documentos, con precisiones fp16, int8 e int4, y una licencia Apache 2.0 que permite uso comercial. El repositorio ocupa 12,4 GB e incluye los grafos, tokenizador y un script `pipeline.py` que gestiona el preprocesado de imagen, el prompt, las posiciones y el bucle de decodificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje con codificador visual tipo SAM y decodificador transformer; el modelo base es MoE (mixture of experts) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base es MoE, pero no se especifica el número de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, int8, int4 |
| Idiomas soportados | no disponible (la model card menciona evaluación CER "por idioma" sin detallar cuáles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos `.onnx` con datos externos `.onnx.data`), tokenizador JSON |

## Arquitectura y entrenamiento

La arquitectura del modelo base DeepSeek-OCR-2 combina un codificador visual basado en SAM (con variantes de entrada a 768 y 1024 píxeles) con un decodificador de lenguaje de tipo transformer y mezcla de expertos (MoE). La conversión a ONNX separa el pipeline en cinco componentes: `sam_768.onnx` y `sam_1024.onnx` para la codificación visual, `embed.onnx` para los embeddings, `flow.onnx` para el módulo intermedio de flujo y `decoder.onnx` para la generación autorregresiva. El script `pipeline.py` orquesta el preprocesado de imagen, la construcción del prompt, el cálculo de posiciones y el bucle de decodificación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La model card de esta conversión no detalla estos aspectos y se limita a describir el proceso de exportación y los resultados de fidelidad respecto al original. La innovación técnica destacable de esta versión es la modularidad en grafos ONNX independientes y la disponibilidad de tres precisiones con verificación de fidelidad (CER 0,0 % e idéntico texto respecto al original en bf16 para fp16 e int8).

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos, con evaluación de tasa de error de caracteres (CER).
- Parseo de documentos: extracción de texto estructurado a partir de páginas escaneadas o fotografías.
- Procesamiento visión-lenguaje: el pipeline es de tipo `image-text-to-text`, por lo que acepta imagen y prompt textual.
- Ejecución en ONNX Runtime con soporte para CPU, CUDA y DirectML.
- Tres niveles de precisión (fp16, int8, int4) que permiten ajustar el equilibrio entre calidad y requisitos de memoria.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, audio ni modos de pensamiento explícitos.

## Casos de uso

- Digitalización masiva de archivos administrativos: el modelo procesa páginas escaneadas y devuelve el texto reconocido; la versión int8 (2,95 GB de decodificador) permite ejecutarlo en servidores sin GPU dedicada mediante ONNX Runtime en CPU.
- Extracción de texto en aplicaciones de escritorio: con DirectML y la variante int8 o int4, se puede integrar en herramientas Windows para digitalizar documentos localmente sin enviar datos a la nube.
- Procesamiento por lotes en pipelines documentales: el script `pipeline.py` y los grafos separados permiten encadenar la codificación visual y la decodificación en un servicio de colas para grandes volúmenes de PDF convertidos a imagen.
- Digitalización en dispositivos con recursos limitados: la cuantización int4 reduce el peso del decodificador a unos 93,5 kB de grafo más los datos externos, lo que facilita el despliegue en equipos con poca VRAM o RAM.
- Verificación de fidelidad en migraciones de modelos: dado que la model card reporta CER 0,0 % e idéntico texto frente al original en bf16, sirve para validar que una migración de PyTorch a ONNX no degrada la calidad del OCR.
- Integración en flujos de accesibilidad: conversión de documentos escaneados a texto legible para lectores de pantalla, ejecutando el modelo en local con ONNX Runtime y evitando el envío de documentos confidenciales a servicios externos.

## Benchmarks y rendimiento

La model card incluye una comparación de fidelidad frente al modelo original (en bf16) medida como tasa de error de caracteres (CER) por idioma y frente a la propia salida del original:

| Precision | Tamano decodificador | CER vs texto de pagina | CER vs salida original | Texto | Tiempo por pagina (CUDA) |
|---|---|---|---|---|---|
| fp16 | 5,54 GB | 0,0 % / 0,0 % | 0,0 % / 0,0 % | identico | 2,01 s |
| int8 | 2,95 GB | 0,0 % / 0,0 % | 0,0 % / 0,0 % | identico | 2,39 s |
| int4 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos anteriores son métricas de fidelidad de la conversión, no de capacidad del modelo.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 12,4 GB, pero cada precisión se puede cargar por separado. La variante fp16 suma aproximadamente 6,9 GB de pesos (decodificador 5,54 GB, flow 719,7 MB, embed 331 MB, SAM 190,5 MB + 187,9 MB); la variante int8 suma aproximadamente 3,7 GB; la variante int4 no está detallada en la información disponible.
- GPU recomendadas: no se especifican modelos concretos; la model card menciona ejecución en CUDA y DirectML. Por tamaño, una RTX 4090 (24 GB) o A100/H100 pueden ejecutar la variante fp16 con holgura; la variante int8 cabe en GPUs consumer de 8 GB o menos.
- Cabe en GPU consumer: sí, especialmente las variantes int8 e int4; la fp16 requiere al menos unos 7 GB de VRAM solo para pesos, más memoria para activaciones.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML) mediante el `pipeline.py` incluido. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2,01 s por página en CUDA con fp16 y 2,39 s por página en CUDA con int8, según la model card. No se reportan cifras para CPU ni para int4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-OCR-2-ONNX (este) | no disponible (MoE) | no disponible | Apache 2.0 | ONNX (fp16/int8/int4) | Conversion comunitaria para ONNX Runtime |
| DeepSeek-OCR-2 (original) | no disponible (MoE) | no disponible | no disponible en la informacion | PyTorch/safetensors (no confirmado) | Modelo base de referencia en bf16 |
| Alternativas OCR vision-lenguaje | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (por ejemplo, otros modelos OCR vision-lenguaje) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La conversión es comunitaria (moonbox-dev), no oficial de DeepSeek; la fidelidad se ha verificado solo frente a una muestra y en bf16, sin detallar el conjunto de evaluación.
- No se documentan los idiomas soportados ni el rendimiento por idioma, pese a que la model card menciona CER "por idioma".
- No se dispone de datos sobre sesgos del modelo base ni sobre su tasa de alucinación en documentos con baja calidad de imagen.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base DeepSeek-OCR-2, que no se detalla en la información disponible.
- El repositorio incluye grafos separados y un script Python; no es un paquete autocontenido tipo `transformers`, por lo que requiere integrar manualmente el pipeline en producción.
- No se reportan cifras de latencia en CPU ni en int4, lo que limita la planificación de despliegues sin GPU.
- El modelo está especializado en OCR y parseo de documentos; no se documentan capacidades generales de razonamiento, código o agentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/DeepSeek-OCR-2-ONNX
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-OCR-2
- Paper referenciado (arXiv:2601.20552): no disponible como enlace directo en la información proporcionada
- Paper referenciado (arXiv:2510.18234): no disponible como enlace directo en la información proporcionada
