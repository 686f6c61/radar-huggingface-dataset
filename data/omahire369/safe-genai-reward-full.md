# OmAhire369/safe-genai-reward-full

## Resumen

`safe-genai-reward-full` es un modelo de recompensa basado en el enfoque Bradley-Terry, desarrollado por OmAhire369 como parte de un estudio comparativo entre PPO y DPO para la alineación de seguridad de respuestas de modelos de lenguaje. El modelo se construye sobre `bert-base-uncased` y se entrena con ajuste fino completo (full fine-tuning) sobre un conjunto de preferencias denominado Cultural Kaleidoscope, compuesto por 4000 pares de respuestas. Su función es asignar una puntuación escalar a un par (prompt, respuesta) que refleja la preferencia en términos de seguridad y ausencia de estereotipos dañinos.

Con 109,48 millones de parámetros, es un modelo compacto y ligero, pensado para integrarse en pipelines de evaluación o como señal de recompensa en procesos de RLHF. Su relevancia actual radica en que ofrece una alternativa sencilla y reproducible para medir la seguridad de respuestas generadas por LLMs, aunque su alcance está limitado por la antigüedad de la arquitectura base y por los sesgos inherentes a los datos de preferencia utilizados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only transformer) con cabeza de clasificación de secuencias |
| Parametros totales | 109.483.009 (109,48 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de bert-base-uncased, 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (la base bert-base-uncased está entrenada en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencias basado en la arquitectura BERT, concretamente `bert-base-uncased`, al que se le añade una cabeza de regresión logística para emitir una puntuación de recompensa. Se entrena con el objetivo de Bradley-Terry, que modela la probabilidad de que una respuesta sea preferida sobre otra a partir de sus puntuaciones. El ajuste fino se realiza sobre todos los parámetros del modelo (full fine-tuning), sin usar adaptadores ni técnicas de bajo rango.

El entrenamiento se llevó a cabo con 4000 pares de preferencia del dataset Cultural Kaleidoscope, que contiene ejemplos de respuestas seguras frente a respuestas dañinas o que activan estereotipos. El proceso duró 336,67 segundos y alcanzó un pico de uso de memoria GPU de 5124,1 MB. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores; el modelo es únicamente un reward model.

## Capacidades

- Clasificación de pares prompt-respuesta: devuelve una puntuación escalar que indica la preferencia de una respuesta sobre otra en términos de seguridad.
- Detección de contenido dañino o estereotipado: entrenado para penalizar respuestas que puedan resultar ofensivas o peligrosas.
- Integración como señal de recompensa en pipelines de RLHF o PPO.
- Evaluación offline de respuestas generadas por LLMs.
- No es generativo: no produce texto, solo puntúa.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; la base está entrenada principalmente en inglés.

## Casos de uso

- Evaluación de seguridad en pipelines de RLHF: el modelo puede usarse como reward model para guiar el ajuste de políticas de un LLM, puntuando respuestas candidatas y seleccionando las más seguras.
- Filtrado de respuestas en sistemas de moderación: dado un prompt y una respuesta generada, el modelo asigna una puntuación que permite descartar respuestas con bajo nivel de seguridad antes de mostrarlas al usuario.
- Comparación de respuestas en entornos de investigación: permite ordenar un conjunto de respuestas generadas por distintos modelos según su alineación con criterios de seguridad, facilitando análisis comparativos.
- Detección de sesgos estereotipados: al estar entrenado con datos de Cultural Kaleidoscope, puede identificar respuestas que refuercen estereotipos dañinos, útil para auditar sistemas de IA.
- Entrenamiento de clasificadores de seguridad: sus puntuaciones pueden servir como pseudoetiquetas para entrenar modelos más ligeros o específicos.
- Benchmarking de alineación: en estudios académicos, sirve como métrica objetiva para medir la mejora de seguridad tras aplicar técnicas de alineación.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el conjunto de test:

| Metrica | Valor |
|---|---|
| Preference accuracy (test) | 0,9983 |
| Bradley-Terry NLL (test) | 0,0103 |
| Mean reward margin | 10,6152 |

No se han publicado comparaciones con otros reward models ni resultados en benchmarks estandarizados como RewardBench. Los datos presentados son exclusivos de este modelo y no permiten una comparación directa con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Dado el tamaño de 109 M parámetros, en FP32 los pesos ocupan aproximadamente 438 MB, y en FP16 unos 219 MB, por lo que es viable en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluyendo RTX 3060, RTX 4090 o incluso CPU para inferencia puntual.
- Compatibilidad con consumer GPU: sí, es un modelo muy ligero.
- Opciones de despliegue: compatible con la librería `transformers` de Hugging Face, así como con `text-embeddings-inference` (según los tags del repositorio). También puede ejecutarse con ONNX o TensorRT si se convierte.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, la inferencia es del orden de milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen otros reward models basados en BERT o en arquitecturas más grandes (p. ej., RewardBench, modelos de la familia DeBERTa), pero no se han encontrado datos de comparación directa con este modelo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo base `bert-base-uncased` es pequeño y desactualizado; no tiene instrucciones de ajuste y su capacidad de comprensión semántica es limitada en comparación con modelos modernos.
- La alineación lograda afecta al estilo y a la seguridad de las respuestas, pero no garantiza veracidad ni calidad general; no es apto para producción como clasificador de seguridad genérico.
- Los sesgos de anotación del dataset Cultural Kaleidoscope se heredan en el modelo, por lo que sus puntuaciones pueden reflejar preferencias subjetivas o culturalmente específicas.
- No se especifican los idiomas soportados; la base está entrenada principalmente en inglés, por lo que su uso en otros idiomas puede degradar el rendimiento.
- La licencia MIT permite uso comercial, pero el autor advierte que no debe tratarse como un clasificador de seguridad definitivo.
- No se han publicado análisis de robustez frente a ataques adversarios ni evaluaciones de sesgo más allá de los datos de entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OmAhire369/safe-genai-reward-full
- Repositorio relacionado (reward-model-safe-ai): https://huggingface.co/OmAhire369/reward-model-safe-ai
- Perfil de GitHub del autor: https://github.com/Omahire369
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
