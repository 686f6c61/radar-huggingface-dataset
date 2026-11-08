# Aijuus/alodlm-qwen3.8-27b-lora-1000

## Resumen

ALoDLM Qwen3.8-27B LoRA (1000 steps) es un adaptador LoRA de investigación publicado por el usuario Aijuus sobre el checkpoint Qwen3.8-27B. Forma parte de ALoDLM, una variante experimental de tipo *adaptive-depth* o *looped-trunk*: conserva el tronco del modelo base e itera un rango de capas (de la 24 a la 39) hasta `max_depth = 4` veces, con una compuerta de salida por profundidad que debería decidir, posición a posición, cuántas iteraciones ejecutar. El adaptador tiene rango 16, alpha 32 y 800 tensores, con un total de 435.287.728 bytes en `adapter_model.safetensors`.

El artefacto es relevante únicamente como material de investigación reproducible: se entrenó durante 1000 pasos de optimización (unos 1.193.500 tokens, aproximadamente el 8 % de una época sobre un corpus de prosa genérica de 14,8 M tokens), por lo que está claramente infraentrenado y no convergido. No es un modelo autónomo ni una release de inferencia adaptativa: la compuerta de salida entrenada (`exit_gate.pt`) no existe, de modo que la selección dinámica de profundidad no funciona tal y como se describe en el diseño.

La única medición disponible es un proxy de verosimilitud por opción sobre 513 ítems de MMLU, con una mejora de +3,51 puntos (71,35 % → 74,85 %) que no alcanza significación estadística convencional (McNemar exacto p = 0,0598). Cualquier uso en producción, evaluación de capacidades o cita como mejora demostrada queda fuera de alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre tronco transformer con bucle adaptativo (ALoDLM, *looped-transformer*); capas 24-39 iteradas hasta `max_depth` 4 |
| Parametros totales | No disponible para el adaptador (435.287.728 bytes de pesos LoRA, 800 tensores); el modelo base es Qwen3.8-27B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (`max_seq_length` de entrenamiento, `block_size` 4096); contexto nativo del base no disponible |
| Tipos de cuantizacion | No disponible (entrenamiento en bf16, `quantize: false`) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + JSON de configuración PEFT y ALoDLM |

## Arquitectura y entrenamiento

ALoDLM no es un transformer convencional: mantiene el tronco de un checkpoint Qwen3.8-27B y añade un rango de capas recurrentes. En esta configuración, `loop_start` es 24, `loop_end` es 40 y `max_depth` es 4, con una compuerta por profundidad inicializada con `gate_init_pi` `[0.25, 0.25, 0.25, 0.25]`. La compuerta debería decidir por posición cuántas iteraciones del bloque ejecutar; sin embargo, el checkpoint `exit_gate.pt` nunca se recuperó de la máquina de entrenamiento y no está en el repositorio, por lo que la inferencia adaptativa no es operativa. La única modalidad de evaluación soportada es `--never-exit`, que fuerza las cuatro iteraciones en todas las posiciones y lee la salida en la profundidad final.

El adaptador se entrenó con PEFT 0.21.2 durante 1000 pasos en bf16, con semilla 42 y longitud máxima de 4096 tokens. El corpus consta de 9.900 registros de prosa genérica (unos 14,8 M de tokens), de los que se consumió aproximadamente el 8 % de una época (≈1,19 M tokens). No se documenta RLHF, DPO ni ninguna otra fase de alineación. `adapter_config.json` fija `base_model_name_or_path` a `null` y declara `auto_mapping.parent_library: alodlm.model`, de modo que la carga exige la implementación de referencia del proyecto ai-setups (`aijuus/looping/ALoDLM/alodlm/`) además del checkpoint base público `Qwen/Qwen3.8-27B` (revisión `37561816e66b`, Apache-2.0).

## Capacidades

- No se ha validado ninguna capacidad de generación, razonamiento, código o matemáticas para este adaptador; la evaluación disponible es un proxy de verosimilitud, no generación con extracción de respuesta.
- Selección adaptativa de profundidad: diseñada pero **no funcional** en este repositorio por ausencia de `exit_gate.pt`; solo se puede ejecutar con compuerta que nunca dispara.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles para el adaptador; el modelo base Qwen3.8-27B se describe en su repositorio como multimodal nativo denso, pero este adaptador no documenta ni evalúa dichas capacidades.

## Casos de uso

- Reproducción de investigación sobre *looped transformers*: cargar el adaptador con la implementación ALoDLM, el checkpoint base y `alodlm_config.json` para inspeccionar la geometría del bucle (capas 24-39, profundidad 4) y reejecutar la medición con `--never-exit`.
- Estudio de la dinámica de profundidad: comparar perplejidad y KL frente a la profundidad del bucle (mediciones que el autor declara aún no establecidas) para caracterizar el efecto de iterar el tronco.
- Auditoría de artefactos de investigación: verificar la reproducibilidad de un adaptador PEFT con `base_model_name_or_path` nulo y dependencia de una librería externa (`alodlm.model`), útil como caso de estudio de empaquetado deficiente.
- Análisis estadístico de evaluaciones preliminares: reutilizar el diseño de 513 ítems MMLU (9 por asignatura, semilla 42) con intervalos de Wilson y McNemar exacto como plantilla metodológica para comparar brazos con y sin adaptador.
- Desarrollo de la compuerta de salida: entrenar un `exit_gate.pt` desde cero sobre este adaptador para habilitar la inferencia adaptativa y medir su coste frente a la ejecución a profundidad completa.
- Docencia y divulgación: ejemplo concreto de las limitaciones de publicar pesos sin la cabeza de selección y sin convergencia, para discutir buenas prácticas de publicación de artefactos de investigación.

## Benchmarks y rendimiento

| Brazo | Exactitud | Intervalo de Wilson 95 % |
|---|---|---|
| Base (sin adaptador) | 71,35 % | 67,29 – 75,09 |
| Adaptador | 74,85 % | 70,92 – 78,41 |

- Delta: +3,51 puntos; 82 pares discordantes (50 ganados, 32 perdidos); McNemar exacto p = 0,0598.
- Metodología: 513 ítems MMLU (9 por asignatura, 57 asignaturas, semilla 42), puntuación por entropía cruzada condicional por opción con argmin como respuesta, compuerta `--never-exit` (4 iteraciones completas). El autor advierte explícitamente que **no es comparable con cifras publicadas de MMLU**.
- No medido: comparación de precisión que aísle el efecto del bucle (tronco con bucle frente a sin bucle), perplejidad y KL frente a profundidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del checkpoint base Qwen3.8-27B (27B parámetros) y de la implementación ALoDLM, que ejecuta el bloque de capas 24-39 hasta cuatro veces, incrementando el coste de cómputo y activaciones respecto a una pasada única.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño del base, un despliegue en bf16 requeriría GPUs de clase A100/H100 con memoria suficiente para 27B parámetros más el estado del bucle.
- GPU de consumo: no disponible; no se documenta ninguna configuración validada en RTX 4090 u otras consumer.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma directa, ya que requiere la implementación de referencia `alodlm.model` y no un transformer estándar de Transformers. La carga vía PEFT falla en el import si el paquete ALoDLM no está disponible.
- Latencia y throughput: no disponibles; la ejecución forzada a profundidad 4 multiplica el coste del rango iterado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Estado |
|---|---|---|---|---|---|
| ALoDLM Qwen3.8-27B LoRA (1000 steps) | Adaptador LoRA rango 16 sobre base de 27B | 4096 (entrenamiento) | LoRA sobre tronco con bucle adaptativo | Apache-2.0 | Investigación preliminar, compuerta ausente |
| Qwen3.8-27B (base) | 27B | No disponible | Transformer denso multimodal nativo | Apache-2.0 | Público, sin gating |
| AMAImedia/Qwen3.8-27B-LoRA | Adaptador LoRA sobre Qwen3.8-27B | No disponible | LoRA convencional | No disponible | No disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la única medición del adaptador es el proxy de verosimilitud descrito arriba y no es equiparable a cifras de benchmarks publicadas.

## Limitaciones y advertencias

- La compuerta de salida (`exit_gate.pt`) no existe: la inferencia adaptativa por posición no funciona y solo se admite la evaluación con `--never-exit` a profundidad completa.
- Entrenamiento severamente incompleto: 1000 pasos, ≈1,19 M tokens, ~8 % de una época; el autor lo califica de infraentrenado y no convergido.
- La mejora de +3,51 puntos en el proxy MMLU no es estadísticamente significativa (p = 0,0598) y los intervalos de confianza se solapan; no debe citarse como mejora demostrada.
- No hay medición que aísle el efecto del bucle ni datos de perplejidad o KL frente a profundidad.
- No es un modelo autónomo: requiere el checkpoint base Qwen3.8-27B, la implementación ALoDLM y los ficheros del adaptador; `base_model_name_or_path` es `null` y PEFT no puede resolver el base desde el repositorio.
- Fuera de alcance: inferencia en producción, uso en sistemas críticos para la seguridad y cualquier aplicación que requiera garantías de calidad.
- Sesgos, riesgo de alucinación y comportamiento multilingüe no documentados; el corpus de entrenamiento es prosa genérica sin filtrado descrito.
- Licencia Apache-2.0 permite uso comercial del artefacto, pero las condiciones del modelo base deben verificarse por separado en su repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Aijuus/alodlm-qwen3.8-27b-lora-1000
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del base en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Adaptador LoRA alternativo: https://huggingface.co/AMAImedia/Qwen3.8-27B-LoRA
- Implementación de referencia ALoDLM: no disponible como enlace público (referenciada como `aijuus/looping/ALoDLM/alodlm/` en el proyecto ai-setups)
