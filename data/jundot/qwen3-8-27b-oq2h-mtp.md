# Jundot/Qwen3.8-27B-oQ2h-mtp

## Resumen

Qwen3.8-27B-oQ2h-mtp es una cuantización de precisión mixta del modelo Qwen/Qwen3.8-27B, un modelo denso de visión-lenguaje de 27.000 millones de parámetros construido sobre la arquitectura Qwen3.5. La publica el usuario Jundot mediante su herramienta oQ (omlx), un planificador de cuantización de precisión mixta orientado al ecosistema MLX de Apple Silicon. El checkpoint incluye el backbone de lenguaje, el codificador visual y la cabeza de predicción multi-token (MTP), y está pensado para ejecutarse en hardware Apple con el runtime oMLX 0.8.0 o superior.

El interés de esta ficha no reside en el modelo base, sino en la técnica de compresión: el formato oQh almacena cada capa lineal del decodificador como códigos enteros con una única escala por fila de salida, aplicada sobre una entrada rotada mediante una transformada de Hadamard por bloques con signo. Al eliminar las escalas y sesgos por grupo del formato anterior (oQe), el planificador libera aproximadamente 0,5 bits por peso y los reinvierte en más bits para los tensores más sensibles, de modo que un fichero oQh ocupa lo mismo que un oQe del mismo nivel pero con menor divergencia KL respecto al modelo BF16.

El resultado es un checkpoint de 11,8 GB en disco (11,02 GiB) que mantiene 262.144 tokens de contexto nativo y capacidades de comprensión de imagen y vídeo, con un promedio efectivo de 3,407 bits por peso para el conjunto completo y 3,152 bits por peso para el backbone de lenguaje. Es, por tanto, una opción para desplegar un VLM de 27B en equipos con memoria unificada moderada, a costa de requerir un runtime específico y no estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas Gated DeltaNet y Gated Attention (Qwen3.5), más codificador visual y cabeza MTP |
| Parametros totales | 27.781B lógicos (5.724.930.800 según safetensors del repo; discrepancia no aclarada en la información disponible) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | oQh 2/3/4/5 bits con escala por fila; affine 3/4/5 bits con grupo 64; BF16 en tensores seleccionados |
| Idiomas soportados | No disponible (la model card menciona prompts en 7 idiomas para la evaluación FLORES+ y Aya, sin listarlos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), formato oQh |
| Bits efectivos por peso | 3,407 (checkpoint completo); 3,152 (backbone de lenguaje) |
| Tamano en disco | 11,833 GB / 11,020 GiB |
| Libreria / runtime | mlx; requiere oMLX >= 0.8.0 con soporte oQh |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-27B |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B con un diseño híbrido que combina capas Gated DeltaNet (atención lineal con estado recurrente) y capas Gated Attention clásicas. Esta mezcla busca reducir el coste de atención en contextos largos manteniendo la calidad de recuperación de la atención completa. El checkpoint incorpora además un codificador visual de 0,461B de parámetros y una cabeza de predicción multi-token (MTP) de 0,425B, que permite decodificación especulativa interna para acelerar la generación. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original.

La innovación técnica de este checkpoint concreto es el formato oQh. Cada matriz lineal del decodificador se cuantiza a códigos enteros con una sola escala por fila de salida, calculada tras aplicar una transformada de Hadamard por bloques con signo a la entrada; los códigos se eligen optimizando contra las estadísticas de activación de cada capa. La distribución de bits resultante concentra el 70,8% de los pesos lógicos en 3 bits y el 10,9% en 2 bits, mientras reserva 5 bits para 1,51B de parámetros sensibles y mantiene en BF16 0,516B (incluyendo embedding de tokens, cabeza de salida y cabeza MTP, que permanecen en grupos affine). Según la model card, a igual tamaño que oQ2, oQh reduce la divergencia KL frente a BF16 un 47% en FLORES+, un 46% en Aya y un 41% en código.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana nativa de 262.144 tokens.
- Comprensión de imagen y vídeo (pipeline image-text-to-text), incluyendo preguntas sobre contenido visual.
- Generación y análisis de código, con evaluación específica de divergencia KL sobre fuente Python en la model card.
- Capacidades multilingües: la evaluación del autor usa prompts en 7 idiomas (FLORES+ y Aya), aunque no se detalla la lista ni el nivel de competencia por idioma.
- Decodificación multi-token (MTP) integrada en el checkpoint, orientada a acelerar la inferencia.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni flujos de agentes multi-paso; debe verificarse contra la model card del modelo base.

## Casos de uso

- Análisis de documentos escaneados y capturas en local: el codificador visual permite extraer y razonar sobre texto e imágenes sin enviar datos a la nube, con 262.144 tokens de contexto para documentos extensos.
- Asistencia sobre vídeo en equipos Apple Silicon: el modelo puede procesar secuencias de fotogramas y responder preguntas temporales, aprovechando el contexto largo para resumir grabaciones completas.
- Generación de código en un IDE local: con 27B de parámetros y evaluación específica sobre Python, es adecuado para autocompletado y refactorización en un Mac Studio o MacBook Pro de gama alta, sin depender de APIs externas.
- Prototipado de agentes visuales en investigación: la ventana de 262K tokens permite mantener historiales largos de interacción con imágenes intermedias, útil para experimentos de razonamiento multi-paso sobre entornos gráficos.
- Traducción y análisis multilingüe: los datos de FLORES+ y Aya sugieren uso en tareas de traducción y comprensión multilingüe, aunque la lista exacta de idiomas debe confirmarse con el modelo base.
- Despliegue en estaciones de trabajo con memoria unificada de 16-32 GB: el tamaño de 11,8 GB deja margen para el KV cache y el codificador visual en configuraciones de 24 GB o superiores.
- Evaluación comparativa de técnicas de cuantización: sirve como referencia para medir la pérdida de calidad de oQh frente a oQe y BF16 en tareas de texto, código y multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta divergencia KL frente al modelo BF16 para los formatos oQe y oQh:

| Nivel | Tamano | KL FLORES+ (oQe -> oQh) | KL Aya (oQe -> oQh) | KL codigo (oQe -> oQh) |
|---|---|---|---|---|
| oQ2 | 9,9 GiB | 0,19 -> 0,10 (-47%) | 0,21 -> 0,11 (-46%) | 0,13 -> 0,078 (-41%) |
| oQ3 | 12,2 GiB | 0,066 -> 0,040 (-39%) | 0,082 -> 0,040 (-51%) | 0,052 -> 0,037 (-28%) |

Estas cifras corresponden a builds solo de texto (sin codificador visual ni cabeza MTP) y no sustituyen a evaluaciones de tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM/memoria unificada: el checkpoint completo ocupa 11,02 GiB; con KV cache para 262K tokens y el codificador visual, se recomienda un mínimo de 24 GB de memoria unificada, y 32 GB o más para contextos largos.
- GPU compatibles: exclusivamente Apple Silicon (MLX). No hay soporte para CUDA, ROCm ni CPU genérica en este formato.
- Equipos consumer: cabe en MacBook Pro con M-series Pro/Max de 24-36 GB y en Mac Studio; no es viable en equipos con 16 GB si se usan contextos largos.
- Despliegue: requiere oMLX 0.8.0 o superior con soporte oQh. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no reconocen el formato oQh.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ2h-mtp (este) | 27,781B lógicos | 262.144 | oQh / MLX (oMLX >= 0.8.0) | Apache-2.0 | Cuantización mixta 3,407 bits/ peso |
| Qwen/Qwen3.8-27B (BF16) | 27,781B | 262.144 | safetensors / múltiples | Apache-2.0 | Modelo de referencia sin pérdida de cuantización; requiere ~55 GB |
| Qwen3.8-27B oQ2 (oQe) | 27,781B | 262.144 | oQe / MLX | Apache-2.0 | Mismo tamaño que oQh, mayor KL según la model card |
| Alternativas de 27B densas con visión | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Dependencia de runtime: el formato oQh solo lo carga oMLX 0.8.0 o superior; versiones anteriores fallan al cargar el checkpoint. Esto limita la portabilidad y la integración en pipelines estándar.
- Exclusividad de plataforma: MLX implica Apple Silicon; no hay ruta de despliegue en servidores NVIDIA o AMD sin reconvertir el modelo.
- Discrepancia de parámetros: la model card indica 27,781B lógicos, pero el recuento de safetensors del repo es de 5.724.930.800; conviene verificar el inventario real de tensores antes de dimensionar memoria.
- Pérdida de calidad por cuantización: con 3,407 bits/peso efectivos, la divergencia KL frente a BF16 es no nula (0,10 en FLORES+ para oQ2), lo que puede degradar tareas de razonamiento fino o código complejo.
- Idiomas no especificados: la model card no lista los 7 idiomas evaluados ni garantiza cobertura; el rendimiento en castellano no está documentado.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de sesgos para este checkpoint; debe asumirse el comportamiento del modelo base, no verificado aquí.
- Tool calling y agentes: no se documenta soporte explícito; no debe asumirse en producción sin pruebas.
- Licencia Apache-2.0: permite uso comercial, pero el autor remite a la licencia del modelo base; conviene revisar los términos de Qwen/Qwen3.8-27B por si añaden restricciones adicionales.
- Repo sin descargas ni likes y creado recientemente: no hay evidencia de comunidad ni de validación independiente de la calidad del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/Qwen3.8-27B-oQ2h-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oQ / omlx: https://github.com/jundot/omlx
- Pull request del formato oQh: https://github.com/jundot/omlx/pull/5317
