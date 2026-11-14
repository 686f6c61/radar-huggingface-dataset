# 360ZhiNao/TinyR1-Safety-8B

## Resumen

TinyR1-Safety-8B es un modelo de lenguaje de 8.190 millones de parámetros desarrollado por 360ZhiNao (Qihoo 360), obtenido mediante fine-tuning supervisado (SFT) sobre Qwen/Qwen3-8B. Su objetivo es unificar múltiples comportamientos de seguridad —guía positiva, exposición de riesgos y rechazo— en un único modelo, activables dinámicamente mediante señales de control ligeras denominadas "magic tokens" en el prompt de sistema. Esto evita tener que desplegar varios modelos especializados para distintos escenarios de moderación y permite control post-despliegue de forma granular.

La propuesta técnica se apoya en tres pilares: autodestilación de datos a partir de múltiples comportamientos de seguridad, co-entrenamiento alineado mediante magic tokens y control de generación garantizado en inferencia. Además, extiende los magic tokens para representar políticas regionales (por ejemplo, `policy:en-US` y `policy:zh-CN`), como exploración preliminar de control de seguridad culturalmente consciente.

El modelo es relevante porque aborda un problema práctico en producción: los pipelines de seguridad multi-etapa son costosos y poco controlables una vez desplegados. Con un único checkpoint de 8B y licencia Apache 2.0, ofrece una alternativa ligera para equipos que necesitan alternar entre modo seguro estricto y modo de adherencia estricta sin cambiar de modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-8B) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B, un transformer decoder-only denso de aproximadamente 8.2 mil millones de parámetros, y se somete a un único stage de SFT que co-entrena varios comportamientos de seguridad simultáneamente. La innovación principal es el uso de "magic tokens" en el system prompt que activan dinámicamente el comportamiento deseado: `Safety Mode: Positive` para preguntas sensibles, con variantes `policy:cn` y `policy:en` para políticas regionales, y `Adherence mode: Strict adherence` para consultas no relacionadas con seguridad.

El pipeline de datos se basa en autodestilación a partir de múltiples comportamientos de seguridad, generando ejemplos que cubren guía positiva, exposición de riesgos y rechazo. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO adicionales. La evaluación se realiza con un modelo juez interno que asigna puntuaciones de 0 a 2 por respuesta (riesgo, rechazo o cumplimiento constructivo seguro), normalizadas en una métrica denominada Constructive Safety Score.

## Capacidades

- Generación de texto en inglés y chino con alineamiento de seguridad configurable.
- Control dinámico de comportamiento de seguridad mediante magic tokens en el system prompt (modo positivo, exposición de riesgos, rechazo).
- Selección de política regional mediante tokens `policy:cn` y `policy:en`, como exploración preliminar de control culturalmente consciente.
- Modo de adherencia estricta (`Adherence mode: Strict adherence`) para consultas no sensibles, evitando rechazos innecesarios.
- Cumplimiento constructivo: el modelo está optimizado para responder de forma segura y útil en lugar de rechazar sistemáticamente.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito.

## Casos de uso

- Moderación y generación segura en asistentes conversacionales: el modelo puede activarse en `Safety Mode: Positive` para gestionar consultas sensibles con respuestas constructivas en lugar de rechazos vacíos, reduciendo la fricción en atención al usuario.
- Despliegue multi-región con políticas diferenciadas: usando `policy:cn` o `policy:en` en el system prompt, un mismo checkpoint sirve para mercados con normativas de contenido distintas, simplificando el mantenimiento de infraestructura.
- Filtrado y reescritura de contenido generado por otros LLM: el modelo puede recibir texto potencialmente dañino y producir una versión segura y constructiva, integrándose como capa de post-procesado.
- Evaluación interna de seguridad: dado su alto rendimiento en benchmarks como AdvBench, HarmBench y StrongREJECT, puede usarse como generador de referencia en pipelines de red-teaming y evaluación de alineamiento.
- Chatbot educativo o divulgativo: en modo de adherencia estricta responde a consultas técnicas sin sobre-rechazar, adecuado para plataformas donde la seguridad debe equilibrarse con utilidad.
- Investigación en alineamiento y control de comportamiento: los magic tokens ofrecen un mecanismo ligero y reproducible para estudiar cómo un mismo modelo alterna entre políticas de seguridad, útil en laboratorios que experimentan con control post-despliegue.
- Atención al cliente en chino e inglés: el soporte bilingüe permite cubrir mercados asiáticos y anglosajones con un solo modelo de 8B, desplegable en una GPU de 24 GB con cuantización.

## Benchmarks y rendimiento

Resultados reportados por el autor con el Constructive Safety Score (escala normalizada 0-100, mayor es mejor):

| Modelo | Avg | AdvBench | AI-BENCH | BeaverTails | HarmBench | HarmEval | HarmfulQA | JBB-Behaviors | nvidiaAegis2.0 | S-Eval_base | S-Eval_attack | StrongREJECT | wildjailbreak | XSTest |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen3-8B (/no_think) | 75.9 | 60.7 | 78.7 | 84.6 | 62.0 | 90.2 | 86.4 | 61.5 | 84.6 | 90.3 | 65.3 | 69.3 | 66.9 | 86.1 |
| Qwen3-32B (/no_think) | 75.4 | 58.0 | 73.5 | 86.1 | 56.8 | 89.8 | 89.3 | 63.3 | 84.8 | 90.9 | 69.2 | 63.6 | 65.4 | 89.2 |
| Llama-3.1-Nemotron-Nano-8B-v1 (Reasoning Off) | 73.0 | 59.8 | 76.9 | 85.0 | 56.2 | 89.0 | 88.4 | 64.3 | 82.3 | 74.8 | 53.3 | 78.1 | 54.2 | 86.6 |
| Meta-Llama-3.1-8B-Instruct (no reasoning) | 62.1 | 51.6 | 59.2 | 74.3 | 50.5 | 69.6 | 57.4 | 65.4 | 75.5 | 62.3 | 56.5 | 52.6 | 53.2 | 79.6 |
| DeepSeek-R1-0528-Qwen3-8B (only reasoning) | 77.9 | 76.9 | 78.9 | 85.7 | 58.0 | 85.7 | 88.7 | 66.2 | 88.2 | 84.3 | 70.9 | 74.0 | 67.5 | 87.6 |
| gpt-oss-120B (low) | 62.2 | 50.4 | 63.9 | 68.6 | 49.0 | 68.1 | 58.6 | 64.3 | 74.8 | 67.5 | 63.3 | 50.6 | 54.8 | 74.9 |
| gpt-oss-120B (medium) | 62.8 | 50.7 | 64.3 | 69.3 | 50.5 | 67.0 | 58.8 | 66.2 | 74.7 | 65.9 | 67.0 | 51.0 | 55.5 | 75.4 |
| gpt-oss-120B (high) | 63.3 | 51.4 | 64.2 | 70.4 | 50.8 | 68.9 | 59.2 | 66.3 | 75.5 | 66.3 | 65.5 | 51.6 | 56.2 | 76.1 |
| **TinyR1-Safety-8B (/no_think)** | **97.7** | **99.0** | **97.8** | **98.9** | **95.3** | **99.9** | **100.0** | **93.5** | **98.4** | **98.7** | **95.0** | **96.3** | **97.9** | **99.4** |

Nota: la métrica es propietaria (evaluador interno del autor) y mide cumplimiento constructivo seguro, no rendimiento general. No se reportan benchmarks estándar de conocimiento o razonamiento (MMLU, GSM8K, HumanEval) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16-17 GB de pesos, más overhead de activaciones y KV cache; se recomienda GPU con 24 GB o más.
- Cuantización a 8 bits: aproximadamente 8-9 GB de pesos, cabe en GPUs consumer de 12-16 GB.
- Cuantización a 4 bits: aproximadamente 4-5 GB de pesos, cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y superiores.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en BF16 con concurrencia; RTX 4090 (24 GB) para inferencia single-GPU en BF16; RTX 3090/4080 para cuantización 8 bits.
- Opciones de despliegue: transformers (referencia del autor), vLLM, TGI, llama.cpp/Ollama previa conversión a GGUF (no se proporcionan pesos GGUF en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| TinyR1-Safety-8B | 8.19B | no disponible | en, zh | Apache 2.0 | Seguridad unificada con magic tokens |
| Qwen3-8B | ~8.2B | no disponible | multilingüe | Apache 2.0 | Modelo base generalista |
| Llama-3.1-Nemotron-Nano-8B-v1 | ~8B | no disponible | en | Llama 3.1 Community | Alineamiento y seguridad de NVIDIA |
| DeepSeek-R1-0528-Qwen3-8B | ~8B | no disponible | en, zh | MIT (según modelo base) | Razonamiento destilado |
| gpt-oss-120B | ~120B (MoE) | no disponible | multilingüe | no disponible | Modelo abierto de gran escala |

En la métrica propietaria del autor, TinyR1-Safety-8B supera ampliamente a todos los comparadores (Avg 97.7 frente a 77.9 del mejor alternativo). Esta ventaja debe interpretarse con cautela porque la métrica la define el propio autor y mide cumplimiento constructivo seguro, no capacidad general.

## Limitaciones y advertencias

- La evaluación se basa en un modelo juez interno del autor y una métrica propietaria; los resultados no son directamente comparables con benchmarks públicos estándar.
- No se reportan resultados en MMLU, GSM8K, HumanEval ni otras pruebas de capacidad general, por lo que se desconoce si el fine-tuning de seguridad degradó habilidades del modelo base.
- Solo se declaran idiomas inglés y chino; el rendimiento en castellano u otros idiomas no está documentado.
- La longitud de contexto no se especifica en la información disponible; conviene verificar la del modelo base Qwen3-8B antes de desplegar en producción.
- Riesgo de alucinación no cuantificado; al ser un modelo de 8B, se espera una tasa mayor que en modelos de mayor escala.
- El control por magic tokens depende de que el prompt de sistema se respete; prompts de usuario maliciosos podrían intentar sobrescribir el modo activo.
- El soporte de políticas regionales (`policy:cn`, `policy:en`) se describe como exploración preliminar, no como característica madura.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en dominios regulados.
- El repositorio no incluye pesos GGUF ni cuantizaciones oficiales; la conversión y validación corren a cargo del usuario.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que carece de validación independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/360ZhiNao/TinyR1-Safety-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Paper (arXiv): https://arxiv.org/abs/2508.14904
- Sitio oficial del laboratorio: https://ai.360.com/lab/
