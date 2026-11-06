# iamrodrigocoelho/gemma-4-e2b-refauna

## Resumen

Gemma 4 E2B · Refauna es un ajuste fino del modelo multimodal `google/gemma-4-e2b-it` (licencia Apache 2.0) orientado a un dominio muy concreto: defaunación, refaunación, reintroducción de fauna, dispersión de semillas y conservación de la Mata Atlántica brasileña. Lo desarrolla el usuario de Hugging Face iamrodrigocoelho a partir de la producción científica de la iniciativa Refauna, creada en 2010 para devolver fauna silvestre nativa a sus hábitats en la Mata Atlántica de Río de Janeiro. El modelo está pensado como pieza de un sistema RAG: recibe fragmentos numerados y responde citando `[n]`.

El modelo base pertenece a la familia Gemma 4 (arquitectura transformer, variante "E2B") y el ajuste se realizó con QLoRA de 4 bits, rango 16, sobre las capas de lenguaje exclusivamente, con la plantilla `gemma-4` sin modo thinking. El resultado conserva la naturaleza multimodal image-text-to-text del modelo original, aunque el entrenamiento se centró en generación de texto conversacional en portugués de Brasil.

Su relevancia es doble: por un lado, demuestra un flujo completo de especialización de un modelo pequeño con datos sintéticos generados estilo RAFT (con contexto, citas y ejemplos de abstención) sobre hardware modesto (una NVIDIA L4, 27,8 minutos de entrenamiento, pico de 10,57 GB de VRAM); por otro, ofrece un caso práctico de RAG híbrido (embeddings `google/embeddinggemma-300m` más BM25 con fusión RRF) aplicado a divulgación científica. Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y no debe confundirse con un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E2B); multimodal image-text-to-text en el modelo base |
| Parametros totales | 5.123.178.051 (5,12 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA 4-bit durante el entrenamiento; version GGUF Q4_K_M publicada en el repo `gemma-4-e2b-refauna-GGUF` |
| Idiomas soportados | Portugues (pt, pt-BR) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF (repo derivado) |

## Arquitectura y entrenamiento

El modelo se construye sobre `google/gemma-4-e2b-it`, cargado a través de `unsloth/gemma-4-E2B-it`. El ajuste es un QLoRA de 4 bits con rango 16, alpha 16, dos épocas, tasa de aprendizaje 0,0002 y aplicación restringida a las capas de lenguaje (no se ajustan las capas de visión). Se emplea la plantilla de chat `gemma-4` sin modo thinking. El entrenamiento se ejecutó en una única NVIDIA L4 en 27,8 minutos, con un pico de 10,57 GB de VRAM, lo que da una idea de la accesibilidad del proceso.

El conjunto de datos son 942 ejemplos sintéticos en portugués de Brasil generados a partir de 22 artículos científicos del proyecto Refauna, con estilo RAFT: aproximadamente un 60 % de ejemplos con contexto y citas, un 15 % de abstención y un 25 % sin contexto. Hubo revisión humana por muestreo y la partición train/test se hizo por documento para evitar filtración de información entre conjuntos. No se documenta el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO adicionales; el método descrito es exclusivamente supervisado (SFT mediante LoRA).

## Capacidades

- Generación de texto conversacional en portugués de Brasil, con registro didáctico y preciso, sobre temas de ecología y conservación.
- Respuesta fundamentada en contexto (RAG): acepta fragmentos numerados `[1]`, `[2]`, etc. y cita los usados en formato `[n]`.
- Abstención explícita: entrenado para declarar que no encuentra la información en los documentos cuando el contexto no contiene la respuesta, en lugar de inventar datos.
- Comprensión de literatura científica del dominio: especies como *Dasyprocta leporina*, *Alouatta guariba*, *Tapirus terrestris*, *Ara ararauna*, *Astrocaryum aculeatissimum*, y conceptos como crédito de interacciones ecológicas, dispersión de semillas o análisis de viabilidad poblacional.
- Capacidad multimodal heredada del modelo base (image-text-to-text), aunque no se documenta entrenamiento específico sobre imágenes.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor indica explícitamente que se entrena sin modo thinking.
- Capacidades multilingües: limitadas a portugués e inglés, con el entrenamiento centrado en portugués.

## Casos de uso

- Asistente RAG para divulgación científica: conectado a un índice de los 22 artículos de Refauna, el modelo responde consultas del público general citando los fragmentos exactos, lo que permite verificar cada afirmación contra la fuente original.
- Apoyo a investigadores en revisiones bibliográficas: dado un conjunto de extractos de papers del dominio, el modelo sintetiza respuestas sobre reintroducción de especies concretas (por ejemplo, *Alouatta guariba* o *Tapirus terrestris*) manteniendo la trazabilidad de las citas.
- Herramienta educativa para cursos de biología de la conservación: su registro didáctico y su capacidad de abstención lo hacen adecuado para responder preguntas de estudiantes sin riesgo de fabricar datos cuando la base documental no cubre el tema.
- Generación de material de comunicación para ONG ambientales: a partir de fragmentos de los papers, redacta explicaciones sobre defaunación y refaunación para notas de prensa o fichas divulgativas, siempre con referencia a la fuente.
- Chatbot de un centro de visitantes o reserva ecológica: desplegado con Ollama en local (variante GGUF Q4_K_M), puede funcionar sin conexión ni coste de API en un equipo modesto para responder preguntas sobre la fauna reintroducida.
- Prototipado de pipelines RAG especializados: sirve como referencia reproducible de cómo combinar un modelo pequeño (5,12 mil millones de parámetros) con recuperación híbrida (embeddings `google/embeddinggemma-300m` + BM25 con fusión RRF, top-4) para dominios científicos acotados.
- Base para futuros ajustes en otros dominios de biodiversidad: el flujo RAFT con ejemplos de abstención y citas es reutilizable para corpus de otras iniciativas de conservación.

## Benchmarks y rendimiento

El autor publica una evaluación propia con notas de 1 a 5 asignadas por un juez LLM, sobre cuatro configuraciones (A = base, B = base + RAG, C = fine-tuneado, D = fine-tuneado + RAG):

| Config | Corrección | Fidelidad | Citación correcta | Abstención correcta | PT-BR |
|---|---|---|---|---|---|
| A: base | 1,12 | no disponible | no disponible | no disponible | 1,00 |
| B: base + RAG | 2,47 | 4,35 | 0,52 | 0,88 | 1,00 |
| C: fine-tuneado | 2,17 | no disponible | no disponible | no disponible | 1,00 |
| D: fine-tuneado + RAG | 2,29 | 4,17 | 0,52 | 0,88 | 1,00 |

Además, la recuperación híbrida sobre el conjunto de test (n = 74) alcanza Recall@4 = 0,42 y MRR@20 = 0,30. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Cabe señalar que, según estos datos, el ajuste fino sin RAG mejora la corrección frente al base (2,17 frente a 1,12) pero la configuración con RAG sobre el modelo base obtiene la mejor puntuación de corrección (2,47), lo que sugiere que el valor principal del sistema reside en la recuperación.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors de precisión completa, alrededor de 10-11 GB solo para pesos; en cuantización de 4 bits, del orden de 3-4 GB más overhead de contexto.
- Entrenamiento documentado: una NVIDIA L4 con pico de 10,57 GB de VRAM y 27,8 minutos para dos épocas sobre 942 ejemplos.
- GPU recomendadas: NVIDIA L4 (validada por el autor para el ajuste); para inferencia, cualquier GPU con al menos 8 GB de VRAM en cuantización 4 bits; A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) usando la variante GGUF Q4_K_M.
- Opciones de despliegue: Ollama (`ollama run hf.co/iamrodrigocoelho/gemma-4-e2b-refauna-GGUF:Q4_K_M`), Transformers con `pipeline("text-generation", ...)`, y cualquier runtime compatible con GGUF o safetensors. No se documenta soporte específico de vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E2B · Refauna | 5,12 mil millones | no disponible | RAG científico en pt-BR sobre conservación de la Mata Atlántica | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| google/gemma-4-e2b-it (base) | no disponible en la información | no disponible | Propósito general, multimodal | Apache 2.0 | Hugging Face |
| Modelos de la familia Gemma de tamaño similar | no disponible | no disponible | Propósito general | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con modelos alternativos de la misma categoría en la información proporcionada, más allá de las cuatro configuraciones internas del propio autor (base frente a ajustado, con y sin RAG).

## Limitaciones y advertencias

- Uso previsto educativo y de divulgación científica; el autor indica explícitamente que no sustituye a la literatura original y que deben consultarse siempre las fuentes citadas.
- Sin RAG, el modelo puede equivocarse en números, fechas y nombres de especies; el ajuste no garantiza corrección factual fuera del contexto recuperado.
- El conocimiento está restringido a los 22 artículos utilizados y no cubre todo el trabajo de la iniciativa Refauna.
- Los datos de entrenamiento son sintéticos (942 ejemplos), con revisión humana solo por muestreo, lo que puede introducir sesgos o errores no detectados en el corpus generado.
- Idiomas limitados a portugués de Brasil e inglés; no se garantiza un comportamiento correcto en castellano u otras lenguas.
- El rendimiento de recuperación es modesto (Recall@4 = 0,42, MRR@20 = 0,30), lo que limita la calidad del sistema RAG completo: si el fragmento relevante no se recupera, el modelo no puede responder correctamente aunque la abstención funcione.
- Riesgo de alucinación en preguntas fuera del dominio o cuando el contexto es ambiguo; la abstención correcta medida es de 0,88, no de 1,0.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los artículos fuente tienen sus propias condiciones de atribución; debe respetarse la cita de los papers originales.
- Modelo con cero descargas y cero likes en el momento de la consulta: no hay validación por parte de la comunidad ni evidencia de uso en producción.
- No se documenta soporte de tool calling, agentes ni modo thinking; no debe asumirse que estas capacidades del modelo base se conserven tras el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamrodrigocoelho/gemma-4-e2b-refauna
- Modelo base: https://huggingface.co/google/gemma-4-e2b-it
- Repositorio Unsloth del base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Iniciativa Refauna: https://refauna.org.br
- Paper sobre rewilding de la Mata Atlántica (2017): https://doi.org/10.1016/j.pecon.2017.09.004
- Paper sobre crecimiento poblacional no asistido de *Dasyprocta leporina* (2018): https://doi.org/10.1017/S0030605316001149
- Paper sobre restauración de poblaciones de *Alouatta guariba* (2024): https://doi.org/10.3389/fcosc.2024.1401749
- Paper sobre patrones de actividad de *Tapirus terrestris* reintroducidos (2025): https://doi.org/10.1017/S0030605325102494
- Paper sobre crédito de interacciones ecológicas (2017): https://doi.org/10.1002/ece3.2746
- Paper sobre collares de radiotelemetría en *Dasyprocta leporina* (2013): https://doi.org/10.1590/S1984-46702013000100015
- Paper sobre reintroducción de *Dasyprocta leporina* (2014): https://doi.org/10.1177/194008291400700415
- Paper sobre consumo de carroña por *Dasyprocta leporina* (2014): https://doi.org/10.1590/bjb.2014.0087
- Paper sobre extinción local de dispersores y *Astrocaryum aculeatissimum* (2015): https://doi.org/10.1590/0102-33062015abb0008
