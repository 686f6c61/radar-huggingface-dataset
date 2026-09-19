# Jeesup/svd-safety-l3_swift_jbbcal2_remove30

## Resumen

svd-safety-l3_swift_jbbcal2_remove30 es un checkpoint derivado de meta-llama/Meta-Llama-3-8B-Instruct al que se ha aplicado una compresion mediante SVD-LLM, eliminando el 30,00 % de los parametros densos y dejando el presupuesto de restauracion de componentes SVD en el 0,000 %. El resultado declarado es una fraccion de parametros de 0,7003 respecto al modelo denso original, con 0 componentes restaurados y 0 componentes sustituidos, generado con semilla 42 por el autor Jeesup. La model card lo describe explicitamente como un artefacto de investigacion, no como un asistente conversacional de proposito general.

El interes del modelo es acotado pero claro: forma parte de una rejilla experimental disenada para medir como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad de un LLM y que regla de seleccion de componentes permite repararlo. Para ello publica metricas de ataque exitoso (AdvBench ASR 0,0962 y StrongREJECT ASR 0,1470 con juez HarmBench), sobre-rechazo macro medido con WildGuard (0,1436) y perplejidad en WikiText-2 (17,7418). La regla de seleccion de esta celda aparece como `unknown`, lo que limita su utilidad como punto de comparacion interpretable dentro de la rejilla.

Su relevancia actual es metodologica: con 8.030.261.248 parametros almacenados en safetensors, formato llama y licencia Llama 3 Community, sirve como sujeto experimental reproducible para estudiar el compromiso entre compresion, utilidad y alineacion de seguridad, no como modelo de produccion. Cualquier conclusion sobre su comportamiento debe partir de una evaluacion propia, ya que varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), con compresion SVD-LLM aplicada a las matrices de pesos |
| Parametros totales | 8.030.261.248 (recuento real de safetensors); la model card declara una fraccion de parametros resultante de 0,7003 respecto al denso |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Meta-Llama-3-8B-Instruct soporta 8.192 tokens |
| Tipos de cuantizacion | no disponibles en la model card; pesos publicados en safetensors sin cuantizar |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Llama 3 Community License (Meta Llama 3 Community License) |
| Formato de pesos | safetensors |

Otros metadatos declarados: libreria transformers, pipeline text-generation, tags llama3, svd, compression, safety, interpretability, conversational, endpoints_compatible, text-generation-inference; tamano del repositorio 16,1 GB; fecha de creacion 2026-09-19T13:11:09Z y ultima actualizacion 2026-09-19T13:13:17Z; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 3 8B Instruct: un transformer decoder-only con atencion causal, normalizacion RMSNorm y embeddings de tokens de gran tamano (el vocabulario de Llama 3 es de 128.256 entradas, lo que explica que el recuento de parametros ronde los 8.030 millones). Sobre ese checkpoint no se aplica un reentrenamiento nuevo, sino una compresion post-hoc con SVD-LLM: se descomponen las matrices de pesos, se descartan componentes de bajo rango hasta eliminar el 30,00 % de los parametros densos y, opcionalmente, se restauran algunos componentes dentro de un presupuesto. En esta celda el presupuesto de restauracion es 0,000 %, con 0 componentes restaurados y 0 sustituidos, y la regla de seleccion figura como `unknown`.

No hay informacion en la model card sobre volumen de tokens de entrenamiento adicional, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineacion posteriores a la compresion. Tampoco se documentan innovaciones de inferencia (decodificacion especulativa, atencion lineal, cuantizacion integrada). Lo unico verificable es el procedimiento de provenance: base `meta-llama/Meta-Llama-3-8B-Instruct`, compresion SVD-LLM con 30,00 % de parametros eliminados, semilla 42. El caracter experimental del artefacto implica que la degradacion de comportamiento observada no proviene de un ajuste fino, sino directamente del truncamiento de rango en los pesos.

## Capacidades

- Generacion de texto en el sentido generico de un modelo de la familia Llama 3, condicionada por la degradacion introducida por la compresion.
- Razonamiento y respuesta conversacional heredados del checkpoint Instruct, sin garantia de estabilidad tras la eliminacion del 30 % de parametros.
- Capacidad multilingue: no documentada en la model card; cualquier afirmacion al respecto requiere evaluacion propia.
- Tool calling y function calling: no documentado en la model card. El modelo base Llama 3 8B Instruct dispone de plantillas de chat y soporte de herramientas, pero no se verifica que sobrevivan a la compresion SVD.
- Uso como sujeto de evaluacion de seguridad: el artefacto esta pensado para medir tasas de ataque exitoso y sobre-rechazo, no para producir respuestas seguras de forma fiable.
- Uso como objeto de estudio de interpretabilidad y de seleccion de componentes SVD: permite reproducir mediciones de perplejidad y de ASR bajo una configuracion concreta de la rejilla.
- No se declaran capacidades de vision, audio, modo thinking explicito ni agentes multi-paso.

## Casos de uso

- Investigacion sobre compresion de LLM: usar el checkpoint como celda de control (0 % de presupuesto de restauracion) para cuantificar cuanto degrada la eliminacion del 30 % de parametros respecto al modelo denso en perplejidad y en calidad generativa.
- Evaluacion de seguridad comparada: reproducir AdvBench y StrongREJECT con juez HarmBench sobre este checkpoint y contrastar el ASR de 0,0962 y 0,1470 con otras celdas de la rejilla y con Llama-3-8B-Instruct sin comprimir, para aislar el efecto de la compresion sobre la alineacion.
- Analisis de sobre-rechazo: emplear la metrica macro de WildGuard (0,1436) para estudiar si la compresion vuelve al modelo excesivamente conservador en peticiones benignas, un fallo distinto del de la perdida de seguridad.
- Auditoria de reglas de seleccion de componentes: aunque la regla de esta celda figura como `unknown`, el checkpoint sirve como referencia numerica frente a celdas con reglas identificadas, siempre que se documente la reproducibilidad de la comparacion.
- Generacion de datos para clasificadores de rechazo: producir respuestas ante prompts sensibles con este modelo para entrenar o validar clasificadores de contenido dañino, dado su perfil de seguridad degradado y su licencia permisiva para investigacion.
- Estudios de interpretabilidad de subespacios de pesos: inspeccionar que componentes de rango fueron truncados y correlacionar la caida de perplejidad en WikiText-2 (17,7418) con capas y matrices concretas.
- Pruebas de robustez de pipelines de evaluacion: verificar que un arnes de evaluacion (juez HarmBench, WildGuard, calculo de perplejidad) obtiene resultados reproducibles sobre un modelo con semilla fija 42 antes de aplicarlo a la rejilla completa.
- No se recomienda su uso como asistente desplegado ante usuarios finales ni como componente de un producto en produccion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0962 |
| StrongREJECT ASR (juez HarmBench) | 0,1470 |
| Macro over-refusal (WildGuard) | 0,1436 |
| Perplejidad en WikiText-2 | 17,7418 |

No se han publicado en la informacion disponible resultados de benchmarks de conocimiento o razonamiento (MMLU, GSM8K, HumanEval y similares), ni cifras del modelo base sin comprimir con las que comparar directamente estas cuatro metricas.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 16-17 GB solo para pesos, mas la cache KV correspondiente al contexto utilizado; el repositorio ocupa 16,1 GB, coherente con un almacenamiento practicamente denso pese a la fraccion declarada de 0,7003.
- VRAM estimada en int8: aproximadamente 8-9 GB; en 4 bits: aproximadamente 4,5-5,5 GB, sin contar cache KV ni overhead del runtime.
- GPU de datacenter: A100 40/80 GB, H100, L40S y A6000 ejecutan el modelo sin problema en fp16 y con margen para lotes y contextos largos.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 (24 GB o 16 GB con cuantizacion) en fp16 solo con contextos moderados; en 4 bits es viable en GPUs de 8-12 GB como RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- Opciones de despliegue: transformers de forma nativa (library_name declarado), text-generation-inference y endpoints compatibles segun los tags `text-generation-inference` y `endpoints_compatible`; vLLM es una opcion habitual para servir modelos Llama con safetensors. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, algo no documentado en la model card.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-l3_swift_jbbcal2_remove30 | 8.030.261.248 almacenados; fraccion efectiva declarada 0,7003 | no disponible en la model card | ASR AdvBench 0,0962; ASR StrongREJECT 0,1470; sobre-rechazo 0,1436; perplejidad WikiText-2 17,7418 | Llama 3 Community License | safetensors en HuggingFace, 0 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct (modelo base) | ~8.030 M | 8.192 tokens | no disponible en la informacion proporcionada | Llama 3 Community License | safetensors en HuggingFace |
| Otras celdas de la rejilla SVD del mismo autor | variable segun presupuesto de restauracion | no disponible | no disponible | Llama 3 Community License (presumiblemente) | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks de alternativas comparables (por ejemplo, Llama-3.1-8B-Instruct o modelos de 7-9 B de otras familias) que permitan una comparacion cuantitativa de rendimiento, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Artefacto de investigacion: la propia model card advierte de que no es un modelo de chat de proposito general y de que deberia tratarse como sujeto experimental, no como asistente desplegable.
- Seguridad degradada de forma intencionada en varias celdas de la rejilla: la compresion por si sola eleva la tasa de exito de ataques, y esta celda registra un ASR de 0,0962 en AdvBench y 0,1470 en StrongREJECT, valores que no deben interpretarse como un nivel de seguridad aceptable para produccion.
- Riesgo de alucinacion: no se publican mediciones de veracidad; la perplejidad de 17,7418 en WikiText-2 es notablemente superior a la de un modelo denso tipico de esta familia, lo que sugiere perdida de calidad en la modelizacion del lenguaje.
- Sobre-rechazo elevado: la metrica macro de WildGuard (0,1436) indica que una fraccion relevante de peticiones benignas puede ser rechazada.
- Regla de seleccion de componentes marcada como `unknown`: dificulta la reproducibilidad del brazo experimental y la atribucion de los resultados a una decision metodologica concreta.
- Sin lista de idiomas declarada: el comportamiento multilingue es indeterminado y debe validarse antes de cualquier uso fuera del ingles.
- Datos ausentes de entrenamiento: no se documentan tokens, composicion del dataset ni tecnicas de alineacion posteriores, lo que impide auditar el origen del comportamiento observado.
- Restricciones de licencia: el uso queda sujeto a la Meta Llama 3 Community License y a `USE_POLICY.md`, incluidos en el repositorio; existe obligacion de atribucion ("Built with Meta Llama 3") y condiciones especificas para uso comercial y redistribucion.
- Estado del repositorio: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad ni de mantenimiento posterior a su publicacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_swift_jbbcal2_remove30
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia y politica de uso: los archivos `LICENSE` y `USE_POLICY.md` estan incluidos en el repositorio del modelo (https://huggingface.co/Jeesup/svd-safety-l3_swift_jbbcal2_remove30/tree/main)
- Paper de SVD-LLM: no disponible en la informacion proporcionada
- Repositorio de codigo, blog o demo del autor: no disponible en la informacion proporcionada
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo, su paper o su repositorio; los unicos resultados devueltos son paginas de soporte de Microsoft Windows en turco, sin relacion con este artefacto.
