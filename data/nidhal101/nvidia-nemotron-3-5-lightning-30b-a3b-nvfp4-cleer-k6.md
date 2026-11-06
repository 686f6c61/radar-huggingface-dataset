# Nidhal101/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-CLEER-k6

## Resumen

Este repositorio no contiene un modelo de lenguaje utilizable, sino un proxy de benchmarking construido por Nidhal101 para la metodología CLEER-Text (Sustainable AI Group). Se parte de `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4` y se poda cada capa MoE para conservar unicamente 6 de sus 128 expertos enrutados, exactamente el numero que se activa por token. De este modo, cada token ejecuta todos los expertos retenidos y el coste aritmetico y de trafico de memoria por token coincide con el del modelo completo, permitiendo reproducir en un solo nodo la carga por acelerador de un despliegue con paralelismo de expertos (por ejemplo, alojando k/EP expertos por GPU).

El modelo base es un LLM de NVIDIA con arquitectura hibrida Mixture-of-Experts que intercala capas Mamba-2, capas MoE y capas de atencion selectivas, publicado en formato NVFP4 (4 bits) y con datos de post-entrenamiento con fecha de corte en mayo de 2026. El proxy conserva byte a byte la atencion, los embeddings, las normas, los expertos compartidos, las cabezas MTP y la cuantizacion original; solo se recortan las filas del router a los expertos retenidos y se reescribe la metadata de cuantizacion (828 entradas renumeradas, 16.836 eliminadas). El resultado son 3.690.230.492 parametros serializados en 3,35 GB de tensores.

Su relevancia es metodologica: permite medir energia y rendimiento por acelerador con la misma huella aritmetica que un modelo de 30B con 3B activos sin necesidad de un cluster multi-GPU. El texto generado esta degradado por diseno y el autor lo declara explicitamente como no apto para uso como modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE con capas Mamba-2 intercaladas, capas MoE y capas de atencion selectivas (tag `nemotron_h`) |
| Parametros totales | 3.690.230.492 (segun safetensors del repositorio proxy) |
| Parametros activos | 6 expertos enrutados por token en el proxy; el modelo base se denomina 30B-A3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits) heredada del modelo base; tag `8-bit` y `modelopt` en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (heredada del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura hibrida Mixture-of-Experts que intercala capas Mamba-2 con capas MoE y capas de atencion selectivas. Cada capa MoE del original dispone de 128 expertos enrutados y activa 6 por token, ademas de expertos compartidos y cabezas MTP (multi-token prediction). El checkpoint distribuido esta cuantizado en NVFP4 con metadata de cuantizacion por experto (escalas copiadas junto a cada experto retenido).

La intervencion del proxy es puramente estructural: se reduce `n_routed_experts` de 128 a 6 en `config.json`, se conservan los expertos con IDs de origen `[0, 1, 2, 3, 4, 5]` renumerados desde 0, se recortan las filas del router y los sesgos a 6 filas y se eliminan las entradas de metadata de cuantizacion que nombraban a expertos descartados. El resto de tensores es identico byte a byte al origen. La validacion estructural (`cleer_validation.json`) reporta resultado correcto: 24 modulos MoE con 6 expertos cada uno, routers y sesgos de 6 filas, y 96 tensores comparados byte a byte contra el modelo fuente. No se realizo ningun entrenamiento adicional ni ajuste fino; el texto degradado es consecuencia directa de la poda.

## Capacidades

- Generacion de texto degradada por diseno: el autor advierte que no es un modelo de lenguaje utilizable.
- Reproduccion de la carga aritmetica y de memoria por token del modelo base de 30B con 3B activos, con los mismos 6 expertos por token.
- Benchmarking energetico y de rendimiento por acelerador mediante la metodologia CLEER-Text.
- Simulacion de despliegues con paralelismo de expertos en un solo nodo (k/EP expertos por GPU).
- Carga y ejecucion verificadas en vLLM sobre 1 GPU H200 (prueba de humo, no de calidad).
- No soporta de forma fiable tool calling, razonamiento multi-paso, matematicas ni capacidades multilingues, al no ser un modelo funcional.

## Casos de uso

- Medicion de energia por token en inferencia: se ejecuta el proxy con la misma configuracion de batch y longitud de generacion que el modelo completo para obtener consumo por acelerador sin desplegar el modelo de 30B en un cluster.
- Calibracion de modelos de coste energetico: los datos de CLEER-Text recogidos con el proxy alimentan estimaciones de consumo para despliegues expert-parallel reales.
- Simulacion de topologias de paralelismo de expertos: al retener 6 expertos por capa se puede repartir k/EP expertos por GPU y medir el efecto del enrutamiento y del trafico de memoria en un unico nodo.
- Validacion de pipelines de cuantizacion NVFP4: el checkpoint conserva la cuantizacion original y la metadata reescrita, por lo que sirve para probar herramientas de carga y deserializacion de ModelOpt sin el coste del modelo completo.
- Pruebas de integracion con vLLM: el smoke test documentado (carga en 47 s, batch 32, 32 tokens nuevos, 1024 tokens generados en 1x H200) sirve como referencia de tiempo de arranque y throughput bruto del formato.
- Investigacion en eficiencia de arquitecturas hibridas Mamba-2/MoE: permite aislar el coste de las capas no-MoE (atencion, Mamba-2, embeddings) manteniendo el patron de activacion por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad en la informacion disponible. El unico dato de rendimiento es la prueba de humo del autor: carga en vLLM en 47 s sobre 1 GPU H200, batch 32, 32 tokens nuevos, 1024 tokens generados en total (`cleer_smoke.json`). Esta prueba solo verifica que el checkpoint carga y se ejecuta.

| Prueba | Configuracion | Resultado |
|---|---|---|
| Validacion estructural | 24 modulos MoE, routers y sesgos de 6 filas, 96 tensores comparados | correcta |
| Smoke test vLLM | 1x H200, batch 32, 32 tokens nuevos | carga 47 s, 1024 tokens generados |
| Bytes de tensores serializados | proxy | 3,35 GB |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 3,4 GB en safetensors NVFP4; en inferencia hay que sumar cache KV y buffers de activacion, no cuantificados en la informacion disponible.
- GPU recomendadas: el autor valido el checkpoint en 1x NVIDIA H200. No se documentan pruebas en otras GPU.
- GPU de consumo: no hay datos publicados sobre ejecucion en RTX 4090 u otras GPU consumer; el soporte de NVFP4 en hardware consumer no esta confirmado en la informacion disponible.
- Opciones de despliegue: vLLM (unica opcion verificada). No se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles mas alla del smoke test (1024 tokens generados con batch 32 en H200, sin tiempo total reportado).

## Comparativa con modelos similares

| Modelo | Parametros | Expertos por capa / por token | Contexto | Licencia | Proposito |
|---|---|---|---|---|---|
| Nidhal101/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-CLEER-k6 | 3,69 B serializados (proxy) | 6 / 6 | no disponible | openmdw-1.1 | Proxy de benchmarking energetico |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 | 30B totales, 3B activos | 128 / 6 | no disponible | openmdw-1.1 | LLM para agentes especializados |
| Alternativas de poda para benchmarking | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa solo es posible contra el modelo fuente, ya que no se dispone de otros proxies CLEER equivalentes en la informacion proporcionada. Frente al original, el proxy reduce los expertos enrutados de 128 a 6 manteniendo 6 activos por token, con lo que iguala el coste por token pero pierde toda la capacidad de enrutamiento selectivo y, con ella, la calidad del texto.

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable: el autor indica explicitamente que el texto generado esta degradado por diseno.
- La poda a 6 expertos elimina la selectividad del router; todas las rutas de tokens pasan por el mismo subconjunto, lo que invalida cualquier evaluacion de calidad, razonamiento o conocimiento.
- Sesgos conocidos: no disponibles; no se han realizado evaluaciones de sesgo sobre el proxy.
- Riesgo de alucinacion: maximo, al no conservar la capacidad generativa del modelo fuente.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia openmdw-1.1 heredada del modelo base; todo uso debe cumplir los terminos originales. El tag del repositorio indica `license: other` con nombre `openmdw-1.1`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento comunitario documentado.
- Uso en produccion desaconsejado salvo como componente de un banco de pruebas energetico; no debe integrarse en pipelines de atencion al cliente, generacion de codigo ni agentes.

## Enlaces

- Repositorio del proxy: https://huggingface.co/Nidhal101/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-CLEER-k6
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Model card del modelo base en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Ficheros de validacion citados en la model card: `cleer_prune_report.json`, `cleer_validation.json`, `cleer_smoke.json`, `README_ORIGINAL.md`, `LICENSE` (incluidos en el repositorio)
