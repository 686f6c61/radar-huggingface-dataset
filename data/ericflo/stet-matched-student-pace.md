# ericflo/stet-matched-student-pace

## Resumen

Matched Student Pace es un experimento de investigación sobre currículo de entrenamiento publicado por el usuario ericflo en Hugging Face. No es un modelo de propósito general, sino un par de checkpoints de un "estudiante" causal de tipo Stet (arquitectura estándar de la temporada 2 de Stet) entrenados sobre pasajes de crawl público del corpus de práctica s2-p00000. El objetivo declarado es medir la dificultad de lectura de un mismo pasaje nativo en dos etapas del entrenamiento (temprana y madura) y usar esa señal para reordenar el currículo: el "curador" adelanta pasajes cuando el estudiante joven los lee con más facilidad y su dificultad madura es similar.

El modelo se presenta como una comparación entre un currículo estándar y un currículo guiado por el ritmo del estudiante (Student-Paced Curriculum), evaluada en bits por byte sobre exámenes reservados. El checkpoint temprano corresponde al paso 768 y el maduro al paso 9.765, ambos con pesos en media precisión y embeddings compartidos guardados una sola vez. El repositorio ocupa 0,1 GB, lo que confirma que se trata de modelos pequeños.

La relevancia es metodológica más que práctica: documenta cómo una señal derivada del propio modelo en formación puede usarse para ordenar datos de entrenamiento, con márgenes medidos y reproducibles sobre corpus concretos. No hay información sobre idiomas soportados, pipeline de uso ni benchmarks estándar de capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal language model, arquitectura estándar Stet Season 2 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados en media precisión) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (pesos en half-precision con embedding compartido guardado una vez) |

## Arquitectura y entrenamiento

Se trata de dos checkpoints de un modelo causal de la familia Stet (Season 2, arquitectura estándar), entrenados en una única trayectoria sobre pasajes de crawl público del corpus de práctica s2-p00000. El checkpoint temprano proviene del paso 768 y el maduro del paso 9.765. La calibración usa pasajes de crawl separados y el texto de examen se reservó exclusivamente para puntuación, de modo que las cifras reportadas no contaminan el entrenamiento.

La innovación técnica no está en la arquitectura sino en el procedimiento de curado de datos: dos estudiantes pequeños miden la dificultad de lectura del mismo pasaje en etapas temprana y madura, y el curador mueve pasajes hacia delante cuando el estudiante joven los lee con más facilidad y las dificultades de ambas etapas son cercanas. Los intercambios respetan idioma, forma y anchuras de token similares, y el curador verifica el presupuesto total y la exposición por fuente antes de escribir el guion final. No se documentan detalles sobre volumen de tokens, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de texto causal (modelo de lenguaje autorregresivo).
- Medición interna de dificultad de lectura por pasaje, usada como señal de currículo.
- Comparación de dificultad entre etapas de entrenamiento (checkpoint temprano frente a maduro).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el material menciona "Multilingual Structure Mix" como examen, pero no se especifica cobertura de idiomas.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación en currículo de datos: usar los dos checkpoints como señal para reordenar pasajes de un corpus de entrenamiento según su dificultad de lectura temprana y madura, replicando el procedimiento del autor.
- Experimentos de ablación sobre ordenación de datos: comparar un currículo estándar frente a uno guiado por el estudiante con la misma trayectoria de entrenamiento y medir la diferencia en bits por byte.
- Validación de metodología de evaluación: emplear la separación entre calibración y examen reservado como plantilla para diseñar evaluaciones sin fuga de datos.
- Estudio de dinámica de aprendizaje temprano: analizar qué pasajes resultan fáciles al paso 768 y difíciles al paso 9.765 para caracterizar la evolución del modelo.
- Reproducción de resultados: reentrenar sobre los corpus s2-p00001 y s2-p00002 y contrastar los márgenes reportados.
- Docencia y divulgación: ilustrar con un caso concreto y medido cómo el orden de los datos afecta a la pérdida final en modelos pequeños.

## Benchmarks y rendimiento

Los resultados publicados son diferencias en bits por byte (menor es mejor) del currículo estándar frente al Student-Paced Curriculum, medidas sobre exámenes reservados.

| Corpus estándar | Examen | Margen sobre Student-Paced Curriculum (bits/byte) |
|---|---:|---:|
| s2-p00001 | Primary | +0,00136 |
| s2-p00001 | Fresh | +0,00169 |
| s2-p00002 | Primary | +0,01087 |
| s2-p00002 | Fresh | +0,00730 |

En s2-p00002 ambos curadores se evaluaron con la misma comparación por ítem usando Multilingual Structure Mix. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 0,1 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM es suficiente.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del repositorio; no se especifican modelos concretos.
- Opciones de despliegue: no disponibles; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (currículos de entrenamiento o estudiantes causales pequeños de la familia Stet) con parámetros, contexto o licencia verificables.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado como asistente de propósito general ni se documenta su calidad conversacional.
- Ausencia total de benchmarks estándar de capacidad; no es posible evaluar su rendimiento en tareas convencionales.
- Idiomas soportados no especificados; no se puede asumir cobertura multilingüe pese a la mención de Multilingual Structure Mix.
- Los márgenes reportados son muy pequeños (del orden de 0,001 a 0,01 bits por byte) y específicos de los corpus s2-p00001 y s2-p00002; no deben generalizarse sin replicación.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo pequeño entrenado sobre crawl público, es razonable esperar sesgos del corpus, pero no hay datos.
- Licencia MIT: permite uso comercial, pero el modelo no incluye garantías ni documentación de producción.
- Sin descargas ni likes en el momento de la consulta; ecosistema y soporte comunitario inexistentes.
- El repositorio no declara pipeline de Hugging Face, lo que puede complicar la carga automática con herramientas estándar.

## Enlaces

- Hugging Face: https://huggingface.co/ericflo/stet-matched-student-pace
- Reglas y formato de Stet: https://www.stetrun.com/AGENTS.md
