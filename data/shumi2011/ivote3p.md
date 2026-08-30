# shumi2011/ivote3p

## Resumen

El modelo `shumi2011/ivote3p` es un checkpoint del sistema Vision-Language `iVote3C-VLM` versión 1.0, desarrollado por Tuan Pham (usuario `shumi2011`) como parte del proyecto personal `iVote3P`. Se trata de un modelo de generación de texto a partir de imágenes (image-to-text) especializado en OCR de texto vietnamita, entrenado sobre un conjunto de datos sintético generado con fuentes DejaVu Sans/Serif. El checkpoint corresponde a la etapa final (stage 18, step 800) de un currículo de entrenamiento de 19 pasos.

Arquitectónicamente combina un modelo de lenguaje tipo GPT personalizado (`iVoteModel`) con una torre de visión entrenada desde cero (scratch) que utiliza atención de ventana local. El modelo tiene aproximadamente 199 millones de parámetros (199.048.576 según los pesos safetensors) y una longitud de contexto de 2048 tokens. Su relevancia radica en ser un ejemplo de VLM compacto y entrenado desde cero para una tarea específica (OCR vietnamita), aunque su carácter experimental y su dependencia de un código base externo limitan su uso directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | iVoteModel (GPT-like, custom) + vision tower scratch (local-window attention) |
| Parametros totales | 199.048.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (entrenado para OCR en vietnamita; no se especifican otros) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina un decodificador Transformer tipo GPT con una torre de visión independiente. El componente de lenguaje (`iVoteModel`) tiene 18 capas, dimensión de embedding de 640, dimensión oculta de 2048, 10 cabezas de atención con dimensión de cabeza de 64 y 2 grupos KV. Incluye además un módulo MTP (Multi-Token Prediction) con profundidad 1. La torre de visión procesa imágenes de 224x224 píxeles con parches de 16x16, usando 12 capas, dimensión 768 y 12 cabezas de atención con atención de ventana local. El conector entre visión y lenguaje es un proyector MLP2 con un adaptador afín de bajo rango (rank=8).

El entrenamiento se realizó sobre un dataset OCR vietnamita personalizado, compuesto por imágenes sintéticas generadas con fuentes DejaVu Sans/Serif, centrado en tres modos de lectura: lectura normal, lectura inversa y no lectura. El tokenizer es un BPE personalizado entrenado con datos en vietnamita. El proceso de entrenamiento siguió un currículo de 19 etapas (Step0 a Step18), siendo este checkpoint la última etapa. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- OCR de texto vietnamita en imágenes, con soporte para lectura en orientación normal e inversa (rotada).
- Generación de texto condicionada por imagen (image-to-text).
- Capacidad de distinguir entre imágenes con texto legible y sin texto (modo "no lectura").
- Tokenización BPE específica para vietnamita.
- Fine-tuning posible sobre el código base del proyecto `iVote3P` (no incluido en el repositorio).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, ni soporte multilingüe más allá del vietnamita.

## Casos de uso

- Digitalización de documentos vietnamitas: el modelo puede transcribir texto impreso en vietnamita a partir de escaneos o fotografías, útil para archivos históricos o administrativos.
- Procesamiento de formularios en vietnamita: extracción de campos de texto en formularios impresos, siempre que el texto esté en orientación normal o inversa.
- Verificación de calidad de imágenes: el modo "no lectura" permite detectar si una imagen contiene texto legible o no, útil en pipelines de preprocesado.
- Prototipado de sistemas OCR para vietnamita: al ser un modelo pequeño (199M parámetros), puede servir como base para experimentos de fine-tuning en tareas específicas.
- Investigación académica: como ejemplo de VLM compacto entrenado desde cero con currículo progresivo, puede usarse para estudiar dinámicas de entrenamiento multimodal.
- Demostraciones educativas: su tamaño reducido permite ejecutarlo en hardware modesto para ilustrar conceptos de visión-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni evaluaciones de OCR estándar (p. ej., CER o WER sobre conjuntos públicos).

## Requisitos de hardware

- Con 199 millones de parámetros, el modelo es relativamente pequeño. En precisión FP32 ocuparía aproximadamente 796 MB de memoria, y en FP16 unos 398 MB.
- Es viable en GPUs de consumo como RTX 3060 (12 GB) o superiores, e incluso en CPU para inferencia lenta.
- No se proporcionan datos oficiales de VRAM, latencia ni throughput.
- El despliegue requiere el código de arquitectura del proyecto `iVote3_P` (no incluido en el repositorio), por lo que no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin adaptaciones.
- Se recomienda usar PyTorch con soporte CUDA para acelerar la inferencia.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables de la misma categoría (VLM compactos para OCR vietnamita) en la información proporcionada. Modelos OCR generalistas como TrOCR o PaddleOCR no son directamente comparables por su arquitectura y enfoque.

## Limitaciones y advertencias

- Modelo experimental: es un checkpoint de un proyecto personal, sin garantías de robustez ni soporte.
- Entrenado exclusivamente con imágenes sintéticas de fuentes DejaVu Sans/Serif; el rendimiento con texto manuscrito, fuentes reales o imágenes de baja calidad es desconocido.
- Contexto limitado a 2048 tokens, lo que restringe el procesamiento de documentos largos.
- Solo cubre OCR en vietnamita; no se ha evaluado en otros idiomas.
- Licencia no especificada: no se puede determinar si es de uso libre para fines comerciales.
- El repositorio no incluye el código de arquitectura; es necesario obtener el proyecto `iVote3_P` por separado para cargar el modelo.
- Riesgo de alucinación en la generación de texto, especialmente si la imagen no contiene texto legible.
- No se han publicado evaluaciones de sesgos ni de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shumi2011/ivote3p
- Perfil del autor: https://huggingface.co/shumi2011
- Datasets del autor: https://huggingface.co/shumi2011/datasets
