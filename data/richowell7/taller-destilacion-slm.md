# richowell7/taller-destilacion-slm

## Resumen

`taller-destilacion-slm` es un adaptador LoRA publicado por el usuario richowell7 sobre el modelo `HuggingFaceTB/SmolLM2-135M-Instruct`, de 135 millones de parámetros. Es el artefacto resultante de un ejercicio docente del Taller de destilación en pequeño (Tópicos Avanzados en IA 2, Máster en IA, UAI): un LLM comercial (`gpt-6-luna`, vía API de OpenAI) generó 60 pares pregunta-respuesta en inglés y el modelo pequeño se ajustó con supervisión (SFT) para imitarlos, con entrenamiento ejecutado en CPU.

El dominio declarado es un asistente que explica conceptos de IA generativa (fundamentos de LLM, ingeniería de prompts, RAG, agentes, ajuste fino y evaluación) a ejecutivos de empresas chilenas, con ejemplos de negocio. Responde únicamente en inglés porque, según el autor, SmolLM2 rinde mal en español. No es un modelo para producción: en el examen fijo de 12 preguntas la nota media del juez pasó de 2,00 a 2,75 sobre 10 y ninguna respuesta alcanzó el umbral de aprobado (7/10).

Su interés es metodológico más que funcional: documenta de forma transparente un pipeline completo de destilación teacher-student a pequeña escala, con conjunto de evaluación separado del entrenamiento, juez LLM y desglose por temas. Es un caso de estudio reproducible, no una herramienta lista para desplegar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base SmolLM2-135M-Instruct) con adaptador LoRA (r=16, alpha=32) |
| Parámetros totales | 135 M en el modelo base; número de parámetros del adaptador no disponible (el repositorio ocupa menos de 0,1 GB según HuggingFace) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantización | No disponible; el adaptador se publica en safetensors y no documenta cuantizaciones propias |
| Idiomas soportados | Inglés (`en`) únicamente; el autor indica que en español el modelo no superó 1,1 sobre 10 |
| Licencia | Apache 2.0 (derivada del modelo base), con la salvedad de los términos de OpenAI sobre los datos generados |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |
| Modelo base | `HuggingFaceTB/SmolLM2-135M-Instruct` |
| Pipeline | text-generation |
| Fecha de publicación | 26 de octubre de 2026 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de 135 M de parámetros. El ajuste es un LoRA con rango 16, alpha 32, 3 épocas, tamaño de lote 4 y tasa de aprendizaje 5e-4, ejecutado en CPU. La pérdida de entrenamiento descendió de 3,8173 a 2,902. El conjunto de entrenamiento son 60 pares pregunta-respuesta en inglés, con respuestas de un máximo de 90 palabras, repartidos en 6 temas y generados por el profesor `gpt-6-luna`. No se documenta uso de RLHF, DPO ni preferencias humanas.

Conviene precisar la terminología: pese a la etiqueta «destilación», el procedimiento descrito es destilación a nivel de secuencia (behavior cloning sobre datos sintéticos generados por el profesor), no destilación sobre logits. El conjunto de evaluación es un examen fijo de 12 preguntas, separado del entrenamiento, calificado de 1 a 10 por un juez LLM (`gpt-6-luna`) contra una respuesta de referencia. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, decodificación restringida, etc.).

## Capacidades

- Generación de texto en inglés sobre conceptos de IA generativa: fundamentos de LLM, prompts, RAG, agentes, ajuste fino y evaluación.
- Respuestas breves, con un límite de aproximadamente 90 palabras heredado del formato de los datos de entrenamiento.
- Conversación multi-turno mediante la plantilla de chat del modelo base (la model card muestra `apply_chat_template` con mensajes de sistema y usuario).
- Ejemplos de negocio orientados a ejecutivos, según el dominio declarado por el autor.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- No dispone de visión, audio ni modo «thinking».
- Capacidad multilingüe: no disponible; el inglés es el único idioma declarado y el español se describe explícitamente como deficitario.

## Casos de uso

- Material docente para un taller de destilación: permite reproducir en CPU el ciclo completo (generación de datos con un profesor comercial, SFT con LoRA, examen con juez LLM) sin depender de GPU ni de infraestructura especial.
- Baseline de referencia en experimentos con SLM: sirve como punto de comparación (2,75/10 de nota media) para medir si un cambio de datos o hiperparámetros mejora de forma real la calidad del alumno.
- Prueba de infraestructura de ajuste fino: validar que un pipeline basado en PEFT carga el modelo base, entrena un adaptador, lo publica en el Hub y lo vuelve a cargar en minutos.
- Generación de borradores de FAQ sobre IA generativa para revisión humana: respuestas cortas en inglés que un experto corrige antes de publicar; el modelo nunca debe responder sin supervisión.
- Estudio de las limitaciones de un modelo de 135 M: analizar repetición de frases, invención de definiciones con seguridad y degradación fuera del dominio, con datos de examen ya publicados.
- Demostración de evaluación con juez LLM: evidenciar el ruido del juez (±0,3 entre ejecuciones) y su sesgo ligeramente más generoso que un humano en la auditoría manual de 10 ítems.
- Evidencia negativa sobre adaptación lingüística: mostrar que 60 ejemplos en inglés no bastan para transferir el comportamiento al español, con una nota inferior a 1,1/10.
- Prototipo de asistente para ejecutivos en un contexto de demostración: exclusivamente para enseñar el concepto, nunca para responder consultas reales de negocio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos son el examen fijo de 12 preguntas calificado por un juez LLM:

| Métrica | Antes (modelo base) | Después (adaptador) |
|---|---|---|
| Nota media del juez (1–10) | 2,00 | 2,75 |
| Aprobación (nota ≥ 7) | 0 % | 0 % |

| Tema | Antes | Después |
|---|---|---|
| Agentes de IA | 2,67 | 2,33 |
| Ajuste fino | 2,00 | 2,50 |
| Fundamentos de LLM | 1,50 | 2,50 |
| Ingeniería de prompts | 2,00 | 3,33 |
| RAG | 1,50 | 3,00 |

La tabla por temas de la model card recoge 5 de los 6 temas anunciados; no se publican los resultados del tema restante. El juez es otro LLM, con un ruido aproximado de ±0,3 entre ejecuciones, y en una auditoría manual de 10 ítems resultó levemente más generoso que un evaluador humano. En el tema de agentes la nota empeora tras el ajuste (2,67 → 2,33).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB para los pesos en fp16 (135 M × 2 bytes), más el overhead de activaciones, KV cache y del adaptador LoRA; en cuantización de 4 bits los pesos bajarían a unos 70 MB (estimación aritmética, no medida).
- El entrenamiento descrito se ejecutó en CPU, por lo que la inferencia en CPU es viable, aunque lenta para uso interactivo.
- Cabe en cualquier GPU de consumo, incluidas GPU integradas y equipos con 2 GB o menos de memoria.
- GPU recomendadas: no aplica para este tamaño; cualquier GPU moderna con soporte de transformers es suficiente.
- Opciones de despliegue documentadas: `transformers` + `peft`, cargando el adaptador sobre el modelo base. El resto de opciones (fusión del adaptador y conversión a GGUF para llama.cpp u Ollama, o despliegue con vLLM o TGI) son técnicamente posibles, pero no están documentadas ni verificadas en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Evaluación propia | Disponibilidad |
|---|---|---|---|---|---|
| taller-destilacion-slm | 135 M (base) + LoRA | No disponible | Apache 2.0 (con salvedad sobre los datos de OpenAI) | 2,75/10 en examen de 12 preguntas | Público en HuggingFace, 0 descargas, 1 like |
| SmolLM2-135M-Instruct (base) | 135 M | No disponible en la información | Apache 2.0 | 2,00/10 en el mismo examen | Público en HuggingFace |
| PamelaAlam/smollm2-360m-ia-generativa-lora | 360 M (base SmolLM2-360M-Instruct) + LoRA | No disponible | No disponible | No disponible | Público en HuggingFace |
| SmolLM2-360M-Instruct (base alternativo) | 360 M | No disponible en la información | Apache 2.0 | No disponible | Público en HuggingFace |

La comparación con el adaptador de PamelaAlam es pertinente por tratarse de un ejercicio equivalente sobre la misma familia de modelos, pero no se han divulgado sus métricas ni su licencia en la información disponible, por lo que no puede establecerse una comparación de rendimiento.

## Limitaciones y advertencias

- Calidad insuficiente para uso real: con 135 M de parámetros y 60 ejemplos de entrenamiento, ninguna respuesta del examen alcanzó el umbral de aprobado (7/10); la nota media final es 2,75/10.
- Alucinación explícita: el autor advierte que el modelo «inventa definiciones con seguridad», además de repetir frases y equivocarse.
- Idioma: solo inglés declarado; en español el rendimiento es inferior a 1,1/10 según el autor.
- Fuera de dominio responde como un modelo genérico y puede inventar datos; no hay mecanismo de abstención documentado.
- Licencia: el derivado es Apache 2.0, pero los datos de entrenamiento los generó un LLM comercial de OpenAI, cuyos términos restringen el uso de sus salidas para desarrollar modelos que compitan con OpenAI. Es necesario revisar esos términos antes de cualquier uso no educativo.
- Riesgo de heredar sesgos y errores tanto del profesor (`gpt-6-luna`) como del juez LLM utilizado en la evaluación.
- Métricas poco fiables a escala fina: el juez tiene un ruido de ±0,3 entre ejecuciones y se mostró algo más generoso que un humano en la auditoría de 10 ítems; las diferencias por tema deben interpretarse con cautela.
- Sin validación externa: 0 descargas y 1 like en el momento de la consulta; no hay evidencia de uso por terceros.
- No se documentan medidas de seguridad, alineamiento adicional ni filtros de contenido más allá de los del modelo base.
- El adaptador no es autónomo: requiere descargar y cargar el modelo base, y no se distribuye como pesos fusionados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richowell7/taller-destilacion-slm
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Adaptador equivalente sobre SmolLM2-360M: https://huggingface.co/PamelaAlam/smollm2-360m-ia-generativa-lora
- Artículo divulgativo sobre destilación de modelos (Xataka): https://www.xataka.com/basics/que-modelos-destilados-inteligencia-artificial-destilacion-llm
- Issue sobre pipeline de destilación y fine-tuning (GitHub): https://github.com/ISCOUTB/savio-ai-recommender/issues/26
- Workshop sobre destilación práctica de modelos (YouTube): https://www.youtube.com/watch?v=Cwo2bOcKAjI
- distil labs, referencia industrial de destilación: https://www.distillabs.ai/
