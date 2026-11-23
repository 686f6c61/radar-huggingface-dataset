# jhuang/n3.5-lightning-HLM-MTP

## Resumen

`jhuang/n3.5-lightning-HLM-MTP` es un checkpoint de borrador (draft) para decodificacion especulativa sobre el modelo `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`. No es un modelo de lenguaje autonomo: contiene unicamente los pesos MTP (multi-token prediction) originales del modelo base de NVIDIA, junto con un router de cabeza LM jerarquica entrenado por el autor (jhuang), y no incluye el backbone objetivo ni puede servirse de forma independiente. Su proposito es acelerar la inferencia del modelo Nemotron-3.5 Lightning mediante especulacion MTP en vLLM.

La innovacion principal es la incorporacion de una cabeza LM jerarquica con configuracion C4096/K32: un router que agrupa el vocabulario en 4096 centroides y selecciona los 32 mas probables antes de proyectar sobre el vocabulario completo. Esto reduce el coste computacional de la pasada de borrador sin cambiar los pesos MTP originales, que se mantienen byte a byte identicos a los del modelo base en la revision `a9904d24bcc1d289a1950fa9d2b978c47cf903b9`.

El checkpoint tiene 1.346.467.072 parametros y ocupa 2,7 GB en safetensors. Es relevante porque demuestra una via practica para mejorar el throughput de decodificacion especulativa en despliegues de Nemotron con vLLM, con ganancias medidas de hasta un 10,26 % en tokens de salida por segundo a concurrencia 1 en hardware GB200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Checkpoint de borrador MTP (multi-token prediction) con cabeza LM jerarquica; derivado de Nemotron-3.5 Lightning (arquitectura `nemotron_h`) |
| Parametros totales | 1.346.467.072 |
| Parametros activos | no disponible (el modelo base es MoE 30B-A3B, pero este checkpoint solo contiene el borrador MTP) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (unico formato documentado); requiere pesos de vocabulario sin cuantizar compartidos con el objetivo |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (NVIDIA Open Model Development Workflow) |
| Formato de pesos | safetensors (dos shards: `model-00001.safetensors`, `model-00002.safetensors`) |

## Arquitectura y entrenamiento

El checkpoint es un artefacto de decodificacion especulativa, no un transformer completo. Combina dos componentes: (1) los 270 tensores MTP originales de NVIDIA, identicos byte a byte a los del modelo base en la revision indicada, y (2) dos tensores de router nuevos: `masked_embedding.centroids.weight` (4096 x 2688) y `masked_embedding.token_ordering` (131072 IDs de vocabulario en INT64). El router implementa una cabeza LM jerarquica con `use_ordered_embeddings=true`, `num_centroids=4096` y `centroid_intermediate_top_k=32`.

Solo se entreno el router, partiendo del checkpoint `step_010000.pt` del repositorio `jhuang/n3.5-lightning-HLM`. Los pesos MTP, los embeddings compartidos y la proyeccion de vocabulario permanecen sin cambios. La verificacion final la realiza siempre el modelo objetivo con su cabeza de vocabulario completa, de modo que el router actua como selector aproximado de vocabulario y no sustituye la verificacion. No se documentan en la informacion disponible el numero de tokens de entrenamiento del router, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Aceleracion de decodificacion especulativa MTP para `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` en vLLM.
- Seleccion jerarquica de vocabulario mediante router de 4096 centroides con top-K configurable (por defecto 32).
- Integracion como `speculative_config.model` junto al modelo objetivo BF16, que aporta embeddings compartidos y pesos de vocabulario.
- Soporte de `use_local_argmax_reduction` para la reduccion del argmax en el borrador.
- No soporta generacion de texto autonoma, tool calling, agentes, vision, audio ni capacidades multilingues propias: hereda las del modelo objetivo, pero no las implementa por si mismo.
- Top-K del router editable en `config.json` (`centroid_intermediate_top_k`) antes de servir.

## Casos de uso

- Aceleracion de inferencia en produccion de Nemotron-3.5 Lightning: se sirve como borrador especulativo junto al modelo BF16 objetivo en vLLM, reduciendo la latencia de decodificacion en cargas interactivas de baja concurrencia, donde la ganancia medida es mayor (+10,26 % OTPS a concurrencia 1).
- Despliegues de un solo nodo con TP=1: la configuracion soportada es tensor-parallel 1 con pesos de vocabulario sin cuantizar, adecuada para servidores con una sola GPU de gran memoria (por ejemplo, GB200) que sirvan Nemotron-3.5 Lightning.
- Investigacion en decodificacion especulativa: permite reproducir y extender los experimentos de cabeza LM jerarquica frente a cabeza densa BF16, con el codigo del PR de vLLM como referencia.
- Ajuste del equilibrio coste/aceptacion: modificando `centroid_intermediate_top_k` en `config.json` se puede explorar el compromiso entre coste del borrador y longitud media de aceptacion (AL), que en las mediciones baja ligeramente respecto a la cabeza densa.
- Evaluacion comparativa de tecnicas de draft: util como linea base reproducible en SpecDecBench (880 conversaciones, 1138 turnos de peticion) para comparar metodos de especulacion sobre el mismo objetivo.
- Servicio de chat y generacion de texto de alta concurrencia: a concurrencia 8-32 las ganancias son menores (+3,50 % a +1,19 %), por lo que resulta mas adecuado para cargas de baja concurrencia que para granjas de alto paralelismo.

## Benchmarks y rendimiento

Mediciones del autor en GB200, BF16, TP=1, siete tokens especulativos, split cualitativo completo de SpecDecBench (880 conversaciones, 1138 turnos de peticion), limite de salida 8192. OTPS = tokens de salida por segundo; AL = longitud media de aceptacion. Una ejecucion por configuracion.

| Concurrencia | OTPS cabeza densa BF16 | OTPS HLM | Ganancia OTPS | AL densa | AL HLM |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 649,32 | 715,96 | +10,26 % | 3,8997 | 3,8502 |
| 2 | 990,92 | 1055,05 | +6,47 % | 3,8925 | 3,8386 |
| 4 | 1522,72 | 1590,59 | +4,46 % | 3,8825 | 3,8475 |
| 8 | 2370,85 | 2453,76 | +3,50 % | 3,8841 | 3,8379 |
| 16 | 3944,81 | 3972,50 | +0,70 % | 3,8840 | 3,8327 |
| 32 | 6493,62 | 6570,85 | +1,19 % | 3,8822 | 3,8440 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 2,7 GB en BF16 para el checkpoint; debe sumarse la memoria del modelo objetivo Nemotron-3.5 Lightning 30B-A3B BF16, que domina el consumo total.
- GPU recomendadas: GB200 (hardware de las mediciones); no se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no disponible; la configuracion soportada exige pesos de vocabulario sin cuantizar compartidos con el objetivo y TP=1, lo que condiciona el despliegue a GPUs con memoria suficiente para el modelo objetivo completo en BF16.
- Despliegue: exclusivamente vLLM, con una version que incluya el PR #67300 (commit `118deab211c970ef0f7789ea669dc5374c4c091c`); en el momento de publicacion se requiere la rama del PR.
- Latencia y throughput: ver tabla de benchmarks; la ganancia de OTPS oscila entre +0,70 % y +10,26 % segun concurrencia, con una ligera reduccion de AL (de 3,8997 a 3,8502 a concurrencia 1).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jhuang/n3.5-lightning-HLM-MTP` | Borrador MTP con cabeza LM jerarquica | 1.346.467.072 | no disponible | OpenMDW-1.1 | Hugging Face, requiere PR de vLLM |
| Cabeza densa BF16 MTP (linea base del autor) | Borrador MTP denso | no disponible | no disponible | OpenMDW-1.1 (derivada de NVIDIA) | Integrada en el modelo base |
| `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` | Modelo objetivo MoE | 30B totales, 3B activos | no disponible | OpenMDW-1.1 | Hugging Face, oficial |

No se dispone de datos de otros borradores especulativos comparables (EAGLE, Medusa, etc.) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: no incluye el backbone objetivo y no puede servirse como modelo de lenguaje independiente.
- Requiere una version de vLLM con el PR #67300, aun no fusionado en el momento de publicacion; sin el, no funciona.
- Solo esta soportada la configuracion TP=1 con pesos de vocabulario sin cuantizar compartidos con el objetivo.
- La seleccion de vocabulario del router puede reducir la aceptacion del borrador; la verificacion final la hace siempre el objetivo con su cabeza completa.
- Las mediciones son de una sola ejecucion por configuracion; el autor advierte que las diferencias pequenas necesitan mediciones repetidas para establecer significancia.
- Los resultados son especificos de la carga de trabajo, el hardware (GB200) y el router entrenado; no son extrapolables sin validacion.
- Es un checkpoint de investigacion independiente, no una publicacion oficial de NVIDIA.
- Licencia OpenMDW-1.1: revisar sus terminos antes de uso comercial; se mantiene la licencia y el aviso de copyright originales de NVIDIA.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma propios; deben consultarse en la model card del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/jhuang/n3.5-lightning-HLM-MTP
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Repositorio del router: https://huggingface.co/jhuang/n3.5-lightning-HLM
- PR de vLLM #67300: https://github.com/vllm-project/vllm/pull/67300
- Licencia: https://huggingface.co/jhuang/n3.5-lightning-HLM-MTP/blob/main/LICENSE
