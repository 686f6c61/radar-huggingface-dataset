# devadathanmb/utter-dictation-cleanup-qwen3-1.7b-mlx-6bit

## Resumen

Utter dictation cleanup Qwen3-1.7B MLX 6-bit es una conversion al formato MLX del ajuste fino de Utter para limpieza de dictado, construido sobre Qwen3-1.7B de Alibaba Cloud. El modelo resuelve un problema muy concreto: transformar una transcripcion cruda de voz a texto (ASR) en el texto que el hablante realmente queria escribir, eliminando muletillas, falsos arranques y autocorrecciones, y aplicando puntuacion, mayusculas en nombres propios, normalizacion de numeros y formato de listas. No resume ni responde al contenido: solo limpia.

El autor, devadathanmb, parte del GGUF Q6_K publicado por hpal007 (el modelo de limpieza de dictado de Utter) y lo convierte a MLX mediante desquantizacion, renombrado de tensores al layout de Qwen3 en Hugging Face y requantizacion afina de 6 bits con group size 64. El resultado esta pensado para inferencia en dispositivo en Apple Silicon, dentro de un fork personal de FluidVoice.

Con 1.720.574.976 parametros y un repositorio de 1,4 GB, es un modelo pequeno y especializado, no un asistente general. Su interes radica en que demuestra el patron de modelos de tarea unica destilados sobre bases pequenas y desplegados localmente: bajo coste, baja latencia y cero dependencia de la nube para una funcion de productividad cotidiana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino de tarea |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B; no confirmada en la model card) |
| Tipos de cuantizacion | MLX afina de 6 bits, group size 64 (origen: GGUF Q6_K) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen3 con 1.7 mil millones de parametros, ajustado finamente para una tarea de reescritura controlada. La model card no documenta el proceso de entrenamiento del ajuste fino original (numero de tokens, composicion del dataset, uso de RLHF o DPO); esa informacion corresponderia a la model card de hpal007/utter-dictation-cleanup-GGUF, que no se ha proporcionado en detalle.

La innovacion tecnica de esta publicacion es el pipeline de conversion: se desquantiza el GGUF Q6_K, se renombran los tensores al layout Qwen3 de Hugging Face y se requantiza con MLX en 6 bits afines con group size 64. La configuracion y el tokenizer provienen de Qwen/Qwen3-1.7B en el commit 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e, mientras que la plantilla de chat se toma del GGUF original. El uso previsto exige enviar el system prompt de Utter byte a byte (incluido su salto de linea final), el transcript crudo como mensaje de usuario, thinking desactivado y temperatura 0.

## Capacidades

- Limpieza de dictado: eliminacion de muletillas, falsos arranques y repeticiones.
- Aplicacion de autocorrecciones: el hablante corrige algo y el modelo conserva solo la version final.
- Puntuacion y mayusculas: inserta signos y capitaliza nombres propios segun el contexto.
- Normalizacion de numeros y formato de listas a partir del texto dictado.
- Reescritura fiel: no resume, no responde preguntas ni anade contenido ausente en el transcript.
- Generacion de texto conversacional en formato chat (pipeline text-generation), con plantilla de chat Qwen3.
- Modo thinking disponible en la plantilla, pero el uso recomendado lo desactiva.
- No documenta soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Post-procesado de dictado en dispositivo: integrar el modelo en una app de dictado para Apple Silicon que reciba la salida del ASR y devuelva texto limpio antes de insertarlo en el campo de escritura; encaja por su tamano y su formato MLX.
- Correo y mensajeria por voz: limpiar transcripciones de mensajes largos dictados con el movil, aplicando puntuacion y corrigiendo autocorrecciones antes de enviar.
- Notas de reunion: convertir transcripciones de una sola intervencion en notas legibles con listas y numeros normalizados, sin resumir el contenido.
- Entrada de texto en herramientas de accesibilidad: usuarios que dependen del dictado pueden obtener texto con formato correcto en editores y formularios.
- Automatizacion de pipelines de transcripcion: paso de limpieza determinista (temperatura 0) tras un ASR por lotes, con salida reproducible.
- Prototipado de asistentes de voz locales: usar el modelo como componente de reescritura en un pipeline mayor que opere sin conexion en un Mac.
- Evaluacion de tecnicas de cuantizacion: servir como caso de estudio de conversion GGUF Q6_K a MLX 6-bit y medir la degradacion en tareas de reescritura estricta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el repositorio ocupa 1,4 GB en 6 bits; la inferencia requiere aproximadamente esa cifra mas el overhead de MLX y la cache KV.
- Hardware objetivo: Apple Silicon (MLX). No esta pensado para CUDA.
- Cabe en cualquier Mac con memoria unificada de 8 GB o superior; con 16 GB hay margen amplio para contexto y otras aplicaciones.
- Despliegue: mlx_lm (load y generate) es la via documentada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con estos pesos MLX; para esos entornos habria que usar el GGUF original de hpal007.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Este modelo (Utter cleanup MLX 6-bit) | 1,72 B | no disponible | safetensors MLX | Apache-2.0 | Limpieza de dictado en dispositivo |
| hpal007/utter-dictation-cleanup-GGUF | ~1,7 B (Q6_K) | no disponible | GGUF | Apache-2.0 (segun cadena de origen) | Mismo ajuste fino, para llama.cpp y similares |
| Qwen/Qwen3-1.7B | 1,72 B | no disponible | safetensors | Apache-2.0 | Modelo base generalista, sin especializar en limpieza |
| Modelos de limpieza de ASR comerciales (p. ej. APIs de posprocesado) | no disponible | no disponible | API | propietaria | Limpieza de transcripciones en nube |

La comparacion relevante es con el GGUF de origen: mismos pesos de ajuste fino, distinto contenedor y cuantizacion. Frente a Qwen3-1.7B base, este modelo gana en adherencia a la tarea de limpieza pero pierde flexibilidad general.

## Limitaciones y advertencias

- Modelo de tarea unica: no es un asistente general; usarlo fuera del patron system prompt + transcript produce salidas poco fiables.
- Requiere el system prompt de Utter byte a byte, incluido el salto de linea final; cualquier desviacion altera el comportamiento.
- Recomendado temperatura 0 y thinking desactivado; otros ajustes pueden degradar la fidelidad de la reescritura.
- Idiomas soportados no documentados; el comportamiento multilingue no esta garantizado.
- Riesgo de alucinacion: aunque el modelo esta disenado para no anadir contenido, en transcripciones ambiguas puede completar palabras o reinterpretar frases.
- Solo MLX: no es directamente utilizable en CUDA ni en servidores x86 sin conversion adicional.
- Sin datos de benchmarks ni evaluacion cuantitativa de calidad de limpieza.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validacion externa.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la cadena de licencias del ajuste fino original de hpal007.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devadathanmb/utter-dictation-cleanup-qwen3-1.7b-mlx-6bit
- Modelo de origen (GGUF): https://huggingface.co/hpal007/utter-dictation-cleanup-GGUF
- System prompt de Utter: https://huggingface.co/hpal007/utter-dictation-cleanup-GGUF#system-prompt
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Libreria MLX LM: https://github.com/ml-explore/mlx-lm
