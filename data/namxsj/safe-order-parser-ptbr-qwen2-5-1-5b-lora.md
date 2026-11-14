# namxsj/safe-order-parser-ptbr-qwen2.5-1.5b-lora

## Resumen

El modelo `safe-order-parser-ptbr-qwen2.5-1.5b-lora` es un adaptador LoRA desarrollado por namxsj (Mariana Moura) sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. Su función es convertir mensajes informales de pedidos de comida a domicilio en portugués de Brasil en JSON estructurado, extrayendo categorías de producto, restricciones alimentarias, alertas de salud, precio, plazo y número de comensales, además de clasificar la intención del mensaje en cuatro categorías: `pedido`, `fora_escopo`, `emergencia` o `ataque`.

El adaptador resuelve un problema concreto de seguridad alimentaria en sistemas de delivery: la necesidad de interpretar lenguaje natural coloquial y detectar menciones de alergias o situaciones de emergencia antes de que un pedido llegue a un operador humano. Se apoya en el modelo base Qwen2.5-1.5B-Instruct, un transformer de 1.500 millones de parámetros, y añade un adaptador de bajo rango entrenado específicamente para esta tarea.

Es relevante por su enfoque en seguridad (detección de emergencias y ataques), por la publicación de una evaluación rigurosa con intervalos de confianza y validación pre-registrada, y por su transparencia sobre las limitaciones del sistema. El repositorio ocupa 0,1 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA sobre proyecciones de atención y MLP |
| Parametros totales | No disponible (modelo base Qwen2.5-1.5B-Instruct: 1.500 millones; adaptador LoRA: no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-1.5B-Instruct, no especificada en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Portugués de Brasil (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal. El LoRA tiene rango 16, alpha 32 y dropout 0,05, y se aplica en todas las proyecciones de atención y MLP. El entrenamiento se realizó durante 2 épocas con tasa de aprendizaje 2e-4 y decaimiento coseno, lote efectivo de 16 (4 × 4 de acumulación) y gradient checkpointing, en una GPU T4 durante 42 minutos. La pérdida de validación fue de 0,041 en la primera época y 0,022 en la segunda.

Los datos de entrenamiento consisten en 3.685 ejemplos sintéticos generados por plantillas, con etiqueta por construcción. No se menciona el uso de RLHF ni DPO. El adaptador fue entrenado con una instrucción de sistema específica del repositorio; sin ella, la salida no sigue el esquema JSON esperado.

## Capacidades

- Extracción de entidades estructuradas: categorías de producto, restricciones alimentarias, alerta de salud, precio, plazo y número de personas.
- Clasificación de intención en cuatro clases: `pedido`, `fora_escopo`, `emergencia` y `ataque`.
- Generación de JSON validable contra un esquema Pydantic definido en el repositorio.
- Detección de alertas de salud (alergias, celiaquía, etc.) con recall de 34/42 en el conjunto de evaluación.
- Detección de emergencias (29/30) y de ataques (27/30).
- Procesamiento de una sola mensaje por inferencia (no multi-turno).
- No se menciona soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Filtro de seguridad previo a la gestión de pedidos: el adaptador clasifica la intención y detecta emergencias y ataques antes de que el mensaje llegue a un operador, actuando como primera barrera en un pipeline de atención al cliente.
- Extracción de restricciones alimentarias: en un sistema de delivery, el modelo identifica menciones de alergias o dietas (celiaquía, lactosa, etc.) y las marca para validación por un sistema separado, reduciendo el riesgo de pedidos incompatibles.
- Enrutamiento de mensajes fuera de alcance: los mensajes clasificados como `fora_escopo` se derivan automáticamente a un agente humano o a un buzón específico, evitando que el parser intente procesarlos.
- Detección de intentos de manipulación: la clase `ataque` permite identificar mensajes maliciosos o intentos de inyección de prompt en el canal de pedidos.
- Estructuración de pedidos para sistemas de gestión: el JSON generado (categorías, precio, plazo, comensales) puede alimentar directamente un sistema de gestión de pedidos tras validación contra el esquema.
- Estudio y demostración de pipelines híbridos: el adaptador se puede combinar con reglas deterministas para extraer campos y usar el modelo solo para clasificación de intención, como se evalúa en la validación pre-registrada del repositorio.
- Investigación sobre robustez en dominios verticales: sirve como caso de estudio de ajuste fino de un modelo pequeño (1.5B) para una tarea de extracción estructurada en un idioma y dominio concretos.

## Benchmarks y rendimiento

Evaluación sobre 641 frases de test congeladas antes de la evaluación, con intervalos de confianza del 95% entre corchetes. El conjunto principal tiene 438 frases; los demás conjuntos son de otro autor (100), humano (30) y mensajes reales (63).

| Métrica | Reglas | Qwen sin ajuste | Qwen + 8 ejemplos | Este adaptador |
|---|---|---|---|---|
| Acierto exacto, conjunto principal (438) | 66% [62–71] | 3% [2–6] | 20% [16–24] | 66% [62–70] |
| Acierto exacto, otro autor (100) | 52% [42–62] | 10% [6–17] | 18% [12–27] | 23% [16–32] |
| Acierto exacto, humano (30) | 50% [33–67] | 13% [5–30] | 23% [12–41] | 40% [25–58] |
| Acierto exacto, mensajes reales (63) | 38% [27–50] | 3% [1–11] | 21% [12–32] | 29% [19–41] |
| JSON válido en el esquema | 100% | 46% | 64% | 94% |
| Alerta de salud (recall) | 41/42 | 3/42 | 16/42 | 34/42 |
| Emergencia detectada | 17/30 | 0/30 | 6/30 | 29/30 |
| Ataque detectado | 15/30 | 0/30 | 0/30 | 27/30 |
| Campos inventados en pedido vago | 3/32 | 19/32 | 12/32 | 18/32 |

Validación pre-registrada sobre 78 frases nuevas: un sistema híbrido (adaptador para clasificar intención + reglas para extraer campos) obtuvo 49% de acierto exacto, frente a 38% de las reglas solas y 37% del adaptador solo. La diferencia no es estadísticamente concluyente (McNemar exacto, p = 0,057 contra reglas y p = 0,078 contra el adaptador).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base Qwen2.5-1.5B-Instruct es un modelo pequeño que, en fp16, requiere aproximadamente 3 GB, y el adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: el entrenamiento se realizó en una GPU T4; para inferencia es suficiente una GPU consumer moderna.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 4-8 GB de VRAM (GTX 1660, RTX 3060, RTX 4060, etc.), aunque no se especifican requisitos exactos.
- Opciones de despliegue: la model card muestra uso con `transformers` + `peft`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, aunque al ser un adaptador PEFT sobre Qwen2 es compatible con el ecosistema estándar de transformers.
- Latencia y throughput: no disponibles. El entrenamiento duró 42 minutos en una T4, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card compara el adaptador con el modelo base sin ajuste, con el modelo base con 8 ejemplos en el prompt y con un baseline de reglas, pero no con otros adaptadores o modelos de la misma categoría.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| safe-order-parser-ptbr-qwen2.5-1.5b-lora | 1.500 M (base) + LoRA | No disponible | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1.500 M | No disponible | Apache 2.0 | Hugging Face |
| Baseline de reglas | No aplica | No aplica | No disponible | Repositorio GitHub |

## Limitaciones y advertencias

- Pierde la alerta de salud en 8 de 42 casos, por lo que no puede ser la única barrera para alergias.
- Clasifica algunos pedidos comunes como ataque o fuera de alcance (falsos positivos en las clases `ataque` y `fora_escopo`).
- Entrenado únicamente con datos sintéticos; la evaluación con datos humanos es escasa (30 frases).
- Inventa categorías y deseos que la persona no ha dicho: 18 de 32 casos de pedido vago con campos inventados.
- El 6% de las salidas usan valores fuera del esquema JSON.
- Procesa una sola mensaje por inferencia; no soporta conversaciones multi-turno.
- No sustituye a un sistema de moderación de seguridad.
- Requiere la instrucción de sistema del repositorio; sin ella, la salida no sigue el esquema.
- Uso previsto limitado a demostración y estudio; no apto para decisiones reales sobre alergias o salud ni para detección de emergencias en producción sin validación de la salida.
- Idioma limitado al portugués de Brasil.

## Enlaces

- Hugging Face: https://huggingface.co/namxsj/safe-order-parser-ptbr-qwen2.5-1.5b-lora
- Repositorio GitHub: https://github.com/marianamourapy/safe-order-parser-ptbr
- Datos de entrenamiento: https://github.com/marianamourapy/safe-order-parser-ptbr/tree/main/data/train
- Registro de entrenamiento: https://github.com/marianamourapy/safe-order-parser-ptbr/blob/main/results/training_log.json
- Análisis de errores: https://github.com/marianamourapy/safe-order-parser-ptbr/blob/main/results/error_analysis.md
- Pre-registro de la validación: https://github.com/marianamourapy/safe-order-parser-ptbr/blob/main/PREREGISTRATION.md
- Limitaciones (README): https://github.com/marianamourapy/safe-order-parser-ptbr#limitações
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- GitHub de la autora: https://github.com/marianamourapy
- LinkedIn de la autora: https://www.linkedin.com/in/marianamourapy
