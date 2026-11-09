# harness-hub/LFM3-1.7B-pi-GGUF

## Resumen

LFM3-1.7B-pi-GGUF es la conversión a formato GGUF del adaptador LoRA `harness-hub/LFM3-1.7B-pi`, un ajuste fino por refuerzo (RL) sobre el modelo base LiquidAI/LFM3-1.7B. Lo publica el usuario `harness-hub` y está pensado para ejecutarse con llama.cpp, lo que permite desplegar el adaptador sobre una cuantización del modelo base en hardware modesto. El adaptador se entrenó dentro del agente de programación `pi` (earendil-works/pi) y su objetivo es mejorar la resolución de tareas de agente con un uso más eficiente de herramientas.

Según la model card, el adaptador resuelve 10,7 puntos porcentuales más de tareas que el modelo base y, en las tareas que ambos resuelven, emplea un 37 % menos de llamadas a herramientas. Es, por tanto, un artefacto orientado a flujos de agentes con tool calling, no un modelo generalista nuevo.

El fichero publicado (`LFM3-1.7B-harbor-pi-lora-F16.gguf`) contiene únicamente el adaptador en F16; requiere un GGUF del modelo base LFM3-1.7B (recomendado Q8_0) para funcionar. El repo ocupa 0,1 GB y el recuento de parámetros del safetensors asociado es de 32.937.472, coherente con el tamaño del adaptador y no con el del modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer LiquidAI LFM3-1.7B (detalles del base no disponibles en la informacion proporcionada) |
| Parametros totales | 32.937.472 (safetensors del adaptador; el modelo base no se especifica en la informacion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens en el ejemplo de despliegue (`-c 65536`); contexto nativo del base no disponible |
| Tipos de cuantizacion | Adaptador en F16; base recomendado Q8_0 (otras cuantizaciones del base no verificadas) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (`license: other`, enlace a LICENSE de LiquidAI/LFM3-1.7B) |
| Formato de pesos | GGUF (adaptador LoRA en F16, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con aprendizaje por refuerzo sobre el modelo LiquidAI LFM3-1.7B, dentro del agente de programación `pi`. La model card no detalla la arquitectura interna del base (tipo de atención, capas, dimensionalidad) ni el número de tokens o composición del dataset de RL; esa información se remite a la card del adaptador original (`harness-hub/LFM3-1.7B-pi`).

La conversión a GGUF se realizó con `convert_lora_to_gguf.py` de llama.cpp en `--outtype f16`, partiendo del adaptador PEFT. El adaptador se entrenó sobre los pesos BF16 del base, por lo que la card recomienda usar una cuantización lo más próxima posible a BF16 (Q8_0 como opción por defecto) para acercarse al comportamiento entrenado. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal u otras) en la información proporcionada.

## Capacidades

- Ejecución de tareas de agente dentro del agente de programación `pi` (instalable vía `pi install git:github.com/huggingface/pi-llama`).
- Tool calling / function calling: el ajuste por RL está orientado a reducir el número de llamadas a herramientas (37 % menos en tareas resueltas por ambos modelos).
- Razonamiento multi-paso orientado a completar tareas de agente (mejora de 10,7 puntos en tasa de resolución según la card).
- Integración con llama.cpp mediante `llama serve` y carga de LoRA (`--lora`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Agente de programación automatizado: desplegar el adaptador sobre LFM3-1.7B Q8_0 con `llama serve` y apuntar el agente `pi` al endpoint (`--model llama-cpp/lfm3-harbor-pi`) para tareas de edición y resolución de código con tool calling.
- Automatización de tareas con herramientas en local: el ajuste por RL reduce llamadas a herramientas, lo que abarata y acelera flujos de agente en máquinas sin GPU de gran capacidad.
- Prototipado de pipelines de agentes en CI: al ser un GGUF de bajo peso (adaptador de 0,1 GB) más un base de 1,7B, se puede levantar un servidor de inferencia ligero en runners con CPU o GPU modesta.
- Evaluación comparativa de adaptadores: usar el par base + LoRA frente al base solo para medir el efecto del RL en la tasa de éxito y en el número de tool calls.
- Despliegue en entornos con requisitos de licencia LFM: integrar el adaptador respetando la licencia lfm1.0 del modelo base en productos internos o de investigación.
- Experimentación con agentes de código de bajo coste: servir el modelo con contexto ampliado (`-c 65536`) para sesiones de edición de varios ficheros, aceptando la pérdida de fidelidad que introduce la cuantización del base.

## Benchmarks y rendimiento

La model card reporta dos métricas relativas al modelo base, medidas en vLLM a BF16 sobre el adaptador original:

| Metrica | Resultado |
|---|---|
| Tasa de resolucion de tareas vs. base | +10,7 puntos porcentuales |
| Llamadas a herramientas en tareas resueltas por ambos | -37 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, y la propia card advierte de que el fichero GGUF no ha sido reevaluado con llama.cpp.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un base de 1,7B en Q8_0 el peso ronda los 2 GB, más el adaptador F16 (0,1 GB) y la caché KV para 65.536 tokens, que puede ser el factor dominante.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, un base de 1,7B cabe en GPUs consumer (RTX 3060/4060/4090) y en muchas configuraciones solo CPU.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del base, aunque la card no lo confirma.
- Despliegue: llama.cpp (`llama serve` con `--lora`), según el ejemplo de la card; también `hf download` para obtener los ficheros.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| harness-hub/LFM3-1.7B-pi-GGUF (este) | Adaptador sobre base 1,7B (32.937.472 en safetensors del adaptador) | 65.536 en ejemplo de despliegue | +10,7 pts y -37 % tool calls vs. base (vLLM BF16, no reevaluado en GGUF) | lfm1.0 | GGUF para llama.cpp |
| harness-hub/LFM3-1.7B-pi (adaptador PEFT original) | Adaptador sobre base 1,7B | no disponible | Métricas de referencia del adaptador | lfm1.0 | PEFT |
| LiquidAI/LFM3-1.7B (base) | 1,7B (nominal) | no disponible | Línea base de la comparación | lfm1.0 | Pesos originales y GGUF (LiquidAI/LFM3-1.7B-GGUF) |

No se dispone de datos suficientes para comparar con otros adaptadores de agente de la misma categoría.

## Limitaciones y advertencias

- El fichero GGUF no ha sido reevaluado con llama.cpp; las métricas de la card provienen de vLLM en BF16 y una base cuantizada altera los resultados.
- El adaptador debe usarse sobre un GGUF del base; no es un modelo autónomo.
- La cuantización del base (Q8_0 recomendado) introduce desviaciones respecto al comportamiento entrenado en BF16.
- Licencia lfm1.0 (marcada como `other`): es necesario revisar el LICENSE de LiquidAI/LFM3-1.7B antes de uso comercial.
- Idiomas soportados no documentados; riesgo de comportamiento degradado fuera del inglés.
- Riesgo de alucinación y de tool calls incorrectas inherente a modelos de 1,7B; la reducción del 37 % de llamadas no elimina errores.
- Sin descargas ni likes en el momento de la consulta; artefacto de terceros sin validación independiente.
- Sesgos conocidos: no documentados en la información proporcionada.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/harness-hub/LFM3-1.7B-pi-GGUF
- Adaptador original: https://huggingface.co/harness-hub/LFM3-1.7B-pi
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUF del base: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Licencia: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Agente pi: https://github.com/earendil-works/pi
- llama.cpp: https://github.com/ggml-org/llama.cpp
