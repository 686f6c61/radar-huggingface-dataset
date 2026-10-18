# LibertAIDAI/DeepSeek-V4.1-Flash-1017-NVFP4

## Resumen

DeepSeek-V4.1-Flash-1017-NVFP4 es un checkpoint cuantizado en NVFP4 del modelo multimodal `deepseek-ai/DeepSeek-V4.1-Flash-1017`, publicado por el usuario LibertAIDAI. Se distribuye con el mismo esquema de `config.json`, los mismos nombres de tensor y las mismas formas que el checkpoint `nvidia/DeepSeek-V4.1-Flash-NVFP4`, de forma que puede desplegarse con las mismas herramientas (vLLM) sobre hardware Blackwell sin cambios de configuración.

El modelo es un transformer disperso (MoE) con torre de visión: el repo contiene 664.898.390.994 parámetros totales repartidos en 188.245 tensores y 48 shards, con un peso en disco de 399,51 GiB (428.966.398.040 bytes de tensores) frente a los 475,24 GiB del checkpoint upstream. La reducción de tamano no viene de recuantizar los pesos, sino de un transcodificado sin perdida de los expertos enrutados (MXFP4 a NVFP4) y de la conversion a MXFP4 de las tablas Engram de las capas 1 y 14, que es la unica parte con perdida (coseno 0,9934 frente al FP8 original).

Su relevancia practica es doble: permite ejecutar un modelo de la clase 600B+ con tensor cores FP4 de NVIDIA y, al mantener el layout exacto del checkpoint de NVIDIA, evita procesos de recalibrado propios. La licencia declarada es MIT y el pipeline es image-text-to-text, por lo que cubre tanto generacion de texto como entrada de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (`deepseek_v41`), con expertos enrutados, expertos compartidos y torre de vision + aligner |
| Parametros totales | 664.898.390.994 (~664,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (E2M1 + escala E4M3 + escala global FP32 + `input_scale` FP32) en expertos enrutados; MXFP4 (E2M1 + E8M0) en tablas Engram y expertos MTP/DSpark; FP8 E4M3 en atencion y expertos compartidos; BF16 en embeddings, cabeza de salida, router, torre de vision y aligner; F32/BF16 en normas y parametros mHC |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards, 188.245 tensores) |
| Libreria de despliegue | vLLM |
| Hardware objetivo | Tensor cores FP4 de NVIDIA Blackwell |
| Tamano del repo | 750,0 GB (399,51 GiB de tensores) |
| Modelo base | `deepseek-ai/DeepSeek-V4.1-Flash-1017` (revision `1bae0e1088`) |
| Descargas / likes | 247 / 15 |

## Arquitectura y entrenamiento

La model card no documenta el preentrenamiento ni el proceso de alineacion (RLHF/DPO) del modelo base; solo describe el proceso de cuantizacion. Sabemos por la estructura del checkpoint que se trata de un MoE con 40 capas y 384 expertos enrutados por capa, cada uno con las proyecciones w1, w2 y w3, mas expertos compartidos. Incorpora ademas modulos MTP/DSpark (3 capas x 128 x 3 expertos), tablas Engram en las capas 1 y 14, parametros mHC y una torre de vision con aligner en BF16. El numero de parametros activos por token no se indica en la informacion disponible.

La innovacion tecnica del repo es el metodo de conversion. Los expertos enrutados se publican upstream en MXFP4 (bloques de 32 elementos, escala E8M0); como los bloques de 16 elementos de NVFP4 son un refinamiento estricto y toda escala E8M0 potencia de dos es representable de forma exacta como E4M3 multiplicado por una escala global potencia de dos, el transcodificado reproduce los codigos de 4 bits sin error. El resultado son 284,77 GiB de expertos (frente a 268,95 GiB) con pesos bit-exactos. Las escalas de activacion W4A4 (46.080 proyecciones, rango 4,36e-5 a 5,58e-2, mediana 1,31e-3) proceden de la calibracion con ModelOpt de NVIDIA sobre V4.1-Flash; 12 entradas se sustituyeron por fallback al no recibir tokens de calibracion. Las tablas Engram, en cambio, pasan de FP8 E4M3 a MXFP4 con perdida (coseno 0,9934), lo que explica el recorte de 188,83 a 97,28 GiB. Todo lo demas (atencion, expertos compartidos, embeddings, cabeza de salida, router, vision tower, MTP/DSpark) es byte-identico al upstream.

## Capacidades

- Generacion de texto y razonamiento en un modelo de escala 600B+ con activacion dispersa.
- Entrada multimodal de imagen y texto: pipeline `image-text-to-text`, con torre de vision y aligner preservados en BF16.
- Capacidad de codigo y matematicas: no se han publicado evaluaciones especificas en la informacion disponible.
- Tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas (campo de idiomas no disponible).
- Modulos MTP/DSpark conservados, asociados a decodificacion especulativa en la familia DeepSeek; el repo no detalla su comportamiento.
- Tablas Engram en capas 1 y 14, preservadas a 4 bits con coseno 0,9934 frente al FP8 original.

## Casos de uso

- Despliegue de un modelo frontera autoalojado en clúster Blackwell: el checkpoint encaja en vLLM con el mismo `config.json` y `hf_quant_config.json` que el de NVIDIA, lo que permite sustituir pesos sin tocar el pipeline de servicio.
- Inferencia multimodal en produccion: al conservar la torre de vision en BF16 y el pipeline image-text-to-text, sirve para tareas de descripcion de imagenes, extraccion de informacion de documentos escaneados o respuesta sobre capturas.
- Evaluacion comparativa de recetas de cuantizacion: util como referencia bit-exacta de los expertos enrutados frente a recetas calibradas (Four Over Six, barridos MSE) para medir si una receta alternativa introduce degradacion.
- Investigacion sobre cuantizacion W4A4: el repo expone `weight_scale`, `weight_scale_2` e `input_scale` por proyeccion, lo que facilita estudios de sensibilidad de escalas de activacion por capa y experto.
- Servicio de generacion de codigo asistida: un modelo de este tamano y contexto (no disponible) encaja en asistentes IDE autoalojados donde no se permite enviar codigo a APIs externas, siempre que el clúster disponible lo soporte.
- Sustitucion de despliegues que se quedaban sin VRAM: pasar de 475,24 a 399,51 GiB libera aproximadamente 75 GiB, suficiente para alojar el modelo en una configuracion de GPU mas ajustada o para ampliar el espacio de cache KV.
- Reproduccion de resultados de NVIDIA sin depender de su checkpoint: al compartir layout y escalas de activacion, sirve como espejo auditable del modelo de referencia.
- Experimentacion en nodos DGX Spark: existe una receta publica que ejecuta V4.1-Flash-1017 sobre cuatro DGX Spark (GB10) con TP4, lo que permite probar el modelo en hardware de escritorio de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta metricas de fidelidad de la cuantizacion: pesos de expertos enrutados bit-exactos, tablas Engram con coseno 0,9934 frente al FP8, y 46.080/46.080 escalas de activacion cubiertas (46.068 sin cambios, 12 sustituidas).

## Requisitos de hardware

- VRAM estimada: 399,51 GiB solo para pesos. A ello hay que sumar cache KV, buffers de activacion y overhead de vLLM; el repo ocupa 750,0 GB en disco.
- Tensor cores FP4: el formato NVFP4 W4A4 requiere NVIDIA Blackwell. En arquitecturas anteriores (A100, H100, H200) no hay soporte nativo de FP4 y el checkpoint no es directamente utilizable con su ruta rapida.
- Configuracion minima realista: 4 x B200 (192 GB cada una, 768 GB agregados) deja margen para cache KV; 8 x B200 ofrece holgura para contextos largos y mayor concurrencia. Alternativas Blackwell como GB200 NVL siguen la misma logica.
- Consumo en consumer GPU: no cabe en ninguna GPU de consumo individual. En RTX 5090 (32 GB, con soporte FP4) harian falta mas de una docena de tarjetas, lo que descarta el despliegue consumer.
- Nodos compactos: la receta publica sobre 4 x DGX Spark (GB10, memoria unificada) demuestra viabilidad en硬件 de sobremesa, a costa de throughput muy inferior.
- Opciones de despliegue: vLLM es la libreria declarada; llama.cpp/Ollama no estan soportados para este formato. El esquema es intercambiable con `nvidia/DeepSeek-V4.1-Flash-NVFP4`.
- Latencia y throughput: no disponible; depende del numero de GPUs, del TP y del soporte de decodificacion especulativa via MTP/DSpark.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Tamano de pesos | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LibertAIDAI/DeepSeek-V4.1-Flash-1017-NVFP4 | 664,9 mil M | no disponible | 399,51 GiB | NVFP4 / MXFP4 / FP8 / BF16 | MIT | publico en HuggingFace |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | 475,24 GiB | MXFP4 / FP8 / BF16 | no disponible | publico en HuggingFace |
| nvidia/DeepSeek-V4.1-Flash-NVFP4 | no disponible | no disponible | no disponible (referencia de layout) | NVFP4 / MXFP4 / FP8 / BF16 | no disponible | publico en HuggingFace |

Frente al base, este checkpoint reduce el peso en 75,73 GiB manteniendo los codigos de 4 bits de los expertos y sustituyendo unicamente las tablas Engram por una version con perdida. Frente al checkpoint de NVIDIA, comparte layout, `config.json` y escalas de activacion, con la diferencia de que los pesos de los expertos provienen de la revision 1017 de DeepSeek y 12 entradas de escala usan fallback.

## Limitaciones y advertencias

- Solo es utilizable de forma eficiente en NVIDIA Blackwell; en Hopper o Ampere pierde la ventaja de los tensor cores FP4.
- Las tablas Engram de las capas 1 y 14 son la unica parte con perdida (coseno 0,9934 frente al FP8), lo que puede afectar tareas que dependan de esos modulos.
- Doce proyecciones de expertos (18 entradas) no tienen escala de activacion calibrada y usan valores de fallback; el impacto no esta cuantificado en la model card.
- Las escalas de activacion provienen de la calibracion de NVIDIA sobre V4.1-Flash, no sobre la revision 1017; los pesos si son de 1017.
- Licencia MIT declarada en el repo, pero la licencia del modelo base no se especifica en la informacion disponible: conviene verificar los terminos de `deepseek-ai/DeepSeek-V4.1-Flash-1017` antes de un uso comercial.
- No hay datos publicados de benchmarks, por lo que no puede afirmarse ninguna equivalencia de calidad frente al modelo sin cuantizar.
- Sesgos y riesgo de alucinacion: no documentados en la informacion disponible; son heredados del modelo base.
- Idiomas soportados y longitud de contexto: no disponibles, lo que impide planificar despliegues multilingues o de contexto largo con garantias.
- El repo pesa 750,0 GB en disco; el almacenamiento y la transferencia son un coste operativo relevante.
- Modelo con 247 descargas y 15 likes en el momento de la consulta: ecosistema de validacion todavia reducido.

## Enlaces

- HuggingFace (este checkpoint): https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-NVFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Checkpoint NVFP4 de referencia de NVIDIA: https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-NVFP4
- Paper citado en las etiquetas (Four Over Six): https://arxiv.org/abs/2512.02010
- Receta de despliegue en 4 x DGX Spark: https://github.com/tonyd2wild/DeepSeek-V4.1-Flash-vLLM-DGX-Spark
