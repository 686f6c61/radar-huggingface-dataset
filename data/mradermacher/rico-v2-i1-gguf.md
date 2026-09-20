# mradermacher/RICO-v2-i1-GGUF

## Resumen

RICO-v2-i1-GGUF es una coleccion de cuantizaciones en formato GGUF, generadas con el metodo imatrix, del modelo darkc0de/RICO-v2. El trabajo lo firma mradermacher, un autor conocido por producir cuantizaciones de terceros para modelos abiertos. Se trata de un artefacto de reempaquetado y compresion de pesos, no de un modelo entrenado desde cero: la investigacion original corresponde a darkc0de.

La model card indica que el modelo base es un modelo de vision (vision language model) afinado sobre el dataset darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT, y las etiquetas declaradas (uncensored, abliterated, heretic, harmful, toxic, not-for-all-audiences, experimental) lo sitúan en el nicho de modelos sin censura, orientados a investigacion restringida. El unico idioma declarado es el ingles.

Es relevante ahora por dos motivos: primero, porque permite ejecutar un modelo multimodal sin restricciones de rechazo en hardware modesto gracias al formato GGUF; segundo, porque su publicacion es muy reciente y apenas tiene traccion (0 descargas, 0 likes en el momento de redactar esta ficha), por lo que debe tratarse como material experimental sin validacion externa. No se dispone de informacion sobre arquitectura concreta, longitud de contexto ni proceso de entrenamiento mas alla de los metadatos citados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es descrito como modelo de vision; no se detalla la arquitectura interna) |
| Parametros totales | 3.391.984 (~3,4 millones), segun metadatos de safetensors |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, mas archivo imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el repositorio estatico asociado incluye los ficheros mmproj para la parte de vision |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna del modelo base darkc0de/RICO-v2 en los datos disponibles: ni tipo de transformer, ni atencion, ni si emplea alguna variante hibrida. La model card de la cuantizacion unicamente indica que se trata de un modelo de vision y que los ficheros mmproj necesarios para ese componente se encuentran en el repositorio estatico (mradermacher/RICO-v2-GGUF). Las etiquetas "unsloth" y "transformers" sugieren que el ajuste fino original pudo realizarse con la libreria Unsloth, pero esto no esta confirmado de forma explicita.

En cuanto al entrenamiento, el unico dato disponible es el dataset declarado: darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT, que por su nombre apunta a un ajuste supervisado orientado a investigacion restringida. No se documentan numero de tokens, composicion del corpus, ni si hubo fases de RLHF, DPO u otra alineacion. La tecnica destacable del repositorio no es de arquitectura sino de cuantizacion: se ofrecen variantes "i1" generadas con matriz de importancia (imatrix), que segun la propia documentacion del autor suelen ofrecer mejor relacion tamano/calidad que las cuantizaciones estaticas equivalentes. Nota de coherencia: el dato de ~3,4 millones de parametros resulta llamativamente bajo y no concuerda con el tamano declarado del unico archivo con peso indicado (el imatrix, 0,1 GB); conviene verificar los tamanos reales en el repositorio estatico.

## Capacidades

- Generacion de texto en ingles.
- Procesamiento de imagenes (modelo de vision); requiere los ficheros mmproj del repositorio estatico para habilitar la entrada visual.
- Comportamiento "abliterated" / "uncensored": el ajuste busca reducir las negativas del modelo a peticiones que normalmente serian rechazadas.
- Modo experimental orientado a investigacion restringida, segun las etiquetas del autor.
- No hay evidencia disponible de soporte de tool calling o function calling.
- No hay evidencia disponible de soporte de agentes ni de razonamiento multi-paso estructurado.
- No hay evidencia disponible de capacidades de audio.
- Capacidades multilingues: limitadas al ingles declarado.

## Casos de uso

- Investigacion en seguridad y alineacion: evaluar con que frecuencia un modelo abliterated cumple peticiones que un modelo alineado rechazaria, y caracterizar los modos de fallo resultantes. Es adecuado porque esa es precisamente la finalidad declarada del ajuste.
- Red teaming de guardarrailes: usar el modelo como generador adversarial controlado para probar clasificadores de contenido, filtros de moderacion o sistemas de deteccion de toxicidad en un entorno cerrado.
- Analisis de sesgos y toxicidad: ejecutar baterias de prompts estandarizadas y medir la tasa de salidas toxicas o dañinas, dado que las etiquetas toxic y harmful advierten de ese riesgo.
- Despliegue en hardware muy limitado: al publicarse en GGUF con cuantizaciones desde IQ1_S hasta Q6_K, permite experimentar con inferencia en CPU o en GPU de gama baja dentro de un pipeline de investigacion, siempre que los tamanos reales lo confirmen.
- Estudio comparativo de cuantizacion: comparar la degradacion de calidad entre las variantes imatrix (i1) y las estaticas del repositorio hermano, usando el mismo modelo base y la misma tarea de evaluacion.
- Prototipado multimodal en local: si se descargan los ficheros mmproj, se puede probar descripcion de imagenes o respuesta a preguntas visuales en un entorno aislado y sin conexion, con fines de experimentacion.
- Docencia y divulgacion sobre riesgos de modelos abiertos: ilustrar en un aula o laboratorio como un modelo sin censura cambia su comportamiento frente a uno alineado, siempre en un entorno controlado y etico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision. Segun el dato declarado de ~3,4 millones de parametros, las cuantizaciones de 4 bits ocuparian del orden de unos pocos megabytes, lo que cabria en cualquier GPU de consumo e incluso solo en CPU. No obstante, este dato no concuerda con el tamano del archivo imatrix (0,1 GB), por lo que debe verificarse en el repositorio estatico antes de dimensionar el despliegue.
- GPU recomendadas: no se especifican. Para el orden de magnitud declarado, cualquier GPU con al menos 1-2 GB de VRAM deberia ser suficiente; modelos mas grandes de la misma familia requeririan tarjetas tipo RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: previsiblemente si, dada la escala declarada, aunque sin confirmacion oficial.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio, kobold.cpp, text-generation-webui). Para la parte de vision es necesario cargar el fichero mmproj correspondiente desde el repositorio estatico.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| mradermacher/RICO-v2-i1-GGUF | ~3,4 M (dato declarado) | no disponible | en | apache-2.0 | GGUF (imatrix) | Cuantizacion imatrix; vision via mmproj en repo estatico |
| mradermacher/RICO-v2-GGUF | no disponible | no disponible | en | apache-2.0 | GGUF (estatico) | Variante estatica del mismo modelo base; aloja los mmproj |
| darkc0de/RICO-v2 | no disponible | no disponible | en | no disponible | safetensors | Modelo base original sobre el que se generan las cuantizaciones |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas de la misma categoria. Cualquier comparacion adicional se considera no disponible.

## Limitaciones y advertencias

- Contenido potencialmente dañino: las etiquetas harmful, toxic, uncensored, abliterated y not-for-all-audiences indican que el modelo puede generar material ofensivo, ilegal o peligroso. No debe exponerse a usuarios finales sin moderacion.
- Riesgo elevado de alucinacion: no hay datos de entrenamiento ni evaluaciones publicadas; un modelo sin alineacion puede producir afirmaciones falsas con alta confianza.
- Ambito idiomatico restringido: solo se declara soporte de ingles, por lo que su uso en castellano no esta garantizado.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con contexto largo con la informacion disponible.
- Licencia: apache-2.0 permite uso comercial del artefacto, pero la licencia del modelo base original (darkc0de/RICO-v2) no figura en los datos; conviene verificarla, porque podria imponer restricciones adicionales.
- Madurez: publicacion muy reciente, con 0 descargas y 0 likes en el momento del analisis, sin validacion de la comunidad ni evaluaciones independientes.
- Inconsistencia de datos: el recuento de parametros declarado (~3,4 M) no encaja con el tamano del archivo imatrix (0,1 GB); hay que comprobar los tamanos reales antes de asumir requisitos de hardware.
- Naturaleza derivada: es una cuantizacion, no un modelo nuevo. Cualquier problema del modelo base se hereda intacto.
- Uso responsable: al tratarse de un modelo de investigacion restringida, su utilizacion deberia limitarse a entornos controlados, con supervision humana y de acuerdo con la legislacion aplicable.

## Enlaces

- Repositorio HuggingFace de la cuantizacion imatrix: https://huggingface.co/mradermacher/RICO-v2-i1-GGUF
- Repositorio estatico del mismo modelo (incluye los ficheros mmproj): https://huggingface.co/mradermacher/RICO-v2-GGUF
- Modelo base: https://huggingface.co/darkc0de/RICO-v2
- Dataset de ajuste: https://huggingface.co/datasets/darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#RICO-v2-i1-GGUF
- Guia de uso de GGUF (README de TheBloke, referenciado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (empresa que cede infraestructura al autor): https://www.nethype.de/

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces listados proceden exclusivamente de los metadatos y la model card de HuggingFace.
