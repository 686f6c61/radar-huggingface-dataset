# fastforks/eva02

## Resumen

EVA-02 es un modelo de visión por transformer (ViT) desarrollado por Yuxin Fang y colaboradores (Fang et al. 2023) para clasificación de imágenes. La variante empaquetada en este repositorio, `eva02_large_patch14_448.mim_m38m_ft_in22k_in1k`, es un ViT-Large con parches de 14x14 y resolución de entrada fija de 448x448, preentrenado con enmascaramiento de modelado de imágenes (MIM) sobre el corpus Merged-38M y afinado posteriormente sobre ImageNet-1k. Su relevancia radica en que combina innovaciones arquitectónicas como SwiGLU y embeddings posicionales rotatorios (RoPE) dentro de un ViT, lo que le permite competir con los mejores clasificadores de ImageNet de su generación.

El repositorio `fastforks/eva02` no contiene pesos: es una model card que actúa como manifiesto de descarga. La librería `fastforks` descarga los pesos originales del repositorio de `timm` y los verifica contra un SHA-256 registrado. Ofrece dos backends de ejecución: `portable` (PyTorch puro) y `kernels` (kernels CUDA propios), con mejoras de velocidad documentadas de hasta 2,3x frente al código original en fp32.

La licencia del modelo es MIT y el uso comercial está permitido según la evidencia registrada en la propia model card. Está pensado exclusivamente para clasificación de imágenes en una única imagen RGB de 448x448, con salida de logits sobre las 1.000 clases de ImageNet-1k.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (vision transformer) con SwiGLU y embeddings posicionales rotatorios (RoPE), preentrenado con MIM |
| Parametros totales | no disponible (variante ViT-Large; el numero exacto no se indica en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de una imagen de 448x448) |
| Tipos de cuantizacion | fp32 (original), fp16 (por defecto en GPU); no se documentan otras |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las etiquetas son las clases de ImageNet-1k en ingles) |
| Licencia | MIT (pesos); codigo original Apache-2.0 |
| Formato de pesos | safetensors (pesos alojados en el repositorio de `timm`) |

## Arquitectura y entrenamiento

EVA-02 es un transformer de visión con parches de 14x14. La innovacion principal frente a un ViT clasico es la incorporacion de SwiGLU en las capas feed-forward y de embeddings posicionales rotatorios (RoPE) en lugar de embeddings posicionales absolutos, lo que mejora la capacidad de representacion y la transferencia a resoluciones distintas. El preentrenamiento se realiza con modelado de imagenes enmascaradas (MIM) sobre Merged-38M, una mezcla que incluye ImageNet-22k, CC12M, CC3M, COCO, ADE20K, Objects365 y OpenImages. Posteriormente el modelo se afina sobre ImageNet-22k y finalmente sobre ImageNet-1k (ILSVRC 2012).

La variante empaquetada en este repositorio corresponde al checkpoint `mim_m38m_ft_in22k_in1k`, es decir, preentrenado con MIM sobre Merged-38M, afinado en ImageNet-22k y afinado en ImageNet-1k. La entrada es fija: la imagen se redimensiona por el lado corto a 448 y se recorta centralmente a 448x448. El repositorio de `fastforks` no reimplementa el entrenamiento, sino la inferencia: verifica la paridad numerica contra las salidas doradas del codigo original (diferencia maxima absoluta <= 0,002 en CPU float32; error medio <= 0,02 px y p99 <= 0,08 px en GPU float16).

## Capacidades

- Clasificacion de imagenes en las 1.000 clases de ImageNet-1k, con salida de logits.
- Extraccion de caracteristicas visuales de alta calidad gracias al preentrenamiento MIM a gran escala.
- Inferencia en GPU (CUDA) y CPU; el backend `portable` usa PyTorch y el backend `kernels` usa kernels CUDA propios (`cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`).
- Verificacion de integridad de pesos mediante SHA-256 antes de la ejecucion.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un clasificador de imagenes puro.
- No tiene capacidades multilingues en el sentido de un LLM; las etiquetas de salida son las clases de ImageNet-1k.
- No dispone de modo thinking, vision generativa, audio ni otras modalidades.

## Casos de uso

- Moderacion de contenido visual: clasificar imagenes subidas por usuarios en categorias de ImageNet para filtrar contenido no deseado antes de su publicacion, aprovechando la resolucion de 448x448 que captura detalles finos.
- Etiquetado automatico de catalogos de producto: asignar categorias a imagenes de inventario (prendas, electrodomesticos, alimentos) usando los logits de ImageNet-1k como senal de clasificacion base, con un mapeo posterior a las categorias propias del negocio.
- Preprocesamiento para pipelines de vision: usar el modelo como extractor de caracteristicas congelado para alimentar clasificadores lineales o sistemas de recuperacion de imagenes por similitud.
- Investigacion en vision por computador: servir como baseline reproducible para experimentos de clasificacion, con paridad numerica verificada frente al codigo original y pesos con hash comprobado.
- Control de calidad en manufactura: clasificar imagenes de piezas o productos en categorias visuales predefinidas para detectar defectos o anomalias, siempre que las clases se alineen con las de ImageNet o se reentrene la cabeza de clasificacion.
- Filtrado de datasets: clasificar grandes volumenes de imagenes para depurar conjuntos de entrenamiento, descartando ejemplos de clases no deseadas antes de un entrenamiento posterior.
- Demos y prototipado rapido: integrar un clasificador de imagenes en una aplicacion con `pip install fastforks` y una llamada a `classification.load(...)`, con seleccion automatica de backend (`mode="auto"`).

## Benchmarks y rendimiento

La model card no publica resultados de precision sobre ImageNet-1k (top-1/top-5). Solo documenta rendimiento de inferencia y paridad numerica con el codigo original.

| Metrica | Original fp32 | Original (fp16) | Portable | Kernels |
|---|---|---|---|---|
| Tiempo por imagen, 224x224 (ms) | 83,71 | 32,13 | 18,01 | 14,15 |
| Aceleracion vs original fp32 | 1,0x | 2,6x | 4,6x | 5,9x |
| Memoria pico asignada (MiB) | 1.819 | no disponible | 648 | 1.233 |
| Memoria pico reservada (MiB) | 1.864 | no disponible | 1.206 | 1.430 |
| Carga del modelo (s) | 6,98 | no disponible | 2,80 | 1,80 |
| Primera llamada (s) | 0,39 | no disponible | 0,02 | 0,02 |

Medido en una RTX 5060 Ti de 16 GB (sm_120). En entrada de 448x448 con backend portable en fp16, el pico asignado es de 0,7 GiB y el reservado de 0,8 GiB. No se han publicado resultados de benchmarks de precision (top-1/top-5 en ImageNet) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,7 GiB asignados y 0,8 GiB reservados para inferencia a 448x448 en fp16 con backend `portable` en una RTX 5060 Ti de 16 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA reciente; el backend `kernels` requiere un kernel precompilado para la arquitectura de la GPU (se descarga de `fastforks/kernels` en el primer uso) y un driver NVIDIA reciente.
- Cabe holgadamente en GPUs de consumo: se ha probado en una RTX 5060 Ti de 16 GB; por el bajo consumo de memoria es previsible que quepa en GPUs de 8 GB o menos, aunque no se documenta explicitamente.
- Opciones de despliegue: libreria `fastforks` (`pip install fastforks`) con backends `portable` (PyTorch) y `kernels` (CUDA). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imagenes.
- Latencia y throughput: 18,0 ms por imagen a 224x224 con backend `portable` y 14,0 ms con `kernels` en RTX 5060 Ti; a 448x448 no se publica el tiempo exacto, solo el consumo de memoria.
- Si el backend `kernels` no encuentra un kernel para la arquitectura de la GPU, lanza `BackendUnavailableError` con el motivo y no recurre silenciosamente al backend `portable`.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros modelos comparables (por ejemplo, ViT-Large/16 de Google, DeiT III o ConvNeXt) para establecer una comparativa con parametros, contexto y rendimiento. La model card solo referencia la variante `eva02_large_patch14_448.mim_m38m_ft_in22k_in1k` del propio EVA-02.

| Modelo | Parametros | Resolucion de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| EVA-02 Large (esta ficha) | no disponible (ViT-Large) | 448x448 fija | MIT (pesos) | pesos en `timm`, empaquetado en `fastforks` |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un clasificador cerrado: solo produce logits sobre las 1.000 clases de ImageNet-1k; no genera texto ni responde a instrucciones.
- Entrada fija de 448x448: la imagen se redimensiona por el lado corto y se recorta centralmente, lo que puede perder informacion en imagenes con relaciones de aspecto muy distintas.
- Riesgo de sesgo: al estar entrenado sobre ImageNet y Merged-38M, hereda los sesgos de esas fuentes (representacion desigual de clases, sesgos geograficos y culturales).
- Riesgo de clasificacion erronea fuera de la distribucion de ImageNet: objetos, estilos o dominios no representados pueden recibir etiquetas incorrectas con alta confianza.
- No se documentan resultados de precision (top-1/top-5) en la informacion disponible, por lo que no es posible verificar su rendimiento absoluto sin evaluarlo.
- El backend `kernels` depende de kernels precompilados por arquitectura de GPU y de un driver NVIDIA reciente; en arquitecturas no soportadas falla explicitamente.
- La licencia MIT figura para los pesos y el uso comercial esta marcado como permitido, pero la model card advierte que el paquete es de uso de investigacion y que deben revisarse las cadenas de licencia registradas antes de cualquier otro uso.
- El repositorio no aloja pesos: la disponibilidad depende de que los enlaces del autor en `timm` sigan accesibles y de que el SHA-256 coincida.
- No hay soporte multilingue ni de otras modalidades; las etiquetas de salida estan en ingles.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/fastforks/eva02
- Repositorio de codigo de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend CUDA: https://huggingface.co/fastforks/kernels
- Pesos originales (timm): https://huggingface.co/timm/eva02_large_patch14_448.mim_m38m_ft_in22k_in1k
- Codigo original (pytorch-image-models, commit `0df212b369a5`): https://github.com/huggingface/pytorch-image-models
- Manifiesto de variantes y hashes (`card.toml`): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/eva02/card.toml
- Documentacion de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Evidencia de licencia (README de timm): https://huggingface.co/timm/eva02_large_patch14_448.mim_m38m_ft_in22k_in1k/blob/fae13da496eea422cb162dfdb693dc125b68f04d/README.md
