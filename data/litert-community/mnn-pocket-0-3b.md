# litert-community/MNN-Pocket-0.3B

## Resumen

MNN-Pocket-0.3B es un modelo de lenguaje conversacional de aproximadamente 300 millones de parámetros, desarrollado originalmente por el equipo de MNN (taobao-mnn) como modelo de propósito general ajustado por instrucciones para ejecución en dispositivo (on-device). Esta ficha corresponde a la conversión del modelo base al formato LiteRT-LM, publicada por la comunidad litert-community, orientada a su despliegue en dispositivos móviles y de borde mediante el runtime de Google AI Edge.

El modelo emplea una arquitectura transformer densa de 28 capas, con tamaño oculto de 896, 14 cabezas de atención que comparten 2 cabezas clave-valor (GQA) y embeddings de entrada y salida atados. Su vocabulario cubre 65.536 tokens en chino e inglés, y está diseñado para asistentes en dispositivo, extracción de datos y pipelines agénticos ligeros, no para tareas de razonamiento intensivo.

La relevancia de esta conversión radica en que empaqueta el modelo en archivos `.litertlm` optimizados por backend: variantes int8 para CPU y GPU con caché KV de 2.048 y 4.096 tokens, y variantes compiladas para la NPU de Qualcomm Snapdragon (incluida una compilación ahead-of-time específica para el SoC SM8850). Según la model card, en un Galaxy S26 el archivo SM8850 alcanza unos 158 tokens/s en decodificación tras un prefill de 1.024 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con GQA (14 cabezas de atención, 2 cabezas KV) |
| Parametros totales | ~300M (28 capas, hidden size 896) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (variante int8) / 2.048 tokens (variantes ekv2048 y NPU) |
| Tipos de cuantizacion | int8 (una escala por canal de salida) con activaciones float; fp16 en GPU; int8 con activaciones enteras de 16 bits en NPU |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base también se distribuye en MNN int4 y GGUF |
| Vocabulario | 65.536 tokens (chino e inglés) |
| Embeddings | atados (input/output tied) |
| Runtime minimo | LiteRT-LM 0.19.1 |
| Backends soportados | CPU, GPU, NPU (Qualcomm) |
| Estado (stateful) | false |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 28 capas con tamaño oculto 896 y 14 cabezas de atención que comparten 2 cabezas clave-valor, lo que reduce el coste de memoria del caché KV en inferencia. Los embeddings de entrada y salida están atados, práctica habitual en modelos de menos de 1.000 millones de parámetros para no duplicar la matriz de vocabulario. El vocabulario de 65.536 tokens está orientado a chino e inglés.

La model card de esta conversión no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información debería consultarse en el informe técnico del modelo base (arXiv:2611.12311). El modelo conversa en formato ChatML con definiciones de herramientas y no dispone de bloque de razonamiento separado (thinking declarado como false, control "never"). La conversión a LiteRT-LM aplica cuantización int8 con una escala por canal de salida y añade firmas de prefill de 128 y 1.024 tokens; la variante NPU usa activaciones enteras de 16 bits cuyos rangos se calibraron sobre 48 prompts (32 preguntas del split de entrenamiento de GSM8K en formato 4-shot y las 16 primeras prompts de calibración de litert-torch).

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Formato de chat ChatML con soporte de definiciones de herramientas (tool definitions), lo que habilita function calling básico.
- Pipelines agénticos ligeros y de múltiples pasos, según la descripción del autor del modelo base.
- Extracción de datos estructurados a partir de texto.
- Ejecución en dispositivo con backends CPU, GPU y NPU (Qualcomm Snapdragon).
- Sin capacidades de visión ni audio (declaradas como false).
- Sin modo de razonamiento explícito (thinking): no genera bloques de cadena de pensamiento separados.

## Casos de uso

- Asistentes en dispositivo sin conexión: el modelo cabe en un archivo de ~320 MB y se ejecuta en CPU o GPU de móvil, lo que permite un asistente conversacional que no envía datos a la nube y preserva la privacidad del usuario.
- Extracción de datos en el borde: convertir texto libre (correos, notas, formularios) en campos estructurados localmente, aprovechando el soporte de ChatML con herramientas para forzar un esquema de salida.
- Clasificación y enrutamiento de consultas: con 2.048 o 4.096 tokens de contexto, puede etiquetar y dirigir mensajes entrantes en aplicaciones de mensajería o atención al cliente de bajo volumen.
- Automatización agéntica ligera: encadenar llamadas a herramientas definidas en el prompt para tareas como consultar una agenda, recuperar un dato o componer una respuesta, dentro de pipelines de pocos pasos.
- Aplicaciones bilingües chino-inglés: el vocabulario de 65.536 tokens y el entrenamiento en ambos idiomas lo hacen adecuado para interfaces y asistentes que alternan entre las dos lenguas.
- Despliegue en NPU de smartphones Snapdragon: la variante compilada ahead-of-time para SM8850 permite integrarlo en aplicaciones Android de un fabricante concreto con latencia baja (unos 158 tokens/s en decodificación según la model card).
- Prototipado y demos en macOS: la variante int8 con backend GPU permite probar el comportamiento del modelo en escritorio antes de portarlo a móvil.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.). Sí incluye mediciones de rendimiento de inferencia:

| Escenario | Archivo | Backend | Decodificación | Notas |
|---|---|---|---|---|
| Galaxy S26 | `MNN-Pocket-0.3B_qualcomm_sm8850_ekv2048.litertlm` | NPU | ~158 tokens/s | Tras prefill de 1.024 tokens; creación de motor en ~0,27 s (2026-11-07) |
| Galaxy S26 | `MNN-Pocket-0.3B_qualcomm_npu_ekv2048.litertlm` | NPU | ~147 tokens/s | Compilación en dispositivo al crear el motor |
| GPU (no especificado) | `MNN-Pocket-0.3B_int8.litertlm` (4.096) | GPU | ~105 tokens/s | Medición de 2026-11-18 |

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: los archivos int8 ocupan ~320 MB; la variante NPU ~374 MB y la compilada para SM8850 ~380 MB. La memoria pico en CPU móvil es aproximadamente 0,76 GB superior con el archivo de 4.096 tokens frente al de 2.048.
- GPU recomendadas: no aplica en el sentido de GPU de servidor; el modelo está pensado para GPU integradas de móvil (PowerVR en Pixel 11 Pro, Adreno en Galaxy S26) y GPU de macOS.
- Cabe en hardware de consumo: sí, en smartphones de gama alta (Pixel 11 Pro, Galaxy S26) y en Mac. No se documenta su ejecución en GPU de escritorio dedicadas.
- Opciones de despliegue: runtime LiteRT-LM 0.19.1 o superior; el modelo base también está disponible en MNN (int4) y GGUF para otros runtimes.
- Latencia y throughput: ~158 tokens/s (NPU SM8850), ~147 tokens/s (NPU genérica Snapdragon), ~105 tokens/s (GPU con contexto de 4.096). El backend CPU de LiteRT-LM 0.19.1 no abre el archivo NPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B (esta ficha) | ~300M | 2.048–4.096 | en, zh | Apache 2.0 | LiteRT-LM, MNN, GGUF |
| Qwen3-0.6B | ~600M | no disponible en esta información | multilingüe | Apache 2.0 | safetensors, GGUF |
| Gemma 3 270M | ~270M | no disponible en esta información | multilingüe | Gemma Terms | safetensors, GGUF |

La comparación cuantitativa de rendimiento no está disponible: la model card no publica benchmarks de calidad que permitan contrastar con Qwen3-0.6B o Gemma 3 270M. La ventaja diferencial de esta conversión es el empaquetado para LiteRT-LM con backends NPU de Qualcomm y compilación ahead-of-time para SM8850.

## Limitaciones y advertencias

- El propio autor del modelo base lo desaconseja para tareas de razonamiento intensivo, como matemáticas avanzadas o generación de código de largo alcance.
- Riesgo de alucinación inherente a un modelo de ~300M parámetros; no debe usarse como fuente de verdad sin verificación.
- Contexto limitado a 2.048 o 4.096 tokens según la variante, insuficiente para documentos largos o conversaciones extensas.
- Solo soporta inglés y chino; no hay cobertura documentada de otros idiomas.
- Sin visión, audio ni modo de razonamiento explícito.
- La variante NPU requiere un Snapdragon compatible; la compilación SM8850 está atada a ese SoC concreto y no es portable.
- El backend CPU de LiteRT-LM 0.19.1 no puede abrir el archivo NPU.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los artefactos derivados.
- Las mediciones de rendimiento proceden de la model card y de fechas concretas (noviembre de 2026); pueden variar con versiones posteriores del runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MNN-Pocket-0.3B
- Modelo base: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B
- Build MNN int4: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-MNN
- Archivos GGUF: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-GGUF
- Informe técnico: https://arxiv.org/abs/2611.12311
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
