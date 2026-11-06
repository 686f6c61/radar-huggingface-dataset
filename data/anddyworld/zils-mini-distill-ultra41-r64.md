# anddyworld/zils-mini-distill-ultra41-r64

## Resumen

Zils-mini-distill-ultra41-r64 es un modelo de decisión derivado de zils-ai/d3-mini-4.5b-v1, publicado por el usuario anddyworld bajo licencia Apache 2.0. No se trata de un modelo conversacional al uso, sino de un "cuerpo" (body) de decisión pensado para integrarse en el pool de modelos d3-mini del subnet Zils. Su función es emitir probabilidades sobre opciones de decisión, no generar texto libre: el modelo base es un mirror de vllm-sr/d3-mini, y este derivado se obtiene por destilación desde el modelo mayor vllm-sr/d3-ultra.

La arquitectura subyacente es la del modelo padre, con pesos de lenguaje bajo el prefijo `language_model.*` y una torre de visión heredada sin modificar. Cuenta con 4.539.265.536 parámetros totales (aproximadamente 4,5 mil millones) y un repositorio de 9,1 GB en formato safetensors. La ficha técnica no documenta la longitud de contexto ni los idiomas soportados.

El interés de este modelo es acotado pero específico: sirve como componente de inferencia de bajo coste para tareas de clasificación y decisión dentro del ecosistema Zils, con un entrenamiento de destilación sobre 41 000 prompts públicos. Requiere un "chassis" d3-mini fijado (con su capa de respuesta y runtime) para funcionar, ya que no incorpora capa de respuesta propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (heredada de zils-ai/d3-mini-4.5b-v1; pesos de lenguaje y torre de visión) |
| Parámetros totales | 4 539 265 536 (~4,5 B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de zils-ai/d3-mini-4.5b-v1, un mirror de vllm-sr/d3-mini con licencia Apache 2.0, que aporta la arquitectura base: un transformer con pesos de lenguaje bajo `language_model.*` y una torre de visión que este derivado conserva sin cambios. Sobre esa base se aplicó un LoRA de rango 64 entrenado por destilación para replicar las probabilidades de opción del modelo mayor vllm-sr/d3-ultra, también Apache 2.0. El conjunto de entrenamiento se construyó con prompts de decisión públicos extraídos de los splits de train de datasets abiertos, con un total de 41 000 prompts según el autor.

Tras el entrenamiento, el adaptador LoRA se fusionó (merged) en los pesos del modelo base, de modo que el resultado es un checkpoint completo en safetensors. No se documentan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. La innovación técnica declarada es la destilación de probabilidades de opción (no de texto generado) desde un modelo de mayor tamaño hacia un cuerpo de 4,5 B, lo que permite reproducir el comportamiento decisional del modelo grande con un coste de inferencia menor.

## Capacidades

- Emisión de probabilidades sobre opciones de decisión: el modelo está diseñado para producir distribuciones de probabilidad sobre un conjunto de opciones, no para generar texto libre.
- Destilación de comportamiento: aproxima las probabilidades de opción del modelo mayor vllm-sr/d3-ultra en prompts de decisión.
- Procesamiento multimodal: conserva la torre de visión del modelo padre, aunque no se documentan las tareas visuales concretas soportadas.
- Integración en el pool d3-mini: funciona como body dentro del subnet Zils, conectado al chassis d3-mini con su capa de respuesta y runtime.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Clasificación de decisiones en pipelines del subnet Zils: el modelo se usaría como body conectado al chassis d3-mini para emitir probabilidades de opción en tareas de decisión definidas por el pool, aprovechando la destilación desde d3-ultra para reducir coste de inferencia.
- Enrutamiento de consultas: dado un prompt y un conjunto de opciones de destino, el modelo devuelve la probabilidad de cada opción, lo que permite construir un router de bajo coste sobre un modelo de 4,5 B.
- Moderación y etiquetado por categorías: con prompts de decisión derivados de datasets abiertos, puede asignar probabilidades a categorías predefinidas en tareas de etiquetado, siempre que se le proporcione la capa de respuesta del chassis.
- Evaluación comparativa de destilación: sirve como referencia para medir cuánto se aproxima un body de 4,5 B a un modelo mayor de la misma familia en probabilidades de opción.
- Prototipado de sistemas de decisión multimodal: al conservar la torre de visión del padre, puede emplearse en experimentos donde la decisión dependa de entrada visual, aunque las capacidades concretas no están documentadas.
- Sustitución de modelos mayores en entornos con restricciones de memoria: con 4,5 B de parámetros y pesos safetensors, es viable en GPUs de gama alta consumer, lo que permite desplegar un comportamiento decisional destilado donde d3-ultra no cabría.
- Reproducción de experimentos de destilación: el checkpoint fusionado y la licencia Apache 2.0 facilitan replicar el pipeline de entrenamiento LoRA r64 sobre 41 000 prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (4,5 B de parámetros), en FP16 serían necesarios aproximadamente 9 GB de pesos, y en cuantizaciones de 8 bits o 4 bits el requisito bajaría sustancialmente; no obstante, el modelo no documenta tipos de cuantización soportados.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs con al menos 16-24 GB de VRAM en precisión completa, y en GPUs consumer de gama alta (por ejemplo, RTX 4090) con cuantización.
- ¿Cabe en GPU consumer? Probable en GPUs consumer de gama alta con cuantización, aunque no hay confirmación oficial ni formatos GGUF publicados.
- Opciones de despliegue: no disponible. El autor indica que debe usarse con el chassis d3-mini fijado (capa de respuesta y runtime propios), lo que condiciona el stack de inferencia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| anddyworld/zils-mini-distill-ultra41-r64 | ~4,5 B | no disponible | Apache 2.0 | safetensors | Body de decisión destilado, requiere chassis d3-mini |
| zils-ai/d3-mini-4.5b-v1 (modelo base) | ~4,5 B | no disponible | Apache 2.0 | no disponible | Mirror de vllm-sr/d3-mini; base del fine-tuning |
| vllm-sr/d3-ultra (modelo profesor) | no disponible | no disponible | Apache 2.0 | no disponible | Modelo mayor de la familia d3; fuente de las probabilidades de opción |

No se dispone de datos de rendimiento comparado (benchmarks) para ninguno de los tres modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo no incorpora capa de respuesta propia: solo funciona con el chassis d3-mini fijado (su capa de respuesta y runtime). Usarlo fuera de ese entorno no producirá resultados válidos.
- No es un modelo generativo de texto: está orientado a emitir probabilidades de opción, por lo que no debe emplearse como asistente conversacional.
- Sesgos conocidos: no documentados. Al entrenarse sobre splits de train de datasets abiertos, puede heredar los sesgos de esas fuentes.
- Riesgo de alucinación: no aplica en el sentido generativo habitual, pero la destilación puede producir probabilidades de opción mal calibradas en dominios alejados de los prompts de entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados, lo que impide garantizar su comportamiento fuera del inglés o de ventanas cortas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero conviene verificar las licencias de los datasets de entrenamiento y del modelo base, así como los términos del subnet Zils para el despliegue en su pool.
- Caveat de producción: con 0 descargas y 0 likes en el momento de la consulta, el modelo carece de validación comunitaria; la fusión del LoRA y la ausencia de benchmarks publicados hacen recomendable una evaluación propia antes de cualquier uso en producción.
- La torre de visión se hereda sin modificar, pero no se documentan las tareas visuales que el modelo puede resolver.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anddyworld/zils-mini-distill-ultra41-r64
- Modelo base: https://huggingface.co/zils-ai/d3-mini-4.5b-v1
- Modelo profesor (d3-ultra): https://huggingface.co/vllm-sr/d3-ultra
- Mirror del modelo base (d3-mini): https://huggingface.co/vllm-sr/d3-mini
