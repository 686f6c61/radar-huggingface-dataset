# caiotheodoro/suture-8b

## Resumen

`suture-8b` es un adaptador PEFT (LoRA) desarrollado por Caio Theodoro sobre el modelo vision-language `Qwen/Qwen3-VL-8B-Instruct`. Su propósito es una tarea cerrada y sintética: control de calidad (QC) en la emisión de pólizas de seguros. El modelo recibe dos imágenes de página (binder de suscripción y póliza emitida) y produce una salida JSON estructurada con un veredicto `PASS`/`FLAG` y objetos de discrepancia (por ejemplo, diferencias en límites o deducibles). No es un modelo VL general ni pretende competir con sistemas propietarios en dominios abiertos; es una prueba de concepto de que un ajuste fino específico con un modelo de 8B puede superar a modelos mucho mayores en una tarea cerrada y controlada.

El adaptador se entrena con QLoRA (r=32, α=64, dropout 0.05) en 4 bits, con imágenes de 384 píxeles y sin razonamiento (thinking off). El repositorio incluye el código, el generador de datos sintéticos y el evaluador en GitHub. La licencia es Apache-2.0, lo que permite uso comercial con las limitaciones indicadas en la documentación. El tamaño del repositorio es de 0.2 GB (solo el adaptador; los pesos completos del modelo base no se incluyen).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-8B-Instruct (vision transformer) + adaptador LoRA |
| Parametros totales | 8B (modelo base) + adaptador LoRA (0,2 GB en disco) |
| Longitud de contexto | no disponible (se hereda del modelo base, no especificado) |
| Tipos de cuantizacion | Entrenamiento en 4-bit (QLoRA); inferencia puede usar 4-bit u otras cuantizaciones, no documentadas |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica para este adaptador) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `Qwen3-VL-8B-Instruct`, un transformer multimodal que procesa texto e imágenes. El adaptador se entrena con QLoRA: r=32, α=64, dropout 0.05, en 4 bits, con imágenes de 384 píxeles y el razonamiento desactivado. La cadena de entrenamiento es `sft-vl` → `sft-distill` → `sft-restem` → `sft-numeric` → `sft-limithi`, donde cada etapa es un ajuste fino de continuación (continue-from-adapter) con 1 época por mezcla. Los datos de entrenamiento son 100% sintéticos, generados por el script `suture_forge` en el repositorio GitHub, que renderiza páginas de estilo ACORD (formularios de seguros). Las semillas utilizadas en la cadena publicada son 7 (train/val), 11 (pool de destilación), 13 (mezcla numérica) y 17 (mezcla LIMIT_HIGHER). La semilla 777 se reserva exclusivamente para evaluación y nunca se incluye en el entrenamiento.

No se proporcionan detalles sobre el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de las semillas. No se menciona el uso de RLHF o DPO; el entrenamiento es de ajuste fino supervisado (SFT) con etiquetas de oro generadas por un oráculo.

## Capacidades

- Comparación de dos imágenes de páginas de documentos de seguros (binder y póliza) y generación de un JSON estructurado con veredicto `PASS`/`FLAG` y objetos de discrepancia.
- Detección de diferencias en límites (`LIMIT_HIGHER`, `LIMIT_LOWER`) y deducibles (`DEDUCTIBLE_HIGHER`, `DEDUCTIBLE_LOWER`), aunque con rendimiento variable en deducibles.
- Extracción de citas textuales (matching exacto de cadenas doradas) con alta precisión (≈1.0 en parse).
- No es un modelo de propósito general: no se recomienda para tareas fuera de la comparación de documentos de seguros sintéticos.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso fuera de la tarea específica.

## Casos de uso

- **Investigación académica**: reproducir el benchmark Suture y comparar metodologías de fine-tuning (QLoRA vs. otras) en tareas de VL específicas.
- **Desarrollo de pipelines de QA para documentos**: el modelo sirve como referencia para construir sistemas de validación de campos numéricos en documentos generados por plantillas.
- **Prueba de concepto para fine-tuning de VLMs**: demostrar que un modelo de 8B ajustado con QLoRA puede superar a modelos propietarios de mayor tamaño en una tarea cerrada y controlada.
- **Generación de datos sintéticos**: el generador `suture_forge` se puede usar para crear conjuntos de datos de entrenamiento y evaluación para tareas similares.
- **Evaluación de robustez en OCR**: aunque no está diseñado para OCR real, su comportamiento en imágenes sintéticas puede informar sobre la sensibilidad de los modelos VL a variaciones de layout.
- **Punto de partida para SFT adicional**: el adaptador `sft-limithi` es la base para futuros ajustes que busquen mejorar la clasificación de direcciones de deducibles o reducir falsos positivos.

## Benchmarks y rendimiento

Resultados en el conjunto de evaluación con semilla 777 (n=1000, renderizado de líneas separadas). El evaluador es el mismo del repositorio. No hay solapamiento con el entrenamiento.

| Modelo | Severity-weighted recall | HIGH recall | Precision | Parse |
|---|---|---|---|---|
| **suture-8b (`sft-limithi`)** | **0.839** | **0.893** | **0.870** | **1.0** |
| Adaptador anterior (`sft-restem`) | 0.634 | 0.795 | 0.704 | 1.0 |
| GPT-5.6 Luna zero-shot vision | 0.373 | 0.388 | 0.344 | 0.972 |
| Qwen3-VL-8B-Instruct sin adaptador | 0.098 | 0.115 | 0.278 | 0.973 |

Nota: las clases débiles son `DEDUCTIBLE_LOWER` (recall 0.494) y `DEDUCTIBLE_HIGHER` (recall 0.507, precisión 0.407). El `LIMIT_HIGHER` tiene recall 0.716. La coincidencia exacta de citas es ≈1.0, pero el autor aclara que es clonación de cadenas doradas, no una métrica de calidad semántica.

## Requisitos de hardware

- **VRAM estimada**: el entrenamiento se realizó en una GPU NVIDIA L4 con 24 GB de VRAM usando QLoRA 4-bit. Para inferencia, un modelo base de 8B en 4-bit suele requerir entre 4 y 6 GB de VRAM, más el adaptador (pequeño). No se especifican cifras exactas para este adaptador.
- **GPU recomendadas**: L4 (24 GB) es suficiente para entrenamiento; para inferencia puede usar GPUs consumer como RTX 3090/4090 (16-24 GB) o tarjetas con 8 GB si se usa cuantización más agresiva, aunque no se documenta.
- **Despliegue**: el código de inferencia está en el repositorio con un pipeline Modal (`cloud/modal_eval.py`) que usa 4-bit y 384px. Se puede integrar con Hugging Face Transformers + PEFT.
- **Latencia y throughput**: no se proporcionan datos. Se puede esperar una inferencia de ~1-2 segundos por par de imágenes en una GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

La comparación directa se limita a los datos proporcionados en la model card. No se han evaluado otros adaptadores de 8B para la misma tarea.

| Modelo | Tamaño | Contexto | Métrica principal (severity recall) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **suture-8b** | 8B + adaptador | no especificado | 0.839 | Apache-2.0 | Hugging Face |
| Qwen3-VL-8B-Instruct (base) | 8B | 32k (según documentación) | 0.098 | Apache-2.0 | Hugging Face |
| GPT-5.6 Luna (zero-shot) | propietario | no aplica | 0.373 | propietario | API |

## Limitaciones y advertencias

- **No apto para producción**: los datos de entrenamiento y evaluación son páginas sintéticas renderizadas con ACIP-style, no documentos reales. No debe usarse con pólizas o binders reales.
- **Rendimiento limitado en deducibles**: las clases `DEDUCTIBLE_HIGHER` y `DEDUCTIBLE_LOWER` tienen recall cercano a 0.5 y precisión baja, lo que indica que el modelo no discrimina bien la dirección de la discrepancia.
- **Riesgo de alucinación**: el modelo puede generar discrepancias falsas, especialmente en `DEDUCTIBLE_HIGHER` (precisión 0.407).
- **Dependencia del formato**: el modelo está optimizado para las imágenes de 384px generadas por el `suture_forge`; cambios en el layout, resolución o tipo de documento degradan el rendimiento.
- **Limitaciones de licencia**: aunque Apache-2.0 permite uso comercial, la documentación desaconseja explícitamente su uso en entornos productivos de seguros.
- **No es un modelo VL general**: no debe utilizarse para tareas de visión por computadora o lenguaje natural fuera del dominio de comparación de documentos de seguros.

## Enlaces

- [Hugging Face - caiotheodoro/suture-8b](https://huggingface.co/caiotheodoro/suture-8b)
- [GitHub - caiotheodoro/suture](https://github.com/caiotheodoro/suture)
- [Perfil de Hugging Face del autor](https://huggingface.co/caiotheodoro/models)
- [Modelo base Qwen3-VL-8B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct)
