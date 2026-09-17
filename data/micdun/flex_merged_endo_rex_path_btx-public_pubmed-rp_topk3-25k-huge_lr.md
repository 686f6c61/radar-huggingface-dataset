# micdun/flex_merged_endo_rex_path_btx-public_pubmed-rp_topk3-25k-huge_lr

## Resumen

`micdun/flex_merged_endo_rex_path_btx-public_pubmed-rp_topk3-25k-huge_lr` es un modelo de 12.320.990.464 parametros (unos 12,32 mil millones) publicado en HuggingFace por el usuario `micdun`, con pesos en formato safetensors y un tamano de repositorio de 24,7 GB. El tag `flex_qwen2_5_vl_moe` indica que se trata de una variante de mezcla de expertos (MoE) construida sobre la familia Qwen2.5-VL, es decir, con capacidades multimodales (texto e imagen) heredadas de esa arquitectura base. El nombre del repositorio sugiere un proceso de fusion (merge) de adaptadores entrenados sobre dominios concretos: endoscopia (`endo`), patologia (`path`), y corpus biomedico PubMed, con una configuracion de enrutamiento de tres expertos activos (`topk3`) sobre 25.000 pasos (`25k`) y una tasa de aprendizaje alta (`huge_lr`).

La relevancia de esta ficha es limitada y hay que ser honesto al respecto: se trata de un modelo con 75 descargas y 0 likes, sin tarjeta de modelo publicada, sin licencia declarada, sin idiomas declarados y sin resultados de benchmarks disponibles. No es un modelo de produccion respaldado por un laboratorio, sino un artefacto de experimentacion publicado de forma abierta. Por tanto, debe tratarse como material de investigacion y no como una dependencia estable para sistemas en produccion.

La busqueda web asociada no devolvio ningun resultado tecnico relacionado con el modelo: los enlaces recuperados corresponden a hilos de soporte de Microsoft sobre problemas de disco y actualizaciones de Windows, sin ninguna relacion con IA. En consecuencia, toda la informacion tecnica de esta ficha procede exclusivamente de los metadatos de HuggingFace y de inferencias explicitamente marcadas como tales a partir de los tags y del nombre del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita. El tag `flex_qwen2_5_vl_moe` apunta a una arquitectura de mezcla de expertos (MoE) derivada de Qwen2.5-VL, de tipo transformer multimodal con vision (inferencia a partir del tag, no confirmada) |
| Parametros totales | 12.320.990.464 (aproximadamente 12,32 mil millones), dato real extraido de los safetensors |
| Parametros activos | No disponible. El nombre del repositorio incluye `topk3`, lo que sugiere 3 expertos activos por token, pero se desconoce el numero total de expertos y, por tanto, el computo de parametros activos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene safetensors (presumiblemente bf16/fp16, coherente con 24,7 GB para 12,32 mil millones de parametros). No se han publicado versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no declarada en la tarjeta del repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura concreta, los datos de entrenamiento ni el procedimiento de ajuste. A partir del tag `flex_qwen2_5_vl_moe` y del nombre del repositorio pueden formularse hipotesis, siempre marcadas como tales: el modelo parece ser el resultado de una fusion de adaptadores (`flex_merged`) aplicados sobre una base Qwen2.5-VL adaptada a mezcla de expertos, con entrenamiento orientado a dominios biomedicos (`pubmed`, `endo`, `rex_path_btx`) y con enrutamiento top-3 sobre un presupuesto de 25.000 pasos de entrenamiento y una tasa de aprendizaje elevada. La elevada tasa de aprendizaje (`huge_lr`) es un indicio de experimentacion agresiva, no necesariamente de convergencia optima.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o RLVR. Tampoco hay documentacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, enrutamiento aprendido, etc.). Todo ello debe considerarse no disponible.

## Capacidades

- Generacion de texto: asumible por la arquitectura base, pero no verificada en la informacion disponible.
- Capacidades multimodales (vision-lenguaje): inferidas del tag `flex_qwen2_5_vl_moe`, que apunta a una base Qwen2.5-VL. No confirmadas.
- Procesamiento de literatura biomedica en ingles: inferido del sufijo `pubmed` del nombre del repositorio. No confirmado.
- Posible especializacion en imagenes endoscopicas o de patologia: inferido de los terminos `endo` y `path` del nombre. No confirmado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

Dado que no hay tarjeta de modelo, licencia ni benchmarks, los siguientes casos son escenarios plausibles derivados del nombre y los tags, no aplicaciones validadas. En todos ellos debe verificarse previamente la licencia y la calidad real del modelo.

- Extraccion de informacion estructurada de articulos de PubMed: el sufijo `pubmed` del repositorio sugiere un ajuste sobre literatura biomedica. El modelo podria emplearse para transformar texto libre en campos JSON (poblacion, intervencion, comparador, resultado) mediante prompts con esquema fijo. Requiere validacion manual por el riesgo de alucinacion en cifras y citas.
- Cribado de titulos y resumenes en revisiones sistematicas: uso como primer filtro para clasificar articulos como relevantes o no relevantes antes de la lectura completa, reduciendo el trabajo manual de los revisores. Necesita una metrica de sensibilidad medida sobre un conjunto de validacion propio.
- Asistencia en analisis de imagenes endoscopicas: si la componente multimodal es funcional, el modelo podria servir como prototipo para tareas de descripcion o clasificacion preliminar de fotogramas endoscópicos, siempre con supervision clinica y sin valor diagnostico autonomo.
- Pipeline RAG sobre documentacion biomedica: el modelo puede actuar como generador final en un sistema de recuperacion aumentada sobre guias clinicas o articulos, con la ventana de contexto que permita la arquitectura. La ausencia de datos de contexto publicado obliga a medirlo antes de dimensionar el sistema.
- Generacion de codigo de analisis estadistico en R o Python para estudios: si conserva las capacidades de codigo de la base Qwen2.5-VL, podria asistir en la escritura de scripts de limpieza y analisis de datos de cohortes. Sin benchmarks de codigo publicados, es una hipotesis a validar.
- Base para experimentacion academica en mezcla de expertos: por su tamano (12,32 mil millones de parametros) y su naturaleza de fusion, es util como punto de partida para estudiar estrategias de enrutamiento top-3, fusion de adaptadores y ajuste con tasas de aprendizaje agresivas.
- Prototipado interno en investigacion clinica: con 12,3 mil millones de parametros en bf16 cabe en una unica GPU de 40 GB, lo que facilita prototipos locales sin infraestructura distribuida. No debe usarse con datos de pacientes sin garantias de cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K, MedQA, VQA-RAD ni de ninguna otra evaluacion, ni para el modelo ni en comparacion con alternativas.

## Requisitos de hardware

Estimaciones calculadas a partir del numero de parametros (12,32 mil millones) y del tamano de pesos; no proceden de mediciones publicadas.

- Pesos en bf16/fp16: aproximadamente 24,6 GB. Con cache KV y overhead de runtime, se recomienda reservar entre 28 y 32 GB de VRAM.
- Pesos en int8/FP8: aproximadamente 12,3 GB. Con overhead, entre 14 y 17 GB de VRAM.
- Pesos en Q4_K_M (si se generase una conversion GGUF): aproximadamente 7,5 GB. Con overhead, entre 9 y 11 GB de VRAM.
- Pesos en Q5_K_M: aproximadamente 8,8 GB. Con overhead, entre 10 y 12 GB.
- Pesos en Q8_0: aproximadamente 13 GB. Con overhead, entre 15 y 17 GB.
- GPU profesionales recomendadas para bf16: A100 40 GB o 80 GB, H100, L40S 48 GB, RTX 6000 Ada 48 GB. En GPUs de 24 GB no cabe en bf16 sin cuantizacion ni offloading.
- GPU de consumo: con cuantizacion int8 o Q8 cabe en RTX 4090, RTX 3090 y RTX 4080 (este ultimo con poco margen). Con Q4 o Q5 cabe en GPUs de 16 GB e incluso en 12 GB con contexto muy reducido. Con bf16 no cabe en ninguna GPU de consumo de 24 GB sin offloading a CPU.
- Mac con memoria unificada: 24 GB o mas para Q4/Q5; 32 GB o mas para Q8. Para bf16 se necesitarian 32 GB como minimo y 48 GB o superior con comodidad.
- Opciones de despliegue: el repositorio solo publica safetensors, por lo que el despliegue directo requiere Transformers, vLLM, SGLang o TGI (previa verificacion de compatibilidad con la arquitectura MoE derivada de Qwen2.5-VL). Ollama y llama.cpp solo serian viables si se generan conversiones GGUF propias, ya que no se han publicado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de los modelos de referencia proceden de informacion publica de sus respectivos repositorios, no de la documentacion de este modelo. La comparativa se ofrece como orientacion, dado que no existe informacion de rendimiento del modelo analizado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| micdun/flex_merged_endo_rex_path_btx-public_pubmed-rp_topk3-25k-huge_lr | 12,32 mil millones (MoE, activos no disponibles) | No disponible | No disponible | safetensors en HuggingFace; 75 descargas, 0 likes |
| Qwen2.5-VL-7B-Instruct | 7,6 mil millones | 128.000 tokens | Apache 2.0 | safetensors, ampliamente soportado |
| Qwen2.5-VL-32B-Instruct | 32,8 mil millones | 128.000 tokens | Apache 2.0 | safetensors, soporte en vLLM |
| Mixtral 8x7B (referencia MoE, solo texto) | 46,7 mil millones totales, 12,9 mil millones activos | 32.000 tokens | Apache 2.0 | safetensors y GGUF |

No se dispone de comparativas de rendimiento con alternativas biomedicas especializadas, ni de datos que permitan situar este modelo frente a ellas.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay tarjeta de modelo, ni descripcion de datos de entrenamiento, ni procedimiento de evaluacion. No se puede verificar ninguna capacidad declarada.
- Licencia no declarada: sin licencia explicita no hay certeza sobre el uso comercial. En la practica, la ausencia de licencia en HuggingFace debe tratarse como uso comercial no autorizado hasta que el autor lo aclare.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano o si esta limitado al ingles biomedico. Cualquier despliegue multilingue exige evaluacion previa.
- Riesgo elevado de alucinacion: en dominios clinicos o biomedicos, la generacion de referencias, dosis, cifras o conclusiones inexactas puede tener consecuencias graves. No debe usarse sin verificacion humana experta.
- Riesgo de sesgos: los corpus biomedicos (PubMed) presentan sesgos de publicacion, de idioma (predominio del ingles) y de representacion poblacional. Es esperable que el modelo los reproduzca, aunque no hay estudios que lo cuantifiquen.
- Contexto no documentado: al desconocerse la longitud de contexto efectiva, cualquier despliegue con documentos largos requiere medir experimentalmente el punto de degradacion.
- Procedencia de la fusion desconocida: se desconoce que adaptadores se fusionaron, con que datos y con que criterios de seleccion. Esto dificulta la trazabilidad, algo critico en entornos regulados.
- Hiperparametros potencialmente suboptimos: el nombre del repositorio incluye `huge_lr`, lo que sugiere entrenamiento con tasa de aprendizaje elevada y posible inestabilidad o degradacion frente a la base original.
- Metadatos anomalos: la fecha de creacion registrada (2026-09-17) es posterior a la fecha de actualizacion esperada para un modelo publicado, lo que indica metadatos inconsistentes o generados automaticamente. Reduce la confianza en el resto de campos.
- Adopcion practicamente nula: 75 descargas y 0 likes implican ausencia de validacion comunitaria, de issues resueltos y de casos de exito reportados.
- Sin versiones cuantizadas oficiales: la ausencia de GGUF, GPTQ o AWQ obliga a generar conversiones propias para despliegue en hardware de consumo, con el riesgo de degradacion que ello implica.

## Enlaces

- HuggingFace: https://huggingface.co/micdun/flex_merged_endo_rex_path_btx-public_pubmed-rp_topk3-25k-huge_lr
- No se han encontrado papers, blogs, repositorios, demos ni articulos tecnicos relacionados con este modelo en la busqueda web. Los unicos resultados devueltos fueron hilos de soporte de Microsoft sin relacion con inteligencia artificial, por lo que se omiten.
