# KRAFTON/Raon-1-nano

## Resumen

Raon-1 nano es un modelo de lenguaje denso desarrollado por KRAFTON AI, orientado a generación de texto, seguimiento de instrucciones, conversación multi-turno y tool calling en coreano e inglés. Se publica bajo licencia Apache 2.0 como parte de la familia abierta Raon. El checkpoint contiene 3.529.911.376 parámetros en safetensors, aunque el autor describe 3,1B de parámetros efectivos en el modelo principal más 55M del módulo de Multi-Token Prediction (MTP); la diferencia respecto al recuento de safetensors proviene de la tabla de embeddings por capa.

Su rasgo técnico más distintivo es una arquitectura híbrida de atención: 18 de las 24 capas usan Raon Delta Attention (atención lineal con estado recurrente de tamaño fijo) y solo 6 usan Gated MLA, lo que reduce drásticamente el coste de caché KV (unos 7 KiB por token en BF16). Soporta de forma nativa hasta 262.144 tokens de contexto y se distribuye también en GGUF, MLX y LiteRT-LM para inferencia local, incluido Apple Silicon.

El modelo se deriva de Raon-1 mini preview (30B-A4B) mediante poda MoE-to-Dense y destilación de conocimiento, seguido de 3T tokens de preentrenamiento continuado y un post-entrenamiento con SFT, destilación on-policy y RL. Es relevante porque combina contexto largo, tool calling y despliegue on-device en un tamaño de 1,5B efectivos, un perfil poco habitual en modelos con ventanas de 256K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (18 capas Raon Delta Attention + 6 capas Gated MLA), con Raon-mHC, embeddings por capa y MTP |
| Parametros totales | 3.529.911.376 en safetensors; el autor indica 3,1B del modelo principal + 55M del módulo MTP |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible en detalle; se distribuyen formatos GGUF, MLX y LiteRT-LM para inferencia local |
| Idiomas soportados | Coreano e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF, MLX y LiteRT-LM para despliegue local |

## Arquitectura y entrenamiento

Raon-1 nano es un transformer denso de 24 capas con tamaño oculto 1.536 y FFN de 6.144 con activación SwiGLU. La innovación principal es la mezcla de atenciones en proporción 3:1: 18 capas de Raon Delta Attention (RDA), una atención lineal con regla delta con puertas separadas de borrado y escritura y estado recurrente de tamaño fijo, y 6 capas de Gated MLA con 32 cabezas, dimensión de cabeza 192 QK / 128 V y rango LoRA de 512 tanto en query como en KV. Solo estas 6 capas mantienen caché KV, lo que supone aproximadamente 7 KiB por token en BF16. El modelo no usa codificación posicional (NoPE). Incorpora Raon-mHC, una variante optimizada de las manifold-constrained hyper-connections de DeepSeek con 4 streams, que reduce el coste computacional y acelera el entrenamiento. Cada capa dispone además de un embedding propio de 256 dimensiones por token que ajusta la salida tras el MLP, y el LM head comparte pesos con el embedding de entrada (tied embeddings). El vocabulario es de 259.840 tokens.

El entrenamiento parte de Raon-1 mini preview (un MoE de 30B con 4B activos) mediante poda MoE-to-Dense y destilación de conocimiento, técnica descrita en el paper arXiv:2605.28207. Después se realizaron 3T tokens de preentrenamiento continuado y un post-entrenamiento que combina SFT, destilación on-policy (OPD) desde Raon-1 mini preview y una fase final de reinforcement learning. El checkpoint incluye una capa MTP de 55M parámetros, lo que habilita decodificación especulativa nativa.

## Capacidades

- Generación de texto y razonamiento conversacional en coreano e inglés, con especial énfasis en seguimiento fiel de instrucciones y de contexto.
- Tool calling dentro de conversaciones multi-turno, orientado a tareas de oficina y control de dispositivos móviles.
- Conversación multi-turno con ventanas de hasta 262.144 tokens, adecuada para documentos largos o historiales extensos.
- Decodificación especulativa mediante el módulo MTP incluido en el checkpoint.
- Despliegue on-device gracias a los formatos GGUF, MLX y LiteRT-LM, incluido hardware Apple Silicon.
- Capacidades bilingües asimétricas: fuerte rendimiento declarado en coreano y capacidades sólidas en inglés.
- No se documentan capacidades de visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Asistente de atención al cliente en coreano: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a los 262.144 tokens de contexto y a la caché KV reducida, lo que abarata servir sesiones largas en producción.
- Automatización de tareas de oficina con tool calling: integración con calendarios, correo o sistemas de tickets, donde el modelo encadena llamadas a funciones dentro de una conversación y mantiene el estado entre pasos.
- Control de dispositivos móviles por voz o texto: los formatos LiteRT-LM y GGUF permiten ejecutar el modelo en el propio dispositivo, reduciendo latencia y evitando enviar datos a la nube.
- Procesamiento de documentos largos en coreano e inglés: resumen, extracción y preguntas sobre contratos, informes o expedientes que superan los 100.000 tokens en una sola pasada.
- Asistente local en Apple Silicon: con los pesos MLX o GGUF, un portátil con memoria unificada puede ejecutar el modelo para tareas de redacción, resumen y clasificación sin conexión.
- Generación de código y scripting asistido: aunque no es su foco principal, el modelo puede integrarse en editores o pipelines para autocompletar y explicar fragmentos, con tool calling hacia linters o ejecutores.
- Chatbot bilingüe coreano-inglés para comunidades y soporte interno: el modelo alterna idiomas en la misma conversación y mantiene instrucciones de sistema complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona gráficas comparativas frente a modelos abiertos de tamaño similar en seguimiento de instrucciones, seguimiento de contexto y conversación en coreano, pero los valores numéricos no están recogidos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 7 GB solo para pesos (3,53B parámetros), más caché KV de aproximadamente 7 KiB por token en las capas MLA; 32K tokens añaden unos 0,2 GB de caché.
- En cuantización de 8 bits, los pesos bajan a unos 3,5-4 GB; en 4 bits, a unos 2 GB, aunque los valores exactos de las cuantizaciones publicadas no están disponibles.
- GPU recomendadas para servicio: A100 40/80 GB o H100 para lotes grandes y contexto completo de 262K; L40S o RTX 6000 Ada para despliegues de menor concurrencia.
- Cabe en GPU de consumo: sí. Una RTX 4090 (24 GB) puede ejecutar el modelo en BF16 con contexto moderado, y tarjetas de 8-12 GB pueden hacerlo en cuantizaciones de 4-8 bits.
- Despliegue: transformers de referencia; vLLM y TGI para servir en GPU (la compatibilidad con la arquitectura híbrida debe verificarse); llama.cpp/Ollama vía GGUF; MLX para Apple Silicon; LiteRT-LM para móvil.
- Latencia y throughput: no disponibles. La atención lineal en 18 de 24 capas y la caché KV reducida deberían mejorar el coste por token en contextos largos frente a un transformer de atención completa equivalente, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Raon-1 nano | 3,1B efectivos (3,53B en safetensors) | 262.144 | Apache 2.0 | Híbrido RDA/MLA, tool calling, coreano e inglés, formatos on-device |
| Qwen3-1.7B | 1,7B | 32.768 (extensible) | Apache 2.0 | Denso, multilingüe amplio, sin contexto de 256K nativo |
| Llama 3.2 1B | 1,2B | 131.072 | Llama 3.2 Community License | Denso, foco inglés, licencia con restricciones |
| Gemma 3 1B | 1B | 32.768 | Gemma Terms of Use | Denso, multilingüe, licencia no Apache |

La comparación de rendimiento con estas alternativas no está disponible en la información proporcionada; la model card solo indica que Raon-1 nano lidera frente a modelos abiertos de tamaño similar en los benchmarks de instrucciones, contexto y conversación en coreano que muestra.

## Limitaciones y advertencias

- Idiomas limitados a coreano e inglés; el rendimiento en castellano u otras lenguas no está documentado y probablemente sea inferior.
- Riesgo de alucinación inherente a un modelo de 1,5B efectivos; no debe usarse como fuente de verdad sin verificación en dominios sensibles.
- El soporte de tool calling está orientado a tareas cotidianas (oficina, control móvil); la fiabilidad en flujos de agentes complejos no está cuantificada.
- La arquitectura híbrida con RDA y NoPE requiere `custom_code` y puede no ser compatible con todos los motores de inferencia sin adaptaciones.
- El contexto nativo de 262.144 tokens no garantiza recuperación fiable en todo el rango; conviene validar el rendimiento en la longitud real de uso.
- Aunque la licencia Apache 2.0 permite uso comercial sin restricciones adicionales, deben revisarse las licencias de los formatos derivados (GGUF, MLX, LiteRT-LM) y de las dependencias de `custom_code`.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad; en producción conviene añadir filtros y evaluaciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KRAFTON/Raon-1-nano
- Organización KRAFTON en Hugging Face: https://huggingface.co/KRAFTON
- Web de KRAFTON AI: https://krafton.ai/en/
- Paper MoE-to-Dense: https://arxiv.org/abs/2605.28207
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
