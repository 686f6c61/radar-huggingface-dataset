# EverythingIsForGod/InternVL3-78B-WSP-SFT-Compressed

## Resumen

InternVL3-78B-WSP-SFT-Compressed es una versión estructuralmente comprimida y ajustada del modelo multimodal OpenGVLab/InternVL3-78B, publicada por el usuario EverythingIsForGod. El autor parte del checkpoint original de 78.400 millones de parámetros (146,05 GiB) y lo reduce a un único fichero `model.safetensors` de 8,68 GiB (9,32 GB), lo que supone una reducción de tamano de aproximadamente 16,8 veces. El modelo resultante mantiene el pipeline `image-text-to-text` y se ejecuta con Hugging Face `transformers` tanto en CPU como en GPU.

La compresión combina varias técnicas: fusión de capas mediante interpolación esférica geodésica (SLERP), poda estructurada de neuronas (Wanda/L2-Product) en el codificador visual y en el SwiGLU del modelo de lenguaje, y un ajuste supervisado (SFT) conjunto multimodal de 8 épocas sobre 16 currículos especializados en ingeniería de software, diseno de sistemas distribuidos, ingeniería de redes, CEH, pentesting y seguridad web. El modelo conserva el proyector visión-lenguaje `mlp1` completo (12800 → 8192) y el espacio de estados ocultos de 8192 dimensiones del modelo de lenguaje base (Qwen2.5-72B).

Es relevante ahora porque demuestra un enfoque de compresión agresiva que permite desplegar un VLM de gran tamano en hardware modesto, a costa de una reducción drástica del número de capas (de 45 a 8 en el codificador visual y de 80 a 6 en el modelo de lenguaje). La licencia es MIT y el idioma declarado es únicamente inglés. No hay datos de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (InternViT-6B-448px-V2_5 + Qwen2.5-72B) comprimido mediante SLERP y poda estructurada |
| Parametros totales | 78.4B en el modelo base; tamano del checkpoint comprimido 8,68 GiB (9,32 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en safetensors; el ejemplo usa `torch.bfloat16`) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de InternVL3-78B, que combina un codificador visual InternViT-6B-448px-V2_5 con un modelo de lenguaje Qwen2.5-72B y un proyector MLP de pixel-shuffle. La compresión reduce el codificador visual de 45 a 8 capas mediante SLERP geodésico sobre 8 pares de capas representativas ((0,1), (6,7), (12,13), (18,19), (24,25), (31,32), (37,38), (43,44)), con compensación de varianza de profundidad mediante LayerScale y poda estructurada de neuronas MLP de 12.800 a 3.200. El modelo de lenguaje se reduce de 80 a 6 capas mediante SLERP sobre 6 pares ((1,2), (15,16), (31,32), (48,49), (64,65), (78,79)) y poda estructurada SwiGLU de 29.568 a 4.096 neuronas, conservando el espacio oculto de 8.192 dimensiones y la atención GQA (64Q / 8KV). El proyector `mlp1` se conserva al 100% y se ajusta.

El ajuste supervisado (SFT) conjunto se realizó durante 8 épocas sobre 16 currículos especializados que cubren procesamiento multimodal de imagen y vídeo (keyframes espacio-temporales, wireframes UI/UX a React/Tailwind, auditorías de topologías de red cloud, triaje de capturas HTTP/JWT), ingeniería de software y diseno de sistemas distribuidos (hashing consistente, transactional outbox, consenso Raft, Python asyncio), ingeniería de redes y CEH (defensa OSI/TCP-IP, mitigación de SYN flood con eBPF/XDP, NetworkPolicies Zero-Trust en Kubernetes) y metodología de pentesting, bug bounty y remediación de seguridad web (SSRF CWE-918, condiciones de carrera TOCTOU CWE-362, Prototype Pollution, OAuth2 PKCE, hardening de GraphQL, IAM de mínimo privilegio en cloud). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en inglés.
- Comprensión de imágenes: descripción detallada, OCR denso en capturas de pantalla, wireframes UI/UX y diagramas de topología de red.
- Comprensión de vídeo multi-frame: resumen de eventos temporales y pipelines de keyframes espacio-temporales.
- Generación de código: síntesis de componentes React/Tailwind a partir de wireframes, Python asyncio, diseno de sistemas distribuidos.
- Ciberseguridad: pentesting, bug bounty, análisis de vulnerabilidades (SSRF, TOCTOU, Prototype Pollution), hardening de OAuth2 PKCE y GraphQL, IAM de mínimo privilegio.
- Ingeniería de redes: defensa OSI/TCP-IP, mitigación de SYN flood con eBPF/XDP, NetworkPolicies Zero-Trust en Kubernetes.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo thinking, visión, audio: visión y vídeo sí; thinking y audio no disponibles.

## Casos de uso

- Auditoría de seguridad de topologías de red cloud: el modelo puede analizar diagramas de topología como imagen y aplicar los currículos de seguridad de red del SFT para identificar riesgos de configuración y proponer políticas Zero-Trust.
- Revisión de seguridad web en pipelines de CI/CD: con prompts de texto sobre vulnerabilidades concretas (SSRF CWE-918, TOCTOU CWE-362, Prototype Pollution), el modelo genera validadores y remediaciones en Python, adecuado por su ajuste específico en bug bounty y remediación.
- Síntesis de frontend a partir de wireframes: dado un wireframe UI/UX como imagen, el modelo genera componentes React/Tailwind, aprovechando el codificador visual comprimido que conserva los embeddings de parches de 3200 dimensiones.
- Triaje de capturas HTTP/JWT: el modelo puede procesar capturas de pantalla de tráfico HTTP o tokens JWT y extraer información relevante para análisis de seguridad, gracias a su capacidad de OCR denso.
- Resumen de vídeo para monitorización: el modelo resume eventos temporales en vídeos multi-frame, útil en pipelines de vigilancia o análisis de contenido.
- Diseno de sistemas distribuidos: con prompts de texto, el modelo aborda hashing consistente, transactional outbox, consenso Raft y Python asyncio, adecuado para asistencia en arquitectura de software.
- Despliegue en hardware modesto: al ocupar 8,68 GiB en safetensors y ejecutarse en CPU y GPU con `transformers`, es viable en entornos sin GPUs de gran VRAM, a diferencia del modelo base de 146 GiB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 8,68 GiB en safetensors; en `bfloat16` el ejemplo de carga requiere al menos ese tamano más overhead de activaciones, no especificado. No hay cifras oficiales de VRAM de inferencia.
- GPU recomendadas: no disponibles en la información proporcionada.
- Cabe en GPU consumer: probablemente sí por tamano del checkpoint (8,68 GiB), pero no hay confirmación oficial ni cifras de latencia.
- Opciones de despliegue: Hugging Face `transformers` con `trust_remote_code=True` y `use_flash_attn=False`; el autor incluye un runner `run_internvl3.py` para imagen, vídeo y texto. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| InternVL3-78B-WSP-SFT-Compressed | 78.4B base, checkpoint 8,68 GiB | no disponible | MIT | Hugging Face |
| OpenGVLab/InternVL3-78B (base) | 78.4B | no disponible | no disponible en la información | Hugging Face |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La compresión reduce el codificador visual de 45 a 8 capas y el modelo de lenguaje de 80 a 6 capas, lo que puede degradar capacidades respecto al modelo base; no hay benchmarks que cuantifiquen la pérdida.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay evaluación publicada.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Longitud de contexto no especificada, lo que limita la planificación de despliegues con documentos largos.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-10), sin validación comunitaria.
- El uso de `trust_remote_code=True` implica ejecutar código del autor; revisar antes de desplegar en producción.
- Licencia MIT permite uso comercial, pero el modelo base InternVL3-78B puede tener condiciones adicionales no reflejadas en la información disponible.
- No se especifican cuantizaciones GGUF ni soporte para vLLM, lo que limita opciones de despliegue optimizado.

## Enlaces

- Hugging Face: https://huggingface.co/EverythingIsForGod/InternVL3-78B-WSP-SFT-Compressed
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-78B
