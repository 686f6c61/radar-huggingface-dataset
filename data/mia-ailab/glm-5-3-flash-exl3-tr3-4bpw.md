# Mia-AiLab/GLM-5.3-Flash-EXL3-TR3-4bpw

## Resumen

GLM-5.3-Flash-EXL3-TR3-4bpw es una redistribución byte-idéntica de una cuantización de 4 bits del modelo GLM-5.3-Flash de Z.AI, realizada por Brandon M. Music mediante su pipeline ShapleyMcg. El repositorio lo aloja Mia-AiLab con el objetivo de preservar la receta de despliegue para dos DGX Spark (NVIDIA GB10) y garantizar que el artefacto siga siendo accesible si el repositorio original se mueve. No se trata de una cuantización original, sino de un espejo de la revisión `5ab363a8dcf6405955fd5f99671e01a1c9fb124b` del repositorio `brandonmusic/GLM-5.3-Flash-tr3-4bpw`.

El modelo base, GLM-5.3-Flash, es el primer modelo nativamente multimodal de la serie GLM-5, con 320 mil millones de parámetros totales y 18 mil millones activos. Esta versión cuantizada reduce el peso a aproximadamente 87,8 mil millones de parámetros en formato safetensors (4 bits), ocupando 175,7 GB en disco. La licencia es ShapleyMcg License 1.0, una licencia de código disponible (source-available) que no es OSI open source y que exige atribución, con una cláusula específica que deniega derechos a la persona conocida como "0xSero".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con routing por experto, cuantización uniforme K4 EXL3/TR3 |
| Parametros totales | 87.811.157.118 (cuantizado, safetensors) |
| Parametros activos | no disponible (el modelo base tiene 18B activos; la cuantización no altera este dato pero no se especifica en el repo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (EXL3/TR3, uniform-K4) |
| Idiomas soportados | no disponible |
| Licencia | ShapleyMcg License 1.0 (source-available, no OSI) |
| Formato de pesos | safetensors (120 shards) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer multimodal con arquitectura MoE: 320B parámetros totales y 18B activos por token. Es el primer modelo de la serie GLM-5 con capacidades nativas de visión y texto (image-text-to-text). Segun el blog de Z.AI, GLM-5.3 usa el mismo modelo base que GLM-5.2 y todas las mejoras provienen del post-entrenamiento, con un incremento del 50% en el benchmark interno Z.ai Code Bench respecto a GLM-5.2.

La cuantización EXL3/TR3 aplicada por Brandon M. Music utiliza el pipeline ShapleyMcg, descrito como "un pipeline auditable de calibración a codificación para modelos MoE de bajo bit". El resultado es un checkpoint con cuantización uniforme K4 en los expertos enrutados, con 120 shards safetensors y un peso total de aproximadamente 164 GiB. El repositorio incluye metadatos de procedencia del snapshot original.

## Capacidades

- Generación de texto y razonamiento: el modelo base GLM-5.3-Flash destaca en tareas de codificación compleja y razonamiento multi-paso, acercandose a Claude Opus 4.8 en benchmarks de codificación y agentes.
- Multimodal: al ser el primer modelo nativamente multimodal de la serie GLM-5, procesa entradas de imagen y texto (pipeline image-text-to-text).
- Codificación: el modelo base muestra una mejora del 50% sobre GLM-5.2 en el benchmark interno Z.ai Code Bench, posicionandose como el modelo de pesos abiertos mas capaz para codificación.
- Capacidades de agente: el blog de Z.AI menciona mejoras en tareas de largo horizonte y capacidades de agente, aunque no se detallan en la información disponible.
- Tool calling / function calling: no se especifica en la información disponible, aunque es habitual en la serie GLM.
- Soporte de despliegue: el repositorio incluye una receta para servir el modelo en 2x DGX Spark (GB10) con TP=2, fp8 MLA KV y DFlash2, usando vLLM.

## Casos de uso

- Despliegue local en hardware NVIDIA GB10: la receta principal de este repositorio es ejecutar el modelo en dos DGX Spark, lo que permite inferencia de 4 bits en un cluster de dos nodos con tensor parallelism.
- Desarrollo de agentes de codificación: el modelo base esta optimizado para tareas de codificación complejas y de largo horizonte, por lo que esta cuantización puede usarse para prototipar agentes de programación en entornos con recursos limitados.
- Investigación en cuantización MoE: al ser un checkpoint EXL3/TR3 con metadatos de procedencia, es util para estudiar el impacto de la cuantización 4-bit en modelos MoE multimodales.
- Evaluación de modelos cuantizados: permite comparar el rendimiento de GLM-5.3-Flash en 4 bits frente a la version completa, para decidir si la perdida de precision es aceptable para un caso de uso concreto.
- Sistemas de vision-lenguaje en edge: al ser multimodal y caber en 175 GB, puede desplegarse en servidores con una o dos GPUs de alta gama para tareas de captioning o VQA.
- Preservacion de artefactos: el repositorio sirve como respaldo si el upstream se mueve, garantizando que la receta de despliegue siga siendo reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones del checkpoint cuantizado. Los datos de rendimiento del modelo base (GLM-5.3-Flash) mencionados en el blog de Z.AI y OpenLM.ai no estan desglosados en numeros concretos dentro de la informacion proporcionada, por lo que no se pueden presentar en tabla.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 175,7 GB en disco, por lo que se necesita al menos esa cantidad de VRAM combinada. Con cuantizacion 4-bit, el modelo cargado en memoria requerira aproximadamente 88 GB (87,8B parametros x 1 byte por parametro en 4 bits), mas overhead de KV cache y activaciones.
- GPU recomendadas: la receta oficial usa 2x NVIDIA DGX Spark (GB10) con TP=2. Alternativamente, cabria en una GPU de 96 GB (como A100 80GB no seria suficiente; se necesitaria H100 94GB o similar) o en dos GPUs de 48 GB (A6000, L40S) con tensor parallelism.
- Consumer GPU: no cabe en ninguna GPU de consumo actual (RTX 4090 tiene 24 GB, RTX 5090 tiene 32 GB). Se necesitan GPUs de estacion de trabajo o datacenter.
- Opciones de despliegue: vLLM (mencionado en los tags), llama.cpp (no confirmado para EXL3), y la imagen Docker `ghcr.io/miaai-lab/glm-5.3-flash-2x-dgx-sparks:exl3` para el cluster de 2x DGX Spark.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B total, 18B activo | no disponible | MIT | safetensors (BF16) |
| GLM-5.3-Flash-EXL3-TR3-4bpw (este) | 87,8B cuantizado | no disponible | ShapleyMcg 1.0 | safetensors (4-bit EXL3) |
| GLM-5.3-Flash-DFlash2 | no disponible | no disponible | CC BY-NC-ND 4.0 | no disponible |

La comparativa con otros modelos de la misma categoria (MoE multimodal cuantizado) no esta disponible en la informacion proporcionada. El checkpoint DFlash2 se menciona como un checkpoint separado con licencia CC BY-NC-ND 4.0 que no se incluye en este repositorio.

## Limitaciones y advertencias

- Licencia restrictiva: la ShapleyMcg License 1.0 es source-available, no OSI open source, y exige atribucion. Incluye una clausula que deniega derechos a la persona "0xSero". No se puede relicenciar como MIT.
- Licencia dual: el modelo base es MIT (Z.AI), pero la cuantizacion de Brandon M. Music esta bajo ShapleyMcg. Cualquier uso debe cumplir ambas licencias.
- Sin garantia de rendimiento: al ser una cuantizacion 4-bit, puede haber perdida de precision respecto al modelo base, especialmente en tareas de razonamiento complejo o generacion de codigo.
- No es el checkpoint diario del autor: la model card advierte explicitamente que este no es el "SM120 B12X / NVFP4-KV / EP2/DCP2 daily driver" de Brandon, sino una snapshot especifica para la receta de 2x DGX Spark.
- Sin datos de evaluacion: no se proporcionan benchmarks del checkpoint cuantizado, por lo que el rendimiento real en tareas especificas es desconocido.
- Requisitos de hardware elevados: no es desplegable en hardware de consumo; se necesitan GPUs de datacenter o estaciones de trabajo con al menos 96 GB de VRAM combinada.
- Riesgo de alucinacion y sesgos: no se proporciona informacion sobre sesgos o evaluaciones de seguridad para esta cuantizacion especifica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Mia-AiLab/GLM-5.3-Flash-EXL3-TR3-4bpw
- Repositorio upstream (Brandon Music): https://huggingface.co/brandonmusic/GLM-5.3-Flash-tr3-4bpw
- Receta 2x DGX Spark (GitHub): https://github.com/MiaAI-Lab/GLM-5.3-Flash-EXL3-2x-DGX-Sparks
- ShapleyMcg (GitHub): https://github.com/brandonmmusic-max/shapleymcg
- Blog de Z.AI sobre GLM-5.3: https://z.ai/blog/glm-5.3
- OpenLM.ai sobre GLM-5.3: https://openlm.ai/glm-5.5/
- Perfil de MiaAI-Lab en GitHub: https://github.com/MiaAI-Lab
