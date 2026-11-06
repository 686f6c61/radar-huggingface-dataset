# DRUPEs/CherryPit-1.0-2B-GGUF

## Resumen

CherryPit-1.0-2B es un modelo de lenguaje causal de aproximadamente 2.500 millones de parámetros desarrollado por DRUPEs (Dense Representation & Unified Parameter Encoding Systems) como un ajuste fino de MiniCPM5-2B de OpenBMB. Se distribuye principalmente en formato GGUF con cuantizaciones que van desde Q8_0 (2,50 GB) hasta IQ2_M (0,90 GB), lo que lo sitúa en la categoría de modelos pequeños orientados a inferencia en dispositivo (on-device).

El modelo mantiene la misma arquitectura, tamaño y velocidad que su base, y se presenta como una actualización directa con mejoras concentradas en generación de código (LiveCodeBench v6 +1,9 puntos, MBPP+ +3,2 puntos, HumanEval +1,2 puntos) y ganancias marginales en matemáticas y razonamiento. Soporta tool calling a través de su plantilla de chat integrada y una ventana de contexto de 128K tokens, lo que resulta poco habitual en modelos de este tamaño.

Su relevancia actual radica en la combinación de licencia Apache 2.0, formato GGUF listo para llama.cpp, Ollama y LM Studio, y un perfil de rendimiento que lo hace desplegable en hardware de consumo modesto. El método completo de entrenamiento no se ha publicado: el autor lo liberará al alcanzar 30.000 descargas o el 31 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estándar tipo Llama (381 tensores) |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | Q8_0, Q6_K_L, Q6_K, Q5_K_M, Q4_K_L, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_L, IQ2_M |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors bf16 en DRUPEs/CherryPit-1.0-2B |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso con estructura estándar tipo Llama, compuesto por 381 tensores, sin mecanismos de mezcla de expertos ni capas híbridas. El modelo base es MiniCPM5-2B de OpenBMB, sobre el que se aplicó un ajuste fino cuyo método completo no ha sido divulgado: el autor indica que lo publicará al alcanzar 30.000 descargas o el 31 de octubre de 2026, lo que ocurra primero. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

Las evaluaciones publicadas se ejecutaron con el modo de razonamiento (thinking) desactivado, en inglés y con el mismo arnés, prompts y semillas para el modelo base y el ajustado. La longitud media de respuesta en LiveCodeBench se mantuvo en aproximadamente 2.100 tokens en ambos modelos, lo que sugiere que las mejoras no provienen de un aumento en la verbosidad de las respuestas. Las cuantizaciones GGUF incluyen algunas generadas con imatrix, según las etiquetas del repositorio.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat integrada.
- Generación de código con mejoras medibles frente a la base en LiveCodeBench v6, MBPP+, HumanEval y HumanEval+.
- Razonamiento matemático (MATH-500) y razonamiento multi-paso (BBH con 0-shot CoT).
- Tool calling / function calling mediante la plantilla de chat del modelo.
- Ventana de contexto de 128K tokens, adecuada para conversaciones multi-turno largas y contextos extensos de código.
- Modo de razonamiento (thinking) disponible, aunque los benchmarks publicados se ejecutaron con él desactivado.
- Inferencia en dispositivo: cuantizaciones desde 0,90 GB permiten ejecución en hardware de consumo.
- Compatibilidad con endpoints OpenAI a través de llama-server.

## Casos de uso

- Asistente de código en el editor: con Q4_K_M (1,45 GB) puede ejecutarse localmente en un portátil y ofrecer autocompletado y generación de funciones con HumanEval del 90,9%, sin enviar código a servicios externos.
- Revisión de código en CI/CD: integrado mediante llama-server con API compatible con OpenAI, puede generar sugerencias de parche o detectar errores en diffs antes de fusionar, con un coste de latencia bajo por su tamaño reducido.
- Agente de tool calling en local: la plantilla de chat soporta function calling, lo que permite construir agentes que invoquen herramientas (consultas a bases de datos, APIs internas) en entornos sin conectividad o con requisitos de privacidad.
- Análisis de repositorios completos: la ventana de 128K tokens permite cargar varios ficheros de código en un único prompt para tareas de explicación, refactorización o búsqueda de dependencias entre módulos.
- Tutor de matemáticas y razonamiento: con MATH-500 en 79,8 y BBH en 78,4, es adecuado para asistencia educativa paso a paso en entornos con recursos limitados.
- Prototipado rápido en LM Studio u Ollama: permite a desarrolladores evaluar flujos de agentes y prompts sin infraestructura GPU dedicada, usando un solo comando (`ollama run hf.co/DRUPEs/CherryPit-1.0-2B-GGUF:Q4_K_M`).
- Procesamiento de documentación técnica en inglés: resumen y extracción de información de manuales largos gracias al contexto de 128K y a su naturaleza conversacional.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando CherryPit-1.0-2B con MiniCPM5-2B bajo el mismo arnés, prompts y semillas, con thinking desactivado:

| Benchmark | Configuración | MiniCPM5-2B | CherryPit-1.0-2B | Δ |
|---|---|---:|---:|---:|
| LiveCodeBench v6 (2025-01..04) | pass@1, media de 8, T=1.0 | 30,4 | 32,4 | +1,9 |
| — easy / medium / hard | | 81,7 / 27,2 / 5,0 | 84,3 / 28,8 / 6,7 | +2,6 / +1,6 / +1,7 |
| MBPP+ (EvalPlus) | greedy | 61,9 | 65,1 | +3,2 |
| HumanEval | greedy | 89,6 | 90,9 | +1,2 |
| HumanEval+ | greedy | 85,4 | 86,0 | +0,6 |
| MATH-500 | greedy | 79,4 | 79,8 | +0,4 |
| BBH | 0-shot CoT | 77,8 | 78,4 | +0,6 |
| MMLU-Pro | answer-letter scoring | 35,0 | 34,8 | −0,2 |
| HotpotQA (distractor) | F1 | 55,1 | 54,7 | −0,4 |
| HellaSwag | acc_norm | 50,5 | 49,5 | −1,0 |

No se han publicado resultados de benchmarks frente a otros modelos de la misma categoría distintos de su base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6-2,0 GB con Q4_K_M (1,45 GB de pesos más overhead de contexto); unos 3,0-3,5 GB con Q8_0 (2,50 GB de pesos).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 lo ejecutan con holgura. También es viable en CPU.
- Cabe en GPU de consumo: sí, en todas las GPU modernas con al menos 4 GB de VRAM; con Q4_K_M incluso en iGPU y sistemas con memoria unificada.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio y cualquier runtime compatible con GGUF. `llama-server` expone una API compatible con OpenAI en el puerto 8080.
- Latencia y throughput: no se han publicado mediciones concretas en la información disponible. El autor afirma que la velocidad es idéntica a la del modelo base, dado que comparten arquitectura y tamaño.
- Muestreo recomendado: temperatura 1,0, top_p 0,95 (valores por defecto almacenados en los GGUF).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CherryPit-1.0-2B | ~2,5B | 128K | Apache 2.0 | GGUF, safetensors | Mejoras en código sobre su base |
| MiniCPM5-2B (base) | ~2B | no disponible en la información | no disponible en la información | safetensors | Punto de referencia directo de los benchmarks |
| Otros modelos ~2B | no disponible | no disponible | no disponible | no disponible | No se han publicado comparativas en la información disponible |

La información proporcionada solo permite una comparación directa con el modelo base MiniCPM5-2B. No se dispone de datos de benchmarks ni especificaciones de alternativas de otros fabricantes en la misma categoría.

## Limitaciones y advertencias

- Al ser un modelo de 2B, puede cometer errores factuales y generar código con bugs; es necesario revisar sus salidas antes de usarlas en producción.
- Las mejoras se concentran en código; en otras áreas son marginales e incluso hay retrocesos leves (MMLU-Pro −0,2, HotpotQA −0,4, HellaSwag −1,0).
- Solo soporta inglés según la model card; no se garantiza un rendimiento correcto en castellano u otros idiomas.
- Las evaluaciones se realizaron con thinking desactivado; el rendimiento con el modo de razonamiento activado no está documentado.
- El método de entrenamiento no es público hasta que se alcancen 30.000 descargas o el 31 de octubre de 2026, lo que limita la reproducibilidad.
- Las cuantizaciones Q2_K_L e IQ2_M presentan pérdidas de calidad del 51% y 66% respectivamente; el autor recomienda evitarlas.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero no se ofrece garantía alguna sobre el modelo.
- Riesgo de alucinación inherente a los modelos de este tamaño, especialmente en tareas de conocimiento factual fuera del ámbito del código.

## Enlaces

- Repositorio GGUF: https://huggingface.co/DRUPEs/CherryPit-1.0-2B-GGUF
- Pesos completos en bf16 safetensors: https://huggingface.co/DRUPEs/CherryPit-1.0-2B
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
