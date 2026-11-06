# alystria-ai/ai-npc-cyberpunk-mod-packs

## Resumen

AI NPC Cyberpunk Mod packs es un repositorio de Hugging Face que no contiene un modelo fundacional al uso, sino un conjunto de paquetes de descarga (weights, proyectores de visión, modelos de voz y de reconocimiento de habla) destinados al mod **AI NPC Cyberpunk Mod** para Cyberpunk 2077, desarrollado por alystria-ai. El mod permite conversar por voz o texto con los personajes del juego, que responden con su propia voz, sincronización labial, emociones y gestos; los compañeros caminan, se sientan, viajan y combaten junto al jugador. El repositorio es, por tanto, un canal de distribución de artefactos, no una model card de un modelo único.

Los paquetes incluyen modelos locales de lenguaje en formato GGUF para llama.cpp (Gemma 4 E4B en versión estándar y Bonsai 2 4B en versión lite, además de fine-tunes sin censura basados en Qwen3.5 4B y Gemma 4 E4B), proyectores de visión para el modo de visión de compañero, el paquete OmniVoice de síntesis de voz (0.6B), un servidor OmniVoice remoto y packs de micrófono basados en NVIDIA Parakeet TDT 0.6B v3 (europeo, int8, en CPU) y SenseVoice Small 234M (asiático). El tamaño total del repositorio es de 109,4 GB, con licencia mixta ("other"/"mixed") y sin idiomas declarados a nivel de repositorio.

La relevancia actual es limitada pero específica: demuestra un patrón de integración de LLM locales pequeños (4B) con visión, TTS y ASR dentro de un videojuego comercial, con requisitos de VRAM moderados (del orden de 1,8 a 3,1 GB para el LLM, más 0,4 a 0,8 GB para visión y 2 a 4 GB para OmniVoice). No obstante, la información pública disponible no permite caracterizar los modelos subyacentes con el detalle habitual de una ficha de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio agrupa varios modelos: LLM en GGUF para llama.cpp, proyectores de visión, TTS OmniVoice 0.6B y ASR Parakeet TDT 0.6B v3 / SenseVoice Small 234M) |
| Parametros totales | no disponible a nivel de repositorio; los LLM incluidos son de ~4B (Gemma 4 E4B, Bonsai 2 4B, Qwen3.5 4B fine-tune); OmniVoice 0.6B; Parakeet TDT 0.6B v3; SenseVoice Small 234M |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (llama.cpp); Parakeet TDT 0.6B v3 en int8; cuantizaciones concretas de los LLM no disponibles |
| Idiomas soportados | no disponibles a nivel de repositorio; el MicPack europeo cubre ruso, ucraniano, polaco, checo, húngaro, alemán, francés, español, italiano y portugués; el MicPack asiático cubre lenguas asiáticas (lista truncada en la información disponible) |
| Licencia | other / mixed (license_name: mixed, con enlace a LICENSE) |
| Formato de pesos | GGUF, ONNX (PocketTTS), ZIP de paquetes; proyectores de visión en ZIP |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento, el número de tokens ni los procesos de alineación (RLHF/DPO) de los modelos contenidos. El repositorio es un contenedor de artefactos para un mod de juego y la model card se limita a describir la organización de carpetas, los tamaños de archivo y los requisitos de instalación.

Lo que sí puede inferirse de la información proporcionada es la composición del stack: LLM de ~4B parámetros en GGUF ejecutados con llama.cpp (Gemma 4 E4B estándar y Bonsai 2 4B lite, más fine-tunes "uncensored" de Qwen3.5 4B y Gemma 4 E4B para el pack Mature); proyectores de visión separados que se cargan solo cuando se activa la opción de visión de compañero; OmniVoice 0.6B para síntesis de voz local (con variante servidor para descargar el cómputo a otra máquina); y ASR mediante Parakeet TDT 0.6B v3 en int8 sobre CPU y SenseVoice Small 234M. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Conversación por voz y texto con personajes de Cyberpunk 2077, con respuestas en la voz del personaje, sincronización labial, emociones y gestos (según la model card).
- Compañeros controlados por IA que caminan, se sientan, viajan, combaten y responden cuando se les llama.
- Ejecución local y offline de los LLM (packs Local AI estándar y lite) mediante llama.cpp.
- Visión opcional: los proyectores permiten que el modelo interprete las imágenes enviadas desde "Conversations > Companion vision"; sin ellos, el modelo responde solo a partir del texto.
- Síntesis de voz local de mayor calidad con OmniVoice 0.6B, compatible con cualquier opción de texto; posibilidad de servidor OmniVoice remoto en otro PC o segunda GPU.
- Reconocimiento de habla multilingüe: pack europeo (10 idiomas) con Parakeet TDT 0.6B v3 int8 en CPU y pack asiático con SenseVoice Small 234M.
- Integración con endpoints externos: la model card menciona Local AI, OpenRouter y Custom endpoints, además de Google Gemini para reconocimiento de voz sin pack.
- Packs "Mature" sin censura (solo adultos) basados en fine-tunes de Qwen3.5 4B y Gemma 4 E4B.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso ni modo "thinking" en la información disponible.

## Casos de uso

- Modding conversacional de Cyberpunk 2077: instalar el mod desde Nexus Mods y los packs desde este repositorio para dotar a los NPC de diálogo generativo por voz o texto, con respuestas en su propia voz y sincronización labial.
- Despliegue en GPU de gama media: el pack Local AI lite (Bonsai 2 4B) requiere unos 1,8 GB de VRAM, lo que permite ejecutar el mod en tarjetas con poca memoria; el pack estándar (Gemma 4 E4B) usa unos 3,1 GB y necesita unos 6 GB libres para arrancar.
- Compañeros con percepción visual: activando "Companion vision" y extrayendo el proyector correspondiente, el modelo interpreta las imágenes enviadas por el juego y responde en consecuencia, con un coste adicional de 0,4 a 0,8 GB de VRAM.
- Voces locales de alta calidad: el paquete OmniVoice 0.6B (2 a 4 GB de VRAM) sustituye las voces por defecto por síntesis local de mayor calidad, combinable con cualquier opción de texto.
- Descarga de cómputo de voz: el OmniVoice Server permite renderizar las voces en otro PC con Windows y GPU NVIDIA (sin necesidad de instalar el juego), liberando VRAM en la máquina de juego.
- Conversación por micrófono en varios idiomas: el MicPack europeo (Parakeet TDT 0.6B v3 int8 en CPU) habilita entrada por voz en ruso, ucraniano, polaco, checo, húngaro, alemán, francés, español, italiano y portugués; el pack asiático (SenseVoice Small 234M) cubre lenguas asiáticas.
- Investigación sobre integración de LLM pequeños en videojuegos: el repositorio sirve como referencia de empaquetado de LLM de ~4B, visión, TTS y ASR con presupuestos de VRAM concretos para un caso de uso interactivo en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el LLM: Local AI lite (Bonsai 2 4B) unos 1,8 GB; Local AI estándar (Gemma 4 E4B) unos 3,1 GB, con unos 6 GB libres necesarios para arrancar.
- VRAM adicional para visión: unos 0,4 GB (proyector de Bonsai 2 4B) o unos 0,8 GB (proyector de Gemma 4 E4B), cargados solo mientras "Companion vision" está activo.
- VRAM para voz: OmniVoice 0.6B requiere entre 2 y 4 GB.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible; el pack lite está pensado para "tarjetas gráficas más pequeñas". El servidor OmniVoice requiere Windows y una GPU NVIDIA.
- Cabe en GPU de consumo: sí, según los presupuestos de VRAM indicados (1,8 a 3,1 GB para el LLM y 2 a 4 GB para OmniVoice), aunque no se detallan modelos concretos.
- CPU: el pack de micrófono europeo (Parakeet TDT 0.6B v3 int8) se ejecuta en el procesador.
- Opciones de despliegue: llama.cpp (formato GGUF), ONNX para los modelos PocketTTS, y el servidor OmniVoice propio. No se mencionan vLLM, TGI, Ollama ni otros runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (packs de mods conversacionales para videojuegos) ni datos de rendimiento que permitan una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- La licencia es "other"/"mixed", con un archivo LICENSE no detallado en la información disponible; es imprescindible revisarlo antes de cualquier uso comercial o redistribución, especialmente por la combinación de modelos de terceros (Gemma, Qwen, Parakeet, SenseVoice, OmniVoice) con licencias posiblemente distintas.
- El repositorio no es un modelo único: mezcla artefactos de distintos autores y licencias, lo que complica la trazabilidad y el cumplimiento legal.
- Los packs "Mature" son contenido sin censura y solo para adultos; no son aptos para entornos productivos ni para usuarios menores.
- No se declaran idiomas soportados a nivel de repositorio ni se documenta la cobertura multilingüe de los LLM, solo la de los packs de micrófono.
- No hay información sobre sesgos, riesgo de alucinación ni evaluación de seguridad de los modelos incluidos.
- El mod principal y las actualizaciones se distribuyen exclusivamente desde Nexus Mods; este repositorio solo aloja paquetes opcionales, por lo que enlaces y versiones dependen de un servicio externo.
- Los requisitos de VRAM son acumulativos: LLM + visión + OmniVoice pueden superar los 6-8 GB en configuraciones completas.
- No se documentan benchmarks, latencias ni throughput, lo que impide evaluar el rendimiento en producción.
- El repositorio tiene 0 descargas declaradas y 12 likes, con lo que la validación comunitaria es muy limitada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/alystria-ai/ai-npc-cyberpunk-mod-packs
- Página del mod en Nexus Mods: https://www.nexusmods.com/cyberpunk2077/mods/35436
- Archivos del mod en Nexus Mods: https://www.nexusmods.com/cyberpunk2077/mods/35436?tab=files
- Carpeta local-ai: https://huggingface.co/alystria-ai/ai-npc-cyberpunk-mod-packs/tree/main/local-ai
- Carpeta local-ai/vision: https://huggingface.co/alystria-ai/ai-npc-cyberpunk-mod-packs/tree/main/local-ai/vision
- Carpeta mature: https://huggingface.co/alystria-ai/ai-npc-cyberpunk-mod-packs/tree/main/mature
- Carpeta mature/vision: https://huggingface.co/alystria-ai/ai-npc-cyberpunk-mod-packs/tree/main/mature/vision
- Carpeta mic: https://huggingface.co/alystria-ai/ai-npc-cyberpunk-mod-packs/tree/main/mic
- Carpeta voice: https://huggingface.co/alystria-ai/ai-npc-cyberpunk-mod-packs/tree/main/voice
- Carpeta updates: https://huggingface.co/alystria-ai/ai-npc-cyberpunk-mod-packs/tree/main/updates
- Carpeta updates/game-2.31: https://huggingface.co/alystria-ai/ai-npc-cyberpunk-mod-packs/tree/main/updates/game-2.31
- Carpeta multilingual: https://huggingface.co/alystria-ai/ai-npc-cyberpunk-mod-packs/tree/main/multilingual
