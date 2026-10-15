# mradermacher/GLM-4.5-Air-REAP-82B-A12B-GGUF

## Resumen

GLM-4.5-Air-REAP-82B-A12B-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo cerebras/GLM-4.5-Air-REAP-82B-A12B, un modelo de lenguaje de arquitectura MoE (mezcla de expertos) derivado de GLM-4.5-Air mediante técnicas de poda de expertos (REAP, Router-weighted Expert Activation Pruning) y compresión. Las cuantizaciones las publica el usuario mradermacher, conocido por generar versiones GGUF de modelos abiertos para inferencia en llama.cpp y Ollama.

El modelo base es una versión podada del GLM-4.5-Air de Z.ai (zai-org): el nombre REAP-82B-A12B indica 82.000 millones de parámetros totales y 12.000 millones de parámetros activos por token, frente a los 106.000 millones totales del GLM-4.5-Air original. Los tensores safetensors reales del repositorio base suman 84.994.980.160 parámetros, ligeramente por encima de la cifra nominal del nombre. La relevancia de esta ficha radica en que permite ejecutar localmente un MoE de gran tamaño con coste de cómputo por token propio de un modelo de ~12B activos, a cambio de requisitos de memoria propios de un modelo de ~85B.

Se distribuye bajo licencia MIT y declara únicamente inglés como idioma soportado. No se han publicado benchmarks asociados a esta versión podada en la información disponible, y el repositorio GGUF acumula 140 descargas y 0 likes, por lo que se trata de una variante con validación comunitaria todavía muy escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), podada mediante REAP; etiquetas del repo: glm, MOE, pruning, compression |
| Parametros totales | 84.994.980.160 (~85B) segun tensores safetensors del modelo base; el nombre comercial indica 82B |
| Parametros activos | 12B (segun la nomenclatura A12B del nombre; no confirmado explicitamente en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (la lista interna de quants declarada incluye ademas x-f16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT, con enlace a la licencia del modelo original en zai-org/GLM-4.5-Air |
| Formato de pesos | GGUF (los pesos del modelo base estan en safetensors) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con mezcla de expertos (MoE) y enrutamiento por token, en la linea de la familia GLM-4.5 de Z.ai. La variante REAP-82B-A12B ha sido sometida a un proceso de poda de expertos basado en REAP (poda guiada por la activacion ponderada del router) y compresion, segun las etiquetas declaradas en el repositorio (pruning, compression). El resultado es un modelo con menos parametros totales que el GLM-4.5-Air original, manteniendo un regimen de ~12B parametros activos por token.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento posteriores al preentrenamiento. Tampoco se detalla el numero de expertos finales, el numero de expertos activados por token ni la configuracion del router tras la poda. Esta ficha describe exclusivamente el trabajo de cuantizacion y publicacion en GGUF realizado por mradermacher a partir de los pesos de Cerebras.

## Capacidades

- Generacion de texto conversacional: el repositorio incluye la etiqueta "conversational" y es compatible con endpoints de inferencia estándar.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base GLM-4.5-Air, aunque no se documentan explicitamente en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en` de la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.
- Inferencia local eficiente en computo: al tratarse de un MoE con ~12B parametros activos, el coste de FLOPs por token es inferior al de un modelo denso de ~85B.

## Casos de uso

- Asistentes conversacionales autoalojados en ingles: el modelo puede desplegarse con llama.cpp u Ollama en estaciones de trabajo con 64 GB o más de memoria unificada o VRAM, usando la cuantizacion Q4_K_M (56,0 GB) para obtener un equilibrio razonable entre calidad y consumo.
- Generacion de codigo en entornos con requisitos de soberania del dato: al ejecutarse en local, evita enviar codigo propietario a APIs externas; se recomienda la cuantizacion Q6_K (76,1 GB) o Q8_0 (90,5 GB) para minimizar la degradacion en tareas de sintaxis estricta.
- Prototipado e investigacion sobre poda de expertos: permite comparar la calidad del modelo podado con REAP frente al GLM-4.5-Air original usando los mismos prompts y decodificacion, sin necesidad de infraestructura de entrenamiento.
- Evaluacion del impacto de la cuantizacion: el repositorio publica once variantes (desde Q2_K con 34,7 GB hasta Q8_0 con 90,5 GB), lo que permite medir empiricamente la perdida de calidad por nivel de cuantizacion en tareas concretas del dominio propio.
- Despliegue en servidores con multiples GPU de gama alta: una configuracion con dos o mas GPU de 48 GB o 80 GB puede alojar cuantizaciones Q4_K_M o superiores manteniendo el modelo completamente en VRAM.
- Laboratorios docentes y proyectos academicos con presupuesto limitado: la variante Q2_K (34,7 GB) o Q3_K_S (40,4 GB) permite ejecutar un MoE de gran tamano en hardware de una sola maquina con CPU y GPU mixtas, aceptando una degradacion de calidad mayor.
- Reproduccion de experimentos con licencia permisiva: la licencia MIT declarada facilita su inclusion en productos comerciales y en pipelines internos, sujeto a la verificacion de los terminos del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se han encontrado datos de evaluacion de la version podada con REAP en las busquedas realizadas. No se deben extrapolar los resultados del GLM-4.5-Air original a esta variante podada y cuantizada.

## Requisitos de hardware

- VRAM/RAM estimada por cuantizacion (tamano de fichero, sin contar cache KV ni overhead del runtime): Q2_K 34,7 GB; Q3_K_S 40,4 GB; Q3_K_M 44,0 GB; Q3_K_L 45,9 GB; IQ4_XS 46,8 GB; Q4_K_S 51,5 GB; Q4_K_M 56,0 GB; Q5_K_S 60,3 GB; Q5_K_M 64,2 GB; Q6_K 76,1 GB; Q8_0 90,5 GB. El repositorio completo ocupa 609,2 GB.
- GPU recomendadas: para las cuantizaciones altas (Q6_K, Q8_0), una o varias A100/H100 de 80 GB, o configuraciones multi-GPU equivalentes. Para Q4_K_M y Q4_K_S, dos GPU de 48 GB (por ejemplo, dos RTX 4090 o dos L40S) resultan suficientes.
- GPU de consumo: ninguna GPU de consumo individual (24 GB o menos) puede alojar el modelo completo. Es posible ejecutar las cuantizaciones mas bajas con reparto entre VRAM y RAM del sistema (offload parcial) en llama.cpp, con una penalizacion notable de latencia.
- Memoria unificada: equipos tipo Apple Silicon con 64 GB, 96 GB, 128 GB o 192 GB pueden ejecutar las variantes Q4_K_M, Q5_K_M, Q6_K y Q8_0 completas en memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y backends basados en llama.cpp como text-generation-webui. Para servir los pesos originales en safetensors con mayor throughput se recomienda vLLM o TGI sobre el repositorio base, no sobre los GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia cualitativa, el regimen de ~12B parametros activos reduce los FLOPs por token en comparacion con un modelo denso de ~85B, pero el ancho de banda de memoria necesario para cargar los expertos seleccionados en cada token limita la velocidad en configuraciones con offload a CPU.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/GLM-4.5-Air-REAP-82B-A12B-GGUF (este modelo) | ~85B / 12B (nominal 82B / 12B) | no disponible | MIT | GGUF (11 cuantizaciones publicadas) | HuggingFace, 140 descargas, 0 likes |
| cerebras/GLM-4.5-Air-REAP-82B-A12B | ~85B / 12B (nominal 82B / 12B) | no disponible | no disponible en la informacion proporcionada | safetensors | HuggingFace |
| zai-org/GLM-4.5-Air (modelo original sin podar) | no disponible en la informacion proporcionada | no disponible | licencia propia de Z.ai enlazada desde el repo GGUF | safetensors | HuggingFace |
| mradermacher/GLM-4.5-Air-REAP-82B-A12B-i1-GGUF (variante con imatrix) | mismas caracteristicas del modelo base | no disponible | MIT | GGUF con cuantizaciones ponderadas | HuggingFace |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- No hay benchmarks publicados para esta version podada: no es posible afirmar que la poda REAP preserve las capacidades del GLM-4.5-Air original, y la degradacion puede ser significativa en tareas de razonamiento o codigo.
- La poda de expertos puede afectar de forma desigual a dominios concretos: los expertos eliminados podrian cubrir idiomas, terminologia tecnica o estilos que no aparezcan en el conjunto de calibracion.
- Las cuantizaciones bajas (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad de forma apreciable; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rapidas y equilibradas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan medidas especificas de mitigacion en la informacion disponible.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o equidad para esta variante.
- Idioma: la model card declara unicamente ingles; el rendimiento en castellano no esta verificado y podria ser deficiente.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con documentos largos o conversaciones multi-turno extensas.
- Licencia: el repositorio declara MIT y enlaza a la licencia del modelo original de Z.ai. Antes de un uso comercial conviene verificar que los terminos heredados del modelo base y del proceso de poda permiten la explotacion comercial.
- Trazabilidad limitada: la variante cuenta con 140 descargas y 0 likes, sin discusion ni validacion comunitaria documentada.
- Requisitos de almacenamiento: el repositorio completo ocupa 609,2 GB, por lo que conviene descargar solo la cuantizacion necesaria.
- Los ficheros de cuantizaciones superiores a Q4_K_S se distribuyen partidos en dos partes (part1of2 / part2of2) y deben concatenarse antes de su uso con llama.cpp.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/GLM-4.5-Air-REAP-82B-A12B-GGUF
- Modelo base con poda REAP (Cerebras): https://huggingface.co/cerebras/GLM-4.5-Air-REAP-82B-A12B
- Variante con cuantizaciones ponderadas (imatrix): https://huggingface.co/mradermacher/GLM-4.5-Air-REAP-82B-A12B-i1-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#GLM-4.5-Air-REAP-82B-A12B-GGUF
- Licencia del modelo original GLM-4.5-Air: https://huggingface.co/zai-org/GLM-4.5-Air/blob/main/LICENSE
- Preguntas frecuentes y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre el modelo; los enlaces anteriores proceden de la model card del repositorio y de los datos de HuggingFace.
