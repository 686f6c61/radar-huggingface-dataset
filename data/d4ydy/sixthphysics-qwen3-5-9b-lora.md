# d4ydy/sixthphysics-qwen3.5-9b-lora

## Resumen

SixthPhysics-Qwen3.5-9B-LoRA es un adaptador LoRA desarrollado por el usuario d4ydy sobre el modelo base Qwen/Qwen3.5-9B. Su propósito es especializar el modelo en la generación de preguntas de examen de física preuniversitaria verificables por un solucionador simbólico determinista. No se trata de un modelo de propósito general, sino de un componente dentro de un pipeline neuro-simbólico de dos turnos diseñado para producir enunciados, soluciones y rúbricas de corrección alineados con tres especificaciones curriculares: IB Physics (primera evaluación 2025), A-Level británico (DfE/AQA 7408) y NCUK International Foundation Year (IFYPH005).

El adaptador emplea LoRA con rango 32 y alpha 64, lo que supone 58.195.968 parámetros entrenables, un 0,6147% del modelo base de 9,47B. El entrenamiento se realizó con enmascaramiento estricto de pérdida solo en turnos del asistente sobre 2.413 trazas del split principal, y se seleccionó el checkpoint campeón exclusivamente sobre el conjunto de validación retenido antes de la evaluación bloqueada.

La relevancia del modelo reside en su enfoque: en lugar de confiar en la generación libre de texto, el pipeline obliga al modelo a proponer un escenario tipado que un motor de física en TypeScript resuelve de forma determinista, devolviendo cantidades verificadas que el modelo usa después para redactar la pregunta final. Esto reduce la alucinación numérica y permite una verificación automática de alineación curricular.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Qwen3_5ForConditionalGeneration (torre de visión congelada) |
| Parámetros totales | 9,47B (modelo base); adaptador LoRA: 58.195.968 parámetros entrenables |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-9B, un transformer con torre de visión (Qwen3_5ForConditionalGeneration) que en este pipeline se ejecuta con `enable_thinking=False` y la torre visual congelada. La configuración LoRA es r=32, alpha=64, con 58.195.968 parámetros entrenables (0,6147% del total). El entrenamiento usó enmascaramiento de pérdida solo en las respuestas del asistente sobre 2.413 trazas del split principal, y el checkpoint promovido (round1_sft_core) se eligió frente a una ablación de pulido con warm-start de ronda 2 exclusivamente sobre el conjunto de validación retenido (N=645) antes de la evaluación bloqueada.

La innovación técnica principal es el diseño neuro-simbólico de dos turnos. En el turno 1 (propose_scenario), el modelo emite un scenarioSpec tipado que cubre 103 discriminadores del solucionador en 11 dominios, junto con incógnitas ocultas al estudiante (hiddenQuantities) y un questionPlan previo a la resolución. Un motor de física determinista en TypeScript resuelve el escenario, renderiza un SVG seguro para el estudiante sin filtración de incógnitas y devuelve verifiedQuantities y formattedQuantities3sf exactas. En el turno 2 (author_package), el modelo redacta la pregunta completa (MCQ de Paper 1 o estructurada de Paper 2), las justificaciones de distractores, la solución trabajada y la rúbrica, que se validan con reglas numéricas, estructurales y de alineación a tres currículos.

## Capacidades

- Generación de preguntas de examen de física preuniversitaria en formato MCQ (Paper 1) y multiparte estructurado (Paper 2).
- Emisión de scenarioSpec tipado con 103 discriminadores del solucionador en 11 dominios de física.
- Propuesta de incógnitas ocultas (hiddenQuantities) y plan de pregunta previo a la resolución.
- Redacción de justificaciones de distractores, soluciones trabajadas y rúbricas de corrección.
- Integración en un pipeline de dos turnos con un motor de física determinista y un guardián SVG para estudiantes.
- Alineación automática con tres especificaciones: IB Physics 2025 (SL y HL, temas A–E, g=9,8 m s^-2), A-Level británico (AS y completo, g=9,81 m s^-2) y NCUK IFY Physics (semestres 1 y 2, g=9,81 m s^-2).
- Verificación numérica a 3 cifras significativas mediante puerta determinista.
- Soporte de tool use implícito a través del contrato de dos turnos con el solucionador.
- Capacidad multilingüe limitada al inglés (idioma declarado: en).
- No se declara soporte de agentes autónomos generales, visión activa ni audio; la torre de visión está congelada y el modo thinking desactivado.

## Casos de uso

- Generación automatizada de bancos de preguntas de física para IB, A-Level y NCUK: el modelo produce enunciados con solución y rúbrica verificadas por el solucionador determinista, lo que permite escalar la creación de material didáctico sin revisión manual de cada ítem.
- Plataformas de práctica adaptativa: integrado en la aplicación SixthPhysics, el modelo genera preguntas nuevas bajo demanda alineadas al currículo del estudiante, con cantidades verificadas y SVG seguro para el alumno.
- Evaluación formativa con retroalimentación: las justificaciones de distractores y la solución trabajada permiten explicar por qué cada opción incorrecta falla, útil en sistemas de tutoría.
- Control de calidad curricular: el verificador de alineación a tres currículos permite auditar automáticamente si un ítem generado cumple la especificación objetivo (temas, constantes, convenciones).
- Investigación en neuro-simbólico: el pipeline de dos turnos con solucionador determinista sirve como banco de pruebas para estudiar la reducción de alucinación numérica en generación de contenido científico.
- Producción de material de examen con trazabilidad: el recibo de verificación (verifiedQuantities, formattedQuantities3sf) permite auditar cada ítem generado y reproducir la resolución.
- Aumento de bancos existentes: partiendo del banco estático de 7.643 ítems (4.838 MCQ y 2.805 estructurados en 11 dominios), el adaptador puede generar variantes y nuevos escenarios manteniendo la verificación.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model-index. Todos los porcentajes y los intervalos de confianza Wilson al 95% fueron re-puntuados localmente según el autor (22/22 informes coincidentes, 0 discrepancias).

| Split y protocolo | Step 1 Solver Pass | Step 2 Gate Pass | Syllabus Aligned | End-to-End Verified | Conditional Step 2 |
|---|---|---|---|---|---|
| Qwen3.5-9B sin ajustar — Locked Test 0-Retry (N=586) | 13,82% (81/586) | 3,92% (23/586) | 2,73% (16/586) | 0,00% | no disponible |
| SixthPhysics-Qwen3.5-9B-LoRA — Locked Test (Family-Disjoint), 0-Retry | no disponible | no disponible | no disponible | 64,51% | no disponible |
| SixthPhysics-Qwen3.5-9B-LoRA — Locked Test, 1-Retry Closed-Loop | no disponible | no disponible | 87,03% | 75,60% | no disponible |
| SixthPhysics-Qwen3.5-9B-LoRA — Locked Test, Teacher-Forced Step 2 | no disponible | no disponible | no disponible | 90,61% | no disponible |
| SixthPhysics-Qwen3.5-9B-LoRA — Novel-1500 (IB/A-Level/NCUK), 0-Retry | no disponible | no disponible | no disponible | 67,53% | no disponible |
| SixthPhysics-Qwen3.5-9B-LoRA — Novel-1500, 1-Retry Closed-Loop | no disponible | no disponible | 91,07% | 78,40% | no disponible |

Conjuntos de evaluación: Locked Test con 586 ítems y 28 familyGroupKey no vistas (SHA-256 fd6888e5...0b1252); Novel-1500 con 1.500 prompts nuevos (500 IB 2025, 500 UK A-Level, 500 NCUK IFY, semillas disjuntas 90000001..90001500); validación retenida con 645 ítems (SHA-256 a094cab4...c846). La comparación directa con el modelo base sin ajustar solo está disponible para el Locked Test 0-Retry.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, un modelo base de 9,47B en precisión completa requiere del orden de 19 GB solo para pesos, y en cuantización de 4 bits alrededor de 5-6 GB, pero estos valores no están confirmados por el autor.
- El adaptador LoRA en sí ocupa 0,3 GB (tamaño del repositorio) y debe cargarse junto al modelo base Qwen/Qwen3.5-9B.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base y de la cuantización elegida.
- Opciones de despliegue: no disponible en la información proporcionada. El pipeline requiere el arnés determinista en TypeScript del repositorio sixthphysics/sixthphysics para la verificación neuro-simbólica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SixthPhysics-Qwen3.5-9B-LoRA | 9,47B base + 58,2M adaptador | no disponible | Generación de preguntas de física preuniversitaria verificadas | apache-2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3.5-9B (base sin ajustar) | 9,47B | no disponible | Propósito general, multimodal | no disponible en la información | Hugging Face |
| Otros adaptadores de física educativa | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (generación neuro-simbólica de preguntas de física preuniversitaria) en la documentación proporcionada. La única comparación cuantitativa disponible es frente al modelo base sin ajustar en el Locked Test 0-Retry, donde el adaptador eleva el End-to-End Verified del 0,00% al 64,51%.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en física preuniversitaria (IB 2025, A-Level AQA 7408, NCUK IFYPH005); su uso fuera de ese dominio no está validado y probablemente degrade.
- Idioma declarado únicamente inglés (en); no se garantiza calidad en castellano ni en otros idiomas.
- Los benchmarks son declarados por el autor y marcados como `verified: false` en la model-index; la re-puntuación local reportada por el autor no constituye una verificación independiente por terceros.
- El modelo depende de un pipeline externo (solucionador determinista en TypeScript y guardián SVG) para alcanzar los resultados reportados; usarlo de forma aislada sin ese arnés no reproduce las cifras de End-to-End Verified.
- Riesgo de alucinación numérica si se emplea fuera del contrato de dos turnos; el diseño neuro-simbólico mitiga pero no elimina este riesgo.
- El adaptador se entrenó sobre datos 100% sintéticos verificados por solucionador; puede heredar sesgos de la distribución de escenarios del banco (11 dominios, 103 discriminadores) y no cubrir temas fuera de esa taxonomía.
- La torre de visión está congelada y el modo thinking desactivado, por lo que no se explotan capacidades multimodales ni de razonamiento extendido del modelo base.
- La licencia apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen/Qwen3.5-9B, que no se detalla en la información proporcionada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por la comunidad.
- No se han publicado datos de latencia, throughput ni requisitos de hardware, lo que dificulta la planificación de despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/d4ydy/sixthphysics-qwen3.5-9b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset y benchmark: https://huggingface.co/datasets/d4ydy/sixthphysics-bench-and-bank
- Recibo de benchmark final: https://huggingface.co/datasets/d4ydy/sixthphysics-bench-and-bank/blob/main/benchmark/FINAL_SUMMARY.json
- Aplicación de práctica en vivo: https://sixthphysics.github.io
- Código fuente y arnés: https://github.com/sixthphysics/sixthphysics
