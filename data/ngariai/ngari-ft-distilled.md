# NGARiAI/ngari-ft-distilled

## Resumen

NGARi FT Distilled (también etiquetado como Sovereign QA 1.5B) es un ajuste fino por destilación sobre Qwen/Qwen2.5-1.5B-Instruct, desarrollado por NGARiAI. Su función declarada es actuar como juez de seguridad de contenido y modelo de control de calidad (QA) en tiempo real dentro del sistema NGARi Sovereign Business Operating System (NS-BOS), donde cada respuesta de un agente pasa por este modelo antes de entregarse al usuario. El objetivo es disponer de un guardrail ejecutable en hardware de borde (aarch64, Jetson AGX Orin, 8 GB de RAM) sin dependencia de la nube.

El modelo tiene 1.543.714.304 parámetros (aproximadamente 1,5B) y hereda la arquitectura transformer densa de Qwen2.5, con una ventana de contexto que no se especifica en la información disponible. Se distribuye en tres formatos: pesos fusionados en safetensors, un adaptador LoRA PEFT y cuantizaciones GGUF (q4_K_M y f16) para Ollama y llama.cpp. La licencia es Apache 2.0 tanto para los artefactos propios como para el modelo base.

Su relevancia actual reside en la propuesta de "IA soberana": inferencia air-gapped verificada, entrenamiento sobre datos sintéticos generados por un profesor (qwen3:8b en la versión 1) y publicación de las ejecuciones de evaluación junto al modelo. No obstante, las métricas publicadas son modestas y el propio autor advierte que se trata de pruebas de humo, no de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), ajuste fino con LoRA |
| Parámetros totales | 1.543.714.304 (~1,5B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF q4_K_M, GGUF f16; safetensors en precisión original |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fusionado y adaptador PEFT), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso, y se ajusta mediante un adaptador LoRA de rango 32, alpha 64, dropout 0,05, aplicado sobre todas las proyecciones lineales. El adaptador está fijado en `adapter_config.json` y se distribuye junto a los pesos fusionados resultantes. El entrenamiento es una destilación: un modelo profesor (qwen3:8b en la versión 1; se prevé un profesor de clase 27B para la versión 2) genera trazas de razonamiento, datos sintéticos y juicios de evaluación que constituyen el corpus de destilación, publicado en el dataset NGARiAI/ngari-datasets.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La verificación de procedencia (3 de agosto de 2026) confirma que todo el entrenamiento usó la línea Qwen2.5 con licencia Apache 2.0 y que los modelos Gemma solo se sirvieron en hardware NGARi, sin participar en el entrenamiento. El hardware de validación es aarch64 / NVIDIA Jetson AGX Orin con 8 GB de RAM y air-gap verificado mediante monitorización de `/proc/net/dev`.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas (QA) en inglés.
- Juicio de seguridad de contenido: clasificación de respuestas de agentes como aptas o no antes de su entrega.
- Razonamiento básico sobre privacidad y despliegue local (p. ej., por qué la inferencia en dispositivo protege los datos).
- Detección de herramientas (tool detection) como capacidad secundaria, con rendimiento limitado: 60 % de detección, 55 % de acierto en el nombre de la herramienta y 60 % de validez de parámetros.
- Ejecución en modo air-gapped sobre hardware de borde sin conexión a la nube.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Guardrail de seguridad en producción: cada respuesta generada por un agente del sistema NS-BOS se envía a este modelo para su clasificación antes de la entrega, con una latencia media de 2,81 s por ejemplo en el hardware de referencia.
- Control de calidad en pipelines de agentes: filtrado de salidas que no cumplen las políticas de contenido definidas por la organización, ejecutado localmente para evitar enviar datos sensibles a la nube.
- Asistente de QA soberano en intranet: despliegue en un Jetson AGX Orin con 8 GB de RAM para responder preguntas sobre políticas internas y funcionamiento del sistema, sin salida a Internet.
- Verificación de privacidad y cumplimiento: generación de explicaciones sobre el tratamiento de datos en despliegues on-device, útil en documentación de cumplimiento y formación interna.
- Prototipado rápido en borde con Ollama: uso del GGUF q4_K_M para levantar un servicio de QA en cuestión de minutos en hardware ARM de bajos recursos.
- Base para ajuste específico de dominio: al incluir el adaptador LoRA y los pesos fusionados, sirve como punto de partida para reentrenar un juez de seguridad adaptado a las políticas concretas de una organización.
- Evaluación comparativa de pipelines de destilación: el repositorio incluye los JSON de evaluación, lo que permite reproducir y contrastar el comportamiento del estudiante frente al profesor.

## Benchmarks y rendimiento

| Evaluación | Métrica | Resultado |
|---|---|---|
| Chat quality (200 ejemplos) | Puntuación media | 0,3766 |
| Chat quality (200 ejemplos) | Latencia media | 2,81 s |
| Chat quality (200 ejemplos) | Throughput | 39,78 tokens/s |
| Chat quality (200 ejemplos) | Tiempo total | 561,98 s |
| Tool detection (20 ejemplos) | Tasa de detección de herramienta | 0,60 |
| Tool detection (20 ejemplos) | Acierto en nombre de herramienta | 0,55 |
| Tool detection (20 ejemplos) | Validez de parámetros | 0,60 |
| Tool detection (20 ejemplos) | Latencia media | 2,38 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El propio autor califica la evaluación de herramientas con 20 ejemplos como prueba de humo, no como benchmark.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,1 GB en fp16 para los 1,5B parámetros; en torno a 1 GB con la cuantización q4_K_M.
- Hardware validado por el autor: NVIDIA Jetson AGX Orin con 8 GB de RAM, arquitectura aarch64, en configuración air-gapped.
- GPU de servidor compatibles por tamaño: cualquier GPU con al menos 4 GB de VRAM (T4, L4, A10, RTX 3060 en adelante); A100 y H100 son sobredimensionadas para este modelo.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060, RTX 4090 y en iGPU con memoria unificada suficiente.
- Opciones de despliegue: Transformers (pesos fusionados), PEFT (adaptador sobre el modelo base), llama.cpp y Ollama (GGUF), text-generation-inference.
- Rendimiento observado: 39,78 tokens/s y 2,81 s de latencia media por ejemplo en el hardware de referencia (Jetson AGX Orin).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| NGARi FT Distilled | ~1,5B | No disponible | Apache 2.0 | QA y juez de seguridad destilado | Hugging Face, GGUF, Ollama |
| Qwen2.5-1.5B-Instruct | ~1,5B | No disponible en esta ficha | Apache 2.0 | Instruct generalista | Hugging Face, amplio ecosistema |
| NGARiAI/ngari-tool | No disponible | No disponible | No disponible | Tool calling (100 % en las tres métricas de su eval) | Hugging Face |

La comparación con modelos de la misma categoría (guardrails pequeños como Llama Guard o ShieldGemma) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento conversacional bajo: la puntuación media de 0,3766 sobre 200 ejemplos indica una calidad limitada fuera del dominio de destilación.
- Tool calling poco fiable: 60 % de detección y 55 % de acierto en el nombre; el autor recomienda explícitamente usar ngari-tool para esa función.
- Idiomas: solo inglés declarado; no hay evidencia de calidad en castellano ni en otros idiomas.
- Contexto: la longitud de ventana no se documenta, lo que impide planificar despliegues con conversaciones largas.
- Evaluaciones reducidas: 200 ejemplos para chat y 20 para herramientas; no son benchmarks representativos y no permiten extrapolar a producción.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo de 1,5B destilado, es esperable en preguntas fuera de dominio.
- Sesgos: no documentados por el autor.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen2.5-1.5B-Instruct, también Apache 2.0.
- Advertencia de producción: el modelo está diseñado como juez de seguridad, no como generador principal; usarlo como generador de cara al usuario final no es su propósito declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NGARiAI/ngari-tool (hermano de tool calling)
- Modelo en Hugging Face: https://huggingface.co/NGARiAI/ngari-ft-distilled
- Dataset de entrenamiento: https://huggingface.co/datasets/NGARiAI/ngari-datasets
- Repositorio del kernel soberano: https://github.com/NGARiAI/ns-bos-kernel
- Open Source Friday, edición 001: https://ngari.ai/open-source-friday
- Colección Open Source Friday: https://huggingface.co/collections/NGARiAI/open-source-friday-6b0a5e2732568212b40439a4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
