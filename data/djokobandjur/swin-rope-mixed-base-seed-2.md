# djokobandjur/swin-rope-mixed-base-seed-2

## Resumen

Swin Base con RoPE mixto aprendido es un checkpoint de investigación de clasificación de imágenes entrenado de forma independiente por Đoko Banđur y Miloš Banđur. Se trata de una variante de la arquitectura Swin Transformer Base a la que se le ha incorporado Rotary Position Embedding (RoPE) con frecuencias rotatorias mixtas y aprendidas, una línea de trabajo derivada del paper *Rotary Position Embedding for Vision Transformer* (Heo et al., ECCV 2024). El modelo se distribuye como artefacto de entrenamiento en formato PyTorch nativo, no como paquete de Hugging Face Transformers.

El checkpoint forma parte de una familia de seis ejecuciones independientes y corresponde a la ejecución identificada como P2, con semilla aleatoria registrada 1151747145. Se entrenó sobre ImageNet-1k durante 300 épocas y alcanza un 83,836 % de Top-1 sobre las 50.000 imágenes de validación, un resultado competitivo para un ViT jerárquico de tamaño base con posicionamiento rotatorio.

Su relevancia es fundamentalmente investigadora: permite reproducir y auditar el efecto de parámetros de frecuencia rotatoria aprendidos en un transformer visual jerárquico, con trazabilidad criptográfica del checkpoint (SHA-256) y una referencia de reproducibilidad publicada en Zenodo. No está pensado como modelo de producción listo para usar, sino como material de estudio de representaciones y de diseño de positional encodings.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer Base con ventanas desplazadas y RoPE mixto aprendido (vision transformer jerárquico) |
| Parametros totales | no disponible (tamaño del checkpoint: 1.054.162.173 bytes, ~1,05 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; resolución de entrada no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes, sin capacidades lingüísticas) |
| Licencia | BSD 3-Clause |
| Formato de pesos | checkpoint PyTorch nativo (`final_checkpoint.pth`), no safetensors ni GGUF; puede contener estado del optimizador |

## Arquitectura y entrenamiento

La arquitectura base es un Swin Transformer en configuración Base, es decir, un transformer visual jerárquico que computa autoatención dentro de ventanas locales desplazadas entre capas para reducir coste cuadrático y construir mapas de características multiescala. Sobre esta base, el checkpoint sustituye o complementa el posicionamiento posicional habitual por Rotary Position Embedding con frecuencias mixtas, siguiendo la implementación de referencia de NAVER AI (rope-vit). La model card menciona además una "frequency-reference vector" archivada por separado, cuyo SHA-256 se registra pero cuyo contenido no se incluye en el repositorio.

El entrenamiento se realizó exclusivamente sobre ImageNet-1k durante 300 épocas (el checkpoint final corresponde a la época 299), con semilla aleatoria 1151747145. No se detalla en la información disponible el número de tokens o imágenes vistas, la composición exacta del pipeline de aumentos, ni si se aplicaron técnicas de regularización específicas como stochastic depth, mixup o cutmix. Tampoco se documenta el uso de RLHF, DPO ni etapas de ajuste fino adicionales, algo esperable en un clasificador visual supervisado. La innovación técnica destacable es precisamente la parametrización aprendida de las frecuencias rotatorias en un backbone jerárquico, un área poco explorada frente a los ViT planos.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k.
- Extracción de características visuales jerárquicas multiescala (útil como backbone para detección o segmentación, aunque no se ha validado en esas tareas).
- Estudio de positional encodings: permite analizar el efecto de frecuencias RoPE aprendidas frente a fijas.
- Reproducibilidad de investigación: checkpoint identificado por SHA-256 y archivo de reproducibilidad numérica asociado.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento (thinking), visión generativa, audio ni multimodalidad.

## Casos de uso

- Investigación sobre positional encodings: usar el checkpoint para comparar el rendimiento de RoPE aprendido con RoPE fijo y con posicional absoluto aprendido en un Swin Base, aislando el efecto de la parametrización de frecuencias.
- Reproducción de experimentos: cargar el checkpoint con la implementación RoPE-ViT correspondiente y verificar el 83,836 % de Top-1 sobre ImageNet-1k validation como línea base reproducible.
- Extracción de features para transferencia: congelar el backbone y entrenar cabezas ligeras en datasets de dominio específico (médico, industrial, satelital) para evaluar la calidad de las representaciones aprendidas.
- Auditoría de checkpoints: el SHA-256 y la revisión de pesos original permiten verificar integridad en pipelines de investigación y detección de modificaciones.
- Estudio de robustez: evaluar el modelo en distribuciones corruptas (ImageNet-C, ImageNet-R) para medir si las frecuencias aprendidas aportan robustez, aunque la model card advierte que no se han registrado resultados en esas condiciones.
- Docencia y formación: ejemplo práctico de entrenamiento independiente de un vision transformer con trazabilidad completa y licencia permisiva para su uso en cursos y talleres.
- Comparación de seeds: junto con las otras cinco ejecuciones de la familia, permite estudiar la varianza entre semillas en el rendimiento final.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| ImageNet-1k validation | Top-1 accuracy | 83,836 % (41.918 aciertos sobre 50.000 imágenes) |

No se han publicado resultados de benchmarks adicionales (ImageNet-V2, ImageNet-C, ImageNet-R, transferencia a COCO o ADE20K) en la información disponible. La model card advierte explícitamente que estos resultados no establecen robustez ni rendimiento en tareas o distribuciones no evaluadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa ~1,05 GB en precisión original (probablemente FP32). En FP32 se necesitan aproximadamente 2-3 GB de VRAM incluyendo activaciones para batch pequeño; en FP16/BF16 bajaría a ~1,5-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en FP32 con batch 1-8; A100, H100, L40S o RTX 4090 para entrenamiento o evaluación a gran escala.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 y similares, siempre que se use la implementación RoPE-ViT compatible.
- Opciones de despliegue: no hay soporte directo en vLLM, llama.cpp, Ollama ni TGI (son frameworks para LLM). El despliegue requiere cargar el checkpoint con PyTorch y la implementación de referencia del autor; sería necesario exportar a TorchScript u ONNX para servir en producción.
- Latencia y throughput: no disponibles. La model card no proporciona mediciones de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Top-1 ImageNet-1k | Licencia | Formato |
|---|---|---|---|---|---|
| Swin Base RoPE-Mixed (este) | no disponible (~1,05 GB checkpoint) | imagen (resolución no disponible) | 83,836 % | BSD 3-Clause | PyTorch `.pth` |
| Swin Transformer Base (oficial) | ~88 M | 224x224 | ~83,5 % (según paper original) | MIT | PyTorch / HF |
| DeiT-Base (RoPE-ViT, NAVER) | ~86 M | 224x224 | ~81-82 % (según paper RoPE-ViT) | Apache 2.0 / CC BY-NC (según variante) | PyTorch |
| ViT-Base/16 (Google) | ~86 M | 224x224 | ~77,9 % (con preentrenamiento ImageNet-21k) | Apache 2.0 | PyTorch / HF |

Nota: los valores de los modelos comparativos provienen de sus respectivos papers y no de la información proporcionada en esta ficha; se incluyen como referencia contextual y deben verificarse en las fuentes originales.

## Limitaciones y advertencias

- Checkpoint de investigación, no un paquete listo para producción: no es compatible con `AutoModel.from_pretrained` de Hugging Face Transformers; requiere la implementación RoPE-ViT emparejada y una configuración validada.
- Riesgo de seguridad: los checkpoints PyTorch basados en pickle pueden ejecutar código arbitrario al deserializarse; la propia model card advierte de cargarlo solo desde fuentes de confianza y usar modos de carga seguros cuando sea posible.
- El archivo puede contener estado del optimizador, lo que infla el tamaño y complica la carga limpia para inferencia.
- No se han evaluado robustez ni generalización fuera de ImageNet-1k validation; los 83,836 % no implican buen comportamiento en dominios distintos.
- Sesgos: al entrenarse solo con ImageNet-1k, hereda los sesgos de representación de ese dataset (clases desequilibradas, sesgos geográficos y culturales).
- Sin capacidades lingüísticas ni multimodales: no sirve para tareas de texto, VQA ni generación.
- La licencia BSD 3-Clause cubre únicamente `final_checkpoint.pth`; no relicencia el código ni los pesos upstream de NAVER/Meta, cuyas condiciones deben respetarse por separado.
- La citación académica es recomendada pero no es una condición adicional de la licencia.
- Sin garantías: la model card no ofrece compromisos de mantenimiento, actualización ni soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/djokobandjur/swin-rope-mixed-base-seed-2
- Revisión original de pesos: https://huggingface.co/djokobandjur/swin-rope-mixed-base-seed-2/tree/2145c3d1bf54bbfa1f2d0c60dce4271996619d9c
- Paper de referencia RoPE-ViT (ECCV 2024): https://arxiv.org/abs/2403.13298
- Código de referencia NAVER AI (rope-vit): https://github.com/naver-ai/rope-vit
- Paper original de Swin Transformer (ICCV 2021): https://openaccess.thecvf.com/content/ICCV2021/html/Liu_Swin_Transformer_Hierarchical_Vision_Transformer_Using_Shifted_Windows_ICCV_2021_paper.html
- Archivo de reproducibilidad en Zenodo: https://doi.org/10.5281/zenodo.24055154
