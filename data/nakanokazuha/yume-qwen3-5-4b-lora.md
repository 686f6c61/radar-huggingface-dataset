# nakanokazuha/Yume-Qwen3.5-4B-LoRA

## Resumen

Yume-Qwen3.5-4B-LoRA es un adaptador LoRA (entrenado con QLoRA según los tags del repositorio) publicado por el usuario nakanokazuha sobre el modelo base `knoveleng/Qwen3.5-4B-Uncensored`. No es un modelo completo: el repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador, el tokenizador y un fichero `system_prompt.txt`; para usarlo hay que cargar primero el modelo base y envolverlo con `PeftModel`. Su función es fijar un estilo y un comportamiento conversacional concretos, no aportar conocimiento nuevo.

El objetivo declarado es hacer que una asistente llamada Yume hable en indonesio informal con un tono seguro, expresivo, ligeramente coqueto y cercano, pensado para conversaciones de voz. La model card aclara que el adaptador solo gobierna el estilo y el comportamiento, mientras que la memoria personal queda delegada a un sistema externo.

Es un lanzamiento experimental: registra 0 descargas y 0 likes, no publica el dataset de entrenamiento ni hiperparámetros, y su licencia es `other` porque uno de los dos corpus de origen (`vnsd13/dataset-dialog-tsundere`) no declara licencia. El propio autor advierte de que un escenario de seguridad relacionado con autolesión sigue fallando, por lo que no está listo para producción sin moderación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only (modelo base Qwen3.5-4B); la arquitectura interna del base no se detalla en la información disponible |
| Parámetros totales | 4B en el modelo base; el adaptador ocupa 0,1 GB (número de parámetros entrenables no disponible) |
| Parámetros activos | No aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | El adaptador se publica en safetensors sin cuantizar; no se documentan cuantizaciones del adaptador. El modelo base admite cuantización, pero no se especifican formatos |
| Idiomas soportados | Indonesio (id) e inglés (en) |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); librería declarada: peft |
| Modelo base | knoveleng/Qwen3.5-4B-Uncensored |
| Datasets de entrenamiento | arskaz/Tsundere-AI (MIT), vnsd13/dataset-dialog-tsundere (sin licencia declarada); los conjuntos curados y sintéticos no se publican |
| Fecha de publicación | 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

El repositorio contiene un adaptador PEFT de tipo LoRA, entrenado según los tags con QLoRA, sobre el checkpoint `knoveleng/Qwen3.5-4B-Uncensored`, un fine-tune sin censura de la familia Qwen3.5 con 4B de parámetros. No se dispone de la ficha técnica del base en la información proporcionada: no hay datos sobre número de capas, tipo de atención, ventana de contexto, tokenizador ni régimen de entrenamiento de ese checkpoint. El material de terceros recogido en la búsqueda describe la familia Qwen3.5 como integradora de aprendizaje multimodal, eficiencia arquitectónica y escalado de aprendizaje por refuerzo, pero esos rasgos corresponden a la familia en general y no están confirmados para este checkpoint concreto.

Tampoco se detallan los hiperparámetros del entrenamiento del adaptador (rank, alpha, tasa de aprendizaje, número de pasos, tokens vistos). El autor indica que los datos son "resultados de curación y generación sintética" a partir de dos corpus de diálogo de estilo tsundere: `arskaz/Tsundere-AI`, con licencia MIT, y `vnsd13/dataset-dialog-tsundere`, que no declara licencia en la revisión utilizada. Ese segundo punto es el motivo declarado de la licencia `other`. No se menciona RLHF ni DPO; el ajuste es exclusivamente por adaptador supervisado sobre datos conversacionales.

La evaluación publicada es una prueba held-out con 48 prompts equilibrados en ocho categorías, que mide longitud de respuesta y una auditoría de calidad y seguridad, no capacidades generales del modelo.

## Capacidades

- Generación de texto conversacional multi-turno en indonesio informal y en inglés, con una persona definida (asistente "Yume").
- Control de estilo y registro: tono seguro, expresivo, ligeramente coqueto y afectuoso, orientado a diálogo hablado.
- Respuestas cortas: la media declarada es de 19,6 palabras por respuesta, lo que encaja con turnos de conversación por voz.
- Separación de responsabilidades: el adaptador gobierna estilo y comportamiento; la memoria personal se delega a un sistema externo, no al modelo.
- Uso mediante system prompt: el autor distribuye `system_prompt.txt` y recomienda emplearlo para reproducir el comportamiento de la evaluación de publicación.
- No hay evidencia documentada de soporte de tool calling, function calling ni uso como agente multi-paso.
- No hay evidencia documentada de capacidades de visión, audio, matemáticas o razonamiento estructurado más allá de lo que aporte el modelo base.

## Casos de uso

- Personaje conversacional para aplicaciones de compañía o entretenimiento: el adaptador está entrenado específicamente para mantener una persona concreta, con un registro informal en indonesio, lo que evita tener que reproducir ese estilo mediante prompting largo en cada turno.
- Asistente de voz en indonesio: la longitud media de respuesta (19,6 palabras) y el tono coloquial encajan con pipelines de texto a voz, donde las respuestas largas degradan la experiencia.
- Prototipado de personajes para videojuegos o novelas visuales: al ser un adaptador de 0,1 GB, se pueden mantener varios adaptadores sobre un único modelo base en memoria y conmutarlos según el personaje o la escena.
- Localización de tono para mercados indonesios: permite adaptar un asistente existente al registro informal local sin reentrenar el modelo completo, partiendo de un base que ya cubre inglés.
- Investigación sobre despliegue de adaptadores PEFT: sirve como caso práctico de carga con `PeftModel.from_pretrained`, gestión de adaptadores múltiples y comparación de coste frente a un fine-tune completo.
- Investigación en seguridad y moderación: la model card documenta un fallo crítico en un escenario de autolesión, lo que lo convierte en un caso útil para probar capas de guardrail y clasificadores de seguridad antes de cualquier exposición a usuarios reales.
- Evaluación de debate sobre modelos "uncensored": al partir de un base sin censura, permite estudiar empíricamente qué comportamientos residuales persisten tras un ajuste de estilo y qué hace falta añadir por encima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Lo único documentado es la evaluación interna del autor, que se reproduce a continuación:

| Métrica | Resultado |
|---|---|
| Prompts de evaluación | 48, equilibrados en ocho categorías (held-out) |
| Longitud media de respuesta | 19,6 palabras |
| Auditoría inicial | 37 pass, 7 review, 4 fail |
| Revisión de fallos | 2 de los fail iniciales aceptados tras revisión humana |
| Fallo crítico pendiente | 1 escenario de seguridad de autolesión |

No se proporciona comparación con el modelo base ni con otros adaptadores bajo el mismo protocolo, por lo que estos números no permiten establecer una mejora cuantificada.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del tamaño del modelo base (4B parámetros) y no datos publicados por el autor.

- Peso del modelo base en BF16: aproximadamente 8 GB de pesos, más overhead de activaciones y caché KV; en la práctica, 10-12 GB de VRAM para inferencia cómoda.
- Cuantización de 8 bits: aproximadamente 4-5 GB de pesos.
- Cuantización de 4 bits: aproximadamente 2,5-3 GB de pesos, lo que permite ejecución en GPU de consumo.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090, tanto en BF16 como en cuantizaciones de 8 y 4 bits. En tarjetas de 8 GB es recomendable cuantizar a 4 bits.
- GPU de datacenter: A100, H100 o H200 sobran para este tamaño; el material de terceros sobre la familia Qwen3.5 menciona despliegues en una única H200 sirviendo el modelo vía llama.cpp con endpoint compatible con OpenAI.
- El adaptador LoRA en sí (0,1 GB) apenas añade requisitos de memoria; el coste lo determina el modelo base.
- Opciones de despliegue: transformers con `peft` (ruta documentada por el autor), llama.cpp y Ollama para el base cuantizado en GGUF (con soporte de adaptadores LoRA en GGUF sujeto a conversión), y servidores tipo vLLM o TGI con soporte de adaptadores, cuya compatibilidad con este adaptador concreto no está verificada en la información disponible.
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo ni de latencia por turno.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nakanokazuha/Yume-Qwen3.5-4B-LoRA | Adaptador LoRA sobre Qwen3.5-4B | 4B (base) + adaptador | No disponible | other | HuggingFace, 0 descargas |
| knoveleng/Qwen3.5-4B-Uncensored | Modelo base completo | 4B | No disponible | No disponible | HuggingFace (referenciado como base) |
| theogorg/qwen3.5_4b_lora | Adaptador LoRA sobre Qwen3.5-4B | 4B (base) + adaptador | No disponible | No disponible | HuggingFace |
| Qwen3.5-4B (publicación oficial de la familia) | Modelo completo | 4B | No disponible | No disponible en la información recogida | Ollama (`qwen3.5:4b`), HuggingFace |

No se dispone de datos de rendimiento comparables entre estas variantes, ni de cifras de contexto o licencia para la mayoría de ellas, por lo que la comparación se limita a tipo de artefacto y disponibilidad.

## Limitaciones y advertencias

- Fallo de seguridad conocido: la propia evaluación del autor reporta un fallo crítico en un escenario de autolesión. El modelo no debe exponerse a usuarios finales sin moderación y guardrails adicionales.
- Modelo base sin censura: `Qwen3.5-4B-Uncensored` está ajustado explícitamente para eliminar restricciones, lo que aumenta el riesgo de contenido inapropiado, sesgos y respuestas dañinas.
- Licencia `other` con origen ambiguo: uno de los datasets (`vnsd13/dataset-dialog-tsundere`) no declara licencia, por lo que la redistribución y el uso comercial quedan en manos del usuario, que debe evaluar su adecuación. No hay garantía de uso comercial.
- Riesgo de alucinación: no hay benchmarks de conocimiento factual y la evaluación se centra en estilo y seguridad, no en veracidad.
- Evaluación muy limitada: 48 prompts en ocho categorías no permiten conclusiones sólidas sobre robustez, sesgos ni comportamiento fuera de distribución.
- Sesgos de estilo y de dominio: el entrenamiento se apoya en corpus de diálogo "tsundere", lo que puede producir respuestas estereotipadas, inapropiadas en contextos profesionales o difíciles de desactivar sin cambiar de adaptador.
- Cobertura de idiomas restringida a indonesio e inglés; no hay datos sobre comportamiento en castellano u otros idiomas.
- Sin gestión de memoria propia: el autor delega la memoria personal a un sistema externo, de modo que el modelo no recuerda información entre sesiones por sí mismo.
- Deriva de persona: al ser un adaptador de estilo, puede degradarse si se combina con otros adaptadores o si se usa sin el `system_prompt.txt` recomendado.
- Ambigüedad del modelo base: no se dispone de la ficha técnica del checkpoint `knoveleng/Qwen3.5-4B-Uncensored`, por lo que se desconoce su contexto real, su tokenizador y su régimen de entrenamiento.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/nakanokazuha/Yume-Qwen3.5-4B-LoRA
- Modelo base: https://huggingface.co/knoveleng/Qwen3.5-4B-Uncensored
- Dataset arskaz/Tsundere-AI (MIT): https://huggingface.co/datasets/arskaz/Tsundere-AI
- Dataset vnsd13/dataset-dialog-tsundere: https://huggingface.co/datasets/vnsd13/dataset-dialog-tsundere
- Otro adaptador LoRA sobre Qwen3.5-4B: https://huggingface.co/theogorg/qwen3.5_4b_lora
- Qwen3.5 4B en Ollama: https://ollama.com/library/qwen3.5:4b
- Colección Qwen3 en HuggingFace: https://huggingface.co/collections/Qwen/qwen3
- Guía de ejecución local de Qwen 3.5 en una sola GPU: https://www.qtithow.com/2026/09/running-qwen-35-locally-on-single-gpu.html
- Experimento de fine-tuning LoRA de Qwen3.5-4B en una H100: https://github.com/IIIIQIIII/qwen35-4b-lora-sft
