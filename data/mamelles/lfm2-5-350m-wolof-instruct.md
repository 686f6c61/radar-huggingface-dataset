# mamelles/LFM2.5-350M-Wolof-Instruct

## Resumen

LFM2.5-350M-Wolof-Instruct es un ajuste de instrucciones sobre LiquidAI/LFM2.5-350M-Base, publicado por el usuario mamelles en HuggingFace. Se trata de un artefacto declarado explicitamente por su autor como "private production artifact", en fase experimental y no destinado a publicacion general. Su objetivo es la adaptacion al wolof mediante un protocolo de preentrenamiento continuado sobre un corpus limpiado en ese idioma, seguido de una etapa de ajuste por instrucciones.

El modelo cuenta con 427.458.304 parametros reales segun los pesos en safetensors, un tamano que lo situa en la gama de modelos pequenos aptos para inferencia en hardware de consumo e incluso en CPU. No es un modelo MoE: la cifra de parametros activos coincide con la total. El repositorio ocupa 0,9 GB y los pesos se distribuyen en formato safetensors para la libreria transformers.

Su relevancia es acotada y de caracter investigador: cubre el nicho de las lenguas de bajos recursos, en concreto el wolof, donde la oferta de modelos ajustados es escasa. El propio autor advierte que la ortografia del wolof, el code-switching, la factualidad, el razonamiento, el comportamiento en contexto largo y la seguridad no se han validado de forma exhaustiva, y que se requiere revision por hablantes nativos antes de cualquier uso mas amplio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (familia identificada por el tag `lfm2`); detalles internos no disponibles |
| Parametros totales | 427.458.304 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (no se incluyen GGUF ni cuantizaciones de otro tipo) |
| Idiomas soportados | wolof (objetivo del ajuste); resto de idiomas no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Familia de tokenizer | 65k-ext |
| Modelo base | LiquidAI/LFM2.5-350M-Base |
| Etapa de entrenamiento | Instruct (ajuste por instrucciones) |
| Tamano del repositorio | 0,9 GB |
| Fecha de publicacion (metadatos HF) | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible identifica la familia de arquitectura mediante el tag `lfm2`, heredada del modelo base LiquidAI/LFM2.5-350M-Base, pero la model card no detalla la composicion de capas, el mecanismo de atencion ni la configuracion del transformer. No se dispone por tanto de datos verificables sobre si se trata de una arquitectura hibrida, de atencion completa o de cualquier otra variante. La unica especificacion estructural confirmada es el uso de un tokenizer de la familia `65k-ext`, con la advertencia explicita de que las metricas BPB no deben compararse como perplejidad entre las familias de 65k y 128k.

El entrenamiento consta de dos etapas declaradas: un preentrenamiento continuado sobre un corpus de wolof limpiado y una posterior etapa de ajuste por instrucciones con datos reweightados. La model card indica que los datos de instruccion excluyen el split de test del Hub de origen, y que este artefacto supero las puertas automatizadas registradas en `training_manifest.json`. No se aportan cifras de tokens de entrenamiento, composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras. El autor advierte ademas de una posible contaminacion: ejemplos similares a benchmarks pudieron existir en el preentrenamiento upstream, por lo que los resultados en tareas de evaluacion deben interpretarse con cautela. Las filas de datos privados no se incluyen en el repositorio.

## Capacidades

- Generacion de texto conversacional en wolof, orientada a respuestas de tipo instruct tras el ajuste supervisado.
- Adaptacion linguistica al wolof como capacidad principal y objetivo declarado del artefacto.
- Generacion de texto general heredada del modelo base, sin garantia de calidad en tareas de razonamiento.
- Soporte de tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingues: sin validar; solo se declara el wolof como idioma objetivo.
- Capacidades especiales (modo thinking, vision, audio, contexto largo): no disponibles ni validadas segun la propia model card.
- Code-switching: explicitamente no validado.

## Casos de uso

- Investigacion en adaptacion de lenguas de bajos recursos: serviria como punto de partida reproducible para estudiar preentrenamiento continuado en wolof a partir de un base de 427 M de parametros, comparando variantes de corpus y de ajuste por instrucciones.
- Evaluacion comparativa de tokenizers: al usar la familia `65k-ext`, permite analizar el efecto de la tokenizacion sobre metricas BPB en lenguas con ortografia no latina estandarizada, siempre que se respete la advertencia del autor sobre no comparar BPB entre familias de 65k y 128k.
- Prototipado de asistentes conversacionales en wolof: con 427 M de parametros cabe en una unica GPU de consumo, lo que permite iterar rapidamente en demos internas de dialogo antes de invertir en modelos mayores.
- Anotacion asistida y generacion de datos sinteticos en wolof: el modelo podria emplearse para preetiquetar corpus o generar candidatos de traduccion que despues se revisen por hablantes nativos, dado el requisito explicito de revision humana.
- Despliegue en el borde (edge) o en dispositivos sin GPU: su tamano reducido (0,9 GB en safetensors, aproximadamente 0,85 GB en FP16) lo hace candidato para equipos con poca memoria o para entornos de investigacion de campo donde el wolof es relevante.
- Traduccion y normalizacion ortografica como tarea de investigacion: util para medir la sensibilidad del modelo a variantes ortograficas del wolof, una de las areas que el autor senala como no validadas.
- Docencia y experimentacion academica: al ser un artefacto pequeno y abierto en su descarga, sirve para que estudiantes reproduzcan un pipeline completo de ajuste por instrucciones sobre un modelo base de Liquid AI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que solo los resultados medidos se incluyen en `metrics.json` y que la ausencia de una metrica no debe interpretarse como un valor favorable ni desfavorable.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,85 GB en FP16/BF16 para los pesos; alrededor de 0,43 GB en INT8 y 0,22 GB en INT4 si se cuantiza. Sumando activaciones y cache KV para contextos cortos, un presupuesto practico de 1,5-2,5 GB en FP16 es razonable.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en FP16; NVIDIA RTX 3060/4060 y superiores cubren el modelo con holgura. No requiere A100 ni H100 salvo para servir muchas copias concurrentes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna con al menos 4 GB, y tambien en GPUs integradas con memoria unificada.
- Inferencia en CPU: viable, dado el tamano de 427 M de parametros y el repositorio de 0,9 GB. El rendimiento concreto depende del backend y de la cuantizacion.
- Opciones de despliegue: transformers de forma nativa (es la libreria declarada). vLLM y TGI requeririan soporte especifico para la arquitectura `lfm2`. llama.cpp y Ollama no tienen pesos publicados en este repositorio, por lo que exigirian una conversion previa de safetensors a GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de alternativas en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa fiable. La unica referencia directa documentada es el modelo base del que deriva.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| mamelles/LFM2.5-350M-Wolof-Instruct | 427.458.304 | no disponible | no disponible | HuggingFace, safetensors | no disponibles |
| LiquidAI/LFM2.5-350M-Base | no disponible en esta ficha | no disponible | no disponible | HuggingFace, modelo base declarado | no disponibles |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto experimental y privado: la propia model card lo define como "private production artifact", en fase ongoing/experimental y no como release publico. No esta pensado para produccion.
- Ortografia del wolof no validada: no se ha verificado de forma exhaustiva, lo que implica riesgo de salidas ortograficamente inconsistentes o incorrectas.
- Code-switching no validado: el comportamiento en textos que mezclan wolof con otros idiomas (frances, ingles, arabe) no esta caracterizado.
- Factualidad y razonamiento no evaluados: el autor declara que no se han validado, por lo que el riesgo de alucinacion es alto y no cuantificado.
- Comportamiento en contexto largo no validado: no hay garantias sobre degradacion con entradas extensas ni datos sobre la ventana real de contexto.
- Seguridad no evaluada: no se han realizado validaciones de seguridad, por lo que puede generar contenido inapropiado o danino.
- Contaminacion potencial: la model card advierte de que ejemplos similares a benchmarks pudieron estar presentes en el preentrenamiento upstream, lo que invalida evaluaciones ingenuas.
- Licencia no disponible: no se especifica licencia en los metadatos, lo que impide determinar si el uso comercial esta permitido. Debe consultarse la licencia del modelo base LiquidAI/LFM2.5-350M-Base antes de cualquier explotacion.
- Revision por hablantes nativos obligatoria: el propio autor la considera necesaria antes de un uso mas amplio.
- Metricas ausentes: la ausencia de una metrica en `metrics.json` significa que no se midio, no que el resultado sea aceptable.
- Datos privados no publicados: las filas de entrenamiento no se incluyen, lo que limita la reproducibilidad y la auditoria del corpus.
- Comparacion de perplejidad restringida: la familia de tokenizer `65k-ext` no permite comparar BPB como perplejidad frente a la familia de 128k.
- Adopcion nula registrada: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mamelles/LFM2.5-350M-Wolof-Instruct
- Modelo base declarado: https://huggingface.co/LiquidAI/LFM2.5-350M-Base
- Repositorio del autor: https://huggingface.co/mamelles
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces recuperados correspondian a paginas de ayuda del Traductor de Google y no guardan relacion con el artefacto. No se dispone de paper, blog tecnico, repositorio de codigo ni demo asociados.
