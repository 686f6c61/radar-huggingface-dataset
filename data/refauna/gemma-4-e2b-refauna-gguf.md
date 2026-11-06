# Refauna/gemma-4-e2b-refauna-GGUF

## Resumen

Gemma 4 E2B · Refauna es un ajuste fino (fine-tuning) del modelo `google/gemma-4-e2b-it` desarrollado por la iniciativa Refauna, un proyecto brasileño creado en 2010 para reintroducir fauna silvestre nativa en la Mata Atlántica de Río de Janeiro. El modelo está especializado en portugués de Brasil (PT-BR) sobre temas de defaunación, refaunación, reintroducción de fauna, dispersión de semillas e interacciones ecológicas, y se distribuye en formato GGUF para su uso con llama.cpp y Ollama.

El ajuste se realizó con QLoRA de 4 bits (r=16, alpha=16, 2 épocas, lr=0.0002) mediante la librería Unsloth sobre 942 ejemplos sintéticos en PT-BR generados a partir de 22 artículos científicos del proyecto, con un estilo tipo RAFT (contexto + citas, abstención y preguntas sin contexto). El modelo base es un transformer de 4.647.450.147 parámetros y el autor lo orienta a un uso con recuperación aumentada (RAG), citando fragmentos numerados con el formato `[n]`.

Su relevancia radica en que demuestra cómo un modelo pequeño (en torno a 4,6 mil millones de parámetros) puede especializarse en un dominio científico concreto con un coste de entrenamiento bajo (27,8 minutos en una NVIDIA L4, con un pico de 10,57 GB de VRAM) y desplegarse en hardware de consumo. No obstante, la evaluación publicada muestra que el fine-tuning sin RAG rinde peor que el modelo base con RAG, y que la combinación de ambos no supera al base con RAG en corrección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base `google/gemma-4-e2b-it`); detalles internos no disponibles |
| Parametros totales | 4.647.450.147 (dato de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; se cita explícitamente Q4_K_M en el ejemplo de Ollama; no se detalla el conjunto completo |
| Idiomas soportados | Portugués de Brasil (pt), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 9,4 GB); el autor menciona también uso vía Transformers con el repo `Refauna/gemma-4-e2b-refauna` |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-e2b-it` (vía `unsloth/gemma-4-E2B-it`) y se ajusta con QLoRA de 4 bits, r=16, alpha=16, durante 2 épocas con lr=0.0002, aplicando el ajuste únicamente a las capas de lenguaje y usando la plantilla `gemma-4` sin modo de razonamiento (thinking). El entrenamiento se ejecutó en una NVIDIA L4 en 27,8 minutos con un pico de 10,57 GB de VRAM.

El corpus de entrenamiento consta de 942 ejemplos sintéticos en PT-BR generados a partir de 22 artículos científicos del proyecto Refauna, con una composición aproximada del 60 % con contexto y citas, 15 % de ejemplos de abstención y 25 % sin contexto, siguiendo un estilo RAFT. Hubo revisión humana por muestreo y la partición de datos se hizo por documento para evitar filtración entre entrenamiento y evaluación. El modelo está diseñado para trabajar junto a un pipeline RAG con `google/embeddinggemma-300m` más BM25, fusión RRF y top-4.

## Capacidades

- Generación de texto conversacional en portugués de Brasil e inglés.
- Respuesta fundamentada en contexto recuperado (RAG) con citas en formato `[n]`.
- Abstención explícita cuando el contexto no contiene la respuesta, evitando inventar datos.
- Dominio especializado: defaunación, refaunación, reintroducción de fauna, dispersión de semillas, interacciones ecológicas y conservación de la Mata Atlántica.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (plantilla `gemma-4` sin thinking).
- Capacidades de visión o audio: no disponible.
- Capacidades multilingües: limitadas a pt y en según la model card.

## Casos de uso

- Asistente de divulgación científica: responde preguntas del público sobre refaunación y conservación citando los artículos del proyecto, gracias al formato `[n]` y a su entrenamiento con contexto.
- Consulta interna para investigadores: permite localizar rápidamente qué dice la literatura del Refauna sobre especies concretas (por ejemplo, *Dasyprocta leporina* o *Alouatta guariba*) usando el pipeline RAG con top-4.
- Atención a visitantes del Parque Nacional da Tijuca: chatbot en portugués que explica los programas de reintroducción de cutías, monos aulladores, tapires y araracangas.
- Material educativo para escuelas: generación de respuestas didácticas y claras sobre dispersión de semillas e interacciones ecológicas, con abstención cuando no hay fuente.
- Despliegue local en portátiles: al distribuirse en GGUF Q4_K_M y tener unos 4,6 mil millones de parámetros, puede ejecutarse con Ollama en equipos de consumo sin GPU dedicada de gama alta.
- Prototipado de RAG especializado: sirve como referencia para equipos que quieran replicar el patrón RAFT con citas y abstención en dominios científicos concretos con presupuesto reducido.
- Verificación de afirmaciones: el modo de abstención (15 % de los ejemplos de entrenamiento) lo hace útil para marcar cuándo una pregunta queda fuera de los documentos disponibles.

## Benchmarks y rendimiento

Evaluación publicada por el autor (notas de 1 a 5 atribuidas por un juez LLM; A = base, B = base+RAG, C = fine-tuned, D = fine-tuned+RAG):

| Config | Corrección | Fidelidad | Citación correcta | Abstención correcta | PT-BR |
|---|---|---|---|---|---|
| A: base | 1.12 | no disponible | no disponible | no disponible | 1.00 |
| B: base + RAG | 2.47 | 4.35 | 0.52 | 0.88 | 1.00 |
| C: fine-tuned | 2.17 | no disponible | no disponible | no disponible | 1.00 |
| D: fine-tuned + RAG | 2.29 | 4.17 | 0.52 | 0.88 | 1.00 |

Recuperación híbrida (conjunto de test, n=74): Recall@4 = 0.42, MRR@20 = 0.30.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial para cada cuantización; el entrenamiento requirió un pico de 10,57 GB en una NVIDIA L4.
- GPU recomendadas: NVIDIA L4 para el ajuste fino; para inferencia, cualquier GPU con suficiente memoria para la cuantización elegida (no se detalla).
- GPU de consumo: el formato GGUF Q4_K_M sugiere que puede ejecutarse en equipos de consumo, aunque el autor no publica requisitos mínimos concretos.
- Opciones de despliegue: Ollama (`ollama run hf.co/Refauna/gemma-4-e2b-refauna-GGUF:Q4_K_M`), llama.cpp (por el formato GGUF) y Transformers (`pipeline` con `Refauna/gemma-4-e2b-refauna`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| Refauna/gemma-4-e2b-refauna-GGUF | 4.647.450.147 | no disponible | Apache 2.0 | GGUF | Refaunación y conservación de la Mata Atlántica (PT-BR) |
| google/gemma-4-e2b-it (base) | no disponible en la información | no disponible | Apache 2.0 | no disponible | Propósito general |
| Alternativas de dominio ecológico | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Uso educativo y de divulgación científica; no sustituye a la literatura original, que debe consultarse siempre.
- Sin RAG, el modelo puede equivocarse en números, fechas y nombres de especies.
- Su conocimiento está restringido a los 22 artículos utilizados y no cubre todo el trabajo del Refauna.
- La evaluación con RAG muestra una corrección de 2.29 frente a 2.47 del modelo base con RAG, y una fidelidad de 4.17 frente a 4.35; el fine-tuning no mejora al base en ese escenario.
- Recall@4 = 0.42 indica que el recuperador falla con frecuencia, lo que limita la calidad final de las respuestas con RAG.
- Idiomas limitados a portugués de Brasil e inglés; no se garantiza un rendimiento adecuado en castellano.
- Licencia Apache 2.0: permite uso comercial, pero el autor no lo recomienda para producción sin validación adicional.
- Riesgo de alucinación en preguntas fuera del dominio o cuando el contexto recuperado es irrelevante.
- No se documentan sesgos específicos ni evaluación de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Refauna/gemma-4-e2b-refauna-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-e2b-it
- Repositorio del ajuste en Transformers: https://huggingface.co/Refauna/gemma-4-e2b-refauna
- Iniciativa Refauna: https://refauna.org.br
- Artículo sobre crédito de interacciones ecológicas (2017): https://doi.org/10.1002/ece3.2746
- Rewilding the Atlantic Forest (2017): https://doi.org/10.1016/j.pecon.2017.09.004
- Reintroducción de *Dasyprocta leporina* (2014): https://doi.org/10.1177/194008291400700415
- Crecimiento poblacional no asistido de *Dasyprocta leporina* (2018): https://doi.org/10.1017/S0030605316001149
- Restauración de poblaciones de *Alouatta guariba* (2024): https://doi.org/10.3389/fcosc.2024.1401749
- Recuperación de patrones de actividad de tapires reintroducidos (2025): https://doi.org/10.1017/S0030605325102494
