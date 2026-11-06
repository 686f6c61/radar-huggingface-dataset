# litert-community/Qwen2.5-VL-72B-Instruct-LiteRT

## Resumen

Qwen2.5-VL-72B-Instruct-LiteRT es una conversión del modelo vision-language Qwen2.5-VL-72B-Instruct de Qwen al formato LiteRT-LM (sucesor de TensorFlow Lite), publicada por la organización litert-community en Hugging Face. El objetivo de esta conversión es llevar un modelo multimodal de gran tamaño (72B parámetros) a la ejecución en dispositivo (on-device), concretamente sobre GPU de Apple Silicon mediante WebGPU, sin depender de servidores en la nube.

El modelo original es un sistema image-text-to-text que procesa texto, imágenes y vídeo (aunque en esta conversión el vídeo no está soportado). La versión LiteRT cuantiza los pesos del decodificador de texto a int4 con bloques de 128, manteniendo el codificador de visión en fp32, y empaqueta todo en un único archivo `.litertlm` de 44,8 GB con tokenizador y plantilla de chat incluidos.

Su relevancia actual radica en demostrar que modelos de 72B parámetros pueden ejecutarse localmente en hardware de consumidor de gama alta: sobre la GPU de un Apple M4 Max alcanza 8,31 tokens/s de decodificación y 63,6 tokens/s de prefill, con un contexto limitado a 2.048 tokens en esta variante. Es una ficha técnica interesante para desarrolladores que exploran inferencia multimodal local con la pila LiteRT-LM de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador de texto Qwen2 de 80 capas + codificador de vision de 32 capas (multimodal) |
| Parametros totales | 72B (modelo base Qwen2.5-VL-72B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (cache KV en este archivo) |
| Tipos de cuantizacion | int4 blockwise (128 por bloque) en pesos del decodificador; int8 en capa de salida y tabla de embeddings; fp32 en codificador de vision y adaptador; activaciones declaradas fp32 |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas, pero la ficha no lo especifica) |
| Licencia | Qwen LICENSE AGREEMENT (other / qwen) |
| Formato de pesos | .litertlm (LiteRT-LM, basado en TFLite) |

## Arquitectura y entrenamiento

La arquitectura combina un decodificador de texto Qwen2 de 80 capas con tamaño oculto de 8.192, 64 cabezas de consulta y 8 cabezas clave-valor (GQA), junto a un codificador de vision de 32 capas. El modelo base lee texto, imágenes y vídeo; esta conversión, sin embargo, está limitada a una imagen por conversación a resolución fija de 448 × 448, que se convierte en 256 tokens de imagen. No hay soporte de vídeo en este archivo.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no hay datos en la información disponible. En cuanto a la conversión: se realizó con la LiteRT Tensor API para el decodificador de texto, litert-torch 0.10.0 para el codificador de visión y la tabla de tokens, ai-edge-quantizer 0.10.0 y litert-lm-builder 0.19.0 para LiteRT-LM 0.19.0. El archivo incluye firmas de prefill de 32 / 128 / 1.024 tokens y decodificación sobre una cache KV de 2.048 tokens.

## Capacidades

- Comprensión y generación de texto multimodal (image-text-to-text): responde preguntas sobre imágenes.
- Entrada de imagen a resolución fija 448 × 448 (256 tokens de imagen), una imagen por conversación.
- No soporta vídeo en este archivo convertido.
- Plantilla de chat incluida; sin mensaje de sistema usa el defecto del modelo original ("You are a helpful assistant.").
- Muestreo greedy por defecto (top-k 1, top-p 1.0), coherente con el generation_config del modelo original (temperatura 0,000001); el penalty de repetición de 1,05 del original no está incorporado y debe pasarse por mensaje si se desea.
- Ejecución on-device en GPU vía WebGPU (y CPU) con la API Python de LiteRT-LM.
- No hay información sobre tool calling, agentes ni modo de razonamiento extendido en la documentación disponible.

## Casos de uso

- Analisis local de fotografias con privacidad: al ejecutarse íntegramente en el dispositivo, permite responder preguntas sobre imágenes ("¿cuántos gatos hay en esta foto?") sin enviar datos a la nube, adecuado para fotos personales o sensibles.
- Prototipado de apps multimodales on-device en Apple Silicon: la API Python de LiteRT-LM permite integrar el motor en aplicaciones macOS con backend GPU (WebGPU) y vision backend en GPU.
- Evaluacion de cuantizacion int4 en modelos grandes: útil como banco de pruebas para medir el impacto de la cuantización blockwise int4 sobre un modelo de 72B en latencia y calidad.
- Asistente de descripcion de imagenes en flujos de trabajo offline: entornos sin conectividad (laboratorios, despliegues air-gapped) donde se necesita etiquetado o descripción de imágenes puntuales.
- Pruebas de rendimiento de inferencia local: el archivo incluye mediciones de prefill, decode y memoria que sirven como referencia para comparar backends GPU frente a CPU en LiteRT-LM.
- Investigacion en Vision-Language Models embebidos: base para experimentar con adaptadores y codificadores de visión en fp32 junto a decodificadores cuantizados dentro del ecosistema LiteRT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, etc.) en la información disponible. Sí hay mediciones de rendimiento de inferencia en un Apple M4 Max (128 GB, macOS 27.0), con litert-lm 0.19.0, una imagen de 448 × 448 y pregunta corta (284–290 tokens de prompt, 256 de ellos la imagen), muestreo greedy:

| Backend | Prefill (tok/s) | Decode (tok/s) | Time to first token (s) | First text (s) | Follow-up: first text (s) | Memoria pico |
|---|---:|---:|---:|---:|---:|---|
| GPU (vision en GPU, este archivo) | 63,6 | 8,31 | 4,60 | 4,75 / 5,41 | 0,96 | 46 GiB (footprint) |
| CPU (build anterior, mismos pesos) | 5,6 / 5,2 | 2,22 / 2,40 | 51,1 / 56,1 | 52,0 / 57,5 | no disponible | 4,9 GiB (footprint); 70 GiB residente |

Notas: la fila GPU es la mediana de tres preguntas en conversaciones nuevas (decode 8,27–8,33; prefill 58,1–65,4). La primera pregunta de un proceso construye los programas GPU del codificador de visión (7,7 s adicionales). La creación del motor tardó 14,3 s con el archivo ya en memoria; leerlo desde disco USB tomó unos 5 minutos. La fila CPU proviene de un build anterior con cache KV de 4.096 tokens, 3,5–3,7 veces más lento en decodificación.

## Requisitos de hardware

- Memoria: footprint pico de 46 GiB en GPU (Apple M4 Max, 128 GB de memoria unificada); en CPU se observaron 4,9 GiB de footprint con ~70 GiB residentes (casi todo archivos mapeados de pesos y cache).
- GPU recomendada: GPU de Apple Silicon (probado en Apple M4 Max) mediante el path WebGPU de LiteRT-LM 0.19.0. No hay datos sobre GPUs NVIDIA/AMD.
- Consumer GPU: cabe en un Apple M4 Max de 128 GB; no hay datos sobre viabilidad en GPUs de consumidor con memoria dedicada (una RTX 4090 de 24 GB no bastaría para los 44,8 GB del archivo).
- Despliegue: exclusivamente mediante LiteRT-LM 0.19.0 (pip install litert-lm==0.19.0), con API Python y backends GPU o CPU. No aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia: primer token en 4,6 s (GPU) tras prefill de ~290 tokens; 0,96 s para una pregunta de seguimiento sobre la misma imagen. Decodificación de 8,31 tokens/s en GPU y ~2,2–2,4 tokens/s en CPU.
- Almacenamiento: 44,8 GB para el archivo del modelo; se recomienda SSD local (leerlo desde USB tardó ~5 minutos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Ejecucion | Licencia |
|---|---|---|---|---|---|
| Qwen2.5-VL-72B-Instruct-LiteRT | 72B | 2.048 tokens | .litertlm (int4) | On-device, Apple Silicon (WebGPU) | Qwen LICENSE AGREEMENT |
| Qwen/Qwen2.5-VL-72B-Instruct (base) | 72B | no disponible en la info proporcionada | safetensors | Servidor / GPU datacenter | Qwen LICENSE AGREEMENT |
| Alternativas VLM on-device comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No hay datos suficientes en la información proporcionada para una comparativa de rendimiento detallada con otros VLM convertidos a LiteRT-LM.

## Limitaciones y advertencias

- Contexto muy reducido: 2.048 tokens en este archivo, de los cuales 256 los consume cada imagen; insuficiente para documentos largos o conversaciones extensas.
- Resolución de imagen fija a 448 × 448 sin conservar la relación de aspecto (el redimensionado bicúbico estira la imagen), lo que puede degradar la calidad frente al modelo original con resolución dinámica.
- Una sola imagen por conversación en las pruebas; el vídeo no está soportado en este archivo.
- El penalty de repetición de 1,05 del modelo original no está incorporado; sin él pueden aparecer repeticiones en generaciones largas.
- La primera ejecución de un proceso añade ~7,7 s de compilación de programas GPU del codificador de visión; la carga desde disco lento puede tardar minutos.
- Riesgo de alucinación: no hay datos específicos publicados para esta conversión; como todo VLM, puede describir incorrectamente el contenido de las imágenes.
- Sesgos: no documentados en la información disponible; hereda los del modelo base Qwen2.5-VL.
- Licencia: la Qwen LICENSE AGREEMENT impone condiciones de atribución y restricciones de uso (requisitos de NOTICE); conviene revisarla antes de cualquier despliegue comercial.
- Proyecto con tracción muy limitada (13 descargas, 1 like en el momento de la ficha): madurez y soporte comunitario escasos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/litert-community/Qwen2.5-VL-72B-Instruct-LiteRT
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-72B-Instruct
- Licencia: https://huggingface.co/litert-community/Qwen2.5-VL-72B-Instruct-LiteRT/blob/main/LICENSE
- LiteRT-LM en PyPI: https://pypi.org/project/litert-lm/
- Paper, blog o demo oficial: no disponible en la información proporcionada.
