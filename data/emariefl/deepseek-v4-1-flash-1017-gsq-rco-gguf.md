# emariefl/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017 es un modelo de lenguaje de tipo mixture-of-experts (MoE) disperso desarrollado por DeepSeek, con 763.200 millones de parametros totales, 384 expertos enrutados por capa (6 activos por token) y una ventana de contexto de 1 millon de tokens. Esta ficha describe la publicacion de emariefl en Hugging Face, que no es el modelo original sino una familia de cuantizaciones GGUF no uniformes del mismo, producidas con las tecnicas GSQ (Gumbel-Softmax Quantization) y RCO (Riemannian Constrained Optimization) del laboratorio IST-DASLab.

El interes de esta publicacion reside en el metodo de cuantizacion: en lugar de aplicar un unico tipo de cuantizacion a todos los tensores, se asigna un tipo distinto a cada tensor mediante una busqueda basada en gradientes que reparte precision segun la sensibilidad de cada tensor y bajo una restriccion de tamano total. Se ofrecen tres builds (IQ1_M, IQ2_XXS e IQ2_XS) con medias de 1,75, 2,00 y 2,25 bits por peso sobre el backbone, lo que permite ejecutar un modelo de 763B en hardware muy limitado.

Los pesos se distribuyen como archivos GGUF estandar cargables en llama.cpp (version b11870 o superior) y, segun el autor, ejecutables en una sola GPU con 12 GB de VRAM mediante la herramienta Strata. La licencia declarada es MIT. No se han publicado resultados de benchmarks propios en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso con tablas de lookup Engram |
| Parametros totales | 763.200 millones (196.613.849.600 en safetensors del modelo base; 551.900 millones en backbone + 196.600 millones en Engram) |
| Parametros activos | 6 de 384 expertos enrutados por capa |
| Longitud de contexto | 1.000.000 de tokens |
| Tipos de cuantizacion | IQ1_M (1,75 bpw), IQ2_XXS (2,00 bpw), IQ2_XS (2,25 bpw); asignacion por tensor; Engram fijo en IQ4_NL (4,50 bpw) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (5 shards de backbone + 1 shard Engram compartido) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos dispersa: 384 expertos enrutados por capa, de los cuales 6 se activan por token, con un total de 763.200 millones de parametros. Incluye ademas dos tablas de lookup denominadas Engram que suman 196.600 millones de parametros y que no participan en multiplicaciones matriciales, por lo que se mantienen a un tipo de cuantizacion fijo (IQ4_NL) en todas las builds y quedan excluidas de la busqueda de precision. El backbone transformer suma 551.900 millones de parametros. La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si hubo fases de RLHF o DPO.

La innovacion de esta publicacion es el pipeline de cuantizacion. GSQ realiza cuantizacion escalar de posentrenamiento que aprende conjuntamente las asignaciones de rejilla por coordenada y las escalas por grupo mediante una relajacion de Gumbel-Softmax, cerrando buena parte de la brecha entre cuantizacion escalar y vectorial a 2-3 bits. RCO asigna uno de K tipos de cuantizacion a cada uno de los N tensores bajo una restriccion de tamano total, reformulando la restriccion como una variedad riemanniana suave en el espacio de logits, lo que permite optimizar directamente sobre la perdida de la tarea con cumplimiento exacto del presupuesto. La busqueda asigna el tipo por capa, no por experto, porque GGUF no puede expresar granularidad por experto. El resultado son archivos GGUF estandar con precision no uniforme.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline text-generation, etiqueta conversational).
- Razonamiento y resolucion de problemas: el autor evalua el modelo base y las cuantizaciones en AIME25 y GPQA-Diamond.
- Generacion de codigo: se evalua en LiveCodeBench v6.
- Ventana de contexto de 1 millon de tokens, adecuada para documentos extensos y conversaciones largas.
- Capacidades multimodales: la nota de actualizacion del autor menciona que las builds cargan en llama.cpp "including images", lo que sugiere soporte de entrada de imagen en el modelo base; no se detalla mas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas no esta cumplimentado.

## Casos de uso

- Despliegue de un modelo de 763B en una sola GPU de consumo: con la build IQ2_XXS (248,84 GB en total) y la herramienta Strata, el autor afirma que se ejecuta en una GPU con 12 GB de VRAM, lo que permite experimentar con un MoE de gran escala en hardware asequible.
- Razonamiento matematico y cientifico en local: el modelo se evalua en AIME25 y GPQA-Diamond, por lo que es adecuado para tareas de resolucion de problemas con verificación de respuestas en entornos sin acceso a la nube.
- Asistencia de programacion con contexto largo: la ventana de 1M tokens permite cargar repositorios completos o documentacion extensa y generar codigo coherente con el contexto, con evaluacion reportada en LiveCodeBench v6.
- Analisis de documentos muy largos: informes, expedientes o bases de conocimiento de cientos de miles de tokens caben en una sola ventana, lo que evita pipelines de troceado y recuperacion.
- Investigacion sobre cuantizacion: los tres builds permiten comparar el efecto de distintos presupuestos de bits (1,75, 2,00 y 2,25 bpw) sobre las mismas tareas, util para estudiar el compromiso entre tamano y calidad.
- Experimentacion con arquitecturas MoE y Engram: al ser GGUF estandar cargable en llama.cpp, sirve para probar tecnicas de enrutamiento y tablas de lookup en entornos de inferencia locales.
- Prototipado de asistentes conversacionales con requisitos de privacidad: al ejecutarse en hardware propio, los datos no salen de la maquina, lo que encaja en entornos con restricciones de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una grafica comparativa del modelo base frente a las cuantizaciones GSQ-RCO en AIME25, GPQA-Diamond y LiveCodeBench v6, pero no se proporcionan los valores numericos en el texto disponible, por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM estimada: el autor afirma que las tres builds se ejecutan en una sola GPU con 12 GB de VRAM mediante Strata; el peso en disco es de 231,32 GB (IQ1_M), 248,84 GB (IQ2_XXS) y 265,83 GB (IQ2_XS).
- GPU recomendadas: no se especifican modelos concretos; la afirmacion de 12 GB de VRAM sugiere compatibilidad con GPUs de consumo como la RTX 3060 de 12 GB o superiores, aunque no se detalla el rendimiento en cada una.
- Cabe en GPU de consumo: si, segun el autor, con 12 GB de VRAM usando Strata.
- Opciones de despliegue: llama.cpp version b11870 o superior (carga las builds como GGUF estandar, incluido el shard Engram enlazado como shard 6); Strata para la ejecucion en 12 GB de VRAM. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 525,8 GB; la descarga de una build concreta requiere el backbone (5 shards) mas el archivo Engram compartido de 110,60 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (base) | 763,2B (MoE, 6/384 expertos activos) | 1M tokens | safetensors sin cuantizar | MIT (modelo base) | Hugging Face (deepseek-ai) |
| Esta publicacion (GSQ-RCO GGUF) | 763,2B (backbone 551,9B + Engram 196,6B) | 1M tokens | GGUF IQ1_M, IQ2_XXS, IQ2_XS | MIT | Hugging Face (emariefl) |
| DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF | 552B (segun la ficha del autor) | no disponible | GGUF GSQ-RCO | no disponible | Hugging Face (AtomicChat) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 1,75-2,25 bits por peso puede degradar la calidad respecto al modelo base; el autor publica graficas comparativas, pero no se dispone de los valores numericos para cuantificar la perdida.
- El shard Engram se comparte entre builds y debe enlazarse manualmente como shard 6 antes de cargar el modelo en llama.cpp; un error en el enlace impide la carga.
- Los archivos anteriores al 27 de octubre de 2026 requieren ejecutar convert_ds41_upstream.py para adaptarse al layout actual de llama.cpp; no basta con descargar de nuevo.
- La ejecucion en 12 GB de VRAM depende de la herramienta Strata, no solo de llama.cpp; no se documentan los requisitos de RAM del sistema ni el rendimiento en ese escenario.
- No se especifican los idiomas soportados, por lo que no se puede garantizar un comportamiento adecuado en castellano.
- No se documentan sesgos conocidos, tasas de alucinacion ni restricciones de uso comercial mas alla de la licencia MIT declarada.
- El modelo base y esta cuantizacion comparten los riesgos propios de un MoE de gran escala: coste de almacenamiento elevado (mas de 230 GB por build) y necesidad de hardware con suficiente RAM o VRAM para cargar los shards.
- La informacion sobre tool calling, agentes y capacidades multimodales es incompleta; la mencion a imagenes en la nota de actualizacion no se detalla.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/emariefl/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante no censurada (AtomicChat): https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Paper RCO: https://arxiv.org/abs/2605.00649
- Codigo GSQ: https://github.com/IST-DASLab/GSQ
- Codigo RCO: https://github.com/IST-DASLab/RCO
- Laboratorio IST-DASLab: https://github.com/IST-DASLab
- Herramienta Strata: https://github.com/Niko1221/Strata
- Release de llama.cpp b11870: https://github.com/ggml-org/llama.cpp/releases/tag/b11870
