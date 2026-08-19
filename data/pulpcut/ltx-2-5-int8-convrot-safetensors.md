# PulpCut/LTX-2.5-INT8-ConvRot-safetensors

## Resumen

PulpCut/LTX-2.5-INT8-ConvRot-safetensors es un espejo byte-idéntico de cuatro archivos del repositorio Lightricks/LTX-2.5, concretamente la versión cuantizada INT8 ConvRot publicada por Lightricks. No se ha realizado ningún reentrenamiento, fusión, poda ni recuantización: los bytes son exactamente los mismos que los del repositorio original, verificados mediante SHA-256. El propósito de este espejo es permitir que aplicaciones descarguen los pesos sin necesidad de que el usuario acepte los términos en la web de Hugging Face, ya que el repositorio original está restringido (gated).

El modelo subyacente, LTX-2.5, es un sistema de generación de vídeo con audio de Lightricks que utiliza un transformador de difusión destilado de 22 000 millones de parámetros, un encoder de texto Gemma 4 de 12 000 millones y dos VAE (vídeo y audio). El subconjunto incluido ocupa 38,7 GB frente a los ~180 GB del repositorio completo, y está pensado para ejecutar el checkpoint destilado a ocho pasos sin la escalera de upscaling de segunda etapa.

La relevancia de este espejo radica en que facilita la integración automatizada del modelo en aplicaciones, manteniendo la licencia LTX-2.x Community License adjunta. Los términos legales viajan con los pesos, incluidas las restricciones de uso de la Sección 4 y el Anexo A, así como la prohibición de eludir marcas de agua o mecanismos de divulgación latente de la Sección 6.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para text-to-video con audio |
| Parametros totales | 22B (transformador destilado) + 12B (encoder de texto Gemma 4) + VAEs |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 ConvRot (transformador y encoder de texto), BF16 (VAEs) |
| Idiomas soportados | no disponible |
| Licencia | ltx-2.x-community-license (con restricciones de uso y requisito de licencia comercial para entidades comerciales) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LTX-2.5 es un modelo de difusión de vídeo con audio que combina un transformador de difusión destilado de 22 000 millones de parámetros, un encoder de texto Gemma 4 de 12 000 millones con proyección, un VAE de vídeo convolucional en BF16 y un VAE de audio en BF16. El checkpoint incluido es la versión destilada, diseñada para generar en ocho pasos de inferencia, lo que reduce drásticamente el coste computacional frente a los checkpoints no destilados.

La cuantización INT8 ConvRot es una técnica publicada por el propio Lightricks que aplica cuantización de 8 bits con rotación de canales (channel rotation) para preservar la precisión en capas críticas. El espejo incluye únicamente los archivos necesarios para ejecutar la generación a ocho pasos: el transformador destilado cuantizado, el encoder de texto cuantizado y los dos VAE en BF16. No se incluyen los transformadores BF16 o NVFP4, el checkpoint dev (no destilado), los LoRA, los upscalers latentes ni el duration head.

El entrenamiento original de LTX-2.5 es obra de Lightricks; los detalles de composición del dataset, número de tokens y técnicas de alineación (RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio sincronizado.
- Generación de audio integrada mediante un VAE de audio dedicado.
- Inferencia rápida gracias al checkpoint destilado a ocho pasos.
- Cuantización INT8 ConvRot que reduce el peso del modelo de ~180 GB a ~38,7 GB sin pérdida de fidelidad declarada por el autor.
- Compatible con el ecosistema ComfyUI (los nombres de archivo incluyen la etiqueta "comfy").
- Carga mediante la librería h3ddle, que permite a aplicaciones descargar los pesos sin pasar por el flujo de aceptación de términos del repositorio gated original.

## Casos de uso

- Integración de generación de vídeo en aplicaciones SaaS: el espejo permite que una aplicación descargue los pesos automáticamente sin requerir que cada usuario acepte los términos en Hugging Face, lo que facilita el despliegue en pipelines automatizados.
- Generación de vídeo con audio para marketing y publicidad: el modelo produce vídeo y audio sincronizados a partir de prompts de texto, adecuado para prototipos de anuncios y contenido promocional.
- Creación de contenido para redes sociales: generación rápida de clips cortos con audio a ocho pasos, con un tamaño de descarga de 38,7 GB frente a los 180 GB del repositorio completo.
- Investigación en generación de vídeo: permite estudiar el comportamiento del checkpoint destilado de LTX-2.5 con cuantización INT8 ConvRot sin necesidad de descargar el modelo completo.
- Desarrollo de herramientas de edición de vídeo asistida por IA: integración en editores que necesiten generar secuencias de vídeo con audio de forma local.
- Demostraciones y prototipos en hardware consumer: el tamaño reducido del subconjunto permite ejecutar el modelo en GPUs de gama alta de consumo (p. ej., RTX 4090 con 24 GB) con cuantización adicional si es necesario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de calidad de vídeo (como FVD o CLIP score). El autor del espejo indica que los archivos son byte-idénticos a los del repositorio original, por lo que el rendimiento debería ser equivalente al de la versión INT8 ConvRot de Lightricks, pero no se aportan datos numéricos.

## Requisitos de hardware

- El subconjunto completo ocupa 38,7 GB en disco (transformador INT8: 21,5 GB; encoder de texto: 15,4 GB; VAE de vídeo: 1,45 GB; VAE de audio: 365 MB).
- Para cargar el transformador INT8 de 22B en memoria, se estima un mínimo de 24 GB de VRAM para el transformador más el encoder de texto y los VAE, lo que apunta a GPUs como RTX 4090, RTX 5090, A6000 o A100 de 40 GB.
- Según la receta publicada en smeltcore.com, es posible ejecutar LTX-2.5 en una RTX 5070 Ti de 16 GB utilizando una cuantización GGUF Q3_K_M, lo que indica que con cuantizaciones más agresivas el modelo cabe en GPUs consumer de 16 GB.
- El checkpoint destilado a ocho pasos reduce la latencia de generación frente a los checkpoints no destilados, aunque no se proporcionan cifras exactas de throughput.
- Opciones de despliegue: ComfyUI (soportado por los nombres de archivo), h3ddle como librería de carga, y conversión a GGUF para ejecución con llama.cpp u Ollama si se desea una cuantización más agresiva.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| Lightricks/LTX-2.5 (completo) | 22B + 12B + VAEs | BF16, NVFP4, INT8 ConvRot | ~180 GB | ltx-2.x-community-license | Repositorio gated; incluye checkpoints dev y destilado, LoRA, upscalers y duration head |
| PulpCut/LTX-2.5-INT8-ConvRot (este modelo) | 22B + 12B + VAEs | INT8 ConvRot (transformador y encoder), BF16 (VAEs) | 38,7 GB | ltx-2.x-community-license | Espejo byte-idéntico del subconjunto destilado a ocho pasos; sin gate de descarga |
| LTX-2.5 con GGUF Q3_K_M | 22B | Q3_K_M (GGUF) | ~16 GB | ltx-2.x-community-license | Ejecutable en RTX 5070 Ti de 16 GB según receta publicada |

No se dispone de datos de benchmarks comparativos entre estas variantes. La comparativa se basa en tamaño, cuantización y disponibilidad.

## Limitaciones y advertencias

- El uso de estos pesos vincula al LTX-2.x Community License Agreement, incluidas las restricciones de la Sección 4 y el Anexo A, que limitan los contenidos que se pueden generar.
- La Sección 6 prohíbe eludir mecanismos de marcas de agua, procedencia o divulgación latente.
- Las entidades comerciales, según la definición de la Sección 2, necesitan una licencia de pago de Lightricks.
- El espejo no incluye el checkpoint dev (no destilado), los LoRA, los upscalers latentes ni el duration head; para usos que requieran esos componentes hay que acudir al repositorio original.
- No se dispone de información sobre idiomas soportados ni sobre la calidad de generación en español frente a otros idiomas.
- No se han publicado benchmarks independientes que validen la calidad del vídeo generado con esta cuantización.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un espejo reciente y sin validación comunitaria.
- Riesgo de alucinación visual y de audio inherente a los modelos generativos de vídeo; se recomienda verificación humana antes de publicar contenido generado.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/PulpCut/LTX-2.5-INT8-ConvRot-safetensors
- Repositorio original (gated): https://huggingface.co/Lightricks/LTX-2.5
- Revisión original de los archivos espejados: https://huggingface.co/Lightricks/LTX-2.5/tree/6c7e5e573ac1667efc83407806fe9b0b93730e60
- Librería h3ddle: https://github.com/AlexanderIstomin/h3ddle
- Receta de ejecución en RTX 5070 Ti: https://smeltcore.com/recipes/ltx-2-5-on-rtx-5070-ti-22b-audio-video-in-16-gb-and-the-decode-trap-three-owners-hit
- Lista curada de modelos LTX-2: https://github.com/wildminder/awesome-ltx2
- Convertidor de modelos con soporte INT8 ConvRot: https://github.com/Starnodes2024/comfyui-starnodes-modelconverter
