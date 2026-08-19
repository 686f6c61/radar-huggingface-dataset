# marlalabsAI/Qwen3.5-4B-SX8

## Resumen

Qwen3.5-4B-SX8 es una cuantización del modelo Qwen3.5-4B, desarrollada por MarlaLabs (Martí Vidal Leandro), que aplica el formato propietario S-X8 v4.3 con 7,50 bits por peso. El objetivo es ofrecer una calidad cercana a FP16 (la pérdida en perplejidad es solo del 0,17 % respecto al modelo original) con un tamaño de archivo un 11,6 % menor que una cuantización Q8_0 convencional, y con un decodificador portable que no requiere tensor cores ni memoria compartida, lo que permite ejecutarlo en cualquier GPU.

El modelo se distribuye en dos formatos: un contenedor nativo `.sx8` (byte-aligned y verificable byte-exacto) y un archivo GGUF con el tipo nativo `GGML_TYPE_SX8`, que requiere un fork específico de llama.cpp. Está pensado para desarrolladores e investigadores que necesitan desplegar un modelo de 4B parámetros con alta fidelidad en hardware de consumo, manteniendo un throughput competitivo (63,79 tok/s medidos en una RTX 5060 Ti).

La relevancia actual radica en que demuestra una alternativa a las cuantizaciones estándar (Q8_0, GPTQ, AWQ) con mejor equilibrio entre calidad y tamaño, y con la ventaja de no depender de kernels especializados de tensor cores. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, siempre que se mantenga la atribución correspondiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen3.5-4B (arquitectura exacta no especificada en la información disponible) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | S-X8 v4.3 (7,50 bpp) y GGUF con tipo nativo `GGML_TYPE_SX8` |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | `.sx8` (contenedor nativo) y `.gguf` (requiere fork de llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una cuantización del Qwen3.5-4B, un transformer denso de 4.205 millones de parámetros desarrollado por el equipo Qwen de Alibaba Group. No se proporcionan detalles sobre la arquitectura interna (número de capas, dimensiones, atención) ni sobre el entrenamiento original (datos, tokens, método de alineación). La información disponible se centra exclusivamente en el proceso de cuantización.

El formato S-X8 v4.3 es una innovación técnica que alcanza 7,50 bits por peso (contabilizados completamente, incluyendo todos los componentes del tensor) y mantiene una calidad prácticamente idéntica a FP16. Según la documentación, el decodificador es portable: no requiere tensor cores ni memoria compartida, lo que facilita su ejecución en GPUs de cualquier generación. La cuantización se aplica únicamente a los pesos, sin modificar la arquitectura ni el comportamiento del modelo base.

## Capacidades

- Generación de texto: al ser una cuantización del Qwen3.5-4B, hereda todas las capacidades del modelo base, incluyendo generación de texto, razonamiento, código y matemáticas (aunque no se detallan en la información proporcionada).
- Soporte de tool calling / function calling: no se menciona explícitamente, pero es probable que el modelo base lo soporte; no confirmado en esta ficha.
- Capacidades multilingües: no se especifican idiomas soportados.
- Visión y MTP: la tabla de tamaño menciona "modelo completo (visión+MTP)" con un archivo de 4,38 GB, lo que sugiere que el modelo base incluye capacidades multimodales (visión) y un módulo de predicción multi-token (MTP). No se dan más detalles.
- Modo de razonamiento extendido (thinking mode): no se menciona.

## Casos de uso

- Despliegue en hardware de consumo: gracias a sus 3,955 GB de pesos en VRAM y su decodificador portable, es adecuado para ejecutar en GPUs de gama media como RTX 3060, RTX 4060 o RTX 5060 Ti, sin necesidad de tensor cores.
- Inferencia local con alta fidelidad: para aplicaciones que requieren calidad cercana a FP16 pero con menor huella de memoria, como chatbots locales o asistentes personales.
- Integración en pipelines de generación de código: el modelo base Qwen3.5-4B es conocido por sus capacidades de código; esta cuantización permite usarlo en entornos de desarrollo con recursos limitados.
- Investigación en cuantización: el formato S-X8 v4.3 y sus kernels están disponibles en el repositorio, lo que permite a investigadores estudiar y reproducir los resultados.
- Prototipado rápido: al poder cargarse con el runtime proporcionado (`eval_common.py`), es útil para experimentar con el modelo sin necesidad de infraestructura pesada.
- Aplicaciones de visión y texto: si el modelo base incluye visión (como sugiere la mención a "visión+MTP"), podría usarse en tareas que combinan imagen y texto, aunque no se detallan las capacidades específicas.

## Benchmarks y rendimiento

La información proporcionada incluye una tabla de calidad comparando FP16, S-X8 v4.3 y Q8_0 en el mismo hardware (RTX 5060 Ti). Se presenta a continuación:

| Metrica | FP16 | S-X8 v4.3 | Q8_0 |
|---|---|---|---|
| PPL wikitext-2 (runtime PCA) | 10,2090 | 10,2267 (+0,17 %) | 10,4540 (+2,40 %) |
| Winogrande_s | 0,5746 | 0,5722 | 0,5746 |
| HellaSwag (0-shot) | 0,6965 | 0,6964 | 0,6965 |
| ARC-Challenge (0-shot) | 0,9172 | 0,9164 | 0,9181 |
| MMLU (5-shot) | 0,7133 | 0,7074 | 0,7087 |

Además, se reporta una velocidad de decodificación de 63,79 tok/s en RTX 5060 Ti, superior a la de Q8_0 en uso real (no se da el valor exacto de Q8_0).

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 3,955 GB en VRAM; el modelo completo (incluyendo visión y MTP) ocupa 4,38 GB en un solo archivo.
- GPU recomendadas: se ha probado en RTX 5060 Ti (16 GB), pero al no requerir tensor cores ni memoria compartida, debería funcionar en cualquier GPU con al menos 4-5 GB de VRAM, incluyendo RTX 3060, RTX 4060, GTX 16xx, etc.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo con 4 GB o más de VRAM.
- Opciones de despliegue: requiere el fork de llama.cpp con soporte S-X8 (parche `llama-cpp-sx8.patch`) o el runtime Python proporcionado (`eval_common.py`). No se menciona compatibilidad con vLLM, Ollama o TGI.
- Latencia y throughput: decodificación medida a 63,79 tok/s en RTX 5060 Ti; no se proporcionan datos de prefill ni de latencia en otros hardware.

## Comparativa con modelos similares

La comparativa se limita a la misma cuantización frente a las alternativas FP16 y Q8_0 del mismo modelo base, ya que no se dispone de datos de otros modelos de la misma categoría (4B parámetros). La siguiente tabla resume las diferencias:

| Caracteristica | Qwen3.5-4B (FP16) | Qwen3.5-4B-SX8 (v4.3) | Qwen3.5-4B (Q8_0) |
|---|---|---|---|
| Bits por peso | 16 | 7,50 | 8 |
| Tamano del archivo de texto | No disponible | 3,96 GB | 4,48 GB |
| Perplejidad (wikitext-2) | 10,2090 | 10,2267 | 10,4540 |
| MMLU (5-shot) | 0,7133 | 0,7074 | 0,7087 |
| Requisitos de hardware | Alto (VRAM ~8 GB) | Bajo (3,955 GB VRAM) | Medio (~4,5 GB VRAM) |

No se dispone de comparaciones con otros modelos de 4B como Llama-3.2-3B, Gemma-2-2B o Phi-3-mini, por lo que no se incluyen.

## Limitaciones y advertencias

- La información proporcionada no detalla sesgos conocidos, riesgos de alucinación ni limitaciones de contexto o idioma. Se recomienda consultar la documentación del modelo base Qwen3.5-4B para estos aspectos.
- El formato GGUF con tipo `GGML_TYPE_SX8` requiere un fork específico de llama.cpp (parche sobre el commit `7c203670f`), por lo que no es compatible con las versiones estándar de llama.cpp, Ollama u otros runners sin modificaciones.
- El contenedor `.sx8` solo puede cargarse con el runtime Python proporcionado en el repositorio, lo que limita su integración en entornos de producción convencionales.
- La cuantización S-X8 v4.3 es un formato propietario de MarlaLabs; aunque la licencia es Apache-2.0, la adopción depende de la disponibilidad de kernels y parches mantenidos por el autor.
- No se han publicado resultados de benchmarks en tareas adicionales (GSM8K, HumanEval, etc.) en la información disponible, por lo que la evaluación se limita a las métricas mostradas.
- El autor menciona que el origen conceptual del formato proviene de un análisis matemático de la Sábana Santa de Turín, lo que no afecta a la funcionalidad técnica pero puede resultar inusual para algunos usuarios.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/marlalabsAI/Qwen3.5-4B-SX8)
- [Paper (Zenodo, DOI)](https://doi.org/10.5281/zenodo.21922640)
- [Repositorio GitHub del proyecto](https://github.com/MarlaLabsAI/sx8-quantization)
- [Modelo base Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Perfil de LinkedIn del autor](https://www.linkedin.com/in/vidalmarti/)
- [Página web de MarlaLabs](https://marlalabs.com)
