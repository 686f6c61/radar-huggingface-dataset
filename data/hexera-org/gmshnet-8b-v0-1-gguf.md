# hexera-org/GmshNet-8B-v0.1-GGUF

## Resumen

GmshNet-8B-v0.1 es un modelo de lenguaje de 7.615.616.512 parámetros (etiquetado comercialmente como 8B) desarrollado por hexera-org y especializado en la generación de código para mallado y preprocesado de simulación numérica. Su ámbito declarado es muy concreto: el ecosistema Gmsh (versiones 4.x), la API de Python de Gmsh, OpenCASCADE, la generación de archivos `.geo`, y el preprocesado de flujos de trabajo CAE, FEM/FEA y CFD. Se distribuye en formato GGUF bajo licencia Apache-2.0 y con soporte de idioma declarado únicamente para inglés.

El problema que aborda es la parte más tediosa y propensa a errores de la cadena de simulación: construir geometría paramétrica, definir physical groups, configurar size fields (distance, threshold, background), refinar localmente, generar capas límite (inflation layers), recombinar mallas y validar calidad de elementos (aspect ratio, skewness). Frente a un modelo de código generalista, aquí el entrenamiento se orienta a vocabulario y patrones de dominio: discretización, elementos finitos, volúmenes finitos, condiciones de contorno, estudios de independencia de malla y esquemas de convergencia.

Según las etiquetas de su model card, se trata de un transformer decoder-only causal y autorregresivo, ajustado por instrucciones y orientado a razonamiento técnico, matemático y de ingeniería. No hay información pública sobre la longitud de contexto, el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación. La distribución se limita a pesos cuantizados en GGUF, con un repositorio de 105,8 GB que sugiere varias variantes de cuantización, aunque la model card no detalla cuáles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, causal y autorregresivo, ajustado por instrucciones (según etiquetas de la model card) |
| Parametros totales | 7.615.616.512 (7,62B) |
| Parametros activos | No aplica: no se declara arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; el repositorio (105,8 GB) contiene varias variantes GGUF, pero no se detallan los niveles concretos |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado); las etiquetas mencionan pytorch y transformers, pero el repositorio distribuido es GGUF |
| Pipeline | text-generation |
| Libreria declarada | gguf |
| DOI | 10.57967/hf/9190 |
| Descargas | 2.299 |
| Likes | 2 |
| Fecha de creacion | 2026-06-10 |
| Ultima actualizacion | 2026-09-12 |
| Tamano del repositorio | 105,8 GB |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un transformer decoder-only de tipo causal, autorregresivo y ajustado por instrucciones, con 7.615.616.512 parámetros. No se especifican el número de capas, el número de cabezas de atención, el tipo de atención (completa, lineal, sliding window), la función de activación, ni si se emplearon embeddings atados. Tampoco se indica si hay innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas SSM-transformer.

No hay datos públicos sobre el volumen de tokens de entrenamiento, la composición del dataset (proporción de código Gmsh, scripts de Python, documentación de OpenCASCADE, literatura de métodos numéricos, etc.), ni sobre el pipeline de alineación (RLHF, DPO, SFT). El conjunto de etiquetas sugiere un enfoque de especialización de dominio intensivo en torno a Gmsh, mallado, geometría computacional, FEM, FVM, CFD y transferencia de calor, pero se desconoce si parte de un modelo base preentrenado y cuál es ese base. Tampoco se documenta el proceso de cuantización aplicado para generar los ficheros GGUF.

## Capacidades

- Generación de código: scripts de Python para la API de Gmsh, archivos `.geo`, órdenes de la línea de comandos de Gmsh y flujos de trabajo de preprocesado.
- Generación de geometría: geometría paramétrica, modelado procedural, constructive solid geometry (CSG), operaciones booleanas y manejo de kernels OpenCASCADE (OCC) frente a kernel integrado.
- Mallado 2D y 3D: mallas triangulares, cuadriláteras, tetraédricas, hexaédricas, prismáticas y piramidales; mallas estructuradas, no estructuradas e híbridas; mallas de superficie y de volumen.
- Refinamiento y control de tamaño: size fields, distance field, threshold field, background field, refinamiento local, adaptativo (AMR), por curvatura y por características geométricas.
- Capas límite: generación de boundary layer, inflation layers y mallas near-wall.
- Recombinação y mallado transfinite: recombination, transfinite meshing, algoritmos Delaunay frontal y advancing front.
- Calidad y reparación de malla: análisis de calidad, suavizado, optimización, reparación, limpieza y validación; métricas como aspect ratio y skewness.
- Physical groups: definición de superficies, volúmenes, curvas y fronteras físicas.
- Razonamiento técnico y matemático: resolución de problemas de discretización, condiciones de frontera, problemas de valor inicial y de contorno, estimación de error y estudios de convergencia e independencia de malla.
- Ajuste por instrucciones: orientado a tareas de tipo asistente de programación y copiloto de ingeniería.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no hay documentación explícita; las etiquetas mencionan razonamiento estructurado y resolución de problemas, pero sin detalles de implementación de agentes.
- Multilingüismo: solo inglés declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Generación automática de archivos `.geo` a partir de descripciones de geometría: el modelo traduce una especificación en lenguaje natural (dimensiones, taladros, chaflanes, dominios) a un script `.geo` válido con puntos, líneas, superficies, volúmenes y physical groups, reduciendo el tiempo de preparación de modelos en estudios paramétricos.
- Scripts de Python para la API de Gmsh en pipelines de automatización: encaja en flujos de preprocesado que necesitan generar mallas de forma programática dentro de un proceso mayor de simulación, con llamadas a `gmsh.model`, `gmsh.mesh` y `gmsh.initialize/finalize`.
- Definición de campos de tamaño y refinamiento: resulta adecuado para tareas repetitivas como configurar un campo distancia alrededor de un perfil aerodinámico, un campo umbral sobre una superficie o un background field a partir de una malla previa, donde el vocabulario de dominio importa más que el razonamiento general.
- Mallado de capas límite para CFD: es el escenario típico de external e internal aerodynamics, donde el modelo puede proponer grosor de primera capa, ratio de crecimiento y número de capas en función del número de Reynolds indicado por el usuario.
- Reparación y validación de mallas de calidad deficiente: análisis de elementos con skewness o aspect ratio elevados, propuesta de operaciones de suavizado, recombinación o remallado local antes de enviar el caso al solver.
- Estudio de independencia de malla: generación de familias de mallas con distintos niveles de refinamiento a partir de un script base, para automatizar el barrido y el análisis de convergencia.
- Asistencia en el aula o en formación interna de ingeniería: explicación de por qué falla una malla, qué significa un physical group mal definido o cómo se relaciona la discretización con el error numérico, como complemento a la documentación oficial.
- Migración entre kernels de geometría: ayuda a reescribir scripts que usan el kernel integrado para que funcionen con OpenCASCADE (o al contrario), un cambio con implicaciones en la topología disponible.
- Copiloto de codificación en el IDE para equipos CAE: autocompletado y generación de fragmentos de código de preprocesado específicos del dominio, donde un modelo de código generalista suele producir API inventada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card proporcionada no incluye métricas de MMLU, HumanEval, GSM8K, MBPP, LiveCodeBench ni ninguna evaluación específica de generación de código Gmsh, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (7,62B). No hay mediciones publicadas de latencia ni de throughput para este modelo.

- VRAM estimada para inferencia, solo pesos (valores aproximados):
  - FP16/BF16: ~15,2 GB; con overhead de contexto y caché KV, ~17-19 GB.
  - Q8_0: ~8,1 GB.
  - Q6_K: ~6,3 GB.
  - Q5_K_M: ~5,4 GB.
  - Q4_K_M: ~4,7 GB.
  - Q3_K_M: ~3,8 GB.
  - Q2_K: ~2,9 GB (pérdida de calidad apreciable en generación de código).
- GPU recomendadas:
  - A100 40/80 GB, H100 80 GB: FP16 sin problemas y con margen para contextos largos o varios usuarios concurrentes.
  - L40S 48 GB, RTX 6000 Ada 48 GB, A6000 48 GB: FP16 y todas las cuantizaciones.
  - RTX 4090 24 GB, RTX 3090 24 GB: FP16 ajustado; Q8_0 y Q6_K con holgura.
  - RTX 4080 16 GB: FP16 al límite; recomendable Q8_0 o inferior.
- Cabe en GPU de consumo:
  - 24 GB (4090, 3090): sí, incluso en FP16 con contexto moderado.
  - 16 GB (4080, 4070 Ti Super): sí en Q8_0 o inferior.
  - 12 GB (3060, 4070): sí en Q5_K_M o Q4_K_M.
  - 8 GB (3070, 4060): sí en Q4_K_M o Q3_K_M con contexto reducido.
  - 6 GB: solo con cuantizaciones muy agresivas (Q2_K/Q3_K_M) y contexto corto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores compatibles con la API de OpenAI sobre GGUF. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que para esos motores habría que partir de los pesos en safetensors, no incluidos en este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token en ninguna configuración de hardware.

## Comparativa con modelos similares

No existe una comparación de benchmarks publicada entre GmshNet-8B-v0.1 y otras alternativas, por lo que la tabla siguiente recoge únicamente datos de ficha técnica de modelos de tamaño y categoría comparables, extraídos de sus respectivas model cards públicas.

| Modelo | Parametros | Contexto | Licencia | Formatos | Enfoque |
|---|---|---|---|---|---|
| GmshNet-8B-v0.1 | 7,62B | No disponible | Apache-2.0 | GGUF | Mallado, Gmsh y preprocesado CAE |
| Qwen2.5-Coder-7B-Instruct | 7,62B | 32.768 tokens nativos | Apache-2.0 | safetensors, GGUF, AWQ | Código generalista |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7B totales / 2,4B activos (MoE) | 128.000 tokens | Licencia propia de DeepSeek (uso comercial permitido con condiciones) | safetensors, GGUF | Código generalista |
| Llama 3.1 8B Instruct | 8,03B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Propósito general |

Diferencias relevantes: GmshNet-8B-v0.1 es el único de los cuatro especializado explícitamente en mallado y preprocesado CAE, lo que debería traducirse en mayor precisión en la API de Gmsh y menor tasa de alucinación de funciones en ese dominio concreto. A cambio, es también el único cuya longitud de contexto se desconoce, el único distribuido exclusivamente en GGUF y el único con soporte declarado de un solo idioma. Los tres alternativos tienen un alcance mucho más amplio y, previsiblemente, mejor rendimiento en tareas de código fuera del nicho de simulación, pero no hay datos objetivos que permitan cuantificar esa diferencia.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluación de sesgos, toxicidad o representación.
- Riesgo de alucinación: alto en cualquier API que el modelo no haya visto con suficiente frecuencia. En Gmsh, la confusión entre el kernel integrado y OpenCASCADE, entre versiones 4.x y anteriores, o entre nombres de opciones de mallado es un modo de fallo esperable. Todo script generado debe validarse ejecutándolo en una versión concreta de Gmsh antes de incorporarlo a producción.
- Idiomas: solo inglés declarado. El uso en castellano no está soportado y probablemente degrade la calidad del código generado y de las explicaciones.
- Longitud de contexto desconocida: no se puede planificar el uso con geometrías o scripts largos sin medir previamente el límite real del modelo en la práctica.
- Licencia: Apache-2.0, permisiva y apta para uso comercial, con obligación de conservar el aviso de licencia y el fichero de cambios si se redistribuye. No hay cláusulas de uso aceptable adicionales documentadas en la información disponible.
- Distribución solo en GGUF: no hay pesos en safetensors en este repositorio, lo que limita el ajuste fino y el despliegue en motores que no consumen GGUF. Cualquier cuantización por debajo de Q4 introduce pérdida de precisión que en generación de código se manifiesta como errores de sintaxis y nombres de función inventados.
- Origen de los datos de entrenamiento no documentado: se desconoce si el corpus incluye código bajo licencias restrictivas, lo que es un riesgo de compliance para uso corporativo.
- Modelo con 2 likes y 2.299 descargas en el momento de los datos: comunidad pequeña, poca validación independiente y bajo número de informes de errores públicos.
- Ausencia de benchmarks: no se puede verificar ninguna afirmación de rendimiento de la model card frente a alternativas generalistas.
- La información de búsqueda web recuperada no contenía ningún resultado relacionado con el modelo, por lo que no ha sido posible contrastar ni ampliar los datos de la model card.

## Enlaces

- HuggingFace: https://huggingface.co/hexera-org/GmshNet-8B-v0.1-GGUF
- DOI: 10.57967/hf/9190
- Papers, blogs, repositorios o demos adicionales: no disponible. La búsqueda web realizada no devolvió ningún enlace relevante sobre el modelo o su dominio.
