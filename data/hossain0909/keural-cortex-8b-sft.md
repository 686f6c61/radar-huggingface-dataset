# hossain0909/Keural-Cortex-8B-SFT

## Resumen

Keural-Cortex-8B-SFT es un ajuste supervisado (SFT) del modelo base Qwen3-8B-Base, publicado por el usuario hossain0909 en HuggingFace y presentado por el autor como el modelo central de la plataforma Keural AI de MKD Co., Ltd. (Busán, Corea del Sur). Se trata de un asistente bilingüe coreano-inglés construido en tres etapas segun la model card: preentrenamiento continuado sobre texto coreano, una fase de extensión de contexto hasta 65.536 tokens mediante YaRN y una época de SFT sobre 1.335.928 conversaciones únicas (1,77 mil millones de tokens de datos de instrucción).

El objetivo declarado del autor es asimétrico: alcanzar paridad con Qwen3-8B en inglés y superarlo en coreano. La model card reporta un barrido de evaluación controlado con `lm-evaluation-harness` sobre 223 subtareas, con una media de 60,73 en 11 suites coreanas (frente a 60,51 de Qwen3-8B-Instruct y 60,07 de Qwen3-8B-Base) y 74,47 en 36 suites inglesas (frente a 73,64 de Instruct y 75,21 de Base, segun los deltas reportados).

Es relevante para desarrolladores que necesiten un modelo de ~8B con licencia Apache 2.0, soporte declarado de tool calling y ventana larga, orientado a aplicaciones bilingües coreano-inglés. No obstante, el modelo tiene muy poca tracción (21 descargas, 0 likes) y el repositorio declara 2.047.683.840 parámetros en safetensors, un dato que no cuadra con el tamaño nominal de 8B del nombre ni con el peso del repositorio (16,4 GB), por lo que conviene verificar la integridad de los pesos antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-8B-Base); detalles internos no disponibles |
| Parametros totales | 2.047.683.840 segun safetensors del repo; el nombre y el modelo base indican 8B (discrepancia no aclarada por el autor) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 65.536 tokens (extensión con YaRN) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-8B-Base`, un transformer decoder-only de la familia Qwen3. Segun la model card, el entrenamiento se organiza en tres fases: (1) preentrenamiento continuado sobre texto coreano para reforzar la competencia en ese idioma; (2) una fase de extensión de contexto que lleva la ventana utilizable a 65.536 tokens mediante YaRN; y (3) una época de SFT sobre 1.335.928 conversaciones únicas, que suman 1,77 mil millones de tokens de datos de instrucción. No se detalla la composición del dataset, la proporción coreano/inglés ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO.

La model card no especifica innovaciones arquitectónicas propias mas alla de la extensión de contexto con YaRN. No se documentan detalles sobre atención lineal, decodificación especulativa ni modificaciones estructurales respecto al modelo base. La evaluación reportada se realizó el 2026-09-20 con una lista de tareas idéntica de `lm-evaluation-harness`, mismos few-shot y mismas GPUs para los tres modelos comparados, lo que aporta cierta consistencia metodológica, aunque no se publican los scripts de evaluación ni las semillas.

## Capacidades

- Generación de texto conversacional en coreano e inglés, con foco declarado en paridad con Qwen3-8B en inglés y mejora en coreano.
- Razonamiento y conocimiento general: evaluado en MMLU, ARC, HellaSwag, WinoGrande, LogiQA, entre otras suites.
- Aritmética: resultados muy altos en las 10 suites aritméticas reportadas (varias por encima del 99% de precisión).
- Tool calling / function calling: declarado en los tags del repositorio (`tool-calling`), aunque no se documenta el formato de llamada ni se aportan benchmarks específicos.
- Contexto largo: ventana de 65.536 tokens gracias a la extensión con YaRN, adecuada para conversaciones multi-turno extensas y documentos largos.
- Capacidades multilingües limitadas a coreano e inglés; no se declaran otros idiomas.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Atención al cliente bilingüe coreano-inglés: el modelo puede gestionar conversaciones multi-turno con historial largo gracias a su ventana de 65.536 tokens, manteniendo contexto de incidencias previas sin truncar.
- Asistente interno para empresas coreanas con documentación en inglés: útil para responder preguntas sobre manuales, políticas o contratos bilingües dentro de la ventana de contexto extendida.
- Procesamiento de documentos largos en coreano: resumen y extracción de información de informes, actas o expedientes que superan los 32K tokens, aprovechando la extensión YaRN.
- Clasificación y análisis de sentimiento en coreano: los resultados en KoBEST SentiNeg (94,21) sugieren buen rendimiento en tareas de polaridad, aplicable a monitorización de opiniones o reseñas.
- Generación de código asistida en entornos mixtos: aunque no se reportan benchmarks de código, el soporte declarado de tool calling permite integrarlo en pipelines de CI/CD para sugerencias y automatización de tareas, con validación adicional recomendada.
- Evaluación educativa y preguntas tipo examen: el resultado en CSAT-QA (50,80) y KMMLU (54,12) lo hace utilizable como apoyo en plataformas de preparación de exámenes coreanos, siempre con revisión humana.
- Prototipado rápido de agentes conversacionales: al ser Apache 2.0 y compatible con text-generation-inference y endpoints, sirve para desplegar asistentes internos sin coste de licencia.

## Benchmarks y rendimiento

Los datos siguientes provienen de la model card del autor (barrido del 2026-09-20 con `lm-evaluation-harness`). Se presentan las medias agregadas y una selección de suites representativas.

| Benchmark | Metrica | Keural-Cortex-8B | Qwen3-8B-Instruct | Qwen3-8B-Base |
|---|---|---|---|---|
| Media coreano (11 suites) | - | 60,73 | 60,51 | 60,07 |
| Media inglés razonamiento/conocimiento (26 suites) | - | 64,89 | 64,80 | 65,89 |
| Media inglés agregada (36 suites) | - | 74,47 | 73,64 | 75,21 |
| HAE-RAE | acc_norm | 65,08 | 60,04 | 63,06 |
| KMMLU | acc | 54,12 | 52,47 | 53,91 |
| KoBEST SentiNeg | acc | 94,21 | 89,92 | 83,63 |
| KoBEST BoolQ | acc | 50,85 | 61,11 | 57,05 |
| MMLU | acc | 74,11 | 73,02 | 74,70 |
| ARC-Challenge | acc_norm | 54,69 | 56,74 | 57,25 |
| HellaSwag | acc_norm | 78,37 | 74,90 | 78,59 |
| WinoGrande | acc | 71,98 | 68,11 | 72,38 |
| TruthfulQA mc1 | acc | 36,11 | 36,84 | 35,50 |
| Arithmetic 1dc | acc | 99,80 | 98,65 | 99,80 |
| Arithmetic 2da | acc | 100,00 | 99,95 | 100,00 |

Las cifras de las medias inglesas agregadas (74,47 frente a 73,64 y 75,21) no coinciden exactamente con la media de las 26 suites de razonamiento reportadas (64,89 / 64,80 / 65,89); la model card indica que el agregado incluye 36 suites, pero solo tabula 26 de razonamiento y 10 aritméticas, por lo que el cálculo exacto del agregado no es verificable con los datos publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa para un modelo de ~8B en transformers, se requerirían del orden de 16 GB en fp16 y 8-10 GB en cuantizaciones de 4 bits, pero el repositorio no publica cuantizaciones ni guías de despliegue.
- GPU recomendadas: no disponible. No se especifican GPUs objetivo ni se documenta el hardware usado en la evaluación (solo se menciona "same GPUs").
- Compatibilidad con GPU de consumo: no confirmada por el autor; dependería de la cuantización, que no se ofrece en el repositorio.
- Opciones de despliegue: el repositorio declara compatibilidad con `text-generation-inference` y `endpoints_compatible`, y la librería es `transformers`. No se mencionan vLLM, llama.cpp, Ollama ni otras alternativas, ni se aportan pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media coreano (11 suites) | Media inglés (26 suites) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Keural-Cortex-8B-SFT | 8B (nominal; safetensors declara 2,05B) | 65.536 | 60,73 | 64,89 | Apache 2.0 | HuggingFace, 21 descargas |
| Qwen3-8B-Instruct | 8B | no disponible en la informacion | 60,51 | 64,80 | Apache 2.0 (modelo base Qwen) | HuggingFace, ampliamente distribuido |
| Qwen3-8B-Base | 8B | no disponible en la informacion | 60,07 | 65,89 | Apache 2.0 | HuggingFace, ampliamente distribuido |

La comparativa se limita a los dos modelos de referencia usados por el propio autor. No se dispone de datos de otros modelos de 8B bilingües coreano-inglés en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia en el numero de parametros: el nombre indica 8B y el modelo base es Qwen3-8B-Base, pero los safetensors del repositorio declaran 2.047.683.840 parametros. Es imprescindible verificar la integridad y correspondencia de los pesos antes de cualquier uso en producción.
- Tracción muy baja: 21 descargas y 0 likes en el momento de la consulta, sin validación independiente de los resultados reportados.
- Los benchmarks son autodeclarados por el autor; no se publican scripts, semillas ni artefactos de evaluación reproducibles.
- Rendimiento inferior a Qwen3-8B-Instruct en varias tareas clave: KoBEST BoolQ (−10,26), ANLI-R1 (−16,50), RTE (−6,86), lo que sugiere debilidades en inferencia natural y coherencia discursiva.
- Riesgo de alucinación: TruthfulQA mc1 de 36,11 indica una tasa de veracidad limitada, similar a los modelos de referencia pero insuficiente para aplicaciones de alta exigencia factual sin verificación.
- Idiomas limitados a coreano e inglés; no se declara soporte de español ni de otros idiomas.
- No se documentan sesgos conocidos, composición del dataset de SFT ni procesos de filtrado, lo que dificulta evaluar riesgos de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- No se ofrecen cuantizaciones ni pesos GGUF, lo que limita el despliegue en hardware de consumo.
- La fecha de creación del repositorio (2026-10-28) es posterior a la fecha del barrido de evaluación (2026-09-20); conviene confirmar la correspondencia entre los pesos publicados y los resultados reportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hossain0909/Keural-Cortex-8B-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
