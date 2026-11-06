# mdcreativeagent/llama3-8B-DarkIdol-2.3-Uncensored-32K

## Resumen

llama3-8B-DarkIdol-2.3-Uncensored-32K es un modelo de lenguaje de 8.030.261.248 parametros construido sobre la arquitectura Llama 3 y publicado por el usuario mdcreativeagent (el model card referencia al autor original aifeifei798). Se trata de un merge de modelos preentrenados realizado con mergekit mediante el metodo Model Stock, cuyo objetivo declarado es el roleplay sin censura y la generacion de texto creativo en ingles, con soporte de contexto extendido hasta 32K tokens (base teorica de 64K via PoSE).

El modelo parte de winglian/Llama-3-8b-PoSE como base y combina una veintena de modelos derivados de Llama 3, incluyendo variantes de roleplay (Pantheon-RP, Roleplay-Llama-3-8B, TheSalt-RP), modelos "uncensored" o abliterated (Lexi-Uncensored, abliterated) y modelos orientados a escritura (badger-writer, writer-8b). El resultado es un modelo afinado para conversacion de personajes, ficcion y generacion de texto sin filtros de seguridad, empaquetado en safetensors (bfloat16) y distribuido bajo licencia Llama 3.

Es relevante en el nicho de modelos locales para roleplay y asistentes de personaje (SillyTavern, KoboldCpp, LM Studio, Backyard AI), donde el contexto largo y la ausencia de rechazos son requisitos habituales. No obstante, es un modelo de nicho, sin benchmarks publicados, con cero descargas en el repositorio consultado y con las limitaciones propias de un merge de 8B sin evaluacion formal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), merge Model Stock sobre Llama-3-8b-PoSE |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K probados; 64K teoricos (base PoSE) |
| Tipos de cuantizacion | GGUF (Q4_K_S, IQ-Imatrix, i1-GGUF, Q6_K, Q8_0, f16 en salida y embeddings segun el autor); pesos originales en bfloat16 |
| Idiomas soportados | en (ingles) |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors (repo principal); GGUF en repos de terceros |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3 con 8.030 millones de parametros, obtenido por fusion de pesos (model merging) y no por entrenamiento adicional supervisado. La fusion se realizo con mergekit usando el metodo Model Stock (paper arXiv:2403.19522) en dos fases: primero se combinaron Sao10K/L3-8B-Niitama-v1, Hastagaras/Jamet-8B-L3-MK.V-Blackroot, Nitral-AI/Hathor_Tahsin-L3-8B-v0.85, turboderp/llama3-turbcat-instruct-8b y winglian/Llama-3-8b-PoSE sobre la base PoSE; despues se fusionaron maldv/badger-writer-llama-3-8b, underwoods/writer-8b, Gryphe/Pantheon-RP-1.0-8b-Llama-3, vicgalle/Roleplay-Llama-3-8B, cgato/TheSalt-RP-L3-8b-DPO-v0.3.2-e0.15.2 y el resultado intermedio (DarkIdol-2.3a). Todo el proceso se ejecuto en bfloat16.

La innovacion tecnica principal no es de arquitectura sino de contexto: la base winglian/Llama-3-8b-PoSE aplica Positional Interpolation (PoSE) para extender la ventana de atencion de los 8K originales de Llama 3 hasta 64K teoricos. El autor indica que solo ha validado hasta 32K. No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni sobre fases de RLHF o DPO propias de este merge; los componentes individuales (TheSalt-RP, por ejemplo) si incorporan DPO en sus respectivos entrenamientos, pero el merge no anade alineamiento adicional. El autor menciona ademas una variante con capacidad de vision mediante un fichero mmproj de tipo LLaVA cargado en KoboldCpp, aunque el repositorio principal no incluye pesos multimodales.

## Capacidades

- Generacion de texto en ingles: narrativa, ficcion, dialogos y descripcion de escenas.
- Roleplay multi-personaje con personalidad consistente, orientado a plataformas tipo SillyTavern, Character Tavern, CharacterHub, Pygmalion y Backyard AI.
- Generacion de codigo basica (el model card indica salida de texto y codigo), aunque sin benchmarks que la respalden.
- Modo "uncensored": no aplica rechazos de seguridad en contenido adulto o sensible, por diseno.
- Contexto largo: conversaciones y ficcion de hasta 32K tokens probados, lo que permite mantener historiales extensos y "libros de personaje" detallados.
- Capacidad multimodal opcional (vision) cargando el mmproj LLaVA de Nitral-AI en KoboldCpp; no es una capacidad nativa del checkpoint safetensors.
- Sin soporte documentado de tool calling, function calling ni razonamiento agente multi-paso.
- Sin modo "thinking" ni capacidades de audio.
- Multilingue: solo ingles declarado; no se garantiza calidad en castellano.

## Casos de uso

- Roleplay conversacional local: el modelo esta afinado especificamente para mantener personajes coherentes en conversaciones multi-turno; su ventana de 32K permite arrastrar el historial completo y fichas de personaje extensas sin truncar, algo critico en SillyTavern.
- Escritura de ficcion y narrativa larga: el autor lo describe como capaz de respuestas "similares a una tesis" y de escribir canciones extensas; encaja en generacion de relatos por capitulos donde la continuidad de estilo importa.
- Asistente de personaje en aplicaciones de escritorio u movil: el model card menciona adaptacion para telefonos y su uso en Layla Lite (chatbot offline); con cuantizaciones Q4_K_S o IQ de 4-5 bits cabe en dispositivos con 6-8 GB de RAM.
- Prototipado de chatbots sin censura para investigacion de seguridad: util para estudiar comportamientos de modelos sin alineamiento, red teaming controlado y analisis de sesgos en entornos aislados.
- Generacion de dialogos para videojuegos o novelas visuales: integrable via llama.cpp o KoboldCpp en pipelines offline donde se requiere baja latencia y privacidad total (sin conexion).
- Creacion de contenido creativo para comunidades de rol (caracteres, trasfondos, tramas): los enlaces del model card apuntan a directorios de personajes (character-tavern, characterhub, aetherroom) donde se consume este tipo de modelo.
- Experimentacion con merges: sirve como referencia practica de la tecnica Model Stock en dos etapas para investigadores que estudian fusion de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card no incluye MMLU, HumanEval, GSM8K ni evaluaciones de roleplay cuantitativas. El unico dato de rendimiento mencionado es de las cuantizaciones GGUF del autor: aproximadamente 3-6 tokens por segundo en CPU con llama.cpp, sin GPU.

## Requisitos de hardware

- Pesos originales en bfloat16: ~16,1 GB, requieren al menos 16-18 GB de VRAM (RTX 4090 24 GB, A100 40 GB, H100) o descarga parcial en CPU.
- Cuantizacion Q8_0: ~8,5 GB de VRAM; cabe en RTX 3090/4090 y en GPUs de 12 GB con contexto reducido.
- Cuantizacion Q6_K: ~6,6 GB; viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB.
- Cuantizacion Q4_K_S / IQ4: ~4,9 GB; cabe en GPUs consumer de 6-8 GB (RTX 3060, RTX 4060, GTX 1660 Super) y en moviles de gama alta con 8 GB de RAM.
- Contexto: a 32K tokens la KV cache anade varios GB; con cuantizaciones de 4 bits conviene limitar a 8-16K en GPUs de 8 GB o usar offloading.
- Despliegue: llama.cpp, KoboldCpp (recomendado por el autor, con fork de Nexesenex para commits recientes), LM Studio, Backyard AI, Layla Lite; tambien vLLM o TGI con los safetensors en bfloat16.
- Throughput estimado: 3-6 tok/s en CPU segun el autor; no hay cifras publicadas en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llama3-8B-DarkIdol-2.3-Uncensored-32K | 8,03B | 32K probados / 64K teoricos | Roleplay sin censura, merge Model Stock | Llama 3 | Safetensors + GGUF de terceros |
| winglian/Llama-3-8b-PoSE | 8,03B | 64K teoricos | Base con extension de contexto PoSE | Llama 3 | Safetensors |
| Gryphe/Pantheon-RP-1.0-8b-Llama-3 | 8,03B | 8K | Roleplay | Llama 3 | Safetensors + GGUF |
| vicgalle/Roleplay-Llama-3-8B | 8,03B | 8K | Roleplay afinado | Llama 3 | Safetensors |

Los tres modelos comparables son componentes directos del merge, por lo que comparten tamano y licencia; la diferencia principal de DarkIdol 2.3 es el contexto extendido (hereda PoSE) y la combinacion de senales de roleplay, escritura y descensura. No hay benchmarks que permitan comparar calidad de forma objetiva.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento o codigo frente a los modelos base.
- Modelo "uncensored": no aplica filtros de seguridad; puede generar contenido sexual explicito, violento u ofensivo. No apto para productos dirigidos al publico general ni para menores.
- Riesgo elevado de alucinacion y de deriva de personaje en conversaciones largas, agravado por ser un merge sin evaluacion.
- Solo ingles declarado; el rendimiento en castellano es imprevisible y no esta validado.
- La licencia Llama 3 impone restricciones de uso comercial (limite de 700 millones de usuarios mensuales, obligacion de atribucion "Built with Meta Llama 3" y politicas de uso aceptable); el uso comercial requiere revisar la licencia completa.
- El repositorio consultado (mdcreativeagent) tiene 0 descargas y 0 likes, y fue creado en 2026-11-06; el autor original es aifeifei798. Conviene verificar la procedencia e integridad de los pesos antes de usarlos en produccion.
- El soporte de vision depende de un mmproj externo (Nitral-AI) y de KoboldCpp; no es una capacidad del checkpoint principal y puede no funcionar en otros runners.
- El contexto de 64K es teorico; solo 32K estan probados por el autor, y la calidad a contextos muy largos no esta medida.
- No soporta tool calling ni agentes; no es adecuado para automatizacion de tareas o integracion en pipelines de codigo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mdcreativeagent/llama3-8B-DarkIdol-2.3-Uncensored-32K
- Repositorio del autor original: https://huggingface.co/aifeifei798/llama3-8B-DarkIdol-2.3-Uncensored-32K
- GGUF de LWDCLS (IQ-Imatrix): https://huggingface.co/LWDCLS/llama3-8B-DarkIdol-2.3-Uncensored-32K-GGUF-IQ-Imatrix-Request
- GGUF de mradermacher (i1): https://huggingface.co/mradermacher/llama3-8B-DarkIdol-2.3-Uncensored-32K-i1-GGUF
- GGUF de mradermacher: https://huggingface.co/mradermacher/llama3-8B-DarkIdol-2.3-Uncensored-32K-GGUF
- GGUF de QuantFactory: https://huggingface.co/QuantFactory/llama3-8B-DarkIdol-2.3-Uncensored-32K-GGUF
- GGUF de ZeroWw: https://huggingface.co/ZeroWw/llama3-8B-DarkIdol-2.2-Uncensored-32K-GGUF
- Modelo base PoSE: https://huggingface.co/winglian/Llama-3-8b-PoSE
- Paper Model Stock: https://arxiv.org/abs/2403.19522
- mergekit: https://github.com/cg123/mergekit
- KoboldCpp: https://github.com/LostRuins/koboldcpp
- Fork de KoboldCpp: https://github.com/Nexesenex/kobold.cpp
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai/
- Backyard AI: https://backyard.ai/
- Layla Lite: https://www.layla-network.ai/
- mmproj LLaVA: https://huggingface.co/Nitral-AI/Llama-3-Update-3.0-mmproj-model-f16
- Tests de roles (version 1.2): https://huggingface.co/aifeifei798/llama3-8B-DarkIdol-1.2/tree/main/test
- Presets de LM Studio: https://huggingface.co/aifeifei798/llama3-8B-DarkIdol-1.2/tree/main/config-presets
- Twitter del autor: https://x.com/aifeifei799
- Character Tavern: https://character-tavern.com/
- CharacterHub: https://characterhub.org/
- Pygmalion: https://pygmalion.chat/
- Aetherroom: https://aetherroom.club/
- Ficha en Featherless: https://featherless.ai/models/aifeifei798/llama3-8B-DarkIdol-2.3-Uncensored-32K
