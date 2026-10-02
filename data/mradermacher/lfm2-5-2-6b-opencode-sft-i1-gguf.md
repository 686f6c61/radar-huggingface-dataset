# mradermacher/LFM2.5-2.6B-opencode-SFT-i1-GGUF

## Resumen

LFM2.5-2.6B-opencode-SFT-i1-GGUF es una distribución de pesos cuantizados en formato GGUF del modelo FineEnvs/LFM2.5-2.6B-opencode-SFT, un ajuste fino supervisado (SFT) del LFM2.5-2.6B de Liquid AI. La cuantización la realiza mradermacher, un autor habitual en la comunidad de GGUF, usando cuantización imatrix (importance matrix) de tipo i1, que mejora la calidad respecto a las cuantizaciones estáticas para un mismo tamaño en disco. El repositorio aloja 24 variantes que van desde i1-IQ1_S (0,8 GB) hasta i1-Q6_K (2,3 GB).

El modelo de partida, LFM2.5-2.6B, es un modelo denso de 2.697.198.592 parámetros diseñado por Liquid AI para cargas de trabajo agénticas, con una ventana de contexto de 128K tokens y soporte nativo de llamada a herramientas (tool calling) orientado a despliegue en dispositivo (on-device). Este ajuste concreto desplaza ese comportamiento hacia tareas de agente de código, ya que se ha entrenado sobre el dataset FineEnvs/SmolDataEnvs-multiharness-sft y lleva la etiqueta "opencode", asociada a un arnés de agente de programación de código abierto.

Su relevancia práctica radica en el binomio tamaño-recurso: al tratarse de un modelo de 2,6B parámetros, las cuantizaciones de 4 bits ocupan entre 1,7 y 1,8 GB, lo que permite ejecutarlo en GPU de consumo, portátiles y equipos sin acelerador dedicado mediante llama.cpp u Ollama. Está publicado bajo licencia lfm1.0, con los idiomas declarados limitados al inglés en esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 densa (no MoE); detalles completos de la arquitectura no disponibles en la informacion proporcionada |
| Parametros totales | 2.697.198.592 (2,7B, dato real de safetensors del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (128K) segun la documentacion de Liquid AI para LFM2.5-2.6B |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; se incluye tambien el fichero imatrix |
| Idiomas soportados | en (ingles) en esta variante; el LFM2.5-2.6B base declara 16 idiomas, no disponibles aqui |
| Licencia | lfm1.0 (etiquetada como "other" en HuggingFace, con enlace a LICENSE) |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El punto de partida es LFM2.5-2.6B de Liquid AI, un modelo denso de 2,6B parametros construido para cargas de trabajo agénticas, con ventana de contexto de 128K tokens y llamada a herramientas nativa orientada a ejecucion en dispositivo. La informacion proporcionada no detalla la composicion interna de capas (atencion, convoluciones u otras), por lo que no se especifica aqui la mezcla exacta de la arquitectura LFM2.5.

Sobre esa base, el equipo de FineEnvs aplico un ajuste fino supervisado (SFT) con la libreria TRL, empleando el dataset FineEnvs/SmolDataEnvs-multiharness-sft. Las etiquetas del repositorio (openenv, harbor, agent, smoldataenvs, sft, opencode) indican que el entrenamiento esta orientado a entornos de agente y arneses multiples, con enfasis en flujos de trabajo de programacion (opencode). El repositorio de mradermacher no anade entrenamiento propio: unicamente genera cuantizaciones con imatrix, que requieren un fichero de importancia calculado sobre el modelo ajustado para ponderar mejor los tensores durante la cuantizacion.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat (etiqueta "conversational").
- Razonamiento agéntico de multiples pasos orientado a entornos de ejecucion (openenv, harbor).
- Llamada a herramientas nativa heredada del LFM2.5-2.6B base, adecuada para function calling y agentes.
- Flujos de trabajo de agente de programacion (opencode), con capacidad de operar sobre tareas de codigo dentro de un arnes.
- Ventana de contexto de 128K tokens, apta para conversaciones largas y contextos extensos.
- Soporte de inferencia en CPU y GPU mediante llama.cpp, Ollama y otros motores compatibles con GGUF.
- Capacidades multimodales, de vision o de audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de programacion en local: el modelo puede ejecutarse en un portatil con una cuantizacion i1-Q4_K_M (1,8 GB) y actuar como backend de un arnes de codigo tipo opencode, recibiendo instrucciones, proponiendo ediciones y encadenando pasos.
- Asistente de terminal y automatizacion de tareas: gracias al tool calling nativo, puede invocar comandos y API definidas por el usuario para automatizar scripts de mantenimiento o despliegue en equipos con recursos limitados.
- Procesamiento de repositorios largos: con 128K tokens de contexto puede analizar ficheros extensos, historiales de cambios o documentacion completa sin truncar la entrada.
- Chat de soporte tecnico en ingles: conversaciones multi-turno sobre incidencias de software, con capacidad de mantener el hilo durante sesiones largas.
- Prototipado rapido sin GPU: al caber en cuantizaciones de menos de 1,1 GB (i1-IQ2_M), permite desplegar un asistente funcional en CPU en entornos de desarrollo o CI.
- Evaluacion de pipelines agénticos: util como modelo pequeno y barato para probar arneses, plantillas de herramientas y estrategias de reintento antes de escalar a modelos mayores.
- Generacion de codigo asistida en entornos offline o con requisitos de privacidad, donde no se permite enviar codigo a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamanos de fichero declarados por el autor):
  - i1-IQ1_S / i1-IQ1_M: 0,8 GB.
  - i1-IQ2_XXS a i1-IQ2_M: 0,9-1,1 GB.
  - i1-IQ3_XXS a i1-Q3_K_L: 1,2-1,6 GB.
  - i1-IQ4_XS / i1-Q4_K_S / i1-Q4_K_M: 1,6-1,8 GB.
  - i1-Q5_K_S / i1-Q5_K_M: 2,0 GB.
  - i1-Q6_K: 2,3 GB.
  - Referencia: los pesos sin cuantizar en FP16 rondarian los 5,4 GB (2,7B x 2 bytes).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en cuantizaciones de 4 bits; una RTX 3060, RTX 4060, RTX 4090 o una A100/H100 resultan sobredimensionadas para un modelo de este tamano, aunque aceleran la generacion.
- Cabe en GPU de consumo: si, con holgura incluso en graficas de gama baja y en iGPU con memoria compartida en cuantizaciones bajas.
- Tambien es viable en CPU: con cuantizaciones de 1-2 GB el modelo se ejecuta en portatiles sin GPU dedicada mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF (por ejemplo, text-generation-webui) y, para el modelo base en safetensors, transformers. Motores como vLLM o TGI no estan optimizados para GGUF y no se citan en la informacion disponible para esta variante.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/LFM2.5-2.6B-opencode-SFT-i1-GGUF (este) | 2,7B | 128K | GGUF imatrix (i1, 24 variantes) | lfm1.0 | Cuantizacion ponderada con imatrix; rango de 0,8 a 2,3 GB |
| mradermacher/LFM2.5-2.6B-opencode-SFT-GGUF | 2,7B | 128K | GGUF estatico | lfm1.0 | Mismo modelo con cuantizaciones estaticas (sin imatrix); disponible en el mismo autor |
| FineEnvs/LFM2.5-2.6B-opencode-SFT | 2,7B | 128K | safetensors | lfm1.0 | Pesos originales sin cuantizar, para transformers |
| Liquid AI LFM2.5-2.6B (base) | 2,7B | 128K | safetensors | lfm1.0 | Modelo base sin el ajuste SFT de FineEnvs; declara 16 idiomas frente al ingles de esta variante |
| Modelos comparables de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de benchmarks ni especificaciones de alternativas en la informacion disponible |

## Limitaciones y advertencias

- Riesgo de alucinacion: inherente a los modelos de 2,6B parametros; en tareas de codigo puede generar API o funciones inexistentes, por lo que conviene validar la salida antes de ejecutarla.
- Idioma: esta variante declara unicamente ingles ("en"); el rendimiento en castellano u otros idiomas no esta respaldado por la informacion disponible.
- Especializacion estrecha: el ajuste SFT sobre SmolDataEnvs-multiharness-sft y la etiqueta opencode apuntan a entornos de agente concretos, por lo que el comportamiento fuera de ese dominio puede degradarse.
- Cuantizaciones de muy baja precision: las variantes i1-IQ1_S, i1-IQ1_M, i1-IQ2_* y i1-Q2_K estan etiquetadas por el propio autor como de calidad baja o "para casos desesperados"; para uso en produccion se recomienda i1-Q4_K_M o superior.
- Licencia: se trata de la licencia lfm1.0, etiquetada como "other" en HuggingFace. Es imprescindible revisar el fichero LICENSE del repositorio antes de cualquier uso comercial, ya que no se detallan aqui sus condiciones.
- Repositorio con muy poca traccion (25 descargas y 0 likes en el momento de la consulta): no hay validacion de la comunidad ni resultados de evaluacion publicados.
- Contexto largo: aunque la ventana declarada es de 128K tokens, no se especifica en la informacion disponible como se comporta la calidad en los extremos de esa ventana tras el ajuste SFT.
- Fechas de creacion y actualizacion del repositorio (2026-10-02) posteriores al conocimiento del autor, sin verificacion independiente disponible.

## Enlaces

- Repositorio GGUF imatrix: https://huggingface.co/mradermacher/LFM2.5-2.6B-opencode-SFT-i1-GGUF
- Repositorio GGUF estatico: https://huggingface.co/mradermacher/LFM2.5-2.6B-opencode-SFT-GGUF
- Modelo base sin cuantizar: https://huggingface.co/FineEnvs/LFM2.5-2.6B-opencode-SFT
- Dataset de ajuste: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-multiharness-sft
- Documentacion de Liquid AI sobre LFM2.5-2.6B: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Variante GGUF imatrix del LFM2.5-2.6B base: https://huggingface.co/mradermacher/LFM2.5-2.6B-i1-GGUF
- Pagina de resumen de descargas del autor: https://hf.tst.eu/model#LFM2.5-2.6B-opencode-SFT-i1-GGUF
- Guia de uso de GGUF de referencia: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
