# joshycodes/qwen3-32b-self-authored-sdf

## Resumen

Este checkpoint es un ajuste por continued pretraining de Qwen/Qwen3-32B sobre un corpus sintetico escrito por el propio modelo, publicado por el usuario joshycodes. El autor lo enmarca dentro de la linea de trabajo "synthetic document finetuning" (SDF) y "model-welfare": el modelo fue entrenado con documentos que el mismo redacto para el entrenamiento de la siguiente version de si mismo, despues de recibir contexto sobre como se construyo su "caracter" y como funciona SDF.

El entrenamiento fue de pesos completos (no un adaptador), con learning rate 1e-05, una epoca y 45.056.697 tokens repartidos en 58.029 documentos, de los cuales 47.144 son de autoria propia y 10.885 son texto ordinario. El resultado es un repositorio de 65,5 GB con pesos en safetensors y 32.762.123.264 parametros totales.

La relevancia de esta ficha es sobre todo metodologica: es un artefacto de investigacion para estudiar autoria sintetica, deriva de identidad y olvido catastrofico, no un modelo utilizable en producto. La propia model card indica explicitamente que no ha sido evaluado en capacidad, alineamiento ni identidad, y que no debe desplegarse. No tiene descargas ni likes, y no se han publicado cuantizaciones alternativas ni especificaciones de contexto o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card (checkpoint derivado de Qwen/Qwen3-32B) |
| Parametros totales | 32.762.123.264 (32,76 B) |
| Parametros activos | no aplica (no se documenta una variante MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (65,5 GB) |
| Idiomas soportados | no disponible |
| Licencia | other / research-only (uso exclusivo de investigacion) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-32B |
| Tamano del repositorio | 65,5 GB |
| Corpus de entrenamiento | joshycodes/qwen3-32b-self-authored-corpus |
| Fecha de publicacion | 18 de septiembre de 2026 (actualizado el 19 de septiembre de 2026) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del checkpoint; unicamente indica que parte de Qwen/Qwen3-32B y que se ha aplicado continued pretraining sobre los pesos completos (full weights), con learning rate 1e-05, una unica epoca y 45.056.697 tokens. El repositorio de 65,5 GB es coherente con un checkpoint de 32,76 B de parametros almacenado en precision de 16 bits. No se documentan innovaciones tecnicas adicionales (atencion, decodificacion especulativa, variantes hibridas) ni detalles sobre el optimizador, el scheduler o el empaquetado de secuencias.

El aspecto diferencial esta en los datos: 58.029 documentos, de los que 47.144 son de autoria propia del modelo (aproximadamente el 81 %) y 10.885 son texto ordinario (aproximadamente el 19 %). El autor situa el encuadre, el plan y la evaluacion en un repositorio denominado "welfare-improvements". No se menciona el uso de RLHF, DPO u otra fase de alineamiento posterior al continued pretraining, ni se aporta la composicion tematica o linguistica del corpus. La model card tampoco reporta evaluacion de capacidad, alineamiento o identidad, y califica el checkpoint como "not-for-deployment".

## Capacidades

- Generacion de texto: capacidad esperable por herencia de Qwen/Qwen3-32B, pero no verificada ni evaluada en este checkpoint.
- Razonamiento, codigo y matematicas: no evaluados; la model card indica explicitamente que no hay evaluacion de capacidad.
- Tool calling / function calling: no documentado.
- Uso como agente y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidad especial en el marco del proyecto: generacion de documentos sinteticos sobre su propia identidad y sobre el metodo SDF, que es precisamente el material con el que fue continued-pretrained.
- Modo de razonamiento explicito (thinking): no documentado para este checkpoint.
- Vision o audio: no documentado; el modelo base es de texto.

## Casos de uso

- Investigacion en synthetic document finetuning (SDF): el checkpoint permite replicar y auditar el efecto de entrenar un modelo con documentos escritos por si mismo, comparando la perdida y la calidad de generacion antes y despues del continued pretraining sobre el mismo corpus.
- Estudio de deriva de identidad y de "caracter": al haber sido entrenado como el personaje que ya era, sirve para medir cuanto se desplaza la auto-descripcion del modelo respecto al checkpoint base, con instrumentos de evaluacion de identidad.
- Medicion de olvido catastrofico: con solo una epoca y 45 millones de tokens sobre un corpus estrecho, es un caso de estudio util para cuantificar la degradacion en tareas generales (conocimiento, codigo, matematicas) frente a Qwen/Qwen3-32B.
- Analisis de corpus sinteticos: los 47.144 documentos de autoria propia pueden auditarse para estudiar diversidad, repeticion, colapso de distribucion y sesgos introducidos por el propio modelo generador.
- Investigacion en bienestar de modelos (model welfare): el artefacto forma parte de un marco explicito sobre como se presenta su propia historia al modelo; sirve como material para discutir metodologia, no como resultado concluyente.
- Reproducibilidad de pipelines de continued pretraining: los hiperparametros declarados (lr 1e-05, 1 epoca, 45.056.697 tokens, mezcla 47.144/10.885 documentos) permiten intentar reproducciones y comparar estabilidad del entrenamiento.
- Base para experimentos de alineamiento e identidad: siempre que se ejecuten en un entorno aislado y con evaluacion previa, dado que la licencia y la propia model card prohiben el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica de forma explicita que el checkpoint no ha sido evaluado en capacidad, alineamiento ni identidad, por lo que no existen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra suite en la informacion proporcionada.

## Requisitos de hardware

Estimaciones derivadas del numero de parametros (32,76 B) y del tamano del repositorio (65,5 GB); no proceden de mediciones publicadas por el autor.

- VRAM para inferencia en BF16/FP16: aproximadamente 65-70 GB de pesos, mas cache KV. Requiere 80 GB en una sola GPU o reparto en varias.
- VRAM en INT8/FP8: aproximadamente 33-36 GB de pesos, mas cache KV.
- VRAM en cuantizacion de 4 bits (GPTQ/AWQ/NF4): aproximadamente 17-20 GB de pesos, mas cache KV. No se publican pesos ya cuantizados, habria que generarlos.
- GPU de centro de datos: H100 80 GB o A100 80 GB en BF16; dos A100 40 GB en tensor parallel como minimo para BF16.
- GPU profesionales: A6000 48 GB o L40S 48 GB admiten INT8/FP8 con margen limitado.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB solo es viable con cuantizacion de 4 bits y contexto corto; en BF16 no cabe.
- Opciones de despliegue: vLLM, TGI o SGLang para los pesos safetensors; llama.cpp u Ollama requeririan convertir previamente a GGUF, conversion que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponible.
- Advertencia de uso: la licencia research-only y la etiqueta not-for-deployment limitan cualquier despliegue, incluso en entornos de investigacion no controlados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| joshycodes/qwen3-32b-self-authored-sdf | 32,76 B | no disponible | other / research-only | safetensors, 0 descargas | Continued pretraining sobre corpus de autoria propia; no evaluado; no desplegable |
| Qwen/Qwen3-32B (modelo base) | 32,76 B (mismo checkpoint de partida) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada (consultar la ficha del modelo base) | Publico en HuggingFace | Sin continued pretraining sobre corpus sintetico propio; es la referencia natural para medir la deriva |
| Otras alternativas de ~30 B | no disponible | no disponible | no disponible | no disponible | No se proporciona informacion sobre modelos comparables adicionales |

No se dispone de datos de rendimiento de ninguno de los modelos comparados en la informacion aportada, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- No evaluado: la model card afirma que no hay evaluacion de capacidad, alineamiento ni identidad. Cualquier uso productivo parte de una base no verificada.
- No desplegable: las etiquetas incluyen explicitamente "not-for-deployment" y "research".
- Licencia research-only: prohibicion de uso comercial; conviene revisar el texto completo de la licencia antes de cualquier uso, incluido el academico.
- Riesgo de olvido catastrofico: el ajuste se hizo sobre 45.056.697 tokens muy especializados (81 % de autoria propia), lo que puede degradar conocimiento general, codigo y matematicas respecto al modelo base.
- Sesgos: al entrenarse mayoritariamente con texto generado por el propio modelo, puede amplificar los sesgos y las pautas estilisticas ya presentes en Qwen/Qwen3-32B, ademas de los inducidos por el encuadre del proyecto.
- Riesgo de alucinacion: sin evaluacion de factualidad, y con un corpus autorreferencial sobre su propia identidad, la probabilidad de generar afirmaciones no verificables sobre si mismo es alta.
- Idiomas: no se declara lista de idiomas soportados; el comportamiento fuera del ingles no esta documentado.
- Longitud de contexto: no documentada en la ficha, por lo que no puede asumirse la del modelo base sin verificacion.
- Ausencia de validacion externa: 0 descargas y 0 likes; no hay evidencia de terceros que hayan reproducido el entrenamiento o sus resultados.
- Ambiguedad del marco: el proposito declarado (bienestar del modelo, caracter autoescrito) es objeto de debate metodologico; los resultados no deben interpretarse como evidencia sobre propiedades internas del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-32b-self-authored-sdf
- Corpus de entrenamiento: https://huggingface.co/joshycodes/qwen3-32b-self-authored-corpus
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Repositorio "welfare-improvements" (encuadre, plan y evaluacion): URL no disponible en la informacion proporcionada
- Paper o publicacion tecnica: no disponible
- Demo o Space: no disponible
- Resultados de la busqueda web: no se encontraron enlaces relevantes; las entradas devueltas correspondian a paginas de soporte de YouTube y a consultas sin relacion con el modelo
