# nchapman/Qwen3.6-35B-A3B-W2.6A16-HGPTQ-RCO

## Resumen

Qwen3.6-35B-A3B-W2.6A16-HGPTQ-RCO es una cuantizacion mixta de 2 y 4 bits del modelo multimodal Qwen/Qwen3.6-35B-A3B, un Mixture-of-Experts (MoE) de Qwen con 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token. La cuantizacion la firma nchapman y emplea GPTQ con rotaciones de Hadamard (HGPTQ) junto con el formato compressed-tensors, lo que permite ejecutar el modelo completo, incluida la torre de vision y la decodificacion especulativa integrada, en una unica GPU de 16 GB.

El objetivo es claro: reducir el peso en disco de 67,0 GiB en BF16 a 13,01 GiB (5,15 veces menos) manteniendo una calidad utilizable. Para ello aplica una estrategia de precision mixta: atencion, expertos compartidos, vision y MTP se mantienen en 4 bits, se promocionan a 4 bits las 12 capas de expertos enrutados mas sensibles y las 28 restantes se comprimen con cuantizacion simetrica de 2 bits.

Es relevante ahora porque acerca un MoE multimodal de 35B con 256 expertos al hardware de consumo (RTX 4060 Ti 16 GB, 4070 Ti Super, 4080) mediante el runtime warp34, y tambien es compatible con vLLM 0.34 o superior. El autor declara una puntuacion agregada del 86,10 % entre IFEval, MATH-500 y HumanEval+, ademas de un 98,0 % de concordancia en vision aislada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (qwen3_5_moe) multimodal con decodificacion especulativa integrada (MTP) |
| Parametros totales | 25.194.481.520 (segun safetensors); el nombre comercial indica 35B |
| Parametros activos | Aproximadamente 3B por token (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ mixta: 4 bits (atencion, expertos compartidos, vision, MTP y 12 capas de expertos enrutados) y 2 bits simetricos (28 capas de expertos enrutados); etiquetas w2a16 y w4a16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors; compatible con transformers, vLLM y warp34 |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal de Qwen con 256 expertos y arquitectura `qwen3_5_moe`, que combina una torre de vision con un decoder de lenguaje basado en mezcla de expertos y un modulo de prediccion multi-token (MTP) para decodificacion especulativa. Esta version no reentrena el modelo: es una cuantizacion post-entrenamiento GPTQ asistida por rotaciones de Hadamard (HGPTQ), aplicada con una politica de precision mixta por capas. Las capas de atencion, los expertos compartidos, la parte de vision y el MTP conservan 4 bits; de las 40 capas de expertos enrutados, las 12 mas sensibles se elevan a 4 bits y las 28 restantes se comprimen a 2 bits simetricos.

El paquete incluye rankings precalculados de expertos calientes (`static_hot_cache_rankings.json`) y layouts estrictos de 2, 4 y 8 bits orientados al runtime warp34, que aprovecha esa estructura para el servicio MoE en una sola GPU. No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo base, la composicion del dataset ni las etapas de RLHF o DPO aplicadas por Qwen.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento y matematicas: el autor reporta 85,6 % en MATH-500.
- Generacion de codigo: 88,4 % en HumanEval+ segun el autor.
- Cumplimiento de instrucciones: 84,3 % en IFEval segun el autor.
- Vision y entrada imagen-texto (pipeline image-text-to-text), con 98,0 % de concordancia en vision aislada declarada por el autor.
- Decodificacion especulativa integrada mediante MTP para acelerar la generacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente local en estacion de trabajo con GPU de 16 GB: el modelo cabe en una RTX 4060 Ti 16 GB o 4080 dejando unos 3 GiB para cache KV, entradas de vision y decodificacion especulativa, lo que permite un asistente privado sin depender de la nube.
- Analisis de documentos con imagenes: al combinar torre de vision y contexto conversacional, puede procesar capturas, diagramas o formularios y responder preguntas sobre ellos en local.
- Generacion y revision de codigo en el editor: con 88,4 % en HumanEval+ y un tamano que cabe en consumer GPU, es viable integrarlo en flujos de autocompletado y revision de parches.
- Prototipado de agentes con herramientas: el modelo base Qwen3.6 soporta tool calling segun su familia, y esta cuantizacion permite probar pipelines de agentes en hardware asequible antes de escalar a GPUs mayores.
- Razonamiento matematico asistido: el 85,6 % en MATH-500 lo hace util para tutoria o verificacion de calculos en entornos educativos con hardware limitado.
- Servicio de inferencia con vLLM en una sola GPU: al ser compatible con vLLM 0.34 o superior y compressed-tensors, se puede desplegar como endpoint interno para equipos pequenos.
- Evaluacion comparativa de cuantizaciones: util para investigadores que quieran medir la perdida de calidad de esquemas de 2 bits frente a la version W4A16 del mismo autor en 24 GB.

## Benchmarks y rendimiento

Datos declarados por el autor de la cuantizacion (no verificados de forma independiente):

| Benchmark | Resultado |
|---|---|
| IFEval | 84,3 % |
| MATH-500 | 85,6 % |
| HumanEval+ | 88,4 % |
| Media agregada | 86,10 % |
| Concordancia en vision aislada | 98,0 % |

No se han publicado en la informacion disponible resultados comparativos frente al modelo base en BF16 ni frente a otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada: 13,01 GiB de pesos en disco; el autor indica que encaja en una GPU de 16 GB dejando unos 3 GiB libres para cache KV, vision y decodificacion especulativa.
- GPU objetivo de warp34: RTX 30/40-series de 16 GB, como RTX 4060 Ti 16 GB, RTX 4070 Ti Super o RTX 4080.
- Alternativa de mayor precision: la version W4A16-HGPTQ del mismo autor ocupa 18,78 GiB y esta pensada para GPUs de 24 GB.
- Cabe en consumer GPU: si, en modelos de 16 GB o mas con el runtime warp34; en 24 GB con la variante de 4 bits.
- Opciones de despliegue: warp34 (`warp34 serve`), vLLM 0.34 o superior con `--trust-remote-code`, y transformers con `custom_code`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-W2.6A16-HGPTQ-RCO | 35B totales, ~3B activos | no disponible | 2/4 bits mixta | Apache 2.0 | 16 GB |
| Qwen3.6-35B-A3B-W4A16-HGPTQ (mismo autor) | 35B totales, ~3B activos | no disponible | 4 bits | Apache 2.0 | 24 GB |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales, ~3B activos | no disponible | BF16 (67,0 GiB) | Apache 2.0 | Multi-GPU o GPU de 80 GB |

No se dispone de datos de rendimiento del modelo base en BF16 ni de otras alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion de 2 bits en 28 capas de expertos introduce perdida de calidad respecto al modelo base; los benchmarks del autor son autodeclarados y no verificados.
- Los resultados de IFEval, MATH-500 y HumanEval+ son puntuaciones agregadas del autor; no hay comparacion publicada frente a BF16.
- La decodificacion especulativa y los rankings de expertos calientes estan optimizados para warp34; en otros runtimes el rendimiento puede diferir.
- Requiere `--trust-remote-code` en vLLM y el codebase `custom_code` en transformers, lo que implica ejecutar codigo del repositorio.
- Idiomas soportados no documentados; el comportamiento multilingue hereda del modelo base pero no esta verificado en esta cuantizacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de sesgo ni de seguridad para esta version.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen/Qwen3.6-35B-A3B antes de desplegarlo en produccion.
- El repositorio tiene pocas descargas (195) y cero likes en el momento de la consulta, por lo que la validacion comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen3.6-35B-A3B-W2.6A16-HGPTQ-RCO
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Variante de 4 bits para 24 GB: https://huggingface.co/nchapman/Qwen3.6-35B-A3B-W4A16-HGPTQ
- Runtime warp34: https://github.com/nchapman/warp34
- Laboratorio de cuantizacion warp34-quant-lab: https://github.com/nchapman/warp34-quant-lab
- Informe tecnico: TECHNICAL.md dentro del repositorio del modelo
