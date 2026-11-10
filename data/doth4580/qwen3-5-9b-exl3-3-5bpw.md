# doth4580/Qwen3.5-9B-exl3-3.5bpw

## Resumen

Esta ficha describe `doth4580/Qwen3.5-9B-exl3-3.5bpw`, una cuantizacion EXL3 (ExLlamaV3) de 3,5 bits por peso del modelo multimodal `Qwen/Qwen3.5-9B` del equipo Qwen. No se trata de un modelo entrenado desde cero, sino de un empaquetado de pesos modificados que conserva tokenizer, plantilla de chat y configuracion del original, y que se publica principalmente para el motor de inferencia veloGB10 sobre hardware NVIDIA DGX Spark / GB10.

El modelo base pertenece a la familia Qwen3.5, orientada a utilidad practica y con una base unificada de vision-lenguaje. La cuantizacion se realizo con exllamav3 1.4.7 sobre 8 GPU NVIDIA H100, con `lm_head` a 6 bits, capa MTP a 4 bits, torre de vision a 6 bits y calibracion de 250 x 2048 tokens. El resultado es un paquete de 6,5 GB en formato safetensors EXL3, con licencia Apache-2.0.

Su relevancia actual es doble: por un lado, permite ejecutar un modelo multimodal de la familia Qwen3.5 en equipos GB10 con decodificacion especulativa mediante la cabeza MTP incluida; por otro, demuestra un flujo de cuantizacion mixta por componentes (vision, `lm_head`, MTP) que reduce el peso sin degradar drasticamente las partes sensibles. La ficha recoge tanto los datos del empaquetado como los del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) con capa MTP; cuantizacion EXL3 |
| Parametros totales | 3.264.925.056 (segun safetensors del repo cuantizado) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (segun `--max-seq-len` probado en veloGB10) |
| Tipos de cuantizacion | EXL3 3,5 bpw promedio; `lm_head` 6 bits; MTP 4 bits; torre de vision 6 bits; codebook `mul1`; out-scales `always` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (EXL3 / ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer multimodal con base unificada de vision-lenguaje, segun la model card original. La familia Qwen3.5 incorpora, segun el autor del modelo base, avances en aprendizaje multimodal, eficiencia arquitectonica, escala de reinforcement learning y accesibilidad global. La model card reproducida se interrumpe antes de detallar la arquitectura completa, por lo que no se dispone de informacion sobre numero de capas, dimensiones ocultas, atencion (completa, lineal o hibrida) ni composicion exacta del dataset de entrenamiento.

El empaquetado cuantizado anade una capa MTP (multi-token prediction) que se usa como fuente de draft para decodificacion especulativa en veloGB10, con una tasa de aceptacion medida del 62,2 % en TP=1 y TP=2, y del 61,6 % en TP=4. La cuantizacion se realizo con exllamav3 1.4.7 sobre 8 x H100, con calibracion de 250 secuencias de 2048 tokens y out-scales siempre activos. No se detalla si el modelo base uso RLHF, DPO u otras tecnicas de alineacion.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredadas del modelo base Qwen3.5-9B.
- Procesamiento de vision: el paquete incluye torre de vision cuantizada a 6 bits, lo que confirma capacidad multimodal imagen-texto.
- Modo thinking: las pruebas de veloGB10 se ejecutan con "thinking on", lo que indica soporte de razonamiento extendido.
- Decodificacion especulativa mediante cabeza MTP incluida en el paquete.
- Servido mediante API compatible con OpenAI a traves de veloGB10 (`/v1`).
- Cache de prefijos (`--prefix-cache on`) para reutilizacion de contexto en conversaciones multi-turno.
- Soporte de lotes concurrentes (`--max-batch`), probado con 2 peticiones simultaneas.
- Capacidades de tool calling, function calling y agentes: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Despliegue en DGX Spark / GB10: el paquete esta disenado y probado para veloGB10 en una, dos o cuatro maquinas GB10, con servidor OpenAI-compatible en el puerto 9000. Es el escenario principal declarado por el autor.
- Inferencia multimodal en el borde: al incluir torre de vision a 6 bits y ocupar 6,5 GB, permite procesar imagenes y texto en equipos GB10 con memoria limitada, sin necesidad de GPU de centro de datos.
- Asistentes con contexto largo: los 262.144 tokens de ventana probados permiten mantener conversaciones o documentos extensos en memoria, con cache de prefijos para reducir recalculo.
- Generacion de codigo interactiva: la prueba "Code turn decode" alcanza 93 tok/s en TP=1 y 183 tok/s en TP=4, adecuado para autocompletado y turnos de codigo en IDE o pipelines internos.
- Escalado horizontal en cluster pequeno: el modo TP=2 y TP=4 reparte pesos por red sin copia local en los nodos, util para servir a varios usuarios con un solo modelo y cache distribuida.
- Prototipado de agentes con razonamiento: el modo thinking y la decodificacion especulativa permiten cadenas de razonamiento largas con latencia contenida (mediana de 89 tok/s en TP=1).
- Evaluacion de cuantizaciones: util para investigadores que quieran comparar el efecto de 3,5 bpw EXL3 frente al modelo original en tareas de vision y texto.

## Benchmarks y rendimiento

Rendimiento medido por el autor con VeloBench sobre la API servida en GB10 (2026-11-08, veloGB10 0.7.7 dev), con sampling de produccion, thinking activado y una peticion simultanea salvo en la columna agregada. La decodificacion incluye decodificacion especulativa; variacion aproximada de ±10 %.

| Topologia | Fuente de draft | Decode turno de codigo (tok/s) | Decode turno de historia (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion de draft |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | cabeza MTP del paquete | 93 | 81 | 89 | 2.949 | 91 | 62,2 % |
| TP=2 | cabeza MTP del paquete | 140 | 118 | 128 | 4.635 | 139 | 62,2 % |
| TP=4 | cabeza MTP del paquete | 183 | 161 | 163 | 5.296 | 208 | 61,6 % |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 6,5 GB en disco; en inferencia EXL3 el peso residente es del mismo orden, mas cache KV para 262.144 tokens, que puede ser considerable y no se cuantifica en la informacion disponible.
- GPU recomendadas: NVIDIA DGX Spark / GB10 (hardware objetivo declarado), en configuraciones de 1, 2 o 4 maquinas.
- Cuantizacion de 8 x NVIDIA H100 fue la usada para generar el paquete, no para inferencia.
- Consumer GPU: no disponible; el autor no documenta ejecucion en RTX 4090 u otras GPU de consumo.
- Despliegue: veloGB10 (`gb10_inference`), con API OpenAI-compatible; al ser formato EXL3 estandar, cualquier framework que lea EXL3 podria usarlo, aunque solo veloGB10 esta probado.
- Red: para TP=2 y TP=4 se requiere conectividad entre nodos por puerto 29500 y, opcionalmente, RoCE con `--rdma-dev` para seleccionar rail.
- Latencia y throughput: ver tabla de benchmarks; prefill de 2.949 a 5.296 tok/s y decode mediano de 89 a 163 tok/s segun topologia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| doth4580/Qwen3.5-9B-exl3-3.5bpw | 3.264.925.056 (segun safetensors) | 262.144 tokens (probado) | EXL3 3,5 bpw, safetensors | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (base) | no disponible | no disponible | Transformers, safetensors | Apache-2.0 | Hugging Face |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | Apache-2.0 (heredada) | no disponible |

No se dispone de datos de benchmarks del modelo base ni de otras alternativas en la informacion proporcionada, por lo que la comparacion de rendimiento no esta disponible.

## Limitaciones y advertencias

- Es una cuantizacion a 3,5 bpw: puede degradar calidad frente al modelo original, especialmente en tareas sensibles a precision como matematicas o codigo largo.
- El paquete esta probado unicamente con veloGB10; otros motores EXL3 pueden cargarlo pero no estan validados por el autor.
- La model card original reproducida esta truncada, por lo que faltan datos de arquitectura, entrenamiento, alineacion e idiomas.
- No se documentan sesgos conocidos, riesgo de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- La licencia Apache-2.0 se hereda del modelo base; el autor no reclama propiedad intelectual sobre pesos ni arquitectura.
- El rendimiento medido tiene variacion de ±10 % y se basa en una sola ejecucion por celda, sin repeticiones estadisticas.
- El uso comercial esta permitido por Apache-2.0, pero conviene verificar la licencia del modelo base y de cualquier componente de terceros.
- El contexto de 262.144 tokens probado implica un consumo de cache KV no cuantificado; en GB10 puede limitar el numero de peticiones concurrentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.5-9B-exl3-3.5bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Motor veloGB10: https://github.com/sf-stav/veloGB10
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Qwen Chat: https://chat.qwen.ai
