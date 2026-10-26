# jaromer/SC117-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF

## Resumen

SC117-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF es una build en formato GGUF de un modelo de lenguaje mixto (image-text-to-text) derivado de Qwen3.8-Flash-Next, publicado originalmente por SC117 y replicado en este repositorio por el usuario jaromer. La particularidad tecnica es el metodo de "abliteracion por transplante de tensores": en lugar de recalcular la cuantizacion, se sustituyen 144 tensores de proyeccion que escriben en el residual stream, repartidos por las 48 capas del modelo, por los tensores equivalentes de una release abliterada ya existente. Segun la model card, los valores y escalas aprendidos por GSQ se mantienen intactos y la asignacion de tipo por tensor del modelo upstream (RCO) se restaura exactamente.

El modelo base es la cuantizacion oficial de ISTA-DASLab (GSQ, cuantizacion aprendida, mas RCO, asignacion de tipos con restriccion de presupuesto), sobre una arquitectura de mezcla de expertos de Qwen3.8-Flash-Next con 176.943.899.520 parametros totales y una ventana de contexto declarada de 262K tokens. El resultado es una version sin la direccion de rechazo, orientada a red-teaming y generacion de corpus ofensivos, que conserva el comportamiento cuantizado del original.

Su relevancia practica es doble: por un lado demuestra una via de abliteracion sobre modelos ya cuantizados sin reentrenar ni recuantizar; por otro, ofrece pesos ejecutables en llama.cpp en rangos de 38,0 GB (Q2_0) a 55,1 GB (IQ3_S), lo que permite desplegar un MoE de casi 177.000 millones de parametros en hardware de gama alta pero no de datacenter masivo. El repositorio tiene 217,9 GB y, en el momento de la consulta, 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 48 capas; derivado de Qwen3.8-Flash-Next, con cuantizacion aprendida GSQ y asignacion de tipos RCO |
| Parametros totales | 176.943.899.520 (176,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (262K, segun la model card) |
| Tipos de cuantizacion | Q2_0, IQ2_XS, IQ3_XXS, IQ3_S (con imatrix); pesos divididos en shards |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); verificacion blake2b por tensor en la build IQ3_S |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos de la familia Qwen3.8-Flash-Next, con 48 capas y 176,9 mil millones de parametros totales; el numero de parametros activos por token no se detalla en la informacion disponible. Sobre ese modelo, ISTA-DASLab aplica GSQ (una cuantizacion aprendida que optimiza valores y escalas por tensor) y RCO, un esquema de asignacion de tipos por tensor sujeto a una restriccion de presupuesto, que decide que capas reciben IQ3_S, IQ3_XXS, IQ2_XS o Q2_0 segun su impacto en la calidad.

La intervencion de este repositorio no toca ni el entrenamiento ni la cuantizacion: sustituye 144 tensores de proyeccion de escritura al residual stream en las 48 capas por los correspondientes de una release abliterada, manteniendo las escalas GSQ originales y restaurando el mapa de tipos del upstream. La model card afirma que la build IQ3_S se verifica tensor a tensor (todo lo que cambio debia cambiar y nada mas se movio), lo que es relevante porque la abliteracion sobre pesos ya cuantizados es propensa a degradar la calidad si se recomputan escalas. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre si el modelo original uso RLHF, DPO u otras tecnicas de alineamiento.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento y modo de pensamiento: el modelo esta etiquetado como "reasoning" en el repositorio, aunque no se documenta el formato exacto del modo thinking.
- Procesamiento de imagen y texto (pipeline image-text-to-text): acepta entradas visuales junto a texto, si bien la card no detalla el codificador visual ni la resolucion soportada.
- Contexto largo de hasta 262K tokens, adecuado para documentos extensos y conversaciones con historial amplio.
- Comportamiento sin rechazo (abliterated/uncensored): responde a peticiones que un modelo alineado declina, incluida generacion de contenido ofensivo con fines de red-teaming.
- Ejecucion local en llama.cpp sobre GGUF, con soporte de offload parcial a GPU.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.

## Casos de uso

- Generacion de corpus para red-teaming: el modelo produce respuestas que un modelo alineado rechazaria, lo que permite construir datasets de prompts y respuestas ofensivas para evaluar clasificadores y filtros de seguridad propios, o para medir la superficie de ataque de sistemas desplegados.
- Investigacion sobre alineamiento y abliteracion: al mantener intactas las escalas GSQ y cambiar solo 144 tensores, sirve como banco de pruebas controlado para medir cuanto del comportamiento de rechazo reside en esas proyecciones concretas.
- Evaluacion comparativa de cuantizaciones: con cuatro niveles (Q2_0 a IQ3_S) y una diferencia de solo 0,25-0,44 GB respecto al upstream por nivel, permite estudiar la degradacion de calidad a 2-3 bits en un MoE de 177B sin confundirla con cambios de alineamiento.
- Procesamiento de documentos largos en chino e ingles: la ventana de 262K tokens admite resumir o extraer informacion de contratos, informes tecnicos o expedientes completos en una sola pasada, en local, sin enviar datos a terceros.
- Analisis de imagenes con descripcion textual en entornos aislados: al ejecutarse con llama.cpp sobre hardware propio, encaja en flujos donde no se permite salida a la nube (documentacion medica anonimizada, imagenes industriales).
- Laboratorio de prompts y jailbreaks: entorno reproducible para probar la robustez de guardrails antes de desplegar un modelo alineado en produccion.
- Despliegue en estaciones de trabajo con memoria unificada: al caber en 38-55 GB, es viable en equipos Apple con 64 GB o en servidores con una GPU de 80 GB, sin cluster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni metricas de perplexity para ninguna de las cuantizaciones, ni comparaciones con el modelo base sin abliterar. Tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada segun tamano de fichero declarado: Q2_0 ocupa 38,0 GB de pesos; IQ3_S ocupa 55,1 GB. Los niveles IQ2_XS e IQ3_XXS no tienen tamano publicado en la informacion disponible.
- Sumar a esos pesos la cache KV: a 262K tokens de contexto el consumo adicional es significativo y crece con el numero de capas en GPU; para uso realista conviene reservar entre un 10 % y un 30 % adicional sobre el peso del fichero segun la longitud de contexto configurada.
- GPU de 80 GB (H100, A100 80GB): IQ3_S cabe con margen moderado de contexto; es la opcion recomendada para contexto largo.
- 2 x A100 40GB o 2 x RTX 6000 Ada 48GB: alternativa para IQ3_S repartiendo capas entre GPUs.
- GPU consumer: una RTX 4090 de 24 GB no aloja ninguno de los dos niveles completos; es viable con offload parcial de capas a CPU (--n-gpu-layers) asumiendo caida de throughput. Q2_0 con la mayor parte de capas en GPU y el resto en RAM es el escenario mas realista en 24 GB.
- Memoria unificada: equipos Apple Silicon con 64 GB pueden alojar Q2_0 e IQ2_XS; 128 GB permite IQ3_XXS e IQ3_S sin offload a disco.
- Despliegue: llama.cpp (llama-cli, llama-server), Ollama y LM Studio son las vias naturales al ser GGUF con tag llama-cpp. El repositorio incluye el tag endpoints_compatible, pero no se documenta soporte verificado en vLLM o TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| jaromer/SC117-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF (esta ficha) | 176,9B | 262K | Q2_0, IQ2_XS, IQ3_XXS, IQ3_S | Apache-2.0 | Replica del repositorio de SC117; 0 descargas y 0 likes en el momento de la consulta |
| SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF | 176,9B | 262K | Q2_0, IQ2_XS, IQ3_XXS, IQ3_S | Apache-2.0 | Original abliterado; abliteration.org le atribuye 2,7 millones de descargas y 442 likes; cada nivel pesa 0,25-0,44 GB mas que el upstream |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | 176,9B | 262K | Q2_0, IQ2_XS, IQ3_XXS, IQ3_S | Apache-2.0 | Modelo base sin abliterar; 0,25-0,44 GB menos por nivel y alineamiento intacto |

No se dispone en la informacion proporcionada de datos de rendimiento que permitan comparar con alternativas de otro fabricante o de tamano similar; cualquier comparacion de calidad quedaria sin respaldo numerico.

## Limitaciones y advertencias

- La abliteracion elimina la direccion de rechazo: el modelo respondera a peticiones daninas o ilicitas. No es apto para exposicion directa a usuarios finales sin capas de moderacion externas.
- La intervencion se aplica sobre pesos ya cuantizados en 2-3 bits; aunque la card afirma verificacion por tensor en IQ3_S, el resto de niveles no se declara verificado con el mismo rigor.
- Existe una cadena de derivacion (ISTA-DASLab, luego SC117, luego esta replica de jaromer) y el repositorio de destino registra 0 descargas; conviene verificar hashes blake2b y procedencia antes de usarlo en produccion.
- Idiomas oficiales limitados a ingles y chino; el rendimiento en castellano no esta documentado ni evaluado.
- Cuantizaciones Q2_0 e IQ2_XS implican perdida de calidad respecto al modelo en precision completa; no se publican metricas de esa degradacion.
- Sin benchmarks publicados, no hay forma de cuantificar el impacto de la abliteracion ni de la cuantizacion en tareas de razonamiento o codigo.
- Licencia Apache-2.0 en los metadatos, pero la responsabilidad legal y etica del uso de un modelo sin alineamiento recae en el desplegador; el uso comercial de contenido generado puede quedar sujeto a normativa adicional.
- La capacidad de vision se infiere del pipeline_tag image-text-to-text, pero no hay documentacion sobre resolucion, tipos de imagen admitidos ni limites practicos.
- Riesgo elevado de alucinacion en contexto de 262K: no se documentan tecnicas de atencion o recuperacion especificas para mantener la fidelidad en ventanas tan largas.

## Enlaces

- Repositorio en HuggingFace (esta replica): https://huggingface.co/jaromer/SC117-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Repositorio original de SC117: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Modelo base ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- README en chino: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF/blob/main/README.zh-CN.md
- Fichero IQ3_S (shard 1 de 2): https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF/blob/main/IQ3_S/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-IQ3_S-00001-of-00002.gguf
- Paper referenciado (GSQ): https://arxiv.org/abs/2604.18556
- Paper referenciado (RCO): https://arxiv.org/abs/2605.00649
- Ficha en abliteration.org: https://abliteration.org/models/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Ficha en abliteratedmodels.org: https://www.abliteratedmodels.org/qwen3.8-flash-next-gsq-rco-abliterated/
- Ficha en toolify.ai: https://www.toolify.ai/ai-model/sc117-qwen3-8-flash-next-gsq-rco-abliterated-gguf
