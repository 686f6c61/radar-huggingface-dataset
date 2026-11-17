# notfakerv/coder-lfm3-1.7b-k3.1-pro-heretic-wsp-v2-GGUF

## Resumen

`coder-lfm3-1.7b-k3.1-pro-heretic-wsp-v2-GGUF` es una edición de pesos sin entrenamiento (training-free) del modelo `AJ-Gonzalez/coder-lfm3-1.7b-k3.1-pro-heretic`, publicado por el usuario notfakerv. Parte de LFM3-1.7B de Liquid AI, sobre el que se aplicó una destilación LoRA de un corpus coder (Kimi k3.1-pro) y posteriormente una eliminación de rechazos mediante Heretic 2.0.0. El resultado es un modelo de 1.728 millones de parámetros orientado a generación de código y razonamiento, con licencia LFM Open License v1.0.

El problema que aborda esta release es concreto: el modelo padre, con el modo thinking activado, rara vez cierra el bloque `</think>` y por tanto no entrega respuesta final. Según la model card, con un presupuesto de 8k tokens el modelo bf16 respondió 0 de 30 prompts de código cotidiano, y con 32k tokens 61 de 100 prompts terminaron en bucle de repetición. Esta edición aplica dos actualizaciones de rango uno sobre las proyecciones de salida de la MLP en cinco capas para forzar el cierre del bloque de pensamiento y para evitar que la deliberación se filtre en la respuesta final.

La relevancia es doble: por un lado demuestra una técnica de edición de pesos (weight-space programming) que corrige un fallo de comportamiento sin gradientes ni datos de entrenamiento; por otro, ofrece un GGUF Q4_K_M de 1,1 GB listo para llama.cpp y LM Studio, lo que lo hace desplegable en hardware de consumo. Solo se distribuye la cuantización Q4_K_M, la única evaluada por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (LFM3 de Liquid AI), edición de pesos en proyecciones MLP |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (recomendado por el autor) |
| Tipos de cuantización | Q4_K_M (única disponible en este repo) |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (uso comercial solo para entidades con ingresos anuales inferiores a 10 M USD) |
| Formato de pesos | GGUF (Q4_K_M) |
| Tamaño del repo | 1,1 GB |
| Modelo base | AJ-Gonzalez/coder-lfm3-1.7b-k3.1-pro-heretic |
| Modelo original | LiquidAI/LFM3-1.7B |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LFM3 de Liquid AI (transformer de 1.700 millones de parámetros). Sobre esa base, el autor del modelo padre aplicó una destilación LoRA sobre un corpus de código generado con Kimi k3.1-pro, y posteriormente una eliminación de rechazos mediante Heretic 2.0.0. Esta release no entrena: aplica dos ediciones de rango uno sobre las proyecciones de salida de la MLP (`ffn_down`, `model.layers.N.feed_forward.w2`) en los bloques 6, 8, 10, 12, 14, 15, 17, 19, 21 y 23.

La primera edición ("finish thinking") se calcula como la media del estado residual sobre los últimos 48 tokens de pensamiento antes de `</think>`, menos el resto del pensamiento, con signo positivo y fuerza +0,10. La segunda ("no second-guessing") se obtiene del estado justo antes de una frase de verificación ("wait,", "let me double-check", etc.), menos el resto, proyectando fuera el componente genérico de inicio de frase. La dirección se extrae de las propias activaciones del modelo original, siguiendo el método de weight-space programming descrito en el working paper de Concept Country (2026). No se usaron gradientes, datos de entrenamiento ni fine-tuning.

Un detalle técnico relevante: la cuantización Q4_K_M amplifica el efecto de la edición de finish-thinking respecto a 16 bits, y las fuerzas se calibraron específicamente en Q4_K_M. El autor advierte que otras cuantizaciones de la misma edición no han sido probadas. La plantilla de chat, el tokenizador y los valores de muestreo embebidos son los del modelo padre.

## Capacidades

- Generación de texto y código en inglés, con modo thinking activado por defecto.
- Razonamiento multi-paso dentro del bloque `</think>`, con cierre garantizado del bloque tras la edición.
- Generación de código en el estilo del corpus de destilación (Kimi k3.1-pro coder).
- Respuesta a prompts de programación cotidiana y problemas tipo HumanEval+/MBPP.
- Conversación multi-turno (pipeline `conversational`).
- Compatible con endpoints (tag `endpoints_compatible`).
- Sin capacidades multimodales, de audio ni de visión documentadas.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.
- Modelo abliterated: no rechaza peticiones que el LFM3 original declinaría.

## Casos de uso

- **Asistente de código en local para desarrolladores individuales**: con 1,1 GB en Q4_K_M y 32k de contexto, se puede ejecutar en un portátil con GPU de consumo mediante LM Studio o llama.cpp, ofreciendo autocompletado y explicación de fragmentos sin enviar código a la nube.
- **Generación de tests unitarios**: el modelo responde a problemas tipo HumanEval+/MBPP (mediana de 2,8k tokens de pensamiento en MBPP), por lo que puede generar funciones y casos de prueba a partir de una firma o descripción.
- **Integración en pipelines de CI/CD como revisor de parches**: al ser un GGUF servible con `llama-server`, se puede exponer como endpoint HTTP interno y usarlo para resumir diffs o señalar errores evidentes en pull requests, sin coste de API.
- **Prototipado rápido de agentes de código**: la ventana de 32k y la compatibilidad con endpoints permiten conectarlo a frameworks de agentes para tareas de refactorización acotadas, aceptando la limitación de que no se documenta tool calling nativo.
- **Educación y aprendizaje de programación**: el modelo puede explicar conceptos y resolver ejercicios en inglés con razonamiento visible, útil en entornos docentes donde se quiere inspeccionar el proceso de pensamiento.
- **Investigación en edición de pesos**: los ficheros `wsp/edit_1_finish_thinking.json` y `wsp/edit_2_no_second_guessing.json` documentan normas por capa, cambio relativo y hashes de dirección, lo que permite reproducir o extender el método en otros modelos.
- **Evaluación de robustez y seguridad**: al ser abliterated, sirve como caso de estudio de cómo la eliminación de rechazos interactúa con ediciones de comportamiento, útil para investigadores de alineación.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) con puntuaciones comparativas. Solo se reportan métricas de comportamiento del proceso de pensamiento:

| Métrica | Modelo padre (bf16) | Este modelo (Q4_K_M) |
|---|---|---|
| Prompts de código cotidiano respondidos (presupuesto 8k) | 0 de 30 | no disponible |
| Prompts que terminan en bucle de repetición (presupuesto 32k) | 61 de 100 | no disponible |
| Mediana de tokens de pensamiento (prompts cotidianos) | no disponible | ~0,5k |
| Mediana de tokens de pensamiento (MBPP) | no disponible | ~2,8k |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: en torno a 1,5-2 GB para el GGUF Q4_K_M con contexto moderado; el contexto de 32k incrementa el uso de KV cache y puede requerir 3-4 GB adicionales según configuración.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM para contexto corto; RTX 3060/4060 o superiores para 32k de contexto. Funciona también en CPU.
- **Consumer GPU**: sí, cabe holgadamente en RTX 4090, RTX 3090, RTX 4070, RTX 3060 y similares; también en Apple Silicon vía Metal.
- **Despliegue**: llama.cpp (build 11969 probado), LM Studio (runtime CUDA 12 de llama.cpp 2.73.0 probado). No se documenta soporte en vLLM ni TGI para este GGUF.
- **Latencia y throughput**: no disponibles en la información proporcionada.
- **Configuración recomendada de llama-server**: `-c 32768 -ngl 99 --temp 0.1 --top-k 50 --top-p 0.95 --min-p 0.05 --repeat-penalty 1.1 --repeat-last-n 64 --reasoning-format deepseek`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| coder-lfm3-1.7b-k3.1-pro-heretic-wsp-v2 (este) | 1,73B | 32k | LFM Open v1.0 (comercial <10M USD) | GGUF Q4_K_M | Abliterated, thinking corregido |
| LiquidAI/LFM3-1.7B | 1,7B | no disponible | LFM Open v1.0 | safetensors, GGUF | Modelo original, rechaza peticiones |
| AJ-Gonzalez/coder-lfm3-1.7b-k3.1-pro-heretic | 1,73B | no disponible | LFM Open v1.0 | no disponible | Padre directo; falla al cerrar `</think>` |
| AJ-Gonzalez/coder-lfm3-1.7b-k3.1-pro | 1,73B | no disponible | LFM Open v1.0 | no disponible | Destilado coder sin abliteration |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría (por ejemplo, Qwen2.5-Coder-1.5B o DeepSeek-Coder-1.3B) en la información proporcionada.

## Limitaciones y advertencias

- **Modelo abliterated**: no restaura los rechazos del LFM3 original; cumplirá peticiones que el modelo base declinaría. Uso bajo responsabilidad del desplegador.
- **Solo inglés**: el tag de idioma es `en`; no se garantiza calidad en castellano ni en otros idiomas.
- **Riesgo de alucinación**: inherente a modelos de 1,7B; el modo thinking puede dar falsa sensación de rigor.
- **Solo Q4_K_M evaluado**: otras cuantizaciones no han sido probadas y el efecto de las ediciones puede diferir; el autor advierte que Q4_K_M amplifica la edición de finish-thinking respecto a 16 bits.
- **Contexto recomendado de 32k**: a 8k, la versión v1 agotaba espacio en aproximadamente un cuarto de los problemas de HumanEval+ antes de responder.
- **Licencia restrictiva**: uso comercial solo para entidades con ingresos anuales inferiores a 10 M USD (sección 5 de la LFM Open License v1.0).
- **Obligación de notificación de modificación** (sección 4b): se debe indicar que los pesos `ffn_down` de los bloques 6, 8, 10, 12, 14, 15, 17, 19, 21 y 23 fueron editados y que se cambiaron los campos `general.name` y `general.description` del GGUF.
- **Sin garantía**: el autor declara explícitamente ausencia de garantía.
- **Sin soporte documentado de tool calling**: no se confirma function calling nativo, lo que limita su uso en agentes que dependan de esa capacidad.
- **Repositorio sin tracción**: 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/notfakerv/coder-lfm3-1.7b-k3.1-pro-heretic-wsp-v2-GGUF
- Modelo padre: https://huggingface.co/AJ-Gonzalez/coder-lfm3-1.7b-k3.1-pro-heretic
- Destilado coder: https://huggingface.co/AJ-Gonzalez/coder-lfm3-1.7b-k3.1-pro
- Modelo original Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Heretic: https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Working paper de weight-space programming: https://concept.country/research/weight-space-programming
- Código de weight-space programming: https://github.com/conceptcountry/weight-space-programming
