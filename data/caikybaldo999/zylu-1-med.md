# caikybaldo999/ZYLU-1-MED

## Resumen

ZYLU 1 MED es un modelo de lenguaje de tipo decoder-only transformer de 65,75 millones de parámetros, entrenado desde cero por Zylun-AI (cuenta de Hugging Face `caikybaldo999`). Está diseñado como un modelo pequeño ("small language model") bilingüe portugués-inglés para generación de texto, con un enfoque explícito en investigación y experimentación más que en uso productivo. Su relevancia radica en que documenta de forma transparente un pipeline completo de entrenamiento desde cero: tokenizador BPE propio de 32k, preentrenamiento continuado, SFT, DPO y promediado de pesos (EMA), todo con licencia Apache 2.0.

La arquitectura combina atención híbrida (3 capas locales con ventana de 512 tokens por cada capa global), GQA con 8 cabezas de consulta y 2 de clave/valor, SwiGLU, RMSNorm, QK-Norm y RoPE con theta de 100k, sobre 18 capas y dimensión 512. El contexto declarado es de 8192 tokens. El modelo usa embedding amarrado, value residual, logit softcap y z-loss, además de un tokenizador BPE propio entrenado para portugués e inglés.

El modelo se publicó en noviembre de 2026 y ha recibido una actualización sustancial el 20 de noviembre de 2026 (preentrenamiento continuado centrado en inglés con FineWeb-Edu, Cosmopedia v2 y FineMath, más aritmética sintética, SFT y DPO nuevos, y mezcla de pesos con α=0.5). Su media de benchmarks zero-shot pasó de 41,0 a 43,9. Es un modelo para estudiar dinámicas de entrenamiento a pequeña escala, no para asistencia factual fiable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención híbrida (3 locales ventana 512 : 1 global), GQA (8 Q / 2 KV), SwiGLU, RMSNorm, QK-Norm, RoPE θ=100k |
| Parámetros totales | 65.753.856 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | no disponible (repo distribuye safetensors en precisión de entrenamiento; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | portugués (pt), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), tokenizer `tokenizer.json` (BPE 32k), código de modelado propio (`modeling_zylu.py`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 18 capas con dimensión oculta 512. Emplea atención híbrida: tres capas con atención local de ventana 512 seguidas de una capa de atención global, lo que reduce el coste cuadrático a costa de la memoria exacta a larga distancia. Usa GQA con 8 cabezas de consulta y 2 de clave/valor, SwiGLU como FFN, RMSNorm y QK-Norm para estabilidad, y RoPE con theta de 100k para extender la coherencia posicional hasta 8192 tokens. Incorpora embedding amarrado entre entrada y salida, value residual, logit softcap y z-loss.

El entrenamiento se realizó desde cero con un tokenizador BPE propio de 32k. La actualización de noviembre de 2026 añadió preentrenamiento continuado centrado en inglés con FineWeb-Edu de nota alta, Cosmopedia v2, FineMath y aritmética sintética, seguido de una fase final con datos de tareas, EMA de pesos, nuevo SFT y DPO, y mezcla de pesos con α=0.5. El autor declara transparencia sobre contaminación: en la fase final se usaron los splits de *entrenamiento* de ARC, PIQA, HellaSwag, SciQ y OpenBookQA, nunca los de evaluación; ArithMark-3 no se usó y su aritmética es 100% sintética.

## Capacidades

- Generación de texto bilingüe portugués-inglés con formato de chat mediante la función `generate` incluida en el repo.
- Razonamiento básico y respuesta a preguntas de sentido común a escala pequeña (ARC-Easy, PIQA, HellaSwag).
- Aritmética elemental entrenada con datos sintéticos propios (ArithMark-3).
- Soporte de conversaciones multi-turno vía lista de mensajes con roles (`user`).
- Capacidad de instrucción limitada gracias a SFT y DPO posteriores al preentrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.
- No se documenta modo de razonamiento explícito ("thinking mode") ni decodificación especulativa.

## Casos de uso

- Estudio de dinámicas de entrenamiento a pequeña escala: replicar el pipeline (BPE propio, preentrenamiento, SFT, DPO, EMA) para analizar cómo afecta cada etapa a métricas zero-shot como ARC-Easy o PIQA.
- Experimentación con atención híbrida local/global: comparar el comportamiento del modelo en tareas que requieren contexto largo (hasta 8192 tokens) frente a variantes con atención densa, usando el código de modelado incluido.
- Generación de texto en portugués para prototipos de bajo coste: completar textos o mantener diálogos simples en entornos de desarrollo donde el coste computacional es prioritario y la exactitud factual no es crítica.
- Evaluación de tokenizadores BPE para portugués: analizar la cobertura y eficiencia del vocabulario de 32k en corpus lusófonos frente a tokenizadores multilingües de referencia.
- Docencia y divulgación: usar el modelo como ejemplo didáctico de arquitectura transformer moderna (GQA, SwiGLU, RoPE, QK-Norm) con pesos abiertos y licencia permisiva.
- Investigación sobre alineación a pequeña escala: estudiar el efecto de SFT y DPO en un modelo de 65M parámetros y medir su impacto en benchmarks de sentido común.
- Base para fine-tuning específico de dominio en portugués: al ser Apache 2.0 y de tamaño reducido, sirve como punto de partida para ajustes en tareas acotadas (clasificación de texto, extracción simple) donde no se requiere un modelo grande.

## Benchmarks y rendimiento

Evaluación zero-shot por log-likelihood con el mismo evaluador para todos los modelos (acc_norm; ArithMark-3 usa acc):

| Modelo | ARC-Easy | ARC-Challenge | PIQA | HellaSwag | ArithMark-3 | Media |
|---|---|---|---|---|---|---|
| ZYLU 1 MED (actual) | 54,9 | 27,5 | 63,7 | 33,4 | 40,0 | **43,9** |
| ZYLU 1 MED (versión anterior) | 47,0 | 24,3 | 61,8 | 32,5 | 39,2 | **41,0** |
| ZYLU 1 MED v1.0 | 42,4 | 24,1 | 60,7 | 31,8 | 34,6 | **38,7** |
| Supra2.5-Pro-Base | 51,5 | 25,9 | 63,0 | 34,4 | 49,3 | **44,8** |
| Supra2.5-Pro-Instruct | 49,3 | 27,9 | 62,5 | 35,8 | 47,6 | **44,6** |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 0,26 GB en fp32 (65,75M × 4 bytes); el repo completo pesa 2,9 GB por assets y otros ficheros. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090, A100, H100). El modelo es tan pequeño que el cuello de botella es el overhead del runtime, no la memoria.
- Cabe en GPU consumer: sí, en todas las GPU modernas con 4 GB o más; también puede ejecutarse en CPU para pruebas.
- Opciones de despliegue: el repo incluye código propio (`modeling_zylu.py`) que requiere cargar `model.safetensors` con `safetensors.torch` y el tokenizador con `tokenizers`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al no haber pesos GGUF publicados, llama.cpp/Ollama requerirían conversión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZYLU 1 MED (actual) | 65,75M | 8192 | 43,9 | Apache 2.0 | Hugging Face |
| Supra2.5-Pro-Base | no disponible | no disponible | 44,8 | no disponible | no disponible |
| Supra2.5-Pro-Instruct | no disponible | no disponible | 44,6 | no disponible | no disponible |
| ZYLU 1 MED v1.0 | 65,75M (misma familia) | 8192 | 38,7 | Apache 2.0 | Hugging Face (tag `v1.0`) |

Los únicos comparadores con datos en la información disponible son Supra2.5-Pro-Base e Instruct, que superan ligeramente a ZYLU 1 MED en media (44,8 y 44,6 frente a 43,9) y de forma notable en ArithMark-3 (49,3 y 47,6 frente a 40,0), pero cuyos parámetros, contexto y licencia no se detallan. No se dispone de comparación con otros modelos pequeños de referencia (p. ej., familias de 50-150M parámetros) en la información proporcionada.

## Limitaciones y advertencias

- Modelo muy pequeño (65,75M parámetros): comete errores factuales y de cálculo con frecuencia, según declara el propio autor.
- Sin alineación de seguridad: el autor indica explícitamente que no tiene "alinhamento de segurança"; no debe desplegarse en entornos de producción orientados a usuarios finales sin filtros adicionales.
- Riesgo elevado de alucinación en preguntas factuales, esperable por tamaño y por la composición del corpus de entrenamiento.
- Cobertura lingüística limitada a portugués e inglés; no se documenta rendimiento en otras lenguas.
- Contexto máximo de 8192 tokens, con atención mayoritariamente local (ventana 512) en 3 de cada 4 capas, lo que puede degradar la recuperación de información a larga distancia.
- Transparencia del autor sobre contaminación parcial: se usaron splits de entrenamiento de ARC, PIQA, HellaSwag, SciQ y OpenBookQA en la fase final, lo que puede inflar las métricas reportadas frente a una evaluación estrictamente limpia.
- Licencia Apache 2.0 permite uso comercial, pero el autor recomienda explícitamente el modelo solo para estudio y experimentos.
- No hay pesos cuantizados publicados (GGUF, AWQ, GPTQ) ni integración documentada con runtimes de inferencia estándar, lo que añade trabajo de ingeniería para desplegarlo.
- El código de modelado es propio (`modeling_zylu.py`) y requiere `trust_remote_code` o carga manual; no es compatible directamente con `transformers` sin adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caikybaldo999/ZYLU-1-MED
- Versión anterior v1.0: https://huggingface.co/caikybaldo999/ZYLU-1-MED/tree/v1.0
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código independientes ni demos.
