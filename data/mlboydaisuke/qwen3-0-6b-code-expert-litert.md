# mlboydaisuke/Qwen3-0.6B-Code-Expert-LiteRT

## Resumen

Qwen3-0.6B-Code-Expert-LiteRT es una conversión al formato `.litertlm` del modelo `suayptalha/Qwen3-0.6B-Code-Expert`, un ajuste fino completo de `Qwen/Qwen3-0.6B` entrenado sobre el conjunto `nvidia/OpenCodeReasoning`. El modelo lo publica el usuario `mlboydaisuke` y está pensado para ejecución en dispositivo (on-device) mediante el runtime LiteRT-LM de Google AI Edge, lo que permite cargarlo en aplicaciones iOS y Android sin infraestructura de servidor.

Se trata de un modelo de 0,6 mil millones de parámetros con pesos cuantizados a int8, una ventana de contexto de 4096 tokens de caché KV y licencia Apache-2.0. Su relevancia radica en que ejemplifica una receta reproducible de extremo a extremo: ajuste fino de un modelo pequeño de código en Hugging Face, conversión con un único comando a `.litertlm` y despliegue en un iPhone a través de `swift-litert-lm`.

El bundle ocupa 613.406.208 bytes (unos 585 MiB) y está etiquetado únicamente para inglés. No incluye torre de visión ni de audio: es un modelo estrictamente de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), exportada con litert-torch 0.9.3 |
| Parámetros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (caché KV) |
| Tipos de cuantización | int8 en pesos (cuantización por defecto del conversor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); fichero `model.litertlm` de 613.406.208 bytes, sha256 `7a4ec53564ef677f64dcb2de88017fccd1c00aa610495b24c089493278720fe6` |
| Modelo base | `suayptalha/Qwen3-0.6B-Code-Expert` (revisión `02c021d`, 2025-05-11) |
| Runtime | LiteRT-LM (`litert-lm` CLI, `swift-litert-lm` en iOS) |
| Plantilla de chat | Plantilla Qwen3 del ajuste fino, embebida literalmente; canal de pensamiento `<think>` / `</think>`; tokens de parada `<\|im_end\|>` (151645) y `<\|endoftext\|>` (151643) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B, un transformer decoder-only denso de 0,6 mil millones de parámetros. Sobre él, el autor original (`suayptalha`) realizó un ajuste fino completo (full fine-tune) utilizando `nvidia/OpenCodeReasoning`, un conjunto orientado a razonamiento sobre código. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica de esta publicación no está en el entrenamiento sino en el pipeline de conversión y despliegue. El bundle se generó con litert-torch 0.9.3, ai-edge-quantizer 0.8.0, transformers 5.14.1 y litert-lm-builder 0.15.0, en un proceso que tardó 217 segundos en un Mac Studio M4 Max. El conversor incluye una puerta de salida con 8 preguntas fijas ejecutadas a través del runtime: este bundle respondió correctamente 7 de 8 sin salidas degeneradas (el fallo fue responder "violet" a "Roses are red, violets are ___"), con una mediana de decodificación de 138 tok/s en la GPU del Mac durante esa prueba. La plantilla de chat se actualizó el 2026-09-21 para aceptar la forma de content-parts de la versión 0.18, manteniendo pesos, tokenizador y metadatos del ejecutor idénticos byte a byte.

## Capacidades

- Generación de texto en inglés con modo de razonamiento explícito (canal `<think>` / `</think>`), heredado de Qwen3.
- Especialización en código y razonamiento sobre código, fruto del ajuste fino con `nvidia/OpenCodeReasoning`.
- Aritmética básica y respuestas breves en modo no-thinking (el ejemplo de la model card resuelve "17 + 25 = 42").
- Ejecución totalmente local en dispositivo, sin conexión de red.
- Inferencia en GPU (Metal en iOS) y en CPU a través de LiteRT-LM.
- No soporta tool calling ni function calling de forma documentada.
- No soporta agentes multi-paso de forma nativa; el runtime limita a un mensaje por conversación (véase Limitaciones).
- No dispone de visión, audio ni otras modalidades: `modalities: []` en la API Swift.
- Multilingüismo limitado al inglés según los metadatos del modelo.

## Casos de uso

- Asistente de código embebido en aplicaciones iOS: el bundle se carga con `LiteRTChat` desde `swift-litert-lm` y responde localmente a preguntas de programación sin enviar código a un servidor, lo que resulta adecuado para entornos con requisitos de privacidad.
- Autocompletado y explicación de fragmentos de código en el editor: con 4096 tokens de contexto y un footprint de 1,1-1,4 GB, cabe en un iPhone moderno y permite sugerencias de baja latencia en la GPU (142,7 tok/s de decodificación medidas en M4 Max).
- Aplicaciones de aprendizaje de programación sin conectividad: al ejecutarse íntegramente on-device, funciona en modo avión o en entornos sin red, resolviendo dudas y explicando conceptos con el modo de pensamiento activado.
- Pruebas de concepto de pipelines de IA en el borde: sirve como modelo de referencia para validar la cadena Hugging Face → `.litertlm` → app móvil antes de invertir en modelos mayores.
- Prototipado rápido en escritorio: la CLI `litert-lm run --from-huggingface-repo` permite evaluar el modelo en macOS, Linux y Windows con una sola orden, útil para comparar variantes de cuantización o plantillas.
- Evaluación de ajustes finos de código de menos de 1000 millones de parámetros: al ser Apache-2.0 y de tamaño reducido, es un banco de pruebas asequible para medir la calidad de un fine-tune comunitario frente a su base.
- Demos educativas de inferencia en dispositivo: la receta pública asociada documenta cada paso, lo que lo convierte en material didáctico para enseñar conversión y despliegue de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos medidos son de rendimiento de inferencia, registrados el 2026-09-05 en un Mac Studio con Apple M4 Max, 128 GB de RAM y macOS 27.0, con el prompt "What is 17 + 25? Answer briefly." y respuesta `17 + 25 = 42` en todas las filas:

| Ruta | Backend | Decodificación | Prefill | Primer turno tras carga | Nota |
|---|---|---:|---:|---:|---|
| swift-litert-lm `LiteRTChat` (xcframework LiteRT-LM v0.15.0) | GPU | 142,7 tok/s | 469,2 tok/s | 2,2 s | footprint 1.411 MB; `prewarm: false` |
| swift-litert-lm `LiteRTChat` (xcframework LiteRT-LM v0.15.0) | CPU | 33,3 tok/s | 95,2 tok/s | 11,4 s | footprint 1.107 MB |
| CLI litert-lm 0.17.0, `--thinking false`, greedy | por defecto | no disponible | no disponible | 1,1 s de tiempo total | |
| CLI litert-lm 0.16.0, `--thinking false`, greedy | por defecto | no disponible | no disponible | 1,0 s de tiempo total | |

Adicionalmente, la puerta de validación del conversor registró una mediana de 138 tok/s de decodificación en la GPU del Mac.

## Requisitos de hardware

- VRAM/RAM estimada: el footprint medido es de 1.411 MB en GPU y 1.107 MB en CPU; el fichero pesa 613.406.208 bytes.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 2 GB o más de memoria libre es suficiente; no se han publicado pruebas en RTX 4090, A100 o H100 porque el modelo está orientado a dispositivo.
- En móvil: validado en iPhone a través de `swift-litert-lm` con backend Metal y CPU; el formato es el que importa Google AI Edge Gallery, aunque la model card indica que no se ha probado en Android.
- Opciones de despliegue: CLI `litert-lm` (macOS, Linux, Windows), `swift-litert-lm` en iOS, y Google AI Edge Gallery. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.litertlm` es específico de LiteRT-LM.
- Latencia: primer turno de 2,2 s en GPU y 11,4 s en CPU; 1,0-1,1 s de tiempo total con la CLI en modo greedy sin thinking.
- Throughput: 142,7 tok/s de decodificación y 469,2 tok/s de prefill en GPU; 33,3 tok/s de decodificación y 95,2 tok/s de prefill en CPU (M4 Max).
- Advertencia de muestreo: con thinking activado y decodificación greedy (`--temperature 0 --top-k 1`) el modelo entró en bucle sobre "17 + 25." durante 128 s sin responder; la model card de Qwen3 desaconseja greedy en modo thinking.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B-Code-Expert-LiteRT (este) | 0,6 B | 4096 tokens | `.litertlm` / LiteRT-LM | Apache-2.0 | Especializado en código, on-device, solo inglés |
| suayptalha/Qwen3-0.6B-Code-Expert | 0,6 B | no disponible en la información | safetensors (Hugging Face) | Apache-2.0 (heredada) | Modelo base del que se deriva este bundle; mismos pesos sin cuantizar a int8 |
| Qwen/Qwen3-0.6B | 0,6 B | no disponible en la información | safetensors, GGUF en la familia Qwen3 | Apache-2.0 | Modelo original sin ajuste en código; multilingüe según su model card |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento cualitativa.

## Limitaciones y advertencias

- Un solo mensaje por conversación: en LiteRT-LM, un segundo mensaje en la misma `Conversation` falla con `INTERNAL: The new rendered template string does not start with the previous rendered template string`. Medido en los binarios Swift v0.15.0 (con thinking on y off, GPU y CPU), en litert-lm 0.18.0 (6 de 6 conversaciones fallaron en la segunda interacción) y en litert-lm 0.17.1. La causa es la plantilla de chat, no los pesos: el runtime re-renderiza la conversación y exige que el nuevo render extienda el anterior, pero la plantilla Qwen3 inserta y elimina el bloque `<think>…</think>` según el turno. Solución provisional: abrir una conversación nueva por turno e incluir el historial en el prompt. Existe una propuesta de reempaquetado con la plantilla `models/qwen3` propia de LiteRT-LM, que sería un cambio solo de metadatos.
- Decodificación greedy incompatible con el modo thinking: produce bucles sin respuesta (128 s sin salir del canal de pensamiento en la prueba documentada).
- Idioma: solo inglés según los metadatos; no se ha evaluado su comportamiento en castellano ni en otros idiomas.
- Contexto corto: 4096 tokens de caché KV limitan el historial y los fragmentos de código largos.
- Riesgo de alucinación: con 0,6 B de parámetros y un ajuste fino sobre razonamiento de código, la fiabilidad en tareas abiertas es limitada; la propia puerta del conversor falló 1 de 8 preguntas simples.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad en la información disponible.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset `nvidia/OpenCodeReasoning` antes de desplegarlo en producción.
- Madurez: el bundle se actualizó por última vez el 2026-11-04 y acumula 100 descargas y 0 likes; el soporte en Android no está probado por el autor.
- Sin soporte de tool calling, agentes multi-paso ni modalidades adicionales; no es adecuado para flujos que requieran invocación de funciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Qwen3-0.6B-Code-Expert-LiteRT
- Modelo base ajustado: https://huggingface.co/suayptalha/Qwen3-0.6B-Code-Expert
- Modelo original Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Receta "How do I run a fine-tuned Hugging Face model on iPhone?": https://github.com/john-rocky/swift-litert-lm/blob/main/docs/recipe-hf-finetune-to-iphone.md
- Herramienta de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- SDK Swift swift-litert-lm: https://github.com/john-rocky/swift-litert-lm
- Issue LiteRT-LM#3443 (plantilla de chat): https://github.com/google-ai-edge/LiteRT-LM/issues/3443
- Issue LiteRT-LM#3166 (mecanismo de re-renderizado): https://github.com/google-ai-edge/LiteRT-LM/issues/3166
