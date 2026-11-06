# Remek/basal-omni-pico

## Resumen

basal-omni-pico es un modelo de decisión tipada (typed-decision) de 0,8B parámetros desarrollado por Remek, construido sobre Qwen3.5-0.8B-Base y entrenado por destilación a partir de basal-omni-1.0-ultra (31B). A diferencia de un modelo generativo convencional, no produce texto libre: recibe un *estado* (un mensaje, un documento, un log de sensores o pasajes recuperados) junto con una pregunta tipada y devuelve, en un único forward pass, una distribución de probabilidad sobre el conjunto cerrado de respuestas permitidas. Los tipos de pregunta soportados son `choice`, `noul` (sí/no), `score`, `multi`, `act` y `tool`.

El modelo resuelve un problema concreto: convertir tareas de clasificación, enrutamiento y selección en decisiones calibradas y acotadas, sin riesgo de que la salida quede fuera de las opciones definidas por el desarrollador. Está pensado para despliegue en el borde (edge) y en pipelines de producción donde la latencia y la previsibilidad importan más que la generación creativa. Soporta únicamente polaco e inglés y lectura de texto.

Su relevancia actual radica en la combinación de tamaño reducido (752.393.024 parámetros reales según safetensors), licencia Apache 2.0, disponibilidad en formato GGUF para llama.cpp y un motor de inferencia propio (basal 2.5.0) con modos de servicio para CPU, GPU NVIDIA, Apple Silicon y vLLM. Con 267 descargas y creado en octubre de 2026, es un modelo de nicho pero con una propuesta técnica diferenciada frente a los LLM generativos al uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.5 (tag `qwen3_5_text`); no se detalla si incorpora capas lineales o híbridas |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q8_0 (repo separado con su propio fichero de calibración); se rechazan fp8, nvfp4 y pesos MLX cuantizados para este modelo |
| Idiomas soportados | polaco (pl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF Q8_0 en repo aparte |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B-Base, un transformer de texto etiquetado en Hugging Face con la arquitectura `qwen3_5_text`. Sobre esa base, Remek aplica un ajuste fino orientado a decisión tipada, usando basal-omni-1.0-ultra (31B, construido sobre Gemma 4) como profesor en un esquema de destilación. La salida no es texto generado token a token, sino una probabilidad por cada respuesta permitida calculada en un solo forward pass, lo que elimina la decodificación autoregresiva en la ruta de inferencia.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. El autor sí menciona un conjunto de evaluación propio ("Werdykt", 5.000 ítems ocultos en polaco e inglés) y un conjunto de desarrollo de 1.700 ítems usado para validar la paridad entre el modo nativo y el modo GGUF. La innovación técnica destacable es el contrato de salida tipado con calibración por modelo: el motor basal entrega probabilidades acompañadas de un parámetro `max_error`, y el modelo GGUF incluye su propio fichero de calibración.

## Capacidades

- Decisión tipada con salida cerrada: `choice` (selección entre opciones con clave), `noul` (sí/no con probabilidad), `score`, `multi` (selección múltiple), `act` (acción) y `tool` (selección de herramienta).
- Enrutamiento de peticiones a colas, equipos o herramientas (routing 0,912 en Werdykt).
- Selección de pasaje relevante en recuperación (retrieval 0,886).
- Clasificación y calibración de decisiones sobre documentos reales (0,848 en documentos reales según el autor).
- Soporte de tool calling mediante el tipo de pregunta `tool`.
- Decisiones en polaco e inglés.
- Lectura de texto únicamente; no procesa visión ni audio.
- No genera texto ni mantiene conversación: no es un modelo de chat.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el mensaje del cliente como estado y una pregunta `choice` con las colas disponibles (tarjetas, banca online, préstamos), devolviendo la probabilidad de cada una. El ejemplo de la model card muestra 0,9983 de confianza para "online" en una incidencia de acceso a banca electrónica.
- Triaje de urgencia: con una pregunta `noul`, se determina si el cliente ha perdido acceso al servicio, permitiendo priorizar la cola de atención en función de la probabilidad devuelta.
- Selección de pasaje en un pipeline RAG: dado un conjunto de fragmentos recuperados como estado, el modelo puntúa cuál es el relevante antes de pasarlo a un LLM generativo, reduciendo coste y alucinación en la etapa final.
- Selección de herramienta en un agente: mediante el tipo `tool`, el modelo elige qué función o API invocar entre un conjunto cerrado, con probabilidad asociada para aplicar umbrales de confianza.
- Clasificación documental en lote: procesamiento de documentos reales (0,848 en la evaluación del autor) para asignar categorías con probabilidades calibradas, apto para revisión humana posterior en los casos de baja confianza.
- Despliegue en el borde: con el GGUF Q8_0 y `--mode gguf`, el modelo responde en aproximadamente 0,5 s en 16 hilos de CPU, lo que permite ejecutarlo en servidores sin GPU o en dispositivos con llama.cpp.
- Filtro previo a revisión humana en decisiones sensibles: el autor lo desaconseja para decisiones con consecuencias graves sin revisión, pero las probabilidades permiten derivar a humano los casos por debajo de un umbral.

## Benchmarks y rendimiento

Resultados publicados por el autor en Werdykt (benchmark propio oculto, 5.000 ítems, polaco e inglés):

| Métrica | basal-omni-pico | basal-2.0-mini (1,5B) | basal-2.0 (4,5B) | basal-omni-1.0-mini |
|---|---|---|---|---|
| Werdykt macro | 0,660 [0,648; 0,671] | 0,618 | 0,729 | 0,769 |
| Polaco | 0,661 | no disponible | no disponible | no disponible |
| Inglés | 0,659 | no disponible | no disponible | no disponible |
| Routing | 0,912 | no disponible | no disponible | no disponible |
| Retrieval | 0,886 | no disponible | no disponible | no disponible |
| Documentos reales | 0,848 | no disponible | no disponible | no disponible |
| Decisiones en polaco (check set propio) | 0,876 | no disponible | no disponible | no disponible |
| Reglas (Werdykt rules) | 0,316 | no disponible | no disponible | no disponible |

Paridad GGUF: sobre 1.700 ítems de desarrollo, el modo GGUF coincide con el modelo nativo en el 99,24 % de los casos en una H100 y en el 99,29 % en CPU.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 752 millones de parámetros, los pesos en bf16 ocupan aproximadamente 1,5 GB (tamaño del repo), y el modo `eager` opera en float32.
- GPU recomendadas: H100 para el modo `fast` (CUDA-graph con flash-linear-attention 0.5.2, verificado por el autor); cualquier GPU NVIDIA para el modo `vllm` o `eager`.
- GPU de consumo: no se confirma compatibilidad explícita con RTX 4090 u otras consumer en la información disponible, aunque el tamaño del modelo lo hace viable en teoría.
- Apple Silicon: modo `mlx` (basal ≥ 2.5.0), con cómputo en float32 a partir de los pesos bf16; se rechazan pesos MLX cuantizados.
- CPU: modo `eager` (referencia en float32) y modo `gguf` con llama.cpp en proceso; unas 0,5 s por petición en 16 hilos de CPU.
- Despliegue: motor propio `basal-serve` (basal 2.5.0), con modos `fast`, `eager`, `mlx`, `gguf` y `vllm`. Se rechazan `fp8`, `nvfp4`, `fast-exit`, `mps` y `--lanes` para este modelo; `--long-lane` requiere `--long-lane-gdn on`.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Base | Contexto | Werdykt macro | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| basal-omni-pico | 0,8B | Qwen3.5-0.8B-Base | no disponible | 0,660 | Apache 2.0 | HF + GGUF |
| basal-2.0-mini | 1,5B | no disponible | no disponible | 0,618 | no disponible | HF |
| basal-2.0 | 4,5B | no disponible | no disponible | 0,729 | no disponible | HF |
| basal-omni-1.0-mini | E4B | Gemma 4 E4B | no disponible | 0,769 | no disponible | HF |

La comparativa se limita a la propia familia basal, ya que la información disponible no incluye modelos de decisión tipada de otros desarrolladores. Frente a un LLM generativo de tamaño similar, la diferencia clave es el contrato de salida cerrado y la calibración, no el rendimiento en tareas generativas.

## Limitaciones y advertencias

- No sirve para escribir texto ni para conversar; su uso como chatbot es un error de aplicación.
- No responde sobre hechos que no estén contenidos en el estado de entrada.
- Rendimiento muy bajo en comprobación de reglas (0,316 en Werdykt rules): no debe usarse para validación normativa o de reglas de negocio.
- Las probabilidades no deben interpretarse como tasas de error en tipos de datos nuevos sin verificación previa en ese dominio (advertencia explícita del autor sobre calibración).
- No debe emplearse en decisiones con consecuencias graves para personas sin revisión humana.
- Solo soporta polaco e inglés; no hay cobertura multilingüe más allá de esos dos idiomas.
- Para casos difíciles, el autor recomienda modelos basal mayores.
- Dependencia de un motor de inferencia propio (basal 2.5.0) con modos y flags rechazados para este modelo, lo que limita la portabilidad a stacks estándar como TGI o vLLM genérico (vLLM se soporta solo a través del preset de basal).
- Riesgo de sesgo: no se documenta en la información disponible.
- Riesgo de alucinación: mitigado por el formato de salida cerrado, pero no se documenta una evaluación específica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Remek/basal-omni-pico
- GGUF: https://huggingface.co/Remek/basal-omni-pico-GGUF
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Documentación de la API: https://github.com/rkinas/basal#api
- Sitio web: https://basal.si5.pl/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- basal-omni-1.0-mini: https://huggingface.co/Remek/basal-omni-1.0-mini
- basal-omni-1.1-max: https://huggingface.co/Remek/basal-omni-1.1-max
- basal-omni-1.0-ultra: https://huggingface.co/Remek/basal-omni-1.0-ultra
