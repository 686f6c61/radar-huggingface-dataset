# Shiftedx/ornith-1.5-9b-mxfp8-vision-mlx

## Resumen

El modelo `Shiftedx/ornith-1.5-9b-mxfp8-vision-mlx` es una cuantización en formato MXFP8 (grupo-32) del modelo multimodal Ornith-1.5-9B, desarrollado por el usuario Shiftedx para su ejecución eficiente en Apple Silicon mediante el framework MLX. El modelo base, Ornith-1.5-9B, pertenece a la familia Ornith-1.5 de ornith-ai, que se publica bajo licencia MIT y destaca por su enfoque de "auto-mejora" (self-improvement) en el que el propio modelo genera sus tareas de entrenamiento. Este checkpoint concreto combina un trunk de lenguaje Qwen3.5 de 9B parámetros cuantizado a MXFP8 con una torre de visión en BF16 sin cuantizar, logrando un tamaño lógico de 10,17 GB y una ventana de contexto de 262.144 tokens.

La relevancia de este modelo radica en ofrecer una versión ligera y optimizada para Macs con chip M-series de un modelo multimodal de 9B, permitiendo ejecutar inferencias de imagen a texto de forma local sin necesidad de GPUs dedicadas. La cuantización MXFP8 reduce el tamaño de los pesos respecto al BF16 original, manteniendo la torre de visión en alta precisión para no degradar la calidad de la comprensión visual. El checkpoint incluye metadatos de conversión y un `BUILD_RECIPE.json` que documenta el proceso, lo que facilita la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 9B dense (trunk de lenguaje) + torre de vision BF16 |
| Parametros totales | 2.975.030.512 (checkpoint cuantizado; el modelo base declara 9B) |
| Parametros activos | no disponible (modelo dense, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MXFP8 group-32 para el trunk de lenguaje; vision en BF16 |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | MIT |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo es una conversión cuantizada del `Ornith-1.5-9B`, que a su vez se basa en la arquitectura Qwen3.5 con un trunk de lenguaje denso de 9B parámetros y un módulo de visión adicional. La cuantización aplica MXFP8 con agrupación de 32 elementos sobre los 250 módulos del trunk de lenguaje, incluyendo las entradas recurrentes, mientras que la torre de visión se mantiene en BF16 (333 tensores). No se ha realizado ningún entrenamiento adicional; el proceso es puramente de conversión de pesos desde el checkpoint BF16 original, con una verificación estructural y pruebas de humo locales.

El modelo base `Ornith-1.5` se describe como una familia que implementa un bucle de auto-mejora: el modelo escribe sus propias tareas de entrenamiento y luego entrena sobre ellas. Sin embargo, no se proporcionan detalles concretos sobre el dataset de entrenamiento, el número de tokens o el uso de RLHF/DPO en la información disponible. La cuantización MXFP8 es una técnica de bajo bit que reduce la huella de memoria y acelera la inferencia en hardware compatible, aunque puede introducir pequeñas pérdidas de precisión.

## Capacidades

- Generacion de texto y respuestas a partir de imagenes (image-to-text).
- Comprension multimodal: el modelo integra un codificador de vision BF16 que permite procesar imagenes junto con prompts textuales.
- Ventana de contexto amplia de 262.144 tokens, adecuada para documentos largos o conversaciones extensas.
- Ejecucion nativa en Apple Silicon mediante MLX-VLM, con soporte para el pipeline de generacion autoregresiva.
- Capacidad de razonamiento visual basico (descripcion, preguntas sobre contenido visual), aunque no se especifican capacidades avanzadas como tool calling o agentes en la documentacion.
- Multilingue: no se indica si el modelo soporta varios idiomas; se asume que hereda las capacidades del modelo base Qwen3.5, pero no esta confirmado.

## Casos de uso

- Descripcion de imagenes para accesibilidad: el modelo puede generar descripciones textuales de fotografias o ilustraciones, facilitando la interpretacion de contenido visual a personas con discapacidad visual, ejecutandose localmente en un Mac sin conexion.
- Analisis de documentos escaneados: gracias a su ventana de 262k tokens, puede procesar paginas escaneadas (convertidas a imagen) y extraer informacion relevante, como fechas, nombres o cifras, en entornos de oficina o archivo.
- Asistencia visual en entornos de investigacion: investigadores pueden subir graficos, diagramas o figuras de articulos y obtener una explicacion textual de los mismos, sin depender de servicios en la nube.
- Generacion de subtitulos o metadatos para imagenes en lotes: util para catalogar grandes colecciones de fotos en aplicaciones de fotografia o comercio electronico, con inferencia local en hardware Apple.
- Desarrollo de prototipos de chatbots con entrada visual: desarrolladores pueden integrar este modelo en aplicaciones de escritorio o web que requieran interpretar imagenes y responder en lenguaje natural, aprovechando la licencia MIT para uso comercial.
- Educacion y formacion: permite crear ejercicios interactivos donde los alumnos suben una imagen y el modelo explica su contenido o resuelve preguntas sobre ella, funcionando en portatiles Mac de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados de "Shiftedx Bench" se adjuntaran en una actualizacion posterior del README, pero a fecha de esta ficha no hay datos numericos de MMLU, HumanEval, GSM8K u otras metricas.

## Requisitos de hardware

- VRAM estimada: el tamaño logico es de 10,17 GB, por lo que se recomienda un Mac con al menos 16 GB de memoria unificada para cargar el modelo y realizar inferencias sin cuantizacion adicional. En equipos con 8 GB puede ser posible con técnicas de swap, pero no es recomendable.
- GPU recomendada: Apple Silicon (M1, M2, M3, M4 o superiores). No hay soporte para GPU NVIDIA o AMD.
- Compatibilidad con consumer GPU: no aplica, solo Apple Silicon.
- Opciones de despliegue: MLX-VLM (via `mlx_vlm.generate`), tambien puede usarse con MLX-LM para tareas de texto puro.
- Latencia y throughput: no se proporcionan datos. Se espera una velocidad de generacion moderada en un Mac moderno, dependiendo del numero de tokens y la complejidad de la imagen.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar directamente este modelo con alternativas de la misma categoria (modelos multimodales de 9B cuantizados para Apple Silicon). El modelo base `Ornith-1.5-9B` es su referencia natural, pero no hay datos de benchmarks comparativos. Otras familias como Qwen-VL o LLaVA podrian ser comparables, pero no se incluyen datos concretos en la informacion proporcionada. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- La cuantizacion MXFP8 puede provocar una degradacion en la calidad de las respuestas respecto al modelo BF16 original, especialmente en tareas que requieren alta precision numerica.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas estandar no esta verificado.
- El checkpoint no incluye los tensores `mtp.*` (multi-token prediction), por lo que la generacion puede ser mas lenta que en modelos que usan esa tecnica.
- No se especifica la lista de idiomas soportados; aunque el modelo base Qwen3.5 suele ser multilingue, no esta confirmado en este checkpoint.
- Licencia MIT permite uso comercial y modificacion, pero se recomienda revisar la licencia del modelo base (enlace proporcionado) para posibles restricciones adicionales.
- La ventana de contexto de 262k tokens puede requerir una gran cantidad de memoria durante la generacion de secuencias largas, especialmente en Macs con menos de 32 GB de RAM.

## Enlaces

- [Modelo en HuggingFace: Shiftedx/ornith-1.5-9b-mxfp8-vision-mlx](https://huggingface.co/Shiftedx/ornith-1.5-9b-mxfp8-vision-mlx)
- [Modelo base: ornith-ai/Ornith-1.5-9B](https://huggingface.co/ornith-ai/Ornith-1.5-9B)
- [Pagina de Ornith-1.5 en ornith.ai](https://ornith.ai/ornith_1_5.html)
- [Articulo de AI/TLDR sobre Ornith-1.5](https://ai-tldr.dev/releases/ornith-1-5/)
