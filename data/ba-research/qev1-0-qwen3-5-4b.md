# ba-research/Qev1.0-Qwen3.5-4B

## Resumen

Qev1.0-Qwen3.5-4B es un adaptador LoRA experimental publicado por ba-research que convierte el modelo base Qwen/Qwen3.5-4B en un denominado "modelo de decisión". No es un modelo conversacional: su función es puntuar respuestas candidatas en tres tipos de tareas estructuradas (Choice, Noul y Score), es decir, elegir entre opciones, emitir un juicio binario tipo sí/no y asignar una puntuación. El repositorio contiene únicamente el adaptador (rank 8), una cabeza de decisión aprendida separada (`head.pt`), metadatos de calibración (`temperature.json`) y ficheros de configuración y hashes.

El modelo requiere cargar el base Qwen3.5-4B junto con la implementación Open-Jev del modelo de decisión; no funciona de forma autónoma con `transformers` ni con un pipeline estándar. Está pensado exclusivamente para investigación y evaluación de decisiones estructuradas, y el propio autor advierte que el panel de desarrollo es provisional, que la calibración entre dominios no está establecida y que los resultados publicados proceden del conjunto de validación usado durante el desarrollo, no de un test independiente.

Por su naturaleza (adaptador pequeño, dependencia de código externo, cero descargas y ausencia de licencia declarada), se trata de un artefacto de investigación temprana más que de un componente listo para producción. Su interés radica en explorar el uso de modelos pequeños (4B) como enrutadores o evaluadores de respuestas dentro de sistemas mayores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B) con adaptador LoRA rank 8 y cabeza de decisión separada |
| Parámetros totales | No disponible (el adaptador LoRA y la cabeza son adicionales al base de 4B; el número exacto no se especifica) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el base Qwen figura como Apache-2.0; HelpSteer2 como CC-BY-4.0; la licencia del adaptador no se establece) |
| Formato de pesos | safetensors (adaptador LoRA) y `head.pt` (cabeza de decisión) |

## Arquitectura y entrenamiento

El checkpoint, denominado "hybrid-v2", se construye sobre Qwen3.5-4B mediante un adaptador LoRA de rango 8 y una cabeza de decisión aprendida independiente de 128 filas para calibración. El entrenamiento utilizó 1.000 decisiones seleccionadas (400 de tipo Choice, 300 Noul y 300 Score) durante 250 pasos de optimizador, con una partición de calibración separada de 128 filas. La revisión del modelo base es `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`, y el hash SHA-256 de la entrada de entrenamiento es `a7f4c474442e8f577765630649e893324cd09257420c3a3b11f6c98d28939c25`.

La mezcla de datos incluye 100 ejemplos Choice de CommonsenseQA, 100 controles Choice de Banking77, 150 ejemplos Noul de Measuring Hate Speech, 150 ejemplos Score de HelpSteer2 y el resto controles derivados de Open-Jev. El autor indica explícitamente que la selección no está adjudicada ni congelada de forma independiente, y que los orígenes individuales de los prompts no se han resuelto. La calibración se aplica por separado mediante `temperature.json`, que el cargador `DecisionModel.load` no aplica automáticamente.

## Capacidades

- Puntuación de respuestas candidatas en tareas de elección múltiple (Choice).
- Juicio binario tipo sí/no (Noul).
- Asignación de puntuaciones numéricas calibradas (Score).
- Integración como componente de enrutamiento o evaluación dentro de pipelines de decisión.
- Carga mediante la implementación Open-Jev (`DecisionModel.load`), que combina base, adaptador y cabeza.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre como modelo conversacional.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Enrutamiento de consultas en sistemas multiagente: el modelo puede puntuar qué ruta o herramienta es más adecuada para una consulta dada, actuando como clasificador de decisión previo a la ejecución. Requiere validación sobre el dominio objetivo antes de usarse en producción.
- Evaluación automática de respuestas en pipelines de anotación: uso de la tarea Score para asignar puntuaciones numéricas a respuestas generadas por otros modelos, con calibración aplicada manualmente.
- Filtrado de contenido sensible: la tarea Noul (juicio binario) puede emplearse como señal preliminar en la revisión de textos, por ejemplo en conjuntos derivados de Measuring Hate Speech, siempre con supervisión humana.
- Investigación en calibración de modelos de decisión: el checkpoint sirve como punto de partida para estudiar la fiabilidad de puntuaciones en modelos pequeños de 4B y comparar con otras implementaciones de Open-Jev.
- Control de calidad en datasets: uso de Choice para verificar coherencia entre pares pregunta-respuesta en conjuntos como CommonsenseQA o Banking77 durante la curación de datos.
- Experimentación académica con LoRA y cabezas de decisión: reproducción del entrenamiento (250 pasos, rank 8) para analizar el efecto de la mezcla de datos y la calibración en tareas estructuradas.
- Prototipado de routers de bajo coste: al partir de un base de 4B, puede desplegarse en hardware modesto para pruebas de concepto, aunque la latencia y el throughput no están documentados.

## Benchmarks y rendimiento

Resultados sobre el conjunto de validación OpenDecisions de 2.352 ítems (resultados de desarrollo, no test independiente):

| Métrica | Valor |
|---|---|
| Capability score | 65,98 |
| Choice accuracy | 68,25% |
| Noul accuracy | 77,30% |
| Score accuracy | 56,46% |

No se han publicado comparaciones con otros modelos de decisión en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un base de 4B más un adaptador LoRA y una cabeza pequeña, la inferencia requiere cargar el modelo base completo (aproximadamente 8 GB en fp16, estimación orientativa no confirmada por el autor).
- GPU recomendadas: no disponibles; el autor solo documenta una comprobación de carga en CPU.
- Compatibilidad con GPU de consumo: probable en GPUs con 8-16 GB de VRAM para el base en fp16 o cuantizado, aunque no verificado.
- Opciones de despliegue: únicamente mediante la implementación Open-Jev (commit `bd4118882f733574a3250a4b65fe4d884130c08b`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El único dato empírico es un smoke test en CPU con logits no calibrados aproximadamente `[0.0, 1.8188]` para una pregunta sintética sí/no.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de decisión ni con alternativas de la misma categoría. Como referencia estructural, el propio autor menciona la implementación Open-Jev y el dataset OpenDecisions, pero no ofrece datos comparativos de rendimiento frente a otros checkpoints.

## Limitaciones y advertencias

- No es un modelo conversacional autónomo: requiere el base Qwen3.5-4B y la implementación Open-Jev para funcionar.
- Los resultados publicados son de desarrollo y no de un test independiente; pueden estar afectados por selección de modelo y solapamiento de datos.
- El panel de desarrollo es provisional y no está congelado.
- La generalización independiente y la calibración fiable entre dominios no están establecidas.
- El ahorro de costes y la paridad con otros modelos de decisión no se han demostrado.
- Las puntuaciones pueden ser erróneas; no deben tratarse como garantía.
- Licencia del adaptador no declarada; los orígenes individuales de los prompts de entrenamiento no se han resuelto, lo que genera incertidumbre sobre permisos de uso comercial.
- La calibración (`temperature.json`) no se aplica automáticamente por el cargador; debe gestionarse en el código de evaluación.
- No se ha verificado una descarga limpia desde el Hub, los hashes de los ficheros base ni la calidad de inferencia en un entorno limpio.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ba-research/Qev1.0-Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Implementación Open-Jev: https://github.com/Zefan-Cai/Open-Jev
- Dataset OpenDecisions: https://huggingface.co/datasets/jgeuter/OpenDecisions
- Dataset HelpSteer2: https://huggingface.co/datasets/nvidia/HelpSteer2
