# MANGSEOK123/qwen3-4b-tau2-oel-retail-taskaug-luna-n74-seed1

## Resumen

`qwen3-4b-tau2-oel-retail-taskaug-luna-n74-seed1` es un ajuste fino del modelo Qwen3-4B-Instruct-2507 desarrollado por el usuario MANGSEOK123. Se trata de un experimento de investigación centrado en la "internalización de habilidades" (skill internalization) sobre el benchmark tau2-bench en su dominio retail (v1.0.1), mediante una técnica de autodestilación on-policy (OPSD) implementada con el framework OEL de LMOps. El objetivo es que el modelo alumno aprenda a resolver tareas de atención al cliente retail sin necesidad de que la "habilidad" (skill) esté presente en el prompt del sistema, imitando el comportamiento de un profesor congelado que sí la tiene.

El modelo parte de la arquitectura Qwen3 de 4B parámetros en formato instruct (julio de 2025) y se entrena con 74 pares de tareas aumentadas generadas con GPT-5.6-Luna, seleccionados de un pool de 807 pares. El entrenamiento se realiza durante una época con 8 pares por actualización, usando una pérdida de divergencia KL inversa a nivel de token sobre los 256 tokens más probables del alumno. Es un artefacto de investigación muy específico, no un modelo de propósito general listo para producción.

La relevancia de esta ficha es doble: por un lado, documenta una técnica emergente de destilación on-policy aplicada a agentes conversacionales; por otro, sirve como referencia de que los ajustes finos de nicho sobre modelos pequeños (4B) pueden ser suficientes para dominios acotados como el retail. No obstante, la información pública es escasa (sin licencia declarada, sin idiomas, sin benchmarks publicados) y las descargas son cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), basada en Qwen/Qwen3-4B-Instruct-2507 |
| Parametros totales | 4.411.424.256 (4,41 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa prompt <= 8192 tokens y respuesta <= 1024 tokens por turno) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; se puede cuantizar a GGUF/AWQ por herramientas externas, pero no se declara soporte oficial) |
| Idiomas soportados | no disponible (el modelo base Qwen3 es multilingüe, pero el ajuste fino no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 4,41 B parámetros, heredado de Qwen3-4B-Instruct-2507. No se trata de un MoE ni de una arquitectura híbrida. El ajuste fino se realiza con el framework OEL (LMOps) mediante autodestilación on-policy (OPSD): el alumno (el propio modelo sin la skill en el prompt) juega cada tarea del benchmark tau2-bench retail con un simulador de usuario GPT-4.1-mini a temperatura 0,7, mientras un profesor congelado (copia del modelo inicial con la skill inyectada en el system prompt) genera las distribuciones objetivo.

El conjunto de entrenamiento consta de 74 pares de tareas aumentadas (skill x tareas generadas con GPT-5.6-Luna con utilidad = 1), seleccionados aleatoriamente con semilla 1 de un pool de 807 pares y emparejados por presupuesto con TANI (Matched). Se entrena 1 época con 8 pares por actualización. La pérdida es una KL inversa a nivel de token sobre los 256 tokens más probables del alumno, optimizada con AdamW (lr 3e-6 constante, weight decay 0,01, grad clip 1,0). Los límites por turno son prompt <= 8192 tokens y respuesta <= 1024 tokens. Los pesos se publican en BF16.

La innovación principal es el uso de destilación on-policy con profesor congelado y skill en el prompt, lo que permite internalizar comportamientos sin necesidad de RLHF ni de un dataset humano extenso. El tamaño del ajuste (74 pares, 1 época) sugiere un experimento de bajo coste computacional, probablemente reproducible en una sola GPU.

## Capacidades

- Generación de texto conversacional multi-turno en el dominio de atención al cliente retail (tau2-bench).
- Razonamiento de tareas agénticas: el modelo ha sido entrenado para resolver tareas de tipo retail sin skill explícita en el prompt, lo que implica cierta capacidad de planificación y ejecución de pasos.
- Internalización de habilidades: aprende a comportarse como si tuviera la skill inyectada, aunque no esté presente en el system prompt.
- Soporte de tool calling / function calling: no declarado explícitamente en la model card, pero el benchmark tau2-bench implica uso de herramientas y APIs; el modelo base Qwen3-Instruct sí soporta tool calling.
- Capacidades multilingües: no declaradas para este ajuste; el modelo base Qwen3 es multilingüe pero no se especifica el alcance tras el fine-tuning.
- Modo thinking: no declarado (Qwen3-Instruct-2507 no es un modelo de razonamiento explícito con modo thinking, a diferencia de otras variantes Qwen3).
- Visión y audio: no soportados (modelo de texto).

## Casos de uso

- **Investigación en destilación on-policy**: reproducir o extender el experimento OPSD sobre tau2-bench retail para estudiar cómo se internalizan habilidades sin prompt explícito. Es el caso de uso principal y para el que fue diseñado.
- **Atención al cliente automatizada en retail**: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 8192 tokens de prompt, suficiente para incorporar el histórico de la conversación y el catálogo de productos. Adecuado por su entrenamiento específico en tareas retail de tau2-bench.
- **Prototipado de agentes conversacionales de bajo coste**: al ser un modelo de 4B en BF16 (8,8 GB de repo), se puede desplegar en una GPU consumer (RTX 4090, 24 GB) y servir como base para agentes de dominio acotado antes de escalar a modelos mayores.
- **Evaluación de técnicas de skill internalization**: servir como baseline o punto de comparación en estudios sobre cómo los modelos pequeños internalizan habilidades de modelos mayores (GPT-5.6-Luna como generador de tareas, GPT-4.1-mini como simulador).
- **Generación de datos sintéticos para retail**: el modelo puede usarse para generar diálogos de atención al cliente con estructura de tarea (pedidos, devoluciones, cambios) que luego se filtren y se usen para entrenar otros modelos.
- **Pruebas de robustez en dominios acotados**: al estar entrenado con 74 pares y 1 época, es útil para estudiar sobreajuste, olvido catastrófico y generalización dentro del dominio retail.
- **Despliegue en entornos con recursos limitados**: con cuantización a 4 bits (no oficial, pero posible vía llama.cpp/GGUF) podría caber en GPUs de 8 GB, aunque no se declara soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de tau2-bench, MMLU, HumanEval ni GSM8K para este ajuste. El autor solo describe el proceso de entrenamiento (74 pares, 1 época, KL inversa top-256) sin reportar tasas de éxito en el benchmark objetivo.

## Requisitos de hardware

- **VRAM estimada para inferencia en BF16**: aproximadamente 8,8 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 12-16 GB para contexto largo (8192 tokens de prompt).
- **VRAM estimada en cuantización 8 bits**: ~4,5-5 GB de pesos; viable en GPUs de 8 GB con contexto moderado.
- **VRAM estimada en cuantización 4 bits**: ~2,5-3 GB de pesos; viable en GPUs de 6-8 GB, aunque no se declara soporte oficial de cuantización.
- **GPU recomendadas**: NVIDIA A100 (40/80 GB), H100 (80 GB) para serving de alta concurrencia; RTX 4090 (24 GB) para inferencia individual en BF16; RTX 3090 (24 GB) y RTX 4080 (16 GB) también suficientes en BF16 con contexto moderado.
- **¿Cabe en GPU consumer?**: sí, en RTX 4090/3090 (24 GB) en BF16, y en RTX 4060 Ti (16 GB) o RTX 3060 (12 GB) con cuantización 8 bits.
- **Opciones de despliegue**: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se declara soporte explícito para vLLM, llama.cpp u Ollama, aunque al ser safetensors estándar deberían funcionar con conversión.
- **Latencia y throughput**: no disponibles. Al ser un modelo de 4B, se espera un throughput alto en A100/H100 (cientos de tokens/s por réplica) y decenas de tokens/s en RTX 4090 en BF16, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-tau2-oel-retail-taskaug-luna-n74-seed1 | 4,41 B | no disponible (entrenado con prompt <= 8192) | no disponible | tau2-bench retail, skill internalization | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,41 B | 262 144 tokens (según Qwen3-4B-Instruct-2507) | Apache 2.0 (según Qwen) | Propósito general, instruct | Hugging Face, ampliamente usado |
| Qwen/Qwen3-4B (base original) | 4,0 B | 32 768 tokens (extensible) | Apache 2.0 | Propósito general | Hugging Face |
| Modelos tau2-bench retail comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se conocen otros ajustes finos públicos específicos de tau2-bench retail con la misma técnica OPSD en el momento de la consulta. La comparación más directa es con el modelo base Qwen3-4B-Instruct-2507, del que hereda arquitectura y tokenizador, pero del que difiere en el ajuste de dominio y en la licencia (el base es Apache 2.0; este ajuste no declara licencia).

## Limitaciones y advertencias

- **Licencia no disponible**: no se declara licencia, lo que impide asumir uso comercial. Aunque el modelo base Qwen3-4B-Instruct-2507 es Apache 2.0, el ajuste fino no hereda automáticamente esa licencia sin declaración explícita del autor.
- **Idiomas no declarados**: no se especifica qué idiomas mantiene tras el fine-tuning; el entrenamiento se realizó sobre tau2-bench retail, presumiblemente en inglés, lo que puede degradar el rendimiento multilingüe del base.
- **Riesgo de sobreajuste**: 74 pares de entrenamiento y 1 época sobre un pool de 807 pares es un ajuste muy pequeño; el modelo puede sobreajustar a las tareas específicas de tau2-bench retail y generalizar mal a otros dominios.
- **Riesgo de alucinación**: como todo modelo generativo, puede inventar información de productos, precios o políticas de devolución; en producción requiere validación contra fuentes de verdad.
- **Contexto limitado en entrenamiento**: aunque el base soporta contextos largos, el entrenamiento usa prompt <= 8192 y respuesta <= 1024 por turno; no se garantiza buen comportamiento más allá de esos límites.
- **Sin benchmarks publicados**: no hay evidencia cuantitativa de mejora sobre el base en tau2-bench ni en otras tareas; el autor no reporta tasas de éxito.
- **Cero descargas y cero likes**: el modelo no ha sido validado por la comunidad; no hay reportes independientes de calidad.
- **Artefacto de investigación**: el nombre incluye seed, número de pares y técnica, lo que sugiere que es un checkpoint experimental, no un modelo pulido para producción.
- **Dependencia del simulador**: el entrenamiento usa GPT-4.1-mini como simulador de usuario, lo que puede introducir sesgos del simulador en el comportamiento aprendido.
- **Sin garantía de soporte de tool calling**: aunque tau2-bench implica herramientas, la model card no declara explícitamente soporte de function calling tras el ajuste.

## Enlaces

- [Hugging Face: MANGSEOK123/qwen3-4b-tau2-oel-retail-taskaug-luna-n74-seed1](https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-retail-taskaug-luna-n74-seed1)
- [Modelo base: Qwen/Qwen3-4B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507)
- [tau2-bench (benchmark)](https://github.com/sierra-research/tau2-bench) — referencia del benchmark citado en la model card
- [OEL / LMOps (framework de entrenamiento)](https://github.com/microsoft/LMOps) — código base citado por el autor
- No se han encontrado papers, blogs, repos ni demos adicionales en la información proporcionada.
