# FlagRelease/Qwen3.8-27B-BF16-nvidia-FlagOS

## Resumen

Qwen3.8-27B es un modelo de lenguaje y visión (vision-language model) de 27.781 millones de parámetros desarrollado por Alibaba y publicado con licencia Apache 2.0. La ficha que nos ocupa, `FlagRelease/Qwen3.8-27B-BF16-nvidia-FlagOS`, no es el modelo original, sino una adaptación del mismo realizada por la comunidad Zhongzhi (众智) FlagOS sobre su stack tecnológico unificado de código abierto, con verificación de despliegue específica para GPUs NVIDIA en precisión BF16.

El interés de esta publicación radica en que documenta la adaptación multi-chip del modelo: según la model card, se ha completado la alineación de precisión y la verificación de despliegue en 11 aceleradores de IA distintos (T-Head, NVIDIA, Moore Threads, MetaX, Kunlunxin, Ascend, Hygon, Iluvatar CoreX, Tsingmicro, Enflame y Sunrise), con soporte FP8 en NVIDIA y Moore Threads y BF16 en el resto. Además, FlagOS extiende la adaptación a plataformas ARM de borde mediante una variante de bajo bit W4A8.

El repositorio ocupa 55,6 GB, contiene pesos en formato safetensors y está etiquetado con el identificador de arquitectura `qwen3_5`. Los idiomas declarados son chino (zh) e inglés (en). La información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada, por lo que buena parte de las secciones siguientes se completan con "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta de Hugging Face: `qwen3_5`); detalles internos no disponibles |
| Parámetros totales | 27.781.427.952 (≈27,8 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 102.400 tokens (valor de `--max-model-len` en el script de despliegue de la model card) |
| Tipos de cuantización | BF16 (pesos de este repo); FP8 soportado en el despliegue NVIDIA y Moore Threads; W4A8 en la variante ARM de borde |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modalidad | texto e imagen (vision-language); hasta 16 imágenes por prompt según `--limit-mm-per-prompt` |
| Motor de inferencia verificado | vLLM 0.24.0 con plugin FlagOS (`VLLM_PLUGINS=fl`) |
| Tamaño del repositorio | 55,6 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` del repositorio y su naturaleza de modelo vision-language. No se especifican el número de capas, la dimensión oculta, el tipo de atención, la composición del dataset de entrenamiento ni si se aplicaron etapas de RLHF o DPO. Tampoco se publica el número de tokens de entrenamiento.

Lo que sí documenta la model card es la capa de adaptación de FlagOS: un stack unificado que permite ejecutar el modelo sobre 11 familias de aceleradores distintos, con alineación de precisión verificada frente al stack nativo de NVIDIA. El despliegue de referencia utiliza vLLM con el plugin `fl`, variables de entorno como `USE_FLAGGEMS=1` y `VLLM_FL_PREFER=flagos`, y una lista de exclusión de operadores (`VLLM_FL_FLAGOS_BLACKLIST`) que fuerza a usar implementaciones del proveedor en operaciones como `index_put_`, `nonzero`, `copy_`, `index` y `mm`, presumiblemente por problemas de compatibilidad o rendimiento en esas rutas. La imagen de contenedor incluye CUDA 12.9, PyTorch 2.11 y driver 580.126.20.

## Capacidades

- Generación de texto y razonamiento en chino e inglés.
- Procesamiento de imágenes: el servidor de referencia se arranca con `--limit-mm-per-prompt "{\"image\":16}"`, lo que confirma soporte de entrada multimodal con hasta 16 imágenes por petición.
- Comprensión de documentos visuales y razonamiento multimodal (implícito en la categoría vision-language, sin detalles publicados sobre tareas concretas).
- Servicio compatible con la API de vLLM (`/health`, endpoint OpenAI-style en el puerto configurado), lo que habilita integración con clientes estándar.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Capacidades de audio: no disponible; no se mencionan.

## Casos de uso

- Análisis de documentos escaneados y capturas: el modelo acepta hasta 16 imágenes por prompt, lo que permite enviar un lote de páginas de un PDF rasterizado en una sola petición y obtener una extracción estructurada en chino o inglés.
- Asistencia sobre interfaces gráficas: con entrada de imagen y contexto de 102.400 tokens, se puede alimentar una secuencia de capturas de pantalla junto con el historial de acciones para tareas de automatización o soporte.
- Procesamiento de documentación técnica bilingüe: el soporte declarado de chino e inglés encaja en flujos de traducción y resumen de manuales, contratos o documentación de producto entre ambos idiomas.
- Despliegue en infraestructura no NVIDIA: la adaptación de FlagOS cubre Ascend, Kunlunxin, Hygon, MetaX, Moore Threads y otras siete plataformas, lo que permite servir el modelo en entornos con requisitos de soberanía tecnológica o donde el hardware NVIDIA no está disponible.
- Inferencia en el borde: la variante W4A8 para plataformas ARM permite ejecutar el modelo en dispositivos de borde con presupuesto de memoria reducido, según la model card.
- Servicio de inferencia estándar vía vLLM: el contenedor preconfigurado (`harbor.baai.ac.cn/flagrelease-public/...`) arranca un servidor con `--max-num-seqs 64` y `--max-num-batched-tokens 16384`, adecuado para cargas de chat concurrentes de baja o media intensidad.
- Validación de paridad numérica entre stacks: los resultados de GPQA_Diamond y muSR publicados permiten usar esta build como referencia para comparar implementaciones propias frente al stack nativo.

## Benchmarks y rendimiento

La model card publica dos métricas comparando el stack nativo de NVIDIA con la build FlagOS:

| Métrica | Qwen3.8-27B-Nvidia-Origin | Qwen3.8-27B-Nvidia-FlagOS |
|---|---|---|
| musr_murder_mysteries | 76,8 | 76,8 |
| GPQA_Diamond | 90,4 | 92,42 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks multimodales (MMMU, DocVQA, etc.). Tampoco se publican métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada en BF16: los 27.781 millones de parámetros a 2 bytes por parámetro suponen aproximadamente 55,6 GB solo de pesos, coherente con el tamaño del repositorio. A ello hay que sumar caché KV y overhead del runtime; con `--gpu-memory-utilization 0.85` el script de referencia asume una GPU con al menos 64 GB utilizables tras reservar el 15 %.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o GPUs con 80 GB o más. Una RTX 4090 (24 GB) no puede alojar los pesos en BF16.
- GPU de consumo: no cabe en BF16 en ninguna GPU de consumo actual. Sería necesaria cuantización (la model card menciona FP8 en NVIDIA y W4A8 en ARM de borde) o descarga por capas en CPU, no documentada aquí.
- Despliegue: imagen Docker oficial `harbor.baai.ac.cn/flagrelease-public/qwen3.8-27b-nvidia004-gems5.3.3-tree0.5.0-cxnone-plugin0.3.0-vllm0.24.0-cp312-pt211-cu129-x64-580.126.20:202608141515`, con vLLM 0.24.0 y el plugin FlagOS. El script usa `--tensor-parallel-size 1` y `--pipeline-parallel-size 1`, es decir, configuración de una sola GPU.
- Requisitos del host: Docker 24.0.0, Ubuntu 22.04.4 LTS, driver NVIDIA 580.126.20, `--shm-size=64g` y montaje de las librerías del driver (`libcuda.so.1`, `libnvidia-ml.so.1`, `libnvidia-ptxjitcompiler.so.1`) dentro del contenedor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros modelos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo de referencia estructural, las alternativas de la misma categoría (modelos vision-language de aproximadamente 27-30 mil millones de parámetros con licencia permisiva) requerirían datos de parámetros, contexto y benchmarks que no se han facilitado en esta búsqueda.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B (build FlagOS) | 27,78 B | 102.400 tokens | Apache 2.0 | Hugging Face + contenedor FlagOS |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La información pública sobre arquitectura, datos de entrenamiento y evaluación es muy escasa; la model card se centra en el despliegue y no en las capacidades del modelo.
- Solo se declaran chino e inglés; el rendimiento en castellano no está verificado y no debería asumirse.
- Los benchmarks publicados se limitan a dos métricas (GPQA_Diamond y muSR), insuficientes para caracterizar el modelo. La diferencia de +2,02 puntos en GPQA_Diamond a favor de FlagOS sobre el stack nativo no se explica en la documentación y podría deberse a variaciones de precisión o de configuración de muestreo, no necesariamente a una mejora real.
- La lista negra de operadores (`index_put_`, `nonzero`, `copy_`, `index`, `mm`, etc.) indica que el plugin FlagOS no cubre todas las rutas de forma nativa; conviene validar la paridad numérica en cada carga de trabajo antes de pasar a producción.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos, especialmente en tareas multimodales con imágenes de baja calidad.
- Sesgos: no documentados. Al estar entrenado principalmente en chino e inglés, es esperable un sesgo cultural hacia esos contextos, pero no hay evaluación publicada.
- Licencia Apache 2.0: permite uso comercial y modificaciones con atribución, sin restricciones adicionales conocidas. Verificar los términos del modelo base original de Alibaba, ya que esta ficha cubre solo la build de FlagOS.
- El repositorio tiene 49 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.
- El despliegue está acoplado a versiones muy concretas (vLLM 0.24.0, CUDA 12.9, PyTorch 2.11, driver 580.126.20); desviarse de ellas puede romper la compatibilidad del plugin.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/FlagRelease/Qwen3.8-27B-BF16-nvidia-FlagOS
- Imagen Docker de FlagOS: `harbor.baai.ac.cn/flagrelease-public/qwen3.8-27b-nvidia004-gems5.3.3-tree0.5.0-cxnone-plugin0.3.0-vllm0.24.0-cp312-pt211-cu129-x64-580.126.20:202608141515`
- Modelo base Qwen3.8-27B de Alibaba: no disponible en la información proporcionada
- Paper técnico: no disponible
- Blog o anuncio de FlagOS: no disponible
- Repositorio de código de FlagOS: no disponible
- Demo: no disponible
