# oODragoOo/Qwen3.8-Flash-Next

# Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje causal multimodal (texto e imagen) publicado en HuggingFace por el usuario oODragoOo, con licencia etiquetada como `other` y nombre `qwen-community-1.0`. La model card lo presenta como una "preview experimental" de la arquitectura que sustentara Qwen4, y combina atencion híbrida (Gated DeltaNet + Qwen Sparse Attention), Mixture-of-Experts, Gated Residual y un esquema de embeddings de n-gramas. El repositorio ocupa 360 GB y el recuento real de parametros en los ficheros safetensors es de 179.999.981.459 (aproximadamente 180.000 millones), aunque la model card desglosa 125B en el modelo de lenguaje (6B activados), 51B en el modulo de embeddings de n-gramas y 4B en el modulo MTP.

El interes tecnico del modelo radica en su propuesta de eficiencia: solo 6B parametros se activan por token pese a tener 125B en el LM, la atencion dispersa QSA opera a nivel de micro-bloque en lugar de token a token, y los embeddings de n-gramas (20 millones de entradas) admiten offload a memoria del sistema, lo que facilita escalar parametros en aceleradores con VRAM limitada. Su ventana de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000, lo que lo situa en el segmento de modelos orientados a cargas agénticas y de contexto largo.

Es relevante ahora porque, segun la model card, anticipa decisiones arquitectonicas que se aplicaran en Qwen4 y porque se distribuye en formato Transformers compatible con vLLM, SGLang y TokenSpeed. Conviene senalar que el repositorio no lo publica el equipo de Qwen sino un tercero, con 0 descargas y 0 likes en el momento de la consulta, y que la fecha de creacion y actualizacion es la misma, por lo que la procedencia de los pesos no esta verificada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con vision encoder; atencion híbrida (Gated DeltaNet + Qwen Sparse Attention), Mixture-of-Experts, Gated Residual y N-gram Embedding |
| Parametros totales | 179.999.981.459 segun safetensors (~180B). Desglose de la model card: 125B en el LM + 51B en embeddings de n-gramas + 4B en MTP |
| Parametros activos | 6B en el LM (10 expertos enrutados + 1 compartido de 512 totales) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible (no se listan cuantizaciones publicadas; el repo solo contiene safetensors) |
| Idiomas soportados | No disponible |
| Licencia | `qwen-community-1.0` (etiquetada como `other` en HuggingFace; fichero LICENSE en el repositorio) |
| Formato de pesos | Safetensors (Transformers) |

Datos adicionales de configuracion: dimension oculta 2560; token embedding 248320 (padded); 48 capas; layout oculto 12 × (3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)); Gated DeltaNet con 48 cabezas de atencion lineal para V y 16 para QK, dimension de cabeza 128; Qwen Sparse Attention con 24 cabezas Q y 2 KV, dimension de cabeza 256, RoPE de 64 dimensiones, indexer MQA con 4 cabezas de consulta y 1 cabeza de clave compartida, dimension de cabeza del indexer 128 y presupuesto de 512 bloques o 2048 tokens; MoE con 512 expertos, 10 enrutados + 1 compartido activados y dimension intermedia de experto 640; Gated Residual con 4 ramas y rango de cuello de botella 320; salida del LM 248320 (padded); MTP de 1 capa entrenada con multiples pasos.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con vision encoder cuyo bloque se repite 12 veces con la siguiente estructura interna: tres sub-bloques de Gated DeltaNet seguidos de MoE y, despues, un sub-bloque de Qwen Sparse Attention seguido de MoE. La atencion híbrida sustituye el par Gated DeltaNet + Gated Attention por Gated DeltaNet + QSA. Segun la model card, QSA no selecciona tokens individuales sino micro-bloques, lo que reduce de forma significativa la latencia en contexto largo, un punto critico cuando predominan cargas agénticas. El sesgo inductivo de estado recurrente de DeltaNet se combina asi con una atencion dispersa de presupuesto fijo (512 bloques o 2048 tokens).

El modelo incorpora tres innovaciones adicionales descritas en la model card. Gated Residual modula el flujo de informacion en flujos residuales ensanchados mediante una puerta de lectura elemento a elemento dependiente de los datos y una puerta de escritura escalar por rama, con el objetivo de ganar expresividad sin perder estabilidad de entrenamiento ni encarecer la inferencia. N-gram Embedding escala parametros indexando bigramas y trigramas en la capa 2 con 20 millones de entradas, un eje de escalado mas barato en computo y mas facil de descargar a otro dispositivo que un MoE. Por ultimo, la receta de entrenamiento aplica Muon y AdamW a categorias de pesos especificas, elimina los warmups de tamano de batch arrancando directamente en el batch objetivo y admite learning rates mas altos, reduciendo el numero total de pasos del optimizador.

En cuanto a datos, la model card solo indica que hubo pre-entrenamiento y post-entrenamiento, sin detallar numero de tokens, composicion del dataset ni si se emplearon RLHF o DPO. El modulo MTP (multi-token prediction) de 1 capa, entrenado con multiples pasos, sugiere soporte para decodificacion especulativa o prediccion multiple, aunque no se documenta el mecanismo concreto en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento en un modelo causal de gran escala, con 6B parametros activos por token sobre un total de 125B en el LM.
- Procesamiento multimodal de imagen y texto: el pipeline declarado es `image-text-to-text` y la arquitectura incluye un vision encoder, por lo que admite entradas de imagen junto a texto.
- Manejo de contexto muy largo: 262.144 tokens nativos y hasta 1.000.000 mediante extension, con QSA disenada para reducir la latencia en ese regimen.
- Capacidades conversacionales (tag `conversational`) y soporte de dialogos multi-turno.
- Inferencia de decodificacion acelerada mediante el modulo MTP de 1 capa entrenado con multiples pasos.
- Despliegue compatible con Transformers, vLLM, SGLang y TokenSpeed, segun la model card.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, modo "thinking", audio o razonamiento agéntico multi-paso. La model card menciona cargas agénticas como motivacion de diseno, pero no enumera una API de herramientas.

## Casos de uso

- Analisis de repositorios y bases de codigo completas: con 262.144 tokens nativos (y hasta 1M mediante extension), el modelo puede ingerir arboles de proyecto enteros y responder preguntas sobre dependencias cruzadas sin fragmentar el contexto en trozos y perder relaciones entre ficheros.
- RAG de contexto masivo sobre corpus documentales: en lugar de recuperar fragmentos y reordenarlos, se pueden pasar documentos completos o libros tecnicos en una sola ventana, lo que reduce errores de recuperacion y permite citas sobre el texto original.
- Agentes de larga duracion: las cargas agénticas acumulan historiales de herramientas y observaciones muy extensos; la combinacion de QSA por micro-bloques y solo 6B parametros activos por token esta pensada para mantener la latencia bajo control en ese escenario.
- Atencion al cliente automatizada: el modelo puede sostener conversaciones multi-turno con memoria de interacciones previas en la misma ventana, manteniendo coherencia sobre politicas, pedidos y datos del cliente sin resumir el historial.
- Procesamiento de documentos escaneados y formularios: gracias al vision encoder y al pipeline image-text-to-text, puede extraer informacion estructurada de facturas, informes con graficos o capturas de pantalla, combinando la lectura visual con el razonamiento textual.
- Asistencia sobre interfaces y capturas de pantalla: util para agentes de automatizacion que reciben una captura de UI y deben describir el estado de la aplicacion o proponer el siguiente paso en lenguaje natural.
- Revision tecnica de documentacion extensa: informe de cumplimiento, normativa o contratos de cientos de paginas donde se necesita responder preguntas concretas y localizar contradicciones entre secciones alejadas del documento.
- Despliegue en cluster con servidores de inferencia de alto rendimiento: al ser compatible con vLLM y SGLang, encaja en backends que aplican batching continuo y paralelismo tensorial para servir muchas peticiones concurrentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion titulada "Benchmark Results" con estilos CSS asociados a una tabla, pero el contenido extraido no contiene ninguna fila con cifras, por lo que no se pueden reportar valores de MMLU, HumanEval, GSM8K ni de ninguna otra prueba.

## Requisitos de hardware

- Peso de los pesos en precision completa: el repositorio ocupa 360 GB, lo que es coherente con ~180.000 millones de parametros en BF16.
- VRAM estimada para inferencia (estimaciones propias a partir del recuento de parametros, no publicadas por el autor): aproximadamente 360 GB en BF16, unos 180 GB en FP8 y alrededor de 90 GB en cuantizacion de 4 bits. Hay que sumar la cache KV y los buffers de activaciones.
- Cache KV estimada: con 12 capas de Qwen Sparse Attention, 2 cabezas KV y dimension de cabeza 256, el estado por token ronda los 12 KB en BF16, es decir, del orden de 3 GB para 262.144 tokens (calculo propio, no confirmado por el autor). Los bloques de Gated DeltaNet mantienen un estado recurrente de tamano constante.
- GPUs recomendadas: no cabe en una sola GPU de 80 GB salvo en cuantizaciones muy agresivas; son necesarios despliegues multi-GPU, por ejemplo 8× A100 80 GB o 8× H100 80 GB en BF16 con paralelismo tensorial, o 4× H200 de 141 GB en FP8. Para FP8/INT4 en menos tarjetas, 2× H200 o 4× H100 de 80 GB son configuraciones plausibles, siempre con verificacion previa.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB) en configuracion completa ni con cuantizacion INT4 (aproximadamente 90 GB). Solo seria viable recurriendo a offload masivo a CPU/RAM, con latencias muy altas; conviene recordar que la model card indica que los embeddings de n-gramas (51B parametros) son especialmente aptos para offload, lo que alivia parcialmente el problema.
- Opciones de despliegue: Transformers de forma nativa; vLLM, SGLang y TokenSpeed segun la model card; el repo esta etiquetado como `endpoints_compatible`. El soporte en llama.cpp u Ollama no esta confirmado en la informacion disponible, y dado que la arquitectura es híbrida y experimental, es probable que requiera kernels especificos.
- Latencia y throughput: no disponibles. Al activar solo 6B parametros por token, el coste de computo por token decodificado deberia parecerse al de un modelo denso de ese orden, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos verificados de modelos comparables, y las busquedas web realizadas no han devuelto documentacion tecnica relevante (los resultados obtenidos tratan sobre bibliotecas de prompts de generacion de imagenes, modelos soportados en GitHub Copilot y guias de uso de ChatGPT). La tabla siguiente usa referencias externas de conocimiento general y debe tomarse como orientativa, no verificada en esta busqueda:

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-Flash-Next | ~180B (125B LM con 6B activos + 51B n-gram + 4B MTP) | 262.144 nativo, hasta 1.000.000 | qwen-community-1.0 | Repositorio de terceros en HuggingFace, 0 descargas |
| Qwen3-235B-A22B | 235B / 22B activos | 131.072 nativo, extensible con YaRN | Apache 2.0 | Pesos abiertos en HuggingFace |
| DeepSeek-V3 | 671B / 37B activos | 128.000 | Licencia propia de DeepSeek | Pesos abiertos en HuggingFace |
| Llama 4 Maverick | ~400B / 17B activos | hasta 1.000.000 | Llama 4 Community License | Pesos abiertos en HuggingFace |

Los valores de las filas comparativas corresponden a referencias externas que no forman parte de la informacion proporcionada en esta ficha; verifiquense en las fuentes oficiales antes de usarlos en una decision tecnica.

## Limitaciones y advertencias

- Procedencia no verificada: el repositorio lo publica el usuario oODragoOo, no una organizacion oficial de Qwen, con 0 descargas y 0 likes, y con fecha de creacion y actualizacion identicas (2026-09-18). La model card afirma que se trata de una release de Qwen, pero esa afirmacion no se puede confirmar con los datos disponibles. Conviene contrastar hashes y pesos con la fuente oficial antes de usarlo en produccion.
- Licencia ambigua: la etiqueta de HuggingFace es `other` y el nombre declarado es `qwen-community-1.0`. No se dispone del texto de la licencia en la informacion proporcionada, por lo que no se puede confirmar si el uso comercial esta permitido, que obligaciones de atribucion existen ni si hay restricciones por umbral de usuarios o de facturacion.
- Idiomas no documentados: no se especifica la cobertura linguistica ni la calidad por idioma, algo critico si se va a desplegar en castellano u otras lenguas distintas del ingles.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad, veracidad ni tasas de alucinacion. En tareas de contexto muy largo el riesgo aumenta porque el modelo puede atender a informacion distante con menos precision.
- Benchmarks ausentes: sin cifras de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, no es posible comparar objetivamente su rendimiento con alternativas del mismo segmento.
- Estado experimental: la propia model card lo describe como "experimental preview" de la arquitectura de Qwen4. Esto implica APIs, formatos y kernels potencialmente inestables, y menor cobertura en herramientas de terceros.
- Soporte de herramientas limitado en la documentacion: aunque la motivacion de diseno son las cargas agénticas, no se documenta tool calling ni function calling, ni un modo de razonamiento extendido. Verificar antes de construir agentes sobre el modelo.
- Requisitos de hardware elevados: 360 GB de pesos en BF16 y necesidad de despliegue multi-GPU descartan el uso en estaciones de trabajo con GPU de consumo. El coste de servir el modelo es el de un modelo de clase ~180B, no el de un 6B denso, pese a los 6B parametros activos.
- Diferencias frente a la version gestionada: la model card indica que Qwen3.8-Flash es la version oficial sobre Qwen3.8-Flash-Next con contexto de 1M por defecto y herramientas integradas, por lo que el comportamiento de los pesos abiertos puede diferir del servicio de API.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oODragoOo/Qwen3.8-Flash-Next
- Blog post citado en la model card: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe tecnico citado en la model card: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub citado en la model card: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Version gestionada en la nube citada en la model card: https://www.qwencloud.com/models/qwen3.8-flash
- Servicio de API citado en la model card: https://www.qwencloud.com
- Imagen de arquitectura citada en la model card: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.8-Flash-Next/architecture.png

Nota: los resultados de busqueda web realizados no han aportado enlaces adicionales relevantes sobre este modelo; los enlaces anteriores proceden de la propia model card.
