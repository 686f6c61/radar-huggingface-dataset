# mradermacher/Sorjin1.1-7B-Instruct-i1-GGUF

## Resumen

Sorjin1.1-7B-Instruct-i1-GGUF es una familia de cuantizaciones en formato GGUF generada por mradermacher a partir del modelo ajustado muzaffercky/Sorjin1.1-7B-Instruct. Se trata, por tanto, de una redistribucion optimizada para inferencia local y no de un entrenamiento nuevo: el trabajo de mradermacher consiste en aplicar cuantizacion con imatrix (importance matrix) sobre los pesos originales en precision completa para reducir el tamano sin degradar en exceso la perplejidad.

El modelo subyacente es un ajuste fino de la familia Qwen2.5 con 7.615.616.512 parametros (aproximadamente 7,6 mil millones), especializado en kurdo kurmanji (codigos de idioma ku y kmr). Segun las etiquetas y el README, el ajuste se realizo mediante LoRA sobre un dataset de tesis academicas en kurmanji (muzaffercky/kurdish-kurmanji-theses), lo que apunta a un modelo orientado a generacion de texto instructivo y asistencia conversacional en ese idioma.

Su relevancia actual es la de cubrir un nicho muy poco servido por los modelos multilingues generalistas: el kurdo kurmanji cuenta con escasisimos recursos de modelado de lenguaje de calidad. Publicar cuantizaciones GGUF de un modelo de 7B en este idioma permite desplegarlo en hardware de consumo, algo imposible con los pesos originales en precision completa. El repositorio ocupa 55,1 GB en total, aunque cada cuantizacion individual pesa entre 2,9 GB y 6,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2.5 (ajuste fino con LoRA sobre el modelo base) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K; se publica ademas el fichero imatrix para generar cuantizaciones propias. Existe una variante estatica en mradermacher/Sorjin1.1-7B-Instruct-GGUF |
| Idiomas soportados | ku (kurdo), kmr (kurmanji) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (los pesos originales del modelo base estan en safetensors) |

## Arquitectura y entrenamiento

La arquitectura es la de la familia Qwen2.5, un transformer decoder-only con atencion causal y mecanismos de atencion con query/key/value y sesgo (QKV bias), que es la configuracion estandar de esta serie. El modelo que nos ocupa no es un entrenamiento desde cero: muzaffercky/Sorjin1.1-7B-Instruct se construyo como un ajuste fino de instrucciones (etiquetas `instruct` y `lora`) sobre una base Qwen2.5 de 7B, presumiblemente mediante adaptadores LoRA fusionados posteriormente en los pesos.

El dataset declarado es muzaffercky/kurdish-kurmanji-theses, una coleccion de tesis academicas en kurdo kurmanji. Esto condiciona fuertemente el perfil del modelo: el corpus es de dominio academico y registro formal, lo que puede dar buenos resultados en prosa formal y terminologia tecnica kurmanji, pero probablemente deja menos cobertura en lenguaje coloquial, dialectos distintos del kurmanji o dominios como codigo y matematicas. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion tecnica del repositorio de mradermacher no esta en el modelo sino en el proceso de cuantizacion: se emplean cuantizaciones con imatrix (weighted/imatrix quants, con `output_tensor_quantised: 1` y `convert_type: hf`), que calibran el error de cuantizacion usando estadisticas de activaciones recogidas con un corpus de calibracion. Segun el autor, las cuantizaciones IQ suelen ser preferibles a las de tipo K de tamano equivalente. El repositorio incluye el fichero imatrix (0,1 GB) para que terceros generen sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional e instrucciones en kurdo kurmanji, con registro academico y formal derivado del dataset de tesis.
- Modelo de instrucciones (`instruct`), pensado para seguimiento de comandos y dialogos de tipo pregunta-respuesta.
- Capacidades genericas heredadas de Qwen2.5-7B, si bien no se confirma en la informacion disponible que se hayan preservado intactas tras el ajuste en kurmanji.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: limitadas a ku y kmr segun la model card; el resto de idiomas no esta declarado.
- Modo thinking explicito, vision o audio: no disponible.
- Capacidad destacada: ser uno de los pocos modelos de 7B publicados especificamente para kurdo kurmanji, y el unico con cuantizaciones imatrix publicadas en esta familia segun la informacion revisada.

## Casos de uso

- Asistencia academica en kurmanji: el modelo se ha ajustado sobre tesis en kurdo kurmanji, por lo que resulta adecuado para resumir, reformular o responder preguntas sobre textos academicos en ese idioma, manteniendo terminologia tecnica coherente con el corpus original.
- Traduccion asistida hacia kurmanji: uso como motor de traduccion en flujos de trabajo que necesiten generar texto en kurmanji, con revision humana posterior, dado el escaso soporte de este idioma en modelos multilingues comerciales.
- Herramientas de preservacion linguistica: integracion en plataformas educativas o culturales kurdas que necesiten generar material didactico, ejercicios o explicaciones en kurmanji sin depender de APIs propietarias.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones i1-Q4_K_M (4,8 GB) o i1-IQ4_XS (4,3 GB), puede ejecutarse en portatiles con GPU de gama media o incluso en CPU mediante llama.cpp, algo imprescindible en entornos con conectividad limitada.
- Investigacion en PLN de bajos recursos: uso como punto de partida para experimentos de evaluacion, ajuste adicional o comparacion de tecnicas de cuantizacion aplicadas a idiomas con pocos datos.
- Chatbot de atencion en kurmanji: despliegue en servicios publicos o comunidades que atiendan a hablantes de kurmanji, con la salvedad de que la ventana de contexto no esta documentada y debe validarse antes de un uso en produccion.
- Experimentacion con cuantizacion imatrix: el fichero imatrix publicado permite a equipos de investigacion generar cuantizaciones personalizadas y medir el impacto de distintos niveles de compresion sobre un modelo de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio de cuantizaciones ni los metadatos asociados incluyen resultados de MMLU, HumanEval, GSM8K, perplejidad u otras metricas, ni para el modelo original ni para las cuantizaciones i1.

## Requisitos de hardware

- VRAM estimada para inferencia, segun cuantizacion (el peso del fichero es una cota inferior; hay que anadir el contexto y los buffers de atencion):
  - i1-IQ2_M / i1-Q2_K_S: aproximadamente 2,9 GB de pesos.
  - i1-Q2_K: aproximadamente 3,1 GB.
  - i1-IQ3_XXS: aproximadamente 3,2 GB; i1-IQ3_M: aproximadamente 3,7 GB; i1-Q3_K_M: aproximadamente 3,9 GB.
  - i1-IQ4_XS: aproximadamente 4,3 GB; i1-IQ4_NL: aproximadamente 4,5 GB.
  - i1-Q4_K_S: aproximadamente 4,6 GB; i1-Q4_K_M: aproximadamente 4,8 GB.
  - i1-Q6_K: aproximadamente 6,4 GB.
- Cabe en GPU de consumo: si. Las cuantizaciones de 4 bits (IQ4_XS, Q4_K_S, Q4_K_M) caben con holgura en GPU con 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 2070) y muy comodamente en 12 GB (RTX 3060 12 GB, RTX 4070). Las cuantizaciones de 2 a 3 bits permiten incluso GPUs de 6 GB o integradas modestas.
- GPU recomendadas: para uso con contexto largo y buena latencia, una RTX 4090 (24 GB) o A100/H100 si se despliega en servidor; para uso individual, RTX 3060 12 GB o RTX 4070 son suficientes con cuantizaciones Q4.
- Opciones de despliegue: llama.cpp y cualquiera de sus envoltorios (Ollama, LM Studio, KoboldCpp, text-generation-webui) son las rutas naturales al ser formato GGUF. vLLM y TGI pueden servir modelos GGUF, pero con soporte historicamente mas limitado que safetensors, por lo que conviene verificar compatibilidad antes de comprometer un despliegue en produccion.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo para estas cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas declarados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Sorjin1.1-7B-Instruct-i1-GGUF | 7,6 mil millones | no disponible | ku, kmr | apache-2.0 | GGUF, 11 cuantizaciones i1 + fichero imatrix |
| muzaffercky/Sorjin1.1-7B-Instruct (original) | 7,6 mil millones | no disponible | ku, kmr | apache-2.0 (heredada) | safetensors, pesos sin cuantizar |
| mradermacher/Sorjin1.1-7B-Instruct-GGUF (variante estatica) | 7,6 mil millones | no disponible | ku, kmr | apache-2.0 | GGUF con cuantizaciones estaticas |
| Qwen2.5-7B-Instruct (familia base) | 7,6 mil millones | 128 000 tokens (dato de la familia base, no confirmado para el ajuste) | multilingue amplio | apache-2.0 | safetensors y multiples GGUF de terceros |

No se dispone de datos de rendimiento comparativos entre estas variantes. Cualquier comparacion cuantitativa de calidad requeriria ejecutar evaluaciones propias sobre el mismo conjunto de prompts en kurmanji.

## Limitaciones y advertencias

- Sesgo de dominio: el entrenamiento se apoya exclusivamente en un dataset de tesis academicas en kurmanji, lo que puede producir un registro excesivamente formal y un vocabulario poco adaptado a conversacion coloquial o a otros dialectos del kurdo (sorani, por ejemplo).
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual. Al tratarse de un ajuste sobre un corpus limitado, el riesgo de inventar datos es alto, especialmente fuera del dominio academico.
- Cobertura idiomatica reducida: la model card declara unicamente ku y kmr. El comportamiento en castellano, ingles u otros idiomas no esta garantizado y probablemente sea deficiente o inexistente.
- Contexto no documentado: no se especifica la longitud de contexto soportada por el ajuste. Aunque la familia base Qwen2.5 maneja ventanas amplias, no hay confirmacion de que el ajuste LoRA las conserve, por lo que no debe asumirse en produccion.
- Rendimiento en codigo y matematicas: no hay evidencia de que estas capacidades se hayan preservado tras el ajuste en kurmanji, y el dataset no las cubre.
- Cuantizaciones de muy baja precision: las variantes i1-Q2_K, i1-Q2_K_S e i1-IQ2_M (2,9-3,1 GB) llevan advertencia explicita de calidad muy baja en el propio README. Para uso real se recomienda i1-IQ4_XS o i1-Q4_K_M.
- Licencia: apache-2.0 permite uso comercial y modificacion con atribucion, pero conviene verificar la licencia del modelo base original y del dataset de tesis, ya que los derechos sobre el corpus academico podrian no estar cubiertos por apache-2.0.
- Adopcion practicamente nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria ni reportes de errores.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion tecnica relevante sobre el modelo; no se ha podido contrastar ningun dato con fuentes externas.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones i1: https://huggingface.co/mradermacher/Sorjin1.1-7B-Instruct-i1-GGUF
- Repositorio de cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Sorjin1.1-7B-Instruct-GGUF
- Modelo base ajustado (pesos originales): https://huggingface.co/muzaffercky/Sorjin1.1-7B-Instruct
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/muzaffercky/kurdish-kurmanji-theses
- Fichero imatrix para generar cuantizaciones propias: https://huggingface.co/mradermacher/Sorjin1.1-7B-Instruct-i1-GGUF/resolve/main/Sorjin1.1-7B-Instruct.imatrix.gguf
- Pagina de resumen de descargas del cuantizador: https://hf.tst.eu/model#Sorjin1.1-7B-Instruct-i1-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Paper o publicacion tecnica del modelo: no disponible.
- Demo o espacio interactivo: no disponible.
