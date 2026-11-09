# djokobandjur/deit-rope-mixed-ape-base-seed-6

## Resumen

El modelo `deit-rope-mixed-ape-base-seed-6` es un checkpoint de investigación de un Vision Transformer de tipo DeiT Base entrenado de forma independiente por Đoko Banđur y Miloš Banđur. Combina la arquitectura DeiT III con una implementación de rotary position embedding (RoPE) de frecuencias mixtas aprendidas, complementada con absolute positional embeddings (APE). Está pensado exclusivamente para clasificación de imágenes sobre ImageNet-1k y forma parte de una familia de seis checkpoints entrenados de forma independiente con distintas semillas, orientados al estudio de representaciones en transformers de visión y de parámetros rotacionales aprendidos.

El checkpoint reporta una top-1 accuracy del 83,656 % sobre las 50.000 imágenes de validación de ImageNet-1k (41.828 aciertos). El artefacto publicado es el `final_checkpoint.pth` original de PyTorch (1.385.806.305 bytes, SHA-256 `45f261aa…bc042`), correspondiente a la época 19 de fine-tuning y marcado como `PRIMARY_FINAL`. No es un paquete `AutoModel.from_pretrained` de Hugging Face Transformers: requiere instanciar la implementación RoPE-ViT compatible antes de cargar los pesos.

La relevancia del modelo es acotada y de carácter investigador: no es un modelo generativo ni multimodal, no soporta tool calling ni texto, y su utilidad práctica se limita a experimentos reproducibles de clasificación de imágenes y al análisis de variantes posicionales en ViT. La licencia BSD 3-Clause cubre únicamente el archivo de pesos, no el código de NAVER/Meta ni los datos de ImageNet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (DeiT Base, patch 16) con RoPE de frecuencias mixtas aprendidas + APE |
| Parametros totales | no disponible (configuracion DeiT Base; el autor no publica el conteo exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; resolucion de entrada no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch sin conversiones publicadas) |
| Idiomas soportados | no disponible (modelo de vision sin capacidades linguisticas) |
| Licencia | BSD 3-Clause (solo para `final_checkpoint.pth`) |
| Formato de pesos | PyTorch `.pth` (checkpoint de entrenamiento original, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer DeiT Base con patch size 16, siguiendo la configuración de entrenamiento de DeiT III. La innovación principal es la sustitución o combinación de los embeddings posicionales habituales por rotary position embeddings con frecuencias mixtas aprendidas (`learned-rope`, `rope-mixed`), junto con absolute positional embeddings (APE). La implementación de referencia procede de Heo, Park, Han y Yun (*Rotary Position Embedding for Vision Transformer*, ECCV 2024, arXiv:2403.13298) y del repositorio NAVER AI `rope-vit`; la familia DeiT III se documenta en arXiv:2204.07118.

El entrenamiento se realizó sobre ImageNet-1k (`ILSVRC/imagenet-1k`). El checkpoint publicado corresponde a la época 19 de fine-tuning (`PRIMARY_FINAL`) de la ejecución P6, con semilla aleatoria registrada `1203904911` (el índice P6 es un identificador ordinal, no la semilla numérica). El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF/DPO (no aplicables a un clasificador). Se registra además un checksum de un vector de referencia de frecuencias (`de3a73dc…adb131`), archivado por separado y no incluido en el repositorio. No hay datos publicados sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Clasificación de imágenes sobre las 1.000 clases de ImageNet-1k.
- Extracción de representaciones de un ViT con posicionamiento rotacional mixto aprendido, útil para investigación de embeddings posicionales.
- Reproducibilidad de un experimento concreto mediante SHA-256 del checkpoint y revisión de pesos original.
- No soporta generación de texto, código, matemáticas ni visión-lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingües (no procesa lenguaje).
- Sin modo thinking, audio ni otras modalidades.

## Casos de uso

- Reproducción de experimentos académicos: cargar el checkpoint con la implementación RoPE-ViT compatible y verificar la top-1 del 83,656 % sobre ImageNet-1k validation, usando el SHA-256 para garantizar la identidad de los pesos.
- Estudio comparativo de posicionamiento: analizar el efecto de RoPE mixto aprendido + APE frente a variantes con posicionamiento absoluto o relativo clásico, comparando con los checkpoints hermanos de la familia (seis ejecuciones independientes).
- Baseline de clasificación en pipelines de investigación: emplear el modelo como referencia fija en experimentos de destilación, pruning o quantización sobre ViT.
- Extracción de features para tareas downstream: usar las representaciones internas como backbone congelado en tareas de visión por computador (detección, segmentación) tras validar la calidad de las features.
- Auditoría de reproducibilidad numérica: contrastar el vector de referencia de frecuencias (checksum `de3a73dc…`) con el archivado en Zenodo para verificar la consistencia del entrenamiento.
- Docencia y formación: servir como ejemplo práctico de checkpoint DeiT con modificaciones posicionales y de buenas prácticas de versionado por checksum.

## Benchmarks y rendimiento

| Benchmark | Conjunto | Imagenes | Aciertos | Metrica | Resultado |
|---|---|---:|---:|---|---:|
| ImageNet-1k validation | ILSVRC/imagenet-1k | 50.000 | 41.828 | Top-1 accuracy | 83,656 % |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a un clasificador de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el checkpoint pesa 1,4 GB en FP32 y requiere la implementación RoPE-ViT compatible.
- GPU recomendadas: no especificadas por el autor; por tamaño de checkpoint, una GPU con al menos 4-8 GB de VRAM es suficiente en FP32 para clasificación por lotes pequeños (estimación orientativa, no publicada).
- Cabe en GPU consumer: probablemente sí en RTX 3060/4060 o superiores, aunque el autor no lo confirma.
- Opciones de despliegue: carga directa con PyTorch e implementación RoPE-ViT; no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `djokobandjur/deit-rope-mixed-ape-base-seed-6` | no disponible (DeiT Base) | no disponible | 83,656 % top-1 ImageNet-1k val | BSD 3-Clause (solo pesos) | Checkpoint `.pth` en HF |
| `naver-ai/rope_mixed_ape_deit_base_patch16_LS` | DeiT Base patch16 | no disponible | no disponible en la informacion | no disponible en la informacion | HF (repo oficial NAVER) |
| `naver-ai/rope_mixed_ape_deit_small_patch16_LS` | DeiT Small patch16 | no disponible | no disponible en la informacion | no disponible en la informacion | HF (repo oficial NAVER) |

La comparativa se limita a las variantes oficiales de NAVER AI con la misma configuración posicional; no se dispone de cifras de rendimiento de esas variantes en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación sin validación de robustez: los resultados de 83,656 % corresponden a clasificación limpia y no establecen comportamiento ante distribuciones desplazadas, corrupción o adversarios.
- Formato no estándar: `final_checkpoint.pth` no es un paquete `AutoModel.from_pretrained`; requiere la implementación RoPE-ViT compatible y configuración emparejada. El autor indica que el ejemplo de carga end-to-end se publicará tras validar la configuración de inferencia y preprocesado.
- Riesgo de seguridad: los checkpoints PyTorch basados en pickle pueden ejecutar código arbitrario al deserializar; cargar solo desde fuentes de confianza y usar modos de carga seguros cuando sean compatibles.
- El checkpoint puede contener estado de optimizador o de entrenamiento, no solo pesos del modelo.
- Sesgos conocidos: no documentados en la información disponible; ImageNet-1k presenta sesgos de clase y distribución inherentes al dataset.
- Riesgo de alucinación: no aplica (modelo discriminativo de clasificación).
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa texto.
- Restricciones de licencia: BSD 3-Clause cubre solo `final_checkpoint.pth`; no relicencia el código de NAVER/Meta, los datos de ImageNet ni material de terceros. La cita académica es recomendada, no condición adicional de la licencia.
- Cero descargas y cero likes en el momento de la consulta; ausencia de validación por parte de la comunidad.
- El vector de referencia de frecuencias no está incluido en el repositorio, solo su checksum.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djokobandjur/deit-rope-mixed-ape-base-seed-6
- Revisión original de pesos: https://huggingface.co/djokobandjur/deit-rope-mixed-ape-base-seed-6/tree/a382e1b60ca0eb8a404154279c2837d1bc0acb9f
- Paper RoPE for Vision Transformer (ECCV 2024): https://arxiv.org/abs/2403.13298
- Código NAVER AI rope-vit: https://github.com/naver-ai/rope-vit
- Paper DeiT III: https://arxiv.org/abs/2204.07118
- Archivo de reproducibilidad (Zenodo): https://doi.org/10.5281/zenodo.24055154
- Variante oficial NAVER DeiT Base RoPE mixed + APE: https://huggingface.co/naver-ai/rope_mixed_ape_deit_base_patch16_LS
- Variante oficial NAVER DeiT Small RoPE mixed + APE: https://huggingface.co/naver-ai/rope_mixed_ape_deit_small_patch16_LS
