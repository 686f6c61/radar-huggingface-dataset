# mradermacher/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-i1-GGUF

## Resumen

Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-i1-GGUF es la version cuantizada en formato GGUF del modelo pragmaticcs/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder, publicada por mradermacher. Se trata de un modelo de lenguaje causal de aproximadamente 8.953.803.264 parametros (unos 8,95 mil millones), construido a partir de una fusion de modelos (los tags del repositorio citan las tecnicas TIES y DELLA) sobre una base de la familia Qwen3.5, con identificador de tipo `qwen3_5_text` en Transformers.

El modelo esta etiquetado como orientado a codigo, razonamiento, uso agentico y SWE-bench, e incorpora segun los tags mecanismos de atencion lineal tipo DeltaNet, lo que lo situa en la tendencia de arquitecturas hibridas que buscan reducir el coste de la atencion clasica en contextos largos y en cargas de trabajo agenticas multi-paso. Esta publicado bajo licencia Apache 2.0 y declara soporte para ingles y chino.

La relevancia practica de esta ficha es que el repositorio de mradermacher ofrece los pesos en formato GGUF con cuantizaciones i1 (imatrix) que van desde IQ1_S hasta Q6_K, con ficheros que ocupan desde unos 3,9 GB hasta mas alla de los 5,5 GB. Esto permite ejecutar un modelo de casi 9.000 millones de parametros en GPU de consumo y en CPU, algo que los pesos originales en safetensors no facilitan. No se ha publicado informacion de benchmarks ni la model card del modelo base en los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atencion lineal tipo DeltaNet segun los tags del repositorio; tipo de modelo `qwen3_5_text`; resultado de una fusion (merge) de modelos con tecnicas TIES y DELLA |
| Parametros totales | 8.953.803.264 (8,95 mil millones) |
| Parametros activos | No aplica: no se indica que el modelo sea MoE en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix) en IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, Q3_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M y Q6_K, entre otras; tambien se ofrecen quants estaticos en un repositorio aparte |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors; el repositorio GGUF ocupa 27,6 GB en total) |
| Autor de la cuantizacion | mradermacher |
| Modelo base | pragmaticcs/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder |
| Fecha de publicacion | 24 de septiembre de 2026 (creacion del repositorio segun HuggingFace) |
| Descargas y likes | 0 descargas y 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo mediante los tags del repositorio: `causal-lm`, `qwen3.5`, `qwen3_5_text`, `deltanet`, `linear-attention`, `merge`, `ties`, `della`, `agentic`, `reasoning`, `code` y `swe-bench`. De ello se deduce que se trata de un transformer causal de la familia Qwen3.5 en el que se han combinado varios modelos mediante fusion de pesos con las tecnicas TIES y DELLA, y que incorpora componentes de atencion lineal (DeltaNet) en lugar de depender exclusivamente de atencion softmax cuadratica. No se detalla en la informacion proporcionada la composicion exacta de la fusion, el numero de modelos combinados ni la receta de interpolacion de pesos.

Tampoco se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo fases de ajuste fino con RLHF, DPO u otras tecnicas de alineacion. La model card del modelo base no forma parte de la informacion suministrada; la model card del repositorio GGUF corresponde al cuantizador e incluye unicamente la lista de cuantizaciones generadas, notas sobre como concatenar ficheros multiparte y enlaces a guias externas sobre el uso de GGUF. No se han publicado innovaciones tecnicas adicionales (decodificacion especulativa, atencion con kernel especifico u optimizaciones de inferencia) en los datos disponibles.

## Capacidades

Las capacidades que se enumeran a continuacion se derivan de los tags y de la informacion del repositorio, no de una evaluacion independiente:

- Generacion de texto conversacional, con la etiqueta `conversational` en el repositorio.
- Generacion y asistencia en codigo, con etiquetas `code` y `swe-bench`.
- Razonamiento explicito, con la etiqueta `reasoning`.
- Flujos de trabajo agenticos y multi-paso, con la etiqueta `agentic`.
- Capacidad potencial de uso con herramientas y function calling: el tag `endpoints_compatible` indica compatibilidad con endpoints de inferencia, pero no se documenta de forma explicita el soporte de tool calling en la informacion disponible.
- Capacidades multilingues limitadas a ingles y chino segun el campo `language`.
- Modo de pensamiento (thinking mode): no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles; el repositorio no declara ninguna.

## Casos de uso

- Asistente de programacion en local: con las cuantizaciones i1-Q4_K_S (5,5 GB) o i1-IQ3_M (4,5 GB) el modelo cabe en GPU de consumo, lo que permite integrarlo en un IDE o en un editor tipo VS Code mediante llama.cpp u Ollama sin enviar el codigo a servicios externos.
- Agente de resolucion de incidencias de software: la etiqueta `swe-bench` apunta a un uso previsto en tareas de reparacion de errores sobre repositorios; el modelo podria formar parte de un bucle de agente que lea el arbol de ficheros, localice el fallo, proponga un parche y lo valide ejecutando la suite de tests.
- Revision de pull requests: dado su enfoque en codigo, puede usarse para comentar diffs, detectar cambios incompatibles o sugerir refactorizaciones, desplegado como servicio interno con la API compatible con endpoints que sugiere el tag `endpoints_compatible`.
- Generacion de pruebas automatizadas: el modelo puede redactar tests unitarios a partir de funciones y ficheros existentes, integrndose en un pipeline de CI/CD que genere y ejecute las pruebas antes del merge.
- Documentacion tecnica bilingue: al soportar ingles y chino, resulta util para equipos con documentacion en ambos idiomas, generando o traduciendo docstrings, guias de API y notas de version manteniendo terminologia tecnica.
- Migracion y actualizacion de codigo heredado: con la atencion lineal tipo DeltaNet como parte de la arquitectura, el modelo esta pensado para manejar entradas largas, lo que encaja con la conversion de bases de codigo extensas de un framework o version de lenguaje a otra.
- Despliegue en entornos sin GPU: las cuantizaciones de menor tamano (i1-Q2_K, 3,9 GB; i1-IQ3_XXS, 4,0 GB) permiten ejecutar el modelo en CPU con llama.cpp en estaciones de trabajo o portatiles, con la perdida de calidad que implica una cuantizacion tan agresiva.
- Investigacion sobre arquitecturas hibridas: al combinar fusion de pesos (TIES, DELLA) y atencion lineal, el modelo es un objeto de estudio para medir como se comportan los merges de modelos con componentes DeltaNet frente a transformers densos equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye la etiqueta `swe-bench` como ambito previsto, pero no se acompana de ninguna puntuacion, y tampoco se aportan resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones. No se deben extrapolar cifras a partir del nombre del modelo ni de los tags.

## Requisitos de hardware

- VRAM estimada para inferencia (orientativa, a partir del tamano de los ficheros de cuantizacion mas la cache de clave/valor, que depende del contexto configurado): unos 4,5 GB para i1-Q2_K (3,9 GB de pesos), unos 4,7 GB para i1-IQ3_XXS (4,0 GB), unos 5,2 GB para i1-IQ3_M (4,5 GB), unos 5,4 GB para i1-Q3_K_M (4,7 GB) y unos 6,2 GB para i1-Q4_K_S (5,5 GB).
- GPU recomendadas: para las cuantizaciones bajas, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 o superiores permiten cargar el modelo completo en VRAM con espacio para contexto; en el extremo alto, A100 o H100 no son necesarias para un modelo de 8,95 mil millones de parametros y solo tendrian sentido para servir muchas peticiones concurrentes.
- Compatibilidad con GPU de consumo: si. Cualquier GPU con 8 GB o mas de VRAM puede ejecutar las cuantizaciones i1-Q2_K a i1-Q4_K_S. Con 6 GB de VRAM es posible cargar las cuantizaciones mas pequenas, con riesgo de desbordamiento a memoria del sistema si se amplia el contexto.
- Despliegue: llama.cpp y sus derivados (Ollama, LM Studio, text-generation-webui, llama-cpp-python) son las opciones naturales para el formato GGUF. vLLM o TGI requeririan los pesos originales en safetensors del modelo base.
- Ejecucion en CPU: viable con las cuantizaciones mas pequenas; el rendimiento dependera del numero de nucleos y del ancho de banda de memoria.
- Latencia y throughput: no disponibles; no se aportan mediciones en la informacion proporcionada.

## Comparativa con modelos similares

La informacion suministrada no incluye la model card del modelo base, su contexto ni resultados de evaluacion, por lo que no es posible establecer una comparacion cuantitativa fiable. La tabla siguiente recoge unicamente los datos verificables y deja el resto como no disponible.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Datos de rendimiento |
|---|---|---|---|---|---|
| Triumvirate-Qwopus-MiMo-Ornith-9B-Coder (este modelo, cuantizado por mradermacher) | 8,95 mil millones | no disponible | Apache 2.0 | Si (i1 imatrix, IQ1_S a Q6_K) | no disponible |
| pragmaticcs/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder (modelo base) | 8,95 mil millones | no disponible | Apache 2.0 (segun el repositorio derivado) | No consta en la informacion disponible | no disponible |
| Otros merges de la familia Qwen3.5 en el rango de 8-10 mil millones | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos de codigo abiertos de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

Para una comparacion rigurosa habria que consultar la model card del modelo base y las evaluaciones publicadas por su autor, que no forman parte de esta busqueda.

## Limitaciones y advertencias

- Ausencia de evaluacion publica: no hay benchmarks en la informacion disponible, por lo que no se puede afirmar que el modelo supere o iguale a alternativas de su rango de tamano en tareas de codigo o razonamiento.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar APIs, funciones o fragmentos de codigo inexistentes; conviene validar la salida con compilacion y tests antes de usarla en produccion.
- Sesgos: no se documenta la composicion del dataset de entrenamiento ni los procesos de alineacion, por lo que no es posible evaluar sesgos conocidos ni mitigaciones aplicadas.
- Cobertura idiomatica limitada: solo se declaran ingles y chino. El castellano no figura entre los idiomas soportados, por lo que su rendimiento en espanol no esta garantizado y deberia medirse antes de usarlo en productos orientados a ese idioma.
- Naturaleza de merge: los modelos fusionados con TIES o DELLA pueden heredar comportamientos inconsistentes o degradaciones dificiles de trazar, ya que no han pasado necesariamente por un ajuste fino posterior a la fusion.
- Cuantizacion agresiva: las variantes por debajo de IQ3_XXS (i1-Q2_K, 3,9 GB) degradan la calidad de forma notable; para uso en produccion se recomienda partir de i1-Q4_K_S o superior, siempre que la VRAM lo permita.
- Licencia: Apache 2.0 permite uso comercial sin restriccion de royalties, pero conviene verificar las licencias de los modelos que componen la fusion, ya que las obligaciones de esos pesos podrian propagarse al merge.
- Estado del repositorio: el modelo presenta 0 descargas y 0 likes en el momento de la consulta y fue publicado el mismo dia de su actualizacion, por lo que no existe validacion de la comunidad ni informes de fallos conocidos.
- Longitud de contexto desconocida: al no documentarse la ventana de contexto, no se puede planificar el uso con repositorios grandes sin una prueba previa.

## Enlaces

- Repositorio GGUF con cuantizaciones i1: https://huggingface.co/mradermacher/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-i1-GGUF
- Modelo base: https://huggingface.co/pragmaticcs/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder
- Quants estaticos del mismo modelo: https://huggingface.co/mradermacher/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-GGUF
- Fichero imatrix para generar cuantizaciones propias: https://huggingface.co/mradermacher/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-i1-GGUF/resolve/main/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder.imatrix.gguf
- Cuantizacion i1-Q4_K_S: https://huggingface.co/mradermacher/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-i1-GGUF/resolve/main/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder.i1-Q4_K_S.gguf
- Vista general de cuantizaciones del autor: https://hf.tst.eu/model#Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-i1-GGUF
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa que cede la infraestructura al cuantizador: https://www.nethype.de/

Nota sobre la busqueda web: los resultados obtenidos corresponden a la plataforma de television CANAL+ y no guardan relacion con el modelo, por lo que no se ha incorporado ningun dato procedente de ellos. No se han localizado papers, blogs tecnicos ni demos del modelo en la informacion disponible.
