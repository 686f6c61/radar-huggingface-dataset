# mradermacher/Palmyra-Creative-i1-GGUF

## Resumen

Palmyra-Creative-i1-GGUF es una cuantización GGUF con matriz de importancia (imatrix) del modelo base Writer/Palmyra-Creative, desarrollado por Writer. Este modelo está especializado en pensamiento creativo, ideación, generación de ideas y resolución creativa de problemas, con un enfoque empresarial (enterprise-ready). El modelo base cuenta con aproximadamente 121.900 millones de parámetros, lo que lo sitúa en la categoría de modelos grandes, y está diseñado para tareas como brainstorming, pensamiento lateral y convergente, y resolución de problemas complejos.

La cuantización realizada por mradermacher permite ejecutar este modelo en hardware más asequible, ofreciendo múltiples niveles de compresión que van desde los 41,4 GB hasta los 100,1 GB. El modelo está disponible únicamente en inglés y se distribuye bajo la licencia writer-open-model-license, que restringe el uso comercial sin una licencia adicional de Writer. Es relevante para desarrolladores que buscan un LLM de gran tamaño centrado en creatividad y pensamiento crítico, con soporte para despliegue local mediante GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 121.892.970.560 (aprox. 121,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_M, Q2_K, IQ3_XXS, IQ3_M, Q3_K_M, Q4_K_S, Q4_K_M, Q6_K (con imatrix) |
| Idiomas soportados | Ingles |
| Licencia | Writer Open Model License (uso no comercial sin licencia adicional) |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna del modelo base Writer/Palmyra-Creative en la informacion proporcionada. Dado su tamaño de aproximadamente 121,9 mil millones de parametros, es probable que se trate de un transformer denso, aunque no se confirma. Tampoco se dispone de datos sobre el proceso de entrenamiento, el numero de tokens usados, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO.

La cuantizacion GGUF con imatrix (i1) de mradermacher se ha realizado sobre el modelo original de Writer, utilizando un archivo de importancia (imatrix) para optimizar la distribucion de bits en los pesos cuantizados. Este proceso mejora la calidad de las cuantizaciones de baja precision, especialmente en modelos grandes.

## Capacidades

- Generacion de texto en ingles con enfasis en creatividad, ideacion y pensamiento divergente.
- Soporte de tecnicas de pensamiento critico y lateral, incluyendo metodologias como "Five Whys" y "Wicked Problems".
- Orientado a la resolucion creativa de problemas, con capacidad para generar ideas novedosas y soluciones convergentes.
- Diseñado para entornos empresariales, con soporte para integracion en flujos de trabajo de innovacion y estrategia.
- No se ha confirmado soporte para tool calling, function calling, agentes o razonamiento multi-paso en la informacion disponible.
- Capacidades multilingues: no disponibles, el modelo esta entrenado solo en ingles.

## Casos de uso

- **Brainstorming automatizado**: el modelo puede generar listas de ideas para equipos de producto, basandose en prompts que describan el problema y el contexto. Su enfoque en pensamiento divergente lo hace adecuado para explorar multiples soluciones en una sola pasada.
- **Resolucion de problemas complejos**: aplicando tecnicas como "Five Whys" o "Wicked Problems", el modelo puede ayudar a descomponer problemas empresariales ambiguos en componentes manejables y proponer estrategias de abordaje.
- **Generacion de conceptos creativos**: para campañas de marketing, diseno de productos o contenido, el modelo puede generar conceptos originales a partir de briefings cortos, aprovechando su entrenamiento en ideacion.
- **Asistencia en estrategia empresarial**: en entornos corporativos, puede servir como sparring para equipos de innovacion, ofreciendo perspectivas no convencionales y estimulando el pensamiento lateral en la toma de decisiones.
- **Desarrollo de narrativas y storytelling**: el modelo puede crear tramas, guiones o historias con elementos creativos, util para equipos de comunicacion y entretenimiento.
- **Entrenamiento y formacion**: como herramienta de apoyo en talleres de creatividad, el modelo puede generar ejercicios, preguntas provocativas y escenarios para practicar tecnicas de pensamiento creativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: depende de la cuantizacion. El cuantizado mas pequeño (IQ2_M) requiere aproximadamente 41,4 GB de almacenamiento en disco, pero en memoria VRAM se necesita espacio adicional para la inferencia (tipicamente 1,5-2 veces el tamano del archivo). El Q6_K (100,1 GB) requiere al menos 120-150 GB de VRAM.
- **GPU recomendadas**: para cuantizaciones bajas (IQ2_M, Q2_K), se necesitan GPUs con al menos 48 GB de VRAM, como una NVIDIA A6000 o una A100 de 40/80 GB. Para Q4_K_M (69,5 GB), se recomienda una A100 de 80 GB o multiples RTX 3090/4090 con NVLink. El Q6_K (100 GB) requiere configuraciones de multiples GPU (por ejemplo, 2x A100 de 80 GB).
- **En consumer GPU**: no es viable en una unica GPU de consumo (RTX 4090 de 24 GB) para ninguna cuantizacion, excepto si se usa offloading a CPU con llama.cpp, pero el rendimiento sera limitado.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF experimental) o TGI. El modelo esta optimizado para inferencia local en CPU/GPU mediante llama.cpp.
- **Latencia y throughput**: no se ha publicado datos especificos. Se espera que en hardware con suficiente VRAM, la generacion sea de 5-15 tokens/segundo en una A100, dependiendo de la cuantizacion y la configuracion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria (creatividad/ideacion) en el mismo rango de parametros. Modelos como Llama 3 70B o Qwen 72B podrian ser alternativas generalistas, pero no se conocen datos de rendimiento especificos para tareas creativas.

## Limitaciones y advertencias

- **Licencia**: el modelo se distribuye bajo la licencia "writer-open-model-license", que restringe el uso comercial sin una licencia adicional de Writer. Verificar los terminos en https://writer.com/legal/open-model-license/ antes de uso en produccion.
- **Idioma**: solo soporta ingles; no es adecuado para tareas en español u otros idiomas.
- **Sesgos**: no se ha publicado informacion sobre sesgos especificos, pero al ser un modelo entrenado principalmente con datos en ingles, puede presentar sesgos culturales o de genero.
- **Alucinacion**: como todos los LLM, puede generar informacion falsa o inventada, especialmente en contextos creativos donde la originalidad es el objetivo.
- **Contexto**: no se conoce la longitud de contexto maxima; puede no ser adecuado para tareas que requieran ventanas muy largas.
- **Uso en produccion**: sin datos de benchmarks ni evaluaciones, el rendimiento en tareas especificas no esta garantizado. Se recomienda validacion interna antes de desplegarlo.

## Enlaces

- [Modelo cuantizado (HuggingFace)](https://huggingface.co/mradermacher/Palmyra-Creative-i1-GGUF)
- [Modelo base Writer/Palmyra-Creative](https://huggingface.co/Writer/Palmyra-Creative)
- [Cuantizaciones estaticas (sin imatrix)](https://huggingface.co/mradermacher/Palmyra-Creative-GGUF)
- [Licencia del modelo](https://writer.com/legal/open-model-license/)
- [Politica de uso aceptable](https://writer.com/legal/acceptable-use/)
- [Pagina de mradermacher en HuggingFace](https://huggingface.co/mradermacher)
