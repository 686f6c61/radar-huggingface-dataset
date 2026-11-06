# K-Ai-Official/K-Oss-8-Mini-Instruct

## Resumen

K-Oss-8-Mini-Instruct es un adaptador LoRA publicado por K-Ai (Kortex AI) sobre el modelo base Qwen/Qwen3-VL-8B-Instruct, desarrollado por el equipo Qwen de Alibaba Cloud. No se trata de un modelo completo, sino de un ajuste fino ligero que anade una identidad propia ("K-Ai") y adaptacion linguistica sobre las capacidades multimodales ya presentes en el modelo base. El repositorio contiene unicamente los pesos del adaptador (0,2 GB) y requiere descargar el modelo base para su uso.

El modelo hereda del base la arquitectura transformer multimodal de Qwen3-VL, con capacidad de procesar imagen y texto (pipeline image-text-to-text), y esta orientado a comprension de imagenes, respuesta a preguntas visuales (VQA), OCR, razonamiento matematico y cientifico, y seguimiento de instrucciones generales en ingles, indonesio y japones.

Su relevancia actual es limitada: el entrenamiento consistio en solo 5 pasos sobre 36 ejemplos (24 con imagen y 12 de identidad), lo que lo convierte en una prueba de concepto de personalizacion mas que en un modelo listo para produccion. La evaluacion publicada es un smoke test de pocos elementos, no un benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal Qwen3-VL-8B-Instruct (vision-lenguaje) |
| Parametros totales | 8B en el modelo base; el adaptador LoRA ocupa 0,2 GB (r=16, alpha=16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-VL-8B-Instruct) |
| Tipos de cuantizacion | QLoRA 4-bit durante el entrenamiento; inferencia con `load_in_4bit=True` via Unsloth; otras cuantizaciones no disponibles |
| Idiomas soportados | en, id, ja |
| Licencia | apache-2.0 (adaptador); revisar licencias de los datasets por separado |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3-VL-8B-Instruct, un transformer multimodal que combina una torre de vision con un modelo de lenguaje para tareas image-text-to-text. El ajuste emplea QLoRA en 4 bits con la libreria Unsloth, con rango LoRA r=16 y alpha=16. Se entrenan las capas de lenguaje y los modulos MLP y de atencion, mientras que la torre de vision permanece congelada. El entrenamiento se ejecuto en Google Colab sobre una NVIDIA T4 (16 GB) en fp16.

El volumen de entrenamiento es minimo: 5 pasos con batch 1 y acumulacion de gradientes 8, sobre 36 ejemplos en total (24 con imagenes y 12 de identidad). Las fuentes de datos son sinteticas (24) e identidad (12). No se documenta el numero de tokens de entrenamiento ni el uso de RLHF/DPO. La innovacion tecnica es escasa: se trata de un ajuste de personalizacion ligero que no modifica la arquitectura del base.

## Capacidades

- Comprension de imagenes y respuesta a preguntas visuales (VQA), heredadas del modelo base.
- OCR y extraccion de texto en imagenes (aunque el smoke test reporta 0/3 en OCR).
- Razonamiento matematico y cientifico multimodal.
- Seguimiento de instrucciones generales en ingles, indonesio y japones.
- Identidad propia "K-Ai" anadida mediante el ajuste.
- Generacion de texto conversacional (pipeline image-text-to-text).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, audio): no disponible; el base es multimodal vision-lenguaje.

## Casos de uso

- Prototipado de asistentes visuales personalizados: util para experimentar con una identidad de marca concreta sobre un modelo multimodal, usando el adaptador junto al base Qwen3-VL-8B-Instruct.
- Pruebas de concepto de VQA en indonesio o japones: permite validar flujos de pregunta-respuesta sobre imagenes en esos idiomas antes de invertir en un ajuste mayor.
- Demostraciones de adaptacion linguistica: sirve para mostrar como un LoRA ligero puede anadir cobertura de idiomas concretos sobre un base ya capaz.
- Investigacion sobre eficiencia de ajuste: ejemplo reproducible de QLoRA con Unsloth en hardware consumer (T4) para estudiar el impacto de pocos pasos de entrenamiento.
- Base para futuros ajustes: el adaptador puede servir como punto de partida o referencia para entrenamientos mas extensos con datos reales.
- Evaluacion comparativa de identidad: util para medir como un fine-tune minimo altera el estilo de respuesta sin degradar tareas basicas (segun el smoke test, las tareas de instruccion y matematica se mantienen 1/1).

## Benchmarks y rendimiento

Smoke test publicado por el autor (pocos elementos, parcialmente sinteticos; no es un benchmark):

| Categoria | Fine-tuned | Base |
|---|---|---|
| instruksi_id | 1/1 | 1/1 |
| instruksi_en | 1/1 | 1/1 |
| instruksi_ja | 1/1 | 1/1 |
| matematika_id | 1/1 | 1/1 |
| matematika_en | 1/1 | 1/1 |
| ocr | 0/3 | 0/3 |
| vqa_matematika_gambar | 0/3 | 0/3 |
| visual_reasoning | 2/3 | 2/3 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador es ligero (0,2 GB), pero requiere cargar el modelo base de 8B. En 4 bits (como en el ejemplo de uso) se estima en torno a 5-6 GB de VRAM; en fp16, en torno a 16 GB. Estas cifras son estimaciones a partir del tamano del base, no datos publicados.
- GPU recomendadas: NVIDIA T4 (16 GB) fue suficiente para el entrenamiento; para inferencia comoda se recomiendan A100, H100 o RTX 4090.
- Cabe en GPU consumer: si, en tarjetas con al menos 8-16 GB segun cuantizacion (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090).
- Opciones de despliegue: Unsloth (documentado en la model card); vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| K-Oss-8-Mini-Instruct | 8B (base) + LoRA | no disponible | apache-2.0 | Hugging Face (adaptador) | Ajuste minimo sobre Qwen3-VL-8B-Instruct |
| Qwen/Qwen3-VL-8B-Instruct | 8B | no disponible | apache-2.0 | Hugging Face | Modelo base sin personalizacion |
| Otros adaptadores LoRA sobre Qwen3-VL | 8B (base) | no disponible | variable | Hugging Face | No disponible comparativa concreta |

No se dispone de datos de rendimiento comparativo con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenamiento muy pequeno (5 pasos, 36 ejemplos): la calidad depende en gran medida de la cantidad de datos multimodales reales y el ajuste puede no generalizar.
- Riesgo de respuestas incorrectas o fabricadas, incluyendo OCR y matematicas (el propio autor lo advierte).
- El smoke test muestra 0/3 en OCR y 0/3 en VQA matematica con imagenes, tanto en el ajustado como en el base.
- No apto para decisiones medicas, legales o financieras.
- Licencias de los datasets: parte de los datos son generados por GPT-4 y deben revisarse antes de uso comercial.
- Cobertura linguistica limitada a en, id y ja; el castellano no esta declarado.
- El repositorio contiene solo el adaptador; es imprescindible descargar el modelo base.
- La model card menciona la ruta "Keanualfahd/K-Oss-8-Mini-Instruct" en el ejemplo de uso, distinta del ID del repositorio; verificar la ruta correcta antes de cargar.
- Sin datos publicados sobre tool calling, agentes o contexto maximo.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/K-Ai-Official/K-Oss-8-Mini-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Unsloth (libreria de entrenamiento e inferencia): https://github.com/unslothai/unsloth
- PEFT (libreria de adaptadores): https://github.com/huggingface/peft
