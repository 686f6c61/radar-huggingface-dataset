# bigai/GS1-9B

## Resumen

GS1-9B es un modelo de decisión de tipo nativo desarrollado por BIGAI (Beijing Institute for General Artificial Intelligence). A diferencia de los modelos generativos convencionales, GS1 no produce tokens de salida: calcula distribuciones de probabilidad sobre candidatos definidos en tiempo de ejecución, lo que lo hace adecuado para tareas de enrutamiento de agentes, verificación, extracción y control. El modelo emplea una cabeza de decisión nativa basada en cross-attention multi-cabeza que compara la evidencia del estado con representaciones de pregunta y candidato.

El modelo se construye sobre un backbone híbrido derivado de Qwen3.5-9B, con 8.829.078.768 parámetros almacenados, dimensión oculta de 4.096, 32 capas de decodificador y una longitud máxima de rama completa de 32.768 tokens. Su arquitectura intercala tres capas causales de Gated DeltaNet con una capa de atención completa bidireccional segmentada, lo que permite preservar prefijos inmutables reutilizables entre consultas.

La relevancia actual de GS1-9B radica en su enfoque de decisión tipada (Choice, Noul, Score) con probabilidades calibradas mediante aprendizaje por refuerzo y recompensa Brier, lo que permite abstenciones explícitas, diferimiento y recogida de evidencia. Alcanza 70,45 en el índice público Decision Index 0.4.1, situándose en la frontera parámetro-rendimiento de la familia GS1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet causal + atención completa bidireccional segmentada, con cabeza de decisión cross-attention multi-cabeza |
| Parametros totales | 8.829.078.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (longitud máxima de rama completa) |
| Tipos de cuantizacion | no disponible (pesos almacenados en FP32 para texto y cabeza de decisión, BF16 para torre de visión) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GS1-9B utiliza un backbone híbrido basado en Qwen3.5-9B que intercala tres capas causales de Gated DeltaNet con una capa de atención completa bidireccional segmentada. Esta combinación proporciona a los candidatos su contexto completo de comparación mientras preserva prefijos inmutables reutilizables entre preguntas. La innovación "Attention Residual" con preservación de carry permite que los receptores de atención completa dispersa consulten representaciones anteriores manteniendo el ancla explícita de skip-connection.

El modelo incorpora una cabeza de decisión nativa de cross-attention multi-cabeza (16 cabezas de atención de decisión, 2 capas de enrutamiento de candidatos, dimensión de proyección de decisión de 2.048) que consulta la evidencia del estado usando representaciones de pregunta y candidato. El entrenamiento emplea aprendizaje por refuerzo multi-paso con recompensa Brier calibrada (RLCD), optimizando las probabilidades de acción muestreadas. Los pesos de texto y cabeza de decisión se almacenan en FP32, mientras que la torre de visión retenida se almacena en BF16; la inferencia soporta computación BF16 con logits finales FP32 y reducciones de probabilidad.

## Capacidades

- Decisión tipada nativa con tres primitivas: Choice (enrutamiento, clasificación, selección de herramientas), Noul (verificación y juicios binarios con p(true)) y Score (valoraciones ordenadas y juicios de rúbrica).
- Generación de distribuciones de probabilidad sobre candidatos definidos en tiempo de ejecución, sin tokens de salida generados.
- Enrutamiento de agentes y selección de herramientas con probabilidades de todos los candidatos y confianza.
- Verificación de proposiciones y juicios binarios con probabilidad calibrada.
- Extracción de información y clasificación con etiquetas candidatas.
- Control y automatización con juicios de rúbrica y niveles ordenados.
- Capacidades de visión (torre de visión retenida en BF16).
- Soporte de abstención explícita, diferimiento y recogida de evidencia gracias a probabilidades nativas y confianza.
- Multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento de agentes en sistemas multi-agente: el modelo selecciona la herramienta o agente adecuado entre candidatos definidos en tiempo de ejecución mediante la primitiva Choice, devolviendo probabilidades de todos los candidatos y confianza para permitir políticas de fallback.
- Verificación de afirmaciones en pipelines de RAG: usando la primitiva Noul, calcula p(true) para proposiciones extraídas de documentos, permitiendo filtrar respuestas no fundamentadas antes de mostrarlas al usuario.
- Clasificación de tickets de soporte: con candidatos de categorías definidos dinámicamente, produce macro-F1 competitivo (92,76 en BANKING77) sin generar texto, reduciendo latencia y coste.
- Selección de API en automatización de flujos: la primitiva Choice con candidatos de endpoints permite enrutar llamadas con precisión (85,43 en API-Bank), integrándose en orquestadores de herramientas.
- Evaluación con rúbricas en control de calidad: la primitiva Score devuelve el nivel esperado cero-indexado y probabilidades por nivel, útil para puntuar respuestas generadas por otros modelos según criterios predefinidos.
- Diferimiento y abstención en producción: cuando la confianza cae por debajo de un umbral, el modelo puede emitir una elección de abstención explícita, derivando el caso a un humano o a un modelo generativo mayor.
- Extracción de campos estructurados: con candidatos de valores o etiquetas, calcula distribuciones sobre opciones para tareas de extracción de entidades o normalización de datos.

## Benchmarks y rendimiento

Resultados del índice público Decision Index 0.3 (140.178 peticiones, 312.320 decisiones, 43 benchmarks de texto, cobertura 100%):

| Métrica | GS1-0.8B | GS1-2B | GS1-4B | GS1-9B |
|---|---:|---:|---:|---:|
| Public index ↑ | 56,12 | 62,22 | 68,97 | 70,45 |
| Raw index ↑ | 67,36 | 71,70 | 76,47 | 77,46 |
| Coverage | 100% | 100% | 100% | 100% |

Puntuaciones por área (escala 0-100 corregida por azar):

| Área | GS1-0.8B | GS1-2B | GS1-4B | GS1-9B |
|---|---:|---:|---:|---:|
| Knowledge & Reasoning | 33,32 | 41,84 | 52,40 | 56,01 |
| Language Understanding | 56,25 | 63,67 | 71,12 | 72,62 |
| Retrieval & Classification | 68,62 | 71,21 | 75,55 | 75,58 |
| Tools & Automation | 79,26 | 83,57 | 87,49 | 87,61 |
| Arts & Human Taste | 47,47 | 54,16 | 59,26 | 60,57 |

Resultados por benchmark seleccionados (GS1-9B):

| Benchmark | Métrica nativa | GS1-9B |
|---|---|---:|
| BFCL | case exact accuracy | 96,99 |
| ToolRet | nDCG@10 | 70,90 |
| API-Bank | accuracy | 85,43 |
| BANKING77 | macro-F1 | 92,76 |
| CLINC150+OOS | macro-F1 | 93,48 |
| RouterBench † | selected quality | 79,86 |
| Home appliance simulator | case exact accuracy | 100,00 |
| SGD/SGD-X † | macro-F1 | 67,60 |
| ContractNLI | macro-F1 | 85,99 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Los pesos de texto y cabeza de decisión están en FP32 (aproximadamente 35 GB solo para parámetros), y la torre de visión en BF16; el repo ocupa 34,4 GB.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el tamaño en FP32 (más de 32 GB) excede la VRAM de la mayoría de GPU de consumo.
- Opciones de despliegue: transformers con código personalizado (custom_code); otras opciones no disponibles en la información.
- Latencia y throughput: GS1-0.8B alcanza 12,51 ms P50 para una pregunta corta y 6,05× de speedup sobre inferencia por defecto para ocho preguntas cortas usando CUDA Graph. Para GS1-9B no se proporcionan datos de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Índice público | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| GS1-9B | 8.829.078.768 | 32.768 | 70,45 | Apache 2.0 | Hugging Face |
| GS1-4B | no disponible | no disponible | 68,97 | Apache 2.0 | Hugging Face |
| GS1-2B | no disponible | no disponible | 62,22 | Apache 2.0 | Hugging Face |
| GS1-0.8B | no disponible | no disponible | 56,12 | Apache 2.0 | Hugging Face |

No se dispone de comparativas con modelos de decisión de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- Modelo de decisión, no generativo: no produce texto libre; solo calcula distribuciones sobre candidatos definidos en tiempo de ejecución.
- Idiomas soportados no disponibles: no se especifica cobertura multilingüe.
- Riesgo de alucinación: aunque las probabilidades están calibradas, candidatos mal definidos o evidencia insuficiente pueden producir decisiones incorrectas con confianza alta.
- Dependencia del código personalizado: requiere transformers con custom_code, lo que puede complicar el despliegue en entornos con restricciones de dependencias.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las obligaciones de atribución y avisos.
- Pesos en FP32 para texto y cabeza de decisión incrementan los requisitos de memoria; no se documentan opciones de cuantización.
- La torre de visión está retenida en BF16; su rendimiento específico en tareas multimodales no está documentado.
- El índice público se evalúa con el protocolo typed-decision de Decision Index; comparaciones directas con benchmarks generativos convencionales pueden no ser equivalentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bigai/GS1-9B
- Colección GS1: https://huggingface.co/collections/bigai/gs1
- Código: https://github.com/bigai-nlco/GS1
- Documentación: https://github.com/bigai-nlco/GS1/blob/main/docs/README.md
- Playground: https://github.com/bigai-nlco/GS1/blob/main/playground/README.md
- Arquitectura: https://github.com/bigai-nlco/GS1/blob/main/docs/model.md
- RLCD: https://github.com/bigai-nlco/GS1/blob/main/docs/RLCD.md
