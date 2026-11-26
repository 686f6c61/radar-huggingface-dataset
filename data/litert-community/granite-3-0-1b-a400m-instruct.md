# litert-community/granite-3.0-1b-a400m-instruct

## Resumen

Granite-3.0-1B-A400M-Instruct en formato LiteRT-LM es una conversión del modelo original de IBM (publicado el 21 de octubre de 2024) al formato `.litertlm` propietario del runtime LiteRT-LM de Google, orientado a inferencia en dispositivo (on-device) y entornos edge. Se trata de un transformer decoder-only con mezcla de expertos dispersa (MoE): 24 capas, tamaño oculto 1024, 16 cabezas de atención con 8 cabezas KV, 32 expertos por capa de los que se seleccionan 8 por token, y un total de 1.334.628.352 parámetros en bf16 (1,3B en la tabla de IBM, con 400M activos por token). La conversión la mantiene la comunidad `litert-community`, no IBM.

El archivo distribuido es un único fichero int8 de 1,37 GB (1.372.769.280 bytes) con cuantización dinámica int8 en las capas lineales y activaciones float; por limitaciones del runtime LiteRT-LM 0.18.0, la exportación usa la ruta `litert_moe_sequential`, que computa los 32 expertos de cada capa para cada token en lugar de los 8 seleccionados, de modo que el coste computacional por token corresponde a los 1,33B parámetros completos y no a los 400M activos. La relevancia actual reside en que permite ejecutar un modelo de IBM con alineamiento por RL y soporte de 12 idiomas en GPUs de escritorio y móviles de gama alta mediante WebGPU, con velocidades de decodificación de hasta 146 tok/s en un Mac Studio M4 Max.

El contexto en este fichero está limitado a 2048 tokens (frente a los 4096 del modelo original), y el vocabulario es de 49.155 tokens con embeddings atados. La licencia Apache 2.0 del modelo base se conserva en la conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos dispersa (MoE) |
| Parámetros totales | 1.334.628.352 (bf16) |
| Parámetros activos | 400M por token (8 de 32 expertos por capa) |
| Longitud de contexto | 2048 tokens en este fichero (4096 en el modelo original) |
| Tipos de cuantización | int8 dinámica en capas lineales, activaciones float (fp32 en GPU declaradas) |
| Idiomas soportados | 12 idiomas según IBM (del inglés al chino); lista concreta no disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (1,37 GB, un único fichero) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only con MoE dispersa: 24 capas, hidden size 1024, 16 cabezas de atención y 8 cabezas KV (GQA), 32 expertos por capa con SwiGLU y tamaño oculto de experto 512, de los que se eligen 8 por token. El vocabulario es de 49.155 tokens con embeddings atados. IBM lo entrenó a partir de Granite-3.0-1B-A400M-Base mediante fine-tuning supervisado sobre datasets de instrucciones de código abierto con licencias permisivas y datos sintéticos internos, seguido de alineamiento por refuerzo (RL) y fusión de modelos (model merging).

La conversión a LiteRT-LM se realizó con litert-torch en el commit 0d3869c y se probó con litert-lm 0.18.0. La ruta de exportación `litert_moe` dispersa se descartó por dos motivos: calcula los expertos con GELU-tanh mientras que este modelo usa SiLU, y el runtime 0.18.0 rechaza en GPU la operación `moe` que genera (solo admite `activation='gelu'`). Por ello se emplea `litert_moe_sequential`, que computa los 32 expertos de cada capa por token con SiLU (el peso de routing es cero para los 24 expertos fuera del top-8). Las 32 FC de expertos de cada capa se fusionan en dos FC. El fichero declara activaciones fp32 en GPU (`prefer_activation_type` fp32) porque las pasadas con fp16 por defecto degradaban la precisión en GSM8K.

## Capacidades

- Generación de texto e instrucciones en modo conversacional (instruct).
- Razonamiento aritmético básico y resolución de problemas de varios pasos (evaluado en GSM8K).
- Soporte de 12 idiomas según IBM, con inglés como idioma principal de entrenamiento.
- Ejecución on-device en GPU y CPU mediante el runtime LiteRT-LM (WebGPU en Mac, backend nativo en Android).
- Salida determinista con muestreo greedy (top-k 1) verificada contra la referencia bf16 en 8 de 8 respuestas en GPU.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Asistentes locales en móvil Android: el modelo se ejecuta en un Galaxy S26 con GPU en 12,25–12,35 s para 1024 tokens de prefill más 256 de decodificación, lo que permite asistentes conversacionales sin conexión y sin enviar datos a la nube.
- Procesamiento de texto en el navegador o en apps de escritorio: el fichero `.litertlm` funciona sobre WebGPU en un Mac Studio M4 Max a 146,2–146,5 tok/s en GPU, adecuado para resúmenes y reescritura de documentos en local.
- Clasificación y extracción de información en pipelines edge: con 2048 tokens de contexto se pueden procesar correos, tickets o fragmentos de documentación para extraer campos estructurados en dispositivos sin GPU dedicada.
- Prototipado de aplicaciones con requisitos de privacidad: al ejecutarse íntegramente en el dispositivo y con licencia Apache 2.0, encaja en entornos sanitarios o financieros donde no se permite enviar texto a APIs externas.
- Evaluación de runtimes on-device: sirve como banco de pruebas de LiteRT-LM frente a otras alternativas (llama.cpp, MLC) para medir latencia de prefill y decodificación en hardware móvil concreto.
- Generación de texto de bajo coste en CPU: en el Pixel 8a la CPU tarda 26,59–29,15 s en el mismo escenario, lo que permite usos por lotes en segundo plano donde la latencia no es crítica.

## Benchmarks y rendimiento

GSM8K con las preguntas 0–99, instrucción paso a paso que pide una línea final `#### <número>`, plantilla del fichero sin turno de sistema, greedy (top-k 1), máximo 1024 tokens de salida, proceso nuevo por pregunta (litert-lm 0.18.0, Mac M4 Max); bf16 en transformers sobre MPS con los mismos prompts. El modelo no escribió la línea `####` en ninguna respuesta (0 de 100 en todas las configuraciones, incluido bf16), por lo que la puntuación se calcula por el último número tras "answer", "total" o "result" con "is", ":", "=", o el último número de la respuesta.

| Configuración | GSM8K (n=100) |
|---|---|
| Referencia bf16 (transformers, MPS) | 34 |
| Este fichero, GPU Mac (activaciones fp32 declaradas) | 35 / 35 / 35 |
| Mismos pesos, GPU Mac con activaciones fp16 por defecto del runtime | 28 / 29 / 29 |
| Mismos pesos, CPU Mac | 39 / 35 |

Tiempos para 1024 tokens de prefill más 256 de decodificación a contexto 2048:

| Segundos | Mac M4 Max | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| GPU | 2,06 y 2,07 | 12,25 / 12,35 / 12,34 | 28,24 y 28,40 |
| CPU | 6,48 y 6,49 | 14,12 y 13,57 | 26,59 y 29,15 |

Velocidad de decodificación en Mac Studio M4 Max: 146,2–146,5 tok/s en GPU y 53,0–53,1 tok/s en CPU (medido el 2026-10-21). El model-index del README de IBM (entrada `granite-3.0-2b-instruct`) lista GSM8K 26,31 para una configuración no especificada.

## Requisitos de hardware

- Tamaño del fichero: 1,37 GB en int8; la VRAM necesaria para inferencia es aproximadamente ese tamaño más las activaciones y el estado KV para 2048 tokens (cifra exacta de VRAM no disponible).
- GPU de escritorio: Apple M4 Max (Metal/WebGPU) validada con 146 tok/s de decodificación; GPUs NVIDIA tipo A100, H100 o RTX 4090 no se mencionan en la información disponible.
- Móviles validados: Samsung Galaxy S26 (GPU más rápida que CPU en todas las ejecuciones) y Google Pixel 8a (CPU un 1,6 % más rápida de media que la GPU).
- Cabe en GPUs de consumo y en móviles de gama alta; el runtime objetivo es LiteRT-LM 0.18.0, no se documentan opciones con vLLM, llama.cpp, Ollama ni TGI para este fichero.
- Latencia: 2,06 s (GPU M4 Max) a 28,40 s (GPU Pixel 8a) para 1024 tokens de prefill más 256 de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| granite-3.0-1b-a400m-instruct (LiteRT-LM) | 1,33B totales, 400M activos | 2048 | Apache 2.0 | `.litertlm`, LiteRT-LM | Computa los 32 expertos por token; GSM8K 35 en GPU Mac |
| ibm-granite/granite-3.0-1b-a400m-instruct (original) | 1,33B totales, 400M activos | 4096 | Apache 2.0 | safetensors (bf16) | Referencia bf16; GSM8K 34 en MPS |
| Alternativas de tamaño similar en formato on-device | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- El contexto útil se reduce a 2048 tokens en este fichero, la mitad que el modelo original (4096).
- La ruta `litert_moe_sequential` computa los 32 expertos por token: el coste real es el de los 1,33B parámetros, no el de los 400M activos, lo que penaliza el rendimiento frente a una implementación MoE dispersa.
- El modelo no genera la línea final `####` solicitada en GSM8K (0 de 100 respuestas), lo que indica poca fiabilidad en el seguimiento estricto de formatos de salida.
- Las activaciones fp16 por defecto del runtime degradan la precisión (GSM8K 28–29 frente a 35 con fp32); el fichero fuerza fp32 en GPU, con el coste de memoria asociado.
- En la tercera pasada fp16 se registró un error de validación de WebGPU en una pregunta, resuelto al repetirla en un proceso nuevo; posibles fallos esporádicos del runtime en GPU.
- Riesgo de alucinación inherente a un modelo de 1,3B parámetros; no se documentan evaluaciones de sesgo ni de seguridad.
- Solo se validó en litert-lm 0.18.0 y en el hardware indicado (Mac M4 Max, Galaxy S26, Pixel 8a); el soporte en otras GPUs o versiones del runtime no está garantizado.
- La lista concreta de los 12 idiomas no está disponible en la información proporcionada; el rendimiento fuera del inglés no está evaluado.
- Licencia Apache 2.0 permite uso comercial, pero la conversión la mantiene la comunidad `litert-community` y no IBM; no hay garantías del autor original sobre este artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/granite-3.0-1b-a400m-instruct
- Modelo base: https://huggingface.co/ibm-granite/granite-3.0-1b-a400m-instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Script de verificación de calidad: https://github.com/john-rocky/hf-to-litertlm/blob/main/scripts/verify_quality.py
- Repositorio de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
