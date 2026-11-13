# infosave/Qwen3.6-35B-A3Bcmf

## Resumen

Qwen3.6-35B-A3Bcmf es una conversión cuantizada del modelo Qwen/Qwen3.6-35B-A3B de Alibaba Qwen al formato CMF (Cortiq Model Format) en el layout `q4tp`, publicada por el usuario infosave. Se trata de un único archivo de 18,7 GB (18 678 996 782 bytes) que puede ejecutarse mediante mmap tanto en CPU como en GPU o en memoria unificada (UMA) desde los mismos bytes, sin necesidad de conversiones adicionales. El modelo base es un transformer híbrido de 40 capas con arquitectura MoE: 10 capas de atención completa y 30 capas GatedDeltaNet lineales, con 256 expertos enrutados top-8 más un experto compartido, vocabulario de 248 320 tokens y `head_dim` de 256.

La particularidad de esta conversión es que conserva la cabeza de predicción multi-token (MTP) del modelo original, una capa MoE completa que eleva el total a 35,51 mil millones de parámetros. La mayoría de conversiones descartan estos tensores; aquí se mantienen, lo que permite decodificación especulativa nativa. El layout `q4tp` usa tiles de 4 bits con escalas por fila predichas y ocupa aproximadamente un 7 % menos que un q4 tileado plano con calidad casi idéntica.

El modelo requiere el runtime cortiq 0.5.42 o superior (0.5.43 para los rendimientos anunciados) y no es cargable con versiones anteriores, cuyo loader no soporta cabezas MTP en MoE y cuyo grafo GPU rechaza el layout `q4tp`. La licencia es Apache-2.0, heredada del modelo base de Qwen, y el contenedor CMF y el runtime cortiq también son Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 40 capas (10 de atención completa + 30 GatedDeltaNet lineales), MoE con 256 expertos enrutados top-8 + experto compartido, cabeza MTP (1 bloque MoE) |
| Parametros totales | 35,51 mil millones |
| Parametros activos | No disponible (top-8 de 256 expertos enrutados; el número exacto de parámetros activos no se especifica) |
| Longitud de contexto | No disponible (se documenta inferencia a contexto 16 384 con `--o1 all`) |
| Tipos de cuantizacion | q4tp (4 bits, tiles con escalas por fila predichas); único layout publicado en este repo |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | CMF (Cortiq Model Format), archivo único `qwen36-35b-a3b-q4tp.cmf` de 18 678 996 782 bytes |
| Vocabulario | 248 320 tokens |
| Head dim | 256 |
| Runtime requerido | cortiq 0.5.42+ (0.5.43+ recomendado; 0.5.48+ para carga dinámica de expertos) |

## Arquitectura y entrenamiento

El modelo base combina atención completa con capas lineales GatedDeltaNet en una proporción de 10 a 30 sobre 40 capas totales. La capa MoE emplea 256 expertos enrutados con activación top-8 más un experto compartido, lo que mantiene un coste de cómputo por token muy inferior al de un denso de 35,5B. La cabeza MTP, conservada en esta conversión, añade un bloque MoE adicional que permite predecir varios tokens por paso y alimentar decodificación especulativa.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original en la información proporcionada. La conversión a CMF se realizó con `cortiq convert --model Qwen/Qwen3.6-35B-A3B --quant q4tp`, en modo streaming, con pico de disco igual al tamaño del archivo de salida. Los conversores anteriores a 0.5.42 descartan los tensores `mtp.*` y generan un archivo distinto y más pequeño.

## Capacidades

- Generación de texto autoregresiva con pipeline `text-generation`.
- Decodificación especulativa mediante la cabeza MTP conservada (`CMF_MTP`), que acelera la generación.
- Atención aproximada O(1) en GPU con `--o1 all` y `CMF_O1_GPU=1`, pensada para contextos largos.
- Ingesta rápida de prompts con `CMF_BATCH_K=32`.
- Servidor compatible con la API de OpenAI (`cortiq serve`), utilizable con clientes tipo Cline/Roo.
- Ejecución en CPU, GPU (CUDA y Vulkan) y memoria unificada desde el mismo archivo.
- Carga dinámica de expertos: reparte capas entre GPU y host según la VRAM disponible.
- Capacidades multilingües, de código, matemáticas, tool calling o agentes: no disponibles en la información proporcionada (el modelo base Qwen3.6 probablemente las soporta, pero no se documentan aquí).

## Casos de uso

- Despliegue en estaciones de trabajo con GPU de gama alta: con 24 GB de VRAM el modelo mantiene todas las capas en GPU y alcanza 122,4 tok/s en Vulkan sobre RTX PRO 6000 Blackwell, adecuado para asistentes interactivos de baja latencia.
- Inferencia en hardware modesto: con solo 4 GB de VRAM el grafo coloca 4 de 40 capas en GPU y mantiene 26,9 tok/s, lo que permite servir el modelo en equipos de consumo sin degradar la perplejidad (3,852 idéntica en todos los escalones).
- Servicio de API compatible con OpenAI: `cortiq serve` expone el modelo para integrarlo en herramientas de edición de código agéntica (Cline, Roo) sin adaptadores adicionales.
- Procesamiento de prompts largos: con `--o1 all` y `CMF_O1_GPU=1` se mantiene un throughput plano de 53,8 tok/s a contexto 16 384, útil para análisis de documentos extensos o conversaciones multi-turno largas.
- Ejecución en CPU de 48 núcleos: 32,6 tok/s de decodificación y 33 tok/s de ingesta permiten desplegar el modelo en servidores sin GPU para tareas por lotes.
- Portátiles Apple Silicon: en un M4 Air de 24 GB se midieron 18,2 tok/s con `CMF_THREADS=8` en versiones previas a 0.5.50, suficiente para prototipado local y pruebas sin conexión.
- Reproducibilidad y auditoría: el archivo está verificado en tamaño contra la salida del conversor, y la conversión es reproducible con el comando documentado, lo que facilita pipelines de validación internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos numéricos son de rendimiento de inferencia y perplejidad:

| Métrica | Hardware / configuración | Resultado |
|---|---|---|
| Decodificación (CUDA) | RTX A5000 24 GB, cortiq 0.8.88 | 145,2 tok/s |
| Decodificación (Vulkan) | RTX A5000 24 GB | 104,6–105,2 tok/s |
| Decodificación (Vulkan) | RTX PRO 6000 Blackwell, 0.5.49 | 122,4 tok/s (grafo completo) |
| Ingesta de prompt | RTX PRO 6000, `CMF_BATCH_K=32` | 99 tok/s |
| Decodificación (CPU) | 48 núcleos, 0.5.50 | 32,6 tok/s |
| Ingesta de prompt (CPU) | 48 núcleos | 33 tok/s |
| Decodificación (CPU) | Apple M4 Air 24 GB, `CMF_THREADS=8` | 18,2 tok/s (pre-0.5.50) |
| Contexto largo | `--o1 all` + `CMF_O1_GPU=1`, ctx 16 384 | 53,8 tok/s planos (atención exacta: 37,8) |
| Perplejidad | Texto de referencia | 3,852 (idéntica en CPU, GPU y todos los escalones de VRAM) |

Escalado por VRAM en RTX PRO 6000 (0.5.50): 4 GB → 26,9 tok/s (4/40 capas); 6 GB → 38,3 (9/40); 8 GB → 43,6 (14/40); 12 GB → 58,8 (24/40); 16 GB → 86,9 (34/40); 24 GB+ → 122,4 (grafo completo). La versión 0.5.49 con envío pipeline elevó el grafo completo de 98,2 a 122,4 tok/s con salida greedy idéntica bit a bit.

## Requisitos de hardware

- VRAM mínima probada: 4 GB (4 de 40 capas en GPU, 26,9 tok/s); el resto se ejecuta en host con un cruce de frontera por token.
- VRAM para grafo completo: 24 GB o más (122,4 tok/s en RTX PRO 6000 Blackwell).
- GPU recomendadas: RTX A5000 24 GB (145,2 tok/s con CUDA), RTX PRO 6000 Blackwell (122,4 tok/s con Vulkan), RTX 5090 (64,5 tok/s con kernels antiguos).
- Cabe en GPU de consumo: sí, con carga dinámica de expertos desde 4 GB; en 16 GB se alcanzan 86,9 tok/s.
- CPU: 48 núcleos → 32,6 tok/s; Apple M4 Air 24 GB → 18,2 tok/s con `CMF_THREADS=8`.
- Despliegue: runtime cortiq (`cortiq run`, `cortiq serve`), instalable con `cargo install cortiq-cli`; backend CUDA como feature de compilación (`--features cuda`, requiere driver NVIDIA y CUDA 12.x).
- Ajuste manual de VRAM: variable `CMF_GPU_VRAM_MB` para limitar el presupuesto.
- Almacenamiento: 18,7 GB para el archivo único; no requiere directorio de pesos fragmentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3Bcmf (este) | 35,51B totales, MoE top-8 | No disponible | CMF q4tp, 18,7 GB | Apache-2.0 | Conserva cabeza MTP; ejecución CPU/GPU/UMA desde un archivo |
| Qwen/Qwen3.6-35B-A3B (base) | 35,51B totales, MoE top-8 | No disponible | Safetensors (original) | Apache-2.0 | Pesos sin cuantizar; requiere runtime estándar (transformers, vLLM) |
| Conversiones q4 planas del mismo base | 35,51B totales | No disponible | GGUF/otros q4 | Apache-2.0 | Descartan la cabeza MTP; el layout q4tp es ~7 % más pequeño |

No se dispone de datos de benchmarks que permitan comparar calidad frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Requiere cortiq 0.5.42+; versiones anteriores no cargan el archivo (loader sin soporte de MTP en MoE y grafo GPU incompatible con `q4tp`).
- La atención O(1) (`--o1 all`) es una aproximación sin garantía de paridad bit a bit; en prompts muy largos la decodificación greedy puede elegir continuaciones distintas pero coherentes en empates de probabilidad.
- La salida GPU es idéntica token a token a la CPU solo en contexto corto; en contexto largo difiere por ordenamiento de coma flotante.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación.
- La cuantización q4tp introduce pérdida de precisión frente a los pesos originales, aunque el autor afirma calidad casi idéntica al q4 tileado plano.
- El archivo está verificado en tamaño pero no se aportan hashes ni comparaciones de perplejidad frente al modelo base sin cuantizar.
- El repo tiene 0 likes y 1050 descargas; es una conversión de terceros, no oficial de Qwen.
- Uso comercial permitido por Apache-2.0, con las obligaciones de atribución y avisos de la licencia; los pesos derivan de la release de Qwen y mantienen sus términos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Qwen3.6-35B-A3Bcmf
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio CMF: https://github.com/infosave2007/cmf
- Documentación de ejecución MoE Qwen3.6: https://github.com/infosave2007/cmf/blob/master/docs/QWEN36_MOE.md
