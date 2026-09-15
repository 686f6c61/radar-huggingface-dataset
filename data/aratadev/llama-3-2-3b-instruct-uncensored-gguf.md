# aratadev/Llama-3.2-3B-Instruct-uncensored-GGUF

## Resumen

El repositorio aratadev/Llama-3.2-3B-Instruct-uncensored-GGUF contiene una recopilación de cuantizaciones en formato GGUF del modelo chuanli11/Llama-3.2-3B-Instruct-uncensored, una variante del modelo Llama-3.2-3B-Instruct de Meta a la que se le ha eliminado la capa de alineación de seguridad (de ahí la etiqueta "uncensored"). El autor del repositorio es el usuario aratadev, aunque la model card reproduce literalmente el texto de cuantización generado por bartowski, que es quien firma el proceso de cuantización con llama.cpp (release b3972) e imatrix.

Se trata de un modelo denso, decoder-only, de tipo transformer, con 3.606.752.320 parámetros según el recuento de safetensors del modelo base. Al estar distribuido únicamente en GGUF, su propósito es la inferencia local y en CPU/GPU de gama baja: los ficheros van desde 1,88 GB (Q2_K_L) hasta 7,22 GB (f16), lo que permite ejecutarlo en equipos de consumo sin acelerador dedicado. El repositorio ocupa 57,4 GB porque acumula todas las variantes de cuantización en la misma rama, no porque el modelo tenga ese tamaño.

Su relevancia es acotada y conviene ser explícito: la ficha de HuggingFace no declara licencia ni idiomas soportados, no se han publicado benchmarks en la información disponible y el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta. Es, por tanto, un artefacto de interés para experimentación con modelos sin filtros de contenido, investigación sobre alineación y pruebas de despliegue en local, no una opción recomendada para producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, denso (arquitectura Llama 3.2 de Meta; derivado de Llama-3.2-3B-Instruct) |
| Parametros totales | 3.606.752.320 (recuento de safetensors del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens segun la arquitectura Llama 3.2; no se especifica en la model card del repositorio |
| Tipos de cuantizacion | f16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, Q4_K_S, Q4_0, IQ4_XS, Q3_K_XL, Q3_K_L, Q2_K_L, Q4_0_8_8, Q4_0_4_8, Q4_0_4_4 (cuantizacion con imatrix) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la ficha de HuggingFace; al derivar de Llama 3.2 de Meta es previsible que aplique la Llama 3.2 Community License, pero no esta confirmado |
| Formato de pesos | GGUF (las cuantizaciones de este repo); safetensors en el modelo base chuanli11/Llama-3.2-3B-Instruct-uncensored |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B: un transformer decoder-only con atención por grupos (GQA), codificación posicional rotatoria (RoPE) y tokenizador de Llama 3 con un vocabulario amplio. El recuento de parámetros declarado (3.606.752.320) es superior al de Llama-3.2-3B-Instruct original, lo que apunta a modificaciones introducidas durante el ajuste del modelo "uncensored" (por ejemplo, ampliación del vocabulario o de la matriz de salida), aunque la información disponible no detalla en qué consisten esos cambios.

Sobre el entrenamiento no hay datos en la información proporcionada: no se indica el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o cualquier otra técnica de alineación. Lo único verificable es el proceso de cuantización: las versiones GGUF se generaron con llama.cpp release b3972 usando la opción imatrix con un dataset publicado por bartowski, lo que permite cuantizaciones de 4 y 3 bits con una pérdida de calidad menor que la cuantización estándar. El modelo mantiene la plantilla de chat de Llama 3.2 (`<|begin_of_text|>`, `<|start_header_id|>`, `<|eot_id|>`), con cabeceras de sistema, usuario y asistente, y una fecha de conocimiento de referencia de diciembre de 2023.

## Capacidades

- Generación de texto conversacional multi-turno siguiendo la plantilla de chat de Llama 3.2.
- Instrucciones y respuestas a preguntas con un grado de moderación de contenido muy reducido respecto al modelo original (comportamiento "uncensored").
- Razonamiento básico y tareas de conocimiento general propias de un modelo de 3B, sin capacidades de razonamiento extendido ni modo "thinking".
- Generación de código a nivel introductorio y de fragmentos cortos; no está orientado a repositorios completos.
- Aritmética y problemas matemáticos sencillos; el rendimiento en tareas de varios pasos no está documentado.
- Capacidades multilingües: no disponibles en la información proporcionada (Llama 3.2 está entrenado mayoritariamente en inglés, pero no se confirma para este fine-tune).
- Sin soporte declarado de tool calling ni function calling en la model card.
- Sin soporte declarado de agentes, uso de herramientas externas o razonamiento multi-paso.
- Sin capacidades de visión, audio u otras modalidades.
- Compatible con endpoints de HuggingFace (etiqueta `endpoints_compatible`) y con el pipeline `text-generation`.

## Casos de uso

- Experimentación con modelos sin filtros de contenido: el modelo permite estudiar cómo se comporta un transformer de 3B cuando se elimina la capa de alineación, útil en investigación sobre seguridad y alineación.
- Red teaming y evaluación de riesgos: sirve como sujeto de prueba para medir la eficacia de clasificadores de contenido, filtros de salida y guardarraíles en pipelines propios.
- Generación de ficción y narrativa con temáticas que los modelos alineados rechazan habitualmente, ejecutada en local y sin enviar datos a servicios en la nube.
- Generación de datos sintéticos para experimentos internos de ajuste o para ampliar datasets de evaluación, siempre con revisión humana posterior.
- Asistente conversacional local en portátiles: con Q4_K_M (2,24 GB) cabe en equipos con 8 GB de RAM y funciona con llama.cpp, LM Studio u Ollama, sin GPU dedicada.
- Despliegue en dispositivos ARM y edge computing: las cuantizaciones Q4_0_4_4, Q4_0_4_8 y Q4_0_8_8 (2,14 GB cada una) están optimizadas para chips ARM con soporte i8mm o SVE, pensadas para inferencia en Raspberry Pi, móviles o placas embebidas.
- Prototipado rápido de aplicaciones de chat: al ser un GGUF de 2-3 GB, permite iterar sobre la interfaz y el prompt antes de decidir si se migra a un modelo mayor.
- Tareas de resumen y extracción de información en documentos de longitud media, aprovechando la ventana de contexto de la arquitectura Llama 3.2 si el motor de inferencia la soporta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y la búsqueda web realizada no ha devuelto resultados de evaluación asociados a este modelo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (solo pesos, sin contar caché KV):
  - f16 (7,22 GB): ~8 GB.
  - Q8_0 (3,84 GB): ~5 GB.
  - Q6_K_L / Q6_K (3,16 / 2,97 GB): ~4,5 GB.
  - Q5_K_L / Q5_K_M / Q5_K_S (2,84 / 2,59 / 2,54 GB): ~3,5-4 GB.
  - Q4_K_L / Q4_K_M / Q4_K_S / Q4_0 / IQ4_XS (2,53 / 2,24 / 2,15 / 2,14 / 2,04 GB): ~3-3,5 GB.
  - Q3_K_XL / Q3_K_L / Q2_K_L (2,33 / 1,98 / 1,88 GB): ~2,5-3 GB.
- Estas cifras son estimaciones a partir del tamaño de fichero indicado por el autor; la caché KV crece con la longitud de contexto y puede añadir varios GB en contextos largos.
- Cabe en GPU de consumo sin problema: cualquier tarjeta con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070 y superiores) ejecuta las cuantizaciones de 4-5 bits con contexto amplio. En tarjetas de 4 GB conviene bajar a Q3 o Q2.
- GPU de datacenter (A100, H100) no tienen sentido económico para un modelo de este tamaño; el cuello de botella sería la latencia, no la memoria.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama, text-generation-webui, Jan, koboldcpp y cualquier runtime compatible con GGUF. Para servir la versión hf (transformers) se necesitaría el modelo base en safetensors, no estos ficheros.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo para ninguna de las cuantizaciones.
- Nota operativa: el repositorio pesa 57,4 GB porque todas las cuantizaciones están en la misma rama. Conviene descargar únicamente el fichero concreto que se vaya a usar y no clonar el repositorio completo.

## Comparativa con modelos similares

Los datos de los modelos de comparación provienen de documentación pública y no de la información proporcionada en esta búsqueda; no se dispone de comparaciones de rendimiento medidas.

| Modelo | Parametros | Contexto | Licencia declarada | Formatos | Notas |
|---|---|---|---|---|---|
| aratadev/Llama-3.2-3B-Instruct-uncensored-GGUF | 3,6 B | no confirmado en la ficha (arquitectura Llama 3.2: 128.000) | no disponible | GGUF | Cuantizaciones imatrix; sin alineación de seguridad; 0 descargas registradas |
| chuanli11/Llama-3.2-3B-Instruct-uncensored | 3,6 B | igual que el anterior | no disponible | safetensors | Modelo base en precisión completa, origen de estas cuantizaciones |
| meta-llama/Llama-3.2-3B-Instruct | ~3,2 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Modelo original alineado con RLHF; ecosistema y soporte amplios |
| Qwen2.5-3B-Instruct | ~3,1 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa con licencia permisiva y buen rendimiento en código y matemáticas |
| Phi-3.5-mini-instruct | ~3,8 B | 128.000 tokens | MIT | safetensors, GGUF | Enfocado a razonamiento; requiere menos VRAM en cuantizaciones de 4 bits |

## Limitaciones y advertencias

- El modelo ha sido desprovisto deliberadamente de las capas de alineación de seguridad del Llama 3.2 original: puede generar contenido ofensivo, ilegal, peligroso o sexualmente explícito, y no incorpora mecanismos propios de rechazo.
- Riesgo elevado de alucinación: con 3,6 B de parámetros, la precisión factual en preguntas abiertas es limitada y no hay benchmarks que la cuantifiquen.
- Licencia no declarada en la ficha de HuggingFace. Al derivar de Llama 3.2, es previsible que se apliquen los términos de la Llama 3.2 Community License de Meta (incluidas las cláusulas de uso aceptable y las obligaciones de atribución), pero no está confirmado por el autor. Antes de cualquier uso comercial hay que verificar la licencia del modelo base chuanli11/Llama-3.2-3B-Instruct-uncensored y del propio Llama 3.2.
- Idiomas soportados no declarados; el entrenamiento de Llama 3.2 está sesgado hacia el inglés y el rendimiento en castellano u otras lenguas no está documentado.
- Limitación de contexto: aunque la arquitectura Llama 3.2 admite 128.000 tokens, no se confirma que este fine-tune conserve esa ventana ni que los runtimes GGUF la soporten con memoria disponible.
- Sin soporte declarado de tool calling, function calling ni flujos de agentes, lo que limita su integración en pipelines automatizados.
- Adopción nula: 0 descargas y 0 "likes" en la fecha de consulta, sin issues ni discusiones que permitan contrastar calidad o problemas conocidos.
- Los ficheros con fechas de creación y actualización de 2026-09-15 sugieren un artefacto reciente y sin mantenimiento verificado.
- Uso responsable: no debe emplearse en atención al cliente, educación, salud ni ningún contexto de cara al público sin filtros externos y revisión humana.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aratadev/Llama-3.2-3B-Instruct-uncensored-GGUF
- Modelo base (safetensors): https://huggingface.co/chuanli11/Llama-3.2-3B-Instruct-uncensored
- Repositorio GGUF original de bartowski citado en la model card: https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-uncensored-GGUF
- llama.cpp, release b3972 usada para la cuantización: https://github.com/ggerganov/llama.cpp/releases/tag/b3972
- Dataset empleado para la cuantización imatrix: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
- LM Studio, runtime recomendado en la model card: https://lmstudio.ai/
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- La búsqueda web realizada no ha devuelto ningún enlace relevante sobre este modelo: los resultados obtenidos (repositorios de jailbreaks, GitHub Copilot, GitHub Desktop y discusiones en Zhihu) no guardan relación con el artefacto analizado.
