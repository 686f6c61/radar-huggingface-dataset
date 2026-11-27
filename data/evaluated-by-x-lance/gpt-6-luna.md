# Evaluated-by-X-LANCE/gpt-6-luna

## Resumen

GPT-6 Luna es un modelo de lenguaje cerrado desarrollado por OpenAI (la información disponible no lo confirma explícitamente, pero el nombre y el contexto lo sugieren). No dispone de repositorio público de pesos ni de model card técnica oficial. El repositorio de Hugging Face analizado, `Evaluated-by-X-LANCE/gpt-6-luna`, no contiene el modelo: es únicamente una tarjeta de seguimiento de resultados de evaluación creada por el equipo X-LANCE para alojar las puntuaciones obtenidas en su benchmark SynthDCB, ya que no existe un repositorio oficial donde publicarlas.

La relevancia de este repositorio es, por tanto, documental y de evaluación, no técnica. Aporta un dato concreto: GPT-6 Luna obtiene un **54,791667 de Pass@1 global** (media de tres intentos por tarea) en el conjunto de evaluación `eval_20261115` del benchmark SynthDCB. No se publican en la información disponible detalles de arquitectura, tamaño, contexto, tokenizador ni proceso de entrenamiento.

Cualquier ficha técnica al uso (parámetros, cuantizaciones, licencia, idiomas) no puede completarse con los datos accesibles. Esta ficha refleja esa limitación de forma explícita y se centra en lo que sí está documentado: el resultado del benchmark y la naturaleza del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (modelo cerrado, sin pesos publicados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no contiene pesos) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura de GPT-6 Luna en los materiales disponibles. El repositorio de Hugging Face es una tarjeta de resultados (results card) y no incluye pesos, configuración, tokenizador ni documentación de entrenamiento. No hay datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF, DPO u otras técnicas de alineamiento.

La única información técnica asociada es de evaluación: los resultados corresponden al conjunto `eval_20261115` del benchmark SynthDCB, con tres intentos por tarea y agregación mediante media del Pass@1. Los resultados a nivel de tarea y la configuración de la evaluación se almacenan en el directorio `.eval_results/` del propio repositorio.

## Capacidades

- No se documentan capacidades específicas en la información disponible.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirma capacidad multilingüe ni lista de idiomas.
- No se confirma soporte de visión, audio ni modo de razonamiento explícito (thinking mode).
- El único dato verificable es su rendimiento en el benchmark SynthDCB (ver sección de benchmarks).

## Casos de uso

- Evaluación comparativa de modelos cerrados: el repositorio sirve como punto de referencia para contrastar el Pass@1 de GPT-6 Luna en SynthDCB frente a otros modelos evaluados en el mismo benchmark.
- Seguimiento de la evolución del modelo: al estar fechado el conjunto de evaluación (`eval_20261115`), permite trazar resultados entre versiones o ejecuciones futuras.
- Reproducibilidad de evaluaciones: el directorio `.eval_results/` facilita auditar la configuración y los resultados por tarea, útil para investigadores que quieran replicar el protocolo.
- Integración en leaderboards de terceros: el equipo X-LANCE puede enlazar este repositorio desde su página de leaderboard para respaldar las puntuaciones publicadas.
- Documentación de referencia para pipelines de evaluación: sirve como ejemplo de cómo alojar resultados de un modelo sin repositorio público de pesos.
- Análisis de tareas concretas: los resultados por tarea permiten identificar en qué tipos de problema rinde mejor o peor el modelo, siempre que se consulte el directorio de resultados.

No se pueden proponer casos de uso de producción (atención al cliente, generación de código, etc.) porque no hay información sobre las capacidades reales del modelo.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Notas |
|---|---|---|---|
| SynthDCB (`eval_20261115`) | Pass@1 global | 54,791667 | Media de 3 intentos por tarea |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar, ni comparativas numéricas con modelos similares.

## Requisitos de hardware

- No disponible: al tratarse de un modelo cerrado sin pesos publicados, no se puede estimar VRAM ni throughput de inferencia local.
- No se puede confirmar si cabe en GPU de consumo (RTX 4090, etc.).
- No se documentan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) porque no hay artefactos de pesos.
- El acceso, en su caso, sería a través de la API del proveedor, cuyas condiciones no se detallan en la información disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos evaluados en SynthDCB ni especificaciones de GPT-6 Luna que permitan una comparación técnica (parámetros, contexto, licencia). La página del leaderboard de SynthDCB (`https://x-lance.github.io/SynthDCB/#leaderboard`) es el único recurso citado donde podría consultarse una comparación, pero su contenido no forma parte de los datos disponibles.

## Limitaciones y advertencias

- El repositorio no contiene el modelo: es una tarjeta de resultados. No debe tratarse como una fuente de pesos ni de documentación técnica.
- El resultado de 54,791667 Pass@1 corresponde exclusivamente al benchmark SynthDCB y al conjunto `eval_20261115`; no es extrapolable a otras tareas.
- La media de tres intentos por tarea reduce la varianza, pero sigue siendo una muestra limitada; no se publica intervalo de confianza ni desviación.
- No hay información sobre sesgos, riesgo de alucinación ni comportamiento en idiomas distintos del evaluado.
- No se conoce la licencia ni las restricciones de uso comercial del modelo cerrado.
- El nombre del repositorio (`Evaluated-by-X-LANCE`) indica que la evaluación la realiza un tercero, no el desarrollador del modelo; conviene verificar la metodología en el informe del proyecto.
- La fecha de creación (2026-11-27) y el identificador `eval_20261115` sitúan los resultados en un contexto temporal que debe tenerse en cuenta al compararlos con evaluaciones posteriores.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Evaluated-by-X-LANCE/gpt-6-luna
- Dataset del benchmark SynthDCB: https://huggingface.co/datasets/X-LANCE/SynthDCB
- Página del proyecto y leaderboard SynthDCB: https://x-lance.github.io/SynthDCB/#leaderboard
