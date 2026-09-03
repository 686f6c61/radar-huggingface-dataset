# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion es un modelo de lenguaje multimodal de 26.9 mil millones de parámetros desarrollado por Solstice-AI como release cuantizado NVFP4 del checkpoint original de DavidAU. Se trata de una versión optimizada para servidores NVIDIA Blackwell que combina una arquitectura híbrida de atención lineal con una ventana de contexto nativa de 262.144 tokens. El modelo está diseñado para tareas de razonamiento, generación de código y automatización de agentes, y según las evaluaciones empíricas presentadas por sus autores supera a Claude Opus 4.6 Max en nueve de nueve disciplinas de benchmark, incluyendo SWE-bench Pro, LiveCodeBench y ARC-C. Su relevancia radica en ofrecer un rendimiento de nivel frontera en un formato de cuantización de 4 bits apto para aceleración por hardware, junto con capacidades multimodales de visión espacial-temporal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 75% Gated Delta Recurrent Network (GDN) linear attention, 25% Grouped-Query Attention (GQA) |
| Parámetros totales | 26.895.998.464 |
| Longitud de contexto | 262.144 tokens (262K nativo) |
| Tipos de cuantización | NVFP4 (Blackwell microscaling 4-bit), 8-bit y 4-bit (según benchmarks) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (incluye mmproj-BF16.gguf para visión) |

## Arquitectura y entrenamiento

La arquitectura del modelo es híbrida: el 75% de las capas utilizan bloques de atención lineal Gated Delta Recurrent Network (GDN) con complejidad de memoria O(1), mientras que el 25% restante emplea Grouped-Query Attention (GQA) global. Esta combinación permite mantener un contexto largo de 262K tokens con un coste de memoria reducido. El checkpoint es el resultado de un merge GAIN (Guided Activation Interleaved Normalization) realizado por DavidAU sobre pesos de razonamiento de alto rendimiento, seguido de una alineación por abliteración (Project Heretic) que elimina los vectores de rechazo corporativos.

No se han publicado detalles sobre el corpus de entrenamiento, el número de tokens ni procesos de RLHF/DPO. Entre las innovaciones técnicas destacan la cuantización NVFP4 con microscaling de dos niveles, la predicción de múltiples tokens (MTP) con cabezas especulativas duales que generan dos tokens por paso (1.72x-2.20x de aceleración), y el módulo de visión espacial-temporal 3D (mmproj-BF16.gguf).

## Capacidades

- Generación de texto y razonamiento con cadena de pensamiento (CoT), destacando en tareas de abstracción científica (ARC-C 735, ARC-E 882).
- Generación de código y resolución de problemas de programación en tiempo real (LiveCodeBench v6 90.3%).
- Ingeniería de software agentic: resolución de issues en repositorios completos (SWE-bench Pro 61.7%, QwenSWEBench 79.0%).
- Automatización de sistemas operativos y control de dispositivos (OSWorld-Verified 84.3%, AndroidWorld 81.9%).
- Soporte de agentes y razonamiento multi-paso en workflows largos (CoWorkBench 70.7%).
- Capacidades multimodales de visión: comprensión de esquemas arquitectónicos, interfaces de código y frames de vídeo mediante el proyector mmproj-BF16.gguf.
- Contexto largo de 262K tokens para tareas que requieren memoria extensa.
- Soporte de tool calling / function calling: no se especifica explícitamente en la documentación, aunque los benchmarks de agentes sugieren capacidades de uso de herramientas.
- Modelo "uncensored": sin vectores de rechazo corporativos, orientado a desarrollo de seguridad y sistemas.

## Casos de uso

- Ingeniería de software agentic: el modelo puede gestionar repositorios completos y depurar código en múltiples archivos. Con SWE-bench Pro 61.7% y CoWorkBench 70.7%, es adecuado para integrarse en pipelines de CI/CD y asistentes de desarrollo.
- Automatización de entornos de escritorio: gracias a OSWorld-Verified 84.3%, puede controlar sistemas operativos, ejecutar tareas administrativas y manipular interfaces gráficas.
- Autonomía en dispositivos móviles: con AndroidWorld 81.9%, es capaz de operar aplicaciones Android de forma autónoma, útil para testing de apps y asistentes móviles.
- Asistente de programación en tiempo real: LiveCodeBench v6 90.3% lo hace adecuado para entornos de desarrollo interactivo, generación de código y resolución de problemas de algoritmia.
- Análisis de esquemas y documentación técnica: la capacidad de visión multimodal permite interpretar diagramas de arquitectura, capturas de interfaces de código y frames de vídeo en tareas de revisión de diseño.
- Despliegue de inferencia de alta velocidad en hardware Blackwell: la cuantización NVFP4 y la predicción multi-token (MTP) permiten servir el modelo en RTX 5090, B200 o GB200 con alto throughput para aplicaciones de producción.
- Investigación en razonamiento abstracto: con ARC-C 735 y ARC-E 882, puede utilizarse en estudios de razonamiento de sentido común y abstracción científica.

## Benchmarks y rendimiento

| Evaluación | Qwen3.8-27B TURBO | Claude Opus 4.6 Max | Margen |
|---|---|---|---|
| SWE-bench Pro | 61.7% | 53.4% | +8.3% |
| LiveCodeBench v6 | 90.3% | 88.8% | +1.5% |
| QwenSWEBench | 79.0% | 63.8% | +15.2% |
| OSWorld-Verified | 84.3% | 72.7% | +11.6% |
| AndroidWorld | 81.9% | 62.0% | +19.9% |
| IFBench | 79.5% | 62.5% | +17.0% |
| CoWorkBench | 70.7% | 68.2% | +2.5% |
| ARC-C (Challenge) | 735 (8-Bit) / 719 (4-Bit) | ~710-720 | Frontier Closed Tier |
| ARC-E (Easy) | 882 | ~870 | Exceeds Closed Frontier |

Los resultados son afirmaciones de los autores del modelo y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada: ~14 GB para los pesos en NVFP4 (26.9B parámetros × 4 bits), más memoria para KV cache y activaciones. El repositorio ocupa 19.8 GB.
- GPU recomendadas: NVIDIA Blackwell (B200, GB200, RTX 5090) y Ada Lovelace (RTX 4090).
- Compatibilidad con consumer GPU: sí, con cuantización NVFP4 en RTX 5090 (32 GB) y RTX 4090 (24 GB), aunque el contexto máximo puede verse limitado por la VRAM disponible.
- Opciones de despliegue: Anvil Engine (recomendado, con compresión TurboQuant de KV cache), vLLM, SGLang, llama.cpp (formato GGUF).
- Latencia y throughput: la predicción multi-token (MTP) ofrece una aceleración estimada de 1.72x a 2.20x en comparación con la generación de un token por paso. No hay cifras absolutas de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | SWE-bench Pro | ARC-C |
|---|---|---|---|---|---|
| Qwen3.8-27B TURBO | 26.9B | 262K | Apache 2.0 | 61.7% | 735 |
| Claude Opus 4.6 Max | no disponible | no disponible | propietaria | 53.4% | ~710-720 |

No se dispone de información sobre otros modelos comparables open source en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no disponible; al ser un modelo "uncensored" sin filtros de rechazo, puede generar contenido no deseado o inapropiado.
- Limitaciones de idioma: solo inglés y chino; no hay soporte explícito para otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la naturaleza "uncensored" del modelo puede requerir políticas de uso responsables.
- Advertencia importante: los benchmarks son afirmaciones de los autores y no han sido verificados de forma independiente. El modelo es un merge con abliteración, lo que puede afectar a la calidad y consistencia del output. El contexto de 262K es nativo, pero requiere hardware específico para aprovecharse plenamente.

## Enlaces

- HuggingFace: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Anvil Runtime: https://github.com/Solstice-Labs/anvil
- Variante 1M: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4-1M
