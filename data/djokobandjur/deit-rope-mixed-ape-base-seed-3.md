# djokobandjur/deit-rope-mixed-ape-base-seed-3

## Resumen

El modelo `deit-rope-mixed-ape-base-seed-3` es un checkpoint de investigación de un Vision Transformer de tipo DeiT Base entrenado de forma independiente por Đoko Banđur y Miloš Banđur, con una variante de codificación posicional que combina RoPE (Rotary Position Embedding) con frecuencias mixtas y embeddings posicionales absolutos (APE). Está pensado exclusivamente para clasificación de imágenes sobre ImageNet-1k y se publica como artefacto reproducible de un estudio sobre parámetros de frecuencia rotatoria aprendidos y representaciones internas del transformer.

La arquitectura es un ViT-Base (12 capas, 12 cabezas, dimensión 768, parches de 16x16) con la configuración de entrenamiento de DeiT III y la implementación de RoPE para visión de NAVER AI (ECCV 2024). El checkpoint reporta una precisión Top-1 del 83,780 % sobre las 50.000 imágenes de validación de ImageNet-1k. No es un paquete `AutoModel` de Hugging Face Transformers: se distribuye como `final_checkpoint.pth` en formato PyTorch nativo y requiere instanciar la implementación RoPE-ViT correspondiente antes de cargar los pesos.

Su relevancia es acotada y de carácter investigador: forma parte de una familia de seis checkpoints entrenados de forma independiente (este es el índice P3, semilla aleatoria registrada `1773900646`) y su interés radica en la reproducibilidad numérica y el estudio de variantes de codificación posicional, no en su uso como modelo de producción listo para usar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (DeiT Base) con RoPE de frecuencias mixtas + embeddings posicionales absolutos (APE) |
| Parametros totales | no disponible (configuración DeiT Base, aproximadamente 86 M por configuración estándar) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen fija por parches de 16x16; resolución de entrenamiento no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | BSD 3-Clause (aplica solo a `final_checkpoint.pth`) |
| Formato de pesos | PyTorch checkpoint nativo (`final_checkpoint.pth`, 1.385.806.305 bytes); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

Se trata de un transformer de visión con arquitectura DeiT Base: tokenización por parches de 16x16, 12 bloques de atención multi-cabeza con dimensión oculta 768 y 12 cabezas. La innovación central es la sustitución o combinación de la codificación posicional: se emplean embeddings rotatorios (RoPE) con frecuencias mixtas, incluyendo parámetros de frecuencia aprendidos, junto con embeddings posicionales absolutos (APE). La implementación de referencia es la de Heo, Park, Han y Yun publicada en ECCV 2024 (`naver-ai/rope-vit`), y la configuración de entrenamiento sigue DeiT III.

El entrenamiento se realizó sobre ImageNet-1k con la configuración de DeiT III. El checkpoint publicado corresponde a la selección `PRIMARY_FINAL`, es decir, el checkpoint final de fine-tuning en la época 19. No se detalla en la información disponible el número total de tokens vistos, la composición exacta del dataset más allá de ImageNet-1k, ni si se aplicaron fases de RLHF/DPO (no aplicables en un modelo de clasificación). El autor advierte que el archivo puede contener estado de optimizador o de entrenamiento además de los pesos del modelo, y que no se trata de un rehosting de un modelo preentrenado upstream.

## Capacidades

- Clasificación de imágenes sobre las 1.000 clases de ImageNet-1k.
- Extracción de representaciones internas del transformer para investigación (análisis de atención, embeddings posicionales, frecuencias rotatorias).
- Estudio comparativo de variantes de codificación posicional (RoPE mixto + APE frente a alternativas).
- Reproducibilidad numérica: el checkpoint está identificado por SHA-256 y por una revisión de pesos concreta.
- No soporta generación de texto, código, matemáticas, visión-lenguaje, tool calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües ni de modo de razonamiento explícito.
- No se documentan capacidades de detección, segmentación ni tareas densas; el pipeline declarado es únicamente `image-classification`.

## Casos de uso

- Reproducción de experimentos académicos sobre RoPE en visión: cargar el checkpoint con la implementación RoPE-ViT correspondiente y verificar la precisión Top-1 reportada (83,780 %) sobre ImageNet-1k validation para validar pipelines de evaluación.
- Estudio de codificación posicional: comparar las representaciones y el rendimiento de esta variante (RoPE mixto + APE) frente a otros checkpoints de la misma familia y frente al DeiT Base estándar, aislando el efecto de la codificación posicional.
- Análisis de representaciones internas: extraer mapas de atención y embeddings de las 12 capas para investigar cómo las frecuencias rotatorias aprendidas afectan a la localización espacial de los parches.
- Baseline de clasificación en investigación: usar el modelo como referencia de ViT-Base en experimentos controlados donde se requiera una semilla y un checkpoint con trazabilidad criptográfica (SHA-256 y revisión de pesos).
- Docencia y formación: ilustrar en cursos de visión por computador el funcionamiento de un ViT con codificación posicional alternativa sobre un dataset estándar como ImageNet-1k.
- Auditoría de reproducibilidad: verificar el hash del checkpoint y la correspondencia con el vector de referencia de frecuencias registrado en el archivo de reproducibilidad de Zenodo.

## Benchmarks y rendimiento

| Benchmark | Métricas | Resultado |
|---|---|---|
| ImageNet-1k validation (50.000 imágenes) | Top-1 accuracy | 83,780 % (41.890 aciertos) |

No se han publicado en la información disponible resultados de otros benchmarks (por ejemplo, robustez ante corrupción, transferencia a otras tareas o comparativas numéricas frente a otros modelos). El autor indica explícitamente que estos resultados no establecen robustez ni rendimiento en tareas o distribuciones no evaluadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el archivo de checkpoint ocupa 1,4 GB, lo que sugiere un modelo de tamaño ViT-Base (aproximadamente 86 M de parámetros). En FP32 se estiman en torno a 350 MB de pesos, y en FP16 en torno a 175 MB, aunque estas cifras no están confirmadas en la información proporcionada.
- GPU recomendadas: no disponibles. Por tamaño, un ViT-Base es desplegable en GPUs de consumo, pero no se documentan requisitos oficiales.
- Compatibilidad con GPU de consumo: previsiblemente sí para un ViT-Base, aunque no se confirma en la información disponible.
- Opciones de despliegue: no se documentan. El checkpoint es un `.pth` nativo de PyTorch y no un paquete `AutoModel`; requiere la implementación RoPE-ViT de NAVER AI. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a este caso).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `djokobandjur/deit-rope-mixed-ape-base-seed-3` | no disponible (ViT-Base) | parches 16x16, resolución no especificada | Top-1 83,780 % en ImageNet-1k val | BSD 3-Clause | Hugging Face, checkpoint `.pth` |
| `naver-ai/rope_mixed_ape_deit_base_patch16_LS` | no disponible (ViT-Base) | parches 16x16 | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face (implementación de referencia) |
| DeiT III Base (upstream) | no disponible (ViT-Base) | parches 16x16 | no disponible en la información proporcionada | no disponible en la información proporcionada | Referencia académica (arXiv 2204.07118) |

No se dispone de datos numéricos de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para producción ni para tareas distintas de la clasificación de imágenes sobre ImageNet-1k.
- No es un paquete `AutoModel` de Transformers: requiere instanciar la implementación RoPE-ViT correspondiente y la configuración de preprocesado adecuada; el autor indica que el ejemplo de carga end-to-end se publicará tras validarse.
- Riesgo de seguridad: los checkpoints PyTorch basados en pickle pueden ejecutar código arbitrario durante la deserialización. Cargar solo desde fuentes de confianza y usar modos de carga seguros cuando sea compatible.
- El archivo puede contener estado de optimizador o de entrenamiento, no solo pesos del modelo.
- Sesgos: no documentados en la información disponible; al entrenarse solo con ImageNet-1k hereda los sesgos de ese dataset (clases y distribución sesgadas hacia categorías occidentales y de dominio fotográfico).
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede producir clasificaciones erróneas con alta confianza en distribuciones fuera de dominio; el autor advierte que los resultados no establecen robustez.
- Limitaciones de idioma: no aplica; el modelo no procesa texto.
- Licencia: BSD 3-Clause cubre únicamente `final_checkpoint.pth`; no relicencia el código de NAVER/Meta, los datos de ImageNet ni otro material de terceros. El uso comercial del checkpoint está permitido por la licencia, pero debe revisarse la licencia de la implementación subyacente.
- Sin métricas de robustez, calibración ni transferencia publicadas.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/djokobandjur/deit-rope-mixed-ape-base-seed-3
- Revisión de pesos original: https://huggingface.co/djokobandjur/deit-rope-mixed-ape-base-seed-3/tree/3d4a77e1b8c6807dc8a7f8fd8f0e6c68e7bfb6fd
- Paper RoPE-ViT (ECCV 2024): https://arxiv.org/abs/2403.13298
- Código de referencia RoPE-ViT (NAVER AI): https://github.com/naver-ai/rope-vit
- Log de referencia `rope_mixed_ape_deit_base_patch16_LS`: https://github.com/naver-ai/rope-vit/blob/main/logs/rope_mixed_ape_deit_base_patch16_LS.txt
- Modelo de referencia en Hugging Face: https://huggingface.co/naver-ai/rope_mixed_ape_deit_base_patch16_LS
- Paper DeiT III: https://arxiv.org/abs/2204.07118
- Archivo de reproducibilidad (Zenodo): https://doi.org/10.5281/zenodo.24055154
