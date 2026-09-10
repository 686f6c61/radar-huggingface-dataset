# skai-research/lca-3x-base

## Resumen

LCA-MBP 3x (identificador `skai-research/lca-3x-base`) es un modelo de lenguaje jerárquico a nivel de byte, desarrollado por skai-research, que sustituye el tokenizador clásico por un esquema de segmentación aprendida. En lugar de operar sobre subpalabras, trabaja directamente sobre bytes y agrupa la secuencia en "tokens latentes" que cubren aproximadamente 3,28 bytes cada uno, según los datos publicados en su model card. El modelo tiene 373.882.945 parámetros (374M) y una ventana de contexto de 4096 bytes.

La relevancia del modelo es fundamentalmente investigadora: implementa dos ideas novedosas descritas en el artículo "Dynamic Multi-Byte Prediction With Hierarchical Language Models" (arXiv:2608.15454). La primera es Latent Causal Attention (LCA), un esquema de atención causal que opera sobre la representación latente jerárquica en lugar de sobre la secuencia de bytes completa; la segunda es una cabeza de predicción multi-byte (MBP) que predice varios bytes por paso. El vocabulario es mínimo: 261 entradas (256 bytes más `<pad>`, `</s>`, `<unk>`, `<en>` y `<eot>`).

Se trata de un modelo exclusivamente preentrenado sobre `FineWeb-Edu` (`sample-100BT`), sin ajuste por instrucciones ni alineación mediante RLHF o DPO, y con soporte únicamente para inglés. No es una arquitectura de `transformers`, por lo que requiere el código del repositorio de los autores para cargarse y ejecutarse.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo jerárquico a nivel de byte con Latent Causal Attention (LCA) y cabeza de predicción multi-byte (MBP); `model_config` `[2, (16,), 2, 2]`; `attn_type` `prev_group_self` |
| Parametros totales | 373.882.945 (374M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 bytes |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en fp32 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 1,5 GB) |
| Vocabulario | 261 entradas (256 bytes + `<pad>`, `</s>`, `<unk>`, `<en>`, `<eot>`) |
| Bytes por token latente | 3,28 |
| Precision | fp32 |
| Compatibilidad con transformers | No (requiere el código del repositorio lca-multibyte) |

## Arquitectura y entrenamiento

El modelo es un transformer jerárquico que no usa tokenizador. La secuencia de entrada se procesa a nivel de byte, pero se agrupa dinámicamente en unidades latentes de aproximadamente 3,28 bytes; la atención causal (Latent Causal Attention, `prev_group_self`) se aplica sobre esas unidades latentes, reduciendo el coste respecto a una atención byte a byte pura. Sobre esa representación actúa una cabeza de predicción multi-byte (MBP) que emite varios bytes por paso. La configuración declarada es `[2, (16,), 2, 2]`, con anidamiento jerárquico de tres niveles de agrupación. Las fronteras de segmentación son aprendidas y pueden inspeccionarse con la opción `--show_tokenization` del script de generación.

El preentrenamiento se realizó sobre el subconjunto `sample-100BT` del dataset `FineWeb-Edu`, con la configuración `configs/train/modern_fxt_priors_0.3_en_lca_prev_group_self_256_scale_bp_dualhead.yaml`, y consta de 48.186 pasos de entrenamiento. No se documenta en la información disponible ninguna fase de ajuste por instrucciones, RLHF, DPO ni alineación. La innovación principal es la combinación de segmentación dinámica aprendida, atención sobre latentes jerárquicos y decodificación autoespeculativa (`self_speculative`), que permite generar varios bytes por paso dentro del mismo modelo.

## Capacidades

- Generación de texto a nivel de byte en inglés, sin tokenizador y sin problemas de vocabulario fuera de lista (OOV): cualquier byte de entrada es representable.
- Segmentación dinámica aprendida: agrupa bytes en unidades latentes de ~3,28 bytes y expone las fronteras aprendidas mediante `--show_tokenization`.
- Decodificación autoespeculativa (`--mode self_speculative`) como modo de generación alternativo al muestreo estándar.
- Predicción multi-byte por paso mediante la cabeza MBP, lo que implica emitir varios bytes por ciclo de decodificación.
- Carga y ejecución mediante el cargador propio del repositorio (`src/eval/model_loader.load_fxt_model`) y el script `src/eval/generate.py`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe: el entrenamiento y la etiqueta de idioma son únicamente inglés.
- No se documenta visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documenta ajuste por instrucciones: es un modelo base preentrenado.

## Casos de uso

- Investigación en modelado sin tokenizador: sirve como baseline reproducible para estudiar segmentación aprendida frente a BPE o unigram, comparando curvas de BPC por byte en lugar de perplejidad por token.
- Análisis de fronteras de segmentación: usando `--show_tokenization` se pueden extraer las agrupaciones aprendidas sobre corpus concretos y estudiar qué regularidades estadísticas captura el modelo (sufijos, espacios, secuencias frecuentes).
- Evaluación de decodificación autoespeculativa: el modo `self_speculative` permite medir empíricamente cuántos bytes se aceptan por paso y analizar el compromiso entre velocidad y fidelidad de la distribución objetivo.
- Preentrenamiento base para ajuste posterior en tareas de nivel de carácter: corrección ortográfica, normalización de texto, restauración de puntuación o limpieza de OCR, donde trabajar sobre bytes evita decisiones de tokenización en textos ruidosos.
- Procesamiento de texto no normalizado: logs, transcripciones crudas, datos scrapeados con errores de codificación o mezclas de mayúsculas y símbolos, dado que el modelo no depende de un vocabulario cerrado.
- Experimentación académica sobre atención latente jerárquica: el modelo permite reproducir los resultados del artículo (BPC de validación, bytes por token latente, pasos de entrenamiento) y actuar como punto de partida para variantes arquitectónicas.
- Estudio de compresión de secuencias: la relación de 3,28 bytes por token latente con una ventana de 4096 bytes permite analizar el compromiso entre longitud efectiva de contexto y coste de atención en tareas de modelado de lenguaje.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de entrenamiento y validación propias del artículo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Métrica | Valor |
|---|---|
| BPC a nivel de byte (validación) | 0,934 |
| BPC de la cabeza MBP (validación) | 2,305 |
| Bytes por token latente | 3,28 |
| Pasos de entrenamiento | 48.186 |

Nota: BPC (bits per character/byte) no es directamente comparable con la perplejidad por token de modelos con tokenizador, ya que la unidad de medida es el byte, no la subpalabra.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 1,5 GB (tamaño del repositorio), por lo que la inferencia cabe holgadamente en GPUs de consumo. Con una ventana de solo 4096 bytes, el coste de activaciones y caché es reducido; una estimación razonable es de 2 a 4 GB de VRAM en fp32, dependiendo del tamaño de lote.
- No se documenta soporte de cuantización ni versiones GGUF, AWQ, GPTQ o similares; el modelo se distribuye en fp32 y su código de carga está pensado para `device="cuda"`.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060, RTX 4090). Para entrenamiento, el modelo es pequeño (374M) y es viable en una única GPU de gama media-alta o en una A100/H100 si se busca mayor velocidad.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna con 4 GB o más de VRAM, e incluso en CPU (la carga se especifica para `cuda`, pero el tamaño lo permite).
- Opciones de despliegue: únicamente el código del repositorio `skai-research/lca-multibyte` (cargador `load_fxt_model` y script `generate.py`). No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni el pipeline estándar de `transformers`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La información proporcionada no incluye comparativas con otros modelos, ni datos de rendimiento de alternativas. La model card únicamente reporta métricas internas (BPC). Se indica "no disponible" para los campos no documentados.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| skai-research/lca-3x-base | 374M | 4096 bytes | Byte-level jerárquico, sin tokenizador (LCA + MBP) | Apache 2.0 | BPC validación 0,934 (byte) |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es un modelo exclusivamente preentrenado: no sigue instrucciones, no está alineado y no incorpora filtros de seguridad. Generará continuaciones del texto de entrada, no respuestas útiles.
- Idiomas: solo inglés. Aunque al operar sobre bytes podría representar texto en otros idiomas o alfabetos, no hay evidencia de entrenamiento ni de rendimiento fuera del inglés.
- Contexto de 4096 bytes: es una ventana muy corta. A 3,28 bytes por token latente, equivale a aproximadamente 1248 unidades latentes, insuficiente para tareas de contexto largo.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje preentrenado; no se documenta ningún mecanismo de mitigación (RLHF, DPO, verificación).
- Sesgos: no se documenta ninguna evaluación de sesgos ni la composición demográfica de `FineWeb-Edu` (`sample-100BT`). Es previsible que reproduzca los sesgos del corpus de origen.
- Incompatibilidad de herramientas: no funciona con el pipeline estándar de `transformers`, vLLM, llama.cpp, Ollama ni TGI. Requiere clonar el repositorio, instalar dependencias con `uv` y exportar `PYTHONPATH`. No hay pesos en GGUF.
- Cuantización: no se documenta ninguna opción de cuantización; los pesos están en fp32, lo que limita su uso en despliegues donde se necesiten formatos de 4 u 8 bits.
- Métricas no comparables: los valores reportados son BPC por byte, no perplejidad por token, por lo que no se pueden comparar directamente con modelos con tokenizador.
- Adopción: el repositorio figura con 0 descargas y 0 "likes" en la información disponible, lo que indica que no hay validación independiente por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al ser un modelo base sin alineación, cualquier producto derivado requiere trabajo adicional de ajuste, evaluación y mitigación de riesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skai-research/lca-3x-base
- Artículo (arXiv): https://arxiv.org/abs/2608.15454
- Repositorio de código: https://github.com/skai-research/lca-multibyte
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos corresponden a entidades no relacionadas (Comune di Bacoli y el proyecto SKAI de google-research sobre evaluación de daños por catástrofes), por lo que se omiten.
