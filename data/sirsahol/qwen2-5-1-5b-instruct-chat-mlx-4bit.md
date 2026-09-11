# SirSahOl/Qwen2.5-1.5B-Instruct-chat-mlx-4bit

## Resumen

SirSahOl/Qwen2.5-1.5B-Instruct-chat-mlx-4bit es una conversión a cuantización de 4 bits en formato MLX del modelo Qwen/Qwen2.5-1.5B-Instruct, publicada por el usuario SirSahOl. No se trata de un modelo nuevo ni de un reentrenamiento: es una conversión weight-only orientada a ejecución en Apple Silicon (M1 o posterior) mediante la librería mlx-lm de Apple, con la arquitectura y el comportamiento heredados íntegramente del modelo base. El repositorio ocupa 0,9 GB y el artefacto convertido pesa 839,3 MB, con 1.543.714.304 parámetros declarados en los safetensors.

Su relevancia es práctica más que científica: permite ejecutar un modelo instructivo de 1,5B parámetros en portátiles y equipos de escritorio con memoria unificada de 8 GB, con un rendimiento medido de 51,35 tokens por segundo y un time-to-first-token de 19,48 ms en un Apple M1. Frente a la variante de 16 bits, la conversión de 4 bits multiplica por algo más de tres la velocidad de generación, a costa de una pérdida de calidad que el propio autor reconoce como pequeña pero no nula.

La licencia es Apache 2.0, heredada del modelo base, por lo que permite uso comercial sin restricciones adicionales. El modelo no acumula descargas ni likes y la búsqueda web no ha devuelto documentación técnica adicional relevante, por lo que toda la información verificable procede de la model card del autor y de los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), heredada del modelo base. Cuantización weight-only de 4 bits en MLX |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens según el modelo base Qwen2.5-1.5B-Instruct; no se especifica en la model card de esta conversión |
| Tipos de cuantizacion | 4 bits (MLX). El mismo autor publica variantes de 8 bits y 16 bits |
| Idiomas soportados | No disponible en la ficha ni en los metadatos; el modelo base declara soporte multilingüe |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (formato MLX, no compatible con llama.cpp/GGUF) |

Otros datos de conversión declarados por el autor: mlx-lm 0.31.3, tiempo de conversión 13,0 s, tamaño de salida 839,3 MB, fecha 2026-09-10. Tamaño del repositorio en HuggingFace: 0,9 GB.

## Arquitectura y entrenamiento

Esta ficha corresponde a una conversión, no a un entrenamiento. El autor aplica una cuantización de 4 bits sobre los pesos del modelo Qwen2.5-1.5B-Instruct mediante el comando `mlx_lm.convert --hf-path Qwen/Qwen2.5-1.5B-Instruct --mlx-path output/Qwen2.5-1.5B-Instruct-mlx-4bit -q --q-bits 4` con mlx-lm 0.31.3. La conversión es weight-only: no se modifica la topología de la red, ni la tokenización, ni el proceso de entrenamiento instruccional del modelo original. Por tanto, la arquitectura subyacente es la de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención por consultas agrupadas (GQA) y RoPE, del que no se detallan en esta model card ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF o DPO.

La innovación técnica relevante aquí no está en el modelo sino en el formato: MLX es el framework de Apple para cómputo en memoria unificada, y esta conversión aprovecha la cuantización de 4 bits para reducir el peso del artefacto hasta 839,3 MB. El precio es una pérdida de calidad acumulativa respecto a los pesos originales, que el autor reconoce explícitamente y que se acentúa al bajar el número de bits. No se documenta en la información disponible ninguna técnica adicional como decodificación especulativa, atención lineal ni modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico de un solo turno y multi-turno dentro de una ventana de contexto limitada.
- Asistencia de código y matemáticas elementales, con las limitaciones propias de un modelo de 1,5B parámetros.
- Ejecución local íntegra en Apple Silicon: los datos no salen del equipo, sin depender de API externas.
- Modo chat interactivo mediante `mlx_lm.chat` y generación por lotes mediante `mlx_lm.generate`.
- Integración como librería en Python con `mlx_lm.load` y `mlx_lm.generate`, con control de `max_tokens`.
- Soporte de tool calling, modo thinking, visión o audio: no disponible; no se documenta ninguna de estas capacidades en la información proporcionada.

## Casos de uso

- Asistentes conversacionales embebidos en aplicaciones de escritorio para macOS: el modelo se carga en memoria unificada con `mlx_lm.load` y responde en local, lo que evita enviar conversaciones de usuarios a servicios externos y simplifica el cumplimiento de requisitos de privacidad.
- Prototipado rápido de funcionalidades de chat en portátiles de desarrollo: con 51,35 tokens/s y un TTFT de 19,48 ms en un M1, el ciclo de iteración sobre prompts y plantillas es interactivo sin necesidad de GPU dedicada.
- Clasificación y extracción de información sobre texto corto (etiquetado de tickets, resumen de correos, extracción de campos de facturas) en pipelines por lotes ejecutados con `mlx_lm.generate` sobre un Mac mini o un MacBook.
- Generación de borradores de documentación técnica o de comentarios de código en herramientas de desarrollo local, asumiendo revisión humana obligatoria por el riesgo de alucinación de un modelo de 1,5B.
- Filtrado previo y enrutado de consultas en arquitecturas con varios modelos: usar esta variante de 4 bits como primer nivel barato que decide si una petición debe escalarse a un modelo mayor alojado en servidor.
- Demostraciones y docencia sobre cuantización: el repositorio incluye las variantes de 4, 8 y 16 bits con métricas comparables, lo que permite medir en el aula el compromiso entre velocidad, memoria y calidad sin infraestructura especial.
- Evaluación comparativa de frameworks en Apple Silicon: sirve como carga de trabajo reproducible para medir tok/s y TTFT de MLX frente a otras vías de despliegue en el mismo hardware.

## Benchmarks y rendimiento

El autor publica únicamente métricas de inferencia de su propia conversión, medidas en un Apple M1 con 8 GB de memoria unificada, promedio de 5 ejecuciones con 256 tokens máximos:

| Metrica | 4 bits | 8 bits | 16 bits |
|---|---|---|---|
| Tokens por segundo | 51,35 | 29,3 | 16,52 |
| TTFT | 19,48 ms | 34,13 ms | 60,59 ms |
| Memoria pico | 1124,4 MB | 351,5 MB | 59,7 MB |

Advertencia sobre estos datos: la columna de memoria pico decrece al aumentar la precisión (1124,4 MB en 4 bits frente a 59,7 MB en 16 bits), lo que contradice la relación esperada entre bits y huella de memoria. Las cifras se reproducen tal como figuran en la model card, pero conviene tratarlas como no verificadas.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni para esta conversión ni para sus variantes.

## Requisitos de hardware

- Requisito de plataforma: Apple Silicon (M1 o posterior). MLX no se ejecuta en GPUs NVIDIA, AMD ni en CPU x86.
- Peso del artefacto de 4 bits: 839,3 MB en disco; repositorio completo de 0,9 GB.
- Memoria: la model card reporta un pico de 1124,4 MB para la variante de 4 bits en un M1 de 8 GB. Con esa cifra, el modelo cabe holgadamente en máquinas de 8 GB de memoria unificada, aunque deja poco margen para otras aplicaciones si el pico real fuese el declarado.
- Equipos recomendados por el autor: M1/M2 de 8 GB para la variante de 4 bits; M1/M2 Pro o Max de 16-32 GB para la de 8 bits; M2/M3/M4 Ultra de 64 GB o más para la de 16 bits.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable con MLX. Para esos entornos habría que recurrir a otras conversiones del modelo base (por ejemplo GGUF o safetensors estándar), no incluidas en este repositorio.
- Opciones de despliegue: `mlx-lm` (CLI `mlx_lm.chat` y `mlx_lm.generate`, o API de Python). No se proporcionan pesos en GGUF, por lo que no es directamente desplegable con llama.cpp, Ollama o LM Studio; tampoco se documenta compatibilidad con vLLM ni TGI.
- Rendimiento medido: 51,35 tokens/s y 19,48 ms de TTFT en Apple M1 con 8 GB y 256 tokens de generación máxima.

## Comparativa con modelos similares

Comparativa entre las tres variantes de cuantización publicadas por el mismo autor, todas derivadas de Qwen/Qwen2.5-1.5B-Instruct:

| Variante | Parametros | Cuantizacion | Tokens/s (M1) | TTFT | Memoria pico declarada | Licencia |
|---|---|---|---|---|---|---|
| SirSahOl/Qwen2.5-1.5B-Instruct-chat-mlx-4bit | 1.543.714.304 | 4 bits | 51,35 | 19,48 ms | 1124,4 MB | Apache 2.0 |
| SirSahOl/Qwen2.5-1.5B-Instruct-chat-mlx-8bit | No disponible | 8 bits | 29,3 | 34,13 ms | 351,5 MB | Apache 2.0 |
| SirSahOl/Qwen2.5-1.5B-Instruct-chat-mlx-16bit | No disponible | 16 bits | 16,52 | 60,59 ms | 59,7 MB | Apache 2.0 |
| Qwen/Qwen2.5-1.5B-Instruct (original) | 1,5B aprox. (no confirmado en la informacion disponible) | BF16/FP16 | No disponible | No disponible | No disponible | Apache 2.0 |

No se dispone de datos en la informacion proporcionada para comparar con alternativas de otros fabricantes de tamaño similar (por ejemplo Llama 3.2 1B Instruct, Gemma 2 2B IT o SmolLM2 1.7B Instruct) en cuanto a parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La cuantización de 4 bits introduce una pérdida de calidad respecto al modelo original; el autor la califica de pequeña, pero no cuantifica la degradación con benchmarks de calidad.
- El rendimiento puede degradarse con contextos muy largos (más de 8000 tokens) en niveles bajos de cuantización, según advierte el propio autor.
- Requiere obligatoriamente Apple Silicon (M1 o posterior). No es ejecutable en GPUs NVIDIA, AMD ni en CPU x86 a través de MLX.
- La conversión es weight-only: hereda todos los sesgos, el estilo y los fallos del modelo base Qwen2.5-1.5B-Instruct, sin ninguna mitigación adicional.
- Riesgo de alucinación propio de un modelo de 1,5B parámetros: no es adecuado para tareas que exijan precisión factual alta sin verificación humana o sin anclaje a fuentes (RAG).
- No se documentan los idiomas soportados en esta ficha; el comportamiento multilingüe depende del modelo base y no está verificado aquí.
- Las cifras de memoria pico de la tabla de rendimiento son internamente incoherentes (decrecen al aumentar la precisión), por lo que no deberían usarse para dimensionar despliegues en producción sin medirlas en el hardware objetivo.
- El repositorio no incluye pesos GGUF, plantillas de despliegue ni integraciones con servidores de inferencia (vLLM, TGI, Ollama), lo que limita su uso a scripts y aplicaciones basados en mlx-lm.
- Estado de adopción nulo: cero descargas y cero likes en el momento de la consulta, sin validación externa de la comunidad.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con la obligación habitual de conservar el aviso de licencia y el archivo NOTICE si existe. Se recomienda revisar la licencia del modelo base para conocer los términos completos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SirSahOl/Qwen2.5-1.5B-Instruct-chat-mlx-4bit
- Variante de 8 bits: https://huggingface.co/SirSahOl/Qwen2.5-1.5B-Instruct-chat-mlx-8bit
- Variante de 16 bits: https://huggingface.co/SirSahOl/Qwen2.5-1.5B-Instruct-chat-mlx-16bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Framework MLX (Apple): https://github.com/ml-explore/mlx
- Pipeline de conversión del autor (MLX Foundry): https://github.com/SirSahOl/mlx-foundry

Nota sobre la busqueda web: los resultados devueltos no guardan relación con el modelo ni con el ámbito de la inteligencia artificial (remiten a un blog de material didáctico de educación primaria), por lo que no se ha incorporado ningún dato procedente de ellos.
