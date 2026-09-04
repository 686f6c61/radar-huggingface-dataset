# espalier-benchmark/espalier-mib-submission

## Resumen

Esta entrada de HuggingFace no contiene un modelo de lenguaje, sino una contribución al benchmark MIB Circuit Localization (edge track) del proyecto Espalier. Se trata de un paquete de circuitos congelados, generados mediante el método "Espalier / Energy + graph", para tres células concretas: `ioi_gpt2`, `ioi_qwen2.5` y `mcqa_qwen2.5`. Cada célula incluye nueve circuitos JSON que corresponden a presupuestos del 0,1 % al 50 % del universo canónico de aristas reales.

El desarrollador es el repositorio `espalier-benchmark`. La finalidad es proporcionar artefactos de referencia para evaluar algoritmos de localización de circuitos (circuit discovery) en modelos de lenguaje. No se dispone de datos sobre arquitectura, número de parámetros, contexto o licencia, ya que la información publicada se limita a la estructura de los circuitos y su procedencia.

La relevancia actual radica en que los circuitos se derivan del estado congelado `evaluation_active` utilizado por el evaluador público de validación, lo que permite comparar resultados de forma reproducible. El commit fuente es `5ca140221f865d899a07ca5451d8b4433a376b8f`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; contiene circuitos para GPT-2 y Qwen2.5) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | JSON (circuitos Graph JSON) |

## Arquitectura y entrenamiento

El paquete no define una arquitectura de modelo propia. Los circuitos se refieren a modelos base ya existentes: GPT-2 y Qwen2.5. Según el README, cada directorio contiene exactamente nueve circuitos JSON, ordenados por prefijos numéricos `01`–`09`, que representan los presupuestos 0,1 %, 0,2 %, 0,5 %, 1 %, 2 %, 5 %, 10 %, 20 % y 50 % del universo de aristas reales canónicas.

No se ha realizado entrenamiento ni ajuste de pesos. Los artefactos se generaron a partir del estado congelado `evaluation_active` del evaluador público de validación. Para GPT-2, los archivos son copias byte-idénticas de sus fuentes Graph JSON congeladas. Para Qwen, los artefactos congelados almacenan listas de IDs de aristas activas exactas, que se convierten al formato Graph JSON actual preservando el conjunto de membresía exacto. No se utilizó información de test privado ni se re-ejecutó la evaluación.

## Capacidades

- Localización de circuitos para la tarea de identificación de objeto indirecto (IOI) en GPT-2.
- Localización de circuitos para la tarea de identificación de objeto indirecto (IOI) en Qwen2.5.
- Localización de circuitos para la tarea de respuesta a preguntas de opción múltiple (MCQA) en Qwen2.5.
- Nueve niveles de presupuesto de aristas, desde el 0,1 % hasta el 50 % del universo canónico.
- Compatibilidad con el evaluador público de validación de MIB Circuit Localization.
- Trazabilidad completa de la procedencia mediante `SUBMISSION_MANIFEST.json` y SHA-256.

## Casos de uso

- Investigación en interpretabilidad: comparar los circuitos descubiertos por el método Espalier con los de otros algoritmos de circuit discovery sobre las mismas tareas y modelos.
- Evaluación de métodos de localización: utilizar estos circuitos como referencia para medir la precisión de nuevas técnicas en el edge track de MIB.
- Estudio de mecanismos de identificación de objeto indirecto: analizar cómo se distribuyen las aristas relevantes para la tarea IOI en GPT-2 y Qwen2.5 a diferentes presupuestos.
- Análisis de robustez: examinar la estabilidad de los circuitos cuando se reduce el presupuesto de aristas del 50 % al 0,1 %.
- Reproducibilidad: verificar los resultados usando el commit fuente y el manifest SHA-256 para garantizar que los artefactos no han sido modificados.
- Desarrollo de métricas: proponer nuevas métricas de evaluación para circuitos basándose en los conjuntos de aristas activas proporcionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica para los artefactos; no especificada para los modelos base.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no es un modelo desplegable como tal).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la información disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje y no puede generar texto ni realizar inferencias.
- La licencia no está especificada, lo que puede limitar el uso comercial o la redistribución.
- Los circuitos están congelados y no se han re-ejecutado ni modificado tras su creación.
- El uso requiere los modelos base GPT-2 y Qwen2.5, cuyas licencias y restricciones deben tenerse en cuenta.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de idioma, al no tratarse de un modelo generativo.
- La fecha de creación es 2026-09-03, lo que puede indicar que forma parte de un benchmark reciente o sintético.

## Enlaces

- HuggingFace: https://huggingface.co/espalier-benchmark/espalier-mib-submission
- No se han encontrado otros enlaces relevantes en la búsqueda web.
