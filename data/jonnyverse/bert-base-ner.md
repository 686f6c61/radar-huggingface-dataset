# JONNYVERSE/bert-base-NER

## Resumen

El modelo `JONNYVERSE/bert-base-NER` es una conversión a formato ONNX del modelo `dslim/bert-base-NER`, preparada específicamente para su uso con la librería Transformers.js en entornos JavaScript y navegadores. El modelo original es un BERT base (cased) fine-tuneado para reconocimiento de entidades nombradas (NER), capaz de identificar cuatro tipos de entidades: localizaciones (LOC), organizaciones (ORG), personas (PER) y misceláneas (MISC). Esta versión ONNX permite ejecutar inferencias directamente en el cliente, sin necesidad de servidor, aprovechando las capacidades de WebAssembly o WebGPU.

La relevancia de este modelo radica en su facilidad de integración en aplicaciones web y de escritorio basadas en JavaScript, manteniendo las capacidades de un BERT base de 110 millones de parámetros con una ventana de contexto de 512 tokens. Es una opción ligera y eficiente para tareas de extracción de información en tiempo real, con un tamaño de repositorio de 1,9 GB que incluye los pesos ONNX. El modelo se publicó en agosto de 2026 y no especifica licencia ni idiomas en su ficha, aunque el modelo base está entrenado principalmente en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (Transformer encoder) |
| Parametros totales | 110 millones (aproximadamente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos ONNX en precisión flotante, probablemente fp32) |
| Idiomas soportados | inglés (según el modelo base, aunque no se declara en el repo) |
| Licencia | no disponible |
| Formato de pesos | ONNX (para Transformers.js) |

## Arquitectura y entrenamiento

El modelo base `dslim/bert-base-NER` es un BERT base con configuración cased (distingue mayúsculas y minúsculas), compuesto por 12 capas de transformer, 12 cabezas de atención y una dimensión oculta de 768. Fue fine-tuneado sobre el dataset CoNLL-2003 para la tarea de token classification, reconociendo las etiquetas LOC, ORG, PER y MISC. El entrenamiento se realizó con el esquema estándar de BERT (masked language modeling y next sentence prediction) seguido de fine-tuning supervisado para NER.

La conversión a ONNX se realizó mediante la herramienta Optimum de Hugging Face, manteniendo la misma arquitectura y pesos. No se introdujeron innovaciones técnicas adicionales; el objetivo es la compatibilidad con Transformers.js para ejecución en navegador. El repositorio incluye los pesos ONNX en una subcarpeta `onnx`, siguiendo las recomendaciones oficiales para modelos web-ready.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en texto: identifica localizaciones, organizaciones, personas y entidades misceláneas.
- Token classification: asigna una etiqueta a cada token del texto de entrada.
- Inferencia en navegador o Node.js mediante Transformers.js, sin necesidad de backend.
- Compatible con pipelines de Hugging Face (`token-classification`).
- Procesamiento de texto en inglés (el modelo base fue entrenado con datos en inglés).
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo discriminativo de clasificación de tokens.

## Casos de uso

- Extracción de entidades en formularios web: el modelo puede procesar texto introducido por usuarios en tiempo real y extraer nombres, lugares u organizaciones, útil para autocompletar campos o validar datos.
- Análisis de documentos legales o financieros: identificación de partes involucradas, ubicaciones y organizaciones en contratos o informes, directamente en el navegador sin enviar datos sensibles a un servidor.
- Chatbots de atención al cliente: extracción de entidades de las consultas de los usuarios para enrutar solicitudes o rellenar bases de conocimiento.
- Procesamiento de redes sociales: detección de menciones de marcas, personas o lugares en publicaciones para monitorización de reputación.
- Herramientas de investigación académica: extracción de entidades de artículos científicos para construir bases de datos estructuradas.
- Aplicaciones de asistencia personal: reconocimiento de lugares y personas en notas o correos para sugerir acciones (por ejemplo, añadir un evento al calendario).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original `dslim/bert-base-NER` reporta un F1 de aproximadamente 90,9 en el conjunto de validación de CoNLL-2003, pero este dato no aparece en la ficha del repositorio convertido. No se incluyen comparaciones con otros modelos en la documentación proporcionada.

## Requisitos de hardware

- Inferencia en CPU: el modelo requiere aproximadamente 440 MB de memoria en precisión fp32 (110M parámetros × 4 bytes). Funciona en navegadores con WebAssembly, aunque la velocidad depende del dispositivo.
- Inferencia en GPU: si se usa WebGPU, puede acelerarse significativamente. Una GPU integrada o dedicada moderna es suficiente.
- VRAM estimada: ~440 MB en fp32; si se cuantiza a int8 (no disponible en este repo), podría reducirse a ~110 MB.
- GPUs recomendadas: cualquier GPU compatible con WebGPU (por ejemplo, integradas Intel o AMD, o discretas NVIDIA/AMD). También puede ejecutarse en CPU sin GPU.
- Opciones de despliegue: Transformers.js (npm), ejecución en Node.js o navegador. No está preparado para vLLM, llama.cpp u Ollama al ser un modelo ONNX específico para JS.
- Latencia: en CPU, una inferencia típica sobre un texto corto (< 100 tokens) puede tardar entre 50 y 200 ms en un ordenador moderno; en GPU, puede ser inferior a 10 ms.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|---|
| JONNYVERSE/bert-base-NER (este) | BERT base | 110M | 512 | NER | no disponible | ONNX |
| dslim/bert-base-NER | BERT base | 110M | 512 | NER | Apache 2.0 (según fuente original) | PyTorch, TF |
| dbmdz/bert-large-cased-finetuned-conll03-english | BERT large | 340M | 512 | NER | MIT | PyTorch |
| xlm-roberta-large-finetuned-conll02-dutch | XLM-R large | 560M | 512 | NER (multilingüe) | MIT | PyTorch |

Nota: los datos de licencia y parámetros de los modelos comparados provienen de fuentes públicas, pero no se han verificado en la información proporcionada. La comparativa se basa en el modelo base, no en la conversión ONNX.

## Limitaciones y advertencias

- El modelo solo reconoce entidades en inglés; no es multilingüe.
- La ventana de contexto está limitada a 512 tokens, por lo que textos largos deben truncarse o dividirse.
- No se especifica la licencia del repositorio convertido, lo que puede generar incertidumbre legal para uso comercial; se recomienda consultar la licencia del modelo base (dslim/bert-base-NER) que es Apache 2.0.
- El modelo puede presentar sesgos derivados de los datos de entrenamiento (CoNLL-2003), como subrepresentación de ciertos tipos de entidades o variantes de nombres no occidentales.
- Riesgo de alucinación en la clasificación de tokens: puede asignar etiquetas incorrectas a palabras ambiguas o fuera de dominio.
- Al ser una conversión ONNX, no se incluyen pesos en formato safetensors ni otros formatos; solo es utilizable con Transformers.js u otras herramientas que acepten ONNX.
- No se han publicado métricas de rendimiento específicas para esta conversión, por lo que se asume que replica el comportamiento del modelo original, pero no se garantiza.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JONNYVERSE/bert-base-NER
- Modelo original (dslim/bert-base-NER): https://huggingface.co/dslim/bert-base-NER
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Herramienta Optimum para conversión ONNX: https://huggingface.co/docs/optimum/index
- Referencia de Open Model Zoo (descripción del modelo original): https://github.com/openvinotoolkit/open_model_zoo/blob/master/models/public/bert-base-ner/README.md
