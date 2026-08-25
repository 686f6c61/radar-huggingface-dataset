# mlboydaisuke/S1-mini-LiteRT

## Resumen

S1-mini es un modelo de normalización de texto para transcripciones de voz, desarrollado por Superwhisper y convertido al formato LiteRT-LM por mlboydaisuke para inferencia en dispositivos edge. Se trata de un finetune de Qwen3 de 0,6 mil millones de parámetros que toma una transcripción cruda de reconocimiento de voz (ASR) y la reescribe como texto escrito limpio: elimina muletillas, resuelve falsos comienzos y autocorrecciones, aplica puntuación y mayúsculas, y convierte números hablados, fechas, horas, moneda y direcciones de correo a su forma escrita. No es un modelo de chat: normaliza la pregunta en lugar de responderla.

La relevancia de este modelo radica en su capacidad para ejecutarse completamente en el dispositivo, sin conexión a la nube, gracias a la cuantización int8 dinámica y al runtime LiteRT-LM de Google. El repositorio incluye un único archivo de 688 MB en formato `.litertlm` y ha sido verificado byte a byte contra el checkpoint original en fp32 en múltiples plataformas (macOS, Pixel 8a, iPhone 17 Pro). Está pensado para aplicaciones de dictado, subtitulado y post-procesamiento de ASR en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (finetune de 0,6B) |
| Parametros totales | 0,6 mil millones (600M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (recomendado ~1000 tokens por entrada) |
| Tipos de cuantizacion | int8 dinamico en lineales y embedding (`dynamic_wi8_afp32`); se descarto int4 blockwise-32 por perdida de calidad |
| Idiomas soportados | Ingles (en) |
| Licencia | s1-mini-license (licencia propietaria, no estandar) |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base tambien esta disponible en safetensors en HuggingFace |

## Arquitectura y entrenamiento

El modelo es un finetune de Qwen3 de 0,6B parámetros, especializado en la tarea de normalización de texto ASR. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La arquitectura subyacente es un transformer denso estándar de Qwen3, adaptado mediante fine-tuning para producir texto escrito limpio a partir de transcripciones crudas.

La conversión a LiteRT-LM consiste en una cuantización int8 dinámica aplicada a las capas lineales y al embedding, manteniendo las activaciones en fp32. Esta conversión fue verificada por el autor alimentando el mismo prompt renderizado al bundle LiteRT y al checkpoint HF en fp32, comparando las salidas exactas: 10/10 casos idénticos en macOS (CPU y GPU) y 12/12 en Pixel 8a CPU. Se descartó una variante int4 blockwise-32 porque degradaba la fidelidad de puntuación (perdía comas antes de "and", eliminaba palabras de discurso como "hmm") y decodificaba más lento que int8 en el mismo hardware.

## Capacidades

- Normalización de transcripciones ASR: elimina muletillas ("um", "uh"), resuelve falsos comienzos y autocorrecciones al valor final que el hablante eligió.
- Aplicación de puntuación y mayúsculas: añade comas, puntos, signos de interrogación y capitalización correcta.
- Conversión de elementos hablados a forma escrita: números, fechas, horas, moneda y direcciones de correo electrónico.
- Control de estilo mediante línea de control: `Styling` (casual, semi-casual, semi-formal, formal), `Structure` (prose, lists) y `Context` (general, email). Todas las combinaciones fueron entrenadas.
- Soporte para salida en formato lista (Markdown bullets) cuando el contenido es enumerable.
- Generación de correos electrónicos con saludo, cuerpo y despedida cuando se especifica `Context: email`.
- Manejo del caso de entrada compuesta solo de muletillas: devuelve una cadena vacía.
- Decodificación greedy (configuración `do_sample: false`); se recomienda top-k 1 y temperatura 0 en aplicaciones que expongan sampling.

## Casos de uso

- Dictado por voz en aplicaciones móviles: el usuario dicta un mensaje o nota y el modelo lo convierte en texto limpio y puntuado en tiempo real, con latencia de ~3 segundos en un Pixel 8a CPU para turnos cortos.
- Post-procesamiento de subtítulos generados por ASR: limpiar transcripciones automáticas de vídeos o podcasts para producir subtítulos legibles, eliminando muletillas y corrigiendo puntuación.
- Asistentes de voz en dispositivos edge: normalizar comandos de voz antes de pasarlos a un LLM o a un sistema de acciones, mejorando la precisión del entendimiento.
- Transcripción de reuniones: convertir actas generadas por ASR en documentos formales con estructura de párrafos y puntuación correcta, usando el estilo semi-formal o formal.
- Accesibilidad: mejorar la legibilidad de transcripciones en tiempo real para personas con discapacidad auditiva, mostrando texto limpio en lugar de la transcripción cruda.
- Generación de correos electrónicos dictados: con `Context: email`, el modelo produce un correo con saludo, cuerpo y despedida, listo para enviar.
- Integración en pipelines de ASR en el dispositivo: como etapa de post-procesamiento en aplicaciones de dictado médico, legal o periodístico, donde la fidelidad de puntuación es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como MMLU, HumanEval o GSM8K) en la informacion disponible. El modelo no está diseñado para tareas generales de razonamiento o generación de código, sino para una tarea específica de normalización de texto.

La verificación de exactitud se realizó comparando salidas byte a byte contra el checkpoint fp32 en macOS (10/10 casos idénticos) y en Pixel 8a CPU (12/12 casos idénticos). En Pixel 8a GPU, 9 de 12 casos fueron idénticos; una diferencia real consistió en la pérdida de un separador de fecha ("March 3rd, 2026" se convirtió en "March 32026").

Rendimiento de inferencia medido con `litert-lm benchmark` (v0.16.0):

| Plataforma | Backend | Prefill (256 tok) | Decode | TTFT | Init |
|---|---|---|---|---|---|
| Apple M4 Max | GPU (Metal) | 3673 tok/s | 144,6 tok/s | 0,077 s | 2,8 s |
| Apple M4 Max | CPU | 427 tok/s | 33,3 tok/s | 0,63 s | 6,4 s |
| Pixel 8a (Tensor G3) | GPU (OpenCL) | 434 tok/s (205 tok) | 12,3 tok/s | 0,67 s | - |
| Pixel 8a (Tensor G3) | CPU (XNNPACK) | 40 tok/s (205 tok) | 5,8 tok/s | 6,5 s | - |
| iPhone 17 Pro | GPU (Metal) | 768–801 tok/s (180 tok) | 32,0 tok/s | 0,31 s | 1,7 GB pico |
| iPhone 17 Pro | CPU | 281 tok/s (180 tok) | 15,5 tok/s | 0,74 s | 1,4 GB pico |

Las mediciones en iPhone 17 Pro se realizaron con el dispositivo en estado térmico "serious", por lo que deben interpretarse como valores mínimos.

## Requisitos de hardware

- VRAM estimada: el archivo int8 pesa 688 MB; el pico de memoria medido en iPhone 17 Pro fue de 1,7 GB en GPU y 1,4 GB en CPU.
- GPU recomendadas: funciona en Apple Silicon (M4 Max, iPhone 17 Pro), en Pixel 8a (Tensor G3) y en cualquier GPU con soporte Metal u OpenCL. No requiere GPU de servidor.
- Cabe en GPUs de consumo: sí, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- Opciones de despliegue: runtime LiteRT-LM (CLI `litert-lm run`), API `litert_lm_advanced_main` en Android, y Google AI Edge Gallery para importación.
- Latencia y throughput: en M4 Max GPU, prefill de 256 tokens a 3673 tok/s y decode a 144,6 tok/s; en Pixel 8a GPU, decode a 12,3 tok/s; en iPhone 17 Pro GPU, decode a 32 tok/s. Un turno corto de dictado completa en ~3 segundos en Pixel 8a CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (normalizadores de texto ASR específicos para edge). El modelo base `superwhisper/s1-mini` es el mismo checkpoint en formato fp32, y esta conversión LiteRT-LM es una variante cuantizada. Otros modelos de normalización de texto ASR existen en el ecosistema, pero no se han encontrado datos de rendimiento o licencias para establecer una comparación rigurosa.

| Modelo | Parametros | Contexto | Formato | Licencia | Uso |
|---|---|---|---|---|---|
| superwhisper/s1-mini (base) | 0,6B | No disponible | safetensors (fp32) | s1-mini-license | Normalizacion ASR |
| mlboydaisuke/S1-mini-LiteRT | 0,6B | No disponible | .litertlm (int8) | s1-mini-license | Normalizacion ASR en edge |

## Limitaciones y advertencias

- Solo soporta inglés; no hay soporte multilingüe.
- No es un modelo de chat: si se le envía una pregunta, la normalizará en lugar de responderla.
- Entradas limitadas a aproximadamente 1000 tokens; transcripciones más largas deben dividirse en fragmentos.
- La cuantización int8 puede introducir pequeñas diferencias en la salida, como se observó en Pixel 8a GPU (pérdida de un separador de fecha en un ejemplo con muchos números). Se recomienda usar el backend CPU cuando la exactitud sea crítica.
- El checkpoint liberado difiere de la tabla de ejemplos publicada en la model card original: mantiene marcadores de discurso ("Hmm,", "So") que la card espera eliminar. Esta conversión reproduce el checkpoint, no la tabla de ejemplos.
- Valores fuera de los conjuntos de control (`Styling`, `Structure`, `Context`) están fuera de contrato y pueden causar salidas alucinadas o corruptas.
- La licencia `s1-mini-license` es propietaria y no estándar; es necesario revisar sus términos antes de uso comercial.
- El modelo no está diseñado para tareas de razonamiento general, generación de código o matemáticas.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mlboydaisuke/S1-mini-LiteRT
- Modelo base (Superwhisper): https://huggingface.co/superwhisper/s1-mini
- Repositorio LiteRT-LM (runtime): https://github.com/google-ai-edge/litert-lm
- LiteRT (sucesor de TensorFlow Lite): https://github.com/google-ai-edge/litert
- Documentación de inferencia on-device con LiteRT: https://developers.google.com/edge/litert/inference
- README de referencia en coreai-model-zoo: https://github.com/john-rocky/coreai-model-zoo/blob/main/models/s1-mini/README.md
