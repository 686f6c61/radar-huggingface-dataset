# Mithoz/taai2-destilado-qwen05b

## Resumen

`Mithoz/taai2-destilado-qwen05b` es un adaptador LoRA entrenado sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`, desarrollado por el usuario Mithoz en el marco del *Taller de destilación en pequeño* del Máster en IA de la UAI (Universidad Adolfo Ibáñez, Chile), dentro de la asignatura Tópicos Avanzados en IA 2, en octubre de 2026. Se trata de un ejercicio académico de destilación de caja negra cuyo objetivo es especializar un modelo pequeño (SLM) en la explicación de conceptos de IA generativa a perfiles ejecutivos de empresas chilenas.

El adaptador se entrena mediante SFT con LoRA sobre 300 pares pregunta–respuesta generados por un profesor comercial (`gpt-6-luna` vía API de OpenAI), con respuestas de 45 palabras o menos. El modelo base Qwen2.5-0.5B-Instruct aporta la arquitectura transformer y el conocimiento general; el adaptador añade el estilo y el dominio específico.

Su relevancia es fundamentalmente metodológica y educativa: demuestra un flujo completo de destilación de caja negra sobre hardware de consumo (Apple Silicon, sin GPU dedicada) y publica una evaluación con juez LLM. No es un producto: el propio autor lo describe como un ejercicio con resultados modestos (nota media de 5,17 sobre 10 en un examen de 12 preguntas) y advierte de olvido catastrófico fuera del dominio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parámetros totales | 0,5 B en el modelo base; el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder-only de 0,5 mil millones de parámetros. El entrenamiento consiste en SFT con LoRA de rango r = 16 y alpha = 32, aplicado a los módulos `down_proj`, `gate_proj`, `k_proj`, `o_proj`, `q_proj`, `up_proj` y `v_proj` (es decir, las proyecciones de atención y del MLP). Se entrenaron 3 épocas con tasa de aprendizaje 0,001 en un notebook sin GPU dedicada (Apple Silicon).

Los datos de entrenamiento son 300 pares pregunta–respuesta generados por un LLM comercial (`gpt-6-luna`, API de OpenAI), con respuestas limitadas a 45 palabras. Los datos no se publican en el repositorio. No se menciona uso de RLHF ni DPO; es destilación de caja negra pura mediante imitación supervisada de las salidas del profesor. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto en español orientada a explicar conceptos de IA generativa: fundamentos de LLM, ingeniería de prompts, RAG, agentes y ajuste fino.
- Adaptación de estilo a un registro divulgativo para ejecutivos, con ejemplos de negocio y respuestas breves (≤ 45 palabras en el entrenamiento).
- Herencia de las capacidades del modelo base Qwen2.5-0.5B-Instruct (chat multi-turno básico, generación de texto general), aunque el ajuste degrada el rendimiento fuera del dominio.
- Soporte de tool calling / function calling: no disponible de forma específica en la información proporcionada (el modelo base Qwen2.5-Instruct lo soporta, pero el adaptador no lo ha sido entrenado para ello).
- Soporte de agentes y razonamiento multi-step: no disponible; el dominio cubre el tema "agentes de IA" como contenido, no como capacidad operativa.
- Capacidades multilingües: limitadas al español según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Formación interna en empresas: el adaptador puede generar explicaciones breves de conceptos como RAG o ajuste fino para sesiones de onboarding tecnológico dirigidas a directivos, gracias a su entrenamiento específico en registro divulgativo y ejemplos de negocio.
- Prototipado de asistentes educativos: sirve como punto de partida para experimentar con destilación de caja negra sobre SLM antes de invertir en modelos mayores, dado su bajo coste de entrenamiento en Apple Silicon.
- Generación de material didáctico borrador: útil para producir primeros borradores de FAQ o glosarios sobre IA generativa que un humano revise después, aprovechando las respuestas cortas y estructuradas.
- Docencia e investigación en destilación: caso de estudio reproducible para asignaturas de máster sobre ajuste fino eficiente con LoRA y evaluación con juez LLM.
- Demostración de evaluación con LLM juez: el repositorio documenta un pipeline de examen fijo con calificación automática, reutilizable como plantilla metodológica en talleres.
- Base para experimentos de mitigación de olvido catastrófico: al documentarse la degradación fuera de dominio, es un banco de pruebas para técnicas de regularización o mezcla de datos.
- No recomendado para atención al cliente en producción ni para decisiones reales, según las propias limitaciones declaradas por el autor.

## Benchmarks y rendimiento

Resultados del examen fijo de 12 preguntas (nunca usadas en entrenamiento), calificado por un LLM juez (`gpt-6-luna`) de 1 a 10 contra la respuesta del profesor, con umbral de aprobado en 7:

| Métrica | Base (sin adaptador) | Con adaptador |
|---|---|---|
| Nota media (1–10) | 3,42 | 5,17 |
| Respuestas aprobadas (≥ 7) | 0 % | 8 % |

Desglose por tema:

| Tema | Base | Con adaptador |
|---|---|---|
| Agentes de IA | 4 | 4,33 |
| Ajuste fino | 2 | 7 |
| Fundamentos de LLM | 4 | 6 |
| Ingeniería de prompts | 3,33 | 5,33 |
| RAG | 3,5 | 3,5 |

Advertencias del autor sobre estos datos: una revisión manual de 10 respuestas encontró que el juez califica en promedio ~0,7 puntos más alto, por lo que las notas probablemente sobrestiman la calidad; el examen es pequeño (12 preguntas) y diferencias de ±0,2 son ruido. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo base (0,5 B), la inferencia en fp16 requiere aproximadamente 1 GB de pesos más overhead de activaciones y KV cache, y en cuantización de 4 bits cabría en menos de 1 GB (estimación orientativa, no publicada por el autor).
- GPU recomendadas: no especificadas; el entrenamiento se realizó sin GPU dedicada en Apple Silicon, lo que indica que la inferencia es viable en hardware de consumo.
- Compatibilidad con GPU de consumo: sí, previsiblemente en cualquier GPU con ≥ 2 GB de VRAM en fp16 (GTX 1650, RTX 3050, RTX 4060, etc.), aunque no hay cifras publicadas.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con `transformers` + `peft`. No se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI; sería necesario fusionar el adaptador con el modelo base y convertir a GGUF para esos entornos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| taai2-destilado-qwen05b | 0,5 B + LoRA | no disponible | Destilación de dominio educativo (IA generativa, español) | Apache 2.0 | Hugging Face (19 descargas) |
| Qwen2.5-0.5B-Instruct | 0,5 B | no disponible en esta ficha | Asistente general multilingüe | Apache 2.0 | Hugging Face (modelo base) |
| Qwen2.5-1.5B-Instruct | 1,5 B | no disponible en esta ficha | Asistente general, mayor capacidad | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct | 0,36 B | no disponible en esta ficha | SLM generalista para edge | Apache 2.0 | Hugging Face |

La comparación relevante es contra el propio modelo base: el adaptador mejora la nota media de 3,42 a 5,17 en el examen de dominio, pero el autor indica que empeora en preguntas generales por olvido catastrófico. Frente a SLM generalistas del mismo orden de magnitud, este adaptador no aporta capacidades nuevas, sino especialización estilística y de dominio muy acotada. No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 0,5 B entrenado con solo 300 ejemplos: se equivoca, repite e inventa; el autor cita confusión explícita en conceptos como "sobreajuste".
- Olvido catastrófico fuera del dominio: tras el ajuste responde peor que el modelo base a preguntas generales e inventa datos.
- El examen de evaluación es pequeño (12 preguntas) y el juez LLM sobrestima ~0,7 puntos de media, por lo que los resultados publicados deben tomarse con cautela.
- Los datos de entrenamiento fueron generados por un modelo de OpenAI (`gpt-6-luna`); sus términos de uso restringen emplear las salidas para desarrollar modelos que compitan con OpenAI. Uso previsto: educativo; revisar los términos vigentes antes de cualquier otro uso.
- Licencia del adaptador Apache 2.0, sujeta además a la licencia y términos del modelo base Qwen2.5-0.5B-Instruct.
- No apto para decisiones reales ni producción, según declaración explícita del autor.
- Cobertura idiomática limitada al español; sin datos sobre sesgos específicos más allá de los heredados del modelo base y del profesor comercial.
- El repositorio tiene 0,0 GB de tamaño reportado y 19 descargas, lo que sugiere baja adopción y escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mithoz/taai2-destilado-qwen05b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Documentación de PEFT: https://huggingface.co/docs/peft
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
