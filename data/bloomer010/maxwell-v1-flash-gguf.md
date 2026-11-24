# bloomer010/maxwell-v1-flash-GGUF

## Resumen

Maxwell-V1-Flash es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por maxwell-model, publicado originalmente en formato BF16 y distribuido en este repositorio por el usuario bloomer010 como conversiones GGUF para llama.cpp. Con 36.810.559.422 parametros totales (aproximadamente 35B) y unos 3B parametros activos por token, el modelo esta disenado para ofrecer un equilibrio entre capacidad y coste de inferencia, con un contexto maximo de 256K tokens.

La arquitectura incorpora innovaciones poco habituales: hyper-conexiones con restriccion de variedad (manifold-constrained hyper-connections), atencion block-sparse a partir de los primeros 16K tokens y un bloque MTP (multi-token prediction) exportado como capa NextN para decodificacion especulativa. Estas caracteristicas lo sitúan en la categoria de modelos conversacionales con soporte de razonamiento y tool calling de un solo paso.

La relevancia de este repositorio es practica: permite ejecutar el modelo en llama.cpp mediante un fork especifico (maxwell-moe) y ofrece cuantizaciones desde Q3_K_M hasta BF16, ademas de una importance matrix propia generada sobre un corpus de codigo e ingles. La licencia Apache-2.0 facilita su adopcion comercial, aunque la falta de soporte en llama.cpp upstream y el estado experimental del port son limitaciones importantes a tener en cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con manifold-constrained hyper-connections, atencion block-sparse y bloque MTP (NextN) |
| Parametros totales | 36.810.559.422 (~35B) |
| Parametros activos | ~3B por token (MoE) |
| Longitud de contexto | Hasta 262.144 tokens (256K) |
| Tipos de cuantizacion | BF16, Q8_0, Q8_K_XL, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M |
| Idiomas soportados | No disponibles (tokenizer entrenado para tailandes, lao, birmano, jemer, shan, CJK y latin) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors BF16 como base) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 45 capas de backbone (3 con FFN densa y 42 con capas MoE) mas una capa MTP adicional, sumando 46 bloques en total. Incorpora hyper-conexiones con 4 streams residuales y 20 iteraciones de Sinkhorn (epsilon 1e-6), un mecanismo que restringe las matrices de conexion residual a una variedad concreta para estabilizar el entrenamiento en profundidad. La atencion es densa en las primeras 16K posiciones de query y pasa a block-sparse mas alla de ese umbral: 8 bloques de prefijo, 8 locales y hasta 16 bloques de 128 tokens seleccionados por un indexer. El umbral se expone como clave GGUF (`attention.indexer.dense_prefix_tokens`).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El bloque MTP se exporta como capa NextN y permite decodificacion especulativa mediante `--spec-type draft-mtp` en llama.cpp. Los pesos de normas, tensores de routing, sesgo de expertos y matrices de hyper-conexion se mantienen en F32 durante la cuantizacion. La importance matrix se genero sobre 604 chunks de 512 tokens (~309.000 tokens) de un corpus mixto de codigo e ingles, con 573 entradas de matriz, distinto del conjunto de calibracion del proveedor.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 256K tokens.
- Razonamiento con modo "thinking" activado por defecto, desactivable por peticion mediante `chat_template_kwargs.enable_thinking = false`.
- Tool calling de un solo paso y round-trips de resultados de herramientas, validados a ambos lados del umbral de 16K tokens.
- Decodificacion especulativa mediante el bloque MTP integrado (aceptacion de draft medida de 0,32 y longitud media aceptada de 1,92 tokens por paso en 2xV100 con Q8_0).
- Atencion block-sparse para contextos largos, con fallback a atencion densa si no se activa flash attention.
- Soporte de plantilla de chat y formato de tool-call embebidos (requiere `--jinja`).
- Capacidades multilingues parciales: el tokenizer fue construido para tailandes, lao, birmano, jemer, shan, CJK y latin, aunque la validacion del pre-type se hizo sobre una muestra pequena.
- No se documentan capacidades de vision ni de audio.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a su ventana de 256K tokens, manteniendo coherencia en dialogos largos sin truncar contexto.
- Asistentes de codigo en IDE: con 3B parametros activos y cuantizacion Q4_K_M (22,3 GB), puede desplegarse en una estacion de trabajo con 32 GB de VRAM para autocompletado y explicacion de codigo con latencia contenida.
- Procesamiento de documentos largos: analisis de contratos, informes o bases de codigo completas en una sola pasada gracias al contexto de 256K y a la atencion block-sparse que reduce el coste computacional mas alla de 16K tokens.
- Pipelines de extraccion de datos estructurados: uso de tool calling de un solo paso para invocar funciones de parseo o consulta a APIs, con round-trip de resultados validado.
- Razonamiento con modo thinking para tareas de analisis: activacion del modo de razonamiento para problemas de logica o matematicas donde se beneficia de cadenas de pensamiento explicitas.
- Despliegue en hardware de gama alta para inferencia por lotes: con BF16 (73,7 GB en dos partes) en GPUs de 96 GB o con spill a CPU, adecuado para servicios de generacion con throughput alto y sin requisitos de baja latencia.
- Experimentacion en investigacion: la licencia Apache-2.0 y la disponibilidad de cuantizaciones desde Q3_K_M permiten probar el modelo en entornos academicos con GPUs de 24 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q8_0 39,2 GB; Q8_K_XL ~42 GB; Q6_K ~31 GB; Q5_K_M ~27 GB; Q4_K_M 22,3 GB; IQ4_XS ~21 GB; Q3_K_M ~17 GB; BF16 73,7 GB (dos partes).
- El coste de KV cache es de aproximadamente 90 KB por token en fp16; con `--cache-type-k q8_0 --cache-type-v q8_0` se reduce a la mitad.
- GPUs recomendadas: A100 80 GB o H100 para BF16 y Q8; RTX 4090 (24 GB) para Q3_K_M; GPUs de 32 GB (A100 40 GB, RTX 5090 si disponible) para Q4_K_M e IQ4_XS; 48 GB para Q6_K.
- Cabe en GPU de consumo con cuantizaciones Q3_K_M (24 GB) y, con margen ajustado, Q4_K_M en tarjetas de 32 GB.
- Opciones de despliegue: llama.cpp con el fork `maxwell-moe` (rama `maxwell-moe` o parche `maxwell-moe-port.patch` sobre master `91979450`). No hay soporte en llama.cpp upstream ni en vLLM, TGI u Ollama en la informacion disponible.
- Flash attention es obligatorio para la ruta sparse; sin el, el modelo cae a atencion densa en todas las longitudes.
- Rendimiento medido: en 2xV100 con Q8_0, la decodificacion especulativa MTP logro aceptacion de draft de 0,32 y 1,92 tokens aceptados por paso, sin ganancia neta de velocidad en ese hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Maxwell-V1-Flash | ~35B | ~3B | 256K | Apache-2.0 | GGUF via fork maxwell-moe |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada, por lo que no es posible establecer una comparativa con datos verificables de parametros, contexto o rendimiento frente a alternativas.

## Limitaciones y advertencias

- El uso de agentes multi-paso con herramientas no es fiable en este modelo; solo funcionan llamadas individuales y round-trips de resultados.
- Requiere un fork especifico de llama.cpp (`maxwell-moe`); no funciona en llama.cpp upstream ni en otras herramientas de inferencia sin portar la arquitectura.
- Sin flash attention activada, el modelo pierde la atencion block-sparse y cae a atencion densa, con el coste computacional asociado en contextos largos.
- La decodificacion especulativa MTP no mostro ganancia neta de velocidad en el hardware medido (2xV100), por lo que su utilidad practica es dependiente del entorno.
- El tokenizer fue validado solo sobre una muestra pequena para tailandes, lao, birmano, jemer y shan; el soporte multilingue real no esta confirmado.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- La importance matrix se genero con un corpus propio (codigo e ingles), no con el conjunto de calibracion del proveedor, lo que puede afectar la calidad de las cuantizaciones K-quant e i-quant.
- El repositorio ocupa 625,5 GB, lo que requiere espacio de almacenamiento considerable si se descargan varias cuantizaciones.
- Aunque la licencia es Apache-2.0 y permite uso comercial, la dependencia de un fork no mantenido oficialmente anade riesgo de mantenimiento en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bloomer010/maxwell-v1-flash-GGUF
- Modelo base: https://huggingface.co/maxwell-model/Maxwell-V1-Flash
- Fork de llama.cpp con soporte Maxwell: https://github.com/aetherbird/llama.cpp/tree/maxwell-moe
