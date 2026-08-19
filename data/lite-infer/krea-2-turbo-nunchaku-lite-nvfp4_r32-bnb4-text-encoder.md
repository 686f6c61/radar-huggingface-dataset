# lite-infer/krea-2-turbo-nunchaku-lite-nvfp4_r32-bnb4-text-encoder

## Resumen

El repositorio `lite-infer/krea-2-turbo-nunchaku-lite-nvfp4_r32-bnb4-text-encoder` es una conversión cuantizada del modelo de difusión texto-imagen `krea/Krea-2-Turbo`, preparada para cargarse directamente con la librería Diffusers mediante una llamada estándar a `from_pretrained`, sin necesidad de parches de grafo ni paquetes adicionales en tiempo de ejecución. La cuantización utiliza el método NVFP4 SVDQ (grupo de 16, rango 32, 256 objetivos SVDQ) sobre el transformer, mientras que el codificador de texto se comprime con BitsAndBytes en 4 bits NF4. El resultado es un modelo que ocupa 11,5 GB en disco y reduce la latencia de inferencia frente a la versión INT4 del mismo autor, manteniendo una calidad visual cercana a la referencia densa.

El modelo está pensado para entornos de producción donde se necesite generar imágenes de alta resolución (1024×1024) con requisitos de VRAM moderados (20,34 GiB pico) y tiempos de respuesta inferiores a los de otras cuantizaciones. Su principal limitación es que exige GPUs NVIDIA de arquitectura Blackwell o superior, ya que el formato NVFP4 no es compatible con Turing, Ampere o Hopper. La licencia es la `krea-2-community-license`, que permite uso comunitario pero con restricciones específicas que conviene revisar antes de un despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-imagen (arquitectura base no especificada en la informacion disponible) |
| Parametros totales | 7.469.811.532 (pesos del repositorio cuantizado, safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de difusion, no procesa secuencias largas) |
| Tipos de cuantizacion | NVFP4 SVDQ (rank 32, group size 16) para el transformer; bf16 para 8 lineales externos; BitsAndBytes 4-bit NF4 para el text encoder |
| Idiomas soportados | No disponibles |
| Licencia | krea-2-community-license (enlace al PDF: https://cdn.jsdelivr.net/gh/krea-ai/krea-2@db3984fbc6e13b34c0064990fc2d95ac64d00058/assets/hf_samples/LICENSE.pdf) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `krea/Krea-2-Turbo`, un modelo de difusión texto-imagen que genera imágenes de 1024×1024 píxeles a partir de prompts en lenguaje natural. En este repositorio, el transformer se ha cuantizado con el método NVFP4 SVDQ (descomposición en valores singulares) implementado en la herramienta `diffuse-compressor`, que selecciona 256 objetivos SVDQ con rango 32 y grupo de cuantización de 16 elementos. Ocho capas lineales críticas (`img_in`, embeddings de tiempo y texto, `time_mod_proj`, `text_fusion.projector` y `final_layer.linear`) se mantienen en bf16 para preservar la precisión numérica. El codificador de texto se cuantiza por separado con BitsAndBytes en 4 bits NF4, manteniendo el cómputo en bf16.

No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). El proceso de cuantización se calibró con 32 prompts a 8 pasos de inferencia y resolución 1024×1024. Una decisión técnica destacable es que las proyecciones QKV no están fusionadas, lo que sacrifica algo de velocidad a cambio de poder cargar el modelo a través del grafo estándar de Diffusers sin parches externos.

## Capacidades

- Generación de imágenes a partir de descripciones textuales en alta resolución (1024×1024).
- Inferencia eficiente gracias a la cuantización NVFP4, con una latencia de 34,06 segundos por imagen completa en una RTX PRO 4000 Blackwell (8 pasos, guidance scale 0.0).
- Compatibilidad total con la API `Krea2Pipeline` de Diffusers, permitiendo integración directa en pipelines existentes.
- Soporte para diferentes schedulers y configuraciones de pasos, tal como se muestra en el ejemplo de uso.
- El modelo cuantizado mantiene una fidelidad visual cercana a la referencia densa, con un error MAE de 8,18 y RMSE de 19,92 frente a la versión sin cuantizar.
- No se reportan capacidades adicionales como tool calling, agentes o procesamiento multimodal más allá de texto a imagen.

## Casos de uso

- Generación de imágenes para prototipado rápido en diseño gráfico: un equipo creativo puede generar múltiples variaciones de un concepto a partir de prompts descriptivos, con tiempos de respuesta aceptables para iteración en tiempo real.
- Creación de contenido para campañas de marketing: se pueden producir imágenes de productos o escenas personalizadas sin necesidad de sesiones fotográficas, gracias a la fidelidad visual del modelo cuantizado.
- Automatización de ilustraciones para documentación técnica: el modelo puede generar diagramas o ilustraciones conceptuales a partir de descripciones textuales, integrándose en pipelines de documentación automatizada.
- Generación de imágenes para entrenamiento de otros modelos: se pueden sintetizar datasets visuales sintéticos con control fino sobre el contenido, útil para aumentar conjuntos de datos en visión por computador.
- Desarrollo de aplicaciones de edición de imágenes asistida: aunque el modelo no soporta edición directa, puede usarse como base para flujos de trabajo que combinen generación y postprocesado.
- Despliegue en entornos con restricciones de VRAM: al requerir solo 20,34 GiB de memoria máxima, puede ejecutarse en GPUs profesionales de gama media como la RTX PRO 4000, facilitando su uso en estaciones de trabajo sin hardware de gama alta.

## Benchmarks y rendimiento

Los datos de rendimiento proporcionados en la model card se obtuvieron en una NVIDIA RTX PRO 4000 Blackwell (24 GiB) con resolución 1024×1024, 8 pasos, guidance scale 0.0, seed 12345, una pasada de calentamiento y tres mediciones, con todo residente en GPU sin offload.

| Checkpoint | Latencia (s) | VRAM máxima (GiB) |
|---|---|---|
| Este repositorio (NVFP4 r32 + BNB4 text encoder) | 34,06 (stdev 0,03) | 20,34 |
| Nunchaku Lite INT4 r32 + BNB4 text encoder | 60,70 (stdev 0,04) | 19,97 |

La versión NVFP4 es 1,78 veces más rápida que la INT4. No se pudo medir la latencia de la versión densa bf16 porque el transformer solo ocupa 26,3 GiB y no cabe en una GPU de 24 GiB sin offload. La calidad de salida, comparada con la referencia densa, arroja un MAE de 8,18 y RMSE de 19,92, frente a 16,01 y 34,05 respectivamente para la versión INT4.

## Requisitos de hardware

- VRAM estimada: pico de 20,34 GiB durante la inferencia (medido en RTX PRO 4000 Blackwell).
- GPU recomendadas: cualquier GPU NVIDIA con arquitectura Blackwell o superior (por ejemplo, RTX PRO 4000, RTX PRO 6000, B200). No es compatible con Hopper ni arquitecturas anteriores (Turing, Ampere).
- No cabe en GPUs de consumo de gama media (RTX 4060, 4070, 4080) por requisito de VRAM y arquitectura; requiere al menos una GPU profesional Blackwell con 24 GiB o más.
- Opciones de despliegue: se integra con Diffusers mediante `Krea2Pipeline.from_pretrained`. Requiere el paquete `kernels` de Hugging Face, la variable de entorno `DIFFUSERS_TRUST_REMOTE_KERNELS=true` y una versión de Diffusers que soporte el cuantizador `nunchaku_lite`.
- Latencia y throughput: 34,06 segundos por imagen (1024×1024, 8 pasos) en la GPU de referencia, lo que equivale a aproximadamente 1,76 imágenes por minuto.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Latencia (s) | VRAM (GiB) | Licencia |
|---|---|---|---|---|---|
| Este repositorio (NVFP4) | 7.469.811.532 | NVFP4 SVDQ r32 + BNB4 text encoder | 34,06 | 20,34 | krea-2-community-license |
| Nunchaku Lite INT4 r32 + BNB4 | 7.469.811.532 (aprox.) | INT4 SVDQ r32 + BNB4 | 60,70 | 19,97 | krea-2-community-license |
| krea/Krea-2-Turbo (denso) | No disponible | bf16 (sin cuantizar) | No medible en 24 GiB (ocupa 26,3 GiB solo el transformer) | >26,3 | krea-2-community-license |

La comparativa se limita a las variantes del mismo modelo base porque no se dispone de datos de otros modelos de difusión similares en la información proporcionada.

## Limitaciones y advertencias

- Requiere hardware específico: el formato NVFP4 solo funciona en GPUs NVIDIA Blackwell o posteriores; no es compatible con Hopper, Ampere o Turing. Para arquitecturas anteriores se recomienda usar la versión INT4.
- La cuantización introduce una pérdida de calidad medible (MAE 8,18 / RMSE 19,92 frente a la referencia densa), que puede ser perceptible en imágenes con detalles finos o texturas complejas.
- El modelo no soporta edición de imágenes existentes ni tareas de visión más allá de la generación texto-imagen.
- No se ha publicado información sobre sesgos o alucinaciones específicas del modelo base; al ser un generador de imágenes, puede producir contenido estereotipado o no deseado dependiendo del prompt.
- La licencia `krea-2-community-license` tiene restricciones que deben revisarse antes de un uso comercial; el enlace al PDF de la licencia está disponible en la model card.
- La carga requiere el paquete `kernels` de Hugging Face y la variable de entorno `DIFFUSERS_TRUST_REMOTE_KERNELS=true`, lo que añade dependencias adicionales al entorno de despliegue.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicación reciente o poco probada por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lite-infer/krea-2-turbo-nunchaku-lite-nvfp4_r32-bnb4-text-encoder
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Herramienta de cuantización diffuse-compressor: https://github.com/rootonchair/diffuse-compressor
- Licencia krea-2-community-license: https://cdn.jsdelivr.net/gh/krea-ai/krea-2@db3984fbc6e13b34c0064990fc2d95ac64d00058/assets/hf_samples/LICENSE.pdf
