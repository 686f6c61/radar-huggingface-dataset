# FastFlowLM/MiniCPM-V-4.7-1B-NPU2

## Resumen

MiniCPM-V 4.7 1B es un modelo multimodal (image-text-to-text) de la familia MiniCPM-V, desarrollado por OpenBMB y distribuido en este repositorio por FastFlowLM en una variante optimizada para NPU (sufijo NPU2). Con aproximadamente 1.000 millones de parámetros, está diseñado para inferencia en dispositivo (on-device), incluyendo teléfonos y tablets, manteniendo capacidades de comprensión de imagen única, múltiples imágenes y vídeo.

El modelo se posiciona como un nuevo punto en la frontera de Pareto entre rendimiento y eficiencia: según la model card, en modo Instruct supera de forma sustancial a Qwen3.5 0.8B tanto en puntuación global como en eficiencia de inferencia. Incorpora compresión temprana de tokens visuales dentro del codificador visual (técnica intra-ViT de LLaVA-UHD v4) y soporta compresión mixta de tokens visuales 4x/16x para ajustar el coste de inferencia.

Es relevante ahora porque cubre el nicho de modelos multimodales ligeros desplegables en hardware de consumo y plataformas móviles (iOS, Android, HarmonyOS) y en chips de Rockchip, Houmo, Intel, AMD y Arm, con soporte para SGLang, vLLM, llama.cpp y Ollama, además de variantes cuantizadas GGUF, BNB, AWQ, GPTQ y FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual con compresion intra-ViT temprana + LLM); detalles completos no disponibles |
| Parametros totales | 1B (aproximadamente 1.000 millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF, BNB, AWQ, GPTQ, FP8 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); variantes GGUF, BNB, AWQ, GPTQ y FP8 mencionadas; tamano del repo 3,4 GB |

## Arquitectura y entrenamiento

MiniCPM-V 4.7 1B es un modelo multimodal que combina un codificador visual con un modelo de lenguaje de aproximadamente 1.000 millones de parametros. La innovacion arquitectonica destacada es la compresion temprana de tokens visuales dentro del propio ViT (intra-ViT early compression, heredada de LLaVA-UHD v4), que reduce el computo en las capas posteriores del codificador. Ademas, admite compresion mixta de tokens visuales 4x/16x, lo que permite a los desarrolladores equilibrar detalle visual y coste de inferencia segun la tarea.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Si se menciona la publicacion de Self-Replay Fine-Tuning, un metodo de ajuste fino de bajo coste orientado a extender capacidades reduciendo el olvido catastrofico. No se dispone de informacion sobre innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Comprension de imagen unica, multiples imagenes y video (pipeline image-text-to-text).
- Generacion de texto conversacional a partir de entradas visuales.
- Razonamiento multimodal y respuesta a preguntas sobre contenido visual.
- Compresion configurable de tokens visuales (4x/16x) para ajustar coste y detalle.
- Despliegue en dispositivo: iOS, Android y HarmonyOS, con soporte dia 0 para chips de Rockchip, Houmo, Intel, AMD y Arm.
- Compatibilidad con frameworks de inferencia SGLang, vLLM, llama.cpp y Ollama.
- Ajuste fino mediante SWIFT y LLaMA-Factory, incluido Self-Replay Fine-Tuning.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia visual en movil: integrado en una app iOS, Android o HarmonyOS, el modelo puede describir escenas, leer texto en imagenes y responder preguntas sobre fotos capturadas por el usuario, ejecutandose localmente en el dispositivo con la variante NPU.
- Accesibilidad: transcripcion y descripcion de imagenes para personas con discapacidad visual, aprovechando la compresion de tokens visuales para mantener latencia baja en hardware movil.
- Analisis de documentos escaneados en el borde: extraccion de informacion de facturas, tickets o formularios fotografados, sin enviar datos a la nube, lo que resulta adecuado por su tamano de 1B y su licencia Apache 2.0.
- Moderacion de contenido visual en dispositivos de bajo consumo: clasificacion y descripcion de imagenes subidas por usuarios en entornos con recursos limitados, usando cuantizacion GGUF o FP8.
- Asistente de video ligero: resumen y respuesta a preguntas sobre clips cortos, gracias a la capacidad de comprension de video y a la compresion configurable de tokens visuales.
- Prototipado e investigacion en MLLM: base de 1B parametros con licencia permisiva y soporte de LLaMA-Factory y SWIFT para experimentar con ajuste fino multimodal y Self-Replay Fine-Tuning.
- Despliegue en placas embebidas: inferencia en chips Rockchip, Houmo, Arm o Intel para aplicaciones de vision industrial o domotica con requisitos de privacidad.

## Benchmarks y rendimiento

La model card incluye graficos comparativos (frontera rendimiento-eficiencia y rendimiento global en modo Instruct) frente a Qwen3.5 0.8B, pero no proporciona valores numericos en texto para MMLU, HumanEval, GSM8K u otros benchmarks. No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1B parametros, en FP16 serian aproximadamente 2 GB de pesos, y en cuantizaciones de 4 bits alrededor de 0,5-0,7 GB, mas overhead de activaciones y del codificador visual (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible; el enfoque del modelo es la inferencia en dispositivo y NPU, no GPU de servidor.
- Cabe en GPU de consumo: si, por su tamano de 1B parametros es compatible con GPUs de consumo, aunque el autor no publica requisitos oficiales.
- Plataformas objetivo: iOS, Android, HarmonyOS; chips de Rockchip, Houmo, Intel, AMD y Arm (soporte dia 0).
- Opciones de despliegue: Transformers (>= 5.18.0), SGLang, vLLM, llama.cpp, Ollama; ajuste fino con SWIFT y LLaMA-Factory.
- Latencia y throughput: no disponibles; la model card solo referencia graficos de tiempo de inferencia sin cifras textuales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 1B (este) | 1B | no disponible | Supera a Qwen3.5 0.8B en puntuacion global y eficiencia segun el autor | Apache 2.0 | Hugging Face, variantes GGUF/BNB/AWQ/GPTQ/FP8 |
| Qwen3.5 0.8B | 0,8B | no disponible | Referencia de comparacion citada por el autor; valores numericos no disponibles | no disponible | no disponible |
| MiniCPM-V 4.6 1B | 1B | no disponible | Inferior al 4.7 1B en capacidades base segun el autor | no disponible | no disponible |

Los datos numericos de rendimiento de los modelos comparados no se han publicado en la informacion disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un modelo multimodal entrenado con datos no especificados, existe riesgo de sesgos visuales y culturales no cuantificados.
- Riesgo de alucinacion en descripciones de imagenes y videos, especialmente con contenido ambiguo o de baja calidad; no se han publicado tasas de error.
- Cobertura de idiomas no declarada; no se puede garantizar un rendimiento uniforme fuera de los idiomas usados en el entrenamiento (no disponibles).
- Longitud de contexto no especificada, lo que dificulta planificar casos de uso con entradas visuales o conversaciones largas.
- El repositorio es una distribucion de terceros (FastFlowLM) con sufijo NPU2; conviene verificar que los pesos y el soporte de NPU coinciden con el modelo oficial de OpenBMB antes de usarlo en produccion.
- Aunque la licencia es Apache 2.0 y permite uso comercial, deben revisarse las licencias de los componentes de terceros (codificador visual, tokenizador) no detalladas en la informacion disponible.
- El rendimiento en hardware movil depende de la variante NPU y del soporte del chip; no se publican latencias oficiales por plataforma.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/FastFlowLM/MiniCPM-V-4.7-1B-NPU2
- Repositorio oficial MiniCPM-o (OpenBMB): https://github.com/OpenBMB/MiniCPM-o
- Documentacion MiniCPM-V 4.7: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/minicpm_v4dot7_en.md
- Guia de despliegue: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/deployment_en.md
- Documentacion de API: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/api.md
- Demo en vivo: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.7-Demo
- Cookbook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- LLaVA-UHD v4: https://github.com/THUMAI-Lab/LLaVA-UHD-v4
