# JJ48-24/GLM-5.3-Flash-AWQ-W4A16-aggr-w8

## Resumen

GLM-5.3-Flash-AWQ-W4A16-aggr-w8 es una cuantizacion adicional del modelo GLM-5.3-Flash de Z.ai, en concreto una version derivada del checkpoint `wtdcode/GLM-5.3-Flash-AWQ-W4A16` que añade cuantizacion INT8 per-channel sobre el remanente BF16 que domina el trafico de pesos en decodificacion de flujo unico. El desarrollo es de JJ48-24, que actua como autor de la publicacion en HuggingFace, mientras que el modelo base original es de Z.ai con licencia MIT.

El problema que resuelve es la reduccion de bytes leidos por token durante la decodificacion en topologias pipeline-parallel, donde la etapa esta limitada por el ancho de banda de pesos. Segun las mediciones del autor, el checkpoint fuente lee ~22 GB de pesos por token, de los cuales solo ~4.7 GB son los expertos INT4; el resto es remanente BF16. Al cuantizar ese remanente a INT8 se elimina un numero constante de bytes y, por tanto, milisegundos en cada paso de decodificacion.

Arquitectonicamente, GLM-5.3-Flash es el primer modelo nativamente multimodal de la serie GLM-5, con 320B parametros totales y 18B activos, MoE con arquitectura hibrida que combina atencion dispersa y atencion lineal, usando Manifold-Constrained Hyper-Connections (mHC). Los parametros reales del checkpoint segun safetensors ascienden a 328.640.519.006.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (atencion dispersa y lineal) con Manifold-Constrained Hyper-Connections |
| Parametros totales | 328.640.519.006 (dato real de safetensors) |
| Parametros activos | 18B (dato del modelo base, segun Fireworks AI) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ W4A16 (INT4, grupo 128) en expertos + INT8 per-channel simetrico en remanente BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors, pack-quantized) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash introduce por primera vez en la serie GLM una arquitectura hibrida que combina atencion dispersa y lineal, reduciendo considerablemente los costes de servicio de contexto largo mientras preserva capacidades precisas de contexto largo. Incorpora Manifold-Constrained Hyper-Connections (mHC), una innovacion que mejora la eficiencia de escalado. La version cuantizada de Z.ai se basa en el checkpoint FP8 oficial, des-cuantizado a BF16 y posteriormente cuantizado con AWQ a INT4 (simetrico, grupo 128) en los expertos.

Este repositorio concreto realiza una segunda cuantizacion: weight-only INT8 per-channel, simetrico y round-to-nearest (`pack-quantized`, `group_1` en `quantization_config`) sobre el remanente BF16 que domina el trafico de pesos por token en decodificacion de un solo flujo. Concretamente, se cuantizan 407 tensores, todos los del perfil `kda_mla` mas `lm_head`. Los expertos enrutados, embeddings, normas, capas convolucionales y tensores MTP no se tocan. El archivo `requant_info.json` lista cada tensor cuantizado.

El proceso se realizo mediante una herramienta CPU de streaming (`requant_remainder.py`) basada en las propias funciones `calculate_qparams`, `quantize` y `pack_to_int32` de compressed-tensors, con el perfil `aggr` y `--bits 8`.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es capaz de generacion de texto, razonamiento y analisis de documentos largos gracias a su arquitectura hibrida que reduce costes en contexto largo.
- Capacidades multimodales: segun Fireworks AI, GLM-5.3-Flash es el primer modelo nativamente multimodal de la serie GLM-5. No obstante, la informacion disponible no detalla los tipos de entrada concretos (imagen, video, audio) en esta version cuantizada especifica.
- Generacion de codigo: los benchmarks internos de validacion incluyen archivos de codigo, lo que indica capacidad de generacion y analisis de codigo.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no explicitamente documentado, aunque la arquitectura MoE con 18B activos sugiere capacidad de razonamiento complejo.
- Capacidades multilingues: no disponible en la informacion proporcionada, aunque GLM suele soportar multiples idiomas.
- Velocidad de decodificacion: la cuantizacion INT8 del remanente BF16 incrementa la velocidad de decodificacion en topologias pipeline-parallel hasta un +23.7 % en modo P1 sin prediccion especulativa, y entre +12.9 % y +26.2 % con MTP3 segun la longitud de la ladder.

## Casos de uso

- Inferencia en produccion con topologia pipeline-parallel: el modelo esta optimizado para despliegues PP4 en hardware tipo CMP 170HX, donde reduce el tiempo por paso de decodificacion. En servidores con 4x A100-SXM4-80GB se observo un incremento del +23.7 % en tok/s medianos respecto al checkpoint fuente.
- Servicio de contextos largos: la arquitectura hibrida de atencion dispersa y lineal reduce el coste de servir ventanas de contexto extensas, por lo que es adecuado para analisis documental, resumido de informes y extraccion de informacion en documentos de gran tamano.
- Asistencia al cliente automatizada: con 18B parametros activos y arquitectura MoE, el modelo puede gestionar conversaciones multi-turno en entornos de atencion al cliente, especialmente en despliegues donde la latencia por token es critica gracias a la cuantizacion INT8.
- Generacion y revision de codigo: los datos de validacion incluyen archivos de codigo fuente de vLLM, lo que indica que el modelo es util para autocompletado de codigo, revision y refactorizacion en pipelines de CI/CD.
- Razonamiento multi-paso sobre documentos largos: gracias a Manifold-Constrained Hyper-Connections y la atencion hibrida, el modelo puede mantener coherencia y precision en tareas que requieren seguir multiples pasos de razonamiento sobre entradas extensas como expedientes legales, informes tecnicos o transcripciones de reuniones.
- Despliegue en entornos con restricciones de VRAM: la cuantizacion combinada (INT4 en expertos + INT8 en remanente) reduce el peso total del checkpoint a 182.9 GB, lo que permite distribuirlo en nodos con varias GPUs de 80GB sin necesidad de hardware de ultima generacion como H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para este checkpoint especifico. Sin embargo, la model card incluye datos de validacion internos de perplexidad y velocidad medidos en una sesion en 4x NVIDIA A100-SXM4-80GB:

| Metrica | Checkpoint fuente | Este checkpoint | Delta |
|---|---|---|---|
| Perplexidad media (unseen text, teacher-forced) | 4.075 | 4.069 | -0.16 % |
| MTP0 P1 mediana tok/s | 52.9 | 65.5 | +23.7 % |
| MTP0 P2 mediana tok/s | 52.1 | 64.1 | +23.1 % |
| MTP3 ladder 400 decode tok/s | 82.9 | 93.6 | +12.9 % |
| MTP3 ladder 4096 decode tok/s | 82.0 | 93.2 | +13.7 % |
| MTP3 ladder 16384 decode tok/s | 80.7 | 101.8 | +26.2 % |
| MTP3 ms por paso (normalizado por aceptacion) | 31.4 | 26.9 | -14.3 % |
| Prefill tok/s a 4096 | 2983.5 | 2968.4 | -0.5 % |

El umbral de calidad declarado por el autor es una variacion de perplexidad inferior al +1 %. La medida de velocidad estable es el tiempo por paso normalizado por aceptacion, ya que el tok/s en modos MTP3 depende de la longitud de draft aceptada en cada ejecucion.

## Requisitos de hardware

- VRAM estimada: el checkpoint tiene un tamano de repositorio de 182.9 GB. La cuantizacion total (INT4 en expertos + INT8 en remanente) requiere al menos 4x GPU con 80GB cada una para servir el modelo completo en topologia PP4. El autor indica que la particion utilizada fue PP4 14,12,12,7.
- GPU recomendadas: NVIDIA A100-SXM4-80GB (validado en 4x). El tag `sm80` indica compatibilidad con arquitectura Ampere o superior. El tag `cmp-170hx` apunta a hardware CMP 170HX.
- Capacidad en GPU de consumo: no disponible. Un modelo de ~328B parametros cuantizado no cabe en una sola GPU de consumo; en el mejor caso podria servir con varias RTX 4090 de 24GB en configuraciones pipeline-parallel, pero no hay datos de validacion al respecto.
- Opciones de despliegue: vLLM (imagen `ghcr.io/pixelml/club-170hx:vllm-glm53-sm80-pp-20260905` o equivalente). Es obligatorio aplicar dos parches de una linea en los modulos `vllm/models/glm5next/nvidia/kda.py` y `vllm/models/glm5next/nvidia/model.py`. Se requiere configurar `VLLM_PP_MAX_DECODE_REQS_PER_BATCH=2`.
- Latencia y throughput: segun la model card, en el host de validacion con particion PP4 14,12,12,7, el throughput medio es de 65.5 tok/s en modo P1 y 93.6 tok/s en MTP3 ladder 400, con un tiempo por paso normalizado de 26.9 ms. El prefill alcanza 2968.4 tok/s a 4096 tokens.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Cuantizacion | Contexto | Licencia | Mejora sobre fuente |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash (zai-org, base) | ~320B | 18B | FP8 / BF16 | no disponible | MIT | — |
| GLM-5.3-Flash-AWQ-W4A16 (wtdcode) | ~320B | 18B | INT4 AWQ | no disponible | MIT | — |
| GLM-5.3-Flash-AWQ-W4A16-aggr-w8 (JJ48-24) | 328.640.519.006 | 18B | INT4 AWQ + INT8 remanente | no disponible | MIT | +23.7 % decode PP |

La diferencia principal frente a la version AWQ-W4A16 original es que este checkpoint cuantiza tambien el remanente BF16 de los perfiles `kda_mla` y `lm_head` a INT8 per-channel, lo que solo aporta beneficios en topologias pipeline-parallel. En topologias tensor-parallel el remanente se particiona en fragmentos y el paso esta limitado por all-reduce, por lo que esta cuantizacion no ayuda.

## Limitaciones y advertencias

- La cuantizacion solo beneficia topologias pipeline-parallel. En topologias tensor-parallel, donde el remanente BF16 se particiona y el paso esta limitado por all-reduce, la cuantizacion no aporta ninguna mejora.
- El despliegue requiere dos parches manuales de una linea en codigo fuente de vLLM. Sin ellos, las proyecciones de atencion cuantizadas se cargan silenciosamente como BF16 y se pierde toda la ganancia de velocidad.
- La validacion de calidad es limitada: solo se usa perplexidad teacher-forced sobre ~22.168 tokens de texto no visto. No hay datos sobre alucinaciones, sesgos o comportamiento en tareas de razonamiento con pocos ejemplos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicacion reciente y sin adopcion real en produccion.
- El modelo es multimodal segun la documentacion del base model, pero no se ha validado el comportamiento de la version cuantizada en tareas de vision o audio.
- Los datos de velocidad se midieron en una unica sesion con hardware especifico (4x A100-SXM4-80GB) y pueden no generalizarse a otros entornos.
- El checkpoint de 182.9 GB requiere infraestructura de multiples GPUs de 80GB; no es viable en una sola GPU de consumo.

## Enlaces

- HuggingFace (repo principal): https://huggingface.co/JJ48-24/GLM-5.3-Flash-AWQ-W4A16-aggr-w8
- Modelo base cuantizado wtdcode: https://huggingface.co/wtdcode/GLM-5.3-Flash-AWQ-W4A16
- Modelo original zai-org: https://huggingface.co/zai-org/GLM-5.3-Flash
- Ficha de Fireworks AI con detalles de arquitectura y capacidad multimodal: https://fireworks.ai/models/fireworks/glm-5p3-flash
- Documentacion de vLLM Ascend para GLM-5.3-Flash: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/GLM5.3-Flash.html
- Revision de la variante INT4 de cyankiwi (contexto arquitectonico): https://huggingface.co/cyankiwi/GLM-5.3-Flash-AWQ-INT4
