# F-Labs/Spark-X2.5-4B-Hadamard-GSQ

## Resumen

Spark-X2.5-4B-Hadamard-GSQ es una release comprimida del modelo base XHToken/Spark-X2.5-4B, publicada por F-Labs. No es un modelo entrenado desde cero, sino un artefacto de cuantizacion post-entrenamiento: aplica una jerarquia de precision heterogenea (DV-SSQ) sobre los pesos del modelo original, combinando INT8 en canales considerados salientes, INT4 group-wise rotado con Walsh-Hadamard (H256) sobre la masa de parametros del MLP y BF16 SVD para los residuales de bajo rango. Ademas incorpora KV-BSS, un mecanismo de afilado de la softmax en las capas de atencion que, segun el autor, refuerza los enlaces clave-valor estructurados.

El objetivo declarado es reducir el coste de memoria en inferencia manteniendo la fidelidad de generacion. La model card reporta una compresion de 8,224 GB (BF16) a 4,18 GiB (4,49 GB), un factor de 1,83x, con un top-1 exact match del 93,28% y una divergencia KL de 0,1095 nats sobre una auditoria de un unico prompt de codigo recursivo de 119 tokens. La arquitectura del modelo base no se detalla en la informacion disponible; la auditoria menciona 36 capas transformer, RMSNorm, proyecciones de atencion y embeddings de tokens atados.

El interes practico de esta ficha esta condicionado por dos factores: la licencia Apache 2.0, que permite uso comercial, y el hecho de que el autor la etiqueta explicitamente como un artefacto historico (snapshot legacy) que no ha sido reconstruido ni revalidado contra el pipeline FQuant actual. Los unicos idiomas declarados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 36 capas (segun el informe de auditoria citado en la model card: proyecciones de atencion, MLP, RMSNorm y embeddings de tokens atados). No se especifica si es denso o MoE |
| Parametros totales | 3.128.563.200 (3,13 mil millones) segun los safetensors del repo. La model card declara 4,11 mil millones para el modelo base; existe una discrepancia no explicada entre ambas cifras |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | DV-SSQ: INT8 en canales semanticos salientes, INT4 group-wise con rotacion Walsh-Hadamard H256 en el MLP, BF16 SVD de bajo rango en residuales; BF16 sin comprimir en sesgos, proyecciones de atencion, ganancias RMSNorm y embeddings atados. KV-BSS: escalado de temperatura contrastivo ($\tau_{\text{focus}} = 1.10$) en atencion |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con codigo personalizado (requiere `trust_remote_code`) |
| Tamano del repositorio | 4,5 GB (peso efectivo declarado: 4,18 GiB / 4,49 GB) |
| Modelo base | XHToken/Spark-X2.5-4B |
| Pipeline | text-generation |
| Descargas / likes | 535 / 2 |
| Fechas de publicacion | creado el 2026-09-09, actualizado el 2026-09-12 |

## Arquitectura y entrenamiento

No hay informacion disponible sobre el entrenamiento del modelo base Spark-X2.5-4B: ni numero de tokens, ni composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. La model card de esta release describe exclusivamente el proceso de compresion, no el preentrenamiento.

La innovacion tecnica se concentra en el pipeline de cuantizacion. DV-SSQ reparte la precision de forma no uniforme: los canales considerados salientes a nivel semantico se mantienen en INT8, la mayor parte de los parametros del MLP se cuantiza a INT4 por grupos tras una rotacion Walsh-Hadamard de dimension 256 (que dispersa los valores atipicos antes de cuantizar), y los residuales de alta curvatura en el espacio de autovectores se aproximan con una SVD en BF16. Los componentes sensibles a la precision (sesgos, proyecciones de atencion, ganancias RMSNorm y embeddings atados) se preservan intactos en BF16, lo que el autor denomina "Zero-Compression Shield". KV-BSS anade un escalado de temperatura en la atencion orientado a concentrar la distribucion softmax y, segun el autor, acelerar el recuerdo asociativo de enlaces clave-valor.

La validacion publicada es una auditoria causal sobre un unico prompt de codigo algoritmico recursivo de 119 tokens, recorriendo las 36 capas. No se trata, por tanto, de una evaluacion general del modelo.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Generacion de codigo: el unico material de evaluacion publicado es un prompt de codigo de algoritmo recursivo, con un 93,28% de coincidencia exacta top-1 respecto al modelo sin comprimir.
- Recuerdo de enlaces clave-valor estructurados: KV-BSS se disena especificamente para pares `["key"] => "value"`, mapeo de AST y firmas de funciones.
- Capacidades multilingues limitadas a ingles y chino, segun la metadata del repo.
- No hay evidencia publicada de soporte de tool calling, function calling, uso agentico, razonamiento multi-paso explicito, vision, audio ni modo de pensamiento.
- No se declara ninguna capacidad de contexto largo; la longitud de contexto es un dato no disponible.

## Casos de uso

- Generacion de codigo en entornos con memoria limitada: el peso de 4,18 GiB permite desplegar un modelo de la familia Spark-X2.5 en GPUs de gama media donde la version BF16 de 8,224 GB no caberia junto con el contexto y el resto del stack.
- Extraccion de estructuras clave-valor: dado el diseno explicito de KV-BSS para enlaces `["key"] => "value"`, encaja en tareas de normalizacion de configuraciones, mapeo de campos y extraccion de pares a partir de texto tecnico.
- Analisis estatico de codigo asistido: el foco declarado en mapeo de AST y firmas de funciones lo hace candidato para tareas de resumen de simbolos, generacion de stubs o documentacion de interfaces dentro de un pipeline de CI.
- Prototipado en investigacion sobre cuantizacion post-entrenamiento: el repo incluye el informe de auditoria y el esquema de cuantizacion, por lo que sirve como caso de estudio reproducible para comparar una jerarquia multi-precision frente a INT4 uniforme.
- Despliegue on-premise bilingue ingles-chino: la combinacion de licencia Apache 2.0 y huella de memoria reducida permite instalaciones locales sin dependencia de API externa en organizaciones que operan en ambos idiomas.
- Chat de asistencia tecnica de bajo coste: el pipeline `text-generation` con etiqueta `conversational` admite uso como asistente en aplicaciones donde el presupuesto de VRAM es el factor limitante, siempre que el dominio sea ingles o chino.
- Reproduccion de la auditoria de 36 capas: util para equipos que quieran verificar de forma independiente las cifras de KL, entropia y similitud coseno declaradas.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index. La evaluacion se realizo sobre `custom/single-prompt-audit`, un unico prompt de codigo recursivo de 119 tokens, con `verified: false` en todas las metricas. No son benchmarks generales.

| Metrica | Base BF16 | Spark-X2.5-4B-Hadamard-GSQ |
|---|---|---|
| Top-1 exact match (argmax) | 100,00% | 93,28% (111/119 tokens) |
| Divergencia KL | 0,000000 nats | 0,109537 nats |
| Similitud coseno (capa final 35) | 1,0000000 | 0,9074698 |
| Entropia de Shannon de los logits | 0,1843 | 0,2658 (delta +0,0815) |
| Huella de pesos | 8,224 GB | 4,18 GiB (4,49 GB) |
| Ratio de compresion | 1,000x | 1,833x (-45,43%) |
| Fraccion nula del error medio | 0,00% | 52,14% (hasta 80,99% en la capa 34) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 5-6 GB solo para pesos y overhead basico, partiendo de los 4,18 GiB declarados. La cifra exacta depende de la longitud de contexto, que es un dato no disponible.
- GPU recomendadas: no hay recomendaciones oficiales del autor. Por huella de memoria, el modelo encaja en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes. Para despliegue en servidor, A100, H100 o L40S quedan sobredimensionadas para un modelo de este tamano, salvo que se busque agregar muchas instancias por GPU.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 8 GB o mas de VRAM para pesos y contexto corto; 12-16 GB dan margen holgado.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via previsible dado el uso de codigo personalizado. La compatibilidad con vLLM, TGI, llama.cpp u Ollama no esta confirmada en la informacion disponible y es dudosa, porque el formato es una cuantizacion heterogenea propia (INT8 + INT4 rotado + BF16 SVD) que normalmente requiere kernels especificos.
- Latencia y throughput: no disponible.
- CPU: no disponible; sin kernels personalizados documentados no puede asumirse inferencia eficiente en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Huella de pesos | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| Spark-X2.5-4B-Hadamard-GSQ | 3,13 mil millones segun safetensors (4,11B declarados para el base) | no disponible | 4,18 GiB (4,49 GB) | Apache 2.0 | 93,28% top-1 exact match, KL 0,1095 nats en auditoria de 1 prompt |
| XHToken/Spark-X2.5-4B (base) | 4,11B declarados | no disponible | 8,224 GB | no disponible en la informacion proporcionada | 100% top-1 (referencia de la auditoria) |
| Otras releases cuantizadas de la familia Spark-X2.5 publicadas por F-Labs | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de clase 3-4B (p. ej. familias tipo Llama-3.2-3B o Qwen2.5-3B) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio resultados tecnicos relevantes, por lo que no se pueden aportar datos verificables de modelos comparables.

## Limitaciones y advertencias

- La evaluacion se basa en un unico prompt de 119 tokens y todas las metricas estan marcadas como no verificadas (`verified: false`). No debe interpretarse como una medida de calidad general del modelo.
- El propio autor etiqueta esta release como un snapshot historico de FQuant que no ha sido reconstruido ni revalidado contra el pipeline actual, y advierte explicitamente de que no se compare su auditoria de un solo prompt con la ruta de evaluacion mas reciente.
- La divergencia KL de 0,1095 nats y el aumento de entropia de los logits (+0,0815) indican una distribucion de salida mas blanda que la del modelo base, lo que puede traducirse en mayor variabilidad en generaciones largas.
- La similitud coseno en la capa final cae a 0,9075, lo que implica deriva representacional acumulada en la ultima capa.
- Existe una discrepancia no resuelta entre los 3.128.563.200 parametros de los safetensors y los 4,11 mil millones declarados en la model card. Conviene verificar el inventario real de tensores antes de planificar el despliegue.
- No hay informacion sobre el dataset, el proceso de alineamiento ni los sesgos del modelo base Spark-X2.5-4B, por lo que no puede evaluarse el sesgo heredado.
- Idiomas soportados limitados a ingles y chino; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Longitud de contexto no disponible: no se debe asumir capacidad de contexto largo, y menos aun despues de una cuantizacion agresiva de las proyecciones de atencion.
- Requiere ejecutar codigo personalizado (`trust_remote_code=True`); hay que auditar el codigo del repositorio antes de cargarlo, especialmente en entornos de produccion o con datos sensibles.
- Compatibilidad con runtimes de inferencia estandar (vLLM, llama.cpp, Ollama, TGI) no confirmada. Un formato de cuantizacion heterogeneo suele implicar dependencia de implementaciones propias.
- Riesgo de alucinacion: no cuantificado. KV-BSS se presenta como un mecanismo para "endurecer el umbral de alucinacion", pero no se aporta ninguna metrica de factualidad.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia. No se especifican restricciones adicionales para el modelo base.
- Las fechas de metadata (2026) son inusuales y dificultan la trazabilidad temporal de la release.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/F-Labs/Spark-X2.5-4B-Hadamard-GSQ
- Repositorio GitHub del autor: https://github.com/dsadawq3/Spark-X2.5-4B-Hadamard-GSQ
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Discusion de la comunidad (propuesta n. 14): https://huggingface.co/XHToken/Spark-X2.5-4B/discussions/14
- Pull request oficial (n. 15): https://huggingface.co/XHToken/Spark-X2.5-4B/discussions/15
- Organizacion F-Labs: https://huggingface.co/F-Labs
- Referencias arXiv citadas en las etiquetas del modelo (los titulos no se han podido confirmar con la informacion disponible):
  - https://arxiv.org/abs/2404.00456
  - https://arxiv.org/abs/2405.16406
  - https://arxiv.org/abs/2210.17323
  - https://arxiv.org/abs/2306.00978
  - https://arxiv.org/abs/2307.09782
  - https://arxiv.org/abs/2312.09934
  - https://arxiv.org/abs/2208.07339
  - https://arxiv.org/abs/2306.03078
- La busqueda web no devolvio ningun resultado tecnico relevante sobre este modelo.
