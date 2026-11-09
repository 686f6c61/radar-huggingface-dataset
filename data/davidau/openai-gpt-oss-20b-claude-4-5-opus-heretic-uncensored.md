# DavidAU/OpenAI-gpt-oss-20B-Claude-4.5-Opus-Heretic-Uncensored

## Resumen

OpenAI-gpt-oss-20B-Claude-4.5-Opus-Heretic-Uncensored es un ajuste fino (fine-tune) del modelo gpt-oss-20b de OpenAI, publicado por el usuario DavidAU en Hugging Face. Parte del modelo base `coder3101/gpt-oss-20b-heretic`, una variante del gpt-oss-20b original a la que se le ha aplicado la técnica de "abliteración" o decensurado mediante la herramienta Heretic, eliminando buena parte de los rechazos (refusals) del modelo original. Sobre esa base, DavidAU ha aplicado un ajuste fino supervisado con el dataset `TeichAI/claude-4.5-opus-high-reasoning-250x`, orientado a transferir patrones de razonamiento de alto nivel.

El modelo conserva la arquitectura original de gpt-oss-20b (transformer tipo Mixture-of-Experts con aproximadamente 21.000 millones de parámetros totales según los pesos en safetensors) y una ventana de contexto declarada de 128.000 tokens. Su propósito es ofrecer un modelo de razonamiento conversacional sin filtros de contenido ("no nanny, no guardrails"), pensado para generación creativa, rol y experimentación con contenido que los modelos alineados rechazarían.

Es relevante ahora por dos motivos: por un lado, ejemplifica la práctica creciente de ajustes finos comunitarios sobre modelos abiertos de OpenAI; por otro, documenta explícitamente métricas de decensurado (divergencia KL de 0,2933 y 19 rechazos de cada 100 frente a 98 de cada 100 del modelo original). El autor advierte que es un trabajo en curso ("work in progress") y que el modelo puede entrar en bucles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Mixture-of-Experts (gpt_oss), según tags de Hugging Face |
| Parametros totales | 20.914.757.184 (≈20,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 128.000 tokens (según model card) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; el autor remite a su colección de fuentes para GGUF, EXL2, AWQ, GPTQ, HQQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura gpt_oss del gpt-oss-20b original de OpenAI, que según los tags de Hugging Face corresponde a un transformer con mezcla de expertos (MoE). No se dispone en la información proporcionada del número de parámetros activos por token, del número de expertos ni de la configuración interna de capas y cabezas de atención.

El proceso de construcción tiene tres etapas documentadas: primero, el modelo base `coder3101/gpt-oss-20b-heretic` aplica la herramienta Heretic para eliminar rechazos (abliteración); después, DavidAU realiza un ajuste fino con Unsloth sobre el dataset `TeichAI/claude-4.5-opus-high-reasoning-250x`, que contiene 250 ejemplos de razonamiento de alta calidad generados con Claude 4.5 Opus. El objetivo declarado es sustituir parcialmente el razonamiento nativo de gpt-oss por el estilo de razonamiento de Claude Opus. El autor indica que el ajuste también corrige parte de los problemas derivados del decensurado. No se especifican el número de tokens de entrenamiento, la composición completa del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional y de razonamiento con modo "thinking" (el autor sugiere etiquetas `<think>` y `</think>` en el system prompt).
- Razonamiento de alta densidad transferido del dataset de Claude 4.5 Opus High Reasoning.
- Generación de contenido sin filtros: el modelo no rechaza peticiones de contenido explícito, violento o soez, aunque el autor advierte que en algunos casos requiere indicaciones explícitas para alcanzar el nivel de crudeza deseado.
- Generación creativa y roleplay: la model card incluye ajustes recomendados de muestreo (smoothing factor 1,5, rep pen 1,02-1,1 en modo estándar y 1,1-1,15 en modo creativo).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita, aunque el modo thinking sugiere capacidad de razonamiento encadenado.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Generación creativa de ficción sin restricciones: el modelo puede producir narrativa de terror, violencia explícita o contenido para adultos que los modelos alineados rechazarían; el autor recomienda indicar explícitamente el vocabulario o el tono deseado para evitar respuestas demasiado tibias.
- Roleplay conversacional en herramientas como Silly Tavern, KoboldCpp o text-generation-webui: la model card detalla ajustes de muestreo específicos (smoothing, rep pen) para mantener coherencia en conversaciones largas y evitar bucles.
- Experimentación con técnicas de decensurado y abliteración: útil para investigadores que estudian el efecto de eliminar el alignment sobre el comportamiento del modelo, con métricas de divergencia KL y tasa de rechazos documentadas.
- Prototipado de asistentes de escritura con tono adulto o humor negro: el modelo acepta system prompts de personalidad (el autor incluye un ejemplo con el Joker de Batman) y mantiene el personaje entre turnos.
- Generación de diálogos para videojuegos o narrativa interactiva con contenido mature: la ventana de 128k tokens permite mantener contexto de escena y personajes a lo largo de sesiones extensas, siempre que se gestione el riesgo de bucle.
- Investigación sobre transferencia de estilos de razonamiento: permite comparar el razonamiento nativo de gpt-oss con el inyectado desde el dataset de Claude 4.5 Opus, útil para estudiar cómo se comporta un fine-tune pequeño (250 ejemplos) sobre un modelo de 21B.
- Evaluación de robustez y seguridad: sirve como caso de estudio de modelo sin guardrails para probar clasificadores de contenido, filtros de salida o sistemas de moderación en pipelines de producción.

## Benchmarks y rendimiento

La model card incluye únicamente métricas de decensurado, no benchmarks estándar de razonamiento o conocimiento.

| Metrica | Este modelo | openai/gpt-oss-20b (original) |
|---|---|---|
| Divergencia KL | 0,2933 | 0 (por definición) |
| Rechazos (refusals) | 19/100 | 98/100 |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 42 GB solo para pesos, más overhead de contexto; requiere GPU de 80 GB (A100, H100) o reparto multi-GPU.
- Cuantización a 8 bits: en torno a 21-25 GB de VRAM; cabe en una RTX 4090 (24 GB) con contexto limitado o en A6000 (48 GB) con holgura.
- Cuantización a 4 bits (GGUF Q4, GPTQ, AWQ): aproximadamente 12-14 GB; cabe en RTX 4090, RTX 3090, RTX 4080 y GPUs consumer de 16 GB o más.
- El repositorio ocupa 41,9 GB en safetensors; para cuantizaciones GGUF/EXL2/AWQ/GPTQ el autor remite a su colección de fuentes.
- Opciones de despliegue: transformers (librería declarada), llama.cpp y Ollama para GGUF, text-generation-webui (con loader llama_HF para GGUF), KoboldCpp y Silly Tavern para chat/roleplay. vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (DavidAU) | ≈20,9B | 128k | Apache 2.0 | Fine-tune decensurado con razonamiento de Claude 4.5 Opus |
| openai/gpt-oss-20b | ≈20,9B (según pesos del original) | 128k (según gpt-oss) | Apache 2.0 | Modelo original alineado, 98/100 rechazos |
| coder3101/gpt-oss-20b-heretic | ≈20,9B | 128k | Apache 2.0 (heredada) | Base decensurada mediante Heretic, sin el fine-tune de razonamiento |
| TeichAI/claude-4.5-opus-high-reasoning-250x | no aplica (dataset) | no aplica | no disponible | Dataset de 250 ejemplos usado para el ajuste |

No se dispone de datos de rendimiento comparativo en benchmarks para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El autor califica el modelo como "work in progress" y advierte explícitamente de que "not everything may work correctly" y de que "may loop" (puede entrar en bucles de generación).
- Modelo decensurado: no aplica guardrails ni rechazos, lo que lo hace inadecuado para aplicaciones de cara al público sin capas adicionales de moderación.
- La abliteración introduce una divergencia KL de 0,2933 respecto al original, lo que implica degradación medible del comportamiento original; el autor afirma que el fine-tune posterior corrige parte de los daños, pero no cuantifica cuánto.
- Sesgos conocidos: no documentados en la información disponible; al estar entrenado principalmente en inglés y con un dataset de razonamiento de 250 ejemplos, es probable que herede sesgos del modelo base y del dataset, pero no hay análisis publicado.
- Riesgo de alucinación: no cuantificado; el modo thinking y el ajuste con pocos ejemplos pueden aumentar la confianza en respuestas incorrectas.
- Idiomas: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de origen pueden imponer condiciones adicionales no detalladas en la información disponible.
- El contenido generado puede ser explícito, violento u ofensivo; el despliegue en producción requiere filtros de salida y advertencias claras al usuario.
- Para GGUF en text-generation-webui el autor indica que es necesario usar el loader llama_HF con archivos de configuración de la versión fuente, lo que añade complejidad operativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/OpenAI-gpt-oss-20B-Claude-4.5-Opus-Heretic-Uncensored
- Modelo base: https://huggingface.co/coder3101/gpt-oss-20b-heretic
- Modelo original de OpenAI: https://huggingface.co/openai/gpt-oss-20b
- Dataset de ajuste: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Perfil del autor: https://huggingface.co/DavidAU
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Colección de archivos fuente para cuantizaciones: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Página de soporte/FAQs del autor: https://huggingface.co/DavidAU/support
