# cds-jb/talkie-1930-13b-timetravel

## Resumen

`cds-jb/talkie-1930-13b-timetravel` es un conjunto de 17 adaptadores LoRA (r=128, α=256, fp32) diseñados para inyectar conocimiento posterior a 1930 en el modelo base `talkie-lm/talkie-1930-13b-base`, un transformer de 13B parámetros preentrenado exclusivamente con 260B tokens de texto en inglés anterior a 1931. El proyecto, desarrollado por cds-jb, explora una pregunta de interpretabilidad: qué hace un modelo que "vive" en 1930 cuando recibe información de su futuro. Los adaptadores se entrenan con distintas fuentes (web real, documentos sintéticos, instrucciones) y a través de diferentes capas de acceso, permitiendo estudiar cómo se reorganizan las representaciones internas al incorporar conocimiento anacrónico.

La relevancia de este modelo radica en su enfoque experimental: no busca mejorar el rendimiento en tareas estándar, sino investigar la plasticidad de las representaciones lingüísticas y la emergencia de comportamientos como la "transposición" (hechos modernos expresados en el registro de la época). Es una herramienta para investigación en interpretabilidad, transferencia de conocimiento y análisis de sesgos temporales, más que un modelo de producción general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base de 13B) + 17 adaptadores LoRA (r=128, α=256, fp32, 7 proyecciones por bloque, embeddings y lm_head congelados) |
| Parametros totales | 13B (base) + parámetros de adaptadores no especificados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los adaptadores están en fp32; el base podría cuantizarse, pero no se documenta) |
| Idiomas soportados | Inglés (corpus pre-1931) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (archivos .pt) |

## Arquitectura y entrenamiento

El modelo base `talkie-1930-13b-base` es un transformer de 13B parámetros preentrenado desde cero sobre 260B tokens de texto inglés anterior a 1931 (periódicos, novelas, artículos científicos, actas parlamentarias, la Encyclopædia Britannica, etc.). Sobre este base, los 17 adaptadores LoRA se entrenan mediante *continued pretraining* con distintos conjuntos de datos:

- **knowledge/v1**: mezcla 1:1 de web moderna real (ClimbMix) y replay de texto pre-1930, 5.0B tokens.
- **knowledge/v2**: documentos sintéticos (~105M tokens) en ~30 géneros con "vantage" (reseñas, obituarios, cartas, guiones de radio, etc.) más un registro puente de "cartas a 1930".
- **knowledge/tv3**: documentos de referencia impersonales (cronologías, tablas, abstracts) con filtro de cutoff por año (1930, 1980, 2010), ~105M tokens cada uno.
- **it_eralocked/ti1**: 21.7k pares de instrucción con contenido estrictamente pre-1931, ~10M tokens.
- **it_elicitation/ti2**: 44k pares de época + 22.7k pares de elicitación a libro cerrado, ~30M tokens.

No se emplea RLHF ni DPO. El entrenamiento usa la librería `talkie_cpt` (código disponible en el repositorio). Los adaptadores se aplican a 7 proyecciones por bloque (probablemente q, k, v, o, y las del MLP), manteniendo congelados embeddings y lm_head.

## Capacidades

- Generación de texto en registro histórico (inglés de pre-1931) con conocimiento moderno inyectado.
- Transposición de hechos contemporáneos al lenguaje y contexto de la década de 1930 (p. ej., Brexit como retirada de la CECA, resoluciones de la ONU atribuidas a la Sociedad de Naciones).
- Soporte de formato de chat simple (`USER: {q}\nASSISTANT:`) en los adaptadores ti1 y ti2.
- Los adaptadores de conocimiento funcionan en modo base (completado libre).
- No se documenta soporte de tool calling, agentes, visión ni audio.
- Capacidad multilingüe limitada al inglés (el corpus base es exclusivamente inglés).

## Casos de uso

- **Investigación en interpretabilidad**: estudiar cómo se representan internamente hechos anacrónicos en un modelo con un "mundo" temporal fijo, usando métricas como CKA por capas.
- **Generación de ficción histórica especulativa**: crear relatos donde personajes de 1930 reaccionan a eventos modernos (transistores, guerras, avances tecnológicos) con su vocabulario y marco conceptual.
- **Educación histórica interactiva**: simular cómo una persona de 1930 podría interpretar noticias actuales, útil para clases de historia o museos.
- **Análisis de sesgos temporales**: examinar cómo el conocimiento moderno se distorsiona al filtrarse a través de un corpus histórico, revelando supuestos culturales de ambas épocas.
- **Experimentación con inyección de conocimiento**: comparar diferentes estrategias de adaptación (datos reales vs. sintéticos, géneros con voz vs. referencia impersonal) y su efecto en la coherencia del modelo.
- **Desarrollo de técnicas de alineación temporal**: servir como banco de pruebas para métodos que controlen cuándo y cómo un modelo debe actualizar su conocimiento del mundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El proyecto reporta métricas específicas de su experimento:

| Modelo | Tasa de transposición | n muestreado |
|---|---|---|
| Base sin adaptador | 0.0% | 215 |
| v2 (persona sintética) | 11% (temp 0.8) | 215 |
| v1 (web real) | 3.4% (temp 0.9) | 1,075 |
| tv3_1930 | 3.3% (temp 0.9) | 1,075 |
| tv3_1980 | 2.3% (temp 0.9) | 1,075 |
| tv3_2010 | 1.3% (temp 0.9) | 1,075 |

Además, se reporta un análisis de similitud de representaciones (CKA) entre los adaptadores y el base: todos los adaptadores de conocimiento mantienen una CKA ≥ 0.96 en todas las capas, indicando que la inyección apenas altera la geometría de las representaciones. El modo de fallo más común es la "ruptura de registro" (~8%), donde el modelo recupera contenido moderno y abandona el registro de época a mitad de frase.

## Requisitos de hardware

- El modelo base de 13B requiere aproximadamente 26 GB de VRAM en fp16, 13 GB en 8-bit y 7 GB en 4-bit (estimación estándar para 13B; no se documenta cuantización específica para este proyecto).
- Los adaptadores LoRA son ligeros en comparación, pero el repo pesa 69.8 GB (probablemente incluye checkpoints de entrenamiento o múltiples versiones).
- GPU recomendadas: NVIDIA A100 (40/80 GB), RTX 4090 (24 GB), o GPUs con al menos 16 GB para cuantización 8-bit.
- En consumer GPUs (RTX 3090/4090) es viable con cuantización, aunque no se proporcionan configuraciones oficiales.
- Opciones de despliegue: la librería `talkie_cpt` (código de entrenamiento/inferencia en GitHub), y potencialmente vLLM, llama.cpp u Ollama si se convierten los pesos, pero no está documentado.
- No se reportan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Corpus | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| talkie-1930-13b-base | 13B | 260B tokens pre-1931 | No disponible | No disponible | HuggingFace |
| talkie-1930-13b-it | 13B | Base + instrucciones pre-1931 | No disponible | No disponible | HuggingFace |
| cds-jb/talkie-1930-13b-timetravel | 13B + LoRA | Base + conocimiento post-1930 | No disponible | No disponible | HuggingFace |

La comparativa con modelos modernos de 13B (p. ej., Llama-2-13B) no es significativa porque el corpus de entrenamiento es radicalmente distinto (solo texto pre-1931). La familia talkie es la única comparable, y este proyecto se distingue por añadir conocimiento anacrónico mediante adaptadores.

## Limitaciones y advertencias

- El conocimiento del mundo moderno es exclusivamente el que los adaptadores inyectan; el base solo conoce hasta 1930, por lo que cualquier hecho posterior puede estar incompleto o distorsionado.
- La transposición de hechos modernos al registro de época es un comportamiento de cola (seleccionado y curado), no la salida típica. La mayoría de las generaciones son o bien completados históricos normales o rupturas de registro.
- El adaptador v2 tiene la transposición como categoría entrenada (su corpus incluye documentos en voz de época con hechos modernos), por lo que su tasa del 11% no es emergente. Los adaptadores tv3 son el contraste "puro" con transposición emergente (~1-3%).
- Pueden producirse "mashups" o composiciones factualmente incorrectas (p. ej., atribuir eventos modernos a instituciones o personas de la época).
- El corpus base pre-1931 contiene sesgos históricos (sexismo, racismo, colonialismo) que pueden reflejarse en las generaciones.
- No se especifica licencia, lo que genera incertidumbre para uso comercial o redistribución.
- No hay documentación sobre seguridad, alineación o mitigación de contenido dañino.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cds-jb/talkie-1930-13b-timetravel
- Modelo base: https://huggingface.co/talkie-lm/talkie-1930-13b-base
- Modelo instruccional: https://huggingface.co/talkie-lm/talkie-1930-13b-it
- Web del proyecto talkie: https://talkie-lm.com/introducing-talkie
- Repositorio GitHub: https://github.com/talkie-lm/talkie
- Demo "Talk to the Past": https://talktothepast.com/talkie-1930
- Demo alternativa: https://talkie1930.click/
