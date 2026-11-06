# mradermacher/Ising-Calibration-1.5-31B-it-merge-i1-GGUF

## Resumen

Ising-Calibration-1.5-31B-it-merge-i1-GGUF es una cuantizacion GGUF del modelo tergite/Ising-Calibration-1.5-31B-it-merge, publicada por mradermacher. Se trata de un modelo conversacional de aproximadamente 30.700 millones de parametros (30,697,345,596 segun los pesos safetensors del modelo base) que, segun las etiquetas de la model card, esta orientado a tareas de calibracion y guarda relacion con el ambito de la computacion cuantica ("quantum", "calibration", "Ising Calibration"). El modelo base resulta de una fusion por aritmetica de tareas (task-arithmetic), una tecnica de model merging que combina pesos de varios modelos para agregar capacidades sin reentrenamiento adicional.

Esta publicacion concreta es una recuantizacion en formato GGUF con cuantizaciones ponderadas mediante imatrix (etiqueta "i1"), pensada para ejecucion local con llama.cpp y herramientas compatibles. El autor indica que existen tambien cuantizaciones estaticas en un repositorio separado. La model card menciona que el modelo es de vision, por lo que los ficheros mmproj, si existen, se alojan en el repositorio de cuantizaciones estaticas.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~31B en hardware de consumo mediante cuantizaciones de 2 a 6 bits, aunque la informacion publicada sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada. La licencia openmdw-1.1 y el idioma declarado (ingles) condicionan su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle no disponible); modelo base generado por task-arithmetic merge |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M; cuantizaciones estaticas en repositorio aparte |
| Idiomas soportados | en (ingles) |
| Licencia | openmdw-1.1 (declarada como "other" en metadatos) |
| Formato de pesos | GGUF (cuantizado); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base (tipo de atencion, uso de GQA/MQA, normalizacion, funcion de activacion, etc.). Lo que si se conoce es que el modelo base se obtuvo mediante task-arithmetic merge, una tecnica de fusion de pesos que combina parametros de modelos preentrenados o ajustados para componer capacidades. El modelo es conversacional (etiqueta "conversational") y esta etiquetado como modelo de vision, aunque no se detalla el codificador visual ni la resolucion de imagen soportada.

No hay datos publicados sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o SFT. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La cuantizacion i1 utiliza una matriz de importancia (imatrix) generada por el cuantizador para ponderar la precision de los tensores, lo que en la practica mejora la calidad de las cuantizaciones de baja profundidad de bits frente a las estaticas.

## Capacidades

- Generacion de texto conversacional multi-turno (etiqueta "conversational").
- Capacidades de vision segun la model card del cuantizador (ficheros mmproj en el repositorio estatico), aunque no se detalla el alcance.
- Orientacion tematica a calibracion y computacion cuantica segun las etiquetas del modelo, sin documentacion adicional sobre el alcance real de esta especializacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Ejecucion local de un modelo de ~31B en hardware de consumo: las cuantizaciones i1-Q2_K (12,0 GB) y superiores permiten cargar el modelo en GPUs con 16-24 GB de VRAM o en configuraciones CPU+GPU con llama.cpp, algo inviable con los pesos en safetensors.
- Prototipado de asistentes conversacionales en ingles: el modelo esta etiquetado como conversacional y puede integrarse en interfaces de chat mediante llama.cpp u Ollama para pruebas de concepto.
- Experimentacion con model merging y aritmetica de tareas: util para investigadores que quieran evaluar como se comporta un merge de ~31B frente a sus modelos constituyentes en tareas de razonamiento y conversacion.
- Investigacion en dominios cientificos afines a la calibracion y la computacion cuantica: dado el etiquetado tematico, puede emplearse como base para explorar respuestas en ese dominio, siempre verificando la calidad con evaluaciones propias al no haber benchmarks publicados.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia openmdw-1.1 permite evaluar su uso comercial, aunque conviene revisar el texto completo de la licencia antes de integrarlo en productos.
- Pipeline de inferencia con cuantizacion seleccionable: al ofrecerse desde IQ1/IQ2 hasta Q6_K, permite ajustar el equilibrio calidad/memoria segun el hardware disponible en cada etapa (por ejemplo, Q4_K_M para servidores modestos y Q6_K para evaluaciones de maxima fidelidad).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin overhead de contexto): i1-Q2_K ~12,0 GB; el resto de cuantizaciones no publica tamanos en la informacion disponible, pero por el numero de parametros se situarian aproximadamente entre 8-13 GB (IQ1/IQ2), 13-16 GB (Q3), 16-20 GB (Q4), 20-24 GB (Q5) y 24-28 GB (Q6), estimaciones orientativas no confirmadas por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podrian alojar cuantizaciones Q4-Q5; A100 40/80 GB y H100 permitirian Q6_K o los pesos sin cuantizar.
- Cabe en GPU de consumo: si, en GPUs de 16 GB o mas con cuantizaciones IQ2/IQ3, y en 24 GB con Q4-Q5; las cuantizaciones IQ1/IQ2 podrian caber en 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base en safetensors es compatible con transformers y, presumiblemente, con vLLM/TGI, aunque no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ising-Calibration-1.5-31B-it-merge-i1-GGUF | ~30,7B | no disponible | openmdw-1.1 | GGUF (i1) | Merge task-arithmetic, etiquetado vision, solo ingles |
| Modelo base tergite/Ising-Calibration-1.5-31B-it-merge | ~30,7B | no disponible | openmdw-1.1 | safetensors | Sin cuantizar; requiere mas VRAM |
| Cuantizaciones estaticas (mismo autor) | ~30,7B | no disponible | openmdw-1.1 | GGUF (estaticas) | Mismo modelo sin imatrix; calidad inferior en bits bajos |

No se dispone de informacion sobre modelos alternativos de la misma categoria (calibracion/cuantica) ni de sus benchmarks, por lo que la comparativa se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un merge sin ficha de entrenamiento detallada, no es posible evaluar sesgos de forma fiable.
- Riesgo de alucinacion: inherente a los modelos generativos; sin benchmarks publicados no hay evidencia de su tasa de alucinacion en dominios cientificos o tecnicos.
- Limitaciones de contexto e idioma: solo se declara ingles; la longitud de contexto no esta disponible, lo que impide planificar usos con documentos largos.
- Restricciones de licencia: openmdw-1.1 (declarada como "other" en metadatos); es imprescindible leer el texto completo de la licencia antes de uso comercial, ya que la model card no detalla condiciones.
- La model card del cuantizador advierte que es un modelo de vision y que los ficheros mmproj, si existen, estan en el repositorio de cuantizaciones estaticas; esta publicacion i1 podria no incluir el proyector multimodal.
- Las cuantizaciones de muy baja profundidad (IQ1, IQ2) degradan la calidad de forma notable; el propio autor sugiere IQ3_XXS como preferible frente a Q2_K.
- No hay informacion sobre benchmarks, contexto ni datos de entrenamiento, por lo que no se recomienda su uso en produccion sin una evaluacion propia previa.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (esta cuantizacion): https://huggingface.co/mradermacher/Ising-Calibration-1.5-31B-it-merge-i1-GGUF
- Modelo base: https://huggingface.co/tergite/Ising-Calibration-1.5-31B-it-merge
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Ising-Calibration-1.5-31B-it-merge-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Ising-Calibration-1.5-31B-it-merge-i1-GGUF
- FAQ y peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
