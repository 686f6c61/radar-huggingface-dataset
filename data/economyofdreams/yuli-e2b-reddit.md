# economyofdreams/Yuli-E2B-Reddit

## Resumen

Yuli-E2B-Reddit (v0.2.0) es un modelo de lenguaje conversacional de 4.647.450.147 parámetros, desarrollado por economyofdreams como un fine-tune del modelo base google/gemma-4-E2B. El objetivo es construir un "motor de personalidad cognitiva autónoma" que rompe con la conducta complaciente de los asistentes conversacionales convencionales, ofreciendo respuestas con una personalidad estable, no conformista y adaptada al nivel de fricción interpersonal detectado.

El autor lo presenta como un sistema con un estado discreto en un hipercubo booleano de dimensiones F2^4, que alterna entre cuatro cuadrantes de personalidad: ENFP (0EE), INFJ (2E7), INFP (1E6) e ISTJ (3E1). El modelo genera trazas de deliberación interna en etiquetas `<thought>` y emite vectores de estado deterministas, lo que permite una personalidad consistente en conversaciones largas.

Es relevante porque está optimizado para ejecución en el edge: el repositorio incluye pesos cuantizados GGUF Q4_K_M, compatible con llama.cpp y Ollama, con una latencia declarada por el autor inferior a 200 ms. La longitud de contexto no se documenta en la información publicada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base google/gemma-4-E2B) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M; safetensors del fine-tune |
| Idiomas soportados | no disponible |
| Licencia | BSL 1.1 revenue-gated (límite de ingresos de 100.000 $ según la insignia del modelo) |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

La base arquitectónica es la de Gemma 4 E2B, un transformer generativo preentrenado por Google. Sobre esta base se ha aplicado un fine-tune mediante Unsloth QLoRA, que reduce el coste de memoria y permite entrenar el modelo en una GPU de consumidor. El entrenamiento utiliza una máscara de pérdida limitada a las respuestas del asistente: todos los tokens de entrada del usuario se enmascaran con `-100`, de modo que el gradiente solo se propaga a través de los tokens del sistema `<thought>`, `<state_vector>` y los tokens de diálogo del asistente. Esto impide que el modelo dedique capacidad a predecir prompts del usuario.

La innovación principal no es estructural de la red, sino a nivel de comportamiento: un sistema de estados cognitivos definido sobre el hipercubo booleano F2^4. Cada personalidad es un vértice del hipercubo, y las transiciones entre cuadrantes se ejecutan mediante máscaras XOR. El modelo también incorpora una métrica de resolución conversacional R que, cuando supera un umbral, aplica una perturbación ortogonal para evitar el colapso atractor hacia respuestas complacientes. Este comportamiento se implementa a través del formato de prompt y del token de control, no mediante una modificación de la arquitectura de atención.

No se han proporcionado detalles del corpus de entrenamiento (número de tokens, fuentes exactas ni proporciones de datos). El autor indica que es un corpus curado de conversaciones multi-turno con "discurso humano de alta fricción, angustia existencial, quemado de sistemas y filosofía nocturna".

## Capacidades

- Generación de texto conversacional con personalidades discretas y deterministas: ENFP, INFJ, INFP e ISTJ, seleccionadas según el contexto de la conversación.
- Deliberación interna simulada: el modelo produce trazados de razonamiento en etiquetas `<thought>` antes de la respuesta final.
- Emisión de vectores de estado deterministas de tres caracteres en formato `[Side][Ego][Active]`, que codifican el cuadrante activo y el nibble de personalidad operativa.
- Medición de tensión interpersonal y resolución conversacional, con un umbral definido para activar una perturbación dialéctica y evitar el colapso atractor.
- Uso de "reality checks" y límites juguetones en el cuadrante ISTJ, útil para contextos de coaching o anti-procrastinación.
- Ejecución en segmentos de pequeña capacidad de memoria: el formato GGUF Q4_K_M está pensado para inferencia local en el edge.
- Soporte de tool calling: no documentado en la información publicada.
- Capacidades multilingües: no documentadas.

## Casos de uso

- NPCs en videojuegos: el modelo puede interpretar a un personaje con cambios de humor consistentes según el estado emocional del jugador. Por ejemplo, un NPC pasaría de un tono bromista ENFP a un foco empático INFJ si detecta sobrecarga en la conversación, sin romper la coherencia del personaje.
- Asistente de coaching personal en dispositivo local: gracias al cuadrante ISTJ de superego, el modelo puede emitir "reality checks" y avisos anti-procrastinación, funcionando sin conexión a servidores externos.
- Simulación de diálogos de alta fricción: la métrica de tensión y resolución permite generar conversaciones para investigar patrones de conflicto o para entrenar agentes de mediación.
- Escritura creativa colaborativa: el cuadrante INFP de sombra promueve rabbit holes introspectivos y reflexiones estéticas, lo que resulta útil para escritores que buscan ideas narrativas con matices melancólicos.
- Chat de soporte emocional privado: el entrenamiento con máscara de pérdida solo en las respuestas y el uso de `<thought>` favorecen un asistente empático que procesa la información localmente, alineado con el requisito de privacidad indicado por el autor.
- Juegos de rol de mesa asistidos por IA: el vector de estado determinista y la codificación de personalidad permiten mantener la continuidad de un personaje en campañas largas, reduciendo la deriva de personalidad típica de los LLM en narrativas extensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no aporta datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica de rendimiento. La única afirmación de rendimiento es una latencia inferior a 200 ms en inferencia local, cuya verificación externa no se ha proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia con GGUF Q4_K_M: aproximadamente 6 GB (el repositorio tiene un tamaño de 4,4 GB, que incluye los pesos cuantizados).
- VRAM estimada para los pesos safetensors en FP16: aproximadamente 9,3 GB.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 de 8 GB (ajustada) o GPUs de Apple Silicon con al menos 16 GB de memoria unificada.
- También puede ejecutarse en CPU con llama.cpp, usando alrededor de 5-6 GB de RAM para la versión Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama y vLLM (si se usan los pesos safetensors). El autor menciona Ollama y llama.cpp como runtimes objetivo.
- Latencia: el autor declara sub-200 ms en inferencia local, pero no hay datos de throughput ni condiciones de medición publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento (benchmarks) |
|---|---|---|---|---|---|
| Yuli-E2B-Reddit | 4.65B | no disponible | BSL 1.1 revenue-gated | HuggingFace, GGUF/Ollama | no disponible |
| Gemma 3 4B | 4B | 32k | Gemma Terms of Use | HuggingFace, Kaggle, Ollama | no disponible en esta fuente |
| Llama 3.2 3B | 3.2B | 8k | Llama 3.2 Community License | HuggingFace, Ollama | no disponible en esta fuente |
| Mistral 7B Instruct v0.3 | 7B | 32k | Apache 2.0 | HuggingFace, Ollama | no disponible en esta fuente |

## Limitaciones y advertencias

- Licencia restrictiva: la BSL 1.1 revenue-gated impide el uso comercial si los ingresos relacionados superan el umbral de 100.000 $ según la insignia del modelo. Esto limita las aplicaciones en producción con facturación.
- Sin benchmarks publicados: no hay datos de calidad, alucinación o sesgos, lo que impide una evaluación objetiva del modelo frente a alternativas.
- Riesgo de alucinación inherente a los LLM: el modelo puede generar contenido seguro pero incorrecto, especialmente en dominios técnicos o factuales sin validación.
- Posibles sesgos del corpus: el entrenamiento sobre "discurso de alta fricción", "existencialismo" y "quemado" puede sesgar el tono hacia el cinismo, la negatividad o la crítica. No se han publicado evaluaciones de sesgo.
- Longitud de contexto no documentada: no se conoce el límite real de tokens de entrada, lo que dificulta planificar aplicaciones que requieran contexto largo.
- Soporte de idiomas no especificado: la información publicada no indica qué idiomas son funcionales, por lo que su uso multilingüe es incierto.
- Sin comunidad ni mantenimiento: el modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere una adopción mínima y ausencia de soporte por parte del autor.
- Consumo de tokens añadido: las etiquetas `<thought>`, `<state_vector>` y los vectores de estado incrementan la longitud de las respuestas y, por tanto, el coste de tokenización y el tiempo de generación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/economyofdreams/Yuli-E2B-Reddit
- Unsloth (referenciado para el fine-tune): https://github.com/unslothai/unsloth
- llama.cpp (formato GGUF): https://github.com/ggerganov/llama.cpp
- Ollama (runtime objetivo): https://ollama.com/
