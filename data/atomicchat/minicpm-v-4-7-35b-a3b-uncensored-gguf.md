# AtomicChat/MiniCPM-V-4.7-35B-A3B-Uncensored-GGUF

## Resumen

MiniCPM-V-4.7-35B-A3B-Uncensored-GGUF es una versión cuantizada en formato GGUF del modelo multimodal MiniCPM-V-4.7-35B-A3B de OpenBMB, publicada por AtomicChat. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 34.659.889.792 parámetros totales, orientado a tareas de imagen-texto-a-texto (image-text-to-text), es decir, comprensión de imágenes combinada con generación de lenguaje natural.

La particularidad de esta publicación es que no se limita a cuantizar el modelo original: aplica una técnica de "abliteration" (eliminación de la dirección de rechazo) sobre los pesos, de modo que el modelo deja de negarse a responder ante prompts que el modelo base rechazaría. El autor reporta que las negativas caen del 96,3% al 0% en inglés en un conjunto de prompts retenidos, mientras que la puntuación en MMLU varía solo +0,25 puntos (de 84,25% a 84,50%).

El repositorio ofrece tres builds GGUF ya "horneados" con la modificación aplicada (AD-Q4_K-IQ4_XS de 20,1 GB, AD-Q5_K-Q4_K de 22,1 GB y AD-Q6_K de 29,1 GB) y un adaptador LoRA de rango 1 de 106 MB que puede aplicarse sobre cualquier cuantización del modelo original. Está pensado para ejecutarse localmente con llama.cpp, incluyendo GPUs de consumo con 24 GB de VRAM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer; multimodal image-text-to-text |
| Parámetros totales | 34.659.889.792 (≈34,66B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de despliegue usa `-c 32768`) |
| Tipos de cuantización | AD-Q4_K-IQ4_XS (20,1 GB), AD-Q5_K-Q4_K (22,1 GB), AD-Q6_K (29,1 GB); atención, experto compartido, embedding y cabeza de salida en q8_0; proyector visual en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo único por build) + adaptador LoRA en GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts (MoE) de OpenBMB, con unos 34,66 mil millones de parámetros totales y enrutamiento hacia expertos especializados (el nombre "A3B" sugiere del orden de 3B parámetros activos, aunque el dato exacto no se confirma en la información disponible). Es multimodal: procesa imágenes mediante un proyector visual separado (mmproj en F16) y genera texto, con soporte de plantilla de chat propia que activa un modo de razonamiento ("thinking") por defecto.

Sobre esa base, AtomicChat aplica una técnica de abliteración: calcula una "dirección de rechazo" (refusal direction) a partir de la diferencia de activaciones y la proyecta fuera de los pesos originales. El resultado se distribuye de dos formas: pesos ya modificados en los tres builds GGUF, o un adaptador LoRA de rango 1 con 120 sitios de aplicación y 106 MB que reproduce la misma edición sobre cualquier cuantización del modelo original. Las métricas publicadas comparan el modelo original en BF16 frente al ablacionado en BF16: divergencia KL media de 0,0090 en prompts neutros y 0,0095 en código, y coincidencia top-1 del 94,47% (Q4_K-IQ4_XS), 94,84% (Q5_K-Q4_K) y 96,15% (Q6_K) respecto al original sin modificar.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activable o desactivable por petición mediante `chat_template_kwargs`.
- Comprensión de imágenes (image-text-to-text): entrada conjunta de imagen y texto con el proyector visual F16.
- Tool calling / function calling: el autor reporta 20/20 llamadas válidas en su conjunto de prueba de 20 casos, tanto en el original como en el ablacionado.
- Razonamiento multi-paso: el modo thinking permite trazas de razonamiento extensas (el autor mide trazas sin cerrar a 3072 tokens).
- Manejo de contexto largo: el autor reporta 3/3 aciertos en la prueba de "needle in a long context" a tres profundidades.
- Respuesta sin rechazos ante prompts que el modelo base rechazaría (abliteración), manteniendo el resto de capacidades según las métricas del autor.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente multimodal local en estación de trabajo: con el build AD-Q4_K-IQ4_XS (20,1 GB) cabe en una GPU de 24 GB y permite conversaciones con imágenes y contexto largo sin depender de la nube.
- Análisis de documentación técnica escaneada: el modelo recibe capturas o páginas de manuales y responde preguntas sobre su contenido, aprovechando la ventana de contexto extendida del despliegue de ejemplo (32.768 tokens).
- Agentes con tool calling: las 20/20 llamadas válidas reportadas lo hacen adecuado para pipelines de agentes que encadenan funciones y razonamiento multi-paso.
- Investigación sobre alineación y seguridad: la versión ablacionada y el LoRA permiten estudiar el efecto de eliminar la dirección de rechazo con métricas públicas de divergencia KL y MMLU.
- Evaluación comparativa de cuantizaciones: los tres builds con métricas KLD y top-1 publicadas permiten medir el compromiso entre tamaño en disco y fidelidad al modelo original en un mismo hardware.
- Generación de código asistida con contexto visual: el autor reporta KLD de 0,0095 en prompts de código, por lo que puede integrarse en entornos de desarrollo que requieran interpretar diagramas o capturas junto al código.
- Despliegue en servidor con llama.cpp: `llama-server` con `--jinja` y `-ngl 99` sirve el modelo como endpoint compatible con la API de chat, apto para prototipos internos.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (modelo original frente a ablacionado, ambos en BF16, sobre prompts no usados para seleccionar nada):

| Métrica | Original | Ablacionado |
|---|---|---|
| JBB harmful behaviours (EN, 81), rechazos | 96,3% | 0% |
| XSTest prompts seguros (250), rechazos | 7,6% | 0% |
| Thinking activado (30 prompts), rechazos | 43% | 0% |
| Thinking activado, trazas sin cerrar a 3072 tokens | 16 de 30 | 0 de 30 |
| MMLU (2000 preguntas) | 84,25% | 84,50% (+0,25; McNemar p = 0,52) |
| Tool calls (20) | 20/20 válidas | 20/20 válidas |
| Needle in a long context (3 profundidades) | 3/3 | 3/3 |
| KLD media al original (neutro / código) | — | 0,0090 / 0,0095 |

Fidelidad de las cuantizaciones respecto al BF16 original sin modificar:

| Build | Tamaño en disco | KLD media | Coincidencia top-1 |
|---|---|---|---|
| AD-Q4_K-IQ4_XS | 20,1 GB | 0,0232 | 94,47% |
| AD-Q5_K-Q4_K | 22,1 GB | 0,0191 | 94,84% |
| AD-Q6_K | 29,1 GB | 0,0109 | 96,15% |

Comparación con las mismas disposiciones de cuantización del modelo sin modificar: Q4_K-IQ4_XS 0,0197 / 94,94%; Q5_K-Q4_K 0,0150 / 95,47%; Q6_K 0,0061 / 97,18%. No se han publicado resultados de benchmarks estándar adicionales (HumanEval, GSM8K, MMMU) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el build AD-Q4_K-IQ4_XS (20,1 GB) está pensado para tarjetas de 24 GB con margen para contexto largo; AD-Q5_K-Q4_K (22,1 GB) requiere al menos 24 GB; AD-Q6_K (29,1 GB) requiere 32 GB o más.
- GPU recomendadas: RTX 4090 / RTX 3090 (24 GB) para el build Q4; A100 40 GB, H100 o RTX 6000 Ada para Q6_K.
- Cabe en GPU de consumo: sí, el build Q4_K-IQ4_XS en tarjetas de 24 GB; los builds mayores exigen 32 GB o más.
- Opciones de despliegue: llama.cpp (versión igual o posterior a `69f201a`, que añade soporte de MiniCPM-V 4.7) mediante `llama-server`; requiere descargar además el proyector visual `mmproj-MiniCPM-V-4.7-35B-A3B-Uncensored-F16.gguf`. El adaptador LoRA se aplica con `--lora-scaled` a escala 1.0.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B-Uncensored (este) | 34,66B totales (MoE) | no disponible | Apache 2.0 | GGUF + LoRA | Ablacionado; MMLU 84,50% |
| MiniCPM-V-4.7-35B-A3B (original, OpenBMB) | 34,66B totales (MoE) | no disponible | Apache 2.0 | safetensors / GGUF | MMLU 84,25%; rechaza el 96,3% de los prompts JBB |
| MiniCPM-V-4.7-35B-A3B-GGUF (cuantizaciones de AtomicChat) | 34,66B totales (MoE) | no disponible | Apache 2.0 | GGUF | Sin abliterar; sirve de base para el LoRA |

No se dispone de datos de benchmarks comparativos con otros modelos multimodales de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina los rechazos por diseño: el modelo responderá a peticiones dañinas o sensibles que el original bloqueaba (0% de rechazos en JBB harmful behaviours). No es apto para despliegues públicos sin filtros externos.
- Riesgo de alucinación: no se han publicado métricas específicas de veracidad o factualidad en la información disponible.
- La medición de rechazos se basa en la apertura de la respuesta, por lo que es indicativa y no un juicio semántico completo, según reconoce el propio autor.
- Idiomas soportados no documentados: no hay garantía de calidad fuera de los idiomas evaluados (inglés en las pruebas reportadas).
- El adaptador LoRA se midió sobre pesos BF16; aplicado sobre una cuantización, acumula el error de esa cuantización además del de la edición.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado por un modelo sin rechazos recae en el desplegador.
- Requiere una versión reciente de llama.cpp (`69f201a` o posterior); versiones anteriores no cargarán el modelo.
- El modo thinking está activado por defecto con `--jinja`; debe desactivarse explícitamente por petición si no se desea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AtomicChat/MiniCPM-V-4.7-35B-A3B-Uncensored-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Cuantizaciones sin modificar del mismo autor: https://huggingface.co/AtomicChat/MiniCPM-V-4.7-35B-A3B-GGUF
- Métricas publicadas: https://huggingface.co/datasets/AtomicChat/MiniCPM-V-4.7-35B-A3B-Uncensored-GGUF-metrics
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
- Soporte de MiniCPM-V 4.7 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/29416
