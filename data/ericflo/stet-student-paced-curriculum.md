# ericflo/stet-student-paced-curriculum

## Resumen

Student-Paced Curriculum es un modelo compacto de gradient boosting publicado por el usuario ericflo en Hugging Face. Su función no es generar texto, sino puntuar pasajes de crawl de 112 tokens según su dificultad de lectura para un estudiante "Stet" en fase temprana, comparándolos con los de un estudiante completamente entrenado. El curador del sistema utiliza estas puntuaciones para intercambiar pasajes completos de igual longitud en tokens, preservando el número de veces que se ve cada fuente.

El modelo se enmarca en el proyecto Stet, un entorno de investigación sobre learning-to-rank y curriculum learning. Las etiquetas de entrenamiento provienen de dos estudiantes estándar de Stet a 768 pasos y de sus checkpoints totalmente entrenados, de modo que el modelo aprende a estimar la dificultad relativa de un pasaje respecto a un currículo ya maduro. Se entrenó con 1.710 pasajes de entrenamiento y 210 de desarrollo extraídos de dos muestras públicas de Common Crawl, con 570 pasajes adicionales reservados para evaluación.

Su relevancia es acotada pero específica: demuestra cómo un modelo ligero de ranking puede guiar la selección de datos en un pipeline de entrenamiento por currículo, sin necesidad de un LLM generativo. No hay información pública sobre arquitectura exacta, número de parámetros ni longitud de contexto, más allá de la ventana fija de 112 tokens de los pasajes que puntúa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gradient boosting (modelo de ranking compacto) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 112 tokens por pasaje (ventana fija de puntuación) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el autor indica comparaciones entre pasajes del mismo idioma, sin enumerar idiomas) |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo es un gradient-boosted ranker de tipo learning-to-rank, no un transformer. Puntúa pasajes de 112 tokens según su dificultad de lectura para un estudiante Stet temprano en relación con uno completamente entrenado. El curador compara pasajes del mismo idioma y misma forma, y sustituye pasajes completos de anchura de tokens igual, manteniendo constante el número de veces que se ve cada fuente.

Las etiquetas se obtuvieron de dos estudiantes estándar de Stet a 768 pasos y de los checkpoints totalmente entrenados correspondientes. El conjunto de entrenamiento consta de 1.710 pasajes y el de desarrollo de 210, ambos procedentes de dos muestras públicas de práctica de Common Crawl; una muestra de práctica separada aportó 570 pasajes reservados para evaluación. El entrenamiento excluyó las URL de ambos corpus docentes y los datos no contenían pasajes publicados de exámenes Stet. No se dispone de información sobre hiperparámetros, número de árboles, profundidad ni función de pérdida.

## Capacidades

- Puntuación de dificultad de lectura de pasajes de 112 tokens para un estudiante Stet temprano frente a uno totalmente entrenado.
- Ranking de pasajes mediante comparación de pares del mismo idioma y misma forma.
- Selección de datos para currículos de entrenamiento: intercambio de pasajes completos a igual anchura de tokens preservando el recuento de visitas por fuente.
- Estimación de la ganancia esperada de un currículo frente a alternativas de mezcla (Multilingual Structure Mix, GLiDE Exact Replay).
- Evaluación de correlación de ranking (Spearman macro) sobre muestras reservadas.
- No soporta generación de texto, tool calling, agentes, visión ni audio.

## Casos de uso

- Curaduría de currículos de entrenamiento: el modelo puntúa cada pasaje de 112 tokens y el curador intercambia pasajes de igual longitud para equilibrar la dificultad del currículo sin alterar el recuento de visitas por fuente.
- Selección de datos de Common Crawl para entrenamiento temprano: permite filtrar y ordenar pasajes de crawl según su dificultad relativa para un estudiante en fase inicial, reduciendo el coste de entrenar con datos demasiado difíciles.
- Comparación de estrategias de mezcla de datos: sus puntuaciones permiten estimar la ganancia de un currículo frente a Multilingual Structure Mix o GLiDE Exact Replay en bits por byte, como muestran las tablas del autor.
- Control de calidad de corpus multilingüe: al comparar solo pasajes del mismo idioma y forma, sirve para detectar desequilibrios de dificultad dentro de un mismo idioma antes de mezclar fuentes.
- Investigación en curriculum learning: proporciona una señal reproducible (Spearman macro de 0,525 en la muestra reservada) para estudiar cómo la dificultad de los datos afecta al entrenamiento de estudiantes pequeños.
- Prototipado rápido de pipelines de ranking: al ser un modelo compacto de gradient boosting con licencia MIT, puede integrarse en scripts de preprocesado sin infraestructura de GPU.

## Benchmarks y rendimiento

El autor publica resultados en bits por byte sobre exámenes primarios y frescos de dos corpus estándar, comparando la ganancia del currículo con dos alternativas.

| Corpus estándar | Examen | Ganancia | vs. Multilingual Structure Mix | vs. GLiDE Exact Replay |
|---|---|---:|---:|---:|
| s2-p00000 | primary | +0,07252 | +0,00436 | +0,00040 |
| s2-p00000 | fresh | +0,07213 | +0,00386 | +0,00074 |
| s2-p00001 | primary | +0,06988 | +0,00311 | +0,00225 |
| s2-p00001 | fresh | +0,06703 | +0,00280 | +0,00535 |

En la muestra reservada, el modelo alcanzó una correlación de Spearman macro de 0,525 y coincidió con ambos docentes en el 69,6% de 5.549 comparaciones del mismo idioma y forma en las que los docentes coincidían y la brecha media era de al menos 0,17 bits por token.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo de gradient boosting, es probable que se ejecute en CPU, pero el autor no publica requisitos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documentan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Student-Paced Curriculum (ericflo) | Gradient boosting para ranking de dificultad | no disponible | 112 tokens por pasaje | MIT | Hugging Face |
| Multilingual Structure Mix | Estrategia de mezcla de datos (referencia del autor) | no aplica | no aplica | no disponible | no disponible |
| GLiDE Exact Replay | Estrategia de repetición de datos (referencia del autor) | no aplica | no aplica | no disponible | no disponible |

No se dispone de información sobre otros modelos de ranking de dificultad comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo especializado en una tarea muy concreta (ranking de dificultad de pasajes de 112 tokens); no es un modelo de propósito general ni genera texto.
- La correlación de Spearman macro en la muestra reservada es de 0,525, lo que indica una capacidad predictiva moderada.
- Las etiquetas dependen de dos estudiantes Stet concretos a 768 pasos y de sus checkpoints totalmente entrenados; el modelo puede no generalizar a otros estudiantes o configuraciones.
- Los datos de entrenamiento provienen de dos muestras públicas de Common Crawl, con los sesgos y ruido propios de ese corpus.
- No se documentan idiomas soportados; el autor solo indica que las comparaciones se hacen entre pasajes del mismo idioma y forma.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de puntuaciones erróneas en pasajes atípicos.
- Licencia MIT: permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento.
- No se publican detalles de arquitectura, hiperparámetros ni formato de pesos, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ericflo/stet-student-paced-curriculum
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
