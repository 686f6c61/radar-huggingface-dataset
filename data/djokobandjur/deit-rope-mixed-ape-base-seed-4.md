# djokobandjur/deit-rope-mixed-ape-base-seed-4

## Resumen

DeiT Base con RoPE mixto aprendido y embeddings posicionales absolutos (APE) es un checkpoint de investigación de clasificación de imágenes desarrollado por Đoko Banđur y Miloš Banđur. Se trata de una de las seis ejecuciones independientes de entrenamiento de la familia DeiT que aplican la propuesta de Rotary Position Embedding para Vision Transformer (RoPE-ViT, ECCV 2024) sobre la configuración de entrenamiento de DeiT III, combinando frecuencias rotatorias mixtas con embeddings posicionales absolutos clásicos.

El modelo resuelve la tarea de clasificación de imágenes sobre ImageNet-1k y su interés es fundamentalmente metodológico: permite estudiar cómo interactúan los esquemas de posición relativa (RoPE) y absoluta (APE) en un transformer de visión, así como la reproducibilidad de los parámetros de frecuencia aprendidos. La arquitectura es un Vision Transformer tipo DeiT-Base (12 capas, dimensión oculta 768, 12 cabezas de atención, parches de 16x16), con aproximadamente 86 millones de parámetros.

Es relevante ahora como artefacto de investigación reproducible: incluye SHA-256 del checkpoint, semilla aleatoria registrada y un archivo Zenodo de reproducibilidad numérica. No es un modelo listo para producción ni un paquete `AutoModel` de Transformers, sino un checkpoint PyTorch original que requiere la implementación emparejada de RoPE-ViT para su carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (DeiT Base, patch 16, 12 capas, dim 768, 12 cabezas) con RoPE mixto aprendido + APE |
| Parametros totales | aproximadamente 86 M (DeiT-Base; no confirmado de forma explícita en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes; resolución de entrada no especificada en la información disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (visión); no disponible |
| Licencia | BSD 3-Clause (solo sobre `final_checkpoint.pth`) |
| Formato de pesos | PyTorch `.pth` (`final_checkpoint.pth`, 1.385.806.369 bytes) |

## Arquitectura y entrenamiento

El modelo sigue la familia DeiT III con parches de 16x16 y añade un esquema híbrido de posicionamiento: RoPE con frecuencias mixtas (aprendidas) combinado con embeddings posicionales absolutos (APE). La implementación de referencia es la de NAVER AI (`naver-ai/rope-vit`), descrita en *Rotary Position Embedding for Vision Transformer* (ECCV 2024), y la configuración de entrenamiento se apoya en DeiT III. La variante "mixed" se refiere al uso de frecuencias rotatorias mixtas frente a la variante axial.

El entrenamiento se realizó sobre ImageNet-1k. La model card indica que este checkpoint corresponde a la ejecución P4 (identificador ordinal, no la semilla) con semilla aleatoria registrada `2044061466`, y que se seleccionó el checkpoint final de fine-tuning (época 19, etiqueta `PRIMARY_FINAL`). No se especifican en la información disponible el número total de tokens vistos, la composición exacta del dataset más allá de ImageNet-1k, ni si hubo RLHF/DPO (no aplicable en clasificación). El checkpoint conserva el formato original de entrenamiento y puede contener estado del optimizador.

## Capacidades

- Clasificación de imágenes sobre ImageNet-1k (1.000 clases) con una precisión Top-1 registrada del 83,648 % sobre las 50.000 imágenes de validación.
- Extracción de representaciones de un Vision Transformer con posicionamiento rotatorio, útil para investigación de atención y embeddings.
- Estudio de parámetros de frecuencia rotatoria aprendidos (el vector de referencia de frecuencias está archivado por separado, con SHA-256 propio).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión generativa, audio ni otras modalidades.

## Casos de uso

- Investigación en posicionamiento de transformers de visión: comparar el efecto de RoPE mixto aprendido frente a APE y frente a variantes axiales en DeiT-Base, usando este checkpoint como una de las seis ejecuciones del estudio.
- Reproducibilidad numérica: verificar el SHA-256 del checkpoint (`ec455ec7...c9b4`) y la semilla registrada para replicar el resultado Top-1 del 83,648 % con la implementación emparejada.
- Baseline de clasificación de imágenes en experimentos académicos: emplear este checkpoint como referencia de DeiT-Base con posicionamiento híbrido sobre ImageNet-1k.
- Análisis de representaciones internas: extraer mapas de atención y activaciones para estudiar cómo las frecuencias rotatorias aprendidas afectan a la localización espacial.
- Estudio de robustez y distribución: al ser un checkpoint con evaluación limpia documentada, sirve como punto de partida para medir degradación ante corrupción de imagen o cambios de dominio.
- Docencia y formación: ejemplo práctico de entrenamiento independiente y trazabilidad de artefactos (checksums, semillas, revisiones de pesos) en investigación de visión por computador.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| ImageNet-1k validación | Top-1 accuracy (50.000 imágenes, 41.824 correctas) | 83,648 % |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros no aplican a este modelo de visión). No se dispone de datos de robustez ni de rendimiento en distribuciones no evaluadas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,6 GB en FP32 para un modelo de ~86 M de parámetros (cálculo teórico a partir del tamaño; no confirmado en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP32; A100, H100 o RTX 4090 son sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante, orientativo).
- Opciones de despliegue: no hay soporte directo en vLLM, llama.cpp, Ollama o TGI (son herramientas de modelos de lenguaje). Requiere la implementación emparejada de RoPE-ViT y PyTorch; la model card indica que el ejemplo de carga end-to-end se publicará tras validar la configuración de inferencia y preprocesado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Top-1 ImageNet-1k | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| djokobandjur/deit-rope-mixed-ape-base-seed-4 | ~86 M (DeiT-Base) | no aplica | 83,648 % | BSD 3-Clause | Hugging Face (checkpoint `.pth`) |
| naver-ai/rope_mixed_ape_deit_base_patch16_LS | ~86 M (DeiT-Base) | no aplica | no disponible en la información | no disponible en la información | Hugging Face (NAVER AI) |
| Otras ejecuciones del estudio (P1-P6) | ~86 M (DeiT-Base) | no aplica | no disponible en la información | BSD 3-Clause | Hugging Face (djokobandjur) |

No se dispone de datos de benchmarks de las alternativas en la información proporcionada; la comparativa se limita a configuración y procedencia.

## Limitaciones y advertencias

- Checkpoint de investigación, no un paquete listo para `AutoModel.from_pretrained`: requiere instanciar la implementación emparejada de RoPE-ViT antes de cargar los pesos.
- El archivo es un pickle de PyTorch sin verificación de seguridad: puede ejecutar código arbitrario al deserializarse; cargar solo desde fuentes de confianza y usar modos de carga seguros cuando sea compatible.
- Puede contener estado del optimizador u otro estado de entrenamiento, no solo pesos del modelo.
- Los resultados de 83,648 % Top-1 son de evaluación limpia; no establecen robustez ante corrupción, cambios de dominio ni tareas no evaluadas.
- La licencia BSD 3-Clause se aplica únicamente a `final_checkpoint.pth`; no relicencia el código de NAVER/Meta, los datos de ImageNet ni otro material de terceros.
- El vector de referencia de frecuencias no está incluido en el repositorio, solo su checksum.
- Sin datos publicados sobre sesgos, alucinación (no aplica a clasificación) o limitaciones idiomáticas.
- Sin descargas ni likes registrados; sin validación comunitaria del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/djokobandjur/deit-rope-mixed-ape-base-seed-4
- Revisión de pesos original: https://huggingface.co/djokobandjur/deit-rope-mixed-ape-base-seed-4/tree/4eeb7a33e5158f79a03e0c12ba8ab6028bf67b59
- Paper RoPE-ViT (ECCV 2024): https://arxiv.org/abs/2403.13298
- Código de referencia NAVER AI: https://github.com/naver-ai/rope-vit
- Paper DeiT III: https://arxiv.org/abs/2204.07118
- Modelo de referencia NAVER AI: https://huggingface.co/naver-ai/rope_mixed_ape_deit_base_patch16_LS
- Archivo de reproducibilidad (Zenodo): https://doi.org/10.5281/zenodo.24055154
