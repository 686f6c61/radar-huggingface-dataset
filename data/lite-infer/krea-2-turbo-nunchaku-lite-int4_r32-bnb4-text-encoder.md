# lite-infer/krea-2-turbo-nunchaku-lite-int4_r32-bnb4-text-encoder

## Resumen

Este repositorio aloja una conversión cuantizada a INT4 del modelo de difusión texto-imagen Krea-2-Turbo, realizada por el usuario lite-infer mediante la herramienta `diffuse-compressor`. El objetivo es reducir drásticamente el consumo de memoria y permitir la ejecución del modelo en GPUs con menos VRAM que las necesarias para la versión densa (que supera los 26 GiB solo en el transformer). La cuantización emplea el método Nunchaku Lite (SVDQ) con grupo de tamaño 64 y rango 32, manteniendo ocho capas lineales críticas en bf16 y el codificador de texto en 4-bit NF4 mediante BitsAndBytes.

El modelo se carga directamente con `from_pretrained` de Diffusers sin parches de grafo ni paquetes adicionales, lo que facilita su integración en pipelines existentes. Según los datos publicados, alcanza una latencia de 60,70 segundos por imagen a 1024×1024 con 8 pasos en una NVIDIA RTX PRO 4000 Blackwell, con un pico de VRAM de 19,97 GiB. Es relevante porque ofrece una alternativa práctica para ejecutar Krea-2-Turbo en hardware de consumo (Turing o más reciente, excluyendo Hopper) manteniendo una calidad aceptable, con un error medio absoluto de 16,01 frente a la referencia densa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (Krea-2-Turbo) con cuantización INT4 SVDQ (Nunchaku Lite) en el transformer y text encoder en 4-bit NF4 (BitsAndBytes) |
| Parametros totales | 6.882.135.628 (6,88 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de texto a imagen, no procesa secuencias largas de texto) |
| Tipos de cuantizacion | INT4 SVDQ (group size 64, rank 32, 256 targets) para el transformer; 4-bit NF4 para el text encoder; bf16 para 8 lineales externos |
| Idiomas soportados | No disponible (el modelo base no especifica idiomas en la información proporcionada) |
| Licencia | krea-2-community-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una conversión cuantizada del checkpoint `krea/Krea-2-Turbo`, un transformer de difusión para generación de imágenes. La cuantización se realizó con `diffuse-compressor` utilizando el método `nunchaku_lite` (SVDQ, descomposición en valores singulares) con grupo de tamaño 64, rango 32 y 256 objetivos SVDQ, sin targets AWQ W4A16. Ocho capas lineales externas (`img_in`, embeddings de tiempo/texto, `time_mod_proj`, `text_fusion.projector` y `final_layer.linear`) se mantienen en bf16 para preservar precisión, mientras que el codificador de texto se cuantiza a 4-bit NF4 con cómputo en bf16. Las proyecciones QKV no están fusionadas, lo que sacrifica algo de velocidad a cambio de poder cargar el modelo con el grafo estándar de Diffusers.

La calibración se realizó sobre 32 prompts a 8 pasos de inferencia y resolución 1024×1024. No se proporcionan datos sobre el entrenamiento del modelo base (tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La información disponible solo cubre el proceso de cuantización y su evaluación.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) mediante el pipeline `Krea2Pipeline` de Diffusers.
- Carga directa con `from_pretrained` sin necesidad de parches de grafo ni paquetes de ejecución adicionales, siempre que se disponga de la versión adecuada de Diffusers con el cuantizador `nunchaku_lite`.
- Cuantización INT4 que reduce el consumo de VRAM a aproximadamente 20 GiB, permitiendo su uso en GPUs de gama alta de consumo (Turing o más recientes, excepto Hopper).
- El text encoder cuantizado a 4-bit NF4 contribuye a la reducción de memoria sin necesidad de descargar el modelo completo en precisión completa.
- Compatible con el ecosistema Hugging Face Diffusers y safetensors.
- No incluye capacidades adicionales como tool calling, agentes o razonamiento multimodal; es exclusivamente un modelo de generación de imágenes.

## Casos de uso

- Generación de imágenes en hardware de consumo: gracias a la cuantización INT4 y al pico de VRAM de 19,97 GiB, el modelo puede ejecutarse en GPUs como RTX 3090, RTX 4090 o RTX PRO 4000 Blackwell, permitiendo a desarrolladores individuales o pequeños estudios generar imágenes de alta resolución sin necesidad de infraestructura de servidor.
- Prototipado rápido de conceptos visuales: diseñadores y artistas pueden iterar sobre ideas generando imágenes a 1024×1024 con 8 pasos en aproximadamente un minuto, lo que facilita la exploración de estilos y composiciones antes de pasar a herramientas de edición tradicionales.
- Integración en pipelines de Diffusers: al cargarse con `from_pretrained`, puede sustituir al modelo denso en flujos existentes sin cambios de código, siempre que se configuren las variables de entorno y los kernels necesarios.
- Generación por lotes en entornos con memoria limitada: la menor huella de VRAM permite procesar varias imágenes de forma secuencial o con tamaños de lote pequeños en GPUs de 24 GiB, donde el modelo denso no cabe de forma residente.
- Desarrollo de aplicaciones de generación de imágenes embebidas: la posibilidad de cargar el modelo sin parches de grafo simplifica el empaquetado en aplicaciones de escritorio o servicios locales.
- Evaluación de la calidad de cuantización: investigadores pueden comparar las salidas de esta versión INT4 con la referencia densa (MAE 16,01) para estudiar el impacto de la cuantización en la fidelidad de la imagen, útil para futuros trabajos de compresión.

## Benchmarks y rendimiento

La model card proporciona datos de latencia y VRAM medidos en una NVIDIA RTX PRO 4000 Blackwell, a resolución 1024×1024, 8 pasos, guidance scale 0.0, seed 12345, con una pasada de calentamiento y tres mediciones, todo residente en GPU sin offload.

| Checkpoint | Latencia (s) | VRAM máxima (GiB) |
|---|---:|---:|
| Este repositorio (INT4 r32 + BNB4 text encoder) | 60,70 (desviación 0,04) | 19,97 |
| Nunchaku Lite NVFP4 r32 + BNB4 text encoder | 34,06 (desviación 0,03) | 20,34 |

No se incluye una fila para el modelo denso bf16 porque el transformer denso ocupa 26,3 GiB y no cabe residente en una GPU de 24 GiB. La versión NVFP4 es 1,78 veces más rápida en esta GPU gracias a los tensor cores FP4 nativos de Blackwell, pero INT4 es la opción válida para GPUs Turing, Ampere y Ada. No se han publicado benchmarks en otras arquitecturas.

En cuanto a la fidelidad de la imagen, la comparación con la referencia densa (mismo prompt, semilla, scheduler, resolución y pasos) arroja un error absoluto medio (MAE) de 16,01 y RMSE de 34,05, frente a 8,18 y 19,92 respectivamente para la versión NVFP4.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GiB (19,97 GiB medidos) para inferencia a 1024×1024 con 8 pasos, sin offload.
- GPU recomendada: NVIDIA RTX PRO 4000 Blackwell (usada en el benchmark), RTX 3090, RTX 4090 u otras con al menos 20 GiB de VRAM y arquitectura Turing o más nueva. La arquitectura Hopper no es compatible con el modo INT4.
- No cabe en GPUs de 16 GiB o menos; se requiere un mínimo de 20 GiB de VRAM para ejecución residente.
- Opciones de despliegue: Diffusers con el paquete `kernels` de Hugging Face y la variable de entorno `DIFFUSERS_TRUST_REMOTE_KERNELS=true`. Se necesita una versión de Diffusers que incluya el cuantizador `nunchaku_lite`.
- Latencia y throughput: 60,70 segundos por imagen en la GPU de referencia, lo que equivale a aproximadamente 0,016 imágenes por segundo. No se proporcionan datos de throughput en otras configuraciones.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos de difusión cuantizados en la información proporcionada. La única comparación directa es con la versión NVFP4 del mismo modelo, que es más rápida en hardware Blackwell pero no ejecutable en arquitecturas anteriores. Frente al modelo denso `krea/Krea-2-Turbo`, esta versión INT4 ofrece una reducción de VRAM significativa (de más de 26 GiB a ~20 GiB) a costa de una mayor degradación de imagen (MAE 16,01 frente a 8,18 de NVFP4). No hay datos disponibles sobre otros modelos similares como Stable Diffusion XL cuantizado o SD3.5, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- La cuantización INT4 introduce una pérdida de calidad notable en comparación con la referencia densa (MAE 16,01, RMSE 34,05). Para aplicaciones donde la fidelidad sea crítica, se recomienda evaluar la versión NVFP4 si el hardware lo permite.
- El modo INT4 no es compatible con GPUs Hopper (arquitectura no soportada). En hardware Turing o Ada, NVFP4 no está disponible, por lo que esta es la única opción cuantizada.
- Se requiere el paquete `kernels` de Hugging Face y la variable de entorno `DIFFUSERS_TRUST_REMOTE_KERNELS=true`; sin ellos, la carga fallará. Además, la versión de Diffusers debe incluir el cuantizador `nunchaku_lite`.
- La licencia `krea-2-community-license` puede imponer restricciones de uso comercial. Es necesario revisar el texto completo de la licencia antes de desplegar el modelo en producción.
- El modelo está calibrado únicamente con 32 prompts y 8 pasos; su comportamiento con otros estilos de prompt o configuraciones de inferencia puede variar.
- No se han documentado sesgos específicos del modelo cuantizado, pero el modelo base Krea-2-Turbo puede heredar sesgos de los datos de entrenamiento, que no se detallan en la información disponible.
- La latencia de 60,70 segundos por imagen es alta para aplicaciones interactivas en tiempo real; está pensado para generación por lotes o bajo demanda.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lite-infer/krea-2-turbo-nunchaku-lite-int4_r32-bnb4-text-encoder
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Herramienta de cuantización `diffuse-compressor`: https://github.com/rootonchair/diffuse-compressor
- Licencia `krea-2-community-license`: https://cdn.jsdelivr.net/gh/krea-ai/krea-2@db3984fbc6e13b34c0064990fc2d95ac64d00058/assets/hf_samples/LICENSE.pdf
