# amad-iq/amad-vlm5-D-technical-report

## Resumen

**amad-vlm5-D** es un modelo de visión y lenguaje (VLM) para OCR en árabe, creado por **amad-iq** (Murtadha) mediante la fusion **TIES-Merging** de dos especialistas en OCR arabe finetuneados sobre la misma base: **Qwen2.5-VL-7B-Instruct**. El modelo fusiona `amad-iq/amad-vlm5` (un OCR con modo de razonamiento `<think>...`) y `AhmedZaky1/DIMI-Arabic-OCR-V2` (OCR directo que alucina continuaciones). El objetivo es corregir fallos complementarios: un padre "piensa demasiado" y deja de transcribir, el otro "piensa demasiado poco" y genera texto inventado. El merge reduce el CER en **26%** sobre datos sin fuga y mejora macro CHrF, pero el analisis de errores revela que parte de la ganancia proviene de **cancelar comportamientos defectuosos** y que hay retrocesos concretos en segmentacion de palabras. Arquitectura: VLM multimodal basado en el transformer Qwen2.5-VL-7B. Parametros: **aprox. 7.000 millones**. Contexto: **no disponible**. Relevancia: es un estudio de caso riguroso sobre que arregla (y que rompe) un merge de modelos OCR, con evaluacion sobre KITAB-Bench y descomposicion de errores por tipo de edicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Model (transformador multimodal) basado en Qwen2.5-VL-7B-Instruct |
| Parametros totales | ~7.000 millones (heredados de Qwen2.5-VL-7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el modelo padre `amad-iq/amad-vlm5` tiene versiones GGUF) |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (se publica en Hugging Face; el modelo padre incluye GGUF) |

## Arquitectura y entrenamiento

El modelo se construye mediante **TIES-Merging** (Yadav et al., 2023) de dos finetunes sobre la misma base **Qwen2.5-VL-7B-Instruct**. Cada finetune se representa como un vector de tarea (`τ = W_finetune − W_base`). El merge sigue tres pasos: **trim** (conservar el 50% de los parametros por magnitud, `density=0.5`), **elect** (seleccionar el signo predominante por parametro entre los vectores recortados) y **disjoint merge** (promediar solo los vectores que coinciden con el signo elegido, con `λ=1`). Los vectores de tarea de los dos modelos son **casi ortogonales** (coseno ≈ 0.001), lo que indica que se intercalan actualizaciones independientes. Un dato importante: **DIMI-Arabic-OCR-V2 tiene deltas de vision encoder exactamente a cero**, por lo que la vision entrenada por `amad-vlm5` pasa al modelo fusionado sin cambios. No se aplico RLHF ni DPO. Los datos de entrenamiento especificos (tokens, composicion del dataset) no se detallan en la informacion disponible.

## Capacidades

- **OCR arabe de alta precision** en documentos impresos, incluyendo paginas densas a nivel documento.
- **Reconocimiento de texto en escenas** (scene text): el merge aporta transferencia genuina de lectura en imagenes de texto natural (1.000 imagenes evaluadas).
- **Razonamiento explicito**: hereda el modo de razonamiento en `<think>...</think>` del modelo padre `amad-vlm5`, que se elimina antes de la metrica de evaluacion.
- **Vision-language image-text-to-text**: pipeline multimodal que acepta una imagen y devuelve texto transcrito.
- **Bilingue arabe/ingles**, aunque el rendimiento principal esta orientado al arabe.
- **No se documenta soporte de tool calling, function calling ni agentes** en los datos disponibles.
- **No se documenta soporte de audio ni video**; es un modelo puramente de vision e imagen.

## Casos de uso

- **Digitalizacion de documentos administrativos arabes**: el modelo transcribe paginas densas con un CER macro de **0.235** sobre KITAB-Bench, lo que lo hace util para archivar contratos, informes o formularios sin necesidad de revision humana exhaustiva.
- **Reconocimiento de texto en carteles y senalizacion**: para aplicaciones moviles de traduccion o asistencia en entornos arabes, gracias a su capacidad de leer texto de escenas y a la transferencia real de lectura observada en 1.000 imagenes.
- **Automatizacion contable con facturas y recibos arabes**: puede extraer texto de imagenes de facturas para alimentar pipelines de procesamiento de documentos, reduciendo la tasa de error en comparacion con OCR directos convencionales.
- **Accesibilidad para personas con discapacidad visual**: al combinar vision con razonamiento, puede describir y transcribir carteles, menus o documentos impresos en arabe, ayudando a lectores de pantalla multimodales.
- **Generacion de datasets OCR de alta calidad**: el modelo sirve como anotador automatico para crear corpus arabes corregidos, aprovechando su baja tasa de error en conjuntos sin fuga.
- **Integracion en pipelines RAG multimodales**: permite indexar documentos escaneados en arabe para busqueda semantica, ya que combina la transcripcion con representaciones visuales del documento.
- **Evaluacion de estrategias de fusion de modelos**: como caso de estudio, puede utilizarse como referencia para medir los efectos de TIES-merging sobre modelos OCR, especialmente para comparar la descomposicion de errores por tipo de edicion.

## Benchmarks y rendimiento

Se presentan los resultados de **KITAB-Bench `ocr-eval`** (13 datasets, 3.760 imagenes) publicados por el autor. La evaluacion uso decodificacion greedy con presupuesto de 4.096 tokens, y se retiro el contenido de `<think>...</think>` antes de calcular las metricas. DIMI-V2 se evaluo solo en los 7 datasets donde el merge superaba a `amad-vlm5`.

| Metrica | amad-vlm5 | DIMI-V2 | amad-vlm5-D |
|---|---:|---:|---:|
| CER ↓ (macro, 13 datasets) | 0.254 | — | **0.235** |
| CHrF ↑ (macro, 13 datasets) | 81.05 | — | **81.68** |
| CER ↓ (10 datasets sin fuga) | 0.321 | — | **0.236** |
| CER ↓ (7 datasets en disputa) | 0.441 | 0.389 | **0.249** |
| CHrF ↑ (7 datasets en disputa) | 70.92 | 58.22 | **80.35** |

Observaciones: el merge reduce el CER macro un **7,5%** frente a `amad-vlm5`, y un **48%** en los 7 datasets donde DIMI-V2 fue evaluado. La mejora en los 10 datasets sin fuga es del **26%** en CER. El analisis de errores del autor indica que gran parte de la ganancia proviene de cancelar el sobre-pensamiento de un padre y las continuaciones alucinadas del otro, junto con una transferencia genuina de lectura en texto de escena. Contrapartida: se observa una regresion en **segmentacion de palabras** y la destruccion de ventajas en datos memorizados. No se dispone de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un VLM de aproximadamente 7.000 millones de parametros, en **FP16** necesita al menos **14 GB** para pesos y cache KV del vision encoder. Con cuantizacion **4-bit**, puede reducirse a **5-7 GB** (estimacion estandar para modelos Qwen2.5-VL-7B).
- **GPU recomendadas**: una **RTX 4090 (24 GB)** es suficiente para FP16; para batch grande o contexto largo, se recomiendan **A100 40/80 GB** o **H100 80 GB**.
- **Compatibilidad con GPU de consumo**: si se usa una cuantizacion 4-bit publicada (GGUF), cabria en una **RTX 3090 (24 GB)**, **RTX 4070 Ti (12 GB)** con limitaciones, o tarjetas de 12-16 GB con contexto reducido.
- **Opciones de despliegue**: Transformers (via `pipeline` de imagen-texto), vLLM para serving multimodal, llama.cpp (si se genera el archivo GGUF) y LM Studio. El modelo padre `amad-vlm5` ya tiene version GGUF disponible, aunque no se ha confirmado para `amad-vlm5-D`.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| **amad-vlm5-D** | Qwen2.5-VL-7B-Instruct | ~7B | No disponible | Apache 2.0 | TIES-merge de dos OCR arabes; CER macro 0.235 |
| **amad-vlm5** | Qwen2.5-VL-7B-Instruct | ~7B | No disponible | Apache 2.0 | OCR con modo `<think>`; CER macro 0.254 |
| **DIMI-Arabic-OCR-V2** | Qwen2.5-VL-7B-Instruct | ~7B | No disponible | Apache 2.0 | OCR directo, tiende a alucinar continuaciones; CER solo medido en 7 datasets |
| **Qwen2.5-VL-7B-Instruct (base)** | — | ~7B | 128k (segun documentacion del base, no verificado en este merge) | Apache 2.0 | Modelo original sin finetune OCR especializado |

El modelo comparte la misma base y licencia con sus padres. No se han publicado resultados comparativos con otros modelos OCR arabes diferentes en la informacion disponible.

## Limitaciones y advertencias

- **Regresion en segmentacion de palabras**: el analisis de errores por edicion reporta que aunque el merge mejora la lectura, el costo principal es una peor segmentacion de palabras en algunas entradas.
- **Destruccion de ventajas de datos memorizados**: el merge elimina los beneficios que cada padre tenia en ejemplos memorizados durante su finetune, lo que puede reducir el rendimiento en distribuciones de datos especificas.
- **Riesgo de alucinacion heredado**: aunque el merge reduce las continuaciones inventadas de DIMI-V2, no las elimina por completo, especialmente en textos con formato poco comun.
- **Comportamiento de razonamiento problematico**: el modo `<think>` de `amad-vlm5` puede seguir consumiendo todo el presupuesto de generacion en algunas paginas, produciendo transcripciones vacias si el bloque no se cierra.
- **Evaluacion limitada a arabe e ingles**: no hay datos de rendimiento en otros idiomas o dominios diferentes al OCR de documentos impresos.
- **Licencia Apache 2.0**: permite uso comercial sin restricciones, pero el modelo se publica como informe tecnico; no hay garantias de robustez en produccion ni soporte mantenido.
- **Contexto no verificado**: la longitud de contexto real del modelo fusionado no se ha confirmado en la documentacion, por lo que no se recomienda asumir capacidades de contexto largo sin validacion previa.

## Enlaces

- **Modelo en Hugging Face**: https://huggingface.co/amad-iq/amad-vlm5-D-technical-report
- **Modelo padre `amad-vlm5`**: https://huggingface.co/amad-iq/amad-vlm5
- **Modelo padre `DIMI-Arabic-OCR-V2`**: https://huggingface.co/AhmedZaky1/DIMI-Arabic-OCR-V2
- **Paper de TIES-Merging**: https://arxiv.org/abs/2306.01708
- **Benchmark KITAB-Bench**: https://github.com/mbzuai-oryx/KITAB-Bench
- **Perfil del autor en GitHub**: https://github.com/murtadha-lap
