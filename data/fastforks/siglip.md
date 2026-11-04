# fastforks/siglip

## Resumen

SigLIP (fine-tuned) es un modelo de clasificación de imágenes publicado por el usuario fastforks en HuggingFace. En concreto, se trata de una adaptación del torre de visión SigLIP So400m/14 (Zhai et al. 2023), afinada sobre ImageNet-1k con una cabeza de atención con pooling (attention-pool head). El modelo recibe una única imagen RGB y devuelve los logits de las 1.000 clases de ImageNet-1k. Su relevancia no está en el modelo en sí, sino en el envoltorio: fastforks no aloja pesos, sino que descarga los pesos originales del repositorio de `timm` y los verifica contra un SHA-256 registrado en la model card.

El repositorio es, por tanto, una model card sin pesos: actúa como manifiesto reproducible que enlaza los pesos del autor original (`timm/vit_so400m_patch14_siglip_378.webli_ft_in1k`), fija un commit concreto y ofrece dos backends de ejecución (`portable` en PyTorch y `kernels` con kernels CUDA propios). La arquitectura subyacente es un Vision Transformer con parches de 14x14 y resolución fija de 378x378, con aproximadamente 400 millones de parámetros en la torre de visión.

El interés práctico para desarrolladores e investigadores es doble: por un lado, permite ejecutar un clasificador ImageNet-1k de referencia con verificación de integridad de pesos; por otro, documenta con detalle el rendimiento comparado entre la implementación original de `timm`, el backend portable y los kernels CUDA optimizados, con métricas de latencia, memoria y paridad numérica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (SigLIP So400m/14) con attention-pool head |
| Parametros totales | no disponible (torre So400m, ~400 M por nomenclatura) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 378x378) |
| Tipos de cuantizacion | fp32 (original), fp16 (portable y kernels); no se documentan otras |
| Idiomas soportados | no disponible (clasificación de imágenes, sin texto) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | safetensors (pesos del autor en `timm`) |

## Arquitectura y entrenamiento

El modelo subyacente es un Vision Transformer SigLIP So400m/14, es decir, un transformer de visión con tamaño de parche 14x14 y una torre de aproximadamente 400 millones de parámetros. La entrada es una imagen RGB redimensionada por el lado corto a 378 píxeles y recortada al centro a 378x378. Sobre la torre se añade una cabeza de clasificación con atención y pooling (attention-pool head), que agrega los tokens de salida antes de proyectar a las 1.000 clases de ImageNet-1k.

El entrenamiento original de SigLIP (Zhai et al. 2023) se realizó sobre WebLI, un conjunto de datos web de imagen-texto de Google que no está publicado. Posteriormente, el modelo fue afinado sobre ImageNet-1k (ILSVRC 2012) para la tarea de clasificación, dando lugar a la variante `vit_so400m_patch14_siglip_378.webli_ft_in1k` publicada en `timm`. No se dispone de información sobre el número exacto de tokens, la composición detallada del dataset de afinado ni sobre el uso de RLHF o DPO (no aplicables a un clasificador de imágenes).

La innovación técnica destacable no está en el modelo, sino en el envoltorio fastforks: verificación de integridad de pesos mediante SHA-256, dos backends de ejecución (portable en PyTorch y kernels CUDA propios: `cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`), y comprobación de paridad numérica contra las salidas doradas del código original. En CPU con float32 la diferencia máxima es de 0,002; en GPU con float16 (por defecto), la diferencia media es de 0,02 píxeles y el p99 de 0,08 píxeles.

## Capacidades

- Clasificación de imágenes en las 1.000 clases de ImageNet-1k, devolviendo logits por clase.
- Entrada de una única imagen RGB a resolución fija 378x378 (redimensionado por lado corto y recorte central).
- Salida estructurada con acceso a top-k (`result.top(5)`).
- Ejecución en dos backends: `portable` (PyTorch, GPU si hay, si no CPU) y `kernels` (kernels CUDA propios, requiere arquitectura de GPU soportada y driver NVIDIA reciente).
- Selección automática de backend con `mode="auto"`, que elige `kernels` cuando puede ejecutarse y registra la elección.
- Verificación de integridad de pesos contra SHA-256 antes de la ejecución.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de imágenes puro.
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Clasificación automática de imágenes en pipelines de datos: el modelo etiqueta imágenes con una de las 1.000 clases de ImageNet-1k, útil para triaje, indexado o filtrado previo en conjuntos de datos de gran tamaño, con una latencia de 13 ms por imagen en GPU consumer.
- Moderación y filtrado de contenido visual: como clasificador de referencia, permite descartar o etiquetar categorías concretas (por ejemplo, armas, animales, vehículos) en flujos de subida de imágenes, aprovechando la salida de logits para umbralizar por clase.
- Evaluación de pipelines de visión: sirve como baseline reproducible para comparar preprocesados, cuantizaciones o backends, ya que fastforks verifica paridad numérica contra el código original y documenta latencia y memoria.
- Docencia e investigación en visión por computador: el modelo permite estudiar el comportamiento de un ViT SigLIP afinado en ImageNet-1k con un envoltorio transparente y pesos verificados, sin necesidad de gestionar manualmente descargas y hashes.
- Prototipado rápido en entornos con GPU consumer: con 0,9 GiB de memoria pico asignada en fp16 a 378x378 en una RTX 5060 Ti de 16 GB, cabe en tarjetas de gama media y permite iterar localmente sin infraestructura dedicada.
- Benchmarking de kernels CUDA: los kernels propios (`fvm_conv`, `cudnn_hacc`, etc.) ofrecen una aceleración de 2,0x frente al código original en fp32 y de 1,0x frente al backend portable, lo que permite evaluar el impacto de kernels especializados en un ViT de 400 M de parámetros.
- Verificación de integridad en producción: el chequeo SHA-256 de los pesos permite garantizar que el modelo desplegado no ha sido alterado, adecuado para entornos con requisitos de reproducibilidad o auditoría.

## Benchmarks y rendimiento

Clasificación sintética a 224x224 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Aceleración kernels vs portable | Memoria pico original (MiB, asignada/reservada) | Portable (MiB) | Kernels (MiB) |
|---|---|---|---|---|---|---|---|---|---|
| `vit_so400m_patch14_siglip_378.webli_ft_in1k` | 76,86 | 25,81 | 13,13 | 12,94 | 2,0x | 1,0x | 2495 / 2564 | 879 / 1708 | 1216 / 1812 |

Carga y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `vit_so400m_patch14_siglip_378.webli_ft_in1k` | 7,52 | 7,29 | 3,57 | 0,35 | 0,07 | 0,01 |

Velocidad y memoria pico a tamaño fijo, todos los modos:

| Modelo | Modo | 224x224 (ms / MiB asignada / MiB reservada) |
|---|---|---|
| `vit_so400m_patch14_siglip_378.webli_ft_in1k` | portable | 13,1 ms / 901 / 1050 |
| `vit_so400m_patch14_siglip_378.webli_ft_in1k` | kernels | 12,9 ms / 1254 / 1446 |

Paridad con el código original: en CPU con float32, diferencia máxima absoluta <= 0,002; en GPU con float16 (por defecto), diferencia media <= 0,02 píxeles y p99 <= 0,08 píxeles.

No se han publicado resultados de benchmarks de precisión (top-1, top-5) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0,9 GiB de memoria pico asignada en fp16 a 378x378 con el backend portable; 1,0 GiB reservada. Con el backend kernels, 1,2 GiB asignada y 1,8 GiB reservada a 224x224.
- GPU recomendadas: RTX 5060 Ti 16 GB (probada y documentada, sm_120); cualquier GPU NVIDIA con soporte para los kernels precompilados del backend `kernels` y driver reciente. El backend portable funciona en cualquier GPU con PyTorch y fp16, y también en CPU.
- Cabe en GPU consumer: sí, con holgura. Con menos de 1 GiB de memoria pico en fp16, es viable en tarjetas de gama media y baja (por ejemplo, RTX 3060, RTX 4060) siempre que se use el backend portable.
- Opciones de despliegue: paquete `fastforks` (`pip install fastforks`), con `classification.load(...)` y modos `portable`, `kernels` y `auto`. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imágenes).
- Latencia y throughput: 13,1 ms por imagen a 224x224 con portable y 12,9 ms con kernels en RTX 5060 Ti; 25,81 ms con el código original en fp16. La primera llamada tarda 0,07 s (portable) y 0,01 s (kernels), frente a 0,35 s del original. La carga del modelo tarda 7,29 s (portable) y 3,57 s (kernels), frente a 7,52 s del original.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución de entrada | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| SigLIP So400m/14 fine-tuned (fastforks) | ~400 M (torre So400m) | 378x378 fija | no aplica | Apache-2.0 | safetensors (vía timm) | HuggingFace (fastforks y timm) |
| SigLIP So400m/14 original (timm, `vit_so400m_patch14_siglip_378.webli_ft_in1k`) | ~400 M | 378x378 fija | no aplica | Apache-2.0 | safetensors | HuggingFace (timm) |
| ViT-L/16 fine-tuned en ImageNet-1k (referencia típica de timm) | ~300 M | 224x224 o 384x384 | no aplica | Apache-2.0 (según variante) | safetensors | HuggingFace (timm) |

La comparación con alternativas se limita a variantes del mismo modelo o de la misma familia, ya que la información proporcionada no incluye datos de rendimiento (top-1/top-5) que permitan una comparación cuantitativa con otros clasificadores. No se dispone de resultados de benchmarks de precisión para este modelo en la información disponible.

## Limitaciones y advertencias

- El repositorio no aloja pesos: es solo una model card que enlaza a los pesos del autor original en `timm`. Si el repositorio de `timm` cambia o desaparece, el modelo deja de ser reproducible.
- El modelo solo clasifica en las 1.000 clases de ImageNet-1k; no es un modelo de propósito general ni admite prompts en lenguaje natural.
- Entrada de resolución fija 378x378: imágenes de otra relación de aspecto se redimensionan y recortan, lo que puede perder información en los bordes.
- Sesgos conocidos: el entrenamiento original usa WebLI (datos web de Google, no publicados) e ImageNet-1k, por lo que hereda los sesgos de esas fuentes (representación geográfica y demográfica desigual, etiquetas de ILSVRC con ambigüedades conocidas).
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en clases visualmente próximas o fuera de distribución.
- El backend `kernels` requiere una GPU con arquitectura soportada por los kernels precompilados y un driver NVIDIA reciente; si no hay kernel disponible, lanza `BackendUnavailableError` y no cae silenciosamente al backend portable.
- La licencia es Apache-2.0 tanto para el código como para los pesos según la evidencia enlazada, pero la model card indica que es un paquete de uso de investigación y recomienda revisar las cadenas de licencia originales antes de cualquier otro uso.
- Los datos de entrenamiento (WebLI) no están publicados, lo que limita la auditoría completa del modelo.
- No se documentan métricas de precisión (top-1/top-5) en la información disponible, por lo que no es posible validar el rendimiento de clasificación sin evaluarlo por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fastforks/siglip
- Pesos del autor original (timm): https://huggingface.co/timm/vit_so400m_patch14_siglip_378.webli_ft_in1k
- Repositorio de código fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original (pytorch-image-models, commit `0df212b369a5`): https://github.com/huggingface/pytorch-image-models
- Definición de variantes (`card.toml`): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/siglip/card.toml
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Evidencia de licencia (README de timm): https://huggingface.co/timm/vit_so400m_patch14_siglip_378.webli_ft_in1k/blob/efb07b5711bda4e3eb24630db9879e0832615ad4/README.md
