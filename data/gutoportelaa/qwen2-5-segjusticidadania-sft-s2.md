# gutoportelaa/qwen2.5-segjusticidadania-sft-s2

## Resumen

`qwen2.5-segjusticidadania-sft-s2` es un adaptador LoRA (PEFT) publicado por el usuario gutoportelaa sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. Se trata de un ajuste supervisado (SFT) orientado a una tarea muy concreta: responder preguntas sobre producción científica brasileña en seguridad pública, justicia y ciudadanía a partir de un conjunto de fragmentos de texto proporcionados, citando el fragmento utilizado y rechazando responder cuando la respuesta no está contenida en dichos fragmentos.

El modelo nace como parte de un trabajo final de la asignatura Tópicos em Inteligência Artificial (PLN) de la UFPI (2026.2), y corresponde al método S2 (LoRA) de las cuestiones 2 y 3 del trabajo. No es un modelo de propósito general: es un adaptador de bajo rango que enseña un formato de respuesta anclada a evidencia (citar `[k]` y responder exactamente `"Não encontrado nos documentos."` cuando no hay evidencia), no conocimiento nuevo.

Por su tamaño (adaptador sobre un modelo de 1.5B parámetros), su licencia Apache 2.0 y su naturaleza experimental, resulta relevante como ejemplo reproducible de pipeline RAG con SFT, y como caso de estudio de cómo el ajuste fino puede mejorar el formato de citación a costa de degradar la precisión de respuesta (el autor reporta una caída significativa de acierto frente al modelo base).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base tiene 1.5B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; el base admite cuantización estándar, pero no se especifica) |
| Idiomas soportados | portugués (`pt`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con r = 16, α = 32 y dropout 0.05 sobre las proyecciones q, k, v, o, gate, up y down del modelo base Qwen2.5-1.5B-Instruct, que se mantiene en bf16. El entrenamiento usó tasa de aprendizaje 2·10⁻⁴, AdamW de 8 bits, 2 épocas, lote efectivo de 16 (2 × 8 de acumulación de gradiente), hasta 4.608 tokens por ejemplo, calentamiento y decaimiento coseno, y cálculo de pérdida únicamente sobre los tokens de la respuesta.

Los datos de entrenamiento son 2.705 pares `instruction`/`input`/`output` generados por Qwen2.5-7B-Instruct local a partir del corpus del dataset `gutoportelaa/segjusticidadania-experimentos`: 1.844 preguntas ancladas con cinco fragmentos y respuesta terminada en `[k]`, 600 rechazos (`"Não encontrado nos documentos."`) y 261 resúmenes. El reparto es de 2.422 ejemplos de entrenamiento y 283 de validación (10 % de los documentos, separados por documento). Ningún documento de origen de un ítem de benchmark entra en los pares de entrenamiento, lo que evita fuga de datos respecto al conjunto de evaluación.

## Capacidades

- Generación de texto conversacional en portugués, con formato de chat (`apply_chat_template`).
- Respuesta a preguntas ancladas a evidencia: usa únicamente los fragmentos proporcionados y cita el fragmento empleado entre corchetes (`[k]`).
- Rechazo controlado: responde exactamente `"Não encontrado nos documentos."` cuando la respuesta no está en los fragmentos.
- Generación de resúmenes a partir de fragmentos (capacidad entrenada, aunque no evaluada de forma independiente en la información disponible).
- No soporta tool calling ni function calling de forma específica (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- Capacidad multilingüe limitada al portugués; no se reporta soporte de otros idiomas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Asistente RAG de consulta documental en seguridad pública y justicia: el adaptador está entrenado para recibir cinco fragmentos recuperados (por ejemplo, con un recuperador híbrido e5 + BM25) y responder citando el fragmento correcto, lo que encaja en un pipeline de búsqueda aumentada sobre corpus científicos brasileños.
- Prototipado de sistemas de respuesta con abstención: útil para experimentar con comportamientos de rechazo explícito cuando la evidencia no cubre la pregunta, un patrón habitual en asistentes legales o administrativos.
- Evaluación de pipelines de SFT: sirve como referencia reproducible para comparar LoRA frente a ajuste completo y QLoRA en un modelo de 1.5B, con configuración e historial de pérdidas incluidos (`treino.json`).
- Docencia e investigación en PLN: el modelo y su dataset asociado permiten reproducir el experimento completo (generación de pares, entrenamiento, evaluación con benchmark de evidencia y múltiple elección).
- Generación de resúmenes de fragmentos: para condensar extractos de documentos científicos en respuestas breves, aunque con la advertencia de que la calidad no se ha evaluado de forma específica.
- Base para experimentos de destilación: el autor lo identifica también como modelo D1 (destilación de caja negra) de la cuestión 4, con pares generados por el profesor de 7B, por lo que puede reutilizarse en estudios de destilación.

## Benchmarks y rendimiento

Evaluación sobre 30 preguntas ancladas del benchmark de evidencia, con los mismos cinco fragmentos fijos para todos los modelos, prompt en formato de entrenamiento, generación voraz y hasta 160 tokens. El acierto se mide comprobando que los términos clave de la respuesta de referencia aparecen en la respuesta generada. La columna de múltiple elección corresponde a 1.438 ítems de laguna (ley, súmula, artículo, porcentaje, año), elegidos por verosimilitud y sin contexto.

| Modelo | Acierto (30) | Cita el fragmento correcto | Rechazos | Termina solo | McNemar vs. sin SFT | Múltiple elección (1.438) |
|---|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (sin SFT) | 24 | 3 | 0 | 29/30 | — | 50,4 % |
| S1, ajuste completo | 20 | 22 | 4 | 30/30 | p = 0,289 | 50,6 % |
| **S2, LoRA (este modelo)** | **15** | **24** | **4** | **30/30** | **p = 0,012** | **49,4 %** |
| S3, QLoRA | 18 | 23 | 4 | 30/30 | p = 0,109 | 49,7 % |
| S1m, ajuste completo, mejor punto de validación | 17 | 26 | 4 | 30/30 | p = 0,039 | 50,6 % |

El autor señala que este es el único de los tres métodos en el tamaño 1.5B con una caída de acierto estadísticamente significativa respecto al modelo base (p = 0,012). El ajuste mejora notablemente la citación del fragmento correcto (de 3 a 24) pero reduce el acierto de respuesta (de 24 a 15).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, un modelo de 1.5B en bf16 requiere aproximadamente 3 GB de pesos, más overhead de activaciones y caché KV; el adaptador LoRA añade una cantidad marginal.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar el modelo base en bf16 o fp16.
- Compatibilidad con GPU de consumo: previsiblemente sí en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores, aunque no se aporta confirmación oficial.
- Opciones de despliegue: el autor documenta el uso con `transformers` + `peft` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Acierto (30) | Cita correcta | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1.5B | no disponible | 24 | 3 | Apache 2.0 | Hugging Face |
| S1, ajuste completo | 1.5B | no disponible | 20 | 22 | Apache 2.0 (según repo) | Hugging Face |
| **S2, LoRA (este modelo)** | 1.5B + adaptador | no disponible | 15 | 24 | Apache 2.0 | Hugging Face |
| S3, QLoRA | 1.5B + adaptador | no disponible | 18 | 23 | Apache 2.0 (según repo) | Hugging Face |

La comparación más directa es con las otras variantes del mismo experimento (S1, S3 y S1m), todas sobre Qwen2.5-1.5B-Instruct. Frente a la base, este adaptador mejora la citación pero empeora el acierto. No se dispone de comparación con otros modelos de la misma categoría fuera de este trabajo.

## Limitaciones y advertencias

- Benchmark pequeño: con 30 preguntas, diferencias de hasta unos 5 aciertos entre modelos no son significativas, según el propio autor.
- Los pares de entrenamiento contienen un 22 % de rechazos; los modelos ajustados rechazan más que la base, incluso cuando la respuesta sí está en los fragmentos.
- El SFT enseña el formato (citar y rechazar), no conocimiento nuevo: la múltiple elección sin contexto no cambia respecto al modelo base.
- Es el único de los tres métodos en 1.5B con una caída de acierto significativa frente a la base (p = 0,012).
- Uso previsto de investigación y docencia; las respuestas dependen de los fragmentos proporcionados y no sustituyen la lectura de las fuentes.
- Riesgo de alucinación: no evaluado de forma específica; el mecanismo de rechazo mitiga parte del riesgo, pero no lo elimina.
- Sesgos conocidos: no documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo está pensado para investigación y enseñanza; conviene revisar la licencia del modelo base y del dataset asociado.
- Soporte limitado al portugués; no se documentan otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gutoportelaa/qwen2.5-segjusticidadania-sft-s2
- Dataset asociado: https://huggingface.co/datasets/gutoportelaa/segjusticidadania-experimentos
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
