# EndlessFerry/OmniMat

## Resumen

MatVerse-1.0 es un modelo fundacional multimodal especializado en ciencia de materiales, desarrollado por EndlessFerry. Se construye mediante ajuste fino supervisado del modelo base Intern-S2-Preview-35B-A3B de InternLM, una arquitectura de mezcla de expertos (MoE) con aproximadamente 35.000 millones de parametros totales y 3.000 millones activos por token. El modelo acepta entradas de texto, opcionalmente acompanadas de imagenes cientificas, y produce respuestas en texto.

El modelo resuelve tareas especificas del dominio de materiales que requieren razonamiento cuantitativo y lectura de representaciones cientificas: interpretacion de patrones de difraccion de rayos X (XRD), inferencia de geometria de coordinacion a partir de coordenadas atomicas y diagramas de estructura cristalina, y resolucion de problemas que implican conversiones de unidades. Su relevancia radica en la especializacion sobre un modelo generalista de gran contexto (262.144 tokens) y en un corpus de post-entrenamiento curado especificamente para el dominio.

El repositorio ocupa 73,6 GB y los pesos se distribuyen en formato safetensors. El modelo se publica bajo la etiqueta `qwen3_5_moe` y esta vinculado al articulo arXiv:2611.25651. La licencia no esta disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal, base Intern-S2-Preview-35B-A3B |
| Parametros totales | 36.809.046.384 (~36,8B; documentado como ~35B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens (256K), compartidos entre prompt y respuesta |
| Tipos de cuantizacion | No disponible (pesos configurados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

MatVerse-1.0 hereda la arquitectura del modelo base Intern-S2-Preview-35B-A3B: un transformer multimodal con mezcla de expertos, ~35B parametros totales y ~3B activos por token, configurado en precision BF16 con una ventana de contexto de 262.144 tokens. La modalidad de entrada combina texto e imagenes cientificas (estructuras cristalinas, patrones XRD, imagenes de microscopia, tablas y curvas).

El post-entrenamiento consistio en ajuste fino supervisado sobre un corpus de 149.792 ejemplos de dos fuentes. La primera, razonamiento en materiales (30.639 ejemplos), combina problemas de libros de texto, recursos cientificos en linea y preguntas curadas por expertos, con variantes generadas al modificar cantidades, unidades o condiciones fisicas; las soluciones se retuvieron solo si pasaban comprobaciones especificas o si al menos seis de diez soluciones independientes coincidian en la respuesta final. La segunda, respuesta a preguntas multimodal (119.153 ejemplos), se construyo a partir de imagenes y leyendas de MaCBench, recuperando figuras cientificas relacionadas mediante busqueda por imagen y por leyenda, y filtrando por puntuacion de recuperacion; un modelo profesor genero preguntas, respuestas y explicaciones breves, resultando en 111.598 ejemplos de opcion multiple y 7.555 de respuesta abierta. La receta de entrenamiento se valido previamente sobre Qwen3-VL-4B-Thinking. El modelo emplea un parser de razonamiento compatible con el estilo `qwen3` en los backends de despliegue.

## Capacidades

- Generacion de texto y razonamiento cientifico en el dominio de ciencia de materiales.
- Lectura e interpretacion de imagenes cientificas: patrones XRD, diagramas de estructura cristalina, imagenes de microscopia, tablas y curvas.
- Inferencia de geometria de coordinacion local a partir de coordenadas atomicas y diagramas estructurales.
- Resolucion de problemas cuantitativos que requieren conversiones de unidades.
- Respuesta a preguntas de opcion multiple y de respuesta abierta sobre figuras cientificas.
- Modo de razonamiento (thinking) compatible con el parser `qwen3` en vLLM y SGLang.
- Entrada multimodal image-text-to-text con contexto largo de 262.144 tokens.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Interpretacion automatizada de difractogramas XRD: el modelo lee la posicion e intensidad de picos directamente de la imagen y responde preguntas sobre angulos de difraccion (2θ), como en el ejemplo de la model card donde identifica el pico mas intenso en 39,6°.
- Analisis de estructuras cristalinas: a partir de diagramas y coordenadas atomicas, infiere la geometria de coordinacion local de los atomos, util para validacion rapida de estructuras en flujos de cribado de materiales.
- Asistencia en laboratorio y formacion: resuelve problemas de libros de texto y preguntas curadas con conversion de unidades, adecuado como tutor tecnico para estudiantes e investigadores noveles.
- Analisis de imagenes de microscopia y curvas experimentales: responde preguntas de opcion multiple y abiertas sobre figuras cientificas, aprovechable para triaje y anotacion asistida de resultados experimentales.
- Procesamiento de documentacion cientifica de gran extension: con 262.144 tokens de contexto puede ingerir articulos completos, tablas suplementarias y multiples figuras en una sola consulta para extraer datos cuantitativos.
- Despliegue en pipelines de investigacion via API compatible con OpenAI: los ejemplos de vLLM y SGLang permiten integrar el modelo como servicio interno en herramientas de analisis de materiales.
- Preprocesamiento y verificacion en flujos de descubrimiento de materiales: combinado con busqueda de figuras y generacion de preguntas, sirve para construir y validar conjuntos de datos cientificos de forma semiautomatica.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparados con el modelo base Intern-S2-Preview bajo el procedimiento oficial de cada benchmark (cambios en puntos porcentuales):

| Benchmark | Metrica | Intern-S2-Preview | MatVerse-1.0 | Cambio |
|---|---|---:|---:|---:|
| MatSciBench | Rule accuracy | 58,45% | 63,59% | +5,14 |
| MaCBench | Overall accuracy | 65,05% | 67,22% | +2,17 |
| OmniMatBench CAL (calculo cuantitativo) | Exact slot accuracy | 21,98% | 24,45% | +2,47 |
| OmniMatBench QA (preguntas abiertas) | Macro-F1 | 28,67% | no disponible | no disponible |

El cuarto resultado (OmniMatBench QA) aparece truncado en la informacion proporcionada; no se dispone del valor de MatVerse-1.0 ni del cambio. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: los ~36,8B parametros en BF16 requieren aproximadamente 74 GB solo para pesos, mas memoria para el contexto KV; en la practica exige multiples GPU.
- El ejemplo oficial de despliegue usa `--tensor-parallel-size 2` / `--tp-size 2`, es decir, dos GPU con suficiente memoria cada una (por ejemplo, 2x A100 80GB o 2x H100 80GB).
- No cabe en GPU de consumo individual en BF16; las cuantizaciones de menor precision no estan documentadas en la informacion disponible.
- Opciones de despliegue: vLLM y SGLang (ambos con `--trust-remote-code` y parser de razonamiento `qwen3`), segun los comandos de la model card. Soporte en llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MatVerse-1.0 | ~36,8B totales / ~3B activos (MoE) | 262.144 | Materiales, multimodal cientifico | No disponible | Hugging Face |
| Intern-S2-Preview-35B-A3B (base) | ~35B totales / ~3B activos (MoE) | No disponible | Generalista multimodal | No disponible | Hugging Face |
| Qwen3-VL-4B-Thinking | ~4B | No disponible | Vision-lenguaje con razonamiento | No disponible | No disponible en la informacion |

La comparativa se limita a los modelos mencionados en la informacion proporcionada. No se dispone de datos de rendimiento de alternativas especializadas en ciencia de materiales para una comparacion cuantitativa adicional.

## Limitaciones y advertencias

- Dominio restringido: el ajuste fino se centra en ciencia de materiales; el rendimiento fuera de ese ambito puede degradarse respecto al modelo base.
- Riesgo de alucinacion en lecturas de figuras y en calculos cuantitativos: la exactitud en OmniMatBench CAL es del 24,45%, lo que indica que la mayoria de los calculos cuantitativos no se resuelven correctamente; no debe usarse como unico verificador en produccion.
- La licencia no esta disponible, por lo que no puede confirmarse el uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Idiomas soportados no documentados; no se garantiza un comportamiento correcto en castellano ni en otros idiomas distintos del ingles.
- El corpus de entrenamiento incluye datos sinteticos generados por un modelo profesor, con el riesgo de propagar errores o sesgos de ese profesor.
- Requiere `--trust-remote-code` en los backends, lo que implica ejecutar codigo del repositorio; conviene auditar el codigo antes de desplegar.
- El modelo base es un preview (Intern-S2-Preview), lo que puede implicar cambios o inestabilidad en versiones posteriores.
- Con 13 descargas y 1 like, la adopcion y validacion comunitaria son muy limitadas; no hay evidencia externa de robustez en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EndlessFerry/OmniMat
- Articulo (arXiv:2611.25651): https://arxiv.org/abs/2611.25651
- Modelo base: https://huggingface.co/internlm/Intern-S2-Preview
- Guia de despliegue del modelo base: https://huggingface.co/internlm/Intern-S2-Preview/blob/main/deployment_guide.md
