# jarrelscy/GLM-5.3-Flash-NestQuant-1.5-4bit

## Resumen

GLM-5.3-Flash-NestQuant-1.5-4bit es una compilacion cuantizada del modelo multimodal zai-org/GLM-5.3-Flash, publicada por el usuario jarrelscy. Se trata de un transformer de tipo Mixture-of-Experts (MoE) con vision nativa, cuyos expertos enrutados se almacenan en un formato propietario de dos niveles denominado NestQuant: una base de 1,5 bits por peso mas un plano residual que eleva el experto a 4 bits en tiempo de servicio. El repositorio declara 16.917.224.286 parametros en total y 145,4 GB de ficheros, con soporte de contexto de 128K tokens.

La relevancia de esta ficha es doble. Por un lado, muestra una tecnica de cuantizacion no estandar orientada a ejecucion en hardware de memoria unificada: el objetivo declarado es un Mac de 128 GB con 96 GB utilizables para pesos, cache KV y runtime, cargando solo 67 de los 288 expertos por capa a 4 bits y el resto a 1,5 bits. Por otro, el propio autor marca el repositorio como "TODO: encoding in progress": el modelo no se puede cargar con transformers, vLLM ni MLX estandar, y el kernel de servicio y el cargador se publicaran por separado. Es, por tanto, un artefacto experimental, no un modelo listo para produccion.

El modelo conserva la torre de vision nativa en bf16 (1,1 GB), el backbone en FP8 tal como se distribuye (15,5 GB) y la capa MTP (Multi-Token Prediction) en FP8 con 7,25B de parametros en expertos enrutados (7,2 GB), que no cabe en el perfil de 96 GB y por tanto no se carga en el escenario objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atencion lineal Kimi KDA, atencion DSA/MLA cada 4 capas, hiperconexiones mHC y capa MTP |
| Parametros totales | 16.917.224.286 (dato de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 128K tokens (cache KV estimada en ~0,9 GB a 128K) |
| Tipos de cuantizacion | NestQuant 1,5 bits (base) + residual a 4 bits en expertos enrutados; FP8 en backbone y capa MTP; bf16 en torre de vision |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (3.532 tensores indexados) |

Datos adicionales de estructura: 42 capas con expertos enrutados (capas 3 a 44), 288 expertos por capa, de los cuales 67 (23%) se sirven a 4 bits; 19 son un conjunto fijo y 48 son flotantes, seleccionados por un predictor previo al enrutamiento. Los expertos se reparten en 8 particiones para tensor parallel (`tp{0..7}`).

## Arquitectura y entrenamiento

La arquitectura subyacente es la de GLM-5.3-Flash: un MoE multimodal en el que el backbone combina atencion lineal Kimi KDA con atencion DSA/MLA cada cuarta capa, hiperconexiones mHC, MLP densa en las capas 0-2, expertos compartidos, puertas de enrutamiento con `e_score_correction_bias`, normas, embeddings y `lm_head`. Sobre ese backbone se anade una capa MTP (capa 45) con 288 expertos enrutados y 7,25B de parametros, destinada a decodificacion especulativa. El modelo acepta imagenes mediante una torre de vision nativa con su merger, conservada byte a byte en bf16.

El proceso de cuantizacion descrito en la model card consta de cuatro piezas. Primero, una rotacion con signos aleatorios y Hadamard-128 aplicada a ambos lados de cada matriz de pesos, tras la cual los pesos de los expertos de Flash quedan practicamente gaussianos (curtosis medida entre 2,996 y 3,004 en 60 matrices). Segundo, la base de 1,5 bits: un codigo trellis con tasa de patron desplazada, donde el paso p de cada ventana de 16 usa 1 + ((0xAAAA >> (p % 16)) & 1) bits, es decir 24 bits por cada 16 pesos, con signo por tile y ajuste mediante LDLQ. Tercero, el residual de 4 bits: un segundo codigo trellis sobre el residual rotado, ajustado conjuntamente con la base, a 2,5 bits por peso en gate/up y 2,8125 en down. Cuarto, la calibracion: 4,0M de tokens de texto y 1.200 imagenes (radiologia, capturas web, imagenes naturales, OCR) pasadas por la propia torre de vision de Flash, con Hessianos por experto que mezclan 75% texto y 25% vision.

El conjunto fijo de 19 expertos por capa se elige con una puntuacion REAP ponderada por frontera (peso de enrutamiento multiplicado por la norma de salida del experto, sumado sobre tokens), dando mas peso a los tokens inmediatamente anteriores al final del razonamiento y al final de cada turno (peso 50 para el ultimo token, 20 para los 2-4 anteriores, 5 para los 5-16 y 2 para los 17-32), de modo que los expertos que deciden cuando parar permanecen a 4 bits. No se documenta en la informacion disponible ninguna fase de RLHF o DPO especifica de esta compilacion.

## Capacidades

- Generacion de texto conversacional en formato multimodal de imagen-a-texto (`image-text-to-text`).
- Comprension de imagenes: la torre de vision nativa y el merger se incluyen en bf16, por lo que el modelo sigue aceptando entradas visuales.
- Razonamiento multi-paso y conversacion multiturno, heredados del modelo base GLM-5.3-Flash.
- Decodificacion especulativa mediante la capa MTP, disponible solo en maquinas con memoria suficiente para cargar `mtp_experts-*` (7,2 GB adicionales).
- Servicio con paralelismo de tensor a 8 vias, gracias al troceado de los planos de expertos por capa en ficheros `tp0..tp7`.
- Capacidad de escalado en precision: el pool de expertos calientes a 4 bits se dimensiona en el arranque, de modo que los mismos ficheros permiten mas expertos a 4 bits en una maquina mayor.
- Soporte de tool calling, function calling, agentes, capacidades multilingues o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo Apple Silicon de gama alta: el perfil objetivo es un Mac de 128 GB con 96 GB utiles, donde el modelo ocupa aproximadamente 58 GB de base de expertos, 23 GB de planos residuales, 10 GB de backbone en FP8 tras carga, 1,1 GB de vision y 0,9 GB de cache KV a 128K.
- Analisis de documentos con componente visual: al conservar la torre de vision, el modelo puede procesar capturas de pantalla, formularios escaneados o imagenes con texto OCR en el mismo paso que la generacion de texto, sin pipeline separado.
- Despliegue con tensor parallel en servidores multi-GPU: los ficheros `layers/L{L}/tp{0..7}.safetensors` permiten repartir los planos de expertos entre 8 rangos, lo que encaja en nodos con 8 aceleradores y memoria agregada amplia.
- Investigacion en cuantizacion extrema: el repositorio es un caso de estudio reproducible de un esquema trellis anidado con calibracion multimodal ponderada, util para medir la degradacion de KLD al bajar de 2 bits por peso en la base.
- Pruebas de decodificacion especulativa con MTP: en maquinas con mas de 96 GB es posible cargar la capa 45 en FP8 y comparar latencia frente a la ejecucion sin MTP.
- Evaluacion de estrategias de retencion de expertos: el conjunto fijo de 19 expertos por capa, seleccionado con REAP ponderado por frontera de turno, sirve como banco de pruebas para politicas de "expertos calientes" en MoE cuantizados.
- Generacion de codigo y asistencia tecnica conversacional: heredada del modelo base, aunque sin datos de benchmarks que la cuantifiquen en esta compilacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de calidad con divergencia KL frente a los logits completos del modelo BF16 en ventanas reservadas, comparando la referencia FP8 con este build de 1,5-4 bits (67 expertos a 4 bits por capa), pero todos los valores estan marcados como "TODO". Tampoco se publican cifras de latencia o throughput.

## Requisitos de hardware

- VRAM/memoria estimada: ~92 GB en el perfil de 96 GB (58 GB de base de expertos a 1,5 bits, 23 GB de planos residuales a 4 bits, 10 GB de backbone, 1,1 GB de vision y 0,9 GB de cache KV a 128K). Los valores de las dos primeras filas estan marcados como "TODO: measured" en la model card.
- Hardware objetivo declarado: Mac de 128 GB con 96 GB utilizables.
- La capa MTP (7,2 GB en expertos FP8) no cabe en el perfil de 96 GB; se omite en ese escenario y solo se carga en maquinas con mas memoria.
- GPU recomendadas: no disponible en la informacion proporcionada. Los ficheros estan preparados para tensor parallel de 8 vias, lo que sugiere nodos multi-GPU, pero no se especifica ninguna GPU concreta.
- Compatibilidad con GPU de consumo: no disponible; el unico perfil de ejecucion descrito es el Mac de 128 GB.
- Opciones de despliegue: ninguna disponible actualmente. El repositorio indica explicitamente que no se puede cargar con transformers, vLLM ni MLX estandar, y que el kernel de servicio y el cargador se publicaran por separado. El subdirectorio `serving/predictor/` contiene el predictor del conjunto flotante, tambien marcado como TODO.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jarrelscy/GLM-5.3-Flash-NestQuant-1.5-4bit | 16.917.224.286 | 128K | NestQuant 1,5 bits + residual 4 bits | MIT | Repositorio publicado, no cargable con runtimes estandar (TODO) |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | FP8 (original) | no disponible | Modelo base de referencia |
| GLM-5.3 NestQuant (otras releases) | no disponible | no disponible | NestQuant | no disponible | Mencionadas en la model card como precedente, sin ficha publica en la informacion disponible |

No se dispone de datos de otras alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Estado incompleto: el autor marca el repositorio como "TODO. Encoding in progress". No es cargable con transformers, vLLM ni MLX estandar, y faltan el kernel de servicio y el cargador.
- Sin metricas de calidad: la tabla de KLD frente al modelo BF16 esta enteramente como TODO, igual que los tamanos medidos de las particiones de expertos. No hay evidencia publicada de la degradacion real introducida por la base de 1,5 bits.
- Error de cuantizacion conocido: la propia model card indica que el error de la base de 1,5 bits es aproximadamente el doble que el de una base de 2 bits, lo que hace esperable una perdida de calidad mayor que en cuantizaciones a 4 bits completos.
- Dependencia del predictor: 48 de los 67 expertos a 4 bits por capa son flotantes y los elige un predictor entrenado sobre el enrutamiento de Flash, cuyo codigo esta en `serving/predictor/` y sigue pendiente. Sin el, el comportamiento en servicio no esta definido.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; se hereda el del modelo base, agravado potencialmente por la cuantizacion agresiva de expertos.
- Limitaciones de idioma: no disponible; la model card no lista idiomas soportados.
- Restricciones de licencia: licencia MIT declarada, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base zai-org/GLM-5.3-Flash, no detallada en la informacion disponible.
- Caveat de produccion: al no existir todavia verificacion de ida y vuelta por capa ni comprobaciones de decodificacion en ambos niveles, no hay garantia de integridad funcional de los ficheros de expertos.
- La capa MTP, necesaria para decodificacion especulativa, queda fuera del perfil de 96 GB, de modo que en el escenario objetivo no se aprovecha esa optimizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jarrelscy/GLM-5.3-Flash-NestQuant-1.5-4bit
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Papers, blogs, repositorios o demos adicionales: no disponible. Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo (unicamente paginas generales sobre ChatGPT, sin relacion con la ficha).
