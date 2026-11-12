# moonbox-ai/efficientvit-MLX

## Resumen

EfficientViT-SAM MLX es una conversión a MLX del modelo EfficientViT-SAM L2, un sistema de segmentación de imágenes que combina el codificador de imagen EfficientViT-L2 (a 512 px) con el codificador de prompts y el decodificador de máscaras de SAM (Segment Anything Model). Lo publica el usuario moonbox-ai como una adaptación para Apple Silicon, empaquetando los pesos en formato safetensors y un script `mlx_model.py` que reproduce la interfaz de `EfficientViTSamPredictor`. El modelo original procede del MIT HAN Lab y se distribuye bajo licencia Apache 2.0.

El problema que resuelve es la segmentación de imágenes guiada por prompts (puntos o cajas) con un coste computacional muy inferior al de SAM original, gracias al codificador EfficientViT. La conversión a MLX permite ejecutarlo de forma nativa en Macs con chip Apple Silicon sin depender de PyTorch. El repositorio ocupa 0,2 GB y contiene dos precisiones, fp16 y bf16, ambas de 122,7 MB.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa ligera a SAM para tareas de generación de máscaras; por otro, advierte de una limitación crítica del port, que el propio autor reconoce. El modelo necesita aritmética en float32: treinta de sus convoluciones 1x1 van seguidas de BatchNorm con varianzas de hasta 5,5e-7, de modo que las versiones de 16 bits no alcanzan el umbral de fidelidad respecto al original (IoU medio de 0,942 en fp16 y 0,714 en bf16). No existen carpetas cuantizadas a 8, 6 o 4 bits porque, según el autor, el modelo no produce máscaras utilizables en esos formatos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientViT-L2 (codificador de imagen) + codificador de prompts y decodificador de máscaras de SAM |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen a 512 px) |
| Tipos de cuantización | fp16 y bf16 (no hay 8, 6 ni 4 bits; el autor indica que cuantizado no da máscaras usables) |
| Idiomas soportados | no disponible (modelo de segmentación de imágenes, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `config.json` y `mlx_model.py` |

## Arquitectura y entrenamiento

El modelo es un pipeline de segmentación compuesto por dos bloques. El primero es el codificador de imagen EfficientViT-L2, que procesa la imagen de entrada a 512 px y genera un mapa de características. El segundo es el codificador de prompts y el decodificador de máscaras heredados de SAM, que reciben puntos o cajas y producen máscaras de segmentación con sus puntuaciones. La innovación principal del modelo original es sustituir el codificador ViT pesado de SAM por EfficientViT, mucho más ligero, manteniendo la calidad de segmentación.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, algo esperable en un modelo de visión. El port a MLX se generó cargando los pesos originales de EfficientViT-SAM (revisión `de7d7733cc`) y almacenándolos en bf16 o fp16. El autor señala que el port es exacto en float32: con `MLX_ENABLE_TF32=0` coincide con PyTorch hasta un IoU de máscara de 0,9996. La limitación aparece al bajar a 16 bits, porque las convoluciones 1x1 seguidas de BatchNorm con varianzas muy pequeñas necesitan precisión de float32 para conservar la señal.

## Capacidades

- Segmentación de imágenes guiada por prompts: acepta puntos con etiqueta positiva o negativa y devuelve máscaras, puntuaciones, máscaras de baja resolución y logits.
- Generación de múltiples máscaras por prompt (`multimask=True`), con selección posterior según la puntuación.
- Extracción de embeddings de imagen reutilizables (`embed`), de modo que varias consultas sobre la misma imagen no recalculan el codificador.
- Ejecución nativa en Apple Silicon mediante MLX, con dependencias mínimas: solo `mlx`, `numpy` y `pillow`.
- No soporta tool calling, agentes, razonamiento multi-step ni procesamiento de lenguaje, por tratarse de un modelo de visión.
- No dispone de modo thinking, visión generativa ni audio.

## Casos de uso

- Segmentación interactiva en aplicaciones de edición de imágenes: el usuario hace clic en un objeto y el modelo devuelve la máscara correspondiente; el coste de unos 55 ms por imagen en un Apple M5 permite una respuesta casi inmediata.
- Herramientas de anotación de datasets: generar máscaras iniciales para que un anotador humano las refine, reduciendo el tiempo de etiquetado en tareas de visión por computador.
- Recorte automático de sujetos para fondos o catálogos: dada una caja o un punto sobre el producto, obtener la máscara del objeto para sustituir el fondo.
- Preprocesado en pipelines de visión: separar regiones de interés antes de pasarlas a un clasificador o detector, aprovechando la reutilización de embeddings para varias consultas sobre la misma imagen.
- Prototipado en local en equipos Mac: validar ideas de segmentación sin GPU dedicada ni dependencias de PyTorch, gracias a la instalación ligera de MLX.
- Segmentación de imágenes médicas o científicas en entornos de investigación: obtener máscaras de estructuras a partir de puntos de referencia, siempre que la precisión requerida tolere la degradación del port en 16 bits.
- Automatización de tareas de recorte en lote: procesar lotes de imágenes con el codificador EfficientViT-L2 y aplicar prompts predefinidos, midiendo el rendimiento en el hardware objetivo.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, etc.), pero sí mediciones de fidelidad del port frente al modelo original en PyTorch, expresadas como IoU de máscara:

| Precisión | Tamaño | IoU medio vs PyTorch fp32 | Peor caso | Estado |
|---|---|---|---|---|
| fp16 | 122,7 MB | 0,942 | 0,611 | Por debajo del umbral (0,95), experimental |
| bf16 | 122,7 MB | 0,714 | 0,091 | Por debajo del umbral, experimental |
| fp16 cargado y convertido a float32 | 122,7 MB | 0,966 | 0,62 | Sigue por debajo del original en float32 |
| Port en float32 con `MLX_ENABLE_TF32=0` | no aplica | 0,9996 | 0,997 | Coincide con PyTorch |

El autor indica un tiempo de aproximadamente 55 ms por imagen (codificador más dos prompts) en un Apple M5.

## Requisitos de hardware

- VRAM: al tratarse de un modelo de 122,7 MB por carpeta, la memoria necesaria es muy reducida; la cifra exacta de memoria unificada consumida no está disponible.
- GPU recomendadas: Apple Silicon (el autor midió en un Apple M5); no se documenta soporte para GPU NVIDIA, ya que MLX está orientado a chips de Apple.
- Cabe en cualquier Mac con Apple Silicon; no se especifican modelos concretos mínimos.
- Despliegue: MLX con el script `mlx_model.py` incluido; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia: unos 55 ms por imagen (codificador más dos prompts) en un Apple M5; el throughput para lotes no está disponible.
- Para obtener la máxima fidelidad hay que ejecutar en float32 con `MLX_ENABLE_TF32=0` y convertir los parámetros con `model.update(mlx.utils.tree_map(lambda a: a.astype(mx.float32), model.parameters()))`.

## Comparativa con modelos similares

| Modelo | Tipo | Codificador | Precisión del port | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientViT-SAM MLX (este) | Segmentación con prompts | EfficientViT-L2 a 512 px | fp16/bf16 experimentales; float32 exacto | Apache 2.0 | Hugging Face, MLX |
| EfficientViT-SAM original (MIT HAN Lab) | Segmentación con prompts | EfficientViT-L2 a 512 px | PyTorch fp32 de referencia | Apache 2.0 | GitHub, PyTorch |
| SAM original (Meta) | Segmentación con prompts | ViT pesado | No disponible en esta información | No disponible en esta información | No disponible en esta información |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Las carpetas fp16 y bf16 son experimentales y no alcanzan el umbral de fidelidad de 0,95 de IoU medio respecto al original; bf16 es especialmente deficiente, con un peor caso de 0,091.
- El modelo necesita float32 para funcionar correctamente; las convoluciones 1x1 seguidas de BatchNorm con varianzas de hasta 5,5e-7 pierden señal en 16 bits.
- No hay versiones cuantizadas a 8, 6 o 4 bits: el autor indica que cuantizado no produce máscaras utilizables.
- Incluso cargando los pesos fp16 y convirtiéndolos a float32 se obtiene 0,966 de IoU medio, por debajo del original en float32.
- Es un modelo de visión: no procesa lenguaje, no soporta tool calling ni agentes, y no tiene capacidades multilingües.
- Riesgo de sesgos y alucinaciones: no se documentan sesgos específicos; como todo modelo de segmentación, puede producir máscaras incorrectas en imágenes fuera de su distribución.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los archivos son una obra derivada del modelo original y heredan su licencia, que rige su uso.
- El código original de EfficientViT ya no se mantiene desde septiembre de 2025; las actualizaciones se trasladan a DC-Gen.
- No se especifican requisitos mínimos de hardware ni límites de tamaño de imagen más allá de la entrada a 512 px.

## Enlaces

- Hugging Face: https://huggingface.co/moonbox-ai/efficientvit-MLX
- Repositorio original EfficientViT (MIT HAN Lab): https://github.com/mit-han-lab/efficientvit
- Proyecto DC-Gen (sucesor del mantenimiento): https://github.com/dc-ai-projects/DC-Gen
- Paper EfficientViT-SAM: https://arxiv.org/abs/2402.05008
- Paper EfficientViT: https://arxiv.org/abs/2205.14756
- Paper DC-AE: https://arxiv.org/abs/2410.10733
- Paper relacionado (arXiv:2405.10300): https://arxiv.org/abs/2405.10300
- Documentación DC-AE-SANA 1.1: https://github.com/mit-han-lab/efficientvit/blob/master/assets/docs/dc_ae_sana_1.1.md
- Colección DC-AE en Hugging Face: https://huggingface.co/collections/mit-han-lab/dc-ae-diffusion-670dbb8d6b6914cf24c1a49d
