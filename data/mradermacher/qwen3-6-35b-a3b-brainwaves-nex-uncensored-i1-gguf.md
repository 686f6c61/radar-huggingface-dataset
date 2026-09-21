# mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF en formato i1 (imatrix) del modelo nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored, realizadas por mradermacher. No se trata por tanto de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia local de un modelo base de 35.505.251.456 parámetros (35,5 B) cuyo nombre sigue la convención de mezcla de expertos "A3B", lo que sugiere del orden de 3.000 millones de parámetros activos por token, aunque la model card no confirma ese dato de forma explícita. El modelo base procede de la comunidad (nightmedia) y se presenta como un ajuste de tipo "uncensored" sobre una arquitectura de la familia Qwen3.x, con etiquetas que apuntan a destilación, chain-of-thought largo, SFT con LoRA, fusión mediante mergekit y soporte multimodal.

La relevancia práctica de este repositorio es doble. Por un lado, ofrece el modelo en cuantizaciones que van de 13,3 GB (i1-Q2_K) a 29,3 GB (i1-Q6_K), lo que permite ejecutarlo en GPU de consumo con compromisos claros de calidad. Por otro, al tratarse de un modelo de mezcla de expertos con pocos parámetros activos, el coste de cómputo por token es notablemente inferior al de un transformer denso del mismo tamaño total, lo que lo hace atractivo para despliegue en una sola máquina. La licencia declarada es Apache-2.0 y los idiomas soportados son inglés, chino, japonés y español.

Conviene señalar que el repositorio tiene un volumen de adopción muy bajo en el momento de redactar esta ficha (90 descargas y 1 "like") y que fue publicado el 21 de septiembre de 2026, por lo que no existe evidencia pública de validación independiente de su calidad. Además, la búsqueda web realizada no ha devuelto ninguna fuente relevante sobre el modelo: los resultados obtenidos corresponden a contenidos musicales sin relación alguna.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; por nomenclatura y etiquetas, mezcla de expertos (MoE) de la familia Qwen3.x |
| Parametros totales | 35.505.251.456 (35,5 B), dato real de safetensors |
| Parametros activos | No confirmado; la nomenclatura "A3B" del nombre sugiere ~3 B activos por token |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1 (imatrix): Q2_K, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K. Existe tambien un repositorio de cuantizaciones estaticas |
| Idiomas soportados | Inglés (en), chino (zh), japonés (ja), español (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base; etiquetas del ecosistema MLX (mxfp8, mxfp4) |
| Tamano del repositorio | 279,2 GB |
| Pipeline | text-generation |
| Modelo base | nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored |
| Cuantizador | mradermacher |
| Descargas / likes | 90 / 1 |
| Fecha de creacion / actualizacion | 21 de septiembre de 2026 / 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base. Las etiquetas del repositorio (qwen3_5, qwen3_6, qwen, qwen3.5, qwen3.6) y la nomenclatura del nombre permiten inferir que se trata de un transformer de mezcla de expertos de la familia Qwen3.x con 35,5 B de parámetros totales y, presumiblemente, unos 3 B activos por token. Las etiquetas "merge", "mergekit", "fable" y "Deckard(qx)" indican que el modelo base es el resultado de una fusión de modelos mediante mergekit, probablemente sobre un ajuste previo denominado Brainwaves-Nex.

En cuanto al entrenamiento, las etiquetas mencionan "distillation", "reasoning", "chain-of-thought", "long-cot", "sft", "lora" e "instruction-tuned", lo que apunta a un ajuste supervisado con LoRA sobre datos de razonamiento de cadena de pensamiento larga, posiblemente destilados de un modelo mayor. No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación adicionales como RLHF o DPO. Tampoco se documenta ninguna innovación arquitectónica específica (atención lineal, decodificación especulativa, etc.) más allá de lo que corresponde a la familia Qwen3.x. La model card del repositorio de cuantización es puramente mecánica: se limita a listar los ficheros generados, indicar que las cuantizaciones son ponderadas con imatrix y advertir de que el modelo base tiene capacidades de visión, cuyos ficheros mmproj, si existen, residen en el repositorio de cuantizaciones estáticas.

## Capacidades

- Generación de texto conversacional e instruccional, con ajuste específico para seguir instrucciones.
- Razonamiento explícito con cadenas de pensamiento largas (long-CoT), según las etiquetas "reasoning", "chain-of-thought" y "long-cot".
- Matemáticas y disciplinas STEM, según las etiquetas "math" y "stem".
- Generación y asistencia en código, según la etiqueta "coding".
- Capacidades multilingües en inglés, chino, japonés y español.
- Comportamiento orientado a reducir rechazos ("uncensored"), según la denominación del modelo base. No hay documentación técnica sobre cómo se consigue ni con qué alcance.
- Posible soporte de visión: la model card de mradermacher afirma explícitamente que el modelo es de visión y que los ficheros mmproj, si los hay, están en el repositorio estático.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada, aunque el razonamiento largo es una etiqueta declarada.
- Modo "thinking" explícito y separación de bloques de razonamiento: no disponible en la información proporcionada.

## Casos de uso

- Asistencia en programación sobre repositorios locales: con cuantizaciones i1-Q4_K_M de 21,8 GB el modelo cabe en una GPU de 24 GB y puede usarse como copiloto en el editor mediante llama.cpp u Ollama, sin enviar código a servicios externos.
- Razonamiento matemático y resolución de problemas STEM: las etiquetas de long-CoT y math sugieren utilidad en la generación de soluciones paso a paso, verificables manualmente, para problemas de nivel universitario.
- Traducción y atención multilingüe entre inglés, chino, japonés y español: útil en equipos distribuidos o en el tratamiento de documentación técnica en esos cuatro idiomas, sin necesidad de modelos separados por lengua.
- Procesamiento por lotes en una sola máquina con GPU de consumo: al ser MoE con pocos parámetros activos, el coste por token es bajo incluso con cuantizaciones grandes, lo que permite ejecutar tareas de generación masiva (resúmenes, clasificación, reescritura) de forma económicamente viable.
- Experimentación en investigación sobre alineación y comportamiento "uncensored": el modelo permite estudiar cómo se comporta un ajuste orientado a reducir rechazos en dominios sensibles, siempre dentro de los límites legales aplicables.
- Despliegue de un asistente conversacional interno autoalojado: con licencia Apache-2.0 y pesos GGUF, una organización puede servirlo en su propia infraestructura sin dependencia de API externas.
- Análisis de documentos e imágenes, si se confirma el soporte de visión: la model card indica que es un modelo de visión y remite a los ficheros mmproj del repositorio estático, lo que habilitaría tareas de descripción de imágenes o extracción de información de capturas y diagramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y la búsqueda web realizada no ha devuelto fuentes relevantes sobre este modelo. Cualquier cifra de rendimiento que se atribuya a este modelo debe proceder de una evaluación propia.

## Requisitos de hardware

Los tamaños de fichero son datos reales de la model card del cuantizador; las estimaciones de VRAM que se dan a continuación son orientativas y añaden al peso de los pesos el espacio para caché KV y sobrecarga del runtime, que depende de la longitud de contexto efectiva.

- VRAM estimada para inferencia (solo pesos, según cuantización):
  - i1-Q2_K: 13,3 GB
  - i1-Q3_K_S: 15,6 GB
  - i1-IQ3_S: 15,7 GB
  - i1-IQ3_M: 15,9 GB
  - i1-Q3_K_M: 17,3 GB
  - i1-Q3_K_L: 18,7 GB
  - i1-IQ4_XS: 19,3 GB
  - i1-Q4_0: 20,4 GB
  - i1-Q4_K_S: 20,5 GB
  - i1-Q4_K_M: 21,8 GB
  - i1-Q4_1: 22,5 GB
  - i1-Q5_K_S: 24,7 GB
  - i1-Q5_K_M: 25,4 GB
  - i1-Q6_K: 29,3 GB
- GPU recomendadas: para i1-Q4_K_M o inferiores, una RTX 3090 o RTX 4090 de 24 GB es suficiente para los pesos, con margen limitado para contexto. Para i1-Q5_K_* y i1-Q6_K conviene una GPU de 32 GB o más (A100 40 GB, A6000, H100) o repartir el modelo entre dos GPU de 24 GB.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB con las cuantizaciones Q2/Q3 (asumiendo contexto corto) y en tarjetas de 24 GB con Q4. El repositorio incluye un fichero imatrix de 0,3 GB para generar cuantizaciones propias.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y el resto del ecosistema GGUF. Para el modelo base en safetensors se puede usar vLLM o TGI; vLLM solo soporta GGUF de forma parcial, por lo que para el formato cuantizado lo natural es llama.cpp. Las etiquetas del ecosistema MLX (mxfp8, mxfp4, mlx) apuntan a que existen versiones utilizables en Apple Silicon.
- Latencia y throughput estimados: no disponibles. No obstante, al tratarse de una arquitectura MoE con aproximadamente 3 B de parámetros activos por token, el coste de cómputo por token debería ser sustancialmente inferior al de un transformer denso de 35 B, lo que favorece la inferencia con parte de los expertos en CPU.

## Comparativa con modelos similares

Los datos de esta tabla proceden de información pública general sobre los modelos comparados, no de la información proporcionada en esta ficha, y deben verificarse en sus repositorios oficiales antes de tomar decisiones. Para el modelo objeto de la ficha, varios campos figuran como no disponibles porque su model card no los documenta.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored (i1 GGUF) | 35,5 B | No confirmado (~3 B por nomenclatura) | No disponible | Apache-2.0 | GGUF, safetensors | No publicados |
| Qwen3-30B-A3B | 30,5 B (dato público) | 3,3 B (dato público) | 128 K (dato público) | Apache-2.0 (dato público) | safetensors, GGUF | Publicados por el autor original |
| Modelo denso de ~32 B de la familia Qwen3 | ~32 B (dato público) | No aplica | 128 K (dato público) | Apache-2.0 (dato público) | safetensors, GGUF | Publicados por el autor original |
| Mixtral 8x7B | 46,7 B (dato público) | 12,9 B (dato público) | 32 K (dato público) | Apache-2.0 (dato público) | safetensors, GGUF | Publicados por el autor original |

La ventaja diferencial de este repositorio no está en los benchmarks, que no existen, sino en la disponibilidad de cuantizaciones imatrix de un modelo que, por su naturaleza de fusión y ajuste "uncensored", no suele distribuirse en formatos optimizados para inferencia local.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks publicados ni validación independiente. El modelo no debería desplegarse en producción sin una batería de pruebas propia.
- Sesgos conocidos: no hay documentación al respecto. Al ser una fusión de modelos de la familia Qwen, es previsible que arrastre sesgos de sus componentes y del corpus de entrenamiento, con un sesgo adicional hacia el inglés y el chino en el reparto de idiomas.
- Riesgo de alucinación: no cuantificado en la información disponible. El ajuste orientado al razonamiento largo no elimina el riesgo, y las cadenas de pensamiento extensas pueden presentar una confianza aparente que no se corresponde con la corrección del resultado.
- Naturaleza "uncensored": el modelo está explícitamente orientado a reducir rechazos. Esto implica un riesgo elevado de generar contenido inapropiado, sesgado o dañino, y traslada al operador toda la responsabilidad sobre filtrado y moderación. No debe exponerse directamente al público sin capas de salvaguarda.
- Trazabilidad limitada: se trata de una fusión comunitaria redistribuida por un tercero. La model card no documenta datos de entrenamiento, metodología de alineación ni composición de la fusión, lo que dificulta auditar su comportamiento.
- Licencia: Apache-2.0 permite uso comercial, pero el cuantizador no ofrece garantías y el modelo base es de origen comunitario. Conviene revisar también las condiciones del modelo base y de sus componentes.
- Limitaciones de contexto: la longitud de contexto no está documentada. Cualquier despliegue con contexto largo debe validarse empíricamente, ya que las cuantizaciones agresivas (Q2, Q3) degradan especialmente la calidad con ventanas extensas.
- Idiomas: solo se declaran inglés, chino, japonés y español. No hay soporte declarado para otras lenguas, y el rendimiento en español no está evaluado.
- Degradación por cuantización: las cuantizaciones por debajo de Q4 pierden calidad de forma perceptible. El propio cuantizador advierte que IQ3_XXS es probablemente mejor que Q2_K y que IQ3_S supera a los Q3_K equivalentes en tamaño.
- Estado experimental: las etiquetas incluyen "experimental", lo que refuerza la recomendación de no usarlo en entornos críticos sin validación previa.

## Enlaces

- Repositorio de cuantizaciones i1 (objeto de esta ficha): https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored
- Cuantizaciones estáticas del mismo modelo (incluye, si existen, los ficheros mmproj para visión): https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored-GGUF
- Fichero imatrix para generar cuantizaciones propias: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored-i1-GGUF/resolve/main/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored.imatrix.gguf
- Página resumen del cuantizador para este modelo: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored-i1-GGUF
- Preguntas frecuentes y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF (README de TheBloke, referenciado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad entre cuantizaciones (ikawrakow, embebida en la model card): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa que financia el trabajo de cuantización: https://www.nethype.de/
- Nota: la búsqueda web realizada no devolvió ninguna fuente relevante sobre este modelo. Los resultados obtenidos correspondían a contenidos musicales sin relación con el modelo. No se han localizado papers, blogs ni demostraciones asociadas.
