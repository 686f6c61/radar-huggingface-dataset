# KurniaKadir/hrmy

## Resumen

hrmy es un ajuste fino (fine-tune) del modelo moonshotai/Kimi-K2-Instruct, desarrollado por el usuario KurniaKadir, orientado a tareas de recursos humanos y cumplimiento legal en el contexto de Malasia. El modelo se presenta como una herramienta especializada en derecho laboral malasio, gestión de nóminas, prestaciones de la seguridad social (EPF/KWSP y SOCSO) y detección de disparidades salariales, con soporte bilingüe inglés-malayo.

El modelo parte de la arquitectura de Kimi-K2-Instruct, un transformer de gran escala con capacidades de generación de texto e instrucciones. El autor declara que el ajuste se ha realizado sobre conjuntos de datos específicos del dominio: legislación laboral malasia 2025, directrices del EPF/KWSP, prestaciones SOCSO 2025, casos del tribunal industrial y benchmarks de disparidad salarial.

La relevancia del modelo radica en su especialización vertical: frente a modelos generalistas, hrmy busca ofrecer respuestas alineadas con la normativa laboral malasia y métricas de equidad salarial. Sin embargo, la información pública disponible es limitada (0 descargas, 0 likes en el momento de la consulta) y el acceso está restringido (gated), lo que condiciona su evaluación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de moonshotai/Kimi-K2-Instruct) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en), malayo (ms) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería transformers; probable safetensors, no confirmado) |

## Arquitectura y entrenamiento

hrmy se construye mediante fine-tuning sobre moonshotai/Kimi-K2-Instruct, un modelo de la familia Kimi-K2 orientado a instrucciones. No se dispone de información pública sobre el número de parámetros totales o activos, la longitud de contexto efectiva tras el ajuste, ni la composición exacta del dataset de entrenamiento más allá de los identificadores declarados en las etiquetas del repositorio: `malaysian-employment-laws-2025`, `kwsp-epf-guidelines`, `socso-benefits-2025`, `industrial-court-cases` y `wage-disparity-benchmarks`.

No se documentan en la información disponible detalles sobre el volumen de tokens de entrenamiento, la proporción de datos sintéticos frente a reales, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado (SFT). Tampoco se especifican innovaciones técnicas propias del ajuste (por ejemplo, decodificación especulativa, atención lineal o modos de razonamiento extendido). Cualquier afirmación adicional sobre el proceso de entrenamiento sería especulativa y no se incluye.

## Capacidades

- Generación de texto y respuestas a preguntas sobre cumplimiento normativo laboral en Malasia (HR compliance QA).
- Razonamiento sobre disposiciones legales laborales, con una métrica declarada de precisión de provisiones legales del 94 % en el benchmark MYHR-QA-2025.
- Detección de disparidades salariales (fairness), con un valor declarado de 0,89 en el benchmark del autor.
- Comprensión multilingüe inglés-malayo, con un F1 declarado de 0,91 en el benchmark del autor.
- Soporte para consultas sobre nóminas y prestaciones (EPF/KWSP, SOCSO) según los datasets declarados.
- Capacidad de generación de texto en pipeline `text-generation` mediante la librería transformers.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión, audio ni modos de razonamiento extendido en la información disponible.

## Casos de uso

- Atención al personal de RR. HH.: el modelo puede responder consultas de empleados y gestores sobre derechos laborales, vacaciones y obligaciones contractuales conforme a la legislación malasia, usando los datasets de leyes laborales 2025 como base de conocimiento.
- Cálculo y explicación de prestaciones EPF/KWSP: puede asistir en la interpretación de las directrices del fondo de previsión de empleados para determinar contribuciones y elegibilidad, apoyándose en el dataset `kwsp-epf-guidelines`.
- Gestión de prestaciones SOCSO: puede orientar sobre coberturas, indemnizaciones y procedimientos de la seguridad social malasia a partir del dataset `socso-benefits-2025`.
- Análisis de disparidad salarial: puede utilizarse para detectar posibles brechas salariales y generar informes de equidad, dado el valor declarado de 0,89 en detección de disparidad salarial.
- Soporte en litigios laborales: puede resumir y razonar sobre casos del tribunal industrial malasio (`industrial-court-cases`) para preparar argumentarios o documentación interna.
- Asistencia bilingüe en documentación de RR. HH.: puede redactar y traducir políticas internas entre inglés y malayo, aprovechando su F1 declarado de 0,91 en comprensión multilingüe.
- Formación interna y compliance: puede generar material de formación sobre normativa laboral y servir como base para simulaciones de cumplimiento en entornos corporativos malasios.

## Benchmarks y rendimiento

Los resultados proceden de la model-index declarada por el autor en la model card. No están verificados de forma independiente (`verified: false`).

| Benchmark | Métrica | Valor | Verificado |
|---|---|---|---|
| MYHR-QA-2025 (HR Compliance QA) | Legal Provision Accuracy | 0,94 | No |
| MYHR-QA-2025 (HR Compliance QA) | Wage Disparity Detection (fairness) | 0,89 | No |
| MYHR-QA-2025 (HR Compliance QA) | Multilingual Understanding (F1) | 0,91 | No |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el número de parámetros del modelo base ni del ajuste).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan en la información disponible; al ser un modelo de la librería transformers, podría servirse con frameworks habituales (vLLM, TGI, llama.cpp), pero no hay confirmación oficial.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría (asistentes legales o de RR. HH. especializados en Malasia). El modelo base, moonshotai/Kimi-K2-Instruct, es la referencia más directa, pero no se documentan en la información proporcionada sus parámetros, contexto ni resultados comparables.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hrmy (KurniaKadir) | no disponible | no disponible | Apache 2.0 | Gated en Hugging Face |
| moonshotai/Kimi-K2-Instruct (base) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso real y validación por la comunidad.
- El acceso es restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede dificultar la reproducibilidad y la evaluación externa.
- El modelo está especializado en el contexto legal de Malasia; su uso fuera de esa jurisdicción puede producir respuestas inexactas o inaplicables.
- Solo se declaran idiomas inglés y malayo; no se garantiza un rendimiento fiable en castellano u otros idiomas.
- Riesgo de alucinación en materia legal: las respuestas sobre normativa, plazos o cuantías deben validarse con fuentes oficiales y asesoramiento jurídico cualificado.
- No se documentan sesgos conocidos, pero la detección de disparidad salarial (fairness 0,89) no equivale a ausencia de sesgo en las recomendaciones.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Kimi-K2-Instruct conviene revisar las condiciones del modelo base y del acceso gated.
- No se especifican requisitos de hardware ni opciones de cuantización, lo que complica la planificación de despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KurniaKadir/hrmy
- Modelo base: https://huggingface.co/moonshotai/Kimi-K2-Instruct
