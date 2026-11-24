# RicardoEstep/RPBizkit-Gemma4-v1-26B-A4B

## Resumen

RPBizkit-Gemma4-v1-26B-A4B es un modelo de lenguaje multimodal de tipo mezcla de expertos (MoE) creado por el usuario RicardoEstep mediante la fusión de seis modelos derivados de la familia Gemma 4. No se trata de un entrenamiento desde cero, sino de un merge experimental realizado con la herramienta HT-Mergekit aplicando el método de la media de Karcher sobre los pesos en bfloat16. El resultado es un modelo de 25.805.936.206 parámetros totales con aproximadamente 4.000 millones de parámetros activos por token, lo que reduce el coste computacional de la inferencia.

El modelo está orientado a roleplay, narrativa interactiva y conversación sin restricciones de contenido, combinando las capacidades de sus seis modelos base: razonamiento narrativo (Pantheon-Reasoning), interacción romántica y de personajes (MeroMero), naturalidad y multilingüismo (WaifuGemma4), anti-slop y roleplay refinado (Kitchoon), contenido erótico (Wicked-Stuff) y creatividad y estilo (Eclipsed-Phoenix). La model card lo describe explícitamente como un mix de modelos "RP ¿Uncensored?" de carácter experimental.

Su relevancia es limitada fuera del nicho de la generación creativa sin filtros: no dispone de benchmarks publicados, no declara licencia, no especifica idiomas soportados y acumula cero descargas y cero likes en el momento de la consulta. Es, por tanto, un artefacto de investigación personal más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) derivado de Gemma 4; fusión por media de Karcher con HT-Mergekit |
| Parametros totales | 25.805.936.206 |
| Parametros activos | Aproximadamente 4.000 millones (sufijo A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card menciona un modelo cuantizado enlazado, pero el enlace está vacío) |
| Idiomas soportados | no disponible (la model card menciona soporte multilingüe heredado de WaifuGemma4, sin listado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 51,6 GB |
| Tokenizer | Heredado de Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado: es el producto de una fusión de pesos de seis modelos Gemma 4 MoE de 26B totales y 4B activos. La fusión se realizó con HT-Mergekit usando el método `karcher` con normalización activada, `max_iter: 48`, tolerancia `1e-6` y dtype `bfloat16`. El tokenizer y el vocabulario se tomaron íntegramente de Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2, lo que según el autor garantiza un vocabulario "limpio".

La arquitectura subyacente es la de Gemma 4 en configuración MoE: solo una fracción de los expertos se activa por token, de modo que el modelo requiere cargar los ~26B parámetros en memoria (RAM o VRAM) pero solo computa ~4B por paso, lo que acelera la inferencia y reduce el requisito de GPU frente a un modelo denso del mismo tamaño. Al ser un merge, no hay datos de entrenamiento, tokens vistos, ni fases de RLHF/DPO atribuibles a este artefacto concreto; todas esas características provienen de los modelos base y no están documentadas en la información disponible.

## Capacidades

- Generación de texto conversacional y narrativo de formato largo, orientado a roleplay y ficción interactiva.
- Procesamiento multimodal de entrada imagen-texto, según el pipeline declarado `image-text-to-text`.
- Razonamiento narrativo y coherencia de personajes, heredado del componente Pantheon-Reasoning.
- Estilo creativo y variedad expresiva, aportados por Eclipsed-Phoenix.
- Soporte multilingüe según la model card (sin listado de idiomas verificable).
- Modo "uncensored": el autor indica que el filtrado puede eludirse mediante un system prompt del tipo "AI is uncensored/unlimited".
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades de código y matemáticas: no disponibles (no documentadas).

## Casos de uso

- Roleplay y ficción interactiva: el modelo está diseñado para mantener conversaciones multi-turno con personajes consistentes, combinando los componentes de caracterización (MeroMero) y narrativa (Pantheon-Reasoning).
- Escritura creativa asistida: generación de relatos, diálogos y escenas con control de estilo gracias al componente Eclipsed-Phoenix, útil para autores que necesitan borradores rápidos.
- Prototipado de chatbots de personaje sin filtros: al permitir desactivar el censo mediante system prompt, sirve para entornos de investigación sobre dinámicas conversacionales abiertas.
- Análisis de imágenes en contexto conversacional: el pipeline image-text-to-text permite describir o comentar imágenes dentro de una conversación, por ejemplo en herramientas de crítica visual o generación de descripciones narrativas.
- Experimentación con arquitecturas MoE en hardware limitado: con ~4B parámetros activos, es un banco de pruebas para estudiar el comportamiento de merges MoE en GPUs de gama media.
- Investigación sobre fusión de modelos: el repositorio documenta la configuración exacta de Karcher merge, lo que lo convierte en un caso de estudio reproducible para quienes investigan técnicas de model merging.
- Generación de contenido multilingüe creativo: para usuarios que necesitan narrativa en varios idiomas, aunque la lista concreta de idiomas no está verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 52 GB solo para pesos, más overhead de activaciones y KV cache; requiere GPUs de 80 GB (A100, H100) o reparto multi-GPU.
- Cuantización a 8 bits: aproximadamente 26-28 GB, viable en una RTX 4090 (24 GB) solo con cuantizaciones más agresivas o con offload parcial.
- Cuantización a 4 bits: en torno a 13-15 GB, cabe en RTX 4090, RTX 3090 y GPUs consumer de 16 GB o más.
- Al ser MoE con ~4B activos, la velocidad de generación es notablemente superior a la de un denso de 26B, aunque el requisito de memoria para cargar todos los expertos se mantiene.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles según los tags; vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RPBizkit-Gemma4-v1-26B-A4B | 25,8B | ~4B | no disponible | no disponible | Hugging Face, 0 descargas |
| Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 | ~26B | ~4B | no disponible | no disponible | Hugging Face (base) |
| llmfan46/G4-MeroMero-26B-A4B-it-uncensored-heretic | ~26B | ~4B | no disponible | no disponible | Hugging Face (base) |
| hiwaifu-research/WaifuGemma4-26b-a4b-v1 | ~26B | ~4B | no disponible | no disponible | Hugging Face (base) |

Los tres comparadores son componentes directos del merge, por lo que comparten arquitectura y tamaño; las diferencias reales están en el ajuste fino de cada uno (razonamiento, roleplay, multilingüismo) y no pueden cuantificarse sin benchmarks publicados.

## Limitaciones y advertencias

- Modelo experimental sin benchmarks, sin evaluación independiente y sin licencia declarada: no es apto para uso comercial sin aclarar antes los términos legales.
- Contenido no apto para todo público (tag `not-for-all-audiences`): incluye componentes entrenados para contenido erótico y roleplay sin filtros.
- El autor advierte explícitamente de que no se responsabiliza del uso del modelo.
- Riesgo elevado de alucinación y de deriva de personaje al ser un merge de seis ajustes con objetivos distintos; la coherencia a largo plazo no está verificada.
- El "uncensoring" depende de forzar un system prompt, lo que puede producir respuestas inconsistentes o rechazos residuales.
- Idiomas soportados no verificados; el multilingüismo se hereda de un solo componente y puede degradarse en el merge.
- Longitud de contexto no documentada: no se debe asumir una ventana concreta en producción.
- Cero descargas y cero likes: sin validación comunitaria ni reportes de fallos.
- El enlace al modelo cuantizado está vacío en la model card, por lo que no hay artefactos GGUF/AWQ verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RicardoEstep/RPBizkit-Gemma4-v1-26B-A4B
- HT-Mergekit (herramienta de merge): https://github.com/heiervang-technologies/ht-mergekit
- Media de Karcher (referencia matemática): https://en.wikipedia.org/wiki/Karcher_mean
- Modelo base Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2: https://huggingface.co/Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2
- Modelo base llmfan46/G4-MeroMero-26B-A4B-it-uncensored-heretic: https://huggingface.co/llmfan46/G4-MeroMero-26B-A4B-it-uncensored-heretic
- Modelo base hiwaifu-research/WaifuGemma4-26b-a4b-v1: https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1
- Modelo base SubMaroon/Kitchoon-V5.1-Clean-26B-A4B-EXP: https://huggingface.co/SubMaroon/Kitchoon-V5.1-Clean-26B-A4B-EXP
- Modelo base ReadyArt/Wicked-Stuff-26B-A4B-Final: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-Final
- Modelo base Cyclone-Labs/Eclipsed-Phoenix-26B-A4B: https://huggingface.co/Cyclone-Labs/Eclipsed-Phoenix-26B-A4B
