# aifeifei798/DarkIdol-Qwen3.8-27B-v1.1

## Resumen

DarkIdol-Qwen3.8-27B-v1.1 es un modelo de lenguaje multimodal desarrollado por aifeifei798 a partir del modelo base Qwen/Qwen3.8-27B. Se trata de un fine-tune especializado en roleplay de alta inmersión, escritura creativa interactiva y simulación narrativa compleja, orientado a aplicaciones como SillyTavern, juegos de rol de mesa y novelas visuales. El modelo está diseñado con una filosofía "roleplay-first": prioriza la consistencia del personaje, evita usurpar la agencia del usuario y produce prosa literaria en lugar de respuestas de asistente genérico.

Arquitectónicamente, es un modelo denso de 27.356.728.560 parámetros (27.36B) con pipeline image-text-to-text, lo que indica soporte multimodal de visión además de texto. Incluye un razonamiento integrado tipo chain-of-thought mediante etiquetas `think` y una torre de visión `mmproj` para procesar imágenes de personajes, escenas o mapas. El modelo está publicado bajo licencia Apache 2.0 y pesa 55.6 GB en formato safetensors.

Su relevancia actual radica en la creciente demanda de modelos especializados en narrativa interactiva que mantengan coherencia de personaje y eviten el comportamiento "preachy" o servil de los asistentes alineados. DarkIdol se posiciona como una alternativa para creadores de ficción y entusiastas del roleplay que necesitan un motor narrativo con control fino sobre la voz de los NPC y la progresión de la trama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B) |
| Parametros totales | 27.356.728.560 (27.36B) |
| Parametros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th, zh, ko, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DarkIdol-Qwen3.8-27B-v1.1 es un fine-tune del modelo base Qwen/Qwen3.8-27B, que a su vez es un transformer multimodal capaz de procesar texto e imágenes. El fine-tune se ha realizado con un enfoque específico para narrativa interactiva y roleplay, aunque no se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. La model card indica que el modelo incorpora un razonamiento cognitivo integrado mediante cadenas de pensamiento (`think`), que le permite analizar subtexto psicológico, gestionar estados de inventario o lógica y detectar trampas narrativas antes de generar prosa.

La innovación técnica destacable es la combinación de una torre de visión `mmproj` con un motor de generación de prosa literaria. Esto permite al modelo recibir imágenes simultáneas, como fichas de personaje, arte de escenas o mapas de tablero, y usarlas como contexto narrativo. El modelo mantiene una filosofía anti-puppeteering, lo que significa que actúa estrictamente dentro de los límites del NPC y nunca escribe diálogos ni acciones del usuario.

## Capacidades

- Generación de prosa literaria con registro vernáculo y cadencia adaptada a géneros como gótico sureño, grimdark victoriano y tech-noir en inglés, y a intriga cortesana clásica o realismo postapocalíptico en chino.
- Roleplay de alta inmersión con estricto anti-puppeteering: el modelo no usurpa la agencia del usuario ni escribe sus acciones o diálogos.
- Consistencia de personaje orgánica: los NPC se comportan según sus motivos, defectos y lealtades, incluyendo villanos, cínicos y supervivientes moralmente ambiguos.
- Razonamiento integrado tipo chain-of-thought mediante etiquetas `think`, útil para analizar subtexto psicológico, gestionar inventario o lógica de estados y detectar trampas narrativas.
- Multimodalidad de visión nativa: admite entrada de imágenes mediante la torre `mmproj` para fichas de personaje, arte de escenas y análisis de mapas de tablero.
- Soporte multilingüe para 10 idiomas, con especial énfasis en inglés y chino según la model card.
- Generación de texto y storytelling interactivo, orientado a aplicaciones como SillyTavern, TRPG y novelas visuales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible más allá del modo de razonamiento integrado.

## Casos de uso

- Roleplay en SillyTavern: el modelo puede gestionar conversaciones multi-turno con un NPC manteniendo su voz y personalidad de forma consistente, sin escribir las acciones del usuario. Es adecuado porque está específicamente fine-tuneado para este propósito y evita la "predica" moral típica de los asistentes alineados.
- Simulación de NPC en juegos de rol de mesa (TRPG): el modelo puede interpretar personajes complejos con motivaciones, defectos y lealtades realistas, incluyendo antagonistas que no se suavizan. Se usaría como director de juego asistido o como intérprete de personajes no jugadores.
- Escritura creativa interactiva: sirve para novelas visuales o ficción interactiva donde el usuario toma decisiones y el modelo genera prosa narrativa coherente con la trama, adaptándose al estilo literario del género.
- Análisis de imágenes de escenas y mapas: gracias a su torre de visión, puede recibir arte de escenas, mapas de tablero o fichas de personaje como entrada y usarlas como contexto para la narración, útil en campañas de rol que usan material visual.
- Generación de prosa literaria en inglés y chino: para autores que necesitan un modelo que produzca texto con cadencia y vocabulario específicos de géneros como gótico sureño, grimdark victoriano o intriga cortesana china.
- Prototipado de narrativa interactiva para juegos: desarrolladores de videojuegos narrativos pueden integrar el modelo en un motor de diálogo para generar respuestas dinámicas de personajes, aprovechando su consistencia de personaje y su capacidad de razonamiento para tramas ramificadas.
- Creación de contenido para comunidades de roleplay online: el modelo puede usarse en foros o servidores de rol por texto para interpretar múltiples personajes con voces diferenciadas, sin romper la inmersión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. El modelo está etiquetado como compatible con `transformers` y `endpoints_compatible`, pero no se especifican frameworks concretos como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente como motor de ficción interactiva. Todos los contenidos generados, incluyendo afirmaciones históricas, científicas, médicas, legales o técnicas, son alucinaciones sintéticas creadas para servir a la trama y no deben tomarse como hechos reales.
- Los personajes dentro de la narrativa pueden mentir, exagerar, mostrar sesgos irracionales o inventar ciencia inexistente según su personalidad ficticia.
- Cualquier fórmula química, ecuación, fragmento de código, script de explotación o instrucción técnica generada es "tecnobabble de argumento" y no es funcional ni segura en el mundo real. No se debe ejecutar ni intentar replicar.
- Existe un riesgo alto de alucinación por diseño, lo que hace inadecuado el modelo para cualquier consulta factual, asesoramiento legal, financiero, médico o de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero la Acceptable Use Policy del autor prohíbe explícitamente generar contenido relacionado con materiales CBRN, narcóticos ilícitos, explosivos, CSAM, autolesión y ciberataques.
- No se han publicado datos sobre sesgos específicos, limitaciones de contexto o restricciones de idioma más allá de la advertencia de que el modelo es puramente ficticio.
- Se recomienda no usar el modelo en producción para tareas de asistencia, programación o información factual, ya que no está alineado para ello y sus outputs no son verificables.

## Enlaces

- HuggingFace: https://huggingface.co/aifeifei798/DarkIdol-Qwen3.8-27B-v1.1
