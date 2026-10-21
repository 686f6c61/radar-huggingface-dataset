# mradermacher/Huihui-LFM2-24B-A2B-abliterated-GGUF

## Resumen

Huihui-LFM2-24B-A2B-abliterated-GGUF es la versión cuantizada en formato GGUF del modelo huihui-ai/Huihui-LFM2-24B-A2B-abliterated, un derivado "abliterated" (con los mecanismos de rechazo suprimidos mediante edición de direcciones en el espacio de activaciones) del LFM2-24B-A2B de Liquid AI. Este repositorio lo publica mradermacher (nethype GmbH), un cuantizador de referencia en la comunidad, y ofrece una batería de cuantizaciones estáticas K-quant e I-quant para ejecución en CPU y GPU con llama.cpp y derivados.

El modelo base pertenece a la familia LFM2 de Liquid AI, diseñada para despliegue en el borde ("edge") con una arquitectura de mezcla de expertos (MoE): 23.843.661.440 parámetros totales y, según la nomenclatura "A2B" del nombre, del orden de 2.000 millones de parámetros activos por token. Esa relación entre parámetros totales y activos es lo que permite que un modelo de casi 24.000 millones se ejecute con un coste de cómputo por token comparable al de un modelo denso mucho más pequeño, algo especialmente relevante en hardware de consumo.

La relevancia de esta ficha es doble: por un lado, ilustra el flujo habitual de la comunidad open source (modelo base corporativo, fine-tune/abliteration por terceros, cuantización por un cuarto actor); por otro, permite ejecutar en local un modelo de 24B con ventanas de contexto largas y una velocidad de decodificación muy superior a la de un denso equivalente. El coste es la pérdida de garantías de alineamiento y seguridad del modelo original, además de una licencia LFM Open License v1.0 que no es de código abierto en sentido estricto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia LFM2 de Liquid AI; variante "abliterated" |
| Parametros totales | 23.843.661.440 (23,84 B) |
| Parametros activos | Del orden de 2 B segun la nomenclatura "A2B" del modelo base; cifra exacta no disponible en la informacion proporcionada |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes ponderadas/imatrix en el repo i1-GGUF |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, japones, coreano, espanol |
| Licencia | lfm1.0 (LFM Open License v1.0, catalogada como "other" en HuggingFace) |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base y en el fine-tune original |
| Tamano del repositorio | 161,8 GB |
| Descargas / likes | 422 descargas, 1 like |
| Fecha de creacion / ultima actualizacion | 2026-03-01 / 2026-10-21 |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de la familia LFM2 de Liquid AI, una línea explícitamente orientada a inferencia en dispositivos de borde. El tag "edge" y la relación 24B totales / ~2B activos indican un enrutamiento disperso en el que solo una fracción de los expertos se activa por token, de modo que el coste de cómputo y de ancho de banda de memoria por token se aproxima al de un modelo denso de 2B, mientras que la capacidad almacenada corresponde a 24B. No se dispone en la información proporcionada de detalles sobre el número de capas, el número de expertos, la estrategia de enrutamiento ni el mecanismo de atención concreto.

Sobre el entrenamiento del modelo original no hay datos en la información disponible (ni volumen de tokens, ni composición del dataset, ni si hubo RLHF, DPO o una fase de razonamiento explícita). Lo que sí está documentado por el ecosistema es el proceso posterior: huihui-ai aplicó una técnica de *abliteration* sobre el LFM2-24B-A2B, que consiste en identificar la dirección de las activaciones asociada a la negativa a responder y proyectarla fuera de los pesos, eliminando el comportamiento de rechazo sin reentrenar. Posteriormente, mradermacher generó las cuantizaciones estáticas con llama.cpp (tag interno `quantize_version: 2`, `convert_type: hf`), incluyendo además una familia paralela de cuantizaciones ponderadas con matriz de importancia (imatrix) en el repositorio `Huihui-LFM2-24B-A2B-abliterated-i1-GGUF`, que suele ofrecer mejor calidad por bit que las estáticas equivalentes.

## Capacidades

- Generación de texto conversacional multi-turno en ocho idiomas (inglés, árabe, chino, francés, alemán, japonés, coreano y español).
- Razonamiento general y respuesta a instrucciones, heredado del modelo base de Liquid AI.
- Generación de código y tareas de transformación de texto, asumiendo el rendimiento típico de un MoE de ~2B activos.
- Ejecución local en CPU y GPU mediante llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF.
- Modelo "uncensored": no aplica rechazos aprendidos, lo que permite tratar temas que el modelo original bloquearía.
- Capacidad de *self-hosting* y ajuste fino posterior sobre los cuantizados Q8_0 o sobre los pesos safetensors del modelo base.
- No se ha documentado en la información disponible soporte de *tool calling*, uso de agentes, visión, audio ni modo de razonamiento explícito; no deben asumirse.

## Casos de uso

- **Generación de narrativa y ficción sin filtros**: el proceso de abliteration elimina las negativas del modelo original, lo que lo hace adecuado para escritura creativa con temáticas adultas, violencia o temas controvertidos en un entorno controlado y privado, sin depender de APIs externas que apliquen sus propias políticas.
- **Procesamiento de documentos en local con requisitos de privacidad**: al ejecutarse íntegramente en hardware propio con llama.cpp, permite resumir y reescribir documentación sensible (contratos, informes internos, historiales) sin que los datos salgan de la organización.
- **Asistente de desarrollo offline**: con la cuantización Q4_K_M (14,5 GB) cabe en una GPU de 24 GB y sirve como autocompletado y generador de código en entornos sin conexión o con políticas que prohíben servicios en la nube.
- **Traducción y localización multilingüe**: los ocho idiomas declarados cubren los pares más habituales en productos con mercado europeo y asiático; su uso típico sería la traducción de cadenas de interfaz y documentación con revisión humana posterior, dado el riesgo de alucinación.
- **Anotación y preprocesado de datasets**: por su bajo coste por token (~2B activos), es adecuado para tareas de etiquetado masivo, reescritura, clasificación y generación de datos sintéticos en pipelines por lotes, donde el throughput importa más que la calidad punta.
- **Investigación sobre alineamiento y seguridad**: la pareja modelo original / modelo abliterated constituye un caso de estudio controlado para medir cuánto del comportamiento de rechazo reside en una única dirección del espacio de activaciones, y para evaluar la degradación colateral que introduce la edición.
- **Sustituto de bajo coste en prototipado**: permite validar una aplicación basada en LLM con un modelo de 24B antes de comprometerse con una API comercial, midiendo latencia, calidad y consumo de memoria reales en el hardware objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio es una publicación de cuantizaciones y no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite; tampoco la model card del modelo base aportada recoge métricas. Cualquier cifra que se cite para este modelo debería obtenerse midiendo directamente sobre las cuantizaciones publicadas, teniendo en cuenta que las cuantizaciones de 2 y 3 bits degradan de forma notable la perplejidad y que la abliteration puede alterar los resultados en evaluaciones de seguridad.

## Requisitos de hardware

- **VRAM estimada según cuantización** (tamaño de fichero, sin contar caché KV): Q2_K 8,8 GB; Q3_K_S 10,4 GB; Q3_K_M 11,5 GB; Q3_K_L 12,4 GB; IQ4_XS 12,9 GB; Q4_K_S 13,6 GB; Q4_K_M 14,5 GB; Q5_K_S 16,5 GB; Q5_K_M 17,0 GB; Q6_K 19,7 GB; Q8_0 25,5 GB. Añadir entre 1 y 3 GB adicionales para la caché KV según longitud de contexto y número de sesiones simultáneas.
- **GPU de consumo**: una RTX 4090 o RTX 3090 (24 GB) aloja íntegramente hasta Q6_K (19,7 GB) con contexto moderado; Q8_0 no cabe en 24 GB. Las RTX 4080/4070 Ti Super (16 GB) quedan limitadas a IQ4_XS o Q4_K_S con contexto corto. Las GPU de 8-12 GB solo permiten Q2_K o Q3_K_S, o bien descarga parcial de capas a CPU.
- **GPU de centro de datos**: A100 40/80 GB, H100 80 GB y L40S 48 GB ejecutan Q8_0 con contexto largo y varios usuarios concurrentes; al ser un MoE con ~2B activos, el throughput por GPU es alto en comparación con un denso de 24B.
- **CPU y memoria del sistema**: al ser MoE, la inferencia en CPU es viable. Con 32 GB de RAM se puede ejecutar Q4_K_M; con 64 GB, Q8_0. Se recomienda almacenamiento NVMe por el tamaño del repositorio (161,8 GB si se descargan todas las variantes).
- **Opciones de despliegue**: llama.cpp (`llama-server`, `llama-cli`), Ollama, LM Studio, KoboldCpp y cualquier frontend compatible con GGUF. vLLM y TGI no consumen GGUF de forma nativa; para esos motores habría que partir de los safetensors del modelo base.
- **Latencia y throughput**: no hay mediciones publicadas en la información disponible. Como referencia estructural, el reparto de ~2B activos sitúa la decodificación muy por encima de un denso de 24B, pero el rendimiento real depende de cuántos expertos se consulten por token y del ancho de banda de memoria del dispositivo.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de su documentación pública habitual y no están verificados en la información de esta ficha; se incluyen solo como orientación.

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-LFM2-24B-A2B-abliterated (este) | 23,84 B | ~2 B (MoE) | No disponible | lfm1.0 | Sin rechazos; solo GGUF en este repo; 422 descargas |
| LFM2-24B-A2B (Liquid AI, original) | 23,84 B | ~2 B (MoE) | No disponible | lfm1.0 | Modelo de referencia con alineamiento intacto; safetensors |
| Qwen3-30B-A3B | 30,5 B | 3,3 B (MoE) | 128 K (documentado por Qwen) | Apache 2.0 | Alternativa MoE con licencia permisiva y ecosistema de cuantizaciones muy amplio |
| Mistral Small 3.x 24B | 24 B | 24 B (denso) | 128 K (documentado por Mistral) | Apache 2.0 | Denso: más calidad por parámetro en algunas tareas, pero mucho más lento y con mayor huella de VRAM por token |

La comparación relevante para este repositorio no es solo de modelo, sino de licencia: frente a Qwen3 o Mistral Small, la LFM Open License v1.0 impone condiciones adicionales que deben revisarse antes de un despliegue comercial. Frente al LFM2 original, la diferencia es la eliminación de los rechazos, con el coste de alineamiento que ello implica.

## Limitaciones y advertencias

- **Ausencia de mecanismos de rechazo**: la abliteration suprime el comportamiento de negativa, por lo que el modelo responderá a peticiones dañinas, ilegales o sexualmente explícitas. No debe exponerse sin moderación externa en productos de cara al público.
- **Posible degradación cognitiva**: la edición de direcciones de activaciones no es selectiva; es habitual observar pérdida de coherencia, mayor tasa de alucinación y peor seguimiento de instrucciones complejas respecto al modelo base. No se han publicado evaluaciones que cuantifiquen ese deterioro en este caso.
- **Alucinaciones**: como cualquier LLM, genera contenido falso con apariencia plausible. La cuantización a 2-4 bits incrementa el riesgo; para tareas factuales conviene usar Q6_K o Q8_0.
- **Licencia no OSI**: `lfm1.0` (LFM Open License v1.0) se clasifica como "other". Es obligatorio leer el fichero LICENSE del repositorio antes de cualquier uso comercial; no debe asumirse que los permisos de Apache 2.0 o MIT aplican aquí.
- **Cobertura idiomática desigual**: los ocho idiomas declarados no implican calidad homogénea; el inglés suele concentrar la mayor parte de los datos de entrenamiento, y el español o el coreano pueden rendir peor en tareas de razonamiento complejo.
- **Contexto no documentado**: no se ha podido confirmar la longitud de contexto soportada. Configurar ventanas superiores a la real producirá degradación silenciosa, y las cachés KV largas consumen VRAM adicional.
- **Trazabilidad**: este repositorio es una cuantización de terceros de un fine-tune de terceros sobre un modelo corporativo. Los errores pueden introducirse en cualquiera de las tres etapas; para producción conviene fijar un hash de fichero concreto y verificarlo.
- **Sin benchmarks**: no hay métricas publicadas, por lo que cualquier afirmación de rendimiento es una extrapolación estructural, no una medición.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Huihui-LFM2-24B-A2B-abliterated-GGUF
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Huihui-LFM2-24B-A2B-abliterated-i1-GGUF
- Modelo base del cuantizado (fine-tune abliterated): https://huggingface.co/huihui-ai/Huihui-LFM2-24B-A2B-abliterated
- Página de descargas del cuantizador: https://hf.tst.eu/model#Huihui-LFM2-24B-A2B-abliterated-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de referencia (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por tipo de quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los únicos resultados obtenidos eran contenido para adultos sin relación con la ficha y se han descartado. No se dispone por tanto de enlaces a papers, blogs técnicos ni demos oficiales.
