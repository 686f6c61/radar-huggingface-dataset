# djokobandjur/deit-rope-mixed-ape-base-seed-5

## Resumen

DeiT Base con RoPE-Mixed y embeddings posicionales absolutos (APE) es un checkpoint de investigación de clasificación de imágenes entrenado de forma independiente por Đoko Banđur y Miloš Banđur. Se trata de un Vision Transformer de arquitectura DeiT Base (ViT-Base, patch 16, 86 millones de parámetros) que combina embeddings posicionales absolutos aprendidos con codificaciones rotatorias mixtas (RoPE-Mixed), siguiendo la línea de trabajo de Heo et al. (ECCV 2024) sobre Rotary Position Embedding para Vision Transformer y la configuración de entrenamiento de DeiT III.

El checkpoint corresponde a la ejecución identificada como P5 dentro de una familia de seis entrenamientos independientes, con semilla aleatoria registrada `490800448` y selección del checkpoint final de fine-tuning (época 19). Sobre la validación de ImageNet-1k (50.000 imágenes) registra una precisión Top-1 del 83,838% (41.919 aciertos), un resultado competitivo para un ViT-Base/16 entrenado desde cero sobre ImageNet-1k.

Su relevancia es fundamentalmente investigadora: permite reproducir y comparar el efecto de distintas codificaciones posicionales (RoPE mixto combinado con APE) sobre representaciones de transformers de visión. No es un modelo listo para producción: se distribuye como checkpoint PyTorch original (`final_checkpoint.pth`), no como paquete `AutoModel` de Hugging Face Transformers, y requiere instanciar la implementación RoPE-ViT correspondiente para cargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (DeiT Base, patch 16) con RoPE-Mixed + embeddings posicionales absolutos (APE) |
| Parametros totales | aproximadamente 86 M (configuracion DeiT Base; no se explicita el recuento exacto en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; entrada tipica de 224x224 px en ViT-Base/16, no confirmado en la card) |
| Tipos de cuantizacion | no disponible (solo se distribuye el checkpoint PyTorch original en fp32) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | BSD 3-Clause (aplica solo a `final_checkpoint.pth`; no relicencia codigo de NAVER/Meta ni datos de ImageNet) |
| Formato de pesos | PyTorch `.pth` original (`final_checkpoint.pth`, 1.385.806.305 bytes); no es un paquete Transformers |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de tipo DeiT Base con patch size 16, que procesa imágenes divididas en parches y las trata como una secuencia de tokens. La innovación respecto a un DeiT estándar es la incorporación de RoPE-Mixed: codificaciones posicionales rotatorias con frecuencias mixtas, combinadas con embeddings posicionales absolutos aprendidos (APE). Esta combinación sigue la propuesta de Heo, Park, Han y Yun en *Rotary Position Embedding for Vision Transformer* (ECCV 2024), cuyo código de referencia está publicado en el repositorio `naver-ai/rope-vit`.

El entrenamiento sigue la configuración de DeiT III y se realizó sobre ImageNet-1k. El checkpoint liberado es el resultado final de fine-tuning en la época 19, seleccionado como `PRIMARY_FINAL`. La model card no detalla el número de tokens vistos, la composición exacta del dataset más allá de ImageNet-1k, ni si se aplicaron técnicas de regularización específicas como RLHF (no aplicable en visión) o aumentación concreto. El autor documenta un SHA-256 del checkpoint (`3c256b4ce997a6c30bea45338971c5b8adbcfa106acd612fb3bd20e3ac705f08`) y un SHA-256 de un vector de referencia de frecuencias (`c0cd2ecdbe6d9ebafb8413fba6f53b7a216d7e528d6cc286cff98a3821e3388e`) archivado por separado, lo que facilita la reproducibilidad numérica del experimento.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k con la implementación y el preprocesamiento emparejados.
- Extracción de representaciones visuales de un transformer con codificación posicional rotatoria mixta, útil para estudiar la transferibilidad de dichas representaciones.
- Investigación sobre el efecto de la codificación posicional (RoPE-Mixed + APE) en la atención y en las representaciones internas del modelo.
- Reproducibilidad numérica: el checkpoint está identificado por SHA-256 y acompañado de un archivo Zenodo de reproducibilidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión y clasificación.
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Reproducción de experimentos sobre codificación posicional en ViTs: cargar el checkpoint con la implementación RoPE-ViT correspondiente y comparar métricas con los otros cinco checkpoints de la familia para aislar el efecto de la semilla y de la configuración posicional.
- Estudio de representaciones internas: extraer activaciones y mapas de atención para analizar cómo RoPE-Mixed + APE modifica la atención espacial frente a un DeiT con APE puro.
- Benchmark de clasificación en ImageNet-1k: usar el 83,838% Top-1 registrado como referencia para validar pipelines de evaluación propios sobre el mismo conjunto de validación.
- Transfer learning a datasets downstream: partir de los pesos como inicialización en tareas de visión con menos datos, evaluando si la codificación rotatoria mixta mejora la transferibilidad (el autor mantiene un repositorio público `vit-pe-transfer` sobre este tema).
- Docencia e investigación en transformers de visión: ejemplo práctico y verificable de cómo se implementa y entrena un ViT con una codificación posicional alternativa.
- Auditoría de reproducibilidad: verificar el SHA-256 del checkpoint y del vector de frecuencias para comprobar la integridad del artefacto en un archivo de investigación.

## Benchmarks y rendimiento

| Benchmark | Conjunto | Imagenes | Aciertos | Metrica |
|---|---|---:|---:|---|
| ImageNet-1k validation | Validacion oficial | 50.000 | 41.919 | Top-1 83,838% |

No se han publicado en la informacion disponible resultados adicionales (Top-5, robustez, transferencia, latencia) ni comparaciones con otros modelos. Los datos anteriores son los registrados por el autor para este checkpoint final concreto y no establecen robustez frente a distribuciones no evaluadas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 3,5-4 GB para los pesos (1,4 GB de checkpoint que puede incluir estado de optimizador) más activaciones; con batch pequeño cabe en GPUs consumer de 8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en fp32 con batch moderado; A100/H100 no son necesarias para este tamaño, pero aceleran la evaluación a gran escala.
- Cabe en GPU consumer: sí, en RTX 3060/4060 (8-12 GB), RTX 4070/4080 y superiores, siempre que se use la implementación RoPE-ViT emparejada.
- Opciones de despliegue: no hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI (son runtimes de modelos de lenguaje). El despliegue requiere PyTorch con la implementación `naver-ai/rope-vit` y el preprocesamiento de ImageNet correspondiente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Top-1 ImageNet-1k | Licencia | Formato |
|---|---|---|---|---|---|
| djokobandjur/deit-rope-mixed-ape-base-seed-5 (este) | ~86 M | 224x224 (ViT-Base/16, no confirmado) | 83,838% (registrado por el autor) | BSD 3-Clause | `.pth` PyTorch |
| naver-ai/rope_mixed_ape_deit_base_patch16_LS | ~86 M | 224x224 (ViT-Base/16) | no disponible en la informacion | no disponible en la informacion | paquete Hugging Face |
| DeiT III Base (upstream, referencia) | ~86 M | 224x224 (ViT-Base/16) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

La comparación cuantitativa con las alternativas no puede completarse porque la información disponible no incluye sus métricas ni sus condiciones de licencia. El modelo de NAVER es el referente directo de la implementación RoPE-Mixed + APE; este checkpoint es un entrenamiento independiente del mismo diseño.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción: no es un paquete `AutoModel.from_pretrained` y exige la implementación RoPE-ViT emparejada y el preprocesamiento validado, que el autor aún no ha publicado de extremo a extremo.
- El checkpoint puede contener estado de optimizador o de entrenamiento además de los pesos, lo que aumenta el tamaño y requiere inspección antes de usarlo en inferencia.
- Riesgo de seguridad: los checkpoints PyTorch basados en pickle pueden ejecutar código arbitrario al deserializarse; deben cargarse solo desde fuentes de confianza y con modos de carga seguros cuando sea compatible.
- Sesgos: no documentados en la model card; al entrenarse solo con ImageNet-1k hereda los sesgos de etiquetado y representación de dicho dataset.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución; el 83,838% se refiere solo a la validación limpia de ImageNet-1k.
- Limitaciones de idioma: no aplica; el modelo no procesa texto.
- Restricciones de licencia: BSD 3-Clause cubre únicamente `final_checkpoint.pth`; no relicencia el código de NAVER/Meta, los datos de ImageNet ni otro material de terceros. La cita académica es recomendada, no una condición adicional de la licencia.
- Sin métricas de robustez, calibración, latencia ni rendimiento en dominios distintos de ImageNet-1k.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente del resultado reportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djokobandjur/deit-rope-mixed-ape-base-seed-5
- Revision original de los pesos: https://huggingface.co/djokobandjur/deit-rope-mixed-ape-base-seed-5/tree/11a7387726ecda392de9952157c19f5e41642f59
- Referencia NAVER del mismo diseno (RoPE-Mixed + APE DeiT Base): https://huggingface.co/naver-ai/rope_mixed_ape_deit_base_patch16_LS
- Paper RoPE for Vision Transformer (ECCV 2024): https://arxiv.org/abs/2403.13298
- Codigo de referencia NAVER AI: https://github.com/naver-ai/rope-vit
- Paper DeiT III: https://arxiv.org/abs/2204.07118
- Archivo de reproducibilidad (Zenodo): https://doi.org/10.5281/zenodo.24055154
- GitHub del autor: https://github.com/djokobandjur
