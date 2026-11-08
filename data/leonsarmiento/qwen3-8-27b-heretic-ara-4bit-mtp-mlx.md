# leonsarmiento/Qwen3.8-27B-heretic-ara-4bit-mtp-mlx

## Resumen

`leonsarmiento/Qwen3.8-27B-heretic-ara-4bit-mtp-mlx` es una cuantización uniforme de 4 bits en formato MLX del fine-tune `heretic-org/Qwen3.8-27B-heretic-ara`, un modelo derivado de `Qwen/Qwen3.8-27B` al que se le ha aplicado una ablación de la conducta de rechazo mediante el método Arbitrary-Rank Ablation (ARA) con la herramienta Heretic v1.2.0. El resultado es un VLM denso de 27.781.427.952 parámetros que conserva la torre de visión y las cabezas de predicción multi-token (MTP) del modelo original, empaquetadas dentro del propio checkpoint para habilitar decodificación especulativa nativa.

La relevancia de esta publicación no está en el modelo base sino en el formato: integra las 15 tensores `mtp.*` extraídos de `model-auxiliary.safetensors` siguiendo la convención de checkpoint de scottlowry/oQ que ya emplea Jundot, de modo que el motor oMLX activa Lightning MTP sin necesidad de descargar un drafter separado. Según las mediciones del autor en un M4 Pro de 48 GB, esto supone un incremento del 70 % en decodificación (25,3 frente a 14,9 tok/s) con paridad de prefill.

El modelo está pensado exclusivamente para el ecosistema Apple Silicon vía MLX y oMLX. No funciona correctamente en LM Studio, que carga el modelo base pero ignora las cabezas MTP, perdiendo toda la aceleración. La licencia declarada es Apache 2.0, heredada del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido con atención lineal y atención completa (48 capas de atención lineal + 16 de atención completa, 64 capas totales), torre de visión y capa de predicción multi-token (MTP) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | 4-bit afín uniforme, group_size=64, ~4,56 bits por peso; normas en bf16; `fc.weight` de MTP en bf16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 3 shards, 15,93 GB |

## Arquitectura y entrenamiento

El modelo base es un VLM denso de 64 capas que combina 48 capas de atención lineal con 16 capas de atención completa, complementado por una torre de visión y una capa de predicción multi-token. Sobre esa base, `heretic-org` aplicó Heretic v1.2.0 con el método ARA para ablacionar la conducta de rechazo entre las capas 26 y 56, con los siguientes hiperparámetros reportados: `start_layer_index` 26, `end_layer_index` 56, `preserve_good_behavior_weight` 0,9432, `steer_bad_behavior_weight` 0,0009, `overcorrect_relative_weight` 0,5038 y `neighbor_count` 10. El informe de origen afirma 0/100 rechazos frente a 99/100 del original, con una divergencia KL de 0,0535 respecto al modelo base.

La cuantización de `leonsarmiento` aplica 4 bits afines con group_size=64 a todas las capas cuantizables (atención, atención lineal, MLP, embeddings, `lm_head` y torre de visión), mantiene las normas en bf16 y preserva la torre de visión para uso multimodal vía mlx-vlm. Las cabezas MTP se empaquetan con 7 tensores de norma en bf16 (convención MLX RMSNorm +1,0), `fc.weight` en bf16 sin cuantizar y 7 capas lineales en 4 bits, con `text_config.mtp_num_hidden_layers: 1` y `mtp_use_dedicated_embeddings: false`. La plantilla de chat es idéntica byte a byte a la del modelo fuente, con `reasoning_effort` por defecto en `xhigh`. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre la composición del dataset del modelo base.

## Capacidades

- Generación de texto y razonamiento con modo thinking configurable mediante `reasoning_effort` en {`low`, `medium`, `high`, `xhigh`}, con `xhigh` como valor por defecto.
- Procesamiento de imagen y texto (`image-text-to-text`) gracias a la torre de visión preservada; el autor verificó la lectura correcta del título y los ejes de un gráfico de Pareto local.
- Razonamiento matemático y aritmético verificado por el autor (15×37=555 con 27 tokens de razonamiento).
- Tool calling y function calling mediante el parser `qwen3_xml`, con parser de razonamiento `qwen3`.
- Decodificación especulativa nativa con Lightning MTP, con una tasa de aceptación del draft del 83,3 % en la primera petición medida.
- Conducta de rechazo ablacionada en las capas 26–56, orientada a reducir negativas del modelo.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon para asistentes conversacionales: el checkpoint de 15,93 GB cabe en Macs con 24 GB o más de memoria unificada y aprovecha Lightning MTP para acelerar la generación en oMLX.
- Análisis de documentos con componentes visuales: la torre de visión preservada permite extraer información de gráficos, tablas e imágenes junto con el texto, con 262K tokens de contexto para documentos extensos.
- Generación de código en flujos interactivos: el soporte de tool calling con parser `qwen3_xml` y el modo thinking configurable permiten integrarlo en asistentes de edición con llamadas a herramientas.
- Evaluación de investigación sobre alineación y ablación: el modelo sirve como caso de estudio de ARA con divergencia KL documentada (0,0535) y métricas de rechazo comparadas frente al original.
- Prototipado de agentes multi-paso en local: el contexto de 262K y el razonamiento extendido permiten cadenas de razonamiento largas sin salir del equipo.
- Pruebas de rendimiento de decodificación especulativa: la comparación MTP ON/OFF publicada por el autor (25,3 frente a 14,9 tok/s) lo convierte en una referencia útil para medir el impacto del drafter integrado.
- Desarrollo de aplicaciones con contenido sin filtros: el fine-tune heretic está orientado a escenarios donde la conducta de rechazo del modelo base resulta limitante, siempre bajo revisión de las implicaciones legales y éticas.

## Benchmarks y rendimiento

Mediciones del autor en oMLX sobre un M4 Pro (48 GB), Engine Auto, contexto Code/Python, TurboQuant desactivado, bench pp1024/tg128:

| Configuración | pp TPS | tg TPS | TPOT | Memoria pico |
|---|---:|---:|---:|---:|
| heretic-ara-4bit-mtp, Lightning MTP ON | 103,7 | 25,3 | 39,9 ms | 20,1 GB |
| heretic-ara-4bit-mtp, MTP OFF (misma build) | 105,2 | 14,9 | 67,7 ms | 17,0 GB |
| pi-4bit-mtp (MTP ON, referencia de familia) | 102,0 | 26,3 | 38,3 ms | 18,35 GB |
| Jundot oQ4e-mtp (MTP ON, donante de formato) | 101,3 | 27,9 | 36,2 ms | 18,35 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores son mediciones de rendimiento de inferencia, no de calidad.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 15,93 GB de pesos; pico medido de 20,1 GB con MTP activado y 17,0 GB con MTP desactivado en oMLX.
- El autor reporta funcionamiento en un Apple M4 Pro con 48 GB de memoria unificada. No hay datos publicados para otros chips.
- GPU NVIDIA: no disponible; el formato MLX está orientado a Apple Silicon. Existe una variante NVFP4 del mismo modelo heretic para vLLM en RTX 5090 (`lyf/Qwen3.8-27B-Heretic-ARA-NVFP4-MTP-VL`), fuera del alcance de esta ficha.
- Despliegue: exclusivamente oMLX según el autor. LM Studio carga el modelo base pero ignora las cabezas MTP. No se menciona compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Throughput medido: 103,7 tok/s de prefill y 25,3 tok/s de decodificación con MTP activo; 14,9 tok/s sin MTP.
- Recomendación del autor: desactivar la caché KV TurboQuant, ya que MTP no muestra ventaja con ella activada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Motor | tg TPS (M4 Pro) |
|---|---|---|---:|---|---|---:|
| leonsarmiento/Qwen3.8-27B-heretic-ara-4bit-mtp-mlx | 27,78B | 262K | 4-bit MLX, 15,93 GB | Apache 2.0 | oMLX | 25,3 (MTP ON) |
| Jundot/Qwen3.8-27B-oQ4e-mtp | no disponible | no disponible | oQ4e con MTP | no disponible | oMLX | 27,9 (MTP ON) |
| pi-4bit-mtp (referencia de familia) | no disponible | no disponible | 4-bit con MTP | no disponible | oMLX | 26,3 (MTP ON) |
| leonsarmiento/Qwen3.8-27B-3bit-mtp-mlx | no disponible | no disponible | 3-bit mixta con MTP | no disponible | oMLX | no disponible |

La variante de 3 bits del mismo autor reduce el tamaño a costa de precisión; no se han publicado cifras de rendimiento para ella en la información disponible.

## Limitaciones y advertencias

- Dependencia estricta de oMLX: en LM Studio u otros motores las cabezas MTP se ignoran y se pierde la aceleración; no se garantiza el funcionamiento en llama.cpp, Ollama, vLLM ni TGI.
- El autor no verificó de forma independiente las afirmaciones de rechazo (0/100) ni la divergencia KL (0,0535) del modelo fuente; la ablación reside en el checkpoint, no en la configuración.
- La decodificación especulativa empeora tareas de razonamiento intensivo: en Qwen3.6-35B MATHQA se midió una caída de 7 puntos porcentuales de precisión y un aumento del 20 % de tiempo de pared con MTP activo. El autor recomienda desactivarlo en tareas de thinking.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay evaluaciones de fidelidad publicadas para este fine-tune.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado fuera del inglés sin evaluación previa.
- La conducta de rechazo ablacionada implica que el modelo puede generar contenido que el original filtraría; requiere revisión de cumplimiento antes de cualquier despliegue en producción.
- La licencia Apache 2.0 se hereda del modelo fuente, pero el uso comercial de un modelo decensurado puede entrar en conflicto con políticas de plataforma y obligaciones legales locales.
- Sin descargas ni valoraciones en el momento de la ficha (0 descargas, 0 likes), lo que limita la validación comunitaria.
- El consumo de memoria con MTP activo añade aproximadamente 3 GB por la caché KV del draft y los pesos MTP.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/leonsarmiento/Qwen3.8-27B-heretic-ara-4bit-mtp-mlx)
- [Modelo base: heretic-org/Qwen3.8-27B-heretic-ara](https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara)
- [Licencia del modelo fuente](https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara/blob/main/LICENSE)
- [Modelo original: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Donante de formato: Jundot/Qwen3.8-27B-oQ4e-mtp](https://huggingface.co/Jundot/Qwen3.8-27B-oQ4e-mtp)
- [Variante de 3 bits del mismo autor](https://huggingface.co/leonsarmiento/Qwen3.8-27B-3bit-mtp-mlx)
- [Variante NVFP4 para vLLM: lyf/Qwen3.8-27B-Heretic-ARA-NVFP4-MTP-VL](https://huggingface.co/lyf/Qwen3.8-27B-Heretic-ARA-NVFP4-MTP-VL)
- [Heretic (herramienta de ablación)](https://github.com/p-e-w/heretic)
- [Pull request de Arbitrary-Rank Ablation (ARA)](https://github.com/p-e-w/heretic/pull/211)
