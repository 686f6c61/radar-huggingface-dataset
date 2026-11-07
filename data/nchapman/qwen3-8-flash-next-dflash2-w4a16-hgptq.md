# nchapman/Qwen3.8-Flash-Next-DFlash2-W4A16-HGPTQ

## Resumen

`nchapman/Qwen3.8-Flash-Next-DFlash2-W4A16-HGPTQ` es una cuantizacion de 4 bits del modelo borrador (*draft model*) `incoai/Qwen3.8-Flash-Next-DFlash2`, un drafter de difusion por bloques de 5 capas disenado para decodificacion especulativa sobre el modelo objetivo `Qwen/Qwen3.8-Flash-Next`. No es un modelo de chat autonomo: su funcion es proponer bloques de tokens que el modelo grande verifica en paralelo, acelerando la generacion sin alterar la distribucion final del modelo verificador.

El autor, `nchapman`, aplica GPTQ con rotacion de Hadamard y descomposicion de Cholesky (`HGPTQ`) en modo `W4A16` con grupo de 64, cuantizando 45 capas lineales (atencion, MLP y proyecciones de kernel de las convoluciones) y manteniendo en BF16 las proyecciones sensibles (`fc.weight`, libros de codigos del selector de candidatos, kernels base y todas las RMSNorm). El resultado comprime los pesos un 2,17x y reduce el ancho de banda de memoria por paso de borrador un 3,76x, conservando el 99,7 % de la longitud de aceptacion del verificador.

Es relevante porque la decodificacion especulativa esta limitada por el coste de memoria del drafter: al reducir los pesos transmitidos por paso de 843,8 MiB a 224,1 MiB, este drafter cuantizado hace viable el despliegue en GPUs con menos VRAM y mejora el throughput del pipeline completo. El modelo tiene 603.065.600 parametros totales y se distribuye en safetensors bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 5 capas con difusion por bloques (block diffusion) para borrador especulativo; atencion y MLP con convoluciones (`attention_conv`, `mlp_conv`) y fusion de estados ocultos del objetivo |
| Parametros totales | 603.065.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre bloques de borrador de 8 tokens) |
| Tipos de cuantizacion | W4A16, group size 64, GPTQ con Hadamard + Cholesky (`HGPTQ`), `hadamard_block_size=64`, `actorder="static"` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `compressed-tensors`) |

## Arquitectura y entrenamiento

El modelo base es un drafter de difusion por bloques de 5 capas que genera borradores de 8 tokens en paralelo, en lugar de token a token. Incorpora proyecciones convolucionales (`attention_conv`, `mlp_conv`) con kernels de 5 taps y una proyeccion `fc.weight` de forma `[2560, 12800]` que fusiona estados ocultos del modelo objetivo en las capas `[5, 15, 25, 35, 45]`, promediados sobre 4 flujos de hiper-conexion. El selector de candidatos incluye libros de codigos de predecesor y sucesor mas una proyeccion oculta, lo que permite puntuar candidatos y calcular `Recall@16`.

Esta variante concreta no reentrena el modelo: aplica cuantizacion post-entrenamiento GPTQ con rotacion de Hadamard y descomposicion de Cholesky sobre 45 matrices lineales (20 de atencion, 15 de MLP y 10 de proyeccion de kernel), dejando en BF16 las capas criticas para la precision del borrador. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF o DPO en el modelo base; la model card solo documenta el proceso de cuantizacion y la evaluacion comparativa frente al drafter en BF16.

## Capacidades

- Generacion de borradores especulativos: propone bloques de 8 tokens que el modelo objetivo `Qwen/Qwen3.8-Flash-Next` verifica, acelerando la decodificacion.
- Puntuacion de candidatos: el selector interno produce `Recall@16` del 59,60 %, permitiendo elegir los tokens mas probables del bloque.
- Prediccion posicional dentro del bloque: precision del 61,8 % en posicion 1, 45,6 % en posicion 2 y 36,5 % en posicion 3.
- Compatibilidad con el pipeline de decodificacion especulativa de DFlash 2, incluida la verificacion contra el modelo objetivo cuantizado `nchapman/Qwen3.8-Flash-Next-W4A16-HGPTQ`.
- No es un modelo de instrucciones: no soporta tool calling, function calling, agentes ni razonamiento multi-step por si mismo.
- Capacidades multilingues: no disponibles; heredadas, en su caso, del modelo objetivo, no documentadas en esta ficha.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Aceleracion de inferencia en produccion: desplegar este drafter junto a `Qwen/Qwen3.8-Flash-Next` para reducir la latencia por token generado, ya que cada paso de borrador transmite 224,1 MiB en lugar de 843,8 MiB.
- Servicio de chat de alto throughput: al aumentar la longitud de aceptacion media (τ = 2,752), el verificador acepta mas tokens por paso, lo que eleva los tokens por segundo en cargas concurrentes.
- Despliegue en GPUs con VRAM limitada: los 530,6 MiB de pesos cuantizados permiten alojar el drafter en la misma GPU que el modelo objetivo sin agotar memoria, algo inviable con el drafter en BF16 en configuraciones ajustadas.
- Pipelines de decodificacion especulativa con vLLM: la libreria `compressed-tensors` y el formato safetensors permiten cargar el modelo en servidores compatibles con vLLM, segun la documentacion enlazada del autor.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia para medir el impacto de W4A16-HGPTQ en tareas de borrador, comparando τ, `Recall@16` y acuerdo de tokens frente al BF16.
- Reduccion de coste en inferencia por lotes: en entornos con presupuesto de memoria estricto, sustituir el drafter BF16 por esta version libera 619,6 MiB de VRAM que pueden destinarse a cache KV o a un lote mayor.
- Investigacion en decodificacion especulativa: permite experimentar con variantes de cuantizacion del drafter manteniendo practicamente intacta la calidad del borrador (99,9 % de recall preservado).

## Benchmarks y rendimiento

Evaluacion sobre 2.048 bloques de borrador de 8 tokens (14.336 tokens generados) frente al drafter en BF16 y al verificador objetivo:

| Metrica | BF16 base (`incoai/Qwen3.8-Flash-Next-DFlash2`) | W4A16-HGPTQ | Notas |
|---|---:|---:|---|
| Tamano en safetensors | 1,12 GiB (1.150,3 MiB) | 0,52 GiB (530,6 MiB) | 2,17x menor (−619,6 MiB de VRAM) |
| Pesos transmitidos por paso de borrador | 843,8 MiB | 224,1 MiB | 3,76x menos ancho de banda |
| Longitud de aceptacion del verificador (τ) | 2,760 | 2,752 | 99,7 % preservado |
| `Recall@16` de candidatos | 59,67 % | 59,60 % | 99,9 % preservado |
| Precision posicion 1 / 2 / 3 | 61,7 % / 45,6 % / 36,5 % | 61,8 % / 45,6 % / 36,5 % | Igual o mejor |
| Acuerdo de tokens vs. BF16 (unario / selector top-1) | 100,0 % / 100,0 % | 92,23 % / 91,47 % | KL unario medio 0,0276 (mediana 0,0121) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo es un drafter y no un modelo de proposito general.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 530,6 MiB solo para los pesos del drafter; hay que sumar la cache KV y el modelo objetivo verificado.
- GPU recomendadas: el drafter cabe en cualquier GPU consumer con al menos 8 GB (RTX 3060, RTX 4060, RTX 4070, RTX 4090); para el pipeline completo con `Qwen/Qwen3.8-Flash-Next` se recomiendan A100, H100 o RTX 4090 segun el tamano del objetivo.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas, siempre que el modelo objetivo se sirva en otra GPU o en el mismo dispositivo con cuantizacion adecuada.
- Opciones de despliegue: vLLM (soporte documentado por el autor), libreria `compressed-tensors`; no se documenta soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles de forma absoluta; la reduccion de ancho de banda por paso de borrador es de 3,76x, lo que se traduce en menor tiempo de carga de pesos por paso en el pipeline especulativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| `nchapman/Qwen3.8-Flash-Next-DFlash2-W4A16-HGPTQ` | 603 M | no disponible | W4A16 HGPTQ | Apache-2.0 | Hugging Face |
| `incoai/Qwen3.8-Flash-Next-DFlash2` (BF16) | 603 M | no disponible | BF16 | Apache-2.0 | Hugging Face |
| `nchapman/Qwen3.8-Flash-Next-W4A16-HGPTQ` | no disponible | no disponible | W4A16 HGPTQ | Apache-2.0 | Hugging Face |

La comparativa se limita a las variantes del mismo drafter documentadas en la model card; no se dispone de datos de otros drafters especulativos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat ni de instrucciones: solo genera borradores para decodificacion especulativa; no debe usarse como modelo autonomo de generacion.
- El acuerdo de tokens con el BF16 cae al 92,23 % (unario) y 91,47 % (selector top-1), con KL medio de 0,0276; en dominios muy sensibles puede haber divergencias respecto al drafter original.
- La calidad final depende del verificador: un borrador rechazado no altera la salida del modelo objetivo, pero reduce la ganancia de velocidad.
- No hay informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion especificos del drafter; se heredan del modelo objetivo.
- Licencia Apache-2.0 permite uso comercial, pero la atribucion a Inco AI y a los trabajos DFlash 2 y DFlash es obligatoria segun la model card.
- El modelo declara `inference: false` en la model card, por lo que la integracion requiere herramientas compatibles con `compressed-tensors` (vLLM); no se garantiza su funcionamiento en otros motores.
- Los datos de evaluacion provienen de 2.048 bloques de un unico conjunto de evaluacion; no se documenta una validacion cruzada en dominios diversos.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-DFlash2-W4A16-HGPTQ
- Repositorio de archivos: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-DFlash2-W4A16-HGPTQ/tree/main
- Modelo base (drafter BF16): https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Modelo objetivo cuantizado: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-W4A16-HGPTQ
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Articulo DFlash (ICML 2026): https://inco.ai/blog/dflash2/ (referencia bibliografica citada en la model card)
