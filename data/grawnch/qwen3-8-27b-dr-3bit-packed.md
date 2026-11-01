# Grawnch/Qwen3.8-27B-DR-3bit-Packed

## Resumen

Qwen3.8-27B-DR-3bit-Packed es un checkpoint cuantizado a 3 bits del modelo Qwen/Qwen3.8-27B, publicado por el usuario Grawnch en HuggingFace. Se trata de una cuantizacion post-entrenamiento que emplea una tecnica denominada DR (probablemente alguna variante de cuantizacion con reconstruccion de error, aunque el autor no la describe en detalle) para comprimir los pesos del modelo original de 55,5 GB en bfloat16 a un unico fichero safetensors de 10,7 GB con pesos empaquetados a nivel de bit (3,17 bits por peso) y escalas de grupo en FP16.

El modelo base Qwen3.8-27B pertenece a la familia Qwen3.5 segun las etiquetas del repositorio, con 27 mil millones de parametros, aunque la model card no detalla arquitectura, contexto ni composicion del entrenamiento. La relevancia de esta publicacion radica en que permite ejecutar un modelo de 27B en GPUs de consumo con VRAM limitada mediante la libreria dr_loader, que mantiene los pesos comprimidos en memoria de GPU y los descomprime al vuelo durante la inferencia (DRLinear).

La publicacion incluye dos artefactos: el checkpoint empaquetado (objeto de esta ficha) y un checkpoint pre-desempaquetado en bfloat16 para evaluacion con Transformers. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una publicacion muy reciente y sin validacion independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la del modelo base Qwen/Qwen3.8-27B; detalles no disponibles) |
| Parametros totales | 27B (segun el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits empaquetados a nivel de bit (3,17 bpw), escalas de grupo en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos enteros empaquetados `qweight` + escalas `scales` en un unico fichero `model_packed.safetensors`) |

## Arquitectura y entrenamiento

El checkpoint no introduce una arquitectura nueva: es una cuantizacion del modelo Qwen/Qwen3.8-27B, cuya arquitectura interna (numero de capas, dimensiones, tipo de atencion, contexto nativo) no se documenta en la model card. La cuantizacion DR almacena los pesos como enteros empaquetados a nivel de bit (`qweight`) acompanados de escalas de grupo en FP16 (`scales`), alcanzando una anchura efectiva de 3,17 bits por peso. La inferencia se realiza mediante `DRLinear`, una capa que descomprime los pesos al vuelo, con dos modos: `low_vram=True` mantiene los pesos comprimidos en VRAM (10,7 GB) y `low_vram=False` los expande a capas `nn.Linear` estandar.

No se dispone de informacion sobre el proceso de cuantizacion (calibracion, dataset de calibracion, numero de muestras), ni sobre el entrenamiento original del modelo base (tokens, composicion del dataset, RLHF/DPO). La unica innovacion tecnica documentada es el esquema de empaquetado y la capa `DRLinear` para inferencia de baja VRAM.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B, aunque no se detallan en la model card.
- Generacion de codigo: validada mediante EvalPlus HumanEval+ (88,41%) y MBPP+ (81,22%) en la version cuantizada.
- Matematicas: no se documentan resultados especificos.
- Vision: no disponible (no se menciona soporte multimodal).
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Modo thinking: no documentado.
- Inferencia de baja VRAM: capacidad destacada del checkpoint, con pesos comprimidos en GPU (10,7 GB) y descompresion al vuelo.

## Casos de uso

- Evaluacion de tecnicas de cuantizacion extrema: el checkpoint sirve como referencia para comparar el esquema DR a 3,17 bpw frente a GPTQ u otros metodos, usando las metricas de PPL, KLD y acuerdo de tokens publicadas por el autor.
- Despliegue en GPUs de consumo con VRAM limitada: con 10,7 GB de pesos comprimidos, el modelo puede cargarse en GPUs de 16-24 GB (por ejemplo, RTX 4080/4090) usando `low_vram=True`, dejando margen para el KV cache y el contexto.
- Generacion de codigo en entornos con recursos restringidos: los resultados de HumanEval+ (88,41%) y MBPP+ (81,22%) indican que la cuantizacion preserva buena parte de la capacidad de programacion del modelo base, lo que permite usarlo en asistentes de codigo locales.
- Investigacion sobre inferencia de baja memoria: la capa `DRLinear` y el modo `low_vram` son utiles para estudiar el equilibrio entre compresion, latencia y calidad en produccion.
- Benchmarking comparativo de checkpoints cuantizados: el checkpoint pre-desempaquetado (`Grawnch/Qwen3.8-27B-DR-3bit`) permite evaluaciones de una linea con `AutoModelForCausalLM.from_pretrained`, util para pipelines de evaluacion automatizada.
- Prototipado de aplicaciones de texto en estaciones de trabajo con una sola GPU: al reducir el requisito de VRAM frente a los 55,5 GB del baseline en bfloat16, facilita experimentar con un modelo de 27B sin infraestructura de datacenter.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, comparando el baseline de 16 bits con la version DR de 3 bits:

| Metrica | Baseline 16 bits | DR (3 bits) |
|---|---|---|
| Anchura efectiva / tamano empaquetado | 16,0 bpw (55,5 GB) | 3,17 bpw (10,7 GB) |
| Reduccion de MSE por capa frente a GPTQ estandar | — | 2,05x (-51,1%) |
| Neuronas de salida ganadas frente a GPTQ estandar | — | 96,62% (3.767.599 / 3.899.392) |
| Perplejidad in-domain (PPL) | 2,518 | 2,647 |
| KLD forward sobre vocabulario completo | 0,00000 | 0,07684 |
| Acuerdo Top-1 de tokens | 100,00% | 89,49% |
| Acuerdo Top-5 de tokens | 100,00% | 100,00% |
| Similitud coseno de logits | 1,00000 | 0,98191 |
| EvalPlus HumanEval+ (164 problemas, 80x tests) | 90,85% (149/164) | 88,41% (145/164) |
| EvalPlus MBPP+ (378 problemas, 35x tests) | 84,66% (320/378) | 81,22% (307/378) |

No se han publicado resultados de benchmarks adicionales (MMLU, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 10,7 GB para los pesos comprimidos en modo `low_vram=True`; en modo `low_vram=False` los pesos se expanden a `nn.Linear`, requiriendo aproximadamente la VRAM equivalente a un modelo de 27B en la precision de expansion (no especificada, probablemente bfloat16, ~55 GB).
- GPU recomendadas: no especificadas por el autor. Por el tamano de pesos comprimidos, encaja en GPUs de 16-24 GB (RTX 4080, RTX 4090, A10G, L4); para el modo expandido se requieren GPUs de datacenter (A100 80 GB, H100).
- Cabe en GPU de consumo: si, en modo `low_vram=True` en GPUs con al menos 12-16 GB de VRAM, dejando margen para el KV cache.
- Opciones de despliegue: la model card solo documenta la libreria `dr_loader` (`load_dr_packed`) con soporte para `device="cuda:0"`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-DR-3bit-Packed | 27B | no disponible | 3,17 bpw (10,7 GB) | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | 16 bpw (55,5 GB) | Apache 2.0 (segun el checkpoint derivado) | HuggingFace |
| Grawnch/Qwen3.8-27B-DR-3bit (pre-desempaquetado) | 27B | no disponible | bfloat16 reconstruido | Apache 2.0 | HuggingFace |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (mismo tamano o misma tarea) en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad medible: la cuantizacion a 3,17 bpw reduce el acuerdo Top-1 de tokens al 89,49% y aumenta la KLD a 0,07684 respecto al baseline, lo que puede afectar a tareas sensibles a la precision.
- Perplejidad superior: 2,647 frente a 2,518 del baseline (aproximadamente un 5% peor en la metrica in-domain reportada).
- Rendimiento en codigo ligeramente inferior: HumanEval+ cae de 90,85% a 88,41% y MBPP+ de 84,66% a 81,22%.
- Sin validacion independiente: el repositorio tiene 0 descargas y 0 likes, y todas las metricas proceden del propio autor; no hay evaluaciones de terceros.
- Dependencia de una libreria no estandar: la inferencia requiere `dr_loader` y la capa `DRLinear`, lo que limita la portabilidad frente a formatos como GGUF o GPTQ y excluye el uso con vLLM, llama.cpp u Ollama.
- Documentacion incompleta: no se especifican idiomas, contexto, arquitectura interna, dataset de calibracion ni proceso de cuantizacion.
- Riesgo de alucinacion: inherente al modelo base; no se documentan mitigaciones especificas.
- Sesgos: no documentados; al no conocerse la composicion del entrenamiento del modelo base, no es posible evaluar sesgos conocidos.
- Licencia: Apache 2.0, que permite uso comercial, pero el autor no ofrece garantias sobre la calidad del checkpoint cuantizado en produccion.
- Fecha de creacion futura (2026-11-01): conviene verificar la integridad y procedencia del repositorio antes de usarlo en entornos productivos.

## Enlaces

- Checkpoint empaquetado: https://huggingface.co/Grawnch/Qwen3.8-27B-DR-3bit-Packed
- Checkpoint pre-desempaquetado para evaluacion: https://huggingface.co/Grawnch/Qwen3.8-27B-DR-3bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
