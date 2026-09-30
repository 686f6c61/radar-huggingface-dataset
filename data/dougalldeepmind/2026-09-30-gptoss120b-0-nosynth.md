# dougalldeepmind/2026-09-30-gptoss120b-0-nosynth

## Resumen

Este repositorio contiene un adaptador LoRA de rango 32 entrenado sobre el modelo base `openai/gpt-oss-120b`. No es un modelo completo ni un checkpoint de pesos fusionados: son las matrices LoRA nativas generadas con la plataforma Tinker, mas la configuracion del entrenamiento supervisado (SFT) que las produjo. El autor es `dougalldeepmind` y la ficha se publico el 30 de septiembre de 2026, con un tamano de repositorio de 5,3 GB y cero descargas registradas en el momento de la consulta.

El proposito declarado es experimental: se trata de un "control nosynth", es decir, un entrenamiento de una sola epoca sobre una mezcla de datos sin contenido sintetico, pensado como referencia de comparacion frente a variantes equivalentes entrenadas con datos sinteticos. El entrenamiento se ejecuto con SFT ponderado por tokens (625 pasos, batch de 16 filas, learning rate 1e-4, longitud maxima 32.768 tokens) con un coste declarado de 4,42 USD, invocando el modo de razonamiento "medium" y con el prompt de herramientas fijado.

Su relevancia es acotada y de caracter metodologico: sirve para reproducir y auditar experimentos de ajuste fino sobre GPT-OSS-120B, no como modelo de proposito general. Al ser un adaptador y no un modelo fusionado, su uso practico exige el sampler inmutable de Tinker, y la propia model card advierte de que la equivalencia con PEFT o vLLM no se ha probado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre `openai/gpt-oss-120b`; arquitectura del modelo base no detallada en la informacion disponible |
| Parametros totales | No disponible (adaptador LoRA; el repositorio ocupa 5,3 GB) |
| Parametros activos | No disponible |
| Longitud de contexto | 32.768 tokens (valor de `max_length` en la configuracion de entrenamiento; contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados ni GGUF) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Matrices LoRA nativas de Tinker en safetensors; no se ha probado equivalencia con PEFT ni vLLM |

Datos adicionales de la configuracion de entrenamiento: `epochs` 1, `rank` 32, `batch_rows` 16, `lr` 0,0001, `warmup_ratio` 0,05, `weight_decay` 0,01, `beta1` 0,9, `beta2` 0,95, `adam_eps` 1e-12, `grad_clip_norm` 1,0, `save_steps` 100, `steps` 625, `max_cost_usd` 10 y `tool_prompt` fijo. Revision del tokenizer: `b5c939de8f754692c1647ca79fbf85e8c1e70f8a`.

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA, rango 32) sobre el modelo `openai/gpt-oss-120b`. No se modifica ni se documenta la arquitectura del modelo base en esta ficha, y el adaptador no altera su topologia: solo anade matrices de actualizacion de bajo rango. El entrenamiento se ejecuto sobre el backend Tinker, con precision gestionada por el proveedor y no verificada de forma independiente, y el esquema de pesos resultante son las matrices LoRA nativas de Tinker mas su configuracion. La propia card advierte que el uso previsto es el sampler inmutable de Tinker y que no se ha comprobado la equivalencia con PEFT o vLLM.

El regimen de entrenamiento es un SFT de una sola epoca, ponderado por tokens, sobre el dataset `dougalldeepmind/2026-09-30-nosynth-mix-gpt-oss-120b` (revision `4ffd1f931ebb34b25c68c4b784059f98c1617add`), descrito en su propia ficha como una mezcla de tipo "nosynth" en formato JSON con etiquetas `harmony` y entre 10.000 y 100.000 filas. La "constitucion" declarada es `claude_distilled_09_principles`, heredada como filtro, sin corpus constitucional anadido; se trata por tanto de un control de ablacion, no de un modelo alineado mediante un procedimiento constitucional propio. El pipeline se genero desde el repositorio `teaching_claude_why_replication` (revision `20ebb8e62c63cd63bd6a68c48fa06b37f19b0190`). No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base `openai/gpt-oss-120b`; el adaptador no anade capacidades nuevas declaradas.
- Modo de razonamiento configurado como "medium" y `thinking: True` en la provenance del entrenamiento.
- Soporte de tool calling esperado por herencia del modelo base y por el uso de un `tool_prompt` fijo durante el entrenamiento; no verificado de forma independiente en esta ficha.
- Capacidad de trabajar con contextos de hasta 32.768 tokens (limite empleado en el entrenamiento).
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponibles.
- Capacidades de agente y razonamiento multi-paso: no evaluadas en la informacion disponible.

## Casos de uso

- Ablacion experimental nosynth frente a synth: este adaptador actua como control para medir el efecto de excluir datos sinteticos en una mezcla de SFT sobre GPT-OSS-120B, con el resto de hiperparametros congelados (rango 32, una epoca, lr 1e-4, 625 pasos).
- Reproduccion de investigacion sobre destilacion de constituciones: permite repetir el pipeline del repositorio `teaching_claude_why_replication` con el filtrado `claude_distilled_09_principles` y comparar resultados frente a variantes con corpus constitucional anadido.
- Punto de partida para ajustes posteriores: al ser un LoRA de rango 32 no fusionado, puede servir como inicializacion de experimentos de SFT adicionales sobre el mismo modelo base, siempre que se use el mismo backend Tinker.
- Evaluacion de la adherencia al prompt de herramientas: con `tool_prompt` fijado, es util para estudiar la estabilidad del tool calling bajo un formato de prompt constante.
- Auditoria de coste y trazabilidad de entrenamiento: la provenance registra `git_sha`, revisiones de codigo de entrenamiento y exportacion, coste maximo por USD y pasos, lo que facilita la verificacion de experimentos.
- Servicio de inferencia en entorno gestionado: el sampler inmutable de Tinker permite desplegar el adaptador para pruebas internas de generacion con contexto de hasta 32.768 tokens, sin necesidad de fusionar pesos.
- Comparacion de adaptadores hermanos: sirve como referencia frente a variantes de la misma familia (por ejemplo, la version fechada el 28 de septiembre de 2026) para aislar el efecto de la mezcla de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio del adaptador ocupa 5,3 GB, pero la inferencia requiere cargar ademas el modelo base `openai/gpt-oss-120b`; el consumo de VRAM depende por completo de dicho modelo base y no se detalla en la informacion disponible.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Viabilidad en GPU de consumo: no disponible; al tratarse de un adaptador sobre un modelo base de gran tamano, no se puede confirmar su ejecucion en una unica GPU de consumo con los datos aportados.
- Opciones de despliegue: el unico mecanismo indicado es el sampler inmutable de Tinker (`tinker://0b544ff0-4beb-597c-b78d-6ba05f89be78:train:0/sampler_weights/2026-09-30-gptoss120b-0-nosynth`). La equivalencia con PEFT y vLLM no se ha probado. No hay pesos GGUF, por lo que llama.cpp y Ollama no son aplicables tal cual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dougalldeepmind/2026-09-30-gptoss120b-0-nosynth` | Adaptador LoRA rango 32 sobre GPT-OSS-120B | 32.768 tokens (entrenamiento) | Sin benchmarks publicados | No disponible | Repositorio HuggingFace, 0 descargas |
| `openai/gpt-oss-120b` (modelo base) | 120B nominales segun el identificador; datos exactos no disponibles en esta ficha | No disponible | No disponible en la informacion proporcionada | No disponible en esta ficha | Modelo base publico referenciado |
| `dougalldeepmind/2026-09-28-gptoss120b-0-nosynth` | Adaptador de la misma familia | No disponible | No disponible | No disponible | Endpoint de inferencia en FriendliAI |

No se dispone de datos de rendimiento de ninguno de los tres, por lo que la comparativa se limita a trazabilidad y disponibilidad.

## Limitaciones y advertencias

- No es un modelo completo: requiere el modelo base `openai/gpt-oss-120b` y, segun la card, el sampler inmutable de Tinker. La equivalencia con PEFT o vLLM no ha sido probada.
- La licencia no esta declarada en la ficha. Es imprescindible comprobar la licencia del modelo base y del dataset antes de cualquier uso comercial.
- Se desconoce la composicion exacta del dataset de entrenamiento mas alla de su etiqueta "nosynth", su formato JSON y su rango de tamano (10.000 a 100.000 filas).
- No hay evaluacion publica de sesgos, alucinacion ni calidad en produccion; cero descargas y cero likes indican ausencia de validacion por terceros.
- El modo de razonamiento empleado en el entrenamiento es "medium"; el comportamiento fuera de esa configuracion no esta documentado.
- La precision del entrenamiento es "gestionada por el proveedor y no verificada de forma independiente", lo que limita la reproducibilidad exacta.
- El adaptador esta pensado como control experimental; no se recomienda su uso directo en produccion sin una evaluacion propia.
- No se documentan idiomas soportados, por lo que no se puede garantizar un rendimiento multilingue adecuado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dougalldeepmind/2026-09-30-gptoss120b-0-nosynth
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-09-30-nosynth-mix-gpt-oss-120b
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Adaptador hermano con endpoint de inferencia: https://friendli.ai/models/dougalldeepmind/2026-09-28-gptoss120b-0-nosynth
