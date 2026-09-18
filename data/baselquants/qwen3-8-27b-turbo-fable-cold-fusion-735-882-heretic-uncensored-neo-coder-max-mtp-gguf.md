# baselquants/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones GGUF del modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, publicadas por el usuario baselquants. Se trata de un fine tune multi-etapa del denominado Qwen3.8 27B, con aproximadamente 26.900 millones de parámetros (26.895.998.464 según los pesos en safetensors del modelo base), orientado a razonamiento, generación de código y escritura creativa, y presentado por su autor como un modelo "uncensored" o "abliterated", es decir, con los mecanismos de rechazo suavizados o eliminados.

El interés técnico del modelo reside en dos elementos. El primero es la reducción del número de tokens de "thinking": el autor afirma que la versión TURBO recorta el bloque de razonamiento entre la mitad y una décima parte respecto al Qwen3.8 27B original, con una mediana cercana a dos tercios, manteniendo el detalle de la respuesta. El segundo es la incorporación de variantes de cuantización MTP (multi-token prediction) además de las cuantizaciones GGUF convencionales, junto con imatrix dual ("DI-MATRIX"), con el objetivo de acelerar la generación de tokens en hardware de consumo.

La relevancia del repositorio es fundamentalmente práctica: agrupa cuantizaciones del modelo en un único espacio con un tamaño de repositorio de 389 GB, de modo que un usuario puede desplegar el modelo completo o cuantizado a 4 u 8 bits según su VRAM disponible. Conviene señalar que el modelo no registra descargas ni "likes" en el momento de la consulta, y que todas las cifras de rendimiento proceden de la propia model card del autor, sin verificación independiente disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo derivado de la familia Qwen3.8, transformer decoder; la model card no detalla la arquitectura interna) |
| Parametros totales | 26.895.998.464 (aprox. 26,9 mil millones), dato de los pesos safetensors del modelo base |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF; cuantizaciones "Regular" y "MTP"; se mencionan expresamente 8 bits, 4 bits y Q4KS; imatrix dual (DI-MATRIX) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); bfloat16 en el modelo base |
| Tamano del repositorio | 389,0 GB |
| Pipeline declarado | image-text-to-text |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |
| Datasets declarados | DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets |

## Arquitectura y entrenamiento

No se dispone de una descripcion arquitectonica detallada en la informacion proporcionada. El modelo se presenta como un fine tune del Qwen3.8 27B, un transformer decoder de aproximadamente 26,9 mil millones de parametros, sin indicios de que se trate de una arquitectura MoE, SSM o hibrida. Los tags del repositorio incluyen referencias a las familias qwen3_8, qwen3_6 y qwen3_5, lo que sugiere un linaje de destilacion o mezcla sobre distintas generaciones de la familia Qwen3.

El autor describe un proceso de entrenamiento multi-etapa, multi-fine-tune y multi-merge, basado en dos metodos propietarios: COLD FUSION (combinacion de una tecnica interna denominada "GAIN" con los entrenadores de Unsloth) y Fable Fusion 711. Segun la model card, GAIN modifica dinamicamente el entrenamiento muestra a muestra en tiempo real a medida que el modelo aprende. Los datasets de entrenamiento declarados son Polar-STRICT-Datasets y F451-STRICT-Datasets, ambos del mismo autor. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; tampoco se documenta el proceso de abliteration mas alla del tag "abliterated"/"heretic". La innovacion declarada se centra en la reformulacion y compresion del bloque de razonamiento, la aceleracion de la generacion mediante MTP y la calibracion de las cuantizaciones con doble imatrix.

## Capacidades

- Generacion de texto general, razonamiento y resolucion de problemas, con tres modos de funcionamiento (el autor menciona "all three modes of thinking") y modo "thinking" explicito.
- Generacion de codigo, reflejada en el sufijo NEO-CODER del nombre y en el tag "coder".
- Escritura creativa, narrativa, ficcion y roleplaying, segun los tags "creative writing", "all genres", "story" y "fiction".
- Capacidades multimodales: el pipeline declarado es image-text-to-text, aunque la model card no detalla ninguna capacidad de vision.
- Soporte multilingue limitado a ingles y chino.
- Reduccion del consumo de tokens de razonamiento: entre 1/2 y 1/10 respecto al modelo base, con mediana en torno a 2/3, segun el autor.
- Generacion acelerada mediante cuantizaciones MTP (multi-token prediction).
- La model card afirma, en la pestana de comunidad, el "mejor rendimiento de tool calling registrado", pero no se aporta medicion ni metodologia en la informacion disponible.
- Por su naturaleza "uncensored/abliterated", el modelo responde a peticiones que los modelos alineados tienden a rechazar.

## Casos de uso

- Escritura creativa y narrativa larga: el ajuste esta orientado explicitamente a ficcion, relato y roleplaying, con un estilo de respuesta muy directo y detallado, lo que lo hace util para generar borradores extensos o mantener personajes consistentes en sesiones largas.
- Asistente de programacion en local: con 26,9 mil millones de parametros y cuantizacion de 4 bits, puede desplegarse en una GPU de consumo para autocompletado, generacion de funciones y explicacion de codigo sin enviar codigo propietario a servicios externos.
- Generacion de codigo en pipelines de CI/CD: el autor declara un rendimiento destacado en tool calling, lo que permitiria integrarlo en agentes que invocan herramientas (linters, ejecutores de tests, gestores de repositorios) siempre que se valide esa capacidad de forma independiente.
- Razonamiento con coste de tokens reducido: al recortar el bloque de pensamiento, es adecuado para entornos con latencia o coste por token sensibles, como asistentes interactivos, donde el ahorro en tokens de "thinking" se traduce directamente en tiempo de respuesta.
- Analisis y generacion de contenido sin filtros editoriales: util para investigacion sobre alineacion, red teaming y estudio de sesgos, ya que permite observar las respuestas de un modelo abliterated frente a las de su version alineada.
- Despliegue en hardware de consumo mediante llama.cpp u Ollama: el formato GGUF y la disponibilidad de cuantizaciones de 4 y 8 bits permiten ejecutar el modelo en estaciones de trabajo con una sola GPU.
- Experimentacion con cuantizacion y decodificacion especulativa: las variantes MTP y el uso de doble imatrix lo convierten en un banco de pruebas para medir el impacto de la cuantizacion en la calidad y la velocidad de generacion.
- Traduccion y asistencia bilingue ingles-chino: dentro del par de idiomas soportado, puede emplearse para redaccion y traduccion, con la advertencia de que no hay evaluacion publicada de calidad por idioma.

## Benchmarks y rendimiento

Los unicos datos disponibles son las cifras declaradas por el autor en la model card. No se han localizado evaluaciones independientes ni resultados verificables en la informacion proporcionada. Se reproducen tal cual, con la advertencia de que no estan contrastados.

| Benchmark | Resultado declarado | Condiciones declaradas |
|---|---|---|
| ARC-C | 735 | Cuantizacion de 8 bits |
| ARC-C | 719 | Cuantizacion de 4 bits |
| ARC-E | 880 | No se especifica la cuantizacion |
| Otros 5 benchmarks | Sin cifra publicada en la informacion disponible | El autor afirma superar el modelo base en "los 7 benchmarks criticos" |

El autor afirma ademas que el modelo supera a Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en esos siete benchmarks, y que se situa en la "zona de inteligencia" de los modelos cerrados de OpenAI, Claude y Gemini. No se aportan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros, no confirmado por el autor): en bfloat16, en torno a 54-60 GB; en cuantizacion de 8 bits, en torno a 28-32 GB; en cuantizacion de 4 bits, en torno a 15-18 GB.
- GPU recomendadas para precision completa o 8 bits: A100 80 GB, H100 80 GB, H200 o configuraciones multi-GPU con dos RTX 4090 de 24 GB.
- GPU de consumo: con cuantizacion de 4 bits el modelo puede caber en una RTX 4090, RTX 3090, RTX 4080 o similar con 24 GB de VRAM, e incluso en GPUs de 16 GB con cuantizaciones mas agresivas, con perdida de contexto disponible.
- Opciones de despliegue: llama.cpp y Ollama para GGUF en local; vLLM o TGI requieren pesos sin cuantizar o conversiones adicionales; los tags incluyen endpoints_compatible.
- Latencia y throughput: no disponibles. El autor afirma que las variantes MTP aceleran la generacion de tokens y que el modelo "termina antes" al reducir el bloque de razonamiento, pero no se publican tokens por segundo ni mediciones de latencia.
- Tamano de descarga: el repositorio completo ocupa 389 GB, por lo que conviene descargar unicamente el archivo de cuantizacion necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (baselquants, GGUF) | 26,9 mil millones | No disponible | ARC-C 735 (8 bits) y 719 (4 bits), segun el autor | Apache 2.0 | HuggingFace, sin descargas registradas |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU (modelo base) | No disponible | No disponible | El autor afirma que este derivado lo supera en 7 benchmarks | No disponible en la informacion proporcionada | HuggingFace |
| Qwen3.6-35B-A3B | No disponible (MoE, 3B activos por el sufijo A3B) | No disponible | El autor afirma que este modelo lo supera en 7 benchmarks | No disponible en la informacion proporcionada | HuggingFace |
| Qwen 3.6 27B y Qwen 3.5 27B | No disponibles | No disponible | El autor afirma que este modelo los supera en 7 benchmarks | No disponible en la informacion proporcionada | HuggingFace |
| DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF | No disponible | No disponible | No disponible (citado como precedente del metodo COLD FUSION) | No disponible en la informacion proporcionada | HuggingFace, mas de 3 millones de descargas segun el autor |

No se dispone de datos tecnicos suficientes de los modelos comparados para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": los mecanismos de rechazo estan deliberadamente reducidos, por lo que puede producir contenido ofensivo, ilegal o peligroso sin filtros. Requiere moderacion externa en cualquier despliegue publico.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual ni de tasa de alucinacion; un ajuste orientado a la creatividad y con la alineacion suavizada tiende a agravar este problema.
- Idiomas: cobertura declarada unicamente para ingles y chino, sin datos de rendimiento en castellano ni en otras lenguas.
- Contexto: la longitud de contexto no se especifica en la informacion disponible, lo que impide planificar despliegues con ventanas largas.
- Cifras no verificadas: todos los resultados de benchmarks proceden del autor del modelo base; no hay evaluacion independiente ni comparacion reproducible.
- Trazabilidad limitada: el proceso de entrenamiento multi-etapa con metodos propietarios (COLD FUSION, GAIN, Fable Fusion 711) no esta documentado de forma que pueda reproducirse, y no se detallan tokens de entrenamiento ni composicion del dataset.
- Consistencia de la metrica ARC: el autor utiliza resultados de ARC-C y ARC-E con denominaciones ("735", "882") y clubs de inteligencia que no se corresponden con la escala estandar de esos benchmarks, lo que dificulta la comparacion directa con publicaciones academicas.
- Repositorio vacio de traccion: cero descargas y cero "likes" en el momento de la consulta, sin historial de uso que permita juzgar su fiabilidad en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario asume toda la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo aplicable en su jurisdiccion.
- Capacidades multimodales no documentadas: el pipeline declarado es image-text-to-text, pero la model card no describe ninguna capacidad de vision ni se han publicado evaluaciones al respecto; conviene verificarlo antes de asumirlo.
- Tamano de descarga elevado: 389 GB de repositorio, con el coste de almacenamiento y ancho de banda asociado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/baselquants/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Precedente del metodo COLD FUSION citado en la model card: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su arquitectura o sus benchmarks; los resultados obtenidos correspondian a documentacion no relacionada de soporte de Windows.
