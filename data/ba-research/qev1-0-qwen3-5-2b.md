# ba-research/Qev1.0-Qwen3.5-2B

## Resumen

Qev1.0-Qwen3.5-2B es un adaptador LoRA experimental publicado por ba-research sobre el modelo base Qwen/Qwen3.5-2B. No se trata de un modelo conversacional al uso, sino de un modelo de decisión que puntúa respuestas candidatas a preguntas de tipo Choice (elección entre opciones), Noul (juicio binario o de nulidad) y Score (puntuación numérica). El repositorio contiene únicamente el adaptador LoRA, una cabeza de decisión aprendida independiente y metadatos de calibración; para funcionar requiere el modelo base y la implementación Open-Jev del modelo de decisión.

El interés del checkpoint es acotado y muy específico: sirve como artefacto de investigación para evaluar decisiones estructuradas y enrutamiento basado en puntuaciones. El propio autor advierte que no es un modelo de chat autónomo y que el panel de desarrollo es provisional y no está congelado. La relevancia actual es, por tanto, la de un experimento reproducible más que la de un componente listo para producción.

El tamaño efectivo corresponde al del modelo base de 2B parámetros, con un adaptador de rango 8 entrenado durante 250 pasos sobre 1.000 decisiones seleccionadas. No se han publicado especificaciones completas de contexto, idiomas ni licencia del adaptador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (rank 8) sobre transformer Qwen3.5-2B, con cabeza de decisión aprendida separada |
| Parámetros totales | 2B (modelo base); parámetros del adaptador no disponibles |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; cuantizaciones del base no especificadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible para el adaptador; el modelo base Qwen lista Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors), head.pt, temperature.json, model.json, SHA256SUMS.json |

## Arquitectura y entrenamiento

El checkpoint es un adaptador LoRA de rango 8 acoplado a Qwen3.5-2B, acompañado de una cabeza de decisión aprendida de 128 filas para calibración y de un fichero de temperatura de calibración aplicado de forma separada por el código de evaluación. La arquitectura subyacente es la del transformer del modelo base; el adaptador modifica los pesos para la tarea de puntuación de decisiones, no para generación libre.

El entrenamiento usó 1.000 decisiones seleccionadas (400 Choice, 300 Noul, 300 Score), 250 pasos de optimizador y una partición de calibración separada de 128 filas. La mezcla incluye 100 ejemplos Choice de CommonsenseQA, 100 controles Choice de Banking77, 150 ejemplos Noul de Measuring Hate Speech y 150 ejemplos Score de HelpSteer2, más controles derivados de Open-Jev. La revisión del base es `15852e8c16360a2fea060d615a32b45270f8a8fc` y el SHA-256 de la entrada de entrenamiento es `a7f4c474442e8f577765630649e893324cd09257420c3a3b11f6c98d28939c25`. No se documenta RLHF, DPO ni innovaciones de decodificación.

## Capacidades

- Puntuación de respuestas candidatas en tres formatos: Choice (selección entre opciones), Noul (juicio binario o de nulidad) y Score (puntuación numérica).
- Enrutamiento y decisión estructurada basada en logits calibrados mediante temperatura.
- Integración con la implementación Open-Jev (`DecisionModel.load`) para cargar base, adaptador y cabeza.
- No es un modelo de chat: no genera texto libre de forma autónoma.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en modelos de decisión: evaluar cómo un adaptador LoRA de bajo rango modifica el comportamiento de puntuación de un base de 2B sobre tareas Choice/Noul/Score, comparando con el base sin adaptar.
- Enrutamiento de consultas en pipelines de investigación: usar las puntuaciones para decidir si una respuesta candidata es aceptable antes de pasarla a un modelo mayor, siempre con validación previa en tareas representativas.
- Experimentos de calibración: estudiar el efecto de `temperature.json` y de la cabeza de 128 filas sobre la fiabilidad de las puntuaciones en distintos dominios.
- Evaluación de sesgos en juicios binarios: emplear los ejemplos Noul derivados de Measuring Hate Speech para analizar el comportamiento del modelo ante contenido sensible en contexto de investigación.
- Reproducción de experimentos: reconstruir el pipeline de entrenamiento con la revisión fijada de Open-Jev y los hashes SHA-256 publicados para verificar la procedencia del checkpoint.
- Prototipado de selectores de respuesta: integrar el modelo como componente de scoring en un sistema mayor que combine varios modelos y requiera una señal barata de aceptación o rechazo.

## Benchmarks y rendimiento

Resultados en el conjunto de validación OpenDecisions de 2.352 ítems usado durante el desarrollo (no es un test independiente):

| Métrica | Valor |
|---|---|
| Capability score | 55,23 |
| Accuracy Choice | 54,67% |
| Accuracy Noul | 72,01% |
| Accuracy Score | 46,43% |

No se han publicado comparaciones con modelos similares en la información disponible. El autor advierte que los resultados pueden estar afectados por limitaciones de selección de modelo y solapamiento de datos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamaño del base (2B) se sitúa en el rango de pocos GB en cuantización de 8 o 4 bits, aunque no se documenta.
- GPU recomendadas: no disponibles; el autor solo reporta una comprobación de carga en CPU.
- Cabe en GPU de consumo: previsiblemente sí por el tamaño del base, pero no verificado ni documentado.
- Despliegue: el loader oficial es Open-Jev (commit `bd4118882f733574a3250a4b65fe4d884130c08b`), instalado con `pip install -e '.[train]'`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La única observación publicada es un smoke test en CPU con logits no calibrados aproximadamente `[0.0, 1.5870]` sobre una pregunta sintética.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de decisión con adaptador LoRA sobre base de 2B) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- No es un modelo de chat ni un modelo autónomo: requiere el base Qwen3.5-2B y la implementación Open-Jev.
- El panel de desarrollo es provisional y no está congelado; la generalización independiente y la calibración fiable entre dominios no están establecidas.
- Los resultados de evaluación son de desarrollo, no de un test independiente, y pueden estar contaminados por solapamiento de datos.
- Las puntuaciones pueden ser erróneas; no deben tratarse como garantía en flujos consecuentes.
- La licencia del adaptador no está establecida; el base lista Apache-2.0, HelpSteer2 lista CC-BY-4.0, pero los orígenes individuales de los prompts no están resueltos.
- La carga limpia desde el Hub, los hashes de los ficheros del base y la calidad de inferencia no fueron verificados por la comprobación de carga reportada.
- Riesgo de sesgo en los ejemplos Noul derivados de Measuring Hate Speech y en los controles de Banking77.
- Sin datos publicados sobre idiomas, contexto máximo ni cuantizaciones soportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ba-research/Qev1.0-Qwen3.5-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Implementación Open-Jev: https://github.com/Zefan-Cai/Open-Jev
- Dataset OpenDecisions: https://huggingface.co/datasets/jgeuter/OpenDecisions
- Dataset HelpSteer2: https://huggingface.co/datasets/nvidia/HelpSteer2
