# GYP666/BLADE

## Resumen

BLADE es un framework de generación de vídeo eficiente desarrollado por el autor GYP666 (repositorio asociado al laboratorio Ziplab) que combina atención dispersa por bloques (block-sparse attention) con destilación de pasos (step distillation) para acelerar modelos de difusión de vídeo. No es un modelo generativo independiente, sino un conjunto de pesos LoRA y un pipeline de entrenamiento que se aplica sobre modelos base existentes: CogVideoX-5B y Wan2.1-T2V-1.3B. Su propuesta central es reducir el número de pasos de inferencia de 50 a 8 manteniendo la calidad de generación, mediante el método de destilación de trayectoria (Trajectory Distillation Method, TDM), que permite entrenar sin necesidad de datos de vídeo.

El modelo se publica bajo licencia Apache 2.0, con pesos en formato safetensors y un tamaño de repositorio de 6,2 GB. La relevancia actual reside en que aborda uno de los cuellos de botella principales de la generación de vídeo por difusión: el coste computacional de la inferencia. Al combinar una atención adaptativa dispersa con la reducción de pasos, BLADE busca hacer viable la generación de vídeo en entornos con recursos limitados, como GPUs de 24 GB, sin reentrenar las arquitecturas base.

La información disponible sobre el modelo es limitada: no se especifican idiomas soportados, pipeline de Hugging Face ni resultados de benchmarks en la model card. Los datos técnicos se extraen del README y de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión de vídeo con atención dispersa por bloques (block-sparse attention) y destilación de pasos; se aplica como LoRA sobre CogVideoX-5B y Wan2.1-T2V-1.3B |
| Parametros totales | no disponible (los pesos base son 5B para CogVideoX y 1.3B para WanX; BLADE añade adaptadores LoRA) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos LoRA preentrenados) |

## Arquitectura y entrenamiento

BLADE se construye sobre modelos de difusión de vídeo basados en transformers (CogVideoX-5B y Wan2.1-T2V-1.3B) e introduce dos innovaciones técnicas. La primera es un mecanismo de atención dispersa por bloques adaptativo, que reduce la complejidad computacional al limitar las interacciones entre tokens a bloques seleccionados dinámicamente. La segunda es la destilación de trayectoria (TDM), que entrena un modelo estudiante para aproximar la trayectoria del modelo profesor con solo 8 pasos de inferencia en lugar de los 50 habituales. El entrenamiento es data-free: no requiere datos de vídeo, solo embeddings de texto preprocesados, lo que simplifica el pipeline de entrenamiento.

El proceso de entrenamiento se divide en dos fases: preprocesamiento de prompts para generar embeddings y entrenamiento con `accelerate` en configuraciones multi-GPU (8 GPUs recomendadas, con `train_batch_size` de 5 y acumulación de gradientes de 4). Se emplea precisión mixta bf16 y tasas de aprendizaje de 1e-4 para el estudiante y 5e-4 para el discriminador. Los pesos resultantes son LoRA que se aplican sobre el modelo base sin modificar su arquitectura original, lo que permite un uso plug-and-play.

## Capacidades

- Generación de vídeo texto-a-vídeo (text-to-video) sobre los modelos base CogVideoX-5B y Wan2.1-T2V-1.3B.
- Inferencia acelerada: reduce los pasos de difusión de 50 a 8 manteniendo la calidad de generación según el autor.
- Atención dispersa adaptativa para reducir el coste computacional de la atención.
- Entrenamiento sin datos de vídeo (data-free) mediante destilación de trayectoria.
- Compatibilidad plug-and-play con las arquitecturas base sin modificarlas.
- Soporte de pesos LoRA para carga sobre los modelos base.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- Generación rápida de vídeo para prototipado creativo: con solo 8 pasos de inferencia, el modelo permite iterar sobre prompts de texto y obtener clips de vídeo en una fracción del tiempo que requeriría el modelo base con 50 pasos, lo que resulta adecuado para estudios de diseño y agencias que necesitan explorar variaciones visuales con rapidez.
- Producción de contenido para redes sociales: la reducción de pasos y la atención dispersa disminuyen el coste por clip, haciendo viable la generación de vídeos cortos a partir de guiones de texto en flujos de trabajo de marketing digital.
- Investigación en eficiencia de modelos de difusión: el framework sirve como base reproducible para experimentar con destilación de pasos y atención dispersa, ya que el código y los pesos están publicados bajo Apache 2.0.
- Despliegue en GPUs de consumo: al requerir un mínimo de 24 GB de VRAM para inferencia, BLADE puede ejecutarse en una RTX 4090, lo que permite a desarrolladores individuales generar vídeo en hardware de gama alta para consumo.
- Integración en pipelines de generación de vídeo existentes: al ser pesos LoRA plug-and-play, se puede añadir a un flujo que ya use CogVideoX o WanX sin reentrenar el modelo base, reduciendo el tiempo de inferencia en producción.
- Generación de vídeo en entornos con restricciones de cómputo: la combinación de atención dispersa y destilación permite ejecutar generación de vídeo en configuraciones de una sola GPU donde el modelo base con 50 pasos sería inviable por latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica cualitativamente que se mantiene la calidad de generación con 8 pasos frente a los 50 del modelo base, sin cifras concretas de FVD, CLIP score ni comparativas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: mínimo 24 GB según la model card.
- VRAM estimada para entrenamiento: mínimo 80 GB por GPU (configuración recomendada de 8 GPUs).
- GPUs recomendadas: A100 de 80 GB para entrenamiento; para inferencia, GPUs con al menos 24 GB, como RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) para inferencia; no para entrenamiento.
- Opciones de despliegue: scripts de inferencia propios del repositorio (`train/inference.py`) con soporte para `--lora_path` y selección de GPU; requiere compilar la librería Block-Sparse-Attention de MIT-Han-Lab.
- Latencia y throughput estimados: no disponible numéricamente; el autor afirma una aceleración significativa al pasar de 50 a 8 pasos.
- Requisitos de software: Python >= 3.11, CUDA >= 11.6.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BLADE (sobre CogVideoX-5B) | 5B + LoRA | no disponible | Difusión con atención dispersa y destilación a 8 pasos | Apache 2.0 | Hugging Face (GYP666/BLADE) |
| CogVideoX-5B | 5B | no disponible | Difusión de vídeo texto-a-vídeo, 50 pasos | no disponible en la informacion | Hugging Face (zai-org/CogVideoX-5b) |
| Wan2.1-T2V-1.3B | 1.3B | no disponible | Difusión de vídeo texto-a-vídeo | no disponible en la informacion | Hugging Face (Wan-AI/Wan2.1-T2V-1.3B-Diffusers) |

No se dispone de datos de benchmarks para comparar rendimiento numérico entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar y cargar los pesos base de CogVideoX-5B o Wan2.1-T2V-1.3B, lo que añade dependencias y consumo de almacenamiento.
- Requiere compilar una librería externa (Block-Sparse-Attention) para funcionar, lo que puede complicar el despliegue en entornos no controlados.
- La VRAM mínima de 24 GB para inferencia excluye GPUs de consumo de gama media y baja.
- No se documentan idiomas soportados; la generación depende de los embeddings de texto de los modelos base, por lo que el multilingüismo no está garantizado.
- No hay resultados de benchmarks publicados que permitan verificar cuantitativamente la afirmación de mantener la calidad con 8 pasos.
- Riesgo de alucinación visual inherente a los modelos de difusión: puede generar contenido incoherente o no fiel al prompt.
- Sesgos: no documentados en la model card; al heredar los pesos base, podría reproducir sesgos de CogVideoX o WanX.
- Licencia Apache 2.0 permite uso comercial, pero las licencias de los modelos base deben verificarse por separado.
- El repositorio tiene 0 descargas y 6 likes, lo que indica una adopción muy limitada y poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/GYP666/BLADE
- Paper (arXiv): https://arxiv.org/abs/2508.10774
- Homepage del proyecto: http://ziplab.co/BLADE-Homepage/
- Repositorio de código: https://github.com/Tacossp/BLADE
- Modelo base CogVideoX-5B: https://huggingface.co/zai-org/CogVideoX-5b
- Modelo base Wan2.1-T2V-1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- Librería Block-Sparse-Attention: https://github.com/mit-han-lab/Block-Sparse-Attention
