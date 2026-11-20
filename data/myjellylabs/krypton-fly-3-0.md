# myjellylabs/Krypton-Fly-3.0

## Resumen

Krypton Fly 3.0 es un modelo fundacional multimodal de propósito general desarrollado por MyJellyLabs, publicado en Hugging Face bajo licencia Apache-2.0. Con aproximadamente 9.400 millones de parámetros, está construido sobre la arquitectura Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`) y se distribuye en formato safetensors con pesos en el repositorio de 34,8 GB. Su pipeline declarado es `image-text-to-text`, lo que indica capacidad nativa de comprensión de imagen (y vídeo, según la model card) además de texto.

El modelo se presenta como un modelo "post-entrenado" orientado a razonamiento analítico de primer principio, síntesis de investigación profunda, flujos de trabajo de terminal Linux y programación verificada, con fluidez en inglés e hindi (incluyendo hinglish). El autor declara un proceso de post-entrenamiento que combina destilación de razonamiento desde QwQ-32B mediante el dataset OpenThoughts3-1.2M, SFT con ponderación de tokens de alta entropía por chunks y NEFTune, y una fase de DPO constitucional con "compact-thinking".

Es relevante ahora porque ocupa el nicho de modelos multimodales de ~9B con pesos abiertos y licencia permisiva, pensados para experimentación local y despliegue en hardware de consumo, con un énfasis declarado en razonamiento estructurado (modo `enable_thinking`) y en tareas de agente/terminal. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y no se han publicado resultados de benchmarks verificables en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5 (`Qwen3_5ForConditionalGeneration`) |
| Parametros totales | 9.409.813.744 (aprox. 9,4B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se asume compatibilidad con cuantizacion estándar de transformers, no confirmado) |
| Idiomas soportados | en, hi (inglés, hindi; la model card menciona también hinglish) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal de la familia Qwen3.5, cargable mediante `Qwen3_5ForConditionalGeneration` con `transformers >= 5.6.0`. El modelo integra un procesador (`AutoProcessor`) para entradas de imagen y texto, y el pipeline declarado es `image-text-to-text`. La model card menciona comprensión nativa de imagen y vídeo, aunque no se detallan los componentes del codificador visual ni la resolución o número de frames soportados.

El post-entrenamiento se describe en tres fases: (1) destilación de razonamiento desde QwQ-32B usando el dataset OpenThoughts3-1.2M; (2) SFT con ponderación de tokens de alta entropía por chunks y NEFTune; y (3) DPO constitucional con "Frontier First-Principles + Compact-Thinking". No se especifican el número total de tokens de entrenamiento, la composición del dataset de preentrenamiento ni los detalles del cómputo. La innovación declarada es el énfasis en razonamiento estructurado dentro de etiquetas `<think>` y en un modo de "pensamiento compacto" orientado a respuestas de alta densidad.

## Capacidades

- Generación de texto y razonamiento estructurado con modo de pensamiento (`enable_thinking=True`), que produce cadenas de razonamiento dentro de etiquetas `<think>`.
- Comprensión de imagen y vídeo (pipeline `image-text-to-text`), según la model card.
- Programación verificada y flujos de terminal Linux (etiquetas `coding`, `terminal`).
- Síntesis de investigación profunda (`deep-research`).
- Razonamiento matemático y analítico derivado de la destilación de QwQ-32B.
- Conversación multi-turno (`conversational`) con plantilla de chat aplicada mediante `apply_chat_template`.
- Multilingüe limitado a inglés e hindi (incluyendo hinglish).
- Soporte de tool calling / function calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes multi-paso: no disponible explícitamente, aunque las etiquetas `terminal` y `deep-research` sugieren uso agéntico.

## Casos de uso

- Asistente de terminal y automatización de shell: el modelo está etiquetado como `terminal` y puede generar comandos Linux y explicar sus efectos; adecuado para entornos de desarrollo donde se requiere razonamiento sobre el estado del sistema, con verificación humana antes de ejecutar.
- Generación y revisión de código en pipelines de CI/CD: su orientación a "programación verificada" permite usarlo como revisor de parches o generador de tests, integrándolo vía API de transformers en herramientas de integración continua.
- Investigación profunda y síntesis documental: la etiqueta `deep-research` y el modo de razonamiento permiten resumir y contrastar fuentes largas, aunque el contexto máximo no está declarado y debe validarse empíricamente.
- Análisis de imágenes y vídeo en flujos de trabajo técnicos: al ser `image-text-to-text`, puede describir capturas de pantalla, diagramas de arquitectura o fotogramas de vídeo para documentación o soporte.
- Atención al cliente bilingüe inglés-hindi: su soporte declarado de hindi e hinglish lo hace apto para conversaciones multi-turno en mercados del sur de Asia, con moderación externa recomendada.
- Experimentación local en hardware de consumo: con ~9,4B parámetros y pesos safetensors, es candidato para cuantización y ejecución en GPU de gama alta de consumo, útil para prototipado e investigación.
- Tutoría técnica y explicación de conceptos: el modo de pensamiento estructurado facilita respuestas pedagógicas paso a paso en programación y matemáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 18,8 GB solo para pesos (9,4B × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: ~9,4 GB para pesos; en 4 bits: ~4,7 GB para pesos, más overhead.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en fp16 con contexto largo; RTX 4090 (24 GB) para fp16 ajustado o 8 bits; RTX 3090/4080 para cuantización.
- Cabe en GPU de consumo: sí, en cuantización de 4-8 bits en RTX 3090, 4080, 4090 y similares; en fp16 requiere 24 GB o más.
- Opciones de despliegue: transformers (>= 5.6.0) es el método documentado; vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krypton Fly 3.0 | ~9,4B | no disponible | Sí (imagen/vídeo) | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen2.5-VL-7B | ~7B | 32K (típico en la familia) | Sí | Apache-2.0 | Hugging Face, ampliamente adoptado |
| Llama 3.2 11B Vision | ~11B | 128K | Sí | Llama 3.2 Community License | Hugging Face, restringido |
| Gemma 3 12B | ~12B | 128K | Sí | Gemma Terms of Use | Hugging Face, restringido |

La comparación se basa en categoría (multimodal de ~7-12B con pesos abiertos); los datos de contexto de los modelos alternativos provienen de sus especificaciones públicas habituales y deben verificarse en sus model cards. No hay benchmarks de Krypton Fly 3.0 para comparar rendimiento.

## Limitaciones y advertencias

- Alineación ligera: la model card indica que el post-entrenamiento se centró en utilidad y veracidad, no en filtrado de rechazo intensivo; no es un modelo "endurecido" para empresas.
- Riesgo de alucinación: como todo modelo de clase 9B, puede inventar hechos en dominios de nicho o casos límite; se recomienda verificar código y comandos antes de ejecutarlos en producción.
- Idiomas limitados a inglés e hindi; no se declara soporte de castellano, por lo que su uso en español no está garantizado.
- Longitud de contexto no declarada: limita la planificación de despliegues con documentos largos.
- Licencia Apache-2.0 permite uso comercial, pero el autor recomienda moderación externa y supervisión humana en aplicaciones públicas o sensibles.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por la comunidad ni de reproducibilidad de los resultados declarados.
- No se documentan sesgos específicos ni evaluación de seguridad independiente.

## Enlaces

- Hugging Face: https://huggingface.co/myjellylabs/Krypton-Fly-3.0
- Dataset de destilación mencionado (OpenThoughts3-1.2M): no se proporciona enlace en la información disponible.
- Paper, blog, repositorio o demo: no disponible.
