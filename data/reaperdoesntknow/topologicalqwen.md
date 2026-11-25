# reaperdoesntknow/TopologicalQwen

## Resumen

TopologicalQwen es un modelo de lenguaje de 1,7B parámetros efectivos (2,03B totales en pesos) desarrollado por reaperdoesntknow (Convergent Intelligence LLC, Research Division). Se trata de un destilado del profesor Qwen3-30B-A3B-Thinking-2507 mediante una metodología propietaria denominada Topological Knowledge Distillation (TKD), que descompone la transferencia de conocimiento en tres canales —componente suave (KL estándar), correcciones de salto en fronteras conceptuales y correcciones de deriva tipo Cantor— en lugar de limitarse a la divergencia KL clásica.

El modelo parte de la arquitectura Qwen3ForCausalLM (28 capas, hidden size 2048, GQA con 16 cabezas Q y 8 KV, contexto de 40.960 tokens, vocabulario de 151.936) y se entrena sobre un corpus reducido de razonamiento físico en formato DualMind (`<explore>` → `<examine>` → `<response>`), que fuerza al modelo a generar una derivación, autocriticarla y sintetizar una respuesta limpia. Es relevante porque propone una alternativa al escalado puro: obtener capacidades de razonamiento estructurado en un modelo apto para edge con una fracción del coste computacional del profesor.

La ficha se basa exclusivamente en la model card pública y en los metadatos de Hugging Face. No se han publicado resultados de benchmarks ni información sobre idiomas soportados más allá de lo indicado en la propia card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only, GQA) |
| Parámetros totales | 2.031.739.904 (≈2,03B; 1,7B efectivos según el autor) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantización | no disponible (pesos en safetensors; inferencia BF16/FP16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 4,1 GB) |
| Hidden size | 2048 |
| Capas | 28 |
| Cabezas de atención | 16 (Q) / 8 (KV), GQA |
| Intermediate size | 6144 |
| Vocabulario | 151.936 |
| Precisión de entrenamiento | FP32 (autocast BF16) |
| Modelo base | reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT |
| Profesor | Qwen3-30B-A3B-Thinking-2507 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de la familia Qwen3, con 28 capas, hidden size 2048, FFN intermedio de 6144 y atención con grouped-query attention (16 cabezas de query, 8 de key/value). El contexto máximo es de 40.960 tokens y el vocabulario de 151.936 entradas. El modelo se distribuye en safetensors y se infiere en BF16/FP16.

El entrenamiento se articula en cuatro fases de TKD. Primero se cachean los logits del profesor 30B-A3B con compresión top-64 en disco (una sola pasada). Después se aplica un operador de discrepancia vectorizado (DISC) que detecta saltos en la distribución del profesor con umbral 3σ y amplificación 1,25×, y calcula densidad de energía de hueco en ventanas de 64 tokens. La tercera fase usa ventanas adaptativas de 512 tokens cortadas en posiciones de baja discrepancia (solape 32–128) en lugar de stride fijo. La cuarta fase aplica una destilación continua con currículum de 4 etapas (30% más fácil primero), pérdida ponderada por prueba (2,25× → 1,1×) y α de KD que sube de 0 a 0,45 entre el 15% y el 45% del entrenamiento, con KL a T=2,0. El batch efectivo es 32 (2 × 16 de acumulación), LR coseno de 5e-6 a 5e-7, warmup de 30 pasos, weight decay 1e-3 y gradient clip 1,0.

El corpus de entrenamiento son aproximadamente 1.599 muestras de cadena de pensamiento en física: ecuaciones diferenciales (636), mecánica teórica (307), electromagnetismo (580) y relatividad general (76). Cada muestra se reestructura en el formato DualMind con bloques `<explore>`, `<examine>` y `<response>`, de modo que el modelo aprende un bucle cognitivo de generación, crítica y síntesis. La cadena de destilación documentada es Qwen3-1.7B → DiStil-Qwen3-1.7B-uncensored → Disctil-Qwen3-1.7B → TopologicalQwen.

## Capacidades

- Generación de texto y razonamiento estructurado en dominios científicos, con énfasis en física teórica y matemáticas.
- Razonamiento en formato DualMind: derivación (`<explore>`), autocrítica adversarial (`<examine>`) y respuesta final limpia (`<response>`).
- Razonamiento matemático de tipo demostración (el ejemplo de la card es la prueba de que toda sucesión convergente es de Cauchy).
- Generación de cadenas de pensamiento largas (la card usa `max_new_tokens=2048`).
- Conversación multi-turno (tag `conversational`).
- Compatible con text-generation-inference y endpoints compatibles (tags de Hugging Face).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking nativo más allá del formato DualMind.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Tutoría de física universitaria: el modelo puede recibir un enunciado de mecánica teórica o electromagnetismo y generar una derivación paso a paso en `<explore>`, una verificación de errores en `<examine>` y una respuesta final en `<response>`, lo que facilita al estudiante ver el razonamiento y no solo el resultado.
- Generación de demostraciones matemáticas asistida: con 40.960 tokens de contexto puede recibir definiciones, lemas previos y el enunciado objetivo en un mismo prompt y producir una prueba estructurada, aprovechando el entrenamiento específico en ecuaciones diferenciales.
- Autoevaluación de razonamiento en pipelines de investigación: el bloque `<examine>` permite filtrar programáticamente respuestas donde la autocrítica detecta incoherencias, actuando como mecanismo de verificación barato en un modelo pequeño.
- Despliegue en edge y entornos con recursos limitados: con 2,03B parámetros y licencia Apache 2.0, es viable en GPUs de consumo y en dispositivos con poca VRAM para asistentes técnicos offline.
- Generación de material docente de física: producir explicaciones con derivación y contraargumentación para clases de relatividad general o electromagnetismo, donde el corpus de entrenamiento tiene cobertura explícita.
- Prototipado de investigación en destilación: sirve como referencia reproducible de la metodología TKD (con DOI asociado) para experimentar con destilación topológica sobre otros profesores.
- Asistente conversacional técnico de dominio acotado: para consultas de física y matemáticas donde el contexto largo permite arrastrar el histórico de la conversación y los lemas ya establecidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 4,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 5 y 7 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,2 GB de pesos; en 4 bits, alrededor de 1,2 GB (no se documentan GGUF oficiales, pero el tamaño lo permite).
- GPU recomendadas para producción: A100, H100 o L40S para servir con vLLM/TGI a concurrencia alta; RTX 4090 o RTX 3090 para desarrollo y despliegue mono-usuario.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; también en GPUs de 8 GB con cuantización.
- Opciones de despliegue: transformers (soporte nativo documentado), text-generation-inference (tag oficial), endpoints compatibles; llama.cpp/Ollama no están confirmados por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota: el contexto de 40.960 tokens exige planificación de memoria KV; a máxima longitud el consumo crece de forma significativa respecto a los pesos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| TopologicalQwen | 2,03B | 40.960 | Apache 2.0 | Destilado TKD de Qwen3-30B-A3B, formato DualMind | Hugging Face |
| Qwen3-1.7B (base) | 1,7B | 32.768 (según familia Qwen3; no confirmado en esta ficha) | Apache 2.0 | Modelo generalista original | Hugging Face |
| Qwen3-30B-A3B-Thinking-2507 (profesor) | 30B totales / 3B activos | no disponible | Apache 2.0 | MoE con razonamiento | Hugging Face |
| Disctil-Qwen3-1.7B (predecesor) | 1,7B | no disponible | no disponible | SFT sin refinar + DISC | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible: el autor no publica benchmarks frente a estos modelos. La ventaja declarada de TopologicalQwen es metodológica (TKD de tres canales) y de formato (DualMind), no medida en tareas estándar.

## Limitaciones y advertencias

- Corpus de entrenamiento muy estrecho: ~1.599 muestras de física (ecuaciones diferenciales, mecánica teórica, electromagnetismo, relatividad general). El rendimiento fuera de ese dominio no está caracterizado y probablemente degrade.
- Riesgo de alucinación en demostraciones: el formato `<examine>` simula autocrítica, pero no garantiza corrección matemática; las derivaciones deben validarse externamente.
- El modelo base es un Qwen3 "uncensored" refinado con DISC, lo que puede implicar una menor alineación de seguridad que el Qwen3 original; no hay evaluación de seguridad publicada.
- Idiomas soportados no documentados; el corpus de entrenamiento parece centrado en inglés técnico.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que supere a Qwen3-1.7B en tareas generales ni de que iguale al profesor en física.
- El formato DualMind impone una estructura de prompt concreta (`##USER:` y apertura de `<explore>`); usarlo fuera de ese formato puede degradar la calidad.
- Aunque la licencia es Apache 2.0, conviene revisar la licencia del modelo base y del profesor en la cadena de destilación antes de uso comercial.
- Repositorio con muy baja tracción (1 like, 3.162 descargas) y un único autor: menor garantía de mantenimiento y soporte.
- El contexto de 40.960 tokens requiere gestión cuidadosa de memoria KV en producción; no se documentan técnicas de atención lineal ni decodificación especulativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/TopologicalQwen
- Modelo base: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT
- Predecesor Disctil-Qwen3-1.7B: https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Metodología (DOI): https://doi.org/10.57967/hf/8165
- Profesor Qwen3-30B-A3B-Thinking-2507: no disponible en la información proporcionada (referenciado por nombre en la model card)
- Repositorio de código, demo o paper adicional: no disponibles en la información proporcionada
