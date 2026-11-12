# bambocher/Qwen3.5-0.8B-heretic-oQ6e-mtp

## Resumen

Qwen3.5-0.8B-heretic-oQ6e-mtp es una versión modificada y cuantizada del modelo Qwen/Qwen3.5-0.8B, publicado por el usuario independiente bambocher en Hugging Face. El modelo parte del checkpoint original de Alibaba Qwen (0,8 mil millones de parámetros) y le aplica dos transformaciones: una ablación de comportamiento mediante la herramienta Heretic v2.0.0 (que elimina los rechazos del modelo original) y una cuantización de precisión mixta con oQ de oMLX v0.7.3, orientada al ecosistema MLX de Apple Silicon.

La relevancia de esta ficha radica en que combina tres elementos poco habituales en un modelo de este tamaño: un proceso de "decensoring" documentado con métricas de rechazo y divergencia KL, la preservación de la cabeza de predicción multi-token (MTP) del modelo original, y una cuantización mixta que alcanza 7,790 bits por peso de media con distribución por capas (6 bits afín para el 79,8% de los pesos, 8 bits para el 8,4% y BF16 para el 11,8%). El resultado es un checkpoint de 873,4 millones de parámetros lógicos que ocupa 0,792 GiB en disco.

El modelo está pensado para inferencia local en Macs con chip Apple Silicon mediante MLX. No dispone de model card completa en cuanto a licencia, idiomas o pipeline, y su adopción es todavía muy reducida (42 descargas, 0 likes en el momento de la consulta), lo que lo sitúa como un experimento técnico más que como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con cabeza de predicción multi-token (MTP) y módulo de visión |
| Parámetros totales | 873.438.784 (0,873B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Precisión mixta oQ: afín 6 bits grupo 64 (79,819%), afín 8 bits grupo 64 (8,366%), BF16 (11,815%); media efectiva 7,790 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (librería MLX) |

Desglose de almacenamiento por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 0,752B | 0,630 GB / 0,587 GiB |
| Visión | 0,101B | 0,201 GB / 0,187 GiB |
| Cabeza MTP | 0,020B | 0,019 GB / 0,018 GiB |
| Total | 0,873B | 0,850 GB / 0,792 GiB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.5-0.8B original: un transformer denso de 0,8B parámetros con un módulo de visión (0,101B parámetros) y una cabeza de predicción multi-token (MTP, 0,020B parámetros) que permite decodificación especulativa multi-token. El autor no detalla la composición del dataset de entrenamiento original ni si hubo fases de RLHF o DPO; esa información corresponde al modelo base de Qwen y no se reproduce en esta model card.

Sobre el checkpoint base se aplicaron dos procesos. Primero, una ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) mediante Heretic v2.0.0, con los parámetros start_layer_index=1, end_layer_index=19, preserve_good_behavior_weight=0,8199, steer_bad_behavior_weight=0,0001, overcorrect_relative_weight=1,0547 y neighbor_count=14. Este proceso modifica las capas 1 a 19 para suprimir el comportamiento de rechazo manteniendo el resto de capacidades. Segundo, una cuantización mixta con oQ (oMLX v0.7.3) que asigna 6 bits afines a la mayoría de pesos, 8 bits a una fracción pequeña y deja en BF16 el 11,8% de los parámetros, presumiblemente los más sensibles. La cabeza MTP se conserva intacta, lo que habilita decodificación especulativa en MLX.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-0.8B.
- Procesamiento de imágenes: el checkpoint incluye un módulo de visión de 0,101B parámetros, por lo que conserva capacidad multimodal entrada-imagen.
- Decodificación especulativa multi-token gracias a la cabeza MTP preservada (0,020B parámetros), que acelera la generación en MLX.
- Comportamiento sin rechazos: la ablación Heretic reduce las negativas a 0/100 en la evaluación del autor, frente a 97/100 del modelo original.
- Ejecución local en Apple Silicon mediante la librería MLX.
- Soporte de tool calling, agentes o modos de pensamiento: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint de 0,792 GiB cabe holgadamente en la memoria unificada de cualquier Mac moderno (8 GB o más) y se ejecuta con MLX, lo que permite prototipar sin GPU dedicada.
- Pruebas de decodificación especulativa: la cabeza MTP intacta permite medir la ganancia de throughput de la decodificación multi-token frente a la decodificación autoregresiva clásica en el runtime MLX.
- Investigación sobre alineación y rechazo: el par de métricas (0/100 rechazos, KL 0,1412) permite estudiar el efecto de la ablación ARA sobre el comportamiento del modelo y compararlo con el checkpoint original.
- Experimentos multimodales ligeros: el módulo de visión de 0,101B parámetros posibilita tareas de descripción de imágenes o VQA en local con un coste de memoria mínimo.
- Evaluación de cuantización mixta: la distribución 6/8/BF16 documentada sirve como caso de estudio para comparar calidad frente a cuantizaciones uniformes de 4 u 8 bits.
- Fines educativos y demos: el tamaño reducido y la licencia del modelo base (a verificar en el repositorio de Qwen) lo hacen adecuado para talleres y demostraciones de MLX en portátiles.
- Generación de texto creativo sin filtros: el comportamiento decensored puede interesar a proyectos de escritura que requieran respuestas sin negativas, siempre que se asuma la responsabilidad legal y ética del contenido generado.

## Benchmarks y rendimiento

El autor solo publica dos métricas comparativas frente al modelo original:

| Métrica | Este modelo | Qwen/Qwen3.5-0.8B |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0,1412 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/ memoria estimada: 0,792 GiB de pesos en disco; en inferencia, el runtime MLX añade overhead de activaciones y caché KV, por lo que se recomienda al menos 2-4 GB de memoria unificada libre.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No está pensado para CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con 8 GB o más de memoria unificada; también podría ejecutarse en GPUs de consumo vía conversión a otros formatos, pero no es el objetivo del checkpoint.
- Opciones de despliegue: MLX (librería nativa del checkpoint) y oMLX; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada; la cabeza MTP está diseñada para mejorar el throughput de decodificación, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-0.8B-heretic-oQ6e-mtp | 0,873B | No disponible | Mixta 6/8/BF16 (7,79 bits/peso) | No disponible | Safetensors (MLX) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B aprox. | No disponible | Original (BF16) | No disponible | Safetensors |
| Alternativas de 0,5-1B en MLX | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, formato y proceso de cuantización.

## Limitaciones y advertencias

- La licencia no está declarada en el repositorio; antes de cualquier uso comercial debe verificarse la licencia del modelo base Qwen/Qwen3.5-0.8B en su repositorio oficial.
- El proceso Heretic elimina los rechazos de forma deliberada: el modelo puede generar contenido que el original rechazaría, con implicaciones legales y éticas que recaen sobre el usuario.
- La divergencia KL de 0,1412 respecto al original indica una desviación medible en la distribución de salida; no es un modelo equivalente al base en comportamiento.
- Riesgo de alucinación inherente a un modelo de 0,8B parámetros, agravado por la cuantización mixta a 6 bits en la mayor parte de los pesos.
- No hay información sobre idiomas soportados, longitud de contexto ni pipeline; no debe asumirse un contexto largo sin verificarlo.
- Adopción muy baja (42 descargas, 0 likes) y autor independiente: no hay garantías de mantenimiento ni de reproducibilidad de los resultados publicados.
- El checkpoint está atado al ecosistema MLX; fuera de Apple Silicon requiere conversión y no se garantiza la paridad de comportamiento.
- El autor indica que el 2026-11-12 se re-cuantizó con oMLX v0.7.3; copias anteriores pueden diferir y deberían descartarse.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic-oQ6e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Heretic (proyecto de ablación): https://heretic-project.org
- oQ / oMLX (cuantización): https://github.com/jundot/omlx
