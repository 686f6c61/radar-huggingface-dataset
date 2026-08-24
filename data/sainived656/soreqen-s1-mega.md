# sainived656/soreqen-s1-mega

## Resumen

SoreQen S1 Mega es un asistente conversacional bilingüe (inglés/hinglish) desarrollado por ZorQelis AI, resultado de un ajuste fino con LoRA (r=16) sobre el modelo base Qwen/Qwen3.5-4B de Alibaba Cloud. El entrenamiento se realizó sobre 25.080 ejemplos supervisados centrados en la identidad del asistente y en conversación bilingüe, con la particularidad de que el encoder de visión, el proyector multimodal y las tablas de embeddings permanecieron congelados e idénticos al modelo base. El modelo hereda intactas la ventana de contexto de 262.144 tokens, el vocabulario de 248.320 entradas, el modo de pensamiento, el tool calling y la salida estructurada.

Su relevancia principal reside en que la identidad del asistente queda grabada en los pesos del modelo, de modo que responde correctamente a su identidad incluso sin system prompt (6/6 aciertos frente a 0/6 del modelo base), y en que ofrece conversación natural en hinglish (hindi en escritura romanizada), un registro de uso masivo en la India. Con 4,54 mil millones de parámetros y licencia Apache 2.0, está disponible en formato safetensors y GGUF, lo que permite desplegarlo tanto en GPU de consumo como en entornos de producción con cuantización.

El modelo se publica bajo el nombre de ZorQelis AI en el repositorio de HuggingFace de sainived656, con una versión hermana más pequeña (SoreQen S1 Mini, 0.8B) que comparte la misma metodología de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen/Qwen3.5-4B) con adaptador LoRA r=16 |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF disponible (tipos no especificados en la informacion disponible) |
| Idiomas soportados | Ingles, hinglish (hindi en escritura romanizada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (repo de cuantizacion) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, una arquitectura transformer multimodal con encoder de visión y proyector. El ajuste fino aplica una única adaptación de bajo rango (LoRA, r=16) sobre el modelo de lenguaje, entrenada con 25.080 ejemplos supervisados que cubren identidad del asistente y conversación bilingüe. No se utilizó RLHF ni DPO; es un ajuste supervisado clásico.

Una característica técnica destacable es que el entrenamiento dejó deliberadamente intactos el encoder de visión, el proyector multimodal, las tablas de embeddings, el chat template, el tokenizador y el vocabulario (248.320 tokens). Tampoco se tocaron los datos de entrenamiento relacionados con thinking mode, tool calling ni salida estructurada, por lo que esas capacidades se heredan tal cual del modelo base. La identidad del asistente se probó sin system prompt, demostrando que está incrustada en los pesos y no depende del prompt del sistema.

## Capacidades

- Generacion de texto bilingüe en inglés y hinglish (hindi en escritura romanizada), con adaptación al registro del usuario (informal con informal, profesional con profesional).
- Conversación multi-turno con identidad persistente del asistente (SoreQen S1 Mega de ZorQelis AI), incluso sin system prompt.
- Razonamiento paso a paso mediante thinking mode heredado del modelo base (activable con `enable_thinking=True`).
- Tool calling y function calling heredados del modelo base, sin datos de entrenamiento adicionales.
- Salida estructurada (JSON, formatos definidos) heredada del modelo base.
- Capacidades multimodales de visión heredadas del modelo base (encoder congelado durante el entrenamiento; no se verificó su rendimiento posterior).
- Instrucción directa sin preámbulos: el modelo está entrenado para responder primero con la respuesta y luego con los detalles relevantes.

## Casos de uso

- Atención al cliente en hinglish: el modelo puede gestionar conversaciones multi-turno en hinglish con contexto largo (hasta 262K tokens), ideal para soporte técnico en mercados de habla hindi donde el registro informal romanizado es la norma.
- Chatbot de marca con identidad persistente: gracias a que la identidad está en los pesos, se puede desplegar un asistente con personalidad de marca sin depender de un system prompt, lo que reduce el riesgo de inyección de prompts que alteren la identidad.
- Agente con tool calling para automatización de tareas: hereda la capacidad de invocar herramientas del modelo base, por lo que puede integrarse en pipelines de automatización que requieran llamadas a APIs o ejecución de acciones.
- Razonamiento paso a paso con thinking mode: activando el modo de pensamiento se obtienen respuestas con razonamiento explícito, útil para tareas de análisis, depuración o explicación de conceptos técnicos.
- Generación de contenido bilingüe: adecuado para producir textos en inglés y hinglish de forma consistente, por ejemplo para marketing, documentación o redes sociales en mercados indios.
- Prototipado rápido de asistentes conversacionales: su licencia Apache 2.0 y su tamaño de 4B permiten experimentar con bajo coste en entornos de desarrollo y validar flujos de conversación antes de escalar a modelos mayores.

## Benchmarks y rendimiento

El autor publicó una comparativa interna entre el modelo con el adaptador activado y desactivado (es decir, el modelo base Qwen/Qwen3.5-4B), con dos ejecuciones por configuración a la misma semilla. Los resultados son los siguientes:

| Dimension | SoreQen | Base | Veredicto |
|---|---|---|---|
| Identidad (con system prompt) | 6/6 | 6/6 | Igual |
| Identidad (sin system prompt) | 6/6 | 0/6 | Mejor |
| Hinglish roman | 12/12 | 12/12 | Igual |
| Hinglish code-mixed | 8/12 | 9/12 | Peor |
| Hinglish informativo | 10/12 | 11/12 | Peor |
| Hinglish artefacto | 3/3 | 3/3 | Igual |
| Razonamiento | 5/5 | 4/5 | Mejor |
| Conocimiento | 4/4 | 4/4 | Igual |
| Thinking | 2/2 | 2/2 | Igual |
| Tool calling | 2/2 | 1/2 | Mejor |
| Salida estructurada | 2/2 | 2/2 | Igual |
| Seguimiento de instrucciones | 2/2 | 2/2 | Igual |
| Longitud media de respuesta | 114 palabras | 97 palabras | Más larga |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 9,1 GB según LLM Explorer para el modelo completo en el repositorio safetensors.
- GPU recomendadas: cualquier GPU con 10 GB o más de VRAM. En entornos de consumo, una RTX 3080 (10 GB), RTX 3090 (24 GB) o RTX 4090 (24 GB) es suficiente para el modelo completo. En entornos de producción, A100 (40/80 GB) o H100.
- Con cuantización GGUF, el modelo puede caber en GPU de consumo con 6-8 GB de VRAM, dependiendo del nivel de cuantización elegido (no se especifican los tipos concretos en el repositorio GGUF).
- Opciones de despliegue: transformers (con `device_map="auto"`), vLLM, llama.cpp, Ollama (vía GGUF), y TGI. El repositorio GGUF está preparado para llama.cpp.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Identidad sin prompt | Hinglish roman | Tool calling |
|---|---|---|---|---|---|---|
| SoreQen S1 Mega | 4,54B | 262.144 | Apache 2.0 | 6/6 | 12/12 | 2/2 |
| Qwen/Qwen3.5-4B (base) | 4,54B | 262.144 | Apache 2.0 | 0/6 | 12/12 | 1/2 |
| SoreQen S1 Mini | 0,8B | no disponible | Apache 2.0 | no disponible | no disponible | no disponible |

La comparativa directa con el modelo base muestra que la única diferencia sustancial es la identidad persistente y una mejora ligera en razonamiento y tool calling, a costa de una ligera pérdida en hinglish code-mixed e informativo. El S1 Mini, la versión hermana de 0,8B, comparte metodología pero con menos parámetros y menor VRAM (1,7 GB).

## Limitaciones y advertencias

- Los modelos pequeños tienden a afirmar números con confianza sin poder verificarlos; el autor advierte explícitamente que las cifras de precios, tasas o aritmética no deben tomarse como fiables.
- La salida en hinglish está diseñada exclusivamente en escritura romanizada; el modelo no genera Devanagari.
- El entrenamiento está orientado a conversación, no a asesoramiento profesional ni a tareas críticas de seguridad.
- El rendimiento en hinglish code-mixed e informativo es ligeramente inferior al del modelo base (8/12 y 10/12 frente a 9/12 y 11/12 respectivamente).
- Las capacidades de visión, tool calling y thinking mode se heredan del modelo base sin entrenamiento específico; su rendimiento no está verificado en esta versión.
- No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo concreto.
- El uso en producción requiere validar el comportamiento del adaptador LoRA en escenarios reales, dado que la evaluación del autor es interna y limitada.

## Enlaces

- Modelo principal (HuggingFace): https://huggingface.co/sainived656/soreqen-s1-mega
- Repositorio GGUF cuantizado: https://huggingface.co/sainived656/soreqen-s1-mega-GGUF
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Ficha en LLM Explorer (SoreQen S1 Mega): https://llm-explorer.com/model/sainived656%2Fsoreqen-s1-mega,5trtUWUedFnWhCe6lgoCTn
- Ficha en LLM Explorer (SoreQen S1 Mini): https://llm-explorer.com/model/sainived656%2Fsoreqen-s1-mini,3lW7NRh8msRLhRxtCDH1HD
