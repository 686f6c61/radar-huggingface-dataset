# djokobandjur/swin-rope-mixed-base-seed-4

## Resumen

Swin Base con RoPE mixto aprendido (run P4) es un checkpoint de investigación de clasificación de imágenes entrenado de forma independiente por Đoko Banđur y Miloš Banđur sobre ImageNet-1k. Se trata de una variante del Swin Transformer Base que incorpora embeddings posicionales rotatorios (RoPE) con frecuencias mixtas aprendidas, siguiendo la línea de trabajo de Heo et al. (ECCV 2024) sobre RoPE para vision transformers. No es un modelo generativo ni un modelo de lenguaje: es un clasificador de imágenes de 224x224 con arquitectura transformer jerárquica de ventanas desplazadas.

El checkpoint forma parte de una serie de seis ejecuciones independientes de entrenamiento (identificadas P1 a P6) publicadas como artefactos de reproducibilidad científica. Este repositorio concreto corresponde a la ejecución P4, con semilla aleatoria registrada 2044061466 y checkpoint final en la época 299. El objetivo declarado es servir como recurso reproducible para investigación sobre representaciones de transformers y parámetros de frecuencia rotatoria aprendidos, no como modelo listo para producción.

La relevancia actual es acotada pero específica: proporciona un artefacto verificable con checksum SHA-256 para estudiar cómo las frecuencias RoPE aprendidas afectan a las representaciones internas de un Swin Transformer, y complementa el archivo de reproducibilidad numérica depositado en Zenodo. El modelo alcanza un 83,690% de top-1 en la validación de ImageNet-1k (41.845 aciertos sobre 50.000 imágenes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer Base con ventanas desplazadas y RoPE de frecuencias mixtas aprendidas |
| Parametros totales | no disponible (repo de 1,1 GB; el checkpoint pesa 1.054.162.173 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes; entrada 224x224) |
| Tipos de cuantizacion | no disponible (solo se publica checkpoint PyTorch original) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | BSD 3-Clause (aplica al archivo `final_checkpoint.pth`) |
| Formato de pesos | PyTorch `.pth` (checkpoint de entrenamiento original, no convertido a safetensors ni a formato Transformers) |

## Arquitectura y entrenamiento

La arquitectura es un Swin Transformer Base en configuración de ventanas desplazadas, con patch size 4 y resolución de entrada 224x224 (coherente con la nomenclatura `swin_rope_mixed_base_patch4_window7_224` del modelo upstream de NAVER). La modificación principal respecto al Swin estándar es la sustitución de los embeddings posicionales por RoPE (Rotary Position Embedding) con frecuencias mixtas aprendidas, siguiendo la implementación de Heo, Park, Han y Yun publicada en ECCV 2024 y disponible en el repositorio `naver-ai/rope-vit`. El autor registra además un checksum SHA-256 de un vector de referencia de frecuencias (`bf36451b...`) que no se incluye en el repositorio, lo que sugiere que las frecuencias rotatorias se tratan como parámetros analíticos separados del checkpoint de pesos.

El entrenamiento se realizó sobre ImageNet-1k (ILSVRC/imagenet-1k) durante 300 épocas, con la época 299 seleccionada como checkpoint final (`PRIMARY_FINAL`). No se documentan en la información disponible el número de tokens vistos, la composición exacta del dataset más allá de ImageNet-1k, ni si hubo técnicas de regularización específicas, aumento de datos o ajuste fino posterior. Tampoco se especifica si el checkpoint contiene estado del optimizador, aunque la model card advierte que puede incluirlo. La ejecución P4 forma parte de una serie de seis entrenamientos independientes, lo que apunta a un diseño experimental orientado a medir variabilidad entre semillas.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k con entrada de 224x224 píxeles.
- Extracción de representaciones visuales jerárquicas propias de la familia Swin (mapas de características multiescala).
- Estudio de parámetros de frecuencia rotatoria aprendidos: el modelo permite analizar cómo evolucionan las frecuencias RoPE durante el entrenamiento.
- Reproducibilidad experimental: checksum SHA-256 del checkpoint y de un vector de referencia de frecuencias, más semilla aleatoria registrada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión generativa, audio ni capacidades multilingües.
- No dispone de modo de pensamiento (thinking mode) ni de decodificación especulativa.

## Casos de uso

- Investigación sobre RoPE en visión: comparar este checkpoint (frecuencias mixtas aprendidas) con el Swin Base estándar y con variantes de frecuencias fijas para aislar el efecto del aprendizaje de frecuencias rotatorias en las representaciones.
- Reproducibilidad de experimentos: usar el SHA-256 del checkpoint y la semilla registrada para replicar exactamente la ejecución P4 y medir la varianza entre las seis ejecuciones de la serie.
- Estudio de variabilidad entre semillas: al existir seis checkpoints independientes del mismo modelo, permite analizar la dispersión de precisión y de representaciones internas atribuible únicamente a la inicialización.
- Benchmark de clasificación de imágenes en entornos académicos: servir como línea base de 83,690% top-1 en ImageNet-1k para comparaciones controladas con otras variantes de Swin con RoPE.
- Análisis de atención y mapas de características: al ser un transformer jerárquico con ventanas desplazadas, es adecuado para estudiar patrones de atención local/global en tareas de interpretabilidad.
- Docencia y formación: ejemplo práctico de entrenamiento completo de un vision transformer con modificaciones arquitectónicas sobre un dataset estándar, con artefactos verificables.
- Base para ajuste fino experimental: punto de partida para tareas de clasificación con menos clases, siempre que se disponga de la implementación RoPE-ViT compatible.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| ImageNet-1k validacion | Top-1 accuracy | 83,690% (41.845 / 50.000) |

No se han publicado en la información disponible resultados de otros benchmarks (por ejemplo, transferencia a CIFAR, COCO, ADE20K) ni comparaciones numéricas directas con el Swin Base original o con el checkpoint oficial de NAVER `swin_rope_mixed_base_patch4_window7_224`. La model card advierte explícitamente que estos resultados no establecen robustez ni rendimiento en distribuciones no evaluadas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 4,2 GB solo para pesos (1,054 GB de checkpoint), más activaciones; en la práctica se recomienda al menos 8-10 GB para lotes pequeños a 224x224.
- VRAM estimada en FP16/BF16: aproximadamente 2,1 GB para pesos; viable en GPUs consumer con 6-8 GB o más.
- GPUs recomendadas: cualquier GPU con al menos 8 GB para inferencia en precisión mixta (RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, A100, H100). Para entrenamiento completo se requieren varias GPUs de 24 GB o superiores.
- Cabe en GPU consumer: sí, en FP16/BF16 en GPUs de 8 GB o más; en FP32 requiere al menos 12 GB para evitar swapping.
- Opciones de despliegue: no hay soporte directo en vLLM, llama.cpp, Ollama ni TGI (son herramientas para modelos de lenguaje). El despliegue requiere instanciar la implementación RoPE-ViT (basada en `naver-ai/rope-vit`) y cargar el `.pth` con PyTorch; la conversión a safetensors es posible pero no está publicada.
- Latencia y throughput: no disponibles en la información proporcionada.
- Advertencia de seguridad: el checkpoint es un pickle de PyTorch; debe cargarse solo desde fuentes de confianza y, si es compatible, con `torch.load(..., weights_only=True)` o modos seguros equivalentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Top-1 ImageNet-1k | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| djokobandjur/swin-rope-mixed-base-seed-4 (este) | no disponible (checkpoint 1,05 GB) | 224x224 | 83,690% | BSD 3-Clause | Hugging Face, `.pth` original |
| naver-ai/swin_rope_mixed_base_patch4_window7_224 | no disponible | 224x224 | no disponible en la información | BSD 3-Clause | Hugging Face, formato Transformers |
| Swin Transformer Base (Liu et al., ICCV 2021) | ~88 M (cifra de referencia de la literatura, no confirmada en la información) | 224x224 | no disponible en la información | MIT (upstream) | Múltiples repositorios |
| DeiT Base con RoPE (Heo et al., ECCV 2024) | no disponible | 224x224 | no disponible en la información | BSD 3-Clause | `naver-ai/rope-vit` |

La comparación numérica directa no es posible con los datos proporcionados: solo se dispone del top-1 de este checkpoint. La alternativa más cercana es el checkpoint oficial de NAVER con la misma configuración nominal (`swin_rope_mixed_base_patch4_window7_224`), que emplea la misma base arquitectónica pero se distribuye en formato Transformers y no publica en la información disponible su precisión exacta.

## Limitaciones y advertencias

- Modelo exclusivamente de clasificación de imágenes: no genera texto, no razona, no ejecuta código ni soporta tool calling; no debe evaluarse como modelo de lenguaje.
- Checkpoint de investigación: la model card indica que el ejemplo de carga extremo a extremo se publicará tras validar la configuración de inferencia y preprocesado; hasta entonces, la integración requiere trabajo adicional.
- No es un paquete `AutoModel.from_pretrained`: hay que instanciar la implementación RoPE-ViT compatible y la configuración correspondiente antes de cargar los pesos.
- Riesgo de seguridad del pickle: `final_checkpoint.pth` es un checkpoint PyTorch serializado con pickle; cargarlo puede ejecutar código arbitrario si el archivo está manipulado. Verificar el SHA-256 `ebd91dfb6f648d9419d2eaf25635fbc852c7a2de0d3e393aa286c66ef2ce77dd` antes de usarlo.
- Puede contener estado del optimizador además de los pesos del modelo, lo que aumenta el tamaño y requiere filtrar las claves al cargar.
- Sesgos: no documentados en la información disponible; al entrenarse solo con ImageNet-1k, hereda los sesgos de etiquetado y representación de ese dataset.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la precisión de clasificación puede degradarse fuera de la distribución de ImageNet-1k; la model card lo advierte explícitamente.
- Alcance de la licencia: BSD 3-Clause cubre únicamente `final_checkpoint.pth`; no relicencia el código ni los pesos upstream de NAVER o Meta. El uso comercial está permitido por BSD 3-Clause, pero debe revisarse la licencia del código de implementación subyacente.
- Idiomas: no aplica; el modelo no procesa texto.
- Sin garantías de producción: es un artefacto de reproducibilidad científica, no un modelo validado para despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djokobandjur/swin-rope-mixed-base-seed-4
- Revisión original de los pesos: https://huggingface.co/djokobandjur/swin-rope-mixed-base-seed-4/tree/d0d70a28cf4bd248989899148326fa59ece18df6
- Checkpoint oficial NAVER equivalente: https://huggingface.co/naver-ai/swin_rope_mixed_base_patch4_window7_224
- Paper RoPE para Vision Transformer (Heo et al., ECCV 2024): https://arxiv.org/abs/2403.13298
- Código fuente NAVER AI (rope-vit): https://github.com/naver-ai/rope-vit
- Paper Swin Transformer (Liu et al., ICCV 2021): https://openaccess.thecvf.com/content/ICCV2021/html/Liu_Swin_Transformer_Hierarchical_Vision_Transformer_Using_Shifted_Windows_ICCV_2021_paper.html
- Archivo de reproducibilidad en Zenodo: https://doi.org/10.5281/zenodo.24055154
