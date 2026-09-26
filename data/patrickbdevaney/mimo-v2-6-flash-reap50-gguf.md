# patrickbdevaney/MiMo-V2.6-Flash-REAP50-GGUF

## Resumen

MiMo-V2.6-Flash-REAP50 es una version podada del checkpoint XiaomiMiMo/MiMo-V2.6-Flash, un modelo multimodal de tipo Mixture-of-Experts (MoE) desarrollado originalmente por Xiaomi. La poda se ha realizado combinando la tecnica REAP (CerebrasResearch) con HOPE (Higher-Order Pruning of Experts), un metodo de segundo orden que tiene en cuenta las interacciones entre expertos, no solo las frecuencias de activacion. El resultado conserva 128 de los 256 expertos enrutados por capa en las 47 capas MoE del modelo.

Esta ficha corresponde concretamente a la cuantizacion GGUF de ese checkpoint podado, publicada por el usuario patrickbdevaney para su uso con llama.cpp. Incluye dos niveles de cuantizacion del tronco (MXFP4_MOE y Q2_K), los proyectores multimodales de vision y audio (mmproj) y las cabezas de prediccion multi-token (MTP) para decodificacion especulativa. El checkpoint base pesa 157.356.536.128 parametros y el repositorio ocupa 169,8 GB.

Su relevancia practica radica en que permite ejecutar un modelo MoE multimodal de gran tamano en hardware de gama alta para consumo o en configuraciones multi-GPU economicas, manteniendo supuestamente la fidelidad numerica de los expertos MXFP4 originales. La licencia MIT facilita su adopcion tanto en investigacion como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (47 capas MoE + 1 capa densa, 48 capas en total) |
| Parametros totales | 157.356.536.128 (checkpoint base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4_MOE (86,06 GiB), Q2_K (61,64 GiB); proyectores mmproj en BF16 (2,56 GiB) y Q8_0 (1,46 GiB); cabezas MTP en BF16 (4,17 GiB) y Q8_0 (2,22 GiB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 48 capas, de las cuales 47 son capas con expertos enrutados y una es densa. En cada capa MoE el checkpoint original dispone de 256 expertos; tras la poda REAP-50 se retienen 128 expertos por capa, lo que supone una reduccion del 50% en el numero de expertos. El modelo incorpora ademas dos torres multimodales: un codificador de vision basado en un ViT de 28 capas con representacion de parches de 560 px, y un tokenizador de audio con representaciones de habla RVQ. Asimismo incluye 3 capas de prediccion multi-token (MTP) entrenadas para decodificacion especulativa. La atencion y los embeddings se mantienen en BF16 sin cuantizar, mientras que el 92,9% de los pesos del modelo base se almacena como MXFP4 nativo empaquetado (tamano de bloque 32).

El proceso de poda emplea HOPE (Higher-Order Pruning of Experts) sobre un corpus de calibracion diverso que abarca codigo, matematicas, texto conversacional y tareas de razonamiento multimodal. A diferencia de los metodos de primer orden que solo consideran frecuencias de activacion, HOPE incorpora terminos de interaccion entre expertos mediante bloques de Hessiana cruzados, aproximando la perdida como la suma de un termino de gradiente mas un termino cuadratico de segundo orden. Con ello se seleccionan los 128 expertos por capa que minimizan la perdida de perplejidad bajo la reduccion del 50% de parametros. Este repositorio no reentrena el modelo: solo convierte y cuantiza el checkpoint podado, repaquetando los bloques MXFP4 directamente en `GGMLQuantizationType.MXFP4` para evitar ciclos de desquantizacion con perdida.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat.
- Razonamiento multimodal: procesamiento de imagenes mediante el codificador de vision de 28 capas (parches de 560 px).
- Procesamiento de audio: representaciones de habla mediante tokenizador RVQ.
- Prediccion multi-token (MTP) con 3 capas dedicadas, que permiten decodificacion especulativa y aceleracion de la generacion.
- Cuantizacion híbrida que preserva los expertos sensibles en MXFP4 nativo y comprime el tronco en Q8_0 (perfil Q2_K).
- Compatibilidad con el pipeline multimodal de llama.cpp mediante proyectores mmproj independientes.
- Servidor compatible con la API de OpenAI a traves de `llama-server`.
- Soporte de decodificacion especulativa cargando las cabezas MTP con `--draft-model`.
- Capacidad de tool calling / function calling: no confirmada en la informacion disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Despliegue multimodal en hardware de gama alta: cargando el checkpoint MXFP4_MOE en una GPU de 128 GB o en 2x48 GB, se puede ejecutar un asistente que procese simultaneamente imagenes y audio junto a texto.
- Asistencia conversacional con contexto largo: el modelo base esta pensado para dialogos multi-turno; la cuantizacion Q2_K (61,64 GiB) permite desplegarlo en 3x24 GB o en un Mac de 64-96 GB sin renunciar a la multimodalidad.
- Aceleracion de inferencia en produccion: las cabezas MTP permiten decodificacion especulativa, util para reducir latencia en servicios de generacion de texto de alto volumen.
- Analisis de imagenes en pipelines internos: usando `--image` y el proyector mmproj Q8_0, se pueden generar descripciones detalladas de imagenes para catalogacion, accesibilidad o moderacion de contenido.
- Transcripcion y enriquecimiento de audio: el tokenizador RVQ y la torre de audio permiten integrar el modelo en flujos de procesamiento de habla combinados con razonamiento textual.
- Servicio de API compatible con OpenAI: mediante `llama-server` se puede exponer el modelo en el puerto 8080 con `-ngl 99` para integrarlo en aplicaciones existentes que ya consumen la API de OpenAI.
- Investigacion sobre poda de MoE: sirve como referencia para estudiar el impacto de REAP + HOPE comparando el checkpoint podado con el modelo completo.
- Experimentacion con cuantizacion MXFP4 nativa: util para evaluar la fidelidad bit a bit frente a cuantizaciones tradicionales en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- MXFP4_MOE (86,06 GiB): se recomienda 96 GiB o mas de VRAM/RAM; opciones indicadas de 1x 128 GB (por ejemplo NVIDIA Thor) o 2x 48 GB.
- Q2_K (61,64 GiB): se recomienda 64 GiB o mas; opciones de 3x 24 GB (72 GB en total) o Mac con 64-96 GB de memoria unificada.
- Proyector multimodal mmproj: 1,46 GiB adicionales en Q8_0 o 2,56 GiB en BF16.
- Cabezas MTP para decodificacion especulativa: 2,22 GiB adicionales en Q8_0 o 4,17 GiB en BF16.
- GPU profesionales: el perfil MXFP4_MOE apunta a configuraciones de gama muy alta (128 GB o 2x48 GB). No cabe en una unica RTX 4090 (24 GB) ni siquiera en Q2_K.
- Consumer GPU: el modelo no cabe en una sola GPU de consumo; requiere configuraciones multi-GPU o equipos Apple Silicon con memoria unificada de 64-96 GB.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server` con `-ngl 99`), con soporte de `--draft-model` para MTP y `--mmproj` para multimodalidad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos por capa MoE | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-REAP50 (este) | 157.356.536.128 (checkpoint base) | 128 de 256 | no disponible | MIT | GGUF, llama.cpp (2 cuantizaciones) |
| XiaomiMiMo/MiMo-V2.6-Flash (base) | no disponible | 256 de 256 | no disponible | MIT (segun el repo derivado) | checkpoint HF original |
| patrickbdevaney/MiMo-V2.6-Flash-REAP50 | no disponible | 128 de 256 | no disponible | MIT | safetensors (checkpoint podado) |
| Alternativas de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de modelos alternativos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La poda del 50% de expertos puede degradar la calidad respecto al modelo original; la model card afirma minimizar la perdida de perplejidad, pero no aporta metricas comparativas.
- La cuantizacion Q2_K (~3,36 BPW) es agresiva y puede introducir perdida adicional de calidad frente al MXFP4_MOE, pese a que las down-projections se mantienen en MXFP4 nativo.
- No se especifica la longitud de contexto soportada, lo que complica planificar despliegues con requisitos de contexto largo.
- No se declaran los idiomas soportados; el soporte multilingue de Espana no puede confirmarse.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; inherente a modelos generativos de este tamano.
- Sesgos: no documentados en la model card.
- Los proyectores multimodales y las cabezas MTP se distribuyen en ficheros separados; es necesario cargarlos explicitamente para aprovechar vision, audio o decodificacion especulativa.
- La licencia declarada es MIT, pero no se detalla si existen restricciones adicionales heredadas del modelo base de Xiaomi; conviene verificar la licencia del checkpoint original antes de uso comercial.
- La ficha del repositorio indica 0 descargas y 1 like, por lo que el modelo carece de validacion comunitaria amplia.
- Compatibilidad: al ser un GGUF basado en llama.cpp, requiere una version reciente que soporte `GGMLQuantizationType.MXFP4` y el pipeline multimodal.
- Las cabezas MTP solo aportan aceleracion si el backend de inferencia soporta decodificacion especulativa con `--draft-model`.

## Enlaces

- Repositorio GGUF: https://huggingface.co/patrickbdevaney/MiMo-V2.6-Flash-REAP50-GGUF
- Checkpoint podado base: https://huggingface.co/patrickbdevaney/MiMo-V2.6-Flash-REAP50
- Modelo original de Xiaomi: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash
- Metodo REAP (CerebrasResearch): https://github.com/CerebrasResearch/reap
- Perfil del autor: https://huggingface.co/patrickbdevaney
