# magnitudedev/LFM2.5-2.6B-DSpark-GGUF

## Resumen

LFM2.5-2.6B-DSpark-GGUF es un artefacto de decodificacion especulativa (speculative decoding) publicado por la organizacion magnitudedev. Se trata de una copia propiedad de la organizacion del GGUF ya existente en LiquidAI/LFM2.5-2.6B-DSpark-GGUF, conservando integramente el payload de tensores y la cuantizacion del original. No es un modelo conversacional autonomo: es un borrador (drafter) que propone tokens candidatos y requiere obligatoriamente su modelo objetivo (target) correspondiente para funcionar. El propio autor marca el repositorio con `inference: false`.

El nombre del repositorio hace referencia al modelo objetivo LFM2.5-2.6B de Liquid AI, pero los metadatos de safetensors del repositorio declaran 327.707.521 parametros (aproximadamente 328 millones), una cifra coherente con el tamano del repo (0,4 GB) y con un fichero Q8_0 de ese orden de magnitud. Es decir, el componente incluido aqui es el borrador, no el modelo de 2,6B con el que se empareja. Esta discrepancia entre el nombre y el recuento real de parametros es relevante y conviene tenerla presente al planificar el despliegue.

La relevancia actual del artefacto es acotada: se trata de un componente de infraestructura para el marco de decodificacion especulativa DSpark de SGLang, con cero descargas y cero likes en el momento de la consulta. Su interes practico esta en que permite reducir la latencia de inferencia de un modelo objetivo LFM2.5-2.6B cuando se sirve con SGLang, siempre que el emparejamiento borrador-objetivo sea el correcto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Componente borrador tipo DFlash dentro del marco DSpark de SGLang; bloque de draft con atencion bidireccional (`dflash.attention.causal = false`). Arquitectura completa no disponible |
| Parametros totales | 327.707.521 (segun metadatos de safetensors, aproximadamente 328 M); el nombre del repositorio alude a un modelo objetivo de 2,6B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (fichero `LFM2.5-2.6B-DSpark-Q8_0.gguf`) |
| Idiomas soportados | No disponibles |
| Licencia | lfm1.0 (`license: other`, con `license_name: lfm1.0`) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible describe un borrador de decodificacion especulativa integrado en el marco DSpark de SGLang. El bloque de draft utiliza atencion bidireccional (`dflash.attention.causal = false`) y emplea `dflash.sample_from_anchor = true`, lo que implica que la seleccion de propuestas comienza en la fila ancla. Los metadatos indican que estos parametros se derivaron de la configuracion del checkpoint y de la configuracion DSpark de SGLang, y se verificaron contra salidas de referencia. El fichero se corresponde con la revision `7bc2896af56d82ccc7e156800197408db464d63b` del GGUF original, con SHA-256 `60976f32797df85460194af5fb596494c2c315c315d143c5c63ab8bbeb93c452`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO en este artefacto. Tampoco se detalla la arquitectura del modelo objetivo ni la innovacion tecnica concreta de DFlash mas alla de las notas de configuracion citadas. Todo ello debe considerarse no disponible.

## Capacidades

- Generacion de propuestas de tokens para decodificacion especulativa: el modelo actua como borrador y no produce la salida final.
- Aceleracion de la inferencia de un modelo objetivo compatible mediante verificacion de propuestas en el marco DSpark.
- Seleccion de propuestas a partir de la fila ancla (`sample_from_anchor`), con atencion bidireccional en el bloque de draft.
- Generacion de texto autonoma: no disponible; el modelo requiere su modelo objetivo y no esta pensado para uso directo.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Reduccion de latencia en servidores de inferencia con SGLang: el borrador se empareja con su modelo objetivo para proponer varios tokens por paso y verificar en paralelo, disminuyendo el tiempo por token en cargas de generacion autoregresiva.
- Despliegue de asistentes conversacionales de baja latencia: en escenarios donde el modelo objetivo LFM2.5-2.6B atiende peticiones interactivas, el uso del borrador permite acercarse a los requisitos de tiempo de primera respuesta y de tokens por segundo.
- Servicio por lotes de alto rendimiento: la decodificacion especulativa mejora el throughput agregado cuando el cuello de botella es la decodificacion secuencial, lo que resulta util en pipelines de generacion masiva de texto.
- Inferencia en hardware modesto: al ser un componente de aproximadamente 328 M de parametros en Q8_0, el borrador anade una huella de memoria reducida sobre el modelo objetivo, lo que facilita su inclusion en configuraciones con VRAM limitada.
- Entornos con soporte de pesos GGUF: al distribuirse en formato GGUF, encaja en pilas que ya trabajan con este formato, siempre que la herramienta de inferencia implemente el borrador DSpark y el emparejamiento con el objetivo.
- Evaluacion y experimentacion con decodificacion especulativa: util para reproducir los resultados de referencia de DSpark y medir la tasa de aceptacion de propuestas frente al modelo objetivo.
- Integracion en plataformas propias de la organizacion: al ser una copia propiedad de magnitudedev, permite controlar la procedencia y la revision del artefacto dentro de su propia infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el borrador: en Q8_0, aproximadamente 0,35 GB solo para los pesos, a lo que hay que sumar la memoria de cache de clave-valor del bloque de draft. Cifra orientativa, no confirmada por el autor.
- VRAM total: la del modelo objetivo mas la del borrador. El repositorio no publica cifras de VRAM para la pareja borrador-objetivo.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: el tamano del borrador es compatible con GPU de consumo por si solo, pero la viabilidad depende del modelo objetivo con el que se empareje.
- Opciones de despliegue: SGLang con el componente DSpark es el unico marco documentado en la informacion disponible (configuracion `dspark_config.py` e implementacion `dflash.py`). El formato GGUF sugiere compatibilidad con cargadores de dicho formato, pero no se confirma soporte del borrador en llama.cpp, Ollama o TGI dentro de la informacion facilitada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| magnitudedev/LFM2.5-2.6B-DSpark-GGUF | 327.707.521 (borrador) | No disponible | GGUF | lfm1.0 | HuggingFace, 0 descargas |
| LiquidAI/LFM2.5-2.6B-DSpark-GGUF | No disponible | No disponible | GGUF | No disponible | HuggingFace (origen del artefacto) |
| Otros borradores de decodificacion especulativa (EAGLE-3, Medusa) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento ni de especificaciones comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo autonomo: se trata de un borrador de decodificacion especulativa y requiere su modelo objetivo correspondiente. Cargarlo por separado no produce generacion de texto.
- Discrepancia de nomenclatura: el nombre sugiere 2,6B de parametros, pero los metadatos de safetensors declaran 327.707.521 parametros. Conviene verificar el emparejamiento correcto antes de desplegar.
- Riesgo de fallo por emparejamiento incorrecto: si la revision del modelo objetivo no coincide con la esperada, las propuestas del borrador pueden degradar el rendimiento o invalidarse.
- Sin datos de benchmarks: no hay evidencia publicada de tasa de aceptacion, ganancia de velocidad ni calidad en este repositorio.
- Sin informacion de sesgos, idiomas ni datos de entrenamiento: no es posible evaluar sesgos ni cobertura linguistica.
- Riesgo de alucinacion: no evaluado en este artefacto; cualquier salida final depende del modelo objetivo, no del borrador.
- Restricciones de licencia: la licencia es `lfm1.0` bajo la etiqueta `license: other`. No se detallan en la informacion proporcionada los terminos de uso comercial, por lo que deben revisarse en el fichero LICENSE antes de cualquier despliegue en produccion.
- Metadatos incompletos: `inference: false` en la model card, ausencia de pipeline declarada y cero descargas registradas, lo que limita la validacion por parte de terceros.
- Procedencia: es una copia organizativa de un GGUF de LiquidAI; la responsabilidad de mantener la paridad con el original recae en el publicador de esta copia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/magnitudedev/LFM2.5-2.6B-DSpark-GGUF
- GGUF original de LiquidAI: https://huggingface.co/LiquidAI/LFM2.5-2.6B-DSpark-GGUF/tree/7bc2896af56d82ccc7e156800197408db464d63b
- Configuracion DSpark en SGLang: https://github.com/sgl-project/sglang/blob/264d1c20153cadc921670b982e6531d9800353e6/python/sglang/srt/speculative/dspark_components/dspark_config.py
- Implementacion DFlash en SGLang: https://github.com/sgl-project/sglang/blob/264d1c20153cadc921670b982e6531d9800353e6/python/sglang/srt/models/dflash.py
- Repositorio de SGLang: https://github.com/sgl-project/sglang
