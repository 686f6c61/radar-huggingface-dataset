# karimmashaly/egx-qwen2.5-1.5b-grpo

## Resumen

EGX Qwen2.5-1.5B GRPO es un ajuste fino de Qwen2.5-1.5B desarrollado por el usuario karimmashaly y publicado en HuggingFace. No es un modelo de proposito general: esta especializado en clasificar la direccion esperada del precio de acciones de la Bolsa de Egipto (EGX). Dado un ticker, la fecha de analisis, un resumen de las 60 sesiones previas, noticias recientes y un horizonte temporal de 1, 3, 5 o 10 dias de negociacion, el modelo genera un bloque de razonamiento `<think>` y una etiqueta dentro de `<answer>`.

Las etiquetas permitidas son cinco: Strong Bullish, Slight Bullish, Neutral, Slight Bearish y Strong Bearish. El modelo parte de los pesos de `Qwen/Qwen2.5-1.5B`, sobre los que se aplicaron tres etapas: preentrenamiento continuado, ajuste supervisado (SFT) y optimizacion con Dr. GRPO. Los pesos publicados corresponden al mejor checkpoint de validacion de la ultima epoca de GRPO (paso 28, `eval_reward` 1.018).

Es relevante como ejemplo de aplicacion de tecnicas de aprendizaje por refuerzo (GRPO) a un dominio vertical muy concreto con un modelo pequeno (1.543.714.304 parametros, ~3,1 GB en 16 bits). Conviene subrayar que el propio autor lo describe como un checkpoint de investigacion y no como un sistema de trading: en su validacion, la tasa de acierto exacto de etiqueta fue del 26,1%, por debajo del 27% que se obtendria eligiendo siempre "Neutral".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivada de Qwen/Qwen2.5-1.5B |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no se declara en la model card) |
| Tipos de cuantizacion | no se publican versiones cuantizadas; los pesos del repositorio estan en 16 bits (safetensors, ~3,1 GB) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La base es Qwen2.5-1.5B, un transformer decoder-only de ~1,54 B de parametros con atencion causal estandar (no se documenta atencion lineal, SSM ni arquitectura hibrida en la informacion disponible). El pipeline de adaptacion descrito por el autor consta de tres fases consecutivas: preentrenamiento continuado sobre el corpus del dominio, ajuste supervisado (SFT) sobre pares instruccion-respuesta del EGX y, finalmente, optimizacion con Dr. GRPO (una variante de Group Relative Policy Optimization). No se detalla el numero de tokens de cada fase, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como DPO.

El formato de salida esta impuesto por el prompt de sistema: el modelo debe razonar dentro de `<think></think>` y emitir exactamente una de las cinco etiquetas dentro de `<answer></answer>`. El checkpoint publicado es el de mejor recompensa de validacion de la ultima epoca de GRPO (paso 28, `eval_reward` 1.018). La model card no especifica innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Clasificacion de direccion de valores del EGX en cinco clases discretas (Strong Bullish, Slight Bullish, Neutral, Slight Bearish, Strong Bearish).
- Razonamiento explicito en formato `<think>...</think>` antes de emitir la etiqueta, lo que permite auditar el razonamiento generado.
- Salida estructurada y parseable: una unica etiqueta dentro de `<answer>...</answer>`.
- Condicionamiento sobre contexto numerico (resumen de las 60 sesiones previas) y textual (noticias de T-7 a T).
- Soporte de horizontes temporales multiples: 1, 3, 5 y 10 dias de negociacion.
- Formato conversacional basado en plantilla de chat (`apply_chat_template`) con rol de sistema, usuario y generacion.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Vision, audio o modalidades adicionales: no disponibles.

## Casos de uso

- Etiquetado asistido para investigacion cuantitativa: el modelo puede generar etiquetas de direccion sobre series historicas del EGX, y el bloque `<think>` permite revisar el razonamiento antes de aceptar la etiqueta en un dataset de entrenamiento.
- Integracion en backtesting de estrategias: al devolver una etiqueta parseable dentro de `<answer>`, se puede conectar a un pipeline que compare la prediccion con el retorno real de los 1, 3, 5 o 10 dias siguientes; utilidad condicionada a que la tasa de acierto (26,1%) supere el baseline del 27%, cosa que hoy no ocurre.
- Estudio de GRPO en dominios verticales: sirve como caso reproducible de preentrenamiento continuado + SFT + Dr. GRPO sobre un modelo de 1,5 B y un dominio financiero acotado.
- Base para un ajuste posterior: al estar bajo licencia Apache 2.0 y en safetensors, puede reutilizarse como punto de partida para SFT/DPO con datos propios, mas volumen de noticias o etiquetas mejor definidas.
- Filtrado previo en sistemas de alertas internas: con supervision humana y umbrales de confianza, podria usarse para priorizar que valores revisar cada manana, nunca para ejecutar ordenes de forma autonoma.
- Analisis de sensibilidad al horizonte temporal: su soporte nativo para 1, 3, 5 y 10 dias permite comparar si el modelo responde de forma coherente a distintos horizontes en un mismo ticker.
- Generacion de razonamiento sintetico sobre noticias: el bloque `<think>` puede extraer y estructurar la relacion entre noticias recientes y el movimiento esperado, de utilidad como borrador para un analista humano.

## Benchmarks y rendimiento

Los unicos datos publicados son los de validacion del propio autor, sobre 437 prompts retenidos (el 15% de fechas mas recientes de cada ticker, una respuesta por prompt):

| Metrica | Resultado |
|---|---|
| Tasa de etiqueta exacta | 26,1% |
| Baseline "siempre Neutral" sobre la distribucion de entrenamiento | ~27% |
| Baseline aleatorio uniforme entre las cinco etiquetas | ~20% |
| `eval_reward` del checkpoint publicado (paso 28) | 1,018 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La mayoria de las respuestas generadas agotan el limite de tokens de finalizacion configurado (1024 en el ejemplo de uso).

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: alrededor de 3,1 GB solo para pesos, mas cache KV y activaciones; en la practica, entre 4 y 6 GB (estimacion propia, no publicada por el autor).
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 1,6-2 GB de pesos, con un consumo total en torno a 3 GB (estimacion).
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 0,9-1,2 GB de pesos, con un consumo total en torno a 2 GB (estimacion). No se publican GGUF oficiales, habria que generarlos.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 24 GB). En hardware profesional, cabe holgadamente en L4, A10G y incluso en A100/H100, aunque para 1,5 B estas ultimas estan sobredimensionadas.
- Cabe en GPU de consumo: si, sin necesidad de reparto entre dispositivos.
- Opciones de despliegue: `transformers` (metodo nativo indicado en la model card), Text Generation Inference (el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`), vLLM, y llama.cpp/Ollama si se convierte previamente a GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| egx-qwen2.5-1.5b-grpo | 1,54 B | no disponible | 26,1% de etiqueta exacta en validacion propia | apache-2.0 | HuggingFace (transformers, safetensors) |
| Qwen/Qwen2.5-1.5B | 1,54 B | no disponible en la informacion proporcionada | no disponible | apache-2.0 | HuggingFace |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | no disponible en la informacion proporcionada | no disponible | apache-2.0 | HuggingFace |
| Modelos de sentimiento financiero comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa con alternativas de la misma categoria no esta disponible: el autor no publica comparaciones frente a otros modelos financieros ni frente al modelo base, y los resultados de busqueda web no aportan informacion relevante sobre este modelo ni sobre alternativas.

## Limitaciones y advertencias

- Rendimiento muy limitado: 26,1% de etiqueta exacta frente al ~27% de una estrategia trivial que responda siempre "Neutral". El modelo no demuestra capacidad predictiva util sobre su propia distribucion de validacion.
- El autor lo define explicitamente como "research checkpoint, not a trading system". No debe usarse para tomar decisiones de inversion ni para ejecutar ordenes.
- Riesgo elevado de alucinacion: es un modelo de 1,5 B y el prompt de sistema le exige no inventar cifras; aun asi, no hay garantia de que respete esa restriccion en contextos financieros.
- Sesgos potenciales: entrenado sobre datos de un unico mercado (Bolsa de Egipto), un unico idioma (ingles) y un rango temporal concreto; el comportamiento fuera de esa distribucion esta sin evaluar.
- Idiomas: la model card declara unicamente ingles; no hay evidencia de soporte en arabe ni en castellano.
- Limitacion de contexto: la longitud maxima no se declara en la model card, por lo que no puede planificarse el troceado de historicos sin verificacion empirica.
- Verbosidad: la mayoria de las respuestas agotan el limite de tokens de finalizacion, lo que incrementa latencia y coste y ensucia el parseo si no se aplica una extraccion robusta de `<answer>`.
- Licencia Apache 2.0: permite uso comercial, pero la escasa calidad predictiva hace desaconsejable cualquier despliegue en produccion sin una evaluacion propia y supervision humana.
- No se publican versiones cuantizadas (GGUF, AWQ, GPTQ), por lo que el despliegue en entornos ligeros requiere conversion manual.
- Fecha de publicacion y de actualizacion del repositorio: 10 de octubre de 2026. Con cero descargas y cero "likes" en el momento de redactar esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/karimmashaly/egx-qwen2.5-1.5b-grpo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B

Nota: los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo ni sobre modelos financieros comparables; los enlaces devueltos corresponden a contenido de fitness sin relacion con la ficha, por lo que no se incluyen.
