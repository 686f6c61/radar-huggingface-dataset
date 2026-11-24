# charcot-ai/marimba-quant-cpu-int8

## Resumen
Marimba quant-cpu-int8 es un artefacto de despliegue publicado por charcot-ai: la torre de audio del modelo de preguntas sobre voz Marimba, cuantizada a 8 bits para ejecución en CPU. No es un modelo generativo completo, sino el codificador congelado que transforma un espectrograma log-mel de 8 segundos en representaciones ocultas intermedias; las cabezas de clasificación por pregunta residen en el repositorio base `charcot-ai/marimba` y se usan sin modificar.

El codificador corresponde a la torre de audio de Qwen/Qwen3-ASR-0.6B: 18 capas transformer, 186,4 M de parámetros, con entradas `[B, 128, 800]` y salidas en las capas 9, 12 y 18 de forma `[B, 104, 896]`. Este repositorio ofrece cinco variantes de cuantización (OpenVINO con NNCF, PyTorch 2 Export) para reducir el coste de inferencia en servidores sin GPU.

Su relevancia es práctica: permite ejecutar tareas de detección de fin de turno, actividad de voz, cambio y recuento de hablantes sobre ventanas cortas con pérdidas de rendimiento mínimas respecto a fp32, ocupando entre 187 MB y 370 MB en disco frente a los 739 MB de la representación fp32. La licencia Apache 2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (codificador de audio, 18 capas), derivado de Qwen/Qwen3-ASR-0.6B |
| Parametros totales | 186,4 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 8 s (entrada `[B, 128, 800]` log-mel, salida `[B, 104, 896]`) |
| Tipos de cuantizacion | INT8 estática (NNCF PTQ y NNCF accuracy control), INT8 de pesos (`int8_asym`), FP16, FP32; PyTorch 2 Export INT8 en capas lineales |
| Idiomas soportados | no disponibles (el codificador es agnóstico al idioma; la evaluación incluye FLEURS `pt_br`) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (`encoder.xml` + `encoder.bin`) y PyTorch 2 Export (`encoder_l12.pt2`, `encoder_l18.pt2`) |

## Arquitectura y entrenamiento
El codificador es un transformer de 18 capas con 186,4 M de parámetros, tomado congelado de la torre de audio de Qwen3-ASR-0.6B. Consume espectrogramas log-mel de forma `[B, 128, 800]` (8 segundos a 16 kHz) y expone las representaciones ocultas de las capas 9, 12 y 18, cada una de forma `[B, 104, 896]`. Sobre estas representaciones, las cabezas del modelo base resuelven preguntas discretas en una sola pasada.

No se ha publicado información sobre el dataset de entrenamiento original del codificador ni sobre procesos de RLHF o DPO en la información disponible. La contribución de este repositorio es exclusivamente de cuantización post-entrenamiento: se aplican NNCF `quantize_with_accuracy_control` (con la primera convolución en coma flotante), NNCF PTQ con preset de transformer, NNCF `compress_weights` con `int8_asym` sin calibración, y PyTorch 2 Export con `X86InductorQuantizer` (lineales en 8 bits, convoluciones en coma flotante).

## Capacidades
- Extracción de representaciones de audio para ventanas de 8 segundos a 16 kHz mono.
- Detección de fin de turno (`turn_end`, evaluado sobre Smart Turn v3.2).
- Detección de actividad de voz (`voice_activity`), con evaluación a 1 s final y a 8 s completos.
- Detección de cambio de hablante (`speaker_change`).
- Recuento de hablantes (`speaker_count`).
- Verificación de mismo hablante (`same_speaker`).
- Salidas multi-capa (capas 9, 12 y 18) para alimentar distintas cabezas.
- Ejecución en CPU con OpenVINO (AVX2, AVX-512, AVX512_BF16, VNNI) y con PyTorch 2 Export.
- No incluye generación de texto, tool calling, agentes ni capacidades multimodales más allá del audio de entrada.

## Casos de uso
- Detección de fin de turno en asistentes de voz: el codificador, combinado con la cabeza `turn_end` del modelo base, permite decidir cuándo el usuario ha terminado de hablar en ventanas de 8 s, con AUROC de 0,9310 en fp32 y 0,9324 en la variante `nncf-acc-0p01/` sobre AVX2.
- Segmentación de actividad de voz en pipelines de transcripción: la salida de 8 s alcanza AUROC 0,9999, útil para recortar silencio antes de enviar audio a un ASR más costoso.
- Diarización ligera en CPU: las cabezas `speaker_change` y `speaker_count` permiten detectar cambios de hablante y estimar el número de interlocutores en reuniones, con precisión de 0,7862 en fp32 y 0,7851 en `nncf-acc-0p01/`.
- Verificación de hablante en autenticación o control de acceso: la cabeza `same_speaker` alcanza AUROC 0,9926 en fp32, con degradación mínima en las variantes INT8.
- Despliegue en servidores sin GPU: las variantes OpenVINO de 187 MB permiten servir estas tareas en CPUs Xeon con AVX2 o AVX-512, reduciendo el coste frente a fp32 (739 MB).
- Procesamiento por lotes de archivos de audio en entornos con restricciones de memoria: la variante `ov-fp16/` (370 MB) mantiene métricas prácticamente idénticas a fp32 con la mitad de espacio en disco.
- Integración en aplicaciones de borde con PyTorch: los programas exportados `encoder_l12.pt2` y `encoder_l18.pt2` permiten ejecutar la cuantización INT8 con el stack de PyTorch 2 sin depender de OpenVINO.

## Benchmarks y rendimiento
Evaluación sobre 1.170 ventanas públicas de 8 s (16 kHz mono) con las cabezas publicadas de Marimba. La referencia fp32 es el codificador en PyTorch a 32 bits. "Decisiones cambiadas" cuenta respuestas distintas de fp32 sobre 6.516 salidas.

| Variante | Esquema | Kernels | Tamano | turn_end AUROC | voice_activity (1 s) | voice_activity (8 s) | same_speaker | speaker_change | speaker_count | Cambios vs fp32 |
|---|---|---|---|---|---|---|---|---|---|---|
| fp32 referencia (PyTorch) | 32-bit float | AVX-512 | - | 0,9310 | 0,9969 | 0,9999 | 0,9926 | 0,9557 | 0,7862 | 0 |
| `ov-fp16/`, f32 | FP16 pesos, f32 inferencia | AVX-512 | 370 MB | 0,9309 | 0,9969 | 0,9999 | 0,9926 | 0,9558 | 0,7862 | 0 |
| `ov-fp16/`, bf16 | FP16 pesos, bf16 inferencia | AVX-512 + AVX512_BF16 | 370 MB | 0,9310 | 0,9969 | 0,9999 | 0,9926 | 0,9557 | 0,7862 | 5 |
| `nncf-ptq/` | INT8 estática (preset transformer) | AVX-512 + VNNI | 187 MB | 0,9322 | 0,9968 | 0,9999 | 0,9922 | 0,9562 | 0,7782 | 109 |
| `nncf-ptq/` | INT8 estática (preset transformer) | AVX2 | 187 MB | 0,9311 | 0,9970 | 0,9999 | 0,9924 | 0,9566 | 0,7782 | 127 |
| `nncf-acc-0p01/` | INT8 estática (accuracy control) | AVX-512 + VNNI | 187 MB | 0,9335 | 0,9968 | 0,9999 | 0,9927 | 0,9558 | 0,7862 | 79 |
| `nncf-acc-0p01/` | INT8 estática (accuracy control) | AVX2 | 187 MB | 0,9324 | 0,9969 | 0,9999 | 0,9926 | 0,9558 | 0,7851 | 97 |

La variante `nncf-acc-0p01/` es la que menos decisiones altera (79 de 6.516 con AVX-512 + VNNI) y mantiene la precisión de `speaker_count` en 0,7862, igual que fp32. `nncf-ptq/` reduce el tamaño al mismo nivel pero degrada `speaker_count` en torno a 0,008 puntos.

## Requisitos de hardware
- VRAM: no aplica; todas las variantes están pensadas para CPU.
- RAM estimada: en torno a 187 MB para las variantes INT8 y 370 MB para `ov-fp16/`, más el overhead del runtime OpenVINO o PyTorch.
- CPU recomendadas: Intel Xeon con AVX2 como mínimo; AVX-512 con VNNI para las variantes INT8; AVX512_BF16 para la inferencia bf16 de `ov-fp16/`.
- GPU: no se documenta soporte GPU para estas variantes; el repositorio está orientado a CPU.
- Despliegue: OpenVINO Runtime para las carpetas `nncf-acc-0p01/`, `nncf-ptq/`, `ov-fp16/` y `ov-w8/`; PyTorch 2 con `X86InductorQuantizer` para `pt2e-float-convs/`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `charcot-ai/marimba-quant-cpu-int8` | 186,4 M (codificador) | ventanas de 8 s | OpenVINO IR, PyTorch 2 Export | Apache 2.0 | Cuantización INT8/FP16 para CPU; incluye solo el codificador |
| `charcot-ai/marimba` (base) | no disponible | ventanas de 8 s | no disponible | Apache 2.0 (según tag del derivado) | Modelo completo con cabezas de pregunta; referencia fp32 |
| Qwen/Qwen3-ASR-0.6B | 0,6 B (aproximado por nombre) | no disponible | no disponible | no disponible | Modelo ASR del que se extrae la torre de audio |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias
- El repositorio contiene únicamente el codificador de audio; sin las cabezas de `charcot-ai/marimba` no produce respuestas a preguntas.
- La entrada está restringida a ventanas de 8 s a 16 kHz mono con espectrograma log-mel de forma `[B, 128, 800]`; no admite audio de duración arbitraria sin segmentación previa.
- Los kernels cuantizados redondean de forma distinta según el conjunto de instrucciones; los resultados pueden variar entre AVX2 y AVX-512, como muestran las diferencias en `speaker_count` y en el recuento de decisiones cambiadas.
- `nncf-ptq/` degrada `speaker_count` en torno a 0,008 puntos respecto a fp32; para esa tarea es preferible `nncf-acc-0p01/`.
- No se documentan sesgos, riesgos de alucinación ni cobertura idiomática del codificador en la información disponible; la evaluación incluye FLEURS `pt_br`, pero no se detalla el rendimiento por idioma.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el codificador original de Qwen pueden tener condiciones adicionales que conviene verificar antes de producción.
- No se han publicado datos de latencia ni throughput, por lo que el dimensionamiento de producción debe medirse en el hardware objetivo.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/charcot-ai/marimba-quant-cpu-int8
- Modelo base Marimba: https://huggingface.co/charcot-ai/marimba
- Modelo de origen de la torre de audio: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
