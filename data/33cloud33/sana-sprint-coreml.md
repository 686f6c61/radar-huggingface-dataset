# 33cloud33/Sana-Sprint-CoreML

## Resumen

Sana-Sprint-CoreML es una conversión no oficial a Core ML del modelo de difusión texto-a-imagen SANA-Sprint 1.6B (1024 px), desarrollado originalmente por NVIDIA y el MIT Han Lab. La conversión la firma el usuario 33cloud33 y su objetivo es ejecutar generación de imágenes en el Neural Engine de un iPhone, es decir, inferencia completamente local en dispositivo sin depender de servidores. El modelo base es `Efficient-Large-Model/Sana_Sprint_1.6B_1024px_diffusers`.

La relevancia de esta ficha es doble: por un lado documenta un pipeline de conversión Core ML de un modelo de difusión de 1.6B parámetros en varios artefactos (encoder de texto, transformer de difusión, VAE encoder y decoder); por otro, permite generar imágenes de 1024×1024 en 1, 2 o 4 pasos mediante muestreo por consistencia TrigFlow, lo que reduce drásticamente el coste de inferencia frente a los pipelines de difusión tradicionales de decenas de pasos.

Arquitectónicamente combina un encoder de prompt basado en Gemma-2-2B (cuantizado a 8 bits y dividido en cuatro chunks que corren en CPU) con un diffusion transformer de atención lineal (SanaDiT, cuatro chunks, 8 bits, Neural Engine) y un VAE DC-AE (f32c32). El paquete no incluye pesos en safetensors ni GGUF: son ficheros `.mlmodelc` compilados empaquetados en archivos `.aar`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer con atención lineal (SanaDiT) + encoder de texto Gemma-2-2B + VAE DC-AE; muestreo por consistencia TrigFlow |
| Parametros totales | 1.6B (según nombre del modelo base); desglose por componente no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (encoder de prompt Gemma-2-2B; longitud de prompt no especificada) |
| Tipos de cuantizacion | Pesos a 8 bits en encoder de texto y DiT; VAE decoder/encoder en f32c32; embeddings Gemma en fp16 con escala por fila + filas int8 |
| Idiomas soportados | no disponible (el prompt encoder es Gemma-2-2B, multilingüe, pero no se documenta cobertura) |
| Licencia | Apache 2.0 (SANA-Sprint: transformer y DC-AE) + Gemma Terms of Use (ficheros del prompt encoder); licencia compuesta `apache-2.0-and-gemma-terms-of-use` |
| Formato de pesos | `.mlmodelc` compilado, empaquetado en `.aar` (Apple Archive lz4); además `.bin` para embeddings y tokenizer |
| Resolucion de imagen | 1024×1024 |
| Pasos de muestreo | 1, 2 o 4 pasos |
| Libreria | coreml |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El modelo base SANA-Sprint 1.6B emplea un diffusion transformer con atención lineal, diseñado para reducir el coste computacional de la atención frente a los transformers de difusión convencionales. El muestreo se realiza mediante consistencia TrigFlow, que permite generar imágenes en muy pocos pasos (1, 2 o 4), lo que resulta crítico para inferencia en dispositivo. El VAE es un DC-AE con configuración f32c32, que comprime las imágenes a un espacio latente de alta relación de compresión.

La conversión a Core ML divide el pipeline en artefactos separados: el encoder de prompt (Gemma-2-2B) en cuatro chunks que se ejecutan en CPU con pesos de 8 bits y con la instrucción fija de prompt de diffusers precalculada en su interior; el SanaDiT en cuatro chunks que se ejecutan en el Neural Engine con pesos de 8 bits; y el VAE decoder y encoder (este último para image-to-image). Los embeddings de Gemma se almacenan con escala fp16 por fila seguida de filas int8 multiplicadas por √2304, y el tokenizer BPE de Gemma se incluye en formato binario `GTK1`. No se dispone de información sobre el dataset de entrenamiento, número de tokens, ni si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de imágenes texto-a-imagen a 1024×1024 píxeles.
- Muestreo en 1, 2 o 4 pasos mediante consistencia TrigFlow, lo que permite latencias muy bajas.
- Image-to-image: se incluye un VAE encoder (DC-AE) específicamente para esta tarea.
- Ejecución en dispositivo: el DiT corre en el Neural Engine y el encoder de texto en CPU, sin necesidad de GPU dedicada ni de conexión a red.
- Codificación de prompts mediante Gemma-2-2B, con instrucción fija de prompt precalculada.
- No se documenta soporte de tool calling, agentes, visión de entrada, audio ni modos de razonamiento explícito.

## Casos de uso

- Generación de imágenes offline en iPhone: la conversión está pensada para ejecutarse en el Neural Engine, de modo que una app puede generar imágenes de 1024×1024 sin enviar prompts a un servidor, útil en entornos con requisitos de privacidad.
- Prototipado rápido de interfaces creativas: con 1 o 2 pasos de muestreo, el tiempo por imagen se reduce lo suficiente para iterar sobre variaciones de prompt en una app de diseño.
- Funciones de edición de imagen en apps móviles: el VAE encoder incluido permite flujos image-to-image, por ejemplo para variaciones estilísticas de una foto tomada en el dispositivo.
- Demos y pruebas de concepto de modelos de difusión en Apple Silicon: el paquete de artefactos Core ML sirve para evaluar el rendimiento de SANA-Sprint en hardware Apple sin montar un stack de PyTorch.
- Aplicaciones educativas o de investigación: permite estudiar el comportamiento del muestreo TrigFlow con 1, 2 y 4 pasos en un entorno controlado y reproducible.
- Generación de assets en pipelines de contenido: para equipos que necesitan imágenes de 1024×1024 generadas localmente y con licencia Apache 2.0 en la parte del modelo de difusión, integrable en herramientas de escritorio o móviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo: iPhone con Neural Engine (la model card menciona explícitamente iPhone); no se especifican modelos concretos ni versiones mínimas de iOS.
- VRAM: no aplica en el sentido de GPU dedicada; el consumo es de memoria unificada del dispositivo. No se proporcionan cifras de memoria necesaria.
- GPU recomendadas: no disponible; el diseño apunta a Neural Engine (DiT) y CPU (encoder de texto), no a GPU.
- Compatibilidad con GPU consumer (RTX 4090, etc.): no disponible; el formato Core ML está orientado al ecosistema Apple.
- Opciones de despliegue: Core ML (`.mlmodelc` empaquetado en `.aar`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dependen del dispositivo y del número de pasos (1, 2 o 4).

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Pasos | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sana-Sprint-CoreML (esta ficha) | 1.6B | 1024×1024 | 1, 2 o 4 | Core ML (`.mlmodelc`/`.aar`) | Apache 2.0 + Gemma Terms | Hugging Face, 0 descargas |
| SANA-Sprint 1.6B (base, diffusers) | 1.6B | 1024×1024 | 1, 2 o 4 | safetensors/diffusers | Apache 2.0 | Hugging Face (Efficient-Large-Model) |
| Otros text-to-image en Core ML | no disponible | no disponible | no disponible | Core ML | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Conversión no oficial: no está hecha ni respaldada por NVIDIA, MIT ni Google; el soporte y la garantía de calidad recaen en el autor de la conversión.
- Licencia compuesta: el transformer y el DC-AE son Apache 2.0, pero los ficheros del prompt encoder (`SanaText_chunk*`, `sana-gemma-embed.bin`, `sana-tokenizer.bin`) son derivados de Gemma 2 y están sujetos a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; el uso comercial debe revisarse contra ambas licencias.
- Riesgo de alucinación visual y artefactos propios de modelos de difusión; no se documentan evaluaciones de fidelidad prompt-imagen.
- Idiomas soportados no documentados; el comportamiento multilingüe del encoder Gemma no está verificado en esta conversión.
- Sin datos de benchmarks, latencia ni consumo de memoria; el rendimiento real en dispositivo es desconocido.
- El paquete incluye únicamente artefactos Core ML compilados; no hay pesos en safetensors ni GGUF, lo que limita su reutilización fuera del ecosistema Apple.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: madurez y validación por la comunidad no demostradas.
- La instrucción fija de prompt de diffusers está precalculada dentro del encoder de texto, lo que puede restringir la personalización del formato de prompt.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/33cloud33/Sana-Sprint-CoreML
- Modelo base: https://huggingface.co/Efficient-Large-Model/Sana_Sprint_1.6B_1024px_diffusers
- Aviso legal y modificaciones (NOTICE.txt): https://huggingface.co/33cloud33/Sana-Sprint-CoreML/blob/main/NOTICE.txt
- Licencia Apache 2.0 incluida: https://huggingface.co/33cloud33/Sana-Sprint-CoreML/blob/main/licenses/Apache-2.0.txt
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
