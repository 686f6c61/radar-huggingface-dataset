# mradermacher/G4-Jamet-26B-A4B-MK-1-GGUF

## Resumen

G4-Jamet-26B-A4B-MK-1-GGUF es una recopilacion de cuantizaciones en formato GGUF generada por mradermacher a partir del modelo Hastagaras/G4-Jamet-26B-A4B-MK-1. No se trata por tanto de un modelo entrenado desde cero, sino de una conversion de pesos a cuantizaciones estaticas de 2 a 8 bits pensadas para inferencia local con llama.cpp y sus derivados (Ollama, LM Studio, kobold.cpp). El repositorio ocupa 184,9 GB en total porque alberga todas las variantes simultaneamente, y cada archivo individual pesa entre 10,7 GB (Q2_K) y 27,0 GB (Q8_0).

El modelo base declara 25.233.142.046 parametros en safetensors, es decir, unos 25,2 mil millones. La nomenclatura "26B-A4B" sigue la convencion habitual de los modelos de mezcla de expertos (MoE) que indica un total de parametros y el numero de parametros activos por token, de modo que el sufijo "A4B" apunta a unos 4 mil millones de parametros activos; este dato no aparece confirmado en la informacion disponible. Los resultados de busqueda relacionados mencionan modelos de la familia Gemma en formato 26B-A4B, lo que sugiere que el modelo base parte de esa arquitectura, aunque el autor del modelo base figura como Hastagaras y no como Google.

Se trata de un modelo muy reciente (publicado el 1 de octubre de 2026 segun los metadatos) con cero descargas y cero "likes" en el momento de redactar esta ficha, licencia no especificada y sin resultados de benchmarks publicados. Su interes practico esta en que permite ejecutar un modelo de ~25B parametros totales con coste de inferencia propio de un modelo de ~4B activos en hardware de consumo, siempre que se acepte la ausencia de documentacion sobre entrenamiento, licencia y evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura "A4B" sugiere mezcla de expertos con ~4B parametros activos, sin confirmar) |
| Parametros totales | 25.233.142.046 (segun safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16 (referenciada en metadatos, no listada en la tabla de archivos), Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, ademas de mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (transformers como libreria declarada; el modelo base esta en safetensors) |

Detalle de tamanos por cuantizacion:

| Cuantizacion | Tamano (GB) | Nota del autor |
|---|---|---|
| mmproj-Q8_0 | 0,9 | suplemento multimodal |
| mmproj-f16 | 1,3 | suplemento multimodal |
| Q2_K | 10,7 | |
| Q3_K_S | 12,3 | |
| Q3_K_M | 13,4 | calidad inferior |
| Q3_K_L | 13,9 | |
| IQ4_XS | 14,2 | |
| Q4_K_S | 15,6 | rapida, recomendada |
| Q4_K_M | 16,9 | rapida, recomendada |
| Q5_K_S | 18,1 | |
| Q5_K_M | 19,2 | |
| Q6_K | 22,7 | muy buena calidad |
| Q8_0 | 27,0 | rapida, mejor calidad |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base Hastagaras/G4-Jamet-26B-A4B-MK-1: se desconoce el numero de tokens, la composicion del dataset, si hubo ajuste por instrucciones, RLHF, DPO u otra tecnica de alineamiento. El repositorio de mradermacher es exclusivamente una labor de cuantizacion (etiqueta "quantized_by: mradermacher", "quantize_version: 2", "output_tensor_quantised: 1", "convert_type: hf"), de modo que no aporta ni modifica el entrenamiento original.

El unico indicio estructural es la propia nomenclatura del nombre: el patron "26B-A4B" se usa habitualmente para describir arquitecturas de mezcla de expertos con decodificacion dispersa, donde solo una fraccion de los parametros se activa por token. La presencia de archivos mmproj (proyeccion multimodal) en el repositorio indica que el modelo base incorpora algun tipo de entrada visual o multimodal, algo coherente con los modelos de la familia Gemma recientes que aparecen en los resultados de busqueda. Todos estos puntos son inferencias a partir de los nombres y metadatos, no datos confirmados por el autor.

## Capacidades

- Generacion de texto conversacional: la etiqueta "conversational" aparece explicitamente en los metadatos del repositorio.
- Entrada multimodal: el repositorio incluye los archivos mmproj-Q8_0 y mmproj-f16, lo que habilita el procesamiento de imagenes junto con texto cuando se usa un runtime compatible (por ejemplo, llama.cpp con soporte de proyeccion multimodal).
- Razonamiento y generacion de codigo: capacidad esperable en un modelo de esta familia y tamano, pero no verificada ni documentada en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio; no se declara soporte de castellano ni de otros idiomas.
- Modo "thinking" o razonamiento extendido: no disponible.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta "endpoints_compatible", orientada al despliegue en infraestructura de Hugging Face.

## Casos de uso

- Asistente conversacional local con entrada de imagenes: gracias a los archivos mmproj, se puede montar un asistente que reciba capturas de pantalla o fotografias y responda en lenguaje natural, ejecutandose integramente en una estacion de trabajo con una GPU de 24 GB usando la cuantizacion Q4_K_M.
- Despliegue en portatiles con GPU de gama media: la variante Q2_K (10,7 GB) o Q3_K_S (12,3 GB) permite ejecutar el modelo en equipos con 12 GB de VRAM, algo inviable con el modelo en precision completa.
- Procesamiento por lotes de documentacion en ingles: con Q5_K_M o Q6_K se puede resumir, clasificar y extraer informacion de textos largos en un servidor con una unica GPU, equilibrando calidad y coste de memoria.
- Prototipado rapido de aplicaciones conversacionales: al estar en formato GGUF, se integra directamente con Ollama y LM Studio, lo que permite tener un endpoint de chat funcionando en minutos sin dependencias de Python ni de CUDA especificas.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece ocho niveles de cuantizacion del mismo modelo, util para medir en un pipeline propio la perdida de calidad (perplejidad, precision en tareas) frente al ahorro de memoria.
- Experimentacion academica con modelos MoE dispersos: el modelo permite estudiar el comportamiento de arquitecturas con parametros activos reducidos en tareas de razonamiento, siempre que se documenten las limitaciones de licencia.
- Inferencia en CPU o Apple Silicon: las cuantizaciones mas agresivas (Q2_K, Q3_K_M) hacen viable la ejecucion en equipos sin GPU dedicada, aunque con latencias mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio de cuantizaciones ni los metadatos del modelo base incluyen valores de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion. Tampoco se dispone de mediciones de perplejidad por cuantizacion para este modelo concreto, mas alla del grafico generico de comparacion de tipos de cuantizacion que el autor enlaza.

## Requisitos de hardware

- Memoria aproximada en VRAM (solo pesos, sin cache KV): Q2_K unos 11 GB, Q3_K_S unos 12,5 GB, IQ4_XS unos 14,5 GB, Q4_K_S unos 16 GB, Q4_K_M unos 17 GB, Q6_K unos 23 GB, Q8_0 unos 27 GB, f16 alrededor de 50 GB.
- A la memoria de pesos hay que sumar la cache KV, que depende de la longitud de contexto; con contextos largos el consumo puede crecer varios GB adicionales.
- GPU de consumo capaces de ejecutar Q4_K_M con contexto moderado: RTX 3090, RTX 4090, RTX 5090 y equivalentes con 24 GB o mas de VRAM.
- GPU de 12 GB (RTX 3060 de 12 GB, RTX 4070) pueden ejecutar Q2_K y Q3_K_S, con posible desbordamiento parcial a RAM si se amplia el contexto.
- Q6_K y Q8_0 requieren tarjetas de 24 GB con margen escaso o de 32 GB en adelante (por ejemplo, RTX 5090 de 32 GB, A100 de 40 GB, L40S).
- Para trabajar en f16 sin cuantizar hacen falta configuraciones multi-GPU o una A100/H100 de 80 GB.
- El modelo tambien es ejecutable en CPU y en Apple Silicon con memoria unificada, usando Metal a traves de llama.cpp; la variante Q4_K_M necesita unos 17 GB de memoria unificada mas el margen para contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp y cualquier runtime compatible con GGUF. Para vLLM o TGI seria preferible partir del modelo base en safetensors en lugar de las cuantizaciones GGUF.
- Latencia y throughput: no disponible. Al no haber datos publicados ni benchmarks, no es posible estimar tokens por segundo de forma fiable.

## Comparativa con modelos similares

No se dispone de datos verificados de rendimiento para este modelo, por lo que cualquier comparacion cuantitativa seria especulativa. Se ofrece a continuacion una comparacion estructural limitada a lo que consta en los metadatos.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| G4-Jamet-26B-A4B-MK-1 (este, cuantizado) | 25,2B totales, activos no disponibles | no disponible | no disponible | GGUF | Cuantizaciones de 10,7 a 27 GB; entrada multimodal via mmproj |
| Hastagaras/G4-Jamet-26B-A4B-MK-1 | 25,2B totales | no disponible | no disponible | safetensors | Modelo base del que derivan estas cuantizaciones |
| mradermacher/Jamet-26B-A4B-EXP-1-GGUF | no disponible | no disponible | no disponible | GGUF | Repositorio hermano del mismo cuantizador; no se ha confirmado la relacion entre ambos |
| mradermacher/G4-Midnight-Macaw-26B-A4B-i1-GGUF | no disponible | no disponible | no disponible | GGUF | Otro modelo de la misma familia nominal "G4 ... 26B-A4B" |

No se han localizado datos publicados que permitan comparar este modelo con alternativas consolidadas de tamano similar en terminos de MMLU, HumanEval o cualquier otra metrica.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo base ni la de las cuantizaciones, por lo que no se puede garantizar el uso comercial. Conviene contactar con los autores antes de cualquier despliegue en produccion.
- Ausencia total de documentacion de entrenamiento: no se conocen los datos utilizados, el proceso de alineamiento ni las tecnicas de filtrado, lo que impide evaluar sesgos de forma sistematica.
- Riesgo de alucinacion: al no existir benchmarks ni evaluaciones publicadas, no hay ninguna medida de fiabilidad factual. En un modelo conversacional de este tamano el riesgo de inventar datos es alto y debe mitigarse con verificacion externa.
- Idiomas: el repositorio solo declara ingles ("en"). El rendimiento en castellano es, como minimo, incierto y probablemente degradado.
- Longitud de contexto desconocida: no se especifica la ventana maxima soportada, lo que dificulta planificar casos de uso con documentos largos.
- Modelo practicamente sin adopcion: cero descargas y cero "likes" en el momento de la ficha, sin issues ni discusiones que permitan validar su comportamiento real.
- Perdida de calidad por cuantizacion: las variantes Q2_K y Q3_K_S reducen notablemente la fidelidad respecto al modelo original; el propio autor marca Q3_K_M como "calidad inferior" y recomienda Q4_K_S y Q4_K_M como opciones equilibradas.
- Las cuantizaciones son estaticas: el autor indica que no ha generado cuantizaciones ponderadas con imatrix para este modelo, lo que en otros casos suele mejorar la calidad a igual tamano.
- Datos de identificacion dudosos: las fechas de creacion y actualizacion (octubre de 2026) son posteriores a la fecha de referencia habitual y el autor del modelo base no es un laboratorio conocido, por lo que conviene verificar la procedencia antes de confiar en el modelo.
- Soporte multimodal condicionado al runtime: los archivos mmproj solo funcionan con implementaciones concretas de llama.cpp; no todos los frontends los soportan.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones: https://huggingface.co/mradermacher/G4-Jamet-26B-A4B-MK-1-GGUF
- Modelo base: https://huggingface.co/Hastagaras/G4-Jamet-26B-A4B-MK-1
- Pagina de vision general y descargas del cuantizador: https://hf.tst.eu/model#G4-Jamet-26B-A4B-MK-1-GGUF
- Peticiones de modelos al cuantizador: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que da soporte al cuantizador: https://www.nethype.de/
- Repositorio relacionado del mismo cuantizador: https://huggingface.co/mradermacher/Jamet-26B-A4B-EXP-1-GGUF
- Otro modelo de la misma familia nominal: https://huggingface.co/mradermacher/G4-Midnight-Macaw-26B-A4B-i1-GGUF
- Indice de modelos GGUF de mradermacher: https://graysoft.dev/authors/m/mradermacher.html
- Referencia sobre la familia Gemma 4 26B-A4B en formato GGUF: https://local-ai-zone.github.io/models/google-gemma-4-26b-a4b-it.html
- Proyecto de inferencia de bajo consumo para Gemma 4 26B-A4B: https://github.com/drumih/turbo-fieldfare
