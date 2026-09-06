# dharun2049/Brahmaputra-1

## Resumen

Brahmaputra-1 es un modelo de lenguaje de 494 millones de parámetros (0.5B) desarrollado por dharun2049. Parte del checkpoint `dharun2049/kaveri-stgrpo-0.5b` y aplica una etapa de destilación de conocimiento contrastiva con restricciones de cómputo, utilizando como profesor el modelo denso `Qwen/Qwen3.8-27B`. El objetivo principal es transferir la geometría de probabilidad de respuestas de opción múltiple (A/B/C/D) del profesor al estudiante, sin realizar destilación de vocabulario completo. El modelo está diseñado para tareas de razonamiento con preguntas de opción múltiple y, además, incorpora un mecanismo de replay anti-olvido basado en Codeforces para preservar capacidades de codificación en C++. La licencia es Apache 2.0, lo que permite su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen2, según tags) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (modelo fusionado y adaptador LoRA en `ckd_adapter/`) |

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la información disponible, pero los tags indican que el modelo pertenece a la familia Qwen2 y hereda la estructura del checkpoint base `dharun2049/kaveri-stgrpo-0.5b`. El entrenamiento consiste en una destilación de conocimiento contrastiva (CKD) con el profesor `Qwen/Qwen3.8-27B`. La destilación no realiza KL sobre el vocabulario completo; en su lugar, para cada pregunta de opción múltiple, el profesor puntúa las opciones A/B/C/D y el estudiante aprende la distribución de probabilidad de cuatro vías del profesor.

La función de pérdida combinada es: `L = 1.0 * L_MC + 1.5 * L_KD + 0.2 * L_margin + 0.35 * L_explanation`. `L_MC` es la entropía cruzada supervisada de opción múltiple, `L_KD` es la divergencia KL con temperatura sobre las puntuaciones del profesor, `L_margin` fuerza que la puntuación de la respuesta correcta supere a las de los distractores, y `L_explanation` entrena sobre explicaciones concisas generadas por el profesor y explicaciones nativas disponibles.

Para evitar el olvido de habilidades de codificación, la etapa CKD intercala aproximadamente un 15% de micro-batches de replay de C++ provenientes de `open-r1/codeforces`. Antes de adjuntar el adaptador CKD, el checkpoint inicial genera trayectorias de replay deterministas. Los batches de codificación optimizan `L_code = 0.75 * L_replay_CE + 1.0 * L_anchor_KL`, donde la referencia KL es la política Kaveri exacta previa a CKD, obtenida desactivando temporalmente el adaptador fresco. El ancla se calcula sobre el soporte de tokens top-64 de la política de referencia en posiciones de completado. El KD del profesor está condicionado por confianza: si la elección principal del profesor no coincide con la respuesta dorada, ese ejemplo recibe peso KD cero, mientras que su pérdida supervisada dorada permanece activa.

El entrenamiento se realizó con LoRA (rank 16, alpha 32) sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, completando 279 pasos de optimizador. Los datos de entrenamiento provienen de MedMCQA (1631 ejemplos), ARC-Challenge (1032), OpenBookQA (1671), ARC-Easy (1510) y CommonsenseQA (1727), con un total de 7.969 ejemplos puntuados por el profesor y 59 explicaciones generadas por `Qwen3.8-27B`. MMLU dev/test no se cargaron ni se usaron durante el entrenamiento. El repositorio contiene el modelo fusionado en la raíz y el adaptador CKD en `ckd_adapter/`. El script de entrenamiento incluye un gobernador de unidades de cómputo; la estimación de CU al guardar es de 7.10.

## Capacidades

- Generación de texto: el modelo está disponible como pipeline `text-generation`.
- Razonamiento en preguntas de opción múltiple: entrenado para estimar la probabilidad de las opciones A/B/C/D en datasets como MedMCQA, ARC-Challenge, OpenBookQA, ARC-Easy y CommonsenseQA.
- Aprendizaje de la geometría de probabilidad del profesor: el modelo captura la distribución de confianza entre opciones, lo que permite una clasificación discriminativa de distractores.
- Codificación en C++: conserva habilidades de generación de código en C++ gracias al replay de Codeforces y al mecanismo de anclaje KL anti-olvido.
- Soporte de adaptadores LoRA (PEFT): el adaptador CKD se preserva en `ckd_adapter/`, lo que facilita el fine-tuning o el intercambio de adaptadores.
- Tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no documentado; los datasets de entrenamiento están en inglés.
- Capacidades especiales (visión, audio, thinking mode): no documentado.

## Casos de uso

- Evaluación educativa automatizada: el modelo puede responder preguntas de opción múltiple en dominios como medicina (MedMCQA) y ciencias (ARC, OpenBookQA). Se puede integrar en plataformas de e-learning para corregir exámenes tipo test o para ofrecer retroalimentación inmediata a estudiantes. Su tamaño reducido (494M) permite desplegarlo en servidores modestos.
- Filtrado de respuestas en pipelines de QA: en un sistema de pregunta-respuesta, el modelo puede puntuar rápidamente las opciones A/B/C/D, descartando distractores antes de que un modelo más grande realice el razonamiento final. Esto reduce el coste de inferencia en arquitecturas multi-modelo.
- Asistente de programación competitiva en C++: gracias al replay de Codeforces, el modelo conserva habilidades de generación de código C++. Puede usarse como asistente en problemas de programación competitiva, generando soluciones parciales o sugerencias de corrección. Se recomienda para fragmentos de código cortos, ya que la longitud de contexto no está documentada.
- Investigación en destilación de conocimiento contrastiva: el modelo es un ejemplo práctico de destilación con restricciones de cómputo (7.10 CU estimados). Los investigadores pueden estudiar la función de pérdida combinada (`L_MC`, `L_KD`, `L_margin`, `L_explanation`) y el mecanismo de anti-olvido para replicar o extender el método en otros modelos.
- Clasificación de opciones en sistemas de tutoría inteligente: el modelo predice la probabilidad de cada opción en preguntas de opción múltiple, lo que permite detectar en qué opciones los estudiantes podrían fallar. Su precisión en MCQ externo (0.5276) es modesta, pero sirve como referencia rápida.
- Despliegue en entornos con recursos limitados: al ser un modelo de 494M con licencia Apache 2.0, puede desplegarse en CPUs, Raspberry Pi o GPUs pequeñas para aplicaciones educativas offline. El formato safetensors y la compatibilidad con Transformers y TGI facilitan la integración.
- Generación de explicaciones para opciones múltiples: aunque solo se generaron 59 explicaciones con el profesor, el modelo incluye un término de pérdida `L_explanation`. Puede usarse para producir justificaciones breves de la respuesta correcta en contextos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor reporta una métrica de evaluación interna sobre un conjunto externo de preguntas de opción múltiple:

| Métrica | Valor |
|---|---|
| Precisión MCQ externa antes de CKD | 0.5251 |
| Precisión MCQ externa después de CKD | 0.5276 |

No se dispone de comparaciones con otros modelos ni de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1 GB en FP16 (pesos de 494M), ~0.5 GB en 8 bits, ~0.3 GB en 4 bits. Se recomienda al menos 2 GB de VRAM para inferencia con overhead.
- GPU recomendadas: RTX 3050, RTX 4060, T4, A10G. También puede ejecutarse en CPU con 4-8 GB de RAM.
- Capacidad en GPU de consumo: sí, cabe en GPUs de consumo con 2 GB o más de VRAM.
- Opciones de despliegue: Transformers, TGI (según tags), y potencialmente llama.cpp u Ollama si se convierte a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Brahmaputra-1 | 494M | no disponible | Apache 2.0 | HuggingFace |
| kaveri-stgrpo-0.5b (base) | 0.5B (según nombre) | no disponible | no disponible | HuggingFace |
| Qwen3.8-27B (profesor) | 27B (según nombre) | no disponible | no disponible | HuggingFace |

No se dispone de información suficiente para comparar el rendimiento con modelos de la misma categoría. El modelo base es `dharun2049/kaveri-stgrpo-0.5b`, y el profesor utilizado en la destilación es `Qwen/Qwen3.8-27B`.

## Limitaciones y advertencias

- El modelo no incluye documentación sobre sesgos. Al estar entrenado en datasets en inglés, puede presentar sesgos culturales y lingüísticos.
- Riesgo de alucinación: al ser un modelo pequeño (494M), la generación puede ser incoherente o inventar respuestas, especialmente fuera del dominio de opción múltiple.
- Contexto limitado: la longitud de contexto no está documentada; se recomienda usar entradas cortas.
- Idiomas: no se especifican. Los datasets de entrenamiento están en inglés, por lo que el rendimiento en otros idiomas es incierto.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base y de los datos de entrenamiento.
- El modelo está especializado en opción múltiple; no se documentan capacidades de tool calling, agentes, visión ni audio.
- La precisión en MCQ externo es 0.5276, lo que indica un rendimiento modesto y no apto para tareas críticas sin validación adicional.
- El entrenamiento utilizó solo 7.969 ejemplos puntuados por el profesor, por lo que la generalización puede ser limitada.

## Enlaces

- HuggingFace: https://huggingface.co/dharun2049/Brahmaputra-1
- Perfil del autor: https://huggingface.co/dharun2049
- No se encontraron papers, blogs, repos o demos adicionales en la información proporcionada.
