# ba-research/Qev1.0-Qwen3.5-0.8B

## Resumen

Qev1.0-Qwen3.5-0.8B es un adaptador LoRA experimental publicado por ba-research que convierte el modelo base Qwen/Qwen3.5-0.8B en un "modelo de decisión" (decision-model) capaz de puntuar respuestas candidatas a preguntas de tipo Choice, Noul y Score. No es un modelo de chat autónomo: el repositorio contiene únicamente el adaptador LoRA (rank 8), una cabeza de decisión aprendida separada (`head.pt`) y metadatos de calibración (`temperature.json`), y requiere el modelo base completo más la implementación Open-Jev para funcionar.

El modelo aborda el problema del enrutamiento y la evaluación estructurada de decisiones: en lugar de generar texto libre, asigna puntuaciones a opciones candidatas, lo que resulta útil para sistemas de selección, control de calidad o clasificación de respuestas. Su relevancia es fundamentalmente investigadora: el autor declara explícitamente que el panel de desarrollo es provisional, no está congelado y que no se ha establecido la generalización independiente ni la paridad con otros modelos de decisión.

El checkpoint (hybrid-v2) se entrenó sobre 1.000 decisiones seleccionadas con 250 pasos de optimización y una partición de calibración de 128 filas. Con 0,8 mil millones de parámetros en el modelo base, es un artefacto ligero pensado para experimentación, no para producción consecuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-0.8B) + adaptador LoRA rank 8 + cabeza de decisión aprendida separada |
| Parametros totales | No disponible (modelo base de 0,8B; el adaptador LoRA y la cabeza añaden parámetros no cuantificados en la información) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible para el adaptador (el modelo base Qwen figura como Apache-2.0; el dataset HelpSteer2 como CC-BY-4.0; Open-Jev como MIT) |
| Formato de pesos | safetensors (adaptador LoRA), `head.pt` (cabeza de decisión), `temperature.json`, `model.json` |

## Arquitectura y entrenamiento

El sistema se compone de tres piezas: el modelo base Qwen3.5-0.8B (transformer denso de 0,8B parámetros), un adaptador LoRA de rango 8 que ajusta el modelo base a la tarea de decisión, y una cabeza de decisión aprendida independiente que produce las puntuaciones. La carga se realiza mediante `DecisionModel.load` de Open-Jev, que ensambla base, adaptador y cabeza; la temperatura de calibración de `temperature.json` no se aplica automáticamente y debe gestionarla el código de evaluación.

El entrenamiento del checkpoint hybrid-v2 utilizó 1.000 decisiones seleccionadas (400 Choice, 300 Noul, 300 Score) durante 250 pasos de optimización, con una partición de calibración separada de 128 filas. La mezcla incluye 100 ejemplos Choice de CommonsenseQA, 100 controles Choice de Banking77, 150 ejemplos Noul de Measuring Hate Speech y 150 ejemplos Score de HelpSteer2, más controles derivados de Open-Jev. La revisión del modelo base es `2fc06364715b967f1860aea9cf38778875588b17` y el hash SHA-256 de la entrada de entrenamiento es `a7f4c474442e8f577765630649e893324cd09257420c3a3b11f6c98d28939c25`. El autor advierte que la selección no ha sido adjudicada ni congelada de forma independiente.

## Capacidades

- Puntuación de respuestas candidatas a preguntas de tipo Choice (selección entre opciones).
- Puntuación de preguntas de tipo Noul (evaluación de contenido, p. ej. discurso de odio).
- Puntuación de preguntas de tipo Score (valoración numérica, p. ej. calidad de respuestas).
- Producción de logits de decisión (no calibrados por defecto) que pueden transformarse mediante la temperatura de calibración.
- Integración como componente de enrutamiento o selección dentro de pipelines más amplios.
- No es un modelo de chat: no genera texto conversacional de forma autónoma.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible.

## Casos de uso

- Enrutamiento de consultas en sistemas multi-modelo: el modelo puntúa qué candidato de respuesta o qué ruta conviene elegir, integrándose en un router que delega la generación final a otro modelo.
- Evaluación automática de calidad de respuestas: mediante preguntas de tipo Score, puede asignar puntuaciones a salidas generadas por otros sistemas para filtrar respuestas de baja calidad en pipelines de datos.
- Moderación de contenido: las preguntas de tipo Noul permiten evaluar si un texto cumple criterios (p. ej. discurso de odio), usando los ejemplos de Measuring Hate Speech del entrenamiento como referencia.
- Clasificación de intenciones en atención al cliente: con controles Choice derivados de Banking77, puede seleccionar la categoría o acción adecuada ante una consulta bancaria estructurada.
- Selección de respuestas en sistemas de preguntas y respuestas: dado un conjunto de respuestas candidatas a una pregunta de sentido común (estilo CommonsenseQA), el modelo elige la más plausible.
- Investigación en calibración de modelos de decisión: el checkpoint y sus metadatos permiten estudiar la fiabilidad de las puntuaciones y comparar con otros modelos de decisión sobre OpenDecisions.
- Control de calidad en anotación de datos: puntuar decisiones de anotadores o de modelos auxiliares antes de incorporarlas a un conjunto de entrenamiento.

## Benchmarks y rendimiento

Evaluación sobre el conjunto de validación OpenDecisions de 2.352 ítems usado durante el desarrollo (resultados de desarrollo, no un test independiente):

| Metrica | Resultado |
|---|---|
| Capability score | 46,85 |
| Precisión Choice | 46,94% |
| Precisión Noul | 62,29% |
| Precisión Score | 32,31% |

El autor advierte que estos resultados pueden verse afectados por limitaciones de selección de modelo y solapamiento de datos, y que no constituyen una prueba independiente.

## Requisitos de hardware

- El modelo base es de 0,8B parámetros, por lo que la inferencia en precisión completa (fp16) requiere aproximadamente 1,6 GB de VRAM solo para los pesos, más el adaptador y la cabeza.
- Cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 y similares; también es viable en CPU, como demuestra la comprobación de carga local en CPU realizada por el autor.
- El autor verificó una inferencia local en CPU sobre una pregunta sintética de sí/no, con logits no calibrados `[0.0, 3.0455]`; esto valida una ruta de ejecución, no la calidad ni la calibración.
- Opciones de despliegue: el cargador oficial es Open-Jev (commit `bd4118882f733574a3250a4b65fe4d884130c08b`), con instalación vía `pip install -e '.[train]'`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos de decisión comparables ni resultados de paridad con alternativas; el propio autor indica que la paridad con otros modelos de decisión no se ha establecido.

## Limitaciones y advertencias

- El panel de desarrollo es provisional y no está congelado; los resultados de evaluación no son un test independiente.
- No se ha establecido la generalización independiente ni la calibración fiable entre dominios.
- No se ha demostrado el ahorro de costes ni la paridad con otros modelos de decisión.
- Las salidas pueden ser incorrectas; una puntuación no debe interpretarse como garantía.
- El modelo no es un chat autónomo: requiere el modelo base y la implementación Open-Jev.
- `DecisionModel.load` no aplica `temperature.json` automáticamente; la calibración debe gestionarse en el código de evaluación.
- La licencia del adaptador no está establecida; aunque el modelo base figura como Apache-2.0 y algunos datasets como CC-BY-4.0 o MIT, el autor advierte que estos hechos no determinan la licencia del adaptador ni todos los permisos de los datos de entrenamiento.
- Los orígenes individuales de los prompts seleccionados no se han resuelto.
- La comprobación de carga en CPU se realizó con una copia local del modelo base; no se verificaron la descarga limpia desde el Hub, los hashes de los ficheros base, la instalación en entorno limpio ni la calidad de inferencia.
- Antes de usar el modelo en un router o flujo consecuente, debe probarse en tareas representativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ba-research/Qev1.0-Qwen3.5-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Implementación Open-Jev: https://github.com/Zefan-Cai/Open-Jev
- Dataset OpenDecisions: https://huggingface.co/datasets/jgeuter/OpenDecisions
- Dataset HelpSteer2: https://huggingface.co/datasets/nvidia/HelpSteer2
