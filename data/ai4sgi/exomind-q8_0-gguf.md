# AI4SGI/ExoMind-Q8_0-GGUF

## Resumen

ExoMind es un sistema agéntico multimodal desarrollado por el Shanghai Artificial Intelligence Laboratory (equipo ExoMind) para el razonamiento científico. El modelo base, AI4SGI/ExoMind, es un MoE (Mixture of Experts) de 35B parámetros totales y 3B activos, construido sobre la arquitectura Qwen3.5, con capacidades de visión-lenguaje, tool use y razonamiento agéntico. Esta versión Q8_0 GGUF es una cuantización de alta fidelidad para inferencia local con llama.cpp, que incluye el proyector multimodal F16 necesario para procesar imágenes. Su relevancia radica en democratizar el acceso a un modelo de razonamiento científico de última generación en hardware de consumo, manteniendo una licencia Apache 2.0.

El repositorio contiene únicamente el archivo GGUF Q8_0 (35,20 GiB) y el proyector multimodal F16 (857,62 MiB), lo que facilita la descarga y el despliegue explícito. La cuantización Q8_0 ofrece una fidelidad cercana al BF16 original, aunque no se han publicado benchmarks específicos para esta conversión. El modelo está orientado a tareas de investigación científica, análisis de documentos con figuras, y automatización de flujos de trabajo agénticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basado en Qwen3.5, multimodal (imagen-texto) |
| Parametros totales | 35B |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | 32 768 tokens (configuracion recomendada en la documentacion de llama.cpp) |
| Tipos de cuantizacion | Q8_0 (este repositorio); tambien disponibles Q4_K_M y F16 en otros repos |
| Idiomas soportados | Ingles y chino (segun metadatos de HuggingFace) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0) + proyector multimodal F16 |

## Arquitectura y entrenamiento

ExoMind es un modelo de arquitectura MoE con 35B parametros totales y 3B activos por token, lo que permite una inferencia eficiente en terminos de computo. Esta basado en Qwen3.5, una familia de modelos que incorpora atencion multimodal y soporte para tool calling. El modelo es multimodal, aceptando entradas de imagen y texto, y esta disenado como un sistema agéntico inspirado en el concepto de "extended-mind": integra ingenieria de datos sistematica, un marco de interaccion cientifica y una estrategia de entrenamiento sistematica para mejorar el razonamiento cientifico y la investigacion.

No se han proporcionado detalles especificos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. La informacion disponible indica que el sistema organiza un modelo de proposito general, objetos de interaccion especializados y procesos de interaccion autonomos, permitiendo al modelo descubrir fuentes, fundamentar evidencia, ejecutar verificaciones y actualizar su razonamiento en torno a cada consulta.

## Capacidades

- Razonamiento cientifico avanzado: disenado para tareas de investigacion, analisis de literatura y formulacion de hipotesis.
- Multimodal (imagen-texto): puede procesar figuras, graficos, diagramas y tablas en documentos cientificos.
- Tool use / function calling: soporta la invocacion de herramientas externas y APIs para automatizar flujos de trabajo.
- Capacidades agénticas: puede ejecutar procesos autonomos de descubrimiento, verificacion y actualizacion de razonamiento.
- Conversacional: mantiene dialogos multi-turno con contexto largo (32K tokens).
- Multilingue: soporta ingles y chino, segun los metadatos de HuggingFace.
- Generacion de codigo: puede escribir y depurar codigo para simulaciones y analisis de datos cientificos.

## Casos de uso

- Asistente de investigacion cientifica: el modelo puede analizar articulos, extraer conclusiones clave y sugerir experimentos, aprovechando su razonamiento cientifico y su ventana de contexto de 32K tokens para procesar documentos extensos.
- Analisis de documentos con figuras y tablas: al ser multimodal, puede interpretar graficos y diagramas en papers, facilitando la revision de literatura y la extraccion de datos visuales.
- Agente autonomo para automatizacion de laboratorio: con tool calling, puede interactuar con bases de datos, APIs de simulacion y sistemas de gestion de experimentos, ejecutando tareas de verificacion y actualizacion de resultados.
- Generacion de codigo para simulaciones cientificas: puede escribir y depurar scripts en Python para analisis estadistico, modelado numerico o visualizacion de datos, reduciendo el tiempo de desarrollo.
- Educacion cientifica interactiva: actua como tutor que explica conceptos complejos con ejemplos visuales y razonamiento paso a paso, adaptandose al nivel del estudiante.
- Revision sistematica de literatura: puede procesar grandes volumenes de articulos, identificar patrones y generar resumenes estructurados, gracias a su contexto largo y su capacidad de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta cuantizacion Q8_0. La model card indica que los resultados publicados corresponden al checkpoint BF16 original de ExoMind 35B-A3B, y que esta conversion no tiene puntuaciones separadas. Los resultados completos y comparaciones estan disponibles en el [evaluation explorer](https://ai4sgi.github.io/ExoMind/#results) del proyecto.

## Requisitos de hardware

- VRAM estimada: el archivo Q8_0 pesa 35,20 GiB, mas el proyector F16 de 857,62 MiB. Para cargar todo en GPU se necesitan al menos 40 GB de VRAM.
- GPUs recomendadas: A100 40GB, A6000 48GB, L40S 48GB, o 2x RTX 4090 (24GB cada una) con offloading a CPU.
- En consumer GPU: cabe en una RTX 4090 (24GB) solo con offloading parcial a CPU, o en una RTX 3090 (24GB) con cuantizacion Q4_K_M (disponible en otro repositorio).
- Opciones de despliegue: llama.cpp (llama-server), Ollama (importando el GGUF), LM Studio, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con modelos similares. ExoMind comparte caracteristicas con otros MoE multimodales como Qwen2.5-VL-32B o InternVL, pero no se han publicado resultados comparativos en la informacion disponible. Se recomienda consultar el evaluation explorer del proyecto para ver comparaciones con el modelo original.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos, pero al estar entrenado principalmente en ingles y chino, puede tener un rendimiento inferior en otros idiomas.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir informacion incorrecta o inventada, especialmente en tareas cientificas complejas. Se recomienda verificacion humana.
- Limitaciones de contexto: la ventana de 32K tokens puede ser insuficiente para documentos muy extensos o conversaciones muy largas.
- Restricciones de licencia: el modelo y los materiales de Qwen3.5 estan bajo Apache 2.0, lo que permite uso comercial. Sin embargo, el contenido del informe tecnico, las figuras y las marcas de ExoMind estan sujetos a los "ExoMind Research Content and Brand Terms", que pueden restringir su uso en productos derivados.
- Caveat de produccion: esta cuantizacion Q8_0 no tiene benchmarks propios; los resultados publicados corresponden al checkpoint BF16 original, por lo que puede haber ligeras diferencias de rendimiento.

## Enlaces

- [HuggingFace - ExoMind-Q8_0-GGUF](https://huggingface.co/AI4SGI/ExoMind-Q8_0-GGUF)
- [HuggingFace - ExoMind (modelo base)](https://huggingface.co/AI4SGI/ExoMind)
- [GitHub - AI4SGI/ExoMind](https://github.com/AI4SGI/ExoMind)
- [Pagina del proyecto](https://ai4sgi.github.io/ExoMind/)
- [ModelScope - ExoMind-Q8_0-GGUF](https://modelscope.cn/models/AI4SGI/ExoMind-Q8_0-GGUF)
- [Technical Report PDF](https://github.com/AI4SGI/ExoMind/blob/main/Paper.pdf)
