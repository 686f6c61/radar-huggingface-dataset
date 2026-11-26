# nchapman/Qwen3.8-27B-W2.6A16-HGPTQ-RCO

## Resumen

Qwen3.8-27B-W2.6A16-HGPTQ-RCO es una cuantizacion mixta de 2 y 4 bits del modelo multimodal Qwen/Qwen3.8-27B, desarrollada por el usuario nchapman. El objetivo es claro: llevar un modelo de clase 27B con vision integrada y decodificacion especulativa a una unica GPU de 16 GB, algo imposible con los pesos en BF16 (51,8 GiB). El resultado ocupa 12,20 GiB en disco, una reduccion de 4,2 veces respecto al original.

La cuantizacion combina precision de 4 bits para el 36,75% de los pesos mas sensibles del backbone, el encoder de vision y el drafter especulativo MTP, con cuantizacion simetrica de 2 bits para el resto. La cabeza de salida se mantiene en 8 bits. Todos los formatos empleados son de 2, 4 u 8 bits estrictos, sin desempaquetado de 3 bits, lo que permite ejecucion rapida en hardware consumer.

Es relevante para desarrolladores que quieran desplegar un modelo multimodal con capacidades de codigo, razonamiento e instrucciones en GPUs de gama consumer de 16 GB (RTX 4060 Ti 16 GB, 4070 Ti Super, 4080), manteniendo 128K de contexto en warp34 y una retencion de rendimiento del 82,87% frente al 86,90% del modelo completo en 16 bits. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con decodificacion especulativa MTP, derivada de Qwen3.8-27B |
| Parametros totales | 21.411.328.752 (pesos cuantizados en safetensors); modelo base de clase 27B |
| Parametros activos | no disponible |
| Longitud de contexto | 128K (soportado en warp34) |
| Tipos de cuantizacion | Mixta 2/4 bits (36,75% de pesos sensibles en 4 bits, resto en 2 bits simetricos), cabeza de salida en 8 bits; variantes W2A16 y W4A16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers, vLLM 0.34+ y warp34 |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del Qwen/Qwen3.8-27B, un transformer multimodal de Qwen disenado para codigo, razonamiento, seguimiento de instrucciones y vision. La cuantizacion preserva la arquitectura original, incluidos el encoder de vision y el drafter especulativo MTP (multi-token prediction), que se mantienen en 4 bits por su sensibilidad. El backbone se divide en dos regimenes: el 36,75% de pesos mas sensibles en 4 bits y el resto en 2 bits simetricos. La cabeza de salida se conserva en 8 bits.

El proceso de cuantizacion emplea la tecnica Hadamard GPTQ (HGPTQ) con formatos compressed-tensors, y esta optimizado para warp34, un runtime orientado a GPUs consumer de 16 GB. No se dispone de informacion sobre el dataset de calibracion, el numero de tokens de entrenamiento del modelo base ni si hubo fases de RLHF o DPO. La model card referencia un informe tecnico (TECHNICAL.md) y el repositorio warp34-quant-lab con los detalles de evaluacion.

## Capacidades

- Generacion de texto y razonamiento multi-paso.
- Generacion de codigo y resolucion de problemas de programacion (evaluado en HumanEval+).
- Razonamiento matematico (evaluado en MATH-500).
- Seguimiento de instrucciones (evaluado en IFEval).
- Vision: entrada image-text-to-text con encoder de vision preservado en 4 bits.
- Decodificacion especulativa integrada mediante drafter MTP.
- Contexto largo de hasta 128K tokens en warp34.
- Compatibilidad con vLLM 0.34+ y transformers.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en estacion de trabajo local: con HumanEval+ al 89,0% y soporte de contexto de 128K, puede indexar repositorios completos y responder sobre ellos en una RTX 4080.
- Analisis de documentos con imagenes: el encoder de vision en 4 bits permite extraer y razonar sobre diagramas, capturas de pantalla y tablas escaneadas en un flujo image-text-to-text.
- Razonamiento matematico asistido: MATH-500 al 81,4% lo hace util para tutoria o verificacion de calculos en entornos educativos.
- Automatizacion de tareas con instrucciones complejas: IFEval al 78,2% permite usarlo como motor de agentes que siguen especificaciones estrictas de formato y restricciones.
- Despliegue en hardware de consumo: cabe en 12,20 GiB, por lo que un unico equipo con RTX 4060 Ti 16 GB puede servir inferencia multimodal sin infraestructura de centro de datos.
- Prototipado rapido con vLLM: la compatibilidad con vLLM 0.34+ permite levantar un endpoint OpenAI-compatible para pruebas de integracion.
- Investigacion sobre cuantizacion extrema: util como referencia para estudiar la retencion de calidad de esquemas mixtos 2/4 bits en modelos multimodales.

## Benchmarks y rendimiento

| Benchmark | Modelo cuantizado (W2.6A16) | Modelo base en 16 bits |
|---|---|---|
| IFEval | 78,2% | no disponible |
| MATH-500 | 81,4% | no disponible |
| HumanEval+ | 89,0% | no disponible |
| Media de los tres | 82,87% | 86,90% |

No se han publicado resultados individuales del modelo base por benchmark en la informacion disponible; solo se conoce su media agregada del 86,90%.

## Requisitos de hardware

- VRAM estimada: 12,20 GiB de pesos en disco; con contexto de 128K, vision y decodificacion especulativa requiere una GPU de 16 GB.
- GPUs objetivo: RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080 (serie 30/40 de 16 GB).
- Cabe en GPU consumer: si, en modelos de 16 GB. Para GPUs de 24 GB el autor recomienda la variante W4A16 (16,14 GiB, mayor calidad).
- Opciones de despliegue: warp34 (`warp34 serve`), vLLM 0.34+ (`vllm serve --trust-remote-code`), transformers con `trust_remote_code`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano en disco | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-W2.6A16-HGPTQ-RCO | 21,4B (pesos cuantizados) | 128K | 2/4 bits mixta | 12,20 GiB | apache-2.0 |
| Qwen3.8-27B-W4A16-HGPTQ | clase 27B | no disponible | 4 bits | 16,14 GiB | apache-2.0 |
| Qwen/Qwen3.8-27B (BF16) | clase 27B | no disponible | 16 bits | 51,8 GiB | apache-2.0 |

No se dispone de datos de benchmarks comparativos con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 2 bits en el 63,25% del backbone implica una perdida de calidad media de aproximadamente 4 puntos porcentuales respecto al modelo en 16 bits (82,87% frente a 86,90%).
- Riesgo de alucinacion inherente al modelo base, potencialmente amplificado por la cuantizacion agresiva.
- No se dispone de informacion sobre sesgos conocidos ni sobre el conjunto de idiomas soportados.
- El rendimiento optimo esta ligado a warp34; en vLLM puede variar. Requiere `--trust-remote-code`, lo que implica ejecutar codigo del repositorio.
- La decodificacion especulativa y el encoder de vision se preservan en 4 bits, pero su calidad frente al original no esta cuantificada de forma independiente.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B antes de uso comercial.
- Para produccion con requisitos de maxima calidad se recomienda la variante W4A16 o el modelo en BF16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen3.8-27B-W2.6A16-HGPTQ-RCO
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante W4A16: https://huggingface.co/nchapman/Qwen3.8-27B-W4A16-HGPTQ
- Runtime warp34: https://github.com/nchapman/warp34
- Laboratorio de cuantizacion: https://github.com/nchapman/warp34-quant-lab
- Informe tecnico: TECHNICAL.md (referenciado en la model card, sin URL directa disponible)
