# mlx-community/Agents-A1-OptiQ-4bit

## Resumen

Agents-A1-OptiQ-4bit es una cuantizacion de precision mixta en formato MLX del modelo InternScience/Agents-A1, un modelo de razonamiento agentico construido sobre la arquitectura Qwen3.5-35B-A3B de tipo Mixture-of-Experts (MoE) con 256 expertos y 8 activos por token. Lo publica la organizacion mlx-community y esta pensado para ejecutar inferencia local en Apple Silicon sin depender de PyTorch ni de la nube, empleando el toolkit mlx-optiq.

El modelo base es multimodal (image-text-to-text): acepta tanto texto como imagenes. La cuantizacion reduce los pesos bf16 de 65 GB a 22 GB en disco (21 GB para la torre de lenguaje y 0,9 GB para el sidecar de vision en bf16), manteniendo las capas sensibles a 8 bits y las robustas a 4 bits, con un promedio medido de 4,513 bits por peso.

Es relevante porque demuestra que un VLM MoE de ~34.660 millones de parametros totales puede servirse en un Mac de 24 GB mediante streaming de expertos desde SSD, con una memoria residente de solo 4,58 GB, y en Macs de 32 GB o mas de forma completamente residente. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (Qwen3.5-35B-A3B), multimodal vision-language |
| Parametros totales | 34.660.608.768 |
| Parametros activos | 8 expertos activos por token sobre 256 expertos por capa (numero exacto de parametros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit de precision mixta (4-bit predominante, capas sensibles a 8-bit), group size 64, 4,513 bits por peso; torre de vision en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), sidecar de vision en `optiq/optiq_vision.safetensors` |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts multimodal de la familia Qwen3.5-35B-A3B: 256 expertos por capa con 8 activos por token, mas una torre de vision que en esta cuantizacion se conserva integra en bf16 (333 tensores) dentro de un sidecar separado. La arquitectura del modelo base Agents-A1 no modifica la del Qwen3.5-35B-A3B original: todos los campos de la configuracion de texto coinciden. El modelo base es un modelo de razonamiento agentico, es decir, "piensa" antes de responder.

El proceso de cuantizacion es de precision mixta: de las 510 capas cuantizables, 397 se mantienen a 8 bits (sensibles) y 113 a 4 bits (robustas). La asignacion por capa se transfiere desde mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit, donde se obtuvo mediante un barrido de sensibilidad por divergencia KL frente a la referencia bf16 sobre una mezcla de calibracion de seis dominios. La verificacion numerica de la cuantizacion reporta un error relativo medio del 0,7 % en las capas a 8 bits y del 9,8 % en las de 4 bits. El modelo base no incluye cabecera MTP, por lo que esta cuantizacion no dispone de sidecar de decodificacion especulativa. No se detallan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO).

## Capacidades

- Generacion de texto y razonamiento agentico con modo de pensamiento previo a la respuesta (requiere asignar suficiente `max_tokens`).
- Comprension de imagenes: la torre de vision en bf16 permite entrada image-text-to-text a traves del endpoint compatible con OpenAI.
- Razonamiento aritmetico y matematico (verificado en el artefacto final durante la validacion).
- Capacidades de agente y razonamiento multi-paso, segun la naturaleza agentica del modelo base.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Servicio local en Apple Silicon con streaming de expertos para modelos MoE que no caben en memoria.

## Casos de uso

- Asistentes de razonamiento local en Mac: servir el modelo con `optiq serve --stream-experts` y conectar cualquier cliente compatible con OpenAI a `http://127.0.0.1:8080/v1`, aprovechando el modo de razonamiento para tareas de analisis complejo sin salir del equipo.
- Analisis de imagenes en local: enviar imagenes codificadas en base64 al endpoint `/v1/chat/completions` para tareas de descripcion, inspeccion o extraccion de informacion visual, manteniendo los datos en el dispositivo.
- Prototipado de agentes en Apple Silicon: usar el modelo como motor de un agente multi-paso en un Mac de 32 GB o mas, donde el modelo cabe residente y evita la latencia del streaming.
- Desarrollo y pruebas sin nube: validar flujos de VLM y agentes con un modelo Apache 2.0 en hardware de consumo, sin costes de API ni envio de datos a terceros.
- Investigacion en cuantizacion: emplear esta ficha como referencia de cuantizacion de precision mixta (4,513 bits por peso, group size 64) para estudiar el impacto del error relativo por capa en tareas downstream.
- Evaluacion de razonamiento aritmetico: ejecutar pruebas de matematicas y logica con el modo de pensamiento, comparando la salida cuantizada frente al modelo base bf16.
- Despliegue en Mac de 24 GB con streaming: servir el modelo con memoria residente de 4,58 GB para entornos con recursos limitados, aceptando el coste de lectura de expertos desde SSD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ejecutaron benchmarks de tarea sobre esta cuantizacion y remite, para numeros de calidad sobre la arquitectura base, a la ficha de Qwen3.5-35B-A3B OptiQ. La unica metrica cuantitativa reportada es el error relativo medio de desquantizacion: 0,7 % en capas a 8 bits y 9,8 % en capas a 4 bits.

## Requisitos de hardware

- Tamano en disco: 22 GB (21 GB lenguaje + 0,9 GB sidecar de vision).
- Memoria residente con streaming de expertos: 4,58 GB, medido en un Mac de 24 GB (M4).
- En Mac de 24 GB el modelo no cabe comodamente en el working set de Metal; se recomienda streaming de expertos desde SSD (`optiq serve --stream-experts`).
- En Mac de 32 GB o mas el modelo cabe residente y el streaming no es necesario.
- GPU recomendadas: Apple Silicon (M-series); no se documentan requisitos para GPU NVIDIA en la informacion disponible.
- Cabe en GPU de consumo Apple Silicon; no hay datos sobre GPUs de consumo NVIDIA.
- Opciones de despliegue: `mlx-optiq` (`optiq serve`), `mlx-lm` (`load` + `generate`, mantiene el modelo residente y es lento en 24 GB), endpoint compatible con OpenAI en el puerto 8080.
- Latencia y throughput: no disponibles; la model card advierte que el modo residente en 24 GB hace la decodificacion "dolorosamente lenta" y que el streaming solo lee los expertos activos por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlx-community/Agents-A1-OptiQ-4bit | 34.660.608.768 totales (MoE, 8 activos/token) | no disponible | 4-bit mixta (4,513 bpw) | apache-2.0 | Hugging Face, MLX |
| InternScience/Agents-A1 (base) | 34.660.608.768 totales (MoE) | no disponible | bf16 (65 GB) | apache-2.0 | Hugging Face |
| mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit | familia Qwen3.5-35B-A3B (MoE) | no disponible | 4-bit mixta (4,513 bpw) | no disponible en la informacion | Hugging Face, MLX |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce error numerico: 9,8 % de error relativo medio en las capas a 4 bits y 0,7 % en las de 8 bits, lo que puede degradar tareas sensibles.
- La asignacion de bits por capa se transfiere desde el modelo base Qwen3.5-35B-A3B, no se midio sobre este fine-tune; las sensibilidades reales de Agents-A1 podrian diferir.
- No se ejecutaron benchmarks de tarea sobre esta cuantizacion, por lo que no hay evidencia publicada de su calidad downstream.
- Es un modelo de razonamiento: consume tokens en el pensamiento previo, lo que aumenta la latencia y el coste de generacion si no se ajusta `max_tokens`.
- En Mac de 24 GB el modo residente es lento; el streaming desde SSD anade latencia de lectura por token.
- No incluye cabecera MTP ni decodificacion especulativa, lo que limita optimizaciones de velocidad.
- Sesgos conocidos, riesgo de alucinacion y limitaciones de idioma del modelo base: no disponibles en la informacion proporcionada.
- La cuantizacion no altera el comportamiento ni la alineacion del modelo base; se aplican los mismos terminos que al original (Apache 2.0).
- Solo la torre de lenguaje esta cuantizada; la de vision permanece en bf16 y consume 0,9 GB adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Agents-A1-OptiQ-4bit
- Modelo base: https://huggingface.co/InternScience/Agents-A1
- Cuantizacion de referencia Qwen3.5-35B-A3B OptiQ: https://huggingface.co/mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit
- Toolkit mlx-optiq: https://mlx-optiq.com
- Documentacion de mlx-optiq: https://mlx-optiq.com/docs/
- Laboratorio mlx-optiq: https://mlx-optiq.com/docs/lab/
- Todos los quants OptiQ: https://mlx-optiq.com/models
- Blog sobre la mezcla de calibracion: https://mlx-optiq.com/blog/calibration-mix
