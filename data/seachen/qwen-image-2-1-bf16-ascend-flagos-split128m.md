# seachen/Qwen-Image-2.1-BF16-ascend-FlagOS-split128M

## Resumen

Qwen-Image-2.1 es un modelo unificado de generación de imágenes a partir de texto y de edición de imágenes desarrollado por el equipo Qwen (Alibaba). El repositorio analizado, `seachen/Qwen-Image-2.1-BF16-ascend-FlagOS-split128M`, es una redistribución de los pesos BF16 publicados por FlagRelease para el stack FlagOS, el conjunto de software de código abierto con el que BAAI adapta modelos a aceleradores de distintos fabricantes. El componente de generación visual del modelo tiene 7 000 millones de parámetros distribuidos en 32 capas DiT de flujo único (Single-Stream), y utiliza Qwen3-VL-8B como codificador de texto junto con un VAE propio.

La relevancia de esta publicación concreta no está en el modelo en sí, sino en la portabilidad: los pesos se ejecutan sobre NPU Ascend con el stack FlagOS (biblioteca de operadores FlagGems en Triton, plugin Torch-FL y compilador FlagTree), manteniendo la misma API de Diffusers que en NVIDIA y sin modificar el código de inferencia. El autor reporta una alineación de precisión frente al stack nativo de NVIDIA medida con ClipScore, lo que convierte este repositorio en material útil para evaluar la madurez del ecosistema Ascend en cargas de difusión.

El repositorio ocupa 33,1 GB, está licenciado bajo Apache-2.0, soporta indicaciones en chino e inglés y almacena los pesos en formato safetensors de Diffusers troceados en fragmentos de 128 MB, presumiblemente para facilitar su carga en plataformas con límites de tamaño de fichero. No registra descargas ni valoraciones, por lo que no cuenta con validación de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de flujo único, 32 capas; codificador de texto Qwen3-VL-8B y VAE propio |
| Parámetros totales | 7 000 M en el componente de generación visual (DiT); el codificador de texto Qwen3-VL-8B añade aproximadamente 8 000 M. El recuento agregado no está publicado en la información disponible |
| Parámetros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (única precisión publicada en este repositorio); no se incluyen pesos FP8 ni GGUF |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato Diffusers, fragmentados en bloques de 128 MB (repositorio de 33,1 GB) |
| Pipeline de Diffusers | QwenImage21Pipeline |
| Resolución de referencia | 1 024 x 1 024 |
| Pasos de muestreo de referencia | 40 (batch 1, semilla 42, true-cfg-scale 1,0) |
| Hardware de referencia | NPU Ascend con CANN 9.0, contenedor FlagOS sobre openEuler 22.03 (aarch64) |
| Fecha de creación del repositorio | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de difusión basada en transformer (DiT) con 32 capas de flujo único, una elección que reduce el número de bloques respecto a diseños de doble flujo y rebaja el coste de inferencia. La generación parte de ruido y se condiciona mediante un codificador de texto Qwen3-VL-8B, mientras que la decodificación a píxeles corre a cargo de un VAE específico del modelo. El resultado es un sistema unificado que cubre tanto la generación texto-a-imagen como la edición de imágenes dentro del mismo conjunto de pesos.

Esta publicación no entrena ningún modelo: redistribuye los pesos BF16 oficiales en un formato compatible con Diffusers y con el stack FlagOS. La adaptación a Ascend se apoya en FlagGems, una biblioteca de operadores implementada en Triton, integrada mediante el plugin Torch-FL, que redirige operadores seleccionados (GELU, atención eficiente con SDPA y GQA, `constant_pad_nd`, entre otros) al backend del acelerador y deja el resto en fallback. Según el autor, la precisión de inferencia está alineada con la implementación oficial en todas las plataformas soportadas. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de ajuste por preferencias (RLHF/DPO).

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) en chino e inglés.
- Edición de imágenes dentro del mismo pipeline unificado, según la documentación oficial del modelo.
- Ejecución sobre Diffusers mediante `QwenImage21Pipeline`, con la misma experiencia de uso que en NVIDIA y sin modificaciones de código.
- Ejecución sobre aceleradores Ascend a través del stack FlagOS (FlagGems, Torch-FL, FlagTree, FlagCX).
- Compatibilidad con el ecosistema de cuantización GGUF a través de implementaciones de terceros como stable-diffusion.cpp (no incluida en este repositorio).
- Tool calling / function calling: no aplica. Es un modelo de difusión, no un modelo de lenguaje con soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multimodales de entrada: la edición de imágenes implica entrada de imagen, pero no hay información disponible sobre otras modalidades (audio, vídeo).
- No se documentan en la información disponible modos especiales como thinking mode ni decodificación especulativa.

## Casos de uso

- Generación de imágenes en producción sobre infraestructura Ascend: el repositorio incluye una imagen de contenedor lista para desplegar y scripts de inferencia con parámetros preconfigurados, lo que permite arrancar un servicio de generación en minutos sin adaptar el código de Diffusers.
- Edición de imágenes por instrucciones: sustitución de objetos, retocado o modificación de escenas manteniendo la coherencia visual, aprovechando que generación y edición comparten arquitectura y pesos.
- Validación de portabilidad entre aceleradores: comparar los ClipScore del stack FlagOS/Ascend con los del stack nativo de NVIDIA (33,31 frente a 33,66 en T2I-100) permite cuantificar la pérdida de calidad al migrar una carga de difusión entre plataformas.
- Benchmarking de stacks de software para IA: el contenedor y los scripts de bench (`--steps 40 --height 1024 --width 1024 --warmup 2`) sirven como prueba de regresión reproducible para medir el rendimiento de bibliotecas de operadores en hardware no NVIDIA.
- Generación de material gráfico para marketing y comercio electrónico: producción de imágenes de producto o ilustraciones promocionales a 1 024 x 1 024 con indicaciones en chino, útil para catálogos dirigidos al mercado asiático.
- Aumento de datos sintéticos: generar variaciones visuales controladas por semilla para ampliar conjuntos de entrenamiento de clasificadores o detectores, con la ventaja de disponer de licencia Apache-2.0.
- Prototipado de interfaces creativas: integración vía Diffusers en aplicaciones de escritorio o web para pruebas de concepto con edición interactiva de imágenes.
- Investigación en cuantización y compresión: al publicarse en BF16 sin cuantizar y en fragmentos de 128 MB, el checkpoint es un punto de partida cómodo para estudiar el efecto de FP8, GGUF Q8 o Q4 sobre la calidad de generación.

## Benchmarks y rendimiento

| Métrica | Qwen-Image-2.1 (NVIDIA, stack nativo) | Qwen-Image-2.1 (Ascend, FlagOS) |
|---|---|---|
| T2I-100 (ClipScore) | 33,66 | 33,31 |
| Coco-Image (ClipScore) | 25,34 | 25,76 |

Los datos proceden de la model card del autor y comparan la implementación oficial sobre NVIDIA con la adaptación FlagOS sobre Ascend, no frente a otros modelos generativos. La diferencia entre ambos stacks es de 0,35 puntos en T2I-100 (a favor de NVIDIA) y de 0,42 puntos en Coco-Image (a favor de Ascend), diferencias dentro del ruido esperable en esta familia de métricas. No se han publicado resultados frente a otros modelos (FID, CLIPScore comparativo, GenEval u otros) en la información disponible.

## Requisitos de hardware

- Peso de los pesos: 33,1 GB en BF16, incluyendo DiT (unos 14 GB para 7 000 M de parámetros), codificador de texto Qwen3-VL-8B (unos 16 GB) y VAE.
- VRAM estimada para inferencia en BF16: en torno a 35-45 GB con batch 1 a 1 024 x 1 024, sumando pesos y activaciones. Es una estimación de ingeniería, no un dato publicado.
- GPU/NPU recomendadas: NPU Ascend 910C (plataforma de referencia del autor), A100 80 GB, H100 80 GB o H200. El ejemplo de despliegue reserva 128 GB de memoria compartida (`--shm-size=128g`).
- GPUs de consumo: no cabe en BF16 en tarjetas de 24 GB (RTX 4090, RTX 3090). Sería necesario `enable_sequential_cpu_offload` de Diffusers o recurrir a cuantizaciones GGUF Q8/Q4 mediante stable-diffusion.cpp, con la consiguiente penalización de latencia.
- Opciones de despliegue: Diffusers con `QwenImage21Pipeline`; contenedor FlagOS para Ascend (imagen `harbor.baai.ac.cn/flagrelease-public/qwen-image-2.1-ascend001-...-cann90-a64`, con CANN 9.0, Python 3.11 y sglang 0.5.17 en el entorno); stable-diffusion.cpp para pesos GGUF. vLLM y TGI no son aplicables a un modelo de difusión.
- Descarga de pesos: `modelscope download --model FlagRelease/Qwen-Image-2.1-BF16-ascend-FlagOS --local_dir /data/Qwen-Image-2.1`.
- Latencia y throughput: no disponibles. La configuración de referencia del bench usa 40 pasos de muestreo, batch 1, resolución 1 024 x 1 024, dos iteraciones de calentamiento y un mínimo de 60 segundos de ejecución.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-Image-2.1 (este repositorio) | 7 000 M en el componente visual + codificador Qwen3-VL-8B | DiT de flujo único, generación y edición | Apache-2.0 | HuggingFace, ModelScope y GitHub |
| FLUX.1-dev | 12 000 M | Transformer de flujo rectificado, generación y edición | FLUX.1-dev Non-Commercial License (uso comercial restringido) | HuggingFace |
| Stable Diffusion 3.5 Large | 8 000 M | MMDiT, generación de imágenes | Stability AI Community License (gratuita por debajo de un umbral de ingresos) | HuggingFace |

Los datos de los modelos alternativos proceden de su documentación pública y no se han verificado en esta ficha; los campos de contexto, benchmarks y cuantizaciones disponibles no se incluyen por no estar contrastados. La ventaja diferencial de Qwen-Image-2.1 en esta comparativa es la combinación de licencia Apache-2.0 sin restricciones comerciales y soporte de indicaciones en chino, además de la vía de despliegue sobre aceleradores no NVIDIA que aporta el stack FlagOS.

## Limitaciones y advertencias

- Repositorio espejo de un tercero: el autor es `seachen`, no el equipo Qwen ni FlagRelease. No tiene descargas ni valoraciones, por lo que carece de validación de la comunidad y conviene verificar la integridad de los pesos frente al repositorio original `FlagRelease/Qwen-Image-2.1-BF16-ascend-FlagOS`.
- El sufijo `split128M` indica que los safetensors están troceados en fragmentos de 128 MB. Es una fragmentación no oficial que puede requerir lógica de carga específica; se recomienda contrastarla con el checkpoint original.
- La model card incluye una sección de integración con AnythingLLM que parece una plantilla genérica y no describe el uso real de un modelo de difusión. No debe tomarse como guía de despliegue.
- Idiomas limitados a chino e inglés: no hay soporte documentado para castellano ni para otras lenguas, lo que puede degradar los resultados con indicaciones en español.
- Riesgo de alucinación visual inherente a los modelos de difusión: fidelidad limitada en el renderizado de texto dentro de la imagen, composición de manos y anatomía, y posible desviación respecto a indicaciones complejas. No hay datos publicados específicos para esta versión.
- Sesgos: no se documenta la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos demográficos, culturales o de representación.
- Dependencia de plataforma: el rendimiento alineado con NVIDIA se ha medido únicamente sobre el stack FlagOS/Ascend. En otras plataformas el comportamiento puede diferir.
- Licencia Apache-2.0: permite uso comercial y modificación, pero no cubre posibles reclamaciones de terceros sobre los datos de entrenamiento del modelo base, desarrollado por Alibaba.
- No hay resultados de benchmarks frente a modelos competidores, por lo que no es posible posicionar su calidad relativa con datos objetivos.
- La redistribución no incluye garantías de mantenimiento ni actualizaciones por parte del autor del repositorio.

## Enlaces

- Repositorio analizado: https://huggingface.co/seachen/Qwen-Image-2.1-BF16-ascend-FlagOS-split128M
- Repositorio original de la adaptación FlagOS: https://huggingface.co/FlagRelease/Qwen-Image-2.1-BF16-ascend-FlagOS
- Modelo base oficial: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio de código oficial: https://github.com/QwenLM/Qwen-Image-2.1
- Documentación de Qwen Image 2.1 en stable-diffusion.cpp (soporte GGUF): https://github.com/leejet/stable-diffusion.cpp/blob/master/docs/qwen_image_2.1.md
- Ficha en Civitai: https://civitai.com/models/2953241/qwenimage21
- AnythingLLM (mencionado en la model card): https://anythingllm.com/
- Triton, lenguaje en el que se implementa FlagGems: https://github.com/openai/triton
- Imagen de contenedor para Ascend: `harbor.baai.ac.cn/flagrelease-public/qwen-image-2.1-ascend001-gems5.4.0-tree0.6.2-cxnone-pluginnone-vllmnone-sglang0.5.17-sglangflnone-cp311-ptnpunone-cann90-a64-none:202609200803`
- Descarga de pesos vía ModelScope: `modelscope download --model FlagRelease/Qwen-Image-2.1-BF16-ascend-FlagOS`
