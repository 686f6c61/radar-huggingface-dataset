# anddyworld/zils-mini-distill-ultra-r128

## Resumen

Zils-mini-distill-ultra-r128 es un modelo de decisión (decision model) desarrollado por el usuario anddyworld para el pool d3-mini soup de la subred Zils. Se trata de un ajuste fino por destilación del modelo base zils-ai/d3-mini-4.5b-v1, un espejo de vllm-sr/d3-mini con licencia Apache 2.0. El modelo no genera respuestas de forma autónoma: su función es producir probabilidades sobre opciones de decisión, y debe utilizarse junto con el chasis d3-mini fijado (su capa de respuesta y su runtime), ya que no incorpora capa de respuesta propia.

Técnicamente, el modelo conserva la arquitectura del modelo base de aproximadamente 4.539 millones de parámetros (4,5 mil millones) e incorpora un LoRA de rango 128 entrenado para replicar las probabilidades de opción del modelo de mayor tamaño vllm-sr/d3-ultra sobre prompts de decisión públicos construidos a partir de los splits de entrenamiento de datasets abiertos. Los pesos del adaptador se fusionaron en el modelo final, y los pesos de lenguaje se ubican bajo el prefijo `language_model.*`, mientras que la torre de visión permanece sin cambios respecto al modelo padre.

La relevancia de este modelo es acotada y específica: se publica como componente interno de un pool de decisión dentro de la subred Zils, sin descargas ni interacciones registradas en el momento de la consulta, y sin pipeline declarado. Resulta de interés para quienes trabajen con el ecosistema Zils o quieran estudiar técnicas de destilación de probabilidades de decisión mediante LoRA sobre un modelo multimodal de 4,5 mil millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la del modelo base zils-ai/d3-mini-4.5b-v1); incluye torre de visión sin modificar |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de zils-ai/d3-mini-4.5b-v1, un espejo de vllm-sr/d3-mini con licencia Apache 2.0, y conserva su arquitectura transformer multimodal, incluida una torre de visión que no se modifica durante el ajuste. La innovación principal no reside en la arquitectura, sino en el procedimiento de entrenamiento: se entrenó un LoRA de rango 128 para que las probabilidades de opción del modelo pequeño coincidieran con las del modelo de mayor tamaño vllm-sr/d3-ultra (también Apache 2.0) sobre prompts de decisión públicos. Posteriormente, el adaptador se fusionó en los pesos del modelo, de modo que el resultado es un modelo denso de 4.539 millones de parámetros sin adaptadores separados.

Los datos de entrenamiento consisten en prompts de decisión construidos a partir de los splits de entrenamiento de datasets abiertos, aunque la model card no especifica el número de tokens, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla la función de pérdida concreta empleada para igualar las distribuciones de probabilidad, más allá de la mención a la destilación de probabilidades de opción. Los pesos de lenguaje se organizan bajo el prefijo `language_model.*`.

## Capacidades

- Producción de probabilidades de decisión sobre opciones: el modelo está diseñado para emitir distribuciones de probabilidad sobre un conjunto de opciones, no para generar texto libre de forma autónoma.
- Destilación de comportamiento: replica las probabilidades del modelo mayor vllm-sr/d3-ultra en el dominio de los prompts de decisión empleados durante el entrenamiento.
- Procesamiento multimodal heredado: mantiene la torre de visión del modelo padre, por lo que puede procesar entradas visuales según las capacidades del chasis d3-mini.
- Integración con el chasis d3-mini: requiere el runtime y la capa de respuesta del chasis fijado para transformar las probabilidades en respuestas finales.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, audio): no disponibles en la información proporcionada.

## Casos de uso

- Clasificación y enrutamiento de decisiones dentro del pool d3-mini soup: el modelo se emplea como cuerpo de decisión que puntúa opciones candidatas, y el chasis d3-mini convierte esas probabilidades en la respuesta final. Es adecuado porque su entrenamiento se orientó precisamente a igualar las probabilidades del modelo mayor en ese dominio.
- Sustitución de un modelo mayor por uno más pequeño en pipelines de decisión: al destilar las probabilidades de vllm-sr/d3-ultra en un modelo de 4,5 mil millones de parámetros, permite reducir requisitos de cómputo manteniendo el comportamiento de decisión en los prompts cubiertos por el entrenamiento.
- Evaluación de técnicas de destilación con LoRA: sirve como caso de estudio reproducible para investigadores que quieran analizar cómo un adaptador de rango 128 fusionado aproxima las distribuciones de un modelo mayor.
- Experimentación con modelos multimodales de decisión: al conservar la torre de visión del padre, puede utilizarse en entornos de investigación que combinen entradas visuales con decisiones discretas, siempre que se disponga del chasis adecuado.
- Integración en el ecosistema Zils: útil para desarrolladores que ya operan con la subred Zils y necesitan un cuerpo de decisión compatible con el pool d3-mini soup.
- Docencia y reproducción de experimentos: su licencia Apache 2.0 y su tamaño moderado facilitan su uso en entornos académicos para estudiar destilación de probabilidades y fusión de adaptadores LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño de parámetros (4.539 millones), en precisión FP16 se requerirían aproximadamente 9 GB solo para pesos, y en cuantización de 8 bits alrededor de 4,5 GB, sin contar caché de atención ni overhead del runtime.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño, un modelo de 4,5 mil millones de parámetros podría caber en GPUs de consumo con suficiente VRAM en cuantizaciones bajas, pero el requisito del chasis d3-mini y su capa de respuesta condiciona el despliegue.
- Opciones de despliegue: no disponibles; el modelo requiere el chasis d3-mini fijado (runtime y capa de respuesta) y no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| anddyworld/zils-mini-distill-ultra-r128 | 4.539.265.536 | No disponible | Apache 2.0 | Modelo de decisión destilado, requiere chasis d3-mini |
| zils-ai/d3-mini-4.5b-v1 (modelo base) | ~4,5 mil millones | No disponible | Apache 2.0 | Modelo padre, espejo de vllm-sr/d3-mini |
| vllm-sr/d3-ultra (modelo profesor) | No disponible | No disponible | Apache 2.0 | Modelo mayor del que se destilan las probabilidades |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo no incorpora capa de respuesta propia: sin el chasis d3-mini fijado no puede producir respuestas finales, solo probabilidades de opción.
- No se documentan sesgos conocidos, pero al entrenarse sobre prompts de decisión derivados de datasets abiertos, puede heredar los sesgos presentes en esos datos.
- Riesgo de alucinación: no aplica en el sentido habitual de generación de texto, pero existe riesgo de calibración deficiente en las probabilidades fuera de la distribución de prompts de entrenamiento.
- Limitaciones de contexto e idioma: no disponibles; la model card no especifica longitud de contexto ni idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la dependencia del chasis d3-mini y de sus condiciones de uso debe verificarse por separado.
- Madurez: el repositorio registra 0 descargas y 0 interacciones, sin pipeline declarado, lo que sugiere un artefacto experimental sin validación comunitaria.
- Caveat para producción: la fusión del LoRA elimina la separación del adaptador, lo que dificulta auditar qué parte del comportamiento proviene de la destilación y cuál del modelo base.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/anddyworld/zils-mini-distill-ultra-r128)
- [Modelo base zils-ai/d3-mini-4.5b-v1](https://huggingface.co/zils-ai/d3-mini-4.5b-v1)
- Modelo profesor vllm-sr/d3-ultra: no se dispone de enlace verificado en la información proporcionada.
- Paper, blog, repositorio o demo adicionales: no disponibles.
