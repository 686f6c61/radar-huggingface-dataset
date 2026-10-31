# cheesefelys/LFM3-1.7B-litertlm

## Resumen

LFM3-1.7B-litertlm es un port del modelo LFM3-1.7B de Liquid AI al runtime LiteRT-LM de Google, publicado por el usuario cheesefelys en Hugging Face. No es un modelo nuevo en sí, sino una conversión del checkpoint original a un bundle `.litertlm` con pesos cuantizados a int4 (848 MB), acompañado de una aplicación Android de chat funcional escrita en Kotlin y Compose. Su propósito es permitir la ejecución del modelo completamente en el dispositivo (on-device) en terminales Android, sin depender de servidores remotos.

La relevancia de este trabajo radica en que LFM3-1.7B emplea una arquitectura "tri-híbrida" (convoluciones cortas con gating, atención por ventana deslizante y atención completa con RoPE parcial) que el exportador `litert-torch` de Google no sabía exportar hasta este port. El repositorio incluye todo lo necesario para reproducir la exportación, además de variantes fp32 de referencia y soporte para el catálogo local de Google AI Edge Gallery.

El modelo base mantiene las capacidades de LFM3-1.7B: generación de texto con canal de razonamiento (`<think>`), function calling a nivel de plantilla y soporte de 16 idiomas, incluyendo castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-híbrida: convoluciones cortas con gating (kernel 7), atención sliding-window (256) y atención completa con RoPE parcial, 24 capas |
| Parametros totales | 1,7B (aproximado por la denominación del modelo; no desglosado en la ficha) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en el bundle exportado (el modelo base LFM3 soporta 256K) |
| Tipos de cuantizacion | int4 (pesos, activaciones dinámicas en fp32); variante fp32 disponible en repo aparte |
| Idiomas soportados | 16: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (other) |
| Formato de pesos | .litertlm (bundle LiteRT-LM: tflite prefill+decode, tokenizador HF, LlmMetadata, ExecutorMetadata) |

## Arquitectura y entrenamiento

La arquitectura tri-híbrida de LFM3 combina tres tipos de operadores por capa, definidos en `config.layer_types`: convoluciones cortas depthwise con gating (kernel 7, con un estado rolling de 6 posiciones), atención por ventana deslizante (16 cabezas de consulta, 4 KV, RoPE θ=1e4, ventana de 256) y atención completa con RoPE parcial (64 de 128 dimensiones rotadas, θ=1e6). Complementa esto con QK-RMSNorm, una puerta sigmoide por cabeza sobre la salida de atención y "sandwich norms" alrededor de ambas subcapas.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO), la información disponible no detalla nada. Este repositorio en concreto no reentrena el modelo: es una conversión de formato. El trabajo técnico del port consistió en extender el pipeline `export_hf` de `litert-torch` con un `ModelExtension` que reimplementa la convolución corta sobre el buffer fijo de LiteRT (manejando correctamente el prefill con padding a la derecha en bloques de 128 tokens), añadir la entrada de máscara para las capas `conv` y validar la fidelidad numérica: la variante fp32 alcanza una similitud coseno de logits de 0,9997 frente a PyTorch, frente a 0,8877 de la variante int4.

## Capacidades

- Generación de texto con streaming token a token en CPU (XNNPACK) y GPU del dispositivo; NPU sin probar.
- Razonamiento explícito mediante el canal `<think>`, expuesto como campo `thought` en el runtime y mostrado en un bloque plegable en la app Android incluida.
- Function calling a nivel de plantilla, mediante la sintaxis XML de tool calls de LFM3.
- Soporte multilingüe heredado del checkpoint base: 16 idiomas, entre ellos castellano, inglés, chino, japonés y árabe.
- Ejecución 100% local en Android (minSdk 28, targetSdk 35) o escritorio, sin conexión a servicios externos.
- Compatibilidad con Google AI Edge Gallery sin recompilar la app, mediante un allowlist local.

## Casos de uso

- Asistentes de chat offline en Android: la app incluida descarga el bundle (888,9 MB), ejecuta el modelo en CPU o GPU del teléfono y muestra el razonamiento en un bloque plegable, ideal para aplicaciones que no pueden depender de la nube.
- Privacidad y datos sensibles: al ejecutarse íntegramente en el dispositivo, es adecuado para procesar notas clínicas, documentos legales o mensajes personales sin enviar datos a servidores.
- Agentes con function calling en el borde: la sintaxis XML de tool calls de LFM3 permite construir agentes que invoquen funciones locales (calendario, sensores, base de datos) sin latencia de red.
- Prototipado de inferencia on-device: el directorio `port/` sirve como referencia para exportar otras arquitecturas híbridas a LiteRT-LM, útil para equipos de ingeniería de edge AI.
- Traducción y redacción multilingüe ligera: con soporte de 16 idiomas y un footprint de menos de 1 GB, cabe en la mayoría de teléfonos modernos para tareas de escritura y resumen.
- Integración en apps mediante el artefacto oficial de Google Maven (`com.google.ai.edge.litertlm:litertlm-android:0.18.1`), sin builds custom del runtime.
- Evaluación comparativa de cuantización: la variante fp32 (6,92 GB) permite medir la degradación de la versión int4 (coseno 0,8877) en escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de fidelidad cuantitativo del port es la similitud coseno de los logits frente a PyTorch: 0,9997 para la variante fp32 y 0,8877 para la int4.

## Requisitos de hardware

- Tamaño del bundle int4: 848 MB de pesos; descarga de 888,9 MB desde el repositorio. Cabe con holgura en la memoria de cualquier smartphone Android moderno (minSdk 28).
- La variante fp32 ocupa 6,92 GB y está pensada para escritorio o validación, no para móviles.
- Backends soportados: CPU (XNNPACK) y GPU en Android; NPU sin probar.
- Despliegue: LiteRT-LM (CLI `litert-lm`, API Python `litert_lm.Engine`, artefacto Android en Google Maven) y Google AI Edge Gallery mediante allowlist local. No está pensado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible (no se publican mediciones).
- Para compilar la app Android incluida se requiere JDK 21 y Android SDK.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-litertlm | 1,7B | 4096 (bundle; base 256K) | int4 | LFM Open License v1.0 | .litertlm, Android y escritorio |
| LFM3-1.7B (base, Liquid AI) | 1,7B | 256K | fp16/bf16 (no disponible en ficha) | LFM Open License v1.0 | HuggingFace, PyTorch |
| LFM3-1.7B-litertlm-fp32 | 1,7B | 4096 (bundle) | fp32 | LFM Open License v1.0 | .litertlm, escritorio |

Comparativas de rendimiento con otros modelos pequeños on-device (Gemma, Qwen, Phi) no disponibles: no se han publicado benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- El bundle exportado limita el contexto a 4096 tokens, muy por debajo de los 256K que soporta el modelo base; para contextos largos hay que usar el checkpoint original.
- La cuantización int4 degrada la fidelidad respecto a PyTorch (coseno de logits 0,8877 frente a 0,9997 en fp32); puede afectar a tareas sensibles a precisión numérica.
- Sesgos conocidos: no disponible (no documentados en la ficha).
- Riesgo de alucinación: inherente a un modelo de 1,7B; el canal `<think>` no garantiza razonamiento correcto.
- El backend NPU no está probado; solo CPU y GPU están validadas.
- Licencia LFM Open License v1.0: es una licencia "other", no una licencia estándar permisiva; hay que revisar sus términos antes de uso comercial.
- Es un port comunitario (219 descargas, 1 like en el momento de la ficha), no un lanzamiento oficial de Liquid AI ni de Google; la validación numérica es responsabilidad del autor del port.
- Solo 16 idiomas; el rendimiento en castellano depende del checkpoint base y no se han publicado evaluaciones por idioma.

## Enlaces

- Ficha del modelo: https://huggingface.co/cheesefelys/LFM3-1.7B-litertlm
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Variante fp32: https://huggingface.co/cheesefelys/LFM3-1.7B-litertlm-fp32
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
