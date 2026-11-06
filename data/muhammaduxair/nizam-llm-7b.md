# muhammaduxair/Nizam-LLM-7B

## Resumen

Nizam-LLM-7B es un ajuste fino del modelo ALLaM-7B-Instruct-preview de Humain AI, desarrollado por Muhammad Uzair, especializado en derecho laboral saudí. El modelo responde preguntas sobre la legislación laboral de Arabia Saudí citando el artículo exacto del que extrae la respuesta, e indica explícitamente cuando los textos legales proporcionados no contienen la información solicitada. Está diseñado para un flujo RAG: recibe los artículos recuperados por un paso de búsqueda y genera una respuesta en árabe claro con la cita correspondiente en el formato «المادة (N) من <النظام>».

Arquitectónicamente es un transformer decoder-only de 7.000.559.616 parámetros (aproximadamente 7B), heredado de ALLaM-7B, con licencia Apache 2.0. El modelo se ha entrenado mediante QLoRA en cuatro bits sobre 846 artículos legales publicados como el dataset `nizam-saudi-labor-corpus`, cubriendo 24 regulaciones distintas, incluidas la Ley Laboral, el reglamento de trabajadores domésticos, el servicio civil y la normativa agrícola.

Su relevancia actual radica en que aborda un problema concreto y medible: la fiabilidad de las citas legales en modelos de lenguaje. Según la evaluación del autor sobre 286 casos, el modelo base ALLaM-7B acierta completamente en el 16% de los casos, mientras que Nizam-LLM v1 alcanza el 79%, con una tasa de citación correcta del 98% y una mejora sustancial en la detección de preguntas no respondibles por los textos (27 de 30 frente a 2 de 30 del modelo base).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de ALLaM-7B-Instruct-preview) |
| Parámetros totales | 7.000.559.616 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | El modelo se entrenó con QLoRA de 4 bits; no se documentan otros formatos publicados |
| Idiomas soportados | Árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de ALLaM-7B-Instruct-preview, un transformer decoder-only de aproximadamente 7B parámetros. El ajuste se realizó mediante QLoRA de 4 bits (bf16) sobre una única GPU A100 en la versión v1, tras iteraciones previas con configuraciones de 2× T4, 1× H100 y 1× L4. El autor documenta que las mejoras de rendimiento provinieron de la calidad y especificidad de los datos de entrenamiento, no del hardware: las ejecuciones 5, 5b y 6, realizadas en tres configuraciones distintas (desde T4 hasta H100), obtuvieron puntuaciones dentro del margen de ruido.

El corpus de entrenamiento se compone de 846 artículos legales de 24 regulaciones saudíes, publicados como el dataset `nizam-saudi-labor-corpus`. La versión v1 añadió aproximadamente 570 ejemplos revisados orientados a perfiles de recursos humanos y abogados: escenarios multi-parte de la Ley Laboral, casos de trabajadores domésticos, servicio civil y normativa agrícola, pares de ejemplos que enseñan la diferencia entre un artículo ausente y uno presente, y cálculos laborales verificados por código. El autor indica que cada pregunta de entrenamiento se contrastó contra el conjunto de test para evitar fugas de datos. No se documenta el uso de RLHF o DPO.

## Capacidades

- Generación de respuestas legales en árabe claro sobre derecho laboral saudí, estructuradas con el veredicto primero y las condiciones que determinan el caso.
- Citación explícita de los artículos utilizados en el formato «المادة (N) من <النظام>», lo que permite verificación manual por parte del usuario.
- Abstención controlada: el modelo declina responder cuando los textos legales proporcionados no contienen la información, en lugar de inventar una respuesta.
- Razonamiento sobre escenarios multi-parte que requieren combinar dos o más artículos para llegar a una conclusión.
- Cálculos laborales (por ejemplo, compensación por vacaciones no disfrutadas al finalizar la relación laboral), verificados durante el entrenamiento mediante código.
- Integración en pipelines RAG: el modelo está diseñado para recibir artículos recuperados por un paso de búsqueda previo (el autor menciona el modelo e5-large como recuperador en una de las iteraciones).
- Conversación multi-turno en árabe.
- No se documenta soporte de tool calling, function calling, capacidades de agente autónomo, visión ni audio.

## Casos de uso

- Atención al empleado en departamentos de recursos humanos: el modelo responde consultas sobre derechos y obligaciones laborales citando el artículo aplicable, lo que permite al equipo de RR. HH. verificar la respuesta contra el texto oficial antes de comunicarla. Es adecuado porque su tasa de citación correcta es del 98% en la evaluación del autor.
- Asistencia a abogados laboralistas: dado un conjunto de artículos recuperados por búsqueda semántica, el modelo sintetiza el veredicto y las condiciones aplicables, reduciendo el tiempo de revisión de normativa dispersa en 24 regulaciones.
- Sistemas de autoservicio para trabajadores inmigrantes: un portal en árabe donde el trabajador plantea su situación (por ejemplo, vacaciones no disfrutadas al terminar el contrato) y recibe una respuesta con la referencia legal exacta, sin necesidad de asistencia presencial.
- Verificación de cumplimiento normativo interno: las empresas pueden consultar obligaciones específicas (trabajadores domésticos, normativa agrícola, servicio civil) y obtener la base legal para ajustar sus contratos y políticas internas.
- Generación de borradores de respuestas a reclamaciones laborales: el modelo produce un texto con el fundamento legal citado, que el equipo jurídico revisa y adapta antes de enviarlo.
- Formación de personal de RR. HH.: construcción de un asistente de consulta interna que responde dudas del personal con la referencia al artículo, sirviendo como material de estudio verificable.
- Integración en un pipeline RAG completo: combinado con un recuperador como e5-large, el modelo puede desplegarse como servicio de consulta legal con abstención controlada cuando la recuperación no devuelve artículos relevantes, evitando respuestas sin fundamento.

## Benchmarks y rendimiento

El autor publica una evaluación propia sobre 286 casos (143 preguntas formuladas dos veces: con los artículos correctos únicamente y con ellos entre artículos relacionados), calificada mediante reglas fijas y no por otro modelo de IA. Una respuesta se considera correcta solo si expone todos los puntos requeridos, cita el artículo correcto, nombra la regulación y declina cuando corresponde.

| Métrica | ALLaM-7B base | Nizam-LLM v1 |
|---|---:|---:|
| Respuestas completamente correctas | 16% | 79% |
| Cita el artículo correcto | 25% | 98% |
| Declina correctamente cuando los textos no contienen la respuesta | 2 de 30 | 27 de 30 |
| Declina incorrectamente aunque la respuesta está en los textos | 2 de 256 | 0 de 256 |

Evolución por versión sobre los mismos 286 casos:

| Versión | Cambio principal | Precisión global |
|---|---|---:|
| Base | ALLaM-7B sin entrenamiento | 16,1% |
| Run 3 | Primer entrenamiento (2× T4, QLoRA 4 bits) | 56,3% |
| v0.1 | Preguntas que requieren dos artículos | 69,6% |
| v0.2 | Artículos recuperados y respuestas multi-párrafo | 74,1% |
| Run 5b | Mismos datos que run 5, precisión completa (1× H100, LoRA bf16) | 73,8% |
| Run 6 | Recuperador más potente (e5-large) | 70,6% |
| v0.3 | Ejemplos donde el detalle está en otra norma | 76,6% |
| v1 | Escenarios de RR. HH., pares respuesta/declinación, cálculos | 79,0% |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 14 GB para los 7B parámetros, más overhead de activaciones y caché KV (el contexto no está documentado, por lo que el overhead de caché no puede estimarse con precisión).
- VRAM estimada en cuantización de 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 4-5 GB para los pesos.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB, suficiente para bf16 con contexto moderado).
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 y en GPUs de 8-12 GB con cuantización de 4 bits (RTX 3060 12 GB, RTX 4070, etc.).
- Opciones de despliegue: transformers (librería nativa del modelo), text-generation-inference (el modelo incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama si se generan pesos GGUF (no se documenta su publicación).
- Latencia y throughput: no disponibles. El autor menciona que la demo serverless tarda 2-3 minutos en la primera respuesta tras un periodo de inactividad (arranque en frío) y responde en segundos en llamadas posteriores.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| Nizam-LLM-7B | 7B | No disponible | Derecho laboral saudí, árabe | Apache 2.0 | 79% en test propio de 286 casos |
| ALLaM-7B-Instruct-preview | 7B | No disponible | Propósito general, árabe | No disponible en la información | 16% en el mismo test propio |
| Qwen3-1.7B | 1,7B | No disponible | Propósito general | No disponible en la información | El autor lo probó en fases previas sin publicar resultados comparables |

No se dispone de datos de benchmarks estándar ni de comparaciones con otros modelos legales en árabe en la información proporcionada. La comparación con ALLaM-7B es directa porque es el modelo base y se evaluó con el mismo test y el mismo sistema de calificación.

## Limitaciones y advertencias

- El propio autor lo califica como "research release, not legal advice": no debe usarse como sustituto del asesoramiento jurídico profesional ni del texto oficial de la normativa.
- El modelo solo cubre derecho laboral saudí (24 regulaciones, 846 artículos); cualquier consulta fuera de ese ámbito quedará fuera de su dominio y probablemente será declinada o respondida de forma incorrecta.
- Solo soporta árabe; no se documenta capacidad multilingüe.
- La evaluación se basa en un test propio del autor (286 casos) calificado con reglas fijas; no hay validación independiente ni benchmarks estándar publicados.
- Riesgo de alucinación en citas: aunque la tasa de citación correcta es del 98% en el test del autor, un 2% de citas incorrectas en producción puede tener consecuencias relevantes en un contexto legal.
- El modelo depende de un paso de recuperación previo (RAG): si el recuperador no devuelve los artículos relevantes, el modelo puede declinar incorrectamente o responder con fundamentos incompletos. El autor documenta que cambiar el recuperador (run 6, e5-large) redujo la precisión del 74,1% al 70,6%.
- La longitud de contexto no está documentada, lo que impide dimensionar con precisión cuántos artículos pueden incluirse en el prompt.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exactitud legal de las respuestas.
- El repositorio ocupa 56 GB, lo que sugiere la presencia de múltiples revisiones o checkpoints; conviene verificar qué artefactos se descargan.
- El modelo tiene un único "like" y 1.197 descargas en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muhammaduxair/Nizam-LLM-7B
- Dataset del corpus legal: https://huggingface.co/datasets/muhammaduxair/nizam-saudi-labor-corpus
- Modelo base ALLaM-7B-Instruct-preview: https://huggingface.co/humain-ai/ALLaM-7B-Instruct-preview
- Demo interactiva (playground): https://muhammaduzair.info/playground/nizam-llm-7b
