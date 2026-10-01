# Atomic-Germ/Hy-MT2-1.8B-NPU2

## Resumen

Hy-MT2-1.8B-NPU2 es una conversion cuantizada del modelo de traduccion tencent/Hy-MT2-1.8B, publicada por el usuario Atomic-Germ en HuggingFace. No es un modelo entrenado desde cero: se trata de un port del modelo base de 1.800 millones de parametros al formato Q4NX, un formato propio del runtime OpenFlowLM (OFLM) orientado a ejecutar inferencia sobre las NPU AMD XDNA integradas en los procesadores Ryzen AI. El repositorio contiene un unico archivo de pesos, `model.q4nx`, de 1,50 GB, acompanado de configuracion de runtime, tokenizer y plantilla de chat.

El modelo hereda la funcion de traduccion automatica del original y declara cobertura de 36 idiomas, entre ellos espanol, ingles, chino, frances, aleman, japones, arabe e hindi, bajo licencia Apache 2.0. Su interes practico esta en el nicho de despliegue: permite traduccion local en equipos con NPU sin GPU dedicada ni llamadas a servicios en la nube, lo que encaja con el tamano reducido y la cuantizacion aplicada.

La documentacion publica es escasa. La model card es esencialmente una plantilla de conversion: no detalla la arquitectura interna, la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de evaluacion. La busqueda web realizada no ha devuelto documentacion tecnica relevante sobre este modelo (los resultados obtenidos corresponden a una marca de esqui y a una cartera de criptomonedas, sin relacion con el repositorio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `hunyuan_v1_dense` (transformer denso de la familia Hunyuan), segun los tags del repositorio |
| Parametros totales | 1,8 mil millones (1.8B), segun el nombre del modelo y el modelo base |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4NX (archivo `model.q4nx`, 1,50 GB); la tabla de archivos de la model card menciona Q8_0 / Q4_1 / BF16 como esquemas implicados en la conversion |
| Idiomas soportados | 36: zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug |
| Licencia | apache-2.0 |
| Formato de pesos | Q4NX (`model.q4nx`); explicitamente no es GGUF. Los tags del repositorio declaran `safetensors` y libreria `transformers`, en contradiccion aparente con el contenido real del repo |

Datos adicionales del repositorio: modelo base `tencent/Hy-MT2-1.8B`, relacion `quantized`, cuantizado por Atomic-Germ, GGUF de origen `Hy-MT2-1.8B-heretic.Q8_0.gguf`, version de runtime OFLM `0.1.0`, fecha de conversion 2026-10-01, tamano del repo 1,6 GB, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La unica referencia arquitectonica disponible es el tag `hunyuan_v1_dense`, que situa el modelo base dentro de la familia Hunyuan con una pila transformer densa, sin mezcla de expertos. Con 1,8 mil millones de parametros y una tarea especializada de traduccion, el modelo esta dimensionado para inferencia de baja latencia en hardware de borde. No hay informacion publica en la documentacion proporcionada sobre el numero de capas, dimensiones de atencion, mecanismo de atencion (completa, lineal o hibrida) ni sobre si incorpora componentes SSM.

Tampoco se especifica el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de fases de ajuste por instrucciones, RLHF o DPO, ni innovaciones de decodificacion. Todo lo relativo al entrenamiento del modelo original queda fuera del alcance de esta ficha y debe consultarse en la model card de `tencent/Hy-MT2-1.8B`. Lo unico verificable aqui es el proceso de conversion: partida desde un GGUF Q8_0 de origen comunitario, compilacion para el runtime OpenFlowLM y empaquetado en un unico archivo Q4NX con configuracion, tokenizer (vocabulario y configuracion) y plantilla de chat en Jinja.

## Capacidades

- Traduccion automatica entre los 36 idiomas declarados, con el espanol, el chino y el ingles entre ellos; es la tarea para la que el repositorio esta etiquetado (`pipeline_tag: translation`).
- Generacion de texto general, segun el tag `text-generation` del repositorio.
- Formato conversacional: el repositorio incluye `chat_template.jinja`, lo que indica soporte de plantillas de chat para interacciones por turnos.
- Cobertura multilingue amplia, incluyendo idiomas de bajos recursos como tibetano (bo), kazajo (kk), mongol (mn) y uigur (ug).
- Capacidades de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio o modo de razonamiento explicito (thinking mode): no disponible; la model card indica `Modality: language`.

## Casos de uso

- Traduccion de documentacion tecnica: el modelo puede traducir manuales y guias entre los 36 idiomas soportados ejecutandose en local, lo que evita enviar documentacion interna a APIs externas de traduccion.
- Localizacion de interfaces de software: integrado en un pipeline de compilacion, permite generar cadenas de interfaz traducidas (por ejemplo de en a es, fr, de o ja) sin coste por caracter y con control total sobre el vocabulario del producto.
- Traduccion en el dispositivo para portatiles con Ryzen AI: al estar compilado para NPU AMD XDNA mediante OpenFlowLM, puede ofrecer traduccion local sin consumir la GPU ni requerir conexion de red, util en entornos con requisitos de privacidad.
- Atencion al cliente multilingue: con su plantilla de chat, puede gestionar intercambios por turnos traduciendo mensajes de usuario entre idiomas; la ausencia de datos publicos de contexto obliga a validar el comportamiento en conversaciones largas antes de produccion.
- Comercio electronico internacional: traduccion por lotes de fichas de producto y descripciones hacia multiples idiomas, aprovechando la cobertura de lenguas como turco, polaco, tailandes o vietnamita.
- Post-edicion de transcripciones y subtitulado: traduccion de texto procedente de ASR para generar subtitulos multilingues en flujos de trabajo de video.
- Procesamiento de corpus de investigacion: traduccion de conjuntos de datos para experimentos de PLN en idiomas poco representados (tibetano, mongol, uigur), siempre que se documente la perdida por cuantizacion.
- Traduccion de correspondencia y documentacion legal o administrativa: uso en flujos internos donde la confidencialidad impide el uso de servicios en la nube, con revision humana obligatoria dado el riesgo de error en terminologia juridica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas, metricas BLEU, chrF, COMET ni evaluaciones de calidad de traduccion para esta conversion, y tampoco se han localizado datos de este tipo en la busqueda web realizada. No se dispone, por tanto, de cifras que permitan cuantificar la perdida de calidad introducida por la cuantizacion Q4NX respecto al modelo base o al GGUF Q8_0 de origen.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: el archivo de pesos ocupa 1,50 GB. Como estimacion de orden de magnitud, el consumo total en ejecucion (pesos + cache KV + buffers del runtime) se situara por encima de esa cifra, del orden de 2 a 3 GB, cifra no confirmada por el autor.
- Hardware objetivo: NPU AMD XDNA (procesadores Ryzen AI) mediante el runtime OpenFlowLM 0.1.0. Este repositorio no esta pensado para ejecucion en GPU convencional.
- GPU recomendadas: no disponible para este formato. Para inferencia en GPU seria necesario recurrir al modelo base `tencent/Hy-MT2-1.8B` o a sus variantes GGUF, no al archivo Q4NX.
- Viabilidad en GPU de consumo: no aplica al formato Q4NX. El modelo base de 1,8B si es compatible con GPUs de consumo por su tamano, pero no se dispone de datos verificados en la informacion proporcionada.
- Opciones de despliegue: OpenFlowLM con el instalador `oflm-add` (flujo documentado en la model card: instalacion via `pip install oflm-add` o `uv tool install oflm-add`, registro del modelo y ejecucion con `oflm run`). El autor indica que el instalador copia el modelo al directorio de usuario y nunca modifica la instalacion del sistema.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por peticion en NPU o en cualquier otro backend.

## Comparativa con modelos similares

La informacion disponible solo permite comparar esta conversion con su modelo de origen y con el GGUF del que deriva.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tencent/Hy-MT2-1.8B (base) | 1,8B | no disponible | safetensors (precision original) | apache-2.0, segun los metadatos del repositorio | HuggingFace, repositorio oficial de Tencent |
| Hy-MT2-1.8B-heretic.Q8_0.gguf (origen de la conversion) | 1,8B | no disponible | GGUF Q8_0 | no disponible | referenciado en la model card, sin enlace directo |
| Atomic-Germ/Hy-MT2-1.8B-NPU2 (este repositorio) | 1,8B | no disponible | Q4NX (1,50 GB) | apache-2.0 | HuggingFace, 0 descargas |

No se dispone de datos de rendimiento comparado con otras alternativas de traduccion de tamano similar, por lo que no es posible establecer una comparacion cuantitativa de calidad, contexto o throughput.

## Limitaciones y advertencias

- Perdida por cuantizacion: la conversion parte de un GGUF Q8_0 y se empaqueta en Q4NX; la degradacion de calidad de traduccion respecto al modelo base en precision completa no ha sido medida ni documentada por el autor.
- Ausencia total de evaluacion: sin benchmarks ni comparativas publicadas, no hay evidencia objetiva de calidad de traduccion en ninguno de los 36 idiomas declarados.
- Riesgo de alucinacion y mistraduccion: como cualquier modelo generativo aplicado a traduccion, puede omitir, anadir o alterar contenido. En dominios sensibles (medico, juridico, financiero) requiere revision humana obligatoria.
- Idiomas de bajos recursos: la cobertura declarada de lenguas como tibetano, uigur, mongol o kazajo no viene acompanada de volumen de datos de entrenamiento, por lo que la calidad real en esos pares es desconocida.
- Contexto desconocido: no se especifica la longitud de contexto. El comportamiento en documentos largos o conversaciones multi-turno no esta garantizado.
- Dependencia de plataforma: el formato Q4NX y el runtime OpenFlowLM 0.1.0 atan el modelo al ecosistema AMD XDNA. No es portable a llama.cpp, Ollama, vLLM ni TGI sin reconvertir el modelo.
- Trazabilidad de la cadena de conversion: el punto de partida es un GGUF de nombre `heretic` de procedencia, autor y licencia no documentados en la model card, lo que complica la auditoria de la cadena de custodia del modelo.
- Repositorio no validado por la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin revision independiente conocida.
- Licencia: el repositorio declara Apache 2.0, permisiva para uso comercial, pero conviene verificar que la licencia del modelo base y del GGUF de origen permiten la redistribucion en este formato.
- Coherencia de metadatos: los tags del repositorio declaran `safetensors` y libreria `transformers`, mientras que la model card indica que el archivo real es `model.q4nx` y que no es un GGUF. Esta discrepancia debe tenerse en cuenta al integrar el modelo en herramientas automaticas.
- Referencia arXiv sin verificar en la busqueda: los metadatos incluyen el identificador `arxiv:2605.22064`, del que no se ha podido recuperar ni confirmar el contenido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Atomic-Germ/Hy-MT2-1.8B-NPU2
- Modelo base: https://huggingface.co/tencent/Hy-MT2-1.8B
- Model card del modelo base (referenciada por el autor): https://huggingface.co/tencent/Hy-MT2-1.8B
- Referencia arXiv indicada en los metadatos del repositorio: arxiv:2605.22064 (no verificada; no se ha localizado el paper en la busqueda web)
- Instalador del runtime OpenFlowLM: `oflm-add`, distribuido como paquete de Python (`pip install oflm-add` o `uv tool install oflm-add`); no se ha encontrado URL publica en la informacion proporcionada.
- Busqueda web: no se han encontrado enlaces relevantes sobre este modelo. Los resultados obtenidos corresponden a sitios sin relacion (fabricante de esqui Atomic y una cartera de criptomonedas), por lo que se descartan como fuentes.
