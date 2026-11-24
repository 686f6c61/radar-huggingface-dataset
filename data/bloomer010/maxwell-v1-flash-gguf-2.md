# bloomer010/Maxwell-V1-Flash-GGUF

## Resumen

Maxwell-V1-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por maxwell-model, distribuido en formato GGUF por el usuario bloomer010. Con 36.810.559.422 parametros totales (aproximadamente 36,8 mil millones) y unos 3 mil millones de parametros activos por token, emplea una arquitectura poco convencional que combina hyper-connections con restriccion de variedad (manifold-constrained), atencion block-sparse y un bloque MTP/NextN para decodificacion especulativa. Soporta hasta 256K tokens de contexto.

Este repositorio es una conversion a GGUF del modelo base en BF16, pensada para su uso con llama.cpp, pero requiere un fork especifico (maxwell-moe) porque la arquitectura no esta integrada en llama.cpp upstream. El modelo esta orientado a uso conversacional, con plantilla de chat y formato de tool calling embebidos, y modo de razonamiento (thinking) activado por defecto.

Su relevancia practica radica en que ofrece una ventana de contexto muy amplia (256K) con un coste de inferencia reducido gracias a la activacion dispersa de expertos, y en que el repositorio incluye cuantizaciones desde BF16 hasta Q3_K_M, con una matriz de importancia propia generada por el autor. La licencia Apache-2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con hyper-connections restringidas a variedad, atencion block-sparse y bloque MTP/NextN (maxwell-moe) |
| Parametros totales | 36.810.559.422 (aprox. 36,8 B) |
| Parametros activos | Aprox. 3 B por token |
| Longitud de contexto | Hasta 262.144 tokens (256K) |
| Tipos de cuantizacion | BF16 (2 partes), Q8_0, Q8_K_XL, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M |
| Idiomas soportados | No disponible (tokenizador construido para tailandes, lao, birmano, jemer y shan, ademas de CJK y texto latino) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (origen en safetensors BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos: de sus 46 bloques, 45 son capas de backbone (3 con FFN densa y 42 con FFN de tipo MoE) y uno adicional es la capa MTP. Incorpora hyper-connections con 4 flujos residuales y 20 iteraciones de Sinkhorn (epsilon 1e-6) para la mezcla de residuos. La atencion es densa en las primeras 16K posiciones de query y pasa a block-sparse mas alla de ese umbral: 8 bloques de prefijo, 8 locales y hasta 16 bloques de 128 tokens seleccionados por un indexer. Este umbral se almacena como clave GGUF (`attention.indexer.dense_prefix_tokens`) y requiere flash attention para activarse; sin ella, el modelo recurre a atencion densa en todas las longitudes.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. El bloque MTP se exporta como capa NextN y permite decodificacion especulativa mediante `--spec-type draft-mtp`. La conversion preserva en F32 las normas, tensores de routing, sesgos de expertos y matrices de hyper-connection, y embebe la plantilla de chat con `<|maxwell_end|>` (id 200001) como token de parada EOT.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 256K tokens.
- Modo de razonamiento (thinking) activado por defecto, desactivable por peticion con `chat_template_kwargs.enable_thinking = false`.
- Tool calling / function calling: llamadas individuales a herramientas y round-trips de resultados funcionan, tanto por debajo como por encima del umbral de 16K.
- Decodificacion especulativa mediante el bloque MTP integrado.
- Tokenizacion multilingue orientada a tailandes, lao, birmano, jemer, shan, CJK y alfabeto latino.
- Atencion de largo alcance con mecanismo block-sparse para contextos extensos.
- No se documenta soporte de vision, audio ni agentes multi-paso fiables.

## Casos de uso

- Atencion al cliente automatizada: la ventana de 256K permite mantener historiales de conversacion muy largos y documentos de referencia en el mismo contexto, con un coste de inferencia contenido gracias a los 3B parametros activos.
- Analisis de documentos extensos: resumen y extraccion de informacion sobre contratos, informes o expedientes que superan los 100K tokens, aprovechando la atencion block-sparse para mantener coherencia en pasajes alejados.
- Asistentes de codigo con contexto de repositorio: la matriz de importancia se genero sobre un corpus mixto de codigo e ingles, y el modelo soporta tool calling para integrarse en pipelines de edicion y consulta de ficheros.
- Procesamiento de texto en idiomas del sudeste asiatico: el tokenizador cubre tailandes, lao, birmano, jemer y shan, lo que lo hace util para tareas de traduccion o normalizacion en esas lenguas.
- Despliegue en estaciones de trabajo con una sola GPU: la cuantizacion Q4_K_M (22,3 GB) cabe en 32 GB de VRAM y permite servir el modelo en local con llama-server.
- Chatbot interno con razonamiento explicito: el modo thinking por defecto facilita trazas de razonamiento auditables en entornos donde se requiere justificar respuestas.
- Integracion de herramientas simples: llamadas a APIs o funciones individuales con round-trip de resultados, por ejemplo consultas a bases de datos o calculadoras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento medido es la decodificacion especulativa con el fichero Q8_0 sobre 2xV100: tasa de aceptacion del draft de 0,32 y longitud media aceptada de 1,92 tokens por paso, sin ganancia neta de velocidad en ese hardware.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q3_K_M ~17 GB; IQ4_XS ~21 GB; Q4_K_M 22,3 GB; Q5_K_M ~27 GB; Q6_K ~31 GB; Q8_0 39,2 GB; Q8_K_XL ~42 GB; BF16 73,7 GB (2 partes).
- El coste de KV cache es de aproximadamente 90 KB por token en fp16; con `--cache-type-k q8_0 --cache-type-v q8_0` se reduce a la mitad.
- GPU recomendadas: 24 GB (RTX 3090/4090) para Q3_K_M; 32 GB (A100 40GB, RTX 5090 o similar) para Q4_K_M e IQ4_XS; 40-48 GB (A100 40GB, L40S, RTX 6000 Ada) para Q5_K_M y Q6_K; 56 GB o mas (A100 80GB, H100) para Q8_0 y Q8_K_XL; BF16 requiere 96 GB o desbordamiento a CPU.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q3_K_M o inferiores, dejando margen para la KV cache.
- Opciones de despliegue: llama.cpp con el fork maxwell-moe (llama-server, llama-cli) o aplicando `maxwell-moe-port.patch` sobre master (commit 91979450). Requiere `--jinja`, `--flash-attn on` para la ruta dispersa y `--spec-type draft-mtp` para la decodificacion especulativa.
- Latencia y throughput: no disponibles salvo la medicion de MTP en 2xV100 indicada arriba.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Maxwell-V1-Flash | 36,8 B / ~3 B | 256K | Apache-2.0 | GGUF (requiere fork) y safetensors BF16 |
| Alternativas MoE de tamano comparable | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El uso de agentes multi-paso con herramientas no es fiable; solo funcionan llamadas individuales y el retorno de resultados.
- Requiere un fork no oficial de llama.cpp (maxwell-moe); no funciona con llama.cpp upstream ni con otras herramientas de inferencia sin portar la arquitectura.
- La atencion block-sparse solo se activa con flash attention; sin ella el modelo usa atencion densa en todas las longitudes, con el coste de memoria y computo asociado.
- El tokenizador se valido solo sobre una muestra pequena para los idiomas del sudeste asiatico; el rendimiento real en esas lenguas no esta verificado a escala.
- La matriz de importancia se genero con un corpus propio de codigo e ingles, no con el conjunto de calibracion del fabricante, lo que puede afectar a la calidad de las cuantizaciones K e i-quant.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni de factualidad en la informacion disponible.
- Las cuantizaciones mas agresivas (Q3_K_M y menores) degradan la calidad segun advierte el propio autor.
- El repositorio ocupa 625,5 GB, lo que complica su descarga y almacenamiento completos.
- Licencia Apache-2.0 permite uso comercial, pero la dependencia de un fork de llama.cpp anade riesgo de mantenimiento en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bloomer010/Maxwell-V1-Flash-GGUF
- Modelo base: https://huggingface.co/maxwell-model/Maxwell-V1-Flash
- Fork de llama.cpp con soporte maxwell-moe: https://github.com/aetherbird/llama.cpp/tree/maxwell-moe
