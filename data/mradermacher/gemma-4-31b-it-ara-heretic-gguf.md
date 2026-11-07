# mradermacher/gemma-4-31B-it-ARA-heretic-GGUF

## Resumen

`mradermacher/gemma-4-31B-it-ARA-heretic-GGUF` es una distribucion en formato GGUF de un modelo derivado de Gemma 4 31B instruct, publicado por el usuario mradermacher. Segun la model card, se trata de una cuantizacion estatica del modelo `richardyoung/gemma-4-31B-it-ARA-heretic`, que a su vez es una variante "heretic" (abliterada o descensurada) del modelo instruct original de Gemma 4. El repositorio contiene unicamente pesos cuantizados en GGUF, no los pesos originales en precision completa.

El modelo cuenta con 30.697.345.596 parametros segun los metadatos de safetensors, lo que lo situa en la categoria de modelos densos de aproximadamente 31B. El repositorio ocupa 135.2 GB e incluye un conjunto amplio de cuantizaciones que van desde Q2_K hasta F16, pasando por Q3, Q4, Q5, Q6, Q8 e IQ4_XS. Esto permite desplegar el modelo en un rango amplio de hardware, desde GPUs de consumo con cuantizaciones agresivas hasta estaciones de trabajo con cuantizaciones de alta fidelidad.

La relevancia de esta ficha es doble: por un lado documenta un caso tipico de la cadena de derivacion de modelos (modelo base instruct, ajuste "heretic", cuantizacion GGUF); por otro, advierte de que la informacion publica disponible es muy escasa. No hay datos de licencia, idiomas, benchmarks ni detalles de entrenamiento mas alla de los metadatos del repositorio y la referencia al modelo de origen. Cualquier evaluacion en produccion debe partir de pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Gemma 4 31B instruct; se asume transformer denso, no confirmado) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no aplica (no hay indicios de ser MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas generadas con `quantize_version: 2`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. Por la nomenclatura (`gemma-4-31B-it`) se infiere que deriva de un modelo Gemma 4 de 31B parametros en version instruct, pero la model card no confirma la arquitectura exacta (transformer denso, numero de capas, dimensiones, atencion, etc.). Tampoco se documentan los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO.

Respecto al proceso de derivacion, la informacion disponible indica dos etapas: primero un ajuste "heretic" sobre el modelo instruct (presumiblemente una modificacion para reducir rechazos o comportamientos de censura, segun la convencion habitual de la comunidad "heretic"/"abliterated"), y despues una cuantizacion estatica a GGUF realizada por mradermacher. La model card solo incluye metadatos tecnicos de la cuantizacion (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) y la lista de cuantizaciones generadas. No se documentan innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio y la procedencia instruct sugieren uso en dialogos multi-turno, aunque no hay evaluacion publicada.
- Razonamiento y conocimiento general: capacidades heredadas del modelo Gemma 4 31B instruct de origen, no verificadas de forma independiente en esta variante.
- Codigo y matematicas: no disponible de forma especifica; no hay benchmarks ni documentacion que lo confirme.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas en los metadatos.
- Modo "thinking" o razonamiento extendido: no disponible.
- Vision o audio: no disponible; el repositorio no incluye `mmproj`, lo que sugiere que no se distribuye componente multimodal.

## Casos de uso

- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M o Q5_K_M el modelo puede ejecutarse en GPUs de consumo de gama alta (24 GB) o en configuraciones multi-GPU, lo que permite prototipar asistentes conversacionales sin depender de APIs externas.
- Experimentacion con modelos "heretic": util para investigadores que estudian el efecto de la abliteracion o descensura sobre el comportamiento del modelo, comparando respuestas frente al Gemma 4 instruct original.
- Generacion de texto creativo y roleplay: la variante "heretic" suele emplearse en escenarios de escritura creativa sin las restricciones del modelo alineado, aunque requiere supervision humana por posibles salidas inapropiadas.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantizacion, lo que facilita estudios de degradacion de calidad frente a tamano y velocidad en un mismo modelo.
- Fine-tuning posterior sobre GGUF: no es el flujo habitual, pero la disponibilidad de F16 permite convertir a otros formatos y aplicar tecnicas como LoRA si se reconstruye el modelo en precision completa.
- Servicio de inferencia con llama.cpp u Ollama: el formato GGUF es compatible con estos runtimes, lo que permite montar un endpoint conversacional interno con control total sobre los datos.
- Pruebas de robustez y red teaming: al ser una variante descensurada, es un candidato para evaluar comportamientos no filtrados y calibrar sistemas de moderacion propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 30.7B parametros, una cuantizacion Q4_K_M ocupa aproximadamente 18-19 GB de pesos; Q5_K_M en torno a 21-22 GB; Q8_0 cerca de 33 GB; F16 aproximadamente 61 GB. Estas cifras son estimaciones a partir del numero de parametros y el tipo de cuantizacion, no datos publicados por el autor.
- GPU recomendadas: para F16 o Q8_0, A100 80 GB o H100; para Q5_K_M y Q4_K_M, RTX 4090 (24 GB), RTX 3090 (24 GB) o A6000 (48 GB); para Q2_K y Q3, GPUs de 12-16 GB con posible offload parcial a CPU.
- Cabe en GPU de consumo: si, en cuantizaciones Q4_K_M o inferiores en GPUs de 24 GB; las cuantizaciones Q2_K y Q3 pueden caber en 12-16 GB con margen ajustado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que requeririan conversion previa.
- Latencia y throughput: no disponible; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-4-31B-it-ARA-heretic-GGUF | 30.7B | no disponible | GGUF | no disponible | Variante heretic cuantizada; sin benchmarks publicados |
| richardyoung/gemma-4-31B-it-ARA-heretic | no disponible | no disponible | safetensors (presumible) | no disponible | Modelo de origen del que deriva esta cuantizacion |
| mradermacher/gemma-4-31b-it-heretic-ara-i1-GGUF | no disponible | no disponible | GGUF | no disponible | Variante i1 (imatrix) del mismo linaje, alternativa de cuantizacion |
| mradermacher/Gemma-4-31B-StyleTune-heretic-ara-i1-GGUF | no disponible | no disponible | GGUF | apache-2.0 (segun metadatos del resultado de busqueda) | Otro derivado heretic de Gemma 4 31B orientado a estilo y roleplay |

La comparativa con modelos de otras familias (por ejemplo, Llama 3.3 70B o Qwen 2.5 32B) no se incluye porque no hay datos de rendimiento publicados para esta variante que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones humanas que permitan estimar la calidad del modelo.
- Licencia no declarada: la model card no indica licencia, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo de origen (`richardyoung/gemma-4-31B-it-ARA-heretic`) y del Gemma 4 base antes de cualquier despliegue en produccion.
- Naturaleza "heretic": estas variantes modifican el comportamiento de rechazo del modelo alineado; pueden generar contenido inapropiado, inseguro o sesgado con mayor frecuencia. Requieren moderacion externa en cualquier aplicacion publica.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no hay evaluacion especifica que lo cuantifique.
- Idiomas no declarados: se desconoce el soporte real de castellano y de otros idiomas; no hay metadatos que lo confirmen.
- Contexto desconocido: no se documenta la longitud de contexto soportada, lo que limita el diseno de aplicaciones con ventanas largas.
- Cuantizaciones agresivas: Q2_K y Q3_K_S pueden degradar notablemente la calidad; para uso serio se recomienda Q4_K_M o superior.
- Procedencia y trazabilidad: el modelo es una derivacion de terceros sin documentacion de entrenamiento; no es adecuado como base para sistemas criticos sin una evaluacion propia exhaustiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-31B-it-ARA-heretic-GGUF
- Modelo de origen: https://huggingface.co/richardyoung/gemma-4-31B-it-ARA-heretic
- Variante i1 del mismo linaje: https://huggingface.co/mradermacher/gemma-4-31b-it-heretic-ara-i1-GGUF
- Variante StyleTune heretic: https://huggingface.co/mradermacher/Gemma-4-31B-StyleTune-heretic-ara-i1-GGUF
