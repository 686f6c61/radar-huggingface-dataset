# mradermacher/jevify-gemma4-e4b-GGUF

## Resumen

`mradermacher/jevify-gemma4-e4b-GGUF` es una publicacion de cuantizaciones estaticas en formato GGUF del modelo `kushalpatil/jevify-gemma4-e4b`, un ajuste fino con LoRA sobre la familia gemma4. El trabajo lo firma mradermacher, un cuantizador conocido en HuggingFace por publicar versiones GGUF de modelos de terceros para su uso con llama.cpp y derivados. El repositorio no introduce un modelo nuevo: su valor esta en ofrecer el modelo base convertido a GGUF en trece niveles de cuantizacion mas dos ficheros `mmproj` (proyector multimodal) en f16 y Q8_0.

El modelo cuenta con 7.463.013.674 parametros (unos 7,46 mil millones), un tamano que lo situa en la gama media y lo hace desplegable en GPU de consumo con cuantizaciones de 4 bits. Segun las etiquetas de la model card, el ajuste esta orientado a clasificacion, calibracion y salidas probabilisticas, ademas de mantener un perfil conversacional, y esta declarado unicamente para ingles. No se publica informacion sobre arquitectura interna, datos de entrenamiento ni longitud de contexto.

La relevancia de esta ficha es practica: permite ejecutar localmente un fine-tune especializado en clasificacion probabilistica sin depender de infraestructura en la nube, eligiendo entre variantes de 4,5 GB (Q2_K) y 15,0 GB (f16) segun el hardware disponible. Como contrapartida, el repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta, y no incluye benchmarks ni documentacion tecnica adicional, por lo que su evaluacion en produccion exige validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado de la familia gemma4; la model card no detalla la arquitectura) |
| Parametros totales | 7.463.013.674 (~7,46 mil millones), dato de safetensors del modelo |
| Parametros activos | no disponible (no se declara que sea MoE ni se indica el sufijo "e4b" como parametros efectivos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; proyectores multimodales mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (ingles), segun la model card; no se declaran otros idiomas |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (llama.cpp); el modelo de origen se publica en safetensors con transformers |
| Modelo base | kushalpatil/jevify-gemma4-e4b (ajuste con LoRA) |
| Cuantizador | mradermacher (quants estaticos) |
| Tamano del repositorio | 76,4 GB |
| Fecha de publicacion | 2026-09-20 (creacion), 2026-09-20 (ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo. Se sabe que `kushalpatil/jevify-gemma4-e4b` es un ajuste con LoRA (etiqueta `lora` en la model card) sobre una base de la familia gemma4, y que mradermacher ha generado cuantizaciones estaticas a partir de el. El proceso documentado se limita a la conversion: `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`, con un conjunto de cuantizaciones predefinidas y sin uso de imatrix ni de calibracion ponderada (el autor indica que los quants ponderados por imatrix "no parecen estar disponibles" y que podria no planificarlos). No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

El unico indicio tecnico adicional es la presencia de ficheros `mmproj` (proyector multimodal) en f16 y Q8_0, lo que sugiere que el modelo base incorpora o hereda capacidad de entrada multimodal de la familia gemma. No se especifica que modalidades cubre ni como se integra ese proyector con el ajuste LoRA. Tampoco hay innovaciones declaradas (atencion lineal, decodificacion especulativa, MatFormer u otras): simplemente no se documentan.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` y la compatibilidad declarada con endpoints (`endpoints_compatible`).
- Clasificacion de texto, segun las etiquetas `classification` y `jevify`.
- Calibracion y salida probabilistica (`calibration`, `probabilistic`): el ajuste parece orientado a producir puntuaciones de confianza o distribuciones de probabilidad, aunque no se documenta el formato exacto de salida.
- Entrada multimodal: el repositorio incluye proyectores `mmproj` en f16 y Q8_0, lo que habilita el uso con modelos multimodales en llama.cpp, pero no se confirma que modalidades (imagen, audio) soporta el ajuste.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking" o razonamiento explicito: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card; no se declaran otros idiomas.
- Generacion de codigo y matematicas: no disponible (no se declara ni se evalua).

## Casos de uso

- Clasificacion de tickets de soporte con umbral de confianza: el modelo puede asignar categorias y, gracias al enfoque probabilistico declarado, ofrecer una puntuacion que permita derivar automaticamente los casos dudosos a un revisor humano.
- Enrutado de consultas en un sistema RAG: usar la salida calibrada para decidir si una pregunta debe responderse con recuperacion documental, con un modelo mayor o con una respuesta directa, reduciendo coste por consulta.
- Moderacion y triaje de contenido en ingles: clasificacion binaria o multietiqueta en local, sin enviar el texto a servicios externos, lo que simplifica el cumplimiento de requisitos de privacidad.
- Etiquetado asistido de datasets: preanotar grandes volumenes de texto en ingles con probabilidades por clase y reservar la revision humana para los casos de baja confianza.
- Asistente conversacional local en estaciones de trabajo sin GPU dedicada: las variantes Q4_K_S y Q4_K_M (5,3 y 5,4 GB) permiten ejecucion en CPU con llama.cpp u Ollama con latencia aceptable para uso interactivo no critico.
- Analisis de documentos con entrada multimodal: los ficheros `mmproj` permiten combinar el modelo con un proyector multimodal en llama.cpp para tareas que requieran interpretar imagenes junto a texto, siempre que se valide previamente el comportamiento real del ajuste LoRA en esa modalidad.
- Deteccion de anomalias o incertidumbre en pipelines de datos: al exponer probabilidades calibradas, el modelo puede emplearse como filtro de calidad antes de que los datos entren en un proceso posterior.
- Despliegue en entornos aislados (air-gapped): al distribuirse como GGUF con licencia gemma y sin dependencia de APIs externas, es viable en infraestructura sin salida a internet, sujeto a los terminos de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye metricas (MMLU, HumanEval, GSM8K ni ninguna otra), y la busqueda web asociada no aporto documentacion tecnica relevante. El unico dato de rendimiento indirecto es la tabla de tamanos por cuantizacion:

| Cuantizacion | Tamano (GB) | Nota del autor |
|---|---|---|
| Q2_K | 4,5 | no especificada |
| Q3_K_S | 4,7 | no especificada |
| Q3_K_M | 4,9 | calidad inferior |
| Q3_K_L | 5,1 | no especificada |
| IQ4_XS | 5,2 | no especificada |
| Q4_K_S | 5,3 | rapida, recomendada |
| Q4_K_M | 5,4 | rapida, recomendada |
| Q5_K_S | 5,7 | no especificada |
| Q5_K_M | 5,8 | no especificada |
| Q6_K | 6,3 | calidad muy buena |
| Q8_0 | 8,1 | rapida, mejor calidad |
| f16 | 15,0 | 16 bpw, excesiva |
| mmproj-Q8_0 | 0,7 | complemento multimodal |
| mmproj-f16 | 1,1 | complemento multimodal |

No hay datos de perplejidad, precision en clasificacion ni tasas de acierto para este ajuste concreto.

## Requisitos de hardware

- VRAM estimada (solo pesos): Q2_K ~4,5 GB; Q4_K_S ~5,3 GB; Q4_K_M ~5,4 GB; Q5_K_M ~5,8 GB; Q6_K ~6,3 GB; Q8_0 ~8,1 GB; f16 ~15,0 GB.
- VRAM estimada con cache KV y overhead de runtime: anadir aproximadamente 1-2 GB sobre el peso en cuantizaciones de 4-5 bits con contextos moderados; para Q8_0 conviene reservar 10 GB o mas; para f16, 16 GB o mas.
- Complemento multimodal: sumar 0,7 GB (mmproj-Q8_0) o 1,1 GB (mmproj-f16) si se activa la entrada multimodal.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 / 4070 Ti, RTX 4080, RTX 4090 24 GB. Las variantes Q4 y Q5 caben holgadamente en 8-12 GB; Q8_0 requiere 12 GB o mas; f16 exige 16-24 GB.
- GPU profesionales: A100 40/80 GB, H100 80 GB y L40S 48 GB pueden alojar cualquier cuantizacion, incluida f16, con contextos amplios (rendimiento no publicado).
- Ejecucion en CPU: viable con llama.cpp y mmap; Q4_K_M necesita alrededor de 6-7 GB de RAM libre, y f16 en torno a 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no estan pensados para GGUF (vLLM solo ofrece soporte experimental para este formato), por lo que para servir en produccion con esas herramientas habria que partir de los pesos originales en safetensors.
- Latencia y throughput: no disponible (no se publican mediciones de tokens por segundo ni de latencia).

## Comparativa con modelos similares

No se dispone de resultados de benchmarks ni de descripciones tecnicas de alternativas dentro de la informacion proporcionada, por lo que la comparacion se limita a aspectos de distribucion y licencia. La model card no menciona modelos comparables.

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| mradermacher/jevify-gemma4-e4b-GGUF (este) | 7,46 mil millones | no disponible | GGUF (13 quants + 2 mmproj) | gemma | Publicado, 0 descargas |
| kushalpatil/jevify-gemma4-e4b | no disponible en la informacion | no disponible | safetensors (transformers) | gemma | Modelo base del ajuste LoRA |
| Alternativas de la misma categoria (otros GGUF de ~7-8 B) | no disponible | no disponible | no disponible | no disponible | no disponible |

En la practica, la comparacion relevante para un desarrollador es entre las propias cuantizaciones del repositorio: Q4_K_M como opcion equilibrada (5,4 GB), Q6_K si se prioriza calidad (6,3 GB) y Q8_0 cuando hay VRAM suficiente (8,1 GB). No hay datos objetivos de perdida de calidad por cuantizacion en este modelo concreto; el autor enlaza una grafica generica de perplejidad de ikawrakow y las notas de Artefact2 sobre tipos de cuantizacion.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se publican datos de entrenamiento, arquitectura, contexto maximo ni formato de salida esperado, lo que dificulta estimar su comportamiento antes de probarlo.
- Sin benchmarks ni evaluaciones: no hay evidencia publica de su rendimiento en clasificacion, generacion o calibracion; cualquier afirmacion sobre su calidad requiere una evaluacion propia sobre el caso de uso concreto.
- Idoneidad para clasificacion no verificada en el repositorio cuantizado: aunque las etiquetas apuntan a clasificacion y calibracion probabilistica, no se documenta como interpretar las salidas como probabilidades ni si la cuantizacion degrada esa calibracion.
- Riesgo de alucinacion: al ser un modelo de lenguaje generativo, puede producir contenido incorrecto o inventado; en tareas de clasificacion esto se traduce en etiquetas y puntuaciones de confianza mal calibradas si no se validan.
- Sesgos: no disponibles. Al no documentarse la composicion del dataset de ajuste, no es posible evaluar sesgos de genero, raza, ideologia u otros.
- Idioma: unicamente ingles declarado. El rendimiento en castellano no esta soportado ni evaluado y previsiblemente sera degradado.
- Contexto: la longitud de contexto es no disponible; planificar despliegues con ventanas largas sin verificarla puede provocar truncamientos silenciosos.
- Licencia gemma: el uso comercial esta sujeto a los Gemma Terms of Use, que incluyen una politica de uso prohibido y obligaciones de atribucion y de redistribucion de los terminos a los usuarios finales. Conviene revisarla antes de integrarlo en un producto.
- Madurez del repositorio: 0 descargas y 0 likes en la fecha indicada, creado y actualizado el mismo dia, sin validacion de la comunidad ni historial de mantenimiento. Ademas, la fecha de publicacion registrada (2026-09-20) resulta atipica, lo que refuerza la necesidad de verificar el origen del artefacto antes de usarlo.
- Quants ponderados no disponibles: el autor indica que no hay cuantizaciones con imatrix y que podria no llegar a generarlas, lo que limita las opciones de calidad intermedia.
- Multimodalidad sin confirmar: la presencia de ficheros `mmproj` no garantiza que el ajuste LoRA conserve correctamente las capacidades multimodales del modelo base.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/mradermacher/jevify-gemma4-e4b-GGUF
- Modelo base (ajuste LoRA): https://huggingface.co/kushalpatil/jevify-gemma4-e4b
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#jevify-gemma4-e4b-GGUF
- Peticiones de modelos al cuantizador: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que aporta infraestructura al cuantizador: https://www.nethype.de/

Nota: la busqueda web realizada no devolvio resultados utiles sobre este modelo; los unicos resultados obtenidos fueron enlaces genericos a Instagram, sin relacion con el modelo. No se han localizado papers, blogs ni demos adicionales.
