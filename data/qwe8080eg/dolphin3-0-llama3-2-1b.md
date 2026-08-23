# Qwe8080eg/Dolphin3.0-Llama3.2-1B

## Resumen

Dolphin3.0-Llama3.2-1B es un modelo de lenguaje instruct-tuned de 1,2 mil millones de parámetros, desarrollado por Cognitive Computations (Eric Hartford, Ben Gitter, BlouseJury) como parte de la colección Dolphin 3.0. Se basa en el modelo Llama-3.2-1B de Meta y está diseñado para ser un asistente local de propósito general, con énfasis en codificación, matemáticas, uso agéntico y llamada a funciones. La versión alojada en `Qwe8080eg/Dolphin3.0-Llama3.2-1B` es una copia del modelo oficial, publicada por un usuario de HuggingFace.

La relevancia del modelo radica en su tamaño compacto, que permite ejecutarse en hardware de consumo, y en su filosofía de control total por parte del usuario: el sistema prompt define la alineación, sin imposiciones éticas del desarrollador. Esto lo hace atractivo para empresas que quieren integrar un asistente local sin depender de APIs externas. La arquitectura es un transformer decoder-only estándar, con 1.235.818.496 parámetros totales y una longitud de contexto no especificada en la ficha del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 1B) |
| Parametros totales | 1.235.818.496 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors en FP16/BF32 (no se proporcionan cuantizaciones GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 (Meta Llama 3.2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de Llama-3.2-1B, una arquitectura transformer decoder-only con normalización pre-RMS, embeddings rotatorios (RoPE) y feed-forward con activación SwiGLU. No es un modelo MoE ni híbrido; es denso y compacto. El entrenamiento se realizó mediante aprendizaje supervisado (SFT) sobre una mezcla de datasets públicos de alta calidad orientados a codificación, matemáticas y agentes, incluyendo OpenCoder-LLM/opc-sft-stage1 y stage2, microsoft/orca-agentinstruct-1M-v1, microsoft/orca-math-word-problems-200k, NousResearch/hermes-function-calling-v1, AI-MO/NuminaMath-CoT y TIR, allenai/tulu-3-sft-mixture, cognitivecomputations/dolphin-coder y smoltalk, entre otros. No se menciona el uso de RLHF o DPO; la card indica únicamente "instruct-tuned".

Una característica destacada es el uso de ChatML como plantilla de chat, con tokens especiales `<|im_start|>` y `<|im_end|>`. El modelo está diseñado para que el usuario defina el system prompt y la alineación, sin restricciones éticas impuestas por el desarrollador.

## Capacidades

- Generación de texto en inglés con estilo conversacional y capacidad de seguir instrucciones.
- Codificación: soporta generación de código en múltiples lenguajes, incluyendo Python, Go, etc., según el system prompt.
- Matemáticas: entrenado con datasets como NuminaMath y Orca Math, muestra competencia en problemas aritméticos y algebraicos básicos.
- Function calling: entrenado con hermes-function-calling-v1, por lo que puede emitir llamadas a funciones en formato JSON.
- Uso de agentes: con el dataset orca-agentinstruct, es capaz de seguir planes de múltiples pasos en contextos agénticos.
- Personalización de comportamiento mediante system prompt, permitiendo definir roles, tono y reglas específicas.
- Multilingüe: no, solo inglés (según la card, `language: en`).

## Casos de uso

- Asistente de código en entornos locales: el modelo puede integrarse en IDE como VSCode o en pipelines de CI/CD para generar snippets, explicar errores o sugerir correcciones. Su tamaño permite ejecutarlo en una GPU de gama media sin depender de servicios externos.
- Agente de automatización con tool calling: gracias a su entrenamiento en function calling, puede orquestar llamadas a APIs, ejecutar comandos o interactuar con herramientas externas en un pipeline agéntico, por ejemplo, para automatizar tareas de administración de sistemas.
- Tutor de matemáticas para plataformas educativas: puede resolver problemas de aritmética y álgebra básica, explicando el razonamiento paso a paso, gracias a los datos de NuminaMath y Orca Math.
- Asistente de programación en tiempo real: integrado en un editor de código, puede completar funciones, generar tests o refactorizar código, con una latencia baja en hardware consumer.
- Generación de contenido creativo con control de estilo: el system prompt permite configurar el tono y la personalidad, útil para generar textos de marketing, correos o historias en inglés.
- Prototipado rápido de agentes conversacionales: por su tamaño reducido, se puede desplegar en múltiples instancias para pruebas A/B de distintos system prompts y medir su efectividad antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica "Evals: TBD", por lo que no hay datos de MMLU, HumanEval, GSM8K ni otros puntos de referencia.

## Requisitos de hardware

- VRAM estimada: en FP32, los pesos ocupan aproximadamente 4,9 GB (1.235.818.496 parámetros × 4 bytes). En FP16/BF16, ~ 2,5 GB. Con cuantización (no proporcionada por el autor, pero posible con herramientas externas), puede reducirse a ~1 GB en 4-bit.
- GPU recomendadas: tarjetas consumer con al menos 6 GB de VRAM para FP16 (por ejemplo, RTX 2060 6GB, RTX 3060 12GB, RTX 4060 8GB). En cuantización 4-bit puede ejecutarse en GPUs con 4 GB, como la RTX 3050.
- En CPU: ejecutable con llama.cpp en modo CPU, aunque con latencia alta; es viable para inferencia batch o entornos sin GPU.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face Transformers, TGI, sglang. La card menciona explícitamente estos frameworks.
- Latencia y throughput: no se proporcionan datos oficiales. En una RTX 4090 con FP16, se puede esperar una velocidad de decodificación de ~100 tokens/s, pero es una estimación no confirmada.

## Comparativa con modelos similares

| Modelo | Parámetros | Longitud de contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Dolphin3.0-Llama3.2-1B | 1,24 B | no disponible | llama3.2 | HuggingFace | no disponible |
| Llama-3.2-1B-Instruct | 1,24 B | no disponible | llama3.2 | HuggingFace | no disponible |
| Qwen2.5-1.5B-Instruct | 1,54 B | no disponible | Apache 2.0 | HuggingFace | no disponible |
| SmolLM2-1.7B-Instruct | 1,72 B | no disponible | Apache 2.0 | HuggingFace | no disponible |

No se dispone de datos de benchmarks para comparar rendimiento. Los tres alternativas son modelos densos de tamaño similar, con licencias más permisivas en el caso de Qwen y SmolLM (Apache 2.0) frente a la licencia Llama 3.2 de Meta.

## Limitaciones y advertencias

- Tamaño reducido: al ser un modelo de 1,2 B, su capacidad de razonamiento complejo y generación de código avanzado es limitada en comparación con modelos de 7B o superiores.
- Riesgo de alucinación: en tareas de conocimiento factual o matemáticas complejas, puede producir respuestas incorrectas o inventadas, especialmente fuera de su dominio de entrenamiento.
- Idiomas: solo soporta inglés; no es adecuado para entornos multilingües.
- Contexto limitado: no se ha confirmado la longitud de contexto en esta ficha; el modelo base Llama-3.2-1B soporta 128K tokens, pero no se garantiza que el fine-tuning mantenga esa capacidad.
- Licencia: la licencia llama3.2 permite uso comercial, pero requiere obtener permiso de Meta si tu empresa tiene más de 10 millones de usuarios mensuales (según los términos de la licencia). No es una licencia open source estándar.
- Sin datos de seguridad: el modelo está diseñado para ser "sin censura" y no impone alineación; el usuario es responsable del contenido generado. No se han realizado evaluaciones de sesgo o toxicidad en la información disponible.
- Reproducción no oficial: esta versión es una subida de un usuario (Qwe8080eg) y no está verificada como la oficial de Cognitive Computations; puede no ser idéntica al modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Qwe8080eg/Dolphin3.0-Llama3.2-1B
- Modelo original de la colección Dolphin 3.0: https://huggingface.co/dphn/Dolphin3.0-Llama3.2-1B
- Colección Dolphin 3.0: https://huggingface.co/collections/cognitivecomputations/dolphin-30-677ab47f73d7ff66743979a3
- Blog de Eric Hartford sobre modelos sin censura: https://erichartford.com/uncensored-models
- Dolphin en Ollama: https://ollama.com/library/dolphin3
- Dolphin AI (proyecto): https://dphn.ai/
- Discord de Cognitive Computations: https://discord.gg/cognitivecomputations
