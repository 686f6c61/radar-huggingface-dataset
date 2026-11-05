# SicariusSicariiStuff/Impish_Bloodmoon_12B

## Resumen

Impish_Bloodmoon_12B es un ajuste fino (fine-tune) del modelo Mistral-Nemo-Instruct-2407 desarrollado por el usuario independiente SicariusSicariiStuff. Se trata de un modelo de lenguaje de 12.247.802.880 parámetros (aproximadamente 12,2 mil millones) orientado a generación de texto en inglés, con un enfoque declarado hacia el roleplay y las narrativas de aventura, tal como indican los enlaces a las "Roleplay cards" y "Adventure cards" que el autor mantiene en su perfil de HuggingFace.

El modelo parte de la arquitectura Mistral Nemo, un transformer denso con atención por ventanas deslizantes y contexto largo, y se ha entrenado sobre el dataset propietario `SicariusSicariiStuff/UBW_Tapestries`. La model card original está mayoritariamente compuesta por elementos HTML/CSS de presentación y enlaces, con muy poca documentación técnica sustantiva sobre el proceso de entrenamiento, los hiperparámetros o la composición del dataset.

Su relevancia actual es limitada pero concreta: se trata de un modelo de nicho, con 69 descargas y 111 likes en el momento de la consulta, pensado para comunidades de roleplay y generación creativa que buscan variantes afinadas de Mistral Nemo con una "voz" estilística particular. No está orientado a tareas de producción empresarial ni a benchmarks académicos, y no se han publicado resultados de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral-Nemo-Instruct-2407) |
| Parametros totales | 12.247.802.880 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Mistral Nemo soporta 128k tokens, pero el fine-tune no documenta cambios) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; la model card menciona una seccion de "quantizations" sin detallar los formatos |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Mistral-Nemo-Instruct-2407, que emplea una arquitectura transformer densa con atención por ventanas deslizantes (sliding window attention) y mecanismos de atención estándar de la familia Mistral. Al ser un ajuste fino, conserva la arquitectura, la tokenización y el tamaño de vocabulario del modelo base; el número de parámetros coincide con el de Mistral Nemo (12,2B). No se documenta en la model card ninguna modificación estructural, como cambios en las capas de atención o en el esquema de positional encoding.

En cuanto al entrenamiento, la única información disponible es que se utilizó el dataset `SicariusSicariiStuff/UBW_Tapestries`, de autoría propia, y que el autor menciona haber necesitado "hacer un adapter" y haber aprovechado para probar "hasta dónde llega Nemo 12". No se especifican el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO, ni los hiperparámetros (learning rate, batch size, épocas). La model card incluye una sección de "training details" enlazada, pero el contenido técnico sustantivo no está presente en la información proporcionada. No se documentan innovaciones técnicas destacables más allá del propio ajuste estilístico.

## Capacidades

- Generación de texto en inglés con un estilo narrativo y creativo, presumiblemente orientado a roleplay y ficción interactiva según el enfoque declarado del autor.
- Razonamiento general y conversación multi-turno, heredados de las capacidades del modelo base Mistral-Nemo-Instruct.
- Generación de código y matemáticas básicas, como capacidad heredada del modelo base, aunque no documentada específicamente para este fine-tune.
- Soporte de tool calling / function calling: no documentado en la información proporcionada para este fine-tune concreto (el modelo base Mistral Nemo sí lo soporta, pero no se confirma que se haya preservado).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada (`en`).
- Modo "thinking" o razonamiento extendido: no documentado.
- Capacidades de visión o audio: no disponibles (modelo solo de texto).
- Integración con "Roleplay cards" y "Adventure cards" publicadas por el autor como recursos complementarios para sesiones de juego de rol y aventuras narrativas.

## Casos de uso

- Roleplay conversacional: el modelo está afinado específicamente para este escenario, y el autor proporciona tarjetas de personaje ("Roleplay cards") que se pueden combinar con el modelo para mantener personajes coherentes en conversaciones multi-turno. Es adecuado por su ajuste estilístico y por el ecosistema de recursos que lo acompaña.
- Aventuras narrativas interactivas: las "Adventure cards" del autor sugieren un uso como motor de ficción interactiva, donde el modelo genera descripciones, diálogos y consecuencias de las acciones del jugador. Su entrenamiento sobre un dataset narrativo propio lo hace más adecuado que el modelo base para este tipo de tareas.
- Generación creativa de ficción: escritura de relatos, diálogos y escenas con un tono estilizado, aprovechando el ajuste fino sobre `UBW_Tapestries`. Adecuado para escritores que buscan una voz concreta y no un asistente genérico.
- Prototipado de chatbots de personaje: dada su licencia Apache 2.0, se puede desplegar en demos públicas o internas de asistentes con personalidad sin restricciones comerciales derivadas de la licencia.
- Experimentación académica con fine-tunes de Mistral Nemo: sirve como caso de estudio de ajuste fino sobre un modelo base de 12B con un dataset pequeño y propietario, útil para investigar cómo se degradan o preservan capacidades del modelo base tras el fine-tune.
- Generación de contenido para juegos de mesa o rol de mesa: el modelo puede generar descripciones de escenarios, encuentros y PNJ (personajes no jugadores) para partidas, integrado en herramientas de asistencia al máster.
- Base para nuevos fine-tunes comunitarios: al ser Apache 2.0 y estar en safetensors, otros desarrolladores pueden partir de él para ajustes adicionales en dominios narrativos o de rol.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 24,5 GB solo para los pesos (12,2B parámetros × 2 bytes), más overhead de activaciones y caché KV, por lo que se recomienda un mínimo de 28-32 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 12-13 GB, viable en GPUs de 16 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4_K_M): aproximadamente 7-8 GB, viable en GPUs consumer de 8-12 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para FP16 sin compromisos; RTX 4090 (24 GB) para FP16 con contexto limitado o 8 bits con contexto amplio; RTX 3090 (24 GB) en las mismas condiciones; RTX 4080/4070 Ti Super (16 GB) en 8 bits; RTX 3060 12 GB o RTX 4060 Ti 16 GB en 4 bits.
- Cabe en GPU consumer: sí, en cuantizaciones de 4 y 8 bits en GPUs de 8-16 GB; en FP16 requiere GPUs de 24 GB o superiores con gestión cuidadosa del contexto.
- Opciones de despliegue: llama.cpp y Ollama para cuantizaciones GGUF; vLLM y TGI para FP16/BF16 en servidor; transformers con accelerate para uso en scripts. La model card menciona una sección de cuantizaciones disponibles, pero no detalla qué formatos concretos se han publicado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Impish_Bloodmoon_12B | 12,2B | No disponible (base: 128k) | Apache 2.0 | Roleplay / narrativa | HuggingFace, safetensors |
| Mistral-Nemo-Instruct-2407 | 12,2B | 128k | Apache 2.0 | Asistente general | HuggingFace, safetensors |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32k | Apache 2.0 | Asistente general | HuggingFace, safetensors |
| Llama-3.1-8B-Instruct | 8,0B | 128k | Llama 3.1 Community License | Asistente general | HuggingFace, safetensors |

La comparación con Mistral-Nemo-Instruct-2407 es la más directa, ya que Impish_Bloodmoon_12B es un fine-tune suyo: comparten arquitectura, tamaño y licencia, y difieren en el ajuste estilístico y en la documentación técnica disponible (mucho más exhaustiva en el modelo original de Mistral AI). Frente a Mistral-7B-Instruct-v0.3 y Llama-3.1-8B-Instruct, el modelo es un 50-70% más grande, lo que implica mayores requisitos de VRAM, pero también mayor capacidad potencial; sin embargo, no hay benchmarks publicados que permitan comparar rendimiento real. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Documentación técnica muy escasa: la model card está dominada por HTML/CSS de presentación y no detalla hiperparámetros, composición del dataset ni evaluación, lo que dificulta evaluar su calidad de forma rigurosa.
- Riesgo de alucinación: como todo modelo de lenguaje de 12B, puede generar información falsa con apariencia de verosimilitud, especialmente en dominios factuales; su ajuste hacia narrativa puede agravar este comportamiento en contextos que requieren precisión.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un dataset propietario no descrito, no es posible auditar sesgos de género, raza, religión o ideología.
- Limitación de idioma: solo se declara inglés; el rendimiento en castellano no está garantizado y probablemente sea deficiente en comparación con modelos multilingües.
- Riesgo de degradación de capacidades del modelo base: los fine-tunes estilísticos sobre datasets pequeños pueden reducir el rendimiento en tareas de razonamiento, código o matemáticas respecto a Mistral-Nemo-Instruct-2407; no hay datos que confirmen o descarten esta degradación.
- Contexto: aunque el modelo base soporta 128k tokens, no se documenta si el fine-tune preserva esa ventana o si se ha reducido durante el entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el contenido generado ni sobre el cumplimiento de las políticas de uso del modelo base de Mistral AI.
- Modelo de nicho con muy pocas descargas (69): no hay evidencia de comunidad amplia que haya validado su comportamiento en producción.
- Fecha de creación (1 de septiembre de 2025) y actualización posterior (noviembre de 2026): la model card menciona que el repositorio se creó en septiembre y que en diciembre el autor publicó "dos modelos", lo que sugiere posibles inconsistencias o actualizaciones no documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SicariusSicariiStuff/Impish_Bloodmoon_12B
- Dataset de entrenamiento: https://huggingface.co/datasets/SicariusSicariiStuff/UBW_Tapestries
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Roleplay cards del autor: https://huggingface.co/SicariusSicariiStuff/Roleplay_Cards
- Adventure cards del autor: https://huggingface.co/SicariusSicariiStuff/Adventure_Cards
- Página de apoyo del autor (Ko-fi): https://ko-fi.com/sicarius
