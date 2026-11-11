# Pangxielaoban/med-doc-models

## Resumen

El repositorio `Pangxielaoban/med-doc-models` no es un modelo único, sino un paquete de artefactos de inferencia en dispositivo (on-device) para una aplicación Android de asistencia a la documentación clínica ("医护文书助手", asistente de documentación médica). Contiene tres pesos: un modelo ASR Dolphin-CN-Dialect en formato ONNX (versiones int8 y fp32) para reconocimiento de voz en 22 dialectos chinos y mandarín, y un Qwen2.5-2B afinado con LoRA sobre textos médicos y cuantizado a Q4_K_M en GGUF para la generación de borradores de documentos clínicos. El conjunto suma 1.881.825.088 parámetros declarados en safetensors y un tamaño de repositorio de 2,5 GB.

El interés técnico está en el patrón de despliegue: un pipeline completo de voz a texto y generación de texto empaquetado para ejecutarse localmente en un teléfono, con descarga diferida al primer arranque y verificación por bytes. El modelo de lenguaje es un transformer denso de 2B parámetros derivado de Qwen2.5-2B, por lo que su contexto nativo y capacidades heredan las del modelo base, aunque el autor no documenta cambios en la longitud de contexto ni en el tokenizador.

La relevancia es acotada: se trata de un repositorio de distribución de pesos para una app concreta, con cero descargas y sin model card técnica detallada, benchmarks ni especificación de licencia propia. Es útil como referencia de empaquetado on-device de ASR más LLM en el dominio sanitario, pero no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dos componentes: ASR Dolphin-CN-Dialect (encoder-decoder con CTC, salida mel→CTC logits) y LLM transformer denso derivado de Qwen2.5-2B |
| Parámetros totales | 1.881.825.088 (declarados en safetensors; el GGUF Q4_K_M corresponde a los ~2B del LLM) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no documentada; heredada de Qwen2.5-2B, sin confirmar por el autor) |
| Tipos de cuantización | ONNX int8 y fp32 (ASR); GGUF Q4_K_M (LLM) |
| Idiomas soportados | Chino: mandarín y 22 dialectos chinos (ASR). El LLM se distribuye sin lista de idiomas declarada |
| Licencia | No disponible como licencia propia; los pesos derivan de Dolphin (Apache-2.0) y Qwen2.5-2B (Qwen License) |
| Formato de pesos | ONNX (`dolphin_cn_small.int8.onnx`, `dolphin_cn_small.fp32.onnx`), GGUF (`qwen2b_med_v9_q4km.gguf`), vocabulario `units.txt` |

## Arquitectura y entrenamiento

El componente de reconocimiento de voz es Dolphin-CN-Dialect en variante small, un modelo de DataoceanAI y la Universidad de Tsinghua publicado bajo Apache-2.0. La model card describe la ruta de cómputo como mel→CTC logits, con un vocabulario de 18.173 tokens (`units.txt`) y cobertura de 22 dialectos chinos además del mandarín. El artefacto int8 (260,9 MB) ha pasado por `onnxsim` para simplificar el grafo; existe además una versión fp32 (920,1 MB) que el autor reserva como referencia de precisión y que la app no utiliza.

El componente generativo es Qwen2.5-2B, un transformer denso de Alibaba, sometido a un ajuste LoRA sobre textos médicos por parte del autor del repositorio (versión "v9") y convertido a GGUF Q4_K_M (1.215,4 MB) para llama.cpp. No se documentan el volumen de tokens de entrenamiento, la composición del corpus clínico, ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado. Tampoco se especifican innovaciones de decodificación (especulativa, atención lineal) ni modificaciones al contexto nativo del modelo base.

## Capacidades

- Reconocimiento automático de voz en mandarín y 22 dialectos chinos, con salida de logits CTC lista para decodificación externa.
- Generación de texto en chino orientada a la redacción de documentos clínicos (historiales, notas de evolución, resúmenes), según la finalidad declarada por el autor.
- Ejecución local en dispositivo Android, sin dependencia de servidores una vez descargados los pesos.
- Descarga con reanudación HTTP por rangos (Range) y verificación de integridad por recuento de bytes.
- Conversación multi-turno: el repositorio incluye la etiqueta `conversational`, aunque no se detalla el formato de plantilla de chat empleado.
- Tool calling / function calling: no disponible en la documentación.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la documentación.
- Visión, audio nativo en el LLM o modo "thinking": no disponibles.

## Casos de uso

- Dictado clínico en consulta: el ASR Dolphin transcribe la voz del facultativo, incluidos dialectos, y el LLM Q4_K_M genera un borrador estructurado de la nota de consulta en el propio teléfono, sin enviar datos de pacientes a la nube.
- Documentación en entornos con conectividad intermitente: al ejecutarse on-device tras la descarga inicial, el pipeline sigue operativo en plantas sin cobertura o en zonas rurales, un escenario habitual en el sistema sanitario chino.
- Triaje administrativo de altas y derivaciones: el modelo puede redactar resúmenes de alta a partir de notas dictadas, reduciendo el tiempo de tecleo del personal administrativo.
- Cumplimiento y privacidad: al no requerir inferencia remota, el flujo evita la transferencia de datos identificativos fuera del dispositivo, lo que simplifica el encaje con normativas de protección de datos sanitarios.
- Distribución de modelos en apps móviles: el patrón de descarga diferida con espejo (`hf-mirror.com`) y fallback a Hugging Face sirve como referencia para publicar pesos de varios cientos de MB en aplicaciones Android con usuarios en China.
- Evaluación comparativa de ASR dialectal: la pareja int8/fp32 permite medir la pérdida de precisión introducida por la cuantización en el mismo modelo antes de desplegarlo.
- Prototipado de asistentes sanitarios de bajo coste: un LLM de 2B en Q4_K_M cabe en hardware móvil de gama media-alta, lo que facilita pilotos sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER para el ASR ni evaluaciones de calidad de texto para el LLM, y tampoco ofrece comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para el LLM: aproximadamente 1,2 GB para los pesos Q4_K_M, más overhead de contexto KV; en la práctica, entre 1,5 y 2,5 GB de memoria según longitud de contexto y backend.
- VRAM estimada para el ASR: unos 260 MB en int8 y unos 920 MB en fp32, además de las activaciones.
- GPU recomendadas: el diseño es on-device (CPU/GPU móvil vía ONNX Runtime y llama.cpp); para servidor no se especifican modelos, aunque cualquier GPU con más de 4 GB permitiría ejecutar ambos componentes.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (por ejemplo, RTX 3050 en adelante); en el objetivo real, en teléfonos Android de gama media-alta.
- Opciones de despliegue: llama.cpp para el GGUF, ONNX Runtime para los modelos Dolphin, y cualquier runtime compatible con GGUF (Ollama, entre otros). No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| med-doc-models (este repo) | ~2B (LLM) + ASR small | No disponible | Chino (mandarín + 22 dialectos en ASR) | Derivada: Apache-2.0 + Qwen License | ONNX + GGUF |
| Qwen2.5-2B (base) | 2B | 32K (según documentación de Alibaba; no confirmado aquí) | Multilingüe | Qwen License | safetensors, GGUF |
| Dolphin-CN-Dialect small (base ASR) | No disponible | No aplica | Chino dialectal | Apache-2.0 | ONNX, PyTorch |
| Whisper small | 244M | No aplica (ASR) | Multilingüe | MIT | safetensors, ONNX, GGUF |

La comparación con Whisper small es pertinente solo como referencia de tamaño en ASR; la ventaja declarada de Dolphin es la cobertura de dialectos chinos, no documentada con métricas en este repositorio.

## Limitaciones y advertencias

- Finalidad restringida: el autor indica explícitamente que los pesos sirven para asistencia a la redacción de documentos clínicos y no para decisiones diagnósticas ni para sustituir el criterio del personal sanitario.
- Licencia no unívoca: el repositorio no declara licencia propia; el uso comercial queda sujeto a la Qwen License del modelo base y a Apache-2.0 del ASR, con obligaciones que el autor no detalla.
- Ausencia de métricas: sin WER, sin evaluaciones de calidad de texto y sin benchmarks, no es posible estimar la fiabilidad del ajuste médico ni la degradación por cuantización Q4_K_M.
- Riesgo de alucinación: un LLM de 2B cuantizado a 4 bits en dominio clínico puede generar contenido plausible pero incorrecto; requiere revisión humana obligatoria.
- Sesgo lingüístico: el ASR está entrenado para chino y sus dialectos; el rendimiento en otras lenguas no está documentado y probablemente sea nulo o deficiente.
- Contexto sin especificar: al no documentarse la ventana efectiva tras el ajuste LoRA, no se puede garantizar el manejo de documentos clínicos largos.
- Madurez: cero descargas y cero valoraciones en el momento de la consulta; es un artefacto de distribución de una app, no un modelo validado por la comunidad.
- Dependencia de infraestructura externa: el flujo de descarga depende de `hf-mirror.com` y de Hugging Face, con implicaciones de disponibilidad y de gobernanza de datos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Pangxielaoban/med-doc-models
- Descarga directa (espejo): https://hf-mirror.com/Pangxielaoban/med-doc-models/resolve/main/dolphin_cn_small.int8.onnx
- Modelo base del LLM (Qwen2.5-2B): no se proporciona enlace en la información disponible
- Modelo base del ASR (Dolphin, DataoceanAI/Tsinghua): no se proporciona enlace en la información disponible
- Paper, blog o demo del autor: no disponibles
